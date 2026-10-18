/* RC225: position-led basic fire, short resonance countershots and a native
 * one-at-a-time interlude between the midboss and the existing boss wave.
 * Damage, EGO, D resources, wave numbers and checkpoint fields stay native.
 */
(function(root){'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),finite=(v,d=0)=>Number.isFinite(v)?v:d;
 const focusByWorld=new WeakMap(),parryByWorld=new WeakMap(),packsByWorld=new WeakMap();
 const SHOTS=Object.freeze({hwando:'blade-fan',seoha:'time-orb',rian:'ricochet-cross',ion:'piercing-lance',neon:'glitch-wave',michaela:'winged-bolt',lauren:'sigil-spear',hunter:'triple-needle',slayer:'fan-blade',gunner:'rapid-fire'});
 const metrics={installed:false,focusedVolleys:0,parryContacts:0,resonanceShots:0,interludesStarted:0,interludeActors:0,interludesCompleted:0,interludesSkipped:0};
 let actorSerial=0,installedLoop=null,installedDefense=null,installedFlow=null;
 function mode(s){const controls=root.__HAPIL_CONTROLS_V31329__,valid=value=>['manual','semi','full'].includes(value);try{const selected=controls?.effective?.();if(valid(selected))return selected;}catch{}try{const selected=controls?.effective?.(s);if(valid(selected))return selected;}catch{}return valid(s?.combatModeV31329)?s.combatModeV31329:'manual';}
 function clearFocus(s){focusByWorld.delete(s);}
 function focus(s,target){
  if(!s||mode(s)==='full'||!target||target.hp<=0){clearFocus(s);return 0;}
  const dx=target.x-s.x,dy=target.y-s.y,distance=Math.hypot(dx,dy),speed=Math.hypot(finite(s.moveVx),finite(s.moveVy)),angle=Math.atan2(dy,dx),across=dx-dy;
  // Hold a readable firing lane at range. Repositioning or changing target/angle
  // resets the small bonus; full auto remains its own untouched option.
  if(distance<5.5||distance>25||speed>.55||across<3){clearFocus(s);return 0;}
  const previous=focusByWorld.get(s),same=previous?.zone===s.zone&&previous.hero===s.activeHeroId&&previous.target===target.id&&s.time>=previous.at&&Math.abs(previous.x-s.x)+Math.abs(previous.y-s.y)<.5&&Math.abs(Math.atan2(Math.sin(angle-previous.angle),Math.cos(angle-previous.angle)))<.28;
  const held=same?Math.min(.9,previous.held+clamp(s.time-previous.at,0,.48)):0;
  focusByWorld.set(s,{zone:s.zone,hero:s.activeHeroId,target:target.id,at:s.time,x:s.x,y:s.y,angle,held});
  return .08*clamp((held-.15)/.55,0,1);
 }
 function contacts(api){return finite(api?.metrics?.()?.contacts);}
 function grantCountershot(s,before,after){
  const count=Math.max(0,Math.floor(after-before));if(!count||!s||s.hp<=0)return false;
  let row=parryByWorld.get(s);if(!row||row.zone!==s.zone||row.hero!==s.activeHeroId||s.time<row.at){row={zone:s.zone,hero:s.activeHeroId,charges:0,until:0,at:s.time,lastCue:-1e9};}
  row.at=s.time;row.until=s.time+3;row.charges=Math.min(2,row.charges+count);parryByWorld.set(s,row);metrics.parryContacts+=count;
  if(s.time-row.lastCue>.6){(s.floatTexts??=[]).push({id:s.fxSerial++,x:s.x,y:s.y,born:s.time,duration:.55,text:'공명 탄환',color:'#aafff0'});row.lastCue=s.time;}
  return true;
 }
 function wrapDefense(){
  const api=root.__HAPIL_DEFENSE_V31356__;if(!api||api===installedDefense||api.rc225Wrapped)return !!api;
  const wrap=name=>typeof api[name]!=='function'?api[name]:function(...args){const s=args[0],actor=name==='tryParry'?(args[2]??s):(args[1]??s),before=contacts(api),result=api[name](...args),after=contacts(api);if(actor===s&&(result===true||name==='credit'&&result!==false))grantCountershot(s,before,after);return result;};
  const next={...api,tryParry:wrap('tryParry'),blockDamage:wrap('blockDamage'),credit:wrap('credit')};Object.defineProperty(next,'rc225Wrapped',{value:true});
  root.__HAPIL_DEFENSE_V31356__=root.__HAPIL_CHANNEL_V31364__=Object.freeze(next);installedDefense=root.__HAPIL_DEFENSE_V31356__;return true;
 }
 function wrapLoop(){
  const api=root.__HAPIL_LOOP_V31365__;if(!api||api===installedLoop||api.rc225Wrapped)return !!api;
  const base=api.decorateAttack;const next={...api,decorateAttack(s,before){if(typeof base==='function')base.call(api,s,before);const rows=(s?.pendingStrikes??[]).filter(row=>!before?.has?.(row)&&row.actionKey==='A'&&row.shmupEchoV31365!==true);if(!rows.length)return;
    const targetId=rows[0].targetId,target=(s.enemies??[]).find(a=>a.id===targetId&&a.hp>0),bonus=focus(s,target);let token=parryByWorld.get(s);if(token&&(token.zone!==s.zone||token.hero!==s.activeHeroId||s.time>token.until)) {parryByWorld.delete(s);token=null;}
    const counter=!!token&&token.charges>0;if(counter){token.charges--;metrics.resonanceShots++;}
    for(const row of rows){row.rc225ShotStyle=SHOTS[s.activeHeroId]??'native';if(bonus>0){row.power*=1+bonus;row.rc225FocusV31365=bonus;row.rc225FocusTarget=targetId;}if(counter){row.power*=1.25;row.rc225ResonanceShot=true;}}
    // Native A already owns projectile launch, travel, impact timing, sound and
    // character artwork. Tag those exact live effects so aim, focus and EGO
    // strengthen the projectile that produces this queued strike.
    const ego=finite(s.awakeningUntil)>finite(s.time)||finite(s.egoChargeAwakenUntilV31364)>finite(s.time);
    for(const shot of s.effects??[]){if(shot?.kind!=='projectile'||shot.heroProjectileTransient31213!==true||shot.heroId31213!==s.activeHeroId||shot.heroActionKey31213!=='A'||shot.rc225ShotTaggedV31365===true||finite(shot.born,-1e9)<s.time-.45||finite(shot.born,1e9)>s.time+.45)continue;
      shot.rc225ShotTaggedV31365=true;shot.rc225ShotProfileV31365=SHOTS[s.activeHeroId]??'native';if(bonus>0)shot.rc225FocusV31365=bonus;if(counter)shot.rc225ResonanceShotV31365=true;
      if(ego){shot.rc225EgoShotV31365=true;shot.size=Math.min(3.2,finite(shot.size,1)*1.12);}else shot.size=Math.min(3.2,finite(shot.size,1)*1.06);
    }
    if(bonus>0)metrics.focusedVolleys++;
   }};Object.defineProperty(next,'rc225Wrapped',{value:true});root.__HAPIL_LOOP_V31365__=Object.freeze(next);installedLoop=root.__HAPIL_LOOP_V31365__;return true;
 }
 function packTemplate(a){return !!a&&!a.boss&&!a.midboss&&!a.cosmicBoss&&!a.objectiveStructureV31238&&!a.protectedNarrativeTargetV31307&&!a.protectedNarrativeTargetV31238&&root.__HAPIL_BATTLE_ARENA_RC138__?.hostile?.(a)!==false;}
 function interludeAllowed(s,flow){
  const arena=root.__HAPIL_NATIVE_ARENA_RC138__,map=arena?.maps?.[s.zone],rows=map?.enemies;
  return !!s&&flow?.profile?.(s.zone)&&s.gameModeV31346!=='PRACTICE'&&!s.practiceV31329&&!s.requiredScene&&s.hp>0&&!s.bossDefeated&&s.spawnedWaves?.has?.(3)&&!s.spawnedWaves?.has?.(4)&&root.__HAPIL_INNER_FINAL_RC133__?.encounter?.(s)!==true&&Array.isArray(rows)&&rows.some(a=>a?.boss)&&rows.some(packTemplate);
 }
 function cue(s,text,color='#aaf9ee',duration=.48){(s.floatTexts??=[]).push({id:s.fxSerial++,x:s.x,y:s.y,born:s.time,duration,text,color});}
 function spawnNext(s,state){
  const arena=root.__HAPIL_NATIVE_ARENA_RC138__,geometry=root.__HAPIL_BATTLE_ARENA_RC138__,bridge=root.__HAPIL_RC86_BRIDGE__,rows=arena?.maps?.[s.zone]?.enemies??[],row=rows.find(packTemplate);
  if(!row||typeof bridge?.cloneEnemy!=='function'){metrics.interludesSkipped++;return false;}
  let actor;try{actor=bridge.cloneEnemy(row,s.zone);}catch{return false;}if(!actor||typeof actor!=='object')return false;
  const index=state.index,id=`rc225-interlude-${s.zone}-${++actorSerial}`;actor.id=id;actor.boss=false;actor.midboss=false;actor.cosmicBoss=false;actor.requiredForClear=false;actor.rc225Interlude=true;actor.rc225InterludeIndex=index;
  actor.maxHp=Math.max(28,Math.min(72,Math.round(finite(actor.maxHp,80)*.3)));actor.hp=actor.maxHp;
  for(const key of ['experience','exp','xp','xpReward','gold','goldReward','shardReward','egoReward','dropChance','lootChance'])if(key in actor)actor[key]=0;
  const point=geometry?.point?.({x:24+(index%2)*.35,y:13-(index%2)*.35},'right',geometry.format?.enemyRadius??.72);if(!point){metrics.interludesSkipped++;return false;}actor.x=point.x;actor.y=point.y;
  state.actor=actor;state.nextAt=null;s.enemies.push(actor);metrics.interludeActors++;cue(s,`표적 ${index+1}/3`,'#aaf9ee',.42);return true;
 }
 function wrapFlow(){
  const flow=root.__HAPIL_FLOW_V31343__;if(!flow||flow===installedFlow||flow.rc225Wrapped)return !!flow;const base=flow.waveAdvanceReady;
  function waveAdvanceReady(s,...args){
   let state=packsByWorld.get(s);if(state&&(state.zone!==s.zone||s.time<state.lastTime||state.waves!==s.spawnedWaves||s.bossDefeated||s.spawnedWaves?.has?.(4)||state.actor?.hp>0&&!(s.enemies??[]).includes(state.actor))){packsByWorld.delete(s);state=null;}
   const ready=base.call(flow,s,...args);if(!state){if(!ready||!interludeAllowed(s,flow))return ready;state={zone:s.zone,waves:s.spawnedWaves,index:0,actor:null,nextAt:s.time,finishAt:null,lastTime:s.time,complete:false};packsByWorld.set(s,state);metrics.interludesStarted++;}
   state.lastTime=s.time;
   if(state.actor&&state.actor.hp>0)return false;
   if(state.actor){state.actor=null;state.index++;state.nextAt=s.time+.32;}
   if(state.index>=3){if(state.finishAt===null){state.finishAt=s.time+.52;cue(s,'편대 돌파','#fff0a8',.5);}if(s.time<state.finishAt)return false;if(!state.complete){state.complete=true;metrics.interludesCompleted++;}return base.call(flow,s,...args);}
   if(s.time>=state.nextAt&&!spawnNext(s,state)){packsByWorld.delete(s);return base.call(flow,s,...args);}
   return false;
  }
  const next={...flow,waveAdvanceReady};Object.defineProperty(next,'rc225Wrapped',{value:true});root.__HAPIL_FLOW_V31343__=next;installedFlow=next;return true;
 }
 function install(){wrapLoop();wrapDefense();wrapFlow();metrics.installed=!!installedLoop&&!!installedDefense&&!!installedFlow;return metrics.installed;}
 function snapshot(s){const focusState=s&&focusByWorld.get(s),counter=s&&parryByWorld.get(s),pack=s&&packsByWorld.get(s);return{version:'RC225',mode:mode(s),focus:focusState?{target:focusState.target,held:focusState.held}:null,countershots:counter&&counter.zone===s?.zone&&counter.hero===s?.activeHeroId&&s.time<=counter.until?counter.charges:0,interlude:pack?{index:pack.index,active:!!pack.actor,complete:pack.index>=3}:null,metrics:{...metrics}};}
 const timer=root.setInterval?.(install,25);root.setTimeout?.(()=>{if(timer)root.clearInterval?.(timer);},30000);install();
 root.__HAPIL_SHOOTER_RC225__=Object.freeze({version:'RC225',installed:true,shotProfiles:SHOTS,focus,snapshot,metrics:()=>({...metrics}),eligibleInterlude:interludeAllowed});
})(typeof window==='object'?window:globalThis);
