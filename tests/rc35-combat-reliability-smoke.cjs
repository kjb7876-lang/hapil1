const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const main = read('assets/index-v31526.js');
const geometrySource = read('assets/combat-v31402/contact-geometry.js');
const coreSource = read('assets/combat-v31402/combat-core.js');
const outgoingSource = read('assets/combat-v31412/outgoing-native.js');

assert(html.includes('./assets/index-v31526.js?v=33501'),
  'main bundle cache key was not advanced for RC35');
assert(html.indexOf('./assets/combat-v31402/combat-core.js?v=33501') <
  html.indexOf('./assets/combat-v31412/outgoing-native.js?v=33501'));
assert(html.indexOf('./assets/combat-v31412/outgoing-native.js?v=33501') <
  html.indexOf('./assets/combat-v31402/contact-geometry.js?v=33501'));
assert(html.indexOf('./assets/combat-v31402/contact-geometry.js?v=33501') <
  html.indexOf('./assets/index-v31526.js?v=33501'));
for (const file of ['story-v31300.js', 'story-delta-v314rc3.js', 'patient-journal-v31368.js'])
  assert(html.includes(`./data/${file}?v=33501`), `${file} cache key did not advance`);
for (const file of ['data/story-v31300.js', 'data/story-delta-v314rc3.js',
  'data/patient-journal-v31368.js']) {
  const text = read(file);
  assert(text.includes('그들은 ID(이드)'), `${file} is missing the corrected wording`);
  assert(!text.includes('그들을 ID(이드)'), `${file} still contains the old wording`);
}

const geometryWindow = {
  __HAPIL_PARTY_V31322__: {state: null, actors: []},
  __HAPIL_COMBAT_V31333__: {
    core(actor) { return {x: actor.x * 40, y: actor.y * 24}; },
    frozen() { return false; }
  }
};
vm.runInNewContext(geometrySource, {window: geometryWindow});
const geometry = geometryWindow.__HAPIL_GEOMETRY_V31402__.create({
  project(x, y) { return {x: x * 40, y: y * 24}; },
  heroes() { return [{id: 'hwando'}]; },
  combat: {captureEvidence() {}}
});
assert.equal(geometry.cfg.maxFrame, 0.28,
  'mobile frame hitch still discards the measured movement sweep');

for (const zone of ['dist06', 'ep1a11', 'ep1b05', 'hell']) {
  const party = geometryWindow.__HAPIL_PARTY_V31322__;
  const hero = {zone, time: 0, activeHeroId: '777', x: 0, y: 1, hp: 100};
  party.state = hero;
  geometry.capture(hero);
  hero.time = 0.18;
  hero.x = 3;
  assert.equal(geometry.hero(hero), true, `unlisted 777 hero rejected in ${zone}`);
  const q = {x: 1.5, y: 1, previousX: 1.5, previousY: 1,
    radius: 0.2, visualYV31333: 0, visualScaleV31224: 1.22};
  assert.equal(geometry.projectile(hero, hero, q).hit, true,
    `moving projectile missed a measured 180 ms player sweep in ${zone}`);
}

const party = geometryWindow.__HAPIL_PARTY_V31322__;
const scaledHero = {zone: 'hell', time: 2, activeHeroId: 777, x: 0, y: 1, hp: 100};
party.state = scaledHero;
geometry.capture(scaledHero);
scaledHero.time = 2.05;
const expanded = {x: 0, previousX: 0, y: 1 + 22 / 24,
  previousY: 1 + 22 / 24, radius: 0.2, visualYV31333: 0,
  visualScaleV31224: 1.22};
assert.equal(geometry.projectile(scaledHero, scaledHero, expanded).hit, true,
  'enlarged image collision envelope was not included in projectile contact');

