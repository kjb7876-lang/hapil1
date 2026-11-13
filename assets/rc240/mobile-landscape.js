/* RC240: phone landscape fit, portrait rotate prompt polish, and arcade
 * stand-off (hero zone left, enemy zone right, fixed gap) for every mode.
 *
 * - Device layer: marks phones (touch + coarse pointer + short screen side),
 *   adds a landscape HUD placement that keeps the F button and resonance bar
 *   off the canvas danmaku panel, and makes a best-effort orientation lock.
 *   Portrait pausing itself stays owned by RC152/RC231 (combat-layout.js).
 * - Stand-off layer: wraps the RC227 floor-patch point seam (used by every
 *   RC138 enemy position write) and the RC153 position seam (to know which
 *   actor is being placed). Enemies keep x-y >= 5 on their side. The RC223
 *   danger strip stays open to the hero; when the hero walks into it the
 *   line for ordinary mobs follows at hero+6.45 (174 px), capped at screen
 *   x 965. Bosses/midbosses keep the base line. While the RC134 Persona duel
 *   owns positions (its left/right mirror swap) this layer is inert; on
 *   hand-over it eases actors to the lines.
 * - Combat zoom: on landscape phones the RC153 whole-arena camera is scaled
 *   up (<= 1.45x of what the player saw) around the floor, keeping the whole
 *   reachable floor inside the safe area and clear of the touch controls.
 *   Applied inside the camera chain, so render, pointer hit-testing, RC240
 *   bullets and RC129 markers all share it. Desktop/tablet/portrait: identity.
 * No bundle edits. Wraps public globals only; idempotent; re-checks each second.
 */
