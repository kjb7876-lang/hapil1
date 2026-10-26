/* RC223: saved presentation-only view range.
 * Camera math is intentionally isolated from settings/game saves and simulation. */
(()=>{'use strict';
 const root=window,KEY='hapil.rc223.viewFactor',listeners=new Set();
 let choice=null,persisted=false,probeDepth=0;
 const metrics={applied:0,probeScopes:0,probeCameraCalls:0,last:null,lastProbeCamera:null};
 const finite=(v,d)=>Number.isFinite(Number(v))?Number(v):d;
 function normalize(value){if(value===null||value===undefined||value==='')return null;const n=Number(value);if(!Number.isFinite(n))return null;return Math.max(1,Math.min(2,Math.round((n+Number.EPSILON)*20)/20));}
 function readChoice(){try{return normalize(root.localStorage?.getItem(KEY));}catch{return null;}}
 choice=readChoice();persisted=choice!==null;
 function mobileDevice(){
  const nav=root.navigator??{},ua=String(nav.userAgent??'');
  return nav.userAgentData?.mobile===true||/android|iphone|ipod|ipad|mobile/i.test(ua)||(nav.platform==='MacIntel'&&Number(nav.maxTouchPoints??0)>1);
 }
 function mobile(){return mobileDevice();}
 function factor(){return choice??(mobile()?2:1);}
 function cameraCopy(camera,seen=new WeakMap()){
  if(!camera||typeof camera!=='object')return camera??null;if(seen.has(camera))return seen.get(camera);
  const copy=Array.isArray(camera)?[]:{};seen.set(camera,copy);
  for(const [key,value] of Object.entries(camera))copy[key]=value&&typeof value==='object'?cameraCopy(value,seen):value;
  return copy;
 }
 function anchorCopy(anchor){return{x:finite(anchor?.x,640),y:finite(anchor?.y,360)};}
 // The view slider expands composition gently so the full-stage background
 // does not collapse into a small centered island at the upper setting. On
 // ultra-wide, short screens keep the authored arena at its base scale: its
 // width is already close to the 90% full-canvas floor.
 function aspectAllowance(viewport){
  // Visual viewport height can flicker by a pixel with browser chrome/pinch
  // even while the game canvas and layout viewport stay fixed. It must not
  // switch the world between 100% and 105% at the 3.3 aspect boundary.
  const width=finite(viewport?.width,finite(root.innerWidth,0)),height=finite(viewport?.height,finite(root.innerHeight,0));
  // Spend only the remaining aspect room near the short-screen limit. This
  // reaches zero continuously, instead of jumping five percent at one pixel.
  return height>0&&width>0?Math.min(.05,Math.max(0,3.3*height/width-1)):.05;
 }
 function requestedZoom(value=factor(),viewport){return 1+(value-1)*aspectAllowance(viewport);}
 function mapCoverage(camera){const width=camera?.rc153View?.width,mapWidth=camera?.rc153MapWidth;return camera?.rc153WholeBody&&Number.isFinite(width)&&width>0&&Number.isFinite(mapWidth)&&mapWidth>0&&Number.isFinite(camera.scale)?mapWidth*camera.scale/width:null;}
 function appliedZoom(value=factor(),viewport,camera=metrics.last?.base){
  const requested=requestedZoom(value,viewport),coverage=mapCoverage(camera);
  // A saved presentation preference never changes actor size/contact fitting.
  // Limit only its final optional shrink when the fitted map is already near
  // the 90% floor. An impossible base fit keeps full-body/safe-area priority.
  return coverage===null?requested:Math.max(1,Math.min(requested,coverage/.9));
 }
 function defaultAnchor(){
  try{const view=root.__HAPIL_VIEWPORT_RC104__?.view?.();if(view&&[view.x,view.y,view.width,view.height].every(Number.isFinite)&&view.width>0&&view.height>0)return{x:view.x+view.width/2,y:view.y+view.height/2};}catch{}
  return{x:640,y:360};
 }
 function snapshot(){return Object.freeze({factor:factor(),saved:persisted,mobile:mobile(),key:KEY,step:.05});}
 function notify(){const value=snapshot();for(const listener of [...listeners])try{listener(value);}catch{}}
 function setFactor(value){const next=normalize(value);if(next===null)return factor();choice=next;persisted=false;try{if(root.localStorage){root.localStorage.setItem(KEY,String(next));persisted=true;}}catch{}notify();return next;}
 function onStorage(event){
  if(!event)return;let local;try{local=root.localStorage;}catch{return;}
  if(event.storageArea!==local||(event.key!==KEY&&event.key!==null))return;
  choice=event.key===null?null:normalize(event.newValue);persisted=choice!==null;notify();
 }
 try{root.addEventListener?.('storage',onStorage);}catch{}
 function applyCamera(camera,anchor){
  if(!camera||typeof camera!=='object'||!Number.isFinite(camera.scale))return camera;
  if(probeDepth>0){metrics.probeCameraCalls++;metrics.lastProbeCamera=cameraCopy(camera);return camera;}
  // The fitted arena owns its viewport for this frame. Sampling a second live
  // viewport here moved the final anchor despite a stable RC153 base camera.
  const fitted=camera.rc153View,fittedAnchor=fitted&&[fitted.x,fitted.y,fitted.width,fitted.height].every(Number.isFinite)&&fitted.width>0&&fitted.height>0?{x:fitted.x+fitted.width/2,y:fitted.y+fitted.height/2}:null;
  const viewAnchor=anchorCopy(fittedAnchor??anchor??defaultAnchor()),zoom=factor(),requested=requestedZoom(zoom,camera.rc153Viewport),scaleFactor=appliedZoom(zoom,camera.rc153Viewport,camera);
  const adjusted=scaleFactor===1?camera:{...camera,x:viewAnchor.x+(finite(camera.x,viewAnchor.x)-viewAnchor.x)/scaleFactor,y:viewAnchor.y+(finite(camera.y,viewAnchor.y)-viewAnchor.y)/scaleFactor,scale:camera.scale/scaleFactor};
  const previousReadout=metrics.last?Math.round(metrics.last.appliedZoom*100):null;
  metrics.applied++;metrics.last={base:cameraCopy(camera),adjusted:cameraCopy(adjusted),anchor:viewAnchor,factor:zoom,requestedZoom:requested,appliedZoom:scaleFactor,mapFloorLimited:scaleFactor<requested-1e-12,baseMapCoverage:mapCoverage(camera),portraitSplitRC108:camera.portraitSplitRC108??null};
  // Settings can stay open through a real resize. Notify only when its visible
  // percentage changes; ordinary camera reads do not schedule UI work.
  if(previousReadout!==Math.round(scaleFactor*100))notify();
  return adjusted;
 }
 function withBaseCamera(callback){
  if(typeof callback!=='function')throw new TypeError('withBaseCamera requires a function');
  probeDepth++;metrics.probeScopes++;
  try{return callback();}finally{probeDepth--;}
 }
 function subscribe(listener){if(typeof listener!=='function')return()=>{};listeners.add(listener);return()=>listeners.delete(listener);}
 function diagnostics(){return Object.freeze({...metrics,last:metrics.last?Object.freeze({...metrics.last,base:cameraCopy(metrics.last.base),adjusted:cameraCopy(metrics.last.adjusted),anchor:{...metrics.last.anchor}}):null,lastProbeCamera:cameraCopy(metrics.lastProbeCamera),baseCameraDepth:probeDepth});}
 root.__HAPIL_CAMERA_RC223__=Object.freeze({installed:true,version:'RC223',key:KEY,mobile,factor,requestedZoom,appliedZoom,snapshot,setFactor,applyCamera,withBaseCamera,baseCameraActive:()=>probeDepth>0,subscribe,diagnostics});
})();
