/* HAPIL v3.14.07: facts, not new combat rules. Native targeting/heal/cooldown
 * remain authoritative. No HP, movement, RNG or persistent state is mutated here. */
(function(root){'use strict';
 const n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d;
 const live=a=>!!a&&n(a.hp)>0&&n(a.maxHp)>0&&Number.isFinite(a.x)&&Number.isFinite(a.y);
 const after=(t,now)=>typeof t==='number'&&t>now;
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const ratio=a=>Math.max(0,Math.min(1,n(a.hp)/Math.max(1,n(a.maxHp,1))));
 const memories=new WeakMap(),windows=new WeakMap(),LIMIT=128;let builds=0;
 function validEnemy(s,e){return live(e)&&!e.visualOnly&&!e.friendly&&!e.protectedNarrativeTargetV31307&&!e.phaseTransitionActive&&!after(e.invulnerableUntil,s.time);}
 function threat(s,q){
  if(!q||!Number.isFinite(q.damage)||q.damage<=0||q.friendly||q.reflected||q.visualOnly||q.heroSkillVfx||q.cancelled||q.damageSuppressedV31226||q.parriedV31356||q.parriedV31363)return false;
  if(after(q.frozenUntil,s.time)||after(q.collisionDisabledUntil31219,s.time)||after(q.collisionDisabledUntilV31226,s.time))return false;
  const p=root.__HAPIL_PROJECTILE_PIPELINE_V31402__;
  return !!p&&p.contactEnabled(q,s.time);
 }

 // Observed native W results only. Never infer crowd-control from its name or EGO.
 // Entries are per world AND actor; contain bounded references, never serialized.
 function captureCast(s,a,key){
  const hero=a===s?s?.activeHeroId:a?.heroId;
  if(!s||!live(a)||hero!=='seoha'||key!=='W'||!Number.isFinite(s.time))return null;
  return {world:s,actor:a,zone:s.zone,hero,time:s.time,
   enemies:a===s?(s.enemies??[]).filter(e=>validEnemy(s,e)).map(e=>({e,ready:n(e.readyAt),impact:n(e.attackImpactAt),attack:n(e.attackAt)})):[],
   bullets:a!==s?(s.hostileProjectiles??[]).filter(q=>threat(s,q)&&dist(a,q)<7).slice(0,32).map(q=>({q,frozen:n(q.frozenUntil)})):[]};
 }
 function completeCast(s,a,key,before){
  if(!before||key!=='W'||before.world!==s||before.actor!==a||before.zone!==s.zone||before.time!==s.time||before.hero!==(a===s?s.activeHeroId:a.heroId))return;
  const entries=[];
  for(const r of before.enemies){
   if(!validEnemy(s,r.e)||!(s.enemies??[]).includes(r.e))continue;
   const times=[];
   if(n(r.e.readyAt)>Math.max(s.time,r.ready)+1e-8)times.push(n(r.e.readyAt));
   if(n(r.e.attackAt)>Math.max(s.time,r.attack)+1e-8&&n(r.e.attackImpactAt)>Math.max(s.time,r.impact)+1e-8)times.push(n(r.e.attackImpactAt));
   if(times.length)entries.push({kind:'enemy',object:r.e,until:Math.min(...times),ready:n(r.e.readyAt),impact:n(r.e.attackImpactAt),castStarted:n(r.e.attackStarted),phase:r.e.currentPhase});
  }
  for(const r of before.bullets)if(n(r.q.frozenUntil)>Math.max(s.time,r.frozen)+1e-8)entries.push({kind:'bullet',object:r.q,until:n(r.q.frozenUntil)});
  let actors=windows.get(s);if(!actors){actors=new WeakMap();windows.set(s,actors);}
  actors.set(a,{zone:s.zone,hero:before.hero,started:s.time,entries:entries.slice(0,128)});
 }
 function observedWindow(s,a,target){
  const r=windows.get(s)?.get(a),hero=a===s?s.activeHeroId:a.heroId;
  if(!r)return {active:false,until:0,kind:null};
  if(r.zone!==s.zone||r.hero!==hero||s.time<r.started){windows.get(s)?.delete(a);return {active:false,until:0,kind:null};}
  let until=0,kind=null;
  for(const e of r.entries){
   if(e.until<=s.time)continue;
   if(e.kind==='enemy'){
    if(e.object!==target||!validEnemy(s,e.object)||(s.enemies??[]).indexOf(e.object)<0||n(e.object.attackStarted)!==e.castStarted||e.object.currentPhase!==e.phase)continue;
    // A fresh cast/reset can shorten the native timers: do not keep an obsolete window.
    const nativeUntil=Math.max(n(e.object.readyAt),n(e.object.attackImpactAt));
    if(nativeUntil<=s.time)continue;until=Math.max(until,Math.min(e.until,nativeUntil));kind='enemy-delay';
   }else{
    const q=e.object,p=root.__HAPIL_PROJECTILE_PIPELINE_V31402__;
    if(!(s.hostileProjectiles??[]).includes(q)||!p?.visible(q,s.time)||q.cancelled||q.damageSuppressedV31226||q.reflected||q.friendly||q.visualOnly||n(q.damage)<=0||dist(a,q)>=7||n(q.frozenUntil)<=s.time)continue;
    until=Math.max(until,Math.min(e.until,n(q.frozenUntil)));kind='local-projectile-delay';
   }
  }
  return {active:until>s.time,until,kind};
 }
 function build(s,a,options={}){
  if(!s||!live(a)||!Number.isFinite(s.time))return Object.freeze({targets:0,locked:true,ready:Object.freeze({})});
  const range=Math.max(0,n(options.range)),has=typeof options.allowed==='function'?options.allowed:()=>true;
  const enemies=(Array.isArray(options.enemies)?options.enemies:s.enemies??[]).filter(e=>validEnemy(s,e)&&dist(a,e)<=range&&has(e));
  // Sort a copy. Never let source array order silently choose the attack axis.
  const chosen=options.targetId??(a===s?s.targetEnemyId:a.targetEnemyId);
  enemies.sort((x,y)=>Number(y.id===chosen)-Number(x.id===chosen)||dist(a,x)-dist(a,y)||String(x.id??'').localeCompare(String(y.id??'')));
  const target=enemies[0]??null,dx=target?target.x-a.x:0,dy=target?target.y-a.y:0,length=Math.hypot(dx,dy);
  const aligned=length>1e-8?enemies.filter(e=>{const x=e.x-a.x,y=e.y-a.y;return x*dx+y*dy>0&&Math.abs(x*dy-y*dx)/length<=1.25;}).length:0;
  let activeThreats=0;
  if(!after(s.timeStopUntil,s.time))for(const q of s.hostileProjectiles??[])if(threat(s,q)&&dist(a,q)<6)activeThreats++;
  const allyRows=[...new Set(options.allies??[])].filter(t=>t!==a&&live(t)&&!t.visualOnly);
  const blocked=t=>after(s.heroHealingBlockedUntil,s.time)||after(t.heroHealingBlockedUntil,s.time);
  const eligible=allyRows.filter(t=>!blocked(t));
  // The existing host Q/guard heals self only. Companion Q heals within 7;
  // companion R heals every living ally. Do not invent shared heal capability.
  const companion=a!==s;
  const localHeals=companion?eligible.filter(t=>dist(a,t)<7):[];
  const globalHeals=companion?eligible:[];
  const low=rows=>Math.min(1,...rows.map(ratio));
  const ready=Object.fromEntries(['Q','W','E','R','G','Collab'].map(k=>[k,options.ready?.[k]===true]));
  const laserRisk=Math.max(0,n(options.laserRisk));
  const statuses=['slowUntil','statusLockedUntil','blindUntil','silenceUntil','burnUntil','bleedUntil','heroHealingBlockedUntil'];
  const realSlow=after(a.heroSlowUntil,s.time),window=observedWindow(s,a,target);
  const casting=!!target&&after(target.attackAt,s.time)&&after(target.attackImpactAt,s.time);
  const castRemaining=casting?target.attackImpactAt-s.time:null;
  const hero=a===s?s.activeHeroId:a.heroId,loop=root.__HAPIL_LOOP_V31365__;
  const memory=hero==='gunner'&&a===s?loop?.snapshot(s):null;
  const memoryCycle=Number.isInteger(memory?.memoryShotCount)?Math.max(0,memory.memoryShotCount):null;
  const activeDelay=window.active||after(s.timeStopUntil,s.time);
  // Gunner host W heals self; companion W grants guard only. Neither clears debuffs.
  const sustainW=hero==='gunner'?a===s:null;
  // These are native state observations, not new marks, damage or cooldowns.
  // Lauren's native R executes only a non-boss below its level-dependent HP
  // threshold; .28 is the conservative threshold at level zero.
  const targetHpRatio=target?ratio(target):null;
  const targetStaggerRatio=target&&n(target.maxStagger)>0
   ?Math.max(0,Math.min(1,n(target.stagger)/target.maxStagger)):null;

  const facts={targets:enemies.length,targetId:target?.id??null,distance:target?dist(a,target):null,range,aligned,
   hpRatio:ratio(a),allyHpRatio:low(allyRows),healHpRatio:blocked(a)?1:ratio(a),allyHealHpRatio:low(localHeals),globalAllyHealHpRatio:low(globalHeals),
   healingBlocked:blocked(a),healableNearbyAllies:localHeals.filter(t=>ratio(t)<.82).length,healableGlobalAllies:globalHeals.filter(t=>ratio(t)<.6).length,
   companion,protected:after(a.invulnerableUntil,s.time+.15),
   activeThreats,laserRisk,dense:activeThreats>=5||laserRisk>1.5,
   awake:after(a.awakeningUntil,s.time),temporal:after(s.timeStopUntil,s.time)||after(a.timeAccelerationUntil,s.time),
   temporalWindow:activeDelay,temporalUntil:Math.max(window.until,n(s.timeStopUntil)),temporalKind:window.kind,
   targetCasting:casting,targetCastRemaining:castRemaining,slowActive:realSlow,
   wCanHealSelf:sustainW,wCanCleanse:hero==='gunner'?false:null,memoryShotCount:memoryCycle,
   memoryEchoNext:hero==='gunner'&&a===s&&after(a.awakeningUntil,s.time)&&memoryCycle!==null&&(memoryCycle%3)===2,

   targetHpRatio,targetStaggerRatio,targetIsBoss:!!target&&!!target.boss,
   guaranteedLaurenExecute:!!target&&!target.boss&&targetHpRatio<=.28,
   damageBuffActive:after(a.damageBuffUntil,s.time),
   weakened:!!target&&(ratio(target)<.35||n(target.maxStagger)>0&&n(target.stagger)/target.maxStagger>.7),
   vulnerable:!!target&&(after(target.recoverUntil,s.time)||after(target.staggerUntil,s.time)),
   boss:!!target&&(!!target.boss||!!target.midboss),status:statuses.some(k=>after(a[k],s.time)),ready:Object.freeze(ready),locked:options.locked===true};
  builds++;return Object.freeze(facts);
 }
 function memory(s){let m=memories.get(s);if(!m||m.zone!==s.zone||m.hero!==s.activeHeroId||s.time<m.at){m={zone:s.zone,hero:s.activeHeroId,at:s.time,events:[],serial:0};memories.set(s,m);}m.at=s.time;return m;}
 function record(s,a,decision={}){
  if(!s||!a||!Number.isFinite(s.time))return;
  const m=memory(s),f=decision.facts;
  const evidence=f?{targetId:f.targetId,distance:f.distance,targets:f.targets,aligned:f.aligned,activeThreats:f.activeThreats,laserRisk:f.laserRisk,
   hpRatio:f.hpRatio,healHpRatio:f.healHpRatio,allyHealHpRatio:f.allyHealHpRatio,globalAllyHealHpRatio:f.globalAllyHealHpRatio,
   healingBlocked:f.healingBlocked,protected:f.protected,vulnerable:f.vulnerable,
   temporalWindow:f.temporalWindow,temporalUntil:f.temporalUntil,temporalKind:f.temporalKind,
   targetCasting:f.targetCasting,targetCastRemaining:f.targetCastRemaining,wCanHealSelf:f.wCanHealSelf,wCanCleanse:f.wCanCleanse,
   memoryEchoNext:f.memoryEchoNext,memoryShotCount:f.memoryShotCount,
   targetHpRatio:f.targetHpRatio,targetStaggerRatio:f.targetStaggerRatio,targetIsBoss:f.targetIsBoss,
   guaranteedLaurenExecute:f.guaranteedLaurenExecute,damageBuffActive:f.damageBuffActive}:null;
  const row=Object.freeze({sequence:++m.serial,time:s.time,zone:s.zone,heroId:a===s?s.activeHeroId:a.heroId,slot:a===s?'host':String(a.slotId??'ai'),
   status:decision.status==='cast'?'cast':decision.status==='rejected'?'rejected':'requested',key:String(decision.key??''),reason:String(decision.reason??'').slice(0,120),
   targetId:decision.targetId??f?.targetId??null,evidence:evidence?Object.freeze(evidence):null});
  m.events.push(row);if(m.events.length>LIMIT)m.events.shift();
 }
 function snapshot(s){const m=s&&memories.get(s);return {version:'3.14.08-RC1',maxEvents:LIMIT,builds,events:m?m.events.map(r=>({...r,evidence:r.evidence?{...r.evidence}:null})):[]};}
 const api=Object.freeze({version:'3.14.08-RC1',installed:true,captureCast,completeCast,observedWindow,build,threat,validEnemy,record,snapshot,maxEvents:LIMIT});
 root.__HAPIL_TACTICS_V31407__=api;root.__HAPIL_TACTICS_V31408__=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
