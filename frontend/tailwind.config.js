/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        mint: '#2f9e8f',
        coral: '#e76f51',
        paper: '#f7f5ef'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(17, 24, 39, 0.08)'
      }
    }
  },
  plugins: []
};

export default tailwindConfig;
