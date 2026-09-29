# Conversation rewrite plan

Prepared 28 September 2026 (America/Detroit). This is the plan for the next dedicated rewrite turn. No dialogue content or dialogue-routing code is changed by this update.

## Goal and scope

Audit the optional conversation paths across the whole cast, including Aurelius. Rewrite the weak material as complete exchanges: topic prompt, NPC opening, every Corin choice, the answer to each choice, and any continuation. A sensible opening does not rescue unrelated alternatives. Preserve good existing writing only after reviewing all of its paths.

The two UI changes ship separately now: Chat sparkles and briefly shakes while available on the greeting screen; View Character Profile is smaller and visually quieter. The invitation stops when Chat is disabled. Reduced-motion mode uses a steady sparkle instead of movement.

## What the planning inspection established

These figures are a baseline from the maintained game scripts, using the same enumeration as the current branch test. They are not a claim that every conversation has received a literary or visual review.

| Material | Current inventory |
| --- | --- |
| Personal stories | 264 topics across 132 named characters |
| Extra topics | 286 topics across 143 characters |
| World/political data | 142 characters; 31 local-history exchanges; political opinions have pre/post-victory variants |
| Character-specific alternate reply pairs | 143, normally attached to a character's first story |
| Conversation greetings | 144, including Aurelius |
| Enumerated optional topics at the inspected state | 751 |
| Reply points in those topics | 817 |
| Monologues automatically given a reply and ending | 142 |

This snapshot uses the prepared base maps and an advanced quest state. The final audit must enumerate published placements, renamed/placed characters, special audiences, quests, gifts, and other reachable state variants as well. These numbers are a starting inventory, not a completion target that excuses missing paths.

### Confirmed examples and causes

1. **Sverre, “Your first blizzard.”** The opening says he tied himself to a fence post overnight; the ending says he now builds them closer together. It does not establish how that solved shelter or exposure. Worse, the displayed third choice is “I think being able to disagree matters too.” The keyword matcher sees “together” in the ending and treats it as a conversation about companionship. Review the whole anecdote and all three responses together.
2. **Wren, “King Halvard.”** She discusses treating the king's injured men. The automatic Corin line is “I would like to notice more along the way,” followed by a generic answer about journeys. `prepare()` creates a reply without the topic title; “home” in the preceding line can select the travel category. The normal choice builder subsequently knows the political title, so the menu mixes an unrelated default with political alternatives.
3. **Wren and the reported bottles/jars.** Wren is a likely Thornwell candidate: her stories discuss remedy jars and labels, and “The stubborn plant” points to “that little cutting.” Isolde and Eira also have bottle-related stories. The exact NPC in the user's report has not been identified visually. Inspect the current published scene before deciding which present-tense object claims are supportable. A remembered jar is different from a jar the speaker claims is on the counter now.
4. **Repeated generic responses.** In this snapshot, “I had not thought about it from your side” is offered at 172 reply points, with the same NPC answer. “What if speaking up makes things worse?” appears at 160. This is a systemic authorship problem, not a handful of typos.
5. **Source drift.** Isolde's second story differs between `assets/dialogue/npc-stories.tsv` and the shipped `NPC_STORIES` in `js/npc-conversations.js`: the TSV still describes moving a cart and losing a shelf; the runtime describes deliveries and a basket. Editing the wrong copy can fail to change the game or restore outdated details.
6. **The tests currently prove structure, not sense.** `tests/conversation-branches.mjs` counts distinct nonempty choices and excludes a few topic-switching phrases. It can pass all of the examples above. Text uniqueness also does not prove logic, voice, or a visible-world match.

The exact wording “I'd like to be more patient” was not located in the currently maintained conversation files during this inspection. Do not claim that exact line has been identified or fixed. The unrelated generated alternatives above are independently reproducible and must be eliminated.

## Writing rules for the rewrite

- Every response must answer, question, challenge, or react to a specific thing just said. Read the full path aloud in order; no isolated-line approval.
- Corin should sound like a curious young person from Millwood. Use concrete questions and natural reactions. Avoid stock self-improvement declarations and abstract speeches unless the situation genuinely earns them.
- Give NPCs distinct concerns, knowledge, temperaments, and vocabulary. They should not all become reassuring mentors or deliver a proverb after every exchange. Humor is welcome when its setup and consequence make sense.
- Check cause and effect: what happened, why the character acted, what the action accomplished, and what the listener can reasonably understand. Do not preserve a punchline at the expense of the story's logic.
- Give each decision three meaningfully different, specifically authored choices and a matching answer for each. Different wording for the same sentiment is not meaningful branching. Alternatives stay on the current subject; unrelated topics belong in the topic list.
- Present-scene references such as “this bottle,” “that cutting,” “these tools,” “the shelf beside me,” and pointing out weather or actions require evidence in the current playable scene. Check portraits as well when clothing or held objects are mentioned.
- Off-screen life and memories are allowed, but must be clearly framed as elsewhere or in the past. Do not imply a prop, person, event, or action is visible now when it is not. Rewrite unsupported references instead of adding scenery merely to justify them.
- Corin and each NPC can know only what their history and the current quest state support. Distinguish seeing Aurelius, hearing about him, and knowing he is waiting outside. Avoid invented shared events or callbacks to something the player never experienced.
- Do not imply new rewards, usable items, errands, locations, relationship changes, or player actions unless the game implements them. Keep existing genuine rewards and progression intact.

## Execution order for the dedicated rewrite turn

### 1. Establish the actual cast and world evidence

Load the current published game and `assets/editor-layouts.json`, prepare map identities, then collect reachable speaking actors. Reconcile aliases, placed NPCs, indoor/outdoor duplicates, retired/deleted actors, and portrait identities. Start with Sverre in Hollybeck and Wren/the bottle candidates in Thornwell and Forgewick.

