---
title: Overview
description: Thumbrella documentation
---

Thumbrella is a server for generating online thumbnails from over 100 media
formats — video, images, documents, 3D models, audio, and more. A collection of
[client libraries](/docs/client/) simplify advanced features like streaming,
caching, and web components that work with zero configuration.

| Quick links | |
|---|---|
| [Client libraries](/docs/client/) | TypeScript, Python, Rust — plus Astro and React components |
| [Run your own server](/docs/server/) | Single binary, `npx` or `docker run` |
| [Thumbrella Cloud](/docs/cloud/) | Free tier, global CDN, no payment info |
| [Pricing](/docs/pricing/) | Free, paid, and sponsor options |
| [FAQ](/docs/faq/) | Common questions and answers |
| [GitHub](https://github.com/thumbrella-dev) | Source code, discussions, releases |

---

### Thirty second quickstart

```bash
# 1. One command to see a thumbnail from any URL
npx @thumbrella/server thumb https://demo.thumbrella.dev/media/harbor-trucks.mp4 thumb.jpg

# 2. Or spin up the server locally
npx @thumbrella/server serve
# Server listening on http://localhost:3114

# 3. From another terminal, use a client library
export TBR_CONNECT=http://localhost:3114
uvx thumbrella-client basic https://example.com/photo.jpg
```

---

Documentation is organized into sections tailored to different roles:

- The **[Client](/docs/client/)** section details accessing a Thumbrella
  server from application code. High-level libraries are available for
  [TypeScript](https://www.npmjs.com/package/@thumbrella/client),
  [Python](https://pypi.org/project/thumbrella/), and
  [Rust](https://crates.io/crates/thumbrella). The server is also easy to
  access directly over HTTP — a single `curl` call is all it takes.

- The **[Server](/docs/server/)** section describes running your own server.
  Download a prebuilt binary for Windows, macOS, or Linux. Enable optional
  renderers for additional formats. Take your own server to production with
  caching, handshake secrets, and health checks.

- The **[Cloud](/docs/cloud/)** section covers the hosted service. Global
  edge caching, auth tokens, rate limits, and account management. The free
  tier supports 10,000 thumbnails per day with no payment information.

- The **[Development](/docs/development/)** section goes deeper into the
  project architecture. Three-tier design, format pipeline, HTTP buffer
  streaming, and how to contribute. This also gives an overview of the
  [project structure](https://github.com/thumbrella-dev/thumbrella) and
  coding guidelines. 
