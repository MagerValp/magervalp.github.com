---
layout: post
title: CreateUserPkg is up for adoption
tags: Mac AutoDMG
---

<figure>
    <a href="/images/se-tripel.jpg"><img src="/images/se-tripel.jpg" alt="SE Tripel"></a>
</figure>

As some of you might know, I've been on a leave of absence this autumn, and I've basically been fortunate enough to have the days to myself. I've spent most of it on bike rides around Columbus, playing around with the laser cutter at the [Columbus Idea Foundry](http://www.columbusideafoundry.com/), or preparing for the talk I gave at [MacTech](https://github.com/MagerValp/MacTech-2016), but over these last couple of weeks I've been catching up on some of my open source projects.

<img src="/images/CreateUserPkg-icon.png" alt="CreateUserPkg icon" style="float:right; margin-left: 0.5em; width: 9ex;">

Even with all this copious free time, I've had to realize that I have more projects than I have time for, and when January comes around I'll be back to working full time again. The project that is in the most dire need of an overhaul is [CreateUserPkg](https://itunes.apple.com/us/app/createuserpkg/id540673598?mt=12). It was one of my first Cocoa projects, where I learned how to do document based apps, sandboxing, and how to publish in the App Store. I had to resort to some [really crazy antics](https://github.com/MagerValp/CreateUserPkg/blob/ce3d3039927b1eb597a7f8f8cd4632df250e343f/CreateUserPkg/create_package.py#L108-L160) to generate packages without requiring root. Good times. But that was then, this is now, and a lot has changed:

* macOS ships with [pkgbuild](https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man1/pkgbuild.1.html) and [productbuild](https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man1/productbuild.1.html), replacing the need for most of the horror show in [create_package.py](https://github.com/MagerValp/CreateUserPkg/blob/ce3d3039927b1eb597a7f8f8cd4632df250e343f/CreateUserPkg/create_package.py).
* 10.5/10.6 support is no longer needed, so the [SHA1 shadow hash](https://github.com/MagerValp/CreateUserPkg#security-notes) needs to be eliminated in favor of [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2).
* Using `.pkg` as the document type was just a bad design desicion, I should have made a separate document format and then exported to `.pkg`.
* [MDM payloads can create users](https://help.apple.com/profilemanager/mac/5.2/#/apdA38473F4-C7B3-4BCC-B80D-E6F0220E8CD0), maybe we should be generating those instead?
* The app desperately needs a better name too. I've always been bad at naming things. Fortunately Greg saved my bacon with [AutoDMG](https://github.com/MagerValp/AutoDMG/blob/master/AutoDMG/en.lproj/Credits.rtf).

On top of it all the project is small enough that it's *begging* for a Swift rewrite. But not by me. If you're looking for an excuse to get into Cocoa development, here's a great opportunity. There are [a dozen suggested enhancements](https://github.com/MagerValp/CreateUserPkg/issues) on GitHub you want to go further.

So please, [fork the repo](https://github.com/MagerValp/CreateUserPkg), or maybe just start over from a clean slate. The Apache license means that you can basically do what you want with the code. The only thing I request is that you give your app a better name.
