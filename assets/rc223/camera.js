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
 function defaultAnchor(){
  try{const view=root.__HAPIL_VIEWPORT_RC104__?.view?.();if(view&&[view.x,view.y,view.width,view.height].every(Number.isFinite)&&view.width>0&&view.height>0)return{x:view.x+view.width/2,y:view.y+view.height/2};}catch{}
  return{x:640,y:360};
 }
 function snapshot(){return Object.freeze({factor:factor(),saved:persisted,mobile:mobile(),key:KEY,step:.05});}
 function notify(){const value=snapshot();for(const listener of [...listeners])try{listener(value);}catch{}}
 function setFactor(value){const next=normalize(value);if(next===null)return factor();choice=next;persisted=false;try{if(root.localStorage){root.localStorage.setItem(KEY,String(next));persisted=true;}}catch{}notify();return next;}
 function onStorage(event){if(event?.key!==KEY)return;choice=normalize(event.newValue);persisted=choice!==null;notify();}
 try{root.addEventListener?.('storage',onStorage);}catch{}
 function applyCamera(camera,anchor){
  if(!camera||typeof camera!=='object'||!Number.isFinite(camera.scale))return camera;
  if(probeDepth>0){metrics.probeCameraCalls++;metrics.lastProbeCamera=cameraCopy(camera);return camera;}
  const viewAnchor=anchorCopy(anchor??defaultAnchor()),zoom=factor();
  const adjusted=zoom===1?camera:{...camera,x:viewAnchor.x+(finite(camera.x,viewAnchor.x)-viewAnchor.x)/zoom,y:viewAnchor.y+(finite(camera.y,viewAnchor.y)-viewAnchor.y)/zoom,scale:camera.scale/zoom};
  metrics.applied++;metrics.last={base:cameraCopy(camera),adjusted:cameraCopy(adjusted),anchor:viewAnchor,factor:zoom,portraitSplitRC108:camera.portraitSplitRC108??null};
  return adjusted;
 }
 function withBaseCamera(callback){
  if(typeof callback!=='function')throw new TypeError('withBaseCamera requires a function');
  probeDepth++;metrics.probeScopes++;
  try{return callback();}finally{probeDepth--;}
 }
 function subscribe(listener){if(typeof listener!=='function')return()=>{};listeners.add(listener);return()=>listeners.delete(listener);}
 function diagnostics(){return Object.freeze({...metrics,last:metrics.last?Object.freeze({...metrics.last,base:cameraCopy(metrics.last.base),adjusted:cameraCopy(metrics.last.adjusted),anchor:{...metrics.last.anchor}}):null,lastProbeCamera:cameraCopy(metrics.lastProbeCamera),baseCameraDepth:probeDepth});}
 root.__HAPIL_CAMERA_RC223__=Object.freeze({installed:true,version:'RC223',key:KEY,mobile,factor,snapshot,setFactor,applyCamera,withBaseCamera,baseCameraActive:()=>probeDepth>0,subscribe,diagnostics});
})();
