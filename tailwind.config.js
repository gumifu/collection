// @ts-check
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
        // 日本語フォントオプション
        mplus: ['M PLUS 1p', 'sans-serif'],
        kosugi: ['Kosugi Maru', 'sans-serif'],
        sawarabi: ['Sawarabi Gothic', 'sans-serif'],
        zenkaku: ['Zen Kaku Gothic New', 'sans-serif'],
        yugothic: ['"Yu Gothic"', '"YuGothic"', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            strong: {
              fontWeight: '700',
            },
            ol: {
              listStyleType: 'decimal',
            },
            ul: {
              listStyleType: 'disc',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
