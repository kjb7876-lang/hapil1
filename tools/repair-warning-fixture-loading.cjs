'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),file='tests/rc116-laser-telegraph-browser.cjs';let s=fs.readFileSync(file,'utf8');
function edit(a,b){if(s.includes(b))return;assert.equal(s.split(a).length-1,1,'warning fixture patch site: '+a.slice(0,70));s=s.replace(a,b);}
edit("  const captured=await page.evaluate(async spritePath=>{\n   const api=window.__RC116_TELEGRAPH__,cache={},image=api.queue(cache,spritePath,'eager');await image.decode();\n   const originalQueue=api.queueCurrent,queued=new Map();\n   api.replaceQueue((c,p,...a)=>{const im=p===spritePath?image:originalQueue(c,p,...a);if(im&&typeof im.decode==='function')queued.set(String(p),im);return im;});",`  // This is an isolated renderer fixture, not the natural-play test. Stop the
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
   api.replaceQueue((c,p,...a)=>{const im=p===spritePath?image:originalQueue(c,p,...a);if(collecting&&im&&typeof im.decode==='function')queued.set(String(p),im);return im;});`);
edit("   let warmupPasses=0,lastCount=-1;", "   const drawWarning=options=>{collecting=true;try{api.draw(ctx,{...hazard},.8,options,cache);}finally{collecting=false;}};\n   let warmupPasses=0,lastCount=-1;");
edit("for(const options of modes){ctx.clearRect(0,0,canvas.width,canvas.height);api.draw(ctx,{...hazard},.8,options,cache);}","for(const options of modes){ctx.clearRect(0,0,canvas.width,canvas.height);drawWarning(options);}");
edit("await Promise.all([...queued.entries()].map(async([p,im])=>{await im.decode();if(!im.naturalWidth)throw Error('Warning image did not decode: '+p);}));", "await Promise.all([...queued.entries()].map(([p,im])=>decode(im,p)));");
edit("    api.draw(ctx,{...hazard},.8,options,cache);ctx.drawImage=native;", "    drawWarning(options);ctx.drawImage=native;");
fs.writeFileSync(file,s);console.log('Warning fixture waits for its actual image source and decodes only warning assets; pixel acceptance is unchanged.');
