---
title: "Patent Pending. Here's What I Actually Filed."
date: 2026-05-29
post_image: /assets/images/blog/patent-pending.webp
permalink: /patent-pending/
author: "Randy Walker"
categories: [building, patents]
tags: [patents, uspto, salty-poker, multi-table, translation, pro-se, methodology]
meta_description: "Two provisional patent applications, filed pro se, on the multi-tile workspace and on automatic chat translation. Here is what is actually in them and why the architecture matters."
---

I filed two provisional patent applications with the USPTO this week. Priority dates locked in. I filed both myself — *pro se* — which means no patent attorney, just a 100+ page spec, a lot of research, and a willingness to read federal statute until my eyes crossed.

I'm proud of these. Here's what's actually in them.

---

### Patent #1: The Workspace Interface

**Official title:** *Viewport-Adaptive Tile Workspace System and Method for Simultaneously Displaying Heterogeneous Interactive Content Tiles*

**Docket:** RW-PAT-001

If you've ever tried to play multiple poker tables simultaneously — or manage any kind of multi-session interface — you know that existing approaches are a mess. The application lays out the problem directly:

> *"(A) Multiple independent windows. Each surface occupies a separate operating-system window that the user manually resizes and positions... (B) Cascading or stacked overlay panels... (C) Fixed grid layouts... do not adapt to the viewport dimensions of the display device, resulting in unused whitespace on large displays and truncation or scrolling on smaller displays... (D) Heterogeneous surface isolation. In all known prior systems, active interactive surfaces and utility surfaces are rendered in separate navigational contexts and cannot occupy cells in a shared grid alongside live interactive tiles."*

The invention addresses all four. The core of it is a runtime layout algorithm that does something nobody else is doing: it doesn't just pick a grid size — it **optimizes for maximum tile scale across all possible column counts simultaneously**.

From the application:

> *"For each integer column count C from one through N, computing a candidate scale factor as the minimum of the available-width-to-grid-width ratio and the available-height-to-grid-height ratio; selecting the column count C\* that maximizes the candidate scale factor."*

Before it even gets there, it runs an orientation selection step — evaluating whether tiles should render landscape or portrait at native scale, and picking whichever geometry fits the most tiles. That decision then informs everything downstream.

The second major contribution is what the application calls the **unified tile type system**:

> *"A fundamental aspect of the invention is the treatment of all content surface types as homogeneous tile objects within a single ordered collection. Prior systems that rendered interactive surfaces in windows or overlays separate from utility surfaces required the user to navigate out of the active-surface context to access utility functionality. The present invention places all surface types in the same grid, eliminating context-switching navigation."*

In plain language: the lobby, the cashier, your hand history, your account settings, and every active game table are all just *tiles*. Same grid. Same layout logic. No separate windows, no context switching.

The third piece is the shared GPU rendering context architecture — because browsers cap how many hardware-accelerated rendering contexts a single tab can hold (typically 8–16). One context per table would hit that limit fast. The invention uses a single shared context with a per-frame reconciliation loop that queries each tile's DOM bounding rectangle and repositions the rendering stage to match — every frame, as the layout shifts.

---

### Patent #2: Automatic Chat Translation

**Official title:** *Automatic Chat Language Translation for Real-Time Interactive Sessions Without Session-Time User Interaction Using Stored or Environment-Inferred Language Preferences*

**Docket:** RW-PAT-002

This one matters to me in a different way. Texas poker rooms draw players from everywhere. Language should not be a barrier at the table — and the solution should not require anyone to do anything.

The application frames the problem specifically around **primary-attention interactive sessions** — contexts where the user's focus has to stay on the game:

> *"In a primary-attention interactive session — such as an online card game, a time-limited auction, or a competitive game — the user's attention is focused on the primary interactive activity, which typically involves time-sensitive decisions requiring continuous visual and cognitive engagement with the primary content surface. Chat communication occurs as a peripheral activity alongside the primary activity, not as the primary focus of the session."*

Every prior approach breaks down here. Manual translation requires the user to notice the language, find a button, and wait — during an active hand. Session-time language selection prompts get dismissed. Account-level configuration depends on users having proactively done something they mostly haven't.

The invention's answer is a two-path locale resolution strategy:

> *"If a stored language preference is present in the user's account state, the stored preference is used directly as the canonical language identifier with no further inference; if no stored preference is present, the module reads locale signals from the execution environment — including the primary locale reported by the execution environment's locale API, an ordered list of preferred locales if available, and contextual URL parameters — and resolves a canonical language identifier from those signals. In both the stored-preference path and the environment-inference path, the locale determination completes without any action by the user during the session."*

No stored preference? The system reads `navigator.language`, falls back to `navigator.languages`, then a URL parameter, then the platform default. Fully automatic either way.

The second architectural contribution is the **per-message hybrid**: the server detects the source language of each incoming message and appends a language tag. The client then compares that tag to the recipient's locale — and requests translation only when they differ. No global toggle. No "translate all messages" mode. Just per-message logic, server tag, client decision:

> *"Because translation is requested only when the detected source language actually differs from the recipient's locale, the translation pipeline imposes no latency or resource cost on same-language message pairs, which may constitute a majority of messages in sessions where most participants share a common language."*

When a translation is rendered, a compact visual indicator lets the recipient know — but no interaction is required, no dialog appears, and the primary session surface is untouched throughout. The translation system is architecturally confined to the chat layer. Game state, action timers, rendering — none of it is affected.

---

### What's Next

Both applications are provisional — priority dates are established, and the clock is running on converting to full non-provisionals. That process is longer and more involved, but the foundations are in place.

A lot more of what I'm building will start to make these filings make even more sense as it ships.

For the player-facing perspective on what these features actually mean at the table, the [salty.poker blog](https://salty.poker) is where that lives.

— Randy
