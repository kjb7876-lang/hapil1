'use strict';

// Source-backed regression: a live party actor owns the outgoing strike even
// while the canonical host is down. Exercise the actual RC95 gate, cast factor,
// counter-damage path, PARTY.applyStrike, and RC222 actor view.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createRuntime}=require('../assets/rc222/runtime.js');
let acorn;
for(const prefix of [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,process.env.NODE_PATH,'/tmp/rc221-deps/node_modules','/tmp/hapil1-rc221-runtime/node_modules'].filter(Boolean)){
  try{acorn=require(path.join(prefix,'acorn'));break;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
}
acorn??=require('acorn');

const root=path.resolve(__dirname,'..');
const sourcePath=process.env.RC223_CAST_FACTOR_SOURCE||path.join(root,'assets/index-v31526.js');
const bundle=fs.readFileSync(sourcePath,'utf8');
const flowSource=fs.readFileSync(path.join(root,'assets/rc95/combat-flow.js'),'utf8');
const ast=acorn.parse(bundle,{ecmaVersion:'latest',sourceType:'script'});
let checks=0;
const eq=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;};
const ok=(actual,message)=>{assert.ok(actual,message);checks++;};
function walk(node,visit){
  if(!node||typeof node!=='object')return;
  if(typeof node.type==='string')visit(node);
  for(const [key,value]of Object.entries(node)){
    if(key==='start'||key==='end'||key==='loc')continue;
    if(Array.isArray(value))for(const child of value)walk(child,visit);
    else if(value&&typeof value==='object'&&typeof value.type==='string')walk(value,visit);
  }
}
const functions=new Map();
walk(ast,node=>{if(node.type==='FunctionDeclaration'&&node.id&&!functions.has(node.id.name))functions.set(node.id.name,node);});
function fnSource(name){const node=functions.get(name);assert(node,`actual source function ${name} exists`);return bundle.slice(node.start,node.end);}
const helper=fnSource('HAPIL_bossCastDamageFactorV31342');
const counter=fnSource('HAPIL_applyCounterDamageV31303');
const finite=fnSource('HAPIL_finiteV31303');
const applyStrike=fnSource('applyStrike');
const enabled=flowSource.match(/function enabled\(s\)\{[^}]+\}/)?.[0];
assert(enabled,'actual RC95 enabled function exists');

function fixture({hostHp=0,zone='dist02',practice=false,practicePattern=false,role='host',partyEnabled=true,disconnected=false,actors,owner=true,partyState='world',runtimeRole,roomIsHost,sessionStale=false,actorHp=180,downUntil}={}){
  const boss={id:'dist02-boss',boss:true,hp:1000,maxHp:1000,stagger:0,attackStarted:0,castProtectionStartedV31342:90,castProtectionUntilV31342:110,atomicCastUntil31210:0};
  const world={zone,time:100,hp:hostHp,maxHp:240,activeHeroId:'hwando',combo:0,staggerUntil:0,counterUntil:0,damageBuffUntil:0,awakeningUntil:0,enemies:[boss]};
  const actor={slotId:'story68',heroId:'seoha',control:'ai',hp:actorHp,maxHp:240};
  if(downUntil!==undefined)actor.downUntil=downUntil;
  const rows=actors??[actor];
  const ctx={window:{},world,boss,actor,initialActors:rows,partyStatus:{role,enabled:partyEnabled,disconnected,mode:role==='offline'?'local2':'network'},partyStateOverride:partyState==='foreign'?{...world}:world,statusReads:0,runtimeRole,roomIsHost,sessionStale};
  vm.createContext(ctx);
  vm.runInContext(`${enabled};`,ctx);
  ctx.window.__HAPIL_COMBAT_FLOW_RC95__={enabled:ctx.enabled};
  ctx.window.__HAPIL_COMBAT_CORE_V31401__={finalDamage(_state,_target,damage){return damage;}};
  vm.runInContext(`${finite};${helper};${counter};${applyStrike};let scopedOutgoingActor=null;const actors=initialActors,stats={hits:0},alive=a=>a&&a.hp>0,canTarget=()=>true;const bridge={damage(target,power){this.result=HAPIL_applyCounterDamageV31303(world,target,power,null,{heroId:'seoha'});}};const party={get state(){return partyStateOverride;},get status(){statusReads++;return partyStatus;},get actors(){return actors;},get outgoingActor(){return scopedOutgoingActor;}};window.__HAPIL_PARTY_V31322__=party;globalThis.setOwner=a=>{scopedOutgoingActor=a;};globalThis.runActualStrike=(s,h)=>applyStrike(s,h);globalThis.directFactor=(s,b)=>HAPIL_bossCastDamageFactorV31342(s,b);globalThis.readStatusCount=()=>statusReads;globalThis.readHit=()=>bridge.result;`,ctx);
  if(runtimeRole!=null){
    ctx.window.__HAPIL_REMOTE_RC222_RUNTIME__={status:()=>({role:ctx.runtimeRole}),session:{isHost:ctx.roomIsHost===true,stale:ctx.sessionStale===true}};
  }
  if(!owner)ctx.setOwner(null);else ctx.setOwner(actor);
  return{ctx,world,boss,actor,rows,party:ctx.window.__HAPIL_PARTY_V31322__};
}
function strike(f){
  f.ctx.runActualStrike(f.world,{slotId:f.actor.slotId,heroId:f.actor.heroId,targetId:f.boss.id,zone:f.world.zone,power:100,key:'A'});
  return f.ctx.readHit();
}
function factor(f,state=f.world){return f.ctx.directFactor(state,f.boss);}

