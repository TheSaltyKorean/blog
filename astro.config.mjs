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
