'use strict';

// Actual Skia raster execution of the native RC13 scope + RC71 Danmaku painter.
// Queue/tint/owner services are fixtures; gameplay/contact invariants remain exact.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createCanvas,loadImage}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||process.env.NODE_PATH,'@napi-rs/canvas'));
const rootPath=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT;
const source=fs.readFileSync(path.join(rootPath,'assets/index-v31526.js'),'utf8'),root={};
root.window=root;Object.assign(root,{Math,Number,Object,Map,WeakMap,Set,Array,Uint8ClampedArray,Uint16Array,performance:require('node:perf_hooks').performance,document:{createElement:()=>createCanvas(1,1)}});vm.createContext(root);
for(const file of ['assets/combat-v31402/projectile-pipeline.js','assets/rc210/projectile-balance.js','assets/rc232/projectile-readability.js'])vm.runInContext(fs.readFileSync(path.join(rootPath,file),'utf8'),root,{filename:file});
const start=source.indexOf('var HAPIL_RC13_RENDER = (()=>{'),end=source.indexOf('\nfunction HAPIL_drawProjectileRC13(',start);assert(start>=0&&end>start);
vm.runInContext(source.slice(start,end)+'\nwindow.__HAPIL_RENDER_RC13__=HAPIL_RC13_RENDER;',root);
const painterStart=source.indexOf('  function drawShot(ctx,cache,q,time,settings={}) {'),painterEnd=source.indexOf('\n  function drawCue(',painterStart);assert(painterStart>0&&painterEnd>painterStart);
Object.assign(root,{hero:()=>false,ownerFor:q=>({zone:q.danmakuZoneV31316}),MONGSE_queueImage:(cache,key)=>cache[key],
  num:(v,d=0)=>Number.isFinite(v)?v:d,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),G:(x,y)=>({x:(x-y)*27,y:(x+y)*13.5}),
  MONGSE_skillFxOpacity:settings=>Number.isFinite(settings.skillFxOpacity)?settings.skillFxOpacity:1,tintShot:image=>image,stats:{rendered:0}});
vm.runInContext(source.slice(painterStart,painterEnd),root);
const R=root.__HAPIL_PROJECTILE_READABILITY_RC232__,B=root.__HAPIL_BULLET_BALANCE_RC210__,rows=[];let checks=0,lastImage;
const check=(pass,message)=>{assert(pass,message);checks++;};
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const imagePaths=['assets/rc64/projectiles/danmaku-jellybean.webp','assets/vfx/v31323/boss/b03-boss/envy_mirror_shard.webp',
 'assets/vfx/generated/v300/slash-impact.webp','assets/rc134/persona-skills/eye.png'];
function pixels(image){const canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);return ctx.getImageData(0,0,image.width,image.height).data;}
function canvas(){const c=createCanvas(640,360);c.getBoundingClientRect=()=>({width:640,height:360});return c;}
function q(path,extra={}){return{id:1,sourceId:'mb-dist01',danmakuZoneV31316:'dist01',danmakuV31316:true,danmakuArtV31316:path,
 bodySpawned31219:true,born:0,frozenUntil:0,motionReleaseAt31219:0,collisionDisabledUntil31219:0,x:0,y:0,vx:3,vy:1,damage:10,radius:.28,...extra};}
