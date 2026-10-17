'use strict';const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const w={};w.window=w;vm.createContext(w);for(const p of ['assets/rc210/fragments.js','assets/rc210/projectile-balance.js','assets/rc210/lust-projectiles.js'])vm.runInContext(fs.readFileSync(p,'utf8'),w);const D=w.__HAPIL_BULLET_BALANCE_RC210__,L=w.__HAPIL_LUST_RC210__,a={id:'b05-boss',hp:100,boss:true},s={zone:'ep1b05',time:10,enemies:[a],hostileProjectiles:[]};let checks=0;
 for(let i=0;i<3;i++){const q={id:i,sourceId:a.id,vx:2,vy:1,radius:2,born:10};L.prepare(s,q);assert.equal(q.lustKindRC24,L.parts[i]);assert.equal(q.sprite,L.paths[i]);D.prepare(s,a,q);const before=q.radius;for(let n=0;n<100;n++){L.prepare(s,q);D.prepare(s,a,q);}assert.equal(q.radius,before);assert.equal(q.radius,L.radii[i]*.5);let paints=0;const scales=[],rotations=[],ctx={save(){},restore(){},translate(){},rotate(v){rotations.push(v);},scale(x,y){scales.push([x,y]);},drawImage(...args){paints++;assert.equal(args.length,9);}};D.draw(ctx,q,11,()=>({x:0,y:0}),original=>{assert.equal(original.radius,L.radii[i]);return L.draw(ctx,{},original,11,(cache,path)=>({complete:true,naturalWidth:1254,path}),()=>({x:0,y:0}));});assert.equal(paints,1);assert.deepEqual(scales,[[.5,.5]]);const heading=Math.atan2(1,2)+(i===2?-L.heelToeAngle+Math.sin(2.4)*.025:L.turns[i]);assert(Math.abs(rotations[0]-heading)<1e-9,'sprite nose points with travel; shoe toe leads instead of rolling sideways');checks+=8;s.time=18;assert(L.expired(s,q));s.time=10;checks++;}
for(const k of ['laserV31330','laserShot','bloodV31516','themeBombV31323','themePollutionV31323','bossImpactTransitV31232']){const q={vx:2,vy:2,radius:5,[k]:true};D.prepare(s,a,q);assert.equal(q.radius,5);assert.equal(D.extra(s,a,q),null);checks+=2;}
 let extras=0;for(let i=0;i<40;i++){const p=D.extra(s,a,{vx:2,vy:1});if(p){extras++;assert(Math.abs(Math.atan2(p.vy,p.vx)-Math.atan2(1,2))>.3);}}assert.equal(extras,40);s.hostileProjectiles=Array.from({length:48},()=>({sourceId:a.id}));for(let i=0;i<8;i++)assert.equal(D.extra(s,a,{vx:2,vy:1}),null);s.hostileProjectiles=Array.from({length:144},()=>({sourceId:'other-boss'}));for(let i=0;i<8;i++)assert.equal(D.extra(s,a,{vx:2,vy:1}),null);
 const persona={sourceId:a.id,rc133InnerShot:true,vx:2,vy:2,radius:2};D.prepare(s,a,persona);assert.equal(persona.radius,1);assert.equal(D.extra(s,a,persona),null);console.log(JSON.stringify({status:'passed',checks,independentAssets:3,linearFactor:.5,repeatApplications:300,normalExtraRatio:extras/40,ownerExtraAdmissionCap:48,globalExtraAdmissionCap:144,scope:'CPU paint/geometry/admission fixtures; actual FPS and pixel review pending'}));

const jelly={sourceId:a.id,vx:2,vy:1,radius:2,sprite:'./assets/rc64/projectiles/danmaku-jellybean.webp'};for(let i=0;i<10;i++)D.prepare(s,a,jelly);assert.equal(jelly.radius,.66);assert.equal(jelly.rc210BulletBaseline.factor,.33);

// A density shot must not turn inward across RC129's authored central refuge.
const corridorState={zone:'ep1b03',time:100,enemies:[a],hostileProjectiles:[]};let corridorExtras=0;
for(let wave=0;wave<12;wave++)for(let i=0;i<7;i++){
 const side=i%2?1:-1,aim=.2,halfGap=.5,offset=halfGap+Math.floor(i/2)*.16;
 const p={vx:Math.cos(aim+side*offset)*4,vy:Math.sin(aim+side*offset)*4,rc129Plan:{aim,halfGap,side}};
 const e=D.extra(corridorState,a,p);if(!e)continue;corridorExtras++;
 const delta=Math.atan2(Math.sin(e.rc210ExtraAngle-aim),Math.cos(e.rc210ExtraAngle-aim));
 assert(side*delta>=halfGap-1e-9,'additional authored salvo must preserve its side and central refuge across waves');
}
assert.equal(corridorExtras,84);

console.log(JSON.stringify({status:'passed',authoredRefugeWaves:12,additionalShots:corridorExtras,scope:'CPU authored side/refuge geometry; native browser count and collision remain separately required'}));
