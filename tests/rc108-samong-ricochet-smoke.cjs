const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let awake=true;
const window={__HAPIL_SAMONG_RC91__:{active:()=>awake},__HAPIL_MOBILE_V31366__:{enabled:()=>false}};
vm.runInNewContext(fs.readFileSync('assets/rc108/samong-ricochet.js','utf8'),{window,Math,Number,Set,Map,WeakMap});
const api=window.__HAPIL_SAMONG_RICOCHET_RC108__;
const square=(x,y,r)=>x-r>=0&&x+r<=10&&y-r>=0&&y+r<=10;
const enemy={id:'target',x:9.1,y:5,hp:100,hitRadius:.4};
const shot={x:5,y:5,vx:38,vy:0,wallHits:0,inside:new Set(),removed:false};
const first=api.reflected(shot,.1,square,[enemy]);assert.equal(first.hits.length,1,'a projectile damages on first entry into an enemy');
const second=api.reflected(shot,.1,square,[enemy]);assert.equal(second.hits.length,1,'it may damage again only after exiting and re-entering');assert.equal(shot.wallHits,1,'world edge is reflected as one wall contact');assert.ok(shot.x>=.09&&shot.x<=9.91,'reflected point remains inside the world collision edge');

const corner={x:9.5,y:9.5,vx:38,vy:38,wallHits:0,inside:new Set(),removed:false};
api.reflected(corner,.1,square,[]);assert.equal(corner.wallHits,1,'simultaneous corner impact is one wall contact');
const fastPierce={x:5,y:5,vx:38,vy:0,wallHits:0,inside:new Set(),removed:false},fastTargets=[{id:'fast-a',x:5.8,y:5,hp:100,hitRadius:.3},{id:'fast-b',x:7.3,y:5,hp:100,hitRadius:.3},{id:'fast-c',x:9.3,y:5,hp:100,hitRadius:.3}];
const fastResult=api.reflected(fastPierce,.12,square,fastTargets);assert.deepEqual([...new Set(fastResult.hits.map(a=>a.id))],['fast-a','fast-b','fast-c'],'the maximum-speed sweep pierces every narrow enemy without tunneling');

const seven={x:5,y:5,vx:38,vy:0,wallHits:0,inside:new Set(),removed:false};
for(let i=0;i<500&&!seven.removed;i++)api.reflected(seven,.1,square,[]);
assert.equal(seven.wallHits,7,'the seventh actual wall contact is counted');assert.equal(seven.removed,true,'the projectile expires on its seventh wall contact');

const target={id:'enemy',x:5,y:5,hp:100};
const state={zone:'test',time:.1,hp:100,x:1,y:5,activeHeroId:'gunner',fxSerial:10,enemies:[target],pendingStrikes:[{id:3,at:.34,targetId:'enemy',power:22,heroId:'gunner',actionKey:'A',ranged:true}],effects:[{id:4,kind:'projectile',shape:'bullet',imageOnly:true,heroId31213:'gunner',deliveryHeroV31322:'gunner',sprite:'bolt.webp',born:0,duration:.5,deliveryRoutesV31322:[{strikeId:3,targetId:'enemy',born:0,at:.34,x:1,y:5,tx:5,ty:5}]}]};
assert.equal(api.prepare(state),1,'active Dream converts a matching native ranged delivery route once');
const visual=state.effects[0],pending=state.pendingStrikes[0];assert.equal(pending.samongRicochetActiveRC108,true);assert.equal(visual.samongRicochetVFXRC108,true);assert.equal(api.prepare(state),0,'the same committed strike cannot launch twice');
state.time=.2;api.prepare(state);state.time=.3;api.prepare(state);assert.ok(state.pendingStrikes.some(h=>h.samongRicochetHitRC108&&h.samongPowerMultiplierRC108===7),'swept enemy entry queues a x7 hit');

const melee={...state,time:.1,activeHeroId:'hwando',pendingStrikes:[{id:8,at:.34,targetId:'enemy',power:20,heroId:'hwando',actionKey:'A',ranged:true}],effects:[{kind:'projectile',shape:'blade',heroId31213:'hwando',deliveryHeroV31322:'hwando',deliveryRoutesV31322:[{strikeId:8,targetId:'enemy',born:0,at:.34,x:1,y:5,tx:5,ty:5}]}]};
assert.equal(api.prepare(melee),0,'melee blade attacks stay on the original contact path');
const skill={...state,time:.1,pendingStrikes:[{id:9,at:.34,targetId:'enemy',power:20,heroId:'gunner',actionKey:'Q',ranged:true}],effects:[{kind:'projectile',shape:'bullet',heroId31213:'gunner',deliveryHeroV31322:'gunner',deliveryRoutesV31322:[{strikeId:9,targetId:'enemy',born:0,at:.34,x:1,y:5,tx:5,ty:5}]}]};
assert.equal(api.prepare(skill),0,'skill and instant-hit types are not converted');
assert.equal(api.metrics(state).live,1);
const retiredOnDeath=visual;state.hp=0;api.prepare(state);assert.equal(api.metrics(state).live,0,'death clears live ricochets');assert.equal(retiredOnDeath.samongRicochetExpiredRC108,true,'death retires the attached projectile image');assert.equal(retiredOnDeath.duration,0,'death removes the retired image from the next effect trim');
const makeRouteState=(time,zone='test')=>({zone,time,hp:100,x:1,y:5,activeHeroId:'gunner',fxSerial:1,enemies:[{id:'enemy',x:5,y:5,hp:100}],pendingStrikes:[{id:30,at:time+.5,targetId:'enemy',power:22,heroId:'gunner',actionKey:'A',ranged:true}],effects:[{id:31,kind:'projectile',shape:'bullet',imageOnly:true,heroId31213:'gunner',deliveryHeroV31322:'gunner',born:time-.1,duration:.5,deliveryRoutesV31322:[{strikeId:30,targetId:'enemy',born:time-.1,at:time+.5,x:1,y:5,tx:5,ty:5}]}]});
const restarted=makeRouteState(5);assert.equal(api.prepare(restarted),1);const restartedVisual=restarted.effects[0];restarted.time=0;api.prepare(restarted);assert.equal(restartedVisual.samongRicochetExpiredRC108,true,'a world-clock reset retires abandoned shots');assert.equal(restartedVisual.duration,0);
const departed=makeRouteState(5);assert.equal(api.prepare(departed),1);const departedVisual=departed.effects[0];departed.zone='next-zone';departed.time=5.1;api.prepare(departed);assert.equal(departedVisual.samongRicochetExpiredRC108,true,'a zone transition retires old-zone shots');assert.equal(departedVisual.duration,0);
console.log('PASS RC108 sampled swept collision, world-edge reflection, corner accounting, seven-wall expiry, native route binding, x7 hits, and melee/skill exclusions.');
