import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';
import clerk from '@clerk/astro';

export default defineConfig({
  site: 'https://thumbrella.dev',
  integrations: [react(), clerk()],
  output: 'server',

  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
  },

  adapter: cloudflare(),
});