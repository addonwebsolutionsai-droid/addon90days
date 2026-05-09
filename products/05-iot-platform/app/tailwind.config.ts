import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
        // ConnectOne accent — cyan + blue
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          900: "#0c2d3a",
        },
        blue: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      borderRadius: { "4": "4px", "8": "8px", "12": "12px", "16": "16px", "20": "20px" },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
