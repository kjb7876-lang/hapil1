# RC224 arena, camera and projectile candidate

Verification record: 2026-10-17 UTC. This is a local candidate on
`codex/rc224-arena-camera-heel-fix`, based on
`b2cc6048792be30f4daf802857ebab06ba3b4ee7`. The intermediate test-only
checkpoint `548a9d7b4a2e1231b787b7e736867f81520f9472` reached `main` and its
Pages workflow succeeded, but the final source-sync and audit-chain changes
below are not yet published. Do not treat that earlier Pages success as the
final candidate deployment.

## Changes under review

- Keep the RC223 player-accessible left floor and its existing 1-second grace,
  0.5% max-HP periodic damage, and 0.9 outgoing-damage/movement multipliers.
  Remove the painted region boundary and hide the warning badge. The penalty
  logic remains active.
- Move only the three authored `ep1b05` enemies farther right while retaining
  the native enemy-floor bounds.
- Give `ep1b05` boss and midboss volleys a wider fan through the existing native
  scatter path; keep each shot's count, speed and damage.
- Halve eligible ordinary boss and midboss projectile drawing/collision
  radii, emit one extra spread shot per ordinary shot, and scale the
  per-owner/global admission caps from 24/72 to 48/144. Existing laser, field,
  reflected and authored persistent-shot exclusions remain in place; the
  already smaller jellybean shot retains its 0.33 scale.
- Rotate the heel artwork so the toe points along projectile travel, based on
  the actual source PNG orientation.
- Ease the camera range to `1 + (requested - 1) * 0.25`. Actors, attacks and map
  still share the same camera transform; at the maximum setting the world
  shrinks by 20%. The canvas remains full-sized in its available stage. Pixel
  coverage of the map art has not been browser-verified.
- Default online-lobby connections to the owner-supplied relay URL only when
  no explicit operator or saved player endpoint exists. Do not open a socket
  until the player starts an online room action.
- Preserve the current 49,933-byte EGO installer that is already embedded in
  the deployed bundle, and add it as `native-install-v2.js.txt`. The older
  49,559-byte installer remains untouched as historical source. Point the
  rebuild helper and exact-source checks at v2 so a future rebuild cannot
  silently remove camera/contact handling while copying the stale installer.

## Passing checks

- `tests/rc224-arena-regression-unit.cjs`: 52 checks, including legal/rightward
  enemy placement, no drawn zone boundary, seven distinct fan rays over 1.82
  radians, toe alignment in eight directions, and half-size/double-count
  ordinary boss shots with laser exclusions.
- `tests/rc224-relay-config-unit.cjs`: default URL, operator override, saved
  endpoint preservation, and no automatic connection.
- `tests/rc223-camera-unit.cjs`: 44 checks for the eased camera and native UI
  readout; `tests/rc223-left-zone-unit.cjs`: 238 checks; `tests/rc223-left-warning-unit.cjs`: 12 checks.
- `tests/rc210-projectile-unit.cjs`: 39 CPU paint/geometry checks;
  `tests/rc153-combat-unit.cjs`: 15,447; `tests/rc210-root-hit-unit.cjs`: bind,
  immunity and finite DOT checks.
- `tests/rc223-transform-art-unit.cjs` passed actual FFmpeg RGBA/alpha-boundary
  checks for the contained Lucifer/archangel transformation artwork and its
  scene wiring. `tests/rc198-mobile-cosmic-camera-unit.cjs` and
  `tests/rc193-cosmic-facing-unit.cjs` passed their analytic pose/camera checks.
- Additional independent CPU checks passed: RC127 policy (174), RC137 large
  projectile admission (12 cases plus 27 cooldown checks), RC137 direction
  input (902), ordinary enemy motions (1,145), RC137 awakening portraits (144),
  EGO art (501,428 pixel-byte checks), and EGO handoff (27).
- Relay server tests: 11 passed. Co-op storage, runtime (64 assertions),
  transport (122 checks), rift checkpoint (34), and coverage inventory passed.
  The inventory reports 61 maps, 71 owners and 8 heroes; it is not a natural
  campaign run.
- JavaScript syntax checks and `git diff --check` passed.
- `tests/rc155-ego-guardian-unit.cjs`: 12,408 checks passed against the exact
  current installer source; `tests/rc137-art-unit.cjs`: 201 checks passed.
- `tests/rc223-camera-unit.cjs`: 44 checks passed after confirming the deployed
  bundle's camera-aware EGO integration was preserved byte-for-byte.
- The first official-Chrome RC146 run reached the actual D-parry fixture and
  showed its old `one boss shot` expectation conflicted with the requested
  doubled boss volleys. The fixture now checks two emitted shots, one
  parry-marked packet, and an untouched density companion. That exact-SHA
  browser rerun is pending after this test correction.
- The next official RC137 run found the parallel stale assertion in the
  71-owner native scatter audit (`expectedExtra: 1`). It now requires the
  density companion count to equal each eligible boss's six base shots;
  the exact-SHA Chrome rerun is pending.
- `tests/rc138-arena-unit.cjs`: 4,224 checks passed. Its stale whole-file
  equality was replaced with an exact check of the RC138 installer plus its
  sole later RC223 left-zone movement-penalty overlay.
- `tests/rc156-anatomy-preservation-unit.cjs`: 641 checks passed;
  `qa/rc133/published.cjs --manifest-only`: exact local inventory and bytes
  passed for 401 expected files and 44 art outputs.

## Retained failures and unverified behavior

- The final full preservation test checks the committed Git tree, so it must
  be rerun after the source-sync and extension-149 changes are committed.
- The published-byte audit's full URL/browser mode cannot reach Pages from this
  shell: every outbound `fetch` failed. Its local manifest-only preflight did
  pass. The exact-SHA GitHub Pages and official-Chrome jobs are the next remote
  checks; earlier runs on `548a9d7` correctly failed because extension 149 was
  not yet recorded and because the EGO bundle was stale.
- `tests/rc210-fall-progression-unit.cjs`, `tests/rc220-combat-unit.cjs`, and
  `tests/rc222-support-draw-unit.cjs` cannot start here because they require
  Acorn from `/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/acorn`,
  which is absent. No dependency or cache was installed or changed.
- Official Google Chrome is not available in this execution environment, so
  there is no visual browser, natural-progress, GPU, or physical-device proof.
  The existing root-hit diagnosis records that the earlier
  `38711234400`/`38711234064` checks were invalidated by live-timer fixture
  timing, while later exact-SHA official Chrome reruns remain pending. The
  root-hit unit passes; this is not an end-to-end natural encounter result.
- The user reported `https://hapil-relay.onrender.com/healthz` returned
  `{"ok":true,"protocol":1}`. A direct health request from this environment
  was blocked by its outbound proxy with HTTP 403 `CONNECT tunnel failed`.
  No WSS handshake, four-player browser session, or deployed relay SHA was
  verified here.
- Pages has not been published from this candidate. All visual claims above
  are source/CPU evidence until an exact-SHA official Chrome run is available.
