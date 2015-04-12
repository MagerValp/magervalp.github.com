---
layout: post
title: Ultima IV Remastered on GitHub
tags: Ultima, C64
---

One of the primary reasons for getting back into Ultima IV was that I wanted to clean up my old Ultima IV Gold sources. Remastering was the result of sliding down that slippery slope of just fixing one more thing.

The restarted project was born out of nice, clean, structured source but when crunch time came ideals were abanonded and compromises were made. Sadly the project isn't in as nice a shape as I'd like and there are some nasty gotchas in there, but if I don't release it now I risk having the project rot away in my private repo again, and bringing us back to square one. You can check out the source, warts and all, from [u4remastered on GitHub](https://github.com/MagerValp/u4remastered).

For C64 programmers there are some reusable parts like the IFFL and EasyFlash loaders and LZMV compression (of which I have more, in the repo is just the pack tool and the stream decruncher).

My work should also be portable to the Apple II and Atari versions if anyone is up for it, and the dialogue fixes should be adaptable to the DOS/Amiga/ST versions as well.

Finally, for the curious I'll be keeping continued bugfixing and development on GitHub if you want to follow along. I'll start moving my todo list into the project's [issue tracker](https://github.com/MagerValp/u4remastered/issues)] later today.
