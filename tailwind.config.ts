import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: "#0d131f",
        "surface-card": "#111827",
        "surface-elevated": "#1a2234",
        border: "#1f293d",
        "border-glow": "#2b3b55",
        dcr: {
          cyan: "#00f0ff",
          cyanDim: "rgba(0, 240, 255, 0.15)",
          emerald: "#10b981",
          emeraldDim: "rgba(16, 185, 129, 0.15)",
          amber: "#f59e0b",
          amberDim: "rgba(245, 158, 11, 0.15)",
          rose: "#f43f5e",
          roseDim: "rgba(244, 63, 94, 0.15)",
          violet: "#a855f7",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          "Geist",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "cyan-glow": "0 0 25px -5px rgba(0, 240, 255, 0.35)",
        "emerald-glow": "0 0 25px -5px rgba(16, 185, 129, 0.35)",
        "rose-glow": "0 0 25px -5px rgba(244, 63, 94, 0.4)",
        "amber-glow": "0 0 25px -5px rgba(245, 158, 11, 0.35)",
        "card-glow": "0 4px 20px -2px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scanline: "scanline 4s linear infinite",
        "radar-sweep": "radar 3s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
