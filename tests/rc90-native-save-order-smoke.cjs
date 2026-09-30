const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const fixture=fs.readFileSync(path.join(__dirname,'rc88-danmaku-rpg-smoke.cjs'),'utf8');
vm.runInNewContext(fixture+`
 const callIndices=[];
 window.__HAPIL_SAMONG_COSMIC_V386__={restoreSummon(s,w,index){
   callIndices.push(index);const a={id:'kair-great-0'+(index+1),samongCosmicIndexV386:index+1,hp:30,maxHp:30,rc88InteractiveCosmic:true,samongCosmicSummonV386:true};
   s.enemies.push(a);w.activeId=a.id;return true;
 }};
 for(const savedClock of [0,42,3599]){
  for(const legacy of [false,true]){
   const nativeLoad=state('cult04','c104-boss');nativeLoad.time=0;
   const save={zone:'cult04',hapilFinalBattleV31301:{combatElapsedRC79:savedClock,boss:{maxHp:4000}},danmakuRpgRC88:{zone:'cult04',owners:{},parts:[],cosmicKills:[1,2],samongWeakRemaining:.8,wave:{nextIndex:3,activeIndex:3,activeHp:69,activeMaxHp:legacy?undefined:72,activeRemaining:.35,delay:1.2}}};
   assert.equal(bridge.restoreEntry(nativeLoad,save),9);
   // This is the native loader's order: entry hooks run before restoring phase-2 time.
   nativeLoad.hapilFinalBattleV31300={stage:7,combatElapsedRC79:savedClock};
   const wave=nativeLoad.hapilSamongCosmicWaveV386;
   assert.equal(wave.activeId,'kair-great-03');assert.equal(nativeLoad.enemies.find(a=>a.rc88InteractiveCosmic).hp,69);assert.equal(nativeLoad.enemies.find(a=>a.rc88InteractiveCosmic).maxHp,72);
   assert(Math.abs(wave.activeUntil-savedClock-.35)<1e-9);
   assert(Math.abs(wave.nextAt-savedClock-1.2)<1e-9);
   assert(Math.abs(nativeLoad.rc88Encounter.samongWeakUntil-savedClock-.8)<1e-9);
   assert.deepEqual([...nativeLoad.rc88Encounter.cosmicKills],[1,2]);
 }}
 assert.deepEqual(callIndices,[2,2,2,2,2,2]);
`,{require,console,__dirname,__filename:path.join(__dirname,'rc88-danmaku-rpg-smoke.cjs')});
console.log('RC90 PASS: native entry-before-final-clock ordering preserves active wraith, HP, call index, remaining lifetime and weakness across save epochs.');
