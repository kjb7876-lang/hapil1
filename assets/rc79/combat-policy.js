/* RC79: deterministic presentation / movement / encounter pacing policy. */
(() => {
 'use strict';
 const budgets=new WeakMap();
 function advanceFinalClock(state,dt,blocked){
   const b=state?.hapilFinalBattleV31300;
   if((window.__HAPIL_MODES_V31346__?.mode(state)??state?.gameModeV31346??'STORY')!=='STORY'||blocked||!state||state.hp<=0||state.zone!=='cult04'||!b||b.stage<7||b.completed||!Number.isFinite(dt)||dt<=0)return;
   b.combatElapsedRC79=Math.max(0,Number(b.combatElapsedRC79)||0)+Math.min(.25,dt);
 }
 const isLaser=h=>!!h&&(h.shape==='line'||h.laserV31330===true||h.bloodLaserV31516===true);
 function blinkDestination(origin,vector,distance,walkable){
   let result={x:origin.x,y:origin.y};const steps=Math.max(1,Math.ceil(Math.max(0,distance)/.10));
   for(let i=1;i<=steps;i++){const p={x:origin.x+vector.x*distance*i/steps,y:origin.y+vector.y*distance*i/steps};
     if(!walkable(p))break;result=p;
   }return result;
 }
 function finalFloor(state,enemy){
   const b=state?.hapilFinalBattleV31300;
   if((window.__HAPIL_MODES_V31346__?.mode(state)??state?.gameModeV31346??'STORY')!=='STORY'||state?.zone!=='cult04'||enemy?.id!=='c104-boss'||!enemy.hapilSecondPhaseV31300||!b||b.stage<7)return 0;
   const start=Number.isFinite(b.combatStartedAtRC79)?b.combatStartedAtRC79:Number(b.startedAt)+6.75;
   const fallback=Number(state.time)-start;
   const elapsed=Number.isFinite(b.combatElapsedRC79)?Math.max(0,b.combatElapsedRC79):Number.isFinite(fallback)?Math.max(0,fallback):0;
   return elapsed<60?Math.max(1,Math.ceil(enemy.maxHp*(1-elapsed/60))):0;
 }
 function balancedDamage(state,enemy,damage){
   if(!Number.isFinite(damage)||damage<=0)return 0;
   if(window.__HAPIL_DANMAKU_RPG_RC88__?.simpleTarget(enemy))return damage;
   if(!enemy||(!enemy.boss&&!enemy.midboss))return damage;
   if(!Number.isFinite(enemy.maxHp)||enemy.maxHp<=0)return 0;
   const now=Number(state?.time)||0,awakened=window.__HAPIL_SAMONG_RC91__?.active(state)===true,final=(window.__HAPIL_MODES_V31346__?.mode(state)??state?.gameModeV31346??'STORY')==='STORY'&&state?.zone==='cult04'&&enemy.id==='c104-boss'&&enemy.hapilSecondPhaseV31300;
   if(!final&&window.__HAPIL_COMBAT_FLOW_RC95__?.enabled(state))return damage;
   const clock=final ? Number(state.hapilFinalBattleV31300?.combatElapsedRC79)||0 : awakened?window.__HAPIL_SAMONG_RC91__.clock(state):now;
   const rate=(final ? .014 : enemy.boss ? .08 : .14) *
     (window.__HAPIL_DANMAKU_RPG_RC88__?.budgetFactor(state,enemy) ?? 1)*(awakened?5:1);
   let b=budgets.get(enemy);
   if(!b||b.final!==final||clock<b.at||b.max!==enemy.maxHp)b={at:clock,credit:enemy.maxHp*rate,final,max:enemy.maxHp};
   b.credit=Math.min(enemy.maxHp*rate,b.credit+Math.max(0,clock-b.at)*enemy.maxHp*rate);b.at=clock;
   const applied=Math.max(0,Math.min(damage,b.credit));b.credit-=applied;budgets.set(enemy,b);return applied;
 }
 window.__HAPIL_RC79__=Object.freeze({version:'RC80',advanceFinalClock,isLaser,blinkDestination,finalFloor,balancedDamage});
})();
