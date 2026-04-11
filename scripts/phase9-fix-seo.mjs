// Phase 9 — align robots.txt and sitemap with Phase 6 redirect stubs.
// Dry-run by default; pass --apply to actually write files.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const APPLY = process.argv.includes('--apply');

const REDIRECTS_FILE = path.resolve('./src/data/redirects.ts');
const ROBOTS_FILE = path.resolve('./public/robots.txt');
const BLOG_DIR = path.resolve('./src/content/blog');

function die(msg) { console.error('STOP: ' + msg); process.exit(1); }

// ---- Step 1: load stubs from redirects.ts (the single source of truth) ----
const redirRaw = fs.readFileSync(REDIRECTS_FILE, 'utf8');
const arrMatch = redirRaw.match(/redirects:\s*RedirectEntry\[\]\s*=\s*(\[[\s\S]*?\]);/);
if (!arrMatch) die('src/data/redirects.ts does not match expected shape (named export `redirects: RedirectEntry[]`).');
let stubs;
try {
  stubs = JSON.parse(arrMatch[1]);
} catch (e) {
  die('Could not JSON-parse the redirects array: ' + e.message);
}
if (!Array.isArray(stubs) || stubs.some((s) => typeof s.from !== 'string')) {
  die('redirects entries missing `from` field');
}
const normalize = (p) => {
  let x = p.trim();
  if (!x.startsWith('/')) x = '/' + x;
  if (!x.endsWith('/') && !/\.[a-z0-9]+$/i.test(x)) x += '/';
  return x.toLowerCase();
};
const stubPaths = new Set(stubs.map((s) => normalize(s.from)));
const stubPathsRaw = new Set(stubs.map((s) => s.from));
console.log(`\n[1] Loaded ${stubs.length} stubs from src/data/redirects.ts`);
if (stubs.length !== 87) die(`expected 87 stubs, found ${stubs.length}`);

// ---- Step 2: parse current robots.txt ----
const robotsRaw = fs.readFileSync(ROBOTS_FILE, 'utf8');
const robotsLines = robotsRaw.split(/\r?\n/);
const disallows = [];
robotsLines.forEach((line, i) => {
  const m = line.match(/^Disallow:\s*(\S.*)$/);
  if (m) disallows.push({ lineIndex: i, raw: line, prefix: m[1].trim() });
});
console.log(`[2] Found ${disallows.length} Disallow rules in public/robots.txt`);

// ---- Step 3: classify each Disallow rule against stubs ----
// Rule matches a stub if the stub's normalized path starts with the rule's prefix.
const classified = disallows.map((d) => {
  const prefixNorm = d.prefix.toLowerCase();
  const hits = [...stubPaths].filter((sp) => sp.startsWith(prefixNorm));
  return { ...d, hits, action: hits.length > 0 ? 'REMOVE' : 'KEEP' };
});

console.log('\n[3] Disallow rule classification:');
console.log('  ACTION   HITS  RULE');
for (const c of classified) {
  console.log(`  ${c.action.padEnd(7)} ${String(c.hits.length).padEnd(5)} Disallow: ${c.prefix}`);
}
const removeCount = classified.filter((c) => c.action === 'REMOVE').length;
const keepCount = classified.filter((c) => c.action === 'KEEP').length;
console.log(`  → REMOVE=${removeCount}  KEEP=${keepCount}`);

