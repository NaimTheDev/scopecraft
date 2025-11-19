import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter", // Consistent with modern, clean UI typography
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
        // --- Core UI Colors (Consistent across all mockups) ---

        // Primary Brand Blue: For main calls to action, active states, important data (like costs).
        brand: {
          DEFAULT: "#3B82F6", // Tailwind blue-500
          dark: "#2563EB",    // Tailwind blue-600 (for hover/active)
          light: "#BFDBFE",   // Tailwind blue-200 (for subtle accents, active toggle background)
          extralight: "#E0F2FE", // Tailwind blue-100 (for even lighter accents, like chip tags background)
        },

        // Surface & Background Colors: The foundation of your clean aesthetic.
        surface: {
          DEFAULT: "#FFFFFF", // Pure white for cards and primary content areas
          background: "#F8FAFC", // A very soft, subtle off-white for the main page background (like slate-50)
          border: "#E2E8F0", // Light grey for subtle borders, dividers (slate-200)
        },

        // Text Colors: For readability and hierarchy.
        text: {
          DEFAULT: "#1E293B",    // Dark grey for primary text (slate-800)
          secondary: "#64748B",   // Medium grey for secondary text, labels, placeholder (slate-500)
          muted: "#94A3B8",       // Light grey for very subtle text, inactive elements (slate-400)
        },

        // --- Accent Colors (Drawing from the illustration in the split-screen) ---
        // These can be used for secondary buttons, highlights, or within graphics.
        accent: {
          purple: {
            DEFAULT: "#7C3AED", // Tailwind violet-600
            light: "#8B5CF6",    // Tailwind violet-500
          },
          pink: {
            DEFAULT: "#DB2777", // Tailwind pink-600
            light: "#EC4899",    // Tailwind pink-500
          },
          teal: {
            DEFAULT: "#14B8A6", // Tailwind teal-500
            light: "#2DD4BF",    // Tailwind teal-400
          },
        },

        // --- Illustration-Specific Gradient Colors (for the background of the right panel) ---
        // If you want to replicate the gradient from the last login screen's illustration background.
        illustrationGradient: {
          start: "#6366F1", // Indigo-500
          end: "#C084FC",   // Purple-400
        },
      },
      boxShadow: {
        // Keeping subtle shadows for cards, consistent with the clean look.
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      backgroundImage: {
        // Placeholder for the illustration background gradient
        "gradient-illustration-bg": "linear-gradient(to bottom right, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
} satisfies Config;