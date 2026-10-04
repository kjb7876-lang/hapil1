/* Nonvoice source effects are tied to admitted native feedback/spawns. Unknown voice clips stay unassigned. */
(function(root){
 'use strict';
 const metrics={accepted:0,unmapped:0,faults:0};
 function event(name,s,actor,key){const kinds=root.__HAPIL_MEDIA_AUDIO_EVENTS_RC133__?.[name];let hash=0;for(const c of String(key))hash=(hash*31+c.charCodeAt(0))>>>0;const kind=Array.isArray(kinds)?kinds[hash%kinds.length]:kinds;if(!kind){metrics.unmapped++;return false;}try{const accepted=root.__HAPIL_COMBAT_AUDIO_V1__?.emit(kind,s,actor,key)===true;if(accepted)metrics.accepted++;return accepted;}catch{metrics.faults++;return false;}}
 function feedback(s,target,row,source,f){
  if(!row||!f)return false;
  const token=row.epoch+':'+row.sequence;
  if(row.kind==='REMOVAL'&&row.result==='CANCELLED')return event('removal',s,s,token);
  if(row.kind==='CONTACT'&&row.targetId==='__host'){
   if(f.kind==='parry')return event('parry',s,s,token);
   if(f.kind==='dodge')return event('dodge',s,s,token);
   if(['guard','dream-guard'].includes(f.kind))return event('guard',s,s,token);
   if(row.result==='HIT'&&row.appliedDamage>0)return event('hurt',s,s,token);
  }
  if(row.kind==='OUTGOING'&&row.result==='HIT'&&row.appliedDamage>0&&row.attackerHeroId===s.activeHeroId)return event(f.power>=1?'heavyHit':'meleeHit',s,s,token);
  return false;
 }
 root.__HAPIL_MEDIA_AUDIO_RC133__=Object.freeze({event,feedback,metrics:()=>({...metrics})});
})(window);
