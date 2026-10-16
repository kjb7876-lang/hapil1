'use strict';

// Source-backed regression for final-boss EGO rewards when the co-op host is
// down. The unowned/AI reproduction and remote actor-context case both execute
// extracted native Ke and RC138 clear logic; the latter uses actual RC222
// createRuntime().withActor with the production React refs.
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
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bundle=fs.readFileSync(process.env.RC223_REWARD_SOURCE||path.join(root,'assets/index-v31526.js'),'utf8');
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
const variables=new Map();
let keHandler=null,reconcileNode=null,partyUiSetterNode=null;
walk(ast,node=>{
  if(node.type==='VariableDeclarator'&&node.id?.type==='Identifier'){
    const rows=variables.get(node.id.name)??[];rows.push(node);variables.set(node.id.name,rows);
    if(node.id.name==='Ke'&&node.init?.type==='CallExpression')keHandler=node.init.arguments[0];
  }
  if(node.type==='FunctionDeclaration'&&node.id?.name==='MONGSE_reconcileHostBossRewardV31217')reconcileNode=node;
  if(node.type==='FunctionDeclaration'&&node.id?.name==='HAPIL_partyUiSetterRC222')partyUiSetterNode=node;
});
function varInit(name,predicate=()=>true){
  const row=(variables.get(name)??[]).find(item=>predicate(item.init));
  assert(row,`actual source declaration ${name} exists`);
  return bundle.slice(row.init.start,row.init.end);
}
function functionSource(node,name){assert(node,`actual source function ${name} exists`);return bundle.slice(node.start,node.end);}
ok(keHandler?.type==='ArrowFunctionExpression','actual native Ke death handler is located');
const extracted={
  zoneClear:varInit('MONGSE_zoneCombatCleared',n=>n?.type==='ArrowFunctionExpression'),
  zoneClearShardReward:varInit('MONGSE_zoneClearShardReward',n=>n?.type==='ArrowFunctionExpression'),
  unlockReward:varInit('MONGSE_unlockZoneEgoRewardV31217',n=>n?.type==='ArrowFunctionExpression'),
  bossTemplate:varInit('Zr',n=>n?.type==='ArrowFunctionExpression'),
  loopZone:(()=>{const row=walkFind(ast,n=>n.type==='FunctionDeclaration'&&n.id?.name==='xe');return functionSource(row,'xe');})(),
  deathHandler:bundle.slice(keHandler.start,keHandler.end),
};
function walkFind(tree,predicate){let found=null;walk(tree,node=>{if(!found&&predicate(node))found=node;});return found;}

