# RC133 gameplay audit, updated after complex fixes

Runtime checkpoint: `5b53fe38489c01d746bf7fb84f61659795276e3e`. Prior Luna inventory at `f9eb30d3` found separately active charge systems; this document now reflects the repaired runtime. See `release-status.json` and `evidence/5b53fe3` for evidence.

| Path | Final behavior | Evidence |
| --- | --- | --- |
| `MONGSE_tickBossGapCharge31226` | Boss/midboss bypass; clears charge state and only that owner's flagged pending/impact charge packets. Noncharge packets remain. | Native browser charge/cooldown fixtures |
| V31315 `profile/enqueue/onImpact/tick` | 29 eligible ranked owners, 22 cross/7 safe profiles; dash request converts to cross. Old impact movement and dash map advancement removed. Stationary warned attacks retained. | 29 native profiles staged per viewport |
| Wrath `MONGSE_scheduleWrathBossSequence` / tick | Ignition line and rage timing retained; no boss coordinate jump. | Native phase fixture and RC132 post-defeat portal regressions |
| Signature names `dash-trail-converge`, `six-image-charge` | `MONGSE_signatureGrammar31212`/followup generate projectile choreography, not actor movement. Retained as nonmoving attacks. | Source ownership audit; no claim every deck played naturally |
| Turret charge / player A charge | Different owners, preserved. | Source scope audit |
| Cosmic/persona movement | Stationary actor anchor enforced through final brain, navigation and Stand tick. Preserves all nonmoving casts. | Three owner-flag fixtures; original cosmic source art remains deferred |
| Near-player warp | Safe endpoint, cast/time/authority gating, 0.55s warning, shared3s cooldown and one reservation through deferred casts. | Terrain/hazard rejection, concurrency/dead-owner tests |

The runtime roster contains42 authored midboss zones; `ep1a07` is retired and its saves migrate to `ep1a08`. The41 current zones (Dist1–6, Ep1A8–11, Ep1B1–6/6b/7–9, U201–206, Last302, Kair01/04/08, Hando01–03, Murder01–04, Cult01/04–06) were staged through native initial entry or native delayed wave factories in Story and Dream. Story now admits2, Dream3. Living encounter IDs/health/visual-source references survive save/load; defeated members do not refill. Same-arc distinct sprites are preferred; single-template arcs use nearest authored alternatives, pinned by the existing loader. This is not full natural progression through41 zones. Cult03's authored special pair remains a boss encounter, not an ordinary midboss group.

The native humanoid core is the target, with .72 hit radius independent of Stand phase; the front body uses122 size and a stable anchor while the Stand is auxiliary. Representative cult leader phase0–3 confirmed. This does not certify all body art pixel dimensions or future uploaded sprites.

Native defensive transactions produce expected labels for invulnerability, blink, automatic dodge, Samong grace, D parry and shield; skill removal emits once;80 laser contacts coalesce to one output effect. Feedback unit68 covers contact misses/zero damage suppression, source intervals, burst queue<=32 and output-gate bookkeeping. New UI/counter/persona tests are staged separately from the natural desktop first-boss portal run.
