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
        // Obsidian Intelligence - Dark Theme
        // Backgrounds & Surfaces
        "bg-app": "#09090b",
        "bg-surface": "#0f0f11",
        "bg-elevated": "#18181b",
        "bg-hover": "#1f1f23",
        "bg-active": "#27272a",

        // Borders & Dividers
        "border-subtle": "#27272a",
        "border-muted": "#3f3f46",
        "border-accent": "rgba(20, 184, 166, 0.3)",

        // Typography
        "text-primary": "#fafafa",
        "text-secondary": "#a1a1aa",
        "text-muted": "#71717a",
        "text-faint": "#52525b",

        // Accent - Teal (Intelligence)
        accent: {
          DEFAULT: "#14b8a6",
          hover: "#0d9488",
          light: "#0f766e",
          glow: "rgba(20, 184, 166, 0.15)",
          bright: "#2dd4bf",
        },

        // Semantic Colors - Refined for dark theme
        success: {
          DEFAULT: "#22c55e",
          light: "rgba(34, 197, 94, 0.15)",
          glow: "rgba(34, 197, 94, 0.2)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "rgba(245, 158, 11, 0.15)",
          glow: "rgba(245, 158, 11, 0.2)",
        },
        error: {
          DEFAULT: "#ef4444",
          light: "rgba(239, 68, 68, 0.15)",
          glow: "rgba(239, 68, 68, 0.2)",
        },
        info: {
          DEFAULT: "#3b82f6",
          light: "rgba(59, 130, 246, 0.15)",
          glow: "rgba(59, 130, 246, 0.2)",
        },

        // Chart Colors - Cohesive neon palette
        chart: {
          teal: "#14b8a6",
          blue: "#3b82f6",
          violet: "#8b5cf6",
          pink: "#ec4899",
          orange: "#f97316",
          yellow: "#eab308",
          emerald: "#10b981",
          rose: "#f43f5e",
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
        display: [
          "Instrument Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
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
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "display": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
        elevated: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
        modal: "0 25px 50px -12px rgb(0 0 0 / 0.6)",
        glow: "0 0 20px -5px rgba(20, 184, 166, 0.4)",
        "glow-lg": "0 0 40px -10px rgba(20, 184, 166, 0.5)",
        "glow-success": "0 0 20px -5px rgba(34, 197, 94, 0.4)",
        "glow-error": "0 0 20px -5px rgba(239, 68, 68, 0.4)",
        "glow-warning": "0 0 20px -5px rgba(245, 158, 11, 0.4)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in-down": "fadeInDown 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "slide-in-left": "slideInLeft 0.4s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px -5px rgba(20, 184, 166, 0.3)" },
          "50%": { boxShadow: "0 0 30px -5px rgba(20, 184, 166, 0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
