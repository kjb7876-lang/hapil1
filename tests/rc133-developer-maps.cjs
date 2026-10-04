'use strict';
// Pure-VM unit coverage for the isolated 777 map grant and RC133 hidden entry.
// No browser, natural route, save system, or gameplay loop is started here.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let checks = 0;
const check = (value, message) => { checks++; assert.ok(value, message); };
const equal = (actual, expected, message) => { checks++; assert.equal(actual, expected, message); };
const same = (actual, expected, message) => { checks++; assert.deepEqual(actual, expected, message); };
const plain = value => JSON.parse(JSON.stringify(value));
const validGrant = () => ({ version: 1, code: '777', allMaps: true });

function mapEnv() {
  const window = {};
  const context = vm.createContext({ window, console });
  vm.runInContext(read('assets/rc133/developer-maps.js'), context, { filename: 'assets/rc133/developer-maps.js' });
  window.__HAPIL_SAMONG_RC91__ = {
    enabled: state => !!state && state.samongUnlockedRC91 === true && state.gameModeV31346 === 'DREAM',
  };
  window.__HAPIL_PARTY_V31322__ = null;
  return { window, context, Maps: window.__HAPIL_DEVELOPER_MAPS_RC133__ };
}

function baseState(overrides = {}) {
  return {
    zone: 'hub', frontierZone: 'dist02', hp: 67, maxHp: 100,
    gameModeV31346: 'DREAM', samongUnlockedRC91: true,
    practiceV31329: false, enemies: [{ id: 'enemy-1', hp: 20 }],
    completedZones: new Set(['dist00']), bossDefeated: false,
    targetEnemyId: 'enemy-1', ...overrides,
  };
}

// The save cleaner is an allow-list: only the exact v1 777/all-map record survives.
{
  const { Maps } = mapEnv();
  same(plain(Maps.clean(validGrant())), validGrant(), 'exact v1 grant is accepted');
  same(plain(Maps.clean({ ...validGrant(), ignored: true })), validGrant(), 'unknown saved fields are dropped');
  for (const [label, malformed] of [
    ['null', null], ['undefined', undefined], ['array', []], ['string', '777'],
    ['old version', { ...validGrant(), version: 0 }], ['future version', { ...validGrant(), version: 2 }],
    ['string version', { ...validGrant(), version: '1' }], ['numeric code', { ...validGrant(), code: 777 }],
    ['wrong code', { ...validGrant(), code: '0777' }], ['missing code', { version: 1, allMaps: true }],
    ['false map flag', { ...validGrant(), allMaps: false }], ['truthy map flag', { ...validGrant(), allMaps: 1 }],
    ['missing map flag', { version: 1, code: '777' }],
  ]) check(Maps.clean(malformed) === null, `reject malformed grant: ${label}`);
  equal(Maps.has({ developerMapsRC133: validGrant() }), true, 'only clean saved grant activates entitlement');
  equal(Maps.has({ developerMapsRC133: { version: 1, code: '777', allMaps: 1 } }), false, 'malformed entitlement does not activate');
}

// Frontier uses only finite map orders and does not manufacture an entitlement
// from legacy progress fields.
{
  const { Maps } = mapEnv();
  const zones = {
    hub: { id: 'hub', order: 0 }, dist00: { id: 'dist00', order: 1 },
    cult04: { id: 'cult04', order: 1777 },
    badInfinity: { id: 'badInfinity', order: Infinity },
    badNaN: { id: 'badNaN', order: NaN },
    badString: { id: 'badString', order: '99999' },
  };
  equal(Maps.frontier(zones), 'cult04', 'frontier selects the highest finite real map order');
  equal(Maps.frontier({ hub: { id: 'hub', order: 0 }, later: { id: 'later', order: 0 } }), 'hub', 'frontier does not advance on a tie');
  const legacy = baseState({ frontierZone: 'cult04', unlocks: ['cult04'] });
  equal(Maps.has(legacy), false, 'legacy frontier/unlock fields are not a 777 grant');
  equal(Maps.canInner(legacy), false, 'legacy progress alone cannot expose the hidden entry');
  equal(Maps.restore(legacy, { frontierZone: 'cult04', unlocked: true }), false, 'legacy save fields are rejected');
  equal(Maps.has(legacy), false, 'legacy save rejection leaves no grant');
}

