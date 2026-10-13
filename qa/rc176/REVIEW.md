# RC176: black-hole DOT combat lock correction

Preserved parent candidate: `634bcd8e646ccdac4e6abded15c58a08ed132713` on `codex/rc175-boss-strokes-resonance`. New branch: `codex/rc176-blackhole-combat-lock-fix`.

Removed `__HAPIL_BATTLE_ARENA_RC138__.locked(s)` from the DOT suppression predicate. RC138 defines this as a living player's exit lock while combat is unresolved, not a simulation pause. RC175 therefore suppressed DOT in enabled live boss encounters; its previous fixture omitted RC138 and missed this defect. Genuine pause, modal, phase, blocked input, hidden document, reading, time stop and cooperative authority checks remain.

`tests/rc176-blackhole-arena-integration.cjs` executes the actual RC138, RC32 and RC175 modules in a VM. RC138 is bound to a combat fixture zone, its real `locked(s)` is asserted true with a living boss, and the actual RC32 tick wrapper produces one native damage packet after 0.5 seconds. Pause, modal, phase/menu, blocked binding, hidden document, reading, zone change, death, leaving the area, owner death and effect end prevent DOT. Resumed contacts discard old partial credit and start a fresh half-second interval. Zone/death/ownerDeath/end clear the actual effect list.

The native damage adapter is a fixture; no browser input, real accepted damage/defense behavior, screenshot, device or natural progression was tested. Chrome/cache access remains blocked and was not retried or bypassed. Existing RC175 healing, frame-rate/overlap and straight-stroke tests passed unchanged. The policy predicate, narrow native DOT-only combo/lifesteal branches and both module cache keys change at runtime; exact preservation extension 73 chains to 72. No main merge or Pages deployment.

Additional native-path correction: only packets tagged `blackHoleDotRC175 === true` preserve combo/comboUntil and skip the native boss lifesteal suppression block. They still traverse actual `Y`, combat core, incoming defense, rehit ledger, damage budget, HP mutation, accepted-hit journal and existing hit feedback. Ordinary direct boss packets keep combo reset, 4.8-second suppression and 0.55 multiplier. No direct HP write was added to the DOT policy.

`rc176-native-dot-and-clip.cjs` extracts and executes native Y, contact reducer, hostile identity/rehit ledger and damage budget, plus actual combat core/channel and RC138. DOT reduces HP through that path; repeat DOT does not reset combo or create/extend lifesteal suppression. Direct boss damage retains both side effects. Actual invulnerableUntil, perfect-dodge lastDodgeAt and held-D channel states prevent HP loss. Other optional gameplay services, presentation callbacks and configured physics constants are fixture dependencies, so this is CPU integration evidence rather than complete gameplay validation.

The same test executes production laser map clipping at nine cast-center combinations and four stroke modes (36 layouts). Endpoints remain in [1.1,30.9]; more than half the 225 sampled world-grid positions per layout remain outside the projected beam/body width, including the existing 1.18 complex-width factor. This provides geometry evidence, not real camera/bitmap collision or practical input/avoidability evidence.

No real browser defenses or gameplay rendering verified.
