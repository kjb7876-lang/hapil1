'use strict';
// Staged native-runtime fixtures, NOT natural-play claims. Original scripts are
// served unchanged except for exposing QA entry points already used in RC121.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results'),'rc123-boundary');fs.mkdirSync(out,{recursive:true});
const harness='\nconst rc123NativeRender=$n;$n=function(...a){if(window.__RC123_RENDER_STATE__)a[1]=window.__RC123_RENDER_STATE__;return rc123NativeRender(...a);};window.__RC123_NATIVE__={initial:oi,cast:(...a)=>Ei(...a),queue:MONGSE_queueImage};';
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(f)]||'application/octet-stream');res.end(f.endsWith('index-v31526.js')?fs.readFileSync(f,'utf8')+harness:fs.readFileSync(f));}catch{res.writeHead(404).end();}}).listen(0,'127.0.0.1');
(async()=>{let browser;const summary=[];try{browser=await chromium.launch({chromiumSandbox: true, channel: 'chrome', args:['--disable-dev-shm-usage']});
 for(const [name,width,height,mobile]of[['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
  await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);await page.waitForFunction(()=>window.__HAPIL_SAMONG_RC91__?.installed);await page.keyboard.press('Escape');await page.evaluate(()=>window.__HAPIL_SAMONG_RC91__.unlock(null,'777'));await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('[data-game-mode-v31354="DREAM"]').click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__&&window.__HAPIL_RC72__?.audit?.().allPass);
  const result=await page.evaluate(async name=>{
   const T=window.__RC123_NATIVE__,L=window.__HAPIL_LASERS_V31330__,B=window.__HAPIL_RC86_BRIDGE__,blood=window.__HAPIL_BLOOD_RC16__,top=window.__HAPIL_LASER_TOPOLOGY_RC108__,owners=L.owners.filter(o=>!o.native),owner=owners.find(o=>o.id==='dist06-boss');
   const problems=[],rows=[],cache={},fixtures=[],near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<1e-4;
   for(const type of blood.types){
    const s=T.initial(),a=B.cloneEnemy(B.actor(owner.zone,owner.id),owner.zone);Object.assign(s,{practiceV31329:true,zone:owner.zone,time:100,x:18,y:16,hp:100000,maxHp:100000,invulnerableUntil:10000,gameModeV31346:'STORY',activeHeroId:'hwando'});Object.assign(a,{humanPhase0:false,fixedPhase:1,currentPhase:1,x:16,y:16,attackAt:0,readyAt:0,patternReadyAt:0,invulnerableUntil:0,combatEntryGraceUntilV31239:0,phaseTransitionUntil:0,recoverUntil:0});s.enemies=[a];
    const p=B.patterns(a,1).find(p=>p.bloodV31516&&p.laserTypeV31331===type),c=T.cast(s,a,p,1),row={type,samples:0,terminalChecks:0,contactChecks:0};
    if(!c){problems.push({type,kind:'missing-cast'});continue;}
    for(const progress of[0,.2,.6,1]){
     const at=c.fireAt+c.activeSeconds*progress,lines=L.geometry(c,at),nodes=[];
     if(!lines.length||top.components(lines).length!==1)problems.push({type,progress,kind:'empty-or-disconnected'});
     for(const l of lines){for(const point of[l.a,l.b]){if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<1.1-1e-4||point.x>30.9+1e-4||point.y<1.1-1e-4||point.y>30.9+1e-4)problems.push({type,progress,kind:'outside-boundary',point});let n=nodes.find(n=>near(n.point,point));if(!n)nodes.push(n={point,count:0,line:l});n.count++;}
      const midpoint={x:(l.a.x+l.b.x)/2,y:(l.a.y+l.b.y)/2};if(!L.contact(c,midpoint,at))problems.push({type,progress,kind:'midpoint-contact',point:midpoint});row.contactChecks++;
     }
     for(const n of nodes)if(n.count===1){const point=n.point,origin={x:c.cx,y:c.cy};if(near(point,origin))continue;row.terminalChecks++;if(!top.onBoundary(point))problems.push({type,progress,kind:'short-terminal',point});const other=near(point,n.line.a)?n.line.b:n.line.a,len=Math.hypot(other.x-point.x,other.y-point.y),step=Math.min(.03,len*.25),inside={x:point.x+(other.x-point.x)/len*step,y:point.y+(other.y-point.y)/len*step};if(!L.contact(c,inside,at))problems.push({type,progress,kind:'terminal-contact',point:inside});row.contactChecks++;}
     row.samples++;
    }
    fixtures.push({s,a,c});T.queue(cache,c.beam,'eager');rows.push(row);
   }
   await Promise.all(Object.values(cache).map(im=>im.decode?.()));window.__RC123_FIXTURES__=fixtures;return{name,rows,problems,metrics:top.metrics(),scope:'staged native boss laser fixtures; not natural play'};
  },name);
  fs.writeFileSync(path.join(out,name+'-boundary.json'),JSON.stringify(result,null,2));console.log('RC123_BOUNDARY_BROWSER',JSON.stringify({name,types:result.rows.length,terminalChecks:result.rows.reduce((n,r)=>n+r.terminalChecks,0),contactChecks:result.rows.reduce((n,r)=>n+r.contactChecks,0),problems:result.problems.slice(0,12),problemCount:result.problems.length,errors}));
  // Capture even failing fixtures for diagnosis; do not disguise failures as passes.
  for(const type of['branch-y','fork-link']){
   const staged=await page.evaluate(type=>{const f=window.__RC123_FIXTURES__.find(f=>f.c.type===type);if(!f)return false;const s=Object.assign(window.__RC123_NATIVE__.initial(),f.s),c={...f.c,contacts:[],lastTick:f.c.fireAt};s.enemies=[{...f.a,hp:f.a.maxHp,laserLockV31332:c.id}];s.time=c.fireAt+c.activeSeconds*.4;s.bossLaserCastsV31330=[c];s.hp=s.maxHp=100000;s.invulnerableUntil=s.time+999;s.gameModeV31346='DREAM';window.__RC123_RENDER_STATE__=s;window.__RC123_DRAW_START__=window.__HAPIL_CONNECTED_LASER_V31377__.stats().draws;return true;},type);
   if(staged){await page.waitForTimeout(500);assert(await page.evaluate(()=>window.__HAPIL_CONNECTED_LASER_V31377__.stats().draws>window.__RC123_DRAW_START__),'native renderer must draw staged beam');await page.screenshot({path:path.join(out,name+'-'+type+'.png')});}
  }
  summary.push({...result,errors,missing});fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2));assert.deepEqual(result.problems,[]);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await context.close();
 }
}finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
