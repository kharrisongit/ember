# House resident sprite refresh

44 generated house residents were redrawn with the built-in image-generation
tool using their previous sprites and existing dialogue portraits as identity
references. The final prompt set is in `house-idle-prompts.json`; the per-person
map, sprite row, eyelid regions, and animation registration are in
`house-idle-manifest.json`. Bors retains the stable former Mattock sprite key.

`house-seated-v2.png` uses 48-pixel source cells, drawn at the existing 24-pixel
game size. Each row contains rest, inhale, half blink, and closed blink. Each
animation is registered to one neutral master. The inhale moves only cloth
below the jaw by one source pixel; the blink reuses only the generated eyelid
regions. Hair, face, glasses, clothing and baseline pixels outside those regions
cannot drift. Pixel scaling uses nearest-neighbor sampling, with opaque sprite
pixels and clear alpha outside the silhouette. Runtime scaling does not stretch
the inhale frame. Breath cycles last 4.4–5.36 seconds with a 250 ms blink,
staggered by the resident's identity.

The nine desert residents use continuous turban cloth around the head and lower
face, with folded wraps and draped tails; the corrected prompts are in
`house-idle-desert-revision-prompts.json`.

The existing house assignments, dialogue portraits, and table layering remain
in place. Tavern, inn, school and the original Millwood cast use their existing
art. The previous `house-seated.png` is retained for source compatibility.

Validation: `node tests/house-seated-npcs.mjs`,
`python tests/house-idle-pixels.py`, and `node tools/check-game-scripts.mjs`.
