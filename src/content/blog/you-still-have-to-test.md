---
title: "You Still Have to Test. Especially When AI Wrote It."
date: 2026-04-19
post_image: /assets/images/blog/you-still-have-to-test.webp
permalink: /you-still-have-to-test/
author: "Randy Walker"
categories: [building, ai]
tags: [claude-code, agentic-ai, testing, methodology, salty-poker]
meta_description: "AI-generated code does not get a testing exemption. A walk through what an end-to-end Playwright session caught on the salty.poker build, and why integration testing is the part the methodology cannot delegate away."
---

Let me be direct: AI-generated code does not get a testing exemption.

I have heard the argument that because an agent implements the spec precisely, testing is less necessary. The logic runs: if the spec is correct and the agent implements the spec, the implementation is correct.

This reasoning fails at the integration layer every time.

Individual units can each implement their spec correctly and still fail to communicate with each other. The spec describes behavior in isolation. Integration testing verifies behavior in composition. Those are different things, and no amount of precision in one substitutes for the other.

## What the Test Run Looked Like

We used Playwright -- a browser automation framework -- to script the full user journey: log in, reach the lobby, verify the table card renders at the correct height, navigate to a table, confirm the header and seat picker are present and functional.

Every step failed the first run.

Table cards were rendering at 572 pixels tall instead of the ~150 pixels they should be. CSS Grid applies `align-items: stretch` by default when there is only one item in a row. Nobody specified this. Nobody intentionally broke it. It is just what CSS does when you do not override a default that only manifests at a specific grid population count.

Navigating to a table redirected the browser back to the lobby. The auth guard was checking `context.auth` -- a TanStack Router context value that was never populated because the router was initialized without a context provider. The guard read "not authenticated" and redirected to login. Login saw an authenticated session and redirected back to the lobby. Infinite loop.

These are not AI-specific failure modes. They are the class of bugs that only appear when the full stack runs together with a real browser. They would have appeared in human-written code too. The testing phase catches them either way.

## What the Human Does That the Agent Cannot

Every failure in that test session was identified by a person watching a screen.

The card stretching to full height -- that is a visual observation. It is not in the error logs. It does not throw an exception. It is not a failing assertion in any test. It requires looking at the page and noticing that something is wrong with the layout.

The redirect loop -- that required watching the browser's navigation history and recognizing the pattern: table URL, then login, then lobby, then the same table URL again.

The agent can trace a bug once you have described it. It can find the root cause once you have identified the layer. It cannot make the initial observation that something visual is wrong. That observation is human. It always will be.

This is the division of labor the methodology depends on: the human defines and verifies, the agent diagnoses and executes. Testing is the verification step. You cannot delegate it away.

## What This Phase Produced

By the end of the test session: lobby cards rendering at correct height, table navigation working, seat picker showing open seats, buy-in dialog functioning, help overlay accessible via keyboard shortcut and button.

The dev environment passes end-to-end testing.

What changed for this build: the test infrastructure was specced before the product features were built. The pipeline enforces it. The end-to-end pass is not optional, because skipping testing on the way to release is one of those decisions that always feels harmless in the moment and never is.

The salty.poker changelog is at [salty.poker/changelog](https://salty.poker/changelog) for anyone following the build.

-- Randy
