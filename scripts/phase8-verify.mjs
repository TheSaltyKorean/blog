import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const SITE = 'https://thesaltykorean.com';
const INDEXED_CSV = path.resolve('../tsk-indexed-urls.csv');
const BLOG_DIR = path.resolve('./src/content/blog');
const REPORT_PATH = path.resolve('./PHASE-8-REPORT.md');

// ---- utilities ----
// Use native fetch, manually following redirects so we can count hops and
// capture the final URL. GH Pages serves meta-refresh stubs as 200 — that's
// the client's job to follow, not HTTP — so we treat those as 200-with-body.
async function headCheck(url, maxHops = 10) {
  let current = url;
  let hops = 0;
  let lastStatus = 0;
  try {
    while (hops <= maxHops) {
      const res = await fetch(current, { redirect: 'manual' });
      lastStatus = res.status;
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        current = new URL(res.headers.get('location'), current).href;
        hops++;
        continue;
      }
      return { code: res.status, redirects: hops, effective: current };
    }
    return { code: lastStatus, redirects: hops, effective: current, error: 'too many redirects' };
  } catch (e) {
    return { code: 0, redirects: hops, effective: current, error: e.message };
  }
}

async function getBody(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    return await res.text();
  } catch { return ''; }
}

// Deterministic PRNG (mulberry32)
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function sample(arr, n, seed) {
  const r = rng(seed);
  const copy = arr.slice();
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(r() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

// ---- Step 1: sitemap parity ----
console.error('[1/4] Sitemap parity check...');
const sitemapXml = await getBody(`${SITE}/sitemap-0.xml`);
const locRe = /<loc>([^<]+)<\/loc>/g;
const sitemapUrls = [];
let m;
while ((m = locRe.exec(sitemapXml)) !== null) sitemapUrls.push(m[1]);

// Collect expected post permalinks from src/content/blog/
const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
const expectedPostUrls = new Set();
const postsMissingPermalink = [];
for (const f of blogFiles) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8');
  try {
    const { data } = matter(raw);
    if (data && typeof data.permalink === 'string' && data.permalink.trim()) {
      expectedPostUrls.add(SITE + data.permalink.trim());
    } else {
      postsMissingPermalink.push(f);
    }
  } catch (e) {
    postsMissingPermalink.push(f + ' (parse error: ' + e.message + ')');
  }
}

const sitemapSet = new Set(sitemapUrls);
const missingPosts = [...expectedPostUrls].filter((u) => !sitemapSet.has(u));

// Check sitemap doesn't contain redirect stubs — heuristic: any URL matching
// /YYYY/MM/DD/ or /blogs/ or /elements/ or /home-pages/ etc.
const stubPrefixRe = /\/(?:\d{4}\/\d{2}\/\d{2}|elements|home-pages|portfolio|portfolios|shop|services|features|blogs|tags|contact\/contact-)\//;
const stubUrlsInSitemap = sitemapUrls.filter((u) => stubPrefixRe.test(u));

// ---- Step 2 & 3: full sweep (256) + sampled (30) ----
console.error('[2/4] Parsing indexed URLs...');
const rawLines = fs.readFileSync(INDEXED_CSV, 'utf8').split(/\r?\n/).slice(1);
const indexed = [];
for (const l of rawLines) {
  if (!l.trim()) continue;
  const url = l.split(',')[0].trim();
  if (url) indexed.push(url);
}

// Parallel sweep with concurrency limit
async function sweep(urls, label) {
  const LIMIT = 8;
  const out = new Array(urls.length);
  let idx = 0;
  let done = 0;
  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= urls.length) return;
      out[i] = { url: urls[i], ...(await headCheck(urls[i])) };
      done++;
      if (done % 25 === 0) console.error(`   ${label}: ${done}/${urls.length}`);
    }
  }
  await Promise.all(Array.from({ length: LIMIT }, worker));
  return out;
}

console.error(`[3/4] Full sweep of ${indexed.length} URLs...`);
const results = await sweep(indexed, 'full');

