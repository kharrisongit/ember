# Opening history

New Game plays 26 illustrated shots before the existing fade into Corin's bedroom
and `startMorning()`. Continue and Load Save bypass the prologue. Only explicit
New Game actions pass `{newGame:true}` to `BOOT.close()`. No quest or save flag
is changed.

The directed cut has 135.1 seconds of picture holds, plus approximately 19
seconds of transitions: about 2 minutes 35 seconds. Peaceful town shots form
one narrated passage about coexistence and safe roads, with no visible town-name
titles. Longer holds and 0.5–0.95 second fades let the dramatic beats settle.

| Sequence | Picture holds | Direction |
| --- | --- | --- |
| Peaceful towns | 3.8 seconds each | Connected narration, alternating lateral moves, rises and pullbacks |
| Riders, Halvard and Wingfall | 5.8–9.3 seconds each | Face push-ins, opposing battle sweeps, a descent toward fleeing villagers |
| Monsters | 3.6–4.1 seconds each | Threatening approaches, dark dissolves and slow wipes |
| Aftermath and Corin | 7.8–8.8 seconds each | Pull back from the ruined rider halls, then approach Corin's lit window |

Each shot defines image focal coordinates and zoom keyframes in
`js/prologue-chapters.js`. The player remains immersed in full-screen art on
portrait and landscape displays. The camera clamps to image edges to prevent
uncovered areas, and recomputes framing after rotation without restarting its
elapsed time. Transitions include unhurried dissolves, dark approaches,
sliding curtains, restrained warm battle impacts and longer fades to black.

War scenes have two drifting smoke layers. They animate only transform and
opacity; there are no particles, filters, canvas effects or extra animation
loops. Effects pause with playback and are canceled when a shot ends. The
existing world loop remains suspended throughout the intro. Reduced-motion
mode uses static framing, short dissolves and no smoke or impact effects.

Controls are hidden by default. A tap reveals them for 1.2 seconds and never
also advances the story. Back/Left Arrow revisits a shot; Next/A/Space/Enter/
Right Arrow advances. Pause/P holds the camera and reading timer. Skip intro/
B/Escape ends with a short fade. Keyboard use keeps controls visible and traps
Tab within the dialog until a pointer interaction. Switching tabs pauses
playback. Captions remain readable when paused.

The existing title theme continues underneath the prologue, respecting audio
settings. BOOT then fades it out and fades into the bedroom's area music. The
prologue's DOM, timers, animations and temporary listeners are removed after
completion or Skip.

## Artwork and exclusions

The illustrations interpret the current game atlas and realm map. They preserve
recognizable town buildings, terrain and creature designs. Millwood's cows and
hens have been separated and corrected, and the hunted dragon now has a complete
body. Additional glimpses include the mine shrooms, all four golem designs,
three variants of each road-monster family, tomb guardians, the Spider Queen,
Frosthorn, Ice Moth and the fiends.

Ghosts, wraiths and the Lich family are deliberately excluded at the user's
request. The Spider Queen keeps her crown, silver hair and spider body but uses
grounded adult facial features and clothing rather than anime proportions.
`assets/prologue/monster-coverage.json` records included designs and exclusions.

Halvard consistently has short, dark wavy hair, an emerald cloak and a blue
dragon. The opening and battle shots were rebuilt with separated silhouettes
and simpler angles to make dragon anatomy readable.

Source references include the existing realm map, building atlas, live enemy
sprites, golem palette derivation and boss sprite sheets. Reference sheets are
under `assets/prologue/references/`. Generation and correction prompts are saved
in `generation-prompts.json`, `expansion-prompts.json`, `roster-prompts.json`
and `continuity-prompts.json`.
These historical illustrations are recognizable interpretations, not new map
geometry. Original generated output files remain unchanged.

Images load only when New Game selects the intro. The player retains the current
and next illustration, not the entire decoded gallery. Missing or slow images
fall back to the dark stage while captions and Skip remain usable.

## Story sources

- `js/dragon-dialogue.js`: seven Riders, Halvard's betrayal fifty years ago,
  freely chosen bonds and suppressed histories.
- `js/generated/game-part-2.js`: Halvard's throne, dangerous roads, prevention of
  new Riders, the bestiary and its regional creatures.
- `js/dragon-chapels.js`: the ban on public dragon worship.
- `js/millwood-shroom-dialogue.js`: no dragons seen openly, surviving memories.
- The user's expansion: plentiful dragons living peacefully with people,
  Halvard's ambition and organized dragon hunts.

The intro does not name the other Riders, specify individual deaths, reveal
Corin's egg encounter, or show later combat outcomes. `index.html` loads the
maintained split runtime; BOOT integration is in `js/generated/game-part-3.js`.
