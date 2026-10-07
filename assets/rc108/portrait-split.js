/* RC108: portrait-only boss/hero viewports. The simulation advances once;
   the two cached camera views alternate one render pass per browser frame. */
(()=>{'use strict';
 const cache=new WeakMap(),cameraCache=new WeakMap();let rendering=false,target='hero',frame=0,lastState=null;
 const stats={frames:0,drawPasses:0,bossPasses:0,heroPasses:0,composites:0,pointerBlocked:0,cameras:{}};
 const touch=()=>window.__HAPIL_MOBILE_V31366__?.enabled?.()===true||document.documentElement.classList.contains('hapil-touch-v31366');
 function active(s){const r=document.querySelector('.game-stage')?.getBoundingClientRect();return !!(s&&touch()&&r&&r.width>0&&r.height>r.width);}
 const point=(project,x,y)=>project(x,y);
 function major(s){const live=(s.enemies??[]).filter(a=>a?.hp>0&&!a.visualOnly&&!a.friendly&&!a.objectiveStructureV31238);
  return live.find(a=>String(a.id)===String(s.targetEnemyId)&&(a.boss||a.midboss))??
   live.filter(a=>a.boss).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0]??
   live.filter(a=>a.midboss).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0]??
   live.filter(a=>a.elite).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0]??null;
 }
 function view(rect=document.querySelector('.game-stage > canvas')?.getBoundingClientRect()??document.querySelector('.game-stage')?.getBoundingClientRect()){const width=720*Math.max(1,rect?.width??390)/Math.max(1,rect?.height??844);return{x:(1280-width)/2,y:0,width,height:720,k:Math.max(1,rect?.height??844)/720};}
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function clampCamera(camera,scale,view){
  const rect=window.__HAPIL_GEOMETRY_V31345__?.bounds;
  if(!rect||![rect.x,rect.y,rect.width,rect.height].every(Number.isFinite))return camera;
  const left=view.x,right=view.x+view.width,top=view.y,bottom=view.y+view.height;
  const axis=(offset,min,max,lo,hi)=>{const a=lo-max*scale,b=hi-min*scale;return a<=b?clamp(offset,a,b):(lo+hi-(min+max)*scale)/2;};
  return{x:axis(camera.x,rect.x,rect.x+rect.width,left,right),y:axis(camera.y,rect.y,rect.y+rect.height,top,bottom),scale};
 }
 function smooth(s,slot,camera,focusId){
  if(camera.rc153WholeBody)return{...camera,portraitSplitRC108:slot};
  let rows=cameraCache.get(s);if(!rows){rows={};cameraCache.set(s,rows);}
  const now=performance.now(),previous=rows[slot];
  if(!previous||previous.zone!==s.zone){rows[slot]={...camera,focusId,zone:s.zone,at:now};return{...camera,portraitSplitRC108:slot};}
  const dt=Math.max(0,Math.min(.08,(now-previous.at)/1000)),amount=1-Math.exp(-dt/.14),dx=(camera.x-previous.x)*amount,dy=(camera.y-previous.y)*amount,step=Math.hypot(dx,dy),maxStep=32,limit=step>maxStep?maxStep/step:1;
  const next={x:previous.x+dx*limit,y:previous.y+dy*limit,scale:camera.scale,focusId,zone:s.zone,at:now};
  rows[slot]=next;return{...camera,x:next.x,y:next.y,scale:next.scale,portraitSplitRC108:slot};
 }
 function camera(s,fallback,project,zone,exit){
  if(!active(s))return null;
  const slot=rendering?target:'hero',boss=slot==='boss'?major(s):null,baseScale=Number(fallback?.scale)||1.05,scale=baseScale*.5;
  // Portrait keeps the two independent tracked views, but shows twice the
  // world width and height in each. Center each tracked actor at this fixed
  // zoom; the 180..540 crop still maps to the matching lower-half pointer ray.
  const heroPoint=point(project,s.x,s.y);
  let next={x:640-heroPoint.x*scale,y:360-heroPoint.y*scale,scale},focusId='hero';
  if(boss){const p=point(project,boss.x,boss.y),lift=boss.boss?21:15;next={x:640-p.x*scale,y:360+lift-p.y*scale,scale};focusId=String(boss.id);}
  const logical=view();
  const arena=window.__HAPIL_BATTLE_ARENA_RC138__?.coverage(s,slot,project,logical);
  next=arena??clampCamera(next,scale,{x:logical.x,y:180,width:logical.width,height:360});
  const resolved=smooth(s,slot,next,focusId);stats.cameras[slot]={x:resolved.x,y:resolved.y,scale:resolved.scale,focusId,...(arena?{side:arena.rc138Side,row:arena.rc138Row,coverage:arena.rc138Coverage}:{})};return resolved;
 }
 function crop(canvas){
  const r=canvas.getBoundingClientRect(),v=view(r);
  const half=Math.floor(canvas.height/2),sourceY=Math.floor((canvas.height-half)/2),left=Math.max(0,Math.floor(v.x*canvas.width/1280)),right=Math.min(canvas.width,Math.ceil((v.x+v.width)*canvas.width/1280));
  return{left,width:Math.max(1,right-left),top:sourceY,height:half,gutterX:Math.min(1,left),tailX:Math.min(1,canvas.width-right),gutterY:Math.min(1,sourceY),tailY:Math.min(1,canvas.height-sourceY-half)};
 }
 function store(canvas,slot){const c=crop(canvas);let map=cache.get(canvas);if(!map||map.width!==canvas.width||map.height!==canvas.height||map.left!==c.left||map.cropWidth!==c.width){
   map={width:canvas.width,height:canvas.height,left:c.left,cropWidth:c.width,cropX:c.left-c.gutterX,cropY:c.top-c.gutterY,copyWidth:c.width+c.gutterX+c.tailX,copyHeight:c.height+c.gutterY+c.tailY,sourceX:c.gutterX,sourceY:c.gutterY,boss:document.createElement('canvas'),hero:document.createElement('canvas'),ready:{boss:false,hero:false}};
   for(const key of ['boss','hero']){map[key].width=map.copyWidth;map[key].height=map.copyHeight;}cache.set(canvas,map);
  }
  const copy=map[slot],ctx=copy.getContext('2d');if(ctx){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,copy.width,copy.height);ctx.drawImage(canvas,map.cropX,map.cropY,map.copyWidth,map.copyHeight,0,0,map.copyWidth,map.copyHeight);map.ready[slot]=true;}stats.viewportCrop={...c};return map;
 }
 function render(canvas,s,images,hero,settings,draw){
  const box=canvas.getBoundingClientRect();canvas.classList?.toggle('rc154-portrait-composite',active(s));if(!active(s)||!box.width||!box.height){cache.delete(canvas);draw(canvas,s,images,hero,settings);return;}
  target=frame++%2===0?'boss':'hero';rendering=true;
  // Only this central crop reaches either viewport. Retain its sampling gutter
  // while clipping invisible native paint; camera, backing size and draw cadence
  // are unchanged. A native resize resets the clip for that first resized frame.
  const native=canvas.getContext('2d'),height=canvas.height,halfHeight=Math.floor(height/2),crop=Math.floor((height-halfHeight)/2),gutter=Math.min(1,crop),tail=Math.min(1,height-crop-halfHeight);
  native?.save();
  try{if(native){native.setTransform(1,0,0,1,0,0);native.beginPath();native.rect(0,crop-gutter,canvas.width,halfHeight+gutter+tail);native.clip();}draw(canvas,s,images,hero,settings);stats.drawPasses++;if(target==='boss')stats.bossPasses++;else stats.heroPasses++;}
  finally{const enabled=native?.imageSmoothingEnabled,quality=native?.imageSmoothingQuality;native?.restore();if(native){native.imageSmoothingEnabled=enabled;native.imageSmoothingQuality=quality;}rendering=false;}
  const map=store(canvas,target),other=target==='boss'?'hero':'boss';
  if(!map.ready[other]){const ctx=map[other].getContext('2d');ctx?.drawImage(map[target],0,0);map.ready[other]=true;}
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,half=Math.floor(h/2),sourceY=map.sourceY;
  if(!ctx)return;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.clearRect(0,0,w,h);ctx.fillStyle='#020610';ctx.fillRect(0,0,w,h);
  // Copy the actual horizontal viewport as well as the central vertical half.
  // Its displayed aspect matches each CSS pane; bodies and weapons stay isotropic.
  ctx.drawImage(map.boss,map.sourceX,sourceY,map.cropWidth,half,0,0,w,half);ctx.drawImage(map.hero,map.sourceX,sourceY,map.cropWidth,half,0,half,w,h-half);
  ctx.fillStyle='rgba(220,240,255,.66)';ctx.fillRect(0,half-1,w,2);stats.frames++;stats.composites++;lastState=s;
  window.__HAPIL_AWAKENING_PORTRAITS_RC137__?.drawFlashOverlay?.(ctx,s,canvas);
 }
 function pointerBlocked(event,rect){if(!active(lastState)||!event||!rect)return false;const blocked=event.clientY<rect.top+rect.height/2;if(blocked)stats.pointerBlocked++;return blocked;}
 function pointer(event,rect,base){if(!active(lastState)||typeof base!=='function'||event.clientY<rect.top+rect.height/2)return null;const point=base(event,rect),half=rect.height/2,v=Math.max(0,Math.min(1,(event.clientY-rect.top-half)/half));const logical=view(rect);return point?{x:logical.x+(event.clientX-rect.left)/rect.width*logical.width,y:180+v*360}:null;}
 function shouldRender(canvas,s){const box=canvas?.getBoundingClientRect?.(),enabled=active(s)&&box?.width>0&&box?.height>0;canvas?.classList?.toggle('rc154-portrait-composite',!!enabled);return enabled&&!rendering;}
 window.__HAPIL_PORTRAIT_SPLIT_RC108__=Object.freeze({version:'RC154',view,crop,active,shouldRender,render,camera,pointer,pointerBlocked,metrics:()=>({...stats,cameras:{...stats.cameras},rendering,target,frame}),policy:{portraitWorldRangeMultiplier:2,desktopAndLandscapeUnchanged:true}});
})();
