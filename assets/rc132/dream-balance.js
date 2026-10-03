/* RC132: DREAM-only sustain and wrath exit consistency. Never applies damage, heals, teleports or grants victory. */
(function(root){
 'use strict';
 const states=new WeakMap(),RATE=.25,HIT=.01,WINDOW=.02,SECONDS=1;
 const stats={requests:0,limited:0,blocked:0,requested:0,approved:0,exitChecks:0,consistentExits:0};
 const n=(v,d=0)=>Number.isFinite(v)?v:d;
 function enabled(s){return !!s&&!s.practiceV31329&&(root.__HAPIL_SAMONG_RC91__?.enabled?.(s)??(s.gameModeV31346==='DREAM'&&s.samongUnlockedRC91===true));}
 function lifesteal(s,actor,requested){
  if(!enabled(s))return requested;
  const amount=Math.max(0,n(requested)),hp=n(actor?.hp),max=n(actor?.maxHp),time=n(s?.time,NaN);
  stats.requests++;stats.requested+=amount;
  if(!actor||!(hp>0&&max>0)||!Number.isFinite(time)||n(s.heroHealingBlockedUntil)>time||n(actor.heroHealingBlockedUntil)>time){stats.blocked++;return 0;}
  let world=states.get(s);if(!world||time<world.time){world={time,recipients:new WeakMap()};states.set(s,world);}world.time=time;
  let record=world.recipients.get(actor);if(!record){record=[];world.recipients.set(actor,record);}
  while(record.length&&record[0].at<=time-SECONDS)record.shift();
  const spent=record.reduce((sum,item)=>sum+item.amount,0),allowed=Math.max(0,Math.min(amount*RATE,max*HIT,max*WINDOW-spent,max-hp));
  if(allowed+1e-10<amount)stats.limited++;
  if(allowed>0){const last=record[record.length-1];if(last&&last.at===time)last.amount+=allowed;else if(record.length<128)record.push({at:time,amount:allowed});else return 0;stats.approved+=allowed;}
  return allowed;
 }
 function exitActorsClear(s,nativeReady){
  if(!enabled(s)||s.zone!=='ep1b07')return nativeReady;
  const gate=root.__HAPIL_FLOW_V31343__?.gate;if(typeof gate!=='function')return nativeReady;
  stats.exitChecks++;
  const result=gate(s,s.zone);if(typeof result?.clear!=='boolean')return nativeReady;
  // This gate still rejects living required actors, pending mandatory spawns,
  // unfinished boss phases, missing waves and unresolved objectives.
  // Caller retains native loot, clue, proximity, pause and transition checks.
  if(result.clear&&!nativeReady)stats.consistentExits++;
  return result.clear;
 }
 function snapshot(){return{version:'RC132',...stats,dreamOnly:true,rateMultiplier:RATE,maxHpPerHit:HIT,maxHpPerRollingSecond:WINDOW,windowSeconds:SECONDS};}
 const api=Object.freeze({version:'RC132',enabled,lifesteal,exitActorsClear,snapshot});root.__HAPIL_DREAM_BALANCE_RC132__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
