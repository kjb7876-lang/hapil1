(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.__HAPIL_INCOMING_HIT_ART_RC46__ = api;
})(typeof window === 'object' ? window : null, function () {
  'use strict';

  const SWORDS = Object.freeze([
    './assets/rc46/projectiles/sword-katana.webp',
    './assets/rc46/projectiles/sword-bone.webp',
    './assets/rc46/projectiles/sword-arcane.webp',
  ]);
  const IMPACTS = Object.freeze({
    blood: './assets/rc46/impacts/player-blood.webp',
    claw: './assets/rc46/impacts/mob-claw-hit.webp',
    blunt: './assets/rc46/impacts/mob-blunt-hit.webp',
    blade: './assets/rc46/impacts/mob-blade-hit.webp',
    bite: './assets/rc46/impacts/mob-bite-hit.webp',
  });
  const ASSETS = Object.freeze([...SWORDS, ...Object.values(IMPACTS)]);
  const SWORD_SOURCES = new Set(['l301-boss', 'mb-hando03', 'mb-ep1b07']);
  const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

  function swordIndex(projectile, sourceId) {
    const identity = `${sourceId}:${projectile.id ?? ''}:${projectile.born ?? ''}:${projectile.patternId ?? ''}`;
    let hash = 2166136261;
    for (let i = 0; i < identity.length; i++) {
      hash ^= identity.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % SWORDS.length;
  }

  function bindProjectile(projectile) {
    if (!projectile || projectile.echoBoltV31368 || projectile.friendly === true || projectile.team === 'hero') return null;
    const sourceId = String(projectile.sourceId ?? projectile.ownerId ?? '');
    if (!SWORD_SOURCES.has(sourceId)) return null;
    const sprite = SWORDS[swordIndex(projectile, sourceId)];
    projectile.sprite = sprite;
    projectile.fallbackSprite = sprite;
    projectile.spriteHeading = -Math.PI / 4;
    projectile.imageOnly = true;
    projectile.swordHiltProjectileRC46 = true;
    return sprite;
  }

  function meleeImpactKind(source, actor) {
    if (!String(source?.id ?? '').startsWith('melee:')) return null;
    const identity = [actor?.id, actor?.kind, actor?.type, actor?.name, source?.attackName]
      .filter(Boolean).join(' ').toLowerCase();
    if (/mb-hando03|mb-ep1b07|sword|blade|knight|warrior|검|칼|기사|무사/.test(identity)) return 'blade';
    if (/golem|brute|tank|construct|guardian|giant|골렘|수호자|거인|중갑/.test(identity)) return 'blunt';
    if (/bite|fang|devour|wolf|hound|beast|slime|mimic|포식|이빨|물기|늑대|야수|짐승|슬라임/.test(identity)) return 'bite';
    if (/claw|spider|demon|gargoyle|talon|발톱|거미|악마|가고일/.test(identity)) return 'claw';
    return 'claw';
  }

  function nextEffectId(state) {
    const id = finite(state.fxSerial, 1);
    state.fxSerial = id + 1;
    return id;
  }

  function addHitEffect(state, target, sprite, category, size, opacity, sourceId) {
    if (!Array.isArray(state.effects)) state.effects = [];
    const x = finite(target?.x), y = finite(target?.y);
    state.effects.push({
      id: nextEffectId(state),
      kind: 'enemyProjectile', shape: 'bullet', size: 0.1,
      color: category === 'blood' ? '#bd252d' : '#ffb6a0',
      accent: '#fff0e8',
      sprite, fallbackSprite: sprite, spriteHeading: 0, imageOnly: true,
      x, y, tx: x, ty: y,
      born: finite(state.time), duration: category === 'blood' ? 0.28 : 0.24,
      hitArtRC46: true, hitArtCategoryRC46: category,
      hitArtSizeRC46: size, hitArtOpacityRC46: opacity,
      incomingHitVisualRC46: true, sourceId,
    });
    if (state.effects.length > 96) state.effects.splice(0, state.effects.length - 96);
  }

  function onPlayerDamage(state, target, source, loss) {
    if (!state || !(loss > 0) || !target) return false;
    const sourceId = String(source?.sourceId ?? source?.ownerId ?? source?.id ?? '');
    const actor = (state.enemies ?? []).find(enemy => String(enemy.id) === sourceId || String(enemy.id) === String(source?.sourceId ?? source?.ownerId ?? ''));
    addHitEffect(state, target, IMPACTS.blood, 'blood', 43, 0.58, sourceId);
    const melee = meleeImpactKind(source, actor);
    if (melee) addHitEffect(state, target, IMPACTS[melee], melee, 56, 0.68, sourceId);
    return true;
  }

  return Object.freeze({
    version: 'RC46', assets: ASSETS, swords: SWORDS, impacts: IMPACTS,
    bindProjectile, meleeImpactKind, onPlayerDamage,
  });
});
