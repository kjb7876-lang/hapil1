# RC189 active runtime correction

Preserved candidate base: 6864f9647d1e7cd28b799b829f1e22edade875db. RC188 reports/originals retained as historical evidence; their zero-damage gameplay applicability claim is withdrawn. RC188 tested the unreferenced combat-v31402/outgoing-native.js. Actual index.html loads combat-v31412/outgoing-native.js and the native React useMemo installs its __HAPIL_OUTGOING_V31402__.create hook. The same global name does not establish file-generation identity.

The HTML-resolved before reproduction and failing assertion are retained here. Active outgoing adapter now gates only hitStarted/hitUntil, damage number and owned hit bitmap on appliedDamage>0. Its phase/core/loop hooks, damage, stagger, combo and lifesteal behavior are retained. The regression resolves index.html script paths, requires one adapter and the active generation, and executes that adapter. Leaving only the old-generation fix fails this regression.

Native bundle index-v31526.js is actively loaded; RC188 weapon timing did reach it. Additional defect: sound preceded projectile admission, so capRejected31221 still produced a release sound. Sound now follows admission and is suppressed on cap rejection and dead source/player. Normal melee whoosh remains separate from accepted-hit feedback; dedicated pattern sounds remain unchanged. Full native release block tests cover ordinary admission, refusal, canceled attackAt, dead source, special pattern exclusion, stationary melee, repeated polling and delayed-circle fallback (one queued hit, no immediate damage). These are controlled CPU fixtures, not real playback or natural combat. Committed projectiles are not canceled on source death; their existing lifetime contract is preserved.

Read-only environment recovery check: /home/agent and .cache are real existing directories but not writable; managed Playwright browser cache and official Chrome absent. No install/launch/permissions/alternate-environment retry.

Enemy behavior variety remains a separate pending bundle. No behavior variety or visual clarity completion is claimed by this correction. Main/Pages/StoryWorld unchanged.
