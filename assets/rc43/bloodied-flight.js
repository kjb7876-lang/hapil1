/* RC43: one travelling bitmap per committed hit. The existing impact queue owns damage. */
(function(root, factory) {
  'use strict';
  const api = factory();
  root.__HAPIL_BLOODIED_FLIGHT_RC43__ = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';
  const prefix = './assets/generated-v31342-rc39/';
  const routes = Object.freeze({
    'mb-dist03': {zone: 'dist03', assets: ['axe_projectile_bloodied.webp']},
    'b02-boss': {zone: 'ep1b02', assets: ['dirty_tissue_projectile_bloodied.webp']},
    'b04-boss': {zone: 'ep1b04', assets: ['kitchen_knife_projectile_bloodied.webp']},
    'b06-boss': {zone: 'ep1b06', assets: ['paper_money_projectile_bloodied.webp', 'golden_treasure_projectile_bloodied.webp']},
    'mb-ep1a09': {zone: 'ep1a09', assets: ['poison_syringe_volley_bloodied.webp']},
    'mb-murder01': {zone: 'murder01', assets: ['car_projectile_bloodied.webp']},
    'mb-murder02': {zone: 'murder02', assets: ['truck_projectile_bloodied.webp']}
  });
  const finite = (v, fallback = 0) => typeof v === 'number' && Number.isFinite(v) ? v : fallback;
  const clamp = (v, low, high) => Math.max(low, Math.min(high, v));

  function assetFor(state, shot) {
    const route = routes[String(shot?.sourceId ?? '')];
    if (!route || state?.zone !== route.zone || shot?.reflected || shot?.friendly) return null;
    const id = shot?.pendingHitId ?? shot?.id ?? 0;
    const serial = typeof id === 'number' && Number.isFinite(id) ? Math.abs(Math.floor(id)) :
      [...String(id)].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);
    return prefix + route.assets[serial % route.assets.length];
  }

  function prepareTransit(state, hit, effect) {
    if (!effect?.bossImpactTransitV31232 || !Number.isFinite(effect.x) ||
        !Number.isFinite(effect.y) || !Number.isFinite(effect.tx) || !Number.isFinite(effect.ty)) return false;
    const authoredAsset = assetFor(state, hit);
    if (!authoredAsset) return false;
    const ledger=globalThis.__HAPIL_COMBAT_SAFETY_RC126__;
    const group=String(hit.bossCastId31210??(String(hit.sourceId)+`:`+Math.round(finite(hit.born,state.time)*1000)));
    const asset=hit.rc126BloodiedAsset??(hit.rc126BloodiedAsset=ledger?.claimAsset(state,hit,authoredAsset,group)??authoredAsset);
    effect.rc126CommonFlight=asset!==authoredAsset;
    const distance = Math.hypot(effect.tx - effect.x, effect.ty - effect.y);
    // A committed hit stays in the native impact queue until the pictured shot arrives.
    const duration = Math.max(clamp(distance / 8, 1.1, 2.3), finite(hit.impactAt) - state.time);
    effect.born = state.time;
    effect.duration = duration;
    effect.sprite = asset;
    effect.fallbackSprite = asset;
    effect.bloodiedFlightRC43 = asset;
    hit.impactAt = state.time + duration;
    hit.transitImpactAtV31232 = hit.impactAt;
    hit.transitFlightSecondsV31232 = duration;
    return true;
  }

  function pose(effect, time, project) {
    if (!effect?.bloodiedFlightRC43 || !effect.bossImpactTransitV31232) return null;
    const duration = finite(effect.duration);
    if (duration <= 0 || !Number.isFinite(time)) return null;
    const progress = clamp((time - finite(effect.born)) / duration, 0, 1);
    const start = project(effect.x, effect.y), end = project(effect.tx, effect.ty);
    return {x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress - 18,
      angle: Math.atan2(end.y - start.y, end.x - start.x), progress};
  }

  function draw(ctx, cache, effect, time, settings, deps) {
    if (!effect?.bloodiedFlightRC43 || !effect.bossImpactTransitV31232) return false;
    const age = time - finite(effect.born), duration = finite(effect.duration);
    if (age < 0 || age >= duration || duration <= 0) return true;
    const originalImage = deps.queue(cache, effect.bloodiedFlightRC43, 'eager');
    if (!originalImage?.complete || !(originalImage.naturalWidth || originalImage.width)) return true;
    const image=effect.rc126CommonFlight?(globalThis.__HAPIL_COMBAT_SAFETY_RC126__?.tintCommon(originalImage,effect.color)??originalImage):originalImage;
    const point = pose(effect, time, deps.project);
    const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
    const vehicle = /(?:truck|car)_projectile/.test(effect.bloodiedFlightRC43);
    const size = vehicle ? 94 : 68, scale = size / Math.max(width, height);
    ctx.save();
    try {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha *= clamp(finite(deps.opacity(settings), 1), 0, 1);
      ctx.shadowBlur = 0;
      ctx.translate(point.x, point.y);
      ctx.rotate(point.angle - finite(effect.spriteHeading));
      ctx.drawImage(image, -width * scale / 2, -height * scale / 2, width * scale, height * scale);
    } finally { ctx.restore(); }
    effect.ordnanceBitmapPathV31322 = effect.bloodiedFlightRC43;
    effect.bloodiedFlightProgressRC43 = point.progress;
    return true;
  }

  return Object.freeze({version: 'RC43', routes, assetFor, prepareTransit, pose, draw});
});