// Granting touches only the grant field and private one-shot launch state.
{
  const { Maps } = mapEnv();
  const state = baseState({ completedZones: new Set(['dist00', 'cult04']) });
  const enemiesRef = state.enemies;
  const completedRef = state.completedZones;
  const before = {
    zone: state.zone, frontierZone: state.frontierZone, hp: state.hp,
    enemies: plain(state.enemies), completedZones: [...state.completedZones],
    bossDefeated: state.bossDefeated, targetEnemyId: state.targetEnemyId,
  };
  equal(Maps.grant(state), true, 'grant succeeds on an active state');
  same(plain(state.developerMapsRC133), validGrant(), 'grant stores only the canonical v1 token');
  same({ zone: state.zone, frontierZone: state.frontierZone, hp: state.hp, enemies: plain(state.enemies), completedZones: [...state.completedZones], bossDefeated: state.bossDefeated, targetEnemyId: state.targetEnemyId }, before, 'grant does not alter map, HP, enemies, or completion state');
  check(state.enemies === enemiesRef, 'grant preserves the enemy array');
  check(state.completedZones === completedRef, 'grant preserves the completed-zone set');
  equal(Maps.grant(null), false, 'grant rejects a missing state');
}

// Hidden-map access is Dream-only, alive-only, practice-disabled, and host-authoritative.
{
  const { window, Maps } = mapEnv();
  const dream = baseState({ developerMapsRC133: validGrant() });
  equal(Maps.canInner(dream), true, 'authorized living Dream run with grant can enter');
  equal(Maps.canInner(baseState({ developerMapsRC133: undefined })), false, 'missing grant is denied');
  equal(Maps.canInner(baseState({ gameModeV31346: 'STORY', developerMapsRC133: validGrant() })), false, 'Story mode is denied');
  equal(Maps.canInner(baseState({ hp: 0, developerMapsRC133: validGrant() })), false, 'dead run is denied');
  equal(Maps.canInner(baseState({ practiceV31329: true, developerMapsRC133: validGrant() })), false, 'practice run is denied');
  for (const status of [{ role: 'guest' }, { disconnected: true }]) {
    const state = baseState({ developerMapsRC133: validGrant() });
    window.__HAPIL_PARTY_V31322__ = { state, status };
    equal(Maps.canInner(state), false, `party authority restriction is enforced: ${JSON.stringify(status)}`);
  }
  const host = baseState({ developerMapsRC133: validGrant() });
  window.__HAPIL_PARTY_V31322__ = { state: host, status: { role: 'host' } };
  equal(Maps.canInner(host), true, 'party host retains authority');
  window.__HAPIL_PARTY_V31322__ = { state: host, status: { role: 'offline', paused: true } };
  equal(Maps.canInner(host), true, 'paused local Settings retains map-selection authority');
  const unrelated = baseState({ developerMapsRC133: validGrant() });
  window.__HAPIL_PARTY_V31322__ = { state: {}, status: { role: 'guest' } };
  equal(Maps.canInner(unrelated), true, 'another party state does not block this run');
}

// A title grant carries through exactly one new-run initialization, then clears.
{
  const { Maps } = mapEnv();
  const run = baseState();
  equal(Maps.grant(run, true), true, 'title-code grant is recorded');
  equal(Maps.beginRun(run, 'cult04'), true, 'next beginRun carries the pending title grant');
  equal(Maps.has(run), true, 'carried run has the explicit grant');
  equal(run.frontierZone, 'cult04', 'carried run receives the finite frontier');
  equal(run.zone, 'hub', 'carrying the grant does not change current zone');
  equal(Maps.beginRun(run, 'dist00'), false, 'subsequent new game has no pending carry');
  equal(Maps.has(run), false, 'subsequent new game resets the grant');
  equal(run.frontierZone, 'cult04', 'reset does not rewrite frontier without a pending title grant');
}

