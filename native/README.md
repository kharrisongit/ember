# The Last Dragonrider for AltStore Classic

The iPhone/iPad app bundles the current public game (`index.html`, `assets`, `css`, and `js`) in a native WebKit shell. Single-player and device saves work offline. Cloud saves and story co-op require internet. The wrapper uses a read-only HTTP server bound **only** to `127.0.0.1:49731`; the stable origin and persistent WebKit data store keep saves through launches and app updates. Audio byte ranges are supported. No game files, tokens, or saves are served on the LAN.

Google sign-in uses the existing authorized website in Apple's authentication browser, then returns an encrypted Google ID credential to the calling app. An ephemeral P-256 key agreement, HKDF-SHA256, AES-GCM, and per-attempt state bind the callback to that attempt. There is no new Google OAuth client, token relay server, token logging, or credential in a readable callback URL. Firebase validates the credential before loading account saves. The existing browser sign-in path is unchanged. Real Google-account and co-op operation require device testing.

Browser-local saves are a separate store. To bring existing progress over, sync it through the game's existing Google account first, then sign into that account in the installed game. Keep the original browser save until you have verified the copy. Removing the app removes its local saves; updating it with the same signing account preserves its container.

Build on macOS with Xcode installed:

```sh
LDR_VERSION=1.0.0 LDR_BUILD=1 native/build.sh
native/smoke.sh
```

The device build creates `native/build/LastDragonrider.ipa`. AltStore signs it during installation. The icon reuses the exact Corin/Aurelius raised-wing silhouette from the title screen. `native/render-icon.mjs` recreates the master PNG from that sprite frame; it needs `@napi-rs/canvas` when regenerating artwork, but regular app builds use the committed PNG and have no Node dependency. The workflow in `kharrisongit/Opalinetest/.github/workflows/last-dragonrider.yml` builds the current game commit, checks an actual iOS simulator (including launch, local audio, and storage across relaunch), publishes a release, then updates the existing shared source. Game snapshots are identified in the release notes and `source/dragonrider/build.json`.

The release build excludes the `DEBUG` smoke-test code. It does not need JIT, an Apple developer team in CI, or unrestricted file/network access entitlements. iOS 15 or newer is required.
