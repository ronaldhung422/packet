/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'packet-purple': '#8b5cf6',
        'packet-purple-light': '#a78bfa',
        'packet-purple-dark': '#7c3aed',
        'packet-pink': '#ec4899',
        'packet-pink-light': '#f472b6',
        'packet-green': '#10b981',
        'packet-green-light': '#34d399',
        'packet-yellow': '#f59e0b',
        'packet-yellow-light': '#fbbf24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}