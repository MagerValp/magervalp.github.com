---
layout: post
title: Quick & Dirty parsing of Mac App Store receipts
---

Content coming in a bit...

<!--
    Galaga:~ xolope$ defaults read com.apple.storeagent DSPersonID
    1032064738

Convert it to a hex value (`3d840ee2`), fire up your favorite hex editor (0xED is nice), and search for it in `_MASReceipt/receipt` from an app bought with your AppleID. You should get a hit fairly close to the top.

So we can dump the data in the receipt using openssl's ASN.1 parser:

    openssl asn1parse -inform der -in /Applications/Xcode.app/Contents/_MASReceipt/receipt

The first big blob of hex is the actual signed payload. Copy and paste it into 0xED, and save it as a new file (`receipt.asn1`). This is also in ASN.1, so again we use 
-->