/* RC133: one atomic admission, a run-scoped seven-entry counter, bounded upgrades. */
(function(root){
 'use strict';
 const finite=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,finite(v)));
 const tracks=Object.freeze([
  {key:'samongResonance',name:'사몽 공명',max:3,description:'공명 획득 +10%씩 · 패링/그레이즈 보너스 · 방어 효율 +2%씩'},
  {key:'samongCooldown',name:'시간의 간격',max:3,description:'재사용 77초에서 -5%씩 · 최소 65.45초'},
  {key:'samongDuration',name:'꿈의 잔향',max:2,description:'각성 지속 +1초씩 · 최대 9초'},
  {key:'samongPower',name:'내면의 위력',max:3,description:'사몽 ×7에 +5%씩 · 총 배율 최대 ×8.05'},
  {key:'samongProtection',name:'사몽 보호',max:2,description:'발동 보호 +0.2초씩 · 최대 1초 · 부활 횟수 유지'}
 ].map(x=>Object.freeze({...x,category:'samongUpgrade'})));
 const enabled=s=>root.__HAPIL_SAMONG_RC91__?.enabled?.(s)===true;
 function upgrades(raw){return Object.fromEntries(tracks.map(t=>[t.key,Math.floor(clamp(raw?.[t.key],0,t.max))]));}
 function profile(s){const u=upgrades(s?.samongUpgradesRC133);return {duration:7+u.samongDuration,cooldown:Math.max(65.45,77*(1-u.samongCooldown*.05)),grace:.6+u.samongProtection*.2,power:7*(1+u.samongPower*.05),gain:1+u.samongResonance*.1,defense:1-u.samongResonance*.02};}
 function memory(s){const m=s.samongEgoRC133;if(m?.version===1)return m;return s.samongEgoRC133={version:1,count:0,pending:false,lastEntry:null,serial:0,admitting:false};}
 function clean(raw){if(!raw||raw.version!==1)return null;return {version:1,count:Math.floor(clamp(raw.count,0,7)),pending:raw.pending===true&&finite(raw.count)>=7,lastEntry:typeof raw.lastEntry==='string'?raw.lastEntry.slice(0,120):null,serial:Math.max(0,Math.floor(finite(raw.serial))),admitting:false};}
 function consume(s){const m=memory(s);m.count=0;m.pending=false;m.serial++;}
 function enter(s,wasAwake,before,after,origin='ego'){
  if(!enabled(s)||origin!=='ego'||wasAwake||![s.time,before,after].every(Number.isFinite)||!(after>s.time)||!(after>before))return false;
  const m=memory(s),token=String(s.time)+':'+String(after);
  if(m.lastEntry===token)return false;m.lastEntry=token;m.count=Math.min(7,m.count+1);m.pending=m.count===7;
  if(m.pending)root.__HAPIL_SAMONG_RC91__?.tryEgo?.(s);
  return true;
 }
 function admit(s,passive,origin){
  const m=memory(s);
  if(!['ego','revival'].includes(origin)||!enabled(s)||m.admitting||finite(passive.active)>1e-8||finite(passive.cooldown)>1e-8)return false;
  if(origin==='ego'&&(!(s.hp>0)||!m.pending))return false;
  if(origin==='revival'&&!root.__HAPIL_AWAKENING_POLICY_RC128__?.claim?.(s,passive))return false;
  m.admitting=true;return true;
 }
 function complete(s,ok){const m=memory(s);if(ok&&m.pending)consume(s);m.admitting=false;}
 function gain(s,amount,kind){if(!enabled(s)||!(amount>0))return amount;const p=profile(s),bonus=['parry','graze'].includes(kind)?1+(p.gain-1)*.5:1;return amount*p.gain*bonus;}
 function purchase(s,raw,shards,key){
  const t=tracks.find(t=>t.key===key),u=upgrades(raw),credit=Math.max(0,Math.floor(finite(shards)));
  if(!enabled(s)||!t||credit<1||u[key]>=t.max)return null;
  u[key]++;return {passives:{...raw,...u},upgrades:u,shards:credit-1,category:'samongUpgrade'};
 }
 const api=Object.freeze({version:'RC133',tracks,enabled,upgrades,profile,memory,clean,enter,admit,complete,gain,purchase,consume,
  status:s=>{const m=s?.samongEgoRC133;return {count:Math.floor(clamp(m?.count,0,7)),pending:m?.pending===true,serial:Math.max(0,finite(m?.serial))};}});
 root.__HAPIL_SAMONG_POLICY_RC133__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
