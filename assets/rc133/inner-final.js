/* RC133: Dream's last authored cult-leader death opens the unconscious afterlife persona.
 * Native projectiles, collision reducers, save bridge and HUD remain authoritative. */
(function(root){
 'use strict';
 const ID='inner-evil-rc133',ZONE='cult04',n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d,cl=(v,a,b)=>Math.max(a,Math.min(b,n(v)));
 const metrics={entries:0,volleys:0,completed:0,frames:0,restores:0};let native=null;
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
 function enabled(s){return root.__HAPIL_SAMONG_RC91__?.enabled(s)===true&&s.zone===ZONE;}
 function active(s){return enabled(s)&&s.hp>0&&['reveal','fight'].includes(s.innerFinalRC133?.phase);}
 function boss(s){return s?.enemies?.find(a=>a.id===ID&&a.hp>0);}
 function growth(s,raw={}){const score=Math.log2(1+Math.max(0,n(raw.infinitePower)))+.08*Math.min(150,Object.values(raw).reduce((a,b)=>a+Math.max(0,n(b)),0));return cl(1+score*.045,1,2.1);}
 function cleanClash(raw){if(!raw||raw.version!==1)return {version:1,used:false,at:0,until:0,reason:null};return {version:1,used:raw.used===true,at:cl(raw.at,0,100000),until:cl(raw.until,0,100000),reason:['player','boss','both'].includes(raw.reason)?raw.reason:null};}
 function clean(raw){if(!raw||raw.version!==1||raw.zone!==ZONE||!['reveal','fight','complete'].includes(raw.phase))return null;const maxHp=cl(raw.maxHp,100,12600),hp=cl(raw.hp,0,maxHp),phase=hp<=0?'complete':raw.phase,fatalAt=Number.isFinite(raw.playerFatalAt)?n(raw.playerFatalAt,-1):-1;return {version:1,zone:ZONE,phase,entry:raw.entry==='developer-777'?'developer-777':'cult-death',hero:Object.hasOwn(traits,raw.hero)?raw.hero:'hwando',maxHp,hp:phase==='complete'?0:hp,scale:cl(raw.scale,1,2.1),elapsed:cl(raw.elapsed,0,100000),awake:phase==='complete'?0:cl(raw.awake,0,7),awakeningCooldown:cl(raw.awakeningCooldown,0,35),shotDelay:cl(raw.shotDelay,0,10),cycle:Math.floor(cl(raw.cycle,0,1000000)),x:cl(raw.x,1,31),y:cl(raw.y,1,31),intro:cl(raw.intro,0,2),clash:cleanClash(raw.clash),clashFreeze:cl(raw.clashFreeze,0,.2),playerFatalAt:fatalAt<0?-1:cl(fatalAt,0,100000)};}
 function cleanup(s,id=ID){if(!s)return;root.__HAPIL_MODES_V31346__?.dreamFinal?.cleanup(s,id);for(const key of ['effects','floatTexts'])if(Array.isArray(s[key]))s[key]=s[key].filter(q=>q.sourceId!==id&&q.ownerId!==id);}
 function build(s,m){
  const template=root.__HAPIL_RC86_BRIDGE__?.actor(ZONE,'c104-boss');if(!template||!native)return null;
  const a=root.__HAPIL_RC86_BRIDGE__.cloneEnemy(template,ZONE),own=native.heroes.find(h=>h.id===m.hero);
  Object.assign(a,{id:ID,name:'사후의 나 · 악한 무의식',kind:'sentinel',hp:m.hp,maxHp:m.maxHp,boss:true,midboss:false,rc133InnerBoss:true,
   x:m.x,y:m.y,scale:1,fixedPhase:1,currentPhase:1,phaseCount:1,phaseMax:1,humanPhase0:false,narrativeMultiPhase:false,
   sprite:art.ready?frame(s,{x:m.x,y:m.y}):(own?.sprite??template.sprite),phaseSprites:null,actionSprites:null,phaseScales:null,patternSet:'',
   readyAt:1e12,patternReadyAt:1e12,attackAt:0,invulnerableUntil:s.time+m.intro,staggerUntil:0,recoverUntil:0,
   noBossSummons:true,requiredForClear:true,rc133GrowthScale:m.scale,navPath:[],moveDx:0,moveDy:0,moveVx:0,moveVy:0});
  delete a.actionSpritesByPhase;delete a.standProfileRC69;delete a.dreamCosmicTrialV31346;delete a.samongStatsRC91;delete a.hellStatsV31322;
  // Enroll a stable baseline so the existing Dream scaler cannot double this bounded health again.
  a.samongStatsRC91={version:1,factor:2,baseMaxHp:m.maxHp/2,observedMaxHp:m.maxHp,fields:{}};
  s.enemies=s.enemies.filter(e=>e.id!==ID);s.enemies.push(a);return a;
 }
 function begin(s,leader,entry){
  if(!native||!leader)return false;
  const raw=root.__HAPIL_CONTROLS_V31329__?.binding?.passives?.current??{},scale=growth(s,raw),maxHp=Math.round(Math.max(700,Math.min(6000,n(leader.maxHp,1500)*.8))*scale);
  const p=root.__HAPIL_RC86_BRIDGE__.point(ZONE,23.2,10,.8);
  if(entry==='developer-777'){for(const a of s.enemies)cleanup(s,a.id);cleanup(s);s.enemies=[];s.spawnedWaves=new Set([1,2,3,4]);}
  else {cleanup(s,leader.id);s.enemies=s.enemies.filter(e=>e!==leader);}
  s.dreamFinalV31346={version:1,index:6,phase:'complete',activeId:null,safeUntil:0,complete:true};
  s.innerFinalRC133={version:1,zone:ZONE,phase:'reveal',entry,hero:s.activeHeroId,maxHp,hp:maxHp,scale,elapsed:0,awake:0,awakeningCooldown:14,shotDelay:3,cycle:0,x:p.x,y:p.y,intro:2,clash:cleanClash(null),clashFreeze:0,playerFatalAt:-1};
  s.bossDefeated=false;if(entry==='cult-death')s.completedZones?.delete(ZONE);s.targetEnemyId=ID;s.invulnerableUntil=Math.max(n(s.invulnerableUntil),s.time+2);
  build(s,s.innerFinalRC133);metrics.entries++;root.__HAPIL_MEDIA_AUDIO_RC133__?.event('innerReveal',s,s,'reveal');
  (s.floatTexts??=[]).push({id:s.fxSerial++,x:s.x,y:s.y,born:s.time,duration:1.8,text:entry==='developer-777'?'777 · 사후의 나 히든 결전':'교주의 죽음 뒤, 사후에 숨겨 둔 나의 악이 깨어난다',color:'#f3ccdf',critical:true});
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
   const m=s.innerFinalRC133,nearFatal=m.playerFatalAt>=0&&s.time-m.playerFatalAt<=.9;
   if(!m.clash?.used&&(s.hp<=0||nearFatal)&&startClash(s,a,s.hp<=0?'both':'boss'))return true;
   m.phase='complete';m.hp=0;m.awake=0;cleanup(s);metrics.completed++;if(m.entry==='developer-777'){s.enemies=s.enemies.filter(e=>e.id!==ID);s.targetEnemyId=null;s.bossDefeated=false;return true;}
  }
  return false;
 }
 function encounter(s){return enabled(s)&&['reveal','fight'].includes(s.innerFinalRC133?.phase)&&s.enemies?.some(a=>a.id===ID);}
 function startClash(s,a,reason='both'){
  const m=s?.innerFinalRC133;if(!encounter(s)||!a||m.clash?.used)return false;
  const A=root.__HAPIL_SAMONG_RC91__;if(typeof A?.activateFinalClash!=='function')return false;
  const party=root.__HAPIL_PARTY_V31322__;if(party?.state===s&&(party.status?.role==='guest'||party.status?.paused||party.status?.disconnected))return false;
  const alreadyAwake=A.active(s),oldBossHp=a.hp,oldPlayerHp=s.hp,oldPlayerCeiling=s.heroHealingCeiling,oldPlayerStatus=s.heroStatus,oldAwake=m.awake,oldCooldown=m.awakeningCooldown,oldShotDelay=m.shotDelay;
  // One finite encounter token: both sides return at a low, bounded health
  // value and awaken together. The hidden encounter cannot farm more lives.
  m.clash={version:1,used:true,at:s.time,until:s.time+7,reason};m.clashFreeze=.2;
  a.hp=Math.max(1,Math.ceil(a.maxHp*.22));a.invulnerableUntil=Math.max(n(a.invulnerableUntil),s.time+.55);a.atomicCastUntil31210=Math.max(n(a.atomicCastUntil31210),s.time+.55);
  m.hp=a.hp;m.awake=7;m.awakeningCooldown=28;m.shotDelay=.9;m.playerFatalAt=-1;
  s.invulnerableUntil=Math.max(n(s.invulnerableUntil),s.time+.9);s.targetEnemyId=ID;
  if(alreadyAwake){s.hp=Math.max(1,Math.ceil(s.maxHp*.22));s.heroHealingCeiling=s.hp;s.heroStatus='死夢覺醒 · 쌍각성';}
  else if(!A.activateFinalClash(s)){m.clash=cleanClash(null);m.clashFreeze=0;m.playerFatalAt=n(s.time,-1);a.hp=oldBossHp;m.hp=oldBossHp;m.awake=oldAwake;m.awakeningCooldown=oldCooldown;m.shotDelay=oldShotDelay;s.hp=oldPlayerHp;s.heroHealingCeiling=oldPlayerCeiling;s.heroStatus=oldPlayerStatus;return false;}
  root.__HAPIL_MEDIA_AUDIO_RC133__?.event('innerAwake',s,a,'duel-clash');
  (s.floatTexts??=[]).push({id:s.fxSerial++,sourceId:ID,x:a.x,y:a.y,born:s.time,duration:2.3,text:'쌍각성 · 검백과 흑적, 서로를 향해 다시 선다',color:'#f3d9e8',critical:true});
  metrics.clashes=(metrics.clashes??0)+1;return true;
 }
 function onPlayerLethal(s){
  if(!encounter(s)||s.hp>0)return false;const m=s.innerFinalRC133,a=s.enemies.find(e=>e.id===ID);
  if(m.clash?.used)return false;
  m.playerFatalAt=n(s.time,-1);
  // If the player falls while the boss is already at the final 18%, fire the
  // paired finale before the normal respawn path can erase the encounter.
  if(a&&a.hp>0&&a.hp<=a.maxHp*.18)return startClash(s,a,'player');
  return false;
 }
 function tick(s,dt){
  if(!active(s)||!native||!(dt>0)||native.locked(s)||s.paused||s.pause||n(s.timeStopUntil)>s.time)return;
  const party=root.__HAPIL_PARTY_V31322__;if(party?.state===s&&(party.status?.role==='guest'||party.status?.paused||party.status?.disconnected))return;
  const m=s.innerFinalRC133,a=boss(s);if(!a)return;
  dt=cl(dt,0,.1);m.elapsed+=dt;m.hp=a.hp;m.x=a.x;m.y=a.y;m.intro=Math.max(0,m.intro-dt);m.clashFreeze=Math.max(0,n(m.clashFreeze)-dt);
  a.moveDx=a.moveDy=a.moveVx=a.moveVy=0;a.navPath=[];a.readyAt=a.patternReadyAt=1e12;
  if(m.clashFreeze>0)return;
  if(m.intro>0)return;m.phase='fight';m.awake=Math.max(0,m.awake-dt);m.awakeningCooldown=Math.max(0,m.awakeningCooldown-dt);
  if(m.awakeningCooldown<=0){m.awake=7;m.awakeningCooldown=28;root.__HAPIL_MEDIA_AUDIO_RC133__?.event('innerAwake',s,a,'awake-'+m.cycle);
   (s.floatTexts??=[]).push({id:s.fxSerial++,x:a.x,y:a.y,born:s.time,duration:.9,text:'惡夢覺醒 · 나의 힘을 기억한다',color:'#ff8ca4',critical:true});}
  if(art.ready)a.sprite=frame(s,a);
  m.shotDelay=Math.max(0,m.shotDelay-dt);const trait=traits[m.hero]??traits.hwando,count=trait.count;s.hostileProjectiles??=[];if(m.shotDelay>0||s.hostileProjectiles.length+count>72)return;
  // Borrow the hero's role/motif, never its unbounded damage or invulnerability.
  const angle=Math.atan2(s.y-a.y,s.x-a.x),distance=Math.max(2.8,Math.hypot(s.x-a.x,s.y-a.y)),gap=Math.asin(Math.min(.75,1.3/distance))+.18,warning=trait.warning??.65;
  a.atomicCastUntil31210=s.time+1.1;
  const before=s.hostileProjectiles.length,pattern=m.hero,turn=(m.cycle%8)*.045;
  for(let i=0;i<count;i++){
   const paired=(i%2?1:-1),rank=Math.floor(i/2);let theta;
   if(m.hero==='seoha')theta=angle+paired*(.06+rank*.27)+turn;
   else if(m.hero==='neon')theta=angle+paired*(.12+rank*.31)+(m.cycle%2?-.19:.19);
   else if(m.hero==='michaela')theta=angle+([-.72,.72,-.24,.24][i%4])+turn;
   else if(m.hero==='lauren')theta=angle+paired*(.1+rank*.2)+Math.sin(m.cycle*.7)*.24;
   else if(m.hero==='hunter')theta=angle+paired*(.035+rank*.085)+(m.cycle%2?.11:-.11);
   else if(m.hero==='slayer')theta=angle+((i/(count-1))-.5)*trait.spread*2;
   else if(m.hero==='gunner')theta=angle+i*Math.PI*2/count+m.cycle*.31;
   else theta=angle+paired*(gap+rank*trait.spread)+turn;
   const stage=m.hero==='seoha'||m.hero==='hunter'?rank:Math.floor(i/3),speed=Math.min(4.8,trait.speed+(m.awake>0?.6:0));
   native.bullet(s,a,{vx:Math.cos(theta)*speed,vy:Math.sin(theta)*speed,radius:.24,damage:Math.min(20,10*m.scale*(m.awake>0?1.2:1)),life:trait.life,frozenUntil:s.time+warning+stage*.08,homingMode31212:'none',patternKind:'rc95-volley',status:'none',color:trait.color,accent:'#fff0e7',sprite:art.ready?(art.traitSkills?.[m.hero]??art.skills[m.cycle%art.skills.length]):null,label:trait.name+' · 무의식의 반향',rc133Pattern:pattern,rc133Cycle:m.cycle,rc133ShotIndex:i});
  }
  const emitted=s.hostileProjectiles.slice(before);if(!emitted.length){m.shotDelay=.22;return;}
  for(const q of emitted){q.rc133InnerShot=true;q.rc133Trait=m.hero;const theta=Math.atan2(q.vy,q.vx),boundedSpeed=Math.min(4.8,trait.speed+(m.awake>0?.6:0));q.vx=Math.cos(theta)*boundedSpeed;q.vy=Math.sin(theta)*boundedSpeed;q.radius=Math.min(.32,n(q.radius,.24));q.damage=Math.min(20,Math.max(0,n(q.damage)));q.collisionDisabledUntil31219=Math.max(n(q.collisionDisabledUntil31219),n(q.frozenUntil,s.time+warning));}
  (s.floatTexts??=[]).push({id:s.fxSerial++,sourceId:ID,x:a.x,y:a.y,born:s.time,duration:warning,text:trait.name,color:trait.color,critical:false});
  if(s.hostileProjectiles.length>before)root.__HAPIL_MEDIA_AUDIO_RC133__?.event('innerShot',s,a,'volley-'+m.cycle);
  m.cycle++;m.shotDelay=m.awake>0?2.1:2.8;metrics.volleys++;
 }
 function mood(s){if(!active(s))return 'normal';const p=root.__HAPIL_SAMONG_RC91__.active(s),b=s.innerFinalRC133.awake>0;return p&&b?'opposition':p?'player':b?'boss':'normal';}
 function compose(ctx,s,canvas){
  const mode=mood(s);if(mode==='normal'||!ctx||!canvas)return false;
  const w=canvas.width,h=canvas.height;ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
   const pass=(x,width,bossSide)=>{ctx.save();try{ctx.beginPath();ctx.rect(x,0,width,h);ctx.clip();ctx.filter='grayscale(1) contrast(1.08)';ctx.drawImage(canvas,0,0);ctx.filter='none';if(bossSide){ctx.globalCompositeOperation='multiply';ctx.fillStyle='#ff6078';ctx.fillRect(x,0,width,h);}}finally{ctx.restore();}};
   if(mode==='opposition'){pass(0,w/2,false);pass(w/2,w/2,true);ctx.fillStyle='#eedee4';ctx.fillRect(w/2-1,0,2,h);}else pass(0,w,mode==='boss');
   if(s.innerFinalRC133?.clash?.used&&s.time<s.innerFinalRC133.clash.until){ctx.filter='none';ctx.globalAlpha=.96;ctx.textAlign='center';ctx.textBaseline='top';ctx.font='700 14px system-ui,sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#07040c';ctx.strokeText('쌍각성 · 사몽의 나와 마주 서다',w/2,Math.max(58,h*.11));ctx.fillStyle='#fff3f5';ctx.fillText('쌍각성 · 사몽의 나와 마주 서다',w/2,Math.max(58,h*.11));}
  }finally{ctx.restore();}metrics.frames++;return true;
 }
 function frame(s,a){if(s.innerFinalRC133?.phase==='reveal'&&art.portrait)return art.portrait;const awake=s.innerFinalRC133?.awake>0,list=awake?art.awakeFrames:art.frames; if(!Array.isArray(list)||list.length!==8)return awake?art.awakening:art.body; const dx=s.x-a.x,dy=s.y-a.y,theta=Math.atan2((dx+dy)*.5,dx-dy),index=((Math.round((theta-Math.PI/2)/(Math.PI/4))%8)+8)%8;return list[index];}
 function map(s,fallback){return active(s)&&art.ready?(s.innerFinalRC133.phase==='reveal'?(art.reveal??art.map):art.map):fallback;}
 function configure(value){if(!value?.ready||!value.map||!value.body||!value.awakening||!value.skills?.length)return false;Object.assign(art,value,{frames:value.frames??null,awakeFrames:value.awakeFrames??null});return true;}
 function bind(value){native=value;return true;}
 function snapshot(s){const m=s?.innerFinalRC133,a=boss(s);return clean(m?{...m,hp:a?.hp??m.hp,x:a?.x??m.x,y:a?.y??m.y}:null);}
 function restore(s,raw){
  const m=clean(raw);cleanup(s);s.enemies=(s.enemies??[]).filter(a=>a.id!==ID);delete s.innerFinalRC133;
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

 const api=Object.freeze({version:'RC133',id:ID,traits,enabled,active,encounter,boss,growth,clean,start,developerStart,beforeDeath,onPlayerLethal,startClash,tick,mood,compose,map,frame,configure,bind,snapshot,restore,metrics:()=>({...metrics,artReady:art.ready})});
 root.__HAPIL_INNER_FINAL_RC133__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
