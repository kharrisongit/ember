# Thornwell rewrite and quest discovery — 2 October 2026

Thornwell now uses a separate, fully authored conversation set in `js/thornwell-dialogue-data.js`, routed by `js/thornwell-dialogue.js`. It covers 55 resident identities, including all 50 published local placements, and replaces their former topics, replies, greetings, profiles and relevant service dialogue. King Halvard and Serjeant Bram have 12 new audience topics in `js/thornwell-audience-dialogue.js`; the compulsory royal visit and Bramble reunion were also rewritten.

First meetings introduce Corin before residents address him by name. Saved flags distinguish meeting him, learning about his dragon, seeing the dragon, and a return visit. Thornwell keeps the dragon secret through the royal visit; after Forgefalls, greetings distinguish a nearby dragon from one Corin only mentions. The royal visitors can recognise Corin's earlier Millwood errand. Bramble hints identify Rowan and the Copper Cup, and disappear after the reunion.

Each resident has five permanent friendship topics with three authored reply paths apiece. Companion and later-return topics stay gated until their story conditions are met; practical leads are excluded from the friendship total so a completed or missed service cannot block the reward. The friendship overview explains story and return-visit requirements. Ilyan's expedition uses the full conversation panel, accepts only the explicit acceptance reply, and does not disclose the hidden dragon.

New quest discovery produces a small passive notice, including during conversations: quest title plus “View in Map → Quest List”. It holds for about four seconds, then fades; there is no dismissal button and it never captures taps or focus. Simultaneous discoveries are grouped. Saved discovery state prevents repeated announcements, and older saves establish a baseline instead of replaying existing quests. Quest topics use a gold surface plus a written “New quest” or “Quest lead” label.

Verification:

- Thornwell: 55 authored residents, 560 topic/state exchanges and 1,716 actual reply selections, covering stranger introductions, saved meetings, dragon secrecy/presence, Bramble guidance, royal answers and one-time friendship rewards.
- Royal story: all 36 optional reply paths, the published movement route, save/load, departure, separation and Forgefalls reunion.
- Ilyan: refusal, reconsideration and acceptance; expedition persistence, rewards and existing world mechanics.
- Quest notices: appearance over dialogue, automatic fade, grouping, save migration, no reload/stage duplicates, and labels following actual quest state.
- Script validation: all 91 loaded scripts parse individually and in their shared scope. Existing Bramble, Thornwell follow-up, conversation flow, friendship, Millwood/Shroom and quest-journal suites also passed during integration.
- Browser: the gold topic and passive notice were checked in the actual conversation panel; a reply remains usable while the notice is visible. Portrait phone, landscape phone and desktop layouts were checked without script errors.

Earlier audits below describe the historical implementation, not the current Thornwell or Millwood/Shroom dialogue.

---

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
