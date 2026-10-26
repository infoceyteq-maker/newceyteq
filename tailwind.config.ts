import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ash: {
          50: "#F7F9FC",
          100: "#F1F4F8",
          200: "#E9EDF3",
          300: "#E1E6EE",
          400: "#D3DAE5",
          500: "#C3CBD8",
          600: "#AEB7C6",
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
        neu: "14px 14px 30px rgba(163,177,198,0.42), -12px -12px 26px rgba(255,255,255,0.92)",
        "neu-sm": "8px 8px 18px rgba(163,177,198,0.38), -7px -7px 16px rgba(255,255,255,0.9)",
        "neu-lg": "26px 26px 60px rgba(148,163,186,0.42), -20px -20px 50px rgba(255,255,255,0.95)",
        "neu-inset":
          "inset 5px 5px 12px rgba(163,177,198,0.55), inset -5px -5px 12px rgba(255,255,255,0.95)",
        "neu-inset-sm":
          "inset 3px 3px 7px rgba(163,177,198,0.5), inset -3px -3px 7px rgba(255,255,255,0.92)",
        "neu-pressed":
          "inset 2px 2px 6px rgba(163,177,198,0.6), inset -2px -2px 6px rgba(255,255,255,0.85), 0 1px 0 rgba(255,255,255,0.6)",
        "navy-neu":
          "12px 12px 26px rgba(140,153,175,0.45), -10px -10px 24px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -2px 10px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(0,114,206,0.14), 0 10px 30px rgba(0,114,206,0.28)",
        "glow-lg": "0 0 0 1px rgba(0,114,206,0.2), 0 18px 50px rgba(0,114,206,0.38)",
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
      },
      animation: {
        "pulse-ring": "pulse-ring 2.6s cubic-bezier(0.24,0,0.38,1) infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
