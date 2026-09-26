/* HAPIL 3.14.00 — canonical player rules. No combat mutation or renderer imports. */
(function(root){'use strict';
 const ids=Object.freeze(['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner']);
 const excluded=Object.freeze(['rian','ion']),allowed=new Set(ids);
 const partners=Object.freeze({hwando:'gunner',gunner:'hwando',seoha:'michaela',michaela:'seoha',neon:'lauren',lauren:'neon',hunter:'slayer',slayer:'hunter'});
 const caps=Object.freeze({attack:12,skillQ:8,skillW:8,skillE:8,skillR:6,awakening:8,autoEvade:8,...Object.fromEntries(ids.map(id=>['resonanceThread_'+id,6]))});
 const n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d;
 const has=id=>allowed.has(id),safe=id=>has(id)?id:'hwando',partner=id=>partners[safe(id)];
 const cleanIds=values=>Array.isArray(values)?[...new Set(values.filter(has))].slice(0,7):[];
 function normalizePolicy(value,defaults={}){
  const v=value&&typeof value==='object'?value:{},ai=typeof v.aiEnabled==='boolean'?v.aiEnabled:defaults.aiEnabled===true;
  return Object.freeze({version:1,aiEnabled:ai,aiHeroes:Object.freeze(ai?cleanIds(v.aiHeroes??defaults.aiHeroes):[]),humanHeroes:Object.freeze(cleanIds(v.humanHeroes??defaults.humanHeroes)),humanPlayers:Math.max(1,Math.min(8,Math.floor(n(v.humanPlayers,n(defaults.humanPlayers,1))))),locked:true,origin:['new','legacy','practice','import','network'].includes(v.origin)?v.origin:(defaults.origin??'legacy')});
 }
 function bonus(policy){return policy?.aiEnabled===false&&policy?.humanPlayers===1&&policy?.origin!=='network'?1:0;}
 function effective(raw,policy){const result={...(raw&&typeof raw==='object'?raw:{})},b=bonus(policy);if(!b)return result;for(const [key,cap]of Object.entries(caps))result[key]=Math.min(cap,Math.max(0,Math.round(n(result[key])))+b);return result;}
 function legacy(raw){const old=raw?.legacyRosterV31400,from=excluded.includes(raw?.heroId)?raw.heroId:excluded.includes(old?.originalHeroId)?old.originalHeroId:null,levels={};
  for(const id of excluded)for(const prefix of ['heroMastery_','timeMastery_','resonanceThread_']){const key=prefix+id,v=raw?.passives?.[key]??old?.removedGrowth?.[key];if(typeof v==='number'&&Number.isFinite(v))levels[key]=Math.max(0,Math.min(999999999,Math.floor(v)));}
  return from||Object.keys(levels).length?{version:1,originalHeroId:from,removedGrowth:levels}:null;
 }
 function migrate(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw))return raw;const h=safe(raw.heroId),old=legacy(raw);
  return {...raw,heroId:h,partyIds:[partner(h)],runPolicyV31400:normalizePolicy(raw.runPolicyV31400,{aiEnabled:true,origin:'legacy'}),...(old?{legacyRosterV31400:old}:{} )};
 }
 const api=Object.freeze({version:'3.14.00',ids,excluded,partners,caps,has,safe,partner,cleanIds,normalizePolicy,bonus,effective,legacy,migrate});
 root.__HAPIL_POLICY_V31400__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
