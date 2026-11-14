'use strict';
// RC240 review round 1 fixes for assets/rc240/mobile-landscape.js:
//  1. phone zoom framing (hero-boss pair, boss <= 78% / never > 85%, lower
//     vertical target, whole floor kept, stable + eased re-aim);
//  2. retreating mobs kept >= 60 CSS px inside the frame edge on phone;
//  3. F button out of the boss lane (top-left, under the resonance bar);
//  4. faint isometric danger-strip floor band during combat (phone and PC).
// Real RC134/RC138/RC227/RC223 geometry; only the browser surface is stubbed
// (same harness shape as tests/rc240-mobile-landscape-unit.cjs).
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(repo,f),'utf8');
const SCRIPT=read('assets/rc240/mobile-landscape.js');
let checks=0;const ok=(c,m)=>{assert.ok(c,m);checks++;};const near=(a,b,e,m)=>{assert.ok(Math.abs(a-b)<=e,`${m}: ${a} vs ${b}`);checks++;};

// Live control rects measured at 812x375 (manual mode) with the F button at
// its new top-left place under the resonance bar (4..104 x 56..73).
const F_NEW={left:6,top:100,right:46,bottom:140};
const rectsFor=(vw,vh,ins={left:0,right:0,top:0,bottom:0})=>({'.hm-movement':{left:ins.left+6,top:vh-ins.bottom-82,right:ins.left+82,bottom:vh-ins.bottom-6},'.hm-actions':{left:vw-ins.right-162,top:vh-ins.bottom-54,right:vw-ins.right-6,bottom:vh-ins.bottom-6},
 '#hapil-mobile-controls-v31366 [data-mobile-action="F"]':{left:ins.left+6,top:ins.top+100,right:ins.left+46,bottom:ins.top+140},'.rc108-settings-trigger':{left:vw-ins.right-44,top:ins.top+4,right:vw-ins.right-4,bottom:ins.top+44}});
