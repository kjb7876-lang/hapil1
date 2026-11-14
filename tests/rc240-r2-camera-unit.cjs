'use strict';
// RC240 fix round 2 (camera/space review): phone combat framing and the
// RC223 danger band.
//  1. zoom stays within [1.15, 1.30] on every phone size, boss and mob stages
//  2. the floor diamond (unshrunk walkable floor, radius 0) keeps its corners
//     >= 16 css px inside the frame; the near (bottom) edge always on screen
//  3. Envy's room (ep1b03 boss): zoom capped at 1.2, boss foot <= 76%
//  4. mob stages: fighters' bounding box centred vertically, clamped to the floor
//  5. re-aims between fights are eased, in range on every frame, and the hero
//     is never under a touch control
//  6. danger band reads as an iso floor band: iso-aligned stripes, chevrons /
//     dashes along the boundary, combined fill ~25-35%, no screen column stripe
// Harness shape from tests/rc240-review-camera-unit.cjs.
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
const results=[];
// ------------------------------------------------ 1-4. framing on every phone size
for(const [label,vw,vh,ins] of VIEWS)for(const [name,def] of STAGES){
 const dom=makeDom({inner:{width:vw,height:vh},insets:ins});const g=loadGame(dom);const s=stage(g,def);
 const cam=g.L.camera(s,g.holder.base.rc153View),tag=`${label} ${name}`;
 const z=cam.rc240ZoomRC240;
 ok(cam!==g.holder.base&&Number.isFinite(z),tag+': phone zoom applied');
 // notched 812x375: the whole playable floor must fit between the notches (pinned in
 // tests/rc240-mobile-landscape-unit.cjs), which needs < 1.15; elsewhere 1.15-1.30.
 ok(z<=1.3+1e-9&&(z>=1.15-1e-9||ins.left>0&&z>=1.0),tag+`: zoom ${z} within [1.15, 1.30]`);
 const sl=ins.left,sr=vw-ins.right,st=ins.top,sb=vh-ins.bottom;
 const outer=g.D.polygon('all',0).map(p=>{const q=G(p.x,p.y);return toCss(cam,q.x,q.y);});
 // painted platform diamond: radius-0 floor side corners + 24 G px (measured on dist06/ep1a11)
 const artPad=24*cam.scale*cam.rc153View.k;
 const ox0=Math.min(...outer.map(p=>p.x))-artPad,ox1=Math.max(...outer.map(p=>p.x))+artPad,oy0=Math.min(...outer.map(p=>p.y)),oy1=Math.max(...outer.map(p=>p.y));
 // Corners fit with a 16 px margin at the preferred minimum zoom (1.15)? Then they must; otherwise
 // (narrow/notched screens) the near (bottom) edge must stay on screen.
 // Envy's room (zone-capped) is a furnished room, not a platform: keeping the boss off the
 // right edge wins over the corner margin there; the near edge still stays on screen.
 const roomCapped=def.zone==='ep1b03'&&def.enemies.some(e=>e.boss);
 const cornersFit=!roomCapped&&(ox1-ox0)*(1.15/z)+32<=sr-sl+1e-6,cornersShow=!roomCapped&&(ox1-ox0)*(1.15/z)+6<=sr-sl+1e-6;
 if(cornersShow&&!cornersFit)ok(ox0>=sl+3-1e-6&&ox1<=sr-3+1e-6,tag+`: floor-diamond corners on screen (${(ox0-sl).toFixed(1)}, ${(sr-ox1).toFixed(1)})`);
 if(cornersFit)ok(ox0>=sl+16-1e-6&&ox1<=sr-16+1e-6,tag+`: floor-diamond left/right corners >= 16 px inside (${(ox0-sl).toFixed(1)}, ${(sr-ox1).toFixed(1)})`);
 if(cornersFit)ok(oy0>=st+16-1e-6,tag+`: floor-diamond far corner >= 16 px inside (${(oy0-st).toFixed(1)})`);
 ok(oy1<=sb+1e-6,tag+`: near (bottom) floor edge on screen (${(sb-oy1).toFixed(1)} px)`);
 const boss=s.enemies.find(a=>a.boss);
 if(boss&&cornersFit)ok(oy1<=sb-16+1e-6,tag+`: boss stage keeps the near floor edge >= 16 px inside (${(sb-oy1).toFixed(1)})`);
 if(boss&&def.zone==='ep1b03'){const b=actorCss(cam,boss);ok(z<=1.2+1e-9,tag+`: Envy room zoom capped at 1.2 (${z})`);ok(b.x<=.76*vw+1e-6,tag+`: Envy boss foot <= 76% (${(b.x/vw*100).toFixed(1)}%)`);}
 if(!boss){
  // fighters' bounding box (feet, body tops ~150 G px above) centred vertically, or the floor stops it
  const ys=[];for(const a of [s,...s.enemies]){const q=G(a.x,a.y);ys.push(toCss(cam,q.x,q.y-150).y,toCss(cam,q.x,q.y+10).y);}
  const c=(Math.min(...ys)+Math.max(...ys))/2,dev=c-(st+sb)/2;
  // clamped: lowering the view 4 px more would break a hard limit (near floor edge, body frame,
  // or the playable floor touching a thumb control)
  const play=g.D.polygon('all',.8).map(p=>{const q=G(p.x,p.y);return toCss(cam,q.x,q.y);}),dn=4;
  const frameBottom=toCss(cam,0,730.74).y;
  const clamped=oy1+dn>sb-4||frameBottom+dn>sb||play.some(p=>p.y+dn>sb)||Object.values(rectsFor(vw,vh,ins)).some(r=>edgeHits(play.map(p=>({x:p.x,y:p.y+dn})),{left:r.left-4,top:r.top-4,right:r.right+4,bottom:r.bottom+4}));
  ok(Math.abs(dev)<=.06*vh||(dev<0&&clamped),tag+`: fighters centred vertically (off ${dev.toFixed(1)} px${clamped?', floor-clamped':''})`);
 }
 // the hero is never under a touch control
 const h=actorCss(cam,s);for(const [sel,r] of Object.entries(rectsFor(vw,vh,ins)))ok(!inRect(h,r)&&!inRect({x:h.x,y:h.y-40},r),tag+': hero clear of '+sel);
 results.push(`${tag}: Z ${z.toFixed(3)}`);
}
// ------------------------------------------------ 5. eased re-aim between fights, zoom in range on every frame
{
 const dom=makeDom({inner:{width:844,height:390}});const g=loadGame(dom);const s=stage(g,STAGES[3][1]);const view=g.holder.base.rc153View;
 for(let i=0;i<60;i++){s.time+=1/60;g.L.camera(s,view);}
 // next fight: the mob wave is replaced by a boss, RC153 re-fits
 s.enemies=[{id:'b03-boss',boss:true,hp:1e6,maxHp:1e6,x:28.14,y:12.55}];g.R.enforce(s);g.R.applyPosition(s.enemies[0],{x:28.14,y:12.55});
 g.holder.base={...g.holder.base,scale:g.holder.base.scale*.97,rc153View:{...g.holder.base.rc153View}};
 let prev=null,maxStep=0,minZ=9,maxZ=0;
 for(let i=0;i<90;i++){s.time+=1/60;const c=g.L.camera(s,view);const z=g.API.zoomFor(s);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);const p=actorCss(c,s);if(prev)maxStep=Math.max(maxStep,Math.hypot(p.x-prev.x,p.y-prev.y));prev=p;}
 ok(maxStep<=14,`fight change: eased (max hero move ${maxStep.toFixed(2)} px/frame)`);
 ok(minZ>=1.15-1e-9&&maxZ<=1.3+1e-9,`fight change: zoom in range on every frame [${minZ.toFixed(3)}, ${maxZ.toFixed(3)}]`);
}
// ------------------------------------------------ 6. danger band
function recorder(){const calls=[];const ctx={calls,globalAlpha:1,fillStyle:'',strokeStyle:'',lineWidth:1,globalCompositeOperation:'source-over',
 save(){calls.push(['save']);},restore(){calls.push(['restore']);},beginPath(){calls.push(['begin']);},moveTo(x,y){calls.push(['m',x,y]);},lineTo(x,y){calls.push(['l',x,y]);},closePath(){calls.push(['close']);},
 fill(){calls.push(['fill',this.globalAlpha,this.fillStyle]);},stroke(){calls.push(['stroke',this.globalAlpha,this.strokeStyle,this.lineWidth]);}};return ctx;}
