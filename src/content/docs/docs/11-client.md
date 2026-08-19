---
title: Client Libraries
description: Using the TypeScript, Python, and Rust client libraries
slug: docs/client
---

Thumbrella provides client libraries for
[Javascript](https://www.npmjs.com/package/@thumbrella/client),
[Python](https://pypi.org/project/thumbrella/), and
[Rust](https://crates.io/crates/thumbrella). 
Support for more languages will be excellent future additions. The client
libraries handle caching, streaming, error recovery, and other conveniences on
top of the core [HTTP API](../http-api/).

The Javascript library is written in Typescript and also comes with optional
browser level libraries, including a custom element
[`<tbr-thumb>`](../components/). Those are the preferred way to integrate
Thumbrella into web based applications.

A client library is not required to use Thumbrella, but provides many
high level features. The [HTTP API](../http-api/) is intentionally simple and 
works with any tool that can make an HTTP request; [curl](https://curl.se), 
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), or the 
standard library of most languages.

## Connect

Every client is configured through a **connect string**. The simplest forms
are a server URL or a Thumbrella Cloud token:

```bash
# Self-hosted server
export TBR_CONNECT=http://localhost:3114

# Demo server (free, no account needed for demo gallery)
export TBR_CONNECT=https://demo.thumbrella.dev

# Cloud token (routes to Thumbrella Cloud automatically)
export TBR_CONNECT=tbr_e_3QnzBcWx7KpRmYT2000example
```

All client libraries read `$TBR_CONNECT` automatically when no explicit
connect string is provided. This makes it easy to point the same application
at a local server for development and Thumbrella Cloud for production without
touching application code.

### Custom headers

A connect string can carry extra HTTP headers after the URL, separated by
commas. This is useful for private servers that require authentication or
a shared secret:

```bash
# Explicit header with key=value
export TBR_CONNECT=https://tbr.mycompany.net,x-api-key=sk-abc123

# Bare value -- treated as a handshake header (x-tbr-handshake)
export TBR_CONNECT=https://tbr.mycompany.net,my-shared-secret
```

Bare values in the comma-separated list are interpreted automatically:
values that look like an auth token (`tbr_[a-z]_...`) are sent as
`Authorization: Bearer <token>`, and everything else becomes an
`x-tbr-handshake` header.

### Auth tokens

Thumbrella Cloud uses short **auth tokens** that double as the connect
string. These always start with `tbr_?_` followed by base64 characters.

A bare token without a URL automatically targets Thumbrella Cloud:

```bash
export TBR_CONNECT=tbr_s_3QnzBcWx7KpRmYT2000example
```

Tokens can also be attached to a self-hosted URL when the server has
token authentication enabled:

```bash
export TBR_CONNECT=https://tier2.internal:3115,tbr_s_3QnzBcWx7KpRmYT2000example
```

## Design

There are several design concepts shared across all language implementations.

- Results are always guaranteed. Every batched request always comes with
a response. Each thumbnail request has its own `status` and description of
what happened. There can be failed results, but this is never an exception or
error. Even if the server is offline or there is a configuration error, a
placeholder and description will be provided.
- Thumbrella requests are made through a `Client` object. This coordinates all
the configuration and caching for requests. Creating client objects is free,
there is no network connections or operations until the first request.
- The `Result` and `Client` values have a `verify()` method that helps returned
failed operations into real errors. If successful this returns itself so
the instance can be chained to other operations.
-Clients default to a small, temporary cache in memory. This cache can
be customized, or combined with persistent caches. Each language and environment
provides its own caches. The cache can also be disabled.
- Batching requests is a key to efficiency. Group multiple thumbnails into a
single request. Batch requests can also be streamed, so results are immediately
available. This is the best design for interactive applications and use cases.
 Streaming requests also provide intermediate updates for thumbnails in-flight
for even better interactivity.

## Languages

Install the library for your language and make a first request. These examples
all requires `$TBR_CONNECT` from the environment.


### JavaScript

The [client package](https://www.npmjs.com/package/@thumbrella/client) is 
`@thumbrella/client` and is published to [npmjs](https://www.npmjs.com).

The Javascript library is actually written in Typescript, and provides a fully
typed interface for that environment.

There are no runtime dependencies for the Javascript library. It uses the
builtin `fetch` interface to interact with Thumbrella servers. All calls are
<code>async</code>.

```bash
npm install @thumbrella/client
```

```ts
import { writeFileSync } from "node:fs";
import { Client } from "@thumbrella/client";

const tbr = await new Client().verify();

// Simplified function for fetching a single thumbnail.
const result = await tbr.thumb("https://demo.thumbrella.dev/media/harbor-trucks.mp4");
const m = result.media;
if (!m) {
  console.error("Thumbnail failed:", result.status);
  process.exit(1);
}

console.log(`${m.kind}  ${m.fileSize.toLocaleString()} bytes  ->  ${m.thumbnail.length} bytes`);
writeFileSync("thumb.jpg", m.thumbnail.bytes);
```


### Python

The [client package](https://pypi.org/project/thumbrella-client/) is
`thumbrella-client` and is published to [pypi](https://pypi.org).

Most functionality in the Thumbrella client is not `async`, and uses
[requests](https://pypi.org/project/requests/) as the dependency for interacting
with Thumbrella servers.

When `async` is helpful it can be installed as an optional feature. Use
`thumbrella-client[async]`, which requires an additional dependency on
[aiohttp](https://pypi.org/project/aiohttp/).


```bash
uv add thumbrella-client
```

```python
import thumbrella
from pathlib import Path

tbr = thumbrella.Client()

# Simplified function for fetching a single thumbnail.
result = tbr.thumb("https://demo.thumbrella.dev/media/harbor-trucks.mp4")
media = result.verify().media

print(f"{media.kind}  {media.file_size:,} bytes  ->  {len(media.thumbnail):,} bytes")
Path("thumb.jpg").write_bytes(media.thumbnail.bytes)

# Or open directly in Pillow without a temporary file or copied data
from PIL import Image
img = Image.open(media.thumbnail.io)
print(img.mode, img.width, img.height)
```

The `thumbnail.io` property returns a file-like
[BytesIO](https://docs.python.org/3/library/io.html#io.BytesIO) object, so image
libraries like [Pillow](https://pillow.readthedocs.io) and
[OpenCV](https://opencv.org) can load thumbnails without writing to disk or
duplicating in memory.

### Rust

The [client package](https://crates.io/crates/thumbrella-client) is
`thumbrella-client` and is published to [crates.io](https://crates.io).

By default, all calls are `async`. The [requests](https://pypi.org/project/requests/) 
library is used to interact with Thumbrella servers.

An optional `blocking` feature is available which redefines the interface
to not be `async`. 

The package depends on other utility libraries like 
[serde](https://serde.rs/),  [base64](https://crates.io/crates/base64), and
[thiserror](https://github.com/dtolnay/thiserror).

```toml
# Cargo.toml
[dependencies]
thumbrella = "1"
tokio = { version = "1", features = ["full"] }
```

```rust
use std::fs;
use thumbrella::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let tbr = Client::new(None);
    tbr.verify().await?;

    // Simplified function for fetching a single thumbnail.
    let result = tbr.thumb("https://demo.thumbrella.dev/media/harbor-trucks.mp4").await?;
    if let Some(media) = &result.media {
        fs::write("thumb.jpg", media.thumbnail.bytes())?;
        println!(
            "{}  {:>8} bytes  ->  {} bytes  ({})",
            media.kind,
            media.file_size,
            media.thumbnail.len(),
            result.source,
        );
    }
    Ok(())
}
```

## Client

The `Client` object is the entry point for all thumbnail operations. It holds
the connection configuration, manages caching, and provides the methods for
requesting thumbnails.

### Construction

Create a client with an optional connect string. If no argument is provided,
the client reads `$TBR_CONNECT` from the environment.

```ts
// TypeScript
import { Client } from "@thumbrella/client";

const tbr = new Client(); // reads $TBR_CONNECT
const tbr = new Client("tbr_e_3QnzBcWx7KpRmYT2000example");
const tbr = new Client("http://localhost:3114");
```

```python
# Python
import thumbrella

tbr = thumbrella.Client()  # reads $TBR_CONNECT
tbr = thumbrella.Client("tbr_e_3QnzBcWx7KpRmYT2000example")
tbr = thumbrella.Client("http://localhost:3114")
```

```rust
// Rust
use thumbrella::Client;

let tbr = Client::new(None); // reads $TBR_CONNECT
let tbr = Client::new(Some("tbr_e_3QnzBcWx7KpRmYT2000example"));
let tbr = Client::new(Some("http://localhost:3114"));
```

Creating a `Client` is cheap — it does not open any network connections or
perform any I/O. The client is ready to use immediately after construction.

By default each client comes with a small, temporary memory cache. This can be
controlled by passing a stack of cache objects to the constructor. This array
of cache objects can be empty to disable caching. 

Applications that want control of the caches should instantiate them before
creating the client. The caches can be shared by multiple `Client` objects.

### Verify

Call `verify()` to confirm the server is reachable and the connection is valid.
This is useful at application startup to catch misconfiguration early, rather
than discovering it on the first thumbnail request.

On success this returns the `Client` object, which makes chaining or assignments
simpler.

What an error or exception means is different for each language.

```ts
const tbr = await new Client().verify();
```

```python
tbr = thumbrella.Client().verify()
```

```rust
let tbr = Client::new(None).verify().await?;
```

If verification fails, `verify()` raises an error (or returns a failed `Result`
in languages that use that pattern).

### Methods

The `Client` provides three main methods for requesting thumbnails. These are
all variations of the same data, requiring `url` string arguments for the media
and returning matching `Result` objects for each request.

| Method | Description |
|---|---|
| `thumb(url)` | Fetch a single thumbnail. Returns a `Result`. |
| `batch(urls)` | Fetch multiple thumbnails. Returns all results after every request completes. |
| `stream(urls)` | Fetch multiple thumbnails as a stream. Results arrive as soon as they are ready. |


## Result

Every thumbnail request returns a `Result`. Results are returned for every URL,
including failures. A placeholder image will always be returned for every request,
even if the server is unreachable or the file format is completely unknown.

:::note
In Rust the Thumbrella result object is named `ResultData` and does not
conflict with the language's standard `Result` for possibly failed values.
:::

The Result structure is split into two levels. The outer top level describes the
operation itself. An inner `media` field describes data that comes from the
remote media itself and the thumbnail. 

| Field | Type | Description |
|---|---|---|
| `url` | string | The original URL that was requested. |
| `status` | string | Outcome of this request. (`success` `failed` `overloaded` `intermediate`) |
| `source` | string | How the thumbnail was produced. (`render` `shortcut` `cache` `not_modified` `fallback` `placeholder`) |
| `message` | string | Human-readable detail, usually only set on failure. |
| `duration` | number | Wall-clock seconds to produce this result (fractional, e.g. `0.15`). |
| `downloadSize` | number | Bytes fetched from the upstream source. |
| `httpStatus` | number | HTTP status returned by the upstream source, if fetched. |
| `media` | object | The thumbnail and its metadata. `null` on total failure. |

## Media

The `media` object carries the stable, cacheable payload. Two results for the
same file share the same `media`, clients can compare fields to deduplicate.

| Field | Type | Description |
|---|---|---|
| `url` | string | Source URL that produced this thumbnail. |
| `thumbnail` | base64 | JPEG thumbnail, base64-encoded. |
| `kind` | string | Media category. (`image` `video` `audio` `document` `vector` `geometry` `archive` `text` `binary` `unknown`) |
| `extension` | string | Canonical file extension, no dot (e.g. `jpeg`, `png`, `pdf`). |
| `mime` | string | Sniffed MIME type (e.g. `image/jpeg`). |
| `fileSize` | number | `Content-Length` from the upstream server, or 0. |
| `placeholder` | string | Non-empty when the thumbnail is a fallback icon. Clients can compare this to deduplicate placeholder images. |
| `cache` | string | Cache token for round-tripping in an encoded format, empty means do not cache. |
| `properties` | object | Format-specific metadata. See below. |

`source` describes how the thumbnail was produced. `render` means a fresh
thumbnail was generated. `shortcut` means an embedded thumbnail inside the
source file was used (common for video and audio). `cache` and `not_modified`
mean the response came from a cache without re-rendering.

Client libraries will convert the `thumbnail` base64 information into a binary
or bytes representation appropriate for that language. The contents are usually
around 5kb to 10kb in size.

The internal media information is what gets cached by the client.

### Properties

The media `properties` object holds format-specific metadata. Many of the fields
are common across kinds where they have the same meaning. If a value cannot be
determined reliably it is omitted.

The values are always numbers. Some properties like "lossless" represent a
boolean value with a numeric `0` or `1`.

**Image**

| Field | Unit | Description |
|-------|------|-------------|
| `width` | px | Source pixel width (not the thumbnail). |
| `height` | px | Source pixel height. |
| `bpp` | bits | Colour bits per pixel, excluding alpha. Omitted when ambiguous. |
| `alpha` | bool | Has a transparency / alpha channel. |
| `lossless` | bool | Codec uses lossless compression. |

**Video**

| Field | Unit | Description |
|-------|------|-------------|
| `width` | px | Frame width. |
| `height` | px | Frame height. |
| `bpp` | bits | Colour bits per pixel, if known from the codec. |
| `duration` | sec | Playback duration. |
| `channels` | num | Audio track count. 0 if silent. |

**Audio**

| Field | Unit | Description |
|-------|------|-------------|
| `channels` | num | Audio channel count. 0 if silent. |
| `duration` | sec | Playback duration. |
| `lossless` | bool | Inferred from the file extension (flac, wav, aiff). |

**Geometry, Vector, Document, Archive, Text, Binary, Unknown**

These kinds currently have no properties.

## Batch Streaming

The server provides two ways to fetch multiple thumbnails in its `batch` operation.
In both cases the server will process all thumbnails concurrently, the only difference
is when and how the results are returned.

The client libraries will ensure every requested URL receives a `Result`
object. Even invalid requests or inaccessible servers will provide a
failure placeholder.

The behavior is controlled with the `Accepts:` HTTP header. In the client
libraries it is exposed as two separate methods, `batch()` and `stream()`.

The default `Accepts` is `application/json`, where the server collects all
results and returns them after every thumbnail has completed.
This can be convenient because each result is returned in the same order
as the requested urls.

The streaming mode is enabled with `Accept: application/x-ndjson`.
In this mode, the server does two additional things:

- Individual results are provided the moment they are ready, in arbitrary order.
- Intermediate results can be provided after a file has been identified but
  before using a complicated renderer for the item. These will use the
  `status: "intermediate"` value in the Result.


```ts
// TypeScript, stream multiple thumbnails with live progress
const tbr = await new Client().verify();

const urls = [
  "https://demo.thumbrella.dev/media/harbor-trucks.mp4",
  "https://demo.thumbrella.dev/media/space-colony.jpg",
  "https://demo.thumbrella.dev/media/city-newsletter.pdf",
];

for await (const result of tbr.stream(urls)) {
  if (result.status === "intermediate") continue; // placeholder in progress
  const kind = result.media
    ? `${result.media.kind}(${result.media.extension})`
    : "<nomedia>";
  console.log(`${result.status.padEnd(12)} ${kind.padEnd(16)} ${result.url}`);
}
```

```python
# Python, async streaming
import asyncio, thumbrella

async def main():
    tbr = thumbrella.Client().verify()
    urls = [
        "https://demo.thumbrella.dev/media/miss-library.avif",
        "https://demo.thumbrella.dev/media/wave-wall.svg",
    ]
    async with tbr:
        async for result in tbr.stream(urls):
            if result.status == "intermediate":
                continue
            kind = f"{result.media.kind}({result.media.extension})" if result.media else "<nomedia>"
            print(f"{result.status:<12} {kind:<16} {result.url}")

asyncio.run(main())
```

## Caching

Client libraries maintain a local cache of results keyed by URL. On the next
request for the same URL the client first checks whether its cached entry is
still fresh. If it is, the client returns the cached result immediately without
any network call.

By default clients use an in-memory cache that holds a few hundred icons.
Ideally a client will configure a persistent cache using one of the optional
cache backends provided by each language and environment.

The client caching is layered on top of server side caching. The two work
together quite well using packaged "cache strings". See the [server
caching](../server/#caching) section on ways to interact with these caches
directly. Client libraries handle all this automatically, which makes lookups
feel magically fast.

```python
# Python, persist cache strings across runs with a JSON file
import json, asyncio, thumbrella
from pathlib import Path

CACHE_FILE = Path("thumbrella_cache.json")

async def main():
    cache: dict[str, str] = {}
    try:
        cache = json.loads(CACHE_FILE.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        pass

    tbr = thumbrella.Client().verify()
    urls = ["https://demo.thumbrella.dev/media/padres-stereo.exr"]

    async with tbr:
        async for result in tbr.stream(urls):
            if result.media and result.media.cache:
                cache[result.url] = result.media.cache

    CACHE_FILE.write_text(json.dumps(cache))

asyncio.run(main())
```

See the [Server docs](../server/#caching) for how server-side caching interacts
with the client layer.


## See Also

- [Web Component](../components/) — Zero-config `<tbr-thumb>` custom element for browsers
- [HTTP API](../http-api/) — Direct HTTP interface for thumbnail generation
- [Server](../server/) — Server configuration, caching, and deployment
