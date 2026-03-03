---
layout: posts/post-sidebar
title: "Apparently What I've Been Doing Has a Name"
date: 2026-03-03
author: Randy Walker
categories: [building, ai, development]
tags: [spec-driven-development, agentic-ai, startup, claude]
post_image: /assets/images/art/thumb/bg13.webp
badge_color: bg-blue
---

Spec-driven development. Who knew that was a thing?

I did, apparently — I just didn't know what to call it. Turns out I've been doing it this whole time, building a whole methodology around it, and all I was missing was the name.

Heeki Park, a Principal Solutions Architect at AWS, published a piece titled *Using Spec-Driven Development with Claude Code* and reading it felt less like learning something new and more like finally finding the label for something I'd already been doing on purpose for months.

## What Spec-Driven Development Actually Means

Park references a taxonomy by Birgitta Böckeler that breaks it down into three levels:

- **Spec-first**: write a thorough spec before any code gets written, then use it to drive AI-assisted development
- **Spec-anchored**: keep the spec alive and updated even after features ship — it evolves with the project
- **Spec-as-source**: the spec *is* the primary artifact; the human only ever touches the spec, never the code directly

Park also names a fourth category — **spec-once** — where the spec launches the project and then quietly gets abandoned as you get deeper into the build. The spec starts as the blueprint and ends up as a relic.

That's the failure mode I've been obsessing over avoiding since day one.

## What We've Been Building

Before a single line of production code was written, I wrote a specification. Over 100 pages. Twenty-three modules covering every domain of the platform — infrastructure, database schema, API contracts, service boundaries, compliance controls, CI/CD pipelines, operational runbooks.

The modular structure isn't just organization for organization's sake — it's deliberate context management. Each AI session loads two to four relevant modules, giving the agent a focused, high-quality slice of context instead of throwing 100 pages at it and hoping for the best. Each session has a defined scope. A checkpoint gates the next phase. Nothing moves forward until the prior checklist is done.

That's spec-first. But we've also been doing something closer to spec-anchored — the spec updates as decisions get made, as edge cases surface, as the architecture evolves. It's a living document that stays in sync with reality, not a snapshot that ages out the moment you close it.

Reading Park's taxonomy, we're solidly between spec-first and spec-anchored — and that's exactly where I intend to stay.

## The Part That Validated Everything

What Park's article nails — and what matches our experience completely — is that the quality of AI output is almost entirely a function of the quality of the spec. Time spent upfront in planning pays real dividends downstream. Better inputs, less course-correcting, fewer moments of wondering whether the whole thing needs to start over.

He also talks about the shift toward agentic AI — where the model executes multi-step workflows autonomously within defined boundaries rather than just responding to prompts one at a time. That's exactly the shift that makes this approach viable for a solo founder building something that would otherwise require a team.

## Why This Landed the Way It Did

I've started two businesses before this one. Both times, the same lesson: ambiguity is debt. Decisions you defer become problems you inherit. Specs you skip become architecture you regret.

Spec-driven development is the methodology built around not doing that. It just took someone writing it up properly for me to realize I'd been building toward it all along.

Turns out the instinct was right. Now it's got a name, a framework, and a community of people converging on the same conclusion.

That's a good feeling.

*Link to the original article: [Using Spec-Driven Development with Claude Code](https://heeki.medium.com/using-spec-driven-development-with-claude-code-4a1ebe5d9f29) by Heeki Park.*

— Randy
