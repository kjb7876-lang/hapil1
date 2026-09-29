const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const balancePath = path.join(root, 'assets/rc34/balance-and-resonance.js');
const outgoingPath = path.join(root, 'assets/combat-v31412/outgoing-native.js');
const plugin = fs.readFileSync(balancePath, 'utf8');
const outgoingPlugin = fs.readFileSync(outgoingPath, 'utf8');

assert(html.indexOf('./assets/rc34/balance-and-resonance.js?v=33401') <
  html.indexOf('./assets/combat-v31412/outgoing-native.js'),
'the damage bridge must load before the main game bundle binds incoming damage');
assert(html.includes('./assets/rc33/boss-laser-render.js?v=33402'),
  'the generated Seven Sins laser routes must load with the RC34 asset version');

const calls = {player: [], ally: [], draws: []};
const originalCore = Object.freeze({
  player(state, amount, x, y, source) {
    calls.player.push({state, amount, x, y, source});
    return amount;
  },
  ally(state, actor, amount, source, reduce) {
    calls.ally.push({state, actor, amount, source});
    return typeof reduce === 'function' ? reduce(state, actor, amount, source) : amount;
  }
});
let scopedActor = null;
class FakeImage {
  set src(value) {
    this._src = String(value);
    this.complete = true;
    this.naturalWidth = 1254;
    this.naturalHeight = 1254;
    this.width = 1254;
    this.height = 1254;
    this.onload?.();
  }
  get src() { return this._src; }
  get currentSrc() { return this._src; }
}
const lasers = {
  draw(ctx) {
    calls.draws.push('base');
    return 'base-result';
  }
};
const window = {
  __HAPIL_COMBAT_CORE_V31401__: originalCore,
  __HAPIL_COMBAT_CORE_V31402__: originalCore,
  __HAPIL_PARTY_V31322__: {
    incomingTarget(state) { return scopedActor ?? state; },
    blocksSave() { return false; },
    state: null,
    actors: []
  },
  __HAPIL_LASERS_V31330__: lasers,
  __HAPIL_RC33__: {installed: true},
  __HAPIL_CHANNEL_V31364__: {active(_state, actor) { return actor?.resonating === true; }},
  __HAPIL_COMBAT_V31333__: {core(point) { return {x: point.x * 40, y: point.y * 24}; }},
  Image: FakeImage,
  document: {baseURI: 'https://example.test/hapil1/'},
  location: {href: 'https://example.test/hapil1/'},
  URL
};
vm.runInNewContext(plugin, {window, URL, setTimeout(fn) { fn(); }});

const rc34 = window.__HAPIL_RC34__;
assert.equal(rc34.installed, true);
assert.equal(rc34.percentDamageMultiplier, 2);
assert.equal(rc34.lifestealMultiplier, 0.5);
const core = window.__HAPIL_COMBAT_CORE_V31401__;
const host = {maxHp: 200, x: 4, y: 8, hp: 100, time: 1};
const heavyBossShot = {boss: true, heavyBossSkill: true, damage: 10};
assert.equal(core.player(host, 20, 4, 8, heavyBossShot), 30,
  'boss max-HP component was not added twice');
assert.equal(core.player(host, 20, 4, 8,
  {midboss: true, heavyBossSkill: true}), 26,
'midboss max-HP component was not added twice');
assert.equal(core.player(host, 20, 4, 8, {boss: true}), 20,
  'ordinary boss damage was changed');
assert.equal(core.player(host, 20, 4, 8,
  {boss: true, shape: 'line'}), 30,
'heavy beam without the explicit heavyBossSkill marker missed the host ratio');
assert.equal(core.player(host, 20, 4, 8,
  {boss: true, heavyBossSkill: true, friendly: true}), 20,
'friendly projectile was incorrectly boosted');

const ally = {maxHp: 240, x: 12, y: 10, hp: 120};
assert.equal(core.ally({}, ally, 20, heavyBossShot, (_s, actor, amount, source) =>
  amount + Math.round(actor.maxHp * (source.boss ? 0.025 : 0.015))), 32,
  'direct ally heavy-hit damage did not double the 2.5% ratio');
assert.equal(core.ally({}, ally, 20, {boss: true, shape: 'line'}, (_s, _actor, amount) => amount), 32,
  'direct ally heavy-beam damage did not double the 2.5% ratio');
scopedActor = ally;
assert.equal(core.player(host, 20, 12, 10, heavyBossShot), 26,
  'party-scoped player damage did not add the remaining ally max-HP ratio');
scopedActor = null;

