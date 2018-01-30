---
layout: post
title: defaults write with double slash
tags: Mac
---

My ass has been bitten twice by this now, so I figured a blog post to warn others might be in order. Say you're writing a package postinstall script where you want to set a preference, and you dutifully use `$3` to target the installation volume. You might write a script along these lines:

<pre><code class="prettyprint lang-sh">#!/bin/bash
# This is buggy, don't use it. A working script is at the bottom of this post.

defaults write "$3/Library/Preferences/com.tyrell.nexussix" lifespan -int 4
</code></pre>

Next thing you know some of your replicants grow old and decide to kill you, as when an app tries to read the preference it gets an unexpected result:

<pre><code class="prettyprint lang-py">#!/usr/bin/python

from __future__ import unicode_literals
from __future__ import print_function
from Foundation import CFPreferencesCopyAppValue

print(CFPreferencesCopyAppValue("lifespan", "com.tyrell.nexussix")) # sometimes None, sometimes 4
</code></pre>

Yet if we look with the defaults command, everything seems fine:

<pre><code class="prompt"># </code><code class="in">defaults read /Library/Preferences/com.tyrell.nexussix</code>
<code class="out">{
    lifespan = 4;
}
</code></pre>

To make things even more confusing, CFPreferences suddenly sees the value now. To untangle this mess, let's investigate what happens in our postinstall script when we're installing the package on the current system, with `$3` expanded to `/`:

<pre><code class="prompt"># </code><code class="in">defaults write //Library/Preferences/com.tyrell.nexussix lifespan -int 4</code>
<code class="prompt"># </code><code class="in">defaults write /Library/Preferences/com.tyrell.nexusseven lifespan -int 4</code>
<code class="prompt"># </code><code class="in">ls -lf /Library/Preferences/com.tyrell.nexus*</code>
<code class="out">-rw-------  1 root  wheel  57 30 Jan 12:38 /Library/Preferences/com.tyrell.nexussix.plist
-rw-r--r--  1 root  wheel  57 30 Jan 12:38 /Library/Preferences/com.tyrell.nexusseven.plist
</code></pre>

The extra slash causes `defaults` to make the preference file readable only by root, making it sometimes visible through `cfprefsd`, depending on access permissions and caching. My guess is the slash triggers `defaults`' codepath for writing to user libraries, where preference files shouldn't be readable by other users.

So how should we be writing our postinstall scripts? I'm glad you asked. I've been using the following in my scripts:

<pre><code class="prettyprint lang-sh">#!/bin/bash

if [[ "$3" == "/" ]]; then
    TARGET=""
else
    TARGET="$3"
fi

defaults write "$TARGET/Library/Preferences/com.tyrell.nexussix" lifespan -int 4
</code></pre>

So what happens if you install this package on a system image with AutoDMG? Well the pref plist will only be readable by root, but as far as I can tell apps can still access their preference keys, presumably since `cfprefsd` caches everything when the system boots — at least I haven't been able to reproduce the problem this way.

References:

* [https://github.com/MagerValp/CreateUserPkg/pull/52](https://github.com/MagerValp/CreateUserPkg/pull/52)
* [https://github.com/munkireport/munkireport-php/pull/949](https://github.com/munkireport/munkireport-php/pull/949)
