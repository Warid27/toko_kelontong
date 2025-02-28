/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#24d164",
        secondary: "#3b82f6",
        tertiary: "#6b7280",
        danger: "#ef4444",
      },
    },
  },
  plugins: [require("daisyui")],
};
