/* RC232: legible native projectile bodies without changing their silhouette.
 * Original source alpha, draw geometry and every gameplay clock stay intact.
 * Persona keeps its dedicated nine authored skill presentations as reference.
 */
(function(root){'use strict';
 const VERSION='RC232',ALPHA_FLOOR=.86,BODY_ALPHA_RATIO=.65,MAX_PIXELS=512*512,MAX_CACHE_BYTES=8*1024*1024;
 const variants=new Map(),ids=new WeakMap(),display=new WeakMap(),pending=new Set(),failed=new Set();let serial=0,cacheBytes=0;
 const stats={calls:0,eligible:0,bodyDraws:0,contrastDraws:0,alphaRaised:0,zeroOpacity:0,contactBypasses:0,decorativeBypasses:0,
  cacheHits:0,cacheMisses:0,cacheEvictions:0,sourceFallbacks:0,processedPixels:0,processingMs:0,maxProcessingMs:0,idleStyles:0,suppressedHidden:0};
 const n=(v,d=0)=>Number.isFinite(v)?v:d,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const allied=q=>!!(q?.friendly||q?.reflected||q?.dreamReflectedV31346||q?.heroSkillVfx||q?.heroProjectileTransient||q?.heroId31213||q?.impactHeroIdV31315||q?.partySlotV31322||q?.canonAllyV31217||q?.canonicalAllyV31217||q?.ownerType==='hero');
 const field=q=>!!(q?.laserShot||q?.laserV31330||q?.bloodV31516||q?.themedLaser||q?.pureTelegraphV31230||q?.telegraphImpact||q?.bossImpactTransitV31232||q?.themeBombV31323||q?.themePollutionV31323||q?.persistentHazard||q?.blackHole||q?.blackhole||q?.blackHoleV31317||q?.blackHoleDotRC175||q?.spatialRiftV31232||q?.rc210SpatialRift);
 function released(q,time){
  if(!q||!Number.isFinite(time)||![q.x,q.y,q.vx,q.vy].every(Number.isFinite)||Math.hypot(q.vx,q.vy)<.001||!(n(q.damage)>0))return false;
  if(allied(q)||field(q)||q.visualOnly||q.damageSuppressed||q.damageSuppressedV31226||q.parriedV31356||q.rc133InnerShot)return false;
  const pipe=root.__HAPIL_PROJECTILE_PIPELINE_V31402__;
  if(pipe?.visible(q,time)===false||q.projectileRemovalReason31215||q.reachedHero31213||q.reachedMapBoundary31213||q.bodySpawned31219===false)return false;
  return Math.max(n(q.born),n(q.frozenUntil),n(q.telegraphUntil31210),n(q.motionReleaseAt31219),n(q.collisionDisabledUntil31219),n(q.collisionDisabledUntilV31226))<=time;
 }
 function opacity(settings={}){return clamp(n(Number(settings.skillFxOpacity),1),0,1);}
 function edgeRadius(value){return [1,2,4,8,12,16,24,32].find(v=>v>=value)??32;}
 function improvePixels(data,width,height,radius){
  // Manhattan distance is computed inside the existing alpha>=24 silhouette.
  // The one-pixel appearance is entirely INSIDE it; no new opaque pixel exists.
  const distance=new Uint16Array(width*height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const at=y*width+x;
   if(data[at*4+3]<24)continue;
   let value=x?distance[at-1]+1:1;const up=y?distance[at-width]+1:1;if(up<value)value=up;distance[at]=value;
  }
  for(let y=height-1;y>=0;y--)for(let x=width-1;x>=0;x--){
   const at=y*width+x;if(!distance[at])continue;
   let value=distance[at],right=x+1<width?distance[at+1]+1:1,down=y+1<height?distance[at+width]+1:1;
   if(right<value)value=right;if(down<value)value=down;distance[at]=value;
  }
  const out=new Uint8ClampedArray(data),r=Math.max(1,Math.round(radius));
  for(let at=0;at<distance.length;at++){
   const i=at*4,d=distance[at];if(!d||data[i+3]<48)continue;
   // A narrow bright outer edge and dark inner edge survive both bright and
   // dark floors. Most pixels keep their original RGB; every alpha is exact.
   const bright=d<=r,dark=d>r&&d<=r*2;if(!bright&&!dark)continue;
   if(bright){out[i]=data[i]*.44+142.8;out[i+1]=data[i+1]>248?data[i+1]:data[i+1]*.44+138.88;out[i+2]=data[i+2]>238?data[i+2]:data[i+2]*.44+133.28;}
   else{const light=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2],mix=light>170?.06:.18,keep=1-mix;
    out[i]=data[i]*keep+18*mix;out[i+1]=data[i+1]*keep+16*mix;out[i+2]=data[i+2]*keep+26*mix;}
  }
  return out;
 }
 function makeCanvas(w,h){
  const canvas=typeof root.OffscreenCanvas==='function'?new root.OffscreenCanvas(w,h):root.document?.createElement?.('canvas');
  if(!canvas)return null;canvas.width=w;canvas.height=h;return canvas;
 }
 function styleKey(image,radius){let id=ids.get(image);if(!id){id=++serial;ids.set(image,id);}return id+':'+edgeRadius(radius);}
 function picture(image,radius=1){
  if(image?.rc232SourceImage)return image;
  const width=image?.naturalWidth||image?.width,height=image?.naturalHeight||image?.height;
  if(!(width>0&&height>0)||width*height>MAX_PIXELS){stats.sourceFallbacks++;return image;}
  const edge=edgeRadius(radius),key=styleKey(image,edge);
  if(failed.has(key))return image;
  const prior=variants.get(key);if(prior){variants.delete(key);variants.set(key,prior);stats.cacheHits++;return prior.image;}
  const started=root.performance?.now?.()??0;
  try{
   const canvas=makeCanvas(width,height),ctx=canvas?.getContext('2d',{willReadFrequently:true});if(!ctx)return image;
   ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,width,height);
   pixels.data.set(improvePixels(pixels.data,width,height,edge));ctx.putImageData(pixels,0,0);
   // Preserve asset identity and natural dimensions for the existing bitmap
   // recorder, alpha-bounds cache and source receipts. Never rewrite cache art.
   Object.assign(canvas,{src:image.currentSrc||image.src||'',currentSrc:image.currentSrc||image.src||'',complete:true,
    naturalWidth:width,naturalHeight:height,rc232SourceImage:image});
   const bytes=width*height*4;variants.set(key,{image:canvas,bytes});cacheBytes+=bytes;
   while(cacheBytes>MAX_CACHE_BYTES&&variants.size){const oldest=variants.keys().next().value,entry=variants.get(oldest);variants.delete(oldest);cacheBytes-=entry.bytes;stats.cacheEvictions++;}
   stats.cacheMisses++;stats.processedPixels+=width*height;const elapsed=Math.max(0,(root.performance?.now?.()??started)-started);stats.processingMs+=elapsed;stats.maxProcessingMs=Math.max(stats.maxProcessingMs,elapsed);return canvas;
  }catch{if(failed.size>=256)failed.delete(failed.values().next().value);failed.add(key);stats.sourceFallbacks++;return image;}
 }
 function readyPicture(image,radius){
  if(image?.rc232SourceImage)return image;
  const width=image?.naturalWidth||image?.width,height=image?.naturalHeight||image?.height;
  if(!(width>0&&height>0)||width*height>MAX_PIXELS){stats.sourceFallbacks++;return image;}
  const key=styleKey(image,radius);
  if(failed.has(key))return image;
  if(variants.has(key)||typeof root.requestIdleCallback!=='function')return picture(image,radius);
  if(!pending.has(key)){
   pending.add(key);stats.idleStyles++;
   root.requestIdleCallback(()=>{try{picture(image,radius);}finally{pending.delete(key);}},{timeout:500});
  }
  // A cold style never stalls or hides the first released native body. Its
  // original pixels and essential alpha draw immediately while RGB is cached.
  return image;
 }
 function cssScale(ctx){
  const canvas=ctx?.canvas;if(!canvas)return{x:1,y:1};const now=typeof performance!=='undefined'?performance.now():0;let row=display.get(canvas);
  if(!row||now-row.at>32){const rect=canvas.getBoundingClientRect?.();row={at:now,x:n(rect?.width,canvas.width)/Math.max(1,canvas.width),y:n(rect?.height,canvas.height)/Math.max(1,canvas.height)};display.set(canvas,row);}
  return row;
 }
 function sourceEdge(ctx,args){
  if(args.length!==5&&args.length!==9)return 1;
  const image=args[0],iw=image?.naturalWidth||image?.width,ih=image?.naturalHeight||image?.height;
  const crop=args.length===9?args.slice(1,5):[0,0,iw,ih],dest=args.slice(-4),sw=crop[2],sh=crop[3];
  const m=ctx.getTransform?.()??{a:1,b:0,c:0,d:1},css=cssScale(ctx),x=Math.abs(dest[2])/Math.max(1,sw),y=Math.abs(dest[3])/Math.max(1,sh);
  // The transform maps source pixels directly to CSS pixels. No extra alpha
  // scan or live-canvas read is needed to choose a subpixel inner edge.
  const scale=Math.min(Math.hypot(m.a*x*css.x,m.b*x*css.y),Math.hypot(m.c*y*css.x,m.d*y*css.y));
  return edgeRadius(clamp(.8/Math.max(.00001,scale),1,32));
 }
 function draw(ctx,q,time,settings={},render){
  if(typeof render!=='function')return false;stats.calls++;
  // Collision/heart measurement must retain its original renderer and thresholds.
  // The live picture has exactly the same source alpha and draw geometry.
  if(ctx?.__rc204ContactProbe===true){stats.contactBypasses++;return render();}
  if(root.__HAPIL_PROJECTILE_PIPELINE_V31402__?.visible(q,time)===false){stats.suppressedHidden++;return false;}
  if(!released(q,time)||!ctx||typeof ctx.drawImage!=='function')return render();stats.eligible++;
  const configured=opacity(settings),own=Object.getOwnPropertyDescriptor(ctx,'drawImage'),base=ctx.drawImage;
  ctx.drawImage=function(...args){
   if((args.length!==5&&args.length!==9)||!args[0])return base.apply(this,args);
   const priorAlpha=ctx.globalAlpha;
   // Faint echoes, shadows and trails remain faint. Making those opaque would
   // imply an extra danger shape beyond the native current-flight body.
   if(configured>0&&n(priorAlpha,1)/configured<BODY_ALPHA_RATIO){stats.decorativeBypasses++;return base.apply(this,args);}
   const nextAlpha=configured<=0?0:Math.max(n(priorAlpha,1),ALPHA_FLOOR);
   if(configured<=0)stats.zeroOpacity++;else if(nextAlpha>priorAlpha)stats.alphaRaised++;
   const output=args.slice();if(configured>0){const styled=readyPicture(args[0],sourceEdge(ctx,args));output[0]=styled;if(styled!==args[0])stats.contrastDraws++;}
   ctx.globalAlpha=nextAlpha;stats.bodyDraws++;
   try{return base.apply(this,output);}finally{ctx.globalAlpha=priorAlpha;}
  };
  try{return render();}finally{if(own)Object.defineProperty(ctx,'drawImage',own);else delete ctx.drawImage;}
 }
 root.__HAPIL_PROJECTILE_READABILITY_RC232__=Object.freeze({version:VERSION,draw,released,picture,improvePixels,
  metrics:()=>({...stats,cacheBytes,cacheEntries:variants.size,pendingStyles:pending.size}),
  policy:Object.freeze({bodyAlphaFloor:ALPHA_FLOOR,bodyAlphaRatio:BODY_ALPHA_RATIO,zeroOpacityRespected:true,sourceAlpha:'exact',geometry:'unchanged',
   edge:'source-alpha interior only',persona:'dedicated nine skill painter unchanged',cacheLimitBytes:MAX_CACHE_BYTES,maxSourcePixels:MAX_PIXELS})});
})(typeof window!=='undefined'?window:globalThis);
