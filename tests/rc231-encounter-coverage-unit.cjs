'use strict';

// Source/route omission gate. Template enumeration and synthetic packet probes
// are deliberately not reported as observed natural casts or campaign clears.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
let checks = 0;
const ok = (value, message) => { checks++; assert.ok(value, message); };
const eq = (actual, expected, message) => { checks++; assert.deepEqual(actual, expected, message); };
const context = { window: {}, S: (x, y) => ({ x, y }), setTimeout() {}, console };
vm.createContext(context);
const bundle = read('assets/index-v31526.js');
const start = bundle.indexOf('  le = `./`,');
ok(start > 0, 'existing authored map registry begins at the reviewed source boundary');
vm.runInContext('var ' + bundle.slice(start, bundle.indexOf('var MONGSE_REST_ZONE_IDS', start)), context);
const garden = bundle.indexOf('N.dist00 = {');
vm.runInContext(bundle.slice(garden, bundle.indexOf('// The terrain registry', garden)), context);
vm.runInContext(read('data/story-rc51.js'), context);
context.he = Object.values(context.N).filter(z => !z.rest && !['hub', 'village'].includes(z.id)).map(z => z.id);
context.window.__HAPIL_RC59_RELEASE__ = { installed: true };
context.ji = raw => raw;
vm.runInContext(bundle.slice(bundle.indexOf('/* RC60:'), bundle.indexOf('/* RC64:')), context);
vm.runInContext(read('assets/rc137/enemy-class-data.js'), context);
const records = context.window.__HAPIL_STORY_DATA_RC51__.records;
const route = Array.from(records, r => r.zone);
const expected = 'dist00 dist01 dist02 dist03 dist04 dist05 dist06 ep1a08 ep1a09 ep1a10 ep1a11 dreamRest ep1b01 ep1b02 ep1b03 ep1b04 ep1b05 ep1b06 ep1b06b ep1b07 ep1b08 ep1b09 restEp1b u201 u202 u204 u205 u206 u203 restU2 last304 last305 last301 last302 last303 restLast3 kair01 kair04 kair05 kair06 kair07 kair08 kair09 kair10 kair02 kair03 restKairo hando01 hando02 hando03 restHando murder01 murder02 murder04 murder03 cult01 cult02 cult05 cult06 cult03 cult04'.split(' ');
eq(route, expected, 'all current authored records keep their nonnumeric route order');
eq(records.filter(r => !r.rest).length, 55, '55 combat records');
eq(Array.from(records.filter(r => r.rest), r => r.zone), ['dreamRest', 'restEp1b', 'restU2', 'restLast3', 'restKairo', 'restHando'], 'all six rest passages');
eq(new Set(route).size, 61, 'unique current nodes');
ok(!route.includes('ep1a07') && !route.includes('hub') && !route.includes('village'), 'archive/deleted map and endpoints are not extra authored battles');
ok(context.N.ep1a07 && !context.he.includes('ep1a07'), 'archived map data remains available while RC60 removes it from the active combat list');
const owners = Array.from(context.window.__HAPIL_ENEMY_CLASS_DATA_RC137__.owners);
eq(owners.length, 72, '72 named identity catalog entries, not a live cast count');
eq(new Set(owners.map(a => a.id)).size, 72, 'catalog identities are unique');
ok(owners.every(a => route.includes(a.zone)), 'every named identity belongs to a current authored map');
const ordinary = records.flatMap(r => r.rest ? [] : context.N[r.zone].enemies.filter(a => !a.boss && !a.midboss));
const rawNamed = records.flatMap(r => r.rest ? [] : context.N[r.zone].enemies.filter(a => a.boss || a.midboss));
eq(ordinary.length, 194, 'early expanded registry has 194 ordinary templates');
eq(rawNamed.length, 65, 'early expanded registry has 65 named templates before later factories');
eq(owners.filter(a => !rawNamed.some(b => a.id === b.id)).map(a => a.id).sort(), ['a11-cosmic-v31318', 'blue-executor', 'inner-evil-rc133', 'mb-kair01-v31231', 'mb-kair04-v31231', 'mb-kair09-v31231', 'mb-last302-v31231'].sort(), 'all seven later named catalog identities are explicit');

