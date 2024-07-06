import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warning: {
          DEFAULT: "#FFA726",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#17c964",
          foreground: "#FFFFFF",
        },
      },
    },
  },
  plugins: [nextui()],
};
