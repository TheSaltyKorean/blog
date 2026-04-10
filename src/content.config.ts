import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Randy Walker'),
    post_image: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    permalink: z.string(),
    layout: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