// An in-game code grant belongs to the current run and cannot leak into its next run.
{
  const { Maps } = mapEnv();
  const run = baseState({ zone: 'dist04' });
  equal(Maps.grant(run, false), true, 'in-game grant succeeds');
  equal(Maps.has(run), true, 'in-game run receives map grant immediately');
  equal(Maps.beginRun(run, 'cult04'), false, 'in-game grant does not create a title carry');
  equal(Maps.has(run), false, 'beginRun clears the prior run entitlement');
  equal(run.zone, 'dist04', 'grant/reset does not change the current zone');
}

// Save restoration clears any pending title carry for valid, invalid, and null records.
for (const row of [
  { label: 'valid', raw: validGrant(), accepted: true },
  { label: 'invalid version', raw: { ...validGrant(), version: 9 }, accepted: false },
  { label: 'null', raw: null, accepted: false },
]) {
  const { Maps } = mapEnv();
  const run = baseState();
  Maps.grant(run, true);
  equal(Maps.restore(run, row.raw), row.accepted, `${row.label} save restore result`);
  equal(Maps.has(run), row.accepted, `${row.label} save produces only its validated entitlement`);
  if (row.accepted) same(plain(run.developerMapsRC133), validGrant(), 'valid save is normalized');
  equal(Maps.beginRun(run, 'cult04'), false, `${row.label} restore clears pending title carry`);
  equal(Maps.has(run), false, `${row.label} restore cannot leak access to a later new run`);
}

function runtimeEnv() {
  const { window, context, Maps } = mapEnv();
  window.__HAPIL_SAMONG_RC91__ = {
    enabled: state => !!state && state.samongUnlockedRC91 === true && state.gameModeV31346 === 'DREAM',
  };
  window.__HAPIL_RC86_BRIDGE__ = {
    actor: (zone, id) => ({ id, zone, name: 'cult leader', hp: 0, maxHp: 1500, sprite: 'boss-sprite' }),
    cloneEnemy: actor => ({ ...actor }),
    point: () => ({ x: 23.2, y: 10 }),
  };
  window.__HAPIL_CONTROLS_V31329__ = { binding: { passives: { current: {} } } };
  vm.runInContext(read('assets/rc133/inner-final.js'), context, { filename: 'assets/rc133/inner-final.js' });
  const Final = window.__HAPIL_INNER_FINAL_RC133__;
  Final.bind({ heroes: [{ id: 'hwando', sprite: 'hero-sprite' }] });
  return { window, context, Maps, Final };
}
function gameState(overrides = {}) {
  return {
    zone: 'cult04', gameModeV31346: 'DREAM', samongUnlockedRC91: true,
    hp: 80, maxHp: 100, time: 10, x: 5, y: 7, activeHeroId: 'hwando',
    enemies: [], spawnedWaves: new Set(), completedZones: new Set(['dist00']),
    bossDefeated: false, targetEnemyId: 'ordinary-target', invulnerableUntil: 0,
    floatTexts: [], effects: [], fxSerial: 0,
    ...overrides,
  };
}
function developerSave(overrides = {}) {
  return {
    version: 1, zone: 'cult04', phase: 'fight', entry: 'developer-777', hero: 'hwando',
    maxHp: 1200, hp: 900, scale: 1.2, elapsed: 4, awake: 2,
    awakeningCooldown: 3, shotDelay: 1, cycle: 4, x: 17, y: 18, intro: 0,
    ...overrides,
  };
}

