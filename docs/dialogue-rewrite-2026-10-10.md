# Dialogue rewrite — 10 October 2026

The current conversation catalogue is authored in `assets/dialogue/renewal/*.txt` and generated into `js/dialogue-renewal-data.js` with `node tools/build-dialogue-renewal.mjs`.

## Writing coverage

- 174 character profiles, 550 new optional topics, and 1,650 complete reply branches.
- All six greeting fields rewritten for every profile.
- No topic title or NPC opening from the previous catalogue reused.
- New short conversations for all 18 chapel residents.
- New prologue, Millwood story scenes, hatch, farewell, first telepathy, Rowan reunion, royal audience, Forgefalls reunion, and final confrontation.
- New quest leads, gifts, fishing and equipment exchanges, recipes, winter rescue, chapel blessing, trials, and combat tutorial speech. Required locations, quantities and controls remain explicit.
- New travel, combat, character reaction and doorway banter for Aurelius. Ambient captions remain at most 64 characters per line.

Characters discuss different personal experiences and interests. Jokes arise from their circumstances, and quieter replies give Corin room to listen. Practical conversations retain their gameplay purpose.

## Acquaintance and continuity

Millwood residents know Corin. The other 158 profiles require an introduction, including when the first meeting occurs after victory or with the dragon present. Hearing about a rider does not set a personal acquaintance flag.

Returning with a dragon can produce a new reaction without reintroducing Corin. Meeting flags survive saves. Rowan no longer calls Corin by name from across the tavern before their first meeting. Rowan's reunion and Mosslet's clue record the introduction when the scene finishes. The Shroom King's compulsory gift introduces Corin and records the completed meeting.

New optional stories use `renewal-v2-*` friendship IDs so completed old topics do not pre-complete new writing. Existing once-only friendship reward flags are retained. Quest IDs, royal answer keys, item rewards and scene choreography are unchanged.

The canonical router takes precedence over earlier regional catalogues for all published residents. Those older files remain for compatibility; they are not the source of the current optional conversations.

## Verification

- Source/runtime parity and all 123 loaded scripts parse.
- All 1,650 reply branches played through the real conversation flow.
- Every published speaking actor resolves to the new catalogue or chapel exception.
- Dedicated introduction regression covers all 158 strangers before/after victory, with/without the dragon, return visits, saved state, scripted introductions and old topic completion migration.
- Gift, referral, crafting, Shroom clue, royal choice, pyramid acceptance, reunion, story choreography, Nan cooldown, riding lesson, spider encounter and throne retry regressions checked.
- Chromium at an 844 × 390 touch viewport: crafting lesson, recipe book, reopened conversation, reply selection, naturally timed NPC response and return to the conversation menu. No page errors. Screens inspected for readable dialogue and correct speaker placement.

Changed runtime scripts receive a new cache version in `index.html`.
