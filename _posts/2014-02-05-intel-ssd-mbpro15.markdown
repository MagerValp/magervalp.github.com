---
layout: post
title: The joys of an Intel X25-M SSD in a MacBook Pro 15" (Early 2011)
tags: Mac
---

I got my shiny new Mac Pro the other week, and I finally finished migrating everything from my old machine. A nice side effect was that I could move the SSD over from my old Mac Pro to my laptop, since it's the last of my machines suffering from spinning rust. Heck, even my C64s and Amigas have flash drives these days. The early 2011 15&quot; is easy enough to open up, and Thunderbolt target mode makes it easy to shuffle the data over.

Unfortunately the machine refused to boot afterwards, and in recovery mode the SSD wasn't even visible in Disk Utility or system_profiler, yet it showed up as a device in the Startup Manager and obviously worked in target mode. There are lots of threads on the discussion boards about trouble with SSDs in the 2011 MacBooks, apparently due to badly shielded SATA cables. It turned out to be a red herring though, as the actual problem turned out to be a firmware bug:

* (2CV102M3) This firmware revision fixes enumeration and slow boot issues [...]

As soon as Spotlight and Dropbox stops fighting over who gets to index the drive first my laptop should finally join the ranks of snappy computers.

*And special thanks to Cpuroast in ##osx-server on helping me find the intel fw update.*
