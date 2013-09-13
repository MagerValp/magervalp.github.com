---
layout: post
title: Irony is a B*tch
tags: Mac
---

So yesterday I posted about a vulnerability is OS X where [passwords are leaked during login](2013-09-12-os-x-passwords-leaked-during-login.html), and by chance I happened to read my previous post on [accessing kerberized services with the Active Directory computer account](2013-05-22-accessing-kerberized-services-with-ad-computer-acct.html) today. It prominently featured the following nugget:

<pre><code class="prettyprint lang-sh">echo "$ADCOMPPWD" | kinit --password-file=STDIN "$ADCOMPACCT"</code>
</pre>

Oh sweet irony. I updated the post with a [fixed version](2013-05-22-accessing-kerberized-services-with-ad-computer-acct.html) that uses a temporary file instead instead of piping from `echo` for the whole world to see.
