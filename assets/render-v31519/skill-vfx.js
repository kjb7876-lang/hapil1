/* HAPIL v3.15.19 — image-only skill/passive VFX composition.
 * Presentation only: never creates combat events or changes damage, timing,
 * collision, cooldowns, saves, actor poses, or projectile lifetimes.
 */
(() => {
  'use strict';

  const VERSION = '3.15.19-RC1';
  const HEROES = Object.freeze([
    'hwando', 'seoha', 'michaela', 'neon',
    'hunter', 'lauren', 'slayer', 'gunner',
  ]);
  const PROFILES = Object.freeze({
    hwando: Object.freeze({
      impact: './assets/vfx/generated/v315/hwando-ego-phantom-blade.webp',
      motif: './assets/vfx/generated/v300/slash-impact.webp',
      style: 'blade',
    }),
    seoha: Object.freeze({
      impact: './assets/vfx/generated/v31307/hero-impacts/seoha-time-fracture.webp',
      motif: './assets/vfx/generated/v300/glitch-fracture.webp',
      style: 'time',
    }),
    michaela: Object.freeze({
      impact: './assets/vfx/generated/v31307/hero-impacts/michaela-seraph-spark.webp',
      motif: './assets/vfx/generated/v300/healing-sigil.webp',
      style: 'sanctuary',
    }),
    neon: Object.freeze({
      impact: './assets/vfx/generated/v31307/hero-impacts/neon-sanctuary-impact.webp',
      motif: './assets/vfx/generated/v300/barrier-sigil.webp',
      style: 'lance',
    }),
    hunter: Object.freeze({
      impact: './assets/vfx/generated/v31307/hero-impacts/hunter-petal-impact.webp',
      motif: './assets/vfx/generated/v300/target-mark.webp',
      style: 'focus',
    }),
    lauren: Object.freeze({
      impact: './assets/vfx/generated/v31307/hero-impacts/lauren-stigma-puncture.webp',
      motif: './assets/vfx/generated/v300/target-mark.webp',
      style: 'spear-mark',
    }),
    slayer: Object.freeze({
      impact: './assets/vfx/generated/v315/slayer-blood-rend-cyclone.webp',
      motif: './assets/vfx/generated/v300/slash-impact.webp',
      style: 'blood-blade',
    }),
    gunner: Object.freeze({
      impact: './assets/vfx/generated/v31307/hero-impacts/gunner-memory-impact.webp',
      motif: './assets/vfx/generated/v300/projectile-core.webp',
      style: 'memory-shot',
    }),
  });
  const passiveOwners = new WeakMap();
  const failedAssets = new Set();
  const metrics = {
    skillEvents: 0,
    passiveEvents: 0,
    composedEvents: 0,
    bitmapLayers: 0,
    pendingImages: 0,
    failedImages: 0,
    frameBudgetSkips: 0,
    drawErrors: 0,
  };
  let budgetFrame = NaN;
  let layersThisFrame = 0;

  const finite = (value, fallback = 0) =>
    Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const cleanId = value => String(value ?? '').trim().toLowerCase();
  const canonicalAssetList = () => Object.freeze([...new Set(
    Object.values(PROFILES).flatMap(row => [row.impact, row.motif]),
  )]);
  function assetsFor(heroIds) {
    const ids = [...new Set((Array.isArray(heroIds) ? heroIds : [heroIds]).map(cleanId))];
    return Object.freeze([...new Set(ids.flatMap(id => {
      const row = PROFILES[id];
      return row ? [row.impact, row.motif] : [];
    }))]);
  }

  function markPassive(effect, heroId) {
    if (!effect || typeof effect !== 'object') return false;
    const id = cleanId(heroId ?? effect.heroId31213 ?? effect.heroIdV31313 ?? effect.heroId);
    if (!Object.hasOwn(PROFILES, id)) return false;
    passiveOwners.set(effect, id);
    return true;
  }

  function heroIdFor(effect, activeHero, isPassive) {
    const remembered = passiveOwners.get(effect);
    if (remembered) return remembered;
    const direct = cleanId(
      effect?.deliveryHeroV31322 ??
      effect?.deliverySeedV31322?.heroId ??
      effect?.heroId31213 ??
      effect?.heroIdV31313 ??
      effect?.heroIdV31225 ??
      effect?.heroId,
    );
    if (Object.hasOwn(PROFILES, direct)) return direct;
    if (isPassive?.(effect)) {
      const fallback = cleanId(activeHero?.() ?? activeHero);
      if (Object.hasOwn(PROFILES, fallback)) return fallback;
    }
    return '';
  }

  function actionKey(effect) {
    const key = String(
      effect?.deliveryKeyV31322 ??
      effect?.deliverySeedV31322?.key ??
      effect?.heroActionKey31213 ??
      effect?.heroActionKeyV31313 ??
      effect?.skillActionKey ??
      '',
    ).trim().toUpperCase();
    return ['Q', 'W', 'E', 'R'].includes(key) ? key : '';
  }

  function isSkillEvent(effect) {
    if (
      !effect?.collabV31315 &&
      !effect?.collabSkillVfx &&
      !effect?.collabStrikeV31315 &&
      !effect?.collabKey
    ) return !!(
      effect?.heroSkillVfx ||
      effect?.heroSkillImpactV31307 ||
      effect?.heroHitVfxV31315 ||
      effect?.heroUltimateVolleyV31309 ||
      effect?.deliverySeedV31322 ||
      effect?.deliveryCarrierV31322 ||
      effect?.deliveryRoutesV31322?.length
    );
    return false;
  }

  function effectAge(effect, time, passive) {
    const born = finite(effect?.born, time);
    const age = finite(time) - born;
    const configured = Math.max(0.05, finite(effect?.duration, 0.32));
    const window = Math.min(passive ? 0.52 : 0.58, Math.max(passive ? 0.22 : 0.2, configured));
    return age < 0 || age >= window ? null : { age, window, born };
  }

  function project(deps, x, y) {
    const fn = deps?.project;
    if (typeof fn !== 'function') return null;
    try {
      const p = fn(x, y);
      return Number.isFinite(Number(p?.x)) && Number.isFinite(Number(p?.y))
        ? { x: Number(p.x), y: Number(p.y) }
        : null;
    } catch {
      return null;
    }
  }

  function pointsFor(effect, time, deps) {
    const routes = Array.isArray(effect?.deliveryRoutesV31322)
      ? effect.deliveryRoutesV31322
      : [];
    if (routes.length) {
      const rows = routes
        .filter(route => {
          const at = finite(route?.at, NaN);
          return Number.isFinite(at) && time >= at - 0.16 && time <= at + 0.23;
        })
        .slice(0, 2)
        .map(route => {
          const point = project(deps, finite(route.tx), finite(route.ty));
          if (!point) return null;
          point.x += finite(route.endOffsetX);
          point.y += finite(route.endOffsetY, -26) - 8;
          return point;
        })
        .filter(Boolean);
      return rows;
    }

    const impact = !!(
      effect?.heroSkillImpactV31307 ||
      effect?.gunnerImpactV31311 ||
      effect?.telegraphImpact ||
      effect?.deliveryArrivedV31519
    );
    const x = impact ? finite(effect?.tx, finite(effect?.x, NaN)) : finite(effect?.x, NaN);
    const y = impact ? finite(effect?.ty, finite(effect?.y, NaN)) : finite(effect?.y, NaN);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return [];
    const point = project(deps, x, y);
    if (point) point.y -= impact ? 18 : 20;
    return point ? [point] : [];
  }

  function angleFor(effect, deps) {
    const fixed = finite(effect?.screenRenderAngleV31311 ?? effect?.screenRenderAngleV31229, NaN);
    if (Number.isFinite(fixed)) return fixed;
    const direct = finite(effect?.angle ?? effect?.spriteHeading, NaN);
    if (Number.isFinite(direct)) return direct;
    const dx = finite(effect?.tx, finite(effect?.x)) - finite(effect?.x);
    const dy = finite(effect?.ty, finite(effect?.y)) - finite(effect?.y);
    const a = project(deps, finite(effect?.x), finite(effect?.y));
    const b = project(deps, finite(effect?.x) + dx, finite(effect?.y) + dy);
    return a && b && Math.hypot(b.x - a.x, b.y - a.y) > 0.001
      ? Math.atan2(b.y - a.y, b.x - a.x)
      : 0;
  }

  function decodedImage(cache, path, deps) {
    const queue = deps?.queueImage;
    if (typeof queue !== 'function') return null;
    try {
      const image = queue(cache, path, 'eager');
      if (!image?.complete) {
        metrics.pendingImages++;
        return null;
      }
      const width = finite(image.naturalWidth ?? image.width);
      const height = finite(image.naturalHeight ?? image.height);
      if (width <= 0 || height <= 0) {
        if (!failedAssets.has(path)) {
          failedAssets.add(path);
          metrics.failedImages++;
        }
        return null;
      }
      return { image, width, height };
    } catch {
      if (!failedAssets.has(path)) {
        failedAssets.add(path);
        metrics.failedImages++;
      }
      return null;
    }
  }

  function drawBitmap(ctx, cache, path, point, size, rotation, alpha, deps) {
    const decoded = decodedImage(cache, path, deps);
    if (!decoded) return false;
    const { image, width, height } = decoded;
    const scale = size / Math.max(width, height);
    const drawWidth = width * scale;
    const drawHeight = height * scale;
    ctx.save();
    try {
      ctx.translate(point.x, point.y);
      ctx.rotate(rotation);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha *= clamp(alpha, 0, 0.88);
      ctx.filter = 'none';
      ctx.shadowBlur = 0;
      ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    } finally {
      ctx.restore();
    }
    metrics.bitmapLayers++;
    return true;
  }

  function draw(ctx, cache, effect, time, settings = {}, deps = {}) {
    if (!ctx || !effect || typeof ctx.drawImage !== 'function') return false;
    const rememberedPassive = passiveOwners.get(effect);
    const passive = !!rememberedPassive;
    const id = heroIdFor(effect, deps.activeHero, deps.isPassive);
    const profile = PROFILES[id];
    if (!profile) return false;

    const key = actionKey(effect);
    if (!passive && (!key || !isSkillEvent(effect))) return false;
    if (!passive) metrics.skillEvents++;
    else metrics.passiveEvents++;

    const phase = effectAge(effect, time, passive);
    if (!phase) return false;
    const points = pointsFor(effect, finite(time), deps);
    if (!points.length) return false;

    if (budgetFrame !== finite(time)) {
      budgetFrame = finite(time);
      layersThisFrame = 0;
    }
    const lowFx = settings?.lowFx === true;
    const reducedFlash = settings?.reducedFlash === true;
    const opacity = typeof deps.opacity === 'function'
      ? clamp(finite(deps.opacity(settings), 1), 0, 1)
      : clamp(finite(settings?.skillFxOpacity, 1), 0, 1);
    const maxLayers = lowFx ? 8 : 28;
    const life = clamp(1 - phase.age / phase.window, 0, 1);
    const fadeIn = clamp(phase.age / 0.045, 0, 1);
    const strength = opacity * life * fadeIn * (reducedFlash ? 0.52 : 0.78);
    const baseSize = passive
      ? 102
      : key === 'R' ? 158 : key === 'E' ? 132 : key === 'W' ? 118 : 108;
    const size = baseSize * (lowFx ? 0.76 : 1) * (0.92 + Math.sin(Math.PI * Math.min(1, phase.age / phase.window)) * 0.11);
    const angle = angleFor(effect, deps);
    const layerCount = lowFx ? 1 : 2;
    let drawn = 0;

    for (const point of points) {
      for (let layer = 0; layer < layerCount; layer++) {
        if (layersThisFrame >= maxLayers) {
          metrics.frameBudgetSkips++;
          break;
        }
        const path = layer === 0 ? profile.impact : profile.motif;
        const scale = layer === 0 ? 1 : profile.style === 'blade' || profile.style === 'blood-blade' ? 1.42 : 1.24;
        const offset = layer === 0 ? 0 : (profile.style === 'spear-mark' ? 7 : -8);
        const position = { x: point.x + offset, y: point.y + (layer === 1 ? 4 : 0) };
        const rotation = layer === 0 ? 0 : profile.style === 'blade' || profile.style === 'blood-blade'
          ? angle + (passive ? -0.22 : 0.18)
          : profile.style === 'spear-mark' ? angle : 0;
        const alpha = strength * (layer === 0 ? 0.76 : 0.48) * (points.length > 1 ? 0.78 : 1);
        if (drawBitmap(ctx, cache, path, position, size * scale, rotation, alpha, deps)) {
          layersThisFrame++;
          drawn++;
        }
      }
    }
    if (drawn) metrics.composedEvents++;
    return drawn > 0;
  }

  const api = Object.freeze({
    version: VERSION,
    installed: true,
    heroes: HEROES,
    profiles: PROFILES,
    assets: canonicalAssetList(),
    assetsFor,
    markPassive,
    draw,
    metrics: () => Object.freeze({
      ...metrics,
      profiles: Object.keys(PROFILES).length,
      requiredAssets: canonicalAssetList().length,
      failedAssetPaths: Object.freeze([...failedAssets]),
    }),
    audit: () => Object.freeze({
      version: VERSION,
      playableHeroCount: HEROES.length,
      profileCount: Object.keys(PROFILES).length,
      imageOnly: true,
      gameplayMutations: false,
      includesExcludedRianIon: HEROES.includes('rian') || HEROES.includes('ion'),
      allPass: HEROES.length === 8 && Object.keys(PROFILES).length === 8 &&
        !HEROES.includes('rian') && !HEROES.includes('ion') &&
        canonicalAssetList().length === 14,
    }),
  });
  window.__HAPIL_SKILL_VFX_V31519__ = api;
})();