// Execute the real unlock selector and EGO route implementation.
const modes = { window: {}, setTimeout() {} }; vm.createContext(modes);
vm.runInContext(read('assets/rc91/samong-awakening.js'), modes);
const selector = modes.window.__HAPIL_SAMONG_RC91__;
eq(selector.select('DREAM', {}), 'STORY', 'Dream remains unlock gated');
for (const key of ['DREAM', 'SAMONG']) eq(selector.select(key, { samongUnlockedRC91: true }), 'DREAM', key + ' resolves to the existing Dream mode');
eq(selector.select('HELL', { samongUnlockedRC91: true }), 'STORY', 'legacy HELL is not a third selectable campaign');
ok(!selector.enabled({ gameModeV31346: 'DREAM', samongUnlockedRC91: true, practiceV31329: true }), 'practice does not enable campaign Samong');
const egoContext = { window: { __HAPIL_STORY_DATA_RC51__: context.window.__HAPIL_STORY_DATA_RC51__ } }; vm.createContext(egoContext);
vm.runInContext(read('assets/rc155/ego-guardian.js'), egoContext);
const E = egoContext.window.__HAPIL_EGO_GUARDIAN_RC155__;
const world = Object.fromEntries([...records, { zone: 'village', rest: true }].map(r => [r.zone, { map: 'authored:' + r.zone, rest: r.rest }]));
eq(Array.from(E.canonicalRoute({}, world)), [...expected, 'village'], 'reverse canonical route uses every current record plus village');
const reverse = { zone: 'cult04', hp: 240, enemies: [], completedZones: new Set() };
ok(E.confirmPersonaVictory(reverse, { phase: 'complete', entry: 'cult-death' }), 'real completed Persona schedules the original transformation');
reverse.zone = 'village'; E.onMapEntry(reverse, reverse.zone, world, {});
let reverseBattles = 0, reversePassages = 0;
for (const zone of [...expected].reverse()) {
  const current = E.state(reverse).routeZone;
  if (!world[current].rest) { ok(E.observeClear(reverse, current, true), 'arm confirmed visit ' + current); reverseBattles++; }
  else reversePassages++;
  reverse.completedZones.add(current);
  eq(E.nextZone(reverse, current, world, {}), zone, 'reverse edge reaches ' + zone);
  reverse.zone = zone; ok(E.onMapEntry(reverse, zone, world, {}).advanced, 'confirmed reverse edge advances once');
}
ok(E.observeClear(reverse, 'dist00', true), 'root battle is confirmed without leaving an endpoint uncounted'); reverseBattles++;
eq(reverseBattles, 55, 'reverse route has the same 55 combat visits');
eq(reversePassages, 7, 'reverse route passes village plus six authored rests');
eq(E.nextZone(reverse, 'dist00', world, {}), 'dist01', 'root endpoint returns forward through the canonical route');

// Execute actual policy predicates over real identities. These are admission
// samples; original Persona, RC88 child/command and mirror systems stay native.
const runtime = { window: {} }; vm.createContext(runtime);
vm.runInContext(read('assets/rc231/combat-lifecycle.js'), runtime);
const L = runtime.window.__HAPIL_COMBAT_LIFECYCLE_RC231__;
function actor(id, flags = {}) { return { id, hp: 100, x: 24, y: 14, ...flags }; }
function state(zone = 'dist01', mode = 'STORY', a = actor('mb-dist01')) { return { zone, gameModeV31346: mode, time: 100, hp: 240, enemies: [a], hostileProjectiles: [] }; }
function packet(a, flags = {}) { return { sourceId: a.id, damage: 9, born: 100, x: 24, y: 14, vx: -3, vy: 1, ...flags }; }
for (const mode of ['STORY', 'DREAM']) {
  eq(records.filter(r => !r.rest).length, 55, mode + ' uses the same authored battle universe');
  for (const row of owners) {
    const a = actor(row.id), s = state(row.zone, mode, a);
    eq(!!L.eligible(s, a, packet(a), 'hostileProjectiles'), row.id !== 'inner-evil-rc133', mode + ' named admission sample ' + row.id);
  }
  for (const row of ordinary) { const a = actor(row.id), s = state('dist01', mode, a); ok(L.eligible(s, a, packet(a), 'hostileProjectiles'), mode + ' ordinary sample ' + row.id); }
}
for (const [id, flags] of [['mb-dist01-partner-1-rc133', { midboss: true, rc135FissionIdentity: 'mb-dist01' }], ['rc210-wall-tower-u201', { stationaryRC210: true }], ['rc210-wall-tower-u202', { stationaryRC210: true }], ['rc225-interlude-ep1b02-1', { rc225Interlude: true }], ['b09-boss', { episodeCosmicFinalV387: true }], ['u203-boss', { dreamCosmicTrialV31346: 1 }]]) {
  const a = actor(id, flags), s = state('ep1b02', 'DREAM', a); ok(L.eligible(s, a, packet(a), 'hostileProjectiles'), 'dynamic native path admitted ' + id);
}
for (const flags of [{ rc88Part: true }, { rc89CommandBody: true }, { echoChildV31368: true }, { rc133InnerBoss: true }, { objectiveStructureV31238: true }, { protectedNarrativeTargetV31238: true }, { friendly: true }]) {
  const a = actor('retained-native-family', flags), s = state('cult04', 'DREAM', a); ok(!L.eligible(s, a, packet(a), 'hostileProjectiles'), 'intentional unique/allied exclusion ' + Object.keys(flags)[0]);
}
for (const marker of ['themeFollowupV31323', 'themeRootDotRC210', 'rootFollowupRC210', 'rootTargetRC220', 'blackHoleDotRC175', 'machineTentacleDotRC210', 'spaceDeletionDotRC210', 'balrogSpatialRiftRC210', 'insomniaFogDotRC210', 'persistentHazard']) {
  const a = actor('dist06-boss'), s = state('dist06', 'DREAM', a); ok(!L.eligible(s, a, packet(a, { [marker]: true }), 'pendingHits'), 'autonomous field retains native interval ' + marker);
}
ok(!L.enabled({ ...state(), practiceV31329: true }), 'practice excluded from common lifecycle');

