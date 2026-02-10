import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tema escuro estilo Windy.com
        background: '#1a1a2e',
        card: '#16213e',
        'card-hover': '#1f2b47',
        text: {
          DEFAULT: '#e0e0e0',
          muted: '#a0a0a0',
          dark: '#808080',
        },
        accent: {
          DEFAULT: '#4ecca3',
          hover: '#3db892',
        },
        temp: {
          hot: '#ff6b6b',
          warm: '#ffa94d',
          neutral: '#ffd43b',
          cool: '#74c0fc',
          cold: '#4ecdc4',
        },
        border: '#2a3a5a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