(function(root){'use strict';
 if(!root||root.__HAPIL_MOBILE_LANDSCAPE_RC240__)return;
 const MARK='rc240StandoffRC240';
 const POLICY=Object.freeze({
  heroLine:1.45,           // y-x >= 1.45 for the hero (native RC138/RC134 left polygon)
  enemyLine:5,             // x-y >= 5 for hostiles while the hero is home (native was 1.45)
  enemyLineMax:(965-640)/27, // dynamic mob line cap: screen x 965 (bosses sit at 1018+)
  gapUnits:1.45+5,         // mob line follows hero x-y + 6.45 (174 logical px)
  lineRate:8,              // x-y units per second the mob line may rise
  settleRate:4,            // x-y units per second while easing after a hand-over
  maxZoom:1.45,            // phone landscape combat zoom ceiling
  zoomStep:.01,
  zoomEdgePx:4,            // CSS px between the floor and the safe-area edge
  zoomControlPadPx:4,      // CSS px kept clear around touch controls
  screenPxPerUnit:27,      // G(x,y).x = 640 + 27(x-y)
  gapLogicalPx:(1.45+5)*27,
  heroMaxScreenX:640-1.45*27,
  enemyMinScreenX:640+5*27,
  phoneMaxShortSide:600,
  maxFrameDelta:.1
 });
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 const metrics={installs:0,rewraps:0,enemyClamps:0,settleWrites:0,handovers:0,zoomFits:0,zoomRejected:0,lastZoom:null,lockAttempts:0,lockOk:0,lockRejected:0,lockUnsupported:0,classUpdates:0};
 const worlds=new WeakMap();
 const scratch={x:0,y:0};
 const R=()=>root.__HAPIL_BATTLE_ARENA_RC138__,D=()=>root.__HAPIL_PERSONA_DUEL_RC134__;

 // ------------------------------------------------------------------ device
 function mq(q){try{return root.matchMedia?.(q)?.matches===true;}catch{return false;}}
 function phone(){
  const nav=root.navigator??{},scr=root.screen??{};
  const touch=Number(nav.maxTouchPoints??0)>0||('ontouchstart' in root);
  const coarse=mq('(pointer: coarse)')||mq('(hover: none)');
  const sw=Number(scr.width),sh=Number(scr.height);
  const short=finite(sw)&&finite(sh)&&sw>0&&sh>0?Math.min(sw,sh):Math.min(Number(root.innerWidth)||0,Number(root.innerHeight)||0);
  return touch&&coarse&&short>0&&short<=POLICY.phoneMaxShortSide;
 }
 function landscapePhone(){return phone()&&Number(root.innerWidth)>Number(root.innerHeight);}
 function html(){return root.document?.documentElement??null;}
 function refreshClasses(){
  const h=html();if(!h?.classList)return;
  const p=phone(),l=p&&Number(root.innerWidth)>Number(root.innerHeight);
  h.classList.toggle('rc240-phone',p);h.classList.toggle('rc240-landscape',l);metrics.classUpdates++;
 }
 const SAFE=k=>`var(--rc154-safe-${k},env(safe-area-inset-${k},0px))`;
 const L='html.rc240-landscape.rc240-landscape.rc240-phone.hapil-touch-v31366 body.rc15-playing';
 const CSS=[
  // F (문·기록) sat at left:62px beside a Menu button that landscape hides,
  // covering the resonance bar and the canvas danmaku panel (7..337 x 7..51).
  // Park it above the right thumb cluster, outside both floor halves.
  `${L} #hapil-mobile-controls-v31366 .hm-toolbar [data-mobile-action="F"]{top:auto!important;left:auto!important;right:calc(${SAFE('right')} + 6px)!important;bottom:calc(${SAFE('bottom')} + 60px)!important;width:40px!important;height:40px!important;min-width:40px!important;border-radius:12px!important}`,
  // Resonance bar: below the danmaku panel band instead of on top of its title.
  `${L} #rc108-control-overlay #hapil-resonance-rc96,${L} #hapil-resonance-rc96{top:calc(${SAFE('top')} + 56px)!important;left:calc(${SAFE('left')} + 4px)!important}`,
  // Portrait is not a layout on phones: RC152 already pauses and shows the
  // gate. Add a rotate glyph and a second line without touching its text.
  'html.rc240-phone #rc152-orientation-gate{grid-auto-flow:row;align-content:center;justify-items:center;gap:14px;text-align:center}',
  'html.rc240-phone #rc152-orientation-gate::before{content:"";display:block;width:28px;height:48px;border:3px solid currentColor;border-radius:7px;box-sizing:border-box;animation:rc240-rotate-hint 1.8s ease-in-out infinite}',
  'html.rc240-phone #rc152-orientation-gate::after{content:"세로 화면은 지원하지 않습니다 · 가로로 돌리면 바로 이어집니다";display:block;font-size:13px;font-weight:500;line-height:1.4;opacity:.72;max-width:280px}',
  '@keyframes rc240-rotate-hint{0%,30%{transform:rotate(0deg)}60%,100%{transform:rotate(-90deg)}}',
  '@media (prefers-reduced-motion:reduce){html.rc240-phone #rc152-orientation-gate::before{animation:none;transform:rotate(-90deg)}}'
 ].join('\n');
 function injectStyle(){
  const doc=root.document;if(!doc?.createElement)return false;
  if(doc.getElementById?.('rc240-mobile-landscape-style'))return true;
  const parent=doc.head??doc.documentElement;if(!parent?.appendChild)return false;
  const style=doc.createElement('style');style.id='rc240-mobile-landscape-style';style.textContent=CSS;parent.appendChild(style);return true;
 }
 function tryLock(reason){
  if(!phone())return 'not-phone';
  const o=root.screen?.orientation;
  if(!o||typeof o.lock!=='function'){metrics.lockUnsupported++;return 'unsupported';}
  metrics.lockAttempts++;
  try{const p=o.lock('landscape');if(p&&typeof p.then==='function')p.then(()=>{metrics.lockOk++;},()=>{metrics.lockRejected++;});}
  catch{metrics.lockRejected++;}
  return reason;
 }
 let touchLockTried=false;
 function onFirstTouch(e){if(touchLockTried)return;if(e&&e.pointerType&&e.pointerType!=='touch')return;touchLockTried=true;tryLock('first-touch');}
 function onFullscreen(){const doc=root.document;if(doc?.fullscreenElement||doc?.webkitFullscreenElement){touchLockTried=true;tryLock('fullscreen');}}
 function installDevice(){
  injectStyle();refreshClasses();
  const onResize=()=>{refreshClasses();controlsRead=false;};
  for(const t of ['resize','orientationchange','pageshow'])root.addEventListener?.(t,onResize,{passive:true});
  try{root.visualViewport?.addEventListener?.('resize',onResize,{passive:true});}catch{}
  root.addEventListener?.('pointerup',onFirstTouch,{capture:true,passive:true});
  root.addEventListener?.('touchend',onFirstTouch,{capture:true,passive:true});
  root.document?.addEventListener?.('fullscreenchange',onFullscreen);
  root.document?.addEventListener?.('webkitfullscreenchange',onFullscreen);
  // Loaded before <head>/<body> exist (e.g. injected early): retry once parsed.
  root.document?.addEventListener?.('DOMContentLoaded',()=>{injectStyle();refreshClasses();},{once:true});
 }
 // Other layers may rewrite <html class>; the heartbeat restores ours.
 function heartbeat(){injectStyle();readControls();const h=html();if(h?.classList){const p=phone(),l=p&&Number(root.innerWidth)>Number(root.innerHeight);if(h.classList.contains('rc240-phone')!==p||h.classList.contains('rc240-landscape')!==l)refreshClasses();}ensure();}

 // ------------------------------------------------------------------ stand-off
 const guest=()=>{try{const r=root.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.()?.role;if(r==='guest'||r==='disconnected')return true;}catch{}const p=root.__HAPIL_PARTY_V31322__?.status;return p?.role==='guest'||p?.role==='disconnected';};
 function rawMode(s){
  const A=R();if(!s||typeof s!=='object'||!A?.enabled?.(s))return 'rest';
  if(D()?.active?.(s))return 'mirror';
  if(!A.locked?.(s))return 'clear';
  return 'standoff';
 }
 function slot(s){let w=worlds.get(s);if(!w){w={mode:null,zone:null,enemyAllowance:0,mobLine:POLICY.enemyLine,modeTime:NaN,modeZone:null};worlds.set(s,w);}return w;}
 // Signed distance past a side's line: >0 means inside the gap/other half.
 function violation(p,side,line){return side==='right'?line-(p.x-p.y):line-(p.y-p.x);}
 function enemySide(s){return R()?.side?.(s,false)??'right';}
 function heroSide(s){return R()?.side?.(s,true)??'left';}
 // How far the hero has advanced towards the enemy side (x-y on the left).
 function heroAdvance(s){const x=s.x,y=s.y;if(!finite(x)||!finite(y))return -Infinity;return heroSide(s)==='left'?x-y:y-x;}
 function mobTarget(s){const t=heroAdvance(s)+POLICY.gapUnits;return t>POLICY.enemyLine?(t<POLICY.enemyLineMax?t:POLICY.enemyLineMax):POLICY.enemyLine;}
 function maxEnemyViolation(s){
  const A=R(),list=s.enemies,side=enemySide(s);let v=0;if(!list)return 0;
  for(let i=0;i<list.length;i++){const a=list[i];if(!a||!A.hostile?.(a)||!(a.hp>0))continue;const x=a.x,y=a.y;if(!finite(x)||!finite(y))continue;const d=side==='right'?POLICY.enemyLine-(x-y):POLICY.enemyLine-(y-x);if(d>v)v=d;}
  return Math.min(v,POLICY.enemyLine);
 }
 // Mode bookkeeping; a hand-over from the Persona mirror grants an easing
 // allowance so nobody is snapped across the arena in one frame.
 function mode(s){
  // Every RC138 position write consults this; resolve once per sim tick.
  const cached=worlds.get(s);if(cached&&cached.modeTime===s.time&&cached.modeZone===s.zone&&finite(s.time))return cached.mode??'rest';
  const m=rawMode(s);if(m==='rest'){if(cached){cached.modeTime=NaN;}return m;}
  const w=slot(s);w.modeTime=s.time;w.modeZone=s.zone;
  if(w.zone!==s.zone){w.zone=s.zone;w.mode=null;w.enemyAllowance=0;w.mobLine=POLICY.enemyLine;}
  if(m!==w.mode){
   const prev=w.mode;w.mode=m;
   if(m==='standoff'){
    if(prev==='mirror'){w.enemyAllowance=maxEnemyViolation(s);metrics.handovers++;}
    w.mobLine=POLICY.enemyLine;
   }
  }
  return m;
 }
 function enemyLineNow(s){return POLICY.enemyLine-slot(s).enemyAllowance;}
 function mobLineNow(s){const w=slot(s);return w.mobLine-w.enemyAllowance;}
 // Actor identity: RC138 actorPoint calls RC153.position(a,q) and then, for
 // hostiles, synchronously the floor-patch point. Consumed once there.
 let lastActor=null;
 const isBoss=a=>{try{return a?.id==='inner-evil-rc133'||rc153Base?.boss?.(a)===true||!!(a?.boss||a?.midboss);}catch{return true;}};
 function lineForActor(s,a){return a&&R()?.hostile?.(a)&&!isBoss(a)?mobLineNow(s):enemyLineNow(s);}
 function wrapFloorPatches(FP){
  if(!FP||FP[MARK]||typeof FP.point!=='function')return FP;
  const base=FP.point;
  const point=function(q,which,radius,scope,fallback){
   const actor=lastActor;lastActor=null;
   const out=base.call(this,q,which,radius,scope,fallback);
   if(!scope||typeof scope!=='object'||which==='all'||!out||!finite(out.x)||!finite(out.y)||!finite(q?.x)||!finite(q?.y))return out;
   if(mode(scope)!=='standoff'||which!==enemySide(scope))return out;
   const line=lineForActor(scope,actor),v=violation(out,which,line);
   if(!(v>1e-9))return out;
   const h=v/2,res=which==='right'?{x:out.x+h,y:out.y-h}:{x:out.x-h,y:out.y+h};
   if(!finite(res.x)||!finite(res.y))return out;
   metrics.enemyClamps++;
   const A=R();
   if(A?.contains?.(res,which,radius,scope))return res;
   const p=D()?.point?.(res,which,radius);
   return p&&finite(p.x)&&finite(p.y)?p:out;
  };
  return Object.freeze({...FP,point,[MARK]:true});
 }
 function step(s,dt){
  const A=R();if(!A||!s||typeof s!=='object')return;
  if(guest())return;
  if(mode(s)!=='standoff')return;
  const w=slot(s),t=finite(dt)?Math.max(0,Math.min(POLICY.maxFrameDelta,dt)):0,dec=POLICY.settleRate*t;
  w.enemyAllowance=w.enemyAllowance>dec?w.enemyAllowance-dec:0;
  // Mob line: drops at once when the hero retreats (nobody is pulled), rises
  // at lineRate when the hero walks into the RC223 strip.
  const target=mobTarget(s),rise=POLICY.lineRate*t;
  w.mobLine=target<=w.mobLine?target:(target-w.mobLine>rise?w.mobLine+rise:target);
  const list=s.enemies,side=enemySide(s),baseLine=POLICY.enemyLine-w.enemyAllowance,mobLine=w.mobLine-w.enemyAllowance,duel=D();
  if(list)for(let i=0;i<list.length;i++){
   const a=list[i];if(!a||!(a.hp>0)||!A.hostile?.(a))continue;
   const x=a.x,y=a.y;if(!finite(x)||!finite(y))continue;
   if(duel?.constrained?.(s,a))continue;
   if(violation(a,side,isBoss(a)?baseLine:mobLine)>1e-7){scratch.x=x;scratch.y=y;if(A.applyPosition?.(a,scratch))metrics.settleWrites++;}
  }
 }
 const wrappedControls=new WeakSet();
 function wrapControls(C){
  if(!C||typeof C.frameStart!=='function'||wrappedControls.has(C))return!!C&&wrappedControls.has(C);
  const frame=C.frameStart;
  const next=function(s,dt,...args){const result=frame.call(this,s,dt,...args);try{step(s,dt);}catch(e){metrics.lastError=String(e?.message??e).slice(0,160);}return result;};
  next[MARK]=true;C.frameStart=next;wrappedControls.add(C);return true;
 }

 // ------------------------------------------------------------------ combat zoom
 // Touch controls the floor must stay clear of (CSS px). Read on resize and
 // in the 1 s heartbeat, never per frame; a missing element falls back to the
 // default thumb geometry measured on iPhone 13 mini.
 const CONTROL_SELECTORS=['.hm-movement','.hm-actions','#hapil-mobile-controls-v31366 [data-mobile-action="F"]','.rc108-settings-trigger'];
 const controls=CONTROL_SELECTORS.map(()=>({left:0,top:0,right:0,bottom:0,valid:false}));
 const insets={left:0,right:0,top:0,bottom:0};
 let controlsRead=false,controlsVersion=0;
 function readInsets(){
  let css=null;try{css=root.getComputedStyle?.(root.document?.documentElement);}catch{}
  let changed=false;for(const k of ['left','right','top','bottom']){const v=Math.max(0,parseFloat(css?.getPropertyValue?.('--rc154-safe-'+k))||0);if(insets[k]!==v){insets[k]=v;changed=true;}}
  return changed;
 }
 function readControls(){
  if(!landscapePhone())return;
  let changed=readInsets();
  const vw=Number(root.innerWidth)||0,vh=Number(root.innerHeight)||0,L=insets.left,Rr=insets.right,B=insets.bottom,T=insets.top;
  const fallback=[[L+6,vh-B-82,L+82,vh-B-6],[vw-Rr-162,vh-B-54,vw-Rr-6,vh-B-6],[vw-Rr-46,vh-B-100,vw-Rr-6,vh-B-60],[vw-Rr-44,T+4,vw-Rr-4,T+44]];
  for(let i=0;i<CONTROL_SELECTORS.length;i++){
   let r=null;try{r=root.document?.querySelector?.(CONTROL_SELECTORS[i])?.getBoundingClientRect?.()??null;}catch{}
   const has=r&&finite(r.left)&&finite(r.top)&&finite(r.right)&&finite(r.bottom)&&r.right-r.left>0&&r.bottom-r.top>0;
   const f=fallback[i],l=has?r.left:f[0],t=has?r.top:f[1],rr=has?r.right:f[2],b=has?r.bottom:f[3],c=controls[i];
   if(!c.valid||c.left!==l||c.top!==t||c.right!==rr||c.bottom!==b){c.left=l;c.top=t;c.right=rr;c.bottom=b;c.valid=true;changed=true;}
  }
  controlsRead=true;if(changed)controlsVersion++;
 }
 function pointInPoly(x,y,xs,ys,n){let inside=false;for(let i=0,j=n-1;i<n;j=i++){if((ys[i]>y)!==(ys[j]>y)&&x<(xs[j]-xs[i])*(y-ys[i])/(ys[j]-ys[i])+xs[i])inside=!inside;}return inside;}
 function segHitsRect(ax,ay,bx,by,r){
  // Liang-Barsky clip of segment a-b against rect r.
  let t0=0,t1=1;const dx=bx-ax,dy=by-ay,p=[-dx,dx,-dy,dy],q=[ax-r.left,r.right-ax,ay-r.top,r.bottom-ay];
  for(let i=0;i<4;i++){if(p[i]===0){if(q[i]<0)return false;}else{const t=q[i]/p[i];if(p[i]<0){if(t>t1)return false;if(t>t0)t0=t;}else{if(t<t0)return false;if(t<t1)t1=t;}}}
  return true;
 }
 function polyHitsRect(xs,ys,n,r){
  for(let i=0;i<n;i++){const j=(i+1)%n;if(segHitsRect(xs[i],ys[i],xs[j],ys[j],r))return true;}
  return pointInPoly((r.left+r.right)/2,(r.top+r.bottom)/2,xs,ys,n);
 }
 const zoomCache=new WeakMap();
 function rc223Shrink(base){
  const C=root.__HAPIL_CAMERA_RC223__;if(!C||typeof C.appliedZoom!=='function')return 1;
  try{const f=Number(C.appliedZoom(undefined,base.rc153Viewport,base));return finite(f)&&f>=1&&f<=4?f:1;}catch{return 1;}
 }
 function floorPolygons(s){
  const out=[],dp=D()?.polygon?.('all',.8);if(dp?.length)out.push(dp);
  try{const FP=root.__HAPIL_FLOOR_PATCHES_RC227__;if(FP?.enabled?.(s)){const fp=FP.polygon?.('all',.8);if(fp?.length)out.push(fp);}}catch{}
  return out;
 }
 // Fit a zoom Z (relative to the native final view) for this base camera. The
 // result is pre-compensated for RC223's later optional shrink f, so what the
 // player finally sees is the floor fitted below at base.scale*Z/f.
 function fitZoom(s,base,f){
  const v=base.rc153View,k=v.k,vw=finite(base.rc153Viewport?.width)?base.rc153Viewport.width:Number(root.innerWidth),vh=finite(base.rc153Viewport?.height)?base.rc153Viewport.height:Number(root.innerHeight);
  if(!finite(vw)||!finite(vh)||vw<=vh)return null;
  const polys=floorPolygons(s);if(!polys.length)return null;
  const gx=[],gy=[];for(const poly of polys){const xs=[],ys=[];for(const p of poly){xs.push(640+27*(p.x-p.y));ys.push(13.5*(p.x+p.y));}gx.push(xs);gy.push(ys);}
  let gl=Infinity,gr=-Infinity,ft=Infinity,fb=-Infinity;for(let i=0;i<gx.length;i++)for(let j=0;j<gx[i].length;j++){gl=Math.min(gl,gx[i][j]);gr=Math.max(gr,gx[i][j]);ft=Math.min(ft,gy[i][j]);fb=Math.max(fb,gy[i][j]);}
  let frame=null;try{frame=rc153Base?.framing?.(s);}catch{}
  if(frame&&finite(frame.top)&&finite(frame.bottom)&&frame.bottom>frame.top){ft=Math.min(ft,frame.top);fb=Math.max(fb,frame.bottom);}
  const E=POLICY.zoomEdgePx,pad=POLICY.zoomControlPadPx,sl=insets.left+E,sr=vw-insets.right-E,st=insets.top,sb=vh-insets.bottom,cx=(sl+sr)/2,gmid=(gl+gr)/2;
  const rects=controls.filter(c=>c.valid).map(c=>({left:c.left-pad,top:c.top-pad,right:c.right+pad,bottom:c.bottom+pad}));
  const cssX=gx.map(a=>a.map(()=>0)),cssY=gy.map(a=>a.map(()=>0));
  for(let Z=POLICY.maxZoom;Z>1+1e-9;Z=Math.round((Z-POLICY.zoomStep)*1000)/1000){
   const S=base.scale*Z/f,Xf=cx/k+v.x-gmid*S,h=(fb-ft)*S*k;
   if(h>sb-st)continue;
   const yc=(st+sb)/2-(ft+fb)/2*S*k; // css offset centring the frame
   const room=(sb-st-h)/2;
   for(let o=0;o<=room+1e-9;o=o<1?2:o+2)for(const sign of o?[-1,1]:[1]){
    const oy=yc+sign*Math.min(o,room),Yf=oy/k+v.y;
    let okFit=true;
    for(let i=0;i<gx.length&&okFit;i++)for(let j=0;j<gx[i].length;j++){const x=(Xf+gx[i][j]*S-v.x)*k,y=(Yf+gy[i][j]*S-v.y)*k;cssX[i][j]=x;cssY[i][j]=y;if(x<sl||x>sr||y<st||y>sb){okFit=false;break;}}
    if(!okFit)continue;
    for(let i=0;i<gx.length&&okFit;i++)for(const r of rects)if(polyHitsRect(cssX[i],cssY[i],gx[i].length,r)){okFit=false;break;}
    if(!okFit)continue;
    const ax=v.x+v.width/2,ay=v.y+v.height/2;
    return {Z,x:ax+(Xf-ax)*f,y:ay+(Yf-ay)*f,scale:base.scale*Z};
   }
  }
  return null;
 }
 let zoomOn=true;
 function zoomEligible(s,view,slotName){
  if(!zoomOn)return false;
  if(slotName!==undefined&&slotName!==null)return false;
  if(!landscapePhone())return false;
  if(root.__HAPIL_MOBILE_V31366__?.enabled?.()!==true&&!html()?.classList?.contains?.('hapil-touch-v31366'))return false;
  if(!s||typeof s!=='object'||!R()?.enabled?.(s))return false;
  if(D()?.active?.(s))return false;
  return true;
 }
 function zoomCamera(s,view,slotName,base){
  if(!base||typeof base!=='object'||!finite(base.scale)||!finite(base.x)||!finite(base.y)||base.scale<=0)return base;
  const v=base.rc153View;if(!v||!finite(v.x)||!finite(v.y)||!finite(v.width)||!finite(v.height)||!finite(v.k)||v.k<=0)return base;
  if(!zoomEligible(s,view,slotName))return base;
  if(!controlsRead)readControls();
  const f=rc223Shrink(base),vw=Number(root.innerWidth),vh=Number(root.innerHeight);
  const hit=zoomCache.get(base);
  if(hit&&hit.f===f&&hit.version===controlsVersion&&hit.vw===vw&&hit.vh===vh&&hit.zone===s.zone)return hit.cam;
  let fit=null;try{fit=fitZoom(s,base,f);}catch(e){metrics.lastError=String(e?.message??e).slice(0,160);}
  let cam=base;
  if(fit&&finite(fit.x)&&finite(fit.y)&&finite(fit.scale)&&fit.scale>0){cam={...base,x:fit.x,y:fit.y,scale:fit.scale,rc240ZoomRC240:fit.Z};metrics.zoomFits++;metrics.lastZoom=fit.Z;}
  else metrics.zoomRejected++;
  zoomCache.set(base,{f,version:controlsVersion,vw,vh,zone:s.zone,cam});
  return cam;
 }
 // RC153 seam: camera (zoom) and position (actor identity for the mob line).
 let rc153Base=null;
 function wrapLayout(Lay){
  if(!Lay||Lay[MARK]||typeof Lay.camera!=='function')return Lay;
  rc153Base=Lay;
  const camera=function(s,view,slotName){const base=Lay.camera.call(this,s,view,slotName);return arguments.length>=3&&slotName!==undefined?base:zoomCamera(s,view,slotName,base);};
  const out={...Lay,camera,[MARK]:true};
  if(typeof Lay.position==='function')out.position=function(a,q){const r=Lay.position.call(this,a,q);lastActor=a&&typeof a==='object'?a:null;return r;};
  return Object.freeze(out);
 }
 let standoffReady=false;
 function ensure(){
  const FP=root.__HAPIL_FLOOR_PATCHES_RC227__,Lay=root.__HAPIL_COMBAT_LAYOUT_RC153__,C=root.__HAPIL_CONTROLS_V31329__;
  if(!R()||!FP||!C)return false;
  if(!FP[MARK]){const w=wrapFloorPatches(FP);if(w!==FP){root.__HAPIL_FLOOR_PATCHES_RC227__=w;if(standoffReady)metrics.rewraps++;}}
  if(Lay&&!Lay[MARK]){const w=wrapLayout(Lay);if(w!==Lay){root.__HAPIL_COMBAT_LAYOUT_RC153__=w;if(standoffReady)metrics.rewraps++;}}
  wrapControls(C);
  if(!standoffReady){standoffReady=true;metrics.installs++;}
  return true;
 }
 function snapshot(s){
  const m=s&&typeof s==='object'?rawMode(s):'rest',w=s&&typeof s==='object'?worlds.get(s):null;
  return Object.freeze({mode:m,enemySide:m==='rest'?null:enemySide(s),heroSide:m==='rest'?null:heroSide(s),
   enemyLine:(w?.mobLine??POLICY.enemyLine)-(w?.enemyAllowance??0),bossLine:POLICY.enemyLine-(w?.enemyAllowance??0),enemyAllowance:w?.enemyAllowance??0,zoom:metrics.lastZoom});
 }
 function lineFor(s,which){return Object.freeze({axis:which==='right'?'x-y':'y-x',value:which===enemySide(s)?mobLineNow(s):POLICY.heroLine});}

 root.__HAPIL_MOBILE_LANDSCAPE_RC240__=Object.freeze({version:'RC240-ML',policy:POLICY,
  installed:()=>standoffReady,phone,landscapePhone,refreshClasses,tryLock,step,snapshot,lineFor,ensure,zoomCamera,readControls,setZoomEnabled:v=>{zoomOn=v!==false;return zoomOn;},zoomEnabled:()=>zoomOn,
  metrics:()=>Object.freeze({...metrics})});

 installDevice();
 let tries=0;
 function ready(){if(ensure()||++tries>=1200){root.setInterval?.(heartbeat,1000);return;}root.setTimeout?.(ready,25);}
 ready();
})(typeof window!=='undefined'?window:globalThis);
