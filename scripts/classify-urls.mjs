import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('..');
const DIST = path.resolve('./dist');
const INDEXED = path.join(ROOT, 'tsk-indexed-urls.csv');
const NOT_FOUND = path.join(ROOT, 'tsk-404-urls.csv');
const NEW_URLS_OUT = path.join(ROOT, 'tsk-new-urls.txt');
const CLASS_OUT = path.join(ROOT, 'tsk-phase6-classification.csv');
const SUMMARY_OUT = path.join(ROOT, 'tsk-phase6-summary.txt');
const INVENTORY = path.join(ROOT, 'tsk-posts-inventory.csv');

// ---- walk dist for all built paths ----
function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const distFiles = walk(DIST);
const newPathsSet = new Set();
// We also need to find which built paths come from generated-redirect stubs,
// because we don't want to treat a stub as a "real" page when re-classifying.
// The stub Astro files carry a `// generated-redirect` marker. The built HTML
// ends up with a <meta http-equiv="refresh"> tag we can detect.
const REDIRECT_RE = /<meta http-equiv="refresh"/i;
function isStub(file) {
  try {
    const head = fs.readFileSync(file, 'utf8').slice(0, 600);
    return REDIRECT_RE.test(head);
  } catch { return false; }
}

for (const f of distFiles) {
  const rel = path.relative(DIST, f).replace(/\\/g, '/');
  if (rel.endsWith('/index.html') || rel === 'index.html') {
    if (isStub(f)) continue; // don't count redirect stubs as real pages
    const p = '/' + rel.replace(/index\.html$/, '');
    newPathsSet.add(p);
  } else if (rel.endsWith('.html') || rel.endsWith('.xml') || rel.endsWith('.txt')) {
    if (rel.endsWith('.html') && isStub(f)) continue;
    newPathsSet.add('/' + rel);
  }
}
const newPaths = [...newPathsSet].sort();
fs.writeFileSync(NEW_URLS_OUT, newPaths.join('\n') + '\n');

// Normalized set: both with & without trailing slash, for lookup
const newPathsNorm = new Set();
for (const p of newPaths) {
  newPathsNorm.add(p);
  if (p.endsWith('/') && p !== '/') newPathsNorm.add(p.slice(0, -1));
  else if (!p.endsWith('/') && !p.match(/\.[a-z]+$/i)) newPathsNorm.add(p + '/');
}

// ---- parse post inventory for Category E cross-ref ----
const inventorySlugs = new Set();
if (fs.existsSync(INVENTORY)) {
  const lines = fs.readFileSync(INVENTORY, 'utf8').split(/\r?\n/).slice(1);
  for (const l of lines) {
    if (!l) continue;
    const cols = l.split(',');
    const permalink = cols[1]; // computed_permalink column
    if (permalink) inventorySlugs.add(permalink.replace(/^\/+|\/+$/g, ''));
  }
}

// ---- parse indexed URLs ----
function parseCsv(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).slice(1);
  const out = [];
  for (const l of lines) {
    if (!l.trim()) continue;
    const url = l.split(',')[0].trim();
    if (!url) continue;
    let p = url.replace(/^https?:\/\/(www\.)?thesaltykorean\.com/i, '');
    if (!p) p = '/';
    // normalize /foo/index.html → /foo/  (GH Pages serves the former from the latter)
    p = p.replace(/\/index\.html\/?$/, '/');
    out.push({ original: url, path: p });
  }
  return out;
}

const indexed = parseCsv(INDEXED);
const notFound = parseCsv(NOT_FOUND);

// ---- classification logic ----
const SNOWLAKE_PREFIXES = [
  '/elements/', '/home-pages/', '/portfolio/', '/portfolios/',
  '/shop', '/services/index', '/contact/contact-', '/features/',
  '/blogs/', '/tags/', '/blog-post',
];

function isSnowlake(p) {
  if (p === '/shop/' || p === '/shop' || p === '/tags/' || p === '/tags') return true;
  return SNOWLAKE_PREFIXES.some((pre) => p.startsWith(pre));
}

const DATE_PATH_RE = /^\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/?$/;

const classified = [];
const catCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
const redirects = new Map(); // from -> to
const categoryE = [];

function inNew(p) {
  // strip trailing index.html — GH Pages serves /foo/ from /foo/index.html
  const stripped = p.replace(/\/index\.html$/, '/');
  if (newPathsNorm.has(stripped)) return true;
  const withSlash = stripped.endsWith('/') ? stripped : stripped + '/';
  return newPathsNorm.has(withSlash);
}