// Natural authored death routing remains available without a developer entitlement.
{
  const { Maps, Final } = runtimeEnv();
  const leader = { id: 'c104-boss', hp: 0, maxHp: 1500 };
  const state = gameState({ enemies: [leader, { id: 'ordinary-add', hp: 20 }], completedZones: new Set(['dist00', 'cult04']) });
  equal(Maps.has(state), false, 'natural-route fixture has no developer entitlement');
  equal(Final.beforeDeath(state, leader), true, 'dead authored leader still opens the natural inner route');
  equal(state.innerFinalRC133.entry, 'cult-death', 'natural route stores its authored entry source');
  check(!('developerMapsRC133' in state), 'natural route does not manufacture developer map access');
  equal(state.completedZones.has('cult04'), false, 'natural authored completion keeps its existing cult-zone handling');
  check(state.enemies.some(actor => actor.id === 'ordinary-add'), 'natural route keeps unrelated surviving enemies');
  check(state.enemies.some(actor => actor.id === Final.id), 'natural route creates the inner boss');
}

// The hidden entry refuses missing grant, Story, dead/practice states, and non-authoritative parties.
{
  const { window, Maps, Final } = runtimeEnv();
  const denied = [
    ['no developer grant', gameState()],
    ['Story mode', gameState({ gameModeV31346: 'STORY', developerMapsRC133: validGrant() })],
    ['dead player', gameState({ hp: 0, developerMapsRC133: validGrant() })],
    ['practice run', gameState({ practiceV31329: true, developerMapsRC133: validGrant() })],
  ];
  for (const [label, state] of denied) {
    const original = { zone: state.zone, hp: state.hp, enemies: state.enemies.slice(), completed: [...state.completedZones] };
    equal(Final.developerStart(state), false, `hidden entry rejects ${label}`);
    equal(state.innerFinalRC133, undefined, `denied ${label} does not create an inner state`);
    same({ zone: state.zone, hp: state.hp, enemies: state.enemies.slice(), completed: [...state.completedZones] }, original, `denied ${label} does not mutate campaign state`);
  }
  const partyRun = gameState({ developerMapsRC133: validGrant() });
  window.__HAPIL_PARTY_V31322__ = { state: partyRun, status: { role: 'guest' } };
  equal(Final.developerStart(partyRun), false, 'hidden entry denies a party guest');
  equal(Maps.canInner(partyRun), false, 'party denial comes from the same maps guard');
}

// Developer entry has a clean explicit source, owns setup cleanup, and does not
// mutate current campaign progress while opening the private fight.
{
  const { Maps, Final } = runtimeEnv();
  const state = gameState({
    developerMapsRC133: validGrant(), frontierZone: 'cult04',
    enemies: [{ id: 'old-add', hp: 10 }, { id: 'old-boss-add', hp: 5 }],
    effects: [
      { ownerId: 'old-add' }, { sourceId: 'old-boss-add' },
      { sourceId: Final.id }, { sourceId: 'unrelated' },
    ],
    floatTexts: [
      { sourceId: 'old-add' }, { ownerId: 'old-boss-add' },
      { ownerId: Final.id }, { ownerId: 'unrelated' },
    ],
    completedZones: new Set(['dist00']),
  });
  const before = { zone: state.zone, hp: state.hp, completed: [...state.completedZones], frontier: state.frontierZone };
  equal(Maps.canInner(state), true, 'developer fixture satisfies all hidden-entry guards');
  equal(Final.developerStart(state), true, 'authorized developer entry starts');
  equal(state.innerFinalRC133.entry, 'developer-777', 'entry source is explicitly stored');
  state.innerFinalRC133.untrusted = 'drop me';
  const saved = Final.snapshot(state);
  equal(saved.entry, 'developer-777', 'entry source survives the clean snapshot');
  check(!Object.hasOwn(saved, 'untrusted'), 'snapshot drops unknown entry fields');
  equal(Final.clean({ ...developerSave(), entry: 'untrusted', extra: 'drop' }).entry, 'cult-death', 'unknown entry source sanitizes to natural route');
  same({ zone: state.zone, hp: state.hp, completed: [...state.completedZones], frontier: state.frontierZone }, before, 'developer entry preserves current zone, HP, completion, and frontier');
  equal(state.enemies.filter(actor => actor.id !== Final.id).length, 0, 'developer entry replaces the old enemy set with only its own boss');
  equal(state.effects.length, 1, 'owned setup effects are cleaned while unrelated effects remain');
  equal(state.floatTexts.filter(text => text.ownerId === 'old-boss-add' || text.sourceId === 'old-add' || text.ownerId === Final.id).length, 0, 'owned setup text is cleaned');
  check(state.floatTexts.some(text => text.ownerId === 'unrelated'), 'unrelated setup text is retained');
  check(state.floatTexts.some(text => typeof text.text === 'string' && text.text.startsWith('777')), 'developer entry publishes its own private-entry message');
}

