import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import clerk from '@clerk/astro';
import starlight from '@astrojs/starlight';

// When running `astro build --mode development` (i.e. `npm run preview`),
// skip minification for a faster local Workers-runtime test cycle.
const modeIndex = process.argv.indexOf('--mode');
const buildMode = modeIndex >= 0 ? process.argv[modeIndex + 1] : 'production';
const isDevBuild = buildMode === 'development';

export default defineConfig({
  site: 'https://thumbrella.dev',
  server: {
    host: '0.0.0.0',
  },
  integrations: [
    starlight({
      title: 'Thumbrella Docs',
      description: 'Documentation for the Thumbrella fast media thumbnail platform.',
      logo: { src: './public/thumbrella.png', alt: 'thumbrella.dev' },
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.png'} },
      ],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/thumbrella' }],
      components: {
        Header: './src/components/starlight/Header.astro',
        Footer: './src/components/starlight/Footer.astro',
        Sidebar: './src/components/starlight/Sidebar.astro',
      },
      editLink: {
        baseUrl: 'https://github.com/thumbrella-dev/web/edit/main/',
      },
      lastUpdated: true,
      sidebar: [
        { label: 'Overview', link: '/docs/' },
        { label: 'Pricing', link: '/docs/pricing/' },
        { label: 'Supporters', link: '/docs/supporters/' },
        {
          label: '\u{1F4D6} Introduction',
          items: [
            { label: 'Introduction', slug: 'docs/introduction/overview' },
            { label: 'Project and Author', slug: 'docs/introduction/project-and-author' },
            { label: 'Choose a Path', slug: 'docs/introduction/choose-a-path' },
            { label: 'FAQ', slug: 'docs/introduction/faq' },
          ],
        },
        {
          label: '\u{1F4E6} Clients',
          items: [
            { label: 'Clients', slug: 'docs/clients/overview' },
            { label: 'Quickstart', slug: 'docs/clients/quickstart' },
            { label: 'Web Client (JS/TS)', slug: 'docs/clients/web-client' },
            { label: 'Request Options', slug: 'docs/clients/request-options' },
            { label: 'Auth and Limits', slug: 'docs/clients/auth-and-limits' },
            { label: 'Errors and Retries', slug: 'docs/clients/errors-and-retries' },
            { label: 'API Reference', slug: 'docs/clients/api-reference' },
          ],
        },
        {
          label: '\u{1F5A5}\u{FE0F} Server',
          items: [
            { label: 'Server', slug: 'docs/server/overview' },
            { label: 'Self-Hosted', slug: 'docs/server/self-hosted' },
            { label: 'AI Platforms', slug: 'docs/server/ai-platforms' },
            { label: 'Configuration', slug: 'docs/server/configuration' },
            { label: 'Operations', slug: 'docs/server/operations' },
            { label: 'CLI Reference', slug: 'docs/server/cli-reference' },
            { label: 'Troubleshooting', slug: 'docs/server/troubleshooting' },
          ],
        },
        {
          label: '\u2601\u{FE0F} Service',
          items: [
            { label: 'Service', slug: 'docs/service/overview' },
            { label: 'Account Management', slug: 'docs/service/account-management' },
            { label: 'Usage and Limits', slug: 'docs/service/usage-and-limits' },
            { label: 'API Tokens', slug: 'docs/service/api-tokens' },
            { label: 'Pricing and Billing', slug: 'docs/service/pricing-and-billing' },
          ],
        },
        {
          label: '\u{1F6E0}\u{FE0F} Developers',
          items: [
            { label: 'Developers', slug: 'docs/developers/overview' },
            { label: 'Architecture', slug: 'docs/developers/architecture' },
            { label: 'Internals', slug: 'docs/developers/internals' },
            { label: 'Hosting Strategy', slug: 'docs/developers/hosting-strategy' },
            { label: 'Repos and Ownership', slug: 'docs/developers/repos-and-ownership' },
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
    mdx(),
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