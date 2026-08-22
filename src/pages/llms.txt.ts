import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../data/siteConfig';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => data.draft !== true))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, 10);

  const recent = posts
    .map((p) => {
      const url = new URL(p.data.permalink, context.site).href;
      const desc = (p.data.meta_description || '').replace(/\s+/g, ' ').trim().slice(0, 150);
      return `- [${p.data.title}](${url})${desc ? ': ' + desc : ''}`;
    })
    .join('\n');

  const body = `# The Salty Korean — Randy Walker

> Randy Walker is a technology leader, founder, and builder based in Austin, Texas. Nearly 30 years in enterprise technology. Currently building the Salty Poker Network (salty.poker) — Texas' first online poker platform with no rake, provably fair dealing, and verified human players. Third company. Building it right this time.

## About Randy Walker

Randy Walker (The Salty Korean) is the founder of SK Meridian LLC and the creator of salty.poker. A career enterprise technologist turned startup founder, Randy writes about AI-assisted development, spec-driven architecture, building companies, and the Texas poker industry.

Previously: two prior companies (not named publicly), leadership roles including President of a Fortune 100 subsidiary. Microsoft MVP award winner. ASP Insider. Nearly 30 years building enterprise software.

Now: solo founder using agentic AI (Claude Code, Cowork) and a 100+ page, 23-module spec to build an online poker platform from scratch on Azure.

## What This Blog Covers

- **AI-Assisted Development**: How agentic AI differs from prompt-response AI. Context window management, session structure, token efficiency. AI executes, Randy architects.
- **Spec-Driven Development**: Building a complex platform from a detailed specification. Why the spec matters more than the code.
- **Founder Journey**: Third-company lessons. What it means to build alone. The discipline, the frustration, and the forward motion.
- **Texas Poker Industry**: The private club model, regulatory landscape, and what building a poker platform as a Christian in a politically complex space looks like.

## Related Sites

- [salty.poker](https://salty.poker) — The poker platform Randy is building. Texas online poker with no rake, provably fair dealing, bot-free tables.
- [SK Meridian](https://skmeridian.com) — The company behind salty.poker.

## Recent Blog Posts

${recent}

## Contact

- Website: ${siteConfig.url}
- Twitter: ${siteConfig.socialUrls.twitter}
- LinkedIn: ${siteConfig.socialUrls.linkedin}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
