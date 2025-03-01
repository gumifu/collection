/** @type {import('tailwindcss').Config} */
module.exports = {
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
    },
  },
  plugins: [],
}
