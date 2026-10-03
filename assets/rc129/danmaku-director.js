/* RC129: named danmaku admission phases. Does not replace native damage, lasers,
 * boss HP, victory, movement or cast completion. Only STORY and DREAM are authored.
 * Timers use unpaused simulation time; render/snapshot calls never advance combat.
 */
(function(root){'use strict';
 const num=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const list=v=>Array.isArray(v)?v:[];
 const states=new WeakMap();
 const stats={phases:0,transitions:0,drains:0,cleared:0,volleys:0,grazeBonuses:0,duplicateGrazes:0,hookErrors:0};
 const CONFIG=Object.freeze({storySeconds:12,dreamSeconds:10,transitionSeconds:.65,grazeWindow:2,grazeStep:5,grazeReward:2,grazeBudget:10,grazeBudgetSeconds:10,guardSeconds:4,guardFactor:.95,maxGrazeSources:1024});
 const TITLES=Object.freeze({
  obsession:['잔향 · 남겨진 발자국','속박 · 닫히는 시선','미련 · 두 겹의 궤적'],
  greed:['탐욕 · 비워진 왕관','황금률 · 삼키는 성좌','갈증 · 역류하는 재물'],
  rage:['분노 · 갈라진 화염','천벌 · 붉은 칙령','종말 · 교차하는 파도'],
  envy:['질투 · 어긋난 반영','허상 · 거울의 경계','증오 · 지연된 반사'],
  order:['명령 · 빈칸의 행렬','율법 · 복종의 격자','심판 · 무너지는 질서'],
  petal:['몽화 · 비어 있는 꽃잎','흑성 · 침묵의 문양','잔몽 · 겹쳐지는 궤도']
 });
 const mode=s=>s?.gameModeV31346==='DREAM'?'DREAM':'STORY';
 const safeActor=a=>!!a&&a.boss===true&&num(a.hp)>0&&!a.friendly&&!a.neutral&&!a.visualOnly&&!a.canonAlly&&!a.canonAllyV31217&&!a.canonicalAllyV31217&&!a.protectedObjective&&!a.objectiveStructureV31238&&!a.rc88Part&&!a.echoChildV31368;
 const owner=q=>String(q?.sourceId??q?.ownerId??q?.ownerIdV31331??'');
 const friendly=q=>q?.friendly||q?.reflected||q?.heroSkillVfx||q?.heroId31213||q?.heroIdV31313||q?.partySlotV31322;
 const persistent=q=>q?.persistentRC129===true||q?.persistAcrossPhases===true||q?.persistent===true||q?.blackHole===true||q?.blackhole===true||q?.isBlackHole===true;
 const authority=s=>{const p=root.__HAPIL_PARTY_V31322__;return !(p?.state===s&&(p.status?.role==='guest'||p.status?.disconnected||p.status?.paused));};
 function eligible(s){return !!s&&Number.isFinite(s.time)&&s.hp>0&&!s.practiceV31329&&!s.practicePatternV31365&&!['hub','village'].includes(s.zone)&&authority(s);}
 function duration(s){return mode(s)==='DREAM'?CONFIG.dreamSeconds:CONFIG.storySeconds;}
 function cleanSave(raw){
  if(!raw||raw.version!==1||typeof raw.zone!=='string'||raw.zone.length>64)return null;
  const p=raw.phase,g=raw.graze;
  const phase=p&&typeof p.bossKey==='string'&&p.bossKey.length<512?{
   bossKey:p.bossKey,serial:clamp(Math.floor(num(p.serial)),0,1000000),index:clamp(Math.floor(num(p.index)),0,2),
   elapsed:clamp(num(p.elapsed),0,30),band:clamp(Math.floor(num(p.band,1)),1,3),stage:['active','draining','rest'].includes(p.stage)?p.stage:'active',
   rest:clamp(num(p.rest),0,CONFIG.transitionSeconds),lastCard:typeof p.lastCard==='string'?p.lastCard.slice(0,100):''
  }:null;
  return {version:1,zone:raw.zone,mode:raw.mode==='DREAM'?'DREAM':'STORY',phase,
   graze:{combo:0,last:-1e9,guard:clamp(num(g?.guard),0,CONFIG.guardSeconds),budget:clamp(num(g?.budget),0,CONFIG.grazeBudget),budgetAge:clamp(num(g?.budgetAge),0,CONFIG.grazeBudgetSeconds),
    // Preserve already rewarded attack IDs; overflow stops bonuses, never evicts live IDs.
    seen:list(g?.seen).filter(x=>typeof x==='string'&&x.length<240).slice(0,CONFIG.maxGrazeSources),rewarded:Math.max(0,num(g?.rewarded))}};
 }
 function memory(s){
  let m=states.get(s);if(m&&m.zone===s.zone&&m.mode===mode(s)&&s.time>=m.last-1e-8)return m;
  const saved=cleanSave(s.rc129Danmaku),valid=saved&&saved.zone===s.zone&&saved.mode===mode(s);
  m={zone:s.zone,mode:mode(s),last:s.time,clock:0,positions:[],phase:valid?saved.phase:null,owners:[],log:[],lastGrazeAt:-1e9,
   graze:valid?saved.graze:{combo:0,last:-1e9,guard:0,budget:0,budgetAge:0,seen:[],rewarded:0}};
  m.seen=new Set(m.graze.seen);states.set(s,m);return m;
 }
 function family(a){return root.__HAPIL_CHOICE_RC97__?.profile?.(a)?.family??'petal';}
 function bands(actors){const a=actors[0];return a?clamp(1+Math.floor((1-clamp(num(a.hp)/Math.max(1,num(a.maxHp,1)),0,1))*3),1,3):1;}
 function note(m,event,detail={}){m.log.push({at:m.clock,event,...detail});if(m.log.length>24)m.log.shift();}
 function persist(s,m){
  // The native state already owns mutable simulation records. Export performs
  // validation/copying; do not allocate up to 1024 saved IDs on every frame.
  if(m.graze.seen.length!==m.seen.size)m.graze.seen=Array.from(m.seen);
  let saved=s.rc129Danmaku;
  if(!saved||saved.zone!==m.zone||saved.mode!==m.mode)saved=s.rc129Danmaku={version:1,zone:m.zone,mode:m.mode};
  saved.phase=m.phase;saved.graze=m.graze;
 }
 function clearOwned(s,ids,reason){
  let removed=0;const owns=q=>ids.includes(owner(q))&&!friendly(q)&&!persistent(q);
  // Finish all casts before this is called on a live phase boundary. Persistent
  // blackholes/fields are opt-in carryovers; ally and reflected shots never cancel.
  for(const key of ['hostileProjectiles','pendingHits','impactQueue']){
   if(!Array.isArray(s[key]))continue;
   s[key]=s[key].filter(q=>{
    if(!owns(q))return true;
    if(key!=='hostileProjectiles'&&Math.max(num(q.at),num(q.impactAt),num(q.endAt))>s.time)return true;
    q.rc129RemovalReason=reason;removed++;return false;
   });
  }
  stats.cleared+=removed;return removed;
 }
 function activeUntil(s,ids){
  let until=s.time;
  for(const a of list(s.enemies))if(ids.includes(String(a.id))&&num(a.hp)>0){
   const t=root.__HAPIL_SKILL_COMPLETION_V31412__?.castUntil?.(s,a);if(Number.isFinite(t))until=Math.max(until,t);
  }
  for(const key of ['bossLaserCastsV31330','cosmicCastsV31318','bossUltimateCastsV31334','narrativeCasts','telekineticCasts','spatialRiftCasts','pendingHits','impactQueue','hostileProjectiles']){
   for(const q of list(s[key]))if(ids.includes(owner(q))&&!friendly(q)&&!persistent(q)&&!q.cancelled&&!q.damageSuppressedV31226&&!q.projectileRemovalReason31215){
    // Ordinary flying bullets do not indefinitely block the next spell. Their
    // not-yet-released deliveries do; cancelling those would truncate the cast.
    const t=key==='hostileProjectiles'?Math.max(num(q.motionReleaseAt31219),num(q.frozenUntil),num(q.interruptProtectedUntil31210)):
     Math.max(num(q.endAt),num(q.end),num(q.at),num(q.impactAt),num(q.interruptProtectedUntil31210),num(q.fireAt)+num(q.activeSeconds));
    if(t>s.time)until=Math.max(until,t);
   }
  }return until;
 }
 function beforeTick(s,api,delta=.1){
  if(!s||!Number.isFinite(s.time))return;
  const m=memory(s),dt=clamp(Math.min(Math.max(0,s.time-m.last),Math.max(0,num(delta))),0,.25);m.last=s.time;
  if(!eligible(s))return;
  const blocked=!!(s.paused||s.pause||api?.locked?.(s)||num(s.timeStopUntil)>s.time||num(s.enemySkillsSuppressedUntilV31309)>s.time);
  if(blocked)return;
  m.clock+=dt;m.graze.guard=Math.max(0,m.graze.guard-dt);m.graze.budgetAge+=dt;
  if(m.graze.budgetAge>=CONFIG.grazeBudgetSeconds){m.graze.budgetAge=0;m.graze.budget=0;}
  if(m.clock-m.graze.last>CONFIG.grazeWindow)m.graze.combo=0;
  if(!m.positions.length||s.time-m.positions[m.positions.length-1].at>=.12)m.positions.push({at:s.time,x:s.x,y:s.y});
  while(m.positions.length>8)m.positions.shift();
  const actors=list(s.enemies).filter(safeActor).sort((a,b)=>String(a.id).localeCompare(String(b.id))).slice(0,8),ids=actors.map(a=>String(a.id));
  const gone=m.owners.filter(id=>!ids.includes(id));if(gone.length)clearOwned(s,gone,'boss-exit');m.owners=ids;
  if(!actors.length){m.phase=null;persist(s,m);return;}
  const bossKey=ids.join('|');
  if(!m.phase||m.phase.bossKey!==bossKey){m.phase={bossKey,serial:(m.phase?.serial??-1)+1,index:0,elapsed:0,band:bands(actors),stage:'active',rest:0,lastCard:''};stats.phases++;note(m,'phase-enter',{bossKey});}
  const p=m.phase;
  if(p.stage==='rest'){
   p.rest=Math.max(0,p.rest-dt);
   if(p.rest<=1e-8){p.index=(p.index+1)%3;p.serial++;p.elapsed=0;p.stage='active';p.lastCard='';p.band=bands(actors);stats.phases++;note(m,'phase-enter',{serial:p.serial,index:p.index});}
  }else if(p.stage==='active'){
   p.elapsed+=dt;
   if(p.elapsed>=duration(s)||bands(actors)>p.band){p.stage='draining';stats.drains++;note(m,'cast-drain',{serial:p.serial});}
  }
  if(p.stage==='draining'&&activeUntil(s,ids)<=s.time+1e-7){
   const removed=clearOwned(s,ids,'spell-complete');p.stage='rest';p.rest=CONFIG.transitionSeconds;stats.transitions++;note(m,'phase-clean',{removed});
  }
  persist(s,m);
 }
 function phase(s){
  const m=states.get(s),p=m?.phase;
  if(!p||m.zone!==s?.zone||m.mode!==mode(s)||!eligible(s))return null;
  const a=list(s.enemies).find(a=>safeActor(a)&&m.owners.includes(String(a.id)));if(!a)return null;
  const titles=TITLES[family(a)]??TITLES.petal;
  return {index:p.index,name:['탄환','레이저','혼합'][p.index],title:p.lastCard||titles[p.index],bossName:String(a.name??'보스'),ownerId:String(a.id),
   elapsed:p.elapsed,remaining:Math.max(0,duration(s)-p.elapsed),duration:duration(s),cycle:p.serial,serial:p.serial,band:p.band,bands:3,stage:p.stage,
   draining:p.stage!=='active',rest:p.rest,castRemaining:p.stage==='draining'?Math.max(0,activeUntil(s,m.owners)-s.time):0};
 }
 function admission(s,a){const m=states.get(s);return !(m?.zone===s?.zone&&m.mode===mode(s)&&m.phase?.stage!=='active'&&m.phase&&m.owners.includes(String(a?.id)));}
 function volley(s,a,p,count){
  const m=states.get(s);if(!m?.phase||!m.owners.includes(String(a.id)))return null;
  if(m.phase.stage!=='active')return [];
  const dream=mode(s)==='DREAM',beat=Math.max(0,Math.floor(num(a.rc95BulletCycle))),f=family(a),cap=Math.max(0,Math.min(Math.floor(count),dream?7:6));
  if(cap<2||![a.x,a.y,s.x,s.y].every(Number.isFinite))return [];
  // Aim at a sampled past position, not an endlessly tracking player. No
  // surrounding spawn ring: every shot leaves the visible owner with a warning.
  const past=m.positions.find(x=>x.at>=s.time-.45)??m.positions[0]??s;
  const distance=Math.hypot(past.x-a.x,past.y-a.y);if(distance<2.4)return [];
  const radius=dream?.25:.22,clearance=.65+radius+.35;
  // Margin .17 additionally covers the existing bounded RC126 heading zigzag.
  const halfGap=Math.asin(clamp(clearance/distance,0,.85))+.17+(dream?.06:.12);
  const aim=Math.atan2(past.y-a.y,past.x-a.x),seed=root.__HAPIL_CHOICE_RC97__?.profile?.(a)?.seed??0;
  const outer=dream?.62:.48,baseSpeed=dream?4.6:3.6,shots=[];
  for(let i=0;i<cap;i++){
   const side=i%2?1:-1,rank=Math.floor(i/2),ranks=Math.ceil(cap/2),t=ranks<=1?0:rank/(ranks-1);
   // DREAM alternates near/far spokes and approach speeds between waves. The
   // central corridor remains; difficulty changes geometry, not just HP damage.
   const spoke=dream&&(beat%2)?1-t:t;
   const offset=halfGap+spoke*outer+(dream&&beat%2?rank*.045:0);
   const angle=aim+side*offset,speed=baseSpeed*(dream&&((beat+i)%3===0)?.86:1);
   shots.push({x:a.x,y:a.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,curve:0,radius,
    damage:a.boss?(p.index===2?12:10):8,homingMode31212:'none',frozenUntil:s.time,life:7,
    patternKind:'rc95-volley',label:String(a.name??'보스')+' · '+(TITLES[f]??TITLES.petal)[p.index],status:'none',rc97Grammar:f,
    rc129Plan:{version:1,serial:p.serial,aim,halfGap,clearance,distance,side,seed,mode:mode(s),warning:dream?.3:.45}});
  }stats.volleys++;return shots;
 }
 function markShot(s,q,spec){
  if(!spec?.rc129Plan)return;
  q.rc129Plan={...spec.rc129Plan};q.rc129Zone=s.zone;q.rc129PhaseSerial=spec.rc129Plan.serial;
  // Native identity/sprite and damage stay intact; use the authored flight speed.
  q.vx=spec.vx;q.vy=spec.vy;q.curve=0;
 }
 function prepareVolley(s,shots,prepared){
  let last=num(prepared?.lastRelease,s.time);
  for(const q of list(shots))if(q.rc129Plan){
   const shift=q.rc129Plan.warning;
   for(const k of ['frozenUntil','telegraphUntil31210','motionReleaseAt31219','collisionDisabledUntil31219','collisionDisabledUntilV31226'])q[k]=Math.max(s.time,num(q[k],s.time))+shift;
   q.born=Math.max(s.time,num(q.born,s.time))+shift;q.sourceBorn=q.born;
   if(Number.isFinite(q.expiresAt))q.expiresAt+=shift;
   q.rc126ReleaseAt=q.motionReleaseAt31219;q.hideUntilRelease31219=true;q.bodySpawned31219=true;
   last=Math.max(last,q.motionReleaseAt31219);
  }
  if(prepared)prepared.lastRelease=last;return prepared;
 }
 function card(s,a,card,cast){
  const m=states.get(s);if(!m?.phase||!cast||!m.owners.includes(String(a.id)))return;
  const title=card?.name??card?.label??card?.title;
  if(typeof title==='string'&&title.trim())m.phase.lastCard=title.slice(0,100);
  cast.rc129PhaseSerial=m.phase.serial;cast.rc129Zone=s.zone;persist(s,m);
 }
 function graze(s,q){
  if(!eligible(s)||!q||friendly(q)||q.damageSuppressedV31226||q.visualOnly||s.channelDActiveV31364||num(s.invulnerableUntil)>s.time)return false;
  const laser=!!(q.laserV31330||q.themedLaser||q.laser||q.shape==='line');
  // Segments/repeated contacts of one laser share one cast ID irrespective of
  // per-segment born/id fields. A laser without stable ownership is not bonus-eligible.
  const id=laser?(q.laserCastId??q.castId??q.bossCastId31210??q.attackInstanceIdV31336):(q.id??q.attackInstanceIdV31336);
  if(id==null)return false;
  const m=memory(s),key=(owner(q)+'|'+(laser?'laser|':'bullet|')+String(id)+(laser?'':'|'+String(num(q.born,-1)))).slice(0,239);
  if(m.seen.has(key)){stats.duplicateGrazes++;return false;}
  if(m.seen.size>=CONFIG.maxGrazeSources)return false;
  m.seen.add(key);
  if(m.clock-m.lastGrazeAt<.1){persist(s,m);return false;}m.lastGrazeAt=m.clock;
  const g=m.graze;g.combo=m.clock-g.last<=CONFIG.grazeWindow?g.combo+1:1;g.last=m.clock;
  if(g.combo%CONFIG.grazeStep===0&&g.budget+CONFIG.grazeReward<=CONFIG.grazeBudget){
   const before=clamp(num(s.resonance),0,100);s.resonance=Math.min(100,before+CONFIG.grazeReward);
   root.__HAPIL_COMBAT_CORE_V31401__?.resource?.(s,s,'resonanceAwarded',s.resonance-before);
   g.budget+=CONFIG.grazeReward;g.rewarded+=s.resonance-before;g.guard=CONFIG.guardSeconds;stats.grazeBonuses++;
   root.__HAPIL_FEEDBACK_RC22__?.impact?.(s,{key:'guard',priority:2,gain:.16});
  }
  persist(s,m);return true;
 }
 function contact(s,a,row){const m=states.get(s);if(m&&a===s&&row?.result==='HIT'&&num(row.hpLoss)>0){m.graze.combo=0;m.graze.last=-1e9;persist(s,m);}}
 function grazeFactor(s,source){const m=states.get(s);return m&&m.zone===s?.zone&&m.mode===mode(s)&&m.graze.guard>0&&!source?.selfDamage&&!source?.environmentDamage&&!friendly(source)?CONFIG.guardFactor:1;}
 function snapshot(s){const m=s&&states.get(s);return {version:'RC129',phase:phase(s),graze:m?{combo:m.graze.combo,guard:m.graze.guard,rewarded:m.graze.rewarded,uniqueSources:m.seen.size,budget:m.graze.budget}:null,stats:{...stats},log:m?m.log.map(e=>({...e})):[]};}
 function restore(s,raw){states.delete(s);const data=cleanSave(raw);if(data&&data.zone===s.zone&&data.mode===mode(s))s.rc129Danmaku=data;else delete s.rc129Danmaku;}
 function exportSave(s){const m=states.get(s);if(m)persist(s,m);return cleanSave(s?.rc129Danmaku);}
 const api=Object.freeze({version:'RC129',config:CONFIG,titles:TITLES,mode,eligible,safeActor,beforeTick,phase,admission,volley,markShot,prepareVolley,card,graze,contact,grazeFactor,activeUntil,clearOwned,snapshot,cleanSave,restore,exportSave});
 root.__HAPIL_DANMAKU_RC129__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
