---
title: VSTS with code signed PFX certificates
date: '2017-04-26'
permalink: /vsts-with-code-signed-pfx-certificates/
author: Randy Walker
categories:
  - devops
  - development
tags: []
post_image: /assets/images/blog/vsts-with-code-signed-pfx-certificates.webp
---


While using VSTS, one of the most common questions is how to code sign your application.  It’s extremely problematic, because there’s no easy way to import a PFX with a password.

Step 1: Add a PowerShell Script and put the following as inline code.

> String $(CertPassword) -AsPlainText -Force Write-Output (“$(System.DefaultWorkingDirectory)” + “\Resources\Harvest.pfx”) Import-PfxCertificate -FilePath $(System.DefaultWorkingDirectory)\Resources\mycert.pfx -Password $Secure -CertStoreLocation cert:\CurrentUser\My

Step 2: Add a Variable named CertPassword, put your password into it, then click the lock icon