// Execute the actual bounded deployed hookup, not a hand-recreated wrapper.
const native = read('assets/rc133/native-install-v2.js.txt');
const hookStart = native.indexOf('  // RC231: finalize native packets');
const hookEnd = native.indexOf('  H().bind(', hookStart);
ok(hookStart >= 0 && hookEnd > hookStart, 'bounded native integration block exists');
const hook = native.slice(hookStart, hookEnd);
ok(bundle.includes(hook.trimEnd()), 'the deployed bundle carries the actual integration source');
runtime.nativeCalls = [];
runtime.MONGSE_shouldBossStartNormalAttackSmartR1 = () => true;
runtime.Ei = (s, a) => { runtime.nativeCalls.push('cast'); s.hostileProjectiles.push(packet(a, { frozenUntil: s.time + .7 })); return 'native-cast'; };
runtime.MONGSE_spawnBossCombatPatternV31230 = (s, a) => { runtime.nativeCalls.push('pattern'); return { native: true }; };
runtime.MONGSE_beginSpatialRiftBarrage = () => { runtime.nativeCalls.push('rift'); return 'native-rift'; };
runtime.MONGSE_spawnThemeOrdnanceKind3129 = () => { runtime.nativeCalls.push('theme'); return 'native-theme'; };
runtime.bi = () => { runtime.nativeCalls.push('barrage'); return 3; };
runtime.HAPIL_preserveCommittedCombatQueuesV31303 = () => 'preserved';
runtime.window.__HAPIL_COMBAT_SAFETY_RC126__ = { prepareFrame: () => 'safety-native' };
runtime.window.__HAPIL_SKILL_COMPLETION_V31412__ = { beginEnemyCast(s, a) { a.attackAt = s.time + .6; return 'basic-native'; } };
vm.runInContext('(function(){\n' + hook + '\n})()', runtime);
const a = actor('mb-dist01', { midboss: true }), s = state('dist01', 'STORY', a);
eq(runtime.Ei(s, a), 'native-cast', 'deployed cast wrapper calls the original producer');
eq(s.hostileProjectiles[0].collisionDisabledUntil31219, 100.7, 'deployed producer binds native warning to contact');
ok(!L.ready(s, a), 'deployed primary cast reserves same-owner recovery');
eq(runtime.Ei(s, a), null, 'same-owner primary recast defers');
eq(runtime.MONGSE_spawnBossCombatPatternV31230(s, a).deferredRC231, true, 'native boss pattern wrapper defers consistently');
eq(runtime.MONGSE_spawnThemeOrdnanceKind3129(s, a), 'native-theme', 'already committed theme chain remains native');
eq(runtime.bi(s, a), 3, 'already committed barrage chain remains native');
eq(runtime.nativeCalls.filter(x => x === 'cast').length, 1, 'deferred call does not execute producer');
const directActor = actor('rc225-interlude-dist01-1'), direct = state('dist01', 'DREAM', directActor);
direct.hostileProjectiles.push(packet(directActor, { frozenUntil: 101.2 }));
eq(runtime.window.__HAPIL_COMBAT_SAFETY_RC126__.prepareFrame(direct), 'safety-native', 'native frame safety result preserved');
eq(direct.hostileProjectiles[0].collisionDisabledUntilV31226, 101.2, 'frame hook covers direct queue producers');
const areaActor = actor('ordinary-melee'), area = state('dist02', 'STORY', areaActor);
area.pendingHits = [{ sourceId: areaActor.id, born: 100, at: 101.5, damage: 9 }];
eq(runtime.HAPIL_preserveCommittedCombatQueuesV31303(area), 'preserved', 'native committed-queue result preserved');
ok(L.inspect(area, areaActor).until >= 101.85, 'queue hook covers native melee/area impact windows');
const basicActor = actor('dist01-sp1'), basic = state('dist01', 'STORY', basicActor);
eq(runtime.window.__HAPIL_SKILL_COMPLETION_V31412__.beginEnemyCast(basic, basicActor), 'basic-native', 'native ordinary cast completion result preserved');
ok(L.inspect(basic, basicActor).until >= 100.95 - 1e-9, 'ordinary basic hook binds original windup/recovery');
for (const key of L.queues) {
  const qa = actor('owner:' + key), qs = state('dist01', 'DREAM', qa);
  qs[key] = [packet(qa, { at: 101, endAt: 101.4, frozenUntil: 100.6 })]; L.prepareFrame(qs);
  ok(L.inspect(qs, qa), 'direct family is observed through deployed frame contract ' + key);
}
console.log(JSON.stringify({ passed: checks, authoredModes: ['STORY', 'DREAM'], battleMapsPerMode: 55, restMaps: 6, reverseNodes: 62, namedCatalogIdentities: 72, rawOrdinaryTemplates: 194, rawNamedTemplates: 65, naturalCastsObserved: 0, scope: 'source route omission gate plus actual deployed hookup with synthetic native packets' }));
