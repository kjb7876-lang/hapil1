'use strict';
// Staged scenes enter the outer real render chain, including RC91/128 overlays.
// Unmodified live startup is recorded separately; fixtures are not natural play.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results'),'rc129-browser');fs.mkdirSync(out,{recursive:true});
const bridge='\nwindow.__RC129_NATIVE__={initial:oi,project:G,queue:MONGSE_queueImage};';
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');const bytes=fs.readFileSync(file);res.end(file.endsWith('/assets/index-v31526.js')?bytes.toString()+bridge:bytes);}catch{res.writeHead(404).end();}});
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const report={commit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),status:'running',profiles:[],cases:[],scope:'48 staged native renders and 3 unmodified startup observations; not 48 natural boss clears'};
 const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));save();
 try{
 browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const[name,width,height,mobile]of[['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),errors=[],httpErrors=[];
  const profile={name,errors,httpErrors};report.profiles.push(profile);save();
  page.on('pageerror',e=>{errors.push(e.stack||e.message);console.error('RC129_NATIVE_ERROR',e.stack||e.message);});page.on('response',r=>{if(r.status()>=400)httpErrors.push({url:r.url(),status:r.status()});});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__HAPIL_DANMAKU_HUD_RC129__?.installed&&window.__HAPIL_RC127_INSTALLED__);
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
  assert.equal(await page.locator('[data-game-mode-v31354="HELL"]:visible').count(),0,'HELL must not return to the mode selector');
  await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__);
  for(let i=0;i<12&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(100);}
  const live=()=>page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;return{zone:s.zone,time:s.time,hp:s.hp,x:s.x,y:s.y,speed:s.rc127MovementSpeed,mode:s.gameModeV31346,hud:window.__HAPIL_DANMAKU_HUD_RC129__.snapshot(s)};});
  const first=await live();await page.keyboard.down('ArrowRight');await page.waitForTimeout(350);await page.keyboard.up('ArrowRight');await page.waitForTimeout(1200);const last=await live();assert(last.time>first.time,'natural startup progresses');assert(Number.isFinite(last.hp));
  profile.startup={first,last,usedProgressCheats:false};await page.screenshot({path:path.join(out,name+'-natural-start.png')});save();
  await page.evaluate(()=>{
   const B=window.__HAPIL_RC86_BRIDGE__,original=B.renderFrame;
   B.renderFrame=function(...args){const fixture=window.__RC129_FIXED_STATE__;if(fixture){args[1]=fixture;const hero=window.__HAPIL_RC95_NATIVE__.heroes.find(h=>h.id===fixture.activeHeroId);if(hero)args[3]=hero;}return original.apply(this,args);};
  });
  for(const mode of ['STORY','DREAM'])for(const hero of ['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner']){
   const data=await page.evaluate(({mode,hero})=>{
    const T=window.__RC129_NATIVE__,B=window.__HAPIL_RC86_BRIDGE__,N=window.__HAPIL_RC95_NATIVE__,F=window.__HAPIL_COMBAT_FLOW_RC95__,D=window.__HAPIL_DANMAKU_RC129__,V=window.__HAPIL_PROJECTILE_PIPELINE_V31402__,s=T.initial(),a=B.cloneEnemy(B.actor('ep1b03','b03-boss'),'ep1b03'),problems=[];
    const test=(ok,label)=>{if(!ok)problems.push(label);};
    Object.assign(s,{zone:'ep1b03',time:100,x:24,y:23,hp:240,maxHp:240,activeHeroId:hero,gameModeV31346:mode,hellModeV31322:false,practiceV31329:false,timeStopUntil:0,enemySkillsSuppressedUntilV31309:0,resonance:0});
    Object.assign(a,{x:8,y:8,hp:a.maxHp,humanPhase0:false,fixedPhase:1,currentPhase:1,attackAt:0,attackStarted:0,readyAt:0,patternReadyAt:0,recoverUntil:0,atomicCastUntil31210:0,staggerUntil:0,invulnerableUntil:0,phaseTransitionUntil:0,combatEntryGraceUntilV31239:0});s.enemies=[a];
    F.tick(s,N,.016);const shots=s.hostileProjectiles.filter(q=>q.rc129Plan),p=D.phase(s);test(!!p,'director receives real native state');test(shots.length===(mode==='STORY'?6:7),'native mode-specific salvo count');test(shots.every(q=>Number.isFinite(q.vx)&&Number.isFinite(q.vy)),'finite native flight');test(shots.every(q=>q.motionReleaseAt31219>=100+(mode==='STORY'?.45:.3)-1e-7),'pre-release warning preserved');
    for(const q of shots){test(!V.visible(q,q.motionReleaseAt31219-.001),'unreleased shot invisible');test(!V.contactEnabled(q,q.motionReleaseAt31219-.001),'unreleased shot cannot hit');}
    const lastRelease=Math.max(...shots.map(q=>q.motionReleaseAt31219));s.time=lastRelease+.45;for(const q of shots){const dt=s.time-q.motionReleaseAt31219;q.x+=q.vx*dt;q.y+=q.vy*dt;}
    D.beforeTick(s,{locked:()=>false},.016);window.__RC129_FIXED_STATE__=s;
    return{hero,mode,phase:p,shots:shots.length,firstRelease:Math.min(...shots.map(q=>q.motionReleaseAt31219)),lastRelease,problems};
   },{hero,mode});
   assert.deepEqual(data.problems,[]);
   await page.waitForFunction(()=>window.__HAPIL_DANMAKU_HUD_RC129__.snapshot(window.__RC129_FIXED_STATE__).last?.phase?.title,{},{timeout:5000});
   await page.waitForTimeout(200);
   const view=await page.evaluate(()=>{const s=window.__RC129_FIXED_STATE__,canvas=document.querySelector('.game-stage>canvas'),hud=window.__HAPIL_DANMAKU_HUD_RC129__.snapshot(s);const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let painted=0;for(let i=3;i<pixels.length;i+=64)if(pixels[i])painted++;return{hud,painted,canvas:{width:canvas.width,height:canvas.height}};});
   assert(view.painted>1000,'native renderer actually paints');assert(view.hud.last?.phase?.title,'spell title reaches actual paint callback');assert(view.hud.last.markers.length>0,'boss marker actually rendered');assert.equal(view.hud.metrics.errors,0);
   assert(view.hud.last.markers.every(p=>p.x>=0&&p.x<=view.hud.last.width&&p.y>=0&&p.y<=view.hud.last.height),'markers remain inside viewport');
   if(hero==='hwando'||hero==='slayer')await page.screenshot({path:path.join(out,`${name}-${mode.toLowerCase()}-${hero}.png`)});
   report.cases.push({...data,profile:name,view,scope:'staged native scene'});save();
  }
  const boundary=await page.evaluate(()=>{
   const s=window.__RC129_FIXED_STATE__,D=window.__HAPIL_DANMAKU_RC129__,B=window.__HAPIL_RC86_BRIDGE__,a=s.enemies[0],start=s.time,finish=start+15;
   s.pendingHits.push({id:'rc129-explicit-pending-fixture',sourceId:a.id,at:finish,damage:10});const hp=s.hp,old=s.hostileProjectiles.length;
   for(let i=0;i<130;i++){s.time+=.1;D.beforeTick(s,{locked:()=>false},.1);}const draining=D.phase(s),kept=s.pendingHits.some(h=>h.id==='rc129-explicit-pending-fixture'&&h.at===finish);
   const serialized=D.exportSave(s);const standard=B.serializeSave(s);const normalized=B.normalizeSave(standard);
   s.time=finish+1;D.beforeTick(s,{locked:()=>false},.1);const after=D.phase(s);
   return{draining,kept,old,remaining:s.hostileProjectiles.length,after,hpUnchanged:s.hp===hp,savePresent:!!standard?.danmakuRC129,normalizePresent:!!normalized?.danmakuRC129,saved:serialized?.phase};
  });
  profile.boundary=boundary;save();console.log('RC129_BOUNDARY_RESULT',JSON.stringify({name,boundary}));
  assert.equal(boundary.draining.stage,'draining');assert(boundary.kept&&boundary.hpUnchanged);assert(boundary.savePresent&&boundary.normalizePresent,'native save adapters retain validated director state');assert.equal(boundary.after.stage,'rest');
  await page.evaluate(()=>{delete window.__RC129_FIXED_STATE__;});await page.waitForTimeout(300);assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);save();
  console.log('RC129_PROFILE_RESULT',JSON.stringify({name,cases:report.cases.filter(c=>c.profile===name).length,errors,httpErrors,boundary}));await context.close();
 }
 assert.equal(report.cases.length,48);report.status='passed';console.log('RC129_BROWSER_RESULT',JSON.stringify({status:'passed',cases:48,profiles:3,scope:report.scope}));
 }catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
 finally{save();await browser?.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
