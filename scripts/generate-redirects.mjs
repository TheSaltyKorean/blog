// Generates static .astro redirect pages, one per entry in src/data/redirects.ts.
// Each file is a standalone Astro page under src/pages/ at the legacy path,
// emitting a meta-refresh + canonical to the new target.
//
// We mirror the legacy URL structure inside src/pages/ using directory index
// files (src/pages/<path>/index.astro) so the Astro route exactly matches the
// legacy URL with trailingSlash='always'.
import fs from 'node:fs';
import path from 'node:path';

const REDIRECTS_FILE = path.resolve('./src/data/redirects.ts');
const PAGES_DIR = path.resolve('./src/pages');
const MARKER = '// generated-redirect';

// read redirects — tolerate the TS export format
const raw = fs.readFileSync(REDIRECTS_FILE, 'utf8');
const jsonMatch = raw.match(/redirects:\s*RedirectEntry\[\]\s*=\s*(\[[\s\S]*?\]);/);
if (!jsonMatch) {
  console.error('Could not parse redirects.ts');
  process.exit(1);
}
const redirects = JSON.parse(jsonMatch[1]);

// clean up any previously-generated redirect files (idempotent regen)
function cleanGenerated(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      cleanGenerated(p);
      // remove now-empty dirs
      if (fs.readdirSync(p).length === 0) fs.rmdirSync(p);
    } else if (name === 'index.astro') {
      const body = fs.readFileSync(p, 'utf8');
      if (body.includes(MARKER)) fs.unlinkSync(p);
    }
  }
}
cleanGenerated(PAGES_DIR);

// protected top-level names we must NOT overwrite (real routes)
// Protect top-level routes that would actually collide.
// `tag` and `category` directories are fine to write into — the dynamic
// [tag].astro / [category].astro only emit paths for tags/cats in the
// current post set, and Astro picks static routes over dynamic ones.
const PROTECTED_TOP = new Set([
  'index.astro', '404.astro', 'about.astro', 'contact.astro',
  '[slug].astro', 'page',
  'feed.xml.js', 'index.xml.js', 'llms.txt.ts',
]);

let written = 0;
let skipped = [];
for (const { from, to } of redirects) {
  const segments = from.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (segments.length === 0) continue;

  // safety: refuse to create a redirect that would overwrite a real top-level route
  if (PROTECTED_TOP.has(segments[0])) {
    skipped.push({ from, reason: `protected top-level segment ${segments[0]}` });
    continue;
  }

  const dir = path.join(PAGES_DIR, ...segments);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'index.astro');

  const content = `---
${MARKER}
const to = ${JSON.stringify(to)};
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <meta http-equiv="refresh" content={\`0; url=\${to}\`} />
    <link rel="canonical" href={\`https://thesaltykorean.com\${to}\`} />
    <meta name="robots" content="noindex" />
  </head>
  <body>
    <p>Redirecting to <a href={to}>{to}</a>…</p>
  </body>
</html>
`;
  fs.writeFileSync(file, content);
  written++;
}

console.log(`Wrote ${written} redirect stub(s).`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`);
  for (const s of skipped) console.log(`  ${s.from} — ${s.reason}`);
}
