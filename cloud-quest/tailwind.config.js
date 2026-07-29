/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        base: '#08080f',
        panel: '#101120',
        cyan: '#22d3ee',
        violet: '#8b5cf6',
        pink: '#f472b6',
        mint: '#34d399',
        coral: '#fb7185',
        amber: '#fbbf24',
        ink: '#0a0a12',
      },
      boxShadow: {
        'glow-cyan': '0 0 28px -6px rgba(34,211,238,0.55)',
        'glow-violet': '0 0 28px -6px rgba(139,92,246,0.6)',
        'glow-pink': '0 0 28px -6px rgba(244,114,182,0.55)',
        'glow-mint': '0 0 30px -4px rgba(52,211,153,0.6)',
        'glow-coral': '0 0 30px -4px rgba(251,113,133,0.55)',
        'glow-amber': '0 0 30px -4px rgba(251,191,36,0.55)',
        'glow-soft': '0 8px 40px -12px rgba(0,0,0,0.7)',
      },
      borderWidth: { 3: '3px' },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-22px,0)' },
        },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(30px,-10px,0) scale(1.08)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-2.5deg)' },
          '50%': { transform: 'rotate(2.5deg)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        drift: 'drift 16s ease-in-out infinite',
        wiggle: 'wiggle 0.45s ease-in-out',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
