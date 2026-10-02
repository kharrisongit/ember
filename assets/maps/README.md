# Emberfell realm artwork

`emberfell-realm-final.png` is the complete, single-image map. The atlas displays
`emberfell-realm-v2.webp`, converted from that PNG without changing its composition.
The older `emberfell-realm.webp` is retained as an earlier artwork revision.

The current map was made with the built-in image generation tool on 2026-10-02,
using the actual game temples, town buildings, mill and animals as visual
references. The final image paints all three temples into spacious grounds of
their own. Nothing is pasted over the terrain or added as a building sprite.
The full art direction is recorded in `emberfell-realm-integrated.prompt.txt`.
The final local Millwood revision is in `millwood-clarity.prompt.txt`: a taller
timber windmill with four bold sails and larger, clearly separated cows.

Millwood and Thornwell are separated by a north–south belt of orange birches.
Thornwell is farther north, with its fenced orchard directly below its southern
edge. Oaks and Forgefalls separate Thornwell from the larger Forgewick town.
The single bridge crosses below a distinct waterfall and leads to Forgewick;
the temple is a separate southern destination. Open rocky ground separates
Forgewick from Sandspire. The desert church has no rooftop dragon. The desert
and winter temple grounds have separate approach paths, with scenery arranged
around them. Millwood has a standalone timber windmill beside its wheat field;
cows, horses, camels and perched vultures have distinct silhouettes.

`emberfell-windmill-base.webp` is an optional animation texture, generated using
`millwood-motion.prompt.txt`. Only a small rectangle around the mill
sails is used in the game. The complete PNG retains its own windmill sails and
all water/lava scenery. `js/atlas-motion.js` aligns the animated rotor, water,
waterfall and lava with the current illustration; reduced-motion mode displays
the complete still.

Art direction: a panoramic 3:1, richly painted fantasy atlas on warm parchment,
with detailed miniature settlements, terrain, rivers and coastlines. No text,
labels, UI, route markings, or baked-in quest icons. Keep the realm's geography:
Millwood and the elder's home in the southwest; the northern woods and mushroom
country above them; Thornwell and Forgefalls east of Millwood; Forgewick and its
southeastern temple beyond the green country; the oasis, Sandspire and its
southeastern temple in the central desert; blossom-covered coastal Coralmere to
the southeast; Witchmoor and Dreadmarsh farther east; snowy Hollybeck, its
northwestern graveyard and northeastern temple; Frostcrag and Ashcrag leading
through the highlands to the volcanic east and Cinderhold Castle. Evoke an
adventurer's treasured heirloom map with a clear, readable landscape.

The image is 2172 × 724, rendered in the existing 1536 × 512 atlas coordinate
space. Place labels, tracked routes and markers are separate interactive
layers in `js/quest-map.js`, so quests can update without regenerating the art.
Routes are schematic connections between named areas, not tile-level navigation.
