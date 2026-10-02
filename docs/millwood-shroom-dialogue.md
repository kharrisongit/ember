# Millwood and the mushroom folk — dialogue rewrite

The active conversation source for these areas is `js/millwood-shroom-dialogue.js`.
It owns introductions, return greetings, topic openings, every selectable Corin
reply and its matching answer, and the conversation profiles. Other regions
continue using the existing generated dialogue sheets.

The 22 active speakers are Hettie, Gwil, Odo, Elder Maddock, Nan Ferrow, Edwin,
Winnie, Ned, Joss, Tam, Tilda, Emmet, Lark, Hal, Tolan, Pip, Mycella, Bolete,
Truffle, the Shroom King, Cap and Ilsa. Chanter and Morel remain retired. The
royal procession's non-interactive actors and its scripted scenes are unchanged.

Each optional exchange contains an NPC opening and two or three complete
reply/answer pairs. Inline branch records keep the selected answer attached to
its topic; there is no unrelated shared continuation. A second Hello option is
unnecessary after the introduction and is omitted for this cast.

Introductions distinguish an ordinary meeting, seeing the dragon, hearing about
an absent dragon from Corin, meeting that dragon after hearing about him, and a
return visit. Knowledge is stored in the existing saved `discussedTopics` set
with a namespaced key. Maddock remembers witnessing the hatching. Nan's first
reaction remains part of her required farewell. The dragon's name and telepathy
are discussed only after his own introduction.

Quest conditions preserve Nan's early story gate, compass and elixir rewards,
Odo's referral and Calder's existing rod reward, and the Shroom King's one-time
spore gift. Maddock's optional history waits for the initial Wingfall account;
his route advice follows the player's collected Heartstones. Spore instructions
match the actual equipped effect: one heart restored to Corin per defeated enemy.
Profiles use the same current topics instead of advertising retired dialogue.

## Verification

Passed:

- `node tools/check-game-scripts.mjs` — all 84 loaded scripts, including shared scope.
- `node tests/millwood-shroom-dialogue.mjs` — all 22 active local speakers,
  241 topic/state exchanges and 619 actual UI reply selections, plus presence,
  meeting memory, story knowledge, destinations and reward conditions.
- `node tests/conversation-flow.mjs` — shared UI, scrolling/input, branching,
  Back/Goodbye, gifts, shopping, area teardown and the unchanged dragon flow.
- `node tests/story-dialogue.mjs`
- `node tests/temple-compass.mjs`
- `node tests/fishing.mjs`

Two broad audits already fail on the original `f22002d` commit. The failures were
reproduced on that baseline as well as this change: `conversation-branches.mjs`
reports a missing answer in Dunstan's glass-shop referral and missing branch
records for two tavern Halvard topics; `npc-world-talks.mjs` stops at the missing
Scholar Ilyan profile. Those speakers belong to later regional passes. The
broader tests now recognise the regional inline choices and the separate local
coverage, without removing or suppressing their existing failures.
