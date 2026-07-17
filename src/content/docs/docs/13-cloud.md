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

This token is the value to use as the connection string. Either assign it to
`$TBR_CONNECT` or provide it as an optional argument when constructing a
`Client` object.

:::note
It is discouraged to write authentication tokens directly into source code. Use
your language's standard practice for fetching secret values. This often means
`.env` files or similar handling of secrets.
:::

When making direct HTTP requests to Thumbrella Cloud the authentication
token is sent as a bearer authentication HTTP Header. With
`curl` that will look like this.

```bash
curl -G "https://cloud.thumbrella.dev/thumb" \
  --data-urlencode "url=https://demo.thumbrella.dev/media/golden-gate.exr" \
  --header "Authorization: Bearer tbr_e_3QnzBcWx7KpRmYT2vLfJdE9sMhXuoG6i" \
  --output thumb.jpeg
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
edge cache do not consume render quota. 

**Cache** limits describe how much thumbnail data Thumbrella stores in its
global edge network. Thumbnails served from the edge are instant worldwide.

When the render quota is exhausted the server continues to return thumbnails —
placeholder images rather than hard errors. Results still arrive in the same
shape; only the `source` field and image content change. Applications do not
need special handling for quota exhaustion.


### Limits

Accounts have a daily usage limit. This limit only counts against rendered
thumbnails. Cached, missing, or simple requests do not count towards this
quota. Part of the daily limit will also be used to restrict the number of
thumbnails an account can generate within any given hour and minute.

When accounts reach their limit for a given time period they begin returning
only placeholder results for their media. They can continue to return precached
results without consuming quota.

The Thumbrella API encourages batching multiple requests into a single HTTP
operation. The usage and quota tracking is based on each thumbnail requested,
not the number of HTTP operations. See the [HTTP API](/docs/client/#http-thumbnail-api)
for batch request details.

The cloud will slow down requests happening at a rate approximately 1/50 of the
daily total each minute. These requests will still run normally, only taking
longer than normal.


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

The Thumbrella server will be available on AI compute platforms, like
[fal.ai](https://fal.ai) and [Replicate](https://replicate.com). 

Platforms like this can be an excellent use case for applications already
written on these platforms. Thumbrella runs without the GPU hosts these
platforms typically provide, making its usage cost relatively low.

Thumbrella does not collect any payment for usage on these platforms. The
The Thumbrella Cloud platform is designed to be more cost-efficient than these
platforms.

These platforms can also be extended with Thumbrella Cloud to take advantage
of additional server side caching. Look for the optional `token` parameter on
these requests. The global Thumbrella Cloud cache can significantly reduce the
processing needed on these platforms and speed up the results.


## Terms of Service

Thumbrella Cloud is provided on a best-effort basis. Uptime depends on upstream
infrastructure and is not guaranteed.

Administrators may throttle, suspend, or permanently disable accounts at their
discretion. This includes accounts that intentionally abuse the service, degrade
performance for other users, or attempt to circumvent limits by creating
multiple accounts. Users who repeatedly create accounts after suspension may be
blocked from creating new accounts through IP ranges, email patterns, or other
technical measures.

Free accounts share pooled resources and may experience delays or cold starts
under load. 

Usage is subject to hourly and daily limits. Requests are gradually throttled
as limits are approached. The dashboard shows daily usage, which may be delayed
up to a day.

Paid accounts subscribe monthly for extended quotas and priority access. Upon
subscription, quotas increase immediately. Cancellations remain active through
the end of the current pay period, after which accounts return to free-tier
limits.

Extended outages that materially impact service may, at administrator
discretion, result in account credits toward future payments. Credits will not
exceed the current period's subscription amount. Refunds are not provided;
credits are the sole remedy for service interruptions.

The service may need to disable file formats or features that pose risk to the
platform. While the goal is to expand supported formats over time, no specific
format is guaranteed to remain available.

These terms and the privacy policy may be updated at any time. Continued use
of the service after changes constitutes acceptance.


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
