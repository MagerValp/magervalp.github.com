---
layout: post
title: System Center 2012 Endpoint Protection + Outlook 2011 = Crash
tags: Mac, antivirus
---

Starting in July we've had a steady trickle of support cases regarding Outlook 2011 crashing on startup:

<pre class="out">
Microsoft Error Reporting log version: 2.0

Error Signature:
Exception: EXC_BAD_ACCESS
Date/Time: 2015-08-11 11:38:17 +0000
Application Name: Microsoft Database Daemon
Application Bundle ID: com.microsoft.outlook.databasedaemon
Application Signature: MDlr
Application Version: 14.5.3.150624
Crashed Module Name: libobjc.A.dylib
Crashed Module Version: unknown
Crashed Module Offset: 0x000010a7
Blame Module Name: Microsoft Database Daemon
Blame Module Version: 14.5.3.150624
Blame Module Offset: 0x000c1368
Application LCID: 1053
Extra app info: Reg=en Loc=0x041d
Crashed thread: 0
</pre>

We tried the usual incantations &mdash; rebuilding the database, creating a fresh identity, nuking prefs, and so on &mdash; but nothing offered more than temporary respite. Only creating a fresh home directory seemed to help, but that's a classic example of the cure being worse than the disease.

We're fortunate enough to have a Microsoft Premier Support contract so after banging our heads against the wall for a few days we decided to call it in. Impressively they managed to track down the issue in less than 24 hours. It turns out that a recent-ish update to System Center 2012 Endpoint Protection accidentally changes the ownership of `~/Library/Preferences/loginwindow.plist` to `root:wheel`. Through a series of [Rube Goldberg](https://www.youtube.com/watch?v=qybUFnY7Y8w)-like events this then causes Outlook's database daemon to crash on startup.

Restoring ownership magically makes the crash go away, so we sent out the following script to all our macs:

<pre><code class="prettyprint lang-sh">#!/bin/bash

# Restore ownership of user preference files.
for preffolder in /Users/*/Library/Preferences; do
    if [[ -d "$preffolder" ]]; then
        uidgid=$(stat -f "%u:%g" "$preffolder")
        chown -hR "$uidgid" "$preffolder"
    fi
done
</code></pre>

I think SCEP is just a rebranded [ESET/NOD32](http://www.eset.com/us/home/products/cyber-security/), so chances are that the same problem can affect clients running that too.

I haven't been able to reproduce the issue by just changing loginwindow's ownership on a non-crashy Outlook, so something else is also playing a part here, but at least it fixes the cases that have been brought it. Don't hesitate contact me if you can shed more light on it.
