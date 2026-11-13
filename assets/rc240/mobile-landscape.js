/* RC240: phone landscape fit, portrait rotate prompt polish, and arcade
 * stand-off (hero zone left, enemy zone right, fixed gap) for every mode.
 *
 * - Device layer: marks phones (touch + coarse pointer + short screen side),
 *   adds a landscape HUD placement that keeps the F button and resonance bar
 *   off the canvas danmaku panel, and makes a best-effort orientation lock.
 *   Portrait pausing itself stays owned by RC152/RC231 (combat-layout.js).
 * - Stand-off layer: wraps the RC227 floor-patch point seam (used by every
 *   RC138 enemy/hero position write) and the RC223 left-zone admission seam.
 *   Enemies keep x-y >= enemyLine on their side; the hero keeps the native
 *   RC138 line and may no longer cross the centre through the RC223 strip.
 *   While the RC134 Persona duel owns positions (its left/right mirror swap)
 *   this layer is inert; on hand-over it eases actors to the lines.
 * No bundle edits. Wraps public globals only; idempotent; re-checks each second.
 */
(function(root){'use strict';
 if(!root||root.__HAPIL_MOBILE_LANDSCAPE_RC240__)return;
 const MARK='rc240StandoffRC240';
 const POLICY=Object.freeze({
  heroLine:1.45,           // y-x >= 1.45 for the hero (native RC138/RC134 left polygon)
  enemyLine:5,             // x-y >= 5 for hostiles (native was 1.45)
  settleRate:4,            // x-y units per second while easing after a hand-over
  screenPxPerUnit:27,      // G(x,y).x = 640 + 27(x-y)
  gapLogicalPx:(1.45+5)*27,
  heroMaxScreenX:640-1.45*27,
  enemyMinScreenX:640+5*27,
  phoneMaxShortSide:600,
  maxFrameDelta:.1
 });
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 const metrics={installs:0,rewraps:0,enemyClamps:0,heroDenied:0,settleWrites:0,heroSettleWrites:0,handovers:0,lockAttempts:0,lockOk:0,lockRejected:0,lockUnsupported:0,classUpdates:0};
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
  for(const t of ['resize','orientationchange','pageshow'])root.addEventListener?.(t,refreshClasses,{passive:true});
  try{root.visualViewport?.addEventListener?.('resize',refreshClasses,{passive:true});}catch{}
  root.addEventListener?.('pointerup',onFirstTouch,{capture:true,passive:true});
  root.addEventListener?.('touchend',onFirstTouch,{capture:true,passive:true});
  root.document?.addEventListener?.('fullscreenchange',onFullscreen);
  root.document?.addEventListener?.('webkitfullscreenchange',onFullscreen);
  // Loaded before <head>/<body> exist (e.g. injected early): retry once parsed.
  root.document?.addEventListener?.('DOMContentLoaded',()=>{injectStyle();refreshClasses();},{once:true});
 }
 // Other layers may rewrite <html class>; the heartbeat restores ours.
 function heartbeat(){injectStyle();const h=html();if(h?.classList){const p=phone(),l=p&&Number(root.innerWidth)>Number(root.innerHeight);if(h.classList.contains('rc240-phone')!==p||h.classList.contains('rc240-landscape')!==l)refreshClasses();}ensure();}

 // ------------------------------------------------------------------ stand-off
 const guest=()=>{try{const r=root.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.()?.role;if(r==='guest'||r==='disconnected')return true;}catch{}const p=root.__HAPIL_PARTY_V31322__?.status;return p?.role==='guest'||p?.role==='disconnected';};
 function rawMode(s){
  const A=R();if(!s||typeof s!=='object'||!A?.enabled?.(s))return 'rest';
  if(D()?.active?.(s))return 'mirror';
  if(!A.locked?.(s))return 'clear';
  return 'standoff';
 }
 function slot(s){let w=worlds.get(s);if(!w){w={mode:null,zone:null,enemyAllowance:0,heroAllowance:0,modeTime:NaN,modeZone:null};worlds.set(s,w);}return w;}
 // Signed distance past a side's line: >0 means inside the gap/other half.
 function violation(p,side,line){return side==='right'?line-(p.x-p.y):line-(p.y-p.x);}
 function enemySide(s){return R()?.side?.(s,false)??'right';}
 function heroSide(s){return R()?.side?.(s,true)??'left';}
 function heroViolation(s,p){return finite(p?.x)&&finite(p?.y)?violation(p,heroSide(s),POLICY.heroLine):0;}
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
  if(w.zone!==s.zone){w.zone=s.zone;w.mode=null;w.enemyAllowance=0;w.heroAllowance=0;}
  if(m!==w.mode){
   const prev=w.mode;w.mode=m;
   if(m==='standoff'){
    if(prev==='mirror'){w.enemyAllowance=maxEnemyViolation(s);metrics.handovers++;}
    w.heroAllowance=Math.max(0,Math.min(POLICY.heroLine+40,heroViolation(s,s)));
   }
  }
  return m;
 }
 function enemyLineNow(s){return POLICY.enemyLine-slot(s).enemyAllowance;}
 function wrapFloorPatches(FP){
  if(!FP||FP[MARK]||typeof FP.point!=='function')return FP;
  const base=FP.point;
  const point=function(q,which,radius,scope,fallback){
   const out=base.call(this,q,which,radius,scope,fallback);
   if(!scope||typeof scope!=='object'||which==='all'||!out||!finite(out.x)||!finite(out.y)||!finite(q?.x)||!finite(q?.y))return out;
   if(mode(scope)!=='standoff'||which!==enemySide(scope))return out;
   const line=enemyLineNow(scope),v=violation(out,which,line);
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
 function wrapLeftZone(LZ){
  if(!LZ||LZ[MARK]||typeof LZ.allowed!=='function')return LZ;
  const gate=(fn)=>function(s,a,p,...rest){
   const ok=fn.call(this,s,a,p,...rest);
   if(ok!==true||!s||typeof s!=='object'||!p||mode(s)!=='standoff')return ok;
   if(heroViolation(s,p)<=slot(s).heroAllowance+1e-9)return ok;
   metrics.heroDenied++;return false;
  };
  const out={...LZ,allowed:gate(LZ.allowed),[MARK]:true};
  if(typeof LZ.canMove==='function')out.canMove=gate(LZ.canMove);
  return Object.freeze(out);
 }
 function step(s,dt){
  const A=R();if(!A||!s||typeof s!=='object')return;
  if(guest())return;
  if(mode(s)!=='standoff')return;
  const w=slot(s),t=finite(dt)?Math.max(0,Math.min(POLICY.maxFrameDelta,dt)):0,dec=POLICY.settleRate*t;
  w.enemyAllowance=w.enemyAllowance>dec?w.enemyAllowance-dec:0;
  w.heroAllowance=w.heroAllowance>dec?w.heroAllowance-dec:0;
  const list=s.enemies,side=enemySide(s),line=POLICY.enemyLine-w.enemyAllowance,duel=D();
  if(list)for(let i=0;i<list.length;i++){
   const a=list[i];if(!a||!(a.hp>0)||!A.hostile?.(a))continue;
   const x=a.x,y=a.y;if(!finite(x)||!finite(y))continue;
   if(duel?.constrained?.(s,a))continue;
   if(violation(a,side,line)>1e-7){scratch.x=x;scratch.y=y;if(A.applyPosition?.(a,scratch))metrics.settleWrites++;}
  }
  // Hero: retreat out of the old RC223 crossing strip at the settle rate.
  const hx=s.x,hy=s.y;
  if(finite(hx)&&finite(hy)){
   const v=heroViolation(s,s);
   if(v>w.heroAllowance+1e-9){
    const h=(v-w.heroAllowance)/2,hs=heroSide(s);
    scratch.x=hs==='left'?hx-h:hx+h;scratch.y=hs==='left'?hy+h:hy-h;
    if(finite(scratch.x)&&finite(scratch.y)&&A.applyPosition?.(s,scratch))metrics.heroSettleWrites++;
   }
  }
 }
 const wrappedControls=new WeakSet();
 function wrapControls(C){
  if(!C||typeof C.frameStart!=='function'||wrappedControls.has(C))return!!C&&wrappedControls.has(C);
  const frame=C.frameStart;
  const next=function(s,dt,...args){const result=frame.call(this,s,dt,...args);try{step(s,dt);}catch(e){metrics.lastError=String(e?.message??e).slice(0,160);}return result;};
  next[MARK]=true;C.frameStart=next;wrappedControls.add(C);return true;
 }
 let standoffReady=false;
 function ensure(){
  const FP=root.__HAPIL_FLOOR_PATCHES_RC227__,LZ=root.__HAPIL_LEFT_ZONE_NATIVE_RC223__,C=root.__HAPIL_CONTROLS_V31329__;
  if(!R()||!FP||!C)return false;
  if(!FP[MARK]){const w=wrapFloorPatches(FP);if(w!==FP){root.__HAPIL_FLOOR_PATCHES_RC227__=w;if(standoffReady)metrics.rewraps++;}}
  if(LZ&&!LZ[MARK]){const w=wrapLeftZone(LZ);if(w!==LZ){root.__HAPIL_LEFT_ZONE_NATIVE_RC223__=w;if(standoffReady)metrics.rewraps++;}}
  wrapControls(C);
  if(!standoffReady){standoffReady=true;metrics.installs++;}
  return true;
 }
 function snapshot(s){
  const m=s&&typeof s==='object'?rawMode(s):'rest',w=s&&typeof s==='object'?worlds.get(s):null;
  return Object.freeze({mode:m,enemySide:m==='rest'?null:enemySide(s),heroSide:m==='rest'?null:heroSide(s),
   enemyLine:POLICY.enemyLine-(w?.enemyAllowance??0),heroAllowance:w?.heroAllowance??0,enemyAllowance:w?.enemyAllowance??0});
 }
 function lineFor(s,which){return Object.freeze({axis:which==='right'?'x-y':'y-x',value:which===enemySide(s)?enemyLineNow(s):POLICY.heroLine});}

 root.__HAPIL_MOBILE_LANDSCAPE_RC240__=Object.freeze({version:'RC240-ML',policy:POLICY,
  installed:()=>standoffReady,phone,landscapePhone,refreshClasses,tryLock,step,snapshot,lineFor,ensure,
  metrics:()=>Object.freeze({...metrics})});

 installDevice();
 let tries=0;
 function ready(){if(ensure()||++tries>=1200){root.setInterval?.(heartbeat,1000);return;}root.setTimeout?.(ready,25);}
 ready();
})(typeof window!=='undefined'?window:globalThis);
