'use strict';
const assert=require('node:assert/strict');
let checks=0;
for(const method of ['equal','deepEqual','notEqual','ok']){
  const native=assert[method];
  assert[method]=function(...args){checks++;return native.apply(this,args);};
}
const bundleSource=require('node:fs').readFileSync(require('node:path').join(__dirname,'../assets/index-v31526.js'),'utf8');
const pauseLine=bundleSource.split('\n').find(line=>line.trim().startsWith('isPaused:'));
assert.ok(pauseLine,'native pause predicate is present in the production extension');
const pauseExpression=pauseLine.trim().slice('isPaused:'.length).replace(/,$/,'');
const nativePauseExpression=new Function('party','runtime','C','window','document','s',`return (${pauseExpression})(s);`);
const partyFixture={status:{paused:false}},runtimeFlags={paused:false};
const runtimeFixture={session:{isHost:false},status:()=>({paused:runtimeFlags.paused})};
let bindingBlocked=false,remoteUiOpen=false,storyOpen=false,deathPending=false,partyUiOpen=false,recordsOpen=false;
const controlsFixture={binding:{modal:{current:null},blocked:()=>bindingBlocked}};
const windowFixture={
  __HAPIL_READING_V31342__:{blocked:false},
  __HAPIL_REMOTE_UI_RC222__:{isOpen:()=>remoteUiOpen},
  __HAPIL_STORY_RC51__:{isOpen:()=>storyOpen},
  __HAPIL_SAMONG_RC91__:{deathPending:()=>deathPending},
  __HAPIL_PARTY_UI_V31322__:{isOpen:()=>partyUiOpen},
  __HAPIL_RECORDS_V31365__:{isOpen:()=>recordsOpen}
};
const documentFixture={hidden:false};
const nativePaused=s=>nativePauseExpression(()=>partyFixture,()=>runtimeFixture,controlsFixture,windowFixture,documentFixture,s);
const leftZone=require('../assets/rc223/left-zone.js');
const personaPath=require.resolve('../assets/rc134/persona-duel.js');
delete require.cache[personaPath];
require(personaPath);
const D=globalThis.__HAPIL_PERSONA_DUEL_RC134__;

assert.equal(leftZone.version,'RC223');
assert.equal(leftZone.policy.centerX,19);
assert.equal(leftZone.policy.clearance,.8);
assert.equal(leftZone.policy.graceSeconds,1);
assert.equal(leftZone.policy.intervalSeconds,1);
assert.equal(leftZone.policy.rawDamageFraction,.005);
assert.equal(leftZone.policy.outgoingMultiplier,.9);
assert.equal(leftZone.policy.movementMultiplier,.9);

// This is an actual RC134 physical floor point that its original team-side
// polygon rejects. Keep the committed geometry distinction under test.
const newlyOpenedPoint={x:15,y:14};
assert.equal(D.contains(newlyOpenedPoint,'all',.8),true);
assert.equal(D.contains(newlyOpenedPoint,'left',.8),false);

const physicalAll=(s,p,r)=>D.contains(p,'all',r);
const oldAllowed=(s,a,p,r)=>D.contains(p,D.swapped(s)||s?.swapped===true?'right':'left',r);
const hits=[],warnings=[],testPartyActors=new Set();
const controller=leftZone.createController({
  inScope:s=>s?.combat===true&&!s?.rest,
  isHost:s=>s?.role==='host',
  isPlayer:(s,a)=>a===s||a?.control==='remote'&&a?.rc222NativeActor===true||a?.control==='local'&&testPartyActors.has(a),
  nativeAll:physicalAll,
  originalAllowed:oldAllowed,
  applyDamage:(s,a,raw,source)=>{hits.push({actor:a,raw,source});a.hp=Math.max(0,a.hp-raw);return true;},
  onWarning:(s,a,payload)=>warnings.push({actor:a,payload})
});

const state={combat:true,rest:false,role:'host',zone:'dist01',time:0,hp:1000,maxHp:1000,
  x:newlyOpenedPoint.x,y:newlyOpenedPoint.y,swapped:false};
assert.equal(controller.allowed(state,state,newlyOpenedPoint),true);
assert.equal(controller.exposed(state,state,newlyOpenedPoint),true);
assert.deepEqual(controller.factors(state,state),{active:true,exposed:true,outgoing:.9,movement:.9,status:'left-zone'});
assert.equal(warnings.length,0,'candidate checks do not trigger entry warnings');

// Existing walkable floor remains walkable even where it lies at x >= 19.
const previouslyAllowedRight={x:22,y:24};
assert.equal(D.contains(previouslyAllowedRight,'left',.8),true);
assert.equal(controller.allowed(state,state,previouslyAllowedRight),true);
assert.equal(controller.exposed(state,state,previouslyAllowedRight),false);
state.x=previouslyAllowedRight.x;state.y=previouslyAllowedRight.y;
assert.deepEqual(controller.factors(state,state),{active:false,exposed:false,outgoing:1,movement:1,status:'clear'});
state.x=newlyOpenedPoint.x;state.y=newlyOpenedPoint.y;

// No extension outside the actual physical platform, and x=19 is not left.
assert.equal(controller.allowed(state,state,{x:0.5,y:14}),false);
assert.equal(controller.exposed(state,state,{x:0.5,y:14}),false);
assert.equal(controller.allowed(state,state,{x:19,y:15}),false);
assert.equal(controller.exposed(state,state,{x:19,y:15}),false);

// Swapped phase keeps its native old-side admission while the requested union
// is still limited to the native all-floor left-of-center region.
state.swapped=true;
const swappedAllowed={x:13,y:11.5};
assert.equal(D.contains(swappedAllowed,'right',.8),true);
assert.equal(controller.allowed(state,state,swappedAllowed),true,'persona swap-side oldAllowed is preserved');
assert.equal(controller.allowed(state,state,newlyOpenedPoint),true,'only the explicit new world-left region is added');
state.swapped=false;

// The DOT clock starts at the first observed actual exposure, not at a
// destination preview; damage begins after 1s grace plus its first 1s period.
state.time=0;state.hp=1000;
assert.equal(controller.tick(state,state,.25,1).due,false);
assert.equal(warnings.length,1);
assert.equal(controller.snapshot(state,state).elapsedSeconds,.25);
for(let i=2;i<=7;i++){state.time=i*.25;assert.equal(controller.tick(state,state,.25,i).due,false);}
state.time=2;assert.equal(controller.tick(state,state,.25,8).due,true);
assert.equal(hits.length,1);
assert.equal(hits[0].raw,5);
assert.equal(hits[0].source.leftZoneRC223,true);
assert.equal(controller.snapshot(state,state).ticks,1);

// Duplicate native hook calls in one state frame cannot double-advance or
// duplicate a tick. The actor clock is identity-scoped.
state.time=2.25;
assert.equal(controller.tick(state,state,.25,9).due,false);
assert.equal(controller.tick(state,state,.25,9).duplicate,true);
assert.equal(hits.length,1);

