'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync('assets/rc126/finite-native.js','utf8'),c);
const F=c.__HAPIL_FINITE_NATIVE_RC126__;let count=0;
const make=(length,width,angle)=>({shape:'line',spectacleV31317:true,spectacleModeV31317:'beam',originX:7,originY:9,x:7+Math.cos(angle)*3,y:9+Math.sin(angle)*3,radius:length,width,damage:32,at:103});
for(const length of [.25,1,4,12,30])for(const width of [.125,.5,2,10])for(const angle of [0,Math.PI/7,Math.PI/2,Math.PI]){
 const h=make(length,width,angle),before={...h};assert(F.prepare({},h));assert.equal(h.originX,before.originX);assert.equal(h.originY,before.originY);assert.equal(h.radius,length);assert.equal(h.width,width);assert.equal(h.damage,32);assert.equal(h.at,103);
 assert(Math.abs(Math.hypot(h.x-h.originX,h.y-h.originY)-length)<1e-10);
 const g=F.geometry(h),p=(u,v)=>({x:g.a.x+g.ux*u-g.uy*v,y:g.a.y+g.uy*u+g.ux*v});
 for(const u of [0,length*.25,length*.5,length*.75,length])assert(F.contains(p(u,0),h));
 for(const u of [-.01,length+.01])assert(!F.contains(p(u,0),h));
 assert(!F.contains(p(length/2,width+.01),h));assert(!F.contains(p(length/2,-width-.01),h));
 // The rounded corner must be visually and physically absent, not a hidden hit.
 assert(!F.contains(p(g.round*.05,width-g.round*.05),h));
 assert(F.contains(p(g.round,width-g.round),h));
 const saved=JSON.stringify(h);assert.equal(F.prepare({},h),false);assert.equal(JSON.stringify(h),saved);count++;
}
for(const patch of [{x:7,y:9},{x:7+1e-10,y:9},{width:-1},{width:NaN},{radius:0},{radius:-1},{radius:Infinity},{originX:NaN},{originY:Infinity},{spectacleModeV31317:'monolith'}]){
 const h={...make(10,.5,0),...patch},before=JSON.stringify(h);assert.equal(F.prepare({},h),false);assert.equal(JSON.stringify(h),before);assert.equal(F.distance({x:100,y:100},h),Infinity);count++;
}
assert.equal(F.distance({x:NaN,y:0},make(10,.5,0)),Infinity);
console.log('RC126_FINITE_RESULT',JSON.stringify({passed:count+1,geometryCases:80,authoredOriginAndReachPreserved:true,roundedCornerNoContact:true,degenerateNoWorldHit:true}));
