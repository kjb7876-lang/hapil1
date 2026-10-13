# RC185 visual-cache and retry keyboard refinement

Retains RC184 ending save/pause fixes. Source review found that alternating bosses sharing a black-hole source image replaced the single cached tint every draw. Tint results now use an LRU across image+owner color, limited to eight entries and 4,194,304 source pixels (16 MiB RGBA backing, excluding GPU/source images). Oversized tints are rendered full-size but not retained. Color-blend operation, luminance/alpha mask, source pixels, dimensions and damage/patterns are unchanged. 1,000 alternating red/green lookups allocate two canvases in the CPU fixture rather than repeatedly regenerating them. Cache limits/evictions and null/not-ready inputs pass; this is not actual Canvas pixel or GPU timing evidence.

Native keyboard controls call preventDefault before their blocked check. Retry dialog therefore owns capture-key behavior: Tab cycles its two buttons, Enter/Space invokes the focused button, Escape dismisses, and propagation is stopped before native controls consume the action. Actual callback/retry integration now exercises Enter activation. Other ending/startup input policy remains. No real browser keyboard/assistive-device claim.

Locally inspected existing RC174 before/after and normalized-foot composites (not game screenshots). Hood/boot/tip preservation remains; missing cloak layer pixels cannot be recreated from the flattened sheet. No pose enlargement, extra shake, original asset overwrite or speculative cape trimming added. EGO body still requires actual browser review.

Native DOT/production laser clipping and boss-policy regression pass. Extension 82 lists three runtime files and chains to 81. Main/Pages/StoryWorld unchanged; Chrome restriction not retried.
