import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* Matte ash canvas (#CBD5E1) + extruded surfaces. */
        ash: {
          50: "#EEF2F7",
          100: "#E4EAF1",
          200: "#D5DCE5" /* surface */,
          300: "#CBD5E1" /* page base */,
          400: "#B8C4D4",
          500: "#C5C5CA" /* shadow-dark */,
          600: "#9AA7B8",
        },
        /* Royal-blue accent family, taken from the logo's radium blue. */
        ceyteq: {
          50: "#EEF3FF",
          100: "#DCE6FF",
          200: "#B8CBFF",
          300: "#8FAEFF",
          400: "#5C8BFF",
          500: "#2F6BFF" /* royal blue */,
          600: "#1E3FA8" /* dark blue */,
          700: "#1A3589",
          800: "#152A66",
          /** Radium / glow blue — active states, glowing indicators. */
          neon: "#3DA5FF",
          radium: "#3DA5FF",
        },
        radium: {
          200: "#B7E2FF",
          300: "#8FD1FF",
          400: "#6CC4FF" /* light accent */,
          500: "#3DA5FF" /* radium */,
          600: "#2C8EE6",
        },
        /* Deep navy for dark panels, headings and primary text. */
        navy: {
          50: "#EEF0F6",
          100: "#DCE0EB",
          200: "#7A879C" /* decorative labels */,
          300: "#4C5A73" /* small labels · 4.9:1 on the canvas */,
          400: "#39465F" /* body text · 6.3:1 */,
          500: "#24314F",
          600: "#1E2A52" /* headline alt */,
          700: "#0F1B3D" /* navy */,
          800: "#14121F" /* navy deep */,
          900: "#0B0A14",
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
      transitionDuration: {
        250: "250ms",
      },
      boxShadow: {
        /* Raised: white highlight top-left, ash drop bottom-right (spec depth). */
        neu: "12px 12px 28px #C5C5CA, -12px -12px 28px #FFFFFF",
        "neu-sm": "6px 6px 14px #C5C5CA, -6px -6px 14px #FFFFFF",
        "neu-md": "12px 12px 28px #C5C5CA, -12px -12px 28px #FFFFFF",
        "neu-lg": "16px 16px 38px #C5C5CA, -16px -16px 36px #FFFFFF",
        "neu-hover": "14px 16px 32px #C5C5CA, -14px -14px 32px #FFFFFF",
        /* Pressed / inset. */
        "neu-inset": "inset 6px 6px 12px #C5C5CA, inset -6px -6px 12px #FFFFFF",
        "neu-inset-sm": "inset 4px 4px 9px #C5C5CA, inset -4px -4px 9px #FFFFFF",
        "neu-well": "inset 8px 8px 18px #C5C5CA, inset -8px -8px 18px #FFFFFF",
        "neu-pressed": "inset 6px 6px 12px #C5C5CA, inset -6px -6px 12px #FFFFFF",
        /* Dark navy panel with a radium outline + inner glow. */
        "navy-neu":
          "12px 12px 28px rgba(197,197,202,0.6), -12px -12px 28px #FFFFFF, 0 0 0 1px rgba(61,165,255,0.35), inset 0 0 28px rgba(61,165,255,0.12)",
        /* Blue accent glows. */
        glow: "0 8px 24px rgba(47,107,255,0.35)",
        "glow-lg": "0 12px 32px rgba(47,107,255,0.45)",
        neon: "0 0 18px rgba(61,165,255,0.35), 0 0 0 1px rgba(61,165,255,0.35)",
        "neon-sm": "0 0 10px rgba(61,165,255,0.35)",
        "neon-inset": "inset 0 0 20px rgba(61,165,255,0.25)",
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
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(61,165,255,0.5)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 14px 2px rgba(61,165,255,0.5)" },
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
