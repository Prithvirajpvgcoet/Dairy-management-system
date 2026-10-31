/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1b5bc9', // Lighter vibrant trust blue exactly matching design
          light: '#367dec', // Lighter vibrant blue
          accent: '#e6f0ff' // Light milk blue
        }
      }
    },
  },
  plugins: [],
}