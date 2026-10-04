const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const echo=[];
const plan=()=>Object.fromEntries(['all','A','B','C','pins'].map(k=>[k,new Set()]));
const bridge={modeApi:{mode:s=>s.gameModeV31346??'STORY'},cloneEnemy:a=>({...a}),point:(z,x,y)=>({x,y}),
 zoneActors:()=>[{id:'mob',sprite:'./mob.webp',hp:100}],phase:a=>a.currentPhase??1,
 projectileSprite:a=>'./'+a.id+'.webp',projectileCap:()=>192,persistentTick:()=>7,
 phaseGateHealth:(s,a,d)=>Math.max(1,a.hp-d),zoneAssetManifest:()=>new Set(),zoneAssetPlan:plan,
 serializeSave:s=>({zone:s.zone}),normalizeSave:r=>({...r}),restoreEntry:()=>9};
const window={__HAPIL_RC86_BRIDGE__:bridge,__HAPIL_EPISODE_COSMIC_V387__:{installed:true},innerWidth:1200,
 __HAPIL_LOOP_V31365__:{afterHit(){},blockReward(){},queueEcho:(...a)=>{echo.push(a);return true;}}};
vm.runInNewContext(read('assets/rc88/danmaku-rpg.js'),{window,setTimeout:()=>{}});
const api=window.__HAPIL_DANMAKU_RPG_RC88__;assert(api?.installed);
const state=(zone,id)=>({zone,time:10,fxSerial:1,x:12,y:12,hp:100,maxHp:100,activeHeroId:'hwando',
 enemies:[{id,x:18,y:10,hp:1000,maxHp:1000,sprite:'./boss.webp',boss:true,currentPhase:1}],
 effects:[],floatTexts:[],defeated:[],hostileProjectiles:[],pendingStrikes:[],clues:new Set()});
