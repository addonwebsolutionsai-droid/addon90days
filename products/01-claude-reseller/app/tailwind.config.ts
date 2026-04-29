import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // CSS variable-driven semantic tokens
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
        // Accent — violet stays the same in both themes
        violet: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        pink: {
          500: "#ec4899",
          600: "#db2777",
        },
        green: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        blue: {
          400: "#60a5fa",
          500: "#3b82f6",
          900: "#1e3a5f",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          900: "#0c2d3a",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          900: "#3d2400",
        },
        red: {
          400: "#f87171",
          500: "#ef4444",
        },
        orange: {
          400: "#fb923c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      backgroundImage: {
        "violet-glow":
          "radial-gradient(ellipse at top left, rgba(139,92,246,0.12) 0%, transparent 60%)",
        "pink-glow":
          "radial-gradient(ellipse at bottom right, rgba(236,72,153,0.08) 0%, transparent 60%)",
      },
      boxShadow: {
        "violet-sm": "0 0 0 1px rgba(139,92,246,0.25)",
        "violet-md":
          "0 0 16px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.2)",
      },
      borderRadius: {
        "4":  "4px",
        "8":  "8px",
        "12": "12px",
        "16": "16px",
        "20": "20px",
      },
      keyframes: {
        "aurora-1": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%":      { transform: "translate(8%, -12%) scale(1.15)" },
        },
        "aurora-2": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%":      { transform: "translate(-10%, 8%) scale(1.1)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "aurora-1": "aurora-1 12s ease-in-out infinite",
        "aurora-2": "aurora-2 16s ease-in-out infinite",
        "fade-up":  "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
