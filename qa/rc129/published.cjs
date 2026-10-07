'use strict';
// Read-only public-service verification. No route interception, fixture state,
// HP edits, forced victory, progress injection or suppression of HTTP failures.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));
const root=path.resolve(__dirname,'../..'),base=process.env.HAPIL_TEST_BASE||'https://kjb7876-lang.github.io/hapil1/';
const out=process.env.HAPIL_QA_OUTPUT||path.join(process.env.RUNNER_TEMP||path.join(root,'qa-results'),'rc129-results','public');fs.mkdirSync(out,{recursive:true});
const files=['index.html','assets/index-v31526.js','assets/rc126/finite-native.js','assets/rc126/combat-safety.js','assets/rc108/laser-topology.js','assets/rc95/combat-flow.js','assets/combat-v31402/projectile-pipeline.js','assets/combat-v31402/contact-geometry.js','assets/rc43/bloodied-flight.js','assets/rc77/connected-laser.js','assets/rc124/laser-overrun.js','assets/rc125/adaptive-battlefield.js','assets/rc125/adaptive-battlefield.css','assets/rc127/combat-policy.js','assets/rc127/dark-jelly.js','assets/combat-v31412/skill-completion.js','assets/rc128/awakening-policy.js','assets/rc128/combat-feedback.js','assets/rc91/samong-awakening.js','assets/combat-v31402/combat-core.js','assets/rc23/feedback.js','assets/rc129/danmaku-director.js','assets/rc129/danmaku-hud.js'];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
 const report={base,testedCommit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),status:'running',readiness:[],files:[],screens:[],scope:'Read-only public combat/startup on desktop and mobile emulation; not physical phones or full campaigns'};
 const save=()=>fs.writeFileSync(path.join(out,'published-results.json'),JSON.stringify(report,null,2));let browser;save();
 try{
  const changed=['index.html','assets/rc95/combat-flow.js','assets/rc129/danmaku-director.js','assets/rc129/danmaku-hud.js'];
  let ready=false;
  for(let attempt=0;attempt<30&&!ready;attempt++){
   const observations=await Promise.all(changed.map(async file=>{try{const url=new URL(file,base);url.searchParams.set('rc129-ready',String(Date.now()));const r=await fetch(url,{signal:AbortSignal.timeout(15000)}),actual=hash(Buffer.from(await r.arrayBuffer())),expected=hash(fs.readFileSync(path.join(root,file)));return{file,status:r.status,actual,expected,match:r.ok&&actual===expected};}catch(error){return{file,error:String(error),match:false};}}));
   report.readiness.push({attempt,observations});ready=observations.every(r=>r.match);save();
   if(!ready)await new Promise(r=>setTimeout(r,10000));
  }
  assert(ready,'Exact RC129 deployment did not become available');
  for(const file of files){const url=new URL(file,base);url.searchParams.set('rc129-verify',String(Date.now()));const r=await fetch(url,{signal:AbortSignal.timeout(30000)}),actual=hash(Buffer.from(await r.arrayBuffer())),expected=hash(fs.readFileSync(path.join(root,file)));report.files.push({file,status:r.status,expected,actual});save();assert.equal(r.status,200,file);assert.equal(actual,expected,'Published bytes differ: '+file);}
  browser=await chromium.launch({chromiumSandbox: true, executablePath:process.env.HAPIL_CHROMIUM,args:['--disable-dev-shm-usage']});
  for(const[name,width,height,mobile]of[['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),row={name,errors:[],httpErrors:[],samples:[]};report.screens.push(row);page.setDefaultTimeout(30000);
   page.on('pageerror',e=>row.errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400)row.httpErrors.push({url:r.url(),status:r.status()});});
   const url=new URL(base);url.searchParams.set('v','42901');url.searchParams.set('qa','1');await page.goto(url.href);
   await page.waitForFunction(()=>window.__HAPIL_DANMAKU_HUD_RC129__?.installed&&window.__HAPIL_RC127_INSTALLED__&&window.__HAPIL_FEEDBACK_RC128__?.installed);
   await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
   assert.equal(await page.locator('[data-game-mode-v31354="HELL"]:visible').count(),0,'HELL must remain removed');
   await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00');
   await page.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.setMode('full'));
   for(let i=0;i<12&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(100);}
   for(let i=0;i<15;i++){
    await page.waitForTimeout(2000);
    row.samples.push(await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,D=window.__HAPIL_DANMAKU_RC129__;return{zone:s.zone,time:s.time,hp:s.hp,hero:s.activeHeroId,mode:s.gameModeV31346,speed:s.rc127MovementSpeed,fixed:window.__HAPIL_POLICY_RC127__.fixedSpeed,shots:s.hostileProjectiles.length,finite:s.hostileProjectiles.every(q=>[q.x,q.y,q.vx,q.vy].every(Number.isFinite)),director:D.snapshot(s),hud:window.__HAPIL_DANMAKU_HUD_RC129__.snapshot(s),rc128:window.__HAPIL_FEEDBACK_RC128__.snapshot(s),bosses:s.enemies.filter(D.safeActor).map(a=>String(a.id))};}));
    save();
   }
   row.final=row.samples.at(-1);row.sawBoss=row.samples.some(v=>v.bosses.length);row.sawNamedPhase=row.samples.some(v=>v.director.phase?.title);row.sawMarker=row.samples.some(v=>v.hud.last?.markers?.length);
   await page.screenshot({path:path.join(out,'published-'+name+'.png')});
   assert.deepEqual(row.errors,[],'Published JS errors');assert.deepEqual(row.httpErrors,[],'Published HTTP failures');
   assert(row.final.time>5&&row.samples.every(v=>v.finite&&Number.isFinite(v.hp)),'Live simulation must advance with finite values');
   assert(row.samples.every(v=>Math.abs(v.speed-v.fixed)<1e-8),'777-reference fixed movement is retained');
   assert(row.samples.every(v=>v.hud.installed&&v.hud.metrics.errors===0&&v.rc128.totals.drawErrors===0),'New and existing renderers must remain error-free');
   if(row.sawBoss)assert(row.sawNamedPhase&&row.sawMarker,'Observed boss must reach named phase and marker rendering');
   row.passed=true;save();console.log('RC129_PUBLIC_PROFILE',JSON.stringify({name,passed:true,sawBoss:row.sawBoss,sawNamedPhase:row.sawNamedPhase,sawMarker:row.sawMarker,errors:row.errors,httpErrors:row.httpErrors,final:row.final}));await context.close();
  }
  report.status='passed';console.log('RC129_PUBLIC_SUMMARY',JSON.stringify({commit:report.testedCommit,status:report.status,files:report.files.length,profiles:report.screens.map(r=>({name:r.name,passed:r.passed,sawNamedPhase:r.sawNamedPhase,sawMarker:r.sawMarker})),scope:report.scope}));
 }catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
 finally{report.finishedAt=new Date().toISOString();save();await browser?.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
