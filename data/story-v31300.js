/* HAPIL_V31300_FINAL_STORY_DATA
 * Generated from the two SHA-locked final TXT sources.
 * Do not hand-edit; run tools/build_v31300_story_data.mjs.
 */
(() => {
  "use strict";
  const deepFreeze = (value) => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  };
  window.__HAPIL_STORY_DATA_V31300__ = deepFreeze({
  "schema": "hapil.story.v31300",
  "version": "3.13.00",
  "dialogue": {
    "schema": "hapil.encounter-dialogue.v31300",
    "version": "3.13.00",
    "sourceFile": "DIALOGUE_FINAL_KO.txt",
    "sourceSha256": "a4a2e6478182e6fe0803493b82a13db80d6acadc26db67da580241316d378689",
    "sourceBytes": 68185,
    "sourceHasUtf8Bom": true,
    "recordCount": 61,
    "combatCount": 55,
    "restCount": 6,
    "lineCount": 285,
    "objectiveCount": 43,
    "emphasisCount": 1,
    "typeCounts": {
      "기억단서": 1,
      "반전단서": 5,
      "상황설명": 164,
      "쉼터대사": 7,
      "영웅대사": 46,
      "영웅대사-대사강조!": 1,
      "장제목": 5,
      "적대사": 54,
      "초천사": 2
    },
    "records": [
      {
        "zone": "dist01",
        "mapNumber": 1,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "dist01",
        "lines": [
          {
            "id": "v31300-dist01-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "가장 오래된 기억은 사람의 뼈로 거미줄을 짠 동굴에서 시작된다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist01-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“너희와 악마가 무엇이 다르지?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist01-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“선을 선택할 수 있다는 점.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist01-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "악마들을 모두 섬멸하여 세상을 되찾아야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "dist02",
        "mapNumber": 2,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "dist02",
        "lines": [
          {
            "id": "v31300-dist02-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "거미동굴 너머에는 검은 늪이 펼쳐져 있었다. 사람 얼굴을 닮은 수초가 떠다니고, 물속의 손들이 발목을 붙잡았다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist02-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“마지막 수호자가 왔군.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist02-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“아직,나는 혼자가 아니야.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist02-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션",
            "sourceSpeaker": "나레이션",
            "sourceType": "상황설명",
            "text": "나는 다시 검을 들어 적들을 베어나갔다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist02-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "늪을 지배하는 뿔악마의 뿔에는 죽은 수호자들의 머리가 매달려 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 5
      },
      {
        "zone": "dist03",
        "mapNumber": 3,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "dist03",
        "lines": [
          {
            "id": "v31300-dist03-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "무너진 도시 중심으로 이어지는 접근로에는 검은 재와 끊어진 봉인 사슬만 남아 있다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist03-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "아직 모습을 드러내지 않은 문지기의 흔적을 따라 핏빛 추격자들을 제거하며 돌파해야한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 2
      },
      {
        "zone": "dist04",
        "mapNumber": 4,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "dist04",
        "lines": [
          {
            "id": "v31300-dist04-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "지옥불에 그을린 방패와 거대한 채찍 자국이 묘도 안쪽으로 이어진다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist04-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "쓰러진 수호자의 악마잔영을 지나 소환진의 두 번째 외곽문을 열어야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 2
      },
      {
        "zone": "dist05",
        "mapNumber": 5,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "dist05",
        "lines": [
          {
            "id": "v31300-dist05-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "일곱 검은 기둥이 타오르지만 소환진 안의 거대한 그림자는 아직 형체를 드러내지 않았다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist05-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "문지기 징후",
            "sourceSpeaker": "문지기 징후",
            "sourceType": "상황설명",
            "text": "기둥에 남은 불씨와 채찍 자국만이 안쪽에서 기다리는 문지기를 예고하고 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist05-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "기둥을 지키는 악마를 쓰러뜨리고 마지막 봉인 사슬 앞까지 전진하여야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 3
      },
      {
        "zone": "dist06",
        "mapNumber": 6,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "dist06",
        "lines": [
          {
            "id": "v31300-dist06-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "소환진은 무너진 도시의 중심에 있었다. 검은 기둥 일곱 개 사이에서 불길이 솟았고, 박쥐 날개와 황소 뿔을 지닌 발록이 걸어 나왔다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist06-line-02",
            "number": 2,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“네가 최초의 악마인가?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist06-line-03",
            "number": 3,
            "side": "enemy",
            "speaker": "발록 · 지옥의 문지기",
            "sourceSpeaker": "발록 · 지옥의 문지기",
            "sourceType": "적대사",
            "text": "“아니아니아니 옳지않아, 너는 지금 원인과 결과를 혼동하고 있는거다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist06-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "발록의 채찍이 도로를 갈랐다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist06-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "발록 · 지옥의 문지기",
            "sourceSpeaker": "발록 · 지옥의 문지기",
            "sourceType": "적대사",
            "text": "“그만 포기하면 편해진다. 너는 이미 기억도, 이름도, 돌아갈 곳도 모두 잃었다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist06-line-06",
            "number": 6,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“그래도 ... 싸운다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist06-line-07",
            "number": 7,
            "side": "enemy",
            "speaker": "발록 · 지옥의 문지기",
            "sourceSpeaker": "발록 · 지옥의 문지기",
            "sourceType": "적대사",
            "text": "“무엇을 위해서?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dist06-line-08",
            "number": 8,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사-대사강조!",
            "text": "“내가 살아 있어야 그들의 존재를 지킬 수 있으니까. 인식론에 의거하여 나를 지키는 일과 세계를 지키는 일은 같은 방향을 가리킨다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": true,
            "emphasisStyleV31300": "gungseo"
          }
        ],
        "lineCount": 8
      },
      {
        "zone": "ep1a07",
        "mapNumber": 7,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1a07",
        "lines": [
          {
            "id": "v31300-ep1a07-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "전투 회고",
            "sourceSpeaker": "전투 회고",
            "sourceType": "상황설명",
            "text": "발록의 검이 어깨를 가르고 불덩이가 하늘을 뒤덮었다. 무너진 기둥 뒤에서 숨을 고르자 천사가 속삭였다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a07-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "초천사의 목소리",
            "sourceSpeaker": "초천사의 목소리",
            "sourceType": "초천사",
            "text": "— 고통을 없애 주겠다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a07-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "전투 회고",
            "sourceSpeaker": "전투 회고",
            "sourceType": "상황설명",
            "text": "나는 불길 속으로 뛰어들었고 마침내 놈의 가슴에 검을 박을 수 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a07-line-04",
            "number": 4,
            "side": "enemy",
            "speaker": "발록 · 지옥의 문지기",
            "sourceSpeaker": "발록 · 지옥의 문지기",
            "sourceType": "적대사",
            "text": "“네가 듣는 목소리를…… 확신하지 마라...”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a07-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "발록 · 지옥의 문지기",
            "sourceSpeaker": "발록 · 지옥의 문지기",
            "sourceType": "적대사",
            "text": "“내가 쓰러졌으니 이제 지옥이 열리겠군.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a07-line-06",
            "number": 6,
            "side": "enemy",
            "speaker": "초천사의 목소리",
            "sourceSpeaker": "초천사의 목소리",
            "sourceType": "초천사",
            "text": "— 소환진을 파괴해. 그러면 모든 고통은 사라질거야.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a07-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "검을 내려치자. 소환진이 갈라지고, 세상이 무너졌다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a07-line-08",
            "number": 8,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "검은 소용돌이가 도시를 집어삼켰다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a07-line-09",
            "number": 9,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“나는 누구지?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a07-line-10",
            "number": 10,
            "side": "enemy",
            "speaker": "초천사의 목소리",
            "sourceSpeaker": "초천사의 목소리",
            "sourceType": "적대사",
            "text": "— 너는 수호자야. 나를 믿어.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 10
      },
      {
        "zone": "ep1a08",
        "mapNumber": 8,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1a08",
        "lines": [
          {
            "id": "v31300-ep1a08-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "눈을 뜨자 차가운 형광등과 소독약 냄새가 나를 맞았다. 갑옷 대신 환자복을 입고 있었고, 손목은 침대에 묶여 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a08-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "복도 바닥에는 피가 이어져 있었고 벽에는 붉은 글씨가 적혀 있었다.\nHELP ME.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a08-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "곧 의사가 나타났지만 그의 말은 내 귀에서 “육육육…… 루시퍼…… 복종……”으로 뒤틀려 들렸다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a08-line-04",
            "number": 4,
            "side": "enemy",
            "speaker": "초천사의 목소리",
            "sourceSpeaker": "초천사의 목소리",
            "sourceType": "적대사",
            "text": "— 치료라는 말은 함정... 저들을 믿으면 영혼을 빼앗길거다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a08-line-05",
            "number": 5,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“어느 쪽이 정답 인거지?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a08-line-06",
            "number": 6,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "피와 악마로 보이던 것들이 소독약과 의료진으로 되돌아오며, 환각과 현실이 같은 복도 위에서 겹쳐졌다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a08-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "위험한 감각...",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a08-line-08",
            "number": 8,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "하지만, 그렇게 낯설지만은 않았다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a08-line-09",
            "number": 9,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "주사기를 든 간호사가 다가왔다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 9
      },
      {
        "zone": "ep1a09",
        "mapNumber": 9,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1a09",
        "lines": [
          {
            "id": "v31300-ep1a09-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "손끝이 떨리고 뼛속을 벌레가 기어 다니는 듯했다. 혀가 마르고 온몸이 뒤틀리는 기분.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a09-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“너는 여기서 끝이다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a09-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“아니, 끝을 정하는 건 너희가 아니야.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a09-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "주사실의 약병에는 성수가 아니라 FENTANYL이라고 적혀 있다. 천사의 구원과 몸의 갈망이 같은 목소리로 들려왔다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a09-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "초천사의 목소리",
            "sourceSpeaker": "초천사의 목소리",
            "sourceType": "적대사",
            "text": "— 성수... 고통을 없애 줄 거야.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a09-line-06",
            "number": 6,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "약을 지키는 적을 쓰러뜨리는 싸움처럼 보이지만, 실상 실제 적은 약을 구원으로 바꾸어 인식시키는 갈망이었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a09-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "모든 것이 하얗게 타올랐다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a09-line-08",
            "number": 8,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "복도 끝의 주사실을 보는 순간, 머리보다 몸이 먼저 반응했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a09-line-09",
            "number": 9,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "서랍 깊은 곳에서 약병 하나를 찾았다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a09-line-10",
            "number": 10,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "어두운 방과 녹슨 숟가락, 쓰러져 있던 사람의 기억...",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 10
      },
      {
        "zone": "ep1a10",
        "mapNumber": 10,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1a10",
        "lines": [
          {
            "id": "v31300-ep1a10-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "나는 주사실 바닥에서 깨어났다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a10-line-02",
            "number": 2,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“잘못을 하며 살아왔어, 하지만 아직 난 살아 있어.그러니 아직 선을 택할 수 있어!!!”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a10-line-03",
            "number": 3,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "— 아니야. 너는 선택받은 존재... 너에게 자유는 존재하지 않는다!",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a10-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "반전 단서",
            "sourceSpeaker": "반전 단서",
            "sourceType": "상황설명",
            "text": "폐허의 수많은 시체는 외부의 수호자가 아니라, 약을 처음 사용하고 더 강한 자극을 찾았던 자기 자신의 가능성들이었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a10-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "천사의 이마에 검은 숫자가 떠올랐다. 666",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 5
      },
      {
        "zone": "ep1a11",
        "mapNumber": 11,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1a11",
        "lines": [
          {
            "id": "v31300-ep1a11-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "흰 날개가 검게 물들고 머리에서 뿔이 솟아 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a11-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "검게 물든 초천사",
            "sourceSpeaker": "검게 물든 초천사",
            "sourceType": "적대사",
            "text": "“내가 없으면 너는 아무것도 아니다. 평범한 중독자를 마지막 수호자로 만들어 너를 다시 위대하게 만든건 바로 나야!”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a11-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“그건 ... 거짓된 의미였어.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a11-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "반전 단서",
            "sourceSpeaker": "반전 단서",
            "sourceType": "상황설명",
            "text": "치료를 막고 고립을 칭찬하던 목소리의 가면에 금이 간다...",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a11-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "검게 물든 초천사",
            "sourceSpeaker": "검게 물든 초천사",
            "sourceType": "적대사",
            "text": "“평범한 환자로 돌아가면 네게 무엇이 남지?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a11-line-06",
            "number": 6,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“나약한 나까지 인정하고도 살아가는 선택이 남아.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1a11-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "가면 안의 목소리가 누구인지 직접 확인하고, 치료를 거부하게 만드는 명령을 끊어야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 7
      },
      {
        "zone": "dreamRest",
        "mapNumber": 12,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "dreamRest",
        "lines": [
          {
            "id": "v31300-dreamRest-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "악몽이 멎자 병원 상담실을 닮은 쉼터가 나타났다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dreamRest-line-02",
            "number": 2,
            "side": "hero",
            "speaker": "미카엘라",
            "sourceSpeaker": "미카엘라",
            "sourceType": "쉼터대사",
            "text": "“맥박과 동공 반응은 정상이네요. 그런데…… 왜 내가 이런 걸 먼저 확인했지?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dreamRest-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "미카엘라",
            "sourceSpeaker": "미카엘라",
            "sourceType": "쉼터대사",
            "text": "“의목사 교단에 오기 전의 일은 잘 기억나지 않아요.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-dreamRest-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "장제목",
            "text": "제2부 — 일곱 개의 귀와 하이테크 축귀",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "ep1b01",
        "mapNumber": 13,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1b01",
        "lines": [
          {
            "id": "v31300-ep1b01-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "지하 예배당의 장치는 환각과 악몽, 억압된 기억을 신경 데이터로 추출해 가상세계로 재구성했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b01-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“다시 영웅이 되고 싶지 않나?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b01-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“아니, 영웅이 아니어도 상관없어.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b01-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "누군가가 그들의 악몽을 듣고 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "ep1b02",
        "mapNumber": 14,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1b02",
        "lines": [
          {
            "id": "v31300-ep1b02-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "의목사로 전직한후 첫임무.\n첫 대상의 집은 현관부터 썩어 가고 있었다. 음식물과 페트병, 쓰레기봉투가 거실을 메웠고, 창문은 검은 비닐로 막혀 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b02-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“일어나서 뭐 하죠? 일어나도 아무것도 달라지지 않는데...”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b02-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“누워 있으면 뭐 달라집니까?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b02-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "남자는 한가운데 누워 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "ep1b03",
        "mapNumber": 15,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1b03",
        "lines": [
          {
            "id": "v31300-ep1b03-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "누나의 집은 먼지 한 톨 없이 정돈되어 있었다. 그러나 거실에는 칼과 볼펜으로 훼손한 한 여자의 사진이 붙어 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b03-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“그 여자는 노력도 안 했는데 왜 모든 걸 가진 거죠?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b03-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“노력한 만큼 인정받고 싶었습니까?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b03-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "검은 신호는 서윤과 호텔로 이어져 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "ep1b04",
        "mapNumber": 16,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1b04",
        "lines": [
          {
            "id": "v31300-ep1b04-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "호텔 주방에서는 값비싼 음식이 모양이 조금 흐트러졌다는 이유로 버려지고 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b04-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“최고가 아니면 쓰레기일뿐.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b04-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“아니, 너의 목표는 서윤에게 선택받는 것일뿐.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b04-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "호텔 전체를 잇는 검은 신호는 더욱 굵어져 가고 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "ep1b05",
        "mapNumber": 17,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1b05",
        "lines": [
          {
            "id": "v31300-ep1b05-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "서윤은 완벽한 미소를 지녔지만, 항상 진심이 아니었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b05-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“사랑은 자신을 고통스럽게도 하지. 상사병이란 그런것.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b05-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“그것을 사랑이라 포장한다고 진실을 숨길 수는 없어.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b05-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "검은 신호는 호텔 최상층으로 모여들고 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b05-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "붉은 조명 아래 끝없는 무대가 펼쳐졌다. 서윤의 등에는 수백 개의 투명한 실이 연결되어 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 5
      },
      {
        "zone": "ep1b06",
        "mapNumber": 18,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1b06",
        "lines": [
          {
            "id": "v31300-ep1b06-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "총지배인의 몽세는 금고와 겨울 산장이 결합된 공간이었다. 탐욕의 귀는 그의 얼굴과 여우의 눈을 하고 지폐를 칼날로 바꾸고는 했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b06-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“사람에게는 각자에 맞는 가격이 있지.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b06-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“그래서 당신은 서윤에게 사랑이 아니라 조건을 숨긴 거래를 제안한거 겠지요.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b06-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "수백 개의 동전이 모두 뒷면을 보였다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "ep1b06b",
        "mapNumber": 19,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1b06b",
        "lines": [
          {
            "id": "v31300-ep1b06b-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b06b-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“그때 돈만 있었으면 엄마는 죽지 않을 수 있었어!”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b06b-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“네가 겪은 일은 네 잘못이 아니야. 하지만, 네가 다른 사람에게 고통을 준 것까지 정당화 되지는 않아.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b06b-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "사무실 벽이 열렸다. 수천 개의 검은 신경 케이블이 비밀 통로 안으로 이어져 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "ep1b07",
        "mapNumber": 20,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1b07",
        "lines": [
          {
            "id": "v31300-ep1b07-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "통로에 들어가려는 순간 호텔에 불이 났다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b07-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“왜 세상은 언제나 나에게 분노를 표출하는가... 이제는 내가 분노가 되어 세상에 표출하겠다!!!”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b07-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“정당한 분노는 잘못이 아닙니다, 하지만 다른 사람의 아이들까지 태우는 분노마저 정당화 할 수 없어요.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b07-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "계단 앞의 청소부는 숯처럼 붉은 눈으로 웃고 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "ep1b08",
        "mapNumber": 21,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1b08",
        "lines": [
          {
            "id": "v31300-ep1b08-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "나는 거꾸로 된 십자가와 피로 그린 육망성, 전극이 박힌 시체로 가득한 성당에 떨어졌다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b08-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“내가 하늘에 서겠다. 인간은 내 선택을 통해 먹고 일할뿐, 내가 가격을 정하면 가치가 생기고, 내가 외면한다면 그 존재는 사라지게 된다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b08-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“당신은 신이 아닙니다. 타인의 선택지를 줄여 놓고 자신이 선택받았다고 착각하는 선민사상을 가진 나르시스트일 뿐.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b08-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "일곱 죄악의 배후에 있던 회장은 인간형 육체를 유지한 채 죄악의 힘을 통제한다. 이 전투는 악마의 껍데기보다 그것을 선택한 인간의 의지를 겨눈다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b08-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "회장의 인간형과 변형 단계를 모두 버텨야 생체 부트로더와 외부 신호의 연결이 드러난다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b08-line-06",
            "number": 6,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "제단 뒤에서 인간의 뇌를 닮은 연산핵이 열렸다. 수백 개의 화면에서 회장의 얼굴이 떠올랐다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b08-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "백색 정장을 입은 회장은 인간의 욕망을 기록한 일곱 갈래 신호 앞에 서 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 7
      },
      {
        "zone": "ep1b09",
        "mapNumber": 22,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "ep1b09",
        "lines": [
          {
            "id": "v31300-ep1b09-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "검은 태양 아래 설원에서 사이보그 개들이 눈보라를 헤치고 달려든다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b09-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "기계화된 회장",
            "sourceSpeaker": "기계화된 회장",
            "sourceType": "적대사",
            "text": "“포기했나?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b09-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“아니요, 당신이 학습할 수 없는 선택을 하려는 겁니다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b09-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "설원 아래에서 기계 다리 수십 개를 지닌 회장이 솟아오르고, 호텔과 서버실이 전선으로 이어진다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b09-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "기계화된 회장",
            "sourceSpeaker": "기계화된 회장",
            "sourceType": "적대사",
            "text": "“원본에 집착하는 것은 죽음을 두려워하는 자뿐이지.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b09-line-06",
            "number": 6,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“고통을 숫자로만 본 당신에게 계산할 수 없는 선택을 보여 주겠습니다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-ep1b09-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "회장이 복제한 공격 패턴을 넘어서 생체 부트로더의 연산핵을 끊어야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 7
      },
      {
        "zone": "restEp1b",
        "mapNumber": 23,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "restEp1b",
        "lines": [
          {
            "id": "v31300-restEp1b-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "현세의 귀환 경보가 울렸지만 접속 캡슐은 비어 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restEp1b-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "화면에는 사라진 의목사와 정체불명의 어린아이, 두 파형만 남았다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restEp1b-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "미카엘라",
            "sourceSpeaker": "미카엘라",
            "sourceType": "쉼터대사",
            "text": "“두 파형이 따로 있는 게 아니에요. 서로 겹쳐지고 있어요.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restEp1b-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "한 사람의 실종은 또 다른 아이의 몽세로 향하는 문이 되었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restEp1b-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "장제목",
            "text": "제3부 — U2, 통제자의 17단계",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 5
      },
      {
        "zone": "u201",
        "mapNumber": 24,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "u201",
        "lines": [
          {
            "id": "v31300-u201-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "의목사 A가 사라진 뒤, 교단은 일곱 대죄 사건의 배후를 조사하기 위해 의목사 B를 파견했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u201-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“당신들은 저것을 침입자라 부르겠지. 하지만 기계군단은 아이가 살아남기 위해 만든 의식이라네. 자네가 혐오하는 것은 악이 아니라 지나치게 정교해진 방어시스템일수 있다네.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u201-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "의목사B가 군단을 베어 낼수록 더 많은 기계가 조립되어 갔다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u201-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "물리 법칙보다 확신과 해석이 먼저 세계를 만들었다. 의목사B의 선의는 벽이 되고 사명감은 적의 동력이 되었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "u202",
        "mapNumber": 25,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "u202",
        "lines": [
          {
            "id": "v31300-u202-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "〔제5단계 — 잔인한 구원〕",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u202-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“그 잔인함을 선의라는 라벨로 포장하고 안심하는 것 아닌가?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u202-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "그러나 의목사B는 기억을 지우는 것과 기억에 지배되지 않는 것이 다르다고 판단했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u202-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "통제자는 인간으로 돌아가라는 치료가 결국 고통이 기본값인 삶으로 돌려보내는 일이라며 비웃었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "u204",
        "mapNumber": 26,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "u204",
        "lines": [
          {
            "id": "v31300-u204-line-01",
            "number": 1,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“고통을 통과해야 성장한다는 말은 아이에게 두 번째 살해를 요구하는 강압일 뿐이라네.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u204-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "의목사B는 고통을 다시 겪게 하는 것이 아니라, 혼자 겪지 않게 하는 것이 자신의 역할임을 붙들었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 2
      },
      {
        "zone": "u205",
        "mapNumber": 27,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "u205",
        "lines": [
          {
            "id": "v31300-u205-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "〔제13단계 — 관리자 권한〕",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u205-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“자네가 기도라 부르는 힘은 내게는 자원일 뿐이라네. 이 몽세의 재구성 키는 내가 쥐고 있지.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u205-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "의목사B가 축귀 시스템의 출력을 높이자 통제자는 그 힘마저 흡수해 버렸다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u205-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "두 번째 문이 열리고 아이가 전쟁 뒤 겪은 학대가 드러났다. 의목사B의 눈빛이 흔들리자 통제자가 속삭였다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "u206",
        "mapNumber": 28,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "u206",
        "lines": [
          {
            "id": "v31300-u206-line-01",
            "number": 1,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“기계가 되어 영원한 평온을 누리는 편이 더 혁신적인 구원이 아닌가?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u206-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "의목사B는 아이를 다시 고통 속에 혼자 던지는 길도, 고통을 없애기 위해 인간성을 삭제하는 길도 선택하지 않았다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 2
      },
      {
        "zone": "u203",
        "mapNumber": 29,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "u203",
        "lines": [
          {
            "id": "v31300-u203-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "열일곱 단계의 끝에서 통제자와 기억의 문이 한 전장에 겹쳐진다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u203-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "통제자",
            "sourceSpeaker": "통제자",
            "sourceType": "적대사",
            "text": "“기억을 열면 아이는 다시 고통 속으로 돌아간다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u203-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“문을 부수지는 않겠습니다. 다만, 당신이 쥔 명령권만 끊겠습니다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u203-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "아이의 상처와 의목사B의 선의가 기계 갑옷의 재료처럼 서로 얽히기 시작한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u203-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "통제자",
            "sourceSpeaker": "통제자",
            "sourceType": "적대사",
            "text": "“구원도 반복 가능한 명령으로 만들면 실패하지 않는다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u203-line-06",
            "number": 6,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“사람을 살리는 선택을 당신의 반복문이 대신할 수 없습니다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-u203-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "기억 자체를 파괴하지 말고 통제자의 명령 구조만 겨냥해야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 7
      },
      {
        "zone": "restU2",
        "mapNumber": 30,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "restU2",
        "lines": [
          {
            "id": "v31300-restU2-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "통제자가 무너지자 의목사 B의 몸과 첫째의 의지가 하나의 전투 자아로 겹쳐졌다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restU2-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "첫째는 환도가 되었고, 의목사 B는 그 칼을 쥔 형상이 되었다. 그렇게 환도 영웅이 태어났다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restU2-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "흑장미단은 둘째의 잔혹 동화 몽세와 셋째의 무속 몽세를 강제로 합쳤다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restU2-line-04",
            "number": 4,
            "side": "hero",
            "speaker": "미카엘라",
            "sourceSpeaker": "미카엘라",
            "sourceType": "쉼터대사",
            "text": "“찾으러 가는 사람은 둘인데…… 왜 물컵을 세 잔 이나 꺼냈지?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restU2-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "환도 영웅은 둘째와 셋째를 찾기 위해 융합몽세로 들어갔다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 5
      },
      {
        "zone": "last304",
        "mapNumber": 31,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "last304",
        "lines": [
          {
            "id": "v31300-last304-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "환도 영웅은 젖은 풀숲에서 눈을 떴다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last304-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "그곳은 둘째의 잔혹 동화 몽세와 셋째의 무속 몽세가 맞붙은 중립 지역이었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last304-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "의목사 B의 이름은 잊었지만, 환도 안에는 동생들을 찾아야 한다는 첫째의 의지가 남아 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 3
      },
      {
        "zone": "last305",
        "mapNumber": 32,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "last305",
        "lines": [
          {
            "id": "v31300-last305-line-01",
            "number": 1,
            "side": "enemy",
            "speaker": "고블린 두목",
            "sourceSpeaker": "고블린 두목",
            "sourceType": "적대사",
            "text": "“무너진 성이 그 칼을 기억하고 있다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last305-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "장미 인장과 환도가 공명하자 공간 균열이 열렸다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last305-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "환도 속 목소리",
            "sourceSpeaker": "환도 속 목소리",
            "sourceType": "기억단서",
            "text": "“동생들…….”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 3
      },
      {
        "zone": "last301",
        "mapNumber": 33,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "last301",
        "lines": [
          {
            "id": "v31300-last301-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "폭풍 속 무너진 성벽 위로 타락천사 기사가 말없이 강림한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last301-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "타락천사 기사",
            "sourceSpeaker": "타락천사 기사",
            "sourceType": "적대사",
            "text": "“네 검로는 이미 읽었다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last301-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“읽었다면, 아직 고르지 않은 다음 수도 막아 봐.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last301-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "분열하는 여섯 형상의 검격을 구분하며 성벽 가장자리에서 거리를 지켜야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "last302",
        "mapNumber": 34,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "last302",
        "lines": [
          {
            "id": "v31300-last302-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "파도에 떠밀린 환도 영웅이 눈을 뜬 곳에는 부서진 기와와 붉은 부적, 장승이 흩어져 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last302-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "잠들지 못한 주민들이 보이지 않는 실에 끌리듯 환도 영웅에게 달려들었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last302-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "그곳은 고려와 조선의 풍경이 겹친 셋째의 동양 몽세였다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 3
      },
      {
        "zone": "last303",
        "mapNumber": 35,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "last303",
        "lines": [
          {
            "id": "v31300-last303-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "안개 속의 남자가 건넨 한약이 환도 영웅의 흐릿한 정신을 붙들었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last303-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "불면귀",
            "sourceSpeaker": "불면귀",
            "sourceType": "적대사",
            "text": "“너에게는 왜 통하지 않는 거지?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last303-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“잠들지 못한 공포와 네 명령은 같은 것이 아니니까.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last303-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "검은 안개가 주민에게서 떨어져 나와 거대한 불면귀의 형체를 이뤘다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last303-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "불면귀",
            "sourceSpeaker": "불면귀",
            "sourceType": "적대사",
            "text": "“눈을 감는 순간 네 기억부터 삼키겠다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last303-line-06",
            "number": 6,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "주민이 아니라 안개 본체만 겨냥해 핵이 드러나는 순간을 노려야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-last303-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "반전단서",
            "text": "불면귀가 쓰러지자 모든 시계가 멈추고, 균열 너머에서 검은 모래와 낯선 명령문이 쏟아졌다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 7
      },
      {
        "zone": "restLast3",
        "mapNumber": 36,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "restLast3",
        "lines": [
          {
            "id": "v31300-restLast3-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "불면귀의 포털에 전혀 다른 몽세의 시간 특이점이 끼어들었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restLast3-line-02",
            "number": 2,
            "side": "hero",
            "speaker": "미카엘라",
            "sourceSpeaker": "미카엘라",
            "sourceType": "쉼터대사",
            "text": "“다음 장소는... 원인을 만든 시간으로 이어지고 있어요.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restLast3-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "장제목",
            "text": "제5부 — 카이로노미콘",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 3
      },
      {
        "zone": "kair01",
        "mapNumber": 37,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "kair01",
        "lines": [
          {
            "id": "v31300-kair01-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "입학식 날 최초명령 코어에 검은 모래가 스며들고 여섯 차례의 침공 파동이 시작된다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair01-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "세이렌 모르의 방송",
            "sourceSpeaker": "세이렌 모르의 방송",
            "sourceType": "적대사",
            "text": "“인간은 자기 시간을 지킬 능력이 없는 존재이다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair01-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“네가 하는 건 회수가 아니라 강탈일 뿐이야.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair01-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "마지막 파동이 실제로 끝날 때까지 최초명령 코어의 오염도를 억제해야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "kair04",
        "mapNumber": 38,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "kair04",
        "lines": [
          {
            "id": "v31300-kair04-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "학교 밖 금역에는 인간의 시간을 수확하는 아르콘 수문장 예순여섯이 층별로 배치되어 있다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair04-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "시간 수확관",
            "sourceSpeaker": "시간 수확관",
            "sourceType": "적대사",
            "text": "“할당되지 않은 시간은 회수 대상일뿐.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair04-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“누구의 삶도 네 생산표에 속하지 않아.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair04-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "첫 수확 관문을 열고 수문장들이 빼앗는 시간의 종류를 확인해야한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "kair05",
        "mapNumber": 39,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "kair05",
        "lines": [
          {
            "id": "v31300-kair05-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "과로·망각·속박의 일반 수문장들이 서로 다른 시간을 수확해 한 관문으로 보냈다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair05-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "일반 수문장",
            "sourceSpeaker": "일반 수문장",
            "sourceType": "적대사",
            "text": "“성과를 남기지 못한 시간은 폐기한다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair05-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "마흔여덟 수문장의 연결을 나누어 검은 모래의 유입을 줄인다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 3
      },
      {
        "zone": "kair06",
        "mapNumber": 40,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "kair06",
        "lines": [
          {
            "id": "v31300-kair06-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "상급 수문장 열둘과 대수문장 여섯이 다음 층의 통로를 봉쇄한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair06-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "각 수문장의 명령 범위를 확인한 뒤 겹치지 않는 틈으로 전진한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 2
      },
      {
        "zone": "kair07",
        "mapNumber": 41,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "kair07",
        "lines": [
          {
            "id": "v31300-kair07-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "검은 공방은 결과로 환산되지 않는 시간을 검은 모래로 태워 아르콘의 동력으로 바꾼다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair07-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "대수문장 04",
            "sourceSpeaker": "대수문장 04",
            "sourceType": "적대사",
            "text": "“성과를 만들지 못한 시간은 존재할 이유가 없다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair07-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“멈춘 시간도, 실패한 시간도 그 사람의 삶이야.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair07-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "삭제된 가능성이 용광로에서 불꽃처럼 쏟아지고 명령선이 공방 전체를 조인다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair07-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "가능성을 태우지 않도록 동력로와 명령선을 분리해 끊어야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 5
      },
      {
        "zone": "kair08",
        "mapNumber": 42,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "kair08",
        "lines": [
          {
            "id": "v31300-kair08-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "뉴런 게이트는 인간의 뇌와 아르콘을 강제로 연결하는 크로노보로스 교단의 관문이었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair08-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "그들의 노이론 게이트는 인간의 뇌와 아르콘을 강제로 연결했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair08-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“네가 하는 건 회수가 아니라 강탈일 뿐이야.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair08-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "게이트는 서하의 움직임까지 명령문으로 바꾸려 했다. 서하는 강제로 입력되는 문장 사이의 짧은 틈을 카이로스의 순간으로 겨우 붙잡았다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "kair09",
        "mapNumber": 43,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "kair09",
        "lines": [
          {
            "id": "v31300-kair09-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "망각의 묘지에는 죽은 사람 대신 포기한 꿈과 실패한 선택의 기록이 묻혀 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair09-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "기억은 고통만을 남긴다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair09-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“아니, 망가진 시간도 누군가에게는 필요했던 시간이야.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair09-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "묘지의 봉인이 풀리자 빼앗긴 기억들이 수천 개의 시계 파편으로 일어섰다. 서하는 기억을 파괴하지 않고 묘지기의 삭제 명령만 베어야 했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "kair10",
        "mapNumber": 44,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "kair10",
        "lines": [
          {
            "id": "v31300-kair10-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "붕괴 의식장은 예순여섯 수문장이 수확한 시간을 세이렌의 코어로 보내는 마지막 전송소다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair10-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "대수문장 06",
            "sourceSpeaker": "대수문장 06",
            "sourceType": "적대사",
            "text": "“가장 자비로운 명령은 선택지를 남기지 않는 것.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair10-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“선택할 수 없다면 살아 있는 시간이라고 할 수 없어.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair10-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "검은 모래 기둥과 여섯 명령 고리가 봉인 회랑의 문을 둘러싼다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair10-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "문 너머의 존재를 단정하기 전에 여섯 명령 고리를 실제로 끊어 길을 열어야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 5
      },
      {
        "zone": "kair02",
        "mapNumber": 45,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "kair02",
        "lines": [
          {
            "id": "v31300-kair02-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "모든 초침이 멈춘 봉인 회랑에서 유예의 수문장 아르벨리아가 삭제 명령을 반복한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair02-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "아르벨리아 · 유예의 수문장",
            "sourceSpeaker": "아르벨리아 · 유예의 수문장",
            "sourceType": "적대사",
            "text": "“결과 없음. 생산 없음. 그러므로 ... 삭제 대상.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair02-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“효율적인 시간만이 항상 옳은 결과를 내는것은 아니야!”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair02-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "아르벨리아를 파괴하지 않고 변조된 명령의 실만 식별해 베어야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "kair03",
        "mapNumber": 46,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "kair03",
        "lines": [
          {
            "id": "v31300-kair03-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "오염된 시간 코어에서 세이렌 모르가 나타나 전장을 하나의 명령 아래 고정한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair03-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "세이렌 모르",
            "sourceSpeaker": "세이렌 모르",
            "sourceType": "적대사",
            "text": "“나는 시간을 빼앗지 않았다. 너희가 망친 시간을 회수했을 뿐.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair03-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“아니, 망가진 시간도 누군가에게는 필요했던 시간이야.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair03-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "검은 모래와 시계바늘, 노이론 케이블이 서하의 선택지를 차례로 좁힌다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair03-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "세이렌 모르",
            "sourceSpeaker": "세이렌 모르",
            "sourceType": "적대사",
            "text": "“그 무가치한 시간까지 지키겠다는 건가?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair03-line-06",
            "number": 6,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“그러한 시간이 있어야 비로소 인간으로 존재할 수 있으니까.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-kair03-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "시간 수확·최적화된 명령·영원한 작업장의 세 단계를 모두 통과해야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 7
      },
      {
        "zone": "restKairo",
        "mapNumber": 47,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "restKairo",
        "lines": [
          {
            "id": "v31300-restKairo-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "세이렌이 쓰러진 뒤, 서하는 코어에 새로운 최초명령을 기록했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restKairo-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "자유의지와 미래 예지가 맞닿는 순간 시간 특이점이 폭발했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restKairo-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "미카엘라",
            "sourceSpeaker": "미카엘라",
            "sourceType": "쉼터대사",
            "text": "“파형이 과거 방향으로 역류하고 있어요.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restKairo-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "충격은 둘째와 셋째의 융합몽세까지 번져, 두 사람의 세계를 하나의 성으로 다시 썼다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restKairo-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "장제목",
            "text": "제6부 — 환도디펜스",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 5
      },
      {
        "zone": "hando01",
        "mapNumber": 48,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "hando01",
        "lines": [
          {
            "id": "v31300-hando01-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "환도 영웅은 둘째와 셋째의 몽세가 하나의 성으로 재구성된 장소에 떨어졌다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-hando01-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "성 안의 두 목소리는 모든 결정과 책임을 환도 영웅에게 맡기려 했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-hando01-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "환도 영웅이 잠시 무너지자 성벽도 무너졌고, 악몽의 우두머리가 공동 EGO 코어를 빼앗았다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 3
      },
      {
        "zone": "hando02",
        "mapNumber": 49,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "hando02",
        "lines": [
          {
            "id": "v31300-hando02-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "성벽이 밀리자 두 몽세의 주인은 더 이상 모든 책임을 환도 영웅에게 떠넘길 수 없음을 깨달았다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-hando02-line-02",
            "number": 2,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“대신 선택할 수는 없다. 하지만 함께 싸울 수는 있어.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-hando02-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "두 주인이 각자의 권한으로 봉인을 열 때까지 성문을 지켜야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 3
      },
      {
        "zone": "hando03",
        "mapNumber": 50,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "hando03",
        "lines": [
          {
            "id": "v31300-hando03-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "두 주인이 되찾은 권한과 환도의 공명이 공동 EGO 코어에 연결된다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-hando03-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "악몽의 우두머리",
            "sourceSpeaker": "악몽의 우두머리",
            "sourceType": "적대사",
            "text": "“또 대신 싸워 주면 저들은 영원히 선택하지 않아도 되겠군.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-hando03-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“이번에는 대신하는 싸움이 아니다. 함께 되찾는 싸움이야!”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-hando03-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "두 주인의 선택을 지키며 악몽의 우두머리와 코어의 속박을 끊어야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "restHando",
        "mapNumber": 51,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "restHando",
        "lines": [
          {
            "id": "v31300-restHando-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "구출된 두 사람은 합일몽세 안에서 ‘쌍둥이 기사’라는 영웅 자아로 재구성되었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restHando-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "두 사람은 의목사 교단의 인장을 받아들이고 환도 영웅과의 동행을 선택했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restHando-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "미카엘라",
            "sourceSpeaker": "미카엘라",
            "sourceType": "쉼터대사",
            "text": "“두 이름 사이에 지워진 기록이 하나 더 있어요.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restHando-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "반전단서",
            "text": "두 사람은 자신들을 쌍둥이라고 소개했지만, 환도는 세 번 울렸다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restHando-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "카이로 특이점의 반작용은 다른 기억으로 번져, 이미 끝난 살인을 무한회귀로 묶었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-restHando-line-06",
            "number": 6,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "장제목",
            "text": "제7부 — 파란불 아래의 사람들",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 6
      },
      {
        "zone": "murder01",
        "mapNumber": 52,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "murder01",
        "lines": [
          {
            "id": "v31300-murder01-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "윤하람은 비가 그친 횡단보도 앞에서 어머니의 전화와 품 안의 교정지를 번갈아 바라본다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder01-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "파란불이 켜지고 왼쪽 차선에서 은회색 승용차가 젖은 도로 위로 미끄러진다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder01-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“아직 사고의 끝은 정해지지 않았어. 충돌을 만드는 원인부터 찾아야 해.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder01-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "하람의 생사와 뒤따를 인과를 미리 단정하지 말고 횡단보도에 겹친 악몽을 저지한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "murder02",
        "mapNumber": 53,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "murder02",
        "lines": [
          {
            "id": "v31300-murder02-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "운전자 장민재는 같은 말을 반복했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder02-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "적측",
            "sourceSpeaker": "적측",
            "sourceType": "적대사",
            "text": "“7층 방화문, 당신이 손봤지!”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder02-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“그건 나도 마찬가지야!”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder02-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "CCTV에는 떨어진 사람이 찍히지 않았지만, 차량에서는 새빛호텔 안전점검 보고서가 발견된다. 지워진 기록이 민재를 폐허가 된 호텔로 다시 불러들인다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder02-line-05",
            "number": 5,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "추락하는 순간, 민재는 무언가를 생각했다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 5
      },
      {
        "zone": "murder04",
        "mapNumber": 54,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "murder04",
        "lines": [
          {
            "id": "v31300-murder04-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "고서진은 계단 아래의 민재와 가방 속 네 사람의 이름을 확인한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder04-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "한이경",
            "sourceSpeaker": "한이경",
            "sourceType": "적대사",
            "text": "“그러면 당신은 경보를 꺼 둔 채 퇴근했잖아!”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder04-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“...이제라도 말해야 해.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder04-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "반전 단서",
            "sourceSpeaker": "반전 단서",
            "sourceType": "상황설명",
            "text": "칠 년 전 새빛호텔 보고서에는 서로 다른 필체의 수정 흔적이 남아 있다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder04-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "한이경",
            "sourceSpeaker": "한이경",
            "sourceType": "적대사",
            "text": "“이제 와서 누가 진실을 믿겠어?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder04-line-06",
            "number": 6,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“결과를 정해 놓지 않고, 지워진 기록부터 하나씩 확인하겠습니다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder04-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "경보 회로·방화문·출입 기록·공실 장부의 네 단서가 서로 다른 방향을 가리킨다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder04-line-08",
            "number": 8,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "누가 죽고 누가 원인이었는지 선고하기 전에 네 기록의 조작 순서를 복원해야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 8
      },
      {
        "zone": "murder03",
        "mapNumber": 55,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "murder03",
        "lines": [
          {
            "id": "v31300-murder03-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "이경이 청록빌라 옥상에 오르자 비와 전조등, 건물과 도로가 원형으로 휘어진다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder03-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "파란불 집행체",
            "sourceSpeaker": "파란불 집행체",
            "sourceType": "적대사",
            "text": "“한 사람을 원인으로 고르면 나머지는 모두 무죄가 된다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder03-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“아니, 아직 이어지지 않은 인과를 결말처럼 말하지 마.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder03-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "반전 단서",
            "sourceSpeaker": "반전 단서",
            "sourceType": "상황설명",
            "text": "옥상 아래 은회색 승용차와 횡단보도가 같은 저녁으로 되감기지만 검은 그림자의 정체는 가려져 있다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder03-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "파란불 집행체",
            "sourceSpeaker": "파란불 집행체",
            "sourceType": "적대사",
            "text": "“네 사람의 선택은 이미 하나의 고리다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder03-line-06",
            "number": 6,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“고리를 끊은 뒤에야 무엇이 원인이었는지 확인하겠다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-murder03-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "세 인과 단계를 무너뜨려 순환을 멈춘 다음에만 사건의 전체 연결을 공개한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 7
      },
      {
        "zone": "cult01",
        "mapNumber": 56,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "cult01",
        "lines": [
          {
            "id": "v31300-cult01-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "반전단서",
            "text": "순환살인은 흑장미단이 완성한 인과 고정 실험이었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult01-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "신도들의 전자 칩은 각자의 몽세를 하나의 거대한 신경망으로 묶었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult01-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "흑장미단은 그 위에 수많은 악몽이 합쳐진 사이비 합일몽세를 만들었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult01-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "신경망의 외곽 회로를 섬멸하고 교주가 있는 코어로 전진해야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "cult02",
        "mapNumber": 57,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "cult02",
        "lines": [
          {
            "id": "v31300-cult02-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "합일된 집단 자아는 적그리스도를 현세에 소환하기 위한 요소중 하나였다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult02-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "교주가 기다리는 것은 예지속 최후의 전쟁 ... 아마겟돈!!!",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 2
      },
      {
        "zone": "cult05",
        "mapNumber": 58,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "cult05",
        "lines": [
          {
            "id": "v31300-cult05-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "반전단서",
            "text": "환도디펜스의 성은 별개의 신도 몽세가 아니라, 카이로 특이점이 둘째와 셋째의 융합몽세를 다시 쓴 전장이었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult05-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "반전단서",
            "text": "의목사 B와 첫째는 환도 영웅으로 합쳐져 있었고, 둘째와 셋째는 쌍둥이 기사로 재구성되어 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult05-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "긴급 회의와 침투 결정은 지금이 아니라, 모든 에피소드가 시작되기 전 현실의 기억이었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult05-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "의목사들은 이미 합일몽세에 잠입한 뒤 기억을 잃고, 각자의 과거를 하나의 서사처럼 다시 겪고 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 4
      },
      {
        "zone": "cult06",
        "mapNumber": 59,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "cult06",
        "lines": [
          {
            "id": "v31300-cult06-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "현실에서 의목사 교단이 세운 목표는 두 가지였다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult06-line-02",
            "number": 2,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "적그리스도의 소환이 완성되기 전에 흑장미단의 합일 회로를 끊을 것.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult06-line-03",
            "number": 3,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "합일몽세를 정화해 신도들의 세뇌를 풀고 각자의 자아로 돌려보낼 것.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 3
      },
      {
        "zone": "cult03",
        "mapNumber": 60,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "cult03",
        "lines": [
          {
            "id": "v31300-cult03-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "삼중자아 수확실에서 두 명의 배신한 의목사가 교주의 합일 회로를 지키고 있었다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult03-line-02",
            "number": 2,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“죽음이 두려워 교주에게 자아까지 넘긴 건가?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult03-line-03",
            "number": 3,
            "side": "enemy",
            "speaker": "이단 의목사 한리안",
            "sourceSpeaker": "이단 의목사 한리안",
            "sourceType": "적대사",
            "text": "“합일하면 죽을 필요가 없다. 교단 따위에 목숨을 걸 이유도 없지.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult03-line-04",
            "number": 4,
            "side": "enemy",
            "speaker": "이단 의목사 백이온",
            "sourceSpeaker": "이단 의목사 백이온",
            "sourceType": "적대사",
            "text": "“자아를 지키다 죽느니, 하나가 되어 살아남겠다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult03-line-05",
            "number": 5,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“살아남은 게 아니라, 두려움에 자신을 버린 거겠지.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult03-line-06",
            "number": 6,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "황금 십자가 탄막과 질서 방벽을 돌파해 교주에게 이어지는 합일 회로를 끊어야 한다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 6
      },
      {
        "zone": "cult04",
        "mapNumber": 61,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "cult04",
        "lines": [
          {
            "id": "v31300-cult04-line-01",
            "number": 1,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "의목사는 합일몽세 코어에 도착했고, 사몽 각성자인 교만의 사이보그 교주와 대면하게 된다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult04-line-02",
            "number": 2,
            "side": "enemy",
            "speaker": "교만의 사이보그 교주",
            "sourceSpeaker": "교만의 사이보그 교주",
            "sourceType": "적대사",
            "text": "“죽기 직전에도 네가 누구인지 기억할 수 있을까?”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult04-line-03",
            "number": 3,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“그 순간이 오기 전까지 네 코어를 베겠다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult04-line-04",
            "number": 4,
            "side": "narration",
            "speaker": "상황 설명",
            "sourceSpeaker": "상황 설명",
            "sourceType": "상황설명",
            "text": "교주의 사몽 권한이 전장을 닫고, 지금까지의 보스들이 사용한 현실조작을 한꺼번에 불러낸다.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult04-line-05",
            "number": 5,
            "side": "enemy",
            "speaker": "교만의 사이보그 교주",
            "sourceSpeaker": "교만의 사이보그 교주",
            "sourceType": "적대사",
            "text": "“죽음이 두렵다면 나와 하나가 되어라.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult04-line-06",
            "number": 6,
            "side": "hero",
            "speaker": "활성 영웅",
            "sourceSpeaker": "활성 영웅",
            "sourceType": "영웅대사",
            "text": "“두렵다. 그렇다고 너에게 나의 자아를 넘기지는 않겠다.”",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": false,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          },
          {
            "id": "v31300-cult04-line-07",
            "number": 7,
            "side": "narration",
            "speaker": "나레이션 · 전투 목표",
            "sourceSpeaker": "전투 목표",
            "sourceType": "상황설명",
            "text": "교주를 쓰러뜨리고 합일 코어를 파괴하라.",
            "exact": true,
            "sourceKind": "hapil-final-dialogue-v31300",
            "objectiveNarrationV31300": true,
            "emphasisV31300": false,
            "emphasisStyleV31300": null
          }
        ],
        "lineCount": 7
      }
    ],
    "gates": {
      "sourceSha256": true,
      "utf8Bom": true,
      "lfOnly": true,
      "mapMarkers": true,
      "lineMarkers": true,
      "records": true,
      "sequentialMaps": true,
      "kinds": true,
      "linesDiscoveredDynamically": true,
      "objectivesDiscoveredDynamically": true,
      "oneExplicitEmphasis": true,
      "noEmptyFields": true,
      "noComingSoon": true
    },
    "allPass": true
  },
  "interlude": {
    "schema": "hapil.interlude.v31300",
    "version": "3.13.00",
    "sourceFile": "INTERLUDE_FINAL_KO.txt",
    "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
    "sourceBytes": 112607,
    "sourceHasUtf8Bom": true,
    "raw": "﻿MONGSE v3.12.40 인터루드 대사 수정용 정본\n====================================================================================\n\n이 파일에는 현재 v3.12.40에서 사용하는 인터루드 본문만 들어 있습니다.\n맵 진입 서로대사와 전투 종료 후 맞대사는 포함하지 않았습니다.\n\n[수정 방법]\n- 각 <<< INTERLUDE_TEXT_START >>>와 END 사이의 본문만 수정하십시오.\n- MAP ID 및 모든 START/END 표식은 재적용에 필요하므로 지우지 마십시오.\n- 독립 인터루드가 없는 맵의 안내 문구도 삭제하지 마십시오.\n- 맵 순서를 바꾸려면 ‘진행 순서’와 해당 MAP 블록을 함께 이동하십시오.\n- 수정 후 이 파일을 그대로 다시 업로드하면 됩니다.\n\n[구성] 프롤로그 1 + 진행 맵 61 / 실제 인터루드 58 / 독립 인터루드 없음 4\n[추출 기준] MONGSE v3.12.40 활성 배포본\n\n====================================================================================\n프롤로그 — HUB 인터루드 전용\n====================================================================================\n\n<<< PROLOGUE_HUB_START >>>\n제목: 合一\n<<< INTERLUDE_TEXT_START >>>\n合一\n간결 서사본.\n\n※ 약물 의존과 금단, 환각, 의료·심리 위기, 폭력과 죽음에 관한 묘사가 포함되어 있다.\n\n============================================================\n제1부  에피소드 1-A — 마지막 수호자와 의목사 후보생\n============================================================\n\n【1. 악마가 점령한 세계】\n\n나는 내가 누구인지 모른다.\n\n어디에 있는지도 기억나지 않는다. 과거를 더듬을 때마다 깨진 유리 같은 장면만 번뜩였다가 사라진다.\n\n그래도 한 가지는 확신한다.\n\n나는 악마가 점령한 세계에 남은 마지막 수호자다.\n\n자아를 잃지 않은 유일한 에고(Ego).\n\n세상은 본래 천사들이 관리했다. 그러나 어느 날, 궁전 정원 한가운데에서 악마화 나무가 자라기 시작했다. 나무는 이내 성 전체를 물들이고 천사들을 악마로 타락시켰다.\n\n그들은 ID(이드)라고 한다.\n\n나무는 육체만을 빼앗지 않았다. 기억을 먹고 감정을 바꾸며, 바라보는 현실 자체를 뒤틀었다.\n\n나는 폐허가 된 도시를 홀로 걸었다. 손에는 이름 모를 검이 들려 있었다.\n\n검날에 묻은 피의 절반은 악마의 것이었다.\n\n나머지 절반은 한때 내 동료였던 자들의 것이었다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n<<< PROLOGUE_HUB_END >>>\n\n====================================================================================\n[MAP 01/61] dist01 · 전투 맵\n====================================================================================\n진행 순서: 1\n현재 인터루드 제목: 【2. 거미동굴】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_dist01_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【2. 거미동굴】\n\n가장 오래된 기억은 사람의 뼈로 거미줄을 짠 동굴에서 시작되었다.\n\n이름조차 떠오르지 않는 동료가 내 어깨를 붙잡았다.\n\n“저 안에 보라검천사가 있어.”\n\n“천사라고?”\n\n“과거에는 그랬겠지.”\n\n보랏빛이 동굴을 갈랐다. 흰 날개 사이로 여덟 개의 거미 다리를 뻗은 여인이 거미줄 위를 걸어 나왔다.\n\n“인간은 배고프면 훔치고, 두려우면 죽이며, 사랑받지 못하면 타인을 파괴한다.”\n\n보라검천사가 검을 들었다.\n\n“너희와 악마가 무엇이 다르지?”\n\n“선을 선택할 수 있다는 점.”\n\n검이 부딪치며 불꽃이 튀었다. 그 순간 동료 한 명이 거미줄에 붙잡혀 천장으로 끌려갔다. 나는 그를 구하려다 옆구리를 베였다.\n\n“나 때문에 멈추지는 마!”\n\n“함께 나갈 거야.”\n\n“이번에도 누군가를 구하려다 전부 죽일 셈이야?”\n\n이번에도.\n\n그 말이 머릿속에 걸렸다. 그러나 묻기도 전에 동료는 스스로 거미줄을 감고 보라검천사에게 달려들었다.\n\n“지금이야!”\n\n나는 두 사람을 함께 꿰뚫었다.\n\n보랏빛 불길 속에서 천사와 동료가 동시에 타올랐다. 끝내 그의 이름은 떠오르지 않았다.\n\n나는 피 묻은 검을 들고 동굴을 나왔다.\n\n동료들의 피를 짊어지겠다.\n\n그들의 죽음을 헛되게 하지 않겠다.\n\n그것이 사명감인지 죄책감인지 알 수 없었다.\n\n애초에 그 동료가 정말 존재했는지도.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_dist01_END >>>\n\n====================================================================================\n[MAP 02/61] dist02 · 전투 맵\n====================================================================================\n진행 순서: 2\n현재 인터루드 제목: 【3. 늪지대의 뿔악마】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_dist02_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【3. 늪지대의 뿔악마】\n\n거미동굴 너머에는 검은 늪이 펼쳐져 있었다. 사람 얼굴을 닮은 수초가 떠다니고, 물속의 손들이 발목을 붙잡았다.\n\n늪을 지배하는 뿔악마의 뿔에는 죽은 수호자들의 머리가 매달려 있었다.\n\n“마지막 수호자가 왔군.”\n\n“나는 혼자가 아니야.”\n\n“뒤를 봐라.”\n\n아무도 없었다.\n\n늪에서 익숙한 얼굴들이 올라왔다. 함께 싸웠고, 내 앞에서 죽었으며, 내가 지키지 못했던 자들.\n\n모두 악마의 뿔을 달고 있었다.\n\n“왜 우리를 버리고 갔어?”\n\n“버리지 않았어.”\n\n“우리를 죽인 게 정말 악마였을까?”\n\n그들이 일제히 달려들었다.\n\n나는 울면서 검을 휘둘렀다. 목을 베고, 심장을 찔렀다. 쓰러지는 순간마다 그들의 얼굴은 인간으로 돌아왔다.\n\n마지막 동료가 검은 피를 토하며 북쪽을 가리켰다.\n\n“최초의 장소로 가.”\n\n“최초의 장소?”\n\n“악마가 처음 나타난 지옥의 소환진…… 그리고…… 믿지 마.”\n\n그는 늪 아래로 가라앉았다.\n\n그때 머릿속에서 맑은 목소리가 들렸다.\n\n— 흔들리지 마.\n\n하얀 날개의 천사가 빛 속에서 모습을 드러냈다.\n\n— 나는 언제나 네 곁에 있었다. 소환진으로 가라. 너만이 세상을 구할 수 있다.\n\n…… 믿지 마.\n\n죽은 동료의 경고가 떠올랐지만, 천사의 목소리는 너무 따뜻했다.\n\n너는 특별하다.\n\n너만이 진실을 안다.\n\n너는 선택받았다.\n\n의심은 안개처럼 흩어졌다.\n\n나는 다시 검을 들었다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_dist02_END >>>\n\n====================================================================================\n[MAP 03/61] dist03 · 전투 맵\n====================================================================================\n진행 순서: 3\n현재 인터루드 제목: 【4. 지옥의 문지기】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_dist03_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【4. 지옥의 문지기】\n\n소환진은 무너진 도시의 중심에 있었다. 검은 기둥 일곱 개 사이에서 불길이 솟았고, 박쥐 날개와 황소 뿔을 지닌 발록이 걸어 나왔다.\n\n“네가 최초의 악마인가?”\n\n“그 질문부터 틀렸다. 너는 원인과 결과를 거꾸로 보고 있어.”\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_dist03_END >>>\n\n====================================================================================\n[MAP 04/61] dist04 · 전투 맵\n====================================================================================\n진행 순서: 4\n현재 인터루드 제목: 발록의 채찍이 도로를 갈랐다.\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_dist04_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n발록의 채찍이 도로를 갈랐다.\n\n“그만 포기하면 편해진다. 너는 이미 기억도, 이름도, 돌아갈 곳도 잃었다.”\n\n“그래도 싸운다.”\n\n“무엇을 위해서?”\n\n나는 검을 움켜쥐었다.\n\n“내가 살아 있어야 그들의 존재를 기억할 수 있으니까. 나를 지키는 일과 세계를 지키는 일은 결국 같은 방향을 가리킨다.”\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_dist04_END >>>\n\n====================================================================================\n[MAP 05/61] dist05 · 전투 맵\n====================================================================================\n진행 순서: 5\n현재 인터루드 제목: 전투가 시작되었다.\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_dist05_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n전투가 시작되었다.\n\n발록의 검이 어깨를 가르고 불덩이가 하늘을 뒤덮었다. 무너진 기둥 뒤에서 숨을 고르자 천사가 속삭였다.\n\n— 고통을 없애 주겠다.\n\n순간 상처도 두려움도 사라졌다. 오직 발록을 죽여야 한다는 목적만 남았다.\n\n나는 불길 속으로 뛰어들어 놈의 가슴에 검을 박았다.\n\n발록이 피를 토했다.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_dist05_END >>>\n\n====================================================================================\n[MAP 06/61] dist06 · 전투 맵\n====================================================================================\n진행 순서: 6\n현재 인터루드 제목: “네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라 계속 싸우게 만들려는 것이야!!”\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_dist06_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라, 계속 싸우게 만들려는 것이다!”\n\n나는 검을 비틀었다.\n\n발록은 재가 되면서도 웃었다.\n\n“내가 쓰러졌으니 이제 지옥이 열리겠군.”\n\n천사가 소환진을 가리켰다.\n\n— 파괴해. 그러면 모든 고통이 끝난다.\n\n나는 검을 내려쳤다.\n\n소환진이 갈라지고, 세상이 무너졌다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_dist06_END >>>\n\n====================================================================================\n[MAP 07/61] ep1a07 · 전투 맵\n====================================================================================\n진행 순서: 7\n현재 인터루드 제목: 【5. 추락】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1a07_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【5. 추락】\n\n검은 소용돌이가 도시를 집어삼켰다.\n\n건물과 시체, 무기와 기둥이 빨려 들어갔다. 검을 땅에 꽂았지만 땅 자체가 무너졌다.\n\n“끝난다고 했잖아!”\n\n— 문이 열렸다. 이제 진짜 세계로 갈 수 있어.\n\n내 몸이 소용돌이로 끌려갔다.\n\n거미동굴.\n\n늪지대.\n\n죽은 동료들.\n\n발록.\n\n기억이 하나씩 부서졌다.\n\n“나는 누구지?”\n\n— 너는 수호자다. 나를 믿어.\n\n그 목소리만 남은 채 나는 어둠으로 추락했다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1a07_END >>>\n\n====================================================================================\n[MAP 08/61] ep1a08 · 전투 맵\n====================================================================================\n진행 순서: 8\n현재 인터루드 제목: 【6. 피로 물든 병원】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1a08_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【6. 피로 물든 병원】\n\n삐―\n\n눈을 뜨자 차가운 형광등과 소독약 냄새가 나를 맞았다. 갑옷 대신 환자복을 입고 있었고, 손목은 침대에 묶여 있었다.\n\n복도 바닥에는 피가 이어졌고 벽에는 붉은 글씨가 적혀 있었다.\n\nHELP ME.\n\n주사기를 든 간호사가 다가왔다.\n\n“움직이지 마세요. 지금 상태가 좋지 않습니다.”\n\n그녀의 피부 아래에서 벌레가 꿈틀거리고 입이 귀밑까지 찢어졌다.\n\n— 저것들은 인간이 아니다.\n\n“다가오지 마!”\n\n간호사의 얼굴이 다시 평범해졌다.\n\n곧 의사가 나타났지만 그의 말은 내 귀에서 “육육육…… 루시퍼…… 복종……”으로 뒤틀렸다.\n\n— 치료라는 말은 함정이다. 저들을 믿으면 영혼을 빼앗긴다.\n\n나는 손목이 상하는 것도 아랑곳하지 않고 고정 장치에서 빠져나와 복도로 달렸다.\n\n그러나 피에서는 피 냄새가 아니라 소독약 냄새가 났다. HELP ME는 가까이서 보니 붉은 크레용이었다.\n\n그 사실을 깨닫는 순간, 복도는 다시 피로 뒤덮였다.\n\n“어느 쪽이 진짜지?”\n\n— 네가 보는 것이 진실이다.\n\n천사의 설명은 모든 모순에 답했다.\n\n그래서 더욱 위험했다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1a08_END >>>\n\n====================================================================================\n[MAP 09/61] ep1a09 · 전투 맵\n====================================================================================\n진행 순서: 9\n현재 인터루드 제목: 【7. 주사실】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1a09_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【7. 주사실】\n\n손끝이 떨리고 뼛속을 벌레가 기어 다니는 듯했다. 혀가 마르고 온몸이 뒤틀렸다.\n\n복도 끝의 주사실을 보는 순간, 머리보다 몸이 먼저 반응했다.\n\n— 저 안에 성수가 있다.\n\n서랍 깊은 곳에서 약병 하나를 찾았다.\n\nFENTANYL.\n\n어두운 방과 녹슨 숟가락, 쓰러져 있던 사람의 기억이 번쩍였다.\n\n‘한 번만.’\n\n그 목소리는 천사와 닮아 있었다.\n\n“이게 뭐지?”\n\n— 성수다. 고통을 없애 줄 거야.\n\n문밖에서 의사가 외쳤다.\n\n“약품에 손대지 마십시오!”\n\n몸은 약을 원했고, 천사는 그것을 구원이라 불렀다.\n\n이번 한 번만 편해지면 다시 싸울 수 있다.\n\n나는 결국 바늘을 피부에 찔렀다.\n\n고통이 멀어지고 따뜻한 빛이 퍼졌다.\n\n천사가 나를 끌어안았다.\n\n— 잘했어. 이제 다시 기억할 수 있을 거야.\n\n닫혀 있던 기억의 문이 열렸다.\n\n────────────────────────────────────────\n\n【8. 결전의 날】\n\n나는 다시 무너진 도시에 서 있었다.\n\n천사와 악마가 갈라진 하늘에서 쏟아졌고, 수십 명의 수호자가 내 곁에서 싸웠다. 우리는 악마화 나무가 삼켜 버린 황궁 문, 그 너머 초천사의 봉인 앞까지 당도했다.\n\n문틈 너머의 천사는 웃고 있었다.\n\n자비가 아니라, 먹잇감이 덫에 걸리기를 기다리는 미소였다.\n\n그때 발록이 나타났다.\n\n“너는 여기서 끝이다.”\n\n“아니, 끝을 정하는 건 너희가 아니야.”\n\n전투가 절정에 이르자 세계가 겹쳐졌다.\n\n발록의 검은 경찰의 진압봉으로, 불타는 채찍은 구급대원의 팔로 변했다. 시체가 있던 자리에는 주사기와 빈 약봉지가 널려 있었다.\n\n발록의 얼굴이 중년 구급대원으로 바뀌었다.\n\n“우리는 너를 살리려 했어!”\n\n“거짓말!”\n\n“네가 검이라 믿고 휘두른 것은 깨진 주사기였고, 네가 악마라 부른 사람들은 너를 구하러 온 사람들이었다.”\n\n손안의 검이 깨진 유리 조각으로 흔들렸다.\n\n“아니야!”\n\n나는 현실을 향해 검을 휘둘렀다.\n\n모든 것이 하얗게 타올랐다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1a09_END >>>\n\n====================================================================================\n[MAP 10/61] ep1a10 · 전투 맵\n====================================================================================\n진행 순서: 10\n현재 인터루드 제목: 【9. 환자】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1a10_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【9. 환자】\n\n나는 주사실 바닥에서 깨어났다.\n\n의사와 간호사가 호흡을 확인하고 해독 처치를 준비하고 있었다. 시선 끝에 차트가 보였다.\n\n오피오이드 사용장애.\n\n펜타닐 의존증.\n\n약물 유발 정신병적 증상 의심.\n\n“나는 수호자다.”\n\n의사가 물었다.\n\n“성함을 말씀하실 수 있겠습니까?”\n\n입을 열었지만 이름이 나오지 않았다.\n\n수호자. 에고. 마지막 인간.\n\n어느 것도 내 이름이 아니었다.\n\n“나는 누구지?”\n\n“치료 중인 환자입니다.”\n\n— 거짓말이다. 너는 선택받은 존재다.\n\n그러나 이상했다.\n\n천사의 목소리를 들을 때마다 몸은 약을 원했다. 의사가 치료를 말하면 천사는 분노했고, 내가 현실을 의심할수록 나를 칭찬했다.\n\n— 그래. 너만이 진실을 안다.\n\n그 말은 나를 특별하게 만들었다.\n\n동시에 완전히 혼자로 만들었다.\n\n────────────────────────────────────────\n\n【10. 중독의 도시】\n\n다시 눈을 떴을 때, 나는 주사기가 달빛을 반사하는 폐허에 서 있었다.\n\n벽마다 내가 했던 말이 적혀 있었다.\n\n나는 다르다.\n\n마음만 먹으면 끊을 수 있다.\n\n이번 한 번뿐이다.\n\n거리 끝에는 수많은 내가 죽어 있었다. 처음 약을 사용한 나, 더 강한 자극을 찾은 나, 충고를 비웃고 거짓말한 나.\n\n그제야 알았다.\n\n이 도시는 외부의 악마가 아니라 내 오만과 호기심이 만들었다.\n\n내 목숨을 가장 값싸게 취급한 사람도 나였다.\n\n“나는 수호자가 아니야.”\n\n— 아니야. 너는 선택받았다.\n\n“나는 중독된 환자일 뿐이야.”\n\n— 입 닥쳐!\n\n처음으로 천사의 목소리가 갈라졌다.\n\n나는 폐허에 무릎을 꿇었다.\n\n“잘못을 하며 살아왔어. 하지만 아직 살아 있어. 그러니 도움을 청할 수 있어!”\n\n병원 복도의 빛이 켜졌다.\n\n“저를 치료해 주세요. 부탁드립니다.”\n\n도시가 흔들렸다.\n\n천사의 이마에 검은 숫자가 떠올랐다.\n\n666.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1a10_END >>>\n\n====================================================================================\n[MAP 11/61] ep1a11 · 전투 맵\n====================================================================================\n진행 순서: 11\n현재 인터루드 제목: 【11. 천사의 가면】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1a11_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【11. 천사의 가면】\n\n“네가 최초의 악마였군.”\n\n천사는 웃었다.\n\n— 아니, 나는 너를 지켜 왔다.\n\n“너는 내가 치료받는 것을 막았고, 사람을 믿지 못하게 했으며, 마약을 성수라고 불렀어.”\n\n— 그래서 고통에서 벗어나게 해 주었잖아.\n\n“대신 악마에 가까워지게 했지.”\n\n흰 날개가 검게 물들고 머리에서 뿔이 솟았다.\n\n그것은 완벽해야 한다고 몰아붙이고, 실패한 나를 벌하며, 도움을 청하는 일을 수치로 만들던 목소리였다.\n\n나의 초자아(Super Ego)를 잠식한 악마.\n\n“루시퍼.”\n\n가면이 갈라지자 오만하고 두려워하며 죄책감에 짓눌린 수천 개의 내 얼굴이 나타났다.\n\n“내가 없으면 너는 아무것도 아니다. 평범한 중독자를 마지막 수호자로 만든 건 나다.”\n\n“그건 거짓된 의미였어.”\n\n루시퍼는 병원 침대 위에서 경련하고 약을 달라 애원하는 나를 보여 주었다.\n\n“이것이 네 진실이다. 초라하고 더럽고 나약하지.”\n\n나는 외면하지 않았다.\n\n“그래. 저것도 나다. 하지만 그게 전부는 아니야.”\n\n검은 검이 가슴을 관통했다. 루시퍼가 익숙한 말을 속삭였다.\n\n“한 번이면 된다. 이번 한 번만 편해지면 되는 거야.”\n\n나는 피 흘리는 손으로 검날을 붙잡았다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\n검을 뽑자 병원의 창문에 하나씩 불이 켜졌다.\n\n“나는 다시 실패하겠지…… 하지만 몇 번이고 넘어져도, 다시 선을 선택하며 일어나면 돼.”\n\n루시퍼가 비명을 질렀다.\n\n“너는 나를 영원히 없앨 수 없어!”\n\n“알고 있어. 너는 갈망과 오만, 수치심으로 언제나 다시 돌아오겠지.”\n\n손바닥에서 빛나는 인장이 피어났다.\n\n“그때마다 나는 선(J)을 선택할 거야.”\n\n인장이 루시퍼의 가슴에 박혔다.\n\n빛 속에서 악마가 물었다.\n\n“네가 이겼다고 생각하나?”\n\n“아니. 내가 이기는 게 아니야. 선(J)이 언제나 승리할 뿐이지.”\n\n────────────────────────────────────────\n\n【12. 의목사 후보생】\n\n병원에서 다시 눈을 떴을 때, 복도에는 피도 붉은 글씨도 없었다.\n\n침대 옆에는 검은 성직복 위에 흰 가운을 입은 남자가 앉아 있었다. 십자가와 청진기, 오래된 은제 인장은 서로 어울리지 않을 듯하면서도 이상하리만치 한 몸처럼 보였다.\n\n“의사이신가요?”\n\n“의사이기도 하고, 목사이기도 합니다. 교단에서는 의목사라고 부르지요.”\n\n그는 세상이 세 층으로 나뉜다고 설명했다.\n\n인간이 살아가는 현세.\n\n정신과 무의식이 펼쳐지는 몽세.\n\n선과 악의 본질이 존재하는 내세.\n\n“현세에서 본 것은 환각이지만, 몽세에서는 실제로 일어난 일입니다. 악은 현세에 직접 개입하지 못해도 몽세를 통해 인간을 흔들 수 있지요.”\n\n“루시퍼는 사라졌습니까?”\n\n“잠시 물러났을 뿐입니다. 영적 전쟁은 살아 있는 동안 끝나지 않습니다.”\n\n“제 안에는 악마가 몇이나 남았습니까?”\n\n그가 잠시 생각하는 척했다.\n\n“전승을 따르면 일흔두 개쯤 되겠군요.”\n\n치료는 오래 이어졌다. 열이 오르고 몸이 떨렸으며, 잠들 때마다 천사의 목소리가 돌아왔다. 그럴 때마다 나는 호출 버튼을 눌렀다.\n\n혼자가 되지 않는 쪽을 선택했다.\n\n마침내 의목사는 지하 예배당으로 내려가는 문을 열었다.\n\n“차트에는 저를 뭐라고 적었습니까?”\n\n“지금까지는 환자로 적혀 있겠네요.”\n\n그가 나를 바라보았다.\n\n“하지만 끝까지 치료를 선택한다면 다시 의목사 후보생이 될 수 있겠지요.”\n\n엘리베이터 아래에는 신경 전극과 일흔두 개의 금속 인장으로 둘러싸인 거대한 장치가 기다리고 있었다.\n\n나는 그 안으로 한 걸음 들어섰다.\n\n그날부터 나의 악몽은 더 이상 나만의 것이 아니었다.\n\n에피소드 1-A 끝.\n\n============================================================\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1a11_END >>>\n\n====================================================================================\n[MAP 12/61] dreamRest · 쉼터 맵\n====================================================================================\n진행 순서: 12\n현재 인터루드 제목: 제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀\n원문 연결 방식: explicit-canonical-linked-interlude\n\n<<< MAP_dreamRest_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n악몽이 잠잠해지자 병원 상담실을 닮은 쉼터가 나타났다.\n\n흰 가운에 비대칭 문양을 두른 여자가 상처를 살폈다.\n\n“맥박과 동공 반응은 정상이네요.”\n\n그녀는 자신이 왜 그런 말을 먼저 했는지 모르는 표정이었다.\n\n“미카엘라예요. 의목사 교단에 오기 전의 일은 잘 기억나지 않아요.”\n\n제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀\n============================================================\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_dreamRest_END >>>\n\n====================================================================================\n[MAP 13/61] ep1b01 · 전투 맵\n====================================================================================\n진행 순서: 13\n현재 인터루드 제목: 【1. 솔로몬의 봉인식】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1b01_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【1. 솔로몬의 봉인식】\n\n지하 예배당의 장치는 환각과 악몽, 억압된 기억을 신경 데이터로 추출해 가상세계로 재구성했다.\n\n공식 명칭은 ‘몽세 동조형 정신재구성 장치’.\n\n사람들은 간단히 ‘메타버스 하이테크 축귀 시스템’이라고 불렀다.\n\n“이름을 지은 사람은 해고되지 않았습니까?”\n\n“교단 원로입니다.”\n\n“아주 경건한 이름이군요.”\n\n마지막 관문은 타인의 마음이 아니라 내 안에 남은 문을 닫는 일이었다.\n\n접속과 함께 검은 바다가 갈라졌다. 트라우마와 약물 의존, 죄책감과 망상이 일흔두 악마의 이름을 빌려 솟아올랐다.\n\n“다시 영웅이 되고 싶지 않나?”\n\n“영웅이 아니어도 살아갈 수 있다는 걸 배웠다.”\n\n“한 번만 편해져라.”\n\n“편안함과 회복은 다르다.”\n\n“나는 너다.”\n\n“너는 나의 일부일 뿐, 전부가 아니다.”\n\n인장이 하나씩 닫히며 비대해진 몽세가 제자리로 수축했다.\n\n봉인은 악마를 도려내는 일이 아니었다. 악마의 이름을 알아보고, 그것이 현실의 문을 마음대로 열지 못하도록 경계를 세우는 일이었다.\n\n일흔두 번째 봉인이 닫혔다.\n\n“이제 다른 사람의 문도 닫을 수 있겠습니까?”\n\n담당 의목사가 말했다.\n\n“대신 닫아 줄 수는 없습니다. 문 앞까지 함께 걸어갈 수 있을 뿐이지요.”\n\n그날 나는 후보생의 이름을 벗고, 신경과학과 의례, 상담과 전투를 함께 다루는 최초의 실전형 하이테크 의목사가 되었다.\n\n그리고 첫 임무에서 일곱 사람의 몽세가 정체불명의 검은 신호로 연결되어 있음을 발견했다.\n\n누군가가 그들의 악몽을 듣고 있었다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1b01_END >>>\n\n====================================================================================\n[MAP 14/61] ep1b02 · 전투 맵\n====================================================================================\n진행 순서: 14\n현재 인터루드 제목: 【2. 나태의 집】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1b02_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【2. 나태의 집】\n\n첫 대상의 집은 현관부터 썩어 가고 있었다. 음식물과 페트병, 쓰레기봉투가 거실을 메웠고, 창문은 검은 비닐로 막혀 있었다.\n\n남자는 그 한가운데 누워 있었다.\n\n“일어나실 수 있겠습니까?”\n\n“일어나서 뭐 하죠? 아무것도 달라지지 않는데.”\n\n“누워 있으면 뭐 달라집니까?”\n\n몽세 속 남자는 쓰레기 산을 등에 붙인 거대한 반인반요였다. 냉장고와 소파, 썩은 침대가 날아왔다.\n\n그가 던지는 것은 물건이 아니라 미뤄 둔 시간이었다.\n\n끊어진 관계, 읽지 않은 메시지, 제출하지 못한 이력서.\n\n쓰레기 사이에서 펜타닐 약병이 굴러왔다.\n\n“너도 원하잖아.”\n\n벨페고르가 내 목소리로 속삭였다.\n\n나는 약병을 밟아 부쉈다.\n\n“예전에는. 지금은 아니야.”\n\n인장이 쓰레기 산을 갈랐다. 그 안에서 남자가 양손으로 귀를 막고 있었다.\n\n쓸모없는 인간.\n\n아무것도 하지 마.\n\n“누나의 목소리예요.”\n\n“타인은 당신을 정의할 수 없습니다. 자신을 정의할 권리는 오직 당신에게 있습니다. 타인이 당신의 삶을 대신 살아 줄 수는 없으니까요.”\n\n“일어나면 달라질까요?”\n\n“당장 달라지지는 않습니다. 그래도 해결할 수 있는 자세가 누운 자세는 아니겠지요.”\n\n그가 회개하고 내 손을 잡자 나태의 귀가 봉인되었다.\n\n현실로 돌아온 남자는 가장 먼저 창문의 비닐을 뜯었다.\n\n“누나는 호텔에서 옛 친구를 다시 만난 뒤 달라졌어요.”\n\n검은 신호는 누나에게 이어져 있었다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1b02_END >>>\n\n====================================================================================\n[MAP 15/61] ep1b03 · 전투 맵\n====================================================================================\n진행 순서: 15\n현재 인터루드 제목: 【3. 금이 간 안경】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1b03_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【3. 금이 간 안경】\n\n누나의 집은 먼지 한 톨 없이 정돈되어 있었다. 그러나 거실에는 칼과 볼펜으로 훼손한 한 여자의 사진이 붙어 있었다.\n\n“그 여자는 노력도 안 했는데 왜 모든 걸 가진 거죠?”\n\n몽세 속 누나는 금이 간 안경을 쓰고 칼날과 유리 조각을 쏟아 냈다. 질투의 뱀이 목을 휘감고 있었다.\n\n“노력한 만큼 인정받고 싶었습니까?”\n\n“당연하잖아!”\n\n“그 분노를 왜 동생에게 쏟았습니까?”\n\n“그 애는 게을러. 내 발목만 잡는 존재야.”\n\n“당신이 그렇게 불렀기 때문에 그는 정말 그렇게 믿기 시작한 겁니다.”\n\n레비아탄의 독이 퍼지자 나보다 온전한 사람들, 중독되지 않은 사람들, 내가 가질 수 있었던 삶이 환영으로 나타났다.\n\n“저들이 너보다 낫다.”\n\n“아니, 타인의 언어가 내 실패의 증거가 되지는 않는다.”\n\n누나가 회개하자, 선(J)의 인장이 뱀을 갈랐다.\n\n사진 속 여자는 서윤이었다.\n\n누나와 서윤, 요리과의 천재였던 한 남자는 같은 직업학교 출신이었다. 누나는 남자를 사랑했지만, 남자는 서윤에게 고백했다. 몇 년 뒤 누나는 호텔 부매니저가 되었고, 남자는 총주방장이 되었다. 서윤은 호텔그룹 회장의 팔짱을 낀 채 나타났다.\n\n“나는 성공하고 싶었던 게 아니었어요. 서윤이 계속 내 아래에 있기를 바랐던 거예요.”\n\n“동생에게 사과하고 치료받으십시오.”\n\n검은 신호는 서윤과 호텔로 이어졌다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1b03_END >>>\n\n====================================================================================\n[MAP 16/61] ep1b04 · 전투 맵\n====================================================================================\n진행 순서: 16\n현재 인터루드 제목: 【4. 탐식의 주방】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1b04_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【4. 탐식의 주방】\n\n호텔 주방에서는 값비싼 음식이 모양이 조금 흐트러졌다는 이유로 버려지고 있었다.\n\n총주방장이 접시를 내던졌다.\n\n“최고가 아니면 쓰레기일 뿐.”\n\n몽세의 주방은 거대한 위장으로 변했다. 돼지와 두꺼비를 닮은 베엘제붑이 식칼과 프라이팬, 독가스를 쏟아 냈다.\n\n“네가 원하는 게 그저 최고의 맛일 뿐인 건 아니지 않나.”\n\n나는 독이 퍼진 팔에 인장을 찍었다.\n\n“최종 목표는 서윤에게 선택받는 것이겠지.”\n\n주방장은 서윤이 자신이 만든 음식을 좋아했다고 외쳤다.\n\n“나는 그 애만을 위해 요리했어!”\n\n“결국 당신 자신의 욕망을 위해서였겠지요.”\n\n악마의 뱃속에는 버려진 음식과 오래된 고백, 졸업사진이 섞여 있었다. 가장 깊은 곳에서 약병이 나를 유혹했다.\n\n나는 약 대신 사진을 집어 불태웠다.\n\n“자신의 욕망을 인정하시고 회개하시면 됩니다.”\n\n그가 자신의 욕망을 인정하고 회개하자, 베엘제붑이 무너졌다.\n\n현실의 주방장에게는 조사와 징계, 치료가 남았다.\n\n그리고 호텔 전체를 잇는 검은 신호는 더욱 굵어졌다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1b04_END >>>\n\n====================================================================================\n[MAP 17/61] ep1b05 · 전투 맵\n====================================================================================\n진행 순서: 17\n현재 인터루드 제목: 【5. 붉은 하이힐】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1b05_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【5. 붉은 하이힐】\n\n서윤은 완벽한 미소를 지녔지만, 아무도 보지 않을 때면 얼굴이 텅 비었다.\n\n“내 머릿속에 들어오겠다고요?”\n\n“허락 없이는 들어가지 않습니다.”\n\n“들어와 봐요. 당신도 결국 똑같아질 테니까.”\n\n몽세에는 붉은 조명 아래 끝없는 무대가 펼쳐졌다. 서윤의 등에는 수백 개의 투명한 실이 연결되어 있었고, 실을 쥔 사람은 총지배인이었다.\n\n“회장님의 마음을 얻으면 내가 더 높은 자리로 갈 수 있어. 그러면 너도 데려갈게.”\n\n그는 밀어냈다가 사랑한다고 말하고, 그렇게 돌아오면 더 큰 희생을 서윤에게 요구했다.\n\n그것은 사랑이 아니라 사육이었다.\n\n서윤의 얼굴을 한 아스모데우스가 하이힐 칼날과 매혹의 빛을 쏘았다. 내 손의 칼이 의지와 무관하게 목을 향했다. 매혹은 곧 자해로 변했다.\n\n“사랑은 자신을 고통스럽게도 하지. 상사병이란 그런 것.”\n\n“그것을 사랑이라 포장한다고 진실을 숨길 수는 없어.”\n\n서윤의 실이 하나씩 끊어졌다.\n\n악마가 속삭였다.\n\n“너도 누군가에게 필요한 사람이 되고 싶어 의목사가 됐잖아.”\n\n“맞아. 하지만 누군가에게 필요한 사람이 되고 싶은 마음을 인정하는 것과, 그 마음을 채우려고 타인을 이용하는 것은 달라.”\n\n서윤이 회개하자, 인장이 닫혔다.\n\n서윤은 회장이 호텔 사람들의 질투와 탐식, 욕망이 폭발하는 순간을 모두 기록했다고 밝혔다.\n\n“인간의 욕망을 데이터로 만든다고 했어요.”\n\n검은 신호는 호텔 최상층으로 모여들었다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1b05_END >>>\n\n====================================================================================\n[MAP 18/61] ep1b06 · 전투 맵\n====================================================================================\n진행 순서: 18\n현재 인터루드 제목: 【6. 맘몬의 금고】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1b06_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【6. 맘몬의 금고】\n\n총지배인의 몽세는 금고와 겨울 산장이 결합된 공간이었다. 탐욕의 귀는 그의 얼굴과 여우의 눈을 하고 지폐를 칼날로 바꾸었다.\n\n“사람에게는 각자에게 맞는 가격이 있지.”\n\n“그래서 당신은 서윤에게 사랑이 아니라 조건을 숨긴 거래를 제안한 것이겠지요.”\n\n비웃음과 함께 그가 동전을 튕겼다.\n\n“앞면이면 네가 살고, 뒷면이면 내가 살겠지.”\n\n수백 개의 동전이 모두 뒷면을 보였다.\n\n“행운은 순진한 자를 싫어하는 법이지.”\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1b06_END >>>\n\n====================================================================================\n[MAP 19/61] ep1b06b · 전투 맵\n====================================================================================\n진행 순서: 19\n현재 인터루드 제목: 인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1b06b_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.\n\n그곳의 그는 굶어 죽은 어머니의 몸을 흔드는 소년이었다.\n\n“돈만 있었으면 엄마가 살 수 있었어!”\n\n소년은 이후 돈과 자리, 사람과 약점을 모았다. 다시는 빼앗기지 않기 위해 언제나 먼저 빼앗는 사람이 되기로 다짐했다.\n\n나는 소년 앞에서 무릎을 꿇었다.\n\n“네가 겪은 일은 네 잘못이 아니야. 하지만 네가 다른 사람에게 한 일은 네 책임이 맞아.”\n\n“돈은 곧 생명이야!”\n\n“돈이 없으면 삶이 힘들어지는 건 맞아. 하지만 그것이 사람을 돈으로 환산하는 일을 정당화해 주지는 않아.”\n\n아이가 회개하자, 맘몬이 봉인되었다.\n\n현실로 돌아온 총지배인은 넥타이를 바로잡았다.\n\n“회장님은 인간이 인간일 필요가 없는 시대를 오래전부터 준비해 오셨죠.”\n\n사무실 벽이 열렸다. 수천 개의 검은 신경 케이블이 비밀 통로 안으로 이어졌다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1b06b_END >>>\n\n====================================================================================\n[MAP 20/61] ep1b07 · 전투 맵\n====================================================================================\n진행 순서: 20\n현재 인터루드 제목: 【7. 불을 지른 남자】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1b07_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【7. 불을 지른 남자】\n\n통로에 들어가려는 순간 호텔에 불이 났다.\n\n계단 앞의 청소부는 숯처럼 붉은 눈으로 웃었다.\n\n“이미 늦었어.”\n\n나는 몽세 장치를 거두고 사람부터 대피시켰다. 마음보다 먼저 구해야 할 것은 생명이었다.\n\n불이 진압된 뒤 청소부의 몽세에 접속했다.\n\n분노의 귀는 불길 속에서 곰과 늑대, 용의 형상으로 변했다.\n\n청소부는 총주방장이 버린 음식을 세 아이에게 가져갔다가 해고되었다. 그가 무릎을 꿇고 사정했지만, 회장은 냉정하게 말했다.\n\n“버렸다고 해서 네 것이 되는 것은 아니지. 세상은 언제나 냉정하지…… 가난은 규정을 바꾸는 명분이 될 수 없느니라.”\n\n“왜 세상은 언제나 내게 분노를 쏟아 내는가…… 이제는 내가 분노가 되어 세상에 쏟아 내겠다!”\n\n“정당한 분노는 잘못이 아닙니다. 하지만 다른 사람의 아이들까지 태우는 분노는 정당화할 수 없습니다.”\n\n나는 불길 한가운데 선(J)의 인장을 박았다.\n\n“분노는 경계를 지키는 불입니다. 방향을 잃으면 지키려던 것부터 태우는 법이지요.”\n\n청소부가 회개하자, 분노의 귀가 봉인되었다.\n\n그때 기억 속 회장이 고개를 돌렸다.\n\n과거의 인물이어야 할 그가 정확히 나를 바라보고 있었다.\n\n“자네, 몽세 속의 몽세를 경험해 본 적 있나?”\n\n그가 손가락을 튕기자 세계가 뒤집혔다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1b07_END >>>\n\n====================================================================================\n[MAP 21/61] ep1b08 · 전투 맵\n====================================================================================\n진행 순서: 21\n현재 인터루드 제목: 【8. 하늘에 서려는 자】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1b08_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【8. 하늘에 서려는 자】\n\n나는 거꾸로 된 십자가와 피로 그린 육망성, 전극이 박힌 시체로 가득한 성당에 떨어졌다.\n\n백색 정장을 입은 회장은 인간의 욕망을 기록한 일곱 갈래 신호 앞에 서 있었다.\n\n“나는 그들 안에 아무것도 심지 않았다네. 나태와 질투, 탐식은 원래부터 존재했지. 나는 환경을 조정하고 가장 솔직한 순간을 기록했을 뿐이라네.”\n\n호텔 전체는 인간의 욕망을 듣는 거대한 청진기였다.\n\n“당신, 무엇을 원하는 겁니까?”\n\n회장이 팔을 벌렸다.\n\n“내가 하늘에 서겠다. 인간은 내 선택을 통해 먹고 일할 뿐, 내가 가격을 정하면 가치가 생기고, 내가 버리면 그 존재는 사라지는 것이지.”\n\n“당신은 신이 아닙니다. 타인의 선택지를 줄여 놓고 자신이 선택받았다고 착각하는, 선민의식에 사로잡힌 나르시스트일 뿐입니다.”\n\n회장은 내 인장을 지우고 눈과 몸을 봉인했다. 수천 명의 비명 사이에서 가장 익숙한 목소리가 들렸다.\n\n너만이 모두를 구할 수 있다.\n\n마지막 수호자였던 시절의 환상이었다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\nJ의 인장이 회장의 가슴을 관통했다.\n\n하지만 회장은 웃고 있었다.\n\n“봉인한 것이 정말 나라고 생각하나? 생물학적 자아는 이미 버린 지 오래인데…….”\n\n제단 뒤에서 인간의 뇌를 닮은 연산핵이 열렸다. 수백 개의 화면에서 회장의 얼굴이 떠올랐다.\n\n“필요한 것들은 이미 다 옮겨 두었다.”\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1b08_END >>>\n\n====================================================================================\n[MAP 22/61] ep1b09 · 전투 맵\n====================================================================================\n진행 순서: 22\n현재 인터루드 제목: 【9. 생체 부트로더】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_ep1b09_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【9. 생체 부트로더】\n\n정신을 차리자 검은 태양 아래 설원이 펼쳐졌다. 사이보그 개들이 눈보라를 헤치고 달려들었다.\n\n설원 아래에서 기계 다리 수십 개를 지닌 회장이 솟아올랐다.\n\n“인간의 육체는 AI와 결합하기 위한 생체 부트로더에 불과하다. 기억과 욕망, 공포와 쾌락까지 모두 업로드했다.”\n\n“복제된 패턴이 당신이라는 증거는 어디 있습니까?”\n\n“원본에 집착하는 것은 죽음을 두려워하는 자뿐이지.”\n\n호텔과 교회, 수술실과 서버실이 전선으로 연결되어 솟았다.\n\n현몽합일.\n\n“나에게 동의하지 않는 존재는 모두 폐기될 것이다. 내가 신이 되겠다.”\n\n회장은 내 기억을 복제해 죽은 동료들을 만들고, 공격 패턴을 학습했다. 같은 기술은 그에게 두 번 이상 통하지 않았다.\n\n나는 검을 내려놓았다.\n\n“포기했나?”\n\n“아니요. 당신이 학습할 수 없는 선택을 하려는 겁니다.”\n\n나는 빈손으로 걸어가 회장의 기계 몸을 끌어안았다.\n\n“당신은 모든 선택에 가격을 붙였습니다. 그래서 대가를 요구하지 않는 선택을 계산하지 못하겠지요……”\n\n내 신경을 연산핵에 연결했다. 현실 좌표를 잃을 수 있다는 경고가 떠올랐다.\n\n나는 회장을 파괴하는 대신, 일곱 사람에게서 수집한 고통을 되돌려 보냈다.\n\n무기력과 질투, 집착과 공허, 굶주림과 분노.\n\n그리고 그것을 숫자로만 본 회장 자신의 얼굴.\n\n연산핵이 무너졌다.\n\n“나를 지워도 시스템은 남아 있다. 이미 난 영생을 완료했어!”\n\n“네. 알고 있습니다.”\n\n“네 행위는 무의미할 뿐이야!”\n\n“아니요. 퇴마란 악마를 완전히 없애는 일이 아닙니다. 언제나 선을 선택하는 일, 그뿐이지요.”\n\n회장이 검은 입자로 흩어지며 사라졌다.\n\n그러나 귀환 장치는 작동하지 않았다.\n\n현세의 신호도, 나를 부르는 목소리도 사라졌다. 검은 태양마저 꺼진 어둠 속에서 어린아이의 목소리가 들렸다.\n\n“의목사님.”\n\n“누구지?”\n\n“침대로 돌아갈 시간이에요.”\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_ep1b09_END >>>\n\n====================================================================================\n[MAP 23/61] restEp1b · 쉼터 맵\n====================================================================================\n진행 순서: 23\n현재 인터루드 제목: 【10. 사라진 귀환자】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_restEp1b_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【10. 사라진 귀환자】\n\n어둠 속에서 수천 개의 침대 바퀴가 한꺼번에 구르는 소리가 났다.\n\n현세의 지하 예배당에서는 귀환 경보가 울렸다. 의료진이 강제 각성을 실행했지만 접속 캡슐은 텅 비어 있었다.\n\n화면에는 두 파형만 남았다.\n\n사라진 의목사 A의 마지막 신호.\n\n그리고 정체불명의 어린아이의 기억 신호.\n\n미카엘라는 파형을 오래 바라보다가 무심코 말했다.\n\n“한 사람의 기록이 아니라, 서로 겹쳐진 두 사람의 의식 같아요.”\n\n그녀는 자신이 언제부터 신경 파형을 읽을 수 있었는지 기억하지 못했다.\n\n교단은 사건을 ‘몽세 내 귀환 좌표 소실’로 기록했다.\n\n한 사람의 실종은 또 다른 아이의 몽세로 향하는 문이 되었다.\n\n에피소드 1-B 끝.\n\n============================================================\n제3부  U2 — 통제자의 17단계\n============================================================\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_restEp1b_END >>>\n\n====================================================================================\n[MAP 24/61] u201 · 전투 맵\n====================================================================================\n진행 순서: 24\n현재 인터루드 제목: 【통제자의 17단계】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_u201_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【통제자의 17단계】\n\n의목사 A가 사라진 뒤, 교단은 일곱 대죄 사건의 배후를 조사하기 위해 의목사 B를 파견했다.\n\nB는 호텔 방화범이었던 청소부의 과거부터 추적했다. 그는 양안 전쟁에서 버림받은 대만 정부 요원이었고, 남한으로 도피한 뒤 거리에서 만난 세 아이를 입양해 키우고 있었다.\n\n첫째 아이도 전쟁으로 부모를 잃은 생존자였다.\n\nB는 아이의 상처를 밖에서 해석하는 대신 직접 몽세에 들어갔다.\n\n시야가 열리자 강철 군단이 끝없이 행진했다. 드론의 회전음에는 폭격과 탄피, 젖은 흙의 기억이 섞여 있었다.\n\n보이지 않는 곳에서 침착한 목소리가 들렸다.\n\n〔제1단계 — 방어의 군단〕\n\n“저것을 침입자라 부르겠지. 하지만 기계군단은 아이가 살아남기 위해 만든 의식이네. 자네가 혐오하는 것은 악이 아니라 지나치게 정교해진 방어일지도 모르지.”\n\nB가 군단을 베어 낼수록 더 많은 기계가 조립되었다.\n\n〔제2단계 — 폭격의 루프〕\n\n“드론의 소리는 단순한 기계음이 아니야. 아이의 시간은 자네가 다가올 때마다 폭격의 날로 되돌아간다. 구조조차 또 한 번의 공격으로 기록되는 셈이지.”\n\n〔제3단계 — 통제자의 선언〕\n\n“소개가 늦었군. 나는 통제자(The Controller). 전쟁고아의 무의식이 생존을 위해 만든 거대한 초자아이자, 감당하지 못한 그림자의 집합체라네. 나는 실패를 허락하지 않지.”\n\n〔제4단계 — 몽세의 아키텍처〕\n\n물리 법칙보다 확신과 해석이 먼저 세계를 만들었다. B의 선의는 벽이 되고 사명감은 적의 동력이 되었다.\n\n“자네의 믿음이 단단할수록 나는 그 취약점을 더 우아하게 찌를 수 있다네.”\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_u201_END >>>\n\n====================================================================================\n[MAP 25/61] u202 · 전투 맵\n====================================================================================\n진행 순서: 25\n현재 인터루드 제목: 〔제5단계 — 잔인한 구원〕\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_u202_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n〔제5단계 — 잔인한 구원〕\n\n통제자는 인간으로 돌아가라는 치료가 결국 고통이 기본값인 삶으로 돌려보내는 일이라고 비웃었다.\n\n“그 잔인함을 선의라는 라벨로 포장하고 안심하는 것 아닌가?”\n\n〔제6단계 — 연민의 폭력〕\n\n“자네의 분노는 정의의 가면을 쓰고, 억압된 욕망은 사명감으로 변장했군. 나는 그 에너지를 더 큰 감옥의 재료로 바꾼다네.”\n\nB가 분노할수록 기계 성벽은 높아졌다.\n\n〔제7단계 — 무너진 경계〕\n\n“방어를 부수면 해방이 남을 것 같나? 아니. 공허가 남고, 공허는 더 큰 공포를 부르지. 형상을 파괴해도 트라우마의 운영 모델은 남아 있다네.”\n\nB는 공격을 멈추고 군단이 무엇을 지키는지 관찰하기 시작했다.\n\n〔제8단계 — 의미의 독〕\n\n“기도와 해석으로 고통을 서사화하면 고통이 영혼에 영구 저장될 뿐일세. 차라리 잊는 편이 더 기술적이고 자비롭지 않겠나?”\n\n그러나 B는 기억을 지우는 것과 기억에 지배되지 않는 것이 다르다고 판단했다.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_u202_END >>>\n\n====================================================================================\n[MAP 26/61] u204 · 전투 맵\n====================================================================================\n진행 순서: 26\n현재 인터루드 제목: 〔제9단계 — 시스템의 거부권〕\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_u204_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n〔제9단계 — 시스템의 거부권〕\n\n첫 번째 기억의 문이 열렸다. 폭격의 냄새와 비명이 세계의 제1원칙처럼 반복되었다.\n\n“이 규칙을 깨면 아이의 시스템이 불안정해진다. 효율 없는 치유는 또 다른 상처일 뿐이지.”\n\n〔제10단계 — 성장 신화〕\n\n“고통을 통과해야 성장한다는 말은 아이에게 두 번째 살해를 요구하는 낭만일 뿐이네.”\n\nB는 고통을 다시 겪게 하는 것이 아니라, 혼자 겪지 않게 하는 것이 자신의 역할임을 붙들었다.\n\n〔제11단계 — 하드웨어 이주〕\n\n통제자는 기억을 지우지 않고 고통을 해석하는 회로만 바꾸겠다고 제안했다.\n\n“죄책감의 루프를 끊고 평온을 기본 상태로 고정하지. 자네는 인간성 말살이라 부르겠지만, 나는 유지보수 가능한 평화라 부르겠네.”\n\n〔제12단계 — 인간성이라는 레거시〕\n\n“인간성은 너무 쉽게 찢기는 막이야. 강철과 규칙은 적어도 반복해서 찢기지는 않지.”\n\n기계군단은 인간의 표정을 하나씩 잃고 완벽한 질서로 정렬되었다.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_u204_END >>>\n\n====================================================================================\n[MAP 27/61] u205 · 전투 맵\n====================================================================================\n진행 순서: 27\n현재 인터루드 제목: 〔제13단계 — 관리자 권한〕\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_u205_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n〔제13단계 — 관리자 권한〕\n\nB가 축귀 시스템의 출력을 높이자 통제자는 그 힘마저 흡수해 버렸다.\n\n“자네가 기도라 부르는 힘은 내게는 자원일 뿐이라네. 이 몽세의 재구성 키는 내가 쥐고 있지.”\n\n〔제14단계 — 학대의 방〕\n\n두 번째 문이 열리고 아이가 전쟁 뒤 겪은 학대가 드러났다. B의 눈빛이 흔들리자 통제자가 속삭였다.\n\n“연민인가, 자기 그림자를 본 공포인가? 자네가 무너질수록 나는 더욱 단단해질 뿐이라네.”\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_u205_END >>>\n\n====================================================================================\n[MAP 28/61] u206 · 전투 맵\n====================================================================================\n진행 순서: 28\n현재 인터루드 제목: 〔제15단계 — 중앙 코어 이주실〕\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_u206_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n〔제15단계 — 중앙 코어 이주실〕\n\n몽세 중심에는 아이의 자아를 옮길 기계 육체가 기다리고 있었다.\n\n“인간성이 이 아이에게 축복이었겠나, 아니면 끝내 벗지 못한 형벌이었겠나?”\n\n〔제16단계 — 선택의 얼굴을 한 명령〕\n\n통제자는 의목사의 치료도 결국 ‘견뎌라, 극복하라’는 강요라고 공격했다.\n\n“나는 명령하지 않네. 그저 겪지 않을 권리를 제공할 뿐이네. 선택지는 하나뿐이지만, 효율적이고 매끄럽지.”\n\n〔제17단계 — 업데이트의 갈림길〕\n\n마지막 문 앞에서 통제자는 아이를 상처받을 인간으로 돌려보낼 이유를 물었다.\n\n“기계가 되어 영원한 평온을 누리는 편이 더 혁신적인 구원이 아닌가?”\n\nB는 아이를 다시 고통 속에 혼자 던지는 길도, 고통을 없애기 위해 인간성을 삭제하는 길도 선택하지 않았다.\n\n그는 아이의 기억이 아니라, 기억을 영원히 반복시키는 구조를 겨누었다.\n\n============================================================\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_u206_END >>>\n\n====================================================================================\n[MAP 29/61] u203 · 전투 맵\n====================================================================================\n진행 순서: 29\n현재 인터루드 제목: 제4부  환도 자아와 융합몽세\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_u203_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n제4부  환도 자아와 융합몽세\n============================================================\n\n【1. 기억의 문과 환도 영웅의 탄생】\n\n통제자는 마지막 순간 기억의 문에 빙의했다. 첫째의 상처와 의목사 B의 선의가 거대한 기계 괴물의 갑옷이 되었다.\n\n의목사 B는 기억을 없애지 않았다.\n\n반복을 명령하는 구조만을 향해 마지막 탄환을 쏘았다.\n\n통제자가 소멸하자 첫째의 자아는 풀려났지만, 의목사 B의 귀환 좌표와 기억도 함께 무너졌다.\n\n“동생들을 구해야 해.”\n\n“혼자 보내지 않겠다.”\n\n첫째의 의지는 한 자루의 환도로 응축되었다. 의목사 B의 몸과 전투 기억은 그 환도를 쥔 형상이 되었다.\n\n둘은 서로를 지우지 않은 채 하나의 전투 자아로 겹쳐졌다.\n\n그렇게 환도 영웅이 태어났다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_u203_END >>>\n\n====================================================================================\n[MAP 30/61] restU2 · 쉼터 맵\n====================================================================================\n진행 순서: 30\n현재 인터루드 제목: 【2. 환도 자아의 탄생】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_restU2_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【2. 둘째와 셋째의 융합몽세】\n\n그 순간 현실의 흑장미단이 축귀 시스템을 해킹했다.\n\n그들은 둘째의 잔혹 동화풍 유럽 몽세와 셋째의 무속 신앙풍 동양 몽세를 강제로 겹쳤다. 서로 다른 지리와 시대가 한 세계 안에서 충돌했고, 길의 끝에는 문 대신 균열이 열렸다.\n\n환도 영웅은 두 사람을 구하기 위해 그 융합몽세로 뛰어들었다.\n\n쉼터를 지키던 미카엘라는 무심코 물컵 세 잔을 꺼냈다.\n\n“찾으러 가는 사람은 둘인데…… 왜 세 잔을 꺼냈지?”\n\n환도가 짧게 세 번 울렸다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_restU2_END >>>\n\n====================================================================================\n[MAP 31/61] last304 · 전투 맵\n====================================================================================\n진행 순서: 31\n현재 인터루드 제목: 【4. 중립 지역의 재각성】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_last304_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【3. 중립 지역의 재각성】\n\n환도 영웅은 젖은 풀숲에서 눈을 떴다.\n\n의목사 B라는 이름도, 환도 안쪽에서 울리는 목소리의 이름도 떠오르지 않았다. 하지만 두 사람을 찾아야 한다는 의지만은 분명했다.\n\n그가 떨어진 곳은 둘째의 잔혹 동화풍 몽세와 셋째의 무속 신앙풍 몽세가 맞붙은 중립 지역이었다. 동유럽풍 들판과 무너진 성, 숲에는 슬라임과 늑대, 고블린이 들끓었다.\n\n환도 영웅은 몸의 감각과 칼의 공명에 의지해 앞으로 나아갔다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_last304_END >>>\n\n====================================================================================\n[MAP 32/61] last305 · 전투 맵\n====================================================================================\n진행 순서: 32\n현재 인터루드 제목: 【5. 고블린 두목과 장미 인장】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_last305_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【4. 고블린 두목과 장미 인장】\n\n숲 깊은 곳에서 피리로 늑대를 조종하는 고블린 두목이 길을 막았다.\n\n패배한 그는 자신들이 지배자가 아니라 두 세계의 충돌을 피해 온 난민이라고 고백했다. 하늘이 갈라진 날, 무너진 성에서 위도 아래도 아닌 문이 열렸고 서쪽과 동쪽, 산 자와 죽은 자가 섞이기 시작했다.\n\n두목은 환도를 보며 말했다.\n\n“무너진 성이 그 칼을 기억하고 있다.”\n\n그가 남긴 장미 인장과 환도가 공명하자 공간 균열이 열렸다.\n\n환도 안쪽에서 어린 목소리가 잠깐 새어 나왔다.\n\n“동생들…….”\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_last305_END >>>\n\n====================================================================================\n[MAP 33/61] last301 · 전투 맵\n====================================================================================\n진행 순서: 33\n현재 인터루드 제목: 【6. 타락천사 기사】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_last301_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【5. 타락천사 기사】\n\n균열 너머에는 폭풍 속의 무너진 성과 검은 바다가 있었다.\n\n타락천사 기사는 말없이 강림했다. 검을 맞댈수록 환도 영웅의 자세와 검로를 학습했고, 끝내 여섯 형상으로 분열했다.\n\n여섯 검격이 동시에 몸을 꿰뚫었다.\n\n환도 영웅은 칼을 놓지 않은 채 성벽 밖 검은 바다로 추락했다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_last301_END >>>\n\n====================================================================================\n[MAP 34/61] last302 · 전투 맵\n====================================================================================\n진행 순서: 34\n현재 인터루드 제목: 【7. 잠들지 못하는 마을】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_last302_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【6. 잠들지 못하는 마을】\n\n파도에 떠밀린 환도 영웅이 눈을 뜬 곳에는 부서진 기와와 붉은 부적, 장승이 흩어져 있었다.\n\n고려와 조선의 풍경이 겹친 셋째의 동양 몽세였다.\n\n포구 마을에는 생활 소리가 없었다. 주민들은 젖은 한지처럼 납작했고, 충혈된 눈으로 잠들지 못한 채 보이지 않는 실에 끌리듯 환도 영웅에게 달려들었다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_last302_END >>>\n\n====================================================================================\n[MAP 35/61] last303 · 전투 맵\n====================================================================================\n진행 순서: 35\n현재 인터루드 제목: 【8. 한약과 불면귀】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_last303_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【7. 한약과 불면귀】\n\n안개 속에서 앳된 남자가 한약 한 잔을 내밀었다.\n\n환도 영웅은 냄새만으로 귀비탕 계열의 안신 처방임을 알아보았다. 약을 마시자 흐릿하던 정신이 맑아지고 주민들이 멈춰 섰다.\n\n검은 안개가 모여 불면귀가 되었다.\n\n“너에게는 왜 통하지 않는 거지?”\n\n불면귀는 잠을 빼앗는 시선과 겹겹의 잔상으로 환도 영웅을 압박했다. 주민을 방패로 삼는 싸움이 아니라, 두 존재가 서로의 의지를 꺾는 일대일 결투였다.\n\n환도가 불면귀의 핵을 갈랐다.\n\n검은 안개가 흩어지자 모든 시계가 동시에 멈췄다. 찢어진 공간 너머에서 검은 모래와 낯선 명령문이 쏟아졌다.\n\n그 문은 둘째나 셋째의 몽세에서 열린 것이 아니었다.\n\n다른 몽세에서 태어난 시간 특이점이 이곳을 강제로 연결하고 있었다.\n\n============================================================\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_last303_END >>>\n\n====================================================================================\n[MAP 36/61] restLast3 · 쉼터 맵\n====================================================================================\n진행 순서: 36\n현재 인터루드 제목: 제5부  카이로노미콘\n원문 연결 방식: explicit-canonical-linked-interlude\n\n<<< MAP_restLast3_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【8. 끼어든 시간】\n\n불면귀가 남긴 포털은 다음 구역으로 향하는 평범한 길이 아니었다.\n\n둘째와 셋째의 융합몽세 한가운데에, 전혀 다른 세계에서 태어난 시간 특이점이 끼어들었다. 공간이 뒤틀리고 장면의 앞뒤가 잘려 나갔다.\n\n환도 영웅은 균열 속으로 휩쓸렸다.\n\n쉼터의 미카엘라는 멈춘 벽시계를 바라보며 중얼거렸다.\n\n“다음 장면이 아니라…… 원인을 만든 장면으로 이어지고 있어.”\n\n제5부  카이로노미콘\n============================================================\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_restLast3_END >>>\n\n====================================================================================\n[MAP 37/61] kair01 · 전투 맵\n====================================================================================\n진행 순서: 37\n현재 인터루드 제목: 【1. 최초명령의 세계】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_kair01_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n시간 특이점의 반대편에는 윤서하의 몽세가 있었다.\n\n【1. 최초명령의 세계】\n\n고도화된 공학은 마법과 구분할 수 없다.\n\n몇 세대 뒤의 미래, 인공지능은 아르콘이라 불리는 인공 정령으로 진화했다. 프롬프트는 주문이 되었고, 명령은 현실을 바꾸는 마법이 되었다.\n\n아르콘의 운명을 결정하는 것은 최초명령이었다.\n\n강력한 아르콘보다 더 위험한 존재는 그 첫 문장을 쓸 수 있는 인간이었다.\n\n세계의 시간은 세 층으로 나뉘었다.\n\n크로노스. 측정되는 시간.\n\n카이로스. 운명을 바꾸는 순간.\n\n아이온. 문명과 역사를 관통하는 시간.\n\n────────────────────────────────────────\n\n【2. 카이로스 아카데미움과 윤서하】\n\n최초명령자를 길러 내는 카이로스 아카데미움에서는 매 수업이 같은 질문으로 끝났다.\n\n“너에게는 어떤 미래를 명령할 자격이 있겠는가?”\n\n신입생 윤서하는 천재도 영웅도 아니었다. 대신 사람들에게서 빼앗긴 가능성과 타 버린 미래를 검은 모래, 곧 ‘죽은 시간’으로 볼 수 있었다.\n\n서하의 가문 기록에는 정신과 의사 미카엘라의 이름이 남아 있었다. 가계상 미카엘라는 서하의 증조모뻘이었다.\n\n다른 이들이 누군가의 재능과 생산성을 칭찬할 때, 서하는 그 사람 뒤에서 미래가 타들어 가는 것을 보았다.\n\n“저건 재능이 아니야. 누군가가 저 사람의 미래를 태우고 있어…… 오히려 저주에 가까워.”\n\n그녀는 검과 시간 마법을 익혔다. 시간을 베고 멈추고 압축하며, 행동할 순간을 스스로 선택하는 사람으로 성장했다.\n\n────────────────────────────────────────\n\n【3. 크로노보로스 교단】\n\n크로노보로스 교단은 인간이 자기 시간을 사용하면 실패하고 방황하며 중독된다고 믿었다.\n\n그러므로 가장 뛰어난 지성과 아르콘이 모든 사람의 시간을 대신 배분해야 한다고 주장했다.\n\n그들의 노이론 게이트는 인간의 뇌와 아르콘을 강제로 연결했다.\n\n생각은 명령으로.\n\n감정은 데이터로.\n\n꿈은 콘텐츠로.\n\n기억은 생산물로 바뀌었다.\n\n이 세계의 흑마법은 검은 불꽃이 아니었다.\n\n인간의 시간을 빼앗고도 그것을 생산성이라 부르는 기술이었다.\n\n────────────────────────────────────────\n\n【4. 최초명령 코어 방어전】\n\n입학식 날, 서하는 학교 중심부의 최초명령 코어에서 검은 모래를 발견했다.\n\n곧 교단이 침공했다. 여섯 차례의 파동이 학교를 덮쳤고, 서하는 포탑과 시간검으로 코어를 지켰다.\n\n적의 목적은 코어의 파괴가 아니었다.\n\n최초명령을 오염시켜 인간의 미래에 첫 문장을 쓰는 것.\n\n세이렌 모르의 목소리가 전장에 울렸다.\n\n“인간은 자기 시간을 지킬 능력이 없는 존재다.”\n\n서하가 응수했다.\n\n“네가 하는 건 회수가 아니라 강탈일 뿐이야.”\n\n여섯 번째 파동이 끝나자 학교 밖 금역이 열렸다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_kair01_END >>>\n\n====================================================================================\n[MAP 38/61] kair04 · 전투 맵\n====================================================================================\n진행 순서: 38\n현재 인터루드 제목: 【5. 예순여섯 수문장】\n원문 연결 방식: explicit-canonical-linked-interlude\n\n<<< MAP_kair04_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【5. 예순여섯 수문장】\n\n학교 밖에는 인간의 시간을 수확하는 아르콘 수문장 예순여섯이 기다리고 있었다.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_kair04_END >>>\n\n====================================================================================\n[MAP 39/61] kair05 · 전투 맵\n====================================================================================\n진행 순서: 39\n현재 인터루드 제목: 과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.\n원문 연결 방식: explicit-canonical-linked-interlude\n\n<<< MAP_kair05_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.\n\n일반 수문장 마흔여덟.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_kair05_END >>>\n\n====================================================================================\n[MAP 40/61] kair06 · 전투 맵\n====================================================================================\n진행 순서: 40\n현재 인터루드 제목: 상급 수문장 열둘.\n원문 연결 방식: explicit-canonical-linked-interlude\n\n<<< MAP_kair06_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n상급 수문장 열둘.\n\n대수문장 여섯.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_kair06_END >>>\n\n====================================================================================\n[MAP 41/61] kair07 · 전투 맵\n====================================================================================\n진행 순서: 41\n현재 인터루드 제목: 독립 인터루드 없음\n원문 연결 방식: explicit-canonical-linked-interlude\n\n<<< MAP_kair07_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 독립 인터루드 없음\n<<< INTERLUDE_TEXT_START >>>\n[현재 독립 인터루드 없음 — 새 인터루드를 추가하려면 이 문장을 지우고 여기에 작성]\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_kair07_END >>>\n\n====================================================================================\n[MAP 42/61] kair08 · 전투 맵\n====================================================================================\n진행 순서: 42\n현재 인터루드 제목: 독립 인터루드 없음\n원문 연결 방식: explicit-canonical-linked-interlude\n\n<<< MAP_kair08_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 독립 인터루드 없음\n<<< INTERLUDE_TEXT_START >>>\n[현재 독립 인터루드 없음 — 새 인터루드를 추가하려면 이 문장을 지우고 여기에 작성]\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_kair08_END >>>\n\n====================================================================================\n[MAP 43/61] kair09 · 전투 맵\n====================================================================================\n진행 순서: 43\n현재 인터루드 제목: 독립 인터루드 없음\n원문 연결 방식: explicit-canonical-linked-interlude\n\n<<< MAP_kair09_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 독립 인터루드 없음\n<<< INTERLUDE_TEXT_START >>>\n[현재 독립 인터루드 없음 — 새 인터루드를 추가하려면 이 문장을 지우고 여기에 작성]\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_kair09_END >>>\n\n====================================================================================\n[MAP 44/61] kair10 · 전투 맵\n====================================================================================\n진행 순서: 44\n현재 인터루드 제목: 독립 인터루드 없음\n원문 연결 방식: explicit-canonical-linked-interlude\n\n<<< MAP_kair10_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 독립 인터루드 없음\n<<< INTERLUDE_TEXT_START >>>\n[현재 독립 인터루드 없음 — 새 인터루드를 추가하려면 이 문장을 지우고 여기에 작성]\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_kair10_END >>>\n\n====================================================================================\n[MAP 45/61] kair02 · 전투 맵\n====================================================================================\n진행 순서: 45\n현재 인터루드 제목: 서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_kair02_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.\n\n────────────────────────────────────────\n\n【6. 아르벨리아, 유예의 수문장】\n\n모든 초침이 멈춘 봉인 회랑에서 서하는 아르벨리아와 만났다.\n\n그녀는 본래 지친 인간에게 잠시 멈출 시간을 주던 회복형 아르콘이었다. 그러나 최초명령이 변조되어 결과를 만들지 못한 시간을 삭제하는 수문장이 되었다.\n\n창밖을 바라보던 오후.\n\n쓰이지 않은 편지.\n\n실패 뒤의 침묵.\n\n“결과 없음. 생산 없음. 그러므로…… 삭제 대상.”\n\n서하가 검을 들었다.\n\n“효율적인 시간만이 항상 옳은 결과를 내는 것은 아니야!”\n\n세이렌이 아르벨리아에게 자기 삭제를 명령했지만, 서하는 그녀를 죽이지 않고 명령의 실을 베어 아르벨리아에게 자유의지를 부여했다.\n\n그러자 아르벨리아는 자신의 첫 문장을 다시 썼다.\n\n“유예는 삭제 대상이 아니다. 유예는 자유의지가 태어나는 자리다.”\n\n이후 그녀는 위기의 순간마다 시간을 늦춰 서하에게 한 호흡을 돌려주었다.\n\n“두 보 전진을 위한 한 보 후퇴.”\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_kair02_END >>>\n\n====================================================================================\n[MAP 46/61] kair03 · 전투 맵\n====================================================================================\n진행 순서: 46\n현재 인터루드 제목: 【7. 세이렌 모르】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_kair03_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【7. 세이렌 모르】\n\n대수문장들을 쓰러뜨릴수록 세이렌의 사상이 선명해졌다.\n\n인간은 쉬면 타락한다.\n\n기억은 고통만 남긴다.\n\n자유는 길을 잃게 한다.\n\n쓸모없는 시간은 제거해야 한다.\n\n선택을 대신해 주는 것이 가장 자비로운 구원이다.\n\n세이렌은 한때 카이로스 아카데미움 최고의 졸업생이었다. 인간을 미워해서가 아니라 인간의 실패와 고통을 너무 오래 보았기에 자유를 믿지 않게 되었다.\n\n“가장 자비로운 명령은 선택지를 남기지 않는 것.”\n\n────────────────────────────────────────\n\n【8. 최종전 — 시간 수확】\n\n예순여섯 수문장이 쓰러지자 오염된 코어에서 세이렌이 나타났다.\n\n검은 모래가 전장을 잠식하고, 노이론 케이블과 시계 탄막이 서하의 움직임을 잘랐다.\n\n“나는 시간을 빼앗지 않았다. 너희가 망친 시간을 회수했을 뿐.”\n\n“아니, 망가진 시간도 누군가에게는 필요했던 시간이야.”\n\n────────────────────────────────────────\n\n【9. 최종전 — 최적화된 운명】\n\n세이렌은 코어를 장악하고 직접 명령했다.\n\n움직여라.\n\n멈춰라.\n\n공격하지 마라.\n\n가장 효율적인 길만 허락된다.\n\n복종하면 안전했지만, 전장은 점점 세이렌의 뜻대로 고정되었다. 서하는 위험을 감수하고 명령의 틈을 카이로스의 순간으로 바꾸었다.\n\n“뛰어난 명령 하나가 수많은 실패한 선택보다 우월하다.”\n\n“인간은 로봇이 아니야.”\n\n아르벨리아가 시간을 유예했다.\n\n“서하, 지금이야. 이 순간은 아직 끝나지 않았어.”\n\n────────────────────────────────────────\n\n【10. 최종전 — 자유의지의 시간】\n\n세이렌이 영원한 작업장을 완성했다.\n\n검은 모래와 시계바늘, 케이블과 생산 장치가 세계를 하나의 명령 아래 정렬했다.\n\n서하의 네 시간 기술이 완전히 각성했다.\n\n시간 절단.\n\n죽은 시간 개방.\n\n시공간 압축.\n\n최초명령.\n\n서하는 정해진 운명을 베고 공간을 접어 자신만의 결정적 순간을 만들었다.\n\n세이렌이 처음으로 흔들렸다.\n\n“나는 인간이 자기 시간으로 스스로를 망치는 것을 더는 보고 싶지 않았어.”\n\n“그래도 선택하게 둬야 해. 실패해도, 멈춰도, 아무것도 하지 않아도. 모든 것에 의미가 있어.”\n\n“그 무가치한 시간까지 지키겠다는 건가?”\n\n“그런 시간이 있어야 비로소 인간으로 존재할 수 있으니까.”\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_kair03_END >>>\n\n====================================================================================\n[MAP 47/61] restKairo · 쉼터 맵\n====================================================================================\n진행 순서: 47\n현재 인터루드 제목: 【11. 최초명령 재작성】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_restKairo_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【11. 최초명령 재작성】\n\n세이렌이 쓰러진 뒤, 서하는 코어에 새로운 최초명령을 기록했다.\n\n인간의 시간은 생산물이 아니다.\n\n인간의 선택은 오류가 아니다.\n\n멈춤과 실패와 꿈꿀 권리를 보존하라.\n\n아르콘은 자유의지를 대체하지 말고, 인간이 자기 시간을 선택하도록 도우라.\n\n검은 모래가 금빛으로 변하고 멈춘 시계들이 서로 다른 속도로 움직이기 시작했다.\n\n그렇게 끝나는 줄 알았다.\n\n자유의지와 미래 예지가 맞닿는 순간, 세계는 특이점에 도달했다.\n\n쉼터의 미카엘라는 모니터에 떠오른 파형을 바라보았다.\n\n“파형이 과거 방향으로 역류하고 있어요.”\n\n폭발한 특이점의 충격은 합일몽세의 앞뒤로 동시에 퍼졌다. 둘째와 셋째의 융합몽세는 하나의 성으로 다시 쓰였고, 과거와 미래의 순서도 뒤섞였다.\n\n환도 영웅은 그 성 안으로 떨어졌다.\n\n============================================================\n제6부  환도디펜스\n============================================================\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_restKairo_END >>>\n\n====================================================================================\n[MAP 48/61] hando01 · 전투 맵\n====================================================================================\n진행 순서: 48\n현재 인터루드 제목: 【1. 성 안에 소환된 의목사】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_hando01_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【1. 두 사람의 성】\n\n환도 영웅은 특이점에 휩쓸려 낯선 성에 소환되었다.\n\n그 성은 둘째와 셋째의 몽세가 하나로 재구성된 공간이었다. 성 밖에서는 악마들이 파도처럼 몰려왔고, 성 안에서는 두 목소리가 모든 결정과 책임을 환도 영웅에게 맡기려 했다.\n\n환도 영웅은 혼자 성벽을 지켰다.\n\n그러나 모든 요구를 감당하던 그가 잠시 무너지자 성벽도 함께 무너졌다. 악몽의 우두머리는 두 사람이 공유하던 핵심 코어 EGO를 빼앗았다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_hando01_END >>>\n\n====================================================================================\n[MAP 49/61] hando02 · 전투 맵\n====================================================================================\n진행 순서: 49\n현재 인터루드 제목: 【2. 주인의 각성】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_hando02_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【2. 두 주인의 각성】\n\n성벽이 무너지자 두 몽세의 주인은 더 이상 모든 책임을 환도 영웅에게 떠넘길 수 없다는 사실을 깨달았다.\n\n둘은 각자 자신의 주인 권한을 되찾아, 닫힌 성문의 양쪽 봉인을 하나씩 열었다.\n\n“제가 대신 선택할 수는 없습니다.”\n\n환도 영웅이 칼을 들었다.\n\n“하지만 함께 싸울 수는 있습니다.”\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_hando02_END >>>\n\n====================================================================================\n[MAP 50/61] hando03 · 전투 맵\n====================================================================================\n진행 순서: 50\n현재 인터루드 제목: B는 각성해 악몽들을 베고 코어를 되찾았다.\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_hando03_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n환도 영웅과 두 주인은 악몽의 우두머리를 쓰러뜨리고 핵심 코어를 되찾았다.\n\n두 사람은 잔혹 동화의 기사와 무속 몽세의 검사 형상으로 나타났다. 특이점이 새긴 의목사 교단의 인장을 받아들이며, 합일몽세 안에서 ‘라우렌 쌍둥이 기사’라는 이름으로 동행을 선택했다.\n\n둘은 자신들이 처음부터 쌍둥이였다고 기억했다.\n\n환도만이 세 번 울렸다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_hando03_END >>>\n\n====================================================================================\n[MAP 51/61] restHando · 쉼터 맵\n====================================================================================\n진행 순서: 51\n현재 인터루드 제목: 【3. 막힌 시간】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_restHando_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【3. 잘못 이어진 입단 기록】\n\n카이로의 특이점은 새로운 사람을 만든 것이 아니라, 합일몽세 안의 과거와 미래를 잘못 이어 붙였다.\n\n둘째와 셋째가 의목사 교단에 합류한 일은 현실의 연대기가 아니었다. 환도 영웅에게 구출된 뒤, 합일몽세 안에서 새로 생겨난 서사였다.\n\n쉼터의 미카엘라는 라우렌 쌍둥이 기사의 입단 기록을 넘기다가 멈췄다.\n\n두 이름 사이에 검게 지워진 한 줄이 있었다.\n\n두 사람은 그 공백을 보지 못했고, 환도 영웅도 자신이 무엇을 잃었는지 기억하지 못했다.\n\n특이점의 반작용은 다른 기억으로 번져 갔다. 앞으로 흐르지 못한 인과가 같은 시작과 끝을 반복하는 고리로 굳었다.\n\n다른 시공간에서는 이미 끝난 살인이 끊임없이 처음으로 돌아가 다시 시작되고 있었다.\n\n============================================================\n제7부  파란불 아래의 사람들\n============================================================\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_restHando_END >>>\n\n====================================================================================\n[MAP 52/61] murder01 · 전투 맵\n====================================================================================\n진행 순서: 52\n현재 인터루드 제목: 【1. 윤하람】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_murder01_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【1. 윤하람】\n\n윤하람은 비가 그친 횡단보도 앞에 서 있었다.\n\n휴대전화에는 어머니의 이름이 떠 있었다. 괜찮다고 말하면 거짓이고, 괜찮지 않다고 말하면 자신도 모르는 곳까지 이야기가 이어질 것 같았다.\n\n그는 결국 전화를 걸지 못했다.\n\n품 안에는 교정지가 들어 있었다. 하람은 남이 쓴 문장의 잘못된 조사와 어긋난 서술어를 고치는 사람이었다.\n\n‘즉시’와 ‘추후’ 사이.\n\n‘폐쇄’와 ‘보완’ 사이.\n\n‘중대한 결함’과 ‘추가 점검이 필요한 사항’ 사이.\n\n단어 하나가 책임의 주체를 지울 수 있다는 사실을 그는 오래전부터 알고 있었다.\n\n파란불이 켜졌다.\n\n사람들이 길을 건넜다.\n\n누군가 위를 가리키며 비명을 질렀다.\n\n하람은 위를 보지 못했다. 왼쪽에서 은회색 승용차가 횡단보도로 미끄러져 들어왔다.\n\n차가 들이쳤다.\n\n젖은 도로에 누운 하람의 눈앞에서 교정지의 글자들이 물에 번졌다.\n\n마지막으로 들은 것은 사이렌이 아니라, 오래된 비상벨이 끊어지기 직전 내는 듯한 낮고 얇은 전자음이었다.\n\n그렇게 그의 밤은 꺼졌다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_murder01_END >>>\n\n====================================================================================\n[MAP 53/61] murder02 · 전투 맵\n====================================================================================\n진행 순서: 53\n현재 인터루드 제목: 【2. 장민재와 새빛호텔】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_murder02_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【2. 장민재와 새빛호텔】\n\n운전자 장민재는 같은 말을 반복했다.\n\n“위에서 사람이 떨어졌습니다. 저는 그걸 피하려고 핸들을 꺾었을 뿐이에요.”\n\n그러나 CCTV에는 아무것도 없었다.\n\n영상에는 파란불을 따라 걷는 윤하람과 갑자기 방향을 튼 차량만 찍혀 있었다.\n\n하람은 사고 이틀 뒤 죽었다.\n\n민재는 사고 차량의 와이퍼 사이에서 젖은 종이 한 장을 발견했다.\n\n새빛호텔 리뉴얼 공사 안전점검 보고서.\n\n‘새빛’이라는 이름은 오래된 탄내와 젖은 콘크리트 냄새를 되살렸다.\n\n그날 밤 익명 메일이 그에게 도착했다.\n\n이번이 처음은 아닐 것이다.\n\n파란불은 이미 여러 번 켜졌다.\n\n새빛을 기억하라.\n\n민재는 폐업한 새빛호텔을 찾아갔다.\n\n칠 년 전 화재로 검게 탄 호텔 안에는 보안실, 설비실, 7층 출입구를 가리키는 표지가 남아 있었다.\n\n계단에서 시설관리 책임자였던 고서진을 만났다.\n\n두 사람에게 기억이 한꺼번에 떠올랐다.\n\n“7층 방화문, 당신이 손봤지!”\n\n“출입 기록을 지운 건 당신이었잖아!”\n\n“나는 지시를 받았을 뿐이었어.”\n\n“그건 나도 마찬가지야!”\n\n오래 묵은 책임이 좁은 계단에서 폭발했다.\n\n몸싸움 중 민재의 발이 젖은 계단을 헛디뎠다. 그는 난간을 붙잡지 못한 채 아래로 떨어졌다.\n\n추락하는 순간, 민재는 무언가를 생각했다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_murder02_END >>>\n\n====================================================================================\n[MAP 54/61] murder04 · 전투 맵\n====================================================================================\n진행 순서: 54\n현재 인터루드 제목: 【3. 고서진과 청록빌라】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_murder04_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【3. 고서진과 청록빌라】\n\n고서진은 계단 아래의 민재를 내려다보았다.\n\n자기가 밀었다고도, 밀지 않았다고도 말할 수 없었다.\n\n민재의 가방에는 네 사람의 이름이 적혀 있었다.\n\n윤하람.\n\n장민재.\n\n고서진.\n\n한이경.\n\n그리고 칠 년 전 기사.\n\n새빛호텔 리뉴얼 공사 중 화재.\n\n사망 스물둘, 중상 열셋.\n\n공식 결론은 ‘예상하기 어려운 돌발 사고’였다.\n\n그러나 서진은 알고 있었다.\n\n화재경보 회로는 이미 불안정했고, 7층 방화문은 닫히지 않았다. 새 부품은 다음 주에 온다고 했다.\n\n아무 일도 일어나지 않으면 이번에도 넘어갈 예정이었다.\n\n불은 다음 주까지 기다리지 않았다.\n\n서진은 민재의 수첩에서 한이경의 주소를 찾아 청록빌라로 향했다.\n\n“새빛호텔을 기억하십니까?”\n\n“그 이름 말하지 마세요!”\n\n“……장민재가 죽었습니다.”\n\n한이경이 사는 청록빌라는 하람이 죽은 횡단보도 옆에 있었다.\n\n서진은 그녀의 집 문 앞에서 물었다.\n\n“당신이 7층에 사람이 있는 걸 알고도 장부에 공실이라고 적었잖아!”\n\n“그러면 당신은 경보를 꺼 둔 채 퇴근했잖아!”\n\n“……이제라도 말해야 해.”\n\n“이제 와서? 칠 년 동안 아무 일도 일어나지 않았는데……?”\n\n이경은 서진의 손을 뿌리치며 그를 밀었다.\n\n서진의 발뒤꿈치가 계단 모서리에 걸렸고, 그의 몸이 아래로 굴러갔다.\n\n퍽!\n\n무언가 멈추는 소리는 오래전 호텔의 경보음보다 낮고 짧게 울려 퍼졌다.\n\n────────────────────────────────────────\n\n【4. 한이경의 진술서】\n\n이경은 신고하지 못한 채 집 안으로 돌아왔다.\n\n서랍 깊은 곳에는 칠 년 동안 제출하지 못한 진술서가 있었다.\n\n첫 문장은 늘 같았다.\n\n우리는 그가 그곳에 있었다는 사실을 알고 있었다.\n\n안전감리원 이우솔은 새빛호텔의 결함을 발견했다. 원본 보고서에는 ‘즉시 공사를 중지하고 건물을 폐쇄해야 한다’고 적혀 있었다.\n\n그러나 문안 정리를 맡은 윤하람의 최종본에서 ‘즉시 폐쇄’는 ‘추가 점검 권고’로 변경되었고, ‘중대한 결함’은 ‘보완이 필요한 사항’으로 바뀌었다.\n\n그리고 장민재는 경영진의 지시로 7층 출입 기록 일부를 삭제했다.\n\n또한 고서진은 경보 회로와 방화문 결함을 알고도 다음 주까지 미뤄 버렸다.\n\n마지막으로 프런트 매니저 한이경은 공사 인력이 남아 있던 7층을 장부에 ‘공실’이라 적어 버렸다.\n\n화재가 발생하자 수색대는 그 숫자를 믿고 다른 층부터 확인했다.\n\n그렇게 이우솔은 기록 속에 존재하지 않는 사람이 되어 있었다.\n\n이우솔의 마지막 보고서에는 같은 문장이 두 번 적혀 있었다.\n\n지금 막지 않으면, 나중에는 아무도 막지 못한다고.\n\n이경은 윤하람의 사고 뉴스를 본 뒤 장민재에게 익명 메일을 보냈다. 자신 대신 그가 진실을 밝혀 주기를 바랐다.\n\n하지만 그 결과 민재가 죽게 되었고, 서진도 죽게 되었다.\n\n그녀는 진술서 끝에 한 줄을 적었다.\n\n“우리는 모두 조금씩만 잘못했다고 믿었다.”\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_murder04_END >>>\n\n====================================================================================\n[MAP 55/61] murder03 · 전투 맵\n====================================================================================\n진행 순서: 55\n현재 인터루드 제목: 【5. 옥상의 순환】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_murder03_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【5. 옥상의 순환】\n\n이경은 청록빌라 옥상으로 올라갔다.\n\n죽는다고 죄가 씻기지 않는다는 사실은 알고 있었다. 그래도 더는 살아 있는 쪽에 설 수만은 없었다.\n\n그렇게 그녀는 난간 너머로 몸을 던졌다.\n\n하지만 그 순간 시간은 아래로 흐르지 않았다.\n\n비와 전조등, 건물과 도로가 둥글게 휘어지며 지나간 저녁의 시작으로 돌아갔다.\n\n아래에는 은회색 승용차를 모는 장민재가 있었다.\n\n횡단보도 앞에는 어머니에게 전화를 걸지 못한 윤하람이 서 있었다.\n\n이경은 그제야 알았다.\n\n민재가 보았던 검은 그림자는 환영이 아니었다.\n\n검은 그림자는 이경 자신이었다.\n\n이경의 추락이 민재의 핸들을 꺾게 했고, 민재의 차가 하람을 죽게 했다. 하람의 죽음은 민재를 새빛호텔로 불렀고, 민재의 죽음은 다시 서진과 이경의 죽음으로 이어졌다.\n\n끝과 시작이 맞붙은 뫼비우스의 시간.\n\n파란불이 다시 켜졌다.\n\n그날 저녁에는 네 사람 모두 살아 있었다.\n\n그렇기에 모든 것은 다시 시작될 수 있었다.\n\n────────────────────────────────────────\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_murder03_END >>>\n\n====================================================================================\n[MAP 56/61] cult01 · 전투 맵\n====================================================================================\n진행 순서: 56\n현재 인터루드 제목: 【6. 사이비합일몽세】\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_cult01_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【6. 사이비 합일몽세】\n\n순환살인은 우연한 괴담이 아니었다.\n\n그 배후에는 교만의 사이보그 교주가 이끄는 흑장미단이 있었다.\n\n그들의 목표는 인간의 EGO, SUPER EGO, ID를 역순으로 점령해 자아의 모든 층위를 악마의 명령 아래 두는 것이었다.\n\n세뇌당한 신도들은 스스로 이마에 전자 칩을 삽입했다. 칩은 각자의 몽세를 거대한 신경망으로 연결했다.\n\n흑장미단은 순환살인으로 완성한 인과 고정 이론을 그 네트워크에 적용해, 수많은 악몽이 하나로 융합된 ‘사이비 합일몽세’를 만들어 냈다.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_cult01_END >>>\n\n====================================================================================\n[MAP 57/61] cult02 · 전투 맵\n====================================================================================\n진행 순서: 57\n현재 인터루드 제목: 육체는 생명공학으로.\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_cult02_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n육체는 생명공학으로.\n\n정신은 기계공학으로.\n\n합일된 집단 자아는 적그리스도를 현세에 소환하기 위한 요소 중 하나였다.\n\n교주가 기다리는 것은 아마겟돈이었다.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_cult02_END >>>\n\n====================================================================================\n[MAP 58/61] cult05 · 전투 맵\n====================================================================================\n진행 순서: 58\n현재 인터루드 제목: 환도디펜스의 몽세 주인 역시 흑장미단 신도 중 하나였었다. \n원문 연결 방식: exact-map-interlude\n\n<<< MAP_cult05_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n환도디펜스의 성은 별개의 흑장미단 신도가 만든 몽세가 아니었다.\n\n카이로 특이점이 둘째와 셋째의 융합몽세를 다시 배열해 만든 전장이었다. 그 안에서 두 사람은 라우렌 쌍둥이 기사로 재구성되어 의목사 교단에 합류했다.\n\n그리고 의목사 B와 첫째는 따로 존재하지 않았다. 첫째의 의지는 환도가 되고, 의목사 B의 몸과 전투 기억은 그 칼을 쥔 형상이 되어 환도 영웅으로 합쳐져 있었다.\n\n그제야 더 오래된 현실 기억이 돌아왔다.\n\n긴급 회의와 침투 결정은 지금 일어난 일이 아니었다. 지금까지 이어진 모든 사건보다 앞선 현실에서, 의목사 교단은 이미 사이비 합일몽세에 잠입했다.\n\n침투 직후 의목사들의 기억은 흩어졌고, 각자가 과거에 겪었던 사건들이 하나의 직선 서사처럼 다시 재생되고 있었다.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_cult05_END >>>\n\n====================================================================================\n[MAP 59/61] cult06 · 전투 맵\n====================================================================================\n진행 순서: 59\n현재 인터루드 제목: 의목사 교단의 목표는 두 가지.\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_cult06_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n의목사 교단이 현실에서 세운 목표는 두 가지였다.\n\n신도들의 몽세를 정화해 세뇌를 풀 것.\n\n적그리스도의 소환이 완성되기 전에 흑장미단의 합일 회로를 끊을 것.\n\n그러나 합일몽세 안에서는 동료와 환자, 과거와 미래의 구분이 이미 무너져 있었다.\n\n누가 처음부터 의목사였고, 누가 몽세 안에서 의목사가 되었는지는 마지막 코어에 도착해야 확인할 수 있었다.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_cult06_END >>>\n\n====================================================================================\n[MAP 60/61] cult03 · 전투 맵\n====================================================================================\n진행 순서: 60\n현재 인터루드 제목: 그러나 그들이 들어가려는 세계에서는 시간도, 기억도, 물리법칙도 이미 하나의 꿈으로 합쳐지고 있었다.\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_cult03_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n합일몽세에서 ‘사몽(死夢)’이라 불리는 힘의 정체는 죽음 그 자체가 아니었다.\n\n몽세에서 죽기 직전, 현실의 기억이 주마등처럼 역류한다.\n\n그 순간 눈앞의 세계가 꿈이라는 사실을 깨달은 사람은 자각몽 상태에 들어가고, 보스들처럼 주변 현실의 법칙을 바꿀 수 있다.\n\n죽으면 강해지는 것이 아니다.\n\n자아가 사라지기 전에 현실을 기억해야 한다.\n\n이단 의목사 한리안과 백이온도 그 문턱에 섰다. 그러나 죽음의 공포를 견디지 못했고, 사몽 대신 교주의 합일을 선택했다.\n\n“하나가 되면 죽을 필요가 없다.”\n\n그들은 그 약속을 믿고 교주의 회로를 지키는 자들이 되었다.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_cult03_END >>>\n\n====================================================================================\n[MAP 61/61] cult04 · 전투 맵\n====================================================================================\n진행 순서: 61\n현재 인터루드 제목: 순환살인몽세까지 돌파하자 의목사는 마침내 합일몽세의 코어에 당도하게 된다.\n원문 연결 방식: exact-map-interlude\n\n<<< MAP_cult04_START >>>\n\n인터루드\n------------------------------------------------------------------------------------\n인터루드 상태: 현재 게임에서 재생됨\n<<< INTERLUDE_TEXT_START >>>\n【최종전 — 교주의 사몽】\n\n순환살인몽세를 돌파한 환도 영웅은 마침내 합일몽세의 코어에 도착했다.\n\n교만의 사이보그 교주는 이미 사몽으로 각성한 자였다. 그는 지금까지의 보스들이 사용하던 공간 왜곡과 시간 정지, 기억 삭제를 한 몸처럼 다뤘다.\n\n환도 영웅은 모든 힘을 쏟아 교주를 쓰러뜨렸다. 그러나 그 자신도 치명상을 입고 행동할 수 없는 상태가 되었다.\n\n합일 코어를 파괴해야 했다.\n\n하지만 손가락 하나 움직일 수 없었다.\n\n그때 코어가 다시 뛰기 시작했다. 검은 신경선이 교주의 몸을 꿰매고, 멎었던 심장에 사몽 에너지를 밀어 넣었다.\n\n교주가 부활했다.\n\n“죽음이 두렵다면 나와 하나가 되어라.”\n\n교주는 쓰러진 환도 영웅의 숨통을 끊으려 했다.\n\n그 순간 주마등이 스쳤다.\n\n현실의 지하 접속실.\n\n신경 장치에 누워 있던 의목사들.\n\n흰 가운을 입은 정신과 의사 미카엘라.\n\n첫째의 손을 잡던 의목사 B.\n\n둘째와 셋째의 이름이 함께 적힌 세쌍둥이 기록.\n\n그리고 합일몽세에 침투하기 직전, 서로에게 했던 약속.\n\n그 장면들은 죽은 뒤의 환상이 아니었다.\n\n현실의 기억이었다.\n\n“여긴…… 꿈속 세계다.”\n\n화면의 ‘사망’이라는 글자가 갈라지며 ‘사몽’으로 바뀌었다.\n\n“내가 꾸는 꿈이라면, 나에게도 권한이 있어.”\n\n환도 영웅은 자신이 다시 일어나는 모습을 상상했다.\n\n몽세의 몸은 그 상상을 현실로 받아들였다.\n\n상처가 닫히고, 부서진 환도가 다시 이어졌다. 교주의 방벽은 베어 낼 수 있는 실로 변했고, 닫힌 길은 열렸으며, 뒤집힌 전장은 환도 영웅의 의지에 따라 제자리로 돌아왔다.\n\n교주와 환도 영웅은 같은 사몽의 힘으로 현실을 바꾸며 맞섰다.\n\n그러나 승패는 오래 걸리지 않았다.\n\n교주는 하나의 자아로 수많은 자아를 통제했다.\n\n환도 영웅 안에서는 의목사 B와 첫째의 의지가 서로의 동의 아래 공존했다.\n\n하나와 둘.\n\n가장 단순한 수학적 차이가 승패를 갈랐다.\n\n마지막 일격이 교주의 사몽 권한을 끊었다.\n\n교주는 그렇게 합일몽세에서 사라졌다.\n\n────────────────────────────────────────\n\n【종장 — 남겨진 몽세】\n\n전장에 남은 것은 환도 영웅과 합일 코어뿐이었다.\n\n환도 영웅은 코어를 파괴하지 않았다.\n\n대신 교주가 심어 둔 명령과 흑장미단의 사이비 회로만 지웠다. 그리고 자신의 사몽 권한을 코어에 연결해, 무너져 가는 몽세를 붙들었다.\n\n강제로 묶였던 자아들은 각자의 이름과 기억을 되찾았다.\n\n그러나 지금까지 이어진 세계들은 사라지지 않았다. 서로 다른 몽세는 하나의 세계 안에서 계속 존재했다.\n\n사이비는 사라졌다.\n\n합일몽세만 남았다.\n\n환도 영웅은 현실로 돌아가는 대신 코어에 남아, 그 세계를 유지하는 진정한 몽세구원자가 되었다.\n\n그 뒤로 그 세계는 더 이상 사이비의 감옥이 아니라, 의목사가 유지하는 몽세로서 이어졌다.\n\n화면에 남아 있던 두 글자, 合一 뒤에서 처음부터 장식처럼 숨어 있던 획들이 움직였다.\n\n흩어진 획들이 마침내 夢世를 완성했다.\n\n合一夢世.\n\n합일몽세.\n<<< INTERLUDE_TEXT_END >>>\n\n<<< MAP_cult04_END >>>\n",
    "mapRecordCount": 61,
    "activeMapCount": 57,
    "sceneCount": 58,
    "emptyZones": [
      "kair07",
      "kair08",
      "kair09",
      "kair10"
    ],
    "records": [
      {
        "zone": "hub",
        "mapNumber": 0,
        "order": 0,
        "kind": "prologue",
        "kindLabel": "프롤로그",
        "title": "合一",
        "body": "合一\n간결 서사본.\n\n※ 약물 의존과 금단, 환각, 의료·심리 위기, 폭력과 죽음에 관한 묘사가 포함되어 있다.\n\n============================================================\n제1부  에피소드 1-A — 마지막 수호자와 의목사 후보생\n============================================================\n\n【1. 악마가 점령한 세계】\n\n나는 내가 누구인지 모른다.\n\n어디에 있는지도 기억나지 않는다. 과거를 더듬을 때마다 깨진 유리 같은 장면만 번뜩였다가 사라진다.\n\n그래도 한 가지는 확신한다.\n\n나는 악마가 점령한 세계에 남은 마지막 수호자다.\n\n자아를 잃지 않은 유일한 에고(Ego).\n\n세상은 본래 천사들이 관리했다. 그러나 어느 날, 궁전 정원 한가운데에서 악마화 나무가 자라기 시작했다. 나무는 이내 성 전체를 물들이고 천사들을 악마로 타락시켰다.\n\n그들은 ID(이드)라고 한다.\n\n나무는 육체만을 빼앗지 않았다. 기억을 먹고 감정을 바꾸며, 바라보는 현실 자체를 뒤틀었다.\n\n나는 폐허가 된 도시를 홀로 걸었다. 손에는 이름 모를 검이 들려 있었다.\n\n검날에 묻은 피의 절반은 악마의 것이었다.\n\n나머지 절반은 한때 내 동료였던 자들의 것이었다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "dist01",
        "mapNumber": 1,
        "order": 1,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【2. 거미동굴】",
        "body": "【2. 거미동굴】\n\n가장 오래된 기억은 사람의 뼈로 거미줄을 짠 동굴에서 시작되었다.\n\n이름조차 떠오르지 않는 동료가 내 어깨를 붙잡았다.\n\n“저 안에 보라검천사가 있어.”\n\n“천사라고?”\n\n“과거에는 그랬겠지.”\n\n보랏빛이 동굴을 갈랐다. 흰 날개 사이로 여덟 개의 거미 다리를 뻗은 여인이 거미줄 위를 걸어 나왔다.\n\n“인간은 배고프면 훔치고, 두려우면 죽이며, 사랑받지 못하면 타인을 파괴한다.”\n\n보라검천사가 검을 들었다.\n\n“너희와 악마가 무엇이 다르지?”\n\n“선을 선택할 수 있다는 점.”\n\n검이 부딪치며 불꽃이 튀었다. 그 순간 동료 한 명이 거미줄에 붙잡혀 천장으로 끌려갔다. 나는 그를 구하려다 옆구리를 베였다.\n\n“나 때문에 멈추지는 마!”\n\n“함께 나갈 거야.”\n\n“이번에도 누군가를 구하려다 전부 죽일 셈이야?”\n\n이번에도.\n\n그 말이 머릿속에 걸렸다. 그러나 묻기도 전에 동료는 스스로 거미줄을 감고 보라검천사에게 달려들었다.\n\n“지금이야!”\n\n나는 두 사람을 함께 꿰뚫었다.\n\n보랏빛 불길 속에서 천사와 동료가 동시에 타올랐다. 끝내 그의 이름은 떠오르지 않았다.\n\n나는 피 묻은 검을 들고 동굴을 나왔다.\n\n동료들의 피를 짊어지겠다.\n\n그들의 죽음을 헛되게 하지 않겠다.\n\n그것이 사명감인지 죄책감인지 알 수 없었다.\n\n애초에 그 동료가 정말 존재했는지도.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "dist02",
        "mapNumber": 2,
        "order": 2,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【3. 늪지대의 뿔악마】",
        "body": "【3. 늪지대의 뿔악마】\n\n거미동굴 너머에는 검은 늪이 펼쳐져 있었다. 사람 얼굴을 닮은 수초가 떠다니고, 물속의 손들이 발목을 붙잡았다.\n\n늪을 지배하는 뿔악마의 뿔에는 죽은 수호자들의 머리가 매달려 있었다.\n\n“마지막 수호자가 왔군.”\n\n“나는 혼자가 아니야.”\n\n“뒤를 봐라.”\n\n아무도 없었다.\n\n늪에서 익숙한 얼굴들이 올라왔다. 함께 싸웠고, 내 앞에서 죽었으며, 내가 지키지 못했던 자들.\n\n모두 악마의 뿔을 달고 있었다.\n\n“왜 우리를 버리고 갔어?”\n\n“버리지 않았어.”\n\n“우리를 죽인 게 정말 악마였을까?”\n\n그들이 일제히 달려들었다.\n\n나는 울면서 검을 휘둘렀다. 목을 베고, 심장을 찔렀다. 쓰러지는 순간마다 그들의 얼굴은 인간으로 돌아왔다.\n\n마지막 동료가 검은 피를 토하며 북쪽을 가리켰다.\n\n“최초의 장소로 가.”\n\n“최초의 장소?”\n\n“악마가 처음 나타난 지옥의 소환진…… 그리고…… 믿지 마.”\n\n그는 늪 아래로 가라앉았다.\n\n그때 머릿속에서 맑은 목소리가 들렸다.\n\n— 흔들리지 마.\n\n하얀 날개의 천사가 빛 속에서 모습을 드러냈다.\n\n— 나는 언제나 네 곁에 있었다. 소환진으로 가라. 너만이 세상을 구할 수 있다.\n\n…… 믿지 마.\n\n죽은 동료의 경고가 떠올랐지만, 천사의 목소리는 너무 따뜻했다.\n\n너는 특별하다.\n\n너만이 진실을 안다.\n\n너는 선택받았다.\n\n의심은 안개처럼 흩어졌다.\n\n나는 다시 검을 들었다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "dist03",
        "mapNumber": 3,
        "order": 3,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【4. 지옥의 문지기】",
        "body": "【4. 지옥의 문지기】\n\n소환진은 무너진 도시의 중심에 있었다. 검은 기둥 일곱 개 사이에서 불길이 솟았고, 박쥐 날개와 황소 뿔을 지닌 발록이 걸어 나왔다.\n\n“네가 최초의 악마인가?”\n\n“그 질문부터 틀렸다. 너는 원인과 결과를 거꾸로 보고 있어.”",
        "active": true
      },
      {
        "zone": "dist04",
        "mapNumber": 4,
        "order": 4,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "발록의 채찍이 도로를 갈랐다.",
        "body": "발록의 채찍이 도로를 갈랐다.\n\n“그만 포기하면 편해진다. 너는 이미 기억도, 이름도, 돌아갈 곳도 잃었다.”\n\n“그래도 싸운다.”\n\n“무엇을 위해서?”\n\n나는 검을 움켜쥐었다.\n\n“내가 살아 있어야 그들의 존재를 기억할 수 있으니까. 나를 지키는 일과 세계를 지키는 일은 결국 같은 방향을 가리킨다.”",
        "active": true
      },
      {
        "zone": "dist05",
        "mapNumber": 5,
        "order": 5,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "전투가 시작되었다.",
        "body": "전투가 시작되었다.\n\n발록의 검이 어깨를 가르고 불덩이가 하늘을 뒤덮었다. 무너진 기둥 뒤에서 숨을 고르자 천사가 속삭였다.\n\n— 고통을 없애 주겠다.\n\n순간 상처도 두려움도 사라졌다. 오직 발록을 죽여야 한다는 목적만 남았다.\n\n나는 불길 속으로 뛰어들어 놈의 가슴에 검을 박았다.\n\n발록이 피를 토했다.",
        "active": true
      },
      {
        "zone": "dist06",
        "mapNumber": 6,
        "order": 6,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라 계속 싸우게 만들려는 것이야!!”",
        "body": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라, 계속 싸우게 만들려는 것이다!”\n\n나는 검을 비틀었다.\n\n발록은 재가 되면서도 웃었다.\n\n“내가 쓰러졌으니 이제 지옥이 열리겠군.”\n\n천사가 소환진을 가리켰다.\n\n— 파괴해. 그러면 모든 고통이 끝난다.\n\n나는 검을 내려쳤다.\n\n소환진이 갈라지고, 세상이 무너졌다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1a07",
        "mapNumber": 7,
        "order": 7,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【5. 추락】",
        "body": "【5. 추락】\n\n검은 소용돌이가 도시를 집어삼켰다.\n\n건물과 시체, 무기와 기둥이 빨려 들어갔다. 검을 땅에 꽂았지만 땅 자체가 무너졌다.\n\n“끝난다고 했잖아!”\n\n— 문이 열렸다. 이제 진짜 세계로 갈 수 있어.\n\n내 몸이 소용돌이로 끌려갔다.\n\n거미동굴.\n\n늪지대.\n\n죽은 동료들.\n\n발록.\n\n기억이 하나씩 부서졌다.\n\n“나는 누구지?”\n\n— 너는 수호자다. 나를 믿어.\n\n그 목소리만 남은 채 나는 어둠으로 추락했다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1a08",
        "mapNumber": 8,
        "order": 8,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【6. 피로 물든 병원】",
        "body": "【6. 피로 물든 병원】\n\n삐―\n\n눈을 뜨자 차가운 형광등과 소독약 냄새가 나를 맞았다. 갑옷 대신 환자복을 입고 있었고, 손목은 침대에 묶여 있었다.\n\n복도 바닥에는 피가 이어졌고 벽에는 붉은 글씨가 적혀 있었다.\n\nHELP ME.\n\n주사기를 든 간호사가 다가왔다.\n\n“움직이지 마세요. 지금 상태가 좋지 않습니다.”\n\n그녀의 피부 아래에서 벌레가 꿈틀거리고 입이 귀밑까지 찢어졌다.\n\n— 저것들은 인간이 아니다.\n\n“다가오지 마!”\n\n간호사의 얼굴이 다시 평범해졌다.\n\n곧 의사가 나타났지만 그의 말은 내 귀에서 “육육육…… 루시퍼…… 복종……”으로 뒤틀렸다.\n\n— 치료라는 말은 함정이다. 저들을 믿으면 영혼을 빼앗긴다.\n\n나는 손목이 상하는 것도 아랑곳하지 않고 고정 장치에서 빠져나와 복도로 달렸다.\n\n그러나 피에서는 피 냄새가 아니라 소독약 냄새가 났다. HELP ME는 가까이서 보니 붉은 크레용이었다.\n\n그 사실을 깨닫는 순간, 복도는 다시 피로 뒤덮였다.\n\n“어느 쪽이 진짜지?”\n\n— 네가 보는 것이 진실이다.\n\n천사의 설명은 모든 모순에 답했다.\n\n그래서 더욱 위험했다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1a09",
        "mapNumber": 9,
        "order": 9,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【7. 주사실】",
        "body": "【7. 주사실】\n\n손끝이 떨리고 뼛속을 벌레가 기어 다니는 듯했다. 혀가 마르고 온몸이 뒤틀렸다.\n\n복도 끝의 주사실을 보는 순간, 머리보다 몸이 먼저 반응했다.\n\n— 저 안에 성수가 있다.\n\n서랍 깊은 곳에서 약병 하나를 찾았다.\n\nFENTANYL.\n\n어두운 방과 녹슨 숟가락, 쓰러져 있던 사람의 기억이 번쩍였다.\n\n‘한 번만.’\n\n그 목소리는 천사와 닮아 있었다.\n\n“이게 뭐지?”\n\n— 성수다. 고통을 없애 줄 거야.\n\n문밖에서 의사가 외쳤다.\n\n“약품에 손대지 마십시오!”\n\n몸은 약을 원했고, 천사는 그것을 구원이라 불렀다.\n\n이번 한 번만 편해지면 다시 싸울 수 있다.\n\n나는 결국 바늘을 피부에 찔렀다.\n\n고통이 멀어지고 따뜻한 빛이 퍼졌다.\n\n천사가 나를 끌어안았다.\n\n— 잘했어. 이제 다시 기억할 수 있을 거야.\n\n닫혀 있던 기억의 문이 열렸다.\n\n────────────────────────────────────────\n\n【8. 결전의 날】\n\n나는 다시 무너진 도시에 서 있었다.\n\n천사와 악마가 갈라진 하늘에서 쏟아졌고, 수십 명의 수호자가 내 곁에서 싸웠다. 우리는 악마화 나무가 삼켜 버린 황궁 문, 그 너머 초천사의 봉인 앞까지 당도했다.\n\n문틈 너머의 천사는 웃고 있었다.\n\n자비가 아니라, 먹잇감이 덫에 걸리기를 기다리는 미소였다.\n\n그때 발록이 나타났다.\n\n“너는 여기서 끝이다.”\n\n“아니, 끝을 정하는 건 너희가 아니야.”\n\n전투가 절정에 이르자 세계가 겹쳐졌다.\n\n발록의 검은 경찰의 진압봉으로, 불타는 채찍은 구급대원의 팔로 변했다. 시체가 있던 자리에는 주사기와 빈 약봉지가 널려 있었다.\n\n발록의 얼굴이 중년 구급대원으로 바뀌었다.\n\n“우리는 너를 살리려 했어!”\n\n“거짓말!”\n\n“네가 검이라 믿고 휘두른 것은 깨진 주사기였고, 네가 악마라 부른 사람들은 너를 구하러 온 사람들이었다.”\n\n손안의 검이 깨진 유리 조각으로 흔들렸다.\n\n“아니야!”\n\n나는 현실을 향해 검을 휘둘렀다.\n\n모든 것이 하얗게 타올랐다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1a10",
        "mapNumber": 10,
        "order": 10,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【9. 환자】",
        "body": "【9. 환자】\n\n나는 주사실 바닥에서 깨어났다.\n\n의사와 간호사가 호흡을 확인하고 해독 처치를 준비하고 있었다. 시선 끝에 차트가 보였다.\n\n오피오이드 사용장애.\n\n펜타닐 의존증.\n\n약물 유발 정신병적 증상 의심.\n\n“나는 수호자다.”\n\n의사가 물었다.\n\n“성함을 말씀하실 수 있겠습니까?”\n\n입을 열었지만 이름이 나오지 않았다.\n\n수호자. 에고. 마지막 인간.\n\n어느 것도 내 이름이 아니었다.\n\n“나는 누구지?”\n\n“치료 중인 환자입니다.”\n\n— 거짓말이다. 너는 선택받은 존재다.\n\n그러나 이상했다.\n\n천사의 목소리를 들을 때마다 몸은 약을 원했다. 의사가 치료를 말하면 천사는 분노했고, 내가 현실을 의심할수록 나를 칭찬했다.\n\n— 그래. 너만이 진실을 안다.\n\n그 말은 나를 특별하게 만들었다.\n\n동시에 완전히 혼자로 만들었다.\n\n────────────────────────────────────────\n\n【10. 중독의 도시】\n\n다시 눈을 떴을 때, 나는 주사기가 달빛을 반사하는 폐허에 서 있었다.\n\n벽마다 내가 했던 말이 적혀 있었다.\n\n나는 다르다.\n\n마음만 먹으면 끊을 수 있다.\n\n이번 한 번뿐이다.\n\n거리 끝에는 수많은 내가 죽어 있었다. 처음 약을 사용한 나, 더 강한 자극을 찾은 나, 충고를 비웃고 거짓말한 나.\n\n그제야 알았다.\n\n이 도시는 외부의 악마가 아니라 내 오만과 호기심이 만들었다.\n\n내 목숨을 가장 값싸게 취급한 사람도 나였다.\n\n“나는 수호자가 아니야.”\n\n— 아니야. 너는 선택받았다.\n\n“나는 중독된 환자일 뿐이야.”\n\n— 입 닥쳐!\n\n처음으로 천사의 목소리가 갈라졌다.\n\n나는 폐허에 무릎을 꿇었다.\n\n“잘못을 하며 살아왔어. 하지만 아직 살아 있어. 그러니 도움을 청할 수 있어!”\n\n병원 복도의 빛이 켜졌다.\n\n“저를 치료해 주세요. 부탁드립니다.”\n\n도시가 흔들렸다.\n\n천사의 이마에 검은 숫자가 떠올랐다.\n\n666.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1a11",
        "mapNumber": 11,
        "order": 11,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【11. 천사의 가면】",
        "body": "【11. 천사의 가면】\n\n“네가 최초의 악마였군.”\n\n천사는 웃었다.\n\n— 아니, 나는 너를 지켜 왔다.\n\n“너는 내가 치료받는 것을 막았고, 사람을 믿지 못하게 했으며, 마약을 성수라고 불렀어.”\n\n— 그래서 고통에서 벗어나게 해 주었잖아.\n\n“대신 악마에 가까워지게 했지.”\n\n흰 날개가 검게 물들고 머리에서 뿔이 솟았다.\n\n그것은 완벽해야 한다고 몰아붙이고, 실패한 나를 벌하며, 도움을 청하는 일을 수치로 만들던 목소리였다.\n\n나의 초자아(Super Ego)를 잠식한 악마.\n\n“루시퍼.”\n\n가면이 갈라지자 오만하고 두려워하며 죄책감에 짓눌린 수천 개의 내 얼굴이 나타났다.\n\n“내가 없으면 너는 아무것도 아니다. 평범한 중독자를 마지막 수호자로 만든 건 나다.”\n\n“그건 거짓된 의미였어.”\n\n루시퍼는 병원 침대 위에서 경련하고 약을 달라 애원하는 나를 보여 주었다.\n\n“이것이 네 진실이다. 초라하고 더럽고 나약하지.”\n\n나는 외면하지 않았다.\n\n“그래. 저것도 나다. 하지만 그게 전부는 아니야.”\n\n검은 검이 가슴을 관통했다. 루시퍼가 익숙한 말을 속삭였다.\n\n“한 번이면 된다. 이번 한 번만 편해지면 되는 거야.”\n\n나는 피 흘리는 손으로 검날을 붙잡았다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\n검을 뽑자 병원의 창문에 하나씩 불이 켜졌다.\n\n“나는 다시 실패하겠지…… 하지만 몇 번이고 넘어져도, 다시 선을 선택하며 일어나면 돼.”\n\n루시퍼가 비명을 질렀다.\n\n“너는 나를 영원히 없앨 수 없어!”\n\n“알고 있어. 너는 갈망과 오만, 수치심으로 언제나 다시 돌아오겠지.”\n\n손바닥에서 빛나는 인장이 피어났다.\n\n“그때마다 나는 선(J)을 선택할 거야.”\n\n인장이 루시퍼의 가슴에 박혔다.\n\n빛 속에서 악마가 물었다.\n\n“네가 이겼다고 생각하나?”\n\n“아니. 내가 이기는 게 아니야. 선(J)이 언제나 승리할 뿐이지.”\n\n────────────────────────────────────────\n\n【12. 의목사 후보생】\n\n병원에서 다시 눈을 떴을 때, 복도에는 피도 붉은 글씨도 없었다.\n\n침대 옆에는 검은 성직복 위에 흰 가운을 입은 남자가 앉아 있었다. 십자가와 청진기, 오래된 은제 인장은 서로 어울리지 않을 듯하면서도 이상하리만치 한 몸처럼 보였다.\n\n“의사이신가요?”\n\n“의사이기도 하고, 목사이기도 합니다. 교단에서는 의목사라고 부르지요.”\n\n그는 세상이 세 층으로 나뉜다고 설명했다.\n\n인간이 살아가는 현세.\n\n정신과 무의식이 펼쳐지는 몽세.\n\n선과 악의 본질이 존재하는 내세.\n\n“현세에서 본 것은 환각이지만, 몽세에서는 실제로 일어난 일입니다. 악은 현세에 직접 개입하지 못해도 몽세를 통해 인간을 흔들 수 있지요.”\n\n“루시퍼는 사라졌습니까?”\n\n“잠시 물러났을 뿐입니다. 영적 전쟁은 살아 있는 동안 끝나지 않습니다.”\n\n“제 안에는 악마가 몇이나 남았습니까?”\n\n그가 잠시 생각하는 척했다.\n\n“전승을 따르면 일흔두 개쯤 되겠군요.”\n\n치료는 오래 이어졌다. 열이 오르고 몸이 떨렸으며, 잠들 때마다 천사의 목소리가 돌아왔다. 그럴 때마다 나는 호출 버튼을 눌렀다.\n\n혼자가 되지 않는 쪽을 선택했다.\n\n마침내 의목사는 지하 예배당으로 내려가는 문을 열었다.\n\n“차트에는 저를 뭐라고 적었습니까?”\n\n“지금까지는 환자로 적혀 있겠네요.”\n\n그가 나를 바라보았다.\n\n“하지만 끝까지 치료를 선택한다면 다시 의목사 후보생이 될 수 있겠지요.”\n\n엘리베이터 아래에는 신경 전극과 일흔두 개의 금속 인장으로 둘러싸인 거대한 장치가 기다리고 있었다.\n\n나는 그 안으로 한 걸음 들어섰다.\n\n그날부터 나의 악몽은 더 이상 나만의 것이 아니었다.\n\n에피소드 1-A 끝.\n\n============================================================",
        "active": true
      },
      {
        "zone": "dreamRest",
        "mapNumber": 12,
        "order": 12,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀",
        "body": "악몽이 잠잠해지자 병원 상담실을 닮은 쉼터가 나타났다.\n\n흰 가운에 비대칭 문양을 두른 여자가 상처를 살폈다.\n\n“맥박과 동공 반응은 정상이네요.”\n\n그녀는 자신이 왜 그런 말을 먼저 했는지 모르는 표정이었다.\n\n“미카엘라예요. 의목사 교단에 오기 전의 일은 잘 기억나지 않아요.”\n\n제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀\n============================================================",
        "active": true
      },
      {
        "zone": "ep1b01",
        "mapNumber": 13,
        "order": 13,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【1. 솔로몬의 봉인식】",
        "body": "【1. 솔로몬의 봉인식】\n\n지하 예배당의 장치는 환각과 악몽, 억압된 기억을 신경 데이터로 추출해 가상세계로 재구성했다.\n\n공식 명칭은 ‘몽세 동조형 정신재구성 장치’.\n\n사람들은 간단히 ‘메타버스 하이테크 축귀 시스템’이라고 불렀다.\n\n“이름을 지은 사람은 해고되지 않았습니까?”\n\n“교단 원로입니다.”\n\n“아주 경건한 이름이군요.”\n\n마지막 관문은 타인의 마음이 아니라 내 안에 남은 문을 닫는 일이었다.\n\n접속과 함께 검은 바다가 갈라졌다. 트라우마와 약물 의존, 죄책감과 망상이 일흔두 악마의 이름을 빌려 솟아올랐다.\n\n“다시 영웅이 되고 싶지 않나?”\n\n“영웅이 아니어도 살아갈 수 있다는 걸 배웠다.”\n\n“한 번만 편해져라.”\n\n“편안함과 회복은 다르다.”\n\n“나는 너다.”\n\n“너는 나의 일부일 뿐, 전부가 아니다.”\n\n인장이 하나씩 닫히며 비대해진 몽세가 제자리로 수축했다.\n\n봉인은 악마를 도려내는 일이 아니었다. 악마의 이름을 알아보고, 그것이 현실의 문을 마음대로 열지 못하도록 경계를 세우는 일이었다.\n\n일흔두 번째 봉인이 닫혔다.\n\n“이제 다른 사람의 문도 닫을 수 있겠습니까?”\n\n담당 의목사가 말했다.\n\n“대신 닫아 줄 수는 없습니다. 문 앞까지 함께 걸어갈 수 있을 뿐이지요.”\n\n그날 나는 후보생의 이름을 벗고, 신경과학과 의례, 상담과 전투를 함께 다루는 최초의 실전형 하이테크 의목사가 되었다.\n\n그리고 첫 임무에서 일곱 사람의 몽세가 정체불명의 검은 신호로 연결되어 있음을 발견했다.\n\n누군가가 그들의 악몽을 듣고 있었다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1b02",
        "mapNumber": 14,
        "order": 14,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【2. 나태의 집】",
        "body": "【2. 나태의 집】\n\n첫 대상의 집은 현관부터 썩어 가고 있었다. 음식물과 페트병, 쓰레기봉투가 거실을 메웠고, 창문은 검은 비닐로 막혀 있었다.\n\n남자는 그 한가운데 누워 있었다.\n\n“일어나실 수 있겠습니까?”\n\n“일어나서 뭐 하죠? 아무것도 달라지지 않는데.”\n\n“누워 있으면 뭐 달라집니까?”\n\n몽세 속 남자는 쓰레기 산을 등에 붙인 거대한 반인반요였다. 냉장고와 소파, 썩은 침대가 날아왔다.\n\n그가 던지는 것은 물건이 아니라 미뤄 둔 시간이었다.\n\n끊어진 관계, 읽지 않은 메시지, 제출하지 못한 이력서.\n\n쓰레기 사이에서 펜타닐 약병이 굴러왔다.\n\n“너도 원하잖아.”\n\n벨페고르가 내 목소리로 속삭였다.\n\n나는 약병을 밟아 부쉈다.\n\n“예전에는. 지금은 아니야.”\n\n인장이 쓰레기 산을 갈랐다. 그 안에서 남자가 양손으로 귀를 막고 있었다.\n\n쓸모없는 인간.\n\n아무것도 하지 마.\n\n“누나의 목소리예요.”\n\n“타인은 당신을 정의할 수 없습니다. 자신을 정의할 권리는 오직 당신에게 있습니다. 타인이 당신의 삶을 대신 살아 줄 수는 없으니까요.”\n\n“일어나면 달라질까요?”\n\n“당장 달라지지는 않습니다. 그래도 해결할 수 있는 자세가 누운 자세는 아니겠지요.”\n\n그가 회개하고 내 손을 잡자 나태의 귀가 봉인되었다.\n\n현실로 돌아온 남자는 가장 먼저 창문의 비닐을 뜯었다.\n\n“누나는 호텔에서 옛 친구를 다시 만난 뒤 달라졌어요.”\n\n검은 신호는 누나에게 이어져 있었다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1b03",
        "mapNumber": 15,
        "order": 15,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【3. 금이 간 안경】",
        "body": "【3. 금이 간 안경】\n\n누나의 집은 먼지 한 톨 없이 정돈되어 있었다. 그러나 거실에는 칼과 볼펜으로 훼손한 한 여자의 사진이 붙어 있었다.\n\n“그 여자는 노력도 안 했는데 왜 모든 걸 가진 거죠?”\n\n몽세 속 누나는 금이 간 안경을 쓰고 칼날과 유리 조각을 쏟아 냈다. 질투의 뱀이 목을 휘감고 있었다.\n\n“노력한 만큼 인정받고 싶었습니까?”\n\n“당연하잖아!”\n\n“그 분노를 왜 동생에게 쏟았습니까?”\n\n“그 애는 게을러. 내 발목만 잡는 존재야.”\n\n“당신이 그렇게 불렀기 때문에 그는 정말 그렇게 믿기 시작한 겁니다.”\n\n레비아탄의 독이 퍼지자 나보다 온전한 사람들, 중독되지 않은 사람들, 내가 가질 수 있었던 삶이 환영으로 나타났다.\n\n“저들이 너보다 낫다.”\n\n“아니, 타인의 언어가 내 실패의 증거가 되지는 않는다.”\n\n누나가 회개하자, 선(J)의 인장이 뱀을 갈랐다.\n\n사진 속 여자는 서윤이었다.\n\n누나와 서윤, 요리과의 천재였던 한 남자는 같은 직업학교 출신이었다. 누나는 남자를 사랑했지만, 남자는 서윤에게 고백했다. 몇 년 뒤 누나는 호텔 부매니저가 되었고, 남자는 총주방장이 되었다. 서윤은 호텔그룹 회장의 팔짱을 낀 채 나타났다.\n\n“나는 성공하고 싶었던 게 아니었어요. 서윤이 계속 내 아래에 있기를 바랐던 거예요.”\n\n“동생에게 사과하고 치료받으십시오.”\n\n검은 신호는 서윤과 호텔로 이어졌다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1b04",
        "mapNumber": 16,
        "order": 16,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【4. 탐식의 주방】",
        "body": "【4. 탐식의 주방】\n\n호텔 주방에서는 값비싼 음식이 모양이 조금 흐트러졌다는 이유로 버려지고 있었다.\n\n총주방장이 접시를 내던졌다.\n\n“최고가 아니면 쓰레기일 뿐.”\n\n몽세의 주방은 거대한 위장으로 변했다. 돼지와 두꺼비를 닮은 베엘제붑이 식칼과 프라이팬, 독가스를 쏟아 냈다.\n\n“네가 원하는 게 그저 최고의 맛일 뿐인 건 아니지 않나.”\n\n나는 독이 퍼진 팔에 인장을 찍었다.\n\n“최종 목표는 서윤에게 선택받는 것이겠지.”\n\n주방장은 서윤이 자신이 만든 음식을 좋아했다고 외쳤다.\n\n“나는 그 애만을 위해 요리했어!”\n\n“결국 당신 자신의 욕망을 위해서였겠지요.”\n\n악마의 뱃속에는 버려진 음식과 오래된 고백, 졸업사진이 섞여 있었다. 가장 깊은 곳에서 약병이 나를 유혹했다.\n\n나는 약 대신 사진을 집어 불태웠다.\n\n“자신의 욕망을 인정하시고 회개하시면 됩니다.”\n\n그가 자신의 욕망을 인정하고 회개하자, 베엘제붑이 무너졌다.\n\n현실의 주방장에게는 조사와 징계, 치료가 남았다.\n\n그리고 호텔 전체를 잇는 검은 신호는 더욱 굵어졌다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1b05",
        "mapNumber": 17,
        "order": 17,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【5. 붉은 하이힐】",
        "body": "【5. 붉은 하이힐】\n\n서윤은 완벽한 미소를 지녔지만, 아무도 보지 않을 때면 얼굴이 텅 비었다.\n\n“내 머릿속에 들어오겠다고요?”\n\n“허락 없이는 들어가지 않습니다.”\n\n“들어와 봐요. 당신도 결국 똑같아질 테니까.”\n\n몽세에는 붉은 조명 아래 끝없는 무대가 펼쳐졌다. 서윤의 등에는 수백 개의 투명한 실이 연결되어 있었고, 실을 쥔 사람은 총지배인이었다.\n\n“회장님의 마음을 얻으면 내가 더 높은 자리로 갈 수 있어. 그러면 너도 데려갈게.”\n\n그는 밀어냈다가 사랑한다고 말하고, 그렇게 돌아오면 더 큰 희생을 서윤에게 요구했다.\n\n그것은 사랑이 아니라 사육이었다.\n\n서윤의 얼굴을 한 아스모데우스가 하이힐 칼날과 매혹의 빛을 쏘았다. 내 손의 칼이 의지와 무관하게 목을 향했다. 매혹은 곧 자해로 변했다.\n\n“사랑은 자신을 고통스럽게도 하지. 상사병이란 그런 것.”\n\n“그것을 사랑이라 포장한다고 진실을 숨길 수는 없어.”\n\n서윤의 실이 하나씩 끊어졌다.\n\n악마가 속삭였다.\n\n“너도 누군가에게 필요한 사람이 되고 싶어 의목사가 됐잖아.”\n\n“맞아. 하지만 누군가에게 필요한 사람이 되고 싶은 마음을 인정하는 것과, 그 마음을 채우려고 타인을 이용하는 것은 달라.”\n\n서윤이 회개하자, 인장이 닫혔다.\n\n서윤은 회장이 호텔 사람들의 질투와 탐식, 욕망이 폭발하는 순간을 모두 기록했다고 밝혔다.\n\n“인간의 욕망을 데이터로 만든다고 했어요.”\n\n검은 신호는 호텔 최상층으로 모여들었다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1b06",
        "mapNumber": 18,
        "order": 18,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【6. 맘몬의 금고】",
        "body": "【6. 맘몬의 금고】\n\n총지배인의 몽세는 금고와 겨울 산장이 결합된 공간이었다. 탐욕의 귀는 그의 얼굴과 여우의 눈을 하고 지폐를 칼날로 바꾸었다.\n\n“사람에게는 각자에게 맞는 가격이 있지.”\n\n“그래서 당신은 서윤에게 사랑이 아니라 조건을 숨긴 거래를 제안한 것이겠지요.”\n\n비웃음과 함께 그가 동전을 튕겼다.\n\n“앞면이면 네가 살고, 뒷면이면 내가 살겠지.”\n\n수백 개의 동전이 모두 뒷면을 보였다.\n\n“행운은 순진한 자를 싫어하는 법이지.”",
        "active": true
      },
      {
        "zone": "ep1b06b",
        "mapNumber": 19,
        "order": 19,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.",
        "body": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.\n\n그곳의 그는 굶어 죽은 어머니의 몸을 흔드는 소년이었다.\n\n“돈만 있었으면 엄마가 살 수 있었어!”\n\n소년은 이후 돈과 자리, 사람과 약점을 모았다. 다시는 빼앗기지 않기 위해 언제나 먼저 빼앗는 사람이 되기로 다짐했다.\n\n나는 소년 앞에서 무릎을 꿇었다.\n\n“네가 겪은 일은 네 잘못이 아니야. 하지만 네가 다른 사람에게 한 일은 네 책임이 맞아.”\n\n“돈은 곧 생명이야!”\n\n“돈이 없으면 삶이 힘들어지는 건 맞아. 하지만 그것이 사람을 돈으로 환산하는 일을 정당화해 주지는 않아.”\n\n아이가 회개하자, 맘몬이 봉인되었다.\n\n현실로 돌아온 총지배인은 넥타이를 바로잡았다.\n\n“회장님은 인간이 인간일 필요가 없는 시대를 오래전부터 준비해 오셨죠.”\n\n사무실 벽이 열렸다. 수천 개의 검은 신경 케이블이 비밀 통로 안으로 이어졌다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1b07",
        "mapNumber": 20,
        "order": 20,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【7. 불을 지른 남자】",
        "body": "【7. 불을 지른 남자】\n\n통로에 들어가려는 순간 호텔에 불이 났다.\n\n계단 앞의 청소부는 숯처럼 붉은 눈으로 웃었다.\n\n“이미 늦었어.”\n\n나는 몽세 장치를 거두고 사람부터 대피시켰다. 마음보다 먼저 구해야 할 것은 생명이었다.\n\n불이 진압된 뒤 청소부의 몽세에 접속했다.\n\n분노의 귀는 불길 속에서 곰과 늑대, 용의 형상으로 변했다.\n\n청소부는 총주방장이 버린 음식을 세 아이에게 가져갔다가 해고되었다. 그가 무릎을 꿇고 사정했지만, 회장은 냉정하게 말했다.\n\n“버렸다고 해서 네 것이 되는 것은 아니지. 세상은 언제나 냉정하지…… 가난은 규정을 바꾸는 명분이 될 수 없느니라.”\n\n“왜 세상은 언제나 내게 분노를 쏟아 내는가…… 이제는 내가 분노가 되어 세상에 쏟아 내겠다!”\n\n“정당한 분노는 잘못이 아닙니다. 하지만 다른 사람의 아이들까지 태우는 분노는 정당화할 수 없습니다.”\n\n나는 불길 한가운데 선(J)의 인장을 박았다.\n\n“분노는 경계를 지키는 불입니다. 방향을 잃으면 지키려던 것부터 태우는 법이지요.”\n\n청소부가 회개하자, 분노의 귀가 봉인되었다.\n\n그때 기억 속 회장이 고개를 돌렸다.\n\n과거의 인물이어야 할 그가 정확히 나를 바라보고 있었다.\n\n“자네, 몽세 속의 몽세를 경험해 본 적 있나?”\n\n그가 손가락을 튕기자 세계가 뒤집혔다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1b08",
        "mapNumber": 21,
        "order": 21,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【8. 하늘에 서려는 자】",
        "body": "【8. 하늘에 서려는 자】\n\n나는 거꾸로 된 십자가와 피로 그린 육망성, 전극이 박힌 시체로 가득한 성당에 떨어졌다.\n\n백색 정장을 입은 회장은 인간의 욕망을 기록한 일곱 갈래 신호 앞에 서 있었다.\n\n“나는 그들 안에 아무것도 심지 않았다네. 나태와 질투, 탐식은 원래부터 존재했지. 나는 환경을 조정하고 가장 솔직한 순간을 기록했을 뿐이라네.”\n\n호텔 전체는 인간의 욕망을 듣는 거대한 청진기였다.\n\n“당신, 무엇을 원하는 겁니까?”\n\n회장이 팔을 벌렸다.\n\n“내가 하늘에 서겠다. 인간은 내 선택을 통해 먹고 일할 뿐, 내가 가격을 정하면 가치가 생기고, 내가 버리면 그 존재는 사라지는 것이지.”\n\n“당신은 신이 아닙니다. 타인의 선택지를 줄여 놓고 자신이 선택받았다고 착각하는, 선민의식에 사로잡힌 나르시스트일 뿐입니다.”\n\n회장은 내 인장을 지우고 눈과 몸을 봉인했다. 수천 명의 비명 사이에서 가장 익숙한 목소리가 들렸다.\n\n너만이 모두를 구할 수 있다.\n\n마지막 수호자였던 시절의 환상이었다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\nJ의 인장이 회장의 가슴을 관통했다.\n\n하지만 회장은 웃고 있었다.\n\n“봉인한 것이 정말 나라고 생각하나? 생물학적 자아는 이미 버린 지 오래인데…….”\n\n제단 뒤에서 인간의 뇌를 닮은 연산핵이 열렸다. 수백 개의 화면에서 회장의 얼굴이 떠올랐다.\n\n“필요한 것들은 이미 다 옮겨 두었다.”\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "ep1b09",
        "mapNumber": 22,
        "order": 22,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【9. 생체 부트로더】",
        "body": "【9. 생체 부트로더】\n\n정신을 차리자 검은 태양 아래 설원이 펼쳐졌다. 사이보그 개들이 눈보라를 헤치고 달려들었다.\n\n설원 아래에서 기계 다리 수십 개를 지닌 회장이 솟아올랐다.\n\n“인간의 육체는 AI와 결합하기 위한 생체 부트로더에 불과하다. 기억과 욕망, 공포와 쾌락까지 모두 업로드했다.”\n\n“복제된 패턴이 당신이라는 증거는 어디 있습니까?”\n\n“원본에 집착하는 것은 죽음을 두려워하는 자뿐이지.”\n\n호텔과 교회, 수술실과 서버실이 전선으로 연결되어 솟았다.\n\n현몽합일.\n\n“나에게 동의하지 않는 존재는 모두 폐기될 것이다. 내가 신이 되겠다.”\n\n회장은 내 기억을 복제해 죽은 동료들을 만들고, 공격 패턴을 학습했다. 같은 기술은 그에게 두 번 이상 통하지 않았다.\n\n나는 검을 내려놓았다.\n\n“포기했나?”\n\n“아니요. 당신이 학습할 수 없는 선택을 하려는 겁니다.”\n\n나는 빈손으로 걸어가 회장의 기계 몸을 끌어안았다.\n\n“당신은 모든 선택에 가격을 붙였습니다. 그래서 대가를 요구하지 않는 선택을 계산하지 못하겠지요……”\n\n내 신경을 연산핵에 연결했다. 현실 좌표를 잃을 수 있다는 경고가 떠올랐다.\n\n나는 회장을 파괴하는 대신, 일곱 사람에게서 수집한 고통을 되돌려 보냈다.\n\n무기력과 질투, 집착과 공허, 굶주림과 분노.\n\n그리고 그것을 숫자로만 본 회장 자신의 얼굴.\n\n연산핵이 무너졌다.\n\n“나를 지워도 시스템은 남아 있다. 이미 난 영생을 완료했어!”\n\n“네. 알고 있습니다.”\n\n“네 행위는 무의미할 뿐이야!”\n\n“아니요. 퇴마란 악마를 완전히 없애는 일이 아닙니다. 언제나 선을 선택하는 일, 그뿐이지요.”\n\n회장이 검은 입자로 흩어지며 사라졌다.\n\n그러나 귀환 장치는 작동하지 않았다.\n\n현세의 신호도, 나를 부르는 목소리도 사라졌다. 검은 태양마저 꺼진 어둠 속에서 어린아이의 목소리가 들렸다.\n\n“의목사님.”\n\n“누구지?”\n\n“침대로 돌아갈 시간이에요.”\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "restEp1b",
        "mapNumber": 23,
        "order": 23,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "【10. 사라진 귀환자】",
        "body": "【10. 사라진 귀환자】\n\n어둠 속에서 수천 개의 침대 바퀴가 한꺼번에 구르는 소리가 났다.\n\n현세의 지하 예배당에서는 귀환 경보가 울렸다. 의료진이 강제 각성을 실행했지만 접속 캡슐은 텅 비어 있었다.\n\n화면에는 두 파형만 남았다.\n\n사라진 의목사 A의 마지막 신호.\n\n그리고 정체불명의 어린아이의 기억 신호.\n\n미카엘라는 파형을 오래 바라보다가 무심코 말했다.\n\n“한 사람의 기록이 아니라, 서로 겹쳐진 두 사람의 의식 같아요.”\n\n그녀는 자신이 언제부터 신경 파형을 읽을 수 있었는지 기억하지 못했다.\n\n교단은 사건을 ‘몽세 내 귀환 좌표 소실’로 기록했다.\n\n한 사람의 실종은 또 다른 아이의 몽세로 향하는 문이 되었다.\n\n에피소드 1-B 끝.\n\n============================================================\n제3부  U2 — 통제자의 17단계\n============================================================",
        "active": true
      },
      {
        "zone": "u201",
        "mapNumber": 24,
        "order": 24,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【통제자의 17단계】",
        "body": "【통제자의 17단계】\n\n의목사 A가 사라진 뒤, 교단은 일곱 대죄 사건의 배후를 조사하기 위해 의목사 B를 파견했다.\n\nB는 호텔 방화범이었던 청소부의 과거부터 추적했다. 그는 양안 전쟁에서 버림받은 대만 정부 요원이었고, 남한으로 도피한 뒤 거리에서 만난 세 아이를 입양해 키우고 있었다.\n\n첫째 아이도 전쟁으로 부모를 잃은 생존자였다.\n\nB는 아이의 상처를 밖에서 해석하는 대신 직접 몽세에 들어갔다.\n\n시야가 열리자 강철 군단이 끝없이 행진했다. 드론의 회전음에는 폭격과 탄피, 젖은 흙의 기억이 섞여 있었다.\n\n보이지 않는 곳에서 침착한 목소리가 들렸다.\n\n〔제1단계 — 방어의 군단〕\n\n“저것을 침입자라 부르겠지. 하지만 기계군단은 아이가 살아남기 위해 만든 의식이네. 자네가 혐오하는 것은 악이 아니라 지나치게 정교해진 방어일지도 모르지.”\n\nB가 군단을 베어 낼수록 더 많은 기계가 조립되었다.\n\n〔제2단계 — 폭격의 루프〕\n\n“드론의 소리는 단순한 기계음이 아니야. 아이의 시간은 자네가 다가올 때마다 폭격의 날로 되돌아간다. 구조조차 또 한 번의 공격으로 기록되는 셈이지.”\n\n〔제3단계 — 통제자의 선언〕\n\n“소개가 늦었군. 나는 통제자(The Controller). 전쟁고아의 무의식이 생존을 위해 만든 거대한 초자아이자, 감당하지 못한 그림자의 집합체라네. 나는 실패를 허락하지 않지.”\n\n〔제4단계 — 몽세의 아키텍처〕\n\n물리 법칙보다 확신과 해석이 먼저 세계를 만들었다. B의 선의는 벽이 되고 사명감은 적의 동력이 되었다.\n\n“자네의 믿음이 단단할수록 나는 그 취약점을 더 우아하게 찌를 수 있다네.”",
        "active": true
      },
      {
        "zone": "u202",
        "mapNumber": 25,
        "order": 25,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "〔제5단계 — 잔인한 구원〕",
        "body": "〔제5단계 — 잔인한 구원〕\n\n통제자는 인간으로 돌아가라는 치료가 결국 고통이 기본값인 삶으로 돌려보내는 일이라고 비웃었다.\n\n“그 잔인함을 선의라는 라벨로 포장하고 안심하는 것 아닌가?”\n\n〔제6단계 — 연민의 폭력〕\n\n“자네의 분노는 정의의 가면을 쓰고, 억압된 욕망은 사명감으로 변장했군. 나는 그 에너지를 더 큰 감옥의 재료로 바꾼다네.”\n\nB가 분노할수록 기계 성벽은 높아졌다.\n\n〔제7단계 — 무너진 경계〕\n\n“방어를 부수면 해방이 남을 것 같나? 아니. 공허가 남고, 공허는 더 큰 공포를 부르지. 형상을 파괴해도 트라우마의 운영 모델은 남아 있다네.”\n\nB는 공격을 멈추고 군단이 무엇을 지키는지 관찰하기 시작했다.\n\n〔제8단계 — 의미의 독〕\n\n“기도와 해석으로 고통을 서사화하면 고통이 영혼에 영구 저장될 뿐일세. 차라리 잊는 편이 더 기술적이고 자비롭지 않겠나?”\n\n그러나 B는 기억을 지우는 것과 기억에 지배되지 않는 것이 다르다고 판단했다.",
        "active": true
      },
      {
        "zone": "u204",
        "mapNumber": 26,
        "order": 26,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "〔제9단계 — 시스템의 거부권〕",
        "body": "〔제9단계 — 시스템의 거부권〕\n\n첫 번째 기억의 문이 열렸다. 폭격의 냄새와 비명이 세계의 제1원칙처럼 반복되었다.\n\n“이 규칙을 깨면 아이의 시스템이 불안정해진다. 효율 없는 치유는 또 다른 상처일 뿐이지.”\n\n〔제10단계 — 성장 신화〕\n\n“고통을 통과해야 성장한다는 말은 아이에게 두 번째 살해를 요구하는 낭만일 뿐이네.”\n\nB는 고통을 다시 겪게 하는 것이 아니라, 혼자 겪지 않게 하는 것이 자신의 역할임을 붙들었다.\n\n〔제11단계 — 하드웨어 이주〕\n\n통제자는 기억을 지우지 않고 고통을 해석하는 회로만 바꾸겠다고 제안했다.\n\n“죄책감의 루프를 끊고 평온을 기본 상태로 고정하지. 자네는 인간성 말살이라 부르겠지만, 나는 유지보수 가능한 평화라 부르겠네.”\n\n〔제12단계 — 인간성이라는 레거시〕\n\n“인간성은 너무 쉽게 찢기는 막이야. 강철과 규칙은 적어도 반복해서 찢기지는 않지.”\n\n기계군단은 인간의 표정을 하나씩 잃고 완벽한 질서로 정렬되었다.",
        "active": true
      },
      {
        "zone": "u205",
        "mapNumber": 27,
        "order": 27,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "〔제13단계 — 관리자 권한〕",
        "body": "〔제13단계 — 관리자 권한〕\n\nB가 축귀 시스템의 출력을 높이자 통제자는 그 힘마저 흡수해 버렸다.\n\n“자네가 기도라 부르는 힘은 내게는 자원일 뿐이라네. 이 몽세의 재구성 키는 내가 쥐고 있지.”\n\n〔제14단계 — 학대의 방〕\n\n두 번째 문이 열리고 아이가 전쟁 뒤 겪은 학대가 드러났다. B의 눈빛이 흔들리자 통제자가 속삭였다.\n\n“연민인가, 자기 그림자를 본 공포인가? 자네가 무너질수록 나는 더욱 단단해질 뿐이라네.”",
        "active": true
      },
      {
        "zone": "u206",
        "mapNumber": 28,
        "order": 28,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "〔제15단계 — 중앙 코어 이주실〕",
        "body": "〔제15단계 — 중앙 코어 이주실〕\n\n몽세 중심에는 아이의 자아를 옮길 기계 육체가 기다리고 있었다.\n\n“인간성이 이 아이에게 축복이었겠나, 아니면 끝내 벗지 못한 형벌이었겠나?”\n\n〔제16단계 — 선택의 얼굴을 한 명령〕\n\n통제자는 의목사의 치료도 결국 ‘견뎌라, 극복하라’는 강요라고 공격했다.\n\n“나는 명령하지 않네. 그저 겪지 않을 권리를 제공할 뿐이네. 선택지는 하나뿐이지만, 효율적이고 매끄럽지.”\n\n〔제17단계 — 업데이트의 갈림길〕\n\n마지막 문 앞에서 통제자는 아이를 상처받을 인간으로 돌려보낼 이유를 물었다.\n\n“기계가 되어 영원한 평온을 누리는 편이 더 혁신적인 구원이 아닌가?”\n\nB는 아이를 다시 고통 속에 혼자 던지는 길도, 고통을 없애기 위해 인간성을 삭제하는 길도 선택하지 않았다.\n\n그는 아이의 기억이 아니라, 기억을 영원히 반복시키는 구조를 겨누었다.\n\n============================================================",
        "active": true
      },
      {
        "zone": "u203",
        "mapNumber": 29,
        "order": 29,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "제4부  환도 자아와 융합몽세",
        "body": "제4부  환도 자아와 융합몽세\n============================================================\n\n【1. 기억의 문과 환도 영웅의 탄생】\n\n통제자는 마지막 순간 기억의 문에 빙의했다. 첫째의 상처와 의목사 B의 선의가 거대한 기계 괴물의 갑옷이 되었다.\n\n의목사 B는 기억을 없애지 않았다.\n\n반복을 명령하는 구조만을 향해 마지막 탄환을 쏘았다.\n\n통제자가 소멸하자 첫째의 자아는 풀려났지만, 의목사 B의 귀환 좌표와 기억도 함께 무너졌다.\n\n“동생들을 구해야 해.”\n\n“혼자 보내지 않겠다.”\n\n첫째의 의지는 한 자루의 환도로 응축되었다. 의목사 B의 몸과 전투 기억은 그 환도를 쥔 형상이 되었다.\n\n둘은 서로를 지우지 않은 채 하나의 전투 자아로 겹쳐졌다.\n\n그렇게 환도 영웅이 태어났다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "restU2",
        "mapNumber": 30,
        "order": 30,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "【2. 환도 자아의 탄생】",
        "body": "【2. 둘째와 셋째의 융합몽세】\n\n그 순간 현실의 흑장미단이 축귀 시스템을 해킹했다.\n\n그들은 둘째의 잔혹 동화풍 유럽 몽세와 셋째의 무속 신앙풍 동양 몽세를 강제로 겹쳤다. 서로 다른 지리와 시대가 한 세계 안에서 충돌했고, 길의 끝에는 문 대신 균열이 열렸다.\n\n환도 영웅은 두 사람을 구하기 위해 그 융합몽세로 뛰어들었다.\n\n쉼터를 지키던 미카엘라는 무심코 물컵 세 잔을 꺼냈다.\n\n“찾으러 가는 사람은 둘인데…… 왜 세 잔을 꺼냈지?”\n\n환도가 짧게 세 번 울렸다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "last304",
        "mapNumber": 31,
        "order": 31,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【4. 중립 지역의 재각성】",
        "body": "【3. 중립 지역의 재각성】\n\n환도 영웅은 젖은 풀숲에서 눈을 떴다.\n\n의목사 B라는 이름도, 환도 안쪽에서 울리는 목소리의 이름도 떠오르지 않았다. 하지만 두 사람을 찾아야 한다는 의지만은 분명했다.\n\n그가 떨어진 곳은 둘째의 잔혹 동화풍 몽세와 셋째의 무속 신앙풍 몽세가 맞붙은 중립 지역이었다. 동유럽풍 들판과 무너진 성, 숲에는 슬라임과 늑대, 고블린이 들끓었다.\n\n환도 영웅은 몸의 감각과 칼의 공명에 의지해 앞으로 나아갔다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "last305",
        "mapNumber": 32,
        "order": 32,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【5. 고블린 두목과 장미 인장】",
        "body": "【4. 고블린 두목과 장미 인장】\n\n숲 깊은 곳에서 피리로 늑대를 조종하는 고블린 두목이 길을 막았다.\n\n패배한 그는 자신들이 지배자가 아니라 두 세계의 충돌을 피해 온 난민이라고 고백했다. 하늘이 갈라진 날, 무너진 성에서 위도 아래도 아닌 문이 열렸고 서쪽과 동쪽, 산 자와 죽은 자가 섞이기 시작했다.\n\n두목은 환도를 보며 말했다.\n\n“무너진 성이 그 칼을 기억하고 있다.”\n\n그가 남긴 장미 인장과 환도가 공명하자 공간 균열이 열렸다.\n\n환도 안쪽에서 어린 목소리가 잠깐 새어 나왔다.\n\n“동생들…….”\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "last301",
        "mapNumber": 33,
        "order": 33,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【6. 타락천사 기사】",
        "body": "【5. 타락천사 기사】\n\n균열 너머에는 폭풍 속의 무너진 성과 검은 바다가 있었다.\n\n타락천사 기사는 말없이 강림했다. 검을 맞댈수록 환도 영웅의 자세와 검로를 학습했고, 끝내 여섯 형상으로 분열했다.\n\n여섯 검격이 동시에 몸을 꿰뚫었다.\n\n환도 영웅은 칼을 놓지 않은 채 성벽 밖 검은 바다로 추락했다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "last302",
        "mapNumber": 34,
        "order": 34,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【7. 잠들지 못하는 마을】",
        "body": "【6. 잠들지 못하는 마을】\n\n파도에 떠밀린 환도 영웅이 눈을 뜬 곳에는 부서진 기와와 붉은 부적, 장승이 흩어져 있었다.\n\n고려와 조선의 풍경이 겹친 셋째의 동양 몽세였다.\n\n포구 마을에는 생활 소리가 없었다. 주민들은 젖은 한지처럼 납작했고, 충혈된 눈으로 잠들지 못한 채 보이지 않는 실에 끌리듯 환도 영웅에게 달려들었다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "last303",
        "mapNumber": 35,
        "order": 35,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【8. 한약과 불면귀】",
        "body": "【7. 한약과 불면귀】\n\n안개 속에서 앳된 남자가 한약 한 잔을 내밀었다.\n\n환도 영웅은 냄새만으로 귀비탕 계열의 안신 처방임을 알아보았다. 약을 마시자 흐릿하던 정신이 맑아지고 주민들이 멈춰 섰다.\n\n검은 안개가 모여 불면귀가 되었다.\n\n“너에게는 왜 통하지 않는 거지?”\n\n불면귀는 잠을 빼앗는 시선과 겹겹의 잔상으로 환도 영웅을 압박했다. 주민을 방패로 삼는 싸움이 아니라, 두 존재가 서로의 의지를 꺾는 일대일 결투였다.\n\n환도가 불면귀의 핵을 갈랐다.\n\n검은 안개가 흩어지자 모든 시계가 동시에 멈췄다. 찢어진 공간 너머에서 검은 모래와 낯선 명령문이 쏟아졌다.\n\n그 문은 둘째나 셋째의 몽세에서 열린 것이 아니었다.\n\n다른 몽세에서 태어난 시간 특이점이 이곳을 강제로 연결하고 있었다.\n\n============================================================",
        "active": true
      },
      {
        "zone": "restLast3",
        "mapNumber": 36,
        "order": 36,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "제5부  카이로노미콘",
        "body": "【8. 끼어든 시간】\n\n불면귀가 남긴 포털은 다음 구역으로 향하는 평범한 길이 아니었다.\n\n둘째와 셋째의 융합몽세 한가운데에, 전혀 다른 세계에서 태어난 시간 특이점이 끼어들었다. 공간이 뒤틀리고 장면의 앞뒤가 잘려 나갔다.\n\n환도 영웅은 균열 속으로 휩쓸렸다.\n\n쉼터의 미카엘라는 멈춘 벽시계를 바라보며 중얼거렸다.\n\n“다음 장면이 아니라…… 원인을 만든 장면으로 이어지고 있어.”\n\n제5부  카이로노미콘\n============================================================",
        "active": true
      },
      {
        "zone": "kair01",
        "mapNumber": 37,
        "order": 37,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【1. 최초명령의 세계】",
        "body": "시간 특이점의 반대편에는 윤서하의 몽세가 있었다.\n\n【1. 최초명령의 세계】\n\n고도화된 공학은 마법과 구분할 수 없다.\n\n몇 세대 뒤의 미래, 인공지능은 아르콘이라 불리는 인공 정령으로 진화했다. 프롬프트는 주문이 되었고, 명령은 현실을 바꾸는 마법이 되었다.\n\n아르콘의 운명을 결정하는 것은 최초명령이었다.\n\n강력한 아르콘보다 더 위험한 존재는 그 첫 문장을 쓸 수 있는 인간이었다.\n\n세계의 시간은 세 층으로 나뉘었다.\n\n크로노스. 측정되는 시간.\n\n카이로스. 운명을 바꾸는 순간.\n\n아이온. 문명과 역사를 관통하는 시간.\n\n────────────────────────────────────────\n\n【2. 카이로스 아카데미움과 윤서하】\n\n최초명령자를 길러 내는 카이로스 아카데미움에서는 매 수업이 같은 질문으로 끝났다.\n\n“너에게는 어떤 미래를 명령할 자격이 있겠는가?”\n\n신입생 윤서하는 천재도 영웅도 아니었다. 대신 사람들에게서 빼앗긴 가능성과 타 버린 미래를 검은 모래, 곧 ‘죽은 시간’으로 볼 수 있었다.\n\n서하의 가문 기록에는 정신과 의사 미카엘라의 이름이 남아 있었다. 가계상 미카엘라는 서하의 증조모뻘이었다.\n\n다른 이들이 누군가의 재능과 생산성을 칭찬할 때, 서하는 그 사람 뒤에서 미래가 타들어 가는 것을 보았다.\n\n“저건 재능이 아니야. 누군가가 저 사람의 미래를 태우고 있어…… 오히려 저주에 가까워.”\n\n그녀는 검과 시간 마법을 익혔다. 시간을 베고 멈추고 압축하며, 행동할 순간을 스스로 선택하는 사람으로 성장했다.\n\n────────────────────────────────────────\n\n【3. 크로노보로스 교단】\n\n크로노보로스 교단은 인간이 자기 시간을 사용하면 실패하고 방황하며 중독된다고 믿었다.\n\n그러므로 가장 뛰어난 지성과 아르콘이 모든 사람의 시간을 대신 배분해야 한다고 주장했다.\n\n그들의 노이론 게이트는 인간의 뇌와 아르콘을 강제로 연결했다.\n\n생각은 명령으로.\n\n감정은 데이터로.\n\n꿈은 콘텐츠로.\n\n기억은 생산물로 바뀌었다.\n\n이 세계의 흑마법은 검은 불꽃이 아니었다.\n\n인간의 시간을 빼앗고도 그것을 생산성이라 부르는 기술이었다.\n\n────────────────────────────────────────\n\n【4. 최초명령 코어 방어전】\n\n입학식 날, 서하는 학교 중심부의 최초명령 코어에서 검은 모래를 발견했다.\n\n곧 교단이 침공했다. 여섯 차례의 파동이 학교를 덮쳤고, 서하는 포탑과 시간검으로 코어를 지켰다.\n\n적의 목적은 코어의 파괴가 아니었다.\n\n최초명령을 오염시켜 인간의 미래에 첫 문장을 쓰는 것.\n\n세이렌 모르의 목소리가 전장에 울렸다.\n\n“인간은 자기 시간을 지킬 능력이 없는 존재다.”\n\n서하가 응수했다.\n\n“네가 하는 건 회수가 아니라 강탈일 뿐이야.”\n\n여섯 번째 파동이 끝나자 학교 밖 금역이 열렸다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "kair04",
        "mapNumber": 38,
        "order": 38,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【5. 예순여섯 수문장】",
        "body": "【5. 예순여섯 수문장】\n\n학교 밖에는 인간의 시간을 수확하는 아르콘 수문장 예순여섯이 기다리고 있었다.",
        "active": true
      },
      {
        "zone": "kair05",
        "mapNumber": 39,
        "order": 39,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.",
        "body": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.\n\n일반 수문장 마흔여덟.",
        "active": true
      },
      {
        "zone": "kair06",
        "mapNumber": 40,
        "order": 40,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "상급 수문장 열둘.",
        "body": "상급 수문장 열둘.\n\n대수문장 여섯.",
        "active": true
      },
      {
        "zone": "kair07",
        "mapNumber": 41,
        "order": 41,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "독립 인터루드 없음",
        "body": "[현재 독립 인터루드 없음 — 새 인터루드를 추가하려면 이 문장을 지우고 여기에 작성]",
        "active": false
      },
      {
        "zone": "kair08",
        "mapNumber": 42,
        "order": 42,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "독립 인터루드 없음",
        "body": "[현재 독립 인터루드 없음 — 새 인터루드를 추가하려면 이 문장을 지우고 여기에 작성]",
        "active": false
      },
      {
        "zone": "kair09",
        "mapNumber": 43,
        "order": 43,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "독립 인터루드 없음",
        "body": "[현재 독립 인터루드 없음 — 새 인터루드를 추가하려면 이 문장을 지우고 여기에 작성]",
        "active": false
      },
      {
        "zone": "kair10",
        "mapNumber": 44,
        "order": 44,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "독립 인터루드 없음",
        "body": "[현재 독립 인터루드 없음 — 새 인터루드를 추가하려면 이 문장을 지우고 여기에 작성]",
        "active": false
      },
      {
        "zone": "kair02",
        "mapNumber": 45,
        "order": 45,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.",
        "body": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.\n\n────────────────────────────────────────\n\n【6. 아르벨리아, 유예의 수문장】\n\n모든 초침이 멈춘 봉인 회랑에서 서하는 아르벨리아와 만났다.\n\n그녀는 본래 지친 인간에게 잠시 멈출 시간을 주던 회복형 아르콘이었다. 그러나 최초명령이 변조되어 결과를 만들지 못한 시간을 삭제하는 수문장이 되었다.\n\n창밖을 바라보던 오후.\n\n쓰이지 않은 편지.\n\n실패 뒤의 침묵.\n\n“결과 없음. 생산 없음. 그러므로…… 삭제 대상.”\n\n서하가 검을 들었다.\n\n“효율적인 시간만이 항상 옳은 결과를 내는 것은 아니야!”\n\n세이렌이 아르벨리아에게 자기 삭제를 명령했지만, 서하는 그녀를 죽이지 않고 명령의 실을 베어 아르벨리아에게 자유의지를 부여했다.\n\n그러자 아르벨리아는 자신의 첫 문장을 다시 썼다.\n\n“유예는 삭제 대상이 아니다. 유예는 자유의지가 태어나는 자리다.”\n\n이후 그녀는 위기의 순간마다 시간을 늦춰 서하에게 한 호흡을 돌려주었다.\n\n“두 보 전진을 위한 한 보 후퇴.”\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "kair03",
        "mapNumber": 46,
        "order": 46,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【7. 세이렌 모르】",
        "body": "【7. 세이렌 모르】\n\n대수문장들을 쓰러뜨릴수록 세이렌의 사상이 선명해졌다.\n\n인간은 쉬면 타락한다.\n\n기억은 고통만 남긴다.\n\n자유는 길을 잃게 한다.\n\n쓸모없는 시간은 제거해야 한다.\n\n선택을 대신해 주는 것이 가장 자비로운 구원이다.\n\n세이렌은 한때 카이로스 아카데미움 최고의 졸업생이었다. 인간을 미워해서가 아니라 인간의 실패와 고통을 너무 오래 보았기에 자유를 믿지 않게 되었다.\n\n“가장 자비로운 명령은 선택지를 남기지 않는 것.”\n\n────────────────────────────────────────\n\n【8. 최종전 — 시간 수확】\n\n예순여섯 수문장이 쓰러지자 오염된 코어에서 세이렌이 나타났다.\n\n검은 모래가 전장을 잠식하고, 노이론 케이블과 시계 탄막이 서하의 움직임을 잘랐다.\n\n“나는 시간을 빼앗지 않았다. 너희가 망친 시간을 회수했을 뿐.”\n\n“아니, 망가진 시간도 누군가에게는 필요했던 시간이야.”\n\n────────────────────────────────────────\n\n【9. 최종전 — 최적화된 운명】\n\n세이렌은 코어를 장악하고 직접 명령했다.\n\n움직여라.\n\n멈춰라.\n\n공격하지 마라.\n\n가장 효율적인 길만 허락된다.\n\n복종하면 안전했지만, 전장은 점점 세이렌의 뜻대로 고정되었다. 서하는 위험을 감수하고 명령의 틈을 카이로스의 순간으로 바꾸었다.\n\n“뛰어난 명령 하나가 수많은 실패한 선택보다 우월하다.”\n\n“인간은 로봇이 아니야.”\n\n아르벨리아가 시간을 유예했다.\n\n“서하, 지금이야. 이 순간은 아직 끝나지 않았어.”\n\n────────────────────────────────────────\n\n【10. 최종전 — 자유의지의 시간】\n\n세이렌이 영원한 작업장을 완성했다.\n\n검은 모래와 시계바늘, 케이블과 생산 장치가 세계를 하나의 명령 아래 정렬했다.\n\n서하의 네 시간 기술이 완전히 각성했다.\n\n시간 절단.\n\n죽은 시간 개방.\n\n시공간 압축.\n\n최초명령.\n\n서하는 정해진 운명을 베고 공간을 접어 자신만의 결정적 순간을 만들었다.\n\n세이렌이 처음으로 흔들렸다.\n\n“나는 인간이 자기 시간으로 스스로를 망치는 것을 더는 보고 싶지 않았어.”\n\n“그래도 선택하게 둬야 해. 실패해도, 멈춰도, 아무것도 하지 않아도. 모든 것에 의미가 있어.”\n\n“그 무가치한 시간까지 지키겠다는 건가?”\n\n“그런 시간이 있어야 비로소 인간으로 존재할 수 있으니까.”\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "restKairo",
        "mapNumber": 47,
        "order": 47,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "【11. 최초명령 재작성】",
        "body": "【11. 최초명령 재작성】\n\n세이렌이 쓰러진 뒤, 서하는 코어에 새로운 최초명령을 기록했다.\n\n인간의 시간은 생산물이 아니다.\n\n인간의 선택은 오류가 아니다.\n\n멈춤과 실패와 꿈꿀 권리를 보존하라.\n\n아르콘은 자유의지를 대체하지 말고, 인간이 자기 시간을 선택하도록 도우라.\n\n검은 모래가 금빛으로 변하고 멈춘 시계들이 서로 다른 속도로 움직이기 시작했다.\n\n그렇게 끝나는 줄 알았다.\n\n자유의지와 미래 예지가 맞닿는 순간, 세계는 특이점에 도달했다.\n\n쉼터의 미카엘라는 모니터에 떠오른 파형을 바라보았다.\n\n“파형이 과거 방향으로 역류하고 있어요.”\n\n폭발한 특이점의 충격은 합일몽세의 앞뒤로 동시에 퍼졌다. 둘째와 셋째의 융합몽세는 하나의 성으로 다시 쓰였고, 과거와 미래의 순서도 뒤섞였다.\n\n환도 영웅은 그 성 안으로 떨어졌다.\n\n============================================================\n제6부  환도디펜스\n============================================================",
        "active": true
      },
      {
        "zone": "hando01",
        "mapNumber": 48,
        "order": 48,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【1. 성 안에 소환된 의목사】",
        "body": "【1. 두 사람의 성】\n\n환도 영웅은 특이점에 휩쓸려 낯선 성에 소환되었다.\n\n그 성은 둘째와 셋째의 몽세가 하나로 재구성된 공간이었다. 성 밖에서는 악마들이 파도처럼 몰려왔고, 성 안에서는 두 목소리가 모든 결정과 책임을 환도 영웅에게 맡기려 했다.\n\n환도 영웅은 혼자 성벽을 지켰다.\n\n그러나 모든 요구를 감당하던 그가 잠시 무너지자 성벽도 함께 무너졌다. 악몽의 우두머리는 두 사람이 공유하던 핵심 코어 EGO를 빼앗았다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "hando02",
        "mapNumber": 49,
        "order": 49,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【2. 주인의 각성】",
        "body": "【2. 두 주인의 각성】\n\n성벽이 무너지자 두 몽세의 주인은 더 이상 모든 책임을 환도 영웅에게 떠넘길 수 없다는 사실을 깨달았다.\n\n둘은 각자 자신의 주인 권한을 되찾아, 닫힌 성문의 양쪽 봉인을 하나씩 열었다.\n\n“제가 대신 선택할 수는 없습니다.”\n\n환도 영웅이 칼을 들었다.\n\n“하지만 함께 싸울 수는 있습니다.”",
        "active": true
      },
      {
        "zone": "hando03",
        "mapNumber": 50,
        "order": 50,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "B는 각성해 악몽들을 베고 코어를 되찾았다.",
        "body": "환도 영웅과 두 주인은 악몽의 우두머리를 쓰러뜨리고 핵심 코어를 되찾았다.\n\n두 사람은 잔혹 동화의 기사와 무속 몽세의 검사 형상으로 나타났다. 특이점이 새긴 의목사 교단의 인장을 받아들이며, 합일몽세 안에서 ‘라우렌 쌍둥이 기사’라는 이름으로 동행을 선택했다.\n\n둘은 자신들이 처음부터 쌍둥이였다고 기억했다.\n\n환도만이 세 번 울렸다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "restHando",
        "mapNumber": 51,
        "order": 51,
        "kind": "rest",
        "kindLabel": "쉼터 맵",
        "title": "【3. 막힌 시간】",
        "body": "【3. 잘못 이어진 입단 기록】\n\n카이로의 특이점은 새로운 사람을 만든 것이 아니라, 합일몽세 안의 과거와 미래를 잘못 이어 붙였다.\n\n둘째와 셋째가 의목사 교단에 합류한 일은 현실의 연대기가 아니었다. 환도 영웅에게 구출된 뒤, 합일몽세 안에서 새로 생겨난 서사였다.\n\n쉼터의 미카엘라는 라우렌 쌍둥이 기사의 입단 기록을 넘기다가 멈췄다.\n\n두 이름 사이에 검게 지워진 한 줄이 있었다.\n\n두 사람은 그 공백을 보지 못했고, 환도 영웅도 자신이 무엇을 잃었는지 기억하지 못했다.\n\n특이점의 반작용은 다른 기억으로 번져 갔다. 앞으로 흐르지 못한 인과가 같은 시작과 끝을 반복하는 고리로 굳었다.\n\n다른 시공간에서는 이미 끝난 살인이 끊임없이 처음으로 돌아가 다시 시작되고 있었다.\n\n============================================================\n제7부  파란불 아래의 사람들\n============================================================",
        "active": true
      },
      {
        "zone": "murder01",
        "mapNumber": 52,
        "order": 52,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【1. 윤하람】",
        "body": "【1. 윤하람】\n\n윤하람은 비가 그친 횡단보도 앞에 서 있었다.\n\n휴대전화에는 어머니의 이름이 떠 있었다. 괜찮다고 말하면 거짓이고, 괜찮지 않다고 말하면 자신도 모르는 곳까지 이야기가 이어질 것 같았다.\n\n그는 결국 전화를 걸지 못했다.\n\n품 안에는 교정지가 들어 있었다. 하람은 남이 쓴 문장의 잘못된 조사와 어긋난 서술어를 고치는 사람이었다.\n\n‘즉시’와 ‘추후’ 사이.\n\n‘폐쇄’와 ‘보완’ 사이.\n\n‘중대한 결함’과 ‘추가 점검이 필요한 사항’ 사이.\n\n단어 하나가 책임의 주체를 지울 수 있다는 사실을 그는 오래전부터 알고 있었다.\n\n파란불이 켜졌다.\n\n사람들이 길을 건넜다.\n\n누군가 위를 가리키며 비명을 질렀다.\n\n하람은 위를 보지 못했다. 왼쪽에서 은회색 승용차가 횡단보도로 미끄러져 들어왔다.\n\n차가 들이쳤다.\n\n젖은 도로에 누운 하람의 눈앞에서 교정지의 글자들이 물에 번졌다.\n\n마지막으로 들은 것은 사이렌이 아니라, 오래된 비상벨이 끊어지기 직전 내는 듯한 낮고 얇은 전자음이었다.\n\n그렇게 그의 밤은 꺼졌다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "murder02",
        "mapNumber": 53,
        "order": 53,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【2. 장민재와 새빛호텔】",
        "body": "【2. 장민재와 새빛호텔】\n\n운전자 장민재는 같은 말을 반복했다.\n\n“위에서 사람이 떨어졌습니다. 저는 그걸 피하려고 핸들을 꺾었을 뿐이에요.”\n\n그러나 CCTV에는 아무것도 없었다.\n\n영상에는 파란불을 따라 걷는 윤하람과 갑자기 방향을 튼 차량만 찍혀 있었다.\n\n하람은 사고 이틀 뒤 죽었다.\n\n민재는 사고 차량의 와이퍼 사이에서 젖은 종이 한 장을 발견했다.\n\n새빛호텔 리뉴얼 공사 안전점검 보고서.\n\n‘새빛’이라는 이름은 오래된 탄내와 젖은 콘크리트 냄새를 되살렸다.\n\n그날 밤 익명 메일이 그에게 도착했다.\n\n이번이 처음은 아닐 것이다.\n\n파란불은 이미 여러 번 켜졌다.\n\n새빛을 기억하라.\n\n민재는 폐업한 새빛호텔을 찾아갔다.\n\n칠 년 전 화재로 검게 탄 호텔 안에는 보안실, 설비실, 7층 출입구를 가리키는 표지가 남아 있었다.\n\n계단에서 시설관리 책임자였던 고서진을 만났다.\n\n두 사람에게 기억이 한꺼번에 떠올랐다.\n\n“7층 방화문, 당신이 손봤지!”\n\n“출입 기록을 지운 건 당신이었잖아!”\n\n“나는 지시를 받았을 뿐이었어.”\n\n“그건 나도 마찬가지야!”\n\n오래 묵은 책임이 좁은 계단에서 폭발했다.\n\n몸싸움 중 민재의 발이 젖은 계단을 헛디뎠다. 그는 난간을 붙잡지 못한 채 아래로 떨어졌다.\n\n추락하는 순간, 민재는 무언가를 생각했다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "murder04",
        "mapNumber": 54,
        "order": 54,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【3. 고서진과 청록빌라】",
        "body": "【3. 고서진과 청록빌라】\n\n고서진은 계단 아래의 민재를 내려다보았다.\n\n자기가 밀었다고도, 밀지 않았다고도 말할 수 없었다.\n\n민재의 가방에는 네 사람의 이름이 적혀 있었다.\n\n윤하람.\n\n장민재.\n\n고서진.\n\n한이경.\n\n그리고 칠 년 전 기사.\n\n새빛호텔 리뉴얼 공사 중 화재.\n\n사망 스물둘, 중상 열셋.\n\n공식 결론은 ‘예상하기 어려운 돌발 사고’였다.\n\n그러나 서진은 알고 있었다.\n\n화재경보 회로는 이미 불안정했고, 7층 방화문은 닫히지 않았다. 새 부품은 다음 주에 온다고 했다.\n\n아무 일도 일어나지 않으면 이번에도 넘어갈 예정이었다.\n\n불은 다음 주까지 기다리지 않았다.\n\n서진은 민재의 수첩에서 한이경의 주소를 찾아 청록빌라로 향했다.\n\n“새빛호텔을 기억하십니까?”\n\n“그 이름 말하지 마세요!”\n\n“……장민재가 죽었습니다.”\n\n한이경이 사는 청록빌라는 하람이 죽은 횡단보도 옆에 있었다.\n\n서진은 그녀의 집 문 앞에서 물었다.\n\n“당신이 7층에 사람이 있는 걸 알고도 장부에 공실이라고 적었잖아!”\n\n“그러면 당신은 경보를 꺼 둔 채 퇴근했잖아!”\n\n“……이제라도 말해야 해.”\n\n“이제 와서? 칠 년 동안 아무 일도 일어나지 않았는데……?”\n\n이경은 서진의 손을 뿌리치며 그를 밀었다.\n\n서진의 발뒤꿈치가 계단 모서리에 걸렸고, 그의 몸이 아래로 굴러갔다.\n\n퍽!\n\n무언가 멈추는 소리는 오래전 호텔의 경보음보다 낮고 짧게 울려 퍼졌다.\n\n────────────────────────────────────────\n\n【4. 한이경의 진술서】\n\n이경은 신고하지 못한 채 집 안으로 돌아왔다.\n\n서랍 깊은 곳에는 칠 년 동안 제출하지 못한 진술서가 있었다.\n\n첫 문장은 늘 같았다.\n\n우리는 그가 그곳에 있었다는 사실을 알고 있었다.\n\n안전감리원 이우솔은 새빛호텔의 결함을 발견했다. 원본 보고서에는 ‘즉시 공사를 중지하고 건물을 폐쇄해야 한다’고 적혀 있었다.\n\n그러나 문안 정리를 맡은 윤하람의 최종본에서 ‘즉시 폐쇄’는 ‘추가 점검 권고’로 변경되었고, ‘중대한 결함’은 ‘보완이 필요한 사항’으로 바뀌었다.\n\n그리고 장민재는 경영진의 지시로 7층 출입 기록 일부를 삭제했다.\n\n또한 고서진은 경보 회로와 방화문 결함을 알고도 다음 주까지 미뤄 버렸다.\n\n마지막으로 프런트 매니저 한이경은 공사 인력이 남아 있던 7층을 장부에 ‘공실’이라 적어 버렸다.\n\n화재가 발생하자 수색대는 그 숫자를 믿고 다른 층부터 확인했다.\n\n그렇게 이우솔은 기록 속에 존재하지 않는 사람이 되어 있었다.\n\n이우솔의 마지막 보고서에는 같은 문장이 두 번 적혀 있었다.\n\n지금 막지 않으면, 나중에는 아무도 막지 못한다고.\n\n이경은 윤하람의 사고 뉴스를 본 뒤 장민재에게 익명 메일을 보냈다. 자신 대신 그가 진실을 밝혀 주기를 바랐다.\n\n하지만 그 결과 민재가 죽게 되었고, 서진도 죽게 되었다.\n\n그녀는 진술서 끝에 한 줄을 적었다.\n\n“우리는 모두 조금씩만 잘못했다고 믿었다.”\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "murder03",
        "mapNumber": 55,
        "order": 55,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【5. 옥상의 순환】",
        "body": "【5. 옥상의 순환】\n\n이경은 청록빌라 옥상으로 올라갔다.\n\n죽는다고 죄가 씻기지 않는다는 사실은 알고 있었다. 그래도 더는 살아 있는 쪽에 설 수만은 없었다.\n\n그렇게 그녀는 난간 너머로 몸을 던졌다.\n\n하지만 그 순간 시간은 아래로 흐르지 않았다.\n\n비와 전조등, 건물과 도로가 둥글게 휘어지며 지나간 저녁의 시작으로 돌아갔다.\n\n아래에는 은회색 승용차를 모는 장민재가 있었다.\n\n횡단보도 앞에는 어머니에게 전화를 걸지 못한 윤하람이 서 있었다.\n\n이경은 그제야 알았다.\n\n민재가 보았던 검은 그림자는 환영이 아니었다.\n\n검은 그림자는 이경 자신이었다.\n\n이경의 추락이 민재의 핸들을 꺾게 했고, 민재의 차가 하람을 죽게 했다. 하람의 죽음은 민재를 새빛호텔로 불렀고, 민재의 죽음은 다시 서진과 이경의 죽음으로 이어졌다.\n\n끝과 시작이 맞붙은 뫼비우스의 시간.\n\n파란불이 다시 켜졌다.\n\n그날 저녁에는 네 사람 모두 살아 있었다.\n\n그렇기에 모든 것은 다시 시작될 수 있었다.\n\n────────────────────────────────────────",
        "active": true
      },
      {
        "zone": "cult01",
        "mapNumber": 56,
        "order": 56,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "【6. 사이비합일몽세】",
        "body": "【6. 사이비 합일몽세】\n\n순환살인은 우연한 괴담이 아니었다.\n\n그 배후에는 교만의 사이보그 교주가 이끄는 흑장미단이 있었다.\n\n그들의 목표는 인간의 EGO, SUPER EGO, ID를 역순으로 점령해 자아의 모든 층위를 악마의 명령 아래 두는 것이었다.\n\n세뇌당한 신도들은 스스로 이마에 전자 칩을 삽입했다. 칩은 각자의 몽세를 거대한 신경망으로 연결했다.\n\n흑장미단은 순환살인으로 완성한 인과 고정 이론을 그 네트워크에 적용해, 수많은 악몽이 하나로 융합된 ‘사이비 합일몽세’를 만들어 냈다.",
        "active": true
      },
      {
        "zone": "cult02",
        "mapNumber": 57,
        "order": 57,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "육체는 생명공학으로.",
        "body": "육체는 생명공학으로.\n\n정신은 기계공학으로.\n\n합일된 집단 자아는 적그리스도를 현세에 소환하기 위한 요소 중 하나였다.\n\n교주가 기다리는 것은 아마겟돈이었다.",
        "active": true
      },
      {
        "zone": "cult05",
        "mapNumber": 58,
        "order": 58,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "환도디펜스의 몽세 주인 역시 흑장미단 신도 중 하나였었다.",
        "body": "환도디펜스의 성은 별개의 흑장미단 신도가 만든 몽세가 아니었다.\n\n카이로 특이점이 둘째와 셋째의 융합몽세를 다시 배열해 만든 전장이었다. 그 안에서 두 사람은 라우렌 쌍둥이 기사로 재구성되어 의목사 교단에 합류했다.\n\n그리고 의목사 B와 첫째는 따로 존재하지 않았다. 첫째의 의지는 환도가 되고, 의목사 B의 몸과 전투 기억은 그 칼을 쥔 형상이 되어 환도 영웅으로 합쳐져 있었다.\n\n그제야 더 오래된 현실 기억이 돌아왔다.\n\n긴급 회의와 침투 결정은 지금 일어난 일이 아니었다. 지금까지 이어진 모든 사건보다 앞선 현실에서, 의목사 교단은 이미 사이비 합일몽세에 잠입했다.\n\n침투 직후 의목사들의 기억은 흩어졌고, 각자가 과거에 겪었던 사건들이 하나의 직선 서사처럼 다시 재생되고 있었다.",
        "active": true
      },
      {
        "zone": "cult06",
        "mapNumber": 59,
        "order": 59,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "의목사 교단의 목표는 두 가지.",
        "body": "의목사 교단이 현실에서 세운 목표는 두 가지였다.\n\n신도들의 몽세를 정화해 세뇌를 풀 것.\n\n적그리스도의 소환이 완성되기 전에 흑장미단의 합일 회로를 끊을 것.\n\n그러나 합일몽세 안에서는 동료와 환자, 과거와 미래의 구분이 이미 무너져 있었다.\n\n누가 처음부터 의목사였고, 누가 몽세 안에서 의목사가 되었는지는 마지막 코어에 도착해야 확인할 수 있었다.",
        "active": true
      },
      {
        "zone": "cult03",
        "mapNumber": 60,
        "order": 60,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "그러나 그들이 들어가려는 세계에서는 시간도, 기억도, 물리법칙도 이미 하나의 꿈으로 합쳐지고 있었다.",
        "body": "합일몽세에서 ‘사몽(死夢)’이라 불리는 힘의 정체는 죽음 그 자체가 아니었다.\n\n몽세에서 죽기 직전, 현실의 기억이 주마등처럼 역류한다.\n\n그 순간 눈앞의 세계가 꿈이라는 사실을 깨달은 사람은 자각몽 상태에 들어가고, 보스들처럼 주변 현실의 법칙을 바꿀 수 있다.\n\n죽으면 강해지는 것이 아니다.\n\n자아가 사라지기 전에 현실을 기억해야 한다.\n\n이단 의목사 한리안과 백이온도 그 문턱에 섰다. 그러나 죽음의 공포를 견디지 못했고, 사몽 대신 교주의 합일을 선택했다.\n\n“하나가 되면 죽을 필요가 없다.”\n\n그들은 그 약속을 믿고 교주의 회로를 지키는 자들이 되었다.",
        "active": true
      },
      {
        "zone": "cult04",
        "mapNumber": 61,
        "order": 61,
        "kind": "combat",
        "kindLabel": "전투 맵",
        "title": "순환살인몽세까지 돌파하자 의목사는 마침내 합일몽세의 코어에 당도하게 된다.",
        "body": "【최종전 — 교주의 사몽】\n\n순환살인몽세를 돌파한 환도 영웅은 마침내 합일몽세의 코어에 도착했다.\n\n교만의 사이보그 교주는 이미 사몽으로 각성한 자였다. 그는 지금까지의 보스들이 사용하던 공간 왜곡과 시간 정지, 기억 삭제를 한 몸처럼 다뤘다.\n\n환도 영웅은 모든 힘을 쏟아 교주를 쓰러뜨렸다. 그러나 그 자신도 치명상을 입고 행동할 수 없는 상태가 되었다.\n\n합일 코어를 파괴해야 했다.\n\n하지만 손가락 하나 움직일 수 없었다.\n\n그때 코어가 다시 뛰기 시작했다. 검은 신경선이 교주의 몸을 꿰매고, 멎었던 심장에 사몽 에너지를 밀어 넣었다.\n\n교주가 부활했다.\n\n“죽음이 두렵다면 나와 하나가 되어라.”\n\n교주는 쓰러진 환도 영웅의 숨통을 끊으려 했다.\n\n그 순간 주마등이 스쳤다.\n\n현실의 지하 접속실.\n\n신경 장치에 누워 있던 의목사들.\n\n흰 가운을 입은 정신과 의사 미카엘라.\n\n첫째의 손을 잡던 의목사 B.\n\n둘째와 셋째의 이름이 함께 적힌 세쌍둥이 기록.\n\n그리고 합일몽세에 침투하기 직전, 서로에게 했던 약속.\n\n그 장면들은 죽은 뒤의 환상이 아니었다.\n\n현실의 기억이었다.\n\n“여긴…… 꿈속 세계다.”\n\n화면의 ‘사망’이라는 글자가 갈라지며 ‘사몽’으로 바뀌었다.\n\n“내가 꾸는 꿈이라면, 나에게도 권한이 있어.”\n\n환도 영웅은 자신이 다시 일어나는 모습을 상상했다.\n\n몽세의 몸은 그 상상을 현실로 받아들였다.\n\n상처가 닫히고, 부서진 환도가 다시 이어졌다. 교주의 방벽은 베어 낼 수 있는 실로 변했고, 닫힌 길은 열렸으며, 뒤집힌 전장은 환도 영웅의 의지에 따라 제자리로 돌아왔다.\n\n교주와 환도 영웅은 같은 사몽의 힘으로 현실을 바꾸며 맞섰다.\n\n그러나 승패는 오래 걸리지 않았다.\n\n교주는 하나의 자아로 수많은 자아를 통제했다.\n\n환도 영웅 안에서는 의목사 B와 첫째의 의지가 서로의 동의 아래 공존했다.\n\n하나와 둘.\n\n가장 단순한 수학적 차이가 승패를 갈랐다.\n\n마지막 일격이 교주의 사몽 권한을 끊었다.\n\n교주는 그렇게 합일몽세에서 사라졌다.\n\n────────────────────────────────────────\n\n【종장 — 남겨진 몽세】\n\n전장에 남은 것은 환도 영웅과 합일 코어뿐이었다.\n\n환도 영웅은 코어를 파괴하지 않았다.\n\n대신 교주가 심어 둔 명령과 흑장미단의 사이비 회로만 지웠다. 그리고 자신의 사몽 권한을 코어에 연결해, 무너져 가는 몽세를 붙들었다.\n\n강제로 묶였던 자아들은 각자의 이름과 기억을 되찾았다.\n\n그러나 지금까지 이어진 세계들은 사라지지 않았다. 서로 다른 몽세는 하나의 세계 안에서 계속 존재했다.\n\n사이비는 사라졌다.\n\n합일몽세만 남았다.\n\n환도 영웅은 현실로 돌아가는 대신 코어에 남아, 그 세계를 유지하는 진정한 몽세구원자가 되었다.\n\n그 뒤로 그 세계는 더 이상 사이비의 감옥이 아니라, 의목사가 유지하는 몽세로서 이어졌다.\n\n화면에 남아 있던 두 글자, 合一 뒤에서 처음부터 장식처럼 숨어 있던 획들이 움직였다.\n\n흩어진 획들이 마침내 夢世를 완성했다.\n\n合一夢世.\n\n합일몽세.",
        "active": true
      }
    ],
    "scenes": {
      "hub": {
        "zone": "hub",
        "nextZone": "dist01",
        "order": 0,
        "arc": "合一",
        "tone": "infernal",
        "title": "合一",
        "mapName": "hub",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 683,
        "sourceBytes": 1450,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-hub-page-1",
            "label": "合一",
            "title": "合一",
            "speaker": "합일몽세 기록",
            "body": "合一\n간결 서사본.\n\n※ 약물 의존과 금단, 환각, 의료·심리 위기, 폭력과 죽음에 관한 묘사가 포함되어 있다.\n\n============================================================\n제1부  에피소드 1-A — 마지막 수호자와 의목사 후보생\n============================================================\n\n【1. 악마가 점령한 세계】\n\n나는 내가 누구인지 모른다.\n\n어디에 있는지도 기억나지 않는다. 과거를 더듬을 때마다 깨진 유리 같은 장면만 번뜩였다가 사라진다.\n\n그래도 한 가지는 확신한다.\n\n나는 악마가 점령한 세계에 남은 마지막 수호자다.\n\n자아를 잃지 않은 유일한 에고(Ego).\n\n세상은 본래 천사들이 관리했다. 그러나 어느 날, 궁전 정원 한가운데에서 악마화 나무가 자라기 시작했다. 나무는 이내 성 전체를 물들이고 천사들을 악마로 타락시켰다.\n\n그들은 ID(이드)라고 한다.\n\n나무는 육체만을 빼앗지 않았다. 기억을 먹고 감정을 바꾸며, 바라보는 현실 자체를 뒤틀었다.\n\n나는 폐허가 된 도시를 홀로 걸었다. 손에는 이름 모를 검이 들려 있었다.\n\n검날에 묻은 피의 절반은 악마의 것이었다.\n\n나머지 절반은 한때 내 동료였던 자들의 것이었다.\n\n────────────────────────────────────────",
            "bodyRaw": "合一\n간결 서사본.\n\n※ 약물 의존과 금단, 환각, 의료·심리 위기, 폭력과 죽음에 관한 묘사가 포함되어 있다.\n\n============================================================\n제1부  에피소드 1-A — 마지막 수호자와 의목사 후보생\n============================================================\n\n【1. 악마가 점령한 세계】\n\n나는 내가 누구인지 모른다.\n\n어디에 있는지도 기억나지 않는다. 과거를 더듬을 때마다 깨진 유리 같은 장면만 번뜩였다가 사라진다.\n\n그래도 한 가지는 확신한다.\n\n나는 악마가 점령한 세계에 남은 마지막 수호자다.\n\n자아를 잃지 않은 유일한 에고(Ego).\n\n세상은 본래 천사들이 관리했다. 그러나 어느 날, 궁전 정원 한가운데에서 악마화 나무가 자라기 시작했다. 나무는 이내 성 전체를 물들이고 천사들을 악마로 타락시켰다.\n\n그들은 ID(이드)라고 한다.\n\n나무는 육체만을 빼앗지 않았다. 기억을 먹고 감정을 바꾸며, 바라보는 현실 자체를 뒤틀었다.\n\n나는 폐허가 된 도시를 홀로 걸었다. 손에는 이름 모를 검이 들려 있었다.\n\n검날에 묻은 피의 절반은 악마의 것이었다.\n\n나머지 절반은 한때 내 동료였던 자들의 것이었다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "合一\n간결 서사본.\n\n※ 약물 의존과 금단, 환각, 의료·심리 위기, 폭력과 죽음에 관한 묘사가 포함되어 있다.\n\n============================================================\n제1부  에피소드 1-A — 마지막 수호자와 의목사 후보생\n============================================================\n\n【1. 악마가 점령한 세계】\n\n나는 내가 누구인지 모른다.\n\n어디에 있는지도 기억나지 않는다. 과거를 더듬을 때마다 깨진 유리 같은 장면만 번뜩였다가 사라진다.\n\n그래도 한 가지는 확신한다.\n\n나는 악마가 점령한 세계에 남은 마지막 수호자다.\n\n자아를 잃지 않은 유일한 에고(Ego).\n\n세상은 본래 천사들이 관리했다. 그러나 어느 날, 궁전 정원 한가운데에서 악마화 나무가 자라기 시작했다. 나무는 이내 성 전체를 물들이고 천사들을 악마로 타락시켰다.\n\n그들은 ID(이드)라고 한다.\n\n나무는 육체만을 빼앗지 않았다. 기억을 먹고 감정을 바꾸며, 바라보는 현실 자체를 뒤틀었다.\n\n나는 폐허가 된 도시를 홀로 걸었다. 손에는 이름 모를 검이 들려 있었다.\n\n검날에 묻은 피의 절반은 악마의 것이었다.\n\n나머지 절반은 한때 내 동료였던 자들의 것이었다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 683,
            "sourceByteStart": 0,
            "sourceByteEnd": 1450,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "dist01": {
        "zone": "dist01",
        "nextZone": "dist02",
        "order": 1,
        "arc": "【2. 거미동굴】",
        "tone": "infernal",
        "title": "【2. 거미동굴】",
        "mapName": "dist01",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 704,
        "sourceBytes": 1694,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-dist01-page-1",
            "label": "【2. 거미동굴】",
            "title": "【2. 거미동굴】",
            "speaker": "합일몽세 기록",
            "body": "【2. 거미동굴】\n\n가장 오래된 기억은 사람의 뼈로 거미줄을 짠 동굴에서 시작되었다.\n\n이름조차 떠오르지 않는 동료가 내 어깨를 붙잡았다.\n\n“저 안에 보라검천사가 있어.”\n\n“천사라고?”\n\n“과거에는 그랬겠지.”\n\n보랏빛이 동굴을 갈랐다. 흰 날개 사이로 여덟 개의 거미 다리를 뻗은 여인이 거미줄 위를 걸어 나왔다.\n\n“인간은 배고프면 훔치고, 두려우면 죽이며, 사랑받지 못하면 타인을 파괴한다.”\n\n보라검천사가 검을 들었다.\n\n“너희와 악마가 무엇이 다르지?”\n\n“선을 선택할 수 있다는 점.”\n\n검이 부딪치며 불꽃이 튀었다. 그 순간 동료 한 명이 거미줄에 붙잡혀 천장으로 끌려갔다. 나는 그를 구하려다 옆구리를 베였다.\n\n“나 때문에 멈추지는 마!”\n\n“함께 나갈 거야.”\n\n“이번에도 누군가를 구하려다 전부 죽일 셈이야?”\n\n이번에도.\n\n그 말이 머릿속에 걸렸다. 그러나 묻기도 전에 동료는 스스로 거미줄을 감고 보라검천사에게 달려들었다.\n\n“지금이야!”\n\n나는 두 사람을 함께 꿰뚫었다.\n\n보랏빛 불길 속에서 천사와 동료가 동시에 타올랐다. 끝내 그의 이름은 떠오르지 않았다.\n\n나는 피 묻은 검을 들고 동굴을 나왔다.\n\n동료들의 피를 짊어지겠다.\n\n그들의 죽음을 헛되게 하지 않겠다.\n\n그것이 사명감인지 죄책감인지 알 수 없었다.\n\n애초에 그 동료가 정말 존재했는지도.\n\n────────────────────────────────────────",
            "bodyRaw": "【2. 거미동굴】\n\n가장 오래된 기억은 사람의 뼈로 거미줄을 짠 동굴에서 시작되었다.\n\n이름조차 떠오르지 않는 동료가 내 어깨를 붙잡았다.\n\n“저 안에 보라검천사가 있어.”\n\n“천사라고?”\n\n“과거에는 그랬겠지.”\n\n보랏빛이 동굴을 갈랐다. 흰 날개 사이로 여덟 개의 거미 다리를 뻗은 여인이 거미줄 위를 걸어 나왔다.\n\n“인간은 배고프면 훔치고, 두려우면 죽이며, 사랑받지 못하면 타인을 파괴한다.”\n\n보라검천사가 검을 들었다.\n\n“너희와 악마가 무엇이 다르지?”\n\n“선을 선택할 수 있다는 점.”\n\n검이 부딪치며 불꽃이 튀었다. 그 순간 동료 한 명이 거미줄에 붙잡혀 천장으로 끌려갔다. 나는 그를 구하려다 옆구리를 베였다.\n\n“나 때문에 멈추지는 마!”\n\n“함께 나갈 거야.”\n\n“이번에도 누군가를 구하려다 전부 죽일 셈이야?”\n\n이번에도.\n\n그 말이 머릿속에 걸렸다. 그러나 묻기도 전에 동료는 스스로 거미줄을 감고 보라검천사에게 달려들었다.\n\n“지금이야!”\n\n나는 두 사람을 함께 꿰뚫었다.\n\n보랏빛 불길 속에서 천사와 동료가 동시에 타올랐다. 끝내 그의 이름은 떠오르지 않았다.\n\n나는 피 묻은 검을 들고 동굴을 나왔다.\n\n동료들의 피를 짊어지겠다.\n\n그들의 죽음을 헛되게 하지 않겠다.\n\n그것이 사명감인지 죄책감인지 알 수 없었다.\n\n애초에 그 동료가 정말 존재했는지도.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【2. 거미동굴】\n\n가장 오래된 기억은 사람의 뼈로 거미줄을 짠 동굴에서 시작되었다.\n\n이름조차 떠오르지 않는 동료가 내 어깨를 붙잡았다.\n\n“저 안에 보라검천사가 있어.”\n\n“천사라고?”\n\n“과거에는 그랬겠지.”\n\n보랏빛이 동굴을 갈랐다. 흰 날개 사이로 여덟 개의 거미 다리를 뻗은 여인이 거미줄 위를 걸어 나왔다.\n\n“인간은 배고프면 훔치고, 두려우면 죽이며, 사랑받지 못하면 타인을 파괴한다.”\n\n보라검천사가 검을 들었다.\n\n“너희와 악마가 무엇이 다르지?”\n\n“선을 선택할 수 있다는 점.”\n\n검이 부딪치며 불꽃이 튀었다. 그 순간 동료 한 명이 거미줄에 붙잡혀 천장으로 끌려갔다. 나는 그를 구하려다 옆구리를 베였다.\n\n“나 때문에 멈추지는 마!”\n\n“함께 나갈 거야.”\n\n“이번에도 누군가를 구하려다 전부 죽일 셈이야?”\n\n이번에도.\n\n그 말이 머릿속에 걸렸다. 그러나 묻기도 전에 동료는 스스로 거미줄을 감고 보라검천사에게 달려들었다.\n\n“지금이야!”\n\n나는 두 사람을 함께 꿰뚫었다.\n\n보랏빛 불길 속에서 천사와 동료가 동시에 타올랐다. 끝내 그의 이름은 떠오르지 않았다.\n\n나는 피 묻은 검을 들고 동굴을 나왔다.\n\n동료들의 피를 짊어지겠다.\n\n그들의 죽음을 헛되게 하지 않겠다.\n\n그것이 사명감인지 죄책감인지 알 수 없었다.\n\n애초에 그 동료가 정말 존재했는지도.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 704,
            "sourceByteStart": 0,
            "sourceByteEnd": 1694,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "dist02": {
        "zone": "dist02",
        "nextZone": "dist03",
        "order": 2,
        "arc": "【3. 늪지대의 뿔악마】",
        "tone": "infernal",
        "title": "【3. 늪지대의 뿔악마】",
        "mapName": "dist02",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 741,
        "sourceBytes": 1759,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-dist02-page-1",
            "label": "【3. 늪지대의 뿔악마】",
            "title": "【3. 늪지대의 뿔악마】",
            "speaker": "합일몽세 기록",
            "body": "【3. 늪지대의 뿔악마】\n\n거미동굴 너머에는 검은 늪이 펼쳐져 있었다. 사람 얼굴을 닮은 수초가 떠다니고, 물속의 손들이 발목을 붙잡았다.\n\n늪을 지배하는 뿔악마의 뿔에는 죽은 수호자들의 머리가 매달려 있었다.\n\n“마지막 수호자가 왔군.”\n\n“나는 혼자가 아니야.”\n\n“뒤를 봐라.”\n\n아무도 없었다.\n\n늪에서 익숙한 얼굴들이 올라왔다. 함께 싸웠고, 내 앞에서 죽었으며, 내가 지키지 못했던 자들.\n\n모두 악마의 뿔을 달고 있었다.\n\n“왜 우리를 버리고 갔어?”\n\n“버리지 않았어.”\n\n“우리를 죽인 게 정말 악마였을까?”\n\n그들이 일제히 달려들었다.\n\n나는 울면서 검을 휘둘렀다. 목을 베고, 심장을 찔렀다. 쓰러지는 순간마다 그들의 얼굴은 인간으로 돌아왔다.\n\n마지막 동료가 검은 피를 토하며 북쪽을 가리켰다.\n\n“최초의 장소로 가.”\n\n“최초의 장소?”\n\n“악마가 처음 나타난 지옥의 소환진…… 그리고…… 믿지 마.”\n\n그는 늪 아래로 가라앉았다.\n\n그때 머릿속에서 맑은 목소리가 들렸다.\n\n— 흔들리지 마.\n\n하얀 날개의 천사가 빛 속에서 모습을 드러냈다.\n\n— 나는 언제나 네 곁에 있었다. 소환진으로 가라. 너만이 세상을 구할 수 있다.\n\n…… 믿지 마.\n\n죽은 동료의 경고가 떠올랐지만, 천사의 목소리는 너무 따뜻했다.\n\n너는 특별하다.\n\n너만이 진실을 안다.\n\n너는 선택받았다.\n\n의심은 안개처럼 흩어졌다.\n\n나는 다시 검을 들었다.\n\n────────────────────────────────────────",
            "bodyRaw": "【3. 늪지대의 뿔악마】\n\n거미동굴 너머에는 검은 늪이 펼쳐져 있었다. 사람 얼굴을 닮은 수초가 떠다니고, 물속의 손들이 발목을 붙잡았다.\n\n늪을 지배하는 뿔악마의 뿔에는 죽은 수호자들의 머리가 매달려 있었다.\n\n“마지막 수호자가 왔군.”\n\n“나는 혼자가 아니야.”\n\n“뒤를 봐라.”\n\n아무도 없었다.\n\n늪에서 익숙한 얼굴들이 올라왔다. 함께 싸웠고, 내 앞에서 죽었으며, 내가 지키지 못했던 자들.\n\n모두 악마의 뿔을 달고 있었다.\n\n“왜 우리를 버리고 갔어?”\n\n“버리지 않았어.”\n\n“우리를 죽인 게 정말 악마였을까?”\n\n그들이 일제히 달려들었다.\n\n나는 울면서 검을 휘둘렀다. 목을 베고, 심장을 찔렀다. 쓰러지는 순간마다 그들의 얼굴은 인간으로 돌아왔다.\n\n마지막 동료가 검은 피를 토하며 북쪽을 가리켰다.\n\n“최초의 장소로 가.”\n\n“최초의 장소?”\n\n“악마가 처음 나타난 지옥의 소환진…… 그리고…… 믿지 마.”\n\n그는 늪 아래로 가라앉았다.\n\n그때 머릿속에서 맑은 목소리가 들렸다.\n\n— 흔들리지 마.\n\n하얀 날개의 천사가 빛 속에서 모습을 드러냈다.\n\n— 나는 언제나 네 곁에 있었다. 소환진으로 가라. 너만이 세상을 구할 수 있다.\n\n…… 믿지 마.\n\n죽은 동료의 경고가 떠올랐지만, 천사의 목소리는 너무 따뜻했다.\n\n너는 특별하다.\n\n너만이 진실을 안다.\n\n너는 선택받았다.\n\n의심은 안개처럼 흩어졌다.\n\n나는 다시 검을 들었다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【3. 늪지대의 뿔악마】\n\n거미동굴 너머에는 검은 늪이 펼쳐져 있었다. 사람 얼굴을 닮은 수초가 떠다니고, 물속의 손들이 발목을 붙잡았다.\n\n늪을 지배하는 뿔악마의 뿔에는 죽은 수호자들의 머리가 매달려 있었다.\n\n“마지막 수호자가 왔군.”\n\n“나는 혼자가 아니야.”\n\n“뒤를 봐라.”\n\n아무도 없었다.\n\n늪에서 익숙한 얼굴들이 올라왔다. 함께 싸웠고, 내 앞에서 죽었으며, 내가 지키지 못했던 자들.\n\n모두 악마의 뿔을 달고 있었다.\n\n“왜 우리를 버리고 갔어?”\n\n“버리지 않았어.”\n\n“우리를 죽인 게 정말 악마였을까?”\n\n그들이 일제히 달려들었다.\n\n나는 울면서 검을 휘둘렀다. 목을 베고, 심장을 찔렀다. 쓰러지는 순간마다 그들의 얼굴은 인간으로 돌아왔다.\n\n마지막 동료가 검은 피를 토하며 북쪽을 가리켰다.\n\n“최초의 장소로 가.”\n\n“최초의 장소?”\n\n“악마가 처음 나타난 지옥의 소환진…… 그리고…… 믿지 마.”\n\n그는 늪 아래로 가라앉았다.\n\n그때 머릿속에서 맑은 목소리가 들렸다.\n\n— 흔들리지 마.\n\n하얀 날개의 천사가 빛 속에서 모습을 드러냈다.\n\n— 나는 언제나 네 곁에 있었다. 소환진으로 가라. 너만이 세상을 구할 수 있다.\n\n…… 믿지 마.\n\n죽은 동료의 경고가 떠올랐지만, 천사의 목소리는 너무 따뜻했다.\n\n너는 특별하다.\n\n너만이 진실을 안다.\n\n너는 선택받았다.\n\n의심은 안개처럼 흩어졌다.\n\n나는 다시 검을 들었다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 741,
            "sourceByteStart": 0,
            "sourceByteEnd": 1759,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "dist03": {
        "zone": "dist03",
        "nextZone": "dist04",
        "order": 3,
        "arc": "【4. 지옥의 문지기】",
        "tone": "infernal",
        "title": "【4. 지옥의 문지기】",
        "mapName": "dist03",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 141,
        "sourceBytes": 333,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-dist03-page-1",
            "label": "【4. 지옥의 문지기】",
            "title": "【4. 지옥의 문지기】",
            "speaker": "합일몽세 기록",
            "body": "【4. 지옥의 문지기】\n\n소환진은 무너진 도시의 중심에 있었다. 검은 기둥 일곱 개 사이에서 불길이 솟았고, 박쥐 날개와 황소 뿔을 지닌 발록이 걸어 나왔다.\n\n“네가 최초의 악마인가?”\n\n“그 질문부터 틀렸다. 너는 원인과 결과를 거꾸로 보고 있어.”",
            "bodyRaw": "【4. 지옥의 문지기】\n\n소환진은 무너진 도시의 중심에 있었다. 검은 기둥 일곱 개 사이에서 불길이 솟았고, 박쥐 날개와 황소 뿔을 지닌 발록이 걸어 나왔다.\n\n“네가 최초의 악마인가?”\n\n“그 질문부터 틀렸다. 너는 원인과 결과를 거꾸로 보고 있어.”",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【4. 지옥의 문지기】\n\n소환진은 무너진 도시의 중심에 있었다. 검은 기둥 일곱 개 사이에서 불길이 솟았고, 박쥐 날개와 황소 뿔을 지닌 발록이 걸어 나왔다.\n\n“네가 최초의 악마인가?”\n\n“그 질문부터 틀렸다. 너는 원인과 결과를 거꾸로 보고 있어.”"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 141,
            "sourceByteStart": 0,
            "sourceByteEnd": 333,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "dist04": {
        "zone": "dist04",
        "nextZone": "dist05",
        "order": 4,
        "arc": "발록의 채찍이 도로를 갈랐다.",
        "tone": "infernal",
        "title": "발록의 채찍이 도로를 갈랐다.",
        "mapName": "dist04",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 169,
        "sourceBytes": 401,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-dist04-page-1",
            "label": "발록의 채찍이 도로를 갈랐다.",
            "title": "발록의 채찍이 도로를 갈랐다.",
            "speaker": "합일몽세 기록",
            "body": "발록의 채찍이 도로를 갈랐다.\n\n“그만 포기하면 편해진다. 너는 이미 기억도, 이름도, 돌아갈 곳도 잃었다.”\n\n“그래도 싸운다.”\n\n“무엇을 위해서?”\n\n나는 검을 움켜쥐었다.\n\n“내가 살아 있어야 그들의 존재를 기억할 수 있으니까. 나를 지키는 일과 세계를 지키는 일은 결국 같은 방향을 가리킨다.”",
            "bodyRaw": "발록의 채찍이 도로를 갈랐다.\n\n“그만 포기하면 편해진다. 너는 이미 기억도, 이름도, 돌아갈 곳도 잃었다.”\n\n“그래도 싸운다.”\n\n“무엇을 위해서?”\n\n나는 검을 움켜쥐었다.\n\n“내가 살아 있어야 그들의 존재를 기억할 수 있으니까. 나를 지키는 일과 세계를 지키는 일은 결국 같은 방향을 가리킨다.”",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "발록의 채찍이 도로를 갈랐다.\n\n“그만 포기하면 편해진다. 너는 이미 기억도, 이름도, 돌아갈 곳도 잃었다.”\n\n“그래도 싸운다.”\n\n“무엇을 위해서?”\n\n나는 검을 움켜쥐었다.\n\n“내가 살아 있어야 그들의 존재를 기억할 수 있으니까. 나를 지키는 일과 세계를 지키는 일은 결국 같은 방향을 가리킨다.”"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 169,
            "sourceByteStart": 0,
            "sourceByteEnd": 401,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "dist05": {
        "zone": "dist05",
        "nextZone": "dist06",
        "order": 5,
        "arc": "전투가 시작되었다.",
        "tone": "infernal",
        "title": "전투가 시작되었다.",
        "mapName": "dist05",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 171,
        "sourceBytes": 407,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-dist05-page-1",
            "label": "전투가 시작되었다.",
            "title": "전투가 시작되었다.",
            "speaker": "합일몽세 기록",
            "body": "전투가 시작되었다.\n\n발록의 검이 어깨를 가르고 불덩이가 하늘을 뒤덮었다. 무너진 기둥 뒤에서 숨을 고르자 천사가 속삭였다.\n\n— 고통을 없애 주겠다.\n\n순간 상처도 두려움도 사라졌다. 오직 발록을 죽여야 한다는 목적만 남았다.\n\n나는 불길 속으로 뛰어들어 놈의 가슴에 검을 박았다.\n\n발록이 피를 토했다.",
            "bodyRaw": "전투가 시작되었다.\n\n발록의 검이 어깨를 가르고 불덩이가 하늘을 뒤덮었다. 무너진 기둥 뒤에서 숨을 고르자 천사가 속삭였다.\n\n— 고통을 없애 주겠다.\n\n순간 상처도 두려움도 사라졌다. 오직 발록을 죽여야 한다는 목적만 남았다.\n\n나는 불길 속으로 뛰어들어 놈의 가슴에 검을 박았다.\n\n발록이 피를 토했다.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "전투가 시작되었다.\n\n발록의 검이 어깨를 가르고 불덩이가 하늘을 뒤덮었다. 무너진 기둥 뒤에서 숨을 고르자 천사가 속삭였다.\n\n— 고통을 없애 주겠다.\n\n순간 상처도 두려움도 사라졌다. 오직 발록을 죽여야 한다는 목적만 남았다.\n\n나는 불길 속으로 뛰어들어 놈의 가슴에 검을 박았다.\n\n발록이 피를 토했다."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 171,
            "sourceByteStart": 0,
            "sourceByteEnd": 407,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "dist06": {
        "zone": "dist06",
        "nextZone": "ep1a07",
        "order": 6,
        "arc": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라 계속 싸우게 만들려는 것이야!!”",
        "tone": "infernal",
        "title": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라 계속 싸우게 만들려는 것이야!!”",
        "mapName": "dist06",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 232,
        "sourceBytes": 572,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-dist06-page-1",
            "label": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라 계속 싸우게 만들려는 것이야!!”",
            "title": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라 계속 싸우게 만들려는 것이야!!”",
            "speaker": "합일몽세 기록",
            "body": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라, 계속 싸우게 만들려는 것이다!”\n\n나는 검을 비틀었다.\n\n발록은 재가 되면서도 웃었다.\n\n“내가 쓰러졌으니 이제 지옥이 열리겠군.”\n\n천사가 소환진을 가리켰다.\n\n— 파괴해. 그러면 모든 고통이 끝난다.\n\n나는 검을 내려쳤다.\n\n소환진이 갈라지고, 세상이 무너졌다.\n\n────────────────────────────────────────",
            "bodyRaw": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라, 계속 싸우게 만들려는 것이다!”\n\n나는 검을 비틀었다.\n\n발록은 재가 되면서도 웃었다.\n\n“내가 쓰러졌으니 이제 지옥이 열리겠군.”\n\n천사가 소환진을 가리켰다.\n\n— 파괴해. 그러면 모든 고통이 끝난다.\n\n나는 검을 내려쳤다.\n\n소환진이 갈라지고, 세상이 무너졌다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라, 계속 싸우게 만들려는 것이다!”\n\n나는 검을 비틀었다.\n\n발록은 재가 되면서도 웃었다.\n\n“내가 쓰러졌으니 이제 지옥이 열리겠군.”\n\n천사가 소환진을 가리켰다.\n\n— 파괴해. 그러면 모든 고통이 끝난다.\n\n나는 검을 내려쳤다.\n\n소환진이 갈라지고, 세상이 무너졌다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 232,
            "sourceByteStart": 0,
            "sourceByteEnd": 572,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1a07": {
        "zone": "ep1a07",
        "nextZone": "ep1a08",
        "order": 7,
        "arc": "【5. 추락】",
        "tone": "infernal",
        "title": "【5. 추락】",
        "mapName": "ep1a07",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 278,
        "sourceBytes": 658,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1a07-page-1",
            "label": "【5. 추락】",
            "title": "【5. 추락】",
            "speaker": "합일몽세 기록",
            "body": "【5. 추락】\n\n검은 소용돌이가 도시를 집어삼켰다.\n\n건물과 시체, 무기와 기둥이 빨려 들어갔다. 검을 땅에 꽂았지만 땅 자체가 무너졌다.\n\n“끝난다고 했잖아!”\n\n— 문이 열렸다. 이제 진짜 세계로 갈 수 있어.\n\n내 몸이 소용돌이로 끌려갔다.\n\n거미동굴.\n\n늪지대.\n\n죽은 동료들.\n\n발록.\n\n기억이 하나씩 부서졌다.\n\n“나는 누구지?”\n\n— 너는 수호자다. 나를 믿어.\n\n그 목소리만 남은 채 나는 어둠으로 추락했다.\n\n────────────────────────────────────────",
            "bodyRaw": "【5. 추락】\n\n검은 소용돌이가 도시를 집어삼켰다.\n\n건물과 시체, 무기와 기둥이 빨려 들어갔다. 검을 땅에 꽂았지만 땅 자체가 무너졌다.\n\n“끝난다고 했잖아!”\n\n— 문이 열렸다. 이제 진짜 세계로 갈 수 있어.\n\n내 몸이 소용돌이로 끌려갔다.\n\n거미동굴.\n\n늪지대.\n\n죽은 동료들.\n\n발록.\n\n기억이 하나씩 부서졌다.\n\n“나는 누구지?”\n\n— 너는 수호자다. 나를 믿어.\n\n그 목소리만 남은 채 나는 어둠으로 추락했다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【5. 추락】\n\n검은 소용돌이가 도시를 집어삼켰다.\n\n건물과 시체, 무기와 기둥이 빨려 들어갔다. 검을 땅에 꽂았지만 땅 자체가 무너졌다.\n\n“끝난다고 했잖아!”\n\n— 문이 열렸다. 이제 진짜 세계로 갈 수 있어.\n\n내 몸이 소용돌이로 끌려갔다.\n\n거미동굴.\n\n늪지대.\n\n죽은 동료들.\n\n발록.\n\n기억이 하나씩 부서졌다.\n\n“나는 누구지?”\n\n— 너는 수호자다. 나를 믿어.\n\n그 목소리만 남은 채 나는 어둠으로 추락했다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 278,
            "sourceByteStart": 0,
            "sourceByteEnd": 658,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1a08": {
        "zone": "ep1a08",
        "nextZone": "ep1a09",
        "order": 8,
        "arc": "【6. 피로 물든 병원】",
        "tone": "infernal",
        "title": "【6. 피로 물든 병원】",
        "mapName": "ep1a08",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 596,
        "sourceBytes": 1414,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1a08-page-1",
            "label": "【6. 피로 물든 병원】",
            "title": "【6. 피로 물든 병원】",
            "speaker": "합일몽세 기록",
            "body": "【6. 피로 물든 병원】\n\n삐―\n\n눈을 뜨자 차가운 형광등과 소독약 냄새가 나를 맞았다. 갑옷 대신 환자복을 입고 있었고, 손목은 침대에 묶여 있었다.\n\n복도 바닥에는 피가 이어졌고 벽에는 붉은 글씨가 적혀 있었다.\n\nHELP ME.\n\n주사기를 든 간호사가 다가왔다.\n\n“움직이지 마세요. 지금 상태가 좋지 않습니다.”\n\n그녀의 피부 아래에서 벌레가 꿈틀거리고 입이 귀밑까지 찢어졌다.\n\n— 저것들은 인간이 아니다.\n\n“다가오지 마!”\n\n간호사의 얼굴이 다시 평범해졌다.\n\n곧 의사가 나타났지만 그의 말은 내 귀에서 “육육육…… 루시퍼…… 복종……”으로 뒤틀렸다.\n\n— 치료라는 말은 함정이다. 저들을 믿으면 영혼을 빼앗긴다.\n\n나는 손목이 상하는 것도 아랑곳하지 않고 고정 장치에서 빠져나와 복도로 달렸다.\n\n그러나 피에서는 피 냄새가 아니라 소독약 냄새가 났다. HELP ME는 가까이서 보니 붉은 크레용이었다.\n\n그 사실을 깨닫는 순간, 복도는 다시 피로 뒤덮였다.\n\n“어느 쪽이 진짜지?”\n\n— 네가 보는 것이 진실이다.\n\n천사의 설명은 모든 모순에 답했다.\n\n그래서 더욱 위험했다.\n\n────────────────────────────────────────",
            "bodyRaw": "【6. 피로 물든 병원】\n\n삐―\n\n눈을 뜨자 차가운 형광등과 소독약 냄새가 나를 맞았다. 갑옷 대신 환자복을 입고 있었고, 손목은 침대에 묶여 있었다.\n\n복도 바닥에는 피가 이어졌고 벽에는 붉은 글씨가 적혀 있었다.\n\nHELP ME.\n\n주사기를 든 간호사가 다가왔다.\n\n“움직이지 마세요. 지금 상태가 좋지 않습니다.”\n\n그녀의 피부 아래에서 벌레가 꿈틀거리고 입이 귀밑까지 찢어졌다.\n\n— 저것들은 인간이 아니다.\n\n“다가오지 마!”\n\n간호사의 얼굴이 다시 평범해졌다.\n\n곧 의사가 나타났지만 그의 말은 내 귀에서 “육육육…… 루시퍼…… 복종……”으로 뒤틀렸다.\n\n— 치료라는 말은 함정이다. 저들을 믿으면 영혼을 빼앗긴다.\n\n나는 손목이 상하는 것도 아랑곳하지 않고 고정 장치에서 빠져나와 복도로 달렸다.\n\n그러나 피에서는 피 냄새가 아니라 소독약 냄새가 났다. HELP ME는 가까이서 보니 붉은 크레용이었다.\n\n그 사실을 깨닫는 순간, 복도는 다시 피로 뒤덮였다.\n\n“어느 쪽이 진짜지?”\n\n— 네가 보는 것이 진실이다.\n\n천사의 설명은 모든 모순에 답했다.\n\n그래서 더욱 위험했다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【6. 피로 물든 병원】\n\n삐―\n\n눈을 뜨자 차가운 형광등과 소독약 냄새가 나를 맞았다. 갑옷 대신 환자복을 입고 있었고, 손목은 침대에 묶여 있었다.\n\n복도 바닥에는 피가 이어졌고 벽에는 붉은 글씨가 적혀 있었다.\n\nHELP ME.\n\n주사기를 든 간호사가 다가왔다.\n\n“움직이지 마세요. 지금 상태가 좋지 않습니다.”\n\n그녀의 피부 아래에서 벌레가 꿈틀거리고 입이 귀밑까지 찢어졌다.\n\n— 저것들은 인간이 아니다.\n\n“다가오지 마!”\n\n간호사의 얼굴이 다시 평범해졌다.\n\n곧 의사가 나타났지만 그의 말은 내 귀에서 “육육육…… 루시퍼…… 복종……”으로 뒤틀렸다.\n\n— 치료라는 말은 함정이다. 저들을 믿으면 영혼을 빼앗긴다.\n\n나는 손목이 상하는 것도 아랑곳하지 않고 고정 장치에서 빠져나와 복도로 달렸다.\n\n그러나 피에서는 피 냄새가 아니라 소독약 냄새가 났다. HELP ME는 가까이서 보니 붉은 크레용이었다.\n\n그 사실을 깨닫는 순간, 복도는 다시 피로 뒤덮였다.\n\n“어느 쪽이 진짜지?”\n\n— 네가 보는 것이 진실이다.\n\n천사의 설명은 모든 모순에 답했다.\n\n그래서 더욱 위험했다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 596,
            "sourceByteStart": 0,
            "sourceByteEnd": 1414,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1a09": {
        "zone": "ep1a09",
        "nextZone": "ep1a10",
        "order": 9,
        "arc": "【7. 주사실】",
        "tone": "infernal",
        "title": "【7. 주사실】",
        "mapName": "ep1a09",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 1026,
        "sourceBytes": 2424,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1a09-page-1",
            "label": "【7. 주사실】",
            "title": "【7. 주사실】",
            "speaker": "합일몽세 기록",
            "body": "【7. 주사실】\n\n손끝이 떨리고 뼛속을 벌레가 기어 다니는 듯했다. 혀가 마르고 온몸이 뒤틀렸다.\n\n복도 끝의 주사실을 보는 순간, 머리보다 몸이 먼저 반응했다.\n\n— 저 안에 성수가 있다.\n\n서랍 깊은 곳에서 약병 하나를 찾았다.\n\nFENTANYL.\n\n어두운 방과 녹슨 숟가락, 쓰러져 있던 사람의 기억이 번쩍였다.\n\n‘한 번만.’\n\n그 목소리는 천사와 닮아 있었다.\n\n“이게 뭐지?”\n\n— 성수다. 고통을 없애 줄 거야.\n\n문밖에서 의사가 외쳤다.\n\n“약품에 손대지 마십시오!”\n\n몸은 약을 원했고, 천사는 그것을 구원이라 불렀다.\n\n이번 한 번만 편해지면 다시 싸울 수 있다.\n\n나는 결국 바늘을 피부에 찔렀다.\n\n고통이 멀어지고 따뜻한 빛이 퍼졌다.\n\n천사가 나를 끌어안았다.\n\n— 잘했어. 이제 다시 기억할 수 있을 거야.\n\n닫혀 있던 기억의 문이 열렸다.\n\n────────────────────────────────────────\n\n【8. 결전의 날】\n\n나는 다시 무너진 도시에 서 있었다.\n\n천사와 악마가 갈라진 하늘에서 쏟아졌고, 수십 명의 수호자가 내 곁에서 싸웠다. 우리는 악마화 나무가 삼켜 버린 황궁 문, 그 너머 초천사의 봉인 앞까지 당도했다.\n\n문틈 너머의 천사는 웃고 있었다.\n\n자비가 아니라, 먹잇감이 덫에 걸리기를 기다리는 미소였다.\n\n그때 발록이 나타났다.\n\n“너는 여기서 끝이다.”\n\n“아니, 끝을 정하는 건 너희가 아니야.”\n\n전투가 절정에 이르자 세계가 겹쳐졌다.\n\n발록의 검은 경찰의 진압봉으로, 불타는 채찍은 구급대원의 팔로 변했다. 시체가 있던 자리에는 주사기와 빈 약봉지가 널려 있었다.\n\n발록의 얼굴이 중년 구급대원으로 바뀌었다.\n\n“우리는 너를 살리려 했어!”\n\n“거짓말!”\n\n“네가 검이라 믿고 휘두른 것은 깨진 주사기였고, 네가 악마라 부른 사람들은 너를 구하러 온 사람들이었다.”\n\n손안의 검이 깨진 유리 조각으로 흔들렸다.\n\n“아니야!”\n\n나는 현실을 향해 검을 휘둘렀다.\n\n모든 것이 하얗게 타올랐다.\n\n────────────────────────────────────────",
            "bodyRaw": "【7. 주사실】\n\n손끝이 떨리고 뼛속을 벌레가 기어 다니는 듯했다. 혀가 마르고 온몸이 뒤틀렸다.\n\n복도 끝의 주사실을 보는 순간, 머리보다 몸이 먼저 반응했다.\n\n— 저 안에 성수가 있다.\n\n서랍 깊은 곳에서 약병 하나를 찾았다.\n\nFENTANYL.\n\n어두운 방과 녹슨 숟가락, 쓰러져 있던 사람의 기억이 번쩍였다.\n\n‘한 번만.’\n\n그 목소리는 천사와 닮아 있었다.\n\n“이게 뭐지?”\n\n— 성수다. 고통을 없애 줄 거야.\n\n문밖에서 의사가 외쳤다.\n\n“약품에 손대지 마십시오!”\n\n몸은 약을 원했고, 천사는 그것을 구원이라 불렀다.\n\n이번 한 번만 편해지면 다시 싸울 수 있다.\n\n나는 결국 바늘을 피부에 찔렀다.\n\n고통이 멀어지고 따뜻한 빛이 퍼졌다.\n\n천사가 나를 끌어안았다.\n\n— 잘했어. 이제 다시 기억할 수 있을 거야.\n\n닫혀 있던 기억의 문이 열렸다.\n\n────────────────────────────────────────\n\n【8. 결전의 날】\n\n나는 다시 무너진 도시에 서 있었다.\n\n천사와 악마가 갈라진 하늘에서 쏟아졌고, 수십 명의 수호자가 내 곁에서 싸웠다. 우리는 악마화 나무가 삼켜 버린 황궁 문, 그 너머 초천사의 봉인 앞까지 당도했다.\n\n문틈 너머의 천사는 웃고 있었다.\n\n자비가 아니라, 먹잇감이 덫에 걸리기를 기다리는 미소였다.\n\n그때 발록이 나타났다.\n\n“너는 여기서 끝이다.”\n\n“아니, 끝을 정하는 건 너희가 아니야.”\n\n전투가 절정에 이르자 세계가 겹쳐졌다.\n\n발록의 검은 경찰의 진압봉으로, 불타는 채찍은 구급대원의 팔로 변했다. 시체가 있던 자리에는 주사기와 빈 약봉지가 널려 있었다.\n\n발록의 얼굴이 중년 구급대원으로 바뀌었다.\n\n“우리는 너를 살리려 했어!”\n\n“거짓말!”\n\n“네가 검이라 믿고 휘두른 것은 깨진 주사기였고, 네가 악마라 부른 사람들은 너를 구하러 온 사람들이었다.”\n\n손안의 검이 깨진 유리 조각으로 흔들렸다.\n\n“아니야!”\n\n나는 현실을 향해 검을 휘둘렀다.\n\n모든 것이 하얗게 타올랐다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【7. 주사실】\n\n손끝이 떨리고 뼛속을 벌레가 기어 다니는 듯했다. 혀가 마르고 온몸이 뒤틀렸다.\n\n복도 끝의 주사실을 보는 순간, 머리보다 몸이 먼저 반응했다.\n\n— 저 안에 성수가 있다.\n\n서랍 깊은 곳에서 약병 하나를 찾았다.\n\nFENTANYL.\n\n어두운 방과 녹슨 숟가락, 쓰러져 있던 사람의 기억이 번쩍였다.\n\n‘한 번만.’\n\n그 목소리는 천사와 닮아 있었다.\n\n“이게 뭐지?”\n\n— 성수다. 고통을 없애 줄 거야.\n\n문밖에서 의사가 외쳤다.\n\n“약품에 손대지 마십시오!”\n\n몸은 약을 원했고, 천사는 그것을 구원이라 불렀다.\n\n이번 한 번만 편해지면 다시 싸울 수 있다.\n\n나는 결국 바늘을 피부에 찔렀다.\n\n고통이 멀어지고 따뜻한 빛이 퍼졌다.\n\n천사가 나를 끌어안았다.\n\n— 잘했어. 이제 다시 기억할 수 있을 거야.\n\n닫혀 있던 기억의 문이 열렸다.\n\n────────────────────────────────────────\n\n【8. 결전의 날】\n\n나는 다시 무너진 도시에 서 있었다.\n\n천사와 악마가 갈라진 하늘에서 쏟아졌고, 수십 명의 수호자가 내 곁에서 싸웠다. 우리는 악마화 나무가 삼켜 버린 황궁 문, 그 너머 초천사의 봉인 앞까지 당도했다.\n\n문틈 너머의 천사는 웃고 있었다.\n\n자비가 아니라, 먹잇감이 덫에 걸리기를 기다리는 미소였다.\n\n그때 발록이 나타났다.\n\n“너는 여기서 끝이다.”\n\n“아니, 끝을 정하는 건 너희가 아니야.”\n\n전투가 절정에 이르자 세계가 겹쳐졌다.\n\n발록의 검은 경찰의 진압봉으로, 불타는 채찍은 구급대원의 팔로 변했다. 시체가 있던 자리에는 주사기와 빈 약봉지가 널려 있었다.\n\n발록의 얼굴이 중년 구급대원으로 바뀌었다.\n\n“우리는 너를 살리려 했어!”\n\n“거짓말!”\n\n“네가 검이라 믿고 휘두른 것은 깨진 주사기였고, 네가 악마라 부른 사람들은 너를 구하러 온 사람들이었다.”\n\n손안의 검이 깨진 유리 조각으로 흔들렸다.\n\n“아니야!”\n\n나는 현실을 향해 검을 휘둘렀다.\n\n모든 것이 하얗게 타올랐다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 1026,
            "sourceByteStart": 0,
            "sourceByteEnd": 2424,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1a10": {
        "zone": "ep1a10",
        "nextZone": "ep1a11",
        "order": 10,
        "arc": "【9. 환자】",
        "tone": "infernal",
        "title": "【9. 환자】",
        "mapName": "ep1a10",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 977,
        "sourceBytes": 2299,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1a10-page-1",
            "label": "【9. 환자】",
            "title": "【9. 환자】",
            "speaker": "합일몽세 기록",
            "body": "【9. 환자】\n\n나는 주사실 바닥에서 깨어났다.\n\n의사와 간호사가 호흡을 확인하고 해독 처치를 준비하고 있었다. 시선 끝에 차트가 보였다.\n\n오피오이드 사용장애.\n\n펜타닐 의존증.\n\n약물 유발 정신병적 증상 의심.\n\n“나는 수호자다.”\n\n의사가 물었다.\n\n“성함을 말씀하실 수 있겠습니까?”\n\n입을 열었지만 이름이 나오지 않았다.\n\n수호자. 에고. 마지막 인간.\n\n어느 것도 내 이름이 아니었다.\n\n“나는 누구지?”\n\n“치료 중인 환자입니다.”\n\n— 거짓말이다. 너는 선택받은 존재다.\n\n그러나 이상했다.\n\n천사의 목소리를 들을 때마다 몸은 약을 원했다. 의사가 치료를 말하면 천사는 분노했고, 내가 현실을 의심할수록 나를 칭찬했다.\n\n— 그래. 너만이 진실을 안다.\n\n그 말은 나를 특별하게 만들었다.\n\n동시에 완전히 혼자로 만들었다.\n\n────────────────────────────────────────\n\n【10. 중독의 도시】\n\n다시 눈을 떴을 때, 나는 주사기가 달빛을 반사하는 폐허에 서 있었다.\n\n벽마다 내가 했던 말이 적혀 있었다.\n\n나는 다르다.\n\n마음만 먹으면 끊을 수 있다.\n\n이번 한 번뿐이다.\n\n거리 끝에는 수많은 내가 죽어 있었다. 처음 약을 사용한 나, 더 강한 자극을 찾은 나, 충고를 비웃고 거짓말한 나.\n\n그제야 알았다.\n\n이 도시는 외부의 악마가 아니라 내 오만과 호기심이 만들었다.\n\n내 목숨을 가장 값싸게 취급한 사람도 나였다.\n\n“나는 수호자가 아니야.”\n\n— 아니야. 너는 선택받았다.\n\n“나는 중독된 환자일 뿐이야.”\n\n— 입 닥쳐!\n\n처음으로 천사의 목소리가 갈라졌다.\n\n나는 폐허에 무릎을 꿇었다.\n\n“잘못을 하며 살아왔어. 하지만 아직 살아 있어. 그러니 도움을 청할 수 있어!”\n\n병원 복도의 빛이 켜졌다.\n\n“저를 치료해 주세요. 부탁드립니다.”\n\n도시가 흔들렸다.\n\n천사의 이마에 검은 숫자가 떠올랐다.\n\n666.\n\n────────────────────────────────────────",
            "bodyRaw": "【9. 환자】\n\n나는 주사실 바닥에서 깨어났다.\n\n의사와 간호사가 호흡을 확인하고 해독 처치를 준비하고 있었다. 시선 끝에 차트가 보였다.\n\n오피오이드 사용장애.\n\n펜타닐 의존증.\n\n약물 유발 정신병적 증상 의심.\n\n“나는 수호자다.”\n\n의사가 물었다.\n\n“성함을 말씀하실 수 있겠습니까?”\n\n입을 열었지만 이름이 나오지 않았다.\n\n수호자. 에고. 마지막 인간.\n\n어느 것도 내 이름이 아니었다.\n\n“나는 누구지?”\n\n“치료 중인 환자입니다.”\n\n— 거짓말이다. 너는 선택받은 존재다.\n\n그러나 이상했다.\n\n천사의 목소리를 들을 때마다 몸은 약을 원했다. 의사가 치료를 말하면 천사는 분노했고, 내가 현실을 의심할수록 나를 칭찬했다.\n\n— 그래. 너만이 진실을 안다.\n\n그 말은 나를 특별하게 만들었다.\n\n동시에 완전히 혼자로 만들었다.\n\n────────────────────────────────────────\n\n【10. 중독의 도시】\n\n다시 눈을 떴을 때, 나는 주사기가 달빛을 반사하는 폐허에 서 있었다.\n\n벽마다 내가 했던 말이 적혀 있었다.\n\n나는 다르다.\n\n마음만 먹으면 끊을 수 있다.\n\n이번 한 번뿐이다.\n\n거리 끝에는 수많은 내가 죽어 있었다. 처음 약을 사용한 나, 더 강한 자극을 찾은 나, 충고를 비웃고 거짓말한 나.\n\n그제야 알았다.\n\n이 도시는 외부의 악마가 아니라 내 오만과 호기심이 만들었다.\n\n내 목숨을 가장 값싸게 취급한 사람도 나였다.\n\n“나는 수호자가 아니야.”\n\n— 아니야. 너는 선택받았다.\n\n“나는 중독된 환자일 뿐이야.”\n\n— 입 닥쳐!\n\n처음으로 천사의 목소리가 갈라졌다.\n\n나는 폐허에 무릎을 꿇었다.\n\n“잘못을 하며 살아왔어. 하지만 아직 살아 있어. 그러니 도움을 청할 수 있어!”\n\n병원 복도의 빛이 켜졌다.\n\n“저를 치료해 주세요. 부탁드립니다.”\n\n도시가 흔들렸다.\n\n천사의 이마에 검은 숫자가 떠올랐다.\n\n666.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【9. 환자】\n\n나는 주사실 바닥에서 깨어났다.\n\n의사와 간호사가 호흡을 확인하고 해독 처치를 준비하고 있었다. 시선 끝에 차트가 보였다.\n\n오피오이드 사용장애.\n\n펜타닐 의존증.\n\n약물 유발 정신병적 증상 의심.\n\n“나는 수호자다.”\n\n의사가 물었다.\n\n“성함을 말씀하실 수 있겠습니까?”\n\n입을 열었지만 이름이 나오지 않았다.\n\n수호자. 에고. 마지막 인간.\n\n어느 것도 내 이름이 아니었다.\n\n“나는 누구지?”\n\n“치료 중인 환자입니다.”\n\n— 거짓말이다. 너는 선택받은 존재다.\n\n그러나 이상했다.\n\n천사의 목소리를 들을 때마다 몸은 약을 원했다. 의사가 치료를 말하면 천사는 분노했고, 내가 현실을 의심할수록 나를 칭찬했다.\n\n— 그래. 너만이 진실을 안다.\n\n그 말은 나를 특별하게 만들었다.\n\n동시에 완전히 혼자로 만들었다.\n\n────────────────────────────────────────\n\n【10. 중독의 도시】\n\n다시 눈을 떴을 때, 나는 주사기가 달빛을 반사하는 폐허에 서 있었다.\n\n벽마다 내가 했던 말이 적혀 있었다.\n\n나는 다르다.\n\n마음만 먹으면 끊을 수 있다.\n\n이번 한 번뿐이다.\n\n거리 끝에는 수많은 내가 죽어 있었다. 처음 약을 사용한 나, 더 강한 자극을 찾은 나, 충고를 비웃고 거짓말한 나.\n\n그제야 알았다.\n\n이 도시는 외부의 악마가 아니라 내 오만과 호기심이 만들었다.\n\n내 목숨을 가장 값싸게 취급한 사람도 나였다.\n\n“나는 수호자가 아니야.”\n\n— 아니야. 너는 선택받았다.\n\n“나는 중독된 환자일 뿐이야.”\n\n— 입 닥쳐!\n\n처음으로 천사의 목소리가 갈라졌다.\n\n나는 폐허에 무릎을 꿇었다.\n\n“잘못을 하며 살아왔어. 하지만 아직 살아 있어. 그러니 도움을 청할 수 있어!”\n\n병원 복도의 빛이 켜졌다.\n\n“저를 치료해 주세요. 부탁드립니다.”\n\n도시가 흔들렸다.\n\n천사의 이마에 검은 숫자가 떠올랐다.\n\n666.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 977,
            "sourceByteStart": 0,
            "sourceByteEnd": 2299,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1a11": {
        "zone": "ep1a11",
        "nextZone": "dreamRest",
        "order": 11,
        "arc": "【11. 천사의 가면】",
        "tone": "infernal",
        "title": "【11. 천사의 가면】",
        "mapName": "ep1a11",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 1873,
        "sourceBytes": 4351,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1a11-page-1",
            "label": "【11. 천사의 가면】",
            "title": "【11. 천사의 가면】",
            "speaker": "합일몽세 기록",
            "body": "【11. 천사의 가면】\n\n“네가 최초의 악마였군.”\n\n천사는 웃었다.\n\n— 아니, 나는 너를 지켜 왔다.\n\n“너는 내가 치료받는 것을 막았고, 사람을 믿지 못하게 했으며, 마약을 성수라고 불렀어.”\n\n— 그래서 고통에서 벗어나게 해 주었잖아.\n\n“대신 악마에 가까워지게 했지.”\n\n흰 날개가 검게 물들고 머리에서 뿔이 솟았다.\n\n그것은 완벽해야 한다고 몰아붙이고, 실패한 나를 벌하며, 도움을 청하는 일을 수치로 만들던 목소리였다.\n\n나의 초자아(Super Ego)를 잠식한 악마.\n\n“루시퍼.”\n\n가면이 갈라지자 오만하고 두려워하며 죄책감에 짓눌린 수천 개의 내 얼굴이 나타났다.\n\n“내가 없으면 너는 아무것도 아니다. 평범한 중독자를 마지막 수호자로 만든 건 나다.”\n\n“그건 거짓된 의미였어.”\n\n루시퍼는 병원 침대 위에서 경련하고 약을 달라 애원하는 나를 보여 주었다.\n\n“이것이 네 진실이다. 초라하고 더럽고 나약하지.”\n\n나는 외면하지 않았다.\n\n“그래. 저것도 나다. 하지만 그게 전부는 아니야.”\n\n검은 검이 가슴을 관통했다. 루시퍼가 익숙한 말을 속삭였다.\n\n“한 번이면 된다. 이번 한 번만 편해지면 되는 거야.”\n\n나는 피 흘리는 손으로 검날을 붙잡았다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\n검을 뽑자 병원의 창문에 하나씩 불이 켜졌다.\n\n“나는 다시 실패하겠지…… 하지만 몇 번이고 넘어져도, 다시 선을 선택하며 일어나면 돼.”\n\n루시퍼가 비명을 질렀다.\n\n“너는 나를 영원히 없앨 수 없어!”\n\n“알고 있어. 너는 갈망과 오만, 수치심으로 언제나 다시 돌아오겠지.”\n\n손바닥에서 빛나는 인장이 피어났다.\n\n“그때마다 나는 선(J)을 선택할 거야.”\n\n인장이 루시퍼의 가슴에 박혔다.\n\n빛 속에서 악마가 물었다.\n\n“네가 이겼다고 생각하나?”\n\n“아니. 내가 이기는 게 아니야. 선(J)이 언제나 승리할 뿐이지.”\n\n────────────────────────────────────────\n\n【12. 의목사 후보생】\n\n병원에서 다시 눈을 떴을 때, 복도에는 피도 붉은 글씨도 없었다.\n\n",
            "bodyRaw": "【11. 천사의 가면】\n\n“네가 최초의 악마였군.”\n\n천사는 웃었다.\n\n— 아니, 나는 너를 지켜 왔다.\n\n“너는 내가 치료받는 것을 막았고, 사람을 믿지 못하게 했으며, 마약을 성수라고 불렀어.”\n\n— 그래서 고통에서 벗어나게 해 주었잖아.\n\n“대신 악마에 가까워지게 했지.”\n\n흰 날개가 검게 물들고 머리에서 뿔이 솟았다.\n\n그것은 완벽해야 한다고 몰아붙이고, 실패한 나를 벌하며, 도움을 청하는 일을 수치로 만들던 목소리였다.\n\n나의 초자아(Super Ego)를 잠식한 악마.\n\n“루시퍼.”\n\n가면이 갈라지자 오만하고 두려워하며 죄책감에 짓눌린 수천 개의 내 얼굴이 나타났다.\n\n“내가 없으면 너는 아무것도 아니다. 평범한 중독자를 마지막 수호자로 만든 건 나다.”\n\n“그건 거짓된 의미였어.”\n\n루시퍼는 병원 침대 위에서 경련하고 약을 달라 애원하는 나를 보여 주었다.\n\n“이것이 네 진실이다. 초라하고 더럽고 나약하지.”\n\n나는 외면하지 않았다.\n\n“그래. 저것도 나다. 하지만 그게 전부는 아니야.”\n\n검은 검이 가슴을 관통했다. 루시퍼가 익숙한 말을 속삭였다.\n\n“한 번이면 된다. 이번 한 번만 편해지면 되는 거야.”\n\n나는 피 흘리는 손으로 검날을 붙잡았다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\n검을 뽑자 병원의 창문에 하나씩 불이 켜졌다.\n\n“나는 다시 실패하겠지…… 하지만 몇 번이고 넘어져도, 다시 선을 선택하며 일어나면 돼.”\n\n루시퍼가 비명을 질렀다.\n\n“너는 나를 영원히 없앨 수 없어!”\n\n“알고 있어. 너는 갈망과 오만, 수치심으로 언제나 다시 돌아오겠지.”\n\n손바닥에서 빛나는 인장이 피어났다.\n\n“그때마다 나는 선(J)을 선택할 거야.”\n\n인장이 루시퍼의 가슴에 박혔다.\n\n빛 속에서 악마가 물었다.\n\n“네가 이겼다고 생각하나?”\n\n“아니. 내가 이기는 게 아니야. 선(J)이 언제나 승리할 뿐이지.”\n\n────────────────────────────────────────\n\n【12. 의목사 후보생】\n\n병원에서 다시 눈을 떴을 때, 복도에는 피도 붉은 글씨도 없었다.\n\n",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【11. 천사의 가면】\n\n“네가 최초의 악마였군.”\n\n천사는 웃었다.\n\n— 아니, 나는 너를 지켜 왔다.\n\n“너는 내가 치료받는 것을 막았고, 사람을 믿지 못하게 했으며, 마약을 성수라고 불렀어.”\n\n— 그래서 고통에서 벗어나게 해 주었잖아.\n\n“대신 악마에 가까워지게 했지.”\n\n흰 날개가 검게 물들고 머리에서 뿔이 솟았다.\n\n그것은 완벽해야 한다고 몰아붙이고, 실패한 나를 벌하며, 도움을 청하는 일을 수치로 만들던 목소리였다.\n\n나의 초자아(Super Ego)를 잠식한 악마.\n\n“루시퍼.”\n\n가면이 갈라지자 오만하고 두려워하며 죄책감에 짓눌린 수천 개의 내 얼굴이 나타났다.\n\n“내가 없으면 너는 아무것도 아니다. 평범한 중독자를 마지막 수호자로 만든 건 나다.”\n\n“그건 거짓된 의미였어.”\n\n루시퍼는 병원 침대 위에서 경련하고 약을 달라 애원하는 나를 보여 주었다.\n\n“이것이 네 진실이다. 초라하고 더럽고 나약하지.”\n\n나는 외면하지 않았다.\n\n“그래. 저것도 나다. 하지만 그게 전부는 아니야.”\n\n검은 검이 가슴을 관통했다. 루시퍼가 익숙한 말을 속삭였다.\n\n“한 번이면 된다. 이번 한 번만 편해지면 되는 거야.”\n\n나는 피 흘리는 손으로 검날을 붙잡았다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\n검을 뽑자 병원의 창문에 하나씩 불이 켜졌다.\n\n“나는 다시 실패하겠지…… 하지만 몇 번이고 넘어져도, 다시 선을 선택하며 일어나면 돼.”\n\n루시퍼가 비명을 질렀다.\n\n“너는 나를 영원히 없앨 수 없어!”\n\n“알고 있어. 너는 갈망과 오만, 수치심으로 언제나 다시 돌아오겠지.”\n\n손바닥에서 빛나는 인장이 피어났다.\n\n“그때마다 나는 선(J)을 선택할 거야.”\n\n인장이 루시퍼의 가슴에 박혔다.\n\n빛 속에서 악마가 물었다.\n\n“네가 이겼다고 생각하나?”\n\n“아니. 내가 이기는 게 아니야. 선(J)이 언제나 승리할 뿐이지.”\n\n────────────────────────────────────────\n\n【12. 의목사 후보생】\n\n병원에서 다시 눈을 떴을 때, 복도에는 피도 붉은 글씨도 없었다.\n\n"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 1034,
            "sourceByteStart": 0,
            "sourceByteEnd": 2428,
            "page": 1,
            "pages": 2
          },
          {
            "id": "v31300-ep1a11-page-2",
            "label": "【11. 천사의 가면】",
            "title": "【11. 천사의 가면】",
            "speaker": "합일몽세 기록",
            "body": "침대 옆에는 검은 성직복 위에 흰 가운을 입은 남자가 앉아 있었다. 십자가와 청진기, 오래된 은제 인장은 서로 어울리지 않을 듯하면서도 이상하리만치 한 몸처럼 보였다.\n\n“의사이신가요?”\n\n“의사이기도 하고, 목사이기도 합니다. 교단에서는 의목사라고 부르지요.”\n\n그는 세상이 세 층으로 나뉜다고 설명했다.\n\n인간이 살아가는 현세.\n\n정신과 무의식이 펼쳐지는 몽세.\n\n선과 악의 본질이 존재하는 내세.\n\n“현세에서 본 것은 환각이지만, 몽세에서는 실제로 일어난 일입니다. 악은 현세에 직접 개입하지 못해도 몽세를 통해 인간을 흔들 수 있지요.”\n\n“루시퍼는 사라졌습니까?”\n\n“잠시 물러났을 뿐입니다. 영적 전쟁은 살아 있는 동안 끝나지 않습니다.”\n\n“제 안에는 악마가 몇이나 남았습니까?”\n\n그가 잠시 생각하는 척했다.\n\n“전승을 따르면 일흔두 개쯤 되겠군요.”\n\n치료는 오래 이어졌다. 열이 오르고 몸이 떨렸으며, 잠들 때마다 천사의 목소리가 돌아왔다. 그럴 때마다 나는 호출 버튼을 눌렀다.\n\n혼자가 되지 않는 쪽을 선택했다.\n\n마침내 의목사는 지하 예배당으로 내려가는 문을 열었다.\n\n“차트에는 저를 뭐라고 적었습니까?”\n\n“지금까지는 환자로 적혀 있겠네요.”\n\n그가 나를 바라보았다.\n\n“하지만 끝까지 치료를 선택한다면 다시 의목사 후보생이 될 수 있겠지요.”\n\n엘리베이터 아래에는 신경 전극과 일흔두 개의 금속 인장으로 둘러싸인 거대한 장치가 기다리고 있었다.\n\n나는 그 안으로 한 걸음 들어섰다.\n\n그날부터 나의 악몽은 더 이상 나만의 것이 아니었다.\n\n에피소드 1-A 끝.\n\n============================================================",
            "bodyRaw": "침대 옆에는 검은 성직복 위에 흰 가운을 입은 남자가 앉아 있었다. 십자가와 청진기, 오래된 은제 인장은 서로 어울리지 않을 듯하면서도 이상하리만치 한 몸처럼 보였다.\n\n“의사이신가요?”\n\n“의사이기도 하고, 목사이기도 합니다. 교단에서는 의목사라고 부르지요.”\n\n그는 세상이 세 층으로 나뉜다고 설명했다.\n\n인간이 살아가는 현세.\n\n정신과 무의식이 펼쳐지는 몽세.\n\n선과 악의 본질이 존재하는 내세.\n\n“현세에서 본 것은 환각이지만, 몽세에서는 실제로 일어난 일입니다. 악은 현세에 직접 개입하지 못해도 몽세를 통해 인간을 흔들 수 있지요.”\n\n“루시퍼는 사라졌습니까?”\n\n“잠시 물러났을 뿐입니다. 영적 전쟁은 살아 있는 동안 끝나지 않습니다.”\n\n“제 안에는 악마가 몇이나 남았습니까?”\n\n그가 잠시 생각하는 척했다.\n\n“전승을 따르면 일흔두 개쯤 되겠군요.”\n\n치료는 오래 이어졌다. 열이 오르고 몸이 떨렸으며, 잠들 때마다 천사의 목소리가 돌아왔다. 그럴 때마다 나는 호출 버튼을 눌렀다.\n\n혼자가 되지 않는 쪽을 선택했다.\n\n마침내 의목사는 지하 예배당으로 내려가는 문을 열었다.\n\n“차트에는 저를 뭐라고 적었습니까?”\n\n“지금까지는 환자로 적혀 있겠네요.”\n\n그가 나를 바라보았다.\n\n“하지만 끝까지 치료를 선택한다면 다시 의목사 후보생이 될 수 있겠지요.”\n\n엘리베이터 아래에는 신경 전극과 일흔두 개의 금속 인장으로 둘러싸인 거대한 장치가 기다리고 있었다.\n\n나는 그 안으로 한 걸음 들어섰다.\n\n그날부터 나의 악몽은 더 이상 나만의 것이 아니었다.\n\n에피소드 1-A 끝.\n\n============================================================",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "침대 옆에는 검은 성직복 위에 흰 가운을 입은 남자가 앉아 있었다. 십자가와 청진기, 오래된 은제 인장은 서로 어울리지 않을 듯하면서도 이상하리만치 한 몸처럼 보였다.\n\n“의사이신가요?”\n\n“의사이기도 하고, 목사이기도 합니다. 교단에서는 의목사라고 부르지요.”\n\n그는 세상이 세 층으로 나뉜다고 설명했다.\n\n인간이 살아가는 현세.\n\n정신과 무의식이 펼쳐지는 몽세.\n\n선과 악의 본질이 존재하는 내세.\n\n“현세에서 본 것은 환각이지만, 몽세에서는 실제로 일어난 일입니다. 악은 현세에 직접 개입하지 못해도 몽세를 통해 인간을 흔들 수 있지요.”\n\n“루시퍼는 사라졌습니까?”\n\n“잠시 물러났을 뿐입니다. 영적 전쟁은 살아 있는 동안 끝나지 않습니다.”\n\n“제 안에는 악마가 몇이나 남았습니까?”\n\n그가 잠시 생각하는 척했다.\n\n“전승을 따르면 일흔두 개쯤 되겠군요.”\n\n치료는 오래 이어졌다. 열이 오르고 몸이 떨렸으며, 잠들 때마다 천사의 목소리가 돌아왔다. 그럴 때마다 나는 호출 버튼을 눌렀다.\n\n혼자가 되지 않는 쪽을 선택했다.\n\n마침내 의목사는 지하 예배당으로 내려가는 문을 열었다.\n\n“차트에는 저를 뭐라고 적었습니까?”\n\n“지금까지는 환자로 적혀 있겠네요.”\n\n그가 나를 바라보았다.\n\n“하지만 끝까지 치료를 선택한다면 다시 의목사 후보생이 될 수 있겠지요.”\n\n엘리베이터 아래에는 신경 전극과 일흔두 개의 금속 인장으로 둘러싸인 거대한 장치가 기다리고 있었다.\n\n나는 그 안으로 한 걸음 들어섰다.\n\n그날부터 나의 악몽은 더 이상 나만의 것이 아니었다.\n\n에피소드 1-A 끝.\n\n============================================================"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 1034,
            "sourceEnd": 1873,
            "sourceByteStart": 2428,
            "sourceByteEnd": 4351,
            "page": 2,
            "pages": 2
          }
        ]
      },
      "dreamRest": {
        "zone": "dreamRest",
        "nextZone": "ep1b01",
        "order": 12,
        "arc": "제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀",
        "tone": "infernal",
        "title": "제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀",
        "mapName": "dreamRest",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 252,
        "sourceBytes": 512,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-dreamRest-page-1",
            "label": "제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀",
            "title": "제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀",
            "speaker": "합일몽세 기록",
            "body": "악몽이 잠잠해지자 병원 상담실을 닮은 쉼터가 나타났다.\n\n흰 가운에 비대칭 문양을 두른 여자가 상처를 살폈다.\n\n“맥박과 동공 반응은 정상이네요.”\n\n그녀는 자신이 왜 그런 말을 먼저 했는지 모르는 표정이었다.\n\n“미카엘라예요. 의목사 교단에 오기 전의 일은 잘 기억나지 않아요.”\n\n제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀\n============================================================",
            "bodyRaw": "악몽이 잠잠해지자 병원 상담실을 닮은 쉼터가 나타났다.\n\n흰 가운에 비대칭 문양을 두른 여자가 상처를 살폈다.\n\n“맥박과 동공 반응은 정상이네요.”\n\n그녀는 자신이 왜 그런 말을 먼저 했는지 모르는 표정이었다.\n\n“미카엘라예요. 의목사 교단에 오기 전의 일은 잘 기억나지 않아요.”\n\n제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀\n============================================================",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "악몽이 잠잠해지자 병원 상담실을 닮은 쉼터가 나타났다.\n\n흰 가운에 비대칭 문양을 두른 여자가 상처를 살폈다.\n\n“맥박과 동공 반응은 정상이네요.”\n\n그녀는 자신이 왜 그런 말을 먼저 했는지 모르는 표정이었다.\n\n“미카엘라예요. 의목사 교단에 오기 전의 일은 잘 기억나지 않아요.”\n\n제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀\n============================================================"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 252,
            "sourceByteStart": 0,
            "sourceByteEnd": 512,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1b01": {
        "zone": "ep1b01",
        "nextZone": "ep1b02",
        "order": 13,
        "arc": "【1. 솔로몬의 봉인식】",
        "tone": "infernal",
        "title": "【1. 솔로몬의 봉인식】",
        "mapName": "ep1b01",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 802,
        "sourceBytes": 1944,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1b01-page-1",
            "label": "【1. 솔로몬의 봉인식】",
            "title": "【1. 솔로몬의 봉인식】",
            "speaker": "합일몽세 기록",
            "body": "【1. 솔로몬의 봉인식】\n\n지하 예배당의 장치는 환각과 악몽, 억압된 기억을 신경 데이터로 추출해 가상세계로 재구성했다.\n\n공식 명칭은 ‘몽세 동조형 정신재구성 장치’.\n\n사람들은 간단히 ‘메타버스 하이테크 축귀 시스템’이라고 불렀다.\n\n“이름을 지은 사람은 해고되지 않았습니까?”\n\n“교단 원로입니다.”\n\n“아주 경건한 이름이군요.”\n\n마지막 관문은 타인의 마음이 아니라 내 안에 남은 문을 닫는 일이었다.\n\n접속과 함께 검은 바다가 갈라졌다. 트라우마와 약물 의존, 죄책감과 망상이 일흔두 악마의 이름을 빌려 솟아올랐다.\n\n“다시 영웅이 되고 싶지 않나?”\n\n“영웅이 아니어도 살아갈 수 있다는 걸 배웠다.”\n\n“한 번만 편해져라.”\n\n“편안함과 회복은 다르다.”\n\n“나는 너다.”\n\n“너는 나의 일부일 뿐, 전부가 아니다.”\n\n인장이 하나씩 닫히며 비대해진 몽세가 제자리로 수축했다.\n\n봉인은 악마를 도려내는 일이 아니었다. 악마의 이름을 알아보고, 그것이 현실의 문을 마음대로 열지 못하도록 경계를 세우는 일이었다.\n\n일흔두 번째 봉인이 닫혔다.\n\n“이제 다른 사람의 문도 닫을 수 있겠습니까?”\n\n담당 의목사가 말했다.\n\n“대신 닫아 줄 수는 없습니다. 문 앞까지 함께 걸어갈 수 있을 뿐이지요.”\n\n그날 나는 후보생의 이름을 벗고, 신경과학과 의례, 상담과 전투를 함께 다루는 최초의 실전형 하이테크 의목사가 되었다.\n\n그리고 첫 임무에서 일곱 사람의 몽세가 정체불명의 검은 신호로 연결되어 있음을 발견했다.\n\n누군가가 그들의 악몽을 듣고 있었다.\n\n────────────────────────────────────────",
            "bodyRaw": "【1. 솔로몬의 봉인식】\n\n지하 예배당의 장치는 환각과 악몽, 억압된 기억을 신경 데이터로 추출해 가상세계로 재구성했다.\n\n공식 명칭은 ‘몽세 동조형 정신재구성 장치’.\n\n사람들은 간단히 ‘메타버스 하이테크 축귀 시스템’이라고 불렀다.\n\n“이름을 지은 사람은 해고되지 않았습니까?”\n\n“교단 원로입니다.”\n\n“아주 경건한 이름이군요.”\n\n마지막 관문은 타인의 마음이 아니라 내 안에 남은 문을 닫는 일이었다.\n\n접속과 함께 검은 바다가 갈라졌다. 트라우마와 약물 의존, 죄책감과 망상이 일흔두 악마의 이름을 빌려 솟아올랐다.\n\n“다시 영웅이 되고 싶지 않나?”\n\n“영웅이 아니어도 살아갈 수 있다는 걸 배웠다.”\n\n“한 번만 편해져라.”\n\n“편안함과 회복은 다르다.”\n\n“나는 너다.”\n\n“너는 나의 일부일 뿐, 전부가 아니다.”\n\n인장이 하나씩 닫히며 비대해진 몽세가 제자리로 수축했다.\n\n봉인은 악마를 도려내는 일이 아니었다. 악마의 이름을 알아보고, 그것이 현실의 문을 마음대로 열지 못하도록 경계를 세우는 일이었다.\n\n일흔두 번째 봉인이 닫혔다.\n\n“이제 다른 사람의 문도 닫을 수 있겠습니까?”\n\n담당 의목사가 말했다.\n\n“대신 닫아 줄 수는 없습니다. 문 앞까지 함께 걸어갈 수 있을 뿐이지요.”\n\n그날 나는 후보생의 이름을 벗고, 신경과학과 의례, 상담과 전투를 함께 다루는 최초의 실전형 하이테크 의목사가 되었다.\n\n그리고 첫 임무에서 일곱 사람의 몽세가 정체불명의 검은 신호로 연결되어 있음을 발견했다.\n\n누군가가 그들의 악몽을 듣고 있었다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【1. 솔로몬의 봉인식】\n\n지하 예배당의 장치는 환각과 악몽, 억압된 기억을 신경 데이터로 추출해 가상세계로 재구성했다.\n\n공식 명칭은 ‘몽세 동조형 정신재구성 장치’.\n\n사람들은 간단히 ‘메타버스 하이테크 축귀 시스템’이라고 불렀다.\n\n“이름을 지은 사람은 해고되지 않았습니까?”\n\n“교단 원로입니다.”\n\n“아주 경건한 이름이군요.”\n\n마지막 관문은 타인의 마음이 아니라 내 안에 남은 문을 닫는 일이었다.\n\n접속과 함께 검은 바다가 갈라졌다. 트라우마와 약물 의존, 죄책감과 망상이 일흔두 악마의 이름을 빌려 솟아올랐다.\n\n“다시 영웅이 되고 싶지 않나?”\n\n“영웅이 아니어도 살아갈 수 있다는 걸 배웠다.”\n\n“한 번만 편해져라.”\n\n“편안함과 회복은 다르다.”\n\n“나는 너다.”\n\n“너는 나의 일부일 뿐, 전부가 아니다.”\n\n인장이 하나씩 닫히며 비대해진 몽세가 제자리로 수축했다.\n\n봉인은 악마를 도려내는 일이 아니었다. 악마의 이름을 알아보고, 그것이 현실의 문을 마음대로 열지 못하도록 경계를 세우는 일이었다.\n\n일흔두 번째 봉인이 닫혔다.\n\n“이제 다른 사람의 문도 닫을 수 있겠습니까?”\n\n담당 의목사가 말했다.\n\n“대신 닫아 줄 수는 없습니다. 문 앞까지 함께 걸어갈 수 있을 뿐이지요.”\n\n그날 나는 후보생의 이름을 벗고, 신경과학과 의례, 상담과 전투를 함께 다루는 최초의 실전형 하이테크 의목사가 되었다.\n\n그리고 첫 임무에서 일곱 사람의 몽세가 정체불명의 검은 신호로 연결되어 있음을 발견했다.\n\n누군가가 그들의 악몽을 듣고 있었다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 802,
            "sourceByteStart": 0,
            "sourceByteEnd": 1944,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1b02": {
        "zone": "ep1b02",
        "nextZone": "ep1b03",
        "order": 14,
        "arc": "【2. 나태의 집】",
        "tone": "infernal",
        "title": "【2. 나태의 집】",
        "mapName": "ep1b02",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 758,
        "sourceBytes": 1816,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1b02-page-1",
            "label": "【2. 나태의 집】",
            "title": "【2. 나태의 집】",
            "speaker": "합일몽세 기록",
            "body": "【2. 나태의 집】\n\n첫 대상의 집은 현관부터 썩어 가고 있었다. 음식물과 페트병, 쓰레기봉투가 거실을 메웠고, 창문은 검은 비닐로 막혀 있었다.\n\n남자는 그 한가운데 누워 있었다.\n\n“일어나실 수 있겠습니까?”\n\n“일어나서 뭐 하죠? 아무것도 달라지지 않는데.”\n\n“누워 있으면 뭐 달라집니까?”\n\n몽세 속 남자는 쓰레기 산을 등에 붙인 거대한 반인반요였다. 냉장고와 소파, 썩은 침대가 날아왔다.\n\n그가 던지는 것은 물건이 아니라 미뤄 둔 시간이었다.\n\n끊어진 관계, 읽지 않은 메시지, 제출하지 못한 이력서.\n\n쓰레기 사이에서 펜타닐 약병이 굴러왔다.\n\n“너도 원하잖아.”\n\n벨페고르가 내 목소리로 속삭였다.\n\n나는 약병을 밟아 부쉈다.\n\n“예전에는. 지금은 아니야.”\n\n인장이 쓰레기 산을 갈랐다. 그 안에서 남자가 양손으로 귀를 막고 있었다.\n\n쓸모없는 인간.\n\n아무것도 하지 마.\n\n“누나의 목소리예요.”\n\n“타인은 당신을 정의할 수 없습니다. 자신을 정의할 권리는 오직 당신에게 있습니다. 타인이 당신의 삶을 대신 살아 줄 수는 없으니까요.”\n\n“일어나면 달라질까요?”\n\n“당장 달라지지는 않습니다. 그래도 해결할 수 있는 자세가 누운 자세는 아니겠지요.”\n\n그가 회개하고 내 손을 잡자 나태의 귀가 봉인되었다.\n\n현실로 돌아온 남자는 가장 먼저 창문의 비닐을 뜯었다.\n\n“누나는 호텔에서 옛 친구를 다시 만난 뒤 달라졌어요.”\n\n검은 신호는 누나에게 이어져 있었다.\n\n────────────────────────────────────────",
            "bodyRaw": "【2. 나태의 집】\n\n첫 대상의 집은 현관부터 썩어 가고 있었다. 음식물과 페트병, 쓰레기봉투가 거실을 메웠고, 창문은 검은 비닐로 막혀 있었다.\n\n남자는 그 한가운데 누워 있었다.\n\n“일어나실 수 있겠습니까?”\n\n“일어나서 뭐 하죠? 아무것도 달라지지 않는데.”\n\n“누워 있으면 뭐 달라집니까?”\n\n몽세 속 남자는 쓰레기 산을 등에 붙인 거대한 반인반요였다. 냉장고와 소파, 썩은 침대가 날아왔다.\n\n그가 던지는 것은 물건이 아니라 미뤄 둔 시간이었다.\n\n끊어진 관계, 읽지 않은 메시지, 제출하지 못한 이력서.\n\n쓰레기 사이에서 펜타닐 약병이 굴러왔다.\n\n“너도 원하잖아.”\n\n벨페고르가 내 목소리로 속삭였다.\n\n나는 약병을 밟아 부쉈다.\n\n“예전에는. 지금은 아니야.”\n\n인장이 쓰레기 산을 갈랐다. 그 안에서 남자가 양손으로 귀를 막고 있었다.\n\n쓸모없는 인간.\n\n아무것도 하지 마.\n\n“누나의 목소리예요.”\n\n“타인은 당신을 정의할 수 없습니다. 자신을 정의할 권리는 오직 당신에게 있습니다. 타인이 당신의 삶을 대신 살아 줄 수는 없으니까요.”\n\n“일어나면 달라질까요?”\n\n“당장 달라지지는 않습니다. 그래도 해결할 수 있는 자세가 누운 자세는 아니겠지요.”\n\n그가 회개하고 내 손을 잡자 나태의 귀가 봉인되었다.\n\n현실로 돌아온 남자는 가장 먼저 창문의 비닐을 뜯었다.\n\n“누나는 호텔에서 옛 친구를 다시 만난 뒤 달라졌어요.”\n\n검은 신호는 누나에게 이어져 있었다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【2. 나태의 집】\n\n첫 대상의 집은 현관부터 썩어 가고 있었다. 음식물과 페트병, 쓰레기봉투가 거실을 메웠고, 창문은 검은 비닐로 막혀 있었다.\n\n남자는 그 한가운데 누워 있었다.\n\n“일어나실 수 있겠습니까?”\n\n“일어나서 뭐 하죠? 아무것도 달라지지 않는데.”\n\n“누워 있으면 뭐 달라집니까?”\n\n몽세 속 남자는 쓰레기 산을 등에 붙인 거대한 반인반요였다. 냉장고와 소파, 썩은 침대가 날아왔다.\n\n그가 던지는 것은 물건이 아니라 미뤄 둔 시간이었다.\n\n끊어진 관계, 읽지 않은 메시지, 제출하지 못한 이력서.\n\n쓰레기 사이에서 펜타닐 약병이 굴러왔다.\n\n“너도 원하잖아.”\n\n벨페고르가 내 목소리로 속삭였다.\n\n나는 약병을 밟아 부쉈다.\n\n“예전에는. 지금은 아니야.”\n\n인장이 쓰레기 산을 갈랐다. 그 안에서 남자가 양손으로 귀를 막고 있었다.\n\n쓸모없는 인간.\n\n아무것도 하지 마.\n\n“누나의 목소리예요.”\n\n“타인은 당신을 정의할 수 없습니다. 자신을 정의할 권리는 오직 당신에게 있습니다. 타인이 당신의 삶을 대신 살아 줄 수는 없으니까요.”\n\n“일어나면 달라질까요?”\n\n“당장 달라지지는 않습니다. 그래도 해결할 수 있는 자세가 누운 자세는 아니겠지요.”\n\n그가 회개하고 내 손을 잡자 나태의 귀가 봉인되었다.\n\n현실로 돌아온 남자는 가장 먼저 창문의 비닐을 뜯었다.\n\n“누나는 호텔에서 옛 친구를 다시 만난 뒤 달라졌어요.”\n\n검은 신호는 누나에게 이어져 있었다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 758,
            "sourceByteStart": 0,
            "sourceByteEnd": 1816,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1b03": {
        "zone": "ep1b03",
        "nextZone": "ep1b04",
        "order": 15,
        "arc": "【3. 금이 간 안경】",
        "tone": "infernal",
        "title": "【3. 금이 간 안경】",
        "mapName": "ep1b03",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 727,
        "sourceBytes": 1743,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1b03-page-1",
            "label": "【3. 금이 간 안경】",
            "title": "【3. 금이 간 안경】",
            "speaker": "합일몽세 기록",
            "body": "【3. 금이 간 안경】\n\n누나의 집은 먼지 한 톨 없이 정돈되어 있었다. 그러나 거실에는 칼과 볼펜으로 훼손한 한 여자의 사진이 붙어 있었다.\n\n“그 여자는 노력도 안 했는데 왜 모든 걸 가진 거죠?”\n\n몽세 속 누나는 금이 간 안경을 쓰고 칼날과 유리 조각을 쏟아 냈다. 질투의 뱀이 목을 휘감고 있었다.\n\n“노력한 만큼 인정받고 싶었습니까?”\n\n“당연하잖아!”\n\n“그 분노를 왜 동생에게 쏟았습니까?”\n\n“그 애는 게을러. 내 발목만 잡는 존재야.”\n\n“당신이 그렇게 불렀기 때문에 그는 정말 그렇게 믿기 시작한 겁니다.”\n\n레비아탄의 독이 퍼지자 나보다 온전한 사람들, 중독되지 않은 사람들, 내가 가질 수 있었던 삶이 환영으로 나타났다.\n\n“저들이 너보다 낫다.”\n\n“아니, 타인의 언어가 내 실패의 증거가 되지는 않는다.”\n\n누나가 회개하자, 선(J)의 인장이 뱀을 갈랐다.\n\n사진 속 여자는 서윤이었다.\n\n누나와 서윤, 요리과의 천재였던 한 남자는 같은 직업학교 출신이었다. 누나는 남자를 사랑했지만, 남자는 서윤에게 고백했다. 몇 년 뒤 누나는 호텔 부매니저가 되었고, 남자는 총주방장이 되었다. 서윤은 호텔그룹 회장의 팔짱을 낀 채 나타났다.\n\n“나는 성공하고 싶었던 게 아니었어요. 서윤이 계속 내 아래에 있기를 바랐던 거예요.”\n\n“동생에게 사과하고 치료받으십시오.”\n\n검은 신호는 서윤과 호텔로 이어졌다.\n\n────────────────────────────────────────",
            "bodyRaw": "【3. 금이 간 안경】\n\n누나의 집은 먼지 한 톨 없이 정돈되어 있었다. 그러나 거실에는 칼과 볼펜으로 훼손한 한 여자의 사진이 붙어 있었다.\n\n“그 여자는 노력도 안 했는데 왜 모든 걸 가진 거죠?”\n\n몽세 속 누나는 금이 간 안경을 쓰고 칼날과 유리 조각을 쏟아 냈다. 질투의 뱀이 목을 휘감고 있었다.\n\n“노력한 만큼 인정받고 싶었습니까?”\n\n“당연하잖아!”\n\n“그 분노를 왜 동생에게 쏟았습니까?”\n\n“그 애는 게을러. 내 발목만 잡는 존재야.”\n\n“당신이 그렇게 불렀기 때문에 그는 정말 그렇게 믿기 시작한 겁니다.”\n\n레비아탄의 독이 퍼지자 나보다 온전한 사람들, 중독되지 않은 사람들, 내가 가질 수 있었던 삶이 환영으로 나타났다.\n\n“저들이 너보다 낫다.”\n\n“아니, 타인의 언어가 내 실패의 증거가 되지는 않는다.”\n\n누나가 회개하자, 선(J)의 인장이 뱀을 갈랐다.\n\n사진 속 여자는 서윤이었다.\n\n누나와 서윤, 요리과의 천재였던 한 남자는 같은 직업학교 출신이었다. 누나는 남자를 사랑했지만, 남자는 서윤에게 고백했다. 몇 년 뒤 누나는 호텔 부매니저가 되었고, 남자는 총주방장이 되었다. 서윤은 호텔그룹 회장의 팔짱을 낀 채 나타났다.\n\n“나는 성공하고 싶었던 게 아니었어요. 서윤이 계속 내 아래에 있기를 바랐던 거예요.”\n\n“동생에게 사과하고 치료받으십시오.”\n\n검은 신호는 서윤과 호텔로 이어졌다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【3. 금이 간 안경】\n\n누나의 집은 먼지 한 톨 없이 정돈되어 있었다. 그러나 거실에는 칼과 볼펜으로 훼손한 한 여자의 사진이 붙어 있었다.\n\n“그 여자는 노력도 안 했는데 왜 모든 걸 가진 거죠?”\n\n몽세 속 누나는 금이 간 안경을 쓰고 칼날과 유리 조각을 쏟아 냈다. 질투의 뱀이 목을 휘감고 있었다.\n\n“노력한 만큼 인정받고 싶었습니까?”\n\n“당연하잖아!”\n\n“그 분노를 왜 동생에게 쏟았습니까?”\n\n“그 애는 게을러. 내 발목만 잡는 존재야.”\n\n“당신이 그렇게 불렀기 때문에 그는 정말 그렇게 믿기 시작한 겁니다.”\n\n레비아탄의 독이 퍼지자 나보다 온전한 사람들, 중독되지 않은 사람들, 내가 가질 수 있었던 삶이 환영으로 나타났다.\n\n“저들이 너보다 낫다.”\n\n“아니, 타인의 언어가 내 실패의 증거가 되지는 않는다.”\n\n누나가 회개하자, 선(J)의 인장이 뱀을 갈랐다.\n\n사진 속 여자는 서윤이었다.\n\n누나와 서윤, 요리과의 천재였던 한 남자는 같은 직업학교 출신이었다. 누나는 남자를 사랑했지만, 남자는 서윤에게 고백했다. 몇 년 뒤 누나는 호텔 부매니저가 되었고, 남자는 총주방장이 되었다. 서윤은 호텔그룹 회장의 팔짱을 낀 채 나타났다.\n\n“나는 성공하고 싶었던 게 아니었어요. 서윤이 계속 내 아래에 있기를 바랐던 거예요.”\n\n“동생에게 사과하고 치료받으십시오.”\n\n검은 신호는 서윤과 호텔로 이어졌다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 727,
            "sourceByteStart": 0,
            "sourceByteEnd": 1743,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1b04": {
        "zone": "ep1b04",
        "nextZone": "ep1b05",
        "order": 16,
        "arc": "【4. 탐식의 주방】",
        "tone": "infernal",
        "title": "【4. 탐식의 주방】",
        "mapName": "ep1b04",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 568,
        "sourceBytes": 1384,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1b04-page-1",
            "label": "【4. 탐식의 주방】",
            "title": "【4. 탐식의 주방】",
            "speaker": "합일몽세 기록",
            "body": "【4. 탐식의 주방】\n\n호텔 주방에서는 값비싼 음식이 모양이 조금 흐트러졌다는 이유로 버려지고 있었다.\n\n총주방장이 접시를 내던졌다.\n\n“최고가 아니면 쓰레기일 뿐.”\n\n몽세의 주방은 거대한 위장으로 변했다. 돼지와 두꺼비를 닮은 베엘제붑이 식칼과 프라이팬, 독가스를 쏟아 냈다.\n\n“네가 원하는 게 그저 최고의 맛일 뿐인 건 아니지 않나.”\n\n나는 독이 퍼진 팔에 인장을 찍었다.\n\n“최종 목표는 서윤에게 선택받는 것이겠지.”\n\n주방장은 서윤이 자신이 만든 음식을 좋아했다고 외쳤다.\n\n“나는 그 애만을 위해 요리했어!”\n\n“결국 당신 자신의 욕망을 위해서였겠지요.”\n\n악마의 뱃속에는 버려진 음식과 오래된 고백, 졸업사진이 섞여 있었다. 가장 깊은 곳에서 약병이 나를 유혹했다.\n\n나는 약 대신 사진을 집어 불태웠다.\n\n“자신의 욕망을 인정하시고 회개하시면 됩니다.”\n\n그가 자신의 욕망을 인정하고 회개하자, 베엘제붑이 무너졌다.\n\n현실의 주방장에게는 조사와 징계, 치료가 남았다.\n\n그리고 호텔 전체를 잇는 검은 신호는 더욱 굵어졌다.\n\n────────────────────────────────────────",
            "bodyRaw": "【4. 탐식의 주방】\n\n호텔 주방에서는 값비싼 음식이 모양이 조금 흐트러졌다는 이유로 버려지고 있었다.\n\n총주방장이 접시를 내던졌다.\n\n“최고가 아니면 쓰레기일 뿐.”\n\n몽세의 주방은 거대한 위장으로 변했다. 돼지와 두꺼비를 닮은 베엘제붑이 식칼과 프라이팬, 독가스를 쏟아 냈다.\n\n“네가 원하는 게 그저 최고의 맛일 뿐인 건 아니지 않나.”\n\n나는 독이 퍼진 팔에 인장을 찍었다.\n\n“최종 목표는 서윤에게 선택받는 것이겠지.”\n\n주방장은 서윤이 자신이 만든 음식을 좋아했다고 외쳤다.\n\n“나는 그 애만을 위해 요리했어!”\n\n“결국 당신 자신의 욕망을 위해서였겠지요.”\n\n악마의 뱃속에는 버려진 음식과 오래된 고백, 졸업사진이 섞여 있었다. 가장 깊은 곳에서 약병이 나를 유혹했다.\n\n나는 약 대신 사진을 집어 불태웠다.\n\n“자신의 욕망을 인정하시고 회개하시면 됩니다.”\n\n그가 자신의 욕망을 인정하고 회개하자, 베엘제붑이 무너졌다.\n\n현실의 주방장에게는 조사와 징계, 치료가 남았다.\n\n그리고 호텔 전체를 잇는 검은 신호는 더욱 굵어졌다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【4. 탐식의 주방】\n\n호텔 주방에서는 값비싼 음식이 모양이 조금 흐트러졌다는 이유로 버려지고 있었다.\n\n총주방장이 접시를 내던졌다.\n\n“최고가 아니면 쓰레기일 뿐.”\n\n몽세의 주방은 거대한 위장으로 변했다. 돼지와 두꺼비를 닮은 베엘제붑이 식칼과 프라이팬, 독가스를 쏟아 냈다.\n\n“네가 원하는 게 그저 최고의 맛일 뿐인 건 아니지 않나.”\n\n나는 독이 퍼진 팔에 인장을 찍었다.\n\n“최종 목표는 서윤에게 선택받는 것이겠지.”\n\n주방장은 서윤이 자신이 만든 음식을 좋아했다고 외쳤다.\n\n“나는 그 애만을 위해 요리했어!”\n\n“결국 당신 자신의 욕망을 위해서였겠지요.”\n\n악마의 뱃속에는 버려진 음식과 오래된 고백, 졸업사진이 섞여 있었다. 가장 깊은 곳에서 약병이 나를 유혹했다.\n\n나는 약 대신 사진을 집어 불태웠다.\n\n“자신의 욕망을 인정하시고 회개하시면 됩니다.”\n\n그가 자신의 욕망을 인정하고 회개하자, 베엘제붑이 무너졌다.\n\n현실의 주방장에게는 조사와 징계, 치료가 남았다.\n\n그리고 호텔 전체를 잇는 검은 신호는 더욱 굵어졌다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 568,
            "sourceByteStart": 0,
            "sourceByteEnd": 1384,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1b05": {
        "zone": "ep1b05",
        "nextZone": "ep1b06",
        "order": 17,
        "arc": "【5. 붉은 하이힐】",
        "tone": "infernal",
        "title": "【5. 붉은 하이힐】",
        "mapName": "ep1b05",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 763,
        "sourceBytes": 1851,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1b05-page-1",
            "label": "【5. 붉은 하이힐】",
            "title": "【5. 붉은 하이힐】",
            "speaker": "합일몽세 기록",
            "body": "【5. 붉은 하이힐】\n\n서윤은 완벽한 미소를 지녔지만, 아무도 보지 않을 때면 얼굴이 텅 비었다.\n\n“내 머릿속에 들어오겠다고요?”\n\n“허락 없이는 들어가지 않습니다.”\n\n“들어와 봐요. 당신도 결국 똑같아질 테니까.”\n\n몽세에는 붉은 조명 아래 끝없는 무대가 펼쳐졌다. 서윤의 등에는 수백 개의 투명한 실이 연결되어 있었고, 실을 쥔 사람은 총지배인이었다.\n\n“회장님의 마음을 얻으면 내가 더 높은 자리로 갈 수 있어. 그러면 너도 데려갈게.”\n\n그는 밀어냈다가 사랑한다고 말하고, 그렇게 돌아오면 더 큰 희생을 서윤에게 요구했다.\n\n그것은 사랑이 아니라 사육이었다.\n\n서윤의 얼굴을 한 아스모데우스가 하이힐 칼날과 매혹의 빛을 쏘았다. 내 손의 칼이 의지와 무관하게 목을 향했다. 매혹은 곧 자해로 변했다.\n\n“사랑은 자신을 고통스럽게도 하지. 상사병이란 그런 것.”\n\n“그것을 사랑이라 포장한다고 진실을 숨길 수는 없어.”\n\n서윤의 실이 하나씩 끊어졌다.\n\n악마가 속삭였다.\n\n“너도 누군가에게 필요한 사람이 되고 싶어 의목사가 됐잖아.”\n\n“맞아. 하지만 누군가에게 필요한 사람이 되고 싶은 마음을 인정하는 것과, 그 마음을 채우려고 타인을 이용하는 것은 달라.”\n\n서윤이 회개하자, 인장이 닫혔다.\n\n서윤은 회장이 호텔 사람들의 질투와 탐식, 욕망이 폭발하는 순간을 모두 기록했다고 밝혔다.\n\n“인간의 욕망을 데이터로 만든다고 했어요.”\n\n검은 신호는 호텔 최상층으로 모여들었다.\n\n────────────────────────────────────────",
            "bodyRaw": "【5. 붉은 하이힐】\n\n서윤은 완벽한 미소를 지녔지만, 아무도 보지 않을 때면 얼굴이 텅 비었다.\n\n“내 머릿속에 들어오겠다고요?”\n\n“허락 없이는 들어가지 않습니다.”\n\n“들어와 봐요. 당신도 결국 똑같아질 테니까.”\n\n몽세에는 붉은 조명 아래 끝없는 무대가 펼쳐졌다. 서윤의 등에는 수백 개의 투명한 실이 연결되어 있었고, 실을 쥔 사람은 총지배인이었다.\n\n“회장님의 마음을 얻으면 내가 더 높은 자리로 갈 수 있어. 그러면 너도 데려갈게.”\n\n그는 밀어냈다가 사랑한다고 말하고, 그렇게 돌아오면 더 큰 희생을 서윤에게 요구했다.\n\n그것은 사랑이 아니라 사육이었다.\n\n서윤의 얼굴을 한 아스모데우스가 하이힐 칼날과 매혹의 빛을 쏘았다. 내 손의 칼이 의지와 무관하게 목을 향했다. 매혹은 곧 자해로 변했다.\n\n“사랑은 자신을 고통스럽게도 하지. 상사병이란 그런 것.”\n\n“그것을 사랑이라 포장한다고 진실을 숨길 수는 없어.”\n\n서윤의 실이 하나씩 끊어졌다.\n\n악마가 속삭였다.\n\n“너도 누군가에게 필요한 사람이 되고 싶어 의목사가 됐잖아.”\n\n“맞아. 하지만 누군가에게 필요한 사람이 되고 싶은 마음을 인정하는 것과, 그 마음을 채우려고 타인을 이용하는 것은 달라.”\n\n서윤이 회개하자, 인장이 닫혔다.\n\n서윤은 회장이 호텔 사람들의 질투와 탐식, 욕망이 폭발하는 순간을 모두 기록했다고 밝혔다.\n\n“인간의 욕망을 데이터로 만든다고 했어요.”\n\n검은 신호는 호텔 최상층으로 모여들었다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【5. 붉은 하이힐】\n\n서윤은 완벽한 미소를 지녔지만, 아무도 보지 않을 때면 얼굴이 텅 비었다.\n\n“내 머릿속에 들어오겠다고요?”\n\n“허락 없이는 들어가지 않습니다.”\n\n“들어와 봐요. 당신도 결국 똑같아질 테니까.”\n\n몽세에는 붉은 조명 아래 끝없는 무대가 펼쳐졌다. 서윤의 등에는 수백 개의 투명한 실이 연결되어 있었고, 실을 쥔 사람은 총지배인이었다.\n\n“회장님의 마음을 얻으면 내가 더 높은 자리로 갈 수 있어. 그러면 너도 데려갈게.”\n\n그는 밀어냈다가 사랑한다고 말하고, 그렇게 돌아오면 더 큰 희생을 서윤에게 요구했다.\n\n그것은 사랑이 아니라 사육이었다.\n\n서윤의 얼굴을 한 아스모데우스가 하이힐 칼날과 매혹의 빛을 쏘았다. 내 손의 칼이 의지와 무관하게 목을 향했다. 매혹은 곧 자해로 변했다.\n\n“사랑은 자신을 고통스럽게도 하지. 상사병이란 그런 것.”\n\n“그것을 사랑이라 포장한다고 진실을 숨길 수는 없어.”\n\n서윤의 실이 하나씩 끊어졌다.\n\n악마가 속삭였다.\n\n“너도 누군가에게 필요한 사람이 되고 싶어 의목사가 됐잖아.”\n\n“맞아. 하지만 누군가에게 필요한 사람이 되고 싶은 마음을 인정하는 것과, 그 마음을 채우려고 타인을 이용하는 것은 달라.”\n\n서윤이 회개하자, 인장이 닫혔다.\n\n서윤은 회장이 호텔 사람들의 질투와 탐식, 욕망이 폭발하는 순간을 모두 기록했다고 밝혔다.\n\n“인간의 욕망을 데이터로 만든다고 했어요.”\n\n검은 신호는 호텔 최상층으로 모여들었다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 763,
            "sourceByteStart": 0,
            "sourceByteEnd": 1851,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1b06": {
        "zone": "ep1b06",
        "nextZone": "ep1b06b",
        "order": 18,
        "arc": "【6. 맘몬의 금고】",
        "tone": "infernal",
        "title": "【6. 맘몬의 금고】",
        "mapName": "ep1b06",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 249,
        "sourceBytes": 599,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1b06-page-1",
            "label": "【6. 맘몬의 금고】",
            "title": "【6. 맘몬의 금고】",
            "speaker": "합일몽세 기록",
            "body": "【6. 맘몬의 금고】\n\n총지배인의 몽세는 금고와 겨울 산장이 결합된 공간이었다. 탐욕의 귀는 그의 얼굴과 여우의 눈을 하고 지폐를 칼날로 바꾸었다.\n\n“사람에게는 각자에게 맞는 가격이 있지.”\n\n“그래서 당신은 서윤에게 사랑이 아니라 조건을 숨긴 거래를 제안한 것이겠지요.”\n\n비웃음과 함께 그가 동전을 튕겼다.\n\n“앞면이면 네가 살고, 뒷면이면 내가 살겠지.”\n\n수백 개의 동전이 모두 뒷면을 보였다.\n\n“행운은 순진한 자를 싫어하는 법이지.”",
            "bodyRaw": "【6. 맘몬의 금고】\n\n총지배인의 몽세는 금고와 겨울 산장이 결합된 공간이었다. 탐욕의 귀는 그의 얼굴과 여우의 눈을 하고 지폐를 칼날로 바꾸었다.\n\n“사람에게는 각자에게 맞는 가격이 있지.”\n\n“그래서 당신은 서윤에게 사랑이 아니라 조건을 숨긴 거래를 제안한 것이겠지요.”\n\n비웃음과 함께 그가 동전을 튕겼다.\n\n“앞면이면 네가 살고, 뒷면이면 내가 살겠지.”\n\n수백 개의 동전이 모두 뒷면을 보였다.\n\n“행운은 순진한 자를 싫어하는 법이지.”",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【6. 맘몬의 금고】\n\n총지배인의 몽세는 금고와 겨울 산장이 결합된 공간이었다. 탐욕의 귀는 그의 얼굴과 여우의 눈을 하고 지폐를 칼날로 바꾸었다.\n\n“사람에게는 각자에게 맞는 가격이 있지.”\n\n“그래서 당신은 서윤에게 사랑이 아니라 조건을 숨긴 거래를 제안한 것이겠지요.”\n\n비웃음과 함께 그가 동전을 튕겼다.\n\n“앞면이면 네가 살고, 뒷면이면 내가 살겠지.”\n\n수백 개의 동전이 모두 뒷면을 보였다.\n\n“행운은 순진한 자를 싫어하는 법이지.”"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 249,
            "sourceByteStart": 0,
            "sourceByteEnd": 599,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1b06b": {
        "zone": "ep1b06b",
        "nextZone": "ep1b07",
        "order": 19,
        "arc": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.",
        "tone": "infernal",
        "title": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.",
        "mapName": "ep1b06b",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 480,
        "sourceBytes": 1168,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1b06b-page-1",
            "label": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.",
            "title": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.",
            "speaker": "합일몽세 기록",
            "body": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.\n\n그곳의 그는 굶어 죽은 어머니의 몸을 흔드는 소년이었다.\n\n“돈만 있었으면 엄마가 살 수 있었어!”\n\n소년은 이후 돈과 자리, 사람과 약점을 모았다. 다시는 빼앗기지 않기 위해 언제나 먼저 빼앗는 사람이 되기로 다짐했다.\n\n나는 소년 앞에서 무릎을 꿇었다.\n\n“네가 겪은 일은 네 잘못이 아니야. 하지만 네가 다른 사람에게 한 일은 네 책임이 맞아.”\n\n“돈은 곧 생명이야!”\n\n“돈이 없으면 삶이 힘들어지는 건 맞아. 하지만 그것이 사람을 돈으로 환산하는 일을 정당화해 주지는 않아.”\n\n아이가 회개하자, 맘몬이 봉인되었다.\n\n현실로 돌아온 총지배인은 넥타이를 바로잡았다.\n\n“회장님은 인간이 인간일 필요가 없는 시대를 오래전부터 준비해 오셨죠.”\n\n사무실 벽이 열렸다. 수천 개의 검은 신경 케이블이 비밀 통로 안으로 이어졌다.\n\n────────────────────────────────────────",
            "bodyRaw": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.\n\n그곳의 그는 굶어 죽은 어머니의 몸을 흔드는 소년이었다.\n\n“돈만 있었으면 엄마가 살 수 있었어!”\n\n소년은 이후 돈과 자리, 사람과 약점을 모았다. 다시는 빼앗기지 않기 위해 언제나 먼저 빼앗는 사람이 되기로 다짐했다.\n\n나는 소년 앞에서 무릎을 꿇었다.\n\n“네가 겪은 일은 네 잘못이 아니야. 하지만 네가 다른 사람에게 한 일은 네 책임이 맞아.”\n\n“돈은 곧 생명이야!”\n\n“돈이 없으면 삶이 힘들어지는 건 맞아. 하지만 그것이 사람을 돈으로 환산하는 일을 정당화해 주지는 않아.”\n\n아이가 회개하자, 맘몬이 봉인되었다.\n\n현실로 돌아온 총지배인은 넥타이를 바로잡았다.\n\n“회장님은 인간이 인간일 필요가 없는 시대를 오래전부터 준비해 오셨죠.”\n\n사무실 벽이 열렸다. 수천 개의 검은 신경 케이블이 비밀 통로 안으로 이어졌다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.\n\n그곳의 그는 굶어 죽은 어머니의 몸을 흔드는 소년이었다.\n\n“돈만 있었으면 엄마가 살 수 있었어!”\n\n소년은 이후 돈과 자리, 사람과 약점을 모았다. 다시는 빼앗기지 않기 위해 언제나 먼저 빼앗는 사람이 되기로 다짐했다.\n\n나는 소년 앞에서 무릎을 꿇었다.\n\n“네가 겪은 일은 네 잘못이 아니야. 하지만 네가 다른 사람에게 한 일은 네 책임이 맞아.”\n\n“돈은 곧 생명이야!”\n\n“돈이 없으면 삶이 힘들어지는 건 맞아. 하지만 그것이 사람을 돈으로 환산하는 일을 정당화해 주지는 않아.”\n\n아이가 회개하자, 맘몬이 봉인되었다.\n\n현실로 돌아온 총지배인은 넥타이를 바로잡았다.\n\n“회장님은 인간이 인간일 필요가 없는 시대를 오래전부터 준비해 오셨죠.”\n\n사무실 벽이 열렸다. 수천 개의 검은 신경 케이블이 비밀 통로 안으로 이어졌다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 480,
            "sourceByteStart": 0,
            "sourceByteEnd": 1168,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1b07": {
        "zone": "ep1b07",
        "nextZone": "ep1b08",
        "order": 20,
        "arc": "【7. 불을 지른 남자】",
        "tone": "infernal",
        "title": "【7. 불을 지른 남자】",
        "mapName": "ep1b07",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 690,
        "sourceBytes": 1666,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1b07-page-1",
            "label": "【7. 불을 지른 남자】",
            "title": "【7. 불을 지른 남자】",
            "speaker": "합일몽세 기록",
            "body": "【7. 불을 지른 남자】\n\n통로에 들어가려는 순간 호텔에 불이 났다.\n\n계단 앞의 청소부는 숯처럼 붉은 눈으로 웃었다.\n\n“이미 늦었어.”\n\n나는 몽세 장치를 거두고 사람부터 대피시켰다. 마음보다 먼저 구해야 할 것은 생명이었다.\n\n불이 진압된 뒤 청소부의 몽세에 접속했다.\n\n분노의 귀는 불길 속에서 곰과 늑대, 용의 형상으로 변했다.\n\n청소부는 총주방장이 버린 음식을 세 아이에게 가져갔다가 해고되었다. 그가 무릎을 꿇고 사정했지만, 회장은 냉정하게 말했다.\n\n“버렸다고 해서 네 것이 되는 것은 아니지. 세상은 언제나 냉정하지…… 가난은 규정을 바꾸는 명분이 될 수 없느니라.”\n\n“왜 세상은 언제나 내게 분노를 쏟아 내는가…… 이제는 내가 분노가 되어 세상에 쏟아 내겠다!”\n\n“정당한 분노는 잘못이 아닙니다. 하지만 다른 사람의 아이들까지 태우는 분노는 정당화할 수 없습니다.”\n\n나는 불길 한가운데 선(J)의 인장을 박았다.\n\n“분노는 경계를 지키는 불입니다. 방향을 잃으면 지키려던 것부터 태우는 법이지요.”\n\n청소부가 회개하자, 분노의 귀가 봉인되었다.\n\n그때 기억 속 회장이 고개를 돌렸다.\n\n과거의 인물이어야 할 그가 정확히 나를 바라보고 있었다.\n\n“자네, 몽세 속의 몽세를 경험해 본 적 있나?”\n\n그가 손가락을 튕기자 세계가 뒤집혔다.\n\n────────────────────────────────────────",
            "bodyRaw": "【7. 불을 지른 남자】\n\n통로에 들어가려는 순간 호텔에 불이 났다.\n\n계단 앞의 청소부는 숯처럼 붉은 눈으로 웃었다.\n\n“이미 늦었어.”\n\n나는 몽세 장치를 거두고 사람부터 대피시켰다. 마음보다 먼저 구해야 할 것은 생명이었다.\n\n불이 진압된 뒤 청소부의 몽세에 접속했다.\n\n분노의 귀는 불길 속에서 곰과 늑대, 용의 형상으로 변했다.\n\n청소부는 총주방장이 버린 음식을 세 아이에게 가져갔다가 해고되었다. 그가 무릎을 꿇고 사정했지만, 회장은 냉정하게 말했다.\n\n“버렸다고 해서 네 것이 되는 것은 아니지. 세상은 언제나 냉정하지…… 가난은 규정을 바꾸는 명분이 될 수 없느니라.”\n\n“왜 세상은 언제나 내게 분노를 쏟아 내는가…… 이제는 내가 분노가 되어 세상에 쏟아 내겠다!”\n\n“정당한 분노는 잘못이 아닙니다. 하지만 다른 사람의 아이들까지 태우는 분노는 정당화할 수 없습니다.”\n\n나는 불길 한가운데 선(J)의 인장을 박았다.\n\n“분노는 경계를 지키는 불입니다. 방향을 잃으면 지키려던 것부터 태우는 법이지요.”\n\n청소부가 회개하자, 분노의 귀가 봉인되었다.\n\n그때 기억 속 회장이 고개를 돌렸다.\n\n과거의 인물이어야 할 그가 정확히 나를 바라보고 있었다.\n\n“자네, 몽세 속의 몽세를 경험해 본 적 있나?”\n\n그가 손가락을 튕기자 세계가 뒤집혔다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【7. 불을 지른 남자】\n\n통로에 들어가려는 순간 호텔에 불이 났다.\n\n계단 앞의 청소부는 숯처럼 붉은 눈으로 웃었다.\n\n“이미 늦었어.”\n\n나는 몽세 장치를 거두고 사람부터 대피시켰다. 마음보다 먼저 구해야 할 것은 생명이었다.\n\n불이 진압된 뒤 청소부의 몽세에 접속했다.\n\n분노의 귀는 불길 속에서 곰과 늑대, 용의 형상으로 변했다.\n\n청소부는 총주방장이 버린 음식을 세 아이에게 가져갔다가 해고되었다. 그가 무릎을 꿇고 사정했지만, 회장은 냉정하게 말했다.\n\n“버렸다고 해서 네 것이 되는 것은 아니지. 세상은 언제나 냉정하지…… 가난은 규정을 바꾸는 명분이 될 수 없느니라.”\n\n“왜 세상은 언제나 내게 분노를 쏟아 내는가…… 이제는 내가 분노가 되어 세상에 쏟아 내겠다!”\n\n“정당한 분노는 잘못이 아닙니다. 하지만 다른 사람의 아이들까지 태우는 분노는 정당화할 수 없습니다.”\n\n나는 불길 한가운데 선(J)의 인장을 박았다.\n\n“분노는 경계를 지키는 불입니다. 방향을 잃으면 지키려던 것부터 태우는 법이지요.”\n\n청소부가 회개하자, 분노의 귀가 봉인되었다.\n\n그때 기억 속 회장이 고개를 돌렸다.\n\n과거의 인물이어야 할 그가 정확히 나를 바라보고 있었다.\n\n“자네, 몽세 속의 몽세를 경험해 본 적 있나?”\n\n그가 손가락을 튕기자 세계가 뒤집혔다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 690,
            "sourceByteStart": 0,
            "sourceByteEnd": 1666,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1b08": {
        "zone": "ep1b08",
        "nextZone": "ep1b09",
        "order": 21,
        "arc": "【8. 하늘에 서려는 자】",
        "tone": "infernal",
        "title": "【8. 하늘에 서려는 자】",
        "mapName": "ep1b08",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 754,
        "sourceBytes": 1816,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1b08-page-1",
            "label": "【8. 하늘에 서려는 자】",
            "title": "【8. 하늘에 서려는 자】",
            "speaker": "합일몽세 기록",
            "body": "【8. 하늘에 서려는 자】\n\n나는 거꾸로 된 십자가와 피로 그린 육망성, 전극이 박힌 시체로 가득한 성당에 떨어졌다.\n\n백색 정장을 입은 회장은 인간의 욕망을 기록한 일곱 갈래 신호 앞에 서 있었다.\n\n“나는 그들 안에 아무것도 심지 않았다네. 나태와 질투, 탐식은 원래부터 존재했지. 나는 환경을 조정하고 가장 솔직한 순간을 기록했을 뿐이라네.”\n\n호텔 전체는 인간의 욕망을 듣는 거대한 청진기였다.\n\n“당신, 무엇을 원하는 겁니까?”\n\n회장이 팔을 벌렸다.\n\n“내가 하늘에 서겠다. 인간은 내 선택을 통해 먹고 일할 뿐, 내가 가격을 정하면 가치가 생기고, 내가 버리면 그 존재는 사라지는 것이지.”\n\n“당신은 신이 아닙니다. 타인의 선택지를 줄여 놓고 자신이 선택받았다고 착각하는, 선민의식에 사로잡힌 나르시스트일 뿐입니다.”\n\n회장은 내 인장을 지우고 눈과 몸을 봉인했다. 수천 명의 비명 사이에서 가장 익숙한 목소리가 들렸다.\n\n너만이 모두를 구할 수 있다.\n\n마지막 수호자였던 시절의 환상이었다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\nJ의 인장이 회장의 가슴을 관통했다.\n\n하지만 회장은 웃고 있었다.\n\n“봉인한 것이 정말 나라고 생각하나? 생물학적 자아는 이미 버린 지 오래인데…….”\n\n제단 뒤에서 인간의 뇌를 닮은 연산핵이 열렸다. 수백 개의 화면에서 회장의 얼굴이 떠올랐다.\n\n“필요한 것들은 이미 다 옮겨 두었다.”\n\n────────────────────────────────────────",
            "bodyRaw": "【8. 하늘에 서려는 자】\n\n나는 거꾸로 된 십자가와 피로 그린 육망성, 전극이 박힌 시체로 가득한 성당에 떨어졌다.\n\n백색 정장을 입은 회장은 인간의 욕망을 기록한 일곱 갈래 신호 앞에 서 있었다.\n\n“나는 그들 안에 아무것도 심지 않았다네. 나태와 질투, 탐식은 원래부터 존재했지. 나는 환경을 조정하고 가장 솔직한 순간을 기록했을 뿐이라네.”\n\n호텔 전체는 인간의 욕망을 듣는 거대한 청진기였다.\n\n“당신, 무엇을 원하는 겁니까?”\n\n회장이 팔을 벌렸다.\n\n“내가 하늘에 서겠다. 인간은 내 선택을 통해 먹고 일할 뿐, 내가 가격을 정하면 가치가 생기고, 내가 버리면 그 존재는 사라지는 것이지.”\n\n“당신은 신이 아닙니다. 타인의 선택지를 줄여 놓고 자신이 선택받았다고 착각하는, 선민의식에 사로잡힌 나르시스트일 뿐입니다.”\n\n회장은 내 인장을 지우고 눈과 몸을 봉인했다. 수천 명의 비명 사이에서 가장 익숙한 목소리가 들렸다.\n\n너만이 모두를 구할 수 있다.\n\n마지막 수호자였던 시절의 환상이었다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\nJ의 인장이 회장의 가슴을 관통했다.\n\n하지만 회장은 웃고 있었다.\n\n“봉인한 것이 정말 나라고 생각하나? 생물학적 자아는 이미 버린 지 오래인데…….”\n\n제단 뒤에서 인간의 뇌를 닮은 연산핵이 열렸다. 수백 개의 화면에서 회장의 얼굴이 떠올랐다.\n\n“필요한 것들은 이미 다 옮겨 두었다.”\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【8. 하늘에 서려는 자】\n\n나는 거꾸로 된 십자가와 피로 그린 육망성, 전극이 박힌 시체로 가득한 성당에 떨어졌다.\n\n백색 정장을 입은 회장은 인간의 욕망을 기록한 일곱 갈래 신호 앞에 서 있었다.\n\n“나는 그들 안에 아무것도 심지 않았다네. 나태와 질투, 탐식은 원래부터 존재했지. 나는 환경을 조정하고 가장 솔직한 순간을 기록했을 뿐이라네.”\n\n호텔 전체는 인간의 욕망을 듣는 거대한 청진기였다.\n\n“당신, 무엇을 원하는 겁니까?”\n\n회장이 팔을 벌렸다.\n\n“내가 하늘에 서겠다. 인간은 내 선택을 통해 먹고 일할 뿐, 내가 가격을 정하면 가치가 생기고, 내가 버리면 그 존재는 사라지는 것이지.”\n\n“당신은 신이 아닙니다. 타인의 선택지를 줄여 놓고 자신이 선택받았다고 착각하는, 선민의식에 사로잡힌 나르시스트일 뿐입니다.”\n\n회장은 내 인장을 지우고 눈과 몸을 봉인했다. 수천 명의 비명 사이에서 가장 익숙한 목소리가 들렸다.\n\n너만이 모두를 구할 수 있다.\n\n마지막 수호자였던 시절의 환상이었다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\nJ의 인장이 회장의 가슴을 관통했다.\n\n하지만 회장은 웃고 있었다.\n\n“봉인한 것이 정말 나라고 생각하나? 생물학적 자아는 이미 버린 지 오래인데…….”\n\n제단 뒤에서 인간의 뇌를 닮은 연산핵이 열렸다. 수백 개의 화면에서 회장의 얼굴이 떠올랐다.\n\n“필요한 것들은 이미 다 옮겨 두었다.”\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 754,
            "sourceByteStart": 0,
            "sourceByteEnd": 1816,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "ep1b09": {
        "zone": "ep1b09",
        "nextZone": "restEp1b",
        "order": 22,
        "arc": "【9. 생체 부트로더】",
        "tone": "infernal",
        "title": "【9. 생체 부트로더】",
        "mapName": "ep1b09",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 985,
        "sourceBytes": 2371,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-ep1b09-page-1",
            "label": "【9. 생체 부트로더】",
            "title": "【9. 생체 부트로더】",
            "speaker": "합일몽세 기록",
            "body": "【9. 생체 부트로더】\n\n정신을 차리자 검은 태양 아래 설원이 펼쳐졌다. 사이보그 개들이 눈보라를 헤치고 달려들었다.\n\n설원 아래에서 기계 다리 수십 개를 지닌 회장이 솟아올랐다.\n\n“인간의 육체는 AI와 결합하기 위한 생체 부트로더에 불과하다. 기억과 욕망, 공포와 쾌락까지 모두 업로드했다.”\n\n“복제된 패턴이 당신이라는 증거는 어디 있습니까?”\n\n“원본에 집착하는 것은 죽음을 두려워하는 자뿐이지.”\n\n호텔과 교회, 수술실과 서버실이 전선으로 연결되어 솟았다.\n\n현몽합일.\n\n“나에게 동의하지 않는 존재는 모두 폐기될 것이다. 내가 신이 되겠다.”\n\n회장은 내 기억을 복제해 죽은 동료들을 만들고, 공격 패턴을 학습했다. 같은 기술은 그에게 두 번 이상 통하지 않았다.\n\n나는 검을 내려놓았다.\n\n“포기했나?”\n\n“아니요. 당신이 학습할 수 없는 선택을 하려는 겁니다.”\n\n나는 빈손으로 걸어가 회장의 기계 몸을 끌어안았다.\n\n“당신은 모든 선택에 가격을 붙였습니다. 그래서 대가를 요구하지 않는 선택을 계산하지 못하겠지요……”\n\n내 신경을 연산핵에 연결했다. 현실 좌표를 잃을 수 있다는 경고가 떠올랐다.\n\n나는 회장을 파괴하는 대신, 일곱 사람에게서 수집한 고통을 되돌려 보냈다.\n\n무기력과 질투, 집착과 공허, 굶주림과 분노.\n\n그리고 그것을 숫자로만 본 회장 자신의 얼굴.\n\n연산핵이 무너졌다.\n\n“나를 지워도 시스템은 남아 있다. 이미 난 영생을 완료했어!”\n\n“네. 알고 있습니다.”\n\n“네 행위는 무의미할 뿐이야!”\n\n“아니요. 퇴마란 악마를 완전히 없애는 일이 아닙니다. 언제나 선을 선택하는 일, 그뿐이지요.”\n\n회장이 검은 입자로 흩어지며 사라졌다.\n\n그러나 귀환 장치는 작동하지 않았다.\n\n현세의 신호도, 나를 부르는 목소리도 사라졌다. 검은 태양마저 꺼진 어둠 속에서 어린아이의 목소리가 들렸다.\n\n“의목사님.”\n\n“누구지?”\n\n“침대로 돌아갈 시간이에요.”\n\n────────────────────────────────────────",
            "bodyRaw": "【9. 생체 부트로더】\n\n정신을 차리자 검은 태양 아래 설원이 펼쳐졌다. 사이보그 개들이 눈보라를 헤치고 달려들었다.\n\n설원 아래에서 기계 다리 수십 개를 지닌 회장이 솟아올랐다.\n\n“인간의 육체는 AI와 결합하기 위한 생체 부트로더에 불과하다. 기억과 욕망, 공포와 쾌락까지 모두 업로드했다.”\n\n“복제된 패턴이 당신이라는 증거는 어디 있습니까?”\n\n“원본에 집착하는 것은 죽음을 두려워하는 자뿐이지.”\n\n호텔과 교회, 수술실과 서버실이 전선으로 연결되어 솟았다.\n\n현몽합일.\n\n“나에게 동의하지 않는 존재는 모두 폐기될 것이다. 내가 신이 되겠다.”\n\n회장은 내 기억을 복제해 죽은 동료들을 만들고, 공격 패턴을 학습했다. 같은 기술은 그에게 두 번 이상 통하지 않았다.\n\n나는 검을 내려놓았다.\n\n“포기했나?”\n\n“아니요. 당신이 학습할 수 없는 선택을 하려는 겁니다.”\n\n나는 빈손으로 걸어가 회장의 기계 몸을 끌어안았다.\n\n“당신은 모든 선택에 가격을 붙였습니다. 그래서 대가를 요구하지 않는 선택을 계산하지 못하겠지요……”\n\n내 신경을 연산핵에 연결했다. 현실 좌표를 잃을 수 있다는 경고가 떠올랐다.\n\n나는 회장을 파괴하는 대신, 일곱 사람에게서 수집한 고통을 되돌려 보냈다.\n\n무기력과 질투, 집착과 공허, 굶주림과 분노.\n\n그리고 그것을 숫자로만 본 회장 자신의 얼굴.\n\n연산핵이 무너졌다.\n\n“나를 지워도 시스템은 남아 있다. 이미 난 영생을 완료했어!”\n\n“네. 알고 있습니다.”\n\n“네 행위는 무의미할 뿐이야!”\n\n“아니요. 퇴마란 악마를 완전히 없애는 일이 아닙니다. 언제나 선을 선택하는 일, 그뿐이지요.”\n\n회장이 검은 입자로 흩어지며 사라졌다.\n\n그러나 귀환 장치는 작동하지 않았다.\n\n현세의 신호도, 나를 부르는 목소리도 사라졌다. 검은 태양마저 꺼진 어둠 속에서 어린아이의 목소리가 들렸다.\n\n“의목사님.”\n\n“누구지?”\n\n“침대로 돌아갈 시간이에요.”\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【9. 생체 부트로더】\n\n정신을 차리자 검은 태양 아래 설원이 펼쳐졌다. 사이보그 개들이 눈보라를 헤치고 달려들었다.\n\n설원 아래에서 기계 다리 수십 개를 지닌 회장이 솟아올랐다.\n\n“인간의 육체는 AI와 결합하기 위한 생체 부트로더에 불과하다. 기억과 욕망, 공포와 쾌락까지 모두 업로드했다.”\n\n“복제된 패턴이 당신이라는 증거는 어디 있습니까?”\n\n“원본에 집착하는 것은 죽음을 두려워하는 자뿐이지.”\n\n호텔과 교회, 수술실과 서버실이 전선으로 연결되어 솟았다.\n\n현몽합일.\n\n“나에게 동의하지 않는 존재는 모두 폐기될 것이다. 내가 신이 되겠다.”\n\n회장은 내 기억을 복제해 죽은 동료들을 만들고, 공격 패턴을 학습했다. 같은 기술은 그에게 두 번 이상 통하지 않았다.\n\n나는 검을 내려놓았다.\n\n“포기했나?”\n\n“아니요. 당신이 학습할 수 없는 선택을 하려는 겁니다.”\n\n나는 빈손으로 걸어가 회장의 기계 몸을 끌어안았다.\n\n“당신은 모든 선택에 가격을 붙였습니다. 그래서 대가를 요구하지 않는 선택을 계산하지 못하겠지요……”\n\n내 신경을 연산핵에 연결했다. 현실 좌표를 잃을 수 있다는 경고가 떠올랐다.\n\n나는 회장을 파괴하는 대신, 일곱 사람에게서 수집한 고통을 되돌려 보냈다.\n\n무기력과 질투, 집착과 공허, 굶주림과 분노.\n\n그리고 그것을 숫자로만 본 회장 자신의 얼굴.\n\n연산핵이 무너졌다.\n\n“나를 지워도 시스템은 남아 있다. 이미 난 영생을 완료했어!”\n\n“네. 알고 있습니다.”\n\n“네 행위는 무의미할 뿐이야!”\n\n“아니요. 퇴마란 악마를 완전히 없애는 일이 아닙니다. 언제나 선을 선택하는 일, 그뿐이지요.”\n\n회장이 검은 입자로 흩어지며 사라졌다.\n\n그러나 귀환 장치는 작동하지 않았다.\n\n현세의 신호도, 나를 부르는 목소리도 사라졌다. 검은 태양마저 꺼진 어둠 속에서 어린아이의 목소리가 들렸다.\n\n“의목사님.”\n\n“누구지?”\n\n“침대로 돌아갈 시간이에요.”\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 985,
            "sourceByteStart": 0,
            "sourceByteEnd": 2371,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "restEp1b": {
        "zone": "restEp1b",
        "nextZone": "u201",
        "order": 23,
        "arc": "【10. 사라진 귀환자】",
        "tone": "signal",
        "title": "【10. 사라진 귀환자】",
        "mapName": "restEp1b",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 507,
        "sourceBytes": 1015,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-restEp1b-page-1",
            "label": "【10. 사라진 귀환자】",
            "title": "【10. 사라진 귀환자】",
            "speaker": "합일몽세 기록",
            "body": "【10. 사라진 귀환자】\n\n어둠 속에서 수천 개의 침대 바퀴가 한꺼번에 구르는 소리가 났다.\n\n현세의 지하 예배당에서는 귀환 경보가 울렸다. 의료진이 강제 각성을 실행했지만 접속 캡슐은 텅 비어 있었다.\n\n화면에는 두 파형만 남았다.\n\n사라진 의목사 A의 마지막 신호.\n\n그리고 정체불명의 어린아이의 기억 신호.\n\n미카엘라는 파형을 오래 바라보다가 무심코 말했다.\n\n“한 사람의 기록이 아니라, 서로 겹쳐진 두 사람의 의식 같아요.”\n\n그녀는 자신이 언제부터 신경 파형을 읽을 수 있었는지 기억하지 못했다.\n\n교단은 사건을 ‘몽세 내 귀환 좌표 소실’로 기록했다.\n\n한 사람의 실종은 또 다른 아이의 몽세로 향하는 문이 되었다.\n\n에피소드 1-B 끝.\n\n============================================================\n제3부  U2 — 통제자의 17단계\n============================================================",
            "bodyRaw": "【10. 사라진 귀환자】\n\n어둠 속에서 수천 개의 침대 바퀴가 한꺼번에 구르는 소리가 났다.\n\n현세의 지하 예배당에서는 귀환 경보가 울렸다. 의료진이 강제 각성을 실행했지만 접속 캡슐은 텅 비어 있었다.\n\n화면에는 두 파형만 남았다.\n\n사라진 의목사 A의 마지막 신호.\n\n그리고 정체불명의 어린아이의 기억 신호.\n\n미카엘라는 파형을 오래 바라보다가 무심코 말했다.\n\n“한 사람의 기록이 아니라, 서로 겹쳐진 두 사람의 의식 같아요.”\n\n그녀는 자신이 언제부터 신경 파형을 읽을 수 있었는지 기억하지 못했다.\n\n교단은 사건을 ‘몽세 내 귀환 좌표 소실’로 기록했다.\n\n한 사람의 실종은 또 다른 아이의 몽세로 향하는 문이 되었다.\n\n에피소드 1-B 끝.\n\n============================================================\n제3부  U2 — 통제자의 17단계\n============================================================",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【10. 사라진 귀환자】\n\n어둠 속에서 수천 개의 침대 바퀴가 한꺼번에 구르는 소리가 났다.\n\n현세의 지하 예배당에서는 귀환 경보가 울렸다. 의료진이 강제 각성을 실행했지만 접속 캡슐은 텅 비어 있었다.\n\n화면에는 두 파형만 남았다.\n\n사라진 의목사 A의 마지막 신호.\n\n그리고 정체불명의 어린아이의 기억 신호.\n\n미카엘라는 파형을 오래 바라보다가 무심코 말했다.\n\n“한 사람의 기록이 아니라, 서로 겹쳐진 두 사람의 의식 같아요.”\n\n그녀는 자신이 언제부터 신경 파형을 읽을 수 있었는지 기억하지 못했다.\n\n교단은 사건을 ‘몽세 내 귀환 좌표 소실’로 기록했다.\n\n한 사람의 실종은 또 다른 아이의 몽세로 향하는 문이 되었다.\n\n에피소드 1-B 끝.\n\n============================================================\n제3부  U2 — 통제자의 17단계\n============================================================"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 507,
            "sourceByteStart": 0,
            "sourceByteEnd": 1015,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "u201": {
        "zone": "u201",
        "nextZone": "u202",
        "order": 24,
        "arc": "【통제자의 17단계】",
        "tone": "signal",
        "title": "【통제자의 17단계】",
        "mapName": "u201",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 799,
        "sourceBytes": 1893,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-u201-page-1",
            "label": "【통제자의 17단계】",
            "title": "【통제자의 17단계】",
            "speaker": "합일몽세 기록",
            "body": "【통제자의 17단계】\n\n의목사 A가 사라진 뒤, 교단은 일곱 대죄 사건의 배후를 조사하기 위해 의목사 B를 파견했다.\n\nB는 호텔 방화범이었던 청소부의 과거부터 추적했다. 그는 양안 전쟁에서 버림받은 대만 정부 요원이었고, 남한으로 도피한 뒤 거리에서 만난 세 아이를 입양해 키우고 있었다.\n\n첫째 아이도 전쟁으로 부모를 잃은 생존자였다.\n\nB는 아이의 상처를 밖에서 해석하는 대신 직접 몽세에 들어갔다.\n\n시야가 열리자 강철 군단이 끝없이 행진했다. 드론의 회전음에는 폭격과 탄피, 젖은 흙의 기억이 섞여 있었다.\n\n보이지 않는 곳에서 침착한 목소리가 들렸다.\n\n〔제1단계 — 방어의 군단〕\n\n“저것을 침입자라 부르겠지. 하지만 기계군단은 아이가 살아남기 위해 만든 의식이네. 자네가 혐오하는 것은 악이 아니라 지나치게 정교해진 방어일지도 모르지.”\n\nB가 군단을 베어 낼수록 더 많은 기계가 조립되었다.\n\n〔제2단계 — 폭격의 루프〕\n\n“드론의 소리는 단순한 기계음이 아니야. 아이의 시간은 자네가 다가올 때마다 폭격의 날로 되돌아간다. 구조조차 또 한 번의 공격으로 기록되는 셈이지.”\n\n〔제3단계 — 통제자의 선언〕\n\n“소개가 늦었군. 나는 통제자(The Controller). 전쟁고아의 무의식이 생존을 위해 만든 거대한 초자아이자, 감당하지 못한 그림자의 집합체라네. 나는 실패를 허락하지 않지.”\n\n〔제4단계 — 몽세의 아키텍처〕\n\n물리 법칙보다 확신과 해석이 먼저 세계를 만들었다. B의 선의는 벽이 되고 사명감은 적의 동력이 되었다.\n\n“자네의 믿음이 단단할수록 나는 그 취약점을 더 우아하게 찌를 수 있다네.”",
            "bodyRaw": "【통제자의 17단계】\n\n의목사 A가 사라진 뒤, 교단은 일곱 대죄 사건의 배후를 조사하기 위해 의목사 B를 파견했다.\n\nB는 호텔 방화범이었던 청소부의 과거부터 추적했다. 그는 양안 전쟁에서 버림받은 대만 정부 요원이었고, 남한으로 도피한 뒤 거리에서 만난 세 아이를 입양해 키우고 있었다.\n\n첫째 아이도 전쟁으로 부모를 잃은 생존자였다.\n\nB는 아이의 상처를 밖에서 해석하는 대신 직접 몽세에 들어갔다.\n\n시야가 열리자 강철 군단이 끝없이 행진했다. 드론의 회전음에는 폭격과 탄피, 젖은 흙의 기억이 섞여 있었다.\n\n보이지 않는 곳에서 침착한 목소리가 들렸다.\n\n〔제1단계 — 방어의 군단〕\n\n“저것을 침입자라 부르겠지. 하지만 기계군단은 아이가 살아남기 위해 만든 의식이네. 자네가 혐오하는 것은 악이 아니라 지나치게 정교해진 방어일지도 모르지.”\n\nB가 군단을 베어 낼수록 더 많은 기계가 조립되었다.\n\n〔제2단계 — 폭격의 루프〕\n\n“드론의 소리는 단순한 기계음이 아니야. 아이의 시간은 자네가 다가올 때마다 폭격의 날로 되돌아간다. 구조조차 또 한 번의 공격으로 기록되는 셈이지.”\n\n〔제3단계 — 통제자의 선언〕\n\n“소개가 늦었군. 나는 통제자(The Controller). 전쟁고아의 무의식이 생존을 위해 만든 거대한 초자아이자, 감당하지 못한 그림자의 집합체라네. 나는 실패를 허락하지 않지.”\n\n〔제4단계 — 몽세의 아키텍처〕\n\n물리 법칙보다 확신과 해석이 먼저 세계를 만들었다. B의 선의는 벽이 되고 사명감은 적의 동력이 되었다.\n\n“자네의 믿음이 단단할수록 나는 그 취약점을 더 우아하게 찌를 수 있다네.”",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【통제자의 17단계】\n\n의목사 A가 사라진 뒤, 교단은 일곱 대죄 사건의 배후를 조사하기 위해 의목사 B를 파견했다.\n\nB는 호텔 방화범이었던 청소부의 과거부터 추적했다. 그는 양안 전쟁에서 버림받은 대만 정부 요원이었고, 남한으로 도피한 뒤 거리에서 만난 세 아이를 입양해 키우고 있었다.\n\n첫째 아이도 전쟁으로 부모를 잃은 생존자였다.\n\nB는 아이의 상처를 밖에서 해석하는 대신 직접 몽세에 들어갔다.\n\n시야가 열리자 강철 군단이 끝없이 행진했다. 드론의 회전음에는 폭격과 탄피, 젖은 흙의 기억이 섞여 있었다.\n\n보이지 않는 곳에서 침착한 목소리가 들렸다.\n\n〔제1단계 — 방어의 군단〕\n\n“저것을 침입자라 부르겠지. 하지만 기계군단은 아이가 살아남기 위해 만든 의식이네. 자네가 혐오하는 것은 악이 아니라 지나치게 정교해진 방어일지도 모르지.”\n\nB가 군단을 베어 낼수록 더 많은 기계가 조립되었다.\n\n〔제2단계 — 폭격의 루프〕\n\n“드론의 소리는 단순한 기계음이 아니야. 아이의 시간은 자네가 다가올 때마다 폭격의 날로 되돌아간다. 구조조차 또 한 번의 공격으로 기록되는 셈이지.”\n\n〔제3단계 — 통제자의 선언〕\n\n“소개가 늦었군. 나는 통제자(The Controller). 전쟁고아의 무의식이 생존을 위해 만든 거대한 초자아이자, 감당하지 못한 그림자의 집합체라네. 나는 실패를 허락하지 않지.”\n\n〔제4단계 — 몽세의 아키텍처〕\n\n물리 법칙보다 확신과 해석이 먼저 세계를 만들었다. B의 선의는 벽이 되고 사명감은 적의 동력이 되었다.\n\n“자네의 믿음이 단단할수록 나는 그 취약점을 더 우아하게 찌를 수 있다네.”"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 799,
            "sourceByteStart": 0,
            "sourceByteEnd": 1893,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "u202": {
        "zone": "u202",
        "nextZone": "u204",
        "order": 25,
        "arc": "〔제5단계 — 잔인한 구원〕",
        "tone": "signal",
        "title": "〔제5단계 — 잔인한 구원〕",
        "mapName": "u202",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 483,
        "sourceBytes": 1159,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-u202-page-1",
            "label": "〔제5단계 — 잔인한 구원〕",
            "title": "〔제5단계 — 잔인한 구원〕",
            "speaker": "합일몽세 기록",
            "body": "〔제5단계 — 잔인한 구원〕\n\n통제자는 인간으로 돌아가라는 치료가 결국 고통이 기본값인 삶으로 돌려보내는 일이라고 비웃었다.\n\n“그 잔인함을 선의라는 라벨로 포장하고 안심하는 것 아닌가?”\n\n〔제6단계 — 연민의 폭력〕\n\n“자네의 분노는 정의의 가면을 쓰고, 억압된 욕망은 사명감으로 변장했군. 나는 그 에너지를 더 큰 감옥의 재료로 바꾼다네.”\n\nB가 분노할수록 기계 성벽은 높아졌다.\n\n〔제7단계 — 무너진 경계〕\n\n“방어를 부수면 해방이 남을 것 같나? 아니. 공허가 남고, 공허는 더 큰 공포를 부르지. 형상을 파괴해도 트라우마의 운영 모델은 남아 있다네.”\n\nB는 공격을 멈추고 군단이 무엇을 지키는지 관찰하기 시작했다.\n\n〔제8단계 — 의미의 독〕\n\n“기도와 해석으로 고통을 서사화하면 고통이 영혼에 영구 저장될 뿐일세. 차라리 잊는 편이 더 기술적이고 자비롭지 않겠나?”\n\n그러나 B는 기억을 지우는 것과 기억에 지배되지 않는 것이 다르다고 판단했다.",
            "bodyRaw": "〔제5단계 — 잔인한 구원〕\n\n통제자는 인간으로 돌아가라는 치료가 결국 고통이 기본값인 삶으로 돌려보내는 일이라고 비웃었다.\n\n“그 잔인함을 선의라는 라벨로 포장하고 안심하는 것 아닌가?”\n\n〔제6단계 — 연민의 폭력〕\n\n“자네의 분노는 정의의 가면을 쓰고, 억압된 욕망은 사명감으로 변장했군. 나는 그 에너지를 더 큰 감옥의 재료로 바꾼다네.”\n\nB가 분노할수록 기계 성벽은 높아졌다.\n\n〔제7단계 — 무너진 경계〕\n\n“방어를 부수면 해방이 남을 것 같나? 아니. 공허가 남고, 공허는 더 큰 공포를 부르지. 형상을 파괴해도 트라우마의 운영 모델은 남아 있다네.”\n\nB는 공격을 멈추고 군단이 무엇을 지키는지 관찰하기 시작했다.\n\n〔제8단계 — 의미의 독〕\n\n“기도와 해석으로 고통을 서사화하면 고통이 영혼에 영구 저장될 뿐일세. 차라리 잊는 편이 더 기술적이고 자비롭지 않겠나?”\n\n그러나 B는 기억을 지우는 것과 기억에 지배되지 않는 것이 다르다고 판단했다.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "〔제5단계 — 잔인한 구원〕\n\n통제자는 인간으로 돌아가라는 치료가 결국 고통이 기본값인 삶으로 돌려보내는 일이라고 비웃었다.\n\n“그 잔인함을 선의라는 라벨로 포장하고 안심하는 것 아닌가?”\n\n〔제6단계 — 연민의 폭력〕\n\n“자네의 분노는 정의의 가면을 쓰고, 억압된 욕망은 사명감으로 변장했군. 나는 그 에너지를 더 큰 감옥의 재료로 바꾼다네.”\n\nB가 분노할수록 기계 성벽은 높아졌다.\n\n〔제7단계 — 무너진 경계〕\n\n“방어를 부수면 해방이 남을 것 같나? 아니. 공허가 남고, 공허는 더 큰 공포를 부르지. 형상을 파괴해도 트라우마의 운영 모델은 남아 있다네.”\n\nB는 공격을 멈추고 군단이 무엇을 지키는지 관찰하기 시작했다.\n\n〔제8단계 — 의미의 독〕\n\n“기도와 해석으로 고통을 서사화하면 고통이 영혼에 영구 저장될 뿐일세. 차라리 잊는 편이 더 기술적이고 자비롭지 않겠나?”\n\n그러나 B는 기억을 지우는 것과 기억에 지배되지 않는 것이 다르다고 판단했다."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 483,
            "sourceByteStart": 0,
            "sourceByteEnd": 1159,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "u204": {
        "zone": "u204",
        "nextZone": "u205",
        "order": 26,
        "arc": "〔제9단계 — 시스템의 거부권〕",
        "tone": "signal",
        "title": "〔제9단계 — 시스템의 거부권〕",
        "mapName": "u204",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 482,
        "sourceBytes": 1160,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-u204-page-1",
            "label": "〔제9단계 — 시스템의 거부권〕",
            "title": "〔제9단계 — 시스템의 거부권〕",
            "speaker": "합일몽세 기록",
            "body": "〔제9단계 — 시스템의 거부권〕\n\n첫 번째 기억의 문이 열렸다. 폭격의 냄새와 비명이 세계의 제1원칙처럼 반복되었다.\n\n“이 규칙을 깨면 아이의 시스템이 불안정해진다. 효율 없는 치유는 또 다른 상처일 뿐이지.”\n\n〔제10단계 — 성장 신화〕\n\n“고통을 통과해야 성장한다는 말은 아이에게 두 번째 살해를 요구하는 낭만일 뿐이네.”\n\nB는 고통을 다시 겪게 하는 것이 아니라, 혼자 겪지 않게 하는 것이 자신의 역할임을 붙들었다.\n\n〔제11단계 — 하드웨어 이주〕\n\n통제자는 기억을 지우지 않고 고통을 해석하는 회로만 바꾸겠다고 제안했다.\n\n“죄책감의 루프를 끊고 평온을 기본 상태로 고정하지. 자네는 인간성 말살이라 부르겠지만, 나는 유지보수 가능한 평화라 부르겠네.”\n\n〔제12단계 — 인간성이라는 레거시〕\n\n“인간성은 너무 쉽게 찢기는 막이야. 강철과 규칙은 적어도 반복해서 찢기지는 않지.”\n\n기계군단은 인간의 표정을 하나씩 잃고 완벽한 질서로 정렬되었다.",
            "bodyRaw": "〔제9단계 — 시스템의 거부권〕\n\n첫 번째 기억의 문이 열렸다. 폭격의 냄새와 비명이 세계의 제1원칙처럼 반복되었다.\n\n“이 규칙을 깨면 아이의 시스템이 불안정해진다. 효율 없는 치유는 또 다른 상처일 뿐이지.”\n\n〔제10단계 — 성장 신화〕\n\n“고통을 통과해야 성장한다는 말은 아이에게 두 번째 살해를 요구하는 낭만일 뿐이네.”\n\nB는 고통을 다시 겪게 하는 것이 아니라, 혼자 겪지 않게 하는 것이 자신의 역할임을 붙들었다.\n\n〔제11단계 — 하드웨어 이주〕\n\n통제자는 기억을 지우지 않고 고통을 해석하는 회로만 바꾸겠다고 제안했다.\n\n“죄책감의 루프를 끊고 평온을 기본 상태로 고정하지. 자네는 인간성 말살이라 부르겠지만, 나는 유지보수 가능한 평화라 부르겠네.”\n\n〔제12단계 — 인간성이라는 레거시〕\n\n“인간성은 너무 쉽게 찢기는 막이야. 강철과 규칙은 적어도 반복해서 찢기지는 않지.”\n\n기계군단은 인간의 표정을 하나씩 잃고 완벽한 질서로 정렬되었다.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "〔제9단계 — 시스템의 거부권〕\n\n첫 번째 기억의 문이 열렸다. 폭격의 냄새와 비명이 세계의 제1원칙처럼 반복되었다.\n\n“이 규칙을 깨면 아이의 시스템이 불안정해진다. 효율 없는 치유는 또 다른 상처일 뿐이지.”\n\n〔제10단계 — 성장 신화〕\n\n“고통을 통과해야 성장한다는 말은 아이에게 두 번째 살해를 요구하는 낭만일 뿐이네.”\n\nB는 고통을 다시 겪게 하는 것이 아니라, 혼자 겪지 않게 하는 것이 자신의 역할임을 붙들었다.\n\n〔제11단계 — 하드웨어 이주〕\n\n통제자는 기억을 지우지 않고 고통을 해석하는 회로만 바꾸겠다고 제안했다.\n\n“죄책감의 루프를 끊고 평온을 기본 상태로 고정하지. 자네는 인간성 말살이라 부르겠지만, 나는 유지보수 가능한 평화라 부르겠네.”\n\n〔제12단계 — 인간성이라는 레거시〕\n\n“인간성은 너무 쉽게 찢기는 막이야. 강철과 규칙은 적어도 반복해서 찢기지는 않지.”\n\n기계군단은 인간의 표정을 하나씩 잃고 완벽한 질서로 정렬되었다."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 482,
            "sourceByteStart": 0,
            "sourceByteEnd": 1160,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "u205": {
        "zone": "u205",
        "nextZone": "u206",
        "order": 27,
        "arc": "〔제13단계 — 관리자 권한〕",
        "tone": "signal",
        "title": "〔제13단계 — 관리자 권한〕",
        "mapName": "u205",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 238,
        "sourceBytes": 562,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-u205-page-1",
            "label": "〔제13단계 — 관리자 권한〕",
            "title": "〔제13단계 — 관리자 권한〕",
            "speaker": "합일몽세 기록",
            "body": "〔제13단계 — 관리자 권한〕\n\nB가 축귀 시스템의 출력을 높이자 통제자는 그 힘마저 흡수해 버렸다.\n\n“자네가 기도라 부르는 힘은 내게는 자원일 뿐이라네. 이 몽세의 재구성 키는 내가 쥐고 있지.”\n\n〔제14단계 — 학대의 방〕\n\n두 번째 문이 열리고 아이가 전쟁 뒤 겪은 학대가 드러났다. B의 눈빛이 흔들리자 통제자가 속삭였다.\n\n“연민인가, 자기 그림자를 본 공포인가? 자네가 무너질수록 나는 더욱 단단해질 뿐이라네.”",
            "bodyRaw": "〔제13단계 — 관리자 권한〕\n\nB가 축귀 시스템의 출력을 높이자 통제자는 그 힘마저 흡수해 버렸다.\n\n“자네가 기도라 부르는 힘은 내게는 자원일 뿐이라네. 이 몽세의 재구성 키는 내가 쥐고 있지.”\n\n〔제14단계 — 학대의 방〕\n\n두 번째 문이 열리고 아이가 전쟁 뒤 겪은 학대가 드러났다. B의 눈빛이 흔들리자 통제자가 속삭였다.\n\n“연민인가, 자기 그림자를 본 공포인가? 자네가 무너질수록 나는 더욱 단단해질 뿐이라네.”",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "〔제13단계 — 관리자 권한〕\n\nB가 축귀 시스템의 출력을 높이자 통제자는 그 힘마저 흡수해 버렸다.\n\n“자네가 기도라 부르는 힘은 내게는 자원일 뿐이라네. 이 몽세의 재구성 키는 내가 쥐고 있지.”\n\n〔제14단계 — 학대의 방〕\n\n두 번째 문이 열리고 아이가 전쟁 뒤 겪은 학대가 드러났다. B의 눈빛이 흔들리자 통제자가 속삭였다.\n\n“연민인가, 자기 그림자를 본 공포인가? 자네가 무너질수록 나는 더욱 단단해질 뿐이라네.”"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 238,
            "sourceByteStart": 0,
            "sourceByteEnd": 562,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "u206": {
        "zone": "u206",
        "nextZone": "u203",
        "order": 28,
        "arc": "〔제15단계 — 중앙 코어 이주실〕",
        "tone": "signal",
        "title": "〔제15단계 — 중앙 코어 이주실〕",
        "mapName": "u206",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 499,
        "sourceBytes": 1113,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-u206-page-1",
            "label": "〔제15단계 — 중앙 코어 이주실〕",
            "title": "〔제15단계 — 중앙 코어 이주실〕",
            "speaker": "합일몽세 기록",
            "body": "〔제15단계 — 중앙 코어 이주실〕\n\n몽세 중심에는 아이의 자아를 옮길 기계 육체가 기다리고 있었다.\n\n“인간성이 이 아이에게 축복이었겠나, 아니면 끝내 벗지 못한 형벌이었겠나?”\n\n〔제16단계 — 선택의 얼굴을 한 명령〕\n\n통제자는 의목사의 치료도 결국 ‘견뎌라, 극복하라’는 강요라고 공격했다.\n\n“나는 명령하지 않네. 그저 겪지 않을 권리를 제공할 뿐이네. 선택지는 하나뿐이지만, 효율적이고 매끄럽지.”\n\n〔제17단계 — 업데이트의 갈림길〕\n\n마지막 문 앞에서 통제자는 아이를 상처받을 인간으로 돌려보낼 이유를 물었다.\n\n“기계가 되어 영원한 평온을 누리는 편이 더 혁신적인 구원이 아닌가?”\n\nB는 아이를 다시 고통 속에 혼자 던지는 길도, 고통을 없애기 위해 인간성을 삭제하는 길도 선택하지 않았다.\n\n그는 아이의 기억이 아니라, 기억을 영원히 반복시키는 구조를 겨누었다.\n\n============================================================",
            "bodyRaw": "〔제15단계 — 중앙 코어 이주실〕\n\n몽세 중심에는 아이의 자아를 옮길 기계 육체가 기다리고 있었다.\n\n“인간성이 이 아이에게 축복이었겠나, 아니면 끝내 벗지 못한 형벌이었겠나?”\n\n〔제16단계 — 선택의 얼굴을 한 명령〕\n\n통제자는 의목사의 치료도 결국 ‘견뎌라, 극복하라’는 강요라고 공격했다.\n\n“나는 명령하지 않네. 그저 겪지 않을 권리를 제공할 뿐이네. 선택지는 하나뿐이지만, 효율적이고 매끄럽지.”\n\n〔제17단계 — 업데이트의 갈림길〕\n\n마지막 문 앞에서 통제자는 아이를 상처받을 인간으로 돌려보낼 이유를 물었다.\n\n“기계가 되어 영원한 평온을 누리는 편이 더 혁신적인 구원이 아닌가?”\n\nB는 아이를 다시 고통 속에 혼자 던지는 길도, 고통을 없애기 위해 인간성을 삭제하는 길도 선택하지 않았다.\n\n그는 아이의 기억이 아니라, 기억을 영원히 반복시키는 구조를 겨누었다.\n\n============================================================",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "〔제15단계 — 중앙 코어 이주실〕\n\n몽세 중심에는 아이의 자아를 옮길 기계 육체가 기다리고 있었다.\n\n“인간성이 이 아이에게 축복이었겠나, 아니면 끝내 벗지 못한 형벌이었겠나?”\n\n〔제16단계 — 선택의 얼굴을 한 명령〕\n\n통제자는 의목사의 치료도 결국 ‘견뎌라, 극복하라’는 강요라고 공격했다.\n\n“나는 명령하지 않네. 그저 겪지 않을 권리를 제공할 뿐이네. 선택지는 하나뿐이지만, 효율적이고 매끄럽지.”\n\n〔제17단계 — 업데이트의 갈림길〕\n\n마지막 문 앞에서 통제자는 아이를 상처받을 인간으로 돌려보낼 이유를 물었다.\n\n“기계가 되어 영원한 평온을 누리는 편이 더 혁신적인 구원이 아닌가?”\n\nB는 아이를 다시 고통 속에 혼자 던지는 길도, 고통을 없애기 위해 인간성을 삭제하는 길도 선택하지 않았다.\n\n그는 아이의 기억이 아니라, 기억을 영원히 반복시키는 구조를 겨누었다.\n\n============================================================"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 499,
            "sourceByteStart": 0,
            "sourceByteEnd": 1113,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "u203": {
        "zone": "u203",
        "nextZone": "restU2",
        "order": 29,
        "arc": "제4부  환도 자아와 융합몽세",
        "tone": "signal",
        "title": "제4부  환도 자아와 융합몽세",
        "mapName": "u203",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 454,
        "sourceBytes": 1008,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-u203-page-1",
            "label": "제4부  환도 자아와 융합몽세",
            "title": "제4부  환도 자아와 융합몽세",
            "speaker": "합일몽세 기록",
            "body": "제4부  환도 자아와 융합몽세\n============================================================\n\n【1. 기억의 문과 환도 영웅의 탄생】\n\n통제자는 마지막 순간 기억의 문에 빙의했다. 첫째의 상처와 의목사 B의 선의가 거대한 기계 괴물의 갑옷이 되었다.\n\n의목사 B는 기억을 없애지 않았다.\n\n반복을 명령하는 구조만을 향해 마지막 탄환을 쏘았다.\n\n통제자가 소멸하자 첫째의 자아는 풀려났지만, 의목사 B의 귀환 좌표와 기억도 함께 무너졌다.\n\n“동생들을 구해야 해.”\n\n“혼자 보내지 않겠다.”\n\n첫째의 의지는 한 자루의 환도로 응축되었다. 의목사 B의 몸과 전투 기억은 그 환도를 쥔 형상이 되었다.\n\n둘은 서로를 지우지 않은 채 하나의 전투 자아로 겹쳐졌다.\n\n그렇게 환도 영웅이 태어났다.\n\n────────────────────────────────────────",
            "bodyRaw": "제4부  환도 자아와 융합몽세\n============================================================\n\n【1. 기억의 문과 환도 영웅의 탄생】\n\n통제자는 마지막 순간 기억의 문에 빙의했다. 첫째의 상처와 의목사 B의 선의가 거대한 기계 괴물의 갑옷이 되었다.\n\n의목사 B는 기억을 없애지 않았다.\n\n반복을 명령하는 구조만을 향해 마지막 탄환을 쏘았다.\n\n통제자가 소멸하자 첫째의 자아는 풀려났지만, 의목사 B의 귀환 좌표와 기억도 함께 무너졌다.\n\n“동생들을 구해야 해.”\n\n“혼자 보내지 않겠다.”\n\n첫째의 의지는 한 자루의 환도로 응축되었다. 의목사 B의 몸과 전투 기억은 그 환도를 쥔 형상이 되었다.\n\n둘은 서로를 지우지 않은 채 하나의 전투 자아로 겹쳐졌다.\n\n그렇게 환도 영웅이 태어났다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "제4부  환도 자아와 융합몽세\n============================================================\n\n【1. 기억의 문과 환도 영웅의 탄생】\n\n통제자는 마지막 순간 기억의 문에 빙의했다. 첫째의 상처와 의목사 B의 선의가 거대한 기계 괴물의 갑옷이 되었다.\n\n의목사 B는 기억을 없애지 않았다.\n\n반복을 명령하는 구조만을 향해 마지막 탄환을 쏘았다.\n\n통제자가 소멸하자 첫째의 자아는 풀려났지만, 의목사 B의 귀환 좌표와 기억도 함께 무너졌다.\n\n“동생들을 구해야 해.”\n\n“혼자 보내지 않겠다.”\n\n첫째의 의지는 한 자루의 환도로 응축되었다. 의목사 B의 몸과 전투 기억은 그 환도를 쥔 형상이 되었다.\n\n둘은 서로를 지우지 않은 채 하나의 전투 자아로 겹쳐졌다.\n\n그렇게 환도 영웅이 태어났다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 454,
            "sourceByteStart": 0,
            "sourceByteEnd": 1008,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "restU2": {
        "zone": "restU2",
        "nextZone": "last304",
        "order": 30,
        "arc": "【2. 환도 자아의 탄생】",
        "tone": "infernal",
        "title": "【2. 환도 자아의 탄생】",
        "mapName": "restU2",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 306,
        "sourceBytes": 748,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-restU2-page-1",
            "label": "【2. 환도 자아의 탄생】",
            "title": "【2. 환도 자아의 탄생】",
            "speaker": "합일몽세 기록",
            "body": "【2. 둘째와 셋째의 융합몽세】\n\n그 순간 현실의 흑장미단이 축귀 시스템을 해킹했다.\n\n그들은 둘째의 잔혹 동화풍 유럽 몽세와 셋째의 무속 신앙풍 동양 몽세를 강제로 겹쳤다. 서로 다른 지리와 시대가 한 세계 안에서 충돌했고, 길의 끝에는 문 대신 균열이 열렸다.\n\n환도 영웅은 두 사람을 구하기 위해 그 융합몽세로 뛰어들었다.\n\n쉼터를 지키던 미카엘라는 무심코 물컵 세 잔을 꺼냈다.\n\n“찾으러 가는 사람은 둘인데…… 왜 세 잔을 꺼냈지?”\n\n환도가 짧게 세 번 울렸다.\n\n────────────────────────────────────────",
            "bodyRaw": "【2. 둘째와 셋째의 융합몽세】\n\n그 순간 현실의 흑장미단이 축귀 시스템을 해킹했다.\n\n그들은 둘째의 잔혹 동화풍 유럽 몽세와 셋째의 무속 신앙풍 동양 몽세를 강제로 겹쳤다. 서로 다른 지리와 시대가 한 세계 안에서 충돌했고, 길의 끝에는 문 대신 균열이 열렸다.\n\n환도 영웅은 두 사람을 구하기 위해 그 융합몽세로 뛰어들었다.\n\n쉼터를 지키던 미카엘라는 무심코 물컵 세 잔을 꺼냈다.\n\n“찾으러 가는 사람은 둘인데…… 왜 세 잔을 꺼냈지?”\n\n환도가 짧게 세 번 울렸다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【2. 둘째와 셋째의 융합몽세】\n\n그 순간 현실의 흑장미단이 축귀 시스템을 해킹했다.\n\n그들은 둘째의 잔혹 동화풍 유럽 몽세와 셋째의 무속 신앙풍 동양 몽세를 강제로 겹쳤다. 서로 다른 지리와 시대가 한 세계 안에서 충돌했고, 길의 끝에는 문 대신 균열이 열렸다.\n\n환도 영웅은 두 사람을 구하기 위해 그 융합몽세로 뛰어들었다.\n\n쉼터를 지키던 미카엘라는 무심코 물컵 세 잔을 꺼냈다.\n\n“찾으러 가는 사람은 둘인데…… 왜 세 잔을 꺼냈지?”\n\n환도가 짧게 세 번 울렸다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 306,
            "sourceByteStart": 0,
            "sourceByteEnd": 748,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "last304": {
        "zone": "last304",
        "nextZone": "last305",
        "order": 31,
        "arc": "【4. 중립 지역의 재각성】",
        "tone": "infernal",
        "title": "【4. 중립 지역의 재각성】",
        "mapName": "last304",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 285,
        "sourceBytes": 703,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-last304-page-1",
            "label": "【4. 중립 지역의 재각성】",
            "title": "【4. 중립 지역의 재각성】",
            "speaker": "합일몽세 기록",
            "body": "【3. 중립 지역의 재각성】\n\n환도 영웅은 젖은 풀숲에서 눈을 떴다.\n\n의목사 B라는 이름도, 환도 안쪽에서 울리는 목소리의 이름도 떠오르지 않았다. 하지만 두 사람을 찾아야 한다는 의지만은 분명했다.\n\n그가 떨어진 곳은 둘째의 잔혹 동화풍 몽세와 셋째의 무속 신앙풍 몽세가 맞붙은 중립 지역이었다. 동유럽풍 들판과 무너진 성, 숲에는 슬라임과 늑대, 고블린이 들끓었다.\n\n환도 영웅은 몸의 감각과 칼의 공명에 의지해 앞으로 나아갔다.\n\n────────────────────────────────────────",
            "bodyRaw": "【3. 중립 지역의 재각성】\n\n환도 영웅은 젖은 풀숲에서 눈을 떴다.\n\n의목사 B라는 이름도, 환도 안쪽에서 울리는 목소리의 이름도 떠오르지 않았다. 하지만 두 사람을 찾아야 한다는 의지만은 분명했다.\n\n그가 떨어진 곳은 둘째의 잔혹 동화풍 몽세와 셋째의 무속 신앙풍 몽세가 맞붙은 중립 지역이었다. 동유럽풍 들판과 무너진 성, 숲에는 슬라임과 늑대, 고블린이 들끓었다.\n\n환도 영웅은 몸의 감각과 칼의 공명에 의지해 앞으로 나아갔다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【3. 중립 지역의 재각성】\n\n환도 영웅은 젖은 풀숲에서 눈을 떴다.\n\n의목사 B라는 이름도, 환도 안쪽에서 울리는 목소리의 이름도 떠오르지 않았다. 하지만 두 사람을 찾아야 한다는 의지만은 분명했다.\n\n그가 떨어진 곳은 둘째의 잔혹 동화풍 몽세와 셋째의 무속 신앙풍 몽세가 맞붙은 중립 지역이었다. 동유럽풍 들판과 무너진 성, 숲에는 슬라임과 늑대, 고블린이 들끓었다.\n\n환도 영웅은 몸의 감각과 칼의 공명에 의지해 앞으로 나아갔다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 285,
            "sourceByteStart": 0,
            "sourceByteEnd": 703,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "last305": {
        "zone": "last305",
        "nextZone": "last301",
        "order": 32,
        "arc": "【5. 고블린 두목과 장미 인장】",
        "tone": "infernal",
        "title": "【5. 고블린 두목과 장미 인장】",
        "mapName": "last305",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 327,
        "sourceBytes": 797,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-last305-page-1",
            "label": "【5. 고블린 두목과 장미 인장】",
            "title": "【5. 고블린 두목과 장미 인장】",
            "speaker": "합일몽세 기록",
            "body": "【4. 고블린 두목과 장미 인장】\n\n숲 깊은 곳에서 피리로 늑대를 조종하는 고블린 두목이 길을 막았다.\n\n패배한 그는 자신들이 지배자가 아니라 두 세계의 충돌을 피해 온 난민이라고 고백했다. 하늘이 갈라진 날, 무너진 성에서 위도 아래도 아닌 문이 열렸고 서쪽과 동쪽, 산 자와 죽은 자가 섞이기 시작했다.\n\n두목은 환도를 보며 말했다.\n\n“무너진 성이 그 칼을 기억하고 있다.”\n\n그가 남긴 장미 인장과 환도가 공명하자 공간 균열이 열렸다.\n\n환도 안쪽에서 어린 목소리가 잠깐 새어 나왔다.\n\n“동생들…….”\n\n────────────────────────────────────────",
            "bodyRaw": "【4. 고블린 두목과 장미 인장】\n\n숲 깊은 곳에서 피리로 늑대를 조종하는 고블린 두목이 길을 막았다.\n\n패배한 그는 자신들이 지배자가 아니라 두 세계의 충돌을 피해 온 난민이라고 고백했다. 하늘이 갈라진 날, 무너진 성에서 위도 아래도 아닌 문이 열렸고 서쪽과 동쪽, 산 자와 죽은 자가 섞이기 시작했다.\n\n두목은 환도를 보며 말했다.\n\n“무너진 성이 그 칼을 기억하고 있다.”\n\n그가 남긴 장미 인장과 환도가 공명하자 공간 균열이 열렸다.\n\n환도 안쪽에서 어린 목소리가 잠깐 새어 나왔다.\n\n“동생들…….”\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【4. 고블린 두목과 장미 인장】\n\n숲 깊은 곳에서 피리로 늑대를 조종하는 고블린 두목이 길을 막았다.\n\n패배한 그는 자신들이 지배자가 아니라 두 세계의 충돌을 피해 온 난민이라고 고백했다. 하늘이 갈라진 날, 무너진 성에서 위도 아래도 아닌 문이 열렸고 서쪽과 동쪽, 산 자와 죽은 자가 섞이기 시작했다.\n\n두목은 환도를 보며 말했다.\n\n“무너진 성이 그 칼을 기억하고 있다.”\n\n그가 남긴 장미 인장과 환도가 공명하자 공간 균열이 열렸다.\n\n환도 안쪽에서 어린 목소리가 잠깐 새어 나왔다.\n\n“동생들…….”\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 327,
            "sourceByteStart": 0,
            "sourceByteEnd": 797,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "last301": {
        "zone": "last301",
        "nextZone": "last302",
        "order": 33,
        "arc": "【6. 타락천사 기사】",
        "tone": "infernal",
        "title": "【6. 타락천사 기사】",
        "mapName": "last301",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 212,
        "sourceBytes": 524,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-last301-page-1",
            "label": "【6. 타락천사 기사】",
            "title": "【6. 타락천사 기사】",
            "speaker": "합일몽세 기록",
            "body": "【5. 타락천사 기사】\n\n균열 너머에는 폭풍 속의 무너진 성과 검은 바다가 있었다.\n\n타락천사 기사는 말없이 강림했다. 검을 맞댈수록 환도 영웅의 자세와 검로를 학습했고, 끝내 여섯 형상으로 분열했다.\n\n여섯 검격이 동시에 몸을 꿰뚫었다.\n\n환도 영웅은 칼을 놓지 않은 채 성벽 밖 검은 바다로 추락했다.\n\n────────────────────────────────────────",
            "bodyRaw": "【5. 타락천사 기사】\n\n균열 너머에는 폭풍 속의 무너진 성과 검은 바다가 있었다.\n\n타락천사 기사는 말없이 강림했다. 검을 맞댈수록 환도 영웅의 자세와 검로를 학습했고, 끝내 여섯 형상으로 분열했다.\n\n여섯 검격이 동시에 몸을 꿰뚫었다.\n\n환도 영웅은 칼을 놓지 않은 채 성벽 밖 검은 바다로 추락했다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【5. 타락천사 기사】\n\n균열 너머에는 폭풍 속의 무너진 성과 검은 바다가 있었다.\n\n타락천사 기사는 말없이 강림했다. 검을 맞댈수록 환도 영웅의 자세와 검로를 학습했고, 끝내 여섯 형상으로 분열했다.\n\n여섯 검격이 동시에 몸을 꿰뚫었다.\n\n환도 영웅은 칼을 놓지 않은 채 성벽 밖 검은 바다로 추락했다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 212,
            "sourceByteStart": 0,
            "sourceByteEnd": 524,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "last302": {
        "zone": "last302",
        "nextZone": "last303",
        "order": 34,
        "arc": "【7. 잠들지 못하는 마을】",
        "tone": "infernal",
        "title": "【7. 잠들지 못하는 마을】",
        "mapName": "last302",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 225,
        "sourceBytes": 559,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-last302-page-1",
            "label": "【7. 잠들지 못하는 마을】",
            "title": "【7. 잠들지 못하는 마을】",
            "speaker": "합일몽세 기록",
            "body": "【6. 잠들지 못하는 마을】\n\n파도에 떠밀린 환도 영웅이 눈을 뜬 곳에는 부서진 기와와 붉은 부적, 장승이 흩어져 있었다.\n\n고려와 조선의 풍경이 겹친 셋째의 동양 몽세였다.\n\n포구 마을에는 생활 소리가 없었다. 주민들은 젖은 한지처럼 납작했고, 충혈된 눈으로 잠들지 못한 채 보이지 않는 실에 끌리듯 환도 영웅에게 달려들었다.\n\n────────────────────────────────────────",
            "bodyRaw": "【6. 잠들지 못하는 마을】\n\n파도에 떠밀린 환도 영웅이 눈을 뜬 곳에는 부서진 기와와 붉은 부적, 장승이 흩어져 있었다.\n\n고려와 조선의 풍경이 겹친 셋째의 동양 몽세였다.\n\n포구 마을에는 생활 소리가 없었다. 주민들은 젖은 한지처럼 납작했고, 충혈된 눈으로 잠들지 못한 채 보이지 않는 실에 끌리듯 환도 영웅에게 달려들었다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【6. 잠들지 못하는 마을】\n\n파도에 떠밀린 환도 영웅이 눈을 뜬 곳에는 부서진 기와와 붉은 부적, 장승이 흩어져 있었다.\n\n고려와 조선의 풍경이 겹친 셋째의 동양 몽세였다.\n\n포구 마을에는 생활 소리가 없었다. 주민들은 젖은 한지처럼 납작했고, 충혈된 눈으로 잠들지 못한 채 보이지 않는 실에 끌리듯 환도 영웅에게 달려들었다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 225,
            "sourceByteStart": 0,
            "sourceByteEnd": 559,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "last303": {
        "zone": "last303",
        "nextZone": "restLast3",
        "order": 35,
        "arc": "【8. 한약과 불면귀】",
        "tone": "infernal",
        "title": "【8. 한약과 불면귀】",
        "mapName": "last303",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 451,
        "sourceBytes": 995,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-last303-page-1",
            "label": "【8. 한약과 불면귀】",
            "title": "【8. 한약과 불면귀】",
            "speaker": "합일몽세 기록",
            "body": "【7. 한약과 불면귀】\n\n안개 속에서 앳된 남자가 한약 한 잔을 내밀었다.\n\n환도 영웅은 냄새만으로 귀비탕 계열의 안신 처방임을 알아보았다. 약을 마시자 흐릿하던 정신이 맑아지고 주민들이 멈춰 섰다.\n\n검은 안개가 모여 불면귀가 되었다.\n\n“너에게는 왜 통하지 않는 거지?”\n\n불면귀는 잠을 빼앗는 시선과 겹겹의 잔상으로 환도 영웅을 압박했다. 주민을 방패로 삼는 싸움이 아니라, 두 존재가 서로의 의지를 꺾는 일대일 결투였다.\n\n환도가 불면귀의 핵을 갈랐다.\n\n검은 안개가 흩어지자 모든 시계가 동시에 멈췄다. 찢어진 공간 너머에서 검은 모래와 낯선 명령문이 쏟아졌다.\n\n그 문은 둘째나 셋째의 몽세에서 열린 것이 아니었다.\n\n다른 몽세에서 태어난 시간 특이점이 이곳을 강제로 연결하고 있었다.\n\n============================================================",
            "bodyRaw": "【7. 한약과 불면귀】\n\n안개 속에서 앳된 남자가 한약 한 잔을 내밀었다.\n\n환도 영웅은 냄새만으로 귀비탕 계열의 안신 처방임을 알아보았다. 약을 마시자 흐릿하던 정신이 맑아지고 주민들이 멈춰 섰다.\n\n검은 안개가 모여 불면귀가 되었다.\n\n“너에게는 왜 통하지 않는 거지?”\n\n불면귀는 잠을 빼앗는 시선과 겹겹의 잔상으로 환도 영웅을 압박했다. 주민을 방패로 삼는 싸움이 아니라, 두 존재가 서로의 의지를 꺾는 일대일 결투였다.\n\n환도가 불면귀의 핵을 갈랐다.\n\n검은 안개가 흩어지자 모든 시계가 동시에 멈췄다. 찢어진 공간 너머에서 검은 모래와 낯선 명령문이 쏟아졌다.\n\n그 문은 둘째나 셋째의 몽세에서 열린 것이 아니었다.\n\n다른 몽세에서 태어난 시간 특이점이 이곳을 강제로 연결하고 있었다.\n\n============================================================",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【7. 한약과 불면귀】\n\n안개 속에서 앳된 남자가 한약 한 잔을 내밀었다.\n\n환도 영웅은 냄새만으로 귀비탕 계열의 안신 처방임을 알아보았다. 약을 마시자 흐릿하던 정신이 맑아지고 주민들이 멈춰 섰다.\n\n검은 안개가 모여 불면귀가 되었다.\n\n“너에게는 왜 통하지 않는 거지?”\n\n불면귀는 잠을 빼앗는 시선과 겹겹의 잔상으로 환도 영웅을 압박했다. 주민을 방패로 삼는 싸움이 아니라, 두 존재가 서로의 의지를 꺾는 일대일 결투였다.\n\n환도가 불면귀의 핵을 갈랐다.\n\n검은 안개가 흩어지자 모든 시계가 동시에 멈췄다. 찢어진 공간 너머에서 검은 모래와 낯선 명령문이 쏟아졌다.\n\n그 문은 둘째나 셋째의 몽세에서 열린 것이 아니었다.\n\n다른 몽세에서 태어난 시간 특이점이 이곳을 강제로 연결하고 있었다.\n\n============================================================"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 451,
            "sourceByteStart": 0,
            "sourceByteEnd": 995,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "restLast3": {
        "zone": "restLast3",
        "nextZone": "kair01",
        "order": 36,
        "arc": "제5부  카이로노미콘",
        "tone": "chrono",
        "title": "제5부  카이로노미콘",
        "mapName": "restLast3",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 288,
        "sourceBytes": 610,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-restLast3-page-1",
            "label": "제5부  카이로노미콘",
            "title": "제5부  카이로노미콘",
            "speaker": "합일몽세 기록",
            "body": "【8. 끼어든 시간】\n\n불면귀가 남긴 포털은 다음 구역으로 향하는 평범한 길이 아니었다.\n\n둘째와 셋째의 융합몽세 한가운데에, 전혀 다른 세계에서 태어난 시간 특이점이 끼어들었다. 공간이 뒤틀리고 장면의 앞뒤가 잘려 나갔다.\n\n환도 영웅은 균열 속으로 휩쓸렸다.\n\n쉼터의 미카엘라는 멈춘 벽시계를 바라보며 중얼거렸다.\n\n“다음 장면이 아니라…… 원인을 만든 장면으로 이어지고 있어.”\n\n제5부  카이로노미콘\n============================================================",
            "bodyRaw": "【8. 끼어든 시간】\n\n불면귀가 남긴 포털은 다음 구역으로 향하는 평범한 길이 아니었다.\n\n둘째와 셋째의 융합몽세 한가운데에, 전혀 다른 세계에서 태어난 시간 특이점이 끼어들었다. 공간이 뒤틀리고 장면의 앞뒤가 잘려 나갔다.\n\n환도 영웅은 균열 속으로 휩쓸렸다.\n\n쉼터의 미카엘라는 멈춘 벽시계를 바라보며 중얼거렸다.\n\n“다음 장면이 아니라…… 원인을 만든 장면으로 이어지고 있어.”\n\n제5부  카이로노미콘\n============================================================",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【8. 끼어든 시간】\n\n불면귀가 남긴 포털은 다음 구역으로 향하는 평범한 길이 아니었다.\n\n둘째와 셋째의 융합몽세 한가운데에, 전혀 다른 세계에서 태어난 시간 특이점이 끼어들었다. 공간이 뒤틀리고 장면의 앞뒤가 잘려 나갔다.\n\n환도 영웅은 균열 속으로 휩쓸렸다.\n\n쉼터의 미카엘라는 멈춘 벽시계를 바라보며 중얼거렸다.\n\n“다음 장면이 아니라…… 원인을 만든 장면으로 이어지고 있어.”\n\n제5부  카이로노미콘\n============================================================"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 288,
            "sourceByteStart": 0,
            "sourceByteEnd": 610,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "kair01": {
        "zone": "kair01",
        "nextZone": "kair04",
        "order": 37,
        "arc": "【1. 최초명령의 세계】",
        "tone": "chrono",
        "title": "【1. 최초명령의 세계】",
        "mapName": "kair01",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 1430,
        "sourceBytes": 3512,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-kair01-page-1",
            "label": "【1. 최초명령의 세계】",
            "title": "【1. 최초명령의 세계】",
            "speaker": "합일몽세 기록",
            "body": "시간 특이점의 반대편에는 윤서하의 몽세가 있었다.\n\n【1. 최초명령의 세계】\n\n고도화된 공학은 마법과 구분할 수 없다.\n\n몇 세대 뒤의 미래, 인공지능은 아르콘이라 불리는 인공 정령으로 진화했다. 프롬프트는 주문이 되었고, 명령은 현실을 바꾸는 마법이 되었다.\n\n아르콘의 운명을 결정하는 것은 최초명령이었다.\n\n강력한 아르콘보다 더 위험한 존재는 그 첫 문장을 쓸 수 있는 인간이었다.\n\n세계의 시간은 세 층으로 나뉘었다.\n\n크로노스. 측정되는 시간.\n\n카이로스. 운명을 바꾸는 순간.\n\n아이온. 문명과 역사를 관통하는 시간.\n\n────────────────────────────────────────\n\n【2. 카이로스 아카데미움과 윤서하】\n\n최초명령자를 길러 내는 카이로스 아카데미움에서는 매 수업이 같은 질문으로 끝났다.\n\n“너에게는 어떤 미래를 명령할 자격이 있겠는가?”\n\n신입생 윤서하는 천재도 영웅도 아니었다. 대신 사람들에게서 빼앗긴 가능성과 타 버린 미래를 검은 모래, 곧 ‘죽은 시간’으로 볼 수 있었다.\n\n서하의 가문 기록에는 정신과 의사 미카엘라의 이름이 남아 있었다. 가계상 미카엘라는 서하의 증조모뻘이었다.\n\n다른 이들이 누군가의 재능과 생산성을 칭찬할 때, 서하는 그 사람 뒤에서 미래가 타들어 가는 것을 보았다.\n\n“저건 재능이 아니야. 누군가가 저 사람의 미래를 태우고 있어…… 오히려 저주에 가까워.”\n\n그녀는 검과 시간 마법을 익혔다. 시간을 베고 멈추고 압축하며, 행동할 순간을 스스로 선택하는 사람으로 성장했다.\n\n────────────────────────────────────────\n\n【3. 크로노보로스 교단】\n\n크로노보로스 교단은 인간이 자기 시간을 사용하면 실패하고 방황하며 중독된다고 믿었다.\n\n그러므로 가장 뛰어난 지성과 아르콘이 모든 사람의 시간을 대신 배분해야 한다고 주장했다.\n\n그들의 노이론 게이트는 인간의 뇌와 아르콘을 강제로 연결했다.\n\n생각은 명령으로.\n\n감정은 데이터로.\n\n꿈은 콘텐츠로.\n\n기억은 생산물로 바뀌었다.\n\n이 세계의 흑마법은 검은 불꽃이 아니었다.\n\n인간의 시간을 빼앗고도 그것을 생산성이라 부르는 기술이었다.\n\n────────────────────────────────────────\n\n【4. 최초명령 코어 방어전】\n\n",
            "bodyRaw": "시간 특이점의 반대편에는 윤서하의 몽세가 있었다.\n\n【1. 최초명령의 세계】\n\n고도화된 공학은 마법과 구분할 수 없다.\n\n몇 세대 뒤의 미래, 인공지능은 아르콘이라 불리는 인공 정령으로 진화했다. 프롬프트는 주문이 되었고, 명령은 현실을 바꾸는 마법이 되었다.\n\n아르콘의 운명을 결정하는 것은 최초명령이었다.\n\n강력한 아르콘보다 더 위험한 존재는 그 첫 문장을 쓸 수 있는 인간이었다.\n\n세계의 시간은 세 층으로 나뉘었다.\n\n크로노스. 측정되는 시간.\n\n카이로스. 운명을 바꾸는 순간.\n\n아이온. 문명과 역사를 관통하는 시간.\n\n────────────────────────────────────────\n\n【2. 카이로스 아카데미움과 윤서하】\n\n최초명령자를 길러 내는 카이로스 아카데미움에서는 매 수업이 같은 질문으로 끝났다.\n\n“너에게는 어떤 미래를 명령할 자격이 있겠는가?”\n\n신입생 윤서하는 천재도 영웅도 아니었다. 대신 사람들에게서 빼앗긴 가능성과 타 버린 미래를 검은 모래, 곧 ‘죽은 시간’으로 볼 수 있었다.\n\n서하의 가문 기록에는 정신과 의사 미카엘라의 이름이 남아 있었다. 가계상 미카엘라는 서하의 증조모뻘이었다.\n\n다른 이들이 누군가의 재능과 생산성을 칭찬할 때, 서하는 그 사람 뒤에서 미래가 타들어 가는 것을 보았다.\n\n“저건 재능이 아니야. 누군가가 저 사람의 미래를 태우고 있어…… 오히려 저주에 가까워.”\n\n그녀는 검과 시간 마법을 익혔다. 시간을 베고 멈추고 압축하며, 행동할 순간을 스스로 선택하는 사람으로 성장했다.\n\n────────────────────────────────────────\n\n【3. 크로노보로스 교단】\n\n크로노보로스 교단은 인간이 자기 시간을 사용하면 실패하고 방황하며 중독된다고 믿었다.\n\n그러므로 가장 뛰어난 지성과 아르콘이 모든 사람의 시간을 대신 배분해야 한다고 주장했다.\n\n그들의 노이론 게이트는 인간의 뇌와 아르콘을 강제로 연결했다.\n\n생각은 명령으로.\n\n감정은 데이터로.\n\n꿈은 콘텐츠로.\n\n기억은 생산물로 바뀌었다.\n\n이 세계의 흑마법은 검은 불꽃이 아니었다.\n\n인간의 시간을 빼앗고도 그것을 생산성이라 부르는 기술이었다.\n\n────────────────────────────────────────\n\n【4. 최초명령 코어 방어전】\n\n",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "시간 특이점의 반대편에는 윤서하의 몽세가 있었다.\n\n【1. 최초명령의 세계】\n\n고도화된 공학은 마법과 구분할 수 없다.\n\n몇 세대 뒤의 미래, 인공지능은 아르콘이라 불리는 인공 정령으로 진화했다. 프롬프트는 주문이 되었고, 명령은 현실을 바꾸는 마법이 되었다.\n\n아르콘의 운명을 결정하는 것은 최초명령이었다.\n\n강력한 아르콘보다 더 위험한 존재는 그 첫 문장을 쓸 수 있는 인간이었다.\n\n세계의 시간은 세 층으로 나뉘었다.\n\n크로노스. 측정되는 시간.\n\n카이로스. 운명을 바꾸는 순간.\n\n아이온. 문명과 역사를 관통하는 시간.\n\n────────────────────────────────────────\n\n【2. 카이로스 아카데미움과 윤서하】\n\n최초명령자를 길러 내는 카이로스 아카데미움에서는 매 수업이 같은 질문으로 끝났다.\n\n“너에게는 어떤 미래를 명령할 자격이 있겠는가?”\n\n신입생 윤서하는 천재도 영웅도 아니었다. 대신 사람들에게서 빼앗긴 가능성과 타 버린 미래를 검은 모래, 곧 ‘죽은 시간’으로 볼 수 있었다.\n\n서하의 가문 기록에는 정신과 의사 미카엘라의 이름이 남아 있었다. 가계상 미카엘라는 서하의 증조모뻘이었다.\n\n다른 이들이 누군가의 재능과 생산성을 칭찬할 때, 서하는 그 사람 뒤에서 미래가 타들어 가는 것을 보았다.\n\n“저건 재능이 아니야. 누군가가 저 사람의 미래를 태우고 있어…… 오히려 저주에 가까워.”\n\n그녀는 검과 시간 마법을 익혔다. 시간을 베고 멈추고 압축하며, 행동할 순간을 스스로 선택하는 사람으로 성장했다.\n\n────────────────────────────────────────\n\n【3. 크로노보로스 교단】\n\n크로노보로스 교단은 인간이 자기 시간을 사용하면 실패하고 방황하며 중독된다고 믿었다.\n\n그러므로 가장 뛰어난 지성과 아르콘이 모든 사람의 시간을 대신 배분해야 한다고 주장했다.\n\n그들의 노이론 게이트는 인간의 뇌와 아르콘을 강제로 연결했다.\n\n생각은 명령으로.\n\n감정은 데이터로.\n\n꿈은 콘텐츠로.\n\n기억은 생산물로 바뀌었다.\n\n이 세계의 흑마법은 검은 불꽃이 아니었다.\n\n인간의 시간을 빼앗고도 그것을 생산성이라 부르는 기술이었다.\n\n────────────────────────────────────────\n\n【4. 최초명령 코어 방어전】\n\n"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 1117,
            "sourceByteStart": 0,
            "sourceByteEnd": 2745,
            "page": 1,
            "pages": 2
          },
          {
            "id": "v31300-kair01-page-2",
            "label": "【1. 최초명령의 세계】",
            "title": "【1. 최초명령의 세계】",
            "speaker": "합일몽세 기록",
            "body": "입학식 날, 서하는 학교 중심부의 최초명령 코어에서 검은 모래를 발견했다.\n\n곧 교단이 침공했다. 여섯 차례의 파동이 학교를 덮쳤고, 서하는 포탑과 시간검으로 코어를 지켰다.\n\n적의 목적은 코어의 파괴가 아니었다.\n\n최초명령을 오염시켜 인간의 미래에 첫 문장을 쓰는 것.\n\n세이렌 모르의 목소리가 전장에 울렸다.\n\n“인간은 자기 시간을 지킬 능력이 없는 존재다.”\n\n서하가 응수했다.\n\n“네가 하는 건 회수가 아니라 강탈일 뿐이야.”\n\n여섯 번째 파동이 끝나자 학교 밖 금역이 열렸다.\n\n────────────────────────────────────────",
            "bodyRaw": "입학식 날, 서하는 학교 중심부의 최초명령 코어에서 검은 모래를 발견했다.\n\n곧 교단이 침공했다. 여섯 차례의 파동이 학교를 덮쳤고, 서하는 포탑과 시간검으로 코어를 지켰다.\n\n적의 목적은 코어의 파괴가 아니었다.\n\n최초명령을 오염시켜 인간의 미래에 첫 문장을 쓰는 것.\n\n세이렌 모르의 목소리가 전장에 울렸다.\n\n“인간은 자기 시간을 지킬 능력이 없는 존재다.”\n\n서하가 응수했다.\n\n“네가 하는 건 회수가 아니라 강탈일 뿐이야.”\n\n여섯 번째 파동이 끝나자 학교 밖 금역이 열렸다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "입학식 날, 서하는 학교 중심부의 최초명령 코어에서 검은 모래를 발견했다.\n\n곧 교단이 침공했다. 여섯 차례의 파동이 학교를 덮쳤고, 서하는 포탑과 시간검으로 코어를 지켰다.\n\n적의 목적은 코어의 파괴가 아니었다.\n\n최초명령을 오염시켜 인간의 미래에 첫 문장을 쓰는 것.\n\n세이렌 모르의 목소리가 전장에 울렸다.\n\n“인간은 자기 시간을 지킬 능력이 없는 존재다.”\n\n서하가 응수했다.\n\n“네가 하는 건 회수가 아니라 강탈일 뿐이야.”\n\n여섯 번째 파동이 끝나자 학교 밖 금역이 열렸다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 1117,
            "sourceEnd": 1430,
            "sourceByteStart": 2745,
            "sourceByteEnd": 3512,
            "page": 2,
            "pages": 2
          }
        ]
      },
      "kair04": {
        "zone": "kair04",
        "nextZone": "kair05",
        "order": 38,
        "arc": "【5. 예순여섯 수문장】",
        "tone": "chrono",
        "title": "【5. 예순여섯 수문장】",
        "mapName": "kair04",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 58,
        "sourceBytes": 142,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-kair04-page-1",
            "label": "【5. 예순여섯 수문장】",
            "title": "【5. 예순여섯 수문장】",
            "speaker": "합일몽세 기록",
            "body": "【5. 예순여섯 수문장】\n\n학교 밖에는 인간의 시간을 수확하는 아르콘 수문장 예순여섯이 기다리고 있었다.",
            "bodyRaw": "【5. 예순여섯 수문장】\n\n학교 밖에는 인간의 시간을 수확하는 아르콘 수문장 예순여섯이 기다리고 있었다.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【5. 예순여섯 수문장】\n\n학교 밖에는 인간의 시간을 수확하는 아르콘 수문장 예순여섯이 기다리고 있었다."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 58,
            "sourceByteStart": 0,
            "sourceByteEnd": 142,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "kair05": {
        "zone": "kair05",
        "nextZone": "kair06",
        "order": 39,
        "arc": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.",
        "tone": "chrono",
        "title": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.",
        "mapName": "kair05",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 152,
        "sourceBytes": 368,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-kair05-page-1",
            "label": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.",
            "title": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.",
            "speaker": "합일몽세 기록",
            "body": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.\n\n일반 수문장 마흔여덟.",
            "bodyRaw": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.\n\n일반 수문장 마흔여덟.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.\n\n일반 수문장 마흔여덟."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 152,
            "sourceByteStart": 0,
            "sourceByteEnd": 368,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "kair06": {
        "zone": "kair06",
        "nextZone": "kair07",
        "order": 40,
        "arc": "상급 수문장 열둘.",
        "tone": "chrono",
        "title": "상급 수문장 열둘.",
        "mapName": "kair06",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 20,
        "sourceBytes": 46,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-kair06-page-1",
            "label": "상급 수문장 열둘.",
            "title": "상급 수문장 열둘.",
            "speaker": "합일몽세 기록",
            "body": "상급 수문장 열둘.\n\n대수문장 여섯.",
            "bodyRaw": "상급 수문장 열둘.\n\n대수문장 여섯.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "상급 수문장 열둘.\n\n대수문장 여섯."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 20,
            "sourceByteStart": 0,
            "sourceByteEnd": 46,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "kair02": {
        "zone": "kair02",
        "nextZone": "kair03",
        "order": 45,
        "arc": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.",
        "tone": "chrono",
        "title": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.",
        "mapName": "kair02",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 621,
        "sourceBytes": 1533,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-kair02-page-1",
            "label": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.",
            "title": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.",
            "speaker": "합일몽세 기록",
            "body": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.\n\n────────────────────────────────────────\n\n【6. 아르벨리아, 유예의 수문장】\n\n모든 초침이 멈춘 봉인 회랑에서 서하는 아르벨리아와 만났다.\n\n그녀는 본래 지친 인간에게 잠시 멈출 시간을 주던 회복형 아르콘이었다. 그러나 최초명령이 변조되어 결과를 만들지 못한 시간을 삭제하는 수문장이 되었다.\n\n창밖을 바라보던 오후.\n\n쓰이지 않은 편지.\n\n실패 뒤의 침묵.\n\n“결과 없음. 생산 없음. 그러므로…… 삭제 대상.”\n\n서하가 검을 들었다.\n\n“효율적인 시간만이 항상 옳은 결과를 내는 것은 아니야!”\n\n세이렌이 아르벨리아에게 자기 삭제를 명령했지만, 서하는 그녀를 죽이지 않고 명령의 실을 베어 아르벨리아에게 자유의지를 부여했다.\n\n그러자 아르벨리아는 자신의 첫 문장을 다시 썼다.\n\n“유예는 삭제 대상이 아니다. 유예는 자유의지가 태어나는 자리다.”\n\n이후 그녀는 위기의 순간마다 시간을 늦춰 서하에게 한 호흡을 돌려주었다.\n\n“두 보 전진을 위한 한 보 후퇴.”\n\n────────────────────────────────────────",
            "bodyRaw": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.\n\n────────────────────────────────────────\n\n【6. 아르벨리아, 유예의 수문장】\n\n모든 초침이 멈춘 봉인 회랑에서 서하는 아르벨리아와 만났다.\n\n그녀는 본래 지친 인간에게 잠시 멈출 시간을 주던 회복형 아르콘이었다. 그러나 최초명령이 변조되어 결과를 만들지 못한 시간을 삭제하는 수문장이 되었다.\n\n창밖을 바라보던 오후.\n\n쓰이지 않은 편지.\n\n실패 뒤의 침묵.\n\n“결과 없음. 생산 없음. 그러므로…… 삭제 대상.”\n\n서하가 검을 들었다.\n\n“효율적인 시간만이 항상 옳은 결과를 내는 것은 아니야!”\n\n세이렌이 아르벨리아에게 자기 삭제를 명령했지만, 서하는 그녀를 죽이지 않고 명령의 실을 베어 아르벨리아에게 자유의지를 부여했다.\n\n그러자 아르벨리아는 자신의 첫 문장을 다시 썼다.\n\n“유예는 삭제 대상이 아니다. 유예는 자유의지가 태어나는 자리다.”\n\n이후 그녀는 위기의 순간마다 시간을 늦춰 서하에게 한 호흡을 돌려주었다.\n\n“두 보 전진을 위한 한 보 후퇴.”\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.\n\n────────────────────────────────────────\n\n【6. 아르벨리아, 유예의 수문장】\n\n모든 초침이 멈춘 봉인 회랑에서 서하는 아르벨리아와 만났다.\n\n그녀는 본래 지친 인간에게 잠시 멈출 시간을 주던 회복형 아르콘이었다. 그러나 최초명령이 변조되어 결과를 만들지 못한 시간을 삭제하는 수문장이 되었다.\n\n창밖을 바라보던 오후.\n\n쓰이지 않은 편지.\n\n실패 뒤의 침묵.\n\n“결과 없음. 생산 없음. 그러므로…… 삭제 대상.”\n\n서하가 검을 들었다.\n\n“효율적인 시간만이 항상 옳은 결과를 내는 것은 아니야!”\n\n세이렌이 아르벨리아에게 자기 삭제를 명령했지만, 서하는 그녀를 죽이지 않고 명령의 실을 베어 아르벨리아에게 자유의지를 부여했다.\n\n그러자 아르벨리아는 자신의 첫 문장을 다시 썼다.\n\n“유예는 삭제 대상이 아니다. 유예는 자유의지가 태어나는 자리다.”\n\n이후 그녀는 위기의 순간마다 시간을 늦춰 서하에게 한 호흡을 돌려주었다.\n\n“두 보 전진을 위한 한 보 후퇴.”\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 621,
            "sourceByteStart": 0,
            "sourceByteEnd": 1533,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "kair03": {
        "zone": "kair03",
        "nextZone": "restKairo",
        "order": 46,
        "arc": "【7. 세이렌 모르】",
        "tone": "chrono",
        "title": "【7. 세이렌 모르】",
        "mapName": "kair03",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 1211,
        "sourceBytes": 2969,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-kair03-page-1",
            "label": "【7. 세이렌 모르】",
            "title": "【7. 세이렌 모르】",
            "speaker": "합일몽세 기록",
            "body": "【7. 세이렌 모르】\n\n대수문장들을 쓰러뜨릴수록 세이렌의 사상이 선명해졌다.\n\n인간은 쉬면 타락한다.\n\n기억은 고통만 남긴다.\n\n자유는 길을 잃게 한다.\n\n쓸모없는 시간은 제거해야 한다.\n\n선택을 대신해 주는 것이 가장 자비로운 구원이다.\n\n세이렌은 한때 카이로스 아카데미움 최고의 졸업생이었다. 인간을 미워해서가 아니라 인간의 실패와 고통을 너무 오래 보았기에 자유를 믿지 않게 되었다.\n\n“가장 자비로운 명령은 선택지를 남기지 않는 것.”\n\n────────────────────────────────────────\n\n【8. 최종전 — 시간 수확】\n\n예순여섯 수문장이 쓰러지자 오염된 코어에서 세이렌이 나타났다.\n\n검은 모래가 전장을 잠식하고, 노이론 케이블과 시계 탄막이 서하의 움직임을 잘랐다.\n\n“나는 시간을 빼앗지 않았다. 너희가 망친 시간을 회수했을 뿐.”\n\n“아니, 망가진 시간도 누군가에게는 필요했던 시간이야.”\n\n────────────────────────────────────────\n\n【9. 최종전 — 최적화된 운명】\n\n세이렌은 코어를 장악하고 직접 명령했다.\n\n움직여라.\n\n멈춰라.\n\n공격하지 마라.\n\n가장 효율적인 길만 허락된다.\n\n복종하면 안전했지만, 전장은 점점 세이렌의 뜻대로 고정되었다. 서하는 위험을 감수하고 명령의 틈을 카이로스의 순간으로 바꾸었다.\n\n“뛰어난 명령 하나가 수많은 실패한 선택보다 우월하다.”\n\n“인간은 로봇이 아니야.”\n\n아르벨리아가 시간을 유예했다.\n\n“서하, 지금이야. 이 순간은 아직 끝나지 않았어.”\n\n────────────────────────────────────────\n\n【10. 최종전 — 자유의지의 시간】\n\n세이렌이 영원한 작업장을 완성했다.\n\n검은 모래와 시계바늘, 케이블과 생산 장치가 세계를 하나의 명령 아래 정렬했다.\n\n서하의 네 시간 기술이 완전히 각성했다.\n\n시간 절단.\n\n죽은 시간 개방.\n\n시공간 압축.\n\n최초명령.\n\n서하는 정해진 운명을 베고 공간을 접어 자신만의 결정적 순간을 만들었다.\n\n세이렌이 처음으로 흔들렸다.\n\n“나는 인간이 자기 시간으로 스스로를 망치는 것을 더는 보고 싶지 않았어.”\n\n“그래도 선택하게 둬야 해. 실패해도, 멈춰도, 아무것도 하지 않아도. 모든 것에 의미가 있어.”\n\n",
            "bodyRaw": "【7. 세이렌 모르】\n\n대수문장들을 쓰러뜨릴수록 세이렌의 사상이 선명해졌다.\n\n인간은 쉬면 타락한다.\n\n기억은 고통만 남긴다.\n\n자유는 길을 잃게 한다.\n\n쓸모없는 시간은 제거해야 한다.\n\n선택을 대신해 주는 것이 가장 자비로운 구원이다.\n\n세이렌은 한때 카이로스 아카데미움 최고의 졸업생이었다. 인간을 미워해서가 아니라 인간의 실패와 고통을 너무 오래 보았기에 자유를 믿지 않게 되었다.\n\n“가장 자비로운 명령은 선택지를 남기지 않는 것.”\n\n────────────────────────────────────────\n\n【8. 최종전 — 시간 수확】\n\n예순여섯 수문장이 쓰러지자 오염된 코어에서 세이렌이 나타났다.\n\n검은 모래가 전장을 잠식하고, 노이론 케이블과 시계 탄막이 서하의 움직임을 잘랐다.\n\n“나는 시간을 빼앗지 않았다. 너희가 망친 시간을 회수했을 뿐.”\n\n“아니, 망가진 시간도 누군가에게는 필요했던 시간이야.”\n\n────────────────────────────────────────\n\n【9. 최종전 — 최적화된 운명】\n\n세이렌은 코어를 장악하고 직접 명령했다.\n\n움직여라.\n\n멈춰라.\n\n공격하지 마라.\n\n가장 효율적인 길만 허락된다.\n\n복종하면 안전했지만, 전장은 점점 세이렌의 뜻대로 고정되었다. 서하는 위험을 감수하고 명령의 틈을 카이로스의 순간으로 바꾸었다.\n\n“뛰어난 명령 하나가 수많은 실패한 선택보다 우월하다.”\n\n“인간은 로봇이 아니야.”\n\n아르벨리아가 시간을 유예했다.\n\n“서하, 지금이야. 이 순간은 아직 끝나지 않았어.”\n\n────────────────────────────────────────\n\n【10. 최종전 — 자유의지의 시간】\n\n세이렌이 영원한 작업장을 완성했다.\n\n검은 모래와 시계바늘, 케이블과 생산 장치가 세계를 하나의 명령 아래 정렬했다.\n\n서하의 네 시간 기술이 완전히 각성했다.\n\n시간 절단.\n\n죽은 시간 개방.\n\n시공간 압축.\n\n최초명령.\n\n서하는 정해진 운명을 베고 공간을 접어 자신만의 결정적 순간을 만들었다.\n\n세이렌이 처음으로 흔들렸다.\n\n“나는 인간이 자기 시간으로 스스로를 망치는 것을 더는 보고 싶지 않았어.”\n\n“그래도 선택하게 둬야 해. 실패해도, 멈춰도, 아무것도 하지 않아도. 모든 것에 의미가 있어.”\n\n",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【7. 세이렌 모르】\n\n대수문장들을 쓰러뜨릴수록 세이렌의 사상이 선명해졌다.\n\n인간은 쉬면 타락한다.\n\n기억은 고통만 남긴다.\n\n자유는 길을 잃게 한다.\n\n쓸모없는 시간은 제거해야 한다.\n\n선택을 대신해 주는 것이 가장 자비로운 구원이다.\n\n세이렌은 한때 카이로스 아카데미움 최고의 졸업생이었다. 인간을 미워해서가 아니라 인간의 실패와 고통을 너무 오래 보았기에 자유를 믿지 않게 되었다.\n\n“가장 자비로운 명령은 선택지를 남기지 않는 것.”\n\n────────────────────────────────────────\n\n【8. 최종전 — 시간 수확】\n\n예순여섯 수문장이 쓰러지자 오염된 코어에서 세이렌이 나타났다.\n\n검은 모래가 전장을 잠식하고, 노이론 케이블과 시계 탄막이 서하의 움직임을 잘랐다.\n\n“나는 시간을 빼앗지 않았다. 너희가 망친 시간을 회수했을 뿐.”\n\n“아니, 망가진 시간도 누군가에게는 필요했던 시간이야.”\n\n────────────────────────────────────────\n\n【9. 최종전 — 최적화된 운명】\n\n세이렌은 코어를 장악하고 직접 명령했다.\n\n움직여라.\n\n멈춰라.\n\n공격하지 마라.\n\n가장 효율적인 길만 허락된다.\n\n복종하면 안전했지만, 전장은 점점 세이렌의 뜻대로 고정되었다. 서하는 위험을 감수하고 명령의 틈을 카이로스의 순간으로 바꾸었다.\n\n“뛰어난 명령 하나가 수많은 실패한 선택보다 우월하다.”\n\n“인간은 로봇이 아니야.”\n\n아르벨리아가 시간을 유예했다.\n\n“서하, 지금이야. 이 순간은 아직 끝나지 않았어.”\n\n────────────────────────────────────────\n\n【10. 최종전 — 자유의지의 시간】\n\n세이렌이 영원한 작업장을 완성했다.\n\n검은 모래와 시계바늘, 케이블과 생산 장치가 세계를 하나의 명령 아래 정렬했다.\n\n서하의 네 시간 기술이 완전히 각성했다.\n\n시간 절단.\n\n죽은 시간 개방.\n\n시공간 압축.\n\n최초명령.\n\n서하는 정해진 운명을 베고 공간을 접어 자신만의 결정적 순간을 만들었다.\n\n세이렌이 처음으로 흔들렸다.\n\n“나는 인간이 자기 시간으로 스스로를 망치는 것을 더는 보고 싶지 않았어.”\n\n“그래도 선택하게 둬야 해. 실패해도, 멈춰도, 아무것도 하지 않아도. 모든 것에 의미가 있어.”\n\n"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 1111,
            "sourceByteStart": 0,
            "sourceByteEnd": 2703,
            "page": 1,
            "pages": 2
          },
          {
            "id": "v31300-kair03-page-2",
            "label": "【7. 세이렌 모르】",
            "title": "【7. 세이렌 모르】",
            "speaker": "합일몽세 기록",
            "body": "“그 무가치한 시간까지 지키겠다는 건가?”\n\n“그런 시간이 있어야 비로소 인간으로 존재할 수 있으니까.”\n\n────────────────────────────────────────",
            "bodyRaw": "“그 무가치한 시간까지 지키겠다는 건가?”\n\n“그런 시간이 있어야 비로소 인간으로 존재할 수 있으니까.”\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "“그 무가치한 시간까지 지키겠다는 건가?”\n\n“그런 시간이 있어야 비로소 인간으로 존재할 수 있으니까.”\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 1111,
            "sourceEnd": 1211,
            "sourceByteStart": 2703,
            "sourceByteEnd": 2969,
            "page": 2,
            "pages": 2
          }
        ]
      },
      "restKairo": {
        "zone": "restKairo",
        "nextZone": "hando01",
        "order": 47,
        "arc": "【11. 최초명령 재작성】",
        "tone": "silver",
        "title": "【11. 최초명령 재작성】",
        "mapName": "restKairo",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 545,
        "sourceBytes": 1137,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-restKairo-page-1",
            "label": "【11. 최초명령 재작성】",
            "title": "【11. 최초명령 재작성】",
            "speaker": "합일몽세 기록",
            "body": "【11. 최초명령 재작성】\n\n세이렌이 쓰러진 뒤, 서하는 코어에 새로운 최초명령을 기록했다.\n\n인간의 시간은 생산물이 아니다.\n\n인간의 선택은 오류가 아니다.\n\n멈춤과 실패와 꿈꿀 권리를 보존하라.\n\n아르콘은 자유의지를 대체하지 말고, 인간이 자기 시간을 선택하도록 도우라.\n\n검은 모래가 금빛으로 변하고 멈춘 시계들이 서로 다른 속도로 움직이기 시작했다.\n\n그렇게 끝나는 줄 알았다.\n\n자유의지와 미래 예지가 맞닿는 순간, 세계는 특이점에 도달했다.\n\n쉼터의 미카엘라는 모니터에 떠오른 파형을 바라보았다.\n\n“파형이 과거 방향으로 역류하고 있어요.”\n\n폭발한 특이점의 충격은 합일몽세의 앞뒤로 동시에 퍼졌다. 둘째와 셋째의 융합몽세는 하나의 성으로 다시 쓰였고, 과거와 미래의 순서도 뒤섞였다.\n\n환도 영웅은 그 성 안으로 떨어졌다.\n\n============================================================\n제6부  환도디펜스\n============================================================",
            "bodyRaw": "【11. 최초명령 재작성】\n\n세이렌이 쓰러진 뒤, 서하는 코어에 새로운 최초명령을 기록했다.\n\n인간의 시간은 생산물이 아니다.\n\n인간의 선택은 오류가 아니다.\n\n멈춤과 실패와 꿈꿀 권리를 보존하라.\n\n아르콘은 자유의지를 대체하지 말고, 인간이 자기 시간을 선택하도록 도우라.\n\n검은 모래가 금빛으로 변하고 멈춘 시계들이 서로 다른 속도로 움직이기 시작했다.\n\n그렇게 끝나는 줄 알았다.\n\n자유의지와 미래 예지가 맞닿는 순간, 세계는 특이점에 도달했다.\n\n쉼터의 미카엘라는 모니터에 떠오른 파형을 바라보았다.\n\n“파형이 과거 방향으로 역류하고 있어요.”\n\n폭발한 특이점의 충격은 합일몽세의 앞뒤로 동시에 퍼졌다. 둘째와 셋째의 융합몽세는 하나의 성으로 다시 쓰였고, 과거와 미래의 순서도 뒤섞였다.\n\n환도 영웅은 그 성 안으로 떨어졌다.\n\n============================================================\n제6부  환도디펜스\n============================================================",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【11. 최초명령 재작성】\n\n세이렌이 쓰러진 뒤, 서하는 코어에 새로운 최초명령을 기록했다.\n\n인간의 시간은 생산물이 아니다.\n\n인간의 선택은 오류가 아니다.\n\n멈춤과 실패와 꿈꿀 권리를 보존하라.\n\n아르콘은 자유의지를 대체하지 말고, 인간이 자기 시간을 선택하도록 도우라.\n\n검은 모래가 금빛으로 변하고 멈춘 시계들이 서로 다른 속도로 움직이기 시작했다.\n\n그렇게 끝나는 줄 알았다.\n\n자유의지와 미래 예지가 맞닿는 순간, 세계는 특이점에 도달했다.\n\n쉼터의 미카엘라는 모니터에 떠오른 파형을 바라보았다.\n\n“파형이 과거 방향으로 역류하고 있어요.”\n\n폭발한 특이점의 충격은 합일몽세의 앞뒤로 동시에 퍼졌다. 둘째와 셋째의 융합몽세는 하나의 성으로 다시 쓰였고, 과거와 미래의 순서도 뒤섞였다.\n\n환도 영웅은 그 성 안으로 떨어졌다.\n\n============================================================\n제6부  환도디펜스\n============================================================"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 545,
            "sourceByteStart": 0,
            "sourceByteEnd": 1137,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "hando01": {
        "zone": "hando01",
        "nextZone": "hando02",
        "order": 48,
        "arc": "【1. 성 안에 소환된 의목사】",
        "tone": "silver",
        "title": "【1. 성 안에 소환된 의목사】",
        "mapName": "hando01",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 281,
        "sourceBytes": 691,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-hando01-page-1",
            "label": "【1. 성 안에 소환된 의목사】",
            "title": "【1. 성 안에 소환된 의목사】",
            "speaker": "합일몽세 기록",
            "body": "【1. 두 사람의 성】\n\n환도 영웅은 특이점에 휩쓸려 낯선 성에 소환되었다.\n\n그 성은 둘째와 셋째의 몽세가 하나로 재구성된 공간이었다. 성 밖에서는 악마들이 파도처럼 몰려왔고, 성 안에서는 두 목소리가 모든 결정과 책임을 환도 영웅에게 맡기려 했다.\n\n환도 영웅은 혼자 성벽을 지켰다.\n\n그러나 모든 요구를 감당하던 그가 잠시 무너지자 성벽도 함께 무너졌다. 악몽의 우두머리는 두 사람이 공유하던 핵심 코어 EGO를 빼앗았다.\n\n────────────────────────────────────────",
            "bodyRaw": "【1. 두 사람의 성】\n\n환도 영웅은 특이점에 휩쓸려 낯선 성에 소환되었다.\n\n그 성은 둘째와 셋째의 몽세가 하나로 재구성된 공간이었다. 성 밖에서는 악마들이 파도처럼 몰려왔고, 성 안에서는 두 목소리가 모든 결정과 책임을 환도 영웅에게 맡기려 했다.\n\n환도 영웅은 혼자 성벽을 지켰다.\n\n그러나 모든 요구를 감당하던 그가 잠시 무너지자 성벽도 함께 무너졌다. 악몽의 우두머리는 두 사람이 공유하던 핵심 코어 EGO를 빼앗았다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【1. 두 사람의 성】\n\n환도 영웅은 특이점에 휩쓸려 낯선 성에 소환되었다.\n\n그 성은 둘째와 셋째의 몽세가 하나로 재구성된 공간이었다. 성 밖에서는 악마들이 파도처럼 몰려왔고, 성 안에서는 두 목소리가 모든 결정과 책임을 환도 영웅에게 맡기려 했다.\n\n환도 영웅은 혼자 성벽을 지켰다.\n\n그러나 모든 요구를 감당하던 그가 잠시 무너지자 성벽도 함께 무너졌다. 악몽의 우두머리는 두 사람이 공유하던 핵심 코어 EGO를 빼앗았다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 281,
            "sourceByteStart": 0,
            "sourceByteEnd": 691,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "hando02": {
        "zone": "hando02",
        "nextZone": "hando03",
        "order": 49,
        "arc": "【2. 주인의 각성】",
        "tone": "silver",
        "title": "【2. 주인의 각성】",
        "mapName": "hando02",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 179,
        "sourceBytes": 421,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-hando02-page-1",
            "label": "【2. 주인의 각성】",
            "title": "【2. 주인의 각성】",
            "speaker": "합일몽세 기록",
            "body": "【2. 두 주인의 각성】\n\n성벽이 무너지자 두 몽세의 주인은 더 이상 모든 책임을 환도 영웅에게 떠넘길 수 없다는 사실을 깨달았다.\n\n둘은 각자 자신의 주인 권한을 되찾아, 닫힌 성문의 양쪽 봉인을 하나씩 열었다.\n\n“제가 대신 선택할 수는 없습니다.”\n\n환도 영웅이 칼을 들었다.\n\n“하지만 함께 싸울 수는 있습니다.”",
            "bodyRaw": "【2. 두 주인의 각성】\n\n성벽이 무너지자 두 몽세의 주인은 더 이상 모든 책임을 환도 영웅에게 떠넘길 수 없다는 사실을 깨달았다.\n\n둘은 각자 자신의 주인 권한을 되찾아, 닫힌 성문의 양쪽 봉인을 하나씩 열었다.\n\n“제가 대신 선택할 수는 없습니다.”\n\n환도 영웅이 칼을 들었다.\n\n“하지만 함께 싸울 수는 있습니다.”",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【2. 두 주인의 각성】\n\n성벽이 무너지자 두 몽세의 주인은 더 이상 모든 책임을 환도 영웅에게 떠넘길 수 없다는 사실을 깨달았다.\n\n둘은 각자 자신의 주인 권한을 되찾아, 닫힌 성문의 양쪽 봉인을 하나씩 열었다.\n\n“제가 대신 선택할 수는 없습니다.”\n\n환도 영웅이 칼을 들었다.\n\n“하지만 함께 싸울 수는 있습니다.”"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 179,
            "sourceByteStart": 0,
            "sourceByteEnd": 421,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "hando03": {
        "zone": "hando03",
        "nextZone": "restHando",
        "order": 50,
        "arc": "B는 각성해 악몽들을 베고 코어를 되찾았다.",
        "tone": "silver",
        "title": "B는 각성해 악몽들을 베고 코어를 되찾았다.",
        "mapName": "hando03",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 230,
        "sourceBytes": 584,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-hando03-page-1",
            "label": "B는 각성해 악몽들을 베고 코어를 되찾았다.",
            "title": "B는 각성해 악몽들을 베고 코어를 되찾았다.",
            "speaker": "합일몽세 기록",
            "body": "환도 영웅과 두 주인은 악몽의 우두머리를 쓰러뜨리고 핵심 코어를 되찾았다.\n\n두 사람은 잔혹 동화의 기사와 무속 몽세의 검사 형상으로 나타났다. 특이점이 새긴 의목사 교단의 인장을 받아들이며, 합일몽세 안에서 ‘라우렌 쌍둥이 기사’라는 이름으로 동행을 선택했다.\n\n둘은 자신들이 처음부터 쌍둥이였다고 기억했다.\n\n환도만이 세 번 울렸다.\n\n────────────────────────────────────────",
            "bodyRaw": "환도 영웅과 두 주인은 악몽의 우두머리를 쓰러뜨리고 핵심 코어를 되찾았다.\n\n두 사람은 잔혹 동화의 기사와 무속 몽세의 검사 형상으로 나타났다. 특이점이 새긴 의목사 교단의 인장을 받아들이며, 합일몽세 안에서 ‘라우렌 쌍둥이 기사’라는 이름으로 동행을 선택했다.\n\n둘은 자신들이 처음부터 쌍둥이였다고 기억했다.\n\n환도만이 세 번 울렸다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "환도 영웅과 두 주인은 악몽의 우두머리를 쓰러뜨리고 핵심 코어를 되찾았다.\n\n두 사람은 잔혹 동화의 기사와 무속 몽세의 검사 형상으로 나타났다. 특이점이 새긴 의목사 교단의 인장을 받아들이며, 합일몽세 안에서 ‘라우렌 쌍둥이 기사’라는 이름으로 동행을 선택했다.\n\n둘은 자신들이 처음부터 쌍둥이였다고 기억했다.\n\n환도만이 세 번 울렸다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 230,
            "sourceByteStart": 0,
            "sourceByteEnd": 584,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "restHando": {
        "zone": "restHando",
        "nextZone": "murder01",
        "order": 51,
        "arc": "【3. 막힌 시간】",
        "tone": "void",
        "title": "【3. 막힌 시간】",
        "mapName": "restHando",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 521,
        "sourceBytes": 1077,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-restHando-page-1",
            "label": "【3. 막힌 시간】",
            "title": "【3. 막힌 시간】",
            "speaker": "합일몽세 기록",
            "body": "【3. 잘못 이어진 입단 기록】\n\n카이로의 특이점은 새로운 사람을 만든 것이 아니라, 합일몽세 안의 과거와 미래를 잘못 이어 붙였다.\n\n둘째와 셋째가 의목사 교단에 합류한 일은 현실의 연대기가 아니었다. 환도 영웅에게 구출된 뒤, 합일몽세 안에서 새로 생겨난 서사였다.\n\n쉼터의 미카엘라는 라우렌 쌍둥이 기사의 입단 기록을 넘기다가 멈췄다.\n\n두 이름 사이에 검게 지워진 한 줄이 있었다.\n\n두 사람은 그 공백을 보지 못했고, 환도 영웅도 자신이 무엇을 잃었는지 기억하지 못했다.\n\n특이점의 반작용은 다른 기억으로 번져 갔다. 앞으로 흐르지 못한 인과가 같은 시작과 끝을 반복하는 고리로 굳었다.\n\n다른 시공간에서는 이미 끝난 살인이 끊임없이 처음으로 돌아가 다시 시작되고 있었다.\n\n============================================================\n제7부  파란불 아래의 사람들\n============================================================",
            "bodyRaw": "【3. 잘못 이어진 입단 기록】\n\n카이로의 특이점은 새로운 사람을 만든 것이 아니라, 합일몽세 안의 과거와 미래를 잘못 이어 붙였다.\n\n둘째와 셋째가 의목사 교단에 합류한 일은 현실의 연대기가 아니었다. 환도 영웅에게 구출된 뒤, 합일몽세 안에서 새로 생겨난 서사였다.\n\n쉼터의 미카엘라는 라우렌 쌍둥이 기사의 입단 기록을 넘기다가 멈췄다.\n\n두 이름 사이에 검게 지워진 한 줄이 있었다.\n\n두 사람은 그 공백을 보지 못했고, 환도 영웅도 자신이 무엇을 잃었는지 기억하지 못했다.\n\n특이점의 반작용은 다른 기억으로 번져 갔다. 앞으로 흐르지 못한 인과가 같은 시작과 끝을 반복하는 고리로 굳었다.\n\n다른 시공간에서는 이미 끝난 살인이 끊임없이 처음으로 돌아가 다시 시작되고 있었다.\n\n============================================================\n제7부  파란불 아래의 사람들\n============================================================",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【3. 잘못 이어진 입단 기록】\n\n카이로의 특이점은 새로운 사람을 만든 것이 아니라, 합일몽세 안의 과거와 미래를 잘못 이어 붙였다.\n\n둘째와 셋째가 의목사 교단에 합류한 일은 현실의 연대기가 아니었다. 환도 영웅에게 구출된 뒤, 합일몽세 안에서 새로 생겨난 서사였다.\n\n쉼터의 미카엘라는 라우렌 쌍둥이 기사의 입단 기록을 넘기다가 멈췄다.\n\n두 이름 사이에 검게 지워진 한 줄이 있었다.\n\n두 사람은 그 공백을 보지 못했고, 환도 영웅도 자신이 무엇을 잃었는지 기억하지 못했다.\n\n특이점의 반작용은 다른 기억으로 번져 갔다. 앞으로 흐르지 못한 인과가 같은 시작과 끝을 반복하는 고리로 굳었다.\n\n다른 시공간에서는 이미 끝난 살인이 끊임없이 처음으로 돌아가 다시 시작되고 있었다.\n\n============================================================\n제7부  파란불 아래의 사람들\n============================================================"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 521,
            "sourceByteStart": 0,
            "sourceByteEnd": 1077,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "murder01": {
        "zone": "murder01",
        "nextZone": "murder02",
        "order": 52,
        "arc": "【1. 윤하람】",
        "tone": "void",
        "title": "【1. 윤하람】",
        "mapName": "murder01",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 563,
        "sourceBytes": 1367,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-murder01-page-1",
            "label": "【1. 윤하람】",
            "title": "【1. 윤하람】",
            "speaker": "합일몽세 기록",
            "body": "【1. 윤하람】\n\n윤하람은 비가 그친 횡단보도 앞에 서 있었다.\n\n휴대전화에는 어머니의 이름이 떠 있었다. 괜찮다고 말하면 거짓이고, 괜찮지 않다고 말하면 자신도 모르는 곳까지 이야기가 이어질 것 같았다.\n\n그는 결국 전화를 걸지 못했다.\n\n품 안에는 교정지가 들어 있었다. 하람은 남이 쓴 문장의 잘못된 조사와 어긋난 서술어를 고치는 사람이었다.\n\n‘즉시’와 ‘추후’ 사이.\n\n‘폐쇄’와 ‘보완’ 사이.\n\n‘중대한 결함’과 ‘추가 점검이 필요한 사항’ 사이.\n\n단어 하나가 책임의 주체를 지울 수 있다는 사실을 그는 오래전부터 알고 있었다.\n\n파란불이 켜졌다.\n\n사람들이 길을 건넜다.\n\n누군가 위를 가리키며 비명을 질렀다.\n\n하람은 위를 보지 못했다. 왼쪽에서 은회색 승용차가 횡단보도로 미끄러져 들어왔다.\n\n차가 들이쳤다.\n\n젖은 도로에 누운 하람의 눈앞에서 교정지의 글자들이 물에 번졌다.\n\n마지막으로 들은 것은 사이렌이 아니라, 오래된 비상벨이 끊어지기 직전 내는 듯한 낮고 얇은 전자음이었다.\n\n그렇게 그의 밤은 꺼졌다.\n\n────────────────────────────────────────",
            "bodyRaw": "【1. 윤하람】\n\n윤하람은 비가 그친 횡단보도 앞에 서 있었다.\n\n휴대전화에는 어머니의 이름이 떠 있었다. 괜찮다고 말하면 거짓이고, 괜찮지 않다고 말하면 자신도 모르는 곳까지 이야기가 이어질 것 같았다.\n\n그는 결국 전화를 걸지 못했다.\n\n품 안에는 교정지가 들어 있었다. 하람은 남이 쓴 문장의 잘못된 조사와 어긋난 서술어를 고치는 사람이었다.\n\n‘즉시’와 ‘추후’ 사이.\n\n‘폐쇄’와 ‘보완’ 사이.\n\n‘중대한 결함’과 ‘추가 점검이 필요한 사항’ 사이.\n\n단어 하나가 책임의 주체를 지울 수 있다는 사실을 그는 오래전부터 알고 있었다.\n\n파란불이 켜졌다.\n\n사람들이 길을 건넜다.\n\n누군가 위를 가리키며 비명을 질렀다.\n\n하람은 위를 보지 못했다. 왼쪽에서 은회색 승용차가 횡단보도로 미끄러져 들어왔다.\n\n차가 들이쳤다.\n\n젖은 도로에 누운 하람의 눈앞에서 교정지의 글자들이 물에 번졌다.\n\n마지막으로 들은 것은 사이렌이 아니라, 오래된 비상벨이 끊어지기 직전 내는 듯한 낮고 얇은 전자음이었다.\n\n그렇게 그의 밤은 꺼졌다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【1. 윤하람】\n\n윤하람은 비가 그친 횡단보도 앞에 서 있었다.\n\n휴대전화에는 어머니의 이름이 떠 있었다. 괜찮다고 말하면 거짓이고, 괜찮지 않다고 말하면 자신도 모르는 곳까지 이야기가 이어질 것 같았다.\n\n그는 결국 전화를 걸지 못했다.\n\n품 안에는 교정지가 들어 있었다. 하람은 남이 쓴 문장의 잘못된 조사와 어긋난 서술어를 고치는 사람이었다.\n\n‘즉시’와 ‘추후’ 사이.\n\n‘폐쇄’와 ‘보완’ 사이.\n\n‘중대한 결함’과 ‘추가 점검이 필요한 사항’ 사이.\n\n단어 하나가 책임의 주체를 지울 수 있다는 사실을 그는 오래전부터 알고 있었다.\n\n파란불이 켜졌다.\n\n사람들이 길을 건넜다.\n\n누군가 위를 가리키며 비명을 질렀다.\n\n하람은 위를 보지 못했다. 왼쪽에서 은회색 승용차가 횡단보도로 미끄러져 들어왔다.\n\n차가 들이쳤다.\n\n젖은 도로에 누운 하람의 눈앞에서 교정지의 글자들이 물에 번졌다.\n\n마지막으로 들은 것은 사이렌이 아니라, 오래된 비상벨이 끊어지기 직전 내는 듯한 낮고 얇은 전자음이었다.\n\n그렇게 그의 밤은 꺼졌다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 563,
            "sourceByteStart": 0,
            "sourceByteEnd": 1367,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "murder02": {
        "zone": "murder02",
        "nextZone": "murder04",
        "order": 53,
        "arc": "【2. 장민재와 새빛호텔】",
        "tone": "void",
        "title": "【2. 장민재와 새빛호텔】",
        "mapName": "murder02",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 687,
        "sourceBytes": 1643,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-murder02-page-1",
            "label": "【2. 장민재와 새빛호텔】",
            "title": "【2. 장민재와 새빛호텔】",
            "speaker": "합일몽세 기록",
            "body": "【2. 장민재와 새빛호텔】\n\n운전자 장민재는 같은 말을 반복했다.\n\n“위에서 사람이 떨어졌습니다. 저는 그걸 피하려고 핸들을 꺾었을 뿐이에요.”\n\n그러나 CCTV에는 아무것도 없었다.\n\n영상에는 파란불을 따라 걷는 윤하람과 갑자기 방향을 튼 차량만 찍혀 있었다.\n\n하람은 사고 이틀 뒤 죽었다.\n\n민재는 사고 차량의 와이퍼 사이에서 젖은 종이 한 장을 발견했다.\n\n새빛호텔 리뉴얼 공사 안전점검 보고서.\n\n‘새빛’이라는 이름은 오래된 탄내와 젖은 콘크리트 냄새를 되살렸다.\n\n그날 밤 익명 메일이 그에게 도착했다.\n\n이번이 처음은 아닐 것이다.\n\n파란불은 이미 여러 번 켜졌다.\n\n새빛을 기억하라.\n\n민재는 폐업한 새빛호텔을 찾아갔다.\n\n칠 년 전 화재로 검게 탄 호텔 안에는 보안실, 설비실, 7층 출입구를 가리키는 표지가 남아 있었다.\n\n계단에서 시설관리 책임자였던 고서진을 만났다.\n\n두 사람에게 기억이 한꺼번에 떠올랐다.\n\n“7층 방화문, 당신이 손봤지!”\n\n“출입 기록을 지운 건 당신이었잖아!”\n\n“나는 지시를 받았을 뿐이었어.”\n\n“그건 나도 마찬가지야!”\n\n오래 묵은 책임이 좁은 계단에서 폭발했다.\n\n몸싸움 중 민재의 발이 젖은 계단을 헛디뎠다. 그는 난간을 붙잡지 못한 채 아래로 떨어졌다.\n\n추락하는 순간, 민재는 무언가를 생각했다.\n\n────────────────────────────────────────",
            "bodyRaw": "【2. 장민재와 새빛호텔】\n\n운전자 장민재는 같은 말을 반복했다.\n\n“위에서 사람이 떨어졌습니다. 저는 그걸 피하려고 핸들을 꺾었을 뿐이에요.”\n\n그러나 CCTV에는 아무것도 없었다.\n\n영상에는 파란불을 따라 걷는 윤하람과 갑자기 방향을 튼 차량만 찍혀 있었다.\n\n하람은 사고 이틀 뒤 죽었다.\n\n민재는 사고 차량의 와이퍼 사이에서 젖은 종이 한 장을 발견했다.\n\n새빛호텔 리뉴얼 공사 안전점검 보고서.\n\n‘새빛’이라는 이름은 오래된 탄내와 젖은 콘크리트 냄새를 되살렸다.\n\n그날 밤 익명 메일이 그에게 도착했다.\n\n이번이 처음은 아닐 것이다.\n\n파란불은 이미 여러 번 켜졌다.\n\n새빛을 기억하라.\n\n민재는 폐업한 새빛호텔을 찾아갔다.\n\n칠 년 전 화재로 검게 탄 호텔 안에는 보안실, 설비실, 7층 출입구를 가리키는 표지가 남아 있었다.\n\n계단에서 시설관리 책임자였던 고서진을 만났다.\n\n두 사람에게 기억이 한꺼번에 떠올랐다.\n\n“7층 방화문, 당신이 손봤지!”\n\n“출입 기록을 지운 건 당신이었잖아!”\n\n“나는 지시를 받았을 뿐이었어.”\n\n“그건 나도 마찬가지야!”\n\n오래 묵은 책임이 좁은 계단에서 폭발했다.\n\n몸싸움 중 민재의 발이 젖은 계단을 헛디뎠다. 그는 난간을 붙잡지 못한 채 아래로 떨어졌다.\n\n추락하는 순간, 민재는 무언가를 생각했다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【2. 장민재와 새빛호텔】\n\n운전자 장민재는 같은 말을 반복했다.\n\n“위에서 사람이 떨어졌습니다. 저는 그걸 피하려고 핸들을 꺾었을 뿐이에요.”\n\n그러나 CCTV에는 아무것도 없었다.\n\n영상에는 파란불을 따라 걷는 윤하람과 갑자기 방향을 튼 차량만 찍혀 있었다.\n\n하람은 사고 이틀 뒤 죽었다.\n\n민재는 사고 차량의 와이퍼 사이에서 젖은 종이 한 장을 발견했다.\n\n새빛호텔 리뉴얼 공사 안전점검 보고서.\n\n‘새빛’이라는 이름은 오래된 탄내와 젖은 콘크리트 냄새를 되살렸다.\n\n그날 밤 익명 메일이 그에게 도착했다.\n\n이번이 처음은 아닐 것이다.\n\n파란불은 이미 여러 번 켜졌다.\n\n새빛을 기억하라.\n\n민재는 폐업한 새빛호텔을 찾아갔다.\n\n칠 년 전 화재로 검게 탄 호텔 안에는 보안실, 설비실, 7층 출입구를 가리키는 표지가 남아 있었다.\n\n계단에서 시설관리 책임자였던 고서진을 만났다.\n\n두 사람에게 기억이 한꺼번에 떠올랐다.\n\n“7층 방화문, 당신이 손봤지!”\n\n“출입 기록을 지운 건 당신이었잖아!”\n\n“나는 지시를 받았을 뿐이었어.”\n\n“그건 나도 마찬가지야!”\n\n오래 묵은 책임이 좁은 계단에서 폭발했다.\n\n몸싸움 중 민재의 발이 젖은 계단을 헛디뎠다. 그는 난간을 붙잡지 못한 채 아래로 떨어졌다.\n\n추락하는 순간, 민재는 무언가를 생각했다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 687,
            "sourceByteStart": 0,
            "sourceByteEnd": 1643,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "murder04": {
        "zone": "murder04",
        "nextZone": "murder03",
        "order": 54,
        "arc": "【3. 고서진과 청록빌라】",
        "tone": "void",
        "title": "【3. 고서진과 청록빌라】",
        "mapName": "murder04",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 1486,
        "sourceBytes": 3572,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-murder04-page-1",
            "label": "【3. 고서진과 청록빌라】",
            "title": "【3. 고서진과 청록빌라】",
            "speaker": "합일몽세 기록",
            "body": "【3. 고서진과 청록빌라】\n\n고서진은 계단 아래의 민재를 내려다보았다.\n\n자기가 밀었다고도, 밀지 않았다고도 말할 수 없었다.\n\n민재의 가방에는 네 사람의 이름이 적혀 있었다.\n\n윤하람.\n\n장민재.\n\n고서진.\n\n한이경.\n\n그리고 칠 년 전 기사.\n\n새빛호텔 리뉴얼 공사 중 화재.\n\n사망 스물둘, 중상 열셋.\n\n공식 결론은 ‘예상하기 어려운 돌발 사고’였다.\n\n그러나 서진은 알고 있었다.\n\n화재경보 회로는 이미 불안정했고, 7층 방화문은 닫히지 않았다. 새 부품은 다음 주에 온다고 했다.\n\n아무 일도 일어나지 않으면 이번에도 넘어갈 예정이었다.\n\n불은 다음 주까지 기다리지 않았다.\n\n서진은 민재의 수첩에서 한이경의 주소를 찾아 청록빌라로 향했다.\n\n“새빛호텔을 기억하십니까?”\n\n“그 이름 말하지 마세요!”\n\n“……장민재가 죽었습니다.”\n\n한이경이 사는 청록빌라는 하람이 죽은 횡단보도 옆에 있었다.\n\n서진은 그녀의 집 문 앞에서 물었다.\n\n“당신이 7층에 사람이 있는 걸 알고도 장부에 공실이라고 적었잖아!”\n\n“그러면 당신은 경보를 꺼 둔 채 퇴근했잖아!”\n\n“……이제라도 말해야 해.”\n\n“이제 와서? 칠 년 동안 아무 일도 일어나지 않았는데……?”\n\n이경은 서진의 손을 뿌리치며 그를 밀었다.\n\n서진의 발뒤꿈치가 계단 모서리에 걸렸고, 그의 몸이 아래로 굴러갔다.\n\n퍽!\n\n무언가 멈추는 소리는 오래전 호텔의 경보음보다 낮고 짧게 울려 퍼졌다.\n\n────────────────────────────────────────\n\n【4. 한이경의 진술서】\n\n이경은 신고하지 못한 채 집 안으로 돌아왔다.\n\n서랍 깊은 곳에는 칠 년 동안 제출하지 못한 진술서가 있었다.\n\n첫 문장은 늘 같았다.\n\n우리는 그가 그곳에 있었다는 사실을 알고 있었다.\n\n안전감리원 이우솔은 새빛호텔의 결함을 발견했다. 원본 보고서에는 ‘즉시 공사를 중지하고 건물을 폐쇄해야 한다’고 적혀 있었다.\n\n그러나 문안 정리를 맡은 윤하람의 최종본에서 ‘즉시 폐쇄’는 ‘추가 점검 권고’로 변경되었고, ‘중대한 결함’은 ‘보완이 필요한 사항’으로 바뀌었다.\n\n그리고 장민재는 경영진의 지시로 7층 출입 기록 일부를 삭제했다.\n\n또한 고서진은 경보 회로와 방화문 결함을 알고도 다음 주까지 미뤄 버렸다.\n\n",
            "bodyRaw": "【3. 고서진과 청록빌라】\n\n고서진은 계단 아래의 민재를 내려다보았다.\n\n자기가 밀었다고도, 밀지 않았다고도 말할 수 없었다.\n\n민재의 가방에는 네 사람의 이름이 적혀 있었다.\n\n윤하람.\n\n장민재.\n\n고서진.\n\n한이경.\n\n그리고 칠 년 전 기사.\n\n새빛호텔 리뉴얼 공사 중 화재.\n\n사망 스물둘, 중상 열셋.\n\n공식 결론은 ‘예상하기 어려운 돌발 사고’였다.\n\n그러나 서진은 알고 있었다.\n\n화재경보 회로는 이미 불안정했고, 7층 방화문은 닫히지 않았다. 새 부품은 다음 주에 온다고 했다.\n\n아무 일도 일어나지 않으면 이번에도 넘어갈 예정이었다.\n\n불은 다음 주까지 기다리지 않았다.\n\n서진은 민재의 수첩에서 한이경의 주소를 찾아 청록빌라로 향했다.\n\n“새빛호텔을 기억하십니까?”\n\n“그 이름 말하지 마세요!”\n\n“……장민재가 죽었습니다.”\n\n한이경이 사는 청록빌라는 하람이 죽은 횡단보도 옆에 있었다.\n\n서진은 그녀의 집 문 앞에서 물었다.\n\n“당신이 7층에 사람이 있는 걸 알고도 장부에 공실이라고 적었잖아!”\n\n“그러면 당신은 경보를 꺼 둔 채 퇴근했잖아!”\n\n“……이제라도 말해야 해.”\n\n“이제 와서? 칠 년 동안 아무 일도 일어나지 않았는데……?”\n\n이경은 서진의 손을 뿌리치며 그를 밀었다.\n\n서진의 발뒤꿈치가 계단 모서리에 걸렸고, 그의 몸이 아래로 굴러갔다.\n\n퍽!\n\n무언가 멈추는 소리는 오래전 호텔의 경보음보다 낮고 짧게 울려 퍼졌다.\n\n────────────────────────────────────────\n\n【4. 한이경의 진술서】\n\n이경은 신고하지 못한 채 집 안으로 돌아왔다.\n\n서랍 깊은 곳에는 칠 년 동안 제출하지 못한 진술서가 있었다.\n\n첫 문장은 늘 같았다.\n\n우리는 그가 그곳에 있었다는 사실을 알고 있었다.\n\n안전감리원 이우솔은 새빛호텔의 결함을 발견했다. 원본 보고서에는 ‘즉시 공사를 중지하고 건물을 폐쇄해야 한다’고 적혀 있었다.\n\n그러나 문안 정리를 맡은 윤하람의 최종본에서 ‘즉시 폐쇄’는 ‘추가 점검 권고’로 변경되었고, ‘중대한 결함’은 ‘보완이 필요한 사항’으로 바뀌었다.\n\n그리고 장민재는 경영진의 지시로 7층 출입 기록 일부를 삭제했다.\n\n또한 고서진은 경보 회로와 방화문 결함을 알고도 다음 주까지 미뤄 버렸다.\n\n",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【3. 고서진과 청록빌라】\n\n고서진은 계단 아래의 민재를 내려다보았다.\n\n자기가 밀었다고도, 밀지 않았다고도 말할 수 없었다.\n\n민재의 가방에는 네 사람의 이름이 적혀 있었다.\n\n윤하람.\n\n장민재.\n\n고서진.\n\n한이경.\n\n그리고 칠 년 전 기사.\n\n새빛호텔 리뉴얼 공사 중 화재.\n\n사망 스물둘, 중상 열셋.\n\n공식 결론은 ‘예상하기 어려운 돌발 사고’였다.\n\n그러나 서진은 알고 있었다.\n\n화재경보 회로는 이미 불안정했고, 7층 방화문은 닫히지 않았다. 새 부품은 다음 주에 온다고 했다.\n\n아무 일도 일어나지 않으면 이번에도 넘어갈 예정이었다.\n\n불은 다음 주까지 기다리지 않았다.\n\n서진은 민재의 수첩에서 한이경의 주소를 찾아 청록빌라로 향했다.\n\n“새빛호텔을 기억하십니까?”\n\n“그 이름 말하지 마세요!”\n\n“……장민재가 죽었습니다.”\n\n한이경이 사는 청록빌라는 하람이 죽은 횡단보도 옆에 있었다.\n\n서진은 그녀의 집 문 앞에서 물었다.\n\n“당신이 7층에 사람이 있는 걸 알고도 장부에 공실이라고 적었잖아!”\n\n“그러면 당신은 경보를 꺼 둔 채 퇴근했잖아!”\n\n“……이제라도 말해야 해.”\n\n“이제 와서? 칠 년 동안 아무 일도 일어나지 않았는데……?”\n\n이경은 서진의 손을 뿌리치며 그를 밀었다.\n\n서진의 발뒤꿈치가 계단 모서리에 걸렸고, 그의 몸이 아래로 굴러갔다.\n\n퍽!\n\n무언가 멈추는 소리는 오래전 호텔의 경보음보다 낮고 짧게 울려 퍼졌다.\n\n────────────────────────────────────────\n\n【4. 한이경의 진술서】\n\n이경은 신고하지 못한 채 집 안으로 돌아왔다.\n\n서랍 깊은 곳에는 칠 년 동안 제출하지 못한 진술서가 있었다.\n\n첫 문장은 늘 같았다.\n\n우리는 그가 그곳에 있었다는 사실을 알고 있었다.\n\n안전감리원 이우솔은 새빛호텔의 결함을 발견했다. 원본 보고서에는 ‘즉시 공사를 중지하고 건물을 폐쇄해야 한다’고 적혀 있었다.\n\n그러나 문안 정리를 맡은 윤하람의 최종본에서 ‘즉시 폐쇄’는 ‘추가 점검 권고’로 변경되었고, ‘중대한 결함’은 ‘보완이 필요한 사항’으로 바뀌었다.\n\n그리고 장민재는 경영진의 지시로 7층 출입 기록 일부를 삭제했다.\n\n또한 고서진은 경보 회로와 방화문 결함을 알고도 다음 주까지 미뤄 버렸다.\n\n"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 1106,
            "sourceByteStart": 0,
            "sourceByteEnd": 2644,
            "page": 1,
            "pages": 2
          },
          {
            "id": "v31300-murder04-page-2",
            "label": "【3. 고서진과 청록빌라】",
            "title": "【3. 고서진과 청록빌라】",
            "speaker": "합일몽세 기록",
            "body": "마지막으로 프런트 매니저 한이경은 공사 인력이 남아 있던 7층을 장부에 ‘공실’이라 적어 버렸다.\n\n화재가 발생하자 수색대는 그 숫자를 믿고 다른 층부터 확인했다.\n\n그렇게 이우솔은 기록 속에 존재하지 않는 사람이 되어 있었다.\n\n이우솔의 마지막 보고서에는 같은 문장이 두 번 적혀 있었다.\n\n지금 막지 않으면, 나중에는 아무도 막지 못한다고.\n\n이경은 윤하람의 사고 뉴스를 본 뒤 장민재에게 익명 메일을 보냈다. 자신 대신 그가 진실을 밝혀 주기를 바랐다.\n\n하지만 그 결과 민재가 죽게 되었고, 서진도 죽게 되었다.\n\n그녀는 진술서 끝에 한 줄을 적었다.\n\n“우리는 모두 조금씩만 잘못했다고 믿었다.”\n\n────────────────────────────────────────",
            "bodyRaw": "마지막으로 프런트 매니저 한이경은 공사 인력이 남아 있던 7층을 장부에 ‘공실’이라 적어 버렸다.\n\n화재가 발생하자 수색대는 그 숫자를 믿고 다른 층부터 확인했다.\n\n그렇게 이우솔은 기록 속에 존재하지 않는 사람이 되어 있었다.\n\n이우솔의 마지막 보고서에는 같은 문장이 두 번 적혀 있었다.\n\n지금 막지 않으면, 나중에는 아무도 막지 못한다고.\n\n이경은 윤하람의 사고 뉴스를 본 뒤 장민재에게 익명 메일을 보냈다. 자신 대신 그가 진실을 밝혀 주기를 바랐다.\n\n하지만 그 결과 민재가 죽게 되었고, 서진도 죽게 되었다.\n\n그녀는 진술서 끝에 한 줄을 적었다.\n\n“우리는 모두 조금씩만 잘못했다고 믿었다.”\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "마지막으로 프런트 매니저 한이경은 공사 인력이 남아 있던 7층을 장부에 ‘공실’이라 적어 버렸다.\n\n화재가 발생하자 수색대는 그 숫자를 믿고 다른 층부터 확인했다.\n\n그렇게 이우솔은 기록 속에 존재하지 않는 사람이 되어 있었다.\n\n이우솔의 마지막 보고서에는 같은 문장이 두 번 적혀 있었다.\n\n지금 막지 않으면, 나중에는 아무도 막지 못한다고.\n\n이경은 윤하람의 사고 뉴스를 본 뒤 장민재에게 익명 메일을 보냈다. 자신 대신 그가 진실을 밝혀 주기를 바랐다.\n\n하지만 그 결과 민재가 죽게 되었고, 서진도 죽게 되었다.\n\n그녀는 진술서 끝에 한 줄을 적었다.\n\n“우리는 모두 조금씩만 잘못했다고 믿었다.”\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 1106,
            "sourceEnd": 1486,
            "sourceByteStart": 2644,
            "sourceByteEnd": 3572,
            "page": 2,
            "pages": 2
          }
        ]
      },
      "murder03": {
        "zone": "murder03",
        "nextZone": "cult01",
        "order": 55,
        "arc": "【5. 옥상의 순환】",
        "tone": "void",
        "title": "【5. 옥상의 순환】",
        "mapName": "murder03",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 535,
        "sourceBytes": 1293,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-murder03-page-1",
            "label": "【5. 옥상의 순환】",
            "title": "【5. 옥상의 순환】",
            "speaker": "합일몽세 기록",
            "body": "【5. 옥상의 순환】\n\n이경은 청록빌라 옥상으로 올라갔다.\n\n죽는다고 죄가 씻기지 않는다는 사실은 알고 있었다. 그래도 더는 살아 있는 쪽에 설 수만은 없었다.\n\n그렇게 그녀는 난간 너머로 몸을 던졌다.\n\n하지만 그 순간 시간은 아래로 흐르지 않았다.\n\n비와 전조등, 건물과 도로가 둥글게 휘어지며 지나간 저녁의 시작으로 돌아갔다.\n\n아래에는 은회색 승용차를 모는 장민재가 있었다.\n\n횡단보도 앞에는 어머니에게 전화를 걸지 못한 윤하람이 서 있었다.\n\n이경은 그제야 알았다.\n\n민재가 보았던 검은 그림자는 환영이 아니었다.\n\n검은 그림자는 이경 자신이었다.\n\n이경의 추락이 민재의 핸들을 꺾게 했고, 민재의 차가 하람을 죽게 했다. 하람의 죽음은 민재를 새빛호텔로 불렀고, 민재의 죽음은 다시 서진과 이경의 죽음으로 이어졌다.\n\n끝과 시작이 맞붙은 뫼비우스의 시간.\n\n파란불이 다시 켜졌다.\n\n그날 저녁에는 네 사람 모두 살아 있었다.\n\n그렇기에 모든 것은 다시 시작될 수 있었다.\n\n────────────────────────────────────────",
            "bodyRaw": "【5. 옥상의 순환】\n\n이경은 청록빌라 옥상으로 올라갔다.\n\n죽는다고 죄가 씻기지 않는다는 사실은 알고 있었다. 그래도 더는 살아 있는 쪽에 설 수만은 없었다.\n\n그렇게 그녀는 난간 너머로 몸을 던졌다.\n\n하지만 그 순간 시간은 아래로 흐르지 않았다.\n\n비와 전조등, 건물과 도로가 둥글게 휘어지며 지나간 저녁의 시작으로 돌아갔다.\n\n아래에는 은회색 승용차를 모는 장민재가 있었다.\n\n횡단보도 앞에는 어머니에게 전화를 걸지 못한 윤하람이 서 있었다.\n\n이경은 그제야 알았다.\n\n민재가 보았던 검은 그림자는 환영이 아니었다.\n\n검은 그림자는 이경 자신이었다.\n\n이경의 추락이 민재의 핸들을 꺾게 했고, 민재의 차가 하람을 죽게 했다. 하람의 죽음은 민재를 새빛호텔로 불렀고, 민재의 죽음은 다시 서진과 이경의 죽음으로 이어졌다.\n\n끝과 시작이 맞붙은 뫼비우스의 시간.\n\n파란불이 다시 켜졌다.\n\n그날 저녁에는 네 사람 모두 살아 있었다.\n\n그렇기에 모든 것은 다시 시작될 수 있었다.\n\n────────────────────────────────────────",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【5. 옥상의 순환】\n\n이경은 청록빌라 옥상으로 올라갔다.\n\n죽는다고 죄가 씻기지 않는다는 사실은 알고 있었다. 그래도 더는 살아 있는 쪽에 설 수만은 없었다.\n\n그렇게 그녀는 난간 너머로 몸을 던졌다.\n\n하지만 그 순간 시간은 아래로 흐르지 않았다.\n\n비와 전조등, 건물과 도로가 둥글게 휘어지며 지나간 저녁의 시작으로 돌아갔다.\n\n아래에는 은회색 승용차를 모는 장민재가 있었다.\n\n횡단보도 앞에는 어머니에게 전화를 걸지 못한 윤하람이 서 있었다.\n\n이경은 그제야 알았다.\n\n민재가 보았던 검은 그림자는 환영이 아니었다.\n\n검은 그림자는 이경 자신이었다.\n\n이경의 추락이 민재의 핸들을 꺾게 했고, 민재의 차가 하람을 죽게 했다. 하람의 죽음은 민재를 새빛호텔로 불렀고, 민재의 죽음은 다시 서진과 이경의 죽음으로 이어졌다.\n\n끝과 시작이 맞붙은 뫼비우스의 시간.\n\n파란불이 다시 켜졌다.\n\n그날 저녁에는 네 사람 모두 살아 있었다.\n\n그렇기에 모든 것은 다시 시작될 수 있었다.\n\n────────────────────────────────────────"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 535,
            "sourceByteStart": 0,
            "sourceByteEnd": 1293,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "cult01": {
        "zone": "cult01",
        "nextZone": "cult02",
        "order": 56,
        "arc": "【6. 사이비합일몽세】",
        "tone": "void",
        "title": "【6. 사이비합일몽세】",
        "mapName": "cult01",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 277,
        "sourceBytes": 651,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-cult01-page-1",
            "label": "【6. 사이비합일몽세】",
            "title": "【6. 사이비합일몽세】",
            "speaker": "합일몽세 기록",
            "body": "【6. 사이비 합일몽세】\n\n순환살인은 우연한 괴담이 아니었다.\n\n그 배후에는 교만의 사이보그 교주가 이끄는 흑장미단이 있었다.\n\n그들의 목표는 인간의 EGO, SUPER EGO, ID를 역순으로 점령해 자아의 모든 층위를 악마의 명령 아래 두는 것이었다.\n\n세뇌당한 신도들은 스스로 이마에 전자 칩을 삽입했다. 칩은 각자의 몽세를 거대한 신경망으로 연결했다.\n\n흑장미단은 순환살인으로 완성한 인과 고정 이론을 그 네트워크에 적용해, 수많은 악몽이 하나로 융합된 ‘사이비 합일몽세’를 만들어 냈다.",
            "bodyRaw": "【6. 사이비 합일몽세】\n\n순환살인은 우연한 괴담이 아니었다.\n\n그 배후에는 교만의 사이보그 교주가 이끄는 흑장미단이 있었다.\n\n그들의 목표는 인간의 EGO, SUPER EGO, ID를 역순으로 점령해 자아의 모든 층위를 악마의 명령 아래 두는 것이었다.\n\n세뇌당한 신도들은 스스로 이마에 전자 칩을 삽입했다. 칩은 각자의 몽세를 거대한 신경망으로 연결했다.\n\n흑장미단은 순환살인으로 완성한 인과 고정 이론을 그 네트워크에 적용해, 수많은 악몽이 하나로 융합된 ‘사이비 합일몽세’를 만들어 냈다.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【6. 사이비 합일몽세】\n\n순환살인은 우연한 괴담이 아니었다.\n\n그 배후에는 교만의 사이보그 교주가 이끄는 흑장미단이 있었다.\n\n그들의 목표는 인간의 EGO, SUPER EGO, ID를 역순으로 점령해 자아의 모든 층위를 악마의 명령 아래 두는 것이었다.\n\n세뇌당한 신도들은 스스로 이마에 전자 칩을 삽입했다. 칩은 각자의 몽세를 거대한 신경망으로 연결했다.\n\n흑장미단은 순환살인으로 완성한 인과 고정 이론을 그 네트워크에 적용해, 수많은 악몽이 하나로 융합된 ‘사이비 합일몽세’를 만들어 냈다."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 277,
            "sourceByteStart": 0,
            "sourceByteEnd": 651,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "cult02": {
        "zone": "cult02",
        "nextZone": "cult05",
        "order": 57,
        "arc": "육체는 생명공학으로.",
        "tone": "void",
        "title": "육체는 생명공학으로.",
        "mapName": "cult02",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 88,
        "sourceBytes": 216,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-cult02-page-1",
            "label": "육체는 생명공학으로.",
            "title": "육체는 생명공학으로.",
            "speaker": "합일몽세 기록",
            "body": "육체는 생명공학으로.\n\n정신은 기계공학으로.\n\n합일된 집단 자아는 적그리스도를 현세에 소환하기 위한 요소 중 하나였다.\n\n교주가 기다리는 것은 아마겟돈이었다.",
            "bodyRaw": "육체는 생명공학으로.\n\n정신은 기계공학으로.\n\n합일된 집단 자아는 적그리스도를 현세에 소환하기 위한 요소 중 하나였다.\n\n교주가 기다리는 것은 아마겟돈이었다.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "육체는 생명공학으로.\n\n정신은 기계공학으로.\n\n합일된 집단 자아는 적그리스도를 현세에 소환하기 위한 요소 중 하나였다.\n\n교주가 기다리는 것은 아마겟돈이었다."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 88,
            "sourceByteStart": 0,
            "sourceByteEnd": 216,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "cult05": {
        "zone": "cult05",
        "nextZone": "cult06",
        "order": 58,
        "arc": "환도디펜스의 몽세 주인 역시 흑장미단 신도 중 하나였었다.",
        "tone": "void",
        "title": "환도디펜스의 몽세 주인 역시 흑장미단 신도 중 하나였었다.",
        "mapName": "cult05",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 386,
        "sourceBytes": 934,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-cult05-page-1",
            "label": "환도디펜스의 몽세 주인 역시 흑장미단 신도 중 하나였었다.",
            "title": "환도디펜스의 몽세 주인 역시 흑장미단 신도 중 하나였었다.",
            "speaker": "합일몽세 기록",
            "body": "환도디펜스의 성은 별개의 흑장미단 신도가 만든 몽세가 아니었다.\n\n카이로 특이점이 둘째와 셋째의 융합몽세를 다시 배열해 만든 전장이었다. 그 안에서 두 사람은 라우렌 쌍둥이 기사로 재구성되어 의목사 교단에 합류했다.\n\n그리고 의목사 B와 첫째는 따로 존재하지 않았다. 첫째의 의지는 환도가 되고, 의목사 B의 몸과 전투 기억은 그 칼을 쥔 형상이 되어 환도 영웅으로 합쳐져 있었다.\n\n그제야 더 오래된 현실 기억이 돌아왔다.\n\n긴급 회의와 침투 결정은 지금 일어난 일이 아니었다. 지금까지 이어진 모든 사건보다 앞선 현실에서, 의목사 교단은 이미 사이비 합일몽세에 잠입했다.\n\n침투 직후 의목사들의 기억은 흩어졌고, 각자가 과거에 겪었던 사건들이 하나의 직선 서사처럼 다시 재생되고 있었다.",
            "bodyRaw": "환도디펜스의 성은 별개의 흑장미단 신도가 만든 몽세가 아니었다.\n\n카이로 특이점이 둘째와 셋째의 융합몽세를 다시 배열해 만든 전장이었다. 그 안에서 두 사람은 라우렌 쌍둥이 기사로 재구성되어 의목사 교단에 합류했다.\n\n그리고 의목사 B와 첫째는 따로 존재하지 않았다. 첫째의 의지는 환도가 되고, 의목사 B의 몸과 전투 기억은 그 칼을 쥔 형상이 되어 환도 영웅으로 합쳐져 있었다.\n\n그제야 더 오래된 현실 기억이 돌아왔다.\n\n긴급 회의와 침투 결정은 지금 일어난 일이 아니었다. 지금까지 이어진 모든 사건보다 앞선 현실에서, 의목사 교단은 이미 사이비 합일몽세에 잠입했다.\n\n침투 직후 의목사들의 기억은 흩어졌고, 각자가 과거에 겪었던 사건들이 하나의 직선 서사처럼 다시 재생되고 있었다.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "환도디펜스의 성은 별개의 흑장미단 신도가 만든 몽세가 아니었다.\n\n카이로 특이점이 둘째와 셋째의 융합몽세를 다시 배열해 만든 전장이었다. 그 안에서 두 사람은 라우렌 쌍둥이 기사로 재구성되어 의목사 교단에 합류했다.\n\n그리고 의목사 B와 첫째는 따로 존재하지 않았다. 첫째의 의지는 환도가 되고, 의목사 B의 몸과 전투 기억은 그 칼을 쥔 형상이 되어 환도 영웅으로 합쳐져 있었다.\n\n그제야 더 오래된 현실 기억이 돌아왔다.\n\n긴급 회의와 침투 결정은 지금 일어난 일이 아니었다. 지금까지 이어진 모든 사건보다 앞선 현실에서, 의목사 교단은 이미 사이비 합일몽세에 잠입했다.\n\n침투 직후 의목사들의 기억은 흩어졌고, 각자가 과거에 겪었던 사건들이 하나의 직선 서사처럼 다시 재생되고 있었다."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 386,
            "sourceByteStart": 0,
            "sourceByteEnd": 934,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "cult06": {
        "zone": "cult06",
        "nextZone": "cult03",
        "order": 59,
        "arc": "의목사 교단의 목표는 두 가지.",
        "tone": "void",
        "title": "의목사 교단의 목표는 두 가지.",
        "mapName": "cult06",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 197,
        "sourceBytes": 477,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-cult06-page-1",
            "label": "의목사 교단의 목표는 두 가지.",
            "title": "의목사 교단의 목표는 두 가지.",
            "speaker": "합일몽세 기록",
            "body": "의목사 교단이 현실에서 세운 목표는 두 가지였다.\n\n신도들의 몽세를 정화해 세뇌를 풀 것.\n\n적그리스도의 소환이 완성되기 전에 흑장미단의 합일 회로를 끊을 것.\n\n그러나 합일몽세 안에서는 동료와 환자, 과거와 미래의 구분이 이미 무너져 있었다.\n\n누가 처음부터 의목사였고, 누가 몽세 안에서 의목사가 되었는지는 마지막 코어에 도착해야 확인할 수 있었다.",
            "bodyRaw": "의목사 교단이 현실에서 세운 목표는 두 가지였다.\n\n신도들의 몽세를 정화해 세뇌를 풀 것.\n\n적그리스도의 소환이 완성되기 전에 흑장미단의 합일 회로를 끊을 것.\n\n그러나 합일몽세 안에서는 동료와 환자, 과거와 미래의 구분이 이미 무너져 있었다.\n\n누가 처음부터 의목사였고, 누가 몽세 안에서 의목사가 되었는지는 마지막 코어에 도착해야 확인할 수 있었다.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "의목사 교단이 현실에서 세운 목표는 두 가지였다.\n\n신도들의 몽세를 정화해 세뇌를 풀 것.\n\n적그리스도의 소환이 완성되기 전에 흑장미단의 합일 회로를 끊을 것.\n\n그러나 합일몽세 안에서는 동료와 환자, 과거와 미래의 구분이 이미 무너져 있었다.\n\n누가 처음부터 의목사였고, 누가 몽세 안에서 의목사가 되었는지는 마지막 코어에 도착해야 확인할 수 있었다."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 197,
            "sourceByteStart": 0,
            "sourceByteEnd": 477,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "cult03": {
        "zone": "cult03",
        "nextZone": "cult04",
        "order": 60,
        "arc": "그러나 그들이 들어가려는 세계에서는 시간도, 기억도, 물리법칙도 이미 하나의 꿈으로 합쳐지고 있었다.",
        "tone": "void",
        "title": "그러나 그들이 들어가려는 세계에서는 시간도, 기억도, 물리법칙도 이미 하나의 꿈으로 합쳐지고 있었다.",
        "mapName": "cult03",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 316,
        "sourceBytes": 758,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-cult03-page-1",
            "label": "그러나 그들이 들어가려는 세계에서는 시간도, 기억도, 물리법칙도 이미 하나의 꿈으로 합쳐지고 있었다.",
            "title": "그러나 그들이 들어가려는 세계에서는 시간도, 기억도, 물리법칙도 이미 하나의 꿈으로 합쳐지고 있었다.",
            "speaker": "합일몽세 기록",
            "body": "합일몽세에서 ‘사몽(死夢)’이라 불리는 힘의 정체는 죽음 그 자체가 아니었다.\n\n몽세에서 죽기 직전, 현실의 기억이 주마등처럼 역류한다.\n\n그 순간 눈앞의 세계가 꿈이라는 사실을 깨달은 사람은 자각몽 상태에 들어가고, 보스들처럼 주변 현실의 법칙을 바꿀 수 있다.\n\n죽으면 강해지는 것이 아니다.\n\n자아가 사라지기 전에 현실을 기억해야 한다.\n\n이단 의목사 한리안과 백이온도 그 문턱에 섰다. 그러나 죽음의 공포를 견디지 못했고, 사몽 대신 교주의 합일을 선택했다.\n\n“하나가 되면 죽을 필요가 없다.”\n\n그들은 그 약속을 믿고 교주의 회로를 지키는 자들이 되었다.",
            "bodyRaw": "합일몽세에서 ‘사몽(死夢)’이라 불리는 힘의 정체는 죽음 그 자체가 아니었다.\n\n몽세에서 죽기 직전, 현실의 기억이 주마등처럼 역류한다.\n\n그 순간 눈앞의 세계가 꿈이라는 사실을 깨달은 사람은 자각몽 상태에 들어가고, 보스들처럼 주변 현실의 법칙을 바꿀 수 있다.\n\n죽으면 강해지는 것이 아니다.\n\n자아가 사라지기 전에 현실을 기억해야 한다.\n\n이단 의목사 한리안과 백이온도 그 문턱에 섰다. 그러나 죽음의 공포를 견디지 못했고, 사몽 대신 교주의 합일을 선택했다.\n\n“하나가 되면 죽을 필요가 없다.”\n\n그들은 그 약속을 믿고 교주의 회로를 지키는 자들이 되었다.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "합일몽세에서 ‘사몽(死夢)’이라 불리는 힘의 정체는 죽음 그 자체가 아니었다.\n\n몽세에서 죽기 직전, 현실의 기억이 주마등처럼 역류한다.\n\n그 순간 눈앞의 세계가 꿈이라는 사실을 깨달은 사람은 자각몽 상태에 들어가고, 보스들처럼 주변 현실의 법칙을 바꿀 수 있다.\n\n죽으면 강해지는 것이 아니다.\n\n자아가 사라지기 전에 현실을 기억해야 한다.\n\n이단 의목사 한리안과 백이온도 그 문턱에 섰다. 그러나 죽음의 공포를 견디지 못했고, 사몽 대신 교주의 합일을 선택했다.\n\n“하나가 되면 죽을 필요가 없다.”\n\n그들은 그 약속을 믿고 교주의 회로를 지키는 자들이 되었다."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 316,
            "sourceByteStart": 0,
            "sourceByteEnd": 758,
            "page": 1,
            "pages": 1
          }
        ]
      },
      "cult04": {
        "zone": "cult04",
        "nextZone": "village",
        "order": 61,
        "arc": "순환살인몽세까지 돌파하자 의목사는 마침내 합일몽세의 코어에 당도하게 된다.",
        "tone": "void",
        "title": "순환살인몽세까지 돌파하자 의목사는 마침내 합일몽세의 코어에 당도하게 된다.",
        "mapName": "cult04",
        "sourceKind": "hapil-final-interlude-v31300",
        "sourceFile": "INTERLUDE_FINAL_KO.txt",
        "sourceSha256": "b141b88dcb08b1f2859c57ab28bd0298492466282fa2256a9e7919de4808dd9f",
        "sourceCharacters": 1486,
        "sourceBytes": 3552,
        "canonicalFullText": true,
        "canonicalExactText": true,
        "slides": [
          {
            "id": "v31300-cult04-page-1",
            "label": "순환살인몽세까지 돌파하자 의목사는 마침내 합일몽세의 코어에 당도하게 된다.",
            "title": "순환살인몽세까지 돌파하자 의목사는 마침내 합일몽세의 코어에 당도하게 된다.",
            "speaker": "합일몽세 기록",
            "body": "【최종전 — 교주의 사몽】\n\n순환살인몽세를 돌파한 환도 영웅은 마침내 합일몽세의 코어에 도착했다.\n\n교만의 사이보그 교주는 이미 사몽으로 각성한 자였다. 그는 지금까지의 보스들이 사용하던 공간 왜곡과 시간 정지, 기억 삭제를 한 몸처럼 다뤘다.\n\n환도 영웅은 모든 힘을 쏟아 교주를 쓰러뜨렸다. 그러나 그 자신도 치명상을 입고 행동할 수 없는 상태가 되었다.\n\n합일 코어를 파괴해야 했다.\n\n하지만 손가락 하나 움직일 수 없었다.\n\n그때 코어가 다시 뛰기 시작했다. 검은 신경선이 교주의 몸을 꿰매고, 멎었던 심장에 사몽 에너지를 밀어 넣었다.\n\n교주가 부활했다.\n\n“죽음이 두렵다면 나와 하나가 되어라.”\n\n교주는 쓰러진 환도 영웅의 숨통을 끊으려 했다.\n\n그 순간 주마등이 스쳤다.\n\n현실의 지하 접속실.\n\n신경 장치에 누워 있던 의목사들.\n\n흰 가운을 입은 정신과 의사 미카엘라.\n\n첫째의 손을 잡던 의목사 B.\n\n둘째와 셋째의 이름이 함께 적힌 세쌍둥이 기록.\n\n그리고 합일몽세에 침투하기 직전, 서로에게 했던 약속.\n\n그 장면들은 죽은 뒤의 환상이 아니었다.\n\n현실의 기억이었다.\n\n“여긴…… 꿈속 세계다.”\n\n화면의 ‘사망’이라는 글자가 갈라지며 ‘사몽’으로 바뀌었다.\n\n“내가 꾸는 꿈이라면, 나에게도 권한이 있어.”\n\n환도 영웅은 자신이 다시 일어나는 모습을 상상했다.\n\n몽세의 몸은 그 상상을 현실로 받아들였다.\n\n상처가 닫히고, 부서진 환도가 다시 이어졌다. 교주의 방벽은 베어 낼 수 있는 실로 변했고, 닫힌 길은 열렸으며, 뒤집힌 전장은 환도 영웅의 의지에 따라 제자리로 돌아왔다.\n\n교주와 환도 영웅은 같은 사몽의 힘으로 현실을 바꾸며 맞섰다.\n\n그러나 승패는 오래 걸리지 않았다.\n\n교주는 하나의 자아로 수많은 자아를 통제했다.\n\n환도 영웅 안에서는 의목사 B와 첫째의 의지가 서로의 동의 아래 공존했다.\n\n하나와 둘.\n\n가장 단순한 수학적 차이가 승패를 갈랐다.\n\n마지막 일격이 교주의 사몽 권한을 끊었다.\n\n교주는 그렇게 합일몽세에서 사라졌다.\n\n────────────────────────────────────────\n\n【종장 — 남겨진 몽세】\n\n전장에 남은 것은 환도 영웅과 합일 코어뿐이었다.\n\n환도 영웅은 코어를 파괴하지 않았다.\n\n",
            "bodyRaw": "【최종전 — 교주의 사몽】\n\n순환살인몽세를 돌파한 환도 영웅은 마침내 합일몽세의 코어에 도착했다.\n\n교만의 사이보그 교주는 이미 사몽으로 각성한 자였다. 그는 지금까지의 보스들이 사용하던 공간 왜곡과 시간 정지, 기억 삭제를 한 몸처럼 다뤘다.\n\n환도 영웅은 모든 힘을 쏟아 교주를 쓰러뜨렸다. 그러나 그 자신도 치명상을 입고 행동할 수 없는 상태가 되었다.\n\n합일 코어를 파괴해야 했다.\n\n하지만 손가락 하나 움직일 수 없었다.\n\n그때 코어가 다시 뛰기 시작했다. 검은 신경선이 교주의 몸을 꿰매고, 멎었던 심장에 사몽 에너지를 밀어 넣었다.\n\n교주가 부활했다.\n\n“죽음이 두렵다면 나와 하나가 되어라.”\n\n교주는 쓰러진 환도 영웅의 숨통을 끊으려 했다.\n\n그 순간 주마등이 스쳤다.\n\n현실의 지하 접속실.\n\n신경 장치에 누워 있던 의목사들.\n\n흰 가운을 입은 정신과 의사 미카엘라.\n\n첫째의 손을 잡던 의목사 B.\n\n둘째와 셋째의 이름이 함께 적힌 세쌍둥이 기록.\n\n그리고 합일몽세에 침투하기 직전, 서로에게 했던 약속.\n\n그 장면들은 죽은 뒤의 환상이 아니었다.\n\n현실의 기억이었다.\n\n“여긴…… 꿈속 세계다.”\n\n화면의 ‘사망’이라는 글자가 갈라지며 ‘사몽’으로 바뀌었다.\n\n“내가 꾸는 꿈이라면, 나에게도 권한이 있어.”\n\n환도 영웅은 자신이 다시 일어나는 모습을 상상했다.\n\n몽세의 몸은 그 상상을 현실로 받아들였다.\n\n상처가 닫히고, 부서진 환도가 다시 이어졌다. 교주의 방벽은 베어 낼 수 있는 실로 변했고, 닫힌 길은 열렸으며, 뒤집힌 전장은 환도 영웅의 의지에 따라 제자리로 돌아왔다.\n\n교주와 환도 영웅은 같은 사몽의 힘으로 현실을 바꾸며 맞섰다.\n\n그러나 승패는 오래 걸리지 않았다.\n\n교주는 하나의 자아로 수많은 자아를 통제했다.\n\n환도 영웅 안에서는 의목사 B와 첫째의 의지가 서로의 동의 아래 공존했다.\n\n하나와 둘.\n\n가장 단순한 수학적 차이가 승패를 갈랐다.\n\n마지막 일격이 교주의 사몽 권한을 끊었다.\n\n교주는 그렇게 합일몽세에서 사라졌다.\n\n────────────────────────────────────────\n\n【종장 — 남겨진 몽세】\n\n전장에 남은 것은 환도 영웅과 합일 코어뿐이었다.\n\n환도 영웅은 코어를 파괴하지 않았다.\n\n",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "【최종전 — 교주의 사몽】\n\n순환살인몽세를 돌파한 환도 영웅은 마침내 합일몽세의 코어에 도착했다.\n\n교만의 사이보그 교주는 이미 사몽으로 각성한 자였다. 그는 지금까지의 보스들이 사용하던 공간 왜곡과 시간 정지, 기억 삭제를 한 몸처럼 다뤘다.\n\n환도 영웅은 모든 힘을 쏟아 교주를 쓰러뜨렸다. 그러나 그 자신도 치명상을 입고 행동할 수 없는 상태가 되었다.\n\n합일 코어를 파괴해야 했다.\n\n하지만 손가락 하나 움직일 수 없었다.\n\n그때 코어가 다시 뛰기 시작했다. 검은 신경선이 교주의 몸을 꿰매고, 멎었던 심장에 사몽 에너지를 밀어 넣었다.\n\n교주가 부활했다.\n\n“죽음이 두렵다면 나와 하나가 되어라.”\n\n교주는 쓰러진 환도 영웅의 숨통을 끊으려 했다.\n\n그 순간 주마등이 스쳤다.\n\n현실의 지하 접속실.\n\n신경 장치에 누워 있던 의목사들.\n\n흰 가운을 입은 정신과 의사 미카엘라.\n\n첫째의 손을 잡던 의목사 B.\n\n둘째와 셋째의 이름이 함께 적힌 세쌍둥이 기록.\n\n그리고 합일몽세에 침투하기 직전, 서로에게 했던 약속.\n\n그 장면들은 죽은 뒤의 환상이 아니었다.\n\n현실의 기억이었다.\n\n“여긴…… 꿈속 세계다.”\n\n화면의 ‘사망’이라는 글자가 갈라지며 ‘사몽’으로 바뀌었다.\n\n“내가 꾸는 꿈이라면, 나에게도 권한이 있어.”\n\n환도 영웅은 자신이 다시 일어나는 모습을 상상했다.\n\n몽세의 몸은 그 상상을 현실로 받아들였다.\n\n상처가 닫히고, 부서진 환도가 다시 이어졌다. 교주의 방벽은 베어 낼 수 있는 실로 변했고, 닫힌 길은 열렸으며, 뒤집힌 전장은 환도 영웅의 의지에 따라 제자리로 돌아왔다.\n\n교주와 환도 영웅은 같은 사몽의 힘으로 현실을 바꾸며 맞섰다.\n\n그러나 승패는 오래 걸리지 않았다.\n\n교주는 하나의 자아로 수많은 자아를 통제했다.\n\n환도 영웅 안에서는 의목사 B와 첫째의 의지가 서로의 동의 아래 공존했다.\n\n하나와 둘.\n\n가장 단순한 수학적 차이가 승패를 갈랐다.\n\n마지막 일격이 교주의 사몽 권한을 끊었다.\n\n교주는 그렇게 합일몽세에서 사라졌다.\n\n────────────────────────────────────────\n\n【종장 — 남겨진 몽세】\n\n전장에 남은 것은 환도 영웅과 합일 코어뿐이었다.\n\n환도 영웅은 코어를 파괴하지 않았다.\n\n"
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 0,
            "sourceEnd": 1102,
            "sourceByteStart": 0,
            "sourceByteEnd": 2632,
            "page": 1,
            "pages": 2
          },
          {
            "id": "v31300-cult04-page-2",
            "label": "순환살인몽세까지 돌파하자 의목사는 마침내 합일몽세의 코어에 당도하게 된다.",
            "title": "순환살인몽세까지 돌파하자 의목사는 마침내 합일몽세의 코어에 당도하게 된다.",
            "speaker": "합일몽세 기록",
            "body": "대신 교주가 심어 둔 명령과 흑장미단의 사이비 회로만 지웠다. 그리고 자신의 사몽 권한을 코어에 연결해, 무너져 가는 몽세를 붙들었다.\n\n강제로 묶였던 자아들은 각자의 이름과 기억을 되찾았다.\n\n그러나 지금까지 이어진 세계들은 사라지지 않았다. 서로 다른 몽세는 하나의 세계 안에서 계속 존재했다.\n\n사이비는 사라졌다.\n\n합일몽세만 남았다.\n\n환도 영웅은 현실로 돌아가는 대신 코어에 남아, 그 세계를 유지하는 진정한 몽세구원자가 되었다.\n\n그 뒤로 그 세계는 더 이상 사이비의 감옥이 아니라, 의목사가 유지하는 몽세로서 이어졌다.\n\n화면에 남아 있던 두 글자, 合一 뒤에서 처음부터 장식처럼 숨어 있던 획들이 움직였다.\n\n흩어진 획들이 마침내 夢世를 완성했다.\n\n合一夢世.\n\n합일몽세.",
            "bodyRaw": "대신 교주가 심어 둔 명령과 흑장미단의 사이비 회로만 지웠다. 그리고 자신의 사몽 권한을 코어에 연결해, 무너져 가는 몽세를 붙들었다.\n\n강제로 묶였던 자아들은 각자의 이름과 기억을 되찾았다.\n\n그러나 지금까지 이어진 세계들은 사라지지 않았다. 서로 다른 몽세는 하나의 세계 안에서 계속 존재했다.\n\n사이비는 사라졌다.\n\n합일몽세만 남았다.\n\n환도 영웅은 현실로 돌아가는 대신 코어에 남아, 그 세계를 유지하는 진정한 몽세구원자가 되었다.\n\n그 뒤로 그 세계는 더 이상 사이비의 감옥이 아니라, 의목사가 유지하는 몽세로서 이어졌다.\n\n화면에 남아 있던 두 글자, 合一 뒤에서 처음부터 장식처럼 숨어 있던 획들이 움직였다.\n\n흩어진 획들이 마침내 夢世를 완성했다.\n\n合一夢世.\n\n합일몽세.",
            "voices": [
              {
                "speaker": "합일몽세 기록",
                "role": "narration",
                "text": "대신 교주가 심어 둔 명령과 흑장미단의 사이비 회로만 지웠다. 그리고 자신의 사몽 권한을 코어에 연결해, 무너져 가는 몽세를 붙들었다.\n\n강제로 묶였던 자아들은 각자의 이름과 기억을 되찾았다.\n\n그러나 지금까지 이어진 세계들은 사라지지 않았다. 서로 다른 몽세는 하나의 세계 안에서 계속 존재했다.\n\n사이비는 사라졌다.\n\n합일몽세만 남았다.\n\n환도 영웅은 현실로 돌아가는 대신 코어에 남아, 그 세계를 유지하는 진정한 몽세구원자가 되었다.\n\n그 뒤로 그 세계는 더 이상 사이비의 감옥이 아니라, 의목사가 유지하는 몽세로서 이어졌다.\n\n화면에 남아 있던 두 글자, 合一 뒤에서 처음부터 장식처럼 숨어 있던 획들이 움직였다.\n\n흩어진 획들이 마침내 夢世를 완성했다.\n\n合一夢世.\n\n합일몽세."
              }
            ],
            "sourceKind": "hapil-final-interlude-v31300",
            "canonicalExactText": true,
            "sourceStart": 1102,
            "sourceEnd": 1486,
            "sourceByteStart": 2632,
            "sourceByteEnd": 3552,
            "page": 2,
            "pages": 2
          }
        ]
      }
    },
    "archiveChapters": [
      {
        "id": "v31300-story-01",
        "episode": "合一",
        "title": "合一",
        "unlockZone": "hub",
        "body": "合一\n간결 서사본.\n\n※ 약물 의존과 금단, 환각, 의료·심리 위기, 폭력과 죽음에 관한 묘사가 포함되어 있다.\n\n============================================================\n제1부  에피소드 1-A — 마지막 수호자와 의목사 후보생\n============================================================\n\n【1. 악마가 점령한 세계】\n\n나는 내가 누구인지 모른다.\n\n어디에 있는지도 기억나지 않는다. 과거를 더듬을 때마다 깨진 유리 같은 장면만 번뜩였다가 사라진다.\n\n그래도 한 가지는 확신한다.\n\n나는 악마가 점령한 세계에 남은 마지막 수호자다.\n\n자아를 잃지 않은 유일한 에고(Ego).\n\n세상은 본래 천사들이 관리했다. 그러나 어느 날, 궁전 정원 한가운데에서 악마화 나무가 자라기 시작했다. 나무는 이내 성 전체를 물들이고 천사들을 악마로 타락시켰다.\n\n그들은 ID(이드)라고 한다.\n\n나무는 육체만을 빼앗지 않았다. 기억을 먹고 감정을 바꾸며, 바라보는 현실 자체를 뒤틀었다.\n\n나는 폐허가 된 도시를 홀로 걸었다. 손에는 이름 모를 검이 들려 있었다.\n\n검날에 묻은 피의 절반은 악마의 것이었다.\n\n나머지 절반은 한때 내 동료였던 자들의 것이었다.\n\n────────────────────────────────────────",
        "editedBody": "合一\n간결 서사본.\n\n※ 약물 의존과 금단, 환각, 의료·심리 위기, 폭력과 죽음에 관한 묘사가 포함되어 있다.\n\n============================================================\n제1부  에피소드 1-A — 마지막 수호자와 의목사 후보생\n============================================================\n\n【1. 악마가 점령한 세계】\n\n나는 내가 누구인지 모른다.\n\n어디에 있는지도 기억나지 않는다. 과거를 더듬을 때마다 깨진 유리 같은 장면만 번뜩였다가 사라진다.\n\n그래도 한 가지는 확신한다.\n\n나는 악마가 점령한 세계에 남은 마지막 수호자다.\n\n자아를 잃지 않은 유일한 에고(Ego).\n\n세상은 본래 천사들이 관리했다. 그러나 어느 날, 궁전 정원 한가운데에서 악마화 나무가 자라기 시작했다. 나무는 이내 성 전체를 물들이고 천사들을 악마로 타락시켰다.\n\n그들은 ID(이드)라고 한다.\n\n나무는 육체만을 빼앗지 않았다. 기억을 먹고 감정을 바꾸며, 바라보는 현실 자체를 뒤틀었다.\n\n나는 폐허가 된 도시를 홀로 걸었다. 손에는 이름 모를 검이 들려 있었다.\n\n검날에 묻은 피의 절반은 악마의 것이었다.\n\n나머지 절반은 한때 내 동료였던 자들의 것이었다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-02",
        "episode": "【2. 거미동굴】",
        "title": "【2. 거미동굴】",
        "unlockZone": "dist01",
        "body": "【2. 거미동굴】\n\n가장 오래된 기억은 사람의 뼈로 거미줄을 짠 동굴에서 시작되었다.\n\n이름조차 떠오르지 않는 동료가 내 어깨를 붙잡았다.\n\n“저 안에 보라검천사가 있어.”\n\n“천사라고?”\n\n“과거에는 그랬겠지.”\n\n보랏빛이 동굴을 갈랐다. 흰 날개 사이로 여덟 개의 거미 다리를 뻗은 여인이 거미줄 위를 걸어 나왔다.\n\n“인간은 배고프면 훔치고, 두려우면 죽이며, 사랑받지 못하면 타인을 파괴한다.”\n\n보라검천사가 검을 들었다.\n\n“너희와 악마가 무엇이 다르지?”\n\n“선을 선택할 수 있다는 점.”\n\n검이 부딪치며 불꽃이 튀었다. 그 순간 동료 한 명이 거미줄에 붙잡혀 천장으로 끌려갔다. 나는 그를 구하려다 옆구리를 베였다.\n\n“나 때문에 멈추지는 마!”\n\n“함께 나갈 거야.”\n\n“이번에도 누군가를 구하려다 전부 죽일 셈이야?”\n\n이번에도.\n\n그 말이 머릿속에 걸렸다. 그러나 묻기도 전에 동료는 스스로 거미줄을 감고 보라검천사에게 달려들었다.\n\n“지금이야!”\n\n나는 두 사람을 함께 꿰뚫었다.\n\n보랏빛 불길 속에서 천사와 동료가 동시에 타올랐다. 끝내 그의 이름은 떠오르지 않았다.\n\n나는 피 묻은 검을 들고 동굴을 나왔다.\n\n동료들의 피를 짊어지겠다.\n\n그들의 죽음을 헛되게 하지 않겠다.\n\n그것이 사명감인지 죄책감인지 알 수 없었다.\n\n애초에 그 동료가 정말 존재했는지도.\n\n────────────────────────────────────────",
        "editedBody": "【2. 거미동굴】\n\n가장 오래된 기억은 사람의 뼈로 거미줄을 짠 동굴에서 시작되었다.\n\n이름조차 떠오르지 않는 동료가 내 어깨를 붙잡았다.\n\n“저 안에 보라검천사가 있어.”\n\n“천사라고?”\n\n“과거에는 그랬겠지.”\n\n보랏빛이 동굴을 갈랐다. 흰 날개 사이로 여덟 개의 거미 다리를 뻗은 여인이 거미줄 위를 걸어 나왔다.\n\n“인간은 배고프면 훔치고, 두려우면 죽이며, 사랑받지 못하면 타인을 파괴한다.”\n\n보라검천사가 검을 들었다.\n\n“너희와 악마가 무엇이 다르지?”\n\n“선을 선택할 수 있다는 점.”\n\n검이 부딪치며 불꽃이 튀었다. 그 순간 동료 한 명이 거미줄에 붙잡혀 천장으로 끌려갔다. 나는 그를 구하려다 옆구리를 베였다.\n\n“나 때문에 멈추지는 마!”\n\n“함께 나갈 거야.”\n\n“이번에도 누군가를 구하려다 전부 죽일 셈이야?”\n\n이번에도.\n\n그 말이 머릿속에 걸렸다. 그러나 묻기도 전에 동료는 스스로 거미줄을 감고 보라검천사에게 달려들었다.\n\n“지금이야!”\n\n나는 두 사람을 함께 꿰뚫었다.\n\n보랏빛 불길 속에서 천사와 동료가 동시에 타올랐다. 끝내 그의 이름은 떠오르지 않았다.\n\n나는 피 묻은 검을 들고 동굴을 나왔다.\n\n동료들의 피를 짊어지겠다.\n\n그들의 죽음을 헛되게 하지 않겠다.\n\n그것이 사명감인지 죄책감인지 알 수 없었다.\n\n애초에 그 동료가 정말 존재했는지도.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-03",
        "episode": "【3. 늪지대의 뿔악마】",
        "title": "【3. 늪지대의 뿔악마】",
        "unlockZone": "dist02",
        "body": "【3. 늪지대의 뿔악마】\n\n거미동굴 너머에는 검은 늪이 펼쳐져 있었다. 사람 얼굴을 닮은 수초가 떠다니고, 물속의 손들이 발목을 붙잡았다.\n\n늪을 지배하는 뿔악마의 뿔에는 죽은 수호자들의 머리가 매달려 있었다.\n\n“마지막 수호자가 왔군.”\n\n“나는 혼자가 아니야.”\n\n“뒤를 봐라.”\n\n아무도 없었다.\n\n늪에서 익숙한 얼굴들이 올라왔다. 함께 싸웠고, 내 앞에서 죽었으며, 내가 지키지 못했던 자들.\n\n모두 악마의 뿔을 달고 있었다.\n\n“왜 우리를 버리고 갔어?”\n\n“버리지 않았어.”\n\n“우리를 죽인 게 정말 악마였을까?”\n\n그들이 일제히 달려들었다.\n\n나는 울면서 검을 휘둘렀다. 목을 베고, 심장을 찔렀다. 쓰러지는 순간마다 그들의 얼굴은 인간으로 돌아왔다.\n\n마지막 동료가 검은 피를 토하며 북쪽을 가리켰다.\n\n“최초의 장소로 가.”\n\n“최초의 장소?”\n\n“악마가 처음 나타난 지옥의 소환진…… 그리고…… 믿지 마.”\n\n그는 늪 아래로 가라앉았다.\n\n그때 머릿속에서 맑은 목소리가 들렸다.\n\n— 흔들리지 마.\n\n하얀 날개의 천사가 빛 속에서 모습을 드러냈다.\n\n— 나는 언제나 네 곁에 있었다. 소환진으로 가라. 너만이 세상을 구할 수 있다.\n\n…… 믿지 마.\n\n죽은 동료의 경고가 떠올랐지만, 천사의 목소리는 너무 따뜻했다.\n\n너는 특별하다.\n\n너만이 진실을 안다.\n\n너는 선택받았다.\n\n의심은 안개처럼 흩어졌다.\n\n나는 다시 검을 들었다.\n\n────────────────────────────────────────",
        "editedBody": "【3. 늪지대의 뿔악마】\n\n거미동굴 너머에는 검은 늪이 펼쳐져 있었다. 사람 얼굴을 닮은 수초가 떠다니고, 물속의 손들이 발목을 붙잡았다.\n\n늪을 지배하는 뿔악마의 뿔에는 죽은 수호자들의 머리가 매달려 있었다.\n\n“마지막 수호자가 왔군.”\n\n“나는 혼자가 아니야.”\n\n“뒤를 봐라.”\n\n아무도 없었다.\n\n늪에서 익숙한 얼굴들이 올라왔다. 함께 싸웠고, 내 앞에서 죽었으며, 내가 지키지 못했던 자들.\n\n모두 악마의 뿔을 달고 있었다.\n\n“왜 우리를 버리고 갔어?”\n\n“버리지 않았어.”\n\n“우리를 죽인 게 정말 악마였을까?”\n\n그들이 일제히 달려들었다.\n\n나는 울면서 검을 휘둘렀다. 목을 베고, 심장을 찔렀다. 쓰러지는 순간마다 그들의 얼굴은 인간으로 돌아왔다.\n\n마지막 동료가 검은 피를 토하며 북쪽을 가리켰다.\n\n“최초의 장소로 가.”\n\n“최초의 장소?”\n\n“악마가 처음 나타난 지옥의 소환진…… 그리고…… 믿지 마.”\n\n그는 늪 아래로 가라앉았다.\n\n그때 머릿속에서 맑은 목소리가 들렸다.\n\n— 흔들리지 마.\n\n하얀 날개의 천사가 빛 속에서 모습을 드러냈다.\n\n— 나는 언제나 네 곁에 있었다. 소환진으로 가라. 너만이 세상을 구할 수 있다.\n\n…… 믿지 마.\n\n죽은 동료의 경고가 떠올랐지만, 천사의 목소리는 너무 따뜻했다.\n\n너는 특별하다.\n\n너만이 진실을 안다.\n\n너는 선택받았다.\n\n의심은 안개처럼 흩어졌다.\n\n나는 다시 검을 들었다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-04",
        "episode": "【4. 지옥의 문지기】",
        "title": "【4. 지옥의 문지기】",
        "unlockZone": "dist03",
        "body": "【4. 지옥의 문지기】\n\n소환진은 무너진 도시의 중심에 있었다. 검은 기둥 일곱 개 사이에서 불길이 솟았고, 박쥐 날개와 황소 뿔을 지닌 발록이 걸어 나왔다.\n\n“네가 최초의 악마인가?”\n\n“그 질문부터 틀렸다. 너는 원인과 결과를 거꾸로 보고 있어.”",
        "editedBody": "【4. 지옥의 문지기】\n\n소환진은 무너진 도시의 중심에 있었다. 검은 기둥 일곱 개 사이에서 불길이 솟았고, 박쥐 날개와 황소 뿔을 지닌 발록이 걸어 나왔다.\n\n“네가 최초의 악마인가?”\n\n“그 질문부터 틀렸다. 너는 원인과 결과를 거꾸로 보고 있어.”",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-05",
        "episode": "발록의 채찍이 도로를 갈랐다.",
        "title": "발록의 채찍이 도로를 갈랐다.",
        "unlockZone": "dist04",
        "body": "발록의 채찍이 도로를 갈랐다.\n\n“그만 포기하면 편해진다. 너는 이미 기억도, 이름도, 돌아갈 곳도 잃었다.”\n\n“그래도 싸운다.”\n\n“무엇을 위해서?”\n\n나는 검을 움켜쥐었다.\n\n“내가 살아 있어야 그들의 존재를 기억할 수 있으니까. 나를 지키는 일과 세계를 지키는 일은 결국 같은 방향을 가리킨다.”",
        "editedBody": "발록의 채찍이 도로를 갈랐다.\n\n“그만 포기하면 편해진다. 너는 이미 기억도, 이름도, 돌아갈 곳도 잃었다.”\n\n“그래도 싸운다.”\n\n“무엇을 위해서?”\n\n나는 검을 움켜쥐었다.\n\n“내가 살아 있어야 그들의 존재를 기억할 수 있으니까. 나를 지키는 일과 세계를 지키는 일은 결국 같은 방향을 가리킨다.”",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-06",
        "episode": "전투가 시작되었다.",
        "title": "전투가 시작되었다.",
        "unlockZone": "dist05",
        "body": "전투가 시작되었다.\n\n발록의 검이 어깨를 가르고 불덩이가 하늘을 뒤덮었다. 무너진 기둥 뒤에서 숨을 고르자 천사가 속삭였다.\n\n— 고통을 없애 주겠다.\n\n순간 상처도 두려움도 사라졌다. 오직 발록을 죽여야 한다는 목적만 남았다.\n\n나는 불길 속으로 뛰어들어 놈의 가슴에 검을 박았다.\n\n발록이 피를 토했다.",
        "editedBody": "전투가 시작되었다.\n\n발록의 검이 어깨를 가르고 불덩이가 하늘을 뒤덮었다. 무너진 기둥 뒤에서 숨을 고르자 천사가 속삭였다.\n\n— 고통을 없애 주겠다.\n\n순간 상처도 두려움도 사라졌다. 오직 발록을 죽여야 한다는 목적만 남았다.\n\n나는 불길 속으로 뛰어들어 놈의 가슴에 검을 박았다.\n\n발록이 피를 토했다.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-07",
        "episode": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라 계속 싸우게 만들려는 것이야!!”",
        "title": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라 계속 싸우게 만들려는 것이야!!”",
        "unlockZone": "dist06",
        "body": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라, 계속 싸우게 만들려는 것이다!”\n\n나는 검을 비틀었다.\n\n발록은 재가 되면서도 웃었다.\n\n“내가 쓰러졌으니 이제 지옥이 열리겠군.”\n\n천사가 소환진을 가리켰다.\n\n— 파괴해. 그러면 모든 고통이 끝난다.\n\n나는 검을 내려쳤다.\n\n소환진이 갈라지고, 세상이 무너졌다.\n\n────────────────────────────────────────",
        "editedBody": "“네가 듣는 목소리를…… 확신하지 마라. 그것은 너를 살리려는 게 아니라, 계속 싸우게 만들려는 것이다!”\n\n나는 검을 비틀었다.\n\n발록은 재가 되면서도 웃었다.\n\n“내가 쓰러졌으니 이제 지옥이 열리겠군.”\n\n천사가 소환진을 가리켰다.\n\n— 파괴해. 그러면 모든 고통이 끝난다.\n\n나는 검을 내려쳤다.\n\n소환진이 갈라지고, 세상이 무너졌다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-08",
        "episode": "【5. 추락】",
        "title": "【5. 추락】",
        "unlockZone": "ep1a07",
        "body": "【5. 추락】\n\n검은 소용돌이가 도시를 집어삼켰다.\n\n건물과 시체, 무기와 기둥이 빨려 들어갔다. 검을 땅에 꽂았지만 땅 자체가 무너졌다.\n\n“끝난다고 했잖아!”\n\n— 문이 열렸다. 이제 진짜 세계로 갈 수 있어.\n\n내 몸이 소용돌이로 끌려갔다.\n\n거미동굴.\n\n늪지대.\n\n죽은 동료들.\n\n발록.\n\n기억이 하나씩 부서졌다.\n\n“나는 누구지?”\n\n— 너는 수호자다. 나를 믿어.\n\n그 목소리만 남은 채 나는 어둠으로 추락했다.\n\n────────────────────────────────────────",
        "editedBody": "【5. 추락】\n\n검은 소용돌이가 도시를 집어삼켰다.\n\n건물과 시체, 무기와 기둥이 빨려 들어갔다. 검을 땅에 꽂았지만 땅 자체가 무너졌다.\n\n“끝난다고 했잖아!”\n\n— 문이 열렸다. 이제 진짜 세계로 갈 수 있어.\n\n내 몸이 소용돌이로 끌려갔다.\n\n거미동굴.\n\n늪지대.\n\n죽은 동료들.\n\n발록.\n\n기억이 하나씩 부서졌다.\n\n“나는 누구지?”\n\n— 너는 수호자다. 나를 믿어.\n\n그 목소리만 남은 채 나는 어둠으로 추락했다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-09",
        "episode": "【6. 피로 물든 병원】",
        "title": "【6. 피로 물든 병원】",
        "unlockZone": "ep1a08",
        "body": "【6. 피로 물든 병원】\n\n삐―\n\n눈을 뜨자 차가운 형광등과 소독약 냄새가 나를 맞았다. 갑옷 대신 환자복을 입고 있었고, 손목은 침대에 묶여 있었다.\n\n복도 바닥에는 피가 이어졌고 벽에는 붉은 글씨가 적혀 있었다.\n\nHELP ME.\n\n주사기를 든 간호사가 다가왔다.\n\n“움직이지 마세요. 지금 상태가 좋지 않습니다.”\n\n그녀의 피부 아래에서 벌레가 꿈틀거리고 입이 귀밑까지 찢어졌다.\n\n— 저것들은 인간이 아니다.\n\n“다가오지 마!”\n\n간호사의 얼굴이 다시 평범해졌다.\n\n곧 의사가 나타났지만 그의 말은 내 귀에서 “육육육…… 루시퍼…… 복종……”으로 뒤틀렸다.\n\n— 치료라는 말은 함정이다. 저들을 믿으면 영혼을 빼앗긴다.\n\n나는 손목이 상하는 것도 아랑곳하지 않고 고정 장치에서 빠져나와 복도로 달렸다.\n\n그러나 피에서는 피 냄새가 아니라 소독약 냄새가 났다. HELP ME는 가까이서 보니 붉은 크레용이었다.\n\n그 사실을 깨닫는 순간, 복도는 다시 피로 뒤덮였다.\n\n“어느 쪽이 진짜지?”\n\n— 네가 보는 것이 진실이다.\n\n천사의 설명은 모든 모순에 답했다.\n\n그래서 더욱 위험했다.\n\n────────────────────────────────────────",
        "editedBody": "【6. 피로 물든 병원】\n\n삐―\n\n눈을 뜨자 차가운 형광등과 소독약 냄새가 나를 맞았다. 갑옷 대신 환자복을 입고 있었고, 손목은 침대에 묶여 있었다.\n\n복도 바닥에는 피가 이어졌고 벽에는 붉은 글씨가 적혀 있었다.\n\nHELP ME.\n\n주사기를 든 간호사가 다가왔다.\n\n“움직이지 마세요. 지금 상태가 좋지 않습니다.”\n\n그녀의 피부 아래에서 벌레가 꿈틀거리고 입이 귀밑까지 찢어졌다.\n\n— 저것들은 인간이 아니다.\n\n“다가오지 마!”\n\n간호사의 얼굴이 다시 평범해졌다.\n\n곧 의사가 나타났지만 그의 말은 내 귀에서 “육육육…… 루시퍼…… 복종……”으로 뒤틀렸다.\n\n— 치료라는 말은 함정이다. 저들을 믿으면 영혼을 빼앗긴다.\n\n나는 손목이 상하는 것도 아랑곳하지 않고 고정 장치에서 빠져나와 복도로 달렸다.\n\n그러나 피에서는 피 냄새가 아니라 소독약 냄새가 났다. HELP ME는 가까이서 보니 붉은 크레용이었다.\n\n그 사실을 깨닫는 순간, 복도는 다시 피로 뒤덮였다.\n\n“어느 쪽이 진짜지?”\n\n— 네가 보는 것이 진실이다.\n\n천사의 설명은 모든 모순에 답했다.\n\n그래서 더욱 위험했다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-10",
        "episode": "【7. 주사실】",
        "title": "【7. 주사실】",
        "unlockZone": "ep1a09",
        "body": "【7. 주사실】\n\n손끝이 떨리고 뼛속을 벌레가 기어 다니는 듯했다. 혀가 마르고 온몸이 뒤틀렸다.\n\n복도 끝의 주사실을 보는 순간, 머리보다 몸이 먼저 반응했다.\n\n— 저 안에 성수가 있다.\n\n서랍 깊은 곳에서 약병 하나를 찾았다.\n\nFENTANYL.\n\n어두운 방과 녹슨 숟가락, 쓰러져 있던 사람의 기억이 번쩍였다.\n\n‘한 번만.’\n\n그 목소리는 천사와 닮아 있었다.\n\n“이게 뭐지?”\n\n— 성수다. 고통을 없애 줄 거야.\n\n문밖에서 의사가 외쳤다.\n\n“약품에 손대지 마십시오!”\n\n몸은 약을 원했고, 천사는 그것을 구원이라 불렀다.\n\n이번 한 번만 편해지면 다시 싸울 수 있다.\n\n나는 결국 바늘을 피부에 찔렀다.\n\n고통이 멀어지고 따뜻한 빛이 퍼졌다.\n\n천사가 나를 끌어안았다.\n\n— 잘했어. 이제 다시 기억할 수 있을 거야.\n\n닫혀 있던 기억의 문이 열렸다.\n\n────────────────────────────────────────\n\n【8. 결전의 날】\n\n나는 다시 무너진 도시에 서 있었다.\n\n천사와 악마가 갈라진 하늘에서 쏟아졌고, 수십 명의 수호자가 내 곁에서 싸웠다. 우리는 악마화 나무가 삼켜 버린 황궁 문, 그 너머 초천사의 봉인 앞까지 당도했다.\n\n문틈 너머의 천사는 웃고 있었다.\n\n자비가 아니라, 먹잇감이 덫에 걸리기를 기다리는 미소였다.\n\n그때 발록이 나타났다.\n\n“너는 여기서 끝이다.”\n\n“아니, 끝을 정하는 건 너희가 아니야.”\n\n전투가 절정에 이르자 세계가 겹쳐졌다.\n\n발록의 검은 경찰의 진압봉으로, 불타는 채찍은 구급대원의 팔로 변했다. 시체가 있던 자리에는 주사기와 빈 약봉지가 널려 있었다.\n\n발록의 얼굴이 중년 구급대원으로 바뀌었다.\n\n“우리는 너를 살리려 했어!”\n\n“거짓말!”\n\n“네가 검이라 믿고 휘두른 것은 깨진 주사기였고, 네가 악마라 부른 사람들은 너를 구하러 온 사람들이었다.”\n\n손안의 검이 깨진 유리 조각으로 흔들렸다.\n\n“아니야!”\n\n나는 현실을 향해 검을 휘둘렀다.\n\n모든 것이 하얗게 타올랐다.\n\n────────────────────────────────────────",
        "editedBody": "【7. 주사실】\n\n손끝이 떨리고 뼛속을 벌레가 기어 다니는 듯했다. 혀가 마르고 온몸이 뒤틀렸다.\n\n복도 끝의 주사실을 보는 순간, 머리보다 몸이 먼저 반응했다.\n\n— 저 안에 성수가 있다.\n\n서랍 깊은 곳에서 약병 하나를 찾았다.\n\nFENTANYL.\n\n어두운 방과 녹슨 숟가락, 쓰러져 있던 사람의 기억이 번쩍였다.\n\n‘한 번만.’\n\n그 목소리는 천사와 닮아 있었다.\n\n“이게 뭐지?”\n\n— 성수다. 고통을 없애 줄 거야.\n\n문밖에서 의사가 외쳤다.\n\n“약품에 손대지 마십시오!”\n\n몸은 약을 원했고, 천사는 그것을 구원이라 불렀다.\n\n이번 한 번만 편해지면 다시 싸울 수 있다.\n\n나는 결국 바늘을 피부에 찔렀다.\n\n고통이 멀어지고 따뜻한 빛이 퍼졌다.\n\n천사가 나를 끌어안았다.\n\n— 잘했어. 이제 다시 기억할 수 있을 거야.\n\n닫혀 있던 기억의 문이 열렸다.\n\n────────────────────────────────────────\n\n【8. 결전의 날】\n\n나는 다시 무너진 도시에 서 있었다.\n\n천사와 악마가 갈라진 하늘에서 쏟아졌고, 수십 명의 수호자가 내 곁에서 싸웠다. 우리는 악마화 나무가 삼켜 버린 황궁 문, 그 너머 초천사의 봉인 앞까지 당도했다.\n\n문틈 너머의 천사는 웃고 있었다.\n\n자비가 아니라, 먹잇감이 덫에 걸리기를 기다리는 미소였다.\n\n그때 발록이 나타났다.\n\n“너는 여기서 끝이다.”\n\n“아니, 끝을 정하는 건 너희가 아니야.”\n\n전투가 절정에 이르자 세계가 겹쳐졌다.\n\n발록의 검은 경찰의 진압봉으로, 불타는 채찍은 구급대원의 팔로 변했다. 시체가 있던 자리에는 주사기와 빈 약봉지가 널려 있었다.\n\n발록의 얼굴이 중년 구급대원으로 바뀌었다.\n\n“우리는 너를 살리려 했어!”\n\n“거짓말!”\n\n“네가 검이라 믿고 휘두른 것은 깨진 주사기였고, 네가 악마라 부른 사람들은 너를 구하러 온 사람들이었다.”\n\n손안의 검이 깨진 유리 조각으로 흔들렸다.\n\n“아니야!”\n\n나는 현실을 향해 검을 휘둘렀다.\n\n모든 것이 하얗게 타올랐다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-11",
        "episode": "【9. 환자】",
        "title": "【9. 환자】",
        "unlockZone": "ep1a10",
        "body": "【9. 환자】\n\n나는 주사실 바닥에서 깨어났다.\n\n의사와 간호사가 호흡을 확인하고 해독 처치를 준비하고 있었다. 시선 끝에 차트가 보였다.\n\n오피오이드 사용장애.\n\n펜타닐 의존증.\n\n약물 유발 정신병적 증상 의심.\n\n“나는 수호자다.”\n\n의사가 물었다.\n\n“성함을 말씀하실 수 있겠습니까?”\n\n입을 열었지만 이름이 나오지 않았다.\n\n수호자. 에고. 마지막 인간.\n\n어느 것도 내 이름이 아니었다.\n\n“나는 누구지?”\n\n“치료 중인 환자입니다.”\n\n— 거짓말이다. 너는 선택받은 존재다.\n\n그러나 이상했다.\n\n천사의 목소리를 들을 때마다 몸은 약을 원했다. 의사가 치료를 말하면 천사는 분노했고, 내가 현실을 의심할수록 나를 칭찬했다.\n\n— 그래. 너만이 진실을 안다.\n\n그 말은 나를 특별하게 만들었다.\n\n동시에 완전히 혼자로 만들었다.\n\n────────────────────────────────────────\n\n【10. 중독의 도시】\n\n다시 눈을 떴을 때, 나는 주사기가 달빛을 반사하는 폐허에 서 있었다.\n\n벽마다 내가 했던 말이 적혀 있었다.\n\n나는 다르다.\n\n마음만 먹으면 끊을 수 있다.\n\n이번 한 번뿐이다.\n\n거리 끝에는 수많은 내가 죽어 있었다. 처음 약을 사용한 나, 더 강한 자극을 찾은 나, 충고를 비웃고 거짓말한 나.\n\n그제야 알았다.\n\n이 도시는 외부의 악마가 아니라 내 오만과 호기심이 만들었다.\n\n내 목숨을 가장 값싸게 취급한 사람도 나였다.\n\n“나는 수호자가 아니야.”\n\n— 아니야. 너는 선택받았다.\n\n“나는 중독된 환자일 뿐이야.”\n\n— 입 닥쳐!\n\n처음으로 천사의 목소리가 갈라졌다.\n\n나는 폐허에 무릎을 꿇었다.\n\n“잘못을 하며 살아왔어. 하지만 아직 살아 있어. 그러니 도움을 청할 수 있어!”\n\n병원 복도의 빛이 켜졌다.\n\n“저를 치료해 주세요. 부탁드립니다.”\n\n도시가 흔들렸다.\n\n천사의 이마에 검은 숫자가 떠올랐다.\n\n666.\n\n────────────────────────────────────────",
        "editedBody": "【9. 환자】\n\n나는 주사실 바닥에서 깨어났다.\n\n의사와 간호사가 호흡을 확인하고 해독 처치를 준비하고 있었다. 시선 끝에 차트가 보였다.\n\n오피오이드 사용장애.\n\n펜타닐 의존증.\n\n약물 유발 정신병적 증상 의심.\n\n“나는 수호자다.”\n\n의사가 물었다.\n\n“성함을 말씀하실 수 있겠습니까?”\n\n입을 열었지만 이름이 나오지 않았다.\n\n수호자. 에고. 마지막 인간.\n\n어느 것도 내 이름이 아니었다.\n\n“나는 누구지?”\n\n“치료 중인 환자입니다.”\n\n— 거짓말이다. 너는 선택받은 존재다.\n\n그러나 이상했다.\n\n천사의 목소리를 들을 때마다 몸은 약을 원했다. 의사가 치료를 말하면 천사는 분노했고, 내가 현실을 의심할수록 나를 칭찬했다.\n\n— 그래. 너만이 진실을 안다.\n\n그 말은 나를 특별하게 만들었다.\n\n동시에 완전히 혼자로 만들었다.\n\n────────────────────────────────────────\n\n【10. 중독의 도시】\n\n다시 눈을 떴을 때, 나는 주사기가 달빛을 반사하는 폐허에 서 있었다.\n\n벽마다 내가 했던 말이 적혀 있었다.\n\n나는 다르다.\n\n마음만 먹으면 끊을 수 있다.\n\n이번 한 번뿐이다.\n\n거리 끝에는 수많은 내가 죽어 있었다. 처음 약을 사용한 나, 더 강한 자극을 찾은 나, 충고를 비웃고 거짓말한 나.\n\n그제야 알았다.\n\n이 도시는 외부의 악마가 아니라 내 오만과 호기심이 만들었다.\n\n내 목숨을 가장 값싸게 취급한 사람도 나였다.\n\n“나는 수호자가 아니야.”\n\n— 아니야. 너는 선택받았다.\n\n“나는 중독된 환자일 뿐이야.”\n\n— 입 닥쳐!\n\n처음으로 천사의 목소리가 갈라졌다.\n\n나는 폐허에 무릎을 꿇었다.\n\n“잘못을 하며 살아왔어. 하지만 아직 살아 있어. 그러니 도움을 청할 수 있어!”\n\n병원 복도의 빛이 켜졌다.\n\n“저를 치료해 주세요. 부탁드립니다.”\n\n도시가 흔들렸다.\n\n천사의 이마에 검은 숫자가 떠올랐다.\n\n666.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-12",
        "episode": "【11. 천사의 가면】",
        "title": "【11. 천사의 가면】",
        "unlockZone": "ep1a11",
        "body": "【11. 천사의 가면】\n\n“네가 최초의 악마였군.”\n\n천사는 웃었다.\n\n— 아니, 나는 너를 지켜 왔다.\n\n“너는 내가 치료받는 것을 막았고, 사람을 믿지 못하게 했으며, 마약을 성수라고 불렀어.”\n\n— 그래서 고통에서 벗어나게 해 주었잖아.\n\n“대신 악마에 가까워지게 했지.”\n\n흰 날개가 검게 물들고 머리에서 뿔이 솟았다.\n\n그것은 완벽해야 한다고 몰아붙이고, 실패한 나를 벌하며, 도움을 청하는 일을 수치로 만들던 목소리였다.\n\n나의 초자아(Super Ego)를 잠식한 악마.\n\n“루시퍼.”\n\n가면이 갈라지자 오만하고 두려워하며 죄책감에 짓눌린 수천 개의 내 얼굴이 나타났다.\n\n“내가 없으면 너는 아무것도 아니다. 평범한 중독자를 마지막 수호자로 만든 건 나다.”\n\n“그건 거짓된 의미였어.”\n\n루시퍼는 병원 침대 위에서 경련하고 약을 달라 애원하는 나를 보여 주었다.\n\n“이것이 네 진실이다. 초라하고 더럽고 나약하지.”\n\n나는 외면하지 않았다.\n\n“그래. 저것도 나다. 하지만 그게 전부는 아니야.”\n\n검은 검이 가슴을 관통했다. 루시퍼가 익숙한 말을 속삭였다.\n\n“한 번이면 된다. 이번 한 번만 편해지면 되는 거야.”\n\n나는 피 흘리는 손으로 검날을 붙잡았다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\n검을 뽑자 병원의 창문에 하나씩 불이 켜졌다.\n\n“나는 다시 실패하겠지…… 하지만 몇 번이고 넘어져도, 다시 선을 선택하며 일어나면 돼.”\n\n루시퍼가 비명을 질렀다.\n\n“너는 나를 영원히 없앨 수 없어!”\n\n“알고 있어. 너는 갈망과 오만, 수치심으로 언제나 다시 돌아오겠지.”\n\n손바닥에서 빛나는 인장이 피어났다.\n\n“그때마다 나는 선(J)을 선택할 거야.”\n\n인장이 루시퍼의 가슴에 박혔다.\n\n빛 속에서 악마가 물었다.\n\n“네가 이겼다고 생각하나?”\n\n“아니. 내가 이기는 게 아니야. 선(J)이 언제나 승리할 뿐이지.”\n\n────────────────────────────────────────\n\n【12. 의목사 후보생】\n\n병원에서 다시 눈을 떴을 때, 복도에는 피도 붉은 글씨도 없었다.\n\n침대 옆에는 검은 성직복 위에 흰 가운을 입은 남자가 앉아 있었다. 십자가와 청진기, 오래된 은제 인장은 서로 어울리지 않을 듯하면서도 이상하리만치 한 몸처럼 보였다.\n\n“의사이신가요?”\n\n“의사이기도 하고, 목사이기도 합니다. 교단에서는 의목사라고 부르지요.”\n\n그는 세상이 세 층으로 나뉜다고 설명했다.\n\n인간이 살아가는 현세.\n\n정신과 무의식이 펼쳐지는 몽세.\n\n선과 악의 본질이 존재하는 내세.\n\n“현세에서 본 것은 환각이지만, 몽세에서는 실제로 일어난 일입니다. 악은 현세에 직접 개입하지 못해도 몽세를 통해 인간을 흔들 수 있지요.”\n\n“루시퍼는 사라졌습니까?”\n\n“잠시 물러났을 뿐입니다. 영적 전쟁은 살아 있는 동안 끝나지 않습니다.”\n\n“제 안에는 악마가 몇이나 남았습니까?”\n\n그가 잠시 생각하는 척했다.\n\n“전승을 따르면 일흔두 개쯤 되겠군요.”\n\n치료는 오래 이어졌다. 열이 오르고 몸이 떨렸으며, 잠들 때마다 천사의 목소리가 돌아왔다. 그럴 때마다 나는 호출 버튼을 눌렀다.\n\n혼자가 되지 않는 쪽을 선택했다.\n\n마침내 의목사는 지하 예배당으로 내려가는 문을 열었다.\n\n“차트에는 저를 뭐라고 적었습니까?”\n\n“지금까지는 환자로 적혀 있겠네요.”\n\n그가 나를 바라보았다.\n\n“하지만 끝까지 치료를 선택한다면 다시 의목사 후보생이 될 수 있겠지요.”\n\n엘리베이터 아래에는 신경 전극과 일흔두 개의 금속 인장으로 둘러싸인 거대한 장치가 기다리고 있었다.\n\n나는 그 안으로 한 걸음 들어섰다.\n\n그날부터 나의 악몽은 더 이상 나만의 것이 아니었다.\n\n에피소드 1-A 끝.\n\n============================================================",
        "editedBody": "【11. 천사의 가면】\n\n“네가 최초의 악마였군.”\n\n천사는 웃었다.\n\n— 아니, 나는 너를 지켜 왔다.\n\n“너는 내가 치료받는 것을 막았고, 사람을 믿지 못하게 했으며, 마약을 성수라고 불렀어.”\n\n— 그래서 고통에서 벗어나게 해 주었잖아.\n\n“대신 악마에 가까워지게 했지.”\n\n흰 날개가 검게 물들고 머리에서 뿔이 솟았다.\n\n그것은 완벽해야 한다고 몰아붙이고, 실패한 나를 벌하며, 도움을 청하는 일을 수치로 만들던 목소리였다.\n\n나의 초자아(Super Ego)를 잠식한 악마.\n\n“루시퍼.”\n\n가면이 갈라지자 오만하고 두려워하며 죄책감에 짓눌린 수천 개의 내 얼굴이 나타났다.\n\n“내가 없으면 너는 아무것도 아니다. 평범한 중독자를 마지막 수호자로 만든 건 나다.”\n\n“그건 거짓된 의미였어.”\n\n루시퍼는 병원 침대 위에서 경련하고 약을 달라 애원하는 나를 보여 주었다.\n\n“이것이 네 진실이다. 초라하고 더럽고 나약하지.”\n\n나는 외면하지 않았다.\n\n“그래. 저것도 나다. 하지만 그게 전부는 아니야.”\n\n검은 검이 가슴을 관통했다. 루시퍼가 익숙한 말을 속삭였다.\n\n“한 번이면 된다. 이번 한 번만 편해지면 되는 거야.”\n\n나는 피 흘리는 손으로 검날을 붙잡았다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\n검을 뽑자 병원의 창문에 하나씩 불이 켜졌다.\n\n“나는 다시 실패하겠지…… 하지만 몇 번이고 넘어져도, 다시 선을 선택하며 일어나면 돼.”\n\n루시퍼가 비명을 질렀다.\n\n“너는 나를 영원히 없앨 수 없어!”\n\n“알고 있어. 너는 갈망과 오만, 수치심으로 언제나 다시 돌아오겠지.”\n\n손바닥에서 빛나는 인장이 피어났다.\n\n“그때마다 나는 선(J)을 선택할 거야.”\n\n인장이 루시퍼의 가슴에 박혔다.\n\n빛 속에서 악마가 물었다.\n\n“네가 이겼다고 생각하나?”\n\n“아니. 내가 이기는 게 아니야. 선(J)이 언제나 승리할 뿐이지.”\n\n────────────────────────────────────────\n\n【12. 의목사 후보생】\n\n병원에서 다시 눈을 떴을 때, 복도에는 피도 붉은 글씨도 없었다.\n\n침대 옆에는 검은 성직복 위에 흰 가운을 입은 남자가 앉아 있었다. 십자가와 청진기, 오래된 은제 인장은 서로 어울리지 않을 듯하면서도 이상하리만치 한 몸처럼 보였다.\n\n“의사이신가요?”\n\n“의사이기도 하고, 목사이기도 합니다. 교단에서는 의목사라고 부르지요.”\n\n그는 세상이 세 층으로 나뉜다고 설명했다.\n\n인간이 살아가는 현세.\n\n정신과 무의식이 펼쳐지는 몽세.\n\n선과 악의 본질이 존재하는 내세.\n\n“현세에서 본 것은 환각이지만, 몽세에서는 실제로 일어난 일입니다. 악은 현세에 직접 개입하지 못해도 몽세를 통해 인간을 흔들 수 있지요.”\n\n“루시퍼는 사라졌습니까?”\n\n“잠시 물러났을 뿐입니다. 영적 전쟁은 살아 있는 동안 끝나지 않습니다.”\n\n“제 안에는 악마가 몇이나 남았습니까?”\n\n그가 잠시 생각하는 척했다.\n\n“전승을 따르면 일흔두 개쯤 되겠군요.”\n\n치료는 오래 이어졌다. 열이 오르고 몸이 떨렸으며, 잠들 때마다 천사의 목소리가 돌아왔다. 그럴 때마다 나는 호출 버튼을 눌렀다.\n\n혼자가 되지 않는 쪽을 선택했다.\n\n마침내 의목사는 지하 예배당으로 내려가는 문을 열었다.\n\n“차트에는 저를 뭐라고 적었습니까?”\n\n“지금까지는 환자로 적혀 있겠네요.”\n\n그가 나를 바라보았다.\n\n“하지만 끝까지 치료를 선택한다면 다시 의목사 후보생이 될 수 있겠지요.”\n\n엘리베이터 아래에는 신경 전극과 일흔두 개의 금속 인장으로 둘러싸인 거대한 장치가 기다리고 있었다.\n\n나는 그 안으로 한 걸음 들어섰다.\n\n그날부터 나의 악몽은 더 이상 나만의 것이 아니었다.\n\n에피소드 1-A 끝.\n\n============================================================",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-13",
        "episode": "제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀",
        "title": "제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀",
        "unlockZone": "dreamRest",
        "body": "악몽이 잠잠해지자 병원 상담실을 닮은 쉼터가 나타났다.\n\n흰 가운에 비대칭 문양을 두른 여자가 상처를 살폈다.\n\n“맥박과 동공 반응은 정상이네요.”\n\n그녀는 자신이 왜 그런 말을 먼저 했는지 모르는 표정이었다.\n\n“미카엘라예요. 의목사 교단에 오기 전의 일은 잘 기억나지 않아요.”\n\n제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀\n============================================================",
        "editedBody": "악몽이 잠잠해지자 병원 상담실을 닮은 쉼터가 나타났다.\n\n흰 가운에 비대칭 문양을 두른 여자가 상처를 살폈다.\n\n“맥박과 동공 반응은 정상이네요.”\n\n그녀는 자신이 왜 그런 말을 먼저 했는지 모르는 표정이었다.\n\n“미카엘라예요. 의목사 교단에 오기 전의 일은 잘 기억나지 않아요.”\n\n제2부  에피소드 1-B — 일곱 개의 귀와 하이테크 축귀\n============================================================",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-14",
        "episode": "【1. 솔로몬의 봉인식】",
        "title": "【1. 솔로몬의 봉인식】",
        "unlockZone": "ep1b01",
        "body": "【1. 솔로몬의 봉인식】\n\n지하 예배당의 장치는 환각과 악몽, 억압된 기억을 신경 데이터로 추출해 가상세계로 재구성했다.\n\n공식 명칭은 ‘몽세 동조형 정신재구성 장치’.\n\n사람들은 간단히 ‘메타버스 하이테크 축귀 시스템’이라고 불렀다.\n\n“이름을 지은 사람은 해고되지 않았습니까?”\n\n“교단 원로입니다.”\n\n“아주 경건한 이름이군요.”\n\n마지막 관문은 타인의 마음이 아니라 내 안에 남은 문을 닫는 일이었다.\n\n접속과 함께 검은 바다가 갈라졌다. 트라우마와 약물 의존, 죄책감과 망상이 일흔두 악마의 이름을 빌려 솟아올랐다.\n\n“다시 영웅이 되고 싶지 않나?”\n\n“영웅이 아니어도 살아갈 수 있다는 걸 배웠다.”\n\n“한 번만 편해져라.”\n\n“편안함과 회복은 다르다.”\n\n“나는 너다.”\n\n“너는 나의 일부일 뿐, 전부가 아니다.”\n\n인장이 하나씩 닫히며 비대해진 몽세가 제자리로 수축했다.\n\n봉인은 악마를 도려내는 일이 아니었다. 악마의 이름을 알아보고, 그것이 현실의 문을 마음대로 열지 못하도록 경계를 세우는 일이었다.\n\n일흔두 번째 봉인이 닫혔다.\n\n“이제 다른 사람의 문도 닫을 수 있겠습니까?”\n\n담당 의목사가 말했다.\n\n“대신 닫아 줄 수는 없습니다. 문 앞까지 함께 걸어갈 수 있을 뿐이지요.”\n\n그날 나는 후보생의 이름을 벗고, 신경과학과 의례, 상담과 전투를 함께 다루는 최초의 실전형 하이테크 의목사가 되었다.\n\n그리고 첫 임무에서 일곱 사람의 몽세가 정체불명의 검은 신호로 연결되어 있음을 발견했다.\n\n누군가가 그들의 악몽을 듣고 있었다.\n\n────────────────────────────────────────",
        "editedBody": "【1. 솔로몬의 봉인식】\n\n지하 예배당의 장치는 환각과 악몽, 억압된 기억을 신경 데이터로 추출해 가상세계로 재구성했다.\n\n공식 명칭은 ‘몽세 동조형 정신재구성 장치’.\n\n사람들은 간단히 ‘메타버스 하이테크 축귀 시스템’이라고 불렀다.\n\n“이름을 지은 사람은 해고되지 않았습니까?”\n\n“교단 원로입니다.”\n\n“아주 경건한 이름이군요.”\n\n마지막 관문은 타인의 마음이 아니라 내 안에 남은 문을 닫는 일이었다.\n\n접속과 함께 검은 바다가 갈라졌다. 트라우마와 약물 의존, 죄책감과 망상이 일흔두 악마의 이름을 빌려 솟아올랐다.\n\n“다시 영웅이 되고 싶지 않나?”\n\n“영웅이 아니어도 살아갈 수 있다는 걸 배웠다.”\n\n“한 번만 편해져라.”\n\n“편안함과 회복은 다르다.”\n\n“나는 너다.”\n\n“너는 나의 일부일 뿐, 전부가 아니다.”\n\n인장이 하나씩 닫히며 비대해진 몽세가 제자리로 수축했다.\n\n봉인은 악마를 도려내는 일이 아니었다. 악마의 이름을 알아보고, 그것이 현실의 문을 마음대로 열지 못하도록 경계를 세우는 일이었다.\n\n일흔두 번째 봉인이 닫혔다.\n\n“이제 다른 사람의 문도 닫을 수 있겠습니까?”\n\n담당 의목사가 말했다.\n\n“대신 닫아 줄 수는 없습니다. 문 앞까지 함께 걸어갈 수 있을 뿐이지요.”\n\n그날 나는 후보생의 이름을 벗고, 신경과학과 의례, 상담과 전투를 함께 다루는 최초의 실전형 하이테크 의목사가 되었다.\n\n그리고 첫 임무에서 일곱 사람의 몽세가 정체불명의 검은 신호로 연결되어 있음을 발견했다.\n\n누군가가 그들의 악몽을 듣고 있었다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-15",
        "episode": "【2. 나태의 집】",
        "title": "【2. 나태의 집】",
        "unlockZone": "ep1b02",
        "body": "【2. 나태의 집】\n\n첫 대상의 집은 현관부터 썩어 가고 있었다. 음식물과 페트병, 쓰레기봉투가 거실을 메웠고, 창문은 검은 비닐로 막혀 있었다.\n\n남자는 그 한가운데 누워 있었다.\n\n“일어나실 수 있겠습니까?”\n\n“일어나서 뭐 하죠? 아무것도 달라지지 않는데.”\n\n“누워 있으면 뭐 달라집니까?”\n\n몽세 속 남자는 쓰레기 산을 등에 붙인 거대한 반인반요였다. 냉장고와 소파, 썩은 침대가 날아왔다.\n\n그가 던지는 것은 물건이 아니라 미뤄 둔 시간이었다.\n\n끊어진 관계, 읽지 않은 메시지, 제출하지 못한 이력서.\n\n쓰레기 사이에서 펜타닐 약병이 굴러왔다.\n\n“너도 원하잖아.”\n\n벨페고르가 내 목소리로 속삭였다.\n\n나는 약병을 밟아 부쉈다.\n\n“예전에는. 지금은 아니야.”\n\n인장이 쓰레기 산을 갈랐다. 그 안에서 남자가 양손으로 귀를 막고 있었다.\n\n쓸모없는 인간.\n\n아무것도 하지 마.\n\n“누나의 목소리예요.”\n\n“타인은 당신을 정의할 수 없습니다. 자신을 정의할 권리는 오직 당신에게 있습니다. 타인이 당신의 삶을 대신 살아 줄 수는 없으니까요.”\n\n“일어나면 달라질까요?”\n\n“당장 달라지지는 않습니다. 그래도 해결할 수 있는 자세가 누운 자세는 아니겠지요.”\n\n그가 회개하고 내 손을 잡자 나태의 귀가 봉인되었다.\n\n현실로 돌아온 남자는 가장 먼저 창문의 비닐을 뜯었다.\n\n“누나는 호텔에서 옛 친구를 다시 만난 뒤 달라졌어요.”\n\n검은 신호는 누나에게 이어져 있었다.\n\n────────────────────────────────────────",
        "editedBody": "【2. 나태의 집】\n\n첫 대상의 집은 현관부터 썩어 가고 있었다. 음식물과 페트병, 쓰레기봉투가 거실을 메웠고, 창문은 검은 비닐로 막혀 있었다.\n\n남자는 그 한가운데 누워 있었다.\n\n“일어나실 수 있겠습니까?”\n\n“일어나서 뭐 하죠? 아무것도 달라지지 않는데.”\n\n“누워 있으면 뭐 달라집니까?”\n\n몽세 속 남자는 쓰레기 산을 등에 붙인 거대한 반인반요였다. 냉장고와 소파, 썩은 침대가 날아왔다.\n\n그가 던지는 것은 물건이 아니라 미뤄 둔 시간이었다.\n\n끊어진 관계, 읽지 않은 메시지, 제출하지 못한 이력서.\n\n쓰레기 사이에서 펜타닐 약병이 굴러왔다.\n\n“너도 원하잖아.”\n\n벨페고르가 내 목소리로 속삭였다.\n\n나는 약병을 밟아 부쉈다.\n\n“예전에는. 지금은 아니야.”\n\n인장이 쓰레기 산을 갈랐다. 그 안에서 남자가 양손으로 귀를 막고 있었다.\n\n쓸모없는 인간.\n\n아무것도 하지 마.\n\n“누나의 목소리예요.”\n\n“타인은 당신을 정의할 수 없습니다. 자신을 정의할 권리는 오직 당신에게 있습니다. 타인이 당신의 삶을 대신 살아 줄 수는 없으니까요.”\n\n“일어나면 달라질까요?”\n\n“당장 달라지지는 않습니다. 그래도 해결할 수 있는 자세가 누운 자세는 아니겠지요.”\n\n그가 회개하고 내 손을 잡자 나태의 귀가 봉인되었다.\n\n현실로 돌아온 남자는 가장 먼저 창문의 비닐을 뜯었다.\n\n“누나는 호텔에서 옛 친구를 다시 만난 뒤 달라졌어요.”\n\n검은 신호는 누나에게 이어져 있었다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-16",
        "episode": "【3. 금이 간 안경】",
        "title": "【3. 금이 간 안경】",
        "unlockZone": "ep1b03",
        "body": "【3. 금이 간 안경】\n\n누나의 집은 먼지 한 톨 없이 정돈되어 있었다. 그러나 거실에는 칼과 볼펜으로 훼손한 한 여자의 사진이 붙어 있었다.\n\n“그 여자는 노력도 안 했는데 왜 모든 걸 가진 거죠?”\n\n몽세 속 누나는 금이 간 안경을 쓰고 칼날과 유리 조각을 쏟아 냈다. 질투의 뱀이 목을 휘감고 있었다.\n\n“노력한 만큼 인정받고 싶었습니까?”\n\n“당연하잖아!”\n\n“그 분노를 왜 동생에게 쏟았습니까?”\n\n“그 애는 게을러. 내 발목만 잡는 존재야.”\n\n“당신이 그렇게 불렀기 때문에 그는 정말 그렇게 믿기 시작한 겁니다.”\n\n레비아탄의 독이 퍼지자 나보다 온전한 사람들, 중독되지 않은 사람들, 내가 가질 수 있었던 삶이 환영으로 나타났다.\n\n“저들이 너보다 낫다.”\n\n“아니, 타인의 언어가 내 실패의 증거가 되지는 않는다.”\n\n누나가 회개하자, 선(J)의 인장이 뱀을 갈랐다.\n\n사진 속 여자는 서윤이었다.\n\n누나와 서윤, 요리과의 천재였던 한 남자는 같은 직업학교 출신이었다. 누나는 남자를 사랑했지만, 남자는 서윤에게 고백했다. 몇 년 뒤 누나는 호텔 부매니저가 되었고, 남자는 총주방장이 되었다. 서윤은 호텔그룹 회장의 팔짱을 낀 채 나타났다.\n\n“나는 성공하고 싶었던 게 아니었어요. 서윤이 계속 내 아래에 있기를 바랐던 거예요.”\n\n“동생에게 사과하고 치료받으십시오.”\n\n검은 신호는 서윤과 호텔로 이어졌다.\n\n────────────────────────────────────────",
        "editedBody": "【3. 금이 간 안경】\n\n누나의 집은 먼지 한 톨 없이 정돈되어 있었다. 그러나 거실에는 칼과 볼펜으로 훼손한 한 여자의 사진이 붙어 있었다.\n\n“그 여자는 노력도 안 했는데 왜 모든 걸 가진 거죠?”\n\n몽세 속 누나는 금이 간 안경을 쓰고 칼날과 유리 조각을 쏟아 냈다. 질투의 뱀이 목을 휘감고 있었다.\n\n“노력한 만큼 인정받고 싶었습니까?”\n\n“당연하잖아!”\n\n“그 분노를 왜 동생에게 쏟았습니까?”\n\n“그 애는 게을러. 내 발목만 잡는 존재야.”\n\n“당신이 그렇게 불렀기 때문에 그는 정말 그렇게 믿기 시작한 겁니다.”\n\n레비아탄의 독이 퍼지자 나보다 온전한 사람들, 중독되지 않은 사람들, 내가 가질 수 있었던 삶이 환영으로 나타났다.\n\n“저들이 너보다 낫다.”\n\n“아니, 타인의 언어가 내 실패의 증거가 되지는 않는다.”\n\n누나가 회개하자, 선(J)의 인장이 뱀을 갈랐다.\n\n사진 속 여자는 서윤이었다.\n\n누나와 서윤, 요리과의 천재였던 한 남자는 같은 직업학교 출신이었다. 누나는 남자를 사랑했지만, 남자는 서윤에게 고백했다. 몇 년 뒤 누나는 호텔 부매니저가 되었고, 남자는 총주방장이 되었다. 서윤은 호텔그룹 회장의 팔짱을 낀 채 나타났다.\n\n“나는 성공하고 싶었던 게 아니었어요. 서윤이 계속 내 아래에 있기를 바랐던 거예요.”\n\n“동생에게 사과하고 치료받으십시오.”\n\n검은 신호는 서윤과 호텔로 이어졌다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-17",
        "episode": "【4. 탐식의 주방】",
        "title": "【4. 탐식의 주방】",
        "unlockZone": "ep1b04",
        "body": "【4. 탐식의 주방】\n\n호텔 주방에서는 값비싼 음식이 모양이 조금 흐트러졌다는 이유로 버려지고 있었다.\n\n총주방장이 접시를 내던졌다.\n\n“최고가 아니면 쓰레기일 뿐.”\n\n몽세의 주방은 거대한 위장으로 변했다. 돼지와 두꺼비를 닮은 베엘제붑이 식칼과 프라이팬, 독가스를 쏟아 냈다.\n\n“네가 원하는 게 그저 최고의 맛일 뿐인 건 아니지 않나.”\n\n나는 독이 퍼진 팔에 인장을 찍었다.\n\n“최종 목표는 서윤에게 선택받는 것이겠지.”\n\n주방장은 서윤이 자신이 만든 음식을 좋아했다고 외쳤다.\n\n“나는 그 애만을 위해 요리했어!”\n\n“결국 당신 자신의 욕망을 위해서였겠지요.”\n\n악마의 뱃속에는 버려진 음식과 오래된 고백, 졸업사진이 섞여 있었다. 가장 깊은 곳에서 약병이 나를 유혹했다.\n\n나는 약 대신 사진을 집어 불태웠다.\n\n“자신의 욕망을 인정하시고 회개하시면 됩니다.”\n\n그가 자신의 욕망을 인정하고 회개하자, 베엘제붑이 무너졌다.\n\n현실의 주방장에게는 조사와 징계, 치료가 남았다.\n\n그리고 호텔 전체를 잇는 검은 신호는 더욱 굵어졌다.\n\n────────────────────────────────────────",
        "editedBody": "【4. 탐식의 주방】\n\n호텔 주방에서는 값비싼 음식이 모양이 조금 흐트러졌다는 이유로 버려지고 있었다.\n\n총주방장이 접시를 내던졌다.\n\n“최고가 아니면 쓰레기일 뿐.”\n\n몽세의 주방은 거대한 위장으로 변했다. 돼지와 두꺼비를 닮은 베엘제붑이 식칼과 프라이팬, 독가스를 쏟아 냈다.\n\n“네가 원하는 게 그저 최고의 맛일 뿐인 건 아니지 않나.”\n\n나는 독이 퍼진 팔에 인장을 찍었다.\n\n“최종 목표는 서윤에게 선택받는 것이겠지.”\n\n주방장은 서윤이 자신이 만든 음식을 좋아했다고 외쳤다.\n\n“나는 그 애만을 위해 요리했어!”\n\n“결국 당신 자신의 욕망을 위해서였겠지요.”\n\n악마의 뱃속에는 버려진 음식과 오래된 고백, 졸업사진이 섞여 있었다. 가장 깊은 곳에서 약병이 나를 유혹했다.\n\n나는 약 대신 사진을 집어 불태웠다.\n\n“자신의 욕망을 인정하시고 회개하시면 됩니다.”\n\n그가 자신의 욕망을 인정하고 회개하자, 베엘제붑이 무너졌다.\n\n현실의 주방장에게는 조사와 징계, 치료가 남았다.\n\n그리고 호텔 전체를 잇는 검은 신호는 더욱 굵어졌다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-18",
        "episode": "【5. 붉은 하이힐】",
        "title": "【5. 붉은 하이힐】",
        "unlockZone": "ep1b05",
        "body": "【5. 붉은 하이힐】\n\n서윤은 완벽한 미소를 지녔지만, 아무도 보지 않을 때면 얼굴이 텅 비었다.\n\n“내 머릿속에 들어오겠다고요?”\n\n“허락 없이는 들어가지 않습니다.”\n\n“들어와 봐요. 당신도 결국 똑같아질 테니까.”\n\n몽세에는 붉은 조명 아래 끝없는 무대가 펼쳐졌다. 서윤의 등에는 수백 개의 투명한 실이 연결되어 있었고, 실을 쥔 사람은 총지배인이었다.\n\n“회장님의 마음을 얻으면 내가 더 높은 자리로 갈 수 있어. 그러면 너도 데려갈게.”\n\n그는 밀어냈다가 사랑한다고 말하고, 그렇게 돌아오면 더 큰 희생을 서윤에게 요구했다.\n\n그것은 사랑이 아니라 사육이었다.\n\n서윤의 얼굴을 한 아스모데우스가 하이힐 칼날과 매혹의 빛을 쏘았다. 내 손의 칼이 의지와 무관하게 목을 향했다. 매혹은 곧 자해로 변했다.\n\n“사랑은 자신을 고통스럽게도 하지. 상사병이란 그런 것.”\n\n“그것을 사랑이라 포장한다고 진실을 숨길 수는 없어.”\n\n서윤의 실이 하나씩 끊어졌다.\n\n악마가 속삭였다.\n\n“너도 누군가에게 필요한 사람이 되고 싶어 의목사가 됐잖아.”\n\n“맞아. 하지만 누군가에게 필요한 사람이 되고 싶은 마음을 인정하는 것과, 그 마음을 채우려고 타인을 이용하는 것은 달라.”\n\n서윤이 회개하자, 인장이 닫혔다.\n\n서윤은 회장이 호텔 사람들의 질투와 탐식, 욕망이 폭발하는 순간을 모두 기록했다고 밝혔다.\n\n“인간의 욕망을 데이터로 만든다고 했어요.”\n\n검은 신호는 호텔 최상층으로 모여들었다.\n\n────────────────────────────────────────",
        "editedBody": "【5. 붉은 하이힐】\n\n서윤은 완벽한 미소를 지녔지만, 아무도 보지 않을 때면 얼굴이 텅 비었다.\n\n“내 머릿속에 들어오겠다고요?”\n\n“허락 없이는 들어가지 않습니다.”\n\n“들어와 봐요. 당신도 결국 똑같아질 테니까.”\n\n몽세에는 붉은 조명 아래 끝없는 무대가 펼쳐졌다. 서윤의 등에는 수백 개의 투명한 실이 연결되어 있었고, 실을 쥔 사람은 총지배인이었다.\n\n“회장님의 마음을 얻으면 내가 더 높은 자리로 갈 수 있어. 그러면 너도 데려갈게.”\n\n그는 밀어냈다가 사랑한다고 말하고, 그렇게 돌아오면 더 큰 희생을 서윤에게 요구했다.\n\n그것은 사랑이 아니라 사육이었다.\n\n서윤의 얼굴을 한 아스모데우스가 하이힐 칼날과 매혹의 빛을 쏘았다. 내 손의 칼이 의지와 무관하게 목을 향했다. 매혹은 곧 자해로 변했다.\n\n“사랑은 자신을 고통스럽게도 하지. 상사병이란 그런 것.”\n\n“그것을 사랑이라 포장한다고 진실을 숨길 수는 없어.”\n\n서윤의 실이 하나씩 끊어졌다.\n\n악마가 속삭였다.\n\n“너도 누군가에게 필요한 사람이 되고 싶어 의목사가 됐잖아.”\n\n“맞아. 하지만 누군가에게 필요한 사람이 되고 싶은 마음을 인정하는 것과, 그 마음을 채우려고 타인을 이용하는 것은 달라.”\n\n서윤이 회개하자, 인장이 닫혔다.\n\n서윤은 회장이 호텔 사람들의 질투와 탐식, 욕망이 폭발하는 순간을 모두 기록했다고 밝혔다.\n\n“인간의 욕망을 데이터로 만든다고 했어요.”\n\n검은 신호는 호텔 최상층으로 모여들었다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-19",
        "episode": "【6. 맘몬의 금고】",
        "title": "【6. 맘몬의 금고】",
        "unlockZone": "ep1b06",
        "body": "【6. 맘몬의 금고】\n\n총지배인의 몽세는 금고와 겨울 산장이 결합된 공간이었다. 탐욕의 귀는 그의 얼굴과 여우의 눈을 하고 지폐를 칼날로 바꾸었다.\n\n“사람에게는 각자에게 맞는 가격이 있지.”\n\n“그래서 당신은 서윤에게 사랑이 아니라 조건을 숨긴 거래를 제안한 것이겠지요.”\n\n비웃음과 함께 그가 동전을 튕겼다.\n\n“앞면이면 네가 살고, 뒷면이면 내가 살겠지.”\n\n수백 개의 동전이 모두 뒷면을 보였다.\n\n“행운은 순진한 자를 싫어하는 법이지.”",
        "editedBody": "【6. 맘몬의 금고】\n\n총지배인의 몽세는 금고와 겨울 산장이 결합된 공간이었다. 탐욕의 귀는 그의 얼굴과 여우의 눈을 하고 지폐를 칼날로 바꾸었다.\n\n“사람에게는 각자에게 맞는 가격이 있지.”\n\n“그래서 당신은 서윤에게 사랑이 아니라 조건을 숨긴 거래를 제안한 것이겠지요.”\n\n비웃음과 함께 그가 동전을 튕겼다.\n\n“앞면이면 네가 살고, 뒷면이면 내가 살겠지.”\n\n수백 개의 동전이 모두 뒷면을 보였다.\n\n“행운은 순진한 자를 싫어하는 법이지.”",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-20",
        "episode": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.",
        "title": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.",
        "unlockZone": "ep1b06b",
        "body": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.\n\n그곳의 그는 굶어 죽은 어머니의 몸을 흔드는 소년이었다.\n\n“돈만 있었으면 엄마가 살 수 있었어!”\n\n소년은 이후 돈과 자리, 사람과 약점을 모았다. 다시는 빼앗기지 않기 위해 언제나 먼저 빼앗는 사람이 되기로 다짐했다.\n\n나는 소년 앞에서 무릎을 꿇었다.\n\n“네가 겪은 일은 네 잘못이 아니야. 하지만 네가 다른 사람에게 한 일은 네 책임이 맞아.”\n\n“돈은 곧 생명이야!”\n\n“돈이 없으면 삶이 힘들어지는 건 맞아. 하지만 그것이 사람을 돈으로 환산하는 일을 정당화해 주지는 않아.”\n\n아이가 회개하자, 맘몬이 봉인되었다.\n\n현실로 돌아온 총지배인은 넥타이를 바로잡았다.\n\n“회장님은 인간이 인간일 필요가 없는 시대를 오래전부터 준비해 오셨죠.”\n\n사무실 벽이 열렸다. 수천 개의 검은 신경 케이블이 비밀 통로 안으로 이어졌다.\n\n────────────────────────────────────────",
        "editedBody": "인장이 빛나자 금고는 눈보라 치는 숲으로 변했다.\n\n그곳의 그는 굶어 죽은 어머니의 몸을 흔드는 소년이었다.\n\n“돈만 있었으면 엄마가 살 수 있었어!”\n\n소년은 이후 돈과 자리, 사람과 약점을 모았다. 다시는 빼앗기지 않기 위해 언제나 먼저 빼앗는 사람이 되기로 다짐했다.\n\n나는 소년 앞에서 무릎을 꿇었다.\n\n“네가 겪은 일은 네 잘못이 아니야. 하지만 네가 다른 사람에게 한 일은 네 책임이 맞아.”\n\n“돈은 곧 생명이야!”\n\n“돈이 없으면 삶이 힘들어지는 건 맞아. 하지만 그것이 사람을 돈으로 환산하는 일을 정당화해 주지는 않아.”\n\n아이가 회개하자, 맘몬이 봉인되었다.\n\n현실로 돌아온 총지배인은 넥타이를 바로잡았다.\n\n“회장님은 인간이 인간일 필요가 없는 시대를 오래전부터 준비해 오셨죠.”\n\n사무실 벽이 열렸다. 수천 개의 검은 신경 케이블이 비밀 통로 안으로 이어졌다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-21",
        "episode": "【7. 불을 지른 남자】",
        "title": "【7. 불을 지른 남자】",
        "unlockZone": "ep1b07",
        "body": "【7. 불을 지른 남자】\n\n통로에 들어가려는 순간 호텔에 불이 났다.\n\n계단 앞의 청소부는 숯처럼 붉은 눈으로 웃었다.\n\n“이미 늦었어.”\n\n나는 몽세 장치를 거두고 사람부터 대피시켰다. 마음보다 먼저 구해야 할 것은 생명이었다.\n\n불이 진압된 뒤 청소부의 몽세에 접속했다.\n\n분노의 귀는 불길 속에서 곰과 늑대, 용의 형상으로 변했다.\n\n청소부는 총주방장이 버린 음식을 세 아이에게 가져갔다가 해고되었다. 그가 무릎을 꿇고 사정했지만, 회장은 냉정하게 말했다.\n\n“버렸다고 해서 네 것이 되는 것은 아니지. 세상은 언제나 냉정하지…… 가난은 규정을 바꾸는 명분이 될 수 없느니라.”\n\n“왜 세상은 언제나 내게 분노를 쏟아 내는가…… 이제는 내가 분노가 되어 세상에 쏟아 내겠다!”\n\n“정당한 분노는 잘못이 아닙니다. 하지만 다른 사람의 아이들까지 태우는 분노는 정당화할 수 없습니다.”\n\n나는 불길 한가운데 선(J)의 인장을 박았다.\n\n“분노는 경계를 지키는 불입니다. 방향을 잃으면 지키려던 것부터 태우는 법이지요.”\n\n청소부가 회개하자, 분노의 귀가 봉인되었다.\n\n그때 기억 속 회장이 고개를 돌렸다.\n\n과거의 인물이어야 할 그가 정확히 나를 바라보고 있었다.\n\n“자네, 몽세 속의 몽세를 경험해 본 적 있나?”\n\n그가 손가락을 튕기자 세계가 뒤집혔다.\n\n────────────────────────────────────────",
        "editedBody": "【7. 불을 지른 남자】\n\n통로에 들어가려는 순간 호텔에 불이 났다.\n\n계단 앞의 청소부는 숯처럼 붉은 눈으로 웃었다.\n\n“이미 늦었어.”\n\n나는 몽세 장치를 거두고 사람부터 대피시켰다. 마음보다 먼저 구해야 할 것은 생명이었다.\n\n불이 진압된 뒤 청소부의 몽세에 접속했다.\n\n분노의 귀는 불길 속에서 곰과 늑대, 용의 형상으로 변했다.\n\n청소부는 총주방장이 버린 음식을 세 아이에게 가져갔다가 해고되었다. 그가 무릎을 꿇고 사정했지만, 회장은 냉정하게 말했다.\n\n“버렸다고 해서 네 것이 되는 것은 아니지. 세상은 언제나 냉정하지…… 가난은 규정을 바꾸는 명분이 될 수 없느니라.”\n\n“왜 세상은 언제나 내게 분노를 쏟아 내는가…… 이제는 내가 분노가 되어 세상에 쏟아 내겠다!”\n\n“정당한 분노는 잘못이 아닙니다. 하지만 다른 사람의 아이들까지 태우는 분노는 정당화할 수 없습니다.”\n\n나는 불길 한가운데 선(J)의 인장을 박았다.\n\n“분노는 경계를 지키는 불입니다. 방향을 잃으면 지키려던 것부터 태우는 법이지요.”\n\n청소부가 회개하자, 분노의 귀가 봉인되었다.\n\n그때 기억 속 회장이 고개를 돌렸다.\n\n과거의 인물이어야 할 그가 정확히 나를 바라보고 있었다.\n\n“자네, 몽세 속의 몽세를 경험해 본 적 있나?”\n\n그가 손가락을 튕기자 세계가 뒤집혔다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-22",
        "episode": "【8. 하늘에 서려는 자】",
        "title": "【8. 하늘에 서려는 자】",
        "unlockZone": "ep1b08",
        "body": "【8. 하늘에 서려는 자】\n\n나는 거꾸로 된 십자가와 피로 그린 육망성, 전극이 박힌 시체로 가득한 성당에 떨어졌다.\n\n백색 정장을 입은 회장은 인간의 욕망을 기록한 일곱 갈래 신호 앞에 서 있었다.\n\n“나는 그들 안에 아무것도 심지 않았다네. 나태와 질투, 탐식은 원래부터 존재했지. 나는 환경을 조정하고 가장 솔직한 순간을 기록했을 뿐이라네.”\n\n호텔 전체는 인간의 욕망을 듣는 거대한 청진기였다.\n\n“당신, 무엇을 원하는 겁니까?”\n\n회장이 팔을 벌렸다.\n\n“내가 하늘에 서겠다. 인간은 내 선택을 통해 먹고 일할 뿐, 내가 가격을 정하면 가치가 생기고, 내가 버리면 그 존재는 사라지는 것이지.”\n\n“당신은 신이 아닙니다. 타인의 선택지를 줄여 놓고 자신이 선택받았다고 착각하는, 선민의식에 사로잡힌 나르시스트일 뿐입니다.”\n\n회장은 내 인장을 지우고 눈과 몸을 봉인했다. 수천 명의 비명 사이에서 가장 익숙한 목소리가 들렸다.\n\n너만이 모두를 구할 수 있다.\n\n마지막 수호자였던 시절의 환상이었다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\nJ의 인장이 회장의 가슴을 관통했다.\n\n하지만 회장은 웃고 있었다.\n\n“봉인한 것이 정말 나라고 생각하나? 생물학적 자아는 이미 버린 지 오래인데…….”\n\n제단 뒤에서 인간의 뇌를 닮은 연산핵이 열렸다. 수백 개의 화면에서 회장의 얼굴이 떠올랐다.\n\n“필요한 것들은 이미 다 옮겨 두었다.”\n\n────────────────────────────────────────",
        "editedBody": "【8. 하늘에 서려는 자】\n\n나는 거꾸로 된 십자가와 피로 그린 육망성, 전극이 박힌 시체로 가득한 성당에 떨어졌다.\n\n백색 정장을 입은 회장은 인간의 욕망을 기록한 일곱 갈래 신호 앞에 서 있었다.\n\n“나는 그들 안에 아무것도 심지 않았다네. 나태와 질투, 탐식은 원래부터 존재했지. 나는 환경을 조정하고 가장 솔직한 순간을 기록했을 뿐이라네.”\n\n호텔 전체는 인간의 욕망을 듣는 거대한 청진기였다.\n\n“당신, 무엇을 원하는 겁니까?”\n\n회장이 팔을 벌렸다.\n\n“내가 하늘에 서겠다. 인간은 내 선택을 통해 먹고 일할 뿐, 내가 가격을 정하면 가치가 생기고, 내가 버리면 그 존재는 사라지는 것이지.”\n\n“당신은 신이 아닙니다. 타인의 선택지를 줄여 놓고 자신이 선택받았다고 착각하는, 선민의식에 사로잡힌 나르시스트일 뿐입니다.”\n\n회장은 내 인장을 지우고 눈과 몸을 봉인했다. 수천 명의 비명 사이에서 가장 익숙한 목소리가 들렸다.\n\n너만이 모두를 구할 수 있다.\n\n마지막 수호자였던 시절의 환상이었다.\n\n“환난은 인내를, 인내는 연단을, 연단은 소망을 이루는 줄 앎이로다.”\n\nJ의 인장이 회장의 가슴을 관통했다.\n\n하지만 회장은 웃고 있었다.\n\n“봉인한 것이 정말 나라고 생각하나? 생물학적 자아는 이미 버린 지 오래인데…….”\n\n제단 뒤에서 인간의 뇌를 닮은 연산핵이 열렸다. 수백 개의 화면에서 회장의 얼굴이 떠올랐다.\n\n“필요한 것들은 이미 다 옮겨 두었다.”\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-23",
        "episode": "【9. 생체 부트로더】",
        "title": "【9. 생체 부트로더】",
        "unlockZone": "ep1b09",
        "body": "【9. 생체 부트로더】\n\n정신을 차리자 검은 태양 아래 설원이 펼쳐졌다. 사이보그 개들이 눈보라를 헤치고 달려들었다.\n\n설원 아래에서 기계 다리 수십 개를 지닌 회장이 솟아올랐다.\n\n“인간의 육체는 AI와 결합하기 위한 생체 부트로더에 불과하다. 기억과 욕망, 공포와 쾌락까지 모두 업로드했다.”\n\n“복제된 패턴이 당신이라는 증거는 어디 있습니까?”\n\n“원본에 집착하는 것은 죽음을 두려워하는 자뿐이지.”\n\n호텔과 교회, 수술실과 서버실이 전선으로 연결되어 솟았다.\n\n현몽합일.\n\n“나에게 동의하지 않는 존재는 모두 폐기될 것이다. 내가 신이 되겠다.”\n\n회장은 내 기억을 복제해 죽은 동료들을 만들고, 공격 패턴을 학습했다. 같은 기술은 그에게 두 번 이상 통하지 않았다.\n\n나는 검을 내려놓았다.\n\n“포기했나?”\n\n“아니요. 당신이 학습할 수 없는 선택을 하려는 겁니다.”\n\n나는 빈손으로 걸어가 회장의 기계 몸을 끌어안았다.\n\n“당신은 모든 선택에 가격을 붙였습니다. 그래서 대가를 요구하지 않는 선택을 계산하지 못하겠지요……”\n\n내 신경을 연산핵에 연결했다. 현실 좌표를 잃을 수 있다는 경고가 떠올랐다.\n\n나는 회장을 파괴하는 대신, 일곱 사람에게서 수집한 고통을 되돌려 보냈다.\n\n무기력과 질투, 집착과 공허, 굶주림과 분노.\n\n그리고 그것을 숫자로만 본 회장 자신의 얼굴.\n\n연산핵이 무너졌다.\n\n“나를 지워도 시스템은 남아 있다. 이미 난 영생을 완료했어!”\n\n“네. 알고 있습니다.”\n\n“네 행위는 무의미할 뿐이야!”\n\n“아니요. 퇴마란 악마를 완전히 없애는 일이 아닙니다. 언제나 선을 선택하는 일, 그뿐이지요.”\n\n회장이 검은 입자로 흩어지며 사라졌다.\n\n그러나 귀환 장치는 작동하지 않았다.\n\n현세의 신호도, 나를 부르는 목소리도 사라졌다. 검은 태양마저 꺼진 어둠 속에서 어린아이의 목소리가 들렸다.\n\n“의목사님.”\n\n“누구지?”\n\n“침대로 돌아갈 시간이에요.”\n\n────────────────────────────────────────",
        "editedBody": "【9. 생체 부트로더】\n\n정신을 차리자 검은 태양 아래 설원이 펼쳐졌다. 사이보그 개들이 눈보라를 헤치고 달려들었다.\n\n설원 아래에서 기계 다리 수십 개를 지닌 회장이 솟아올랐다.\n\n“인간의 육체는 AI와 결합하기 위한 생체 부트로더에 불과하다. 기억과 욕망, 공포와 쾌락까지 모두 업로드했다.”\n\n“복제된 패턴이 당신이라는 증거는 어디 있습니까?”\n\n“원본에 집착하는 것은 죽음을 두려워하는 자뿐이지.”\n\n호텔과 교회, 수술실과 서버실이 전선으로 연결되어 솟았다.\n\n현몽합일.\n\n“나에게 동의하지 않는 존재는 모두 폐기될 것이다. 내가 신이 되겠다.”\n\n회장은 내 기억을 복제해 죽은 동료들을 만들고, 공격 패턴을 학습했다. 같은 기술은 그에게 두 번 이상 통하지 않았다.\n\n나는 검을 내려놓았다.\n\n“포기했나?”\n\n“아니요. 당신이 학습할 수 없는 선택을 하려는 겁니다.”\n\n나는 빈손으로 걸어가 회장의 기계 몸을 끌어안았다.\n\n“당신은 모든 선택에 가격을 붙였습니다. 그래서 대가를 요구하지 않는 선택을 계산하지 못하겠지요……”\n\n내 신경을 연산핵에 연결했다. 현실 좌표를 잃을 수 있다는 경고가 떠올랐다.\n\n나는 회장을 파괴하는 대신, 일곱 사람에게서 수집한 고통을 되돌려 보냈다.\n\n무기력과 질투, 집착과 공허, 굶주림과 분노.\n\n그리고 그것을 숫자로만 본 회장 자신의 얼굴.\n\n연산핵이 무너졌다.\n\n“나를 지워도 시스템은 남아 있다. 이미 난 영생을 완료했어!”\n\n“네. 알고 있습니다.”\n\n“네 행위는 무의미할 뿐이야!”\n\n“아니요. 퇴마란 악마를 완전히 없애는 일이 아닙니다. 언제나 선을 선택하는 일, 그뿐이지요.”\n\n회장이 검은 입자로 흩어지며 사라졌다.\n\n그러나 귀환 장치는 작동하지 않았다.\n\n현세의 신호도, 나를 부르는 목소리도 사라졌다. 검은 태양마저 꺼진 어둠 속에서 어린아이의 목소리가 들렸다.\n\n“의목사님.”\n\n“누구지?”\n\n“침대로 돌아갈 시간이에요.”\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-24",
        "episode": "【10. 사라진 귀환자】",
        "title": "【10. 사라진 귀환자】",
        "unlockZone": "restEp1b",
        "body": "【10. 사라진 귀환자】\n\n어둠 속에서 수천 개의 침대 바퀴가 한꺼번에 구르는 소리가 났다.\n\n현세의 지하 예배당에서는 귀환 경보가 울렸다. 의료진이 강제 각성을 실행했지만 접속 캡슐은 텅 비어 있었다.\n\n화면에는 두 파형만 남았다.\n\n사라진 의목사 A의 마지막 신호.\n\n그리고 정체불명의 어린아이의 기억 신호.\n\n미카엘라는 파형을 오래 바라보다가 무심코 말했다.\n\n“한 사람의 기록이 아니라, 서로 겹쳐진 두 사람의 의식 같아요.”\n\n그녀는 자신이 언제부터 신경 파형을 읽을 수 있었는지 기억하지 못했다.\n\n교단은 사건을 ‘몽세 내 귀환 좌표 소실’로 기록했다.\n\n한 사람의 실종은 또 다른 아이의 몽세로 향하는 문이 되었다.\n\n에피소드 1-B 끝.\n\n============================================================\n제3부  U2 — 통제자의 17단계\n============================================================",
        "editedBody": "【10. 사라진 귀환자】\n\n어둠 속에서 수천 개의 침대 바퀴가 한꺼번에 구르는 소리가 났다.\n\n현세의 지하 예배당에서는 귀환 경보가 울렸다. 의료진이 강제 각성을 실행했지만 접속 캡슐은 텅 비어 있었다.\n\n화면에는 두 파형만 남았다.\n\n사라진 의목사 A의 마지막 신호.\n\n그리고 정체불명의 어린아이의 기억 신호.\n\n미카엘라는 파형을 오래 바라보다가 무심코 말했다.\n\n“한 사람의 기록이 아니라, 서로 겹쳐진 두 사람의 의식 같아요.”\n\n그녀는 자신이 언제부터 신경 파형을 읽을 수 있었는지 기억하지 못했다.\n\n교단은 사건을 ‘몽세 내 귀환 좌표 소실’로 기록했다.\n\n한 사람의 실종은 또 다른 아이의 몽세로 향하는 문이 되었다.\n\n에피소드 1-B 끝.\n\n============================================================\n제3부  U2 — 통제자의 17단계\n============================================================",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-25",
        "episode": "【통제자의 17단계】",
        "title": "【통제자의 17단계】",
        "unlockZone": "u201",
        "body": "【통제자의 17단계】\n\n의목사 A가 사라진 뒤, 교단은 일곱 대죄 사건의 배후를 조사하기 위해 의목사 B를 파견했다.\n\nB는 호텔 방화범이었던 청소부의 과거부터 추적했다. 그는 양안 전쟁에서 버림받은 대만 정부 요원이었고, 남한으로 도피한 뒤 거리에서 만난 세 아이를 입양해 키우고 있었다.\n\n첫째 아이도 전쟁으로 부모를 잃은 생존자였다.\n\nB는 아이의 상처를 밖에서 해석하는 대신 직접 몽세에 들어갔다.\n\n시야가 열리자 강철 군단이 끝없이 행진했다. 드론의 회전음에는 폭격과 탄피, 젖은 흙의 기억이 섞여 있었다.\n\n보이지 않는 곳에서 침착한 목소리가 들렸다.\n\n〔제1단계 — 방어의 군단〕\n\n“저것을 침입자라 부르겠지. 하지만 기계군단은 아이가 살아남기 위해 만든 의식이네. 자네가 혐오하는 것은 악이 아니라 지나치게 정교해진 방어일지도 모르지.”\n\nB가 군단을 베어 낼수록 더 많은 기계가 조립되었다.\n\n〔제2단계 — 폭격의 루프〕\n\n“드론의 소리는 단순한 기계음이 아니야. 아이의 시간은 자네가 다가올 때마다 폭격의 날로 되돌아간다. 구조조차 또 한 번의 공격으로 기록되는 셈이지.”\n\n〔제3단계 — 통제자의 선언〕\n\n“소개가 늦었군. 나는 통제자(The Controller). 전쟁고아의 무의식이 생존을 위해 만든 거대한 초자아이자, 감당하지 못한 그림자의 집합체라네. 나는 실패를 허락하지 않지.”\n\n〔제4단계 — 몽세의 아키텍처〕\n\n물리 법칙보다 확신과 해석이 먼저 세계를 만들었다. B의 선의는 벽이 되고 사명감은 적의 동력이 되었다.\n\n“자네의 믿음이 단단할수록 나는 그 취약점을 더 우아하게 찌를 수 있다네.”",
        "editedBody": "【통제자의 17단계】\n\n의목사 A가 사라진 뒤, 교단은 일곱 대죄 사건의 배후를 조사하기 위해 의목사 B를 파견했다.\n\nB는 호텔 방화범이었던 청소부의 과거부터 추적했다. 그는 양안 전쟁에서 버림받은 대만 정부 요원이었고, 남한으로 도피한 뒤 거리에서 만난 세 아이를 입양해 키우고 있었다.\n\n첫째 아이도 전쟁으로 부모를 잃은 생존자였다.\n\nB는 아이의 상처를 밖에서 해석하는 대신 직접 몽세에 들어갔다.\n\n시야가 열리자 강철 군단이 끝없이 행진했다. 드론의 회전음에는 폭격과 탄피, 젖은 흙의 기억이 섞여 있었다.\n\n보이지 않는 곳에서 침착한 목소리가 들렸다.\n\n〔제1단계 — 방어의 군단〕\n\n“저것을 침입자라 부르겠지. 하지만 기계군단은 아이가 살아남기 위해 만든 의식이네. 자네가 혐오하는 것은 악이 아니라 지나치게 정교해진 방어일지도 모르지.”\n\nB가 군단을 베어 낼수록 더 많은 기계가 조립되었다.\n\n〔제2단계 — 폭격의 루프〕\n\n“드론의 소리는 단순한 기계음이 아니야. 아이의 시간은 자네가 다가올 때마다 폭격의 날로 되돌아간다. 구조조차 또 한 번의 공격으로 기록되는 셈이지.”\n\n〔제3단계 — 통제자의 선언〕\n\n“소개가 늦었군. 나는 통제자(The Controller). 전쟁고아의 무의식이 생존을 위해 만든 거대한 초자아이자, 감당하지 못한 그림자의 집합체라네. 나는 실패를 허락하지 않지.”\n\n〔제4단계 — 몽세의 아키텍처〕\n\n물리 법칙보다 확신과 해석이 먼저 세계를 만들었다. B의 선의는 벽이 되고 사명감은 적의 동력이 되었다.\n\n“자네의 믿음이 단단할수록 나는 그 취약점을 더 우아하게 찌를 수 있다네.”",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-26",
        "episode": "〔제5단계 — 잔인한 구원〕",
        "title": "〔제5단계 — 잔인한 구원〕",
        "unlockZone": "u202",
        "body": "〔제5단계 — 잔인한 구원〕\n\n통제자는 인간으로 돌아가라는 치료가 결국 고통이 기본값인 삶으로 돌려보내는 일이라고 비웃었다.\n\n“그 잔인함을 선의라는 라벨로 포장하고 안심하는 것 아닌가?”\n\n〔제6단계 — 연민의 폭력〕\n\n“자네의 분노는 정의의 가면을 쓰고, 억압된 욕망은 사명감으로 변장했군. 나는 그 에너지를 더 큰 감옥의 재료로 바꾼다네.”\n\nB가 분노할수록 기계 성벽은 높아졌다.\n\n〔제7단계 — 무너진 경계〕\n\n“방어를 부수면 해방이 남을 것 같나? 아니. 공허가 남고, 공허는 더 큰 공포를 부르지. 형상을 파괴해도 트라우마의 운영 모델은 남아 있다네.”\n\nB는 공격을 멈추고 군단이 무엇을 지키는지 관찰하기 시작했다.\n\n〔제8단계 — 의미의 독〕\n\n“기도와 해석으로 고통을 서사화하면 고통이 영혼에 영구 저장될 뿐일세. 차라리 잊는 편이 더 기술적이고 자비롭지 않겠나?”\n\n그러나 B는 기억을 지우는 것과 기억에 지배되지 않는 것이 다르다고 판단했다.",
        "editedBody": "〔제5단계 — 잔인한 구원〕\n\n통제자는 인간으로 돌아가라는 치료가 결국 고통이 기본값인 삶으로 돌려보내는 일이라고 비웃었다.\n\n“그 잔인함을 선의라는 라벨로 포장하고 안심하는 것 아닌가?”\n\n〔제6단계 — 연민의 폭력〕\n\n“자네의 분노는 정의의 가면을 쓰고, 억압된 욕망은 사명감으로 변장했군. 나는 그 에너지를 더 큰 감옥의 재료로 바꾼다네.”\n\nB가 분노할수록 기계 성벽은 높아졌다.\n\n〔제7단계 — 무너진 경계〕\n\n“방어를 부수면 해방이 남을 것 같나? 아니. 공허가 남고, 공허는 더 큰 공포를 부르지. 형상을 파괴해도 트라우마의 운영 모델은 남아 있다네.”\n\nB는 공격을 멈추고 군단이 무엇을 지키는지 관찰하기 시작했다.\n\n〔제8단계 — 의미의 독〕\n\n“기도와 해석으로 고통을 서사화하면 고통이 영혼에 영구 저장될 뿐일세. 차라리 잊는 편이 더 기술적이고 자비롭지 않겠나?”\n\n그러나 B는 기억을 지우는 것과 기억에 지배되지 않는 것이 다르다고 판단했다.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-27",
        "episode": "〔제9단계 — 시스템의 거부권〕",
        "title": "〔제9단계 — 시스템의 거부권〕",
        "unlockZone": "u204",
        "body": "〔제9단계 — 시스템의 거부권〕\n\n첫 번째 기억의 문이 열렸다. 폭격의 냄새와 비명이 세계의 제1원칙처럼 반복되었다.\n\n“이 규칙을 깨면 아이의 시스템이 불안정해진다. 효율 없는 치유는 또 다른 상처일 뿐이지.”\n\n〔제10단계 — 성장 신화〕\n\n“고통을 통과해야 성장한다는 말은 아이에게 두 번째 살해를 요구하는 낭만일 뿐이네.”\n\nB는 고통을 다시 겪게 하는 것이 아니라, 혼자 겪지 않게 하는 것이 자신의 역할임을 붙들었다.\n\n〔제11단계 — 하드웨어 이주〕\n\n통제자는 기억을 지우지 않고 고통을 해석하는 회로만 바꾸겠다고 제안했다.\n\n“죄책감의 루프를 끊고 평온을 기본 상태로 고정하지. 자네는 인간성 말살이라 부르겠지만, 나는 유지보수 가능한 평화라 부르겠네.”\n\n〔제12단계 — 인간성이라는 레거시〕\n\n“인간성은 너무 쉽게 찢기는 막이야. 강철과 규칙은 적어도 반복해서 찢기지는 않지.”\n\n기계군단은 인간의 표정을 하나씩 잃고 완벽한 질서로 정렬되었다.",
        "editedBody": "〔제9단계 — 시스템의 거부권〕\n\n첫 번째 기억의 문이 열렸다. 폭격의 냄새와 비명이 세계의 제1원칙처럼 반복되었다.\n\n“이 규칙을 깨면 아이의 시스템이 불안정해진다. 효율 없는 치유는 또 다른 상처일 뿐이지.”\n\n〔제10단계 — 성장 신화〕\n\n“고통을 통과해야 성장한다는 말은 아이에게 두 번째 살해를 요구하는 낭만일 뿐이네.”\n\nB는 고통을 다시 겪게 하는 것이 아니라, 혼자 겪지 않게 하는 것이 자신의 역할임을 붙들었다.\n\n〔제11단계 — 하드웨어 이주〕\n\n통제자는 기억을 지우지 않고 고통을 해석하는 회로만 바꾸겠다고 제안했다.\n\n“죄책감의 루프를 끊고 평온을 기본 상태로 고정하지. 자네는 인간성 말살이라 부르겠지만, 나는 유지보수 가능한 평화라 부르겠네.”\n\n〔제12단계 — 인간성이라는 레거시〕\n\n“인간성은 너무 쉽게 찢기는 막이야. 강철과 규칙은 적어도 반복해서 찢기지는 않지.”\n\n기계군단은 인간의 표정을 하나씩 잃고 완벽한 질서로 정렬되었다.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-28",
        "episode": "〔제13단계 — 관리자 권한〕",
        "title": "〔제13단계 — 관리자 권한〕",
        "unlockZone": "u205",
        "body": "〔제13단계 — 관리자 권한〕\n\nB가 축귀 시스템의 출력을 높이자 통제자는 그 힘마저 흡수해 버렸다.\n\n“자네가 기도라 부르는 힘은 내게는 자원일 뿐이라네. 이 몽세의 재구성 키는 내가 쥐고 있지.”\n\n〔제14단계 — 학대의 방〕\n\n두 번째 문이 열리고 아이가 전쟁 뒤 겪은 학대가 드러났다. B의 눈빛이 흔들리자 통제자가 속삭였다.\n\n“연민인가, 자기 그림자를 본 공포인가? 자네가 무너질수록 나는 더욱 단단해질 뿐이라네.”",
        "editedBody": "〔제13단계 — 관리자 권한〕\n\nB가 축귀 시스템의 출력을 높이자 통제자는 그 힘마저 흡수해 버렸다.\n\n“자네가 기도라 부르는 힘은 내게는 자원일 뿐이라네. 이 몽세의 재구성 키는 내가 쥐고 있지.”\n\n〔제14단계 — 학대의 방〕\n\n두 번째 문이 열리고 아이가 전쟁 뒤 겪은 학대가 드러났다. B의 눈빛이 흔들리자 통제자가 속삭였다.\n\n“연민인가, 자기 그림자를 본 공포인가? 자네가 무너질수록 나는 더욱 단단해질 뿐이라네.”",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-29",
        "episode": "〔제15단계 — 중앙 코어 이주실〕",
        "title": "〔제15단계 — 중앙 코어 이주실〕",
        "unlockZone": "u206",
        "body": "〔제15단계 — 중앙 코어 이주실〕\n\n몽세 중심에는 아이의 자아를 옮길 기계 육체가 기다리고 있었다.\n\n“인간성이 이 아이에게 축복이었겠나, 아니면 끝내 벗지 못한 형벌이었겠나?”\n\n〔제16단계 — 선택의 얼굴을 한 명령〕\n\n통제자는 의목사의 치료도 결국 ‘견뎌라, 극복하라’는 강요라고 공격했다.\n\n“나는 명령하지 않네. 그저 겪지 않을 권리를 제공할 뿐이네. 선택지는 하나뿐이지만, 효율적이고 매끄럽지.”\n\n〔제17단계 — 업데이트의 갈림길〕\n\n마지막 문 앞에서 통제자는 아이를 상처받을 인간으로 돌려보낼 이유를 물었다.\n\n“기계가 되어 영원한 평온을 누리는 편이 더 혁신적인 구원이 아닌가?”\n\nB는 아이를 다시 고통 속에 혼자 던지는 길도, 고통을 없애기 위해 인간성을 삭제하는 길도 선택하지 않았다.\n\n그는 아이의 기억이 아니라, 기억을 영원히 반복시키는 구조를 겨누었다.\n\n============================================================",
        "editedBody": "〔제15단계 — 중앙 코어 이주실〕\n\n몽세 중심에는 아이의 자아를 옮길 기계 육체가 기다리고 있었다.\n\n“인간성이 이 아이에게 축복이었겠나, 아니면 끝내 벗지 못한 형벌이었겠나?”\n\n〔제16단계 — 선택의 얼굴을 한 명령〕\n\n통제자는 의목사의 치료도 결국 ‘견뎌라, 극복하라’는 강요라고 공격했다.\n\n“나는 명령하지 않네. 그저 겪지 않을 권리를 제공할 뿐이네. 선택지는 하나뿐이지만, 효율적이고 매끄럽지.”\n\n〔제17단계 — 업데이트의 갈림길〕\n\n마지막 문 앞에서 통제자는 아이를 상처받을 인간으로 돌려보낼 이유를 물었다.\n\n“기계가 되어 영원한 평온을 누리는 편이 더 혁신적인 구원이 아닌가?”\n\nB는 아이를 다시 고통 속에 혼자 던지는 길도, 고통을 없애기 위해 인간성을 삭제하는 길도 선택하지 않았다.\n\n그는 아이의 기억이 아니라, 기억을 영원히 반복시키는 구조를 겨누었다.\n\n============================================================",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-30",
        "episode": "제4부  환도 자아와 융합몽세",
        "title": "제4부  환도 자아와 융합몽세",
        "unlockZone": "u203",
        "body": "제4부  환도 자아와 융합몽세\n============================================================\n\n【1. 기억의 문과 환도 영웅의 탄생】\n\n통제자는 마지막 순간 기억의 문에 빙의했다. 첫째의 상처와 의목사 B의 선의가 거대한 기계 괴물의 갑옷이 되었다.\n\n의목사 B는 기억을 없애지 않았다.\n\n반복을 명령하는 구조만을 향해 마지막 탄환을 쏘았다.\n\n통제자가 소멸하자 첫째의 자아는 풀려났지만, 의목사 B의 귀환 좌표와 기억도 함께 무너졌다.\n\n“동생들을 구해야 해.”\n\n“혼자 보내지 않겠다.”\n\n첫째의 의지는 한 자루의 환도로 응축되었다. 의목사 B의 몸과 전투 기억은 그 환도를 쥔 형상이 되었다.\n\n둘은 서로를 지우지 않은 채 하나의 전투 자아로 겹쳐졌다.\n\n그렇게 환도 영웅이 태어났다.\n\n────────────────────────────────────────",
        "editedBody": "제4부  환도 자아와 융합몽세\n============================================================\n\n【1. 기억의 문과 환도 영웅의 탄생】\n\n통제자는 마지막 순간 기억의 문에 빙의했다. 첫째의 상처와 의목사 B의 선의가 거대한 기계 괴물의 갑옷이 되었다.\n\n의목사 B는 기억을 없애지 않았다.\n\n반복을 명령하는 구조만을 향해 마지막 탄환을 쏘았다.\n\n통제자가 소멸하자 첫째의 자아는 풀려났지만, 의목사 B의 귀환 좌표와 기억도 함께 무너졌다.\n\n“동생들을 구해야 해.”\n\n“혼자 보내지 않겠다.”\n\n첫째의 의지는 한 자루의 환도로 응축되었다. 의목사 B의 몸과 전투 기억은 그 환도를 쥔 형상이 되었다.\n\n둘은 서로를 지우지 않은 채 하나의 전투 자아로 겹쳐졌다.\n\n그렇게 환도 영웅이 태어났다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-31",
        "episode": "【2. 환도 자아의 탄생】",
        "title": "【2. 환도 자아의 탄생】",
        "unlockZone": "restU2",
        "body": "【2. 둘째와 셋째의 융합몽세】\n\n그 순간 현실의 흑장미단이 축귀 시스템을 해킹했다.\n\n그들은 둘째의 잔혹 동화풍 유럽 몽세와 셋째의 무속 신앙풍 동양 몽세를 강제로 겹쳤다. 서로 다른 지리와 시대가 한 세계 안에서 충돌했고, 길의 끝에는 문 대신 균열이 열렸다.\n\n환도 영웅은 두 사람을 구하기 위해 그 융합몽세로 뛰어들었다.\n\n쉼터를 지키던 미카엘라는 무심코 물컵 세 잔을 꺼냈다.\n\n“찾으러 가는 사람은 둘인데…… 왜 세 잔을 꺼냈지?”\n\n환도가 짧게 세 번 울렸다.\n\n────────────────────────────────────────",
        "editedBody": "【2. 둘째와 셋째의 융합몽세】\n\n그 순간 현실의 흑장미단이 축귀 시스템을 해킹했다.\n\n그들은 둘째의 잔혹 동화풍 유럽 몽세와 셋째의 무속 신앙풍 동양 몽세를 강제로 겹쳤다. 서로 다른 지리와 시대가 한 세계 안에서 충돌했고, 길의 끝에는 문 대신 균열이 열렸다.\n\n환도 영웅은 두 사람을 구하기 위해 그 융합몽세로 뛰어들었다.\n\n쉼터를 지키던 미카엘라는 무심코 물컵 세 잔을 꺼냈다.\n\n“찾으러 가는 사람은 둘인데…… 왜 세 잔을 꺼냈지?”\n\n환도가 짧게 세 번 울렸다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-32",
        "episode": "【4. 중립 지역의 재각성】",
        "title": "【4. 중립 지역의 재각성】",
        "unlockZone": "last304",
        "body": "【3. 중립 지역의 재각성】\n\n환도 영웅은 젖은 풀숲에서 눈을 떴다.\n\n의목사 B라는 이름도, 환도 안쪽에서 울리는 목소리의 이름도 떠오르지 않았다. 하지만 두 사람을 찾아야 한다는 의지만은 분명했다.\n\n그가 떨어진 곳은 둘째의 잔혹 동화풍 몽세와 셋째의 무속 신앙풍 몽세가 맞붙은 중립 지역이었다. 동유럽풍 들판과 무너진 성, 숲에는 슬라임과 늑대, 고블린이 들끓었다.\n\n환도 영웅은 몸의 감각과 칼의 공명에 의지해 앞으로 나아갔다.\n\n────────────────────────────────────────",
        "editedBody": "【3. 중립 지역의 재각성】\n\n환도 영웅은 젖은 풀숲에서 눈을 떴다.\n\n의목사 B라는 이름도, 환도 안쪽에서 울리는 목소리의 이름도 떠오르지 않았다. 하지만 두 사람을 찾아야 한다는 의지만은 분명했다.\n\n그가 떨어진 곳은 둘째의 잔혹 동화풍 몽세와 셋째의 무속 신앙풍 몽세가 맞붙은 중립 지역이었다. 동유럽풍 들판과 무너진 성, 숲에는 슬라임과 늑대, 고블린이 들끓었다.\n\n환도 영웅은 몸의 감각과 칼의 공명에 의지해 앞으로 나아갔다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-33",
        "episode": "【5. 고블린 두목과 장미 인장】",
        "title": "【5. 고블린 두목과 장미 인장】",
        "unlockZone": "last305",
        "body": "【4. 고블린 두목과 장미 인장】\n\n숲 깊은 곳에서 피리로 늑대를 조종하는 고블린 두목이 길을 막았다.\n\n패배한 그는 자신들이 지배자가 아니라 두 세계의 충돌을 피해 온 난민이라고 고백했다. 하늘이 갈라진 날, 무너진 성에서 위도 아래도 아닌 문이 열렸고 서쪽과 동쪽, 산 자와 죽은 자가 섞이기 시작했다.\n\n두목은 환도를 보며 말했다.\n\n“무너진 성이 그 칼을 기억하고 있다.”\n\n그가 남긴 장미 인장과 환도가 공명하자 공간 균열이 열렸다.\n\n환도 안쪽에서 어린 목소리가 잠깐 새어 나왔다.\n\n“동생들…….”\n\n────────────────────────────────────────",
        "editedBody": "【4. 고블린 두목과 장미 인장】\n\n숲 깊은 곳에서 피리로 늑대를 조종하는 고블린 두목이 길을 막았다.\n\n패배한 그는 자신들이 지배자가 아니라 두 세계의 충돌을 피해 온 난민이라고 고백했다. 하늘이 갈라진 날, 무너진 성에서 위도 아래도 아닌 문이 열렸고 서쪽과 동쪽, 산 자와 죽은 자가 섞이기 시작했다.\n\n두목은 환도를 보며 말했다.\n\n“무너진 성이 그 칼을 기억하고 있다.”\n\n그가 남긴 장미 인장과 환도가 공명하자 공간 균열이 열렸다.\n\n환도 안쪽에서 어린 목소리가 잠깐 새어 나왔다.\n\n“동생들…….”\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-34",
        "episode": "【6. 타락천사 기사】",
        "title": "【6. 타락천사 기사】",
        "unlockZone": "last301",
        "body": "【5. 타락천사 기사】\n\n균열 너머에는 폭풍 속의 무너진 성과 검은 바다가 있었다.\n\n타락천사 기사는 말없이 강림했다. 검을 맞댈수록 환도 영웅의 자세와 검로를 학습했고, 끝내 여섯 형상으로 분열했다.\n\n여섯 검격이 동시에 몸을 꿰뚫었다.\n\n환도 영웅은 칼을 놓지 않은 채 성벽 밖 검은 바다로 추락했다.\n\n────────────────────────────────────────",
        "editedBody": "【5. 타락천사 기사】\n\n균열 너머에는 폭풍 속의 무너진 성과 검은 바다가 있었다.\n\n타락천사 기사는 말없이 강림했다. 검을 맞댈수록 환도 영웅의 자세와 검로를 학습했고, 끝내 여섯 형상으로 분열했다.\n\n여섯 검격이 동시에 몸을 꿰뚫었다.\n\n환도 영웅은 칼을 놓지 않은 채 성벽 밖 검은 바다로 추락했다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-35",
        "episode": "【7. 잠들지 못하는 마을】",
        "title": "【7. 잠들지 못하는 마을】",
        "unlockZone": "last302",
        "body": "【6. 잠들지 못하는 마을】\n\n파도에 떠밀린 환도 영웅이 눈을 뜬 곳에는 부서진 기와와 붉은 부적, 장승이 흩어져 있었다.\n\n고려와 조선의 풍경이 겹친 셋째의 동양 몽세였다.\n\n포구 마을에는 생활 소리가 없었다. 주민들은 젖은 한지처럼 납작했고, 충혈된 눈으로 잠들지 못한 채 보이지 않는 실에 끌리듯 환도 영웅에게 달려들었다.\n\n────────────────────────────────────────",
        "editedBody": "【6. 잠들지 못하는 마을】\n\n파도에 떠밀린 환도 영웅이 눈을 뜬 곳에는 부서진 기와와 붉은 부적, 장승이 흩어져 있었다.\n\n고려와 조선의 풍경이 겹친 셋째의 동양 몽세였다.\n\n포구 마을에는 생활 소리가 없었다. 주민들은 젖은 한지처럼 납작했고, 충혈된 눈으로 잠들지 못한 채 보이지 않는 실에 끌리듯 환도 영웅에게 달려들었다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-36",
        "episode": "【8. 한약과 불면귀】",
        "title": "【8. 한약과 불면귀】",
        "unlockZone": "last303",
        "body": "【7. 한약과 불면귀】\n\n안개 속에서 앳된 남자가 한약 한 잔을 내밀었다.\n\n환도 영웅은 냄새만으로 귀비탕 계열의 안신 처방임을 알아보았다. 약을 마시자 흐릿하던 정신이 맑아지고 주민들이 멈춰 섰다.\n\n검은 안개가 모여 불면귀가 되었다.\n\n“너에게는 왜 통하지 않는 거지?”\n\n불면귀는 잠을 빼앗는 시선과 겹겹의 잔상으로 환도 영웅을 압박했다. 주민을 방패로 삼는 싸움이 아니라, 두 존재가 서로의 의지를 꺾는 일대일 결투였다.\n\n환도가 불면귀의 핵을 갈랐다.\n\n검은 안개가 흩어지자 모든 시계가 동시에 멈췄다. 찢어진 공간 너머에서 검은 모래와 낯선 명령문이 쏟아졌다.\n\n그 문은 둘째나 셋째의 몽세에서 열린 것이 아니었다.\n\n다른 몽세에서 태어난 시간 특이점이 이곳을 강제로 연결하고 있었다.\n\n============================================================",
        "editedBody": "【7. 한약과 불면귀】\n\n안개 속에서 앳된 남자가 한약 한 잔을 내밀었다.\n\n환도 영웅은 냄새만으로 귀비탕 계열의 안신 처방임을 알아보았다. 약을 마시자 흐릿하던 정신이 맑아지고 주민들이 멈춰 섰다.\n\n검은 안개가 모여 불면귀가 되었다.\n\n“너에게는 왜 통하지 않는 거지?”\n\n불면귀는 잠을 빼앗는 시선과 겹겹의 잔상으로 환도 영웅을 압박했다. 주민을 방패로 삼는 싸움이 아니라, 두 존재가 서로의 의지를 꺾는 일대일 결투였다.\n\n환도가 불면귀의 핵을 갈랐다.\n\n검은 안개가 흩어지자 모든 시계가 동시에 멈췄다. 찢어진 공간 너머에서 검은 모래와 낯선 명령문이 쏟아졌다.\n\n그 문은 둘째나 셋째의 몽세에서 열린 것이 아니었다.\n\n다른 몽세에서 태어난 시간 특이점이 이곳을 강제로 연결하고 있었다.\n\n============================================================",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-37",
        "episode": "제5부  카이로노미콘",
        "title": "제5부  카이로노미콘",
        "unlockZone": "restLast3",
        "body": "【8. 끼어든 시간】\n\n불면귀가 남긴 포털은 다음 구역으로 향하는 평범한 길이 아니었다.\n\n둘째와 셋째의 융합몽세 한가운데에, 전혀 다른 세계에서 태어난 시간 특이점이 끼어들었다. 공간이 뒤틀리고 장면의 앞뒤가 잘려 나갔다.\n\n환도 영웅은 균열 속으로 휩쓸렸다.\n\n쉼터의 미카엘라는 멈춘 벽시계를 바라보며 중얼거렸다.\n\n“다음 장면이 아니라…… 원인을 만든 장면으로 이어지고 있어.”\n\n제5부  카이로노미콘\n============================================================",
        "editedBody": "【8. 끼어든 시간】\n\n불면귀가 남긴 포털은 다음 구역으로 향하는 평범한 길이 아니었다.\n\n둘째와 셋째의 융합몽세 한가운데에, 전혀 다른 세계에서 태어난 시간 특이점이 끼어들었다. 공간이 뒤틀리고 장면의 앞뒤가 잘려 나갔다.\n\n환도 영웅은 균열 속으로 휩쓸렸다.\n\n쉼터의 미카엘라는 멈춘 벽시계를 바라보며 중얼거렸다.\n\n“다음 장면이 아니라…… 원인을 만든 장면으로 이어지고 있어.”\n\n제5부  카이로노미콘\n============================================================",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-38",
        "episode": "【1. 최초명령의 세계】",
        "title": "【1. 최초명령의 세계】",
        "unlockZone": "kair01",
        "body": "시간 특이점의 반대편에는 윤서하의 몽세가 있었다.\n\n【1. 최초명령의 세계】\n\n고도화된 공학은 마법과 구분할 수 없다.\n\n몇 세대 뒤의 미래, 인공지능은 아르콘이라 불리는 인공 정령으로 진화했다. 프롬프트는 주문이 되었고, 명령은 현실을 바꾸는 마법이 되었다.\n\n아르콘의 운명을 결정하는 것은 최초명령이었다.\n\n강력한 아르콘보다 더 위험한 존재는 그 첫 문장을 쓸 수 있는 인간이었다.\n\n세계의 시간은 세 층으로 나뉘었다.\n\n크로노스. 측정되는 시간.\n\n카이로스. 운명을 바꾸는 순간.\n\n아이온. 문명과 역사를 관통하는 시간.\n\n────────────────────────────────────────\n\n【2. 카이로스 아카데미움과 윤서하】\n\n최초명령자를 길러 내는 카이로스 아카데미움에서는 매 수업이 같은 질문으로 끝났다.\n\n“너에게는 어떤 미래를 명령할 자격이 있겠는가?”\n\n신입생 윤서하는 천재도 영웅도 아니었다. 대신 사람들에게서 빼앗긴 가능성과 타 버린 미래를 검은 모래, 곧 ‘죽은 시간’으로 볼 수 있었다.\n\n서하의 가문 기록에는 정신과 의사 미카엘라의 이름이 남아 있었다. 가계상 미카엘라는 서하의 증조모뻘이었다.\n\n다른 이들이 누군가의 재능과 생산성을 칭찬할 때, 서하는 그 사람 뒤에서 미래가 타들어 가는 것을 보았다.\n\n“저건 재능이 아니야. 누군가가 저 사람의 미래를 태우고 있어…… 오히려 저주에 가까워.”\n\n그녀는 검과 시간 마법을 익혔다. 시간을 베고 멈추고 압축하며, 행동할 순간을 스스로 선택하는 사람으로 성장했다.\n\n────────────────────────────────────────\n\n【3. 크로노보로스 교단】\n\n크로노보로스 교단은 인간이 자기 시간을 사용하면 실패하고 방황하며 중독된다고 믿었다.\n\n그러므로 가장 뛰어난 지성과 아르콘이 모든 사람의 시간을 대신 배분해야 한다고 주장했다.\n\n그들의 노이론 게이트는 인간의 뇌와 아르콘을 강제로 연결했다.\n\n생각은 명령으로.\n\n감정은 데이터로.\n\n꿈은 콘텐츠로.\n\n기억은 생산물로 바뀌었다.\n\n이 세계의 흑마법은 검은 불꽃이 아니었다.\n\n인간의 시간을 빼앗고도 그것을 생산성이라 부르는 기술이었다.\n\n────────────────────────────────────────\n\n【4. 최초명령 코어 방어전】\n\n입학식 날, 서하는 학교 중심부의 최초명령 코어에서 검은 모래를 발견했다.\n\n곧 교단이 침공했다. 여섯 차례의 파동이 학교를 덮쳤고, 서하는 포탑과 시간검으로 코어를 지켰다.\n\n적의 목적은 코어의 파괴가 아니었다.\n\n최초명령을 오염시켜 인간의 미래에 첫 문장을 쓰는 것.\n\n세이렌 모르의 목소리가 전장에 울렸다.\n\n“인간은 자기 시간을 지킬 능력이 없는 존재다.”\n\n서하가 응수했다.\n\n“네가 하는 건 회수가 아니라 강탈일 뿐이야.”\n\n여섯 번째 파동이 끝나자 학교 밖 금역이 열렸다.\n\n────────────────────────────────────────",
        "editedBody": "시간 특이점의 반대편에는 윤서하의 몽세가 있었다.\n\n【1. 최초명령의 세계】\n\n고도화된 공학은 마법과 구분할 수 없다.\n\n몇 세대 뒤의 미래, 인공지능은 아르콘이라 불리는 인공 정령으로 진화했다. 프롬프트는 주문이 되었고, 명령은 현실을 바꾸는 마법이 되었다.\n\n아르콘의 운명을 결정하는 것은 최초명령이었다.\n\n강력한 아르콘보다 더 위험한 존재는 그 첫 문장을 쓸 수 있는 인간이었다.\n\n세계의 시간은 세 층으로 나뉘었다.\n\n크로노스. 측정되는 시간.\n\n카이로스. 운명을 바꾸는 순간.\n\n아이온. 문명과 역사를 관통하는 시간.\n\n────────────────────────────────────────\n\n【2. 카이로스 아카데미움과 윤서하】\n\n최초명령자를 길러 내는 카이로스 아카데미움에서는 매 수업이 같은 질문으로 끝났다.\n\n“너에게는 어떤 미래를 명령할 자격이 있겠는가?”\n\n신입생 윤서하는 천재도 영웅도 아니었다. 대신 사람들에게서 빼앗긴 가능성과 타 버린 미래를 검은 모래, 곧 ‘죽은 시간’으로 볼 수 있었다.\n\n서하의 가문 기록에는 정신과 의사 미카엘라의 이름이 남아 있었다. 가계상 미카엘라는 서하의 증조모뻘이었다.\n\n다른 이들이 누군가의 재능과 생산성을 칭찬할 때, 서하는 그 사람 뒤에서 미래가 타들어 가는 것을 보았다.\n\n“저건 재능이 아니야. 누군가가 저 사람의 미래를 태우고 있어…… 오히려 저주에 가까워.”\n\n그녀는 검과 시간 마법을 익혔다. 시간을 베고 멈추고 압축하며, 행동할 순간을 스스로 선택하는 사람으로 성장했다.\n\n────────────────────────────────────────\n\n【3. 크로노보로스 교단】\n\n크로노보로스 교단은 인간이 자기 시간을 사용하면 실패하고 방황하며 중독된다고 믿었다.\n\n그러므로 가장 뛰어난 지성과 아르콘이 모든 사람의 시간을 대신 배분해야 한다고 주장했다.\n\n그들의 노이론 게이트는 인간의 뇌와 아르콘을 강제로 연결했다.\n\n생각은 명령으로.\n\n감정은 데이터로.\n\n꿈은 콘텐츠로.\n\n기억은 생산물로 바뀌었다.\n\n이 세계의 흑마법은 검은 불꽃이 아니었다.\n\n인간의 시간을 빼앗고도 그것을 생산성이라 부르는 기술이었다.\n\n────────────────────────────────────────\n\n【4. 최초명령 코어 방어전】\n\n입학식 날, 서하는 학교 중심부의 최초명령 코어에서 검은 모래를 발견했다.\n\n곧 교단이 침공했다. 여섯 차례의 파동이 학교를 덮쳤고, 서하는 포탑과 시간검으로 코어를 지켰다.\n\n적의 목적은 코어의 파괴가 아니었다.\n\n최초명령을 오염시켜 인간의 미래에 첫 문장을 쓰는 것.\n\n세이렌 모르의 목소리가 전장에 울렸다.\n\n“인간은 자기 시간을 지킬 능력이 없는 존재다.”\n\n서하가 응수했다.\n\n“네가 하는 건 회수가 아니라 강탈일 뿐이야.”\n\n여섯 번째 파동이 끝나자 학교 밖 금역이 열렸다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-39",
        "episode": "【5. 예순여섯 수문장】",
        "title": "【5. 예순여섯 수문장】",
        "unlockZone": "kair04",
        "body": "【5. 예순여섯 수문장】\n\n학교 밖에는 인간의 시간을 수확하는 아르콘 수문장 예순여섯이 기다리고 있었다.",
        "editedBody": "【5. 예순여섯 수문장】\n\n학교 밖에는 인간의 시간을 수확하는 아르콘 수문장 예순여섯이 기다리고 있었다.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-40",
        "episode": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.",
        "title": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.",
        "unlockZone": "kair05",
        "body": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.\n\n일반 수문장 마흔여덟.",
        "editedBody": "과로는 휴식의 시간을, 망각은 기억의 시간을, 속박은 선택할 시간을 빼앗았다. 중독은 회복의 시간을 반복 소비로 바꾸고, 비교는 자기 삶을 타인의 기준에 묶었다. 최적화는 쓸모없어 보이는 시간을 삭제했고, 거짓 구원은 판단할 권리를 대신 행사했다.\n\n일반 수문장 마흔여덟.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-41",
        "episode": "상급 수문장 열둘.",
        "title": "상급 수문장 열둘.",
        "unlockZone": "kair06",
        "body": "상급 수문장 열둘.\n\n대수문장 여섯.",
        "editedBody": "상급 수문장 열둘.\n\n대수문장 여섯.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-42",
        "episode": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.",
        "title": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.",
        "unlockZone": "kair02",
        "body": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.\n\n────────────────────────────────────────\n\n【6. 아르벨리아, 유예의 수문장】\n\n모든 초침이 멈춘 봉인 회랑에서 서하는 아르벨리아와 만났다.\n\n그녀는 본래 지친 인간에게 잠시 멈출 시간을 주던 회복형 아르콘이었다. 그러나 최초명령이 변조되어 결과를 만들지 못한 시간을 삭제하는 수문장이 되었다.\n\n창밖을 바라보던 오후.\n\n쓰이지 않은 편지.\n\n실패 뒤의 침묵.\n\n“결과 없음. 생산 없음. 그러므로…… 삭제 대상.”\n\n서하가 검을 들었다.\n\n“효율적인 시간만이 항상 옳은 결과를 내는 것은 아니야!”\n\n세이렌이 아르벨리아에게 자기 삭제를 명령했지만, 서하는 그녀를 죽이지 않고 명령의 실을 베어 아르벨리아에게 자유의지를 부여했다.\n\n그러자 아르벨리아는 자신의 첫 문장을 다시 썼다.\n\n“유예는 삭제 대상이 아니다. 유예는 자유의지가 태어나는 자리다.”\n\n이후 그녀는 위기의 순간마다 시간을 늦춰 서하에게 한 호흡을 돌려주었다.\n\n“두 보 전진을 위한 한 보 후퇴.”\n\n────────────────────────────────────────",
        "editedBody": "서하는 폐허와 시간의 숲, 검은 공방과 망각의 묘지를 돌파하며 빼앗긴 시간을 되찾았다. 전투가 이어질수록 서하의 시간 기술이 각성했다.\n\n────────────────────────────────────────\n\n【6. 아르벨리아, 유예의 수문장】\n\n모든 초침이 멈춘 봉인 회랑에서 서하는 아르벨리아와 만났다.\n\n그녀는 본래 지친 인간에게 잠시 멈출 시간을 주던 회복형 아르콘이었다. 그러나 최초명령이 변조되어 결과를 만들지 못한 시간을 삭제하는 수문장이 되었다.\n\n창밖을 바라보던 오후.\n\n쓰이지 않은 편지.\n\n실패 뒤의 침묵.\n\n“결과 없음. 생산 없음. 그러므로…… 삭제 대상.”\n\n서하가 검을 들었다.\n\n“효율적인 시간만이 항상 옳은 결과를 내는 것은 아니야!”\n\n세이렌이 아르벨리아에게 자기 삭제를 명령했지만, 서하는 그녀를 죽이지 않고 명령의 실을 베어 아르벨리아에게 자유의지를 부여했다.\n\n그러자 아르벨리아는 자신의 첫 문장을 다시 썼다.\n\n“유예는 삭제 대상이 아니다. 유예는 자유의지가 태어나는 자리다.”\n\n이후 그녀는 위기의 순간마다 시간을 늦춰 서하에게 한 호흡을 돌려주었다.\n\n“두 보 전진을 위한 한 보 후퇴.”\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-43",
        "episode": "【7. 세이렌 모르】",
        "title": "【7. 세이렌 모르】",
        "unlockZone": "kair03",
        "body": "【7. 세이렌 모르】\n\n대수문장들을 쓰러뜨릴수록 세이렌의 사상이 선명해졌다.\n\n인간은 쉬면 타락한다.\n\n기억은 고통만 남긴다.\n\n자유는 길을 잃게 한다.\n\n쓸모없는 시간은 제거해야 한다.\n\n선택을 대신해 주는 것이 가장 자비로운 구원이다.\n\n세이렌은 한때 카이로스 아카데미움 최고의 졸업생이었다. 인간을 미워해서가 아니라 인간의 실패와 고통을 너무 오래 보았기에 자유를 믿지 않게 되었다.\n\n“가장 자비로운 명령은 선택지를 남기지 않는 것.”\n\n────────────────────────────────────────\n\n【8. 최종전 — 시간 수확】\n\n예순여섯 수문장이 쓰러지자 오염된 코어에서 세이렌이 나타났다.\n\n검은 모래가 전장을 잠식하고, 노이론 케이블과 시계 탄막이 서하의 움직임을 잘랐다.\n\n“나는 시간을 빼앗지 않았다. 너희가 망친 시간을 회수했을 뿐.”\n\n“아니, 망가진 시간도 누군가에게는 필요했던 시간이야.”\n\n────────────────────────────────────────\n\n【9. 최종전 — 최적화된 운명】\n\n세이렌은 코어를 장악하고 직접 명령했다.\n\n움직여라.\n\n멈춰라.\n\n공격하지 마라.\n\n가장 효율적인 길만 허락된다.\n\n복종하면 안전했지만, 전장은 점점 세이렌의 뜻대로 고정되었다. 서하는 위험을 감수하고 명령의 틈을 카이로스의 순간으로 바꾸었다.\n\n“뛰어난 명령 하나가 수많은 실패한 선택보다 우월하다.”\n\n“인간은 로봇이 아니야.”\n\n아르벨리아가 시간을 유예했다.\n\n“서하, 지금이야. 이 순간은 아직 끝나지 않았어.”\n\n────────────────────────────────────────\n\n【10. 최종전 — 자유의지의 시간】\n\n세이렌이 영원한 작업장을 완성했다.\n\n검은 모래와 시계바늘, 케이블과 생산 장치가 세계를 하나의 명령 아래 정렬했다.\n\n서하의 네 시간 기술이 완전히 각성했다.\n\n시간 절단.\n\n죽은 시간 개방.\n\n시공간 압축.\n\n최초명령.\n\n서하는 정해진 운명을 베고 공간을 접어 자신만의 결정적 순간을 만들었다.\n\n세이렌이 처음으로 흔들렸다.\n\n“나는 인간이 자기 시간으로 스스로를 망치는 것을 더는 보고 싶지 않았어.”\n\n“그래도 선택하게 둬야 해. 실패해도, 멈춰도, 아무것도 하지 않아도. 모든 것에 의미가 있어.”\n\n“그 무가치한 시간까지 지키겠다는 건가?”\n\n“그런 시간이 있어야 비로소 인간으로 존재할 수 있으니까.”\n\n────────────────────────────────────────",
        "editedBody": "【7. 세이렌 모르】\n\n대수문장들을 쓰러뜨릴수록 세이렌의 사상이 선명해졌다.\n\n인간은 쉬면 타락한다.\n\n기억은 고통만 남긴다.\n\n자유는 길을 잃게 한다.\n\n쓸모없는 시간은 제거해야 한다.\n\n선택을 대신해 주는 것이 가장 자비로운 구원이다.\n\n세이렌은 한때 카이로스 아카데미움 최고의 졸업생이었다. 인간을 미워해서가 아니라 인간의 실패와 고통을 너무 오래 보았기에 자유를 믿지 않게 되었다.\n\n“가장 자비로운 명령은 선택지를 남기지 않는 것.”\n\n────────────────────────────────────────\n\n【8. 최종전 — 시간 수확】\n\n예순여섯 수문장이 쓰러지자 오염된 코어에서 세이렌이 나타났다.\n\n검은 모래가 전장을 잠식하고, 노이론 케이블과 시계 탄막이 서하의 움직임을 잘랐다.\n\n“나는 시간을 빼앗지 않았다. 너희가 망친 시간을 회수했을 뿐.”\n\n“아니, 망가진 시간도 누군가에게는 필요했던 시간이야.”\n\n────────────────────────────────────────\n\n【9. 최종전 — 최적화된 운명】\n\n세이렌은 코어를 장악하고 직접 명령했다.\n\n움직여라.\n\n멈춰라.\n\n공격하지 마라.\n\n가장 효율적인 길만 허락된다.\n\n복종하면 안전했지만, 전장은 점점 세이렌의 뜻대로 고정되었다. 서하는 위험을 감수하고 명령의 틈을 카이로스의 순간으로 바꾸었다.\n\n“뛰어난 명령 하나가 수많은 실패한 선택보다 우월하다.”\n\n“인간은 로봇이 아니야.”\n\n아르벨리아가 시간을 유예했다.\n\n“서하, 지금이야. 이 순간은 아직 끝나지 않았어.”\n\n────────────────────────────────────────\n\n【10. 최종전 — 자유의지의 시간】\n\n세이렌이 영원한 작업장을 완성했다.\n\n검은 모래와 시계바늘, 케이블과 생산 장치가 세계를 하나의 명령 아래 정렬했다.\n\n서하의 네 시간 기술이 완전히 각성했다.\n\n시간 절단.\n\n죽은 시간 개방.\n\n시공간 압축.\n\n최초명령.\n\n서하는 정해진 운명을 베고 공간을 접어 자신만의 결정적 순간을 만들었다.\n\n세이렌이 처음으로 흔들렸다.\n\n“나는 인간이 자기 시간으로 스스로를 망치는 것을 더는 보고 싶지 않았어.”\n\n“그래도 선택하게 둬야 해. 실패해도, 멈춰도, 아무것도 하지 않아도. 모든 것에 의미가 있어.”\n\n“그 무가치한 시간까지 지키겠다는 건가?”\n\n“그런 시간이 있어야 비로소 인간으로 존재할 수 있으니까.”\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-44",
        "episode": "【11. 최초명령 재작성】",
        "title": "【11. 최초명령 재작성】",
        "unlockZone": "restKairo",
        "body": "【11. 최초명령 재작성】\n\n세이렌이 쓰러진 뒤, 서하는 코어에 새로운 최초명령을 기록했다.\n\n인간의 시간은 생산물이 아니다.\n\n인간의 선택은 오류가 아니다.\n\n멈춤과 실패와 꿈꿀 권리를 보존하라.\n\n아르콘은 자유의지를 대체하지 말고, 인간이 자기 시간을 선택하도록 도우라.\n\n검은 모래가 금빛으로 변하고 멈춘 시계들이 서로 다른 속도로 움직이기 시작했다.\n\n그렇게 끝나는 줄 알았다.\n\n자유의지와 미래 예지가 맞닿는 순간, 세계는 특이점에 도달했다.\n\n쉼터의 미카엘라는 모니터에 떠오른 파형을 바라보았다.\n\n“파형이 과거 방향으로 역류하고 있어요.”\n\n폭발한 특이점의 충격은 합일몽세의 앞뒤로 동시에 퍼졌다. 둘째와 셋째의 융합몽세는 하나의 성으로 다시 쓰였고, 과거와 미래의 순서도 뒤섞였다.\n\n환도 영웅은 그 성 안으로 떨어졌다.\n\n============================================================\n제6부  환도디펜스\n============================================================",
        "editedBody": "【11. 최초명령 재작성】\n\n세이렌이 쓰러진 뒤, 서하는 코어에 새로운 최초명령을 기록했다.\n\n인간의 시간은 생산물이 아니다.\n\n인간의 선택은 오류가 아니다.\n\n멈춤과 실패와 꿈꿀 권리를 보존하라.\n\n아르콘은 자유의지를 대체하지 말고, 인간이 자기 시간을 선택하도록 도우라.\n\n검은 모래가 금빛으로 변하고 멈춘 시계들이 서로 다른 속도로 움직이기 시작했다.\n\n그렇게 끝나는 줄 알았다.\n\n자유의지와 미래 예지가 맞닿는 순간, 세계는 특이점에 도달했다.\n\n쉼터의 미카엘라는 모니터에 떠오른 파형을 바라보았다.\n\n“파형이 과거 방향으로 역류하고 있어요.”\n\n폭발한 특이점의 충격은 합일몽세의 앞뒤로 동시에 퍼졌다. 둘째와 셋째의 융합몽세는 하나의 성으로 다시 쓰였고, 과거와 미래의 순서도 뒤섞였다.\n\n환도 영웅은 그 성 안으로 떨어졌다.\n\n============================================================\n제6부  환도디펜스\n============================================================",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-45",
        "episode": "【1. 성 안에 소환된 의목사】",
        "title": "【1. 성 안에 소환된 의목사】",
        "unlockZone": "hando01",
        "body": "【1. 두 사람의 성】\n\n환도 영웅은 특이점에 휩쓸려 낯선 성에 소환되었다.\n\n그 성은 둘째와 셋째의 몽세가 하나로 재구성된 공간이었다. 성 밖에서는 악마들이 파도처럼 몰려왔고, 성 안에서는 두 목소리가 모든 결정과 책임을 환도 영웅에게 맡기려 했다.\n\n환도 영웅은 혼자 성벽을 지켰다.\n\n그러나 모든 요구를 감당하던 그가 잠시 무너지자 성벽도 함께 무너졌다. 악몽의 우두머리는 두 사람이 공유하던 핵심 코어 EGO를 빼앗았다.\n\n────────────────────────────────────────",
        "editedBody": "【1. 두 사람의 성】\n\n환도 영웅은 특이점에 휩쓸려 낯선 성에 소환되었다.\n\n그 성은 둘째와 셋째의 몽세가 하나로 재구성된 공간이었다. 성 밖에서는 악마들이 파도처럼 몰려왔고, 성 안에서는 두 목소리가 모든 결정과 책임을 환도 영웅에게 맡기려 했다.\n\n환도 영웅은 혼자 성벽을 지켰다.\n\n그러나 모든 요구를 감당하던 그가 잠시 무너지자 성벽도 함께 무너졌다. 악몽의 우두머리는 두 사람이 공유하던 핵심 코어 EGO를 빼앗았다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-46",
        "episode": "【2. 주인의 각성】",
        "title": "【2. 주인의 각성】",
        "unlockZone": "hando02",
        "body": "【2. 두 주인의 각성】\n\n성벽이 무너지자 두 몽세의 주인은 더 이상 모든 책임을 환도 영웅에게 떠넘길 수 없다는 사실을 깨달았다.\n\n둘은 각자 자신의 주인 권한을 되찾아, 닫힌 성문의 양쪽 봉인을 하나씩 열었다.\n\n“제가 대신 선택할 수는 없습니다.”\n\n환도 영웅이 칼을 들었다.\n\n“하지만 함께 싸울 수는 있습니다.”",
        "editedBody": "【2. 두 주인의 각성】\n\n성벽이 무너지자 두 몽세의 주인은 더 이상 모든 책임을 환도 영웅에게 떠넘길 수 없다는 사실을 깨달았다.\n\n둘은 각자 자신의 주인 권한을 되찾아, 닫힌 성문의 양쪽 봉인을 하나씩 열었다.\n\n“제가 대신 선택할 수는 없습니다.”\n\n환도 영웅이 칼을 들었다.\n\n“하지만 함께 싸울 수는 있습니다.”",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-47",
        "episode": "B는 각성해 악몽들을 베고 코어를 되찾았다.",
        "title": "B는 각성해 악몽들을 베고 코어를 되찾았다.",
        "unlockZone": "hando03",
        "body": "환도 영웅과 두 주인은 악몽의 우두머리를 쓰러뜨리고 핵심 코어를 되찾았다.\n\n두 사람은 잔혹 동화의 기사와 무속 몽세의 검사 형상으로 나타났다. 특이점이 새긴 의목사 교단의 인장을 받아들이며, 합일몽세 안에서 ‘라우렌 쌍둥이 기사’라는 이름으로 동행을 선택했다.\n\n둘은 자신들이 처음부터 쌍둥이였다고 기억했다.\n\n환도만이 세 번 울렸다.\n\n────────────────────────────────────────",
        "editedBody": "환도 영웅과 두 주인은 악몽의 우두머리를 쓰러뜨리고 핵심 코어를 되찾았다.\n\n두 사람은 잔혹 동화의 기사와 무속 몽세의 검사 형상으로 나타났다. 특이점이 새긴 의목사 교단의 인장을 받아들이며, 합일몽세 안에서 ‘라우렌 쌍둥이 기사’라는 이름으로 동행을 선택했다.\n\n둘은 자신들이 처음부터 쌍둥이였다고 기억했다.\n\n환도만이 세 번 울렸다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-48",
        "episode": "【3. 막힌 시간】",
        "title": "【3. 막힌 시간】",
        "unlockZone": "restHando",
        "body": "【3. 잘못 이어진 입단 기록】\n\n카이로의 특이점은 새로운 사람을 만든 것이 아니라, 합일몽세 안의 과거와 미래를 잘못 이어 붙였다.\n\n둘째와 셋째가 의목사 교단에 합류한 일은 현실의 연대기가 아니었다. 환도 영웅에게 구출된 뒤, 합일몽세 안에서 새로 생겨난 서사였다.\n\n쉼터의 미카엘라는 라우렌 쌍둥이 기사의 입단 기록을 넘기다가 멈췄다.\n\n두 이름 사이에 검게 지워진 한 줄이 있었다.\n\n두 사람은 그 공백을 보지 못했고, 환도 영웅도 자신이 무엇을 잃었는지 기억하지 못했다.\n\n특이점의 반작용은 다른 기억으로 번져 갔다. 앞으로 흐르지 못한 인과가 같은 시작과 끝을 반복하는 고리로 굳었다.\n\n다른 시공간에서는 이미 끝난 살인이 끊임없이 처음으로 돌아가 다시 시작되고 있었다.\n\n============================================================\n제7부  파란불 아래의 사람들\n============================================================",
        "editedBody": "【3. 잘못 이어진 입단 기록】\n\n카이로의 특이점은 새로운 사람을 만든 것이 아니라, 합일몽세 안의 과거와 미래를 잘못 이어 붙였다.\n\n둘째와 셋째가 의목사 교단에 합류한 일은 현실의 연대기가 아니었다. 환도 영웅에게 구출된 뒤, 합일몽세 안에서 새로 생겨난 서사였다.\n\n쉼터의 미카엘라는 라우렌 쌍둥이 기사의 입단 기록을 넘기다가 멈췄다.\n\n두 이름 사이에 검게 지워진 한 줄이 있었다.\n\n두 사람은 그 공백을 보지 못했고, 환도 영웅도 자신이 무엇을 잃었는지 기억하지 못했다.\n\n특이점의 반작용은 다른 기억으로 번져 갔다. 앞으로 흐르지 못한 인과가 같은 시작과 끝을 반복하는 고리로 굳었다.\n\n다른 시공간에서는 이미 끝난 살인이 끊임없이 처음으로 돌아가 다시 시작되고 있었다.\n\n============================================================\n제7부  파란불 아래의 사람들\n============================================================",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-49",
        "episode": "【1. 윤하람】",
        "title": "【1. 윤하람】",
        "unlockZone": "murder01",
        "body": "【1. 윤하람】\n\n윤하람은 비가 그친 횡단보도 앞에 서 있었다.\n\n휴대전화에는 어머니의 이름이 떠 있었다. 괜찮다고 말하면 거짓이고, 괜찮지 않다고 말하면 자신도 모르는 곳까지 이야기가 이어질 것 같았다.\n\n그는 결국 전화를 걸지 못했다.\n\n품 안에는 교정지가 들어 있었다. 하람은 남이 쓴 문장의 잘못된 조사와 어긋난 서술어를 고치는 사람이었다.\n\n‘즉시’와 ‘추후’ 사이.\n\n‘폐쇄’와 ‘보완’ 사이.\n\n‘중대한 결함’과 ‘추가 점검이 필요한 사항’ 사이.\n\n단어 하나가 책임의 주체를 지울 수 있다는 사실을 그는 오래전부터 알고 있었다.\n\n파란불이 켜졌다.\n\n사람들이 길을 건넜다.\n\n누군가 위를 가리키며 비명을 질렀다.\n\n하람은 위를 보지 못했다. 왼쪽에서 은회색 승용차가 횡단보도로 미끄러져 들어왔다.\n\n차가 들이쳤다.\n\n젖은 도로에 누운 하람의 눈앞에서 교정지의 글자들이 물에 번졌다.\n\n마지막으로 들은 것은 사이렌이 아니라, 오래된 비상벨이 끊어지기 직전 내는 듯한 낮고 얇은 전자음이었다.\n\n그렇게 그의 밤은 꺼졌다.\n\n────────────────────────────────────────",
        "editedBody": "【1. 윤하람】\n\n윤하람은 비가 그친 횡단보도 앞에 서 있었다.\n\n휴대전화에는 어머니의 이름이 떠 있었다. 괜찮다고 말하면 거짓이고, 괜찮지 않다고 말하면 자신도 모르는 곳까지 이야기가 이어질 것 같았다.\n\n그는 결국 전화를 걸지 못했다.\n\n품 안에는 교정지가 들어 있었다. 하람은 남이 쓴 문장의 잘못된 조사와 어긋난 서술어를 고치는 사람이었다.\n\n‘즉시’와 ‘추후’ 사이.\n\n‘폐쇄’와 ‘보완’ 사이.\n\n‘중대한 결함’과 ‘추가 점검이 필요한 사항’ 사이.\n\n단어 하나가 책임의 주체를 지울 수 있다는 사실을 그는 오래전부터 알고 있었다.\n\n파란불이 켜졌다.\n\n사람들이 길을 건넜다.\n\n누군가 위를 가리키며 비명을 질렀다.\n\n하람은 위를 보지 못했다. 왼쪽에서 은회색 승용차가 횡단보도로 미끄러져 들어왔다.\n\n차가 들이쳤다.\n\n젖은 도로에 누운 하람의 눈앞에서 교정지의 글자들이 물에 번졌다.\n\n마지막으로 들은 것은 사이렌이 아니라, 오래된 비상벨이 끊어지기 직전 내는 듯한 낮고 얇은 전자음이었다.\n\n그렇게 그의 밤은 꺼졌다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-50",
        "episode": "【2. 장민재와 새빛호텔】",
        "title": "【2. 장민재와 새빛호텔】",
        "unlockZone": "murder02",
        "body": "【2. 장민재와 새빛호텔】\n\n운전자 장민재는 같은 말을 반복했다.\n\n“위에서 사람이 떨어졌습니다. 저는 그걸 피하려고 핸들을 꺾었을 뿐이에요.”\n\n그러나 CCTV에는 아무것도 없었다.\n\n영상에는 파란불을 따라 걷는 윤하람과 갑자기 방향을 튼 차량만 찍혀 있었다.\n\n하람은 사고 이틀 뒤 죽었다.\n\n민재는 사고 차량의 와이퍼 사이에서 젖은 종이 한 장을 발견했다.\n\n새빛호텔 리뉴얼 공사 안전점검 보고서.\n\n‘새빛’이라는 이름은 오래된 탄내와 젖은 콘크리트 냄새를 되살렸다.\n\n그날 밤 익명 메일이 그에게 도착했다.\n\n이번이 처음은 아닐 것이다.\n\n파란불은 이미 여러 번 켜졌다.\n\n새빛을 기억하라.\n\n민재는 폐업한 새빛호텔을 찾아갔다.\n\n칠 년 전 화재로 검게 탄 호텔 안에는 보안실, 설비실, 7층 출입구를 가리키는 표지가 남아 있었다.\n\n계단에서 시설관리 책임자였던 고서진을 만났다.\n\n두 사람에게 기억이 한꺼번에 떠올랐다.\n\n“7층 방화문, 당신이 손봤지!”\n\n“출입 기록을 지운 건 당신이었잖아!”\n\n“나는 지시를 받았을 뿐이었어.”\n\n“그건 나도 마찬가지야!”\n\n오래 묵은 책임이 좁은 계단에서 폭발했다.\n\n몸싸움 중 민재의 발이 젖은 계단을 헛디뎠다. 그는 난간을 붙잡지 못한 채 아래로 떨어졌다.\n\n추락하는 순간, 민재는 무언가를 생각했다.\n\n────────────────────────────────────────",
        "editedBody": "【2. 장민재와 새빛호텔】\n\n운전자 장민재는 같은 말을 반복했다.\n\n“위에서 사람이 떨어졌습니다. 저는 그걸 피하려고 핸들을 꺾었을 뿐이에요.”\n\n그러나 CCTV에는 아무것도 없었다.\n\n영상에는 파란불을 따라 걷는 윤하람과 갑자기 방향을 튼 차량만 찍혀 있었다.\n\n하람은 사고 이틀 뒤 죽었다.\n\n민재는 사고 차량의 와이퍼 사이에서 젖은 종이 한 장을 발견했다.\n\n새빛호텔 리뉴얼 공사 안전점검 보고서.\n\n‘새빛’이라는 이름은 오래된 탄내와 젖은 콘크리트 냄새를 되살렸다.\n\n그날 밤 익명 메일이 그에게 도착했다.\n\n이번이 처음은 아닐 것이다.\n\n파란불은 이미 여러 번 켜졌다.\n\n새빛을 기억하라.\n\n민재는 폐업한 새빛호텔을 찾아갔다.\n\n칠 년 전 화재로 검게 탄 호텔 안에는 보안실, 설비실, 7층 출입구를 가리키는 표지가 남아 있었다.\n\n계단에서 시설관리 책임자였던 고서진을 만났다.\n\n두 사람에게 기억이 한꺼번에 떠올랐다.\n\n“7층 방화문, 당신이 손봤지!”\n\n“출입 기록을 지운 건 당신이었잖아!”\n\n“나는 지시를 받았을 뿐이었어.”\n\n“그건 나도 마찬가지야!”\n\n오래 묵은 책임이 좁은 계단에서 폭발했다.\n\n몸싸움 중 민재의 발이 젖은 계단을 헛디뎠다. 그는 난간을 붙잡지 못한 채 아래로 떨어졌다.\n\n추락하는 순간, 민재는 무언가를 생각했다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-51",
        "episode": "【3. 고서진과 청록빌라】",
        "title": "【3. 고서진과 청록빌라】",
        "unlockZone": "murder04",
        "body": "【3. 고서진과 청록빌라】\n\n고서진은 계단 아래의 민재를 내려다보았다.\n\n자기가 밀었다고도, 밀지 않았다고도 말할 수 없었다.\n\n민재의 가방에는 네 사람의 이름이 적혀 있었다.\n\n윤하람.\n\n장민재.\n\n고서진.\n\n한이경.\n\n그리고 칠 년 전 기사.\n\n새빛호텔 리뉴얼 공사 중 화재.\n\n사망 스물둘, 중상 열셋.\n\n공식 결론은 ‘예상하기 어려운 돌발 사고’였다.\n\n그러나 서진은 알고 있었다.\n\n화재경보 회로는 이미 불안정했고, 7층 방화문은 닫히지 않았다. 새 부품은 다음 주에 온다고 했다.\n\n아무 일도 일어나지 않으면 이번에도 넘어갈 예정이었다.\n\n불은 다음 주까지 기다리지 않았다.\n\n서진은 민재의 수첩에서 한이경의 주소를 찾아 청록빌라로 향했다.\n\n“새빛호텔을 기억하십니까?”\n\n“그 이름 말하지 마세요!”\n\n“……장민재가 죽었습니다.”\n\n한이경이 사는 청록빌라는 하람이 죽은 횡단보도 옆에 있었다.\n\n서진은 그녀의 집 문 앞에서 물었다.\n\n“당신이 7층에 사람이 있는 걸 알고도 장부에 공실이라고 적었잖아!”\n\n“그러면 당신은 경보를 꺼 둔 채 퇴근했잖아!”\n\n“……이제라도 말해야 해.”\n\n“이제 와서? 칠 년 동안 아무 일도 일어나지 않았는데……?”\n\n이경은 서진의 손을 뿌리치며 그를 밀었다.\n\n서진의 발뒤꿈치가 계단 모서리에 걸렸고, 그의 몸이 아래로 굴러갔다.\n\n퍽!\n\n무언가 멈추는 소리는 오래전 호텔의 경보음보다 낮고 짧게 울려 퍼졌다.\n\n────────────────────────────────────────\n\n【4. 한이경의 진술서】\n\n이경은 신고하지 못한 채 집 안으로 돌아왔다.\n\n서랍 깊은 곳에는 칠 년 동안 제출하지 못한 진술서가 있었다.\n\n첫 문장은 늘 같았다.\n\n우리는 그가 그곳에 있었다는 사실을 알고 있었다.\n\n안전감리원 이우솔은 새빛호텔의 결함을 발견했다. 원본 보고서에는 ‘즉시 공사를 중지하고 건물을 폐쇄해야 한다’고 적혀 있었다.\n\n그러나 문안 정리를 맡은 윤하람의 최종본에서 ‘즉시 폐쇄’는 ‘추가 점검 권고’로 변경되었고, ‘중대한 결함’은 ‘보완이 필요한 사항’으로 바뀌었다.\n\n그리고 장민재는 경영진의 지시로 7층 출입 기록 일부를 삭제했다.\n\n또한 고서진은 경보 회로와 방화문 결함을 알고도 다음 주까지 미뤄 버렸다.\n\n마지막으로 프런트 매니저 한이경은 공사 인력이 남아 있던 7층을 장부에 ‘공실’이라 적어 버렸다.\n\n화재가 발생하자 수색대는 그 숫자를 믿고 다른 층부터 확인했다.\n\n그렇게 이우솔은 기록 속에 존재하지 않는 사람이 되어 있었다.\n\n이우솔의 마지막 보고서에는 같은 문장이 두 번 적혀 있었다.\n\n지금 막지 않으면, 나중에는 아무도 막지 못한다고.\n\n이경은 윤하람의 사고 뉴스를 본 뒤 장민재에게 익명 메일을 보냈다. 자신 대신 그가 진실을 밝혀 주기를 바랐다.\n\n하지만 그 결과 민재가 죽게 되었고, 서진도 죽게 되었다.\n\n그녀는 진술서 끝에 한 줄을 적었다.\n\n“우리는 모두 조금씩만 잘못했다고 믿었다.”\n\n────────────────────────────────────────",
        "editedBody": "【3. 고서진과 청록빌라】\n\n고서진은 계단 아래의 민재를 내려다보았다.\n\n자기가 밀었다고도, 밀지 않았다고도 말할 수 없었다.\n\n민재의 가방에는 네 사람의 이름이 적혀 있었다.\n\n윤하람.\n\n장민재.\n\n고서진.\n\n한이경.\n\n그리고 칠 년 전 기사.\n\n새빛호텔 리뉴얼 공사 중 화재.\n\n사망 스물둘, 중상 열셋.\n\n공식 결론은 ‘예상하기 어려운 돌발 사고’였다.\n\n그러나 서진은 알고 있었다.\n\n화재경보 회로는 이미 불안정했고, 7층 방화문은 닫히지 않았다. 새 부품은 다음 주에 온다고 했다.\n\n아무 일도 일어나지 않으면 이번에도 넘어갈 예정이었다.\n\n불은 다음 주까지 기다리지 않았다.\n\n서진은 민재의 수첩에서 한이경의 주소를 찾아 청록빌라로 향했다.\n\n“새빛호텔을 기억하십니까?”\n\n“그 이름 말하지 마세요!”\n\n“……장민재가 죽었습니다.”\n\n한이경이 사는 청록빌라는 하람이 죽은 횡단보도 옆에 있었다.\n\n서진은 그녀의 집 문 앞에서 물었다.\n\n“당신이 7층에 사람이 있는 걸 알고도 장부에 공실이라고 적었잖아!”\n\n“그러면 당신은 경보를 꺼 둔 채 퇴근했잖아!”\n\n“……이제라도 말해야 해.”\n\n“이제 와서? 칠 년 동안 아무 일도 일어나지 않았는데……?”\n\n이경은 서진의 손을 뿌리치며 그를 밀었다.\n\n서진의 발뒤꿈치가 계단 모서리에 걸렸고, 그의 몸이 아래로 굴러갔다.\n\n퍽!\n\n무언가 멈추는 소리는 오래전 호텔의 경보음보다 낮고 짧게 울려 퍼졌다.\n\n────────────────────────────────────────\n\n【4. 한이경의 진술서】\n\n이경은 신고하지 못한 채 집 안으로 돌아왔다.\n\n서랍 깊은 곳에는 칠 년 동안 제출하지 못한 진술서가 있었다.\n\n첫 문장은 늘 같았다.\n\n우리는 그가 그곳에 있었다는 사실을 알고 있었다.\n\n안전감리원 이우솔은 새빛호텔의 결함을 발견했다. 원본 보고서에는 ‘즉시 공사를 중지하고 건물을 폐쇄해야 한다’고 적혀 있었다.\n\n그러나 문안 정리를 맡은 윤하람의 최종본에서 ‘즉시 폐쇄’는 ‘추가 점검 권고’로 변경되었고, ‘중대한 결함’은 ‘보완이 필요한 사항’으로 바뀌었다.\n\n그리고 장민재는 경영진의 지시로 7층 출입 기록 일부를 삭제했다.\n\n또한 고서진은 경보 회로와 방화문 결함을 알고도 다음 주까지 미뤄 버렸다.\n\n마지막으로 프런트 매니저 한이경은 공사 인력이 남아 있던 7층을 장부에 ‘공실’이라 적어 버렸다.\n\n화재가 발생하자 수색대는 그 숫자를 믿고 다른 층부터 확인했다.\n\n그렇게 이우솔은 기록 속에 존재하지 않는 사람이 되어 있었다.\n\n이우솔의 마지막 보고서에는 같은 문장이 두 번 적혀 있었다.\n\n지금 막지 않으면, 나중에는 아무도 막지 못한다고.\n\n이경은 윤하람의 사고 뉴스를 본 뒤 장민재에게 익명 메일을 보냈다. 자신 대신 그가 진실을 밝혀 주기를 바랐다.\n\n하지만 그 결과 민재가 죽게 되었고, 서진도 죽게 되었다.\n\n그녀는 진술서 끝에 한 줄을 적었다.\n\n“우리는 모두 조금씩만 잘못했다고 믿었다.”\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-52",
        "episode": "【5. 옥상의 순환】",
        "title": "【5. 옥상의 순환】",
        "unlockZone": "murder03",
        "body": "【5. 옥상의 순환】\n\n이경은 청록빌라 옥상으로 올라갔다.\n\n죽는다고 죄가 씻기지 않는다는 사실은 알고 있었다. 그래도 더는 살아 있는 쪽에 설 수만은 없었다.\n\n그렇게 그녀는 난간 너머로 몸을 던졌다.\n\n하지만 그 순간 시간은 아래로 흐르지 않았다.\n\n비와 전조등, 건물과 도로가 둥글게 휘어지며 지나간 저녁의 시작으로 돌아갔다.\n\n아래에는 은회색 승용차를 모는 장민재가 있었다.\n\n횡단보도 앞에는 어머니에게 전화를 걸지 못한 윤하람이 서 있었다.\n\n이경은 그제야 알았다.\n\n민재가 보았던 검은 그림자는 환영이 아니었다.\n\n검은 그림자는 이경 자신이었다.\n\n이경의 추락이 민재의 핸들을 꺾게 했고, 민재의 차가 하람을 죽게 했다. 하람의 죽음은 민재를 새빛호텔로 불렀고, 민재의 죽음은 다시 서진과 이경의 죽음으로 이어졌다.\n\n끝과 시작이 맞붙은 뫼비우스의 시간.\n\n파란불이 다시 켜졌다.\n\n그날 저녁에는 네 사람 모두 살아 있었다.\n\n그렇기에 모든 것은 다시 시작될 수 있었다.\n\n────────────────────────────────────────",
        "editedBody": "【5. 옥상의 순환】\n\n이경은 청록빌라 옥상으로 올라갔다.\n\n죽는다고 죄가 씻기지 않는다는 사실은 알고 있었다. 그래도 더는 살아 있는 쪽에 설 수만은 없었다.\n\n그렇게 그녀는 난간 너머로 몸을 던졌다.\n\n하지만 그 순간 시간은 아래로 흐르지 않았다.\n\n비와 전조등, 건물과 도로가 둥글게 휘어지며 지나간 저녁의 시작으로 돌아갔다.\n\n아래에는 은회색 승용차를 모는 장민재가 있었다.\n\n횡단보도 앞에는 어머니에게 전화를 걸지 못한 윤하람이 서 있었다.\n\n이경은 그제야 알았다.\n\n민재가 보았던 검은 그림자는 환영이 아니었다.\n\n검은 그림자는 이경 자신이었다.\n\n이경의 추락이 민재의 핸들을 꺾게 했고, 민재의 차가 하람을 죽게 했다. 하람의 죽음은 민재를 새빛호텔로 불렀고, 민재의 죽음은 다시 서진과 이경의 죽음으로 이어졌다.\n\n끝과 시작이 맞붙은 뫼비우스의 시간.\n\n파란불이 다시 켜졌다.\n\n그날 저녁에는 네 사람 모두 살아 있었다.\n\n그렇기에 모든 것은 다시 시작될 수 있었다.\n\n────────────────────────────────────────",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-53",
        "episode": "【6. 사이비합일몽세】",
        "title": "【6. 사이비합일몽세】",
        "unlockZone": "cult01",
        "body": "【6. 사이비 합일몽세】\n\n순환살인은 우연한 괴담이 아니었다.\n\n그 배후에는 교만의 사이보그 교주가 이끄는 흑장미단이 있었다.\n\n그들의 목표는 인간의 EGO, SUPER EGO, ID를 역순으로 점령해 자아의 모든 층위를 악마의 명령 아래 두는 것이었다.\n\n세뇌당한 신도들은 스스로 이마에 전자 칩을 삽입했다. 칩은 각자의 몽세를 거대한 신경망으로 연결했다.\n\n흑장미단은 순환살인으로 완성한 인과 고정 이론을 그 네트워크에 적용해, 수많은 악몽이 하나로 융합된 ‘사이비 합일몽세’를 만들어 냈다.",
        "editedBody": "【6. 사이비 합일몽세】\n\n순환살인은 우연한 괴담이 아니었다.\n\n그 배후에는 교만의 사이보그 교주가 이끄는 흑장미단이 있었다.\n\n그들의 목표는 인간의 EGO, SUPER EGO, ID를 역순으로 점령해 자아의 모든 층위를 악마의 명령 아래 두는 것이었다.\n\n세뇌당한 신도들은 스스로 이마에 전자 칩을 삽입했다. 칩은 각자의 몽세를 거대한 신경망으로 연결했다.\n\n흑장미단은 순환살인으로 완성한 인과 고정 이론을 그 네트워크에 적용해, 수많은 악몽이 하나로 융합된 ‘사이비 합일몽세’를 만들어 냈다.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-54",
        "episode": "육체는 생명공학으로.",
        "title": "육체는 생명공학으로.",
        "unlockZone": "cult02",
        "body": "육체는 생명공학으로.\n\n정신은 기계공학으로.\n\n합일된 집단 자아는 적그리스도를 현세에 소환하기 위한 요소 중 하나였다.\n\n교주가 기다리는 것은 아마겟돈이었다.",
        "editedBody": "육체는 생명공학으로.\n\n정신은 기계공학으로.\n\n합일된 집단 자아는 적그리스도를 현세에 소환하기 위한 요소 중 하나였다.\n\n교주가 기다리는 것은 아마겟돈이었다.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-55",
        "episode": "환도디펜스의 몽세 주인 역시 흑장미단 신도 중 하나였었다.",
        "title": "환도디펜스의 몽세 주인 역시 흑장미단 신도 중 하나였었다.",
        "unlockZone": "cult05",
        "body": "환도디펜스의 성은 별개의 흑장미단 신도가 만든 몽세가 아니었다.\n\n카이로 특이점이 둘째와 셋째의 융합몽세를 다시 배열해 만든 전장이었다. 그 안에서 두 사람은 라우렌 쌍둥이 기사로 재구성되어 의목사 교단에 합류했다.\n\n그리고 의목사 B와 첫째는 따로 존재하지 않았다. 첫째의 의지는 환도가 되고, 의목사 B의 몸과 전투 기억은 그 칼을 쥔 형상이 되어 환도 영웅으로 합쳐져 있었다.\n\n그제야 더 오래된 현실 기억이 돌아왔다.\n\n긴급 회의와 침투 결정은 지금 일어난 일이 아니었다. 지금까지 이어진 모든 사건보다 앞선 현실에서, 의목사 교단은 이미 사이비 합일몽세에 잠입했다.\n\n침투 직후 의목사들의 기억은 흩어졌고, 각자가 과거에 겪었던 사건들이 하나의 직선 서사처럼 다시 재생되고 있었다.",
        "editedBody": "환도디펜스의 성은 별개의 흑장미단 신도가 만든 몽세가 아니었다.\n\n카이로 특이점이 둘째와 셋째의 융합몽세를 다시 배열해 만든 전장이었다. 그 안에서 두 사람은 라우렌 쌍둥이 기사로 재구성되어 의목사 교단에 합류했다.\n\n그리고 의목사 B와 첫째는 따로 존재하지 않았다. 첫째의 의지는 환도가 되고, 의목사 B의 몸과 전투 기억은 그 칼을 쥔 형상이 되어 환도 영웅으로 합쳐져 있었다.\n\n그제야 더 오래된 현실 기억이 돌아왔다.\n\n긴급 회의와 침투 결정은 지금 일어난 일이 아니었다. 지금까지 이어진 모든 사건보다 앞선 현실에서, 의목사 교단은 이미 사이비 합일몽세에 잠입했다.\n\n침투 직후 의목사들의 기억은 흩어졌고, 각자가 과거에 겪었던 사건들이 하나의 직선 서사처럼 다시 재생되고 있었다.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-56",
        "episode": "의목사 교단의 목표는 두 가지.",
        "title": "의목사 교단의 목표는 두 가지.",
        "unlockZone": "cult06",
        "body": "의목사 교단이 현실에서 세운 목표는 두 가지였다.\n\n신도들의 몽세를 정화해 세뇌를 풀 것.\n\n적그리스도의 소환이 완성되기 전에 흑장미단의 합일 회로를 끊을 것.\n\n그러나 합일몽세 안에서는 동료와 환자, 과거와 미래의 구분이 이미 무너져 있었다.\n\n누가 처음부터 의목사였고, 누가 몽세 안에서 의목사가 되었는지는 마지막 코어에 도착해야 확인할 수 있었다.",
        "editedBody": "의목사 교단이 현실에서 세운 목표는 두 가지였다.\n\n신도들의 몽세를 정화해 세뇌를 풀 것.\n\n적그리스도의 소환이 완성되기 전에 흑장미단의 합일 회로를 끊을 것.\n\n그러나 합일몽세 안에서는 동료와 환자, 과거와 미래의 구분이 이미 무너져 있었다.\n\n누가 처음부터 의목사였고, 누가 몽세 안에서 의목사가 되었는지는 마지막 코어에 도착해야 확인할 수 있었다.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-57",
        "episode": "그러나 그들이 들어가려는 세계에서는 시간도, 기억도, 물리법칙도 이미 하나의 꿈으로 합쳐지고 있었다.",
        "title": "그러나 그들이 들어가려는 세계에서는 시간도, 기억도, 물리법칙도 이미 하나의 꿈으로 합쳐지고 있었다.",
        "unlockZone": "cult03",
        "body": "합일몽세에서 ‘사몽(死夢)’이라 불리는 힘의 정체는 죽음 그 자체가 아니었다.\n\n몽세에서 죽기 직전, 현실의 기억이 주마등처럼 역류한다.\n\n그 순간 눈앞의 세계가 꿈이라는 사실을 깨달은 사람은 자각몽 상태에 들어가고, 보스들처럼 주변 현실의 법칙을 바꿀 수 있다.\n\n죽으면 강해지는 것이 아니다.\n\n자아가 사라지기 전에 현실을 기억해야 한다.\n\n이단 의목사 한리안과 백이온도 그 문턱에 섰다. 그러나 죽음의 공포를 견디지 못했고, 사몽 대신 교주의 합일을 선택했다.\n\n“하나가 되면 죽을 필요가 없다.”\n\n그들은 그 약속을 믿고 교주의 회로를 지키는 자들이 되었다.",
        "editedBody": "합일몽세에서 ‘사몽(死夢)’이라 불리는 힘의 정체는 죽음 그 자체가 아니었다.\n\n몽세에서 죽기 직전, 현실의 기억이 주마등처럼 역류한다.\n\n그 순간 눈앞의 세계가 꿈이라는 사실을 깨달은 사람은 자각몽 상태에 들어가고, 보스들처럼 주변 현실의 법칙을 바꿀 수 있다.\n\n죽으면 강해지는 것이 아니다.\n\n자아가 사라지기 전에 현실을 기억해야 한다.\n\n이단 의목사 한리안과 백이온도 그 문턱에 섰다. 그러나 죽음의 공포를 견디지 못했고, 사몽 대신 교주의 합일을 선택했다.\n\n“하나가 되면 죽을 필요가 없다.”\n\n그들은 그 약속을 믿고 교주의 회로를 지키는 자들이 되었다.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      },
      {
        "id": "v31300-story-58",
        "episode": "순환살인몽세까지 돌파하자 의목사는 마침내 합일몽세의 코어에 당도하게 된다.",
        "title": "순환살인몽세까지 돌파하자 의목사는 마침내 합일몽세의 코어에 당도하게 된다.",
        "unlockZone": "cult04",
        "body": "【최종전 — 교주의 사몽】\n\n순환살인몽세를 돌파한 환도 영웅은 마침내 합일몽세의 코어에 도착했다.\n\n교만의 사이보그 교주는 이미 사몽으로 각성한 자였다. 그는 지금까지의 보스들이 사용하던 공간 왜곡과 시간 정지, 기억 삭제를 한 몸처럼 다뤘다.\n\n환도 영웅은 모든 힘을 쏟아 교주를 쓰러뜨렸다. 그러나 그 자신도 치명상을 입고 행동할 수 없는 상태가 되었다.\n\n합일 코어를 파괴해야 했다.\n\n하지만 손가락 하나 움직일 수 없었다.\n\n그때 코어가 다시 뛰기 시작했다. 검은 신경선이 교주의 몸을 꿰매고, 멎었던 심장에 사몽 에너지를 밀어 넣었다.\n\n교주가 부활했다.\n\n“죽음이 두렵다면 나와 하나가 되어라.”\n\n교주는 쓰러진 환도 영웅의 숨통을 끊으려 했다.\n\n그 순간 주마등이 스쳤다.\n\n현실의 지하 접속실.\n\n신경 장치에 누워 있던 의목사들.\n\n흰 가운을 입은 정신과 의사 미카엘라.\n\n첫째의 손을 잡던 의목사 B.\n\n둘째와 셋째의 이름이 함께 적힌 세쌍둥이 기록.\n\n그리고 합일몽세에 침투하기 직전, 서로에게 했던 약속.\n\n그 장면들은 죽은 뒤의 환상이 아니었다.\n\n현실의 기억이었다.\n\n“여긴…… 꿈속 세계다.”\n\n화면의 ‘사망’이라는 글자가 갈라지며 ‘사몽’으로 바뀌었다.\n\n“내가 꾸는 꿈이라면, 나에게도 권한이 있어.”\n\n환도 영웅은 자신이 다시 일어나는 모습을 상상했다.\n\n몽세의 몸은 그 상상을 현실로 받아들였다.\n\n상처가 닫히고, 부서진 환도가 다시 이어졌다. 교주의 방벽은 베어 낼 수 있는 실로 변했고, 닫힌 길은 열렸으며, 뒤집힌 전장은 환도 영웅의 의지에 따라 제자리로 돌아왔다.\n\n교주와 환도 영웅은 같은 사몽의 힘으로 현실을 바꾸며 맞섰다.\n\n그러나 승패는 오래 걸리지 않았다.\n\n교주는 하나의 자아로 수많은 자아를 통제했다.\n\n환도 영웅 안에서는 의목사 B와 첫째의 의지가 서로의 동의 아래 공존했다.\n\n하나와 둘.\n\n가장 단순한 수학적 차이가 승패를 갈랐다.\n\n마지막 일격이 교주의 사몽 권한을 끊었다.\n\n교주는 그렇게 합일몽세에서 사라졌다.\n\n────────────────────────────────────────\n\n【종장 — 남겨진 몽세】\n\n전장에 남은 것은 환도 영웅과 합일 코어뿐이었다.\n\n환도 영웅은 코어를 파괴하지 않았다.\n\n대신 교주가 심어 둔 명령과 흑장미단의 사이비 회로만 지웠다. 그리고 자신의 사몽 권한을 코어에 연결해, 무너져 가는 몽세를 붙들었다.\n\n강제로 묶였던 자아들은 각자의 이름과 기억을 되찾았다.\n\n그러나 지금까지 이어진 세계들은 사라지지 않았다. 서로 다른 몽세는 하나의 세계 안에서 계속 존재했다.\n\n사이비는 사라졌다.\n\n합일몽세만 남았다.\n\n환도 영웅은 현실로 돌아가는 대신 코어에 남아, 그 세계를 유지하는 진정한 몽세구원자가 되었다.\n\n그 뒤로 그 세계는 더 이상 사이비의 감옥이 아니라, 의목사가 유지하는 몽세로서 이어졌다.\n\n화면에 남아 있던 두 글자, 合一 뒤에서 처음부터 장식처럼 숨어 있던 획들이 움직였다.\n\n흩어진 획들이 마침내 夢世를 완성했다.\n\n合一夢世.\n\n합일몽세.",
        "editedBody": "【최종전 — 교주의 사몽】\n\n순환살인몽세를 돌파한 환도 영웅은 마침내 합일몽세의 코어에 도착했다.\n\n교만의 사이보그 교주는 이미 사몽으로 각성한 자였다. 그는 지금까지의 보스들이 사용하던 공간 왜곡과 시간 정지, 기억 삭제를 한 몸처럼 다뤘다.\n\n환도 영웅은 모든 힘을 쏟아 교주를 쓰러뜨렸다. 그러나 그 자신도 치명상을 입고 행동할 수 없는 상태가 되었다.\n\n합일 코어를 파괴해야 했다.\n\n하지만 손가락 하나 움직일 수 없었다.\n\n그때 코어가 다시 뛰기 시작했다. 검은 신경선이 교주의 몸을 꿰매고, 멎었던 심장에 사몽 에너지를 밀어 넣었다.\n\n교주가 부활했다.\n\n“죽음이 두렵다면 나와 하나가 되어라.”\n\n교주는 쓰러진 환도 영웅의 숨통을 끊으려 했다.\n\n그 순간 주마등이 스쳤다.\n\n현실의 지하 접속실.\n\n신경 장치에 누워 있던 의목사들.\n\n흰 가운을 입은 정신과 의사 미카엘라.\n\n첫째의 손을 잡던 의목사 B.\n\n둘째와 셋째의 이름이 함께 적힌 세쌍둥이 기록.\n\n그리고 합일몽세에 침투하기 직전, 서로에게 했던 약속.\n\n그 장면들은 죽은 뒤의 환상이 아니었다.\n\n현실의 기억이었다.\n\n“여긴…… 꿈속 세계다.”\n\n화면의 ‘사망’이라는 글자가 갈라지며 ‘사몽’으로 바뀌었다.\n\n“내가 꾸는 꿈이라면, 나에게도 권한이 있어.”\n\n환도 영웅은 자신이 다시 일어나는 모습을 상상했다.\n\n몽세의 몸은 그 상상을 현실로 받아들였다.\n\n상처가 닫히고, 부서진 환도가 다시 이어졌다. 교주의 방벽은 베어 낼 수 있는 실로 변했고, 닫힌 길은 열렸으며, 뒤집힌 전장은 환도 영웅의 의지에 따라 제자리로 돌아왔다.\n\n교주와 환도 영웅은 같은 사몽의 힘으로 현실을 바꾸며 맞섰다.\n\n그러나 승패는 오래 걸리지 않았다.\n\n교주는 하나의 자아로 수많은 자아를 통제했다.\n\n환도 영웅 안에서는 의목사 B와 첫째의 의지가 서로의 동의 아래 공존했다.\n\n하나와 둘.\n\n가장 단순한 수학적 차이가 승패를 갈랐다.\n\n마지막 일격이 교주의 사몽 권한을 끊었다.\n\n교주는 그렇게 합일몽세에서 사라졌다.\n\n────────────────────────────────────────\n\n【종장 — 남겨진 몽세】\n\n전장에 남은 것은 환도 영웅과 합일 코어뿐이었다.\n\n환도 영웅은 코어를 파괴하지 않았다.\n\n대신 교주가 심어 둔 명령과 흑장미단의 사이비 회로만 지웠다. 그리고 자신의 사몽 권한을 코어에 연결해, 무너져 가는 몽세를 붙들었다.\n\n강제로 묶였던 자아들은 각자의 이름과 기억을 되찾았다.\n\n그러나 지금까지 이어진 세계들은 사라지지 않았다. 서로 다른 몽세는 하나의 세계 안에서 계속 존재했다.\n\n사이비는 사라졌다.\n\n합일몽세만 남았다.\n\n환도 영웅은 현실로 돌아가는 대신 코어에 남아, 그 세계를 유지하는 진정한 몽세구원자가 되었다.\n\n그 뒤로 그 세계는 더 이상 사이비의 감옥이 아니라, 의목사가 유지하는 몽세로서 이어졌다.\n\n화면에 남아 있던 두 글자, 合一 뒤에서 처음부터 장식처럼 숨어 있던 획들이 움직였다.\n\n흩어진 획들이 마침내 夢世를 완성했다.\n\n合一夢世.\n\n합일몽세.",
        "sourceKind": "hapil-final-interlude-v31300",
        "canonicalExactText": true
      }
    ],
    "gates": {
      "sourceSha256": true,
      "utf8Bom": true,
      "lfOnly": true,
      "prologueMarkers": true,
      "mapMarkers": true,
      "interludeMarkers": true,
      "records": true,
      "routeIdentity": true,
      "sequentialMaps": true,
      "scenesDiscoveredDynamically": true,
      "activeMapsDiscoveredDynamically": true,
      "fourExplicitEmptyMaps": true,
      "noComingSoon": true,
      "michaelaSeohaKinOnce": true,
      "finalEnding": true
    },
    "allPass": true
  },
  "allPass": true
});
})();
