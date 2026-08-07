/**
 * Canonical slug for tag and category URLs.
 *
 * Must be the single source of truth for both route generation
 * (src/pages/tag/[tag].astro, src/pages/category/[category].astro) and every
 * place that links to those routes (BlogPost.astro, BlogCard.astro). When the
 * two disagree, posts emit links to URLs that were never built — which is what
 * happened before this existed: tags were routed at `toLowerCase().trim()` but
 * linked raw, so "Business Help" was built at `/tag/business help/` and linked
 * as `/tag/Business Help/`, a 404.
 *
 * Dots are preserved so ".Net" stays readable in slugs like
 * `northwest-arkansas-.net-user-group`, matching the post permalinks that
 * already use that form (e.g. /fort-smith-.net-user-group-forming/).
 */
export function slugify(value: string): string {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9.-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
}

/**
 * The pre-slugify route key: lowercase + trim only. Used to emit redirect
 * stubs from the legacy space-bearing URLs (/tag/business help/) that Google
 * has already indexed. Returns null when the legacy form matches the new slug,
 * i.e. when there is nothing to redirect.
 */
export function legacySlug(value: string): string | null {
  const legacy = String(value).toLowerCase().trim();
  return legacy && legacy !== slugify(value) ? legacy : null;
}
