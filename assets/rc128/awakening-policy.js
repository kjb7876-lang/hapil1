/* RC128: one lethal revival per encounter; cooldown remains the RC91 combat clock.
 * This module never changes speed, damage formulas, enemy statistics or laser geometry.
 */
(function(root){
 'use strict';
 const VERSION=1;
 const finite=(v,fallback=0)=>typeof v==='number'&&Number.isFinite(v)?v:fallback;
 const zone=s=>typeof s?.zone==='string'?s.zone.slice(0,180):null;
 function sanitize(raw){
  if(!raw||raw.version!==VERSION)return null;
  return {version:VERSION,zone:typeof raw.zone==='string'?raw.zone.slice(0,180):null,
   encounter:Math.max(0,Math.floor(finite(raw.encounter))),used:raw.used===true,
   beforeUntil:Math.max(0,finite(raw.beforeUntil)),ownedUntil:Math.max(0,finite(raw.ownedUntil))};
 }
 function memory(s,m){
  if(!m)return null;
  let p=m.encounterRC128;
  if(!p||p.version!==VERSION){
   // A legacy save with prior activations must not gain a free extra revival.
   p={version:VERSION,zone:zone(s),encounter:0,used:finite(m.activations)>0,beforeUntil:0,ownedUntil:0};
   m.encounterRC128=p;
  }
  return p;
 }
 function releaseOwnedEgo(s,p){
  if(!s||!p||!(p.ownedUntil>0))return;
  // Never shorten an independent EGO that has subsequently extended the deadline.
  if(finite(s.awakeningUntil)===p.ownedUntil){
   s.awakeningUntil=Math.min(p.ownedUntil,Math.max(finite(s.time),p.beforeUntil));
  }
  p.beforeUntil=0;p.ownedUntil=0;
 }
 function sync(s,m,enabled=true){
  if(!s||!m)return null;
  const p=memory(s,m),current=zone(s);
  if(p.zone!==current){
   releaseOwnedEgo(s,p);
   p.zone=current;p.encounter++;p.used=false;
   m.active=0;m.grace=0;m.heroId=null;
   // Deliberately retain cooldown: portals cannot be used to refill this passive.
  }
  if(!enabled){m.active=0;m.grace=0;releaseOwnedEgo(s,p);}
  else if(!(finite(m.active)>0))releaseOwnedEgo(s,p);
  return p;
 }
 function claim(s,m){
  const p=sync(s,m,true);
  if(!p||p.used||finite(m.active)>1e-8||finite(m.cooldown)>1e-8)return false;
  // Claim before HP/EGO mutation, preventing re-entrant lethal-contact revival.
  p.used=true;
  return true;
 }
 function ownEgo(s,m,beforeUntil,ownedUntil){
  const p=memory(s,m);if(!p)return;
  p.beforeUntil=Math.max(0,finite(beforeUntil));p.ownedUntil=Math.max(0,finite(ownedUntil));
 }
 function snapshot(s,m){
  // Serialization is read-only: a save operation does not clear timers or grant a charge.
  return sanitize(m?.encounterRC128)??{version:VERSION,zone:zone(s),encounter:0,used:finite(m?.activations)>0,beforeUntil:0,ownedUntil:0};
 }
 function restore(s,m,raw){
  if(!s||!m)return;
  const p=sanitize(raw);
  if(p)m.encounterRC128=p;
  else delete m.encounterRC128;
  sync(s,m,true);
 }
 function ready(s,m){
  const p=m?.encounterRC128;
  return !p?.used&&finite(m?.active)<=1e-8&&finite(m?.cooldown)<=1e-8;
 }
 const api=Object.freeze({version:'RC128',sanitize,sync,claim,ownEgo,snapshot,restore,ready});
 root.__HAPIL_AWAKENING_POLICY_RC128__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
