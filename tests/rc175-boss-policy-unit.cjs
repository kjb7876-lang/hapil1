'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root={document:{hidden:false},__HAPIL_LASERS_V31330__:{clip:(a,b)=>({a,b})}};root.window=root;vm.createContext(root);vm.runInContext(fs.readFileSync('assets/rc175/boss-policy.js','utf8'),root);const P=root.__HAPIL_BOSS_POLICY_RC175__;
let hits=[];root.__HAPIL_NATIVE_ARENA_RC138__={bodyDamage:(s,d,x,y,p)=>{hits.push(p);if(s.invulnerableUntil>s.time||s.evade||s.parry)return false;s.hp-=d;return true;}};
function state(){return {zone:'arena',time:0,hp:240,x:16,y:16,fxSerial:1,enemies:[{id:'boss',hp:100,boss:true}]};}
const hole={sourceId:'boss',zone:'arena',fireAt:0,endAt:20,x:16,y:16,radius:5,color:'#ed536b',label:'boss'};
for(const hz of [10,30,60,144]){const s=state();hits=[];P.dot(s,[hole,hole]);for(let i=1;i<=hz*3;i++){s.time=i/hz;P.dot(s,[hole,hole]);P.dot(s,[hole]);}assert.equal(hits.length,6);assert.equal(s.hp,234);assert(hits.every(h=>h.damage===1&&h.blackHoleDotRC175));}
for(const flag of ['evade','parry','invulnerableUntil']){const s=state();s[flag]=flag==='invulnerableUntil'?10:true;P.dot(s,[hole]);s.time=.5;P.dot(s,[hole]);assert.equal(s.hp,240);}
for(const scenario of ['exit','death','ownerDeath','zone','pause','reset','load','timeStop','guest']){const s=state();P.dot(s,[hole]);s.time=.4;P.dot(s,[hole]);hits=[];
 if(scenario==='exit')s.x=30;if(scenario==='death')s.hp=0;if(scenario==='ownerDeath')s.enemies[0].hp=0;if(scenario==='zone')s.zone='next';if(scenario==='pause')s.paused=true;if(scenario==='reset')s.time=0;if(scenario==='timeStop')s.timeStopUntil=10;if(scenario==='guest')root.__HAPIL_PARTY_V31322__={state:s,status:{role:'guest'}};
 const current=scenario==='load'?JSON.parse(JSON.stringify(s)):s;current.time=scenario==='reset'?.1:.5;P.dot(current,[hole]);assert.equal(hits.length,0,scenario);delete root.__HAPIL_PARTY_V31322__;
}
for(let id=0;id<8;id++){const c={id,cx:16,cy:16,radius:12,width:.8};const warning=P.strokes(c,0),firing=P.strokes(c,3),tail=P.strokes(c,4);assert.deepEqual(warning,firing);assert.deepEqual(firing,tail);assert(warning.length<=3);for(const l of warning){const du=(l.b.x-l.b.y)-(l.a.x-l.a.y),dv=(l.b.x+l.b.y-l.a.x-l.a.y)/2;assert(Math.abs(du)<1e-8||Math.abs(dv)<1e-8||Math.abs(Math.abs(dv/du)-.5)<1e-8);}
 // More than half the sampled arena stays outside the strokes even at width .8.
 let safe=0;for(let x=2;x<=30;x+=2)for(let y=2;y<=30;y+=2){const p={x:x-y,y:(x+y)/2};const distance=l=>{const a={x:l.a.x-l.a.y,y:(l.a.x+l.a.y)/2},b={x:l.b.x-l.b.y,y:(l.b.x+l.b.y)/2},dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};if(warning.every(l=>distance(l)>.8*1.25+4.5/27))safe++;}assert(safe>112);}
const native=fs.readFileSync('assets/index-v31526.js','utf8');assert(native.includes('function geometry(c,time){if(window.__HAPIL_BOSS_POLICY_RC175__)return window.__HAPIL_BOSS_POLICY_RC175__.strokes(c)'));assert(native.includes('tint(rawBeam,c.color)'));assert(native.includes('tint(rawTear,c.color)'));
console.log('RC175_BOSS_POLICY_UNIT passed: four frame rates, overlap/duplicate, terminal/mode fixtures, defenses delegated to native, shared straight geometry and safe area. No browser claim.');
const actor={};for(let i=0;i<8;i++){const c={id:99-i};P.configure(c,actor);P.configure(c,actor);assert.equal(c.rc175StrokeMode,i%4);}
// Invoke the real RC32 wrapper, with minimal browser APIs and real policy.
root.setTimeout=()=>{};root.__HAPIL_BLOOD_RC16__={draw:()=>{}};Object.assign(root.__HAPIL_LASERS_V31330__,{installed:true,owners:[{id:'boss',color:'#55bb88'}],tick:()=>{},draw:()=>{}});vm.runInContext(fs.readFileSync('assets/rc32/boss-and-mobile.js','utf8'),root);
let real=state();real.bossBlackHolesRC32=[{...hole,color:'wrong'}];real.bossBlackHoleNextRC32={boss:999};root.__HAPIL_LASERS_V31330__.tick(real,.1);assert.equal(real.bossBlackHolesRC32[0].color,'#55bb88');real.time=.5;root.__HAPIL_LASERS_V31330__.tick(real,.1);assert.equal(real.hp,239);
real.zone='next';real.time=.6;root.__HAPIL_LASERS_V31330__.tick(real,.1);assert.equal(real.bossBlackHolesRC32.length,0);
real=state();real.enemies=[{id:'inner-evil-rc133',rc133InnerBoss:true,hp:100,boss:true}];real.bossBlackHoleNextRC32={'inner-evil-rc133':999};real.bossBlackHolesRC32=[{...hole,sourceId:'inner-evil-rc133',color:'wrong'}];root.__HAPIL_LASERS_V31330__.tick(real,.1);assert.equal(real.bossBlackHolesRC32[0].color,'#ed536b');real.hp=0;root.__HAPIL_LASERS_V31330__.tick(real,.1);assert.equal(real.bossBlackHolesRC32.length,0);
console.log('RC175_RC32_INTEGRATION passed: actual installed tick, DOT/native adapter, boss color, Persona red, zone/death cleanup and duplicate-safe sequential configuration.');
