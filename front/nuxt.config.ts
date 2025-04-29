// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001/api'
    }
  },
  modules: [
    '@primevue/nuxt-module'
  ],
  primevue: {
    autoImport: true,
      options: {
          theme: {
              preset: Aura
          }
      }
  },
  css: [
    'primeicons/primeicons.css',
    '@/assets/global.scss',
    '@/assets/css/fonts.css'
  ],
})
