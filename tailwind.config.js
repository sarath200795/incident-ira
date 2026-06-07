/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Indigo brand — incident/safety identity (distinct from Fire Marshal's
        // coral and Permit-to-Work's orange).
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d4d9e2',
          300: '#aeb7c7',
          400: '#8290a8',
          500: '#62718c',
          600: '#4d5a73',
          700: '#3f495d',
          800: '#373f4f',
          900: '#1c2230',
          950: '#11151d',
        },
        // Cool slate "clay" neutrals: raised claymorphic surfaces over a soft
        // blue-grey base, so the indigo brand accents pop.
        clay: {
          bg: '#eaedf4',
          surface: '#f8fafc',
          50: '#f8fafc',
          100: '#eef1f6',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        clay: '1.5rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.15), 0 10px 40px -10px rgba(99,102,241,0.35)',
        card: '0 1px 2px rgba(16,24,40,0.06), 0 12px 32px -12px rgba(16,24,40,0.18)',
        // Claymorphism (refined/subtle), cool-tinted: dark bottom-right drop +
        // light top-left highlight. Inset variants for recessed inputs/pressed.
        clay: '6px 6px 14px rgba(148,163,184,0.40), -6px -6px 14px rgba(255,255,255,0.90)',
        'clay-sm': '3px 3px 8px rgba(148,163,184,0.35), -3px -3px 8px rgba(255,255,255,0.85)',
        'clay-inset':
          'inset 4px 4px 8px rgba(148,163,184,0.40), inset -4px -4px 8px rgba(255,255,255,0.90)',
        'clay-pressed':
          'inset 5px 5px 10px rgba(148,163,184,0.50), inset -4px -4px 8px rgba(255,255,255,0.80)',
        'clay-brand':
          '5px 5px 12px rgba(99,102,241,0.28), -5px -5px 12px rgba(255,255,255,0.75)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.5)' },
          '70%': { boxShadow: '0 0 0 14px rgba(99,102,241,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        float: 'float 6s ease-in-out infinite',
        pulseRing: 'pulseRing 2s infinite',
      },
    },
  },
  plugins: [],
}
