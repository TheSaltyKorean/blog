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
    /**
     * Keep the page live but out of the index.
     *
     * Used for the 2007-2010 announcement archive — meetings, giveaways and
     * conference notices for events that happened eighteen years ago. Those
     * cannot be developed into anything rankable (there is nothing to expand
     * a "conference sold out!" post into), and deleting them would throw away
     * link equity and add a wave of 404s. noindex keeps them readable and
     * linked from /archive/ while taking them out of the crawl budget and out
     * of the site's quality average.
     */
    noindex: z.boolean().default(false),
  }),
});

export const collections = { blog };
