/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'byoc-teal': '#D0E8E7',
        'byoc-pink': '#E6397F',
        'byoc-text-pink': '#C06C84',
        'byoc-white': '#FFFFFF',
        'byoc-gray': '#F5F5F5',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        script: ['Great Vibes', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
