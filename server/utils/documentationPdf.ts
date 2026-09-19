import { existsSync } from 'node:fs'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { marked, Renderer, type Tokens } from 'marked'
import { chromium } from 'playwright'

const TITLE = 'Nimble Construction Accounting Documentation'
const FILENAME_RE = /^(\d+)\..+\.md$/
const IMAGE_RE = /\]\((\/images\/[^)]+)\)/g

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function firstExistingPath(candidates: string[]) {
  return candidates.find(path => existsSync(path))
}

function resolvePublicDir() {
  const path = firstExistingPath([
    join(process.cwd(), 'public'),
    join(process.cwd(), '.output', 'public'),
  ])
  if (!path) {
    throw createError({ statusCode: 500, statusMessage: 'Could not find the public/ directory for documentation images.' })
  }
  return path
}

function resolveContentDir() {
  const path = firstExistingPath([
    join(process.cwd(), 'content'),
    join(process.cwd(), '..', 'content'),
  ])
  if (!path) {
    throw createError({ statusCode: 500, statusMessage: 'Could not find the content/ directory for documentation chapters.' })
  }
  return path
}

async function loadUserGuideCss() {
  try {
    const stored = await useStorage('assets:documentation').getItemRaw('user-guide.css')
    if (stored) {
      return Buffer.isBuffer(stored) ? stored.toString('utf8') : String(stored)
    }
  }
  catch {
    // Fall through to the filesystem copy used in local development.
  }

  const cssPath = firstExistingPath([
    join(process.cwd(), 'server', 'assets', 'user-guide.css'),
    join(process.cwd(), '..', 'server', 'assets', 'user-guide.css'),
  ])
  if (!cssPath) {
    throw createError({ statusCode: 500, statusMessage: 'Could not load the documentation print stylesheet.' })
  }
  return readFile(cssPath, 'utf8')
}

function mimeFor(filePath: string) {
  switch (extname(filePath).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.gif':
      return 'image/gif'
    case '.webp':
      return 'image/webp'
    case '.svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

async function publicFileToDataUri(publicPath: string) {
  const relative = publicPath.replace(/^\//, '')
  const filePath = join(resolvePublicDir(), relative)
  if (!existsSync(filePath)) {
    return publicPath
  }
  const bytes = await readFile(filePath)
  return `data:${mimeFor(filePath)};base64,${bytes.toString('base64')}`
}

function parseFrontmatter(raw: string) {
  if (!raw.startsWith('---\n')) {
    return { title: '', body: raw }
  }
  const end = raw.indexOf('\n---\n', 4)
  if (end === -1) {
    return { title: '', body: raw }
  }
  const frontmatter = raw.slice(4, end)
  const body = raw.slice(end + 5)
  const title = frontmatter.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? ''
  return { title, body }
}

async function embedMarkdownImages(markdown: string) {
  const paths = [...new Set([...markdown.matchAll(IMAGE_RE)].map(match => match[1]))]
  const replacements = new Map<string, string>()
  await Promise.all(paths.map(async (path) => {
    replacements.set(path, await publicFileToDataUri(path))
  }))
  return markdown.replace(IMAGE_RE, (_, path: string) => `](${replacements.get(path) ?? path})`)
}

const markdownRenderer = new Renderer()
markdownRenderer.image = ({ href, text }: Tokens.Image) => {
  const src = href || ''
  const alt = text || ''
  const caption = escapeHtml(alt)
  if (/^Screenshot\b/i.test(alt) || /UG-/.test(src) || /nimble-property-logo/i.test(src)) {
    return `<figure class="screenshot"><img src="${src}" alt="${caption}"><figcaption>${caption}</figcaption></figure>`
  }
  return `<img src="${src}" alt="${caption}">`
}

function renderMarkdown(markdown: string) {
  return marked.parse(markdown, {
    async: false,
    gfm: true,
    renderer: markdownRenderer,
  }) as string
}

async function loadChapters() {
  const contentDir = resolveContentDir()
  const files = (await readdir(contentDir))
    .map((name) => {
      const match = name.match(FILENAME_RE)
      return match ? { name, order: Number(match[1]) } : null
    })
    .filter((file): file is { name: string, order: number } => file !== null)
    .sort((a, b) => a.order - b.order)

  return Promise.all(files.map(async (file) => {
    const raw = await readFile(join(contentDir, file.name), 'utf8')
    const parsed = parseFrontmatter(raw)
    const body = await embedMarkdownImages(parsed.body.trim())
    return {
      order: file.order,
      title: parsed.title || file.name,
      html: renderMarkdown(body),
    }
  }))
}

export async function buildDocumentationHtml() {
  const [css, chapters, coverLogo] = await Promise.all([
    loadUserGuideCss(),
    loadChapters(),
    publicFileToDataUri('/images/nimble-property-logo.jpg'),
  ])

  const chapterHtml = chapters.map(chapter => `
    <h1>${escapeHtml(`${chapter.order}. ${chapter.title}`)}</h1>
    ${chapter.html}
  `).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(TITLE)}</title>
  <style>${css}</style>
</head>
<body>
  <main>
    <section class="title-page">
      <img class="cover-logo" src="${coverLogo}" alt="Nimble Property">
      <p class="cover-title">${escapeHtml(TITLE)}</p>
    </section>
    ${chapterHtml}
  </main>
</body>
</html>`
}

export async function generateDocumentationPdf() {
  const html = await buildDocumentationHtml()
  const dir = await mkdtemp(join(tmpdir(), 'nca-docs-pdf-'))
  const htmlPath = join(dir, 'documentation.html')
  await writeFile(htmlPath, html, 'utf8')

  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' })
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((image) => {
        if (image.complete) {
          return null
        }
        return new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true })
          image.addEventListener('error', resolve, { once: true })
        })
      }))
    })
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })
  }
  finally {
    await browser.close()
    await rm(dir, { recursive: true, force: true })
  }
}
