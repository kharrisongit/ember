# Emberfell realm artwork

`emberfell-realm.webp` is the illustrated background for the interactive atlas.
Generated with the built-in image generation tool on 2026-09-28, using the previous
realm map as a composition reference. Converted to WebP without changing its content.

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
space. Place labels, roads, tracked routes and markers are separate interactive
layers in `js/quest-map.js`, so quests can update without regenerating the art.
Routes are schematic connections between named areas, not tile-level navigation.
