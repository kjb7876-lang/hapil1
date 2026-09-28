# RC58 1인칭 독백 · 맵/몹/전투 점검

## 결론과 범위

활성 서사 원문은 업로드본 `data/rc57/voice-monologue.txt`이며 SHA-256은 `b7d620e27e9a4d44e0b170f2980047642bcc03b5460b1f8ddcb62ed1040d4add`이다. 기존 전투 상호대화, 쉼터 대화, 인터루드, 구형 시작 서문은 게임 경로에서 비활성화했다. 맵 전·후 화면은 업로드 독백 카드만 사용한다.

전체 62개 서사 기록 중 전투 맵 56개와 휴식 기록 6개를 확인했다. 각 전투 맵에는 전투 전·후 카드가 있고, cult04는 1차 전투 후·사몽 각성 전·최종 전투 후를 추가해 총 4단계로 표시한다. 휴식 기록은 중복 별도 화면을 만들지 않고 다음 전투 전 카드에 이어 붙인다.

## 56개 전투 맵별 카드 대조

| 순서 | 맵 ID | 업로드 제목 | 전투 전 카드 | 전투 후/페이즈 카드 |
|---:|---|---|---|---|
| 01 | `dist00` | 악마화 나무의 정원 | 5문단 / 595자 | 3문단 / 301자 |
| 02 | `dist01` | 거미동굴 | 2문단 / 225자 | 1문단 / 160자 |
| 03 | `dist02` | 늪지대의 뿔악마 | 2문단 / 255자 | 1문단 / 330자 |
| 04 | `dist03` | 무너진성 | 2문단 / 294자 | 1문단 / 56자 |
| 05 | `dist04` | 시체들이 되살아난 밤 | 1문단 / 50자 | 1문단 / 56자 |
| 06 | `dist05` | 일곱 기둥 | 1문단 / 128자 | 1문단 / 100자 |
| 07 | `dist06` | 추락 | 1문단 / 205자 | 1문단 / 159자 |
| 08 | `ep1a07` | 추락의 기억 | 1문단 / 98자 | 1문단 / 104자 |
| 09 | `ep1a08` | 피로 물든 병원 | 2문단 / 262자 | 2문단 / 255자 |
| 10 | `ep1a09` | 주사실과 결전의 날 | 3문단 / 416자 | 3문단 / 380자 |
| 11 | `ep1a10` | 환자와 중독의 도시 | 3문단 / 402자 | 3문단 / 419자 |
| 12 | `ep1a11` | 천사의 가면과 의목사 후보생 | 5문단 / 602자 | 5문단 / 659자 |
| 13 | `ep1b01` | 솔로몬의 봉인식 | 7문단 / 814자 | 3문단 / 361자 |
| 14 | `ep1b02` | 나태의 집 | 3문단 / 392자 | 3문단 / 323자 |
| 15 | `ep1b03` | 금이 간 안경 | 3문단 / 389자 | 2문단 / 308자 |
| 16 | `ep1b04` | 탐식의 주방 | 3문단 / 413자 | 2문단 / 203자 |
| 17 | `ep1b05` | 붉은 하이힐 | 3문단 / 375자 | 2문단 / 278자 |
| 18 | `ep1b06` | 맘몬의 금고 | 2문단 / 239자 | 1문단 / 122자 |
| 19 | `ep1b06b` | 눈보라 속의 소년 | 2문단 / 253자 | 2문단 / 218자 |
| 20 | `ep1b07` | 불을 지른 남자 | 3문단 / 386자 | 2문단 / 265자 |
| 21 | `ep1b08` | 하늘에 서려는 자 | 3문단 / 384자 | 2문단 / 285자 |
| 22 | `ep1b09` | 생체 부트로더 | 4문단 / 488자 | 3문단 / 344자 |
| 23 | `u201` | 방어의 군단 | 6문단 / 666자 | 8문단 / 633자 |
| 24 | `u202` | 잔인한 구원 | 4문단 / 330자 | 4문단 / 338자 |
| 25 | `u204` | 시스템의 거부권 | 4문단 / 305자 | 4문단 / 371자 |
| 26 | `u205` | 관리자 권한 | 2문단 / 142자 | 3문단 / 266자 |
| 27 | `u206` | 중앙 코어 이주실 | 4문단 / 327자 | 3문단 / 230자 |
| 28 | `u203` | 기억의 문 | 1문단 / 128자 | 2문단 / 224자 |
| 29 | `last304` | 중립 지역의 재각성 | 4문단 / 548자 | 2문단 / 208자 |
| 30 | `last305` | 고블린 두목과 장미 인장 | 2문단 / 242자 | 1문단 / 133자 |
| 31 | `last301` | 타락천사 기사 | 2문단 / 211자 | 1문단 / 126자 |
| 32 | `last302` | 잠들지 못하는 마을 | 2문단 / 204자 | 1문단 / 138자 |
| 33 | `last303` | 한약과 불면귀 | 2문단 / 235자 | 2문단 / 227자 |
| 34 | `kair01` | 최초명령의 세계 | 5문단 / 607자 | 6문단 / 816자 |
| 35 | `kair04` | 예순여섯 수문장 | 2문단 / 228자 | 1문단 / 88자 |
| 36 | `kair05` | 빼앗긴 시간 | 2문단 / 199자 | 2문단 / 187자 |
| 37 | `kair06` | 닫힌 층의 명령 | 1문단 / 95자 | 2문단 / 185자 |
| 38 | `kair07` | 검은 공방 | 2문단 / 234자 | 1문단 / 99자 |
| 39 | `kair08` | 뉴런 게이트 · 노이론 게이트 | 1문단 / 101자 | 2문단 / 198자 |
| 40 | `kair09` | 망각의 묘지 | 1문단 / 80자 | 2문단 / 219자 |
| 41 | `kair10` | 붕괴 의식장 | 2문단 / 187자 | 1문단 / 102자 |
| 42 | `kair02` | 아르벨리아, 유예의 수문장 | 2문단 / 212자 | 2문단 / 243자 |
| 43 | `kair03` | 세이렌 모르 | 5문단 / 494자 | 7문단 / 595자 |
| 44 | `hando01` | 성 안에 소환된 의목사 | 6문단 / 635자 | 3문단 / 307자 |
| 45 | `hando02` | 두 주인의 각성 | 2문단 / 196자 | 1문단 / 110자 |
| 46 | `hando03` | 함께 되찾은 코어 | 2문단 / 206자 | 2문단 / 220자 |
| 47 | `murder01` | 윤하람 | 5문단 / 557자 | 4문단 / 489자 |
| 48 | `murder02` | 장민재와 새빛호텔 | 5문단 / 538자 | 2문단 / 222자 |
| 49 | `murder04` | 고서진과 청록빌라 | 7문단 / 801자 | 6문단 / 714자 |
| 50 | `murder03` | 옥상의 순환 | 3문단 / 336자 | 5문단 / 548자 |
| 51 | `cult01` | 하나로 묶인 악몽 | 3문단 / 379자 | 1문단 / 124자 |
| 52 | `cult02` | 교주가 기다리는 전쟁 | 2문단 / 232자 | 1문단 / 128자 |
| 53 | `cult05` | 돌아오는 현실의 기억 | 2문단 / 255자 | 2문단 / 261자 |
| 54 | `cult06` | 처음 세웠던 목표 | 2문단 / 215자 | 1문단 / 124자 |
| 55 | `cult03` | 사몽의 문턱 | 4문단 / 393자 | 1문단 / 133자 |
| 56 | `cult04` | 교주의 사몽 | 1문단 / 114자 | 1차 후 6문단 / 686자 · 각성 전 3문단 / 443자 · 최종 후 9문단 / 825자 |

