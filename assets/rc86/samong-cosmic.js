/* RC86: bind the six existing Kair Great bosses to the story Samong finale. */
(() => {
  'use strict';

  const VERSION = '3.86.02';
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
  const SUMMON_INTERVAL = 6.35;
  const SUMMON_LIFETIME = 5.5;
  const HOME = Object.freeze({ x: 23.2, y: 10 });
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const finiteArray = value => Array.isArray(value) ? value : [];
  const clock = state => window.__HAPIL_DANMAKU_RPG_RC88__?.summonClock(state) ?? num(state?.time);
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

  function addSummonEffect(state, profile, index) {
    const id = Number.isFinite(Number(state.fxSerial)) ? state.fxSerial++ : 0;
    (state.effects ??= []).push({
      id, kind: 'glitch', x: HOME.x, y: HOME.y, tx: HOME.x, ty: HOME.y,
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
    if (!attack || !(Number(attack.count) > 0) || !attack.name) return false;
    actor.samongCosmicPatternDispatchedV386 = true;
    actor.samongCosmicPatternNameV386 = String(attack.name);
    actor.samongCosmicPatternCountV386 = Math.max(0, Math.floor(Number(attack.count)));
    actor.samongCosmicPatternPhaseV386 = num(attack.phase, num(actor.samongCosmicPhaseV386, 1));
    actor.samongCosmicPatternAtV386 = num(state.time);
    const activeUntil = num(state.time) + 1.8;
    actor.activePatternUntil = Math.max(num(actor.activePatternUntil), activeUntil);
    actor.castVisualUntil31210 = Math.max(num(actor.castVisualUntil31210), activeUntil);
    actor.readyAt = Math.max(num(actor.readyAt), num(state.time) + SUMMON_LIFETIME + 0.8);
    actor.patternReadyAt = Math.max(num(actor.patternReadyAt), num(state.time) + SUMMON_LIFETIME + 0.8);
    const id = Number.isFinite(Number(state.fxSerial)) ? state.fxSerial++ : 0;
    (state.floatTexts ??= []).push({
      id, x: actor.x, y: actor.y - 2.3, born: num(state.time),
      duration: 1.3, text: String(attack.name),
      color: profileFor(actor.id)?.color ?? '#f3f4ff', critical: true,
    });
    return true;
  }

  function retireActive(state, wave) {
    const id = wave?.activeId;
    if (!id) return false;
    const matches = row => row && (
      row.id === id && row.samongCosmicSummonV386 === true ||
      row.summonOwnerId === id || row.sourceId === id || row.ownerId === id ||
      row.sourceBossId === id || row.summonSourceId === id
    );
    state.enemies = finiteArray(state.enemies).filter(row => !matches(row));
    if (window.__HAPIL_DANMAKU_RPG_RC88__?.preserveSummonAttacks(state, id)) {
      if (state.targetEnemyId === id) state.targetEnemyId = null;
      wave.activeId = null;
      wave.activeUntil = 0;
      return true;
    }
    for (const key of [
      'hostileProjectiles', 'pendingHits', 'impactQueue', 'pendingStrikes',
      'narrativeCasts', 'telekineticCasts', 'spatialRiftBarrages',
      'bossOrdnanceCues', 'bossOrdnanceCues31210', 'spatialRiftCasts', 'bossLaserCastsV31330',
      'bossUltimateCastsV31334', 'dreamMirrorLasersV31347',
    ]) {
      if (Array.isArray(state[key])) state[key] = state[key].filter(row => !matches(row));
    }
    if (state.targetEnemyId === id) state.targetEnemyId = null;
    wave.activeId = null;
    wave.activeUntil = 0;
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
    const actor = {
      ...template,
      id: profile.id,
      name: '코스믹 ' + String(index + 1).padStart(2, '0') + ' · ' + (template.name ?? '대수문장'),
      eliteName: profile.title,
      x: HOME.x,
      y: HOME.y,
      hp,
      maxHp: hp,
      boss: true,
      midboss: true,
      canonAlly: false,
      canonicalAllyV31217: false,
      canonAllyV31217: false,
      noBossSummons: true,
      themedSummonAt: Number.POSITIVE_INFINITY,
      themedOrdnanceAt: Number.POSITIVE_INFINITY,
      summonOwnerId: 'c104-boss',
      sourceBossId: 'c104-boss',
      episodeBossSummon: true,
      noLootV386: true,
      fixedPhase: phase,
      currentPhase: phase,
      phaseMax: Math.max(phase, num(template.phaseMax, num(template.phaseCount, 3))),
      phaseCount: Math.max(phase, num(template.phaseCount, 3)),
      readyAt: num(state.time) + SUMMON_LIFETIME + 0.8,
      patternReadyAt: num(state.time) + SUMMON_LIFETIME + 0.8,
      invulnerableUntil: num(state.time) + 0.55,
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
      samongCosmicDispatchAtV386: num(state.time) + 0.82,
    };
    window.__HAPIL_DANMAKU_RPG_RC88__?.prepareSummon(state, actor);
    state.enemies.push(actor);
    wave.activeId = actor.id;
    wave.activeUntil = clock(state) + SUMMON_LIFETIME;
    wave.nextIndex = index + 1;
    wave.nextAt = clock(state) + SUMMON_INTERVAL;
    wave.status = index === BOSSES.length - 1 ? 'last-summon' : 'summoning';
    addFloat(state, actor.x, actor.y - 2.1, '사몽 · 교주의 꼭두각시 · ' + profile.title, profile.color);
    addSummonEffect(state, profile, index);
    return true;
  }

  function canUseSamong(state, bridge) {
    if (!state || state.zone !== 'cult04') return false;
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
    retireActive(state, wave);
    wave.status = reason;
    wave.endedAt = num(state.time);
    return true;
  }

  function tick(state, bridge) {
    if (!state) return 0;
    const existing = state.hapilSamongCosmicWaveV386;
    if (!canUseSamong(state, bridge)) {
      const battle = state.hapilFinalBattleV31300;
      const bossAlive = finiteArray(state.enemies).some(actor => actor?.id === 'c104-boss' && actor.hp > 0);
      if (existing && (state.zone !== 'cult04' || battle?.completed === true || !bossAlive || bridge.modeApi?.mode?.(state) === 'DREAM')) {
        stopWave(state, 'ended');
        delete state.hapilSamongCosmicWaveV386;
      }
      return 0;
    }
    let wave = state.hapilSamongCosmicWaveV386;
    if (!wave) {
      wave = state.hapilSamongCosmicWaveV386 = {
        version: 1, status: 'charging', nextIndex: 0,
        startedAt: clock(state), nextAt: clock(state) + FIRST_DELAY,
        activeId: null, activeUntil: 0,
      };
      const finalBoss = finiteArray(state.enemies).find(actor => actor.id === 'c104-boss');
      addFloat(state, num(finalBoss?.x, HOME.x), num(finalBoss?.y, HOME.y) - 1.8, '사몽 · 코스믹 망령 여섯 체 호출', '#f3ecff');
    }
    if (wave.status === 'complete' || wave.status === 'failed' || wave.status === 'ended') return 0;
    const active = wave.activeId
      ? finiteArray(state.enemies).find(actor => actor?.id === wave.activeId && actor.samongCosmicSummonV386 === true)
      : null;
    if (wave.activeId && (!active || active.hp <= 0 || clock(state) >= num(wave.activeUntil))) retireActive(state, wave);
    else if (active && active.samongCosmicPatternDispatchedV386 !== true &&
        num(state.time) >= num(active.samongCosmicDispatchAtV386)) {
      if (!dispatchSignature(state, bridge, active)) {
        wave.status = 'failed';
        wave.failure = 'native-cosmic-signature-dispatch-failed:' + active.id;
        return -1;
      }
    }
    if (!wave.activeId && wave.nextIndex < BOSSES.length && clock(state) >= num(wave.nextAt)) {
      if (!createSummon(state, bridge, wave, wave.nextIndex)) return -1;
    }
    if (wave.nextIndex >= BOSSES.length && !wave.activeId) {
      wave.status = 'complete';
      wave.completedAt = num(state.time);
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
      activeId: wave.activeId, activeUntil: wave.activeUntil,
      dispatchAt: wave.activeId
        ? finiteArray(state?.enemies).find(actor => actor.id === wave.activeId)?.samongCosmicDispatchAtV386 ?? null
        : null,
      patternName: wave.activeId
        ? finiteArray(state?.enemies).find(actor => actor.id === wave.activeId)?.samongCosmicPatternNameV386 ?? null
        : null,
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
        schedule: 'one native Kair Great boss at a time; six indexed summons; hostile-source cleanup on expiry',
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
