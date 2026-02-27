---
layout: post
title:  "Preferred method for read only Config files"
date:   2008-03-26
banner_image: 
tags: [.Net, Programming, config files]
post_image: /assets/images/art/thumb/bg15.webp
badge_color: "bg-dark"
categories: [development]
---

I had come across an article where you can use the following line to read custom section settings from your config file (where SectionName is the name of your section) in .Net.

> NameValueCollection myData = (NameValueCollection)System.Configuration.ConfigurationManager.GetSection(SectionName);

The advantage of this is your setting doesn't have to be in the app.config file (web.config).  You can have a file named mywackyweirdfilename.config, and you use the exact same line.  The beauty of it is in the app.config (web.config) file where you point it to reference the mywackyweirdfilename.config.  e.g.

> configSections
>      <section name="SectionName" type="System.Configuration.NameValueFileSectionHandler, System, Version=1.0.3300.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"/>  
> </configSections>  
> <SectionName file="mywackyweirdfilename.config" />

Why is this such a beautiful way to handle your config file?  Because if you distribute your application, the system administrator can decide where to put the mywackyweirdfilename.config file.  It could, in fact, reside on a public share (although not recommended in case of the network being unavailable) or thumb drive.

So what's the problem?  You can't write to the config file easily.  I'll do a later post on my solution for writing to the config file, in which the format of the mywackyweirdfilename.config does not match below .

The format of mywackyweirdfilename.config for the examples above:

> ?xml version="1.0" encoding="utf-8" ?>
> SectionName 
>      add key="myKey" value ="" 
> </SectionName>