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
        brand: {
          DEFAULT: "#3B82F6", // blue-500
          dark: "#1E40AF", // blue-900
          light: "#DBEAFE", // blue-100
        },
        surface: {
          DEFAULT: "#FFFFFF",
          text: "#1E293B", // slate-800
        },
        accent: {
          DEFAULT: "#F59E42", // orange-400
        },
      },
      boxShadow: {
        xl: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "3xl": "0 12px 48px 0 rgba(31, 38, 135, 0.18)",
        glow: "0 0 16px 2px rgba(59, 130, 246, 0.25)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
} satisfies Config;
