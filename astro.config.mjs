import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { redirects } from './src/data/redirects';

const redirectPaths = new Set(redirects.map((r) => r.from));

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
        return !redirectPaths.has(pathname);
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
