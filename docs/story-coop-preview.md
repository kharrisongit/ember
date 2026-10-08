# The Last Dragonrider — story co-op

Story Co-op is integrated into the main game's title screen. The GitHub Pages
client connects to `https://ldr-coop-preview.onrender.com`; the Render URL also
serves the same game. Render deploys `coop-foundation`, and GitHub Pages deploys
`main`. Keep both branches on the same integration commit.

## Play

Sign in with different Google accounts on two devices. Choose **Story Co-op**.
One player chooses **New shared story** (or a saved adventure) and **Host
adventure**. The other enters the eight-character room code and chooses **Join
adventure**. Keep both game tabs visible; the adventure pauses when either player
is disconnected or away. Both riders press A to continue shared dialogue.

The complete existing campaign engine runs in the host's browser: world,
interiors, quests, optional conversations, shops, crafting, temples, encounters,
boss phases, travel and ending. There is no separate chapter-limited co-op story.
The companion sends controls and receives the actual game's rendered scene and
visible menu controls. Host and companion can each move, turn, fight, mount and
command their own dragon. Ordinary cameras follow the viewing rider; authored
scenes use their shared camera. Bring your partner close before using a doorway.

Each viewer sees their own dragon in red and their partner's in purple. Matching
hair choices appear as contrasting colors to the other rider without changing
saved profiles. Each rider has independent health, equipped charms, ingredients,
collection history and dragon attacks. Story flags, key items, equipment ownership,
recipes, gold and ordinary consumable supplies are shared. Each player can gather
the same world ingredient node. A surviving rider can revive a nearby fallen
partner; both falling uses the original retry flow.

Both players use the main game's original controller, artwork, layout, button
callbacks, and personal rider/dragon heart display. The same responsive deck is
used in portrait and landscape. Only the session bar adds co-op controls.

| Action | Main controller | Keyboard |
| --- | --- | --- |
| Move | Direction pad | WASD / arrows |
| Run / shield block | Hold B | Hold B |
| Interact / sword / continue | A | Space; A/Enter in supported menus |
| Back | B | Escape in supported menus |
| Bag / crafting / equipment | Bag, then the ordinary game menu | — |
| Dragon attacks / commands | Dragon / Command | — |
| World map / travel | Map | Arrows / Enter / Escape inside the map |
| Revive fallen partner | Revive in the session bar | R |
| Save checkpoint | Save in the session bar | — |

Press and release are relayed separately. Releasing B stops only that rider's
run/block even while their partner owns a menu. Using B for Back does not start a
run. Touch cancellation, blur, stale input and a paused connection clear holds.

## Saves

Co-op uses the existing three account-scoped Firebase save slots and cloud queue.
It chooses an empty slot or its own previous campaign slot and does not replace a
solo save or another co-op adventure. Each account also retains up to four local
co-op backups. If all three cloud slots are occupied, the new adventure saves on
that device only; the room bar and manual Save notice explain this.

Autosaves occur at safe points, approximately every ten seconds. A requested save
during a scene, encounter, doorway, flight or ferry ride waits for a safe point.
Save & exit stays in the game if the save is queued or device storage fails;
finish the encounter or resolve the storage problem and try again before exiting.
The checkpoint stores shared campaign progress plus both riders' identities,
positions, health, equipment and ingredient histories. Each account receives the
same checkpoint; either can host **Resume** after the room ends. Mid-battle and
mid-cutscene actions are not checkpointed. Loading a co-op slot routes to the co-op
lobby, and solo autosaves protect occupied co-op slots.

A temporary network drop pauses play and reserves the seat for 60 seconds. A host
leaving or a server restart ends the room; resume the last checkpoint from the
title screen. The free Render service can sleep or restart, and bandwidth quotas
still apply. Keep the host's device awake while playing.

## Runtime and trust boundary

- `js/coop-runtime.js` switches actor-local state around existing engine updates.
  Shared simulation ticks once; enemy/projectile target ownership stays attached
  to a rider. It adds the second rider and dragon to ordinary world rendering.
- `js/coop-render.js` sends bounded canvas display lists and batches cached sprite
  crops. The companion replays an allowlist of drawing operations; it never runs
  code supplied by another player. Frame acknowledgements bound outstanding work;
  reconnect and missing-texture requests rebuild the rendering cache.
- `js/coop-ui.js` exposes text and short-lived tokens for visible controls in
  allowlisted gameplay menus. A token must still refer to a visible enabled
  control. Account/login panels are never mirrored.
- `js/coop-campaign.js` handles entry, controls, Google-authenticated transport,
  reconnection, music/effects, and existing account-scoped save integration.
- `multiplayer/src/campaign-room.mjs` is protocol 6, private, two accounts per
  room. It validates bounded monotonic input/commands and relays presentation and
  checkpoints only from the host. The host is trusted to run the campaign; this
  is cooperative play, not an anti-cheat-authoritative competitive server.
- Production Firebase ID tokens are verified against Google's public signing
  certificates. The server has no Firestore access or service-account secret.
  Test identity verification exists only as an injected local test dependency.
- The older protocol-4 preview room and its tests remain for reference, but the
  title screen and Render root no longer launch that separate preview engine.

## Render configuration

| Field | Value |
| --- | --- |
| Repository | `kharrisongit/ember` |
| Branch | `coop-foundation` |
| Root Directory | Blank |
| Build Command | `npm ci --prefix multiplayer --omit=dev` |
| Start Command | `npm start --prefix multiplayer` |
| Health Check | `/healthz` |
| Environment | `FIREBASE_PROJECT_ID=lastdragonridergame`, `NODE_ENV=production` |

`render.yaml` contains this configuration. Retain both the GitHub Pages and Render
hostnames in Firebase Authentication's authorized domains. No new Firebase rules
or paid service is required. Health reports `full-campaign-runtime`, protocol 6.

## Verification

```
npm ci --prefix multiplayer
npm test --prefix multiplayer
node tools/check-game-scripts.mjs
node tests/campaign-coop.mjs
node tests/cloud-saves.mjs
node tests/temple-arenas.mjs
node tests/ice-moth-projectiles.mjs
node tests/combat-navigation.mjs
node tests/heartstone-interaction.mjs
node tests/thornwell-royal.mjs
```

Tests exercise actual campaign functions for actor health, targeting, revival,
per-player gathering, shared equipment/unlocks, dialogue readiness and checkpoint
compatibility, plus authenticated room/relay/reconnect behavior. Existing campaign
regressions cover temple layouts, bosses, rewards, combat, royal quests and saves.
Browser checks use two independent clients, including a phone-sized companion,
and cover simultaneous D-pad/B touch, native menu buttons, keyboard input,
per-rider health, hold/release/cancel/blur, and portrait/landscape deck geometry.
These checks do not substitute for playing every campaign branch end to end.
