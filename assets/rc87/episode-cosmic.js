/* RC87: each campaign part closes with its own post-major-boss Cosmic finale. */
(() => {
  'use strict';

  const VERSION = '3.87.02';
  const EPISODES = Object.freeze([
    Object.freeze({part: 2, zone: 'ep1b09', triggerId: 'b09-boss', cosmicId: 'kair-great-01'}),
    Object.freeze({part: 3, zone: 'u203', triggerId: 'u203-boss', cosmicId: 'kair-great-02'}),
    Object.freeze({part: 4, zone: 'last303', triggerId: 'l303-boss', cosmicId: 'kair-great-03'}),
    Object.freeze({part: 5, zone: 'kair03', triggerId: 'k103-boss', cosmicId: 'kair-great-04'}),
    Object.freeze({part: 6, zone: 'hando03', triggerId: 'h103-boss', cosmicId: 'kair-great-05'}),
    Object.freeze({part: 7, zone: 'murder03', triggerId: 'mb-murder03', cosmicId: 'kair-great-06'}),
  ]);
  const byZone = new Map(EPISODES.map(row => [row.zone, row]));
  const modeAllowed = mode => mode === 'STORY';
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const array = value => Array.isArray(value) ? value : [];
  const clue = (spec, status) => `combat:episode-cosmic-v387:${spec.zone}:${status}`;
  let installed = false;
  let attempts = 0;
  let baseZoneClear = null;

  function currentMode(state, bridge) {
    try { return bridge.modeApi?.mode?.(state) ?? 'STORY'; }
    catch { return 'STORY'; }
  }

  function getStage(state) {
    const row = state?.hapilEpisodeCosmicV387;
    return row && row.zone === state.zone && byZone.get(row.zone)?.cosmicId === row.cosmicId ? row : null;
  }

  function bossAssets(template) {
    const result = new Set();
    const visit = value => {
      if (typeof value === 'string') {
        if (value.startsWith('./assets/')) result.add(value);
      } else if (Array.isArray(value)) {
        for (const item of value) visit(item);
      } else if (value && typeof value === 'object') {
        for (const item of Object.values(value)) visit(item);
      }
    };
    if (template) {
      for (const key of ['sprite', 'phaseSprites', 'phaseSpriteFallbacks', 'actionSprites', 'actionSpritesByPhase']) {
        visit(template[key]);
      }
    }
    return [...result];
  }

  function addArrivalCue(state, spec, profile, actor) {
    const now = finite(state.time);
    const id = Number.isFinite(Number(state.fxSerial)) ? state.fxSerial++ : 0;
    (state.floatTexts ??= []).push({
      id, x: actor.x, y: actor.y - 2.3, born: now, duration: 1.55,
      text: `제${spec.part}부 진최종 · 코스믹 ${String(EPISODES.indexOf(spec) + 1).padStart(2, '0')}`,
      color: profile.color, critical: true,
    });
    (state.effects ??= []).push({
      id: Number.isFinite(Number(state.fxSerial)) ? state.fxSerial++ : id + 1,
      kind: 'glitch', x: actor.x, y: actor.y, tx: actor.x, ty: actor.y,
      born: now, duration: 0.9, color: profile.color, accent: profile.accent,
      size: 7.2, angle: 0, imageOnly: false, episodeCosmicArrivalV387: true,
    });
  }

  function buildBoss(state, bridge, spec, stage, saved = null, restoring = false) {
    const template = bridge.templates?.[spec.cosmicId];
    const profile = window.__HAPIL_SAMONG_COSMIC_V386__?.bosses?.find(row => row.id === spec.cosmicId);
    if (!template || !profile) return null;
    const now = finite(state?.time);
    const index = EPISODES.indexOf(spec);
    const triggerTemplate = bridge.actor(spec.zone, spec.triggerId);
    const seedHp = Math.max(
      1,
      finite(template.maxHp, finite(template.hp)),
      finite(stage.triggerMaxHp, finite(triggerTemplate?.maxHp, triggerTemplate?.hp)) * 1.16,
    );
    const maxHp = Math.max(1, Math.round(finite(saved?.maxHp, seedHp)));
    const phase = 1 + Math.floor(index / 2);
    const actor = {
      ...template,
      id: spec.cosmicId,
      name: `코스믹 대수문장 ${String(index + 1).padStart(2, '0')} · ${template.name ?? '고정 우주 보스'}`,
      eliteName: profile.title,
      x: finite(saved?.x, finite(stage.triggerX, 15)),
      y: finite(saved?.y, finite(stage.triggerY, 14)),
      hp: Math.max(0.1, Math.min(maxHp, finite(saved?.hp, maxHp))),
      maxHp,
      boss: true,
      midboss: false,
      elite: true,
      episodeFinalBoss: true,
      canonicalAllyV31217: false,
      canonAlly: false,
      noBossSummons: true,
      themedSummonAt: Number.POSITIVE_INFINITY,
      themedOrdnanceAt: Number.POSITIVE_INFINITY,
      fixedPhase: Math.max(phase, Math.floor(finite(saved?.currentPhase, phase))),
      currentPhase: Math.max(phase, Math.floor(finite(saved?.currentPhase, phase))),
      phaseMax: Math.max(3, finite(template.phaseMax, finite(template.phaseCount, 3))),
      phaseCount: Math.max(3, finite(template.phaseCount, 3)),
      phaseTransitionUntil: restoring ? 0 : now + 0.78,
      invulnerableUntil: restoring ? 0 : now + 0.78,
      readyAt: restoring ? now : now + 1.05,
      patternReadyAt: restoring ? now : now + 1.05,
      attackAt: 0,
      attackImpactAt: 0,
      recoverUntil: 0,
      castVisualUntil31210: restoring ? 0 : now + 1.05,
      moveDx: 0,
      moveDy: 0,
      navPath: [],
      summonOwnerId: null,
      sourceBossId: spec.triggerId,
      episodeCosmicFinalV387: true,
      episodeCosmicPartV387: spec.part,
      episodeCosmicIndexV387: index + 1,
      episodeCosmicSignatureAtV387: restoring ? now + 0.7 : now + 1.05,
      episodeCosmicNextSignatureV387: restoring
        ? now + Math.max(0.7, Math.min(9.2, finite(saved?.signatureDelayRemaining, 9.2)))
        : now + 9.2,
      episodeCosmicFirstSignatureDispatchedV387: saved?.firstSignatureDispatched === true,
      episodeCosmicSignatureCycleV387: Math.max(0, Math.floor(finite(saved?.signatureCycle))),
      signatureFollowupCycle31212: Math.max(0, Math.floor(finite(saved?.signatureCycle))),
      signatureFollowupLastAt31212: -Infinity,
      maxStagger: Math.max(180, finite(template.maxStagger, 190)),
      stagger: 0,
    };
    if (!restoring) addArrivalCue(state, spec, profile, actor);
    return actor;
  }

  function startFinal(state, bridge, spec, stage) {
    if (!state || !spec || !stage || stage.status !== 'pending' ||
        state.zone !== spec.zone || stage.zone !== spec.zone || stage.cosmicId !== spec.cosmicId) return false;
    if (array(state.enemies).some(actor => actor?.episodeCosmicFinalV387 === true)) {
      stage.status = 'active';
      return true;
    }
    const actor = buildBoss(state, bridge, spec, stage);
    if (!actor) {
      stage.failure = 'native-cosmic-template-or-profile-missing:' + spec.cosmicId;
      return false;
    }
    state.enemies.push(actor);
    stage.status = 'active';
    stage.startedAt = finite(state.time);
    stage.nextSignatureAt = actor.episodeCosmicSignatureAtV387;
    state.bossDefeated = false;
    state.targetEnemyId = actor.id;
    state.target = null;
    state.path = [];
    state.clues?.add?.(clue(spec, 'started'));
    return true;
  }

  function beforeDeath(state, actor, bridge) {
    if (!state || !actor || !modeAllowed(currentMode(state, bridge)) || state.practiceV31329) return false;
    const spec = byZone.get(state.zone);
    if (!spec) return false;
    const current = getStage(state);
    if (actor.id === spec.cosmicId && actor.episodeCosmicFinalV387 === true) {
      if (current) {
        current.status = 'complete';
        current.completedAt = finite(state.time);
        current.hp = 0;
      }
      state.clues?.add?.(clue(spec, 'complete'));
      state.bossDefeated = true;
      return false;
    }
    if (actor.id !== spec.triggerId || finite(actor.hp, 1) > 0 || current || state.clues?.has?.(clue(spec, 'complete'))) return false;
    state.hapilEpisodeCosmicV387 = {
      version: 1,
      status: 'pending',
      part: spec.part,
      zone: spec.zone,
      triggerId: spec.triggerId,
      cosmicId: spec.cosmicId,
      triggerX: finite(actor.x, 15),
      triggerY: finite(actor.y, 14),
      triggerMaxHp: finite(actor.maxHp, actor.hp),
      queuedAt: finite(state.time),
    };
    state.clues?.add?.(clue(spec, 'queued'));
    // Part 7 closes on its authored rooftop midboss; the other parts close on a boss.
    if (actor.midboss === true) state.bossDefeated = true;
    return false;
  }

  function dispatchSignature(state, bridge, actor, stage) {
    if (!actor || actor.hp <= 0 || typeof bridge.signatureAttack !== 'function') return false;
    let attack;
    try { attack = bridge.signatureAttack(state, actor); }
    catch { return false; }
    if (!attack || !(Number(attack.count) > 0) || !attack.name) return false;
    actor.episodeCosmicSignatureNameV387 = String(attack.name);
    actor.episodeCosmicSignatureCountV387 = Math.max(0, Math.floor(Number(attack.count)));
    actor.episodeCosmicSignatureCycleV387 = Math.max(0, Math.floor(finite(attack.cycle, finite(actor.signatureFollowupCycle31212))));
    actor.episodeCosmicSignatureAtV387 = finite(state.time);
    actor.episodeCosmicNextSignatureV387 = finite(state.time) + 9.2;
    actor.episodeCosmicFirstSignatureDispatchedV387 = true;
    actor.castVisualUntil31210 = Math.max(finite(actor.castVisualUntil31210), finite(state.time) + 1.6);
    actor.activePatternUntil = Math.max(finite(actor.activePatternUntil), finite(state.time) + 1.6);
    actor.readyAt = Math.max(finite(actor.readyAt), finite(state.time) + 1.8);
    actor.patternReadyAt = Math.max(finite(actor.patternReadyAt), finite(state.time) + 1.8);
    stage.signatureCycle = finite(actor.signatureFollowupCycle31212);
    stage.nextSignatureAt = actor.episodeCosmicNextSignatureV387;
    return true;
  }

  function tick(state, bridge) {
    const stage = getStage(state);
    if (!stage || !modeAllowed(currentMode(state, bridge))) return 0;
    const spec = byZone.get(stage.zone);
    if (!spec || state.zone !== spec.zone) return 0;
    if (stage.status === 'pending') {
      if (baseZoneClear?.call(bridge, state, spec.zone) === true) return startFinal(state, bridge, spec, stage) ? 1 : -1;
      return 0;
    }
    if (stage.status !== 'active') return 0;
    const actor = array(state.enemies).find(row => row?.episodeCosmicFinalV387 === true && row.id === spec.cosmicId);
    if (!actor || actor.hp <= 0) return 0;
    state.bossDefeated = false;
    if (actor.episodeCosmicFirstSignatureDispatchedV387 !== true &&
        finite(state.time) >= finite(actor.episodeCosmicSignatureAtV387, Infinity)) {
      // The first signature is deliberately delayed until the arrival warning finishes.
      dispatchSignature(state, bridge, actor, stage);
    } else if (finite(state.time) >= finite(actor.episodeCosmicNextSignatureV387, Infinity)) {
      dispatchSignature(state, bridge, actor, stage);
    }
    return 1;
  }

  function snapshot(state) {
    const stage = getStage(state);
    if (!stage) return null;
    const spec = byZone.get(stage.zone);
    const actor = array(state.enemies).find(row => row?.episodeCosmicFinalV387 === true && row.id === spec?.cosmicId);
    return {
      version: 1, status: stage.status, part: spec.part, zone: spec.zone,
      triggerId: spec.triggerId, cosmicId: spec.cosmicId,
      triggerX: finite(stage.triggerX), triggerY: finite(stage.triggerY),
      triggerMaxHp: Math.max(1, finite(stage.triggerMaxHp, 1)),
      queuedAt: finite(stage.queuedAt), startedAt: finite(stage.startedAt),
      completedAt: finite(stage.completedAt),
      hp: actor ? finite(actor.hp) : finite(stage.hp),
      maxHp: actor ? finite(actor.maxHp) : finite(stage.maxHp),
      x: actor ? finite(actor.x) : finite(stage.triggerX),
      y: actor ? finite(actor.y) : finite(stage.triggerY),
      currentPhase: actor ? finite(actor.currentPhase, 1) : finite(stage.currentPhase, 1),
      signatureCycle: actor ? finite(actor.signatureFollowupCycle31212) : finite(stage.signatureCycle),
      nextSignatureAt: actor ? finite(actor.episodeCosmicNextSignatureV387) : finite(stage.nextSignatureAt),
      signatureDelayRemaining: actor
        ? Math.max(0, Math.min(9.2, finite(actor.episodeCosmicNextSignatureV387) - finite(state.time)))
        : Math.max(0, Math.min(9.2, finite(stage.signatureDelayRemaining, 9.2))),
      firstSignatureDispatched: actor?.episodeCosmicFirstSignatureDispatchedV387 === true,
    };
  }

  function sanitize(raw, zone) {
    if (!raw || typeof raw !== 'object') return null;
    const spec = byZone.get(String(zone ?? raw.zone ?? ''));
    if (!spec || raw.version !== 1 || raw.zone !== spec.zone || raw.cosmicId !== spec.cosmicId ||
        !['pending', 'active', 'complete'].includes(raw.status)) return null;
    const numeric = ['triggerX', 'triggerY', 'triggerMaxHp', 'queuedAt', 'startedAt', 'completedAt', 'hp', 'maxHp', 'x', 'y', 'currentPhase', 'signatureCycle', 'nextSignatureAt', 'signatureDelayRemaining'];
    if (numeric.some(key => raw[key] !== undefined && !Number.isFinite(Number(raw[key])))) return null;
    return {
      version: 1, status: raw.status, part: spec.part, zone: spec.zone,
      triggerId: spec.triggerId, cosmicId: spec.cosmicId,
      triggerX: finite(raw.triggerX, 15), triggerY: finite(raw.triggerY, 14),
      triggerMaxHp: Math.max(1, finite(raw.triggerMaxHp, 1)),
      queuedAt: finite(raw.queuedAt), startedAt: finite(raw.startedAt),
      completedAt: finite(raw.completedAt), hp: Math.max(0, finite(raw.hp)),
      maxHp: Math.max(1, finite(raw.maxHp, 1)), x: finite(raw.x, 15), y: finite(raw.y, 14),
      currentPhase: Math.max(1, Math.min(3, Math.floor(finite(raw.currentPhase, 1)))),
      signatureCycle: Math.max(0, Math.floor(finite(raw.signatureCycle))),
      nextSignatureAt: finite(raw.nextSignatureAt),
      signatureDelayRemaining: Math.max(0, Math.min(9.2, finite(raw.signatureDelayRemaining, 9.2))),
      firstSignatureDispatched: raw.firstSignatureDispatched === true,
    };
  }

  function installSaveHooks(bridge) {
    if (typeof bridge.serializeSave !== 'function' || typeof bridge.normalizeSave !== 'function' ||
        typeof bridge.restoreEnemies !== 'function' || typeof bridge.restoreEntry !== 'function') return false;
    const serializeBase = bridge.serializeSave;
    bridge.serializeSave = function HAPIL_episodeCosmicSerializeV387(...args) {
      const save = serializeBase.apply(this, args);
      if (save && args[0]) save.episodeCosmicFinalV387 = snapshot(args[0]);
      return save;
    };
    const normalizeBase = bridge.normalizeSave;
    bridge.normalizeSave = function HAPIL_episodeCosmicNormalizeV387(raw, ...args) {
      const save = normalizeBase.call(this, raw, ...args);
      if (!save) return save;
      return {...save, episodeCosmicFinalV387: sanitize(raw?.episodeCosmicFinalV387, save.zone)};
    };
    const restoreEnemiesBase = bridge.restoreEnemies;
    bridge.restoreEnemies = function HAPIL_episodeCosmicRestoreEnemiesV387(save, ...args) {
      const actors = restoreEnemiesBase.call(this, save, ...args);
      const stage = sanitize(save?.episodeCosmicFinalV387, save?.zone);
      if (!stage || stage.status !== 'active' || !Array.isArray(actors)) return actors;
      const spec = byZone.get(stage.zone);
      const cleaned = actors.filter(actor => actor.id !== spec.triggerId && actor.id !== spec.cosmicId);
      const bridge = window.__HAPIL_RC86_BRIDGE__;
      const restored = buildBoss({time: 0}, bridge, spec, stage, stage, true);
      if (restored) cleaned.push(restored);
      return cleaned;
    };
    const restoreEntryBase = bridge.restoreEntry;
    bridge.restoreEntry = function HAPIL_episodeCosmicRestoreEntryV387(state, save, ...args) {
      const result = restoreEntryBase.call(this, state, save, ...args);
      const stage = sanitize(save?.episodeCosmicFinalV387, state?.zone);
      if (stage) {
        state.hapilEpisodeCosmicV387 = stage;
        if (stage.status === 'active') {
          state.bossDefeated = false;
          state.clues?.add?.(clue(byZone.get(stage.zone), 'started'));
          const actor = array(state.enemies).find(row => row.id === stage.cosmicId && row.episodeCosmicFinalV387 === true);
          if (actor) {
            const now = finite(state.time);
            actor.episodeCosmicSignatureAtV387 = now + 0.7;
            actor.episodeCosmicNextSignatureV387 = now + Math.max(0.7, stage.signatureDelayRemaining);
            actor.readyAt = Math.max(finite(actor.readyAt), now + 0.7);
            actor.patternReadyAt = Math.max(finite(actor.patternReadyAt), now + 0.7);
            actor.invulnerableUntil = Math.max(finite(actor.invulnerableUntil), now + 0.7);
          }
        } else if (stage.status === 'complete') {
          state.bossDefeated = true;
          state.clues?.add?.(clue(byZone.get(stage.zone), 'complete'));
        }
      } else delete state.hapilEpisodeCosmicV387;
      return result;
    };
    return true;
  }

  function install() {
    if (installed) return true;
    const bridge = window.__HAPIL_RC86_BRIDGE__;
    const bossApi = window.__HAPIL_SAMONG_COSMIC_V386__;
    if (!bridge || !bossApi?.installed || typeof bridge.zoneCombatCleared !== 'function' ||
        typeof bridge.persistentTick !== 'function' || !bridge.templates ||
        typeof bridge.zoneAssetManifest !== 'function' || typeof bridge.zoneAssetPlan !== 'function' ||
        EPISODES.some(spec => !bridge.actor(spec.zone, spec.triggerId) || !bridge.templates[spec.cosmicId])) return false;
    if (!installSaveHooks(bridge)) return false;

    baseZoneClear = bridge.zoneCombatCleared;
    bridge.zoneCombatCleared = function HAPIL_episodeCosmicClearGateV387(state, zone = state?.zone, ...args) {
      const spec = byZone.get(zone);
      const stage = getStage(state);
      if (spec && stage?.zone === spec.zone && modeAllowed(currentMode(state, bridge))) {
        if (stage.status === 'active') {
          state.bossDefeated = false;
          return false;
        }
        if (stage.status === 'pending') {
          const ready = baseZoneClear.call(this, state, zone, ...args);
          if (!ready) return false;
          startFinal(state, bridge, spec, stage);
          return false;
        }
      }
      return baseZoneClear.call(this, state, zone, ...args);
    };

    const persistentBase = bridge.persistentTick;
    bridge.persistentTick = function HAPIL_episodeCosmicPersistentTickV387(state, ...args) {
      const result = persistentBase.apply(this, [state, ...args]);
      tick(state, bridge);
      return result;
    };

    const oldManifest = bridge.zoneAssetManifest;
    if (typeof oldManifest === 'function') {
      bridge.zoneAssetManifest = function HAPIL_episodeCosmicManifestV387(zone, ...args) {
        const result = new Set(oldManifest.call(this, zone, ...args) ?? []);
        const spec = byZone.get(zone);
        if (spec) for (const path of bossAssets(bridge.templates[spec.cosmicId])) result.add(path);
        return result;
      };
    }
    const oldPlan = bridge.zoneAssetPlan;
    if (typeof oldPlan === 'function') {
      bridge.zoneAssetPlan = function HAPIL_episodeCosmicAssetPlanV387(zone, ...args) {
        const plan = oldPlan.call(this, zone, ...args);
        const spec = byZone.get(zone);
        if (!spec) return plan;
        const output = {...plan};
        for (const key of ['all', 'A', 'B', 'C', 'deferred', 'pins']) output[key] = new Set(plan?.[key] ?? []);
        for (const path of bossAssets(bridge.templates[spec.cosmicId])) {
          output.all.add(path);
          output.A.add(path);
          output.pins.add(path);
          output.B.delete(path);
          output.C.delete(path);
          output.deferred.delete(path);
        }
        return output;
      };
    }

    installed = true;
    window.__HAPIL_EPISODE_COSMIC_V387__ = Object.freeze({
      version: VERSION,
      installed: true,
      episodes: EPISODES,
      beforeDeath: (state, actor) => beforeDeath(state, actor, bridge),
      tick: state => tick(state, bridge),
      snapshot,
      serializeState: snapshot,
      sanitize,
      startFinal: (state, zone) => {
        const spec = byZone.get(zone);
        return spec ? startFinal(state, bridge, spec, state.hapilEpisodeCosmicV387) : false;
      },
      audit() {
        const rows = EPISODES.map((spec, index) => {
          const trigger = bridge.actor(spec.zone, spec.triggerId);
          const boss = bridge.templates[spec.cosmicId];
          return {
            part: spec.part, zone: spec.zone, triggerId: spec.triggerId,
            triggerKind: trigger?.boss ? 'boss' : trigger?.midboss ? 'midboss' : 'missing',
            cosmicId: spec.cosmicId, order: index + 1,
            assets: bossAssets(boss),
            valid: Boolean(trigger && boss && (trigger.boss || trigger.midboss) && boss.phaseCount >= 3),
          };
        });
        const dreamIsolated = !modeAllowed('DREAM');
        return {
          version: VERSION, rows, partOneUsesLucifer: true, partEightKeepsSamong: true,
          dreamIsolated,
          mappingComplete: rows.length === 6 && rows.every(row => row.valid) &&
            rows.map(row => row.order).join(',') === '1,2,3,4,5,6',
          allPass: rows.length === 6 && rows.every(row => row.valid) && dreamIsolated,
        };
      },
      policy: Object.freeze({
        finalMaps: 'parts 2-7; part 1 retains masked Lucifer and part 8 retains the separate Samong finale',
        order: 'native Kair Great 01-06, one after the authored final boss of each part',
        gate: 'the original portal and EGO clear remain locked until the episode Cosmic boss is defeated',
        modes: 'Story/Hell episode finals; Dream remains its separate six-stage encounter',
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
