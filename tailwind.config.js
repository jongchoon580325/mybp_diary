/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          950: '#071a0e',
          900: '#0f2d1a',
          800: '#164024',
          700: '#1e5530',
          600: '#276b3d',
          500: '#31834b',
          400: '#4aa362',
          300: '#6ec07f',
          200: '#9dd9ab',
          100: '#c8edcf',
          50:  '#edf8ef',
        },
        status: {
          normal:  '#16a34a',
          caution: '#ca8a04',
          danger:  '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
