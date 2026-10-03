/* RC133: Dream's last authored cult-leader death opens the unconscious afterlife persona.
 * Native projectiles, collision reducers, save bridge and HUD remain authoritative. */
(function(root){
 'use strict';
 const ID='inner-evil-rc133',ZONE='cult04',n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d,cl=(v,a,b)=>Math.max(a,Math.min(b,n(v)));
 const metrics={entries:0,volleys:0,completed:0,frames:0,restores:0};let native=null;
 const art={ready:false,map:null,body:null,awakening:null,skills:[]};
 function enabled(s){return root.__HAPIL_SAMONG_RC91__?.enabled(s)===true&&s.zone===ZONE;}
 function active(s){return enabled(s)&&s.hp>0&&['reveal','fight'].includes(s.innerFinalRC133?.phase);}
 function boss(s){return s?.enemies?.find(a=>a.id===ID&&a.hp>0);}
 function growth(s,raw={}){const score=Math.log2(1+Math.max(0,n(raw.infinitePower)))+.08*Math.min(150,Object.values(raw).reduce((a,b)=>a+Math.max(0,n(b)),0));return cl(1+score*.045,1,2.1);}
 function clean(raw){if(!raw||raw.version!==1||raw.zone!==ZONE||!['reveal','fight','complete'].includes(raw.phase))return null;const maxHp=cl(raw.maxHp,100,100000);return {version:1,zone:ZONE,phase:raw.phase,hero:typeof raw.hero==='string'?raw.hero.slice(0,40):'hwando',maxHp,hp:cl(raw.hp,0,maxHp),scale:cl(raw.scale,1,2.1),elapsed:cl(raw.elapsed,0,100000),awake:cl(raw.awake,0,7),awakeningCooldown:cl(raw.awakeningCooldown,0,35),shotDelay:cl(raw.shotDelay,0,10),cycle:Math.max(0,Math.floor(n(raw.cycle))),x:cl(raw.x,1,31),y:cl(raw.y,1,31),intro:cl(raw.intro,0,2)};}
 function cleanup(s){root.__HAPIL_MODES_V31346__?.dreamFinal?.cleanup(s,ID);}
 function build(s,m){
  const template=root.__HAPIL_RC86_BRIDGE__?.actor(ZONE,'c104-boss');if(!template||!native)return null;
  const a=root.__HAPIL_RC86_BRIDGE__.cloneEnemy(template,ZONE),own=native.heroes.find(h=>h.id===m.hero);
  Object.assign(a,{id:ID,name:'사후의 나 · 악한 무의식',kind:'sentinel',hp:m.hp,maxHp:m.maxHp,boss:true,midboss:false,rc133InnerBoss:true,
   x:m.x,y:m.y,scale:1,fixedPhase:1,currentPhase:1,phaseCount:1,phaseMax:1,humanPhase0:false,narrativeMultiPhase:false,
   sprite:art.ready?art.body:(own?.sprite??template.sprite),phaseSprites:null,actionSprites:null,phaseScales:null,patternSet:'',
   readyAt:1e12,patternReadyAt:1e12,attackAt:0,invulnerableUntil:s.time+m.intro,staggerUntil:0,recoverUntil:0,
   noBossSummons:true,requiredForClear:true,rc133GrowthScale:m.scale,navPath:[],moveDx:0,moveDy:0,moveVx:0,moveVy:0});
  delete a.actionSpritesByPhase;delete a.standProfileRC69;delete a.dreamCosmicTrialV31346;delete a.samongStatsRC91;delete a.hellStatsV31322;
  // Enroll a stable baseline so the existing Dream scaler cannot double this bounded health again.
  a.samongStatsRC91={version:1,factor:2,baseMaxHp:m.maxHp/2,observedMaxHp:m.maxHp,fields:{}};
  s.enemies=s.enemies.filter(e=>e.id!==ID);s.enemies.push(a);return a;
 }
 function start(s,leader){
  if(!enabled(s)||leader?.id!=='c104-boss'||leader.hp>0||s.innerFinalRC133?.phase==='complete'||active(s))return false;
  const raw=root.__HAPIL_CONTROLS_V31329__?.binding?.passives?.current??{},scale=growth(s,raw),maxHp=Math.round(Math.max(700,Math.min(6000,n(leader.maxHp,1500)*.8))*scale);
  const p=root.__HAPIL_RC86_BRIDGE__.point(ZONE,23.2,10,.8);
  root.__HAPIL_MODES_V31346__?.dreamFinal?.cleanup(s,leader.id);s.enemies=s.enemies.filter(e=>e!==leader);
  s.dreamFinalV31346={version:1,index:6,phase:'complete',activeId:null,safeUntil:0,complete:true};
  s.innerFinalRC133={version:1,zone:ZONE,phase:'reveal',hero:s.activeHeroId,maxHp,hp:maxHp,scale,elapsed:0,awake:0,awakeningCooldown:14,shotDelay:3,cycle:0,x:p.x,y:p.y,intro:2};
  s.bossDefeated=false;s.completedZones?.delete(ZONE);s.targetEnemyId=ID;s.invulnerableUntil=Math.max(n(s.invulnerableUntil),s.time+2);
  build(s,s.innerFinalRC133);metrics.entries++;
  (s.floatTexts??=[]).push({id:s.fxSerial++,x:s.x,y:s.y,born:s.time,duration:1.8,text:'교주의 죽음 뒤, 사후에 숨겨 둔 나의 악이 깨어난다',color:'#f3ccdf',critical:true});
  return true;
 }
 function beforeDeath(s,a){
  if(!enabled(s))return false;
  if(a?.id==='c104-boss')return start(s,a);
  if(a?.id===ID&&a.hp<=0&&s.innerFinalRC133){s.innerFinalRC133.phase='complete';s.innerFinalRC133.hp=0;s.innerFinalRC133.awake=0;cleanup(s);metrics.completed++;}
  return false;
 }
 function tick(s,dt){
  if(!active(s)||!native||!(dt>0))return;
  const m=s.innerFinalRC133,a=boss(s);if(!a)return;
  dt=cl(dt,0,.1);m.elapsed+=dt;m.hp=a.hp;m.x=a.x;m.y=a.y;m.intro=Math.max(0,m.intro-dt);
  a.moveDx=a.moveDy=a.moveVx=a.moveVy=0;a.navPath=[];a.readyAt=a.patternReadyAt=1e12;
  if(m.intro>0)return;m.phase='fight';m.awake=Math.max(0,m.awake-dt);m.awakeningCooldown=Math.max(0,m.awakeningCooldown-dt);
  if(m.awakeningCooldown<=0){m.awake=7;m.awakeningCooldown=28;
   (s.floatTexts??=[]).push({id:s.fxSerial++,x:a.x,y:a.y,born:s.time,duration:.9,text:'惡夢覺醒 · 나의 힘을 기억한다',color:'#ff8ca4',critical:true});}
  m.shotDelay=Math.max(0,m.shotDelay-dt);if(m.shotDelay>0||s.hostileProjectiles.length>72)return;
  // Borrow the hero's role/motif, never its unbounded damage or invulnerability.
  const role=root.__HAPIL_LOOP_V31365__?.role(m.hero),ranged=['hunter','gunner','neon'].includes(m.hero),count=ranged?6:4,
   angle=Math.atan2(s.y-a.y,s.x-a.x),distance=Math.max(2.8,Math.hypot(s.x-a.x,s.y-a.y)),gap=Math.asin(Math.min(.75,1.3/distance))+.18;
  a.atomicCastUntil31210=s.time+1.1;
  const before=s.hostileProjectiles.length;
  for(let i=0;i<count;i++){
   const side=i%2?1:-1,theta=angle+side*(gap+Math.floor(i/2)*.24),speed=m.awake>0?4.2:3.6;
   native.bullet(s,a,{vx:Math.cos(theta)*speed,vy:Math.sin(theta)*speed,radius:.24,damage:Math.min(20,10*m.scale*(m.awake>0?1.2:1)),life:6,frozenUntil:s.time+.65,homingMode31212:'none',patternKind:'rc95-volley',status:'none',color:'#f77792',accent:'#fff0e7',sprite:art.ready?art.skills[m.cycle%art.skills.length]:null,label:(role?.name??m.hero)+' · 무의식의 반향'});
  }
  for(const q of s.hostileProjectiles.slice(before)){q.rc133InnerShot=true;q.rc133Trait=m.hero;const theta=Math.atan2(q.vy,q.vx),speed=m.awake>0?4.2:3.6;q.vx=Math.cos(theta)*speed;q.vy=Math.sin(theta)*speed;q.radius=Math.min(.32,n(q.radius,.24));q.collisionDisabledUntil31219=Math.max(n(q.collisionDisabledUntil31219),s.time+.65);}
  m.cycle++;m.shotDelay=m.awake>0?2.1:2.8;metrics.volleys++;
 }
 function mood(s){if(!active(s))return 'normal';const p=root.__HAPIL_SAMONG_RC91__.active(s),b=s.innerFinalRC133.awake>0;return p&&b?'opposition':p?'player':b?'boss':'normal';}
 function compose(ctx,s,canvas){
  const mode=mood(s);if(mode==='normal'||!ctx||!canvas)return false;
  const w=canvas.width,h=canvas.height;ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
   const pass=(x,width,bossSide)=>{ctx.save();try{ctx.beginPath();ctx.rect(x,0,width,h);ctx.clip();ctx.filter='grayscale(1) contrast(1.08)';ctx.drawImage(canvas,0,0);ctx.filter='none';if(bossSide){ctx.globalCompositeOperation='multiply';ctx.fillStyle='#ff6078';ctx.fillRect(x,0,width,h);}}finally{ctx.restore();}};
   if(mode==='opposition'){pass(0,w/2,false);pass(w/2,w/2,true);ctx.fillStyle='#eedee4';ctx.fillRect(w/2-1,0,2,h);}else pass(0,w,mode==='boss');
  }finally{ctx.restore();}metrics.frames++;return true;
 }
 function map(s,fallback){return active(s)&&art.ready?art.map:fallback;}
 function configure(value){if(!value?.ready||!value.map||!value.body||!value.awakening||!value.skills?.length)return false;Object.assign(art,value);return true;}
 function bind(value){native=value;return true;}
 function snapshot(s){const m=s?.innerFinalRC133,a=boss(s);return clean(m?{...m,hp:a?.hp??m.hp,x:a?.x??m.x,y:a?.y??m.y}:null);}
 function restore(s,raw){const m=clean(raw);if(!m||!enabled(s))return;cleanup(s);s.innerFinalRC133=m;metrics.restores++;
  if(m.phase==='complete'){s.enemies=s.enemies.filter(a=>a.id!==ID&&a.id!=='c104-boss'&&!a.dreamCosmicTrialV31346);s.dreamFinalV31346={version:1,index:6,phase:'complete',complete:true};s.bossDefeated=true;return;}
  s.dreamFinalV31346={version:1,index:6,phase:'complete',complete:true};s.enemies=s.enemies.filter(a=>!a.dreamCosmicTrialV31346&&a.id!=='c104-boss');s.bossDefeated=false;build(s,m);
 }
 const api=Object.freeze({version:'RC133',id:ID,enabled,active,boss,growth,clean,start,beforeDeath,tick,mood,compose,map,configure,bind,snapshot,restore,metrics:()=>({...metrics,artReady:art.ready})});
 root.__HAPIL_INNER_FINAL_RC133__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
