# RC177 narrative memory framing

Preserved base `50fe9e866852188ac1fb29a60893e0ae84703966`; new branch `codex/rc177-memory-narrative-frame`. Main/Pages/StoryWorld untouched. All prior EGO, DOT, resonance sevenfold healing and straight-laser runtime remains byte-identical except HTML cache additions needed for this display module.

The exact heading `누군가의 기억:` is inserted as one separate display div before narrative prose through a shared idempotent helper. Applies to the common RC51 pre/post/first-post/awakening story card, patient narrative journal body (all tabs/rebuilds) and ending-title narrative. Original titles, first-person body/monologue, raw records, story progress/save fields and audio files are unchanged. HUD, buttons, skill descriptions and the scripture death card are excluded. This is framing, not a rewrite into third-person prose.

The helper does not modify text input. RC51 passes original `text` to narration and existing opening/root recording selection is unchanged. Journal narration still collects only `.patient-text` paragraphs; ending narration still reads its original paragraph. The separate div is outside both selections. Heading is display-only, so existing recordings/TTS neither repeat it nor omit body text. No new speech generation or audio timing change.

CPU tests execute actual RC51 show in four phases with three reopened/cloned world fixtures each; exact paragraphs and narration input remain equal and repeated calls yield one heading. Actual journal/ending selection functions execute against minimal DOM fixtures, including journal body reconstruction; exact narration text and one heading remain. Shared helper tested with 100 repeated calls. These are DOM/VM fixtures, not a real browser or end-to-end save UI test. Original audio path/player source is unchanged; no audio playback was claimed.

Exact preservation extension 74 lists only four protected runtime files and chains to extension 73. Chrome/cache access remains blocked; installation and browser were not retried. Actual layout, screen fit and assistive/audio behavior await a normal sandbox browser.
