'use strict';
// Native zone movement bounds in Story and Dream fixtures. This does not claim
// natural campaign progress: every actor and zone below is an isolated fixture.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/pw155/node_modules','playwright'));
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc142-movement-space';fs.mkdirSync(out,{recursive:true});
const zones=JSON.parse(fs.readFileSync(path.join(root,'qa/rc138/map-format-manifest.json'),'utf8')).rows.map(r=>r.id);
const bridge='\nwindow.__RC142_MOVE_QA__={initial:oi,move:(...a)=>ft(...a)};';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');const bytes=fs.readFileSync(file);res.end(file.endsWith('/assets/index-v31526.js')?Buffer.concat([bytes,Buffer.from(bridge)]):bytes);}catch{res.writeHead(404).end();}});
const report={status:'running',commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),dirty:!!cp.execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),staged:true,scope:'Staged native movement-function traversal for all 55 RC138 maps in Story and Dream; not a natural campaign run',modes:['STORY','DREAM'],maps:zones.length,profiles:[],errors:[],httpErrors:[]};
const save=()=>fs.writeFileSync(path.join(out,'movement-space-results.json'),JSON.stringify(report,null,2));
function polygonMetrics(points){let twice=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];twice+=a.x*b.y-a.y*b.x;}const px=points.map(p=>640+27*(p.x-p.y)),py=points.map(p=>13.5*(p.x+p.y));return{vertices:points.length,areaWorld:Math.abs(twice/2),projectedBounds:{x:[Math.min(...px),Math.max(...px)],y:[Math.min(...py),Math.max(...py)]}};}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
 if(process.env.EXPECTED_SHA)assert(report.commit===process.env.EXPECTED_SHA&&!report.dirty,'exact clean revision required');
 browser=await chromium.launch({chromiumSandbox: true, executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--disable-dev-shm-usage']});
 for(const [name,width,height,mobile] of [['pc',1280,900,false],['portrait',390,844,true],['landscape',844,390,true]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile}),page=await context.newPage(),row={name,errors:[],httpErrors:[]};report.profiles.push(row);
  page.on('pageerror',e=>row.errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400)row.httpErrors.push({status:r.status(),url:r.url()});});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__HAPIL_NATIVE_ARENA_RC138__?.installed&&window.__RC142_MOVE_QA__?.move,{timeout:60000});
  row.result=await page.evaluate(zones=>{
   const Q=window.__RC142_MOVE_QA__,C=window.__HAPIL_CONTROLS_V31329__,R=window.__HAPIL_BATTLE_ARENA_RC138__,D=window.__HAPIL_PERSONA_DUEL_RC134__,results=[],modes=['STORY','DREAM'];
   const project=(x,y)=>({x:640+27*(x-y),y:13.5*(x+y)}),metrics=points=>{let twice=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];twice+=a.x*b.y-a.y*b.x;}const coords=points.map(p=>project(p.x,p.y));return{areaWorld:Math.abs(twice/2),bounds:{x:[Math.min(...coords.map(p=>p.x)),Math.max(...coords.map(p=>p.x))],y:[Math.min(...coords.map(p=>p.y)),Math.max(...coords.map(p=>p.y))]}};};
   const polygon=D.polygon('left',.8),candidate=metrics(polygon),reference={policy:{acrossRadius:15,depthRadius:8.3,centerGap:1.45,actorRadius:.8},playerSide:{areaWorld:147.1780510972126,bounds:{x:[97.91067733256716,600.85],y:[370.34863637351464,655.6513636264854]}}};
   const extremes=[
    ['left',p=>project(p.x,p.y).x,(a,b)=>a<b],
    ['right',p=>project(p.x,p.y).x,(a,b)=>a>b],
    ['up',p=>project(p.x,p.y).y,(a,b)=>a<b],
    ['down',p=>project(p.x,p.y).y,(a,b)=>a>b]
   ];
   for(const mode of modes)for(const zone of zones){
    if(!R.enabledZone(zone))throw Error('route is not in the native movement owner: '+mode+'/'+zone);
    const s=Q.initial();Object.assign(s,{zone,gameModeV31346:mode,time:100,x:R.format.entry.x,y:R.format.entry.y,hp:240,maxHp:240,activeHeroId:'hwando',spawnedWaves:new Set([1,2,3]),bossDefeated:false,pendingSpawns:[],enemies:[{id:'rc142-movement-fixture',name:'fixture',hp:100,maxHp:100,x:R.format.exit.x,y:R.format.exit.y,boss:false,midboss:false}]});
    C.binding.state.current=s;C.setMode('manual');R.enforce(s);if(!R.locked(s)||!R.contains(s,'left',.8))throw Error('native player bound unavailable: '+mode+'/'+zone);
    const reached={};
    for(const [name,coord,better] of extremes){
     const target=polygon.reduce((best,p)=>better(coord(p),coord(best))?p:best,polygon[0]),entry={x:s.x,y:s.y};let steps=0;
     while(steps<180&&Math.hypot(target.x-s.x,target.y-s.y)>.035){
      const before={x:s.x,y:s.y},dx=target.x-s.x,dy=target.y-s.y,d=Math.hypot(dx,dy),raw=Q.move(zone,s,{x:dx/d*.24,y:dy/d*.24},.48);s.x=raw.x;s.y=raw.y;steps++;
      if(Math.hypot(s.x-before.x,s.y-before.y)<1e-7)break;
     }
     const at={x:s.x,y:s.y},p=project(at.x,at.y),wanted=project(target.x,target.y),gap=Math.hypot(at.x-target.x,at.y-target.y);
     if(!D.contains(at,'left',.8)||steps===0||gap>.09)throw Error('native movement failed to reach '+name+' edge: '+JSON.stringify({mode,zone,at,target,gap,steps}));
     reached[name]={entry,world:at,projected:p,targetProjected:wanted,steps,withinWorldUnits:gap};
     s.x=R.format.entry.x;s.y=R.format.entry.y;
    }
    results.push({mode,zone,actorRadius:.8,playerSide:metrics(polygon),reached});
   }
   return{policy:{...D.policy},reference,candidate,modes:results};
  },zones);
  row.tests=row.result.modes.length;row.errors.push(...(row.result.modes.errors||[]));if(row.tests!==zones.length*2)throw Error('movement fixture count mismatch');if(row.result.candidate.areaWorld<=row.result.reference.playerSide.areaWorld)throw Error('expanded policy did not expand actual player-side area');
  save();
 }
 for(const p of report.profiles){assert.deepEqual(p.errors,[]);assert.deepEqual(p.httpErrors,[]);}
 const all=report.profiles.flatMap(p=>p.result.modes),areaBefore=report.profiles[0].result.reference.playerSide.areaWorld,areaAfter=all[0].playerSide.areaWorld;report.summary={modeMapFixtures:all.length,fixturesPerProfile:report.profiles[0].result.modes.length,uniqueModes:[...new Set(all.map(r=>r.mode))],uniqueMaps:[...new Set(all.map(r=>r.zone))].length,areaBefore,areaAfter,areaIncreasePercent:(areaAfter/areaBefore-1)*100,allFourEdgesReached:all.every(r=>['left','right','up','down'].every(k=>r.reached[k].withinWorldUnits<=.09)),profiles:report.profiles.map(p=>p.name)};
 report.status='passed';save();console.log('RC142_MOVEMENT_SPACE',JSON.stringify({status:report.status,commit:report.commit,profiles:report.profiles.map(p=>p.name),mapModeFixtures:report.summary.modeMapFixtures,uniqueMaps:report.summary.uniqueMaps,edges:4,areaIncreasePercent:report.summary.areaIncreasePercent,staged:true}));
 }catch(error){report.status='failed';report.failure=error.stack||String(error);save();console.error(report.failure);process.exitCode=1;}finally{await browser?.close();server.close();}})();
