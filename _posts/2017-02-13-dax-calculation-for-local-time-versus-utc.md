---
layout: post
title:  "DAX calculation for local time versus UTC"
date:   2017-02-13
banner_image: 
tags: []
---



[DAX](https://social.technet.microsoft.com/wiki/contents/articles/677.power-bi-data-analysis-expressions-dax-language.aspx) is Microsoft’s powerful language behind Excel and [Power BI](https://powerbi.microsoft.com).  Very few users of Excel know that you can utilize it, but it’s predominately available in one of the most underutilized features called [PowerPivot](https://support.office.com/en-us/article/Start-the-Power-Pivot-in-Microsoft-Excel-add-in-a891a66d-36e3-43fc-81e8-fc4798f39ea8).  Fortunately DAX is used also in Power BI and while creating a report for use by a customer I needed to translate log times from local time and compare it to UTC time.

Problem: Our logs store the date and time in the local Central Standard Time Zone (CST).  Everything works great locally, where I have my PC set to CST.  However when I publish my report to Power BI, they use UTC time, and for 6 hours today’s data becomes completely unavailable.

Reason: CST is Universal Time minus 6 hours (depending on daylight savings time).  So at 6pm CST today, it becomes 12am UTC tomorrow.

Solution: Here’s the formula I used

> Today = IF(DATE(YEAR([CreatedTime]),MONTH([CreatedTime]),DAY([CreatedTime])) = NOW() – TIME(6,0,0), TRUE, FALSE)

We have to remove the time from my data ([CreatedTime]), then take the current Date and time, and subtract 6 hours.  If the Date matches, then we know it’s today.

