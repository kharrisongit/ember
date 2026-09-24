# Publishing moves from the game

MOVE edits are saved on the current device. **Send Changes** submits only the
current map, then runs `.github/workflows/apply-editor-moves.yml`. The workflow
validates structured coordinates, runs the game checks, commits only
`assets/editor-layouts.json`, and deploys Pages itself. GitHub's workflow token
does not trigger the normal push deployment, so this explicit deployment matters.
Experiments are never uploaded automatically. COPY remains a recovery option.

Automatic publishing currently accepts moves of existing actors/NPCs, ordinary
objects and scenery. Build, paint, additions, deletion and geometry exports still
use COPY. RESET discards the current map's local draft, restoring published data.

## Sender and one-time connection

The owner-private sender is
https://emberfell-edit-inbox.kurtislemaster.chatgpt.site
(Sites project `appgprj_6ab5443bd09c8191bd81fd0cf48c85a9`). Its source is maintained
in that Site's source repository. It requires ChatGPT sign-in and a fine-grained
GitHub token restricted to **kharrisongit/ember**, **Actions: Read and write**.
The token is entered in the private sender, never in the game or a chat. It is
encrypted with AES-GCM using the Site's secret TOKEN_KEY and bound to the owner.
The game and this GitHub repository contain no credentials.

A normal send uses an origin/source/nonce checked popup message. Browsers that
isolate the popup receive the draft in a URL fragment (not an HTTP query) and
require an explicit **Publish these moves** confirmation. No URL fragment alone
can cause a write. The game can detect the finished publication through its own
public layout file. The private sender shows GitHub run status and its link.

Each submission has a stable retry ID. The sender admits one active publication
at a time; another area's draft remains local until the user sends it. Workflow
checks reject changed source versions and conflicting object positions. Invalid
input never becomes executable code or a shell command. A failed non-fast-forward
push stops instead of overwriting another commit. Recent submission data is also
retained in the private database for recovery.

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
