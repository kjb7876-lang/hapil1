/* RC137: awakening owns boss cast admission, never the player's input clock. */
(function(root){
 'use strict';
 const n=(v,d=0)=>Number.isFinite(v)?v:d;
 const QUEUES=['pendingHits','impactQueue','narrativeCasts','telekineticCasts','spatialRiftCasts','cosmicCastsV31318','bossLaserCastsV31330','bossUltimateCastsV31334','dreamMirrorLasersV31347'];
 const COOLDOWNS=['readyAt','patternReadyAt','finaleReadyAtV31334','laserReadyAtV31330','laserReadyAtV31331','laserReadyAtRC94'];
 function awake(s){return root.__HAPIL_SAMONG_RC91__?.active(s)===true||n(s?.innerFinalRC133?.awake)>0;}
 function owner(s,q){const id=q?.sourceId??q?.ownerId??q?.ownerIdV31331;return s?.enemies?.find(a=>a.id===id);}
 function boss(a){return !!(a?.boss||a?.midboss)&&!a.friendly&&!a.visualOnly;}
 function bullet(s,q){return q?.rc137Bullet===true||(s?.hostileProjectiles??[]).includes(q);}
 function exempt(a){const classify=root.__HAPIL_ENEMY_CLASSES_RC137__;if(classify?.postAwakeningException)return classify.postAwakeningException(a);return a?.cosmicLuciferV31318===true||a?.episodeCosmicFinalV387===true||a?.dreamCosmicTrialV31346===true||a?.rc133InnerBoss===true||['c104-boss','inner-evil-rc133','a11-cosmic-v31318','kair-great-01','kair-great-02','kair-great-03','kair-great-04','kair-great-05','kair-great-06'].includes(a?.id);}
 function memory(s){let m=s.rc137BossAwakening;if(!m||m.zone!==s.zone)m=s.rc137BossAwakening={version:1,zone:s.zone,wasAwake:false,post:false};return m;}
 function cooldownFactor(s,a){return boss(a)&&memory(s).post&&!awake(s)&&!exempt(a)?1.77:1;}
 function scaleCooldowns(s,a,keys=COOLDOWNS){if(!boss(a))return;const factor=cooldownFactor(s,a);if(factor===1)return;const marks=a.rc137NonbulletCooldowns??={};for(const key of keys){const at=n(a[key]);if(at>s.time&&marks[key]!==at){a[key]=s.time+(at-s.time)*factor;marks[key]=a[key];}}}
 function castCompleted(s,a){if(!boss(a))return;a.rc137LastCastBullet=false;scaleCooldowns(s,a);}
 function suppress(s,q){if(!q||bullet(s,q)||!boss(owner(s,q)??q))return false;if(awake(s)){q.rc137AwakeningSealed=true;q.damageSuppressedV31226=true;}return q.rc137AwakeningSealed===true;}
 function permitDamage(s,q){if(q?.rc137AwakeningSealed)return false;if(q&&!bullet(s,q)&&QUEUES.some(key=>(s[key]??[]).some(c=>c.rc137AwakeningSealed&&c.sourceId===q.sourceId&&(c.id===q.id||c.id===q.raidUltimateCastIdRC25||Number.isFinite(c.born)&&c.born===q.born))))return false;if(!awake(s)||bullet(s,q))return true;return !boss(owner(s,q)??q);}
 function travelDelta(s,q,dt){return awake(s)&&boss(owner(s,q)??q)?dt*.06:dt;}
 function expired(s,q){return Number.isFinite(q?.rc137ExpiresAt)&&s.time>=q.rc137ExpiresAt;}
 function prepare(s){if(!s)return;const m=memory(s),on=awake(s);if(m.wasAwake&&!on){m.post=true;for(const a of s.enemies??[])if(a.rc137LastCastBullet===false)scaleCooldowns(s,a);}m.wasAwake=on;
  if(on)for(const key of QUEUES)for(const q of s[key]??[])suppress(s,q);
  for(const q of s.hostileProjectiles??[]){if(on&&boss(owner(s,q)??q)){q.rc137Bullet=true;q.rc137ExpiresAt??=s.time+9;} }
 }
 function clean(raw,zone){return raw?.version===1&&raw.zone===zone?{version:1,zone,wasAwake:raw.wasAwake===true,post:raw.post===true}:null;}
 function snapshot(s){return clean(s.rc137BossAwakening,s.zone);}
 function restore(s,raw){s.rc137BossAwakening=clean(raw,s.zone)??{version:1,zone:s.zone,wasAwake:false,post:false};}
 function allowCast(s,a){return !awake(s)||!boss(a);}
 function barrage(s,a,emit){if(!awake(s)||!boss(a)||a.hp<=0||a.rc133InnerBoss)return false;const at=n(a.rc137BulletReadyAt);if(at>s.time)return true;a.rc137BulletReadyAt=s.time+.42;
  const own=(s.hostileProjectiles??[]).filter(q=>q.sourceId===a.id);if(own.length>=24||(s.hostileProjectiles??[]).length>=144)return true;
  const before=(s.hostileProjectiles??[]).length;emit();const emitted=(s.hostileProjectiles??[]).slice(before);const room=Math.min(4,24-own.length,144-before),keep=new Set(emitted.slice(0,room));s.hostileProjectiles=s.hostileProjectiles.filter((q,i)=>i<before||keep.has(q));
  for(const [i,q]of [...keep].entries()){q.rc137Bullet=true;q.rc137ExpiresAt=s.time+9;q.motionReleaseAt31219=Math.max(n(q.motionReleaseAt31219),s.time+.18+i*.035);q.collisionDisabledUntil31219=q.motionReleaseAt31219;}
  return true;
 }
 root.__HAPIL_AWAKENING_RULES_RC137__=Object.freeze({clean,snapshot,restore,awake,boss,bullet,exempt,memory,cooldownFactor,scaleCooldowns,castCompleted,suppress,permitDamage,travelDelta,expired,prepare,allowCast,barrage});
})(typeof window!=='undefined'?window:globalThis);