function makeDom({touch=true,coarse=true,screen={width:375,height:812},inner={width:812,height:375},insets={left:0,right:0,top:0,bottom:0},rects}={}){
 rects=rects??rectsFor(inner.width,inner.height,insets);
 const classes=new Set(touch?['hapil-touch-v31366']:[]),listeners={},docListeners={},timers=[],intervals=[],styles=[];
 const el=tag=>({tagName:tag.toUpperCase(),id:'',textContent:'',children:[],appendChild(c){this.children.push(c);if(c.tagName==='STYLE')styles.push(c);return c;}});
 const document={readyState:'complete',head:el('head'),body:el('body'),
  documentElement:{classList:{add:(...c)=>c.forEach(x=>classes.add(x)),remove:(...c)=>c.forEach(x=>classes.delete(x)),toggle:(c,on)=>{if(on===undefined)on=!classes.has(c);on?classes.add(c):classes.delete(c);return on;},contains:c=>classes.has(c)}},
  createElement:el,getElementById:id=>styles.find(s=>s.id===id)??null,
  querySelector:sel=>{const r=rects?.[sel];return r?{getBoundingClientRect:()=>({...r,x:r.left,y:r.top,width:r.right-r.left,height:r.bottom-r.top})}:null;},
  addEventListener:(t,f)=>{(docListeners[t]??=[]).push(f);},removeEventListener(){}};
 const win={document,innerWidth:inner.width,innerHeight:inner.height,navigator:{maxTouchPoints:touch?5:0},screen:{width:screen.width,height:screen.height},
  getComputedStyle:()=>({getPropertyValue:k=>{const m=/^--rc154-safe-(left|right|top|bottom)$/.exec(k);return m?(insets[m[1]]??0)+'px':'';}}),
  __HAPIL_MOBILE_V31366__:{enabled:()=>touch},
  matchMedia:q=>({matches:/pointer:\s*coarse|hover:\s*none/.test(q)?coarse:false}),
  addEventListener:(t,f)=>{(listeners[t]??=[]).push(f);},removeEventListener(){},
  setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout(){},setInterval:f=>{intervals.push(f);return 1000+intervals.length;},clearInterval(){},
  console,Math,JSON,Object,Array,Number,String,Symbol,WeakMap,WeakSet,Map,Set,Promise,Error,TypeError,Proxy,Reflect,isFinite,parseFloat,Float64Array};
 if(touch)win.ontouchstart=null;win.window=win;win.globalThis=win;
 return {win,classes,styles,timers,fire:(t,e={})=>{for(const f of listeners[t]??[])f(e);},runTimers:(n=3)=>{for(let k=0;k<n;k++){const b=timers.splice(0);for(const f of b)f();for(const f of intervals.slice())f();}}};
}
// RC153 base camera: its real formula (combat-layout.js camera()) for the
// measured frame, so every viewport gets the camera the game would give it.
function rc153Camera(vw,vh,ins){
 const k=Math.min(vw/1280,vh/720),view={x:(1280-vw/k)/2,y:(720-vh/k)/2,width:vw/k,height:vh/k,k};
 const b={left:-59.24,right:1328.68,top:219.19,bottom:728.14},gaps={top:Math.max(8,ins.top+8),bottom:Math.max(8,ins.bottom+8)};
 const pad=Math.max(48,ins.left+8,ins.right+8)/k,width=view.width-pad*2,top=view.y+Math.min(gaps.top/k,view.height*.22),bottom=view.y+view.height-Math.min(gaps.bottom/k,view.height*.24);
 const scale=Math.min(2.4,width/(2*Math.max(Math.abs(640-b.left),Math.abs(b.right-640))),(bottom-top)/(b.bottom-b.top));
 return {x:view.x+view.width/2-640*scale,y:(top+bottom)/2-(b.top+b.bottom)*scale/2,scale,battleArenaRC138:true,rc153WholeBody:true,rc153View:view,rc153Viewport:{width:vw,height:vh},rc153MapWidth:1584};
}
function loadGame(dom,{flow=true}={}){
 const root=dom.win;vm.createContext(root);
 for(const f of ['assets/rc134/persona-duel.js','assets/rc138/battle-arena.js','assets/rc227/floor-patches.js','assets/rc223/left-zone.js'])vm.runInContext(read(f),root,{filename:f});
 const R=root.__HAPIL_BATTLE_ARENA_RC138__,D=root.__HAPIL_PERSONA_DUEL_RC134__;
 R.bind({combat:['ep1b03','dist06','cult04'],clear:s=>!(s?.enemies??[]).some(a=>a?.hp>0)});
 root.__HAPIL_INNER_FINAL_RC133__={encounter:s=>s?.personaTestRC240===true};
 const ins={left:0,right:0,top:0,bottom:0};const css=root.getComputedStyle();for(const k of Object.keys(ins))ins[k]=parseFloat(css.getPropertyValue('--rc154-safe-'+k))||0;
 const holder={base:rc153Camera(root.innerWidth,root.innerHeight,ins)};
 root.__HAPIL_COMBAT_LAYOUT_RC153__=Object.freeze({policy:{},boss:a=>!!(a?.boss||a?.midboss),position:(a,q)=>q,framing:()=>({left:-59.24,right:1328.68,top:219.19,bottom:728.14}),
  camera:st=>R.enabled(st)?holder.base:null,scatter(){},bind(){}});
 root.__HAPIL_CONTROLS_V31329__={binding:{state:{current:null},phase:'game'},frameStart(){return 'native';}};
 const floorCalls=[];
 if(flow)root.__HAPIL_FLOW_V31343__={version:'flow',drawFloor(ctx,s){floorCalls.push(s);}};
 vm.runInContext(SCRIPT,root,{filename:'assets/rc240/mobile-landscape.js'});dom.runTimers(2);
 return {root,R,D,holder,floorCalls,API:root.__HAPIL_MOBILE_LANDSCAPE_RC240__,L:root.__HAPIL_COMBAT_LAYOUT_RC153__};
}
const G=(x,y)=>({x:640+27*(x-y),y:13.5*(x+y)});
const toCss=(cam,gx,gy)=>{const v=cam.rc153View;return{x:(cam.x+gx*cam.scale-v.x)*v.k,y:(cam.y+gy*cam.scale-v.y)*v.k};};
const actorCss=(cam,a)=>{const g=G(a.x,a.y);return toCss(cam,g.x,g.y);};
const world=(extra={})=>({zone:'ep1b03',time:100,hp:240,maxHp:240,x:15.84,y:16.16,gameModeV31346:'STORY',enemies:[],...extra});
const VIEWS=[['812x375',812,375,{left:0,right:0,top:0,bottom:0}],['844x390',844,390,{left:0,right:0,top:0,bottom:0}],['667x375',667,375,{left:0,right:0,top:0,bottom:0}],['812x375 notch',812,375,{left:47,right:47,top:0,bottom:21}]];
const inRect=(p,r)=>p.x>r.left&&p.x<r.right&&p.y>r.top&&p.y<r.bottom;
function edgeHits(pts,r){for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];for(let t=0;t<=1;t+=.02)if(inRect({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},r))return true;}return false;}

