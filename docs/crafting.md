# Fieldcraft

Nan gives the portable Crafting Kit alongside three Hare Meat during her post-hatching goodbye. Then open **Bag → Craft** in a safe place, while dismounted. Older saves past that goodbye retain access; dev Skip grants the kit. Nan gives the first recipes during the morning introduction or her crafting lesson. Opening the book never grants recipes or supplies.

| Teacher | Recipes |
| --- | --- |
| Nan, Millwood home | Potion; roasted boar, hare, venison, fox and bird; herb-baked fish |
| Wren, Thornwell market | Elixir |
| Shroom King, Sporehollow | Madness Dust |
| Dunstan, Forgewick smithy | Bell Stake, Grave Marker |
| Brother Edrin or Brother Cael | Consecration |
| Maelis, Witchmoor | Maelis’s Curse |
| Sverre, Hollybeck | Saint’s Breath, Resurrection Stone |

The book shows only learned recipes, with no locked entries or teacher spoilers. The ingredients page shows owned supplies, ingredients in learned recipes, and available merchant stock. Raw meat and fish remain hunting/fishing rewards. Cooked food restores 40 dragon HP (fish: 45), capped at maximum health, and can revive a fallen Aurelius.

## Gathering and supplies

The opening area has only two one-time patches along the north Millwood chest route (9185): two herbs and one bitterroot, exactly one potion. Ordinary gathering begins at the eastward road toward Thornwell (x ≥ 80 tiles). Ground art is 18px instead of 26px. Healing herbs, mushrooms and bitterroot grow along eastern woodland roads; sunblooms and bitterroot in the desert; marsh reeds and ghostcaps in the swamp; frostberries and snowbells in the winter; mineral deposits in the volcanic region. Roadside patches are non-solid, standable, clear of doors, and can be gathered from any side with A. Each gives two ingredients and regrows after twenty minutes. Stable patch IDs and cooldowns survive saves.

Golems drop mineral dust; shroom and mine enemies provide supplementary ingredients. Powerful supernatural enemies and occasional ordinary kills drop spirit essence. Gold-bearing chests include small ingredient bundles. Haunted and empty chests retain their original behavior. Merchants have an Ingredients page; later-region stock unlocks with the journey. Spirit essence cannot be purchased.

## Minigame and saves

Crafting automatically plays a short recipe-specific animation, then grants the batch. Potions and elixirs simmer and bottle; magical brews have their own colors and infusion effects. Madness Dust and Consecration are ground and packed without a cauldron. Bell Stakes are shaped, hammered, bound and rung; Grave Markers are shaped and inscribed; Resurrection Stones are faceted, polished and awakened. Each cooked food uses its own cut of meat or fish on the grill with matching preparation captions. **Finish now** grants the identical batch immediately. There are no gestures, puzzle, skill score or timing checks. Hidden tabs pause, and reduced-motion shortens preparation to one second.

The world pauses while the book is open. The animation lasts 4.2 seconds by default. Ingredients are reserved and saved when a batch begins. Closing or cancelling refunds them once. Loading an interrupted batch refunds its canonical recipe costs after loading the base inventory. Finishing grants the result and clears the pending batch together before saving. New games and other save slots have independent crafting state.

## Assets and verification

`assets/crafting/ingredients.webp` is a generated ten-cell ingredient sheet (5×2), decoded lazily and never awaited during boot. `camp-kit.webp` and the transparent six-cell `camp-tools.webp` are generated 2D pixel art, loaded only when preparation opens. Canvas effects animate stirring, steam, embers and ingredient flecks at a capped 30fps on a small pixel grid. Reduced-motion disables ambient effects. The church portrait fix uses a separate lazy 6×3 atlas with all eighteen speakers; its cast manifest is under `assets/portraits`.

`tests/crafting.mjs` checks all recipes, automatic completion, hidden-page pause and equivalent Finish now, exact output, inventory deductions, cancellations, actual save/load, migration, teachers, stock, food, drops and gathering cooldowns. `tests/crafting-world.mjs` runs inside the existing full-world pyramid audit to verify every gatherable material has walkable patches without generating the world twice.