// ---- Step 4: rewrite robots.txt — drop REMOVE lines ----
const removeLineIdx = new Set(classified.filter((c) => c.action === 'REMOVE').map((c) => c.lineIndex));
// Determine which of the ORIGINAL lines are "# Block ..." comments whose
// entire Disallow section was removed. We only consider a comment orphaned if,
// after its removal point, the very next Disallow/Allow in the original file
// was itself removed (or there isn't one before another comment).
const origDisallowIdx = disallows.map((d) => d.lineIndex);
const origRemoveSet = removeLineIdx;
function isOrphanedBlockComment(origIdx) {
  const line = robotsLines[origIdx];
  if (!/^#\s*Block\b/i.test(line)) return false;
  // A "Block ..." section owns all Disallow/Allow lines until the next comment
  // or EOF. The section is orphaned iff every such rule was removed.
  let any = false, allRemoved = true;
  for (let k = origIdx + 1; k < robotsLines.length; k++) {
    const l = robotsLines[k];
    if (/^#/.test(l)) break;
    if (/^(Disallow|Allow):/i.test(l)) {
      any = true;
      if (!origRemoveSet.has(k)) allRemoved = false;
    }
  }
  return any && allRemoved;
}
const removeCommentIdx = new Set();
for (let i = 0; i < robotsLines.length; i++) {
  if (isOrphanedBlockComment(i)) removeCommentIdx.add(i);
}
const allRemoveIdx = new Set([...removeLineIdx, ...removeCommentIdx]);
const newRobotsLinesRough = robotsLines.filter((_, i) => !allRemoveIdx.has(i));
const newRobotsLines = newRobotsLinesRough;
// Collapse runs of blank lines to single blank
const compacted = [];
for (const l of newRobotsLines) {
  if (l.trim() === '' && compacted.length > 0 && compacted[compacted.length - 1].trim() === '') continue;
  compacted.push(l);
}
const newRobots = compacted.join('\n').replace(/\n+$/, '\n');

console.log('\n[4] robots.txt BEFORE:\n----');
console.log(robotsRaw.replace(/\n$/, ''));
console.log('----\n[4] robots.txt AFTER:\n----');
console.log(newRobots.replace(/\n$/, ''));
console.log('----');

// ---- Step 5: patch astro.config.mjs ----
const CONFIG = path.resolve('./astro.config.mjs');
const configBefore = fs.readFileSync(CONFIG, 'utf8');

const configAfter = `import { defineConfig } from 'astro/config';
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
`;

console.log('\n[5] astro.config.mjs BEFORE:\n----');
console.log(configBefore.replace(/\n$/, ''));
console.log('----\n[5] astro.config.mjs AFTER:\n----');
console.log(configAfter.replace(/\n$/, ''));
console.log('----');

// ---- Step 6: verify no real post permalink overlaps with a stub path ----
const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
const realPermalinks = [];
for (const f of blogFiles) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8');
  const { data } = matter(raw);
  if (data && typeof data.permalink === 'string') {
    realPermalinks.push(data.permalink.trim());
  }
}
console.log(`\n[6] Loaded ${realPermalinks.length} real post permalinks`);
const overlaps = realPermalinks.filter((p) => stubPathsRaw.has(p));
if (overlaps.length) {
  console.error('STOP: real post permalinks overlap with stub paths:');
  for (const o of overlaps) console.error('  ' + o);
  process.exit(1);
}
console.log('[6] OK — no real post permalink collides with a stub path');

// ---- Step 7: verify no real post is blocked by the new robots.txt rules ----
const keptDisallows = classified.filter((c) => c.action === 'KEEP').map((c) => c.prefix.toLowerCase());
const blocked = [];
for (const p of realPermalinks) {
  const pn = p.toLowerCase();
  for (const rule of keptDisallows) {
    if (pn.startsWith(rule)) { blocked.push({ p, rule }); break; }
  }
}
if (blocked.length) {
  console.error('STOP: real post permalinks blocked by KEPT Disallow rules:');
  for (const b of blocked) console.error(`  ${b.p}  (matches Disallow: ${b.rule})`);
  process.exit(1);
}
console.log('[7] OK — no real post blocked by remaining Disallow rules');

// ---- Apply ----
if (APPLY) {
  fs.writeFileSync(ROBOTS_FILE, newRobots);
  fs.writeFileSync(CONFIG, configAfter);
  console.log('\n[apply] Wrote robots.txt and astro.config.mjs');
} else {
  console.log('\n[dry-run] No files written. Re-run with --apply to commit changes.');
}
