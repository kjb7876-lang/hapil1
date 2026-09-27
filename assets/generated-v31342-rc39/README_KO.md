# RC39 신규 게임 스프라이트 및 RC41 혈흔 변형

OpenAI ImageGen으로 생성한 개별 RGBA PNG 시안 14종입니다. 파일별로 투명 배경을 유지하며, 아이템 탄환·방어탑·적 캐릭터가 한 이미지에 섞이지 않도록 분리했습니다.

## 탄환 및 오브젝트

- `axe_projectile.png` — 도끼 탄환
- `kitchen_knife_projectile.png` — 식칼 탄환
- `golden_treasure_projectile.png` — 황금 보물상자 탄환
- `paper_money_projectile.png` — 지폐 묶음 탄환
- `dirty_tissue_projectile.png` — 더러운 휴지 뭉치 탄환
- `poison_syringe_volley.png` — 독극물 주사기 3발 묶음
- `truck_projectile.png` — 트럭 충돌 탄환
- `car_projectile.png` — 승용차 충돌 탄환
- `hwando_ego_defense_tower.png` — 환도용 에고 방어탑

## 적 캐릭터

- `zombie_guardian_knight.png` — 좀비 수호기사
- `blindfold_modern_cultist.png` — 눈을 가린 현대 광신도
- `earcovered_modern_cultist.png` — 귀를 막은 현대 광신도
- `gargoyle_mob.png` — 가고일
- `goat_head_demon_mob.png` — 염소머리 악마

## RC41 혈흔 변형 및 서사 배치

각 변형은 원본 실루엣과 투명 배경을 유지하고, 마른 혈흔만 더한 비고어성 게임 이미지입니다.

| 혈흔 자산 | 배치 |
| --- | --- |
| `axe_projectile_bloodied.webp` | `dist03` 핏빛 추격자의 공격 |
| `kitchen_knife_projectile_bloodied.webp` | `ep1b04` 탐식의 주방 공격 |
| `golden_treasure_projectile_bloodied.webp`, `paper_money_projectile_bloodied.webp` | `ep1b06` 맘몬의 금고와 돈·금화 공격 |
| `dirty_tissue_projectile_bloodied.webp` | `ep1b02` 나태의 집 잔해 공격 |
| `poison_syringe_volley_bloodied.webp` | `ep1a09` 주사실의 약품 공격 |
| `car_projectile_bloodied.webp`, `truck_projectile_bloodied.webp` | `murder01` 교통사고와 `murder02` 차량 증거 전투 |
| `assets/props/v31342/hwando-ego-defense-tower-bloodied.webp` | 환도 디펜스 `hando` 구역의 EGO 방어탑 장식 |
| `goat_head_demon_mob_bloodied.webp` | `dist02` 늪의 뿔악마 구역 |
| `gargoyle_mob_bloodied.webp` | `dist05` 검은 기둥 소환진 구역 |
| `zombie_guardian_knight_bloodied.webp` | `ep1b08` 전극 시체 성당 |
| `blindfold_modern_cultist_bloodied.webp`, `earcovered_modern_cultist_bloodied.webp` | `cult01` 흑장미단 신경망 구역 |

캐릭터 이미지는 해당 구역의 기존 일반 적 슬롯에 연결했고, 투사체 이미지는 해당 보스·몹의 스킬 경로에 연결했습니다. 원본 PNG 시안은 유지합니다.