const coreWindow = {};
vm.runInNewContext(coreSource, {window: coreWindow});
const core = coreWindow.__HAPIL_COMBAT_CORE_V31401__;
const resolved = {id: '777', currentPhase: 2, hp: 500, maxHp: 500};
const world = {zone: 'hell', time: 1, enemies: [resolved]};
core.enemy(world, {id: 777, currentPhase: 0}, 1, null, () => true);
const event = core.snapshot(world).events.at(-1);
assert.equal(event.targetPhaseBefore, 2,
  'numeric/string minion IDs resolved to the stale attack hint instead of the live target');

const gameWindow = {__HAPIL_COMBAT_CORE_V31401__: core};
vm.runInNewContext(outgoingSource, {window: gameWindow});
const minion = {id: '777', hp: 500, maxHp: 500, x: 10, y: 10,
  stagger: 0, maxStagger: 100, staggerUntil: 0, boss: false, midboss: false};
const state = {zone: 'hell', time: 3, activeHeroId: 777, activeHeroMastery: 0,
  hp: 80, maxHp: 100, combo: 0, comboUntil: 0, counterUntil: 0,
  damageBuffUntil: 0, awakeningUntil: 0, enemies: [minion], floatTexts: [],
  effects: [], fxSerial: 1, lastLifestealTextAt: -99, lifestealSuppressedUntil: 0};
const native = {
  MONGSE_objectiveDamageAllowedV31309: () => true,
  HAPIL_claimCounterWindowV31303: () => ({damageMultiplier: 1}),
  sr: () => ({damageMultiplier: 1}),
  ir: () => 1,
  HAPIL_effectiveGrowthV31400: () => ({}),
  gr: () => ({level: Number.NaN, powerMultiplier: Number.NaN}),
  MONGSE_infiniteStats: () => ({powerMultiplier: Number.NaN}),
  MONGSE_heroOutgoingModeMultiplier31213: () => Number.NaN,
  HAPIL_applyCounterDamageV31303(_state, enemy, damage) {
    enemy.hp -= damage;
    return {hpAfter: enemy.hp, appliedDamage: damage};
  },
  MONGSE_triggerEnemyBreak() {},
  HAPIL_awardComboMilestoneV31303() {},
  HAPIL_bindDamageHitV31315(effect) { return effect; },
  MONGSE_attachEffectTarget(effect) { return effect; },
  MONGSE_beginNarrativeAttack() {},
  MONGSE_enemyPhase() { return 1; },
  MONGSE_enemyActivePhase() { return 1; }
};
const outgoing = gameWindow.__HAPIL_OUTGOING_V31402__.create({
  P: {current: state}, R: {current: {damage: 0}}, Re: {current: false},
  Ke() {}, native
});
outgoing({id: 777}, 16, '#fff', false, 0, null);
assert(minion.hp < 500,
  '777 hero did not damage the live minion with numeric/string IDs and incomplete mastery data');
assert(Number.isFinite(minion.hp), '777 outgoing damage became non-finite');

const contactStart = main.indexOf('function HAPIL_reducePlayerContactV31401');
const contactEnd = main.indexOf('\nfunction ', contactStart + 20);
const contact = main.slice(contactStart, contactEnd);
assert(contact.includes('MONGSE_contactDamageScaleV31535'),
  'consecutive-hit damage attenuation is missing');
assert(contact.includes('Math.min(5, MONGSE_recentContactHitsV31535) * 0.1'),
  'consecutive-hit ramp or its 50% floor changed unexpectedly');
assert(contact.includes('e.invulnerableUntil = e.time + 0.1'),
  'player contact interval is not 0.1 seconds');
assert(main.includes('MONGSE_HAZARD_REHIT_SECONDS_V31215 = 0.1'));
assert(main.includes('MONGSE_COMBAT_PHYSICS_V3128.projectileCap === 72'));
assert(main.includes('projectiles: 64'));
assert(main.includes('visualScaleV31224: Math.min(1.5'));
assert(main.includes('MONGSE_context31219.scale(1.22, 1.22)'));

