# RC178 ending heading position

Base `8f1365014c17d73c49971ad2173ab7cde9e9a8a7` preserved on RC177. The shared helper accepts an optional insertion anchor; existing headings are moved only when that anchor is explicitly supplied. Ending supplies its original prose paragraph, producing kicker → h1 → h2 → `누군가의 기억:` → original p. Other surfaces retain prepend behavior. No prose, TTS inputs, recordings, story/save fields or combat values change.

Actual ending selector executed against the real kicker/h1/h2/p order in minimal DOM fixtures: ten repeat updates, one heading, unchanged original paragraph/TTS, and migration of an earlier heading from the card top all pass. RC177 story/journal/ending regression passes. Browser/layout/audio unverified; blocked Chrome installation was not retried. Only helper, ending call and two HTML cache keys change at runtime. Exact preservation extension 75 chains to 74. No main/Pages change.
