import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const JEKYLL_POSTS = path.resolve('../thesaltykorean-blog/_posts');
const OUT_DIR = path.resolve('./src/content/blog');
const REPORT = path.resolve('./scripts/migrate-report.txt');
const EXISTING_TEST_POST = 'teaching-the-ai-how-i-write.md';

const JEKYLL_DROP_KEYS = new Set([
  'layout', 'wordpress_id', 'comments', 'published', 'excerpt_separator',
  'id', 'wordpress_url', 'guid', 'post_id',
]);

fs.mkdirSync(OUT_DIR, { recursive: true });

const toArray = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
  return [v].map(String);
};

const stripDatePrefix = (name) =>
  name.replace(/\.(md|markdown)$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');

const extractDate = (name) => {
  const m = name.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
};

const report = {
  scanned: 0,
  skipped_draft: 0,
  parse_errors: [],
  date_mismatches: [],
  liquid_warnings: [],
  written: 0,
  skipped_existing_match: 0,
  skipped_existing_diff: [],
};

const files = fs.readdirSync(JEKYLL_POSTS)
  .filter((f) => /\.(md|markdown)$/i.test(f))
  .sort();

for (const file of files) {
  report.scanned++;
  const abs = path.join(JEKYLL_POSTS, file);
  const raw = fs.readFileSync(abs, 'utf8');

  let fm, body;
  try {
    const parsed = matter(raw);
    fm = parsed.data || {};
    body = parsed.content || '';
  } catch (e) {
    report.parse_errors.push({ file, error: e.message.slice(0, 200) });
    continue;
  }

  if (fm.draft === true) {
    report.skipped_draft++;
    continue;
  }

  const slug = stripDatePrefix(file);
  const permalink = '/' + slug + '/';
  const fileDate = extractDate(file);

  // date mismatch check
  if (fm.date) {
    const fmDateStr = (fm.date instanceof Date)
      ? fm.date.toISOString().slice(0, 10)
      : String(fm.date).slice(0, 10);
    if (fileDate && fmDateStr !== fileDate) {
      report.date_mismatches.push({ file, filenameDate: fileDate, frontmatterDate: fmDateStr });
    }
  }

  // build normalized frontmatter
  const newFm = {
    title: fm.title || slug,
    date: fileDate || (fm.date ? String(fm.date).slice(0, 10) : null),
    permalink,
    author: fm.author || 'Randy Walker',
    categories: toArray(fm.categories),
    tags: toArray(fm.tags),
  };

  // preserve optional fields if present
  for (const k of ['post_image', 'meta_title', 'meta_description']) {
    if (fm[k] != null && fm[k] !== '') newFm[k] = fm[k];
  }

  // transform body
  let newBody = body
    .replace(/\{\{\s*site\.url\s*\}\}/g, '')
    .replace(/\{\{\s*site\.baseurl\s*\}\}/g, '');

  // detect remaining liquid tags
  const liquidTags = new Set();
  const liquidRe = /\{%\s*([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let m;
  while ((m = liquidRe.exec(newBody)) !== null) liquidTags.add(m[1]);
  if (liquidTags.size > 0) {
    report.liquid_warnings.push({ file, tags: [...liquidTags] });
  }

  // serialize
  const outPath = path.join(OUT_DIR, slug + '.md');
  const serialized = matter.stringify(newBody, newFm);

  if (file.includes(EXISTING_TEST_POST.replace('.md', '')) && fs.existsSync(outPath)) {
    // Phase 3 test post — don't overwrite; compare
    const existing = fs.readFileSync(outPath, 'utf8');
    if (existing.trim() === serialized.trim()) {
      report.skipped_existing_match++;
    } else {
      report.skipped_existing_diff.push(slug);
    }
    continue;
  }

  fs.writeFileSync(outPath, serialized);
  report.written++;
}

// Final count in OUT_DIR
const finalCount = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.md')).length;

// ---- write report ----
const lines = [];
lines.push(`Jekyll → Astro migration report`);
lines.push(`Scanned: ${report.scanned}`);
lines.push(`Skipped (draft): ${report.skipped_draft}`);
lines.push(`Written: ${report.written}`);
lines.push(`Skipped (Phase 3 test post unchanged): ${report.skipped_existing_match}`);
lines.push(`Skipped (Phase 3 test post diverged — review): ${report.skipped_existing_diff.length}`);
for (const s of report.skipped_existing_diff) lines.push(`  - ${s}`);
lines.push(`Final file count in src/content/blog/: ${finalCount}`);
lines.push('');
lines.push(`Parse errors: ${report.parse_errors.length}`);
for (const e of report.parse_errors) lines.push(`  ${e.file}: ${e.error}`);
lines.push('');
lines.push(`Date mismatches (filename vs frontmatter): ${report.date_mismatches.length}`);
for (const d of report.date_mismatches) lines.push(`  ${d.file}  filename=${d.filenameDate}  fm=${d.frontmatterDate}`);
lines.push('');
lines.push(`Liquid-tag warnings: ${report.liquid_warnings.length}`);
for (const l of report.liquid_warnings) lines.push(`  ${l.file}  tags=${l.tags.join(',')}`);

const text = lines.join('\n') + '\n';
fs.writeFileSync(REPORT, text);
console.log(text);
