'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const w={};w.window=w;vm.createContext(w);for(const p of ['assets/rc134/persona-duel.js','assets/rc137/direction-input.js','assets/rc79/combat-policy.js'])vm.runInContext(fs.readFileSync(p,'utf8'),w);
const D=w.__HAPIL_DIRECTION_INPUT_RC137__,P=w.__HAPIL_PERSONA_DUEL_RC134__,project=(x,y)=>({x:27*(x-y),y:13.5*(x+y)});let wall=false;
D.bind({project,clearTarget:()=>{},resetDodge:()=>{},walkable:(s,p)=>P.contains(p,'left',.8)&&(!wall||Math.hypot(p.x-s.x,p.y-s.y)<.137)});
let checks=0;const keys=[['ArrowUp'],['ArrowDown'],['ArrowLeft'],['ArrowRight'],['ArrowUp','ArrowLeft'],['ArrowUp','ArrowRight'],['ArrowDown','ArrowLeft'],['ArrowDown','ArrowRight']];
for(const input of keys){const s={zone:'test',activeHeroId:'slayer',time:1,x:14,y:24},v=D.acquire(s,new Set(input));assert(Math.abs(Math.hypot(v.x,v.y)-1)<1e-12);const desired={x:s.x+v.x*.4,y:s.y+v.y*.4},to=D.constrain(s,{x:s.x,y:s.y},desired);assert(Math.abs(Math.hypot(to.x-s.x,to.y-s.y)-.4)<1e-9);checks+=2;
 wall=true;const stopped=D.constrain(s,{x:s.x,y:s.y},desired);assert(Math.hypot(stopped.x-s.x,stopped.y-s.y)<.1370001);assert(Math.hypot(stopped.x-s.x,stopped.y-s.y)>.13699);wall=false;checks+=2;
 const blink=w.__HAPIL_RC79__.blinkDestination(s,v,2.25,p=>P.contains(p,'left',.8));assert(Math.abs(Math.hypot(blink.x-s.x,blink.y-s.y)-2.25)<1e-8);checks++;
}
const upper=P.polygon('left',.8).map(p=>p.x+p.y),min=Math.min(...upper),max=Math.max(...upper);assert(Math.abs((38-min)-(max-38))<1e-8);checks++;
console.log(JSON.stringify({status:'passed',checks,headings:8,diagonalWorldDistance:2.25,wallRayStop:true,topBottomPolygonSymmetric:true,scope:'actual policies with synthetic collision callback; no browser or physical-device claim'}));
