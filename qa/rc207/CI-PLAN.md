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
