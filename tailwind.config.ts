import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{vue,ts}",
    "./components/**/*.{vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.ts",
    "./nuxt.config.ts",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds & Surfaces
        "bg-app": "#F9FAFB",
        "bg-surface": "#F3F4F6",
        "bg-elevated": "#FFFFFF",

        // Borders & Dividers
        "border-subtle": "#E5E7EB",
        "border-muted": "#D1D5DB",

        // Typography
        "text-primary": "#111827",
        "text-secondary": "#374151",
        "text-muted": "#6B7280",

        // Accent (Sentinel Blue)
        accent: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#DBEAFE",
        },

        // Semantic Colors
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
        error: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
      },
      fontFamily: {
        sans: [
          "Instrument Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        elevated:
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        modal:
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
