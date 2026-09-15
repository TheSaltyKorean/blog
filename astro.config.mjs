import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { redirects } from './src/data/redirects';
import { slugify } from './src/utils/slugify';

const redirectPaths = new Set(redirects.map((r) => r.from));

/*
 * Newest post date per /tag/<slug>/ and /category/<slug>/.
 *
 * Taxonomy pages are half the sitemap and used to ship with no <lastmod> at
 * all, so Google had no freshness signal for any of them and stopped
 * revisiting: as of Sep 2026 the 41 tag URLs in the sitemap-filtered "Blocked
 * by robots.txt" report were all last crawled in March, still reflecting a
 * robots.txt rule removed on 2026-08-04. A tag page changes whenever a post
 * joins it, so the newest post in the tag is its real modification date.
 */
const taxonomyLastmod = new Map();

function noteTaxonomy(prefix, values, iso) {
  for (const raw of values) {
    const slug = slugify(raw);
    if (!slug) continue;
    const key = `/${prefix}/${slug}/`;
    const prev = taxonomyLastmod.get(key);
    if (!prev || iso > prev) taxonomyLastmod.set(key, iso);
  }
}

// Front matter uses both `tags: [a, b]` and the block form `tags:\n  - a`.
function parseList(fm, field) {
  const inline = fm.match(new RegExp(`^${field}:\\s*\\[(.*)\\]\\s*$`, 'm'));
  if (inline) {
    return inline[1]
      .split(',')
      .map((v) => v.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  const block = fm.match(new RegExp(`^${field}:\\s*\\n((?:\\s*-\\s*.+\\n?)+)`, 'm'));
  if (block) {
    return block[1]
      .split('\n')
      .map((line) => line.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  return [];
}

/*
 * permalink -> publication date, read straight off the markdown.
 *
 * Feeds <lastmod> into the sitemap. Without it the sitemap gives Google no
 * freshness signal at all, which matters most for the 2007-2010 archive: those
 * URLs have nothing else telling a crawler whether they are worth revisiting.
 * Reading the files here rather than through the content collection because
 * astro.config runs before the collection exists.
 */
const noindexPaths = new Set();

function postDates() {
  const dir = 'src/content/blog';
  const map = new Map();
  if (!fs.existsSync(dir)) return map;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const src = fs.readFileSync(path.join(dir, file), 'utf8');
    const fm = src.split('---')[1] || '';
    const permalink = fm.match(/^permalink:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');
    const date = fm.match(/^date:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');
    if (permalink && /^noindex:\s*true\s*$/m.test(fm)) noindexPaths.add(permalink);
    if (permalink && date) {
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) {
        const iso = d.toISOString();
        map.set(permalink, iso);
        noteTaxonomy('tag', parseList(fm, 'tags'), iso);
        noteTaxonomy('category', parseList(fm, 'categories'), iso);
      }
    }
  }
  return map;
}

const lastmodByPath = postDates();

export default defineConfig({
  site: 'https://thesaltykorean.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        if (pathname === '/thank-you/' || pathname === '/404' || pathname === '/404/') return false;
        if (/^\/(elements|home-pages|portfolio|blogs|contact\/contact-)/.test(pathname)) return false;
        // Legacy tag URLs (/tag/business%20help/, /tag/.net/, /tag/RegEx/) are
        // emitted as noindex redirect stubs pointing at their slugified
        // equivalent. They stay crawlable so Google can follow them, but must
        // not be advertised in the sitemap alongside the canonical URL.
        //
        // Test the slug itself rather than looking for a space: slugify() also
        // strips leading dots and lowercases, so ".Net" canonicalises to
        // /tag/net/ and leaves a space-free legacy stub at /tag/.net/. That one
        // leaked into the sitemap and is the single "Excluded by 'noindex' tag"
        // entry in the sitemap-filtered Search Console report. A canonical slug
        // is a fixed point of slugify(); anything else is a stub.
        const taxonomy = pathname.match(/^\/(tag|category)\/([^/]+)\/$/);
        if (taxonomy && decodeURIComponent(taxonomy[2]) !== slugify(decodeURIComponent(taxonomy[2]))) {
          return false;
        }
        // A noindex page must not be advertised in the sitemap — telling Google
        // "crawl this" and "do not index this" at once is a contradictory signal.
        if (noindexPaths.has(pathname)) return false;
        return !redirectPaths.has(pathname);
      },
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        const lastmod = lastmodByPath.get(pathname) ?? taxonomyLastmod.get(pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: 'directory',
  },
});
