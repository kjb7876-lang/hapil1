'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const read=file=>fs.readFileSync(file,'utf8');
const html=read('index.html');
const bundle=read('assets/index-v31526.js');
const arenaCss=read('assets/rc224/arena-polish.css');
const battlefieldCss=read('assets/rc125/adaptive-battlefield.css');
const root={};root.window=root;vm.createContext(root);
for(const file of ['assets/rc134/persona-duel.js','assets/rc138/battle-arena.js','assets/rc210/fragments.js','assets/rc210/projectile-balance.js'])vm.runInContext(read(file),root);
const R=root.__HAPIL_BATTLE_ARENA_RC138__;
R.bind({combat:['ep1b05'],clear:()=>false});
const layout=read('assets/rc153/combat-layout.js').split('/* RC152_ORIENTATION_PAUSE_BEGIN */')[0];
vm.runInContext(layout,root);
vm.runInContext(read('assets/rc210/lust-projectiles.js'),root);
vm.runInContext(read('assets/rc223/camera.js'),root);
const L=root.__HAPIL_COMBAT_LAYOUT_RC153__,lust=root.__HAPIL_LUST_RC210__,camera=root.__HAPIL_CAMERA_RC223__,balance=root.__HAPIL_BULLET_BALANCE_RC210__;
let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks++;};
const eq=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;};

// Confirm authored ep1b05 enemies are moved to the visible right half while
// remaining inside the native enemy floor after the real arena projection.
const zoneAt=bundle.indexOf('ep1b05: {'),nextZone=bundle.indexOf('ep1b06: {',zoneAt),zone=bundle.slice(zoneAt,nextZone);
assert(zoneAt>=0&&nextZone>zoneAt,'actual ep1b05 encounter source exists');
const authoredPosition=id=>{const match=new RegExp('`'+id+'`,\\s*`[^`]+`,\\s*`[^`]+`,\\s*([0-9]+),\\s*([0-9]+)').exec(zone);assert(match,'actual authored enemy '+id);return{x:Number(match[1]),y:Number(match[2])};};
const baseline={ 'b05-p1':{x:5,y:7},'b05-a1':{x:14,y:6},'b05-p2':{x:8,y:14} };
for(const [id,old] of Object.entries(baseline)){
 const authored=authoredPosition(id),placed=R.point(authored,'right',R.format.enemyRadius),oldPlaced=R.point(old,'right',R.format.enemyRadius);
 ok(R.contains(placed,'right',R.format.enemyRadius),id+' stays on the legal enemy floor');
 ok(placed.x-placed.y>oldPlaced.x-oldPlaced.y+3,id+' moves farther right on the projected isometric screen');
}

// Both halves remain cleanly enforced in mechanics; the player floor rule is
// still owned by RC223's tested extension, and no polygon is painted here.
const boundaryCalls=[];
const noBoundary={save(){boundaryCalls.push('save');},beginPath(){boundaryCalls.push('path');},fill(){boundaryCalls.push('fill');},stroke(){boundaryCalls.push('stroke');}};
eq(R.drawBoundary(noBoundary,{zone:'ep1b05',hp:100,enemies:[{hp:100}]},p=>p),false,'expanded floor has no painted zone boundary');
eq(boundaryCalls.length,0,'removing the marker does not draw hidden geometry');
ok(arenaCss.includes('#hapil-left-zone-warning-rc223')&&arenaCss.includes('display: none !important'),'left-floor penalty warning has no visible region badge');
ok(html.includes('rc224/arena-polish.css?v=22401'),'region marker rule is loaded by the real page');
ok(battlefieldCss.includes('width:100%!important;height:100%!important')&&battlefieldCss.includes('min-width:0!important;min-height:0!important'),'native canvas remains full-size in its full-width stage');

// The zoom control still scales actors and shots together, with only a small
// maximum shrink so the authored map remains near full-screen on mobile.
for(const [range,expected] of [[1,1],[1.5,1.025],[2,1.05]]){
 eq(camera.appliedZoom(range),expected,'eased camera factor '+range);
 camera.setFactor(range);const base={x:120,y:90,scale:1.8},anchor={x:640,y:360},adjusted=camera.applyCamera(base,anchor);
 ok(Math.abs(adjusted.scale-base.scale/expected)<1e-10,'map and actor camera scales stay aligned at '+range);
}
 ok(html.includes('assets/rc223/camera.js?v=22601'),'page loads the updated camera implementation');

