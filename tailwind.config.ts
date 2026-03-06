import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        vazir: ['Vazirmatn Variable', 'Vazirmatn', 'Tahoma', 'sans-serif'],
        sans: ['Vazirmatn Variable', 'Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
};

export default config;
