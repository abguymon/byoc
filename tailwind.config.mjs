/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'anthro-cream': '#FDFBF7',
        'anthro-sage': '#9CAF88',
        'anthro-dusty-rose': '#D4A5A5',
        'anthro-moss': '#8B9A47',
        'anthro-warm-gray': '#6B7280',
        'anthro-soft-black': '#374151',
        'anthro-peach': '#F4C2A1',
        'anthro-lavender': '#E6E6FA',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        elegant: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
