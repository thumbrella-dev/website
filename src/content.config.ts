import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob, type Loader } from 'astro/loaders';

const tabSchema = z.object({
  label: z.string(),
});

/**
 * The Markdown for the docs collection lives in a top-level `docs/` directory
 * rather than Starlight's hardcoded `src/content/docs`.
 *
 * Starlight assumes that path in three places that take no configuration:
 *   1. the collection base   -- replaced by this loader
 *   2. the Markdown plugin path check -- see `markdown.processedDirs` in
 *      astro.config.mjs
 *   3. the build-time Git history scan -- replaced by the loader below
 *
 * The fourth consumer, Expressive Code's `docsPath`, is only used to guess a
 * page locale from the file path, which is a no-op for this single-locale site.
 */
const docsDir = './docs';

const docsLoader: Loader = {
  name: 'thumbrella-docs-loader',
  load: async (context) => {
    // Same matching rules as Starlight's own loader: Markdown and MDX only,
    // skipping files and directories whose name starts with `_`.
    await glob({ base: docsDir, pattern: '**/[^_]*.{md,mdx}' }).load(context);

    // Starlight reads `lastUpdated` from the Git history of a file inside
    // `src/content/docs`, so stamp the dates onto the entries instead. Entries
    // that set `lastUpdated` in their frontmatter keep that value.
    const root = fileURLToPath(context.config.root);
    for (const [id, entry] of context.store.entries()) {
      if (entry.data.lastUpdated !== undefined) continue;
      const lastUpdated = entry.filePath && lastCommitDate(root, entry.filePath);
      if (!lastUpdated) continue;

      // `store.set()` silently ignores an entry whose digest matches the one
      // already stored, so drop the entry first. Re-setting it this way keeps
      // the digest, which otherwise has to be discarded and would force a
      // re-render of every page on each sync.
      context.store.delete(id);
      context.store.set({ ...entry, id, data: { ...entry.data, lastUpdated } });
    }
  },
};

/** Date of the newest commit touching a repo-relative path, if any. */
function lastCommitDate(root: string, filePath: string): Date | undefined {
  try {
    const seconds = execFileSync(
      'git',
      // `--follow` keeps the original edit date when a file has been moved,
      // so relocating the docs directory does not reset every page's date.
      ['log', '-1', '--format=%ct', '--follow', '--', filePath],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    return seconds ? new Date(Number(seconds) * 1000) : undefined;
  } catch {
    // Not a Git checkout, or the file has no history yet.
    return undefined;
  }
}

export const collections = {
  docs: defineCollection({
    loader: docsLoader,
    schema: docsSchema(),
  }),
  home: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/home' }),
    schema: z.object({}),
  }),
  'client-tabs': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/client-tabs' }),
    schema: tabSchema,
  }),
  'hosting-tabs': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/hosting-tabs' }),
    schema: tabSchema,
  }),
};
