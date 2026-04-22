/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':  'fade-in 0.15s ease-out',
        'slide-up': 'slide-up 0.26s cubic-bezier(0.32, 0.72, 0, 1)',
        'scale-in': 'scale-in 0.16s cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
}
