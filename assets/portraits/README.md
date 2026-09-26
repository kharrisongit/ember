# Dialogue portraits

131 transparent painted portraits were generated with the built-in image tool
from the current in-game NPC sprites and the two user-supplied portrait-style
references. `cast.json` records every speaker, source sprite, map, and atlas cell.
`generation-prompts.json` preserves the prompts, including the requested black
knight, open-faced bearded Halvard, and less human mushroom corrections.

The seven `pack-*.js` files contain transparent WebP atlases (5 columns by 4 rows,
192-pixel cells). They load on demand through `js/dialogue-portraits.js`; the first
pack warms during startup. An explicit name map avoids substring collisions.
Narration and closing dialogue hide portraits, including pending image loads.

Unique character names: the glass-shop Maren is Meriel; the library Tessa is
Tamsin; the student Bram is Brin; the tavern Pip is Puck. The newly placed drinkers
are Eira and Fenton, with Tallis and Kip retaining their intended dialogue names.
Original editor keys and source identities remain stable for saved placements.
Chanter and Morel, the two human sprites at Shroom Pass, are retired.

Aurelius and Halvard were revised with built-in imagegen on 2026-09-26.
The young dragon follows the same sprite; Halvard retains his visible beard
with complete shoulder contours. Revision prompts are in revision-prompts.json.
Dialogue applies a lower-edge transparency fade to the entire portrait cast.