// ------------------------------------------------ 1. boss-fight framing on every phone size
// Envy b03 boss and Lucifer/Balrog-like placements (x-y = 16, 12.6, 19).
for(const [label,vw,vh,ins] of VIEWS)for(const [bx,by] of [[27.47,11.48],[24.4,11.8],[28,9]]){
 const dom=makeDom({inner:{width:vw,height:vh},insets:ins});const {R,D,L,holder,API}=loadGame(dom);
 const s=world();const boss={id:'boss',boss:true,hp:1e6,maxHp:1e6,x:bx,y:by};s.enemies=[boss];R.enforce(s);R.applyPosition(boss,{x:bx,y:by});
 const cam=L.camera(s,holder.base.rc153View),tag=`${label} boss x-y ${(boss.x-boss.y).toFixed(1)}`;
 ok(cam!==holder.base&&cam.rc240ZoomRC240>1,tag+': phone zoom applied');
 const sl=ins.left,sr=vw-ins.right,W=vw,b=actorCss(cam,boss),h=actorCss(cam,s);
 ok(b.x<=.78*W+1e-6,tag+`: boss foot at ${(b.x/W*100).toFixed(1)}% of width (<= 78%)`);
 ok(b.x<=.85*W,tag+': boss never past 85%');
 ok((h.x+b.x)/2<=.63*W,tag+`: fight midpoint pulled towards centre (${((h.x+b.x)/2/W*100).toFixed(1)}%)`);
 const pts=D.polygon('all',.8).map(p=>{const g=G(p.x,p.y);return toCss(cam,g.x,g.y);});
 ok(pts.every(p=>p.x>=sl+4-1e-6&&p.x<=sr-4+1e-6&&p.y>=ins.top-1e-6&&p.y<=vh-ins.bottom+1e-6),tag+': whole playable floor (incl. its left edge) inside the safe area');
 for(const [sel,r] of Object.entries(rectsFor(vw,vh,ins)))ok(!edgeHits(pts,r),tag+': floor clear of '+sel);
 // vertical: the body frame sits ~8% of screen height below centre (or on the bottom edge)
 const fr={t:toCss(cam,0,219.19).y,b:toCss(cam,0,728.14).y},st=ins.top,sb=vh-ins.bottom,drop=(fr.t+fr.b)/2-(st+sb)/2;
 ok(fr.t>=st-1e-6&&fr.b<=sb+1e-6,tag+': bodies standing on the floor stay on screen');
 // 8% aim; with notch insets the bottom thumb clusters can stop it a little earlier
 ok(drop>=(ins.left?.05:.075)*vh-1e-6||fr.b>=sb-2.5,tag+`: vertical target lowered (${(drop/vh*100).toFixed(1)}% of height)`);
 ok(cam.scale/holder.base.scale<=API.policy.maxZoom+1e-9,tag+': zoom within ceiling');
}

