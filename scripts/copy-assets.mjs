import fs from 'node:fs';
import path from 'node:path';

const MANIFEST = path.resolve('../tsk-assets-manifest.txt');
const SRC = path.resolve('../thesaltykorean-blog');
const DEST = path.resolve('./public');

const paths = fs.readFileSync(MANIFEST, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

let copied = 0;
let missing = [];
for (const p of paths) {
  const rel = p.replace(/^\/+/, '');
  const src = path.join(SRC, rel);
  const dst = path.join(DEST, rel);
  if (!fs.existsSync(src)) {
    missing.push(p);
    continue;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  copied++;
}

console.log(`Copied: ${copied} / ${paths.length}`);
if (missing.length) {
  console.log('Missing:');
  for (const m of missing) console.log('  ' + m);
}