## 에피소드별 맵·몹·전투 정합성

| 장/진행 구역 | 점검 결과 |
|---|---|
| 제1부 — 마지막 수호자 EGO · `dist00, dist01, dist02, dist03, dist04, dist05, dist06, ep1a07, ep1a08, ep1a09, ep1a10, ep1a11` | dist00–ep1a07은 중세 다크 판타지 회상이다. 뿌리 문지기→거미천사→뿔악마/동료 잔영→핏빛 추격자→기둥 문지기→발록→기억포식자 순서이며, 발록은 dist06의 3막 보스다. ep1a07은 보스 뒤 추락 처리이고 현대 도시 맵을 섞지 않는다. |
| 제2부 — 일곱 개의 귀와 하이테크 축귀 · `ep1b01, ep1b02, ep1b03, ep1b04, ep1b05, ep1b06, ep1b06b, ep1b07, ep1b08, ep1b09` | ep1b01–ep1b09는 솔로몬 봉인 뒤 나태·질투·탐식·정욕·탐욕·분노·교만·바이오테크로 진행한다. 각 죄악의 형상/기계가 보스고, 실제 피해자·환자·일반 주민은 적대 대상으로 만들지 않는다. |
| 제3부 — 통제자의 열일곱 단계 · `u201, u202, u204, u205, u206, u203` | u201→u202→u204→u205→u206→u203은 1–17단계의 의도된 비수치 순서다. 구역마다 기억·방어 기계와 단계 중간보스가 있고, 마지막 u203에서 컨트롤러 프레임을 상대한다. 피해자 아이 자체는 적이 아니다. |
| 제4부 — 환도 자아와 융합몽세 · `last304, last305, last301, last302, last303` | last304→last305→last301→last302→last303 순서다. 중립 초원의 슬라임/늑대와 고블린 추장은 비인간 전투 몹이며 주민은 적으로 삼지 않는다. 이후 타락천사 기사, 검은 안개 잔영/심장, 불면귀로 상승한다. 마지막 보스의 소환 억제·1:1 전투를 유지한다. |
| 제5부 — 카이로노미콘 · `kair01, kair04, kair05, kair06, kair07, kair08, kair09, kair10, kair02, kair03` | kair01의 6파동 이후 kair04→05→06→07→08→09→10→02→03 순서다. 외부 8맵은 일반 48·상위 12·대수문장 6의 66 수문장 편성을 유지한다. 유예 수문장 뒤 세이렌 모르가 3막 최종 보스이며 시간·명령·뉴런·망각 기믹을 구역별로 분리한다. |
| 제6부 — 두 사람의 성 · `hando01, hando02, hando03` | hando01–03은 성 방어→코어 탈취→EGO 회수 흐름이다. 일반 봉인병/연결자 뒤 각 맵의 고유 중간보스를 두고, 한리안·백이온은 서사상 동료로만 유지한다. h103-boss는 악몽왕이지 동료 둘이 아니다. |
| 제7부 — 파란불 아래의 사람들 · `murder01, murder02, murder04, murder03` | murder01→murder02→murder04→murder03의 비수치 순서다. 윤하람·장민재·고서진·한이경은 기억의 주인이지 사냥 대상이 아니다. 첫 두 맵은 순환 이벤트 중간보스, murder04는 진술 봉쇄 인과핵, murder03은 옥상·순환 도로 루프와 blue-executor 최종전이다. |
| 제8부 — 사이비 합일몽세 · `cult01, cult02, cult05, cult06, cult03, cult04` | cult01→cult02→cult05→cult06→cult03→cult04 순서다. 제단/합창/생체조/기계재판 중간보스를 거쳐 cult03에서 한리안=c103-mid, 백이온=c103-boss로 연결한다. cult04의 교주 4페이즈만 의목사 사몽 각성과 엔딩을 작동시킨다. |

