# Journey and quest progression audit — 2026-10-05

Scope: authored opening, main story, journal quests, optional reward activities,
NPC gift leads, route prerequisites, compass map connections, and saved progress.
This is a source/state audit with published-world integration tests, not a claim
that every encounter has been manually played on every phone.

| Activity | Lead and route | Completion |
|---|---|---|
| Morning errand | Bedroom supplies → Nan → Hettie → coop → Maddock | Egg delivery and northern crash sequence |
| Dragon hatching | Crash egg → Maddock → Aurelius introduction | Dragon hatches; normal Odo conversations unlock |
| Fishing | Odo → Calder at the first Millwood–Thornwell camp | Receive rod; Calder explains fishing and Forgefalls |
| Bramble | Town NPCs → Rowan in Copper Cup | Reunion/departure, followed by royal summons |
| Thornwell royal visit | King and knights → leave tavern → wait for party → Forgefalls bridge | Reunite with Aurelius |
| Forgewick | Forgefalls/eastern road → town → Dunstan and temple | Upgraded equipment, Whetstone, guardian golems, Lightning Heartstone |
| Sandspire | Desert road past Oasis → town → Sela and temple trail | Glass Shield lead; temple golems then Ice Heartstone |
| Hollybeck | Sandspire → Coralmere → wetlands → winter town → temple | Temple golems then Shadow Heartstone |
| Mountain crossing | Aurelius briefing → north to Frostcrag → passage halls → eastern exit | Arrive in Ashcrag |
| Final story | Volcanic road → Cinderhold → castle/throne room | Defeat Halvard |
| Secret church | Edrin’s lead → southern desert detour → church | Discovery; separate follow-up to Cael for Sky Blessing |
| Pyramid | Scholar Ilyan or desert expedition lead → western desert detour → pyramid depths | Defeat guardian and open chest at actual death position |
| Frosthorn | Sverre → northwestern winter trail | Defeat Frosthorn AND collect Frostheart chest |
| Missing supply party | Astrid → western winter trail → glade → clearing beyond | Defeat threat and reassure Olin or Signe; Astrid never names the moth |
| Soulwing | Actual Ice Moth victory | Open death-position chest; separate from traveler rescue |
| Graveyard | Oren’s lead → northwest of Hollybeck | Finish ALL ghost waves; receive Book of the Dead |
| Deep mines | Toft or mine darkness → lantern lead → Sverre in Hollybeck → return to Forgewick mine | Clear deepest chamber; automatic treasure reward |
| Other NPC gifts | Only heard leads become journal entries; direct gifts remain direct interactions | Receive offered charm; existing NPC instructions explain use |
| Postgame trials | Ending unlocks lead → mainland ferry to Witchmoor → keeper → Cinderhold seal chamber → throne room | Place seal, accept challenge, finish summoned waves |

Fixes from this review:
- Reward chest targets use saved death positions, including reloads.
- Frosthorn remains active until its chest is collected; old unclaimed victories recover a chest.
- Separate Sky Blessing and Soulwing follow-ups prevent rewards being silently skipped.
- Graveyard, fishing, smith, shield, mines, and trials have specific steps.
- Seal target uses `royal_seal`, not `cinderhold`.
- Mountain routing stays inside the passage until the eastern exit.
- Aurelius's current objective matches the journal's next action.
- Distant optional leads explain road prerequisites; locked saved selections fall back to the main story.
- Toft provides a grounded mine/lantern lead. A player who has not heard it first asks him rather than magically knowing Sverre.
- Existing Tobin dialogue and the Ice Moth surprise are preserved.

Verification: `journey-audit.mjs` exercises actual prepared/published maps, opening
and royal states, all active destinations, gift leads, mine stages, blessing,
three death-position rewards and restoration, rescue handoff, all mountain
branches, seal stages, locks, and journal history. Existing temple, conversation,
quest, compass, boss reward, and progression-gate tests cover their respective
mechanics. No new mandatory fetch quest was added to direct gift conversations.
