const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const controlsSource = read('assets/rc15/hero-controls.js');
const main = read('assets/index-v31526.js');

const choiceSource = controlsSource.match(/function choice\([^\n]+\}/)?.[0];
assert(choiceSource, 'live controller combat-mode resolver is missing');
const choice = vm.runInNewContext(`(${choiceSource})`, {
  MODES: ['manual', 'semi', 'full'],
  binding: null
});
assert.equal(choice({}), 'semi', 'new saves default to semi-automatic');
assert.equal(choice({autoCombat: false}), 'semi', 'legacy autoCombat=false saves migrate to semi-automatic');
assert.equal(choice({autoCombat: true}), 'full', 'legacy autoCombat=true saves retain full automation');
assert.equal(choice({combatMode: 'semi', autoCombat: true}), 'semi', 'explicit semi mode wins over stale legacy flag');
assert.equal(choice({combatMode: 'manual', autoCombat: true}), 'manual', 'explicit manual mode wins over stale legacy flag');

const resolverStart = main.indexOf('function HAPIL_resolveCombatModeV31329');
const fullModeStart = main.indexOf('\nfunction HAPIL_isFullAutoV31329', resolverStart);
const storageStart = main.indexOf('\nvar MONGSE_storageMemory', fullModeStart);
assert(resolverStart >= 0 && fullModeStart > resolverStart && storageStart > fullModeStart);
const resolverSource = main.slice(resolverStart, fullModeStart);
const fullModeSource = main.slice(fullModeStart + 1, storageStart);
const modeWindow = {Br: {combatMode: 'semi'}};
vm.runInNewContext(`${resolverSource}\n${fullModeSource}\nthis.api={resolve:HAPIL_resolveCombatModeV31329,isFull:HAPIL_isFullAutoV31329};`, modeWindow);
assert.equal(modeWindow.api.resolve({autoCombat: false}), 'semi');
assert.equal(modeWindow.api.resolve({autoCombat: true}), 'full');
assert.equal(modeWindow.api.isFull({combatMode: 'semi', autoCombat: true}), false);
assert.equal(modeWindow.api.isFull({combatMode: 'full', autoCombat: false}), true);

const blinkStart = main.indexOf('function HAPIL_blinkVectorV31345');
const blinkEnd = main.indexOf('\nfunction MONGSE_planAutoSkill', blinkStart);
assert(blinkStart >= 0 && blinkEnd > blinkStart, 'directional blink vector helper is missing');
const blinkWindow = {};
vm.runInNewContext(`${main.slice(blinkStart, blinkEnd)}\nthis.blink=HAPIL_blinkVectorV31345;`, blinkWindow, {filename: 'blink-vector.js'});
const blink = blinkWindow.blink;
const diagonalBlink = blink(new Set(['ArrowLeft', 'ArrowUp']), 1);
assert(Math.abs(diagonalBlink.x + Math.SQRT1_2) < 1e-12 && Math.abs(diagonalBlink.y + Math.SQRT1_2) < 1e-12,
  'diagonal directional blink is normalized');
assert.deepEqual(JSON.parse(JSON.stringify(blink(new Set(), -1))), {x: -1, y: 0});
assert.deepEqual(JSON.parse(JSON.stringify(blink(new Set(['ArrowDown']), 1, {x: -1, y: 0}))), {x: 0, y: 1},
  'directional keys take precedence over any automatic evade vector');
assert.deepEqual(JSON.parse(JSON.stringify(blink(new Set(['ArrowLeft','ArrowRight']), 1))), {x: 1, y: 0},
  'opposite horizontal inputs cancel and fall back to facing instead of choosing one side');
assert.deepEqual(JSON.parse(JSON.stringify(blink(new Set(['ArrowUp','ArrowDown','ArrowLeft']), 1))), {x: -1, y: 0},
  'opposite vertical inputs cancel without overriding the remaining horizontal direction');
