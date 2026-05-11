import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';
import clerk from '@clerk/astro';

export default defineConfig({
  site: 'https://thumbrella.dev',
  integrations: [react(), clerk({
    appearance: {
      variables: {
        colorBackground: '#212126',
        colorNeutral: 'white',
        colorPrimary: '#ffffff',
        colorPrimaryForeground: 'black',
        colorForeground: 'white',
        colorInputForeground: 'white',
        colorInput: '#26262B',
      },
      elements: {
        providerIcon__apple: { filter: 'invert(1)' },
        providerIcon__github: { filter: 'invert(1)' },
      },
    },
  })],
  output: 'server',

  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
  },

  adapter: cloudflare({
    sessionKVBindingName: 'CLERK_SESSION',
    imageService: 'passthrough',
  }),
});