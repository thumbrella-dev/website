---
title: Web Component
description: Using the <tbr-thumb> custom element for zero-config thumbnail integration
slug: docs/components
---

The fastest way to add Thumbrella thumbnails to a web page is the `<tbr-thumb>`
custom element. It is a self-contained web component that handles server
communication, loading states, error recovery, and placeholder display
automatically. Import it as an ES module, then use `<tbr-thumb>` anywhere
you would use an `<img>`.

```html
<script type="module">
  import { tbrSetup } from "https://cdn.jsdelivr.net/npm/@thumbrella/client@1/browser.js";
  tbrSetup("tbr_e_3QnzBcWx7KpRmYT2000example");
</script>

<tbr-thumb src="https://demo.thumbrella.dev/media/kids-theater.heic" style="width: 200px;"></tbr-thumb>
```

No build step, no framework, no client library code to write. The component
renders a busy animation while the thumbnail loads, fades in the final
image, and shows a placeholder icon if the source is unreachable or the format
is unsupported.


## Setup

There are two ways to load the component, depending on your project setup.

### ES module import (recommended)

Import `tbrSetup` from the CDN and call it with a connect string. This is the
standard modern approach and works in all current browsers.

```html
<script type="module">
  import { tbrSetup } from "https://cdn.jsdelivr.net/npm/@thumbrella/client@1/browser.js";
  tbrSetup("tbr_e_3QnzBcWx7KpRmYT2000example");
</script>

<tbr-thumb src="https://demo.thumbrella.dev/media/blue-scooter.fbx""></tbr-thumb>
```

The `import` statement fetches the module, which registers the `<tbr-thumb>`
custom element and exports `tbrSetup`. Call it once at the top of your page or
app. Subsequent calls are no-ops.

For projects that use a bundler, install the package and import from it:

```bash
npm install @thumbrella/client
```

```ts
import { tbrSetup } from "@thumbrella/client/browser";
tbrSetup("tbr_e_3QnzBcWx7KpRmYT2000example");
```

### Configuration options

The `tbrSetup` function accepts either a connect string or a configuration
object:

```ts
// Simple connect string
tbrSetup("tbr_e_3QnzBcWx7KpRmYT2000example");

// Full configuration with persistent cache
tbrSetup({
  connect: "tbr_e_3QnzBcWx7KpRmYT2000example",
  persist: 10, // IndexedDB cache, 10 MB
});
```

| Option | Type | Description |
|---|---|---|
| `connect` | string | Thumbrella connect string. A Cloud token, a server URL, or a full connect string with headers. |
| `persist` | number \| boolean | Enable IndexedDB persistent cache. The value is the maximum size in MB (default 5 if `true`). Omit to disable. |

