---
layout: post
title:  "Retail Link data storage requirements"
date:   2010-04-21
banner_image: 
tags: []
post_image: /assets/images/art/thumb/bg11.webp
badge_color: "bg-teal"
categories: [data, development]
---

I was asked today about how much data an average Retail Link analyst (Walmart vendor) would consume.  I thought I would write this small post for future reference.

Of course this vastly depends on the amount of skus, how long you want to archive data, and if you want store level sales.

Most reports take up very little space. Most times when you download a report (total sales per sku for last week), you will overwrite the previous week’s report.  However, most users will take the data inside their downloaded report, and add it to a database or larger excel spreadsheet.  This way, the user has a history of the sales of each item/sku per week over the last 2+ years.  I would estimate 1 user to consume around 1-2 gb of space, at most, over the course of 2 years. If you start archiving store level sales those numbers can drastically increase up to 10gb or more very quickly.