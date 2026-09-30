# RC87 episode Cosmic finales and apostate art audit

## Findings

- The six Kair Great/Cosmic bosses already existed as authored actors with distinct three-phase patterns and signature decks. Their uses were confined to Dream's regional encounters and Samong's final skill; normal episode progression did not have a post-major-boss Cosmic route. That missing per-episode trigger/clear integration—not missing boss content—was why they never appeared as episode true-final bosses.
- The cult03 apostate actors are Han Rian (`c103-mid`) and Baek Ion (`c103-boss`). RC79's later, generic hero-pose renderer could select legacy Rian/Ion hero sprites again, and the RC86 visual route had to override it after the core bundle. Merely matching the idle portrait was therefore not enough to establish image consistency.
- Part 7 (`murder03`) has no authored full boss at its final story map; its named rooftop guardian (`mb-murder03`) is a midboss. RC87 uses that final authored encounter as the trigger and then promotes the following Cosmic into the actual map-clearing boss.
- A completed finale record used to suppress the next episode's trigger when the same game state continued across maps. Finale records now apply only to their own map. A late-session combat save also used to preserve an absolute signature timestamp; restoration now rebases the remaining delay onto the restored clock.

## Episode order

| Story part | Authored encounter | New true-final boss |
| --- | --- | --- |
| 1 | `a11-boss` → existing masked Lucifer | Existing post-mask Lucifer retained |
| 2 | `b09-boss` | `kair-great-01` |
| 3 | `u203-boss` | `kair-great-02` |
| 4 | `l303-boss` | `kair-great-03` |
| 5 | `k103-boss` | `kair-great-04` |
| 6 | `h103-boss` | `kair-great-05` |
| 7 | `mb-murder03` rooftop guardian | `kair-great-06` |
| 8 | `c104-boss` Samong | Samong remains the final boss; his separate six-Cosmic summon skill is retained |

The new episode finales use the original Cosmic actors and signature patterns. The normal map exit, clear reward, and EGO reward remain blocked until the Cosmic is defeated. Its image set is promoted into that episode map's eager asset plan. Dream mode keeps its existing six regional-boss gauntlet, and part 1's masked-Lucifer transition is unchanged.

## Apostate image consistency

For both `c103-mid` and `c103-boss`, the portrait, base sprite, phase sprite, phase fallback, all active action slots, and death pose now resolve only to that character's paired idle/action artwork. Both poses share the same full-canvas foot pivot, and the renderer routes are audited against stray image paths so late generic pose hooks cannot silently restore the Rian/Ion hero sheets.

## Verification

- `tests/rc86-samong-cosmic-smoke.cjs`: canonical apostate pose paths and shared sprite metadata, plus the separate Samong six-summon route.
- `tests/rc87-episode-cosmic-smoke.cjs`: all six episode triggers in one continuing state, true-final map-clear gates, native signatures, asset promotion, late-session save/restore, and Dream/part-1/part-8 isolation.
- Chromium integration passed for `rc86-samong-cosmic-browser.cjs` and `rc87-episode-cosmic-browser.cjs`: all six native signature decks, the complete Samong summon cycle, 14 loaded combat bitmaps, canonical apostate image fields/pivots, continuing episode progression, and zero page errors.
- The real serializer, save normalizer, enemy restorer, and entry restorer preserve the active Cosmic's HP and exit lock. A save at time 3600 with 4.25 seconds until its next signature restores at time 100 with the next signature at 104.25.
- `rc85-combat-browser.cjs` passed on the updated bundle: the first battle cleared in about 19 simulation seconds with a player-survival fixture, advanced through its post-combat story, rendered a textured laser, and retained all 28 canonical Slayer direction/action poses without page errors.
- The Windows uploader runs all 44 non-browser tests and JavaScript syntax checks before pushing. It creates a separate working folder, verifies the embedded patch checksum and resulting Git tree, checks that GitHub main is still the verified RC85 base, and uses a normal push.
