/* RC210: dry armored remains belong only to authored undead/armored owners.
 * Admission precedes native emission. Persona, lasers and persistent fans stay native. */
(function(root){'use strict';
 const owners=Object.freeze(['mb-dist04']),parts=Object.freeze(['arm','leg','torso','head']),paths=Object.freeze(parts.map(p=>'./assets/rc210/boss-fragment-'+p+'.png')),runs=new WeakMap(),n=(v,d=0)=>Number.isFinite(v)?v:d;
 const owner=a=>a?.rc135FissionIdentity??a?.rc133TemplateId??a?.combatOwnerIdRC69??a?.templateId??a?.id;
 const terminal=q=>q?.friendly||q?.reflected||q?.cancelled||q?.projectileRemovalReason31215||q?.reachedHero31213||q?.reachedMapBoundary31213;
 function eligible(a,p){return owners.includes(owner(a))&&a.hp>0&&!p?.danmakuV31316&&!p?.persistentProjectile31222&&!p?.rc133InnerShot&&!p?.rc150PersonaAwakeningShot&&!p?.laserV31330&&!p?.laserShot&&!p?.bloodV31516&&!p?.themeBombV31323&&!p?.themePollutionV31323&&!p?.bossImpactTransitV31232&&Math.hypot(n(p?.vx),n(p?.vy))>.01;}
 function owns(s,q){return !!q?.rc210Fragment&&owners.includes(q.rc210FragmentOwner)&&paths.includes(q.sprite)&&(s?.enemies??[]).some(a=>a.id===q.sourceId&&owner(a)===q.rc210FragmentOwner);}
 function plan(s,a,p){if(!eligible(a,p))return null;
  const live=(s.hostileProjectiles??[]).filter(q=>owns(s,q)&&!terminal(q));
  if(live.length>=8||live.filter(q=>q.sourceId===a.id).length>=4)return {blocked:true};
  let m=runs.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,counts:new Map()};runs.set(s,m);}m.time=s.time;
  const index=m.counts.get(a.id)??0;m.counts.set(a.id,index+1);const part=index%4,offset=[-.58,.58,-1.02,1.02][index%4],aim=Math.atan2(s.y-a.y,s.x-a.x),angle=aim+offset,speed=Math.max(.8,Math.min(2.6,Math.hypot(p.vx,p.vy)*.55));
  return {part,index,angle,owner:owner(a),packet:{...p,sprite:paths[part],vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,curve:0,homingMode31212:'none',frozenUntil:Math.max(n(p.frozenUntil),s.time+.65),life:6.5}};
 }
 function prepare(s,q,plan){if(!q||!plan||plan.blocked)return q;
  q.rc210Fragment=true;q.rc210FragmentOwner=plan.owner;q.rc210FragmentPart=parts[plan.part];q.rc210FragmentIndex=plan.index;
  q.sprite=q.fallbackSprite=paths[plan.part];delete q.rc137SourceRect;q.rc137Owner=plan.owner;q.rc153ScatterAngle=plan.angle;q.danmakuAngleV31316=plan.angle;
  const speed=Math.min(2.6,Math.hypot(q.vx,q.vy));q.vx=Math.cos(plan.angle)*speed;q.vy=Math.sin(plan.angle)*speed;q.curve=0;q.homingMode31212='none';q.scatterHomingPrepared31211=true;
  const at=Math.max(s.time+.65,n(q.frozenUntil),n(q.motionReleaseAt31219),n(q.telegraphUntil31210));for(const k of ['frozenUntil','motionReleaseAt31219','telegraphUntil31210','collisionDisabledUntil31219','collisionDisabledUntilV31226'])q[k]=at;
  q.rc210FragmentReleasedAt=at;q.rc210FragmentLife=6.5;q.expiresAt=at+6.5;
  for(const k of ['homeAt31211','homeUntil31211','retargetAt31212','returnAt','returnUntil','orbitUntil31212'])delete q[k];
  return q;
 }
 function expired(s,q){return owns(s,q)&&!q.friendly&&!q.reflected&&s.time>=Math.max(n(q.frozenUntil),n(q.motionReleaseAt31219),n(q.telegraphUntil31210),n(q.rc210FragmentReleasedAt),n(q.born))+q.rc210FragmentLife;}
 const assets=a=>owners.includes(owner(a))?paths:[];
 root.__HAPIL_FRAGMENTS_RC210__=Object.freeze({owners,parts,paths,owner,eligible,owns,plan,prepare,expired,assets});
})(window);
