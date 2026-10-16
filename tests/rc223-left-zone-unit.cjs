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
const hits=[],warnings=[];
const controller=leftZone.createController({
  inScope:s=>s?.combat===true&&!s?.rest,
  isHost:s=>s?.role==='host',
  isPlayer:(s,a)=>a===s||a?.rc222NativeActor===true,
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
const remote={id:'p2',slotId:'p2',rc222NativeActor:true,x:newlyOpenedPoint.x,y:newlyOpenedPoint.y,hp:800,maxHp:800};
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
const livingRemote={id:'p-down-host',slotId:'p-down-host',rc222NativeActor:true,x:15,y:14,hp:800,maxHp:800};
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
globalThis.__HAPIL_LEFT_ZONE_NATIVE_RC223__={
  allowed:(s,a,p,r)=>controller.allowed(s,a,p,r),
  canMove:(s,a,p,r)=>controller.canMove(s,a,p,r),
  regionAt:(s,a,p)=>controller.regionAt(s,a,p),
  exposed:(s,a,p)=>controller.exposedAt(s,a,p),
  factors:(s,a)=>controller.factors(s,a)
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
