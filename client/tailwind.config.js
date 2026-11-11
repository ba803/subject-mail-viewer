/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gmail: {
          red: '#EA4335',
          blue: '#1A73E8',
          yellow: '#FBBC05',
          green: '#34A853',
          dark: '#202124',
          gray: '#5f6368',
          hover: '#f1f3f4',
          border: '#dadce0',
          bg: '#f6f8fc'
        },
        group: {
          badge: '#673AB7',
          bg: '#F3E5F5',
          border: '#D1C4E9',
          text: '#512DA8'
        }
      }
    },
  },
  plugins: [],
}

