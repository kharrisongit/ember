# Workshop craftsmen

Dunstan keeps his restyled face/body and the original 0.15-second smithing
cadence. Work repeats frames 3–26, the four uninterrupted hammer strokes.
When conversation begins, he finishes the current strike, then uses frames
27, 40 and 41 to put the hammer down before idling. Frames 0–2 pick it back up
once on goodbye. The long rest is excluded from the working loop.
The station and every tool-contact/impact frame below the
anvil contact row are copied directly from the original `Smith_forge_full.png`
(`smithy_anim_8` in the unpatched atlas). The bench front comes from the original
smithy room crop, at its original seven-row overlap with the animation.

`dunstan-work.png` has 42 cells; `dunstan-idle.png` has four. Cells are 96×140
source pixels, drawn 48×70 with origin (24,48). The bench extends 20 world pixels
below the old worker anchor, with two transparent padding rows. Raised hammer
heads use neutral gray steel rather than the anvil's blue-black palette.
No median station or colour-based tool extraction is used at the anvil join.

The actor renders the complete assembly once. The former independent bench
retains its editor identity but is hidden and attached to the station. Collision
covers the anvil/bench from offsets (-18,-16) to (21,20); it and the dialogue
point follow editor moves. Clicking the bench selects the entire station.

The two `source/dunstan-upper-*.png` strips preserve the previously generated
upper-body artwork before the native station is joined. The earlier generated
source sheets and prompts remain here for provenance. This repair reuses those
assets and the original game art; it does not regenerate the animation.

Sela retains his native 45-frame glasswork loop. Conversation uses native frames
0, 1, 2, 3, 39 and 40. Both craftsmen stay idle through greetings, dialogue,
replies, topics and profiles, then resume work on goodbye.

Rebuild with `python tools/pack-workshop-craftsmen.py` (Pillow and NumPy).
Check with `python tests/workshop-art.py`, `node tests/workshop-craftsmen.mjs`,
`node tests/workshop-station.mjs` and `node tests/remaining-interactions.mjs`.
