# Natural Dream reset diagnosis

The original 29.47-minute Dream attempt at `1d17a7bba5594c84c5d88360d9132c105254df0b` remained in dist00: 343 samples, no completed zones, 18 boss HP returns of at least 5,000, and no JS/HTTP errors. Five-second sampling missed the lethal frame; it does **not** establish that the player stayed alive.

Forwarding-only telemetry on the preserved, naturally unlocked save captured three real deaths in 39.4 seconds. Solo `shouldRespawn` accepted HP <= 0, RC59 restarted Episode 1-A at dist00, and the native loop restored player HP and created a fresh boss. Boss regeneration/phase changes alone did not cause these resets. The native death checkpoint policy is preserved.

Two recoverable defects were observed:

- Weak exiting projectile bodies use 8% of the original damage, bounded to 1–12 base damage. Their freshly assigned exit IDs also received a new 10%-max-HP heart bonus and major-owner raid modifiers/leech. Two different exit groups each requested damage 1 and applied damage 50 in the same frame. They now retain ordinary bounded weak damage and geometry, with no new major-attack modifiers or heart bonus. The existing once-per-group ledger is unchanged. Normal boss body/laser/ultimate floors and heart bonuses remain.
- On same-zone death restarts, old `bossLaserCastsV31330`/`bossUltimateCastsV31334` survived and resolved the newly created actor with the same ID. A candidate reproduction captured laser ID56 damaging the old fight at gameTime4.1968, then again killing the newly restored player at5.3968. Zone entry and respawn now clear these casts and reset RC95/RC129 encounter admission clocks. A live uninterrupted encounter still finishes its casts normally.

`tests/rc133-exit-damage-browser.cjs` labels its constructed states as staged. It uses actual native weak-exit/player reducers and RC59 restart paths: STORY/DREAM weak contacts, one-group duplicates, independent groups, preserved boss body/laser/ultimate floors and leech, fresh native roster, discarded old casts/clocks, and preserved EGO count. A staged Dream unlock is confined to that browser context.

Local detailed telemetry remains outside the repository:

- `/workspace/rc133-tools/natural-campaign-continuation/dream-reset-loop-report.md`
- `/workspace/rc133-tools/dream-reset-diagnosis/report.json`
- `/workspace/rc133-tools/weak-exit-cleanup-natural/report.json`
- `/workspace/rc133-tools/weak-exit-candidate4/exit-damage-results.json`

The cleanup-only candidate still observed legitimate combat deaths. These fixes do not establish a completed natural Dream campaign or hidden-final victory. Continue from the retained natural save and report any remaining combat blocker; do not inject HP, enemies, unlocks or route progress to claim a natural completion.
