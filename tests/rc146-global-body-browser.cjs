'use strict';
// Staged native-render matrix. HP and encounter actors are explicit fixtures.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/pw155/node_modules','playwright'));
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc146-global-body';fs.mkdirSync(out,{recursive:true});
const bridge='\nwindow.__RC146_QA__={initial:oi,actors:z=>N[z]?.enemies??[],roster:()=>Object.entries(N).flatMap(([zone,v])=>(v.enemies??[]).map(a=>{const c=window.__HAPIL_RC86_BRIDGE__.cloneEnemy(a,zone);return{zone,id:c.id,boss:!!c.boss,midboss:!!c.midboss,maxHp:c.maxHp,visualOnly:!!c.visualOnly,friendly:!!c.friendly,objectiveStructureV31238:!!c.objectiveStructureV31238,narrativeStructureV31238:!!c.narrativeStructureV31238,protectedNarrativeTargetV31307:!!c.protectedNarrativeTargetV31307}})),queue:MONGSE_queueImage,drawEnemy:Yn,drawDeath:Xn,point:G,fire:()=>window.__RC146_FIRE_CALLS__||0,resetFire:()=>{window.__RC146_FIRE_CALLS__=0}};const rc146Fire=MONGSE_drawFireTonguesRC144;MONGSE_drawFireTonguesRC144=function(...args){window.__RC146_FIRE_CALLS__=(window.__RC146_FIRE_CALLS__||0)+1;return rc146Fire.apply(this,args)};';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.wav':'audio/wav','.mp3':'audio/mpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');const bytes=fs.readFileSync(file);res.end(file.endsWith('/assets/index-v31526.js')?Buffer.concat([bytes,Buffer.from(bridge)]):bytes);}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const report={status:'running',staged:true,profiles:[]};try{
 browser=await chromium.launch({chromiumSandbox: true, executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--disable-dev-shm-usage']});
 for(const [name,w,h]of[['pc',1280,900],['portrait',390,844],['landscape',844,390]]){
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:name==='pc'?1:2,isMobile:name!=='pc',hasTouch:name!=='pc'}),row={name,errors:[],httpErrors:[]};
  if(process.env.RC146_CPU_THROTTLE){const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:Number(process.env.RC146_CPU_THROTTLE)});row.cpuThrottle=Number(process.env.RC146_CPU_THROTTLE);}
  page.on('pageerror',e=>row.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)row.httpErrors.push({status:r.status(),url:r.url()});});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__RC146_QA__&&window.__HAPIL_BODY_ASH_RC145__&&window.__HAPIL_LUCIFER_V31318__&&window.__HAPIL_ECHOES_V31368__&&window.__HAPIL_MEDIA_ART_RC133__?.ready,{timeout:60000});
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__&&window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game');
  for(let i=0;i<18&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(60);}
  const result=await page.evaluate(async()=>{
   const Q=window.__RC146_QA__,A=window.__HAPIL_BODY_ASH_RC145__,B=window.__HAPIL_RC86_BRIDGE__,C=window.__HAPIL_CONTROLS_V31329__,L=window.__HAPIL_LUCIFER_V31318__,E=window.__HAPIL_ECHOES_V31368__,M=window.__HAPIL_MEDIA_ART_RC133__,burn=window.__HAPIL_DEATH_BURN_RC144__,s=window.__MONGSE_QA_STATE__,cache=C.binding.cache.current;
   C.setMode('manual');Object.assign(s,{time:100,hp:240,maxHp:240,x:13.5,y:24.5,activeHeroId:'gunner',defeated:[],effects:[],hostileProjectiles:[],pendingHits:[],impactQueue:[],spawnedWaves:new Set([1,2,3,4])});
   const templates=[['ordinary','dist01',Q.actors('dist01').find(a=>!a.boss&&!a.midboss)],['midboss','dist01',Q.actors('dist01').find(a=>a.midboss)],['boss','ep1b02',Q.actors('ep1b02').find(a=>a.boss)]];
   if(templates.some(r=>!r[2]))throw Error('missing core rank fixture');
   const cases=templates.map(([kind,zone,template])=>({kind,zone,actor:B.cloneEnemy(template,zone)}));
   cases.push({kind:'lucifer',zone:'ep1a11',actor:L.makeActor(100)});
   const source=B.cloneEnemy(templates[0][2],'dist01');Object.assign(source,{id:'echo68-rc146',echoChildV31368:true,echoOwnerV31368:'b02-boss',echoZoneV31368:'ep1b02',echoColorV31368:'#d38b8b',hp:36,maxHp:36,sprite:source.sprite,x:20,y:15});cases.push({kind:'echo',zone:'ep1b02',actor:source});
   const persona=B.cloneEnemy(Q.actors('cult04').find(a=>a.id==='c104-boss'),'cult04');Object.assign(persona,{id:'inner-evil-rc133',rc133InnerBoss:true,sprite:M.frames[2],hp:100,maxHp:100,x:20,y:15});cases.push({kind:'persona',zone:'cult04',actor:persona});
   const rows=[],settings={...C.binding.settings.current,lowFx:false,showCombatInfo:true};
   for(const {kind,zone,actor}of cases){s.zone=zone;s.enemies=[actor];s.defeated=[];C.binding.state.current=s;Object.assign(actor,{x:20,y:15,hp:actor.maxHp,attackAt:0,recoverUntil:0,staggerUntil:0});
    const sprite=kind==='lucifer'?L.bodyPath(actor,s.time):actor.sprite;const image=kind==='persona'?M.picture(sprite):Q.queue(cache,sprite,'eager');if(!image?.complete||!image.naturalWidth)await image?.decode?.();
    if(!image?.naturalWidth)throw Error('body image unavailable '+kind+' '+sprite);
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d');
    const paint=()=>{ctx.clearRect(0,0,1280,720);if(kind==='echo')E.drawChild(ctx,cache,actor,s.time,settings,s);else Q.drawEnemy(ctx,cache,actor,s.time,settings);};
    Q.resetFire();const before=A.metrics().livingFrames;paint();const healthy=A.metrics().livingFrames-before;
    actor.hp=Math.max(1,Math.round(actor.maxHp*.35));paint();const wounded=A.metrics().livingFrames-before;
    actor.hp=Math.max(1,Math.round(actor.maxHp*.08));paint();const low=A.metrics().livingFrames-before,fireLiving=Q.fire(),lowPng=canvas.toDataURL('image/png');
    actor.hp=0;const admitted=burn.emit(s,actor),death=s.defeated.at(-1);if(!admitted||!death?.burnRC144)throw Error('death producer failed '+kind);
    const deathImage=kind==='persona'?M.picture(death.sprite):Q.queue(cache,death.sprite,'eager');if(!deathImage?.complete||!deathImage.naturalWidth)await deathImage?.decode?.();
    Q.resetFire();ctx.clearRect(0,0,1280,720);const deathBefore=A.metrics().deathFrames;Q.drawDeath(ctx,cache,death,death.born+death.duration*.45,settings);
    rows.push({kind,zone,id:actor.id,healthy,wounded,low,fireLiving,admitted,deathTarget:A.target(death),deathDuration:death.duration,deathFrames:A.metrics().deathFrames-deathBefore,fireDeath:Q.fire(),specialGeometry:!!death.cosmicBodyGeometryRC145,echoSize:death.echoBodySizeRC145??null,lowPng,deathPng:canvas.toDataURL('image/png')});
   }
   const roster=Q.roster(),eligible=roster.filter(a=>A.target(a)),missed=roster.filter(a=>a.maxHp>0&&!a.visualOnly&&!a.friendly&&!a.objectiveStructureV31238&&!a.narrativeStructureV31238&&!a.protectedNarrativeTargetV31307&&!A.target(a));
   s.zone='dist01';s.defeated=[];s.effects=[];s.enemies=Array.from({length:24},(_,i)=>{const a=B.cloneEnemy(templates[0][2],'dist01');Object.assign(a,{id:'rc146-stress-'+i,x:3+(i%8)*3.2,y:3+Math.floor(i/8)*6.4,hp:Math.max(1,a.maxHp*.08),attackAt:0});return a;});
   const stressCanvas=document.createElement('canvas');stressCanvas.width=1280;stressCanvas.height=720;const times=[];for(let i=0;i<5;i++)B.renderFrame(stressCanvas,s,cache,'gunner',settings);
   for(let i=0;i<60;i++){const start=performance.now();B.renderFrame(stressCanvas,s,cache,'gunner',settings);times.push(performance.now()-start);}times.sort((a,b)=>a-b);
   return{rows,roster:{total:roster.length,eligible:eligible.length,ordinary:eligible.filter(a=>!a.boss&&!a.midboss).length,midboss:eligible.filter(a=>a.midboss).length,boss:eligible.filter(a=>a.boss).length,missed},stress:{actors:24,frames:60,medianMs:times[30],p95Ms:times[57],heapMb:performance.memory?.usedJSHeapSize/1048576??null},metrics:A.metrics()};
  });
  for(const item of result.rows){for(const kind of ['low','death']){const encoded=item[kind+'Png'];fs.writeFileSync(path.join(out,`${name}-${item.kind}-${kind}.png`),Buffer.from(encoded.split(',')[1],'base64'));delete item[kind+'Png'];}
   assert(item.healthy===1&&item.wounded===2&&item.low===3,JSON.stringify(item));assert(item.fireLiving===0&&item.fireDeath===0,`${item.kind} double RC144 flames`);assert(item.admitted&&item.deathTarget&&item.deathDuration===.82&&item.deathFrames===1,`${item.kind} body ash missing`);
   if(item.kind==='lucifer')assert(item.specialGeometry,'Lucifer native geometry missing');if(item.kind==='echo')assert(item.echoSize>0,'echo native size missing');
  }
  assert(result.roster.ordinary>0&&result.roster.midboss>0&&result.roster.boss>0&&result.roster.missed.length===0,JSON.stringify(result.roster));
  assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);row.status='passed';row.result=result;report.profiles.push(row);await page.close();
  console.log('RC146_GLOBAL_BODY_PROFILE',JSON.stringify({name,classes:result.rows.map(x=>x.kind),roster:result.roster.total,eligible:result.roster.eligible,ordinary:result.roster.ordinary,midboss:result.roster.midboss,boss:result.roster.boss,stress:result.stress,errors:0,httpErrors:0}));
 }
 report.status='passed';
 }catch(e){report.status='failed';report.failure=e.stack||String(e);console.error(report.failure);process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser?.close();server.close();}})();
