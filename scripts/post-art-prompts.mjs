/**
 * Per-post art prompts for the legacy archive.
 *
 * 128 posts (2007–2010) share about twenty generic wallpapers under
 * /assets/images/art/. hasBespokeImage() in src/utils/postImage.ts hides those,
 * so those rows currently render a year block. This builds one prompt per post
 * so the batch can be generated and the fallback retired.
 *
 * House style is deliberately the DARK cinematic direction of the existing
 * /assets/images/blog/ art (see the homelab post), not the bright 3D-render
 * direction (see patent-pending). Two reasons: the site is dark-first now, and
 * a 128-image batch needs one coherent look or the archive turns into a
 * jumble. The accent is the site's own cyan.
 *
 * Subjects are objects and spaces, never people — faces are the thing local
 * SD1.5 gets worst, and a wrong face is more distracting than an empty room.
 */
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = 'src/content/blog';

export const STYLE =
  'cinematic still life photograph, dark moody studio lighting, deep near-black ' +
  'charcoal background, single cyan teal rim light, shallow depth of field, ' +
  'subtle volumetric haze, fine detail, photorealistic, wide 16:9 composition, ' +
  'centered subject, empty negative space';

export const NEGATIVE =
  'text, words, letters, typography, watermark, signature, logo, ui, screenshot, ' +
  'people, person, face, hands, blurry, low quality, jpeg artifacts, oversaturated, ' +
  'cluttered, busy, collage, frame, border';

