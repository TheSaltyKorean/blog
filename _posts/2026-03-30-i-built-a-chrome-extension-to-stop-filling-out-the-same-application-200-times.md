---
layout: posts/post-sidebar
title: "I Built a Chrome Extension to Stop Filling Out the Same Application 200 Times"
date: 2026-03-30
author: Randy Walker
categories: [building, ai, tools]
tags: [chrome-extension, job-search, claude, ai, open-source]
badge_color: bg-blue
comments: true
---

I applied to 47 jobs last week. I also built a Chrome extension. One of those activities was interesting.

The application process for most jobs is a ritual everyone has accepted without questioning: upload your resume, then manually type everything that's already on your resume into a different set of boxes. Name, phone, zip code, work authorization, veteran status — all of it, on every site, in a slightly different layout, with a slightly different dropdown configuration. It is objectively a solved problem that nobody has bothered to solve.

So I did.

## What I Built

JobHunter is a Chrome extension. No build step, no React, no webpack — plain JavaScript, HTML, and CSS on Manifest V3. It does three things well.

**It detects where you are.** Land on a LinkedIn job posting and it reads the title, company, and location from the page. Click Apply, get bounced to Workday or Greenhouse, and it carries that context across the redirect. The sidebar shows what it found and suggests which of your resume types fits best — for my search that's Cloud & Infrastructure, IT Management, Executive, or Staffing.

**It fills the application.** One click. The extension scans every form field, figures out what each one is asking using fuzzy regex matching against 30+ patterns, and fills it from your stored profile. Name, address, phone, work authorization, education, experience — all handled. It uploads the right resume PDF and fills your work experience with the right title and description for the resume type you selected, because your cloud resume and your executive resume don't describe the same role the same way.

**It handles the weird stuff.** State dropdowns that use abbreviations when your profile has the full name — handled. Phone type fields that default to Home when you want Mobile — handled. Workday splash pages that make you click Apply Manually before showing you the actual form — auto-clicked. For the truly unpredictable questions — the ones no pattern can anticipate — there is a companion server that wraps your local Claude CLI. It takes the question, pulls in your full profile context, and generates a relevant answer on the fly. No API key, no extra subscription. If you already have Claude, you are already set up.

What used to take eight minutes takes forty seconds. Multiply that across fifty applications a week and you get your evenings back.

## How It Got Built

This is the part worth talking about if you build things.

JobHunter wasn't designed upfront. It was built by running it on real applications, hitting edge cases, and removing them one at a time — using Claude as a development partner throughout. Not as a chatbot I asked questions to. As a pair programmer that could hold the entire codebase in context across sessions.

The iteration loop was simple: run Auto-Fill on a Workday application, find what didn't work, describe it precisely, get the fix. Every feature exists because a real job board exposed a gap. The US state abbreviation mapping exists because one Workday instance uses TX and another uses Texas and a third uses Texas (TX). The duplicate resume upload prevention exists because I hit Auto-Fill twice and uploaded my PDF twice.

None of that was anticipated. All of it got built. That's the methodology — spec the target state, iterate toward it, let the agent handle the execution.

## When the AI Answers the Hard Questions

Every application has at least one question nobody prepared for. "Describe a time you influenced a decision without direct authority." "What is your preferred management style?" "Why do you want to work here specifically?"

Pattern matching cannot help with those. What can help is Claude.

The companion server is a single Python file that wraps your local Claude CLI in a lightweight HTTP endpoint. When JobHunter encounters a question it does not recognize, it sends the question along with your full profile context to the server, which passes it to Claude and returns a generated answer directly into the field. No separate API key. No additional subscription. If you already have Claude running locally, you are already set up.

It is a small piece of the extension but a meaningful one. The repetitive questions get automated. The questions that actually require thought get AI-assisted. You stay focused on the applications that deserve your attention.

## The Shape of the Thing

The extension is zero-dependency on the JavaScript side. The companion server is a single Python file. The whole project is about 2,500 lines across six files.

A background service worker handles storage, fuzzy matching rules, job type detection, and cross-site context tracking. A content script injects a collapsible sidebar on every page and runs the auto-fill engine. An options page lets you configure your profile, work experience variants per resume type, Q&A pairs, and Claude server settings. A dashboard gives you a sortable searchable view of every job you've tracked.

The fuzzy matching engine walks the DOM, extracts field labels from every source it can find — label elements, aria-label attributes, placeholders, name and id attributes — and matches against compiled regex patterns. When it finds a match it fills the field using React-compatible native value setters so controlled inputs actually register the change.

## Get It

The repo is public at [github.com/TheSaltyKorean/JobHunter](https://github.com/TheSaltyKorean/JobHunter). Clone it, drop in your resume PDFs, fill out the settings page, and you're running. No Chrome Web Store, no account, no tracking. Everything stays local.

It's tuned to my job search right now, but the pattern-matching approach works on any application form. I'll make it more generic over time — better defaults, easier onboarding. If you want to make it better now, PRs are open. MIT licensed, no build step, nothing between you and the source.

The cover letter you actually care about deserves your time. The zip code field does not.

— Randy
