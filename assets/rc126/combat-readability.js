/* RC126: combat readability. Admission and asset accounting run in simulation,
   never in painters. Finite hazards keep their authored damage length. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.__HAPIL_COMBAT_READABILITY_RC126__=api;})(typeof window!=='undefined'?window:globalThis,function(root){
 'use strict';
 const JELLY='./assets/rc64/projectiles/danmaku-jellybean.webp',MAX_ASSETS=256;
 const finite=Number.isFinite,number=(v,d=0)=>finite(v)?v:d,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const clean=p=>typeof p==='string'?p.split(/[?#]/)[0].replace(/^\.\//,''):'';
 const hostile=q=>q&&!q.friendly&&!q.reflected&&!q.echoBoltV31368&&!q.partySlotV31322&&!q.alliedProjectileV31322;
 const stats={allocated:0,reusedAsJelly:0,volleys:0,staggered:0,finiteRepairs:0,cosmeticMerged:0,summonsSeparated:0};
 let installed=false,placement=null,projection=null;
 function ledger(s){
  let r=s.rc126AssetLedger;
  if(!r||r.version!==1||r.zone!==s.zone||!Array.isArray(r.used)||s.time<number(r.lastTime)){r={version:1,zone:s.zone,lastTime:s.time,used:[]};s.rc126AssetLedger=r;}
  r.lastTime=s.time;return r;
 }
 function sanitize(raw,zone){
  if(!raw||raw.version!==1||raw.zone!==zone||!Array.isArray(raw.used))return null;
  const used=[...new Set(raw.used.filter(p=>typeof p==='string'&&p.length<300&&/^assets\/[\w./-]+\.(webp|png)$/.test(p)&&!p.includes('..')))].slice(0,MAX_ASSETS);
  return{version:1,zone,lastTime:0,used};
 }
 function snapshot(s){const r=ledger(s);return{version:1,zone:r.zone,lastTime:0,used:r.used.slice(0,MAX_ASSETS)};}
 function restore(s,raw){const r=sanitize(raw,s.zone);if(r){r.lastTime=s.time;s.rc126AssetLedger=r;return true;}return false;}
 // One physical special projectile per canonical bitmap per map visit. Remaining
 // projectiles keep their damage/lifecycle and use the reusable jellybean bitmap.
 // Authored danmaku/cosmic painters and stationary warnings are not relabelled.
 function assign(s,q){
  if(!s||!finite(s.time)||!hostile(q)||q.rc126AssetFinal||q.danmakuV31316||q.cosmicShotV31318||q.spectacleShotV31317)return q;
  const moving=finite(q.vx)&&finite(q.vy),transit=!!q.bossImpactTransitV31232;
  if(!moving&&!transit)return q;
  const desired=root.__HAPIL_BLOODIED_FLIGHT_RC43__?.assetFor(s,q)||q.sprite||q.fallbackSprite;
  const key=clean(desired);if(!/^assets\/[\w./-]+\.(webp|png)$/.test(key)||key.includes('..'))return q;
  const r=ledger(s);let chosen=desired;
  if(key!==clean(JELLY)){
   if(r.used.includes(key)||r.used.length>=MAX_ASSETS){chosen=JELLY;stats.reusedAsJelly++;}
   else{r.used.push(key);stats.allocated++;}
  }
  q.rc126AssetFinal=true;q.rc126AssetKey=key;q.rc126Sprite=chosen;
  if(transit)q.bloodiedFlightRC43=chosen;
  return enforce(q);
 }
 function enforce(q){if(!q?.rc126AssetFinal||!q.rc126Sprite)return q;q.sprite=q.fallbackSprite=q.rc126Sprite;if(q.bossImpactTransitV31232)q.bloodiedFlightRC43=q.rc126Sprite;return q;}
 function prepare(s){if(!s||!finite(s.time))return;ledger(s);for(const q of s.hostileProjectiles??[])assign(s,q);}
 function waiting(q,time){return hostile(q)&&finite(q.rc126ReleaseAt)&&time<q.rc126ReleaseAt;}
 function volley(s,a,shots){
  const rows=shots.filter(q=>hostile(q)&&q.rc95Bullet&&!q.danmakuV31316&&!q.rc126Volley);
  if(!rows.length)return;stats.volleys++;
  for(let i=0;i<rows.length;i++){
   const q=rows[i],family=q.rc97Grammar||'fan',speed=Math.hypot(q.vx,q.vy);q.rc126Volley=true;
   q.homingMode31212='none';q.scatterHomingPrepared31211=true;
   // Alternating adjacent lanes avoid an exact serial stack without replacing
   // an authored ring, changing projectile count, or teleporting live shots.
   if(speed>0&&Math.hypot(q.x-a.x,q.y-a.y)<.2){
    const shift=(i%2?1:-1)*(.28+.12*(i%3)),dx=-q.vy/speed*shift,dy=q.vx/speed*shift;
    const wanted={x:clamp(q.x+dx,1.4,30.6),y:clamp(q.y+dy,1.4,30.6)},p=placement?placement(s,wanted):wanted;
    if(p&&finite(p.x)&&finite(p.y)&&Math.hypot(p.x-s.x,p.y-s.y)>=1.4){q.x=q.originX=q.previousX=p.x;q.y=q.originY=q.previousY=p.y;}
   }
   // Use the existing native signature mover, not a visual-only trajectory.
   if(family==='envy'||family==='obsession'){q.sineAmplitude31212=family==='envy'?1.6:1.1;q.sineFrequency31212=family==='envy'?5.2:3.8;q.curve=0;}
   const delay=i*.065,release=s.time+delay;
   q.rc126ReleaseAt=release;q.hideUntilRelease31219=delay>0;q.bodySpawned31219=true;
   for(const k of['frozenUntil','telegraphUntil31210','motionReleaseAt31219','collisionDisabledUntil31219','collisionDisabledUntilV31226'])q[k]=Math.max(number(q[k]),release);
   for(const k of['expiresAt','hardExpiresAt31213','hardExpiresAt31214','interruptProtectedUntil31210'])if(finite(q[k]))q[k]+=delay;
   if(delay>0)stats.staggered++;assign(s,q);
  }
 }
 function line(h){
  if(!h||![h.originX,h.originY,h.x,h.y,h.width,h.radius].every(finite)||h.width<0||h.radius<=0)return null;
  const dx=h.x-h.originX,dy=h.y-h.originY,d=Math.hypot(dx,dy);if(d<1e-8)return null;
  return{...h,x:h.originX+dx/d*h.radius,y:h.originY+dy/d*h.radius};
 }
 function native(h){const q=line(h);if(!q)return[];const a={x:q.originX,y:q.originY},b={x:q.x,y:q.y},m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};return[{a,b:m,width:q.width},{a:m,b,width:q.width}];}
 function allowCosmetic(s,e){
  if(!s||!e?.themeTerminalV31323||number(e.damage)>0)return true;
  const duplicates=(s.effects??[]).filter(p=>p.themeTerminalV31323&&number(p.damage)<=0&&s.time-number(p.born)<.12&&Math.hypot(p.x-e.x,p.y-e.y)<1.1);
  if(duplicates.length>=2){stats.cosmeticMerged++;return false;}return true;
 }
 function separateNew(s,before){
  if(!s||!placement||!projection)return;
  const enemies=s.enemies??[],prior=new Set(before),fixed=enemies.filter(a=>prior.has(a));
  for(const a of enemies){if(prior.has(a)||a.hp<=0||a.boss||a.midboss||a.friendly||a.visualOnly||a.objectiveStructureV31238||a.protectedNarrativeTargetV31307)continue;
   const candidates=[{x:a.x,y:a.y}];for(const r of[1.2,2.1,3])for(let j=0;j<8;j++)candidates.push({x:clamp(a.x+Math.cos(j*Math.PI/4)*r,1.5,30.5),y:clamp(a.y+Math.sin(j*Math.PI/4)*r,1.5,30.5)});
   let best={x:a.x,y:a.y},bestScore=-Infinity;
   for(const c of candidates){const p=placement(s,c);if(!p||!finite(p.x)||!finite(p.y)||Math.hypot(p.x-s.x,p.y-s.y)<2)continue;const v=projection(p.x,p.y);let score=160;for(const b of fixed){if(b.hp<=0||b.visualOnly)continue;const w=projection(b.x,b.y);score=Math.min(score,Math.hypot(v.x-w.x,v.y-w.y));}if(score>bestScore){best=p;bestScore=score;}if(score>=95)break;}
   if(Math.hypot(a.x-best.x,a.y-best.y)>1e-6){a.x=best.x;a.y=best.y;stats.summonsSeparated++;}fixed.push(a);
  }
 }
 function install(api={}){
  placement=api.place??placement;projection=api.project??projection;
  if(installed)return true;const top=root.__HAPIL_LASER_TOPOLOGY_RC108__;if(!top?.renderNative)return false;
  const draw=top.renderNative;
  root.__HAPIL_LASER_TOPOLOGY_RC108__=Object.freeze({...top,native,renderNative(ctx,h,project,image,settings,alpha){const q=line(h);if(!q)return true;if(Math.hypot(q.x-h.x,q.y-h.y)>1e-5)stats.finiteRepairs++;return draw(ctx,q,project,image,settings,alpha);}});
  installed=true;return true;
 }
 return Object.freeze({version:'RC126',JELLY,assign,enforce,prepare,waiting,volley,line,native,allowCosmetic,separateNew,snapshot,sanitize,restore,install,get installed(){return installed;},metrics:()=>({...stats})});
});
