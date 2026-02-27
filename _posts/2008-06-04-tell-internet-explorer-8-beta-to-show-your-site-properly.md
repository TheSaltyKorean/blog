---
layout: post
title:  "Tell Internet Explorer 8 Beta to show your site properly using IE7"
date:   2008-06-04
banner_image: clip_image002_thumb.jpg
tags: [Internet Explorer, IE8, IE7]
post_image: /assets/images/art/thumb/bg4.webp
badge_color: "bg-blue"
categories: [microsoft, development]
---

For those that want your website to render correctly on IE8, the recent newsletter gave a great example for enforcing IE7 compatibility via a Meta tag.  (You can see the new IE logo above)


**Per Site Basis:**

Site owners and administrators can include the following custom HTTP header to display all pages in Internet Explorer 7 Strict mode for the site:

> X-UA-Compatible: IE=EmulateIE7

**Per-page basis:**

Site owners and administrators can include the following special HTML tag after the <Head> tag on the page:

> <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7"/>