'use strict';
// Staged native runtime regression. Not a claim of natural full-campaign completion.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results'),'rc127');fs.mkdirSync(out,{recursive:true});
const bridge=`\nconst rc127OriginalRender=$n;$n=function(...a){if(window.__RC127_FIXED_STATE__)a[1]=window.__RC127_FIXED_STATE__;return rc127OriginalRender(...a);};window.__RC127_NATIVE__={initial:oi,project:G,queue:MONGSE_queueImage,mastery:gr,impact:(...a)=>MONGSE_spawnTelegraphedImpact(...a),phase:(...a)=>MONGSE_enemyActivePhase(...a),save:(...a)=>Fi(...a),normalize:(...a)=>ji(...a)};`;
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(file.endsWith('/assets/index-v31526.js')?fs.readFileSync(file,'utf8')+bridge:fs.readFileSync(file));}catch{res.writeHead(404).end();}});
async function main(){await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const report={commit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),scope:'Native staged fixtures on desktop and mobile emulation, not full natural play',profiles:[]};
try{browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
for(const [name,width,height,mobile]of[['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400)missing.push({url:r.url(),status:r.status()});});
 await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__HAPIL_RC127_INSTALLED__&&window.__HAPIL_ARSENAL_V31318__?.installed);
 await page.keyboard.press('Escape');await page.evaluate(()=>window.__HAPIL_SAMONG_RC91__.unlock(null,'777'));await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('[data-game-mode-v31354="DREAM"]').click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__);
 for(let i=0;i<12&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(100);}
 const result=await page.evaluate(async()=>{
  const P=window.__HAPIL_POLICY_RC127__,D=window.__HAPIL_DARK_JELLY_RC127__,C=window.__HAPIL_SKILL_COMPLETION_V31412__,T=window.__RC127_NATIVE__,B=window.__HAPIL_RC86_BRIDGE__,L=window.__HAPIL_LUCIFER_V31318__,A=window.__HAPIL_ARSENAL_V31318__,F=window.__HAPIL_COMBAT_FLOW_RC95__,N=window.__HAPIL_RC95_NATIVE__,problems=[],casts=[],palettes=[];let checks=0;
  const test=(ok,label,extra={})=>{checks++;if(!ok)problems.push({label,...extra});},close=(a,b)=>Math.abs(a-b)<1e-6;
  const master=window.__HAPIL_PROGRESSION_V31338__.master({}),reference=4.75*(1+master.speed*.07)*T.mastery('hwando',master.heroMastery_hwando).speedMultiplier;
  test(close(reference,P.fixedSpeed),'actual native 777 mastery reference',{reference,fixed:P.fixedSpeed});
  for(const hero of N.heroes)for(const mode of ['STORY','HELL','DREAM'])for(const awake of [false,true]){const s={activeHeroId:hero.id,gameModeV31346:mode};test(close(P.speed(s,master,{mastery:7,awakened:awake,awakeningMultiplier:1.276}),reference),'all hero/mode ordinary speeds equal');}
  function make(zone,id,mode='STORY'){
   const template=B.actor(zone,id);if(!template)throw Error('missing real actor '+id);const s=T.initial(),a=B.cloneEnemy(template,zone);
   Object.assign(s,{zone,time:100,hp:10000,maxHp:10000,x:24,y:23,activeHeroId:'hwando',gameModeV31346:mode,practiceV31329:true,enemySkillsSuppressedUntilV31309:0,timeStopUntil:0});
   Object.assign(a,{x:8,y:8,hp:a.maxHp,humanPhase0:false,fixedPhase:1,currentPhase:1,attackAt:0,attackStarted:0,readyAt:0,patternReadyAt:0,recoverUntil:0,atomicCastUntil31210:0,staggerUntil:0,invulnerableUntil:0,phaseTransitionUntil:0,combatEntryGraceUntilV31239:0});s.enemies=[a];return{s,a};
  }
  function cosmic(mode='STORY'){const f=make('ep1a11','a11-boss',mode);f.a.hp=0;test(L.beforeDeath(f.s,f.a)===true,'native mask death creates cosmic form');const a=f.s.enemies.find(x=>x.cosmicLuciferV31318);if(!a)throw Error('native cosmic form absent');f.s.time=105;a.readyAt=a.patternReadyAt=a.recoverUntil=a.staggerUntil=0;a.cosmicArsenalReadyAtV31318=0;return{s:f.s,a};}
  for(const mode of ['STORY','HELL','DREAM'])for(const action of A.modes){
   const {s,a}=cosmic(mode),now=s.time,plan=A.plan(s,a,action),before=A.metrics(),result=A.trySchedule(s,a,action);
   test(!!result,'native cosmic action admitted',{mode,action});
   test(s.effects.some(e=>e.cosmicCueV31318&&e.cosmicModeV31318===action),'explicit action not overwritten by global phase',{mode,action});
   const expected=mode==='STORY'?2:1;test(close(a.cosmicArsenalReadyAtV31318-now,(plan.last+plan.recovery)*expected),'cosmic actual cooldown is story-only 2x',{mode,action,actual:a.cosmicArsenalReadyAtV31318-now,expected:(plan.last+plan.recovery)*expected});
   const originalTimes=s.pendingHits.map(h=>h.at),shots=s.hostileProjectiles.filter(q=>q.cosmicShotV31318);
   if(action==='reliquary')test(originalTimes.length===5&&originalTimes.every((v,i)=>close(v,now+2.3+i*.6)),'five .6-second reliquary drops retained');
   if(action==='blood-beam')test(originalTimes.length===1&&close(originalTimes[0],now+3.8),'blood beam windup unchanged');
   if(action==='abyss-fan')test(shots.length===24&&shots.every(q=>close(q.cosmicReleaseV31318,now+1.55+q.cosmicBeatV31318*.58)),'24 cosmic lances retain two release beats');
   // A cloned queue entry is what the real delay pipeline may hand back to sync.
   if(s.pendingHits.length){s.pendingHits=s.pendingHits.map(h=>({...h,at:h.at+1.2,impactAt:h.at+1.2}));A.sync(s);const last=Math.max(...s.pendingHits.map(h=>h.at));test(s.pendingHits.every(h=>h.interruptProtectedUntil31210>=last+plan.recovery),'delayed actual packets keep full interrupt protection',{mode,action});C.observe(s);a.staggerUntil=s.time+.2;test(C.protectEnemyStagger(s,a),'cosmic stagger cannot end committed cast');a.staggerUntil=0;}
   else{s.timeStopUntil=s.time+.75;A.tick(s);test(s.hostileProjectiles.filter(q=>q.cosmicShotV31318).length===24,'time stop preserves unlaunched cosmic lances');s.timeStopUntil=0;}
   s.enemySkillsSuppressedUntilV31309=s.time+.3;s.time+=.1;A.tick(s);test(A.metrics().cancelled===before.cancelled,'temporary suppression cannot cancel committed cosmic cast');s.enemySkillsSuppressedUntilV31309=0;
   if(s.pendingHits.length){const hits=s.pendingHits.slice();for(const h of hits){s.time=Math.max(s.time,h.at+.01);s.pendingHits=s.pendingHits.filter(v=>v.id!==h.id);T.impact(s,h);A.tick(s);}test(s.effects.some(e=>e.cosmicImpactV31318),'final cosmic impact reaches real VFX path',{mode,action});}
   else{const last=Math.max(...shots.map(q=>q.motionReleaseAt31219));s.time=last+.1;A.tick(s);test(shots.every(q=>q.bodySpawned31219===true),'all delayed cosmic lances eventually launch');for(const q of shots){q.x+=q.vx*.7;q.y+=q.vy*.7;}}
   test(A.metrics().cancelled===before.cancelled,'cast reached final delivery without cancellation',{mode,action});
   casts.push({mode,action,shots:shots.length,hits:originalTimes.length,cooldown:a.cosmicArsenalReadyAtV31318-now,cancelled:A.metrics().cancelled-before.cancelled});
   if(mode==='STORY'&&action==='reliquary')window.__RC127_COSMIC_FIXTURE__=s;
   a.hp=0;A.tick(s);test(!A.active(s),'actual boss death still cancels/cleans committed cast');
  }
  // The death-cleanup tests deliberately remove their actors. Keep a separate LIVE render fixture.
  {const f=cosmic('STORY');A.trySchedule(f.s,f.a,'reliquary');const h=f.s.pendingHits[f.s.pendingHits.length-1];f.s.time=h.at+.01;f.s.pendingHits=[];T.impact(f.s,h);A.tick(f.s);window.__RC127_COSMIC_FIXTURE__=f.s;}
  const {s,a}=make('ep1b03','b03-boss');s.practiceV31329=false;F.tick(s,N,.016);const volley=s.hostileProjectiles.slice(),last=Math.max(...volley.map(q=>q.motionReleaseAt31219));test(volley.length>0,'native RC95 volley exists');test(close(F.frame(s).nextBullet-s.time,2*(Math.max(s.time+.72,last+.16)-s.time)),'story scheduler volley cooldown 2x, release times untouched');
  s.time=F.frame(s).nextBullet+.01;a.recoverUntil=0;F.tick(s,N,.016);const common=s.hostileProjectiles.find(q=>q.rc126CommonSprite);test(!!common,'native repeated special asset reaches common renderer');
  const cache={},im=T.queue(cache,'./assets/rc64/projectiles/danmaku-jellybean.webp','eager');await im.decode();
  const original=document.createElement('canvas');original.width=im.naturalWidth;original.height=im.naturalHeight;const oc=original.getContext('2d',{willReadFrequently:true});oc.drawImage(im,0,0);const pixels=oc.getImageData(0,0,original.width,original.height).data;
  for(const [zone,owner,color]of [['ep1a11','a11-cosmic-v31318','#e53b54'],['ep1b03','b03-boss','#5bcac8'],['ep1b06','b06-boss','#d6a545']]){
   const packet={sourceId:owner,rc127Zone:zone},canvas=D.tint(im,color,packet),out=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,original.width,original.height).data;let alphaDiff=0,rgbDiff=0,transparent=0,mean=0,count=0;
   for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]!==out[i+3])alphaDiff++;if(!pixels[i+3])transparent++;else{count++;mean+=out[i]*.2126+out[i+1]*.7152+out[i+2]*.0722;if(Math.abs(pixels[i]-out[i])+Math.abs(pixels[i+1]-out[i+1])+Math.abs(pixels[i+2]-out[i+2])>30)rgbDiff++;}}
   test(alphaDiff===0&&transparent>0,'alpha remains exact with transparent corners',{zone,alphaDiff});test(rgbDiff>count*.5,'material actually changed',{zone,rgbDiff,count});test(canvas===D.tint(im,color,packet),'material cache reused');palettes.push({zone,owner,alphaDiff,rgbDiff,meanLuma:mean/count,palette:D.palette(packet,color)});
  }
  if(common){const V=window.__HAPIL_PROJECTILE_PIPELINE_V31402__.create({queue:T.queue,bindBitmap:()=>{},angle:()=>0,project:T.project}),canvas=document.createElement('canvas');canvas.width=1200;canvas.height=900;s.time=Math.max(...s.hostileProjectiles.map(q=>q.motionReleaseAt31219))+.6;for(const q of s.hostileProjectiles){const dt=Math.max(0,s.time-q.motionReleaseAt31219);q.x+=q.vx*dt;q.y+=q.vy*dt;T.queue(cache,q.rc126CommonSprite??q.sprite,'eager');}await Promise.all(Object.values(cache).map(v=>v.decode?.()));test(V.drawImageOnly(canvas.getContext('2d'),cache,common,s.time,{}),'actual common pipeline renders');test(common.bitmapPathV31355===common.rc126CommonSprite,'common bitmap identity remains correct');window.__RC127_JELLY_FIXTURE__=s;}
  return{checks,problems,casts,palettes,reference,policy:P.snapshot(),material:D.snapshot()};
 });
 for(const [key,file]of[['__RC127_COSMIC_FIXTURE__','cosmic-final-delivery'],['__RC127_JELLY_FIXTURE__','dark-jelly']]){await page.evaluate(k=>{window.__RC127_FIXED_STATE__=window[k];},key);await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,name+'-'+file+'.png')});}
 Object.assign(result,{name,errors,missing});report.profiles.push(result);console.log('RC127_BROWSER_RESULT',JSON.stringify(result));fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));assert.deepEqual(result.problems,[]);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await context.close();
}
}finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser?.close();server.close();}}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
