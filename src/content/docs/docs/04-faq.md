---
title: FAQ
description: Common introductory and cross-cutting questions.
slug: docs/faq
tableOfContents:
  minHeadingLevel: 3
  maxHeadingLevel: 3
---

### What media types are supported?

Thumbrella supports most media formats. Most commonly around image formats,
but this support goes far beyond typical web browser images. Video is also
another prominent use case for good thumbnails.

Thumbrella will classify most formats into a `kind` and `extension`. From
these it also generates a standard `mime` type for each generated thumbnail.

The server does require external, optional subcommands for rendering some
file formats. You can check for availability of all formats on with the
`thumbrella formats` subcommand.

Currently there are over 100 formats supported when all subcommands are
available.

### What is the difference between Cloud and self-hosted?

The Thumbrella Cloud service has support for all available file formats.
It also has a globally distributed cache that improves performance for all
users. The Thumbrella architecture is efficient and lean, making it economic
and viable for free use cases. There are also paid subscriptions available
for more resources.

A self hosted server has other advantages. It can be run in offline environments
with resources that are not publically available.

### I don't need a server, I just want to thumbnail a file?

The server has a `thumb` subcommand for this exact purpose. The executable
is a single, static binary that runs without difficulty. It is packaged
in several formats that make running it straightforward, even without
installing anything.

```sh
npx @thumbrella/server thumb my_cool_video.mp4 thumb.jpeg
```

### What caching is supported?

The http protocol has excellent standards for cache control. Thumbrella takes
advantage of all of these. Both servers and client libraries can optionally
store thumbnail results in persistent caches. 

Caching at both levels is the primary way Thumbrella is fast and efficient.

Thumbrella results encode all the caching data into a single "cache string" that
passed back and forth between the server and clients.

See more details in the [server caching](../server#caching) section.
