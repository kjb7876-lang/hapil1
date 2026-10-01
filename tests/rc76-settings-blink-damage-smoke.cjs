const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const main = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assert(html.includes('./assets/index-v31526.js?v=40401'),
  'the browser must load the RC77 game bundle');
assert(main.includes('MONGSE_applyCheatCode = (0, l.useCallback)'),
  'the 777 progression handler must remain installed');
assert(main.includes('applyCode: MONGSE_applyCheatCode'),
  'the settings panel must receive the existing 777 handler');

// Exercise the actual settings component as a minimal React-element tree.
const componentStart = main.indexOf('function Gi({settings:e');
const componentEnd = main.indexOf('\n}\n\nif (typeof window !== `undefined`)', componentStart);
assert(componentStart >= 0 && componentEnd > componentStart,
  'settings component source was not found');
const hooks = [];
let hookIndex = 0;
const react = {
  useState(initial) {
    const index = hookIndex++;
    if (!(index in hooks)) hooks[index] = initial;
    return [hooks[index], next => {
      hooks[index] = typeof next === 'function' ? next(hooks[index]) : next;
    }];
  }
};
const jsx = (type, props) => ({type, props: props || {}});
const context = {
  l: react,
  q: {jsx, jsxs: jsx},
  HAPIL_AutoBattleSettingsV31301: () => null,
  N: {},
  window: {__HAPIL_MOBILE_V31366__: null}
};
vm.runInNewContext(`${main.slice(componentStart, componentEnd + 2)}\nthis.Settings=Gi;`, context);
const submitted = [];
function renderSettings() {
  hookIndex = 0;
  return context.Settings({
    settings: {}, set() {}, zones: [], currentZone: 'hub', revisit() {},
    returnToTitle() {}, openSystemV31339() {},
    applyCode(code) { submitted.push(code); return {ok: code === '777', message: '코드 승인 테스트'}; }
  });
}
function findNode(node, predicate) {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const child of node) { const found = findNode(child, predicate); if (found) return found; }
    return null;
  }
  if (typeof node !== 'object') return null;
  if (predicate(node)) return node;
  return findNode(node.props?.children, predicate);
}
let tree = renderSettings();
let codeInput = findNode(tree, node => node.type === 'input' && node.props['aria-label'] === '개발자 코드');
assert(codeInput, 'the settings UI must render an input for code 777');
codeInput.props.onChange({target: {value: '777'}});
tree = renderSettings();
codeInput = findNode(tree, node => node.type === 'input' && node.props['aria-label'] === '개발자 코드');
assert.equal(codeInput.props.value, '777', 'the developer code input must retain typed digits');
const form = findNode(tree, node => node.type === 'form' && node.props.className === 'developer-code-form-v31576');
assert(form, 'the 777 code form is missing');
let prevented = false;
form.props.onSubmit({preventDefault() { prevented = true; }});
assert.equal(prevented, true, 'submitting the code should stay in the settings panel');
assert.deepEqual(submitted, ['777'], 'the UI must call the existing 777 handler with the entered value');
tree = renderSettings();
const status = findNode(tree, node => node.type === 'p' && node.props.role === 'status');
assert.equal(status?.props.children, '코드 승인 테스트', 'code response should be visible to the player');

// Manual direction input cancels opposite keys; only the FULL-auto dispatch marker
// can borrow the controller's dodge vector. Separate awakened auto-blink is disabled.
const blinkStart = main.indexOf('function HAPIL_blinkVectorV31345');
const blinkEnd = main.indexOf('\nfunction MONGSE_planAutoSkill', blinkStart);
const blinkContext = {};
vm.runInNewContext(`${main.slice(blinkStart, blinkEnd)}\nthis.blink=HAPIL_blinkVectorV31345;`, blinkContext);
const diagonal = blinkContext.blink(new Set(['ArrowUp', 'ArrowRight']), 1);
assert(Math.abs(diagonal.x - Math.SQRT1_2) < 1e-12 &&
  Math.abs(diagonal.y + Math.SQRT1_2) < 1e-12,
  'directional diagonal blink should be normalized');
assert.deepEqual(JSON.parse(JSON.stringify(blinkContext.blink(new Set(['ArrowLeft', 'ArrowRight']), -1))),
  {x: -1, y: 0});
assert(main.includes('function evasive(){return false;}'),
  'awakening-specific autonomous blink should not teleport the hero');
