---
layout: post
title: OS X Passwords Leaked During Login
tags: Mac
---

*NOTE: This post was written May 17th but was withheld until Apple patched the vulnerability.*

### Overview

When logging in on a machine running OS X 10.7 - 10.8.4 with a [configuration profile](http://www.apple.com/support/osxserver/profilemanager/) applied passwords are exposed in clear text to other logged in users.

Apple has released [10.8.5](http://support.apple.com/kb/DL1675) [(combo)](http://support.apple.com/kb/DL1676) and [Security Update 2013-004](http://support.apple.com/kb/DL1677) for 10.7 with patches for the vulnerability.

### CVE-ID

[CVE-2013-1030](http://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2013-1030) ([Apple's summary](http://support.apple.com/kb/HT5880))


## Background

I was writing a script today to automatically mount shared folders for our users when they log in. I wanted the script to wait for the desktop to appear before it runs, so users can see the status window in case there is a problem with the mount. The easiest way to accomplish this is to wait for a process to appear (e.g. `Finder.app`) and then wait a couple of seconds more for good measure. To find out what processes appear during a typical login I wrote the following snippet and ran it in the background while I logged in with my test user:

<pre><code class="prettyprint">while true; do
    echo "----------------"
    ps auxww | grep [u]sername | cut -c70- | sort
    sleep 1
done</code>
</pre>

This confirmed my suspicion that the best option seems to be to wait for `Finder.app` and `Dock.app` to appear, but what nearly caused a [T|N>K](http://www.catb.org/jargon/html/C/CNK.html) were the first snapshots of the process table:

<pre><code class="out">----------------------------------
/System/Library/CoreServices/FileSyncAgent.app/Contents/MacOS/FileSyncAgent -launchedByLaunchd -PHDPlist
/System/Library/Frameworks/OpenGL.framework/Versions/A/Libraries/CVMCompiler
/System/Library/PrivateFrameworks/SystemMigration.framework/Resources/Tools/migCacheCleanup -JustPhotoStreamNudge
/System/Library/PrivateFrameworks/TCC.framework/Resources/tccd
/sbin/launchd
/usr/libexec/xpcd
/usr/sbin/cfprefsd agent
/usr/sbin/distnoted agent
----------------------------------
/System/Library/CoreServices/FileSyncAgent.app/Contents/MacOS/FileSyncAgent -launchedByLaunchd -PHDPlist
/System/Library/Frameworks/OpenGL.framework/Versions/A/Libraries/CVMCompiler
/System/Library/PrivateFrameworks/SystemMigration.framework/Resources/Tools/migCacheCleanup -JustPhotoStreamNudge
/System/Library/PrivateFrameworks/TCC.framework/Resources/tccd
/sbin/launchd
/usr/libexec/mdmclient mcx_userlogin <em>testuser secretpwd</em>
/usr/libexec/xpcd
/usr/sbin/cfprefsd agent
/usr/sbin/distnoted agent
----------------------------------
/System/Library/CoreServices/FileSyncAgent.app/Contents/MacOS/FileSyncAgent -launchedByLaunchd -PHDPlist
/System/Library/Frameworks/OpenGL.framework/Versions/A/Libraries/CVMCompiler
/System/Library/PrivateFrameworks/SystemMigration.framework/Resources/Tools/migCacheCleanup -JustPhotoStreamNudge
/System/Library/PrivateFrameworks/TCC.framework/Resources/tccd
/sbin/launchd
/usr/libexec/xpcd
/usr/sbin/cfprefsd agent
/usr/sbin/distnoted agent</code></pre>

It's fascinating how jarring it is to see your password in clear text, the reaction is almost physical. I wrote up a quick bug report ([radar 13921614](rdar://problem/13921614)), contacted [product-security@apple.com](mailto:product-security@apple.com), and confirmed that it's present all the way back to 10.7, but a mitigating circumstance is that the machine needs to have a configuration profile applied, e.g. by being enrolled with [Profile Manager](http://www.apple.com/support/osxserver/profilemanager/).

To test it, log into a machine with a configuration profile applied as a standard (unprivileged) user either over SSH or with fast user switching enabled, and execute:

<pre><code class="prompt">$ </code><code class="in prettyprint">while true; do ps auxww | grep '[m]dmclient mcx_userlogin'; done</code></pre>

Then log in with a different user account at the login window, and watch the shell's output. It's like nails on chalkboard.

If you're managing student labs or other public machines I'd recommend applying the appropriate patches ASAP.
