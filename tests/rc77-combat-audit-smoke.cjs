const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const main = read('assets/index-v31526.js');
const html = read('index.html');
const beamAsset = read('assets/rc77/connected-laser.js');

// The helper must be available before the module starts drawing boss attacks.
assert(html.indexOf('./assets/rc77/connected-laser.js') < html.indexOf('./assets/index-v31526.js?v=37900'));
assert.equal((main.match(/__HAPIL_CONNECTED_LASER_V31377__;/g) || []).length, 3,
  'standard boss, blood laser and final boss beams must share the continuous renderer');
assert(!main.includes('len+overlap*2'), 'branch beam textures must not restart at every segment');
assert(main.includes('duration: t.boss ? 2.1 : t.midboss ? 1.72 : 1.05'),
  'telegraphed enemy skills need visible windup/impact time');
assert(main.includes('MONGSE_impactFade = 1 - a * 0.50'),
  'skill impact art must fade more slowly');
assert(main.includes("if(!touch)continue;c.contacts.push({key:stamp,at:s.time})"),
  'the active laser cast must retain its contact sampling path');
assert(main.includes('target===s?Y(s,c.damage,target.x,target.y,h)'),
  'a successful laser contact must route through the actual player damage function');

// Run the real continuous path against crossing and joined segments.
const window = {};
vm.runInNewContext(beamAsset, {window, Math, Number, String, Object, Array});
const stats = {strokes: 0, fills: 0, images: 0, roundCaps: 0, roundJoins: 0};
const context = {
  globalAlpha: 1,
  save() {}, restore() {}, setLineDash() {},
  beginPath() {}, moveTo() {}, lineTo() {},
  stroke() { stats.strokes++; if (this.lineCap === 'round') stats.roundCaps++; if (this.lineJoin === 'round') stats.roundJoins++; },
  arc() {}, fill() { stats.fills++; },
  drawImage() { stats.images++; }
};
const lines = [
  {a: {x: 10, y: 10}, b: {x: 50, y: 50}},
  {a: {x: 50, y: 50}, b: {x: 90, y: 10}},
  {a: {x: 50, y: 50}, b: {x: 50, y: 90}},
];
assert.equal(window.__HAPIL_CONNECTED_LASER_V31377__.render(context, lines,
  {width: 7, color: '#ed4c92', accent: '#fff0fa', alpha: 0.9}), true);
assert.equal(window.__HAPIL_CONNECTED_LASER_V31377__.stats().segments, 3);
assert(window.__HAPIL_CONNECTED_LASER_V31377__.stats().junctions >= 1,
  'laser branches must receive a joined glow at their intersection');
assert.equal(stats.images, 0, 'the joined path must not stitch bitmap strips');
assert(stats.strokes >= 3 && stats.roundCaps >= 3 && stats.roundJoins >= 3);

