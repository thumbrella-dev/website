import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import starlight from '@astrojs/starlight';

// When running `astro build --mode development` (i.e. `npm run preview`),
// skip minification for a faster local Workers-runtime test cycle.
const modeIndex = process.argv.indexOf('--mode');
const buildMode = modeIndex >= 0 ? process.argv[modeIndex + 1] : 'production';
const isDevBuild = buildMode === 'development';

export default defineConfig({
  site: 'https://thumbrella.dev',
  compressHTML: true,
  server: {
    host: '0.0.0.0',
  },
  integrations: [
    sitemap(),
    starlight({
      title: 'Thumbrella Documentation',
      description: 'Documentation for the Thumbrella fast media thumbnail platform.',
      logo: { src: './public/thumbrella.png', alt: 'thumbrella.dev' },
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.png'} },
      ],
      components: {
        Header: './src/components/starlight/Header.astro',
        Footer: './src/components/starlight/Footer.astro',
        Sidebar: './src/components/starlight/Sidebar.astro',
      },
      editLink: {
        baseUrl: 'https://github.com/thumbrella-dev/website/edit/main/',
      },
      lastUpdated: true,
      tableOfContents: false,
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
    mdx(),
  ],
  output: 'static',

  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
  },

  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: { enabled: true },
  }),
  vite: {
    build: {
      minify: isDevBuild ? false : 'esbuild',
      cssMinify: !isDevBuild,
      reportCompressedSize: false,
    },
  },
});