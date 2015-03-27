---
layout: post
title: Ultima IV Remastered (teaser trailer)
tags: C64, Ultima, Commodore
---


My development projects are usually more or less in the open. As soon as I have something that might be of interest to others I tend to publish the repo on [GitHub](https://github.com/MagerValp), where it either [sinks](https://github.com/MagerValp/NewLogLines) or [swims](https://github.com/MagerValp/AutoDMG). For the last couple of months though I've been working quietly on my own. I have dropped a [couple](https://twitter.com/MagerValp/status/580331352110837760) of [screenshots](http://www.amibay.com/showthread.php?70120-UK1541-user-feedback&p=675660&viewfull=1#post675660) but I don't think anyone noticed... As I've been <em>itching</em> to talk about it it's with great relief that I'm finally able to announce:


<figure>
    <a href="/images/u4-remastered-trinity-large.png"><img src="/images/u4-remastered-trinity-large.png" alt="Ultima IV Remastered"></a>
    <h1>Ultima IV Remastered for the C64</h1>
</figure>


Ultima IV has a special place in my heart. 

Back in 1987 when I bought my first computer, I started trading games on tape with my friends, and dabbled a bit in basic and machine code programming. But after my friend visited his uncle he came back raving about this marvelous game that let you walk around on a world map, explore dungeons, and talk to people in towns and castles. The game would even save your progress so you could continue the next day. The only snag was that you needed a disk drive to play it, which none of us had.

It took me another year before I could save up enough money to buy a second hand disk drive, but when I did the first game I bought was Ultima IV. I spent countless hours exploring Britannia, reading through the faux leather cover manuals, and once I learned how to access raw sectors from the disk drive I started decoding the game's data to print maps on the screen.


<figure>
    <img src="/images/u4-map.png" alt="Ultima IV Map" width="256" height="256">
    <figcaption>My home away from home.</figcaption>
</figure>


Later on I took a proper look at disassembling the game and figuring out how it worked. I ended up rewriting the game's loader to work on larger disk drives, and fixed the game so it didn't run too fast with a [SuperCPU](http://en.wikipedia.org/wiki/SuperCPU) accelerator. After about four years worth of spare time it was released in 2006 as Ultima IV Gold. My intention was always to clean up the source a bit and release an updated version, but as with most projects it ended up sitting in a backup archive of my old Windows PC instead. My development environment slowly mutated, as it tends to do, so the archive turned into an uncompilable mess of old Perl scripts and jumbled Makefiles that somehow made sense at the time, but only now only produces a fountain of error messages.


<p style="width: 100%; text-align: center; font-size: 24px">&#x2625;</p>


Some [recent events](http://csdb.dk/event/?id=2314) in the C64 scene made a few people ask if maybe the Ultima IV Gold loader was available, but it saddened me to have to tell them that I couldn't even get it to work myself. This, combined with a week off work, made me decide that I might as well take a look at the mess. In the end it only took about a day's work, and after that I was hooked again. With a fresh Makefile written from scratch (if you're a programmer and haven't read [Recursive Make Considered Harmful](https://www.google.se/search?q=recursive+make+considered+harmful), go do so immediately after this) and all the support tools rewritten in Python the project came back to life.

I made a little research and compiled what I think is a fairly complete list of bugs in the 6502 ports (the C64 and Atari 800 versions share over 90% of the source code and data with the Apple II original), and it was a joy to hunt down every last one of them. The DOS version has received [several](http://ultima.wikia.com/wiki/Ultima_IV_Upgrade_Patch) [patches](http://wiki.ultimacodex.com/wiki/U4-Hythloth-L6-Room-7) too, and since the file formats are virtually identical I could backport those patches too.

<figure>
    <a href="/images/u4-hythloth-l6-large.png"><img src="/images/u4-hythloth-l6-large.png" alt="Hythloth level 6" width="312" height="206"></a>
    <figcaption>This room can't be reached in the original.</figcaption>
</figure>



The largest job though was fixing the dialogue, simply because there is so much of it. The early releases were littered with typos and downright bugs where some paths of the dialogue were inaccessible. Fortunately it got progressively better with each port and the last DOS version provided a good starting point. Interestingly the 68k ports were [independently fixed](http://ultima.wikia.com/wiki/Computer_Ports_of_Ultima_IV#The_16-bit_Ports) and differ both in style and how the bugs have been fixed.


<figure>
    <a href="/images/u4-serpents-hold-guard-large.png"><img src="/images/u4-serpents-hold-guard-large.png" alt="Serpent's Hold Guard" width="312" height="206"></a>
    <figcaption>These guards used to reply with Sentri's dialogue.</figcaption>
</figure>


While [Chuck Bueche](http://www.mobygames.com/developer/sheet/view/developerId,4623/) did a good job porting Ultima III and IV to the C64, not least with a great interpretation of [Ken Arnold's music](https://www.youtube.com/watch?v=2aHO6V2s_6s), he didn't use the hardware to its fullest potential. For Ultima V they hired [David Shapiro](http://www.mobygames.com/developer/sheet/view/developerId,491/) who was a lot more experienced with the platform - not that it's fair to compare with the earlier releases, there is a world of difference between C64 games in 1985 and 1988.

Disregarding the massive leaps forward that the core game engine did in U5, the most obvious change is probably that of the graphical richness that Shapiro managed to bring to the game, considering that it uses the same graphics mode as U3 and U4. The thought struck me that if I could just find 0x300 bytes for the extra color tables there's no reason U4 couldn't look just as good. Since memory was already full in my 2006 release it would need a lot of restructuring, as the color tables need unbroken pages of 0x100 bytes and there were only scraps here and there. It's always a little unnerving to rearrange memory when you're working with someone else's code, since what looks like free space might be used at a later point in the game, but by relocating some of my own patch code to gaps in lower memory I could transplant the tileset and color tables from Ultima V. It's impossible to port the full tileset, since the engine in Ultima V can handle 512 tiles and Ultima IV is limited to 256, but it still brings a marked improvement.


<figure>
    <a href="/images/u4-a2-c64-remastered-large.png"><img src="/images/u4-a2-c64-remastered-large.png" alt="Ultima IV for Apple II, C64, Remastered"></a>
    <figcaption>Ultima IV on the Apple II, the original C64 port, and my remastered version.</figcaption>
</figure>


I also decided to backport one of the best improvements in the U5 engine, where you can select an active character in combat &mdash; this makes a world of difference when exploring dungeon rooms.


Of course, after replacing the tileset the character creation intro graphics really sticks out like a sore thumb. The original port has a very primitive conversion of [Marsha Meuse's](http://www.mobygames.com/developer/sheet/view/developerId,11350/) Apple II graphics, and the C64 is capable of so much better. I checked with my friends in [Genesis Project](http://csdb.dk/group/?id=396) and to my great joy [Vanja 'Mermaid' Utne](http://csdb.dk/scener/?id=19) was interested in taking on the massive job of redrawing the intro graphics. The difference is, to say the least, stunning.


<figure>
    <a href="/images/u4-mermaid-intro-large.png"><img src="/images/u4-mermaid-intro-large.png" alt="Intro graphics"></a>
    <figcaption>The original intro graphics, and Vanja's replacement (based on the FM Towns version).</figcaption>
</figure>


Since I was on a roll I figured that I might as well fix one of my pet peeves with the game. For something that relies so heavily on telling a story with text, it has always baffled me that EVERYONE SHOUTS when you talk to them in the 6502 ports. The engine is perfectly capable of printing lower case characters, and it's used everywhere else. Since I had already extracted all the dialogue as part of the earlier bug hunt it was an easy job to port a cleaned up version of the DOS dialogue back in. A minor change in string encoding also meant that I could free up 16 bytes in every conversation, allowing me to put back some punctuation that had to be cut due to a lack of the space in the original.


<p style="width: 100%; text-align: center; font-size: 24px">&#x2625;</p>


Of course, it didn't end there, but this blog post is already way too long. For the full details you'll have to wait until it's released at [Gubbdata](http://csdb.dk/event/?id=2316) this weekend. All told, I've had a great time revisiting this old project and I can't wait to share it with the world!


<figure>
    <img src="/images/u4-packed.jpg" alt="Packed and ready to leave" width="300" height="400">
    <figcaption>C64s packed and ready to leave!</figcaption>
</figure>
