---
title: Online Service
description: Get started with the hosted Thumbrella endpoint in minutes.
sidebar:
  order: 1
---

The fastest path from a media URL to a production-quality thumbnail. No binary to download, no infrastructure to provision.

## Quickstart

```sh
curl https://go.thumbrella.dev/thumb#https://example.com/media.jpg
```

That's it. The response is a thumbnail-sized image ready to embed.

## Setup steps

1. **Create a free account** and collect your API token from the dashboard.
2. **Send a public media URL** to the hosted endpoint — video, image, document, 3D, or anything else Thumbrella supports.
3. **Add authentication** once your first response looks right:

```sh
curl \
  -H "Authorization: Bearer <API_TOKEN>" \
  https://go.thumbrella.dev/thumb#https://example.com/media.mp4
```

## What you get on the free tier

- Requests processed across the worldwide CDN edge network.
- All media renderers: video frames, camera RAW, PDF pages, 3D previews, vector graphics.
- Client-side caching instructions included in every response.
- A personal dashboard to manage tokens and view usage.

The free tier is a fully functional starting point — not a trial. Upgrade when you need higher throughput, SLA guarantees, or dedicated infrastructure.

## Next steps

- [Read the web client docs](/docs/clients/web-client) to integrate from JavaScript or TypeScript.
- [Explore advanced online plans](/docs/deployment/advanced-online) when the free tier limits get in the way.
