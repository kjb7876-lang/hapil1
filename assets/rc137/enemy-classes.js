/* RC137: explicit authored enemy classes; no name substring classifications.
 * Per-packet pressure and new-cast reuse stay transient. Existing HP/growth,
 * warning/contact geometry and committed spell recovery deadlines are retained.
 */
(function(root){'use strict';
 const D=root.__HAPIL_ENEMY_CLASS_DATA_RC137__,byId=new Map(D.owners.map(r=>[r.id,r])),RANKS=[1,2,3,4,4.5,5,6,7,8];
 const profiles=Object.freeze(Object.fromEntries(RANKS.map((rank,i)=>[rank,Object.freeze({rank,damageFactor:1+i*.075,cooldownFactor:1-i*.035,linkBudget:Math.min(5,1+Math.floor(i/2)),threatIndex:(1+i*.075)/(1-i*.035)})])));
 const id=a=>a?.rc135FissionIdentity??a?.rc133TemplateId??a?.combatOwnerIdRC69??a?.templateId??a?.id;
 const hostile=a=>a&&!a.friendly&&!a.visualOnly&&!a.neutral&&!a.canonAlly&&!a.canonAllyV31217&&!a.canonicalAllyV31217&&!a.protectedObjective&&!a.objectiveStructureV31238&&!a.narrativeStructureV31238;
 function rank(a){if(!hostile(a))return 0;if(a.rc133InnerBoss||id(a)==='inner-evil-rc133')return 8;if(id(a)==='c104-boss')return 7;if(D.cosmicStateFlags.some(k=>a[k])||/^kair-great-0[1-6]$/.test(id(a)??'')||id(a)==='a11-cosmic-v31318')return 6;return byId.get(id(a))?.rank??(a.midboss?2:a.boss?3:1);}
 function profile(a){return profiles[rank(a)]??profiles[1];}
 function sourceActor(s,source){const owner=source?.ownerId??source?.sourceId??source?.sourceBossId??source?.ownershipSourceIdV31322??(source?.family==='actor'?source?.id:null);return (s?.enemies??[]).find(a=>a.id===owner)||null;}
 function incoming(s,source){const a=sourceActor(s,source);return a?profile(a).damageFactor:1;}
 function castReuse(s,a,before){if(!hostile(a)||!before)return;const factor=profile(a).cooldownFactor;for(const key of ['readyAt','patternReadyAt','bossCombatPatternReadyAtV31230','laserReadyAtRC94','bloodReadyRC16'])if(Number.isFinite(a[key])&&a[key]>s.time&&a[key]!==before[key]){const floor=Math.max(s.time,...['attackAt','recoverUntil','activePatternUntil','atomicCastUntil31210'].map(k=>Number.isFinite(a[k])?a[k]:s.time));a[key]=Math.max(floor,s.time+(a[key]-s.time)*factor);}a.enemyClassRC137=rank(a);}
 function count(s,a){return ['pendingHits','hostileProjectiles','telekineticCasts','spatialRiftCasts','bossLaserCastsV31330','bossUltimateCastsV31334'].reduce((n,k)=>n+(s[k]??[]).filter(q=>q.sourceId===a?.id).length,0);}
 function followup(s,a,before,emit){
  if(!hostile(a)||!(a.boss||a.midboss)||a.hp<=0||a.rc133InnerBoss||root.__HAPIL_AWAKENING_RULES_RC137__?.awake(s)||count(s,a)<=before||a.rc137ClassComboAt===s.time)return 0;
  const live=s.hostileProjectiles??[],room=Math.min(24-live.filter(q=>q.sourceId===a.id).length,144-live.length),links=Math.min(room,profile(a).linkBudget-1);if(links<=0)return 0;
  a.rc137ClassComboAt=s.time;const angle=Math.atan2(s.y-a.y,s.x-a.x),release=Math.max(s.time+.55,Number(a.recoverUntil??s.time),Number(a.atomicCastUntil31210??s.time));let added=0;
  for(let i=0;i<links;i++){const theta=angle+(i-(links-1)/2)*.21,q=emit({vx:Math.cos(theta)*3,vy:Math.sin(theta)*3,radius:.22,damage:10,life:9,frozenUntil:release+.14*i,collisionDisabledUntil31219:release+.14*i,homingMode31212:'none',patternKind:'class-followup-rc137',rc137ClassFollowup:true});if(q)added++;}
  return added;
 }
 function install(maps){for(const z of Object.values(maps))for(const a of z.enemies??[])if(hostile(a))a.enemyClassRC137=rank(a);}
 root.__HAPIL_ENEMY_CLASSES_RC137__=Object.freeze({data:D,rank,profile,profiles,id,hostile,incoming,sourceActor,castReuse,count,followup,install,postAwakeningException:a=>rank(a)>=6});
})(window);
