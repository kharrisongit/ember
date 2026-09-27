# LastDragonriderGame cloud saves

The game connects to Firebase project `lastdragonridergame`. It uses Google Authentication and Cloud Firestore Standard edition only. It does not use Analytics, Cloud Storage, Cloud Functions, or Firebase Hosting. The public web configuration is intentionally included in the game.

## One-time console setup

1. Open **Authentication → Get started → Sign-in method → Google**. Enable it, choose your support email, and Save.
2. In **Authentication → Settings → Authorized domains**, add `kharrisongit.github.io` (hostname only). Keep the existing Firebase domains. Add any other actual game host separately before using Google login there.
3. Open **Firestore Database → Create database**. Choose **Standard edition**, the default database, a suitable US location, and **Production mode**. Keep the project on the **Spark** plan.
4. Open Firestore's **Rules** tab. Replace the editor contents with the root `firestore.rules` file from this repository and click **Publish**. These rules allow each signed-in player to read/write only their own three save documents. Never use public/test-mode rules.
5. Open the GitHub Pages game in Safari or Chrome, press A to reach the menu, and select **Cloud saves → Sign in with Google**. If the browser blocks the popup, allow it and tap the button again. Embedded browsers may require opening the game in Safari/Chrome.
6. Existing device saves appear as **Device-only** entries. Copy the desired save into an empty account slot, wait for **Saved to cloud**, then sign in on another device to verify the same save appears.

Console setup and real Google-account login must be completed by the project owner. Public web configuration does not grant this editor Firebase administration access. No service-account private key is needed.

## Save behavior

- Guest slots remain at their original local-storage keys. Each Google UID gets a separate set of local slots and sync metadata. Changing accounts never silently imports another account's saves.
- Every save writes locally immediately. Cloud writes are debounced for 15 seconds, attempted when the page hides, and retried after connection failures with backoff. Unsent changes survive reloads. Closing the browser is not a guarantee that an in-flight network request finished; check **Saved to cloud** before changing devices.
- Three Firestore documents live at `players/{uid}/saves/{1|2|3}`. A transaction compares the known cloud revision before writing. Divergent progress opens a choice between the device and cloud versions rather than selecting by device clocks.
- Cloud downloads do not replace slots during active gameplay. Account changes and conflict selection are performed from the title screen. The in-game Save menu provides **Cloud saves** and **Save and return to title**.
- Deleting a slot creates a versioned empty document, so an offline device cannot silently restore a deleted cloud save. Conflict resolutions retain up to three local backup payloads per slot under that slot's `.backups` key.
- Cloud saves contain normal player progress only; map editor drafts, credentials and authentication tokens are not copied into save documents.
- A cloud quota/setup/network failure leaves local saves intact. Firebase SDK loading is independent of the game loader.

## Validation

Run `node tests/cloud-saves.mjs` and `node tools/check-game-scripts.mjs`.
After console setup, test Google login, the same three slots on a second device, offline save/reconnect, diverging offline saves on two devices, deletion/reconnect and switching between two Google accounts. Publish the supplied rules before testing cloud saves.
