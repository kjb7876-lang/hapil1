# RC133 gameplay readiness handoff — implementation in progress

Start/main baseline: `473f5fe6ab717bb975c35f198938f43dd55f9358` (73 narration voices).
Working branch: `codex/rc133-samong-inner-self`. No commits/push/main/Pages deployment yet.
All test results below ran the working tree; they are not exact-commit release certification.

Implemented draft: run-scoped EGO seven-entry reservation, atomic activation/revival admission, bounded Dream upgrade policy and growth UI/save wiring, transaction-driven defensive presentation, stable humanoid/Stand size, charge-to-warp integration, Story/Dream midboss partner wiring, open-world region/waypoint foundation, cult-leader-death hidden-inner-persona route with bounded growth/projectiles and four awakening composition modes.
The RC133 native integration source is `assets/rc133/native-install.js.txt` and its identical appended closure in `assets/index-v31526.js`. Changes must update both until the source is moved to a build tool.

Passed verification:
- `node tests/rc133-policy.cjs`: 127 checks (mocked activation boundary).
- `tests/rc132-unit.cjs`: 32 checks.
- `tests/rc127-policy.cjs`: 174 checks, basic speed 6.471685.
- `tests/rc131-hero-unit.cjs`: 344 checks.
- `tests/rc127-browser.cjs`: 160 checks on each desktop/portrait/landscape profile, 480 total; actual staged cosmic casts incl blood-beam windup/fire delivery, delayed cast preservation and death cleanup; no JS/HTTP errors. This test did not reproduce a new blood-beam bug.
- `tests/rc115-natural-story-portal-browser.cjs`: first Story boss cleared and `dist00` → `dist01` reached, no HP/boss/progress cheats, about 71 seconds, no JS/HTTP errors. This is one natural segment, not a full campaign clear.
- Syntax checks passed for edited scripts.

Blocking source delivery:
The current Library consumer contract was followed: exact resolved IDs, prepare_materialize to own executor destination, unchanged official download helper. Every image and recovered audio transfer ended with `library file transfer failed: download failed`, including enabled-network/escalated attempts. This is a technical download failure, not an auto-review rejection. No actual source pixels, recovered audio waveform, or gender audition were verified in this executor. Empty destination: `/workspace/rc133-library`.

Parent can stage exact authorized bytes on an assets-only Git branch, then provide branch and SHA. Proposed staging paths:
- `.incoming/rc133-library/libfile_a0e71293286481918c55e03101fbcc90.png`
- `.incoming/rc133-library/libfile_2cc2c525f0bc81918ac00e11fb72ba3d.png`
- `.incoming/rc133-library/libfile_fd6b302c3e6481918851054ea82e72c9.png`
- `.incoming/rc133-library/libfile_7b12e0c0188481918329b8dcdbaac089.png`
- `.incoming/rc133-library/libfile_5cb215e0010c819184a9934248eb7f61.png`
- `.incoming/rc133-library/libfile_77701ac3d1e08191bf1f9f03b29ac967.png`
- `.incoming/rc133-library/libfile_d7e2654af5608191b9b2984fc10ffb03.zip` (35,870,860 bytes; SHA256 `cf0ab4632ee7461acc4d14608150e977c6b273c59889097f95a47f1d35030d46`)
- `.incoming/rc133-library/libfile_6fa34609476c8191a3d4efa0d4e05f5f.json`
Include a source manifest mapping each ID to original filename, size, SHA256. These are staging paths, not final runtime roles; pixel inspection determines slicing/use.

Remaining before release: real source pixel inspection/scene+sprite integration; audio placement/derivative integration; RC133 native save/upgrades/EGO/hidden/warp/midboss browser fixtures and four-state pixel regression; complete cosmic-original identity and canonical narrative/art coverage audit; full relevant existing regressions; narrow preservation delta plus genuine baseline preservation; exact-commit CI and fresh-main coordinated Pages/public-hash validation. No zero-bug guarantee or full-game/mobile-device coverage claim.

## File/change inventory and current scope

