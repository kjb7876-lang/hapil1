'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/index-v31526.js','utf8');
const start=source.indexOf('  function safeCopy(value,depth=0){'),end=source.indexOf('  function cleanRoster(rows){',start);
assert(start>=0&&end>start,'actual native snapshot codec must be available');
let checks=1;
function fixture(){
 const hits=[],w={__HAPIL_BOSS_POLICY_RC175__:{config:{dotDamage:1,dotInterval:.5}}};w.window=w;vm.createContext(w);
 vm.runInContext(source.slice(start,end)+'\nthis.codec={safeCopy,restore};',w);
 vm.runInContext(fs.readFileSync('assets/rc210/balrog-rift.js','utf8'),w);
 const s={zone:'dist06',time:0,hp:10000,maxHp:10000,x:14,y:24,fxSerial:0,enemies:[{id:'dist06-boss',hp:1000,x:24,y:14}]};
 const actor={slotId:'p2',hp:10000,maxHp:10000,x:14,y:24};
 const damage=(target,amount)=>{assert(Number.isFinite(amount)&&amount>0);target.hp-=amount;hits.push({slot:target===s?'p1':target.slotId,amount});};
 w.__HAPIL_NATIVE_ARENA_RC138__={bodyDamage:(state,amount)=>damage(state,amount)};
 w.__HAPIL_PARTY_V31322__={state:s,actors:[actor],status:{role:'host',paused:false,disconnected:false},debug:{allyDamage:(_s,a,amount)=>damage(a,amount)}};
 const r=w.__HAPIL_BALROG_RIFT_RC210__;r.bind({locked:()=>false});
 const tick=time=>{s.time=time;r.tick(s,.25);};tick(0);tick(8);
 assert.equal(s.balrogRiftsRC210.length,1);assert.equal(s.balrogRiftsRC210[0].fireAt,9.25);
 assert.equal(Object.hasOwn(s.balrogRiftsRC210[0],'actors'),false,'new hazards must contain only portable state');checks+=3;tick(9.25);
 return {w,s,actor,r,tick,hits};
}
{
 const f=fixture();f.tick(9.5);assert.equal(f.hits.length,0);f.tick(9.75);assert.equal(f.hits.length,2,'fractional contact time accumulates independently for both actors');
 f.actor.x=30;f.actor.y=30;f.tick(10);f.tick(10.25);assert.equal(f.hits.filter(h=>h.slot==='p1').length,2);assert.equal(f.hits.filter(h=>h.slot==='p2').length,1,'leaving the field clears only that actor contact');
 f.actor.x=f.s.x;f.actor.y=f.s.y;f.tick(10.5);assert.equal(f.hits.filter(h=>h.slot==='p2').length,1);f.tick(10.75);assert.equal(f.hits.filter(h=>h.slot==='p2').length,2,'reentering starts a fresh interval');checks+=6;
}
for(const legacy of [false,true]){
 const f=fixture();f.tick(9.5);
 const saved=JSON.parse(JSON.stringify(f.w.codec.safeCopy(f.s)));
 if(legacy)saved.balrogRiftsRC210[0].actors={};
 const restored=f.w.codec.restore(saved);for(const key of Object.keys(f.s))delete f.s[key];Object.assign(f.s,restored);
 assert.equal(f.s.time,9.5,'equal-time load must exercise the retained run cache');assert.equal(f.s.balrogRiftsRC210.length,1);
 assert.doesNotThrow(()=>f.tick(9.75),'restored contacts must not call methods on serialized objects');assert.equal(f.hits.length,0,'a restored hazard starts fresh transient contact intervals');
 f.tick(10);assert.equal(f.hits.length,2);assert(f.hits.every(h=>h.amount===6));assert(Number.isFinite(f.s.hp)&&Number.isFinite(f.actor.hp));
 f.tick(12.75);assert.equal(f.s.balrogRiftsRC210.length,0,'expired restored hazards are removed');
 f.s.zone='village';f.tick(13);assert.equal(f.s.balrogRiftsRC210.length,0,'zone exit cleanup remains safe');checks+=9;
}
console.log(JSON.stringify({ok:true,suite:'rc222-rift-checkpoint-unit',checks,scope:'Actual rift module and native snapshot codec; baseline actor contact timing, equal-time checkpoint load, legacy serialized contacts, finite damage and cleanup.'}));
