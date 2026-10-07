'use strict';
// Compare the native warning renderer with the user-approved main bundle.
// Await every resolved image before capture: an unloaded fallback is not a
// valid visual baseline. Keep opacity-density numbers as diagnostics only.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results','laser-telegraph');
const baseline=process.env.HAPIL_VISUAL_BASELINE||'19a4c1f92df16559e43ba822ae0f7b8e74a5c47a';
const sprite='./assets/vfx/bosses/v3102/ep1b08_pride_cross_undead_cluster.webp';
fs.mkdirSync(out,{recursive:true});
const harness='\nwindow.__RC116_TELEGRAPH__={draw:(...a)=>qn(...a),queue:(...a)=>MONGSE_queueImage(...a),queueCurrent:MONGSE_queueImage,replaceQueue:fn=>{MONGSE_queueImage=fn;},point:(...a)=>G(...a)};';
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(file.endsWith('/assets/index-v31526.js')?fs.readFileSync(file,'utf8')+harness:fs.readFileSync(file));}catch{res.writeHead(404).end();}
}).listen(0,'127.0.0.1');
async function capture(browser,source){
 const context=await browser.newContext({viewport:{width:1180,height:757}}),page=await context.newPage(),errors=[],failedResponses=[];
 try{
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failedResponses.push({status:r.status(),url:r.url()});});
  if(source)await page.route('**/assets/index-v31526.js*',route=>route.fulfill({status:200,contentType:'text/javascript',body:source+harness}));
  await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
  await page.waitForFunction(()=>window.__RC116_TELEGRAPH__,null,{timeout:15000});
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
  await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
  await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00');
  // This is an isolated renderer fixture, not the natural-play test. Stop the
  // unrelated combat producer while keeping RAF/image-loading work available.
  await page.evaluate(()=>{if(window.__HAPIL_READING_V31342__)window.__HAPIL_READING_V31342__.blocked=true;});
  const captured=await page.evaluate(async spritePath=>{
   const decode=async(im,p)=>{
    if(!im)throw Error('Missing warning image: '+p);
    const deadline=performance.now()+12000;
    while(!(im.currentSrc||im.src)&&performance.now()<deadline)await new Promise(r=>setTimeout(r,20));
    if(!(im.currentSrc||im.src))throw Error('Warning image never received a source: '+p);
    try{await im.decode();}catch(e){throw Error('Warning decode failed for '+p+' resolved='+String(im.currentSrc||im.src)+' complete='+im.complete+' size='+im.naturalWidth+': '+e.message);}
    if(!im.naturalWidth)throw Error('Warning decoded with no pixels: '+p);
   };
   const api=window.__RC116_TELEGRAPH__,cache={},image=api.queue(cache,spritePath,'eager');await decode(image,spritePath);
   const originalQueue=api.queueCurrent,queued=new Map();let collecting=false;
   api.replaceQueue((c,p,...a)=>{const im=p===spritePath?image:originalQueue(c,p,...a);if(collecting&&im&&typeof im.decode==='function')queued.set(String(p),im);return im;});
   const canvas=document.createElement('canvas');canvas.width=1180;canvas.height=757;
   const ctx=canvas.getContext('2d',{willReadFrequently:true}),p0=api.point(8,8),p1=api.point(24,24);
   const hazard={id:901,born:0,at:2.1,originX:8,originY:8,x:24,y:24,radius:Math.hypot(16,16),width:.42,shape:'line',color:'#f12655',accent:'#ffe8ef',boss:true,themedLaser:true,sevenSinImpactSprite:spritePath,suppressTelegraphLabel:true,perfectWindow:0,telegraphImageRenderedV31224:false};
   const modes=[{name:'desktop',lowFx:false,reducedFlash:false},{name:'reduced-flash',lowFx:false,reducedFlash:true},{name:'mobile-lowFx',lowFx:true,reducedFlash:true}];
   // Resolve and decode images chosen indirectly by the live renderer, not
   // merely the explicit sevenSinImpactSprite supplied by this fixture.
   const drawWarning=options=>{collecting=true;try{api.draw(ctx,{...hazard},.8,options,cache);}finally{collecting=false;}};
   let warmupPasses=0,lastCount=-1;
   for(let pass=0;pass<6;pass++){
    for(const options of modes){ctx.clearRect(0,0,canvas.width,canvas.height);drawWarning(options);}
    await Promise.all([...queued.entries()].map(([p,im])=>decode(im,p)));
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    warmupPasses++;
    if(pass>0&&queued.size===lastCount&&[...queued.values()].every(im=>im.complete&&im.naturalWidth>0))break;
    lastCount=queued.size;
   }
   const result=[];
   for(const options of modes){
    ctx.clearRect(0,0,canvas.width,canvas.height);let spriteDraws=0,drawImageCalls=0;const sources=[],native=ctx.drawImage.bind(ctx);
    ctx.drawImage=(im,...args)=>{drawImageCalls++;sources.push({same:im===image,src:im.currentSrc||im.src||null,width:im.naturalWidth||im.width||0,height:im.naturalHeight||im.height||0});if(im===image)spriteDraws++;return native(im,...args);};
    drawWarning(options);ctx.drawImage=native;
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const alpha=(x,y)=>{x=Math.floor(x);y=Math.floor(y);return x<0||y<0||x>=canvas.width||y>=canvas.height?0:pixels[(y*canvas.width+x)*4+3];};
    let drawnPixels=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>8)drawnPixels++;
    const dx=p1.x-p0.x,dy=p1.y-p0.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
    let samples=0,center=0,body=0,sections=0;
    for(let t=.04;t<=.96;t+=.04){const x=p0.x+dx*t,y=p0.y+dy*t;samples++;if(alpha(x,y)>20)center++;
     for(const sign of [-1,1])if(alpha(x+nx*5*sign,y+ny*5*sign)>20)body++;
     let visible=false;for(let offset=-10;offset<=10;offset++)if(alpha(x+nx*offset,y+ny*offset)>20){visible=true;break;}if(visible)sections++;
    }
    result.push({...options,drawnPixels,spriteDraws,drawImageCalls,drawImageSources:sources,centerCoverage:center/samples,bodyCoverage:body/(2*samples),sectionCoverage:sections/samples,expectedPath:{start:p0,end:p1},png:canvas.toDataURL()});
   }
   const assets=[...queued.entries()].map(([requestedPath,im])=>({requestedPath,src:im.currentSrc||im.src,width:im.naturalWidth,height:im.naturalHeight,complete:im.complete}));
   api.replaceQueue(originalQueue);return{rows:result,warmupPasses,queuedAssets:assets};
  },sprite);
  return{...captured,errors,failedResponses};
 }finally{await context.close();}
}
async function main(){let browser;
 try{
  const approvedSource=execFileSync('git',['show',`${baseline}:assets/index-v31526.js`],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
  browser=await chromium.launch({chromiumSandbox: true, channel: 'chrome', args:['--disable-dev-shm-usage']});
  const approved=await capture(browser,approvedSource),current=await capture(browser,null);
  const comparisonPage=await browser.newPage();
  const comparisons=await comparisonPage.evaluate(async pairs=>{
   const results=[];
   for(const [before,after]of pairs){
    const load=async src=>{const im=new Image();im.src=src;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);return x.getImageData(0,0,c.width,c.height).data;};
    const a=await load(before.png),b=await load(after.png);let changedPixels=0,foregroundUnion=0;
    for(let i=0;i<a.length;i+=4){if(a[i+3]>8||b[i+3]>8)foregroundUnion++;if(Math.max(...[0,1,2,3].map(k=>Math.abs(a[i+k]-b[i+k])))>3)changedPixels++;}
    results.push({name:after.name,pixelExact:before.png===after.png,changedPixels,foregroundUnion,changedForegroundRatio:changedPixels/Math.max(1,foregroundUnion),baselineCenterCoverage:before.centerCoverage,currentCenterCoverage:after.centerCoverage,baselineBodyCoverage:before.bodyCoverage,currentBodyCoverage:after.bodyCoverage,baselineSectionCoverage:before.sectionCoverage,currentSectionCoverage:after.sectionCoverage,baselineDrawImageCalls:before.drawImageCalls,currentDrawImageCalls:after.drawImageCalls});
   }return results;
  },approved.rows.map((before,i)=>[before,current.rows[i]]));
  await comparisonPage.close();
  for(const [label,result]of [['approved',approved],['after',current]])for(const row of result.rows){fs.writeFileSync(path.join(out,`laser-warning-${row.name}-${label}.png`),Buffer.from(row.png.split(',')[1],'base64'));delete row.png;}
  const report={baseline,criterion:'decoded native warning foreground vs user-approved bundle; 3/255 channel rounding tolerance',legacyOpaqueBodyCriterionPassed:current.rows.every(r=>r.centerCoverage>=.98&&r.bodyCoverage>=.98),comparisons,approved,current};
  fs.writeFileSync(path.join(out,'laser-warning-after.json'),JSON.stringify(report,null,2));
  console.log('LASER_WARNING_REFERENCE '+JSON.stringify(report));
  assert.deepEqual(approved.errors,[],'approved reference failed to execute');assert.deepEqual(current.errors,[],'current warning runtime errors');
  assert.deepEqual(approved.failedResponses,[]);assert.deepEqual(current.failedResponses,[]);
  assert.equal(comparisons.length,3);
  assert(approved.rows.every(r=>r.drawnPixels>0)&&current.rows.every(r=>r.drawnPixels>0),'a warning was not rendered');
  assert(comparisons.every(r=>r.changedForegroundRatio<=.005),'native warning differs from approved reference; inspect PNGs before changing art');
  assert(comparisons.every(r=>r.currentSectionCoverage+.01>=r.baselineSectionCoverage),'new full-width warning gaps compared with approved reference');
  assert(comparisons.every(r=>r.currentDrawImageCalls===r.baselineDrawImageCalls),'extra image stamps appeared over the approved warning');
 }finally{await browser?.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
