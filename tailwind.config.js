/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Identidade Closr — âmbar quente decisivo (energia comercial, "closer")
        // sobre preto-tinta e branco puro. OKLCH, hue ~68 (±10 do seed 77).
        brand: {
          50: 'oklch(0.971 0.018 78)',
          100: 'oklch(0.938 0.045 76)',
          200: 'oklch(0.892 0.080 73)',
          300: 'oklch(0.826 0.118 71)',
          400: 'oklch(0.752 0.152 69)',
          500: 'oklch(0.685 0.178 67)', // primário
          600: 'oklch(0.605 0.172 58)', // hover / mais profundo
          700: 'oklch(0.520 0.150 53)',
          800: 'oklch(0.430 0.120 50)',
          900: 'oklch(0.360 0.094 49)',
        },
        // Preto-tinta quente — texto e superfícies escuras "drenched".
        ink: {
          DEFAULT: 'oklch(0.205 0.018 67)',
          50: 'oklch(0.975 0.005 75)',
          100: 'oklch(0.948 0.007 72)',
          200: 'oklch(0.900 0.010 70)',
          300: 'oklch(0.820 0.012 68)',
          400: 'oklch(0.660 0.016 66)',
          500: 'oklch(0.520 0.018 64)', // muted / texto secundário (≥4.5:1 em branco)
          600: 'oklch(0.420 0.018 64)',
          700: 'oklch(0.330 0.018 65)',
          800: 'oklch(0.255 0.018 66)',
          900: 'oklch(0.180 0.016 67)',
        },
        // Branco quase neutro com lufada quente mínima para secções/cards.
        surface: 'oklch(0.984 0.006 75)',
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Schibsted Grotesk"', '"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        glow: '0 20px 60px -15px oklch(0.685 0.178 67 / 0.45)',
        'glow-sm': '0 12px 30px -10px oklch(0.685 0.178 67 / 0.40)',
        lift: '0 24px 50px -24px oklch(0.205 0.018 67 / 0.30)',
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
