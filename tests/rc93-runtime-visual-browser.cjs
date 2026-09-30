// Native bitmap/constructor audit. Isolated authored poses and boss cast fixtures
// are not natural campaign completion or real-phone performance evidence.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),os=require('node:os');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||path.join(os.tmpdir(),'hapil-rc93');fs.mkdirSync(out,{recursive:true});
const harness='\nwindow.__RC93_NATIVE__={F,N,initial:oi,heroPath:(...a)=>Tn(...a),heroOptions:(h,m,t,p)=>An({...Hn(m,t,!['+JSON.stringify('hwando')+','+JSON.stringify('gunner')+'].includes(h.id),En(h,m)),authoredTimeV31345:t},h,m,p),actor:(...a)=>Ln(...a),enemy:(...a)=>Yn(...a),queue:(...a)=>MONGSE_queueImage(...a),project:G,stepShot:(...a)=>MONGSE_stepSignatureProjectile31212(...a),drawShot:(...a)=>Jn(...a),cast:(...a)=>Ei(...a)};';
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(file.endsWith('index-v31526.js')?fs.readFileSync(file,'utf8')+harness:fs.readFileSync(file));}catch{res.writeHead(404).end();}
}).listen(0,'127.0.0.1');
(async()=>{const browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 for(const mobile of [true,false]){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile}),page=await context.newPage(),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
 await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__&&window.__HAPIL_SAMONG_RC91__?.installed);
 await page.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.actions.settings());
 const result=await page.evaluate(async mobile=>{
 const T=window.__RC93_NATIVE__,B=window.__HAPIL_RC86_BRIDGE__,cache={},settings={lowFx:mobile,reducedFlash:true,projectileLodSmartR1:mobile?0:2,showAttackTelegraphs:false};
 const paths=new Set(),heroRows=[],actorRows=[],shots=[],castRows=[],problems=[];
 const directions={front:[1,1,'s'],back:[-1,-1,'n'],left:[-1,1,'w'],right:[1,-1,'e']};
 for(const hero of [...T.F].filter(h=>window.__HAPIL_POLICY_V31400__.has(h.id)).reverse())for(const [dir,[dx,dy,sector]] of Object.entries(directions))for(const kind of ['idle','move','attack','skill','ultimate','guard','dash','hurt','charge'])for(const part of [.08,.42,.86]){
  const motion={kind,direction:dir,dx,dy,facing:dir==='left'||dir==='back'?-1:1,phase:part*7,started:10,until:11,skillIndex:3,characterCommitV31342:{sector}};
  const time=10+part,p=T.heroPath(hero,motion,time),o=T.heroOptions(hero,motion,time,p);paths.add(p);
  if(o.canonicalHeroRC5)paths.add(window.__HAPIL_HERO_CONSISTENCY_RC5__.sheets[hero.id][o.canonicalHeroRC5.sheet]);
  if(o.heroSpearRC13)paths.add(window.__HAPIL_RENDER_RC13__.poses[o.heroSpearRC13.sector]);
  heroRows.push({hero:hero.id,dir,kind,part,p,o});
 }
 for(const [zone,map] of Object.entries(T.N).reverse())for(const row of map.enemies??[]){
  if(row.visualOnly||row.objectiveStructureV31238||row.narrativeStructureV31238)continue;
  const template=B.cloneEnemy(row,zone);for(const phase of template.humanPhase0?[0,1,2,3]:[1,2,3])for(const pose of ['idle','move','attack']){
   const a={...template,x:16,y:16,humanPhase0:phase===0,fixedPhase:phase,currentPhase:phase,time:10,movePhase:1,moveDx:1,moveDy:0};
   if(pose==='move')a.movingUntil=11;
   if(pose==='attack')Object.assign(a,{attackAt:11,attackStarted:9.8,attackImpactAt:10.4,recoverUntil:10.8,attackDx:1,attackDy:0});
   const p=B.phaseSprite(cache,a,10);paths.add(p);actorRows.push({zone,id:row.id,phase,pose,a,p});
  }
  if(!template.boss&&!template.midboss)continue;
  const profile=B.signatureProfile(template);if(!profile)continue;
  for(const phase of template.humanPhase0?[0,1,2,3]:[1,2,3]){
   const s=T.initial();Object.assign(s,{time:100,zone,x:16,y:18,hp:240,maxHp:240,activeHeroId:'hwando',gameModeV31346:'STORY'});
   const a=B.cloneEnemy(row,zone);Object.assign(a,{x:16,y:16,humanPhase0:phase===0,fixedPhase:phase,currentPhase:phase,phaseTransitionUntil:0,attackAt:0,recoverUntil:0,signatureFollowupCycle31212:0});s.enemies=[a];
   for(let cycle=0;cycle<12;cycle++){
    a.signatureFollowupCycle31212=cycle;try{const emitted=B.signatureAttack(s,a);if(emitted)castRows.push({zone,id:a.id,phase,...emitted});}catch(e){problems.push({kind:'cast',zone,id:a.id,phase,error:String(e)});}
   }
   for(const p of s.hostileProjectiles??[]){if(p.sprite)paths.add(p.sprite);if(p.danmakuArtV31316)paths.add(p.danmakuArtV31316);shots.push({s,p,zone,id:a.id,phase});}
  }
 }
 // Browser decoding is stricter than file-existence checks. Batch the original
 // queue promises, retaining this isolated cache instead of altering game cache.
 for(const p of Object.keys(cache))paths.add(p);
 const all=[...paths].filter(p=>typeof p==='string');for(let i=0;i<all.length;i+=24)await Promise.all(all.slice(i,i+24).map(async p=>{const im=T.queue(cache,p,'eager');try{if(typeof im.decode==='function')await im.decode();else if(!(im.width>0&&im.height>0))throw Error('empty native composite canvas');}catch(e){problems.push({kind:'decode',p,error:String(e)});}}));
 const cv=document.createElement('canvas');cv.width=512;cv.height=576;const ctx=cv.getContext('2d',{willReadFrequently:true}),origin=T.project(16,16);
 const trace=[];const draw=ctx.drawImage.bind(ctx);ctx.drawImage=(im,...a)=>{trace.push({src:im.src??'[canvas]',args:a});if(!a.every(Number.isFinite))throw Error('nonfinite bitmap geometry');return draw(im,...a);};
 function paint(fn){ctx.resetTransform();ctx.clearRect(0,0,cv.width,cv.height);ctx.translate(256-origin.x,480-origin.y);ctx.globalAlpha=.83;ctx.globalCompositeOperation='source-over';ctx.filter='none';const before=ctx.getTransform();trace.length=0;fn();const after=ctx.getTransform(),pixels=ctx.getImageData(0,0,cv.width,cv.height).data;let count=0,left=cv.width,right=-1,top=cv.height,bottom=-1;for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(pixels[(y*cv.width+x)*4+3]>=20){count++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  return{count,left,right,top,bottom,bitmaps:trace.length,restored:[before.a,before.b,before.c,before.d,before.e,before.f].every((n,i)=>Math.abs(n-[after.a,after.b,after.c,after.d,after.e,after.f][i])<1e-7)&&Math.abs(ctx.globalAlpha-.83)<1e-7&&ctx.filter==='none',sources:trace.map(r=>r.src)};
 }
 // Live owner remapping and atlas composition can request different bytes than
 // descriptor.sprite. Warm the genuine draw paths, decode those requests, then
 // assert the final render rather than accepting a loading fallback as success.
 for(const r of heroRows)T.actor(ctx,cache,r.p,16,16,66,r.o);
 for(const r of actorRows)T.enemy(ctx,cache,r.a,10,settings);
 for(const {p} of shots)T.drawShot(ctx,cache,p,Math.max(p.born??100,p.motionReleaseAt31219??0,p.frozenUntil??0)+.6,settings);
 const late=Object.keys(cache).filter(p=>!paths.has(p));for(let i=0;i<late.length;i+=24)await Promise.all(late.slice(i,i+24).map(async p=>{const im=T.queue(cache,p,'eager');if(typeof im.decode==='function')await im.decode();}));
 const heroes=[];for(const r of heroRows){try{const q=paint(()=>T.actor(ctx,cache,r.p,16,16,66,r.o));heroes.push({...r,o:undefined,...q});if(!q.count||!q.bitmaps||!q.restored)problems.push({kind:'hero',hero:r.hero,dir:r.dir,pose:r.kind,part:r.part,...q});}catch(e){problems.push({kind:'hero-error',hero:r.hero,dir:r.dir,pose:r.kind,error:String(e)});}}
 const actors=[];for(const r of actorRows){try{const q=paint(()=>T.enemy(ctx,cache,r.a,10,settings));actors.push({zone:r.zone,id:r.id,phase:r.phase,pose:r.pose,p:r.p,...q});if(!q.count||!q.bitmaps||!q.restored||q.top===0||q.bottom===cv.height-1||q.left===0||q.right===cv.width-1)problems.push({kind:'actor',zone:r.zone,id:r.id,phase:r.phase,pose:r.pose,...q});}catch(e){problems.push({kind:'actor-error',zone:r.zone,id:r.id,phase:r.phase,error:String(e)});}}
 const shotDiagnostics=[];let drawnShots=0,movingShots=0,heldShots=0;for(const {s,p,zone,id,phase} of shots){try{const x=p.x,y=p.y;s.time=Math.max(s.time,p.born??0,p.motionReleaseAt31219??0,p.collisionDisabledUntil31219??0,p.frozenUntil??0)+.5;T.stepShot(s,p,.1);const moving=Math.hypot(p.x-x,p.y-y)>1e-6;if(moving)movingShots++;else heldShots++;
  const at=T.project(p.x,p.y),q=paint(()=>{ctx.translate(origin.x-at.x,origin.y-at.y);T.drawShot(ctx,cache,p,s.time,settings);ctx.translate(at.x-origin.x,at.y-origin.y);});if(q.bitmaps)drawnShots++;if(![p.x,p.y,p.vx,p.vy].every(Number.isFinite)||!q.restored||window.__HAPIL_PROJECTILE_PIPELINE_V31402__.contactEnabled(p,s.time)&&!q.bitmaps)problems.push({kind:'shot',zone,id,phase,sprite:p.sprite,details:{ready:T.queue(cache,p.sprite)?.complete,p,now:s.time},...q});
 if(shotDiagnostics.length<5)shotDiagnostics.push({...q,sprite:p.sprite,ready:T.queue(cache,p.sprite)?.complete,visible:window.__HAPIL_PROJECTILE_PIPELINE_V31402__.visible(p,s.time)});
 }catch(e){problems.push({kind:'shot-error',zone,id,phase,error:String(e)});}}
 // The outer native Danmaku dispatch must respect visibility and bitmap-only
 // mirror delivery, even when it keeps the Danmaku classification after copy.
 const original=shots[0],mirror={...original.p,danmakuV31316:true,danmakuOwnerIdV31316:original.id,danmakuZoneV31316:original.zone,danmakuArtV31316:original.p.sprite,danmakuHeadingV31316:0,bodySpawned31219:true,danmakuLaunchedAtV31316:100,dreamReflectedV31346:true,born:100,x:16,y:16};
 let primitives=0;const arc=ctx.arc.bind(ctx);ctx.arc=(...a)=>{primitives++;return arc(...a);};
 const mirrors=[];for(const flag of ['dreamReflectedV31346','hellMirrorV31322','dreamMirrorProjectileV31347']){primitives=0;const p={...mirror,dreamReflectedV31346:false,[flag]:true},q=paint(()=>T.drawShot(ctx,cache,p,101,{...settings,lowFx:false}));mirrors.push({flag,...q,primitives});if(!q.bitmaps||primitives)problems.push({kind:'mirror',flag,primitives,...q});}
 for(const status of ['future','removed','contacted','boundary']){const p={...mirror,dreamReflectedV31346:false};if(status==='future')p.born=102;if(status==='removed')p.projectileRemovalReason31215='owner-cleanup';if(status==='contacted')p.reachedHero31213=true;if(status==='boundary')p.reachedMapBoundary31213=true;const q=paint(()=>T.drawShot(ctx,cache,p,101,settings));if(q.count||q.bitmaps)problems.push({kind:'hidden-shot',status,...q});}
 // Review sheets are captured from the genuine renderer, including its atlas
 // crop/pose logic. The PNGs are QA evidence, not replacement game artwork.
 function gallery(rows,columns,label,render){const g=document.createElement('canvas');g.width=columns*128;g.height=Math.ceil(rows.length/columns)*128;const c=g.getContext('2d');c.fillStyle='#202436';c.fillRect(0,0,g.width,g.height);rows.forEach((r,i)=>{const q=paint(()=>render(r));if(!q.count)return;const w=q.right-q.left+1,h=q.bottom-q.top+1,k=Math.min(112/w,98/h),x=i%columns*128,y=Math.floor(i/columns)*128;c.drawImage(cv,q.left,q.top,w,h,x+(128-w*k)/2,y+8+(98-h*k)/2,w*k,h*k);c.fillStyle='#e4e8f4';c.font='10px sans-serif';c.textAlign='center';c.fillText(label(r),x+64,y+120,126);});return g.toDataURL('image/png');}
 const heroGallery=gallery(heroRows.filter(r=>r.part===.42&&['idle','move','attack','skill'].includes(r.kind)),16,r=>r.hero+' '+r.dir+' '+r.kind,r=>T.actor(ctx,cache,r.p,16,16,66,r.o));
 const bossGallery=gallery(actorRows.filter(r=>r.phase===3&&r.pose==='attack'&&(r.a.boss||r.a.midboss)),8,r=>r.zone+'/'+r.id,r=>T.enemy(ctx,cache,r.a,10,settings));
 return{mobile,heroes,actors,castRows,assets:all.length+late.length,shots:shots.length,drawnShots,movingShots,heldShots,mirrors,shotDiagnostics,problems,galleries:{heroes:heroGallery,bosses:bossGallery}};
 },mobile);
 for(const [name,data]of Object.entries(result.galleries))fs.writeFileSync(path.join(out,name+'-'+(mobile?'mobile':'desktop')+'.png'),Buffer.from(data.split(',')[1],'base64'));delete result.galleries;
 fs.writeFileSync(path.join(out,'audit-'+(mobile?'mobile':'desktop')+'.json'),JSON.stringify(result,null,2));
 console.log('RC93_NATIVE_VISUAL',JSON.stringify({mobile,heroCases:result.heroes.length,actorCases:result.actors.length,casts:result.castRows.length,assets:result.assets,shots:result.shots,drawnShots:result.drawnShots,movingShots:result.movingShots,heldShots:result.heldShots,problems:result.problems.slice(0,15),problemCount:result.problems.length,pageErrors:errors.length,missing:missing.length}));
 assert.deepEqual(result.problems,[]);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await context.close();
 }
 }finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