assert.deepEqual(JSON.parse(JSON.stringify(blink(new Set(), 1, {x: 0, y: -1}))), {x: 0, y: -1});
const manualBlink = main.slice(main.indexOf('Xe = (0, l.useCallback)'), main.indexOf('}, [', main.indexOf('Xe = (0, l.useCallback)')));
assert(manualBlink.includes('HAPIL_blinkVectorV31345'));
assert(manualBlink.includes('t.combatModeV31329 === `full` && t.autoDodgeBlinkDispatchV31576 === true ? t.simpleDodgeVectorV31368 : null'));
assert(main.includes('s.autoDodgeBlinkDispatchV31576=true'), 'only the explicit full-auto dodge dispatcher may supply an automatic blink vector');
assert(!manualBlink.includes('t.enemies.find'), 'manual blink must not pick a direction away from an enemy');

const skillStart = main.indexOf('/* HAPIL 3.13.43: repeat offensive skills use the native executor and its cooldown commit. */');
const skillEnd = main.indexOf('/* HAPIL 3.13.43: native movement-pad pointer ownership. */', skillStart);
assert(skillStart >= 0 && skillEnd > skillStart, 'semi-automatic skill scheduler is missing');
const state = {
  zone: 'hell', time: 10, x: 0, y: 0, hp: 100,
  activeHeroId: 'hwando', targetEnemyId: 'far', resonance: 0,
  cooldowns: {}, enemies: [
    {id: 'far', x: 6, y: 0, hp: 100},
    {id: 'near', x: 1, y: 0, hp: 100}
  ]
};
const skills = [{key: 'Q', kind: 'damage'}];
const castCalls = [];
const binding = {
  settings: {current: {combatMode: 'semi', autoCombat: false}},
  hero: {current: 'hwando'}, passives: {current: {}}, paused: false,
  actions: {skill(index) { castCalls.push(index); state.cooldowns.Q = state.time + 2; }}
};
const controls = {
  binding,
  effective: settings => settings?.combatMode ?? 'semi',
  localInputBlocked: () => false
};
const skillWindow = {
  __HAPIL_CONTROLS_V31329__: controls,
  __HAPIL_PARTY_V31322__: {blocksNativeInput: () => false},
  __HAPIL_LOOP_V31365__: {role: () => ({range: 8})},
  __HAPIL_COMBAT_V31333__: {radius: () => 8},
  __HAPIL_DIRECTION_V31334__: {candidates: (_s, _a, rows) => rows},
  __HAPIL_MOVEMENT_V31336__: {attackLocked: () => false}
};
const skillContext = {
  window: skillWindow,
  F: [{id: 'hwando', skills}],
  MONGSE_objectiveDamageAllowedV31309: () => true,
  MONGSE_isEncounterLocked31226: () => false,
  MONGSE_combatDistance: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  J: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  gn: () => ({kind: 'projectile'}),
  or: () => ({rangeMultiplier: 1}),
  ir: () => ({}), sr: () => ({detectionRange: 0}), ui: () => false,
  HAPIL_effectiveGrowthV31400: () => ({})
};
vm.runInNewContext(main.slice(skillStart, skillEnd), skillContext, {filename: 'semi-skill-scheduler.js'});
const combat = skillWindow.__HAPIL_COMBAT_V31343__;
assert.equal(combat.repeatSkill({kind: 'damage'}), true);
assert.equal(combat.repeatSkill({kind: 'ultimate'}), true);
assert.equal(combat.repeatSkill({kind: 'guard'}), false);
assert.equal(combat.repeatSkill({kind: 'dash'}), false);
assert.equal(combat.plan(state, {id: 'hwando', skills}, {}).target.id, 'near',
  'an existing target selection must not outrank the nearest valid enemy');
assert.equal(combat.tick(state, .016, binding), true, 'semi mode automatically casts a ready offensive skill');
assert.deepEqual(castCalls, [0]);
assert.equal(state.targetEnemyId, 'near');
const ultimate = {key: 'R', kind: 'ultimate'};
const ultimateHero = {id: 'hwando', skills: [ultimate]};
const ultimateState = {...state, time: 20, targetEnemyId: 'far', resonance: 40, cooldowns: {R: 0}};
assert.equal(combat.plan(ultimateState, ultimateHero, {}), null, 'ultimate waits until its EGO resource is ready');
ultimateState.resonance = 100;
assert.equal(combat.plan(ultimateState, ultimateHero, {}).target.id, 'near');

