'use strict';
// RC240 fix round 4 (review round 4: space/art/UX/lighting/camera): danger band and phone framing.
//  1. danger band darkens the floor instead of lighting it: multiply/darken fills in a dark warm
//     tone (never a screen/lighter blend: phone blacks are not lifted), 12-30% darker inside the
//     strip, floor texture kept; the soft ramps of round 3 stay (pinned in rc240-r4-camera-unit)
//  2. hazard hem: amber dashes ALONG A FLOOR AXIS (the far diagonal x = 19), glow + core strokes,
//     slow pulse on game time (geometry and fills never change; same time -> identical draw);
//     nothing on the screen-vertical rule line
//  3. Balrog / Lucifer (live phone base cameras, S/fix4/camera/probe.cjs): the hero-side (left)
//     painted corner gets the spare width (>= the boss-side one); when the corners only just fit,
//     the least zoom of the band is taken (Lucifer after the RC153 re-fit: 1.15, not 1.16)
//  4. Michaela: RC153's base camera is ~6% tighter for her (narrower paint bounds), so the zoom
//     relative to it reads lower; what the player sees (world-to-screen scale, now reported as
//     lastFrame.screenScale) is within 2% of the other heroes
//  5. mob stages are lowered as far as the floor allows (body-frame bottom on the bottom edge)
// Harness from tests/rc240-r4-camera-unit.cjs with per-scene live base cameras.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(repo,f),'utf8');
const SCRIPT=read('assets/rc240/mobile-landscape.js');
let checks=0;const soft=[];const ok=(c,m)=>{if(process.env.SOFT&&!c){soft.push(m);checks++;return;}assert.ok(c,m);checks++;};
const rectsFor=(vw,vh,ins={left:0,right:0,top:0,bottom:0})=>({'.hm-movement':{left:ins.left+6,top:vh-ins.bottom-82,right:ins.left+82,bottom:vh-ins.bottom-6},'.hm-actions':{left:vw-ins.right-162,top:vh-ins.bottom-54,right:vw-ins.right-6,bottom:vh-ins.bottom-6},
 '#hapil-mobile-controls-v31366 [data-mobile-action="F"]':{left:ins.left+6,top:ins.top+100,right:ins.left+46,bottom:ins.top+140},'.rc108-settings-trigger':{left:vw-ins.right-44,top:ins.top+4,right:vw-ins.right-4,bottom:ins.top+44}});
