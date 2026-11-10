// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  // Génération statique universelle (SSG)
  ssr: true,
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/create', '/projects'],
      ignore: [/^\/create\?.*$/]
    }
  },

  // Configuration TypeScript stricte
  typescript: {
    strict: true,
    typeCheck: false
  },

  // Feuilles de style globales
  css: [
    '~/assets/css/main.css',
    '~/assets/css/print.css'
  ],

  // Métadonnées d'en-tête de base
  app: {
    head: {
      title: 'QR Studio — Générateur de QR Code Gratuit & 100% Local',
      htmlAttrs: {
        lang: 'fr'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Créez et personnalisez vos QR codes gratuitement en haute résolution (SVG, PNG) sans inscription. Zéro donnée transmise à un serveur.'
        },
        { name: 'theme-color', content: '#d9f24a' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  }
})
