/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      },
      colors: {
        brand: '#0BA5EC',
        ink: {
          DEFAULT: '#0F172A',
          muted: '#475569',
        },
        bg: {
          DEFAULT: '#FFFFFF',
          soft: '#F8FAFC',
        },
        line: '#E2E8F0',
        ok: '#16A34A',
        warn: '#DC2626',
        info: '#2563EB',
      },
      maxWidth: {
        '8xl': '1200px',
      },
      borderRadius: {
        'xl': '12px',
        'lg': '8px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,.06)',
        'card': '0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.06)',
      },
      fontSize: {
        'h1': ['28px', '36px'],
        'h2': ['22px', '30px'],
        'h3': ['18px', '26px'],
        'body': ['16px', '24px'],
        'small': ['14px', '20px'],
        'micro': ['12px', '16px'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
    },
  },
  plugins: [],
}
