---
title: "Teaching the AI How I Write"
date: 2026-03-30
permalink: /teaching-the-ai-how-i-write/
author: "Randy Walker"
categories: [building, ai, meta]
tags: [ai, claude, writing, skill, consistency]
meta_description: "How I built a style-guide skill to keep my writing voice consistent across blog posts when working with Claude."
---

Writing a bunch of blog posts in a single session with AI is a good way to notice something you otherwise wouldn't: the voice drifts.

Not dramatically. Not in any way a casual reader would catch. But enough that you look back at the first post and the fifth post and feel a slight difference in cadence, word choice, energy. And if you're building two blogs with four distinct content modes — each with different audiences, different rules, different things they can and cannot say — that drift compounds fast.

The fix was obvious. Build a style guide and turn it into a skill.

## What a Skill Actually Is

In the context of working with Claude, a skill is a structured markdown file with YAML frontmatter that lives in the project knowledge base. When I ask for a blog post, Claude loads it automatically and works from the rules inside — voice, tone, structure, content boundaries, a do-not-use list, and a table of established facts that should appear consistently across every post.

It is, in miniature, the same principle as the 100+ page spec driving the platform build. Define the rules once in a durable artifact. Let the execution layer work from them. Stop re-explaining things you already decided.

## The Do-Not-Use List

This turned out to be more valuable than I expected.

Building it forced me to name phrases I had started noticing but hadn't articulated. "Here we are" — overused, retired. Certain words that read as filler. Framings that default to negative when the voice should lead positive. Tropes that sneak in when the AI is filling space rather than making a point.

Writing them down was the act of going from instinct to rule. And rules are what make behavior transferable to a tool that has no access to your instincts.

## The Established Facts Table

The other piece I'm glad I built. A table of facts that should never vary across posts — numbers, references, timestamps, framing choices. The spec is consistently 100+ pages and 23 modules. A Fortune 100 company is always "a Fortune 100 company," never named. The competitor outage has a specific timestamp that should be cited the same way every time.

These are the details that quietly erode credibility when they drift. A reader might not consciously notice that the spec was "over 100 pages" in one post and "nearly 90 pages" in another. But they feel it. Consistency compounds in the same direction as inconsistency — you just prefer one of those directions.

## Four Content Modes, One Skill

The skill covers all four combinations across the two blogs — two content types each, tech and community. Each has its own audience, its own tone, its own list of things it can and cannot reference.

That last part matters more than it sounds. The two blogs have strict separation rules — content that belongs on one actively doesn't belong on the other. Without a persistent document enforcing those boundaries, I'm relying on remembering to specify them every session. Which I will do until I don't.

## What I Learned Building It

The process of writing a style guide forces you to describe something you usually just do. What does "salty" mean as a tone? It is not negative, not cynical, not complaining. It is self-aware, confident, occasionally weary in a good way — and the default posture is always positive. Salt is texture, not the main dish. That distinction is real and it took a few attempts to write down in a way that an AI can actually use.

The other thing I learned: the posts themselves are what produced the skill. I didn't sit down and write a style guide in the abstract. I wrote posts, noticed what worked and what didn't, made corrections, and then distilled those corrections into rules. The skill is the compressed, reusable output of that iteration.

Which is, come to think of it, exactly how the platform spec got built too.

## What Changes Now

Every blog writing session starts with the voice already loaded. No re-explaining the tone. No reminding which blog we're writing for and what that implies. Just the topic, the section, and a result that sounds like it came from the same person as the last one.

That is the whole point.

— Randy
