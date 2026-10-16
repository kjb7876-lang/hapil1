'use strict';

// Source-backed reproduction for RC222 actor-context visual receipts. This
// intentionally asserts the corrected contract: an accepted remote-actor
// incoming hit must remain valid in the canonical host snapshot. On the
// unfixed bundle it records the concrete rejection before failing.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createRuntime,portable}=require('../assets/rc222/runtime.js');

let acorn;
for(const prefix of [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,process.env.NODE_PATH,'/tmp/rc221-deps/node_modules','/tmp/hapil1-rc221-runtime/node_modules'].filter(Boolean)){
  try{acorn=require(path.join(prefix,'acorn'));break;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
}
acorn??=require('acorn');

const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'assets/index-v31526.js'),'utf8');
const ast=acorn.parse(source,{ecmaVersion:'latest',sourceType:'script'});
function walk(node,visit){
  if(!node||typeof node!=='object')return;
  if(typeof node.type==='string')visit(node);
  for(const [key,value]of Object.entries(node)){
    if(key==='start'||key==='end'||key==='loc')continue;
    if(Array.isArray(value))for(const child of value)walk(child,visit);
    else if(value&&typeof value==='object'&&typeof value.type==='string')walk(value,visit);
  }
}
function walkFind(node,predicate){let found=null;walk(node,n=>{if(!found&&predicate(n))found=n;});return found;}

const feedbackAt=source.indexOf("const KEY='enemyFeedbackV31361'");
assert(feedbackAt>=0,'actual RC31361 feedback module exists');
const protectNode=walkFind(ast,n=>n.type==='FunctionDeclaration'&&n.id?.name==='protect'&&n.start>feedbackAt);
assert(protectNode,'actual FEEL.protect implementation exists');
const applyWrapper=source.slice(feedbackAt).split('\n').find(line=>line.includes('const p=party();if(p?.applySnapshot)'));
assert(applyWrapper,'actual strict FEEL.applySnapshot wrapper exists');
const iifeStart=source.lastIndexOf(';(()=>',feedbackAt);
assert(iifeStart>=0&&iifeStart<protectNode.start,'actual FEEL module boundary is located');
const feelBootstrap=source.slice(iifeStart,protectNode.end)+
  `\n${applyWrapper}\nwindow.__RC223_FEEDBACK_OWNER_UNIT__={authority,meta,valid,hit,protect};})();`;

