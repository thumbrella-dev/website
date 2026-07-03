---
title: Client
description: Making requests with client libraries
slug: docs/client
---

Thumbrella provides client libraries for TypeScript/JavaScript, Python, Rust.
Support for Go, Ruby, PHP, and more will be coming soon. These libraries handle
caching, streaming, error recovery, and other conveniences on top of the core
HTTP API.

There are also higher level clients that provide simple web components like
`<Thumbnail src="/media/welcome.pdf">`. These are the preferred way to integrate
Thumbrella into web based applications. At launch, these components are available
for React and Astro.

A client library is not required to use Thumbrella. The [HTTP API](#http-thumbnail-api) is
intentionally simple and works with any tool that can make an HTTP request —
curl, fetch, or the standard library of any language.

## Connect

Every client is configured through a **connect string**. The simplest form is a
Thumbrella Cloud token or a server URL:

```bash
# Cloud token — routes to Thumbrella Cloud automatically
export TBR_CONNECT=tbr_a_3QnzBcWx7KpRmYT2vLfJdE9sMhXuoG6i

# Self-hosted server
export TBR_CONNECT=http://localhost:3114

# Self-hosted server with a handshake secret
export TBR_CONNECT=http://localhost:3114,wafflecones

# Demo server — free, no account needed
export TBR_CONNECT=https://demo.thumbrella.dev
```

All client libraries read `$TBR_CONNECT` automatically when no explicit
connect string is provided. This makes it easy to point the same application
at a local server for development and Thumbrella Cloud for production without
touching application code.

The connection string can also apply arbitrary http headers to any server.
These are provided with comma separated values that define the header.
These will only be needed for connect strings that already provide a custom
server url.

```bash
export TBR_CONNECT=https://tbr.mycompany.net,x-credentials=secret,x-tool-name=frontpage
```

Custom servers can also define a special handshake token. This is simply passed
like the other http headers, but no `=` assignment is used, just the value.
The handshake and regular http headers can be combined.

```bash
export TBR_CONNECT=https://tbr.mycompany.net,secret-handshake-1
```


## Libraries

Install the library for your language and make a first request. Each example
below uses `$TBR_CONNECT` from the environment.


### TypeScript / JavaScript

```bash
npm install @thumbrella/client
```

```ts
import { writeFileSync } from "node:fs";
import { Client } from "@thumbrella/client";

const tbr = await new Client().verify();
const result = await tbr.thumb("https://demo.thumbrella.dev/media/harbor-trucks.mp4");

const m = result.media;
if (!m) {
  console.error("Thumbnail failed:", result.status);
  process.exit(1);
}

console.log(`${m.kind}  ${m.fileSize.toLocaleString()} bytes  ->  ${m.thumbnail.length} bytes`);
writeFileSync("thumb.jpg", m.thumbnail.bytes);
```

The `Client` constructor accepts an optional `connect` string. Without it the
client reads `$TBR_CONNECT`. `verify()` confirms the server is reachable before
making any thumbnail requests — useful at startup to catch misconfiguration
early.

### Python

```bash
uv add thumbrella
# or: pip install thumbrella
```

```python
import thumbrella
from pathlib import Path

tbr = thumbrella.Client().verify()
result = tbr.thumb("https://demo.thumbrella.dev/media/harbor-trucks.mp4")

m = result.media
if m is None:
    print("Thumbnail failed:", result.status)
    raise SystemExit(1)

print(f"{m.kind}  {m.file_size:,} bytes  ->  {len(m.thumbnail):,} bytes")
Path("thumb.jpg").write_bytes(m.thumbnail.bytes)

# Or open directly in Pillow without a temporary file
from PIL import Image
img = Image.open(m.thumbnail.io)
print(img.mode, img.width, img.height)
```

The Python client provides both a synchronous API (using `requests`) and an
async streaming interface (using `aiohttp`). The `thumbnail.io` property
returns a file-like `BytesIO` object, so image libraries like Pillow and
OpenCV can load thumbnails without writing to disk.

### Rust

```toml
# Cargo.toml
[dependencies]
thumbrella = "0.1"
tokio = { version = "1", features = ["full"] }
```

```rust
use std::fs;
use thumbrella::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let tbr = Client::new(None);
    tbr.verify().await?;

    let result = tbr.thumb("https://demo.thumbrella.dev/media/harbor-trucks.mp4").await?;
    if let Some(media) = &result.media {
        fs::write("thumb.jpg", media.thumbnail.bytes())?;
        println!(
            "{}  {:>8} bytes  ->  {} bytes  ({})",
            media.kind,
            media.file_size,
            media.thumbnail.len(),
            result.source.as_deref().unwrap_or("render"),
        );
    }
    Ok(())
}
```

`Client::new(None)` reads `$TBR_CONNECT` from the environment. Pass a string
directly to use a specific connect string.

## Result

Every thumbnail request returns a `Result`. Results are returned for every URL,
including failures. A placeholder image will always be returned for every request,
even if the server is unreachable or the file format is completely unknown.

The Result structure is split into two levels. The outer top level describes the
operation itself. An inner `media` field describes data that comes from the
remote media itself and the thumbnail. The media information is what a client
side cache will want to preserve.

| Field | Type | Description |
|---|---|---|
| `url` | string | The original URL that was requested. |
| `status` | string | An enumeration describing the status of each individual thumbnail. (`success` `failed` `overloaded` `intermediate` `unavailable`) |
| `source` | string | A descriptive explanation of what part of the pipeline provided this thumbnail. (`render` `shortcut` `cache` `not_modified` `fallback` `placeholder`) |
| `placeholder` | string? | When the thumbnail is a predefined placeholder image, a short slug will be used here to identify the placeholder type. For rich clients this can be used to deduplicate common, recurring images. |
| `message` | string? | Optional human-readable explanation, usually only set when there were failures or unusual conditions. |
| `duration` | number | The number of seconds to produce this result. This will often be a small fractional number like `.0015`. This time includes the full downloading and render time for this individual url. For cached results the value will be even smaller. |
| `downloadSize` | number | The number of bytes actually downloaded from the server. For many formats this will be the same as the total bytes in the file, which is provided in the `media` field`. Ideally it will be much smaller. |
| `media` | object | A nested structure with information from the remote media. |

The `media` field is present on all non-error results and holds the thumbnail
and metadata for the source file:

| Field | Type | Description |
|---|---|---|
| `url` | string | The original URL that was requested is duplicated onto the media structure. This simplifies tools that want to cache only the media information. |
| `thumbnail` | base64 | The JPEG thumbnail image encoded in base64. |
| `kind` | string | An enumeration of various file types recognized by Thumbrella. (`image` `video` `audio` `document` `vector` `geometry` `archive` `text` `unknown`) |
| `extension` | string | A consistent description of the file format or file extension. This will use a canonical name, for example, all forms of `jpg` or `jpe` filenames will be represented as `jpeg`. |
| `mime` | string | The registered MIME type of the source file |
| `fileSize` | number | Source file size in bytes |
| `properties` | object | Optional metadata (e.g. `width_pixels`, `height_pixels`) |
| `cache` | string? | Cache string for re-use on future requests |

`source` describes how the thumbnail was produced. `render` means a fresh
thumbnail was generated. `shortcut` means an embedded thumbnail inside the
source file was used (common for video and audio). `cache` and `not_modified`
mean the response came from a cache without re-rendering.

Client libraries will convert the `thumbnail` base64 information into a binary
or bytes representation appropriate for that language. The contents are usually
around 5kb to 10kb in size.

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

The streaming mode is enabled with `Accepts: application/ndjson` or `Accepts: xss-...`.
In this mode, the server does two additional things.

- Individual Results are provided the moment they are ready, in arbitrary order.
- Intermediate results can be provided after a file has been identified but before using a complicated renderer for the item. These will use the `status: "intermediate"` value in the Result.


```ts
// TypeScript — stream multiple thumbnails with live progress
const tbr = await new Client().verify();

const urls = [
  "https://demo.thumbrella.dev/media/harbor-trucks.mp4",
  "https://demo.thumbrella.dev/media/painting.jpg",
  "https://demo.thumbrella.dev/media/document.pdf",
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
# Python — async streaming
import asyncio, thumbrella

async def main():
    tbr = thumbrella.Client().verify()
    urls = [
        "https://demo.thumbrella.dev/media/harbor-trucks.mp4",
        "https://demo.thumbrella.dev/media/painting.jpg",
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

The client caching is layered on top of any server side caching. The two work
together quite well using packaged "cache strings". See the [server caching](../server/#caching)
section on ways to interact with these caches directly. Client libraries will
handle all this automatically.

```python
# Python — persist cache strings across runs with a JSON file
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
    urls = ["https://demo.thumbrella.dev/media/harbor-trucks.mp4"]

    async with tbr:
        async for result in tbr.stream(urls):
            if result.media and result.media.cache:
                cache[result.url] = result.media.cache

    CACHE_FILE.write_text(json.dumps(cache))

asyncio.run(main())
```

See the [Server docs](../server/#caching) for how server-side caching interacts
with the client layer.

## HTTP Thumbnail API

There are two URLs used to look up thumbnails.

### `GET /thumb.jpeg?url=<url>`

The Thumbrella provides a light weight simple url for basic HTTP requests.
This is a subset of the functionality in the other calls. It is a useful
tool for simple one-off requests or testing. Interactive applications should
prefer to use the other `/batch` call.

Returns a JPEG thumbnail as the response body. The simplest possible request.
There is no way to use client side caching with this call, but the Thumbrella
server can still handle caching the results.

```bash
curl "http://localhost:3114/thumb.jpeg?url=https://example.com/photo.jpg" \
     --output thumb.jpg
```

Pass a handshake header for servers that require one:

```bash
curl -H "x-tbr-handshake: wafflecones" \
     "http://localhost:3114/thumb.jpeg?url=https://example.com/photo.jpg" \
     --output thumb.jpg
```

### `POST /batch`

This is the primary url for interacting with Thumbrella. It is a POST
request that requires a simple json uploaded body to define the requests.

The `Accepts:` HTTP header controls if the results are returned in a
single json batch, or incrementally streamed through various streaming
formats. See the [stream section](#batch-streaming) section for more
streaming details.

```bash
curl -s http://localhost:3114/batch \
     -H "Content-Type: application/json" \
     -H "Accept: application/x-ndjson" \
     -d '{"items": [{"url": "https://example.com/photo.jpg"}]}' \
  | jq -c 'del(.media.thumbnail)'
```

The uploaded JSON body must be an object with an `items` field that is a
list of objects. Each object must have an `url` field, and can optionally
contain a `cache` string.

The server will always generate a response for each url. Be aware that if passing
a `cache` value it is possible the server will respond with `status: "not_modified"`
for that URL.

```json
{
    "items": [
        {"url": "https://demo.thumbrella.dev/media/golden-gate.exr"},
        {"url": "https://demo.thumbrella.dev/media/game-level.png", "cache": "beef:AAA"},
        {"url": "https://demo.thumbrella.dev/media/miss-library.avif"}
    ]
}
```

The batch mode returns a single JSON object with a result for each provided URL,
in the same order as requested.

```json
{
    "items": [
        {"url": "https://demo.thumbrella.dev/media/golden-gate.exr", "status": "success", ...},
        {"url": "https://demo.thumbrella.dev/media/game-level.png", "status": "not-modified"},
        {"url": "https://demo.thumbrella.dev/media/miss-library.avif", "status": "failed", ...},
    ]
}
```

## HTTP Utility API

### `GET /health`

Returns a small JSON object confirming the server is running:

```json
{"status": "ok", "thumbrella": 1}
```

Client libraries use this endpoint during `verify()` to confirm the connection
is valid.

The `"thumbrella"` field contains the major version of the Thumbrella server.
(Currently it returns `0` while the project is in prerelease.)

The Thumbrella Cloud server provides an additional `"token": boolean` field to
this object. This will confirm if the provided authentication token is valid.

When running a custom server with a `TBR_HANDSHAKE` defined, this url
will respond with status 4XX when the handshake is invalid.


## Components

Higher-level components are available for browser environments that wrap the
client library and integrate with framework conventions.

- **Astro** — an `<Image>` component that requests thumbnails at build time or
  on the edge and renders them inline.
- **React** — a `<Thumbnail>` component that lazily fetches thumbnails from a
  Thumbrella server and handles loading and error states.

These components are in the [clients repository](https://github.com/thumbrella-dev/clients)
alongside the core libraries. They handle the client connection, result
rendering, and placeholder display so no direct client API usage is needed for
standard UI cases.
