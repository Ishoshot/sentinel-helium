// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // App configuration - favicons and meta
  app: {
    head: {
      title: "Sentinel",
      htmlAttrs: { lang: "en" },
      meta: [
        { name: "theme-color", content: "#3b82f6" },
        {
          name: "description",
          content:
            "AI-powered code reviews with instant PR analysis, custom guidelines, and BYOK AI providers.",
        },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Sentinel" },
        {
          property: "og:image",
          content: "https://usesentinel.ai/og-image.png",
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: "Sentinel - AI-Powered Code Reviews",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@SentinelAIHQ" },
        {
          name: "twitter:image",
          content: "https://usesentinel.ai/og-image.png",
        },
      ],
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
      ],
    },
  },

  // Hybrid rendering: SSR for public pages, SPA for authenticated dashboard
  routeRules: {
    // Public pages - SSR for SEO and social sharing
    "/": { ssr: true },
    "/login": { ssr: true },
    "/pricing": { ssr: true },
    "/privacy": { ssr: true },
    "/terms": { ssr: true },

    // Dashboard routes - SPA mode (no hydration issues, no SSR needed)
    "/:workspace/**": { ssr: false },

    // Auth flows - SPA (client-only, no SEO value)
    "/auth/**": { ssr: false },
    "/invitations/**": { ssr: false },
    "/billing/**": { ssr: false },
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
    "@nuxtjs/sitemap",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@primevue/nuxt-module",
    "@vueuse/nuxt",
  ],

  site: {
    url: "https://usesentinel.ai",
  },

  sitemap: {
    urls: [
      { loc: "/", priority: 1.0, changefreq: "weekly" },
      { loc: "/pricing", priority: 0.8, changefreq: "monthly" },
      { loc: "/login", priority: 0.5, changefreq: "yearly" },
      { loc: "/privacy", priority: 0.3, changefreq: "yearly" },
      { loc: "/terms", priority: 0.3, changefreq: "yearly" },
    ],
    exclude: [
      "/:workspace/**",
      "/auth/**",
      "/invitations/**",
      "/billing/**",
      "/briefings/**",
    ],
  },

  runtimeConfig: {
    public: {
      // Nuxt automatically maps NUXT_PUBLIC_* env vars to these values
      apiBaseUrl: "http://sentinel-api.test/api",
      reverbAppKey: "sentinel-local-key",
      reverbHost: "localhost",
      reverbPort: "8080",
      reverbScheme: "http",
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
