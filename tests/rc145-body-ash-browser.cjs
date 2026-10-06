'use strict';
// Staged pixel checks against the actual game art, including the ordinary-mob cache.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/pw155/node_modules','playwright'));
const root=path.resolve(__dirname,'..'),profile=process.env.RC145_PROFILE||'pc',output=process.env.HAPIL_QA_OUTPUT||'/tmp/rc145-body-ash';
const viewport={pc:[1280,900],portrait:[390,844],landscape:[844,390]}[profile];assert(viewport);fs.mkdirSync(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const report={profile,staged:true,status:'running',errors:[],httpErrors:[]};try{
 browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:viewport[0],height:viewport[1]},deviceScaleFactor:profile==='pc'?1:2,isMobile:profile!=='pc',hasTouch:profile!=='pc'});
 if(process.env.RC145_CPU_THROTTLE){const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:Number(process.env.RC145_CPU_THROTTLE)});report.cpuThrottle=Number(process.env.RC145_CPU_THROTTLE);}
 page.on('pageerror',e=>report.errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({url:r.url(),status:r.status()});});
 await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__HAPIL_BODY_ASH_RC145__&&window.__HAPIL_MEDIA_ART_RC133__?.ready,{timeout:60000});
 const sample=await page.evaluate(async()=>{
  const A=window.__HAPIL_BODY_ASH_RC145__,media=window.__HAPIL_MEDIA_ART_RC133__,cases=[
   {name:'mob',id:'dist01-sp1',path:'./assets/episode1a/nightmare_spider.webp',size:90},
   {name:'persona',id:'inner-evil-rc133',path:media.frames[2],size:122},
   {name:'persona-awake',id:'inner-evil-rc133',path:media.awakeFrames[2],size:122}
  ],out=[];
  const alpha=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let count=0;for(let i=3;i<d.length;i+=4)if(d[i]>30)count++;return count;};
  for(const row of cases){
   const im=row.id==='inner-evil-rc133'?media.picture(row.path):await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=row.path;});
   if(!im?.naturalWidth)throw Error('missing real body '+row.name+' '+row.path);
   const c=document.createElement('canvas');c.width=c.height=288;const ctx=c.getContext('2d'),center={x:144,y:166},actor={id:row.id,hp:100,maxHp:100};
   const drawBody=dctx=>{const h=row.size,w=h*im.naturalWidth/im.naturalHeight;dctx.drawImage(im,center.x-w/2,center.y-h*.96,w,h);};
   const fresh=()=>{ctx.clearRect(0,0,288,288);drawBody(ctx);return ctx.getImageData(0,0,288,288).data;},base=fresh();
   const living=[];
   for(const hp of [100,69,35,8,100]){
    ctx.clearRect(0,0,288,288);actor.hp=hp;A.living({ctx,actor,sprite:row.path,size:row.size,center,time:4,drawBody});
    const data=ctx.getImageData(0,0,288,288).data;let changed=0,outside=0;
    for(let i=0;i<data.length;i+=4){if(Math.abs(data[i]-base[i])+Math.abs(data[i+1]-base[i+1])+Math.abs(data[i+2]-base[i+2])>22&&data[i+3]>30)changed++;if(base[i+3]<=30&&data[i+3]>30)outside++;}
    living.push({hp,changed,outside,opaque:alpha(c),png:hp===35||hp===8?c.toDataURL('image/png'):null});
   }
   const death=[],before=A.metrics();
   for(const p of [0,.1,.25,.45,.7,.95,1]){
    ctx.clearRect(0,0,288,288);A.death({ctx,actor,sprite:row.path,size:row.size,center,progress:p,time:10+p,drawBody,ready:true,lowFx:false});
    death.push({progress:p,opaque:alpha(c),png:p===.45?c.toDataURL('image/png'):null});
   }
   out.push({name:row.name,path:row.path,sourcePixels:base.length/4,living,death,maskBuildDelta:A.metrics().maskBuilds-before.maskBuilds,metrics:A.metrics()});
  }
  const bench=[];const a=out[0],im=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=a.path;});const c=document.createElement('canvas');c.width=c.height=288;const ctx=c.getContext('2d'),actor={id:'dist01-sp1',hp:8,maxHp:100};
  for(let frame=0;frame<60;frame++){const start=performance.now();for(let n=0;n<6;n++){ctx.clearRect(0,0,288,288);A.living({ctx,actor,sprite:a.path,size:90,center:{x:144,y:166},time:frame/60,drawBody:d=>d.drawImage(im,110,66,68,100)});}bench.push(performance.now()-start);}
  const large=document.createElement('canvas');large.width=large.height=1024;const lctx=large.getContext('2d'),largeCenter={x:512,y:650},largeActor={id:'large-final-boss',boss:true,hp:35,maxHp:100},largeBody=d=>{d.fillStyle='#753b48';d.fillRect(380,265,264,385);};
  largeBody(lctx);const originalLarge=alpha(large);lctx.clearRect(0,0,1024,1024);A.living({ctx:lctx,actor:largeActor,sprite:'large-final-boss',size:387,center:largeCenter,time:3,drawBody:largeBody});const renderedLarge=alpha(large);
  const overlayProbe=[];A.reset();const baseMetrics=A.metrics();
  for(const center of [{x:144.25,y:166.25},{x:224.25,y:246.25}]){
   const surface=document.createElement('canvas');surface.width=surface.height=400;const painter=surface.getContext('2d'),mob={id:'cache-mob',hp:35,maxHp:100};
   const draw=d=>d.drawImage(im,center.x-34,center.y-100,68,100);
   draw(painter);const original=painter.getImageData(0,0,400,400).data;painter.clearRect(0,0,400,400);
   A.living({ctx:painter,actor:mob,sprite:a.path,size:90,center,time:4,drawBody:draw,cacheable:true});
   const burned=painter.getImageData(0,0,400,400).data;let outside=0,maxOutsideAlpha=0,changed=0;
   for(let i=0;i<burned.length;i+=4){if(original[i+3]<=30&&burned[i+3]>30){outside++;maxOutsideAlpha=Math.max(maxOutsideAlpha,burned[i+3]);}if(burned[i+3]>30&&Math.abs(burned[i]-original[i])+Math.abs(burned[i+1]-original[i+1])+Math.abs(burned[i+2]-original[i+2])>22)changed++;}
   painter.clearRect(0,0,400,400);mob.hp=100;A.living({ctx:painter,actor:mob,sprite:a.path,size:90,center,time:5,drawBody:draw,cacheable:true});
   const restored=painter.getImageData(0,0,400,400).data;let healedDifference=0;for(let i=0;i<restored.length;i++)if(restored[i]!==original[i])healedDifference++;
   overlayProbe.push({outside,maxOutsideAlpha,changed,healedDifference});
  }
  const overlayMetrics=A.metrics(),overlayDelta={builds:overlayMetrics.overlayBuilds-baseMetrics.overlayBuilds,hits:overlayMetrics.overlayHits-baseMetrics.overlayHits,bytes:overlayMetrics.overlayBytes};
  const synthetic={zone:'dist01',time:100};A.reset();A.sync(synthetic);const before=A.metrics().maskBuilds;
  for(let pass=0;pass<2;pass++)for(let n=0;n<10;n++){ctx.clearRect(0,0,288,288);A.death({ctx,actor:{id:'dead-'+n,sourceActorIdRC145:'dead-'+n,burnRC144:true},sprite:'distinct-body-'+n,size:90,center:{x:144,y:166},progress:.45,time:101,drawBody:d=>d.drawImage(im,110,66,68,100),ready:true,lowFx:false});}
  ctx.clearRect(0,0,288,288);A.living({ctx,actor:{id:'cache-reset-mob',hp:35,maxHp:100},sprite:a.path,size:90,center:{x:144,y:166},time:101,drawBody:d=>d.drawImage(im,110,66,68,100),cacheable:true});
  const stress={largeOriginal:originalLarge,largeRendered:renderedLarge,maskBuildDelta:A.metrics().maskBuilds-before,afterRepeat:A.metrics()};
  synthetic.zone='cult04';synthetic.time=102;A.sync(synthetic);stress.afterZone=A.metrics();
  bench.sort((x,y)=>x-y);return{cases:out,bench:{frames:60,actors:6,medianMs:bench[30],p95Ms:bench[57]},overlayProbe,overlayDelta,stress,metrics:A.metrics(),scope:{enemy:A.target({id:'mob',hp:1,maxHp:2}),boss:A.target({id:'boss',boss:true,hp:1,maxHp:2}),midboss:A.target({id:'mid',midboss:true,hp:1,maxHp:2}),friendly:A.target({id:'ally',friendly:true,hp:1,maxHp:2}),visual:A.target({id:'ghost',visualOnly:true,hp:1,maxHp:2})}};
 });
 report.metrics=sample.metrics;report.bench=sample.bench;report.stress=sample.stress;report.overlayProbe=sample.overlayProbe;report.overlayDelta=sample.overlayDelta;report.cases=[];
 for(const row of sample.cases){for(const stage of [...row.living,...row.death])if(stage.png){const label=stage.hp!==undefined?`hp${stage.hp}`:`death${stage.progress}`;fs.writeFileSync(path.join(output,`${profile}-${row.name}-${label}.png`),Buffer.from(stage.png.split(',')[1],'base64'));delete stage.png;}
  assert(row.living[0].changed===0&&row.living[4].changed===0,`${row.name} healthy/recovered body changed`);
  assert(row.living[1].changed>0&&row.living[2].changed>=row.living[1].changed&&row.living[3].changed>=row.living[2].changed,`${row.name} wounds not staged`);
  assert(row.living.every(s=>s.outside===0),`${row.name} wound escaped body ${JSON.stringify(row.living)}`);
  assert(row.death[0].opaque>row.death[3].opaque&&row.death[3].opaque>row.death[5].opaque&&row.death[6].opaque<=row.death[5].opaque,`${row.name} body did not erode ${JSON.stringify(row.death)}`);
  assert(row.maskBuildDelta===1,`${row.name} mask was not cached`);report.cases.push(row);
 }
 assert(sample.scope.enemy&&sample.scope.boss&&sample.scope.midboss&&!sample.scope.friendly&&!sample.scope.visual);
 assert(sample.overlayProbe.every(row=>row.outside<=2&&row.maxOutsideAlpha<=40&&row.changed>0&&row.healedDifference===0),`ordinary cached body escaped silhouette or failed healing: ${JSON.stringify(sample.overlayProbe)}`);
 assert(sample.overlayDelta.builds===1&&sample.overlayDelta.hits===1&&sample.overlayDelta.bytes<=12*1024*1024,`ordinary overlay was not reused within budget: ${JSON.stringify(sample.overlayDelta)}`);
 assert(sample.stress.largeOriginal===sample.stress.largeRendered,'large boss body clipped');
 assert(sample.stress.maskBuildDelta===10&&sample.stress.afterRepeat.cacheEntries===10&&sample.stress.afterRepeat.evictions===0,'simultaneous death masks thrashed');
 assert(sample.stress.afterRepeat.maskBytesUpperBound<=24*1024*1024&&sample.stress.afterRepeat.overlayEntries===1&&sample.stress.afterZone.cacheEntries===0&&sample.stress.afterZone.overlayEntries===0&&sample.stress.afterZone.resets>=1,'mask memory or zone cleanup failed');
 assert(sample.metrics.framePixelScans===0&&sample.metrics.cacheEntries<=sample.metrics.maxCache);
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.httpErrors,[]);report.status='passed';
 console.log('RC145_BODY_ASH_BROWSER',JSON.stringify({status:report.status,profile,cases:report.cases.map(x=>({name:x.name,living:x.living.map(s=>s.changed),death:x.death.map(s=>s.opaque)})),bench:report.bench,maskBuilds:sample.metrics.maskBuilds,errors:0,httpErrors:0}));
 }catch(e){report.status='failed';report.failure=e.stack||String(e);console.error(report.failure);process.exitCode=1;}finally{fs.writeFileSync(path.join(output,`${profile}-results.json`),JSON.stringify(report,null,2));await browser?.close();server.close();}})();
