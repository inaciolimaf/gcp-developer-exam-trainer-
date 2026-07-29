/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // --- surfaces -------------------------------------------------
        // `base` doubles as the contrast colour on top of solid accents
        // (text-base on bg-coral etc.), so it stays the lightest value.
        base: '#EEF2F8',
        canvas: '#EEF2F8',
        panel: '#FFFFFF',
        surface: '#FFFFFF',
        sunken: '#F3F6FB',
        line: '#DEE5EF',
        'line-strong': '#C3CEDE',
        ledge: '#D3DCE9', // the hard bottom edge that gives buttons depth

        // --- text -----------------------------------------------------
        ink: '#131720',
        muted: '#5A6478',
        faint: '#8A94A6',

        // --- one accent -----------------------------------------------
        // `cyan`/`violet`/`pink` are legacy token names kept so existing
        // markup keeps working; they now all resolve to the single brand
        // blue (violet = the deeper step used for gradients + pressed).
        cyan: '#1A6FE0',
        violet: '#1450A8',
        pink: '#1A6FE0',
        brand: '#1A6FE0',
        'brand-deep': '#1450A8',

        // --- reserved semantics ---------------------------------------
        // green and red mean "certo" and "errado". Nothing else.
        mint: '#12894C',
        coral: '#C92A35',
        // --- streak / xp ----------------------------------------------
        amber: '#B26A00',
      },
      boxShadow: {
        // Legacy `glow-*` names, re-pointed from neon glows to soft drop
        // shadows so every existing call site degrades gracefully.
        'glow-cyan': '0 2px 10px -3px rgba(26,111,224,0.40)',
        'glow-violet': '0 2px 10px -3px rgba(20,80,168,0.40)',
        'glow-pink': '0 2px 10px -3px rgba(26,111,224,0.40)',
        'glow-mint': '0 2px 10px -3px rgba(18,137,76,0.40)',
        'glow-coral': '0 2px 10px -3px rgba(201,42,53,0.40)',
        'glow-amber': '0 2px 10px -3px rgba(178,106,0,0.40)',
        'glow-soft': '0 1px 2px rgba(19,23,32,0.05), 0 10px 30px -18px rgba(19,23,32,0.35)',
        // The signature: a hard ledge under the surface, no blur.
        card: '0 2px 0 0 #DEE5EF',
        key: '0 4px 0 0 #D3DCE9',
        'key-brand': '0 4px 0 0 #1450A8',
        'key-mint': '0 4px 0 0 #0C6537',
        'key-coral': '0 4px 0 0 #99202A',
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
        // feedback motion
        slabUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        xpRise: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '25%': { transform: 'translateY(0)', opacity: '1' },
          '75%': { transform: 'translateY(-6px)', opacity: '1' },
          '100%': { transform: 'translateY(-16px)', opacity: '0' },
        },
        flamePulse: {
          '0%,100%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.22)' },
        },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        drift: 'drift 16s ease-in-out infinite',
        wiggle: 'wiggle 0.45s ease-in-out',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'slab-up': 'slabUp 0.28s cubic-bezier(0.22,1,0.36,1)',
        'pop-in': 'popIn 0.34s cubic-bezier(0.22,1,0.36,1)',
        'xp-rise': 'xpRise 1.1s ease-out forwards',
        'flame-pulse': 'flamePulse 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
