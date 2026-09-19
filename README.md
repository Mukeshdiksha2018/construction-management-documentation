# Nimble Construction Accounting Documentation

Publishable [Docus](https://docus.dev) site for the Nimble Construction Accounting user guide.

## Local preview

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Publish

This is a standard Nuxt 4 / Docus project. You can deploy it in either of these ways:

1. **Vercel / Netlify / Nuxt Hub** — push this folder to GitHub and import the repository. Use the default `npm run build` command.
2. **Static hosting** — run `npm run generate` and upload the `.output/public` folder.

Set `NUXT_SITE_URL` to the public site URL before building so sitemap and social links are correct.

```bash
NUXT_SITE_URL=https://your-docs-domain.com npm run build
```

## Update content

Handbook screenshots live in `public/images/`. Chapter pages live in `content/`. After changing the source user guide, you can re-import it with:

```bash
python3 scripts/import-user-guide.py
```
