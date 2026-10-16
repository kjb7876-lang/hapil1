# RC222 remote co-op verification

## Evidence boundaries

The browser suite uses an actual local WebSocket relay and four isolated official Chrome contexts. A temporary fifth context tests room capacity. All contexts share one computer and loopback networking. This does **not** verify four independent Internet connections, physical devices, mobile browsers, NAT traversal, deployed Render availability, or a natural campaign playthrough.

Official Chrome is launched with `channel: 'chrome'`, `chromiumSandbox: true`, and `args: []`. The suite does not fall back to another browser. Missing Chrome or sandbox launch failure produces a blocked result with the launch error. Screenshot and video files are hashed after capture. `results.json` records the exact Git SHA, dirty state, UTC start/end timestamps, per-check outcomes, page exceptions, HTTP errors, failed requests, and native state at a failure.

Tests require a committed checkout by default. `HAPIL_ALLOW_DIRTY=1` is a development-only override recorded in the report; its result is not final commit evidence. `EXPECTED_SHA` pins both suites to the intended commit. No test deploys, publishes, pushes, or dispatches a workflow.

## Current local execution

- `node tests/rc222-coverage.cjs`: passed at base `fd9728958b23cdd271d6d1bf6078f0e54184165a` during implementation; final changes were still uncommitted. Evidence: `/tmp/rc222-coverage/coverage.json`.
- `node --check tests/rc222-browser.cjs`: passed.
- `node tests/chromium-sandbox-policy.cjs`: passed; explicit sandbox configuration retained.
- `HAPIL_ALLOW_DIRTY=1 node tests/rc222-browser.cjs`: blocked before creating any browser context. The actual relay started and `/healthz` returned HTTP 200 with `ok: true`. Official Chrome was absent at `/opt/google/chrome/chrome`. Evidence: `/tmp/rc222-browser/results.json`.
- Final SHA Chrome CI execution, screenshots, videos, and independent four-network acceptance remain pending. No browser gameplay pass is claimed by the local run.

## Inventory and integration matrix

`tests/rc222-coverage.cjs` generates `coverage.json` from authored story records, the native bundle's world definitions, the current canonical player policy, and the historical native scheduling roster. It checks that the transport hero catalog agrees with the native player policy.

| Dimension | Inventory | What the CPU check proves | What it does not prove |
| --- | --- | --- | --- |
| Authored maps | 61 records: 55 combat, 6 rest | Every record has a native world definition; IDs are unique | Map entry, complete encounter, exit, or natural traversal |
| Auxiliary maps | `hub`, `village` | Listed separately from the 61 story records | A completed campaign |
| Legacy map | `ep1a07` | Explicitly excluded from authored records | Current campaign availability |
| Heroes | 8 canonical player IDs | Native policy, source bodies, and transport IDs agree | Every skill or co-op combination has been fought through |
| Current modes | `STORY`, `DREAM` | Enumerated current game modes | Every mode's complete progression |
| Legacy mode name | `HELL` | Listed as compatibility history | An additional selectable current mode |
| Combat owners | 71 historical scheduling owner IDs | Unique IDs and provenance recorded | 71 current encounters or natural defeats |
| Current map owners | 70 of those historical owner IDs | Belong to authored current map records | Complete boss behavior parity |
| Legacy owner | `mb-ep1a07` | Explicitly retained historical owner of removed `ep1a07` | A current reachable encounter |

The source bundle starts with ten hero bodies, including removed `rian` and `ion`; the canonical policy selects eight. The world retains 64 definitions, including hub, village, and legacy `ep1a07`. These historical counts must not be presented as additional current player options or authored story maps.

The historical owner inventory contains 50 source literal/factory rows and 21 explicit identity/geometry rows. These provenance labels come from the existing scheduling fixture inventory. A row in this matrix is not evidence that its native installer, authored encounter, every phase, every cast, or natural defeat was exercised remotely.

