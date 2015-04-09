---
layout: post
title: Ultima IV Remastered
tags: C64, Ultima, Commodore
---

I'm proud to announce that my remastered port of Ultima IV for the C64 has been released.


<figure>
    <a href="/images/u4-remastered-trinity-large.png"><img src="/images/u4-remastered-trinity-large.png" alt="Ultima IV Remastered"></a>
    <h1>Ultima IV Remastered for the C64</h1>
</figure>


## Download

You can download the game from its CSDb entry: [Ultima IV Remastered v2.1](http://csdb.dk/release/index.php?id=137617).


## Documentation

Scanned documentation can be found here: [Ultima IV Documentation](https://paradroid.automac.se/u4/docs.html).


## Screenshots

You can download screenshots of U4 Remastered and the original for comparison here: [Ultima IV Remastered screenshots](/data/u4screenshots.zip).


## Game Changes


### Graphics Overhaul

* Character creation intro has new graphics drawn by Vanja 'Mermaid' Utne.
* The tileset has been updated with new and more colorful tiles, mainly backported from Ultima V.
* When peering at a gem or casting view the map is now in color.
* The dungeon renderer has been sped up, and items and monsters are drawn in color.


### Text Overhaul

* NPC dialogue and game text now uses mixed case.
* Many dialogue bugs have been fixed:
    * Fixed broken question trigger and added missing dialogue for Thevel in Britain.
    * Added missing dialogue for Serpent's Hold gate guards.
    * Changed keyword for Michelle to avoid conflict with health in Serpent's Hold.
    * Fixed broken message trigger for Water in Castle British.
    * Fixed misspelled keyword for Estro in the Lycaeum.
    * Fixed misspelled keyword for a poor beggar in Yew.
    * Fixed broken message trigger for Alkerion in Minoc.
    * Fixed broken message trigger for Shamino in Skara Brae.
    * Fixed broken message trigger for Charm in Cove.
    * Dozens of minor fixes to spelling, grammar, and formatting.


### New Game Features

* Select active character in combat with 1-8, 0 returns to party mode.
* You can quit and save in dungeons.
* If you move outside the border of a towne, castle, or keep, the game asks if you want to exit to Britannia.
* Joystick control.
* Dungeons get darker when a torch is close to burning out.


### Bug Fixes

* Meditating at shrines now gives different hints for 1, 2, and 3 cycles.
* Hythloth dungeon rooms on level 6 are now accessible.
* Character creation no longer suffers from random hangs.
* Loading a saved game restores balloon flying mode.
* Allow backspace when giving gold or using stones.
* Don't enter locations when flying in balloon.


### Technical Enhancements

* Fastloader with support for 1541, 1571, 1581, CMD FD, and CMD HD.
* Runs from a single disk, no disk swapping when playing.
* EasyFlash cartridge version.
* Music is not interrupted when data is loaded from disk.
* SuperCPU support.


### Game Cheats

* A save game editor is bundled with the game.
* Unlimited magic.
* Unlimited food.
* Unlimited torches.
* Unlimited keys.
* Unlimited gems.
* Avoid combat.
* Control balloon.
* Idle without pass.
* Teleportation system, press T in Britannia and then (T)owne, (D)ungeon, (S)hrine, (L)ocation, or (C)oordinate.
* Create transport if you try to (B)oard an empty tile, select (H)orse, (S)hip, or (B)alloon.


### Additional Changes Since Ultima IV Gold

* Disk drive no longer spins when there is no disk activity, and the game loads faster.
* Balloon cheat has several bugs fixed.
* Swapped lat/long for teleport cheat.
* Added unlimited gems and idle cheats.
* Fixed reagent editing in save game editor.


### Known Bugs

* If you're playing the 1541 version and answer a question wrong during the ending the game is supposed to throw you out to Britannia, but instead it hangs. Play the 1571, 1581, or EasyFlash version instead to avoid this issue, or just make sure you get all the answers right.
* The crack intro is out of sync and glitches a bit on NTSC, but should otherwise work fine.
* Blue border doesn't get redrawn properly around wind status after you exit a dungeon.
* If you die and teleport back to Lord British the wrong music plays in Castle Britannia, until you klimb down the ladder or talk to Lord British.
* If the savegame editor is started from cartridge and has problems accessing the flash saves you get an error asking you to insert a disk in device #239.
