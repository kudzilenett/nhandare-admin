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
        admin: {
          primary: "#1e293b", // Much darker primary
          secondary: "#475569", // Darker secondary
          accent: "#2563eb", // Brighter blue for better visibility
          accentHover: "#1d4ed8", // Darker blue for hover
          success: "#059669", // Darker green
          warning: "#d97706", // Darker orange
          error: "#dc2626", // Darker red
          surface: "#ffffff", // White surface
          textPrimary: "#1e293b", // Dark slate for primary text
          textSecondary: "#475569", // Darker secondary text
          textTertiary: "#64748b", // Darker tertiary text
          textInverse: "#ffffff", // White text on dark backgrounds
          border: "#e2e8f0", // Border color
          background: "#f8fafc", // Light background
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
