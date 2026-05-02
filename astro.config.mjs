import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://thumbrella.dev',
  integrations: [],
  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
  },
});