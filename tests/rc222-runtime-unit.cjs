'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {createRuntime,portable}=require('../assets/rc222/runtime.js');
const tests=[];const test=(name,fn)=>tests.push([name,fn]);
function fixture(){
  let clock=100,role='offline',snapshotSeq=-1;
  const world={zone:'dist02',time:10,x:5,y:5,hp:240,maxHp:240,activeHeroId:'hwando',cooldowns:{Q:12},resonance:15,combo:1,clues:new Set(['a']),spawnedWaves:new Set([1]),effects:[],hostileProjectiles:[],pendingHits:[],impactQueue:[],floatTexts:[],egoDrops:[],defeated:[],pendingStrikes:[],resonanceThreads:[],telekineticCasts:[],enemies:[{id:'boss',x:8,y:8,hp:1000,maxHp:1000}],nested:new Map([['a',new Set([1,2])]])};
  const actor={slotId:'p2',heroId:'seoha',control:'remote',name:'Guest',x:7,y:7,hp:130,maxHp:240,downUntil:18};
  const roster=[{slotId:'p1',heroId:'hwando',control:'host'},actor];
  const b={phase:'game',state:{current:world},hero:{current:'hwando'},input:{current:new Set(['ArrowUp'])},settings:{current:{combatMode:'semi',sound:false}},auto:{current:false},passives:{current:{damage:4}},shards:{current:8},partyIds:{current:['hwando','gunner']},actions:{}};
  const events=[],listeners={};
  const env={performance:{now:()=>clock},addEventListener:(name,fn)=>(listeners[name]??=[]).push(fn),__HAPIL_ENDING_CLEARED_V31300__:true,__HAPIL_POLICY_V31400__:{partner:()=> 'gunner'}};
  const p={state:world,actors:[actor],roster,configure:()=>{},setNetworkRole:r=>{role=r;},leave:()=>{role='offline';},startGame:async()=>{},get status(){return {role,snapshotSeq,mode:'network'};},exportSnapshot:()=>({protocol:1,version:'3.14.05',seq:2,zone:world.zone,world:{fields:Object.entries(portable(world))},party:{roster:portable(roster),actors:portable(p.actors)}}),applySnapshot:snap=>{snapshotSeq=snap.seq;p.applied=snap;return true;}};
  env.__HAPIL_PARTY_V31322__=p;env.__HAPIL_CONTROLS_V31329__={binding:b,choice:()=> 'manual',tickBasic:()=>{},};
  env.__HAPIL_RC222_NATIVE__={createState:()=>({cooldowns:{},resonance:0,combo:0,lastAttack:-2,heroStatus:'',heroMotion:{kind:'idle'},supportReadyAt:{}}),moveActor:(view,a,wire,dt)=>{view.x+=wire.moveX*dt;view.moveVx=wire.moveX;},reviveActor:(view,a)=>{view.hp=120;view.heroHealingCeiling=120;}};
  for(const action of ['attack','dash','guard','resonance','collab'])b.actions[action]=()=>{const s=b.state.current;events.push([action,s.activeHeroId]);if(action==='attack'){s.pendingStrikes.push({id:s.pendingStrikes.length+1,heroId:s.activeHeroId,power:11});s.resonance+=5;s.hp-=2;}if(action==='dash')s.x+=2;};
  b.actions.skill=i=>{events.push(['skill',i,b.state.current.activeHeroId]);b.state.current.cooldowns[['Q','W','E','R'][i]]=20;};
  const rt=createRuntime(env);rt.attach({isHost:true,slotId:'p1',epoch:1,session:{sessionId:'test'},roster});
  return {rt,env,p,b,world,actor,events,listeners,clock:v=>{clock=v;}};
}
function installNativeRosterFixture(f){
  const source=fs.readFileSync('assets/index-v31526.js','utf8'),begin=source.indexOf('  function spawn(r,index,s=world){'),end=source.indexOf('  const assetPathsByHero=',begin);
  assert(begin>=0&&end>begin);
  // Exercise the production spawn/syncRoster functions with image loading omitted.
  const sandbox={world:f.world,bridge:{heroRef:f.b.hero},initialActors:f.p.actors,initialRoster:f.p.roster,b:v=>v,dt:(zone,p)=>p,preload:()=>{}};
  vm.runInNewContext(`let role='host',actors=initialActors,roster=initialRoster;${source.slice(begin,end)};globalThis.rosterBridge={configure(rows){roster=rows;syncRoster();},replace(rows,saved){roster=rows;actors=saved;},get actors(){return actors;},get roster(){return roster;}};`,sandbox);
  const bridge=sandbox.rosterBridge;
  f.p.configure=config=>{bridge.configure(config.roster);f.p.roster=bridge.roster;f.p.actors=bridge.actors;};
  f.p.applySnapshot=snap=>{Object.assign(f.world,portable(Object.fromEntries(snap.world.fields),true));f.b.hero.current=f.world.activeHeroId;bridge.replace(portable(snap.party.roster,true),portable(snap.party.actors,true));f.p.roster=bridge.roster;f.p.actors=bridge.actors;f.p.applied=snap;return true;};
  return bridge;
}
function installNativeOutgoingFixture(f){
  const sandbox={window:f.env};vm.createContext(sandbox);
  for(const file of ['assets/combat-v31402/combat-core.js','assets/combat-v31412/outgoing-native.js'])vm.runInContext(fs.readFileSync(file,'utf8'),sandbox);
  f.env.__HAPIL_REMOTE_RC222_RUNTIME__=f.rt;f.p.blocksSave=()=>false;
  Object.assign(f.world,{fxSerial:1,comboUntil:0,counterUntil:0,damageBuffUntil:0,awakeningUntil:0,lastLifestealTextAt:-99});
  Object.assign(f.world.enemies[0],{stagger:0,maxStagger:100000,staggerUntil:0,invulnerableUntil:0});
  const native={};for(const key of f.env.__HAPIL_OUTGOING_V31402__.dependencies)native[key]=()=>{};
  Object.assign(native,{MONGSE_objectiveDamageAllowedV31309:()=>true,HAPIL_claimCounterWindowV31303:()=>({damageMultiplier:1}),sr:()=>({damageMultiplier:1}),ir:()=>0,HAPIL_effectiveGrowthV31400:v=>v,gr:()=>({powerMultiplier:1,level:0}),MONGSE_infiniteStats:()=>({powerMultiplier:1}),MONGSE_heroOutgoingModeMultiplier31213:()=>1,HAPIL_applyCounterDamageV31303:(s,target,power)=>{const after=Math.max(0,target.hp-power);return {hpAfter:after,appliedDamage:target.hp-after};},HAPIL_bindDamageHitV31315:(effect,s,target,source)=>({...effect,...source}),MONGSE_attachEffectTarget:effect=>effect});
  const outgoing=f.env.__HAPIL_OUTGOING_V31402__.create({P:f.b.state,R:f.b.passives,Re:f.b.settings,Ke:()=>{},native});
  return {outgoing,native,target:f.world.enemies[0]};
}
function nativeDeathFixture(options={}){
  const source=fs.readFileSync('assets/index-v31526.js','utf8'),condition=source.split('\n').find(line=>line.includes('consumeCheckpoint(o) &&'))?.trim().replace(/\s*&&$/,'');assert(condition);
  const section=(from,to)=>{const begin=source.indexOf(from),end=source.indexOf(to,begin);assert(begin>=0&&end>begin);return source.slice(begin,end);};
  const world={zone:'dist02',time:10,x:5,y:5,hp:240,maxHp:240,activeHeroId:'hwando',effects:[],enemies:[],heroMotion:{}},env={};
  const sandbox={window:env,world,initialRole:options.role??'host',initialEnabled:options.enabled!==false,setTimeout:()=>{},dt:(zone,p)=>p,b:v=>v,MONGSE_applyPositionRC152:(s,p)=>Object.assign(s,p),MONGSE_isEncounterLocked31226:()=>false};vm.createContext(sandbox);
  vm.runInContext(`let role=initialRole,enabled=initialEnabled,bridge={},disconnected=false,scopedTarget=null,hostDownUntil=0,hostDownPosition=null,wipeCount=0,wipePending=false,lastZone=world.zone,lastTime=world.time,spawns=0,restarts=0;
    const stats={wipes:0,revives:0},inputs=new Map(),strikes=[],roster=[{slotId:'p1',heroId:'hwando',control:'host'},{slotId:'p2',heroId:'seoha',control:'remote'},{slotId:'p3',heroId:'neon',control:'remote'}];let actors=roster.slice(1).map(r=>({...r,x:6,y:6,hp:0,maxHp:240,downUntil:18}));
    const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,clamp=(v,a,b)=>Math.max(a,Math.min(b,num(v))),alive=a=>a&&num(a.hp)>0,active=()=>enabled&&role!=='guest'&&!disconnected&&world;
    const preload=()=>{};
    ${section('  function spawn(r,index,s=world){','  function syncRoster(){')}
    const nativeSpawn=spawn;spawn=function(...args){spawns++;return nativeSpawn(...args);};
    ${section('  function tick(s,dtSeconds,rawHeroDelta=dtSeconds','  function primaryDamage(s,base,args){')}
    ${section('  function primaryDamage(s,base,args){','  function enemyTargetScope(s,e,pattern,forced){')}
    window.__HAPIL_COMBAT_CORE_V31401__={mark(){}};
    window.__HAPIL_REMOTE_RC222_RUNTIME__={status:()=>({role}),stepActor:()=>true};
    window.__HAPIL_PARTY_V31322__={get state(){return world;},get actors(){return actors;},get status(){return {role};},shouldRespawn};
    globalThis.deathFixture={knockdown(){return primaryDamage(world,s=>{s.hp=0;return true;},[]);},frame(){tick(world,.02);const o=world;if(${condition}){restarts++;o.hp=o.maxHp;}endFrame(world);},get actors(){return actors;},get metrics(){return {hostDownUntil,hostDownPosition,wipeCount,wipePending,spawns,restarts,wipes:stats.wipes,revives:stats.revives};}};`,sandbox);
  vm.runInContext(fs.readFileSync('assets/rc91/samong-awakening.js','utf8'),sandbox);
  return {world,party:sandbox.deathFixture,samong:env.__HAPIL_SAMONG_RC91__};
}
test('resumed host status clears paused guest room flags without a roster update',()=>{const f=fixture();f.rt.updateRoom({isHost:false,slotId:'p2',hostPaused:true,hostHidden:true});f.rt.role('guest');assert.equal(f.rt.status().paused,true);f.rt.hostStatus({hidden:false,paused:false});assert.equal(f.rt.status().paused,false);f.rt.virtualKey('ArrowRight',true);assert.equal(f.rt.readInput().moveX,1);});
test('guest Samong revival control sends an owned command without local health mutation',()=>{const f=fixture();f.rt.updateRoom({isHost:false,slotId:'p2',mode:'DREAM'});f.rt.role('guest');f.actor.hp=0;assert.equal(f.rt.requestRevive('samong'),true);assert.equal(f.actor.hp,0);assert(f.rt.readInput().actions.includes('reviveSamong'));f.actor.hp=100;assert.equal(f.rt.requestRevive('samong'),false);f.actor.hp=0;f.rt.updateRoom({mode:'STORY'});assert.equal(f.rt.requestRevive('samong'),false);f.rt.updateRoom({mode:'DREAM'});f.rt.hostStatus({paused:true});assert.equal(f.rt.requestRevive('samong'),false);});
test('native actor context isolates hero health resources and refs',()=>{
  const f=fixture(),input=f.b.input.current,settings=f.b.settings.current,passives=f.b.passives.current;
  f.rt.withActor(f.world,f.actor,(view,ctx,b)=>{assert.equal(view.activeHeroId,'seoha');assert.equal(view.enemies,f.world.enemies);b.actions.attack();b.passives.current.damage=9;});
  assert.equal(f.actor.hp,128);assert.equal(f.world.hp,240);assert.equal(f.actor.resonance,5);assert.equal(f.world.resonance,15);
  assert.equal(f.b.state.current,f.world);assert.equal(f.b.hero.current,'hwando');assert.equal(f.b.input.current,input);assert.equal(f.b.settings.current,settings);assert.equal(f.b.passives.current,passives);assert.equal(passives.damage,4);assert.equal(f.actor.rc222Passives.damage,9);
  assert.equal(f.world.pendingStrikes[0].partySlotV31322,'p2');assert.equal(f.world.pendingStrikes[0].nativeActorRC222,true);
});
test('native context identity persists and all refs restore after a throw',()=>{
  const f=fixture();let first;
  assert.throws(()=>f.rt.withActor(f.world,f.actor,view=>{first=view;throw Error('cast error');}),/cast error/);
  f.rt.withActor(f.world,f.actor,view=>assert.equal(view,first));assert.equal(f.b.state.current,f.world);assert.equal(f.rt.inActorTransaction,false);
});
test('delayed native hit uses owning hero and own lifesteal or resonance state',()=>{
  const f=fixture(),source={partySlotV31322:'p2',nativeActorRC222:true};
  f.rt.resolveOutgoing(f.world,source,view=>{assert.equal(f.b.state.current,view);view.hp+=12;view.resonance+=9;view.enemies[0].hp-=40;});
  assert.equal(f.actor.hp,142);assert.equal(f.actor.resonance,9);assert.equal(f.world.hp,240);assert.equal(f.world.resonance,15);assert.equal(f.world.enemies[0].hp,960);
});
test('actual outgoing reducer attributes immediate HP commits to each active remote actor',()=>{
  const f=fixture(),{outgoing,target}=installNativeOutgoingFixture(f);
  for(const [slotId,heroId]of [['p3','neon'],['p4','hunter']]){const a={...f.actor,slotId,heroId};f.p.actors.push(a);f.p.roster.push(a);}
  const before=target.hp;for(const actor of f.p.actors)f.rt.withActor(f.world,actor,()=>outgoing(target,10,'#fff',false,0,null));
  const metrics=f.rt.telemetry();assert.equal(metrics.ownedHits,3);assert.deepEqual(metrics.outgoingEvents.map(e=>e.slotId),['p2','p3','p4']);assert.equal(metrics.outgoingEvents.reduce((sum,e)=>sum+e.damage,0),before-target.hp);
  for(const event of metrics.outgoingEvents){assert(event.damage>0);assert.equal(event.targetId,'boss');assert.equal(event.damage,event.hpBefore-event.hpAfter);}
  assert.equal(f.world.combo,1);assert.equal(f.b.state.current,f.world);
});
test('actual outgoing reducer switches delayed ownership inside another actor transaction and restores it',()=>{
  const f=fixture(),{outgoing,target}=installNativeOutgoingFixture(f),other={...f.actor,slotId:'p3',heroId:'neon',combo:0};f.p.actors.push(other);f.p.roster.push(other);
  const source={id:'p3-delayed',nativeActorRC222:true,partySlotV31322:'p3',heroId:'neon'},before=target.hp;
  f.rt.withActor(f.world,f.actor,view=>{outgoing(target,10,'#fff',false,.4,source);assert.equal(f.rt.activeActor,f.actor);assert.equal(f.b.state.current,view);});
  assert.equal(other.combo,1);assert.equal(f.actor.combo,0);assert(other.hp>130);assert.equal(f.actor.hp,130);assert.equal(f.world.hp,240);
  const events=f.rt.telemetry().outgoingEvents;assert.equal(events.length,1);assert.equal(events[0].slotId,'p3');assert.equal(events[0].sourceId,'p3-delayed');assert.equal(events[0].damage,before-target.hp);
  assert.equal(f.world.effects.at(-1).partySlotV31322,'p3');assert.equal(f.b.state.current,f.world);assert.equal(f.rt.activeActor,null);
});
test('owned outgoing diagnostics exclude rejected damage and retain a bounded sequence of actual HP commits',()=>{
  const f=fixture(),{outgoing,native,target}=installNativeOutgoingFixture(f);native.HAPIL_applyCounterDamageV31303=(s,target)=>({hpAfter:target.hp,appliedDamage:0});
  f.rt.withActor(f.world,f.actor,()=>outgoing(target,10,'#fff'));assert.equal(f.rt.telemetry().ownedHits,0);
  native.HAPIL_applyCounterDamageV31303=(s,target)=>({hpAfter:target.hp-1,appliedDamage:1});
  f.rt.withActor(f.world,f.actor,()=>{for(let i=0;i<260;i++)outgoing(target,10,'#fff',false,0,{id:i});});
  const metrics=f.rt.telemetry();assert.equal(metrics.ownedHits,260);assert.equal(metrics.outgoingEvents.length,256);assert.equal(metrics.outgoingEvents[0].seq,5);assert.equal(metrics.outgoingEvents.at(-1).seq,260);assert(metrics.outgoingEvents.every(e=>e.damage===1));
});
test('guest and disconnected roles never execute native damage or actor inputs',()=>{
  const f=fixture();f.rt.role('guest');assert.equal(f.rt.input('p2',{seq:1,actions:['attack']}),false);assert.equal(f.rt.withActor(f.world,f.actor,()=>{throw Error('must not run');}),false);f.rt.role('disconnected');assert.equal(f.rt.resolveOutgoing(f.world,{nativeActorRC222:true,partySlotV31322:'p2'},()=>{throw Error('must not run');}),false);
});
test('input slot and sequence dedup rejects host slot and duplicates',()=>{
  const f=fixture();assert.equal(f.rt.input('p1',{seq:1,actions:['attack']}),false);assert.equal(f.rt.input('p2',{seq:1,actions:['q']}),true);assert.equal(f.rt.input('p2',{seq:1,actions:['q']}),false);f.rt.stepActor(f.world,f.actor,null,.02,0);f.rt.stepActor(f.world,f.actor,null,.02,0);assert.deepEqual(f.events,[['skill',0,'seoha']]);
});
test('actual native skill dash resonance and collab closures are dispatched',()=>{
  const f=fixture();f.rt.input('p2',{seq:1,moveX:1,actions:['q','dash','resonance','collab']});f.rt.stepActor(f.world,f.actor,null,.02,0);assert.deepEqual(f.events.map(x=>x[0]),['dash','resonance','collab','skill']);assert.equal(f.world.x,5);assert.equal(f.actor.x,9.02);assert.equal(f.actor.cooldowns.Q,20);
});
test('held D routes native channel and suppresses other actor actions',()=>{
  const f=fixture();let held;f.env.__HAPIL_CHANNEL_V31364__={companion:(view,a,pressed)=>{held=pressed;return pressed;}};f.rt.input('p2',{seq:1,actions:['guard','attack','q']});f.rt.stepActor(f.world,f.actor,null,.02,0);assert.equal(held,true);assert.equal(f.events.length,0);
});
test('full and semi auto modes are actor owned and snapshot fields retain them',()=>{
  const f=fixture();f.rt.input('p2',{seq:1,combatMode:'full',actions:[]});f.rt.stepActor(f.world,f.actor,null,.02,0);assert.equal(f.actor.rc222CombatMode,'full');assert.equal(f.b.settings.current.combatMode,'semi');assert.equal(f.rt.exportSnapshot().rc222.actorModes[0].combatMode,'full');
});
test('cooperative down actor revives after eight seconds only with a survivor',()=>{
  const f=fixture();f.actor.hp=0;f.world.time=18;f.rt.stepActor(f.world,f.actor,null,.02,0);assert.equal(f.actor.hp,120);f.actor.hp=0;f.world.hp=0;f.rt.stepActor(f.world,f.actor,null,.02,0);assert.equal(f.actor.hp,0);
});
test('actual main death condition waits for checkpoint choice before native all-wipe mutation or actor rebuild',()=>{
  const f=nativeDeathFixture();f.party.knockdown();const deadActors=f.party.actors;
  assert.equal(f.party.metrics.hostDownUntil,18);assert.equal(f.samong.deathPending(f.world),true);
  for(let i=0;i<12;i++){f.world.time+=1;f.party.frame();assert.equal(f.samong.deathPending(f.world),true);assert.equal(f.party.actors,deadActors);assert(f.party.actors.every(a=>a.hp===0));assert.equal(f.party.metrics.hostDownUntil,18);assert.equal(f.party.metrics.wipePending,false);}
  assert.equal(f.party.metrics.wipes,0);assert.equal(f.party.metrics.spawns,0);assert.equal(f.party.metrics.restarts,0);
  assert.equal(f.samong.chooseRevival(f.world,'checkpoint'),true);assert.equal(f.samong.deathPending(f.world),false);f.party.frame();
  assert.equal(f.world.hp,240);assert(f.party.actors.every(a=>a.hp===240));assert.equal(f.party.metrics.wipeCount,1);assert.equal(f.party.metrics.wipes,1);assert.equal(f.party.metrics.restarts,1);assert.equal(f.party.metrics.spawns,2);assert.equal(f.party.metrics.hostDownUntil,0);assert.equal(f.party.metrics.wipePending,false);assert.equal(f.samong.consumeCheckpoint(f.world),false);
  f.party.frame();assert.equal(f.party.metrics.wipes,1);assert.equal(f.party.metrics.restarts,1);assert.equal(f.party.metrics.spawns,2);
});
test('actual native host eight-second survivor revival still bypasses the checkpoint choice',()=>{
  const f=nativeDeathFixture();f.party.actors[0].hp=100;f.party.knockdown();assert.equal(f.samong.deathPending(f.world),false);
  f.world.time=17.99;f.party.frame();assert.equal(f.world.hp,0);assert.equal(f.party.metrics.hostDownUntil,18);assert.equal(f.party.metrics.restarts,0);
  f.world.time=18;f.party.frame();assert.equal(f.world.hp,120);assert.equal(f.party.metrics.hostDownUntil,0);assert.equal(f.party.metrics.revives,1);assert.equal(f.party.metrics.wipes,0);assert.equal(f.party.metrics.restarts,0);assert.equal(f.party.metrics.spawns,0);
});
test('actual death choice order preserves solo checkpoint handling and prevents guest native respawn',()=>{
  const solo=nativeDeathFixture({role:'offline',enabled:false});solo.party.knockdown();solo.party.frame();assert.equal(solo.world.hp,0);assert.equal(solo.samong.deathPending(solo.world),true);solo.samong.chooseRevival(solo.world,'checkpoint');solo.party.frame();assert.equal(solo.world.hp,240);assert.equal(solo.party.metrics.restarts,1);assert.equal(solo.party.metrics.wipes,0);
  const guest=nativeDeathFixture({role:'guest'});guest.world.hp=0;assert.equal(guest.samong.deathPending(guest.world),false);guest.samong.chooseRevival(guest.world,'checkpoint');guest.party.frame();assert.equal(guest.world.hp,0);assert(guest.party.actors.every(a=>a.hp===0));assert.equal(guest.party.metrics.restarts,0);assert.equal(guest.party.metrics.spawns,0);assert.equal(guest.party.metrics.wipes,0);
});
test('actual native entry clears stale feedback before the strict transition snapshot wrapper runs',()=>{
  const source=fs.readFileSync('assets/index-v31526.js','utf8'),feedback=source.slice(source.indexOf("const KEY='enemyFeedbackV31361'"));
  const valid=feedback.split('\n').find(line=>line.trim().startsWith('function valid(e,s)')),wrapper=feedback.split('\n').find(line=>line.includes('const p=party();if(p?.applySnapshot)')),reset=feedback.match(/reset:s=>\{memories\.delete\(s\);if\(s\)s\[KEY\]=\[\];\}/)?.[0];assert(valid&&wrapper&&reset);
  const begin=source.indexOf('function HAPIL_resetEncounterOnEntryRC133(s) {'),end=source.indexOf('\nvar ii =',begin);assert(begin>=0&&end>begin);
  const env={},sandbox={window:env};vm.createContext(sandbox);
  vm.runInContext(`const KEY='enemyFeedbackV31361',MAX=28,memories=new WeakMap(),nativePayloads=[];const nativeParty={applySnapshot:s=>{nativePayloads.push(s.zone);return true;}},party=()=>nativeParty;${valid}\n${wrapper}\nwindow.__HAPIL_ENEMY_FEEL_V31361__={${reset}};${source.slice(begin,end)};globalThis.feedbackFixture={apply:nativeParty.applySnapshot,reset:HAPIL_resetEncounterOnEntryRC133,nativePayloads,remember:s=>memories.set(s,{}),remembered:s=>memories.has(s)};`,sandbox);
  const fixture=sandbox.feedbackFixture,event={id:'dist02-feedback',kind:'hurt',sound:'kinetic',family:'kinetic',zone:'dist02',hero:'hwando',slot:'__host',x:10,y:10,angle:0,born:1,duration:.23,strength:.3,color:'#aabbcc',accent:'#ddeeff'},world={zone:'dist02',activeHeroId:'hwando',enemyFeedbackV31361:[event]};
  const snap=()=>({zone:world.zone,world:{fields:Object.entries(world)}});assert.equal(fixture.apply(snap()),true);world.zone='dist03';assert.equal(fixture.apply(snap()),false);assert.deepEqual(Array.from(fixture.nativePayloads),['dist02']);
  fixture.remember(world);fixture.reset(world);assert.equal(fixture.remembered(world),false);assert.equal(world.enemyFeedbackV31361.length,0);assert.equal(fixture.apply(snap()),true);
  const fresh={...event,id:'dist03-feedback',zone:'dist03'};world.enemyFeedbackV31361.push(fresh);assert.equal(fixture.apply(snap()),true);assert.equal(world.enemyFeedbackV31361[0],fresh);
  fresh.strength=2;assert.equal(fixture.apply(snap()),false);assert.deepEqual(Array.from(fixture.nativePayloads),['dist02','dist03','dist03']);
});
test('native Samong choice routes through own facade',()=>{
  const f=fixture();f.actor.hp=0;let actor;f.env.__HAPIL_SAMONG_RC91__={chooseRevival:(s,choice)=>{actor=s;assert.equal(choice,'samong');s.hp=120;}};f.rt.input('p2',{seq:1,actions:['reviveSamong']});f.rt.stepActor(f.world,f.actor,null,.02,0);assert.equal(actor.activeHeroId,'seoha');assert.equal(f.actor.hp,120);assert.equal(f.world.hp,240);
});
test('snapshot rejection diagnostics tolerate malformed containers without changing validation',()=>{const f=fixture();f.rt.role('guest');for(const snap of [null,{}, {world:{fields:{}},party:{actors:{}}}, {world:{fields:[['bossLaserCastsV31330',{}],['bossUltimateCastsV31334',{}]]},party:{actors:[null]}}])assert.equal(f.rt.snapshot(snap,{seq:1,epoch:1,full:true}),false);assert.equal(f.rt.telemetry().lastSnapshotRejection.reason,'validation');});
test('snapshot validator rejects incomplete duplicate or corrupt actor state',()=>{
  const f=fixture(),snap=f.rt.exportSnapshot();assert.equal(f.rt.validateCheckpoint(snap),true);const bad=structuredClone(snap);bad.world.fields=[];assert.equal(f.rt.validateCheckpoint(bad),false);const duplicate=structuredClone(snap);duplicate.world.fields.push(['zone','dist02']);assert.equal(f.rt.validateCheckpoint(duplicate),false);snap.party.actors[0].hp=NaN;assert.equal(f.rt.validateCheckpoint(snap),false);
});
test('snapshots reject old epochs and duplicate wire seq but allow host checkpoint resequence',()=>{
  const f=fixture(),snap=f.rt.exportSnapshot();f.rt.role('guest');assert.equal(f.rt.snapshot(snap,{seq:7,epoch:1,full:true}),true);assert.equal(f.rt.snapshot(snap,{seq:7,epoch:1,full:true}),false);assert.equal(f.rt.snapshot(snap,{seq:8,epoch:0,full:true}),false);assert.equal(f.rt.snapshot(snap,{seq:1,epoch:2,full:false}),false);assert.equal(f.rt.snapshot(snap,{seq:1,epoch:2,full:true}),true);const first=f.p.applied.seq;f.rt.role('host');assert.equal(f.rt.snapshot(snap,{seq:2,epoch:2,full:true,allowHost:true}),true);assert.ok(f.p.applied.seq>first);assert.equal(f.rt.status().role,'host');
});
test('host loading a two-human checkpoint reconciles all four live humans with native actor spawning',()=>{
  const f=fixture(),snap=f.rt.exportSnapshot();installNativeRosterFixture(f);
  const live=[{slotId:'p1',heroId:'hwando'},{slotId:'p2',heroId:'seoha'},{slotId:'p3',heroId:'neon'},{slotId:'p4',heroId:'hunter'}];
  f.rt.updateRoom({roster:live});assert.equal(f.p.actors.length,3);
  assert.equal(f.rt.snapshot(snap,{seq:1,epoch:1,full:true,allowHost:true}),true);
  assert.deepEqual(Array.from(f.p.roster,r=>r.slotId),['p1','p2','p3','p4']);
  assert.equal(f.p.actors[0].hp,130);assert.equal(f.p.actors[0].downUntil,18);
  for(const actor of f.p.actors.slice(1)){assert.equal(actor.hp,240);assert.equal(actor.control,'remote');assert.equal(actor.invulnerableUntil,f.world.time+1.2);assert(Number.isFinite(actor.x)&&Number.isFinite(actor.y));assert.equal(f.rt.input(actor.slotId,{seq:1,actions:['attack']}),true);}
  const restored=f.p.actors[0];f.rt.updateRoom({hostPaused:false});assert.equal(f.p.actors[0],restored);
});
test('host checkpoint imports keep live hero and slot identities while preserving the native story companion',()=>{
  const f=fixture(),snap=f.rt.exportSnapshot();installNativeRosterFixture(f);
  const live=[{slotId:'p1',heroId:'hwando'},{slotId:'p2',heroId:'seoha'},{slotId:'p3',heroId:'neon'},{slotId:'p4',heroId:'hunter'}];f.rt.updateRoom({roster:live});
  snap.world.fields.find(row=>row[0]==='activeHeroId')[1]='gunner';snap.party.roster[0].heroId='gunner';snap.party.roster[1].heroId='lauren';snap.party.actors[0].heroId='lauren';snap.party.actors[0].hp=1;
  snap.party.roster.push({slotId:'saved-guest',heroId:'michaela',control:'remote'},{slotId:'story68',heroId:'slayer',control:'ai'});
  snap.party.actors.push({slotId:'saved-guest',heroId:'michaela',control:'remote',x:4,y:4,hp:100,maxHp:240},{slotId:'story68',heroId:'slayer',control:'ai',x:6,y:6,hp:77,maxHp:240});
  assert.equal(f.rt.snapshot(snap,{seq:1,epoch:1,full:true,allowHost:true}),true);
  assert.equal(f.world.activeHeroId,'hwando');assert.equal(f.b.hero.current,'hwando');
  assert.deepEqual(Array.from(f.p.roster,r=>[r.slotId,r.heroId,r.control]),[['p1','hwando','host'],['p2','seoha','remote'],['p3','neon','remote'],['p4','hunter','remote'],['story68','slayer','ai']]);
  assert.equal(f.p.actors.find(a=>a.slotId==='p2').hp,240);assert.equal(f.p.actors.find(a=>a.slotId==='story68').hp,77);assert.equal(f.rt.input('saved-guest',{seq:1,actions:['attack']}),false);
});
test('portable Set Map and Infinity survive local capture and restore',()=>{
  const f=fixture();f.world.hostDownUntil=Infinity;const saved=f.rt.captureLocal();assert.deepEqual(saved.world.clues,{$hapilSet:['a']});f.world.clues.clear();f.world.nested.clear();f.world.hp=1;f.b.passives.current.damage=99;f.rt.restoreLocal(saved);assert.equal(f.world.hp,240);assert.ok(f.world.clues.has('a'));assert.ok(f.world.nested.get('a') instanceof Set);assert.equal(f.world.hostDownUntil,Infinity);assert.equal(f.b.passives.current.damage,4);
});
test('local restore reapplies the captured launch mode and React view after restoring native refs',()=>{
  const f=fixture();let mode='STORY',viewRestored=false;const calls=[];
  f.env.__HAPIL_PARTY_LAUNCH_V31322__={getGameMode:()=>mode,setGameMode:value=>{calls.push(['mode',value]);assert.equal(f.env.__HAPIL_ENDING_CLEARED_V31300__,true);assert.equal(f.b.hero.current,'hwando');mode=value;}};
  const saved=f.rt.captureLocal();assert.equal(saved.modeChoice,'STORY');mode='DREAM';f.env.__HAPIL_ENDING_CLEARED_V31300__=false;f.b.hero.current='gunner';f.b.passives.current={damage:99};
  f.b.actions.restoreView=value=>{assert.equal(f.rt.inActorTransaction,false);assert.equal(mode,'STORY');assert.equal(value.hero,'hwando');assert.deepEqual(value.passives,{damage:4});assert.equal(f.b.hero.current,value.hero);assert.deepEqual(f.b.passives.current,value.passives);assert(value.world.clues instanceof Set);calls.push(['view',value.modeChoice]);viewRestored=true;};
  assert.equal(f.rt.restoreLocal(saved),true);assert.equal(viewRestored,true);assert.deepEqual(calls,[['mode','STORY'],['view','STORY']]);
});
test('pure host snapshot remains available while transition simulation is disconnected',()=>{
  const f=fixture();f.rt.role('disconnected');assert.ok(f.rt.exportSnapshot({full:true}));assert.equal(f.rt.withActor(f.world,f.actor,()=>true),false);
});
test('guest input uses original arrows A S D QWER controls and charge edges',()=>{
  const f=fixture();f.rt.attach({isHost:false,slotId:'p2'});f.rt.role('guest');const event=code=>({code,preventDefault(){},stopImmediatePropagation(){}});for(const fn of f.listeners.keydown)fn(event('ArrowRight'));for(const fn of f.listeners.keydown)fn(event('KeyA'));for(const fn of f.listeners.keydown)fn(event('KeyD'));for(const fn of f.listeners.keydown)fn(event('KeyQ'));const wire=f.rt.readInput();assert.equal(wire.moveX,1);assert.ok(wire.actions.includes('attack'));assert.ok(wire.actions.includes('chargeStart'));assert.ok(wire.actions.includes('guard'));assert.ok(wire.actions.includes('q'));for(const fn of f.listeners.keyup)fn(event('KeyA'));assert.ok(f.rt.readInput().actions.includes('chargeRelease'));
});
test('actual native held-D module retains facade session across collision transactions',()=>{
  const f=fixture(),e=f.env;e.document={hidden:false};e.__HAPIL_CONTROLS_V31329__.hasHeldLogical=()=>false;
  const sandbox={window:e,document:e.document};vm.createContext(sandbox);
  for(const file of ['assets/controller-v31406/action-contract.js','assets/controller-v31406/resonance-channel.js'])vm.runInContext(fs.readFileSync(file,'utf8'),sandbox);
  e.__HAPIL_COMBAT_CORE_V31401__={credit:(s,a,h,fn)=>fn(),resource(){},convert:(s,a,fn)=>fn(),ego(){}};
  e.__HAPIL_LOOP_V31365__={cancelCharge(){},heal:(s,a,hp)=>{a.hp=Math.min(a.maxHp,a.hp+hp);},blockReward(){}};
  const functions={F:[{id:'hwando'},{id:'seoha'},{id:'neon'}],HAPIL_effectiveGrowthV31400:v=>v,HAPIL_projectileVisibleV31355:()=>true,MONGSE_isEncounterLocked31226:()=>false,MONGSE_recordProjectileRemoval31215:(s,q)=>{q.removed=true;},hi:()=>{},sr:()=>({duration:7.2,cooldown:5,profile:{name:'native'}})};
  const native={};for(const [key,value]of Object.entries(functions))Object.defineProperty(native,key,{get:()=>value});
  e.__HAPIL_CHANNEL_FACTORY_V31406__.install(native);
  f.rt.input('p2',{seq:1,actions:['guard']});f.rt.stepActor(f.world,f.actor,null,.02,0);
  const q={id:77,born:10,x:7,y:7,damage:20};assert.equal(f.rt.parryActor(f.world,q,f.actor,true),true);assert.equal(q.parriedByV31356,'p2');assert.equal(f.actor.resonance,12);assert.equal(f.world.resonance,15);assert.equal(q.removed,true);
  assert.deepEqual(q.coreContactsV31333,['p2']);assert.equal(f.rt.parryActor(f.world,q,f.actor,true),false);assert.equal(f.actor.resonance,12);
  const other={slotId:'p3',heroId:'neon',control:'remote',x:8,y:8,hp:200,maxHp:240};f.p.actors.push(other);f.p.roster.push(other);f.rt.input('p3',{seq:1,actions:['guard']});f.rt.stepActor(f.world,other,null,.02,1);assert.equal(f.rt.parryActor(f.world,q,other,true),false);assert.equal(other.resonance,0);const ownQ={id:78,born:10,x:8,y:8,damage:20,coreContactsV31333:['__host']};assert.equal(f.rt.parryActor(f.world,ownQ,other,true),true);assert.equal(ownQ.parriedByV31356,'p3');assert.deepEqual(ownQ.coreContactsV31333,['__host','p3']);assert.equal(other.resonance,12);assert.equal(f.world.resonance,15);
});
test('actual native deferred damage ticks only owning facade across frames',()=>{
  const f=fixture();vm.runInNewContext(fs.readFileSync('assets/rc210/deferred-damage.js','utf8'),{window:f.env});
  const d=f.env.__HAPIL_DEFERRED_DAMAGE_RC210__;f.rt.withActor(f.world,f.actor,view=>d.apply(view,view,60,{id:1}));assert.equal(f.actor.hp,120);assert.equal(f.world.hp,240);
  for(let i=1;i<=5;i++){f.world.time=10+i*.101;f.rt.withActor(f.world,f.actor,view=>d.tick(view,.101));}
  assert.equal(f.actor.hp,70);assert.equal(f.world.hp,240);assert.equal(d.pending(f.world),0);
});
test('native status roots and newly produced root DOT target owning remote slot',()=>{
  const f=fixture();f.rt.withActor(f.world,f.actor,view=>{view.themeRootZoneV31323=view.zone;view.themeRootUntilV31323=11;view.rootFeedbackUntilRC220=15;view.pendingHits.push({rootTargetRC220:'__host'});view.pendingStrikes.push({sourceId:'seoha',power:7});});
  assert.equal(f.actor.themeRootUntilV31323,11);assert.equal(f.world.themeRootUntilV31323,undefined);assert.equal(f.world.pendingHits[0].rootTargetRC220,'p2');assert.equal(f.world.pendingStrikes[0].partySlotV31322,'p2');
});
test('party providers and native power read canonical world for a remote facade',()=>{
  const f=fixture();let providerWorld,powerWorld,source;f.env.__HAPIL_PARTY_BUFFS_V31322__={providers:s=>{providerWorld=s;return ['hwando','seoha'];},power:(s,t,c,q)=>{powerWorld=s;source=q;return 1.06;}};
  f.rt.withActor(f.world,f.actor,view=>{assert.equal(f.env.__HAPIL_PARTY_BUFFS_V31322__.providers(view).length,2);assert.equal(f.env.__HAPIL_PARTY_BUFFS_V31322__.power(view,{},false),1.06);});assert.equal(providerWorld,f.world);assert.equal(powerWorld,f.world);assert.equal(source.partySlotV31322,'p2');
});
test('guest positions interpolate for 100ms while HP applies immediately and AI stays blocked',()=>{
  const f=fixture();f.rt.role('guest');f.p.applySnapshot=snap=>{for(const [k,v]of snap.world.fields)f.world[k]=portable(v,true);return true;};
  let snap=f.p.exportSnapshot();assert.equal(f.rt.snapshot(snap,{seq:1,epoch:1,full:true}),true);
  snap=f.p.exportSnapshot();snap.world.fields=snap.world.fields.map(([k,v])=>[k,k==='x'?9:k==='hp'?120:v]);assert.equal(f.rt.snapshot(snap,{seq:2,epoch:1,full:true}),true);assert.equal(f.world.x,5);assert.equal(f.world.hp,120);
  f.clock(150);f.rt.guestFrame();assert.equal(f.world.x,7);assert.equal(f.world.time,10);assert.equal(f.rt.input('p2',{seq:1,actions:['attack']}),false);
  f.clock(200);f.rt.guestFrame();assert.equal(f.world.x,9);
});
test('portrait mobile clears held guest inputs and blocks commands',()=>{
  const f=fixture();f.rt.attach({isHost:false,slotId:'p2'});f.rt.role('guest');f.rt.virtualKey('KeyA',true);f.env.matchMedia=()=>({matches:true});f.env.innerWidth=400;f.env.innerHeight=800;assert.equal(f.rt.status().portrait,true);assert.deepEqual(f.rt.readInput().actions,[]);f.env.innerWidth=800;f.env.innerHeight=400;assert.equal(f.rt.readInput().attackHeld,false);
});
test('actual native SevenSin stacks and status DOT mutate only the selected actor',()=>{
  const f=fixture(),e=f.env,source=fs.readFileSync('assets/index-v31526.js','utf8');
  e.__HAPIL_COMBAT_CORE_V31401__={transaction:(s,a,q,k,cb)=>cb(),finalDamage:(s,a,v)=>v,mark(){}};
  const sandbox={window:e,dt:(z,p)=>p,MONGSE_SEVEN_SINS_THROWABLES:{envy:'envy'},MONGSE_COMBAT_PHYSICS_V3128:{enemyDamageMultiplier:1},MONGSE_limitHeroDamage31213:(s,v)=>({applied:v})};vm.createContext(sandbox);
  for(const [name,next]of [['MONGSE_setSevenSinHeroStatus','MONGSE_applySevenSinHitMechanic'],['MONGSE_applySevenSinHitMechanic','MONGSE_tickSevenSinHeroEffects'],['MONGSE_tickSevenSinHeroEffects','MONGSE_clearSevenSinTransientState']]){const at=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction '+next+'(',at);assert.ok(at>0&&end>at);vm.runInContext(source.slice(at,end),sandbox);}
  f.rt.withActor(f.world,f.actor,view=>{for(let i=0;i<3;i++)sandbox.MONGSE_applySevenSinHitMechanic(view,{sevenSinMechanic:'sloth-drowsy'});assert.ok(view.heroSleepUntil>view.time);sandbox.MONGSE_applySevenSinHitMechanic(view,{sevenSinMechanic:'envy-mirror-bleed',sourceId:'boss'});});
  f.world.time=10.85;f.rt.withActor(f.world,f.actor,view=>{const ticks=sandbox.MONGSE_tickSevenSinHeroEffects(view);assert.equal(ticks.bleedTicks,1);assert.equal(ticks.poisonTicks,1);});assert.equal(f.actor.hp,125);assert.equal(f.world.hp,240);assert.equal(f.world.heroSleepUntil,undefined);assert.equal(f.actor.heroBleedSourceIdRC108,'boss');
});
test('actual temporal lag helpers keep passive and dynamic cooldowns independent for each native actor',()=>{
  const f=fixture(),source=fs.readFileSync('assets/index-v31526.js','utf8'),begin=source.indexOf('var MONGSE_TEMPORAL_LAG_V31214 ='),end=source.indexOf('\nfunction MONGSE_deflectHostileProjectile31211(',begin);
  assert(begin>=0&&end>begin);const sandbox={J:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),MONGSE_markBossProjectile31213:()=>false,MONGSE_prepareHostileProjectilePersistence31214:()=>{}};vm.createContext(sandbox);vm.runInContext(source.slice(begin,end),sandbox);
  Object.assign(f.world,{fxSerial:1,temporalLagPassiveReadyAt31214:999,temporalLagFieldReadyAt31214:999,timeStopUntil:12});
  const other={...f.actor,slotId:'p3',heroId:'neon',x:20,y:20};f.p.actors.push(other);f.p.roster.push(other);
  const projectile=(id,a)=>({id,x:a.x-1,y:a.y,vx:1,vy:0,expiresAt:20});const first=projectile('p2-near',f.actor),second=projectile('p3-near',other);f.world.hostileProjectiles.push(first,second);
  f.rt.withActor(f.world,f.actor,view=>{assert.equal(sandbox.MONGSE_tickTemporalLagPassive31214(view),1);assert.equal(view.timeStopUntil,12);});
  f.rt.withActor(f.world,other,view=>assert.equal(sandbox.MONGSE_tickTemporalLagPassive31214(view),1));
  for(const actor of [f.actor,other])assert.equal(actor.temporalLagPassiveReadyAt31214,13.1);
  assert.equal(f.world.temporalLagPassiveReadyAt31214,999);assert.equal(first.frozenUntil,10.58);assert.equal(second.frozenUntil,10.58);
  const extra=projectile('p2-extra',f.actor);f.world.hostileProjectiles.push(extra);f.rt.withActor(f.world,f.actor,view=>{assert.equal(sandbox.MONGSE_tickTemporalLagPassive31214(view),0);assert.equal(sandbox.MONGSE_applyTemporalLagField31214(view,4.6,4,.72,'native-field'),1);});
  assert.equal(f.actor.temporalLagFieldReadyAt31214,12.4);assert.equal(other.temporalLagFieldReadyAt31214,undefined);assert.equal(f.world.temporalLagFieldReadyAt31214,999);assert.equal(f.world.timeStopUntil,12);
  const saved=f.rt.exportSnapshot();assert.equal(saved.party.actors[0].temporalLagPassiveReadyAt31214,13.1);assert.equal(saved.party.actors[0].temporalLagFieldReadyAt31214,12.4);
});
test('actual temporal resonance and HUD helpers update actor resources and timing without touching the host',()=>{
  const f=fixture(),source=fs.readFileSync('assets/index-v31526.js','utf8'),sandbox={};vm.createContext(sandbox);
  const begin=source.indexOf('var MONGSE_TEMPORAL_HUD_CONFIG_V31215 ='),end=source.indexOf('\nfunction MONGSE_pushTemporalEffect31215(',begin);assert(begin>=0&&end>begin);vm.runInContext(source.slice(begin,end),sandbox);
  for(const [name,next]of [['MONGSE_pushTemporalEffect31215','MONGSE_applyTemporalResonanceAssist31215'],['MONGSE_temporalHudTelemetry31215','MONGSE_updateTemporalHudDom31215']]){const at=source.indexOf('function '+name+'('),stop=source.indexOf('\nfunction '+next+'(',at);vm.runInContext(source.slice(at,stop),sandbox);}
  const at=source.indexOf('function MONGSE_tickTemporalHud31215('),stop=source.indexOf('\n(() => {',at);assert(at>=0&&stop>at);vm.runInContext(source.slice(at,stop),sandbox);
  Object.assign(sandbox,{MONGSE_hideTemporalHudDom31216:()=>{},MONGSE_applyTemporalResonanceAssist31215:()=>null,MONGSE_updateTemporalHudDom31215:()=>null,MONGSE_SFX:{ticking1:'a',ticking2:'b',ticking3:'c'}});
  Object.assign(f.world,{fxSerial:1,temporalResonance31215:41,temporalHudPulseUntil31215:99,temporalHudNextDomAt31215:99});
  f.world.hostileProjectiles.push({x:6,y:7,temporalMotionSnapshot31214:{vx:1},temporalLagSource31214:'near-miss-passive',temporalLagAppliedAt31214:10,temporalLagUntil31214:12});
  f.rt.withActor(f.world,f.actor,view=>{for(let i=0;i<9;i++)sandbox.MONGSE_recordTemporalResonance31215(view,'near-miss',{});assert.equal(sandbox.MONGSE_temporalHudTelemetry31215(view).resonance,100);sandbox.MONGSE_tickTemporalHud31215(view);});
  assert.equal(f.actor.temporalResonance31215,100);assert.equal(f.actor.temporalResonanceGainCount31215,9);assert.equal(f.actor.temporalHudActivationAt31215,10);assert.equal(f.actor.temporalHudPulseUntil31215,10.4);assert.equal(f.actor.temporalHudNextDomAt31215,10.05);
  assert.equal(f.world.temporalResonance31215,41);assert.equal(f.world.temporalHudPulseUntil31215,99);assert.equal(f.world.temporalHudNextDomAt31215,99);
  f.world.temporalResumeSoundReadyAt31215=999;f.world.hostileProjectiles[0].temporalLagUntil31214=10.05;let sounds=0;f.rt.withActor(f.world,f.actor,view=>sandbox.MONGSE_tickTemporalHud31215(view,{},()=>{sounds++;}));assert.equal(sounds,1);assert.equal(f.actor.temporalResumeSoundReadyAt31215,10.24);assert.equal(f.world.temporalResumeSoundReadyAt31215,999);
  f.actor.hp=0;f.rt.withActor(f.world,f.actor,view=>sandbox.MONGSE_tickTemporalHud31215(view));assert.equal(f.actor.temporalHudHiddenAt31216,10);assert.equal(f.world.temporalHudHiddenAt31216,undefined);
});
test('native foundation network draft survives launch and accepts a late human roster',()=>{
  const e={dispatchEvent(){},__HAPIL_CONTROLS_V31329__:{binding:{phase:'title',state:{current:null}}},__HAPIL_PARTY_V31322__:{status:{role:'host'}}},sandbox={window:e,localStorage:{getItem:()=>null,setItem(){}},CustomEvent:function(){}};vm.createContext(sandbox);
  for(const file of ['assets/foundation-v31400/policy.js','assets/foundation-v31400/run.js'])vm.runInContext(fs.readFileSync(file,'utf8'),sandbox);
  const R=e.__HAPIL_RUN_V31400__,rows=['hwando','seoha','neon','hunter'].map((heroId,i)=>({slotId:'p'+(i+1),heroId,control:i?'remote':'host'}));R.prepare({mode:'network',roster:rows.slice(0,2)},null);const world={activeHeroId:'hwando'};R.init(world,'hwando');assert.equal(R.configFor(world).roster.length,2);assert.equal(R.get(world).origin,'network');e.__HAPIL_CONTROLS_V31329__.binding={phase:'game',state:{current:world}};assert.equal(R.prepare({mode:'network',roster:rows},world).roster.length,4);assert.equal(R.get(world).humanPlayers,4);
});
test('runtime start recaptures replacement native world and reapplies room roster',async()=>{
  const f=fixture();let configured=0;f.p.configure=()=>{configured++;};f.b.phase='title';f.p.startGame=async()=>{f.b.state.current={...f.world,zone:'dist00'};};f.p.capture=(s)=>{f.p.state=s;};await f.rt.start({isHost:true,roster:f.p.roster,epoch:1});assert.equal(f.p.state.zone,'dist00');assert.ok(configured>=1);
});
test('actual native actor clock accelerates only owning queues using raw elapsed time',()=>{
  const f=fixture(),classNames=new Set(['rc51-samong']),classes={contains:k=>classNames.has(k),toggle:(k,on)=>on?classNames.add(k):classNames.delete(k),remove:k=>classNames.delete(k)},doc={documentElement:{classList:classes}},e=f.env;
  e.__HAPIL_STORY_DATA_RC51__={records:[],raw:''};e.__HAPIL_SAMONG_RC91__={active:s=>s.samongPassiveRC91?.active>0,delta:(s,d)=>s.samongPassiveRC91.lastDelta??d,advance:(s,d)=>{s.samongPassiveRC91.active-=d;s.samongPassiveRC91.lastDelta=d;}};
  e.document=doc;vm.runInNewContext(fs.readFileSync('assets/rc51/story.js','utf8'),{window:e,document:doc,performance:e.performance});
  e.__HAPIL_RC222_NATIVE__.actorClock=(s,d)=>e.__HAPIL_STORY_RC51__.clock(s,d);
  Object.assign(f.actor,{samongPassiveRC91:{active:7},cooldowns:{Q:20},lastAttack:9});const ownHit={partySlotV31322:'p2',at:20},hostHit={at:20},ownFx={partySlotV31322:'p2',heroSkillVfx:true,born:10},hostFx={heroSkillVfx:true,born:10};f.world.pendingStrikes.push(ownHit,hostHit);f.world.effects.push(ownFx,hostFx);
  f.rt.stepActor(f.world,f.actor,null,0,0,.04,.04);
  assert.ok(Math.abs(f.actor.cooldowns.Q-19.912)<1e-8);assert.ok(Math.abs(ownHit.at-19.912)<1e-8);assert.equal(hostHit.at,20);assert.equal(hostFx.born,10);assert.ok(Math.abs(ownFx.born-9.912)<1e-8);assert.equal(ownHit.partySlotV31322,'p2');assert.equal(f.world.cooldowns.Q,12);assert.equal(f.world.time,10);assert.equal(f.actor.samongPassiveRC91.active,6.96);
  f.rt.withActor(f.world,f.actor,view=>assert.ok(Math.abs(e.__HAPIL_STORY_RC51__.heroNow(view)-10.088)<1e-8));assert.deepEqual([...classNames],['rc51-samong']);
});
test('leaving a title-origin room restores original title world and never saves coop state',()=>{
  const f=fixture();f.rt.leave();const title={...f.world,zone:'hub'},coop={...f.world,zone:'cult04'};f.b.state.current=title;f.b.phase='title';f.p.state=null;let titles=0,saves=0;f.b.actions.returnTitle=()=>{titles++;};f.b.actions.save=()=>{saves++;};f.p.capture=s=>{f.p.state=s;};f.rt.attach({isHost:true,slotId:'p1',epoch:2,roster:f.p.roster});f.p.state=coop;f.b.state.current=coop;f.b.phase='game';f.rt.leave();assert.equal(f.b.state.current,title);assert.equal(f.b.state.current.zone,'hub');assert.equal(f.b.phase,'title');assert.equal(titles,1);assert.equal(saves,0);
  const bundle=fs.readFileSync('assets/index-v31526.js','utf8'),start=bundle.indexOf('returnTitle:()=>{'),end=bundle.indexOf('},dash:',start);assert.ok(start>0&&end>start);assert.ok(!bundle.slice(start,end).includes('MONGSE_writeSave'));
});
test('host checkpoint load has explicit safe boundary for unsaved held sessions',()=>{
  const f=fixture(),seen=[];f.env.__HAPIL_RC222_NATIVE__.resetPlayerTransient=s=>{seen.push(s);s.channelDActiveV31364=false;s.bufferedAction=null;};const snap=f.rt.exportSnapshot();assert.equal(snap.rc222.checkpointBoundary.privateActions,'clear-on-host-load');assert.equal(f.rt.snapshot(snap,{seq:1,epoch:1,full:true,allowHost:true}),true);assert.equal(seen.length,2);assert.equal(f.rt.status().role,'host');
});
test('held guard preserves raw Samong cooldown clock while blocking casts',()=>{
  const f=fixture();let elapsed=0;f.env.__HAPIL_SAMONG_RC91__={advance:(s,dt)=>{elapsed+=dt;}};f.env.__HAPIL_CHANNEL_V31364__={companion:()=>true};f.rt.input('p2',{seq:1,actions:['guard','q']});f.rt.stepActor(f.world,f.actor,null,0,0,.04,.2);assert.equal(elapsed,.2);assert.equal(f.events.length,0);
});
test('leaving restores native run draft so the next solo run cannot inherit network humans',()=>{
  const f=fixture();f.rt.leave();const e=f.env;e.dispatchEvent=()=>{};const sandbox={window:e,localStorage:{getItem:()=>null,setItem(){}},CustomEvent:function(){}};vm.createContext(sandbox);for(const file of ['assets/foundation-v31400/policy.js','assets/foundation-v31400/run.js'])vm.runInContext(fs.readFileSync(file,'utf8'),sandbox);const R=e.__HAPIL_RUN_V31400__;R.select({humanPlayers:1,humanHeroes:[],origin:'new'});f.b.phase='title';f.rt.attach({isHost:true,slotId:'p1',epoch:2,roster:f.p.roster});R.select({humanPlayers:4,humanHeroes:['seoha','neon','hunter'],origin:'network'});assert.equal(R.draft().humanPlayers,4);f.rt.leave();assert.equal(R.draft().humanPlayers,1);assert.equal(R.draft().origin,'new');assert.equal(R.get(f.b.state.current).humanPlayers,1);
});
test('host native title exit is ended only after observing a launched game',async()=>{
  const f=fixture();f.b.phase='title';assert.equal(f.rt.status().ended,false);await f.rt.start({isHost:true,roster:f.p.roster});assert.equal(f.rt.status().ended,false);assert.equal(f.rt.status().nativePaused,true);f.b.phase='game';assert.equal(f.rt.status().ended,false);f.b.phase='title';assert.equal(f.rt.status().ended,true);assert.equal(f.rt.status().paused,true);
});
test('failed local restore keeps authority disconnected and surfaces the storage error',()=>{
  const f=fixture();f.env.__HAPIL_COOP_STORAGE_RC222__={configure(){},leave:()=>({ok:false,reason:'restore-failed'})};assert.throws(()=>f.rt.leave(),/restore-failed/);assert.equal(f.rt.status().role,'disconnected');assert.equal(f.rt.withActor(f.world,f.actor,()=>{throw Error('must not run');}),false);
});
test('in-place friendly or reflected conversion assigns existing packet to the converting hero',()=>{
  const f=fixture(),q={id:1,sourceId:'boss',ownerId:'boss',heroId:'enemy-art',reflected:false,friendly:false};f.world.hostileProjectiles.push(q);f.rt.withActor(f.world,f.actor,()=>{q.reflected=true;});assert.equal(q.partySlotV31322,'p2');assert.equal(q.nativeActorRC222,true);assert.equal(q.heroId,'seoha');assert.equal(q.sourceHeroId,'seoha');assert.equal(q.impactHeroIdV31315,'seoha');assert.equal(q.sourceId,'boss');assert.equal(q.ownerId,'boss');
  const second={slotId:'p3',heroId:'neon',control:'remote',x:8,y:8,hp:200,maxHp:240};f.p.actors.push(second);f.rt.withActor(f.world,second,()=>{q.x=9;});assert.equal(q.partySlotV31322,'p2');assert.equal(q.heroId,'seoha');
  const friendly={id:2,sourceId:'boss',friendly:false};f.world.hostileProjectiles.push(friendly);f.rt.withActor(f.world,second,()=>{friendly.friendly=true;});assert.equal(friendly.partySlotV31322,'p3');assert.equal(friendly.heroId,'neon');
  f.rt.resolveOutgoing(f.world,q,view=>{view.resonance+=7;});assert.equal(f.actor.resonance,7);assert.equal(f.world.resonance,15);
});
test('native deflection and Dream wall reflection retain hostile allegiance',()=>{
  const source=fs.readFileSync('assets/index-v31526.js','utf8'),start=source.indexOf('function MONGSE_deflectHostileProjectile31211('),end=source.indexOf('\nfunction MONGSE_shouldSkillDelayProjectile31214(',start);let delayed=0;const sandbox={MONGSE_TEMPORAL_LAG_V31214:{fieldDuration:.5},MONGSE_delayHostileProjectile31214:(s,q,options)=>{delayed++;q.frozenUntil=s.time+options.duration;return true;}};vm.runInNewContext(source.slice(start,end),sandbox);const q={reflected:false,sourceId:'boss'},s={time:10};assert.equal(sandbox.MONGSE_deflectHostileProjectile31211(s,q),true);assert.equal(delayed,1);assert.equal(q.reflected,false);assert.equal(q.friendly,undefined);
  const reflect=source.slice(source.indexOf(' function reflect(s,p){'),source.indexOf(' const TRIAL_ZONES=',source.indexOf(' function reflect(s,p){')));assert.ok(reflect.includes('dreamReflectionCountV31346'));assert.ok(!/\.reflected\s*=|\.friendly\s*=/.test(reflect));
});
test('diagnostic input reasons distinguish authority slot and duplicate sequence without accepting them',()=>{
  const f=fixture();assert.equal(f.rt.input('p1',{seq:1,actions:['attack']}),false);assert.equal(f.rt.input('p2',{seq:1,actions:['attack']}),true);assert.equal(f.rt.input('p2',{seq:1,actions:['attack']}),false);f.rt.role('guest');assert.equal(f.rt.input('p2',{seq:2,actions:['attack']}),false);const t=f.rt.telemetry();assert.equal(t.inputAccepted,1);assert.equal(t.inputBySlot.p2.received,3);assert.equal(t.inputBySlot.p2.accepted,1);assert.equal(t.rejectionReasons['input-slot'],1);assert.equal(t.rejectionReasons['input-stale-sequence'],1);assert.equal(t.rejectionReasons['input-authority'],1);assert.equal(t.lastRejection.authority.role,'guest');
});
(async()=>{for(const [name,fn]of tests){await fn();process.stdout.write('ok '+name+'\n');}process.stdout.write(JSON.stringify({ok:true,suite:'rc222-runtime-unit',tests:tests.length})+'\n');})().catch(error=>{console.error(error);process.exitCode=1;});
