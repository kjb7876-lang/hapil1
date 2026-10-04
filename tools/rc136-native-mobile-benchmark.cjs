'use strict';
// Controlled native Dream/dist04 mobile combat fixture, not natural campaign progression.
// Unlock/native route selection are staged; health, protection, readiness, damage,
// projectiles, simulation clocks and render resolution remain native. One browser only.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright') : 'playwright');
const root = path.resolve(process.env.HAPIL_SOURCE_ROOT || path.join(__dirname, '..'));
const out = process.env.HAPIL_QA_OUTPUT || '/tmp/rc136-native-mobile-benchmark';
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
  scope:'Controlled native Dream/dist04 route fixture; CPU x4, DPR2, phone 390x844, fixed random seed. No health, protection, attack-readiness, projectile, damage, simulation-clock or resolution edits. Read-only RAF/longtask and render/simulation measurements; not a campaign or physical-device result.', profiles:[] };
const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
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
  const page=await context.newPage(), row={viewport:'portrait-first 390x844',errors:[],httpErrors:[],status:'running',scenario:{kind:'native Dream dist04 trio entered through RC69 route; manual controls; unmodified health, protection, readiness and producers',projectileThresholdForDense:24,progressStaging:null}};
  report.profiles.push(row); save();
  page.on('pageerror',e=>row.errors.push(String(e.stack||e.message)));
  page.on('response',r=>{if(r.status()>=400)row.httpErrors.push({status:r.status(),url:r.url()});});
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.addInitScript(()=>{let x=0x134;Math.random=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};const m=window.__MIDBOSS_PRESSURE_TIMING__={raf:[],longTasks:[],recording:false,lastRaf:null};const frame=t=>{if(m.recording&&m.lastRaf!==null)m.raf.push(t-m.lastRaf);m.lastRaf=t;requestAnimationFrame(frame);};requestAnimationFrame(frame);if(PerformanceObserver.supportedEntryTypes.includes('longtask'))new PerformanceObserver(list=>{if(m.recording)m.longTasks.push(...list.getEntries().map(e=>e.duration));}).observe({type:'longtask'});});
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
  row.nativeEntry=await page.evaluate(()=>{
   const s=window.__MONGSE_QA_STATE__,C=window.__HAPIL_CONTROLS_V31329__;
   C.setMode('manual');
   const route=window.__HAPIL_RC69__.enter(s,'dist04');
   const live=s.enemies.filter(a=>a?.midboss&&a.hp>0&&!a.visualOnly&&!a.friendly);
   // Native health/protection/readiness are read only.
   window.__MIDBOSS_PRESSURE_QA__={samples:[],max:0,maxAt:null,sourcePeak:{},startedAt:performance.now(),startTime:s.time};window.__MIDBOSS_PRESSURE_TIMING__.recording=true;
   const q=window.__MIDBOSS_PRESSURE_QA__;
   const sample=()=>{const state=window.__MONGSE_QA_STATE__;if(state){const count=state.hostileProjectiles?.length??0,record={wallMs:performance.now()-q.startedAt,time:state.time,count,midbossCount:state.enemies.filter(a=>a?.midboss&&a.hp>0&&!a.visualOnly&&!a.friendly).length};q.samples.push(record);if(count>q.max){q.max=count;q.maxAt=record;}for(const id of live.map(a=>a.id))q.sourcePeak[id]=Math.max(q.sourcePeak[id]||0,(state.hostileProjectiles??[]).filter(p=>p.sourceId===id).length);if(q.samples.length>2000)q.samples.splice(0,1000);}requestAnimationFrame(sample);};requestAnimationFrame(sample);
   return {route,midbosses:live.map(a=>({id:a.id,owner:a.combatOwnerIdRC69??a.templateId??a.id,hp:a.hp,maxHp:a.maxHp,readyAt:a.readyAt,patternReadyAt:a.patternReadyAt})),mode:C.effective(),playerHp:s.hp,playerMaxHp:s.maxHp,time:s.time};
  });
  await page.evaluate(()=>{
   const p=window.__RC136_OPERATIONS__={recording:true,render:[],simulation:[],lastFrameStart:null};
   const control=window.__HAPIL_CONTROLS_V31329__,start=control.frameStart;control.frameStart=function(...a){p.lastFrameStart=performance.now();return Reflect.apply(start,this,a);};
   const bridge=window.__HAPIL_RC86_BRIDGE__,render=bridge.renderFrame;let depth=0;bridge.renderFrame=function(...a){const t=performance.now(),top=depth++===0;if(top&&p.lastFrameStart!==null)p.simulation.push(t-p.lastFrameStart);try{return Reflect.apply(render,this,a);}finally{depth--;if(top)p.render.push(performance.now()-t);}};
  });
  save();
  if(row.nativeEntry.midbosses.length!==3) throw Error('native dist04 Dream route did not yield exactly three live midbosses: '+JSON.stringify(row.nativeEntry));
   row.naturalPhase={label:'native route readiness, no readiness edits',startedAt:row.nativeEntry.time,nativeElapsedSeconds:8.8};
   await page.waitForFunction(()=>{const s=window.__MONGSE_QA_STATE__;return s.time-window.__MIDBOSS_PRESSURE_QA__.startTime>=8.8||s.hp<=0||s.gameOver;},null,{timeout:120000,polling:100});
   row.naturalSnapshot=await page.evaluate(code=>eval(code),snapshotScript);
   row.naturalPeak=await page.evaluate(()=>({max:window.__MIDBOSS_PRESSURE_QA__?.max,maxAt:window.__MIDBOSS_PRESSURE_QA__?.maxAt,sourcePeak:window.__MIDBOSS_PRESSURE_QA__?.sourcePeak,samples:window.__MIDBOSS_PRESSURE_QA__?.samples?.length,startTime:window.__MIDBOSS_PRESSURE_QA__?.startTime}));
   row.scenario.progressStaging='none: native readiness, HP, protection and projectile producers are unchanged';
   row.pressureSnapshot=await page.evaluate(code=>eval(code),snapshotScript);row.pressureTiming=await page.evaluate(()=>{const m=window.__MIDBOSS_PRESSURE_TIMING__;m.recording=false;const report=v=>{const a=[...v].sort((x,y)=>x-y),q=p=>a.length?a[Math.min(a.length-1,Math.floor(a.length*p))]:null;return{count:a.length,p50Ms:q(.5),p95Ms:q(.95),maxMs:q(1),over50:a.filter(x=>x>50).length,over100:a.filter(x=>x>100).length,over250:a.filter(x=>x>250).length};};return{rafIntervals:report(m.raf),longTasks:report(m.longTasks)};});
   row.pressurePeak=await page.evaluate(()=>({max:window.__MIDBOSS_PRESSURE_QA__?.max,maxAt:window.__MIDBOSS_PRESSURE_QA__?.maxAt,sourcePeak:window.__MIDBOSS_PRESSURE_QA__?.sourcePeak,samples:window.__MIDBOSS_PRESSURE_QA__?.samples?.length,startTime:window.__MIDBOSS_PRESSURE_QA__?.startTime}));
   row.denseThresholdReached=row.pressurePeak.max>=24;

  row.operations=await page.evaluate(()=>{const p=window.__RC136_OPERATIONS__;p.recording=false;const stat=v=>{const a=[...v].sort((x,y)=>x-y),q=n=>a.length?a[Math.min(a.length-1,Math.floor(a.length*n))]:null;return{count:a.length,p50:q(.5),p95:q(.95),max:q(1)};};return{render:stat(p.render),simulation:stat(p.simulation)};});
  row.errorsAtPressure=row.errors.length;row.httpErrorsAtPressure=row.httpErrors.length;
  await page.screenshot({path:path.join(out,'dist04-native-trio-pressure-portrait.png'),fullPage:false});save();
  assert.equal(row.pressureSnapshot.midbossCount,3);assert(row.pressureSnapshot.hp>0,'player survived through native damage/healing');assert.equal(row.pressureSnapshot.gameOver,false);assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);assert(row.pressurePeak.max>=24,'same native dense projectile threshold');report.status='passed-native-benchmark';row.status=report.status;report.peakReachedWallMs=row.pressurePeak.maxAt?.wallMs;save();console.log('RC136_BENCHMARK',JSON.stringify({commit:report.commit,peak:row.pressurePeak.max,raf:row.pressureTiming.rafIntervals,render:row.operations.render,simulation:row.operations.simulation}));await context.close();return;
 } catch(error){report.status='failed';report.error=String(error.stack||error);save();throw error;}
 finally{await browser?.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
