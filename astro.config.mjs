import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { redirects } from './src/data/redirects';

const redirectPaths = new Set(redirects.map((r) => r.from));

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
      if (!Number.isNaN(d.getTime())) map.set(permalink, d.toISOString());
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
        // Legacy space-bearing tag URLs (/tag/business%20help/) are emitted as
        // redirect stubs to their slugified equivalent. They stay crawlable so
        // Google can follow them, but they must not be advertised in the
        // sitemap alongside the canonical /tag/business-help/.
        if (/^\/tag\/[^/]*(%20|\s)/.test(pathname)) return false;
        // A noindex page must not be advertised in the sitemap — telling Google
        // "crawl this" and "do not index this" at once is a contradictory signal.
        if (noindexPaths.has(pathname)) return false;
        return !redirectPaths.has(pathname);
      },
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        const lastmod = lastmodByPath.get(pathname);
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
