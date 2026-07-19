---
title: Project
description: Project information
slug: docs/project
---

### Purpose

Thumbrella is a server that creates thumbnails and metadata for online media.
The code is open source under the 
[Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0), making it
easy to customize, use, and contribute to.

At the time of creation, there weren't many existing options. Minimal thumbnail
examples are integrated into file explorer interfaces, but nothing is easy to
integrate into separate projects.

### Original Goals Thumbrella

* Strive for developer experience and flexible open source use cases
* Browsers can only reliably render a handful of image formats
* HTTP streams don't provide the random access needed by most thumbnail tools
* Take advantage of the excellent caching definitions from HTTP
* Create a standalone, static executable with as much functioanlity as possible
* Configuration free, just run for quality results
* Should work on Windows, MacOS, and Linux
* Create an architecture that allows astonishingly cheap hosting
* Pass those savings on to customers and make a reliable free tier
* Simple [HTTP](/docs/client/#http-thumbnail-api) api for the simple cases
* Provide fantastic [client libraries](/docs/client/) that go even farther

### How It Compares

If you're evaluating thumbnail solutions, here is how Thumbrella relates to
common alternatives:

| Approach | Example | Thumbrella difference |
|----------|---------|-----------------------|
| Browser-only `<img>` | Standard HTML | Only supports ~5 image formats. No video, documents, or raw photos. |
| Cloud image services | imgix, Cloudinary | These are focused on images and producing high quality (slow) results, one media at a time. |
| Server-side `ffmpeg` scripts | Custom bash/python | Challenges to distribute, deploy, and integrate into online environments. |
| Image libraries | ImageMagick, libvips | Images only and inefficient on remote media. |
| **Thumbrella** | | **Open source server + clients. One binary, 100+ formats, CDN-ready.** |


### Authors

<div class="author-card">

![Peter Shinners](/pete.webp)
**Peter Shinners**, creator and maintainer of Thumbrella.

Has been building software for games, film, and open source software for several
decades. He works primarily in [Python](https://python.org), with a focus on
artist tools and studio pipeline backends. He is the original developer of
[Pygame](https://github.com/pygame/pygame) along with various small and
specialized projects.
</div>


### Thumbnail Output

Every thumbnail Thumbrella generates shares a consistent set of
characteristics. These are **not configurable**, the output is opinionated
by design to keep the API simple and the results predictable. Custom sizes,
formats, and styling are an intended future feature but not part of the
initial release.

| Property | Value |
|----------|-------|
| Size     | 250 × 200 pixels (4:3 aspect ratio) |
| Format   | JPEG, quality ~60 |
| Transparency | Composited over a neutral background |
| Cropping | Loosely preserves the source media's aspect ratio |
| Look     | Lightweight image processing for visual consistency |

Thumbnails are small (5–10 KB) and optimized for fast loading. The JPEG quality
is deliberately low. Enough to recognise the content, not for archival
reproduction.

The resulting thumbnail is always a full edge to edge 4:3. This consistency is
intended to simplify client uses and help galleries and tools predictable. The
thumbnail is still cropped to represent the aspect ratio used by the source
media.

<img src="https://demo.thumbrella.dev/thumb/neon-block.png.jpg" alt="Transparent PNG rendered with background overlay" style="display:inline-block;max-width:100%;aspect-ratio:4/3;width:160px;">
<img src="https://demo.thumbrella.dev/thumb/packing-boxes.avi.jpg" alt="Wider video thumbnail" style="display:inline-block;max-width:100%;aspect-ratio:4/3;width:160px;">
<img src="https://demo.thumbrella.dev/thumb/math-guide.odt.jpg" alt="Portrait document thumbnail" style="display:inline-block;max-width:100%;aspect-ratio:4/3;width:160px;">

Every request comes with a resulting image. For formats Thumbrella does not
understand it will still classify the media type and provide a simple
placeholder for that media. Applications don't need special error-handling code
paths for missing or failed thumbnails.

<img src="https://cloud.thumbrella.dev/placeholder/audio.jpeg" alt="Audio placeholder" style="display:inline-block;max-width:100%;aspect-ratio:4/3;width:160px;">
<img src="https://cloud.thumbrella.dev/placeholder/document.jpeg" alt="Document placeholder" style="display:inline-block;max-width:100%;aspect-ratio:4/3;width:160px;">

Each thumbnail comes with a [lightweight description](/docs/client/#result) of
the source media. This describes the resolutions for images, lengths of videos,
and more. The `Result` structure for each thumbnail. 


### Unsupported Features

There is no way to configure the style, resolution, or format of the thumbnails.
The settings are hardcoded into the converter and cannot be changed. The
thumbnails are never animated.

This is not an image optimization or viewing service. The thumbnails are
intended to look good but are low resolution with low quality compression.
It is not a media viewing toolset, it provides no interactive or
optimized viewing of the media itself.

Thumbrella runs as a standalone server. It cannot be run inside a browser
environment.


### GitHub Repositories

Thumbrella is hosted across several GitHub projects under the
[thumbrella-dev](https://github.com/thumbrella-dev) organization.
Everything is released under the Apache-2 license.

The Github organization also has a simple
[discussion](https://github.com/orgs/thumbrella-dev/discussions/categories/posts)
section and
[news](https://github.com/orgs/thumbrella-dev/discussions/categories/news) posts.

| Repository | Description |
|------------|-------------|
| [thumbrella-dev/thumbrella](https://github.com/thumbrella-dev/thumbrella) | Thumbrella server in [Rust](https://rust-lang.org) |
| [thumbrella-dev/clients](https://github.com/thumbrella-dev/clients) | Public client packages (TypeScript, Python, Rust, React, Astro) |
| [thumbrella-dev/website](https://github.com/thumbrella-dev/website) | Project information and documentation (this site) |


