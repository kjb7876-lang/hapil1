(() => {
  'use strict';

  const KEY = '__HAPIL_ROOT_HIT_RC210__';
  const ROOT_ID = 'dist00-boss';
  const ROOT_ART = './assets/vfx/v31330/dist00-boss/beam_rc25.png';
  const ROOT_DOT_TICKS = 3;
  const ROOT_DOT_INTERVAL = 0.7;
  const ROOT_OWNER = Object.freeze({
    id: ROOT_ID,
    name: '뿌리의 문지기',
    zone: 'dist00',
    color: '#d86589',
    accent: '#ffdee9',
    mechanic: 'chain',
    assets: Object.freeze([ROOT_ART]),
    projectile: ROOT_ART,
    impact: ROOT_ART,
  });
  let attempts = 0;

  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  function sourceId(hit) {
    return String(hit?.sourceId ?? hit?.sourceBossId ?? hit?.ownerId ?? hit?.actorId ?? '');
  }
  function rootSourceId(hit) {
    return String(hit?.themeOwnerV31323 ?? hit?.sourceBossId ?? hit?.rootOwnerId ??
      hit?.sourceId ?? hit?.ownerId ?? hit?.actorId ?? '');
  }
  function isRootHit(hit) {
    return rootSourceId(hit) === ROOT_ID;
  }
  function ownerId(value) {
    return typeof value === 'string'
      ? value
      : String(value?.themeOwnerV31323 ?? value?.sourceBossId ?? value?.rootOwnerId ??
        value?.ownerId ?? value?.actorId ?? value?.id ?? sourceId(value));
  }

  function installRootProjectileEmissionTagger() {
    const bridge = window.__HAPIL_RC86_BRIDGE__;
    if (!window.__HAPIL_DANMAKU_RPG_RC88__?.installed ||
        typeof bridge?.persistentTick !== 'function') return false;
    const tick = bridge.persistentTick;
    if (tick.__rootOwnerRC210) {
      window.__HAPIL_ROOT_PROJECTILE_ART_RC210__ = Object.freeze({
        installed: true, rootArt: ROOT_ART,
      });
      return true;
    }
    const tagRootEmitterAssets = function tagRootEmitterAssetsRC210(state, ...args) {
      const result = tick.apply(this, [state, ...args]);
      for (const projectile of state?.hostileProjectiles ?? []) {
        if (projectile?.rc88Bullet !== true ||
            String(projectile.sourceBossId ?? projectile.rootOwnerId ?? '') !== ROOT_ID) continue;
        projectile.sprite = ROOT_ART;
        projectile.fallbackSprite = ROOT_ART;
      }
      return result;
    };
    Object.defineProperty(tagRootEmitterAssets, '__rootOwnerRC210', { value: true });
    bridge.persistentTick = tagRootEmitterAssets;
    if (bridge.persistentTick?.__rootOwnerRC210 !== true) return false;
    window.__HAPIL_ROOT_PROJECTILE_ART_RC210__ = Object.freeze({
      installed: true, rootArt: ROOT_ART,
    });
    return true;
  }

  function installRootProjectileRenderer() {
    const renderer = window.__HAPIL_RC15__;
    if (!renderer?.drawRootProjectile || renderer.drawRootProjectile.__rootOwnerRC210) return true;
    const drawBase = renderer.drawRootProjectile;
    const drawRoot = function drawRootOwnedProjectileRC210(ctx, cache, projectile, time, settings) {
      if (isRootHit(projectile)) {
        return drawBase(ctx, cache, { ...projectile, sourceId: ROOT_ID }, time, settings);
      }
      return drawBase(ctx, cache, projectile, time, settings);
    };
    Object.defineProperty(drawRoot, '__rootOwnerRC210', { value: true });
    window.__HAPIL_RC15__ = Object.freeze({ ...renderer, drawRootProjectile: drawRoot });
    return true;
  }

  function queueRootDots(state, target, hit) {
    const boss = (state.enemies ?? []).find(actor => actor?.id === ROOT_ID && actor.hp > 0);
    if (!boss || !Array.isArray(state.pendingHits) ||
        number(boss.themeFollowupReadyV31323) > state.time ||
        state.pendingHits.filter(packet => packet?.themeFollowupV31323).length >= 4) return false;

    const x = number(hit.x, number(target.x, state.x));
    const y = number(hit.y, number(target.y, state.y));
    const totalDamage = Math.max(3, number(hit.damage, 14) * .18);
    const damagePerTick = Math.max(1, Math.round(totalDamage / ROOT_DOT_TICKS));
    for (let index = 0; index < ROOT_DOT_TICKS; index++) {
      const tick = index + 1;
      state.pendingHits.push({
        id: state.fxSerial++,
        sourceId: ROOT_ID,
        born: state.time,
        at: state.time + ROOT_DOT_INTERVAL * tick,
        x, y, originX: x, originY: y,
        damage: damagePerTick,
        boss: true,
        midboss: false,
        shape: 'circle',
        radius: 1.85,
        innerRadius: 0,
        width: .55,
        color: ROOT_OWNER.color,
        accent: ROOT_OWNER.accent,
        status: 'none',
        statusValue: 0,
        label: `뿌리 지속 피해 · ${tick}/${ROOT_DOT_TICKS}`,
        themeFollowupV31323: true,
        themeMechanicV31323: 'chain',
        themeZoneV31323: state.zone,
        themeBornV31323: state.time,
        themeRootDotRC210: true,
        rootFollowupRC210: true,
        rootDotTickRC210: tick,
        perfectWindow: .17,
        sprite: ROOT_ART,
        telegraphSpriteV31224: ROOT_ART,
        impactSpriteV31224: ROOT_ART,
      });
    }
    boss.themeFollowupReadyV31323 = state.time + 4.6;
    return true;
  }

  function install() {
    if (window[KEY]?.installed) return true;
    const theme = window.__HAPIL_THEME_V31323__;
    if (!theme?.installed || typeof theme.owner !== 'function' || typeof theme.afterDamage !== 'function') return false;

    const baseOwner = theme.owner;
    const baseAfterDamage = theme.afterDamage;
    const owner = value => ownerId(value) === ROOT_ID ? ROOT_OWNER : baseOwner(value);
    const afterDamage = (state, target, hit) => {
      if (!isRootHit(hit) || hit?.themeFollowupV31323 || hit?.rootFollowupRC210)
        return baseAfterDamage(state, target, hit);

      let packet = hit;
      if (hit.themeMechanicV31323 !== 'chain' || !hit.color || hit.themeOwnerV31323 !== ROOT_ID) {
        packet = { ...hit, themeOwnerV31323: ROOT_ID, themeMechanicV31323: 'chain', color: hit.color ?? ROOT_OWNER.color };
        try { hit.themeOwnerV31323 = ROOT_ID; hit.themeMechanicV31323 = 'chain'; hit.color ??= ROOT_OWNER.color; }
        catch { /* immutable source packets use the tagged copy for mechanic routing */ }
      }
      const rooted = baseAfterDamage(state, target, packet);
      if (rooted) {
        const text = state.floatTexts?.at?.(-1);
        if (text?.text === '사슬 속박 · 1초') text.text = '뿌리 속박 · 1초';
        queueRootDots(state, target, packet);
      }
      return rooted;
    };

    const catalog = theme.catalog && !theme.catalog.owners?.some(row => row.id === ROOT_ID)
      ? Object.freeze({ ...theme.catalog, owners: Object.freeze([...(theme.catalog.owners ?? []), ROOT_OWNER]) })
      : theme.catalog;
    const updated = Object.freeze({ ...theme, catalog, owner, afterDamage });
    window.__HAPIL_THEME_V31323__ = updated;
    if (window.__HAPIL_THEME_V31324__) window.__HAPIL_THEME_V31324__ = updated;
    window[KEY] = Object.freeze({
      installed: true,
      version: '3.15-RC210',
      rootId: ROOT_ID,
      rootArt: ROOT_ART,
      owner: ROOT_OWNER,
      ownerFor: owner,
      isRootHit,
      afterDamage,
      policy: Object.freeze({ bindSeconds: 1, damageOverTimeTicks: ROOT_DOT_TICKS, tickIntervalSeconds: ROOT_DOT_INTERVAL, respectsNativeInvulnerability: true }),
    });
    return true;
  }

  function ready() {
    const combatReady = install();
    const rendererReady = installRootProjectileRenderer();
    const emissionReady = installRootProjectileEmissionTagger();
    if (combatReady && rendererReady && emissionReady) return;
    if (++attempts < 640) setTimeout(ready, 0);
  }
  ready();
})();
