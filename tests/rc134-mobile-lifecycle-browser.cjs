'use strict';
// Native mobile orientation, dense fission combat, lifecycle and save/reload checks.
// Native Dream/dist04 roster and projectile producers; only player invulnerability
// and native attack readiness clocks are staged. No HP, projectile, or art edits.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright') : 'playwright');
const root = path.resolve(process.env.HAPIL_SOURCE_ROOT || path.join(__dirname, '..'));
const out = process.env.HAPIL_QA_OUTPUT || path.join(root, 'artifacts', 'rc134-mobile-lifecycle');
const lifecycleOnly = process.env.HAPIL_QA_LIFECYCLE_ONLY === '1';
const rotationOnly=process.env.HAPIL_QA_ROTATION_ONLY==='1';
fs.mkdirSync(out, { recursive: true });
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.mp3':'audio/mpeg','.ogg':'audio/ogg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server = http.createServer((req,res)=>{
  try {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url,'http://localhost').pathname));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404).end(); }
});
const report = { dirty:!!cp.execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(), commit: cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(), status:'running', browser:null,
  scope:rotationOnly?'Live native Dream trio, five alternating real CDP orientations at the unchanged 250ms checkpoint, CPU x4/DPR2; no stress, background, freeze or save claim. Staged unlock and native route entry.':lifecycleOnly?'Lifecycle-only follow-up: no stress window or readiness staging; mobile viewport orientation/background, CDP freeze/active, hidden-to-Story cleanup and native save/reload. Dream route is opened through the native UI.':'Staged native Dream dist04 trio pressure fixture; repeated orientation uses CDP setDeviceMetricsOverride with mobile screenOrientation, not Playwright viewport-only resizing; hidden scene is separately staged through stageV3128BossShowcase(cult04), forceDefeatCurrentBossR4, fight phase, both awakening timers, and player-only invulnerability. Mobile viewport orientation/background, hidden-to-Story cleanup and native save/reload. HP, projectile arrays, and source art are never edited.', profiles:[] };
