# Nimble Construction Accounting Documentation

Publishable [Docus](https://docus.dev) site for the Nimble Construction Accounting user guide.

## Local preview

```bash
npm install
npx playwright install chromium
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The top-bar **Download PDF** button generates a PDF from the current files in `content/` (and screenshots in `public/images/`), using the original user-guide print layout. It requires the Node server (`npm run dev` or `npm run build` then `npm run preview`). Static `npm run generate` hosting does not include that API route.

## Publish

This is a standard Nuxt 4 / Docus project. You can deploy it in either of these ways:

1. **Vercel / Netlify / Nuxt Hub** — push this folder to GitHub and import the repository. Use the default `npm run build` command. Install Playwright Chromium in the host environment so PDF download works.
2. **Static hosting** — run `npm run generate` and upload the `.output/public` folder. PDF download is not available on static hosts.

Set `NUXT_SITE_URL` to the public site URL before building so sitemap and social links are correct.

```bash
NUXT_SITE_URL=https://your-docs-domain.com npm run build
```

## Update content

Handbook screenshots live in `public/images/`. Chapter pages live in `content/`. After changing the source user guide, you can re-import it with:

```bash
python3 scripts/import-user-guide.py
```

Keep the module list in this order (sidebar, homepage, and generated PDF):

1. Foundation and master data
2. Projects
3. Cost codes
4. Item Types and Items List
5. Estimates
6. Purchase Orders
7. Change Orders
8. Stock Receipt Notes (GRN)
9. Vendor Invoices
10. Reports
11. End-to-end workflows
12. Troubleshooting and FAQ
13. Glossary and status reference
