import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ["var(--font-tajawal)", "sans-serif"],
        cairo: ["var(--font-cairo)", "sans-serif"],
        ibm: ["var(--font-ibm)", "sans-serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#6d5efc",
          foreground: "#ffffff",
          soft: "#eef0ff",
          border: "#d9d6fe",
        },
        surface: {
          DEFAULT: "#ffffff",
          tinted: "#faf9fc",
        },
        ink: {
          DEFAULT: "#1c1917",
          muted: "#6b6670",
          subtle: "#9b96a3",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px 0 rgba(0,0,0,0.03)",
        card: "0 2px 8px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.03)",
        lift: "0 8px 24px 0 rgba(0,0,0,0.08), 0 2px 8px 0 rgba(0,0,0,0.04)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
