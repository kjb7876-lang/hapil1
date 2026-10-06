/* RC86: bind the six existing Kair Great bosses to the story Samong finale. */
(() => {
  'use strict';

  const VERSION = '3.150.01';
  const BOSSES = Object.freeze([
    Object.freeze({ id: 'kair-great-01', title: '시계 대수문장 · 되감긴 시계 고리', color: '#8ceaff', accent: '#e7fcff' }),
    Object.freeze({ id: 'kair-great-02', title: '해일 대수문장 · 역류 조수탄', color: '#8abaff', accent: '#e2f0ff' }),
    Object.freeze({ id: 'kair-great-03', title: '봉인 대수문장 · 닫히는 안전 회랑', color: '#bb98ff', accent: '#f2e8ff' }),
    Object.freeze({ id: 'kair-great-04', title: '단조 대수문장 · 회전 기어 십자', color: '#ffc875', accent: '#fff0d2' }),
    Object.freeze({ id: 'kair-great-05', title: '신경 대수문장 · 시냅스 분기', color: '#ff91d6', accent: '#ffebf7' }),
    Object.freeze({ id: 'kair-great-06', title: '시차 대수문장 · 파열 시간 격자', color: '#f3f4ff', accent: '#ffc2d0' }),
  ]);
  const APOSTATES = Object.freeze({
    'c103-mid': Object.freeze({
      hero: '한리안',
      idle: './assets/vfx/rc86/cult03-heretic-han-idle-v2.png',
      action: './assets/vfx/rc86/cult03-heretic-han-cast-v2.png',
    }),
    'c103-boss': Object.freeze({
      hero: '백이온',
      idle: './assets/vfx/rc86/cult03-heretic-baek-idle-v2.png',
      action: './assets/vfx/rc86/cult03-heretic-baek-attack-v2.png',
    }),
  });
  const FIRST_DELAY = 1.3;
  const HOME = Object.freeze({ x: 23.2, y: 10 });
  const FORMATION = Object.freeze([
    [16.5, 13.5], [21, 9], [20.5, 17.5],
    [25, 13], [24.5, 21.5], [29, 17],
  ]);
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const finiteArray = value => Array.isArray(value) ? value : [];
  const clock = state => window.__HAPIL_DANMAKU_RPG_RC88__?.summonClock(state) ?? num(state?.time);
  // A narrow desktop browser window is not a mobile device. Keep the chosen
  // encounter mode in the wave so rotation cannot change it mid-battle.
  const touchMobile = () => Boolean(
    num(window.navigator?.maxTouchPoints) > 0 &&
    window.matchMedia?.('(pointer: coarse)')?.matches === true &&
    Math.min(num(window.screen?.width, 9999), num(window.screen?.height, 9999)) <= 900
  );
  let installed = false;
  let attempts = 0;

  function cosmicAssets(bridge) {
    const result = new Set();
    const walk = value => {
      if (typeof value === 'string') {
        if (value.startsWith('./assets/')) result.add(value);
        return;
      }
      if (!value || typeof value !== 'object') return;
      for (const key of ['sprite', 'phaseSprites', 'phaseSpriteFallbacks', 'actionSprites', 'actionSpritesByPhase']) {
        const child = value[key];
        if (typeof child === 'string') walk(child);
        else if (Array.isArray(child)) for (const item of child) walk(item);
        else if (child && typeof child === 'object') {
          for (const item of Object.values(child)) {
            if (typeof item === 'string') walk(item);
            else if (Array.isArray(item)) for (const nested of item) walk(nested);
          }
        }
      }
    };
    for (const row of BOSSES) walk(bridge.templates[row.id]);
    return [...result];
  }

  function chosenApostatePose(actor, time) {
    const entry = APOSTATES[actor?.id];
    if (!entry) return null;
    const now = num(time);
    const active = Math.max(
      num(actor.castVisualUntil31210),
      num(actor.activePatternUntil),
      num(actor.attackAt),
      num(actor.recoverUntil),
      num(actor.dashingUntil),
    ) > now;
    return active ? entry.action : entry.idle;
  }

  function applyApostateArt(bridge) {
    const actors = finiteArray(bridge.apostates);
    let rebound = 0;
    for (const actor of actors) {
      const assets = APOSTATES[actor?.id];
      if (!assets) continue;
      for (const path of [assets.idle, assets.action]) {
        bridge.setSpriteMetadata(path, [0, 0, 1, 1, 0.5, 0.98]);
      }
      const actions = Object.freeze({
        idle: assets.idle,
        move: assets.idle,
        ready: assets.action,
        windup: assets.action,
        strike: assets.action,
        attackA: assets.action,
        attackB: assets.action,
        rain: assets.action,
        rift: assets.action,
        recover: assets.action,
        hit: assets.idle,
        stagger: assets.idle,
        transition: assets.action,
        death: assets.idle,
      });
      Object.assign(actor, {
        name: '이단의목사 ' + assets.hero,
        sprite: assets.idle,
        portraitV31233: assets.idle,
        sourceFacing31223: 'right',
        phaseSprites: [assets.idle, assets.idle, assets.idle],
        phaseSpriteFallbacks: [assets.idle, assets.idle, assets.idle],
        actionSprites: actions,
        actionSpritesByPhase: null,
      });
      rebound += 1;
    }
    if (rebound !== 2) return false;

    const oldPhaseSprite = bridge.phaseSprite;
    bridge.phaseSprite = function HAPIL_apostateSpriteRC86(cache, actor, time = 0) {
      const pose = chosenApostatePose(actor, time);
      if (!pose) return oldPhaseSprite.call(this, cache, actor, time);
      const idle = APOSTATES[actor.id].idle;
      return bridge.runtimeSprite(cache, pose, idle);
    };
    return true;
  }

  function enrichAssetPlan(plan, paths, zone) {
    if (!plan || typeof plan !== 'object') return plan;
    const output = { ...plan };
    for (const key of ['all', 'A', 'B', 'C', 'deferred', 'pins']) {
      output[key] = new Set(plan[key] ?? []);
    }
    for (const path of paths) {
      output.all.add(path);
      output.A.add(path);
      output.pins.add(path);
      output.B.delete(path);
      output.C.delete(path);
      output.deferred.delete(path);
    }
    if (zone === 'cult03') {
      for (const key of ['all', 'A', 'B', 'C', 'deferred', 'pins']) {
        for (const path of [...output[key]]) {
          if (/^\.\/assets\/heroes\/normalized\/(directions|actions-consistent)\/(rian|ion)-/.test(path)) output[key].delete(path);
        }
      }
      for (const path of Object.values(APOSTATES).flatMap(row => [row.idle, row.action])) {
        output.all.add(path);
        output.A.add(path);
        output.pins.add(path);
        output.B.delete(path);
        output.C.delete(path);
        output.deferred.delete(path);
      }
    }
    return output;
  }

  function addFloat(state, x, y, text, color, critical = true) {
    const id = Number.isFinite(Number(state.fxSerial)) ? state.fxSerial++ : 0;
    (state.floatTexts ??= []).push({
      id, x, y, born: num(state.time), duration: 1.35, text, color, critical,
    });
  }

  function addSummonEffect(state, profile, index, x = HOME.x, y = HOME.y) {
    const id = Number.isFinite(Number(state.fxSerial)) ? state.fxSerial++ : 0;
    (state.effects ??= []).push({
      id, kind: 'glitch', x, y, tx: x, ty: y,
      born: num(state.time), duration: 0.72, color: profile.color,
      accent: profile.accent, size: 5.2 + index * 0.3, angle: 0,
      imageOnly: false, samongCosmicSummonV386: true,
    });
  }

  function profileFor(id) {
    return BOSSES.find(row => row.id === id) ?? null;
  }

  function dispatchSignature(state, bridge, actor) {
    if (!actor || actor.samongCosmicPatternDispatchedV386 === true) return true;
    if (typeof bridge.signatureAttack !== 'function') return false;
    let attack;
    try {
      attack = bridge.signatureAttack(state, actor);
    } catch {
      return false;
    }
    if (!attack || !attack.name) return false;
    // Mobile admission caps can defer a real native signature while earlier
    // Cosmic volleys are still alive. Preserve the body and retry next beat.
    if (!(Number(attack.count) > 0)) return null;
    actor.samongCosmicPatternDispatchedV386 = true;
    actor.samongCosmicPatternNameV386 = String(attack.name);
    actor.samongCosmicPatternCountV386 = Math.max(0, Math.floor(Number(attack.count)));
    actor.samongCosmicPatternPhaseV386 = num(attack.phase, num(actor.samongCosmicPhaseV386, 1));
    actor.samongCosmicPatternAtV386 = num(state.time);
    actor.samongCosmicPatternClockV386 = clock(state);
    const activeUntil = num(state.time) + 1.8;
    actor.activePatternUntil = Math.max(num(actor.activePatternUntil), activeUntil);
    actor.castVisualUntil31210 = Math.max(num(actor.castVisualUntil31210), activeUntil);
    actor.readyAt = actor.patternReadyAt = Number.POSITIVE_INFINITY;
    const id = Number.isFinite(Number(state.fxSerial)) ? state.fxSerial++ : 0;
    (state.floatTexts ??= []).push({
      id, x: actor.x, y: actor.y - 2.3, born: num(state.time),
      duration: 1.3, text: String(attack.name),
      color: profileFor(actor.id)?.color ?? '#f3f4ff', critical: true,
    });
    return true;
  }

  function clearOwnedThreats(state, id) {
    if (!id) return false;
    const matches = row => row && (
      row.id === id && row.samongCosmicSummonV386 === true ||
      row.summonOwnerId === id || row.sourceId === id || row.ownerId === id ||
      row.sourceBossId === id || row.summonSourceId === id
    );
    for (const key of [
      'hostileProjectiles', 'pendingHits', 'impactQueue', 'pendingStrikes',
      'narrativeCasts', 'telekineticCasts', 'spatialRiftBarrages',
      'bossOrdnanceCues', 'bossOrdnanceCues31210', 'spatialRiftCasts', 'bossLaserCastsV31330',
      'bossUltimateCastsV31334', 'dreamMirrorLasersV31347',
    ]) {
      if (Array.isArray(state[key])) state[key] = state[key].filter(row => !matches(row));
    }
    return true;
  }

  function retireSummon(state, wave, id) {
    if (!id) return false;
    state.enemies = finiteArray(state.enemies).filter(row => !(row?.id === id && row.samongCosmicSummonV386 === true) &&
      row?.summonOwnerId !== id && row?.sourceId !== id && row?.ownerId !== id &&
      row?.sourceBossId !== id && row?.summonSourceId !== id);
    clearOwnedThreats(state, id);
    if (state.targetEnemyId === id) state.targetEnemyId = null;
    wave.activeIds = finiteArray(wave.activeIds).filter(value => value !== id);
    return true;
  }

  function createSummon(state, bridge, wave, index) {
    const profile = BOSSES[index];
    const template = bridge.templates[profile.id];
    if (!template || !bridge.signatureProfile?.(template)?.deck?.length ||
        !Array.isArray(bridge.patterns(template, 2)) || bridge.patterns(template, 2).length === 0) {
      wave.status = 'failed';
      wave.failure = 'native-cosmic-template-or-pattern-missing:' + profile.id;
      return false;
    }
    const templateHp = Math.max(1, num(template.maxHp, template.hp));
    const hp = Math.max(1, Math.round(templateHp * 0.18));
    const phase = 1 + Math.floor(index / 2);
    const home = FORMATION[index];
    const point = bridge.point?.(state.zone, home[0], home[1], .8) ?? { x: home[0], y: home[1] };
    const actor = {
      ...template,
      id: profile.id,
      name: '코스믹 ' + String(index + 1).padStart(2, '0') + ' · ' + (template.name ?? '대수문장'),
      eliteName: profile.title,
      x: point.x,
      y: point.y,
      hp,
      maxHp: hp,
      boss: true,
      midboss: false,
      canonAlly: false,
      canonicalAllyV31217: false,
      canonAllyV31217: false,
      noBossSummons: true,
      themedSummonAt: Number.POSITIVE_INFINITY,
      themedOrdnanceAt: Number.POSITIVE_INFINITY,
      // Pride's episodeBossSummon lifecycle retires children whose phase
      // differs from the owner. These six independent bodies must stay alive
      // through their native warnings until the player awakening strikes.
      episodeBossSummon: false,
      noLootV386: true,
      fixedPhase: phase,
      currentPhase: phase,
      phaseMax: Math.max(phase, num(template.phaseMax, num(template.phaseCount, 3))),
      phaseCount: Math.max(phase, num(template.phaseCount, 3)),
      readyAt: Number.POSITIVE_INFINITY,
      patternReadyAt: Number.POSITIVE_INFINITY,
      invulnerableUntil: Number.POSITIVE_INFINITY,
      phaseTransitionUntil: num(state.time) + 0.62,
      recoverUntil: 0,
      attackAt: 0,
      moveVx: 0,
      moveVy: 0,
      moveDx: 0,
      moveDy: 0,
      navPath: [],
      samongCosmicSummonV386: true,
      samongCosmicIndexV386: index + 1,
      samongCosmicPhaseV386: phase,
      samongCosmicSourceBossV386: 'c104-boss',
      samongCosmicDispatchAtV386: num(state.time) + (wave.sequentialMobile ? 0.08 : 0.42 + index * 0.26),
    };
    window.__HAPIL_DANMAKU_RPG_RC88__?.prepareSummon(state, actor);
    actor.invulnerableUntil = Number.POSITIVE_INFINITY;
    actor.phaseTransitionUntil = num(state.time) + 0.05;
    actor.samongCosmicDispatchAtV386 = num(state.time) + (wave.sequentialMobile ? 0.08 : 0.42 + index * 0.26);
    state.enemies.push(actor);
    (wave.activeIds ??= []).push(actor.id);
    wave.nextIndex = Math.max(num(wave.nextIndex), index + 1);
    wave.status = wave.sequentialMobile
      ? wave.crisisAt == null ? 'mobile-single' : wave.awakeningAt == null ? 'crisis' : 'awakening'
      : 'six-awakened';
    if (wave.sequentialMobile) state.heroStatus = '코스믹 ' + (index + 1) + '/6 · 한 체씩 대면';
    addFloat(state, actor.x, actor.y - 2.1, '사몽 · 교주의 꼭두각시 · ' + profile.title, profile.color);
    addSummonEffect(state, profile, index, actor.x, actor.y);
    return true;
  }

  function canUseSamong(state, bridge) {
    if (!state || state.zone !== 'cult04' || !(state.hp > 0)) return false;
    const mode = bridge.modeApi?.mode?.(state);
    if (mode !== 'STORY') return false;
    const battle = state.hapilFinalBattleV31300;
    const boss = finiteArray(state.enemies).find(actor => actor?.id === 'c104-boss');
    return Boolean(
      battle && Number(battle.stage) >= 7 &&
      battle.secondPhaseActive === true &&
      battle.monochromeActiveV31377 === true &&
      battle.completed !== true &&
      boss && boss.hp > 0 && boss.hapilSecondPhaseV31300 === true
    );
  }

  function stopWave(state, reason) {
    const wave = state?.hapilSamongCosmicWaveV386;
    if (!wave) return false;
    for (const id of [...finiteArray(wave.activeIds)]) retireSummon(state, wave, id);
    wave.status = reason;
    wave.endedAt = num(state.time);
    return true;
  }

  function holdLeaderDuringMobileWave(state) {
    const leader = finiteArray(state.enemies).find(actor => actor.id === 'c104-boss' && actor.hp > 0);
    if (!leader) return;
    for (const key of ['readyAt', 'patternReadyAt', 'bossCombatPatternReadyAtV31230', 'themedOrdnanceAt'])
      leader[key] = Number.POSITIVE_INFINITY;
    leader.invulnerableUntil = Number.POSITIVE_INFINITY;
    clearOwnedThreats(state, leader.id);
  }

  function releaseLeaderAfterMobileWave(state) {
    const leader = finiteArray(state.enemies).find(actor => actor.id === 'c104-boss' && actor.hp > 0);
    if (!leader) return;
    for (const key of ['readyAt', 'patternReadyAt', 'bossCombatPatternReadyAtV31230', 'themedOrdnanceAt'])
      if (leader[key] === Number.POSITIVE_INFINITY) leader[key] = num(state.time) + .4;
    if (leader.invulnerableUntil === Number.POSITIVE_INFINITY) leader.invulnerableUntil = num(state.time) + .4;
  }

  function convertToMobileSequence(state, wave) {
    if (wave.sequentialMobile || wave.status === 'complete') return;
    const killed = new Set(finiteArray(state.rc88Encounter?.cosmicKills));
    const index = BOSSES.findIndex((_, position) => !killed.has(position + 1));
    if (index < 0) return;
    const keep = finiteArray(state.enemies).find(actor => actor.id === BOSSES[index].id &&
      actor.samongCosmicSummonV386 && actor.hp > 0);
    for (const actor of finiteArray(state.enemies).filter(actor => actor.samongCosmicSummonV386 && actor.hp > 0))
      if (actor !== keep) retireSummon(state, wave, actor.id);
    wave.sequentialMobile = true;
    wave.strikeIndex = index;
    wave.nextIndex = keep ? index + 1 : index;
    wave.activeIds = keep ? [keep.id] : [];
    if (!keep) wave.nextAt = clock(state) + .35;
    if (wave.status === 'six-awakened') wave.status = keep?.samongCosmicPatternDispatchedV386 ? 'crisis' : 'mobile-single';
    if (wave.status === 'crisis' && wave.crisisAt == null && keep?.samongCosmicPatternDispatchedV386)
      wave.crisisAt = clock(state);
  }

  function finishStoryLeader(state, wave) {
    wave.status = 'complete'; wave.completedAt = num(state.time);
    const leader = finiteArray(state.enemies).find(actor => actor.id === 'c104-boss' && actor.hp > 0);
    const battle = state.hapilFinalBattleV31300;
    if (leader && battle && !battle.finalHitCommittedV31377) {
      battle.finalHitCommittedV31377 = true;
      battle.finalHitModeV31377 = 'samong-awakening';
      addFloat(state, leader.x, leader.y - 2.4, '교주의 사몽 회로 소멸', '#f9e7ff');
      addSummonEffect(state, { color: '#f9e7ff', accent: '#ffffff' }, 6, leader.x, leader.y);
      leader.hp = 0;
      const binding = window.__HAPIL_CONTROLS_V31329__?.binding;
      if (binding?.state?.current === state && typeof binding.actions?.death === 'function')
        binding.actions.death(leader);
      else { state.enemies = finiteArray(state.enemies).filter(actor => actor !== leader); state.bossDefeated = true; }
      retireSummon(state, wave, leader.id);
      window.__HAPIL_V31300_PATCH__?.finalBattle?.tick?.(state);
      if (!battle.completed && !state.enemies.some(actor => actor.id === leader.id)) {
        battle.completed = true; battle.completedAt = num(state.time);
      }
    }
    state.heroStatus = '코스믹 여섯 체와 교주의 사몽 회로 소멸';
  }

  function tickMobileSequence(state, bridge, wave) {
    holdLeaderDuringMobileWave(state);
    // A real player attack may defeat the current body before the scripted
    // awakening strike. Treat RC88's native death ledger as the same ordered
    // progression, including cleanup, so the next body cannot deadlock.
    const killed = new Set(finiteArray(state.rc88Encounter?.cosmicKills));
    while (wave.strikeIndex < BOSSES.length && killed.has(wave.strikeIndex + 1)) {
      retireSummon(state, wave, BOSSES[wave.strikeIndex].id);
      wave.strikeIndex++;
      wave.nextIndex = Math.max(num(wave.nextIndex), wave.strikeIndex);
      wave.nextAt = clock(state) + .55;
    }
    if (wave.strikeIndex === BOSSES.length) { finishStoryLeader(state, wave); return wave.nextIndex; }
    let live = finiteArray(state.enemies).filter(actor => actor.samongCosmicSummonV386 && actor.hp > 0);
    if (live.length > 1) {
      convertToMobileSequence(state, wave);
      live = finiteArray(state.enemies).filter(actor => actor.samongCosmicSummonV386 && actor.hp > 0);
      if (live.length > 1) { wave.status = 'failed'; wave.failure = 'mobile-cosmic-overlap'; return -1; }
    }
    if (!live.length && wave.nextIndex < BOSSES.length &&
        ['charging', 'mobile-single', 'crisis', 'awakening'].includes(wave.status) &&
        clock(state) >= num(wave.nextAt)) {
      if (!createSummon(state, bridge, wave, wave.nextIndex)) return -1;
      live = finiteArray(state.enemies).filter(actor => actor.samongCosmicSummonV386 && actor.hp > 0);
    }
    const actor = live[0];
    if (actor && !actor.samongCosmicPatternDispatchedV386 && num(state.time) >= num(actor.samongCosmicDispatchAtV386)) {
      const admitted = dispatchSignature(state, bridge, actor);
      if (admitted === null) {
        actor.samongCosmicRetryCountV386 = num(actor.samongCosmicRetryCountV386) + 1;
        actor.samongCosmicDispatchAtV386 = num(state.time) + .2;
        if (actor.samongCosmicRetryCountV386 > 80) {
          wave.status = 'failed'; wave.failure = 'mobile-cosmic-signature-admission-timeout:' + actor.id;
          return -1;
        }
      } else if (!admitted) {
        wave.status = 'failed'; wave.failure = 'mobile-cosmic-signature-dispatch-failed:' + actor.id;
        return -1;
      }
    }
    if (wave.status === 'mobile-single' && actor?.samongCosmicPatternDispatchedV386) {
      wave.status = 'crisis'; wave.crisisAt = clock(state);
      state.hp = 1;
      state.invulnerableUntil = Math.max(num(state.invulnerableUntil), num(state.time) + 3.5);
      state.heroStatus = '첫 코스믹의 압박 · 플레이어 위기';
      addFloat(state, state.x, state.y - 1.7, '코스믹 1/6 · 코어 임계', '#ffb9dc');
    }
    if (wave.status === 'crisis' && clock(state) >= num(wave.crisisAt) + 1.2 &&
        !window.__HAPIL_STORY_RC51__?.isOpen?.() &&
        (state.hapilFinalBattleV31300?.awakeningCommittedRC108 === true ||
         window.__HAPIL_FINAL_AWAKENING_RC108__?.complete?.(state))) {
      wave.status = 'awakening'; wave.awakeningAt = clock(state);
      state.invulnerableUntil = Math.max(num(state.invulnerableUntil), num(state.time) + 2.5);
    }
    if (wave.status === 'awakening' && actor?.samongCosmicPatternDispatchedV386 &&
        !window.__HAPIL_STORY_RC51__?.isOpen?.() &&
        num(state.time) >= num(actor.activePatternUntil) &&
        clock(state) >= Math.max(num(wave.awakeningAt) + .28, num(actor.samongCosmicPatternClockV386) + 1.8)) {
      const index = num(actor.samongCosmicIndexV386) - 1;
      if (index !== wave.strikeIndex) { wave.status = 'failed'; wave.failure = 'mobile-cosmic-order:' + actor.id; return -1; }
      addSummonEffect(state, BOSSES[index], index, actor.x, actor.y);
      addFloat(state, actor.x, actor.y - 2.2, '플레이어 사몽 각성 · 코스믹 ' + (index + 1) + '/6 격파', '#d9fbff');
      actor.hp = 0;
      window.__HAPIL_DANMAKU_RPG_RC88__?.beforeDeath?.(state, actor);
      retireSummon(state, wave, actor.id);
      wave.strikeIndex++;
      wave.nextAt = clock(state) + .55;
      if (wave.strikeIndex === BOSSES.length) finishStoryLeader(state, wave);
    }
    return wave.nextIndex;
  }

  function tick(state, bridge) {
    if (!state) return 0;
    const existing = state.hapilSamongCosmicWaveV386;
    if (!canUseSamong(state, bridge)) {
      const battle = state.hapilFinalBattleV31300;
      const bossAlive = finiteArray(state.enemies).some(actor => actor?.id === 'c104-boss' && actor.hp > 0);
      if (existing && (state.zone !== 'cult04' || !(state.hp > 0) || battle?.completed === true || !bossAlive || bridge.modeApi?.mode?.(state) === 'DREAM')) {
        stopWave(state, state.hp > 0 ? 'ended' : 'player-death');
        delete state.hapilSamongCosmicWaveV386;
      }
      return 0;
    }
    let wave = state.hapilSamongCosmicWaveV386;
    if (!wave) {
      wave = state.hapilSamongCosmicWaveV386 = {
        version: 2, status: 'charging', nextIndex: 0,
        startedAt: clock(state), nextAt: clock(state) + FIRST_DELAY,
        activeIds: [], crisisAt: null, awakeningAt: null, strikeIndex: 0,
        sequentialMobile: touchMobile(),
      };
      const finalBoss = finiteArray(state.enemies).find(actor => actor.id === 'c104-boss');
      addFloat(state, num(finalBoss?.x, HOME.x), num(finalBoss?.y, HOME.y) - 1.8, '사몽 · 코스믹 망령 여섯 체 호출', '#f3ecff');
    }
    if (wave.status === 'complete' || wave.status === 'failed' || wave.status === 'ended') {
      if (wave.sequentialMobile && wave.status !== 'complete') releaseLeaderAfterMobileWave(state);
      return 0;
    }
    if (touchMobile() && !wave.sequentialMobile) convertToMobileSequence(state, wave);
    if (wave.sequentialMobile) return tickMobileSequence(state, bridge, wave);
    if (wave.nextIndex < BOSSES.length && clock(state) >= num(wave.nextAt)) {
      // All six bodies enter on the same simulation tick. Their distinct native
      // signatures release in short intervals so warnings stay legible.
      for (let index = wave.nextIndex; index < BOSSES.length; index++)
        if (!createSummon(state, bridge, wave, index)) return -1;
    }
    const live = finiteArray(state.enemies).filter(actor => actor?.samongCosmicSummonV386 && actor.hp > 0);
    for (const actor of live) if (!actor.samongCosmicPatternDispatchedV386 && num(state.time) >= num(actor.samongCosmicDispatchAtV386)) {
      const admitted = dispatchSignature(state, bridge, actor);
      if (admitted === null) {
        actor.samongCosmicRetryCountV386 = num(actor.samongCosmicRetryCountV386) + 1;
        actor.samongCosmicDispatchAtV386 = num(state.time) + .2;
        if (actor.samongCosmicRetryCountV386 <= 80) continue;
      }
      if (!admitted) {
        wave.status = 'failed'; wave.failure = 'native-cosmic-signature-dispatch-failed:' + actor.id;
        return -1;
      }
    }
    if (wave.status === 'six-awakened' && live.length === 6 && live.every(actor => actor.samongCosmicPatternDispatchedV386)) {
      wave.status = 'crisis'; wave.crisisAt = clock(state);
      state.hp = 1;
      state.invulnerableUntil = Math.max(num(state.invulnerableUntil), num(state.time) + 3.5);
      state.heroStatus = '코스믹 여섯 체 · 플레이어 위기';
      addFloat(state, state.x, state.y - 1.7, '여섯 코스믹의 압박 · 코어 임계', '#ffb9dc');
    }
    if (wave.status === 'crisis' && clock(state) >= num(wave.crisisAt) + 1.2 &&
        !window.__HAPIL_STORY_RC51__?.isOpen?.() &&
        (state.hapilFinalBattleV31300?.awakeningCommittedRC108 === true ||
         window.__HAPIL_FINAL_AWAKENING_RC108__?.complete?.(state))) {
      wave.status = 'awakening'; wave.awakeningAt = clock(state); wave.strikeIndex = 0;
      state.invulnerableUntil = Math.max(num(state.invulnerableUntil), num(state.time) + 2.5);
    }
    if (wave.status === 'awakening') {
      while (wave.strikeIndex < BOSSES.length && clock(state) >= num(wave.awakeningAt) + .28 * wave.strikeIndex) {
        const index = wave.strikeIndex++, id = BOSSES[index].id;
        const actor = finiteArray(state.enemies).find(row => row.id === id && row.samongCosmicSummonV386);
        if (!actor) continue;
        // An admitted player awakening strike defeats one body. Native RC88
        // records the kill; source cleanup is owned by that real death.
        addSummonEffect(state, BOSSES[index], index, actor.x, actor.y);
        addFloat(state, actor.x, actor.y - 2.2, '플레이어 사몽 각성 · 코스믹 격파', '#d9fbff');
        actor.hp = 0;
        window.__HAPIL_DANMAKU_RPG_RC88__?.beforeDeath?.(state, actor);
        retireSummon(state, wave, id);
      }
      if (wave.strikeIndex === BOSSES.length) {
        wave.status = 'complete'; wave.completedAt = num(state.time);
        const leader = finiteArray(state.enemies).find(actor => actor.id === 'c104-boss' && actor.hp > 0);
        const battle = state.hapilFinalBattleV31300;
        if (leader && battle && !battle.finalHitCommittedV31377) {
          battle.finalHitCommittedV31377 = true;
          battle.finalHitModeV31377 = 'samong-awakening';
          addFloat(state, leader.x, leader.y - 2.4, '교주의 사몽 회로 소멸', '#f9e7ff');
          addSummonEffect(state, { color: '#f9e7ff', accent: '#ffffff' }, 6, leader.x, leader.y);
          leader.hp = 0;
          const binding = window.__HAPIL_CONTROLS_V31329__?.binding;
          if (binding?.state?.current === state && typeof binding.actions?.death === 'function')
            binding.actions.death(leader);
          else { state.enemies = finiteArray(state.enemies).filter(actor => actor !== leader); state.bossDefeated = true; }
          retireSummon(state, wave, leader.id);
          window.__HAPIL_V31300_PATCH__?.finalBattle?.tick?.(state);
          // Headless/restore fixtures lack the native death callback, but must
          // retain an idempotent terminal state until the normal ending route.
          if (!battle.completed && !state.enemies.some(actor => actor.id === leader.id)) {
            battle.completed = true; battle.completedAt = num(state.time);
          }
        }
        state.heroStatus = '코스믹 여섯 체와 교주의 사몽 회로 소멸';
      }
    }
    return wave.nextIndex;
  }

  function bossAudit(bridge) {
    const rows = BOSSES.map((profile, index) => {
      const actor = bridge.templates?.[profile.id];
      const phases = [1, 2, 3].map(phase => {
        try { return finiteArray(bridge.patterns(actor, phase)); }
        catch { return []; }
      });
      const signatureDeck = [...(bridge.signatureProfile(actor)?.deck ?? [])];
      const paths = cosmicAssetsForActor(actor);
      return {
        index: index + 1, id: profile.id, present: Boolean(actor?.id === profile.id),
        baseBoss: actor?.boss === true, baseMidboss: actor?.midboss === true,
        baseName: actor?.name ?? null, baseKind: actor?.kind ?? null,
        canonicalAlly: actor?.canonAlly === true,
        phaseCount: num(actor?.phaseCount), patternSet: actor?.patternSet ?? null,
        patternCounts: phases.map(list => list.length),
        signatureDeck,
        signatureDeckUnique: signatureDeck.length >= 3 && new Set(signatureDeck).size === signatureDeck.length,
        signatureNames: [...new Set(phases.flat().map(pattern => pattern?.name).filter(Boolean))].slice(0, 8),
        assets: paths,
      };
    });
    const zones = bridge.modeApi?.dreamFinal?.zones ?? [];
    const regionalTrials = zones.map(zone => ({ zone, bossId: bridge.zoneBoss(zone)?.id ?? null }));
    return {
      version: VERSION,
      storyFinalSummonIds: BOSSES.map(row => row.id),
      regionalTrials,
      regionalTrialsAreDifferentBosses: regionalTrials.every(row => !BOSSES.some(profile => profile.id === row.bossId)),
      bosses: rows,
      signatureDecksDistinct: new Set(rows.map(row => row.signatureDeck.join('|'))).size === rows.length,
      allPass: rows.length === 6 && rows.every(row =>
        row.present && row.phaseCount >= 3 && row.patternCounts.every(count => count > 0) &&
        row.signatureDeckUnique && row.assets.length > 0
      ) && new Set(rows.map(row => row.signatureDeck.join('|'))).size === rows.length && regionalTrials.length === 6,
    };
  }

  function cosmicAssetsForActor(actor) {
    const paths = new Set();
    if (!actor) return [];
    for (const value of [
      actor.sprite, actor.phaseSprites, actor.phaseSpriteFallbacks,
      actor.actionSprites, actor.actionSpritesByPhase,
    ]) {
      if (typeof value === 'string' && value.startsWith('./assets/')) paths.add(value);
      else if (Array.isArray(value)) {
        for (const row of value) if (typeof row === 'string' && row.startsWith('./assets/')) paths.add(row);
        else if (row && typeof row === 'object') for (const item of Object.values(row)) if (typeof item === 'string' && item.startsWith('./assets/')) paths.add(item);
      } else if (value && typeof value === 'object') {
        for (const item of Object.values(value)) {
          if (typeof item === 'string' && item.startsWith('./assets/')) paths.add(item);
          else if (Array.isArray(item)) for (const path of item) if (typeof path === 'string' && path.startsWith('./assets/')) paths.add(path);
        }
      }
    }
    return [...paths];
  }

  function visualAudit(bridge) {
    const rows = Object.entries(APOSTATES).map(([id, art]) => {
      const actor = bridge.actor('cult03', id);
      const actorImagePaths = new Set();
      const visitImagePath = value => {
        if (typeof value === 'string' && value.startsWith('./assets/')) actorImagePaths.add(value);
        else if (Array.isArray(value)) for (const item of value) visitImagePath(item);
        else if (value && typeof value === 'object') for (const item of Object.values(value)) visitImagePath(item);
      };
      for (const [key, value] of Object.entries(actor ?? {})) {
        if (/sprite|image|portrait|art/i.test(key)) visitImagePath(value);
      }
      const activePaths = new Set([
        actor?.sprite, actor?.portraitV31233,
        ...finiteArray(actor?.phaseSprites), ...finiteArray(actor?.phaseSpriteFallbacks),
        ...Object.values(actor?.actionSprites ?? {}),
        ...actorImagePaths,
      ].filter(value => typeof value === 'string' && value.startsWith('./assets/')));
      return {
        id, present: Boolean(actor),
        idle: actor?.sprite === art.idle && actor?.portraitV31233 === art.idle && actor?.actionSprites?.idle === art.idle,
        action: ['ready', 'windup', 'strike', 'attackA', 'attackB', 'rain', 'rift', 'recover', 'transition']
          .every(key => actor?.actionSprites?.[key] === art.action),
        everyActiveRouteIsCanonical: [...activePaths].every(path => path === art.idle || path === art.action),
        everyImageFieldIsCanonical: [...actorImagePaths].every(path => path === art.idle || path === art.action),
        commonCanvasPivot: [art.idle, art.action].every(path =>
          JSON.stringify(bridge.spriteMetadata(path)) === JSON.stringify([0, 0, 1, 1, 0.5, 0.98])),
        activePathCount: activePaths.size,
        idlePath: art.idle, actionPath: art.action,
        castPose: chosenApostatePose({ id, castVisualUntil31210: 5 }, 1),
      };
    });
    return { actors: rows, allPass: rows.length === 2 && rows.every(row =>
      row.present && row.idle && row.action && row.everyActiveRouteIsCanonical &&
      row.everyImageFieldIsCanonical && row.commonCanvasPivot
    ) };
  }

  function snapshot(state) {
    const wave = state?.hapilSamongCosmicWaveV386;
    return wave ? {
      status: wave.status, nextIndex: wave.nextIndex, nextAt: wave.nextAt,
      sequentialMobile: wave.sequentialMobile === true,
      activeIds: [...finiteArray(wave.activeIds)],
      crisisAt: wave.crisisAt, awakeningAt: wave.awakeningAt, strikeIndex: wave.strikeIndex,
      startedAt: wave.startedAt, completedAt: wave.completedAt ?? null,
      failure: wave.failure ?? null,
    } : null;
  }

  function install() {
    if (installed) return true;
    const bridge = window.__HAPIL_RC86_BRIDGE__;
    if (!bridge || !bridge.templates || !bridge.modeApi?.mode ||
        typeof bridge.patterns !== 'function' || typeof bridge.signatureProfile !== 'function' ||
        typeof bridge.signatureAttack !== 'function' ||
        typeof bridge.phaseSprite !== 'function' ||
        typeof bridge.runtimeSprite !== 'function' || typeof bridge.persistentTick !== 'function' ||
        typeof bridge.setSpriteMetadata !== 'function' || typeof bridge.spriteMetadata !== 'function' ||
        BOSSES.some(profile => !bridge.templates[profile.id]) ||
        window.__HAPIL_V31300_PATCH__?.allPass !== true ||
        window.__HAPIL_AUTOPROGRESS_V31301__?.installed !== true ||
        window.__HAPIL_COSMIC_V31348__?.installed !== true) return false;

    if (!applyApostateArt(bridge)) return false;
    const cosmicPaths = cosmicAssets(bridge);
    if (cosmicPaths.length < 6) return false;

    const oldManifest = bridge.zoneAssetManifest;
    bridge.zoneAssetManifest = function HAPIL_RC86AssetManifest(zone, ...args) {
      const result = new Set(oldManifest.call(this, zone, ...args) ?? []);
      if (zone === 'cult03') {
        for (const row of Object.values(APOSTATES)) { result.add(row.idle); result.add(row.action); }
        for (const path of [...result]) {
          if (/^\.\/assets\/heroes\/normalized\/(directions|actions-consistent)\/(rian|ion)-/.test(path)) result.delete(path);
        }
      }
      if (zone === 'cult04') for (const path of cosmicPaths) result.add(path);
      return result;
    };
    const oldPlan = bridge.zoneAssetPlan;
    bridge.zoneAssetPlan = function HAPIL_RC86AssetPlan(zone, ...args) {
      const plan = oldPlan.call(this, zone, ...args);
      const paths = zone === 'cult03'
        ? Object.values(APOSTATES).flatMap(row => [row.idle, row.action])
        : zone === 'cult04' ? cosmicPaths : [];
      const output = enrichAssetPlan(plan, paths, zone);
      return output;
    };
    const oldTick = bridge.persistentTick;
    bridge.persistentTick = function HAPIL_tickSamongCosmicSummonsRC86(state, ...args) {
      const result = oldTick.apply(this, [state, ...args]);
      tick(state, bridge);
      return result;
    };
    const oldPhaseGate = bridge.phaseGateHealth;
    bridge.phaseGateHealth = function HAPIL_samongCosmicCrisisGateRC86(state, actor, damage) {
      if (state?.zone === 'cult04' && bridge.modeApi?.mode?.(state) === 'STORY' &&
          actor?.samongCosmicSummonV386 === true &&
          state.hapilSamongCosmicWaveV386?.status !== 'complete')
        return Math.max(1, num(actor.hp, 1));
      return oldPhaseGate(state, actor, damage);
    };

    installed = true;
    window.__HAPIL_APOSTATE_VISUALS_RC86__ = Object.freeze({
      version: VERSION, installed: true,
      assets: APOSTATES,
      pose: chosenApostatePose,
      audit: () => visualAudit(bridge),
    });
    window.__HAPIL_SAMONG_COSMIC_V386__ = Object.freeze({
      version: VERSION, installed: true,
      bosses: BOSSES, tick: state => tick(state, bridge),
      mobileDevice: touchMobile,
      restoreSummon: (state, wave, index) => createSummon(state, bridge, wave, index),
      snapshot, audit: () => bossAudit(bridge),
      nativePatterns: (id, phase = 2) => {
        const actor = bridge.templates?.[id];
        return actor ? finiteArray(bridge.patterns(actor, phase)) : [];
      },
      signatureDeck: id => {
        const actor = bridge.templates?.[id];
        return [...(bridge.signatureProfile(actor)?.deck ?? [])];
      },
      policy: Object.freeze({
        storyFinal: 'cult04 c104-boss phase 2 only; Dream six-map trials keep their independent regional bosses',
        schedule: 'touch mobile: one Kair Great combat body at a time and source cleanup before next; desktop: six simultaneous bodies; player awakening defeats six',
        identity: 'kair-great-01 through kair-great-06 use their original phase-aware themed signature ordnance decks',
      }),
    });
    return true;
  }

  function ready() {
    if (install()) return;
    if (++attempts < 1600) setTimeout(ready, 16);
  }
  ready();
})();
