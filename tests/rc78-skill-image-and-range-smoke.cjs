const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const main = read('assets/index-v31526.js');
const html = read('index.html');

// RC77's range table had a 30-unit gunner maximum. Make that same baseline
// the real range exposed to basic attacks, auto targeting, skills, and party AI.
const loopMarker = '/* HAPIL v31365: ranged-only encounter loop. Simulation events own damage;';
const loopStart = main.indexOf(loopMarker);
const rolesStart = main.indexOf(' const roles=Object.freeze({', loopStart);
const rolesEnd = main.indexOf(' });for(const r of Object.values(roles))Object.freeze(r);', rolesStart);
assert(loopStart >= 0 && rolesStart > loopStart && rolesEnd > rolesStart, 'live hero range table is missing');
const rolesText = main.slice(rolesStart, rolesEnd);
const roleRanges = Object.fromEntries([...rolesText.matchAll(/\b(hwando|slayer|neon|michaela|hunter|seoha|lauren|gunner):\{range:(\d+)/g)]
  .map(([, id, range]) => [id, Number(range)]));
assert.deepEqual(Object.keys(roleRanges).sort(), ['gunner', 'hunter', 'hwando', 'lauren', 'michaela', 'neon', 'seoha', 'slayer']);
assert.equal(roleRanges.gunner, 30, 'shared range is anchored to the previously longest ranged hero');
assert.deepEqual(new Set(Object.values(roleRanges)), new Set([30]), 'all eight playable heroes must use the same 30-unit attack range');
assert.equal((rolesText.match(/range:30,/g) || []).length, 8, 'all live role profiles must receive the shared reach');
for (const name of ['assets/rc15/hero-controls.js', 'assets/controller-v31406/hero-controls.js']) {
  const controls = read(name);
  assert(controls.includes('__HAPIL_LOOP_V31365__?.role(h.id).range'), `${name} must use the shared range for auto target selection`);
}
assert(main.includes('window.__HAPIL_COMBAT_V31333__?.radius(a.id)'), 'native basic attacks must use the shared combat radius');
assert(main.includes("key==='A'?(window.__HAPIL_COMBAT_V31333__?.radius(a.heroId)??(ranged?10:3.2))"), 'party basic attacks must use the same combat radius');
assert(html.includes('./assets/index-v31526.js?v=38001'), 'the updated range and skill fallback code must bypass cached bundles');

// Exercise the production warning -> queued impact -> rendered sprite path.
const clearGapStart = main.indexOf('function MONGSE_impactClearGap(');
const clearGapEnd = main.indexOf('\nfunction Di(', clearGapStart);
const drawStart = main.indexOf('function Gn(', main.indexOf('function MONGSE_skillFxOpacity('));
const drawEnd = main.indexOf('\nfunction Kn(', drawStart);
const runtimeStart = main.indexOf('function MONGSE_runtimeSprite(', drawEnd);
const runtimeEnd = main.indexOf('\nfunction MONGSE_phaseSpriteForRender(', runtimeStart);
assert(clearGapStart >= 0 && clearGapEnd > clearGapStart && runtimeEnd > runtimeStart && drawEnd > drawStart);
const queueStart = main.indexOf('function MONGSE_queueReadyTelegraphs(');
const queueEnd = main.indexOf('\nfunction Oi(', queueStart);
assert(queueStart >= 0 && queueEnd > queueStart, 'telegraph release queue function is missing');

const paletteSprite = './assets/vfx/generated/v387/boss-infernal-groundburst.webp';
const bossSprite = './assets/vfx/generated/v387/boss-chrono-time-rupture.webp';
const unavailableMidbossSprite = './assets/vfx/generated/v387/missing-midboss.webp';
const skullCastSprite = './assets/vfx/rc50/demon-skull-cast-clean.png';
const paletteFiles = [
  paletteSprite, bossSprite,
  './assets/vfx/generated/v387/boss-black-sun-eclipse.webp',
  './assets/vfx/generated/v387/boss-causality-reversal.webp',
  skullCastSprite,
];
for (const file of paletteFiles) {
  assert(fs.existsSync(path.join(root, file)), `referenced impact/cast art must exist in the game assets: ${file}`);
}
const loaded = new Set([paletteSprite, bossSprite]);
const queued = [];
const drawn = [];
const window = { __HAPIL_ENEMY_FEEL_V31361__: { strike() {} } };
const context = {
  window, Math, Number, String, Object, Array, Set,
  MONGSE_BOSS_CAST_VFX: { demonSkull: skullCastSprite },
  MONGSE_bossBarragePalette: () => ({theme: 'infernal', color: '#ff5020', accent: '#fff0d8', impactSprite: paletteSprite}),
  Oi: () => false,
  Jt: pattern => pattern === 'boss-pattern' ? bossSprite : pattern === 'midboss-pattern' ? unavailableMidbossSprite : undefined,
  MONGSE_queueImage(_cache, source) {
    queued.push(source);
    return {src: source, complete: loaded.has(source), naturalWidth: loaded.has(source) ? 256 : 0, naturalHeight: loaded.has(source) ? 256 : 0};
  },
  G: (x, y) => ({x: 400 + Number(x) * 10, y: 300 + Number(y) * 10}),
  Kn() {},
  HAPIL_cosmeticClipV31317() {},
};
vm.createContext(context);
vm.runInContext([
  main.slice(clearGapStart, clearGapEnd),
  main.slice(runtimeStart, runtimeEnd),
  main.slice(drawStart, drawEnd),
  main.slice(queueStart, queueEnd),
  'globalThis.runImpact=MONGSE_spawnTelegraphedImpact; globalThis.queueTelegraphs=MONGSE_queueReadyTelegraphs; globalThis.drawImpact=Gn; globalThis.spriteFor=MONGSE_runtimeSprite;'
].join('\n'), context);

const ctx = {
  globalAlpha: 1,
  save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {},
  fill() {}, stroke() {}, arc() {}, translate() {}, rotate() {}, scale() {},
  setLineDash() {}, drawImage(image) { drawn.push(image.src); },
};
const checks = [
  {kind: 'boss', boss: true, patternSet: 'boss-pattern', expected: bossSprite, duration: 2.1},
  {kind: 'midboss', midboss: true, patternSet: 'midboss-pattern', expected: paletteSprite, duration: 1.72},
  {kind: 'standard', expected: paletteSprite, duration: 1.05},
];
for (const [index, item] of checks.entries()) {
  const state = {time: 10, fxSerial: 1, effects: [], enemies: [{id: `owner-${index}`, x: 8, y: 9, boss: !!item.boss, midboss: !!item.midboss, patternSet: item.patternSet}]};
  const warning = {id: `hit-${index}`, sourceId: `owner-${index}`, boss: !!item.boss, midboss: !!item.midboss, patternSet: item.patternSet, at: 10, born: 9.3, x: 11, y: 12, originX: 8, originY: 9, radius: 5, innerRadius: 1.5, width: 1, shape: 'circle', color: '#ff5020', accent: '#fff0d8', damage: 12, perfectWindow: 0};
  state.impactQueue = [];
  context.queueTelegraphs(state, [warning]);
  const impact = state.impactQueue[0];
  assert(impact.impactAt > impact.telegraphEndedAt, `${item.kind}: a visible gap must follow the warning`);
  state.time = impact.impactAt;
  context.runImpact(state, impact);
  const effect = state.effects[0];
  assert(effect && effect.telegraphImpact && effect.born === impact.impactAt, `${item.kind}: resolved warning must create a live impact effect at its damage tick`);
  assert.equal(effect.sprite, item.kind === 'midboss' ? unavailableMidbossSprite : item.expected === paletteSprite && item.kind === 'standard' ? paletteSprite : item.expected);
  assert.equal(effect.fallbackSprite, paletteSprite, `${item.kind}: every telegraphed hit must have a palette image fallback`);
  assert.equal(effect.actualBossSkillVfx, item.kind !== 'standard');
  assert.equal(effect.duration, item.duration, `${item.kind}: impact artwork must remain visible after contact`);
  const picked = context.spriteFor({}, effect.sprite, effect.fallbackSprite);
  assert.equal(picked, item.expected, `${item.kind}: a missing signature bitmap must resolve to the loaded encounter fallback`);
  drawn.length = 0;
  context.drawImpact(ctx, {}, effect, effect.born + effect.duration * 0.5, {lowFx: false, reducedFlash: false, skillFxOpacity: 1});
  assert(drawn.includes(item.expected), `${item.kind}: resolved impact bitmap must be drawn, not only scheduled`);
}

const activeResolutionStart = main.indexOf('let MONGSE_readyImpacts =');
const activeResolutionEnd = main.indexOf('for (let e = 0; e < o.enemies.length;', activeResolutionStart);
const activeResolution = main.slice(activeResolutionStart, activeResolutionEnd);
const imageBeforeDamage = activeResolution.indexOf('MONGSE_spawnTelegraphedImpact(o, e)');
const damageAfterImage = activeResolution.indexOf('Y(\n                      o,', imageBeforeDamage);
assert(imageBeforeDamage >= 0 && damageAfterImage > imageBeforeDamage, 'live game loop must create/draw the impact event before applying its damage');

console.log('RC78 PASS: all eight heroes share the 30-unit gunner baseline; auto, native, and party attacks read the same range; boss, midboss, and regular telegraphs queue damage only after the warning and render a loaded impact image with fallback and retained lifetime.');
