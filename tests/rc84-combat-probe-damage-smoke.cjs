const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const game = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const policy = fs.readFileSync(path.join(root, 'assets/rc79/combat-policy.js'), 'utf8');

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0, `${name} must exist`);
  const end = source.indexOf('\n}\n', start);
  assert(end > start, `${name} must have a complete body`);
  return source.slice(start, end + 2);
}

const sandbox = {};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(policy, sandbox);
vm.runInContext([
  'var HAPIL_COUNTER_STAGGER_V31303 = Object.freeze({ boss: 36, midboss: 44 });',
  extractFunction(game, 'HAPIL_finiteV31303'),
  extractFunction(game, 'HAPIL_bossCastDamageFactorV31342'),
  extractFunction(game, 'HAPIL_applyCounterDamageV31303'),
].join('\n'), sandbox);

for (const { label, boss, stagger } of [
  { label: 'boss', boss: true, stagger: 36 },
  { label: 'midboss', boss: false, stagger: 44 },
]) {
  const oldFixtureBudget = sandbox.__HAPIL_RC79__.balancedDamage(
    { time: 10.6 },
    { hp: 500, maxHp: 500, boss, midboss: !boss },
    118,
  );
  assert.equal(
    oldFixtureBudget,
    boss ? 40 : 70,
    `${label}: 500 HP synthetic target hits the documented per-second damage ceiling`,
  );

  const enemy = { hp: 2000, maxHp: 2000, boss, midboss: !boss, stagger: 0, maxStagger: 500 };
  const state = { time: 10.6 };
  const reward = { claimed: true, damageMultiplier: 1.18, stagger, cycle: 1 };
  const result = sandbox.HAPIL_applyCounterDamageV31303(state, enemy, 100 * reward.damageMultiplier, reward);
  assert.equal(result.hpBefore, 2000, `${label}: test fixture starts above damage-budget cap`);
  assert.equal(result.hpAfter, 1941, `${label}: counter hit applies 1.18× then the shared 0.5× enemy-damage factor`);
  assert.equal(result.appliedDamage, 59, `${label}: actual counter damage is 59 after the shared half factor`);
  assert.equal(result.staggerBonus, stagger, `${label}: counter stagger is preserved`);
}

const probe = game.slice(game.indexOf('function HAPIL_probeCombatFlowV31303()'), game.indexOf('if (typeof window !== "undefined")', game.indexOf('function HAPIL_probeCombatFlowV31303()')));
assert(probe.includes('hp: 2000'), 'boss and midboss smoke fixtures must clear the production damage budget');
assert(probe.includes('damage.hpAfter === 1941'), 'boss gate must expect the shared half-damage factor');
assert(probe.includes('midDamage.hpAfter === 1941'), 'midboss gate must expect the shared half-damage factor');

console.log('RC84 PASS: boss and midboss startup probes validate full counter hits above production damage caps.');
