'use strict';

// Runs the actual browser stageLocalStrike page callback in a small VM so a
// removed/dead first target cannot silently make the second native strike a
// no-op. This proves fixture selection/queue identity, not gameplay balance.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const acorn=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/hapil1-rc221-runtime/node_modules','acorn'));

const browserFile=path.join(__dirname,'rc223-left-zone-browser.cjs');
const source=fs.readFileSync(browserFile,'utf8');
const ast=acorn.parse(source,{ecmaVersion:'latest'});
function walk(node,visit){
  if(!node||typeof node!=='object')return;
  if(typeof node.type==='string')visit(node);
  for(const value of Object.values(node))if(Array.isArray(value))value.forEach(child=>walk(child,visit));else if(value&&typeof value==='object'&&typeof value.type==='string')walk(value,visit);
}
let stageDeclaration;
walk(ast,node=>{
  if(node.type==='VariableDeclarator'&&node.id?.name==='stageLocalStrike'&&node.init?.type==='ArrowFunctionExpression'){
    assert.equal(stageDeclaration,undefined,'only one actual stageLocalStrike helper exists');
    stageDeclaration=node;
  }
});
assert(stageDeclaration,'actual browser stageLocalStrike helper exists');
const evaluateCall=stageDeclaration.init.body;
assert.equal(evaluateCall.type,'CallExpression');
assert.equal(evaluateCall.callee?.property?.name,'evaluate');
const pageCallback=evaluateCall.arguments?.[0];
assert.equal(pageCallback?.type,'ArrowFunctionExpression','unit extracts the real page evaluate callback');
const callbackSource=source.slice(pageCallback.start,pageCallback.end);

let checks=0;
function fixture({previousId='first',enemies,defenses,time=10,fixtureUntil=130}={}){
  const state={zone:'dist01',time,lastAttack:0,enemies,party:{strikes:[]},encounterLockUntil31226:0};
  const actor={slotId:'p2',control:'local',heroId:'gunner',hp:100,maxHp:100,x:14,y:14,readyAt:time,skillReady:[time,time,time],ultimateReady:time,facing:1,direction:'right'};
  const validTarget=(world,target)=>!!target&&Number(target.hp)>0&&Number(target.invulnerableUntil??0)<=world.time&&!target.visualOnly&&!target.protectedNarrativeTargetV31307&&!target.phaseTransitionActive&&Number(target.flowEnteringUntilV31343??0)<=world.time&&target.targetable!==false&&target.destructible!==false;
  const candidates=(world,range)=>world.enemies.filter(target=>validTarget(world,target)&&Math.hypot(target.x-actor.x,target.y-actor.y)<=range);
  const party={
    state,actors:[actor],status:{mode:'local2',role:'offline',paused:false},
    debug:{
      targets:(world,who,range)=>candidates(world,range),
      attack:(world,who,key)=>{const target=candidates(world,27)[0];if(!target)return false;world.party.strikes.push({slotId:'p2',targetId:target.id,key,at:world.time,zone:world.zone});who.readyAt=world.time+.25;return true;},
    },
    exportSnapshot:()=>({party:{strikes:state.party.strikes}}),
  };
  const window={
    __HAPIL_PARTY_V31322__:party,
    __RC223_LOCAL_TARGET_ID__:previousId,
    __RC223_LOCAL_TARGET_DEFENSES__:defenses,
    __RC223_LOCAL_TARGET_FIXTURE_INVULNERABLE_UNTIL__:fixtureUntil,
    __RC223_LOCAL_OUTGOING_PROBE__:{observations:[]},
    __HAPIL_COMBAT_V31343__:{validTarget},
    __HAPIL_RANGES_V31337__:{partyReach:()=>27},
    __HAPIL_CONTROLS_V31329__:{binding:{phase:'game'}},
    __HAPIL_REMOTE_RC222_RUNTIME__:{status:()=>({autoMode:'manual'})},
    __HAPIL_MOVING_V31335__:{hardLocked:()=>false},
    __HAPIL_CHANNEL_V31364__:{active:()=>false},
    __HAPIL_OBJECTIVE_FLOW_V31309__:{objectiveDamageAllowed:()=>true},
  };
  const context=vm.createContext({window,Math,Number,Object,Error});
  const callback=vm.runInContext('('+callbackSource+')',context);
  return{state,actor,party,window,callback,previousId};
}
const defense=(id,{invulnerableUntil=0,hp=100,maxHp=100}={})=>({id,hp,maxHp,hadOwnInvulnerableUntil:true,invulnerableUntil,phaseTransitionActive:false,phaseTransitionV31215:false,flowEnteringUntilV31343:0,targetable:true,destructible:true,visualOnly:false,protectedNarrativeTargetV31307:false});
const enemy=(id,{x=20,y=14,hp=100,maxHp=100,invulnerableUntil=0}={})=>({id,x,y,hp,maxHp,invulnerableUntil,readyAt:0,phaseTransitionActive:false,flowEnteringUntilV31343:0,targetable:true,destructible:true});
function run(fx,previousId=fx.previousId,point={x:17,y:14}){return fx.callback({point,previousTargetId:previousId});}