const simpleStart = main.indexOf('/* Repair of v31367: live binding access, one scheduler, no hostile circle overlay. */');
const simpleEnd = main.indexOf('/* 3.13.68: canonical, user-owned text.', simpleStart);
assert(simpleStart >= 0 && simpleEnd > simpleStart, 'automatic dodge controller is missing');
let dashCount = 0, automaticVector = null;
const simpleState = {zone: 'hell', time: 1, hp: 100, activeHeroId: 'hwando', x: 10, y: 10,
  invulnerableUntil: 0, lastDodgeAt: -99, lastAttack: Number.NaN, enemies: [], cooldowns: {}};
const simpleBinding = {
  state: {current: simpleState}, phase: 'game', settings: {current: {combatMode: 'semi'}},
  passives: {current: {}}, input: {current: new Set()},
  actions: {dash() { dashCount++; automaticVector = simpleState.simpleDodgeVectorV31368; simpleState.lastDodgeAt = simpleState.time; }}
};
const simpleControls = {
  binding: simpleBinding,
  effective: settings => settings?.combatMode ?? 'semi',
  hasHeldLogical: () => false
};
const simpleWindow = {
  __HAPIL_CONTROLS_V31329__: simpleControls,
  __HAPIL_PARTY_V31322__: {blocksNativeInput: () => false, status: {paused: false}},
  __HAPIL_LOOP_V31365__: {blocked: () => false, imminent: () => true,
    isCharging: () => false, role: () => ({range: 8}), safePoint: () => true},
  __HAPIL_CHANNEL_V31364__: {active: () => false},
  __HAPIL_ACTION_CONTRACT_V31406__: {decide: () => ({allowed: true})},
  __HAPIL_MOVEMENT_V31336__: {statusLocked: () => false},
  __HAPIL_COMBAT_V31333__: {dangerContext: () => ({}), dangerAt: () => 0},
  __HAPIL_LASERS_V31330__: {danger: () => 0},
  __HAPIL_BOSSES_V31334__: {danger: () => 0}
};
const simpleContext = {
  window: simpleWindow,
  document: {hidden: false},
  gr: () => ({dashBonus: 0}), fr: () => 0,
  dt: (_zone, point) => point,
  J: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  MONGSE_enemyHitRadius: () => 0
};
vm.runInNewContext(main.slice(simpleStart, simpleEnd), simpleContext, {filename: 'simple-auto-dodge.js'});
simpleWindow.__HAPIL_SIMPLE_V31368__.tick(simpleState, .016);
assert.equal(dashCount, 0, 'semi mode must never auto-dodge');
simpleBinding.settings.current = {combatMode: 'full'};
simpleState.time = 2;
simpleWindow.__HAPIL_SIMPLE_V31368__.tick(simpleState, .016);
assert.equal(dashCount, 1, 'full-auto retains its automatic dodge');
assert(automaticVector && Number.isFinite(automaticVector.x) && Number.isFinite(automaticVector.y));
assert(main.includes('function evasive(){return false;}'),
  'awakening-specific autonomous blink must stay disabled');
assert(main.includes("function dodge(s){const control=C(),b=control?.binding;if(!b||control.effective(b.settings?.current)!=='full'"),
  'the separate full-auto dodge controller must remain restricted to full mode');

const planStart = main.indexOf('function HAPIL_autoProgressPlanV31301');
const driveStart = main.indexOf('\nfunction HAPIL_driveAutoProgressV31301', planStart);
const storyDelayStart = main.indexOf('\nfunction HAPIL_autoStoryDelayV31301', driveStart);
assert(planStart >= 0 && driveStart > planStart && storyDelayStart > driveStart);
const progressWindow = {HAPIL_isFullAutoV31329: modeWindow.api.isFull};
progressWindow.window = progressWindow;
vm.runInNewContext(`${fullModeSource}\n${main.slice(planStart, driveStart)}\n${main.slice(driveStart + 1, storyDelayStart)}\nthis.api={plan:HAPIL_autoProgressPlanV31301,drive:HAPIL_driveAutoProgressV31301};`, progressWindow);
const progressState = {time: 1, zone: 'hub', hp: 100, target: null};
let interactions = 0;
const semiPlan = progressWindow.api.drive(progressState,
  {combatMode: 'semi', autoCombat: true, autoPortal: true}, false, () => interactions++);
