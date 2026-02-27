---
layout: post
title:  "New FedEx SSL Cert is bound to cause problems"
date:   2009-03-20
banner_image: 
tags: []
post_image: "/assets/images/art/tb6.webp"
badge_color: "bg-blue"
categories: [technology]
---

Having done some thorough research with code signing certifications and SSL certs, am I wrong in thinking that FedEx has royally screwed up?  I had to double and triple check that the link provided wasn’t a phishing attack of some sort, and it all looks valid.  Forcing your customers to install a cert that doesn’t have a root already installed in Windows is major trouble!  Why would VeriSign sell FedEx such a crappy product?

I have a cheap Comodo SSL cert for my Exchange server, and it wreaks all sorts of havok when connecting my Windows Mobile device to it.  Someone has made a very poor decision, or perhaps I’m missing something.

> <a name="OLE_LINK1">Dear Valued FedEx Customer:</a>
> 
> Please ensure that your appropriate team members (e.g., Application Server Administrators) are aware of the following FedEx planned update:
> 
> **Chained Secure Socket Layer (SSL) Test Certificate Update**
> 
> In order to maintain customer confidence in our Web connections, FedEx is renewing our SSL certificate with VeriSign, a trusted certificate holding authority.  FedEx moved to a chained SSL certificate type for our test environment on Mar. 19, 2009, and will move for our production environment on Aug. 1, 2009.  This transition is due to the FedEx certificate holding authority transitioning from non-chained to chained Web server SSL certificates.
> 
> Customers using custom interfacing applications will need to verify that their systems support chained certificates.  For web servers that do not support chained certificates, administrators should contact their server software provider for technical assistance.  If you are unsure whether your application works with chained certificates, it is recommended that you test your application in the FedEx test environment.  Applications should be redirected to **<span class="skimlinks-unlinked">gatewaybeta.fedex.com</span>** for testing. 
> 
> Customers needing a local copy of the FedEx test certificate installed on their system can download the updated certificate [here](http://fedex.com/us/developer/downloads/dev_cert.zip) or by typing the link [http://fedex.com/us/developer/downloads/dev_cert.zip](http://fedex.com/us/developer/downloads/dev_cert.zip) into your browser.  A separate certificate will need to be installed for production.  We will notify you when the production certificate is available for download.  FedEx supplied API clients (e.g., ATOM) are not affected by these changes.
> 
> If you have any questions or need technical assistance, please contact the FedEx Help Desk at 1.877.339.2774 or send an e-mail to **[websupport@fedex.com](mailto:websupport@fedex.com)**.
> 
> Thank you for choosing FedEx.
> 
> The FedEx Web Integration Solutions Team