for (const { original, path: p } of indexed) {
  let category, action, target = '', notes = '';

  // A — already exists
  if (inNew(p)) {
    category = 'A';
    action = 'kept';
  }
  // B — date-prefixed legacy permalink
  else if (DATE_PATH_RE.test(p)) {
    const slug = p.match(DATE_PATH_RE)[4];
    const canonical = '/' + slug + '/';
    if (inNew(canonical)) {
      category = 'B';
      action = 'redirect';
      target = canonical;
      redirects.set(p.endsWith('/') ? p : p + '/', canonical);
    } else {
      category = 'E';
      action = 'unknown';
      notes = 'date-prefixed URL with no matching current post';
      categoryE.push({ url: p, note: notes });
    }
  }
  // C — Snowlake theme demo bleed
  else if (isSnowlake(p)) {
    category = 'C';
    action = 'redirect';
    target = '/';
    redirects.set(p.endsWith('/') ? p : p + '/', '/');
  }
  // D — orphaned category / tag
  else if (p.startsWith('/category/') || p.startsWith('/tag/')) {
    category = 'D';
    action = 'redirect';
    target = '/';
    notes = 'category/tag not in current set';
    redirects.set(p.endsWith('/') ? p : p + '/', '/');
  }
  // E — unknown
  else {
    category = 'E';
    action = 'unknown';
    const slug = p.replace(/^\/+|\/+$/g, '');
    if (inventorySlugs.has(slug)) {
      notes = `slug "${slug}" IS in posts inventory — migration bug, fix permalink`;
    } else {
      notes = `slug "${slug}" not in current inventory — likely deleted post`;
    }
    categoryE.push({ url: p, note: notes });
  }

  catCounts[category]++;
  classified.push({ url: original, path: p, category, action, target, notes });
}

// ---- classify 404s (no redirects, informational only) ----
const notFoundClassified = [];
for (const { original, path: p } of notFound) {
  let category, notes;
  if (inNew(p)) {
    category = 'A';
    notes = 'was 404 on Jekyll but now has a real page';
  } else if (DATE_PATH_RE.test(p)) {
    category = 'B-404';
    notes = 'date-prefixed 404';
  } else if (isSnowlake(p)) {
    category = 'C-404';
    notes = 'Snowlake 404, no action';
  } else {
    category = 'E-404';
    notes = 'already 404 — not preserved';
  }
  notFoundClassified.push({ url: original, path: p, category, notes });
}

// ---- write classification CSV ----
const csvEscape = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const header = ['url', 'path', 'category', 'action', 'target', 'notes'];
const csvLines = [header.join(',')];
for (const r of classified) csvLines.push(header.map((h) => csvEscape(r[h])).join(','));
csvLines.push('');
csvLines.push('# 404 URLs (from tsk-404-urls.csv) — informational only');
csvLines.push(['url', 'path', 'category', 'notes'].join(','));
for (const r of notFoundClassified) {
  csvLines.push(['url', 'path', 'category', 'notes'].map((h) => csvEscape(r[h])).join(','));
}
fs.writeFileSync(CLASS_OUT, csvLines.join('\n') + '\n');

// ---- emit redirects data file ----
const redirEntries = [...redirects.entries()]
  .map(([from, to]) => ({ from, to }))
  .sort((a, b) => a.from.localeCompare(b.from));

const redirTs = `// AUTO-GENERATED by scripts/classify-urls.mjs — do not edit by hand.
// Generated from tsk-indexed-urls.csv classification.
export interface RedirectEntry { from: string; to: string; }
export const redirects: RedirectEntry[] = ${JSON.stringify(redirEntries, null, 2)};
`;
fs.writeFileSync(path.resolve('./src/data/redirects.ts'), redirTs);

// ---- write summary ----
const summary = [];
summary.push(`Phase 6 URL parity classification summary`);
summary.push(`Generated: ${new Date().toISOString()}`);
summary.push('');
summary.push(`Total indexed URLs processed: ${indexed.length}`);
summary.push(`  A (kept as-is):              ${catCounts.A}`);
summary.push(`  B (date-prefixed → slug):    ${catCounts.B}`);
summary.push(`  C (Snowlake demo → /):       ${catCounts.C}`);
summary.push(`  D (orphaned tag/cat → /):    ${catCounts.D}`);
summary.push(`  E (unknown — needs review):  ${catCounts.E}`);
summary.push('');
summary.push(`Redirect stubs to generate: ${redirEntries.length}`);
summary.push('');
summary.push(`Category E (needs Randy's review):`);
if (categoryE.length === 0) summary.push('  (none)');
for (const e of categoryE) summary.push(`  ${e.url}   — ${e.note}`);
summary.push('');
summary.push(`404 URLs in tsk-404-urls.csv: ${notFound.length}`);
summary.push(`  (informational only, no redirects created)`);
fs.writeFileSync(SUMMARY_OUT, summary.join('\n') + '\n');

console.log(summary.join('\n'));
console.log('');
console.log(`Wrote: ${NEW_URLS_OUT}`);
console.log(`Wrote: ${CLASS_OUT}`);
console.log(`Wrote: ${SUMMARY_OUT}`);
console.log(`Wrote: src/data/redirects.ts (${redirEntries.length} entries)`);
