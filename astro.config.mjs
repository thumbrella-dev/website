import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';
import clerk from '@clerk/astro';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://thumbrella.dev',
  integrations: [
    starlight({
      title: 'Thumbrella Docs',
      description: 'Documentation for the Thumbrella fast media thumbnail platform.',
      logo: { src: './public/thumbrella.png', alt: 'thumbrella.dev' },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/thumbrella' }],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Online Service', slug: 'getting-started/online-service' },
            { label: 'Self-Hosted', slug: 'getting-started/self-hosted' },
            { label: 'AI Platforms', slug: 'getting-started/ai-platforms' },
          ],
        },
        {
          label: 'Client Libraries',
          items: [
            { label: 'Web Client (JS/TS)', slug: 'clients/web-client' },
          ],
        },
        {
          label: 'Deployment',
          items: [
            { label: 'Advanced Online', slug: 'deployment/advanced-online' },
            { label: 'Sponsor Edition', slug: 'deployment/sponsor' },
          ],
        },
      ],
      customCss: ['./src/styles/starlight-custom.css'],
      disable404Route: true,
    }),
    react(),
    clerk({
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
    }),
  ],
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