// Developer restore requires the restored run grant; natural restores do not.
{
  const { Maps, Final } = runtimeEnv();
  const blocked = gameState({ enemies: [{ id: Final.id, hp: 100 }, { id: 'ordinary-add', hp: 20 }], innerFinalRC133: { phase: 'fight' } });
  Final.restore(blocked, developerSave());
  equal(blocked.innerFinalRC133, undefined, 'developer save without entitlement is rejected');
  check(!blocked.enemies.some(actor => actor.id === Final.id), 'rejected developer restore cannot resurrect its boss');
  check(blocked.enemies.some(actor => actor.id === 'ordinary-add'), 'rejected developer restore preserves unrelated enemies');

  const accepted = gameState({ developerMapsRC133: validGrant(), enemies: [{ id: 'c104-boss', hp: 100 }, { id: 'ordinary-add', hp: 20 }] });
  Final.restore(accepted, developerSave());
  equal(accepted.innerFinalRC133.entry, 'developer-777', 'authorized developer save restores its entry source');
  check(accepted.enemies.some(actor => actor.id === Final.id), 'authorized developer save rebuilds the private boss');
  check(!accepted.enemies.some(actor => actor.id === 'c104-boss'), 'restore removes the superseded cult leader');

  Final.restore(accepted, null);
  equal(accepted.innerFinalRC133, undefined, 'null inner save clears the private state');
  check(!accepted.enemies.some(actor => actor.id === Final.id), 'null inner save removes any existing private boss');
}

// A private-fight defeat is intercepted and cannot mark campaign completion.
{
  const { Maps, Final } = runtimeEnv();
  const state = gameState({ developerMapsRC133: validGrant(), completedZones: new Set(['dist00']) });
  const playerHp = state.hp, zone = state.zone;
  equal(Final.developerStart(state), true, 'developer fight opens for completion test');
  const boss = Final.boss(state);
  check(!!boss, 'private boss exists before defeat');
  boss.hp = 0;
  equal(Final.beforeDeath(state, boss), true, 'developer boss defeat is intercepted');
  equal(state.innerFinalRC133.phase, 'complete', 'private encounter records its own completion phase');
  equal(state.completedZones.has('cult04'), false, 'developer defeat does not add a campaign clear');
  same([...state.completedZones], ['dist00'], 'developer defeat preserves completed-zone set');
  equal(state.bossDefeated, false, 'developer defeat does not set campaign boss clear');
  equal(state.targetEnemyId, null, 'private target is cleared on defeat');
  equal(state.hp, playerHp, 'private defeat does not alter player HP');
  equal(state.zone, zone, 'private defeat does not move the current zone');
  check(!state.enemies.some(actor => actor.id === Final.id), 'defeated private boss is removed');
  equal(Final.snapshot(state).entry, 'developer-777', 'completed save retains its private source marker');

  const restoredComplete = gameState({ developerMapsRC133: validGrant(), completedZones: new Set(['dist00']) });
  Final.restore(restoredComplete, Final.snapshot(state));
  equal(restoredComplete.bossDefeated, false, 'restored developer completion remains non-campaign');
  equal(restoredComplete.completedZones.has('cult04'), false, 'restored developer completion does not grant a campaign clear');
  check(!Final.boss(restoredComplete), 'completed private save does not resurrect the boss');
}

console.log('RC133_DEVELOPER_MAPS_RESULT', JSON.stringify({ status: 'passed', checks, scope: 'developer map grant sanitation, guards, one-shot run carry/reset, entry source/restore/cleanup, and non-campaign defeat' }));
