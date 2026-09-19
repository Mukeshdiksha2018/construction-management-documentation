export default defineNuxtConfig({
  extends: ['docus'],
  site: {
    name: 'Nimble Construction Accounting Documentation',
  },
  nitro: {
    serverAssets: [
      {
        baseName: 'documentation',
        dir: './server/assets',
      },
    ],
    prerender: {
      ignore: ['/api/documentation.pdf'],
    },
  },
})