assert(main.includes("control.effective(b.settings?.current)!=='full'"),
  'general full-auto dodge should remain mode-gated');

// Stress the actual boss phase gate with many oversized hits at one simulation time.
const phaseStart = main.indexOf('function MONGSE_enemyPhase(');
const phaseEnd = main.indexOf('\nfunction MONGSE_unsetPhaseMarker', phaseStart);
const baseStart = main.indexOf('function MONGSE_phaseGateHealth(');
const baseEnd = main.indexOf('\nfunction MONGSE_isLaunchedBossOrMidbossProjectile31221', baseStart);
const wrapperStart = main.indexOf('const MONGSE_phaseGateBaseV31236 = MONGSE_phaseGateHealth;');
const wrapperMarker = 'MONGSE_BOSS_PROGRESSION_HOOKS_V31236.push(`MONGSE_phaseGateHealth`);';
const wrapperEnd = main.indexOf(wrapperMarker, wrapperStart) + wrapperMarker.length;
assert(phaseStart >= 0 && phaseEnd > phaseStart && baseStart >= 0 && baseEnd > baseStart &&
  wrapperStart >= 0 && wrapperEnd > wrapperStart, 'live boss damage gate source was not found');
const damageContext = {
  MONGSE_episodeBossPacing: () => false,
  MONGSE_isPersistentBossCastActive: () => false,
  MONGSE_episodeBossShowcaseState: () => ({ready: true}),
  MONGSE_BOSS_PROGRESSION_HOOKS_V31236: [],
  MONGSE_applyBossProgressionV31236(actor) {
    if (actor.burstDamageRatioV31236 == null) actor.burstDamageRatioV31236 = 0.11;
  },
  MONGSE_finiteBossProgressionV31236(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
};
vm.runInNewContext(`${main.slice(phaseStart, phaseEnd)}\n${main.slice(baseStart, baseEnd)}\n${main.slice(wrapperStart, wrapperEnd)}\nthis.damage= MONGSE_phaseGateHealth;`, damageContext);
const boss = {id: 'test-boss', boss: true, hp: 1000, maxHp: 1000, phaseCount: 3, currentPhase: 1};
const world = {time: 5, zone: 'dist06'};
for (let i = 0; i < 20; i++) boss.hp = damageContext.damage(world, boss, 100000);
assert(boss.hp >= 890, 'one burst window must not multiply the per-hit cap across many projectiles');
assert.equal(boss.burstDamageWindowSpentV31576, 110,
  'the burst budget must count realized health loss, not requested damage');
world.time += 0.2;
boss.hp = damageContext.damage(world, boss, 100000);
assert(boss.hp >= 780, 'a new burst window should release at most one new boss damage budget');

const phaseBoss = {id: 'phase-boss', boss: true, hp: 700, maxHp: 1000, phaseCount: 3, currentPhase: 1};
const phaseWorld = {time: 8, zone: 'dist06'};
phaseBoss.hp = damageContext.damage(phaseWorld, phaseBoss, 100000);
assert.equal(phaseBoss.hp, 660, 'the first phase threshold should hold the boss at 66% HP');
phaseBoss.hp = damageContext.damage(phaseWorld, phaseBoss, 100000);
assert.equal(phaseBoss.currentPhase, 2, 'phase state should refresh immediately after health crosses a threshold');
assert(phaseBoss.hp > 330, 'a same-window projectile burst should not skip into a later phase');

assert(main.includes('tintShot(im,q.danmakuColorV31316??q.color)'),
  'boss-colored jellybean art must be tinted by the owner color at draw time');
assert(main.includes('ctx.lineCap=\'round\';ctx.lineJoin=\'round\''),
  'connected laser geometry should use rounded joined owner-colored strokes');
assert((main.match(/__HAPIL_CONNECTED_LASER_V31377__;/g) || []).length >= 3,
  'standard, blood and final-boss laser renderers must use the shared connected path');
assert(!main.includes('len+overlap*2'),
  'branch lasers must not restart cropped art at every segment');
assert(main.includes('e.invulnerableUntil = e.time'),
  'accepted damage must not grant a blanket post-hit invulnerability interval');
assert(main.includes('attackInstanceIdV31377 ?? e.projectileId'),
  'separate projectiles from one boss skill must keep distinct hit identities');

console.log('PASS: 777 settings submission, directional blink, no awakening auto-blink, boss burst/phase damage limits, rounded laser joins and boss-tinted jellybean rendering.');