function scenario(kind,{guestHero='seoha',nested=false,targetMode='proxy'}={}){
  let partyRole='host',nativeApplyCalls=0;
  const world={zone:'dist02',time:10,x:5,y:5,hp:0,maxHp:240,activeHeroId:'hwando',enemyFeedbackV31361:[],
    enemies:[],effects:[],hostileProjectiles:[],pendingHits:[],impactQueue:[],floatTexts:[],egoDrops:[],defeated:[],
    pendingStrikes:[],resonanceThreads:[],telekineticCasts:[],clues:new Set(),spawnedWaves:new Set([1])};
  const actor={slotId:'p2',heroId:guestHero,control:'remote',name:'Guest',x:8,y:7,hp:120,maxHp:240,invulnerableUntil:0};
  const roster=[{slotId:'p1',heroId:'hwando',name:'Host',control:'host'},actor];
  const binding={phase:'game',state:{current:world},hero:{current:'hwando'},input:{current:new Set()},settings:{current:{combatMode:'manual'}},
    auto:{current:false},passives:{current:{}},shards:{current:11},partyIds:{current:['hwando']},actions:{}};
  const env={performance:{now:()=>100},__HAPIL_THEME_V31323__:{owner:()=>null},
    __HAPIL_COMBAT_V31333__:{core:a=>({x:a.x,y:a.y})},
    __HAPIL_CONTACT_V31336__:{classify:()=>({hit:true})},__HAPIL_DEFENSE_V31356__:{active:()=>false}};
  const party={state:world,actors:[actor],roster,configure(){},setNetworkRole(role){partyRole=role;},
    get status(){return{role:partyRole,enabled:true,mode:'network',paused:false,snapshotSeq:-1};},
    exportSnapshot(){return{protocol:1,version:'RC222',seq:1,zone:world.zone,
      world:{fields:Object.entries(portable(world))},
      party:{roster:portable(roster),actors:portable([actor]),strikes:[],serial:1,hostDownUntil:0,hostDownPosition:null,wipeCount:0,enabled:true,mode:'network',paused:false}};},
    applySnapshot(){nativeApplyCalls++;return true;}};
  env.__HAPIL_PARTY_V31322__=party;
  env.__HAPIL_CONTROLS_V31329__={binding,choice:()=> 'manual',hasHeldLogical:()=>false,effective:()=> 'manual'};
  env.__HAPIL_RC222_NATIVE__={createState:()=>({cooldowns:{},resonance:0,combo:0})};
  const runtime=createRuntime(env);
  env.__HAPIL_REMOTE_RC222_RUNTIME__=runtime;
  runtime.attach({isHost:true,slotId:'p1',epoch:1,session:{sessionId:'feedback-owner-unit'},roster});

  const sandbox={window:env,G:(x,y)=>({x,y}),MONGSE_isEncounterLocked31226:()=>false};
  vm.createContext(sandbox);
  vm.runInContext(feelBootstrap,sandbox);
  const feel=env.__RC223_FEEDBACK_OWNER_UNIT__;
  const sourceHit={id:'boss-hit',sourceId:'dist02-boss',x:8.5,y:7.5,visualYV31333:0,vx:1,originX:9,originY:7,damage:18,shape:'circle',color:'#eebc82',heartContactV31336:{target:'p2',time:10,heart:true}};
  if(kind==='protect')actor.invulnerableUntil=11;
  let activeView=null,created=null;
  const perform=view=>{
    activeView=view;
    const target=targetMode==='actualActor'?actor:view;
    created=kind==='hit'?feel.hit(view,target,sourceHit,18,{originX:9,originY:7}):feel.protect(view,target,sourceHit,18,{originX:9,originY:7});
    return true;
  };
  const entered=runtime.withActor(world,actor,view=>nested?runtime.withActor(world,actor,perform):perform(view));
  const receipt=world.enemyFeedbackV31361.at(-1)??null;
  const before={kind,entered,created:!!created,actorSlot:runtime.actorFor(activeView)?.slotId??null,
    proxyHero:activeView?.activeHeroId,canonicalHero:world.activeHeroId,
    event:receipt?{kind:receipt.kind,slot:receipt.slot,hero:receipt.hero,zone:receipt.zone,x:receipt.x,y:receipt.y}:null,
    validThroughActorView:receipt?feel.valid(receipt,activeView):false,
    validThroughCanonicalWorld:receipt?feel.valid(receipt,world):false};
  const snapshot=runtime.exportSnapshot();
  runtime.role('guest');
  const accepted=runtime.snapshot(snapshot,{seq:1,epoch:1,full:true});
  const validRejection=runtime.telemetry().lastSnapshotRejection??null;
  const nativeApplyAfterValid=nativeApplyCalls;
  const invalidSnapshot=JSON.parse(JSON.stringify(snapshot));
  const invalidFields=Object.fromEntries(invalidSnapshot.world.fields);
  invalidFields.enemyFeedbackV31361[0].hero='forged-hero';
  invalidSnapshot.world.fields=Object.entries(invalidFields);
  const invalidAccepted=runtime.snapshot(invalidSnapshot,{seq:2,epoch:1,full:true});
  const invalidRejection=runtime.telemetry().lastSnapshotRejection??null;
  const nativeApplyAfterInvalid=nativeApplyCalls;
  // FEEL.meta is the exact canonical draw/audio cleanup. Report its effect
  // separately; the reproduction above snapshots before that cleanup runs.
  feel.meta(world);
  const remainingAfterCanonicalCleanup=world.enemyFeedbackV31361.length;
  const result={...before,snapshotAccepted:accepted,validRejectionReason:validRejection?.reason??null,
    nativeApplyAfterValid,invalidSnapshotAccepted:invalidAccepted,invalidRejectionReason:invalidRejection?.reason??null,
    nativeApplyAfterInvalid,
    remainingAfterCanonicalMetaCleanup:remainingAfterCanonicalCleanup};
  runtime.leave();
  return result;
}

