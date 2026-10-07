'use strict';
// Same browser, viewport, fixture, draw count, and CPU throttle on the pinned
// public base and candidate. Staged stress is not a natural encounter sample.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/pw155/node_modules','playwright'));
const candidate=path.resolve(__dirname,'..'),baseline=path.resolve(process.env.RC144_BASE_ROOT||'/tmp/hapil-rc144-baseline'),out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc144-perf';fs.mkdirSync(out,{recursive:true});
const profile=process.env.RC144_PROFILE||'portrait',viewport=profile==='pc'?{width:1280,height:900}:profile==='landscape'?{width:844,height:390}:{width:390,height:844};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2'};
const bridge='\nwindow.__RC144_PERF__={initial:oi,actors:z=>N[z]?.enemies??[],queue:MONGSE_queueImage};';
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),base=u.pathname.startsWith('/base/')?baseline:candidate,relative=u.pathname.replace(/^\/(base|candidate)/,'')||'/',p=relative==='/'?'/index.html':relative,file=path.resolve(base,'.'+decodeURIComponent(p));if(!file.startsWith(base+path.sep))return res.writeHead(403).end();try{const b=fs.readFileSync(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(file.endsWith('/assets/index-v31526.js')?Buffer.concat([b,Buffer.from(bridge)]):b);}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const report={status:'running',profile,baseSha:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:baseline,encoding:'utf8'}).trim(),candidateSha:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:candidate,encoding:'utf8'}).trim(),candidateDirty:!!cp.execFileSync('git',['status','--porcelain'],{cwd:candidate,encoding:'utf8'}).trim(),staged:true,rows:[]};try{
 if(process.env.EXPECTED_SHA)assert(report.candidateSha===process.env.EXPECTED_SHA&&!report.candidateDirty);
 browser=await chromium.launch({chromiumSandbox: true, executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--disable-dev-shm-usage','--enable-precise-memory-info']});
 for(const release of ['base','candidate']){
  const context=await browser.newContext({viewport,deviceScaleFactor:profile==='pc'?1:2,isMobile:profile!=='pc',hasTouch:profile!=='pc'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));await page.goto('http://127.0.0.1:'+server.address().port+'/'+release+'/?qa=1');await page.waitForFunction(()=>window.__RC144_PERF__&&window.__HAPIL_RC133_NATIVE__?.installed,{timeout:60000});
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const sample=await page.evaluate(async()=>{
   const Q=window.__RC144_PERF__,B=window.__HAPIL_RC86_BRIDGE__,s=Q.initial(),normal=Q.actors('dist01').find(a=>!a.boss&&!a.midboss),cache={},canvas=document.createElement('canvas');
   if(!normal)throw Error('dist01 mob missing');canvas.width=1280;canvas.height=720;
   Object.assign(s,{zone:'dist01',time:100.35,x:15,y:15,hp:240,maxHp:240,activeHeroId:'gunner',gameModeV31346:'STORY',spawnedWaves:new Set([1,2,3,4]),completedZones:new Set(),enemies:[],defeated:[],effects:[],hostileProjectiles:[],pendingHits:[],impactQueue:[],narrativeCasts:[],floatTexts:[]});
   for(let i=0;i<6;i++){const a=B.cloneEnemy(normal,'dist01');a.id+='-perf-'+i;a.x=12+i*1.4;a.y=16+i*.5;a.hp=a.maxHp*(.08+i*.08);s.enemies.push(a);s.defeated.push({id:1000+i,x:a.x+3,y:a.y+3,born:100,duration:.72,sprite:a.sprite,kind:a.kind,size:90,facing:1,boss:false,midboss:false,burnRC144:true});}
   for(const asset of [normal.sprite,B.zoneAssetManifest('dist01')?.values()?.next()?.value])if(asset)try{await Q.queue(cache,asset,'eager').decode();}catch{}
   for(let i=0;i<24;i++)B.renderFrame(canvas,s,cache,'gunner',{lowFx:true,showCombatInfo:false,reducedFlash:true});await new Promise(r=>setTimeout(r,600));
   const times=[];for(let i=0;i<180;i++){const at=performance.now();B.renderFrame(canvas,s,cache,'gunner',{lowFx:true,showCombatInfo:false,reducedFlash:true});times.push(performance.now()-at);}
   times.sort((a,b)=>a-b);return{draws:times.length,p50:times[90],p95:times[171],mean:times.reduce((a,b)=>a+b,0)/times.length,heap:performance.memory?.usedJSHeapSize??null,actors:s.enemies.length,deathBodies:s.defeated.length,canvasPixels:canvas.width*canvas.height};
  });
  report.rows.push({release,...sample,errors});await context.close();
 }
 assert(report.rows.every(r=>r.errors.length===0&&r.draws===180&&r.actors===6&&r.deathBodies===6));const [a,b]=report.rows;
 report.comparison={p50Ratio:b.p50/a.p50,p95Ratio:b.p95/a.p95,meanRatio:b.mean/a.mean};
 assert(b.p95<=a.p95*2+4,'candidate staged draw p95 exceeds 2× baseline');report.status='passed';console.log('RC144_PERF',JSON.stringify({status:report.status,profile,base:{p50:a.p50,p95:a.p95},candidate:{p50:b.p50,p95:b.p95},ratio:report.comparison}));
 }catch(error){report.status='failed';report.failure=error.stack||String(error);console.error(report.failure);process.exitCode=1;}finally{fs.writeFileSync(path.join(out,profile+'-results.json'),JSON.stringify(report,null,2));await browser?.close();server.close();}})();
