---
title: "I Let AI Write My Code for a Week. Here's My Honest Report."
date: '2026-04-13'
post_image: /assets/images/blog/i-let-ai-write-my-code-for-a-week.webp
permalink: /i-let-ai-write-my-code-for-a-week/
author: Randy Walker
categories:
  - building
  - ai
tags:
  - claude-code
  - agentic-ai
  - spec-driven-development
  - salty-poker
  - methodology
---

There is a difference between asking AI to help you write a function and asking it to build your company.

GitHub Copilot suggests an autocomplete as you type. That is prompt-response AI — you ask, it answers. What I ran for the past ten days was different. An agent — an AI model with tools, context, and a working copy of your repository — running autonomously for hours, writing hundreds of files, running database migrations, committing changes, opening pull requests.

One answers questions. The other executes work.

I ran twenty-two build sessions against a 100-page specification, 23 token-optimized modules. Each session hands a module to the agent. The agent reads the current state of the codebase, picks up where the last session left off, and builds the next piece. I define what needs to exist. The agent makes it exist.

[salty.poker](https://salty.poker) — a real-money online poker platform — is the output of those twenty-two sessions.

## What It Actually Takes

I reviewed every line. That is the job. The architect reviews the output and decides whether it meets the spec. When it does not, the spec gets updated and the session gets corrected. This is not passive work. It requires understanding the system well enough to know when something is wrong.

Nearly 30 years in technology. Third company. The first time you do not know what you do not know. The second time you know and move faster than you should anyway. The third time, you have the receipts from both previous experiences and you build the process to reflect them.

One of those receipts: shortcuts taken early compound into debt you pay later, with interest, in places you forgot you borrowed from. Spec-driven development is the methodology I built specifically to not pay that tax. The spec is written before the code. The agent implements the spec. When the spec is wrong, the spec gets updated and the session gets corrected. The document stays current. The debt does not accumulate quietly.

## What the Week Actually Looked Like

The build sessions ran against real production infrastructure. The sessions produced 20+ microservices. The test suite passed.

Then the testing phase started.

End-to-end testing — where everything has to work together, in sequence, in a real browser against a real environment — is where integration failures live. Not because the methodology produced bad code. Because this is what integration testing always reveals. The units work in isolation. Then you find out if they work as a system.

This week was that phase. Routing bugs. Data format mismatches. An auth guard checking a context value that was never populated. A development environment silently ignoring every code change I made.

Each one was findable. None were obvious until the full stack ran.

## What This Series Covers

This is post one of four. The next three walk through the specific failures, how I traced them, and what they required of the person at the keyboard — as opposed to the agent.

The cleaner version of this story — where the code comes out right and integration is seamless — is a story someone else is telling. This is the one that actually happened.

The parallel series for the poker-community audience runs over on [salty.poker](https://salty.poker/we-built-salty-poker-with-ai-heres-the-part-nobody-saw).

— Randy