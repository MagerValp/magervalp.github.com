---
layout: post
title: DS NetBoot sets from the command line
tags: Mac DeployStudio
---

If you, like me, only build DeployStudio NetBoot sets once in a blue moon I'm guessing you also tend to forget all the configuration options in the assistant and have to look them up each time. With the torrent of [recent DS releases](http://deploystudio.com/News/News.html) (not that I'm complaining!) I found myself running the assistant one too many times and I figured that there must be a way to automate it. There was a hint in the forum a while back ([post #5](http://deploystudio.com/Forums/viewtopic.php?pid=21539#p21539)) and recently PaintedTurtle posted a [sample script](http://deploystudio.com/Forums/viewtopic.php?id=5945) showing that it's actually pretty straightforward. I wrapped it up in a script with configuration options in the same order as the assistant to keep it nice and simple:

* [`AutoDSNBI.sh`](https://gist.github.com/MagerValp/76aa181cbd2796bab968)

As a bonus it accepts either a system volume or a system image, e.g. your latest [AutoDMG](https://github.com/MagerValp/AutoDMG) image.

I've built a couple of NBIs with it now but I haven't tested it extensively, so caveat emptor.
