---
title: Project
description: Project information
slug: docs/project
---


### Thumbnails as a Service

Thumbrella is a server that creates thumbnails and metadata for online media. 
The code is open source and simple to run your own standalone service. The
Apache 2 license makes it easy to customize, use, and contribute to.

The thumbrella.dev is a simple on-ramp to scalable resources, a global caching
network, and integration with the most complicated renderers. The architecture
allows managing this service on lightweight cloud services that allows anyone
to use the service free. There are payment options for the more demanding
use cases to help manage the service costs.

A family of rich client libraries makes getting started even easier. These are
also Apache 2 client and ready to integrate into any project. These extend the
server with persistent caching, simplifying streaming requests, as well as
simple developer tools and diagnostics.

(More details in documetation)


### Become a Fan

The free service for Thumbrella already provides a usable and poweful foundation
for online applications. This can be extended further by becoming an early
supporter of Thumbrella. Thumbrella fans automatically receive triple the usage 
limits over the free plan. There are several ways to become a fan and support
Thumbrella.

* Star on Github
* Purchase merch
* Contribute documentation or bug fixes

(More details in documetation)


### Runtime

The Thumbrella server comes with a large collection of renderers statically
compiled into the Rust executable. It can also be extended by finding additional
command line renderers to handle the most complicated media formats.

The server will look for commands like ``ffmpeg`` and ``f3d`` to handle the
most complicated media types. These are run in limited resource processes,
and if sandbox tools like Bubblewrap are available, they will be applied to
the external commands.

Run the server with the ``diag`` subcommand to get detailed output about
which commands are discovered and the types of media that will be supported
by the running server.


### Not Thumbrella

Thumbrella is an opinionated service for generating thumbnail images. These are
intended to be low reseolution, static representations of media. This includes
content like photographs, documents, videos, 3d models and more.

Thumbrella creates simple, consistent, and aesthetic thumbnails for a wide
variety of formats. It does not provide any configuration or settings to
control the output.

Thumbrella is not a media viewing toolset. It provides no interactive or
optimized viewing of the media itself.

Thumbrella runs as a standalone service. It cannot be run inside a browser
environment. (It does allow service users to create publishable keys that can
be used to access the service from a browser.)


### Online

Online thumbnails create unique challenges that are not handled by traditional
desktop thumbnailing applications. The primary challenge is that IO and access to
the media is expensive and does not naturally provide random access to contents.

Well bahaved media server provide several opportunities the Thumbrella strives
to take full advantage of.

* Advanced caching and freshness details not provided by filesystems
* Global shared caching contributed by worlwide users
* Sandboxed code safety means your application does not need to handle complex binary media, avoiding security and scalability problems.

The Thumbrella service is already running on several widely available cloud compute platforms. 
These can be accessed through accounts on those platforms without any Thumbrella subscription.
Use of those platforms can still be optionally enhanced by using a free Thumbrella account
to enable shared caching and other features. AI applications are already running on these platforms,
and those applications can immediately make use of Thumbrella for high quality media management.
* Replicate
* fal.ai
* Modal


### Repositories

- [thumbrella](https://github.com/thumbrella-dev/thumbrella): Core Rust codebase (tier1 library, tier2 binary, tier3 media).
- [thumbrella-api](https://github.com/PeterShinners/thumbrella-api): Cloudflare Worker wrapping tier1 via WASM.
- [thumbrella-web](https://github.com/PeterShinners/thumbrella-web): Public marketing site and documentation (this site).
- [thumbrella-admin](https://github.com/PeterShinners/thumbrella-admin): Admin dashboard (CF Access-protected).
- [thumbrella-clients](https://github.com/PeterShinners/thumbrella-clients): Public client SDKs (JS/TS, Python, Go, Rust, React, Astro).
- [thumbrella-docker](https://github.com/PeterShinners/thumbrella-docker): Container image definitions for tier2 and tier3.
- [thumbrella-demo](https://github.com/PeterShinners/thumbrella-demo): Demo site showcasing thumbnails and media.
- [thumbrella-platform](https://github.com/PeterShinners/thumbrella-platform): Dev container, docs, and orchestration scripts.

### Authors

Peter Shinners — creator and maintainer of Thumbrella.

### Demo Site

Info about the cool demo site