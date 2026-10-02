/* RC125: presentation only. One native world render; unchanged world coordinates,
   laser geometry, health, timers and saves. Portrait keeps RC115's split cameras. */
(()=>{'use strict';
 const root=document.documentElement,maps=new Map();
 let installed=false,canvas=null,stage=null,observer=null,screen=null,domObserver=null,revision=0;
 let box={width:1280,height:720},lastWorld=null,lastCamera=null,frames=0,base=null;
 const clean=p=>String(p||'').replace(/^\.\//,'').split('?')[0];
 const finiteRect=r=>r&&[r.x,r.y,r.width,r.height].every(Number.isFinite)&&r.width>0&&r.height>0;
 const touch=()=>root.classList.contains('hapil-touch-v31366');
 const wide=()=>installed&&!!canvas&&canvas.isConnected&&(!touch()||box.width>=box.height);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function measure(){if(!stage)return;const r=stage.getBoundingClientRect();if(r.width>0&&r.height>0&&(r.width!==box.width||r.height!==box.height)){box={width:r.width,height:r.height};revision++;}}
 function bind(){
  const next=document.querySelector('.game-stage > canvas'),nextScreen=document.getElementById('root')?.firstElementChild;
  if(nextScreen!==screen&&domObserver){domObserver.disconnect();const host=document.getElementById('root');if(host)domObserver.observe(host,{childList:true});if(nextScreen)domObserver.observe(nextScreen,{childList:true,attributes:true,attributeFilter:['class']});screen=nextScreen;}
  if(next!==canvas){observer?.disconnect();canvas=next;stage=canvas?.parentElement??null;revision++;if(stage&&typeof ResizeObserver==='function'){observer=new ResizeObserver(measure);observer.observe(stage);}}
  const active=!!canvas&&installed;if(root.classList.contains('rc125-adaptive')!==active)root.classList.toggle('rc125-adaptive',active);
  if(canvas&&canvas.getAttribute('aria-label')!=='반응형 2.5D 아이소메트릭 전장')canvas.setAttribute('aria-label','반응형 2.5D 아이소메트릭 전장');
  measure();
 }
 function view(width=box.width,height=box.height){
  width=Math.max(1,Number(width)||1280);height=Math.max(1,Number(height)||720);
  const k=Math.min(width/1280,height/720);
  return{x:(1280-width/k)/2,y:(720-height/k)/2,width:width/k,height:height/k,k};
 }
 function mapRect(s,zone){const geo=window.__HAPIL_GEOMETRY_V31345__,profile=geo?.profile?.(s?.zone)?.rect,r=maps.get(clean(zone?.map))??profile??geo?.bounds;return finiteRect(r)?r:{x:-152,y:-60,width:1584,height:990};}
 function camera(s,fallback,project,zone,exit){
  if(!wide()||!s||!zone)return base.camera(s,fallback,project,zone,exit);
  const v=view(),rect=mapRect(s,zone),mobile=touch(),pad=12/v.k;
  let result,safe={left:v.x+pad,right:v.x+v.width-pad,top:v.y+pad,bottom:v.y+v.height-pad};
  if(!mobile){const scale=Math.min((v.width-pad*2)/rect.width,(v.height-pad*2)/rect.height);result={x:640-(rect.x+rect.width/2)*scale,y:360-(rect.y+rect.height/2)*scale,scale,wholeMapV31345:true,adaptiveRC125:true};}
  else {
   const scale=1.05,hero=project(s.x,s.y),automatic=root.classList.contains('hapil-mobile-auto-v31311');
   if(!hero||!Number.isFinite(hero.x)||!Number.isFinite(hero.y))return fallback;
   safe={...safe,top:v.y+16/v.k,bottom:v.y+v.height-(automatic?16:86)/v.k};
   let left=hero.x-36,right=hero.x+36,top=hero.y-90,bottom=hero.y+30;
   const live=(s.enemies||[]).filter(a=>a?.hp>0&&!a.visualOnly&&!a.friendly);
   for(const a of live){const p=project(a.x,a.y);if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;const half=a.boss?130:40;left=Math.min(left,p.x-half);right=Math.max(right,p.x+half);top=Math.min(top,p.y-(a.boss?260:95));bottom=Math.max(bottom,p.y+30);}
   if(!live.length&&exit){const p=project(exit.x,exit.y);if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){left=Math.min(left,p.x-35);right=Math.max(right,p.x+35);top=Math.min(top,p.y-65);bottom=Math.max(bottom,p.y+30);}}
   function axis(min,max,lo,hi,focus,mapMin,mapMax,vmin,vmax){const a=lo-min*scale,b=hi-max*scale;let x=(lo+hi)/2-focus*scale;if(a<=b)x=clamp(x,a,b);const ma=vmax-mapMax*scale,mb=vmin-mapMin*scale;if(ma<=mb)x=clamp(x,ma,mb);else x=(vmin+vmax-(mapMin+mapMax)*scale)/2;return x;}
   result={x:axis(left,right,safe.left,safe.right,hero.x,rect.x,rect.x+rect.width,v.x,v.x+v.width),y:axis(top,bottom,safe.top,safe.bottom,hero.y,rect.y,rect.y+rect.height,v.y,v.y+v.height),scale,combatViewportRC104:true,adaptiveRC125:true};
  }
  lastCamera={view:v,safe,map:rect,camera:result,revision,zoomPolicy:mobile?'fixed-mobile-1.05':'whole-map-adaptive'};
  window.__HAPIL_VIEWPORT_RC104__.last=lastCamera;return result;
 }
 function pointer(event,rect){if(!wide())return base.pointer(event,rect);if(!event||!rect||rect.width<=0||rect.height<=0)return null;const v=view(rect.width,rect.height);return{x:v.x+(event.clientX-rect.left)/v.k,y:v.y+(event.clientY-rect.top)/v.k};}
 function applyWorld(ctx,target,state){
  if(target!==canvas)bind();if(!wide()||target!==canvas)return false;
  const v=view(),rx=1280/v.width,ry=720/v.height;
  // Fixed backing dimensions stay within the existing performance budget. The
  // inverse CSS aspect transform makes the FINAL displayed world isotropic.
  ctx.transform(rx,0,0,ry,-v.x*rx,-v.y*ry);
  frames++;lastWorld={view:v,rx,ry,cssWidth:box.width,cssHeight:box.height,backingWidth:target.width,backingHeight:target.height,zone:state?.zone,revision};return true;
 }
 function install(){
  if(installed)return true;const previous=window.__HAPIL_VIEWPORT_RC104__;
  if(!previous||typeof previous.camera!=='function'||typeof previous.pointer!=='function')return false;
  base={camera:previous.camera,pointer:previous.pointer,view:previous.view,recordMapRect:previous.recordMapRect};
  previous.camera=camera;previous.pointer=pointer;
  previous.view=(...args)=>wide()?view(...args):base.view(...args);
  previous.recordMapRect=(path,r)=>{base.recordMapRect(path,r);if(finiteRect(r))maps.set(clean(path),{...r});};
  installed=true;
  if(typeof MutationObserver==='function'){domObserver=new MutationObserver(bind);const host=document.getElementById('root');if(host)domObserver.observe(host,{childList:true});}
  bind();addEventListener('resize',measure,{passive:true});window.visualViewport?.addEventListener('resize',measure,{passive:true});
  return true;
 }
 window.__HAPIL_ADAPTIVE_RC125__=Object.freeze({version:'RC125',install,applyWorld,view,mapRect,wide,get installed(){return installed;},snapshot:()=>({installed,wide:wide(),box:{...box},revision,frames,lastWorld,lastCamera})});
})();
