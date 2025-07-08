// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#ef4444', // red-500
        },
        secondary: {
          black: '#0f0f0f',
          gray: '#808080',
        },
      },
    },
  },
  plugins: [],
};
