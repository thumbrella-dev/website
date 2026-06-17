import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';

const tabSchema = z.object({
  label: z.string(),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
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