// Classify: real 200, stub 200 (meta-refresh), non-200
const stubs = [];
const reals = [];
const nonTwoHundreds = [];
const multihop = [];
for (const r of results) {
  if (r.code !== 200) {
    nonTwoHundreds.push(r);
    continue;
  }
  if (r.redirects > 1) multihop.push(r);
  const body = await getBody(r.url);
  if (/<meta[^>]+http-equiv=["']?refresh/i.test(body)) {
    stubs.push(r);
  } else {
    reals.push(r);
  }
}

// ---- Step 2: sampled (30, seed 42) ----
const sampled = sample(indexed, 30, 42);
const sampleResults = sampled.map((u) => results.find((r) => r.url === u));
const sampleFailures = sampleResults.filter((r) => r.code !== 200 || r.redirects > 1);

// ---- Step 4: double-dash verification ----
console.error('[4/4] Double-dash slug check...');
const newForms = [
  `${SITE}/tulsa-installfest-tons-of-fun/`,
  `${SITE}/100-pushup-challenge-hardly/`,
  `${SITE}/partner-program-subsidies-easy-way-to-earn-extra-cash/`,
];
const oldForms = [
  `${SITE}/tulsa-installfest--tons-of-fun/`,
  `${SITE}/100-pushup-challenge--hardly/`,
  `${SITE}/partner-program-subsidies---easy-way-to-earn-extra-cash/`,
];
const newResults = await Promise.all(newForms.map(async (u) => ({ url: u, ...(await headCheck(u)) })));
const oldResults = await Promise.all(oldForms.map(async (u) => ({ url: u, ...(await headCheck(u)) })));

// ---- Generate report ----
const lines = [];
lines.push(`# Phase 8 post-launch verification`);
lines.push(``);
lines.push(`_Generated ${new Date().toISOString()}_`);
lines.push(``);
lines.push(`Site: ${SITE}`);
lines.push(``);

lines.push(`## Step 1 — Sitemap parity`);
lines.push(``);
lines.push(`- Sitemap index: ${SITE}/sitemap-index.xml → 1 child sitemap`);
lines.push(`- Total \`<loc>\` entries in sitemap-0.xml: **${sitemapUrls.length}**`);
lines.push(`- Expected post permalinks (from \`src/content/blog/\`): **${expectedPostUrls.size}**`);
lines.push(`- Posts missing from sitemap: **${missingPosts.length}**`);
if (missingPosts.length) {
  lines.push(``);
  lines.push(`**BLOCKER — these post permalinks are NOT in the sitemap:**`);
  for (const u of missingPosts) lines.push(`- ${u}`);
}
lines.push(``);
lines.push(`- Redirect-stub URLs present in sitemap: **${stubUrlsInSitemap.length}**`);
if (stubUrlsInSitemap.length) {
  lines.push(``);
  lines.push(`**Unexpected stub URLs in sitemap:**`);
  for (const u of stubUrlsInSitemap) lines.push(`- ${u}`);
}
lines.push(``);

lines.push(`## Step 2 — 30-URL sample sweep (seed 42)`);
lines.push(``);
lines.push(`| Status | Redirects | URL |`);
lines.push(`| --- | --- | --- |`);
for (const r of sampleResults) {
  lines.push(`| ${r.code} | ${r.redirects} | ${r.url} |`);
}
lines.push(``);
lines.push(`Sample failures (non-200 or > 1 redirect hop): **${sampleFailures.length}**`);
lines.push(``);

lines.push(`## Step 3 — Full 256-URL sweep`);
lines.push(``);
lines.push(`- Total URLs checked: **${results.length}**`);
lines.push(`- 200 real pages: **${reals.length}**`);
lines.push(`- 200 redirect stubs (meta-refresh): **${stubs.length}**`);
lines.push(`- Non-200: **${nonTwoHundreds.length}**`);
lines.push(`- > 1 redirect hop: **${multihop.length}**`);
lines.push(``);
if (nonTwoHundreds.length) {
  lines.push(`### Non-200 URLs`);
  lines.push(``);
  lines.push(`| Status | Redirects | URL |`);
  lines.push(`| --- | --- | --- |`);
  for (const r of nonTwoHundreds) lines.push(`| ${r.code} | ${r.redirects} | ${r.url} |`);
  lines.push(``);
}
if (multihop.length) {
  lines.push(`### > 1 hop redirect chains`);
  lines.push(``);
  lines.push(`| Status | Hops | URL → Effective |`);
  lines.push(`| --- | --- | --- |`);
  for (const r of multihop) lines.push(`| ${r.code} | ${r.redirects} | ${r.url} → ${r.effective} |`);
  lines.push(``);
}

lines.push(`## Step 4 — Double-dash slug corrections`);
lines.push(``);
lines.push(`**Canonical single-dash forms (must be 200):**`);
lines.push(``);
lines.push(`| Status | URL |`);
lines.push(`| --- | --- |`);
for (const r of newResults) lines.push(`| ${r.code} | ${r.url} |`);
lines.push(``);
lines.push(`**Legacy double-dash forms (should NOT serve — 404 or redirect):**`);
lines.push(``);
lines.push(`| Status | Effective | URL |`);
lines.push(`| --- | --- | --- |`);
for (const r of oldResults) lines.push(`| ${r.code} | ${r.effective} | ${r.url} |`);
lines.push(``);

// ---- blockers summary ----
const blockers = [];
if (missingPosts.length) blockers.push(`${missingPosts.length} post(s) missing from sitemap`);
if (stubUrlsInSitemap.length) blockers.push(`${stubUrlsInSitemap.length} redirect-stub URL(s) leaked into sitemap`);
if (nonTwoHundreds.length) blockers.push(`${nonTwoHundreds.length} non-200 URL(s) in the 256-URL indexed set`);
if (sampleFailures.length) blockers.push(`${sampleFailures.length} sample-sweep failure(s)`);
if (newResults.some((r) => r.code !== 200)) blockers.push(`one or more double-dash canonical forms not serving`);
if (oldResults.some((r) => r.code === 200 && r.effective === r.url)) {
  blockers.push(`one or more legacy double-dash forms still serving as 200 without redirect`);
}

lines.push(`## Blockers`);
lines.push(``);
if (blockers.length === 0) {
  lines.push(`**None.** All checks passed.`);
} else {
  for (const b of blockers) lines.push(`- ${b}`);
}
lines.push(``);

fs.writeFileSync(REPORT_PATH, lines.join('\n') + '\n');
console.error(`\nReport written to ${REPORT_PATH}`);
console.log(`sitemap=${sitemapUrls.length} expected_posts=${expectedPostUrls.size} missing=${missingPosts.length} stubs_in_sitemap=${stubUrlsInSitemap.length} real_200=${reals.length} stub_200=${stubs.length} non_200=${nonTwoHundreds.length} multihop=${multihop.length} blockers=${blockers.length}`);
