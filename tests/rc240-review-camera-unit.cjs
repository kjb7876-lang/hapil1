'use strict';
// RC240 review round 2: the phone combat zoom holds still while the game clock
// is stopped by a modal (story dialogue, QA capture gate, RC233 camera pose
// fixture). A re-fit under a modal snaps, and an ease that was running when the
// modal opened finishes at once, so the warmed whole-body camera stays fixed
// through native actor poses (tests/rc233-quality-browser.cjs) while the game
// is not running. Same harness shape as tests/rc240-review-mobile-unit.cjs.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(repo,f),'utf8');
const SCRIPT=read('assets/rc240/mobile-landscape.js');
let checks=0;const ok=(c,m)=>{assert.ok(c,m);checks++;};

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

const drift=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.scale-b.scale));
const poses=[{x:10,y:25},{x:13.8,y:24.2},{x:16,y:21},{x:10,y:25}];

// 1. RC153 re-fit (new base object) while a modal holds the game: snap, then fixed through hero poses
{
 const dom=makeDom();const g=loadGame(dom);const view=g.holder.base.rc153View;
 const s=world();const boss={id:'boss',boss:true,hp:1e6,maxHp:1e6,x:24.4,y:11.8};s.enemies=[boss];g.R.enforce(s);
 g.root.__HAPIL_CONTROLS_V31329__.binding.state.current=s;
 for(let i=0;i<120;i++){s.time+=1/60;g.L.camera(s,view);}
 const settled=g.L.camera(s,view);ok(settled.rc240ZoomRC240>1,'fixture: phone zoom applied');
 g.root.__HAPIL_CONTROLS_V31329__.binding.modal={current:'rc233-camera-pose'};
 g.holder.base={...g.holder.base,scale:g.holder.base.scale*.93,rc153View:{...g.holder.base.rc153View}};
 const rows=[];for(const p of poses){g.R.applyPosition(s,p);s.time+=.001;rows.push(g.L.camera(s,view));}
 ok(rows[0]!==settled,'the new base camera is applied');
 const d=Math.max(...rows.map(r=>drift(r,rows[0])));
 ok(d<=1e-7,'camera fixed through hero poses under a modal (drift '+d+')');
 g.root.__HAPIL_CONTROLS_V31329__.binding.modal.current=null;
}
// 2. an ease already running when the modal opens finishes at once and stays fixed
{
 const dom=makeDom();const g=loadGame(dom);const view=g.holder.base.rc153View;
 const s=world();const boss={id:'boss',boss:true,hp:1e6,maxHp:1e6,x:24.4,y:11.8};s.enemies=[boss];g.R.enforce(s);
 g.root.__HAPIL_CONTROLS_V31329__.binding.state.current=s;g.root.__HAPIL_CONTROLS_V31329__.binding.modal={current:null};
 for(let i=0;i<120;i++){s.time+=1/60;g.L.camera(s,view);}
 g.holder.base={...g.holder.base,scale:g.holder.base.scale*.93,rc153View:{...g.holder.base.rc153View}};
 s.time+=1/60;const c0=g.L.camera(s,view);s.time+=1/60;const c1=g.L.camera(s,view);ok(drift(c0,c1)>1e-4,'fixture: a re-aim ease is running');
 g.root.__HAPIL_CONTROLS_V31329__.binding.modal.current='dialogue';
 const rows=[];for(const p of poses){g.R.applyPosition(s,p);s.time+=.001;rows.push(g.L.camera(s,view));}
 const d=Math.max(...rows.map(r=>drift(r,rows[0])));
 ok(d<=1e-7,'running ease completes when the modal opens; fixed while it stays open (drift '+d+')');
 // once the modal closes, normal play keeps the settled framing (no restart of the ease)
 g.root.__HAPIL_CONTROLS_V31329__.binding.modal.current=null;s.time+=1/60;const after=g.L.camera(s,view);
 ok(drift(after,rows.at(-1))<=1e-7,'no jump when the modal closes');
}
// 3. without a modal the eased phase re-aim is unchanged (still eased, first frame continuous)
{
 const dom=makeDom();const g=loadGame(dom);const view=g.holder.base.rc153View;
 const s=world();const boss={id:'boss',boss:true,hp:1e6,maxHp:1e6,x:24.4,y:11.8};s.enemies=[boss];g.R.enforce(s);
 g.root.__HAPIL_CONTROLS_V31329__.binding.state.current=s;g.root.__HAPIL_CONTROLS_V31329__.binding.modal={current:null};
 for(let i=0;i<120;i++){s.time+=1/60;g.L.camera(s,view);}
 const before=g.L.camera(s,view);g.holder.base={...g.holder.base,scale:g.holder.base.scale*.93,rc153View:{...g.holder.base.rc153View}};
 s.time+=1/60;const c1=g.L.camera(s,view);ok(drift(c1,before)<drift({...before,scale:g.holder.base.scale},before),'still eased without a modal');
}
console.log(JSON.stringify({rc240ReviewCamera:'passed',checks}));
