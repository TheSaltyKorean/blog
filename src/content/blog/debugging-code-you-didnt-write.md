---
title: "Debugging Code You Didn't Write (But You're Still Responsible For)"
date: '2026-04-15'
permalink: /debugging-code-you-didnt-write/
author: Randy Walker
categories:
  - building
  - ai
tags:
  - claude-code
  - agentic-ai
  - debugging
  - salty-poker
  - methodology
---

I spent Tuesday morning staring at a 404 from a service I knew existed.

The table engine was up. The routes were registered. The tests passed. And every single request from the front end came back with a 404 like the whole thing was a ghost. The code was correct — in the sense that it followed every pattern the agent was given and handled every case in the spec. It just didn't work.

Welcome to debugging code you didn't write.

## The Part Nobody Warns You About

When a human engineer writes broken code, you can usually reconstruct the reasoning. You know how they think. You know what shortcuts they take. You can guess the category of mistake before you find it.

When an agent generates broken code, the reasoning isn't traceable the same way. The agent followed the spec and produced something technically consistent with it. The bug isn't a mistake in the traditional sense — it's a gap between what the spec described and what the connected system actually needed.

Those gaps live at the integration layer. Always.

Here's what happened: the table engine registered its routes with a prefix that the API gateway strips before forwarding requests. Gateway strips `/api/v1`. Routes were registered expecting it to be present. They never matched. Every request — 404.

That detail was sitting right there in the Vite proxy config. The spec described a table engine with public routes. It did not describe the exact prefix behavior of the development proxy, because that's the kind of thing you learn by running the system and watching it break.

## How We Actually Found It

I gave the agent the proxy configuration and the route registration files at the same time and asked it to find the discrepancy. Three minutes.

This is the part that's fundamentally different about working this way. I'm not navigating the filesystem, reading files sequentially, building the mental model in my head anymore. I describe the symptom — "every request to the table engine returns 404" — hand over the relevant context, and let the agent trace it.

The agent holds more context simultaneously than I can. That's not a knock on human cognition. It's just true. My job is knowing *which* context to hand over, and recognizing whether the analysis is right when it comes back.

AI executes. I architect. That's not a bumper sticker — it's how the work actually divides.

Once the routing bug was fixed, a second one surfaced behind it. Because of course it did. The state endpoint returned data in the engine's internal format — raw seat numbers, status codes like `occupied`, integers for chip counts. The front-end renderer expected formatted strings, specific field names, seat indexes. Nobody wrote a translation layer. The renderer got data it didn't recognize and silently drew nothing.

That one took longer to fix than to find. The endpoint had to be rewritten to return renderer-compatible data. The agent did the rewrite. I reviewed it.

## What the Agent Can't Do For You

The agent can trace a bug you can describe. It cannot describe the bug for you if you don't understand the system well enough to know where to look.

Both bugs this week started with my understanding of the architecture: how the proxy works, what the renderer expects, why a 404 from a running service means routing, not logic. Nearly 30 years of building systems teaches you how they fail. That understanding didn't come from the spec. It came from watching things break in production more times than I'd like to admit.

No amount of AI capability replaces knowing your system. The agent finds the problem faster once you've pointed it at the right layer. Finding the right layer is still the architect's job.

The next post covers the failure mode that wasn't about the code at all — the development environment that was silently ignoring every fix we applied.

— Randy