# RC222 remote co-op verification

## Evidence boundaries

The browser suite uses an actual local WebSocket relay and four isolated official Chrome contexts. A temporary fifth context tests room capacity. All contexts share one computer and loopback networking. This does **not** verify four independent Internet connections, physical devices, mobile browsers, NAT traversal, deployed Render availability, or a natural campaign playthrough.

Official Chrome is launched with `channel: 'chrome'`, `chromiumSandbox: true`, and `args: []`. The suite does not fall back to another browser. Missing Chrome or sandbox launch failure produces a blocked result with the launch error. Screenshot and video files are hashed after capture. `results.json` records the exact Git SHA, dirty state, UTC start/end timestamps, per-check outcomes, page exceptions, HTTP errors, failed requests, and native state at a failure.

Tests require a committed checkout by default. `HAPIL_ALLOW_DIRTY=1` is a development-only override recorded in the report; its result is not final commit evidence. `EXPECTED_SHA` pins both suites to the intended commit. No test deploys, publishes, pushes, or dispatches a workflow.

## Current execution evidence

- Current local CPU results reported by the integration run: runtime **52 tests passed**, transport **85 checks passed**, relay **10 tests passed**. These are deterministic contract/module tests with disclosed fixture dependencies; they are not a Chrome combat or independent-network pass.
- `tests/rc222-coverage.cjs`, browser syntax checking, and `tests/chromium-sandbox-policy.cjs` passed during implementation. The initial local browser attempt reached the actual relay's HTTP 200 health response, then stopped because official Chrome was absent at `/opt/google/chrome/chrome`; it created no browser contexts. Initial local reports are `/tmp/rc222-coverage/coverage.json` and `/tmp/rc222-browser/results.json` and describe their own earlier SHA/dirty state.
- Exact `eb6c6e1a1e9aaf124e9af762f1b10bd621ebad37`: [CI run 38867865985](https://github.com/kjb7876-lang/hapil1/actions/runs/38867865985) had a green CPU job and a browser failure. The simultaneous attack case observed `ownedHits: 0`; a room connection or an increased attack counter did not establish attributed positive enemy HP commits. Later browser cases were not reached.
- The current implementation assigns an outgoing source to the active native actor before reduction, resolves delayed hits under their actual owner even inside another actor transaction, and records ownership only after a positive HP commit. New CPU cases exercise the actual outgoing reducer for p2–p4, nested delayed ownership, lifesteal isolation, rejected damage and the bounded commit event history. The browser still requires positive commit events for **each** remote human slot; the assertion has not been relaxed.
- Run38871303572 below verifies corrected combat, movement, orientation and boss death on its exact revision. The later inventory and revival cases are recorded in run38872056593 below; its final solo-isolation failure remains open until a later exact-SHA run passes. The PR and exact `results.json` provide the latest execution result; no real four-network acceptance is claimed. Screenshots/video support only their recorded revisions and outcomes.

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

The browser suite defines 61 maps × 2 modes × 8 heroes = **976 native snapshot roundtrip fixtures**, plus 71 explicit owner identity snapshots. This case completed in run38872056593. Its current implementation pauses the host modal and performs serialization on **guest p2**, which stays passive: the native party role is temporarily set to host only to call the serializer and is restored to guest immediately. Each explicit map/mode/hero or owner fixture is applied through the guest runtime validator. When constructing each identity fixture, old-scene feedback, exit effects and active laser/ultimate records are cleared; those records cannot belong to a different map or hero. No AI, damage, native map entry, owner cast, or natural traversal runs on that guest.

The fixture restores the original snapshot, then leaves and rejoins p2 so its synthetic high wire sequence cannot suppress subsequent real relay snapshots. The host modal is restored and native client state must converge again. Loading a host checkpoint while keeping current room members is a separate browser case. The inventory matrix does not prove checkpoint membership, native encounter behavior or all-map completion.

## Browser cases

| Case | Mechanism and assertion | Fixture disclosure |
| --- | --- | --- |
| Two players start | Actual menu create/join/ready/start with actual relay; both reach playing | Same machine, separate storage contexts |
| Two become four | Third/fourth join a running room and receive native full snapshots | Late join, no natural progression claim |
| Host checkpoint with late members | Save with two humans, join to four, load through the host UI, retain all four live room members and advance the transition epoch | Current room identities are reconciled with saved actor data; passed on run38872056593 |
| Fifth denied | Extra isolated context receives denial; existing roster remains four | Capacity attempt uses public client API |
| Simultaneous attack | Four real `A` keyboard inputs; actual native enemy HP decreases; each of p2–p4 must increase its native attack count and produce a positive attributed HP commit; guests agree on IDs/HP | `777`, native QA `dist02` showcase, native story initialization/dismissal, settled native boss HP, controlled human positions/invulnerability, and story AI held during measurement |
| Guest movement | Actual guest arrow key changes its host-owned native actor position; guest snapshot converges | Controlled map/starting position from the combat fixture |
| Boss death and reward | Controlled low boss HP, then actual native attack; native death/completion/reward IDs agree across clients | HP and phase guard setup are explicit; no forced defeat helper is called |
| Transition barrier | Native map entry, host transition publication, all clients return to playing with an advanced epoch and matching map | Map entry is staged; native map exit progression is not claimed |
| Guest down/revive | Actual native incoming ally damage downs a guest, native co-op revival runs after its timer, all clients see the living actor | Explicit lethal source packet and health setup; not a naturally landed enemy attack |
| Resume | Guest refreshes and uses the stored session to recover the same room and slot within 60 seconds | Actual refresh; exact expiration boundary belongs to relay CPU tests |
| Inventory snapshot contract | Actual native serializer plus passive guest p2 apply for 976 field combinations and 71 owner identities; leave/rejoin clears synthetic sequence | Host modal held; serializer role switch only; no AI, damage, native map entry or owner casts |
| Host leaves | Guests return offline; runtime returns offline | Explicit host leave; socket-loss behavior belongs to relay/transport tests |
| Solo storage isolation | Actual native save/settings/progress keys are captured before entry and compared after leaving; distinct context sentinels remain | Detailed key routing, backup/mirror, malformed import, and unavailable-storage cases belong to storage tests |

Native combat fixtures preserve the actual input, action, incoming/outgoing damage, death, snapshot, and rendering implementations. They deliberately alter setup fields, and failures retain the actual states instead of changing expectations to obtain a green result.

## Native combat ownership and verification scope

The host owns simulation, damage, deaths and rewards. `assets/rc222/runtime.js` supplies a persistent actor facade and temporarily binds the existing native state, hero, input, settings and growth refs for a remote slot. `assets/index-v31526.js` calls that adapter from the native party tick, incoming/contact paths and delayed strike/thread resolvers. Its `__HAPIL_RC222_NATIVE__` bridge exposes the extracted native player frame, movement, incoming damage, status and cooperative revival functions. `assets/combat-v31412/outgoing-native.js` retains the native outgoing formula and associates immediate and delayed HP commits with the correct slot. Guests apply snapshots and render; they do not own AI or damage.

| Existing feature | Native owner / remote hook | Exactly exercised by current CPU tests | Chrome evidence still required |
| --- | --- | --- | --- |
| Attack and charge | Existing control actions, basic tick and `__HAPIL_LOOP_V31365__`; actor facade and outgoing reducer | Actor/ref isolation; command edges; actual reducer positive/rejected HP commits for p2–p4 and delayed ownership | Current simultaneous human attacks and charge behavior; earlier case failed ownership telemetry |
| Blink/dash and movement | Existing dash action and extracted native `moveActor` | Dispatch and input isolation with fixture bindings; original frame/movement source retained | Native remote movement and blink geometry across maps |
| Resonance and parry/guard | Existing resonance action and `__HAPIL_CHANNEL_V31364__`; `parryActor` / `blockActorDamage` | Dispatch fixture; actual held-D module, persistent session/contact identity and per-slot resonance; guard suppresses casts | Real enemy projectile/laser contacts, visible feedback and timing on remote actors |
| EGO and Samong | Existing awakening/charge modules, native actor frame and story clock | Actor-owned fields; actual native clock advances only the owner's cooldowns/queues; Samong command/revival routing uses controlled dependencies | Full EGO conversion, charged release, Samong activation/revival visuals and damage for all heroes/modes |
| Manual/semi/full auto | Existing native control tick, per-actor combat mode | Mode/ref isolation and snapshot fields; guest/disconnected authority rejection | Natural auto decisions and combat parity for each remote hero |
| Projectiles and lasers | Native producer/collision/render paths; source tagging and delayed outgoing resolver | Delayed source ownership and contact identity; source-level wiring | Actual projectile/laser damage, rendering, warning/contact timing and cleanup across owners |
| Reflection and deflection | Existing hostile projectile rules; conversion tagging in actor transactions | In-place friendly/reflected conversion retains converting slot; actual native deflection and Dream wall reflection retain hostile allegiance | Real reflected/deflected packets, visual ownership and outcomes over the relay |
| Lifesteal and hit resources | Native outgoing reducer under the owning actor facade | Actual outgoing reducer restores the delayed owner's HP/combo while preserving host and other actor state | Natural lifesteal/resource gains from real remote hits |
| Status, roots and deferred damage | Native incoming/status hooks, SevenSin functions and RC210 deferred module | Actual SevenSin stacks/DOT and deferred ticks isolate actor HP; root fields and DOT targets map to the correct slot | Real enemy-applied statuses, movement lock and feedback on remote actors |
| Summons and collaboration | Existing collab action, support call and pending-spawn ownership tagging | Collab dispatch and actor/source context with fixture bindings; no exhaustive summon lifecycle case | Native summon creation, targeting, damage, cleanup and visuals for each hero |
| Revival | Native incoming hook, Samong choice and cooperative `reviveActor` | Command authority; actor facade; eight-second survivor condition with controlled revival dependency | Actual incoming damage, down timer and revival synchronization; browser case is staged and pending |

“Actual module/reducer” above identifies code loaded from the shipped implementation inside a deterministic fixture. Native services and React bindings may be controlled dependencies; it does not mean the complete production browser or a natural encounter ran. Features listed as wired or retained have not all received a dedicated behavioral test. The browser's later movement, death/reward, transition, revival, inventory, resume, host-exit and storage assertions remain required after the current failing combat gate passes.

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

## Initial committed candidate evidence

- `b831b0e` retained the first candidate. Its workflow was rejected for a duplicate step identifier; no game checks ran.
- `1dd41f4` corrected that identifier. Dependency symlink visibility failed the clean-tree precondition; game checks did not run. `c600f1f` ignores only the isolated dependency link and retains the same strict clean-tree check.
- Exact `c600f1f4c0343c06ee2727b4149d7b0d7e1b0c73`: [candidate run 38866183500](https://github.com/kjb7876-lang/hapil1/actions/runs/38866183500), CPU job passed. Official Chrome launched with the normal sandbox; two-player start, late join to four, and fifth-player denial passed. The simultaneous native attack check failed waiting for boss HP loss. Later checks did not run. [Screenshots/video artifact](https://github.com/kjb7876-lang/hapil1/actions/runs/38866183500/artifacts/12031740208) was captured for that exact SHA; the local artifact download returned HTTP 403 and those images were not locally inspected.
- The initial combat fixture dismissed the old story card before initializing the new map's native story memory. The production `beforeFrame` sets the new map's pre-entry flag and opens its card. The revised fixture calls that actual helper and dismisses the resulting card, then explicitly requires native time to advance before real A-key attacks. HP, per-actor attack, ownership, death/reward and later assertions remain required. A later exact-SHA run must establish the result; this diagnosis alone is not a gameplay pass.

## Checkpoint boundary

Active late joins and guest reconnects receive the host's current combat snapshot; the host retains native charge, guard and deferred damage memory. Host checkpoint loading intentionally releases held charge/guard and clears deferred damage remainder according to the existing native policy (`remainingDamageSaved:false`). Checkpoints preserve campaign state and actor fields, but do not resume an in-flight held input or every private WeakMap combat session. This boundary must remain disclosed.

- `7ee6ce6582cc70f24639f6314ab7909a6e910dc0`: CPU passed in [run 38866788151](https://github.com/kjb7876-lang/hapil1/actions/runs/38866788151). The same first three Chrome cases passed; combat then failed the native attack-count assertion. The failure record contained a preserved story AI actor (`story68`) that the assertion incorrectly treated as a human, and the fixture's artificial boss maximum HP was normalized by native balancing. The next fixture requires exactly human slots p2–p4, their actual attack-count increases and owned outgoing hits, and damage from the settled native boss HP; story AI is held during this measurement. It retains the AI in the game roster. No combat success is inferred from these fixture corrections. Runtime input rejection telemetry was added without changing the game gates. The captured failure preview for this SHA was inspected locally (`a9e97bd65997736129131b02e9baa9d9dedb56ea5c650156293d4466e9a7bcda`).

### Additional exact revision checks

- `50db861be42bd255078dd442c298400267d8665c`, run [38869544314](https://github.com/kjb7876-lang/hapil1/actions/runs/38869544314): CPU passed; browser two-player start and four-player late join passed. The newly added checkpoint UI case stopped because the initial native story dialog intercepted the party button. The subsequent fixture dismisses that story explicitly before checking checkpoint membership and closes the lobby afterward; combat assertions are unchanged. This run does not verify the later cases.
- Exact protected-tree preservation verification passed locally at `50db861`; 22 cosmic loader, RC188, and RC210 unit files plus RC34 balance/resonance smoke passed. These are CPU checks, not live encounter or mobile evidence.

- `abb478339bace04ccee5d34bc6fed857f65ec4bc`, [run38869932983](https://github.com/kjb7876-lang/hapil1/actions/runs/38869932983): CPU passed; checkpoint roster/epoch assertions succeeded, then the fixture tried to close a lobby already closed by the transition. A captured host page exception also exposed a real checkpoint bug: an early snapshot removed `rc126AssetLedger` while the RC126 WeakMap cache remained, causing a read of undefined `sequence` and stopping the host frame. RC126 now rebuilds its cache on ledger replacement, removal, or time rollback and uses the canonical world for facades. The storage regression exercises the actual module for all four conditions; the prior49-case RC126 smoke remains green. The next browser run must contain no page exceptions.
- Runtime44 includes extracted native temporal passive/field/resonance/HUD helpers: player cooldown and feedback fields are actor-owned; shared battlefield time stop remains shared. Unknown HAPIL relay modes are rejected. Touch/mobile Chrome emulation now checks portrait input blocking, retained room/map/health and resumed landscape movement; physical-device behavior remains unverified.

- `6b558e90ab349a3039e41044e76225cfac5549b7`, [run38870512547](https://github.com/kjb7876-lang/hapil1/actions/runs/38870512547): CPU passed; two-player start, late join to four, checkpoint load retaining all four members and fifth denial passed with no page/HTTP errors. Simultaneous combat failed waiting for staged dist02 HP loss after a fixed1.4 wall-second key hold; only about0.1–0.2 simulated seconds passed during that hold on the shared renderer. Each guest fired once, and earlier live dist00 positive commits were attributed to all three guests, but the staged dist02 commit condition was not met. The revised fixture holds the real A keys until the same attack/HP/per-slot commit assertions complete or time out; it records native combat rejection/route diagnostics. It does not lower the damage or owner assertions or infer success. The exact failure JPEG was inspected locally (SHA256 `17d0011a781ca4751d2810b624ee41a6d2806ee626f53bca980ac68dfde32e8d`).
- A second concrete checkpoint crash was reproduced: active Balrog rift contact WeakMaps became plain objects in the native snapshot codec. Contact clocks now live outside serialized hazards;34 actual-codec/module checks and the existing33-check rift suite pass. Fractional contact remainder restarts after host load and is documented in the storage contract.

- `8752ec6d5ddf8e0b7f7effe759c68f56b3c3a835`, [run38871303572](https://github.com/kjb7876-lang/hapil1/actions/runs/38871303572): CPU passed. Chrome passed two-player start, four-player late join, checkpoint retaining4, fifth denial, each guest's positive native HP commits, two guest keyboard movement cases, touch/mobile-emulated portrait block and landscape resume, and native boss death/reward agreement. Map transition then failed: all guests correctly rejected stale old-map `enemyFeedbackV31361` receipts in an immediate transition snapshot and left. The exact native validator/wrapper reproduces this rejection; entry now calls the existing feedback reset before snapshot publication. Invalid receipts remain rejected. No later browser case passed in that run.
- Native all-wipe logic had a separate critical error: `shouldRespawn()` mutated and respawned actors before checkpoint selection, leaving hostHP0 with no down timer and no revival dialog. The native main condition now consumes the host checkpoint choice first. Actual native main condition/party/RC91 regressions prove waiting, exactly one rebuild, original solo behavior and unchanged8-second survivor revival. Runtime49 includes those cases, transition feedback cleanup and malformed diagnostic payloads. The browser now explicitly exercises host/party lethal incoming damage and the original checkpoint choice.

### Preserved legacy failure

`tests/rc108-damage-policy-smoke.cjs` still fails before its native counter assertions because its VM does not install `__HAPIL_COMBAT_CORE_V31401__.finalDamage`. The unchanged test was also run against the public baseline bundle `fd9728958b23cdd271d6d1bf6078f0e54184165a` and failed with the same TypeError. The extracted counter body is byte-identical (SHA256 `3fe1b8c79cf7bd9bec8c423f9374b81f832b1db33b8bc1171cb1ccb0b73f55f8`). The fixture and its expectations were not changed or hidden. RC34, both RC188 checks and the RC222 actual combat-core/outgoing integration checks pass; `rc108-samong-ricochet-smoke` passes separately. This is not a claim that all repository CI is green.

- `af7696e5268df33cdd4bc335931a93db4b3fb664`, [run38872056593](https://github.com/kjb7876-lang/hapil1/actions/runs/38872056593): CPU passed. Chrome passed all14 cases through map loading barrier, actual guest incoming/down/eight-second revival, all-party wipe waiting for host checkpoint selection,976 native field snapshot combinations plus71 owner identities, and a real guest refresh/resume. The final host-leave check correctly failed unchanged solo storage: the old React autosave cleanup ran after the co-op namespace closed and created a solo hub autosave. Native code now captures storage generation for autosave/progression/frame effects and refreshes React scope on entry/leave; the exact browser assertion remains unchanged. Full suite success is pending that fix. No page/HTTP exceptions occurred in this run.

The stale-callback fix has52 runtime tests, including Acorn-extracted actual autosave/progression/RAF effects with timer and pagehide queues. Cross-generation callbacks cannot serialize or mutate restored state; current-generation solo timers, pagehide saves and explicit ordinary exit cleanup still work. Entry/leave refresh React scope so a resumed ongoing solo game gets new callbacks. The unchanged final browser comparison must still pass.
