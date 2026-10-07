/* RC133: Dream's last authored cult-leader death opens the unconscious afterlife persona.
 * Native projectiles, collision reducers, save bridge and HUD remain authoritative. */
(function(root){
 'use strict';
 const ID='inner-evil-rc133',ZONE='cult04',n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d,cl=(v,a,b)=>Math.max(a,Math.min(b,n(v)));
 const HOSTILE_QUEUE_LIMIT=96,MAX_QUEUE_RETRY_COUNT=8,QUEUE_RETRY_BASE_SECONDS=.12,QUEUE_RETRY_MAX_SECONDS=1.2;
 const metrics={entries:0,volleys:0,skills:0,completed:0,frames:0,restores:0,compositorFrames:0,compositorLayers:0,queueDeferrals:0,partialVolleyRollbacks:0,queueRetryBackoffs:0};let native=null,moodLayer=null,moodFilterSvg=null;
 const HP_LIMIT=3000000;
 // Nine lossless skill crops power the baseline volley; the original source
 // atlas supplies distinct motifs during either side's awakening.
 // No ground strike can teleport across the owned halves of this duel.
 const deck=Object.freeze([
  {key:'small-orb',name:'욕망의 씨앗',kind:'bullet',count:5,spread:1,speed:1,formation:'fan'},
  {key:'eye',name:'악의 시선',kind:'bullet',count:3,spread:.55,speed:1.08,formation:'twin'},
  {key:'diamond',name:'감춘 충동',kind:'bullet',count:4,spread:.8,speed:.95,stagger:.14,formation:'sweep'},
  {key:'clock',name:'끝없는 갈망',kind:'bullet',count:6,spread:.7,speed:.88,stagger:.16,warning:.85,formation:'spiral'},
  {key:'star',name:'순수악의의 분기',kind:'bullet',count:6,spread:1.2,speed:1.05,formation:'fan'},
  {key:'eclipse',name:'욕망의 일식',kind:'bullet',count:2,spread:.5,speed:.8,warning:.95,formation:'needle'},
  {key:'lance',name:'악의의 관통',kind:'bullet',count:3,spread:.38,speed:1.3,formation:'focus'},
  {key:'shield',name:'되비친 집착',kind:'bullet',count:4,spread:1.15,speed:.9,formation:'cross-fan'},
  {key:'vortex',name:'내면의 소용돌이',kind:'bullet',count:5,spread:.95,speed:1.1,stagger:.1,formation:'spiral'}
 ].map(Object.freeze));
 const art={ready:false,map:null,body:null,awakening:null,skills:[]};
 const traits=Object.freeze({
  hwando:{name:'검의 쌍호',count:4,spread:.26,speed:3.8,color:'#efc878',life:4.5},
  seoha:{name:'시간의 계단',count:6,spread:.18,speed:3.2,color:'#c4a2ee',life:5.5,warning:.9},
  neon:{name:'전류의 분기',count:6,spread:.3,speed:4,color:'#7de4ef',life:4.5},
  michaela:{name:'기억의 봉인',count:4,spread:.38,speed:3,color:'#f0e9ba',life:6},
  lauren:{name:'조수의 이중결',count:6,spread:.22,speed:3.4,color:'#8ab7ef',life:5.5},
  hunter:{name:'추적 화살',count:4,spread:.15,speed:4.1,color:'#c9d68a',life:4},
  slayer:{name:'칼날의 부채',count:8,spread:.32,speed:3.7,color:'#ef8b79',life:4.5},
  gunner:{name:'시간 파편의 궤적',count:6,spread:.24,speed:3.6,color:'#77e6cb',life:6}
 });
 const skillPath=key=>'./assets/rc134/persona-skills/'+key+'.png',sourceSkillPath=key=>'./assets/rc133/art/'+key+'.png';
 function approvedSprite(key,path){return deck.some(k=>k.key===key)&&typeof path==='string'&&(path.split('?')[0]===skillPath(key)||path.split('?')[0]===sourceSkillPath(key))&&(!path.includes('?')||/^v=\d+$/.test(path.split('?')[1]));}
 function acceptsSkill(s,a,p){return a?.id===ID&&a.rc133InnerBoss===true&&active(s)&&approvedSprite(p?.rc133Skill,p?.sprite)&&(p.sprite===art.skillMap?.[p.rc133Skill]||p.sprite===art.samongSkillMap?.[p.rc133Skill]);}
 function enabled(s){return root.__HAPIL_SAMONG_RC91__?.enabled(s)===true&&s.zone===ZONE;}
 function active(s){return enabled(s)&&s.hp>0&&['reveal','fight'].includes(s.innerFinalRC133?.phase);}
 function boss(s){return s?.enemies?.find(a=>a.id===ID&&a.hp>0);}
 function growth(s,raw={}){const score=Math.log2(1+Math.max(0,n(raw.infinitePower)))+.08*Math.min(150,Object.values(raw).reduce((a,b)=>a+Math.max(0,n(b)),0));return cl(1+score*.045,1,2.1);}
 function cleanClash(raw){if(!raw||raw.version!==1)return {version:1,used:false,admitted:false,at:0,until:0,reason:null};return {version:1,used:raw.used===true,admitted:raw.used===true,at:cl(raw.at,0,100000),until:cl(raw.until,0,100000),reason:['player','boss','both'].includes(raw.reason)?raw.reason:null};}
 function clean(raw){if(!raw||raw.version!==1||raw.zone!==ZONE||!['reveal','fight','complete'].includes(raw.phase))return null;const maxHp=cl(raw.maxHp,100,HP_LIMIT),hp=cl(raw.hp,0,maxHp),phase=hp<=0?'complete':raw.phase,fatalAt=Number.isFinite(raw.playerFatalAt)?n(raw.playerFatalAt,-1):-1;return {version:1,zone:ZONE,phase,entry:raw.entry==='developer-777'?'developer-777':'cult-death',hero:Object.hasOwn(traits,raw.hero)?raw.hero:'hwando',healthModel:raw.healthModel===2?2:1,maxHp,hp:phase==='complete'?0:hp,scale:cl(raw.scale,1,2.1),elapsed:cl(raw.elapsed,0,100000),awake:phase==='complete'?0:cl(raw.awake,0,7),awakeningCooldown:cl(raw.awakeningCooldown,0,35),shotDelay:cl(raw.shotDelay,0,10),queueRetryCount:Math.floor(cl(raw.queueRetryCount,0,MAX_QUEUE_RETRY_COUNT)),cycle:Math.floor(cl(raw.cycle,0,1000000)),x:cl(raw.x,1,31),y:cl(raw.y,1,31),intro:cl(raw.intro,0,2),clash:cleanClash(raw.clash),clashFreeze:cl(raw.clashFreeze,0,.2),playerFatalAt:fatalAt<0?-1:cl(fatalAt,0,100000),bossRevived:raw.bossRevived===true||raw.bossRevived==null&&raw.clash?.used===true&&['boss','both'].includes(raw.clash.reason),playerRevived:raw.playerRevived===true||raw.playerRevived==null&&raw.clash?.used===true&&['player','both'].includes(raw.clash.reason),duelSwap:raw.duelSwap===true,duelSwapUntil:cl(raw.duelSwapUntil,0,100000),duelSwapDone:raw.duelSwapDone===true,tempoSeed:Math.floor(cl(raw.tempoSeed,0,4294967295)),tempoClock:cl(raw.tempoClock,0,100000),tempoMutualStart:cl(raw.tempoMutualStart,0,100000),tempoActive:raw.tempoActive===true,redTimeReadyAt:cl(raw.redTimeReadyAt,0,100000),redTimeWarnUntil:phase==='complete'?0:cl(raw.redTimeWarnUntil,0,100000),redTimeActiveUntil:phase==='complete'?0:cl(raw.redTimeActiveUntil,0,100000),redTimeSeed:Math.floor(cl(raw.redTimeSeed,0,4294967295)),redTimeRolls:Array.isArray(raw.redTimeRolls)?raw.redTimeRolls.filter(row=>Array.isArray(row)&&typeof row[0]==='string'&&row[0].length<=160&&typeof row[1]==='boolean').slice(-64):[]};}
 function deferVolley(m){m.queueRetryCount=Math.min(MAX_QUEUE_RETRY_COUNT,Math.floor(n(m.queueRetryCount))+1);metrics.queueDeferrals++;if(m.queueRetryCount===MAX_QUEUE_RETRY_COUNT)metrics.queueRetryBackoffs++;m.shotDelay=Math.min(QUEUE_RETRY_MAX_SECONDS,QUEUE_RETRY_BASE_SECONDS*2**Math.min(MAX_QUEUE_RETRY_COUNT-1,m.queueRetryCount-1));return m.shotDelay;}
 function cleanup(s,id=ID){if(!s)return;root.__HAPIL_MODES_V31346__?.dreamFinal?.cleanup(s,id);for(const key of ['effects','floatTexts'])if(Array.isArray(s[key]))s[key]=s[key].filter(q=>q.sourceId!==id&&q.ownerId!==id);}
 function build(s,m){
  const template=root.__HAPIL_RC86_BRIDGE__?.actor(ZONE,'c104-boss');if(!template||!native)return null;
  const a=root.__HAPIL_RC86_BRIDGE__.cloneEnemy(template,ZONE),own=native.heroes.find(h=>h.id===m.hero);
  Object.assign(a,{id:ID,name:'페르소나 · 순수악의',kind:'sentinel',hp:m.hp,maxHp:m.maxHp,boss:true,midboss:false,rc133InnerBoss:true,
   x:m.x,y:m.y,scale:1,fixedPhase:1,currentPhase:1,phaseCount:1,phaseMax:1,humanPhase0:false,narrativeMultiPhase:false,
   sprite:art.ready?frame(s,{x:m.x,y:m.y}):(own?.sprite??template.sprite),phaseSprites:null,actionSprites:null,phaseScales:null,patternSet:'',
   readyAt:1e12,patternReadyAt:1e12,themedOrdnanceAt:1e12,bossCombatPatternReadyAtV31230:1e12,bossHpScaledV31230:true,attackAt:0,invulnerableUntil:s.time+m.intro,staggerUntil:0,recoverUntil:0,
   noBossSummons:true,requiredForClear:true,rc133GrowthScale:m.scale,navPath:[],moveDx:0,moveDy:0,moveVx:0,moveVy:0});
  delete a.actionSpritesByPhase;delete a.standProfileRC69;delete a.dreamCosmicTrialV31346;delete a.samongStatsRC91;delete a.hellStatsV31322;
  // Enroll a stable baseline so the existing Dream scaler cannot double this bounded health again.
  a.samongStatsRC91={version:1,factor:2,baseMaxHp:m.maxHp/2,observedMaxHp:m.maxHp,fields:{}};
  s.enemies=s.enemies.filter(e=>e.id!==ID);s.enemies.push(a);root.__HAPIL_PERSONA_DUEL_RC134__?.enforce(s);return a;
 }
 function health(s,leader,raw={}){
  const hero=native?.heroes.find(h=>h.id===s.activeHeroId),flow=root.__HAPIL_COMBAT_FLOW_RC95__;let dps=0;
  if(hero&&typeof flow?.estimate==='function')dps=n(flow.estimate(s,raw,hero,native));
  // Calibrate once at entry. No regeneration or midfight rescaling: progress
  // remains finite, and growth cannot exceed this encounter's hard ceiling.
  return Math.round(cl(Math.max(12000,n(leader?.maxHp,1500)*1.65,dps*140*growth(s,raw)),12000,HP_LIMIT));
 }
 function begin(s,leader,entry){
  if(!native||!leader)return false;
  native.prepareFinalTransition?.(s);
  const raw=root.__HAPIL_CONTROLS_V31329__?.binding?.passives?.current??{},scale=growth(s,raw),maxHp=health(s,leader,raw);
  const p=root.__HAPIL_RC86_BRIDGE__.point(ZONE,23.2,10,.8);
  if(entry==='developer-777'){for(const a of s.enemies)cleanup(s,a.id);cleanup(s);s.enemies=[];s.spawnedWaves=new Set([1,2,3,4]);}
  else {root.__HAPIL_DEATH_BURN_RC144__?.emit(s,leader);cleanup(s,leader.id);s.enemies=s.enemies.filter(e=>e!==leader);}
  s.dreamFinalV31346={version:1,index:6,phase:'complete',activeId:null,safeUntil:0,complete:true};
  s.innerFinalRC133={version:1,zone:ZONE,phase:'reveal',entry,hero:s.activeHeroId,healthModel:2,maxHp,hp:maxHp,scale,elapsed:0,awake:0,awakeningCooldown:14,shotDelay:3,queueRetryCount:0,cycle:0,x:p.x,y:p.y,intro:2,clash:cleanClash(null),clashFreeze:0,playerFatalAt:-1,redTimeReadyAt:0,redTimeWarnUntil:0,redTimeActiveUntil:0,redTimeSeed:(Math.floor(n(s.time)*1000)+Math.floor(n(s.fxSerial))*997+0x133150)>>>0,redTimeRolls:[]};
  s.bossDefeated=false;if(entry==='cult-death')s.completedZones?.delete(ZONE);s.targetEnemyId=ID;s.invulnerableUntil=Math.max(n(s.invulnerableUntil),s.time+2);
  build(s,s.innerFinalRC133);root.__HAPIL_PERSONA_DUEL_RC134__?.enforce(s,true);metrics.entries++;root.__HAPIL_MEDIA_AUDIO_RC133__?.event('innerReveal',s,s,'reveal');
  (s.floatTexts??=[]).push({id:s.fxSerial++,x:s.x,y:s.y,born:s.time,duration:1.8,text:entry==='developer-777'?'777 · 사후의 나 히든 결전':'외부의 악을 넘어, 내 욕망의 순수악의가 거울에서 깨어난다',color:'#f3ccdf',critical:true});
  return true;
 }
 function start(s,leader){
  if(!enabled(s)||leader?.id!=='c104-boss'||leader.hp>0||s.innerFinalRC133?.phase==='complete'||active(s))return false;
  return begin(s,leader,'cult-death');
 }
 function developerStart(s){
  if(!enabled(s)||!root.__HAPIL_DEVELOPER_MAPS_RC133__?.canInner(s))return false;
  return begin(s,root.__HAPIL_RC86_BRIDGE__?.actor(ZONE,'c104-boss'),'developer-777');
 }
 function beforeDeath(s,a){
  if(!enabled(s))return false;
  if(a?.id==='c104-boss')return start(s,a);
  if(a?.id===ID&&a.hp<=0&&s.innerFinalRC133?.phase!=='complete'){
   const m=s.innerFinalRC133;
   if(!m.bossRevived&&startClash(s,a,s.hp<=0?'both':'boss'))return true;
   m.phase='complete';m.hp=0;m.awake=0;releaseMoodLayer();cleanup(s);root.__HAPIL_PERSONA_DUEL_RC134__?.release(s);metrics.completed++;if(m.entry==='developer-777'){root.__HAPIL_DEATH_BURN_RC144__?.emit(s,a);s.enemies=s.enemies.filter(e=>e.id!==ID);s.targetEnemyId=null;s.bossDefeated=false;return true;}
  }
  return false;
 }
 function encounter(s){return enabled(s)&&['reveal','fight'].includes(s.innerFinalRC133?.phase)&&s.enemies?.some(a=>a.id===ID);}
 function red(s){return encounter(s)&&s.hp>0&&n(s.innerFinalRC133?.awake)>0;}
 function attackSpeedFactor(s){return red(s)?.7:1;}
 function redTimeActive(s){const m=s?.innerFinalRC133;return red(s)&&n(m?.redTimeActiveUntil)>n(m?.elapsed)&&n(m?.elapsed)>=n(m?.redTimeWarnUntil);}
 function redTimeKey(s,source){
  const cast=source?.ultimateCastIdV31309??source?.collabCastIdV31315??source?.castIdV31309??source?.heroAttackId??source?.originAttackV31328;
  if(cast!=null)return 'cast:'+String(cast).slice(0,140);
  const basic=n(s.basicAttackCount),last=n(s.lastAttack,-1);
  if(basic>0&&last>=0&&source?.skillIndex==null&&source?.skillKey==null)return 'basic:'+basic+':'+last;
  return 'hit:'+String(source?.skillKey??source?.skillIndex??source?.actionKey??'A')+':'+String(source?.born??source?.sourceBorn??last)+':'+String(source?.id??s.fxSerial??0);
 }
 function redTimeBlocks(s,target,source){
  if(target?.id!==ID||!redTimeActive(s))return false;
  const m=s.innerFinalRC133,key=redTimeKey(s,source);m.redTimeRolls??=[];
  const prior=m.redTimeRolls.find(row=>row[0]===key);if(prior)return prior[1];
  m.redTimeSeed=(Math.imul(n(m.redTimeSeed,0x133150),1664525)+1013904223)>>>0;
  const blocked=m.redTimeSeed/4294967296<.66;m.redTimeRolls.push([key,blocked]);if(m.redTimeRolls.length>64)m.redTimeRolls.shift();
  if(blocked)(s.floatTexts??=[]).push({id:s.fxSerial++,sourceId:ID,x:target.x,y:target.y-1,born:s.time,duration:.55,text:'시간 차단',color:'#ffafc1',critical:false});
  return blocked;
 }
 function startClash(s,a,reason='both'){
  const m=s?.innerFinalRC133;if(!encounter(s)||!a||m.clash?.admitting||s.hp<=0&&m.playerRevived||a.hp<=0&&m.bossRevived)return false;
  const A=root.__HAPIL_SAMONG_RC91__;if(typeof A?.activateFinalClash!=='function')return false;
  // A dead player remains pending the explicit revive choice. The boss owns
  // its independent one-use revival and awakening even on a simultaneous lethal.
  if(s.hp<=0&&A.revivalAuthorized?.(s)!==true){if(a.hp<=0&&!m.bossRevived){a.hp=Math.max(1,Math.ceil(a.maxHp*.22));m.bossRevived=true;m.hp=a.hp;m.awake=7;m.awakeningCooldown=28;m.shotDelay=.55;root.__HAPIL_PERSONA_DUEL_RC134__?.enforce(s);root.__HAPIL_AWAKENING_IMPACT_RC150__?.boss?.(s,a,'persona-revival',art.awakening,'Persona · 순수악의');root.__HAPIL_MEDIA_AUDIO_RC133__?.event('innerAwake',s,a,'boss-revival');return true;}return false;}
  const party=root.__HAPIL_PARTY_V31322__;if(party?.state===s&&(party.status?.role==='guest'||party.status?.paused||party.status?.disconnected))return false;
  // Reserve before any feedback callback can reenter. Player admission owns
  // the explicit revival ledger independently of the pending EGO counter.
  const oldClash=m.clash,oldActor={hp:a.hp,invulnerableUntil:a.invulnerableUntil,atomicCastUntil31210:a.atomicCastUntil31210},oldState={hp:m.hp,awake:m.awake,awakeningCooldown:m.awakeningCooldown,shotDelay:m.shotDelay,playerFatalAt:m.playerFatalAt,clashFreeze:m.clashFreeze,bossRevived:!!m.bossRevived,playerRevived:!!m.playerRevived};
  m.clash={version:1,used:true,admitted:false,admitting:true,at:s.time,until:s.time+7,reason};
  // Publish both actor states before the player's admission emits feedback or
  // a save observer. Only the actor whose HP became lethal is revived;
  // the living opponent keeps its actual combat progress.
  if(s.hp<=0)m.playerRevived=true;
  if(a.hp<=0){a.hp=Math.max(1,Math.ceil(a.maxHp*.22));m.bossRevived=true;}
  a.invulnerableUntil=Math.max(n(a.invulnerableUntil),s.time+.55);a.atomicCastUntil31210=Math.max(n(a.atomicCastUntil31210),s.time+.55);
  m.hp=a.hp;m.awake=7;m.awakeningCooldown=28;m.shotDelay=.55;m.playerFatalAt=-1;m.clashFreeze=.2;
  root.__HAPIL_PERSONA_DUEL_RC134__?.enforce(s);
  if(!A.activateFinalClash(s)){Object.assign(a,oldActor);Object.assign(m,oldState);m.clash=oldClash;return false;}
  if(oldState.awake<=0||oldActor.hp<=0)root.__HAPIL_AWAKENING_IMPACT_RC150__?.boss?.(s,a,'persona-clash-'+Math.floor(m.elapsed*1000),art.awakening,'Persona · 순수악의');
  cleanup(s);s.invulnerableUntil=Math.max(n(s.invulnerableUntil),s.time+.9);s.targetEnemyId=ID;
  root.__HAPIL_MEDIA_AUDIO_RC133__?.event('innerAwake',s,a,'duel-clash');
  (s.floatTexts??=[]).push({id:s.fxSerial++,sourceId:ID,x:a.x,y:a.y,born:s.time,duration:2.3,text:'쌍각성 · 검백과 흑적, 서로를 향해 다시 선다',color:'#f3d9e8',critical:true});
  metrics.clashes=(metrics.clashes??0)+1;return true;
 }
 function onPlayerLethal(s){
  if(!encounter(s)||s.hp>0)return false;releaseMoodLayer();const m=s.innerFinalRC133,a=s.enemies.find(e=>e.id===ID);
  if(m.playerRevived||root.__HAPIL_SAMONG_RC91__?.revivalAuthorized?.(s)!==true)return false;
  return startClash(s,a,a?.hp<=0?'both':'player');
 }
 function tick(s,dt){
  if(!active(s)){root.__HAPIL_PERSONA_DUEL_RC134__?.enforce(s);return;}
  if(!native||!(dt>0)||native.locked(s)||s.paused||s.pause||n(s.timeStopUntil)>s.time)return;
  const party=root.__HAPIL_PARTY_V31322__;if(party?.state===s&&(party.status?.role==='guest'||party.status?.paused||party.status?.disconnected))return;
  const m=s.innerFinalRC133,a=boss(s);if(!a)return;
  dt=cl(dt,0,.1);root.__HAPIL_PERSONA_DUEL_RC134__?.tick(s,dt);m.elapsed+=dt;m.hp=a.hp;m.x=a.x;m.y=a.y;m.intro=Math.max(0,m.intro-dt);m.clashFreeze=Math.max(0,n(m.clashFreeze)-dt);
  a.navPath=[];a.readyAt=a.patternReadyAt=a.themedOrdnanceAt=a.bossCombatPatternReadyAtV31230=1e12;
  if(m.clashFreeze>0)return;
  if(m.intro>0)return;m.phase='fight';m.awake=Math.max(0,m.awake-dt);m.awakeningCooldown=Math.max(0,m.awakeningCooldown-dt);
  if(m.awakeningCooldown<=0){m.awake=7;m.awakeningCooldown=28;root.__HAPIL_AWAKENING_IMPACT_RC150__?.boss?.(s,a,'persona-cycle-'+Math.floor(m.elapsed*1000),art.awakening,'Persona · 순수악의');root.__HAPIL_MEDIA_AUDIO_RC133__?.event('innerAwake',s,a,'awake-'+m.cycle);
   (s.floatTexts??=[]).push({id:s.fxSerial++,x:a.x,y:a.y,born:s.time,duration:.9,text:'惡夢覺醒 · 욕망이 순수악의로 되돌아온다',color:'#ff8ca4',critical:true});}
  if(art.ready)a.sprite=frame(s,a);
  // Never release generic/fallback boss weapons while the two source atlases
  // are unavailable. Body/arena readiness and native HP continue normally.
  if(!art.ready)return;
  m.shotDelay=Math.max(0,m.shotDelay-dt);const skill=deck[m.cycle%deck.length],red=m.awake>0,mutual=red&&root.__HAPIL_SAMONG_RC91__.active(s),empowered=red||root.__HAPIL_SAMONG_RC91__.active(s),count=red?Math.min(12,skill.count*2)*2:empowered?Math.min(12,skill.count*2):Math.min(12,Math.ceil(skill.count*1.5)),color='#ef9fce';
  // Admit a whole volley or defer it. Never silently clip one of the nine
  // doubled red patterns against the shared projectile budget.
  s.hostileProjectiles??=[];if(m.shotDelay>0)return;if(s.hostileProjectiles.length+count>HOSTILE_QUEUE_LIMIT){deferVolley(m);return;}
  const lead=Math.max(0,Math.min(.28,Math.hypot(s.x-a.x,s.y-a.y)/6)),aimX=s.x+cl(n(s.moveVx),-8,8)*lead,aimY=s.y+cl(n(s.moveVy),-8,8)*lead,angle=Math.atan2(aimY-a.y,aimX-a.x),distance=Math.max(2.8,Math.hypot(aimX-a.x,aimY-a.y)),warning=empowered?1.4:Math.max(.72,skill.warning??.72);
  a.atomicCastUntil31210=Math.max(n(a.atomicCastUntil31210),s.time+warning+.35);
  const before=s.hostileProjectiles.length,turn=(m.cycle%8)*.045,sprite=empowered?art.samongSkillMap?.[skill.key]:art.skillMap?.[skill.key];if(!sprite)return;
  for(let i=0;i<count;i++){
   const paired=i%2?1:-1,rank=Math.floor(i/2),center=root.__HAPIL_PERSONA_DUEL_RC134__?.swapped(s)?-Math.PI*.25:Math.PI*.75,spread=(i-(count-1)/2)*skill.spread/Math.max(1,count-1),turnOffset=turn+(m.cycle%deck.length)*.012;
   let offset=skill.formation==='focus'?spread*.22:skill.formation==='twin'?paired*(.13+rank*.12):skill.formation==='spiral'?spread+turnOffset:skill.formation==='sweep'?spread+Math.sin(i*.8+turnOffset)*.22:skill.formation==='cross-fan'?spread+paired*(.08+rank*.06):skill.formation==='needle'?spread*.12:spread+paired*.07;
   if(red&&skill.formation==='fan')offset+=(m.cycle%2===0?-.16:.16);
   // Keep the actual player vector in the permitted mirrored lane. Width,
   // release order, origin band and speed distinguish the nine native paths.
   const desired=angle+offset,delta=((desired-center+Math.PI*3)%(Math.PI*2)-Math.PI),theta=center+cl(delta,-1.4,1.4),baselineSpeed=Math.min(7.5,(empowered?4.4:3.6)*skill.speed*(skill.formation==='spiral'?1+((i%3)-1)*.08:1)),speed=red?baselineSpeed*2:baselineSpeed,stage=mutual?i*.035:(skill.stagger??.08)*(skill.key==='diamond'||skill.key==='clock'?rank:Math.floor(i/3)),radius=skill.key==='eclipse'?.31:skill.key==='lance'?.22:.24;
   const damage=red?(mutual?Math.min(24,26*m.scale):26*m.scale):empowered?18*m.scale:13*m.scale;
   native.bullet(s,a,{danmakuV31316:true,vx:Math.cos(theta)*speed,vy:Math.sin(theta)*speed,radius,damage,life:Math.min(18,Math.max(7,distance/(speed*.65)+warning+stage+2)),frozenUntil:s.time+warning+stage,homingMode31212:'none',patternKind:'rc95-volley',status:'none',color,accent:'#fff0e7',sprite,spriteHeading:0,screenAligned31222:!['eye','lance'].includes(skill.key),label:skill.name,rc133Pattern:skill.key,rc133Skill:skill.key,rc133Cycle:m.cycle,rc133ShotIndex:i,rc147Speed:speed});
  }
  const emitted=s.hostileProjectiles.slice(before);if(emitted.length!==count){
   // The native emitter may reject a subset after our admission check. Remove
   // this attempted volley as a unit so neither the queue nor skill cycle can
   // retain a partial pattern. The same pattern is retried with bounded delay.
   if(emitted.length){const rollback=new Set(emitted);s.hostileProjectiles=s.hostileProjectiles.filter(q=>!rollback.has(q));metrics.partialVolleyRollbacks++;}
   deferVolley(m);return;
  }
  if(red&&skill.key==='clock'&&m.elapsed>=n(m.redTimeReadyAt)){
   m.redTimeWarnUntil=m.elapsed+.7;m.redTimeActiveUntil=m.redTimeWarnUntil+4;m.redTimeReadyAt=m.elapsed+12;m.redTimeRolls=[];
   (s.floatTexts??=[]).push({id:s.fxSerial++,sourceId:ID,x:a.x,y:a.y-2,born:s.time,duration:.7,text:'붉은 시간 · 0.7초 후 시간 차단',color:'#ff9fb5',critical:true});
  }
  for(const [emittedIndex,q] of emitted.entries()){const theta=Math.atan2(q.vy,q.vx),index=emittedIndex,spiral=skill.formation==='spiral'?1+((index%3)-1)*.08:1,baselineSpeed=Math.min(7.5,(empowered?4.4:3.6)*skill.speed*spiral),speed=red?baselineSpeed*2:baselineSpeed,band={eye:.16,diamond:.62,clock:.46,vortex:.4}[skill.key]??0,lateral=band*(index-(count-1)/2)/Math.max(1,(count-1)/2);Object.assign(q,{rc133InnerShot:true,rc150RedPersonaShot:red,visualScaleV31224:red?1.2:1,rc133Skill:skill.key,rc133Pattern:skill.key,rc133Cycle:m.cycle,rc133ShotIndex:index,rc134Mutual:mutual,sprite,fallbackSprite:sprite,sevenSinImpactSprite:sprite,impactSpriteV31224:sprite,impactFallbackSprite:sprite,telegraphSpriteV31224:sprite,spriteHeading:0,screenAligned31222:!skill.key.endsWith('eye')&&!skill.key.endsWith('lance'),rc147Speed:speed,vx:Math.cos(theta)*speed,vy:Math.sin(theta)*speed,curve:0,homingMode31212:'none'});if(lateral){const dx=-Math.sin(theta)*lateral,dy=Math.cos(theta)*lateral;q.x+=dx;q.y+=dy;q.originX=n(q.originX,q.x-dx)+dx;q.originY=n(q.originY,q.y-dy)+dy;q.previousX=q.x;q.previousY=q.y;}q.radius=Math.min(.32,n(q.radius,.24));q.damage=Math.min(54.6,Math.max(0,n(q.damage)));q.collisionDisabledUntil31219=Math.max(n(q.collisionDisabledUntil31219),n(q.frozenUntil,s.time+warning));}
  (s.floatTexts??=[]).push({id:s.fxSerial++,sourceId:ID,x:a.x,y:a.y,born:s.time,duration:warning,text:mutual?'純惡意 · '+skill.name:skill.name,color,critical:false});
  root.__HAPIL_MEDIA_AUDIO_RC133__?.event('innerShot',s,a,'volley-'+m.cycle);
  // Finish the current wind-up/release window before opening another cast.
  // This keeps high-count awakened volleys from overlapping their own lock.
  m.queueRetryCount=0;m.cycle++;m.shotDelay=Math.max(mutual?.46:empowered?.68:1.05,warning+.35);metrics.volleys++;metrics.skills++;

 }
 function mood(s){if(!active(s))return 'normal';const p=root.__HAPIL_SAMONG_RC91__.active(s),b=s.innerFinalRC133.awake>0;return p&&b?'opposition':p?'player':b?'boss':'normal';}
 const FILTER_ID='hapil-inner-final-boss-rc142';
 const playerFilter='grayscale(1) contrast(1.08)',bossFilter='url("#'+FILTER_ID+'")';
 function ensureMoodFilter(){if(moodFilterSvg?.isConnected)return;const doc=root.document;if(!doc?.createElementNS)return;const ns='http://www.w3.org/2000/svg',svg=doc.createElementNS(ns,'svg');svg.setAttribute('aria-hidden','true');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.style.cssText='position:fixed;left:-10px;top:-10px;width:0;height:0;overflow:hidden;pointer-events:none';const filter=doc.createElementNS(ns,'filter');filter.setAttribute('id',FILTER_ID);filter.setAttribute('color-interpolation-filters','sRGB');const matrix=doc.createElementNS(ns,'feColorMatrix');matrix.setAttribute('type','matrix');matrix.setAttribute('values','0.229608 0.772416 0.077976 0 -0.04 0.086440659 0.290791906 0.029355671 0 -0.015058824 0.108050824 0.363489882 0.036694588 0 -0.018823529 0 0 0 1 0');filter.append(matrix);svg.append(filter);(doc.body??doc.documentElement).append(svg);moodFilterSvg=svg;}
 function syncMoodLayer(layer){const c=layer?.canvas,o=layer?.overlay;if(!c?.isConnected||!o?.isConnected||c.parentElement!==layer.parent)return false;if(o.width!==c.width)o.width=c.width;if(o.height!==c.height)o.height=c.height;const left=c.offsetLeft,top=c.offsetTop,width=c.offsetWidth,height=c.offsetHeight;if(layer.geometry!==left+':'+top+':'+width+':'+height){o.style.left=left+'px';o.style.top=top+'px';o.style.width=width+'px';o.style.height=height+'px';layer.geometry=left+':'+top+':'+width+':'+height;}layer.dirty=false;return true;}
 function releaseMoodLayer(canvas=null){const layer=moodLayer;if(!layer){if(moodFilterSvg?.parentNode)moodFilterSvg.remove();moodFilterSvg=null;return false;}if(canvas&&layer.canvas!==canvas)return false;layer.observer?.disconnect();root.removeEventListener?.('resize',layer.resize);if(layer.canvas.style.filter===layer.appliedFilter)layer.canvas.style.filter=layer.originalFilter;if(layer.overlay.parentNode)layer.overlay.remove();moodLayer=null;if(moodFilterSvg?.parentNode)moodFilterSvg.remove();moodFilterSvg=null;return true;}
 function applyMoodLayer(canvas,mode){if(!canvas?.isConnected||!canvas.matches?.('.game-stage > canvas')||!root.document)return false;if(mode==='boss'){ensureMoodFilter();if(!moodFilterSvg?.isConnected)return false;}if(moodLayer&&moodLayer.canvas!==canvas)releaseMoodLayer();let layer=moodLayer;if(!layer){const parent=canvas.parentElement;if(!parent)return false;const overlay=root.document.createElement('canvas');overlay.className='rc142-inner-hud-overlay';overlay.setAttribute('aria-hidden','true');overlay.dataset.rc142InnerHud='true';overlay.width=canvas.width;overlay.height=canvas.height;const z=root.getComputedStyle(canvas).zIndex;overlay.style.cssText='position:absolute;pointer-events:none;display:block;box-sizing:border-box;max-width:none;max-height:none;object-fit:fill;z-index:'+(/^-?\d+$/.test(z)?z:'0');parent.insertBefore(overlay,canvas.nextSibling);layer={canvas,parent,overlay,originalFilter:canvas.style.filter,appliedFilter:'',geometry:'',dirty:true,observer:null,resize:null};if(typeof root.ResizeObserver==='function'){layer.observer=new root.ResizeObserver(()=>{layer.dirty=true;syncMoodLayer(layer);});layer.observer.observe(canvas);layer.observer.observe(parent);}layer.resize=()=>{layer.dirty=true;syncMoodLayer(layer);};root.addEventListener?.('resize',layer.resize,{passive:true});moodLayer=layer;metrics.compositorLayers++;}if(layer.dirty||layer.overlay.width!==canvas.width||layer.overlay.height!==canvas.height){if(!syncMoodLayer(layer))return false;}else if(!canvas.isConnected||!layer.overlay.isConnected||canvas.parentElement!==layer.parent)return false;const filter=mode==='boss'?bossFilter:playerFilter;if(canvas.style.filter!==filter){canvas.style.filter=filter;layer.appliedFilter=filter;}return true;}
 function drawRedTimeClock(ctx,s,canvas){const m=s?.innerFinalRC133;if(!red(s)||!m||n(m.redTimeActiveUntil)<=n(m.elapsed)||n(m.redTimeWarnUntil)<=0)return;const image=root.__HAPIL_MEDIA_ART_RC133__?.picture?.(art.samongSkillMap?.clock);if(!image)return;
  const warning=n(m.elapsed)<n(m.redTimeWarnUntil),remaining=(warning?m.redTimeWarnUntil:m.redTimeActiveUntil)-m.elapsed,size=Math.min(108,Math.max(52,canvas.width*.13)),x=canvas.width*.5,y=Math.max(size*.65,canvas.height*.16);
  ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.globalAlpha=warning?.88:.7;ctx.drawImage(image,x-size/2,y-size/2,size,size);ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='top';ctx.font='700 '+Math.max(12,Math.min(18,canvas.width*.016))+'px sans-serif';ctx.lineWidth=3;ctx.strokeStyle='#20070e';const label=(warning?'붉은 시간 예고 ':'시간 차단 66% ')+Math.max(0,remaining).toFixed(1)+'초';ctx.strokeText(label,x,y+size*.55);ctx.fillStyle='#ffe4e9';ctx.fillText(label,x,y+size*.55);}finally{ctx.restore();}}
 function prepareHud(ctx,s,canvas){const layer=moodLayer;if(!ctx||!canvas)return ctx;if(!layer||layer.canvas!==canvas||!canvas.isConnected||!layer.overlay.isConnected||canvas.parentElement!==layer.parent){drawRedTimeClock(ctx,s,canvas);return ctx;}if(layer.dirty||layer.overlay.width!==canvas.width||layer.overlay.height!==canvas.height)if(!syncMoodLayer(layer)){drawRedTimeClock(ctx,s,canvas);return ctx;}const out=layer.overlay.getContext('2d');if(!out){drawRedTimeClock(ctx,s,canvas);return ctx;}out.setTransform(1,0,0,1,0,0);out.clearRect(0,0,layer.overlay.width,layer.overlay.height);const transform=ctx.getTransform?.();if(transform)out.setTransform(transform);out.globalAlpha=1;out.globalCompositeOperation='source-over';out.filter='none';out.shadowBlur=0;drawRedTimeClock(out,s,canvas);return out;}
 function compose(ctx,s,canvas){
  // RC108 caches native camera passes before assembling the portrait frame.
  // Apply hidden-battle color once, after those camera images are assembled.
  const mode=mood(s);if(!ctx||!canvas)return false;if(mode==='normal'){releaseMoodLayer();return false;}if(root.__HAPIL_PORTRAIT_SPLIT_RC108__?.metrics?.()?.rendering===true)return false;
  if(root.__HAPIL_PERSONA_DUEL_RC134__?.active(s))root.__HAPIL_PERSONA_DUEL_RC134__.backdrop(ctx,canvas);
  // Grade the actual world canvas in the browser compositor. The transparent
  // HUD sibling is cleared/redrawn separately so feedback remains readable.
  const clash=s.innerFinalRC133?.clash?.used&&s.time<s.innerFinalRC133.clash.until;
  if(!clash&&(mode==='player'||mode==='boss')&&applyMoodLayer(canvas,mode)){metrics.frames++;metrics.compositorFrames++;return true;}
  releaseMoodLayer(canvas);
  const w=canvas.width,h=canvas.height;ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
   const pass=(x,width,bossSide)=>{ctx.save();try{ctx.beginPath();ctx.rect(x,0,width,h);ctx.clip();ctx.filter='grayscale(1) contrast(1.08)';ctx.drawImage(canvas,0,0);ctx.filter='none';if(bossSide){ctx.globalCompositeOperation='multiply';ctx.fillStyle='#ff6078';ctx.fillRect(x,0,width,h);}}finally{ctx.restore();}};
   // Tint actual world ownership after the two cached views are assembled.
   // Each portrait strip has its own projected center line; a faction swap
   // changes which side belongs to the boss, never projectile coordinates.
   if(mode==='opposition'){
    pass(0,w,false);const split=root.__HAPIL_PORTRAIT_SPLIT_RC108__,portrait=split?.active(s),cams=split?.metrics?.()?.cameras,bossLeft=root.__HAPIL_PERSONA_DUEL_RC134__?.swapped(s)===true;
    const tint=(seam,y,height)=>{seam=cl(seam,0,w);ctx.save();try{ctx.filter='none';ctx.globalCompositeOperation='multiply';ctx.fillStyle='#ff6078';ctx.fillRect(bossLeft?0:seam,y,bossLeft?seam:w-seam,height);}finally{ctx.restore();}};
    if(portrait&&cams?.boss&&cams?.hero){const half=Math.floor(h/2);for(const [slot,y,height]of [['boss',0,half],['hero',half,h-half]]){const c=cams[slot];tint((c.x+640*c.scale)*w/1280,y,height);}}
    else tint(w/2,0,h);
   }else pass(0,w,mode==='boss');
   if(s.innerFinalRC133?.clash?.used&&s.time<s.innerFinalRC133.clash.until){ctx.filter='none';ctx.globalAlpha=.96;ctx.textAlign='center';ctx.textBaseline='top';ctx.font='700 14px system-ui,sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#07040c';ctx.strokeText('쌍각성 · 사몽의 나와 마주 서다',w/2,Math.max(58,h*.11));ctx.fillStyle='#fff3f5';ctx.fillText('쌍각성 · 사몽의 나와 마주 서다',w/2,Math.max(58,h*.11));}
  }finally{ctx.restore();}metrics.frames++;return true;
 }
 function frame(s,a){if(s.innerFinalRC133?.phase==='reveal'&&art.portrait)return art.portrait;const awake=s.innerFinalRC133?.awake>0,list=awake?art.awakeFrames:art.frames; if(!Array.isArray(list)||list.length!==8)return awake?art.awakening:art.body; const dx=s.x-a.x,dy=s.y-a.y,theta=Math.atan2((dx+dy)*.5,dx-dy),index=((Math.round((theta-Math.PI/2)/(Math.PI/4))%8)+8)%8;return list[index];}
 function map(s,fallback){return active(s)&&art.ready?(s.innerFinalRC133.phase==='reveal'?(art.reveal??art.map):art.map):fallback;}
  function configure(value){if(!value?.ready||!value.map||!value.body||!value.awakening||!deck.every(k=>approvedSprite(k.key,value.skillMap?.[k.key])&&approvedSprite(k.key,value.samongSkillMap?.[k.key])&&value.skillMap[k.key].split('?')[0]===skillPath(k.key)&&value.samongSkillMap[k.key].split('?')[0]===sourceSkillPath(k.key)))return false;Object.assign(art,value,{frames:value.frames??null,awakeFrames:value.awakeFrames??null});return true;}
 function bind(value){native=value;return true;}
 function snapshot(s){root.__HAPIL_PERSONA_DUEL_RC134__?.enforce(s);const m=s?.innerFinalRC133,a=boss(s);return clean(m?{...m,hp:a?.hp??m.hp,x:a?.x??m.x,y:a?.y??m.y}:null);}
 function restore(s,raw){
  releaseMoodLayer();const m=clean(raw);root.__HAPIL_PERSONA_DUEL_RC134__?.release(s);cleanup(s);s.enemies=(s.enemies??[]).filter(a=>a.id!==ID);delete s.innerFinalRC133;
  if(!m||(m.entry==='developer-777'&&!root.__HAPIL_DEVELOPER_MAPS_RC133__?.has(s)))return;
  // A completed run keeps its history in the village or another mode. Its
  // encounter flags and actor cleanup apply only to the actual Dream arena.
  if(m.phase==='complete'){
   s.innerFinalRC133=m;metrics.restores++;
   if(enabled(s)){cleanup(s,'c104-boss');s.enemies=s.enemies.filter(a=>a.id!=='c104-boss'&&!a.dreamCosmicTrialV31346);s.dreamFinalV31346={version:1,index:6,phase:'complete',complete:true};s.bossDefeated=m.entry!=='developer-777';}
   return;
  }
  if(!enabled(s))return;cleanup(s,'c104-boss');s.innerFinalRC133=m;metrics.restores++;
  s.dreamFinalV31346={version:1,index:6,phase:'complete',complete:true};s.enemies=s.enemies.filter(a=>!a.dreamCosmicTrialV31346&&a.id!=='c104-boss');s.bossDefeated=false;build(s,m);
 }

 const api=Object.freeze({version:'RC133',id:ID,traits,deck,queueAdmission:Object.freeze({limit:HOSTILE_QUEUE_LIMIT,maxRetryCount:MAX_QUEUE_RETRY_COUNT,baseDelaySeconds:QUEUE_RETRY_BASE_SECONDS,maxDelaySeconds:QUEUE_RETRY_MAX_SECONDS}),acceptsSkill,health,enabled,active,encounter,boss,growth,clean,start,developerStart,beforeDeath,onPlayerLethal,startClash,tick,mood,compose,prepareHud,map,frame,configure,bind,snapshot,restore,red,attackSpeedFactor,redTimeActive,redTimeBlocks,metrics:()=>({...metrics,artReady:art.ready,compositorActive:!!moodLayer})});
 root.__HAPIL_INNER_FINAL_RC133__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