// Each remote player has its own exposure clock, but guest simulations never
// apply damage or derived multipliers.
const remote={id:'p2',slotId:'p2',control:'remote',rc222NativeActor:true,x:newlyOpenedPoint.x,y:newlyOpenedPoint.y,hp:800,maxHp:800};
assert.equal(controller.exposed(state,remote),true);
assert.equal(controller.tick(state,remote,.25,10).due,false);
assert.equal(controller.snapshot(state,remote).elapsedSeconds,.25);
const guest={...state,role:'guest'};
assert.equal(controller.allowed(guest,guest,newlyOpenedPoint),true,'guest coordinate guards preserve replicated geometry');
assert.equal(controller.canMove(guest,guest,newlyOpenedPoint),false,'guest cannot authorize new-floor input movement');
assert.equal(controller.allowed(guest,{id:'boss'},{x:22,y:24}),false,'player admission never bypasses NPC side guards');
assert.equal(controller.tick(guest,guest,1,1).reason,'inactive-or-nonauthoritative');
assert.equal(hits.length,1,'guest authority cannot apply a duplicate DOT');

// Leaving the zone clears clocks and debuffs immediately. Re-entry starts a
// fresh grace interval. Death, revive, map transition, checkpoint/session reset
// all use the same reset operation and do not serialize residue.
state.time=2.5;state.x=22;state.y=17;
assert.equal(controller.factors(state,state).outgoing,1);
assert.equal(controller.snapshot(state,state).elapsedSeconds,0);
state.x=newlyOpenedPoint.x;state.y=newlyOpenedPoint.y;state.time=3;
assert.equal(controller.tick(state,state,.25,11).due,false);
assert.equal(controller.snapshot(state,state).elapsedSeconds,.25);
assert.equal(controller.reset(state),true);
assert.equal(controller.snapshot(state,state).elapsedSeconds,0);
assert.equal(controller.factors({...state,rest:true},state).outgoing,1);
assert.equal(controller.factors({...state,combat:false},state).movement,1);
state.hp=0;assert.equal(controller.tick(state,state,.25,12).reason,'inactive-or-nonauthoritative');
state.hp=1000;assert.equal(controller.snapshot(state,state).ticks,0);

const metrics=controller.metrics();
assert.equal(metrics.entries>=2,true);
assert.equal(metrics.damageApplied,1);
assert.equal(metrics.duplicateFrames,1);
assert.equal(typeof metrics.authoritySkips,'number');

// Remote allies remain clocked when the canonical host actor is down. A
// backwards canonical clock indicates a restore and starts a fresh grace.
const downWorld={combat:true,rest:false,role:'host',zone:'dist01',time:12,hp:0,maxHp:1000,x:22,y:24};
const livingRemote={id:'p-down-host',slotId:'p-down-host',control:'remote',rc222NativeActor:true,x:15,y:14,hp:800,maxHp:800};
const downFirst=controller.tick(downWorld,livingRemote,.25,'down-host-1');
assert.equal(downFirst.active,true,'living remote exposure does not depend on host HP');
assert.equal(controller.snapshot(downWorld,livingRemote).owner,'host');
downWorld.time=12.25;controller.tick(downWorld,livingRemote,.25,'down-host-2');
downWorld.time=2;const rolledBack=controller.tick(downWorld,livingRemote,.25,'down-host-rollback');
assert.equal(rolledBack.due,false,'backwards simulation time clears elapsed exposure');
assert.equal(controller.snapshot(downWorld,livingRemote).elapsedSeconds,.25);

// A genuine re-entry starts a new grace and native damage source IDs never
// replay, even though the exposure clock and per-entry tick count restart.
const reentryHits=[];
const reentryController=leftZone.createController({
  inScope:s=>s?.combat===true,
  isHost:s=>s?.role==='host',
  isPlayer:(s,a)=>a===s,
  nativeAll:physicalAll,
  originalAllowed:oldAllowed,
  applyDamage:(s,a,raw,source)=>{reentryHits.push({raw,source});a.hp-=raw;return true;}
});
const reentry={combat:true,role:'host',zone:'dist01',time:0,hp:1000,maxHp:1000,x:15,y:14};
for(let i=0;i<=8;i++){reentry.time=i*.25;reentryController.tick(reentry,reentry,.25,`first-${i}`);}
assert.equal(reentryHits.length,1);
const firstDamageId=reentryHits[0].source.id;
reentry.x=22;reentry.y=24;reentry.time=2.25;reentryController.tick(reentry,reentry,.25,'exit');
assert.equal(reentryController.snapshot(reentry,reentry).elapsedSeconds,0);
reentry.hp=1000;reentry.x=15;reentry.y=14;
for(let i=0;i<7;i++){reentry.time=3+i*.25;reentryController.tick(reentry,reentry,.25,`second-${i}`);}
assert.equal(reentryHits.length,1,'re-entry grace prevents an immediate damage tick');
reentry.time=4.75;reentryController.tick(reentry,reentry,.25,'second-damage');
assert.equal(reentryHits.length,2);
assert.notEqual(reentryHits[1].source.id,firstDamageId,'damage event ids remain unique across clock resets');

// Pause sources extracted from the production hook freeze the host exposure
// clock without resetting grace or applying damage.
const pauseHits=[];
const pauseController=leftZone.createController({
  inScope:s=>s?.combat===true,isHost:s=>s?.role==='host',isPlayer:(s,a)=>a===s,
  isPaused:nativePaused,nativeAll:physicalAll,originalAllowed:oldAllowed,
  applyDamage:(s,a,raw,source)=>{pauseHits.push({raw,source});return true;}
});
const pauseState={combat:true,role:'host',zone:'dist01',time:0,hp:1000,maxHp:1000,x:15,y:14};
for(let i=0;i<6;i++){pauseState.time=i*.25;pauseController.tick(pauseState,pauseState,.25,`pause-pre-${i}`);}
assert.equal(pauseController.snapshot(pauseState,pauseState).elapsedSeconds,1.5);
const pauseCases=[
  ['string interlude modal',on=>controlsFixture.binding.modal.current=on?'interlude':null],
  ['binding blocked callback',on=>bindingBlocked=on],
  ['party pause',on=>partyFixture.status.paused=on],
  ['runtime pause',on=>runtimeFlags.paused=on],
  ['host remote UI',on=>{runtimeFixture.session.isHost=on;remoteUiOpen=on;}],
  ['story overlay',on=>storyOpen=on],
  ['death pending',on=>deathPending=on],
  ['finished practice pattern',on=>pauseState.practicePatternV31365={finished:on}],
  ['reading overlay',on=>windowFixture.__HAPIL_READING_V31342__.blocked=on],
  ['hidden document',on=>documentFixture.hidden=on],
  ['party UI',on=>partyUiOpen=on],
  ['records UI',on=>recordsOpen=on]
];
let pauseFrame=0;
for(const[name,setPaused]of pauseCases){
  setPaused(true);
  assert.equal(nativePaused(pauseState),true,`${name} is detected by the production native predicate`);
  for(let i=0;i<4;i++){pauseState.time+=.25;pauseController.tick(pauseState,pauseState,.25,`pause-${pauseFrame++}`);}
  assert.equal(pauseController.snapshot(pauseState,pauseState).elapsedSeconds,1.5,`${name} retains elapsed exposure`);
  setPaused(false);
}
assert.equal(pauseHits.length,0,'native pause sources never receive a left-zone tick');
pauseState.time+=.25;pauseController.tick(pauseState,pauseState,.25,'pause-resume-1');
pauseState.time+=.25;pauseController.tick(pauseState,pauseState,.25,'pause-resume-2');
assert.equal(pauseHits.length,1,'the existing grace clock continues after pause');

