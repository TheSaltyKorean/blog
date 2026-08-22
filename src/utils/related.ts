/**
 * Picks related posts for the bottom of an article.
 *
 * This is an SEO fix as much as a reading one. Nothing in a post body links to
 * another post, so before this the 2007-2010 archive was orphaned: the only
 * routes in were pagination (sixteen pages deep) and tag pages. Related links
 * give every post inbound internal links from its neighbours.
 *
 * Scoring favours shared tags over shared categories — categories here are
 * broad ("building", "ai") and would otherwise just return the newest post in
 * the category every time. Ties break toward the closest publication date, so
 * an old post tends to surface other old posts rather than always pointing at
 * this year's content.
 */
interface Post {
  data: { title: string; date: Date; permalink: string; tags: string[]; categories: string[] };
}

export function relatedPosts<T extends Post>(current: T, all: T[], limit = 3): T[] {
  const tags = new Set((current.data.tags || []).map((t) => t.toLowerCase()));
  const cats = new Set((current.data.categories || []).map((c) => c.toLowerCase()));
  const when = new Date(current.data.date).getTime();

  return all
    .filter((p) => p.data.permalink !== current.data.permalink)
    .map((p) => {
      const sharedTags = (p.data.tags || []).filter((t) => tags.has(t.toLowerCase())).length;
      const sharedCats = (p.data.categories || []).filter((c) => cats.has(c.toLowerCase())).length;
      const score = sharedTags * 3 + sharedCats;
      const gap = Math.abs(new Date(p.data.date).getTime() - when);
      return { post: p, score, gap };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.gap - b.gap)
    .slice(0, limit)
    .map((r) => r.post);
}
