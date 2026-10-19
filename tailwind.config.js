/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial tesis física nuclear
        nuclear: {
          deep: '#123B5D',      // Azul nuclear profundo
          DEFAULT: '#123B5D',
          dark: '#0B253B',
          light: '#1B4E78',
        },
        techno: {
          DEFAULT: '#1976D2',   // Azul tecnológico
          hover: '#1565C0',
          light: '#42A5F5',
        },
        azure: {
          light: '#EAF4FB',     // Azul claro / fondos destacados
          surface: '#F0F7FC',
        },
        canvas: {
          DEFAULT: '#F4F7FA',   // Gris de fondo principal
          subtle: '#EAEFF5',
          card: '#FFFFFF',      // Blanco
        },
        graphite: {
          DEFAULT: '#17212B',   // Negro grafito
          light: '#2C3A47',
          dark: '#0E161E',
        },
        slate: {
          secondary: '#64748B', // Gris para textos secundarios
          border: '#E2E8F0',    // Bordes sutiles
          subtle: '#CBD5E1',
        },
        accent: {
          yellow: '#F4C542',    // Amarillo de acento
          amber: '#F59E0B',
          hover: '#E5B329',
        },
        // Compatibilidad con semántica existente
        reactor: '#10B981',      // Verde estado operativo
        plasma: '#1976D2',
        critical: '#EF4444',     // Rojo alarma / emergencia
        warning: '#F59E0B',
      },
      fontFamily: {
        display: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(18, 59, 93, 0.06), 0 1px 2px -1px rgba(18, 59, 93, 0.04)',
        elevated: '0 4px 6px -1px rgba(18, 59, 93, 0.08), 0 2px 4px -2px rgba(18, 59, 93, 0.04)',
        hover: '0 10px 15px -3px rgba(18, 59, 93, 0.1), 0 4px 6px -4px rgba(18, 59, 93, 0.05)',
      },
    },
  },
  plugins: [],
};