// Exercise the production RC138 property guard and movement adapter, not only
// the controller predicate. Physical floor and the old side remain intact.
const arenaPath=require.resolve('../assets/rc138/battle-arena.js');
delete require.cache[arenaPath];require(arenaPath);
const arena=globalThis.__HAPIL_BATTLE_ARENA_RC138__;
const controllerWorld=s=>globalThis.__HAPIL_REMOTE_RC222_RUNTIME__?.canonicalWorld?.(s)??s;
const controllerActor=a=>arena.actorIdentity(a);
globalThis.__HAPIL_LEFT_ZONE_NATIVE_RC223__={
  policy:leftZone.policy,
  allowed:(s,a,p,r)=>controller.allowed(controllerWorld(s),controllerActor(a),p,r),
  canMove:(s,a,p,r)=>controller.canMove(controllerWorld(s),controllerActor(a),p,r),
  regionAt:(s,a,p)=>controller.regionAt(controllerWorld(s),controllerActor(a),p),
  exposed:(s,a,p)=>{const actor=controllerActor(a);return controller.exposedAt(controllerWorld(s),actor,p??{x:actor?.x,y:actor?.y});},
  factors:(s,a)=>controller.factors(controllerWorld(s),controllerActor(a)),
  inspect:(s,a)=>controller.snapshot(controllerWorld(s),controllerActor(a))
};
arena.bind({combat:['dist01','cult04'],clear:()=>false});
const guarded={combat:true,role:'host',zone:'dist01',time:30,hp:1000,maxHp:1000,x:18,y:22,enemies:[]};
arena.enforce(guarded);
assert.equal(guarded.x,18);assert.equal(guarded.y,22);
const moved=arena.movement(guarded,guarded,newlyOpenedPoint,.8);
assert.ok(Math.abs(moved.x-(18+(15-18)*.9))<1e-9,'native RC138 movement applies the .9 factor on the real candidate');
assert.ok(Math.abs(moved.y-(22+(14-22)*.9))<1e-9);
guarded.x=15;guarded.y=14;
assert.deepEqual({x:guarded.x,y:guarded.y},newlyOpenedPoint,'native x/y property setters admit the exact newly opened floor');
assert.equal(D.contains(guarded,'all',.8),true);
assert.equal(D.contains(guarded,'left',.8),false);

// Evaluate the production RC138 `ft` wrapper with the real RC137 directional
// constraint. Its final requested endpoint must retain the 0.9 factor instead
// of restoring the original full step along a clear input ray.
const directionPath=require.resolve('../assets/rc137/direction-input.js');
delete require.cache[directionPath];require(directionPath);
const direction=globalThis.__HAPIL_DIRECTION_INPUT_RC137__;
direction.bind({project:(x,y)=>({x,y}),clearTarget:()=>{},resetDodge:()=>{},walkable:(s,p)=>D.contains(p,'all',.8)});
const heldRight=new Set(['ArrowRight']);
globalThis.__HAPIL_CONTROLS_V31329__={binding:{state:{current:guarded},input:{current:heldRight}}};
direction.acquire(guarded,heldRight);
const movementStart={x:guarded.x,y:guarded.y},movementDelta={x:.2,y:0};
const nativeWrapperStart=bundleSource.indexOf('ft=function(z,a,v,r=.45){',bundleSource.indexOf('/* RC138_NATIVE_ARENA:'));
const nativeWrapperEnd=bundleSource.indexOf('};\n  const portals',nativeWrapperStart);
assert.ok(nativeWrapperStart>=0&&nativeWrapperEnd>nativeWrapperStart,'production RC138 movement wrapper is available for the regression');
const nativeWrapperExpression=bundleSource.slice(nativeWrapperStart,nativeWrapperEnd+1).replace(/^ft=/,'');
const nativeMovementFor=actor=>new Function('move','state','R','window',`return (${nativeWrapperExpression});`)(
  (zone,subject,delta)=>({x:subject.x+delta.x,y:subject.y+delta.y}),()=>actor,arena,globalThis
);
const nativeMovement=nativeMovementFor(guarded);
const constrainedMovement=nativeMovement('dist01',guarded,movementDelta,.8);
assert.ok(Math.abs((constrainedMovement.x-movementStart.x)/movementDelta.x-.9)<1e-8,'production RC138 + real RC137 constrain preserves the 0.9 exposed movement rate');
assert.ok(Math.abs(constrainedMovement.y-movementStart.y)<1e-8);

// Cover the same actual native ft wrapper without directional-key ownership:
// mouse/target velocity must still receive one .9 factor, not .81.
const movementActor=(p)=>{
  const actor={combat:true,role:'host',zone:'dist01',time:31,hp:1000,maxHp:1000,x:p.x,y:p.y,enemies:[]};
  arena.enforce(actor);
  assert.equal(D.contains(actor,'all',.8),true,'movement fixture begins on the physical floor');
  return actor;
};
const runMovement=(actor,delta,keys)=>{
  globalThis.__HAPIL_CONTROLS_V31329__={binding:{state:{current:actor},input:{current:keys}}};
  direction.acquire(actor,keys);
  return nativeMovementFor(actor)('dist01',actor,delta,.8);
};
const factorRatio=(start,end,delta)=>{
  const length=Math.hypot(delta.x,delta.y);
  return Math.hypot(end.x-start.x,end.y-start.y)/length;
};
const noHeldKeys=new Set();
const mouseDangerStart={...newlyOpenedPoint},mouseDangerDelta={x:.2,y:0};
const mouseDangerActor=movementActor(mouseDangerStart);
assert.equal(controller.exposed(mouseDangerActor,mouseDangerActor),true);
const mouseDangerEnd=runMovement(mouseDangerActor,mouseDangerDelta,noHeldKeys);
assert.ok(Math.abs(factorRatio(mouseDangerStart,mouseDangerEnd,mouseDangerDelta)-.9)<1e-8,
  'no-held mouse/target movement in the new area receives exactly one .9 factor');

// The first step entering the newly opened polygon slows, even though the
// actor started on previously allowed floor. It must not be slowed twice by
// RC138 plus the direction constraint.
const entryStart={x:18,y:19.5},entryDelta={x:0,y:-.2};
const entryActor=movementActor(entryStart);
assert.equal(D.contains(entryStart,'left',.8),true,'entry starts in the original allowed polygon');
assert.equal(controller.regionAt(entryActor,entryActor,{x:entryStart.x+entryDelta.x,y:entryStart.y+entryDelta.y}),true,
  'entry endpoint is in the exact new polygon');
const entryEnd=runMovement(entryActor,entryDelta,new Set(['ArrowUp']));
assert.ok(Math.abs(factorRatio(entryStart,entryEnd,entryDelta)-.9)<1e-8,
  'the entry step receives exactly one .9 factor');
assert.equal(controller.exposed(entryActor,entryActor,entryEnd),true);

// While leaving, the step that starts exposed still receives one .9 factor;
// the following step on old floor returns immediately to native speed.
const exitStart={x:18,y:19.3},exitDelta={x:0,y:.2};
const exitActor=movementActor(exitStart);
assert.equal(controller.exposed(exitActor,exitActor),true);
const exitEnd=runMovement(exitActor,exitDelta,new Set(['ArrowDown']));
assert.ok(Math.abs(factorRatio(exitStart,exitEnd,exitDelta)-.9)<1e-8,
  'the step leaving the new polygon receives exactly one .9 factor');