// The old fixed-ID lookup is exactly the stale-target behavior from the
// browser fixture: after first is removed, it produces no target to queue.
const next=enemy('next-authored',{x:21,y:16,hp:74,maxHp:100,invulnerableUntil:130});
const distracting=enemy('locked-distractor',{x:23,y:15,hp:160,maxHp:160,invulnerableUntil:130});
const removedFixture=fixture({enemies:[next,distracting],defenses:[defense('first'),defense(next.id,{hp:74}),defense(distracting.id,{hp:160,maxHp:160,invulnerableUntil:20})]});
assert.equal(removedFixture.state.enemies.find(row=>row.id==='first'),undefined,'the first target is absent from the current native enemy list');
assert.equal(removedFixture.state.enemies.find(row=>row.id===removedFixture.window.__RC223_LOCAL_TARGET_ID__),undefined,'the former fixed-ID helper cannot resolve a removed target');checks+=2;
const freshResult=run(removedFixture,'first');
assert.equal(freshResult.unavailable,false,'actual callback stages a live fallback after the previous target is removed');checks++;
assert.equal(freshResult.targetIdentity.targetId,'next-authored','actual helper selects a fresh live authored enemy');
assert.equal(freshResult.targetIdentity.previousTargetId,'first');
assert.equal(freshResult.targetIdentity.previousGone,true);
assert.equal(freshResult.targetIdentity.changed,true);
assert.equal(freshResult.targetIdentity.restoreFromFixture,true);
assert.equal(freshResult.targetIdentity.hpAtStage,74,'stage records actual HP before retaining the existing full-HP fixture staging policy');
assert.equal(freshResult.target.defenseBeforeFixture.invulnerableUntil,0);
assert.equal(freshResult.target.defenseAtStage.invulnerableUntil,0,'only the selected fallback regains its recorded native invulnerability');
assert.equal(freshResult.target.hp,100,'the existing stageLocalStrike HP staging policy is preserved for a living selected target');
assert.equal(freshResult.queued,true);
assert.equal(freshResult.queueAfter.count,1);
assert.equal(freshResult.queueAfter.localTarget,1);
assert.deepEqual(Array.from(freshResult.queueAfter.localStrikes,row=>row.targetId),['next-authored'],'native attack queues the fresh selected ID');
assert.equal(removedFixture.state.enemies.find(row=>row.id==='locked-distractor').invulnerableUntil,130,'other enemies retain their fixture defense');checks+=13;

// A still-living previous target keeps authority even when another authored
// target has more HP and could be considered after it is gone.
const living=enemy('still-alive',{x:20,y:14,hp:40,maxHp:100,invulnerableUntil:0});
const higher=enemy('higher-hp',{x:23,y:15,hp:150,maxHp:160,invulnerableUntil:130});
const aliveFixture=fixture({enemies:[living,higher],defenses:[defense(living.id,{hp:40}),defense(higher.id,{hp:150,maxHp:160})]});
const aliveResult=run(aliveFixture,living.id);
assert.equal(aliveResult.targetIdentity.targetId,living.id);
assert.equal(aliveResult.targetIdentity.previousGone,false);
assert.equal(aliveResult.targetIdentity.changed,false);
assert.equal(aliveResult.targetIdentity.restoreFromFixture,false);
assert.equal(aliveFixture.state.enemies.find(row=>row.id===higher.id).invulnerableUntil,130,'a live previous target prevents fallback promotion');checks+=5;

const noTarget=fixture({enemies:[],defenses:[defense('first')]});
assert.throws(()=>run(noTarget,'first'),/no living native-authored, naturally admissible target/,'absence of any live fallback is an explicit fixture failure');
assert.equal(noTarget.state.party.strikes.length,0,'no-live-target failure cannot silently claim a queue');checks+=2;