for(const p of api.profiles){const s=state(p.zone,p.id);api.tick(s);s.time=12;api.tick(s);
 if(['roots','commands','copies','swords','liberation'].includes(p.kind))assert.equal(s.enemies.filter(a=>a.rc88Part).length,p.count??1);
 else assert(s.hostileProjectiles.length>0,p.kind+' must release native missiles');
 const count=s.hostileProjectiles.length;api.tick(s);assert.equal(s.hostileProjectiles.length,count,'one frame must not repeat emission');
 assert(s.hostileProjectiles.every(q=>q.expiresAt>q.frozenUntil&&q.radius>0&&q.damage>0&&q.sprite));
}
const tree=state('dist00','dist00-boss');api.tick(tree);tree.time=12;api.tick(tree);
const part=tree.enemies.find(a=>a.rc88Part),committed=[...tree.hostileProjectiles];
const queued={sourceId:part.id,damage:9};tree.pendingHits=[queued];part.hp=0;
assert(api.beforeDeath(tree,part));assert.equal(tree.enemies.filter(a=>a.rc88Part).length,2);
assert.deepEqual(tree.hostileProjectiles,committed);assert.equal(tree.pendingHits[0],queued);
assert.equal(tree.bossDefeated,undefined);assert.equal(api.damageFactor(tree,tree.enemies[0]),1.4);
assert.equal(api.budgetFactor(tree,tree.enemies[0]),1.25);
assert.equal(api.castDamageFactor(tree,tree.enemies[0],.01),.35);
assert.equal(api.castDamageFactor(tree,part,.01),1);
assert.equal(bridge.phaseGateHealth(tree,{rc88Part:true,hp:30},999),0);
assert.equal(bridge.phaseGateHealth(tree,{hp:30},999),1,'ordinary native phase floor remains');
const shots=echo.length;api.afterHit(tree,tree.enemies[0],100,100,{heroId:'hwando'});assert.equal(echo.length,shots+1);
api.afterHit(tree,tree.enemies[0],100,100,{heroId:'hwando',shmupEchoV31365:true});assert.equal(echo.length,shots+1);
const snap=api.snapshot(tree),loaded=state('dist00','dist00-boss');loaded.time=0;
api.restore(loaded,snap);api.tick(loaded);assert.equal(loaded.enemies.filter(a=>a.rc88Part).length,2,'killed root must not respawn after loading');
assert(!loaded.enemies.some(a=>a.id===part.id));assert(loaded.enemies.filter(a=>a.rc88Part).every(a=>a.rc88NextAt>=.55));
const save=bridge.serializeSave(tree),normalized=bridge.normalizeSave(save);assert(normalized.danmakuRpgRC88);
const command=state('u203','u203-boss');api.tick(command);assert.equal(api.damageFactor(command,command.enemies[0]),.72);
for(const a of [...command.enemies].filter(a=>a.rc88Part)){a.hp=0;api.beforeDeath(command,a);}
command.time+=4;assert.equal(api.damageFactor(command,command.enemies[0]),1);
const copies=state('ep1b09','b09-boss');api.tick(copies);copies.enemies[0].currentPhase=2;api.tick(copies);
assert.equal(copies.enemies.filter(a=>a.rc88Part).length,2,'new phase replaces old copies');
const cosmicCopies=state('ep1b09','b09-boss'),cosmicSource=cosmicCopies.enemies[0];
cosmicSource.episodeCosmicFinalV387=true;cosmicSource.hp=0;
assert.equal(api.beforeDeath(cosmicCopies,cosmicSource),false,'source Cosmic death cannot replay the original narrative connection');
assert.equal(cosmicSource.hp,0);assert.equal(cosmicCopies.rc88Encounter?.connection,undefined);
cosmicSource.hp=700;api.restore(cosmicCopies,{...api.snapshot(copies),connectionRemaining:1});
assert.equal(cosmicSource.hp,700,'old connection save cannot replace source Cosmic HP with 1');
cosmicCopies.rc88Encounter.connection={id:cosmicSource.id,until:cosmicCopies.time};api.tick(cosmicCopies);
assert.equal(cosmicSource.hp,700,'stale original connection cannot kill a source Cosmic actor');
const swords=state('hando03','h103-boss');api.tick(swords);const blade=swords.enemies.find(a=>a.rc88Part);blade.hp=0;
const supportCount=echo.length;api.beforeDeath(swords,blade);assert.equal(echo.length,supportCount+2);
const duo=state('cult03','c103-mid');duo.enemies.push({id:'c103-boss',hp:1000,maxHp:1000,x:20,y:15});
api.tick(duo);duo.enemies[0].hp=0;assert.equal(api.beforeDeath(duo,duo.enemies[0]),false);
assert.equal(duo.rc88Encounter.owners['c103-boss'].enraged,true);
const tempo=state('kair03','k103-boss');api.tick(tempo);tempo.time=12;api.tick(tempo);const q=tempo.hostileProjectiles[0];
tempo.time=q.rc88LaunchAt+.5;api.tick(tempo);assert(Math.abs(q.vx-q.rc88BaseVx*.45)<1e-9);
tempo.time=q.rc88LaunchAt+1.3;api.tick(tempo);assert.equal(q.frozenUntil,q.rc88LaunchAt+1.65);
tempo.time=q.rc88LaunchAt+1.8;api.tick(tempo);assert(Math.abs(q.vx-q.rc88BaseVx*1.8)<1e-9);
for(const mode of ['DREAM','BOSS']){const s=state('dist00','dist00-boss');s.gameModeV31346=mode;api.tick(s);assert.equal(s.enemies.length,1);}
const practice=state('dist00','dist00-boss');practice.practiceV31329=true;api.tick(practice);assert.equal(practice.enemies.length,1);
const final=state('cult04','c104-boss');final.hapilFinalBattleV31300={combatElapsedRC79:20,completed:false};
final.enemies[0].hapilSecondPhaseV31300=true;const summon={id:'great',samongCosmicIndexV386:1,maxHp:999,x:20,y:10};
api.prepareSummon(final,summon);final.enemies.push(summon);final.hapilSamongCosmicWaveV386={activeId:'great',nextAt:26.35};
assert.equal(api.summonClock(final),20);assert.equal(summon.maxHp,30);summon.hp=0;final.hostileProjectiles=[{sourceId:'great'}];
assert(api.beforeDeath(final,summon));assert.equal(final.rc88Encounter.cosmicKills.length,1);
assert.equal(final.hapilSamongCosmicWaveV386.nextAt,20.85);assert.equal(final.hostileProjectiles.length,1);
assert.equal(api.damageFactor(final,final.enemies[0]),1.4);
final.hapilFinalBattleV31300.combatElapsedRC79+=4;
assert.equal(api.damageFactor(final,final.enemies[0]),1.06);
assert.equal(api.preserveSummonAttacks(final),true);final.hapilFinalBattleV31300.completed=true;
assert.equal(api.preserveSummonAttacks(final),false);
tree.zone='shelter';api.tick(tree);assert.equal(tree.enemies.some(a=>a.rc88Part),false);
assert.equal(api.sanitize(snap,'u203'),null);
vm.runInNewContext(read('assets/rc79/combat-policy.js'),{window});
const policy=window.__HAPIL_RC79__;
assert.equal(policy.balancedDamage(tree,{rc88Part:true,hp:20,maxHp:20,boss:true},999),999);
assert.equal(policy.balancedDamage(tree,{hp:500,maxHp:500,boss:true},999),40);
const finalBoss={id:'c104-boss',hp:1000,maxHp:1000,boss:true,hapilSecondPhaseV31300:true};
final.hapilFinalBattleV31300={stage:7,combatElapsedRC79:20};assert(policy.finalFloor(final,finalBoss)>0);
console.log('RC88 PASS: 19 encounter routes, destructible emitters, committed attacks, shield/weakness, native echo growth, paired support, phase copies, rhythms, save restore, modes and final floor.');