assert.equal(D.contains(exitEnd,'left',.8),true,'the exit step ends back in previously allowed floor');
const afterExitActor=movementActor(exitEnd);
const afterExitEnd=runMovement(afterExitActor,exitDelta,new Set(['ArrowDown']));
assert.ok(Math.abs(factorRatio(exitEnd,afterExitEnd,exitDelta)-1)<1e-8,
  'movement returns to full native speed immediately after leaving the new polygon');

// Existing allowed floor is never slowed, both on the opposite side and in
// the world-left portion of the original polygon.
for(const [safeStart,safeDelta,safeKeys] of [[{x:22,y:24},{x:.2,y:0},new Set(['ArrowRight'])],[exitEnd,{x:0,y:.2},new Set(['ArrowDown'])]]){
  const safeActor=movementActor(safeStart);
  assert.equal(D.contains(safeStart,'left',.8),true,'old-floor speed fixture remains in the original allowed set');
  const safeEnd=runMovement(safeActor,safeDelta,safeKeys);
  assert.ok(Math.abs(factorRatio(safeStart,safeEnd,safeDelta)-1)<1e-8,
    'previously allowed floor keeps full native movement speed');
}

// At the physical outside edge, the held ray stops at the original all-floor
// boundary. Slowdown cannot push the actor beyond the physical platform.
const edgeStart={x:17.8,y:8.1},edgeDelta={x:0,y:-.8};
const edgeActor=movementActor(edgeStart);
assert.equal(controller.exposed(edgeActor,edgeActor),true,'outer-edge fixture is in the newly opened portion');
const edgeEnd=runMovement(edgeActor,edgeDelta,new Set(['ArrowUp']));
assert.equal(D.contains(edgeEnd,'all',.8),true,'edge collision keeps the endpoint on native physical floor');
assert.ok(edgeEnd.y>=7.6-1e-6,'edge collision never crosses the native platform boundary');
assert.ok(Math.abs(edgeEnd.x-edgeStart.x)<1e-8,'edge collision does not project sideways');
assert.ok(factorRatio(edgeStart,edgeEnd,edgeDelta)<=.9+1e-8,'edge collision never exceeds the slowed requested distance');
assert.ok(factorRatio(edgeStart,edgeEnd,edgeDelta)>.4,'edge collision advances to the first physical obstruction');

// Use the real RC222 runtime proxy and its actorFor resolver. Native context
// proxies route owned coordinates/HP to the actor and world fields elsewhere;
// controller identity and clocks must still belong to the real party actor.
const {createRuntime}=require('../assets/rc222/runtime.js');
const proxyWorld={combat:true,role:'host',zone:'dist01',time:60,hp:1000,maxHp:1000,x:22,y:24,activeHeroId:'hwando',enemies:[],
  effects:[],hostileProjectiles:[],pendingHits:[],impactQueue:[],floatTexts:[],egoDrops:[],defeated:[],pendingStrikes:[],resonanceThreads:[],telekineticCasts:[]};
const proxyActor={slotId:'proxy-p2',heroId:'seoha',control:'remote',x:18,y:19.5,hp:900,maxHp:1000};
const survivorActor={slotId:'proxy-p3',heroId:'neon',control:'remote',x:15,y:14,hp:850,maxHp:1000};
const proxyRoster=[{slotId:'p1',heroId:'hwando',control:'host'},{slotId:proxyActor.slotId,heroId:proxyActor.heroId,control:'remote'},{slotId:survivorActor.slotId,heroId:survivorActor.heroId,control:'remote'}];
const proxyBinding={phase:'game',state:{current:proxyWorld},hero:{current:'hwando'},input:{current:new Set()},settings:{current:{}},auto:{current:false},passives:{current:{}},shards:{current:0},partyIds:{current:[]},actions:{}};
const proxyControls={binding:proxyBinding,choice:()=> 'manual'};
const proxyParty={state:proxyWorld,actors:[proxyActor,survivorActor],roster:proxyRoster,status:{role:'host'},
  replaceWorldOnConfigure:null,
  configure({roster}){const prior=new Map(this.actors.map(actor=>[actor.slotId,actor]));this.roster=roster;this.actors=roster.slice(1).map(row=>{let actor=prior.get(row.slotId);if(!actor||actor.heroId!==row.heroId)actor={slotId:row.slotId,heroId:row.heroId,x:15,y:14,hp:850,maxHp:1000};actor.control=row.control;return actor;});if(this.replaceWorldOnConfigure){this.state=this.replaceWorldOnConfigure;proxyBinding.state.current=this.state;this.replaceWorldOnConfigure=null;}},
  setNetworkRole(){},leave(){}};
const proxyEnv={performance:{now:()=>100},addEventListener(){},document:{hidden:false},__HAPIL_PARTY_V31322__:proxyParty,
  __HAPIL_CONTROLS_V31329__:proxyControls,__HAPIL_RC222_NATIVE__:{createState:()=>({cooldowns:{}})}};
