'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results'),'rc125');fs.mkdirSync(out,{recursive:true});
const BASE='257b920a470e0ee6a04e5a52d71157f66232682c',baseline={};
for(const p of ['index.html','assets/index-v31526.js'])baseline[p]=execFileSync('git',['show',BASE+':'+p],{cwd:root,maxBuffer:20*1024*1024});
const harness='\nconst rc125NativeRender=$n;$n=function(...a){if(window.__RC125_FIXTURE__)a[1]=window.__RC125_FIXTURE__;return rc125NativeRender(...a);};window.__RC125_TEST__={initial:oi,cast:(...a)=>Ei(...a),actor:(...a)=>Yn(...a),project:(...a)=>G(...a),camera:s=>HAPIL_viewCameraRC104(s.x,s.y,s),inverse:(...a)=>ee(...a),queue:MONGSE_queueImage};';
function serve(before){return http.createServer((req,res)=>{try{let relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}let data=before&&baseline[relative]?baseline[relative]:fs.readFileSync(file);if(relative==='assets/index-v31526.js')data=data.toString()+harness;res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff2':'font/woff2','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}}).listen(0,'127.0.0.1');}
const beforeServer=serve(true),afterServer=serve(false);
(async()=>{let browser;const rows=[];try{
 browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,width,height,mobile] of [['pc',1180,757,false],['desktop',1920,1080,false],['portrait',390,844,true],['landscape',844,390,true]]){
  for(const before of [true,false]){
   const phase=before?'before':'after',context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),errors=[],failed=[];page.setDefaultTimeout(20000);
   page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400)failed.push({status:r.status(),url:r.url()});});
   await page.goto(`http://127.0.0.1:${(before?beforeServer:afterServer).address().port}/?qa=1`);await page.waitForFunction(()=>window.__HAPIL_SAMONG_RC91__?.installed);await page.keyboard.press('Escape');await page.evaluate(()=>window.__HAPIL_SAMONG_RC91__.unlock(null,'777'));
   await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('[data-game-mode-v31354="DREAM"]').click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
   await page.waitForFunction(()=>window.__MONGSE_QA_STATE__&&window.__HAPIL_RC72__?.audit?.().allPass);await page.waitForTimeout(700);
   await page.evaluate(async()=>{
    const T=window.__RC125_TEST__,B=window.__HAPIL_RC86_BRIDGE__,owner=window.__HAPIL_LASERS_V31330__.owners.find(o=>o.id==='dist06-boss'),a=B.cloneEnemy(B.actor(owner.zone,owner.id),owner.zone),s=T.initial();
    Object.assign(s,{practiceV31329:true,zone:owner.zone,time:100,x:18,y:16,hp:100000,maxHp:100000,invulnerableUntil:10000,gameModeV31346:'DREAM',activeHeroId:'hwando'});
    Object.assign(a,{humanPhase0:false,fixedPhase:1,currentPhase:1,x:16,y:16,attackAt:0,readyAt:0,patternReadyAt:0,invulnerableUntil:0,combatEntryGraceUntilV31239:0,phaseTransitionUntil:0,recoverUntil:0});s.enemies=[a];
    const p=B.patterns(a,1).find(p=>p.bloodV31516&&p.laserTypeV31331==='branch-y'),c=T.cast(s,a,p,1);if(!c)throw Error('Missing real native laser fixture');
    s.time=c.fireAt+c.activeSeconds*.4;s.bossLaserCastsV31330=[c];s.enemies=[{...a,hp:a.maxHp*.5,laserLockV31332:c.id}];window.__RC125_FIXTURE__=s;
    const original=CanvasRenderingContext2D.prototype.fillRect;window.__RC125_BARS__=[];
    CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){const result=original.call(this,x,y,w,h);if(this.canvas===document.querySelector('.game-stage canvas')&&this.fillStyle==='#ff3b66'&&h===7&&w>0){const m=this.getTransform(),r=this.canvas.getBoundingClientRect();window.__RC125_BARS__.push({x,y,w,h,m:{a:m.a,b:m.b,c:m.c,d:m.d,e:m.e,f:m.f},css:{width:r.width,height:r.height},backing:{width:this.canvas.width,height:this.canvas.height}});if(window.__RC125_BARS__.length>60)window.__RC125_BARS__.shift();}return result;};
   });
   await page.waitForTimeout(900);await page.screenshot({path:path.join(out,`${name}-${phase}.png`)});
   const row=await page.evaluate(({name,phase,before,mobile,width,height})=>{
    const T=window.__RC125_TEST__,s=window.__RC125_FIXTURE__,R=window.__HAPIL_ADAPTIVE_RC125__,v=window.__HAPIL_VIEWPORT_RC104__,split=window.__HAPIL_PORTRAIT_SPLIT_RC108__,cv=document.querySelector('.game-stage canvas'),stage=cv.parentElement,rect=cv.getBoundingClientRect(),box=stage.getBoundingClientRect(),cam=T.camera(s),major=(s.enemies||[]).find(e=>e.boss),bars=window.__RC125_BARS__,problems=[];
    const bounds=el=>{const r=el?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height}:null;};
    const actualWide=!mobile||width>height;
    if(!before){if(!R?.installed)problems.push('adaptive-not-installed');if(actualWide){if(!R.wide()||!R.snapshot().frames)problems.push('native-transform-not-used');if(Math.abs(rect.width-box.width)>1||Math.abs(rect.height-box.height)>1)problems.push('unused-canvas-space');if(getComputedStyle(cv).aspectRatio!=='auto')problems.push('fixed-aspect-remains');if(Math.abs(rect.width-width)>1)problems.push('battlefield-not-full-width');}else if(R.wide()||!split.active(s))problems.push('portrait-split-not-preserved');}
    let maxIsotropyError=0,visibleBars=0;
    for(const bar of bars){const sx=Math.hypot(bar.m.a,bar.m.b)*bar.css.width/bar.backing.width,sy=Math.hypot(bar.m.c,bar.m.d)*bar.css.height/bar.backing.height;maxIsotropyError=Math.max(maxIsotropyError,Math.abs(sx/sy-1));const x=bar.m.a*(bar.x+bar.w/2)+bar.m.c*(bar.y+bar.h/2)+bar.m.e,y=bar.m.b*(bar.x+bar.w/2)+bar.m.d*(bar.y+bar.h/2)+bar.m.f;if(x>=0&&x<=bar.backing.width&&y>=0&&y<=bar.backing.height)visibleBars++;}
    if(!bars.length)problems.push('native-hp-not-drawn');if(!before&&actualWide&&maxIsotropyError>.005)problems.push('world-display-stretched');if(!before&&actualWide&&!visibleBars)problems.push('boss-hp-outside-canvas');
    let pointerError=0,pointerSamples=0;
    if(!before&&actualWide){const visible=R.view(rect.width,rect.height);for(const x of[4,12,20,28])for(const y of[4,12,20,28]){const p=T.project(x,y),logical={x:cam.x+p.x*cam.scale,y:cam.y+p.y*cam.scale},event={clientX:rect.left+(logical.x-visible.x)*visible.k,clientY:rect.top+(logical.y-visible.y)*visible.k},q=v.pointer(event,rect),world=T.inverse(q.x,q.y,cam);pointerError=Math.max(pointerError,Math.hypot(world.x-x,world.y-y));pointerSamples++;}if(!Number.isFinite(pointerError)||pointerError>1e-5)problems.push('inverse-pointer-mismatch');}
    const hud={enemy:bounds(document.querySelector('#rc15-sidepanels .rc15-enemies')),ally:bounds(document.querySelector('#rc15-sidepanels .rc15-allies')),controls:bounds(document.querySelector('#rc108-control-overlay')),settings:bounds(document.querySelector('#rc108-control-overlay .rc108-settings-trigger'))};
    if(!before&&actualWide){if(hud.enemy?.x>=hud.ally?.x)problems.push('enemy-not-left-of-ally');if(!mobile&&hud.controls&&hud.controls.y<rect.bottom-1)problems.push('desktop-controls-cover-battlefield');if(hud.enemy&&hud.enemy.y+hud.enemy.height>rect.top+1)problems.push('information-covers-battlefield');}
    return{name,phase,viewport:{width,height},canvas:bounds(cv),stage:bounds(stage),canvasArea:rect.width*rect.height,viewportFraction:rect.width*rect.height/(width*height),backing:{width:cv.width,height:cv.height},camera:cam,adaptive:R?.snapshot()??null,portrait:split.metrics(),barSamples:bars.length,visibleBars,maxIsotropyError,pointerError,pointerSamples,hud,problems,fixture:{zone:s.zone,hero:{x:s.x,y:s.y},boss:{id:major?.id,hp:major?.hp,maxHp:major?.maxHp},laser:'branch-y'},scope:'Same staged native render state in before/after; not natural gameplay completion.'};
   },{name,phase,before,mobile,width,height});
   if(!before&&!mobile){await page.locator('#rc108-control-overlay .rc108-more-trigger').click();await page.locator('.combat-controls-dialog[open]').waitFor();row.secondaryControls=await page.locator('.combat-controls-dialog[open] button').count();await page.keyboard.press('Escape');await page.locator('#rc108-control-overlay .rc108-settings-trigger').click();await page.locator('.settings-layout').waitFor({state:'visible'});row.settingsOpened=true;await page.keyboard.press('Escape');}
   if(!before&&name==='landscape'){
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);row.rotatedToPortrait=await page.evaluate(()=>({wide:window.__HAPIL_ADAPTIVE_RC125__.wide(),split:window.__HAPIL_PORTRAIT_SPLIT_RC108__.active(window.__RC125_FIXTURE__)}));if(row.rotatedToPortrait.wide||!row.rotatedToPortrait.split)row.problems.push('rotation-to-portrait-failed');
    await page.setViewportSize({width,height});await page.waitForTimeout(500);row.rotatedBack=await page.evaluate(()=>window.__HAPIL_ADAPTIVE_RC125__.wide());if(!row.rotatedBack)row.problems.push('rotation-back-failed');
   }
   row.errors=errors;row.failedResponses=failed;rows.push(row);fs.writeFileSync(path.join(out,`${name}-${phase}.json`),JSON.stringify(row,null,2));fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(rows,null,2));
   console.log('RC125_LAYOUT',JSON.stringify({name,phase,canvas:row.canvas,stage:row.stage,viewportFraction:row.viewportFraction,barSamples:row.barSamples,visibleBars:row.visibleBars,maxIsotropyError:row.maxIsotropyError,pointerError:row.pointerError,problems:row.problems,errors,failed}));
   assert.deepEqual(row.problems,[]);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);await context.close();
  }
 }
 const comparison=[];for(const name of['pc','desktop','portrait','landscape']){const a=rows.find(r=>r.name===name&&r.phase==='before'),b=rows.find(r=>r.name===name&&r.phase==='after');const r={name,beforeCanvas:a.canvas,afterCanvas:b.canvas,canvasAreaGainPercent:(b.canvasArea/a.canvasArea-1)*100,beforeViewportFraction:a.viewportFraction,afterViewportFraction:b.viewportFraction};comparison.push(r);if(name!=='portrait')assert.ok(b.canvasArea>=a.canvasArea-2,'available battlefield must not shrink');}
 fs.writeFileSync(path.join(out,'comparison.json'),JSON.stringify(comparison,null,2));console.log('RC125_COMPARISON',JSON.stringify(comparison));
 }finally{await browser?.close();beforeServer.close();afterServer.close();}
})().catch(e=>{console.error(e);beforeServer.close();afterServer.close();process.exitCode=1;});