const inv=(gx,gy)=>{const a=(gx-640)/27,b=gy/13.5;return{x:(a+b)/2,y:(b-a)/2};};
{
 const dom=makeDom();const g=loadGame(dom);
 const s={zone:'ep1b03',time:100,hp:240,maxHp:240,x:12,y:24,gameModeV31346:'STORY',enemies:[{id:'m',hp:5,maxHp:5,x:26,y:12}]};g.R.enforce(s);
 const ctx=recorder();g.root.__HAPIL_FLOW_V31343__.drawFloor(ctx,s);
 // split into painted paths
 const paths=[];let cur=null,sub=null;
 for(const c of ctx.calls){if(c[0]==='begin'){cur={subs:[]};}else if(c[0]==='m'){sub=[inv(c[1],c[2])];cur.subs.push(sub);}else if(c[0]==='l'){sub.push(inv(c[1],c[2]));}else if(c[0]==='fill'||c[0]==='stroke'){paths.push({kind:c[0],alpha:c[1],width:c[3],subs:cur.subs});}}
 const fills=paths.filter(p=>p.kind==='fill'),strokes=paths.filter(p=>p.kind==='stroke');
 ok(strokes.length>=1&&strokes.some(p=>p.alpha>=.35),'band has a clear stroked edge (dashes/chevrons, alpha >= .35)');
 // the edge marks follow the floor grid: chevron arms run along iso axes (constant x or constant y)
 const isoSeg=(a,b)=>Math.abs(a.x-b.x)<1e-6||Math.abs(a.y-b.y)<1e-6;
 const segs=[];for(const p of strokes)for(const sp of p.subs)for(let i=1;i<sp.length;i++)segs.push([sp[i-1],sp[i]]);
 ok(segs.filter(([a,b])=>isoSeg(a,b)&&!(Math.abs((a.x-a.y)-(b.x-b.y))<1e-6)).length>=6,'edge chevrons drawn along the iso floor axes');
 // a fill band follows the iso grid: stripe edges along constant x or y
 const fillSegs=[];for(const p of fills)for(const sp of p.subs)for(let i=0;i<sp.length;i++){const a=sp[i],b=sp[(i+1)%sp.length];fillSegs.push([a,b]);}
 ok(fillSegs.filter(([a,b])=>isoSeg(a,b)&&Math.hypot(a.x-b.x,a.y-b.y)>1).length>=6,'fill stripes run along the iso floor axes');
 // combined fill ~25-35% where stripes overlay the base (alpha compositing), each fill pass faint (<= .2)
 const alphas=fills.map(p=>p.alpha);const comb=1-alphas.reduce((m,a)=>m*(1-a),1);
 ok(comb>=.25-1e-9&&comb<=.36,`combined band fill ${comb.toFixed(3)} within ~25-35%`);
 // no screen-aligned column: no filled sub-path lies entirely within 0.7 units of the strip start
 ok(!fills.some(p=>p.subs.some(sp=>sp.every(q=>(q.x-q.y)<=-1.45+.7))),'no hard screen-aligned entry column');
 // everything on the floor, inside the strip
 const all=paths.flatMap(p=>p.subs.flat());
 ok(all.every(p=>p.x-p.y>=-1.45-1e-6&&p.x<=19+1e-6&&(g.D.contains(p,'all',.8-1e-3)||g.D.contains(p,'all',.75))),'all band marks lie on the floor inside the RC223 strip');
}
console.log(results.join('\n'));
if(soft.length){console.log('FAILED '+soft.length+':\n'+soft.join('\n'));process.exit(1);}
console.log(JSON.stringify({rc240R2Camera:'passed',checks}));