const auraCtx = {
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  filter: 'none',
  stack: [],
  calls: [],
  save() { this.stack.push([this.globalAlpha, this.globalCompositeOperation, this.filter]); },
  restore() { [this.globalAlpha, this.globalCompositeOperation, this.filter] = this.stack.pop(); },
  translate() {},
  rotate() {},
  drawImage(image, ...args) { this.calls.push({source: image.src, args, operation: this.globalCompositeOperation}); }
};
const resonating = {x: 9, y: 12, hp: 100, resonating: true};
window.__HAPIL_PARTY_V31322__.state = resonating;
const auraResult = lasers.draw(auraCtx, new Map(), resonating, {});
assert.equal(auraResult, 'base-result');
assert.equal(auraCtx.calls.length, 1, 'gold aura bitmap was not drawn during resonance');
assert(auraCtx.calls[0].source.includes('nuri-origin-aura.webp?v=33401'));
assert.equal(auraCtx.calls[0].operation, 'screen');
resonating.resonating = false;
lasers.draw(auraCtx, new Map(), resonating, {});
assert.equal(auraCtx.calls.length, 1, 'gold aura remained visible after resonance ended');
const auraBytes = fs.readFileSync(path.join(root, 'assets/vfx/rc34/nuri-origin-aura.webp'));
assert.equal(auraBytes.toString('ascii', 0, 4), 'RIFF');
assert.equal(auraBytes.toString('ascii', 8, 12), 'WEBP');

const outgoingCalls = {healRate: null, options: null};
const enemy = {id: 'test-enemy', hp: 500, maxHp: 500, x: 10, y: 10,
  stagger: 0, maxStagger: 100, staggerUntil: 0, boss: false, midboss: false};
const state = {
  time: 5, activeHeroId: 'hwando', activeHeroMastery: 0,
  hp: 50, maxHp: 200, combo: 0, comboUntil: 0, counterUntil: 0,
  damageBuffUntil: 0, awakeningUntil: 0, enemies: [enemy],
  floatTexts: [], effects: [], fxSerial: 1, lastLifestealTextAt: -99,
  lifestealSuppressedUntil: 0
};
window.__HAPIL_COMBAT_CORE_V31401__ = {
  enemy(_state, _target, _damage, _source, reduce, options) {
    outgoingCalls.options = options;
    return reduce();
  },
  computed() {},
  mark() {},
  outgoingHeal() {}
};
window.__HAPIL_HELL_V31322__ = {
  lifestealAmount(_actor, damage, rate, suppression) {
    outgoingCalls.healRate = rate;
    return Math.round(damage * rate * suppression);
  }
};
const native = {
  MONGSE_objectiveDamageAllowedV31309: () => true,
  HAPIL_claimCounterWindowV31303: () => ({damageMultiplier: 1}),
  sr: () => ({damageMultiplier: 1}),
  ir: () => 1,
  HAPIL_effectiveGrowthV31400: () => ({}),
  gr: () => ({powerMultiplier: 1, level: 0}),
  MONGSE_infiniteStats: () => ({powerMultiplier: 1}),
  MONGSE_heroOutgoingModeMultiplier31213: () => 1,
  HAPIL_applyCounterDamageV31303: (_actor, target, amount) => ({
    hpAfter: target.hp - amount,
    appliedDamage: amount
  }),
  MONGSE_triggerEnemyBreak: () => {},
  HAPIL_awardComboMilestoneV31303: () => {},
  HAPIL_bindDamageHitV31315: effect => effect,
  MONGSE_attachEffectTarget: effect => effect,
  MONGSE_beginNarrativeAttack: () => {},
  MONGSE_enemyPhase: () => 1,
  MONGSE_enemyActivePhase: () => 1
};
window.__HAPIL_PARTY_BUFFS_V31322__ = {power: () => 1};
window.__HAPIL_OUTGOING_V31402__ = {};
vm.runInNewContext(outgoingPlugin, {window});
const outgoing = window.__HAPIL_OUTGOING_V31402__.create({
  P: {current: state},
  R: {current: {damage: 0}},
  Re: {current: {}},
  Ke() {},
  native
});
outgoing(enemy, 80, '#fff', false, 0.4, null);
assert.equal(outgoingCalls.healRate, 0.2,
  'Hell-mode lifesteal helper received an unscaled rate');
assert.equal(outgoingCalls.options.lifesteal, 0.2,
  'combat ledger recorded the pre-nerf lifesteal rate');
assert.equal(state.hp, 66,
  'lifesteal did not heal half the previous 40% attack ratio');

state.hp = 50;
window.__HAPIL_HELL_V31322__ = undefined;
outgoing(enemy, 80, '#fff', false, 0.4, null);
assert.equal(state.hp, 66,
  'normal-mode fallback lifesteal did not heal half the previous attack ratio');

console.log('PASS: 2x boss/midboss health-ratio damage for host and allies, 0.5x lifesteal in both branches, and resonance-only golden aura bitmap.');
