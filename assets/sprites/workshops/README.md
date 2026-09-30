# Workshop craftsmen

Dunstan's 42-frame smithing loop is restyled from the existing `smithy_anim_8`
pose sequence, at the original 0.15 seconds per frame. The generated sources
and built-in image-generation prompts are retained here. Runtime strips use
96px cells drawn at the existing 48px workshop footprint, hard transparency,
nearest-neighbour sampling and one shared 48-colour palette.

`dunstan-idle.png` contains rest, breath, half-blink and closed-blink poses.
The head, anvil and feet stay fixed; only the apron/shoulders and eyelids change.
The native actor key, station position, depth sorting, interaction anchors and
editor attachment remain intact.

Sela retains his existing glasswork art. Conversation uses native frames
0, 1, 2, 3, 39 and 40 for resting, breathing and blinking behind his unchanged
table. His 45-frame work loop resumes on goodbye.

`js/workshop-craftsmen.js` holds both craftsmen at their stations during the
greeting, dialogue, reply, topic and profile states. Leaving a conversation
restarts work at frame zero instead of jumping to an arbitrary hammer strike
or furnace position.

Rebuild Dunstan with `python tools/pack-workshop-craftsmen.py` (Pillow, NumPy,
SciPy). Check packed pixels with `python tests/workshop-art.py` and runtime
transitions with `node tests/workshop-craftsmen.mjs`.
