# Story co-op foundation / Render deployment

Branch: `coop-foundation`. This is the first network milestone for The Last
Dragonrider, not a finished story co-op mode. The Render preview has private
rooms for two Google accounts, independent riders and hovering dragons, validated
server-side movement in a collision-checked patch of Millwood, and 30-second
reconnection. Character names, hair and eye colors are independent.

Campaign combat, story decisions, interiors, mounting, quests, rewards, and shared
saves are not synchronized yet. The preview freezes normal game simulation and
blocks saving for the duration of the test. Leaving reloads the title screen.
Firebase sign-in/cloud-save features are reused; the server only verifies Firebase
ID tokens against public Google certificates and cannot access Firestore. No
service-account private key is needed for this milestone.

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

Open the Render URL in Safari or Chrome. When the game has loaded, use the
existing Google sign-in button, then **Co-op Preview → Host preview**. On a second
device, sign into a **different Google account**, open Co-op Preview, and join
with the eight-character code. Arrow keys/WASD and the preview's touch pad move
the rider. The hovering dragon follows. The gold boundary marks the test area.

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

`tools/export-coop-preview-map.mjs` regenerates the small server collision mask
from the maintained game world and published layouts. Regenerate it when changing
the Millwood preview area. No campaign state is imported into multiplayer.

## Next milestones

1. Test real Google login and two physical devices on the deployed Render URL.
2. Extract reusable movement/collision and actor simulation from the single-player
   runtime. Implement local prediction and smooth server reconciliation.
3. Add shared enemy simulation, damage, dragon commands, death and checkpoints.
4. Add host-owned campaign state, explicit shared dialogue progression, and party
   transitions. Handle hatching, ferry/flight scenes and scripted boss phases.
5. Introduce a separate co-op save schema and rules; validate reconnect and save
   recovery before allowing progression writes.

Official setup references:
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/free
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/auth/admin/verify-id-tokens
