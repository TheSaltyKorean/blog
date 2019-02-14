---
layout: post
title:  "How ReSharper saved the day"
date:   2010-05-03
banner_image: 
tags: []
---

The Back Story:

> As a Microsoft MVP awardee, one of the many benefits is free software, books, and various products.  Some of the producers/manufacturers ask for reviews in exchange, others just ask for a brief mention (nothing is ever really free).  But considering that some of the products are essential to my everyday computing, I never mind mentioning their names and evangelizing their products.
> 
> One of these tools just happened to save me a countless number of hours.  With the release of Microsoft’s Visual Studio 2010, JetBrains released their new 5.0 version of [ReSharper](http://www.jetbrains.com/resharper/).

The Story:

> My specialty is Visual Basic development.  I am not, and probably will never be a C# developer.  As such, trying to figure out how to debug a C# project, that was written 2 years ago by a contract developer, let’s just say it’s a painful process.
> 
> I have a special class for config file reading and writing, written in C#.  I kept getting exceptions when the reader would get to a line that had an xml comment in it.  It took me a couple of hours to narrow down where it was happening and why, but I couldn’t figure out the best way to fix it.  It was a for loop that was implicitly casting the type of the variable.  I knew I need to explicitly cast the variable type, but only after the type was verified.  So after I finally got some of the code written, ReSharper gave me some suggestions on how to write the code better.
> 
> One of the ways was to safely cast the variable into the type I wanted.  Blammo, no more exceptions in a way I hadn’t anticipated.  Instead of having to check the type before I cast it.  Beautiful, simple, and taught me a better way to code C#.
> 
> Kudos JetBrains … now if it only worked better with VB (then it could be called ReBasic, ReVB, RE???)