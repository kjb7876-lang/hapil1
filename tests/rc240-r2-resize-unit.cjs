'use strict';
// RC240 fix round 2 follow-up: a one-pixel viewport resize never makes the phone combat zoom jump.
// RC233 (tests/rc233-quality-browser.cjs) requires a one-pixel actual viewport change to move the
// world-to-CSS scale by < 1%. The round-2 framing chooses between floor-corner passes and zoom bands,
// so at flat viewports (844x256 -> 255) a one-pixel change flipped the pass and the zoom rose by
// 1-4%. Here one warmed world is resized one CSS px at a time (down, then up) on several phone
// widths and stages, and the world-to-CSS scale may move by less than 1% per step.
// Harness from tests/rc240-r2-camera-unit.cjs, with in-place resizes.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(repo,f),'utf8');
const SCRIPT=read('assets/rc240/mobile-landscape.js');
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
 return {win,listeners,classes,styles,timers,runTimers:(n=3)=>{for(let k=0;k<n;k++){const b=timers.splice(0);for(const f of b)f();for(const f of intervals.slice())f();}}};
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
// Live placements measured in the game (S/fix2/camera/pos.cjs).
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
const ONE_PX=.01; // RC233 CRITERIA.onePixelCssScaleDrift
const NONE={left:0,right:0,top:0,bottom:0};
function resize(dom,g,vw,vh,rects){
 dom.win.innerWidth=vw;dom.win.innerHeight=vh;Object.assign(rects,rectsFor(vw,vh,NONE));
 g.holder.base=rc153Camera(vw,vh,NONE);for(const f of dom.listeners.resize??[])f({type:'resize'});dom.runTimers(1);
}
const cssScale=c=>c.scale*c.rc153View.k;
let worst={d:0};
for(const vw of [844,812,667])for(const [name,def] of STAGES){
 // down to 256 px, the flattest landscape RC233 exercises (844x256 -> 255); below it the whole floor
 // stops fitting clear of the touch controls at any zoom > 1 on 667 px wide screens (identity camera).
 const top=Math.min(400,Math.round(vw*.47)),bottom=256,rects=rectsFor(vw,top,NONE);
 const dom=makeDom({inner:{width:vw,height:top},rects});const g=loadGame(dom);const s=stage(g,def);
 let prev=cssScale(g.L.camera(s,g.holder.base.rc153View)),prevZ=g.API.zoomFor?.(s);
 const sweep=[];for(let h=top-1;h>=bottom;h--)sweep.push(h);for(let h=bottom+1;h<=top;h++)sweep.push(h);
 let last=top;
 for(const h of sweep){
  resize(dom,g,vw,h,rects);s.time+=1/60;
  const c=g.L.camera(s,g.holder.base.rc153View),now=cssScale(c),d=Math.abs(now/prev-1),z=c.rc240ZoomRC240;
  if(d>worst.d)worst={d,tag:`${name} ${vw}x${last}->${vw}x${h}`,z0:prevZ,z};
  ok(d<ONE_PX,`${name} ${vw}x${last} -> ${vw}x${h}: world scale moved ${(d*100).toFixed(2)}% (zoom ${prevZ} -> ${z})`);
  prev=now;prevZ=z;last=h;
 }
}
if(soft.length){console.log('FAILED '+soft.length+':\n'+soft.slice(0,40).join('\n'));process.exit(1);}
console.log(JSON.stringify({rc240R2Resize:'passed',checks,worstStep:{...worst,d:+(worst.d*100).toFixed(3)+'%'}}));
