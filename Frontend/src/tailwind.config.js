/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4f46e5',
          secondary: '#10b981',
          danger: '#e11d48',
        },

        // 🎯 Fondo principal
        bg: {
          DEFAULT: '#ffffff',   // blanco puro
          dark: '#000000',      // negro puro
        },

        // 🎯 Tarjetas
        card: {
          DEFAULT: '#f3f4f6',   // gris claro (gray-100)
          dark: '#111111',      // gris oscuro
        },

        // 🎯 Bordes
        border: {
          DEFAULT: '#e5e7eb',   // gray-200
          dark: '#2a2a2a',
        },

        // 🎯 Texto
        text: {
          main: '#111827',      // casi negro
          muted: '#6b7280',     // gris

          dark: '#f9fafb',      // blanco suave
          'dark-muted': '#9ca3af',
        },
      },
    },
  },
  plugins: [],
};