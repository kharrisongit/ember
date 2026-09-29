# Conversation rewrite — 29 September 2026

The optional conversation rewrite is implemented, including all standard cast members, Aurelius, Nan's extended memories, royal audience topics, and the temporary royal-visit conversations.

## Authored paths

- 949 catalogued topics, with 1,018 explicitly written decision records and 2,320 Corin/NPC reply pairs. Every optional reply point offers three choices: a reviewed original plus two authored alternatives, or three authored questions following a political opening.
- Removed keyword-selected reply pools, generic moral responses, generic fallback topics, and the unrelated first-story reply injection. The old `npc-replies` script is no longer loaded.
- Each alternative is attached to a particular topic and decision. Dynamic Aurelius equipment and quest discussions use explicit state keys or exact decision text.
- An alternative replaces its immediate answer block and preserves later conversation turns. The topic selection itself starts the exchange; opening questions are not redundantly offered again as response menus.
- Corin's spoken choice automatically advances to the NPC answer. The final NPC answer remains until the player presses Next.

`assets/dialogue/branches/` contains the ten authored sheets. `docs/dialogue-coverage.json` lists every decision and its source. These are explicit dialogue records, not generated prose.

## Content review

The standard story, extra-topic and political corpus was read and its alternative paths rewritten. Coherent original exchanges remain. Corrections include Sverre following a fence to shelter during a blizzard, Wren explaining past remedy lessons and garden work without pointing at unseen bottles, Isolde's delivery history, mismatched glass and carpentry stories, unsafe or unexplained workshop details, Ovid's occupation, and unsupported claims about archives and evidence.

Objects that belong at home or in past events are described that way. The writing does not require a new bottle, rug, tool rack, crab, or other prop to appear beside a portrait. Aurelius's memories, hatching account, regional recollections, victory responses, equipment knowledge, and side-quest replies were reviewed for state and continuity. Required quest/gift sequences retain their existing callbacks and progress gates.

## UI

Chat is a plain rounded control with a slow border pulse while available. Nameplates use a flat translucent surface, clear serif text and one fine rule. The 28-pixel Profile control uses a short label and retains its full accessible name. Regional game-panel artwork, speaker lighting, dimming, slower animation rate and Aurelius's stars remain.

## Verification

- Coverage test: 1,051 distinct topic/state variants and 1,136 reply points, including pre/post victory, royal stages 1/5/7, equipment combinations and extended conversations. All have three distinct authored choices and following NPC answers; authored sheets match shipped data.
- Playback test: actually selects an authored alternative for all 143 standard NPC names, checks the resulting answer, then follows Aurelius through an early alternative and all three subsequent decision points. It also checks automatic Corin advancement, final-Next reading time, Back, gifts, shopping and teardown.
- NPC, world-talk, Aurelius, story, conversation-view and Thornwell royal progression suites pass. All 59 loaded scripts parse.
- Browser check: 390×844, 320×568, 844×390 and 1024×1366; long names, 28-pixel Profile, disabled/active Chat cues and reduced motion. Hettie, Sverre and Aurelius screenshots were inspected. No browser script errors were observed.

These checks cover dialogue data and routing broadly; they do not claim that every branch received a visual playthrough. The earlier audit below is retained as historical context.

---

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
