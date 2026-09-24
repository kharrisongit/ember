# Publishing edits from the game

All map editor changes are saved on the current device. **Send Changes** submits only the
current map, then runs `.github/workflows/apply-editor-moves.yml`. The workflow
validates structured coordinates, runs the game checks, commits only
`assets/editor-layouts.json`, and deploys Pages itself. GitHub's workflow token
does not trigger the normal push deployment, so this explicit deployment matters.
Experiments are never uploaded automatically. COPY remains a recovery option.

Send Changes includes Move, Delete, Paint, duplicates, box clears, Doors,
Collision, and Build edits (areas, routes, arenas, resizing, moving regions and
expanding the map). Moving a generated tree publishes both removal of the
original and placement at the new location. Existing saved geometry overrides
join the current map's submission. RESET discards only that map's local draft.

Build changes capture the resulting terrain, features, objects, scenery and
decks as a validated data diff. Actor moves keep their stable identities and
linked collision behavior. Published Build history applies after earlier
submissions, allowing later moves and Build changes to compose. Larger batches
are compressed for GitHub's dispatch input limit; if a batch exceeds that limit,
the game keeps the draft and explains the size error. Submission IDs are reused
only when all structured operations are unchanged.

## Sender and one-time connection

The owner-private sender is
https://emberfell-edit-inbox.kurtislemaster.chatgpt.site
(Sites project `appgprj_6ab5443bd09c8191bd81fd0cf48c85a9`). Its source is maintained
in that Site's source repository. It requires ChatGPT sign-in and a fine-grained
GitHub token restricted to **kharrisongit/ember**, **Actions: Read and write**.
The token is entered in the private sender and encrypted with AES-GCM using the
Site's secret TOKEN_KEY, bound to the owner. No credential is committed to git.

The first Send Changes on a device makes a one-time same-tab connection handoff.
The game stores an ephemeral RSA private key and the requested draft in session
storage. The private sender asks **Connect and return to game**, seals the owner's
existing token to the game tab's public key, then returns to the fixed game URL.
Only encrypted ciphertext travels in the URL fragment; the game immediately
removes it, verifies its state and expiry, and decrypts it. It remembers the token
in localStorage on that browser and sends the draft the user already requested.
The game saves current progress before this one-time trip. Browser storage must
be available, and the handoff must finish in the same tab within 15 minutes.

Subsequent Send Changes calls dispatch the existing workflow directly via the
GitHub REST API. No sender window or second publish button is involved. A small
in-game status panel shows progress, completion or failure, and includes a
Disconnect GitHub control. Refreshing the game resumes status checks only;
normal saves and editor actions do not start network writes. The token is
never included in draft exports. An expired token prompts a new connection.

Each map draft keeps a stable editing-session ID and increasing send sequence.
The workflow remembers that session's original published layout. Later sends
replace the same session's cumulative draft against that baseline, so moving an
NPC again, repainting, changing a duplicate or undoing an edit does not conflict
with the owner's earlier send. An older sequence or a different session's
changes cannot overwrite the latest result. The metadata lives in the layout
file's `sessions` object; it is not part of the rendered map overrides.

Each submission has a stable retry ID. The game checks published IDs and existing
workflow run titles before dispatching, and holds another area's send while an
editor workflow is active. The workflow also checks applied IDs, source versions,
and conflicting sessions/positions before changing layout data. A failed non-fast-forward
push stops instead of overwriting another commit. Local drafts remain available
on errors. Rejected data-only payloads are also retained in the workflow log for recovery. GitHub workflow runs track direct submissions; the private inbox still
retains historical submissions and supports the older popup game clients.

## Maintaining game code

The normal Pages workflow stamps the source fingerprint into the deployed copy
of `js/editor-drafts.js`. Keep `__EDITOR_SOURCE_REVISION__` in repository source;
do not commit a stamped copy. The fingerprint covers tracked game scripts,
index.html and interior JSON definitions, excluding the separate move data.

Published moves match stable identities and their original positions before
application. Actors carry their collision blocks, children and linked stair
arrivals using the game's existing movement function. If authored layout changes
invalidate an anchor, that move is left unapplied and needs review. Applied local
drafts clear on a refresh; stale unpublished drafts remain recoverable with COPY.

Run `node tests/editor-moves.mjs`, `node tools/check-game-scripts.mjs` and the
temple checks after changing this flow. The sender has `tests/sender.mjs` for
authentication, origin, retry, contention and encrypted credential behavior.
