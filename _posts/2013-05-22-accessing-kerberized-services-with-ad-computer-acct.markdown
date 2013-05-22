---
layout: post
title: Accessing Kerberized Services with the Active Directory Computer Account
tags: Mac
---

The usual scenario when you're in a kerberized environment is that your users get a Kerberos ticket on login and they use this to access protected services, such as their home directory. Sometimes you need to execute a task in the background, and not necessarily on behalf of a user or even with anyone logged in, but how do you guarantee that the connecting client is who it says it is? In these situations you can use the machine's AD computer account for authentication:

<pre><code class="prettyprint lang-sh">#!/bin/bash
#
# This script assumes 10.7+, and must execute as root.

# Initialize Kerberos if needed.
if ! klist -t 2>/dev/null; then
    # Read the AD configuration.
    declare -r ADPLIST=$(echo "/Library/Preferences/OpenDirectory/Configurations/Active Directory"/*.plist)
    declare -r ADCOMPACCT=$(/usr/libexec/PlistBuddy -c 'print :trustaccount' "$ADPLIST")
    declare -r ADNODE=$(/usr/libexec/PlistBuddy -c 'print :"node name"' "$ADPLIST")

    # Read the computer account password from the system keychain.
    declare -r SKC="/Library/Keychains/System.keychain"
    declare -r ADCOMPPWD=$(security find-generic-password -w -s "$ADNODE" "$SKC")

    # Use the computer account to authenticate and get a Kerberos TGT.
    echo "$ADCOMPPWD" | kinit --password-file=STDIN "$ADCOMPACCT"
fi

# Access services with Kerberos credentials.
mount_smbfs //sharedfiles.server.com/SharedFolder /tmp/sharedfolder
curl --negotiate -u : http://server.example.com/protectedresource
</code>
</pre>
