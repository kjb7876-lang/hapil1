# Full-auto final damage balance

The authorized control setting `full` now applies incoming final damage ×0.10 and outgoing player-owned attack damage ×1.70. `manual` and `semi` retain their same-build damage. The reference build is `59f5381c046cb4b2416a97c704f34770e887602d`.

`assets/combat-v31402/combat-core.js` captures `controls.effective()` when a native transaction opens and records the baseline amount, factor, and final amount in its transient journal. Repeated calls in a shared player/ally transaction reuse that amount. No multiplier is stored in the actor, growth passives, or native save.

In `assets/index-v31526.js`, incoming contacts and companion contacts apply the policy after existing budgets, armor, heart packets, damage floors, mobile protection, and mode buffs. The separate bleed, burn, and poison ticks use a `STATUS` transaction after their existing reduction. This keeps the prior status presentation/audio behavior. Outgoing attacks apply it after native damage scaling, balance, awakening, and RC108 factors, before the existing health/phase gate. The native downstream burst cap admits damage in its original units, then applies the captured factor; spent window budget remains in those original units across toggles. Source ownership and attack delivery remain native.

The multiplier changes potential final damage. Existing lethal HP clamps, protected objectives, phase transitions, invalid packets, defense, and attack deduplication still control whether that amount is committed. Native self-HP skill costs and execute-to-one mechanics retain their authored behavior. The hidden encounter's health and growth use permanent passives and its unchanged DPS estimator; they never read the multiplied damage journal.

Only the core, active bundle, and their loader cache keys change among runtime files. The exact outputs are authorized in `qa/rc133/authorized-runtime-delta.json`; the preservation guard, RC133 compatibility guard, and RC128 migration check share its exact digest. All historical preimage and baseline-guard pins remain unchanged. TTS86, audio, current art, damage geometry, actor stats, and global boss HP remain protected.

Reproduce with:

```sh
node tests/rc134-fullauto-balance-unit.cjs
node tests/rc134-fullauto-balance-browser.cjs
node tests/rc134-fullauto-natural-browser.cjs
node tools/rc133-preservation.cjs
node tests/rc128-candidate.cjs
```

The browser fixtures pair the actual before/after native reducers on PC and a portrait touch profile across Story/Dream, all three controls, existing buffs/awakening, native 777 mastery, projectile/laser/melee/skills/status/companion/collaboration/reflection sources, native rehit rejection, effective-mode toggles, serialization, guest authority, and hidden health/growth. These are staged damage fixtures. The separate natural test launches through the title and changes full-auto through Settings, then requires real first-map combat and normal portal progression in Story and an already-unlocked Dream profile. Neither test claims full-campaign completion or physical-phone performance.

Exact-run results and screenshots are recorded under `/workspace/hapil-deliverables/RC134-fullauto-balance/`. Exact integrated runtime `ad98bd3d611bf44c9f484d9392f16919a9019fca` passed the unit and paired browser suites and its dedicated CI damage/natural/RC128 jobs. A longer fresh unassisted Story run reached ep1b02 with no death; an already-unlocked Dream run reached Balrog then died/restarted normally. Exact ad98 native Continue subsequently advanced Story to ep1b03 and made six Dream zone advances across two authored deaths. The stricter six-minute Dream count-above-source requirement failed and remains recorded; a full fresh unassisted Dream campaign is unverified. Factors and native source-save provenance passed with no held defense or combat/progress edits. See [integration.md](integration.md) and `/workspace/rc133-tools/rc134-integrated-natural/assessment.json` for exact scope and failures.
