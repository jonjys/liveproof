import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lp: {
          bg: "#050b0e",
          bg2: "#0a151a",
          card: "#0e1c22",
          cyan: "#22d3ee",
          cyan2: "#06b6d4",
          text: "#e8f7fb",
          muted: "#8aa4ad",
          danger: "#fb7185",
          ok: "#34d399",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 8px 24px rgba(34, 211, 238, 0.25)",
        card: "0 20px 60px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