// ------------------------------------------------ 2. stability, eased re-aim, pointer alignment, no per-frame allocation
{
 const dom=makeDom();const {R,L,holder}=loadGame(dom);const view=holder.base.rc153View;
 const s=world();const boss={id:'boss',boss:true,hp:1e6,maxHp:1e6,x:27.47,y:11.48};s.enemies=[boss];R.enforce(s);
 const cam0=L.camera(s,view);
 // normal movement: hero strafes across its zone, boss sways 1 unit; 3 s at 60 fps
 let same=true;for(let i=0;i<180;i++){s.time+=1/60;s.x=12+4*Math.sin(i/9);s.y=22-3*Math.cos(i/11);boss.x=27.47+.5*Math.sin(i/7);boss.y=11.48-.5*Math.sin(i/7);if(L.camera(s,view)!==cam0)same=false;}
 ok(same,'normal hero/boss movement never moves the camera (dead zone, no swimming, no allocation)');
 // a sustained boss shift out of the dead zone (to ~81% of the width, x-y 14 -> 16.8) re-aims once, eased
 ok(R.applyPosition(boss,{x:28.9,y:12.1}),'boss write');const W=812;let prevBx=actorCss(L.camera(s,view),boss).x,maxStep=0,changedAt=null,frames=0;const objs=new Set();
 for(let i=0;i<150;i++){s.time+=1/60;const c=L.camera(s,view);ok(L.camera(s,view)===c,'pointer/render calls in one frame share one camera');objs.add(c);const bx=actorCss(c,boss).x;if(c!==cam0&&changedAt===null)changedAt=i;maxStep=Math.max(maxStep,Math.abs(bx-prevBx));prevBx=bx;frames++;}
 const camEnd=L.camera(s,view),bEnd=actorCss(camEnd,boss);
 ok(changedAt!==null&&changedAt>=30,'re-aim waits for the shift to persist (frame '+changedAt+')');
 ok(maxStep<=14,'re-aim is eased (max boss move '+maxStep.toFixed(2)+' css px / frame)');
 ok(bEnd.x<=.78*W+1e-6,'after re-aim the boss is back inside 78% ('+(bEnd.x/W*100).toFixed(1)+'%)');
 ok(objs.size<=4,'easing reuses a fixed set of camera objects ('+objs.size+')');
 s.time+=1/60;ok(L.camera(s,view)===camEnd,'settled camera is reused again');
 // an urgent shift (boss pushed past 85% of the current framing) re-aims at once, still eased
 {const d2=makeDom(),g=loadGame(d2),w=world(),b2={id:'boss',boss:true,hp:1e6,maxHp:1e6,x:27.47,y:11.48};w.enemies=[b2];g.R.enforce(w);const v2=g.holder.base.rc153View;
  const cA=g.L.camera(w,v2);ok(g.R.applyPosition(b2,{x:29.8,y:9.6}),'boss write');ok(actorCss(cA,b2).x>.85*W,'fixture: boss now past 85% of the old framing');
  w.time+=1/60;const cB=g.L.camera(w,v2);ok(cB!==cA&&Math.abs(actorCss(cB,b2).x-actorCss(cA,b2).x)<=14,'boss past 85%: immediate eased re-aim');
  for(let i=0;i<60;i++){w.time+=1/60;g.L.camera(w,v2);}w.time+=1/60;const cC=g.L.camera(w,v2);const pc=actorCss(cC,b2).x/W;
  ok(pc<=.85,'urgent re-aim brings the boss back inside 85% ('+(pc*100).toFixed(1)+'%)');}
 // phase change (RC153 hands out a new base object): eased, first frame continuous
 ok(R.applyPosition(boss,{x:26.4,y:13.6}),'boss write');s.time+=1/60;const camNow=L.camera(s,view),before=actorCss(camNow,boss).x;ok(camNow===L.camera(s,view),'boss back inside the dead zone: no re-aim yet');holder.base={...holder.base,scale:holder.base.scale*.93,rc153View:{...holder.base.rc153View}};/* RC153 re-fit for a larger roster: fresh object, smaller base scale, fresh view copy */s.time+=1/60;const c1=L.camera(s,view);
 ok(Math.abs(actorCss(c1,boss).x-before)<=14,'phase re-aim starts from the current framing (no pop)');
 {let mx=0,prev=actorCss(c1,boss).x;for(let i=0;i<50;i++){s.time+=1/60;const x=actorCss(L.camera(s,view),boss).x;mx=Math.max(mx,Math.abs(x-prev));prev=x;}ok(mx<=14,'phase re-aim eased ('+mx.toFixed(2)+' px/frame)');}
 // paused world (time frozen): a re-fit snaps instead of freezing half-way
 {for(let i=0;i<60;i++){s.time+=1/60;L.camera(s,view);}s.paused=true;ok(R.applyPosition(boss,{x:27.47,y:11.48}),'boss write');holder.base={...holder.base,scale:holder.base.scale/.93,rc153View:{...holder.base.rc153View}};
  const p1=L.camera(s,view),p2=L.camera(s,view);ok(p1===p2&&!Number.isNaN(p1.rc240ZoomRC240)&&p1.scale===L.camera(s,view).scale,'paused: re-fit applied at once (no frozen ease)');
  s.time+=1/60;ok(L.camera(s,view)===p1,'paused: settled object reused');s.paused=false;}
 // NaN hero / boss: finite camera, no throw
 s.x=NaN;boss.x=NaN;let c2;assert.doesNotThrow(()=>{s.time+=1;c2=L.camera(s,view);});checks++;
 ok(Number.isFinite(c2.x)&&Number.isFinite(c2.y)&&Number.isFinite(c2.scale),'non-finite actors never produce a non-finite camera');
}

