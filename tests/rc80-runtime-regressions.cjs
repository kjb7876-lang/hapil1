const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const main=fs.readFileSync('assets/index-v31526.js','utf8'),window={};
vm.runInNewContext(fs.readFileSync('assets/rc79/combat-policy.js','utf8'),{window});
const p=window.__HAPIL_RC79__;
const s={hp:100,zone:'cult04',hapilFinalBattleV31300:{stage:7,combatElapsedRC79:0}};
p.advanceFinalClock(s,.1,false);assert.equal(s.hapilFinalBattleV31300.combatElapsedRC79,.1);
for(const dt of [NaN,Infinity,-1,0])p.advanceFinalClock(s,dt,false);
p.advanceFinalClock(s,10,true);assert.equal(s.hapilFinalBattleV31300.combatElapsedRC79,.1);
p.advanceFinalClock(s,10,false);assert.equal(s.hapilFinalBattleV31300.combatElapsedRC79,.35);
s.hapilFinalBattleV31300.completed=true;p.advanceFinalClock(s,.1,false);assert.equal(s.hapilFinalBattleV31300.combatElapsedRC79,.35);
assert.equal(p.finalFloor({zone:'cult04',hapilFinalBattleV31300:{stage:7}},{id:'c104-boss',hapilSecondPhaseV31300:true,maxHp:100}),100);
function extract(start,end){const a=main.indexOf(start),b=main.indexOf(end,a);assert(a>=0&&b>a);return main.slice(a,b);}
const c={window,ji:r=>({...r})};vm.createContext(c);
vm.runInContext(extract('  const baseReadSave = ji;','  const baseSerializeSave = Fi;'),c);
vm.runInContext(extract('function HAPIL_restoreFinalBattleV31301(', '\nfunction HAPIL_restoreEntryFlowV31301'),c);
for(const elapsed of [undefined,42]){
 const raw={hapilFinalBattleV31301:{stage:7,elapsed:50,secondPhaseActive:true,combatElapsedRC79:elapsed,boss:{id:'c104-boss',hp:25,maxHp:100}}};
 const saved=c.ji(raw),state={zone:'cult04',time:100,hp:100,enemies:[{id:'c104-boss',hp:100,maxHp:100}]};
 assert(c.HAPIL_restoreFinalBattleV31301(state,saved));assert.equal(state.enemies[0].hp,elapsed===undefined?100:25);
 assert.equal(state.hapilFinalBattleV31300.combatElapsedRC79,elapsed??0);
}
let rendered=0,legacy=0;
const r={window:{__HAPIL_ARSENAL_V31318__:{draw(){legacy++;return true}}},HAPIL_RC13_RENDER:{scope:(ctx,e,k,fn)=>fn(ctx)},Gn(){rendered++;return true}};
vm.runInNewContext(extract('function HAPIL_drawSkillRC13(', '\nwindow.__HAPIL_RENDER_RC13__'),r);
r.HAPIL_drawSkillRC13({}, {}, {telegraphImpact:true,rootAttack:true},0,{});assert.equal(rendered,1);assert.equal(legacy,0);
const d={window,HAPIL_finiteV31303:(n,f=0)=>Number.isFinite(n)?n:f,HAPIL_bossCastDamageFactorV31342:()=>1,MONGSE_phaseGateHealth:(s,e,d)=>Math.max(0,e.hp-d)};
vm.runInNewContext(extract('function HAPIL_applyCounterDamageV31303(', '\nfunction HAPIL_probeCombatFlowV31303'),d);
const enemy={boss:true,hp:1000,maxHp:1000},state={time:0};
assert.equal(d.HAPIL_applyCounterDamageV31303(state,enemy,99999).appliedDamage,80);
assert.equal(d.HAPIL_applyCounterDamageV31303(state,enemy,99999).appliedDamage,0);
state.time=1;assert.equal(d.HAPIL_applyCounterDamageV31303(state,enemy,99999).appliedDamage,80);
console.log('RC80 PASS: active clock, old/new save restore, native skill renderer priority, canonical boss damage budget.');
