# RC207 exact-candidate release gate

Preserved predecessor: f33ba369bb702f89c474b2fd7a555b5684bd218e. Public main must stay b3186f453b67e8d0f70d97f3f46e81f0c37beb9e until every below predeployment validation job succeeds on one exact candidate SHA. Failed, cancelled, skipped, unrun and running jobs are not success. Conditional steps for other profiles are not extra jobs. Main-only published-audio is postdeployment, not a skipped predeployment success.

## Before main/Pages promotion

| Workflow | Required jobs / coverage |
| --- | --- |
| rc207-candidate | cpu:51 CPU/offline tests, full strict preservation; legacy-audit(rc130):unchanged22-suite native/release/media set; legacy-audit(hero-images):RC131 images, real hero directions/actions, RC132 unit/browser. No apply/transform/git-write steps. |
| rc133-gameplay | audit ×6: native-gameplay, preservation, legacy-release, mobile-lifecycle, midboss-motions, core-ui. Includes old RC127 policy/browser and RC132 validation without transformer jobs. |
| rc134-fullauto-balance | validate ×3: damage, natural, rc128-candidate |
| rc137-integration | persona-native-rc158; audit ×6 (PC/portrait/landscape ×2), full existing art/input/arena/EGO/lifecycle coverage and native PNG artifacts |
| rc144-death-burn | browser matrix PC/portrait/landscape, existing performance comparison |
| rc146-global-body | browser matrix PC/portrait/landscape, whole body ash/gameplay/preservation |
| rc147-camera-finale | matrix PC/portrait/landscape: camera/Persona/six cosmic/performance/defense/legacy |
| rc129-danmaku | verify: policy, startup, complete native render-chain, release gate (main-only public step separately after deployment) |
| laser-release-audit | browser-audit: existing strict render and natural progression release gate |
| story-narration-audit | narration and gameplay-regression ×4 (dream/death-dialog/topology/release), all existing assertions |
| rc166-image-combat | audio: existing complete real-media audio matrix and image/combat preservation units |
| rc170-persona-native-diagnosis | existing native Persona/777/KO/flight/guard/rendered village save/reverse and full audio regression |

Normal push triggers now explicitly include only this candidate branch in these existing validators. Existing workflow files and the shared candidate workflow/QA paths are trigger inputs so CI-only changes receive exact-SHA validation. No workflow_dispatch, elevated contents permissions, token or sandbox changes. Checkout is read-only with persisted credentials disabled. Existing assertions are unchanged.

Not run as candidate validators: source-inspection workflows, historical integration/apply jobs, evidence git-push jobs (including RC127 release/RC132 DREAM prepare/RC130 apply/RC131 integration), old one-off baseline diagnoses with obsolete fixed-runtime predicates. Relevant audit coverage from those integration jobs is preserved above. This is a defined validation set, not an instruction to run all52 workflows.

## Only after all predeployment jobs succeed

1. Recheck unchanged remote main and clean candidate, normal fast-forward Git promotion.
2. Pages build/deploy must succeed on promoted exact SHA; record deploy job completion UTC and KST.
3. Existing automatic published checks: RC126, RC127 published job only (its evidence git-push is not a required validation), RC129 main-only published check, RC130, RC132, RC133 published Pages verification; Canonical published-audio (story/combat audio URLs).
4. RC133 exact hash inventory must include all candidate runtime outputs, notably RC206 Slayer movement body/rig, facing/temporal modules and RC207 inner-final/index outputs. Verify this offline before deployment and check its actual public hash result afterward.
5. Do not call a denied direct Pages URL or forbidden endpoint through an alternate route. Existing normal automatic CI public checks may establish their explicit hash/browser scope. No deployment is complete if Pages or any required public check fails/is unrun.

Browser/fixture/device boundaries remain explicit in qa/rc206/REVIEW.md and qa/rc207/REVIEW.md. CI browser PNG artifacts must be obtained and inspected before a visual-review completion claim; CPU image composites are not browser captures.

## First candidate CI findings (fb378ac)

Normal push produced all12 intended workflows. Failures are retained, not passes: RC144 PC job115691936239 expired after screenshot (count0 at100.8326); Canonical narration job115691935976 missing reload-safe storage fixture; death-dialog job115691936267 has window.localStorage fixture omitted; topology job115691936198 has1052 connectivity failures against current RC175 separated-stroke geometry. RC175 policy intentionally returns separated horizontal/vertical/diagonal strokes (commit634bcd8 onwards); changing this accepted production geometry or silently replacing the one-connected-graph assertion is not part of the fixture repair. Topology remains an explicit unresolved validation conflict.

Test maintenance: parser imports use the existing CI dependency environment instead of the old local /tmp absolute path; RC75 storage success fixture now states persistent/reloadSafe like real successful storage; RC91 window storage fixture is browser-shaped and exact approved cache18601 replaces its stale39301 ordering assumption; RC144 presence/duration/owner assertions observe the actual synchronous rendered death frame while post-screenshot state is separately retained; RC163 manual cult exit is only dispatched while still on cult04, preventing a second portal when native handoff already reached village. All original positive/negative gameplay assertions remain.

Additional fb378ac failures: RC166 job115691935827 and RC170 job115691935775 stopped at the old RC154 loader's extension64 output pin; RC146 PC job115691936082 passed full preservation then stopped at the same historical limit in RC142. These validators now follow the immutable approved65→103 chain, verifying supplied manifest bytes, each preimage blob, final SHA/blob/mode and98 tamper/pin negatives rather than accepting arbitrary new bytes. RC142's obsolete arena16/8.8 source predicate is updated to the already-approved19/10.5/floor31.2 geometry and its actual clipped-area expansion (16.9%), preserving viewport, symmetry and center-gap checks. RC91's unprotected test source remains covered by its original historical digest plus a separately pinned exact before/after fixture migration; arbitrary edits still fail.

RC129 job115691936419 failed before native startup because the configured executable reported No usable sandbox. That browser/executable/permissions were not changed or retried through an alternative to make it pass. This is a real unsatisfied predeployment gate, distinct from game failure.

RC166 latest3eaf637 job115693859913 progressed through the corrected RC154 validator (98 checks) and found the analogous stale anatomy check at extension64/65. Anatomy validation now retains every earlier exact tree fingerprint, folds pinned66→103 including exact deletions, verifies all3358 current files/537 directories, and keeps tampered preimage/output/tree negatives (354 checks passed locally). No runtime art or geometry was changed.

Browser artifacts: successful RC144 run38515312122 on4afd7d06d1b6429080a30395a3e43b7fb6b4b74b registered PC artifact11872251271 (2481934bytes, digest56afce44c3bc0114c835c301c0a696cab4b36acf4217db5582e04e7e52bfc0d9), portrait11872261146 and landscape11871451355. Official artifact download produced a reusable file reference; materializing its exact returned URL in the consumer environment was denied with Tunnel connection failed:403 Forbidden. No alternative route was attempted; local pixel inspection remains blocked. These are a previous candidate's real browser artifacts, not final-SHA visual approval.

Further source contract conflict: story-narration-manifest still requires the old prologue.passing paragraph in live HTML, while the accepted RC181 opening now contains only the current awakening question. Its original audio/manifests are preserved. That failure was reproduced locally and not suppressed by adding a hidden old paragraph or changing immutable source/audio contracts. It remains separate from the pending laser topology decision.