// ------------------------------------------------ 3. mobs retreating from a hero deep in the strip stay >= 60 css px inside
for(const [label,vw,vh,ins] of VIEWS){
 const dom=makeDom({inner:{width:vw,height:vh},insets:ins});const {R,L,holder,API}=loadGame(dom);
 const s=world({x:12,y:24});const mobs=[{id:'m1',hp:1e6,maxHp:1e6,x:22.5,y:16.5},{id:'m2',hp:1e6,maxHp:1e6,x:24,y:15},{id:'m3',hp:1e6,maxHp:1e6,x:23,y:13.5}];s.enemies=mobs;R.enforce(s);
 // hero walks to the deepest strip point; the line follows and mobs retreat
 s.x=18.9;s.y=7.7;for(let i=0;i<240;i++){s.time+=1/60;API.step(s,1/60);L.camera(s,holder.base.rc153View);}
 const cam=L.camera(s,holder.base.rc153View),edge=vw-ins.right,line=API.snapshot(s).enemyLine;
 const lineCss=toCss(cam,640+27*line,0).x;
 ok(lineCss<=edge-60-30,label+`: mob line (x-y ${line.toFixed(2)}) sits ${(edge-lineCss).toFixed(0)} css px inside the edge (>= 60 + 30 px half body)`);
 for(const m of mobs){const p=actorCss(cam,m);ok(p.x<=edge-60,label+`: retreated ${m.id} foot ${(edge-p.x).toFixed(0)} px inside the frame edge`);}
 ok(line-(s.x-s.y)>=.5,label+': mobs never stand on the hero lane in the strip (gap '+(line-(s.x-s.y)).toFixed(2)+' units)');
 ok(R.contains({x:15,y:14},'all',.8,s),label+': RC223 strip point {15,14} is still on the physical floor');
}

// ------------------------------------------------ 4. F button out of the boss lane
{
 const dom=makeDom();loadGame(dom);
 const css=dom.styles.find(x=>x.id==='rc240-mobile-landscape-style').textContent,rule=css.split('\n').find(r=>/data-mobile-action="F"\]/.test(r));
 ok(rule.includes('top:calc(var(--rc154-safe-top,env(safe-area-inset-top,0px)) + 100px)!important')&&rule.includes('left:calc(var(--rc154-safe-left,env(safe-area-inset-left,0px)) + 6px)!important'),'F is parked top-left under the resonance bar (safe-area aware)');
 ok(/bottom:auto!important/.test(rule)&&/right:auto!important/.test(rule),'F no longer anchored to the bottom-right action cluster');
 ok(/width:40px!important/.test(rule)&&/height:40px!important/.test(rule),'F keeps a 40 px target');
 // resonance bar 4..104 x 56..73 and the RC240 stock readout under it (to ~92, measured); F 6..46 x 100..140; stick top 293 -> 153 px gap
 ok(F_NEW.top-92>=8&&293-F_NEW.bottom>=40,'F clear of the resonance bar and well above the stick');
 // fallback geometry (no DOM element) matches the new place
 const dom2=makeDom({rects:{}});const g2=loadGame(dom2);const s=world();s.enemies=[{id:'m',hp:5,x:26,y:12}];g2.R.enforce(s);const cam=g2.L.camera(s,g2.holder.base.rc153View);
 const pts=g2.D.polygon('all',.8).map(p=>{const g=G(p.x,p.y);return toCss(cam,g.x,g.y);});ok(!edgeHits(pts,F_NEW),'fallback F rect is the new top-left place and the floor stays clear of it');
}

// ------------------------------------------------ 5. danger-strip floor band
function recorder(){const calls=[];const ctx={calls,globalAlpha:1,fillStyle:'',strokeStyle:'',lineWidth:1,globalCompositeOperation:'source-over',
 save(){calls.push(['save']);},restore(){calls.push(['restore']);},beginPath(){calls.push(['begin']);},moveTo(x,y){calls.push(['m',x,y]);},lineTo(x,y){calls.push(['l',x,y]);},closePath(){calls.push(['close']);},
 fill(){calls.push(['fill',this.globalAlpha,this.fillStyle]);},stroke(){calls.push(['stroke',this.globalAlpha,this.strokeStyle]);}};return ctx;}
