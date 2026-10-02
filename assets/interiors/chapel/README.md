# Dragon chapels

Imported from the user-provided Chapel pack. `tools/build-dragon-chapels.py /path/to/unpacked/Chapel` rebuilds the runtime sprite atlas and layout from the pack's Tiled maps. Pixel art, transparent edges, tile flips, animation frames, and per-frame durations are retained.

- Interior geometry follows Interior.tmx and the supplied screenshot. The railing is drawn above the floor to match the screenshot.
- Forgewick keeps its existing exterior and pews, but removes the dragon window and statues under Halvard’s ban. All sixteen congregants are animated, individually talkable NPCs. Brother Edrin reveals his brother Cael’s secret desert church, unlocking a saved discovery quest.
- The new desert exterior uses the pack's church and dragon components held on their first frame as a statue. Its interior has only Brother Cael, animated candles, and two mirrored dragon statues beside the runner, with no pews. Cael casts the blessing at his stand. Aurelius can enter both chapels.
- Twelve grave-and-flower variants replace the rendering of Hollybeck's sixteen grave objects. Object IDs, positions, and quest logic are retained. Visible graves have solid footprints, and the graveyard clearing is all dirt.
- The pyramid’s three-row cactus border encloses the desert church, with its southern path left open. Five populated reptile arenas guard the approach. Dev travel includes outdoor and interior church destinations.
- Mounted flight sprint is 228 before the blessing and 285 afterward. Ordinary flight remains 170. `skyBlessing` is a permanent per-slot save flag; missing flags default to false.

Validation: `node tests/dragon-chapels.mjs` and `node tools/check-game-scripts.mjs`. Both exterior entrance/exit round trips and route corners were additionally exercised against the fully generated world.
