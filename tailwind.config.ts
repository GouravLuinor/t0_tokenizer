import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "150": "150ms",
        "180": "180ms",
        "300": "300ms",
      },
      colors: {
        "paper": "rgb(var(--paper) / <alpha-value>)",
        "sheet": "rgb(var(--sheet) / <alpha-value>)",
        "panel": "rgb(var(--panel) / <alpha-value>)",
        "ink": "rgb(var(--ink) / <alpha-value>)",
        "ink-2": "rgb(var(--ink-2) / <alpha-value>)",
        "ink-3": "rgb(var(--ink-3) / <alpha-value>)",
        "rule": "rgb(var(--rule) / <alpha-value>)",
        "rule-2": "rgb(var(--rule-2) / <alpha-value>)",
        "board": "rgb(var(--board) / <alpha-value>)",
        "board-2": "rgb(var(--board-2) / <alpha-value>)",
        "board-rule": "rgb(var(--board-rule) / <alpha-value>)",
        "board-ink": "rgb(var(--board-ink) / <alpha-value>)",
        "board-ink-2": "rgb(var(--board-ink-2) / <alpha-value>)",
        "gold": "rgb(var(--gold) / <alpha-value>)",
        "gold-ink": "rgb(var(--gold-ink) / <alpha-value>)",
        "gold-wash": "rgb(var(--gold-wash) / <alpha-value>)",
        "ok": "rgb(var(--ok) / <alpha-value>)",
        "warn": "rgb(var(--warn) / <alpha-value>)",
        "danger": "rgb(var(--danger) / <alpha-value>)",
        "danger-wash": "rgb(var(--danger-wash) / <alpha-value>)",
        "focus": "rgb(var(--focus) / <alpha-value>)",
        background: "rgb(var(--paper) / <alpha-value>)",
        zinc: {
          50: "rgb(var(--z-50) / <alpha-value>)",
          100: "rgb(var(--z-100) / <alpha-value>)",
          200: "rgb(var(--z-200) / <alpha-value>)",
          300: "rgb(var(--z-300) / <alpha-value>)",
          400: "rgb(var(--z-400) / <alpha-value>)",
          500: "rgb(var(--z-500) / <alpha-value>)",
          600: "rgb(var(--z-600) / <alpha-value>)",
          700: "rgb(var(--z-700) / <alpha-value>)",
          800: "rgb(var(--z-800) / <alpha-value>)",
          900: "rgb(var(--z-900) / <alpha-value>)",
          950: "rgb(var(--z-950) / <alpha-value>)",
        },
        surface: {
          base: "rgb(var(--paper) / <alpha-value>)",
          subtle: "rgb(var(--paper) / <alpha-value>)",
          default: "rgb(var(--sheet) / <alpha-value>)",
          elevated: "rgb(var(--panel) / <alpha-value>)",
          border: "rgb(var(--rule) / <alpha-value>)",
          borderHover: "rgb(var(--rule-2) / <alpha-value>)",
        },
      },
      boxShadow: {
        elevated: "0 12px 32px -8px rgb(var(--ink) / 0.18), 0 2px 6px rgb(var(--ink) / 0.06)",
        board: "0 1px 0 rgb(255 255 255 / 0.06) inset, 0 10px 30px -12px rgb(var(--board) / 0.55)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ["var(--font-barlow)", "var(--font-geist)", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulseSubtle 2.5s ease-in-out infinite",
        "accordion-down": "accordionDown 220ms ease-out-expo",
        "accordion-up": "accordionUp 200ms ease-out-expo",
      },
      keyframes: {
        accordionDown: {
          from: { height: "0", opacity: "0" },
          to: {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
        },
        accordionUp: {
          from: {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          to: { height: "0", opacity: "0" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
