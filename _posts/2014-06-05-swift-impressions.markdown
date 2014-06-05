---
layout: post
title: Swift Impressions
tags: Mac Swift
---

Of all the announcements at [WWDC](https://developer.apple.com/wwdc/) the one that got me the most excited was that of [Swift](https://developer.apple.com/swift/), the new programming language. I looked at [Go](http://golang.org/) and [Rust](http://www.rust-lang.org/) earlier this year, and while I find them interesting I didn't find a compelling reason to switch from Python, my trusty go-to language for the past few years. And even though I prefer Python for most projects, when you're developing Cocoa applications you always feel like a second-class citizen. The [crazy long](https://github.com/MagerValp/AutoDMG/blob/76632b7568bb7079bc4ef02e6cbbfa6ffcfc026b/AutoDMG/IEDAppVersionController.py#L71) method names are a small but ever-present annoyance, and I've spent way more time than I like trying to herd [runaway exceptions](https://github.com/MagerValp/AutoDMG/commit/021cad4bff38a8d69cddd64a6567e1a6b04efdee#diff-6aadb2f63ce120533e6c25967a8fa3c6) in background threads.

So I've been on the fence lately, thinking that maybe I should trade some of Python's ease of development for Objective-C's promise of a more stable code base down the road. Thus, the Swift announcement couldn't have come at a better time. The stability and performance of a modern, type safe language, together with the automatic memory management and flexible container types that Python has spoiled me with. What's not to love?

I took the plunge and installed the Xcode 6 beta, and promptly lost a day futzing around with [Storyboards](https://developer.apple.com/library/prerelease/mac/recipes/xcode_help-IB_storyboard/AboutStoryboards.html) and [Auto Layout](https://developer.apple.com/library/mac/documentation/userexperience/conceptual/AutolayoutPG/Introduction/Introduction.html) - I really need to take the time to learn that stuff. But then I spent most of yesterday making a silly little app to display the status of the Absolute Manage agent and what packages it has queued for install, giving Swift a proper workout. My impressions:


# The Good

* The syntax is nice and consistent, with no obvious warts.
* All the things you'd expect from a modern language, like type inference and closures.
* [Optionals](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/TheBasics.html#//apple_ref/doc/uid/TP40014097-CH5-XID_428) provide an elegant and safe alternative to NULL pointers.
* It's refreshing to actually have to read the documentation, since there's virtually nothing of substance on Google or StackOverflow.


# The Bad

* It's frustrating to actually have to read the documentation, since there's virtually nothing of substance on Google or StackOverflow.
* There's no way to catch exceptions, yet we're expected to call classes that [can raise](https://developer.apple.com/library/mac/documentation/cocoa/reference/foundation/Classes/NSTask_Class/Reference/Reference.html#//apple_ref/occ/instm/NSTask/launch) them.
* I'm missing list comprehensions.


# The Ugly

* The Xcode syntax highlighter keeps crashing and restarting.
* I've managed to find no fewer than two bugs with array downcasting that causes the compiler to crash.
* Error messages are rarely helpful:

<pre><code class="out">AMSController.swift:52:38: error: cannot convert the expression's type 'AnyObject[]!' to type 'AnyObject[]!'</code>
<code class="prettyprint">if let urls = fm.contentsOfDirectoryAtURL(dirURL, includingPropertiesForKeys: [], options: 0, error: &amp;error) {</code>
<code class="out">              ~~~^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</code></pre>

*(I think `options: 0` should be `options: nil` since in Swift it's a struct and not a bitmask - at least that makes the compiler happy.)*


# Verdict

Overall the first impression is overwhelmingly positive, and whatever my next Cocoa project will be I'm certain that I'll be writing it in Swift. The only problem is that the toolchain is currently too buggy for actual work, but I'm sure that will improve in the next couple of betas.
