/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brown brand — warm earthy incident/safety identity.
        brand: {
          50: '#efebe9',
          100: '#d7ccc8',
          200: '#bcaaa4',
          300: '#a1887f',
          400: '#8d6e63',
          500: '#795548',
          600: '#6d4c41',
          700: '#5d4037',
          800: '#4e342e',
          900: '#3e2723',
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
        // Warm taupe "clay" neutrals: raised claymorphic surfaces over a soft
        // warm base, so the brown brand accents sit naturally.
        clay: {
          bg: '#ece6df',
          surface: '#fbf8f5',
          50: '#fbf8f5',
          100: '#f2ece4',
          200: '#e7ddd1',
          300: '#d4c6b6',
          400: '#a89684',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        clay: '1.5rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(121,85,72,0.15), 0 10px 40px -10px rgba(121,85,72,0.38)',
        card: '0 1px 2px rgba(16,24,40,0.06), 0 12px 32px -12px rgba(16,24,40,0.18)',
        // Claymorphism (refined/subtle), warm-tinted: dark bottom-right drop +
        // light top-left highlight. Inset variants for recessed inputs/pressed.
        clay: '6px 6px 14px rgba(168,150,133,0.42), -6px -6px 14px rgba(255,255,255,0.92)',
        'clay-sm': '3px 3px 8px rgba(168,150,133,0.38), -3px -3px 8px rgba(255,255,255,0.88)',
        'clay-inset':
          'inset 4px 4px 8px rgba(168,150,133,0.42), inset -4px -4px 8px rgba(255,255,255,0.92)',
        'clay-pressed':
          'inset 5px 5px 10px rgba(168,150,133,0.52), inset -4px -4px 8px rgba(255,255,255,0.82)',
        'clay-brand':
          '5px 5px 12px rgba(121,85,72,0.28), -5px -5px 12px rgba(255,255,255,0.75)',
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
          '0%': { boxShadow: '0 0 0 0 rgba(121,85,72,0.5)' },
          '70%': { boxShadow: '0 0 0 14px rgba(121,85,72,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(121,85,72,0)' },
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
