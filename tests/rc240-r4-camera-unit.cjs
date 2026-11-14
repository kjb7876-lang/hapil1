'use strict';
// RC240 fix round 3 (review round 3, space/camera/lighting/art/UX): phone framing and the danger band.
//  1. danger band reads as light on the floor: soft ramps at the rule line (x-y = -1.45) and at the
//     playable floor's flattened top cap (no hard vertical or horizontal edge), no hatch stripes or
//     chevrons, desaturated amber (not red), nothing stroked on the screen-vertical rule line,
//     every fill pass <= .2, points on the floor inside the strip
//  2. Balrog (dist06) / Lucifer (ep1a11): the PAINTED platform corners (measured on the PC shots:
//     side corners ~50 / ~56 G px past the radius-0 floor, bottom vertex G y ~768 / ~802) stay on
//     screen at the phone zoom (>= 1.15 is pinned elsewhere), the near painted vertex keeps a margin
//  3. lead room: Envy boss foot at ~70-72% of the width (<= 73%), hero clear of touch controls
//  4. Michaela (hero x-y -0.67) gets about the same zoom as the other heroes (gap <= .05)
//  5. dead zone: a boss drifting to ~77% re-aims (eased) back into the lead-room target
// Harness from tests/rc240-r2-resize-unit.cjs, with the real phone base camera and RC223 shrink (1.05).
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
function loadGame(dom,zone){
 const root=dom.win;vm.createContext(root);
 for(const f of ['assets/rc134/persona-duel.js','assets/rc138/battle-arena.js','assets/rc227/floor-patches.js','assets/rc223/left-zone.js'])vm.runInContext(read(f),root,{filename:f});
 const R=root.__HAPIL_BATTLE_ARENA_RC138__,D=root.__HAPIL_PERSONA_DUEL_RC134__;
 R.bind({combat:['ep1b03','dist06','ep1a11','last302'],clear:s=>!(s?.enemies??[]).some(a=>a?.hp>0)});
 root.__HAPIL_INNER_FINAL_RC133__={encounter:s=>s?.personaTestRC240===true};
 const z=REAL[zone]??REAL.ep1b03,view={x:-139.0769230769231,y:0,width:1558.1538461538462,height:720,k:.5416666666666666};
 const holder={base:{x:5.190587482102842,y:z.y,scale:.9918897070592143,battleArenaRC138:true,rc153WholeBody:true,rc153View:view,rc153Viewport:{width:844,height:390},rc153MapWidth:1584}};
 root.__HAPIL_COMBAT_LAYOUT_RC153__=Object.freeze({policy:{},boss:a=>!!(a?.boss||a?.midboss),position:(a,q)=>q,framing:()=>({left:-56.1,right:1336.1,top:z.top,bottom:729}),
  camera:st=>R.enabled(st)?holder.base:null,scatter(){},bind(){}});
 root.__HAPIL_CAMERA_RC223__={appliedZoom:()=>1.05};
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
// painted platform, measured (G px): side corners and near (bottom) vertex
const PAINT={dist06:{l:-19-50,r:1299+50,b:768},ep1a11:{l:-19-56,r:1299+56,b:802}};
// ------------------------------------------------ 2. painted platform corners on screen (Balrog, Lucifer)
for(const [name,zone,hero,boss] of [['Balrog','dist06',{x:13.95,y:24.05},{x:24.52,y:10.52}],['Lucifer','ep1a11',{x:13.72,y:24.01},{x:24.73,y:10.73}]]){
 const g=loadGame(makeDom(),zone),s=stage(g,{zone,hero,enemies:[{id:zone+'-boss',boss:true,...boss}]});
 const cam=g.L.camera(s,g.holder.base.rc153View),z=cam.rc240ZoomRC240,P=PAINT[zone];
 const l=toCss(cam,P.l,513).x,r=toCss(cam,P.r,513).x,b=toCss(cam,640,P.b).y,bx=actorCss(cam,s.enemies[0]).x/VW;
 out.push(`${name}: Z ${z} corners ${l.toFixed(1)} / ${(VW-r).toFixed(1)} bottom ${(VH-b).toFixed(1)} boss ${(bx*100).toFixed(1)}%`);
 ok(z>=1.15-1e-9,`${name}: zoom ${z} >= 1.15`);
 ok(l>=-.5&&r<=VW+.5,`${name}: painted side corners on screen (${l.toFixed(1)}, ${(VW-r).toFixed(1)} px)`);
 if(zone==='dist06')ok(l>=2.5&&r<=VW-2.5,`${name}: painted side corners >= ~3 px inside`);
 // Lucifer: the near vertex keeps its margin. Balrog: the raised flame sword (RC153 body frame top
 // G y 102.8) stops the view ~2 px short at 1.15, so the near vertex sits on the bottom edge and the
 // body frame touches the top (bodies stay whole; the far back vertex is what is cropped).
 const frameTop=toCss(cam,640,REAL[zone].top).y;
 if(zone==='ep1a11')ok(b<=VH-8,`${name}: painted near (bottom) vertex >= 8 px inside (${(VH-b).toFixed(1)})`);
 else ok(b<=VH+3&&frameTop>=-.5&&frameTop<=2,`${name}: view raised until the body frame meets the top (${frameTop.toFixed(1)}), near vertex at the bottom edge (${(VH-b).toFixed(1)})`);
 ok(bx<=.78,`${name}: boss foot <= 78% (${(bx*100).toFixed(1)}%)`);
 const h=actorCss(cam,s);for(const [sel,rc] of Object.entries(rectsFor(VW,VH)))ok(!inRect(h,rc)&&!inRect({x:h.x,y:h.y-40},rc),name+': hero clear of '+sel);
}
// ------------------------------------------------ 3/4. Envy lead room, Michaela zoom gap
const zs={};
for(const [name,hero] of [['hunter',{x:16,y:16}],['michaela',{x:15.67,y:16.34}]]){
 const g=loadGame(makeDom(),'ep1b03'),s=stage(g,{zone:'ep1b03',hero,enemies:[{id:'b03-boss',boss:true,x:28.14,y:12.55}]});
 const cam=g.L.camera(s,g.holder.base.rc153View),z=cam.rc240ZoomRC240,b=actorCss(cam,s.enemies[0]),h=actorCss(cam,s);zs[name]=z;
 out.push(`Envy ${name}: Z ${z} boss ${(b.x/VW*100).toFixed(1)}% hero ${(h.x/VW*100).toFixed(1)}%`);
 ok(z>=1.15-1e-9&&z<=1.2+1e-9,`Envy ${name}: zoom ${z} in [1.15, 1.2]`);
 ok(b.x/VW<=.73&&b.x/VW>=.64,`Envy ${name}: boss foot at ~70-72% (${(b.x/VW*100).toFixed(1)}%)`);
 ok(h.x>=.2*VW,`Envy ${name}: hero kept >= 20% from the left edge (${(h.x/VW*100).toFixed(1)}%)`);
 for(const [sel,rc] of Object.entries(rectsFor(VW,VH)))ok(!inRect(h,rc)&&!inRect({x:h.x,y:h.y-40},rc),`Envy ${name}: hero clear of ${sel}`);
}
ok(Math.abs(zs.hunter-zs.michaela)<=.05+1e-9,`Michaela zoom ${zs.michaela} within .05 of hunter ${zs.hunter}`);
// ------------------------------------------------ 5. dead zone: drift to ~77% re-aims back
{
 const g=loadGame(makeDom(),'ep1b03'),s=stage(g,{zone:'ep1b03',hero:{x:16,y:16},enemies:[{id:'b03-boss',boss:true,x:28.14,y:12.55}]}),view=g.holder.base.rc153View,boss=s.enemies[0];
 let cam=g.L.camera(s,view);const z0=cam.rc240ZoomRC240;
 // push the boss right until it sits at ~77% of this framing
 let d=0;for(;d<4;d+=.05){g.R.applyPosition(boss,{x:28.14+d/2,y:12.55-d/2});if(actorCss(cam,boss).x/VW>=.77)break;}
 ok(actorCss(cam,boss).x/VW>=.765,'fixture: boss drifted to ~77% of the old framing ('+(actorCss(cam,boss).x/VW*100).toFixed(1)+'%)');
 let maxStep=0,prev=actorCss(cam,boss).x;for(let i=0;i<150;i++){s.time+=1/60;cam=g.L.camera(s,view);const x=actorCss(cam,boss).x;maxStep=Math.max(maxStep,Math.abs(x-prev));prev=x;}
 // the boss now stands further right (x-y +~1.4): the floor's left edge limits the pan at >= 1.15
 ok(actorCss(cam,boss).x/VW<=.755,'drift re-aimed back toward the lead-room target ('+(actorCss(cam,boss).x/VW*100).toFixed(1)+'%)');
 ok(maxStep<=14,'re-aim eased ('+maxStep.toFixed(2)+' px/frame)');
 out.push(`drift: Z ${z0} -> ${cam.rc240ZoomRC240}`);
}
// ------------------------------------------------ 1. danger band
function recorder(){const calls=[];const ctx={calls,globalAlpha:1,fillStyle:'',strokeStyle:'',lineWidth:1,globalCompositeOperation:'source-over',
 save(){calls.push(['save']);},restore(){calls.push(['restore']);},beginPath(){calls.push(['begin']);},moveTo(x,y){calls.push(['m',x,y]);},lineTo(x,y){calls.push(['l',x,y]);},closePath(){calls.push(['close']);},
 fill(){calls.push(['fill',this.globalAlpha,this.fillStyle,this.globalCompositeOperation]);},stroke(){calls.push(['stroke',this.globalAlpha,this.strokeStyle,this.lineWidth]);}};return ctx;}
const inv=(gx,gy)=>{const a=(gx-640)/27,b=gy/13.5;return{x:(a+b)/2,y:(b-a)/2};};
function pip(p,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;}
function rgba(c){if(typeof c!=='string')return null;let m=/^#([0-9a-f]{6})$/i.exec(c);if(m){const n=parseInt(m[1],16);return[n>>16,(n>>8)&255,n&255,1];}m=/^rgba?\(([^)]+)\)$/.exec(c);if(m){const p=m[1].split(',').map(Number);return[p[0],p[1],p[2],p.length>3?p[3]:1];}return null;}
function hsl([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;if(!d)return[0,0,l];const s=d/(1-Math.abs(2*l-1));let h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;return[h,s,l];}
for(const [label,opts] of [['phone',{}],['desktop',{touch:false,coarse:false,screen:{width:1920,height:1080},inner:{width:1280,height:720}}]]){
 const g=loadGame(makeDom(opts),'ep1b03');
 const s={zone:'ep1b03',time:100,hp:240,maxHp:240,x:12,y:24,gameModeV31346:'STORY',enemies:[{id:'m',hp:5,maxHp:5,x:26,y:12}]};g.R.enforce(s);
 const ctx=recorder();g.root.__HAPIL_FLOW_V31343__.drawFloor(ctx,s);
 const paths=[];let cur=null,sub=null;
 for(const c of ctx.calls){if(c[0]==='begin'){cur={subs:[]};}else if(c[0]==='m'){sub=[inv(c[1],c[2])];cur.subs.push(sub);}else if(c[0]==='l'){sub.push(inv(c[1],c[2]));}else if(c[0]==='fill'||c[0]==='stroke'){paths.push({kind:c[0],alpha:c[1],style:c[2],width:c[3],subs:cur.subs});}}
 const fills=paths.filter(p=>p.kind==='fill'),strokes=paths.filter(p=>p.kind==='stroke');
 ok(fills.length>=1&&fills.every(p=>p.alpha>0&&p.alpha<=.2),label+': every band fill pass faint (<= .2)');
 // coverage (combined alpha) at a floor point
 const cover=q=>1-fills.reduce((m,p)=>{const col=rgba(p.style),a=p.alpha*(col?col[3]:1);let n=0;for(const sp of p.subs)if(pip(q,sp))n++;return n%2?m*(1-a):m;},1);
 // a point well inside the strip (1.6 units from the rule line, mid-depth)
 const at=(d,u)=>({x:(u+d)/2,y:(u-d)/2}); // x-y = d, x+y = u
 const inner=cover(at(-1.45+1.6,30)),edge=cover(at(-1.45+.05,30)),mid=cover(at(-1.45+.6,30));
 out.push(`${label} band cover: edge ${edge.toFixed(3)} mid ${mid.toFixed(3)} inner ${inner.toFixed(3)}`);
 ok(inner>=.18&&inner<=.36,`${label}: band clearly there inside the strip (${inner.toFixed(3)})`);
 ok(edge<=.35*inner,`${label}: soft rule-line edge, no hard vertical edge (edge ${edge.toFixed(3)} vs inside ${inner.toFixed(3)})`);
 ok(mid>edge+.02&&mid<inner-.02,`${label}: coverage ramps up gradually from the rule line (${edge.toFixed(3)} < ${mid.toFixed(3)} < ${inner.toFixed(3)})`);
 // the playable floor's flattened top cap (G y ~ 328-343) must not show as a horizontal edge
 const D=g.D,poly=D.polygon('all',.8);let topU=Infinity;for(const p of poly)if(p.x-p.y>-1.45&&p.x-p.y<4&&p.x+p.y<topU)topU=p.x+p.y;
 const capEdge=cover(at(1.5,topU+.08)),capIn=cover(at(1.5,topU+2.4));
 ok(capEdge<=.35*capIn&&capIn>=.15,`${label}: soft fade at the floor's top cap, no horizontal edge (${capEdge.toFixed(3)} vs ${capIn.toFixed(3)})`);
 // no hatch: no two fill sub-paths of the same pass that are disjoint narrow stripes (stripes were x-bands .42 wide)
 const narrow=fills.some(p=>p.subs.length>=3&&p.subs.every(sp=>{let x0=Infinity,x1=-Infinity;for(const q of sp){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);}return x1-x0<.6;}));
 ok(!narrow,`${label}: no hatch stripes`);
 // colour: desaturated amber, not red
 for(const p of fills){const c=rgba(p.style);ok(!!c,`${label}: fill colour parseable (${p.style})`);const [h,sat]=hsl(c);ok(h>=24&&h<=48&&sat<=.8,`${label}: fill is desaturated amber (hue ${h.toFixed(0)}, sat ${sat.toFixed(2)})`);}
 // nothing stroked along the screen-vertical rule line and no hard bright strokes
 for(const p of strokes){const c=rgba(p.style),eff=p.alpha*(c?c[3]:1);ok(eff<=.2,`${label}: strokes are soft (effective opacity ${eff.toFixed(2)})`);
  for(const sp of p.subs)for(let i=1;i<sp.length;i++){const a=sp[i-1],b=sp[i];ok(!(Math.abs((a.x-a.y)-(b.x-b.y))<1e-6),`${label}: no stroke along the screen-vertical x-y = const`);}
  if(c){const [h]=hsl(c);ok(h>=24&&h<=48,`${label}: stroke colour amber (hue ${h.toFixed(0)})`);}}
 const pts=paths.flatMap(p=>p.subs.flat());
 ok(pts.every(p=>p.x-p.y>=-1.45-1e-6&&p.x<=19+1e-6&&(D.contains(p,'all',.8-1e-3)||D.contains(p,'all',.75))),label+': all band marks on the floor inside the RC223 strip');
 const c2=recorder();g.root.__HAPIL_FLOW_V31343__.drawFloor(c2,s);ok(JSON.stringify(c2.calls)===JSON.stringify(ctx.calls),label+': identical draw each frame');
}
console.log(out.join('\n'));
if(soft.length){console.log('FAILED '+soft.length+':\n'+soft.join('\n'));process.exit(1);}
console.log(JSON.stringify({rc240R4Camera:'passed',checks}));
