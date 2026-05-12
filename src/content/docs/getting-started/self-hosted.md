---
title: Self-Hosted
description: Run the Thumbrella standalone binary locally or in your own infrastructure.
sidebar:
  order: 2
---

Download a single binary and run it anywhere — online, offline, or fully air-gapped. No account, no registration, no phone home.

## Quickstart

```sh
# Generate a thumbnail directly
thumbrella thumb ./sample.mov --at 12s --output ./sample.webp

# Start a local HTTP server
thumbrella serve --port 8000
```

Once the server is running, requests look identical to the hosted API:

```sh
curl http://localhost:8000/thumb#https://example.com/media.jpg
```

## Download

Pre-built binaries are available for Linux (x86_64, ARM64), macOS (Apple Silicon, Intel), and Windows. Grab the latest release from [GitHub Releases](https://github.com/thumbrella/thumbrella/releases).

For Rust developers, build from source with:

```sh
cargo install thumbrella
```

## Configuration

The binary needs no configuration file to start. The most common environment variables:

| Variable | Default | Description |
|---|---|---|
| `TBR_PORT` | `8000` | HTTP server port |
| `TBR_CACHE_DIR` | none | Directory for on-disk thumbnail cache |
| `TBR_API_TOKEN` | none | Validate an API token on each request |

## Caching

Pass `--cache ./cache` (CLI) or set `TBR_CACHE_DIR` (server) to enable a local SQLite-backed cache. First requests process the media; repeated requests return cached responses instantly.

## Who this is for

This mode is the right fit for:

- Desktop applications that ship Thumbrella as a bundled dependency.
- CI pipelines generating asset previews during a build.
- Internal tooling that cannot touch external services.
- Evaluation before committing to the hosted service.

## Next steps

- [Read the web client docs](/docs/clients/web-client) to integrate from JavaScript or TypeScript.
- [Explore the sponsor edition](/docs/deployment/sponsor) for a Docker-first distribution with support.
