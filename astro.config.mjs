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
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon-light.png', media: '(prefers-color-scheme: light)' } },
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon-dark.png', media: '(prefers-color-scheme: dark)' } },
      ],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/thumbrella' }],
      components: {
        Header: './src/components/starlight/Header.astro',
        Footer: './src/components/starlight/Footer.astro',
        Sidebar: './src/components/starlight/Sidebar.astro',
      },
      sidebar: [
        { label: 'Overview', link: '/docs/' },
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
      expressiveCode: {
        themes: ['github-dark'],
        styleOverrides: {
          borderRadius: '8px',
          uiSelectionBackground: 'rgba(200, 149, 78, 0.2)',
          frames: {
            terminalTitlebarBackground: '#1e1530',
            terminalTitlebarForeground: '#c8bfaa',
            terminalTitlebarBorderBottomColor: 'rgba(200, 149, 78, 0.18)',
            terminalTitlebarDotsForeground: '#7c5cbf',
            terminalTitlebarDotsOpacity: '0.8',
            editorActiveTabBackground: '#1e1530',
            editorTabBarBackground: '#1a1228',
            editorTabBarBorderBottomColor: 'rgba(200, 149, 78, 0.18)',
            frameBoxShadowCssValue: 'none',
          },
          copyButtonBackground: 'transparent',
          copyButtonBorder: 'rgba(200, 149, 78, 0)',
          copyButtonForeground: 'rgba(200, 149, 78, 0.5)',
          copyButtonHoverBackground: '#2e2540',
          copyButtonHoverBorder: 'rgba(200, 149, 78, 0.45)',
          copyButtonHoverForeground: '#f0e8d8',
          copyButtonTooltipBackground: '#2e2540',
          copyButtonTooltipForeground: '#f0e8d8',
        },
      },
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