# Existing combat coverage — 2026-10-26

Baseline audit: main `59598c41d747819590ca4b0c90cb0cd3b5f3c4b0`. No AGENTS.md was found under /workspace; /workspace/.agents and .codex were empty. Route/source references below refer to this baseline; the final section separately reviews the proposed RC231 integration. The active entry point loads `assets/index-v31526.js` and layered runtime modules; old release documents are evidence of intent, not the authoritative current roster.

## Actual route and identity matrix

Executing the loaded `data/story-rc51.js` confirms **61 ordered records: 55 combat, 6 rest**. `assets/rc155/ego-guardian.js:26–43` uses these exact records and appends `village` for its 62-node canonical route; `hub` is outside it. `ep1a07` is archived/deleted; saved frontier migration to `ep1a08` remains in `assets/index-v31526.js:126330`.

The table includes all **72 named class-catalog identities** from `assets/rc137/enemy-class-data.js:1`. Ordinary counts are the **194 raw early N-template rows**, not a live initialized roster. Raw early templates contain 65 boss/midboss rows; the catalog additionally names four restored midbosses, blue-executor, post-mask Lucifer, and Persona. Runtime additions and fissions follow below. No claim of 259 currently living enemies is intended.

| Route node | Current story record | Named boss/midboss/special identities | Raw ordinary templates |
| --- | --- | --- | ---: |
| dist00 | [악마화 나무의 정원](../data/story-rc51.js#L9) | `dist00-boss` 뿌리의 문지기 | 0 |
| dist01 | [거미동굴](../data/story-rc51.js#L24) | `mb-dist01` 보라검천사 | 3 |
| dist02 | [늪지대의 뿔악마](../data/story-rc51.js#L39) | `mb-dist02` 늪의 뿔악마 군주 | 4 |
| dist03 | [무너진성](../data/story-rc51.js#L54) | `mb-dist03` 핏빛 수호로 추격자 | 4 |
| dist04 | [시체들이 되살아난 밤](../data/story-rc51.js#L69) | `mb-dist04` 되살아난 첫 수호자 | 4 |
| dist05 | [일곱 기둥](../data/story-rc51.js#L82) | `mb-dist05` 숨이 끊긴 전령의 그림자 | 4 |
| dist06 | [추락](../data/story-rc51.js#L96) | `dist06-boss` 발록 · 지옥의 문지기<br>`mb-dist06` 소환진 검은기둥 | 3 |
| ep1a08 | [피로 물든 병원](../data/story-rc51.js#L112) | `mb-ep1a08` 백의 안정화 감독 | 4 |
| ep1a09 | [주사실과 결전의 날](../data/story-rc51.js#L128) | `mb-ep1a09` 갈망의 주사실 감시핵 | 4 |
| ep1a10 | [환자와 중독의 도시](../data/story-rc51.js#L147) | `mb-ep1a10` 오만의 폐허핵 | 4 |
| ep1a11 | [천사의 가면과 의목사 후보생](../data/story-rc51.js#L165) | `a11-boss` 루시퍼 · 가면 벗은 초천사<br>`mb-ep1a11` 초천사의 웃는 가면<br>`a11-cosmic-v31318` 가면이 깨진 루시퍼 | 3 |
| dreamRest (rest) | [기억하지 못하는 사람](../data/story-rc51.js#L187) | — | — |
| ep1b01 | [솔로몬의 봉인식](../data/story-rc51.js#L203) | `mb-ep1b01` 교만의 잔향 · 제72문 | 3 |
| ep1b02 | [나태의 집](../data/story-rc51.js#L221) | `b02-boss` 나태에 잠식된 남자<br>`mb-ep1b02` 나태의 껍데기 파수 | 3 |
| ep1b03 | [금이 간 안경](../data/story-rc51.js#L239) | `b03-boss` 호텔 부매니저 · 레비아탄<br>`mb-ep1b03` 금이 간 비교잔영 | 3 |
| ep1b04 | [탐식의 주방](../data/story-rc51.js#L256) | `b04-boss` 최고급 호텔의 총주방장 · 탐식의 귀 베엘제붑<br>`mb-ep1b04` 폐기주방 감독 | 3 |
| ep1b05 | [붉은 하이힐](../data/story-rc51.js#L273) | `b05-boss` 붉은 하이힐의 서윤<br>`mb-ep1b05` 심장빛 무대감독 | 3 |
| ep1b06 | [맘몬의 금고](../data/story-rc51.js#L290) | `b06-boss` 회장에게 고용된 총지배인 · 맘몬<br>`mb-ep1b06` 금고 장부감시자 | 3 |
| ep1b06b | [눈보라 속의 소년](../data/story-rc51.js#L305) | `b06b-boss` 소년이 된 총지배인 · 맘몬<br>`mb-ep1b06b` 겨울숲 가시파수 | 3 |
| ep1b07 | [불을 지른 남자](../data/story-rc51.js#L321) | `b07-boss` 불을 지른 청소부 · 사탄<br>`mb-ep1b07` 호텔 화염기사 | 3 |
| ep1b08 | [하늘에 서려는 자](../data/story-rc51.js#L338) | `b08-boss` 백색 정장의 호텔 그룹 회장<br>`mb-ep1b08` 역십자가 시체경호체 | 3 |
| ep1b09 | [생체 부트로더](../data/story-rc51.js#L355) | `b09-boss` 사이보그 회장 · 생체 부트로더<br>`mb-ep1b09` 생체부트로더 연산핵 | 3 |
| restEp1b (rest) | [사라진 귀환자](../data/story-rc51.js#L374) | — | — |
| u201 | [방어의 군단](../data/story-rc51.js#L390) | `u201-mid` 제4단계 전쟁관리자 | 3 |
| u202 | [잔인한 구원](../data/story-rc51.js#L412) | `u202-mid` 제8단계 자비 교정관 | 3 |
| u204 | [시스템의 거부권](../data/story-rc51.js#L432) | `u204-mid` 제12단계 기억 검열기 | 3 |
| u205 | [관리자 권한](../data/story-rc51.js#L452) | `u205-mid` 제14단계 역전 관리자 | 3 |
| u206 | [중앙 코어 이주실](../data/story-rc51.js#L469) | `u206-mid` 제17단계 중앙이주 코어 | 3 |
| u203 | [기억의 문](../data/story-rc51.js#L488) | `u203-mid` 기억의 문 수호 프레임<br>`u203-boss` 컨트롤러 · 기억의 문 | 3 |
| restU2 (rest) | [환도 자아의 탄생](../data/story-rc51.js#L503) | — | — |
| last304 | [중립 지역의 재각성](../data/story-rc51.js#L518) | — | 3 |
| last305 | [고블린 두목과 장미 인장](../data/story-rc51.js#L533) | `l305-boss` 고블린 추장 | 2 |
| last301 | [타락천사 기사](../data/story-rc51.js#L548) | `l301-boss` 타락천사 기사 | 5 |
| last302 | [잠들지 못하는 마을](../data/story-rc51.js#L563) | `mb-last302-v31231` 검은 안개 심장 · 불면의 기억 | 3 |
| last303 | [한약과 불면귀](../data/story-rc51.js#L578) | `l303-boss` 불면귀 | 0 |
| restLast3 (rest) | [끼어든 시간](../data/story-rc51.js#L594) | — | — |
| kair01 | [최초명령의 세계](../data/story-rc51.js#L609) | `mb-kair01-v31231` 최초명령 코어 오염체 | 6 |
| kair04 | [예순여섯 수문장](../data/story-rc51.js#L629) | `mb-kair04-v31231` 휴식 수확관 · 과로의 수문장 | 8 |
| kair05 | [빼앗긴 시간](../data/story-rc51.js#L644) | `kair-great-01` 대수문장 01 | 7 |
| kair06 | [닫힌 층의 명령](../data/story-rc51.js#L660) | `kair-great-02` 대수문장 02 | 7 |
| kair07 | [검은 공방](../data/story-rc51.js#L675) | `kair-great-04` 대수문장 04 | 8 |
| kair08 | [뉴런 게이트 · 노이론 게이트](../data/story-rc51.js#L690) | `kair-great-05` 대수문장 05 | 7 |
| kair09 | [망각의 묘지](../data/story-rc51.js#L705) | `mb-kair09-v31231` 망각 묘지기 · 삭제된 선택 | 8 |
| kair10 | [붕괴 의식장](../data/story-rc51.js#L720) | `kair-great-06` 대수문장 06 | 7 |
| kair02 | [아르벨리아, 유예의 수문장](../data/story-rc51.js#L735) | `kair-great-03` 아르벨리아, 유예의 수문장 | 8 |
| kair03 | [세이렌 모르](../data/story-rc51.js#L751) | `k103-boss` 세이렌 모르 | 0 |
| restKairo (rest) | [최초명령 재작성](../data/story-rc51.js#L775) | — | — |
| hando01 | [성 안에 소환된 의목사](../data/story-rc51.js#L792) | `mb-hando01` 의존 신호 포식자 | 3 |
| hando02 | [두 주인의 각성](../data/story-rc51.js#L808) | `mb-hando02` 코어 운반 집행자 | 4 |
| hando03 | [함께 되찾은 코어](../data/story-rc51.js#L823) | `h103-boss` EGO 강탈 악몽왕<br>`mb-hando03` 환수검 모조체 | 3 |
| restHando (rest) | [잘못 이어진 기록](../data/story-rc51.js#L839) | — | — |
| murder01 | [윤하람](../data/story-rc51.js#L855) | `mb-murder01` 파란불 역주행 목격자 | 0 |
| murder02 | [장민재와 새빛호텔](../data/story-rc51.js#L872) | `mb-murder02` 공실장부 당직감사 | 0 |
| murder04 | [고서진과 청록빌라](../data/story-rc51.js#L891) | `murder04-mid` 진술 봉쇄 인과핵 | 3 |
| murder03 | [옥상의 순환](../data/story-rc51.js#L916) | `mb-murder03` 옥상 인과보관인<br>`blue-executor` 파란불 집행체 | 0 |
| cult01 | [하나로 묶인 악몽](../data/story-rc51.js#L937) | `c101-mid` 칩 제단 방화벽 | 3 |
| cult02 | [교주가 기다리는 전쟁](../data/story-rc51.js#L953) | `c102-boss` 네트워크 합창체 | 3 |
| cult05 | [돌아오는 현실의 기억](../data/story-rc51.js#L968) | `c105-mid` ID 생체조 관리자 | 3 |
| cult06 | [처음 세웠던 목표](../data/story-rc51.js#L984) | `c106-mid` 기계재판 집행핵 | 3 |
| cult03 | [사몽의 문턱](../data/story-rc51.js#L999) | `c103-mid` 이단의목사 한리안<br>`c103-boss` 이단의목사 백이온 | 3 |
| cult04 | [교주의 사몽](../data/story-rc51.js#L1016) | `c104-mid` 적그리스도 배양좌<br>`c104-boss` 교만의 사이보그 교주<br>`inner-evil-rc133` 내면의 악의 Persona | 2 |
| village (endpoint) | RC155 canonicalRoute | — | — |

## Runtime paths that share maps but have different lifecycle rules

| Path | Existing real behavior and evidence | Required preservation |
| --- | --- | --- |
| STORY main route | All 55 battles in the order above. Narrative before/after cards and final recollection/awakening gates: `assets/rc51/story.js:175–219`. | Required actors, waves, objectives, story cards, loot and native clear gate. |
| Part 1 post-mask finale | `a11-boss` death replaces it with `a11-cosmic-v31318`; independently authored actor, fixed anchor, opening/regen/arsenal: bundle `118743–118813`. | Mask conversion, opening protection, body/mouth art, signature and save continuation. |
| Parts 2–7 STORY Cosmic awakenings | `assets/rc87/episode-cosmic.js:6–15,52–62,81–145,172–203`: b09-boss/u203-boss/l303-boss/k103-boss/h103-boss/mb-murder03 become their own Cosmic form. | Native source identity/art/deck and true-final clear lock. Kair IDs here are save aliases, **not** current replacement identities. Existing RC87 prose saying otherwise is stale. |
| STORY cult04 | Existing final stages, c104 revival, firstPost → awakenPre → finalHitCommitted → ending remain gated: `assets/rc51/story.js:187–191`; bundle `99815–100606`. | Forced story physician/awakening and final ending only when native conditions are satisfied. |
| STORY six-Cosmic summon skill | All six `kair-great-01..06` templates are instantiated in cult04; desktop simultaneous/mobile sequential wave: `assets/rc86/samong-cosmic.js:6–13,246–331`. | Separate summon actor lifecycle, mobile hold/release, signatures and crisis/awakening sequence. |
| DREAM / SAMONG | Only STORY/DREAM are selectable authored modes: bundle `122652–122665`. SAMONG is an accepted unlock-gated alias for DREAM: `assets/rc91/samong-awakening.js:11–29`. Same route; Dream calibration and per-mode midboss count apply. | No third live HELL campaign inferred from legacy code. Preserve unlock validation and enemy baseline scaling. |
| DREAM cult04 regional gauntlet | Six trials use boss templates from u203 → last303 → kair03 → hando03 → ep1a11 → cult04: bundle `122731–122752`. | Each native identity, transition delay, current-map clear lock, saved trial HP/remaining transition (`122770–122800`). |
| Hidden Persona | DREAM cult04 c104 death opens `inner-evil-rc133`; explicit777 direct entry is a separate admitted path: `assets/rc133/inner-final.js:65–103`, `developer-maps.js:5–13`. | Original nine skills, awakening/red-time, one-use independent revival, own health, clear proof and save state. |
| EGO reverse/repeat route | Confirmed Persona completion sets pending transformation; next distinct map activates reverse route at village; endpoints bounce and confirmed visits alone increment scaling: `assets/rc155/ego-guardian.js:56–60,99–161`. | Stable map IDs, visit IDs, rest passages, direction/cycle/clear ledger, detours, save restore and nonstacking scaling. |
| Practice | Existing launcher creates `practiceV31329` run: bundle `123987–124001`; campaign narrative/route additions exclude practice. | Native training controls and no campaign progress/ending rewards. |

## Dynamic identities outside a fixed boss list

- **Midboss fissions:** `<first-id>-partner-<index>-rc133`; live admitted roster retains `rc135FissionIdentity`/template/owner. STORY limit1, DREAM2; old nonauthored fallback3 is not another selectable campaign. `assets/rc210/encounter-policy.js:5–22`; bundle `127023–127062`. Dead admitted slots do not refill.
- **RC88 destructible parts:** `rc88:<owner-id>:<phase>:<index>`; roots3 (dist00), copies1/2 by phase (b09), commands2 (u203), liberation3 (kair-great-03), swords2 (h103). Child sourceId plus original sourceBossId are distinct. `assets/rc88/danmaku-rpg.js:8–21,85–136`.
- **Real wall-tower enemies:** `rc210-wall-tower-u201`, `rc210-wall-tower-u202`; ordinary actors with native fixed laser contact. `assets/rc210/wall-towers.js:1–13`.
- **RC225 interludes:** three sequential ordinary template clones between native waves3/4, IDs `rc225-interlude-<zone>-<serial>`. `assets/rc225/shooter.js:55–80`. Their own actor IDs must not fall outside a literal named-boss registry.
- **Existing echo/mirror actors:** `echoChildV31368`, echo bolts and timed explosions: bundle `124164–124242`. Preserve this separate mechanic; do not copy it as the shared system. Echo transient children/bolts are intentionally filtered from saves.
- **Other original owner summons/objectives:** retain live sourceId/sourceBossId/summonOwnerId, requiredForClear and protected-objective fields. A route or catalog count does not establish that every runtime descendant was observed.

## What “existing Persona common system” means here

This is an existing real-time action/bullet-hell game. No external Persona turn, weakness, elemental or party-turn model is present in the reference mechanics.

| Existing reusable quality | Source evidence | Boundary |
| --- | --- | --- |
| Native attack packets and immutable source ownership | `inner-final.js:36,199–224`; `assets/rc155/combat-provenance.js:7–18` | Retain every other owner's authored packet, artwork and skill identity. Persona's nine skill assets/rc133 flags are exclusive. |
| Whole volley admission or bounded deferral | `inner-final.js:6,43,182–207,225–229` | Full authored salvo, no silent clipping or successful cooldown on failed admission. Preserve specialized producer rules. |
| Warning → release → committed recovery | `inner-final.js:185–199,212,225–229` | Use unpaused simulation time. Do not retime a cast already in flight. |
| Contact from the real rendered bitmap with observed swept movement | `assets/rc133/bitmap-contact.js:14–43,61–75`; `assets/combat-v31402/contact-geometry.js:67–84` | Simulation measures before damage; a prior rendered frame is unnecessary. Lasers/areas retain their native geometry. |
| Compact/prioritized hit feedback with bounded effects/audio | `assets/rc128/combat-feedback.js:83–132` | Ledger decides actual damage first; presentation never awards damage, resources or clear. |
| Authority, pause, scene locks and finite state | `inner-final.js:167–181`; RC137 awakening/save rules `assets/rc137/awakening-rules.js:8–79` | Guest, paused/hidden/reading/modal/death paths must not advance combat. |

**Excluded from propagation:** Persona's RC134 ownership halves, center seam, reflected tracking/positions, map swaps, shared mutual tempo and mirror camera are original encounter mechanics: `assets/rc134/persona-duel.js:8–16,19–52,56`. Keep them intact for Persona. Also keep Persona's red-time66% block, HP12000..3000000, independent22% revival, three-bounce/18s empowered flight and no-TTL exception unique (`inner-final.js:58–64,106–165`; `awakening-rules.js:43–66`).

## Coverage and regression risks

1. A fixed72-owner list misses ordinary actors, RC88 parts, wall towers, fissions and RC225 interludes. Resolve current hostile actors and original ownership, with explicit allied/protected-objective exclusions.
2. Wrapping `MONGSE_pushThemeProjectile3129` alone misses direct hostileProjectile pushes (e.g. RC88 and echo), native melee/pendingHits/impactQueue, lasers and specialized DOT. Preserve native reducers for all families. Root attacks, machine fields, fog, holes and towers need explicit unchanged-path evidence.
3. Story Cosmos and Dream trial actors can share an ID with a source template while using a different phase/lifecycle. Check actor flags and instance, not only ID/map.
4. Save restore must preserve HP ratio/progress and rebase remaining deadlines, not replay attacks/rewards or import STORY cult04 state into DREAM. EGO route visit accounting and midboss retired admission slots are separate ledgers.
5. Test fixtures that enter all maps establish structural route coverage; they do not prove naturally completing all55 battles. Ordinary/midboss/boss/dynamic producer tests and actual browser integration remain necessary.
6. No live initialized all-route inventory or all-route natural campaign playthrough was completed by this read-only audit. Browser execution/testing is tracked separately by the parent task.

## Audit execution evidence

- Read active index script references, current story records, class catalog, native mode/final/save integration and runtime modules listed above.
- Executed current story data in an isolated Node VM: records61, combat55, rest6, no ep1a07.
- Independently checked raw template counts and runtime additions with a read-only identity subaudit; class catalog72 is not asserted to be the total live roster.
- The initial audit owns this new document and the authorized new `tests/rc231-encounter-coverage-unit.cjs`. The later orientation task additionally authorizes the active historical browser/helper expectation updates and the small evidence package's fourth image label/scope. This agent did not edit gameplay sources, narrative/assets, branches, commits or remote state. Other task agents own the runtime implementation and RC231 browser runner reviewed below.

## Raw ordinary identity appendix

These 194 ordinary IDs are extracted from the early expanded N templates plus RC60 route normalization. Later live actors are listed separately above. They are structural inventory evidence, not casts observed in play.

| Map | Ordinary template identities |
| --- | --- |
| dist00 | — |
| dist01 | `dist01-sp1`, `dist01-sp2`, `dist01-s1` |
| dist02 | `dist02-h1`, `dist02-g1`, `dist02-m1`, `dist02-sp1` |
| dist03 | `dist03-s1`, `dist03-c1`, `dist03-g1`, `dist03-sp1` |
| dist04 | `dist04-c1`, `dist04-s1`, `dist04-g1`, `dist04-c2` |
| dist05 | `dist05-h1`, `dist05-m1`, `dist05-c1`, `dist05-s1` |
| dist06 | `dist06-h1`, `dist06-m1`, `dist06-c1` |
| ep1a08 | `a08-o1`, `a08-s1`, `a08-c1`, `a08-o2` |
| ep1a09 | `a09-o1`, `a09-v1`, `a09-d1`, `a09-c1` |
| ep1a10 | `a10-s1`, `a10-o1`, `a10-h1`, `a10-v1` |
| ep1a11 | `a11-c1`, `a11-o1`, `a11-d1` |
| ep1b01 | `b01-r1`, `b01-c1`, `b01-s1` |
| ep1b02 | `b02-m1`, `b02-b1`, `b02-o1` |
| ep1b03 | `b03-g1`, `b03-c1`, `b03-g2` |
| ep1b04 | `b04-g1`, `b04-b1`, `b04-s1` |
| ep1b05 | `b05-p1`, `b05-a1`, `b05-p2` |
| ep1b06 | `b06-f1`, `b06-c1`, `b06-f2` |
| ep1b06b | `b06b-h1`, `b06b-f1`, `b06b-v1` |
| ep1b07 | `b07-f1`, `b07-s1`, `b07-f2` |
| ep1b08 | `b08-c1`, `b08-h1`, `b08-v1` |
| ep1b09 | `b09-h1`, `b09-o1`, `b09-c1` |
| u201 | `u201-e1`, `u201-e2`, `u201-e3` |
| u202 | `u202-e1`, `u202-e2`, `u202-e3` |
| u204 | `u204-e1`, `u204-e2`, `u204-e3` |
| u205 | `u205-e1`, `u205-e2`, `u205-e3` |
| u206 | `u206-e1`, `u206-e2`, `u206-e3` |
| u203 | `u203-e1`, `u203-e2`, `u203-e3` |
| last304 | `l304-e1`, `l304-e2`, `l304-e3` |
| last305 | `l305-e1`, `l305-e2` |
| last301 | `l301-clone1`, `l301-clone2`, `l301-clone3`, `l301-clone4`, `l301-clone5` |
| last302 | `l302-e1`, `l302-e2`, `l302-e3` |
| last303 | — |
| kair01 | `kair-academy-wave-1`, `kair-academy-wave-2`, `kair-academy-wave-3`, `kair-academy-wave-4`, `kair-academy-wave-5`, `kair-academy-wave-6` |
| kair04 | `kair-guardian-01`, `kair-guardian-02`, `kair-guardian-03`, `kair-guardian-04`, `kair-guardian-05`, `kair-guardian-06`, `kair-elite-49`, `kair-elite-50` |
| kair05 | `kair-guardian-07`, `kair-guardian-08`, `kair-guardian-09`, `kair-guardian-10`, `kair-guardian-11`, `kair-guardian-12`, `kair-elite-51` |
| kair06 | `kair-guardian-13`, `kair-guardian-14`, `kair-guardian-15`, `kair-guardian-16`, `kair-guardian-17`, `kair-guardian-18`, `kair-elite-52` |
| kair07 | `kair-guardian-19`, `kair-guardian-20`, `kair-guardian-21`, `kair-guardian-22`, `kair-guardian-23`, `kair-guardian-24`, `kair-elite-53`, `kair-elite-54` |
| kair08 | `kair-guardian-25`, `kair-guardian-26`, `kair-guardian-27`, `kair-guardian-28`, `kair-guardian-29`, `kair-guardian-30`, `kair-elite-55` |
| kair09 | `kair-guardian-31`, `kair-guardian-32`, `kair-guardian-33`, `kair-guardian-34`, `kair-guardian-35`, `kair-guardian-36`, `kair-elite-56`, `kair-elite-57` |
| kair10 | `kair-guardian-37`, `kair-guardian-38`, `kair-guardian-39`, `kair-guardian-40`, `kair-guardian-41`, `kair-guardian-42`, `kair-elite-58` |
| kair02 | `kair-guardian-43`, `kair-guardian-44`, `kair-guardian-45`, `kair-guardian-46`, `kair-guardian-47`, `kair-guardian-48`, `kair-elite-59`, `kair-elite-60` |
| kair03 | — |
| hando01 | `h101-s1`, `h101-t1`, `h101-s2` |
| hando02 | `h102-s1`, `h102-c1`, `h102-t1`, `h102-s2` |
| hando03 | `h103-c1`, `h103-s1`, `h103-t1` |
| murder01 | — |
| murder02 | — |
| murder04 | `murder04-e1`, `murder04-e2`, `murder04-e3` |
| murder03 | — |
| cult01 | `c101-e1`, `c101-e2`, `c101-e3` |
| cult02 | `c102-e1`, `c102-e2`, `c102-e3` |
| cult05 | `c105-e1`, `c105-e2`, `c105-e3` |
| cult06 | `c106-e1`, `c106-e2`, `c106-e3` |
| cult03 | `c103-e1`, `c103-e2`, `c103-e3` |
| cult04 | `c104-e1`, `c104-e2` |

## Machine-checkable omission gate

`node tests/rc231-encounter-coverage-unit.cjs` passed 783 assertions locally. It executes the current route, actual unlock selector, entire reverse route, 194 ordinary and 72 named identity admission samples in both authored modes, explicit dynamic/native-exclusion families, and the actual bounded deployed native integration block with synthetic producer packets. Natural casts observed by this test: 0. Actual browser validation remains separate.

## Independent RC231 implementation review

- The new module is loaded before the native bundle. The bounded RC133 integration wraps the actual lexical primary cast/pattern/rift functions, retains committed theme/barrage chains, observes direct queues after RC126 safety before projectile movement, observes queued areas before impact resolution, and records ordinary attacks after native `beginEnemyCast`. The omission gate executes that exact source block and confirms it exists in the deployed bundle; it does not merely test an unconnected module API.
- `assets/rc231/combat-lifecycle.js` derives contact gates from the latest native warning/release, adds a 0.35-second same-owner recovery bound, and retains the original packet movement/damage/art/expiry fields. End-aware WeakMap observations account for later native warning updates without repeatedly advancing the recovery clock. Actor instance/zone/time boundaries prevent a replaced actor from inheriting a private cast.
- RC95 full salvo preflight/defer and rollback preserve the owner pattern cycle on incomplete native emission. The mb-dist04 fragment producer keeps its authored four parts within the existing per-owner 4/global 8 native limits, so a requested five/seven-packet salvo cannot retry forever against that cap. Mixed phase now respects existing atomic/recovery state.
- **Intentionally retained native families:** Persona and echo/mirror actors remain outside the new lifecycle. RC88 destructible parts/command bodies keep their independent owner/phase script and direct emitter. Existing field/DOT packets (roots, black holes, machine tentacles/deletion, Balrog rifts, insomnia fog, persistent hazards and theme followups) retain their own tick intervals and reducers, so repeated field ticks cannot continuously postpone the source actor's recovery. Wall-tower contact remains in its private native beam scheduler; its actor is eligible for ordinary native packet observations, but the new lifecycle does not claim to replace or observe private tower beam records.
- Native field and excluded family preservation is part of coverage; those families are **not** claimed as newly governed by the common lifecycle. Their original contact/art/phase systems and the original Persona mirror geometry stay authoritative.
- Independent local verification passed the 783-assertion omission gate and the core agent's 39-case lifecycle unit suite, plus syntax and whitespace checks.
- Reviewed `liveLifecycle` in `tests/rc231-modes-save-input-browser.cjs`: it uses the actual ranged mage `dist02-m1` in manual, `mb-ep1b03` in semi, and `b03-boss` in full mode; requires two native RAF attack announcements and real owner packets; checks the real early `N.cast`/RC95 dispatch defers without consuming a serial; and calls the actual outgoing/incoming reducers with ledger evidence after the live attack trace. Initial full-HP/template/ready/player-invulnerability fixtures are explicitly disclosed, and later cast timers are not reset to force progress. The selected actor IDs and APIs match current source. These are source-review findings; local Chrome execution is blocked and exact CI execution remains pending.

## Latest orientation requirement and regression alignment

The later user instruction requires landscape play for every viewport, including desktop user agents and the title screen. The exact portrait guide is **기기를 가로로 돌려주세요**. Portrait suspends native time, attacks, damage, input and automatic progression; landscape resumes the same world without clearing an existing user/menu pause. The 55-battle route and authored enemy identities above remain unchanged.

The active `story-narration-audit`, `rc137-integration` and `rc147-camera-finale` workflows were traced through direct and recursive browser invocations. Their existing portrait cases remain in the test loops: the shared `tests/helpers/landscape-orientation.cjs` checks the real guide, native actor/attack/packet freeze, released input and preserved prior pause, then rotates to landscape for the existing combat assertions. The historical RC218 Persona orientation helper retains its full three-size freeze/resume observations and uses the actual live world's identity. Exact old-baseline comparisons keep their immutable source paths and scope; no current expectation accepts the old guide text.

The RC153 compositor test retains all 36 synthetic calibration cases under the actual visible portrait guide, with gameplay suspended, then returns to landscape. This checks archived compositor math and does not claim visible portrait gameplay. Mobile viewport evidence retains every requested size, a real portrait-guide PNG, and separate landscape geometry/containment/pointer checks after rotation. The small evidence package's fourth image is explicitly named and described as the portrait rotation guide; its original PNG bytes and dimensions remain checked.

Independent source review confirms the new RC152 policy depends on actual viewport dimensions rather than touch/UA/game phase; the existing RAF updates its wall timestamp before the orientation early return. Native auto-progress intervals, shared flow blockers/async commits, local party input cancellation and full-auto death countdown have explicit orientation gates. The policy owns a separate orientation flag and leaves native user/menu pause fields intact. New browser scenarios exercise title input blocking, repeated actual hidden-battle rotations, prior menu pause, and a genuinely pending native map-preparation Promise; those scenarios remain fixture-disclosed and require actual CI browser results.
