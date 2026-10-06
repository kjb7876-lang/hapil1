/* RC145 local preview: alpha-bound wounds and cached body erosion for two actors. */
(function(root){
 'use strict';
 const IDS=new Set(['dist01-sp1','inner-evil-rc133']),MAX_CACHE=4,LEVELS=9;
 const cache=new Map(),metrics={livingFrames:0,deathFrames:0,maskBuilds:0,maskPixelsBuilt:0,framePixelScans:0,evictions:0};
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
 const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const persona=a=>(a?.sourceActorIdRC145??a?.id)==='inner-evil-rc133';
 const target=a=>IDS.has(a?.sourceActorIdRC145??a?.id);
 const hash=(x,y,seed)=>{let h=Math.imul(x+17,374761393)^Math.imul(y+29,668265263)^Math.imul(seed+11,2246822519);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295;};
 function entry(sprite,size,actor){
  const span=Math.max(112,Math.min(480,Math.ceil(size*2.15/2)*2)),key=[sprite,Math.round(size),persona(actor)?'persona':'mob'].join('|');
  let item=cache.get(key);if(item){cache.delete(key);cache.set(key,item);return item;}
  item={key,width:span,height:span,body:canvas(span,span),masks:null,rims:null,edge:[],maxDistance:0};
  cache.set(key,item);if(cache.size>MAX_CACHE){cache.delete(cache.keys().next().value);metrics.evictions++;}
  return item;
 }
 function body(item,draw,center){
  const ctx=item.body.getContext('2d'),left=center.x-item.width/2,top=center.y-item.height/2;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,item.width,item.height);
  ctx.save();ctx.translate(-left,-top);draw(ctx);ctx.restore();return{ctx,left,top};
 }
 function lines(ctx,size,ratio,time,isPersona,death=false){
  const strength=death?1:clamp((.7-ratio)/.7,0,1),stage=death||ratio<=.15?3:ratio<=.4?2:1;
  if(strength<=0)return;
  const cx=ctx.canvas.width/2,cy=ctx.canvas.height/2,count=stage===1?2:stage===2?4:6;
  ctx.save();ctx.globalCompositeOperation='source-atop';
  if(stage===3){ctx.fillStyle=isPersona?'rgba(24,3,14,.26)':'rgba(25,8,7,.38)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);}
  for(let j=0;j<count;j++){
   const x=cx+size*((j-(count-1)/2)*.105),top=cy-size*(.82-(j%3)*.055),bottom=cy-size*(.12+(j%2)*.04),bend=size*(j%2?.075:-.075);
   const trace=()=>{ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x+bend*.36,top+(bottom-top)*.31);ctx.lineTo(x-bend*.42,top+(bottom-top)*.57);ctx.lineTo(x+bend,bottom);};
   trace();ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=isPersona?'rgba(29,1,13,.95)':'rgba(52,8,8,.9)';ctx.lineWidth=Math.max(1.6,size*(stage===3?.027:.018));ctx.stroke();
   if(stage>1){trace();ctx.strokeStyle=isPersona?'rgba(169,23,50,.8)':'rgba(247,70,37,.85)';ctx.lineWidth=Math.max(.8,size*(stage===3?.011:.008));ctx.stroke();}
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
 function prepareMasks(item,isPersona){
  if(item.masks)return;
  const {width:w,height:h}=item,source=item.body.getContext('2d').getImageData(0,0,w,h).data,n=w*h,dist=new Float32Array(n),edge=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,inside=source[i*4+3]>30;dist[i]=inside?Math.min(x+1,y+1,w-x,h-y):0;}
  const d=Math.SQRT2;
  for(let y=1;y<h;y++)for(let x=1;x<w;x++){const i=y*w+x;if(!dist[i])continue;dist[i]=Math.min(dist[i],dist[i-1]+1,dist[i-w]+1,dist[i-w-1]+d,x<w-1?dist[i-w+1]+d:Infinity);}
  for(let y=h-2;y>=0;y--)for(let x=w-2;x>=0;x--){const i=y*w+x;if(!dist[i])continue;dist[i]=Math.min(dist[i],dist[i+1]+1,dist[i+w]+1,dist[i+w+1]+d,x>0?dist[i+w-1]+d:Infinity);}
  let max=1;for(let i=0;i<n;i++){if(dist[i]>max)max=dist[i];if(dist[i]>0&&dist[i]<2.4&&hash(i%w,Math.floor(i/w),3)>.94)edge.push([i%w,Math.floor(i/w)]);}
  item.maxDistance=max;item.edge=edge.slice(0,96);item.masks=[];item.rims=[];
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
  metrics.maskBuilds++;metrics.maskPixelsBuilt+=n;
 }
 function living({ctx,actor,sprite,size,center,time,drawBody}){
  if(!target(actor)||typeof drawBody!=='function')return false;
  const ratio=clamp(actor.hp/Math.max(1,actor.maxHp),0,1);metrics.livingFrames++;
  if(ratio>=.7){drawBody(ctx);return true;}
  const item=entry(sprite,size,actor),b=body(item,drawBody,center);lines(b.ctx,size,ratio,time,persona(actor));
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.drawImage(item.body,b.left,b.top);ctx.restore();return true;
 }
 function death({ctx,actor,sprite,size,center,progress,time,drawBody,lowFx,ready}){
  if(!target(actor)||!ready||typeof drawBody!=='function')return false;
  const item=entry(sprite,size,actor),b=body(item,drawBody,center),p=clamp(progress,0,1),isPersona=persona(actor);metrics.deathFrames++;
  if(!item.masks)prepareMasks(item,isPersona);
  if(p<.125){b.ctx.save();b.ctx.globalCompositeOperation='source-atop';b.ctx.fillStyle=isPersona?`rgba(255,215,228,${.48*(1-p/.125)})`:`rgba(255,236,190,${.52*(1-p/.125)})`;b.ctx.fillRect(0,0,item.width,item.height);b.ctx.restore();}
  else{
   lines(b.ctx,size,0,time,isPersona,true);
   b.ctx.save();b.ctx.globalCompositeOperation='source-atop';b.ctx.fillStyle=isPersona?'rgba(21,1,11,.25)':'rgba(22,7,4,.36)';b.ctx.fillRect(0,0,item.width,item.height);b.ctx.restore();
   const level=Math.min(LEVELS-1,Math.floor(clamp((p-.125)/.875,0,1)*(LEVELS-1)+.5));
   b.ctx.save();b.ctx.globalCompositeOperation='destination-in';b.ctx.drawImage(item.masks[level],0,0);b.ctx.restore();
   b.ctx.save();b.ctx.globalCompositeOperation='source-over';b.ctx.drawImage(item.rims[level],0,0);b.ctx.restore();
  }
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.drawImage(item.body,b.left,b.top);
  const pieces=lowFx?8:16,count=item.edge.length;
  for(let j=0;j<pieces&&count;j++){
   const k=(j*17+Math.floor(p*7))%count,xy=item.edge[k],rise=(6+j%5*4)*p*size/70,spread=(j%2?1:-1)*p*(5+j%3*4);
   ctx.globalAlpha=(1-p)*(.55+.28*hash(j,0,9));ctx.fillStyle=isPersona?j%4?'#fff8fa':'#b95668':j%3?'#d8c6bb':'#ff9858';
   ctx.fillRect(b.left+xy[0]+spread,b.top+xy[1]-rise,lowFx?2:2+j%3,lowFx?2:2+j%3);
  }
  ctx.restore();return true;
 }
 root.__HAPIL_BODY_ASH_RC145__=Object.freeze({target,living,death,metrics:()=>({...metrics,cacheEntries:cache.size,maxCache:MAX_CACHE}),policy:Object.freeze({ids:[...IDS],thresholds:[.7,.4,.15],duration:.82,maskLevels:LEVELS})});
})(typeof window!=='undefined'?window:globalThis);
