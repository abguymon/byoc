// @ts-check
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://bringyourowncake.com',
  output: 'server', // Enable server-side rendering for API routes
  integrations: [tailwind(), sitemap()],
});
