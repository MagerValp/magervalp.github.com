---
layout: post
title: Managing Java Security Site Exceptions With Deployment Rule Sets
tags: Mac, Java
---

Like many organization we have a few legacy systems that require Java to run, and as much as we'd like to replace them we're not quite there yet. With 7u51 Oracle turned up the default security settings by another notch (undoubtedly a good thing!) and as a result it will no longer allow users to run unsigned applets without a security manifest. Users that have admin privileges can [whitelist applets](https://blogs.oracle.com/java-platform-group/entry/upcoming_exception_site_list_in) themselves, and there are some [creative ways](http://derflounder.wordpress.com/2014/01/16/managing-oracles-java-exception-site-list/) of managing site exceptions, but the officially supported way is to create a Deployment Rule Set. It's not particularly complicated but if you're not a Java developer it involves some tools that you're probably not familiar with (at least I wasn't). Here's my annotated guide to creating, signing, and deploying `DeploymentRuleSet.jar`.


1&#46; Get a jar signing certificate
---------------------------------------

First off we'll create a new keystore, and generate a self signed certificate and keypair:

<pre><code class="prompt">$ </code><code class="in">keytool -genkey -alias MYORG -keyalg RSA -validity 1095 -keystore ~/MYORG_keystore</code></pre>

`keytool` will ask you to set a password for the keystore, and ask who the certificate is for. The certificate authority we use ([TERENA Certificate Service](https://tcs.sunet.se/info/)) didn't accept DSA keys so I had to set the algorithm to RSA. I also selected a 3 year validity period, in the vain hope that we'll have replaced those old legacy systems by then (hello to myself googling this again in 3 years).

At this point you have two options:

1. Buy a code signing certificate from one of the [CAs that are trusted by Java](http://superuser.com/questions/55470/which-trusted-root-certificates-are-included-in-java). Expect to pay at least $80/year.
2. Make your clients [trust a self-signed certficiate](https://blogs.oracle.com/java-platform-group/entry/self_signed_certificates_for_a). Free, involves a little more work.

If you get a certificate signed by a trusted authority, create a [CSR](http://en.wikipedia.org/wiki/Certificate_signing_request) that we can send off to a certificate authority:

<pre><code class="prompt">$ </code><code class="in">keytool -certreq -alias MYORG -keystore ~/MYORG_keystore</code>
<code class="prompt">Enter keystore password: </code>
<code class="out">-----BEGIN NEW CERTIFICATE REQUEST-----
MIIC+DCCAeACAQAwgYIxCzAJBgNVBAYTAlNFMRUwEwYDVQQIEwxZT1VSIENPVU5UUlkxEjAQBgNV
BAcTCVlPVVIgQ0lUWTEaMBgGA1UEChMRWU9VUiBPUkdBTklaQVRJT04xGDAWBgNVBAsTD1lPVVIg
REVQQVJUTUVOVDESMBAGA1UEAxMJWU9VUiBOQU1FMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAqx4D8UoKecvVcSDkJWkLBr94IOb+aZuW704dfteg/scNHtsklAza/Taj/qcQLUnH+/BC
QW4HeOibtKMnvtDoz9qo2Cx0O+qJ4+XYXO2wGAorh1nvqbfmFCy/nmgRTJcUgROCW99FI0knlB2Z
fkeXSKQuu2wnLadflra/RmFBVcECSigBcQVG4xUBpRjxxIsM84hh0bez1KZgjRW66o62AbFynIsn
NsMB11d+1rUmZFVBqFwNcZ+CiKJfpOrBgLxQayRed/Jxhv+IKT95vz7a7czvfTzoopr9OuTqK/rC
d3V04744kFFjIUhNahbU4rOZtkr4htMAF17HFe61OaxbUQIDAQABoDAwLgYJKoZIhvcNAQkOMSEw
HzAdBgNVHQ4EFgQUgQjjFrERujTjUjlSIl6ia6l47ykwDQYJKoZIhvcNAQELBQADggEBACSH03D+
QSDbMp350+nUVgiV1tseInJJLkTfEG3F9lZPnJcdeY4rpb/JUCubmqD58iM5gHojNsrIucyY2Opp
PDE5lqD0oth3e48gkTL4VDuMLAk4tyGFVTuWHTGASf3b446qX5eufTJD3ri6bk7mJ8qXt8eDm4uB
z5+aNZ4m/Oh/pTOZxcnfXWGmO7yxIGfUDkiROvQm46qZ5pFwE+THNcPqIWCPLoiaEfdVLbQS6/ie
KNbVqnG0TtnCnhCnTIdWs2JXpniuMt9bpZs5n2nsOQYq1BxstLh8uQx6VhnFhc2h8lJbaXjC+miD
gPfUMYEiUNun30VaYBtfEJQJQlpBbtI=
-----END NEW CERTIFICATE REQUEST-----</code></pre>

Paste this into the CA's request form, retrieve the signed certificate, and replace the self-signed one:

<pre><code class="prompt">$ </code><code class="in">keytool -importcert -file ~/Downloads/signed_cert.pem -trustcacerts -alias MYORG -keystore ~/MYORG_keystore</code></pre>

You should now have a valid code signing certificate in your keystore, and you're ready to create and sign jar files.


2&#46; Create DeploymentRuleSet.jar
--------------------------------------

Oracle gives you a fair bit of control over how applets should run (refer to the [Deployment Rule Set documentation](http://docs.oracle.com/javase/7/docs/technotes/guides/jweb/security/deployment_rules.html) here), but here's an example of a very simple whitelist for two sites, while leaving everything else to run with the default security policy:

<pre><code class="prettyprint lang-xml">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;ruleset version="1.0+"&gt;
    &lt;rule&gt;
        &lt;id location="https://cruft.example.com" /&gt;
        &lt;action permission="run" /&gt;
    &lt;/rule&gt;
    &lt;rule&gt;
        &lt;id location="https://dinosaur.example.com" /&gt;
        &lt;action permission="run" /&gt;
    &lt;/rule&gt;
    &lt;rule&gt;
        &lt;id /&gt;&lt;!-- The last rule is the default policy and the id should be blank. --&gt;
        &lt;action permission="default" /&gt;
    &lt;/rule&gt;
&lt;/ruleset&gt;
</code></pre>

Then we package ruleset.xml into DeploymentRuleSet.jar:

<pre><code class="prompt">$ </code><code class="in">jar cf DeploymentRuleSet.jar ruleset.xml</code></pre>

and finally sign DeploymentRuleSet.jar with the certificate:

<pre><code class="prompt">$ </code><code class="in">jarsigner -tsa https://timestamp.geotrust.com/tsa DeploymentRuleSet.jar MYORG</code></pre>


3&#46; Distribute DeploymentRuleSet.jar to your clients
----------------------------------------------------------

With the jar packaged and signed, all that's left to do is distribute it to your clients. No fancy magic is needed here, just drop it in the appropriate path:

| OS                  | Path           |
| ------------------- | -------------- |
| Windows             | `C:\Windows\Sun\Java\Deployment\DeploymentRuleSet.jar`
| Mac OS X            | `/Library/Application Support/Oracle/Java/Deployment/DeploymentRuleSet.jar`
| Linux &amp; Solaris | `/etc/.java/deployment/DeploymentRuleSet.jar`


4&#46; Add a reminder for when the certificate expires
---------------------------------------------------------

Remember that certificates expire, and you really don't want to be caught with your pants down. I usually create a calendar reminder 3 months before it expires, with all the details needed to renew it.


References
----------

* [Introducing Deployment Rule Sets](https://blogs.oracle.com/java-platform-group/entry/introducing_deployment_rule_sets)
* [Deployment Rule Set documentation](http://docs.oracle.com/javase/7/docs/technotes/guides/jweb/security/deployment_rules.html)
* [keytool manual](http://docs.oracle.com/javase/7/docs/technotes/tools/solaris/keytool.html)
* [jarsigner manual](http://docs.oracle.com/javase/7/docs/technotes/tools/windows/jarsigner.html)