## 56개 개별 맵의 구조·위험·전투 리듬

아래 환경 키와 지형/위험/소품/템포는 로드된 월드 프로필의 56개 combat zone과 대조했다. 인물 서술은 업로드 독백, 적대 슬롯·보스/페이즈는 게임 월드 편성을 기준으로 해석했다.

| 맵 | 환경 키 | 지형 · 위험 요소 | 핵심 소품 · 전투 리듬 |
|---|---|---|---|
| `dist00` · 악마화 나무의 정원 | `demon-tree-palace-garden` | `ruined-palace-garden` · `memory-root-sweep` | `fallen-seraph-roots` · `root-lane-pressure` |
| `dist01` · 거미동굴 | `bone-web-cavern` | `webbed-bridges` · `ceiling-web-drop` | `bone-web-pillars` · `staccato-duel` |
| `dist02` · 늪지대의 뿔악마 | `face-reed-black-swamp` | `sinking-islets` · `grasping-water-hands` | `horn-skull-reeds` · `drag-and-burst` |
| `dist03` · 무너진성 | `summoning-city-approach` | `broken-boulevard` · `road-fissure` | `fallen-guardian-banners` · `forward-pressure` |
| `dist04` · 시체들이 되살아난 밤 | `fallen-guardian-crossing` | `grave-switchbacks` · `revival-rift` | `companion-weapon-markers` · `counter-rhythm` |
| `dist05` · 일곱 기둥 | `seven-pillar-pilgrimage` | `converging-lanes` · `pillar-fire-line` | `summoning-seal-fragments` · `lane-escalation` |
| `dist06` · 추락 | `balrog-gate-circle` | `circular-duel` · `whip-fissure` | `seven-black-columns` · `three-act-crescendo` |
| `ep1a07` · 추락의 기억 | `void-fall-corridor` | `collapsing-spiral` · `floor-shear` | `falling-city-blocks` · `fall-and-release` |
| `ep1a08` · 피로 물든 병원 | `blood-hospital` | `ward-corridors` · `door-slam-wave` | `beds-and-help-wall` · `claustrophobic-pulse` |
| `ep1a09` · 주사실과 결전의 날 | `injection-memory-theatre` | `radial-treatment-bays` · `syringe-lane` | `labelled-vial-cabinet` · `hallucination-surge` |
| `ep1a10` · 환자와 중독의 도시 | `patient-addiction-city` | `ruin-grid` · `craving-zone` | `patient-chart-monoliths` · `collapse-and-recover` |
| `ep1a11` · 천사의 가면과 의목사 후보생 | `false-heaven-clinic` | `halo-arena` · `false-light-column` | `cracked-angel-mask` · `mask-break-finale` |
| `ep1b01` · 솔로몬의 봉인식 | `solomon-seal-chapel` | `seventy-two-node-ring` · `seal-closure` | `brass-exorcism-terminals` · `ritual-measure` |
| `ep1b02` · 나태의 집 | `sloth-house` | `compressed-rooms` · `furniture-fall` | `rotting-bed-shell` · `slow-heavy-release` |
| `ep1b03` · 금이 간 안경 | `cracked-glasses-suite` | `mirror-corridors` · `comparison-echo` | `split-portrait-frames` · `alternating-barrage` |
| `ep1b04` · 탐식의 주방 | `glutton-kitchen` | `counter-maze` · `boiling-floor` | `industrial-stoves` · `inhale-and-expel` |
| `ep1b05` · 붉은 하이힐 | `red-heel-stage` | `spotlight-runways` · `marionette-thread` | `red-heels-and-curtains` · `dance-tempo` |
| `ep1b06` · 맘몬의 금고 | `mammon-vault` | `vault-spokes` · `ledger-laser` | `price-tag-lockers` · `compound-interest` |
| `ep1b06b` · 눈보라 속의 소년 | `mammon-winter-memory` | `frozen-switchbacks` · `ice-debt-ring` | `childhood-vault-door` · `freeze-and-burst` |
| `ep1b07` · 불을 지른 남자 | `hotel-fire` | `burning-stairwell` · `flashover-wall` | `service-carts-and-alarms` · `rage-overheat` |
| `ep1b08` · 하늘에 서려는 자 | `pride-cathedral` | `vertical-cross-lanes` · `gravity-cross` | `white-suit-throne` · `ascension-steps` |
| `ep1b09` · 생체 부트로더 | `bio-bootloader-core` | `neural-concentric` · `boot-sequence-grid` | `cyborg-chairman-cradle` · `four-phase-upload` |
| `u201` · 방어의 군단 | `controller-war-loop` | `marching-grid` · `drone-bombing-loop` | `defense-legion-fabricators` · `recursive-march` |
| `u202` · 잔인한 구원 | `cruel-salvation-prison` | `rising-walls` · `compassion-pressure` | `maintenance-cells` · `wall-growth` |
| `u204` · 시스템의 거부권 | `first-memory-threshold` | `segmented-gates` · `system-veto` | `legacy-human-frames` · `gate-negotiation` |
| `u205` · 관리자 권한 | `admin-abuse-room` | `authority-chambers` · `resource-absorption` | `administrator-console` · `authority-inversion` |
| `u206` · 중앙 코어 이주실 | `central-migration-core` | `core-concentric` · `choice-command-lanes` | `machine-body-cradle` · `migration-countdown` |
| `u203` · 기억의 문 | `controller-memory-gate` | `memory-nexus` · `gate-armor-collapse` | `memory-door-frame` · `structure-break-finale` |
| `last304` · 중립 지역의 재각성 | `fusion-neutral-meadow` | `open-meadow-ruins` · `rift-pulse` | `ruined-castle-stones` · `reawakening` |
| `last305` · 고블린 두목과 장미 인장 | `goblin-flute-forest` | `forest-clearings` · `wolf-command-wave` | `rose-seal-stump` · `flute-call-response` |
| `last301` · 타락천사 기사 | `fallen-angel-black-sea` | `storm-castle-rampart` · `six-sword-cross` | `broken-castle-battlements` · `learn-split-pierce` |
| `last302` · 잠들지 못하는 마을 | `sleepless-port-village` | `tile-roof-lanes` · `thread-pulled-crowd` | `jangseung-and-red-charms` · `crowd-pressure` |
| `last303` · 한약과 불면귀 | `insomnia-black-fog-duel` | `sealed-duel-circle` · `gaze-afterimage` | `herbal-bowl-and-torn-wall` · `one-on-one` |
| `kair01` · 최초명령의 세계 | `first-command-academy` | `core-defense-ring` · `six-wave-core-siege` | `turrets-and-command-core` · `six-wave-defense` |
| `kair04` · 예순여섯 수문장 | `guardian-ruins` | `broken-plaza` · `fatigue-clock` | `harvest-beacons` · `expedition-start` |
| `kair05` · 빼앗긴 시간 | `guardian-time-forest` | `branching-timepaths` · `memory-hourglass` | `time-root-altars` · `branching-cadence` |
| `kair06` · 닫힌 층의 명령 | `guardian-polluted-waterway` | `canal-lanes` · `binding-current` | `neuron-pumps` · `current-shift` |
| `kair07` · 검은 공방 | `guardian-black-workshop` | `forge-switchbacks` · `repetition-forge` | `command-anvils` · `industrial-syncopation` |
| `kair08` · 뉴런 게이트 · 노이론 게이트 | `guardian-neuron-gate` | `synapse-bridges` · `choice-lock` | `brain-archon-connectors` · `neural-gate` |
| `kair09` · 망각의 묘지 | `guardian-oblivion-cemetery` | `clock-graves` · `memory-erasure-sweep` | `broken-hourglass-graves` · `silence-then-surge` |
| `kair10` · 붕괴 의식장 | `guardian-collapsed-ritual` | `fractured-dial` · `optimization-delete-zone` | `command-script-obelisks` · `deletion-crescendo` |
| `kair02` · 아르벨리아, 유예의 수문장 | `arvelia-sealed-corridor` | `stopped-clock-hall` · `deletion-thread` | `unwritten-letters` · `defer-and-cut` |
| `kair03` · 세이렌 모르 | `siren-command-time-core` | `clockwork-arena` · `imperative-command-beat` | `neuron-cables-and-production-lines` · `four-act-free-will` |
| `hando01` · 성 안에 소환된 의목사 | `summoned-castle-defense` | `castle-wall-front` · `siege-wave` | `silver-seal-battlements` · `defense-escalation` |
| `hando02` · 두 주인의 각성 | `castle-collapse-ego-theft` | `breached-ramparts` · `core-theft-line` | `collapsed-wall-segments` · `failure-to-awakening` |
| `hando03` · 함께 되찾은 코어 | `owner-authority-ego-reclaim` | `mirror-throne` · `reclaim-return-path` | `ego-core-and-owner-seal` · `authority-reversal` |
| `murder01` · 윤하람 | `rain-crosswalk` | `traffic-lanes` · `vehicle-path` | `crosswalk-phone-shadow` · `traffic-countdown` |
| `murder02` · 장민재와 새빛호텔 | `saebit-hotel-stair` | `narrow-stairwell` · `gravity-fall-line` | `security-room-and-fire-door` · `vertical-chase` |
| `murder04` · 고서진과 청록빌라 | `teal-villa-testimony` | `apartment-stairs` · `statement-lock` | `unsubmitted-report-drawer` · `evidence-convergence` |
| `murder03` · 옥상의 순환 | `rooftop-mobius-cycle` | `rooftop-loop` · `causal-fall-vector` | `curved-road-and-headlights` · `loop-restart` |
| `cult01` · 하나로 묶인 악몽 | `black-rose-chip-altar` | `implant-aisles` · `chip-injection-grid` | `electronic-forehead-needles` · `infiltration` |
| `cult02` · 교주가 기다리는 전쟁 | `fusion-neural-network` | `choir-halves` · `antiphonal-neural-wave` | `network-choir-pylons` · `left-right-chorus` |
| `cult05` · 돌아오는 현실의 기억 | `id-biotech-vat` | `organic-vat-maze` · `impulse-spawn-pool` | `biotech-limbs` · `biological-surge` |
| `cult06` · 처음 세웠던 목표 | `superego-machine-court` | `judgment-grid` · `verdict-lane` | `mechanical-bench-and-scales` · `sentence-and-release` |
| `cult03` · 사몽의 문턱 | `triune-ego-core-prison` | `three-ring-vault` · `three-layer-extraction` | `ego-superego-id-cradles` · `triune-convergence` |
| `cult04` · 교주의 사몽 | `antichrist-summoning-throne` | `six-limbed-throne` · `moving-command-safe-zone` | `biotech-machine-throne` · `final-summoning` |

