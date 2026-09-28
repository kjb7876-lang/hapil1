# RC60 독백·맵·전투 연결 점검

원문 `data/rc57/voice-monologue.txt`의 SHA-256: `b7d620e27e9a4d44e0b170f2980047642bcc03b5460b1f8ddcb62ed1040d4add`.
원문 파일은 보존했다. 표시용 원문은 빈 8번을 삭제하고 번호를 01–61로 재정렬했다. 맵 ID는 세이브와 자산 호환을 위해 유지한다.
61개 기록 = 전투 55개 + 쉼터 6개. 쉼터 독백은 다음 전투 전 카드에 포함한다. 최종전은 기존 다단계 독백을 유지한다.

## 수정

- 삭제된 ep1a07 전투는 활성 경로에서 제외했다. dist06 발록전 후 추락 독백 전체를 보여주고 ep1a08 병원으로 이동한다.
- 동료의 악마화 소개는 dist04 전투 전, 동료를 쓰러뜨린 문장은 전투 후로 이동했다. 늪에서 되살아난 전우는 기존 수호자 자산으로 연결했다.
- HELP ME 병원과 RC53/54/56 맵은 지연 설치와 렌더 선택 양쪽에서 우선한다. 다른 맵을 로딩 대체 이미지로 사용하는 경로를 제거했다.
- dist00–dist06은 중세 회상이다. ep1a08 이후 병원·주사실·환자 도시는 원문상 현대 배경이므로 유지한다. ep1a09 전투 후 결전 회상 카드에는 중세 발록 전장 배경을 사용한다.
- 삭제 구간 세이브는 HP·보유 자원을 유지하고 병원 입구에서 새 전투를 시작한다. 기존 전투 적과 파동 완료 상태는 넘기지 않는다.

## 전후 카드와 환경 프로필

| 순서 | 맵 ID | 업로드 제목 | 전투 전 | 전투 후/페이즈 |
|---:|---|---|---|---|
| 01 | `dist00` | 악마화 나무의 정원 | 5문단 / 595자 | 3문단 / 301자 |
| 02 | `dist01` | 거미동굴 | 2문단 / 225자 | 1문단 / 160자 |
| 03 | `dist02` | 늪지대의 뿔악마 | 2문단 / 255자 | 1문단 / 330자 |
| 04 | `dist03` | 무너진성 | 2문단 / 294자 | 1문단 / 56자 |
| 05 | `dist04` | 시체들이 되살아난 밤 | 1문단 / 107자 | 1문단 / 11자 |
| 06 | `dist05` | 일곱 기둥 | 1문단 / 116자 | 1문단 / 100자 |
| 07 | `dist06` | 추락 | 1문단 / 205자 | 3문단 / 365자 |
| 08 | `ep1a08` | 피로 물든 병원 | 2문단 / 262자 | 2문단 / 255자 |
| 09 | `ep1a09` | 주사실과 결전의 날 | 3문단 / 416자 | 3문단 / 380자 |
| 10 | `ep1a10` | 환자와 중독의 도시 | 3문단 / 402자 | 3문단 / 419자 |
| 11 | `ep1a11` | 천사의 가면과 의목사 후보생 | 5문단 / 602자 | 5문단 / 659자 |
| 12 | `ep1b01` | 솔로몬의 봉인식 | 7문단 / 814자 | 3문단 / 361자 |
| 13 | `ep1b02` | 나태의 집 | 3문단 / 392자 | 3문단 / 323자 |
| 14 | `ep1b03` | 금이 간 안경 | 3문단 / 389자 | 2문단 / 308자 |
| 15 | `ep1b04` | 탐식의 주방 | 3문단 / 413자 | 2문단 / 203자 |
| 16 | `ep1b05` | 붉은 하이힐 | 3문단 / 375자 | 2문단 / 278자 |
| 17 | `ep1b06` | 맘몬의 금고 | 2문단 / 239자 | 1문단 / 122자 |
| 18 | `ep1b06b` | 눈보라 속의 소년 | 2문단 / 253자 | 2문단 / 218자 |
| 19 | `ep1b07` | 불을 지른 남자 | 3문단 / 386자 | 2문단 / 265자 |
| 20 | `ep1b08` | 하늘에 서려는 자 | 3문단 / 384자 | 2문단 / 285자 |
| 21 | `ep1b09` | 생체 부트로더 | 4문단 / 488자 | 3문단 / 344자 |
| 22 | `u201` | 방어의 군단 | 6문단 / 666자 | 8문단 / 633자 |
| 23 | `u202` | 잔인한 구원 | 4문단 / 330자 | 4문단 / 338자 |
| 24 | `u204` | 시스템의 거부권 | 4문단 / 305자 | 4문단 / 371자 |
| 25 | `u205` | 관리자 권한 | 2문단 / 142자 | 3문단 / 266자 |
| 26 | `u206` | 중앙 코어 이주실 | 4문단 / 327자 | 3문단 / 230자 |
| 27 | `u203` | 기억의 문 | 1문단 / 128자 | 2문단 / 224자 |
| 28 | `last304` | 중립 지역의 재각성 | 4문단 / 548자 | 2문단 / 208자 |
| 29 | `last305` | 고블린 두목과 장미 인장 | 2문단 / 242자 | 1문단 / 133자 |
| 30 | `last301` | 타락천사 기사 | 2문단 / 211자 | 1문단 / 126자 |
| 31 | `last302` | 잠들지 못하는 마을 | 2문단 / 204자 | 1문단 / 138자 |
| 32 | `last303` | 한약과 불면귀 | 2문단 / 235자 | 2문단 / 227자 |
| 33 | `kair01` | 최초명령의 세계 | 5문단 / 607자 | 6문단 / 816자 |
| 34 | `kair04` | 예순여섯 수문장 | 2문단 / 228자 | 1문단 / 88자 |
| 35 | `kair05` | 빼앗긴 시간 | 2문단 / 199자 | 2문단 / 187자 |
| 36 | `kair06` | 닫힌 층의 명령 | 1문단 / 95자 | 2문단 / 185자 |
| 37 | `kair07` | 검은 공방 | 2문단 / 234자 | 1문단 / 99자 |
| 38 | `kair08` | 뉴런 게이트 · 노이론 게이트 | 1문단 / 101자 | 2문단 / 198자 |
| 39 | `kair09` | 망각의 묘지 | 1문단 / 80자 | 2문단 / 219자 |
| 40 | `kair10` | 붕괴 의식장 | 2문단 / 187자 | 1문단 / 102자 |
| 41 | `kair02` | 아르벨리아, 유예의 수문장 | 2문단 / 212자 | 2문단 / 243자 |
| 42 | `kair03` | 세이렌 모르 | 5문단 / 494자 | 7문단 / 595자 |
| 43 | `hando01` | 성 안에 소환된 의목사 | 6문단 / 635자 | 3문단 / 307자 |
| 44 | `hando02` | 두 주인의 각성 | 2문단 / 196자 | 1문단 / 110자 |
| 45 | `hando03` | 함께 되찾은 코어 | 2문단 / 206자 | 2문단 / 220자 |
| 46 | `murder01` | 윤하람 | 5문단 / 557자 | 4문단 / 489자 |
| 47 | `murder02` | 장민재와 새빛호텔 | 5문단 / 538자 | 2문단 / 222자 |
| 48 | `murder04` | 고서진과 청록빌라 | 7문단 / 801자 | 6문단 / 714자 |
| 49 | `murder03` | 옥상의 순환 | 3문단 / 336자 | 5문단 / 548자 |
| 50 | `cult01` | 하나로 묶인 악몽 | 3문단 / 379자 | 1문단 / 124자 |
| 51 | `cult02` | 교주가 기다리는 전쟁 | 2문단 / 232자 | 1문단 / 128자 |
| 52 | `cult05` | 돌아오는 현실의 기억 | 2문단 / 255자 | 2문단 / 261자 |
| 53 | `cult06` | 처음 세웠던 목표 | 2문단 / 215자 | 1문단 / 124자 |
| 54 | `cult03` | 사몽의 문턱 | 4문단 / 393자 | 1문단 / 133자 |
| 55 | `cult04` | 교주의 사몽 | 1문단 / 114자 | 6문단 / 686자 · 3문단 / 443자 · 9문단 / 825자 |