const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
// Playwright 1.55.1 enables focus emulation on its own main-frame CDP session.
// That session's override keeps hidden/frozen pages visible; disabling it on a
// second public CDP session does not remove the original owner's override.
// Use the pinned in-process bridge only to undo this test-browser setting.
// Fail closed if the bridge changes. No DOM visibility/events or game clocks
// are fabricated, and the real freeze/resume assertions below remain strict.
function focusOwner(page){
 const impl=page._connection?.toImpl?.(page),delegate=impl?.delegate??impl?._delegate;
 const client=delegate?._mainFrameSession?._client;
 assert.equal(typeof client?.send,'function','pinned Playwright primary CDP session must be available');
 return client;
}
const snapshotScript = `
(() => {
 const s=window.__MONGSE_QA_STATE__, P=window.__HAPIL_PERSONA_DUEL_RC134__, H=window.__HAPIL_INNER_FINAL_RC133__;
 const living=(s?.enemies??[]).filter(a=>a?.midboss&&a.hp>0&&!a.visualOnly&&!a.friendly);
 const sourceIds=new Set(living.flatMap(a=>[a.id,a.combatOwnerIdRC69,a.templateId]).filter(Boolean));
 const admitted=(s?.hostileProjectiles??[]).filter(q=>q&&sourceIds.has(q.sourceId)&&Number.isFinite(q.damage)&&q.damage>0&&[q.x,q.y,q.vx,q.vy].every(Number.isFinite));
 const finite=(s?.hostileProjectiles??[]).filter(q=>q&&[q.x,q.y,q.vx,q.vy,q.damage].every(Number.isFinite));
 return {zone:s?.zone,mode:window.__HAPIL_MODES_V31346__?.mode?.(s)??s?.gameModeV31346,time:s?.time,hp:s?.hp,maxHp:s?.maxHp,
  midbosses:living.map(a=>({id:a.id,owner:a.combatOwnerIdRC69??a.templateId??a.id,identity:a.rc135FissionIdentity,sprite:a.sprite,hp:a.hp,maxHp:a.maxHp,readyAt:a.readyAt,patternReadyAt:a.patternReadyAt})),
  midbossCount:living.length,hostileProjectiles:s?.hostileProjectiles?.length??null,admittedMidbossProjectiles:admitted.length,finiteProjectiles:finite.length,
  projectileSources:[...new Set(finite.map(q=>q.sourceId))],nativeSourceIds:living.map(a=>a.id),
  hiddenActive:P?.active(s)??false,hiddenMood:H?.mood(s)??null,canvas:(()=>{const c=document.querySelector('.game-stage canvas'),r=c?.getBoundingClientRect();return c&&r?{backing:[c.width,c.height],css:{x:r.x,y:r.y,width:r.width,height:r.height},dpr:devicePixelRatio}:null})(),
  document:{visibilityState:document.visibilityState,hidden:document.hidden},
  binding:{phase:window.__HAPIL_CONTROLS_V31329__?.binding?.phase,blocked:window.__HAPIL_CONTROLS_V31329__?.localInputBlocked?.()},
  story:!!document.querySelector('#hapil-story-rc51'),gameOver:!!(s?.gameOver||s?.finished)};
})()`;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try {
  browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  report.browser={version:browser.version(),executable:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium'};
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage(), row={viewport:'portrait-first 390x844',errors:[],httpErrors:[],status:'running',scenario:{kind:lifecycleOnly?'native Dream dist04 route opened for lifecycle checks; no projectile stress sample':'native Dream dist04 midboss trio entered through RC69 native route; manual player controls; player-only invulnerability; no HP edits and no injected projectiles',hiddenScene:'QA stageV3128BossShowcase(cult04) + forceDefeatCurrentBossR4, then staged fight phase, boss awakening timer, Samong timer, and player-only invulnerability; not natural progression',projectileThresholdForDense:24,progressStaging:null}};
  report.profiles.push(row); save();
  page.on('pageerror',e=>row.errors.push(String(e.stack||e.message)));
  page.on('response',r=>{if(r.status()>=400)row.httpErrors.push({status:r.status(),url:r.url()});});
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.addInitScript(()=>{let x=0x134;Math.random=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};const m=window.__MIDBOSS_PRESSURE_TIMING__={raf:[],longTasks:[],recording:false,lastRaf:null};const frame=t=>{if(m.recording&&m.lastRaf!==null)m.raf.push(t-m.lastRaf);m.lastRaf=t;requestAnimationFrame(frame);};requestAnimationFrame(frame);if(PerformanceObserver.supportedEntryTypes.includes('longtask'))new PerformanceObserver(list=>{if(m.recording)m.longTasks.push(...list.getEntries().map(e=>e.duration));}).observe({type:'longtask'});});
  await page.addInitScript(()=>{window.__RC134_LIFECYCLE_EVENTS__=[];for(const name of ['freeze','resume'])document.addEventListener(name,event=>window.__RC134_LIFECYCLE_EVENTS__.push({name,trusted:event.isTrusted,hidden:document.hidden,time:window.__MONGSE_QA_STATE__?.time,heldKeys:[...(window.__HAPIL_CONTROLS_V31329__?.binding?.input?.current??[])],at:performance.now()}),true);});
  await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
  await page.waitForFunction(()=>window.__HAPIL_RC133_NATIVE__?.installed&&window.__HAPIL_RC69__?.installed&&window.__HAPIL_MEDIA_ART_RC133__?.ready,null,{timeout:60000});
  await page.keyboard.press('Escape');
  await page.evaluate(()=>window.__HAPIL_SAMONG_RC91__.unlock(null,'777'));
  await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
  await page.locator('[data-game-mode-v31354="DREAM"]').click();
  await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
  await page.waitForFunction(()=>window.__MONGSE_QA_STATE__&&window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game');
  for(let i=0;i<24&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(80);}
  row.launch=await page.evaluate(()=>({zone:window.__MONGSE_QA_STATE__?.zone,mode:window.__HAPIL_MODES_V31346__?.mode?.(window.__MONGSE_QA_STATE__)??window.__MONGSE_QA_STATE__?.gameModeV31346,state:!!window.__MONGSE_QA_STATE__}));
  row.nativeEntry=await page.evaluate(lifecycleOnly=>{
   const s=window.__MONGSE_QA_STATE__,C=window.__HAPIL_CONTROLS_V31329__;
   C.setMode('manual');
   const route=window.__HAPIL_RC69__.enter(s,'dist04');
   const live=s.enemies.filter(a=>a?.midboss&&a.hp>0&&!a.visualOnly&&!a.friendly);
   // Staged safety fixture: keep the real player's HP unchanged while combat timers progress.
   s.invulnerableUntil=s.time+120;
   window.__MIDBOSS_PRESSURE_QA__={samples:[],max:0,maxAt:null,sourcePeak:{},startedAt:performance.now(),startTime:s.time};window.__MIDBOSS_PRESSURE_TIMING__.recording=!lifecycleOnly;
   const q=window.__MIDBOSS_PRESSURE_QA__;
   const sample=()=>{const state=window.__MONGSE_QA_STATE__;if(state){const count=state.hostileProjectiles?.length??0,record={wallMs:performance.now()-q.startedAt,time:state.time,count,midbossCount:state.enemies.filter(a=>a?.midboss&&a.hp>0&&!a.visualOnly&&!a.friendly).length};q.samples.push(record);if(count>q.max){q.max=count;q.maxAt=record;}for(const id of live.map(a=>a.id))q.sourcePeak[id]=Math.max(q.sourcePeak[id]||0,(state.hostileProjectiles??[]).filter(p=>p.sourceId===id).length);if(q.samples.length>2000)q.samples.splice(0,1000);}requestAnimationFrame(sample);};requestAnimationFrame(sample);
   return {route,midbosses:live.map(a=>({id:a.id,owner:a.combatOwnerIdRC69??a.templateId??a.id,hp:a.hp,maxHp:a.maxHp,readyAt:a.readyAt,patternReadyAt:a.patternReadyAt})),mode:C.effective(),playerHp:s.hp,playerMaxHp:s.maxHp,time:s.time};
  },lifecycleOnly);
  save();
  if(row.nativeEntry.midbosses.length!==3) throw Error('native dist04 Dream route did not yield exactly three live midbosses: '+JSON.stringify(row.nativeEntry));
  if(lifecycleOnly){
   row.naturalPhase={label:'skipped in lifecycle-only run; no pressure claim'};row.pressureSnapshot=null;row.naturalSnapshot=null;
   row.pressureTiming={status:'not-collected'};row.pressurePeak={status:'not-collected'};row.denseThresholdReached=null;
  } else {
   row.naturalPhase={label:'native route readiness, no readiness edits',startedAt:row.nativeEntry.time,wallSeconds:20};
   await page.waitForTimeout(20000);
   row.naturalSnapshot=await page.evaluate(code=>eval(code),snapshotScript);
   row.naturalPeak=await page.evaluate(()=>({max:window.__MIDBOSS_PRESSURE_QA__?.max,maxAt:window.__MIDBOSS_PRESSURE_QA__?.maxAt,sourcePeak:window.__MIDBOSS_PRESSURE_QA__?.sourcePeak,samples:window.__MIDBOSS_PRESSURE_QA__?.samples?.length,startTime:window.__MIDBOSS_PRESSURE_QA__?.startTime}));
   if(row.naturalPeak.max<24){
    row.scenario.progressStaging='After the 20s native-route sample, readiness timers only were moved to within 0.05 game seconds for the three already-live native midbosses. Actor HP, player HP, hostile projectile arrays, source art and attacks were not edited; all subsequent attacks/projectile admissions ran through native frames.';
    await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;for(const a of s.enemies.filter(a=>a?.midboss&&a.hp>0&&!a.visualOnly&&!a.friendly)){a.readyAt=s.time+.05;a.patternReadyAt=s.time+.05;if(Number.isFinite(a.attackAt))a.attackAt=0;if(Number.isFinite(a.attackStarted))a.attackStarted=0;if(Number.isFinite(a.attackImpactAt))a.attackImpactAt=0;a.recoverUntil=s.time;a.phaseTransitionUntil=0;} });
    await page.waitForTimeout(25000);
   }
   row.pressureSnapshot=await page.evaluate(code=>eval(code),snapshotScript);row.pressureTiming=await page.evaluate(()=>{const m=window.__MIDBOSS_PRESSURE_TIMING__;m.recording=false;const report=v=>{const a=[...v].sort((x,y)=>x-y),q=p=>a.length?a[Math.min(a.length-1,Math.floor(a.length*p))]:null;return{count:a.length,p50Ms:q(.5),p95Ms:q(.95),maxMs:q(1),over50:a.filter(x=>x>50).length,over100:a.filter(x=>x>100).length,over250:a.filter(x=>x>250).length};};return{rafIntervals:report(m.raf),longTasks:report(m.longTasks)};});
   row.pressurePeak=await page.evaluate(()=>({max:window.__MIDBOSS_PRESSURE_QA__?.max,maxAt:window.__MIDBOSS_PRESSURE_QA__?.maxAt,sourcePeak:window.__MIDBOSS_PRESSURE_QA__?.sourcePeak,samples:window.__MIDBOSS_PRESSURE_QA__?.samples?.length,startTime:window.__MIDBOSS_PRESSURE_QA__?.startTime}));
   row.denseThresholdReached=row.pressurePeak.max>=24;
  }
  row.errorsAtPressure=row.errors.length;row.httpErrorsAtPressure=row.httpErrors.length;
  await page.screenshot({path:path.join(out,'dist04-native-trio-pressure-portrait.png'),fullPage:false});save();
  if(!lifecycleOnly)console.log('RC134_MIDBOSS_PRESSURE',JSON.stringify({commit:report.commit,entry:row.nativeEntry,peak:row.pressurePeak,timing:row.pressureTiming,denseThresholdReached:row.denseThresholdReached,errors:row.errors.length,httpErrors:row.httpErrors.length}));

  // Resize/orientation in the same live scenario, alternating repeatedly.
  row.orientation=[];
  for(const [i,size] of [[1,[844,390]],[2,[390,844]],[3,[844,390]],[4,[390,844]],[5,[844,390]]]){
   const landscape=size[0]>size[1];await cdp.send('Emulation.setDeviceMetricsOverride',{width:size[0],height:size[1],deviceScaleFactor:2,mobile:true,screenOrientation:{angle:landscape?90:0,type:landscape?'landscapePrimary':'portraitPrimary'}});await page.waitForTimeout(250);
   const state=await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,c=document.querySelector('.game-stage canvas'),r=c?.getBoundingClientRect(),P=window.__HAPIL_PERSONA_DUEL_RC134__;return{viewport:[innerWidth,innerHeight],screen:{width:screen.width,height:screen.height,orientation:screen.orientation?.type??null,angle:screen.orientation?.angle??null,visualViewport:[visualViewport.width,visualViewport.height]},canvas:r?{x:r.x,y:r.y,width:r.width,height:r.height,backing:[c.width,c.height]}:null,camera:P?.camera(s,{x:0,y:0,width:innerWidth,height:innerHeight})??null,midbosses:s?.enemies?.filter(a=>a.midboss&&a.hp>0&&!a.visualOnly&&!a.friendly).length,projectiles:s?.hostileProjectiles?.length,time:s?.time,inBounds:!!r&&r.x>=-1&&r.y>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1};});
   row.orientation.push({iteration:i,size,state,retainedThreeMidbosses:state.midbosses===3,layoutMatchesViewport:state.inBounds});
  }
  row.orientationSummary={allLayoutsContained:row.orientation.every(x=>x.layoutMatchesViewport),allThreeActorsRetained:row.orientation.every(x=>x.retainedThreeMidbosses),mismatches:row.orientation.filter(x=>!x.layoutMatchesViewport).map(x=>({iteration:x.iteration,size:x.size,viewport:x.state.viewport,screen:x.state.screen,canvas:x.state.canvas}))};
  await page.screenshot({path:path.join(out,'dist04-native-trio-pressure-landscape.png'),fullPage:false});
  save();

  if(rotationOnly){
   assert.equal(row.orientationSummary.allLayoutsContained,true,'all five live rotations fit at the original 250ms checkpoint');
   assert.equal(row.orientationSummary.allThreeActorsRetained,true);
   for(const entry of row.orientation){assert(Math.abs(entry.state.canvas.width-entry.size[0])<1,'canvas uses current width');assert(Math.abs(entry.state.canvas.y+entry.state.canvas.height-entry.size[1])<1,'canvas ends at current viewport bottom');}
   assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);row.status='passed-rotation-only';report.status='passed-rotation-only';save();console.log('PASS RC135 live CDP rotation',JSON.stringify(row.orientationSummary));await context.close();return;
  }
  // Real tab background/return: a second page becomes foreground, then the game page returns.
  const focusClient=focusOwner(page);await focusClient.send('Emulation.setFocusEmulationEnabled',{enabled:false});
  row.lifecycleHarness={focusOverride:'disabled on the owning Playwright main-frame CDP session',visibilityOverride:false,syntheticEvents:false,clockEdits:false};
  await page.keyboard.down('ArrowRight');
  row.backgroundHeldBefore=await page.evaluate(()=>[...(window.__HAPIL_CONTROLS_V31329__?.binding?.input?.current??[])]);
  row.visibility=await page.evaluate(()=>{window.__RC134_VISIBILITY_EVENTS__=[];document.addEventListener('visibilitychange',()=>window.__RC134_VISIBILITY_EVENTS__.push({state:document.visibilityState,hidden:document.hidden,at:performance.now()}));const s=window.__MONGSE_QA_STATE__;return{beforeState:document.visibilityState,beforeTime:s?.time};});
  const background=await context.newPage();await background.goto('about:blank');await background.bringToFront();
  try{await page.waitForFunction(()=>document.visibilityState==='hidden',null,{timeout:5000});row.visibility.hiddenObserved=await page.evaluate(()=>({state:document.visibilityState,hidden:document.hidden,time:window.__MONGSE_QA_STATE__?.time,events:window.__RC134_VISIBILITY_EVENTS__}));}
  catch(error){row.visibility.hiddenObserved={error:String(error),state:await page.evaluate(()=>document.visibilityState),events:await page.evaluate(()=>window.__RC134_VISIBILITY_EVENTS__)};}
  await background.close();await page.bringToFront();await page.waitForFunction(()=>document.visibilityState==='visible',null,{timeout:5000});await page.waitForTimeout(500);
  row.visibility.returned=await page.evaluate(()=>({state:document.visibilityState,hidden:document.hidden,time:window.__MONGSE_QA_STATE__?.time,events:window.__RC134_VISIBILITY_EVENTS__}));
  row.visibility.nativeTimeAdvanced=row.visibility.returned.time>row.visibility.beforeTime;
  row.lifecycleControl={status:'unsupported',beforeTime:row.visibility.returned.time,afterTime:null};
  try{const lifecycleCdp=await context.newCDPSession(page);await lifecycleCdp.send('Page.enable');const frozenAt=Date.now();await lifecycleCdp.send('Page.setWebLifecycleState',{state:'frozen'});await new Promise(resolve=>setTimeout(resolve,1200));await lifecycleCdp.send('Page.setWebLifecycleState',{state:'active'});await page.bringToFront();await focusClient.send('Emulation.setFocusEmulationEnabled',{enabled:true});await page.waitForTimeout(500);const events=await page.evaluate(()=>window.__RC134_LIFECYCLE_EVENTS__),freeze=events.find(e=>e.name==='freeze'),resume=events.find(e=>e.name==='resume');row.lifecycleControl={status:freeze&&resume?'observed':'unobserved',events,frozenStart:freeze?.time??null,frozenEnd:resume?.time??null,wallFrozenMs:Date.now()-frozenAt,beforeTime:row.visibility.returned.time,afterTime:await page.evaluate(()=>window.__MONGSE_QA_STATE__?.time),heldKeys:await page.evaluate(()=>[...(window.__HAPIL_CONTROLS_V31329__?.binding?.input?.current??[])])};}catch(error){row.lifecycleControl={status:'unsupported',reason:String(error),beforeTime:row.visibility.returned.time};}

  // Native hidden fight camera/mood entry, then return to Story and verify ownership/filter cleanup.
  row.hiddenExit=await page.evaluate(()=>{
   const s=window.__MONGSE_QA_STATE__,mode=window.__HAPIL_MODES_V31346__,P=window.__HAPIL_PERSONA_DUEL_RC134__,H=window.__HAPIL_INNER_FINAL_RC133__,Q=window.__MONGSE_QA_API__;
   mode.set('DREAM',s);Q.stageV3128BossShowcase('cult04');s.innerFinalRC133=null;const defeated=Q.forceDefeatCurrentBossR4();
   s.innerFinalRC133.intro=0;s.innerFinalRC133.phase='fight';s.innerFinalRC133.awakeningCooldown=9999;s.invulnerableUntil=s.time+120;
   const boss=H.boss(s);s.innerFinalRC133.awake=120;s.samongPassiveRC91={active:120,cooldown:1000,duration:7,heroId:s.activeHeroId};
   const hidden={defeated,phase:s.innerFinalRC133.phase,active:P.active(s),camera:P.camera(s,{x:0,y:0,width:innerWidth,height:innerHeight}),mood:H.mood(s),bossId:boss?.id,duelStats:P.metrics(),gameCanvas:document.querySelector('.game-stage canvas')?.getBoundingClientRect().toJSON()};
   mode.set('STORY',s);P.enforce(s);
   const c=document.createElement('canvas');c.width=64;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#234567';ctx.fillRect(0,0,64,64);const before=[...ctx.getImageData(12,12,1,1).data],filterBefore='sepia(0.3)';ctx.filter=filterBefore;ctx.globalAlpha=.5;const applied=H.compose(ctx,s,c),after=[...ctx.getImageData(12,12,1,1).data];
   return{hidden,story:{mode:mode.mode(s)??s.gameModeV31346,duelActive:P.active(s),mood:H.mood(s),composeApplied:applied,filterBefore,filterAfter:ctx.filter,globalAlphaBefore:.5,globalAlphaAfter:ctx.globalAlpha,pixelBefore:before,pixelAfter:after,positionDescriptor:Object.getOwnPropertyDescriptor(s,'x'),duelStats:P.metrics(),encounter:H.encounter(s)}};
  });
  await page.waitForTimeout(200);row.hiddenExit.canvasAfter=await page.evaluate(()=>{const c=document.querySelector('.game-stage canvas'),r=c?.getBoundingClientRect();return r?{rect:r.toJSON(),size:[c.width,c.height]}:null;});
  await page.screenshot({path:path.join(out,'hidden-to-story-cleanup.png'),fullPage:false});
  row.hiddenExit.storyOverlay=await page.locator('#hapil-story-rc51').count();

  // Native trio save then full reload and UI load from saved record.
  // Return to the real Dream dist04 route and explicitly save slot 1 through settings.
  row.nativeSave=await page.evaluate(()=>{
   const s=window.__MONGSE_QA_STATE__,mode=window.__HAPIL_MODES_V31346__;
   mode.set('DREAM',s);const route=window.__HAPIL_RC69__.enter(s,'dist04');
   s.invulnerableUntil=s.time+120;
   const live=s.enemies.filter(a=>a.midboss&&a.hp>0&&!a.visualOnly&&!a.friendly);
   return{route,zone:s.zone,mode:mode.mode(s)??s.gameModeV31346,time:s.time,hero:s.activeHeroId,midbosses:live.map(a=>({id:a.id,hp:a.hp,maxHp:a.maxHp,triad:a.isMidbossTrioRC69})),playerHp:s.hp};
  });
  await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist04'&&window.__MONGSE_QA_STATE__?.enemies.filter(a=>a.midboss&&a.hp>0&&!a.visualOnly&&!a.friendly).length===3,null,{timeout:10000});
  for(let i=0;i<24&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(80);}
  const menuLocator=page.locator('.rc108-settings-trigger');const mobileMenu=page.locator('#hapil-mobile-controls-v31366 [data-mobile-action="Menu"]');
  if(!await menuLocator.isVisible().catch(()=>false))await mobileMenu.click({force:true});else await menuLocator.click({force:true});await page.locator('.settings-layout').waitFor({state:'visible',timeout:8000});
  await page.locator('.settings-layout').getByRole('button',{name:'저장 · 불러오기',exact:true}).click();await page.locator('.save-slots').waitFor({state:'visible',timeout:8000});
  await page.locator('.save-slots article').nth(0).getByRole('button',{name:'저장',exact:true}).click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('mongse_save_v10_slot_1')||'null')!==null,null,{timeout:8000});
  row.nativeSave.slot=await page.evaluate(()=>{const save=JSON.parse(localStorage.getItem('mongse_save_v10_slot_1'));return{zone:save.zone,heroId:save.heroId,savedAt:save.savedAt,midbossTrio:save.midbossTrioRosterRC69?.map(a=>({id:a.id,hp:a.hp,maxHp:a.maxHp,owner:a.owner}))??null,midbossEncounter:save.midbossEncounterRC133??null};});
  row.nativeSave.slotSaved=row.nativeSave.slot.zone==='dist04'&&row.nativeSave.slot.midbossTrio?.length===3;
  save();await page.reload({waitUntil:'load'});await page.waitForTimeout(350);row.nativeSave.titleAfterReload=await page.locator('.title-screen').count();
  // Start a fresh Dream run, then load slot 1 by the in-game native UI.
  await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('[data-game-mode-v31354="DREAM"]').click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__&&window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game');
  for(let i=0;i<24&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(80);}
  const menuLocator2=page.locator('.rc108-settings-trigger');const mobileMenu2=page.locator('#hapil-mobile-controls-v31366 [data-mobile-action="Menu"]');
  if(!await menuLocator2.isVisible().catch(()=>false))await mobileMenu2.click({force:true});else await menuLocator2.click({force:true});await page.locator('.settings-layout').waitFor({state:'visible',timeout:8000});
  await page.locator('.settings-layout').getByRole('button',{name:'저장 · 불러오기',exact:true}).click();await page.locator('.save-slots').waitFor({state:'visible',timeout:8000});
  await page.locator('.save-slots article').nth(0).getByRole('button',{name:'불러오기',exact:true}).click();
  await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist04',null,{timeout:15000});
  row.nativeSave.restored=await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;return{zone:s.zone,time:s.time,mode:window.__HAPIL_MODES_V31346__.mode(s)??s.gameModeV31346,playerHp:s.hp,actors:s.enemies.filter(a=>a.midboss&&a.hp>0&&!a.visualOnly&&!a.friendly).map(a=>({id:a.id,hp:a.hp,maxHp:a.maxHp,triad:a.isMidbossTrioRC69})),innerMode:window.__HAPIL_PERSONA_DUEL_RC134__?.active(s)??false};});
  row.nativeSave.restoreMatches=row.nativeSave.restored.actors.length===3&&row.nativeSave.restored.actors.map(a=>a.id).sort().join('|')===row.nativeSave.midbosses.map(a=>a.id).sort().join('|');
  row.final=await page.evaluate(code=>eval(code),snapshotScript);
  row.status=lifecycleOnly?'completed-lifecycle-only':row.denseThresholdReached?'completed-density-reached':'completed-density-shortfall';row.errorsAtEnd=row.errors.length;row.httpErrorsAtEnd=row.httpErrors.length;
  await page.screenshot({path:path.join(out,'native-save-reloaded-dist04.png'),fullPage:false});
  save();
  console.log('RC134_LIVE_MOBILE_QUALITY',JSON.stringify({commit:report.commit,lifecycleOnly,denseThresholdReached:row.denseThresholdReached,peak:row.pressurePeak,midbosses:row.final.midbosses.length,orientation:row.orientation.map(x=>({size:x.size,canvas:x.state.canvas,camera:x.state.camera,layoutMatchesViewport:x.layoutMatchesViewport,retainedThreeMidbosses:x.retainedThreeMidbosses})),orientationSummary:row.orientationSummary,visibility:{hidden:row.visibility.hiddenObserved?.state,returned:row.visibility.returned?.state,timeAdvanced:row.visibility.nativeTimeAdvanced,lifecycleControl:row.lifecycleControl},hiddenExit:row.hiddenExit.story,nativeSave:{slotSaved:row.nativeSave.slotSaved,restored:row.nativeSave.restored?.actors?.length,matches:row.nativeSave.restoreMatches},errors:row.errors.length,httpErrors:row.httpErrors.length}));
  assert.equal(row.nativeEntry.midbosses.length,3,'native Dream route should start 3 midbosses');
  assert.equal(row.orientationSummary.allLayoutsContained,true,'battlefield must fit each live CDP orientation at the original 250ms checkpoint');
  assert.equal(row.orientationSummary.allThreeActorsRetained,true,'orientation retains all three live native actors');
  for(const entry of row.orientation){assert(Math.abs(entry.state.canvas.width-entry.size[0])<1,'canvas must use the new orientation width');assert(Math.abs(entry.state.canvas.y+entry.state.canvas.height-entry.size[1])<1,'canvas must meet the new viewport bottom');}
  if(!lifecycleOnly)assert.equal(row.denseThresholdReached,true,'dense fixture requires at least 24 actual native projectiles');
  assert.equal(row.lifecycleControl.status,'observed','accepted CDP command is insufficient: real freeze and resume events must be observed');
  assert.equal(row.visibility.hiddenObserved.state,'hidden','real background visibility must be observed');
  assert(row.backgroundHeldBefore.includes('ArrowRight'),'trusted input is held before backgrounding');
  assert(row.lifecycleControl.events.every(e=>e.trusted),'freeze and resume events must come from Chromium');
  assert(row.lifecycleControl.events.every(e=>e.hidden),'freeze and resume occur while actually hidden');
  assert.equal(row.lifecycleControl.frozenEnd,row.lifecycleControl.frozenStart,'native simulation stays paused throughout the actual freeze');
  assert(row.lifecycleControl.afterTime>row.lifecycleControl.beforeTime,'native simulation resumes after thaw');
  assert.deepEqual(row.lifecycleControl.heldKeys,[],'thaw leaves no held input');
  assert.equal(row.final.mode,'DREAM');
  assert.equal(new Set(row.final.midbosses.map(a=>a.id)).size,3,'three restored actors have independent instance IDs');
  assert.equal(new Set(row.final.midbosses.map(a=>a.identity)).size,1,'restored copies share authored map identity');
  assert.equal(new Set(row.final.midbosses.map(a=>a.sprite)).size,1,'restored copies share authored map sprite');
  assert.equal(row.hiddenExit.hidden.active,true,'hidden camera should be active before Story cleanup');
  assert.equal(row.hiddenExit.story.duelActive,false,'Story must release Persona ownership');
  assert.equal(row.hiddenExit.story.composeApplied,false,'Story must leave opposition compose inactive');assert.equal(row.hiddenExit.story.filterAfter,row.hiddenExit.story.filterBefore,'Story no-op preserves caller filter');assert.equal(row.hiddenExit.story.globalAlphaAfter,row.hiddenExit.story.globalAlphaBefore,'Story no-op preserves caller alpha');
  assert.deepEqual(row.hiddenExit.story.pixelAfter,row.hiddenExit.story.pixelBefore,'Story frame unchanged by hidden composer');
  assert.equal(row.hiddenExit.story.positionDescriptor.get,undefined,'Story releases guarded player coordinates');
  assert.equal(row.nativeSave.slotSaved,true,'native slot save must contain the three midbosses');
  assert.equal(row.nativeSave.restoreMatches,true,'native UI reload restores same three midboss identities');
  assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);
  report.status=lifecycleOnly?'passed-lifecycle-only':row.denseThresholdReached?'passed':'passed-with-density-shortfall';save();await context.close();
 } catch(error){report.status='failed';report.error=String(error.stack||error);save();throw error;}
 finally{await browser?.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
