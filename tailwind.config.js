/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        mundoJob: "url('/src/assets/fondo-solo.png')",
      },
      boxShadow: {
        custom: "0 4px 6px rgba(0, 0, 0, 0.384)",
      },
      fontFamily: {
        mundo: "url('./src/assets/fonts/Quicksand-VariableFont_wght.ttf)",
      },
      screens: {
        "3xl": "1600px",
        "4xl": "1800px",
        "5xl": "1900px",
      },
    },
  },
  plugins: [],
};
