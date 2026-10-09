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
          midnight: '#071126',
          deep: '#0D1730',
          soft: '#F6F8FC',
        },
        accent: {
          blue: '#0066FF',
          teal: '#0D9488',
          emerald: '#059669',
          amber: '#D97706',
          red: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
