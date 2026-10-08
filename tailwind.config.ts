import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
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
        background: "#09090B",
        surface: {
          base: "#0E121E",
          subtle: "#121215",
          default: "#131827",
          elevated: "#1A2238",
          border: "#202B46",
          borderHover: "#32436D",
        },
        brand: {
          emerald: "#10B981",
          cyan: "#06B6D4",
          violet: "#8B5CF6",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      boxShadow: {
        raycast: "0 0 0 1px rgb(27,28,30), inset 0 0 0 1px #07080a",
        elevated: "0 8px 32px rgba(0,0,0,0.35)",
        glow: "0 0 20px -5px rgba(16, 185, 129, 0.25)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          "Menlo",
          "Monaco",
          "Consolas",
          '"Courier New"',
          "monospace",
        ],
      },
      animation: {
        "gradient-flow": "gradientFlow 8s ease infinite",
        "border-beam": "borderBeam 8s linear infinite",
        "shine": "shine 4s ease-in-out infinite",
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
        gradientFlow: {
          "0%, 100%": { "background-position": "0% 50%", "background-size": "200% 200%" },
          "50%": { "background-position": "100% 50%", "background-size": "200% 200%" },
        },
        borderBeam: {
          "100%": {
            "offset-distance": "100%",
          },
        },
        shine: {
          "0%": { "background-position": "200% 0" },
          "100%": { "background-position": "-200% 0" },
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
