'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root={console},context={window:root,console};vm.createContext(context);
vm.runInContext(fs.readFileSync('assets/combat-v31402/combat-core.js','utf8'),context);
const C=root.__HAPIL_COMBAT_CORE_V31401__,s={zone:'dist00',time:1,hp:240,maxHp:240,activeHeroId:'gunner'},a={id:'ally',hp:240,maxHp:240},enemy={id:'enemy',hp:1000,maxHp:1000};
s.enemies=[enemy];let mode='semi',checks=0;
const equal=(actual,expected,label)=>{assert.equal(actual,expected,label);checks++;};
equal(C.finalDamage(s,s,1,'incoming'),1,'unbound controls retain baseline');
root.__HAPIL_CONTROLS_V31329__={effective:()=>mode};
for(const selected of ['manual','semi','full'])for(const direction of ['incoming','outgoing'])for(const amount of [.25,1,17.125,500]){
 mode=selected;const before=JSON.stringify(s),factor=mode==='full'?(direction==='incoming'?.1:1.7):1;
 C.transaction(s,s,{},'unit',()=>{
  const value=C.finalDamage(s,s,amount,direction);
  equal(value,amount*factor,'exact final multiplier');
  equal(C.finalDamage(s,s,value,direction),value,'second call cannot multiply twice');
  equal(C.finalDamage(s,s,amount,direction),value,'recomputed baseline cannot multiply twice');
  C.mark(s,s,'HIT','unit',{appliedDamage:value});
 });
 equal(JSON.stringify(s),before,'transient scaling never mutates actor or save data');
 const row=C.snapshot(s).events.at(-1);equal(row.finalDamage.factor,factor,'journal records factor');equal(row.finalDamage.baseline,amount,'journal records same-build baseline');
}
mode='full';const source={id:3};
C.transaction(s,a,source,'outer',()=>{
 mode='manual';
 C.ally(s,a,20,source,()=>{equal(C.finalDamage(s,a,20,'incoming'),2,'shared ally transaction captures effective mode at admission');return true;});
 equal(C.finalDamage(s,a,2,'incoming'),2,'outer contact cannot repeat ally multiplier');
});
equal(C.snapshot(s).events.at(-1).controlMode,'full','mid-transaction mode change applies to next hit');
equal(C.snapshot(s).pendingTransactions,0,'nested transactions close');
equal(C.finalDamage(s,s,20,'incoming'),20,'next hit immediately uses manual setting');
s.combatModeV31329='full';mode='semi';equal(C.finalDamage(s,s,20,'incoming'),20,'stale saved world mode cannot enable scaling');
for(let i=0;i<20;i++){
 mode=i%2?'manual':'full';const restored=JSON.parse(JSON.stringify(s));
 equal(C.finalDamage(restored,restored,20,'incoming'),mode==='full'?2:20,'save/load and repeated toggles never stack');
}
for(const value of [0,-1,NaN,Infinity])equal(Object.is(C.finalDamage(s,s,value,'incoming'),value),true,'invalid/empty packet remains native-owned');
equal(C.snapshot(s).pendingTransactions,0,'journal is idle after all checks');
mode='full';
C.enemy(s,enemy,100,{heroId:'gunner'},()=>{
 equal(C.finalDamage(s,enemy,100,'outgoing'),170,'outgoing packet has one factor');
 equal(C.nativeOutgoingAmount(s,enemy,170),100,'downstream native cap reads original units');
 equal(C.outgoingBudget(s,enemy,20),34,'native admitted packet keeps exact outgoing ratio');
 equal(C.nativeOutgoingAmount(s,enemy,34),20,'window spending excludes transient gain');
 equal(C.finalDamage(s,enemy,34,'outgoing'),34,'nested helper cannot repeat admitted multiplier');
 equal(C.outgoingBudget(s,enemy,0),0,'exhausted window cannot manufacture damage');
});
equal(C.snapshot(s).events.at(-1).finalDamage.baseline,0,'journal reflects admitted native budget');
console.log('RC134_FULLAUTO_UNIT',JSON.stringify({status:'passed',checks,exactFactors:true,nestedOnce:true,transientOnly:true}));
