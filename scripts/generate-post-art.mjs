#!/usr/bin/env node
/**
 * Generates the missing legacy post art through a local ComfyUI instance.
 *
 * Usage:
 *   node scripts/generate-post-art.mjs --dry-run        # show what would run
 *   node scripts/generate-post-art.mjs --limit 3        # try three first
 *   node scripts/generate-post-art.mjs                  # the whole batch
 *
 * Requires ComfyUI on http://127.0.0.1:8188 (override with COMFYUI_URL) with
 * an SD1.5 checkpoint. Start it with:
 *   docker compose -f /opt/comfyui/docker-compose.yml up -d
 *
 * Resumable by design: a post whose target .webp already exists is skipped, so
 * an interrupted run is just re-run. The GPU here is a 4 GB Quadro M2000M, so
 * expect roughly a minute per image and a couple of hours for all 128 — run it
 * in the background rather than waiting on it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { postsNeedingArt, promptFor, NEGATIVE } from './post-art-prompts.mjs';

const COMFY = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';
const CHECKPOINT = process.env.COMFY_CKPT || 'dreamshaper_8.safetensors';
const OUT_DIR = 'public/assets/images/blog';
const WIDTH = 768;
const HEIGHT = 432;

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx !== -1 ? Number(args[limitIdx + 1]) : Infinity;

/** Stable per-slug noise seed so even two identical prompts render differently. */
function seedFor(slug) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) { h ^= slug.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % 2 ** 31;
}

function workflow(prompt, seed) {
  return {
    3: { class_type: 'KSampler', inputs: {
      seed, steps: 28, cfg: 7, sampler_name: 'dpmpp_2m', scheduler: 'karras', denoise: 1,
      model: ['4', 0], positive: ['6', 0], negative: ['7', 0], latent_image: ['5', 0] } },
    4: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: CHECKPOINT } },
    5: { class_type: 'EmptyLatentImage', inputs: { width: WIDTH, height: HEIGHT, batch_size: 1 } },
    6: { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['4', 1] } },
    7: { class_type: 'CLIPTextEncode', inputs: { text: NEGATIVE, clip: ['4', 1] } },
    8: { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
    9: { class_type: 'SaveImage', inputs: { filename_prefix: 'tsk', images: ['8', 0] } },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function render(prompt, seed) {
  const res = await fetch(`${COMFY}/prompt`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt: workflow(prompt, seed) }),
  });
  if (!res.ok) throw new Error(`queue failed ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const { prompt_id } = await res.json();

  for (let i = 0; i < 600; i++) {
    await sleep(2000);
    const h = await (await fetch(`${COMFY}/history/${prompt_id}`)).json();
    const entry = h[prompt_id];
    if (!entry) continue;
    if (entry.status?.status_str === 'error') throw new Error('comfyui reported an error');
    const images = entry.outputs?.['9']?.images;
    if (images?.length) {
      const img = images[0];
      const q = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder || '', type: img.type || 'output' });
      const bin = await (await fetch(`${COMFY}/view?${q}`)).arrayBuffer();
      return Buffer.from(bin);
    }
  }
  throw new Error('timed out waiting for render');
}

/** Rewrites post_image in the post's front matter, leaving the body untouched. */
function setPostImage(file, target) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
  if (!m) return false;
  const updated = m[2].replace(/^post_image:.*$/m, `post_image: ${target}`);
  if (updated === m[2]) return false;
  fs.writeFileSync(file, src.replace(m[2], updated));
  return true;
}

const posts = postsNeedingArt().slice(0, LIMIT);
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`${posts.length} post(s) to render → ${OUT_DIR}`);
if (DRY) {
  posts.forEach((p) => console.log(`\n  ${p.slug}\n    ${promptFor(p)}`));
  process.exit(0);
}

let made = 0, skipped = 0, failed = 0;
for (const [i, post] of posts.entries()) {
  const out = path.join(OUT_DIR, `${post.slug}.webp`);
  const target = `/assets/images/blog/${post.slug}.webp`;
  if (fs.existsSync(out)) { setPostImage(post.file, target); skipped++; continue; }

  const label = `[${i + 1}/${posts.length}] ${post.slug.slice(0, 52)}`;
  try {
    const png = await render(promptFor(post), seedFor(post.slug));
    const tmp = path.join(OUT_DIR, `.${post.slug}.png`);
    fs.writeFileSync(tmp, png);
    execFileSync('magick', [tmp, '-resize', `${WIDTH}x${HEIGHT}^`, '-gravity', 'center',
      '-extent', `${WIDTH}x${HEIGHT}`, '-quality', '82', '-define', 'webp:method=6', out]);
    fs.unlinkSync(tmp);
    setPostImage(post.file, target);
    made++;
    console.log(`${label}  ok  ${(fs.statSync(out).size / 1024).toFixed(0)}KB`);
  } catch (err) {
    failed++;
    console.error(`${label}  FAILED  ${err.message}`);
  }
}
console.log(`\ndone — ${made} rendered, ${skipped} already present, ${failed} failed`);