const dead=enemy('first',{hp:0,maxHp:100}),fresh=enemy('alive-fallback',{hp:60,invulnerableUntil:130});
const deadFixture=fixture({enemies:[dead,fresh],defenses:[defense('first'),defense(fresh.id,{hp:60})]});
const deadResult=run(deadFixture);assert.equal(deadResult.target.id,fresh.id);assert.equal(dead.hp,0,'dead previous target is never revived by HP fixture staging');assert.equal(deadResult.targetIdentity.previousHp,0);assert.equal(deadResult.queued,true);checks+=4;

const foreign=enemy('foreign-defense',{invulnerableUntil:131}),foreignBefore=structuredClone(foreign),foreignFixture=fixture({enemies:[foreign],defenses:[defense(foreign.id)]});
assert.throws(()=>run(foreignFixture),/no living native-authored/,'an invulnerability value changed after fixture installation is never reset');assert.deepEqual(foreign,foreignBefore);assert.equal(foreignFixture.state.party.strikes.length,0);checks+=3;

const gateCases=[['native invulnerability',target=>{},row=>row.invulnerableUntil=20],['phase transition',target=>target.phaseTransitionActive=true],['flow entry',target=>target.flowEnteringUntilV31343=20],['untargetable',target=>target.targetable=false],['indestructible',target=>target.destructible=false],['visual-only',target=>target.visualOnly=true],['narrative protection',target=>target.protectedNarrativeTargetV31307=true]];
for(const [name,mutate,mutateDefense]of gateCases){const target=enemy('gated',{hp:73,invulnerableUntil:130}),row=defense(target.id,{hp:73});mutate(target);mutateDefense?.(row);const before=structuredClone(target),f=fixture({enemies:[target],defenses:[row]});assert.throws(()=>run(f),/no living native-authored/,'fallback retains '+name+' gate');assert.deepEqual(target,before,'rejected '+name+' candidate is restored exactly');assert.equal(f.state.party.strikes.length,0);checks+=3;}

const withoutOwn=enemy('no-native-invulnerability',{hp:60,invulnerableUntil:130}),withoutOwnDefense=defense(withoutOwn.id,{hp:60});withoutOwnDefense.hadOwnInvulnerableUntil=false;delete withoutOwnDefense.invulnerableUntil;
const noOwnFixture=fixture({enemies:[withoutOwn],defenses:[withoutOwnDefense]});assert.equal(run(noOwnFixture).queued,true);assert.equal(Object.hasOwn(withoutOwn,'invulnerableUntil'),false,'selected fallback restores absence of the original own property');checks+=2;
const deadOnly=enemy('first',{hp:0}),deadOnlyFixture=fixture({enemies:[deadOnly],defenses:[defense('first')]});assert.throws(()=>run(deadOnlyFixture),/no living native-authored/);assert.equal(deadOnly.hp,0);assert.equal(deadOnlyFixture.state.party.strikes.length,0);checks+=3;

assert(source.includes('target.hp=target.maxHp;'),'existing living-target max-HP fixture stage remains unchanged');assert(source.includes('Math.abs(row.ratio-.9)<1e-9'),'native exposed outgoing .9 factor gate remains unchanged');assert(source.includes('targetId:safeTargetId,before:safeStrike.hpBefore,index:safeStrike.observationStart'));assert(source.includes('targetId:exposedTargetId,before:exposedStrike.hpBefore,index:exposedStrike.observationStart'));checks+=4;

for(const name of ['safeOutgoing','exposedOutgoing']){assert(source.includes('assert(Number.isFinite('+name+'.targetHp)'),'missing target HP cannot pass the damage comparison through null coercion');checks++;}

console.log('RC223_LEFT_STRIKE_FIXTURE_UNIT '+JSON.stringify({status:'passed',checks,scope:'actual browser stageLocalStrike callback; selection/identity/queue fixtures only, no game engine or browser claim',freshFallback:{id:freshResult.targetIdentity.targetId,stageHp:freshResult.targetIdentity.hpAtStage,stagedHp:freshResult.target.hp,queueTarget:freshResult.queueAfter.localStrikes[0].targetId},alivePrevious:aliveResult.targetIdentity.targetId,noTarget:'explicit failure'}));
