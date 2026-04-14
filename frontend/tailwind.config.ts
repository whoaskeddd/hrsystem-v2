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
        card: "0 16px 32px rgba(0, 0, 0, 0.28)",
        glow: "0 0 0 1px rgba(218, 186, 121, 0.2), 0 14px 30px rgba(218, 186, 121, 0.08)",
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
