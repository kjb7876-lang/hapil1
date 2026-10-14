'use strict';const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');let checks=0;
function run(fps){const hits=[],w={__HAPIL_BOSS_POLICY_RC175__:{config:{dotDamage:1,dotInterval:.5}},__HAPIL_NATIVE_ARENA_RC138__:{bodyDamage:(s,d,x,y,p)=>hits.push({d,p})}};w.window=w;vm.createContext(w);vm.runInContext(fs.readFileSync('assets/rc210/balrog-rift.js','utf8'),w);const R=w.__HAPIL_BALROG_RIFT_RC210__,s={zone:'dist06',time:0,hp:10000,x:14,y:24,fxSerial:0,enemies:[{id:'dist06-boss',hp:1000,x:24,y:14}]};R.bind({locked:()=>false});R.tick(s,1/fps);s.time=8;R.tick(s,1/fps);assert.equal(s.balrogRiftsRC210.length,1);const h=s.balrogRiftsRC210[0];assert.equal(h.fireAt,9.25);assert.equal(s.enemies[0].attackImpactAt,h.fireAt);checks+=3;
 for(let i=1;i<=Math.round(4.7*fps);i++){s.time=8+i/fps;s.enemies[0].activePattern='different skill';R.tick(s,1/fps);R.tick(s,1/fps);}
 assert.equal(hits.length,6);assert(hits.every(x=>x.d===6&&x.p.balrogSpatialRiftRC210));checks+=2;
 assert(R.inside(h,{x:h.x+3,y:h.y-3}));assert(!R.inside(h,{x:h.x+2,y:h.y+2}));checks+=2;
 s.zone='village';R.tick(s,1/fps);assert.equal(s.balrogRiftsRC210.length,0);checks++;
 return {fps,ticks:hits.length,total:hits.reduce((v,h)=>v+h.d,0)};
}
const samples=[10,30,60,144].map(run);assert(samples.every(x=>x.total===36));checks++;
console.log(JSON.stringify({status:'passed',checks,samples,ordinaryBlackholeDamage:1,ordinaryInterval:.5,multiplier:6,scope:'CPU tick/policy with damage callback; actual native damage, browser pixels and image not verified'}));
