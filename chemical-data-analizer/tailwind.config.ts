// tailwind.config.ts  ― EN LA RAÍZ DEL PROYECTO ―
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',   //  👈  asegúrate de incluir todos tus archivos
  ],
  theme: {
    extend: {
      colors: {
        /*  👇  Estos nombres deben coincidir con
            las utilidades que usas en CSS:
            bg-background, text-foreground, border      */
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        border:     'hsl(var(--border) / <alpha-value>)',
        /* añade otros tokens si piensas usarlos
           (primary, secondary, card, etc.)              */
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border) / <alpha-value>)',
      },
    },
  },
  plugins: [],
} satisfies Config;
