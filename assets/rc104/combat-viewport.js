/* Camera presentation only: fit live threats, preserve native world coordinates. */
(()=>{'use strict';
 const maps=new Map(),cache=new WeakMap(),initialSize={width:window.visualViewport?.width||innerWidth,height:window.visualViewport?.height||innerHeight};let revision=0,size=initialSize,backingSize={...initialSize},backingTimer=0;
 const key=p=>String(p||'').replace(/^\.\//,'').split('?')[0];
 function currentSize(){return{width:window.visualViewport?.width||innerWidth,height:window.visualViewport?.height||innerHeight};}
 function commitBackingSize(){backingTimer=0;backingSize={...size};}
 // Keep camera and CSS on the live viewport; settle only the render-resolution budget.
 function resize(){const next=currentSize();if(next.width===size.width&&next.height===size.height)return;size=next;revision++;
  const orientationChanged=(next.width>next.height)!==(backingSize.width>backingSize.height),widthChanged=Math.abs(next.width-backingSize.width)>96;
  if(orientationChanged||widthChanged){clearTimeout(backingTimer);commitBackingSize();return;}
  clearTimeout(backingTimer);backingTimer=0;
  if(next.width===backingSize.width&&next.height===backingSize.height)return;
  backingTimer=setTimeout(commitBackingSize,180);
 }
 addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);window.addEventListener('orientationchange',resize);
 const touch=()=>document.documentElement.classList.contains('hapil-touch-v31366');
 function view(width=size.width,height=size.height){const k=Math.max(width/1280,height/720);return{x:(1280-width/k)/2,y:(720-height/k)/2,width:width/k,height:height/k,k};}
 function pointer(e,r){if(!touch())return{x:(e.clientX-r.left)*1280/r.width,y:(e.clientY-r.top)*720/r.height};const v=view(r.width,r.height);return{x:v.x+(e.clientX-r.left)/v.k,y:v.y+(e.clientY-r.top)/v.k};}
 function recordMapRect(path,r){if(r&&[r.x,r.y,r.width,r.height].every(Number.isFinite))maps.set(key(path),{...r});}
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function camera(s,fallback,project,zone,exit){
  if(!s||!zone)return fallback;
  const previous=cache.get(s);if(previous?.time===s.time&&previous.x===s.x&&previous.y===s.y&&previous.zone===s.zone&&previous.revision===revision)return previous.camera;
  const map=maps.get(key(zone.map)),mobile=touch();let result=fallback;
  if(!mobile){if(map){const scale=Math.min(1256/map.width,680/map.height);result={x:640-(map.x+map.width/2)*scale,y:360-(map.y+map.height/2)*scale,scale,wholeMapV31345:true};}}
  else {
   const v=view(),safe={left:v.x+12/v.k,right:v.x+v.width-12/v.k,top:v.y+60/v.k,bottom:v.y+v.height-Math.min(116,size.height*.23)/v.k};
   let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
   function include(a,half=30,head=75){if(!a||!Number.isFinite(a.x)||!Number.isFinite(a.y))return;const p=project(a.x,a.y);left=Math.min(left,p.x-half);right=Math.max(right,p.x+half);top=Math.min(top,p.y-head);bottom=Math.max(bottom,p.y+30);}
   include(s,36,90);const enemies=(s.enemies||[]).filter(a=>a.hp>0);for(const a of enemies)include(a,a.boss?130:40,a.boss?260:95);
   for(const field of ['hostileProjectiles','pendingHits','telekineticCasts','spatialRiftCasts','narrativeCasts'])for(const a of s[field]||[])if(Math.hypot(a.x-s.x,a.y-s.y)<12)include(a,42,42);
   if(!enemies.length)include(exit,35,65);
   const hero=project(s.x,s.y),portrait=size.height>size.width;
   // Actor bounds and render resolution both change during combat. Neither may
   // resize the world on screen: keep one mobile camera zoom and pan around it.
   // When all live threats fit at this zoom, preserve the old safe-area fit;
   // when they do not, keep the hero centered instead of zooming out or in.
   const scale=1.0;
   function offset(min,max,lo,hi,mapMin,mapMax,viewMin,viewMax){const a=lo-min*scale,b=hi-max*scale,axis=lo===safe.left?'x':'y',ideal=portrait?(lo+hi)/2-(axis==='x'?hero.x:hero.y)*scale:(a+b)/2;let x=a<=b?clamp(ideal,a,b):portrait?(lo+hi)/2-(axis==='x'?hero.x:hero.y)*scale:(a+b)/2;if(map&&!portrait){const ma=viewMax-mapMax*scale,mb=viewMin-mapMin*scale;x=clamp((ma+mb)/2,Math.min(a,b),Math.max(a,b));if(Math.max(a,ma)<=Math.min(b,mb))x=clamp(x,Math.max(a,ma),Math.min(b,mb));}return x;}
   result={x:offset(left,right,safe.left,safe.right,map?.x,map?.x+map?.width,v.x,v.x+v.width),y:offset(top,bottom,safe.top,safe.bottom,map?.y,map?.y+map?.height,v.y,v.y+v.height),scale,combatViewportRC104:true};
   api.last={view:v,safe,protected:{left,right,top,bottom},map,camera:result,enemyCount:enemies.length,zoomPolicy:'fixed-mobile-1.00'};
  }
  cache.set(s,{time:s.time,x:s.x,y:s.y,zone:s.zone,revision,camera:result});return result;
 }
 const api={camera,pointer,recordMapRect,view,backingViewport:()=>({...backingSize}),last:null};window.__HAPIL_VIEWPORT_RC104__=api;
})();
