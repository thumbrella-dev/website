# Thumbrella Web

Primary website and documentation for [Thumbrella](https://thumbrella.dev), the
fast media thumbnail platform. Built with [Astro](https://astro.build), deployed
to Cloudflare Workers.

The project documentation lives in `src/content/docs/` and is rendered by
[Starlight](https://starlight.astro.build).

This website hosts the main static website for Thumbrella. There are several
related websites that are part of the Thumbrella platform. This does not
include
- https://cloud.thumbrella.dev - the hosted thumbrella service (requires account)
- https://demo.thumbrella.dev - gallery of example media and mock api
- https://admin.thumbrella.dev - backend account management

## Getting Started

```bash
npm install
npm run dev        # Astro dev server on port 4321
```

The dev server binds to `0.0.0.0` so it works with forwarded ports in container
environments.

## Directory Structure

```
web/
├── src/
│   ├── components/       # Reusable Astro and React components
│   │   └── starlight/    # Starlight component overrides
│   ├── content/          # Markdown content for main page and documentation
│   │   └── docs/         # Documentation pages (Starlight content collection)
│   ├── layouts/          # Page layout components
│   ├── pages/            # Route pages and API endpoints
│   └── styles/           # Global CSS and Starlight theme overrides
└── public/               # Static assets (favicon, robots.txt, logos)
```

## Documentation

## Authentication

The site connects with [Clerk](https://clerk.com) to allow users to create
and manage their accounts. This is a static website, and those interactions
are routed through a separate "admin" project with all the dynamic account
and credentials management.

None of the Clerk or Admin is needed to edit, browse, and develop the static
Thumbrella web contents. 

## Deployment

Deployment is handled by the repository owner via `npm run deploy`, which builds
the Astro site and deploys to Cloudflare Workers. The site runs at
[thumbrella.dev](https://thumbrella.dev). See `wrangler.toml` for the worker
configuration.

## License

Apache 2.0 — see [LICENSE](./LICENSE).
