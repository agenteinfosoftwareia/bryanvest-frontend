/** @type {import('tailwindcss').Config} */
// Configuração do Tailwind CSS
// darkMode: 'class' → permite alternar dark mode via className no elemento raiz
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',   // escaneia todos os arquivos JS/JSX na pasta src
  ],
  theme: {
    extend: {
      // Paleta de cores customizada do BryanVest
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c7c7fe',
          300: '#a5a5fd',
          400: '#8080fa',
          500: '#6366f1',  // cor principal (indigo-500)
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      // Animações personalizadas para transições suaves
      animation: {
        'fade-in':     'fadeIn 0.4s ease-in-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-down':  'slideDown 0.3s ease-out',
        'scale-in':    'scaleIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':   'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: 0 },                      '100%': { opacity: 1 } },
        slideUp:   { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: 0 },'100%': { transform: 'translateY(0)', opacity: 1 } },
        scaleIn:   { '0%': { transform: 'scale(0.95)', opacity: 0 },     '100%': { transform: 'scale(1)', opacity: 1 } },
        bounceSoft:{ '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      // Sombras com cor de marca
      boxShadow: {
        'brand-sm':  '0 2px 8px rgba(99,102,241,0.25)',
        'brand-md':  '0 4px 20px rgba(99,102,241,0.35)',
        'brand-lg':  '0 8px 40px rgba(99,102,241,0.4)',
        'glow':      '0 0 20px rgba(99,102,241,0.6)',
      },
      // Fontes
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