// Standard boss and miniboss shots halve their real collision radii and gain
// one matching spread shot. Special laser and field paths remain excluded.
for(const role of ['boss','midboss']){
 const owner={id:'test-'+role,[role]:true},shot={sourceId:owner.id,vx:3,vy:1,radius:2,hitRadius:1.4},state={zone:'ep1b05',time:5,hostileProjectiles:[]};
 balance.prepare(state,owner,shot);
 eq(shot.radius,1,role+' ordinary projectile radius is halved');
 eq(shot.hitRadius,.7,role+' collision radius is halved with the artwork');
 const companions=Array.from({length:8},()=>balance.extra(state,owner,{vx:3,vy:1}));
 eq(companions.filter(Boolean).length,8,role+' ordinary projectile count doubles');
 eq(companions.filter(Boolean).every(q=>q.rc210DensityExtra===true),true,role+' added shots keep density ownership metadata');
 const laser={sourceId:owner.id,vx:3,vy:1,radius:2,laserShot:true};
 balance.prepare(state,owner,laser);
 eq(laser.radius,2,role+' laser geometry stays native');
}
eq(balance.policy.extraOwnerCap,48,'owner admission cap follows the doubled ordinary volley');
eq(balance.policy.extraGlobalCap,144,'global admission cap follows the doubled ordinary volley');
ok(html.includes('assets/rc210/projectile-balance.js?v=22901'),'page loads the half-size/density projectile policy');

// The real combat-layout scatterer produces a wide b05 fan while retaining
// projectile count, speed, damage, owner side and per-shot identity.
const boss={id:'b05-boss',boss:true,hp:100,x:29,y:15};
const state={zone:'ep1b05',time:10.05,x:14,y:24,enemies:[boss],hostileProjectiles:[]};
const aim=Math.atan2(state.y-boss.y,state.x-boss.x);
for(let i=0;i<7;i++){
 const angle=aim+(i-3)*.003,speed=4;
 state.hostileProjectiles.push({id:i,sourceId:boss.id,born:10,sourceBorn:10,bossCastId31210:77,label:'b05 straight volley',originX:boss.x,originY:boss.y,x:boss.x,y:boss.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,damage:18,frozenUntil:10.2});
}
L.scatter(state);
const fan=state.hostileProjectiles;
eq(new Set(fan.map(q=>q.rc153ScatterAngle)).size,7,'all straight shots receive distinct fan rays');
ok(fan.every(q=>q.rc153ScatterCount===7),'the whole actual owner batch is grouped');
const fanAngles=fan.map(q=>q.rc153ScatterAngle),fanSpan=Math.max(...fanAngles)-Math.min(...fanAngles);
ok(fanSpan>1.5,'b05’s central straight stream is changed into a clearly visible wide fan');
ok(fan.every(q=>Math.abs(Math.hypot(q.vx,q.vy)-4)<1e-9&&q.damage===18&&R.contains({x:q.x,y:q.y},'all',0)),'fan preserves speed and damage and stays on legal floor');

// The shoe sprite's toe direction follows the velocity in every tested octant.
for(const angle of [-Math.PI,-2.25,-Math.PI/2,-.4,0,.75,Math.PI/2,2.7]){
 const q={sourceId:boss.id,vx:Math.cos(angle)*5,vy:Math.sin(angle)*5,rc210LustPart:2,born:state.time};
 lust.prepare(state,q);
 const rotations=[],ctx={save(){},restore(){},translate(){},rotate(v){rotations.push(v);},drawImage(){}};
 const drawn=lust.draw(ctx,{},q,state.time,(cache,path)=>({complete:true,naturalWidth:1280,path}),()=>({x:0,y:0}));
 eq(drawn,true,'heel art draws for heading '+angle);
 const toeDirection=rotations[0]+lust.heelToeAngle;
 const error=Math.atan2(Math.sin(toeDirection-angle),Math.cos(toeDirection-angle));
 ok(Math.abs(error)<1e-8,'heel toe leads its velocity for heading '+angle);
}
ok(html.includes('assets/rc210/lust-projectiles.js?v=22401'),'page loads the corrected high-heel projectile renderer');
console.log('RC224_ARENA_REGRESSION_UNIT',JSON.stringify({status:'passed',checks,enemyPositions:Object.fromEntries(Object.keys(baseline).map(id=>[id,authoredPosition(id)])),fanShots:fan.length,fanRadians:Number(fanSpan.toFixed(3)),cameraMaxAppliedZoom:camera.appliedZoom(2),browserVerified:false}));
