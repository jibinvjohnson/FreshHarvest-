import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f4',
          100: '#e1f0e6',
          200: '#c3e1ce',
          300: '#96cca9',
          400: '#64af7e',
          500: '#3f935b',
          600: '#2e7647',
          700: '#255e3a',
          800: '#204b30',
          900: '#1c3e29',
          950: '#0d2216',
        },
        leaf: {
          50: '#f6faef',
          100: '#eaf4dc',
          200: '#d7eab9',
          300: '#bedd8f',
          400: '#a3cd66',
          500: '#83b342',
          600: '#659030',
          700: '#4e6f27',
          800: '#405924',
          900: '#364b21',
        },
        ivory: {
          50: '#fdfbf7',
          100: '#faf6ee',
          200: '#f4ecd9',
          300: '#ebdcb9',
          400: '#dec491',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
