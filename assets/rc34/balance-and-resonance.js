/* RC34: double the native max-HP damage component for hostile heavy boss hits,
 * halve all outgoing lifesteal, and layer a lightweight gold resonance aura. */
(() => {
  'use strict';

  const root = window;
  const VERSION = '33401';
  const AURA_PATH = './assets/vfx/rc34/nuri-origin-aura.webp?v=' + VERSION;
  const stats = {
    installed: false,
    playerDamageBonuses: 0,
    allyDamageBonuses: 0,
    auraImageLoads: 0,
    auraImageFailures: 0,
    auraDraws: 0,
    auraErrors: 0,
    auraInstalled: false
  };
  const boostedSources = new WeakSet();
  let auraImage = null;

  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const hostile = source => source && typeof source === 'object' &&
    !source.friendly && !source.reflected && !source.visualOnly;
  const heavyBossSource = source => hostile(source) && !source.rc95Bullet &&
    (!!source.boss || !!source.midboss) &&
    (!!source.heavyBossSkill || !!source.themedLaser || !!source.returnAt ||
     !!source.telekineticRain || !!source.spatialRift || !!source.narrativeAttack ||
     source.shape === 'line' || source.status === 'drain');

  function ratioAmount(actor, ratio) {
    const maximum = Number(actor?.maxHp);
    if (!Number.isFinite(maximum) || maximum <= 0) return 0;
    return Math.max(1, Math.round(maximum * ratio));
  }

  function hostPercent(actor, source) {
    if (!heavyBossSource(source)) return 0;
    return ratioAmount(actor, source.boss ? 0.025 : 0.015);
  }

  // The cooperative reducer already adds its own ratio only when the source is
  // explicitly marked heavyBossSkill. Return that existing amount separately
  // so scoped and direct ally hits receive the same two-times total.
  function nativeAllyPercent(actor, source) {
    if (!hostile(source) || !source.heavyBossSkill) return 0;
    return ratioAmount(actor, source.boss ? 0.025 : 0.015);
  }

  function scopedTarget(state) {
    try {
      return root.__HAPIL_PARTY_V31322__?.incomingTarget?.(state) ?? state;
    } catch (_) {
      return state;
    }
  }

  function extraForPlayer(state, source) {
    const actor = scopedTarget(state);
    const hostRatio = hostPercent(actor, source);
    const allyBase = actor !== state ? nativeAllyPercent(actor, source) : 0;
    const existing = actor !== state ? allyBase : 0;
    return Math.max(0, 2 * Math.max(hostRatio, allyBase) - existing);
  }

  function extraForAlly(actor, source) {
    const hostRatio = hostPercent(actor, source);
    const allyBase = nativeAllyPercent(actor, source);
    return Math.max(0, 2 * Math.max(hostRatio, allyBase) - allyBase);
  }

  function installBalance() {
    const core = root.__HAPIL_COMBAT_CORE_V31401__;
    if (!core || typeof core.player !== 'function' || typeof core.ally !== 'function') return false;
    if (core.__hapilRc34Balance === true) return true;

    const originalPlayer = core.player;
    const originalAlly = core.ally;
    const bridge = Object.create(core);

    Object.defineProperties(bridge, {
      __hapilRc34Balance: { value: true },
      player: {
        value: function (state, amount, x, y, source = false) {
          const bonus = finite(amount) ? extraForPlayer(state, source) : 0;
          if (!(bonus > 0)) return originalPlayer.call(core, state, amount, x, y, source);
          if (source && typeof source === 'object') boostedSources.add(source);
          stats.playerDamageBonuses++;
          try {
            return originalPlayer.call(core, state, amount + bonus, x, y, source);
          } finally {
            if (source && typeof source === 'object') boostedSources.delete(source);
          }
        }
      },
      ally: {
        value: function (state, actor, amount, source, reduce) {
          const alreadyBoosted = source && typeof source === 'object' && boostedSources.has(source);
          const bonus = finite(amount) && !alreadyBoosted ? extraForAlly(actor, source) : 0;
          if (!(bonus > 0)) return originalAlly.call(core, state, actor, amount, source, reduce);
          stats.allyDamageBonuses++;
          return originalAlly.call(core, state, actor, amount + bonus, source, reduce);
        }
      }
    });

    root.__HAPIL_COMBAT_CORE_V31401__ = bridge;
    root.__HAPIL_COMBAT_CORE_V31402__ = bridge;
    stats.installed = true;
    return true;
  }

  function activeResonanceActors(state) {
    const channel = root.__HAPIL_CHANNEL_V31364__;
    if (typeof channel?.active !== 'function' || !state) return [];
    const party = root.__HAPIL_PARTY_V31322__;
    const actors = [state];
    if (party?.state === state && Array.isArray(party.actors)) actors.push(...party.actors);
    const unique = new Set();
    return actors.filter(actor => {
      if (!actor || unique.has(actor) || !(Number(actor.hp) > 0)) return false;
      unique.add(actor);
      try { return channel.active(state, actor) === true; }
      catch (_) { return false; }
    });
  }

  function loadAura() {
    if (auraImage) return auraImage;
    if (typeof root.Image !== 'function') return null;
    try {
      const image = new root.Image();
      image.decoding = 'async';
      image.loading = 'eager';
      image.onload = () => {};
      image.onerror = () => { stats.auraImageFailures++; auraImage = null; };
      auraImage = image;
      image.src = new URL(AURA_PATH, root.document?.baseURI || root.location?.href || 'http://localhost/').href;
      stats.auraImageLoads++;
      return image;
    } catch (_) {
      auraImage = null;
      stats.auraImageFailures++;
      return null;
    }
  }

  function drawAura(ctx, state, settings = {}) {
    if (!ctx || typeof ctx.drawImage !== 'function') return;
    const actors = activeResonanceActors(state);
    if (!actors.length) return;
    const project = root.__HAPIL_COMBAT_V31333__?.core;
    if (typeof project !== 'function') return;
    const image = loadAura();
    if (!image?.complete || !(image.naturalWidth || image.width)) return;

    for (const actor of actors) {
      if (!finite(Number(actor.x)) || !finite(Number(actor.y))) continue;
      let center, xProbe, yProbe;
      try {
        center = project({ x: Number(actor.x), y: Number(actor.y) });
        xProbe = project({ x: Number(actor.x) + 2.3, y: Number(actor.y) });
        yProbe = project({ x: Number(actor.x), y: Number(actor.y) + 2.3 });
      } catch (_) { continue; }
      if (![center?.x, center?.y, xProbe?.x, xProbe?.y, yProbe?.x, yProbe?.y].every(finite)) continue;

      const projectedRadius = Math.max(
        Math.hypot(xProbe.x - center.x, xProbe.y - center.y),
        Math.hypot(yProbe.x - center.x, yProbe.y - center.y)
      );
      const diameter = Math.max(104, Math.min(250, projectedRadius * 5.15));
      const pulse = 1 + Math.sin(Number(state.time || 0) * 3.1) * 0.035;
      const size = diameter * pulse;
      const alpha = settings.lowFx === true ? 0.43 : settings.reducedFlash === true ? 0.5 : 0.62;

      ctx.save();
      try {
        ctx.translate(center.x, center.y + 7);
        ctx.rotate(Number(state.time || 0) * 0.055);
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha *= alpha;
        ctx.filter = 'none';
        ctx.shadowBlur = 0;
        ctx.drawImage(image, -size / 2, -size / 2, size, size);
        stats.auraDraws++;
      } finally {
        ctx.restore();
      }
    }
  }

  function installAura(attempt = 0) {
    if (stats.auraInstalled) return;
    const lasers = root.__HAPIL_LASERS_V31330__;
    if (!root.__HAPIL_RC33__?.installed || typeof lasers?.draw !== 'function') {
      if (attempt < 800) setTimeout(() => installAura(attempt + 1), 25);
      return;
    }

    const originalDraw = lasers.draw;
    lasers.draw = function (ctx, cache, state, settings = {}) {
      const result = originalDraw.call(this, ctx, cache, state, settings);
      try { drawAura(ctx, state, settings); }
      catch (_) { stats.auraErrors++; }
      return result;
    };
    stats.auraInstalled = true;
  }

  function install(attempt = 0) {
    if (installBalance()) {
      stats.installed = true;
      installAura();
      root.__HAPIL_RC34__ = Object.freeze({
        version: VERSION,
        installed: true,
        percentDamageMultiplier: 2,
        lifestealMultiplier: 0.5,
        auraPath: AURA_PATH,
        stats: () => Object.freeze({ ...stats })
      });
      return;
    }
    if (attempt < 240) setTimeout(() => install(attempt + 1), 25);
  }

  install();
})();
