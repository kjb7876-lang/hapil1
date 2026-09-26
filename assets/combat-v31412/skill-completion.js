/* HAPIL RC14: committed skill completion and base-attack balance. */
(() => {
  'use strict';
  const root = window;
  if (root.__HAPIL_SKILL_COMPLETION_V31412__?.installed) return;

  const config = Object.freeze({
    attackSpeedMultiplier: 3.5,
    basicDamageMultiplier: 1 / 3.5,
    saveRevision: 14,
  });
  const metrics = {
    basicHitsScaled: 0,
    basicAttacksStarted: 0,
    heroPosePreserved: 0,
    heroPoseMerged: 0,
    enemyCastBegun: 0,
    enemyStaggersBypassed: 0,
    enemyCastResetsBlocked: 0,
    enemyPhaseLocks: 0,
  };
  const basicAttackTimes = [];
  let stateRef = null;
  let now = 0;
  const finite = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  const idOf = (v) => String(v?.id ?? v?.sourceId ?? '');

  function castUntil(state, actor) {
    const t = finite(state?.time ?? now);
    const times = [
      actor?.skillCastLockUntilV31412,
      actor?.attackAt,
      actor?.attackImpactAt,
      actor?.activePatternUntil,
      actor?.atomicCastUntil31210,
      actor?.castVisualUntil31210,
      actor?.telekineticUntil,
      actor?.cosmicPoseUntilV31318,
      actor?.laserCastUntilV31332,
      actor?.finaleCastUntilV31334,
      actor?.skillCastEndAt,
    ].map(finite);
    for (const [key, value] of Object.entries(actor ?? {})) {
      if (/(?:cast|beam|pose|telekinetic|rift).*(?:until|endat)$/i.test(key)) {
        const n = finite(value);
        if (n > t && n < t + 30) times.push(n);
      }
    }
    for (const key of ['narrativeCasts','telekineticCasts','spatialRiftCasts','bossUltimateCastsV31334','cosmicCastsV31318']) {
      for (const cast of state?.[key] ?? []) {
        if (idOf(cast) !== idOf(actor)) continue;
        const end = Math.max(finite(cast.endAt), finite(cast.end), finite(cast.fireAt) + finite(cast.activeSeconds));
        if (end > t) times.push(end);
      }
    }
    return Math.max(0, ...times.filter((v) => v > t && v < t + 30));
  }

  function enemyCastActive(state, actor) {
    const t = finite(state?.time ?? now);
    return !!actor && finite(actor.hp) > 0 && castUntil(state, actor) > t;
  }

  function protectEnemyStagger(state, actor) {
    const t = finite(state?.time ?? now);
    if (!(finite(actor?.staggerUntil) > t) || !enemyCastActive(state, actor)) return false;
    const until = castUntil(state, actor);
    if (finite(actor.skillStaggerBypassUntilV31412) !== until) {
      actor.skillStaggerBypassUntilV31412 = until;
      metrics.enemyStaggersBypassed++;
    }
    return true;
  }

  function blockReset(actor) {
    if (!enemyCastActive(stateRef, actor)) return false;
    metrics.enemyCastResetsBlocked++;
    return true;
  }

  function observe(state) {
    if (!state || !Number.isFinite(Number(state.time))) return;
    stateRef = state;
    now = Number(state.time);
    for (const actor of state.enemies ?? []) {
      const until = castUntil(state, actor);
      if (until <= now) {
        if (finite(actor.skillCastPhaseLockUntilV31412) <= now) {
          delete actor.skillCastPhaseLockUntilV31412;
          delete actor.skillCastPhaseV31412;
        }
        continue;
      }
      actor.skillCastLockUntilV31412 = Math.max(finite(actor.skillCastLockUntilV31412), until);
      if (!(finite(actor.skillCastPhaseLockUntilV31412) > now)) {
        actor.skillCastPhaseV31412 = typeof root.__HAPIL_ENEMY_PHASE_BASE_V31412__ === 'function'
          ? root.__HAPIL_ENEMY_PHASE_BASE_V31412__(actor)
          : finite(actor.currentPhase) || 1;
        actor.skillCastPhaseLockUntilV31412 = until;
      } else {
        actor.skillCastPhaseLockUntilV31412 = Math.max(finite(actor.skillCastPhaseLockUntilV31412), until);
      }
    }
  }

  function beginEnemyCast(state, actor, phaseHint, untilHint) {
    if (!state || !actor) return false;
    stateRef = state;
    now = finite(state.time);
    const until = Math.max(castUntil(state, actor), finite(untilHint));
    if (until <= now) return false;
    actor.skillCastLockUntilV31412 = Math.max(finite(actor.skillCastLockUntilV31412), until);
    if (!(finite(actor.skillCastPhaseLockUntilV31412) > now)) {
      actor.skillCastPhaseV31412 = Number.isFinite(Number(phaseHint))
        ? Number(phaseHint)
        : (typeof root.__HAPIL_ENEMY_PHASE_BASE_V31412__ === 'function'
          ? root.__HAPIL_ENEMY_PHASE_BASE_V31412__(actor)
          : finite(actor.currentPhase) || 1);
      actor.skillCastPhaseLockUntilV31412 = until;
      metrics.enemyCastBegun++;
    } else {
      actor.skillCastPhaseLockUntilV31412 = Math.max(finite(actor.skillCastPhaseLockUntilV31412), until);
    }
    return true;
  }

  function phase(base, actor, ...args) {
    const currentNow = finite(stateRef?.time ?? now);
    const until = castUntil(stateRef, actor);
    if (until > currentNow) {
      if (!(finite(actor.skillCastPhaseLockUntilV31412) > currentNow)) {
        actor.skillCastPhaseV31412 = base(actor, ...args);
        actor.skillCastPhaseLockUntilV31412 = until;
        metrics.enemyPhaseLocks++;
      } else {
        actor.skillCastPhaseLockUntilV31412 = Math.max(finite(actor.skillCastPhaseLockUntilV31412), until);
      }
      return finite(actor.skillCastPhaseV31412) || 1;
    }
    return base(actor, ...args);
  }

  function keepHeroPose(state, actor, incomingKind = 'attack') {
    const motion = actor?.heroMotion;
    const t = finite(state?.time ?? now);
    if (!motion || !['skill','ultimate'].includes(motion.kind) || finite(motion.until) <= t) return false;
    metrics.heroPosePreserved++;
    if (incomingKind === 'skill' || incomingKind === 'ultimate') {
      motion.until = Math.max(finite(motion.until), t + (incomingKind === 'ultimate' ? 0.95 : 0.58));
      metrics.heroPoseMerged++;
    }
    return true;
  }

  function scaleBasicDamage(power, source, record = true) {
    const key = source?.actionKey ?? source?.heroActionKey31213 ?? source?.heroActionKeyV31313 ?? source?.key;
    if (String(key ?? '').toUpperCase() !== 'A') return power;
    const n = Number(power);
    if (!Number.isFinite(n)) return power;
    if (record) metrics.basicHitsScaled++;
    return n * config.basicDamageMultiplier;
  }

  function recordBasicAttack(state) {
    const t = finite(state?.time ?? now);
    metrics.basicAttacksStarted++;
    basicAttackTimes.push(t);
    if (basicAttackTimes.length > 64) basicAttackTimes.shift();
    return t;
  }

  function probe() {
    const oldState = stateRef, oldNow = now;
    const state = {time: 2, enemies: []};
    const boss = {
      id: 'rc14-probe-boss', hp: 80, maxHp: 100, boss: true, phaseCount: 3, currentPhase: 1,
      attackStarted: 1.8, attackAt: 3.1, attackImpactAt: 3.1,
      activePattern: '검증용 탄막', activePatternUntil: 3.6,
      staggerUntil: 2.8, currentPhase: 1,
    };
    state.enemies.push(boss);
    observe(state);
    boss.hp = 30;
    const activeBeforeImpact = enemyCastActive(state, boss);
    const phaseDuringCast = phase((a) => a.hp / a.maxHp <= 0.33 ? 3 : a.hp / a.maxHp <= 0.66 ? 2 : 1, boss);
    const staggerProtected = protectEnemyStagger(state, boss);
    const resetWouldBeBlocked = blockReset(boss);
    const hero = {heroMotion: {kind: 'skill', started: 1.9, until: 2.58, skillIndex: 1}};
    const heldPose = keepHeroPose(state, hero, 'hurt') && hero.heroMotion.kind === 'skill';
    state.time = 3.7;
    observe(state);
    const phaseReleased = phase((a) => a.hp / a.maxHp <= 0.33 ? 3 : a.hp / a.maxHp <= 0.66 ? 2 : 1, boss);
    stateRef = oldState; now = oldNow;
    return {
      activeBeforeImpact, phaseDuringCast, staggerProtected, resetWouldBeBlocked, heldPose, phaseReleased,
      attackSpeedMultiplier: config.attackSpeedMultiplier,
      basicDamageMultiplier: config.basicDamageMultiplier,
      pass: activeBeforeImpact && phaseDuringCast === 1 && staggerProtected && resetWouldBeBlocked && heldPose && phaseReleased === 3,
    };
  }

  root.__HAPIL_SKILL_COMPLETION_V31412__ = Object.freeze({
    installed: true, version: '3.14-FINAL-RC14', config,
    observe, castUntil, enemyCastActive, protectEnemyStagger, blockReset, beginEnemyCast, phase, keepHeroPose, scaleBasicDamage,
    recordBasicAttack, metrics: () => ({...metrics,basicAttackTimes:[...basicAttackTimes]}), probe,
  });
})();
