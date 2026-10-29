const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const bundle=fs.readFileSync(path.join(__dirname,'../assets/index-v31526.js'),'utf8');
const begin=bundle.indexOf('function HAPIL_restoreFinalBattleV31301('),end=bundle.indexOf('\nfunction HAPIL_restoreEntryFlowV31301(',begin);
if(begin<0||end<=begin)throw Error('native final-battle loader missing');
const fixture=fs.readFileSync(path.join(__dirname,'rc88-danmaku-rpg-smoke.cjs'),'utf8').replace('restoreEntry:()=>9};','restoreEntry:()=>9,restoreFinalBattle:HAPIL_restoreFinalBattleV31301};');
vm.runInNewContext(bundle.slice(begin,end)+'\n'+fixture+`
 const callIndices=[];
 let mobile=false;
 window.__HAPIL_SAMONG_COSMIC_V386__={mobileDevice:()=>mobile,restoreSummon(s,w,index){
   callIndices.push(index);const a={id:'kair-great-0'+(index+1),samongCosmicIndexV386:index+1,hp:30,maxHp:30,rc88InteractiveCosmic:true,samongCosmicSummonV386:true};
   s.enemies.push(a);w.activeIds.push(a.id);return true;
 }};
 for(const savedClock of [0,42,3599]){
  for(const isMobile of [false,true]){
   mobile=isMobile;
   const nativeLoad=state('cult04','c104-boss');nativeLoad.time=0;
   const save={zone:'cult04',hapilFinalBattleV31301:{stage:7,secondPhaseActive:true,awakeningCommittedRC108:true,combatElapsedRC79:savedClock,boss:{id:'c104-boss',hp:1000,maxHp:4000}},danmakuRpgRC88:{zone:'cult04',owners:{},parts:[],cosmicKills:[1,2],samongWeakRemaining:.8,wave:{version:2,status:'six-awakened',nextIndex:3,strikeIndex:2,delay:1.2,active:[{index:3,hp:69,maxHp:72,dispatched:true,dispatchRemaining:.35}]}}};
   assert.equal(bridge.restoreEntry(nativeLoad,save),9);
   // Native entry hooks run before restoring the final battle's clock.
   assert.equal(bridge.restoreFinalBattle(nativeLoad,save),true);
   assert.equal(nativeLoad.hapilFinalBattleV31300.awakeningPendingRC108,false);
   assert.equal(nativeLoad.hapilFinalBattleV31300.awakeningCommittedRC108,true);
   const wave=nativeLoad.hapilSamongCosmicWaveV386, actor=nativeLoad.enemies.find(a=>a.rc88InteractiveCosmic);
   assert.deepEqual([...wave.activeIds],['kair-great-03']);assert.equal(actor.hp,69);assert.equal(actor.maxHp,72);
   assert.equal(actor.samongCosmicPatternDispatchedV386,!isMobile);
   assert(Math.abs(actor.samongCosmicDispatchAtV386-.35)<1e-9);
   assert(Math.abs(wave.nextAt-savedClock-1.2)<1e-9);
   assert(Math.abs(nativeLoad.rc88Encounter.samongWeakUntil-savedClock-.8)<1e-9);
   assert.deepEqual([...nativeLoad.rc88Encounter.cosmicKills],[1,2]);
   assert.equal(wave.status,isMobile?'mobile-single':'six-awakened');
  }
  // Older saves encoded a single timed echo. The six-body scene must restart
  // from charging; never reinterpret that echo as a completed six-body wave.
  const nativeLoad=state('cult04','c104-boss');nativeLoad.time=0;
  const save={zone:'cult04',hapilFinalBattleV31301:{stage:7,secondPhaseActive:true,combatElapsedRC79:savedClock,awakeningCommittedRC108:true,boss:{id:'c104-boss',hp:1000,maxHp:4000}},danmakuRpgRC88:{zone:'cult04',owners:{},parts:[],cosmicKills:[1,2],samongWeakRemaining:.8,wave:{nextIndex:3,activeIndex:3,activeHp:69,activeMaxHp:72,activeRemaining:.35,delay:1.2}}};
  assert.equal(bridge.restoreEntry(nativeLoad,save),9);
  assert.equal(nativeLoad.hapilFinalBattleV31300,undefined,'real loader has not created final battle before entry');
  assert.equal(bridge.restoreFinalBattle(nativeLoad,save),true);
  const wave=nativeLoad.hapilSamongCosmicWaveV386;
  assert.equal(wave.version,2);assert.equal(wave.status,'charging');assert.equal(wave.nextIndex,0);
  assert.deepEqual([...wave.activeIds],[]);assert.deepEqual([...nativeLoad.rc88Encounter.cosmicKills],[]);
  assert(Math.abs(wave.nextAt-savedClock-1.3)<1e-9);
  assert.equal(nativeLoad.hapilFinalBattleV31300.awakeningPendingRC108,true);
  assert.equal(nativeLoad.hapilFinalBattleV31300.awakeningCommittedRC108,false);
 }
 // Completed final battles, unrelated zones and failed native restore must not
 // receive the migration's awakening reset.
 {
  const row=state('cult04','c104-boss');row.time=0;
  const save={zone:'cult04',hapilFinalBattleV31301:{stage:7,secondPhaseActive:true,completed:true,awakeningCommittedRC108:true,boss:{id:'c104-boss',hp:500,maxHp:1000}},danmakuRpgRC88:{zone:'cult04',owners:{},parts:[],wave:{activeIndex:1}}};
  bridge.restoreEntry(row,save);assert.equal(bridge.restoreFinalBattle(row,save),true);
  assert.equal(row.hapilFinalBattleV31300.completed,true);assert.equal(row.hapilFinalBattleV31300.awakeningCommittedRC108,true);assert.equal(row.hapilFinalBattleV31300.awakeningPendingRC108,false);
 }
 {
  const row=state('cult04','c104-boss');row.time=0;
  const save={zone:'cult04',hapilFinalBattleV31301:{stage:7,boss:{id:'wrong',hp:500,maxHp:1000}},danmakuRpgRC88:{zone:'cult04',owners:{},parts:[],wave:{activeIndex:1}}};
  bridge.restoreEntry(row,save);assert.equal(bridge.restoreFinalBattle(row,save),false);assert.equal(row.hapilFinalBattleV31300,undefined);
  // Failed attempts consume the pending marker and cannot alter a later v2 restore.
  save.hapilFinalBattleV31301.boss.id='c104-boss';save.hapilFinalBattleV31301.awakeningCommittedRC108=true;
  assert.equal(bridge.restoreFinalBattle(row,save),true);assert.equal(row.hapilFinalBattleV31300.awakeningCommittedRC108,true);
 }
 {
  const row=state('dist00','dist00-boss');row.time=0;
  const save={zone:'dist00',hapilFinalBattleV31301:{stage:7,boss:{id:'dist00-boss',hp:500,maxHp:1000}},danmakuRpgRC88:{zone:'dist00',owners:{},parts:[],wave:{activeIndex:1}}};
  bridge.restoreEntry(row,save);assert.equal(bridge.restoreFinalBattle(row,save),false);assert.equal(row.hapilFinalBattleV31300,undefined);
 }
 assert.deepEqual(callIndices,[2,2,2,2,2,2]);
`,{require,console,__dirname,__filename:path.join(__dirname,'rc88-danmaku-rpg-smoke.cjs')});
console.log('RC90 PASS: native entry-before-final-clock ordering preserves v2 wave HP, dispatch and remaining times on desktop/mobile; legacy single-echo saves restart the six-body sequence.');
