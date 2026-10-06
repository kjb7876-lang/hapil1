/* RC150: admitted awakening events own one immediate seven-percent packet.
 * Seven percent is the raw request. Native mitigation, phase gates, protection,
 * death rewards and actual applied numbers remain authoritative. */
(function(root){'use strict';
 const seen=new WeakMap(),n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 const hostile=a=>a&&n(a.hp)>0&&n(a.maxHp)>0&&!a.visualOnly&&!a.friendly&&!a.neutral&&!a.canonAlly&&!a.canonAllyV31217&&!a.canonicalAllyV31217&&!a.objectiveStructureV31238&&!a.narrativeStructureV31238;
 function reserve(s,key){if(!s||!key)return false;let row=seen.get(s);if(!row||row.zone!==s.zone||n(s.time)<row.time){row={zone:s.zone,time:n(s.time),keys:new Set()};seen.set(s,row);}row.time=n(s.time);if(row.keys.has(key))return false;row.keys.add(key);return true;}
 function float(s,a,applied,kind){(s.floatTexts??=[]).push({id:s.fxSerial++,sourceId:kind,x:n(a.x,n(s.x)),y:n(a.y,n(s.y))-1,born:n(s.time),duration:1.15,text:applied>0?'각성 충격 −'+Math.round(applied)+' · 최대 HP 7%':'각성 충격 · 보호',color:kind==='player'?'#e2faff':'#ffb3c2',critical:applied>0});}
 function player(s,key,path,label='死夢覺醒'){
  if(!(n(s?.hp)>0)||!reserve(s,'player:'+key))return false;
  root.__HAPIL_AWAKENING_PORTRAITS_RC137__?.flash?.(s,'player',path,label,'player:'+key);
  const targets=[...(s.enemies??[])].filter(hostile),bridge=root.__HAPIL_RC86_BRIDGE__,core=root.__HAPIL_COMBAT_CORE_V31401__;
  for(const a of targets){if(!(s.enemies??[]).includes(a)||!(n(a.hp)>0))continue;
   const raw=Math.max(1,Math.round(n(a.maxHp)*.07)),before=n(a.hp),source={id:'rc150-awake:'+key+':'+a.id,sourceId:'player-awakening',heroId:s.activeHeroId,awakeningImpactRC150:true};
   if(typeof bridge?.counterDamage==='function'){
    const apply=()=>{const result=bridge.counterDamage(s,a,raw,source);const dealt=Math.max(0,before-n(a.hp));core?.mark?.(s,a,dealt>0?'HIT':'REJECTED','awakening-seven-percent',{appliedDamage:dealt});return result;};
    if(typeof core?.enemy==='function')core.enemy(s,a,raw,source,apply);else apply();
   }
   const dealt=Math.max(0,before-n(a.hp));float(s,a,dealt,'player');
   if(before>0&&n(a.hp)<=0){const binding=root.__HAPIL_CONTROLS_V31329__?.binding;if(binding?.state?.current===s&&typeof binding.actions?.death==='function')binding.actions.death(a);}
  }
  return true;
 }
 function boss(s,a,key,path,label){
  if(!a||!reserve(s,'boss:'+key))return false;
  root.__HAPIL_AWAKENING_PORTRAITS_RC137__?.flash?.(s,'boss',path,label,'boss:'+key);
  const before=n(s.hp),raw=Math.max(1,Math.round(n(s.maxHp)*.07));
  if(before>0&&root.__HAPIL_COMBAT_CORE_V31401__?.player){
   const source={id:'rc150-boss-awake:'+key,sourceId:a.id,boss:true,heavyBossSkill:false,status:'none',awakeningImpactRC150:true,damage:raw};
   root.__HAPIL_COMBAT_CORE_V31401__.player(s,raw,n(a.x),n(a.y),source);
  }
  float(s,s,Math.max(0,before-n(s.hp)),'boss');return true;
 }
 root.__HAPIL_AWAKENING_IMPACT_RC150__=Object.freeze({version:'RC150',policy:'raw 7% of current target maximum HP; native mitigation and death hooks determine applied loss',player,boss,hostile});
})(window);
