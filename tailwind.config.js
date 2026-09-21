/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          blueHover: '#1765cc',
          blueLight: '#e8f0fe',
          blueDark: '#1967d2',
          text: '#202124',
          subtext: '#5f6368',
          border: '#dadce0',
          bg: '#ffffff',
          surface: '#f8f9fa'
        }
      },
      fontFamily: {
        sans: ['Google Sans', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
