'use strict';
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync('assets/rc222/storage.js', 'utf8');
const nativeSource = fs.readFileSync('assets/index-v31526.js', 'utf8');
function storageMap(enabled = true) {
  const values = new Map();
  return { values, get length() { return values.size; }, key: i => [...values.keys()][i] ?? null,
    getItem(k) { if (!enabled) throw Error('blocked'); return values.get(String(k)) ?? null; },
    setItem(k, v) { if (!enabled) throw Error('blocked'); values.set(String(k), String(v)); },
    removeItem(k) { if (!enabled) throw Error('blocked'); values.delete(String(k)); } };
}
function fixture(kind = 'local') {
  const root = { localStorage: storageMap(kind === 'local'), sessionStorage: storageMap(kind !== 'memory') };
  root.window = root; vm.createContext(root); vm.runInContext(source, root);
  const api = root.__HAPIL_COOP_STORAGE_RC222__;
  let world = { zone: 'hub', time: 0, shards: 3, completedZones: [], passives: { damage: 2 }, hostDownUntil: Infinity };
  let settings = { sound: true, combatMode: 'semi' }, hero = 'hwando', applies = 0, rewards = 0, failApply = false;
  const copy = value => api.codec.clone(value);
  const capture = () => ({ protocol: 1, zone: world.zone, world: copy(world), settings: copy(settings), hero });
  api.configure({ captureLocal: capture, restoreLocal(value) { world = copy(value.world); settings = copy(value.settings); hero = value.hero; return true; },
    captureCheckpoint: capture, validateCheckpoint: v => v?.protocol === 1 && ['hub', 'dist01'].includes(v.zone) && v.zone === v.world?.zone && Number.isFinite(v.world?.time) && Array.isArray(v.world.completedZones),
    applyCheckpoint(value, options) { applies++; assert.equal(options.rewards, false); if (failApply && !options.rollback) { world.shards = 999; return false; } world = copy(value.world); settings = copy(value.settings); hero = value.hero; return true; } });
  return { root, api, get world() { return world; }, get settings() { return settings; }, get hero() { return hero; }, set hero(v) { hero = v; }, get applies() { return applies; }, get rewards() { return rewards; }, set failApply(v) { failApply = v; } };
}
const keys = ['mongse_save_v10_auto', 'mongse_save_v10_auto_backup', 'mongse_save_v10_auto_mirror',
  'mongse_save_v1_slot_1', 'mongse_settings_v1', 'hapilEndingCleared', 'hapilCampaignCompleteV31301',
  'hapil.samongUnlocked.rc91', 'hapil.pattern-codex.v1', 'hapil.pattern-records.v1'];
