# Publishing edits from the game

Map editor changes live in memory for the current page session. Reloading or
reopening the game starts fresh from the published map. Old drafts, geometry,
COPY history and send records are cleared; game progress and the GitHub
connection remain. Changing rooms keeps edits within the current page.
Publish or COPY edits before refreshing if they should be kept.

**Send Changes** submits only the
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
decks as a validated data diff. Terrain strings send only their changed span,
and identical terrain/base-terrain content is transferred once. Opening Build
does not enlarge the map; use +EAST/+SOUTH or draw beyond its edge when needed. Actor moves keep their stable identities and
linked collision behavior. Published Build history applies after earlier
submissions, allowing later moves and Build changes to compose. Larger batches
are compressed for GitHub's dispatch input limit; if a batch exceeds that limit,
the game keeps the draft and explains the size error. Submission IDs are reused
only when all structured operations are unchanged.

The arena type button cycles the available hunting animals and COMBAT. Hunting
clearings keep three animals inside their boundary without battle walls. Each
animal drops its own meat for dragon healing and returns after five minutes.
The selected hunting type is included in both Send Changes and COPY.

ARENAS also numbers existing hunting clearings. Tap a green number on the map
or a hunting entry in the list to choose Bird, Hare, Boar, Deer or Fox. Choosing
an animal replaces that clearing's herd immediately and records a compact arena
edit with its stable ID and original feature data. Animal-only changes do not
resend terrain, scenery or deleted-object arrays. SEND CHANGES publishes the choice. Panning and pinching do not select a
number; Cancel leaves the current animal unchanged.

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
Disconnect GitHub control. Refreshing starts a new editor session;
normal saves and editor actions do not start network writes. The token is
never included in draft exports. An expired token prompts a new connection.

Within a page session, each map keeps a stable editing-session ID and increasing
send sequence.
The workflow remembers that session's original published layout. Later sends
replace the same session's cumulative draft against that baseline, so moving an
NPC again, repainting, changing a duplicate or undoing an edit does not conflict
with the owner's earlier send. An older sequence or a different session's
changes cannot overwrite the latest result. The metadata lives in the layout
file's `sessions` object; it is not part of the rendered map overrides and never
restores drafts on a fresh page load. It prevents retries and undo from
duplicating objects or overwriting a newer editing session.

Each submission has a stable retry ID. The game checks published IDs and existing
workflow run titles before dispatching, and holds another area's send while an
editor workflow is active. The workflow checks applied IDs and conflicting
sessions/positions. When game code changed, it prepares the current game map
and validates the affected actor/scenery anchors, doors, collision overrides,
actual painted terrain and Build baseline. Unrelated code, art and dialogue
updates can publish without refreshing; actual target conflicts stop atomically.
Arena edits also validate their original feature data.

If main advances during a send, publishing fetches the latest main and reapplies,
validates and checks the original submission, up to five attempts. It never
force-pushes. Editor commits run separately from Pages deployments. Deployments
check out latest main so an older queued run cannot restore an older game. A
replaced deployment counts as complete only if the submission receipt is live.
Edits remain in the current tab on errors. Rejected data-only payloads are also
retained in the workflow log for recovery. GitHub workflow runs track direct
submissions; the private inbox still
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
drafts and unpublished drafts both clear on a refresh, as requested by the owner.

Run `node tests/editor-moves.mjs`, `node tests/editor-source-compatibility.mjs`,
`node tests/editor-publish-race.mjs`, `node tools/check-game-scripts.mjs` and the
temple checks after changing this flow. The sender has `tests/sender.mjs` for
authentication, origin, retry, contention and encrypted credential behavior.
