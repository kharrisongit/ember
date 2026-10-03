# Opening history

New Game plays five illustrated chapters before the existing fade into Corin's
bedroom and `startMorning()`. Continue and Load Save bypass the prologue through
the default `BOOT.close()` path. Only the explicit New Game actions pass
`{newGame:true}`. No quest or save flag is changed by the prologue.

The sequence lasts approximately 81 seconds plus transitions. Next (or A,
Space, Enter, Right Arrow) advances; Pause/P stops the reading timer and camera
movement; Skip intro/B/Escape finishes immediately with a short fade. Switching
tabs pauses the timer. Reduced-motion mode removes the image zoom. Text can
scroll inside the caption area on very short screens; the browser page cannot
grow. Small landscape phones use an image/text split.

The existing title theme continues underneath the prologue, respecting the
current audio settings. The existing boot transition then fades it out and
fades in the bedroom's area music. World rendering and simulation are suspended
while the prologue is visible. Its DOM, timers, animation objects and temporary
input listeners are removed on completion, including Skip.

Images load only when New Game selects this sequence. A missing or slow image
does not disable Skip, and eventually falls back to a dark background while the
caption still presents the chapter. The five optimized WebP illustrations live
in `assets/prologue/`; the built-in image-generation prompts are saved there in
`generation-prompts.json`. Original generated artwork is unchanged.

## Canon used

- `js/dragon-dialogue.js`, Wingfall/bond/history topics: seven riders, Halvard's
  betrayal fifty years ago, freely chosen bonds, suppressed historical accounts.
- `js/generated/game-part-2.js` and `js/game.js`, Maddock's history and hatching:
  Halvard seized the throne; monsters spread onto the roads; he prevents new
  riders. His betrayal is named Wingfall.
- `js/dragon-chapels.js`: Halvard bans public dragon worship.
- `js/millwood-shroom-dialogue.js`: no dragons seen openly, dangerous roads,
  surviving memories of the riders.

The pictures interpret these events without naming the other riders, asserting
their individual fates, or revealing Corin's egg encounter. King Halvard's
throne illustration uses his existing portrait as its character reference.

`index.html` loads the maintained split runtime. The BOOT integration is in
`js/generated/game-part-3.js`; the unused monolithic `js/game.js` is not served.
