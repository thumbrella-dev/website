---
title: Server
description: Self hosting Thumbrella servers
slug: docs/server
---

The Thumbrella is a self contained executable binary. It is built for Windows
and Linux machines and published through a variety of packaging systems. The
[Docker section](#docker) provides an excellent way to run the server
on even more platforms.

The server can be downloaded directly from [Github
Releases](https://github.com/thumbrella-dev/thumbrella/releases) or built from
source. Read the [installers section](#installation) to learn how to manage your
own installation. 


## Command Line

The Thumbrella executable provides several subcommands beyond the standard
web server. Any subcommand accepts `--help` for further details.

- `thumbrella serve` runs the primary server. It includes built-in hints and
  diagnostics to help with onboarding.
- `thumbrella thumb <input> <output>` Generates a single thumbnail for an input
  file or URL and writes the JPEG to the given output path.
- `thumbrella result <url>...` Thumbnails one or more files or URLs and prints
  the result metadata as JSON. Add `--raw` to include the full base64 thumbnail.
- `thumbrella formats` Generates a larger report of all the formats Thumbrella
  supports. Not all will be available in all environments.
- `thumbrella check` Runs a lightweight set of diagnostics and settings for the
  server. This will show the primary environment variable settings or their
  defaults. It will also run several checks to determine if the server is ready
  to run with the given environment.
- `thumbrella license` Report license and information about dependencies.
- `thumbrella service` Prints deployment config files: a Docker Compose
  file, a systemd unit, and Windows service instructions. Add an alias to
  print one, and `--write` to save it to a file.
- `thumbrella version` Shows a quick message describing the version information
  for the build.
- `thumbrella help` Shows a quick summary of the various subcommands available.


## Installation

There are a handful of ways to install and maintain the server for each
platform. This simplest is downloading an archive directly from the [Github
Releases](https://github.com/thumbrella-dev/thumbrella/releases). These will
always be the most up to date, but may not be convenient to install and 
maintain.

Currently only Windows and Linux builds are provided for `x64` cpus. The 
[Docker](#docker) image is an excellent way to run and manage
Thumbrella on more platforms.

See the [Attestation section](#attestation) for details on how to validate
the authenticity of your executables.


### Winget

Windows includes an excellent packaging system through 
[winget](https://learn.microsoft.com/en-us/windows/package-manager/). The 
Thumbrella version through `winget` may lag slightly behind other releases, 
as it goes through additional validation steps.

```sh
winget install Thumbrella.Server
thumbrella version
thumbrella serve
```

### Npm

The packaged server binaries are also distributed through 
[Npmjs](https://npmjs.com). This makes running a server trivial on Windows and 
Linux where any version of Node is ready.

```sh
npx --yes @thumbrella/server version
npx @thumbrella/server serve
```

### Cargo binstall

The excellent [binstall](https://github.com/cargo-bins/cargo-binstall) plugin
for Rust's Cargo allows managing packages through Cargo without the time 
consuming builds.

The Thumbrella server is not listed on [crates.io](https://crates.io), but
can be installed directly through it's git repository. This works on both
Windows and Linux.

```sh
cargo binstall thumbrella --git https://github.com/thumbrella-dev/thumbrella
thumbrella version
thumbrella serve
```

### Build yourself

The Rust server is designed to be simple to build from source. 

The process isn't quite automatic because a static build of parts of ffmpeg is 
included in the process, and will not be built automatically. A user can refer
to an existing build of ffmpeg by setting the `$FFMPEG_DIR` directory. 
Otherwise, the Thumbrella build process will guide the user through creating
the needed code. Be aware that building static ffmpeg code can take 10-20
minutes depending on computer.

```sh
git clone https://github.com/thumbrella-dev/thumbrella
cd thumbrella
bash ffs/build-linux.sh                  # on Linux
powershell -File ffs/build-windows.ps1`  # on Windows
cargo run version                        
cargo run serve                          # Optionally `run --release`
```


## Configuration

The server is configured through several environment variables. The default
values should be valid for a variety of use cases and getting started. The
server can be further tuned with these.

| Environment Variable | Default Value | Description |
|---|---|---|
| `TBR_PORT` | `3114` | The port the server will listen on. |
| `TBR_LOG` | `standard` | A level of stdout reporting the server makes. (`standard` `minimal` `full`) |
| `TBR_LOCAL` | `0` | Boolean that allows file paths or localhost URLs. (`0` `1` `false` `true`) |
| `TBR_CACHE` | `mem:100mb` | Cache backend spec - chain links with `+` (`none`, `mem:size`, `sqlite:path[,size]`, `cloud:token`). |
| `TBR_PIN` | `604800` | (7 days) The TTL for pin urls, or `0` to disable.
| `TBR_HANDSHAKE` | <none> | Private token required as a custom HTTP header on every request. |
| `TBR_TRACE` | <none> | Trace sink `ndjson:<path>` to append more detailed logging output. |
| `TBR_SCRATCH` | `$TMP/thumbrella` | A location on disk to download temporary files into. |
| `TBR_TIER2` | <none> | Connection string to a separate Thumbrella server for tier2. |
| `TBR_TIER3` | <none> | Connection string to a separate Thumbrella server for tier3. |

Be aware that some of these settings may not make sense or even break things
inside the docker environment.

### Filesystem Paths

Paths in `TBR_SCRATCH`, `TBR_TRACE=ndjson:<path>`, and
`TBR_CACHE=sqlite:<path>[,size]` support `~` and `~/...` for the current
user's home, plus `$VAR` and `${VAR}` for environment variables. Windows
also supports `%VAR%` and `~\...`. Unset variables, malformed `${VAR}`
references, and empty expanded paths produce configuration errors instead
of silently creating files with literal variable names.

Use `$$` for a literal dollar sign, and `%%` for a literal percent sign on
Windows. Expansion is single-pass, without shell execution or recursive
substitution. Relative paths stay relative, and expansion does not require
the file to exist. Cloud tokens, handoff URLs, and media request URLs are
not expanded. Expanded values containing `+` or `,` remain part of the
SQLite filename, not additional cache directives.

For example, quote values to keep your shell from expanding them first:

```sh
export TBR_SCRATCH='${DATA_DIR}/thumbrella'
export TBR_TRACE='ndjson:~/trace.ndjson'
export TBR_CACHE='mem:100mb+sqlite:${DATA_DIR}/cache.db,1gb'
```


### Internal Variables

The server is built on standard Rust runtime components, and a few of their
environment variables can be useful in special situations.

| Environment Variable | Description |
|---|---|
| `NO_COLOR` | Disable ANSI colour codes in server output. Useful when logs go to journald or a file. Honored directly by the server. |
| `RUST_BACKTRACE` | Set to `1` to print a stack trace if the server panics. Useful for bug reports. |
| `SSL_CERT_FILE` | Path to a CA bundle, for fetching sources over HTTPS signed by an internal or corporate CA. |
| `TOKIO_WORKER_THREADS` | Number of worker threads. Useful inside CPU-limited containers, where the default (one per host core) can oversubscribe. |
| `RUST_LOG` | Low-level log filter for internal crates. `TBR_LOG` is the supported setting for server output. |

Most of these are inherited from the Rust runtime rather than implemented by
Thumbrella. They are not part of any stable or promised API and may change or
be removed in future releases.


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
cache. Set `TBR_CACHE` to customise or disable it. An empty value behaves
like an unset one (the default memory cache); use `none` to disable caching
entirely.

Thumbrella respects upstream HTTP caching:
- `Cache-Control: no-store` and `private` responses are **not** stored
  in durable backends (they still pass through the 5 s sticky cache for
  request deduplication).
- `Cache-Control: max-age` and `s-maxage` are captured and returned to
  clients as freshness hints.
- `ETag` and `Last-Modified` are used for conditional revalidation.

`$TBR_CACHE` selects the cache backend(s). Chain multiple backends with `+`,
fastest first — a chain reads each tier in order and writes to every tier, e.g.
`mem:64mb+sqlite:/var/cache.db,1gb`.

| Backend | Format | Persistence | Examples |
|---|---|---|---|
| **Memory** | `mem` | No | `mem`, `mem:200mb`, `mem:2gb`, `mem:500` (entries) |
| **[SQLite](https://sqlite.org)** | `sqlite:` | Yes | `sqlite:cache.db`, `sqlite:/var/cache.db,1gb` |
| **Cloud** | `cloud` | Yes (shared) | `cloud:tbr_e_3QnzBcWx7KpRmYT2000example` (your cloud API token) |
| **None** | `none` | — | Disables all caching |

Backend parameters are positional and separated by `,`. Sizes carry a byte unit
(`mem:200mb`, `sqlite:db,2gb`) or a bare entry count for memory (`mem:500`).
Memory cache defaults to 100 MB. SQLite evicts oldest entries when over the byte
limit and purges expired entries on write, no manual maintenance needed. See
the [Cloud docs](/docs/cloud/#global-cache) for details on the cloud cache
backend.

Every cache entry has an expiration timestamp. By default upstream
`Cache-Control: max-age` / `s-maxage` sets the TTL, capped at 7 days
(`TBR_CACHE_MAX_TTL`). When the upstream provides no `Cache-Control`
freshness directive, entries default to 5 minutes. Upstream `ETag` /
`Last-Modified` validators do not override this default; they only enable
conditional revalidation once it lapses.

Server cache lookups use a canonical source URL, independently of the returned
top-level `url`. HTTP(S) cache identities lowercase the scheme and host and
strip query parameters and fragments.

### Revalidation

A cache string carries an absolute freshness timestamp, so it is reissued
rather than reused. When a client sends back a cache string that has expired,
the server makes a conditional request to the origin using the stored `ETag`
or `Last-Modified` validator.

If the origin answers `304 Not Modified`, the content is still current and the
freshness clock restarts:

- The origin's original `max-age` / `s-maxage` lifetime is reused, so a long
  cached lifetime is not shortened by revalidation.
- When no lifetime was recorded, the 5 minute default applies.
- A `Cache-Control` header on the `304` response itself takes precedence.
- `no-cache` still requires revalidation on every request, and `no-store` /
  `private` responses are still not stored.

The response carries the renewed cache string, and the server updates its own
cache entry with it. The next request can then be served from cache instead of
revalidating again.

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
  to be interpreted or parsed in any way. It is internal data to the Thumbrella 
  server.

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


## Pins

Pins are temporary, shareable thumbnail URLs for HTML images, rich-text previews,
or generated reports, not permanent image hosting. Results return the path in
the `pin` field, typically `pin/<opaque-id>.jpeg`; resolve it against the server's
base URL. The field can be `null` if pinning is disabled or no thumbnail is available.

A pin serves only the thumbnail JPEG, without a token or handshake. Anyone with
the URL can view it, so it is a shareable link, not an access-controlled resource.
It does not expose your API token, source URL, original file, or result metadata.

Pins share data with the thumbnail cache and extend retention beyond normal cache
expiration. Viewing a pin neither fetches the source nor regenerates the thumbnail.
If a media URL changes content, its pinned image is updated when a new thumbnail
is generated for that media. A pin is not an immutable snapshot.

The server attempts to reuse the same pin URL for repeated thumbnail requests,
which can extend its lifetime. Viewing the pin does not renew it. On self-hosted
servers, `TBR_PIN` sets retention; `0` disables pinning. In-memory pins are lost on
restart; a persistent cache can retain both thumbnails and their pin URLs.

Pins can expire or disappear when cache data is evicted or cleared. A recognized
pin without a thumbnail redirects to a placeholder image. Placeholder results
can also have pins, so a pin does not guarantee a real thumbnail. Keep your own
copy if you need a durable image.

Pin requests have a small minimum response time to discourage scraping and URL
guessing. Use the regular API for thumbnail generation, batches, and metadata.

Cloud pin lifetime follows the account's maximum cache TTL. The **Disable pins**
token limit prevents creating or refreshing pins. Disabling pinning or rotating
a token does not delete existing pins; they remain usable while retained.

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
| File paths blocked | Configuration not allowed by default | Set `TBR_LOCAL=1` to allow `file://` URLs |

A running server can be checked by testing the `/health` endpoint:

```bash
curl http://localhost:3114/health
# {"status": "ok", "thumbrella": 1}
```

## Docker

The server is published as a container image. It listens on `3114` and binds
to `0.0.0.0`, so publish the port to reach it from the host.

```bash
docker run --publish 3114:3114 --rm --name tbr thumbrella/server
```

### Base image

The Thumbrella Docker image is built on the excellent [LinuxServer.io
Ffmpeg](https://docs.linuxserver.io/images/docker-ffmpeg/) docker image. This provides a robust
Linux environment with a features ffmpeg build. Thumbrella will use this to take
advantage of all the formats that ffmpeg provides. 

Be aware that Thumbrella will look for other tools for other complicated formats
that are not included in this base image, like `oiiotool`. Thumbrella will run
fine without these external tools. See options like the [hybrid
Cloud](#hybrid-cloud) server that allows your server to fallback on Thumbrella
Cloud to handle these more complicated tools. Or extend your Docker image
further with the external tools you are needing.

### Configuration options

The thumbrella server will run well in Docker by default. There are several
useful Docker configurations settings you can consider.

- Persistent cache. The docker image defaults to a simple 100mb in memory
cache. Consider setting ``TBR_CACHE`` and pointing a sqlite cache to a
persistent docker volume.
- Scratch space on tmpfs or shmem. The thumbrella server uses
temporary disk space for complicated tools. Consider Docker's ``--tmpfs``
arguments or setting ``TBR_SCRATCH`` to a shmem area in the container.
- Container health checks. Use the `/health` url endpoint to get a small
json response with the server status.

All the other server settings are viable with a Docker hosted container.
Continue with the [hybrid cloud](#hybrid-cloud), [handshake](#handshake),
and other sections on this page.

See the output from `thumbrella service compose` for a helpful configuration
file with these options, helpful comments and more.


### Sponsors Docker Image

Thumbrella [sponsors](sponsors) get access to a fully functioning and supported
Docker image. This comes with full support for all Thumbrella tools and
external renderers. This includes running with virtual framebuffers to support
output from graphical applications.


## Hybrid Cloud

A standalone server can be connected to a free account on Thumbrella Cloud
to expand it's functionality.

A standalone server can use Thumbrella Cloud as its persistent caching backend.
The cached requests will be managed with quota and lifetimes the same as
the requests are handled by Thumbrella Cloud. This cache is also shared with
regular Cloud requests for the same account. Set the `TBR_CACHE` environment
variable to `cloud:` followed by a private token for your account. 

A standalone server can present difficulty to get all the formats supported
when they are handled by external tools. The thumbrella server must have access
to tools like `oiiotool`, `f3d` (with a framebuffer), and more. Instead of 
setting these up a standalone Thumbrella server can be configured to fallback
on Thumbrella Cloud to handle only these more complicated and optional
formats. This is done by setting the `TBR_TIER3` environment variable to a
private token for your account. 

Bare tokens use `https://cloud.thumbrella.dev`, just like setting `TBR_CONNECT`
on clients. Run `thumbrella check` to validate these connections. 

```bash
export TBR_CACHE=cloud:tbr_e_3QnzBcWx7KpRmYT2000example
export TBR_TIER3=tbr_e_3QnzBcWx7KpRmYT2000example
```

## External tools

Many image, video, and vector formats are built into the server and need nothing
extra. For the rest, Thumbrella runs optional external programs in a restricted
subprocess. Every tool is optional: the server probes the environment at startup
and only uses tools that are present. Run `thumbrella check` to see which tools
are detected and `thumbrella formats` to see the resulting format coverage.

| Tool | Purpose | Formats enabled |
|---|---|---|
| `ffmpeg` | Image and video decode fallback | Additional image and video formats |
| `ffprobe` | Media metadata (dimensions, duration) | Used alongside `ffmpeg` |
| `gm` (GraphicsMagick) | Arithmetic-coded JPEG decode and resize | `jpeg` `jpg` |
| `oiiotool` (OpenImageIO) | Studio and high-dynamic-range image decode | `exr` `sxr` `mxr` `hdr` `rgbe` `dpx` `cin` `dds` `fits` `iff` `pic` `rla` `zfile` `sgi` `rgb` `rgba` `bw` `int` `inta` |
| `f3d` | 3D geometry rendering | `3ds` `brep` `dae` `dxf` `e` `exo` `ex2` `fbx` `glb` `gltf` `gml` `iges` `igs` `obj` `off` `p21` `ply` `pts` `step` `stl` `stp` `stpnc` `vtk` `vtm` `vti` `vtp` `vtr` `vts` `vtu` `vrml` `wrl` `210` |
| `python3` + `usd-core` | USD mesh extraction, then rendered by `f3d` | `usdz` `usdc` `usda` |
| `pdftoppm` (Poppler) | PDF first-page rasterization | `pdf` |
| `pdfinfo` (Poppler) | PDF page count metadata | Used alongside `pdftoppm` |
| `xvfb-run` / X display | Headless display server for `f3d` | Required for geometry rendering |

Arithmetic-coded JPEGs need `gm` or a configured handoff; FFmpeg's JPEG
decoder does not support this variant, even when ordinary JPEGs work locally.

The display server is a runtime requirement rather than a format tool. `f3d`
will not render without a `DISPLAY` (or `WAYLAND_DISPLAY`) in the environment.
When no display is available, the server wraps `f3d` with `xvfb-run`, which
starts a temporary Xvfb server.

USD support depends on three pieces at once: `python3`, the `usd-core` PyPI
package, and `f3d`. All three must be detected before `usdz`, `usdc`, or `usda`
files are handled.

These tools are all completely optional. The Thumbrella server operates without
any of these tools, gracefully providing fallback images for the formats it
cannot handle.

### Sandboxed subprocesses

When Thumbrella runs an external tool, it treats that process as untrusted and
applies a basic set of protections rather than giving it free run of the
machine. The child is never allowed to gain extra privileges: on Linux,
privilege escalation is disabled and capabilities are dropped before the tool
starts, and resource limits cap open files and prevent core dumps. Each render
runs inside its own temporary directory, cleaned up afterward, so the tool only
has a private, disposable workspace. Protected renderers also carry a
wall-clock timeout (20 seconds by default) and are killed if they overrun it.
These restrictions are deliberately lightweight and best-effort: they exist to
contain accidents and runaway resource use, not to serve as a strong security
boundary. They are applied only where they do not break the tools themselves,
and the details will keep evolving as stronger restrictions are added over
time.

On Windows subprocess are protected using builtin Windows functionality
like process time limits, process management, and isolated scratch areas.


## Service Setup

The Thumbrella server comes with a small set of helper commands to prepare
a configuration for various service management environments. These are intended
to be basic starting points for these configurations. A full production service
may want additional directives for load balancing, logging, and other server
related controls. The service files are fairly commented and contain additional
options that may be commented out.

- **Docker Compose**
  Run `thumbrella service compose` to set up a server with `docker-compose`
- **Systemd**
  Run `thumbrella service systemd` for a systemd service file that should
  be installed to the system or user processes.
- **Windows**
  Run `thumbrella service windows` to show instructions for installing
  the server with `NSSM`. This isn't a direct configuration file, just a
  list of manual steps and recommendations.

All these examples will print configuration information directly to `stdout`.
Add a `--write <path>` argument to store the configuration in an output file 
path.


## Attestation

Wherever you get your Thumbrella binaries from, you can always validate if
an executable authentically comes from the Thumbrella project. This ensures
nothing has been tampered with by a third party.

The Github cli tool, `gh` can be used for this. Potentially use your platform's
`which` or `where` tool to locate the thumbrella executable.

```sh
gh attestation verify $HOME/.cargo/bin/thumbrella --owner thumbrella-dev
```

Look for the highlighted `✓ Verification succeeded!` message, along with
details about why Github believes it generated this binary specifically for
the Thumbrella project.
