# Dialogue portraits

131 transparent painted portraits were generated with the built-in image tool
from the current in-game NPC sprites and the two user-supplied portrait-style
references. `cast.json` records every speaker, source sprite, map, and atlas cell.
`generation-prompts.json` preserves the prompts, including the requested black
knight, open-faced bearded Halvard, and less human mushroom corrections.

The eight `pack-*.js` files contain transparent WebP atlases (5 columns by 4 rows,
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
Portraits overlap the top edge of the dialogue box without a CSS transparency fade.

The cast was reframed with built-in image generation on 2026-09-26 to show
complete shoulders and upper arms. Cells are repacked with transparent margins,
without CSS edge fades. Toft now has an older, broad face and grey moustache;
Serjeant Bram has dark skin; scarf wearers have distinct visible faces; Tessa
has two arms holding her flute. Corin’s upgraded armour has the same full framing.

Fen and Rowan use individual transparent WebP overrides (`fen.webp`, `rowan.webp`),
rendered by the same dialogue and small-portrait helpers. Generated with the built-in
image tool from their original cells: Fen's hat removed; Rowan's small felt hat
replaced with a large woven straw hat. Faces, clothing and painted style preserved.
