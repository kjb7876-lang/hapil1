# RC175 candidate — resonance healing and boss strokes

Base: `7a964d534e79c7d2d052f30a89c088470482fb57`; branch `codex/rc175-boss-strokes-resonance`. No main merge, Pages deployment, new pose, original art or StoryWorld change.

## Behavior

- Held-D resonance healing: 2 → 14 HP/second, ordinary blocked contact 3 → 21 HP, heavy blocked contact 7 → 49 HP. Existing activation, deduplication, growth/resource gain, cap, healing inhibition and death rules retained. No other regeneration/lifesteal changed. The native HP cap can make the observed increase smaller near full HP.
- Active RC32 black-hole range (radius 5) adds raw damage 1 per 0.5 simulation seconds, i.e. raw 2 HP/second. Existing boss laser raw hits are 12–24, so this is a conservative small pressure. Actual loss remains governed by native defense, mode scaling and damage budgets. The center is included, preview is excluded. Per-actor union contact clock prevents overlap and duplicate-frame multiplication. Exiting the area discards partial credit. No retroactive damage after load, clock rollback, pause, time stop or zone change; a discontinuous delta above 1 second resets credit. Owner death/end removes the area; host death removes all holes. Party allies use their native ally reducer. Guests do not simulate damage.
- Boss lasers cycle by owner through horizontal double strokes, vertical double strokes, diagonal double strokes and three crossed strokes. Each committed cast stays stationary; subsequent casts advance the stroke order. Preview, body, tail, contact and automatic evasion consume the same clipped world segments. Curved/ring geometry and automatic topology bridges are bypassed. Native cast admission, charge/active duration, damage and contact budgets remain intact. Width parameter capped at 0.8 for existing blood layouts and main bosses (midboss existing cap 0.7). Existing types/profile keys remain for save validation and cooldown contracts. On-screen warning shows the actual stroke label.
- Black-hole and laser textures are tinted with the owner color using Canvas `color` blending, then original alpha restored; original files and luminance/detail remain. Preview and residual laser texture use the same boss color. Persona RC32 black hole remains `#ed536b`. Existing owner accent is retained for laser warning text/inner highlight.

## Checks performed

- `rc175-resonance-unit`: executes actual channel module and native heal reducer; sevenfold amounts, maximum HP, duplicate frame/contact, death, healing inhibition, zone/hero changes, time rollback and cloned save/world replacement passed.
- `rc175-boss-policy-unit`: DOT 10/30/60/144 Hz gives six raw hits over three seconds; overlapping holes and duplicate calls give identical results. Exit, end/owner death, host death, zone, pause, time stop, clock reset, cloned save and guest fixtures passed. Defense adapter fixtures show packets stay delegated to native incoming damage; these are not real dodge/parry gameplay observations.
- Actual RC32 install/tick wrapper exercised in a VM with minimal browser API fixtures: boss color, Persona red, native damage adapter, zone/death cleanup passed.
- Straight geometry remains identical across warning/fire/tail samples; horizontal/vertical/diagonal slopes and open arena sample coverage passed. Owner stroke cycle remains unchanged by repeated configuration of the same cast.
- RC171 defense cue unit passed. RC173 native enqueue/scatter/bounce unit passed: 112 volleys, angle span 0.96 radians, existing three-return rule preserved. The first invocation lacked the configured Acorn dependency; rerun used the already installed `/tmp/rc163-unit-deps/node_modules` and passed, with no installation.
- RC174 body pixel unit passed: 123,220 checks, 24 landmarks, 97 independent metal pixels. EGO art unit passed: 501,428 checks, four pinned originals, 9,062,472 derived pixel bytes.
- Syntax checks passed for all changed JavaScript. Exact runtime preservation extension 72 lists five authorized runtime files and chains to extension 71.

## Limitations

Chrome installation remains blocked by HOME/cache write access. No browser was launched, no browser installation retried, no real input/video/screenshot, natural progression, accepted-hit count, mobile emulator or physical-device validation performed for RC175. Canvas owner tint, laser appearance/avoidability, real native DOT defense feedback and performance require a normal sandbox browser. This is a local candidate, not a deployment-ready claim. The native save contracts are preserved by the exact inventory check; save/load tests here are VM world-replacement fixtures, not an end-to-end save UI test.
