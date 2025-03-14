/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        bounceCustom: {
          "0%": { left: "100px", top: "0" },
          "80%": { left: "0", top: "0" },
          "85%": {
            left: "0",
            top: "-20px",
            width: "20px",
            height: "20px",
            background: "#fff",
          },
          "90%": {
            width: "40px",
            height: "15px",
            background:
              "linear-gradient(to top, rgb(255, 1, 1), rgb(102, 81, 102))",
          },
          "95%": {
            left: "100px",
            top: "-20px",
            width: "20px",
            height: "20px",
            background:
              "linear-gradient(to top, rgb(255, 1, 1), rgb(102, 81, 102))",
          },
          "100%": { left: "100px", top: "0" },
        },
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.33%)" },
        },
      },
      animation: {
        "bounce-custom": "bounceCustom 2s linear infinite",
        "scroll-infinite": "scroll 10s linear infinite",
      },
      colors: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        tertiary: "var(--bg-tertiary)",
        danger: "var(--bg-danger)",
      },
    },
  },
  plugins: [require("daisyui")],
};