// The actual native party strike and actual counter-damage reducer now use the
// living registered AI actor's HP when the network host is down.
const hostDown=fixture({runtimeRole:'host',roomIsHost:true});
strike(hostDown);
eq(hostDown.boss.hp,967.5,'actual PARTY.applyStrike applies .65 cast factor for a living AI actor while host HP is zero');
eq(hostDown.ctx.readHit().appliedDamage,32.5,'actual native counter-damage records the corrected nonzero hit');
eq(hostDown.ctx.readStatusCount(),1,'the host-down recovery check reads party status once');
eq(hostDown.ctx.readHit().hpBefore,1000,'counter-damage reports the original boss HP');
const aliveHost=fixture({hostHp:240,runtimeRole:'host',roomIsHost:true});
eq(factor(aliveHost),.65,'ordinary living host keeps the existing .65 cast factor');
eq(aliveHost.ctx.readStatusCount(),0,'ordinary enabled-state fast path does not allocate party status');
const offlineLocal2=fixture({role:'offline',runtimeRole:'offline'});
eq(factor(offlineLocal2),.65,'registered living actor in enabled offline local2 uses actor HP');
const expiredDown=fixture({runtimeRole:'host',roomIsHost:true,downUntil:99});
eq(factor(expiredDown),.65,'an actor whose down timer expired remains eligible');

// RC222 supplies a live actor view for remote-owned native work. That view is
// already enabled and keeps its existing behavior without the fallback lookup.
const remote=fixture({runtimeRole:'host',roomIsHost:true});
const binding={phase:'game',state:{current:remote.world},hero:{current:'hwando'},input:{current:new Set()},settings:{current:{combatMode:'manual'}},auto:{current:false},passives:{current:{}},shards:{current:11},partyIds:{current:['hwando']},actions:{}};
const controls={binding,choice:()=> 'manual',hasHeldLogical:()=>false,effective:()=> 'manual'};
const env={__HAPIL_PARTY_V31322__:remote.party,__HAPIL_CONTROLS_V31329__:controls,addEventListener(){}};
remote.ctx.window=env;env.__HAPIL_COMBAT_FLOW_RC95__={enabled:remote.ctx.enabled};env.__HAPIL_COMBAT_CORE_V31401__={finalDamage(_state,_target,damage){return damage;}};
const runtime=createRuntime(env);env.__HAPIL_REMOTE_RC222_RUNTIME__=runtime;
runtime.attach({isHost:true,slotId:'p1',epoch:1,session:{sessionId:'cast-factor-unit'}});
let remoteFactor;const remoteStatusReads=remote.ctx.readStatusCount();
runtime.withActor(remote.world,{...remote.actor,control:'remote'},view=>{remoteFactor=remote.ctx.directFactor(view,remote.boss);eq(view.hp,180,'actual RC222 actor view exposes the remote actor HP');});
eq(remoteFactor,.65,'actual RC222 remote actor transaction retains its .65 cast factor');
eq(remote.ctx.readStatusCount(),remoteStatusReads,'RC222 actor view returns through the enabled fast path without an extra party status read');

