/**
 * Whether a post's `post_image` is artwork made FOR that post.
 *
 * The migrated archive gives every post a `post_image`, but only some of those
 * are real: 32 posts point at bespoke art under `/assets/images/blog/`, and the
 * other 128 share about twenty generic wallpapers under `/assets/images/art/`.
 * One of those wallpapers is reused by twelve different posts, so rendering
 * `post_image` unconditionally puts the same picture three times on one screen
 * of an archive page.
 *
 * The split is purely by directory — verified against the whole collection:
 * every `/blog/` image is used by exactly one post, and no `/art/` image is
 * ever bespoke (even the four that happen to be referenced once). So the rule
 * is a path check, not a usage count.
 *
 * Where this returns false the UI falls back to a year block, which keeps the
 * row's alignment instead of leaving a hole.
 */
export function hasBespokeImage(image?: string): image is string {
  return typeof image === 'string' && image.startsWith('/assets/images/blog/');
}

/** The image to render, or undefined when the post only has a shared wallpaper. */
export function bespokeImage(image?: string): string | undefined {
  return hasBespokeImage(image) ? image : undefined;
}