/** Ordered: first match wins, so put specific themes above generic ones. */
const RULES = [
  [/airplane|aviation|flight|flying|airport|jet\b/i, 'a single small aircraft silhouetted on a dark empty apron at night, runway lights receding'],
  [/silverlight|wpf|expression blend|animation/i, 'a single pane of translucent frosted glass standing upright on a dark desk, light refracting through its edge'],
  [/\bsql\b|database|data warehouse|reporting services|\bdba\b|query/i, 'a dark server rack with one illuminated drive bay pulled halfway out, neat coiled cables'],
  [/resharper|refactor|visual studio|compiler|regex|powertoy|debug|intellisense|snippet|source code|\bide\b/i, 'a mechanical keyboard on a dark desk lit from one side, a faint glow spilling across the keys'],
  [/installer|installaware|setup|msi\b|deployment package/i, 'a matte metal flight case standing open on a dark floor, foam cutouts empty, lit from within'],
  [/lawsuit|antitrust|legal|contract|patent|license|copyright|court/i, 'a single brass balance scale on a dark desk, one pan slightly lower, hard side light'],
  [/user group|ineta|devlink|code camp|meeting|summit|conference|tech ?fest|launch event|speaking|presentation|keynote/i, 'an empty auditorium in near-darkness, a single lit lectern facing rows of vacant seats'],
  [/msdn|book|magazine|documentation|whitepaper|webcast|training|course|learning|tutorial|how ?to/i, 'a stack of thick technical manuals on a dark table, the top one open, edge-lit'],
  [/giveaway|free |discount|offer|coupon|voucher|contest|win a|promo/i, 'a plain unmarked cardboard box open on a dark surface, soft warm light coming from inside'],
  [/certification|exam|mcp\b|credential|award|\bmvp\b|insider|recognition/i, 'a single embossed metal plate resting on dark slate, catching a thin cyan edge light'],
  [/game|gaming|xbox|\baoe\b|age of empires|halo|player/i, 'a worn game controller resting on dark fabric, one thin cyan light along its edge'],
  [/browser|internet explorer|firefox|chrome|\bie\d|standards|css|html/i, 'an empty picture frame of brushed steel standing on a dark surface, cyan light passing through it'],
  [/search|seo|google|bing|index/i, 'a jeweller loupe standing upright on dark slate, a single point of cyan light through the lens'],
  [/virtual|hyper-?v|vmware|emulator|sandbox/i, 'three identical matte cubes stacked unevenly on a dark surface, cyan light between them'],
  [/lightswitch|framework|platform|toolkit|library|\bapi\b|component/i, 'an exploded arrangement of matte machined parts hovering in dark space, cyan rim light'],
  [/windows|vista|operating system|server 2008|\bos\b/i, 'four translucent glass panels suspended in darkness in a loose grid, faint cyan underlight'],
  [/check|invoice|accounting|finance|money|pricing|cost|budget|tax/i, 'a fountain pen resting on a blank ledger page on a dark desk, one warm lamp'],
  [/partner|program|business|sponsor|company|startup|licensing|enterprise|consulting/i, 'a long dark boardroom table with two empty chairs under a single overhead lamp'],
  [/arkansas|fort smith|northwest|tulsa|dallas|local|regional|community|chapter/i, 'an empty meeting room at night, city lights blurred through a rain-flecked window'],
  [/security|spam|phish|virus|patch|vulnerab|firewall|password|encrypt/i, 'a heavy steel padlock on a dark steel surface, one cyan light raking across it'],
  [/azure|cloud|hosting|deploy|scale|server farm/i, 'layered translucent slabs floating above one another in darkness, cyan light between the layers'],
  [/network|router|wifi|bandwidth|\bisp\b|ethernet|dns/i, 'a bundle of patch cables converging into a dark switch, port LEDs glowing faintly'],
  [/phone|mobile|device|zune|ipod|hardware|gadget|laptop|tablet/i, 'a single unbranded handheld device face-down on dark felt, screen edge glowing'],
  [/blog|writing|post|\brss\b|social|twitter|feed|comment/i, 'an open blank notebook on a dark desk beside a fountain pen, one lamp lighting the page'],
  [/photo|image|video|streaming|olympics|media|camera|silverlight streaming/i, 'a vintage camera lens standing alone on dark stone, cyan light curving across the glass'],
  [/music|guitar|song|band|audio|podcast/i, 'an acoustic guitar leaning against a dark wall, a single warm light from the left'],
  [/\bcar\b|truck|drive|road|travel|commute|traffic/i, 'an empty night highway seen from a low angle, wet asphalt reflecting cyan light'],
  [/health|depress|value|worth|\blife\b|family|personal|christmas|thanksgiving|holiday|birthday|custody|child/i, 'a single ceramic mug on a dark windowsill, soft pre-dawn light outside'],
  [/bulgogi|beignet|food|recipe|eat|restaurant|cook|dinner|coffee/i, 'a single ceramic bowl on a dark wooden table, steam rising through one warm side light'],
  [/korea|trip to|abroad|passport|vacation|visit to/i, 'a worn leather suitcase standing closed in a dark room, a boarding pass resting on the lid'],
  [/relationship|letting go|adoption|marriage|friend|grief|loss|story|catching people up/i, 'two empty chairs facing a dark window, one shaft of pale light across the floor'],
  [/pushup|challenge|fitness|running|workout|weight|gym/i, 'a pair of worn running shoes on a dark floor, a single shaft of light across them'],
  [/recession|economy|stimulus|credit|bank|hiring|jobs|unemploy|line of credit/i, 'an empty wire inbox tray on a dark desk under one dim lamp'],
  [/congratulations|thanks to|kudos|honou?r|tribute|farewell/i, 'a simple faceted glass award standing on dark slate, cyan light refracting through it'],
  [/rant|opinion|why |geek|chic|questions|wishing|wasted/i, 'a vintage broadcast microphone on a dark table, one hard light from above'],
  [/hd-?dvd|blu-?ray|format war|wal-?mart|retail|disc/i, 'a fan of unlabelled optical discs spread on a dark surface, cyan sheen across them'],
  [/ballmer|\bceo\b|letter|memo|leadership|manage/i, 'a single sealed envelope on a dark desk beside a brass letter opener, one warm lamp'],
  [/\bssl\b|certificate|fedex|shipping|logistics/i, 'a wax-sealed document tube standing upright on dark slate, cyan edge light'],
  [/green|environment|energy|yule|fireplace|climate/i, 'a single bare filament bulb hanging in darkness, warm glow against cold shadow'],
  [/microsoft|\.net|\bnet\b|technical|computing|initiative|developer|programming|software/i, 'a precision machined metal component resting on dark slate, one cyan light along its milled edge'],
];

