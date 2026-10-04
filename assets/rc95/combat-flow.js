/* RC95: one admission clock for enemy patterns. Committed attacks are never truncated. */
(()=>{'use strict';
 const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const names=['탄환','레이저','혼합'],frames=new WeakMap(),dispatch=new WeakSet();
 const stats={bullets:0,lasers:0,deferred:0,balanced:0};
 const mode=s=>window.__HAPIL_MODES_V31346__?.mode(s)??s?.gameModeV31346??'STORY';
 const protectedActor=a=>!a||a.visualOnly||a.friendly||a.neutral||a.canonAlly||a.canonAllyV31217||a.canonicalAllyV31217||a.protectedObjective||a.objectiveStructureV31238||a.narrativeStructureV31238||a.protectedNarrativeTargetV31307||a.rc88Part||a.echoChildV31368||a.rc89CommandBody;
 function enabled(s){return !!s&&s.hp>0&&!s.practiceV31329&&!s.practicePatternV31365&&!['hub','village'].includes(s.zone);}
 function frame(s){let f=frames.get(s);const t=n(s?.time);if(!f||f.zone!==s.zone||t<f.at){
   const saved=s.rc95CombatFlow,valid=saved?.version===1&&saved.zone===s.zone&&Number.isFinite(saved.startedAt)&&saved.startedAt<=t&&t-saved.startedAt<86400;
   f={version:1,zone:s.zone,startedAt:valid?saved.startedAt:t,at:t,nextBullet:0,nextLaser:0,cursor:0};frames.set(s,f);
  }f.at=t;s.rc95CombatFlow={version:1,zone:f.zone,startedAt:f.startedAt};return f;}
 function phase(s){const authored=window.__HAPIL_DANMAKU_RC129__?.phase(s);if(authored)return authored;const f=frame(s),elapsed=Math.max(0,n(s.time)-f.startedAt),index=Math.floor(elapsed/6)%3;return{index,name:names[index],elapsed:elapsed%6,remaining:6-elapsed%6,cycle:Math.floor(elapsed/18)};}
 const managed=(s,a)=>enabled(s)&&!protectedActor(a)&&!!window.__HAPIL_LASERS_V31330__?.ranks?.has(a.id);
 const laser=p=>!!(p?.laserV31330||p?.laserV31331||p?.bloodV31516||p?.shape==='line'||p?.bossFinaleV31334&&p?.finaleKindV31334!=='rain');
 function allowed(s,kind){if(!enabled(s)||!(s.enemies??[]).some(a=>a.hp>0&&!protectedActor(a)&&window.__HAPIL_LASERS_V31330__?.ranks?.has(a.id)))return true;const state=phase(s);if(state.draining)return false;const p=state.index;return kind==='laser'?p!==0:kind==='bullet'?p!==1:p===2;}
 function executing(s){return dispatch.has(s);}
 function reset(s){if(!s)return;frames.delete(s);delete s.rc95CombatFlow;}
 function run(s,fn){dispatch.add(s);try{return fn();}finally{dispatch.delete(s);}}
 function admit(s,a,kind){if(!enabled(s))return true;if(window.__HAPIL_DANMAKU_RC129__?.admission(s,a)===false||!allowed(s,kind)||managed(s,a)&&!executing(s)){stats.deferred++;return false;}return true;}
 function laserReadyAt(s,end){if(!enabled(s)||window.__HAPIL_DANMAKU_RC129__?.phase(s))return end+4.2;const f=frame(s),start=f.startedAt,block=Math.floor((end-start)/6),index=block%3;return Math.max(end,index===0?start+(block+1)*6:end);}
 function rank(a){return a.boss?(a.sevenSinsEpisodeBoss||n(a.phaseCount)>=4?'episode':'boss'):a.midboss?'midboss':a.elite||a.eliteName?'elite':'normal';}
 const targets=Object.freeze({normal:1.0,elite:3.2,midboss:22,boss:46,episode:60});
 function estimate(s,raw,h,api){
  const g=api.growth(raw,s),master=api.mastery(h.id,n(raw['heroMastery_'+h.id])),basic=api.basic(clamp(n(g.attack),0,12)),infinite=api.infinite(raw);
  const chain=basic.strikeCount===1?1:basic.strikeCount===2?1.68:2.18;
  let dps=60*basic.powerMultiplier*chain*1.13*(h.id==='gunner'?.72:1)/(.36*master.cooldownMultiplier);
  for(const [level,index,power,period] of [[5,0,24,4],[7,1,16,7],[9,2,28,6],[12,3,62,11]])if(n(g.attack)>=level)dps+=power*api.skill(g,index).damageMultiplier/(.36*master.cooldownMultiplier*period);
  for(let i=0;i<4;i++){const skill=h.skills[i];if(!skill||!['damage','ultimate','dash'].includes(skill.kind))continue;const q=api.skill(g,i),power=skill.kind==='ultimate'?api.ultimate(h.id,false):i===1?108:i===2&&skill.kind==='dash'?64:92;
   dps+=power*q.damageMultiplier*1.12/Math.max(.25,skill.cooldown*(1-clamp(n(raw.cooldown),0,3)*.05)*q.cooldownMultiplier*master.cooldownMultiplier*infinite.cooldownMultiplier);
  }
  return Math.max(1,dps*(1+clamp(n(raw.damage),0,3)*.12)*master.powerMultiplier*infinite.powerMultiplier*1.18);
 }
 function balance(s,raw,api){if(!enabled(s)||!api?.heroes?.length||window.__HAPIL_PARTY_V31322__?.blocksSave?.())return;
  const hero=api.heroes.find(h=>h.id===s.activeHeroId)??api.heroes[0],progress=clamp(n(api.order(s.zone))/57,0,1),base=estimate(s,{},hero,api),actual=estimate(s,raw??{},hero,api);
  const policy=window.__HAPIL_RUN_V31400__?.get(s),humans=clamp(n(policy?.humanPlayers,1),1,8),ais=policy?.aiEnabled?Math.min(6,policy.aiHeroes?.length||1):0;
  const narrative=mode(s)==='STORY'?.25:0,party=1+(humans-1)*.70+ais*.40+narrative;
  const reference=base*(1+progress*2.2),model=reference*Math.pow(actual/reference,.78)*party;
  const inner=window.__HAPIL_INNER_FINAL_RC133__,bounded=inner?.active(s)?inner.boss(s):null;
  // The inner persona already owns a bounded, growth-derived health model.
  // Generic encounter calibration must not overwrite that actor's health.
  for(const a of s.enemies??[]){if(a===bounded||protectedActor(a)||a.id==='c104-boss'||a.hp<=0||a.temporarySummonV31368||a.rc95Balance?.version===1)continue;
   const r=rank(a),old=Math.max(1,n(a.maxHp,1)),fraction=clamp(n(a.hp)/old,0,1),seconds=targets[r]*(1+progress*.25)*(mode(s)==='HELL'?1.12:mode(s)==='DREAM'?1.04:1);
   const target=model*seconds,newMax=Math.round(clamp(old,target*.85,target*1.45));
   a.bossHpScaledV31230=true;a.maxHp=Math.max(1,newMax);a.hp=Math.max(1,Math.round(a.maxHp*fraction));a.rc95Balance={version:1,rank:r,originalMax:old,max:a.maxHp,playerDps:actual,referenceDps:reference,party,seconds};stats.balanced++;
  }
 }
 function tick(s,api,delta=.1){if(!enabled(s))return;const P=window.__HAPIL_PARTY_V31322__;if(P?.state===s&&(P.status.role==='guest'||P.status.paused||P.status.disconnected))return;
  const director=window.__HAPIL_DANMAKU_RC129__;director?.beforeTick(s,api,delta);
  const choice=window.__HAPIL_CHOICE_RC97__;choice?.beforeTick(s,api,delta);if(api.locked(s)||s.paused||s.pause||n(s.timeStopUntil)>s.time||n(s.enemySkillsSuppressedUntilV31309)>s.time)return;
  const f=frame(s),p=phase(s),owners=(s.enemies??[]).filter(a=>managed(s,a)&&a.hp>0&&n(a.phaseTransitionUntil)<=s.time&&n(a.invulnerableUntil)<=s.time&&n(a.combatEntryGraceUntilV31239)<=s.time&&n(a.staggerUntil)<=s.time);
  if(!owners.length||p.draining)return;for(const a of owners)a.shmupPatternPlanV31365={family:'rc95-'+p.name,phase:p.index+1,label:p.title??p.name,announcedAt:s.time};
  if(p.index!==0&&s.time>=f.nextLaser&&!(s.bossLaserCastsV31330??[]).some(c=>c.endAt>s.time)&&!window.__HAPIL_BOSSES_V31334__?.busy(s)){
   for(let i=0;i<owners.length;i++){const a=owners[(f.cursor+i)%owners.length];if(n(a.atomicCastUntil31210)>s.time||n(a.recoverUntil)>s.time||!window.__HAPIL_BLOOD_RC16__?.canStart(s,a))continue;
    const cards=api.patterns(a,api.phase(a)).filter(p=>p.bloodV31516),card=choice?.selectCard(s,a,cards,p)??cards[n(a.rc95LaserCycle)%Math.max(1,cards.length)];if(!card)continue;
    const c=run(s,()=>api.cast(s,a,card,api.phase(a)));if(c?.laserV31330){choice?.prepareLaser(s,a,c,p);director?.card(s,a,card,c);a.rc95LaserCycle=n(a.rc95LaserCycle)+1;f.nextLaser=c.endAt+(window.__HAPIL_POLICY_RC127__?.interval(s,a,.35)??.35);f.cursor=(f.cursor+i+1)%owners.length;stats.lasers++;break;}
   }
  }
  if(p.index===1||s.time<f.nextBullet)return;
  const cap=window.innerWidth<800?40:56;if((s.hostileProjectiles??[]).length>=cap)return;
  const a=choice?.lead(s,owners)??owners[f.cursor++%owners.length];if(p.index!==2&&(n(a.atomicCastUntil31210)>s.time||n(a.recoverUntil)>s.time))return;
  const count=a.boss?7:5,cycle=n(a.rc95BulletCycle),aim=Math.atan2(s.y-a.y,s.x-a.x),spread=p.index===2?.95:1.4,speed=mode(s)==='HELL'?6.8:5.5;
  const shots=Math.min(count,cap-(s.hostileProjectiles??[]).length);
  const authored=director?.volley(s,a,p,shots)??choice?.volley(s,a,p,shots);
  const rc126Before=(s.hostileProjectiles??[]).length;
  run(s,()=>{for(let i=0;i<(authored?.length??shots);i++){const angle=cycle%3===2?aim+(i-(shots-1)/2)*.36:aim+(shots===1?0:i/(shots-1)-.5)*spread+(cycle%3===1?.22:0);const before=(s.hostileProjectiles??[]).length,spec=authored?.[i]??{vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,radius:.28,damage:a.boss?(p.index===2?12:10):(p.index===2?10:8),curve:0,homingMode31212:'none',frozenUntil:s.time,life:6,patternKind:'rc95-volley',label:a.name+' · '+names[p.index],status:'none'};api.bullet(s,a,spec);for(const q of (s.hostileProjectiles??[]).slice(before)){for(const key of ['frozenUntil','telegraphUntil31210','motionReleaseAt31219','collisionDisabledUntil31219','collisionDisabledUntilV31226'])q[key]=s.time;q.hideUntilRelease31219=false;q.bodySpawned31219=true;q.rc95Bullet=true;q.heavyBossSkill=false;if(spec.rc97Grammar){q.rc97Grammar=spec.rc97Grammar;q.scatterHomingPrepared31211=true;}director?.markShot(s,q,spec);}}});
  const newShots=(s.hostileProjectiles??[]).slice(rc126Before);
  const rc126Volley=window.__HAPIL_COMBAT_SAFETY_RC126__?.prepareVolley(s,a,newShots,{rhythm:true});
  director?.prepareVolley(s,newShots,rc126Volley);
  const planned=authored?.length??shots;if(planned){a.rc95BulletCycle=cycle+1;f.nextBullet=window.__HAPIL_POLICY_RC127__?.deadline(s,a,Math.max(s.time+(p.index===2?1.25:.72),(rc126Volley?.lastRelease??s.time)+.16))??Math.max(s.time+(p.index===2?1.25:.72),(rc126Volley?.lastRelease??s.time)+.16);stats.bullets+=planned;}else f.nextBullet=s.time+.2;
 }
 function snapshot(s){return{...phase(s),admissionOnly:true,stats:{...stats}};}
 window.__HAPIL_COMBAT_FLOW_RC95__=Object.freeze({installed:true,version:'RC95',enabled,frame,phase,managed,allowed,admit,laser,executing,run,reset,laserReadyAt,rank,targets,estimate,balance,tick,snapshot});
})();
