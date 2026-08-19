---
title: HTTP API
description: Direct HTTP interface for thumbnail generation
slug: docs/http-api
---

The Thumbrella HTTP API is intentionally simple and works with any tool that
can make an HTTP request: [curl](https://curl.se),
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), or the
standard library of any language.

Client libraries for [TypeScript](../client/), [Python](../client/), and
[Rust](../client/) provide convenient wrappers around this API with built-in
caching, streaming, and error handling. For most use cases, a client library is
the easiest path. But the HTTP API is fully capable on its own.


## Thumbnail Endpoints

There are two endpoints for generating thumbnails.

### `GET /thumb.jpeg`

A lightweight endpoint for simple one-off requests. Returns a JPEG thumbnail
as the response body.

```bash
curl http://localhost:3114/thumb.jpeg \
  --data-urlencode "url=https://demo.thumbrella.dev/media/raw-canon.cr2" \
  --output thumb.jpeg
```

**Query parameters**

| Parameter | Description |
|---|---|
| `url` | The URL of the media to thumbnail. Required. |

**Response**

- `200 OK` — JPEG thumbnail in the response body
- `4XX` — Invalid request (missing URL, bad handshake, etc.)
- `5XX` — Server error

This endpoint is useful for testing and simple integrations. It does not
support client-side caching or batch requests. For those features, use
[`POST /batch`](#post-batch).

**Handshake authentication**

If the server requires a handshake token, pass it as a header:

```bash
curl http://localhost:3114/thumb.jpeg \
  --data-urlencode "url=https://demo.thumbrella.dev/media/game-level.png" \
  -H "x-tbr-handshake: wafflecones" \
  --output thumb.jpg
```

### `POST /batch`

The primary endpoint for thumbnail generation. Accepts a JSON body with
multiple URLs and returns thumbnails for each. Supports both batch and
streaming response modes.

The server accepts at most **12 items** per request. Items beyond the
limit are returned with `status: "batchlimit"` — clients should split
larger batches across multiple requests. The request body is also capped
at **256 KB**; oversized payloads receive an immediate `413`.

**Request**

```bash
curl -s http://localhost:3114/batch \
     -H "Content-Type: application/json" \
     -d '{"items": [{"url": "https://demo.thumbrella.dev/media/golden-gate.exr"}]}'
```

**Request body**

The request body must be a JSON object with an `items` field containing an
array of objects. Each object must have a `url` field and can optionally
include a `cache` string for client-side caching.

```json
{
  "items": [
    {"url": "https://demo.thumbrella.dev/media/golden-gate.exr"},
    {"url": "https://demo.thumbrella.dev/media/game-level.png", "cache": "beef:AAA"},
    {"url": "https://demo.thumbrella.dev/media/miss-library.avif"}
  ]
}
```

**Response modes**

The `Accept` header controls how results are returned.

#### Batch mode (default)

With `Accept: application/json` (the default), the server collects all results
and returns them as a single JSON array after every thumbnail has completed.
Results are returned in the same order as the requested URLs.

```bash
curl -s http://localhost:3114/batch \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"items": [{"url": "https://demo.thumbrella.dev/media/photo.jpg"}]}'
```

```json
{
  "items": [
    {
      "url": "https://demo.thumbrella.dev/media/photo.jpg",
      "status": "success",
      "source": "render",
      "media": {
        "kind": "image",
        "extension": "jpeg",
        "thumbnail": "/9j/4AAQSkZJRgABAQ...",
        ...
      }
    }
  ]
}
```

#### Streaming mode

With `Accept: application/x-ndjson`, the server streams results as
newline-delimited JSON. Each line is a complete result object. Results arrive
as soon as they are ready, in arbitrary order.

```bash
curl -s http://localhost:3114/batch \
     -H "Content-Type: application/json" \
     -H "Accept: application/x-ndjson" \
     -d '{"items": [{"url": "https://demo.thumbrella.dev/media/video.mp4"}]}'
```

```
{"url":"https://demo.thumbrella.dev/media/video.mp4","status":"intermediate",...}
{"url":"https://demo.thumbrella.dev/media/video.mp4","status":"success",...}
```

Streaming mode provides two additional features:

1. **Immediate results** — Each thumbnail is returned the moment it completes,
   rather than waiting for all thumbnails to finish.
2. **Intermediate results** — The server may send intermediate results with
   `status: "intermediate"` before the final thumbnail is ready. These contain
   placeholder images or quick previews.

Streaming is ideal for large batches or when you want to display progress as
thumbnails are generated.


## Result Format

Every thumbnail request returns a result object. Results are returned for every
URL, including failures. A placeholder image is always provided, even if the
server is unreachable or the file format is completely unknown.

The result structure has two levels. The outer level describes the operation
itself. An inner `media` field describes the thumbnail and its metadata.

### Top-level fields

| Field | Type | Description |
|---|---|---|
| `url` | string | The original URL that was requested. |
| `status` | string | Outcome of this request: `success`, `failed`, `overloaded`, `intermediate`, or `batchlimit`. |
| `source` | string | How the thumbnail was produced: `render`, `shortcut`, `cache`, `not_modified`, `fallback`, or `placeholder`. |
| `message` | string | Human-readable detail, usually only set on failure. |
| `duration` | number | Wall-clock seconds to produce this result (fractional, e.g. `0.15`). |
| `downloadSize` | number | Bytes fetched from the upstream source. |
| `httpStatus` | number | HTTP status returned by the upstream source, if fetched. |
| `media` | object | The thumbnail and its metadata. `null` on total failure. |

The `source` field describes how the thumbnail was produced:

- `render` — A fresh thumbnail was generated.
- `shortcut` — An embedded thumbnail inside the source file was used (common for video and audio).
- `cache` — The response came from a cache without re-rendering.
- `not_modified` — The client provided a cache token and the server confirmed the cached result is still valid.
- `fallback` — A fallback icon was used because the source could not be processed.
- `placeholder` — A generic placeholder icon was used.


### Media fields

The `media` object carries the stable, cacheable payload. Two results for the
same file share the same `media`, so clients can compare fields to deduplicate.


| Field | Type | Description |
|---|---|---|
| `url` | string | Source URL that produced this thumbnail. |
| `thumbnail` | string | JPEG thumbnail, base64-encoded. |
| `kind` | string | Media category: `image`, `video`, `audio`, `document`, `vector`, `geometry`, `archive`, `text`, `binary`, or `unknown`. |
| `extension` | string | Canonical file extension, no dot (e.g. `jpeg`, `png`, `pdf`). |
| `mime` | string | Sniffed MIME type (e.g. `image/jpeg`). |
| `fileSize` | number | `Content-Length` from the upstream server, or 0. |
| `placeholder` | string | Non-empty when the thumbnail is a fallback icon. Clients can compare this to deduplicate placeholder images. |
| `cache` | string | Cache token for round-tripping in an encoded format. Empty means do not cache. |
| `properties` | object | Format-specific metadata. See below. |

Client libraries typically decode the base64 `thumbnail` into a binary or bytes
representation appropriate for the language. Thumbnails are usually 5 KB to
10 KB in size.

When client libraries cache thumbnail results, they store only the `media`
level data, not the full result.

### Properties

The `media.properties` object holds format-specific metadata. Many fields are
common across kinds where they have the same meaning. If a value cannot be
determined reliably, it is omitted.

Boolean values are represented as numeric `0` or `1`.

**Image**

| Field | Unit | Description |
|---|---|---|
| `width` | px | Source pixel width (not the thumbnail). |
| `height` | px | Source pixel height. |
| `bpp` | bits | Colour bits per pixel, excluding alpha. Omitted when ambiguous. |
| `alpha` | bool | Has a transparency / alpha channel. |
| `lossless` | bool | Codec uses lossless compression. |

**Video**

| Field | Unit | Description |
|---|---|---|
| `width` | px | Frame width. |
| `height` | px | Frame height. |
| `bpp` | bits | Colour bits per pixel, if known from the codec. |
| `duration` | sec | Playback duration. |
| `channels` | num | Audio track count. 0 if silent. |

**Audio**

| Field | Unit | Description |
|---|---|---|
| `channels` | num | Audio channel count. 0 if silent. |
| `duration` | sec | Playback duration. |
| `lossless` | bool | Inferred from the file extension (flac, wav, aiff). |

**Document**

| Field | Unit | Description |
|---|---|---|
| `pages` | num | Number of pages in document. |


**Geometry, Vector, Archive, Text, Binary, Unknown**

These kinds currently have no properties.


## Utility Endpoints

### `GET /health`

Returns a small JSON object confirming the server is running:

```json
{"status": "ok", "thumbrella": 1}
```

Client libraries use this endpoint during `verify()` to confirm the connection
is valid.

The `thumbrella` field contains the major version of the Thumbrella server.

**Thumbrella Cloud**

The Thumbrella Cloud server provides an additional `token` field:

```json
{"status": "ok", "thumbrella": 1, "token": true}
```

This confirms whether the provided authentication token is valid. The health
endpoint works even without a valid authentication token.

**Handshake authentication**

When running a custom server with `TBR_HANDSHAKE` defined, this endpoint
returns a 4XX status when the handshake is invalid.


## Error Handling

The API uses standard HTTP status codes:

- `200 OK` — Request succeeded. The response body contains the thumbnail or result object.
- `400 Bad Request` — Invalid request (missing URL, malformed JSON, etc.).
- `401 Unauthorized` — Invalid or missing authentication token (Thumbrella Cloud).
- `403 Forbidden` — Invalid handshake token.
- `413 Payload Too Large` — Request body exceeds the 256 KB limit.
- `429 Too Many Requests` — Rate limit exceeded.
- `500 Internal Server Error` — Server error.
- `503 Service Unavailable` — Server is temporarily overloaded.

Every result object includes a `status` field that provides more detail:

- `success` — Thumbnail generated successfully.
- `failed` — The request failed (bad URL, unsupported format, etc.).
- `overloaded` — The server is temporarily overloaded.
- `intermediate` — An intermediate result (streaming mode only).
- `batchlimit` — The batch exceeded the per-request limit of 12 items; resend in smaller batches.

The `message` field contains a human-readable description of the failure, if
any.


## Examples

### Single thumbnail with curl

```bash
curl http://localhost:3114/thumb.jpeg \
  --data-urlencode "url=https://demo.thumbrella.dev/media/photo.jpg" \
  --output thumb.jpg
```

### Batch request with curl

```bash
curl -s http://localhost:3114/batch \
     -H "Content-Type: application/json" \
     -d '{
       "items": [
         {"url": "https://demo.thumbrella.dev/media/photo.jpg"},
         {"url": "https://demo.thumbrella.dev/media/video.mp4"}
       ]
     }' | jq '.items[] | {url, status, kind: .media.kind}'
```

### Streaming with curl

```bash
curl -s http://localhost:3114/batch \
     -H "Content-Type: application/json" \
     -H "Accept: application/x-ndjson" \
     -d '{
       "items": [
         {"url": "https://demo.thumbrella.dev/media/photo.jpg"},
         {"url": "https://demo.thumbrella.dev/media/video.mp4"}
       ]
     }' | while read -r line; do
       echo "$line" | jq -c '{url, status}'
     done
```

### Python with requests

```python
import requests

response = requests.post(
    "http://localhost:3114/batch",
    json={"items": [{"url": "https://demo.thumbrella.dev/media/photo.jpg"}]}
)

result = response.json()["items"][0]
print(result["status"], result["media"]["kind"])
```

### JavaScript with fetch

```javascript
const response = await fetch("http://localhost:3114/batch", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    items: [{url: "https://demo.thumbrella.dev/media/photo.jpg"}]
  })
});

const data = await response.json();
const result = data.items[0];
console.log(result.status, result.media.kind);
```


## See Also

- [Client Libraries](../client/) — Convenient wrappers with caching, streaming, and error handling
- [Web Component](../components/) — Zero-config `<tbr-thumb>` custom element for browsers
- [Server](../server/) — Server configuration, caching, and deployment
