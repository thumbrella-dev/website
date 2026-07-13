---
title: Cloud
description: Hosted thumbnail service
slug: docs/cloud
---

Thumbrella Cloud is the hosted version of the service. It runs the same open
source Thumbrella server on managed infrastructure with a global edge cache and
access to high-quality rendering backends. There is nothing to deploy or
maintain.

## Auth Tokens

When an account is created, it will immediately come with an authentication
token. This token is used as the connection string, typically assigned to
the `TBR_CONNECT` environment variable.

```bash
export TBR_CONNECT=tbr_e_3QnzBcWx7KpRmYT2vLfJdE9sMhXuoG6i
```

All client libraries read `$TBR_CONNECT` automatically. They can also take the connect string directly.

:::note
It is discouraged to put authentication tokens directly into your
source. Use your language's standard practice for getting secret
values. This often is `.env` files or similar storage for secrets.
:::

When making direct low-level requests to Thumbrella Cloud the authentication
token is sent as the http header for a bearer authentication token. With
`curl` that will look like this.

```bash
curl -H "Authorization: Bearer tbr_e_3QnzBcWx7KpRmYT2vLfJdE9sMhXuoG6i" \
     "https://cloud.thumbrella.dev/thumb.jpeg?url=https://example.com/photo.jpg"
```


### Project Tokens

Paid accounts can create additional project tokens, each with its own quota
limits and permissions. This is useful for isolating usage across applications,
teams, or environments — a staging token can be given a low hourly cap while
production tokens run with the full allocation. Token management is available
in the account dashboard.


## Usage

See the [pricing page](../pricing/) for current quotas and limits on cloud
account types.

**Render** counts track freshly generated thumbnails. Results served from the
edge cache or returned as `not_modified` do not consume render quota.
Applications with a stable set of URLs naturally converge toward zero new
renders per day once the initial population is cached. See [Pricing](../pricing)
for the complete feature comparison.

**Cache** limits describe how much thumbnail data Thumbrella stores in its
global edge network. Thumbnails served from the edge are instant worldwide.

When the render quota is exhausted the server continues to return thumbnails —
placeholder images rather than hard errors. Results still arrive in the same
shape; only the `source` field and image content change. Applications do not
need special handling for quota exhaustion.


## Global Cache

Thumbrella Cloud maintains a distributed edge cache shared across all users.
When any client requests a thumbnail for a URL that has already been rendered,
the cached result returns immediately from a nearby edge node — no download or
render required, and no render quota consumed.

This shared pool means popular URLs benefit most. A widely used CDN asset might
already be cached by thousands of accounts before your application ever requests
it. Paid accounts receive more cache storage and a longer TTL, keeping a broader
set of URLs warm between accesses.

The cache TTL controls how long Thumbrella trusts a previously rendered
thumbnail without re-checking the origin. Once expired, Thumbrella revalidates
the remote URL and re-renders only if the content has changed. Media that hasn't
changed returns as `not_modified` at no render cost.

Client libraries add a second local cache layer on top of the server cache, so
frequently accessed URLs can resolve without any network call at all. See the
[Client docs](../client/#caching) for details.


## Demo Server

At any point, you can experiment with a client using the Thumbrella Demo site.
This provides free access to thumbnails for the media hosted in the
demo gallery. No account is required.

Instead of setting the connect string to an authentication token, set it to
the url of the demo site. This is the same as connecting clients to a custom,
self-hosted server.

```bash
export TBR_CONNECT=https://demo.thumbrella.dev

uvx thumbrella-client basic https://demo.thumbrella.dev/media/neon-block.png
```


## AI Platform Servers

The Thumbrella server will be available on ai compute platforms like
[fal.ai](https://fal.ai) and [Replicate](https://replicate.com). These platforms
will charge their own usage rates.

Platforms like this can be an excellent use case for applications already
written on these platforms. Thumbrella runs without the GPU hosts these
platforms typically provide, making its usage cost relatively low.

Thumbrella does not collect any payment for usage on these platforms. The
The Thumbrella Cloud platform is designed to be more cost-efficient than these
platforms.

These platforms can also be integrated with Thumbrella Cloud to take advantage
of thumbrella's server side caching. Look for the optional `token` parameter on
these requests. The global Thumbrella Cloud cache can significantly reduce the
processing needed on these platforms and speed up the results.


## Privacy Policy

Thumbrella Cloud avoids storing personally identifiable information. In practice
this means.

- All user information is handled through Clerk.
  - Thumbrella only stores the internal Clerk account id. 
    - No email, no user names, or any other PII.
  - Clerk triggers Thumbrella web hooks when account status has changed.
  - Clerk keeps a JWT cookie in the browser session.
  - No Clerk scripts or components loaded until logging in.
- Cache information is partitioned for each account.
  - No sharing of cache information across accounts.
  - Media served with "do not cache" or "private" http headers are not cached.
  - Only sanitized urls are stored, no query parameters.
- Cloudflare's "insights" analytics are used on the site.
  - Excludes visitor information from the EU.
