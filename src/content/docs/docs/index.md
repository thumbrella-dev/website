---
title: Overview
description: Thumbrella documentation

---

Thumbrella is a server for generating online thumbnails from over 100 media
formats; video, images, documents, 3D models, audio, and more. A collection of
[client libraries](/docs/client/) simplify advanced features like streaming,
caching, and web components that work with zero configuration.




### Thirty second quickstart

```bash
# 1. One command to see a thumbnail from any URL or file path
npx @thumbrella/server thumb https://demo.thumbrella.dev/media/harbor-trucks.mp4 thumb.jpg

# 2. Or spin up a Docker server locally
podman run --name tbr --rm --publish 3114:3114 thumbrella/server:prerelease

# 3. From another terminal, use a client library
export TBR_CONNECT=http://localhost:3114
uvx thumbrella-client basic https://demo.thumbrella.dev/media/math-guide.odt
```

Documentation is organized into sections tailored to different roles:

- **[Client](/docs/client/)** first steps for using a Thumbrella
  server through code. The full API reference and best practices. Or
  use directly with curl.

- **[Server](/docs/server/)** how to install and run your own server.
  This covers configurations, troubleshooting, and more.


- **[Cloud](/docs/cloud/)** is the hosted service with all the features
  and functionality for free.

- **[Development](/docs/development/)** goes deeper into the
  project architecture and structure of the
  [Github repository](https://github.com/thumbrella-dev/thumbrella). Also code,
  contribution, and community guidelines.

### Contribute

This documentation and website are [hosted on
Github](https://github.com/thumbrella-dev/website). The content for this
documentation is written with [Starlight](https://astro.build/), a markdown
documentation system for [Astro](https://astro.build/). Each page has an
**Edit** link at the bottom.

![Astro](https://astro.build/assets/press/astro-icon-light.svg)
