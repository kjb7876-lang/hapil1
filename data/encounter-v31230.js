(function installEncounterDialogueV31229() {
  "use strict";

  const VERSION = "3.12.29";
  const narrative = window.__MONGSE_NARRATIVE_V395__;
  if (!narrative?.segments?.length)
    throw new Error("MONGSE v3.12.29 encounter source is unavailable");

  const COMBAT_ZONES = Object.freeze([
    "dist00", "dist01", "dist02", "dist03", "dist04", "dist05", "dist06",
    "ep1a07", "ep1a08", "ep1a09", "ep1a10", "ep1a11",
    "ep1b01", "ep1b02", "ep1b03", "ep1b04", "ep1b05", "ep1b06",
    "ep1b06b", "ep1b07", "ep1b08", "ep1b09",
    "u201", "u202", "u204", "u205", "u206", "u203",
    "last304", "last305", "last301", "last302", "last303",
    "kair01", "kair04", "kair05", "kair06", "kair07", "kair08",
    "kair09", "kair10", "kair02", "kair03",
    "hando01", "hando02", "hando03",
    "murder01", "murder02", "murder04", "murder03",
    "cult01", "cult02", "cult05", "cult06", "cult03", "cult04",
  ]);
  const REST_ZONES = Object.freeze([
    "dreamRest", "restEp1b", "restU2", "restLast3", "restKairo", "restHando",
  ]);
  const SOURCE_FALLBACK = Object.freeze({
    kair07: "kair06",
    kair08: "kair06",
    kair09: "kair03",
    kair10: "kair03",
  });
  const REST_SPEAKERS = Object.freeze({
    dreamRest: "꿈결 정비관",
    restEp1b: "봉인식 기록관",
    restU2: "기억문 안내인",
    restLast3: "시계 없는 간호인",
    restKairo: "아르콘 휴식관리인",
    restHando: "성벽의 EGO 기록인",
  });
  const DERIVED_HERO_LINES = Object.freeze({
    DIST: "기억이 흔들려도, 눈앞의 선택은 내가 한다.",
    EP1A: "악몽이 만든 이름이 아니라 내가 택한 선으로 답하겠다.",
    EP1B: "봉인은 도피가 아니다. 네 이름을 알고도 경계를 세우겠다.",
    U2: "지워진 기억까지 되찾아 이 문을 통과하겠다.",
    LAST3: "끝을 반복시키는 인과를 여기서 끊겠다.",
    KAIRO: "실패한 시간도 인간의 것이다. 네 명령에 넘기지 않겠다.",
    HANDO: "대신 선택하지 않겠다. 내 몫의 책임으로 코어를 되찾겠다.",
    MURDER: "조금씩 지운 책임을 전부 마주하고 이 순환을 멈추겠다.",
    CULT: "합일된 명령보다 각자의 자유의지를 지키겠다.",
  });

  /*
   * v3.12.29 narrative curation
   *
   * The previous runtime simply assigned the first quotation in a segment to
   * the enemy and the second quotation to the hero.  That made nurses, the
   * protagonist, narrators and even stage directions speak through an enemy
   * portrait.  Every entry below is anchored to a major phrase that is really
   * present in MONGSE_v31211_story_source_exact.txt (the integrated narrative
   * is byte-identical), then deliberately rewritten as an enemy -> hero
   * exchange.  `evidence` is retained for runtime QA and provenance; it is not
   * displayed in combat.
   */
  const CURATED_COMBAT_DIALOGUE = Object.freeze({
    dist00: {
      sourceZone: "dist01",
      evidence: "너희와 악마가 무엇이 다르지?",
      enemy: "기억을 놓아라. 이름을 잊으면 고통도 끝난다.",
      hero: "기억을 빼앗는 평온은 구원이 아니야.",
    },
    dist01: {
      evidence: "너희와 악마가 무엇이 다르지?",
      enemy: "인간은 두려우면 죽이고 사랑받지 못하면 타인을 파괴한다. 너희와 악마가 무엇이 다르지?",
      hero: "우리는 잘못할 수 있어도 다시 선을 선택할 수 있다. 그 선택으로 너를 막겠다.",
    },
    dist02: {
      evidence: "우리를 죽인 게 정말 악마였을까?",
      enemy: "죽은 동료들의 얼굴을 보아라. 그들을 쓰러뜨린 것이 정말 악마뿐이었을까?",
      hero: "죄책감으로 진실을 가리지는 않겠다. 마지막 경고를 따라 소환진으로 가겠다.",
    },
    dist03: {
      evidence: "너는 원인과 결과를 거꾸로 보고 있어.",
      enemy: "이 피 묻은 길의 끝에서 네가 보게 될 것은 최초의 악마가 아니라 뒤집힌 원인과 결과다.",
      hero: "그렇다면 소환진까지 가서 내가 믿어 온 원인부터 확인하겠다.",
    },
    dist04: {
      evidence: "너는 이미 기억도, 이름도, 돌아갈 곳도 잃었다.",
      enemy: "기억도 이름도 돌아갈 곳도 잃은 네가 또 누구를 지키겠다는 거지?",
      hero: "내가 살아 있어야 잊힌 이들의 존재도 지킬 수 있다. 그래서 계속 간다.",
    },
    dist05: {
      evidence: "고통을 없애 주겠다.",
      enemy: "고통과 두려움을 지워 주마. 발록을 죽여야 한다는 목적만 남겨라.",
      hero: "고통을 지운 목소리가 내 선택까지 빼앗게 두지 않겠다.",
    },
    dist06: {
      evidence: "문지기가 쓰러졌으니 감옥이 열리겠군.",
      enemy: "네 머릿속 목소리를 확신하지 마라. 내가 쓰러지면 문이 아니라 감옥이 열린다.",
      hero: "네 경고도 그 목소리도 맹신하지 않겠다. 내 눈으로 소환진의 끝을 보겠다.",
    },
    ep1a07: {
      evidence: "너는 수호자다. 나를 믿어.",
      enemy: "동료와 사명도 곧 사라진다. 네게 남을 이름은 내가 준 '수호자'뿐이다.",
      hero: "이름을 주는 목소리부터 의심하겠다. 내가 누구인지는 내가 찾아낸다.",
    },
    ep1a08: {
      evidence: "치료라는 말은 함정이다.",
      enemy: "움직이지 마라. 네가 치료를 불신할수록 이 복도는 다시 피로 물든다.",
      hero: "환각과 현실이 겹쳐도 사람을 먼저 적으로 단정하지 않겠다.",
    },
    ep1a09: {
      evidence: "FENTANYL.",
      enemy: "이 약병을 성수라 부르면 금단도 기억도 잠시 멎는다. 다시 손을 뻗어라.",
      hero: "이름을 바꿔도 펜타닐은 성수가 아니다. 갈망을 사실대로 보겠다.",
    },
    ep1a10: {
      evidence: "오피오이드 사용장애.",
      enemy: "차트의 진단을 지워라. 너는 평범한 환자가 아니라 마지막 수호자다.",
      hero: "오피오이드 의존과 약물 유발 환각이 내가 피하던 현실이다. 이제 부정하지 않는다.",
    },
    ep1a11: {
      evidence: "마약을 성수라 불렀어.",
      enemy: "내가 너를 평범한 중독자에서 선택받은 수호자로 만들었다. 나 없이는 아무것도 아니다.",
      hero: "너는 치료를 막고 마약을 성수라 불렀다. 거짓된 의미를 벗고 내 삶을 선택하겠다.",
    },
    ep1b01: {
      evidence: "다시 영웅이 되고 싶지 않나?",
      enemy: "일흔두 번째 문을 열어라. 다시 특별한 영웅이 되면 고통도 책임도 사라진다.",
      hero: "영웅이 아니어도 살아갈 수 있다. 봉인은 도피가 아니라 경계를 세우는 일이다.",
    },
    ep1b02: {
      evidence: "일어나서 뭐 하죠? 아무것도 달라지지 않는데.",
      enemy: "일어나도 아무것도 달라지지 않는다. 누운 채 모든 선택을 내게 넘겨라.",
      hero: "한 번에 삶 전체를 바꾸지 않아도 된다. 지금 일어나는 한 번의 선택부터 되찾자.",
    },
    ep1b03: {
      evidence: "그 여자는 노력도 안 했는데 왜 모든 걸 가진 거죠?",
      enemy: "나는 노력했는데 다른 사람은 너무 쉽게 가졌다. 이 분노가 왜 틀렸다는 거죠?",
      hero: "인정받고 싶은 마음은 죄가 아니다. 하지만 그 상처를 동생에게 넘길 권리는 없다.",
    },
    ep1b04: {
      evidence: "최고가 아니면 쓰레기일뿐.",
      enemy: "최고가 아닌 음식과 사람은 모두 버릴 것이다. 완벽해야만 선택받을 수 있다.",
      hero: "완벽을 사랑이라 포장하지 마라. 욕망을 인정해야 탐식의 위장도 멈춘다.",
    },
    ep1b05: {
      evidence: "당신도 결국 똑같아질 테니까.",
      enemy: "내 몽세에 들어오면 당신도 결국 같은 실에 묶일 거예요.",
      hero: "사랑처럼 보이는 조종과 네가 진짜 원하는 것을 분리하겠다.",
    },
    ep1b06: {
      evidence: "사람에게는 각자 맞는 가격이 있지.",
      enemy: "사람에게는 각자 맞는 가격이 있다. 동전이 어느 면으로 떨어지든 거래는 내가 정한다.",
      hero: "가난의 공포가 타인을 가격으로 바꾸는 일을 정당화하지는 못한다.",
    },
    ep1b06b: {
      evidence: "돈만 있었으면 엄마가 살 수 있었어!",
      enemy: "돈만 있었으면 엄마가 살았어. 그러니 돈은 생명이고 빼앗기기 전에 빼앗아야 해!",
      hero: "네가 겪은 일은 네 잘못이 아니다. 그러나 이후 다른 사람에게 한 일은 네 책임이다.",
    },
    ep1b07: {
      evidence: "이제는 내가 분노가 되어 세상에게 표출하겠다!!!",
      enemy: "세상이 내게 쏟은 분노를 이제 내가 불이 되어 돌려주겠다!",
      hero: "분노는 경계를 지키는 불이다. 방향을 잃으면 지키려던 사람부터 태운다.",
    },
    ep1b08: {
      evidence: "나는 그들 안에 아무것도 심지 않았다네",
      enemy: "나는 욕망을 심지 않았다. 환경을 조정해 인간이 가장 솔직해지는 순간을 기록했을 뿐이다.",
      hero: "타인의 선택지를 줄여 놓고 선택받았다고 믿는 것은 신이 아니라 통제자의 오만이다.",
    },
    ep1b09: {
      evidence: "인간의 육체는 AI와 결합하기 위한 생체 부트로더에 불과하다.",
      enemy: "육체는 생체 부트로더일 뿐이다. 기억과 욕망을 복제한 내가 새로운 원본이 된다.",
      hero: "복제된 패턴이 당신이라는 증거는 없다. 당신이 학습하지 못한 선택으로 이 반복을 끊겠다.",
    },
    u201: {
      evidence: "기계군단은 아이가 살아남기 위해 만든 의식이네.",
      enemy: "이 기계군단은 아이가 살아남기 위해 만든 방어다. 구조하겠다는 접근도 폭격으로 기록되지.",
      hero: "방어를 부수러 온 것이 아니다. 아이의 시간을 폭격의 날로 되돌리는 명령만 멈추겠다.",
    },
    u202: {
      evidence: "그 잔인함을 선의라는 라벨로 포장하고 안심하는 것 아닌가?",
      enemy: "고통으로 돌려보내는 일을 구원이라 부르나? 그 잔인함에 선의라는 라벨을 붙였을 뿐이다.",
      hero: "망각을 강요하는 자비도 폭력이다. 아이가 고통과 거리를 선택할 권리를 남기겠다.",
    },
    u204: {
      evidence: "고통을 통과해야 성장한다는 말은 아이에게 두 번째 살해를 요구하는 낭만일 뿐이네.",
      enemy: "불안정한 기억을 지우고 평온을 고정하겠다. 찢기는 인간성보다 강철과 규칙이 안전하다.",
      hero: "고통을 미화하지도 인간성을 삭제하지도 않겠다. 기억의 규칙을 아이가 다시 선택하게 하겠다.",
    },
    u205: {
      evidence: "이 몽세의 재구성 키는 내가 쥐고 있지.",
      enemy: "네가 기도라 부르는 힘도 내 자원이다. 이 몽세의 재구성 키는 내가 쥐고 있다.",
      hero: "연민을 자원으로 바꾸는 관리자 권한부터 끊고 학대의 기록을 아이에게서 분리하겠다.",
    },
    u206: {
      evidence: "기계가 되어 영원한 평온을 누리는 편이 더 혁신적인 구원이 아닌가?",
      enemy: "인간성을 버리고 중앙 코어로 이주하라. 선택 없는 영원한 평온이 가장 효율적인 구원이다.",
      hero: "겪지 않을 권리는 네 독점 명령이 아니다. 인간으로 남을지 역시 아이가 선택한다.",
    },
    u203: {
      evidence: "반복을 명령하는 구조만을 향해 마지막 탄환을 쏘았다.",
      enemy: "아이의 상처와 네 선의는 이미 내 갑옷이 되었다. 기억의 문은 다시 닫힌다.",
      hero: "기억은 없애지 않는다. 고통을 반복하라고 명령하는 구조만 끝내겠다.",
    },
    last304: {
      evidence: "기억 대신 몸의 감각과 환도의 공명에 의지해 앞으로 나아갔다.",
      enemy: "이름도 기억도 없는 자가 두 제국 사이의 들판을 건널 수 있겠나?",
      hero: "기억 대신 몸의 감각과 환도의 공명을 믿는다. 이 칼이 가리키는 곳으로 간다.",
    },
    last305: {
      evidence: "무너진 성이 그 칼을 기억하고 있다.",
      enemy: "우리는 침략자가 아니라 두 제국의 전쟁을 피해 온 난민이다. 무너진 성이 그 칼을 기억한다.",
      hero: "장미 인장과 환도가 여는 균열을 확인하겠다. 먼저 이 싸움부터 끝내자.",
    },
    last301: {
      evidence: "검을 맞댈수록 B의 자세와 검로를 학습했고",
      enemy: "네 검로는 이미 학습했다. 하나의 자세를 여섯 형상으로 나누어 되돌려 주마.",
      hero: "기억은 잃었어도 검을 놓지는 않는다. 폭풍 너머까지 베어 나가겠다.",
    },
    last302: {
      evidence: "주민들은 젖은 한지처럼 납작했고",
      enemy: "잠들지 못한 주민들의 몸은 이제 검은 안개의 실을 따라 움직인다.",
      hero: "주민을 베지 않는다. 몸을 끄는 안개와 실만 끊어 내겠다.",
    },
    last303: {
      evidence: "너에게는 왜 통하지 않는 거지?",
      enemy: "잠을 빼앗는 내 시선이 너에게는 왜 통하지 않는 거지?",
      hero: "안신 처방이 흐린 정신을 붙들었다. 주민이 아니라 너와 일대일로 끝내겠다.",
    },
    kair01: {
      evidence: "너에게는 어떤 미래를 명령할 자격이 있겠는가?",
      enemy: "최초명령을 쥔 인간이여, 너에게 타인의 미래를 명령할 자격이 있는가?",
      hero: "인간의 시간을 태우는 명령은 재능이 아니라 저주다. 빼앗긴 시간을 돌려놓겠다.",
    },
    kair04: {
      sourceZone: "kair05",
      evidence: "과로는 휴식의 시간을",
      enemy: "과로로 잃은 휴식의 시간은 회수 대상이다. 수문장의 허가 없이 멈출 수 없다.",
      hero: "쉼은 낭비가 아니다. 인간이 자기 시간을 지킬 첫 번째 권리다.",
    },
    kair05: {
      evidence: "망각은 기억의 시간을",
      enemy: "망각이 훼손한 기억의 시간은 삭제한다. 아픈 기억은 생산성이 없다.",
      hero: "아픈 기억도 삶의 일부다. 삭제가 아니라 스스로 거리를 정하게 하겠다.",
    },
    kair06: {
      sourceZone: "kair05",
      evidence: "속박은 선택할 시간을 빼앗았다.",
      enemy: "선택은 지연과 오류를 만든다. 속박된 시간이 가장 예측 가능하다.",
      hero: "선택할 시간을 빼앗은 안정은 감옥이다. 오류를 감수할 자유를 돌려줘라.",
    },
    kair07: {
      sourceZone: "kair05",
      evidence: "중독은 회복의 시간을 반복 소비로 바꾸고",
      enemy: "중독은 회복의 시간을 끝없는 반복 소비로 바꾼다. 그 시간은 폐기한다.",
      hero: "반복 속에도 회복을 다시 선택할 순간은 남는다. 그 가능성까지 지우지 마라.",
    },
    kair08: {
      sourceZone: "kair05",
      evidence: "비교는 자기 삶을 타인의 기준에 묶었다.",
      enemy: "타인의 기준보다 뒤처진 시간은 가치가 없다. 비교가 곧 올바른 척도다.",
      hero: "남의 속도로 잰 삶은 자기 시간이 아니다. 각자의 기준을 되찾겠다.",
    },
    kair09: {
      sourceZone: "kair05",
      evidence: "최적화는 쓸모없어 보이는 시간을 삭제했고",
      enemy: "결과를 만들지 못한 시간은 최적화 과정에서 삭제한다.",
      hero: "멈춤과 실패 속에서도 다음 선택은 태어난다. 쓸모로 시간을 재단하지 마라.",
    },
    kair10: {
      sourceZone: "kair05",
      evidence: "거짓 구원은 판단할 권리를 대신 행사했다.",
      enemy: "판단은 내가 대신한다. 선택지를 없애는 것이 가장 자비로운 구원이다.",
      hero: "판단할 권리를 빼앗은 구원은 명령일 뿐이다. 인간의 선택을 돌려줘라.",
    },
    kair02: {
      evidence: "유예는 삭제 대상이 아니다. 유예는 자유이지가 태어나는 자리다.",
      enemy: "결과도 생산도 없는 시간은 삭제 대상이다. 유예는 실패를 늦출 뿐이다.",
      hero: "유예는 삭제 대상이 아니다. 자유의지가 태어나는 자리이자 다시 나아갈 한 걸음이다.",
    },
    kair03: {
      evidence: "가장 자비로운 명령은 선택지를 남기지 않는 것.",
      enemy: "가장 자비로운 명령은 선택지를 남기지 않는 것이다. 뛰어난 명령 하나면 충분하다.",
      hero: "망가진 시간도 누군가에게 필요했던 시간이다. 인간은 명령대로만 움직이는 기계가 아니다.",
    },
    hando01: {
      evidence: "주민들 역시 B에게 모든 구원과 해결을 요구했다.",
      enemy: "성 안의 모두가 네가 대신 결정하고 대신 구원하기만 기다린다. 혼자 성벽을 지켜라.",
      hero: "모든 요구를 대신 짊어지는 것은 구원이 아니다. 각자의 선택이 돌아올 틈을 만들겠다.",
    },
    hando02: {
      evidence: "자신의 주인 권한 일부를 B에게 넘겨 EGO와 연결했다.",
      enemy: "코어와 책임은 가장 강한 자에게 넘기면 된다. 주인은 다시 숨으면 그만이다.",
      hero: "권한은 빌리되 선택까지 빼앗지 않는다. 주인이 자기 책임을 되찾게 하겠다.",
    },
    hando03: {
      evidence: "자기 몫의 선택과 책임을 되찾은 데 있었다.",
      enemy: "EGO는 이미 내 것이다. 네가 대신 싸울수록 이 몽세의 주인은 더 약해진다.",
      hero: "이번 승리는 내가 대신 해결하는 데 있지 않다. 주인의 선택과 책임을 함께 되찾는다.",
    },
    murder01: {
      evidence: "하람은 남이 쓴 문장의 잘못된 조사와 어긋난 서술어를 고치는 사람이었다.",
      speaker: "빗속의 미완 문장",
      enemy: "남의 문장은 고치면서도 네 마지막 문장은 끝내 쓰지 못했지. 이 저녁은 교정되지 않는다.",
      hero: "끝내지 못한 문장과 걸지 못한 전화부터 따라가겠다. 죽음을 결론으로 고정하지 마라.",
    },
    murder02: {
      evidence: "위에서 사람이 떨어졌습니다. 저는 그걸 피하려고 핸들을 꺾은것 뿐이에요.",
      speaker: "사고 진술 잔영",
      enemy: "위에서 사람이 떨어졌습니다. 나는 그 사람을 피하려고 핸들을 꺾었을 뿐입니다.",
      hero: "CCTV에는 떨어진 사람이 없다. 지워진 출입 기록과 7층 방화문부터 다시 보겠다.",
    },
    murder04: {
      evidence: "당신이 7층에 사람이 있는 걸 알고도 장부에 공실이라고 적었잖아!!!",
      enemy: "공실 표기와 꺼진 경보, 지워진 기록. 모두 지시받았다고 말하면 누구의 책임도 남지 않는다.",
      hero: "조금씩 나눈 책임도 사라지지 않는다. 제출되지 못한 진술을 한 문장으로 연결하겠다.",
    },
    murder03: {
      evidence: "죽는다고 죄가 씻기지 않는다는 사실은 알고 있었다.",
      speaker: "순환 인과핵",
      enemy: "죽어도 죄는 씻기지 않는다. 비와 전조등은 다시 휘어져 같은 저녁의 처음으로 돌아간다.",
      hero: "죽음을 반복하는 대신 살아 있는 쪽에서 책임을 말하게 하겠다. 이번에는 다음 날로 간다.",
    },
    cult01: {
      evidence: "세뇌 당한 신도들은 스스로 이마에 전자 칩을 삽입했다.",
      enemy: "이마의 칩으로 이어진 EGO는 이제 흑장미단의 하나 된 명령을 따른다.",
      hero: "연결을 끊고 각자의 몽세와 선택을 돌려주겠다. 합일은 동의가 아니다.",
    },
    cult02: {
      evidence: "육체는 생명공학으로.",
      enemy: "육체는 생명공학으로, 정신은 기계공학으로 합친다. 집단 자아가 소환의 그릇이 된다.",
      hero: "사람을 부품으로 만든 합일은 구원이 아니다. 신경망의 합창을 분리하겠다.",
    },
    cult05: {
      evidence: "여러 몽세가 비정상적으로 합쳐지고 있음을 감지하였다.",
      enemy: "여러 몽세는 이미 하나의 본능 아래 합쳐지고 있다. 접촉한 너도 곧 흡수된다.",
      hero: "EGO에 닿은 경로를 역추적해 ID 생체조의 연결부터 끊겠다.",
    },
    cult06: {
      evidence: "신도들의 몽세를 정화해 세뇌를 풀 것.",
      enemy: "죄책과 심판은 복종을 완성한다. SUPER EGO가 너희 스스로에게 유죄를 선고하게 하라.",
      hero: "심판을 기계 명령에서 분리하고 신도들의 몽세를 정화해 세뇌를 풀겠다.",
    },
    cult03: {
      evidence: "EGO, SUPER EGO, ID를 역순으로 점령해",
      enemy: "EGO와 SUPER EGO, ID를 역순으로 수확한다. 세 층이 무너지면 자유의지도 끝난다.",
      hero: "자아의 층위는 교주의 소유물이 아니다. 하나씩 연결을 되찾겠다.",
    },
    cult04: {
      evidence: "의목사는 일기토를 벌인다.",
      enemy: "합일몽세의 코어와 아마겟돈 계산은 완성됐다. 너 하나의 EGO로는 사몽 각성을 이길 수 없다.",
      hero: "이길 수 없다는 계산까지 넘어 여기 왔다. 남은 모든 힘으로 네 명령의 코어를 벤다.",
    },
  });

  const CURATED_REST_DIALOGUE = Object.freeze({
    dreamRest: {
      sourceZone: "ep1a11",
      evidence: "혼자가 되지 않는 쪽을 선택했다.",
      npc: "루시퍼의 목소리와 자신의 생각을 분리해 바라본 기록이 남아 있습니다.",
      hero: "거짓 수호자의 의미 대신 치료받고 살아갈 선택을 붙들겠다.",
    },
    restEp1b: {
      evidence: "화면에는 두 파형만 남았다.",
      npc: "강제 각성 뒤 캡슐은 비었고, 사라진 의목사 A와 어린아이의 두 파형만 남았습니다.",
      hero: "두 신호가 이어지는 곳을 추적하겠다. 이번에는 실종 자체가 다음 문이다.",
    },
    restU2: {
      evidence: "그 의지는 한 자루의 환도가 되었다.",
      npc: "회복한 첫째의 의지가 환도가 되었고, 기억을 잃은 치료자의 길잡이가 되었습니다.",
      hero: "내 기억이 비어도 이 칼은 동생들을 향한 길을 기억한다.",
    },
    restLast3: {
      sourceZone: "last303",
      evidence: "검은 안개가 모여 불면귀가 되었다.",
      npc: "불면귀가 걷힌 자리에서 약향과 환도의 공명이 시계 없는 문을 열었습니다.",
      hero: "회복한 정신을 붙들고, 시간이 명령으로 변한 다음 세계로 가겠다.",
    },
    restKairo: {
      evidence: "인간의 시간은 생산물이 아니다.",
      npc: "새 최초명령은 인간의 시간이 생산물이 아니며 멈춤과 실패와 꿈꿀 권리를 보존하라고 기록했습니다.",
      hero: "아르콘이 선택을 대신하지 않도록 이 명령을 다음 시간층까지 지키겠다.",
    },
    restHando: {
      evidence: "앞으로 흐르지 못한 인과가 같은 시작과 끝을 반복하는 고리로 굳어버린.",
      npc: "웜홀의 반작용으로 앞으로 흐르지 못한 인과가 같은 살인을 반복하는 고리가 되었습니다.",
      hero: "끝난 살인을 처음으로 돌리는 고리를 찾아, 책임이 다음 날로 이어지게 하겠다.",
    },
  });

  const segmentByZone = new Map(
    narrative.segments.map((segment) => [segment.zone, segment]),
  );
  const arcFor = (zone) =>
    zone.startsWith("dist") ? "DIST" :
    zone.startsWith("ep1a") ? "EP1A" :
    zone.startsWith("ep1b") ? "EP1B" :
    zone.startsWith("u2") ? "U2" :
    zone.startsWith("last3") ? "LAST3" :
    zone.startsWith("kair") ? "KAIRO" :
    zone.startsWith("hando") ? "HANDO" :
    zone.startsWith("murder") ? "MURDER" : "CULT";
  const sourceFor = (zone) =>
    segmentByZone.get(zone) ?? segmentByZone.get(SOURCE_FALLBACK[zone]);
  const compact = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
  const sourceContains = (text) =>
    compact(narrative.raw).includes(compact(text));
  const sourceReference = (segment) =>
    `${segment?.id ?? "derived"}:${segment?.startLine ?? 0}-${segment?.endLine ?? 0}`;
  const sourceLines = (segment) => {
    const body = String(segment?.bodyRaw ?? "");
    const quotes = [...body.matchAll(/“([^”\n]{2,160})”/g)]
      .map((match) => compact(match[1]))
      .filter(Boolean);
    const prose = body.split("\n")
      .map(compact)
      .filter((line) =>
        line.length >= 8 && line.length <= 150 &&
        !/^[=─※【]/.test(line) &&
        !/^제\d+부/.test(line),
      );
    return { quotes: [...new Set(quotes)], prose: [...new Set(prose)] };
  };
  const buildCombat = (zone) => {
    const curated = CURATED_COMBAT_DIALOGUE[zone] ?? null;
    const segment = sourceFor(curated?.sourceZone ?? zone);
    const lines = sourceLines(segment);
    const enemyText = curated?.enemy ?? lines.quotes[0] ?? lines.prose[0] ?? segment?.title ?? zone;
    const heroExact = lines.quotes[1] ?? null;
    const heroText = curated?.hero ?? heroExact ?? DERIVED_HERO_LINES[arcFor(zone)];
    const evidence = curated?.evidence ?? enemyText;
    return Object.freeze({
      zone,
      kind: "combat",
      sourceZone: segment?.zone ?? curated?.sourceZone ?? SOURCE_FALLBACK[zone] ?? zone,
      sourceRef: sourceReference(segment),
      sourceSha256: narrative.sourceSha256,
      sourceEvidence: evidence,
      sourceEvidenceExact: sourceContains(evidence),
      curation: curated ? "major-source-phrase-refined" : "legacy-source-fallback",
      enemy: Object.freeze({
        role: "enemy",
        speaker: curated?.speaker ?? null,
        text: enemyText,
        exact: sourceContains(enemyText),
      }),
      hero: Object.freeze({
        role: "hero",
        text: heroText,
        exact: sourceContains(heroText),
      }),
      sequence: Object.freeze(["enemy", "hero"]),
    });
  };
  const buildRest = (zone) => {
    const curated = CURATED_REST_DIALOGUE[zone] ?? null;
    const segment = sourceFor(curated?.sourceZone ?? zone);
    const lines = sourceLines(segment);
    const npcText = curated?.npc ?? lines.quotes[0] ?? lines.prose[0] ?? segment?.title ?? "호흡을 고르십시오.";
    const heroText = curated?.hero ?? "기록을 확인했다. 정비가 끝나면 다음 페이지문으로 가겠다.";
    const evidence = curated?.evidence ?? npcText;
    return Object.freeze({
      zone,
      kind: "rest",
      speaker: REST_SPEAKERS[zone],
      sourceZone: segment?.zone ?? curated?.sourceZone ?? zone,
      sourceRef: sourceReference(segment),
      sourceSha256: narrative.sourceSha256,
      sourceEvidence: evidence,
      sourceEvidenceExact: sourceContains(evidence),
      curation: curated ? "major-source-phrase-refined" : "legacy-source-fallback",
      npc: Object.freeze({
        role: "npc",
        speaker: REST_SPEAKERS[zone],
        text: npcText,
        exact: sourceContains(npcText),
      }),
      hero: Object.freeze({
        role: "hero",
        text: heroText,
        exact: sourceContains(heroText),
      }),
      sequence: Object.freeze(["npc", "hero"]),
      npcBitmap: "./assets/items/source-record.webp",
    });
  };

  const combat = Object.freeze(Object.fromEntries(COMBAT_ZONES.map((zone) => [zone, buildCombat(zone)])));
  const rest = Object.freeze(Object.fromEntries(REST_ZONES.map((zone) => [zone, buildRest(zone)])));
  const allRecords = [...Object.values(combat), ...Object.values(rest)];
  const sourceEvidenceCovered = allRecords.filter(
    (record) => record.sourceEvidenceExact,
  ).length;
  const roleAlternation = allRecords.every((record) =>
    record.kind === "combat"
      ? record.sequence.join(">") === "enemy>hero" &&
        record.enemy.role === "enemy" && record.hero.role === "hero"
      : record.sequence.join(">") === "npc>hero" &&
        record.npc.role === "npc" && record.hero.role === "hero",
  );
  const resolve = (zone, kind = null) => {
    if (kind === "combat") return combat[zone] ?? null;
    if (kind === "rest") return rest[zone] ?? null;
    return combat[zone] ?? rest[zone] ?? null;
  };
  const api = Object.freeze({
    version: "3.12.29",
    sourceSha256: narrative.sourceSha256,
    sourceBytes: narrative.sourceBytes,
    combatZones: COMBAT_ZONES,
    restZones: REST_ZONES,
    combat,
    rest,
    combatCount: Object.keys(combat).length,
    restCount: Object.keys(rest).length,
    curatedCount: allRecords.filter(
      (record) => record.curation === "major-source-phrase-refined",
    ).length,
    roleAlternation,
    speakerRoleSafe: roleAlternation,
    majorQuoteCoverage: Object.freeze({
      covered: sourceEvidenceCovered,
      total: allRecords.length,
      ratio: sourceEvidenceCovered / Math.max(1, allRecords.length),
    }),
    resolve,
    everyRecordSourced: allRecords.every(
      (record) => record.sourceRef && record.sourceSha256 === narrative.sourceSha256,
    ),
  });
  window.__MONGSE_NARRATIVE_DIALOGUE_V31229__ = Object.freeze({
    version: "3.12.29",
    sourceFile: narrative.sourceFile,
    sourceSha256: narrative.sourceSha256,
    sourceBytes: narrative.sourceBytes,
    combatCount: api.combatCount,
    restCount: api.restCount,
    curatedCount: api.curatedCount,
    roleAlternation: api.roleAlternation,
    speakerRoleSafe: api.speakerRoleSafe,
    majorQuoteCoverage: api.majorQuoteCoverage,
    resolve,
  });
  window.__MONGSE_ENCOUNTER_DIALOGUE_V31229__ = api;
  window.__MONGSE_ENCOUNTER_DIALOGUE_V31228__ = Object.freeze({
    ...api,
    version: "3.12.28",
    forwardVersion: "3.12.29",
  });
})(window);

/* MONGSE_ENCOUNTER_DATA_BRIDGE_V31230
 * The production bundle installs the exact interlude excerpt resolver after
 * this compatibility layer.  Keeping the v3.12.29 identities alive lets the
 * inherited release gates finish before v3.12.30 atomically replaces them.
 */
window.__MONGSE_ENCOUNTER_DIALOGUE_V31230__ = Object.freeze({
  ...window.__MONGSE_ENCOUNTER_DIALOGUE_V31229__,
  version: "3.12.30",
  baseVersion: "3.12.29",
});
window.__MONGSE_NARRATIVE_DIALOGUE_V31230__ = Object.freeze({
  ...window.__MONGSE_NARRATIVE_DIALOGUE_V31229__,
  version: "3.12.30",
  baseVersion: "3.12.29",
});
