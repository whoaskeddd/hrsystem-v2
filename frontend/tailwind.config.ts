import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        elevated: "var(--color-elevated)",
        soft: "var(--color-soft)",
        border: "var(--color-border)",
        gold: "var(--color-gold)",
        "gold-soft": "var(--color-gold-soft)",
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
      },
      borderRadius: {
        shell: "24px",
      },
      fontFamily: {
        display: ["Geist", "Segoe UI", "sans-serif"],
        body: ["DM Sans", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
