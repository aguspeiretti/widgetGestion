/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        mundoJob: "url('/public/fondo-solo.png')",
      },
      boxShadow: {
        custom: "0 4px 6px rgba(0, 0, 0, 0.384)",
      },
      fontFamily: {
        mundo: "url('./src/assets/fonts/Quicksand-VariableFont_wght.ttf)",
      },
    },
  },
  plugins: [],
};
