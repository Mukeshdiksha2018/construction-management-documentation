export default defineAppConfig({
  seo: {
    title: 'Nimble Construction Accounting Documentation',
    description:
      'User guide for Nimble Construction Accounting: projects, estimates, purchase orders, receipts, vendor invoices, and reports.',
  },
  header: {
    title: 'Nimble Construction',
    logo: {
      light: '/images/nimble-property-logo.jpg',
      dark: '/images/nimble-property-logo.jpg',
      alt: 'Nimble Property',
      class: 'h-12 w-auto max-h-12 object-contain',
    },
  },
  github: false,
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'slate',
    },
  },
})
