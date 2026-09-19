export default defineEventHandler(async (event) => {
  try {
    const pdf = await generateDocumentationPdf()
    const bytes = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf)
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(
      event,
      'Content-Disposition',
      'attachment; filename="nimble-construction-accounting-documentation.pdf"',
    )
    setHeader(event, 'Cache-Control', 'no-store')
    setHeader(event, 'Content-Length', String(bytes.length))
    return bytes
  }
  catch (error) {
    console.error('[documentation.pdf]', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not generate the documentation PDF from the current content.',
    })
  }
})
