# Dialogue revision — 27 September 2026

Normal progression is the baseline: Corin can talk around Millwood before hatching; he reaches the wider world with Aurelius. Skip is a development shortcut. Indoor speakers can know about the dragon without seeing him in the room.

## New conversations

- 142 individually written Halvard opinions, each with a separate aftermath response. This includes the active villagers and the authored/editor cast. Halvard retains his existing confrontation and personal topics rather than discussing himself as a villager.
- 31 local-history exchanges: farming, roads, the schools and records, smithing, glass, mines, winter customs, caravans, cisterns, the coast, marsh, forest rings and temples.
- Authored source is `assets/dialogue/npc-world-talks.json`. Run `node tools/build-npc-world-talks.mjs` after changing it. The generated script loads before the conversation menu.

## Routing and continuity corrections

- Removed the generic “Another thing I meant to ask” entry. Its legacy follow-ups included dangling answers and lines describing a physically present dragon. Complete named stories now carry optional conversations.
- Removed the generic victory entry which could repeat Hello. The dedicated political topic has its own aftermath response.
- Removed the second generic rumour branch from greeting selection; several lines were actually sightings. Kept independent rumours and the dragon-presence test.
- Corrected Truffle's injured-dragon-in-a-field origin, including its victory callback, to agree with the Millwood hatching.
- Made Pip, Mycella, Bevan and Marek's greetings understandable without requiring a previous line; corrected outdoor Orin/Hask exchanges that described an indoor doorway.
- Preserved the lost-dog hint where one exists, while allowing other villagers to use their current contextual greeting rather than falling back to old base text.
- First charm gifts take priority over generic greetings, dog hints and victory responses. Wren, Rashida and the Shroom King describe their actual rewards; subsequent greetings stop offering them again. Dunstan no longer asks a geared player to fetch a sword.
- Mira, Oren and Tamsin acknowledge owned rewards. Brin acknowledges all three acquired temple stones. The lantern is carried, not equipped; the book needs no charm slot.
- Roadworkers' greetings and work topics acknowledge opened routes.
- Aurelius no longer recalls an unplayed argument “yesterday,” assigns the lantern lead specifically to Mira, or keeps speaking about coming home safely as an unfulfilled goal after victory.

## Verification

`tests/npc-world-talks.mjs` loads the actual game and prepares map identities, covering 133 speaking names in those maps plus the authored roadworkers. It checks individual opinions, pre/post-victory branches, menu callbacks, distinct greetings, original/new data agreement, normal story gates, first/owned gifts, completed hints and reopened roads. Exact text uniqueness is checked for the new NPC opinions and history answers.

Existing NPC conversation, dragon dialogue, story dialogue, father/compass and script checks also pass. The new world-dialogue test is included in GitHub's validation workflow. These are state and dialogue checks, not a substitute for a full visual playthrough.