## 이미 반영된 구체 수정과 전투 불변조건

- `ep1a07`은 중세 추락 기억 맵을 사용하며 병원/도시 이미지를 앞 에피소드에 역류시키지 않는다. `ep1a08`은 벽이 보이는 폐쇄형 병동, 내부 벽의 “HELP ME” 자산을 우선 사용하고 기존 맵은 로드 실패 대체재로 둔다.
- `murder03`은 옥상과 순환 도로를 함께 보여주는 루프 맵으로 교체했고 실패 시 기존 옥상 맵으로 복구한다. 인물 이름을 몹 이름으로 전환하지 않는다.
- `cult03`은 한리안=`c103-mid`, 백이온=`c103-boss`에 연결한다. 생성 이미지와 십자가/격자/회로 패턴이 해당 보스 슬롯에 붙으며 일반 몹 슬롯은 보존한다.
- `dist00–ep1a07`은 어두운 궁전/회랑/추락 이미지로 확인했다. 특히 `dist03`의 도로는 돌바닥·고딕 성문만 있는 폐허 접근로라 현대 도로 장면이 아니다. 현대 횡단보도/도시 자산은 murder01/murder03에만 배치한다.
- `ep1a08`은 폐쇄 병동 내부 벽과 HELP ME가 보인다. 간호사/의사 같은 실제 의료진은 적이 아니며, 전투 슬롯은 환각·구속·안정화 집행체로만 읽히도록 한다. `murder03`의 옥상·순환 도로는 파란불 회귀 장면과 맞는다.
- 전체 보스 ID 72개는 고유하다. 보스·중간보스·일반 몹 역할, 맵 위험요소, 공격 템포, 스토리 순서를 대조했고, murder 루프/카이로 66 수문장/ cult03 실제 영웅 보스 슬롯/cult04 4페이즈가 별도 회귀 대상이다.
- 구형 전투 초기화는 적 배치/전투 상태만 유지하고, 상호대사 레코드는 빈 줄 목록으로 교체한다. 구형 대사 잠금·무적·적 공격 지연은 진입 때 제거하며 이후 공격 주기는 변경하지 않는다.

## 검증과 한계

- 생성기와 테스트가 업로드 해시, 62개 원문 기록, 56개 전후 카드, 여섯 휴식 구간의 다음 전투 전달, cult04 페이즈, 900자 화면 한도를 대조한다.
- RC55/56 전투 연결, 72 보스 ID, 맵 대체 경로와 서사/몹 연결 테스트를 유지한다. 시각 점검은 dist00, dist03, ep1a07, ep1a08, murder03, cult04 등 대표 경로의 자산을 표본 확인했고, 나머지는 월드 프로필·전투 슬롯 데이터와 정적 테스트로 대조했다.
- 현재 실행 환경에는 Chromium이 없어 이번 패치의 데스크톱/모바일 실게임 전수 플레이는 수행하지 않았다. 따라서 카드 레이아웃의 실제 브라우저 렌더와 전체 56맵 플레이 완료를 통과했다고 주장하지 않는다.
