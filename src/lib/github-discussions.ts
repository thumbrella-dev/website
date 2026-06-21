/**
 * Fetches recent GitHub Discussions from the thumbrella-dev/thumbrella
 * "News" category via the GitHub GraphQL API.
 */

const GITHUB_API = 'https://api.github.com/graphql';

interface DiscussionNode {
  title: string;
  url: string;
  updatedAt: string;
  number: number;
  category: { name: string; slug: string };
  comments: { totalCount: number };
  reactionGroups: { content: string; reactors: { totalCount: number } }[];
}

export interface NewsItem {
  title: string;
  url: string;
  updatedAt: string;   // ISO-8601
  number: number;
  commentCount: number;
  /** Map of emoji name → count (only non-zero entries). */
  reactions: Record<string, number>;
}

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

export async function fetchNews(token: string): Promise<NewsItem[]> {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  const res = await fetch(GITHUB_API, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'thumbrella-web',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { org: 'thumbrella-dev' },
    }),
  });

  if (!res.ok) {
    console.error(`GitHub API error: ${res.status}`);
    return [];
  }

  const json = await res.json() as {
    data?: { organization?: { repository?: { discussions?: { nodes?: DiscussionNode[] } } } };
    errors?: unknown[];
  };

  if (json.errors) {
    console.error('GitHub GraphQL errors:', JSON.stringify(json.errors));
    return [];
  }

  const nodes = json.data?.organization?.repository?.discussions?.nodes ?? [];

  return nodes
    .filter((n) => n.category.slug === 'news')
    .filter((n) => new Date(n.updatedAt) >= twoMonthsAgo)
    .slice(0, 3)
    .map((n) => {
      const reactions: Record<string, number> = {};
      for (const g of n.reactionGroups) {
        const count = g.reactors.totalCount;
        if (count > 0) reactions[g.content] = count;
      }
      return {
        title: n.title,
        url: n.url,
        updatedAt: n.updatedAt,
        number: n.number,
        commentCount: n.comments.totalCount,
        reactions,
      };
    });
}
