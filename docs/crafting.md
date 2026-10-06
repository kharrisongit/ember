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

Choose a quantity and slide the handle fully to the right. A 4.5-second preparation animation plays before the batch is awarded: stirring a cauldron for brews, grinding in a mortar for powders, chiseling a grave marker, hammering a bell stake, enchanting a resurrection stone, or cooking food over a grill. Partial drags reset on release; tapping the track or waiting never confirms a batch. Keyboard users adjust with arrow keys (or End) and confirm with Enter. There is no additional minigame or input after confirmation. A small progress bar tracks the full batch. Reduced motion holds the first illustrated frame for the same 4.5 seconds; switching tabs pauses preparation.

The top-right X closes crafting. The redundant status/footer and Return to game button are removed; finished batches retain their Back to recipes button. Closing an unfinished batch returns its reserved ingredients.

The world pauses while the book is open. Only a completed slide confirms the batch. Ingredients are reserved and saved when a batch begins. Closing or cancelling, including during preparation, refunds them once. Loading an interrupted batch refunds its canonical recipe costs after loading the base inventory. Finishing the animation grants the result and clears the pending batch together before saving. New games and other save slots have independent crafting state.

## Assets and verification

`assets/crafting/ingredients.webp` is a generated ten-cell ingredient sheet (5×2), decoded lazily and never awaited during boot. The confirmation uses the existing inventory item icon and a touch/keyboard slider. The animations use generated layers in `assets/crafting/animations/`. The updated 4×4 sheets have sixteen frames for liquid/fire, powder, unfinished-metal forging, meat cooking and fish cooking; adjacent liquid/fire/powder frames dissolve continuously using premultiplied alpha. Stirring follows a continuous elliptical path, and the pestle uses an eased lift and downstroke synchronized to the powder puff. Tools are isolated generated sprites, not redrawn shapes. The rough stone blank has an exposed chisel cap; the mallet's striking face is anchored to that cap, clear of the stone itself. Finished Grave Marker and Bell Stake art appears on the result screen.

| Recipe | Contents color |
| --- | --- |
| Potion | Ruby red |
| Elixir | Amber gold |
| Maelis’s Curse | Green |
| Saint’s Breath | Pale turquoise |
| Madness Dust | Violet |
| Consecration | Ivory |

The generated magenta ingredient pixels are recolored once per recipe and cached; the stone, wood, metal, fire and neutral steam keep their original colors. Sheets are shared across recipes and loaded only at confirmation. The 4.5-second crafting clock drives every frame and tool movement, so hiding the page pauses everything and reduced motion holds a still image. The existing nine-frame enchanting sheet remains in use. `manifest-v2.json`, `prompts-v2.json`, `sources-v2/` and `tools/pack-crafting-v2.py` preserve the revised source art and reproduce its atlases. The original assets and packaging files remain available for reference. The church portrait fix uses a separate lazy 6×3 atlas with all eighteen speakers; its cast manifest is under `assets/portraits`.

The six cooked foods have dedicated generated artwork in `assets/inventory/cooked-foods.webp` (3×2, 128px cells), shared by recipe cards, confirmations, results and the Bag. Raw ingredients keep their original icons. The full-resolution transparent source, exact built-in image-generation prompt, and cell manifest are alongside the runtime sheet. Only the small runtime sheet loads during gameplay startup.

`tests/crafting.mjs` checks all recipes, slide confirmation and cancelled gestures, exact output, inventory deductions, cancellations, actual save/load, migration, teachers, stock, food, drops and gathering cooldowns. `tests/crafting-world.mjs` runs inside the existing full-world pyramid audit to verify every gatherable material has walkable patches without generating the world twice.
