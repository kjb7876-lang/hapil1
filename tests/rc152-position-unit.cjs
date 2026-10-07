'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict'),root=path.resolve(__dirname,'..'),w={},ctx=vm.createContext({window:w,console,Map,WeakMap,WeakSet,Set,Math,Object,Number,Array});
for(const f of ['assets/rc134/persona-duel.js','assets/rc138/battle-arena.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const R=w.__HAPIL_BATTLE_ARENA_RC138__,D=w.__HAPIL_PERSONA_DUEL_RC134__;R.bind({combat:['dist00','cult04'],clear:()=>false});w.__HAPIL_INNER_FINAL_RC133__={encounter:s=>s.zone==='cult04'};w.__HAPIL_SAMONG_RC91__={active:()=>true};let checks=0;
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
console.log('RC152_POSITION_UNIT',JSON.stringify({status:'passed',checks,atomic:true,staged:true}));
