'use strict';
// Execute the real input/projection/framing modules. Browser traces remain the
// evidence for actual keyboard events, DOM scroll and native callback timing.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const root=require('node:path').resolve(__dirname,'..');let checks=0;
const ok=(v,m)=>{checks++;assert.ok(v,m);},eq=(a,b,m)=>{checks++;assert.deepEqual(a,b,m);};
const layout=fs.readFileSync(root+'/assets/rc153/combat-layout.js','utf8');
const input=fs.readFileSync(root+'/assets/rc137/direction-input.js','utf8');
const baseline=cp.execFileSync('git',['show','73a410daf5267fdf1ad2a9cdbaffd85afc407f09:assets/rc153/combat-layout.js'],{cwd:root,encoding:'utf8'});
function fixture(source,width,height){
 const project=(x,y)=>({x:640+(x-y)*27,y:(x+y)*13.5});
 const window={innerWidth:width,innerHeight:height,__HAPIL_BATTLE_ARENA_RC138__:{enabled:()=>true,side:(s,hero)=>hero?'left':'right'},__HAPIL_PERSONA_DUEL_RC134__:{polygon:()=>[{x:3,y:3},{x:3,y:30},{x:30,y:30},{x:30,y:3}]}};
 vm.runInNewContext(source.slice(0,source.indexOf('/* RC152_ORIENTATION_PAUSE_BEGIN */')),{window});
 vm.runInNewContext(input,{window});
 const L=window.__HAPIL_COMBAT_LAYOUT_RC153__,I=window.__HAPIL_DIRECTION_INPUT_RC137__;
 L.bind({project,size:()=>90,paintEnvelope:(s,a)=>{const p=project(a.x,a.y);return{left:p.x-50,right:p.x+50,top:p.y-100,bottom:p.y+10,nativePaint:true};}});
 I.bind({project,clearTarget:s=>{s.target=null;},resetDodge:s=>{s.dodgePath=[];}});
 const s={time:100,zone:'cult04',activeHeroId:'hwando',x:15,y:23,moveVx:0,moveVy:0,enemies:[{id:'inner-evil-rc133',boss:true,hp:100,x:23,y:15,sprite:'normal'}]};
 const k=height/720,w=width/k,view={x:640-w/2,y:0,width:w,height:720,k};
 return {s,L,I,project,view};
}
let baselineReproductions=0;
for(const [width,height]of [[1280,900],[844,390],[844,240]]){
 const old=fixture(baseline,width,height),prior=old.L.camera(old.s,old.view);
 old.s.x+=2;old.s.y+=2;
 const moved=old.L.camera(old.s,old.view);
 ok(moved.y!==prior.y,'public baseline camera follows world depth at '+width+'x'+height);baselineReproductions++;
 const f=fixture(layout,width,height),fixed=f.L.camera(f.s,f.view);
 for(const inverted of [false,true])for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']){
  f.s.x=inverted?23:15;f.s.y=inverted?15:23;f.s.time+=1;
  const keys=new Set([key]),v=f.I.acquire(f.s,keys),from=f.project(f.s.x,f.s.y);
  const heading={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[key];
  eq([v.screenX,v.screenY],heading,'held key records screen heading '+key);
  f.s.x+=v.x*.75;f.s.y+=v.y*.75;
  const to=f.project(f.s.x,f.s.y),dx=to.x-from.x,dy=to.y-from.y;
  ok(dx*heading[0]+dy*heading[1]>0,'real input maps to projected screen heading '+key);
  ok(Math.abs(dx*heading[1]-dy*heading[0])<1e-7,'input never introduces off-axis camera-like drift '+key);
  eq(f.L.camera(f.s,f.view),fixed,'world input leaves framing fixed '+key+' inversion='+inverted);
  // A blink displacement uses the same held vector, without a camera-follow
  // write. This is a projection unit, not a native blink acceptance claim.
  f.s.x+=v.x*2;f.s.y+=v.y*2;
  eq(f.L.camera(f.s,f.view),fixed,'blink displacement leaves framing fixed '+key);
  f.s.x=38-f.s.x;f.s.y=38-f.s.y;
  eq(f.L.camera(f.s,f.view),fixed,'both-axis map inversion leaves framing fixed '+key);
  f.I.acquire(f.s,new Set());
  eq([f.s.moveVx,f.s.moveVy],[0,0],'key release clears residual movement '+key);
 }
 ok(f.L.framing(f.s).fixedFloor,'complete legal floor supplies the camera frame');
}
console.log('RC156_INPUT_FRAMING_UNIT',JSON.stringify({status:'passed',checks,baseline:'73a410daf5267fdf1ad2a9cdbaffd85afc407f09',baselineReproductions,viewports:['1280x900','844x390','844x240'],browserVerified:false,scope:'Actual input/projection/framing modules; native keyboard, blink, DOM and scroll assertions remain separately required'}));
