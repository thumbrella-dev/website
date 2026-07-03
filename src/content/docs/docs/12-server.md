---
title: Server
description: Self hosting Thumbrella servers
slug: docs/server
---

The Thumbrella executable is the server. It can be downloaded directly from
releases or built from source. For most users, the easiest path is to run
it through a prebuilt package. The server runs on Windows, macOS, and
Linux — anywhere Rust can produce a runnable binary.

```bash
# Run with npx (Node)
npx thumbrella/server serve

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
| `TBR_CACHE` | <none> | Comma-separated list of cache backend definitions. |
| `TBR_SCRATCH` | `$TMP/thumbrella` | A location on disk to download temporary files into. |

Be aware that some of these settings may not make sense or even break things
inside the docker environment.

There are several more specialized environment variables that won't be needed for
most self hosted services.

| Specialized Variable | Default Value | Description |
|---|---|---|
| `TBR_TIER2` | <none> | Connection string to contact a separate Thumbrella server for tier2. |
| `TBR_TIER3` | <none> | Connection string to contact a separate Thumbrella server for tier3. |
| `TBR_SERVER` | <none> | Short identifier allowing inter server requests to log the origins. |


## Handshake

Each server can define a secret handshake via the `$TBR_HANDSHAKE` environment
variable. Clients must provide this value with every request. It helps mitigate
unwanted traffic on directly exposed Thumbrella servers.

Consider a command like `openssl rand -base64 24` to generate a secure
random token. Or just pick your favorite word — it's your handshake. The server will
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

With default settings the server performs no server-side caching. This is
not ideal — HTTP already provides rich caching directives, and a Thumbrella
server that ignores them leaves significant performance on the table.

The http protocol has excellent standards for cache control. Thumbrella takes
advantage of all of these. Both servers and client libraries can optionally
store thumbnail results in persistent caches. 
Thumbrella caches thumbnails at both the client and server levels. This is
one of the key strategies for keeping Thumbrella fast and efficient.

Thumbrella results encode the caching data into a single "cache string".
This is used for a few things.

- Clients have a defined way to check the cache string for freshness. If the
  cache is fresh, there's no need to request a new thumbnail from the server.
  This is indeed the fastest code path possible, the client already knows
  the answer and knows it is safe to reuse.
- The client should also send this cache string along with every thumbnail
  request. The server will coordinate with the remote host and determine the
  current state of the media. If the server agrees the media is unchanged
  it returns a special "not modified" status for the request. This only happens
  when the request comes with a "cache string" that was returned from a 
  previous request.
- Even if a client requests a thumbnail with no cache string, the server can
  still cache the state of thumbnail. If checking with the server validates
  its recorded cache is up to date it can be returned immediately, with no
  download or rendering of the actual media.

`$TBR_CACHE` accepts a comma-separated list of cache backend definitions.
Thumbrella ships with two built-in backends.

Each value in the list resembles a URL.

- **Memory** (`mem:`)
  Not persistent — all cached data is lost when the server restarts.
  Control the cache size with a hash anchor: `mem:/#2gb` or `mem:/#100mb`.
  Defaults to 100 MB if no size is given. Modest, but plenty of room for
  thumbnails.
- **SQLite** (`sqlite:`)
  Persistent across restarts. Provide a file path where the database will
  live: `sqlite:/var/lib/thumbrella/cache.db`. The database grows
  unbounded unless maintained. It ships with a `readme` table containing
  ready-to-run SQL recipes for trimming by age or total size (see below).

Server caching is a separate thing than client side caching, which is included
with all the provided client libraries. Server caches are shared by all users.


### SQLite Cache Management

SQLite has no stored procedure support, so the database ships maintenance
recipes as plain SQL in a `readme` table instead.

List the available recipes:
```bash
sqlite3 /path/to/cache.db "SELECT name, description, sql_template FROM readme;"
```

Example — drop entries older than 20 days, then reclaim disk space:
```bash
sqlite3 /path/to/cache.db "DELETE FROM thumbrella WHERE last_accessed_at < unixepoch() - (20 * 86400);"
sqlite3 /path/to/cache.db "VACUUM;"
```

Additional recipes cover trimming by total cache size.


### Cache String

A cache string is a compact encoding of cache information. An example looks like
this.

```
6a46337d:AAAkIjE2ODcxOTc4MTcuMzY0NjkzLTEzMjA2OC01MTI5NTY2MDkiAA
```

The data is broken into two parts, separated by the first colon.
The string will always have at least one colon with some characters before
and after.

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


## External Formats

The thumbrella executable comes with support for a wide range of image, video,
and other formats. These are built in statically and will work on any system
in any kind of environment.

Thumbrella also supports using sandboxed external programs to do processing.
These are used for things like 3d renders, and even ffmpeg for some of the
more advanced formats.


## Troubleshooting

If the server fails to start or behaves unexpectedly, run the `check`
subcommand first. It evaluates the environment variables that configure the
server and reports whether each value is valid.

Look at the server's printed output. It will often contain hints and details
on why certain requests are failing.

The server defaults to port 3114. If that port is unavailable the `serve`
and `check` commands will report it. Set `$TBR_PORT` to a different value.

A running server can be checked by testing the /health endpoint.

```bash
curl http://localhost:3114/health
```

