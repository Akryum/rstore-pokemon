import process from 'node:process'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

const dbFile = process.env.DB_FILE ?? '.db.sqlite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@tresjs/nuxt',
    '@rstore/nuxt-drizzle',
    '@vite-pwa/nuxt',
  ],

  runtimeConfig: {
    dbUrl: `file:${resolve(dbFile)}`,
  },

  css: [
    '~/assets/css/main.css',
  ],

  eslint: {
    config: {
      standalone: false,
    },
  },

  rstoreDrizzle: {
    ws: true,
    offline: true,
  },

  icon: {
    clientBundle: {
      scan: true,
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      maximumFileSizeToCacheInBytes: 5000000,
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        'three',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@rstore/offline',
        '@tresjs/cientos',
        '@tresjs/core',
      ],
    },
  },
})
