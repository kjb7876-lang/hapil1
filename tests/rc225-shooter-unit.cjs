'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root={setInterval:()=>1,clearInterval(){},setTimeout(){},__HAPIL_CONTROLS_V31329__:{effective:s=>s.combatModeV31329??'manual'}};root.window=root;
let contacts=0;const D={installed:true,metrics:()=>({contacts}),tryParry(){contacts++;return true;},blockDamage(){contacts++;return true;},credit(){contacts++;return true;}};
let baseCalls=0;const L={installed:true,decorateAttack(s,before){baseCalls++;}};
const template={id:'scout',hp:100,maxHp:100,boss:false,midboss:false};
const A={maps:{dist06:{enemies:[template,{id:'authored-boss',boss:true,hp:100}]}},format:{enemyRadius:.72},point:q=>q,cloneEnemy:row=>({...row}),};root.__HAPIL_BATTLE_ARENA_RC138__=A;
let encounter=false;const F={profile:zone=>A.maps[zone]?{}:null,waveAdvanceReady:()=>true};
const ctx=vm.createContext({window:root,Set,WeakMap,Map,Math,Number,Object,Array,JSON});root.__HAPIL_DEFENSE_V31356__=root.__HAPIL_CHANNEL_V31364__=D;root.__HAPIL_LOOP_V31365__=L;root.__HAPIL_NATIVE_ARENA_RC138__=A;root.__HAPIL_RC86_BRIDGE__={cloneEnemy:(row)=>({...row})};root.__HAPIL_FLOW_V31343__=F;root.__HAPIL_INNER_FINAL_RC133__={encounter:()=>encounter};
vm.runInContext(fs.readFileSync('assets/rc225/shooter.js','utf8'),ctx);const S=root.__HAPIL_SHOOTER_RC225__;
const enemy={id:'boss',boss:true,hp:100,x:24,y:12};const s={zone:'dist06',time:0,hp:240,x:13,y:24,moveVx:0,moveVy:0,activeHeroId:'gunner',combatModeV31329:'semi',enemies:[enemy],pendingStrikes:[],floatTexts:[],fxSerial:1,resonance:42,spawnedWaves:new Set([1,2,3]),bossDefeated:false};
function volley(t,mode=s.combatModeV31329,target=enemy){s.time=t;s.combatModeV31329=mode;s.targetEnemyId=target?.id;s.pendingStrikes=[];const before=new Set();s.pendingStrikes.push({targetId:target?.id??'none',power:20,actionKey:'A'});root.__HAPIL_LOOP_V31365__.decorateAttack(s,before);return s.pendingStrikes[0];}
assert.equal(S.version,'RC225');assert(S.metrics().installed,'all three native APIs wrapped');
assert.equal(volley(0).rc225ShotStyle,'rapid-fire','hero A art keeps its existing weapon profile');assert.equal(volley(.38).rc225FocusV31365>0,true,'a stable semi-auto firing lane earns focus');assert.equal(volley(.76).rc225FocusV31365,.08,'focus is capped at eight percent');
const full=volley(1.14,'full');assert.equal(full.rc225FocusV31365,undefined,'full auto does not receive the manual/semi focus bonus');
s.combatModeV31329='semi';s.time=1.5;assert.equal(root.__HAPIL_DEFENSE_V31356__.tryParry(s,{},s,true),true);assert.equal(S.snapshot(s).countershots,1,'one accepted parry earns one ephemeral shot');const boosted=volley(1.55);assert.equal(boosted.power,25,'the next basic shot gets a 25 percent countershot boost');assert.equal(boosted.rc225ResonanceShot,true);assert.equal(s.resonance,42,'the boost does not change the existing resonance resource');assert.equal(volley(1.9).rc225ResonanceShot,undefined,'one parry never grants an unlimited buff');
s.time=2;s.moveVx=2;assert.equal(volley(2).rc225FocusV31365,undefined,'moving to reposition resets sustained-fire focus');s.moveVx=0;
s.enemies=[];const originalWaves=[...s.spawnedWaves];assert.equal(root.__HAPIL_FLOW_V31343__.waveAdvanceReady(s),false,'the optional interlude holds the boss transition');let actor=s.enemies.at(-1);assert(actor.rc225Interlude&&actor.requiredForClear===false&&actor.maxHp<=72,'one small, optional native actor spawns');
for(let i=0;i<3;i++){actor.hp=0;s.time+=.34;assert.equal(root.__HAPIL_FLOW_V31343__.waveAdvanceReady(s),false,'the next enemy waits for the previous kill');if(i<2){s.time+=.33;assert.equal(root.__HAPIL_FLOW_V31343__.waveAdvanceReady(s),false);actor=s.enemies.at(-1);assert.equal(actor.rc225InterludeIndex,i+1);}}
s.time+=.6;assert.equal(root.__HAPIL_FLOW_V31343__.waveAdvanceReady(s),true,'native boss entry resumes after the third defeat');assert.deepEqual([...s.spawnedWaves],originalWaves,'native wave progression remains unchanged');assert.equal(S.metrics().interludeActors,3);assert.equal(S.metrics().interludesCompleted,1);
// The completion gate is read by camera/clear checks as well as the scheduler.
// Repeated reads must remain clear until the native wave-4 consumer runs.
const completedCount=S.metrics().interludesCompleted,spawnedCount=S.metrics().interludeActors;
for(let i=0;i<120;i++){s.time+=.016;assert.equal(root.__HAPIL_FLOW_V31343__.waveAdvanceReady(s),true);}
assert.equal(S.metrics().interludeActors,spawnedCount);assert.equal(S.metrics().interludesCompleted,completedCount);
for(const zone of ['dist01','dist02','dist03','dist04','dist05']){A.maps[zone]={enemies:[template]};const plain={...s,zone,time:20,enemies:[],spawnedWaves:new Set([1,2,3])};for(let i=0;i<120;i++){plain.time+=.016;assert.equal(root.__HAPIL_FLOW_V31343__.waveAdvanceReady(plain),true);}assert.equal(plain.enemies.length,0);assert.equal(S.eligibleInterlude(plain,root.__HAPIL_FLOW_V31343__),false);}
const p={...s,zone:'cult04',time:4,enemies:[],spawnedWaves:new Set([1,2,3])};encounter=true;assert.equal(root.__HAPIL_FLOW_V31343__.waveAdvanceReady(p),true,'hidden Persona encounters retain their native exception');assert.equal(S.snapshot(p).interlude,null);
encounter=false;
const restored={...s,time:10,enemies:[],spawnedWaves:new Set([1,2,3])};assert.equal(root.__HAPIL_FLOW_V31343__.waveAdvanceReady(restored),false);const beforeRestore=restored.enemies.at(-1);restored.enemies=[];restored.time+=.01;
assert.equal(root.__HAPIL_FLOW_V31343__.waveAdvanceReady(restored),false);assert(restored.enemies.at(-1)?.rc225Interlude,'same-world checkpoint restore resumes the gate using a live roster actor');assert.notEqual(restored.enemies.at(-1),beforeRestore,'removed transient actor cannot deadlock the next boss gate');
template.protectedNarrativeTargetV31307=true;const protectedWorld={...s,time:20,enemies:[],spawnedWaves:new Set([1,2,3])};assert.equal(root.__HAPIL_FLOW_V31343__.waveAdvanceReady(protectedWorld),true,'a narrative-only map never clones its protected actor into an interlude');assert.equal(protectedWorld.enemies.length,0);
console.log('RC225_SHOOTER_UNIT',JSON.stringify({status:'passed',metrics:S.metrics(),scope:'VM integration of the real RC225 wrapper with native-contract fakes; not a browser, balance or natural campaign claim.'}));
