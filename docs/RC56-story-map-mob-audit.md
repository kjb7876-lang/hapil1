# RC56 story, map, and enemy audit

## Scope and result

Reviewed the 62 story records and their active route order, visually checked the full map set, checked the 72 boss IDs and their visual ownership, and traced the `cult03` apostate actors from the authored story into the combat templates. The route contains 56 combat scenes and 6 rests. All 62 active story-zone map assets were present in Git during the audit.

Two live presentation/identity defects were fixed in RC56:

- `ep1a08` was being routed to `assets/v31345/maps/ep1a08.webp`, an enclosed ward image without the requested wall text. It now uses the existing enclosed `assets/maps/ep1a_08_blood_hospital_rc24.png` image with “HELP ME” on an interior wall. The previous ward image remains a load-failure fallback.
- `murder03` was titled “옥상의 순환” and described a rooftop/crosswalk loop, while the active RC54 image showed only a crosswalk. It now uses `assets/maps/rc56/murder03-rooftop-loop.webp`, which combines a playable rooftop with the rainy street loop. The original rooftop image is retained as fallback, and the obsolete crosswalk-only image is removed from that zone’s active manifest/plan.
- `cult03` assigned Han and Baek’s names/art to ordinary slots `c103-e2/e3`, while the actual apostate bosses are `c103-mid/c103-boss`. RC56 binds the story names and generated character art to the actual midboss/boss slots, preserves the normal enemies and boss ranks/HP/positions, and distributes the circuit’s gold-grid/ring attacks into the two bosses’ pattern decks. The generated art now appears in idle/movement/portrait paths while the existing attack frames remain intact.

## Route and encounter review

| Story arc and active order | Narrative / combat identity | Map and progression assessment |
| --- | --- | --- |
| `dist00 → dist01 → dist02 → dist03 → dist04 → dist05 → dist06 → ep1a07` (8 fights) | Medieval memory: demonized tree, spider angel, horn demon and drowned comrades, Balrog, seven-pillar guardians, then the memory/fall echoes. | Dark-fantasy assets fit the memory. The medieval fall image was already restored in RC54; no modern road/city art belongs in this sequence. |
| `ep1a08 → ep1a09 → ep1a10 → ep1a11 → dreamRest` (4 fights, 1 rest) | Hospital hallucinations and restraint, craving/withdrawal, the Balrog rescue flashback, treatment, then Lucifer and the candidate priest. | Hospital interior route is now corrected. `ep1a09` deliberately moves from the injection-room crisis into an earlier palace memory; keep that flashback unmistakable in its pre/post cards so it does not read as a chronology jump. |
| `ep1b01 → ep1b02 → ep1b03 → ep1b04 → ep1b05 → ep1b06 → ep1b06b → ep1b07 → ep1b08 → ep1b09 → restEp1b` (10 fights, 1 rest) | Solomon’s seal and the seven-sin cases: sloth, envy, gluttony, lust, greed (including the boy’s memory), wrath, pride, and the biotech bootloader. Enemies should read as dream-formed sin/trauma manifestations, not as ordinary real-world people being punished. | Domestic, hotel, kitchen, church, snowfield, and biotech settings are consistent with these memories. This is the right arc for modern urban imagery; it should not leak backward into the medieval prologue. |
| `u201 → u202 → u204 → u205 → u206 → u203 → restU2` (6 fights, 1 rest) | A traumatized child’s defensive legion and controller, followed by system rejection, admin authority, hardware migration, and the memory door. | The non-numeric zone order is intentional: the story’s numbered stages culminate at `u203`/memory door. Do not sort the records lexically by zone ID. Treat combatants as defense/system constructs rather than the child. |
| `last304 → last305 → last301 → last302 → last303 → restLast3` (5 fights, 1 rest) | Neutral meadow, goblin/rose seal, a fallen-angel forced loss, sleepless village, and the insomnia demon. | The authored order is narrative rather than numeric. Village residents are explicitly not targets in the story; keep hostile roles on the demon/dream machinery and preserve the protagonist’s refusal to attack residents. |
| `kair01 → kair04 → kair05 → kair06 → kair07 → kair08 → kair09 → kair10 → kair02 → kair03 → restKairo` (10 fights, 1 rest) | Time-extraction academy, guardians and command hierarchy, workshop/neural gate/forgetting cemetery/collapse rite, then Arbellea and Siren Mor. | The active order matches the narrative. Roster generation accounts for 48 ordinary guardians, 12 upper guardians, and 6 great guardians (66 total across the roster); retain those categories and do not duplicate them as separate story bosses. |
| `hando01 → hando02 → hando03 → restHando` (3 fights, 1 rest) | Summoned priest, the two masters’ awakening, and recovery of the shared EGO core against the nightmare usurper. | The fantasy-castle/defense framing is consistent. The two masters are story allies learning to own their choices, not enemies to add to the roster. |
| `murder01 → murder02 → murder04 → murder03` (4 fights) | Crosswalk death, hotel memory, villa testimony, then the rooftop/crosswalk loop and its causal executor. | Correct order is non-numeric. Named victims/witnesses are narrative subjects, not combat enemies; the combat slots should remain anomalies, alarms, or the loop’s execution device. The new RC56 art now matches the rooftop scene. |
| `cult01 → cult02 → cult05 → cult06 → cult03 → cult04` (6 fights) | Black Rose network, cult leader’s war, return of reality memories, original objective, the apostate duo, and the final samong leader. | The story’s non-numeric ordering is deliberate. `cult03` now has Han as `c103-mid` and Baek as `c103-boss`; the generic `c103-e2/e3` enemies remain unchanged. Han’s deck carries the cross/line/gold grid; Baek’s carries the cross/cone/circuit ring. |

