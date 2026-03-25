import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0D0D0D',
        surface: '#1A1A2E',
        raised:  '#2C2C3E',
        border:  '#2E2E45',
        accent:  '#00D4AA',
        gold:    '#F5A623',
        danger:  '#E53E3E',
        muted:   '#6B7280',
        'accent-dim': '#00A882',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
