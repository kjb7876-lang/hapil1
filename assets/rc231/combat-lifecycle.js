/* RC231: share Persona's committed warning -> release -> recovery contract.
 * Native producers retain their packets, paths, artwork, damage and clocks.
 * Only admission and contact gates are derived here; no new saved state.
 */
(function(root){'use strict';
 const n=(v,d=0)=>Number.isFinite(v)?v:d,worlds=new WeakMap();
 const queues=Object.freeze(['hostileProjectiles','pendingHits','impactQueue','bossLaserCastsV31330','bossUltimateCastsV31334','cosmicCastsV31318','narrativeCasts','telekineticCasts','spatialRiftCasts']);
 const padding=.35,stats={committed:0,contactGates:0,deferred:0,ordinary:0,resets:0};
 const excludedActor=a=>!a||!(a.hp>0)||a.friendly||a.neutral||a.visualOnly||a.canonAlly||a.canonAllyV31217||a.canonicalAllyV31217||a.protectedObjective||a.objectiveStructureV31238||a.narrativeStructureV31238||a.protectedNarrativeTargetV31307||a.protectedNarrativeTargetV31238||a.echoChildV31368||a.rc88Part||a.rc89CommandBody||a.rc133InnerBoss||a.id==='inner-evil-rc133';
 const autonomous=q=>q?.themeFollowupV31323||q?.themeRootDotRC210||q?.rootFollowupRC210||q?.rootTargetRC220||q?.blackHoleDotRC175||q?.machineTentacleDotRC210||q?.spaceDeletionDotRC210||q?.balrogSpatialRiftRC210||q?.insomniaFogDotRC210||q?.persistentHazard||q?.blackHole||q?.blackhole||q?.blackHoleV31317;
 const terminal=q=>!q||q.cancelled||q.damageSuppressed||q.damageSuppressedV31226||q.projectileRemovalReason31215||q.reachedHero31213||q.reachedMapBoundary31213||q.friendly||q.reflected||q.dreamReflectedV31346||q.parriedV31356||q.heroSkillVfx||q.heroId31213||q.partySlotV31322||q.visualOnly||q.pureTelegraphV31230||q.rc133InnerShot||q.rc150PersonaAwakeningShot;
 function enabled(s){const p=root.__HAPIL_PARTY_V31322__;return !!s&&Number.isFinite(s.time)&&s.hp>0&&!s.paused&&!s.pause&&n(s.timeStopUntil)<=s.time&&!s.practiceV31329&&!s.practicePatternV31365&&!['hub','village'].includes(s.zone)&&root.__HAPIL_RC95_NATIVE__?.locked?.(s)!==true&&!(p?.state===s&&(p.status?.role==='guest'||p.status?.paused||p.status?.disconnected));}
 function memory(s){let m=worlds.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,seen:new WeakMap(),actors:new WeakMap(),running:new WeakSet()};worlds.set(s,m);}m.time=s.time;return m;}
 function reset(s){if(s&&worlds.delete(s))stats.resets++;}
 function release(q){return Math.max(n(q?.born),n(q?.frozenUntil),n(q?.telegraphUntil31210),n(q?.motionReleaseAt31219),n(q?.collisionDisabledUntil31219),n(q?.collisionDisabledUntilV31226));}
 function owner(s,q){const id=q?.sourceId??q?.ownerId??q?.ownerIdV31331;return(s?.enemies??[]).find(a=>a.id===id);}
 function eligible(s,a,q,key){return !excludedActor(a)&&!terminal(q)&&!autonomous(q)&&(!['hostileProjectiles','pendingHits','impactQueue'].includes(key)||n(q.damage)>0)&&(key!=='hostileProjectiles'||[q.x,q.y,q.vx,q.vy].every(Number.isFinite)&&Math.hypot(q.vx,q.vy)>.001);}
 function packetEnd(s,q,key){return key==='hostileProjectiles'?release(q):Math.max(n(q.at),n(q.impactAt),n(q.endAt),n(q.end),n(q.fireAt)+n(q.activeSeconds));}
 function contactGate(q){const gate=release(q);for(const k of ['collisionDisabledUntil31219','collisionDisabledUntilV31226'])if(n(q[k])<gate){q[k]=gate;stats.contactGates++;}}
 function commit(s,a,rows){
  if(!enabled(s)||excludedActor(a)||!(s.enemies??[]).includes(a))return null;
  const m=memory(s);let end=-Infinity,count=0;
  for(const {q,key}of rows){if(!eligible(s,a,q,key))continue;const at=packetEnd(s,q,key);if(!(at<s.time+30))continue;
   if(key==='hostileProjectiles'){
    // Collision follows the latest native gate, including a final stagger or
    // delayed body spawn. Never reschedule steering, travel or expiry clocks.
    contactGate(q);
   }
   end=Math.max(end,at);count++;
  }
  if(!count)return null;
  const previous=m.actors.get(a),until=Math.max(previous?.until??0,end+padding);
  const row={announcedAt:previous&&previous.until>s.time?previous.announcedAt:s.time,releaseAt:Math.max(previous&&previous.until>s.time?previous.releaseAt:0,end),until};m.actors.set(a,row);
  for(const k of ['recoverUntil','readyAt','patternReadyAt'])a[k]=Math.max(n(a[k]),until);
  stats.committed++;return row;
 }
 function prepareFrame(s){
  if(!s||!(s.hp>0)){reset(s);return;}
  if(!enabled(s))return;const m=memory(s),groups=new Map();
  for(const key of queues)for(const q of s[key]??[]){if(!q||typeof q!=='object')continue;const a=owner(s,q);if(!eligible(s,a,q,key))continue;if(key==='hostileProjectiles')contactGate(q);const end=packetEnd(s,q,key),previous=m.seen.get(q);if(previous?.actor===a&&end<=previous.end)continue;m.seen.set(q,{actor:a,end});let rows=groups.get(a);if(!rows)groups.set(a,rows=[]);rows.push({q,key});}
  for(const [a,rows]of groups)commit(s,a,rows);
 }
 function basic(s,a){
  if(!enabled(s)||excludedActor(a))return;const end=Math.max(n(a.attackAt),n(a.attackImpactAt));if(end<=s.time||end>=s.time+30)return;
  const m=memory(s),previous=m.actors.get(a);m.actors.set(a,{announcedAt:n(a.attackStarted,s.time),releaseAt:end,until:Math.max(previous?.until??0,end+padding,n(a.recoverUntil))});stats.ordinary++;
 }
 function ready(s,a){if(!enabled(s)||excludedActor(a))return true;const m=memory(s);if(m.running.has(a))return true;return Math.max(n(m.actors.get(a)?.until),n(a.attackAt),n(a.recoverUntil),n(a.atomicCastUntil31210))<=s.time;}
 function run(s,a,fn,deferred,admission=true){
  if(!enabled(s)||excludedActor(a))return fn();const m=memory(s);if(m.running.has(a))return fn();
  if(admission&&!ready(s,a)){stats.deferred++;return typeof deferred==='function'?deferred():deferred;}
  m.running.add(a);try{return fn();}finally{m.running.delete(a);prepareFrame(s);}
 }
 function inspect(s,a){const m=s&&worlds.get(s),r=m&&m.zone===s.zone&&s.time>=m.time?m.actors.get(a):null;return r?{...r,stage:s.time<r.releaseAt?'warning':s.time<r.until?'recovery':'ready'}:null;}
 root.__HAPIL_COMBAT_LIFECYCLE_RC231__=Object.freeze({version:'RC231',queues,padding,enabled,eligible,release,owner,commit,prepareFrame,basic,ready,run,inspect,reset,metrics:()=>({...stats})});
})(typeof window==='object'?window:globalThis);
