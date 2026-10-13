# RC188 applied-hit VFX and basic weapon sound timing

Preserved base `cca29a3827ed69e441ef09c5300acc7a737f6bcf`; new candidate branch `codex/rc188-attack-vfx-behaviors`.

Before reproduction (`before-reproduction.json`): real outgoing reducer + combat core with appliedDamage=0 leaves HP100 and REJECTED, yet sets hitStarted10/hitUntil10.17, adds one number and one owned impact image. With appliedDamage5 it similarly adds one cue and actually loses5 HP. Only hit timers, number and owned hit image creation now require appliedDamage>0. Damage formula, counter gate, stagger, combo, status/phase and growth arithmetic remain unchanged. Positive-hit behavior remains one cue. Actual feedback/audio journal already ignores REJECTED/zero applied damage and remains authoritative; this fixes the older separate bitmap/hurt-timer path.

Before audio reproduction (`audio-before.json`): actual normal attack start prefix calls the existing weapon SFX at time10 while fireAt is10.8. Existing sound call now occurs in the actual normal attack release branch, once after windup, keeping the original file, volume and cooldown. This is a weapon-release sound, not an assertion of player damage. Dedicated spell charge/accepted-hit audio remains unchanged. Canceled windup no longer forecasts the strike sound.

CPU regression executes actual outgoing/core and start/release prefixes. Zero damage has no hurt timer/number/bitmap, positive damage keeps them, and original stagger/combo values are equal. Audio release fires at its real deadline once; cooldown unchanged. Defense cue and feedback regressions pass. No actual playback, real screen, natural progression or device evidence. Browser/cache restrictions were not retried.

Design reference: Riot's official [Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/) emphasizes alignment of gameplay, visuals/audio, hierarchy and low noise, plus readable projectile direction. Applied here by correcting timing/eligibility rather than adding particles, size or shake. No claim that these CPU checks establish visual clarity in actual play.

Exact extension85 chains to84. Main/Pages/StoryWorld untouched. Enemy behavior expansion proceeds as a separate small bundle; no new images or unprovided action frames claimed.