function makeDom({touch=true,coarse=true,screen={width:390,height:844},inner={width:844,height:390},insets={left:0,right:0,top:0,bottom:0},rects}={}){
 rects=rects??rectsFor(inner.width,inner.height,insets);
 const classes=new Set(touch?['hapil-touch-v31366']:[]),timers=[],intervals=[],styles=[];
 const el=tag=>({tagName:tag.toUpperCase(),id:'',textContent:'',children:[],appendChild(c){this.children.push(c);if(c.tagName==='STYLE')styles.push(c);return c;}});
 const document={readyState:'complete',head:el('head'),body:el('body'),
  documentElement:{classList:{add:(...c)=>c.forEach(x=>classes.add(x)),remove:(...c)=>c.forEach(x=>classes.delete(x)),toggle:(c,on)=>{if(on===undefined)on=!classes.has(c);on?classes.add(c):classes.delete(c);return on;},contains:c=>classes.has(c)}},
  createElement:el,getElementById:id=>styles.find(s=>s.id===id)??null,
  querySelector:sel=>{const r=rects?.[sel];return r?{getBoundingClientRect:()=>({...r,x:r.left,y:r.top,width:r.right-r.left,height:r.bottom-r.top})}:null;},
  addEventListener(){},removeEventListener(){}};
 const win={document,innerWidth:inner.width,innerHeight:inner.height,navigator:{maxTouchPoints:touch?5:0},screen:{width:screen.width,height:screen.height},
  getComputedStyle:()=>({getPropertyValue:k=>{const m=/^--rc154-safe-(left|right|top|bottom)$/.exec(k);return m?(insets[m[1]]??0)+'px':'';}}),
  __HAPIL_MOBILE_V31366__:{enabled:()=>touch},
  matchMedia:q=>({matches:/pointer:\s*coarse|hover:\s*none/.test(q)?coarse:false}),
  addEventListener(){},removeEventListener(){},
  setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout(){},setInterval:f=>{intervals.push(f);return 1000+intervals.length;},clearInterval(){},
  console,Math,JSON,Object,Array,Number,String,Symbol,WeakMap,WeakSet,Map,Set,Promise,Error,TypeError,Proxy,Reflect,isFinite,parseFloat,Float64Array};
 if(touch)win.ontouchstart=null;win.window=win;win.globalThis=win;
 return {win,classes,styles,timers,runTimers:(n=3)=>{for(let k=0;k<n;k++){const b=timers.splice(0);for(const f of b)f();for(const f of intervals.slice())f();}}};
}
// Real phone base camera at 844x390 (measured in the game, S/fix3/camera/base.cjs): RC153 scale .99189,
// view k .54167, x 5.19; y per zone; RC223 applies a 1.05 shrink after RC240.
const REAL={dist06:{y:-56.2,top:102.76,map:{x:-151.4,y:18,width:1582.8,height:990}},ep1a11:{y:-110.76,top:212.76,map:{x:-151.4,y:18,width:1582.8,height:990}},ep1b03:{y:-94.39,top:179.77,map:{x:-152,y:67.5,width:1584,height:891}}};
function loadGame(dom,zone,live){
 const root=dom.win;vm.createContext(root);
 for(const f of ['assets/rc134/persona-duel.js','assets/rc138/battle-arena.js','assets/rc227/floor-patches.js','assets/rc223/left-zone.js'])vm.runInContext(read(f),root,{filename:f});
 const R=root.__HAPIL_BATTLE_ARENA_RC138__,D=root.__HAPIL_PERSONA_DUEL_RC134__;
 R.bind({combat:['ep1b03','dist06','ep1a11','last302'],clear:s=>!(s?.enemies??[]).some(a=>a?.hp>0)});
 root.__HAPIL_INNER_FINAL_RC133__={encounter:s=>s?.personaTestRC240===true};
 const z=live??REAL[zone]??REAL.ep1b03,view={x:-139.0769230769231,y:0,width:1558.1538461538462,height:720,k:.5416666666666666};
 const holder={base:{x:z.x??5.190587482102842,y:z.y,scale:z.scale??.9918897070592143,battleArenaRC138:true,rc153WholeBody:true,rc153View:view,rc153Viewport:{width:844,height:390},rc153MapWidth:1584}};
 root.__HAPIL_COMBAT_LAYOUT_RC153__=Object.freeze({policy:{},boss:a=>!!(a?.boss||a?.midboss),position:(a,q)=>q,framing:()=>({left:z.left??-56.1,right:z.right??1336.1,top:z.top,bottom:z.bottom??729}),
  camera:st=>R.enabled(st)?holder.base:null,scatter(){},bind(){}});
 root.__HAPIL_CAMERA_RC223__={appliedZoom:()=>1.05};
 if(z.env)root.__HAPIL_BITMAP_NATIVE_RC133__={paintEnvelope:(s,a,hero)=>{const e=z.env[hero?'hero':a.id];if(!e)return null;const g=13.5*(a.x+a.y),gx=640+27*(a.x-a.y);return{left:gx-e[0],right:gx+e[0],top:g-e[1],bottom:g+e[2]};}};
 root.__HAPIL_MAP_FORMAT_RC138__={metrics:()=>({last:{zone,rect:z.map}})};
 root.__HAPIL_CONTROLS_V31329__={binding:{state:{current:null},phase:'game',modal:{current:null}},frameStart(){return 'native';}};
 root.__HAPIL_FLOW_V31343__={version:'flow',drawFloor(){}};
 vm.runInContext(SCRIPT,root,{filename:'assets/rc240/mobile-landscape.js'});dom.runTimers(2);
 return {root,R,D,holder,API:root.__HAPIL_MOBILE_LANDSCAPE_RC240__,L:root.__HAPIL_COMBAT_LAYOUT_RC153__};
}
const G=(x,y)=>({x:640+27*(x-y),y:13.5*(x+y)});
// what the player sees: RC223 shrinks the RC240 camera by f about the view centre
const toCss=(cam,gx,gy)=>{const v=cam.rc153View,f=1.05,ax=v.x+v.width/2,ay=v.y+v.height/2,X=cam.x+gx*cam.scale,Y=cam.y+gy*cam.scale;return{x:(ax+(X-ax)/f-v.x)*v.k,y:(ay+(Y-ay)/f-v.y)*v.k};};
const actorCss=(cam,a)=>{const g=G(a.x,a.y);return toCss(cam,g.x,g.y);};
const inRect=(p,r)=>p.x>r.left&&p.x<r.right&&p.y>r.top&&p.y<r.bottom;
function stage(g,def){
 const s={zone:def.zone,time:100,hp:240,maxHp:240,x:def.hero.x,y:def.hero.y,gameModeV31346:'STORY',enemies:def.enemies.map(e=>({hp:1e6,maxHp:1e6,...e}))};
 g.R.enforce(s);for(const a of s.enemies)g.R.applyPosition(a,{x:a.x,y:a.y});g.root.__HAPIL_CONTROLS_V31329__.binding.state.current=s;return s;
}
const VW=844,VH=390,out=[];
const MAPB={x:-151.4,y:18,width:1582.8,height:990},MAPE={x:-152,y:67.5,width:1584,height:891};
const PAINT={dist06:{l:-19-50,r:1299+50,b:768},ep1a11:{l:-19-56,r:1299+56,b:802}};
function shot(def){const g=loadGame(makeDom(),def.zone,def.live),s=stage(g,{zone:def.zone,hero:def.hero,enemies:def.en});const cam=g.L.camera(s,g.holder.base.rc153View);return{g,s,cam,lf:g.API.metrics().lastFrame};}
// ------------------------------------------------ 3. painted corners: hero side first, least zoom
for(const [name,def,want] of [
 ['Balrog',{zone:'dist06',live:{y:-56.2,top:102.76,map:MAPB},hero:{x:14.06,y:24.38},en:[{id:'dist06-boss',boss:true,x:24.52,y:10.52}]},{left:6}],
 ['Lucifer',{zone:'ep1a11',live:{y:-110.76,top:212.76,map:MAPB},hero:{x:14.49,y:24.25},en:[{id:'a11-boss',boss:true,x:24.63,y:10.63}]},{left:1.5,right:0,bottom:8}],
 ['Lucifer re-fit',{zone:'ep1a11',live:{x:10.04,y:-94.21,scale:.9843,top:212.8,map:MAPB},hero:{x:14.04,y:24.1},en:[{id:'a11-boss',boss:true,x:25.88,y:11.88}]},{left:7.5,right:0,bottom:8,z:1.15}]]){
 const {s,cam}=shot(def),P=PAINT[def.zone],z=cam.rc240ZoomRC240;
 const l=toCss(cam,P.l,513).x,r=VW-toCss(cam,P.r,513).x,b=VH-toCss(cam,640,P.b).y,bx=actorCss(cam,s.enemies[0]).x/VW;
 out.push(`${name}: Z ${z} painted corners left ${l.toFixed(1)} right ${r.toFixed(1)} bottom ${b.toFixed(1)} boss ${(bx*100).toFixed(1)}%`);
 ok(z>=1.15-1e-9,`${name}: zoom ${z} >= 1.15`);
 ok(l>=r-1e-6,`${name}: the hero-side painted corner gets the spare width (left ${l.toFixed(1)} >= right ${r.toFixed(1)})`);
 ok(l>=want.left&&r>=(want.right??2.5),`${name}: left corner >= ${want.left} px inside (${l.toFixed(1)}), right still on screen (${r.toFixed(1)})`);
 if(want.bottom)ok(b>=want.bottom,`${name}: painted near vertex >= ${want.bottom} px inside (${b.toFixed(1)})`);
 if(want.z)ok(Math.abs(z-want.z)<1e-9,`${name}: least zoom of the band when the corners only just fit (${z})`);
 ok(bx<=.78,`${name}: boss foot <= 78% (${(bx*100).toFixed(1)}%)`);
 const h=actorCss(cam,s);for(const [sel,rc] of Object.entries(rectsFor(VW,VH)))ok(!inRect(h,rc)&&!inRect({x:h.x,y:h.y-40},rc),name+': hero clear of '+sel);
}
// ------------------------------------------------ 4. Michaela: same on-screen scale
{
 const hunter=shot({zone:'ep1b03',live:{y:-94.39,top:179.77,map:MAPE},hero:{x:16,y:16},en:[{id:'b03-boss',boss:true,x:28.5,y:12.5}]});
 const mich=shot({zone:'ep1b03',live:{x:-32.49,y:-121.12,scale:1.0508,left:-17.1,right:1297.1,top:179.8,bottom:728.9,map:MAPE},hero:{x:15.84,y:15.79},en:[{id:'b03-boss',boss:true,x:28.5,y:12.5}]});
 for(const [n,q] of [['hunter',hunter],['michaela',mich]]){ok(Number.isFinite(q.lf?.screenScale),`${n}: lastFrame.screenScale reported`);ok(Math.abs(q.lf.screenScale-q.cam.scale/1.05)<1e-9,`${n}: screenScale is what the player sees (camera scale after the RC223 shrink)`);}
 const a=hunter.lf.screenScale,b=mich.lf.screenScale;out.push(`Envy on-screen scale: hunter ${a?.toFixed(4)} (Z ${hunter.lf.Z}) michaela ${b?.toFixed(4)} (Z ${mich.lf.Z})`);
 ok(Math.abs(a/b-1)<=.02,`Michaela on-screen scale within 2% of hunter (${a} vs ${b})`);
}
// ------------------------------------------------ 5. mob stage lowered as far as the floor allows
{
 const q=shot({zone:'last302',live:{x:36.59277228934104,y:-77.17947628380023,scale:.9428237932979046,top:190.78,bottom:729,map:{x:-102.5,y:18,width:1485,height:990},env:{hero:[80,146,0],'l302-e1':[52,156,0],'l302-e2':[52,155,0],'l302-e3':[52,156,0]}},hero:{x:15.93,y:16.18},en:[{id:'l302-e1',x:15.79,y:8.9},{id:'l302-e2',x:22.56,y:9.44},{id:'l302-e3',x:21.09,y:12.83}]});
 const fb=toCss(q.cam,640,729).y;out.push(`last302: Z ${q.lf.Z} drop ${(q.lf.dropPct*100).toFixed(1)}% body-frame bottom ${fb.toFixed(1)} / ${VH}`);
 ok(fb<=VH+1e-6&&fb>=VH-3,`last302: view lowered until the body-frame bottom meets the bottom edge (${fb.toFixed(1)})`);
 ok(q.lf.dropPct>=.075,`last302: lowered >= 7.5% (${(q.lf.dropPct*100).toFixed(1)}%)`);
}
// ------------------------------------------------ 1/2. danger band
function recorder(){const calls=[];const ctx={calls,globalAlpha:1,fillStyle:'',strokeStyle:'',lineWidth:1,globalCompositeOperation:'source-over',
 save(){calls.push(['save']);},restore(){calls.push(['restore']);},beginPath(){calls.push(['begin']);},moveTo(x,y){calls.push(['m',x,y]);},lineTo(x,y){calls.push(['l',x,y]);},closePath(){calls.push(['close']);},
 fill(){calls.push(['fill',this.globalAlpha,this.fillStyle,this.globalCompositeOperation]);},stroke(){calls.push(['stroke',this.globalAlpha,this.strokeStyle,this.lineWidth,this.globalCompositeOperation]);}};return ctx;}