const mixedStart = main.indexOf('function MONGSE_spawnBossSpecificMixed31219');
const mixedEnd = main.indexOf('\n  function ', mixedStart + 20);
const mixed = main.slice(mixedStart, mixedEnd);
assert(mixed.includes('switch (MONGSE_cycle31219 % 4)'));
for (const name of ['MONGSE_spawnVerticalTombstones31219',
  'MONGSE_spawnHorizontalTombstones31219', 'MONGSE_spawnDiagonalGraveCross31219',
  'MONGSE_spawnDelayedMonolithBurst31219']) assert(mixed.includes(name), `${name} missing from rotation`);
assert(!mixed.includes('MONGSE_first31219 + MONGSE_second31219'),
  'the overlapping mixed barrage returned');
const mixedCalls = [];
const mixedAttack = vm.runInNewContext(`${mixed}\nMONGSE_spawnBossSpecificMixed31219`, {
  MONGSE_spawnVerticalTombstones31219() { mixedCalls.push('vertical'); return 1; },
  MONGSE_spawnHorizontalTombstones31219() { mixedCalls.push('horizontal'); return 1; },
  MONGSE_spawnDiagonalGraveCross31219() { mixedCalls.push('diagonal'); return 1; },
  MONGSE_spawnDelayedMonolithBurst31219() { mixedCalls.push('radial'); return 1; }
});
for (let cycle = 0; cycle < 4; cycle++)
  assert.equal(mixedAttack({}, {barrageCycle31219: cycle}, {densityScale: 1}), 1);
assert.deepEqual(mixedCalls, ['vertical', 'horizontal', 'diagonal', 'radial'],
  'one new multidirectional family was not selected for each cast');

const signatureStart = main.indexOf('function MONGSE_signatureBulletCount31212');
const signatureEnd = main.indexOf('\nfunction ', signatureStart + 20);
const signatureSource = main.slice(signatureStart, signatureEnd);
const signatureCount = vm.runInNewContext(`${signatureSource}\nMONGSE_signatureBulletCount31212`, {
  MONGSE_enemyActivePhase() { return 1; }
});
assert.deepEqual(['lane', 'mine', 'chain', 'fan'].map(kind => signatureCount({}, kind)),
  [10, 9, 11, 12], 'regular boss pattern counts did not shrink as expected');

const heelStart = main.indexOf('`붉은 하이힐 · 선택권 절단`');
const lust = main.slice(heelStart, heelStart + 700);
assert(heelStart > 0, 'Lust high-heel skill entry is missing');
assert(lust.includes('impactSprite: MONGSE_EP1B_CANON_PHASE0_ASSETS.ep1b05.vfx'));
assert(lust.includes('impactFallbackSprite: MONGSE_SEVEN_SINS_THROWABLES.lust'));
const legacyHeelStart = main.indexOf('`붉은 하이힐 절단`');
const legacyHeel = main.slice(legacyHeelStart, legacyHeelStart + 650);
assert(legacyHeelStart > 0, 'legacy Lust high-heel skill entry is missing');
assert(legacyHeel.includes('sevenSinMechanic: `lust-charm`'));
assert(legacyHeel.includes('impactSprite: MONGSE_EP1B_CANON_PHASE0_ASSETS.ep1b05.vfx'));
assert(legacyHeel.includes('impactFallbackSprite: MONGSE_SEVEN_SINS_THROWABLES.lust'));
assert(main.includes('a11-cosmic-v31318'), 'Cosmic Lucifer second form is missing from the audited bundle');
assert(read('assets/rc33/boss-laser-render.js').includes('a11-cosmic-v31318'));

console.log('PASS: 777 hero projectile contact across story/hell/boss maps, 180 ms mobile sweep, enlarged contact envelope, mixed-type minion damage, 0.1 s hit interval, streak reduction, rotating readable barrages, Lust high-heel art route, and Cosmic Lucifer route.');