/**
 * Deterministic per-post variation.
 *
 * Several themes match a lot of posts — nineteen of them are user-group
 * write-ups. Without this, that is nineteen renders of the same lectern.
 * Seeding the camera and light off the slug keeps them recognisably the same
 * family while making each frame its own image.
 */
const VIEWS = [
  'low camera angle', 'high three-quarter view', 'eye-level straight on',
  'overhead flat lay', 'tight close-up', 'wide establishing framing',
];
const LIGHTS = [
  'light from hard left', 'light from hard right', 'backlit with rim glow',
  'soft top light', 'low raking light', 'single practical light in frame',
];
const MOODS = [
  'faint dust in the air', 'a cold haze', 'clean dry air',
  'a faint reflection on the surface below', 'deep shadow falloff', 'subtle lens bloom',
];

function seed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}
export function variationFor(slug) {
  const h = seed(slug);
  return [VIEWS[h % VIEWS.length], LIGHTS[(h >>> 3) % LIGHTS.length], MOODS[(h >>> 7) % MOODS.length]].join(', ');
}

const FALLBACK = 'an abstract arrangement of matte geometric slabs and coiled cable on a dark surface, one cyan rim light';

export function subjectFor(title, tags = '') {
  const hay = `${title} ${tags}`;
  for (const [re, subject] of RULES) if (re.test(hay)) return subject;
  return FALLBACK;
}

function frontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}
/**
 * Reads one front-matter field, including YAML folded/literal scalars.
 *
 * Several posts write `title: >-` with the value on the following indented
 * lines. A one-line regex returns the literal ">-" as the title, which
 * silently left three posts with no usable subject.
 */
const field = (fm, key) => {
  const lines = fm.split(/\r?\n/);
  const i = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (i === -1) return '';
  const inline = lines[i].slice(key.length + 1).trim();
  if (inline && !/^[>|][-+]?$/.test(inline)) return inline.replace(/^["']|["']$/g, '');
  const out = [];
  for (let j = i + 1; j < lines.length; j++) {
    if (!/^\s/.test(lines[j]) || !lines[j].trim()) break;
    out.push(lines[j].trim());
  }
  return out.join(' ').replace(/^["']|["']$/g, '');
};

/** Posts whose post_image is a shared wallpaper rather than bespoke art. */
export function postsNeedingArt() {
  return fs.readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const file = path.join(BLOG_DIR, f);
      const fm = frontmatter(fs.readFileSync(file, 'utf8'));
      return {
        file,
        slug: f.replace(/\.md$/, ''),
        title: field(fm, 'title'),
        date: field(fm, 'date'),
        tags: field(fm, 'tags'),
        permalink: field(fm, 'permalink'),
        image: field(fm, 'post_image'),
      };
    })
    .filter((p) => p.title && !p.image.startsWith('/assets/images/blog/'))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function promptFor(post) {
  return `${subjectFor(post.title, post.tags)}, ${variationFor(post.slug)}, ${STYLE}`;
}

if (process.argv[1] && process.argv[1].endsWith('post-art-prompts.mjs')) {
  const posts = postsNeedingArt();
  const manifest = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    target: `/assets/images/blog/${p.slug}.webp`,
    prompt: promptFor(p),
    negative: NEGATIVE,
  }));
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(manifest, null, 2));
  } else {
    console.log(`${manifest.length} posts need art\n`);
    for (const m of manifest.slice(0, 8)) {
      console.log(`  ${m.date.slice(0, 10)}  ${m.title}`);
      console.log(`    → ${m.prompt.slice(0, 110)}…\n`);
    }
    const counts = {};
    for (const p of posts) { const s = subjectFor(p.title, p.tags); counts[s] = (counts[s] || 0) + 1; }
    console.log('subject distribution:');
    Object.entries(counts).sort((a, b) => b[1] - a[1])
      .forEach(([s, n]) => console.log(`  ${String(n).padStart(3)}  ${s.slice(0, 76)}`));
  }
}
