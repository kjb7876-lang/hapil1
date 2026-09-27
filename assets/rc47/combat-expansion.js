/* RC47: shared device policy and directional absorbed-hit feedback. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.__HAPIL_COMBAT_RC47__ = api;
})(typeof window === 'object' ? window : null, function () {
  'use strict';
  const mobile = () => typeof window === 'object' &&
    (window.__HAPIL_MOBILE_V31366__?.enabled?.() === true ||
      window.matchMedia?.('(pointer: coarse)')?.matches === true);
  const projectileCap = () => mobile() ? 72 : Infinity;
  const barrageCap = () => mobile() ? 48 : Infinity;
  const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;
  const hostile = q => !!q && typeof q === 'object' && finite(q.damage) > 0 &&
    !q.friendly && !q.reflected && !q.visualOnly && !q.damageSuppressedV31226;

  function absorbed(state, target, source, originX, originY) {
    if (!state || !target || !hostile(source) || finite(target.hp) <= 0) return false;
    const now = finite(state.time), old = finite(target.lastGoldImmuneRC47, -99);
    if (now - old < .12) return false;
    target.lastGoldImmuneRC47 = now;
    const x = finite(target.x), y = finite(target.y);
    let sx = finite(source.originX, finite(originX, finite(source.x, x - 1)));
    let sy = finite(source.originY, finite(originY, finite(source.y, y)));
    if (Number.isFinite(source.vx) && Number.isFinite(source.vy) &&
        Math.hypot(source.vx, source.vy) > .01) {
      sx = x - source.vx; sy = y - source.vy;
    }
    (state.effects ??= []).push({
      id: state.fxSerial++, kind: 'goldImmuneRC47', goldImmuneRC47: true,
      x, y, originX: sx, originY: sy, born: now, duration: .32,
      sourceId: source.sourceId ?? source.ownerId ?? '',
    });
    (state.floatTexts ??= []).push({id: state.fxSerial++, x, y, born: now,
      duration: .5, text: 'IMMUNE', color: '#ffd579', critical: false});
    return true;
  }

  function drawGold(ctx, effect, time, settings, project) {
    if (!effect?.goldImmuneRC47) return false;
    const progress = (time - effect.born) / effect.duration;
    if (progress < 0 || progress >= 1) return true;
    const p = project(effect.x, effect.y), origin = project(effect.originX, effect.originY);
    const angle = Math.atan2(origin.y - p.y, origin.x - p.x);
    const alpha = (1 - progress) * (settings?.reducedFlash ? .55 : .9);
    ctx.save();
    try {
      ctx.translate(p.x, p.y - 31);
      ctx.rotate(angle);
      ctx.globalAlpha *= alpha;
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffd579'; ctx.lineWidth = 4 - progress * 2;
      ctx.lineCap = 'round'; ctx.beginPath();
      ctx.arc(0, 0, 20 + progress * 9, -.95, .95); ctx.stroke();
      ctx.strokeStyle = '#fff4be'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(0, 0, 15 + progress * 8, -.7, .7); ctx.stroke();
      for (const sign of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(24, sign * (5 + progress * 7));
        ctx.lineTo(37 + progress * 9, sign * (12 + progress * 12)); ctx.stroke();
      }
    } finally { ctx.restore(); }
    return true;
  }
  return Object.freeze({version: 'RC47', mobile, projectileCap, barrageCap, absorbed, drawGold});
});
