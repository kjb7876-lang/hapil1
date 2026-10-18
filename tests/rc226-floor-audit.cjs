'use strict';
// Source integration audit: execute the shipped floor, admission, movement and
// final ray clamp together. This is a Node VM, not a browser/device replay.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const source=fs.readFileSync('assets/index-v31526.js','utf8');
const functionSource=name=>{const at=source.indexOf('\nfunction '+name+'(');assert(at>0,name);const line=source.slice(at+1,source.indexOf('\n',at+1));const text=line.endsWith('}')?line:source.slice(at+1,source.indexOf('\n}',at)+2);new vm.Script(text);return text;};
const root={console,Math,Number,Set,Map,WeakMap,Object,Array,JSON,f:1.4,p:30.6,b:x=>Math.max(1.4,Math.min(30.6,x)),setTimeout(){},clearTimeout(){},addEventListener(){},innerWidth:1280,innerHeight:800};root.window=root;root.globalThis=root;
root.G=(x,y)=>({x:640+(x-y)*27,y:(x+y)*13.5});root.__HAPIL_INNER_FINAL_RC133__={encounter:s=>s.persona===true};
root.document={documentElement:{classList:{contains:()=>root.innerWidth<1000}}};root.getComputedStyle=()=>({getPropertyValue:()=>0});root.__HAPIL_MOBILE_V31366__={enabled:()=>root.innerWidth<1000};
vm.createContext(root);
for(const file of ['assets/rc134/persona-duel.js','assets/rc138/battle-arena.js','assets/rc137/direction-input.js','assets/rc223/left-zone.js','assets/rc79/combat-policy.js','assets/rc138/map-data.js','assets/rc138/map-format.js'])vm.runInContext(fs.readFileSync(file,'utf8'),root,{filename:file});
if(process.env.HAPIL_FLOOR_PATCH!=='0')vm.runInContext(fs.readFileSync('assets/rc227/floor-patches.js','utf8'),root,{filename:'assets/rc227/floor-patches.js'});
const D=root.__HAPIL_PERSONA_DUEL_RC134__,R=root.__HAPIL_BATTLE_ARENA_RC138__,I=root.__HAPIL_DIRECTION_INPUT_RC137__,zones=Object.keys(root.__HAPIL_MAP_DATA_RC138__);
R.bind({combat:zones,clear:s=>s.cleared===true});let live;
root.state=()=>live;root.arena=()=>R;root.worldOf=s=>s;root.runtime=()=>null;root.party=()=>({state:live,actors:[],status:{role:'offline'}});root.__HAPIL_PARTY_V31322__={state:null,actors:[],status:{role:'offline'}};
root.__HAPIL_CONTROLS_V31329__={binding:{state:{current:null}}};
const controller=root.__HAPIL_LEFT_ZONE_RC223__.createController({inScope:s=>R.locked(s),isHost:s=>s.guest!==true,isPlayer:(s,a)=>R.player(s,a),originalAllowed:(s,a,p,r)=>D.contains(p,R.side(s,true),r),nativeAll:(s,p,r)=>R.contains(p,'all',r,s)});
root.controller=controller;root.__HAPIL_LEFT_ZONE_NATIVE_RC223__={...controller};
for(const name of ['ot','ut','pt','ft','HAPIL_blinkWalkableRC85','MONGSE_applyPositionRC152'])vm.runInContext(functionSource(name),root);
root.ot=(z,x,y)=>R.contains({x,y},'all',0,z);root.ut=(z,x,y,r=.45)=>!R.contains({x,y},'all',r,z);
root.R=R;
const moveWrapper=source.split('\n').find(l=>l.trim().startsWith('const move=ft;ft=function(z,a,v,r=.45)'));
assert(moveWrapper);vm.runInContext(moveWrapper,root);
const blinkWrapper=source.split('\n').find(l=>l.trim().startsWith('HAPIL_blinkWalkableRC85=function(zone,p,s)'));
assert(blinkWrapper);vm.runInContext('const walkable=HAPIL_blinkWalkableRC85;'+blinkWrapper,root);
I.bind({project:root.G,clearTarget(){},resetDodge(){},walkable:(s,p)=>root.HAPIL_blinkWalkableRC85(s.zone,p,s)});
vm.runInContext(fs.readFileSync('assets/rc153/combat-layout.js','utf8').split('/* RC152_ORIENTATION_PAUSE_BEGIN */')[0],root);
const layout=root.__HAPIL_COMBAT_LAYOUT_RC153__;layout.bind({project:root.G,size:a=>a.boss?210:100,mapWidth:()=>1584});
function state(zone='dist01',mode='manual',phase='entry'){
 const boss={id:phase==='wave'?'scout':'boss',hp:100,boss:!['wave','midboss'].includes(phase),midboss:phase==='midboss',x:24.5,y:10.5};
 const s={zone,time:100,hp:240,maxHp:240,x:13.8,y:24.2,activeHeroId:'gunner',combatModeV31329:mode,enemies:[boss],spawnedWaves:new Set([1]),moveVx:0,moveVy:0};
 live=s;root.__HAPIL_PARTY_V31322__.state=s;root.__HAPIL_CONTROLS_V31329__.binding.state.current=s;R.enforce(s);
 if(phase==='transform'){boss.phaseIndex=2;boss.sprite='fixture-transformed.webp';boss.x=12;boss.y=25;}
 if(phase==='teleport')root.MONGSE_applyPositionRC152(boss,{x:8,y:30});
 if(phase==='restore'){R.release(s);s.x=10;s.y=24;boss.x=12;boss.y=24;R.enforce(s);}
 if(boss.boss||boss.midboss)assert(boss.x-boss.y>=14-1e-7&&boss.x-boss.y<=16+1e-7,'normal boss remains in its band through property writes, applyPosition and release/re-enroll');
 return s;
}
function gates(s,p){return{nativeAll:R.contains(p,'all',.8,s),oldLeft:D.contains(p,'left',.8),allowed:controller.allowed(s,s,p,.8),canMove:controller.canMove(s,s,p,.8),finalWalkable:root.HAPIL_blinkWalkableRC85(s.zone,p,s)};}
const report={schema:1,appSha:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),kind:'source-integrated CPU audit; no new browser run',loaded:['native ft + pt','shipped RC138 ft wrapper','shipped RC223 blink wrapper','RC137 final constrain','native applyPosition'],floorPolicy:D.policy,polygons:{physical:D.polygon('all',0),feet:D.polygon('all',.8),left:D.polygon('left',.8)},zones,grid:{},rays:[],maps:[]};
const s=state();let legal=0,mismatch=0,blocked=0,extension=0;const points=[];
for(let x=5;x<=33;x+=.25)for(let y=5;y<=33;y+=.25){const p={x,y},g=gates(s,p);if(g.allowed){legal++;if(!g.finalWalkable)mismatch++;if(!g.oldLeft)extension++;}else blocked++;if((x*4)%4===0&&(y*4)%4===0)points.push({p,...g});}
report.grid={step:.25,legal,blocked,extension,allowedButWalkableFalse:mismatch,points};assert.equal(mismatch,0,'shipped final walkable must admit every RC223 floor point from the native entry');
for(const mode of ['manual','semi','full'])for(const phase of ['entry','wave','midboss','transform','teleport','restore'])for(const zone of ['dist00','dist01','ep1b07','cult04'])for(const keys of [['ArrowLeft'],['ArrowUp','ArrowLeft'],['ArrowDown','ArrowLeft']]){
 const s=state(zone,mode,phase),origin={x:s.x,y:s.y},v=I.acquire(s,new Set(keys));let stopped=null;
 for(let step=0;step<1200;step++){const before={x:s.x,y:s.y},delta={x:v.x*.06,y:v.y*.06},requested={x:s.x+delta.x,y:s.y+delta.y},p=root.ft(zone,s,delta,.48);root.MONGSE_applyPositionRC152(s,p);s.time+=.016;
  if(Math.hypot(s.x-before.x,s.y-before.y)<1e-5){stopped={before,requested,gates:gates(s,requested),applied:{x:s.x,y:s.y}};break;}
 }
 assert(stopped,'left ray eventually meets finite floor');assert(stopped.applied.y-stopped.applied.x>=1.45-1e-7);assert.equal(stopped.gates.nativeAll,false,'left ray stops at physical radius boundary, not an extra final clamp');report.rays.push({zone,mode,phase,keys,origin,stop:stopped});
}
for(const zone of ['dist00','dist01','ep1b07','cult04']){const s=state(zone),row=root.__HAPIL_MAP_DATA_RC138__[zone];report.maps.push({zone,path:row.activeMap,floorCenterY:row.floorCenterY,projectedPhysical:report.polygons.physical.map(p=>root.G(p.x,p.y)),projectedFeet:report.polygons.feet.map(p=>root.G(p.x,p.y)),projectedLeft:report.polygons.left.map(p=>root.G(p.x,p.y))});}
// The same floor under both real camera formulas. Body sizes/decoding are
// fixtures; this establishes coordinate composition, not pixel readability.
vm.runInContext(fs.readFileSync('assets/rc104/combat-viewport.js','utf8'),root);
report.views=[];
for(const [width,height]of [[1280,800],[844,390],[568,260]]){root.innerWidth=width;root.innerHeight=height;const s=state(),view=root.__HAPIL_VIEWPORT_RC104__.view(width,height),camera=layout.camera(s,view),css=report.polygons.feet.map(p=>{const q=root.G(p.x,p.y);return{x:(camera.x+q.x*camera.scale-view.x)*view.k,y:(camera.y+q.y*camera.scale-view.y)*view.k};});
 assert(css.every(p=>p.x>=-1e-7&&p.x<=width+1e-7&&p.y>=-1e-7&&p.y<=height+1e-7),'both camera/viewport formulas retain the real floor');report.views.push({width,height,mobile:width<1000,view,camera,projectedFeet:css,kind:'CPU actual camera, fixture actor body envelopes; not browser pixels'});
}
const output=process.env.HAPIL_QA_OUTPUT||'/tmp/hapil-rc226-floor';fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'floor-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:'passed',kind:report.kind,legal,mismatch,extension,rayChecks:report.rays.length,output}));
module.exports={root,R,D,I,state,controller,gates,report};