| Files | Concrete change | Status |
| --- | --- | --- |
| `assets/rc133/samong-policy.js`, `rc91/samong-awakening.js`, `rc108/damage-policy.js`, controller resonance channel | Seven ordinary EGO entries, pending retry, shared lethal admission, 7/77 defaults, five capped Dream upgrades | Unit + real channel/native save staged checks pass |
| `assets/rc96/resonance-hud.js` | EGO n/7 and pending indicator | Runtime loads; visual HUD review remaining |
| `assets/rc128/combat-feedback.js`, combat-core | Transaction reasons, defensive/source throttling, cancellation, parry/dodge marks, cached hero fallback, duration-aware eight hero motifs | 42 unit checks; full 72 hero browser regression remaining |
| Bundle narrow native changes + `assets/rc133/native-install.js.txt` | Gap charge disabled; dynamic dash attack changed to stationary cross; close boss warp with safe endpoint/shared cooldown; humanoid body/Stand size and hit radius | Warp/gap staged checks pass; exhaustive alternate movement charge audit remaining |
| Same integration | Native pair kept at two Story/extended to three Dream; different same-arc template artwork; extra actor save records | One actual template pair tested; authored multi-leader encounters still need exhaustive count audit |
| Same integration | Visited region/rest waypoint/resource schema and save sanitation | Foundation only, intentionally no full quests/maps/story |
| `assets/rc133/inner-final.js`, actual native death/tick/map hook | Cult death reveals bounded persona; own hero role volleys, warning/capped velocity/count; normal/player/boss/opposition composition; native saves | 180 browser checks across three profiles pass; uploaded art + awakening image treatment and all-eight trait differentiation remaining |
| `assets/rc87/episode-cosmic.js` | **Not changed yet** | Concrete audit found all six episode finals borrow unrelated Kair Great identity; must replace with original episode boss awakened forms and stationary presentation |
| `index.html` | RC133 loaders/cache queries | Current narration query 2026100307 unchanged |
| `tests/rc133-policy.cjs`, `tests/rc133-feedback-unit.cjs`, `tests/rc133-browser.cjs` | Focused admission, transaction feedback, real channel/save/death/compositor fixtures | 127 + 42 unit + 180 browser checks passed |

Luna Max scoped coding/test task executed (separate from audio audit): only `tests/rc133-feedback-unit.cjs`; 42 mocked-clock tests for all defensive outcome labels/types, cancellation, rejected/zero damage events, duplicate journal sequences and source throttling. It changed no implementation and performed no publication. This is a reusable small follow-up task if parent wants an additional Luna task: extend ONLY `tests/rc133-feedback-unit.cjs` to cover per-frame output budget and continuous-contact 0.45-second throttling, using accepted journal rows; do not change combat reducers.

Latest extra verification: `tests/rc133-browser.cjs` passed 60 staged checks per desktop/portrait/landscape profile, 180 total, no JavaScript or HTTP errors. It invokes the installed native React cult death closure through the deliberately staged QA defeat method; this is not a natural hidden-final kill. The first test attempt used an empty entry roster at dist01 and correctly failed four fixture assertions; it was corrected to instantiate the authored native midboss/pair. Evidence is `/workspace/rc133-tools/native2/rc133/results.json` with 12 native render screenshots.

## Stable draft checkpoint

Gameplay branch commit and push: `992e4eeb3c4a13428554114a825b1ba0acb3f77b` (`codex/rc133-samong-inner-self`). The working tree at that checkpoint was clean. Exact-commit checks passed: RC133 EGO policy (127), feedback unit (42), RC132 unit (32), RC127 policy (174), RC131 hero unit (344), RC133 staged native browser (60 per profile x3), RC128 hero/mode renderer browser (72 cases across 8 heroes and 3 emulated profiles). Browser fixtures deliberately set up representative states; they do not establish a full natural campaign or physical handset result.

The pinned baseline commit `473f5fe6ab717bb975c35f198938f43dd55f9358` separately passed the unchanged narration preservation verifier with all 3,041 runtime files byte checked. That is evidence for the exact baseline only; it does not certify the new RC133 runtime delta.

The parent reports its assets-only Library staging returned a user-cancelled MCP result and is paused pending coordination. No staged asset branch or source bytes are in this checkout. Preserve the placeholder state in `qa/rc133/release-status.json` until the parent supplies the authorized asset branch. The Library audio handoff reports measurements from its manifest, but this executor has not materialized the audio originals for remeasurement or listening; gender/semantics remain unauditioned.
