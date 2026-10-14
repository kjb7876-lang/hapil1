# RC204 rigid-layer Slayer side attack candidate

Base: RC203 `80fa2e98738b338008e8f20764d09e5711c7d5c4`. Separate branch `codex/rc204-slayer-rigid-layer`. Main and Pages are unchanged. Existing RC201/202/203 candidates, original assets and reports are preserved.

## Actual runtime identification correction

Exact hero: `slayer`, `악몽 사냥꾼 · 검사` (native declaration near line25955). Following the actual draw installers showed that **RC5** `An → canonicalHeroRC5 → Ln → draw` is active. Its original assets are `assets/hero-authored-v314rc5/slayer-action-atlas.png` and `slayer-walk-atlas.png`, four directions in4×2 cells. RC85 explicitly keeps that atlas for Slayer attacks. The RC81 sidePose/drawSide definitions remain in the bundle but their draw override was removed. Thus earlier RC201–203 references to RC81 as the active runtime path were inaccurate: RC81 was an art reference, not the active attack renderer. This report corrects that without rewriting prior evidence.

Root viewed the actual RC5 atlas, RC81 reference, existing isolated sword, both generated body/arm boards and the final shoulder edit. The RC5 strike row visibly crouches/widens relative to its ready row; swapping more independent full-character frames would not guarantee fixed body/weapon geometry.

## New consistent layers and implementation

The user explicitly allowed a newly authored matching layer set; pixel identity with the original sword is no longer an acceptance requirement. The accepted candidate retains black hair, black/gunmetal armor, red cracks/accents, torn black/red cape and a jagged red-core greatsword.

- `assets/rc204/slayer-body-arms.png`:1774×887 RGBA,1119714bytes; SHA256 `3eb2cb5a33acb8904977d68f656373e579d015177fa9d60666a7da7017bfbe8f`. One swordless body plus two separated arm pieces. Official image_gen: two body/arm attempts plus one narrowly scoped shoulder-hole edit. Final body alpha≥6 bbox[121,31,1085,860]; arm bboxes[1141,116,1675,501] and[1135,447,1676,815], maxima exclusive. Full prompts and assessments are in this folder.
- `assets/rc204/slayer-sword.png`:2172×724 RGBA,704927bytes; SHA256 `94f2063f8952423fb6e4ed090f1011b1cd589a85295f36a757bfb6a24e0c6909`. This reuses the single RC203 generated sword after the user relaxed exact-pixel identity. No new per-frame weapon images were generated. Earlier rejection solely for design/pixel differences is superseded by that authorization.
- `assets/rc204/slayer-rig.js`: one fixed body, two two-bone arm chains, and one uniformly scaled sword image. IK positions the hands at grip points; the sword rotates/translates through preparation→downward swing→recovery. Arm joints use overlapping render masks. Neighbor components are excluded by source-coordinate masks. The body matrix and head/foot reference points never animate. No texture retouching, per-frame weapon rescaling, melee contact, lunge, damage, attack timing or muzzle change was introduced.

The actual RC5 side-attack boundary calls the rig for `slayer`/`attack`/`left|right` only, using locked RC5 direction and normalized attack progress. Front/back attacks and all non-attack states retain the original renderer. This is a **side-attack implementation**, not a replacement of all four directions. Missing either decoded texture falls back to the complete old sprite before painting any new layer. Critical assets and zone-plan pins include both images. The unchanged outer EGO draw wrapper retains first ownership.

## Collision and fixed camera preservation

The existing contact recorder now marks contact-only probes; the rig deliberately yields to the original RC5 sprite for those probes. The actual bitmap body-contact result is compared against a rig-disabled baseline and remains identical. This is necessary because otherwise the last arm/weapon draw could become the hero's measured collision polygon. The presentation envelope separately samples both sides and nine swing positions, so the fixed camera can include the raised sword. Rig decode count invalidates both the native envelope and layout frame caches. Newly loaded layers therefore cannot leave a stale legacy frame. No combat reducer was replaced. RC203 barrage code remains byte-identical.

## Actual pixels reviewed

`rig-0_25.png`(prepare), `rig-0_48.png`(swing), `rig-0_62.png`(follow-through), `rig-0_82.png`(recover) plus start/end and mirrored `rig-left-0_48.png` are **CPU raster outputs** of the same runtime layer commands via installed libcairo. Source assets are unchanged; CPU rendering only applies the runtime clipping/affine/layer operations. These are not browser/game screenshots. Root opened and inspected all seven PNGs.

During initial composition, neighbor arm fragments floated outside the body and the raised blade exceeded the first review viewport. Source masks and one constant whole-view scale fixed those issues. Removing duplicate pauldrons exposed the body's black shoulder socket; a targeted imagegen edit replaced it with continuous armor. The final reviewed composites have the complete sword and boots inside the review canvas and no exposed circular socket or detached neighbor component. Hands overlap the hilt in the sampled compositions. Armor/elbow layering is a stylized candidate and still needs in-game motion review; mathematical grip coincidence alone does not prove every rendered joint pixel is anatomically perfect.

`PIXELS.json` records real source RGBA at near/far fist centers(1625,446)/(1625,756), closed shoulder(590,213), sword grip(410,365), and the actual alpha≥6 rightmost sword tip(2035,376). Grip/shoulder samples have alpha253. Landmarks and masks were manually located and checked against the image, not inferred from a filename.

`KINEMATICS.json` samples602 poses across both sides. Review foot reference remains(960,1000), head reference Y393.25, source grip-to-tip distance after the fixed review transform stays≈365.633376827 pixels, and weapon determinant/area scale stays≈.050625. Thus length and thickness do not pump. Both hand targets are reachable and endpoint error is below5e-13 pixels in the model. Every full source crop rectangle fits the1920×1080 review canvas. These numerical results are separate from pixel inspection.

`preview.html` is a local standalone QA viewer using the actual rig draw function; it is supplied for review but has not been run/captured in a browser here. Serve the repository root and open `/qa/rc204/preview.html`.

## Tests and remaining work

`tests/rc204-slayer-rig-unit.cjs` executes the actual RC5 installer/state/options/Ln draw path, actual native heroDraw arrow, actual bitmap contact/envelope module and actual outer EGO wrapper. It checks side layers, original front/back/non-attack fallback, atomic decode fallback, decode-aware envelope invalidation, identical legacy contact result, overhead presentation extent, resource pins and EGO precedence. PNG dimensions are real; image decode/alpha bounds, Canvas/DOM and unrelated services are fixtures. All39 regression test files passed at runtime commit `ccac353a3ae629c21811f485705b91a7d4169a35` (`REGRESSION.json`). Preservation passed for3352 files and535 directories with working/committed tree matches (`PRESERVATION.json`).

No new actual-browser, GPU, natural combat, real-device, in-game-size transition or full campaign verification was performed. No browser/cache/sandbox permissions were altered and no browser installation was attempted. The local CPU render does not resolve the earlier public RC137 transition timeout. Front/back still use the legacy animation and are not covered by the fixed-body side rig. Main/Pages deployment remains prohibited pending separate approval and actual game review.
