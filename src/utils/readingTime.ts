/**
 * Whole minutes to read a post body, at 220 wpm.
 *
 * Fenced code is stripped before counting: nobody reads a config block at
 * prose speed, and several posts here are mostly code, which otherwise
 * inflates the estimate to something visibly wrong.
 */
export function readingTime(body: string | undefined): number | undefined {
  if (!body) return undefined;
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, ' ');
  const words = prose.split(/\s+/).filter(Boolean).length;
  return words > 0 ? Math.max(1, Math.round(words / 220)) : undefined;
}
