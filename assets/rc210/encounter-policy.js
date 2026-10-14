/* RC210: one admission ledger per encounter, shared by entry/tick/save/restore.
 * Dead admitted members remain in ids; only members describes survivors. */
(function(root){'use strict';
 const runs=new WeakMap();
 const hostile=a=>a?.midboss&&!a.visualOnly&&!a.friendly;
 function count(mode){return mode==='STORY'?1:mode==='DREAM'?2:3;}
 function select(mode,actors,previous){
  const limit=count(mode),unique=[...new Map((actors??[]).filter(hostile).map(a=>[a.id,a])).values()];
  if(!previous)return {limit,ids:unique.slice(0,limit).map(a=>a.id),actors:unique.slice(0,limit)};
  const old=[...new Set(previous.ids??[])];
  // Migrate a legacy oversized encounter by retaining living members first.
  // Once migrated, never replace a dead member with a synthesized legacy twin.
  const live=new Set(unique.filter(a=>a.hp>0).map(a=>a.id));
  const ids=previous.policyRC210===limit?old.slice(0,limit):[...old.filter(id=>live.has(id)),...old.filter(id=>!live.has(id))].slice(0,limit);
  return {limit,ids,actors:unique.filter(a=>ids.includes(a.id))};
 }
 function track(s,actors){runs.set(s,{zone:s.zone,refs:new Map(actors.map(a=>[a.id,a])),retired:new Set()});}
 function admit(s,mode,actors,previous){let m=runs.get(s);if(!m||m.zone!==s.zone){const survivors=new Set((previous.members??[]).filter(a=>a.hp>0).map(a=>a.id));m={zone:s.zone,refs:new Map(),retired:new Set([...(previous.retiredIdsRC210??[]),...previous.ids.filter(id=>!survivors.has(id))])};runs.set(s,m);}
  for(const [id,a]of m.refs)if((!(a.hp>0)&&!a.revivalPending&&!a.phaseTransitionActive)||!actors.includes(a))m.retired.add(id);
  const chosen=select(mode,actors.filter(a=>!m.retired.has(a.id)),previous);
  for(const a of chosen.actors)if(!m.refs.has(a.id))m.refs.set(a.id,a);
  return {...chosen,retiredIdsRC210:chosen.ids.filter(id=>m.retired.has(id))};
 }
 root.__HAPIL_ENCOUNTER_RC210__=Object.freeze({count,select,hostile,track,admit,reset:s=>runs.delete(s)});
 if(typeof module==='object'&&module.exports)module.exports=root.__HAPIL_ENCOUNTER_RC210__;
})(typeof window==='object'?window:globalThis);
