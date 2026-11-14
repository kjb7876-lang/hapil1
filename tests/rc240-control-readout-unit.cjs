'use strict';
// RC240 control-layout readout (rc137-integration audit (portrait, 1) regression on deffccdf).
// RC240 fits its phone zoom around the touch controls and the RC154 safe-area
// insets, which it read only after a resize and in its 1 s heartbeat. Two
// timing faults followed:
//  1. right after a rotation or mode change the movement stick is still in its
//     0.05 s CSS transition, so the read caught a transient rect (measured live:
//     [352,251,492,384], the portrait placement) that left no feasible fit; the
//     camera dropped to the identity framing and the next heartbeat snapped the
//     zoom back at an arbitrary frame (tests/rc153-boundary-input-browser.cjs:
//     "camera moved with arrow/blink", first input frame unzoomed, next 1.19);
//  2. insets and control layouts switched by other layers (html/body classes,
//     inline CSS variables) reached the camera up to 1 s late, so captures
//     depended on the heartbeat phase (tests/rc154-mobile-layout-browser.cjs).
// A control in a CSS transition now defers the read (last layout kept, read
// again on the next camera call) and html/body class/style mutations trigger a
// re-read on the next camera call. Harness shape from tests/rc240-r2-camera-unit.cjs.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(repo,f),'utf8');
const SCRIPT=read('assets/rc240/mobile-landscape.js');
// SOFT=1 lists every failing check instead of stopping at the first (failing-first evidence).
let checks=0;const soft=[];const ok=(c,m)=>{if(process.env.SOFT&&!c){soft.push(m);checks++;return;}assert.ok(c,m);checks++;};

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
 return {win,classes,styles,timers,runTimers:(n=3)=>{for(let k=0;k<n;k++){const b=timers.splice(0);for(const f of b)f();for(const f of intervals.slice())f();}}};
}
function rc153Camera(vw,vh,ins){
 const k=Math.min(vw/1280,vh/720),view={x:(1280-vw/k)/2,y:(720-vh/k)/2,width:vw/k,height:vh/k,k};
 const b={left:-59.24,right:1328.68,top:219.19,bottom:728.14},gaps={top:Math.max(8,ins.top+8),bottom:Math.max(8,ins.bottom+8)};
 const pad=Math.max(48,ins.left+8,ins.right+8)/k,width=view.width-pad*2,top=view.y+Math.min(gaps.top/k,view.height*.22),bottom=view.y+view.height-Math.min(gaps.bottom/k,view.height*.24);
 const scale=Math.min(2.4,width/(2*Math.max(Math.abs(640-b.left),Math.abs(b.right-640))),(bottom-top)/(b.bottom-b.top));
 return {x:view.x+view.width/2-640*scale,y:(top+bottom)/2-(b.top+b.bottom)*scale/2,scale,battleArenaRC138:true,rc153WholeBody:true,rc153View:view,rc153Viewport:{width:vw,height:vh},rc153MapWidth:1584};
}
function loadGame(dom){
 const root=dom.win;vm.createContext(root);
 for(const f of ['assets/rc134/persona-duel.js','assets/rc138/battle-arena.js','assets/rc227/floor-patches.js','assets/rc223/left-zone.js'])vm.runInContext(read(f),root,{filename:f});
 const R=root.__HAPIL_BATTLE_ARENA_RC138__,D=root.__HAPIL_PERSONA_DUEL_RC134__;
 R.bind({combat:['ep1b03','dist06','ep1a11','last302'],clear:s=>!(s?.enemies??[]).some(a=>a?.hp>0)});
 root.__HAPIL_INNER_FINAL_RC133__={encounter:s=>s?.personaTestRC240===true};
 const ins={left:0,right:0,top:0,bottom:0};const css=root.getComputedStyle();for(const k of Object.keys(ins))ins[k]=parseFloat(css.getPropertyValue('--rc154-safe-'+k))||0;
 const holder={base:rc153Camera(root.innerWidth,root.innerHeight,ins)};
 root.__HAPIL_COMBAT_LAYOUT_RC153__=Object.freeze({policy:{},boss:a=>!!(a?.boss||a?.midboss),position:(a,q)=>q,framing:()=>({left:-59.24,right:1328.68,top:184.97,bottom:730.74}),
  camera:st=>R.enabled(st)?holder.base:null,scatter(){},bind(){}});
 root.__HAPIL_CONTROLS_V31329__={binding:{state:{current:null},phase:'game',modal:{current:null}},frameStart(){return 'native';}};
 const floorCalls=[];root.__HAPIL_FLOW_V31343__={version:'flow',drawFloor(ctx,s){floorCalls.push(s);}};
 vm.runInContext(SCRIPT,root,{filename:'assets/rc240/mobile-landscape.js'});dom.runTimers(2);
 return {root,R,D,holder,floorCalls,API:root.__HAPIL_MOBILE_LANDSCAPE_RC240__,L:root.__HAPIL_COMBAT_LAYOUT_RC153__};
}
const G=(x,y)=>({x:640+27*(x-y),y:13.5*(x+y)});
const toCss=(cam,gx,gy)=>{const v=cam.rc153View;return{x:(cam.x+gx*cam.scale-v.x)*v.k,y:(cam.y+gy*cam.scale-v.y)*v.k};};
const actorCss=(cam,a)=>{const g=G(a.x,a.y);return toCss(cam,g.x,g.y);};
const inRect=(p,r)=>p.x>r.left&&p.x<r.right&&p.y>r.top&&p.y<r.bottom;
function edgeHits(pts,r){for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];for(let t=0;t<=1;t+=.02)if(inRect({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},r))return true;}return false;}
const VIEWS=[['812x375',812,375,{left:0,right:0,top:0,bottom:0}],['844x390',844,390,{left:0,right:0,top:0,bottom:0}],['667x300',667,300,{left:0,right:0,top:0,bottom:0}],['667x375',667,375,{left:0,right:0,top:0,bottom:0}],['812x375 notch',812,375,{left:47,right:47,top:0,bottom:21}]];
const HERO_BOSS={x:13.95,y:24.05},HERO_MOBS={x:15.86,y:16.14};
const STAGES=[
 ['Envy',{zone:'ep1b03',hero:{x:16,y:16},enemies:[{id:'b03-boss',boss:true,x:28.14,y:12.55}]}],
 ['Balrog',{zone:'dist06',hero:HERO_BOSS,enemies:[{id:'dist06-boss',boss:true,x:24.52,y:10.52}]}],
 ['Lucifer',{zone:'ep1a11',hero:{x:13.72,y:24.01},enemies:[{id:'a11-boss',boss:true,x:24.73,y:10.73}]}],
 ['mobs b03',{zone:'ep1b03',hero:HERO_MOBS,enemies:[{id:'g1',x:15.56,y:9.08},{id:'c1',x:22.56,y:9.44},{id:'g2',x:21.24,y:14.28}]}],
 ['mobs last302',{zone:'last302',hero:{x:15.84,y:16.39},enemies:[{id:'e1',x:15.77,y:8.92},{id:'e2',x:22.56,y:9.44},{id:'e3',x:20.41,y:13.3}]}],
];
function stage(g,def){
 const s={zone:def.zone,time:100,hp:240,maxHp:240,x:def.hero.x,y:def.hero.y,gameModeV31346:'STORY',enemies:def.enemies.map(e=>({hp:1e6,maxHp:1e6,...e}))};
 g.R.enforce(s);for(const a of s.enemies)g.R.applyPosition(a,{x:a.x,y:a.y});g.root.__HAPIL_CONTROLS_V31329__.binding.state.current=s;return s;
}
// The harness DOM, plus element animations (getAnimations) and a MutationObserver.
function makeLiveDom(opts){
 const dom=makeDom(opts),anims=new Map(),observers=[],doc=dom.win.document,q=doc.querySelector;
 doc.querySelector=sel=>{const e=q(sel);if(e)e.getAnimations=()=>anims.get(sel)??[];return e;};
 dom.win.MutationObserver=class{constructor(cb){this.cb=cb;observers.push(this);}observe(){}disconnect(){}};
 dom.mutate=()=>{for(const o of observers)o.cb([{type:'attributes'}]);};
 const L={},add=dom.win.addEventListener;dom.win.addEventListener=(t,f,o)=>{(L[t]??=[]).push(f);return add(t,f,o);};
 dom.anims=anims;dom.resize=()=>{for(const f of L.resize??[])f();};
 return dom;
}
const STICK='.hm-movement',key=c=>[c.x,c.y,c.scale,c.rc240ZoomRC240].join(',');
const results=[];
for(const [name,def] of [STAGES[1],STAGES[3]])for(const [vw,vh] of [[844,390],[812,375]]){
 const tag=`${name} ${vw}x${vh}`;
 // 1. a resize lands while the stick is mid-transition at its portrait placement
 {const rects=rectsFor(vw,vh);const dom=makeLiveDom({inner:{width:vw,height:vh},rects});
  const g=loadGame(dom);const s=stage(g,def);s.time=100;const view=g.holder.base.rc153View;
  let c=g.L.camera(s,view);for(let i=1;i<=20;i++){s.time=100+i/60;c=g.L.camera(s,view);}
  const settled=key(c);ok(Number.isFinite(c.rc240ZoomRC240),tag+': settled phone zoom ('+c.rc240ZoomRC240+')');
  const real=rects[STICK],cx=vw/2;rects[STICK]={left:cx-70,top:vh-139,right:cx+70,bottom:vh-6};
  dom.anims.set(STICK,[{transitionProperty:'all',playState:'running'}]);
  // the rotation's resize event marks the controls for a re-read
  dom.resize();
  let moved=0;for(let i=1;i<=3;i++){s.time+=1/60;if(key(g.L.camera(s,view))!==settled)moved++;}
  // the transition ends at the landscape placement
  rects[STICK]=real;dom.anims.set(STICK,[]);
  for(let i=1;i<=30;i++){s.time+=1/60;if(key(g.L.camera(s,view))!==settled)moved++;}
  ok(moved===0,tag+`: camera holds while a control is mid-transition (${moved} of 33 frames moved)`);
  results.push(tag+' transition: moved '+moved);}
 // 2. RC154 safe-area insets set by another layer (inline CSS variables on <html>) reach the camera on the next frame
 {const ins={left:0,right:0,top:0,bottom:0};const dom=makeLiveDom({inner:{width:vw,height:vh},insets:ins});
  const g=loadGame(dom);const s=stage(g,def);s.time=100;const view=g.holder.base.rc153View;
  let c=g.L.camera(s,view);for(let i=1;i<=20;i++){s.time=100+i/60;c=g.L.camera(s,view);}
  const before=key(c),reads=g.API.metrics().reaims;
  Object.assign(ins,{left:47,right:47,bottom:21});dom.mutate();
  s.time+=1/60;const c1=g.L.camera(s,view);
  ok(key(c1)!==before&&g.API.metrics().reaims>reads,tag+': inset change reframes on the next frame (Z '+c.rc240ZoomRC240+' -> '+c1.rc240ZoomRC240+')');
  results.push(tag+' insets: Z '+c.rc240ZoomRC240+' -> '+c1.rc240ZoomRC240);}
}
if(soft.length){console.error(soft.join('\n'));console.error(`rc240 control readout unit: ${soft.length} of ${checks} checks failed`);process.exit(1);}
console.log(results.join('\n'));
console.log(`rc240 control readout unit: ${checks} checks passed`);
