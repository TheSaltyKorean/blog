import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteConfig } from '../data/siteConfig';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => data.draft !== true))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.meta_description || '',
      link: post.data.permalink,
      author: post.data.author,
      categories: post.data.categories,
    })),
  });
}
