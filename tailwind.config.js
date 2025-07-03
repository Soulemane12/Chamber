/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Use class strategy instead of media query
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // You can define custom colors here
      },
    },
  },
  plugins: [],
} 