const proxyRuntime=createRuntime(proxyEnv);
proxyEnv.__HAPIL_REMOTE_RC222_RUNTIME__=proxyRuntime;
const priorRuntime=globalThis.__HAPIL_REMOTE_RC222_RUNTIME__,priorParty=globalThis.__HAPIL_PARTY_V31322__,priorControls=globalThis.__HAPIL_CONTROLS_V31329__;
globalThis.__HAPIL_REMOTE_RC222_RUNTIME__=proxyRuntime;globalThis.__HAPIL_PARTY_V31322__=proxyParty;globalThis.__HAPIL_CONTROLS_V31329__=proxyControls;
proxyRuntime.attach({isHost:true,slotId:'p1',epoch:1,session:{sessionId:'left-zone-proxy-unit'},roster:proxyRoster});
arena.enforce(proxyWorld);
const localP2={slotId:'proxy-local-p2',heroId:'seoha',control:'local',x:18,y:19.5,hp:900,maxHp:1000};
testPartyActors.add(localP2);
proxyParty.actors.push(localP2);
assert.equal(arena.player(proxyWorld,localP2),true,'an existing native local P2 actor is admitted as a human player');
assert.equal(arena.isAlly(proxyWorld,localP2),true,'local P2 keeps the native allied geometry path');
const localMoved=arena.movement(proxyWorld,localP2,{x:18,y:19.3},.8);
assert.ok(Math.abs(localMoved.x-18)<1e-8&&Math.abs(localMoved.y-19.32)<1e-8,'native local P2 movement receives the same .9 factor in new floor');
localP2.control='ai';
assert.equal(arena.player(proxyWorld,localP2),false,'a local actor demoted to AI is no longer exposed as a player');
localP2.control='local';proxyParty.actors.pop();testPartyActors.delete(localP2);
const staleAi={slotId:'proxy-ai',heroId:'neon',control:'ai',rc222NativeActor:true,x:18,y:19.3,hp:800,maxHp:800};
proxyParty.actors.push(staleAi);
const aiProxyResult=proxyRuntime.withActor(proxyWorld,staleAi,view=>{assert.equal(arena.player(view,view),false,'AI proxy is rejected even when its actor context carries the stale native marker');return true;});
assert.equal(aiProxyResult,true,'actual RC222 actor context can exercise stale AI identity');
const nativeMovementForCurrent=()=>new Function('move','state','R','window',`return (${nativeWrapperExpression});`)(
  (zone,subject,delta)=>({x:subject.x+delta.x,y:subject.y+delta.y}),
  ()=>globalThis.__HAPIL_CONTROLS_V31329__.binding.state.current,arena,globalThis
);
let actualProxyView=null;
proxyRuntime.withActor(proxyWorld,proxyActor,view=>{
  actualProxyView=view;
  assert.notEqual(view,proxyActor,'RC222 supplies a transient proxy distinct from the actor object');
  assert.equal(proxyRuntime.actorFor(view),proxyActor,'real RC222 actorFor recovers the underlying slot actor');
  assert.equal(arena.actorIdentity(view),proxyActor,'RC138 uses real actor identity for proxy admission');
  assert.equal(arena.player(proxyWorld,view),true,'remote actor proxy remains a playable actor');
  assert.equal(arena.isAlly(proxyWorld,view),true,'remote actor proxy retains allied arena geometry');
  assert.equal(arena.player(proxyWorld,staleAi),false,'stale RC222 marker cannot promote an AI actor to player');
  assert.equal(globalThis.__HAPIL_LEFT_ZONE_NATIVE_RC223__.allowed(view,view,{x:18,y:19.3},.8),true,
    'native left-zone admission resolves a real RC222 proxy');
  assert.equal(globalThis.__HAPIL_LEFT_ZONE_NATIVE_RC223__.canMove(view,view,{x:18,y:19.3},.8),true,
    'native left-zone movement admission resolves a real RC222 proxy');
  assert.equal(globalThis.__HAPIL_LEFT_ZONE_NATIVE_RC223__.regionAt(view,view,{x:18,y:19.3}),true,
    'native danger-region query resolves a real RC222 proxy');
  assert.equal(globalThis.__HAPIL_LEFT_ZONE_NATIVE_RC223__.exposed(view,view,{x:18,y:19.3}),true,
    'native exposure query resolves a real RC222 proxy');
  const delta={x:0,y:-.2};direction.acquire(view,new Set(['ArrowUp']));
  const proxyEnd=nativeMovementForCurrent()('dist01',view,delta,.8);
  assert.ok(Math.abs(proxyEnd.x-18)<1e-8&&Math.abs(proxyEnd.y-19.32)<1e-8,
    'real withActor proxy movement enters danger at exactly native speed times .9');
  proxyActor.x=proxyEnd.x;proxyActor.y=proxyEnd.y;
  controller.tick(proxyWorld,proxyActor,.25,'proxy-actor-frame-1');
  assert.equal(controller.snapshot(proxyWorld,proxyActor).elapsedSeconds,.25,'remote clock remains keyed by real actor identity');
  assert.equal(controller.snapshot(proxyWorld,proxyWorld).elapsedSeconds,0,'remote clock does not alias the canonical host actor');
  assert.equal(controller.snapshot(proxyWorld,view).elapsedSeconds,0,'controller WeakMap does not store elapsed time under the transient proxy');
  assert.equal(globalThis.__HAPIL_LEFT_ZONE_NATIVE_RC223__.inspect(view,view).elapsedSeconds,.25,
    'read-only surface resolves the proxy back to its actor clock');
  assert.equal(globalThis.__HAPIL_LEFT_ZONE_NATIVE_RC223__.factors(view,view).active,true,
    'derived exposure factors resolve the actual remote actor');
});
assert.equal(proxyRuntime.actorFor(actualProxyView),proxyActor,'RC222 proxy remains slot-resolvable after its callback');
proxyRuntime.withActor(proxyWorld,survivorActor,()=>{survivorActor.x=15;survivorActor.y=14;});
controller.tick(proxyWorld,survivorActor,.25,'survivor-before-roster-refresh');
const updateRoomHookStart=bundleSource.indexOf('if(rt?.updateRoom){const updateRoom=rt.updateRoom;');
const updateRoomHookEnd=bundleSource.indexOf('\n  const surface=',updateRoomHookStart);
assert.ok(updateRoomHookStart>=0&&updateRoomHookEnd>updateRoomHookStart,'production RC223 updateRoom lifecycle hook is available');
const updateRoomHook=bundleSource.slice(updateRoomHookStart,updateRoomHookEnd);
const lifecycleFnStart=bundleSource.indexOf('function cleanupActorClocks(');
const lifecycleFnEnd=bundleSource.indexOf('\n  if(P?.tick)',lifecycleFnStart);
const lifecycleFnSource=bundleSource.slice(lifecycleFnStart,lifecycleFnEnd);
const cleanupProxyClocks=new Function('controller',lifecycleFnSource+';return cleanupActorClocks;')(controller);
new Function('rt','party','controller','liveWorld','worldOf','cleanupActorClocks',`${updateRoomHook};return rt;`)(
  proxyRuntime,()=>proxyParty,controller,()=>proxyBinding.state.current,s=>proxyRuntime.canonicalWorld(s)??s,cleanupProxyClocks
);
const rosterRow=(slotId,heroId,name,kind='remote')=>({slotId,heroId,nickname:name,kind});
const hostRow=rosterRow('p1','hwando','Host');
const survivorRow=rosterRow(survivorActor.slotId,survivorActor.heroId,'Survivor');
const exitsBeforeMetadata=controller.metrics().exits;
proxyRuntime.updateRoom({roster:[hostRow,rosterRow(proxyActor.slotId,proxyActor.heroId,'Renamed peer'),{...survivorRow,nickname:'Ready survivor'}]});
assert.equal(controller.metrics().exits,exitsBeforeMetadata,'same-room metadata refresh retains all actor clocks');
assert.equal(controller.snapshot(proxyWorld,proxyActor).elapsedSeconds,.25,'renamed surviving actor keeps its clock');
assert.equal(controller.snapshot(proxyWorld,survivorActor).elapsedSeconds,.25,'ready surviving actor keeps its clock');
const exitsBeforeRemoval=controller.metrics().exits;
proxyRuntime.updateRoom({roster:[hostRow,survivorRow]});
assert.equal(proxyParty.actors.includes(proxyActor),false,'same-room roster removal drops the departed actor reference');
assert.equal(controller.snapshot(proxyWorld,proxyActor).elapsedSeconds,0,'departed actor clock is reset immediately');
assert.equal(controller.snapshot(proxyWorld,survivorActor).elapsedSeconds,.25,'surviving actor clock survives another member leaving');
assert.equal(controller.metrics().exits,exitsBeforeRemoval+1,'roster removal releases exactly the departed exposure clock');
proxyRuntime.updateRoom({roster:[hostRow,survivorRow,rosterRow(proxyActor.slotId,proxyActor.heroId,'Rejoined peer')]});
const rejoinedActor=proxyParty.actors.find(actor=>actor.slotId===proxyActor.slotId);
assert.ok(rejoinedActor&&rejoinedActor!==proxyActor,'same-slot rejoin receives a fresh actor object');
proxyRuntime.withActor(proxyWorld,rejoinedActor,view=>{
  assert.equal(globalThis.__HAPIL_LEFT_ZONE_NATIVE_RC223__.inspect(view,view).elapsedSeconds,0,
    'same-slot rejoin begins without the departed actor clock');
  controller.tick(proxyWorld,rejoinedActor,.25,'same-slot-rejoin-first-frame');
  assert.equal(globalThis.__HAPIL_LEFT_ZONE_NATIVE_RC223__.inspect(view,view).elapsedSeconds,.25,
    'same-slot rejoin starts an independent new exposure clock');
});
const exitsBeforeDowngrade=controller.metrics().exits;
proxyRuntime.updateRoom({roster:[hostRow,{...survivorRow,kind:'ai'},rosterRow(proxyActor.slotId,proxyActor.heroId,'Rejoined peer')]});
assert.equal(survivorActor.control,'ai','roster transition demotes the existing actor in place');
assert.equal(arena.player(proxyWorld,survivorActor),false,'demoted actor no longer qualifies as a player');
assert.equal(controller.snapshot(proxyWorld,survivorActor).elapsedSeconds,0,'human-to-AI demotion releases its old exposure clock');
assert.equal(controller.snapshot(proxyWorld,rejoinedActor).elapsedSeconds,.25,'other human clock survives AI demotion');
assert.equal(controller.metrics().exits,exitsBeforeDowngrade+1,'control demotion releases only its actor clock');
const replacedWorld={...proxyWorld,time:70,x:22,y:24,enemies:[],effects:[],hostileProjectiles:[],pendingHits:[],impactQueue:[],floatTexts:[],egoDrops:[],defeated:[],pendingStrikes:[],resonanceThreads:[],telekineticCasts:[]};
proxyParty.replaceWorldOnConfigure=replacedWorld;
proxyRuntime.updateRoom({roster:[hostRow,{...survivorRow,nickname:'World replacement refresh'},rosterRow(proxyActor.slotId,proxyActor.heroId,'Rejoined peer')]});
assert.equal(controller.snapshot(proxyWorld,rejoinedActor).elapsedSeconds,0,'world replacement releases the previous world clock set');
assert.equal(controller.snapshot(replacedWorld,rejoinedActor).elapsedSeconds,0,'new world starts with no inherited actor clock');
if(priorRuntime===undefined)delete globalThis.__HAPIL_REMOTE_RC222_RUNTIME__;else globalThis.__HAPIL_REMOTE_RC222_RUNTIME__=priorRuntime;
if(priorParty===undefined)delete globalThis.__HAPIL_PARTY_V31322__;else globalThis.__HAPIL_PARTY_V31322__=priorParty;
if(priorControls===undefined)delete globalThis.__HAPIL_CONTROLS_V31329__;else globalThis.__HAPIL_CONTROLS_V31329__=priorControls;
assert.ok(bundleSource.includes('actorOf=a=>arena()?.actorIdentity?.(a)'),
  'production RC223 surface normalizes proxy identity before controller lookups');

