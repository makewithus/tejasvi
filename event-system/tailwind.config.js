/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          black: '#090909',
          white: '#EFEFEF',
          gray: '#B6B6B6',
          red: '#FF3131',
        }
      }
    },
  },
  plugins: [],
}
