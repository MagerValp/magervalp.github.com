---
layout: post
title: Making the Impossible Possible
tags: Commodore
---

There's an old joke in the Commodore 64 scene that if you want to see something done, just claim that it's impossible and make sure [Crossbow](http://csdb.dk/scener/?id=8056) hears you say it. The C64 celebrated its 30th birthday last year, and the limits of this unassuming little brown box are still nowhere to be found.

Back in 2006 while I was working on [Ultima IV Gold](http://csdb.dk/release/?id=39893) I'd established that none of the available loader systems met the requirements for the project, the biggest issue being that I needed to squeeze almost 800 files into a disk format that only has [683](http://en.wikipedia.org/wiki/Commodore_1541#Media) physical sectors. So armed with [Lasse Öörni's rants](http://covertbitops.c64.org/) and [Inside Commodore DOS](http://www.pagetable.com/?p=630) I sat down and eventually managed to create my own system, retronymed Uload. In the following year I also tackled [Ultima III Gold](http://csdb.dk/release/?id=51363), and with lots of help from [Krill](http://csdb.dk/scener/?id=8104) I experimented with fast GCR decoding and network transfer tools. So armed with knowledge and experience I inevitably performed the fatal mistake, [documented on the internet for all eternity](http://csdb.dk/forums/index.php?roomid=11&topicid=43923&showallposts=1#45912):

> "1541 isn't fast enough to decode in realtime." 

Well, shucks. While Crossbow wasn't listening, it turns out that [LFT](http://csdb.dk/scener/?id=16473) was. He released [Shards of Fancy](http://csdb.dk/release/?id=117358) today, and the accompanying article on [GCR decoding on the fly](http://linusakesson.net/programming/gcr-decoding/index.php) is now up. Hats off to you, Linus.

-

Bonus anectode: Having misinterpreted the JPEG spec back in the 90s I argued quite vehemently that you couldn't decode it on a C64, due to a lack of RAM. The result of course was [Juddpeg](http://www.ffd2.com/fridge/jpeg/).