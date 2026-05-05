---
title: "The Iteration Loop Is Still the Job"
date: 2026-04-17
post_image: /assets/images/blog/the-iteration-loop-is-still-the-job.webp
permalink: /the-iteration-loop-is-still-the-job/
author: "Randy Walker"
categories: [building, ai]
tags: [claude-code, agentic-ai, docker, debugging, methodology]
meta_description: "Spec-driven agentic development compresses the build phase. It does not eliminate the iteration loop. A debugging story from this week and what it says about the methodology."
---

Let me tell you what happened when the fixes went in and nothing changed.

The routes were corrected. The state endpoint was rewritten to return the right format. The auth guard was updated to use the right authentication check. Every change was confirmed in the repository. Refreshed the browser.

Same broken table. Same blank canvas.

This is a specific experience that software developers know well and that is hard to explain to people outside the field: the correctness of a fix and the effectiveness of a fix are not the same thing. Your code can be right and the running system can still not reflect it.

## What Was Actually Happening

The development environment runs in Docker. The web application is volume-mounted -- source files on disk are mapped directly into the container, so changes should appear immediately. Vite, the build tool, watches for file changes and hot-reloads the browser.

Except on Windows with Docker over WSL2 -- the Linux compatibility layer Windows uses for containers -- the filesystem event notifications that Vite depends on do not propagate across the virtualization boundary. Linux's inotify system reports the change. Windows does not forward it to the Docker container. Vite never sees the file update. The browser keeps serving the old code.

The fix: one line. `usePolling: true`. Vite polls the filesystem on a 300-millisecond interval instead of waiting to be notified. Problem solved -- but not until the container was restarted to pick up the configuration change.

The backend service had its own version of the same problem. It runs without watch mode, which is standard for a production-grade service. Code changes require restarting the container. You have to know to restart it.

Neither problem was in the code. Both required knowing the environment.

## What This Means for the Methodology

I get asked whether spec-driven agentic development eliminates the hard parts of building software.

It does not. What it does: it front-loads the design thinking, compresses the build phase, and produces code that is more consistently structured than code written under deadline pressure by a distributed team making independent judgment calls. But the iteration loop is still the job.

Bugs surface. Integration failures happen. Environments have quirks that no specification can fully anticipate. The spec does not describe every Docker networking behavior or every Windows filesystem virtualization limitation.

What changes is the pace. A traditional engineering team would have spent most of a day working through what we traced and fixed in a few hours. Not because a traditional team is slower -- because there would have been more context to gather, more files to navigate, more people to sync. The agent-assisted loop compresses the iteration. It does not remove it.

Nearly 30 years of building software. The loop has always been the job. It is still the job. It is just smaller now.

## Why the Loop Is Smaller

The compression happens because the spec exists before the sessions start, the sessions reference the spec, and the spec updates as decisions are made. The methodology is built into the tool itself rather than living as a Confluence page nobody reads. There is no drift between what was agreed and what gets built, because the agreement is the input.

The environment bug this week was a setback measured in hours, not days. That is not luck. That is what happens when the diagnostic process is systematic and the context is managed.

The salty.poker blog has a [parallel post](https://salty.poker/none-of-those-fixes-worked-after-refreshing-the-page) on this same week from the player-facing angle -- less methodology, more story.

-- Randy
