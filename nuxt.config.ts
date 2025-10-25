import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@rstore/nuxt-drizzle',
    '@vite-pwa/nuxt',
  ],

  runtimeConfig: {
    dbUrl: `file:${resolve('.db.sqlite')}`,
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
  },
})
