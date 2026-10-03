'use strict';
const assert=require('node:assert/strict'),P=require('../assets/rc130/projectile-policy.js');let checks=0;
const shapes=['circle','cone','cross','donut','safe','line'];
for(const shape of shapes){
 const e={kind:'enemyAttack',telegraphImpact:true,actualBossSkillVfx:true,impactShape:shape,impactRadius:9,impactWidth:2,born:0,duration:2,sourceId:'boss'},before=JSON.stringify(e),s={time:1,effects:[e],hp:100};
 assert(!P.melee(e),'boss '+shape+' must retain its area renderer');checks++;
 assert(!P.barrage(e),'stationary '+shape+' is not a bullet');checks++;
 P.prepare(s);assert.equal(s.effects.length,1,'area lifetime untouched');checks++;
 assert.equal(JSON.stringify(e),before,'area geometry untouched');checks++;
}
for(const key of ['bossImpactTransitV31232','postTelegraphCoverageImageV31233','cosmicChargeV31318','spectacleChargeV31317']){assert(!P.melee({kind:'enemyAttack',[key]:true}),'special class '+key);checks++;}
console.log('RC130_ISOLATION_RESULT',JSON.stringify({status:'passed',checks,scope:'boss hazard classification unit regression'}));
