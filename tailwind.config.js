/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        success: '#27ae60',
        error: '#e74c3c',
        neutral: '#bdc3c7',
        background: '#f8f9fa',
        text: '#2c3e50',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0. 1)',
      },
    },
  },
  plugins: [],
};
