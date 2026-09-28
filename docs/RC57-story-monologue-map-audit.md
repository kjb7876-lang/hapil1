# RC57 story, map, and enemy alignment

## Source and presentation

The active story now uses `data/rc57/voice-monologue.txt`, the byte-preserved user upload (SHA-256 `b7d620e27e9a4d44e0b170f2980047642bcc03b5460b1f8ddcb62ed1040d4add`). `data/story-rc51.js` is rebuilt from it with the spelling and spacing corrections previously requested; no new character dialogue or replacement plot was added.

The 56 combat maps each show a monologue before and after combat. The opening voice 1 text is on the first map's pre-battle card and voice 2 is on its post-battle card. Each of the six rest sections appears before the next combat map. The empty `[08-삭제된기록]` marker stays empty; `ep1a07` receives the two fall-memory paragraphs that continue `[07 · dist06]`. The final `cult04` encounter keeps its two stage-transition cards for the defeat/recollection and samong awakening.

The active reading card is still a no-scroll dialog with a 900-character budget. The generated story currently has a longest card of 825 characters. In STORY mode, encounter and rest exchanges are cleared before rendering, and their stale intro lock and enemy delay are removed once at entry. The episode archive and interlude resolver also use the uploaded monologue source, so the old back-and-forth text is not an alternate story view. The previously restored Christian opening scene remains ahead of the map sequence.

## Route and narrative alignment

| Route order | Uploaded monologue | Map and enemy fit |
| --- | --- | --- |
| `dist00 → dist01 → dist02 → dist03 → dist04 → dist05 → dist06 → ep1a07` | Demonized palace garden; spider angel; horn demon and dead comrades; ruined castle; seven pillars; Balrog; collapse and fall. | The first eight fights stay in the medieval fantasy memory. `ep1a07` is the fall aftermath, not a modern city map. Balrog remains the `dist06` climax. |
| `ep1a08 → ep1a09 → ep1a10 → ep1a11 → dreamRest` | Hospital restraint and hallucination; injection-room craving with a palace flashback; diagnosis and treatment; Lucifer and the priest candidate. | The enclosed bloodied ward with the interior “HELP ME” wall is appropriate at `ep1a08`. `ep1a09` starts in the hospital and then recalls the earlier seal rescue; the pre/post cards preserve that shift. |
| `ep1b01 → ep1b02 → ep1b03 → ep1b04 → ep1b05 → ep1b06 → ep1b06b → ep1b07 → ep1b08 → ep1b09 → restEp1b` | The Solomon system and seven-sin cases, followed by the biotech bootloader and the missing returner. | The school, house, hotel, kitchen, stage, vault, snowfield, fire, pride, and biotech settings follow the source sequence. Each hostile is a dream or system manifestation; the client or patient is not framed as an ordinary enemy. |
| `u201 → u202 → u204 → u205 → u206 → u203 → restU2` | The defense legion's stages 1–17, then the memory door. | The nonnumeric order follows the section labels: `u201` covers stages 1–4, `u202` 5–8, `u204` 9–12, `u205` 13–14, `u206` 15–17, and `u203` is the final memory door. Enemies remain machine/control constructs rather than the traumatized child. |
| `last304 → last305 → last301 → last302 → last303 → restLast3` | Neutral borderland; goblin leader and rose seal; fallen-angel defeat; sleepless port; insomnia demon. | The route follows the narrative rather than ID order. `last302` uses fog residue, black spirits, and a fog core; its midboss is the Black Fog Heart. `last303` holds the named Bulmyeongwi boss. No ordinary resident enemy sprite is used. |
| `kair01 → kair04 → kair05 → kair06 → kair07 → kair08 → kair09 → kair10 → kair02 → kair03 → restKairo` | The academy, time harvest, overlapping command layers, workshop, neural gate, forgetting cemetery, collapse rite, Arbellea, and Siren Mor. | The deployed roster remains 48 ordinary wardens, 12 upper wardens, and 6 great wardens (66 total). The route's nonnumeric order follows the authored progress from the academy to the Siren core. |
| `hando01 → hando02 → hando03 → restHando` | The summoned priest and two masters; the masters take back their choices; the shared EGO core is recovered. | The castle defense and corrupted nightmare usurper fit the source. The two masters remain story allies and are not added as selectable heroes or enemies. |
| `murder01 → murder02 → murder04 → murder03` | Four first-person memories: Yoon Haram, Jang Minjae, Go Seojin, and Han I-gyeong. Their choices form the same repeated evening. | The route is intentionally nonnumeric. Crosswalk, hotel, villa, then rooftop/road loop match the memories. Named people are not combat targets; the final enemy is the Blue Signal Executor/cause-loop construct. |
| `cult01 → cult02 → cult05 → cult06 → cult03 → cult04` | Black Rose network, the cult's purpose, returning reality memory, the original objectives, Han Rian and Baek Ion, then the final leader. | `cult03` binds Han and Baek to `c103-mid` and `c103-boss` with the existing gold-cross/circuit pattern decks. `cult04` keeps the awakened leader as the final combatant and the monologue's recovery/ending phases. |

## Verification

- `python data/rc57/build.py` regenerates 62 records, 56 combat maps, and verifies every displayed text card is at most 900 characters.
- `node tests/rc51-story-and-samong-smoke.cjs` verifies the uploaded file hash, approved proofreading changes, all 62 section records, all 56 before/after pairs, rest handoffs, opening voice text, final phase cards, and legacy dialogue suppression.
- `node tests/rc55-story-combat-alignment-smoke.cjs` verifies the apostate story identities and boss slots.
- RC56 route/map/72-boss identity, RC54 story visual/fallback, 72-boss visual assets, RC50 Slayer art routes, and bundle syntax checks pass.
- Static route and layout checks passed. The browser smoke test could not launch because Playwright's Chromium executable is absent in this environment; full gameplay across all 56 maps was not replayed in this audit.
