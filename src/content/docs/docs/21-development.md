---
title: Development
description: Details on the project and source code
slug: docs/development
---

This documentation is mostly for the
[Thumbrella server repository](https://github.com/thumbrella-dev/thumbrella).
This is an Apache 2 licensed Rust project that produces a binary for whichever
platform it is built on.

The [client repository](https://github.com/thumbrella-dev/clients) and
[website](https://github.com/thumbrella-dev/website) are separate open source
repositories.


## Contribute

Code contributions are welcomed and encouraged. There is a bottomless
list of features and cleanups for this project. The repositories for
this website and the clients also welcome these additions.

Submit Github pull requests any of the Thumbrella repositories. They
will be reviewed and accepted once they are ready.

There are no policies against AI contributions. Clean code and improvements
are always welcome, regardless of the source.

Changes to the server must follow the description and requirements of
the Architecture, Tiers, and other sections of this document.


## Roadmap

There is no longer term roadmap for the project. The immediate development
is focused on stabilizing and completing features for the server. Tasks
Tasks that will always need future development:

- new file formats and renderers
- performance and efficiency improvements
- additional client languages and components
- improved documentation and website features
- unit and system tests

So, basically, everything.


## Architecture

The Thumbrella codebase is separated into three tiers. Each tier is a superset
of the ones below it. The project is separated this way to allow portions of the
codebase to run with different resources and requirements.

When packages and tools talk about the "Thumbrella server," they refer to
the executable built by Tier 3.

- **Tier 1** contains all the data structures and a majority of the code
  definitions. This implements the entire HTTP API with a minimal set of
  supported formats. This base tier also provides several simple cache backends.

  Tier 1 can use only Rust dependencies and must be able to build for the WASM
  architecture. It must also run without threading, which limits some async
  use cases.

- **Tier 2** adds formats that can be compiled statically into the server. There
  are no external shared libraries or tools allowed for tier 2. This creates a
  lightweight executable that is self contained. This uses a mixture of static
  `libavformat` and various rust media dependencies.

- **Tier 3** can use optional external tools and executables to create
  thumbnails. It is able to run tools like `ffmpeg` and `f3d` and run them
  inside sandboxes if available. Tier 3 is the only tier that dynamically
  determines which formats are supported, the others are fixed functionality.


## Handoffs

Each tier of the server performs a hand off to the higher tiers. There are
two strategies used to handoff processing.

- **Inline Handoff** uses a function, registered at startup, to
  perform additional processing. This can use all the same in-memory
  structures and network streams as the tier that started the request.

- **Remote Handoff** is a way any Thumbrella server can handoff to a
  separate, remote Thumbrella server. It uses http to forward a request
  and the discovered metadata to the next server.

The code in Tier 1 contains a dispatch table defining which tiers are
able to handle which formats. Generally there is a single tier for
each type of file.

Some formats can contain optional, complicated codecs. Sometimes these
will be attempted in Tier 2, but fall back on Tier 3 if the simpler
tier cannot handle the necessary features.


## HTTP Buffer

All media handling is routed through a special `HttpBuffer` container. This
maintains a streaming connection to the remote server, but allows random access
and caching of the file contents. This allows the different tiers to coordinate
and inspect the same data without restarting the remote connection.

The HTTP Buffer has a special feature that allows end-of-file reads. Several
formats place important indices or offsets at the end of their contents. To
access the end of a large file, a second range request is made to provide the
later parts of the file.

Other than that, all random access reads must stream through the original https
stream to access the needed data.

Many formats don't require full random access once they start processing the
streamed data. The http buffer can be switched to a mode that still allows
skipping forward without caching the entire file contents into memory.


## Pipeline

Creating a thumbnail goes through several steps in a process called the pipeline.

1. **connect**. A connection to the server is made. This can use cache related fields when the remote url has been visited before.
1. **cache**. If the server reports cached data is unmodified then previously cached results will be used. No http data will be streamed from the server.
1. **inspect**. The first parts of the file. This will use the filename and data found in the file to determine the `kind`, `extension` and `mime` for the remote media.
1. **shortcut**. Some formats contain an embedded thumbnail image. In these cases a shortcut handler knows how to extract the embedded image data, without really understanding how to interpret the file contents. Several of the most basic images can also be handled here in the shortcut handler, if their contents are small.
1. **render**. Generate an image for the given file. This could simply be reading and resampling image pixel data, or it could be generating a fully raytraced image with shaders. This step likely involves handing off to other tiers.
1. **deliver**. The above processes must deliver image data within approximately a power-of-2 of the target thumbnail size, usually less than 512x512. The deliver step performs final resizing and cropping, visual enhancement, and encodes the result as a low-quality JPEG.

