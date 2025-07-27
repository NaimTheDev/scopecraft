import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      colors: {
        primary: {
          light: "#7dd3fc",
          DEFAULT: "#0ea5e9",
          dark: "#0369a1",
        },
        accent: {
          light: "#fef9c3",
          DEFAULT: "#fde68a",
          dark: "#f59e42",
        },
        surface: {
          light: "#f8fafc",
          DEFAULT: "#f1f5f9",
          dark: "#1e293b",
        },
        glass: "rgba(255,255,255,0.6)",
      },
      boxShadow: {
        soft: "0 4px 24px 0 rgba(30,41,59,0.08)",
        glass: "0 8px 32px 0 rgba(31, 41, 55, 0.18)",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
} satisfies Config;
