## Why thumbnails matter

Previews load before users decide to click. A well-placed thumbnail can be the difference
between a media library that feels alive and one that feels like a wall of filenames.
Thumbrella turns that decision from an infrastructure project into a single API call.

## One URL, any media

Pass the source URL in the request path. Get a thumbnail back. No SDK required — a plain
`curl` or an `<img src>` tag is enough to start. The client libraries for JavaScript,
TypeScript, and Python add type safety and convenience but are entirely optional.

## Caching built in

Every response includes standard HTTP cache headers. The hosted service uses a global CDN.
Self-hosted binaries support optional on-disk SQLite caching with one extra config argument.
Re-requesting the same thumbnail is nearly free.

## Open source, no lock-in

Thumbrella is Apache 2 licensed. Read the code, fork it, self-host it permanently, or move
to the hosted service whenever it makes sense. The API is identical in every deployment mode.
