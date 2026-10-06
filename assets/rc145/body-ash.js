/* RC146: body-bound wounds and bounded cached death masks for hostile actors. */
(function(root){
 'use strict';
 const MAX_CACHE=10,LEVELS=8,MASK_SIDE=192,MAX_OVERLAY_BYTES=12*1024*1024,BUCKETS=[128,192,256,384,512,768,1024];
 const cache=new Map(),scratch=new Map(),overlays=new Map(),metrics={livingFrames:0,deathFrames:0,maskBuilds:0,maskPixelsBuilt:0,framePixelScans:0,evictions:0,resets:0,overlayBuilds:0,overlayHits:0,overlayEvictions:0};
 let overlayBytes=0;
 let scene=null,zone=null,lastTime=-Infinity;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
 const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const persona=a=>(a?.sourceActorIdRC145??a?.id)==='inner-evil-rc133';
 function target(a){if(!a||typeof(a.sourceActorIdRC145??a.id)!=='string')return false;
  if(a.sourceActorIdRC145!==undefined)return a.burnRC144===true;
  return Number.isFinite(a.maxHp)&&a.maxHp>0&&!a.visualOnly&&!a.friendly&&!a.objectiveStructureV31238&&!a.narrativeStructureV31238&&!a.protectedNarrativeTargetV31307;}
 function reset(){cache.clear();overlays.clear();overlayBytes=0;scene=null;zone=null;lastTime=-Infinity;metrics.resets++;}
 function sync(state){if(!state)return;if(scene&&state!==scene||zone!==null&&state.zone!==zone||Number.isFinite(state.time)&&state.time<lastTime-.1)reset();scene=state;zone=state.zone;lastTime=Number.isFinite(state.time)?state.time:lastTime;}
 const hash=(x,y,seed)=>{let h=Math.imul(x+17,374761393)^Math.imul(y+29,668265263)^Math.imul(seed+11,2246822519);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295;};
 function body(size,draw,center){
  const safe=clamp(size,24,500),span=BUCKETS.find(n=>n>=safe*1.9)??BUCKETS.at(-1);
  let surface=scratch.get(span);if(!surface){surface=canvas(span,span);scratch.set(span,surface);}
  const ctx=surface.getContext('2d'),left=Math.round(center.x-span/2),top=Math.round(center.y-safe*1.2);
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.clearRect(0,0,span,span);
  ctx.save();ctx.translate(-left,-top);const drawn=draw(ctx);ctx.restore();return{ctx,canvas:surface,left,top,span,anchorY:center.y-top,drawn};
 }
 function lines(ctx,size,ratio,time,isPersona,anchorY,death=false,composite='source-atop'){
  const strength=death?1:clamp((.7-ratio)/.7,0,1),stage=death||ratio<=.15?3:ratio<=.4?2:1;
  if(strength<=0)return;
  const cx=ctx.canvas.width/2,cy=anchorY,count=stage===1?2:stage===2?4:6;
  ctx.save();ctx.globalCompositeOperation=composite;
  if(stage===3){ctx.fillStyle=isPersona?'rgba(24,3,14,.26)':'rgba(25,8,7,.38)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);}
  for(let j=0;j<count;j++){
   const x=cx+size*((j-(count-1)/2)*.105),top=cy-size*(.82-(j%3)*.055),bottom=cy-size*(.12+(j%2)*.04),bend=size*(j%2?.075:-.075);
   const trace=()=>{ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x+bend*.36,top+(bottom-top)*.31);ctx.lineTo(x-bend*.42,top+(bottom-top)*.57);ctx.lineTo(x+bend,bottom);};
   trace();ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=isPersona?'rgba(29,1,13,.95)':'rgba(52,8,8,.9)';ctx.lineWidth=Math.max(1.6,size*(stage===3?.027:.018));ctx.stroke();
   if(stage>1){trace();ctx.strokeStyle=isPersona?'rgba(215,45,69,.9)':'rgba(247,70,37,.85)';ctx.lineWidth=Math.max(.8,size*(stage===3?.014:.011));ctx.stroke();}
   if(stage===3&&j%2===0){ctx.beginPath();ctx.moveTo(x-bend*.42,top+(bottom-top)*.57);ctx.lineTo(x-bend*.82,top+(bottom-top)*.69);ctx.stroke();}
  }
  if(stage>=2){
   const tongues=stage===3?7:4,pulse=.8+.2*Math.sin(time*9);
   for(let j=0;j<tongues;j++){
    const x=cx+size*((j-(tongues-1)/2)*.115),y=cy-size*(.16+.055*(j%3));
    ctx.fillStyle=isPersona?`rgba(158,20,43,${.23*strength*pulse})`:`rgba(255,88,31,${.29*strength*pulse})`;
    ctx.beginPath();ctx.moveTo(x-size*.045,y);ctx.quadraticCurveTo(x-size*.07,y-size*.12,x+size*.015,y-size*.19*strength);ctx.quadraticCurveTo(x+size*.055,y-size*.075,x+size*.047,y);ctx.fill();
   }
  }
  ctx.restore();
 }
 function prepareMasks(sprite,size,actor,b){
  const id=[sprite,Math.round(size),persona(actor)?'persona':'enemy',actor?.facing??'',actor?.sourceFacing31223??''].join('|');
  const previous=cache.get(id);if(previous){cache.delete(id);cache.set(id,previous);return previous;}
  const w=MASK_SIDE,h=MASK_SIDE,sourceCanvas=canvas(w,h),sourceCtx=sourceCanvas.getContext('2d');sourceCtx.drawImage(b.canvas,0,0,w,h);
  const source=sourceCtx.getImageData(0,0,w,h).data,n=w*h,dist=new Float32Array(n),edge=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,inside=source[i*4+3]>30;dist[i]=inside?Math.min(x+1,y+1,w-x,h-y):0;}
  const d=Math.SQRT2;
  for(let y=1;y<h;y++)for(let x=1;x<w;x++){const i=y*w+x;if(dist[i])dist[i]=Math.min(dist[i],dist[i-1]+1,dist[i-w]+1,dist[i-w-1]+d,x<w-1?dist[i-w+1]+d:Infinity);}
  for(let y=h-2;y>=0;y--)for(let x=w-2;x>=0;x--){const i=y*w+x;if(dist[i])dist[i]=Math.min(dist[i],dist[i+1]+1,dist[i+w]+1,dist[i+w+1]+d,x>0?dist[i+w-1]+d:Infinity);}
  let max=1;for(let i=0;i<n;i++){if(dist[i]>max)max=dist[i];if(dist[i]>0&&dist[i]<2.4&&hash(i%w,Math.floor(i/w),3)>.94)edge.push([(i%w)*b.span/w,Math.floor(i/w)*b.span/h]);}
  const item={id,edge:edge.slice(0,96),masks:[],rims:[]},isPersona=persona(actor);
  for(let level=0;level<LEVELS;level++){
   const cut=level/(LEVELS-1)*(max+2),m=canvas(w,h),rim=canvas(w,h),mc=m.getContext('2d'),rc=rim.getContext('2d'),pixels=mc.createImageData(w,h),lights=rc.createImageData(w,h);
   for(let i=0;i<n;i++){
    if(!dist[i])continue;const x=i%w,y=Math.floor(i/w),jitter=(hash(x,y,7)-.5)*Math.min(3,max*.08),remaining=level===0||dist[i]>cut+jitter;
    if(!remaining)continue;
    pixels.data[i*4+3]=255;
    if(level>0&&dist[i]-cut-jitter<Math.max(2,max*.065)){lights.data[i*4]=isPersona?242:255;lights.data[i*4+1]=isPersona?193:92;lights.data[i*4+2]=isPersona?218:45;lights.data[i*4+3]=isPersona?156:190;}
   }
   mc.putImageData(pixels,0,0);rc.putImageData(lights,0,0);item.masks.push(m);item.rims.push(rim);
  }
  cache.set(id,item);if(cache.size>MAX_CACHE){cache.delete(cache.keys().next().value);metrics.evictions++;}
  metrics.maskBuilds++;metrics.maskPixelsBuilt+=n;return item;
 }
 function overlay(sprite,size,actor,center,drawBody,stage){
  const safe=clamp(size,24,500),span=BUCKETS.find(n=>n>=safe*1.9)??BUCKETS.at(-1),top=Math.round(center.y-safe*1.2),anchorY=center.y-top;
  const id=[sprite,Math.round(size),actor?.kind??'',actor?.elite===true,actor?.facing??'',actor?.sourceFacing31223??'',stage,Math.round((center.x-Math.round(center.x))*4),Math.round(anchorY*4)].join('|');
  let item=overlays.get(id);if(item){overlays.delete(id);overlays.set(id,item);metrics.overlayHits++;return item;}
  const b=body(size,drawBody,center),surface=canvas(b.span,b.span),paint=surface.getContext('2d'),ratio=stage===1?.6:stage===2?.3:.08;
  paint.drawImage(b.canvas,0,0);
  lines(paint,size,ratio,0,persona(actor),b.anchorY);
  item={canvas:surface,span:b.span,bytes:b.span*b.span*4};
  if(item.bytes<=MAX_OVERLAY_BYTES){overlays.set(id,item);overlayBytes+=item.bytes;
   while(overlayBytes>MAX_OVERLAY_BYTES){const first=overlays.keys().next().value,evicted=overlays.get(first);overlays.delete(first);overlayBytes-=evicted.bytes;metrics.overlayEvictions++;}}
  metrics.overlayBuilds++;return item;
 }
 function living({ctx,actor,sprite,size,center,time,drawBody,cacheable=false}){
  if(!target(actor)||typeof drawBody!=='function')return false;
  const ratio=clamp(actor.hp/Math.max(1,actor.maxHp),0,1);metrics.livingFrames++;
  if(ratio>=.7){drawBody(ctx);return true;}
  if(cacheable&&!persona(actor)){
   const stage=ratio<=.15?3:ratio<=.4?2:1,item=overlay(sprite,size,actor,center,drawBody,stage),left=Math.round(center.x-item.span/2),top=Math.round(center.y-clamp(size,24,500)*1.2);
   ctx.save();ctx.globalCompositeOperation='source-over';ctx.drawImage(item.canvas,left,top);ctx.restore();return true;
  }
  const b=body(size,drawBody,center);lines(b.ctx,size,ratio,time,persona(actor),b.anchorY);
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.drawImage(b.canvas,b.left,b.top);ctx.restore();return true;
 }
 function death({ctx,actor,sprite,size,center,progress,time,drawBody,lowFx,ready}){
  if(!target(actor)||!ready||typeof drawBody!=='function')return false;
  const b=body(size,drawBody,center);if(b.drawn===false)return false;
  const p=clamp(progress,0,1),item=prepareMasks(sprite,size,actor,b),isPersona=persona(actor);metrics.deathFrames++;
  if(p<.125){b.ctx.save();b.ctx.globalCompositeOperation='source-atop';b.ctx.fillStyle=isPersona?`rgba(255,215,228,${.48*(1-p/.125)})`:`rgba(255,236,190,${.52*(1-p/.125)})`;b.ctx.fillRect(0,0,b.span,b.span);b.ctx.restore();}
  else{
   lines(b.ctx,size,0,time,isPersona,b.anchorY,true);
   b.ctx.save();b.ctx.globalCompositeOperation='source-atop';b.ctx.fillStyle=isPersona?'rgba(21,1,11,.25)':'rgba(22,7,4,.36)';b.ctx.fillRect(0,0,b.span,b.span);b.ctx.restore();
   const level=Math.min(LEVELS-1,Math.floor(clamp((p-.125)/.875,0,1)*(LEVELS-1)+.5));
   b.ctx.save();b.ctx.globalCompositeOperation='destination-in';b.ctx.drawImage(item.masks[level],0,0,b.span,b.span);b.ctx.restore();
   b.ctx.save();b.ctx.globalCompositeOperation='source-over';b.ctx.drawImage(item.rims[level],0,0,b.span,b.span);b.ctx.restore();
  }
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.drawImage(b.canvas,b.left,b.top);
  const pieces=lowFx?6:12,count=item.edge.length;
  for(let j=0;j<pieces&&count;j++){
   const k=(j*17+Math.floor(p*7))%count,xy=item.edge[k],rise=(6+j%5*4)*p*size/70,spread=(j%2?1:-1)*p*(5+j%3*4);
   ctx.globalAlpha=(1-p)*(.55+.28*hash(j,0,9));ctx.fillStyle=isPersona?j%4?'#fff8fa':'#b95668':j%3?'#d8c6bb':'#ff9858';
   ctx.fillRect(b.left+xy[0]+spread,b.top+xy[1]-rise,lowFx?2:2+j%3,lowFx?2:2+j%3);
  }
  ctx.restore();return true;
 }
 root.__HAPIL_BODY_ASH_RC145__=Object.freeze({target,living,death,sync,reset,metrics:()=>({...metrics,cacheEntries:cache.size,maxCache:MAX_CACHE,maskSide:MASK_SIDE,maskLevels:LEVELS,maskBytesUpperBound:cache.size*MASK_SIDE*MASK_SIDE*LEVELS*2*4,scratchCanvases:scratch.size,overlayEntries:overlays.size,overlayBytes,maxOverlayBytes:MAX_OVERLAY_BYTES}),policy:Object.freeze({scope:'hostile-enemies',thresholds:[.7,.4,.15],duration:.82,maskLevels:LEVELS})});
})(typeof window!=='undefined'?window:globalThis);
