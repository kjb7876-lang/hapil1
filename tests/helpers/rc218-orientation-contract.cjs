'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async function orientationContract(page,out){
 const probe=()=>{const C=window.__HAPIL_CONTROLS_V31329__,g=document.getElementById('rc152-orientation-gate'),s=C.binding.state.current;return{paused:window.__HAPIL_ORIENTATION_PAUSE_RC152__.paused(),guide:g?.textContent,guideVisible:!!g&&getComputedStyle(g).display!=='none',gameVisibility:getComputedStyle(document.querySelector('.game')).visibility,inputCount:C.binding.input.current.size,time:s.time,hp:s.hp};};
 await page.waitForFunction(()=>window.__HAPIL_ORIENTATION_PAUSE_RC152__.paused());let p=await page.evaluate(probe);assert.equal(p.guide,'가로 화면으로 전환해주세요');assert(p.guideVisible);assert.equal(p.gameVisibility,'hidden');assert.equal(p.inputCount,0);
 await page.screenshot({path:path.join(out,'orientation-portrait-guide.png')});
 await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>!window.__HAPIL_ORIENTATION_PAUSE_RC152__.paused());
 for(let i=0;i<24&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(60);}
 await page.evaluate(()=>{
  const C=window.__HAPIL_CONTROLS_V31329__,Q=window.__RC142_VOLLEY_QA__,B=window.__HAPIL_RC86_BRIDGE__,H=window.__HAPIL_INNER_FINAL_RC133__,original=C.binding.state.current,s=Q.initial();
  Object.assign(s,{zone:'cult04',time:200,x:13.8,y:24.2,hp:240,maxHp:240,activeHeroId:'gunner',gameModeV31346:'DREAM',samongUnlockedRC91:true,spawnedWaves:new Set([1,2,3,4]),completedZones:new Set(),hostileProjectiles:[],pendingHits:[],impactQueue:[],effects:[],encounterLockUntil31226:0,encounterDialogue31226:null,encounterWallUnlockAtV31227:0,timeStopUntil:0,invulnerableUntil:240});
  const source=B.cloneEnemy(B.actor('cult04','c104-boss'),'cult04');source.hp=0;s.enemies=[source];C.binding.state.current=s;C.setMode('manual');if(!H.start(s,source))throw Error('native Persona orientation fixture failed');Object.assign(s.innerFinalRC133,{phase:'fight',intro:0,awake:7,awakeningCooldown:28,shotDelay:0,cycle:0});s.invulnerableUntil=s.time+40;H.tick(s,.016);if(!s.hostileProjectiles.length)throw Error('orientation fixture has no native packets');
  window.__RC218_ORIENTATION__={s,original};
  window.__RC218_ORIENTATION_SNAPSHOT__=()=>{const real=C.binding.state.current,fields=(o,keys)=>Object.fromEntries(keys.map(k=>[k,o[k]??null]));return{sameState:real===s,zone:real.zone,time:real.time,hp:real.hp,x:real.x,y:real.y,inner:{...real.innerFinalRC133},boss:real.enemies.map(a=>fields(a,['id','hp','x','y','currentPhase','fixedPhase','attackAt','recoverUntil','readyAt','atomicCastUntil31210'])),packets:real.hostileProjectiles.map(q=>fields(q,['id','sourceId','x','y','vx','vy','born','frozenUntil','motionReleaseAt31219','expiresAt','damage','projectileRemovalReason31215'])),pending:real.pendingHits.map(q=>fields(q,['id','sourceId','born','at','damage']))};};
 });
 await page.screenshot({path:path.join(out,'orientation-landscape-before.png')});
 const rows=[];
 try{
  for(const viewport of [{width:390,height:844},{width:430,height:932},{width:320,height:568}]){
   await page.keyboard.down('ArrowRight');await page.waitForTimeout(100);
   await page.setViewportSize(viewport);await page.waitForFunction(()=>window.__HAPIL_ORIENTATION_PAUSE_RC152__.paused());
   p=await page.evaluate(probe);assert(p.paused&&p.guideVisible);assert.equal(p.guide,'가로 화면으로 전환해주세요');assert.equal(p.gameVisibility,'hidden');assert.equal(p.inputCount,0);
   const before=await page.evaluate(()=>window.__RC218_ORIENTATION_SNAPSHOT__());assert(before.sameState);assert(before.packets.length>0);
   await page.keyboard.press('ArrowLeft');await page.keyboard.press('s');await page.touchscreen.tap(100,200);await page.mouse.click(200,300);await page.keyboard.up('ArrowRight');await page.waitForTimeout(1200);
   const frozen=await page.evaluate(()=>window.__RC218_ORIENTATION_SNAPSHOT__());assert.deepEqual(frozen,before,'portrait must freeze actual native simulation, HP, phase, packet positions and all emission/expiry clocks');assert.equal((await page.evaluate(probe)).inputCount,0);
   await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>!window.__HAPIL_ORIENTATION_PAUSE_RC152__.paused());
   const entered=await page.evaluate(()=>window.__RC218_ORIENTATION_SNAPSHOT__());assert(entered.sameState);assert.equal(entered.zone,before.zone);assert.deepEqual(entered.boss.map(a=>a.id),before.boss.map(a=>a.id));assert.equal(entered.hp,before.hp);assert(entered.time>=before.time&&entered.time-before.time<.5,'rotation does not catch up paused wall time');
   await page.waitForFunction(t=>window.__HAPIL_CONTROLS_V31329__.binding.state.current.time>t,entered.time);const resumed=await page.evaluate(probe);assert(!resumed.paused&&!resumed.guideVisible);assert.notEqual(resumed.gameVisibility,'hidden');assert.equal(resumed.inputCount,0);
   rows.push({viewport,pauseSeconds:1.2,packetCount:before.packets.length,freezeExact:true,sameState:true,landscapeResumed:true,heldInputCleared:true});
  }
  await page.screenshot({path:path.join(out,'orientation-landscape-resumed.png')});
  return{status:'passed',product:'mobile landscape only',portraitPurpose:'rotation guide and suspended combat/input; portrait combat stress not applicable',emulated:true,fixture:'native cult-death Persona with native packets; invulnerability assists orientation observation, not a natural-clear claim',rows};
 }finally{await page.evaluate(()=>{const f=window.__RC218_ORIENTATION__;if(!f)return;window.__HAPIL_INNER_FINAL_RC133__.restore(f.s,null);window.__HAPIL_CONTROLS_V31329__.binding.state.current=f.original;delete window.__RC218_ORIENTATION__;delete window.__RC218_ORIENTATION_SNAPSHOT__;});}
};
