'use strict';
// Geometry fixtures only: native attack, blink, hit admission, HP and drawing remain intact.
const assert=require('node:assert/strict');
async function setup(page,index){
 await page.evaluate(()=>{
  const Q=window.__RC158_QA__,C=window.__HAPIL_CONTROLS_V31329__,H=window.__HAPIL_INNER_FINAL_RC133__,B=window.__HAPIL_RC86_BRIDGE__,D=window.__HAPIL_PERSONA_DUEL_RC134__,s=Q.initial();
  // This isolated page removes lane ownership/tracking, not damage/strike validity.
  window.__HAPIL_BATTLE_ARENA_RC138__.bind({combat:[],clear:()=>false});
  window.__HAPIL_PERSONA_DUEL_RC134__=Object.freeze({...D,enforce:state=>H.boss(state),tick:()=>{}});
  Object.assign(s,{zone:'cult04',time:100,activeHeroId:'hwando',gameModeV31346:'DREAM',samongUnlockedRC91:true,encounterDialogue31226:null,encounterLockUntil31226:0,spawnedWaves:new Set([1,2,3,4]),lastAttack:-99});
  C.binding.state.current=s;C.binding.hero.current='hwando';window.__HAPIL_RUN_V31400__.init(s,'hwando',{aiEnabled:false,aiHeroes:[],humanPlayers:1,humanHeroes:[],origin:'practice'});window.__HAPIL_PARTY_V31322__.configure(window.__HAPIL_RUN_V31400__.configFor(s,'hwando'));Q.enter(s,'cult04',false);C.binding.state.current=s;s.encounterDialogue31226=null;s.encounterLockUntil31226=0;C.setMode('manual');C.binding.input.current.clear();
  const leader=B.cloneEnemy(B.actor('cult04','c104-boss'),'cult04');leader.hp=0;s.enemies=[leader];if(!H.start(s,leader))throw Error('native Persona start required');
  s.innerFinalRC133.phase='fight';s.innerFinalRC133.intro=0;s.innerFinalRC133.awake=0;s.innerFinalRC133.shotDelay=100;s.innerFinalRC133.awakeningCooldown=10000;
  s.invulnerableUntil=s.time+30;s.awakeningReadyAt=s.time+10000;
 });
 // Let real map-entry/roster/health initialization finish before reserving a strike.
 await page.waitForTimeout(350);
 return page.evaluate(index=>{
  const Q=window.__RC158_QA__,C=window.__HAPIL_CONTROLS_V31329__,H=window.__HAPIL_INNER_FINAL_RC133__,s=C.binding.state.current;
  C.setMode('manual');C.binding.input.current.clear();s.encounterDialogue31226=null;s.encounterLockUntil31226=0;s.lastAttack=-99;s.activeHeroId='hwando';C.binding.hero.current='hwando';if(!H.encounter(s))throw Error('native Persona entry must survive initialization');
  const v=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]][index],len=Math.hypot(...v),blink={x:-v[1]/len,y:v[0]/len};
  let start;for(let x=12;x<=22&&!start;x+=2)for(let y=12;y<=22&&!start;y+=2){const p={x,y},points=[p,{x:x+v[0]*3.5,y:y+v[1]*3.5},...Array.from({length:30},(_,i)=>({x:x+blink.x*i*.1,y:y+blink.y*i*.1}))];if(points.every(p=>Q.walkable(s.zone,p,s)))start=p;}
  if(!start)throw Error('no native walkable fixture for sector '+index);s.x=start.x;s.y=start.y;
  const target=H.boss(s);target.x=s.x+v[0]*3.5;target.y=s.y+v[1]*3.5;target.invulnerableUntil=0;target.recoverUntil=target.staggerUntil=s.time+30;s.targetEnemyId=target.id;
  const F=window.__HAPIL_FEEDBACK_RC128__,probe=Q.blinkMelee={index,requested:v,start,blink,events:[],seen:[],stages:[],basicBefore:s.basicAttackCount??0,initialTargetHP:target.hp};Q.blinkFeedback=F;
  const V=window.__HAPIL_COMBAT_V31333__;window.__HAPIL_COMBAT_V31333__=Object.freeze({...V,strikeValid(state,h,t){const result=V.strikeValid(state,h,t);if(state===s)probe.stages.push({stage:'strikeValid',result,time:s.time,h:{...h},target:{id:t.id,x:t.x,y:t.y,hp:t.hp},hero:{x:s.x,y:s.y}});return result;}});
  for(const [key,method]of [['__HAPIL_THEME_V31323__','prepareFacing'],['__HAPIL_CONTINUITY_V31322__','prepareStrikes']]){const original=window[key];window[key]=Object.freeze({...original,[method](state,...args){const before=state===s?state.pendingStrikes.map(h=>({...h})):null,result=original[method](state,...args);if(before?.length)probe.stages.push({stage:method,time:s.time,before,after:state.pendingStrikes.map(h=>({...h})),hero:{x:s.x,y:s.y},target:{x:target.x,y:target.y,hp:target.hp}});return result;}});}
  window.__HAPIL_FEEDBACK_RC128__=Object.freeze({...F,record(state,t,row,source){
   const result=F.record(state,t,row,source);if(state===s)probe.seen.push(row);
   if(state===s&&t.id===target.id&&row.kind==='OUTGOING'&&row.result==='HIT'&&probe.ids?.includes(String(row.source.id))){
    const cues=F.snapshot(s).recent,cue=cues.find(e=>e.sequence===row.sequence&&e.targetId===t.id),canvas=document.createElement('canvas');canvas.width=1280;canvas.height=900;canvas.getBoundingClientRect=()=>({width:1280,height:900});const ctx=canvas.getContext('2d'),rotate=ctx.rotate.bind(ctx),rotations=[],rotationCalls=[];ctx.rotate=a=>{rotations.push(a);rotationCalls.push({angle:a,color:ctx.strokeStyle,stack:new Error().stack});return rotate(a);};F.draw(ctx,s,canvas,{shake:false});
    const origin=source?.shmupOriginV31365,p=Q.project(0,0),q=Q.project(t.x-origin.x,t.y-origin.y),current=Q.project(t.x-s.x,t.y-s.y);
    probe.events.push({row,origin,hero:{x:s.x,y:s.y},target:{id:t.id,x:t.x,y:t.y,hp:t.hp},cue,cues,rotations,rotationCalls,expectedAngle:Math.atan2(q.y-p.y,q.x-p.x),currentPositionAngle:Math.atan2(current.y-p.y,current.x-p.x),time:s.time});
   }return result;
  }});
  const prior=new Set(s.pendingStrikes.map(h=>h.id));C.binding.actions.attack();probe.strikes=s.pendingStrikes.filter(h=>!prior.has(h.id)).map(h=>({...h,shmupOriginV31365:{...h.shmupOriginV31365}}));probe.ids=probe.strikes.map(h=>String(h.id));
  if(!probe.strikes.length||!probe.strikes.every(h=>h.at>s.time))throw Error('native delayed melee required');
  probe.beforeBlink={time:s.time,hp:target.hp,eventCount:probe.events.length,pendingIds:s.pendingStrikes.map(h=>h.id)};
  // Reuse the native remembered manual world vector; dispatch the actual action.
  s.lastManualBlinkVectorRC79={...blink,zone:s.zone,hero:s.activeHeroId};C.binding.actions.dash();probe.afterBlink={time:s.time,hero:{x:s.x,y:s.y},hp:target.hp,lastDodgeAt:s.lastDodgeAt,pendingIds:s.pendingStrikes.map(h=>h.id)};
  return{start,afterBlink:probe.afterBlink,strikes:probe.strikes};
 },index);
}
async function boundaries(openProbe){
 const {page,errors}=await openProbe();try{
  const r=await page.evaluate(()=>{
   const Q=window.__RC158_QA__,C=window.__HAPIL_CONTROLS_V31329__,B=window.__HAPIL_RC86_BRIDGE__,s=Q.initial();Object.assign(s,{zone:'dist00',time:100,gameModeV31346:'DREAM',samongUnlockedRC91:true,activeHeroId:'hwando'});C.binding.state.current=s;C.binding.hero.current='hwando';window.__HAPIL_RUN_V31400__.init(s,'hwando',{aiEnabled:false,aiHeroes:[],humanPlayers:1,humanHeroes:[],origin:'practice'});window.__HAPIL_PARTY_V31322__.configure(window.__HAPIL_RUN_V31400__.configFor(s,'hwando'));window.__HAPIL_BATTLE_ARENA_RC138__.bind({combat:[],clear:()=>false});Q.enter(s,'dist00',false);C.binding.state.current=s;C.setMode('manual');C.binding.input.current.clear();s.encounterDialogue31226=null;s.encounterLockUntil31226=0;s.invulnerableUntil=130;s.awakeningReadyAt=10000;s.enemies=[];
   const walls=[];for(const x of [-1,1]){s.x=1.4;s.y=14;s.lastManualBlinkVectorRC79={x,y:0,zone:s.zone,hero:s.activeHeroId};const before={x:s.x,y:s.y,hp:s.hp,time:s.time};if(!Q.walkable(s.zone,before,s))throw Error('wall starting point must be natively walkable');C.binding.actions.dash();walls.push({vector:{x,y:0},before,after:{x:s.x,y:s.y,hp:s.hp,lastDodgeAt:s.lastDodgeAt},outsideWalkable:Q.walkable(s.zone,{x:1.3,y:14},s)});}
   s.x=14;s.y=14;s.lastAttack=-99;s.heroMotion={kind:'idle',until:s.time};const mob=B.cloneEnemy(B.actor('cult01','c101-e2'),'dist00');Object.assign(mob,{x:17.5,y:14,invulnerableUntil:0,recoverUntil:130,staggerUntil:130});s.enemies=[mob];s.targetEnemyId=mob.id;const prior=new Set(s.pendingStrikes.map(h=>h.id));C.binding.actions.attack();const strikes=s.pendingStrikes.filter(h=>!prior.has(h.id)).map(h=>({...h}));if(!strikes.length||!strikes.every(h=>h.at>s.time))throw Error('native delayed region cancellation strike required');const F=window.__HAPIL_FEEDBACK_RC128__;Q.cancelFeedback=F;Q.cancelRows=[];window.__HAPIL_FEEDBACK_RC128__=Object.freeze({...F,record(state,target,row,source){if(state===s)Q.cancelRows.push(row);return F.record(state,target,row,source);}});const before={zone:s.zone,hp:mob.hp,time:s.time};const entry=window.__HAPIL_RC69__.enter(s,'cult01');C.binding.state.current=s;s.encounterDialogue31226=null;s.encounterLockUntil31226=0;Q.cancelState=s;Q.cancelTarget=mob;Q.cancelStrikeIds=strikes.map(h=>String(h.id));return{walls,cancel:{before,strikes,after:{zone:s.zone,time:s.time,pendingIds:s.pendingStrikes.map(h=>String(h.id)),oldTargetHP:mob.hp}}};
  });
  console.log('RC162_NATIVE_BLINK_BOUNDARY_ENTRY',JSON.stringify(r));
  assert.equal(r.walls[0].outsideWalkable,false);assert.equal(r.walls[0].after.x,r.walls[0].before.x,'outward blink cannot cross native wall');assert.equal(r.walls[0].after.y,r.walls[0].before.y);assert(r.walls[1].after.x-r.walls[1].before.x>2,'inward blink succeeds near same wall');for(const w of r.walls){assert.equal(w.after.hp,w.before.hp);assert.equal(w.after.lastDodgeAt,w.before.time);}
  assert.equal(r.cancel.after.zone,'cult01');assert(r.cancel.strikes.every(h=>!r.cancel.after.pendingIds.includes(String(h.id))),'native region entry clears reserved old strikes');assert.equal(r.cancel.after.oldTargetHP,r.cancel.before.hp);
  const deadline=Math.max(...r.cancel.strikes.map(h=>h.at));
  try{await page.waitForFunction(deadline=>window.__RC158_QA__.cancelState.time>deadline,deadline,{timeout:6000,polling:100});}
  catch(error){console.log('RC162_CANCEL_CLOCK_FAILURE',JSON.stringify(await page.evaluate(deadline=>{const Q=window.__RC158_QA__,C=window.__HAPIL_CONTROLS_V31329__,s=C.binding.state.current;return{deadline,time:Q.cancelState.time,currentTime:s.time,sameState:s===Q.cancelState,zone:s.zone,mode:window.__HAPIL_MODES_V31346__?.mode(s),phase:C.binding.phase,hidden:document.hidden,visibility:document.visibilityState,blocked:C.binding.blocked?.(),modal:!!C.binding.modal?.current,story:window.__HAPIL_STORY_RC51__?.isOpen?.(),reading:window.__HAPIL_READING_V31342__?.blocked,orientation:window.__HAPIL_ORIENTATION_PAUSE_RC152__?.paused?.(),party:window.__HAPIL_PARTY_V31322__?.status,partyUI:window.__HAPIL_PARTY_UI_V31322__?.isOpen?.(),records:window.__HAPIL_RECORDS_V31365__?.isOpen?.(),paused:s.paused,practiceFinished:s.practicePatternV31365?.finished,encounterLockUntil:s.encounterLockUntil31226,oldTargetHP:Q.cancelTarget.hp,pending:s.pendingStrikes.map(h=>({id:h.id,at:h.at})),rows:Q.cancelRows.filter(r=>Q.cancelStrikeIds.includes(String(r.source?.id)))};},deadline)));throw error;}
  r.cancel.observed=await page.evaluate(()=>{const Q=window.__RC158_QA__;window.__HAPIL_FEEDBACK_RC128__=Q.cancelFeedback;return{time:Q.cancelState.time,oldTargetHP:Q.cancelTarget.hp,rows:Q.cancelRows.filter(r=>Q.cancelStrikeIds.includes(String(r.source?.id))) };});assert(r.cancel.observed.time>Math.max(...r.cancel.strikes.map(h=>h.at)),'native clock observed beyond canceled hit deadline');assert.equal(r.cancel.observed.oldTargetHP,r.cancel.before.hp);assert.equal(r.cancel.observed.rows.length,0,'old scheduled source never damages destination');assert.deepEqual(errors,[]);console.log('RC162_NATIVE_BLINK_BOUNDARIES',JSON.stringify(r));return r;
 }finally{await page.close();}
}
async function run(openProbe){
 const rows=[];
 for(let index=0;index<8;index++){
  const {page,errors}=await openProbe();try{
   const first=await setup(page,index);assert(Math.hypot(first.start.x-first.afterBlink.hero.x,first.start.y-first.afterBlink.hero.y)>1,'actual native blink separates attack origin/current position');
   await page.waitForFunction(()=>window.__RC158_QA__.blinkMelee.events.length>0,null,{timeout:6000});
   const r=await page.evaluate(()=>{const Q=window.__RC158_QA__,C=window.__HAPIL_CONTROLS_V31329__;window.__HAPIL_FEEDBACK_RC128__=Q.blinkFeedback;return{...Q.blinkMelee,basicAfter:C.binding.state.current.basicAttackCount??0};});
   assert.equal(r.beforeBlink.eventCount,0);assert.equal(r.beforeBlink.hp,r.initialTargetHP,'no damage before blink');assert.equal(r.afterBlink.hp,r.initialTargetHP,'blink does not inject damage');assert.equal(r.afterBlink.time,r.beforeBlink.time,'same synchronous native action interval before RAF damage');assert.equal(r.afterBlink.lastDodgeAt,r.afterBlink.time);assert(r.basicAfter>r.basicBefore);
   const e=r.events.find(e=>e.row.source.family==='actor'&&e.row.source.vx===null&&e.row.source.vy===null);assert(e,'actual actor strike hit required');const h=r.strikes.find(h=>String(h.id)===String(e.row.source.id));assert(h);assert.equal(e.target.id,h.targetId);assert.deepEqual(e.origin,h.shmupOriginV31365);assert.deepEqual(e.origin,r.start);assert(e.time>=h.at);assert(e.row.hpLoss>0);assert.equal(e.row.hpBefore-e.row.hpAfter,e.row.hpLoss);assert(e.cue);assert.deepEqual(e.cue.direction,{x:e.target.x-e.origin.x,y:e.target.y-e.origin.y});assert(Math.hypot(e.hero.x-e.origin.x,e.hero.y-e.origin.y)>1);
   const strokes=e.rotationCalls.filter(r=>/\/assets\/rc128\/combat-feedback\.js(?:\?[^:\n]*)?:/.test(r.stack));assert.equal(strokes.length,1,'one actual RC128 Persona contact stroke rotation');assert(Math.abs(Math.atan2(Math.sin(strokes[0].angle-e.expectedAngle),Math.cos(strokes[0].angle-e.expectedAngle)))<1e-9,'actual RC128 canvas rotation matches committed origin');assert(Math.abs(Math.atan2(Math.sin(e.expectedAngle-e.currentPositionAngle),Math.cos(e.expectedAngle-e.currentPositionAngle)))>.1,'current-position angle differs materially');
   for(let k=0;k<2;k++)if(r.requested[k])assert.equal(Math.sign(k?e.cue.direction.y:e.cue.direction.x),r.requested[k]);assert.deepEqual(errors,[]);rows.push(r);console.log('RC162_NATIVE_BLINK_MELEE',JSON.stringify(r));
  }catch(e){console.log('RC162_NATIVE_BLINK_FAILURE',JSON.stringify(await page.evaluate(()=>{const Q=window.__RC158_QA__,s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return{...Q.blinkMelee,current:{zone:s.zone,time:s.time,hp:s.hp,enemies:s.enemies.map(a=>({id:a.id,x:a.x,y:a.y,hp:a.hp,invulnerableUntil:a.invulnerableUntil})),pending:s.pendingStrikes,inner:s.innerFinalRC133,phase:window.__HAPIL_CONTROLS_V31329__.binding.phase}};})));throw e;}finally{await page.close();}
 }
 return{rows,boundaries:await boundaries(openProbe),staged:true,physicalDevice:false,method:'777 native boot; isolated native cult-death Persona entry, native solo roster/basic delayed pending strike + real blink before RAF HP damage; eight clear-floor geometry fixtures with arena enrollment and Persona lane enforcement/tracking disabled only on separate pages; native remembered input direction, player invulnerability30s, target recovery/stagger30s and boss shotDelay100 fixture support; actual hit validity/HP/feedback canvas renderer unchanged; separate native rest-map outward/inward wall blink and pending attack region-entry cancellation; no natural campaign claim'};
}
module.exports={run,boundaries};