for (const kind of ['local', 'session', 'memory']) {
  const f = fixture(kind), { api, root } = f;
  const area = kind === 'local' ? root.localStorage : root.sessionStorage;
  if (kind !== 'memory') for (const key of keys) area.setItem(key, 'solo:' + key);
  const baseline = [...area.values];
  assert.equal(api.enter('host', 'room-a').ok, true);
  assert.equal(api.enter('host', 'room-a').unchanged, true);
  assert.equal(api.enter('guest', 'room-b').reason, 'session-active');
  const seeded = new Set(['hapil.samongUnlocked.rc91', 'hapilEndingCleared', 'hapilCampaignCompleteV31301', 'mongse_settings_v1']);
  for (const key of keys) { assert.equal(api.read(key), kind !== 'memory' && seeded.has(key) ? 'solo:' + key : null); api.write(key, 'host:' + key); assert.equal(api.read(key), 'host:' + key); }
  f.world.zone = 'dist01'; f.world.time = 9; f.world.shards = 44; f.world.completedZones.push('hub'); f.settings.sound = false; f.hero = 'seoha';
  const saved = api.save('chapter'); assert.equal(saved.ok, true); assert.equal(saved.persistent, kind === 'local'); assert.equal(saved.reloadSafe, kind !== 'memory');
  const nativeSaved = api.nativeSave('chapter', { zone: 'dist01', passives: { damage: 2 } });
  assert.equal(nativeSaved.ok, true); assert.equal(nativeSaved.persistent, kind === 'local'); assert.equal(nativeSaved.reloadSafe, kind !== 'memory');
  assert.equal(api.list().length, 1);
  const text = api.export('chapter'); assert.equal(typeof text, 'string'); assert(text.includes('$hapilNumberRC222'));
  f.world.shards = 7;
  assert.equal(api.load('chapter').ok, true); assert.equal(f.world.shards, 44); assert.equal(f.world.hostDownUntil, Infinity);
  assert.equal(api.load('chapter').ok, true); assert.equal(f.world.shards, 44); assert.equal(f.rewards, 0); assert.equal(f.applies, 2);
  const beforeBad = [...area.values];
  for (const bad of ['{}', 'null', 'broken', '{"kind":"hapil.coop.checkpoint.rc222","version":1,"snapshot":{}}', text.replace('"protocol":1', '"protocol":2'), text.replace('"Infinity"', '"NaN"'), text.replace('"snapshot":{', '"snapshot":{"__proto__":{},')]) {
    assert.equal(api.import(bad, 'chapter').ok, false); assert.deepEqual([...area.values], beforeBad);
  }
  assert.equal(api.save('../solo').ok, false); assert.equal(api.load('missing').ok, false); assert.equal(api.import(text, 'copy').ok, true);
  f.world.shards = 19; f.failApply = true;
  assert.equal(api.load('chapter').ok, false); assert.equal(f.world.shards, 19); f.failApply = false;
  assert.equal(api.leave().ok, true); assert.equal(api.leave().unchanged, true);
  assert.equal(f.world.zone, 'hub'); assert.equal(f.world.shards, 3); assert.equal(f.world.hostDownUntil, Infinity); assert.equal(f.settings.sound, true); assert.equal(f.hero, 'hwando');
  for (const [k, v] of baseline) assert.equal(area.values.get(k), v);
  assert.equal(api.enter('host', 'room-b').ok, true); assert.equal(api.read(keys[0]), null); assert.equal(api.list().length, 0); assert.equal(api.leave().ok, true);
  assert.equal(api.enter('host', 'room-a').ok, true); assert.equal(api.read(keys[0]), 'host:' + keys[0]); assert.equal(api.list().length, 2); api.leave();
  const beforeGuest = [...area.values]; assert.equal(api.enter('guest', 'room-a').ok, true);
  for (const key of keys) { assert.equal(api.read(key), null); assert.equal(api.write(key, 'guest'), false); assert.equal(api.area('localStorage').removeItem(key), false); }
  f.world.shards = 1000; f.world.passives.damage = 99; f.settings.sound = false; f.hero = 'slayer';
  for (const result of [api.save(), api.import(text), api.load(), api.nativeSave('auto', {})]) assert.equal(result.reason, 'guest-read-only');
  assert.equal(api.export(), null); assert.equal(api.list().length, 0); assert.deepEqual([...area.values], beforeGuest);
  assert.equal(api.leave().ok, true); assert.equal(f.world.shards, 3); assert.equal(f.world.passives.damage, 2); assert.equal(f.settings.sound, true); assert.equal(f.hero, 'hwando');
  assert.deepEqual([...area.values], beforeGuest); assert(api.status().blockedWrites >= keys.length * 3);
}
{
  const f = fixture();
  assert.equal(f.api.enter('bad', 'room').ok, false); assert.equal(f.api.enter('host', '').ok, false);
  assert.equal(f.api.save().reason, 'host-only'); assert.equal(f.api.load().reason, 'host-only');
  const values = { plus: Infinity, minus: -Infinity, list: [null, Infinity, 3] };
  const result = f.api.codec.decode(JSON.parse(JSON.stringify(f.api.codec.encode(values))));
  assert.equal(result.plus, Infinity); assert.equal(result.minus, -Infinity); assert.equal(result.list[0], null); assert.equal(result.list[1], Infinity);
  assert.throws(() => f.api.codec.encode({ n: NaN })); assert.throws(() => f.api.codec.encode({ set: new Set() }));
  const cycle = {}; cycle.self = cycle; assert.throws(() => f.api.codec.encode(cycle));
}
{
  const f = fixture();
  let world = { zones: new Set(['hub']), waves: new Map([['hub', 1]]), cooldown: Infinity, optional: undefined };
  f.api.configure({ captureLocal: () => ({ world }), restoreLocal: value => { world = value.world; return true; } });
  assert.equal(f.api.enter('guest', 'collections').ok, true);
  world.zones.add('dist01'); world.waves.set('hub', 99); world.cooldown = 0;
  assert.equal(f.api.leave().ok, true);
  assert.equal(world.zones.has('hub'), true); assert.equal(world.zones.has('dist01'), false);
  assert.equal(world.waves.get('hub'), 1); assert.equal(world.cooldown, Infinity); assert.equal(Object.hasOwn(world, 'optional'), true);
}
{
  const f = fixture(); let reject = true;
  f.api.configure({ restoreLocal() { f.api.write('hapilEndingCleared', 'true'); return !reject; } });
  f.api.enter('guest', 'failed-restore');
  assert.equal(f.api.leave().reason, 'restore-failed'); assert.equal(f.api.status().active, true);
  assert.equal(f.root.localStorage.getItem('hapilEndingCleared'), null);
  reject = false; assert.equal(f.api.leave().ok, true); assert.equal(f.api.status().active, false);
}
// Exercise the actual native storage functions once the ESM integration is installed.
function nativeFunction(name) {
  const start = nativeSource.indexOf('\nfunction ' + name + '(') + 1;
  assert(start > 0, 'native function exists: ' + name);
  const end = nativeSource.indexOf('\nfunction ', start + 1);
  return nativeSource.slice(start, end);
}
{
  const f = fixture(), root = f.root;
  root.MONGSE_storageMemory = new Map(); root.Er = 'mongse_save_v10_auto'; root.Tr = 'mongse_save_v10_slot_'; root.ji = v => v;
  for (const name of ['MONGSE_storageGet', 'MONGSE_storageSet', 'MONGSE_saveStorageKey', 'MONGSE_writeSave']) vm.runInContext(nativeFunction(name), root);
  root.MONGSE_storageSet('mongse_save_v10_auto', '{"solo":true}');
  assert.equal(f.api.enter('host', 'native-room').ok, true);
  const integrated = nativeFunction('MONGSE_storageSet').includes('__HAPIL_COOP_STORAGE_RC222__');
  assert.equal(integrated, true, 'native ESM storage routing hook is required');
  root.MONGSE_storageSet('hapilEndingCleared', 'true');
  assert.equal(root.localStorage.getItem('hapilEndingCleared'), null); assert.equal(root.MONGSE_storageGet('hapilEndingCleared'), 'true');
  assert.equal(root.MONGSE_writeSave('auto', { zone: 'hub', heroId: 'hwando' }).ok, true);
  assert.equal(root.localStorage.getItem('mongse_save_v10_auto'), '{"solo":true}');
  f.api.leave(); assert.equal(root.MONGSE_storageGet('mongse_save_v10_auto'), '{"solo":true}');
  assert.equal(f.api.enter('guest', 'native-room').ok, true);
  assert.equal(root.MONGSE_storageSet('hapilEndingCleared', 'true'), false);
  assert.equal(root.MONGSE_writeSave('auto', { zone: 'hub' }).ok, false);
  f.api.leave(); assert.equal(root.localStorage.getItem('mongse_save_v10_auto'), '{"solo":true}');
}
{
  const samong = fs.readFileSync('assets/rc91/samong-awakening.js', 'utf8'), f = fixture(), root = f.root;
  root.KEY = 'hapil.samongUnlocked.rc91'; root.Event = class { constructor(type) { this.type = type; } }; root.dispatchEvent = () => {};
  for (const name of ['unlocked', 'unlock']) {
    const start = samong.indexOf('\n function ' + name + '(') + 1, end = samong.indexOf('\n function ', start + 1);
    assert(start > 0); vm.runInContext(samong.slice(start, end), root);
  }
  root.localStorage.setItem(root.KEY, 'true');
  assert.equal(root.unlocked({}), true);
  f.api.enter('guest', 'unlock-room');
  assert.equal(root.unlocked({}), false, 'guest unlock check cannot inherit solo progression');
  const guestWorld = {}; assert.equal(root.unlock(guestWorld, 'story-ending'), false); assert.equal(guestWorld.samongUnlockedRC91, undefined);
  assert.equal(root.sessionStorage.getItem(root.KEY), null, 'native guest unlock cannot persist');
  f.api.leave(); assert.equal(root.localStorage.getItem(root.KEY), 'true');
  root.localStorage.removeItem(root.KEY); f.api.enter('host', 'unlock-room');
  root.unlock({}, 'story-ending'); assert.equal(root.unlocked({}), true);
  assert.equal(root.localStorage.getItem(root.KEY), null, 'native host unlock stays in session namespace');
  f.api.leave(); assert.equal(root.unlocked({}), false);
}
{
  const f = fixture(), { root, api } = f;
  root.localStorage.setItem('hapil.samongUnlocked.rc91', 'true'); root.localStorage.setItem('mongse_settings_v1', '{"sound":false}');
  root.localStorage.setItem('mongse_save_v10_auto', '{"zone":"dist01"}');
  api.enter('host', 'seed-room');
  assert.equal(api.read('hapil.samongUnlocked.rc91'), 'true'); assert.equal(api.read('mongse_settings_v1'), '{"sound":false}');
  assert.equal(api.read('mongse_save_v10_auto'), null, 'host entitlement seeding never copies solo saves');
  api.write('hapil.samongUnlocked.rc91', 'false'); api.leave();
  assert.equal(root.localStorage.getItem('hapil.samongUnlocked.rc91'), 'true');
  api.enter('host', 'seed-room'); assert.equal(api.read('hapil.samongUnlocked.rc91'), 'false', 'existing cooperative values are preserved'); api.leave();
}
{
  const codex = fs.readFileSync('assets/pattern-codex-v31410.js', 'utf8'), f = fixture(), { root, api } = f;
  root.KEY = 'hapil.pattern-codex.v1';
  vm.runInContext("var data={version:1,records:{}}; const storage=()=>window.__HAPIL_COOP_STORAGE_RC222__?.area('localStorage')??localStorage;", root);
  for (const name of ['restoreRecords', 'reload', 'save', 'records']) {
    const start = codex.indexOf('\n function ' + name + '(') + 1, end = codex.indexOf('\n function ', start + 1);
    assert(start > 0); vm.runInContext(codex.slice(start, end), root);
  }
  const solo = { version: 1, records: { solo: { attempts: 1 } } }, coop = { version: 1, records: { coop: { attempts: 8 } } };
  root.localStorage.setItem(root.KEY, JSON.stringify(solo)); root.reload();
  api.configure({ captureLocal: () => ({ records: root.records() }), restoreLocal: value => { root.restoreRecords(value.records); return true; } });
  api.enter('host', 'record-room'); assert.equal(Object.keys(root.reload().records).length, 0, 'missing scoped codex resets old module data');
  root.restoreRecords(coop); assert.equal(root.save(), true); api.leave();
  assert.equal(root.records().records.solo.attempts, 1); assert.equal(root.localStorage.getItem(root.KEY), JSON.stringify(solo));
  api.enter('guest', 'record-room'); assert.equal(Object.keys(root.reload().records).length, 0);
  root.restoreRecords(coop); assert.equal(root.save(), false); api.leave();
  assert.equal(root.records().records.solo.attempts, 1); assert.equal(root.localStorage.getItem(root.KEY), JSON.stringify(solo));
  api.enter('host', 'record-room'); assert.equal(root.reload().records.coop.attempts, 8); api.leave();
  assert.equal(root.records().records.solo.attempts, 1);
}
{
  const root = fixture().root;
  const start = nativeSource.indexOf('  function safeCopy(value,depth=0){'), stop = nativeSource.indexOf('  function cleanRoster(', start);
  assert(start > 0 && stop > start); vm.runInContext(nativeSource.slice(start, stop), root);
  const restored = vm.runInContext('restore(JSON.parse(JSON.stringify(safeCopy({cooldown:Infinity,lastAttack:-Infinity,zones:new Set(["hub"])}))))', root);
  assert.equal(restored.cooldown, Infinity); assert.equal(restored.lastAttack, -Infinity); assert.equal(restored.zones.has('hub'), true);
}
{
  const f=fixture(),{root,api}=f,key='hapil.run-draft.v31400',solo=JSON.stringify({humanPlayers:1,humanHeroes:[],aiEnabled:false,origin:'new'});
  root.localStorage.setItem(key,solo);root.CustomEvent=function(){};root.dispatchEvent=()=>{};
  vm.runInContext(fs.readFileSync('assets/foundation-v31400/policy.js','utf8'),root);vm.runInContext(fs.readFileSync('assets/foundation-v31400/run.js','utf8'),root);
  assert.equal(root.__HAPIL_RUN_V31400__.draft().humanPlayers,1);api.enter('host','draft-host');root.__HAPIL_RUN_V31400__.select({humanPlayers:4,humanHeroes:['gunner','seoha','neon'],origin:'network'});assert.equal(root.localStorage.getItem(key),solo,'host network draft never overwrites solo draft before refresh');assert.equal(JSON.parse(api.area('localStorage').getItem(key)).humanPlayers,4);api.leave();
  api.enter('guest','draft-guest');root.__HAPIL_RUN_V31400__.select({humanPlayers:4,humanHeroes:['gunner','seoha','neon'],origin:'network'});assert.equal(root.localStorage.getItem(key),solo,'guest network draft never overwrites solo draft before refresh');api.leave();
  const reloaded={localStorage:root.localStorage};reloaded.window=reloaded;vm.runInNewContext(fs.readFileSync('assets/foundation-v31400/policy.js','utf8'),reloaded);vm.runInNewContext(fs.readFileSync('assets/foundation-v31400/run.js','utf8'),reloaded);assert.equal(reloaded.__HAPIL_RUN_V31400__.draft().humanPlayers,1,'fresh page uses unchanged solo draft');
}
{
  const {root,api}=fixture();root.KEY='hapil.gameMode.v31346';root.valid=v=>v;root.preference='STORY';root.lastState=null;
  const start=nativeSource.indexOf(' function set(value,s=window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current)'),end=nativeSource.indexOf(' function suppressFullNarrative',start);assert(start>0&&end>start);vm.runInContext(nativeSource.slice(start,end),root);
  root.localStorage.setItem(root.KEY,'STORY');api.enter('host','mode-host');root.set('DREAM',{});assert.equal(root.localStorage.getItem(root.KEY),'STORY');assert.equal(api.area('localStorage').getItem(root.KEY),'DREAM');api.leave();api.enter('guest','mode-guest');root.set('DREAM',{});assert.equal(root.localStorage.getItem(root.KEY),'STORY');api.leave();
}
{
  const env={};env.window=env;vm.runInNewContext(fs.readFileSync('assets/rc126/combat-safety.js','utf8'),env);
  const safety=env.__HAPIL_COMBAT_SAFETY_RC126__,world={zone:'dist02',time:10,hostileProjectiles:[]},q={x:1,y:1,vx:1,vy:0,damage:1};
  assert.equal(safety.prepareVolley(world,null,[q]).group,'salvo:1');assert.equal(safety.prepareVolley(world,null,[q]),null);
  delete world.rc126AssetLedger;world.time=1;
  assert.equal(safety.nextGroup(world),'volley:1','loading an early checkpoint recreates a missing ledger despite an existing WeakMap entry');
  assert.equal(safety.prepareVolley(world,null,[q]).group,'salvo:2','rewind clears packet admission cache');
  world.rc126AssetLedger={version:1,sequence:8,zones:{}};
  assert.equal(safety.nextGroup(world),'volley:9','loading a replacement ledger preserves its checkpoint sequence');
  const ledger=world.rc126AssetLedger,view=new Proxy({}, {get:(_,key)=>world[key],set:(_,key,value)=>(world[key]=value,true)});
  env.__HAPIL_REMOTE_RC222_RUNTIME__={canonicalWorld:s=>s===view?world:s};
  assert.equal(safety.nextGroup(view),'volley:10');assert.equal(world.rc126AssetLedger,ledger,'facades share the canonical admission cache without recloning the ledger');
}
{
  const {api}=fixture(),initial=api.status().generation;
  assert.equal(initial,0);assert.equal(api.enter('host','epoch-owner').ok,true);assert.equal(api.status().generation,initial+1);
  api.enter('host','epoch-owner');assert.equal(api.status().generation,initial+1,'unchanged session does not invalidate live callbacks');
  api.save('1');api.load('1');assert.equal(api.status().generation,initial+1,'checkpoint load stays in the same storage scope');
  api.leave();assert.equal(api.status().generation,initial+2);api.enter('guest','epoch-guest');assert.equal(api.status().generation,initial+3);api.leave();assert.equal(api.status().generation,initial+4);
}
{
  const {api}=fixture();assert.equal(api.status().soloSaveBlocked,false);api.enter('guest','returned-title');api.leave();assert.equal(api.status().soloSaveBlocked,true);
  api.enter('host','next-coop');assert.equal(api.allowSoloSaves(),false,'cooperative launch cannot release a solo save boundary');assert.equal(api.status().soloSaveBlocked,true);api.leave();
  assert.equal(api.allowSoloSaves(),true,'explicit solo start releases the title boundary');assert.equal(api.status().soloSaveBlocked,false);
}
{
  const f=fixture(),{api}=f;api.configure({captureLocal:()=>({phase:'game',protocol:1,zone:f.world.zone,world:api.codec.clone(f.world),settings:api.codec.clone(f.settings),hero:f.hero})});
  api.enter('host','ongoing-solo');api.leave();assert.equal(api.status().soloSaveBlocked,false,'an originally active solo run can continue normal saving immediately');
}
console.log('RC222_STORAGE passed: native helpers, solo isolation, per-session saves, host checkpoint import/export/load, guest write rejection, local restoration, repeat load, malformed data, rollback, Infinity and local/session/memory fallback.');