const inv=(gx,gy)=>{const a=(gx-640)/27,b=gy/13.5;return{x:(a+b)/2,y:(b-a)/2};};
function rgba(c){if(typeof c!=='string')return null;let m=/^#([0-9a-f]{6})$/i.exec(c);if(m){const n=parseInt(m[1],16);return[n>>16,(n>>8)&255,n&255,1];}m=/^rgba?\(([^)]+)\)$/.exec(c);if(m){const p=m[1].split(',').map(Number);return[p[0],p[1],p[2],p.length>3?p[3]:1];}return null;}
function parse(calls){const paths=[];let cur=null,sub=null;
 for(const c of calls){if(c[0]==='begin'){cur={subs:[]};}else if(c[0]==='m'){sub=[inv(c[1],c[2])];cur.subs.push(sub);}else if(c[0]==='l'){sub.push(inv(c[1],c[2]));}else if(c[0]==='fill'||c[0]==='stroke'){paths.push({kind:c[0],alpha:c[1],style:c[2],width:c[0]==='stroke'?c[3]:0,op:c[0]==='fill'?c[3]:c[4],subs:cur.subs});}}
 return paths;}
const LIFT=new Set(['screen','lighter','plus-lighter','color-dodge','overlay','soft-light','hard-light','lighten']);
for(const [label,opts] of [['phone',{}],['desktop',{touch:false,coarse:false,screen:{width:1920,height:1080},inner:{width:1280,height:720}}]]){
 const g=loadGame(makeDom(opts),'ep1b03');
 const s={zone:'ep1b03',time:100,hp:240,maxHp:240,x:12,y:24,gameModeV31346:'STORY',enemies:[{id:'m',hp:5,maxHp:5,x:26,y:12}]};g.R.enforce(s);
 const draw=t=>{s.time=t;const c=recorder();g.root.__HAPIL_FLOW_V31343__.drawFloor(c,s);return c.calls;};
 const calls=draw(100),paths=parse(calls),fills=paths.filter(p=>p.kind==='fill'),strokes=paths.filter(p=>p.kind==='stroke');
 ok(fills.length>=1&&strokes.length>=1,label+': band drawn (fills and hem strokes)');
 // 1. darken, never lift
 ok(paths.every(p=>!LIFT.has(p.op)),`${label}: no screen/lighter blend anywhere (${[...new Set(paths.map(p=>p.op))].join(', ')})`);
 ok(fills.every(p=>p.op==='multiply'||p.op==='darken'),`${label}: fills darken the floor (${[...new Set(fills.map(p=>p.op))].join(', ')})`);
 let fac=[1,1,1];for(const p of fills){const c=rgba(p.style);ok(!!c,label+': fill colour parseable');const lum=(.2126*c[0]+.7152*c[1]+.0722*c[2])/255;ok(lum<=.3,`${label}: fill tone is dark (luminance ${lum.toFixed(2)})`);fac=fac.map((f,i)=>f*(1-p.alpha*c[3]*(1-c[i]/255)));}
 const mean=(fac[0]+fac[1]+fac[2])/3;out.push(`${label} band: floor x ${fac.map(v=>v.toFixed(3)).join(' / ')} inside the strip`);
 ok(fac.every(v=>v<=1)&&mean>=.7&&mean<=.88,`${label}: floor 12-30% darker where all layers overlap, texture kept (x ${mean.toFixed(3)})`);
 // 2. hem: dashes along the far floor diagonal
 const dashes=strokes.flatMap(p=>p.subs.map(sp=>({p,sp})));
 ok(dashes.every(({sp})=>sp.length===2&&(Math.abs(sp[0].x-sp[1].x)<1e-6||Math.abs(sp[0].y-sp[1].y)<1e-6)),label+': every hem stroke runs along a floor axis');
 // teeth: short marks along the other floor axis, from the hem into the strip
 const isTooth=sp=>Math.abs(sp[0].y-sp[1].y)<1e-6,teeth=strokes.filter(p=>p.subs.every(isTooth));
 ok(teeth.length>=1&&teeth.every(p=>p.subs.length>=6&&p.subs.every(sp=>Math.max(sp[0].x,sp[1].x)<=19+1e-6&&Math.max(sp[0].x,sp[1].x)>=18.8&&Math.abs(sp[0].x-sp[1].x)<=1.2)),label+': >= 6 short teeth from the hem into the strip');
 ok(strokes.filter(p=>!teeth.includes(p)).every(p=>p.subs.every(sp=>Math.abs(sp[0].x-sp[1].x)<1e-6&&Math.abs(sp[0].x-19)<=.2)),label+': dashes and feather run along the far floor diagonal x ~ 19');
 // dashed strokes (glow/body/core) over a faint continuous feather glow hugging the hem
 const dashed=strokes.filter(p=>p.subs.length>1&&!teeth.includes(p)),feather=strokes.filter(p=>p.subs.length===1);
 for(const p of feather)ok(p.alpha*(rgba(p.style)?.[3]??1)<=.1&&p.width<=40,`${label}: feather glow strokes are faint and narrow (<= 10%, <= 40 px)`);
 for(const p of dashed){const ys=p.subs.map(sp=>[Math.min(sp[0].y,sp[1].y),Math.max(sp[0].y,sp[1].y)]).sort((a,b)=>a[0]-b[0]);
  ok(ys.length>=8,`${label}: >= 8 dashes per hem stroke (${ys.length})`);
  let gaps=true;for(let i=1;i<ys.length;i++)if(!(ys[i][0]-ys[i-1][1]>=.25*(ys[i-1][1]-ys[i-1][0])))gaps=false;ok(gaps,label+': dashes are separated by gaps (a dashed line, not a rule)');}
 ok(dashed.length>=2&&Math.max(...dashed.map(p=>p.width))>=2*Math.min(...dashed.map(p=>p.width)),label+': hem dashes = wide glow + narrow core');
 // pulse on game time: geometry and fills fixed, stroke alpha breathes slowly, strokes stay soft
 const geo=c=>JSON.stringify(c.filter(x=>x[0]!=='stroke')),series=[];let turns=0,prevD=0;
 for(let i=0;i<=120;i++){const c=draw(100+i*.05),st=parse(c).filter(p=>p.kind==='stroke');
  ok(geo(c)===geo(calls),label+': geometry and fills identical at every time');
  const eff=st.map(p=>p.alpha*(rgba(p.style)?.[3]??1));ok(eff.every(e=>e<=.2+1e-9),`${label}: every hem stroke stays soft (<= .2 effective)`);ok(st.some(p=>p.alpha>=.35),label+': a clear stroke (alpha >= .35) at every time');
  const comb=1-st.filter(p=>!p.subs.every(isTooth)).reduce((m,p)=>m*(1-p.alpha*(rgba(p.style)?.[3]??1)),1);if(series.length){const d=Math.sign(comb-series[series.length-1]);if(d&&prevD&&d!==prevD)turns++;if(d)prevD=d;}series.push(comb);}
 const lo=Math.min(...series),hi=Math.max(...series);out.push(`${label} hem: stacked opacity ${lo.toFixed(3)} .. ${hi.toFixed(3)}, ${turns} turns in 6 s`);
 ok(lo>=.3&&hi>=.45&&hi<=.6,`${label}: hem clearly visible at the pulse peak (${hi.toFixed(3)})`);
 ok(hi-lo>=.12,`${label}: hem pulses (${lo.toFixed(3)} .. ${hi.toFixed(3)})`);
 ok(turns>=2&&turns<=8,`${label}: slow pulse (period 1.5-6 s; ${turns} turns in 6 s)`);
 ok(JSON.stringify(draw(100))===JSON.stringify(calls),label+': identical draw at the same game time');
 s.time=NaN;const cn=recorder();g.root.__HAPIL_FLOW_V31343__.drawFloor(cn,s);ok(cn.calls.every(c=>c.every(v=>typeof v!=='number'||Number.isFinite(v))),label+': a non-finite clock draws finite values');
}
console.log(out.join('\n'));
if(soft.length){console.log('FAILED '+soft.length+':\n'+soft.join('\n'));process.exit(1);}
console.log(JSON.stringify({rc240R5Camera:'passed',checks}));
