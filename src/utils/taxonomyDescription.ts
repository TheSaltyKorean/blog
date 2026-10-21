/**
 * Build a meta description for a /tag/ or /category/ listing page.
 *
 * Every taxonomy page used to ship one templated sentence — "All posts by
 * Randy Walker tagged X." / "All posts by Randy Walker in the X category." —
 * which across ~60 listing URLs is effectively the same description sixty
 * times over, differing only in one noun. Google routinely rewrites or ignores
 * boilerplate like that, and duplicate descriptions give a listing page nothing
 * to distinguish it from its neighbours in a SERP.
 *
 * Naming the post count, the year range, and the two most recent titles makes
 * each one genuinely unique and, more usefully, tells a searcher what is
 * actually behind the link before they click.
 */
const MAX_LENGTH = 158;

export interface TaxonomyPost {
  data: { title: string; date: Date };
}

export function taxonomyDescription(
  kind: 'tag' | 'category',
  display: string,
  posts: TaxonomyPost[],
): string {
  const count = posts.length;
  const noun = count === 1 ? 'post' : 'posts';
  const scope = kind === 'tag' ? `tagged ${display}` : `in ${display}`;

  const years = posts.map((p) => new Date(p.data.date).getFullYear());
  const oldest = Math.min(...years);
  const newest = Math.max(...years);
  const span = count && oldest !== newest ? `${oldest}–${newest}` : String(newest);

  const head = count
    ? `${count} ${noun} by Randy Walker ${scope}, ${span}.`
    : `Posts by Randy Walker ${scope}.`;

  // Newest first — the caller already sorts that way, but do not rely on it.
  const recent = [...posts]
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
    .slice(0, 2)
    .map((p) => p.data.title.trim());

  if (!recent.length) return head;

  const tail = ` Including ${recent.join(' · ')}.`;
  const full = head + tail;
  if (full.length <= MAX_LENGTH) return full;

  // Two titles overflowed; try one before falling back to the bare head.
  const one = `${head} Including ${recent[0]}.`;
  return one.length <= MAX_LENGTH ? one : head;
}