function native(ctx,cache,shot,time,settings){return B.draw(ctx,shot,time,root.G,p=>root.HAPIL_RC13_RENDER.scope(ctx,p,'projectile',view=>root.drawShot(view,cache,p,time,settings)));}
function render(image,shot,settings,enabled,floor,contactProbe=false){
 const c=canvas(),ctx=c.getContext('2d'),receipts=[];if(floor)ctx.drawImage(floor,0,0,c.width,c.height);
 ctx.translate(320,190);ctx.scale(.62,.62);ctx.__rc204ContactProbe=contactProbe;
 const base=ctx.drawImage.bind(ctx);ctx.drawImage=function(image,...args){receipts.push({source:image.currentSrc||image.src||'',styled:!!image.rc232SourceImage,args,
  matrix:['a','b','c','d','e','f'].map(k=>this.getTransform()[k]),alpha:this.globalAlpha});return base(image,...args);};
 const cache={[shot.danmakuArtV31316]:image},paint=()=>native(ctx,cache,shot,1,settings);
 if(enabled)R.draw(ctx,shot,1,settings,paint);else paint();
 return{canvas:c,rgba:c.getContext('2d').getImageData(0,0,c.width,c.height).data,receipts};
}
function contrast(rgba,bg){let signal=0,luminanceSignal=0,count=0;for(let i=0;i<rgba.length;i+=4){const delta=Math.abs(rgba[i]-bg[i])+Math.abs(rgba[i+1]-bg[i+1])+Math.abs(rgba[i+2]-bg[i+2]);signal+=delta;
 luminanceSignal+=Math.abs(.2126*(rgba[i]-bg[i])+.7152*(rgba[i+1]-bg[i+1])+.0722*(rgba[i+2]-bg[i+2]));if(delta>=36)count++;}return{signal,luminanceSignal,readablePixels:count};}
