# Round 2 Story, Dream, Cosmic, and Inner Boss Identity Audit

**Candidate:** `091143090653efffc7e64ab8262db25f91c3d293` (clean worktree). **First-round fixed candidate:** `ac1e642ff6e225658cd11a147d702c85d67559be`. **Pre-fix comparison:** `d0b40d904e7aa694f84f59ecc31e215b1f33d53f`. The earlier pre-d0 asset-crop comparison uses `9a80f8aaf4a0dba1c90270f665e1535294e3822a`.

## Coverage and result

- 61 canonical Story records: 55 combat, 6 rest. Canonical actor matrix: 65 unique rows (27 bosses, 38 midbosses). All 164 unique authored boss/phase/action image references exist and are SHA-256 inventoried.
- Exact-candidate native route census: 41 active midboss templates expanded across 82 fixtures (41 Story pairs and 41 Dream triples); zero cardinality or sprite-distinctness errors. All 285 expanded art paths decode, with zero failures. The census ran after round-two admission and is recorded in `browser-evidence.json`.
- All six RC87 Story Cosmic finales and all six Dream Cosmic trials retain their source actor IDs and mapped phase art. `blue-executor` and `mb-murder03` are distinct authored enemies; part 7 deliberately uses `mb-murder03` as the source for the RC87 finale after the base-zone major threat.
- Inner persona `inner-evil-rc133` (`cult04`) has 44 required runtime image paths decoded, six original imported source sheets verified byte-for-byte, all 16 base/awake persona frames hash-identical to the pre-d0 manifest, and all skill/effect mappings are enumerated in `source-hash-inventory.json`.
- Pixel audit: 44 manifested outputs and one external derivative match their manifest hash, source hash, dimensions, and byte counts. Six source inputs match both manifest and incoming copies. All 25 VFX/chrono crop reconstructions are pixel-exact. The seven previously corrected chrono crops reconstruct exactly; those earlier pre-d0 comparisons are preserved under `crop-audit/`.

## Native UI evidence

- Eight PC Story/Dream showcase screenshots: Blue Executor base route, Story part 1 Lucifer Cosmic, RC87 part 2 source Cosmic, RC87 part 7 midboss Cosmic, Dream three-midboss encounter, Dream trial 6, inner reveal, inner awake. They are **staged fixtures**; no natural HP/progression claim is based on them. The audit asserted both Story and death overlays absent and the live binding state matched the fixture at 240/240 HP before each screenshot. Screenshots follow at least four matching native render frames; recorded counts are in `browser-ui-evidence.json`. Zero page or HTTP errors.
- Twelve additional staged inner-boss screenshots cover normal, player-awake, boss-awake, and opposition moods across PC, portrait, and landscape. They use the same actor ID, `awake-2.png`/`base-2.png` source frame, and staged world positions. All three viewport render transforms match the prior capture conditions, and the canvas context reports `filter: none` after each draw. Zero page or HTTP errors.
- Manual pixel review of the actual native screenshots confirms the awakened cloak outline is more separable from the dark arena in PC, portrait, and landscape views after the hidden-body brightness/contrast adjustment. The source art itself remains dark; no source PNG or alpha edits were made. Exact native mood/profile screenshots are archived alongside this report. Coarse fixed-ROI luminance readings are in `readability-pixel-check.json`; they include nearby arena pixels and are not a segmented body-contrast metric. The red half remains dark at portrait size.

## Identity findings

- RC87 parts 2–7 map each Cosmic actor back to that route's trigger identity and use that source's highest-form pose. The old Kair Great IDs remain migration aliases. Part 1 Lucifer is a separate continuation from `a11-boss`.
- Part 7's `mb-murder03` source chain is intentional and visually confirmed; it does not replace or rename `blue-executor`.
- The ep1a ordinary projectile correctly maps to the hospital syringe. Chrono crescent/orb reuse is family art, not a wrong-owner mapping. The “1/3” label belongs to the RC129 three-band danmaku HUD, not to inner-boss phase count.
- No remaining incorrect actor-to-art mapping was found in the inspected scenes. The focused post-wait portrait probe proves the full inner-body draw rectangle lies inside both recorded camera crops at its staged position; this is not a guarantee for every position or mood. The dark red half remains low contrast and the body/bar can cross the vertical mood divider.

## Source and comparison provenance

- `source-hash-inventory.json` contains SHA-256 values and dimensions for all 164 canonical actor references and the 285 expanded decoded runtime image paths. Git blob comparisons prove all 285 expanded image bytes are identical to both d0 and the first-round fixed candidate. Candidate `091143090653efffc7e64ab8262db25f91c3d293` adds only documentation/evidence/workflow files over AC1; no asset, runtime, audio, data, test, or tool file differs.
- `crop-audit/pixel-audit.json` keeps the historical pre-d0 comparison against `9a80f8aaf4a0dba1c90270f665e1535294e3822a` separate from the d0/AC1/091 equality check. Source art and authored crop outputs are not conflated with the later screen-render brightness fix.
- Separate natural checkpoint evidence for exact `091143090653efffc7e64ab8262db25f91c3d293` is in `/workspace/rc133-tools/final-round2-natural/summary.json`: completed hidden finale after 224.637 seconds/46 cycles, 270/270 player HP, zero JS/HTTP errors. It used a genuine prior assisted Dream checkpoint with full-auto plus ordinary D defense; it is not a fresh-campaign or unassisted-victory claim.

## Artifacts

- `identity-matrix.json` — full 65-actor phase/action map plus current runtime extensions.
- `browser-evidence.json` — exact-091 routes and 285-path decode census.
- `browser-ui-evidence.json` — eight admitted staged PC scenes, native frame counts, overlay checks, and live HP binding evidence.
- `mood-profile-captures.json` plus 12 `boss-visibility-*.png` images — four moods across three profiles.
- `source-hash-inventory.json`, `crop-audit/pixel-audit.json`, and `readability-pixel-check.json` — source, crop, and render comparisons.
- `../native-scenes-contact.png` — the reviewed eight-scene contact sheet; `../native-scenes.json` records the admitted live-state/frame checks.

## Root reconciliation of portrait telemetry

The pre-wait camera metric still named `dist00-boss`; it is rejected as final-render telemetry. `portrait-opposition-bounds.json` now records post-wait live state: binding equals QA/fixture, target and boss-camera focus are `inner-evil-rc133`, player240/240 and boss280500/280500, six observed body draws per boss/hero pass, no overlays or JS/HTTP errors. On the1247×702 canvas, the boss-pass rectangle x606.15–641.10/y311.34–373.75 lies inside the actual central source crop x0–1247/y175–526; hero-pass rectangles are also inside. Root inspected `portrait-opposition-bounds-verified.png` directly. This establishes drawing and framing at the recorded position. The dark red body remains low contrast and the divider crowds/crosses the bar; no perfect-readability or all-position claim is made.
