# RC137 independent native boss skill lifecycle

The next named spell no longer deletes previously released native bullets. Original ordinary/telekinetic casts, personalized laser cards and finales preserve earlier recovery/emission deadlines when a shorter later cast begins. Already committed dynamic, spectacle and finale attacks survive owner HP-phase changes. Native actor death, player death, rewind and zone-exit cleanup remain; finale encounter dialogue now suspends its clock instead of cancelling the cast.

Concrete original failure paths:

- RC129 `clearOwned(..., 'spell-complete')` removed released ordinary bullets at a live spell transition. Spell transitions now change admission only; native contact/world-boundary retirement still owns those packets. Explicit owner exit removes future pending deliveries as well as ordinary owned bullets.
- Native `Ei`, personalized laser `configure`/`startCustom`, and finale `start` overwrote earlier recovery/ready/emission deadlines with a shorter new deadline. They now take the maximum. An expiring card also cannot clear the presentation of a longer same-name card.
- Dynamic and spectacle native paths cancelled committed warning/damage packets on generic suppression or HP-phase change. Their admission guards remain; committed attacks retain their own owner/zone checks. Dynamic packets now capture their origin zone explicitly. Generic temporary suppression suspends spectacle warning time, as cosmic/danmaku already do.
- Finales removed every committed cast during encounter dialogue and discarded warnings/drawing on an HP-phase change. They now suspend dialogue time and keep committed casts through HP phases.

`tools/apply-rc137-boss-lifecycle.cjs` reapplies only these native bundle anchors, idempotently, for union integration. The RC129 companion source edit is independent. There is no new tick loop, registry, draw work, timer pool, damage reducer, art, audio or projectile shape.

## Verification

`node tests/rc137-boss-lifecycle-browser.cjs` passes desktop and mobile portrait Chromium, 856 checks per profile, no page errors. It exercises actual authored native producers and reducers, with staged simulation state and native arena renders. It does not claim natural full-campaign clears.

- 71 latest owner rows inspected: 70 hostile native owners cast two RC95 salvos; the protected RC89 `kair-great-03` command body is correctly excluded. Prior warning/release/damage/nominal-expiry clocks and packet objects survive the next salvo.
- A native late salvo crosses the next RC129 spell boundary and coexists with the next authored blood laser. Both native contact reducers deal damage; laser recovery/expiry preserves prior bullets.
- 37 latest authored ordinary/telekinetic native casts preserve previous recovery/emission clocks.
- 29 admitted dynamic producers, all four spectacle producers and 71 native finales retain committed warnings through owner phase changes; staged death/zone/dialogue cleanup is checked.
- Retaining old packets fills, but never exceeds, existing RC95 admission budgets: 56 desktop / 40 mobile. A full budget refuses additional projectiles and retains the oldest admitted salvo.
- All six source-owned RC87 Cosmic finales are constructed through the real `beforeDeath` and `startFinal` APIs, using source IDs and `episodeCosmicFinalV387`. Their latest authored blood cards reach native damage/contact after subsequent native projectile emissions and HP-phase changes, preserve recovery and end without deleting other packets. The six IDs are `b09-boss`, `u203-boss`, `l303-boss`, `k103-boss`, `h103-boss`, `mb-murder03`.
- Actual Lucifer mask death constructs `a11-cosmic-v31318` with `cosmicLuciferV31318`. Its authored 3.8-second `피의 천문 · 혈광 소멸포` retains its warning, immutable packet identity and contact geometry when the next arsenal action is requested. Native abyss projectile emission coexists; native cannon damage/bitmap release and recovery complete after a phase change. The arsenal intentionally admits one heavy action at a time; a second heavy action is deferred, not forcibly overlapped.

The native game intentionally treats `expiresAt` as nominal. Live shots retire at contact/world boundaries. The flight check uses actual `MONGSE_stepSignatureProjectile31212` movement and `MONGSE_shouldExpireBossProjectile31213` terminal/removal publication, not a nominal-lifetime filter.

Additional passing regressions: RC95 flow smoke; RC127 policy (174 checks); RC130 isolation (28 checks); RC129 unit (19,341 checks); bundle syntax; diff whitespace; idempotent native patch reapplication.

## Evidence and limits

`qa-results/rc137-lifecycle/results.json` contains exact native owner/card names, warning/fire/end/recovery clocks, source flags, contact counts, HP losses, transaction rows, admission budgets and problems arrays. PNGs show native desktop/portrait arena renders for every tested Cosmic form, plus dynamic Lucifer warning, release and end. Screenshots render an injected staged world through the actual arena renderer; surrounding HUD remains the separately running startup scene and is not evidence of natural traversal.

Independent normal lifecycle behavior is tested here. Intentional Samong awakening sealing/unsealing belongs to the parallel rules integration and must be tested on the union build. This branch does not alter awakening seal damage gates, preservation pins, canonical documentation, publication/main or deployment.