When Chrome can execute, the browser suite also runs 61 maps × 2 modes × 8 heroes = **976 native snapshot roundtrip fixtures**, plus 71 explicit owner identity snapshots. The matrix changes exported map/mode/hero fields while native simulation is held by a modal. It uses the actual native serializer, native snapshot validator, and runtime adapter, then restores the complete original snapshot. Owner rows use explicit controlled actor and projectile identities. This checks snapshot fidelity only: it does not call native map entry for every row, cast every owner's spells, or fight all combinations.

## Browser cases

| Case | Mechanism and assertion | Fixture disclosure |
| --- | --- | --- |
| Two players start | Actual menu create/join/ready/start with actual relay; both reach playing | Same machine, separate storage contexts |
| Two become four | Third/fourth join a running room and receive native full snapshots | Late join, no natural progression claim |
| Fifth denied | Extra isolated context receives denial; existing roster remains four | Capacity attempt uses public client API |
| Simultaneous attack | Four real `A` keyboard inputs; actual native enemy HP decreases; remote actor steps and attributed outgoing hits are observed; guests agree on IDs/HP | `777`, native QA `dist02` showcase, controlled health/positions, entry UI suppression and invulnerability setup |
| Guest movement | Actual guest arrow key changes its host-owned native actor position; guest snapshot converges | Controlled map/starting position from the combat fixture |
| Boss death and reward | Controlled low boss HP, then actual native attack; native death/completion/reward IDs agree across clients | HP and phase guard setup are explicit; no forced defeat helper is called |
| Transition barrier | Native map entry, host transition publication, all clients return to playing with an advanced epoch and matching map | Map entry is staged; native map exit progression is not claimed |
| Guest down/revive | Actual native incoming ally damage downs a guest, native co-op revival runs after its timer, all clients see the living actor | Explicit lethal source packet and health setup; not a naturally landed enemy attack |
| Resume | Guest refreshes and uses the stored session to recover the same room and slot within 60 seconds | Actual refresh; exact expiration boundary belongs to relay CPU tests |
| Inventory snapshot contract | Actual native serialization and apply for 976 field combinations and 71 owner identities | Direct adapter fixture; no remote combat or natural traversal claim |
| Host leaves | Guests return offline; runtime returns offline | Explicit host leave; socket-loss behavior belongs to relay/transport tests |
| Solo storage isolation | Actual native save/settings/progress keys are captured before entry and compared after leaving; distinct context sentinels remain | Detailed key routing, backup/mirror, malformed import, and unavailable-storage cases belong to storage tests |

Native combat fixtures preserve the actual input, action, incoming/outgoing damage, death, snapshot, and rendering implementations. They deliberately alter setup fields, and failures retain the actual states instead of changing expectations to obtain a green result.

## Running

Requirements: Node 22+, `server/node_modules` installed from its lockfile, Playwright and Acorn available through `CODEX_PRIMARY_RUNTIME_NODE_MODULES` or `NODE_PATH`, and official Google Chrome available to Playwright. Video capture also requires Playwright's ffmpeg dependency. The standard Chrome sandbox must work under the normal CI runner user.

```sh
npm ci --prefix server
EXPECTED_SHA="$(git rev-parse HEAD)" HAPIL_QA_OUTPUT=/tmp/rc222-coverage node tests/rc222-coverage.cjs
EXPECTED_SHA="$(git rev-parse HEAD)" HAPIL_QA_OUTPUT=/tmp/rc222-browser node tests/rc222-browser.cjs
```

The browser suite starts its own loopback static server and actual relay. Its static server serves repository bytes unchanged. It does not append test hooks or mock browser combat. The `?qa=1` URL enables already shipped native QA APIs. Each fixture states when those APIs or controlled fields are used.

## Independent network acceptance still required

Use four devices on four independently connected networks against a configured public `wss://` relay and the same exact game revision. Record the client revision, relay revision, UTC interval, device/browser versions, room code with credentials omitted, each role, network description, and observed latency/reconnect outcomes. Repeat two-player start, late join to four, fifth rejection, simultaneous damage, death/reward equality, transition barrier, guest refresh/resume, and host exit. Keep the natural versus staged setup distinction for each capture. Run an actual natural campaign sample separately if claiming progression coverage. Local four-context CI cannot supply this acceptance evidence.