function canonicalSoloScenario(){
  const world={zone:'dist02',time:10,x:5,y:5,hp:120,maxHp:240,activeHeroId:'hwando',enemyFeedbackV31361:[],enemies:[],hostileProjectiles:[]};
  const env={performance:{now:()=>100},__HAPIL_THEME_V31323__:{owner:()=>null},__HAPIL_COMBAT_V31333__:{core:a=>({x:a.x,y:a.y})}};
  const sandbox={window:env,G:(x,y)=>({x,y}),MONGSE_isEncounterLocked31226:()=>false};
  vm.createContext(sandbox);vm.runInContext(feelBootstrap,sandbox);
  const feel=env.__RC223_FEEDBACK_OWNER_UNIT__,event=feel.hit(world,world,{id:'solo-hit',sourceId:'solo-source',x:5,y:5,damage:12},12);
  return{created:!!event,event:event?{slot:event.slot,hero:event.hero}:null,canonicalHero:world.activeHeroId,runtimeAttached:!!env.__HAPIL_REMOTE_RC222_RUNTIME__};
}

const cases=[
  scenario('hit',{nested:true}),
  scenario('protect'),
  scenario('hit',{guestHero:'hwando'}),
  scenario('hit',{targetMode:'actualActor'})
];
const solo=canonicalSoloScenario();
console.log('RC223_FEEDBACK_OWNER_REPRO '+JSON.stringify({
  source:'actual RC222 createRuntime.withActor + extracted RC31361 hit/protect/meta/valid/applySnapshot wrapper',
  hostHero:'hwando',guestHero:'seoha',cases,solo
}));

for(const row of cases){
  assert.equal(row.entered,true,`${row.kind}: actual RC222 actor transaction entered`);
  assert.equal(row.created,true,`${row.kind}: actual FEEL receipt was created`);
  assert.equal(row.actorSlot,'p2',`${row.kind}: RC222 actorFor resolves the proxy to p2`);
  assert.equal(row.validThroughActorView,row.proxyHero===row.canonicalHero,`${row.kind}: strict hero validation remains context-specific`);
  assert.equal(row.event?.hero,'hwando',`${row.kind}: receipt hero belongs to canonical world`);
  assert.equal(row.event?.slot,'p2',`${row.kind}: receipt slot identifies its actual actor`);
  assert.equal(row.event?.x,8.5,`${row.kind}: actor-owned contact point is retained`);
  assert.equal(row.event?.y,7.5,`${row.kind}: actor-owned contact point is retained`);
  assert.equal(row.validThroughCanonicalWorld,true,`${row.kind}: canonical snapshot validator accepts the receipt`);
  assert.equal(row.snapshotAccepted,true,`${row.kind}: canonical snapshot is not rejected by strict FEEL validation`);
  assert.equal(row.nativeApplyAfterValid,1,`${row.kind}: native snapshot apply receives valid receipt`);
  assert.equal(row.invalidSnapshotAccepted,false,`${row.kind}: malformed receipt remains rejected`);
  assert.equal(row.invalidRejectionReason,'native-apply',`${row.kind}: strict FEEL wrapper rejects malformed receipt`);
  assert.equal(row.nativeApplyAfterInvalid,1,`${row.kind}: malformed receipt never reaches native apply`);
}
assert.equal(cases[2].proxyHero,'hwando','same-hero proxy case shares the host hero identity');
assert.equal(cases[2].event?.slot,'p2','same-hero proxy still records actual p2 ownership');
assert.deepEqual(solo,{created:true,event:{slot:'__host',hero:'hwando'},canonicalHero:'hwando',runtimeAttached:false},'canonical solo receipt stays unchanged');

process.stdout.write(JSON.stringify({ok:true,suite:'rc223-feedback-owner-unit',cases:cases.length,solo:true})+'\n');
