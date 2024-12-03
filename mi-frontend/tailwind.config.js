/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#81e6d9',
          DEFAULT: '#38b2ac',
          dark: '#2c7a7b',
        },
        secondary: {
          light: '#e6fffa',
          DEFAULT: '#b2f5ea',
          dark: '#81e6d9',
        },
      },
    },
  },
  plugins: [],
};