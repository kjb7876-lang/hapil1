(()=>{'use strict';
 const sounds=Object.freeze(Object.fromEntries(['wood','slash','arcane','shot','hurt','heavy','guard','laser'].map(k=>[k,'./audio/rc22/'+k+'.wav'])));
 const memory=new WeakMap(),stats={hits:0,played:0,discarded:0};
 function state(s){let m=memory.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,queue:[],seen:new Set(),lasers:new Set(),last:-99};memory.set(s,m);}m.time=s.time;return m;}
 function hit(s,target,damage,source){
  if(!s||!(damage>0)||!source||source.partySlotV31322||source.heroId!==s.activeHeroId)return;
  const m=state(s);if(m.queue.length>=8)return;
  const id=source.heroId,key=id==='hwando'?'wood':id==='slayer'||id==='hunter'?'slash':id==='gunner'?'shot':'arcane';
  m.queue.push({key,at:s.time,priority:source.critical?3:2,gain:source.critical?.64:.44});stats.hits++;
 }
 function tick(s,settings,play,unlocked){
  if(!s)return;const m=state(s),key=window.__HAPIL_ENEMY_FEEL_V31361__?.key;
  for(const e of (key?s[key]:[])??[]){if(m.seen.has(e.id))continue;m.seen.add(e.id);
   if(s.time-e.born>.16)continue;
   if(e.kind==='hurt'&&(e.slot==='__host'||!e.slot))m.queue.push({key:e.sound==='heavy'||(s.enemies??[]).some(a=>a.id===e.source&&a.boss)?'heavy':'hurt',at:s.time,priority:5,gain:.76});
   else if(e.kind==='block'&&e.slot==='__host')m.queue.push({key:'guard',at:s.time,priority:4,gain:.55});
  }
  for(const c of s.bossLaserCastsV31330??[]){if(s.time>=c.fireAt&&s.time<c.endAt&&!m.lasers.has(c.id)){m.lasers.add(c.id);m.queue.push({key:'laser',at:s.time,priority:4,gain:.58});}}
  if(m.seen.size>256)m.seen=new Set(((key?s[key]:[])??[]).map(e=>e.id));
  if(m.lasers.size>32)m.lasers=new Set((s.bossLaserCastsV31330??[]).map(c=>c.id));
  const fresh=m.queue.filter(e=>s.time-e.at<.14);m.queue=[];
  if(!unlocked||settings?.sound===false||!(Number(settings?.sfxVolume)>0)||document.hidden){stats.discarded+=fresh.length;return;}
  if(!fresh.length||s.time-m.last<.075)return;
  fresh.sort((a,b)=>b.priority-a.priority);const e=fresh[0];m.last=s.time;play(sounds[e.key],e.gain,.075);stats.played++;
 }
 window.__HAPIL_FEEDBACK_RC22__=Object.freeze({sounds,hit,tick,metrics:()=>({...stats})});
})();
