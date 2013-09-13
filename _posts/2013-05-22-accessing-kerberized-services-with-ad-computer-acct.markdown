---
layout: post
title: Accessing Kerberized Services with the Active Directory Computer Account
tags: Mac
---

The usual scenario when you're in a kerberized environment is that your users get a Kerberos ticket on login and they use this to access protected services, such as their home directory. Sometimes you need to execute a task in the background, and not necessarily on behalf of a user or even with anyone logged in, but how do you guarantee that the connecting client is who it says it is? In these situations you can use the machine's AD computer account for authentication:

<pre><code class="prettyprint lang-sh">#!/bin/bash
#
# This script requires 10.7+ and root privileges.

# Initialize Kerberos if needed.
if ! klist -t 2>/dev/null; then
    # Read the AD configuration.
    declare -r ADPLIST=$(echo "/Library/Preferences/OpenDirectory/Configurations/Active Directory"/*.plist)
    declare -r ADCOMPACCT=$(/usr/libexec/PlistBuddy -c 'print :trustaccount' "$ADPLIST")
    declare -r ADNODE=$(/usr/libexec/PlistBuddy -c 'print :"node name"' "$ADPLIST")

    # Read the computer account password from the system keychain.
    declare -r SKC="/Library/Keychains/System.keychain"
    declare -r TEMPFILE=$(mktemp -t kinitpwd)
    security find-generic-password -g -s "$ADNODE" "$SKC" 2>&amp;1 >/dev/null | cut -d\" -f2 > "$TEMPFILE"
    # 10.8+ supports -w:
    #security find-generic-password -w -s "$ADNODE" "$SKC" > "$TEMPFILE"

    # Use the computer account to authenticate and get a Kerberos TGT.
    kinit --password-file=STDIN "$ADCOMPACCT" &lt; "$TEMPFILE"
    rm -f "$TEMPFILE"
fi

# Access services with Kerberos credentials.
mount_smbfs //sharedfiles.server.com/SharedFolder /tmp/sharedfolder
curl --negotiate -u : http://server.example.com/protectedresource
</code>
</pre>

**Update:** Fixed `security find-generic-password` which doesn't accept -w on 10.7, thanks [@RegalWeasel](https://twitter.com/RegalWeasel/status/337288903570644992).

**Update 2:** Fixed [ironic](2013-09-13-irony-is-a-b) exposure of computer account password in process table.
