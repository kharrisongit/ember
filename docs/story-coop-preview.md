# Story co-op foundation / Render deployment

Branch: `coop-foundation`. The Render preview is a staging build of The Last
Dragonrider. The live GitHub Pages game remains on `main`.

The combat milestone includes:
- Private rooms for two Google accounts, independent rider names/hair/eyes,
  and a dragon for each rider with all four flying directions.
- Server-validated walking and sprinting across the overworld terrain. The small
  Millwood test rectangle is gone; buildings, water, trees and roadworks stay solid.
- A repeatable woodland encounter with three mushrooms. Both players must choose
  **Ready for battle** before the party moves into the arena and the countdown starts.
- Shared enemies, health, attacks, deaths and victory; separate rider/dragon health,
  sword attacks, dragon claw commands and fire projectiles with separate cooldowns.
- Nearby partner/own-dragon revival, a full-health retry after defeat, and healing
  after victory. No friendly fire or campaign rewards are applied.
- A paused battle during the 30-second reconnect window. If a guest permanently
  leaves, the encounter ends and can restart when a partner joins again.

Campaign quests, conversations, cutscenes, interiors, mounting, other encounters,
rewards and shared saves are not connected yet. Normal campaign simulation remains
frozen, and campaign saving is blocked during the preview. Leaving reloads the title.
The server verifies Firebase ID tokens using public Google signing certificates;
it has no Firestore access and requires no service-account private key.

## Render setup

In the Render dashboard select **New → Web Service**, connect GitHub, and choose
`kharrisongit/ember`.

| Field | Value |
| --- | --- |
| Name | `ldr-coop-preview` (or another available name) |
| Branch | `coop-foundation` |
| Language / runtime | Node |
| Root Directory | Leave blank |
| Build Command | `npm ci --prefix multiplayer --omit=dev` |
| Start Command | `npm start --prefix multiplayer` |
| Instance Type | Free |
| Health Check Path | `/healthz` |
| Environment variable | `FIREBASE_PROJECT_ID=lastdragonridergame` |
| Environment variable | `NODE_ENV=production` |

The same configuration is provided in `render.yaml`. The server reads Render's
`PORT` automatically and binds to `0.0.0.0`. It serves the preview client and
WebSocket endpoint from the same origin. The GitHub Pages game stays on `main`.

After deploying, copy the **actual hostname** Render assigns (for example,
`ldr-coop-preview.onrender.com`). In the existing `lastdragonridergame` Firebase
project, open **Authentication → Settings → Authorized domains → Add domain**.
Add only that hostname (no `https://` and no path). Google sign-in on the preview
needs this setup. Keep the existing GitHub Pages domain.

Open the Render URL in Safari or Chrome. Use Google sign-in, then **Co-op Preview →
Host preview**. On a second device, sign into a different Google account and join
with the eight-character code. Both players choose **Ready for battle** to begin.
A gold/orange ring marks the combat boundary only while fighting.

| Action | Touch | Keyboard |
| --- | --- | --- |
| Move | Direction pad | Arrow keys / WASD |
| Sprint | Hold Run and a direction | Hold Shift |
| Sword | Sword | Space |
| Dragon claw | Dragon claw | Q |
| Dragon fire | Dragon fire | E |
| Revive | Stand near a fallen partner/own dragon, then Revive | R |

Dragon attacks aim at a nearby visible enemy. Fire has a 12-second cooldown; claw
has a 2.4-second cooldown. The orange enemy attack area signals where to dodge.
After victory or defeat, both players can choose Ready again for a fresh fight.
These are preview combat values, not final campaign balance.

The free Render service sleeps after 15 minutes without incoming traffic and may
take about a minute to wake. It may also restart at any time. Reconnection works
while the same server room remains alive; a server restart ends this temporary
room. Free bandwidth/build quotas still apply.

## Development

```
npm ci --prefix multiplayer
npm test --prefix multiplayer
npm start --prefix multiplayer
```

`tools/export-coop-preview-map.mjs` regenerates the shared static collision map
from the maintained game world and published layouts. Terrain is a compressed
bit mask; collision overrides and fixed bodies preserve edited geometry.
Regenerate after changing the world. All room movement and combat is decided on
the server; clients send directions and action requests, never positions or damage.
The Firebase verifier can be injected by local tests only; production always
verifies real Google sign-in tokens. Protocol 2 rejects stale movement-preview clients.

## Next milestones

1. Connect existing campaign encounters and progression to shared server state,
   starting with the opening story sequence and a separate co-op campaign schema.
2. Add shared dialogue progression, party interior transitions, hatching, mounting,
   ferry/flight scenes and scripted boss phases.
3. Validate separate co-op save recovery before enabling progress writes.
4. Expose the validated co-op mode from the main game's title screen using the same
   Render service. Keep the preview branch for testing future multiplayer changes.

Official setup references:
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/free
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/auth/admin/verify-id-tokens
