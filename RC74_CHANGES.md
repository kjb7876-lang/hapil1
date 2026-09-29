# RC74 — crescent direction, recorded opening subtitles, boss skill lifecycle

Base content: RC73 tree `9e73c5e00f5898eaafc341e367d6ec98f4e7338f`.

- Removed the RC69 canvas circle/ellipse drawn over Slayer's basic projectile.
- The Slayer A bitmap's authored convex front points left. Set its intrinsic heading to PI in both native and delivery/presentation paths so its convex edge leads toward the target in every direction.
- Restored the opening two cards from the uploaded audio transcripts, with standard EGO/name spelling. Removed the extra silent map prose from these two voiced cards; subsequent map narration is preserved. The journal opening uses the same text. Audio files are unchanged.
- Ordinary committed boss-skill transits now take 0.9–1.8 seconds (distance dependent), with their queued impact time set to the exact pictured arrival. Dedicated lasers/snipe/projectile bodies remain on their own timing paths.
- Removed visual admission caps and active coverage eviction that hid committed attacks or erased earlier skills when another volley arrived. Mobile still reduces per-effect image stamps through the existing frame renderer.
- Boss/midboss impact imagery lasts 1.3/1.1 seconds and then expires. This extends impact presentation, not the damage scheduler. The existing contact and terminal-effect pipelines remain active.
- Updated cache keys, generated card text, and regression checks.

Validation: non-browser Node regression suite; targeted 70-flight/80-impact lifecycle and timing cases; four-direction sprite axis checks; all referenced assets; syntax and diff checks. Windows PowerShell and live browser rendering were not available in this environment. No zero-bug guarantee is implied.
