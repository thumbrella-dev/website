---
title: Project
description: Project information
slug: docs/project
---

### Purpose

Thumbrella is a server that creates thumbnails and metadata for online media.
The code is open source and simple to run your own standalone service. The
Apache 2 license makes it easy to customize, use, and contribute to.

At the time of creation, there aren't a lot of existing options. Minimal
examples are integrated into explorer interfaces, but nothing is easy to
integrate into separate projects.

| Goals that Thumbrella aims to address |
|-------|
| Can't rely on browsers to provide anything but the simplest of images |
| Http streams don't provide the random access needed by most thumbnailers |
| The server should not need to download the full contents of the media to generate a thumbnail |
| Http servers can provide richer caching strategies than typical filesystems |
| Integrating complex file handlers for arbitrary binary data can destabilize applications, better to keep external |
| Strive for developer experience and flexible open source use cases |
| Standalone, static executables should give as much functionality as possible |
| Aim for configuration-free experience with excellent defaults |
| Server should work on most platforms and operating systems |
| Architecture allows advanced deployment that can run cheaper than running a single all-in-one server |
| Use opionionated, consistent results to simplify application development |
| Server should be easy to access directly and use correctly through HTTP |
| But also provide fantastic client libraries that go even farther |


### Authors

<div class="author-card">

![Peter Shinners](/pete.webp)
**Peter Shinners**, creator and maintainer of Thumbrella.

Has been building software for games, film, and open source software for several
decades. He works primarily in Python, with a focus on artist tools and studio
pipeline backends. He is the original developer for
[Pygame](https://github.com/pygame/pygame) along with various small and
specialized projects.
</div>


### Unsupported Features

There is no way to configure the style, resolution, or format of the thumbnails.
The setting are hardcoded into the converter and cannot be changed. The 
thumbnails are never animated.

This is not an image optimization or viewing service. The thumbnails are
intended to look good but are low resolution with low quality compression.
It is not a media viewing toolset. It provides no interactive or
optimized viewing of the media itself.

Thumbrella runs as a standalone server. It cannot be run inside a browser
environment. 

### Github Repositories

Thumbrella is hosted across several Github projects under the 
[thumbrella-dev](https://github.com/thumbrella-dev) organization.

- [thumbrella-dev/thumbrella](https://github.com/thumbrella-dev/thumbrella): Thumbrella server in Rust
- [thumbrella-dev/website](https://github.com/thumbrella-dev/website): Project information and documentation (this site).
- [thumbrella-dev/clients](https://github.com/thumbrella-dev/clients): Public client packages (JS/TS, Python, Go, Rust, React, Astro).

The main organization also has a simple 
[discussion](https://github.com/orgs/thumbrella-dev/discussions/categories/posts) 
section and
[news](https://github.com/orgs/thumbrella-dev/discussions/categories/news) posts.

