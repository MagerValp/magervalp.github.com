---
layout: post
title: Implementing a priority queue in 6502 assembler
tags: Commodore, coding, 6502, C, assembler
---

I have an old game programming project (*obligatory screenshots: [1](/images/Mutant-Combat.png) [2](/images/Mutant-World.png)*) that I have been playing with off and on for a few years now. It's a turn based combat RPG for the C64 and the engine is a great playground for testing algorithms and experimenting with data structures. There's a treasure trove of interesting problems to solve, like realtime [field of vision](http://www.roguebasin.com/index.php?title=Field_of_Vision), combat [line of sight](http://www.roguebasin.com/index.php?title=Line_of_Sight), and enemy [AI](http://www.roguebasin.com/index.php?title=Category:AI). I did an implementation of [A* pathfinding](http://theory.stanford.edu/~amitp/GameProgramming/) in assembler a few years ago, but it was too inflexible to be reused, so I decided to start over. To get decent performance out of A* you need a fast [priority queue](http://en.wikipedia.org/wiki/Priority_queue), so I figured that it would be a good first step.

You might want to download the sample projects if you want to follow along:

* Test project for Xcode: [CHeap](https://github.com/MagerValp/CHeap)
* 6502 code: [AsmHeap](https://github.com/MagerValp/AsmHeap).


# Playing with priority queues

A priority queue is an abstract data type like a stack or a queue, where you can insert elements that have an associated priority, and its unique selling point is that you can quickly pull out the element with the highest priority. It's commonly implemented using a [heap](http://en.wikipedia.org/wiki/Heap_%28data_structure%29). Python comes with a built-in module called [heapq](https://docs.python.org/2/library/heapq.html) which uses a standard list to store the heap's binary tree, so we can take a look at how it behaves:

<pre><code class="prompt">$ </code><code class="in">python</code>
<code class="out">Python 2.7.5 (default, Sep 12 2013, 21:33:34) 
[GCC 4.2.1 Compatible Apple LLVM 5.0 (clang-500.0.68)] on darwin
Type "help", "copyright", "credits" or "license" for more information.</code>
<code class="prompt">>>> </code><code class="in">import heapq</code>
<code class="prompt">>>> </code><code class="in">tree = []</code>
<code class="prompt">>>> </code><code class="in">for value in (6, 4, 7, 3, 8):</code>
<code class="prompt">... </code><code class="in">    heapq.heappush(tree, value)</code>
<code class="prompt">... </code><code class="in"></code>                                                            3
<code class="prompt">>>> </code><code class="in">tree</code>                                                       / \    <i>Each child is</i>
<code class="out">[3, 4, 7, 6, 8]</code><!--                    -->                             <i>Tree structure:</i>   4   7   <i>smaller than</i>
<code class="prompt">>>> </code><code class="in">while tree:</code>                                              / \      <i>its parent.</i>
<code class="prompt">>>> </code><code class="in">    print heapq.heappop(tree)</code>                           6   8
<code class="prompt">... </code><code class="in"></code>
<code class="out">3</code>
<code class="out">4</code>
<code class="out">6</code>
<code class="out">7</code>
<code class="out">8</code>
</pre>

A nice side effect is that when you pull out each item in priority order you end up with sorted data, since a heap is at the base of [heapsort](http://en.wikipedia.org/wiki/Heapsort). heapq implements a min-heap, so you get elements in ascending order.


# High level implementation

Instead of hitting the metal right away I like to start with a high level implementation. Since I needed an excuse to play with unit testing in Xcode, Objective-C seemed like a good idea. An NSMutableArray is a comfortable choice for storing the tree, so let's make a simple class interface:

<pre><code class="prettyprint">@interface CASMutableArrayHeap : NSObject

@property NSMutableArray *tree;

- (int)size;
- (void)push:(NSNumber *)value;
- (NSNumber *)pop;

@end</code></pre>

You can find the class implementation in [`CASMutableArrayHeap.m`](https://github.com/MagerValp/CHeap/blob/master/CAstar/CASMutableArrayHeap.m) on GitHub, since it's a bit too big to paste here. It's is based on chapter 10 in [Mastering Algorithms with C](https://www.google.com/search?q=Mastering+Algorithms+with+C+Kyle+Loudon) by Kyle Loudon (O'Reilly 1999) who explains the algorithm much better than I ever could.

[`CAstarMutableArrayHeapTests.m`](https://github.com/MagerValp/CHeap/blob/master/CAstarTests/CAstarMutableArrayHeapTests.m) contains unit tests that confirms that the classes grows and shrinks as expected, and that it correctly sorts a list of random numbers.


# Low level C implementation

The next step on the way down is to get rid of the high level types and automatic memory handling, so goodbye NSMutableArray. Instead let's work with a fixed buffer. This loses a lot of flexibility but the speed gains are massive:

<table style="width: 60%; margin-left: auto; margin-right: auto">
  <caption>
    <strong>1000 * 128 push/pop</strong>
  </caption>
  <thead>
    <tr>
      <th>Heap Implementation</th>
      <th>Time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>NSMutableArray</td><td>1431 ms</td>
    </tr>
    <tr>
      <td>Fixed memory buffer</td><td>28 ms</td>
    </tr>
  </tbody>
</table>

<!--
CASMutableArrayHeap 1000 * 128 push/pop = 1430.63 ms
CASCArrayHeap 1000 * 128 push/pop = 27.95 ms
CASCAsmHeap 1000 * 128 push/pop = 45.71 ms
-->

This implementation can be found in [`CASCArrayHeap.m`](https://github.com/MagerValp/CHeap/blob/master/CAstar/CASCArrayHeap.m).


# Pseudo-assembly

This is where I'd normally start writing assembly code, but since I'm having so much fun with the unit tests I figured I might as well write some 6502 pseudo code in C. This means that while it's still valid C code, all data is now manipulated 8 bits at a time, all arithmetic is done with a single variable called `a` and all indexed addressing is done with `x` and `y`, mimicking the 6502 CPU registers. Readability has gone out the window, but it can be translated line by line into assembly and it's nice to be able to test it for correctness before diving in. This version is in [`CASCAsmHeap.m`](https://github.com/MagerValp/CHeap/blob/master/CAstar/CASCAsmHeap.m).


# Finally the promised 6502

With a solid understanding of the implementation it's time to bring it down to assembly level. I prefer working with the assembler from the [cc65](http://cc65.github.io/cc65/) compiler suite, so let's create a public interface in `asmheap.h` allowing the code to be called from C:

<pre><code class="prettyprint lang-c">extern uint8_t asmheap_size;

void asmheap_init();
void __fastcall__ asmheap_push(uint8_t value);      /* Pass value argument in A/X instead of on the stack. */
uint8_t asmheap_pop(void);</code></pre>

The implementation starts with allocating a buffer for the tree:

<pre><code class="prettyprint lang-asm6502">	.align 128

tree:	.res 128	; Reserve 128 bytes for the tree, which allows
size:	.res 1		; us to use the N flag to check if it's full.</code></pre>

The first function is `asmheap_init`, which couldn't be simpler:

<pre><code class="prettyprint lang-asm6502">; Initialize an empty heap.
_asmheap_init:
	lda #0
	sta size
	rts</code></pre>

For push and pop let's use a small macro to help swap nodes in the tree:

<pre><code class="prettyprint lang-asm6502">; Swap node at x with node at y.
  .macro swap
	lda tree,x
	sta @temp
	lda tree,y
	sta tree,x
@temp = * + 1
	lda #$5e		; Self mod.
	sta tree,y
  .endmacro</code></pre>

Push:

<pre><code class="prettyprint lang-asm6502">; Push a value into the tree.
_asmheap_push:
	ldx size
	; If the heap is full, overwrite the last node.
	bpl :+
	dex
	stx size
:	; Push A to the bottom of the heap.
	sta tree,x
	inc size

	; Set Y to the parent node = (X - 1) / 2.
	txa
	sec
	sbc #1
	lsr
	tay
@heapify:
	; If X is at the top of the heap, we're done.
	cpx #0
	beq @done
	; If X is larger than its parent Y, we're done.
	lda tree,x
	cmp tree,y
	bcs @done
	; Swap X with its parent Y.
	swap
	; Set X to point at its parent.
	tya
	tax
	; Set Y to the new parent node.
	sec
	sbc #1
	lsr
	tay
	jmp @heapify
@done:
	rts</code></pre>

And pop:

<pre><code class="prettyprint lang-asm6502">; Pop the lowest value from the tree.
_asmheap_pop:
	; Save the item at the top so we can return it.
	lda tree
	sta @return_value
	; Remove the item at the bottom of the tree.
	dec size
	beq @done
	ldy size
	lda tree,y
	; Move it to the top of the tree.
	sta tree
	; Heapify the tree.
	ldx #0
	stx @current_node
@heapify:
	; Left child is at x * 2 + 1.
	txa
	asl
	;clc		; X is always &lt; 128
	adc #1
	tay
	; Check if we're at the bottom of the tree.
	cpy size
	bcs @done
	; Check if left child is smaller.
	lda tree,y
	cmp tree,x
	; If not skip to checking the right child.
	bcs @check_right
	; Since it was smaller let X point to the left child.
	tya
	tax
@check_right:
	; Right child is at x * 2 + 2, or left + 1.
	iny
	; Check if we're at the bottom of the tree.
	cpy size
	bcs @check_swap
	; Check if right child is smaller.
	lda tree,y
	cmp tree,x
	bcs @check_swap
	tya
	tax

@check_swap:
	; If either child was smaller X is different from the current node.
@current_node = * + 1
	cpx #$5e		; Self mod.
	; If not we're done.
	beq @done
	
	; Swap parent with child.
	ldy @current_node
	swap
	; Let the child be the new current node.
	stx @current_node
	; Repeat.
	jmp @heapify
@done:
	ldx #0
@return_value = * + 1
	lda #$5e		; Self mod.
	rts</code></pre>


# Testing and benchmarking

In order to verify that the final implementation works as intended I ended up writing a small test and benchmarking harness. You can find the heap implementation together with the tests on GitHub as [AsmHeap](https://github.com/MagerValp/AsmHeap). For fun let's run the benchmark and see how it fares:

![AsmHeap](/images/asmheap100.png)

That's about 86 seconds for 1000 * 128, which makes my 3.7 GHz Xeon E5 Mac Pro about 3000 times as fast as my C64.
