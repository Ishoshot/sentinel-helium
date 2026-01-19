// https://nuxt.com/docs/api/configuration/nuxt-config

// Declare process for environment variable access
declare const process: { env: Record<string, string | undefined> };

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // App configuration - favicons and meta
  app: {
    head: {
      title: "Sentinel",
      meta: [{ name: "theme-color", content: "#3b82f6" }],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },

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

  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "http://sentinel.test/api",
      reverbAppKey:
        process.env.NUXT_PUBLIC_REVERB_APP_KEY || "sentinel-local-key",
      reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || "localhost",
      reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT || "8080",
      reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || "http",
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
