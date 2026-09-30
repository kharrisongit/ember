# Hollybeck winter residents

Sverre, Runa and Tobin use the same detailed pixel-art approach and idle clock as the indoor seated residents. Astrid, the chef, is unchanged. The retired outdoor residents remain removed by the published layout.

## Selected assets

- `hollybeck-sverre-idle-v2.png` and `hollybeck-sverre-walk-v2.png`
- `hollybeck-runa-idle-v2.png` and `hollybeck-runa-walk-v2.png`
- `hollybeck-tobin-idle-v2.png` and `hollybeck-tobin-walk-v2.png`

All sheets use 64×64 source cells, displayed at 32×32 with `spriteScale=2`, nearest-neighbor sampling and transparent backgrounds. Rows face south, north, east and west. Adults are 54 source pixels high; Tobin is 48. Feet share the source baseline at y=60. Back collars are continuous bands in every north-facing frame, with no front opening or lapels.

Idle sheets contain four columns: neutral, cloth inhale, half blink and closed blink. As with `house-seated-v2.png`, the neutral master fixes the face, hat, hair and boots. Only the cloth band rises one source pixel for breathing; only the eye area changes for blinking. Back-facing blink frames stay neutral. `villagerIdleFrame` supplies the same staggered breathing and blink timing as the indoor cast.

Walking sheets contain six alternating-leg poses per direction, played at 8 fps. Rows are packed from complete nontransparent source bands so hats and boots cannot be cut by nominal generation cell boundaries.

## Provenance and prompts

Generated with the built-in image-generation tool. The indoor seated sprite sheet and existing resident identity references guided the redesign. `hollybeck-v2-prompts.json` contains the exact idle, back-collar correction and walking prompts and the selected output paths. `hollybeck-v2-packing.json` records source crops and scale factors. Legacy sheets remain in the repository for history and are no longer loaded for these three residents.

`js/hollybeck-villagers.js` registers the new art; the existing published identities, dialogue and patrol routes are preserved. Tobin's dialogue portrait is cropped from his new south-facing idle.
