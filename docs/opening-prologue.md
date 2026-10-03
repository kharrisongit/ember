# Opening history

New Game plays twenty illustrated chapters before the existing fade into Corin's
bedroom and `startMorning()`. Continue and Load Save bypass the prologue through
the default `BOOT.close()` path. Only the explicit New Game actions pass
`{newGame:true}`. No quest or save flag is changed by the prologue.

The sequence lasts about four minutes including transitions. Full-screen art
slowly pans across each scene, including on portrait phones. Gold chapter titles
and two short, fading caption passages accompany each painting. Chapter timing,
camera endpoints, alt text and captions live in `js/prologue-chapters.js`.

Controls are hidden by default. Tapping anywhere reveals them for 1.2 seconds;
the first tap only reveals controls and never advances the story. Back/Left
Arrow revisits a scene; Next/A/Space/Enter/Right Arrow advances. Pause/P stops
the reading timer and camera movement, while captions remain readable. Skip
intro/B/Escape ends with a short fade. Keyboard input reveals controls until a
pointer interaction, keeping focused buttons accessible; Tab cycles within the
dialog. Switching tabs pauses playback. Reduced-motion mode removes camera
movement and caption animation. The artwork covers the viewport in portrait
and landscape; captions can scroll on unusually short screens.

The existing title theme continues underneath the prologue, respecting the
current audio settings. The existing boot transition then fades it out and
fades in the bedroom's area music. World rendering and simulation are suspended
while the prologue is visible. Its DOM, timers, animation objects and temporary
input listeners are removed on completion, including Skip.

Images load only when New Game selects this sequence, retaining just the current
and next image instead of decoding the entire gallery. A missing or slow image
does not disable Skip, and eventually falls back to a dark background while the
caption still presents the chapter. The twenty optimized WebP illustrations live
in `assets/prologue/`; the built-in image-generation prompts are saved there in
`generation-prompts.json` and `expansion-prompts.json`. The latter records the
fifteen additional paintings and their project-relative references. Original
generated artwork is unchanged.

## Expanded journey

The peaceful tour visits Millwood, Thornwell, Forgefalls and Forgewick,
Sandspire and the Oasis, Coralmere and Witchmoor, Hollybeck, then Ashcrag and
Cinderhold. Halvard's ambition leads into three views of Wingfall, his coronation,
the dragon hunts, and four regional views of the roads falling to monsters.
The sequence ends with the suppression of the old histories and morning in
Millwood, without revealing Corin's later discoveries.

Architecture and terrain follow `assets/maps/emberfell-realm-v2.webp` and the
actual building atlas: the timber windmill, school and ivy tavern, Forgefalls
bridge, Forgewick market and temple, sandstone houses, blossom harbor, swamp
boardwalks, snow cabins and volcanic castle. The monster paintings use actual
atlas silhouettes for Vinemaws, Longroots, Duneblades, Cistern Fangs, gnolls and
Watchers. Extracted building, monster and portrait reference sheets are retained
in `assets/prologue/references/`. These historical vistas are recognizable
interpretations, not exact map geometry.

## Canon used

- `js/dragon-dialogue.js`, Wingfall/bond/history topics: seven riders, Halvard's
  betrayal fifty years ago, freely chosen bonds, suppressed historical accounts.
- `js/generated/game-part-2.js` and `js/game.js`, Maddock's history and hatching:
  Halvard seized the throne; monsters spread onto the roads; he prevents new
  riders. His betrayal is named Wingfall.
- `js/dragon-chapels.js`: Halvard bans public dragon worship.
- `js/millwood-shroom-dialogue.js`: no dragons seen openly, dangerous roads,
  surviving memories of the riders.
- The requested expansion establishes plentiful dragons living peacefully
  alongside people, Halvard's ambition and his organized dragon hunts.

The pictures interpret these events without naming the other riders, asserting
their individual fates, or revealing Corin's egg encounter. King Halvard's
throne illustration uses his existing portrait as its character reference.

`index.html` loads the maintained split runtime. The BOOT integration is in
`js/generated/game-part-3.js`; the unused monolithic `js/game.js` is not served.