## Catalog and consistency checks

- The story has 62 unique records: 56 battles plus 6 rests. The staged zones are not always numerically ordered; the active encounter sequence, not the ID sort, is authoritative.
- The boss catalog has 72 unique IDs. The existing visual smoke test verifies 72 distinct boss lasers. The visual catalog has 71 normal owners; `dist00-boss` is the intentional root/custom-attack exception, not an unassigned ordinary boss.
- Murder-loop combat remains separated from the human narrative: the four named memories do not turn the victims into ordinary mob targets; the relevant combat identities are loop/anomaly/device entities.
- Eight playable heroes remain the player roster. Rian and Ion remain apostate boss/NPC sources, not selectable heroes or party allies.

## Canonical-text provenance: unresolved

The `sourceSha256` field matches the original `data/rc51/canonical.txt` file, but the current `data/story-rc51.js` `raw` string is not byte-for-byte (or normalized-text) identical to that canonical file. After removing BOM/normalizing line endings, the current raw text has 37,034 characters versus 37,043 in canonical text and a different SHA-256. The first observed divergence is already in `dist01` (for example, spacing in “보라검천사” and “스쳐 지나갔다”). RC55 identifies the content as an editorial revision, but the existing smoke test only proves that the current raw string is presented in story cards in order; it does not prove that the current raw equals the uploaded canonical text. Its success message was renamed so it no longer overstates “source conservation.”

No broad prose restoration or further rewriting was made in RC56. The next text pass needs an explicit source-of-truth decision: restore the canonical text exactly, or approve the edited RC55 narrative as the new source. There is also one line worth confirming during that pass: `cult03` says the two priests “betrayed the cult” while protecting the cult leader’s fusion circuit, which may be intentional but reads ambiguously without the surrounding reveal.

## Verification limits

Passed: `node --check assets/index-v31526.js`; RC51 story/samong smoke; RC54 map visual smoke; corrected RC55 combat alignment smoke; RC56 route/fallback/boss-ID smoke; boss-visual smoke; and RC50 Slayer laser smoke. The RC56 map test simulates a failed primary load and verifies the fallback alias and route restoration for both changed maps.

Full browser gameplay was not verified. Playwright could not start because its Chromium executable is absent in this environment; one broad test batch also could not proceed through the sparse checkout because `assets/rc32/boss-and-mobile.js` is not materialized. The scripted checks are not a substitute for a real desktop/mobile playthrough.
