---
title: Web Client (JS/TS)
description: Install and configure the Thumbrella JavaScript and TypeScript client library.
sidebar:
  order: 1
---

The `@thumbrella/client` package is the standard way to call Thumbrella from JavaScript and TypeScript projects — Node.js, Deno, Bun, browser bundles, or any edge runtime.

## Installation

```sh
npm install @thumbrella/client
# or
pnpm add @thumbrella/client
# or
yarn add @thumbrella/client
```

Requires Node.js 18+ (or any runtime with the Fetch API).

## Basic usage

```ts
import { Thumbrella } from '@thumbrella/client';

const tbr = new Thumbrella({ token: process.env.THUMBRELLA_TOKEN });

// Generate a thumbnail URL (no request until you fetch it)
const url = tbr.thumb('https://example.com/video.mp4', { at: '5s', width: 320 });

// Or fetch the thumbnail binary directly
const blob = await tbr.fetch('https://example.com/photo.cr2', { width: 640 });
```

## Configuration options

```ts
const tbr = new Thumbrella({
  token: 'tbr_...',      // API token (omit to use the anonymous free tier)
  baseUrl: 'http://localhost:8000',  // Point at a self-hosted instance
  cache: true,           // Respect server cache headers (default: true)
});
```

## Generating thumbnail URLs

URLs are constructed client-side and passed to an `<img>` tag — the thumbnail is generated on first request and cached for every subsequent one.

```ts
// In a React component
const src = tbr.thumb(mediaUrl, { width: 400, format: 'webp' });
return <img src={src} alt="Preview" loading="lazy" />;
```

## Fetching metadata

```ts
const meta = await tbr.meta('https://example.com/clip.mp4');
// { width: 1920, height: 1080, duration: 142.3, format: 'mp4', ... }
```

## Error handling

The client throws `ThumbrellRequestError` on HTTP errors. Check `error.status` for the status code.

```ts
import { ThumbrellRequestError } from '@thumbrella/client';

try {
  const blob = await tbr.fetch(url);
} catch (e) {
  if (e instanceof ThumbrellRequestError) {
    console.error(e.status, e.message);
  }
}
```

## Next steps

- [Get an API token](/docs/getting-started/online-service) from the hosted service dashboard.
- [Run a local server](/docs/getting-started/self-hosted) and point `baseUrl` at it during development.
