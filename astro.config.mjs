// @ts-check
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://bringyourowncake.com',
  output: 'server',
  integrations: [tailwind(), sitemap()],
  adapter: netlify(),
});
