---
layout: post
title: "13 Deployments, One Day, and a Grudging Respect for the Process"
date: 2026-03-06
categories: [building, ai, azure]
tags: [claude-code, azure, bicep, agentic-ai, devops]
---

Yesterday I took a screen scraper project and gave it a proper home on Azure. Containerized, monitored, secrets managed correctly, analytics wired up, alerts configured. The kind of infrastructure work that makes you feel legitimately good about the state of your stack when it is done.

It ate the better part of my day. But honestly? Worth every minute of it.

The project itself is unglamorous by design -- a scraper that pulls competitor data and feeds it into analytics. The kind of thing that lives quietly in a corner of your infrastructure and just needs to work. Getting it properly hosted was overdue.

## The Stack

Azure Container Apps to run the scraper, Key Vault for secrets management, a Storage Account for output, Log Analytics for observability, Synapse for analytics downstream, and an Action Group for alerting. All of it wired up with Bicep.

I drove the whole thing with Claude Code -- agentic AI doing the actual build work while I directed, reviewed, and course-corrected. Claude Code handled the Bicep authoring, the wiring between services, the deployment scripting. It did not complain once. Which is more than I can say for myself around deployment number seven.

## Iteration Is Part of the Job

Thirteen deployments across the day, each one its own Claude Code session -- review what happened, provide context, let the agent work through the fix, deploy again. Anyone who has done real Azure infrastructure work knows the gap between "this looks right" and "this actually runs" has claimed better people than me. That is just the job.

The context window compacted at least twice during the session, which means Claude Code had to re-orient from a compressed summary of prior work each time. It handled it gracefully -- there is just a slight shift in momentum when it happens, like the agent taking a breath before picking back up. It is something you develop a feel for: when to push through, when to start clean.

## A Few Things I Still Need to Fix

The deployment works and the scraper runs. But there are output formatting issues to clean up and a couple of bugs that made the trip over from the original -- bugs I was quietly hoping the migration process would resolve on its own. It did not. Bugs are loyal like that.

And every deployment, I have to re-enter my Key Vault secrets manually. That one is on me -- it is a gap in how my setup is configured and I need to go back and solve it properly. I know exactly what needs to change. I just did not do it yesterday.

## What the Day Actually Proved

Each deployment cycle was maybe ten minutes of actual human time. The clock time was the day. The human effort was a fraction of what a manual migration would have taken.

Bicep is verbose. Azure is opinionated. Those two things together will always generate iteration cycles regardless of your tooling. The spec-driven approach -- having a clear target state defined before the session started -- is what kept the iteration contained. The agent always knew what done looked like. We were just finding the path there.

The result is a properly hosted, monitored, observable scraper running on Azure infrastructure I am genuinely happy with. That is a good day.

I just need to go fix those bugs.

-- Randy