assert.equal(semiPlan.action, 'idle', 'semi mode cannot auto-move through campaign portals');
assert.equal(progressState.target, null);
assert.equal(interactions, 0);
assert.equal(progressWindow.api.plan(progressState,
  {combatMode: 'semi', autoCombat: true, autoPortal: true}).action, 'idle');

const geometrySource = read('assets/combat-v31402/contact-geometry.js');
const geometryWindow = {
  __HAPIL_PARTY_V31322__: {state: null, actors: []},
  __HAPIL_COMBAT_V31333__: {
    core(actor) { return {x: actor.x * 40, y: actor.y * 24}; },
    frozen() { return false; }, piercing() { return false; }, seen() { return false; },
    segmentDistance(point, a, b) {
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / Math.max(1e-12, dx * dx + dy * dy)));
      return Math.hypot(point.x - (a.x + dx * t), point.y - (a.y + dy * t));
    }
  }
};
vm.runInNewContext(geometrySource, {window: geometryWindow}, {filename: 'contact-geometry.js'});
const geometry = geometryWindow.__HAPIL_GEOMETRY_V31402__.create({
  project: (x, y) => ({x: x * 40, y: y * 24}),
  heroes: () => [{id: 'hwando'}],
  combat: {captureEvidence() {}}
});
const hero = {zone: 'hell', time: 0, activeHeroId: 'hwando', x: 0, y: 0, hp: 100};
geometryWindow.__HAPIL_PARTY_V31322__.state = hero;
geometry.capture(hero);
hero.time = .1;
const crossingBullet = {id: 'crossing', previousX: -1, previousY: 0, x: 1, y: 0,
  radius: .2, visualYV31333: 0, damage: 8};
assert.equal(geometry.projectile(hero, hero, crossingBullet).hit, true,
  'swept hostile bullets crossing a hero are registered');
assert.equal(geometry.beam(hero, hero, [{a: {x: 0, y: 0}, b: {x: 160, y: 0}}], 12).hit, true,
  'laser collision shares the measured hero body geometry');
assert.equal(geometry.area(hero, hero, {x: 0, y: 0, shape: 'circle', radius: .5}).hit, true);
assert.equal(geometry.area(hero, hero, {x: 0, y: 0, shape: 'safe', radius: 1}).hit, false,
  'the center of a safe zone remains safe');
hero.x = 2;
assert.equal(geometry.area(hero, hero, {x: 0, y: 0, shape: 'safe', radius: 1}).hit, true,
  'the outside of a safe zone is collidable');

const diStart = main.indexOf('function Di(e, t)');
const multiplierStart = main.indexOf('\nfunction MONGSE_telegraphDamageMultiplier31226', diStart);
const blinkHelperStart = main.indexOf('\nfunction HAPIL_blinkVectorV31345', multiplierStart);
assert(diStart >= 0 && multiplierStart > diStart && blinkHelperStart > multiplierStart);
const damageGeometry = {window: {...geometryWindow, __HAPIL_CONTACT_V31336__: geometry}};
vm.runInNewContext(`${main.slice(diStart, multiplierStart)}\n${main.slice(multiplierStart + 1, blinkHelperStart)}\nthis.api={inside:Di,damage:MONGSE_telegraphDamageMultiplier31226};`, damageGeometry);
hero.x = 0; hero.y = 0;
assert(damageGeometry.api.damage(hero, {x: 0, y: 0, shape: 'circle', radius: .5, damage: 10}) > 0);
assert.equal(damageGeometry.api.damage(hero, {x: 2, y: 0, shape: 'circle', radius: .5, damage: 10}), 0,
  'a visible circle impact outside its collision envelope deals no damage');
assert.equal(damageGeometry.api.damage(hero, {x: 0, y: 0, shape: 'safe', radius: 1, damage: 10}), 0);
hero.x = 2;
assert(damageGeometry.api.damage(hero, {x: 0, y: 0, shape: 'safe', radius: 1, damage: 10}) > 0);

