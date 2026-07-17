---
title: FAQ
description: Common introductory and cross-cutting questions.
slug: docs/faq
tableOfContents:
  minHeadingLevel: 3
  maxHeadingLevel: 3
---

### What media types are supported?

Thumbrella supports over 100 media formats across several categories:

| Kind | Count | Examples |
|---|---|---|
| Image | 19 | JPEG, PNG, WebP, AVIF, GIF, TIFF, BMP, HEIC, JP2, JXL, ICO, PSD, PPM, TGA |
| Photograph | 27 | RAW, DNG, EXR, HDR, CR2, NEF, ARW, ORF, RW2, PEF, SRW, RAF, 3FR, MEF |
| Video | 14 | MP4, MOV, MKV, AVI, FLV, TS, M4V, 3GP, OGV, WMV, MPEG, WebM |
| 3D Geometry | 26 | OBJ, GLTF, GLB, STL, FBX, USDZ, IGES, DAE, PLY, 3DS, VRML |
| Document | 6 | DOCX, PPTX, ODT, XLSX, ODS, ODP |
| Audio | 6 | MP3, FLAC, OGG, M4A, AAC, WAV |
| Vector | 1 | SVG |

Thumbrella classifies every format into a `kind` and canonical `extension`
and generates a standard `mime` type for each thumbnail.

The server does require external, optional subcommands for rendering some
file formats (notably 3D models and document formats). Run
`thumbrella formats` to see which formats are available in your environment.

### What is the difference between Cloud and self-hosted?

[Thumbrella Cloud](/docs/cloud/) is the hosted service — it supports all
available file formats and includes a globally distributed edge cache that
improves performance for users worldwide. The architecture is efficient and
lean, making it economic and viable for free use cases. Paid subscriptions
are available for more resources.

A [self-hosted server](/docs/server/) has other advantages. It can run in
offline environments with resources that are not publicly available. There
are **no usage limits** when self-hosting — unlimited renders, unlimited
cache, no rate throttling.

### I don't need a server, I just want to generate thumbnails from files.

The server has a `thumb` subcommand for this exact purpose. The executable
is a single, static binary that runs without difficulty. It is packaged
in several formats that make running it straightforward, even without
installing anything.

```sh
npx @thumbrella/server thumb my_cool_video.mp4 thumb.jpeg
```

### What caching is supported?

The HTTP protocol has excellent standards for cache control. Thumbrella takes
advantage of all of these. Both servers and client libraries can optionally
store thumbnail results in persistent caches.

Caching at both levels is the primary way Thumbrella is fast and efficient.

Thumbrella results encode all the caching data into a single "cache string" that
is passed back and forth between the server and clients.

See more details in the [server caching](/docs/server/#caching) section.

### Do I need a client library, or can I use HTTP directly?

No client library is needed. The [HTTP API](/docs/client/#http-thumbnail-api)
is intentionally simple — a single `curl` call gets you a JPEG thumbnail:

```bash
curl "http://localhost:3114/thumb.jpeg?url=https://example.com/photo.jpg" --output thumb.jpg
```

Client libraries add caching, streaming, batching, error recovery, and
framework components — but the core API works with any HTTP tool.

### What size are the thumbnails?

Thumbnails are JPEG images, typically **5 KB to 10 KB** each. The maximum
dimension is 512 pixels on the longest side. Quality is tuned for fast
loading and visual recognizability — not archival reproduction.

You cannot change the resolution, format, or compression level. The output
is opinionated and consistent by design. See the [project page](/docs/project/#unsupported-features)
for what Thumbrella intentionally does not do.

### How fast is it?

For cached results: **instant** (no network round-trip needed if the client
cache is warm). For fresh renders on Thumbrella Cloud: typically under **500 ms**
for images, a few seconds for video keyframe extraction. Complex 3D renders
can take longer. The [demo gallery](https://demo.thumbrella.dev) has live
examples you can benchmark.

### Can I use Thumbrella in a commercial product?

Yes. The server and client libraries are licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0),
which permits commercial use, modification, and distribution with minimal
restrictions. You can embed the server, fork the code, or use Thumbrella
Cloud in a paid product.

### Does Thumbrella support authentication for private media?

Yes. Set a [handshake secret](/docs/server/#handshake) on your self-hosted
server, and clients must include it in every request. For Thumbrella Cloud,
your [auth token](/docs/cloud/#auth-tokens) authenticates you. The server
itself fetches remote URLs — if your media requires HTTP authentication,
include credentials in the URL or use the [connect string](/docs/client/#connect)
to pass custom headers.

### What happens when I hit my rate limit?

When a [Cloud account](/docs/cloud/#limits) reaches its daily or hourly
limit, the server continues to return results — but thumbnails are replaced
with placeholder images instead of rendered content. Cached results continue
to work normally. The `status` field in the result will indicate the state.
Your application does not need special failure handling; the shape of every
response is the same.

### Can I run Thumbrella behind a reverse proxy?

Yes. The server binds to a single port (default `3114`) and works well behind
[nginx](https://nginx.org), [Caddy](https://caddyserver.com), or any HTTP
reverse proxy. Set `TBR_PORT` to change the listen port. There are no
WebSocket or long-poll requirements — it's plain HTTP.

### Does Thumbrella handle animated images?

No. Thumbnails are always static JPEGs. Animated GIFs, APNGs, and video files
produce a single representative frame. Thumbrella is a thumbnail service, not
a media transcoder or optimizer.

### Where do I report bugs or request features?

File issues on the relevant GitHub repository:
[server](https://github.com/thumbrella-dev/thumbrella/issues),
[clients](https://github.com/thumbrella-dev/clients/issues), or
[website](https://github.com/thumbrella-dev/website/issues).
General discussion is on the [GitHub Discussions](https://github.com/orgs/thumbrella-dev/discussions)
page.

### Is there a hosted demo I can try without installing anything?

Yes. The [demo gallery](https://demo.thumbrella.dev) runs Thumbrella with a
curated set of media files. Use it as a connect string for any client:

```bash
export TBR_CONNECT=https://demo.thumbrella.dev
npx @thumbrella/server thumb https://demo.thumbrella.dev/media/neon-block.png out.jpg
```

No account or token needed for demo media.
