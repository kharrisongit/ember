# Hollybeck winter residents

Generated with the built-in imagegen tool, using the game's `market_citizen1`
and `market_citizen3` walking sheets as style, scale and animation references.

Final assets:

- `assets/sprites/hollybeck-sverre-walk.png`
- `assets/sprites/hollybeck-sverre-idle.png`
- `assets/sprites/hollybeck-runa-walk.png`
- `assets/sprites/hollybeck-runa-idle.png`

Each native PNG is 256 × 128 pixels: eight columns, four rows in south, north,
east, west order. Each cell is 32 × 32. Artwork is approximately 15–19 pixels
wide and 25–28 pixels tall, in line with the source villagers. Runtime crops
are 24 × 30 with a shared foot anchor. The first six frames animate normally; the seventh holds closed eyes and the eighth half-closed eyes.
Walking plays at 8 fps; breathing idles at 4 fps. Both states blink for
260 ms every 3.8 seconds (half-closed → closed → half-closed → open), with an independent phase for each character. The renderer uses nearest-neighbor scaling.

## Final prompt set

Shared walking prompt: Edit the existing pixel sprite sheet. Preserve its coarse
pixel grid, flat color clusters, dark navy outlines, head/body proportions,
poses, positions, six columns and four rows. Change only clothing into heavy
winter gear. Keep the 18 × 27 logical-pixel character scale and 32 × 32 cells.
Use a thick snow jacket, scarf, gloves, boots and wool cap. No rendered lighting,
texture, gradients, glow, scenery or shadows. Real transparent alpha.

Sverre: Navy-teal padded coat, brick-red scarf, dark teal plain cap and brown
boots. Preserve the original character's face and hair colors.

Runa: Plum padded coat, mustard scarf, cream cap and brown boots. Follow-up
edit: remove all visible hair in every frame, including side locks and hair
behind the hat. Preserve her face, clothes, poses and pixel scale.

Idle prompt, each character separately: Convert this exact walking character
into a standing idle sheet. Six columns and four rows: front, back, right,
left. Both boots together, feet firmly planted on a constant baseline, hands
resting at the sides. Gentle six-frame breathing loop with a one-logical-pixel
chest/head bob. No stepping, turning or gestures. Preserve identity, clothing,
pixel size and palette. For Runa, retain the hat-only appearance with no hair.
Real transparent alpha background.

The selected sheets were exported to the native game grid with nearest-neighbor
sampling and translated within each cell to align the feet. No smooth scaling
is used. The dialogue and walking residents are installed by
`js/hollybeck-villagers.js` with stable editor identities.

Blink edit prompt, each sheet separately: Change only the eyes in column five
of the front, right and left rows. Fully close every visible eye with a dark
navy eyelid line; leave no white or pupil. Preserve every other pixel, pose,
clothing detail and transparent background. The generated blink frame is
packed after the six original motion frames so blinking has its own timing.

Mid-blink edit prompt, each sheet separately: Change only the eyes in column
five of the front, right and left rows. Cover the top half of each eye with
a navy upper eyelid, leaving the bottom logical pixel row of eye white/pupil
visible. Keep all other pixels, poses and transparency. Pack this half-closed
frame after the closed-eye frame; use it on both sides of each blink.
