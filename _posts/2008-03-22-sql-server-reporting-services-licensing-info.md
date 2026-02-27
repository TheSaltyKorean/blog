---
layout: post
title:  "SQL Server Reporting Services Licensing Info"
date:   2008-03-22
banner_image: 
tags: [SQL Server Licensing]
post_image: "/assets/images/art/tb7.webp"
badge_color: "bg-teal"
categories: [data, development]
---

After presenting at the [Tulsa SQL Server SIG](http://www.tulsasql.com/) I received the following question:

> According to all the blogs if you install SSRS on a web server it still burns up another SQL server license even if you don’t install SQL.  Our production SQL server costs like $30,000 for the enterprise version because it’s on an 8 core box.  The SharePoint server where I am trying to install SSRS also has 8 cores.  For SharePoint you have to install SSRS on the web server or it will not work.  Is there a cheap version of SSRS that won’t cost 30k?

Below was my response:

> Attached is a [document](http://download.microsoft.com/download/e/c/a/ecafe5d1-b514-48ab-93eb-61377df9c5c2/SQLServer2005Licensingv1.1.doc) I found detailed your licensing options.  Initially I thought you would not be able to get around buying an Enterprise license because it is the only version supporting 8 processors ([http://www.microsoft.com/sql/prodinfo/features/compare-features.mspx](http://www.microsoft.com/sql/prodinfo/features/compare-features.mspx)).  However, it says “Processor licenses are available in Enterprise, Standard, and Workgroup Editions and offer more simplicity for certain scenarios.”  So, you should only have to purchase a workgroup license for 8 processors.
> 
> However, there are specific features of SSRS that are specific to the version licensed.  Such as the Enterprise version only supports Data Driven Subscriptions (you can have data trigger the running of a report), plus others.  I believe e-mail subscriptions are a Standard version feature, which is a must have IMHO.
> 
> The real question is going to be if you can talk to the person responsible for purchasing/licensing to figure out how to buy the standard workgroup or standard license, plus the additional licensing for the additional processors.  Don’t forget, I’m betting there isn’t 8 processors, because of the newer multi core processors.  So make sure you verify the number of hard processors.