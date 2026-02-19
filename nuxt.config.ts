import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'netlify-edge',
    alias: {
      '@react-email/render': 'unenv/mock/proxy',
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/login': { prerender: true },
    '/register': { prerender: true },
    '/forgot-password': { prerender: true },
    '/reset-password': { prerender: true },
    '/home': { ssr: false },
  },
  css: ['@/assets/css/main.css'],
  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/test-utils/module',
    'shadcn-nuxt',
    '@vueuse/nuxt',
  ],
  vite: {
    plugins: [(tailwindcss as any)()],
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui',
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    resendApiKey: process.env.RESEND_API_KEY,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    presign: {
      fileMaxSizeBytes: Number(process.env.FILE_IMAGE_MAX_SIZE_BYTES ?? 5 * 1024 * 1024),
      filePresignExpiresInSeconds: Number(process.env.FILE_IMAGE_PRESIGN_EXPIRES_IN_SECONDS ?? 120),
      allowedMimeTypes:
        process.env.ALLOWED_MIME_TYPES ?? 'image/jpeg,image/png,image/webp,image/avif,image/gif',
    },
    r2: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      endpoint: process.env.R2_ENDPOINT,
      bucketName: process.env.R2_BUCKET_NAME,
      publicUrl: process.env.R2_PUBLIC_URL,
    },
  },
})