For each speaker, record: stable actor identity, displayed name, location, role, relevant relationships, visible nearby props, visible/known companion state, and implemented rewards or quest connections. Capture representative in-world views where a line depends on scenery. Do not infer visibility from `loc`, a biography, a sprite name, or a source-map coordinate alone.

Create a coverage ledger by actor, stable topic ID, decision point, and state variant. Track **unreviewed / rewrite needed / rewritten / fully reviewed / played** and the evidence for scene-dependent lines. Every retained path still needs a reviewed status.

### 2. Make the authored material authoritative

Reconcile the story TSV/runtime discrepancy using the currently shipped dialogue as the migration baseline, then maintain one editable source and a repeatable build path. Keep dialogue data separate from hand-written quest, gift, and menu callbacks. Maintain source/generated consistency checks so a later build cannot quietly bring back old text.

Relevant source map:

| Area | Files to inspect/edit during the rewrite |
| --- | --- |
| Personal stories and topic assembly | `assets/dialogue/npc-stories.tsv`, `js/npc-conversations.js` |
| Extra topics | `assets/dialogue/npc-extra-topics.json`, `tools/build-npc-extra-topics.mjs`, `tools/npc-extra-runtime.txt`, generated `js/npc-extra-topics.js` |
| World opinions, histories, greetings and reward context | `assets/dialogue/npc-world-talks.json`, `tools/build-npc-world-talks.mjs`, generated `js/npc-world-talks.js` |
| Greetings and Corin's greeting replies | `assets/dialogue/npc-greetings.tsv`, `tools/build-npc-greetings.mjs`, `js/npc-greetings.js` |
| Existing per-character alternate replies | `assets/dialogue/npc-replies.tsv`, `tools/build-npc-replies.mjs`, `js/npc-replies.js` |
| Generic branching and playback | `js/conversation-branches.js`, `js/conversation-flow.js` |
| Aurelius | `js/dragon-dialogue.js`, Aurelius additions in `tools/npc-extra-runtime.txt` |
| Identity, staging and special dialogue | `js/dialogue-portraits.js`, `js/hollybeck-villagers.js`, `js/thornwell-royal.js`, `js/story-dialogue.js`, published placements and relevant quest scripts |

### 3. Replace guessed alternatives with authored branches

Use explicit choice records keyed by stable topic/decision identity, including state-specific variants where needed. Scope each response to the exact exchange; never select one merely because a word such as “together,” “home,” “learn,” or “water” occurs nearby. The runtime should render authored choices, not invent their meaning.

Remove broad keyword pools, generic fallback endings, and automatic moral-lesson replies from the shipped optional conversations. Author responses for political monologues too. An uncovered branch must fail development validation rather than silently acquire filler. Identify the intended continuation or end of every alternate so selecting it does not accidentally truncate later relevant dialogue.

Keep the existing safe behavior: Corin's selected reply leads automatically to the NPC's answer; the final answer waits for Next; gifts, callbacks, mandatory audiences, Back/Goodbye, and return-to-greeting behavior remain correct.

### 4. Rewrite and review in regional passes

Prioritize **Hollybeck and Thornwell**, where the user found problems. Then cover Millwood, Forgewick, Sandspire, Coralmere, Witchmoor/Dreadmarsh, Shroom Pass/Sporehollow, and the remaining road, temple and Cinderhold cast. Review Aurelius and the royal exchanges as distinct voices with their own continuity pass.

For each NPC, finish a coherent set before moving on: greeting and Corin's greeting, personal/extra stories, all three choices at every decision, all NPC answers, politics/history, and relevant state changes. Review the actual displayed opening prompt as well; mechanically generated “Tell me about…” prompts can be awkward even if the stored topic is sound.

Review relationships and facts across NPCs after each region, then across the world. Track jobs, kinship, item ownership, travel directions, hatching history, and Halvard's defeat so one character does not contradict another. Vary tone and subject matter deliberately; do not mass-replace one set of templates with another.

### 5. Verify logic, state and presentation separately

**Editorial review:** read every reachable branch as a complete transcript. Check the subject of each answer, pronouns, timing, physical plausibility, visible claims, voice, repeated morals/jokes, and whether the choice changes the response meaningfully. A text-length or uniqueness check cannot substitute for this review.

**Automated coverage and safety:** enumerate reachable actor/topic/state/decision combinations, require three distinct authored choices, flag missing or dangling branch IDs, reject generic fallback use, verify source/generated agreement, and compare repeated response pairs. Run the relevant existing conversation, world-talk, story, dragon, gift and royal-audience tests. Preserve actual quest/reward assertions when adapting tests to new data.

**State matrix:** check early Millwood before hatching versus later travel; Aurelius beside the speaker versus absent/outside; first gift versus already owned; incomplete versus completed leads/roadwork; the relevant royal audience stages; and before versus after Halvard's defeat. Use reachable game states, not only an all-quests-complete shortcut.

**In-game review:** play representative rewritten paths in every region, all reported failure cases, each unique branch/state mechanism, and conversations dependent on visible scenery. Select each choice in those cases. Check phone readability, long replies, speaker identity, automatic exchanges, and the final Next pause.

## Completion standard and report back

The rewrite is ready when every inventoried path has been reviewed, missing-branch/fallback coverage is zero, scene-dependent claims have evidence or have been rewritten, and the relevant tests and playthroughs pass. Report reviewed and rewritten counts separately, identify any genuinely unreachable/retired content, and disclose any unresolved case rather than calling it audited.

Deliver the revised authored data, its generated runtime files, the coverage ledger, targeted regression checks, and an updated audit report. Publish only after those checks. This planning turn deliberately makes no dialogue-writing changes.
