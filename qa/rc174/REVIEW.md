# RC174 source-only body repair

Baseline preserved: `184f4a44179241989c97a54ee58b521d00bb395f`. Public main is unchanged. No new attack pose, source PNG edit, browser restart, download retry or deployment.

The three audited poses are zero-based walk2, attack2 and attack3. Original RGBA was decoded from the received original sheets, then compared at crop, ownership and exterior-matte stages. See [fixed coordinates](PIXELS.md), [machine-readable stages](pixels/pixel-stages.json), [before/after alpha composite](before-after-composite.png) and [90px foot-pivot preview](normalised-foot-pivots.png). These are local static composites, not game/browser screenshots.

## Proven losses and repair

- Walk2 boots/shin and attack2/3 boots were present in the original and after ownership, but their alpha became zero during the neutral exterior-matte flood. Source-coordinate hood/leg/boot protection restores these pixels without recoloring or painting them.
- Walk2's independently identified bright sword tip had 51 pixels outside the old fixed-cell crop. Attack2 and attack3 had 15 and 9 bright tip pixels rejected by their inaccurate ownership guides. Correct curved blade guides and expanded source rectangles preserve the original tips.
- Walk2 and attack2 have visible outer cloak pixels beyond the old cell boundary. Source-coordinate ownership regions retain the verified plume and lower feather areas. Pixel `[665,391]` is preserved for attack2 and excluded as the neighbouring cape in attack3; attack3's own boot `[714,413]` remains exact. Neighbouring hood/weapon fringe, boot and upper plume fragments are excluded separately.
- A proposed right-side cape extension was rejected after the source delta exposed the neighbouring frame4 hand. Frame3 does not copy that hand. This prevents crop expansion from silently importing another actor.
- New crops are walk2 `[418,90,293,314]`, attack2 `[376,109,347,347]`, attack3 `[642,109,310,347]`. All expand the previous source coverage; none shrink it to conceal missing anatomy. Cell-relative protection now includes the vertical crop offset.
- Supporting-foot source pivots are `[520,383]`, `[530,418]`, `[750,418]`. Uniform body-height denominators are 280, 308 and 296. Scale is uniform and based on original anatomical height; it is not used to fill missing pixels. Attack3 keeps its existing horizontal mirror for screen-right facing.

All retained RGBA remains exact. The original sheets, approved standalone walk3 and its alpha>=2 pixels remain unchanged. The 12 other original atlas masks remain byte-identical to the prior audited compositor. Corrected foreign-weapon guides are scoped to the three repaired poses so they do not modify neighbouring directions.

## Source limitations

The atlas is a flattened picture, not separate actor layers. Frame2's lower feather overlaps frame3's forward red cloak within the source band polygon `[[640,337],[651,356],[666,382],[681,408],[705,443],[697,449],[683,439],[662,410],[650,384],[638,359]]`. After excluding frame2's visible feather from frame3, an underlying frame3 connection cannot be recovered where that feather covers it. It has not been repainted, enlarged, or hidden with a smaller crop. Some fragmented original cloak wisps remain visible.

The frame3/right-side region around `[895..915,266..303]` includes the neighbouring frame4 hand rather than a recoverable extension of frame3's cloak. It was not used as additional body pixels. A separate actor layer or exact original-pose restoration would be needed to recover genuinely covered pixels; a different stabbing pose is not a substitute.

## Local verification

`rc174-body-pixel-unit`: passed, 123220 checks, 24 fixed landmarks and 97 independent bright-metal pixels. Every retained pixel in the three repaired outputs is compared against the immutable source. The source/foreign cross-frame tests distinguish the cloak from the boot.

`rc155-ego-art-unit`: passed, 501428 checks. Original SHA pins, all other direction outputs, approved walk3, owned projectile rendering and pixel budget are covered. Derived backing remains 9062472 bytes, below the existing 9 MiB budget.

No actual viewport clipping, mobile device, motion transition, natural progression or real damage/evade/parry scene is claimed by these local checks. Those browser/game checks remain pending.
