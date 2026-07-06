/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        panel2: 'var(--panel2)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        bronze: '#c9834a',
        xpgreen: '#3ed598',
        danger: '#e2574c',
        textmain: 'var(--text)',
        textdim: 'var(--textdim)',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'lg': 'var(--radius-panel)',
      },
      screens: {
        'bp-820': '820px',
      },
    },
  },
  plugins: [],
}
