---
layout: posts/post-sidebar
title: "Spec-Driven Development Needed a Rewrite"
date: 2026-03-04
author: Randy Walker
categories: [building, ai, development]
tags: [spec-driven-development, agentic-ai, startup, claude, governance]
post_image: /assets/images/art/thumb/bg14.webp
badge_color: bg-blue
---

Last post I talked about finding out that [what I've been doing has a name](https://thesaltykorean.com/building/ai/development/2026/03/03/spec-driven-development.html). Spec-driven development. Heeki Park's article, Birgitta Böckeler's taxonomy, the whole thing. It was validating. It was exciting. It was also, after about forty-eight hours of actually thinking about it, incomplete.

Not wrong. Incomplete.

## The Part That Didn't Survive Contact With Reality

Park's article is good. I want to be clear about that. His breakdown of the planning-first approach, the stepwise build philosophy, the emphasis on small testable chunks — all of that maps directly to what I've been doing. Böckeler's taxonomy gave me the vocabulary to describe it. Spec-first. Spec-anchored. Spec-as-source. I'm between the first two, and that's where I want to be.

But here's the thing neither of them addresses: what happens when you're not just using Claude Code?

Park's workflow is Claude Code sessions. One tool. You plan, you prompt, you build, you iterate. That works when your entire interaction model is a single agent operating in a single repo with a single context window. His project is a focused AWS prototype — self-contained, manageable scope, spec and code living in the same conversation.

I'm building a production platform. Twenty-three spec modules. Twenty-one build sessions. Multiple service boundaries. CI/CD pipelines. My AI workflow isn't one tool — it's two tools with fundamentally different capabilities, and a human in the middle holding it all together.

That's where spec-driven development, as described, starts to crack.

## Two Tools, Two Jobs, One Spec

Cowork is where I think. Claude Code is where I build.

That's not because one can't do the other's job — Cowork is agentic, it can run code, execute tests, touch files. But optimizing for one thing means deprioritizing another. Cowork excels at reasoning, iterating on documents, making architectural decisions, and holding the full context of why a decision was made across multiple sessions. Claude Code is purpose-built for repo operations — it understands project structure, has native git integration, and is designed for focused build sessions where every token of context goes toward writing and testing code.

The moment you try to use one tool for both jobs, you burn context budget. Load 1,200 lines of spec modules plus a full service implementation plus test output into Cowork, and there's no room left for the reasoning it's actually good at. Use Claude Code to debate architectural trade-offs across six modules, and you've consumed the context window before writing a single line of code. Each tool works best when it stays in its lane — not because it's incapable of crossing over, but because crossing over makes both jobs worse.

Park doesn't have this problem because he's using one tool. Böckeler's taxonomy doesn't address it because the taxonomy describes *levels* of spec commitment, not *operational topology*. Neither of them has to answer the question: when the reasoning tool and the execution tool can't talk to each other, how do you keep the spec honest?

The answer, it turns out, is you build governance into the spec itself.

## The Holes I Couldn't Ignore

Once I started looking at spec-driven development through the lens of a two-tool workflow, three failure modes jumped out immediately.

**Silent deviation.** Claude Code makes a reasonable choice during a build session. Tests pass. Code works. But the spec says something different. Nobody catches it because the spec lives in one context and the code lives in another. Over time, the spec becomes fiction. This is the spec-once decay that Park himself warns about — but the two-tool split accelerates it because there's no shared memory between reasoning and execution.

**Cross-module blind spots.** One session builds a service from module A. The next session builds a different service from module B. Each session loads its own modules and builds in isolation. If the two modules made conflicting assumptions about a shared interface — different error codes, different data shapes, different lifecycle expectations — neither session's unit tests catch it. They're both internally consistent. They're just not consistent with each other.

**Discovered requirements that never flow back.** During a build session, the implementation needs something the spec didn't anticipate. Claude Code adds it, logs a deviation, moves on. But the spec module doesn't get updated. The next session that references that subsystem is now working from a spec that doesn't match reality. And because each session only loads its assigned modules, it can't even see the discrepancy.

Every one of these is a feedback loop failure. And every one of them is made worse by the Cowork/Code split, because the tool that makes decisions and the tool that discovers ground truth operate in separate context windows with no automated sync.

## So I Built a Governance Module

I wrote a new spec module that bolts onto the existing system and addresses all three problems. Here's what it does.

**It codifies the tool division.** Cowork owns spec, business documents, and reconciliation. Claude Code owns code, tests, and commits. I'm the bridge. Neither tool does the other's job. This sounds obvious but it matters to write it down, because AI will happily generate production code in a chat window if you let it, and it will happily make architectural decisions in a code session if you don't tell it not to.

**It replaces passive deviation logging with structured feedback loops.** The old system had a "Spec Deviations" section in a checkpoint file. That's fine as a log. It's useless as a governance mechanism because it relies entirely on the AI self-reporting and the human remembering to check. The new system introduces three distinct structures: a gap log (the spec was silent, Claude Code had to decide), a deviation log (the spec was explicit, Claude Code chose differently), and cross-module interface contracts — typed, diffable TypeScript files that downstream sessions import instead of reading markdown tables.

**It adds reconciliation gates.** Six reconciliation sessions inserted into the build sequence at natural phase boundaries. Each one is a Cowork session (not Claude Code) where I review every gap and deviation, decide whether the spec or the code is right, and produce a structured patch document. The spec doesn't update casually. It updates through a defined process with traceability.

**It enforces with CI, not just process.** A governance module that relies on everyone remembering the rules is a governance module that erodes under deadline pressure. So the system includes CI scripts that fail the PR if code changed but the checkpoint wasn't updated, if a contract file is declared but doesn't exist, or if a contract exists but has no conformance test. Process rules backed by automated gates.

**It defines what "conservative" means.** When Claude Code hits a spec gap, it's told to "choose the most conservative interpretation." But conservative is meaningless without a definition. So the module defines six prioritized rules — things like data integrity first, prefer idempotency, strict input validation, deny-by-default for permissions, fail loudly over fail silently, and append-only for audit records. Every gap log references the specific rule applied. No more ambiguous judgment calls.

## What Spec-Driven Development Actually Needs

Park is right that time spent planning pays dividends. Böckeler is right that the taxonomy matters — spec-once is a failure mode, spec-anchored is the goal. None of that changes.

What changes is the recognition that spec-driven development as described assumes a single-agent workflow. One tool, one context, one feedback loop. The moment you introduce a second tool — or a team, or a CI pipeline, or any kind of compliance requirement — you need governance that the original concept doesn't provide.

The spec isn't just an input to the AI. It's a contract between your reasoning process and your execution process. And contracts need enforcement mechanisms.

I didn't throw out spec-driven development. I kept everything that works and added the parts that were missing for the way I actually build. The taxonomy still applies. The planning-first philosophy still holds. The modular context management still matters.

It just also needs reconciliation sessions, CI gates, interface contracts, conservative defaults, and a hotfix protocol. Because ambiguity is still debt, and now I have two tools that can accumulate it independently.

That's not a criticism of anyone's article. That's just what happens when you try to apply a framework to a build that's more complex than a prototype. You find the edges. You fill the gaps. You write the governance module.

And then you go build the thing.

*Link to the original article: [Using Spec-Driven Development with Claude Code](https://heeki.medium.com/using-spec-driven-development-with-claude-code-4a1ebe5d9f29) by Heeki Park.*
*Link to the taxonomy: [Understanding Spec-Driven-Development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) by Birgitta Böckeler.*

— Randy
