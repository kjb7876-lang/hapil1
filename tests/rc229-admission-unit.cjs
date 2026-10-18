'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const bundle=fs.readFileSync('assets/index-v31526.js','utf8'),start=bundle.indexOf('const personaBullet=MONGSE_pushThemeProjectile3129;'),end=bundle.indexOf('\n  const personaCast=',start);assert(start>0&&end>start);
let checks=0;
for(const [mobile,width] of [[false,1280],[false,700],[false,799],[false,800],[true,844],[true,390]])for(const midboss of [false,true]){
 const w={innerWidth:width,__HAPIL_COMBAT_RC47__:{mobile:()=>mobile}};w.window=w;
 let attempted=0,blocked=false;
 Object.assign(w,{H:()=>({id:'inner-evil-rc133',acceptsSkill:()=>true}),provenance:{allow:()=>!blocked,finalizeAdded(s,b,a,p,fn){s.hostileProjectiles.slice(b).forEach(fn);}},MONGSE_pushThemeProjectile3129(s,a,p){attempted++;s.hostileProjectiles.push({...p,id:s.fxSerial++,sourceId:a.id});}});
 vm.createContext(w);vm.runInContext(fs.readFileSync('assets/rc210/projectile-balance.js','utf8'),w);vm.runInContext(bundle.slice(start,end),w);
 const D=w.__HAPIL_BULLET_BALANCE_RC210__,cap=mobile||width<800?40:56,a={id:'ordinary-boss',boss:!midboss,midboss},p={vx:2,vy:1,radius:.4};assert.equal(D.admissionCap(),cap);
 function world(n){return{zone:'ep1b03',time:100,fxSerial:800,hostileProjectiles:Array.from({length:n},(_,i)=>({id:i,sourceId:'prior-owner',born:10,expiresAt:999,frozenUntil:20}))};}
 const full=world(cap),prior=full.hostileProjectiles.slice(),clocks=JSON.stringify(prior),calls=attempted;w.MONGSE_pushThemeProjectile3129(full,a,p);assert.equal(full.hostileProjectiles.length,cap);assert.equal(full.fxSerial,800);assert.equal(attempted,calls);assert(prior.every((q,i)=>full.hostileProjectiles[i]===q));assert.equal(JSON.stringify(prior),clocks);checks+=6;
 const last=world(cap-1);w.MONGSE_pushThemeProjectile3129(last,a,p);assert.equal(last.hostileProjectiles.length,cap,'one remaining slot admits only the primary');assert.equal(last.fxSerial,801);checks+=2;
 const pair=world(cap-2);w.MONGSE_pushThemeProjectile3129(pair,a,p);assert.equal(pair.hostileProjectiles.length,cap,'primary plus density companion fit exactly');assert.equal(pair.hostileProjectiles.at(-1).rc210DensityExtra,true);assert.equal(pair.hostileProjectiles.at(-1).radius,.2);checks+=3;
 for(const flag of ['rc133InnerShot','danmakuV31316','persistentProjectile31222','rc150PersonaAwakeningShot']){const s=world(cap);w.MONGSE_pushThemeProjectile3129(s,a,{...p,[flag]:true});assert.equal(s.hostileProjectiles.length,cap+1,'native special admission remains with its own owner: '+flag);assert(!s.hostileProjectiles.at(-1).rc210DensityExtra);checks+=2;}
 blocked=true;const rejected=world(0),before=attempted;w.MONGSE_pushThemeProjectile3129(rejected,a,p);assert.equal(attempted,before);assert.equal(rejected.hostileProjectiles.length,0);checks+=2;
}
console.log('RC229_ADMISSION_UNIT',JSON.stringify({status:'passed',checks,source:'actual native wrapper extraction plus real balance module',caps:[56,40],retainedPriorPackets:true,personaAndPersistentExceptionsPreserved:true,scope:'CPU admission contract; real native browser comparison remains separate'}));
