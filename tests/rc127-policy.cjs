'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const window={};window.window=window;const context=vm.createContext({window,console});
for(const p of ['assets/rc127/combat-policy.js','assets/combat-v31412/skill-completion.js'])vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p});
const P=window.__HAPIL_POLICY_RC127__,C=window.__HAPIL_SKILL_COMPLETION_V31412__;let checks=0;
function check(ok,label){assert.ok(ok,label);checks++;}
const close=(a,b)=>Math.abs(a-b)<1e-8;
check(close(P.fixedSpeed,4.75*1.21*1.126),'777 reference finite mastery formula');
for(const mode of ['STORY','HELL','DREAM'])for(const level of [0,1,3,999999999])for(const aw of [false,true])for(const accelerated of [false,true]){
 const s={gameModeV31346:mode};check(close(P.speed(s,{speed:level,infiniteSpeed:level},{mastery:level,awakened:aw,awakeningMultiplier:1.276,accelerated,accelerationMultiplier:1.32}),P.fixedSpeed),'fixed ordinary movement all progression states');
 check(s.rc127Defense.incoming>=.25&&s.rc127Defense.incoming<=1,'bounded finite damage conversion');
}
check(P.defense({},{}) .incoming===1,'zero growth no free defense');
check(close(P.defense({speed:1},{}).incoming,.93),'former 7 percent speed becomes 7 percent damage reduction');
check(close(P.defense({speed:3},{mastery:7}).incoming,.79*.874),'finite mastery defenses multiply instead of add to invulnerability');
check(P.defense({speed:3,infiniteSpeed:1e20},{mastery:7,awakened:true,awakeningMultiplier:99,accelerated:true,accelerationMultiplier:99}).incoming>=.25,'hard cap at 75 percent conversion');
check(Number.isFinite(P.defense({speed:NaN,infiniteSpeed:Infinity},{mastery:NaN}).incoming),'malformed save cannot poison damage');
const protectedState={rc127Defense:{incoming:.4}};check(P.incoming(protectedState,{sourceId:'boss'})===.4,'hostile packet defense');check(P.incoming(protectedState,{selfDamage:true})===1,'do not reduce self costs');
for(const mode of ['STORY','HELL','DREAM'])for(const boss of [false,true]){
 const s={time:10,fxSerial:1,gameModeV31346:mode},a={id:'boss',boss,readyAt:0,patternReadyAt:0,recoverUntil:0},hit={at:12,endAt:14,releaseAt:11.5};
 P.schedule(s,a,()=>{s.fxSerial++;a.readyAt=16;a.patternReadyAt=18;a.recoverUntil=15;a.atomicCastUntil31210=14;return hit;});
 const m=mode==='STORY'&&boss?2:1;
 check(a.readyAt===10+6*m&&a.patternReadyAt===10+8*m&&a.recoverUntil===10+5*m,'only story boss admission deadlines double');
 check(hit.at===12&&hit.endAt===14&&hit.releaseAt===11.5&&a.atomicCastUntil31210===14,'windup, release and active lifetime unchanged');
}
{
 const s={time:20,fxSerial:1,gameModeV31346:'STORY'},a={id:'nested',boss:true,readyAt:0};
 P.schedule(s,a,()=>P.schedule(s,a,()=>{s.fxSerial++;a.readyAt=25;return true;}));check(a.readyAt===30,'nested dispatch cannot quadruple cooldown');
 const before=a.readyAt;P.schedule(s,a,()=>null);check(a.readyAt===before,'rejected scheduling does not extend deadline');
 assert.throws(()=>P.schedule(s,a,()=>{throw Error('fixture');}));checks++;s.time=31;P.schedule(s,a,()=>{s.fxSerial++;a.readyAt=38;return true;});check(a.readyAt===45,'thrown dispatch releases transaction lock after prior cooldown expires');
}
for(const kind of ['narrativeCasts','telekineticCasts','spatialRiftCasts','bossUltimateCastsV31334','cosmicCastsV31318','bossLaserCastsV31330','pendingHits','impactQueue','hostileProjectiles']){
 const a={id:'cosmic',hp:100,currentPhase:1},s={time:10,enemies:[a]};s[kind]=[{id:991,sourceId:'cosmic',endAt:14,at:13,interruptProtectedUntil31210:14.5}];
 check(C.castUntil(s,a)===14.5,'owner identity + full lifetime '+kind);C.observe(s);a.staggerUntil=11;check(C.protectEnemyStagger(s,a),'committed stagger protection '+kind);check(C.blockReset(a),'committed reset protection '+kind);
 a.hp=0;check(!C.enemyCastActive(s,a),'death ends protection '+kind);
}
{
 const a={id:'cosmic',hp:100},s={time:10,enemies:[a],cosmicCastsV31318:[{id:'cosmic',sourceId:'different-owner',endAt:14}]};check(C.castUntil(s,a)===0,'cast id cannot impersonate owner');
 s.pendingHits=[{id:88,sourceId:'cosmic',at:18,damageSuppressedV31226:true}];check(C.castUntil(s,a)===0,'removed damage cannot pin a boss');
}
const code=fs.readFileSync('assets/index-v31526.js','utf8');check(code.includes('/* RC127_RUNTIME_INSTALLED */'),'runtime integrated');check(code.includes('window.__HAPIL_POLICY_RC127__.speed(o,R.current'),'actual movement hook');check(code.includes('__HAPIL_POLICY_RC127__?.incoming(e,MONGSE_damageSource)'),'actual final damage hook');check(!code.includes('const cancelled=!eligible(s,a)||phase(a)!==run.phase||run.zone!==s.zone||suppress(s);'),'no phase-only committed volley deletion');check(code.includes('packet.interruptProtectedUntil31210=Math.max'),'delayed cosmic packets remain protected');
console.log(JSON.stringify({version:'RC127',checks,passed:true,scope:'policy, source integration and committed ownership unit tests',policy:P.snapshot()},null,2));
