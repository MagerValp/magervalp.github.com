---
layout: post
title: Accessing Kerberized Services with the Active Directory Computer Account
tags: Mac Kerberos
---

Back in May I posted an article on how to access kerberized services with the AD computer account. If the blog statistics are to be believed it's a fairly popular post too. Well, it turns out that I'd basically just missed `-k` when I read the man page for `kinit`. I also managed to [expose the machine's password](/2013/09/13/irony-is-a-b.html) in the process of doing so, making it even more embarrassing.

I updated the [original article](/2013/05/22/accessing-kerberized-services-with-ad-computer-acct.html), but for reference here's a proper script:

<pre><code class="prettyprint lang-sh">#!/bin/bash
#
# This script requires 10.7+ and root privileges.

# Get Kerberos ticket for the machine.
declare -r ADPLIST=$(echo "/Library/Preferences/OpenDirectory/Configurations/Active Directory"/*.plist)
declare -r ADCOMPACCT=$(/usr/libexec/PlistBuddy -c 'print :trustaccount' "$ADPLIST")
kinit -k "$ADCOMPACCT"

# Access services with Kerberos credentials.
mount_smbfs //sharedfiles.server.com/SharedFolder /tmp/sharedfolder
curl --negotiate -u : http://server.example.com/protectedresource
</code>
</pre>

I'll go stand in the corner now.