const reducerStart = main.indexOf('function HAPIL_reducePlayerContactV31401(');
const reducerEnd = main.indexOf('\nfunction Ti(', reducerStart);
assert(reducerStart >= 0 && reducerEnd > reducerStart);
const marks = [];
const damageWindow = {
  __HAPIL_DEFENSE_V31356__: {blockDamage: () => false},
  __HAPIL_LOOP_V31365__: {beforeIncoming: () => false, onDamage() {}},
  __HAPIL_HEART_V31336__: {permit: () => true, packet: (_s, _a, _h, base) => base},
  __HAPIL_COMBAT_CORE_V31401__: {mark(_s, _a, result, reason) {marks.push({result, reason});}, markIfUnset() {}},
  __HAPIL_RAID_RC24__: {suppress: () => false, damageScale: () => 1, floorDamage: () => 0, afterHit() {}},
  __HAPIL_RANGES_V31337__: {defend: (_id, value) => value},
  __HAPIL_HELL_V31322__: {damageMultiplier: () => 1},
  __HAPIL_ENEMY_FEEL_V31361__: {hit() {}, protect() {}},
  __HAPIL_SKILL_COMPLETION_V31412__: {keepHeroPose: () => false}
};
const damageContext = {
  window: damageWindow,
  MONGSE_reserveHostileHit31215: () => true,
  MONGSE_COMBAT_PHYSICS_V3128: {enemyDamageMultiplier: 1, collisionEpsilon: .01, knockbackBoss: 1, knockbackMidboss: 1, knockbackFriction: 1},
  MONGSE_limitHeroDamage31213: (_s, amount) => ({applied: amount}),
  MONGSE_grantSurvivalGrace() {},
  ft: (_zone, state) => ({x: state.x, y: state.y}),
  hi() {}, wn: () => 'front'
};
vm.runInNewContext(`${main.slice(reducerStart, reducerEnd)}\nthis.reduce=HAPIL_reducePlayerContactV31401;`, damageContext);
const damagedHero = {time: 1, hp: 100, maxHp: 100, x: 0, y: 0, zone: 'hell', activeHeroId: 'hwando',
  heroDamageTakenMultiplier: 1, invulnerableUntil: 0, lastDodgeAt: -99, floatTexts: [], effects: [],
  fxSerial: 1, cooldowns: {}, enemies: [], resonance: 0, combo: 4, comboUntil: 2};
const shot = {id: 'enemy-shot', sourceId: 'enemy', born: .8, damage: 9, radius: .2};
assert.equal(damageContext.reduce(damagedHero, 9, -1, 0, shot), true);
assert.equal(damagedHero.hp, 91, 'an accepted enemy hit reduces hero HP');
assert.equal(marks.at(-1).result, 'HIT');
damagedHero.time = 1.05;
assert.equal(damageContext.reduce(damagedHero, 9, -1, 0, {...shot, id: 'second-shot'}), false);
assert.equal(damagedHero.hp, 91, 'native invulnerability prevents damage only during its short window');
assert.equal(marks.at(-1).reason, 'native-invulnerability');

const projectilePipelineSource = read('assets/combat-v31402/projectile-pipeline.js');
const pipelineWindow = {};
vm.runInNewContext(projectilePipelineSource, {window: pipelineWindow});
const pipeline = pipelineWindow.__HAPIL_PROJECTILE_PIPELINE_V31402__;
assert.equal(pipeline.contactEnabled({x: 0, y: 0, born: 0}, 1), true);
assert.equal(pipeline.contactEnabled({x: 0, y: 0, born: 0, collisionDisabledUntilV31226: 2}, 1), false);
assert(main.includes('window.__HAPIL_PROJECTILE_PIPELINE_V31402__.contactEnabled(e,o.time)'));
assert(main.includes('window.__HAPIL_PARTY_V31322__?.areaImpact(o, e)'));
assert(main.includes('window.__HAPIL_CONTACT_V31336__?.stamp(s,a,h,{heart:heartTouch})'));
assert(main.includes('window.__HAPIL_CONTACT_V31336__?.prepareHost(o,e)'));

const mainBundle = html.match(/\.\/assets\/index-v31526\.js\?v=(\d+)/);
assert(mainBundle && Number(mainBundle[1]) >= 34601, 'main bundle cache key was not advanced for RC46');
assert(html.includes('./assets/rc15/hero-controls.js?v=34601'), 'live hero controller cache key was not advanced');

console.log('PASS: legacy mode migration, nearest-target semi attacks and skills, directional blink, full-only auto dodge/progression, area/projectile/laser geometry, and actual incoming HP reduction.');
