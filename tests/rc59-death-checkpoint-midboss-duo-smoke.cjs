const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const bundle = read('assets/index-v31526.js');
const sourceStart = bundle.indexOf('/* RC59: Episode 1 death checkpoints, scripture card, and paired midbosses. */');
assert(sourceStart >= 0, 'RC59 death/duo runtime is missing');
const context = {
  N: {
    hub: {id:'hub',order:0,enemies:[]},
    dist00: {id:'dist00',order:1,enemies:[]},
    dist01: {id:'dist01',order:2,enemies:[
      {id:'d01-mob',name:'일반 적',hp:20,maxHp:20},
      {id:'d01-mid',name:'지하 문지기',sprite:'./assets/test-mid.webp',hp:100,maxHp:100,midboss:true,x:18,y:11},
    ]},
    distMulti: {id:'distMulti',order:3,enemies:[
      {id:'multi-mid-a',name:'첫 문지기',hp:100,maxHp:100,midboss:true,x:11,y:10},
      {id:'multi-mid-b',name:'둘째 문지기',hp:100,maxHp:100,midboss:true,x:17,y:10},
      {id:'multi-mid-c',name:'셋째 문지기',hp:100,maxHp:100,midboss:true,x:23,y:10},
      ...Array.from({length:5},(_,i)=>({id:`multi-mob-${i}`,name:'일반 적',hp:20,maxHp:20,x:5+i,y:20})),
    ]},
    dist04: {id:'dist04',order:5,enemies:[
      {id:'dist04-c1',name:'되살아난 방패동료',sprite:'./assets/episode1a/corrupted_guardian.webp',hp:80,maxHp:80},
      {id:'dist04-s1',name:'이름 잃은 전우',sprite:'./assets/dist/skeleton.png',hp:60,maxHp:60},
      {id:'dist04-c2',name:'보라검 부활자',sprite:'./assets/episode1a/corrupted_guardian.webp',hp:90,maxHp:90},
    ]},
    ep1a11: {id:'ep1a11',order:12,enemies:[]},
    dreamRest: {id:'dreamRest',order:13,rest:true,enemies:[]},
    ep1b01: {id:'ep1b01',order:14,enemies:[]},
    restEp1b: {id:'restEp1b',order:22,rest:true,enemies:[]},
    cult03: {id:'cult03',order:40,enemies:[
      {id:'c103-mid',name:'이단의목사 한리안',hp:100,maxHp:100,midboss:true},
      {id:'c103-boss',name:'이단의목사 백이온',hp:200,maxHp:200,boss:true},
    ]},
  },
  window: {
    __HAPIL_V31346_RELEASE__:{installed:true},
    __HAPIL_FLOW_V31345__:{installed:true,profile:zone=>zone==='dist01',
      admit:state=>{const leader=state.enemies.find(actor=>actor.midboss&&!String(actor.id).endsWith('-duo-rc59'));if(leader){leader.x=26;leader.y=6;}}},
    __HAPIL_MODES_V31346__:{installed:true},
    __HAPIL_PARTY_V31322__:{status:{role:'solo'}},
  },
  MONGSE_ASSET_VERSION:'31526',
  MONGSE_isRestZone:zone=>['dreamRest','restEp1b'].includes(zone),
  MONGSE_zonePortalAnchors:()=>({interactionEntry:{x:7,y:25},interactionExit:{x:25,y:7}}),
  MONGSE_initialRosterPlanV31228:zone=>({mode:'test',waves:new Set([1,2,3]),enemies:(context.N[zone]?.enemies??[]).map(actor=>({...actor}))}),
  MONGSE_writeSave:(slot,payload)=>{context.lastSave={slot,payload};return {ok:true};},
  Fi:state=>({zone:state.zone,completedZones:[...(state.completedZones??[])]}),
  ji:save=>save,
  Ii:save=>(context.N[save.zone]?.enemies??[]).filter(actor=>actor.midboss).map(actor=>({...actor})),
  ii:(state,zone)=>{state.zone=zone;state.enemies=context.MONGSE_initialRosterPlanV31228(zone).enemies;context.window.__HAPIL_FLOW_V31345__.admit(state);state.spawnedWaves=new Set([1]);},
  HAPIL_restoreEntryFlowV31301:()=>true,
  MONGSE_prepareRestEncounter31226:state=>state,
  MONGSE_reading:undefined,
  Jr:actor=>({...actor}),
  dt:(zone,point)=>point,
  ti:(zone,wave)=>(context.N[zone]?.enemies??[]).map(actor=>({...actor})),
  oe:{x:10,y:15},
  setTimeout:()=>0,
};
vm.createContext(context);
vm.runInContext(bundle.slice(sourceStart), context);
const api = context.window.__HAPIL_EPISODE1_RC59__;
assert(api?.installed, 'RC59 installer should attach to the runtime');

assert.equal(api.respawnDestination({zone:'dist04',completedZones:[] }),'dist00',
  'before Episode 1-A is cleared, death must restart Episode 1 at its first map');
assert.equal(api.respawnDestination({zone:'dist04',completedZones:['ep1a11'],lastShelterZoneRC59:'dreamRest'}),'dreamRest',
  'after Episode 1-A is cleared, death must return to the remembered shelter');
assert.equal(api.respawnDestination({zone:'ep1b01',completedZones:['ep1a11'],lastShelterZoneRC59:'restEp1b'}),'restEp1b',
  'the latest later shelter must take precedence');
assert.equal(api.respawnDestination({zone:'dist04',completedZones:[],practiceV31329:true}),null,
  'practice runs must not change campaign checkpoints');

