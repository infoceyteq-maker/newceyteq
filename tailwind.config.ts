import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ash: {
          50: "#F7FAFD",
          100: "#EFF4F9",
          200: "#E2E8F0",
          300: "#D8E0EA",
          400: "#CBD5E1",
          500: "#B6C2D2",
          600: "#9BA9BC",
        },
        ceyteq: {
          50: "#E8F4FF",
          100: "#CDE7FF",
          200: "#9AD0FF",
          300: "#5FB4FF",
          400: "#2A95F5",
          500: "#0072CE",
          600: "#005DA9",
          700: "#004A87",
          800: "#06386A",
          /** Radium / neon blue — active states, glowing indicators, primary actions. */
          neon: "#00D2FF",
          radium: "#00D2FF",
        },
        navy: {
          50: "#E7ECF2",
          100: "#C6D2E0",
          200: "#7F96B3",
          300: "#4E6785",
          400: "#2F4E70",
          500: "#123A5C",
          600: "#0B3154",
          700: "#082B49",
          800: "#061F35",
          900: "#041524",
        },
      },
      fontFamily: {
        display: ["Sora Variable", "Sora", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Manrope Variable", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        neu: "28px",
        "neu-lg": "36px",
        pill: "999px",
      },
      boxShadow: {
        /* Light from the top-left: crisp white highlight + soft navy-tinted drop. */
        neu: "-8px -8px 18px rgba(255,255,255,0.85), 10px 10px 22px rgba(23,43,77,0.13), inset 0 1px 0 rgba(255,255,255,0.95)",
        "neu-sm": "-4px -4px 10px rgba(255,255,255,0.8), 4px 4px 10px rgba(0,0,0,0.1)",
        "neu-md": "-6px -6px 14px rgba(255,255,255,0.85), 7px 7px 16px rgba(23,43,77,0.13)",
        "neu-lg": "-14px -14px 30px rgba(255,255,255,0.95), 20px 20px 42px rgba(23,43,77,0.17)",
        "neu-inset": "inset 5px 5px 10px rgba(23,43,77,0.13), inset -5px -5px 10px rgba(255,255,255,0.95)",
        "neu-inset-sm":
          "inset 3px 3px 7px rgba(23,43,77,0.12), inset -3px -3px 7px rgba(255,255,255,0.95)",
        "neu-pressed":
          "inset 4px 4px 10px rgba(23,43,77,0.18), inset -4px -4px 10px rgba(255,255,255,0.9), 0 1px 0 rgba(255,255,255,0.6)",
        "navy-neu":
          "-10px -10px 24px rgba(255,255,255,0.9), 12px 12px 28px rgba(23,43,77,0.3), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -2px 10px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(0,114,206,0.16), 0 12px 32px rgba(0,114,206,0.3)",
        "glow-lg": "0 0 0 1px rgba(0,114,206,0.22), 0 20px 54px rgba(0,114,206,0.4)",
        neon: "0 0 0 1px rgba(0,210,255,0.4), 0 0 18px rgba(0,210,255,0.45), 0 12px 30px rgba(0,114,206,0.35)",
        "neon-sm": "0 0 0 1px rgba(0,210,255,0.35), 0 0 10px rgba(0,210,255,0.4)",
        "neon-inset": "inset 0 0 12px rgba(0,210,255,0.35), inset 0 0 2px rgba(0,210,255,0.6)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "70%": { transform: "scale(1.35)", opacity: "0" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "neon-pulse": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(0,210,255,0.5)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 14px 2px rgba(0,210,255,0.5)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.6s cubic-bezier(0.24,0,0.38,1) infinite",
        "fade-up": "fade-up 0.5s ease-out both",
        "neon-pulse": "neon-pulse 2.4s ease-in-out infinite",
        "float-soft": "float-soft 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