// Boss palette uniqueness is scoped per encounter map; co-present bosses get clearly separated hues.
const paletteStart = main.indexOf('    function uniqueOwnerPaletteV31377');
const paletteEnd = main.indexOf('\n    function registerOwner', paletteStart);
assert(paletteStart >= 0 && paletteEnd > paletteStart, 'boss palette allocator source is missing');
const paletteContext = {
  themeHue: {infernal: 12, chrono: 190, blackSun: 288, sevenSins: 326, controller: 202, last3: 258, hando: 214, murder: 4, cult: 274, causality: 266},
  usedBossPaletteHuesV31377: new Set(),
  ownerPaletteHuesByZoneV31377: new Map(),
};
vm.runInNewContext(`${main.slice(paletteStart, paletteEnd)}\nglobalThis.assignPalette=uniqueOwnerPaletteV31377;`, paletteContext);
const perZone = new Map();
for (let i = 0; i < 72; i++) {
  const zone = `map-${Math.floor(i / 6)}`;
  const row = paletteContext.assignPalette({id: `boss-${i}`, zone}, {color: '#d33b51'}, 'infernal', i);
  const hue = Number(row.color.match(/^hsl\(([\d.]+)/)[1]);
  const group = perZone.get(zone) || [];
  group.push(hue);
  perZone.set(zone, group);
  assert.match(row.accent, /^hsl\([\d.]+ 100% 82%\)$/);
}
for (const [zone, hues] of perZone) {
  assert.equal(new Set(hues.map(h => h.toFixed(1))).size, hues.length, `${zone} has duplicate boss colors`);
  for (let i = 0; i < hues.length; i++) for (let j = i + 1; j < hues.length; j++) {
    const gap = Math.abs(((hues[i] - hues[j] + 540) % 360) - 180);
    assert(gap >= 23.9, `${zone} co-present boss colors are too similar (${gap.toFixed(1)}°)`);
  }
}
assert(main.includes('uniqueBossBulletPalette:paletteColors.size===owners.size'),
  'the live catalog audit must verify each owner has a distinct color');
assert(main.includes('tintShot(im,q.danmakuColorV31316??q.color)'),
  'the runtime bullet sprite must actually receive its owner color');

// Exercise actual contact, re-hit identity and damage attenuation functions.
const identityStart = main.indexOf('function MONGSE_hostileSkillToken31216');
const identityEnd = main.indexOf('\nfunction MONGSE_projectileEgressRay31215', identityStart);
const limiterStart = main.indexOf('function MONGSE_limitHeroDamage31213');
const limiterEnd = main.indexOf('\nfunction ', limiterStart + 20);
const contactStart = main.indexOf('function HAPIL_reducePlayerContactV31401');
const contactEnd = main.indexOf('\nfunction Ti(', contactStart);
assert(identityStart >= 0 && identityEnd > identityStart && limiterEnd > limiterStart && contactEnd > contactStart);
const combatWindow = {
  __HAPIL_COMBAT_CORE_V31401__: {mark() {}, markIfUnset() {}},
};
const combatContext = {
  window: combatWindow,
  Math, Number, String, Object, Array, Set,
  MONGSE_HAZARD_REHIT_SECONDS_V31215: 0.1,
  wn: () => 'front',
  MONGSE_HERO_DAMAGE_WINDOW_RATIO_V31213: 0.24,
  MONGSE_HERO_DAMAGE_WINDOW_SECONDS_V31213: 1,
  MONGSE_COMBAT_PHYSICS_V3128: {enemyDamageMultiplier: 1, collisionEpsilon: 0.001},
  MONGSE_projectileTelemetryStore31215(state) {
    return state.projectileTelemetry ||= {hitCooldownSuppressed: 0};
  },
};
vm.createContext(combatContext);
vm.runInContext([
  main.slice(identityStart, identityEnd),
  main.slice(limiterStart, limiterEnd),
  main.slice(contactStart, contactEnd),
  'globalThis.applyContact=HAPIL_reducePlayerContactV31401; globalThis.skillIdentity=MONGSE_hostileSkillIdentity31215;'
].join('\n'), combatContext);
const hero = {
  time: 4, hp: 1000, maxHp: 1000, x: 10, y: 10, zone: 'dist01',
  invulnerableUntil: 0, lastDodgeAt: -99, activeHeroId: 'hwando',
  floatTexts: [], fxSerial: 1, resonance: 0, enemies: [],
  heroDamageLedger31213: [], heavyHitDamageLedger31220: [],
};
const attack = id => ({sourceId: 'paired-midboss', id, projectileId: id, attackInstanceIdV31377: id,
  patternKind: 'fan', damage: 20, boss: false, midboss: false});
assert.notEqual(combatContext.skillIdentity(attack('shot-1')), combatContext.skillIdentity(attack('shot-2')));
assert.equal(combatContext.applyContact(hero, 20, 9, 9, attack('shot-1')), true);
assert.equal(hero.hp, 980);
assert.equal(hero.invulnerableUntil, hero.time, 'a hit must not grant blanket follow-up invulnerability');
assert.equal(combatContext.applyContact(hero, 20, 9, 9, attack('shot-2')), true,
  'a second distinct enemy projectile must hit immediately, even from the same pattern');
assert.equal(hero.hp, 962, 'the consecutive hit should deal reduced but nonzero damage');
assert.equal(hero.contactDamageScaleV31535, 0.9);
assert.equal(combatContext.applyContact(hero, 20, 9, 9, attack('shot-1')), false,
  'one still-overlapping projectile must not be counted as a brand-new projectile every frame');
assert.equal(hero.hp, 962);

// Ending cannot commit until the phase-2 grayscale kill has actually completed.
assert(main.includes('final-monochrome-battle-incomplete'));
assert(main.includes('finalBattle?.monochromeActiveV31377 === true'));
assert(main.includes('finalBattle?.finalHitCommittedV31377 === true'));
assert(main.includes('Number(finalBattle?.stage ?? 0) >= 7'));
assert(main.includes('state.bossDefeated === true'));
assert(main.includes('c.filter = t.zone === "cult04"'));
assert(main.includes('grayscale(1) contrast(1.08)'));

console.log('RC77 PASS: grayscale finale gate, all 3 joined laser renderers, distinct vivid owner palettes, real contact damage, no blanket hit i-frames, streak damage reduction, per-projectile repeat guard, and telegraph/impact visibility.');
