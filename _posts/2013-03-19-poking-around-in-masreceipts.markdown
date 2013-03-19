---
layout: post
title: Poking Around in Mac App Store Receipts
---

Yngve Åström asked if anyone knew how to tell which Apple ID installed an app store app on the [MacEnterprise](https://groups.google.com/forum/?fromgroups=#!topic/macenterprise/-w3tHkdNfSs) mailing list:

> Is it  just me or have anyone been able to read something useful out of the app/Contents/_MASReceipt/receipt?
> I'm looking for a way to find out which account was used to by an app, the _MASreceipt library looked like the right place to look.
> Doesn't matter how I trie to read the receipt all I get is bits of readable info that makes very little sense to me.
> Looks  like binary peaces of certs but nothing close to an AppStore account.
> The /Users/myuser/Library/Preferences/com.apple.storeagent.plist AppleID will tell me what account I'm using now but that's it.
> Where can I find which account was used to by a particular app? In this case Server.app...
> Is it even possible to find out? 

Let's poke around and see what's inside those receipt files the Mac App Store puts inside every app bundle. The receipt file itself is a [PKCS #7](http://en.wikipedia.org/wiki/PKCS) container, as defined by [RFC2315](http://tools.ietf.org/html/rfc2315), with its payload encoded using [ASN.1](http://en.wikipedia.org/wiki/Abstract_Syntax_Notation_One). We can look at its certificates using openssl's pkcs7 command:

<pre><code class="prompt">$ </code><code class="in">openssl pkcs7 -inform der -in /Applications/Xcode.app/Contents/_MASReceipt/receipt -print_certs -text</code>
<code class="out">Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            18:59:43:21:72:74:9c:fc
        Signature Algorithm: sha1WithRSAEncryption
        Issuer: C=US, O=Apple Inc., OU=Apple Worldwide Developer Relations, CN=Apple Worldwide Developer Relations Certification Authority
        Validity
            Not Before: Nov 11 21:58:01 2010 GMT
            Not After : Nov 11 21:58:01 2015 GMT
        Subject: CN=Mac App Store Receipt Signing, OU=Apple Worldwide Developer Relations, O=Apple Inc., C=US</code>
<code class="prompt">[...]</code></pre>

You'll see that it contains a certificate chain with Apple's root CA, the developer CA, and the receipt signing certificate. There's a signed payload in the receipt as well, which we can see if we dump the ASN.1 data using openssl's asn1parse command:

<pre><code class="prompt">$ </code><code class="in">openssl asn1parse -inform der -in /Applications/Xcode.app/Contents/_MASReceipt/receipt</code>
<code class="out">    0:d=0  hl=4 l=4701 cons: SEQUENCE          
    4:d=1  hl=2 l=   9 prim: OBJECT            :pkcs7-signedData
   15:d=1  hl=4 l=4686 cons: cont [ 0 ]        
   19:d=2  hl=4 l=4682 cons: SEQUENCE          
   23:d=3  hl=2 l=   1 prim: INTEGER           :01
   26:d=3  hl=2 l=  11 cons: SET               
   28:d=4  hl=2 l=   9 cons: SEQUENCE          
   30:d=5  hl=2 l=   5 prim: OBJECT            :sha1
   37:d=5  hl=2 l=   0 prim: NULL              
   39:d=3  hl=4 l= 526 cons: SEQUENCE          
   43:d=4  hl=2 l=   9 prim: OBJECT            :pkcs7-data
   54:d=4  hl=4 l= 511 cons: cont [ 0 ]        
   58:d=5  hl=4 l= 507 prim: OCTET STRING      [HEX DUMP]:318201F7300A0201120201<code class="prompt">↩</code>
0104021600300A02011302010104020C00300B02010E0201010403020101300C02010A0201010404<code class="prompt">↩</code>
1602342B300C02010B0201010404020207D3300C02010D0201010404020227D9300E020101020101<code class="prompt">↩</code>
040602041DABD29B300E020104020101040602043D83F593300E0201090201010406020450323132<code class="prompt">↩</code>
300E0201100201010406020400DE7D2B300F02010302010104070C05342E362E31301002010F0201<code class="prompt">↩</code>
01040802063C079CDD8EF6301B02010002010104130C1150726F64756374696F6E52656365697074<code class="prompt">↩</code>
301C02010202010104140C12636F6D2E6170706C652E64742E58636F6465301C0201050201010414<code class="prompt">↩</code>
80594D99A2FC354866BD2E624356CAA402371E8B301E02010802010104161614323031332D30332D<code class="prompt">↩</code>
31355430363A31373A32365A301E02010C02010104161614323031332D30332D31355430363A3137<code class="prompt">↩</code>
3A32365A3047020107020101043FA2F2AB232A8EE238211B3976878A67518DE97316756762D19CBD<code class="prompt">↩</code>
6BAF021269B097CB4557693759139ECBDCC0526F788B2FB055E68B60B3555320FA64AE5905306102<code class="prompt">↩</code>
01060201010459706C1F223E8C5CA8B556E292C13C6A1669C0BF7BC47B7B268C017B2D37F6BEA7BF<code class="prompt">↩</code>
D4B4FFF5FF56DBEC269CCA6EEABFC6BC24C0185FFD7F9538088B0E6A99DA608B3129C81A64966151<code class="prompt">↩</code>
E4C5B3931ECBF73EE7040949A1F46884
  569:d=3  hl=4 l=3669 cons: cont [ 0 ]        
  573:d=4  hl=4 l=1387 cons: SEQUENCE          
  577:d=5  hl=4 l=1107 cons: SEQUENCE          
  581:d=6  hl=2 l=   3 cons: cont [ 0 ]        
  583:d=7  hl=2 l=   1 prim: INTEGER           :02
  586:d=6  hl=2 l=   8 prim: INTEGER           :1859432172749CFC
  596:d=6  hl=2 l=  13 cons: SEQUENCE          
  598:d=7  hl=2 l=   9 prim: OBJECT            :sha1WithRSAEncryption</code>
<code class="prompt">[...]</code></pre>

The first big blob of hex is a payload signed with sha1. This payload is also encoded using ASN.1, so let's decode it and save it as a separate file, `payload.asn`:

<pre><code class="prompt">$ </code><code class="in">openssl asn1parse -inform der -in /Applications/Xcode.app/Contents/_MASReceipt/receipt | grep -m 1 'OCTET STRING' | cut -d: -f4 | xxd -r -p > payload.asn</code></pre>

With it saved to disk let's see what asn1parse has to say about it:

<pre><code class="prompt">$ </code><code class="in">openssl asn1parse -inform der -in payload.asn</code>
<code class="out">    0:d=0  hl=4 l= 503 cons: SET               
    4:d=1  hl=2 l=  10 cons: SEQUENCE          
    6:d=2  hl=2 l=   1 prim: INTEGER           :12
    9:d=2  hl=2 l=   1 prim: INTEGER           :01
   12:d=2  hl=2 l=   2 prim: OCTET STRING      [HEX DUMP]:1600
   16:d=1  hl=2 l=  10 cons: SEQUENCE          
   18:d=2  hl=2 l=   1 prim: INTEGER           :13
   21:d=2  hl=2 l=   1 prim: INTEGER           :01
   24:d=2  hl=2 l=   2 prim: OCTET STRING      [HEX DUMP]:0C00
   28:d=1  hl=2 l=  11 cons: SEQUENCE          
   30:d=2  hl=2 l=   1 prim: INTEGER           :0E
   33:d=2  hl=2 l=   1 prim: INTEGER           :01
   36:d=2  hl=2 l=   3 prim: OCTET STRING      [HEX DUMP]:020101</code>
<code class="prompt">[...]</code></pre>

We can see that the payload is composed of a set of attributes, defined by two integers and an octet string. The first integer is the attribute type, the second its version (so far always 1), and the octet string its value. How the octet string is interpreted depends on the attribute type, and Apple has reserved most for private use, but a few are public:

<table>
  <!--
  <caption>
    <strong>Receipt attribute types</strong>
  </caption>
  -->
  <thead>
    <tr>
      <th>Type</th>
      <th>Definition</th>
      <th>Value Interpretation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2</td><td>Bundle identifier</td><td>UTF8STRING.</td>
    </tr>
    <tr>
      <td>3</td><td>Application version</td><td>UTF8STRING.</td>
    </tr>
    <tr>
      <td>4</td><td>Opaque value</td><td>A series of bytes.</td>
    </tr>
    <tr>
      <td>5</td><td>SHA-1 hash</td><td>20-byte SHA-1 digest value.</td>
    </tr>
    <tr>
      <td>17</td><td>In-app purchase receipt</td><td><a href="http://developer.apple.com/library/mac/#releasenotes/General/ValidateAppStoreReceipt/#//apple_ref/doc/uid/TP40010573-CH1-SW23">Further down the ASN.1 rabbit hole.</a></td>
    </tr>
  </tbody>
</table>

Bundle ID and app version are self explanatory, and the SHA-1 hash is used to verify that the app bundle hasn't been modified. IAPs have their own receipt following the same principle as the main receipt, leaving only the mysteriously named "Opaque value":

<pre><code class="prompt">[...]</code>
<code class="out">  114:d=1  hl=2 l=  14 cons: SEQUENCE          
  116:d=2  hl=2 l=   1 prim: INTEGER           :04
  119:d=2  hl=2 l=   1 prim: INTEGER           :01
  122:d=2  hl=2 l=   6 prim: OCTET STRING      [HEX DUMP]:02043D840EE2
</code><code class="prompt">[...]</code></pre>

From [Apple's documentation](http://developer.apple.com/library/mac/#releasenotes/General/ValidateAppStoreReceipt/#//apple_ref/doc/uid/TP40010573-CH1-SW5) we can see that it's used together with the computer's GUID in computing the verification hash. The [ASN.1 specification](http://en.wikipedia.org/wiki/Basic_Encoding_Rules#Identifier_octets) tells us that it's an integer (0x02) and that it's four bytes long (0x04). Let's print it as a decimal integer:

<pre><code class="prompt">$ </code><code class="in">printf "%d\n" 0x$(openssl asn1parse -inform der -in receipt.asn | grep -A 2 ':04$' | tail -1 | cut -d: -f4 | cut -c5-)</code>
<code class="out">1032064738</code></pre>

Still pretty opaque. Haven't I seen that integer somewhere else though? Indeed I have:

<pre><code class="prompt">$ </code><code class="in">defaults read com.apple.storeagent</code>
<code class="out">{
    AccountKind = 0;
    AccountURLBagType = production;
    AppleID = "magervalp@mac.com";
    CreditDisplayString = "";
    DSPersonID = 1032064738;
    DownloadLocation = "/Users/pelle/Library/Application Support/AppStore";
    EligibilityCheckDate = "2013-03-18 22:26:53 +0000";
    ISBadgeValues =     {
    };
    ISLastUpdatesQueueCheck = "2013-03-15 06:17:25 +0000";
    KnownAccounts =     (
                {
            AccountKind = 0;
            AccountURLBagType = production;
            CreditDisplayString = "";
            DSPersonID = 1032064738;
        }
    );
    LastAuthTime = "2013-03-14 21:18:37 +0000";
    LastSynchedStoreFront = "143456,12";
    PurchasesInflight = 0;
    Storefront = "143456-17,13";
    UserNotificationDate = "2013-03-15 06:45:07 +0000";
}</code></pre>

Bingo - it's the numeric app store user ID tied to my Apple ID. While we can't directly determine which Apple ID installed a certain app, we can build a list of DSPersonIDs and their corresponding Apple IDs and get it that way.


### References:

* [http://developer.apple.com/library/mac/#releasenotes/General/ValidateAppStoreReceipt/](http://developer.apple.com/library/mac/#releasenotes/General/ValidateAppStoreReceipt/)
* [http://en.wikipedia.org/wiki/PKCS](http://en.wikipedia.org/wiki/PKCS)
* [http://tools.ietf.org/html/rfc2315](http://tools.ietf.org/html/rfc2315)
* [http://en.wikipedia.org/wiki/Abstract_Syntax_Notation_One](http://en.wikipedia.org/wiki/Abstract_Syntax_Notation_One)
