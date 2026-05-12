---
title: Sponsor Edition
description: Docker-first distribution with full offline capability, advanced features, and a support relationship.
sidebar:
  order: 2
---

The sponsor edition is a Docker-first distribution with every renderer and media codec bundled in, designed for teams that need a complete standalone deployment — online or fully offline.

## Quickstart

```sh
docker run --rm -p 8000:8000 \
  ghcr.io/thumbrella/thumbrella-sponsor:latest serve
```

That starts the full server with all optional dependencies included and ready. No additional configuration needed for basic use.

## What the sponsor edition includes

- Every media renderer preinstalled: video (FFmpeg), camera RAW (LibRaw), documents (Poppler), 3D geometry (Open3D), vector graphics.
- Prebuilt for ARM64 and x86_64 — Linux and macOS targets.
- Offline operation — no network call required for any render.
- Custom caching backends: Redis, PostgreSQL, or bring your own via the cache adapter interface.
- Advanced operational features: structured logging, Prometheus metrics endpoint, graceful shutdown.

## Compose example

```yaml
services:
  thumbrella:
    image: ghcr.io/thumbrella/thumbrella-sponsor:latest
    ports:
      - "8000:8000"
    environment:
      TBR_CACHE_BACKEND: redis
      TBR_REDIS_URL: redis://cache:6379
      TBR_API_TOKEN: ${THUMBRELLA_TOKEN}
    command: serve
  cache:
    image: redis:7-alpine
```

## Licensing

A sponsor license covers:

- One year of new releases and upgrades.
- A perpetual license for the version at time of purchase.
- Access to priority support channels.
- Use across your own infrastructure (not for resale or redistribution).

[Contact us](mailto:sponsor@thumbrella.dev) for pricing and to receive your access credentials.

## Who this is for

- Teams running containerized deployments that need everything working out of the box.
- Use cases requiring fully offline or air-gapped operation.
- Projects needing custom caching layers or Postgres-backed storage.
- Organizations that want a support relationship behind their media runtime.

## Next steps

- [Explore managed online hosting](/docs/deployment/advanced-online) if you prefer not to operate infrastructure yourself.
