const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx,mjs}",

    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        light: "0 4px 6px rgba(255, 255, 255, 0.1)", // Ombra chiara per dark mode
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui(),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"),
  ],
};
