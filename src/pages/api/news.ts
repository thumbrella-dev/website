/**
 * GET /api/news
 *
 * Proxies the GitHub Discussions Atom feed for the "News" category,
 * parses out the top 3 entries, and returns them as JSON.
 *
 * This is an SSR-only route (prerender = false) so the news feed
 * is always fresh, even on an otherwise static site.
 */
export const prerender = false;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface NewsItem {
  title: string;
  url: string;
  updatedAt: string;
  bodyPreview: string;
}

let cachedPayload: string | null = null;
let cacheExpiresAt = 0;

export async function GET(): Promise<Response> {
  const now = Date.now();

  // Return cached response if still fresh
  if (cachedPayload !== null && now < cacheExpiresAt) {
    return new Response(cachedPayload, {
      headers: cacheHeaders(now),
    });
  }

  const feedUrl = 'https://github.com/orgs/thumbrella-dev/discussions/categories/news.atom';
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'thumbrella-web' },
    });
    if (!res.ok) {
      // Serve stale cache on fetch failure
      if (cachedPayload !== null) {
        return new Response(cachedPayload, {
          headers: cacheHeaders(now),
        });
      }
      return Response.json([]);
    }
    const text = await res.text();

    const entries: NewsItem[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(text)) !== null && entries.length < 3) {
      const block = match[1];
      const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? '';
      const link = block.match(/<link[^>]*href="([^"]*)"/)?.[1] ?? '';
      const updated = block.match(/<updated>([^<]*)<\/updated>/)?.[1] ?? '';
      const content = block.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? '';

      if (title && link) {
        entries.push({
          title,
          url: link,
          updatedAt: updated,
          bodyPreview: stripMarkdown(content),
        });
      }
    }

    cachedPayload = JSON.stringify(entries);
    cacheExpiresAt = now + CACHE_TTL_MS;

    return new Response(cachedPayload, {
      headers: cacheHeaders(now),
    });
  } catch {
    // Serve stale cache on error
    if (cachedPayload !== null) {
      return new Response(cachedPayload, {
        headers: cacheHeaders(now),
      });
    }
    return Response.json([]);
  }
}

function cacheHeaders(now: number): Record<string, string> {
  const remainingSecs = Math.max(0, Math.floor((cacheExpiresAt - now) / 1000));
  return {
    'content-type': 'application/json',
    'cache-control': `public, max-age=${remainingSecs}, s-maxage=${remainingSecs}`,
  };
}

/** Strip markdown/HTML formatting and truncate. */
function stripMarkdown(html: string): string {
  let text = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim();

  const words = text.split(/\s+/);
  if (words.length > 22) {
    text = words.slice(0, 22).join(' ') + ' …';
  }
  return text;
}
