'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict'),root=path.resolve(__dirname,'..'),w={},ctx=vm.createContext({window:w,console,Map,WeakMap,WeakSet,Set,Math,Object,Number,Array});
w.__HAPIL_SAMONG_RC91__={enabled:s=>s?.zone==='cult04',active:()=>true};
for(const f of ['assets/rc134/persona-duel.js','assets/rc138/battle-arena.js','assets/rc133/inner-final.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const R=w.__HAPIL_BATTLE_ARENA_RC138__,D=w.__HAPIL_PERSONA_DUEL_RC134__,H=w.__HAPIL_INNER_FINAL_RC133__;R.bind({combat:['dist00','cult04'],clear:()=>false});let checks=0;
function near(a,b){checks++;assert(Math.abs(a.x-b.x)<1e-8&&Math.abs(a.y-b.y)<1e-8,JSON.stringify({a,b}));}
for(const zone of ['dist00','cult04'])for(const swap of [false,true]){
 const s={zone,hp:240,x:18,y:19.45,time:1,enemies:[{id:zone==='cult04'?'inner-evil-rc133':'boss',x:24,y:14,hp:100}],innerFinalRC133:{phase:'fight',awake:7,duelSwap:swap}};R.enforce(s);
 if(zone==='dist00'&&!swap){s.x=18;s.y=19.45;const desired={x:18.2,y:19.65};assert(R.applyPosition(s,desired));near(s,desired);}
 for(const a of [s,s.enemies[0]])for(let i=0;i<128;i++){
  const desired={x:19+18*Math.cos(i*Math.PI/64),y:19+12*Math.sin(i*Math.PI/64)},side=R.side(s,a===s),radius=zone==='cult04'?.8:a===s?.8:.72,expected=D.point(desired,side,radius);
  assert(R.applyPosition(a,desired));near(a,expected);near(R.movement(s,a,desired,.01),expected);
 }
 s.hp=0;assert(!R.applyPosition(s,{x:1,y:1}));checks++;
}
{
 const s={zone:'cult04',hp:240,time:10,fxSerial:1,floatTexts:[],x:18,y:19.45,innerFinalRC133:{version:1,zone:'cult04',phase:'fight',awake:7,tempoActive:true,tempoClock:2.1,tempoMutualStart:0,tempoSeed:1,duelSwapDone:false,duelSwap:false},enemies:[{id:'inner-evil-rc133',x:20,y:18,hp:100}]},original={hero:{x:s.x,y:s.y},boss:{x:s.enemies[0].x,y:s.enemies[0].y}},screen=p=>({x:640+24*(p.x-p.y),y:50+12*(p.x+p.y)}),center=screen({x:19,y:19});
 D.enforce(s);D.tick(s,0);checks++;assert.equal(s.innerFinalRC133.duelSwapPhase,'warning');assert.equal(D.swapped(s),false);assert(s.floatTexts.some(q=>q.personaMapFlipV31555&&q.text.includes('예고')));checks+=2;
 const savedWarning=H.clean({...s.innerFinalRC133,duelSwapAt:s.innerFinalRC133.duelSwapAt});assert.equal(savedWarning.duelSwapPhase,'warning');assert(savedWarning.duelSwapAt>0);checks+=2;
 s.innerFinalRC133.tempoClock=s.innerFinalRC133.duelSwapAt+.01;D.tick(s,0);assert.equal(s.innerFinalRC133.duelSwapPhase,'transition');assert.equal(D.swapped(s),true);assert.equal(R.side(s,true),'right');assert.equal(R.side(s,false),'left');assert(D.contains(s,'right',.8));assert(D.contains(s.enemies[0],'left',.8));checks+=6;
 const before=screen(original.hero),after=screen(s);assert(Math.abs((after.x-center.x)+(before.x-center.x))<1e-7,'left/right screen axis reflects');assert(Math.abs((after.y-center.y)+(before.y-center.y))<1e-7,'up/down screen axis reflects');checks+=2;
 s.innerFinalRC133.tempoClock=s.innerFinalRC133.duelSwapUntil+.01;D.tick(s,0);assert.equal(D.swapped(s),false);assert.equal(s.innerFinalRC133.duelSwapPhase,'return');near(s,original.hero);near(s.enemies[0],original.boss);assert(R.side(s,true)==='left'&&R.side(s,false)==='right');assert(s.floatTexts.some(q=>q.personaMapFlipV31555&&q.text.includes('원위치')));checks+=5;
}
console.log('RC152_POSITION_UNIT',JSON.stringify({status:'passed',checks,atomic:true,staged:true}));