// Run the production PARTY.tick wrapper and actual RC223 tick helper with a
// native-shaped fixture. Local actors tick after native movement; the wrapper
// does not double-count remote actors or AI.
const rc223Start=bundleSource.indexOf('/* RC223_LEFT_ZONE_NATIVE:');
const cleanupStart=bundleSource.indexOf('function cleanupActorClocks(',rc223Start);
const cleanupEnd=bundleSource.indexOf('\n  if(P?.tick)',cleanupStart);
const localTickHelperStart=bundleSource.indexOf('function tick(s,a,dt){',rc223Start);
const localTickHelperEnd=bundleSource.indexOf('\n  function showForLocalOrGuest(s)',localTickHelperStart);
const localPartyHookStart=bundleSource.indexOf('if(P?.tick){const partyTick=P.tick;',cleanupEnd);
const localPartyHookEnd=bundleSource.indexOf('\n  const outgoingActor=',localPartyHookStart);
assert.ok(cleanupStart>=0&&cleanupEnd>cleanupStart&&localTickHelperStart>=0&&localTickHelperEnd>localTickHelperStart&&localPartyHookStart>=0&&localPartyHookEnd>localPartyHookStart,
  'actual native local PARTY tick and clock-cleanup snippets are available');
const cleanupSource=bundleSource.slice(cleanupStart,cleanupEnd);
const localTickHelperSource=bundleSource.slice(localTickHelperStart,localTickHelperEnd);
const localWorld={combat:true,role:'offline',zone:'dist01',time:0,hp:1000,maxHp:1000,x:22,y:24,enemies:[]};
const tickLocalP2={slotId:'local-p2',control:'local',hp:1000,maxHp:1000,x:15,y:14};
const remotePartyActor={slotId:'remote-p2',control:'remote',rc222NativeActor:true,hp:1000,maxHp:1000,x:15,y:14};
const aiPartyActor={slotId:'ai-p3',control:'ai',rc222NativeActor:true,hp:1000,maxHp:1000,x:15,y:14};
const nativeLocalMembers=new Set([tickLocalP2,remotePartyActor,aiPartyActor]),localHits=[],localTickTrace=[];
const localController=leftZone.createController({
  inScope:s=>s?.combat===true,isHost:s=>s?.role==='host'||s?.role==='offline',
  isPlayer:(s,a)=>a===s||a?.control==='remote'&&a?.rc222NativeActor===true&&nativeLocalMembers.has(a)||a?.control==='local'&&nativeLocalMembers.has(a),
  isPaused:nativePaused,nativeAll:physicalAll,originalAllowed:oldAllowed,
  applyDamage:(s,a,raw,source)=>{localHits.push({actor:a,raw,source});a.hp=Math.max(0,a.hp-raw);return true;}
});
const cleanupActorClocks=new Function('controller',cleanupSource+';return cleanupActorClocks;')(localController);
const tracedLocalController=Object.create(localController);
Object.defineProperty(tracedLocalController,'tick',{value:(s,a,dt,key)=>{localTickTrace.push({s,a,dt,key});return localController.tick(s,a,dt,key);}});
const localTickHelper=new Function('worldOf','controller','showForLocalOrGuest',localTickHelperSource+';return tick;')(s=>s,tracedLocalController,()=>{});
const nativeParty={state:localWorld,actors:[tickLocalP2,remotePartyActor,aiPartyActor],status:{role:'offline'},nativeFrames:0,nativeArgs:null,
  tick(s,dt,...args){this.nativeFrames++;this.nativeArgs=[s,dt,...args];return 'native-party-result';},
  checkpointRespawned(){this.actors=this.actors.map(actor=>actor===this.testLocal?this.checkpointLocal:actor);return true;},
  endFrame(){this.actors=this.actors.map(actor=>actor===this.testLocal?this.endLocal:actor);return true;},
  applySnapshot(){this.actors=this.actors.map(actor=>actor===this.testLocal?this.snapshotLocal:actor);return 'native-snapshot-result';}};
