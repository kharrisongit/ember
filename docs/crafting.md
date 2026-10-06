# Fieldcraft

Open **Bag → Craft** in a safe place, while dismounted. Nan gives the first recipes during the morning introduction or her crafting lesson. Opening the book never grants recipes or supplies.

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

Use the portable camp kit beside a small campfire and grill: swipe to crush ingredients, stir in circles (or season food), then pour, finish or pack. Progress follows deliberate gestures, with no timer, failure or quality penalty. The action button and A are accessible alternatives. **Skip preparation** is available in every phase and instantly makes exactly the same quantity for the same ingredients, up to five.

The world pauses while the book is open. Preparation never advances or expires on its own. Ingredients are reserved and saved when a batch begins. Closing or cancelling refunds them once. Loading an interrupted batch refunds its canonical recipe costs after loading the base inventory. Finishing grants the result and clears the pending batch together before saving. New games and other save slots have independent crafting state.

## Assets and verification

`assets/crafting/ingredients.webp` is a generated ten-cell ingredient sheet (5×2), decoded lazily and never awaited during boot. `camp-kit.webp` and the transparent six-cell `camp-tools.webp` are generated 2D pixel art, loaded only when preparation opens. Canvas effects animate stirring, steam, embers and ingredient flecks at a capped 30fps on a small pixel grid. Reduced-motion disables ambient effects. The church portrait fix uses a separate lazy 6×3 atlas with all eighteen speakers; its cast manifest is under `assets/portraits`.

`tests/crafting.mjs` checks all recipes, hands-on phases and equivalent skip, exact output, inventory deductions, cancellations, actual save/load, migration, teachers, stock, food, drops and gathering cooldowns. `tests/crafting-world.mjs` runs inside the existing full-world pyramid audit to verify every gatherable material has walkable patches without generating the world twice.