function makeFixture({hp=0,role='host',enabled=true,bossDefeated=false,withAdd=false}={}){
  const zone='cult01',name='Cult I';
  const world={zone,time:100,hp,maxHp:240,x:8,y:9,fxSerial:1,enemies:[],defeated:[],effects:[],floatTexts:[],hostileProjectiles:[],narrativeCasts:[],targetEnemyId:null,resonance:0,clues:new Set(),egoDrops:[{id:'preexisting-drop'}],loopCycles:{},spawnedWaves:new Set([1,2,3,4]),bossDefeated};
  const boss={id:'cult01-final-boss',name:'Final Boss',kind:'fallen',boss:true,midboss:false,hp:0,maxHp:100,x:12,y:12,actionSprites:{death:'boss-death.png'}};
  const add={id:'cult01-add',name:'Remaining Add',kind:'fallen',boss:false,midboss:false,hp:1,maxHp:1,x:13,y:13,actionSprites:{death:'add-death.png'}};
  world.enemies=[boss,...(withAdd?[add]:[])];world.targetEnemyId=boss.id;
  const shards={current:11},setCalls=[],notices=[];
  const N={cult01:{name,enemies:[{id:boss.id,boss:true}]}};
  const window={},stateRef={current:world};
  const ctx={window,world,P:stateRef,Be:shards,_:value=>setCalls.push(value),B:value=>notices.push(value),We:()=>{},N,he:[zone],ge:[],
    MONGSE_INFINITE_STAT_MAX:999999,MONGSE_SFX:{bomb:'bomb'},MONGSE_bossVoiceSfx:()=> 'boss-voice',MONGSE_BOSS_SOURCE_FACING_BY_ENTITY_V31223:{},
    HAPIL_narrativeDeathFieldsV31313:()=>({}),Ge:()=>1,MONGSE_phaseScale:()=>1,
    MONGSE_cleanupEpisodeBossSummons:()=>{},MONGSE_clearQueuedEnemyImpacts:()=>{},MONGSE_clearZoneCombatQueuesAfterClear:()=>{},hi:()=>{},
    MONGSE_isLaunchedBossOrMidbossProjectile31221:()=>false,MONGSE_preserveDetachedBossProjectile31221:()=>{},
    MONGSE_zoneAssetManifest:()=>({}),console};
  vm.createContext(ctx);
  vm.runInContext(`Zr=${extracted.bossTemplate};${extracted.loopZone};MONGSE_zoneCombatCleared=${extracted.zoneClear};MONGSE_zoneClearShardReward=${extracted.zoneClearShardReward};MONGSE_unlockZoneEgoRewardV31217=${extracted.unlockReward};`,ctx);
  const arenaRoot={};arenaRoot.window=arenaRoot;
  const arenaCtx=vm.createContext(arenaRoot);
  vm.runInContext(read('assets/rc138/battle-arena.js'),arenaCtx);
  const arena=arenaRoot.__HAPIL_BATTLE_ARENA_RC138__;
  arena.bind({combat:[zone],clear:ctx.MONGSE_zoneCombatCleared});
  ctx.window.__HAPIL_BATTLE_ARENA_RC138__=arena;
  ctx.window.__HAPIL_PERSONA_DUEL_RC134__={swapped:()=>false};
  const nativeClear=ctx.MONGSE_zoneCombatCleared;
  ctx.MONGSE_zoneCombatCleared=function(s,z=s?.zone){return arena.enabled(s)&&z===s.zone?arena.clear(s,z):nativeClear.apply(this,arguments);};
  const Ke=vm.runInContext(`(${extracted.deathHandler})`,ctx);
  const partyStatus={role,enabled,mode:'party'};
  let partyStatusReads=0;
  const party={get state(){return world;},get status(){partyStatusReads++;return partyStatus;}};
  return{ctx,world,stateRef,boss,add,Ke,arena,shards,setCalls,notices,partyStatus,partyStatusReads:()=>partyStatusReads,party,get partyStatusReads(){return partyStatusReads;}};
}

function attachActualRuntime(f,actor){
  let partyRole='host';
  const roster=[{slotId:'p1',heroId:'hwando',name:'Host',kind:'host',control:'host'},{slotId:actor.slotId,heroId:actor.heroId,name:actor.name??'Companion',kind:actor.control==='ai'?'ai':'remote',control:actor.control}];
  const party={actors:[actor],roster,get state(){return f.world;},get status(){return{role:partyRole,enabled:true,mode:'network',paused:false};},configure(){},setNetworkRole(role){partyRole=role;},blocksSave:()=>false,leave(){}};
  const binding={phase:'game',state:f.stateRef,hero:{current:'hwando'},input:{current:new Set()},settings:{current:{combatMode:'manual'}},auto:{current:false},passives:{current:{}},shards:f.shards,partyIds:{current:['hwando']},actions:{}};
  const controls={binding,choice:()=> 'manual',hasHeldLogical:()=>false,effective:()=> 'manual',beforeDeath:()=>false};
  const env=f.ctx.window;env.__HAPIL_PARTY_V31322__=party;env.__HAPIL_CONTROLS_V31329__=controls;env.addEventListener=()=>{};
  const runtime=createRuntime(env);env.__HAPIL_REMOTE_RC222_RUNTIME__=runtime;
  runtime.attach({isHost:true,slotId:'p1',epoch:1,session:{sessionId:'rc223-reward-unit'},roster});
  return{party,binding,controls,runtime};
}

