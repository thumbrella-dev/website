---
title: Server
description: Self hosting Thumbrella servers
slug: docs/server
---

The Thumbrella executable is the server. It can be downloaded directly from
[releases](https://github.com/thumbrella-dev/thumbrella/releases) or built from
source. For most users, the easiest path is to run it through a prebuilt
package. The server runs on Windows, macOS, and Linux, or anywhere
[Rust](https://rust-lang.org) can produce a runnable binary.

```bash
# Run with npx (Node)
npx @thumbrella/server serve

# Run with uvx (Python)
uvx thumbrella-server serve

# Run with Docker
docker run -p 3114:3114 -it --rm thumbrella/server

# Run from source (Rust)
git clone https://github.com/thumbrella-dev/thumbrella
cd thumbrella
cargo run serve
```


## Command Line

The Thumbrella executable provides several subcommands beyond the standard
web server. Any subcommand accepts `--help` for further details.

- `thumbrella version` Shows a quick message describing the version information
  for the build.
- `thumbrella help` Shows a quick summary of the various subcommands available.
- `thumbrella check` Runs a lightweight set of diagnostics and settings for the
  server. This will show the primary environment variable settings or their
  defaults. It will also run several checks to determine if the server is ready
  to run with the given environment.
- `thumbrella formats` Generates a larger report of all the formats Thumbrella
  supports. Not all will be available in all environments.
- `thumbrella license` Report license and information about dependencies.
- `thumbrella thumb` generates a single thumbnail for an input file or url. This
  requires an output path to save the generated jpeg image.
- `thumbrella serve` runs the primary server. It includes built-in hints and
  diagnostics to help with onboarding.


## Configuration

The server is configured through several environment variables. The default
values should be valid for a variety of use cases and getting started. The
server can be further tuned with these.

| Environment Variable | Default Value | Description |
|---|---|---|
| `TBR_PORT` | `3114` | The port the server will listen on. |
| `TBR_LOG` | `standard` | A level of stdout reporting the server makes. (`standard` `minimal` `full`) |
| `TBR_ALLOW_LOCAL` | `0` | Boolean that allows file paths or localhost URLs. (`0` `1` `false` `true`) |
| `TBR_HANDSHAKE` | <none> | Private token required as a custom HTTP header on every request. |
| `TBR_TRACE` | <none> | File path to append more detailed logging output. |
| `TBR_CACHE` | `mem:` (100 MB) | Cache backend definition (`mem:`, `sqlite:`, `none:`). |
| `TBR_SCRATCH` | `$TMP/thumbrella` | A location on disk to download temporary files into. |

Be aware that some of these settings may not make sense or even break things
inside the docker environment.

There are several more specialized environment variables that won't be needed for
most self hosted services.

| Specialized Variable | Default Value | Description |
|---|---|---|
| `TBR_TIER2` | <none> | Connection string to a separate Thumbrella server for tier2. |
| `TBR_TIER3` | <none> | Connection string to a separate Thumbrella server for tier3. |


## Handshake

Each server can define a secret handshake via the `$TBR_HANDSHAKE` environment
variable. Clients must provide this value with every request. It helps mitigate
unwanted traffic on directly exposed Thumbrella servers.

Consider a command like `openssl rand -base64 24` to generate a secure
random token. Or just pick your favorite word, it's your handshake. The server will
reject any request that does not include this value as a custom HTTP header.

Clients will need to include this handshake in their connect string to access
the server. When the server starts up it will show an example value of the
connect string clients should use (although most of the handshake value will be
masked out).

```bash
# Start a server with a secret handshake
TBR_HANDSHAKE=wafflecones thumbrella serve

# Clients should set a connect string that includes the server url and a comma
# separated handshake
TBR_CONNECT=http://localhost:3114,wafflecones npm run thumbclient
```

The handshake value must not look like a Thumbrella Cloud API token (i.e.
starting with `tbr_`). The server will reject such values at startup to avoid
confusion about where each kind of credential belongs.


## Caching

The server includes a **short-term sticky cache** (5 seconds) with
**request coalescing** built in. When two identical requests arrive
within 5 seconds, only one fetches the remote source, the second is
served from the sticky cache. This is always active.

With default settings the server also enables a 100 MB in-memory LRU
cache. Set `TBR_CACHE` to customise or disable it.

Thumbrella respects upstream HTTP caching:
- `Cache-Control: no-store` and `private` responses are **not** stored
  in durable backends (they still pass through the 5 s sticky cache for
  request deduplication).
- `Cache-Control: max-age` and `s-maxage` are captured and returned to
  clients as freshness hints.
- `ETag` and `Last-Modified` are used for conditional revalidation.

`$TBR_CACHE` selects a single cache backend:

| Backend | Format | Persistence | Examples |
|---|---|---|---|
| **Memory** | `mem:` | No | `mem:`, `mem:200mb`, `mem:2gb`, `mem:500` (entries) |
| **[SQLite](https://sqlite.org)** | `sqlite:` | Yes | `sqlite:cache.db`, `sqlite:/var/cache.db#1gb` |
| **Cloud** | `cloud:` | Yes (shared) | `cloud:tbr_s_AbCd...` (your cloud API token) |
| **None** | `none:` | — | Disables all caching |

Any cache backend can be sized by appending a limit: `mem:500mb`, `sqlite:db#2gb`.
Memory cache defaults to 100 MB. SQLite evicts oldest entries when over the byte
limit and purges expired entries on write, no manual maintenance needed. See
the [Cloud docs](/docs/cloud/#global-cache) for details on the cloud cache
backend.

Every cache entry has an expiration timestamp. By default upstream
`Cache-Control: max-age` / `s-maxage` sets the TTL, capped at 7 days
(`TBR_CACHE_MAX_TTL`). When the upstream provides no hints, entries
default to 1 hour (`TBR_CACHE_DEFAULT_TTL`).


### Cache String

A cache string is a compact encoding of cache information. An example looks like
this.

```
6a46337d:AAAkIjE2ODcxOTc4MTcuMzY0NjkzLTEzMjA2OC01MTI5NTY2MDkiAA
```

The data is broken into two parts, separated by the first colon. The cache
string will always have at least one colon with some characters before and
after.

- The first part represents a hexadecimal timestamp (utc time) that represents
  when the cache freshness will expire. Any time before the expiration is
  considered fresh. Clients should not need to query thumbrella for a new
  thumbnail any time before this value.
- The second part is a simple encoding of the remaining http headers needed
  for the server to request a new thumbnail. This second part is not intended
  to be interpreted or parsed in any way. It is internal data to the server.

A few additional notes about this cache string:

- Cache string will be url safe and not require escaping in urls or command line arguments.
- There could potentially be additional colons after the first.
  - Only the first one should be used to isolate the freshness expiration.

The existing client libraries will handle all this automatically. If accessing
the thumbrella server directly, simply pass this opaque string back to the
server on a request where your client is keeping its own results cache.

Server results store this cache value in the nested "media", "cache" field.
It is possible for this cache value to be `null` when the remote server provides
no caching information.


## Troubleshooting

If the server fails to start or behaves unexpectedly, run the `check`
subcommand first. It evaluates the environment variables that configure the
server and reports whether each value is valid.

```bash
thumbrella check
```

Common issues and solutions:

| Symptom | Likely cause | Fix |
|---|---|---|
| "address in use" | Port `3114` already bound | Set `TBR_PORT` to a different port |
| Rejected requests | Missing [handshake](#handshake) | Include handshake in client connect string |
| Missing formats | External tools not installed | Install `ffmpeg`, `f3d`, etc.; run `thumbrella formats` |
| Repeated rerendering | Default cache is small | Set `TBR_CACHE=mem:200mb` for a larger memory cache. Also consider `sqlite:` to make the cache persistent. |
| File paths blocked | Configuration not allowed by default | Set `TBR_ALLOW_LOCAL=1` to allow `file://` URLs |

A running server can be checked by testing the `/health` endpoint:

```bash
curl http://localhost:3114/health
# {"status": "ok", "thumbrella": 1}
```

### Docker troubleshooting

When running in Docker, the server cannot access `localhost` on the host.
Use `host.docker.internal` (Docker Desktop) or `--network host` (Linux) to
reach services on the host. The scratch directory (`TBR_SCRATCH`) should be
a mounted volume for temporary file storage.

External tools like `oiiotool` and `f3d` are not included in the base Docker
image. Use the [sponsor edition](/docs/sponsor/) Docker image for a
pre-configured environment with all optional renderers.


## External Formats

The Thumbrella executable comes with support for a wide range of image, video,
and other formats. These are built in statically and will work on any system
in any kind of environment.

Thumbrella also supports using sandboxed external programs to do processing.
These are used for 3D renders, and even [FFmpeg](https://ffmpeg.org) for some
of the more advanced video formats.

To enable these formats and features the following commands must be available
in the environment that runs the server. Some of these tools will require
access to hardware (or software) frame buffers and graphics libraries. The
server will check for the commands at startup and report which are available.

These external tools and libraries are entirely optional. The server will start
and run without them. Use the `formats` and `check` subcommands to get further
details.

| Dependency | Type | Tool | Formats |
|---------|------|--------------|---------------|
| [FFmpeg](https://ffmpeg.org) | CLI | `ffmpeg` | Additional images and videos |
| [OpenImageIO](https://openimageio.org) | CLI | `oiiotool` | Extended image formats |
| [F3D](https://f3d.app) | CLI | `f3d` | 3D geometry formats |
| [OpenUSD](https://openusd.org) | Python | `usd_core` | 3D USD models |


## Build yourself

The Rust server is designed to be simple to build from source. The user will
need to either set `$FFMPEG_DIR` to an ffmpeg build path, or use one of the
provided ffmpeg build scripts for your platform.

```sh
git clone https://github.com/thumbrella-dev/thumbrella && cd thumbrella
bash ffs/build-linux.sh  (or `powershell -File ffs/build-windows.ps1` on Win)
cargo run --release
```

