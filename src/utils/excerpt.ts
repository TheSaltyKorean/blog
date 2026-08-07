/**
 * Derive a meta description from a post's raw markdown body.
 *
 * Only 8 of 160 posts carry an explicit `meta_description`. Without a fallback
 * the other 152 inherit `siteConfig.description`, so every one of them shipped
 * the same generic blurb to search results regardless of the query — the
 * likeliest cause of pages ranking on page one and still earning no clicks
 * (/spam-domains/ sat at position 7.8 with a 0% CTR).
 *
 * An explicit `meta_description` in front matter always wins; this is the
 * floor, not the ceiling.
 */
const MAX_LENGTH = 155;

export function excerpt(body: string, maxLength: number = MAX_LENGTH): string {
  const text = String(body ?? '')
    // Fenced code blocks, then inline code.
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    // Images before links, so alt text does not survive as prose.
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Raw HTML tags and MDX-ish expressions.
    .replace(/<[^>]+>/g, ' ')
    // Leading block markers: headings, quotes, list bullets, table pipes.
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}\d+\.\s+/gm, '')
    .replace(/^\s*\|.*$/gm, ' ')
    // Horizontal rules.
    .replace(/^\s{0,3}([-*_])\s*(\1\s*){2,}$/gm, ' ')
    // Emphasis markers.
    .replace(/(\*\*|__|\*|_)/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';
  if (text.length <= maxLength) return text;

  // Prefer a sentence boundary, otherwise fall back to a word boundary.
  const window = text.slice(0, maxLength + 1);
  const sentenceEnd = window.search(/[.!?](?=\s|$)(?!.*[.!?](?=\s|$))/);
  if (sentenceEnd >= Math.floor(maxLength * 0.6)) {
    return window.slice(0, sentenceEnd + 1).trim();
  }

  const lastSpace = window.lastIndexOf(' ');
  const cut = lastSpace > 0 ? lastSpace : maxLength;
  return text.slice(0, cut).replace(/[,;:.\-\s]+$/, '') + '…';
}
