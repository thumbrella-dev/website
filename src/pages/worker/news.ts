/**
 * GET /worker/news
 *
 * Returns recent GitHub Discussions from the thumbrella-dev/community
 * "News" category as JSON.  Requires GITHUB_TOKEN as a Cloudflare secret
 * (set via `npx wrangler secret put GITHUB_TOKEN`).
 *
 * Cached for 5 minutes (Cache-Control: max-age=300).
 */

import type { APIRoute } from 'astro';

// ── Config ────────────────────────────────────────────────────────────────

const GITHUB_API = 'https://api.github.com/graphql';
const CACHE_MAX_AGE = 300; // seconds

const QUERY = `
query($org: String!) {
  organization(login: $org) {
    repository(name: "community") {
      discussions(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          title
          url
          updatedAt
          number
          category { name slug }
          comments { totalCount }
          reactionGroups {
            content
            reactors { totalCount }
          }
        }
      }
    }
  }
}`;

// ── Helpers ───────────────────────────────────────────────────────────────

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function resolveToken(locals: unknown): string | undefined {
  // 1. Cloudflare Worker runtime (production + wrangler dev).
  //    Wrapped in try-catch because Astro v6 changed the runtime.env API.
  try {
    const env = (locals as any)?.runtime?.env;
    if (env?.GITHUB_TOKEN) return env.GITHUB_TOKEN;
  } catch { /* locals.runtime.env was removed in Astro v6 */ }

  // 2. process.env fallback for astro dev (Node.js SSR).
  try {
    if (typeof process !== 'undefined' && process.env?.GITHUB_TOKEN) {
      return process.env.GITHUB_TOKEN;
    }
  } catch { /* not Node.js */ }

  return undefined;
}

// ── Handler ───────────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ locals }) => {
  const token = resolveToken(locals);

  if (!token) {
    return json({ error: 'GITHUB_TOKEN not configured' }, 500);
  }

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 2);

  // Fetch from GitHub
  let ghRes: Response;
  try {
    ghRes = await fetch(GITHUB_API, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'thumbrella-web',
      },
      body: JSON.stringify({ query: QUERY, variables: { org: 'thumbrella-dev' } }),
    });
  } catch (e: any) {
    return json({ error: 'GitHub API unreachable', detail: e.message }, 502);
  }

  if (!ghRes.ok) {
    const body = await ghRes.text().catch(() => '');
    return json({ error: `GitHub API ${ghRes.status}`, detail: body.slice(0, 500) }, 502);
  }

  let data: any;
  try {
    data = await ghRes.json();
  } catch {
    return json({ error: 'GitHub API returned invalid JSON' }, 502);
  }

  if (data.errors) {
    return json({ error: 'GitHub GraphQL errors', detail: data.errors }, 502);
  }

  const nodes: any[] = data?.data?.organization?.repository?.discussions?.nodes ?? [];

  const items = nodes
    .filter((n: any) => n.category?.slug === 'news')
    .filter((n: any) => new Date(n.updatedAt) >= cutoff)
    .slice(0, 3)
    .map((n: any) => {
      const reactions: Record<string, number> = {};
      for (const g of n.reactionGroups ?? []) {
        if (g.reactors?.totalCount > 0) reactions[g.content] = g.reactors.totalCount;
      }
      return {
        title: n.title,
        url: n.url,
        updatedAt: n.updatedAt,
        commentCount: n.comments?.totalCount ?? 0,
        reactions,
      };
    });

  const response = json(items, 200, { 'Cache-Control': `public, max-age=${CACHE_MAX_AGE}` });
  return response;
};
