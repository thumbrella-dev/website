/**
 * GET /worker/news
 *
 * Proxies GitHub Discussions (News category) through a Cloudflare Worker
 * endpoint.  Uses the GITHUB_TOKEN secret and caches responses for 5 minutes.
 *
 * Response:  JSON array of { title, url, updatedAt, commentCount, reactions }
 */

import type { APIRoute } from 'astro';

const GITHUB_API = 'https://api.github.com/graphql';

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

export const GET: APIRoute = async ({ locals }) => {
  const cloudflareEnv = (locals as any).runtime?.env;
  const token: string | undefined = cloudflareEnv?.GITHUB_TOKEN;

  if (!token || token === 'github_pat_replace_me') {
    return new Response(JSON.stringify({ error: 'token not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  try {
    const res = await fetch(GITHUB_API, {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'thumbrella-web',
      },
      body: JSON.stringify({ query: QUERY, variables: { org: 'thumbrella-dev' } }),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `GitHub API ${res.status}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const json = await res.json() as any;
    if (json.errors) {
      return new Response(JSON.stringify({ error: 'GraphQL errors', detail: json.errors }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const nodes = json.data?.organization?.repository?.discussions?.nodes ?? [];

    const items = nodes
      .filter((n: any) => n.category.slug === 'news')
      .filter((n: any) => new Date(n.updatedAt) >= twoMonthsAgo)
      .slice(0, 3)
      .map((n: any) => {
        const reactions: Record<string, number> = {};
        for (const g of n.reactionGroups) {
          if (g.reactors.totalCount > 0) reactions[g.content] = g.reactors.totalCount;
        }
        return {
          title: n.title,
          url: n.url,
          updatedAt: n.updatedAt,
          commentCount: n.comments.totalCount,
          reactions,
        };
      });

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',  // 5 minutes
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
