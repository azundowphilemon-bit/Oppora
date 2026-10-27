import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#F7F3EA',
          200: '#EFE7D6',
          300: '#E2D5BC',
        },
        clay: {
          50: '#FCF4F0',
          100: '#F7E3DA',
          200: '#EEC3B0',
          500: '#C85A32',
          600: '#B04620',
          700: '#8F3616',
          800: '#6E2911',
          900: '#4D1D0C',
        },
        gold: {
          50: '#FEF9EC',
          100: '#FBF0CE',
          200: '#F5DD95',
          400: '#E5B23A',
          500: '#D49B1F',
          600: '#B37D12',
          700: '#8A5E0D',
        },
        forest: {
          50: '#F0F7F4',
          100: '#DCECE4',
          200: '#B8D8C9',
          500: '#236B4E',
          600: '#1B563E',
          700: '#14422F',
          800: '#0E2F22',
          900: '#091F16',
        },
        charcoal: {
          50: '#F6F5F3',
          100: '#E7E4DF',
          200: '#CFCAC1',
          500: '#655F56',
          700: '#36322C',
          800: '#24211D',
          900: '#171512',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px -2px rgba(23, 21, 18, 0.06), 0 1px 3px -1px rgba(23, 21, 18, 0.04)',
        'warm-md': '0 10px 25px -5px rgba(23, 21, 18, 0.07), 0 4px 10px -2px rgba(23, 21, 18, 0.04)',
        'warm-lg': '0 20px 40px -10px rgba(23, 21, 18, 0.10), 0 8px 16px -4px rgba(23, 21, 18, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
