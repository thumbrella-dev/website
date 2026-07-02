---
title: Project
description: Project information
slug: docs/project
---

### Thumbnails as a Service

Thumbrella is a server that creates thumbnails and metadata for online media.
The code is open source and simple to run your own standalone service. The
Apache 2 license makes it easy to customize, use, and contribute to.

Thumbrella Cloud is a hosted on-ramp to scalable resources. It brings a global
caching network and integration with the most complicated renderers. The
architecture allows managing this service on lightweight cloud services that
allows anyone to use the service free. There are payment options for the more
demanding use cases to help manage the service costs.

A family of rich client libraries makes getting started even easier. These are
also Apache 2 client and ready to integrate into any project. These extend the
server with persistent caching, simplifying streaming requests, as well as
simple developer tools and diagnostics.


### Authors

- **Peter Shinners** - creator and maintainer of Thumbrella.
  Bringing long and fortunate career as a Python developer and technical artist
  for various game and film studios. Peter has also been the maintainer of Pygame
  and couple minimal open source libraries over the years.

### Unsupported Features

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


### Repositories

- [thumbrella](https://github.com/thumbrella-dev/thumbrella): Thumbrella server in Rust
- [website](https://github.com/thumbrella-dev/website): Project information and documentation (this site).
- [clients](https://github.com/thumbrella-dev/clients): Public client packages (JS/TS, Python, Go, Rust, React, Astro).

### Demo Site

Thumbrella provides a simple, static gallery of media and the thumbnail results
from the current versions of the Thumbrella server. This has a collection of
over 30 media with a variety of formats and encodings.

https://demo.thumbrella.dev

The demo site also acts as a mock thumbrella server itself. This allows free
and immediate testing of Thumbrella clients with no server or account tokens.

Set `TBR_CONNECT=https://demo.thumbrella.dev` and access thumbnails for any 
of the media it hosts.

Or directly, `curl https://demo.thumbrealla.dev/thumb.jpeg&url=https://demo.thumbrella.dev/media/stream-barn.mkv --output thumbnail.jpeg`