function installNativeOutgoingForKe(f){
  vm.runInContext(read('assets/combat-v31402/combat-core.js'),f.ctx);
  vm.runInContext(read('assets/combat-v31412/outgoing-native.js'),f.ctx);
  const native={};for(const key of f.ctx.window.__HAPIL_OUTGOING_V31402__.dependencies)native[key]=()=>{};
  Object.assign(native,{MONGSE_objectiveDamageAllowedV31309:()=>true,HAPIL_claimCounterWindowV31303:()=>({damageMultiplier:1}),sr:()=>({damageMultiplier:1}),ir:()=>0,HAPIL_effectiveGrowthV31400:value=>value,gr:()=>({powerMultiplier:1,level:0}),MONGSE_infiniteStats:()=>({powerMultiplier:1}),MONGSE_heroOutgoingModeMultiplier31213:()=>1,HAPIL_applyCounterDamageV31303:(_state,target,power)=>{const hpAfter=Math.max(0,target.hp-power);return{hpAfter,appliedDamage:target.hp-hpAfter};},MONGSE_triggerEnemyBreak:()=>{},HAPIL_awardComboMilestoneV31303:()=>{},HAPIL_bindDamageHitV31315:effect=>effect,MONGSE_attachEffectTarget:effect=>effect,MONGSE_beginNarrativeAttack:()=>{},MONGSE_enemyPhase:()=>1,MONGSE_enemyActivePhase:()=>1});
  f.ctx.world.combo=0;f.ctx.world.damageBuffUntil=0;f.ctx.world.counterUntil=0;f.ctx.world.awakeningUntil=0;
  const outgoing=f.ctx.window.__HAPIL_OUTGOING_V31402__.create({P:f.stateRef,R:{current:{}},Re:{current:false},Ke:f.Ke,native});
  return outgoing;
}

function installActualPartyUiSetter(f){
  assert(partyUiSetterNode,'actual RC222 party UI setter guard is located');
  const guard=vm.runInContext(`(${functionSource(partyUiSetterNode,'HAPIL_partyUiSetterRC222')})`,f.ctx);
  f.ctx._=guard(value=>f.setCalls.push(value));
  return guard;
}

function nativePartyApplyStrike(f,actor,outgoing){
  const node=walkFind(ast,n=>n.type==='FunctionDeclaration'&&n.id?.name==='applyStrike');
  assert(node,'actual native PARTY.applyStrike function is located');
  const hits=[];
  const sandbox={initialWorld:f.world,initialActor:actor,initialWindow:f.ctx.window};
  const bridge={damage(...args){const source=args[5],runtime=f.ctx.window.__HAPIL_REMOTE_RC222_RUNTIME__,owned=runtime?.ownOutgoingSource?.(source)??source;hits.push({source:{...source},sourceAfterRuntimeOwnership:{...owned},activeActor:runtime?.activeActor??null,partyOutgoingActor:f.ctx.window.__HAPIL_PARTY_V31322__?.outgoingActor??null});return outgoing(...args);}};
  sandbox.initialBridge=bridge;
  const getter=f.ctx.window.__HAPIL_PARTY_V31322__?.outgoingActor;
  assert.equal(getter,undefined,'fixture begins without an outgoing actor scope');
  const apiGetter='get outgoingActor(){return scopedOutgoingActor;}';
  vm.runInNewContext(`let scopedOutgoingActor=null,bridge=initialBridge;const actors=[initialActor],stats={hits:0},alive=a=>a&&a.hp>0,canTarget=()=>true,window=initialWindow;${functionSource(node,'applyStrike')};globalThis.applyStrikeFixture={applyStrike,api:{${apiGetter}}};`,sandbox);
  const fixture=sandbox.applyStrikeFixture;
  // The production PARTY getter is this actual extracted local scope; expose
  // the same value to the call-through bridge without a runtime transaction.
  Object.defineProperty(f.ctx.window.__HAPIL_PARTY_V31322__,'outgoingActor',{configurable:true,get:()=>fixture.api.outgoingActor});
  return{applyStrike:fixture.applyStrike,fixture,hits,sandbox};
}

// Actual Ke consumes the lethal boss exactly once in an unowned canonical
// state context: the AI/non-RC222 path has no RT actor transaction, so P.current
// remains the host world. This is the preserved baseline failure from candidate
// 42ec5ad, not the ordinary guest-native hit path tested below.
const down=makeFixture({hp:0,role:'host',enabled:true});
down.Ke(down.boss);
eq(down.world.enemies.some(a=>a.id===down.boss.id),false,'actual Ke removes the final boss');
eq(down.world.bossDefeated,true,'actual Ke records the boss-defeated fact');
eq(down.ctx.MONGSE_zoneCombatCleared(down.world),false,'actual RC138 clear remains closed while host HP is zero');
eq(down.world.clues.has('ego-reward-v31217:cult01'),false,'the one-time claim is not written while the host is down');
eq(down.shards.current,11,'no shards are issued before revival');