nativeParty.testLocal=tickLocalP2;
assert.ok(localPartyHookStart>=0&&localPartyHookEnd>localPartyHookStart,'actual native PARTY tick and actor-rebuild wrappers are extractable');
const localPartyHook=bundleSource.slice(localPartyHookStart,localPartyHookEnd);
new Function('P','worldOf','tick','cleanupActorClocks','liveWorld',localPartyHook+';return P.tick;')(nativeParty,s=>s,localTickHelper,cleanupActorClocks,()=>localWorld);
for(let i=0;i<8;i++){
  localWorld.time=(i+1)*.25;
  assert.equal(nativeParty.tick(localWorld,.25,'native-hero-dt',.25),'native-party-result','the PARTY wrapper returns native result');
}
assert.equal(nativeParty.nativeFrames,8,'the original PARTY.tick runs exactly once per invocation');
assert.deepEqual(nativeParty.nativeArgs,[localWorld,.25,'native-hero-dt',.25],'the native PARTY.tick arguments are preserved');
assert.equal(localTickTrace.length,8,'the local actor is ticked once on each native party frame');
assert.ok(localTickTrace.every((row,i)=>row.a===tickLocalP2&&row.dt===.25&&row.key===`dist01:${(i+1)*.25}:local-p2`),'local clock uses actual actor and native zone/time/slot frame key');
assert.equal(localHits.length,1,'local P2 receives one finite native DOT tick after the 2 second grace-plus-interval');
assert.equal(localHits[0].actor,tickLocalP2,'native local DOT owner is P2, not the canonical world');
assert.equal(localHits[0].raw,5,'local DOT raw damage remains 0.5 percent of max HP');
assert.equal(localController.snapshot(localWorld,localWorld).elapsedSeconds,0,'local P2 clock does not alias host clock');
const duplicateBefore=localController.metrics().duplicateFrames;
nativeParty.tick(localWorld,.25,'duplicate-native-frame',.25);
assert.equal(localController.metrics().duplicateFrames,duplicateBefore+1,'same native time does not accrue a duplicate local frame');
assert.equal(localController.snapshot(localWorld,tickLocalP2).elapsedSeconds,2,'duplicate native PARTY frame leaves local elapsed time unchanged');
partyFixture.status.paused=true;
nativeParty.tick(localWorld,.25,'paused-native-frame',.25);
assert.equal(localController.snapshot(localWorld,tickLocalP2).elapsedSeconds,2,'native local PARTY tick honors pause without resetting the clock');
partyFixture.status.paused=false;
const exitsBeforeLocalDeath=localController.metrics().exits;
tickLocalP2.hp=0;localWorld.time+=.25;nativeParty.tick(localWorld,.25,'local-death-frame',.25);
assert.equal(localController.metrics().exits,exitsBeforeLocalDeath+1,'native local tick resets the actor clock on death before any readout');
tickLocalP2.hp=1000;localWorld.time+=.25;nativeParty.tick(localWorld,.25,'local-revive-frame',.25);
assert.equal(localController.snapshot(localWorld,tickLocalP2).elapsedSeconds,.25,'a revived local actor begins a fresh exposure clock');
const exitsBeforeCheckpoint=localController.metrics().exits;
nativeParty.checkpointLocal={slotId:'local-p2',control:'local',hp:1000,maxHp:1000,x:15,y:14};
nativeLocalMembers.add(nativeParty.checkpointLocal);
nativeParty.checkpointRespawned(localWorld);
assert.equal(localController.metrics().exits,exitsBeforeCheckpoint+1,'checkpoint actor replacement releases the previous local clock');
assert.equal(localController.snapshot(localWorld,nativeParty.checkpointLocal).elapsedSeconds,0,'checkpoint local actor replacement starts without a prior clock');
nativeParty.testLocal=nativeParty.checkpointLocal;localWorld.time+=.25;
nativeParty.tick(localWorld,.25,'checkpoint-first-frame',.25);
assert.equal(localController.snapshot(localWorld,nativeParty.checkpointLocal).elapsedSeconds,.25,'replacement local actor receives a fresh native frame clock');
const exitsBeforeEndFrame=localController.metrics().exits;
nativeParty.endLocal={slotId:'local-p2',control:'local',hp:1000,maxHp:1000,x:15,y:14};
nativeLocalMembers.add(nativeParty.endLocal);
nativeParty.endFrame(localWorld);
assert.equal(localController.metrics().exits,exitsBeforeEndFrame+1,'endFrame roster rebuild releases the replaced local clock');
nativeParty.testLocal=nativeParty.endLocal;localWorld.time+=.25;
nativeParty.tick(localWorld,.25,'endFrame-first-frame',.25);
assert.equal(localController.snapshot(localWorld,nativeParty.endLocal).elapsedSeconds,.25,'endFrame replacement actor starts a fresh native clock');
nativeParty.snapshotLocal={slotId:'local-p2',control:'local',hp:1000,maxHp:1000,x:15,y:14};
nativeLocalMembers.add(nativeParty.snapshotLocal);
const exitsBeforeSnapshot=localController.metrics().exits;
assert.equal(nativeParty.applySnapshot({world:{fields:[]}}),'native-snapshot-result','the PARTY.applySnapshot wrapper preserves the native result');
assert.equal(localController.metrics().exits,exitsBeforeSnapshot+1,'native snapshot actor replacement immediately releases the old local clock');
assert.equal(localController.snapshot(localWorld,nativeParty.snapshotLocal).elapsedSeconds,0,'snapshot-rebuilt local actor starts without an inherited clock');

// The production outgoing selector resolves the scoped actor first. An AI
// source gets a neutral factor and never inherits the host actor penalty.
const outgoingActorStart=bundleSource.indexOf('const outgoingActor=(world=liveWorld())=>',rc223Start);
const outgoingActorEnd=bundleSource.indexOf('\n  const outgoing=',outgoingActorStart);
const outgoingHookStart=outgoingActorEnd+1;
const outgoingHookEnd=bundleSource.indexOf('\n  const rt=',outgoingHookStart);
assert.ok(outgoingActorStart>=0&&outgoingActorEnd>outgoingActorStart&&outgoingHookEnd>outgoingHookStart,'actual native outgoing actor and multiplier hooks are extractable');
const outgoingActorSource=bundleSource.slice(outgoingActorStart,outgoingActorEnd);
const outgoingHookSource=bundleSource.slice(outgoingHookStart,outgoingHookEnd);
const outgoingWorld={combat:true,role:'offline',zone:'dist01',time:90,hp:1000,maxHp:1000,x:15,y:14,enemies:[]};
tickLocalP2.x=15;tickLocalP2.y=14;tickLocalP2.hp=1000;
const safeRemote={slotId:'safe-remote',control:'remote',rc222NativeActor:true,hp:1000,maxHp:1000,x:22,y:24};
const aiSource={slotId:'ai-source',control:'ai',rc222NativeActor:true,hp:1000,maxHp:1000,x:22,y:24};
nativeLocalMembers.add(safeRemote);nativeLocalMembers.add(aiSource);
const outgoingParty={outgoingActor:null},outgoingRuntime={activeActor:null};
const outgoingResolver=new Function('actorOf','runtime','P','liveWorld',outgoingActorSource+';return outgoingActor;')(a=>a,()=>outgoingRuntime,outgoingParty,()=>outgoingWorld);
const nativeOutgoing=new Function('MONGSE_heroOutgoingModeMultiplier31213','liveWorld','runtime','party','actorOf','controller','outgoingActor',outgoingHookSource+';return MONGSE_heroOutgoingModeMultiplier31213;')(()=>1,()=>outgoingWorld,()=>outgoingRuntime,()=>outgoingParty,a=>a,localController,outgoingResolver);
outgoingParty.outgoingActor=tickLocalP2;
assert.equal(nativeOutgoing('seoha',false),.9,'scoped local PARTY.outgoingActor receives the active outgoing penalty');
outgoingParty.outgoingActor=aiSource;
assert.equal(nativeOutgoing('neon',false),1,'an AI outgoing source gets neutral factor instead of borrowing host penalty');
outgoingParty.outgoingActor=tickLocalP2;outgoingRuntime.activeActor=safeRemote;
assert.equal(outgoingResolver(outgoingWorld),safeRemote,'active remote actor takes precedence over a local scoped actor');
assert.equal(nativeOutgoing('seoha',false),1,'remote active actor factor is evaluated on its own position');
outgoingRuntime.activeActor=null;outgoingParty.outgoingActor=null;
assert.equal(outgoingResolver(outgoingWorld),outgoingWorld,'native outgoing selector falls back to world when no actor is scoped');
assert.equal(nativeOutgoing('hwando',false),.9,'world-host outgoing penalty remains available for host attacks');

