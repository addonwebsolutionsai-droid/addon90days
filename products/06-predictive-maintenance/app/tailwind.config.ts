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
        // MachineGuard accent — red + orange (industrial alarm)
        red: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        },
        orange: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
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
        "pulse-warn": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
      },
      animation: {
        "fade-up":   "fade-up 0.5s ease-out forwards",
        "pulse-warn": "pulse-warn 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