| 맵 | 환경 키 | 지형·위험 | 소품·템포 |
|---|---|---|---|
| `dist00` · 악마화 나무의 정원 | `demon-tree-palace-garden` | `ruined-palace-garden` · `memory-root-sweep` | `fallen-seraph-roots` · `root-lane-pressure` |
| `dist01` · 거미동굴 | `bone-web-cavern` | `webbed-bridges` · `ceiling-web-drop` | `bone-web-pillars` · `staccato-duel` |
| `dist02` · 늪지대의 뿔악마 | `face-reed-black-swamp` | `sinking-islets` · `grasping-water-hands` | `horn-skull-reeds` · `drag-and-burst` |
| `dist03` · 무너진성 | `summoning-city-approach` | `broken-boulevard` · `road-fissure` | `fallen-guardian-banners` · `forward-pressure` |
| `dist04` · 시체들이 되살아난 밤 | `fallen-guardian-crossing` | `grave-switchbacks` · `revival-rift` | `companion-weapon-markers` · `counter-rhythm` |
| `dist05` · 일곱 기둥 | `seven-pillar-pilgrimage` | `converging-lanes` · `pillar-fire-line` | `summoning-seal-fragments` · `lane-escalation` |
| `dist06` · 추락 | `balrog-gate-circle` | `circular-duel` · `whip-fissure` | `seven-black-columns` · `three-act-crescendo` |
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

## 검증 범위

- 전체 활성 서사 순서와 실제 포털 next 연결 일치, 몹 이미지 파일 존재, 빈 번호 제거, 원문 보존과 전후 카드 분할을 검사한다.
- 병원·중세 맵 자산은 대표 이미지를 직접 확인했고, 맵 설치 실행 순서 두 경우와 렌더러 우선순위를 VM으로 검사한다.
- 기존 사망/쉼터/중간보스 2인 편성 및 구형 대사 격리 회귀 검사를 유지한다.
- Chromium 다운로드가 실패하여 이번 수정의 실제 브라우저 렌더링·전체 게임 플레이는 검증하지 못했다. 전 맵의 시각적 무결성을 보증하는 보고서는 아니다.
