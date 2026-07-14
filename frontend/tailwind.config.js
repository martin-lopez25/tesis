/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        reactor: '#a2ff40',
        plasma: 'rgb(56 189 248)',
        critical: 'rgb(239 68 68)',
        warning: 'rgb(251 146 60)',
        amber: { DEFAULT: '#fbbf24' },
        cyan: { DEFAULT: '#22d3ee' },
        navy: {
          deep: '#020c18',
          mid: '#050f1a',
          light: '#0a1f2e',
          border: '#1a3a4a',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