// Simulate the already-existing Party.tick revive outcome; do not call Ke a
// second time. A true native final clear after that revive is the only payout
// path under test.
down.world.hp=120;
const reconcile=reconcileNode?vm.runInContext(`(${functionSource(reconcileNode,'MONGSE_reconcileHostBossRewardV31217')})`,down.ctx):null;
const baselineReport={
  sourceCommit:require('node:child_process').execFileSync('git',['rev-parse','--short','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
  bundleSha256:crypto.createHash('sha256').update(bundle).digest('hex'),
  context:'unowned-ai-or-host-native-hit; P.current is canonical host world; no RC222 actor transaction',
  actualBossRemoved:true,bossDefeated:down.world.bossDefeated,hpAfterSimulatedPartyRevive:down.world.hp,
  nativeClearAfterRevive:down.ctx.MONGSE_zoneCombatCleared(down.world),reconcileAvailable:!!reconcile,
  recoveryBeforeExplicitRetry:false,shards:down.shards.current,claimWritten:down.world.clues.has('ego-reward-v31217:cult01')
};
console.log('RC223_HOST_DOWN_REWARD_REPRO',JSON.stringify(baselineReport));

if(!reconcile){
  assert.fail('baseline reproduces host-down reward loss: no post-revive retry exists (expected recovery helper missing)');
}
eq(reconcile(down.world,{state:down.world,status:{role:'guest',enabled:true}},down.shards,value=>down.setCalls.push(value),value=>down.notices.push(value)),false,'guest authority cannot claim the host reward');
eq(reconcile(down.world,{state:down.world,status:{role:'offline',enabled:false}},down.shards,value=>down.setCalls.push(value),value=>down.notices.push(value)),false,'offline/solo sessions do not receive a co-op retry');
eq(reconcile(down.world,{state:{...down.world},get status(){throw Error('stale world must return before reading party status');}},down.shards,value=>down.setCalls.push(value),value=>down.notices.push(value)),false,'a replaced/stale world returns before status lookup or shard mutation');
eq(down.shards.current,11,'guest/offline attempts leave the shard ref unchanged');
eq(reconcile(down.world,down.party,down.shards,value=>down.setCalls.push(value),value=>down.notices.push(value)),true,'revived host retries against the real complete-clear gate');
eq(down.partyStatusReads,1,'party status is read only after cheap world/claim guards');
eq(down.shards.current,14,'final boss reward adds the existing three-shard amount exactly once');
eq(down.setCalls.at(-1),14,'existing React shard setter receives the new total');
eq(down.world.clues.has('ego-reward-v31217:cult01'),true,'existing claim marker is the deduplication source');
eq(down.notices.length,1,'the native clear reward notification appears once');
eq(reconcile(down.world,down.party,down.shards,value=>down.setCalls.push(value),value=>down.notices.push(value)),false,'a repeated frame cannot pay the same claim again');
eq(down.partyStatusReads,1,'an already claimed reward returns before rebuilding party status');
eq(down.shards.current,14,'repeated reconciliation does not duplicate shards');
const partyTickAt=bundle.indexOf('window.__HAPIL_PARTY_V31322__?.tick(o, a, HAPIL_heroDeltaRC51');
const reconcileAt=bundle.indexOf('MONGSE_reconcileHostBossRewardV31217(o, window.__HAPIL_PARTY_V31322__, Be, _, B);',partyTickAt);
ok(partyTickAt>=0&&reconcileAt>partyTickAt,'the actual game frame retries after the existing party tick/revive');

// A genuine remote native damage transaction presents the living actor view to
// Ke and RC138 while sharing the canonical enemy roster and claim Set. Existing
// RC222 currency isolation credits the EGO award to p2.rc222Shards; the helper
// sees the shared marker after revival and must not pay host Be a second time.
const guestKill=makeFixture({hp:0,role:'host',enabled:true});guestKill.boss.hp=1;
const guestActor={slotId:'p2',heroId:'seoha',name:'Guest',control:'remote',x:7,y:8,hp:132,maxHp:240};
const guestRuntime=attachActualRuntime(guestKill,guestActor),guestOutgoing=installNativeOutgoingForKe(guestKill);installActualPartyUiSetter(guestKill);
const guestClearEvidence=[];const guestClearBase=guestKill.ctx.MONGSE_zoneCombatCleared;
guestKill.ctx.MONGSE_zoneCombatCleared=function(state,zone=state?.zone){const result=guestClearBase.call(this,state,zone);guestClearEvidence.push({isActorView:state===guestKill.stateRef.current,contextHp:state?.hp,canonicalHostHp:guestKill.world.hp,activeSlot:guestRuntime.runtime.activeActor?.slotId??null,clear:result});return result;};
guestRuntime.runtime.withActor(guestKill.world,guestActor,view=>{
  eq(guestKill.stateRef.current,view,'RC222 temporarily swaps the native P/binding state ref to its actor view');
  eq(view.hp,guestActor.hp,'native Ke sees living guest HP through actorContext');
  guestOutgoing(guestKill.boss,10,'#fff',false,0,null);
  eq(guestKill.shards.current,14,'actual native Ke EGO increment targets the active RC222 shard ref inside withActor');
  eq(guestKill.ctx.window.__HAPIL_REMOTE_RC222_RUNTIME__.activeActor,guestActor,'the runtime owns the active guest transaction through Ke');
});
eq(guestKill.world.hp,0,'canonical host remains down during the guest-owned kill');
eq(guestKill.world.enemies.length,0,'the production outgoing reducer and Ke remove the final boss');
eq(guestKill.world.bossDefeated,true,'the actual native death path records the boss fact');
eq(guestClearEvidence.length,1,'Ke asks the actual RC138 clear predicate once');
eq(guestClearEvidence[0].isActorView,true,'RC138 receives the state view active at the native Ke call');
eq(guestClearEvidence[0].contextHp,guestActor.hp,'RC138 clear sees the living guest actor HP');
eq(guestClearEvidence[0].canonicalHostHp,0,'the same clear check occurs while canonical host HP is zero');
eq(guestClearEvidence[0].activeSlot,'p2','the runtime remains in the p2 transaction during clear');
eq(guestClearEvidence[0].clear,true,'the existing RC138/native clear gate accepts the guest view and shared empty roster');
eq(guestKill.world.clues.has('ego-reward-v31217:cult01'),true,'the guest native kill writes the shared one-time claim');
eq(guestActor.rc222Shards,14,'withActor commits the native +3 to the guest personal shard counter');
eq(guestKill.shards.current,11,'withActor restores the unchanged host Be counter');
eq(guestRuntime.runtime.telemetry().ownedHits,1,'the real reducer records the hit under the active guest transaction');
eq(guestKill.setCalls.length,0,'the actual RC222 setter guard suppresses guest UI writes');
guestKill.world.hp=120;
eq(reconcile(guestKill.world,guestRuntime.party,guestKill.shards,()=>{},()=>{}),false,'host recovery does not replay an already claimed guest-owned reward');
eq(guestKill.shards.current,11,'the helper neither duplicates nor transfers the existing guest claim');
eq(guestActor.rc222Shards,14,'guest remains the original recipient after host revive');

// PARTY.applyStrike is a separate AI/local path: it scopes outgoingActor for
// multipliers but emits no nativeActorRC222 packet. Through the production
// outgoing adapter, that strike keeps P.current on the canonical host; while
// host HP is zero the clear gate rejects, then recovery pays host Be once.
const aiKill=makeFixture({hp:0,role:'host',enabled:true});aiKill.boss.hp=1;
const aiActor={slotId:'story68',heroId:'seoha',name:'Story Companion',control:'ai',x:7,y:8,hp:132,maxHp:240};
const aiRuntime=attachActualRuntime(aiKill,aiActor),aiOutgoing=installNativeOutgoingForKe(aiKill);installActualPartyUiSetter(aiKill);
const aiClearEvidence=[];const aiClearBase=aiKill.ctx.MONGSE_zoneCombatCleared;
aiKill.ctx.MONGSE_zoneCombatCleared=function(state,zone=state?.zone){const result=aiClearBase.call(this,state,zone);aiClearEvidence.push({isCanonicalHost:state===aiKill.world,contextHp:state?.hp,activeSlot:aiRuntime.runtime.activeActor?.slotId??null,clear:result});return result;};
const nativeStrike=nativePartyApplyStrike(aiKill,aiActor,aiOutgoing);
nativeStrike.applyStrike(aiKill.world,{id:1,slotId:'story68',heroId:'seoha',targetId:aiKill.boss.id,zone:aiKill.world.zone,at:aiKill.world.time,power:10,key:'A',color:'#fff'});
eq(nativeStrike.hits.length,1,'extracted production PARTY.applyStrike calls the native outgoing bridge');
eq(nativeStrike.hits[0].partyOutgoingActor,aiActor,'Party outgoingActor scopes the AI actor for its damage multiplier');
eq(nativeStrike.hits[0].activeActor,null,'AI applyStrike runs without an RC222 actor transaction');
eq(nativeStrike.hits[0].source.nativeActorRC222,undefined,'actual applyStrike source has no RC222 ownership marker');
eq(nativeStrike.hits[0].sourceAfterRuntimeOwnership.nativeActorRC222,undefined,'runtime ownership hook leaves unowned AI source canonical');
eq(aiRuntime.runtime.telemetry().ownedHits,0,'runtime does not attribute AI applyStrike as a remote actor hit');
eq(aiKill.world.hp,0,'AI strike occurs while canonical host is down');
eq(aiKill.world.clues.has('ego-reward-v31217:cult01'),false,'canonical host HP gate prevents an early AI claim');
eq(aiKill.shards.current,11,'no host reward is written before revival');
eq(aiClearEvidence.length,1,'actual Ke evaluates RC138 clear for the AI kill');
eq(aiClearEvidence[0].isCanonicalHost,true,'AI applyStrike leaves P.current on the canonical host world');
eq(aiClearEvidence[0].contextHp,0,'AI Ke sees host HP zero');
eq(aiClearEvidence[0].activeSlot,null,'AI Ke has no RC222 transaction owner');
eq(aiClearEvidence[0].clear,false,'actual RC138 clear rejects the canonical down host');
aiKill.world.hp=120;
eq(reconcile(aiKill.world,aiRuntime.party,aiKill.shards,value=>aiKill.setCalls.push(value),()=>{}),true,'post-revive host reconciliation pays the unowned AI/native clear');
eq(aiKill.shards.current,14,'deferred AI reward goes to host Be used by the native save');
eq(aiActor.rc222Shards,undefined,'AI applyStrike creates no remote personal shard balance');
eq(aiKill.world.clues.has('ego-reward-v31217:cult01'),true,'deferred AI award uses the existing shared claim marker');
eq(aiKill.setCalls.length,1,'host React setter updates once for deferred payment');

// All of the native clear gates remain authoritative: being alive and having
// a defeated boss is insufficient while an add remains, the boss fact is
// missing, or the current zone no longer matches the paid claim's zone.
const gated=makeFixture({hp:120,role:'host',enabled:true,withAdd:true,bossDefeated:true});
eq(reconcile(gated.world,gated.party, gated.shards,()=>{},()=>{}),false,'remaining enemies keep the reward gated');
gated.world.enemies=[];gated.world.bossDefeated=false;
eq(reconcile(gated.world,gated.party,gated.shards,()=>{},()=>{}),false,'a missing native boss-defeated fact keeps the reward gated');
gated.world.bossDefeated=true;gated.world.zone='dist01';
eq(reconcile(gated.world,gated.party,gated.shards,()=>{},()=>{}),false,'map travel cannot pay a previous zone reward');
eq(gated.shards.current,11,'all failed native clear gates preserve the shard total');

// Ordinary solo Ke remains the original immediate path; the new host-only
// reconciliation is inert after its existing claim has been recorded.
const solo=makeFixture({hp:120,role:'offline',enabled:false});
solo.Ke(solo.boss);
eq(solo.shards.current,14,'an alive solo final boss retains the existing immediate +3 reward');
eq(solo.world.clues.has('ego-reward-v31217:cult01'),true,'solo uses the same native claim marker');
eq(reconcile(solo.world,solo.party,solo.shards,()=>{},()=>{}),false,'solo is not routed through the co-op retry');

// The base save schema is explicit and no pending-reward world field is added;
// the existing claim in clues and shard total remain its only persisted data.
eq(Object.hasOwn(down.world,'pendingEgoRewardV31217'),false,'the fix adds no unsaved transient reward state');
console.log('RC223_HOST_DOWN_REWARD_UNIT',JSON.stringify({status:'passed',checks,sourceCommit:baselineReport.sourceCommit,bundleSha256:baselineReport.bundleSha256,shardsAwarded:3,claim:'ego-reward-v31217:cult01',remoteGuest:{guestActorShards:guestActor.rc222Shards,hostBe:guestKill.shards.current,sharedClaim:guestKill.world.clues.has('ego-reward-v31217:cult01'),reviveHelperPaid:false},unownedAi:{hostBe:aiKill.shards.current,actorShards:aiActor.rc222Shards??null,sharedClaim:aiKill.world.clues.has('ego-reward-v31217:cult01'),applyStrikeSource:nativeStrike.hits[0].source},baseline:baselineReport}));
