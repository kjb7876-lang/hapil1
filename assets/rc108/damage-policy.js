/* RC108: final damage factors. Source ownership is required for mobile protection. */
(()=>{'use strict';
 const mobile=()=>window.__HAPIL_MOBILE_V31366__?.enabled()===true;
 const egoEvents=new WeakMap(),knownOwners=new WeakMap();
 function observe(s){
  if(!s||typeof s!=='object')return 0;
  let rec=knownOwners.get(s);if(!rec||rec.zone!==s.zone||s.time<rec.time){rec={zone:s.zone,time:s.time,ids:new Set()};knownOwners.set(s,rec);}
  rec.time=s.time;
  for(const a of s.enemies??[])if(a?.id!=null&&!a.visualOnly&&!a.friendly&&!a.neutral&&!a.canonAlly&&!a.objectiveStructureV31238)rec.ids.add(String(a.id));
  for(const a of window.__HAPIL_LASERS_V31330__?.owners??[])if(a?.id!=null)rec.ids.add(String(a.id));
  return rec.ids.size;
 }
 function hostile(s,h){
  if(!s||!h||typeof h!=='object'||h.selfDamage===true||h.environmentDamage===true)return false;
  const id=h.sourceId??h.ownerId;
  if(id==null)return false;
  observe(s);const rec=knownOwners.get(s);
  return rec?.ids.has(String(id))===true;
 }
 const incoming=(s,h)=>(mobile()&&hostile(s,h))?0.1:1;
 const outgoing=amount=>Number.isFinite(amount)&&amount>0?amount*.5:amount;
 function power(s,source){
  if(Number(source?.samongPowerMultiplierRC108)>1)return source.samongPowerMultiplierRC108;
  const hero=source?.heroId??source?.heroId31213??source?.impactHeroIdV31315;
  if(!hero||hero!==s?.activeHeroId)return 1;
  return window.__HAPIL_SAMONG_RC91__?.active(s)===true?7:1;
 }
 function egoEntered(s,wasAwake,untilBefore,untilAfter){
  if(!s||!window.__HAPIL_SAMONG_RC91__?.enabled(s)||wasAwake||!(untilAfter>s.time)||untilAfter<=untilBefore)return false;
  const key=String(s.time)+':'+String(untilAfter);if(egoEvents.get(s)===key)return false;egoEvents.set(s,key);
  const m=s.samongPassiveRC91;if(m&&m.cooldown>0)m.cooldown*=.93;return true;
 }
 window.__HAPIL_DAMAGE_RC108__=Object.freeze({incoming,outgoing,power,egoEntered,hostile,observe,mobile,version:'RC108'});
})();
