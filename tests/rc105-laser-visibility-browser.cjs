// Native renderer/admission fixtures, with original boss HP/damage. Not a full campaign benchmark.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),os=require('node:os');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||path.join(os.tmpdir(),'hapil-rc94');fs.mkdirSync(out,{recursive:true});
const harness='\nconst rc105render=$n;$n=function(...args){const r=rc105render(...args);window.__RC105_DRAW_FIXTURE__?.(...args);return r;};window.__RC94_NATIVE__={initial:oi,N,get choose(){return MONGSE_chooseBossPatternIndexSmartR1},cast:(...a)=>Ei(...a),render:(...a)=>$n(...a),heroes:F,camera:(...a)=>HAPIL_viewCameraRC104(...a),project:G,queue:MONGSE_queueImage};';
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(f)]||'application/octet-stream');res.end(f.endsWith('index-v31526.js')?fs.readFileSync(f,'utf8')+harness:fs.readFileSync(f));}catch{res.writeHead(404).end();}}).listen(0,'127.0.0.1');
(async()=>{const browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__HAPIL_SAMONG_RC91__?.installed);await page.keyboard.press('Escape');await page.evaluate(()=>window.__HAPIL_SAMONG_RC91__.unlock(null,'777'));await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('[data-game-mode-v31354="DREAM"]').click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
  await page.waitForFunction(()=>window.__HAPIL_BOSS_CADENCE_RC94__?.installed&&window.__MONGSE_QA_STATE__);
  await page.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.actions.settings());
  const result=await page.evaluate(async ({mobile,stageOnly})=>{
   const T=window.__RC94_NATIVE__,B=window.__HAPIL_RC86_BRIDGE__,L=window.__HAPIL_LASERS_V31330__,C=window.__HAPIL_BOSS_CADENCE_RC94__,R=window.__HAPIL_CONNECTED_LASER_V31377__,blood=window.__HAPIL_BLOOD_RC16__;
   const results=[],problems=[],templates=[],cache={};
   for(const owner of L.owners.filter(o=>!o.native&&['mb-dist01','dist06-boss','b05-boss','a11-boss'].includes(o.id)))for(const mode of ['STORY','DREAM']){
    const raw=B.actor(owner.zone,owner.id);if(!raw){results.push({id:owner.id,zone:owner.zone,inactive:true});continue;}
    const s=T.initial();Object.assign(s,{practiceV31329:true,time:100,zone:owner.zone,x:18,y:16,hp:240,maxHp:240,gameModeV31346:mode,samongUnlockedRC91:true});
    const a=B.cloneEnemy(raw,owner.zone);Object.assign(a,{humanPhase0:false,fixedPhase:1,currentPhase:1,x:16,y:16,attackAt:0,readyAt:0,patternReadyAt:0,invulnerableUntil:0,combatEntryGraceUntilV31239:0,phaseTransitionUntil:0,recoverUntil:0});s.enemies=[a];
    const patterns=B.patterns(a,1),laser=patterns.find(p=>p.bloodV31516&&p.laserTypeV31331==='spiral')??patterns.find(p=>p.bloodV31516);
    if(!laser){problems.push({kind:'missing-laser',id:a.id});continue;}
    const cast=T.cast(s,a,laser,1);
    if(!cast?.laserV31330){problems.push({kind:'admission',id:a.id,canStart:blood.canStart(s,a)});continue;}
    const row={id:a.id,zone:s.zone,mode,end:cast.endAt,ordinaryReady:a.patternReadyAt,laserReady:a.laserReadyAtRC94,hp:a.hp,maxHp:a.maxHp};
    if(a.patternReadyAt>=cast.endAt+2||Math.abs(a.laserReadyAtRC94-cast.endAt-laser.cooldown*(window.__HAPIL_SAMONG_RC91__.enabled(s)?.5:1))>1e-8)problems.push({kind:'shared-cooldown',...row});
    s.time=cast.endAt+1.5;L.tick(s,.05);
    const retry=T.cast(s,a,laser,1);if(retry)problems.push({kind:'laser-cooldown-bypass',id:a.id});
    const cards=patterns.filter(p=>!p.bossFinaleV31334),picked=T.choose(s,a,cards,1,8,{ranged:true,desiredMin:2,desiredMax:15});
    const next=cards[picked];row.next=next?.name;row.nextLaser=!!(next?.laserV31330||next?.laserV31331);row.nextIsValid=!!next;
    if(row.nextLaser||!next)problems.push({kind:'unavailable-selected',...row});
    else{const before=(s.pendingHits?.length??0)+(s.hostileProjectiles?.length??0)+(s.narrativeCasts?.length??0);T.cast(s,a,next,1);row.ordinaryEvents=(s.pendingHits?.length??0)+(s.hostileProjectiles?.length??0)+(s.narrativeCasts?.length??0)-before;if(!row.ordinaryEvents&&!(a.attackAt>s.time))problems.push({kind:'ordinary-not-emitted',...row});}
    if(a.hp!==row.hp||a.maxHp!==row.maxHp)problems.push({kind:'hp-changed',id:a.id});
    results.push(row);templates.push({s,a,cast,owner});T.queue(cache,cast.beam,'eager');
   }
   await Promise.all(Object.values(cache).map(im=>im.decode?.()));
   const cv=document.createElement('canvas');cv.width=1536;cv.height=1056;const ctx=cv.getContext('2d',{willReadFrequently:true}),renderRows=[];
   const gallery=document.createElement('canvas');gallery.width=1200;gallery.height=4*230;const gc=gallery.getContext('2d');gc.fillStyle='#161928';gc.fillRect(0,0,gallery.width,gallery.height);
   const names=['two','spiral','star','hexagram','fan-sweep','death','sixsixsix','orbit-cross','cataclysm','rc72-sweep-08'];
   const chosen=['mb-dist01','dist06-boss','b05-boss','a11-boss'].map(id=>templates.find(t=>t.a.id===id)).filter(Boolean);
   for(const template of [templates[0],...chosen])for(const type of (stageOnly?[]:blood.types)) {
    const c={...template.cast,type};const at=c.fireAt+c.activeSeconds*.45,lines=blood.geometry(c,at).map(l=>({a:T.project(l.a.x,l.a.y),b:T.project(l.b.x,l.b.y)}));
    const hw=L.halfWidth(c),points=lines.flatMap(l=>[l.a,l.b]),left=Math.min(...points.map(p=>p.x))-hw*2-2,top=Math.min(...points.map(p=>p.y))-hw*2-2,right=Math.max(...points.map(p=>p.x))+hw*2+2,bottom=Math.max(...points.map(p=>p.y))+hw*2+2,zoom=Math.min((cv.width-40)/(right-left),(cv.height-40)/(bottom-top));ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.setTransform(zoom,0,0,zoom,20-left*zoom,20-top*zoom);ctx.globalAlpha=.83;ctx.globalCompositeOperation='source-over';
    const old=R.stats(),before=performance.now();R.render(ctx,lines,{width:hw,complex:R.complexType(c.type),color:c.color,accent:c.accent,image:cache[c.beam],alpha:.95,low:mobile});const ms=performance.now()-before,after=R.stats();
    const pixels=ctx.getImageData(0,0,cv.width,cv.height).data;let count=0;const colors=new Set();for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>32){count++;colors.add((pixels[i]>>3)+'/'+(pixels[i+1]>>3)+'/'+(pixels[i+2]>>3));}
    let samples=0,covered=0;for(const l of lines)for(const u of [.2,.5,.8]){const x=Math.round(20+(l.a.x+(l.b.x-l.a.x)*u-left)*zoom),y=Math.round(20+(l.a.y+(l.b.y-l.a.y)*u-top)*zoom);samples++;let hit=false;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<cv.width&&yy<cv.height&&pixels[(yy*cv.width+xx)*4+3]>20)hit=true;}if(hit)covered++;}
    const row={coverage:covered/samples,id:template.a.id,type,segments:lines.length,pixels:count,colors:colors.size,textured:after.textured-old.textured,ms};renderRows.push(row);
    if(row.coverage!==1||!count||row.textured!==1||colors.size<8||ctx.globalAlpha!==.83)problems.push({kind:'texture-render',...row,alpha:ctx.globalAlpha});
    const cacheBefore=R.stats();if(after.continuous>old.continuous){R.render(ctx,lines,{width:hw,complex:R.complexType(c.type),color:c.color,accent:c.accent,image:cache[c.beam],alpha:.95,low:mobile});if(R.stats().cached!==cacheBefore.cached+1)problems.push({kind:'static-cache',id:template.a.id,type});}
    const col=names.indexOf(type),ownerRow=chosen.indexOf(template);if(col>=0&&col<5&&ownerRow>=0){gc.drawImage(cv,0,0,1536,1056,col*240,ownerRow*230,240,198);gc.fillStyle='#ececf3';gc.font='12px sans-serif';gc.fillText(template.a.id+' '+type,col*240+5,ownerRow*230+220);}
   }
   window.__RC105_LASER_FIXTURES__=chosen;return{mobile,owners:results,renderRows,problems,stats:R.stats(),gallery:gallery.toDataURL('image/png')};
  },{mobile,stageOnly:!!process.env.HAPIL_QA_STAGE_ONLY});
  fs.writeFileSync(path.join(out,'lasers-'+(mobile?'mobile':'desktop')+'.png'),Buffer.from(result.gallery.split(',')[1],'base64'));delete result.gallery;
  fs.writeFileSync(path.join(out,'audit-'+(mobile?'mobile':'desktop')+'.json'),JSON.stringify(result,null,2));
  await page.getByRole('button',{name:'닫기 ×',exact:true}).click();await page.locator('.settings-layout').waitFor({state:'hidden'});const stage=await page.evaluate(async()=>{const T=window.__RC94_NATIVE__,C=window.__HAPIL_CONTROLS_V31329__,template=window.__RC105_LASER_FIXTURES__.find(t=>t.a.id==='dist06-boss'),s=template.s,cache={};s.time=template.cast.fireAt+template.cast.activeSeconds*.45;s.bossLaserCastsV31330=[{...template.cast,type:'spiral'}];s.hp=s.maxHp=100000;s.invulnerableUntil=s.time+999;s.activeHeroId='hwando';s.gameModeV31346='DREAM';C.binding.state.current=s;for(const p of [s.bossLaserCastsV31330[0].beam,T.N[s.zone].map])T.queue(cache,p,'eager');await Promise.all(Object.values(cache).map(im=>im.decode?.()));const canvas=document.querySelector('.game-stage canvas');window.__RC105_DRAW_FIXTURE__=(canvas,live)=>{const ctx=canvas.getContext('2d'),camera=T.camera(live.x,live.y,live),at={...live,time:template.cast.fireAt+template.cast.activeSeconds*.45};ctx.save();ctx.setTransform(canvas.width/1280,0,0,canvas.width/1280,0,0);ctx.translate(camera.x,camera.y);ctx.scale(camera.scale,camera.scale);window.__HAPIL_BLOOD_RC16__.draw(ctx,cache,at,{...template.cast,type:'spiral'},C.binding.settings.current);ctx.restore();};T.render(canvas,s,cache,T.heroes.find(h=>h.id==='hwando'),C.binding.settings.current);return{canvas:[canvas.width,canvas.height],camera:window.__HAPIL_VIEWPORT_RC104__?.last};});await page.waitForTimeout(500);assert.equal(await page.locator('.settings-layout:visible').count(),0);await page.screenshot({path:path.join(out,'native-stage-'+(mobile?'portrait':'pc')+'.png')});fs.writeFileSync(path.join(out,'native-stage-'+(mobile?'portrait':'pc')+'.json'),JSON.stringify(stage,null,2));
  console.log('RC94_NATIVE',JSON.stringify({mobile,owners:result.owners.length,active:result.owners.filter(r=>!r.inactive).length,renders:result.renderRows.length,problems:result.problems.slice(0,12),problemCount:result.problems.length,errors,missing}));
  assert.deepEqual(result.problems,[]);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await context.close();
 }
 }finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
