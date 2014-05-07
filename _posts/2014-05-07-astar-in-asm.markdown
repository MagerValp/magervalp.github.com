---
layout: post
title: Implementing A* in 6502 assembler
tags: Commodore, coding, 6502, C, assembler
---

[Last time](/2014/05/02/priority-qeue-in-asm.html) I implemented a priority queue using a heap, and this time I'm going to use it as the basis of implementing [A\* pathfinding](http://theory.stanford.edu/~amitp/GameProgramming/) for my RPG (*[1](/images/Mutant-Combat.png) [2](/images/Mutant-World.png)*). As always the code is available on GitHub: [AsmAstar](https://github.com/MagerValp/AsmAstar).

I'm not going to try to explain the algorithm here, but I'm going to focus on how I implemented it and the optimizations I chose. I recommend reading [Amit Patel's Introduction to A\*](http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html) as it's the best article on A\* I've found.


<img src="/images/AstarPy.png" alt="Astar.py" style="float:right; margin-left: 15px">

# Playing with A\*

This time I also started with a high level implementation to get the details right before writing low level code, and I'd been looking for an excuse to play with [Pythonista](http://omz-software.com/pythonista/). I can't say I enjoyed writing code on my iPhone though, a Bluetooth keyboard is a must before I try that again. Anyway, I shared the code as a gist if you want to play with it it:

* Pythonista code: [Astar.py](https://gist.github.com/MagerValp/11369992)

The core of the algorithm is in `find()`. Since writing code on my iPhone drained my patience it's missing a few vital optimizations, making it perform quite badly. I can always claim that it's slow so you can watch as the algorithm expands its search tree.


# The open set

A\* spends most of its time inserting and deleting nodes from the open set, which is why it's important to choose the right data structure for it. Depending on what kinds of maps it's traversing the ratio of insertions to deletions is going to vary, but it's likely to be heavy on insertions. In my game, with 8 directions of movement in rooms that rarely have more than 10x10 tiles of open space, I've found that it inserts about twice as many nodes as it deletes. Fortunately the [heap](/2014/05/02/priority-qeue-in-asm.html) that I implemented in my last article has [O(log n)](http://bigocheatsheet.com/) complexity and is slightly faster at inserting than deleting, fitting the task nicely. It only needs to be widened so that instead of just maintaining a tree of single bytes it has parallal trees of priority, cost, xpos, and ypos that are all manipulated in tandem.


# The closed set

A\* also needs to keep track of nodes that have already been explored, the set of closed nodes. To support large maps this needs to be a dynamic data structure that features fast lookups and doesn't use too much RAM.

One vital distinction that needs to be made is that *nodes* in the A\* search tree are not the same as map *coordinates*. The same coordinates can be visited by multiple nodes when alternative paths are explored. There's an optimization opportunity here though: only insert nodes for a coordinate if the cost is lower than that of previously visiting nodes. This has a large impact on the number of nodes that are inserted. Also, when grabbing a node from the open set, if the coordinate has been visited previously by a less costly node, there's no need to examine it as all its children will be more expensive. Taken together they mean that even though there may be multiple nodes for a coordinate in the open set, instead of a set of closed nodes we only have to store a cost for each coordinate, and this can be done with a simple array. There are two values that need to be stored for each coordinate:

* The lowest cost that it has been reached by.
* Which neighbor the path came from.

Since I allow 8 directions of movement 3 bits is enough to store the neighbor. My [action point](http://en.wikipedia.org/wiki/Action_point) system uses a cost of 5 for orthogonal movement and 7 for diagonal, but even if I used a cost of 2/3 I would need at least 6 bits to represent path cost. Thus the only option is to use at least two bytes of storage for each coordinate.


# Sliding window

This has turned the problem from one of speed or complexity into one of size. I have a 4&nbsp;kB buffer for map tiles, but there simply isn't space to allocate another extra 8 kB. Fortunately I don't have creatures moving across the whole map since combat is limited to one room at a time, and rooms are never larger than 21&nbsp;x&nbsp;21 tiles, neatly fitting them on a single screen. This means that I can have a window that slides across the map following the action and only need two 441 byte buffers for cost and direction.

![Sliding Window](/images/Mutant-Sliding-Window.png)
*Current room borders (red) and sliding window (green).*


# From C to assembly

I started out with everything except the heap in plain C and then worked out which functions took the most time. The low hanging fruit was array access to the map, cost, and direction buffers since it involved 16-bit multiplication, and they're called several times for each node. The other function that was easy to optimize was the A* heuristic calculation (based on [Chebyshev distance](http://en.wikipedia.org/wiki/Chebyshev_distance) multiplied by 5 for orthogonal steps and 7 for diagonal steps), called once for each node insertion. Instead of relying on the C compiler's generic 16-bit math I use hardcoded 8-bit multiplication with shifts and adds, making it an order of magnitude faster.

With the micro optimizations out of the way I started looking at converting the code for examining neighbors and inserting them into the open set. The results were rather disappointing though &mdash; despite inlining the cost check/update and using registers instead of the stack to pass arguments the net result was a meagre 5% speedup. In the end keeping the code clear and maintainable is more important than squeezing out the last bit of performance, it's a turn based game after all.


# Sandbox application

I developed a small sandbox application for testing. You can place unpassable boulders on a 21&nbsp;x&nbsp;21 map and watch as the algorithm tries to wiggle its way around them. The closed set is visualized with arrows displaying the direction from which it was added. You can download it here:

* Prebuilt binary: [`AsmAstar.d64`](/data/AsmAstar.d64)
* Source code: [AsmAstar](https://github.com/MagerValp/AsmAstar).

Run it with `x64sc` from the [VICE Emulator Suite](http://vice-emu.sourceforge.net/index.html#download).

![AsmAstar](/images/asmastar.png)
