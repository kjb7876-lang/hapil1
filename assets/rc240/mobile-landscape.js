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
 *   up (1.15-1.30x of what the player saw; Envy's room <= 1.2; below 1.15
 *   only where the whole floor cannot otherwise fit, e.g. notched screens;
 *   painted floor-diamond corners kept 16 px inside where they fit; mob
 *   stages centre the fighters vertically within the floor limits), keeping the whole playable floor
 *   inside the safe area and clear of the touch controls. It frames the fight
 *   (review round 1): far enemy foot <= 76% of the width (never > 85%), the
 *   hero-enemy midpoint as central as the floor allows, body frame 8% of the
 *   height lower; less zoom is preferred over losing the floor edge. Fitted
 *   only when an input changes; a dead zone keeps it still while actors move,
 *   and re-aims (phase change, sustained shift) are eased on game time.
 *   Applied inside the camera chain, so render, pointer hit-testing, RC240
 *   bullets and RC129 markers all share it. Desktop/tablet/portrait: identity.
 * - Danger band: a faint isometric floor band marks the RC223 strip during
 *   stand-off combat (phone and PC), drawn from the native floor pass.
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
  maxZoom:1.3,             // phone landscape combat zoom ceiling (review round 2: 1.15-1.30)
  minZoom:1.15,            // preferred floor; only the hard floor/control limits go below it
  zoneZoomCap:Object.freeze({ep1b03:1.2}), // boss rooms whose boss + formation crowd the right edge (Envy)
  floorMarginPx:16,        // CSS px between the painted floor-diamond corners and the frame ...
  floorMarginMinPx:3,      // ... or at least this much when 16 px cannot hold at >= minZoom
  floorArtPadG:24,         // painted platform diamond reaches ~24 G px past the radius-0 floor at its side corners (dist06/ep1a11, measured)
  mobFloorBottomPx:4,      // mob stages: near floor edge only kept on screen (vertical centring wins)
  bodyFallback:150,        // G px body height above the foot when no paint envelope is exposed
  zoomStep:.01,
  zoomEdgePx:4,            // CSS px between the floor and the safe-area edge
  zoomControlPadPx:4,      // CSS px kept clear around touch controls
  zoomFarTarget:.76,       // boss (or farthest mob) foot at <= 76% of the width ...
  zoomFarMax:.85,          // ... and never past 85%
  zoomFarCorner:.78,       // far target while the floor-diamond corners keep their margin (not in capped rooms)
  zoomDrop:.08,            // vertical target lowered by 8% of the screen height
  zoomKeepLow:.6,          // dead zone: keep the framing while the far actor stays in [60%, 79%]
  zoomKeepHigh:.79,
  zoomDriftSeconds:.75,    // a shift must persist this long before a re-aim
  zoomEaseSeconds:.6,      // re-aims are eased over this much game time
  resizeNudgePx:2,         // a viewport change this small (CSS px) is a nudge, not a new layout ...
  resizeScaleStep:.009,    // ... and moves the world-to-CSS scale by at most 0.9% (RC233: < 1% per pixel)
  zoomMapCover:.92,        // authored map keeps >= 92% of the screen (RC154 floor: 90%)
  mobEdgePx:60,            // mob bodies kept this far inside the frame edge
  mobHalfFallback:40,      // G px half body when no paint envelope is exposed
  bandAlpha:.12,           // danger band base fill ...
  bandStripeAlpha:.18,     // ... plus iso stripes on top: 1-(.88*.82) = 28% where they lie
  bandStripeWidth:.42,bandStripeGap:.62, // floor units, stripes along the floor y axis
  bandDash:.55,bandDashGap:.35,bandDashAlpha:.5, // dashed boundary on x-y = -1.45
  bandChevron:.5,bandChevronStep:2,bandChevronAlpha:.62, // iso chevrons pointing into the strip
  bandColor:'#ff5a3c',bandEdgeColor:'#ff8a66',
  screenPxPerUnit:27,      // G(x,y).x = 640 + 27(x-y)
  gapLogicalPx:(1.45+5)*27,
  heroMaxScreenX:640-1.45*27,
  enemyMinScreenX:640+5*27,
  phoneMaxShortSide:600,
  maxFrameDelta:.1
 });
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 const metrics={installs:0,rewraps:0,enemyClamps:0,settleWrites:0,handovers:0,zoomFits:0,zoomRejected:0,reaims:0,lastZoom:null,lastFrame:null,bandDraws:0,lockAttempts:0,lockOk:0,lockRejected:0,lockUnsupported:0,classUpdates:0};
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
  // Review round 1: above the A/D cluster it sat in the boss lane (bullet
  // columns, mis-taps). Park it top-left under the resonance bar (4..104 x
  // 56..73, RC240 stock readout below it to ~92): left of the hero zone, far from both thumb clusters, clear of
  // the danmaku panel (7..51), the spell card (right) and the settings button.
  `${L} #hapil-mobile-controls-v31366 .hm-toolbar [data-mobile-action="F"]{bottom:auto!important;right:auto!important;top:calc(${SAFE('top')} + 100px)!important;left:calc(${SAFE('left')} + 6px)!important;width:40px!important;height:40px!important;min-width:40px!important;border-radius:12px!important}`,
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
  const fallback=[[L+6,vh-B-82,L+82,vh-B-6],[vw-Rr-162,vh-B-54,vw-Rr-6,vh-B-6],[L+6,T+100,L+46,T+140],[vw-Rr-44,T+4,vw-Rr-4,T+44]];
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
  // Liang-Barsky clip of segment a-b against rect r (no temporaries).
  let t0=0,t1=1;const dx=bx-ax,dy=by-ay;
  for(let i=0;i<4;i++){const p=i===0?-dx:i===1?dx:i===2?-dy:dy,q=i===0?ax-r.left:i===1?r.right-ax:i===2?ay-r.top:r.bottom-ay;
   if(p===0){if(q<0)return false;}else{const t=q/p;if(p<0){if(t>t1)return false;if(t>t0)t0=t;}else{if(t<t0)return false;if(t<t1)t1=t;}}}
  return true;
 }
 function polyHitsRect(xs,ys,n,r){
  for(let i=0;i<n;i++){const j=(i+1)%n;if(segHitsRect(xs[i],ys[i],xs[j],ys[j],r))return true;}
  return pointInPoly((r.left+r.right)/2,(r.top+r.bottom)/2,xs,ys,n);
 }
 function rc223Shrink(base){
  const C=root.__HAPIL_CAMERA_RC223__;if(!C||typeof C.appliedZoom!=='function')return 1;
  try{const f=Number(C.appliedZoom(undefined,base.rc153Viewport,base));return finite(f)&&f>=1&&f<=4?f:1;}catch{return 1;}
 }
 function floorPolygons(s){
  const out=[],dp=D()?.polygon?.('all',.8);if(dp?.length)out.push(dp);
  try{const FP=root.__HAPIL_FLOOR_PATCHES_RC227__;if(FP?.enabled?.(s)){const fp=FP.polygon?.('all',.8);if(fp?.length)out.push(fp);}}catch{}
  return out;
 }
 // The fight being framed, in G-space x (640 + 27(x-y)): hero, enemy centre
 // and the enemy farthest towards the enemy edge. Bosses/midbosses define the
 // enemy group when present, otherwise the live mobs. Allocation free.
 const focusNow={hx:NaN,emid:NaN,efar:NaN,sign:1,boss:false,n:0};
 function focus(s,out){
  const A=R(),sign=enemySide(s)==='left'?-1:1,list=s.enemies,x=s.x,y=s.y;
  out.sign=sign;out.hx=finite(x)&&finite(y)?640+27*(x-y):NaN;
  let bn=0,bs=0,bf=-Infinity,mn=0,ms=0,mf=-Infinity;
  if(list&&A)for(let i=0;i<list.length;i++){const a=list[i];if(!a||!(a.hp>0)||a.visualOnly||a.friendly||!A.hostile?.(a))continue;const ax=a.x,ay=a.y;if(!finite(ax)||!finite(ay))continue;
   const g=640+27*(ax-ay),d=sign*g;if(isBoss(a)){bn++;bs+=g;if(d>bf)bf=d;}else{mn++;ms+=g;if(d>mf)mf=d;}}
  if(bn){out.boss=true;out.n=bn;out.emid=bs/bn;out.efar=sign*bf;}
  else if(mn){out.boss=false;out.n=mn;out.emid=ms/mn;out.efar=sign*mf;}
  else{out.boss=false;out.n=0;out.emid=NaN;out.efar=NaN;}
  return out;
 }
 // Half body width (G px) of the widest live mob towards the enemy edge; read
 // from the native paint envelope at fit time only.
 function mobHalf(s,fz){
  if(fz.boss||!fz.n)return 0;let half=POLICY.mobHalfFallback;
  try{const B=root.__HAPIL_BITMAP_NATIVE_RC133__,A=R();if(typeof B?.paintEnvelope==='function')for(const a of s.enemies??[]){if(!a||!(a.hp>0)||a.visualOnly||!A?.hostile?.(a)||isBoss(a))continue;const e=B.paintEnvelope(s,a,false);if(!e||!finite(e.left)||!finite(e.right)||!finite(a.x)||!finite(a.y))continue;const g=640+27*(a.x-a.y),h=fz.sign>0?e.right-g:g-e.left;if(finite(h)&&h>half&&h<400)half=h;}}catch{}
  return half;
 }
 // Vertical extent (G y) of the fighters: hero plus the framed enemy group
 // (bosses when present, else mobs), feet to body tops. Fit time only.
 function fighterBox(s,fz){
  let top=Infinity,bottom=-Infinity;const A=R(),B=root.__HAPIL_BITMAP_NATIVE_RC133__,fb=POLICY.bodyFallback;
  const add=(a,hero)=>{const x=a.x,y=a.y;if(!finite(x)||!finite(y))return;const g=13.5*(x+y);let t=g-fb,b=g+10;
   try{const e=typeof B?.paintEnvelope==='function'?B.paintEnvelope(s,a,hero):null;if(e&&finite(e.top)&&finite(e.bottom)&&e.bottom>e.top&&e.bottom-e.top<600&&Math.abs(e.bottom-g)<200){t=e.top;b=Math.max(g,e.bottom);}}catch{}
   if(t<top)top=t;if(b>bottom)bottom=b;};
  add(s,true);
  for(const a of s.enemies??[]){if(!a||!(a.hp>0)||a.visualOnly||a.friendly||!A?.hostile?.(a))continue;if(fz.boss!==isBoss(a))continue;add(a,false);}
  return finite(top)&&finite(bottom)?{top,bottom}:null;
 }
 // Fit zoom Z (relative to the native final view) and the framing offsets
 // for this base camera and fight. Hard limits: the whole playable floor
 // inside the safe area and clear of the touch controls, every body on
 // screen, the far enemy foot <= 85% (mob bodies >= 60 px inside the edge).
 // Aim: fight midpoint at screen centre as far as the floor allows, far enemy
 // <= 76%, body frame 8% of the height below centre. The largest Z meeting
 // the aim wins; otherwise the least-zoomed feasible fit (less zoom is
 // preferred over losing the floor edge). The result is pre-compensated for
 // RC223's later optional shrink f (the player sees base.scale*Z/f).
 // Review round 2: the painted floor diamond (radius-0 floor, side corners
 // widened by floorArtPadG) keeps its corners floorMarginPx inside the frame
 // (pass 3), else just inside (pass 2); when that cannot hold, the near
 // (bottom) floor edge at least stays on screen (pass 1); the old
 // playable-floor fit is the last resort (pass 0). Zoom is searched in
 // [minZoom, cap] first and goes below minZoom only when nothing fits there.
 // Mob stages centre the fighters' bounding box vertically (clamped by the floor).
 function outerBounds(s){
  let l=Infinity,r=-Infinity,t=Infinity,b=-Infinity;const add=poly=>{if(!poly?.length)return;for(const p of poly){const x=640+27*(p.x-p.y),y=13.5*(p.x+p.y);if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}};
  add(D()?.polygon?.('all',0));
  try{const FP=root.__HAPIL_FLOOR_PATCHES_RC227__;if(FP?.enabled?.(s))add(FP.polygon?.('all',0));}catch{}
  return finite(l)&&finite(r)&&finite(t)&&finite(b)?{l,r,t,b}:null;
 }
 function fitZoom(s,base,f,fz,half,box){
  const cap=fz.boss&&finite(POLICY.zoneZoomCap[s.zone])?Math.min(POLICY.maxZoom,POLICY.zoneZoomCap[s.zone]):POLICY.maxZoom;
  const ob=outerBounds(s),capped=cap<POLICY.maxZoom;
  // Zoom band first ([minZoom, cap], then below minZoom), but a fit that
  // keeps the far enemy on target (<= 76%; 78% while the corners keep their
  // margin) beats the band: the far aim, then the floor-diamond corner margin,
  // then the vertical drop. A fit missing the far aim is the last resort.
  const bands=[[cap,POLICY.minZoom],[POLICY.minZoom-POLICY.zoomStep,1]],passes=ob?[3,2,1,0]:[0];
  // Passes are run lazily (fit time only): most fits stop in the first band.
  const rs=bands.map(()=>passes.map(()=>undefined)),get=(b,i)=>rs[b][i]!==undefined?rs[b][i]:(rs[b][i]=fitPass(s,base,f,fz,half,box,ob,passes[i],bands[b][0],bands[b][1],capped));
  const pick=keys=>{for(let b=0;b<rs.length;b++)for(const [i,key] of keys){const r=get(b,i)?.[key];if(r){r.pass=passes[i];return r;}}return null;};
  const n=passes.length,aimKeys=[];for(let i=0;i<n;i++)aimKeys.push([i,'good'],[i,'aimed']);
  const hit=pick(aimKeys);if(hit)return hit;
  // No fit reaches the far aim: the one bringing the far enemy closest in.
  let best=null;for(let b=0;b<rs.length;b++)for(let i=0;i<n;i++){const r=get(b,i)?.fallback;if(r&&(!best||r.farPct<best.farPct-1e-9)){r.pass=passes[i];best=r;}}
  return best;
 }
 function fitPass(s,base,f,fz,half,box,ob,pass,hiZ,loZ,capped){
  const v=base.rc153View,k=v.k,vw=finite(base.rc153Viewport?.width)?base.rc153Viewport.width:Number(root.innerWidth),vh=finite(base.rc153Viewport?.height)?base.rc153Viewport.height:Number(root.innerHeight);
  if(!finite(vw)||!finite(vh)||vw<=vh)return null;
  const polys=floorPolygons(s);if(!polys.length)return null;
  const gx=[],gy=[];for(const poly of polys){const xs=[],ys=[];for(const p of poly){xs.push(640+27*(p.x-p.y));ys.push(13.5*(p.x+p.y));}gx.push(xs);gy.push(ys);}
  let gl=Infinity,gr=-Infinity,ft=Infinity,fb=-Infinity;for(let i=0;i<gx.length;i++)for(let j=0;j<gx[i].length;j++){gl=Math.min(gl,gx[i][j]);gr=Math.max(gr,gx[i][j]);ft=Math.min(ft,gy[i][j]);fb=Math.max(fb,gy[i][j]);}
  // pass 3: corners floorMarginPx inside; 2: corners just inside; 1: near edge on screen; 0: playable floor only.
  const corner=pass>=2,M=pass===3?POLICY.floorMarginPx:POLICY.floorMarginMinPx,mB=fz.boss||!box?POLICY.floorMarginPx:POLICY.mobFloorBottomPx,artPad=POLICY.floorArtPadG;
  let frame=null;try{frame=rc153Base?.framing?.(s);}catch{}
  if(frame&&finite(frame.top)&&finite(frame.bottom)&&frame.bottom>frame.top){ft=Math.min(ft,frame.top);fb=Math.max(fb,frame.bottom);}
  const E=POLICY.zoomEdgePx,pad=POLICY.zoomControlPadPx,sl=insets.left+E,sr=vw-insets.right-E,st=insets.top,sb=vh-insets.bottom,cx=(sl+sr)/2;
  const rects=controls.filter(c=>c.valid).map(c=>({left:c.left-pad,top:c.top-pad,right:c.right+pad,bottom:c.bottom+pad}));
  const cssX=gx.map(a=>a.map(()=>0)),cssY=gy.map(a=>a.map(()=>0));
  const sign=fz.sign,hasFar=finite(fz.efar),mid=finite(fz.hx)&&finite(fz.emid)?(fz.hx+fz.emid)/2:(gl+gr)/2;
  const farT=(corner&&!capped?POLICY.zoomFarCorner:POLICY.zoomFarTarget)*vw,farMax=POLICY.zoomFarMax*vw,mobEdge=vw-insets.right-POLICY.mobEdgePx;
  const along=c=>sign>0?c:vw-c; // css distance from the hero-side edge
  // The authored map image must keep covering the screen (RC154: >= 90%).
  let map=null;try{const m=root.__HAPIL_MAP_FORMAT_RC138__?.metrics?.()?.last;if(m&&m.zone===s.zone&&m.rect&&finite(m.rect.x)&&finite(m.rect.y)&&m.rect.width>0&&m.rect.height>0)map=m.rect;}catch{}
  const cover=(A,B,Sk)=>{if(!map)return 1;const l=Math.max(0,A+map.x*Sk),r=Math.min(vw,A+(map.x+map.width)*Sk),t=Math.max(0,B+map.y*Sk),b=Math.min(vh,B+(map.y+map.height)*Sk);return r>l&&b>t?(r-l)*(b-t)/(vw*vh):0;};
  let fallback=null,aimed=null;
  for(let Z=hiZ;Z>=loZ-1e-9&&Z>1+1e-9;Z=Math.round((Z-POLICY.zoomStep)*1000)/1000){
   const S=base.scale*Z/f,Sk=S*k,h=(fb-ft)*Sk;
   if(h>sb-st)continue;
   let lo=sl-gl*Sk,hi=sr-gr*Sk;
   if(corner){lo=Math.max(lo,insets.left+M-(ob.l-artPad)*Sk);hi=Math.min(hi,vw-insets.right-M-(ob.r+artPad)*Sk);}
   if(lo>hi+1e-9)continue;
   let A=Math.min(hi,Math.max(lo,cx-mid*Sk)); // css x = A + gx*Sk
   if(map){const mlo=vw-(map.x+map.width)*Sk,mhi=-map.x*Sk;if(A<mlo)A=Math.min(hi,mlo);else if(A>mhi)A=Math.max(lo,mhi);}
   const far=hasFar?along(A+fz.efar*Sk):-Infinity;
   if(far>farMax)continue;
   if(hasFar&&half>0&&along(A+fz.efar*Sk+sign*half*Sk)>along(sign>0?mobEdge:vw-mobEdge))continue;
   const B0=(st+sb)/2-(ft+fb)/2*Sk,room=(sb-st-h)/2,mobs=!fz.boss&&!!box; // css y = B + gy*Sk
   // Boss: body frame lowered by zoomDrop. Mob stage: fighters' box centred.
   const Bt=mobs?(st+sb)/2-(box.top+box.bottom)/2*Sk:B0+Math.min(room,POLICY.zoomDrop*vh);
   const oyLo=corner?st+M:-Infinity,oyHi=corner?sb-mB:pass===1?sb:Infinity;
   let B=NaN;
   // Search outwards from the aim, nearest feasible first (covers the whole body-frame range).
   const span=2*room+Math.abs(Bt-B0)+2;
   for(let o=0;o<=span+1e-9&&!finite(B);o+=2)for(let sgn=-1;sgn<=1;sgn+=2){
    if(o===0&&sgn>0)break;const cand=Bt+sgn*o;if(cand<B0-room-1e-9||cand>B0+room+1e-9)continue;
    if(ob&&(cand+ob.t*Sk<oyLo-1e-6||cand+ob.b*Sk>oyHi+1e-6))continue;
    let okFit=cover(A,cand,Sk)>=POLICY.zoomMapCover;
    for(let i=0;i<gx.length&&okFit;i++)for(let j=0;j<gx[i].length;j++){const x=A+gx[i][j]*Sk,y=cand+gy[i][j]*Sk;cssX[i][j]=x;cssY[i][j]=y;if(x<sl-1e-6||x>sr+1e-6||y<st-1e-6||y>sb+1e-6){okFit=false;break;}}
    for(let i=0;i<gx.length&&okFit;i++)for(const r of rects)if(polyHitsRect(cssX[i],cssY[i],gx[i].length,r)){okFit=false;break;}
    if(okFit){B=cand;break;}
   }
   if(!finite(B))continue;
   const Xf=A/k+v.x,Yf=B/k+v.y,ax=v.x+v.width/2,ay=v.y+v.height/2;
   const out={Z,x:ax+(Xf-ax)*f,y:ay+(Yf-ay)*f,scale:base.scale*Z,A,B,Sk,vw,farPct:hasFar?far/vw:null,midPct:along(A+mid*Sk)/vw,dropPct:(B-B0)/vh,half};
   const farOk=!hasFar||far<=farT+1e-9,dropOk=mobs||B-B0>=POLICY.zoomDrop*.75*vh-1e-6||B>=B0+room-1e-6;
   if(farOk&&dropOk)return {good:out,aimed:null,fallback:null};
   if(farOk){if(!aimed)aimed=out;}else fallback=out; // keep lowering: less zoom over a lost aim
  }
  return aimed||fallback?{good:null,aimed,fallback}:null;
 }
 // Per-world framing state. The fit runs only when an input changes: base
 // camera (RC153 re-fit on a phase/roster change), RC223 shrink, viewport,
 // controls, zone, or a sustained shift of the fight out of the dead zone.
 // Re-aims are eased on game time through two pre-allocated buffers, so the
 // steady state returns one object and easing allocates nothing per frame.
 const aims=new WeakMap();
 function acceptable(st,fz){
  const fit=st.fit;if(!fit||!finite(fz.efar))return 1;
  const c=fit.A+fz.efar*fit.Sk,far=(fz.sign>0?c:fit.vw-c)/fit.vw;
  if(far>POLICY.zoomFarMax)return -1;
  if(fit.half>0){const body=fz.sign>0?c+fit.half*fit.Sk:fit.vw-(c-fit.half*fit.Sk);if(body>fit.vw-insets.right-POLICY.mobEdgePx)return -1;}
  // Hysteresis around what the last fit achieved (a compromise fit at 80%
  // is not re-run every frame).
  const fp=finite(fit.farPct)?fit.farPct:POLICY.zoomFarTarget;
  if(far>Math.max(POLICY.zoomKeepHigh,fp+.03))return 0;
  if(far<Math.min(POLICY.zoomKeepLow,fp-.16)&&fit.Z<POLICY.maxZoom-1e-9)return 0;
  return 1;
 }
 // The game clock is stopped: native pause or an open modal (dialogue, QA
 // capture gate, RC233 camera-pose fixture). The camera then holds still.
 function held(s){if(s?.paused===true)return true;try{const b=root.__HAPIL_CONTROLS_V31329__?.binding;return !!b?.modal?.current&&(b.state?.current==null||b.state.current===s);}catch{return false;}}
 function current(st,s,t){
  if(!st.easing)return st.cam;
  if(held(s)){st.easing=false;return st.cam;}
  let u=finite(t)&&finite(st.easeT0)?(t-st.easeT0)/POLICY.zoomEaseSeconds:1;
  // A clock that stops mid-ease (pause, modal) must not freeze the camera
  // half-way: after 0.5 s of real time without game time, finish.
  if(u===0&&wall()-st.easeWall>500)u=1;
  if(!(u<1)||u<0){st.easing=false;return st.cam;}
  if(st.bufT===t&&st.buf)return st.buf;
  const e=u*u*(3-2*u),to=st.cam,b=st.flip?st.bufA:st.bufB;st.flip=!st.flip;
  b.x=st.fromX+(to.x-st.fromX)*e;b.y=st.fromY+(to.y-st.fromY)*e;b.scale=st.fromScale+(to.scale-st.fromScale)*e;b.rc240ZoomRC240=st.fromZ+((to.rc240ZoomRC240??1)-st.fromZ)*e;
  st.buf=b;st.bufT=t;return b;
 }
 const wall=()=>{try{const n=root.performance?.now?.();return finite(n)?n:0;}catch{return 0;}};
 // RC153 hands out a fresh rc153View copy on every re-fit: compare values.
 function sameView(a,b){return a===b||!!a&&!!b&&a.x===b.x&&a.y===b.y&&a.width===b.width&&a.height===b.height&&a.k===b.k;}
 // A viewport nudge (one or two CSS px, e.g. browser chrome or a visual
 // viewport tweak) must not make the world jump: the corner passes and zoom
 // bands can flip on one pixel. The world-to-CSS scale then moves toward the
 // fresh fit by at most resizeScaleStep per nudge (identity when that lands at
 // or below 1x), at the nearest feasible pass; the fresh fit only when none is.
 const cssOf=(c,f)=>c&&finite(c.scale)&&finite(c.rc153View?.k)?c.scale*c.rc153View.k/f:NaN;
 function nudgeFit(s,base,f,fz,half,box,fresh,prevCss){
  const unit=base.scale*base.rc153View.k/f;if(!finite(prevCss)||!finite(unit)||unit<=0)return fresh;
  const want=fresh?fresh.Z:1,r=want*unit/prevCss,step=POLICY.resizeScaleStep;
  if(Math.abs(r-1)<=step)return fresh;
  const Z=prevCss*(r>1?1+step:1-step)/unit;
  if(!(Z>1+1e-9))return null; // identity camera
  const cap=fz.boss&&finite(POLICY.zoneZoomCap[s.zone])?Math.min(POLICY.maxZoom,POLICY.zoneZoomCap[s.zone]):POLICY.maxZoom;
  if(Z>cap+1e-9)return fresh;
  const ob=outerBounds(s),passes=ob?[3,2,1,0]:[0];
  for(const p of passes){const r2=fitPass(s,base,f,fz,half,box,ob,p,Z,Z,cap<POLICY.maxZoom),hit=r2&&(r2.good||r2.aimed||r2.fallback);if(hit){hit.pass=p;hit.nudged=true;return hit;}}
  return fresh;
 }
 function refit(st,s,base,f,fz,ease,nudge){
  const t=s.time,shown=st.cam?current(st,s,t):null;
  let fit=null;const half=mobHalf(s,fz);
  try{const box=fighterBox(s,fz);fit=fitZoom(s,base,f,fz,half,box);if(nudge&&shown)fit=nudgeFit(s,base,f,fz,half,box,fit,cssOf(shown,st.f));}catch(e){metrics.lastError=String(e?.message??e).slice(0,160);}
  st.base=base;st.f=f;st.version=controlsVersion;st.hx=fz.hx;st.emid=fz.emid;st.efar=fz.efar;st.boss=fz.boss;st.driftT=NaN;metrics.reaims++;
  const okFit=fit&&finite(fit.x)&&finite(fit.y)&&finite(fit.scale)&&fit.scale>0;
  if(okFit){metrics.zoomFits++;metrics.lastZoom=fit.Z;metrics.lastFrame={Z:fit.Z,farPct:fit.farPct,midPct:fit.midPct,dropPct:fit.dropPct,pass:fit.pass};}else metrics.zoomRejected++;
  const prev=st.cam;
  // Same framing as before (e.g. hero moved but the floor pins the view): keep the object.
  if(okFit&&prev&&prev!==st.base0&&Math.abs(prev.x-fit.x)<1e-6&&Math.abs(prev.y-fit.y)<1e-6&&Math.abs(prev.scale-fit.scale)<1e-9&&st.base0===base){st.fit=fit;return;}
  const cam=okFit?{...base,x:fit.x,y:fit.y,scale:fit.scale,rc240ZoomRC240:fit.Z}:base;
  st.base0Prev=st.base0;st.fit=okFit?fit:null;st.base0=base;st.cam=cam;
  // Ease only between two zoomed framings while the game clock runs; a
  // paused or modal-held world (or a change from/to the identity camera) snaps.
  if(ease&&shown&&shown!==st.base0Prev&&cam!==base&&finite(shown.rc240ZoomRC240)&&!held(s)&&sameView(shown.rc153View,base.rc153View)&&finite(t)){
   st.fromX=shown.x;st.fromY=shown.y;st.fromScale=shown.scale;st.fromZ=shown.rc240ZoomRC240;st.easeT0=t;st.easeWall=wall();st.easing=true;st.bufT=NaN;st.buf=null;
   st.bufA={...cam};st.bufB={...cam};
  }else st.easing=false;
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
  const f=rc223Shrink(base),vw=Number(root.innerWidth),vh=Number(root.innerHeight),t=s.time;
  let st=aims.get(s);
  if(!st||st.zone!==s.zone||st.vw!==vw||st.vh!==vh){
   const nudge=!!st&&st.zone===s.zone&&Math.abs(st.vw-vw)<=POLICY.resizeNudgePx&&Math.abs(st.vh-vh)<=POLICY.resizeNudgePx;
   if(!st){st={zone:null,vw:0,vh:0,base:null,base0:null,f:1,version:-1,cam:null,fit:null,hx:NaN,emid:NaN,efar:NaN,boss:false,driftT:NaN,checkT:NaN,easing:false,easeT0:NaN,easeWall:0,base0Prev:null,fromX:0,fromY:0,fromScale:1,fromZ:1,bufA:null,bufB:null,buf:null,bufT:NaN,flip:false};aims.set(s,st);}
   st.zone=s.zone;st.vw=vw;st.vh=vh;st.checkT=t;refit(st,s,base,f,focus(s,focusNow),false,nudge);
  }else if(st.f!==f||st.version!==controlsVersion){
   // Layout inputs (touch controls, insets, RC223 view setting) can change
   // while paused: snap so the new constraints hold at once.
   st.checkT=t;refit(st,s,base,f,focus(s,focusNow),false);
  }else if(st.base!==base){
   st.checkT=t;refit(st,s,base,f,focus(s,focusNow),true);
  }else if(st.checkT!==t){
   // Dead zone with hysteresis: the framing stays while the far actor is in
   // [60%, 79%] of the width; outside it must persist before a re-aim.
   st.checkT=t;const fz=focus(s,focusNow),a=acceptable(st,fz);
   if(a<0)refit(st,s,base,f,fz,true);
   else if(a===0){if(!finite(st.driftT)||!finite(t))st.driftT=t;else if(t-st.driftT>=POLICY.zoomDriftSeconds)refit(st,s,base,f,fz,true);}
   else st.driftT=NaN;
  }
  return current(st,s,t);
 }
 // ------------------------------------------------------------------ danger band
 // The RC223 danger strip (old hero line y-x = 1.45 up to the x < 19 centre
 // line, on the playable floor) is painted as a floor band during stand-off
 // combat, phone and PC. Review round 2: the old flat fill + entry column
 // read as a screen-aligned red rectangle. Now it follows the iso grid: a
 // faint base fill, stripes along the floor's y axis (combined ~28% where they
 // lie), and a crisp boundary (dashes on the line plus iso chevrons pointing
 // into the strip, arms along the floor axes). Everything is clipped to the
 // walkable floor. Drawn from the native FLOW.drawFloor call (world/camera
 // transform, after the map, before dim/actors/bullets). Geometry is built
 // once into flat arrays; each frame replays four paths, no allocation.
 const band={src:null,strip:null,stripes:null,dashes:null,chevrons:null};
 function clipPoly(pts,fn){const out=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],va=fn(a),vb=fn(b);if(va>=-1e-10)out.push(a);if((va>=-1e-10)!==(vb>=-1e-10)){const t=va/(va-vb);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}return out;}
 function toG(pts){const g=new Float64Array(pts.length*2);for(let i=0;i<pts.length;i++){g[i*2]=640+27*(pts[i].x-pts[i].y);g[i*2+1]=13.5*(pts[i].x+pts[i].y);}return g;}
 function inConvex(q,poly){let sg=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],c=(b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x);if(Math.abs(c)<1e-9)continue;const d=c>0?1:-1;if(!sg)sg=d;else if(d!==sg)return false;}return true;}
 function bandGeometry(){
  const poly=D()?.polygon?.('all',.8);if(!poly?.length)return false;if(band.src===poly)return !!band.strip;
  band.src=poly;const C=root.__HAPIL_LEFT_ZONE_RC223__?.policy?.centerX??19,start=-POLICY.heroLine;
  const strip=clipPoly(clipPoly(poly,p=>(p.x-p.y)-start),p=>C-p.x);
  band.strip=strip.length>=3?toG(strip):null;band.stripes=null;band.dashes=null;band.chevrons=null;
  if(!band.strip)return false;
  // Stripes: x in [c, c+w] every period, along the floor's y axis.
  let x0=Infinity,x1=-Infinity;for(const p of strip){if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;}
  const stripes=[];for(let c=C-POLICY.bandStripeWidth-POLICY.bandStripeGap*.5;c>x0-POLICY.bandStripeWidth;c-=POLICY.bandStripeWidth+POLICY.bandStripeGap){
   const q=clipPoly(clipPoly(strip,p=>p.x-c),p=>c+POLICY.bandStripeWidth-p.x);if(q.length>=3)stripes.push(toG(q));}
  band.stripes=stripes.length?stripes:null;
  // Boundary: the strip edge on x-y = start, from far (small x+y) to near.
  let lo=Infinity,hi=-Infinity;for(const p of strip)if(Math.abs((p.x-p.y)-start)<1e-6){const t=p.x+p.y;if(t<lo)lo=t;if(t>hi)hi=t;}
  if(finite(lo)&&hi-lo>.5){
   const at=(u,d)=>({x:(u+d)/2,y:(u-d)/2}); // x+y = u, x-y = d
   const dashes=[];for(let u=lo+.12;u<hi-.12;u+=POLICY.bandDash+POLICY.bandDashGap){const e=Math.min(hi-.12,u+POLICY.bandDash);if(e-u>.08)dashes.push(toG([at(u,start),at(e,start)]));}
   band.dashes=dashes.length?dashes:null;
   const a=POLICY.bandChevron,chev=[];
   for(let u=lo+POLICY.bandChevronStep*.5;u<hi-a;u+=POLICY.bandChevronStep){
    const T=at(u,start+a),A1={x:T.x-a,y:T.y},A2={x:T.x,y:T.y+a};
    if(inConvex(T,strip)&&inConvex(A1,strip)&&inConvex(A2,strip))chev.push(toG([A1,T,A2]));
   }
   band.chevrons=chev.length?chev:null;
  }
  return true;
 }
 function tracePath(ctx,g){ctx.beginPath();ctx.moveTo(g[0],g[1]);for(let i=2;i<g.length;i+=2)ctx.lineTo(g[i],g[i+1]);ctx.closePath();}
 function traceMany(ctx,list,close){ctx.beginPath();for(let k=0;k<list.length;k++){const g=list[k];ctx.moveTo(g[0],g[1]);for(let i=2;i<g.length;i+=2)ctx.lineTo(g[i],g[i+1]);if(close)ctx.closePath();}}
 function drawBand(ctx,s){
  if(!ctx||!s||typeof s!=='object'||rawMode(s)!=='standoff'||heroSide(s)!=='left'||!bandGeometry())return;
  ctx.save();
  try{ctx.globalCompositeOperation='source-over';ctx.fillStyle=POLICY.bandColor;
   ctx.globalAlpha=POLICY.bandAlpha;tracePath(ctx,band.strip);ctx.fill();
   if(band.stripes){ctx.globalAlpha=POLICY.bandStripeAlpha;traceMany(ctx,band.stripes,true);ctx.fill();}
   ctx.strokeStyle=POLICY.bandEdgeColor;ctx.lineCap='round';ctx.lineJoin='round';
   if(band.dashes){ctx.globalAlpha=POLICY.bandDashAlpha;ctx.lineWidth=2.5;traceMany(ctx,band.dashes,false);ctx.stroke();}
   if(band.chevrons){ctx.globalAlpha=POLICY.bandChevronAlpha;ctx.lineWidth=3.5;traceMany(ctx,band.chevrons,false);ctx.stroke();}
   metrics.bandDraws++;}
  finally{ctx.restore();}
 }
 function wrapFlow(F){
  if(!F||typeof F!=='object'||typeof F.drawFloor!=='function'||F.drawFloor[MARK])return false;
  const base=F.drawFloor;
  const drawFloor=function(ctx,s,...rest){const r=base.call(this,ctx,s,...rest);try{drawBand(ctx,s);}catch(e){metrics.lastError=String(e?.message??e).slice(0,160);}return r;};
  drawFloor[MARK]=true;
  try{F.drawFloor=drawFloor;}catch{return false;}
  return F.drawFloor===drawFloor;
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
  try{wrapFlow(root.__HAPIL_FLOW_V31343__);}catch{}
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
  installed:()=>standoffReady,zoomFor:s=>{const st=s&&typeof s==='object'?aims.get(s):null;const z=st?.easing?st.buf?.rc240ZoomRC240:st?.cam?.rc240ZoomRC240;return finite(z)?z:1;},phone,landscapePhone,refreshClasses,tryLock,step,snapshot,lineFor,ensure,zoomCamera,readControls,setZoomEnabled:v=>{zoomOn=v!==false;return zoomOn;},zoomEnabled:()=>zoomOn,
  metrics:()=>Object.freeze({...metrics})});

 installDevice();
 let tries=0;
 function ready(){if(ensure()||++tries>=1200){root.setInterval?.(heartbeat,1000);return;}root.setTimeout?.(ready,25);}
 ready();
})(typeof window!=='undefined'?window:globalThis);
