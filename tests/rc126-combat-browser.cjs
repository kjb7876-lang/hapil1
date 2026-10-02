'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results'),'rc126');fs.mkdirSync(out,{recursive:true});
// Expose existing native functions only to this local fixture server. Separate
// release/public tests run without appended code or changed game state.
const harness='\nwindow.__RC126_NATIVE__={initial:oi,project:G,hit:Di,actor:Yn,queue:MONGSE_queueImage,step:MONGSE_stepSignatureProjectile31212,dynamicBlue:()=>ye};const rc126Draw=$n;$n=function(...a){if(window.__RC126_FIXTURE__)a[1]=window.__RC126_FIXTURE__;return rc126Draw(...a);};';
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(f)]||'application/octet-stream');res.end(f.endsWith('index-v31526.js')?fs.readFileSync(f,'utf8')+harness:fs.readFileSync(f));}catch{res.writeHead(404).end();}});
(async()=>{let browser;const results=[];try{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
for(const [name,width,height,mobile]of[['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile}),page=await context.newPage(),errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
 await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);await page.waitForFunction(()=>window.__HAPIL_SAMONG_RC91__?.installed&&window.__HAPIL_COMBAT_READABILITY_RC126__?.installed);await page.keyboard.press('Escape');await page.evaluate(()=>window.__HAPIL_SAMONG_RC91__.unlock(null,'777'));await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('[data-game-mode-v31354="DREAM"]').click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__&&window.__HAPIL_RC95_NATIVE__&&window.__HAPIL_RC72__?.audit?.().allPass);
 const r=await page.evaluate(async()=>{
  const R=window.__HAPIL_COMBAT_READABILITY_RC126__,T=window.__RC126_NATIVE__,B=window.__HAPIL_RC86_BRIDGE__,L=window.__HAPIL_LASERS_V31330__,A=window.__HAPIL_RC95_NATIVE__,C=window.__HAPIL_CHOICE_RC97__,F=window.__HAPIL_COMBAT_FLOW_RC95__,P=window.__HAPIL_PROJECTILE_PIPELINE_V31402__;
  const problems=[],rows=[],fixtures=[],catalog=L.owners.filter(o=>!o.native),seen=new Set();let heldChecks=0,steps=0;
  for(const own of catalog){if(seen.has(own.id))continue;seen.add(own.id);const raw=own.id==='blue-executor'?T.dynamicBlue():B.actor(own.zone,own.id);if(!raw){problems.push({kind:'missing-native-actor',id:own.id});continue;}
   const a=B.cloneEnemy(raw,own.zone);if(!a.boss&&!a.midboss)continue;
   const s=Object.assign(T.initial(),{zone:own.zone,time:100,x:27,y:26,hp:240,maxHp:240,activeHeroId:'hwando',practiceV31329:true,gameModeV31346:'STORY',timeStopUntil:0,enemies:[a],hostileProjectiles:[]});
   Object.assign(a,{x:14,y:14,humanPhase0:false,fixedPhase:1,currentPhase:1,attackAt:0,readyAt:0,patternReadyAt:0,invulnerableUntil:0,combatEntryGraceUntilV31239:0,phaseTransitionUntil:0,recoverUntil:0,atomicCastUntil31210:0});
   const specs=C.volley(s,a,{index:0,cycle:0},7);F.run(s,()=>{for(const spec of specs)A.bullet(s,a,spec);});
   const qs=s.hostileProjectiles;if(!qs.length){problems.push({kind:'no-native-shots',id:a.id});continue;}qs.forEach((q,i)=>{q.rc97Grammar=specs[i]?.rc97Grammar;q.rc95Bullet=true;q.heavyBossSkill=false;});
   const damage=qs.map(q=>q.damage);R.volley(s,a,qs);R.prepare(s);const starts=qs.map(q=>({x:q.x,y:q.y})),birth=qs.map(q=>q.born),ledgerBefore=s.rc126AssetLedger.used.length;
   for(let step=0;step<120;step++){s.time=100+step/60;for(const q of qs){if(R.waiting(q,s.time)){heldChecks++;if(P.visible(q,s.time)||P.contactEnabled(q,s.time))problems.push({kind:'pre-release-visible-or-contact',id:a.id});continue;}q.previousX=q.x;q.previousY=q.y;T.step(s,q,1/60);steps++;if(![q.x,q.y,q.vx,q.vy].every(Number.isFinite))problems.push({kind:'nonfinite-flight',id:a.id});}}
   for(let i=0;i<qs.length;i++){const q=qs[i];if(q.damage!==damage[i]||q.born!==birth[i])problems.push({kind:'damage-or-birth-changed',id:a.id});if(Math.hypot(q.x-starts[i].x,q.y-starts[i].y)<.1)problems.push({kind:'projectile-did-not-travel',id:a.id});R.enforce(q);}
   if(s.rc126AssetLedger.used.length!==ledgerBefore)problems.push({kind:'ledger-changed-without-spawn',id:a.id});
   const used=qs.filter(q=>q.rc126Sprite&&q.rc126Sprite!==R.JELLY).map(q=>q.rc126AssetKey);if(new Set(used).size!==used.length)problems.push({kind:'duplicate-special-art',id:a.id});
   rows.push({id:a.id,zone:own.zone,grammar:qs[0].rc97Grammar,shots:qs.length,special:used.length,jelly:qs.filter(q=>q.rc126Sprite===R.JELLY).length,minTravel:Math.min(...qs.map((q,i)=>Math.hypot(q.x-starts[i].x,q.y-starts[i].y)))});
   if(own.id==='dist00-boss'||own.id==='blue-executor')fixtures.push(s);
  }
  if(!rows.some(r=>r.id==='blue-executor'))problems.push({kind:'dynamic-blue-executor-not-tested'});
  // Actual native HP painter, including the formerly omitted dynamic template.
  const cv=document.createElement('canvas');cv.width=1280;cv.height=720;const ctx=cv.getContext('2d'),fill=ctx.fillRect;let bars=[];ctx.fillRect=function(x,y,w,h){if(this.fillStyle==='#ff3b66'&&h===7)bars.push(w);return fill.call(this,x,y,w,h);};
  for(const s of fixtures){const a=s.enemies[0],im={};bars=[];T.actor(ctx,im,{...a,hp:a.maxHp},100,{showCombatInfo:false,lowFx:true,reducedFlash:true},false);const full=bars.at(-1);bars=[];T.actor(ctx,im,{...a,hp:a.maxHp*.25},100,{showCombatInfo:false,lowFx:true,reducedFlash:true},false);if(!full||Math.abs(bars.at(-1)/full-.25)>1e-7)problems.push({kind:'native-boss-hp-ratio',id:a.id});}
  window.__RC126_CAPTURE_FIXTURES__=fixtures;
  return{rows,heldChecks,steps,problems,metrics:R.metrics(),scope:'Native projectile/painter fixtures; not full natural completion or real phone testing.'};
 });
 await page.evaluate(()=>{window.__RC126_FIXTURE__=window.__RC126_CAPTURE_FIXTURES__.find(s=>s.enemies[0].id==='dist00-boss');});await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,name+'-native-volley.png')});
 await page.evaluate(()=>{window.__RC126_FIXTURE__=window.__RC126_CAPTURE_FIXTURES__.find(s=>s.enemies[0].id==='blue-executor');});await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,name+'-dynamic-blue.png')});
 r.name=name;r.errors=errors;r.failedResponses=failed;results.push(r);fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(r,null,2));console.log('RC126_BROWSER',JSON.stringify({name,actors:r.rows.length,shots:r.rows.reduce((n,x)=>n+x.shots,0),heldChecks:r.heldChecks,steps:r.steps,problems:r.problems,errors,failed}));
 assert.deepEqual(r.problems,[]);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);await context.close();
}
}finally{fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(results,null,2));await browser?.close();await new Promise(resolve=>server.close(resolve));}})().catch(e=>{console.error(e);process.exitCode=1;});
