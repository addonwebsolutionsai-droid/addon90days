import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // CSS variable-driven semantic tokens (same system as P01)
        bg: {
          base:    "var(--bg-base)",
          surface: "var(--bg-surface)",
          s2:      "var(--bg-s2)",
          s3:      "var(--bg-s3)",
        },
        border: {
          subtle:  "var(--border-subtle)",
          DEFAULT: "var(--border)",
          strong:  "var(--border-strong)",
        },
        text: {
          primary:   "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted:     "var(--text-muted)",
        },
        // ChatBase accent — WhatsApp green
        green: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          900: "#0c2d3a",
        },
        violet: {
          500: "#8b5cf6",
        },
        red: {
          400: "#f87171",
          500: "#ef4444",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        "4":  "4px",
        "8":  "8px",
        "12": "12px",
        "16": "16px",
        "20": "20px",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%":      { transform: "translateX(-4px)" },
          "40%":      { transform: "translateX(4px)" },
          "60%":      { transform: "translateX(-3px)" },
          "80%":      { transform: "translateX(3px)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 300ms ease both",
        shake:        "shake 0.5s ease",
      },
    },
  },
  plugins: [],
};

export default config;
