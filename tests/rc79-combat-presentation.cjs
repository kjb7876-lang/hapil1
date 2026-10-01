const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const main=fs.readFileSync('assets/index-v31526.js','utf8'),window={};
vm.runInNewContext(fs.readFileSync('assets/rc79/combat-policy.js','utf8'),{window,Math,Number,Object,WeakMap});
const p=window.__HAPIL_RC79__;
const ctx={window,Math,Number,Object};
const a=main.indexOf('function HAPIL_blinkVectorV31345('),b=main.indexOf('\nfunction MONGSE_planAutoSkill',a);
vm.runInNewContext(main.slice(a,b)+'\nglobalThis.vector=HAPIL_blinkVectorV31345;',ctx);
for(const [keys,x,y] of [[['ArrowRight'],1,0],[['ArrowLeft'],-1,0],[['ArrowUp'],0,-1],[['ArrowDown'],0,1],[['ArrowUp','ArrowRight'],Math.SQRT1_2,-Math.SQRT1_2]]){
 const v=ctx.vector(new Set(keys),-1,{x:-1,y:1});assert(Math.abs(v.x-x)<1e-10&&Math.abs(v.y-y)<1e-10);
 const end=p.blinkDestination({x:10,y:10},v,3,q=>q.x<11);
 assert(Math.abs((end.x-10)*v.y-(end.y-10)*v.x)<1e-10,'blocked blink may not snap sideways');
 assert((end.x-10)*v.x+(end.y-10)*v.y>=0,'blocked blink may not reverse');
}
assert.equal(ctx.vector(new Set(),1,null,{x:0,y:-1}).y,-1,'release uses manual movement, not target-facing');
// Real production finale wrappers: artificial burst cannot set final-hit flags before 60 active seconds.
for(const automatic of [false,true]){
 const c={window:{__HAPIL_RC79__:p,__HAPIL_AUTO_COMBAT_ACTIVE_V31301__:automatic,__HAPIL_MANUAL_COMBAT_INPUT_AT_V31300__:Date.now()},Date,Math,Number,Set,emit(){},MONGSE_phaseGateHealth:(s,e,d)=>Math.max(0,e.hp-d),MONGSE_isPersistentBossCastActive:()=>false,MONGSE_storageSet(){}};vm.createContext(c);
 const start=main.indexOf('  const basePhaseGateHealthV31300 ='),end=main.indexOf('  MONGSE_tickPersistentBossCastProtection = function HAPIL_tickNonInterruptAndFinalV31300',start);
 vm.runInContext(main.slice(start,end),c);
 const ws=main.indexOf('  const basePhaseGateHealth = MONGSE_phaseGateHealth;'),we=main.indexOf('  const basePersistentTick =',ws);vm.runInContext(main.slice(ws,we),c);
 const enemy={id:'c104-boss',hp:10000,maxHp:10000,hapilSecondPhaseV31300:true},state={zone:'cult04',time:3,hapilFinalBattleV31300:{stage:7,startedAt:0,monochromeActiveV31377:true,combatElapsedRC79:0,finalHitCommittedV31377:false}};
 for(const elapsed of [0,1,30,59.999]){state.hapilFinalBattleV31300.combatElapsedRC79=elapsed;const hp=c.MONGSE_phaseGateHealth(state,enemy,1e15);assert(hp>=1);assert.equal(state.hapilFinalBattleV31300.finalHitCommittedV31377,false);enemy.hp=hp;}
 state.hapilFinalBattleV31300.combatElapsedRC79=60;assert.equal(c.MONGSE_phaseGateHealth(state,enemy,1e15),0);assert.equal(state.hapilFinalBattleV31300.finalHitCommittedV31377,true);
}
// 60Hz burst stream remains finite and takes over one minute at full damage saturation.
const e={id:'c104-boss',boss:true,hapilSecondPhaseV31300:true,hp:10000,maxHp:10000};const s={zone:'cult04',time:0,hapilFinalBattleV31300:{combatElapsedRC79:0}};
let end=0;for(let frame=0;frame<6000&&e.hp>0;frame++){s.time=frame/60*.09;s.hapilFinalBattleV31300.combatElapsedRC79=frame/60;e.hp-=p.balancedDamage(s,e,1e12);end=frame/60;assert(Number.isFinite(e.hp));}assert(end>=60&&end<90,`finale pacing ${end}s`);
assert.equal(p.balancedDamage({}, {boss:true,maxHp:100},Infinity),0);
// Run final native hooks with a real pending-hit queue; no non-laser floor warnings survive.
const q={window:{__HAPIL_RC79__:p},Math,Number,String,Set,qn:()=> 'warning',MONGSE_drawTelegraphSafetyOverlay:()=> 'safety',Ei(state){state.pendingHits.push({at:4,shape:'circle'},{at:4,shape:'line'});},MONGSE_phaseGateHealth:(s,e,d)=>e.hp-d,Ln(){},MONGSE_phaseSpriteForRender:()=>null,MONGSE_runtimeSprite:(cache,pose)=>pose,MONGSE_zoneAssetManifest:()=>new Set(),MONGSE_zoneAssetPlan31220:()=>({}),N:{cult03:{enemies:[{id:'c103-mid'},{id:'c103-boss'}]}}};
vm.runInNewContext(main.slice(main.indexOf('/* RC79: final authoritative'),main.indexOf('/* RC94: a laser cooldown')),q);
const state={time:1,pendingHits:[]};q.Ei(state,{});assert.equal(state.pendingHits[0].at,4);assert.equal(state.pendingHits[1].at,4);assert.equal(q.qn({},state.pendingHits[0]),false);assert.equal(q.qn({},state.pendingHits[1]),'warning');
for(const actor of q.N.cult03.enemies)for(const direction of ['front','back','left','right'])for(const mode of ['idle','attack','skill','guard','dash']){
 const a={...actor,direction,dashingUntil:mode==='dash'?2:0,attackAt:mode==='attack'?2:0,castVisualUntil31210:mode==='skill'?2:0,staggerUntil:mode==='guard'?2:0};
 const file=q.MONGSE_phaseSpriteForRender({},a,1);assert(fs.existsSync(file),file);assert(file.includes('/normalized/'));
}
console.log('RC79 PASS: solid beams, directional blink with blocked destinations, non-laser releases and warnings, 40 legacy poses, manual/auto 60s ending gate, real-time damage budget (~'+end.toFixed(1)+'s).');