const firstDeath={zone:'dist04',frontierZone:'dist04',completedZones:vm.runInContext("new Set(['dist01','u201'])",context),
  enemies:[],spawnedWaves:vm.runInContext('new Set()',context),time:20};
assert.equal(api.beforeRespawn(firstDeath),true);
assert.equal(firstDeath.zone,'dist00');
assert.equal(firstDeath.frontierZone,'dist00');
assert.deepEqual(Array.from(firstDeath.completedZones),['u201'],
  'restart clears Episode 1-A route progress while retaining unrelated campaign progress');
assert.equal(api.afterRespawn(firstDeath),true);
assert.match(firstDeath.lastDeathScriptureRC59,/John 11:25; Romans 6:23/);

const checkpointDeath={zone:'ep1b01',frontierZone:'ep1b01',lastShelterZoneRC59:'dreamRest',
  completedZones:vm.runInContext("new Set(['ep1a11','dreamRest'])",context),enemies:[{id:'stale',hp:2}],time:40};
assert.equal(api.beforeRespawn(checkpointDeath),true);
assert.equal(checkpointDeath.zone,'dreamRest');
assert.deepEqual(Array.from(checkpointDeath.enemies),[]);
assert.equal(checkpointDeath.frontierZone,'ep1b01','shelter respawn must preserve the unlocked frontier');

const roster=context.MONGSE_initialRosterPlanV31228('dist01');
const midbosses=roster.enemies.filter(actor=>actor.midboss);
assert.equal(midbosses.length,2,'every single midboss roster must become a pair');
assert.equal(new Set(midbosses.map(actor=>actor.id)).size,2,'midboss pair IDs must be unique');
assert(midbosses.every(actor=>actor.hp>0&&actor.maxHp>=actor.hp));
assert(Math.hypot(midbosses[0].x-midbosses[1].x,midbosses[0].y-midbosses[1].y)>=4.2,
  'paired midbosses must have separate combat positions');
const entered={zone:'hub',x:2,y:26,time:5,enemies:[]};
context.ii(entered,'dist01',false);
const enteredPair=entered.enemies.filter(actor=>actor.midboss);
assert.equal(enteredPair.length,2);
assert(Math.hypot(enteredPair[0].x-enteredPair[1].x,enteredPair[0].y-enteredPair[1].y)>=4.2,
  'the partner must reposition beside the leader after route admission moves the leader');
const multiRoster=context.MONGSE_initialRosterPlanV31228('distMulti').enemies;
assert.equal(multiRoster.filter(actor=>actor.midboss).length,6,
  'all three original midbosses must each receive a partner');
assert(multiRoster.length<=8,'pairing must respect the compact encounter roster cap');
assert(!context.MONGSE_initialRosterPlanV31228('cult03').enemies.some(actor=>String(actor.id).endsWith('-duo-rc59')),
  'RC56’s existing cult03 apostate duo must stay intact');

const legacySave={zone:'dist01',spawnedWaves:[1,2,3],enemies:[{id:'d01-mid',hp:37,x:18,y:11}]};
assert.equal(context.Ii(legacySave).filter(actor=>actor.midboss).length,2,
  'a legacy save with one living midboss must resume with its new partner');
const serialized=context.Fi({zone:'ep1b01',episode1ACompleteRC59:true,lastShelterZoneRC59:'dreamRest',midbossDuoSpawnedRC59:true});
assert.equal(serialized.episode1ACompleteRC59,true);
assert.equal(serialized.lastShelterZoneRC59,'dreamRest');
assert.equal(serialized.midbossDuoSpawnedRC59,true);
const shelterVisit={zone:'dreamRest',completedZones:vm.runInContext("new Set(['ep1a11'])",context),
  lastShelterZoneRC59:null,enemies:[],activeHeroId:'hwando'};
context.window.__HAPIL_CONTROLS_V31329__={binding:{
  state:{current:shelterVisit},hero:{current:'hwando'},passives:{current:{}},shards:{current:0},
}};
assert.equal(api.visit(shelterVisit),true,'visiting a post-clear shelter must store it as the checkpoint');
assert.equal(shelterVisit.lastShelterZoneRC59,'dreamRest');
assert.equal(context.lastSave?.slot,'auto','shelter arrival must persist to the autosave');
assert.equal(context.lastSave?.payload?.lastShelterZoneRC59,'dreamRest');
const restoredState={zone:'ep1b01',completedZones:vm.runInContext("new Set(['ep1a11'])",context)};
context.HAPIL_restoreEntryFlowV31301(restoredState,{zone:'ep1b01',episode1ACompleteRC59:true,lastShelterZoneRC59:'dreamRest'});
assert.equal(restoredState.lastShelterZoneRC59,'dreamRest','the checkpoint must survive save restoration');

const companionAudit=api.audit().companionFight;
assert.equal(companionAudit.zone,'dist04');
assert.equal(companionAudit.actors.length,2);
assert.equal(companionAudit.allPresent,true,
  'both already-authored revived companions must be included in dist04’s first combat wave');
for(const sprite of companionAudit.assets)
  assert(fs.existsSync(path.join(root,sprite.replace(/^\.\//,''))),`existing companion art is missing: ${sprite}`);
assert(bundle.includes('“나는 부활이요 생명이니”'));
assert(bundle.includes('요한복음 11:25'));
assert(bundle.includes('로마서 6:23'));
assert.match(read('index.html'),/index-v31526\.js\?v=35901/,
  'RC59 must invalidate the RC58 browser cache');

console.log('RC59 PASS: Episode 1 death/checkpoint rules, scripture card hooks, revived-comrade wave, and paired midboss restores verified.');
