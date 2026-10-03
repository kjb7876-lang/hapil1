'use strict';
// Staged render fixtures are not natural play. Only the explicitly named startup
// observations below use unmodified live state, and they do not prove boss clears.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results'),'rc128-native');fs.mkdirSync(out,{recursive:true});
const bridge=`\nconst rc128OriginalRender=$n;$n=function(...a){const s=window.__RC128_FIXED_STATE__;if(s){a[1]=s;const hero=window.__HAPIL_RC95_NATIVE__?.heroes?.find(h=>h.id===s.activeHeroId);if(hero)a[3]=hero;}return rc128OriginalRender(...a);};window.__RC128_NATIVE__={initial:oi,project:G,queue:MONGSE_queueImage};`;
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(file.endsWith('/assets/index-v31526.js')?fs.readFileSync(file,'utf8')+bridge:fs.readFileSync(file));}catch{res.writeHead(404).end();}});
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const report={commit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),scope:'72 native staged render cases; 3 unmodified startup observations; no full-campaign or all-hero natural boss-clear claim',profiles:[],cases:[]};
 const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
 try{
  browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const[name,width,height,mobile]of[['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),errors=[],missing=[];
   page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400)missing.push({url:r.url(),status:r.status()});});
   await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');
   await page.waitForFunction(()=>window.__HAPIL_RC127_INSTALLED__&&window.__HAPIL_SAMONG_RC91__?.installed&&window.__HAPIL_FEEDBACK_RC128__?.installed);
   await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__);
   for(let i=0;i<12&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(100);}
   const live=()=>page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;return{zone:s.zone,time:s.time,hp:s.hp,hero:s.activeHeroId,mode:s.gameModeV31346,x:s.x,y:s.y,enemies:s.enemies.filter(a=>a.hp>0).length,speed:s.rc127MovementSpeed,feedback:window.__HAPIL_FEEDBACK_RC128__.snapshot(s)};});
   const first=await live();await page.keyboard.down('ArrowRight');await page.waitForTimeout(350);await page.keyboard.up('ArrowRight');await page.keyboard.down('a');await page.waitForTimeout(500);await page.keyboard.up('a');await page.waitForTimeout(600);const last=await live();
   assert(last.time>first.time,'unmodified startup must advance the simulation');assert(Number.isFinite(last.hp),'startup health remains finite');
   await page.screenshot({path:path.join(out,name+'-natural-start.png')});
   const profile={name,naturalStartup:{usedProgressCheats:false,scope:'startup and first combat only; not a boss-clear assertion',first,last},errors,missing};report.profiles.push(profile);save();
   const art=await page.evaluate(async()=>{const A=window.__HAPIL_SAMONG_RC91__,rows=[];for(const id of A.heroes){const image=new Image();image.src=A.art[id];await image.decode();rows.push({hero:id,width:image.naturalWidth,height:image.naturalHeight});A.picture(id);}return rows;});
   assert.equal(art.length,8);assert(art.every(a=>a.width>0&&a.height>0));profile.art=art;
   for(const hero of ['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner'])for(const mode of ['STORY','HELL','DREAM']){
    const fixture=await page.evaluate(({hero,mode})=>{
     const B=window.__HAPIL_RC86_BRIDGE__,T=window.__RC128_NATIVE__,A=window.__HAPIL_SAMONG_RC91__,F=window.__HAPIL_FEEDBACK_RC128__,s=T.initial(),template=B.actor('ep1b03','b03-boss');if(!template)throw Error('native boss fixture absent');const actor=B.cloneEnemy(template,'ep1b03');
     Object.assign(s,{zone:'ep1b03',time:100,x:24,y:23,hp:240,maxHp:240,activeHeroId:hero,gameModeV31346:mode,hellModeV31322:mode==='HELL',samongUnlockedRC91:true,practiceV31329:false,timeStopUntil:0});
     Object.assign(actor,{x:8,y:8,hp:actor.maxHp,staggerUntil:0,invulnerableUntil:0,phaseTransitionUntil:0});s.enemies=[actor];
     s.hp=0;const revived=A.tryRevive(s);if(!revived)s.hp=240;
     // Explicit synthetic journal packet for presentation testing only.
     F.record(s,actor,{epoch:1,sequence:1,kind:'OUTGOING',result:'HIT',targetId:actor.id,attackerHeroId:hero,source:{family:['hunter','gunner','neon'].includes(hero)?'projectile':'actor'},appliedDamage:20,hpBefore:100,hpAfter:80,criticalRequested:true},{});
     window.__RC128_FIXED_STATE__=s;
     return{hero,mode,revived,status:A.status(s),motif:F.heroes[hero].motif,color:F.heroes[hero].color};
    },{hero,mode});
    assert.equal(fixture.revived,mode==='DREAM');await page.waitForTimeout(180);
    const view=await page.evaluate(()=>{
     const s=window.__RC128_FIXED_STATE__,canvas=document.querySelector('.game-stage > canvas'),F=window.__HAPIL_FEEDBACK_RC128__;if(!canvas)throw Error('native canvas missing');
     const p=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let colored=0,painted=0;for(let i=0;i<p.length;i+=16){if(p[i+3]>0)painted++;if(p[i+3]>180&&Math.max(p[i],p[i+1],p[i+2])-Math.min(p[i],p[i+1],p[i+2])>35)colored++;}
     return{coloredSamples:colored,paintedSamples:painted,canvas:{width:canvas.width,height:canvas.height},feedback:F.snapshot(s),active:window.__HAPIL_SAMONG_RC91__.active(s)};
    });
    assert(view.paintedSamples>1000,'actual native frame is painted');assert.equal(view.feedback.totals.drawErrors,0,'presentation must not throw');
    if(mode==='DREAM')assert(view.coloredSamples>20,'owner color survives the monochrome pass');
    await page.screenshot({path:path.join(out,`${name}-${mode.toLowerCase()}-${hero}.png`)});
    report.cases.push({...fixture,profile:name,view,scope:'staged native renderer, not natural gameplay'});save();
   }
   await page.evaluate(()=>{delete window.__RC128_FIXED_STATE__;});await page.waitForTimeout(300);const resumed=await live();profile.resumed=resumed;
   assert(Number.isFinite(resumed.time),'live state remains usable after overlays');assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);profile.feedback=await page.evaluate(()=>window.__HAPIL_FEEDBACK_RC128__.snapshot());save();
   console.log('RC128_PROFILE_RESULT',JSON.stringify({name,cases:report.cases.filter(c=>c.profile===name).length,naturalStartup:profile.naturalStartup,art,errors,missing,feedback:profile.feedback}));
   await context.close();
  }
  assert.equal(report.cases.length,72);report.status='passed';console.log('RC128_BROWSER_RESULT',JSON.stringify({status:report.status,cases:report.cases.length,profiles:report.profiles.length,scope:report.scope}));
 }finally{save();await browser?.close();server.close();}
}
main().catch(error=>{console.error(error);server.close();process.exitCode=1;});
