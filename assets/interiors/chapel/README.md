# Dragon chapels

Imported from the user-provided Chapel pack. `tools/build-dragon-chapels.py /path/to/unpacked/Chapel` rebuilds the runtime sprite atlas and layout from the pack's Tiled maps. Pixel art, transparent edges, tile flips, animation frames, and per-frame durations are retained.

- Interior geometry follows Interior.tmx and the supplied screenshot. The railing is drawn above the floor to match the screenshot.
- Forgewick keeps its existing church exterior and receives the congregation, including the animated praying monks.
- The new desert exterior uses the pack's church and animated dragon components. Its interior has only Brother Cael, animated candles, and the blessing ceremony.
- Twelve grave-and-flower variants replace the rendering of Hollybeck's sixteen grave objects. Object IDs, positions, collision, and quest logic remain unchanged.
- Mounted flight sprint is 228 before the blessing and 285 afterward. Ordinary flight remains 170. `skyBlessing` is a permanent per-slot save flag; missing flags default to false.

Validation: `node tests/dragon-chapels.mjs` and `node tools/check-game-scripts.mjs`. Both exterior entrance/exit round trips and route corners were additionally exercised against the fully generated world.