(async()=>{
 const floor=await loadImage(path.join(rootPath,'assets/maps/rc53/dist01-spider-cave.webp')),
  bg=canvas();bg.getContext('2d').drawImage(floor,0,0,bg.width,bg.height);const background=bg.getContext('2d').getImageData(0,0,bg.width,bg.height).data;
 for(const file of imagePaths){
  const bytes=fs.readFileSync(path.join(rootPath,file)),image=await loadImage(bytes);Object.defineProperty(image,'currentSrc',{value:'./'+file});lastImage=image;
  const before=pixels(image),styled=R.picture(image,4),after=pixels(styled);
  let changedRgb=0,alphaDifference=0;
  for(let i=0;i<before.length;i+=4){if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2])changedRgb++;if(before[i+3]!==after[i+3])alphaDifference++;}
  check(styled!==image&&changedRgb>0,'actual source receives an interior RGB contrast treatment '+file);
  check(R.picture(styled,4)===styled,'nested native draws cannot accumulate the contrast treatment '+file);
  check(alphaDifference===0,'source alpha is bit-exact '+file);
  check(JSON.stringify(root.HAPIL_RC13_RENDER.imageBounds(styled))===JSON.stringify(root.HAPIL_RC13_RENDER.imageBounds(image)),'native alpha silhouette bounds remain exact '+file);
  check(sha(fs.readFileSync(path.join(rootPath,file)))===sha(bytes),'source file bytes remain unchanged '+file);
  for(const settings of [{skillFxOpacity:1,lowFx:true,reducedFlash:true},{skillFxOpacity:.2,lowFx:true,reducedFlash:true},{skillFxOpacity:1,lowFx:false,reducedFlash:false}]){
   const shot=q('./'+file),world={zone:'dist01',time:1,hp:240,enemies:[{id:shot.sourceId,midboss:true}]};B.prepare(world,world.enemies[0],shot);
   const beforeShot=JSON.stringify(shot),base=render(image,{...shot},settings,false,floor),improved=render(image,{...shot},settings,true,floor),a=contrast(base.rgba,background),b=contrast(improved.rgba,background);
   check(JSON.stringify(shot)===beforeShot,'readability does not mutate native packet '+file);
   check(JSON.stringify(base.receipts.map(r=>({args:r.args,matrix:r.matrix})))===JSON.stringify(improved.receipts.map(r=>({args:r.args,matrix:r.matrix}))),'native draw geometry stays exact '+file);
   const raw=render(image,{...shot},settings,false,null,true),probe=render(image,{...shot},settings,true,null,true);
   check(Buffer.from(raw.rgba).equals(Buffer.from(probe.rgba)),'actual native bitmap/contact replay remains pixel-exact '+file);
   const zero=render(image,{...shot},{...settings,skillFxOpacity:0},true,null);
   check(zero.rgba.every((v,i)=>i%4!==3||v===0),'zero opacity remains truly invisible '+file);
   if(settings.skillFxOpacity===.2){check(b.signal>a.signal*1.5,'quiet dangerous body has materially stronger floor contrast '+file);check(b.readablePixels>a.readablePixels,'more actual body pixels remain readable '+file);}
   if(settings.skillFxOpacity===1&&!file.includes('/persona-skills/'))check(b.luminanceSignal>=a.luminanceSignal,'default original projectile luminance separation does not regress '+file);
   rows.push({file,settings,alphaDifference,changedRgb,sourceBytes:bytes.length,before:a,after:b,draws:improved.receipts.length,
    bodyAlpha:improved.receipts.at(-1)?.alpha,geometryExact:true,contactReplayExact:true});
  }
 }
 const warm=R.picture(lastImage,4),warmBefore=R.metrics();
 for(let i=0;i<64;i++)check(R.picture(lastImage,4)===warm,'warm style reuses the same actual raster');
 check(R.metrics().processedPixels===warmBefore.processedPixels&&R.metrics().cacheMisses===warmBefore.cacheMisses,'warm source/style never reallocates or rereads pixels');
 const testCtx=canvas().getContext('2d'),originalDraw=testCtx.drawImage;
 assert.throws(()=>R.draw(testCtx,q('sprite'),1,{},()=>{throw Error('native paint failure');}),/native paint failure/);checks++;
 check(testCtx.drawImage===originalDraw,'exception restores the exact scoped draw method');
 const trailContext=canvas().getContext('2d'),trailReceipts=[],trailBase=trailContext.drawImage.bind(trailContext);
 trailContext.drawImage=function(im,...args){trailReceipts.push({sameSource:im===lastImage,alpha:this.globalAlpha});return trailBase(im,...args);};
 R.draw(trailContext,q('sprite'),1,{skillFxOpacity:1},()=>{trailContext.globalAlpha=.2;trailContext.drawImage(lastImage,0,0,40,20);});
 check(trailReceipts.length===1&&trailReceipts[0].sameSource&&Math.abs(trailReceipts[0].alpha-.2)<.005,'faint decorative echoes keep original bitmap and opacity');
 const idleImage=await loadImage(path.join(rootPath,imagePaths[0])),idleCallbacks=[];
 root.requestIdleCallback=callback=>{idleCallbacks.push(callback);return idleCallbacks.length;};
 const coldBefore=R.metrics(),idleSettings={skillFxOpacity:1,lowFx:true,reducedFlash:true};
 let cold;
 for(let i=0;i<3;i++)cold=render(idleImage,q('idle-source'),idleSettings,true,null);
 check(idleCallbacks.length===1&&R.metrics().pendingStyles===1,'cold released source/style schedules a single idle job');
 check(R.metrics().processedPixels===coldBefore.processedPixels&&R.metrics().cacheMisses===coldBefore.cacheMisses,'actual cold native flight frame performs no readability pixel pass');
 check(cold.receipts.length===1&&!cold.receipts[0].styled&&cold.receipts[0].alpha>.85,'cold native body remains present at essential alpha');
 idleCallbacks[0]();
 const warmed=render(idleImage,q('idle-source'),idleSettings,true,null);
 check(warmed.receipts.length===1&&warmed.receipts[0].styled&&R.metrics().pendingStyles===0,'next native body reuses completed idle raster');
 delete root.requestIdleCallback;
 const fallbackImage=await loadImage(path.join(rootPath,imagePaths[1])),timers=[];
 root.setTimeout=(callback,delay)=>{timers.push({callback,delay});return timers.length;};
 const fallbackBefore=R.metrics();let fallbackCold;
 for(let i=0;i<3;i++)fallbackCold=render(fallbackImage,q('timer-source'),idleSettings,true,null);
 check(timers.length===1&&timers[0].delay===0&&R.metrics().pendingStyles===1,'without idle callbacks one timer prepares each source/style');
 check(R.metrics().processedPixels===fallbackBefore.processedPixels&&R.metrics().cacheMisses===fallbackBefore.cacheMisses,'timer fallback does not process pixels in the combat frame');
 check(fallbackCold.receipts.length===1&&!fallbackCold.receipts[0].styled&&fallbackCold.receipts[0].alpha>.85,'timer fallback immediately paints the native body');
 timers[0].callback();
 const fallbackWarm=render(fallbackImage,q('timer-source'),idleSettings,true,null);
 check(fallbackWarm.receipts.length===1&&fallbackWarm.receipts[0].styled&&R.metrics().pendingStyles===0,'timer fallback uses the prepared raster in later frames');
 delete root.setTimeout;
 const lifecycleSettings={skillFxOpacity:1,lowFx:true,reducedFlash:true};
 const terminal=render(lastImage,q('sprite',{projectileRemovalReason31215:'native-terminal'}),lifecycleSettings,true,null);
 check(terminal.receipts.length===0&&terminal.rgba.every((v,i)=>i%4!==3||v===0),'final RC71 bypass cannot resurrect a removed native body');
 const warning=q('sprite',{frozenUntil:2}),warningBase=render(lastImage,{...warning},lifecycleSettings,false,null),warningStyle=render(lastImage,{...warning},lifecycleSettings,true,null);
 check(Buffer.from(warningBase.rgba).equals(Buffer.from(warningStyle.rgba)),'pre-release native warning bitmap receives no contrast/opacity strengthening');
 const retained=render(lastImage,q('sprite',{expiresAt:.5,cancelled:true}),lifecycleSettings,true,null);
 check(retained.receipts.length>0,'nominal expiry and audio cancellation keep a still-live actual native body painted');
 const active=q('sprite'),original=JSON.stringify(active);
 for(const extra of [{frozenUntil:2},{motionReleaseAt31219:2},{collisionDisabledUntilV31226:2},{bodySpawned31219:false},
  {projectileRemovalReason31215:'boundary'},{reachedHero31213:true},{friendly:true},{reflected:true},{rc133InnerShot:true},
  {laserV31330:true},{pureTelegraphV31230:true},{canonAllyV31217:true},{canonicalAllyV31217:true},{impactHeroIdV31315:'hwando'},{ownerType:'hero'},{damage:0},{vx:NaN}])check(!R.released({...active,...extra},1),'warning/removed/allied/Persona/hazard exclusions '+JSON.stringify(extra));
 check(R.released({...active,expiresAt:.5,cancelled:true},1),'nominal expiry and audio cancellation cannot hide a still-live native flight');
 check(JSON.stringify(active)===original,'eligibility never mutates a packet');
 check(R.metrics().cacheBytes<=R.policy.cacheLimitBytes,'contrast raster cache obeys a finite mobile memory bound');
 const result={status:'passed',checks,scope:'Actual native RC13 + RC71 painter and Skia raster; queue/tint/owner fixtures, not browser/device/GPU evidence',
  nativeSourceSha256:sha(Buffer.from(source.slice(start,end)+source.slice(painterStart,painterEnd))),
  moduleSha256:sha(fs.readFileSync(path.join(rootPath,'assets/rc232/projectile-readability.js'))),rows,metrics:R.metrics(),policy:R.policy};
 if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'rc232-projectile-readability-unit.json'),JSON.stringify(result,null,2));}
 console.log('RC232_PROJECTILE_READABILITY_UNIT',JSON.stringify({status:result.status,checks,rows:rows.length,alphaExact:true,geometryExact:true,contactReplayExact:true,
  quietContrastRatios:rows.filter(r=>r.settings.skillFxOpacity===.2).map(r=>({file:r.file,signal:r.after.signal/r.before.signal,pixels:r.after.readablePixels/r.before.readablePixels})),metrics:R.metrics()}));
})().catch(error=>{console.error(error.stack||String(error));process.exitCode=1;});
