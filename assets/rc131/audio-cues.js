/* RC131: selected uploaded recordings; combat lifecycle remains native-owned. */
(function(root){
 'use strict';
 if(root.__HAPIL_AUDIO_CUES_RC131__)return;
 const base=root.__HAPIL_AUDIO_RC130__, catalog=root.__HAPIL_COMBAT_AUDIO_CATALOG_V1__;
 if(!base||!catalog)throw Error('RC131 requires the RC130 policy and V1 catalog');
 const prefix='./audio/rc131/', failedPaths=new Set();
 let codec=false;
 try{codec=!!root.document?.createElement('audio').canPlayType('audio/ogg; codecs="opus"');}catch{}
 const stats={hurtRequests:0,parryRequests:0,attackRequests:0,fallbacks:0};
 const canon=p=>String(p||'').split(/[?#]/,1)[0].replace(/^.*\/audio\/rc131\//,prefix);
 const usable=p=>codec&&!failedPaths.has(canon(p));
 const choose=(name,fallback)=>{const path=prefix+name+'.ogg';if(usable(path))return path;stats.fallbacks++;return fallback;};
 const effects={...catalog.effects};
 for(const [key,name,priority,gain,duration]of[
  ['allyWoodRC131','attack-wood',5,1,2.28],
  ['allyMeleeRC131','attack-melee',5,.85,2.25],
  ['allyHurtRC131','hurt-neutral',9,1.15,2.25],
  ['parryRC131','parry',8,1,2.25]
 ])effects[key]=Object.freeze({path:prefix+name+'.ogg',gain,duration,priority,cooldown:2.5,voices:1,duck:priority>=8?.55:0,classification:'nonvocal-effect'});
 root.__HAPIL_COMBAT_AUDIO_CATALOG_V1__=Object.freeze({...catalog,effects:Object.freeze(effects)});
 function route(s,event,fallback){
  const original=base.route(s,event,fallback);
  if(event?.channel==='ally-hurt'){
   stats.hurtRequests++;
   // Preserve explicitly reviewed character/voice assignments. Never infer sex
   // from a name, costume, role, or the currently controlled party member.
   if(original!==base.neutral.hurt&&original!==base.neutral.heavy)return original;
   return choose('hurt-neutral',original);
  }
  if(event?.channel==='guard'&&event.contactResult==='PARRY'){
   stats.parryRequests++;return choose('parry',original);
  }
  return original;
 }
 function attack(hero,action,fallback){
  const original=base.attack(hero,action,fallback),key=String(action||'A').toUpperCase();
  if(original!==fallback)return original;
  // Preserve bows, firearms, spells and all authored ultimate sound routes.
  if(!['A','Q','W','E'].includes(key))return original;
  if(hero==='hwando'){stats.attackRequests++;return choose('attack-wood',original);}
  if(hero==='slayer'){stats.attackRequests++;return choose('attack-melee',original);}
  return original;
 }
 const snapshot=()=>({version:'RC131',...stats,codecSupported:codec,failedPaths:[...failedPaths],newUniqueRecordings:3,newRuntimePaths:4,existingUploadedRecordingsPreserved:8,genderPolicy:'author-reviewed assignments only; otherwise nonvocal',...{enemyHitEvery:6,enemyHitMinimumInterval:1.1}});
 root.__HAPIL_AUDIO_RC130__=Object.freeze({...base,route,attack,snapshot:()=>({...base.snapshot(),extension:snapshot(),uploadedArchiveImported:true})});
 root.__HAPIL_AUDIO_CUES_RC131__=Object.freeze({version:'RC131',route,attack,snapshot,failed:path=>{if(canon(path).startsWith(prefix))failedPaths.add(canon(path));}});
})(typeof window!=='undefined'?window:globalThis);
