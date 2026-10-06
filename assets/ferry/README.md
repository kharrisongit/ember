# Ferry passenger

`corin-seated.png` is a 64×96 sheet with six 32×32 cells. Columns are south and north; rows are plain clothes, sword, and armor. North views show seated hips and small rear boot heels, with knees and hands occluded by the torso.

`corin-seated-source.png` is the original built-in image_gen output. `corin-seated-rear-source.png` is its targeted rear-hand correction. Packing retains the original south poses and takes only the north poses from the correction. The full prompt sequence is in `corin-seated-prompts.json`. Run `node tools/prepare-ferry-passenger.mjs` to pack the sources using nearest-neighbor sampling, hard alpha, and the player's existing six-color hair ramp.

The small runtime sheet loads when ferry boarding starts. `js/ferry-passenger.js` uses the saved hair and eye selections and the existing identity recolorers on the head region only. It chooses the current outfit, sits during travel, and retains the standing pose for boarding and stepping ashore. The ferry seat anchor is six pixels below the hull center, placing the seated hips near the middle bench in both directions. It adds no startup image dependency.

`tests/ferry-passenger.mjs` checks all 25 color combinations in both directions and outfits, clothing isolation, alpha, and phase transitions. The generated-world regression also checks the small clearings around both ferry signs and consecutive generated-tree moves.
