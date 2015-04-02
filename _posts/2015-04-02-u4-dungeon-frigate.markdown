---
layout: post
title: Ultima IV Dungeon Ladder Frigates
tags: C64, Ultima, Commodore, coding, 6502, assembler
---

I released [Ultima IV Remastered](http://magervalp.github.io/2015/03/30/u4-remastered.html) to great fanfare last weekend and it warms my heart to hear that you're all enjoying it. I just received a bug report though that I thought was neat enough to share. As [Codetsu reported on Lemon64](http://www.lemon64.com/forum/viewtopic.php?p=669455#669455) if you press the B key while standing by a ladder going up in a dungeon, the game rather unexpectedly responds with "Board frigate!" (screenshot from the original Ultima IV port):

<figure>
    <a href="/images/u4-dungeon-board-bug-dungeon.png"><img src="/images/u4-dungeon-board-bug-dungeon.png" alt="Ultima IV pressing B in dungeon"></a>
    <figcaption>I don't see a frigate. Do you see a frigate?</figcaption>
</figure>

The game continues to play normally but you get a nasty surprise as you exit the dungeon:

<figure>
    <a href="/images/u4-dungeon-board-bug-surface.png"><img src="/images/u4-dungeon-board-bug-surface.png" alt="Ultima IV exiting dungeon after boarding frigate"></a>
    <figcaption>Oh <em>there</em> it is!</figcaption>
</figure>

You can exit the ship and walk away from the dungeon, but reentering is impossible until you move far enough away (roughly 30 steps, or use the teleport cheat) that the game's object buffer is cleared for that part of the map. Unless you're exiting Covetous, in which case you can just sail off since there is water right next to the dungeon entrance - a fairly handy way to spawn a ship in the original game with no cheats. But I digress.

What's really happening here though? Let's look at the game's code. The [raw disassembly](https://gist.github.com/MagerValp/fcf47ebe597af1a3424a) is a little tough to read so I've added labels:

<pre><code class="prettyprint lang-asm6502">; Disassembly starting at $4769:

cmd_board:
	lda player_transport        ; This is $00, so we branch to @onfoot.
	cmp #$1f
	beq @onfoot
	jsr j_primm
	.byte "Board &lt;-", $00

	jmp print_cant

@onfoot:
	lda tile_under_player       ; If the player is next to a ladder going up
	cmp #$14                    ; the current tile is $10.
	beq board_horse
	cmp #$15
	beq board_horse
	jsr j_primm                 ; It's not a horse so the game prints "Board ".
	.byte "Board ", $00

	lda tile_under_player
	cmp #$10                    ; As it happens the ladder up dungeon tile is
	beq @ship                   ; the same as a ship facing left on the
	cmp #$11                    ; surface, $10, so we branch to @ship.
	beq @ship
	cmp #$12
	beq @ship
	cmp #$13
	beq @ship
	cmp #$18
	bne @unknown
	jmp board_balloon

@unknown:
	jmp cmd_unknown

@ship:
	lda #$10                    ; Now it tries to remove $10 from the object
	jsr board_find_object       ; table. No object is found, but the current
	jsr j_primm                 ; player_transport is still set to $10 by
	.byte "frigate!", $8d       ; board_find_object (see below).
	.byte $00

	lda player_xpos             ; A new ship is spawned facing left at the
	cmp player_ship_xpos        ; player's current surface coordinate.
	bne @newship
	lda player_ypos
	cmp player_ship_ypos
	bne @newship
	jmp cmd_done

@newship:
	lda #$50
	sta ship_hull
	jmp cmd_done


; Disassembly starting at $480b:

board_find_object:
	sta board_object_id
	ldx #$1f
@checkobject:
	lda object_tile,x           ; The object_tile table doesn't contain any
	and #$fc                    ; ships, so this compare will always fail.
	cmp board_object_id
	bne @next
	lda object_xpos,x
	cmp player_xpos
	bne @next
	lda object_ypos,x
	cmp player_ypos
	beq @foundobject
@next:
	dex
	cpx #$08
	bcs @checkobject
	bcc @noobject
@foundobject:
	lda #$00
	sta object_tile,x
	sta map_status,x
@noobject:
	lda tile_under_player       ; After exhausting the table it ends up here,
	sta player_transport        ; where it still updates player_transport to
	rts                         ; whatever is on the map under the player.</code></pre>

What's the actual bug here? IMHO the game shouldn't assume that just because the player is on foot, it could board something &mdash; it also needs to check that the player is on the surface. The cleanest way to do so would be at the very beginning, but when you insert a binary patch you don't want to add or remove any bytes to the program, as that breaks everything coming afterwards. It's best if we can find a jmp or jsr that can be changed to point to a patched routine. Following the code we see that no game state is being changed before it jumps to the `board_find_object` subroutine, so let's redirect that:

<pre><code class="prettyprint lang-asm6502">patch_board_dungeon:
	.byte 2                     ; Patch two bytes.
	.addr $47b1                 ; Address to patch.
	.addr board_ship_check      ; The new vector.
	.byte 0                     ; End of patch.</code></pre>

I've added a short routine to the game's startup that takes a table with patches such as this, making it relatively painless to modify the game without having to recreate the whole source. Now we can insert a small stub with a surface check:

<pre><code class="prettyprint lang-asm6502">board_ship_check:
	lda current_location        ; Location $00 is Britannia surface.
	beq @in_britannia           ; If zero, continue as normal.

	pla                         ; Otherwise we pop the jsr return address and
	pla                         ; jump to printing "what?", just as if no
	jmp cmd_unknown             ; object was found.

@in_britannia:
	jmp board_find_object</code></pre>

Let's compile the project and see how this plays out:

<figure>
    <a href="/images/u4-dungeon-board-bug-fixed.png"><img src="/images/u4-dungeon-board-bug-fixed.png" alt="Error message when trying to board in a dungeon"></a>
    <figcaption>No more phantom ships hanging around dungeon ladders.</figcaption>
</figure>

With that bug squashed and the code commited to a new bugfix branch it's time for regression testing. Since we just changed the code for the board command, let's make sure we didn't add any new board related bugs. Pop up to the surface, spawn a horse, a ship, and a ballon, and try to board them.

<figure>
    <a href="/images/u4-dungeon-board-bug-regression.png"><img src="/images/u4-dungeon-board-bug-regression.png" alt="Two ships regression"></a>
    <figcaption>I only spawned one ship, so why are there two?</figcaption>
</figure>

Boarding a ship and sailing away leaves another copy of the ship on the map. With larger changes hunting down regressions can be a pretty daunting task, but with a change this small it's bound to be something stupid. And it is: when `board_find_object` is called, the object to find is in the A register, but the first thing we do in our patch is clobbering A with `current_location`. Let's change it to X which isn't used when calling `board_find_object`:

<pre><code class="prettyprint lang-asm6502">board_ship_check:
	ldx current_location        ; Location $00 is Britannia surface.
	beq @in_britannia           ; If zero, continue as normal.

	pla                         ; Otherwise we pop the jsr return address and
	pla                         ; jump to printing "what?", just as if no
	jmp cmd_unknown             ; object was found.

@in_britannia:
	jmp board_find_object</code></pre>

Compile, re-test, and this time there are no obvious regressions:

<figure>
    <a href="/images/u4-dungeon-board-bug-final.png"><img src="/images/u4-dungeon-board-bug-final.png" alt="Board working correctly"></a>
</figure>

With a game the size of Ultima IV there are dozens of little bugs like this that weren't caught before release. To the best of my knowledge there were no tools for testing 6502 code in 1985 and even revision control systems were rare, so it's impressive that there aren't more of them. Not counting conversation bugs this is the seventh bug I've fixed, and out of them only the shrine bug has any real effect on the game &mdash; even so it's fairly minor and was patched in a later update.

Anyway, the branch is merged and the fix will be included in the next update of Ultima IV Remastered. Let me know if you find any other bugs!
