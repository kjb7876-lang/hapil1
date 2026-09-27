(() => {
  'use strict';

  const text = {
    opening: [
      '나에 대해서 대부분이 기억이 나지 않는다. 과거를 더듬을 때마다 깨진 유리 같은 장면만 번뜩였다가 사라지고는 할뿐이다.',
      '그래도 몇가지 기억은 가지고 있다.',
      '나는 악마가 점령한 세계에 남은 마지막 수호자라는것...!',
      '자아를 잃지 않은 유일한 에고(Ego).',
      '세상은 본래 천사들이 관리했었다. 그러나 어느 날, 궁전 정원 한가운데에 악마화 나무가 자라기 시작했다. 악마화 나무는 이내 성 전체를 물들이고 천사들을 악마로 타락시켰다.',
      '그리고 그들은 ID(이드)라고 불리우게 된다.',
      '나무는 육체만을 빼앗지 않았다. 기억을 먹고 감정을 바꾸며, 바라보는 현실 자체를 뒤틀었다.',
      'EGO의 손에는 이름 모를 무기가 들려 있었다.',
    ],
    root: [
      '나는 악마화 나무가 천사로 형상화된 악의 근원과 치열한 전투를 벌였고, 그 결과 파편 같은 기억 만을 가지고 어떠한 장소에서 홀로 깨어나게 되었다.',
    ],
  };
  const voice = Object.freeze({
    opening: './assets/rc26/audio/opening-memory.wav',
    root: './assets/rc26/audio/root-memory.wav',
  });

  function readiness() {
    const required = [
      ['전투', window.__HAPIL_COMBAT_V31333__?.installed],
      ['보스', window.__HAPIL_BOSSES_V31334__?.installed],
      ['조작', window.__HAPIL_CONTROLS_V31329__?.installed],
      ['맵 진행', window.__HAPIL_FLOW_V31343__?.installed],
      ['맵 로딩', typeof window.__HAPIL_RECOVERY_V31369__?.prepareMap === 'function'],
      ['정본 서사', window.__HAPIL_STORY_NATIVE_RC51__?.installed],
    ];
    const missing = required.filter(([, ready]) => !ready).map(([label]) => label);
    return {ready: missing.length === 0, missing};
  }

  window.__HAPIL_STORY_RC26__ = Object.freeze({
    text,
    voice,
    // Inspect live services, not a historical release marker that can lag behind them.
    readiness: () => readiness(),
    ready: ({onProgress, timeoutMs = 12000} = {}) => new Promise(resolve => {
      const deadline = performance.now() + timeoutMs;
      let reported = '';
      const poll = () => {
        const status = readiness();
        const message = status.missing.join(' · ');
        if (message !== reported) { reported = message; onProgress?.(status); }
        if (status.ready) { resolve(true); return; }
        if (performance.now() >= deadline) { resolve(false); return; }
        setTimeout(poll, 40);
      };
      poll();
    }),
    scene(kind, nextZone = 'hub') {
      return {
        rc26Story: kind, zone: 'hub', nextZone, tone: 'void', title: '', arc: '', order: 0,
        presentationSourceZones31221: ['rc26-' + kind],
        slides: [{ id: 'rc26-' + kind, body: text[kind].join('\n'), voices: [] }],
      };
    },
  });
})();
