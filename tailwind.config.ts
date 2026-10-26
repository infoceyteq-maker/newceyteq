import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* Deep matte ash canvas (#CBD5E1) — the surface every element pops out of. */
        ash: {
          50: "#F4F7FB",
          100: "#E8EEF5",
          200: "#CBD5E1",
          300: "#BCC8D7",
          400: "#A9B7C8",
          500: "#94A4B7",
          600: "#7E90A5",
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
        radium: {
          300: "#7EE9FF",
          400: "#33DCFF",
          500: "#00D2FF",
          600: "#00B4DB",
        },
        navy: {
          50: "#E7ECF2",
          100: "#C6D2E0",
          200: "#7189A6",
          300: "#44607F",
          400: "#274565",
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
        /* Exact reference recipe: white highlight top-left, black drop bottom-right. */
        neu: "-6px -6px 16px rgba(255,255,255,0.9), 6px 6px 16px rgba(0,0,0,0.2)",
        "neu-sm": "-4px -4px 10px rgba(255,255,255,0.9), 4px 4px 10px rgba(0,0,0,0.18)",
        "neu-md": "-6px -6px 16px rgba(255,255,255,0.9), 6px 6px 16px rgba(0,0,0,0.2)",
        "neu-lg": "-10px -10px 24px rgba(255,255,255,0.92), 10px 10px 24px rgba(0,0,0,0.22)",
        "neu-inset": "inset 6px 6px 16px rgba(0,0,0,0.2), inset -6px -6px 16px rgba(255,255,255,0.9)",
        "neu-inset-sm":
          "inset 4px 4px 10px rgba(0,0,0,0.16), inset -4px -4px 10px rgba(255,255,255,0.9)",
        "neu-pressed":
          "inset 6px 6px 16px rgba(0,0,0,0.22), inset -6px -6px 16px rgba(255,255,255,0.88)",
        "navy-neu":
          "-6px -6px 16px rgba(255,255,255,0.5), 6px 6px 16px rgba(0,0,0,0.3), 0 0 15px rgba(0,210,255,0.25), inset 0 1px 0 rgba(255,255,255,0.16)",
        glow: "0 0 15px rgba(0,210,255,0.25), 0 8px 24px rgba(0,114,206,0.25)",
        "glow-lg": "0 0 26px rgba(0,210,255,0.35), 0 16px 44px rgba(0,114,206,0.3)",
        neon: "0 0 15px rgba(0,210,255,0.25), 0 0 0 1px rgba(0,210,255,0.4)",
        "neon-sm": "0 0 10px rgba(0,210,255,0.3), 0 0 0 1px rgba(0,210,255,0.35)",
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
