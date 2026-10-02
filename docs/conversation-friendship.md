# Conversations and friendship

The conversation panel keeps the NPC’s final answer until a new topic starts.
Corin’s idle bubble contains **Press To Chat**. Profile is at the bottom left,
Back / Goodbye and Next are centered, and the friendship meter is on the right.
Typing follows the bottom of the active speech scroller; completed text can be
scrolled back without the next frame pulling it down again.

The first full conversation opens a tutorial. It is saved per game slot when
dismissed and can be reopened from the full-screen friendship overview. The
world greeting and small Talk / Purchase invitation do not trigger it. Help
owns keyboard, controller and touch input while open and pauses typed text and
automatic replies.

## Progress and rewards

Each completed, distinct topic earns one unit toward that character’s total.
Selecting a topic, abandoning a reply, repeating a conversation or choosing a
different branch gives no additional credit. Shopping, repeatable supplies and
changing route reminders are excluded. Political and roadwork variants share
stable identities, so a story transition does not erase earlier credit.

The catalogue includes future conversations. The overview reports completed,
available and story-locked totals without exposing locked titles. The bar is
completed / total; levels run from 1 to 5, with level 5 reserved for 100%.
Completing the catalogue grants **50 gold and one Potion**, once per character.
The claimed flag, progress and inventory are saved together. Older saves import
their existing Discussed markers; they receive the tutorial on their next full
conversation.

`conversation-friendship.js` owns the catalogue and save data. A topic can supply
`friendshipId` when its wording changes and `friendship: false` for a service.
`conversation-flow.js` credits completion only after the final line actually
advances. The UI and future-town work use these same catalogue records.

## Millwood additions

`millwood-friendship-topics.js` adds three topics for each of the 15 Millwood
speakers (45 topics; 135 authored reply/answer pairs). Each character has two
new early topics and one later conversation. Odo’s later conversation opens
with the fishing rod, Tolan’s after Halvard’s defeat, and the other 13 after the
Lightning Heartstone. The existing Shroom rewrite is retained.

Validation: the conversation flow/view tests, the complete Millwood/Shroom
branch traversal, and `tests/conversation-friendship.mjs` cover completion,
replays, aborted exchanges, story gates, rewards, saved data, tutorial input,
retained answers and automatic text scrolling.
