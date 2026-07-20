# Thumbrella Web

Primary website and documentation for [Thumbrella](https://thumbrella.dev), the
fast media thumbnail platform. Built with [Astro](https://astro.build), deployed
to Cloudflare Workers.

The project documentation lives in `src/content/docs/` and is rendered by
[Starlight](https://starlight.astro.build).

The Thumbrella platform has a small ecosystem of other sites that make up
its ecosystem. 
- https://cloud.thumbrella.dev hosted thumbrella service (requires account)
- https://demo.thumbrella.dev gallery of example media and mock api
- https://admin.thumbrella.dev backend account management
- https://accounts.thumbrella.dev direct connection to clerk's account controls

## Getting Started

```bash
npm install
npm run dev        # Astro dev server on port 4321
```

## Structure

This project is essentially two parts.

1. The front landing page is a clumsy collection of Astro components. 
Behind the scenes it is not pretty, but at the end of the day there is
not that much content, so we can live with it.
2. The documentation is static markdown files under `src/contents/docs`.
Most of the content is in top level files. As they expand we may find we
need to organize things differently.

## Contributions

This site is build on Astro and Starlight. Contributions are expected to 
work confortably in this environment. No bringing in foreign frameworks or
new dependencies without some discussion ahead of time. And for the respect
and preservation of sanity, no Tailwind, ever.

## Authentication

The site connects with [Clerk](https://clerk.com) to allow users to create
and manage their accounts. Clerk is only enabled when this site can access
the Thumbrella admin services.

None of the Clerk or Admin is needed to edit, browse, and develop the static
Thumbrella web contents. 

## Deployment

Deployment is handled by the repository owner via `npm run deploy`, which builds
the Astro site and deploys to Cloudflare Workers. The site runs at
[thumbrella.dev](https://thumbrella.dev). See `wrangler.toml` for the worker
configuration.

## License

Apache 2.0, see [LICENSE](./LICENSE).
