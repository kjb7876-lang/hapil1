/* RC108: portrait-only boss/hero viewports. The simulation advances once;
   the two cached camera views alternate one render pass per browser frame. */
(()=>{'use strict';
 const cache=new WeakMap();let rendering=false,target='hero',frame=0,lastState=null;
 const stats={frames:0,drawPasses:0,bossPasses:0,heroPasses:0,composites:0,pointerBlocked:0};
 const touch=()=>window.__HAPIL_MOBILE_V31366__?.enabled?.()===true||document.documentElement.classList.contains('hapil-touch-v31366');
 function active(s){const r=document.querySelector('.game-stage')?.getBoundingClientRect();return !!(s&&touch()&&r&&r.width>0&&r.height>r.width);}
 const point=(project,x,y)=>project(x,y);
 function major(s){const live=(s.enemies??[]).filter(a=>a?.hp>0&&!a.visualOnly&&!a.friendly&&!a.objectiveStructureV31238);
  return live.find(a=>String(a.id)===String(s.targetEnemyId)&&(a.boss||a.midboss))??
   live.filter(a=>a.boss).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0]??
   live.filter(a=>a.midboss).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0]??
   live.filter(a=>a.elite).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0]??null;
 }
 function camera(s,fallback,project,zone,exit){
  if(!active(s))return null;
  const slot=rendering?target:'hero',boss=slot==='boss'?major(s):null,focus=boss??(slot==='hero'?s:null);
  if(!focus){const p=exit??{x:16,y:10},q=point(project,p.x,p.y);return{x:640-q.x*.75,y:360-q.y*.75,scale:.75,portraitSplitRC108:slot};}
  const p=point(project,focus.x,focus.y),lift=boss?(boss.boss?58:42):26,scale=.75;
  return{x:640-p.x*scale,y:360-(p.y-lift)*scale,scale,portraitSplitRC108:slot};
 }
 function store(canvas,slot){let map=cache.get(canvas);if(!map||map.width!==canvas.width||map.height!==canvas.height){map={width:canvas.width,height:canvas.height,boss:document.createElement('canvas'),hero:document.createElement('canvas'),ready:{boss:false,hero:false}};cache.set(canvas,map);}
  const copy=map[slot];if(copy.width!==canvas.width)copy.width=canvas.width;if(copy.height!==canvas.height)copy.height=canvas.height;
  const ctx=copy.getContext('2d');if(ctx){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,copy.width,copy.height);ctx.drawImage(canvas,0,0);map.ready[slot]=true;}return map;
 }
 function render(canvas,s,images,hero,settings,draw){
  const box=canvas.getBoundingClientRect();if(!active(s)||!box.width||!box.height){cache.delete(canvas);draw(canvas,s,images,hero,settings);return;}
  target=frame++%2===0?'boss':'hero';rendering=true;
  try{draw(canvas,s,images,hero,settings);stats.drawPasses++;if(target==='boss')stats.bossPasses++;else stats.heroPasses++;}
  finally{rendering=false;}
  const map=store(canvas,target),other=target==='boss'?'hero':'boss';
  if(!map.ready[other]){const ctx=map[other].getContext('2d');map[other].width=canvas.width;map[other].height=canvas.height;ctx?.drawImage(map[target],0,0);map.ready[other]=true;}
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,half=Math.floor(h/2),paneRatio=box.width/(box.height/2),sw=Math.min(w,h*paneRatio),sx=(w-sw)/2;
  if(!ctx)return;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.clearRect(0,0,w,h);ctx.fillStyle='#020610';ctx.fillRect(0,0,w,h);
  ctx.drawImage(map.boss,sx,0,sw,h,0,0,w,half);ctx.drawImage(map.hero,sx,0,sw,h,0,half,w,h-half);
  ctx.fillStyle='rgba(220,240,255,.66)';ctx.fillRect(0,half-1,w,2);stats.frames++;stats.composites++;lastState=s;
 }
 function pointerBlocked(event,rect){if(!active(lastState)||!event||!rect)return false;const blocked=event.clientY<rect.top+rect.height/2;if(blocked)stats.pointerBlocked++;return blocked;}
 function pointer(event,rect,base){if(!active(lastState)||typeof base!=='function'||event.clientY<rect.top+rect.height/2)return null;const half=rect.height/2,u=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),v=Math.max(0,Math.min(1,(event.clientY-rect.top-half)/half)),pane=720*rect.width/half;return{x:(1280-pane)/2+u*pane,y:v*720};}
 function shouldRender(canvas,s){return active(s)&&!rendering;}
 window.__HAPIL_PORTRAIT_SPLIT_RC108__=Object.freeze({version:'RC108',active,shouldRender,render,camera,pointer,pointerBlocked,metrics:()=>({...stats,rendering,target,frame})});
})();