See the [connect string](../client/#connect) section in the client docs for the
full connect string syntax.


## Element

### Attributes

The `<tbr-thumb>` element accepts the following attributes. All are optional
except `src`.

| Attribute | Description |
|---|---|
| `src` | The URL of the media to thumbnail. Works like `<img src>`. |
| `connect` | Per-element connect string override. Use when a single page talks to multiple Thumbrella servers. |
| `lazy` | Set to `"true"` to defer loading until the element scrolls into the viewport. |
| `alt` | Accessible label. Shown during loading and used as the `alt` text on the internal `<img>`. |

```html
<tbr-thumb
  src="https://demo.thumbrella.dev/media/apollo-exterior.glb"
  alt="3D model of a spaceship"
  lazy="true"
  style="width: 300px;">
</tbr-thumb>
```

Changing the `src` attribute at any time cancels the in-flight request and
starts a new one. The element returns to its loading state and the new
thumbnail fades in when ready.

### Connect resolution

Each element resolves its connect string in this order:

1. Its own `connect` attribute, if present.
2. The global connect string set by `tbrSetup()`.
3. The `TBR_CONNECT` environment variable (if set on `window`).

This makes it easy to set a global default and override it for specific
elements that need a different server or authentication context.

```html
<script type="module">
  import { tbrSetup } from "@thumbrella/client/element";
  tbrSetup("tbr_e_3QnzBcWx7KpRmYT2000example");
</script>

<!-- Uses the global connect string -->
<tbr-thumb src="https://demo.thumbrella.dev/media/stream-barn.mkv"></tbr-thumb>

<!-- Overrides with a self-hosted server -->
<tbr-thumb
  src="https://internal.company.com/secret.pdf"
  connect="https://tbr.internal.company.net,x-tbr-handshake=internal-secret">
</tbr-thumb>
```


## Lifecycle

The element moves through a series of visual states as it loads a thumbnail.
Each state is reflected as a CSS class on the `<tbr-thumb>` element, so you can
style them from your own stylesheet.

```
  (idle)
    │
    │ src set / connected
    ▼
 tbr-requested          ← shimmer + spinner visible
    │
    │ intermediate result arrives (optional)
    ▼
 tbr-intermediate       ← placeholder shown, shimmer stops
 tbr-has-intermediate
    │
    │ final result arrives
    ▼
 tbr-loaded             ← final thumbnail fades in
 tbr-success            ← or tbr-failed, tbr-overloaded, tbr-unavailable
```

### CSS classes

| Class | When applied | Meaning |
|---|---|---|
| `tbr-requested` | Immediately after the thumbnail request starts | The element is waiting for a response. Shimmer and spinner are visible. |
| `tbr-intermediate` | An intermediate result arrives before the final thumbnail | The server has identified the file and sent a placeholder, but the full render is still in progress. |
| `tbr-has-intermediate` | After an intermediate result is displayed | The shimmer stops; the intermediate placeholder is shown statically. |
| `tbr-loaded` | The final result arrives (success or failure) | The final image is displayed. Shimmer and spinner fade out. |
| `tbr-success` | The thumbnail was generated successfully | The final thumbnail is visible. |
| `tbr-failed` | The request failed (bad URL, unsupported format, server error) | A fallback placeholder icon is shown. |
| `tbr-overloaded` | The server is temporarily overloaded | A fallback placeholder icon is shown. |
| `tbr-unavailable` | The server is unreachable | A fallback placeholder icon is shown. |

### Styling based on state

Use the lifecycle classes to add visual feedback. For example, highlight
successful thumbnails with a green border and failed ones with red:

```css
tbr-thumb {
  width: 200px;
  border: 2px solid transparent;
  border-radius: 12px;
  transition: border-color 0.3s ease;
}

tbr-thumb.tbr-success {
  border-color: #4ade80;
}

tbr-thumb.tbr-failed {
  border-color: #f87171;
}

tbr-thumb.tbr-overloaded {
  border-color: #fbbf24;
}
```

### CSS custom properties

The component's internal styles use CSS custom properties for easy theming.
Set them on the element or any ancestor.

| Property | Default | Description |
|---|---|---|
| `--tbr-bg` | `#0d1225` | Background colour shown while the thumbnail is loading. |
| `--tbr-shimmer` | `rgba(255, 255, 255, 0.03)` | Base colour of the shimmer gradient. |
| `--tbr-spinner-color` | `#7c5cff` | Accent colour of the loading spinner. |

```css
tbr-thumb {
  --tbr-bg: #1a1a2e;
  --tbr-shimmer: rgba(255, 255, 255, 0.06);
  --tbr-spinner-color: #e94560;
}
```


## Events

The element fires a `tbr:loaded` custom event when the final result arrives.
The event bubbles and crosses shadow DOM boundaries (`composed: true`), so you
can listen for it on the element itself or any ancestor.

```ts
document.addEventListener("tbr:loaded", (e) => {
  const { result } = e.detail;
  console.log(result.status, result.url);

  if (result.media) {
    console.log(`${result.media.kind}  ${result.media.fileSize} bytes`);
  }
});
```

The `detail.result` object has the same shape as the
[client library result](../client/#result). The most useful fields are:

| Field | Description |
|---|---|
| `status` | `"success"`, `"failed"`, `"overloaded"`, or `"intermediate"` |
| `url` | The original URL that was requested |
| `media.kind` | Media category: `image`, `video`, `document`, etc. |
| `media.extension` | File extension without the dot |
| `media.fileSize` | Size of the source file in bytes |
| `media.placeholder` | Non-empty string when the thumbnail is a fallback icon |


## Caching

The component uses the same client-side caching layer as the
[TypeScript client library](../client/#caching). On the first request for a URL,
the component fetches the thumbnail from the server. On subsequent requests for
the same URL, the client returns the cached result immediately without a
network call.

### Memory cache (default)

By default, the component uses an in-memory cache that holds up to 500 entries
with a 5-minute TTL. This is sufficient for most pages and requires no
configuration.

### Persistent cache (IndexedDB)

For apps that reload frequently or navigate between pages, enable the
IndexedDB persistent cache. Thumbnails are stored in the browser's IndexedDB
and survive page reloads and browser restarts.

```ts
tbrSetup({
  connect: "tbr_e_3QnzBcWx7KpRmYT2000example",
  persist: 20, // 20 MB max
});
```

The `persist` value is the maximum cache size in MB. The default is 5 MB if
you pass `true` instead of a number.

The persistent cache works alongside the memory cache. Lookups check the
memory cache first, then fall back to IndexedDB. Both caches are keyed by the
server-provided cache token, so they stay in sync with server-side caching
automatically.


## Error handling

The component never shows a broken image icon. Every request produces a result,
and every result produces a visible thumbnail. When the server is unreachable,
the source URL is invalid, or the file format is unsupported, the component
displays a generic placeholder icon and applies the appropriate failure class.

| Scenario | Class applied | Visual |
|---|---|---|
| Thumbnail generated successfully | `tbr-success` | Final thumbnail visible |
| Server returned an error (bad URL, unsupported format) | `tbr-failed` | Placeholder icon |
| Server is temporarily overloaded | `tbr-overloaded` | Placeholder icon |
| Server is unreachable (network error, CORS, DNS) | `tbr-unavailable` | Placeholder icon |

The placeholder icon is a small inline SVG embedded in the component. It is
the same placeholder the server generates for unknown file types, so the
visual experience is consistent whether the failure is client-side or
server-side.

### Retry on failure

The component does not automatically retry failed requests. If you want to
retry, listen for the `tbr:loaded` event and re-set the `src` attribute after
a delay.

```ts
document.addEventListener("tbr:loaded", (e) => {
  const { result } = e.detail;
  if (result.status === "failed" || result.status === "overloaded") {
    const el = e.target;
    setTimeout(() => {
      el.setAttribute("src", el.getAttribute("src")!);
    }, 5000);
  }
});
```


## Examples

### Gallery grid

A responsive grid of thumbnails with hover effects.

```html
<style>
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  tbr-thumb {
    width: 100%;
    border-radius: 8px;
    transition: transform 0.2s ease;
  }
  tbr-thumb:hover {
    transform: scale(1.03);
  }
</style>

<div class="gallery">
  <tbr-thumb src="https://demo.thumbrella.dev/media/game-level.png"></tbr-thumb>
  <tbr-thumb src="https://demo.thumbrella.dev/media/neon-block.png"></tbr-thumb>
  <tbr-thumb src="https://demo.thumbrella.dev/media/pixel-forest.gif"></tbr-thumb>
  <tbr-thumb src="https://demo.thumbrella.dev/media/math-codes.jpg"></tbr-thumb>
</div>
```

### Lazy loading

Defer thumbnail generation until the user scrolls near the element. Useful for
long pages or infinite scroll layouts.

```html
<tbr-thumb
  src="https://demo.thumbrella.dev/media/golden-gate.exr"
  lazy="true"
  style="width: 200px;">
</tbr-thumb>
```

### Dynamic source

Change the `src` attribute at runtime to thumbnail a different URL. The
component cancels the in-flight request and starts a new one.

```html
<tbr-thumb id="preview" style="width: 300px;"></tbr-thumb>

<script type="module">
  const preview = document.getElementById("preview");
  
  document.getElementById("url-input").addEventListener("input", (e) => {
    preview.setAttribute("src", e.target.value);
  });
</script>
```

### Reacting to load events

Track thumbnail generation across the page and log statistics.

```ts
let successCount = 0;
let failCount = 0;

document.addEventListener("tbr:loaded", (e) => {
  const { result } = e.detail;
  if (result.status === "success") {
    successCount++;
  } else {
    failCount++;
  }
  console.log(`Thumbnails: ${successCount} ok, ${failCount} failed`);
});
```


## Comparison with client libraries

The `<tbr-thumb>` component is a thin wrapper around the
[TypeScript client library](../client/). It uses the same `Client` class
internally, the same connect string format, and the same caching layer. The
component adds:

- **Simple setup** — a single ES module import and `tbrSetup()` call
- **Visual loading states** — shimmer, spinner, and fade-in transitions
- **Automatic error handling** — placeholder icons for every failure mode
- **Shadow DOM encapsulation** — styles don't leak in or out
- **Lazy loading** — defer requests until the element is visible

If you need more control over the request lifecycle, batch multiple URLs, or
use streaming responses, use the
[TypeScript client library](../client/) directly. The component and the client
library can coexist on the same page.