// PARTY.configure catches offline actor removal/demotion while preserving
// metadata refresh clocks for actors that remain in the roster.
const configureStart=bundleSource.indexOf('if(P?.configure){',localPartyHookEnd);
const configureEnd=bundleSource.indexOf('\n  if(rt?.updateRoom)',configureStart);
assert.ok(configureStart>=0&&configureEnd>configureStart,'actual native PARTY.configure lifecycle wrapper is extractable');
const configureSource=bundleSource.slice(configureStart,configureEnd);
const configureWorld={combat:true,role:'offline',zone:'dist01',time:100,hp:1000,maxHp:1000,x:22,y:24,enemies:[]};
const departingLocal={slotId:'departing-local',control:'local',hp:1000,maxHp:1000,x:15,y:14};
const survivingLocal={slotId:'surviving-local',control:'local',hp:1000,maxHp:1000,x:15,y:14};
nativeLocalMembers.add(departingLocal);nativeLocalMembers.add(survivingLocal);
const configureParty={state:configureWorld,actors:[departingLocal,survivingLocal],configure({actors=this.actors,world,demote=[]}={}){this.actors=actors;if(world)this.state=world;for(const actor of demote)actor.control='ai';}};
new Function('P','party','worldOf','liveWorld','controller',cleanupSource+';'+configureSource+';return P.configure;')(configureParty,()=>configureParty,s=>s,()=>configureParty.state,localController);
localController.tick(configureWorld,departingLocal,.25,'configure-departing-frame');
localController.tick(configureWorld,survivingLocal,.25,'configure-survivor-frame');
const configureExitsBeforeRefresh=localController.metrics().exits;
configureParty.configure({actors:[departingLocal,survivingLocal]});
assert.equal(localController.metrics().exits,configureExitsBeforeRefresh,'offline configure metadata refresh preserves surviving actor clocks');
const configureExitsBeforeLeave=localController.metrics().exits;
configureParty.configure({actors:[survivingLocal]});
assert.equal(localController.metrics().exits,configureExitsBeforeLeave+1,'PARTY.configure releases a removed local actor immediately');
assert.equal(localController.snapshot(configureWorld,survivingLocal).elapsedSeconds,.25,'PARTY.configure keeps the continuing local actor clock');
const configureExitsBeforeDemote=localController.metrics().exits;
configureParty.configure({actors:[survivingLocal],demote:[survivingLocal]});
assert.equal(localController.metrics().exits,configureExitsBeforeDemote+1,'PARTY.configure releases a human-to-AI demotion clock');
assert.equal(localController.snapshot(configureWorld,survivingLocal).elapsedSeconds,0,'demoted local actor has no lingering clock');
survivingLocal.control='local';localController.tick(configureWorld,survivingLocal,.25,'configure-before-world-change');
const replacedLocalWorld={...configureWorld,time:110};
const configureExitsBeforeWorld=localController.metrics().exits;
configureParty.configure({actors:[survivingLocal],world:replacedLocalWorld});
assert.equal(localController.metrics().exits,configureExitsBeforeWorld+1,'PARTY.configure world replacement clears old actor clocks');
assert.equal(localController.snapshot(replacedLocalWorld,survivingLocal).elapsedSeconds,0,'new local world starts without an inherited exposure clock');

// A guest can retain a host-replicated newly opened point, but native input
// from the guest cannot enter that region.
const guestReplica={combat:true,role:'guest',zone:'dist01',time:31,hp:1000,maxHp:1000,x:18,y:22,enemies:[]};
arena.enforce(guestReplica);
const deniedGuestMove=arena.movement(guestReplica,guestReplica,newlyOpenedPoint,.8);
assert.equal(D.contains(deniedGuestMove,'left',.8),true,'guest input candidate remains in the old admitted movement region');
guestReplica.x=15;guestReplica.y=14;
assert.deepEqual({x:guestReplica.x,y:guestReplica.y},newlyOpenedPoint,'guest setter preserves replicated new-floor coordinates');

// Persona's stronger actor setter uses the same union, with phase-specific
// oldAllowed still queried by the controller after intentional swaps.
globalThis.__HAPIL_INNER_FINAL_RC133__={encounter:s=>s?.persona===true};
const personaState={combat:true,role:'host',zone:'cult04',time:40,hp:1000,maxHp:1000,x:18,y:22,persona:true,
  innerFinalRC133:{duelSwap:false},enemies:[{id:'inner-evil-rc133',hp:1000,maxHp:1000,x:22,y:16}]};
D.enforce(personaState);
personaState.x=15;personaState.y=14;
assert.deepEqual({x:personaState.x,y:personaState.y},newlyOpenedPoint,'Persona phase guard admits only the exact world-left extension');
const boss=personaState.enemies[0];boss.x=15;boss.y=14;
assert.equal(D.contains({x:boss.x,y:boss.y},'right',.8),true,'Persona boss guard keeps its native opponent half');
assert.equal(D.contains({x:boss.x,y:boss.y},'left',.8),false,'player-side extension never bypasses the Persona boss guard');
personaState.innerFinalRC133.duelSwap=true;
const swappedOldSide={x:13,y:11.5};
assert.equal(D.contains(swappedOldSide,'right',.8),true);
assert.equal(controller.allowed(personaState,personaState,swappedOldSide),true,'intentional Persona swap-side remains oldAllowed');
const swappedWorldRight={x:20,y:8};
assert.equal(D.contains(swappedWorldRight,'right',.8),true,'Persona phase swap admits its real right-side floor');
personaState.x=swappedWorldRight.x;personaState.y=swappedWorldRight.y;
assert.deepEqual({x:personaState.x,y:personaState.y},swappedWorldRight,'actual Persona setters retain the swapped old side outside the new world-left region');
personaState.innerFinalRC133.duelSwap=false;
personaState.x=swappedWorldRight.x;personaState.y=swappedWorldRight.y;
assert.equal(D.contains({x:personaState.x,y:personaState.y},'left',.8),true,'ending the swap restores the original Persona setter side');
assert.equal(D.contains({x:personaState.x,y:personaState.y},'right',.8),false,'the old swapped side is no longer admitted after the phase ends');
assert.equal(controller.allowed(personaState,personaState,{x:0.5,y:14}),false,'guard extension never reaches outer/floorless space');

console.log('RC223_LEFT_ZONE_UNIT',JSON.stringify({status:'passed',checks,newlyOpenedPoint,policy:leftZone.policy,metrics:controller.metrics(),pauseTicks:pauseHits.length}));
