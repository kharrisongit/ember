# Fieldcraft

Open **Bag → Craft** in a safe place, while dismounted. Nan gives the first recipes and enough ingredients for three potions during the morning introduction. Existing saves receive this starter kit on their first visit to the crafting book.

| Teacher | Recipes |
| --- | --- |
| Nan, Millwood home | Potion; roasted boar, hare, venison, fox and bird; herb-baked fish |
| Wren, Thornwell market | Elixir |
| Shroom King, Sporehollow | Madness Dust |
| Dunstan, Forgewick smithy | Bell Stake, Grave Marker |
| Brother Edrin or Brother Cael | Consecration |
| Maelis, Witchmoor | Maelis’s Curse |
| Sverre, Hollybeck | Saint’s Breath, Resurrection Stone |

The book shows every recipe’s teacher, ingredient counts, and gathering locations, including recipes not yet learned. Raw meat and fish remain hunting/fishing rewards. Cooked food restores 40 dragon HP (fish: 45), capped at maximum health, and can revive a fallen Aurelius.

## Gathering and supplies

Healing herbs, mushrooms and bitterroot grow along early roads; sunblooms and bitterroot in the desert; marsh reeds and ghostcaps in the swamp; frostberries and snowbells in the winter; mineral deposits in the volcanic region. Roadside patches are non-solid, standable, clear of doors, and can be gathered from any side with A. Each gives two ingredients and regrows after twenty minutes. Stable patch IDs and cooldowns survive saves.

Golems drop mineral dust; shroom and mine enemies provide supplementary ingredients. Powerful supernatural enemies and occasional ordinary kills drop spirit essence. Gold-bearing chests include small ingredient bundles. Haunted and empty chests retain their original behavior. Merchants have an Ingredients page; later-region stock unlocks with the journey. Spirit essence cannot be purchased.

## Minigame and saves

Prepare with a timed tap, hold/release to control heat for six seconds, then finish with a timed tap. Completing any batch always creates the requested items. Good timing awards one additional item per batch. The untimed Steady mode has the same rewards. Craft up to five at once.

The world pauses while the book is open. Hidden tabs pause the minigame; lost focus releases held heat input. Ingredients are reserved and saved when a batch begins. Closing or cancelling refunds them once. Loading an interrupted batch refunds its canonical recipe costs after loading the base inventory. Finishing grants the result and clears the pending batch together before saving. New games and other save slots have independent crafting state.

## Assets and verification

`assets/crafting/ingredients.webp` is a generated ten-cell ingredient sheet (5×2), decoded lazily and never awaited during boot. The animated workbench is drawn with Canvas. The church portrait fix uses a separate lazy 6×3 atlas with all eighteen speakers; its cast manifest is under `assets/portraits`.

`tests/crafting.mjs` checks all recipes, controls, ordinary/bonus output, inventory deductions, cancellations, actual save/load, migration, teachers, stock, food, drops and gathering cooldowns. `tests/crafting-world.mjs` runs inside the existing full-world pyramid audit to verify every gatherable material has walkable patches without generating the world twice.
