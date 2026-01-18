// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Hybrid rendering: SSR for public pages, SPA for authenticated dashboard
  routeRules: {
    // Public pages - SSR for SEO and social sharing
    "/": { ssr: true },
    "/login": { ssr: true },

    // Dashboard routes - SPA mode (no hydration issues, no SSR needed)
    "/:workspace/**": { ssr: false },

    // Auth flows - SPA (client-only, no SEO value)
    "/auth/**": { ssr: false },
    "/invitations/**": { ssr: false },
  },

  // Nitro configuration for Railway deployment
  nitro: {
    preset: "node-server",
  },

  modules: [
    "@nuxt/a11y",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@primevue/nuxt-module",
    "@vueuse/nuxt",
  ],

  // Runtime configuration
  runtimeConfig: {
    public: {
      apiBaseUrl: "http://sentinel.test/api",
    },
  },

  // Tailwind CSS configuration
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
    configPath: "tailwind.config.ts",
  },

  // PrimeVue configuration - unstyled mode for full Tailwind control
  primevue: {
    usePrimeVue: true,
    options: {
      unstyled: true,
    },
  },

  // Pinia configuration
  pinia: {
    storesDirs: ["./app/stores/**"],
  },

  // Font configuration
  fonts: {
    families: [{ name: "Instrument Sans", provider: "google" }],
  },

  // ESLint configuration
  eslint: {
    config: {
      standalone: false,
    },
  },
});
