// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'netlify-edge',
  },
  modules: ['@nuxt/eslint', '@nuxt/hints', '@nuxt/image', '@nuxt/test-utils/module'],
})
