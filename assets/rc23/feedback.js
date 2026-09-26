(()=>{'use strict';
 const pools={wood:[1,2],slash:[7,8],arcane:[13],shot:[6],hurt:[3,4],heavy:[15,16],guard:[2],laser:[5],roar:[9,10,11,12],heal:[14]};
 const sounds=Object.freeze(Object.fromEntries(Object.entries(pools).map(([k,v])=>[k,'./audio/rc23/upload-'+String(v[0]).padStart(2,'0')+'.wav'])));
 const memory=new WeakMap(),stats={hits:0,played:0,discarded:0};
 function state(s){let m=memory.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,queue:[],seen:new Set(),lasers:new Set(),bosses:new Set(),last:-99,voices:[],sequence:0,hp:s.hp,healAt:-99};memory.set(s,m);}m.time=s.time;return m;}
 function hit(s,target,damage,source){
  if(!s||!(damage>0)||!source||source.partySlotV31322||source.heroId!==s.activeHeroId)return;
  window.__HAPIL_CONTACT_RC23__?.mark(s,target,damage,source);
  const m=state(s);if(m.queue.length>=8)return;
  const id=source.heroId,key=id==='hwando'?'wood':id==='slayer'?'slash':id==='hunter'||id==='gunner'?'shot':'arcane';
  m.queue.push({key,at:s.time,priority:source.critical?3:2,gain:source.critical?.46:.33});stats.hits++;
 }
 function tick(s,settings,play,unlocked){
  if(!s)return;const m=state(s),key=window.__HAPIL_ENEMY_FEEL_V31361__?.key;
  for(const e of (key?s[key]:[])??[]){if(m.seen.has(e.id))continue;m.seen.add(e.id);if(s.time-e.born>.16)continue;
   if(e.kind==='hurt'&&(e.slot==='__host'||!e.slot))m.queue.push({key:e.sound==='heavy'||(s.enemies??[]).some(a=>a.id===e.source&&a.boss)?'heavy':'hurt',at:s.time,priority:5,gain:.46});
   else if(e.kind==='block'&&e.slot==='__host')m.queue.push({key:'guard',at:s.time,priority:4,gain:.3});
  }
  for(const a of s.enemies??[]){if(a.boss&&a.hp>0&&!m.bosses.has(a.id)){m.bosses.add(a.id);m.queue.push({key:'roar',at:s.time,priority:1,gain:.24});}}
  if(s.hp>m.hp+1&&s.time-m.healAt>2){m.healAt=s.time;m.queue.push({key:'heal',at:s.time,priority:1,gain:.25});}m.hp=s.hp;
  for(const c of s.bossLaserCastsV31330??[]){if(s.time>=c.fireAt&&s.time<c.endAt&&!m.lasers.has(c.id)){m.lasers.add(c.id);m.queue.push({key:'laser',at:s.time,priority:4,gain:.4});}}
  if(m.seen.size>256)m.seen=new Set(((key?s[key]:[])??[]).map(e=>e.id));
  if(m.lasers.size>32)m.lasers=new Set((s.bossLaserCastsV31330??[]).map(c=>c.id));
  const fresh=m.queue.filter(e=>s.time-e.at<.14);m.queue=[];
  if(!unlocked||settings?.sound===false||!(Number(settings?.sfxVolume)>0)||document.hidden||s.paused||s.pause){stats.discarded+=fresh.length;return;}
  const now=performance.now()/1000;m.voices=m.voices.filter(t=>t>now);
  if(!fresh.length||now-m.last<.12||m.voices.length>=2)return;
  fresh.sort((a,b)=>b.priority-a.priority);const e=fresh[0],pool=pools[e.key],index=pool[m.sequence++%pool.length];
  m.last=now;m.voices.push(now+(e.key==='roar'?1:e.key==='laser'?.8:e.key==='wood'||e.key==='guard'?.28:.42));
  play('./audio/rc23/upload-'+String(index).padStart(2,'0')+'.wav',e.gain,.12);stats.played++;
 }
 window.__HAPIL_FEEDBACK_RC22__=Object.freeze({sounds,hit,tick,metrics:()=>({...stats})});
})();
