/* RC137: awakening owns boss cast admission, never the player's input clock. */
(function(root){
 'use strict';
 const n=(v,d=0)=>Number.isFinite(v)?v:d;
 const QUEUES=['pendingHits','impactQueue','narrativeCasts','telekineticCasts','spatialRiftCasts','cosmicCastsV31318','bossLaserCastsV31330','bossUltimateCastsV31334','dreamMirrorLasersV31347'];
 const COOLDOWNS=['finaleReadyAtV31334','laserReadyAtV31330','laserReadyAtV31331','laserReadyAtRC94','bloodReadyRC16','dynamicBossReadyAtV31315','spectacleReadyAtV31317','gapChargeReadyAtV31226'];
 const CAPTURE=['readyAt','patternReadyAt','bossCombatPatternReadyAtV31230',...COOLDOWNS];
 function awake(s){return root.__HAPIL_SAMONG_RC91__?.active(s)===true||n(s?.innerFinalRC133?.awake)>0;}
 function owner(s,q){const id=q?.sourceId??q?.ownerId??q?.ownerIdV31331;return s?.enemies?.find(a=>a.id===id);}
 function boss(a){return !!(a?.boss||a?.midboss)&&!a.friendly&&!a.visualOnly;}
 function bullet(s,q){return q?.rc137Bullet===true||(s?.hostileProjectiles??[]).includes(q);}
 function exempt(a){const classify=root.__HAPIL_ENEMY_CLASSES_RC137__;if(classify?.postAwakeningException)return classify.postAwakeningException(a);return a?.cosmicLuciferV31318===true||a?.episodeCosmicFinalV387===true||a?.dreamCosmicTrialV31346===true||a?.rc133InnerBoss===true||['c104-boss','inner-evil-rc133','a11-cosmic-v31318','kair-great-01','kair-great-02','kair-great-03','kair-great-04','kair-great-05','kair-great-06'].includes(a?.id);}
 function memory(s){let m=s.rc137BossAwakening;if(!m||m.zone!==s.zone)m=s.rc137BossAwakening={version:1,zone:s.zone,wasAwake:false,post:false};return m;}
 function cooldownFactor(s,a){return boss(a)&&memory(s).post&&!awake(s)&&!exempt(a)?1.77:1;}
 function scaleCooldowns(s,a,keys=COOLDOWNS){if(!boss(a))return;const factor=cooldownFactor(s,a);if(factor===1)return;const marks=a.rc137NonbulletCooldowns??={};for(const key of keys){const at=n(a[key]);if(at>s.time&&marks[key]!==at){a[key]=s.time+(at-s.time)*factor;marks[key]=a[key];}}}
 function castKey(p){return String(typeof p==='string'?p:p?.key??p?.name??p?.family??p?.kind??'nonbullet').slice(0,160);}
 function isBulletCard(p){return p?.bulletOnly===true||p?.projectileOnly===true||['rolling-ordnance','snipe-sword-wave','bullet','bullets','danmaku'].includes(typeof p==='string'?p:p?.family??p?.kind)||p?.shape==='bullet'||p?.shape==='projectile';}
 function capture(s,a){return {timers:Object.fromEntries(CAPTURE.map(k=>[k,a?.[k]])),hits:new Set(QUEUES.flatMap(k=>s[k]??[])),shots:new Set(s.hostileProjectiles??[])};}
 function reuse(a){return a.rc137NonbulletReuse??={};}
 function reusable(s,a,p){if(isBulletCard(p))return true;const row=a?.rc137NonbulletReuse?.[castKey(p)];return !row||row.zone!==s.zone||row.until<=s.time;}
 function castCompleted(s,a,p,before,result){
  if(!boss(a))return;
  const hits=QUEUES.flatMap(k=>s[k]??[]).filter(q=>q.sourceId===a.id&&q.damage>0&&!q.pureTelegraphV31230&&!q.pureTelegraph&&(!before||!before.hits.has(q)));
  const shots=(s.hostileProjectiles??[]).some(q=>q.sourceId===a.id&&(!before||!before.shots.has(q)));
  const explicitNonbullet=['laser','finale','dynamic','spectacle','melee','floor'].includes(p);
  if(isBulletCard(p)||!hits.length&&!explicitNonbullet&&(shots||!result))return;
  const changed=CAPTURE.filter(k=>Number.isFinite(a[k])&&a[k]>s.time&&(!before||a[k]!==before.timers[k]));
  if(!changed.length)return;
  a.rc137LastCastBullet=false;
  const anchor=Math.max(s.time,...['recoverUntil','activePatternUntil','atomicCastUntil31210'].map(k=>n(a[k],s.time))),base=Math.max(anchor,...changed.map(k=>a[k]));
  const factor=cooldownFactor(s,a),key=castKey(p),rows=reuse(a);
  rows[key]={zone:s.zone,until:anchor+(base-anchor)*factor,base,anchor,applied:factor>1};
  if(Object.keys(rows).length>64)for(const k of Object.keys(rows).filter(k=>rows[k].zone!==s.zone||rows[k].until<=s.time))delete rows[k];
  scaleCooldowns(s,a,changed.filter(k=>COOLDOWNS.includes(k)));
 }
 function transitionCooldowns(s,a){
  scaleCooldowns(s,a);
  for(const row of Object.values(a.rc137NonbulletReuse??{}))if(row.zone===s.zone&&!row.applied&&row.until>s.time){const anchor=Math.max(s.time,row.anchor);row.until=anchor+(row.until-anchor)*cooldownFactor(s,a);row.applied=cooldownFactor(s,a)>1;}
 }
 function suppress(s,q){if(!q||bullet(s,q)||!boss(owner(s,q)??q))return false;if(awake(s)){q.rc137AwakeningSealed=true;q.damageSuppressedV31226=true;}return q.rc137AwakeningSealed===true;}
 function permitDamage(s,q){if(q?.rc137AwakeningSealed)return false;if(q&&!bullet(s,q)&&QUEUES.some(key=>(s[key]??[]).some(c=>c.rc137AwakeningSealed&&c.sourceId===q.sourceId&&(c.id!=null&&c.id===q.id||c.id!=null&&c.id===q.raidUltimateCastIdRC25||Number.isFinite(c.born)&&c.born===q.born))))return false;if(!awake(s)||bullet(s,q))return true;return !boss(owner(s,q)??q);}
 function travelDelta(s,q,dt){
  // The Persona duel keeps its actors on separate halves. Its only offensive
  // reach is a travelling projectile, including during either awakening.
  // The general boss bullet slow otherwise lets a seven second awakening
  // expire before these shots can reach the other half of the arena.
  if(q?.rc133InnerShot===true&&q.sourceId==='inner-evil-rc133'&&owner(s,q)?.rc133InnerBoss===true)return dt;
  return awake(s)&&boss(owner(s,q)??q)?dt*.06:dt;
 }
 function expired(s,q){return Number.isFinite(q?.rc137ExpiresAt)&&s.time>=q.rc137ExpiresAt;}
 function sealCharge(s,a){const q=a?.gapChargeV31226;if(q&&(awake(s)||q.rc137AwakeningSealed)){q.rc137AwakeningSealed=true;if(s.time>=q.endAt){a.gapChargeV31226=null;if(a.activePattern==='gapChargeV31226')a.activePattern='';}return true;}return false;}
 function reset(s){s.rc137BossAwakening={version:1,zone:s.zone,wasAwake:false,post:false};for(const a of s.enemies??[]){delete a.rc137NonbulletReuse;delete a.rc137NonbulletCooldowns;delete a.rc137LastCastBullet;delete a.rc137BulletReadyAt;}}
 function prepare(s){if(!s)return;const m=memory(s),on=awake(s);if(m.wasAwake&&!on){m.post=true;for(const a of s.enemies??[])if(a.rc137LastCastBullet===false)transitionCooldowns(s,a);}m.wasAwake=on;
  for(const a of s.enemies??[])if(boss(a))sealCharge(s,a);
  if(on)for(const key of QUEUES)for(const q of s[key]??[])suppress(s,q);
  for(const q of s.hostileProjectiles??[]){
   // Hidden Persona shots are the boss's authored long flight attack. Their
   // native nominal `life` is not a terminal condition; let contact or the
   // actual map boundary resolve them. Clear a legacy awakening deadline too.
   if(q?.rc133InnerShot===true&&q.sourceId==='inner-evil-rc133'){
    if(on&&boss(owner(s,q)??q))q.rc137Bullet=true;
    delete q.rc137ExpiresAt;
    continue;
   }
   if(on&&boss(owner(s,q)??q)){q.rc137Bullet=true;q.rc137ExpiresAt??=s.time+9;}
  }
 }
 function seconds(v){return Math.max(0,Math.min(360,n(v)));}
 function clean(raw,zone){if(raw?.version!==1||raw.zone!==zone)return null;return {version:1,zone,wasAwake:raw.wasAwake===true,post:raw.post===true,cooldowns:(Array.isArray(raw.cooldowns)?raw.cooldowns:[]).slice(0,96).filter(a=>typeof a?.id==='string'&&a.id.length<180).map(a=>({id:a.id,timers:Object.fromEntries(COOLDOWNS.filter(k=>Number.isFinite(a.timers?.[k])).map(k=>[k,seconds(a.timers[k])])),reuse:Object.fromEntries(Object.entries(a.reuse??{}).slice(0,64).filter(([key,v])=>key.length<=160&&v&&Number.isFinite(v.until)).map(([key,v])=>[key,{until:seconds(v.until),anchor:seconds(v.anchor),base:seconds(v.base),applied:v.applied===true}]))}))};}
 function snapshot(s){const m=s.rc137BossAwakening;if(!m)return null;return clean({...m,cooldowns:(s.enemies??[]).filter(a=>boss(a)&&a.hp>0).map(a=>({id:String(a.id),timers:Object.fromEntries(COOLDOWNS.filter(k=>Number.isFinite(a[k])&&a[k]>s.time).map(k=>[k,a[k]-s.time])),reuse:Object.fromEntries(Object.entries(a.rc137NonbulletReuse??{}).filter(([,v])=>v.zone===s.zone&&v.until>s.time).map(([key,v])=>[key,{until:v.until-s.time,anchor:v.anchor-s.time,base:v.base-s.time,applied:v.applied}]))}))},s.zone);}
 function restore(s,raw){const m=clean(raw,s.zone);s.rc137BossAwakening=m??{version:1,zone:s.zone,wasAwake:false,post:false};if(!m)return;for(const row of m.cooldowns){const a=s.enemies?.find(a=>String(a.id)===row.id);if(!a||!boss(a))continue;for(const [key,left]of Object.entries(row.timers)){a[key]=s.time+left;if(m.post)(a.rc137NonbulletCooldowns??={})[key]=a[key];}a.rc137LastCastBullet=false;a.rc137NonbulletReuse=Object.fromEntries(Object.entries(row.reuse).map(([key,v])=>[key,{zone:s.zone,until:s.time+v.until,anchor:s.time+v.anchor,base:s.time+v.base,applied:v.applied}]));}}
 function allowCast(s,a,p){return !boss(a)||(!awake(s)&&reusable(s,a,p));}
 function barrage(s,a,emit){if(!awake(s)||!boss(a)||a.hp<=0||a.rc133InnerBoss)return false;const at=n(a.rc137BulletReadyAt);if(at>s.time)return true;a.rc137BulletReadyAt=s.time+.42;
  const own=(s.hostileProjectiles??[]).filter(q=>q.sourceId===a.id);if(own.length>=24||(s.hostileProjectiles??[]).length>=144)return true;
  const before=(s.hostileProjectiles??[]).length;emit();const emitted=(s.hostileProjectiles??[]).slice(before);const room=Math.min(4,24-own.length,144-before),keep=new Set(emitted.slice(0,room));s.hostileProjectiles=s.hostileProjectiles.filter((q,i)=>i<before||keep.has(q));
  for(const [i,q]of [...keep].entries()){q.rc137Bullet=true;q.rc137ExpiresAt=s.time+9;q.motionReleaseAt31219=Math.max(n(q.motionReleaseAt31219),s.time+.18+i*.035);q.collisionDisabledUntil31219=q.motionReleaseAt31219;}
  return true;
 }
 root.__HAPIL_AWAKENING_RULES_RC137__=Object.freeze({clean,snapshot,restore,reset,sealCharge,awake,boss,bullet,exempt,memory,cooldownFactor,scaleCooldowns,capture,castKey,isBulletCard,reusable,castCompleted,suppress,permitDamage,travelDelta,expired,prepare,allowCast,barrage});
})(typeof window!=='undefined'?window:globalThis);