const inv=(gx,gy)=>{const a=(gx-640)/27,b=gy/13.5;return{x:(a+b)/2,y:(b-a)/2};};
for(const [label,opts] of [['phone',{}],['desktop',{touch:false,coarse:false,screen:{width:1920,height:1080},inner:{width:1280,height:720}}]]){
 const dom=makeDom(opts);const {R,D,root,floorCalls}=loadGame(dom);
 const flow=root.__HAPIL_FLOW_V31343__;ok(flow.drawFloor.rc240StandoffRC240===true,label+': FLOW.drawFloor seam wrapped');
 const s=world({x:12,y:24});s.enemies=[{id:'m',hp:5,maxHp:5,x:26,y:12}];R.enforce(s);
 const ctx=recorder();flow.drawFloor(ctx,s);
 ok(floorCalls.length===1&&floorCalls[0]===s,label+': native drawFloor still runs first');
 const fills=ctx.calls.filter(c=>c[0]==='fill');ok(fills.length>=1,label+': band drawn during combat');
 ok(fills.every(c=>c[1]>0&&c[1]<=.2),label+': band is faint (alpha '+fills.map(c=>c[1]).join(',')+')');
 const pts=ctx.calls.filter(c=>c[0]==='m'||c[0]==='l').map(c=>inv(c[1],c[2]));
 ok(pts.length>=6&&pts.every(p=>p.x-p.y>=-1.45-1e-6&&p.x<=19+1e-6),label+': band lies on the floor plane inside the RC223 strip (x-y >= -1.45, x <= 19)');
 ok(pts.every(p=>D.contains(p,'all',.8-1e-3)||D.contains(p,'all',.75)),label+': band points are on the playable floor');
 ok(pts.some(p=>Math.abs((p.x-p.y)+1.45)<1e-6),label+': band marks where the strip begins (x-y = -1.45)');
 ok(ctx.calls.filter(c=>c[0]==='save').length===ctx.calls.filter(c=>c[0]==='restore').length,label+': context state restored');
 // steady state: second frame issues the identical call list (no rebuilt geometry)
 const ctx2=recorder();flow.drawFloor(ctx2,s);ok(JSON.stringify(ctx2.calls)===JSON.stringify(ctx.calls),label+': cached geometry, identical draw each frame');
 // not in combat / not in a stand-off
 const rest=world({zone:'village'});const c3=recorder();flow.drawFloor(c3,rest);ok(!c3.calls.some(c=>c[0]==='fill'),label+': no band outside combat');
 s.enemies[0].hp=0;const c4=recorder();flow.drawFloor(c4,s);ok(!c4.calls.some(c=>c[0]==='fill'),label+': no band once the fight is cleared');
 const persona=world({zone:'cult04',personaTestRC240:true,innerFinalRC133:{duelSwap:false}});persona.enemies=[{id:'inner-evil-rc133',hp:5,x:26,y:12}];
 const c5=recorder();flow.drawFloor(c5,persona);ok(!c5.calls.some(c=>c[0]==='fill'),label+': no band in the Persona duel');
 // idempotent: heartbeat does not double-wrap; a replaced FLOW object is re-wrapped once
 const fn=flow.drawFloor;dom.runTimers(2);ok(root.__HAPIL_FLOW_V31343__.drawFloor===fn,label+': heartbeat keeps a single wrapper');
 root.__HAPIL_FLOW_V31343__={...flow};dom.runTimers(1);ok(root.__HAPIL_FLOW_V31343__.drawFloor===fn,label+': spread copy keeps the marked wrapper (no nesting)');
 const nf={drawFloor(){}};root.__HAPIL_FLOW_V31343__=nf;dom.runTimers(1);ok(nf.drawFloor.rc240StandoffRC240===true,label+': replaced FLOW object re-wrapped');
 const c6=recorder();assert.doesNotThrow(()=>nf.drawFloor(c6,{...s,x:NaN,enemies:[{id:'m',hp:5,x:26,y:12}]}));checks++;
}

// ------------------------------------------------ desktop camera untouched
{
 const dom=makeDom({touch:false,coarse:false,screen:{width:1920,height:1080},inner:{width:1280,height:720}});const {R,L,holder}=loadGame(dom);
 const s=world();s.enemies=[{id:'m',hp:5,x:26,y:12}];R.enforce(s);ok(L.camera(s,holder.base.rc153View)===holder.base,'desktop: camera object returned unchanged');
}
console.log(JSON.stringify({status:'passed',checks}));
