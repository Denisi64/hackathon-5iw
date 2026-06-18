/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2B8FE8',
        'primary-dark': '#1A6DC0',
        fg: '#1A2340',
        muted: '#6B7A99',
        border: '#DDE3EF',
        surface: '#F5F8FE',
        card: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
