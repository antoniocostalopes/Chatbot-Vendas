/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Identidade Kyvo — azul do logótipo: ciano (#00A8FF) → azul (#2B6BF5)
        // → indigo (#5040FF), sobre navy (#102030) e branco frio.
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#bdd4ff',
          300: '#8fb6ff',
          400: '#5b8ffb',
          500: '#2b6bf5', // primário
          600: '#1a52e0', // hover / mais profundo
          700: '#1a43bb',
          800: '#1b3b96',
          900: '#1a3576',
        },
        // Navy frio — texto e superfícies escuras (do wordmark "Kyvo", #102030).
        ink: {
          DEFAULT: '#1a2336',
          50: '#f5f7fb',
          100: '#e9eef5',
          200: '#d3dbe8',
          300: '#aab7cb',
          400: '#7587a3',
          500: '#506583', // muted / texto secundário (≥4.5:1 em branco)
          600: '#3a4d68',
          700: '#293a51',
          800: '#1c2940',
          900: '#111b2e',
        },
        // Branco quase neutro, levemente frio, para secções/cards.
        surface: '#f5f8fc',
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Schibsted Grotesk"', '"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      backgroundImage: {
        // Assinatura Kyvo: ciano → azul → indigo (igual ao "K" do logótipo).
        'grad-brand': 'linear-gradient(135deg, #2b7bf2 0%, #2b6bf5 50%, #3b3fea 100%)',
        'grad-brand-deep': 'linear-gradient(135deg, #1f63da 0%, #1a52e0 50%, #2f2fcf 100%)',
      },
      boxShadow: {
        glow: '0 20px 60px -15px rgba(43,107,245,0.45)',
        'glow-sm': '0 12px 30px -10px rgba(43,107,245,0.40)',
        lift: '0 24px 50px -24px rgba(16,32,48,0.30)',
        // Sombra de cartão premium (estado de repouso, subtil mas com profundidade).
        card: '0 1px 2px -1px rgba(16,32,48,0.06), 0 14px 30px -16px rgba(16,32,48,0.16)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease forwards',
        'bounce-dot': 'bounce-dot 1.2s infinite ease-in-out',
        marquee: 'marquee 32s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
      },
    },
  },
  plugins: [],
};
