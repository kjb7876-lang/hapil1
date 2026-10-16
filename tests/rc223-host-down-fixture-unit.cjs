'use strict';

// Focused source-extraction check for the real RC24 leech hook. The browser
// fixture's old 100000 body packet healed its own boss source by a percentage
// of the accepted incoming damage before the co-op revive window began.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'assets/rc24/raid.js'),'utf8');
const window={__HAPIL_MODES_V31346__:{mode:state=>state.gameModeV31346}};
vm.runInNewContext(source,{window,requestAnimationFrame:()=>{},setInterval:()=>{}},{filename:'assets/rc24/raid.js'});
const raid=window.__HAPIL_RAID_RC24__;
assert.equal(raid.version,'3.24-RAID-RC24');

function applyBossLeech({mode,applied,hp=1,maxHp=100000}){
  const boss={id:'dist06-boss',boss:true,midboss:false,hp,maxHp};
  const state={time:4,gameModeV31346:mode,enemies:[boss]};
  const sourceHit={id:'rc223-host-down-native-incoming',sourceId:boss.id,boss:true,damage:applied};
  const before=boss.hp,flags=raid.flags(state,sourceHit),accepted=raid.afterHit(state,sourceHit,applied);
  return{boss,state,sourceHit,before,flags,accepted,delta:boss.hp-before,after:boss.hp};
}

const overkill=applyBossLeech({mode:'STORY',applied:123320});
assert.equal(overkill.flags.actor,overkill.boss,'the native source id resolves to the living dist06 boss');
assert.equal(overkill.flags.boss,true,'the native incoming source is classified as a boss hit');
assert.equal(overkill.accepted,true,'the production afterHit hook accepts the boss-owned source');
assert.equal(overkill.delta,3083,'the old overkill packet leeches 2.5 percent of the actual applied damage');
assert.equal(overkill.after,3084,'a one-HP staged boss becomes 3084 HP before the guest attack begins');

const controlled=applyBossLeech({mode:'STORY',applied:100});
assert.equal(controlled.accepted,true);
assert.equal(controlled.delta,2.5,'100 applied STORY damage leeches only 2.5 boss HP');
assert.equal(controlled.after,3.5,'the controlled native packet keeps the naturally leeching boss in the basic-hit kill range');

for(const [mode,rate,minimum]of[['STORY',.025,.01],['HELL',.055,.03],['DREAM',.08,.06]]){
  const sample=applyBossLeech({mode,applied:100});
  assert.equal(sample.flags.ratio,minimum,'ordinary boss hits retain the native minimum for this mode');
  assert(Math.abs(sample.delta-100*rate)<1e-10,mode+' uses its production RC24 boss-leech rate');
}

const capped=applyBossLeech({mode:'STORY',applied:10000,hp:99999,maxHp:100000});
assert.equal(capped.after,100000,'native leech remains capped at boss max HP');

const nonBoss={id:'dist06-add',boss:false,midboss:false,hp:1,maxHp:100};
const nonBossState={time:4,gameModeV31346:'STORY',enemies:[nonBoss]};
const nonBossSource={id:'non-boss-source',sourceId:nonBoss.id,damage:100};
assert.equal(raid.afterHit(nonBossState,nonBossSource,100),true,'the native hook still recognizes a valid non-boss source');
assert.equal(nonBoss.hp,1,'a non-boss source does not leech its own HP');

const unmatchedState={time:4,gameModeV31346:'STORY',enemies:[]};
assert.equal(raid.afterHit(unmatchedState,{id:'unmatched',sourceId:'missing-boss',boss:true},100),false,'unmatched non-explicit sources do not enter RC24 leech');

console.log('RC223_HOST_DOWN_FIXTURE_UNIT '+JSON.stringify({
  source:'assets/rc24/raid.js actual RC24 implementation loaded in vm',
  checks:19,
  oldFixture:{mode:'STORY',appliedDamage:123320,bossHpBefore:1,bossHpAfter:overkill.after,bossHpLeech:overkill.delta},
  controlledFixture:{mode:'STORY',appliedDamage:100,bossHpBefore:1,bossHpAfter:controlled.after,bossHpLeech:controlled.delta},
  modeRates:{STORY:{leech:.025,minimum:.01},HELL:{leech:.055,minimum:.03},DREAM:{leech:.08,minimum:.06}},
  productionMutated:false
}));
