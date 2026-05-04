import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://thumbrella.dev',
  integrations: [],

  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
  },

  adapter: cloudflare(),
});