// Ineligible owners and world modes retain the .01 fallback.
const invalid=[
  ['foreign canonical world',fixture({partyState:'foreign',runtimeRole:'host',roomIsHost:true})],
  ['unregistered owner',fixture({actors:[],runtimeRole:'host',roomIsHost:true})],
  ['guest role',fixture({role:'guest',runtimeRole:'guest',roomIsHost:false})],
  ['disconnected role',fixture({role:'disconnected',disconnected:true,runtimeRole:'disconnected',roomIsHost:false})],
  ['disconnected flag',fixture({disconnected:true,runtimeRole:'host',roomIsHost:true})],
  ['disabled party',fixture({partyEnabled:false,runtimeRole:'host',roomIsHost:true})],
  ['dead actor',fixture({actorHp:0,runtimeRole:'host',roomIsHost:true})],
  ['nonfinite actor HP',fixture({actorHp:Infinity,runtimeRole:'host',roomIsHost:true})],
  ['future down timer',fixture({downUntil:101,runtimeRole:'host',roomIsHost:true})],
  ['nonfinite down timer',fixture({downUntil:Infinity,runtimeRole:'host',roomIsHost:true})],
  ['host role without connected host session',fixture({runtimeRole:'host',roomIsHost:false})],
  ['stale host session',fixture({runtimeRole:'host',roomIsHost:true,sessionStale:true})],
];
for(const [name,f]of invalid)eq(factor(f),.01,`${name} retains the safety fallback`);
const practice=fixture({runtimeRole:'host',roomIsHost:true,practice:true});practice.world.practiceV31329=true;
eq(factor(practice),.01,'practice flags remain authoritative over actor HP');
const practicePattern=fixture({runtimeRole:'host',roomIsHost:true,practicePattern:true});practicePattern.world.practicePatternV31365=true;
eq(factor(practicePattern),.01,'practice-pattern flags remain authoritative over actor HP');
const hub=fixture({zone:'hub',runtimeRole:'host',roomIsHost:true});
eq(factor(hub),.01,'hub combat remains disabled for the canonical host');
const remoteHub=fixture({zone:'hub',runtimeRole:'host',roomIsHost:true});
const hubView=Object.create(remoteHub.world,{hp:{value:180,enumerable:true}});
eq(factor(remoteHub,hubView),.01,'a remote actor view does not bypass the hub guard');
const solo=fixture({role:'offline',partyEnabled:false,owner:false});
eq(factor(solo),.01,'solo down host without an enabled party keeps the safety fallback');
const soloAlive=fixture({hostHp:240,role:'offline',partyEnabled:false,owner:false});
eq(factor(soloAlive),.65,'ordinary solo combat keeps the existing enabled-state factor');
const remoteNoActor=fixture({role:'guest',runtimeRole:'guest',roomIsHost:false});
const practiceRemoteView=Object.create(remoteNoActor.world,{hp:{value:180,enumerable:true},practicePatternV31365:{value:true,enumerable:true}});
eq(factor(remoteNoActor,practiceRemoteView),.01,'practice guard remains active in a remote actor view');

// Atomic casts and the no-cast path still use the existing absolute deadlines.
const atomic=fixture({runtimeRole:'host',roomIsHost:true});
atomic.boss.castProtectionStartedV31342=0;atomic.boss.castProtectionUntilV31342=0;atomic.boss.attackStarted=95;atomic.boss.atomicCastUntil31210=105;
eq(factor(atomic),.65,'active native atomic deadline receives the same actor-aware factor');
atomic.boss.atomicCastUntil31210=99;
eq(factor(atomic),1,'expired cast deadlines release the factor');
eq(atomic.ctx.readStatusCount(),1,'no-cast path returns before reading party status');

const report={status:'passed',checks,source:sourcePath,bundleSha256:crypto.createHash('sha256').update(bundle).digest('hex'),baselineHostDown:{bossHp:hostDown.boss.hp,damage:hostDown.ctx.readHit().appliedDamage},remoteFactor,invalidCases:invalid.map(([name])=>name)};
console.log('RC223_PARTY_CAST_FACTOR_UNIT',JSON.stringify(report));
