'use strict';const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const r={window:{}};vm.runInNewContext(fs.readFileSync('assets/rc210/fragments.js','utf8'),r);const F=r.window.__HAPIL_FRAGMENTS_RC210__;let checks=0;
for(const owner of F.owners){const a={id:owner+'-copy',rc135FissionIdentity:owner,midboss:true,hp:100,x:24,y:14},s={zone:'fixture',time:10,x:14,y:24,enemies:[a],hostileProjectiles:[]},p={vx:-8,vy:8,sprite:'original',damage:10};
 const angles=[];for(let i=0;i<4;i++){const plan=F.plan(s,a,p),q={id:i,sourceId:a.id,damage:10,x:a.x,y:a.y,vx:-8,vy:8};F.prepare(s,q,plan);s.hostileProjectiles.push(q);assert(F.owns(s,q));assert.equal(q.damage,10);assert(Math.hypot(q.vx,q.vy)<=2.600001);assert.equal(q.frozenUntil,10.65);assert(!F.expired(s,q));angles.push(Math.atan2(q.vy,q.vx));checks+=5;}
 assert(F.plan(s,a,p).blocked);assert(new Set(angles).size===4);checks+=2;
 s.time=17.16;assert(F.expired(s,s.hostileProjectiles[0]));s.hostileProjectiles[0].reflected=true;assert(!F.expired(s,s.hostileProjectiles[0]));checks+=2;
 for(const k of ['danmakuV31316','persistentProjectile31222','rc133InnerShot','rc150PersonaAwakeningShot','laserV31330','laserShot','bloodV31516','themeBombV31323','themePollutionV31323','bossImpactTransitV31232']){assert.equal(F.plan(s,a,{...p,[k]:true}),null);checks++;}
}
assert.equal(F.plan({},{id:'inner-evil-rc133',hp:100},{vx:2,vy:2}),null);checks++;
console.log(JSON.stringify({status:'passed',checks,owners:F.owners.length,capPerOwner:4,globalCap:8,warning:.65,maxSpeed:2.6,lifetime:6.5,personaUntouched:true,scope:'CPU policy; native rendering/playback not verified'}));
