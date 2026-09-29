# RC75 — boss jellybeans and final awakening audit

- Jellybean bitmap bodies now use each attacker's assigned barrage palette, including low-FX rendering. Small tinted canvases are cached by source and color. Boss theme colors no longer rotate arbitrarily with owner registration order.
- All 64 bullet cards were scheduled and released through the actual danmaku runtime in a Node VM; velocity, release, body rendering, palette use and cache reuse were checked. Existing 64 laser geometry tests cover edge clipping, moving collision geometry, early selection and coverage fields.
- Primary final-battle stage advancement now includes duel/resume after awakening. The existing wrapper fallback still supports older state; the former code was not proven to deadlock because that fallback already existed.
- Awakening accelerates pictured hero projectile routes alongside scheduled strikes, including time-stop frames.
- Ending transition removes hostile projectiles, laser casts, effects and time-stop before returning to the village. Existing completion flags and save calls are retained.
- Browser cache versions for the changed runtime files were advanced.

Validation: 34 non-browser Node regression files pass (32 passed in the suite, the two palette-contract tests passed after updating their fixtures/assertions). Added RC75 tests exercise the real final-phase functions through first defeat, core revival, memory, death, awakening, duel, resume, final defeat and ending persistence calls. Storage and rendering surfaces are test doubles. Node syntax checks and git diff checks passed. No live browser, real audio playback, GPU performance or Windows PowerShell execution was tested in this environment.

Delivery includes RC74 when starting from the verified RC73 tree. No direct GitHub upload was performed.
