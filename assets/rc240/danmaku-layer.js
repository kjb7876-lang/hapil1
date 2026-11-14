/* RC240: high-density, readable boss danmaku layer (landscape combat).
 * Self-contained side layer: own SoA bullet pool in G-space logical px, own
 * collision (heart only), own render passes. Native hostileProjectiles, caps,
 * saves and the bundle are untouched. Every seam calls through to the original
 * inside try/catch; an RC240 failure can never break the frame.
 * All spell names, patterns and art are original and baked at runtime.
 */
(function(root){'use strict';
 if(!root||root.__HAPIL_DANMAKU_RC240_LOADED__)return;
 root.__HAPIL_DANMAKU_RC240_LOADED__=true;
 const VERSION='RC240';
 const TAU=Math.PI*2,PI=Math.PI;
 const n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d;
 const clamp=(v,a,b)=>v<a?a:v>b?b:v;
 const wrap=a=>{a=(a+PI)%TAU;if(a<0)a+=TAU;return a-PI;};
 const now=()=>root.performance?.now?.()??Date.now();

 // ---------------------------------------------------------------- RNG/hash
 function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
 function hash(){let h=2166136261>>>0;for(let i=0;i<arguments.length;i++){const s=String(arguments[i]);for(let j=0;j<s.length;j++){h^=s.charCodeAt(j);h=Math.imul(h,16777619)>>>0;}h^=0x9e;h=Math.imul(h,16777619)>>>0;}return h>>>0;}

 // ---------------------------------------------------------------- constants
 // Combat band (heart reachable area) and cull rect, G-space logical px.
 const FIELD=Object.freeze({x0:127,x1:1153,y0:371,y1:655});
 const CULL=Object.freeze({x0:60,x1:1220,y0:290,y1:722});
 const HERO_V=Object.freeze({h:247,v:124});
 const HEART_R=4.5;
 const T=Object.freeze({DOT:0,ORB:1,BIG:2,RICE:3,NEEDLE:4,STAR:5});
 const HIT=[2.5,3.5,7,2.5,2,3];
 const CELL=[26,40,66,30,34,32];
 const HALO=[12.5,19.5,32.5];
 const GLOW=[14,22,38,14,15,18];
 const FRAMES=[1,1,1,32,32,8];
 const DRAW_ORDER=[T.BIG,T.ORB,T.STAR,T.RICE,T.NEEDLE,T.DOT];
 const HUES=[
  ['red','#ff3048','#8a0f22'],['orange','#ff8a1c','#8c3d00'],['yellow','#ffe03a','#8a6a00'],['green','#40ff8c','#0d7a3c'],
  ['cyan','#2ee8ff','#0a6a80'],['blue','#4f7dff','#1a2c8a'],['violet','#b45cff','#4a1a85'],['magenta','#ff4fd8','#8a1470'],
  ['white','#f4f4ff','#6a6a8a'],['lime','#b6ff4a','#3f7a00'],['pink','#ff6fb5','#8a1a52'],['gold','#ffcf3a','#7a5200'],
  // Lava-map enemy bodies: magenta / violet with a white-hot core and a thin ember rim (4th field).
  ['lavam','#ff3fb4','#7a0f4a','#ff8a3a'],['lavav','#b04cff','#3f1580','#ff8a3a'],
  // Boss weapon palettes (R2): Balrog flame (deep orange-red, never pale gold) + ember crimson; Envy
  // lilac glass + indigo shard. Formation-only hues, untouched by every family remap.
  ['flame','#ff5a1a','#6e1400'],['ember','#e8162e','#560010'],['glass','#e2d8ff','#46378c'],['shard','#7a6cff','#231a7a']];
 const H={};HUES.forEach((h,i)=>H[h[0]]=i);
 const MODES=Object.freeze({
  STORY:{peakPc:[150,200,280],vs:1,vmin:55,vmax:120,vaim:130,dens:1.55,dmg:.04,mercy:1.5,clear:140,cap:.18,excl:160,lane:58},
  HELL:{peakPc:[180,245,340],vs:1.15,vmin:60,vmax:140,vaim:150,dens:1.75,dmg:.06,mercy:1.1,clear:100,cap:.24,excl:130,lane:50},
  DREAM:{peakPc:[205,290,400],vs:1.35,vmin:70,vmax:165,vaim:180,dens:2.05,dmg:.08,mercy:.9,clear:80,cap:.30,excl:110,lane:44}});
 const DENSITY=Object.freeze({low:.6,normal:1,high:1.3});
 const MOBILE_MUL=.55,AUTO_MUL=.75;
 const LIVE_CAP=Object.freeze({pc:640,mobile:260,lowFx:200});
 const POOL_CAP=Object.freeze({pc:1024,mobile:384});
 const SPARK_CAP=Object.freeze({pc:320,mobile:96,lowFx:64});
 const BAND_DENS=[.78,.92,.98],BAND_SPEED=[1,1.05,1.1];
 const STORE_KEY='hapil.danmakuDensityRC240';

 // ---------------------------------------------------------------- pool (SoA)
 const FIELDS=['x','y','px','py','vx','vy','ang','spd','acc','vmin','vmax','om','amp','aT','aPh','gvx','gvy','gy','age','life','stAt','stKind','stA','stB','stC','stD','stE','type','hue','flags','bounce','ox','oy','dir','swX','swY','swW','sw0'];
 const F_GRAZED=1,F_AIMED=2,F_STAGED=4,F_REVERSE=8,F_FAST=16;
 function createPool(cap){const p={cap,live:0,peak:0,spawned:0};for(const f of FIELDS)p[f]=new Float32Array(cap);return p;}
 function poolCopy(p,i,j){for(const f of FIELDS)p[f][i]=p[f][j];}
 function poolRemove(p,i){const last=--p.live;if(i!==last)poolCopy(p,i,last);}
 function poolClear(p){p.live=0;}

 // ---------------------------------------------------------------- safe lane
 // One smoothly moving safe lane per spell. Vertical speed <= .5 hero vertical speed.
 function safeY(t,seed){const ph=(seed%6283)/1000,mid=(FIELD.y0+FIELD.y1)/2+8,amp=88;
  return clamp(mid+amp*Math.sin(.38*t+ph)+amp*.22*Math.sin(.9*t+ph*1.7),FIELD.y0+40,FIELD.y1-26);}

 // ---------------------------------------------------------------- emitters
 // Pure: (layer params, beat k, rng, ctx, out[]) -> pushes bullet specs.
 function spec(x,y,ang,spd,type,hue,o){const b={x,y,ang,spd,type,hue,acc:0,vmin:-1e4,vmax:1e4,om:0,amp:0,aT:1,aPh:0,gvx:0,gvy:0,gy:0,life:16,stAt:-1,stKind:0,stA:0,stB:0,stC:0,stD:0,stE:0,bounce:0,flags:0};if(o)for(const k in o)b[k]=o[k];return b;}
 function blocked(ctx,abs,w){return ctx.gapHalf>0&&Math.abs(wrap(abs-ctx.phi))<ctx.gapHalf*(w||1);}
 const S=(ctx,v)=>v*ctx.vs;
 const EMIT={
  arc(p,k,r,ctx,out){const sway=(p.sway||0)*PI/180*Math.sin(k*.7+ctx.seed%7),arc=p.arc*PI/180,cnt=p.n;
   for(let i=0;i<cnt;i++){const a=-arc/2+arc*(i+.5)/cnt+sway,abs=ctx.dir+a;if(p.gap!==false&&blocked(ctx,abs,p.gapW))continue;
    out.push(spec(ctx.bx,ctx.by,abs,S(ctx,p.spd),p.type,p.hue,{acc:S(ctx,p.acc||0),vmin:p.vmin==null?-1e4:S(ctx,p.vmin),vmax:p.vmax==null?1e4:S(ctx,p.vmax),flags:p.reverse?F_REVERSE:0,bounce:p.bounce||0}));}},
  mirror(p,k,r,ctx,out){for(const sgn of [1,-1])for(const d of p.angles){const abs=ctx.dir+sgn*d*PI/180;if(blocked(ctx,abs))continue;out.push(spec(ctx.bx,ctx.by+sgn*(p.dy||0),abs,S(ctx,p.spd),p.type,sgn>0?p.hue:(p.hue2??p.hue),{bounce:p.bounce||0}));}},
  fan(p,k,r,ctx,out){if(ctx.auto)return;const aim=Math.atan2(ctx.ay-ctx.by,ctx.ax-ctx.bx),step=p.step*PI/180;
   for(let i=0;i<p.n;i++){const abs=aim+(i-(p.n-1)/2)*step;for(let j=0;j<(p.line||1);j++)out.push(spec(ctx.bx,ctx.by,abs,Math.min(ctx.vaim,S(ctx,p.spd)*(1-j*.07)),p.type,p.hue,{flags:F_AIMED}));}},
  spiral(p,k,r,ctx,out){const t=ctx.beatT;let base;
   if(p.flip){const P=p.flip,c=Math.floor(t/P),rem=t-c*P;base=p.om*(c%2?P-rem:rem);}else base=p.om*t;
   base+=ctx.seed%13;for(let j=0;j<p.arms;j++){const abs=base+j*TAU/p.arms;if(Math.cos(abs-ctx.dir)<(p.cosMin??0))continue;if(blocked(ctx,abs))continue;
    out.push(spec(ctx.bx,ctx.by,abs,S(ctx,p.spd),p.type,(p.hue2!=null&&j%2)?p.hue2:p.hue,{acc:S(ctx,p.acc||0),vmax:p.vmax==null?1e4:S(ctx,p.vmax)}));}},
  wall(p,k,r,ctx,out){const vx=S(ctx,p.vx),x=ctx.bx+(ctx.dir>1?24:-24),travel=Math.abs(x-ctx.hx)/Math.max(20,vx),yg=ctx.ySafeAt(ctx.beatT+travel+(p.lag||0)),gap=p.gap*ctx.gapMul;
   // Rows span the whole band edge to edge (no edge-hugging lane); the only route is the gap.
   const y0=FIELD.y0-6,y1=FIELD.y1+6,rows=Math.max(2,Math.round((y1-y0)/p.spacing)),sp=(y1-y0)/rows;r();
   for(let j=0;j<=rows;j++){const y=y0+j*sp;if(Math.abs(y-yg)<gap/2)continue;const crest=1+(p.crest||0)*Math.sin(PI*clamp((y-FIELD.y0)/(FIELD.y1-FIELD.y0),0,1));
    out.push(spec(x,y,ctx.dir,vx*crest,p.type,p.hue,{life:20}));}},
  wave(p,k,r,ctx,out){for(let i=0;i<p.streams.length;i++){const abs=ctx.dir+p.streams[i]*PI/180;if(p.gap&&blocked(ctx,abs))continue;out.push(spec(ctx.bx,ctx.by,abs,S(ctx,p.spd),p.type,i%2&&p.hue2!=null?p.hue2:p.hue,{amp:p.A,aT:p.T,aPh:i*.6}));}},
  lattice(p,k,r,ctx,out){const wob=(p.wobble||0)*PI/180*Math.sin(ctx.beatT*TAU/4);for(const off of p.offs){const y=ctx.by+off;if(y<FIELD.y0-50||y>FIELD.y1+50)continue;
   for(const sgn of [1,-1]){const abs=ctx.dir+sgn*(p.ang*PI/180)+wob;out.push(spec(ctx.bx,y,abs,S(ctx,p.spd),p.type,sgn>0?p.hue:(p.hue2??p.hue)));}}},
  decel(p,k,r,ctx,out){for(let i=0;i<p.n;i++){const abs=ctx.dir+(r()*2-1)*p.spread*PI/180;
   out.push(spec(ctx.bx,ctx.by,abs,p.v0,p.type,p.hue,{acc:-p.dec,vmin:0,stAt:p.stopAt+p.hold,stKind:1,stA:Math.min(ctx.vaim,S(ctx,p.v1)),flags:ctx.auto?0:F_AIMED}));}},
  bloom(p,k,r,ctx,out){const aim=ctx.auto?ctx.dir:Math.atan2(ctx.hy-ctx.by,ctx.hx-ctx.bx),side=p.count>1?[1,-1]:[0];
   for(const sgn of side){const abs=aim+sgn*p.off*PI/180;out.push(spec(ctx.bx,ctx.by,abs,S(ctx,p.spd),T.BIG,p.hue,{acc:S(ctx,p.acc||0),vmin:S(ctx,20),stAt:p.splitAt,stKind:2,stA:p.ring.n,stB:S(ctx,p.ring.spd),stC:p.ring.type*16+p.ring.hue,stD:p.ring.rose||0,stE:NaN}));}},
  ember(p,k,r,ctx,out){for(let i=0;i<p.n;i++){const vx=(p.vx[0]+r()*(p.vx[1]-p.vx[0]))*ctx.vs,vy=(p.vy[0]+r()*(p.vy[1]-p.vy[0]))*Math.sqrt(ctx.vs);
   out.push(spec(ctx.bx,ctx.by,0,0,p.type,p.hue,{gvx:ctx.dir>1?-vx:vx,gvy:vy,gy:p.g*ctx.vs,life:6}));}},
  crowns(p,k,r,ctx,out){const lo=Math.min(ctx.bx,ctx.hx)-260,hi=ctx.bx-40,yc=(FIELD.y0+FIELD.y1)/2+(r()-.5)*60;
   for(let i=0;i<p.n;i++){const x=clamp(lo+(hi-lo)*(i+.5)/p.n+(r()-.5)*30,FIELD.x0+20,FIELD.x1-20),y=FIELD.y0-34,vy=S(ctx,p.vy);
    out.push(spec(x,y,PI/2,vy,T.BIG,p.hue,{stAt:(yc-y)/vy,stKind:2,stA:p.fan.n,stB:S(ctx,p.fan.spd),stC:p.fan.type*16+p.fan.hue,stD:p.fan.spread,stE:ctx.dir>1?PI*.5+.42:PI*.5-.42}));}}
 };

 // ---------------------------------------------------------------- spells
 // Speeds are STORY px/s; the mode/band multiplier and clamps apply at spawn.
 const SPELLS=[
  {id:'S1',dens:1.7,key:'envy-mirror',name:'질투 「금 간 거울 회랑」',hues:['magenta','yellow'],circle:'magenta',layers:[
   {kind:'mirror',period:1.05,p:{angles:[13,21,29,37],spd:92,type:T.RICE,hue:H.magenta,hue2:H.pink,bounce:1}},
   {kind:'bloom',period:2.2,start:.6,lite:false,p:{count:2,off:16,spd:84,acc:-14,splitAt:2.4,hue:H.violet,ring:{n:10,spd:58,type:T.ORB,hue:H.yellow}}},
   {kind:'fan',period:2.3,start:1.1,lite:false,p:{n:4,step:11,spd:118,type:T.RICE,hue:H.red,line:2}}]},
  {id:'S2',dens:1.5,key:'greed-interest',name:'탐욕 「복리 회수」',hues:['gold','orange'],circle:'gold',layers:[
   {kind:'arc',period:1.15,p:{n:21,arc:150,spd:100,acc:-30,vmin:56,type:T.ORB,hue:H.gold,sway:6}},
   {kind:'decel',period:2.1,start:.5,lite:false,p:{n:6,spread:80,v0:190,dec:380,stopAt:.5,hold:.6,v1:112,type:T.DOT,hue:H.yellow}},
   {kind:'spiral',period:.16,bandMin:2,lite:false,p:{arms:2,om:.8,spd:88,type:T.ORB,hue:H.orange,cosMin:.1}}]},
  {id:'S3',dens:2.6,key:'rage-tide',name:'분노 「용암 해일」',hues:['cyan','blue'],circle:'cyan',layers:[
   {kind:'wall',period:1.5,p:{spacing:24,vx:92,crest:.18,gap:84,type:T.ORB,hue:H.blue}},
   {kind:'ember',period:.5,start:.3,lite:false,p:{n:3,vx:[110,170],vy:[-170,-130],g:230,type:T.DOT,hue:H.cyan}},
   {kind:'fan',period:2.4,start:1.2,bandMin:2,lite:false,p:{n:4,step:12,spd:118,type:T.RICE,hue:H.violet}},
   {kind:'wall',period:1.5,start:.75,bandMin:3,lite:false,p:{spacing:30,vx:92,crest:.18,gap:84,type:T.ORB,hue:H.white}}]},
  {id:'S4',dens:1.4,key:'obsession-song',name:'집착 「끊기지 않는 노랫줄」',hues:['pink','magenta'],circle:'pink',layers:[
   {kind:'wave',period:.2,p:{streams:[-26,-13,0,13,26],spd:94,A:18,T:1.3,type:T.ORB,hue:H.pink,hue2:H.magenta,gap:true}},
   {kind:'bloom',period:2.6,start:.8,lite:false,p:{count:1,off:0,spd:90,acc:-18,splitAt:2.2,hue:H.magenta,ring:{n:22,spd:46,type:T.DOT,hue:H.white,rose:2}}},
   {kind:'fan',period:2.0,start:1.4,lite:false,p:{n:4,step:10,spd:112,type:T.RICE,hue:H.yellow}}]},
  {id:'S5',dens:2.6,key:'order-seal',name:'율법 「봉인 격자」',hues:['blue','white'],circle:'blue',layers:[
   {kind:'lattice',period:.5,p:{offs:[-120,-40,40,120],ang:22,spd:96,type:T.NEEDLE,hue:H.cyan,hue2:H.blue,wobble:0}},
   {kind:'fan',period:1.9,start:.9,lite:false,p:{n:4,step:14,spd:110,type:T.STAR,hue:H.gold}},
   {kind:'wall',period:2.6,start:1.3,bandMin:3,lite:false,p:{spacing:42,vx:84,crest:0,gap:96,type:T.ORB,hue:H.white}}]},
  {id:'S6',dens:1.4,key:'petal-nebula',name:'몽화 「피어나는 성운」',hues:['violet','cyan'],circle:'violet',layers:[
   {kind:'spiral',period:.11,p:{arms:4,om:1.1,spd:78,acc:16,vmax:118,type:T.ORB,hue:H.violet,hue2:H.cyan,cosMin:.05}},
   {kind:'bloom',period:1.9,start:.7,lite:false,p:{count:2,off:15,spd:92,acc:-20,splitAt:1.9,hue:H.cyan,ring:{n:12,spd:56,type:T.ORB,hue:H.violet}}},
   {kind:'spiral',period:.16,bandMin:3,lite:false,p:{arms:6,om:-.9,flip:4,spd:84,type:T.STAR,hue:H.white,cosMin:.2}},
   {kind:'fan',period:2.2,start:1.3,bandMax:2,lite:false,p:{n:3,step:12,spd:114,type:T.RICE,hue:H.magenta,line:2}}]},
  {id:'S7',dens:0.85,key:'pride-crowns',name:'교만 「추락하는 일곱 왕관」',hues:['gold','red'],circle:'gold',layers:[
   {kind:'arc',period:.95,p:{n:30,arc:190,spd:150,acc:-150,vmin:50,type:T.ORB,hue:H.gold,sway:5,gapW:1.9}},
   {kind:'crowns',period:2.2,start:.6,lite:false,p:{n:6,vy:60,hue:H.red,fan:{n:5,spd:70,spread:1.3,type:T.RICE,hue:H.orange}}},
   {kind:'decel',period:2.6,start:1.4,bandMin:3,lite:false,p:{n:5,spread:70,v0:170,dec:340,stopAt:.5,hold:.7,v1:110,type:T.STAR,hue:H.white}},
   {kind:'fan',period:2.4,start:1.0,lite:false,p:{n:3,step:13,spd:116,type:T.RICE,hue:H.red,line:2}}]},
  {id:'S8',dens:2.3,key:'gluttony-table',name:'탐식 「되삼키는 식탁」',hues:['lime','violet'],circle:'lime',layers:[
   {kind:'arc',period:1.3,p:{n:26,arc:176,spd:132,acc:-96,vmin:-90,vmax:140,type:T.ORB,hue:H.lime,sway:8,reverse:true}},
   {kind:'fan',period:2.1,start:.8,lite:false,p:{n:6,step:9,spd:116,type:T.RICE,hue:H.violet}},
   {kind:'spiral',period:.18,bandMin:2,lite:false,p:{arms:2,om:-.7,spd:84,type:T.ORB,hue:H.green,cosMin:.25}}]}
 ];
 // Non-spell filler: standard arcs/fans between spells (declaration, drain, rest), ~55% of spell density.
 const SPELL_BY_ID=Object.fromEntries(SPELLS.map(s=>[s.id,s]));
 const FAMILY_SPELLS=Object.freeze({envy:['S1','S5'],greed:['S2','S8'],gluttony:['S8','S2'],rage:['S3','S7'],obsession:['S4','S6'],order:['S5','S7'],petal:['S6','S4'],lucifer:['S7','S6']});
 // Enemy palettes per family. Hero-side visuals (charge shot, coins) own one colour
 // family per map that enemy bullets never use: cyan on warm/violet maps, white-gold
 // on the cool lava map (rage), where enemy gold/yellow are folded to white/violet.
 // rage (lava, hero side white-gold): white-hot cores in magenta/violet bodies with an ember rim, never
 // plain blue/cyan (off-theme on lava) nor gold/yellow/orange (hero). lucifer (gold boss, pale floor,
 // white-gold hero shot): crimson/violet/magenta, no gold, yellow or white bodies.
 const REMAP_SRC=Object.freeze({rage:{gold:'lavav',red:'lavam',orange:'lavam',yellow:'white',lime:'lavav',green:'lavav',pink:'lavam',blue:'lavam',cyan:'lavav',violet:'lavav',magenta:'lavam'},envy:{cyan:'magenta',green:'violet',blue:'red',lime:'glass',yellow:'glass',gold:'violet',orange:'magenta'},
  greed:{cyan:'blue'},gluttony:{cyan:'blue'},obsession:{cyan:'blue'},order:{cyan:'blue'},petal:{cyan:'blue'},lucifer:{cyan:'violet',gold:'red',yellow:'magenta',orange:'magenta',white:'magenta',lime:'red',green:'violet',blue:'violet',pink:'magenta'}});
 const HERO_SIDE=Object.freeze({rage:'gold'});
 const HERO_PALETTE=Object.freeze({cyan:{key:'cyan',body:'#7ff6ff',edge:'#0b4f63',core:'#ffffff',dim:'#bff9ff',coin:['#c6f7ff','#5fe8ff','#ffffff']},gold:{key:'gold',body:'#ffe27a',edge:'#6b4300',core:'#fffbe8',dim:'#fff1b8',coin:['#e8e2cf','#ffd34d','#fff6cf']}});
 function heroPalette(family){return HERO_PALETTE[HERO_SIDE[family]??'cyan'];}
 const REMAP={};for(const [f,map] of Object.entries(REMAP_SRC)){const a=HUES.map((_,i)=>i);for(const [from,to] of Object.entries(map))a[H[from]]=H[to];REMAP[f]=a;}
 const FAMILY_DIM=Object.freeze({rage:.5,envy:.4,greed:.44,gluttony:.42,obsession:.42,order:.4,petal:.4,lucifer:.46});

 function familyOf(a){if(!a)return 'petal';const name=String(a.name??'')+' '+String(a.kind??'');
  if(a.cosmicLuciferV31318||/루시퍼/.test(name))return 'lucifer';if(/탐식|베엘제붑/.test(name))return 'gluttony';
  let f=null;try{f=root.__HAPIL_CHOICE_RC97__?.profile?.(a)?.family;}catch(e){}
  if(!f&&/발록/.test(name))f='rage';return FAMILY_SPELLS[f]?f:'petal';}
 function spellFor(family,index){const pair=FAMILY_SPELLS[family]??FAMILY_SPELLS.petal;return {id:index===2?pair[1]:pair[0],lite:index===1};}
 function modeKey(m){return m==='DREAM'?'DREAM':m==='HELL'?'HELL':'STORY';}
 function peakFor(mode,band,mobile){const M=MODES[modeKey(mode)],b=clamp(Math.floor(n(band,1)),1,3)-1;return Math.round(M.peakPc[b]*(mobile?MOBILE_MUL:1));}
 // Mobile x.55, full-auto x.75; stacked never below x.45.
 function reduceMul(mobile,auto){return Math.max(.45,(mobile?MOBILE_MUL:1)*(auto?AUTO_MUL:1));}

 // ---------------------------------------------------------------- spell run (pure)
 function makeRun(spellId,o={}){const spell=SPELL_BY_ID[spellId]??SPELLS[5],band=clamp(Math.floor(n(o.band,1)),1,3);
  const layers=spell.layers.filter((l,i)=>band>=(l.bandMin||1)&&band<=(l.bandMax||3)&&(!o.lite||i===0||(!o.midboss&&l.kind!=="decel")));
  const emitEnd=n(o.emitEnd,1e9);
  return {spell,band,lite:!!o.lite,seed:n(o.seed,0)>>>0,t:0,layers,next:layers.map(l=>n(l.start,0)),beats:layers.map(()=>0),emitEnd,sig:o.weapon?makeSig(o.weapon,o,emitEnd<1e8?emitEnd:11.4):null,thin:false};}
 const RAMP=Object.freeze({t:2.4,k0:.45});
 const RING=0;// muzzle ring radius (G px); 24 and 46 both pushed solvability cases over their margin, so off by default
 function layerPeriod(run,l,ctx,at){const aimed=l.kind==='fan'||l.kind==='decel';if(aimed)return l.period/clamp(ctx.dens,.2,1);
  const u=l.kind==='wall'?1:clamp(n(at,RAMP.t)/RAMP.t,0,1),ramp=RAMP.k0+(1-RAMP.k0)*u;return l.period*ramp/Math.max(.2,ctx.dens*n(run.spell.dens,1));}
 function runStep(run,dt,ctx,out){run.t+=dt;if(run.t>run.emitEnd)return 0;let c=sigStep(run,ctx,out);
  // While a weapon formation is traced and held (until its first release), spiral and bloom layers rest:
  // their rotating arms and point-born rings read as clutter over the weapon; the other non-aimed layers
  // thin a little less meanwhile, so the density stays where it was (R2).
  const Sg=run.sig,up=!!(Sg&&Sg.active&&run.t-Sg.t0<Sg.rel),thin=!!run.thin,keep=run.squeeze?-1:(ctx.band===3||up)?3:2;
  for(let i=0;i<run.layers.length;i++){const l=run.layers[i];let guard=0;
   const aimedL=l.kind==='fan'||l.kind==='decel';
   while(run.next[i]<=run.t&&guard++<4){const k=run.beats[i]++;if((ctx.soft&&(aimedL||k%5>keep))||(thin&&!aimedL&&k%5>keep)||(up&&(l.kind==='spiral'||l.kind==='bloom'))){run.next[i]+=layerPeriod(run,l,ctx,run.next[i]);continue;}ctx.beatT=run.next[i];const rng=mulberry32(hash(run.seed,run.spell.id,i,k));
    const before=out.length;EMIT[l.kind](l.p,k,rng,ctx,out);for(let j=before;j<out.length;j++){const b=out[j];b.layer=i;b.pre=Math.max(0,run.t-run.next[i]);
     // Muzzle ring: bullets born on the boss point start on a ring around it (2:1 floor ellipse), so the
     // pattern opens from the boss's edge instead of knotting on its sprite.
     if(ctx.ring>0&&b.x===ctx.bx&&b.y===ctx.by){const a=b.spd>0?b.ang:Math.atan2(b.gvy,b.gvx);b.x+=Math.cos(a)*ctx.ring;b.y+=Math.sin(a)*ctx.ring*.6;}}c+=out.length-before;
    run.next[i]+=layerPeriod(run,l,ctx,run.next[i]);}}
  return c;}

 // ---------------------------------------------------------------- fast aimed volleys (between spells)
 // Few fast shots aimed at the heart with zero lead. Every volley is telegraphed
 // >= .3 s (muzzle flash + thin aim line that tracks the heart) before release,
 // so the answer is a positional sidestep, not memorisation.
 const VOLLEY=Object.freeze({STORY:{n:[4,6],spd:260,period:1.1,tele:.42},HELL:{n:[5,7],spd:300,period:.95,tele:.36},DREAM:{n:[5,7],spd:340,period:.85,tele:.32}});
 // Spell-to-spell bridge: in the last BRIDGE.lead s of a spell the next volleys are already
 // telegraphed; they release only once the spell's own bullets have been cancelled, so the
 // screen never sits empty through the drain / rest / declaration, and never stacks on the old curtain.
 const BRIDGE=Object.freeze({lead:.55,maxWait:6,quiet:1.25,n:3,stagger:.2,freshDecl:.35});
 const TELE_MIN=.3;
 function volleyPlan(mode,band,mobile,auto,k,rng){const V=VOLLEY[modeKey(mode)],red=reduceMul(mobile,auto);
  const n=clamp(Math.round((V.n[0]+(V.n[1]-V.n[0])*rng()+(band-1)*.5)*Math.max(.7,red)),3,7);
  return {n,spd:clamp(V.spd*(mobile?.92:1)*(auto?.9:1),240,340),tele:Math.max(TELE_MIN,V.tele+(mobile?.08:0)+(auto?.1:0)),stream:k%3===1,spread:.12+.02*n,gap:.075,period:V.period*Math.max(.7,red)/Math.max(.45,red)};}
 function volleyShot(x,y,ang,spd,remapHue,j){return spec(x,y,ang,spd,j%2?T.RICE:T.NEEDLE,remapHue,{flags:F_AIMED|F_FAST,vmax:spd*1.02,life:6});}


 // ---------------------------------------------------------------- weapon signatures
 // Each boss's weapon, drawn with bullets inside its spells. A phrase (1) traces the weapon in
 // front of the boss, between the boss and mid-field, at a size that dominates the band (the game
 // draws 1 G px as 1 CSS px at 1280x720 and .634 CSS px on an 812x375 phone: >= 130 px tall, long
 // weapons >= 300 px along their longest span, i.e. 46% / 106% of the 284 px band height);
 // (2) holds the finished silhouette still >= SIG.hold s; (3) swings it as one rigid body about its
 // pivot (hilt, handle, shoulder, bar, centre) with edge speed <= SIG.swingV; (4) releases every
 // bullet below SIG.vcap. Nothing moves earlier than SIG.armed s after the first bullet appears.
 // The frame (centre, vertical mirror, scale) is picked per phrase from a few candidates so the most
 // bullets survive the band edges, the heart exclusion (start, mid-swing and end positions) and
 // the safe-lane rule (releases whose ray would cross the moving safe lane are left out). Start
 // positions keep out of the heart exclusion; swing and end positions only stay inside the band.
 // Structure is drawn with bullet type: BIG/ORB for pommels, guards, nodes and rims, NEEDLE/RICE
 // laid along edges, hollow interiors; edges white, accents in the spell hue. Mobile keeps the same
 // G-size silhouette with fewer, larger bullets (DOT->ORB, NEEDLE->RICE). Two phrases per spell at
 // fixed beats; around a phrase the spell's non-aimed layers thin to the soft-hold ratio.
 const F_SIG=32,DEG=PI/180;
 const SIG=Object.freeze({base:[56,72,104],mode:{STORY:1,HELL:1.05,DREAM:1.1},max:120,cap:168,beats:[.24,.62],pre:1.3,hold:.5,armed:1.3,vcap:190,swingV:185,minLeft:3.2});
 // Boss body box (G px, relative to the muzzle, which sits 100 px above the feet) plus a margin:
 // no formation bullet is traced, swung or parked inside it, so the boss sprite and its HP bar
 // (just under the feet) stay readable. Ground-area formations (sound rings, hexagram) are laid on
 // the floor with the iso squash (2:1 ellipse); airborne weapons stay unsquashed.
 const BOSS_BOX=Object.freeze({w:50,up:90,down:130,m:8,col:24}),ISO_U=1.41,ISO_V=.72;
 const MOB_TY=[T.ORB,T.ORB,T.BIG,T.RICE,T.RICE,T.STAR];
 const NO_COL=new Set(['strings','crescent']);
 const SIG_ACCENT=['cyan','magenta','violet','red','orange'];
 // Builder: G holds the phrase frame and writes into typed arrays (no allocation per bullet).
 function sigBuf(cap){const B={n:0,cap};for(const k of ['x','y','t','r','a','o','v','acc','vmin','lf','qx','qy','qw','q0'])B[k]=new Float32Array(cap);for(const k of ['ty','hu','st','fl','bo'])B[k]=new Uint8Array(cap);B.ord=new Uint16Array(cap);
  B.specs=[];for(let i=0;i<cap;i++)B.specs.push(spec(0,0,0,0,0,0,{swX:0,swY:0,swW:0,sw0:0}));return B;}
 // Local frame: origin at the formation centre, u toward the hero, v down (mirrored when G.sy<0).
 const wa=(G,a)=>{a*=G.sy;return G.sx>0?a:PI-a;};
 const unwa=(G,A)=>G.sy*(G.sx>0?A:PI-A);
 // Rigid swing for the bullets put after this call: pivot (pu,pv), turn phi (local rad) over td s.
 // It starts SIG.hold after the trace ends (Td, plus two frames of emission slack) and never before
 // SIG.armed, so nothing moves earlier than that after the first bullet appears;
 // rmax (farthest bullet from the pivot) caps the edge speed at SIG.swingV.
 function swing(G,pu,pv,phi,td,Td,rmax){G.pu=pu;G.pv=pv;const cap=SIG.swingV/Math.max(1,rmax*G.s);G.w=td>0?clamp(phi/td,-cap,cap):0;G.td=td>0?td:0;G.ts=Math.max(Td+SIG.hold+.04,SIG.armed+.05);G.rl=0;G.phi=G.w*G.td;}
 // Final local position of (u,v) after the current swing -> G.fu, G.fv.
 function fin(G,u,v){const c=Math.cos(G.phi),s=Math.sin(G.phi),du=u-G.pu,dv=v-G.pv;G.fu=G.pu+du*c-dv*s;G.fv=G.pv+du*s+dv*c;}
 function out(x,y){return !(y>=FIELD.y0-14&&y<=FIELD.y1+14&&x>=CULL.x0+20&&x<=CULL.x1-20);}
 function inBox(G,x,y){return x>G.bx0&&x<G.bx1&&y>G.by0&&y<G.by1;}
 function bad(G,x,y){const dx=x-G.hx,dy=y-G.hy;return out(x,y)||dx*dx+dy*dy<G.excl2||inBox(G,x,y);}
 // Coherent release (rfix generators): every bullet keeps the same drift toward the hero plus a slow
 // self-similar expansion about (cu,cv), both taken in the swung pose, so the silhouette translates
 // and grows instead of scattering (it stays recognisable well past .4 s of travel). -> G.fa, G.fs.
 function coh(G,u,v,cu,cv,drift,k){fin(G,cu,cv);const ccu=G.fu,ccv=G.fv;fin(G,u,v);const vx=drift+k*(G.fu-ccu),vy=k*(G.fv-ccv);G.fa=Math.atan2(vy,vx);G.fs=Math.hypot(vx,vy);}
 // Adds one bullet at local (u,v), traced at phrase time t (<= the trace end), oriented lo. After
 // the swing it leaves at local angle la (given in the traced pose; it turns with the swing unless
 // G.rfix) and spd (STORY px/s, mode-scaled, capped). Rejected (counted) when its start, swing or
 // end lies outside the band or inside the heart exclusion, or its release crosses the safe lane.
 function laneHit(G,x,y,ang,vel,r){const c=Math.cos(ang),dx=G.hx-x;if(!(c*dx>0&&Math.abs(c)>.12&&vel>1))return false;const tt=dx/(c*vel);if(tt>=7)return false;return Math.abs(y+Math.sin(ang)*vel*tt-G.ySafe(G.t0+r+tt))<G.gapHalf;}
 function put(G,u,v,t,la,spd,type,hue,st,lo,acc,flags){const B=G.buf;if(B.n>=B.cap)return -1;
  // Iso: positions and sprite orientation lie on the floor; the release opens a little steeper than
  // authored (the squashed arcs are flatter, so their bullets must part vertically faster).
  if(G.iso){u*=ISO_U;v*=ISO_V;la=Math.atan2(Math.sin(la)*1.25,Math.cos(la));if(lo!=null&&lo===lo)lo=Math.atan2(Math.sin(lo)*ISO_V,Math.cos(lo)*ISO_U);}
  const k=G.s,sx=G.sx,sy=G.sy,x=G.cx+sx*u*k,y=G.cy+sy*v*k;if(!(x===x&&y===y&&la===la)){G.off++;return -1;}
  const phi=G.phi,du=u-G.pu,dv=v-G.pv;let fx=x,fy=y;
  if(phi!==0)for(let q=1;q<=3;q++){const a=phi*q/3,c=Math.cos(a),s=Math.sin(a);fx=G.cx+sx*(G.pu+du*c-dv*s)*k;fy=G.cy+sy*(G.pv+du*s+dv*c)*k;if(q<3&&(out(fx,fy)||inBox(G,fx,fy))){G.off++;return -1;}}
  if(bad(G,x,y)||out(fx,fy)||inBox(G,fx,fy)){G.off++;return -1;}
  let ang=wa(G,la+(G.rfix?0:phi));const r=G.ts+G.td+G.rl,vel=clamp(n(spd)*G.vs,-G.vcap,G.vcap),ac=n(acc)*G.vs,rev=(flags|0)&F_REVERSE;
  // Safe lane: a release whose ray would cross the lane at the hero's column is left out; for the
  // whip (G.mirrorOK: links already fly up or down off their crest) it is mirrored instead.
  // fadeLane generators keep such a bullet in the silhouette and let it dissolve .35 s after release.
  let fade=false;if(!rev&&!G.noLane&&laneHit(G,fx,fy,ang,vel,r)){if(G.fadeLane){fade=true;G.lane++;}else{if(!G.mirrorOK){G.lane++;return -1;}ang=-ang;if(laneHit(G,fx,fy,ang,vel,r)){G.lane++;return -1;}G.flip++;}}
  const j=B.n++;B.x[j]=x;B.y[j]=y;B.t[j]=n(t);B.r[j]=Math.max(r,n(t)+.12);B.a[j]=ang;B.v[j]=vel;B.acc[j]=ac;B.vmin[j]=rev?-G.vcap*.9:0;B.ty[j]=G.mob?MOB_TY[type]:type;B.hu[j]=hue;B.st[j]=st;
  B.o[j]=wa(G,lo==null||!(lo===lo)?la:lo);B.fl[j]=rev?1:0;B.bo[j]=0;B.lf[j]=fade?B.r[j]+.35:G.life>0?G.life:0;
  B.qx[j]=G.cx+sx*G.pu*k;B.qy[j]=G.cy+sy*G.pv*k;B.qw[j]=phi!==0?G.w*sx*sy:0;B.q0[j]=G.ts;return j;}
 // Nominal width (along u) and height of each generator's silhouette, for the frame search.
 const DIM={blade:p=>p.cuts?[440,250]:p.split?[460,200]:p.curl?[440,230]:[510,230],whip:()=>[480,200],mirror:()=>[236,236,140],strings:()=>[452,240],
  coin:p=>p.v==='yoyo'?[360,220]:p.v==='gear'?[200,200]:p.v==='lamp'?[90,244]:[110,236],claw:()=>[300,240],jaw:()=>[300,214],wings:()=>[470,240],
  rings:p=>[300,180],crescent:()=>[390,250],sigil:p=>p.v==='eye'?[296,192]:[290,170],syringe:()=>[480,190]};
 // Afterimage cuts (l301: three parallel slashes, the last with its hilt) or one long diagonal
 // draw-cut (h103 iai). Each slash is a lens of NEEDLEs; the slashes part sideways and fan open.
 function slash(G,p){const K=p.split?1:(p.cuts||3),Ls=p.split?460:410,tilt=(p.split?22:14)*DEG,gap=p.split?0:66,th=p.split?17:12,hilt=7,per=Math.max(6,Math.floor((G.N-hilt)/K)),Td=p.split?.42:.6,dt=Td/K;
  const ca=Math.cos(tilt),sa=Math.sin(tilt);swing(G,0,0,0,0,Td,1);
  for(let k=0;k<K;k++){const off=(k-(K-1)/2)*gap,ou=-sa*off,ov=ca*off,hue=k%2?G.h1:G.h0,side=p.split?0:(k%2?1:-1);
   for(let i=0;i<per;i++){const q=i/(per-1),edge=i%2?1:-1,w=edge*th*Math.sin(PI*Math.min(1,.06+q*.94)),s=-Ls/2+Ls*q,u=ou+ca*s-sa*w,v=ov+sa*s+ca*w;
    const sd=side||edge,la=tilt+sd*(62-24*q)*DEG;put(G,u,v,k*dt+dt*q,la,74+44*q,i%5===2?T.RICE:T.NEEDLE,hue,k,tilt);}}
  // Hilt on the boss-side end of the last cut: pommel BIG, grip, ring guard (never a crossguard).
  const off=((K-1)/2)*gap,hu=-sa*off-ca*Ls/2,hv=ca*off-sa*Ls/2,at=(s,w,ty,hue,o)=>put(G,hu+ca*s-sa*w,hv+sa*s+ca*w,Td,tilt,58,ty,hue,6,o);
  at(-34,0,T.BIG,G.h1);at(-20,0,T.ORB,G.h0);for(let q=0;q<5;q++){const a=TAU*q/5;at(-6+10*Math.cos(a),10*Math.sin(a),T.DOT,G.h1,a);}}
 const GEN={
  // Sword: pommel (BIG), grip, ring guard, two NEEDLE edges converging to the tip around a hollow
  // blade with a spell-hue fuller. Traced hilt to tip, held raised, swung about the hilt; then its
  // bullets fly off the swing, faster toward the tip so the line opens. curl: shepherd's crook.
  blade(G,p){if(p.cuts||p.split)return slash(G,p);
   G.fadeLane=!p.curl;const L=p.curl?400:440,ph0=(p.swing??36)*DEG,a0=-(p.up??22)*DEG+(G.alt?ph0:0),phi=G.alt?-ph0:ph0,ca=Math.cos(a0),sa=Math.sin(a0),hu=-L/2*ca,hv=-L/2*sa,Td=.55,sg=phi>=0?1:-1,rel=a0+sg*58*DEG;
   swing(G,hu,hv,phi,.75,Td,L+34);
   const at=(s,w,t,ty,hue,st,o,spd)=>put(G,hu+ca*s-sa*w,hv+sa*s+ca*w,t,rel,spd,ty,hue,st,o);
   // Hilt: BIG pommel, RICE grip along the axis; curl: ring guard. The broad sword gets a crescent guard
   // cupping the blade root, its horns swept toward the tip (wider than the blade, never a straight bar).
   at(-34,0,0,T.BIG,G.h1,3,a0,60);at(-20,0,.03,T.RICE,G.h1,3,a0,60);at(-8,0,.04,T.RICE,G.h1,3,a0,60);
   if(p.curl)for(let q=0;q<6;q++){const a=TAU*q/6;at(8+15*Math.cos(a),15*Math.sin(a),.06,T.RICE,G.h1,4,a0+a+PI/2,60);}
   else for(let q=0;q<6;q++){const w=-80+32*q,s=6+20*(w/80)*(w/80);at(s,w,.06,T.RICE,G.h1,4,a0+Math.atan2(1,40*w/6400),60);}
   const rest=Math.max(8,G.N-8);
   if(p.curl){const hook=Math.round(rest*.3),staff=rest-hook,s1=L-46;
    for(let i=0;i<staff;i++){const q=i/(staff-1),s=22+(s1-22)*q;at(s,0,Td*q*.8,i%3?T.DOT:T.ORB,i%2?G.h1:G.h0,0,a0,64+100*s/L);}
    for(let i=0;i<hook;i++){const q=PI*1.15*i/(hook-1),s=s1+26*Math.sin(q),w=-sg*(26-26*Math.cos(q));at(s,w,Td*(.8+.2*i/hook),T.ORB,G.h0,1,a0+q,64+100*s/L);}
    return;}
   // Broad tapered blade: two NEEDLE edges laid along their own slope converging on the tip (the back
   // edge licks like a flame), a RICE fuller down the middle. All leave at one speed (+-15%), so the
   // blade flies as a blade.
   const E=Math.round(rest*.36),F=rest-2*E,hw=q=>64*(1-Math.pow(q,1.3))+4;
   for(let e=-1;e<=1;e+=2)for(let i=0;i<E;i++){const q=i/(E-1),s=26+(L-26)*q,fl=e<0?1+.16*Math.sin(q*TAU*2.5):1,w=e*hw(q)*fl,sl=-e*60*Math.sqrt(q+.01)/(L-26);at(s,w,Td*q,T.NEEDLE,G.h0,e>0?0:1,a0+Math.atan(sl),70+26*s/L);}
   for(let i=0;i<F;i++){const q=(i+.5)/F,s=44+(L*.78-44)*q;at(s,0,Td*q*.85,T.RICE,G.h1,2,a0,70+26*s/L);}},
  // Chain whip / flute line: a long tilted wave of alternating white and hue links from a BIG
  // handle, lashed out handle -> tip, held, cracked about the handle; every link flies off its crest.
  whip(G,p){G.fadeLane=true;const Lw=460,A=p.A??86,lam=p.lam??150,tilt=p.tilt??.16,Td=.7,u0=-Lw/2,v0=-tilt*Lw/2-6;
   swing(G,u0,v0,(G.alt?-1:1)*(p.crack??22)*DEG,.6,Td,Lw+20);
   put(G,u0-16,v0,0,PI,40,T.BIG,G.h1,3,0);put(G,u0-2,v0,0,PI,40,T.RICE,G.h0,3,0);
   // Linked chain: face-on links (two parallel RICE = an oval) alternate with edge-on links (one NEEDLE),
   // all laid along the chain's tangent on a decaying wave; a weighted tip (BIG + five spikes) ends it.
   const tip=6,notes=p.notes?Math.floor(G.N/9)*2:0,links=Math.max(6,Math.floor(Math.max(9,G.N-2-tip-notes)*2/3));
   const path=uu=>{const f=uu/Lw,env=Math.pow(f,.5)*.7+.3,w=TAU*(uu-18)/lam;G.pv_=v0+A*env*Math.sin(w)+tilt*uu;G.pd_=A*env*Math.cos(w)*TAU/lam+tilt;G.pc_=Math.sin(w)>=0?1:-1;};
   for(let j=0;j<links;j++){const f=(j+.5)/links,uu=18+(Lw-46)*f;path(uu);const v=G.pv_,ta=Math.atan2(G.pd_,1),la=Math.atan2(G.pc_*.2,1),sp=70+14*f;
    if(j%2===0){for(let sd=-1;sd<=1;sd+=2)put(G,u0+uu-Math.sin(ta)*5.5*sd,v+Math.cos(ta)*5.5*sd,Td*f,la,sp,T.RICE,G.h0,0,ta);}
    else put(G,u0+uu,v,Td*f,la,sp,T.NEEDLE,G.h1,0,ta);
    if(p.notes&&j%6===3)for(let q=1;q<=2;q++)put(G,u0+uu+6,v-8*q-3,Td*f,la,sp,q===2?T.STAR:T.RICE,G.h1,2,-PI/2);}
   const ue=Lw-14;path(ue);const ve=G.pv_,te=Math.atan2(G.pd_,1),le=Math.atan2(G.pc_*.2,1);put(G,u0+ue,ve,Td,le,84,T.BIG,G.h1,4,te);
   for(let q=0;q<5;q++){const a=te+q*TAU/5;put(G,u0+ue+Math.cos(a)*17,ve+Math.sin(a)*17,Td,le,84,T.NEEDLE,G.h0,5,a);}},
  // Cracked mirror: an irregular ring of RICE shards (each tilted off the tangent, so the frame reads as
  // broken glass, not a dashed line), five crack rows of NEEDLE shards from an off-centre impact out to
  // the frame (no two collinear, so never an X; drawn with a crack line) and a few chips flaking off.
  // Pivoting on its foot it tilts, then the whole pane drifts at the hero while it shatters outward
  // about the impact (coherent release). The frame (st >= 16) draws no trail line.
  mirror(G,p){const A=104,Bh=106,cv0=0,Td=.75,ix=-22,iy=-20,N=G.N;G.rfix=true;G.fadeLane=true;
   const nSh=N>=45?3:2,rim=Math.min(42,Math.round(N*.46)),crk=Math.max(5,N-rim-1-nSh*2),CR=[20,92,150,232,300],per=Math.max(1,Math.floor(crk/5));
   swing(G,0,cv0+Bh,(p.tilt??10)*DEG,.5,Td+.42,2*Bh+20);
   const go=(u,v,t,ty,hue,st,o)=>{coh(G,u,v,ix,iy,40,.3);put(G,u,v,t,G.fa,G.fs,ty,hue,st,o);};
   const R=q=>1+.07*Math.sin(3*q+1)+.05*Math.sin(7*q+.4);
   for(let i=0;i<rim;i++){const q=TAU*i/rim-PI/2,r=R(q)*(i%3===1?1.05:1);go(Math.cos(q)*A*r,cv0+Math.sin(q)*Bh*r,Td*i/rim,T.RICE,G.h0,16,Math.atan2(Math.cos(q)*Bh,-Math.sin(q)*A)+(i%2?.42:-.42));}
   go(ix,iy,Td,T.ORB,G.h1,17,0);
   for(let k=0;k<CR.length;k++){const a=CR[k]*DEG;let len=8;while(len<400){const x=(ix+Math.cos(a)*len)/A,y=(iy-cv0+Math.sin(a)*len)/Bh;if(x*x+y*y>=.9)break;len+=4;}
    for(let j=1;j<=per;j++){const q=j/(per+.25),b=a+(q>.5?(k%2?9:-9)*DEG:0);go(ix+Math.cos(b)*len*q,iy+Math.sin(b)*len*q,Td+.04*k+.22*j/per,T.NEEDLE,G.h1,1+k,b);}}
   for(let k=0;k<nSh;k++){const q=-.5+.42*k,rr=1.2,cu=Math.cos(q)*A*rr,cvv=cv0+Math.sin(q)*Bh*rr;
    for(let e=0;e<2;e++)go(cu+Math.cos(q)*9*e,cvv+Math.sin(q)*9*e,Td+.22,T.RICE,G.h0,18+k,q+(e?.5:-.3));}},
  // Puppet strings / roots / neurons: a control bar above the boss's hand (ORB) with long lines
  // fanned down to the floor across the field; the bar sways, the lines snap at 55% and both halves
  // recoil along the line. branch: forked side twigs.
  strings(G,p){const W=452,Hh=240,K=p.k||5,bw=120,Td=.8,twig=p.branch?Math.round(G.N*.2/K):0,bar=6,per=Math.max(5,Math.floor((G.N-bar)/K)-twig);
   swing(G,-W/2+bw/2,-Hh/2,(G.alt?-1:1)*(p.sway??12)*DEG,.6,Td+.03*K+.05,W+20);
   for(let i=0;i<bar;i++)put(G,-W/2+bw*i/(bar-1),-Hh/2,0,PI/2,46,T.ORB,i%2?G.h0:G.h1,7,0);
   for(let k=0;k<K;k++){const ax=-W/2+bw*(k+.5)/K,ay=-Hh/2+4,ex=-W/2+150+(W-150)*(k+1)/K,ey=Hh/2-((k*2)%3)*34,dx=ex-ax,dy=ey-ay,a=Math.atan2(dy,dx);
    for(let j=0;j<per;j++){const s=(j+1)/per,away=s>=.55?a:a+PI;put(G,ax+dx*s,ay+dy*s,Td*s+k*.03,away,40+150*Math.abs(s-.55),j===per-1?T.ORB:j%3===0?T.NEEDLE:T.RICE,k%2?G.h1:G.h0,k,a);}
    for(let q=0;q<twig;q++){const half=Math.max(1,Math.floor(twig/2)),sd=q<half?1:-1,s0=q<half?.45:.75,ii=q%half,ta=a+sd*36*DEG,rr=14+16*ii;
     put(G,ax+dx*s0+Math.cos(ta)*rr,ay+dy*s0+Math.sin(ta)*rr,Td*s0+.05,ta,56+20*ii,T.DOT,G.h1,8+(k%7),ta);}}},
  // Coins (white ORB rims that stand apart from a gold curtain, square hole of four hue RICE sides) stacked on a bulging arc, a yoyo pair on its
  // strings (hollow hubs), a toothed gear with three spokes, or a hollow signal-lamp housing. Coins
  // and gears spin in place, yoyos scissor on their strings; each disc then flies as one widening body.
  coin(G,p){const v=p.v||'coin',Td=.7;
   if(v==='yoyo'){const W=340,R=36,hub=6,str=Math.round(G.N*.2/2),m=Math.max(10,Math.floor(G.N/2)-str-hub),hu=-W/2,hv=0;
    for(let y=0;y<2;y++){const sd=y?1:-1,cu=W/2-R-2,cv=sd*80,la=Math.atan2(cv-hv,cu-hu),ca=Math.cos(la),sa=Math.sin(la),L=Math.hypot(cu-hu,cv-hv);
     swing(G,hu,hv,-sd*14*DEG,.55,Td,L+R);
     for(let i=0;i<m;i++){const q=TAU*i/m,vx=ca*170+Math.cos(q)*12,vy=sa*170+Math.sin(q)*12;put(G,cu+Math.cos(q)*R,cv+Math.sin(q)*R,Td*(.4+.6*i/m),Math.atan2(vy,vx),Math.hypot(vx,vy),i%2?T.ORB:T.DOT,G.h0,y,q+PI/2,-62,F_REVERSE);}
     for(let i=0;i<hub;i++){const q=TAU*i/hub;put(G,cu+Math.cos(q)*11,cv+Math.sin(q)*11,Td,la,170,T.DOT,G.h1,2+y,q+PI/2,-62,F_REVERSE);}
     for(let i=0;i<str;i++){const s=(i+1)/(str+1);put(G,hu+(cu-R*ca-hu)*s,hv+(cv-R*sa-hv)*s,Td*.4*s,la,170*s,T.DOT,G.h1,4+y,la,-62*s,F_REVERSE);}}
    return;}
   G.rfix=true;
   const fly=(u,v,cu,cv,la,spd,grow,phi)=>{const q=Math.atan2(v-cv,u-cu)+phi,vx=Math.cos(la)*spd+Math.cos(q)*grow,vy=Math.sin(la)*spd+Math.sin(q)*grow;G.fa=Math.atan2(vy,vx);G.fs=Math.hypot(vx,vy);};
   if(v==='gear'){const R=80,teeth=Math.round(G.N*.22),hub=7,spoke=9,m=Math.max(12,G.N-teeth-hub-spoke);swing(G,0,0,45*DEG,.6,Td,R+16);
    const P=(u,vv,t,ty,hue,st,o)=>{fly(u,vv,0,0,0,56,44,G.phi);put(G,u,vv,t,G.fa,G.fs,ty,hue,st,o);};
    for(let i=0;i<m;i++){const q=TAU*i/m;P(Math.cos(q)*R,Math.sin(q)*R,Td*i/m,i%2?T.ORB:T.DOT,G.h0,0,q+PI/2);}
    for(let i=0;i<teeth;i++){const q=TAU*(i+.5)/teeth;P(Math.cos(q)*(R+15),Math.sin(q)*(R+15),Td*i/teeth,T.RICE,G.h1,1,q);}
    for(let i=0;i<hub;i++){const q=TAU*i/hub;P(Math.cos(q)*20,Math.sin(q)*20,Td,T.DOT,G.h1,2,q+PI/2);}
    for(let i=0;i<spoke;i++){const a=(90+120*(i%3))*DEG,rr=30+(R-40)*(Math.floor(i/3)+.5)/3;P(Math.cos(a)*rr,Math.sin(a)*rr,Td,T.DOT,G.h0,3+(i%3),a);}
    return;}
   if(v==='lamp'){const W=80,Hh=240,lamp=3,ring=Math.max(6,Math.round(G.N*.17)),P=Math.max(12,G.N-lamp*(ring+1)),per=2*(W+Hh);swing(G,0,0,0,0,Td,1);
    for(let i=0;i<P;i++){const s=per*(i+.5)/P;let u,vv,o;if(s<W){u=-W/2+s;vv=-Hh/2;o=0;}else if(s<W+Hh){u=W/2;vv=-Hh/2+(s-W);o=PI/2;}else if(s<2*W+Hh){u=W/2-(s-W-Hh);vv=Hh/2;o=0;}else{u=-W/2;vv=Hh/2-(s-2*W-Hh);o=PI/2;}
     fly(u,vv,0,0,0,58,30,0);put(G,u,vv,Td*i/P,G.fa,G.fs,T.RICE,G.h0,0,o);}
    for(let k=0;k<lamp;k++){const cv=(k-1)*76,la=(k-1)*22*DEG;for(let i=0;i<=ring;i++){const q=TAU*i/ring,rr=i===ring?0:22;fly(Math.cos(q)*rr,cv+Math.sin(q)*rr,0,cv,la,80,i===ring?0:24,0);put(G,Math.cos(q)*rr,cv+Math.sin(q)*rr,Td*(.3+.7*k/lamp),G.fa,G.fs,i===ring?T.BIG:T.ORB,k===1?G.h0:G.h1,1+k,q);}}
    return;}
   const K=clamp(Math.round(G.N/22),3,4),dv=K===3?78:62,R=34,per=Math.floor(G.N/K),hole=4,m=Math.max(8,per-hole);
   for(let k=0;k<K;k++){const cv=(k-(K-1)/2)*dv,cu=22*(1-Math.pow(cv/(dv*1.6),2))-10,la=((k+.5)/K-.5)*60*DEG;swing(G,cu,cv,70*DEG,.6,Td,R);
    const P=(u,vv,t,ty,hue,st,o)=>{fly(u,vv,cu,cv,la,84,26,G.phi);put(G,u,vv,t,G.fa,G.fs,ty,hue,st,o);};
    for(let i=0;i<m;i++){const q=TAU*i/m;P(cu+Math.cos(q)*R,cv+Math.sin(q)*R,Td*(k+i/m)/K,i%2?T.ORB:T.DOT,G.h0,k,q+PI/2);}
    for(let i=0;i<hole;i++){const q=i*PI/2;P(cu+Math.cos(q)*9,cv+Math.sin(q)*9,Td*(k+1)/K,T.RICE,G.h1,4+k,q+PI/2);}}},
  // Claws: three (four) long curved rakes, ORB knuckle, RICE body, NEEDLE tips, scratched one after
  // another; the paw swipes them about a pivot behind, then they fly on along the stroke.
  claw(G,p){const K=G.band===3?4:3,per=Math.max(6,Math.floor(G.N/K)),Lc=290,up=p.up?-1:1,a=(p.slant||34)*DEG*up,ca=Math.cos(a),sa=Math.sin(a),gap=36,sag=20*up,Td=K*.14+.3;
   swing(G,-ca*(Lc/2+90),-sa*(Lc/2+90),(G.alt?up:-up)*16*DEG,.55,Td,Lc+90+gap*2);
   for(let k=0;k<K;k++){const off=(k-(K-1)/2)*gap;
    for(let j=0;j<per;j++){const s=j/(per-1),al=-Lc/2+Lc*s,pw=off+sag*4*s*(1-s),u=ca*al-sa*pw,v=sa*al+ca*pw,ty=j===0?T.ORB:s>.84?T.NEEDLE:T.RICE;
     put(G,u,v,k*.14+.3*s,a,50+75*s,ty,k%2?G.h1:G.h0,k,a+sag*.004*(1-2*s));}}},
  // Maw (with kitchen knives for teeth): upper and lower jaws open wide in front of the boss, a
  // NEEDLE knife every fourth tooth; held, then every tooth lunges at the bite line, vanishes there,
  // and the mouth spits a fan.
  jaw(G,p){const rx=150,ry=105,teeth=Math.round(G.N*.8),half=Math.floor(teeth/2),spit=Math.max(3,G.N-2*half),Td=.6,vy=70,fw=18;swing(G,0,0,0,0,Td,1);const rel=G.ts;
   for(let side=0;side<2;side++)for(let i=0;i<half;i++){const s=i/(half-1),q=(side?20+140*s:200+140*s)*DEG,u=Math.cos(q)*rx,v=Math.sin(q)*ry,dy=Math.abs(v);
    const knife=i%4===0,la=Math.atan2(side?-vy:vy,fw);G.life=rel+dy/(vy*G.vs)+.02;
    put(G,u,v,Td*(side?1-s:s),la,Math.hypot(vy,fw),knife?T.NEEDLE:T.RICE,knife?G.h1:G.h0,side,Math.atan2(-v,-u));}
   G.life=0;const bite=ry/(vy*G.vs)*.75;G.rl=bite;
   for(let i=0;i<spit;i++){const s=spit>1?i/(spit-1):.5,la=(-42+84*s)*DEG;put(G,rx*.15+Math.cos(la)*14,Math.sin(la)*14,Td,la,58+22*((i*5)%3)/2,i%2?T.ORB:T.DOT,G.h1,2,la);}},
  // Wings: from the shoulder (BIG + ORB) a wing arm runs out toward the hero; F feather lances hang off
  // it, steep near the body and flatter toward the wing tip. A lance is a short dense row of RICE laid
  // along its own direction (17-20 px apart, so it reads as one lance) ending in a crimson NEEDLE point
  // (single rows: doubled roots walled the safe lane in DREAM b3); every bullet of a lance shares its orientation (no barbs, no zigzag) and no trail
  // line joins them (st >= 16). Both wings flap toward the middle, then each lance flies along itself at
  // nearly one speed, so the wing spreads outward from the shoulder as a wing.
  wings(G,p){G.fadeLane=true;G.rfix=true;const W=430,u0=-W/2,Td=.75,M=Math.max(8,Math.floor((G.N-4)/2)),F=clamp(Math.round(M/7),2,6),per=Math.max(4,Math.floor(M/F)),K=per,P=0,arm=14*DEG,span=W-130;
   for(let side=-1;side<=1;side+=2){swing(G,u0,0,-side*14*DEG,.6,Td,W);coh(G,u0-10,side*6,u0,0,44,.26);put(G,u0-10,side*6,0,G.fa,G.fs,T.BIG,G.h1,30,0);coh(G,u0+4,side*10,u0,0,44,.26);put(G,u0+4,side*10,.02,G.fa,G.fs,T.ORB,G.h0,30,side*.6);
    for(let f=0;f<F;f++){const q=F>1?f/(F-1):1,a=40+span*q,ru=u0+Math.cos(arm)*a,rv=side*(10+Math.sin(arm)*a),th=(G.alt?18:22)+36*(1-q),la=side*th*DEG,cl=Math.cos(la),sl=Math.sin(la),Lf=94+22*q,st=16+(side>0?0:7)+f;
     for(let j=1;j<=K;j++){const s=j/K,d=Lf*s,tipj=j===K,pair=j<=P,t=Td*(.6*q+.4*s);
      for(let e=pair?-1:0;e<=(pair?1:0);e+=2){const bw=pair?e*(4.5*(1-(j-1)/Math.max(1,P))+3):0,u=ru+cl*d-sl*bw,v=rv+sl*d+cl*bw;
       coh(G,u,v,u0,0,44,.26);put(G,u,v,t,G.fa,G.fs,tipj?T.NEEDLE:T.RICE,tipj?G.h1:G.h0,st,la);if(!pair)break;}}}}},
  // Sound: concentric arcs (ORB/DOT nodes) pulse out from the boss on a beat (bell / choir / drum);
  // notes adds note heads on stems. Held, then every arc expands as a ring.
  rings(G,p){G.iso=true;const R=G.band===3?4:3,beat=p.beat||.26,r0=R===4?70:80,dr=R===4?42:50,u0=-(r0+dr*(R-1))/2-20,Td=(R-1)*beat+.12;swing(G,0,0,0,0,Td,1);
   const rsum=R*r0+dr*R*(R-1)/2;for(let k=0;k<R;k++){const rad=r0+dr*k,span=Math.min(62*DEG,Math.asin(Math.min(1,124/rad))),pk=Math.max(5,Math.floor(G.N*rad/rsum)),cnt=p.notes?Math.round(pk*.7):pk,ang=i=>-span+2*span*i/Math.max(1,cnt-1);
    for(let i=0;i<cnt;i++){const a=ang(i);put(G,u0+Math.cos(a)*rad,Math.sin(a)*rad,k*beat,a,70+4*k,i%3===1?T.ORB:T.RICE,k%2?G.h1:G.h0,k,a+PI/2);}
    if(p.notes){const heads=Math.floor((pk-cnt)/3),step=Math.max(1,Math.floor(cnt/Math.max(1,heads)));for(let q=0,i=Math.floor(step/2);q<heads;q++,i+=step){const a=ang(Math.min(cnt-1,i)),u=u0+Math.cos(a)*rad,v=Math.sin(a)*rad;
     for(let z=1;z<=3;z++)put(G,u+5,v-6*z,k*beat,a,64+4*k,z===3?T.STAR:T.DOT,G.h1,4+k,-PI/2);}}}},
  // Crescent blade (time crescent / harvest scythe): a large tilted crescent, RICE outer edge and
  // DOT inner edge, traced tip to tip, spun about its middle, then thrown forward as one body that
  // opens vertically. scythe: plus a long snath from the heel back toward the boss.
  crescent(G,p){const Ro=262,th=52,c0=120*DEG,sp=57*DEG,snath=p.scythe?Math.round(G.N*.2):0,No=Math.round((G.N-snath)*.56),Ni=G.N-snath-No,Td=.62;
   let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(let i=0;i<=16;i++){const a=c0-sp+2*sp*i/16,x=Ro*Math.cos(a),y=Ro*Math.sin(a);u0=Math.min(u0,x);u1=Math.max(u1,x);v0=Math.min(v0,y);v1=Math.max(v1,y);}
   const ou=-(u0+u1)/2,ov=-(v0+v1)/2;swing(G,0,0,(G.alt?24:-24)*DEG,.6,Td,Ro+(snath?60:0));G.rfix=true;
   const P=(u,v,t,ty,hue,st,o)=>{fin(G,u,v);put(G,u,v,t,Math.atan2(G.fv/240,1),ty===T.NEEDLE||ty===T.DOT?82:96,ty,hue,st,o);};
   for(let i=0;i<No;i++){const a=c0-sp+2*sp*i/(No-1);P(ou+Math.cos(a)*Ro,ov+Math.sin(a)*Ro,Td*i/(No-1),T.RICE,G.h0,0,a+PI/2);}
   for(let i=0;i<Ni;i++){const q=(i+.5)/Ni,a=c0-sp+2*sp*q,rr=Ro-th*Math.sin(PI*q);P(ou+Math.cos(a)*rr,ov+Math.sin(a)*rr,Td*q,T.NEEDLE,G.h1,1,a+PI/2);}
   const ha=c0+sp,hx=ou+Math.cos(ha)*Ro,hy=ov+Math.sin(ha)*Ro;for(let j=0;j<snath;j++){const s=(j+1)/snath;P(hx+210*s,hy+24*s,Td,j%3?T.DOT:T.ORB,G.h1,2,0);}},
  // Sigils drawn line by line: a hexagram (two interleaved triangles, the canon replacement for
  // every cross) with BIG vertices, turned a twelfth, or a sleepless eye (RICE lids, ORB iris, BIG
  // pupil). Released by self-similar expansion; the iris travels toward the hero.
  sigil(G,p){const Td=.9;
   if(p.v==='eye'){const hw=148,hh=94,cR=(hw*hw+hh*hh)/(2*hh),iris=10,lid=Math.max(12,G.N-iris-3);swing(G,0,0,0,0,Td,1);
    for(let i=0;i<lid;i++){const side=i%2?1:-1,s=Math.floor(i/2)/Math.max(1,Math.ceil(lid/2)-1),xx=-hw+2*hw*s,yy=side*(Math.sqrt(Math.max(0,cR*cR-xx*xx))-(cR-hh)),d=Math.hypot(xx,yy);
     put(G,xx,yy,Td*.6*Math.abs(s-.5)*2,Math.atan2(yy,xx),26+70*d/hw,T.RICE,G.h0,side>0?1:0,Math.atan2(side*-xx,cR));}
    const aim=unwa(G,Math.atan2(G.hy-G.cy,G.hx-G.cx));G.noLane=true;
    for(let i=0;i<iris;i++){const q=TAU*i/iris;put(G,Math.cos(q)*40,Math.sin(q)*40,Td,aim,92,T.ORB,G.h1,2,q);}
    put(G,0,0,Td,aim,92,T.BIG,G.h0,3,0);put(G,-14,0,Td,aim,92,T.DOT,G.h1,3,0);put(G,14,0,Td,aim,92,T.DOT,G.h1,3,0);G.noLane=false;return;}
   G.iso=true;const R=116;swing(G,0,0,0,0,Td,1);const per=Math.max(3,Math.floor((G.N-6)/6));
   for(let e=0;e<6;e++){const tri=e%2,k=Math.floor(e/2),a0=(tri?90:-90)+k*120,a1=a0+120,x0=Math.cos(a0*DEG)*R,y0=Math.sin(a0*DEG)*R,x1=Math.cos(a1*DEG)*R,y1=Math.sin(a1*DEG)*R;
    put(G,x0,y0,Td*e/6,a0*DEG,26+70,T.BIG,tri?G.h1:G.h0,tri,0);
    for(let j=1;j<=per;j++){const s=j/(per+1),u=x0+(x1-x0)*s,v=y0+(y1-y0)*s,d=Math.hypot(u,v);put(G,u,v,Td*(e+s)/6,Math.atan2(v,u),26+70*d/R,j%3?T.RICE:T.ORB,tri?G.h1:G.h0,tri,Math.atan2(y1-y0,x1-x0));}}},
  // Syringe: thumb plate (ORB), rod, hollow RICE barrel with hue liquid and graduation ticks, cone
  // and a long NEEDLE, laid tilted toward the hero (16-30 deg so it spans the band; or tilted 34 deg away when the hero stands close), held, then the
  // whole body thrusts along its axis (a positional sidestep).
  syringe(G,p){const L=470,Td=.6;let ax=unwa(G,Math.atan2(G.hy-G.cy,G.hx-G.cx));ax=wrap(ax);if(Math.abs(ax)>PI/2)ax=0;const sg=ax<0?-1:1;ax=G.alt?-sg*34*DEG:sg*clamp(Math.abs(ax),16*DEG,30*DEG);
   const ca=Math.cos(ax),sa=Math.sin(ax),sp=p.v==='spear'?150:140;swing(G,0,0,0,0,Td,1);G.noLane=true;
   const at=(s,w,t,ty,hue,st,o)=>put(G,ca*s-sa*w,sa*s+ca*w,t,ax,sp,ty,hue,st,o==null?ax:o);
   const N=G.N,need=Math.max(5,Math.round(N*.2)),liq=Math.max(3,Math.round(N*.12)),fixed=5+3+3+4+4,bar=Math.max(5,Math.floor((N-need-liq-fixed)/2));
   for(let i=0;i<5;i++)at(-L/2,(i-2)*16,0,T.ORB,G.h1,0,ax+PI/2);
   for(let i=0;i<3;i++)at(-L/2+14+20*i,0,.05,T.DOT,G.h0,1);
   for(let i=0;i<3;i++)at(-160,(i-1)*20,.1,T.DOT,G.h0,2,ax+PI/2);
   for(let e=-1;e<=1;e+=2)for(let i=0;i<bar;i++){const q=i/(bar-1);at(-160+230*q,e*30,.1+Td*.5*q,T.RICE,G.h0,e>0?3:4);}
   for(let i=0;i<4;i++)at(-120+40*i,-40,.2+.06*i,T.DOT,G.h1,5,ax+PI/2);
   for(let i=0;i<liq;i++){const q=(i+.5)/liq;at(-70+140*q,0,.3+.2*q,T.ORB,G.h1,6);}
   for(let e=-1;e<=1;e+=2)for(let i=0;i<2;i++)at(80+16*i,e*(20-9*i),Td*.65,T.RICE,G.h0,e>0?3:4,ax-e*.5);
   for(let i=0;i<need;i++){const q=i/(need-1);at(115+(L/2-115)*q,0,Td*(.7+.3*q),T.NEEDLE,G.h0,7);}
   G.noLane=false;}
 };
 // Boss -> weapon. Evidence is quoted from the bundle (assets/index-v31526.js) or the canon text.
 // c: the boss's own formation palette [edge/body hue, accent hue] (R2); without it the spell-derived default.
 const WG=(g,p,ev,c)=>Object.freeze({g,p:Object.freeze(p||{}),ev,c:c?Object.freeze(c):null});
 const WEAPON_ROWS=[
  ['dist00-boss','뿌리의 문지기',[WG('strings',{branch:true,k:6},'actor sprite demon_tree_root_seraph.png; signature "검은 뿌리 봉인"')],true,'body (roots)'],
  ['dist06-boss','발록 · 지옥의 문지기',[WG('blade',{},'deck flame-sword-cone; canon "발록이 검을 휘두르자"',['flame','ember']),WG('whip',{A:88,lam:130},'projectile balrog_chain_whip_wave.webp',['flame','ember'])],false,'flame sword + chain whip'],
  ['a11-boss','루시퍼 · 가면 벗은 초천사',[WG('wings',{six:true},'projectile lucifer_feather_lance.webp; deck wing-feather-pairs / six-wing',['violet','red'])],false,'feather wings (lances)'],
  ['b02-boss','나태에 잠식된 남자',[WG('syringe',{},'major memory_command_syringe.webp; deck falling-clutter')],true,'signature attack (syringe major)'],
  ['b03-boss','호텔 부매니저 · 레비아탄',[WG('mirror',{},'projectile envy_mirror_shard.webp; deck mirror-fan; zone 금이 간 안경',['glass','shard'])],false,'cracked mirror'],
  ['b04-boss','탐식의 귀 베엘제붑',[WG('jaw',{},'projectile gluttony_maw_wave.webp; phase "칼을 든 총주방장"; canon "식칼과 프라이팬을 마구 던졌다"')],false,'maw + kitchen knives'],
  ['b05-boss','붉은 하이힐의 서윤',[WG('strings',{k:5},'deck puppet-thread-pairs; rule 인형실 장력; phase "조종하는 인간 꼭두각시"')],false,'puppet threads'],
  ['b06-boss','총지배인 · 맘몬',[WG('coin',{v:'coin'},'projectile greed_coin_saw.webp; deck coin-ricochet')],false,'coins'],
  ['b06b-boss','소년이 된 총지배인 · 맘몬',[WG('coin',{v:'yoyo'},'deck yoyo-true-return; rule 요요 귀환 지뢰; phase "사탕과 요요의 가시 환영"')],false,'yoyo'],
  ['b07-boss','불을 지른 청소부 · 사탄',[WG('claw',{},'deck beast-triplet-arcs; rule 분노 돌진 상흔'),WG('claw',{up:true},'deck dash-trail-converge')],false,'claws (rake scars)'],
  ['b08-boss','백색 정장의 호텔 그룹 회장',[WG('sigil',{v:'hex'},'projectile wrath_pride_execution_sigil.webp; cross->hexagram canon (boss-form)')],true,'sigil (no weapon)'],
  ['b09-boss','사이보그 회장 · 생체 부트로더',[WG('sigil',{v:'hex'},'projectile wrath_pride_execution_sigil.webp; deck black-sun-echo')],true,'sigil (no weapon)'],
  ['u203-boss','컨트롤러 · 기억의 문',[WG('mirror',{},'sprite u2_mirror_priest.webp'),WG('syringe',{},'projectile memory_command_syringe.webp')],false,'mirror + syringe'],
  ['l301-boss','타락천사 기사',[WG('blade',{cuts:3},'projectile sleepless_six_sword_wave.webp; deck draw-slash-lanes / afterimage-blades; canon "검날"')],false,'sword (afterimage cuts)'],
  ['l303-boss','불면귀',[WG('sigil',{v:'eye'},'projectile sleepless_gaze_sigil.webp; deck sleepless-eyes')],true,'body (eye/gaze)'],
  ['l305-boss','고블린 추장',[WG('whip',{notes:true,A:80,lam:170},'deck flute-sine-wave'),WG('rings',{beat:.3},'deck drum-hop-bomb; rule 세 악기 대위법')],false,'flute + drum'],
  ['k103-boss','세이렌 모르',[WG('rings',{notes:true},'deck expanding-note-wave / rest-crescendo')],false,'voice (note rings)'],
  ['h103-boss','EGO 강탈 악몽왕',[WG('blade',{split:true},'deck white-draw-cut; zone midboss 환수검 모조체')],false,'drawn sword (iai cut)'],
  ['c102-boss','합일 세라핌 · 신경성가대',[WG('rings',{},'deck choir-pulse-bands / antiphonal-left-right')],false,'choir (sound rings)'],
  ['c103-boss','삼중자아 포식핵',[WG('crescent',{scythe:true},'deck harvest-composite; rule 이드·초자아·자아 수확 (scythe inferred from 수확)')],true,'harvest scythe (inferred)'],
  ['c104-boss','한시온 · 백색 목자',[WG('blade',{curl:true},'deck shepherd-six-sweep; phase 백색 목자 (crook)')],false,"shepherd's crook"],
  ['blue-executor','파란불 집행체',[WG('coin',{v:'lamp'},'deck traffic-signal-lanes; projectile murder_causality_road.webp')],true,'signal lamps (no weapon)'],
  ...['kair-great-01','kair-great-02','kair-great-03','kair-great-06'].map(id=>[id,id==='kair-great-03'?'아르벨리아, 유예의 수문장':'대수문장',[WG('crescent',{},'projectile kair_chrono_crescent.webp')],false,'time crescent']),
  ['kair-great-04','대수문장 04',[WG('coin',{v:'gear'},'deck gear-arcs / rotating-teeth; rule 톱니 대장간 교합')],false,'gear'],
  ['kair-great-05','대수문장 05',[WG('strings',{branch:true,k:5},'deck neuron-chain / branch-laser; rule 뉴런 시냅스 연쇄')],false,'neuron chain'],
 ];
 // Midbosses / unlisted: name keywords, then the family default (marked fallback).
 const WEAPON_NAME_RULES=[[/검천사|환수검|기사|칼/,'blade',{},'name: 검천사/환수검/기사'],[/거울|비교잔영/,'mirror',{},'name: 거울/비교잔영'],[/주사|병원|안정화/,'syringe',{},'name: 주사/병원'],[/포식|주방|아가리/,'jaw',{},'name: 포식/주방'],
  [/장부|금고|동전/,'coin',{v:'coin'},'name: 장부/금고'],[/실안개|꼭두각시|인형|무대감독|실/,'strings',{},'name: 꼭두각시/무대'],[/수확/,'crescent',{scythe:true},'name: 수확'],[/뿔악마|가시/,'claw',{},'name: 뿔/가시 (body)'],
  [/역십자가|제72문|교만|기둥|폐허핵|연산핵|배양좌/,'sigil',{v:'hex'},'name: sigil (no weapon)'],[/가면|시선|눈/,'sigil',{v:'eye'},'name: 가면/시선 (body)'],[/파란불|인과|목격자|당직|보관인|진술/,'coin',{v:'lamp'},'name: 파란불/인과 (no weapon)'],
  [/합창|성가|자비|검열/,'rings',{},'name: 합창/교정 (voice)'],[/칩|방화벽|코어|관리자|프레임|집행|신호/,'syringe',{},'name: 관리/코어 (controller syringe)']];
 const FAMILY_WEAPON=Object.freeze({envy:['mirror',{}],greed:['coin',{v:'coin'}],gluttony:['jaw',{}],rage:['blade',{}],obsession:['strings',{}],order:['sigil',{v:'hex'}],petal:['rings',{}],lucifer:['wings',{}]});
 const BOSS_WEAPONS={};for(const [id,name,list,fb,what] of WEAPON_ROWS)BOSS_WEAPONS[id]=Object.freeze({id,name,list:Object.freeze(list),fallback:fb,what,evidence:list.map(e=>e.ev).join(' | ')});
 Object.freeze(BOSS_WEAPONS);
 const MB_NAMES=Object.freeze({'mb-dist01':'보라검천사','mb-dist02':'늪의 뿔악마 군주','mb-dist03':'핏빛 수호로 추격자','mb-dist04':'첫 동료의 악마잔영','mb-dist05':'숨이 끊긴 전령의 그림자','mb-dist06':'소환진 검은기둥','mb-ep1a07':'무의 기억포식자','mb-ep1a08':'백의 안정화 감독','mb-ep1a09':'갈망의 주사실 감시핵','mb-ep1a10':'오만의 폐허핵','mb-ep1a11':'초천사의 웃는 가면','mb-ep1b01':'교만의 잔향 · 제72문','mb-ep1b02':'나태의 껍데기 파수','mb-ep1b03':'금이 간 비교잔영','mb-ep1b04':'폐기주방 감독','mb-ep1b05':'심장빛 무대감독','mb-ep1b06':'금고 장부감시자','mb-ep1b06b':'겨울숲 가시파수','mb-ep1b07':'호텔 화염기사','mb-ep1b08':'역십자가 시체경호체','mb-ep1b09':'생체부트로더 연산핵','u201-mid':'제4단계 전쟁관리자','u202-mid':'제8단계 자비 교정관','u203-mid':'기억의 문 수호 프레임','mb-hando01':'의존 신호 포식자','mb-hando02':'코어 운반 집행자','mb-hando03':'환수검 모조체','mb-murder01':'파란불 역주행 목격자','mb-murder02':'공실장부 당직감사','mb-murder03':'옥상 인과보관인','c101-mid':'칩 제단 방화벽','c103-mid':'삼중자아 수확기','c104-mid':'적그리스도 배양좌','u204-mid':'제12단계 기억 검열기','u205-mid':'제14단계 역전 관리자','u206-mid':'제17단계 중앙이주 코어','murder04-mid':'진술 봉쇄 인과핵','c105-mid':'ID 생체조 관리자','c106-mid':'기계재판 집행핵','mb-last302-v31231':'꼭두각시 실안개','a11-cosmic-v31318':'루시퍼'});
 const weaponCache=new Map();
 function weaponFor(a,family){if(!a)return null;const id=String(a.id??'');if(BOSS_WEAPONS[id])return BOSS_WEAPONS[id];
  const fam=FAMILY_SPELLS[family]?family:'petal',name=String(a.name??'')+' '+(MB_NAMES[id]??''),key=id+'|'+name+'|'+fam;let w=weaponCache.get(key);if(w)return w;
  if(/루시퍼/.test(name)&&!/잔향|가면/.test(name))w={id,name,list:BOSS_WEAPONS['a11-boss'].list,fallback:false,what:'feather wings',evidence:'name 루시퍼 -> a11-boss weapon'};
  else{for(const [re,g,p,ev] of WEAPON_NAME_RULES)if(re.test(name)){w={id,name,list:[WG(g,p,ev)],fallback:!/검천사|환수검|기사|칼|거울|주사|주방|장부|금고|꼭두각시|인형|수확/.test(name),what:g,evidence:ev};break;}}
  if(!w){const [g,p]=FAMILY_WEAPON[fam];w={id,name,list:[WG(g,p,'family default ('+fam+')')],fallback:true,what:g,evidence:'family default ('+fam+')'};}
  Object.freeze(w);if(weaponCache.size<256)weaponCache.set(key,w);return w;}
 function sigCount(ctx){const b=ctx.band-1,base=SIG.base[b]*(SIG.mode[ctx.mode]||1);return Math.round(clamp(base*n(ctx.sigScale,1),12,SIG.max));}
 function makeSig(list,o,emitEnd){if(!list||!list.length)return null;const beats=(o.sigBeats||SIG.beats.map(f=>f*emitEnd)).filter(t=>t+SIG.minLeft<=emitEnd+.01);
  return {list,order:n(o.sigOrder,n(o.index,0)*2)|0,beats,k:0,active:false,t0:0,cur:0,end:0,phrases:0,last:null,buf:sigBuf(SIG.cap),G:{},srch:{k:-1,i:0,best:0,bi:0,done:false,alts:1,total:0}};}
 // Frame search: three distances in front of the boss x five heights x vertical mirror x swing
 // direction (generators that read G.alt) x two scales; the frame keeping the most bullets wins
 // (full size and full extent preferred, centre >= 130 px in front of the boss). It is spread over the 1.3 s
 // pre-window (SIG.perStep candidates per step, so no frame hitches) and stops early once a
 // full-size frame keeps >= 95%; the phrase is then built once more against the hero's position.
 const FR_DY=[0,-1,1,-.5,.5],FR_S=[1,.85],FR_D=[-2,58,-52,118],ALT=new Set(['blade','whip','claw','crescent','strings','syringe','wings']),SEARCH_PER_STEP=3;
 function buildSig(G,gen,p){const B=G.buf;B.n=0;G.off=0;G.lane=0;G.flip=0;G.w=0;G.td=0;G.ts=SIG.armed;G.rl=0;G.phi=0;G.pu=0;G.pv=0;G.life=0;G.noLane=false;G.rfix=false;G.mirrorOK=false;G.fadeLane=false;G.iso=false;try{gen(G,p);}catch(err){B.n=0;}
  // The trace starts at once: the first bullet appears at t=0 (SIG.armed counts from there).
  let t0=1e9;for(let j=0;j<B.n;j++)if(B.t[j]<t0)t0=B.t[j];if(t0>0&&t0<1e9)for(let j=0;j<B.n;j++)B.t[j]-=t0;return B.n;}
 function frameAt(G,ctx,dim,c){const alts=c.alts,al=c.i%alts,r1=(c.i/alts)|0,sy=r1%2?1:-1,r2=(r1/2)|0,yi=r2%FR_DY.length,r3=(r2/FR_DY.length)|0,di=r3%FR_D.length,si=(r3/FR_D.length)|0;
  const mid=(FIELD.y0+FIELD.y1)/2,room=FIELD.y1-FIELD.y0-20,s=FR_S[si],slack=Math.max(0,(room-dim[1]*s)/2);
  // Anchored in front of the boss sprite (R2): the near edge sits FR_D past the sprite column (body box
  // half width + BOSS_BOX.col), so the boss shows through; dim[2] pushes small shapes toward mid-field.
  G.s=s;G.sy=sy;G.alt=al;G.cx=ctx.bx+G.sx*Math.max(130,n(G.bw,58)+BOSS_BOX.col+dim[0]*s/2+FR_D[di]+n(dim[2],0)*s);G.cy=mid+FR_DY[yi]*slack;return si*1e3+di*100+Math.abs(FR_DY[yi]);}
 function prepG(run,ctx,G,t0,e){const S=run.sig;G.buf=S.buf;G.sx=ctx.dir>1?-1:1;G.hx=ctx.hx;G.hy=ctx.hy;G.vs=ctx.vs;G.vcap=Math.min(SIG.vcap,ctx.vmax*1.05);G.N=sigCount(ctx);G.band=ctx.band;G.mob=!!ctx.mobile;G.t0=t0;G.ySafe=ctx.ySafeAt;
  G.gapHalf=(ctx.lane*Math.max(.85,ctx.gapMul))/2+4;G.excl2=(ctx.excl+12)*(ctx.excl+12);
  // The box grows with the boss's sprite scale (ctx.bscale; 1 in the headless suites): width and height
  // above the feet scale, the HP-bar margin under the feet does not.
  const bs=clamp(n(ctx.bscale,1),1,2.2),bw=BOSS_BOX.w*bs+BOSS_BOX.m,up=(BOSS_BOX.up+100)*bs-100+BOSS_BOX.m;
  // The sprite column is BOSS_BOX.col wider than the body box: formations keep that clear too (R2).
  const col=e&&NO_COL.has(e.g)?0:BOSS_BOX.col;// the puppet bar is held in the boss's hand; the scythe's snath reaches back to it
  G.bw=bw;G.bx0=ctx.bx-bw-col;G.bx1=ctx.bx+bw+col;G.by0=ctx.by-up;G.by1=ctx.by+BOSS_BOX.down+BOSS_BOX.m;
  // Weapon edge in white (reads apart from the curtain on every map); the accent is the first of
  // SIG_ACCENT the spell's curtain does not use, so the weapon never melts into a same-hue curtain.
  const pal=run.spell.hues;G.h0=H.white;G.h1=H.violet;for(const k of SIG_ACCENT)if(!pal.includes(k)&&k!==run.spell.circle){G.h1=H[k];break;}
  // A boss with its own palette (Balrog flame, Lucifer lances, Envy glass) uses it on every spell.
  const c=e&&e.c;if(c&&H[c[0]]!=null&&H[c[1]]!=null){G.h0=H[c[0]];G.h1=H[c[1]];}}
 // Evaluates up to `max` more candidates for the upcoming phrase k; returns true when done.
 function searchSig(run,ctx,max){const S=run.sig,C=S.srch,e=S.list[(S.order+S.k)%S.list.length],gen=GEN[e.g],G=S.G;if(!gen)return true;
  if(C.k!==S.k){C.k=S.k;C.i=0;C.best=-1e9;C.bi=0;C.done=false;C.alts=ALT.has(e.g)?2:1;C.total=FR_S.length*FR_D.length*FR_DY.length*2*C.alts;}
  if(C.done)return true;prepG(run,ctx,G,S.beats[S.k]??run.t,e);const dim=DIM[e.g](e.p);
  for(let q=0;q<max&&C.i<C.total;q++,C.i++){const tag=frameAt(G,ctx,dim,C),kept=buildSig(G,gen,e.p),si=tag>=1e3,di=((tag%1e3)/100)|0;
   let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const B=S.buf;for(let j=0;j<B.n;j++){const x=B.x[j],y=B.y[j];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
   const ext=B.n?Math.min(1,Math.hypot(x1-x0,y1-y0)/Math.hypot(dim[0],dim[1])):0,sc=kept*(si?1:1.12)*(di===3?.94:di===2?.96:di?.97:1)+.4*G.N*ext-(tag%100);if(sc>C.best){C.best=sc;C.bi=C.i;}if(!si&&kept>=G.N*.95){C.i=C.total;break;}}
  if(C.i>=C.total)C.done=true;S.buf.n=0;return C.done;}
 function startPhrase(run,ctx){const S=run.sig,e=S.list[(S.order+S.k)%S.list.length],B=S.buf,G=S.G,gen=GEN[e.g];
  if(!gen){S.k++;return;}
  if(S.srch.k!==S.k)searchSig(run,ctx,8);// no pre-window (e.g. a phrase at the very start): a short search
  const C=S.srch,dim=DIM[e.g](e.p);S.k++;prepG(run,ctx,G,run.t,e);const i=C.i;C.i=C.bi;frameAt(G,ctx,dim,C);C.i=i;buildSig(G,gen,e.p);
  let end=0,rel=1e9;for(let j=0;j<B.n;j++){B.ord[j]=j;if(B.r[j]>end)end=B.r[j];if(B.r[j]<rel)rel=B.r[j];}S.rel=B.n?rel:0;
  for(let i=1;i<B.n;i++){const v=B.ord[i],tv=B.t[v];let j=i-1;while(j>=0&&B.t[B.ord[j]]>tv){B.ord[j+1]=B.ord[j];j--;}B.ord[j+1]=v;}
  S.active=B.n>0;S.t0=run.t;S.cur=0;S.end=end+.5;S.phrases++;S.last={g:e.g,v:e.p.v||'',n:B.n,off:G.off,lane:G.lane,flip:G.flip,N:G.N,s:G.s,sy:G.sy,cx:Math.round(G.cx),cy:Math.round(G.cy)};}
 // Emits this frame's share of the active phrase into out (reused spec objects, no allocation).
 function sigStep(run,ctx,out){const S=run.sig;if(!S)return 0;
  if(!S.active&&S.k<S.beats.length&&run.t>=S.beats[S.k]){if(run.t>run.emitEnd-SIG.minLeft+.6)S.k=S.beats.length;else if(!ctx.soft)startPhrase(run,ctx);}
  const soon=S.k<S.beats.length&&S.beats[S.k]-run.t<SIG.pre&&S.beats[S.k]>=run.t-1;run.thin=S.active||soon;
  if(soon&&!S.active)searchSig(run,ctx,SEARCH_PER_STEP);
  // Squeeze: the formation has budget priority. While live + its unspawned rest would not fit,
  // non-aimed layers pause (at the budget their bullets would be refused anyway).
  const need=S.active?S.buf.n-S.cur:soon?sigCount(ctx):0;run.squeeze=need>0&&n(ctx.live,0)+need>ctx.budget;
  if(!S.active)return 0;const pt=run.t-S.t0,B=S.buf;let c=0;
  while(S.cur<B.n){const j=B.ord[S.cur];if(B.t[j]>pt)break;S.cur++;const b=B.specs[j];
   b.x=B.x[j];b.y=B.y[j];b.ang=B.o[j];b.spd=.001;b.type=B.ty[j];b.hue=B.hu[j];b.acc=0;b.vmin=0;b.vmax=1e4;b.om=0;b.amp=0;b.aT=1;b.aPh=0;b.gvx=0;b.gvy=0;b.gy=0;b.life=B.lf[j]>0?Math.max(.2,B.lf[j]-pt):16;
   b.swX=B.qx[j];b.swY=B.qy[j];b.swW=B.qw[j];b.sw0=Math.max(0,B.q0[j]-pt);b.stAt=Math.max(.12,B.r[j]-pt);b.stKind=3;b.stA=B.v[j];b.stB=B.a[j];b.stC=B.acc[j];b.stD=B.vmin[j];b.stE=Math.abs(B.v[j])*1.02+1;b.bounce=B.bo[j];b.flags=F_SIG|(B.fl[j]?F_REVERSE:0);b.layer=-1;b.pre=0;
   out.push(b);c++;}
  if(pt>S.end)S.active=false;return c;}

 // ---------------------------------------------------------------- spawn & sim (pure)
 // Weapon-formation bullets may use the band peak itself (ctx.peak, the hard cap); the curtain
 // stays under the native-shared budget, so a formation is drawn whole even on a busy screen.
 function spawn(pool,b,ctx){if(pool.live>=pool.cap||pool.live>=((b.flags&F_SIG)?ctx.peak:ctx.budget))return false;
  const dx=b.x-ctx.hx,dy=b.y-ctx.hy;if(dx*dx+dy*dy<ctx.excl*ctx.excl){ctx.excluded=(ctx.excluded|0)+1;return false;}
  const aimed=(b.flags&F_AIMED)!==0,vmax=aimed?ctx.vaim:ctx.vmax;
  const i=pool.live++;pool.spawned++;if(pool.live>pool.peak)pool.peak=pool.live;
  let spd=b.spd;if(b.stKind!==1&&!(b.flags&(F_REVERSE|F_FAST))&&b.type!==T.BIG)spd=clamp(spd,Math.min(spd,ctx.vmin),vmax);
  pool.x[i]=b.x;pool.y[i]=b.y;pool.px[i]=b.x;pool.py[i]=b.y;pool.ox[i]=b.x;pool.oy[i]=b.y;pool.ang[i]=b.ang;pool.spd[i]=spd;pool.acc[i]=b.acc;
  pool.vmin[i]=b.vmin;pool.vmax[i]=Math.min(b.vmax,b.flags&(F_REVERSE|F_FAST)?b.vmax:vmax*1.05);pool.om[i]=b.om;pool.amp[i]=b.amp;pool.aT[i]=b.aT||1;pool.aPh[i]=b.aPh;
  pool.gvx[i]=b.gvx;pool.gvy[i]=b.gvy;pool.gy[i]=b.gy;pool.age[i]=0;pool.life[i]=b.life;pool.stAt[i]=b.stAt;pool.stKind[i]=b.stKind;
  pool.stA[i]=b.stA;pool.stB[i]=b.stB;pool.stC[i]=b.stC;pool.stD[i]=b.stD;pool.stE[i]=b.stE;pool.type[i]=b.type;pool.hue[i]=ctx.remap?ctx.remap[b.hue]:b.hue;pool.flags[i]=b.flags;pool.bounce[i]=b.bounce;pool.swW[i]=b.swW||0;pool.swX[i]=b.swX||0;pool.swY[i]=b.swY||0;pool.sw0[i]=b.sw0||0;
  pool.vx[i]=Math.cos(b.ang)*spd+b.gvx;pool.vy[i]=Math.sin(b.ang)*spd+b.gvy;pool.dir[i]=Math.atan2(pool.vy[i],pool.vx[i]);
  if(ctx.spawnLog){const d=Math.sqrt(dx*dx+dy*dy);if(d<ctx.spawnLog.minDist)ctx.spawnLog.minDist=d;}
  return true;}
 const SPLIT_R=10;
 // Advance all bullets by h seconds of travel; stage effects push child specs into out.
 function stepPool(pool,h,ctx,out,removed){
  for(let i=pool.live-1;i>=0;i--){
   const age=pool.age[i]+h;pool.age[i]=age;pool.px[i]=pool.x[i];pool.py[i]=pool.y[i];
   // Weapon swing: a rigid turn about the weapon's pivot until release (exact rotation, no drift).
   let sw=false;if(pool.swW[i]!==0&&!(pool.flags[i]&F_STAGED)&&age>pool.sw0[i]){const lo=Math.max(pool.sw0[i],age-h),hi=Math.min(age,pool.stAt[i]);if(hi>lo){const d=pool.swW[i]*(hi-lo),c=Math.cos(d),s=Math.sin(d),rx=pool.x[i]-pool.swX[i],ry=pool.y[i]-pool.swY[i];pool.x[i]=pool.swX[i]+rx*c-ry*s;pool.y[i]=pool.swY[i]+rx*s+ry*c;pool.ang[i]+=d;sw=true;}}
   if(pool.stKind[i]>0&&!(pool.flags[i]&F_STAGED)&&age>=pool.stAt[i]){
    pool.flags[i]|=F_STAGED;const kind=pool.stKind[i];
    if(kind===1){if(ctx.auto||!(pool.flags[i]&F_AIMED))pool.ang[i]=ctx.dir+(pool.ang[i]-ctx.dir)*.35;else pool.ang[i]=Math.atan2(ctx.ay-pool.y[i],ctx.ax-pool.x[i]);pool.spd[i]=pool.stA[i];pool.acc[i]=0;pool.vmin[i]=0;}
    else if(kind===3){pool.ang[i]=pool.stB[i];pool.spd[i]=pool.stA[i];pool.acc[i]=pool.stC[i];pool.vmin[i]=pool.stD[i];pool.vmax[i]=pool.stE[i];}
    else if(kind===2){const x=pool.x[i],y=pool.y[i],cnt=pool.stA[i]|0,sp=pool.stB[i],ct=pool.stC[i]|0,ty=ct>>4,hu=ct&15,rose=pool.stD[i],center=pool.stE[i];
     const dx=x-ctx.hx,dy=y-ctx.hy;if(dx*dx+dy*dy>=ctx.excl*ctx.excl*(Number.isFinite(center)?1:.6)){
      const fan=Number.isFinite(center),base=fan?center:(ctx.seed%31)*.2+age;
      for(let j=0;j<cnt;j++){let a,v=sp;if(fan){a=center+(j-(cnt-1)/2)*(rose/Math.max(1,cnt-1));}else{a=base+j*TAU/cnt;if(rose>0)v=sp*(.45+.85*Math.abs(Math.cos(rose*(a-base))));}
       // Born on a 10 px ring around the burst point, so the ring opens as a ring (no swirl knot).
       out.push(spec(x+Math.cos(a)*SPLIT_R,y+Math.sin(a)*SPLIT_R,a,v,ty,hu,{life:12}));}}
     if(removed)removed.push(x,y,pool.hue[i],pool.type[i]);poolRemove(pool,i);continue;}
   }
   let spd=pool.spd[i]+pool.acc[i]*h;if(spd<pool.vmin[i])spd=pool.vmin[i];if(spd>pool.vmax[i])spd=pool.vmax[i];pool.spd[i]=spd;
   if(pool.om[i]!==0)pool.ang[i]+=pool.om[i]*h;
   if(pool.gy[i]!==0)pool.gvy[i]+=pool.gy[i]*h;
   const a=pool.ang[i],c=Math.cos(a),s=Math.sin(a);let vx=c*spd+pool.gvx[i],vy=s*spd+pool.gvy[i];
   if(pool.amp[i]!==0){const w=TAU/pool.aT[i],q=pool.amp[i]*w*Math.cos(w*age+pool.aPh[i]);vx+=-s*q;vy+=c*q;}
   const f=ctx.travel;let x=pool.x[i]+vx*h*f,y=pool.y[i]+vy*h*f;
   if(pool.bounce[i]>0&&((y<FIELD.y0&&vy<0)||(y>FIELD.y1&&vy>0))){pool.bounce[i]--;pool.ang[i]=-pool.ang[i];pool.gvy[i]=-pool.gvy[i];vy=-vy;y=y<FIELD.y0?2*FIELD.y0-y:2*FIELD.y1-y;}
   if(sw&&!(pool.flags[i]&F_STAGED)){vx=(x-pool.px[i])/h;vy=(y-pool.py[i])/h;}
   pool.x[i]=x;pool.y[i]=y;pool.vx[i]=vx;pool.vy[i]=vy;if(pool.type[i]===T.RICE||pool.type[i]===T.NEEDLE)pool.dir[i]=Math.atan2(vy,vx);if(sw&&!(pool.flags[i]&F_STAGED))pool.dir[i]=pool.ang[i];
   const back=(pool.flags[i]&F_REVERSE)&&spd<0&&age>1&&Math.abs(x-pool.ox[i])<40&&Math.abs(y-pool.oy[i])<40;
   if(back||!(x===x&&y===y)||age>pool.life[i]||x<CULL.x0||x>CULL.x1||y<CULL.y0||y>CULL.y1)poolRemove(pool,i);
  }}
 // Swept segment-vs-point distance for bullet i against (hx,hy).
 function sweptDist(pool,i,hx,hy){const ax=pool.px[i],ay=pool.py[i],dx=pool.x[i]-ax,dy=pool.y[i]-ay,L=dx*dx+dy*dy;let u=L>1e-9?((hx-ax)*dx+(hy-ay)*dy)/L:1;u=u<0?0:u>1?1:u;const qx=ax+dx*u-hx,qy=ay+dy*u-hy;return Math.sqrt(qx*qx+qy*qy);}

 // Builds the pure emission context for a frame. Shared by runtime and tests.
 function makeCtx(o){const M=MODES[modeKey(o.mode)],band=clamp(Math.floor(n(o.band,1)),1,3),mobile=!!o.mobile,auto=!!o.auto;
  const vs=M.vs*BAND_SPEED[band-1]*(o.midboss?.9:1)*(auto?.85:1);
  const setting=n(o.setting,1),gov=n(o.gov,1);
  const dens=clamp(setting*gov*M.dens*BAND_DENS[band-1]*reduceMul(mobile,auto)*(o.lite?.75:1)*(o.midboss?.5:1),.12,2.6);
  let budget=peakFor(o.mode,band,false)*reduceMul(mobile,auto)*clamp(setting,.4,mobile?1.15:1.3)*gov*(o.lite?.6:1);
  if(o.midboss)budget=Math.min(budget*.5,mobile?60:120);
  budget=Math.min(budget,o.liveCap??(mobile?LIVE_CAP.mobile:LIVE_CAP.pc));
  const seed=n(o.seed,0)>>>0,sigScale=reduceMul(mobile,auto)*clamp(setting,.6,1.3)*clamp(gov,.35,1)*(o.midboss?.5:1)*(o.lite?.8:1);
  return {mode:modeKey(o.mode),band,mobile,auto,vs,sigScale,vmin:M.vmin,vmax:M.vmax*(o.midboss?.9:1),vaim:M.vaim,dens,budget:Math.floor(budget),peak:Math.floor(budget),
   remap:o.remap||null,ring:n(o.ring,RING),bscale:1,excl:M.excl+(mobile?30:0),gapMul:band===3?.85:band===2?.93:1,lane:M.lane+(mobile?12:0)+(auto?20:0),seed,dir:PI,phi:PI,gapHalf:0,
   bx:1071,by:425,hx:520,hy:520,ax:520,ay:520,beatT:0,travel:1,excluded:0,ySafeAt:t=>safeY(t,seed),spawnLog:null};}
 function frameCtx(ctx,bx,by,hx,hy,ax,ay,t){ctx.bx=bx;ctx.by=by;ctx.hx=hx;ctx.hy=hy;ctx.ax=ax;ctx.ay=ay;ctx.dir=hx<bx?PI:0;
  const ys=safeY(t,ctx.seed),dist=Math.max(60,Math.hypot(hx-bx,ys-by));ctx.phi=Math.atan2(ys-by,hx-bx);ctx.gapHalf=Math.atan2(ctx.lane/2+6,dist)*Math.max(.85,ctx.gapMul);return ctx;}

 // Headless simulation helper for tests: same emitters, pool and stage code.
 function headless(o={}){const ctx=makeCtx(o),pool=createPool(o.mobile?POOL_CAP.mobile:POOL_CAP.pc),M=MODES[ctx.mode];
  const dur=ctx.mode==='DREAM'?10:12,decl=ctx.mode==='DREAM'?.8:1,emitEnd=dur-.6;
  const w=o.weapon?(BOSS_WEAPONS[o.weapon]??weaponFor({id:o.weapon,name:o.weaponName||''},o.family)):null;
  const run=makeRun(o.spell,{band:ctx.band,seed:ctx.seed,lite:o.lite,emitEnd,weapon:w?w.list:null,sigOrder:o.sigOrder,sigBeats:o.sigBeats,index:0});const out=[];ctx.spawnLog={minDist:1e9};
  let t=0;const bx=n(o.bx,1071),by=n(o.by,425);
  return {ctx,pool,run,duration:dur,declare:decl,
   step(h,hx,hy,ax,ay){t+=h;frameCtx(ctx,bx,by,hx,hy,ax??hx,ay??hy,run.t);out.length=0;ctx.live=pool.live;runStep(run,h,ctx,out);
    for(const b of out)spawn(pool,b,ctx);out.length=0;stepPool(pool,h,ctx,out,null);for(const b of out)spawn(pool,b,ctx);return t;},
   get time(){return t;},M};}

 // ---------------------------------------------------------------- runtime state
 const metrics={installs:0,rewraps:0,ticks:0,steps:0,spawned:0,hits:0,mercyBlocks:0,capped:0,absorbed:0,dCredits:0,perfectForwards:0,grazes:0,grazeRes:0,
  hudHidden:0,volleys:0,teleMin:9,volleyNMin:99,volleyNMax:0,cancels:0,fillerSpawned:0,filler:0,spells:0,bonuses:0,holds:0,holdReasons:{},errors:0,draws:0,drawImages:0,drawMs:0,bgMs:0,frameMs:16.7,gov:1,peak:0,live:0,sparks:0,oneShotGuards:0,dangerCalls:0,imminentHits:0,sigPhrases:0,sigLast:null};
 let enabledFlag=true,densityKey='normal',governorOn=true,gov=1,installed=false,lastError=null;
 const worlds=new WeakMap();let pool=null,poolMobile=null;
 const keys={shift:false};
 function fail(e){metrics.errors++;lastError=String(e&&e.stack||e).slice(0,400);if(metrics.errors<=3)root.console?.warn?.('RC240 danmaku layer',e);}
 (function initFlags(){try{const q=String(root.location?.search??'');const qa=/[?&]qa(=|&|$)/.test(q)||/[?&]qa\b/.test(q);
   if(/[?&]rc240=0/.test(q))enabledFlag=false;else if(qa&&!/[?&]rc240=1/.test(q))enabledFlag=false;if(/[?&]rc240gov=0/.test(q))governorOn=false;}catch(e){}
  try{const v=root.localStorage?.getItem?.(STORE_KEY);if(v&&DENSITY[v])densityKey=v;}catch(e){}})();

 const isMobile=()=>{try{return n(root.innerWidth,1280)<800||root.__HAPIL_COMBAT_RC47__?.mobile?.()===true;}catch(e){return false;}};
 const settingsNow=()=>{try{return root.__HAPIL_CONTROLS_V31329__?.binding?.settings?.current??{};}catch(e){return {};}};
 function fullAuto(s,set){try{const C=root.__HAPIL_CONTROLS_V31329__;const m=C?.effective?.(set);if(m)return m==='full';}catch(e){}return s?.combatModeV31329==='full';}
 function gmode(s){try{const m=root.__HAPIL_GRAMMAR_V31365__?.mode?.(s);if(m)return modeKey(m);}catch(e){}return modeKey(s?.gameModeV31346??(s?.hellModeV31322?'HELL':'STORY'));}
 function project(x,y){const B=root.__HAPIL_RC86_BRIDGE__;return B?.project?B.project(x,y):{x:640+27*(x-y),y:13.5*(x+y)};}
 function heart(s){try{const c=root.__HAPIL_COMBAT_V31333__?.core?.(s);if(c&&Number.isFinite(c.x)&&Number.isFinite(c.y))return c;}catch(e){}const p=project(s.x,s.y);return {x:p.x,y:p.y-42};}
 function owners(s){return (s.enemies??[]).filter(a=>a&&a.hp>0&&(a.boss||a.midboss)&&!a.visualOnly&&!a.friendly&&!a.rc88Part&&!a.echoChild&&!a.echoChildV31368&&!a.neutral)
  .sort((a,b)=>(b.boss?1:0)-(a.boss?1:0)||String(a.id).localeCompare(String(b.id)));}
 function muzzle(a){const p=project(a.x,a.y);return {x:p.x,y:p.y-(a.boss?100:60),fx:p.x,fy:p.y};}
 function gateOpen(s){if(!s||!(n(s.hp)>0)||!Number.isFinite(s.time))return false;if(s.practiceV31329||s.practicePatternV31365)return false;
  const L=root.__HAPIL_COMBAT_LIFECYCLE_RC231__;if(L?.enabled)return L.enabled(s)===true;return !s.paused&&n(s.timeStopUntil)<=s.time&&!['hub','village'].includes(s.zone);}
 function getPool(mobile){if(mobile){poolMobile??=createPool(POOL_CAP.mobile);return poolMobile;}pool??=createPool(POOL_CAP.pc);return pool;}
 function mem(s){let m=worlds.get(s);if(!m){m={zone:s.zone,mobile:isMobile(),run:null,ctx:null,ownerId:null,serial:null,key:null,spellIndex:0,family:'petal',spell:null,
   own:{serial:0,index:0,elapsed:0,stage:'active',rest:0,owner:null},hist:[],histAt:-1,acc:0,lastTime:s.time,hold:0,holdEnd:-1,released:true,winding:false,
   sparks:[],hits:[],mercyUntil:-1,dBucket:null,lastDodgeFwd:null,graze:{count:0,combo:0,rate:0,rateAt:0,budget:0,budgetAt:s.time},spellHit:false,dTime:0,
   dim:0,dimTarget:0,dimLevel:.42,circle:0,focus:0,near:0,banner:null,flash:null,hitAt:-1e9,ratio:1.4,owner:null,bossName:'',lite:false,midboss:false,emitting:false,lastPhase:null};
   m.pool=getPool(m.mobile);poolClear(m.pool);worlds.set(s,m);}return m;}
 // Optional STG feel module (assets/rc240/stg-feel.js). Every call is guarded.
 function hook(name){const F=root.__HAPIL_STG_FEEL_RC240__;return F&&typeof F[name]==='function'?F[name]:null;}
 function callHook(name,...args){const f=hook(name);if(!f)return undefined;try{return f.apply(root.__HAPIL_STG_FEEL_RC240__,args);}catch(e){fail(e);}return undefined;}
 function resetWorld(s,m,reason){poolClear(m.pool);m.sparks.length=0;m.run=null;m.tele=[];m.fillerOwner=null;m.feelOwner=null;m.serial=null;m.key=null;m.banner=null;m.dim=0;m.dimTarget=0;m.circle=0;m.zone=s.zone;m.hist.length=0;m.reason=reason;
  m.warnHoldUntil=-1;m.spawnGuardUntil=-1;m.lastEndAt=-1e9;m.fillerPauseUntil=n(s.time)+.8;callHook('reset',s,reason);}

 // ---------------------------------------------------------------- sparks (cancel / graze)
 function sparkCap(m,set){return set?.lowFx?SPARK_CAP.lowFx:m.mobile?SPARK_CAP.mobile:SPARK_CAP.pc;}
 function addSpark(m,set,x,y,vx,vy,hue,kind,born,life,scale){if(m.sparks.length>=sparkCap(m,set))return;m.sparks.push({x,y,vx,vy,hue,kind,born,life,scale});}
 function cancelAll(s,m,set,reason,fromX,fromY){const p=m.pool,cnt=p.live;if(!cnt)return 0;const ox=n(fromX,p.x[0]),oy=n(fromY,p.y[0]);
  const oc=reason!=='hit'?hook('onCancel'):null;
  for(let i=0;i<cnt;i++){const d=Math.hypot(p.x[i]-ox,p.y[i]-oy);addSpark(m,set,p.x[i],p.y[i],0,-50,p.hue[i],0,s.time+d/900,.55,p.type[i]===T.BIG?1.4:.8);
   if(oc)try{oc.call(root.__HAPIL_STG_FEEL_RC240__,s,m,p.x[i],p.y[i],p.type[i],p.hue[i],reason);}catch(e){fail(e);}}
  poolClear(p);metrics.cancels+=cnt;if(reason!=='hit'&&reason!=='wipe'&&cnt>8)float(s,'탄막 소거 +'+cnt,'#fff3b0',.9);return cnt;}
 function cancelNear(s,m,set,hx,hy,r,reason='hit'){const p=m.pool,oc=reason!=='hit'?hook('onCancel'):null;let c=0;for(let i=p.live-1;i>=0;i--){const dx=p.x[i]-hx,dy=p.y[i]-hy;if(dx*dx+dy*dy<r*r){addSpark(m,set,p.x[i],p.y[i],0,-50,p.hue[i],0,s.time+Math.sqrt(dx*dx+dy*dy)/900,.45,.7);
   if(oc)try{oc.call(root.__HAPIL_STG_FEEL_RC240__,s,m,p.x[i],p.y[i],p.type[i],p.hue[i],reason);}catch(e){fail(e);}poolRemove(p,i);c++;}}metrics.cancels+=c;return c;}
 // Cuts non-BIG bullets within hw of segment a-b (swap-remove). cb(x,y,type,hue) per cut. Returns the count.
 function cutSegment(s,ax,ay,bx,by,hw,maxN,cb){const m=s&&worlds.get(s);if(!m)return 0;const p=m.pool,set=settingsNow(),dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy,lim=Math.max(0,n(maxN,24)|0);let c=0;
  for(let i=p.live-1;i>=0&&c<lim;i--){const ty=p.type[i];if(ty===T.BIG)continue;let u=L>1e-9?((p.x[i]-ax)*dx+(p.y[i]-ay)*dy)/L:0;u=u<0?0:u>1?1:u;
   const qx=ax+dx*u-p.x[i],qy=ay+dy*u-p.y[i],r=hw+HIT[ty|0];if(qx*qx+qy*qy>r*r)continue;
   const x=p.x[i],y=p.y[i],hu=p.hue[i];addSpark(m,set,x,y,0,-60,hu,0,s.time,.4,.9);poolRemove(p,i);c++;if(cb)try{cb(x,y,ty,hu);}catch(e){fail(e);}}
  metrics.cancels+=c;return c;}
 function float(s,text,color,duration=.9){try{(s.floatTexts??=[]).push({id:s.fxSerial=(n(s.fxSerial)+1),x:s.x,y:s.y,born:s.time,duration,text,color,rc240:true});}catch(e){}}
 function addResonance(s,amount,reason){const before=clamp(n(s.resonance),0,100);let g=amount;try{const P=root.__HAPIL_SAMONG_POLICY_RC133__;if(P?.gain)g=n(P.gain(s,amount,reason),amount);}catch(e){}
  s.resonance=Math.min(100,before+Math.max(0,g));const d=s.resonance-before;try{root.__HAPIL_COMBAT_CORE_V31401__?.resource?.(s,s,'resonanceAwarded',d);}catch(e){}return d;}

 // ---------------------------------------------------------------- phase / spell lifecycle
 // Hard hold: encounter lock, telegraphed atomic/finale casts and (full spells)
 // boss lasers. Soft hold: other long major windows thin the curtain to 40% and
 // drop aimed layers instead of emptying the screen.
 function heldByCast(s,a,lite){const t=s.time;if(root.__HAPIL_RC95_NATIVE__?.locked?.(s)===true)return 'locked';
  if(Math.max(n(a.atomicCastUntil31210),n(a.finaleCastUntilV31334))>t)return 'cast';
  if(!lite){if(n(a.laserCastUntilV31332)>t)return 'laser';for(const c of s.bossLaserCastsV31330??[])if(c&&String(c.sourceId??c.ownerId??'')===String(a.id)&&n(c.fireAt)-.5<t&&n(c.endAt)>t)return 'laser';}
  if(Math.max(n(a.telekineticUntil),n(a.spatialRiftUntil),n(a.activePatternUntil))>t)return 'soft';
  try{const L=root.__HAPIL_COMBAT_LIFECYCLE_RC231__;if(L?.majorUntil&&L.majorUntil(s,a)-t>.9)return 'soft';}catch(e){}
  return '';}
 function phaseOf(s,m,a,dt){const midboss=!a.boss;
  if(!midboss){let p=null;try{p=root.__HAPIL_DANMAKU_RC129__?.phase?.(s);}catch(e){}
   if(p&&String(p.ownerId)===String(a.id))return {src:'rc129',serial:'r'+p.serial,index:p.index|0,band:clamp(p.band|0,1,3),stage:p.stage,elapsed:n(p.elapsed),remaining:n(p.remaining),duration:n(p.duration,12),bossName:p.bossName};}
  // Fallback own clock (midbosses, or RC129 absent): same Story 12 s / Dream 10 s rhythm.
  const o=m.own,dur=midboss?8:(gmode(s)==='DREAM'?10:12),rest=midboss?2:.65;if(o.owner!==a.id){o.owner=a.id;o.serial++;o.index=0;o.elapsed=0;o.stage='active';}
  if(o.stage==='active'){o.elapsed+=dt;if(o.elapsed>=dur){o.stage='rest';o.rest=rest;}}else{o.rest-=dt;if(o.rest<=0){o.stage='active';o.elapsed=0;o.serial++;o.index=(o.index+1)%3;}}
  const band=clamp(1+Math.floor((1-clamp(n(a.hp)/Math.max(1,n(a.maxHp,1)),0,1))*3),1,3);
  return {src:'own',serial:'o'+o.serial,index:o.index,band,stage:o.stage,elapsed:o.elapsed,remaining:Math.max(0,dur-o.elapsed),duration:dur,bossName:a.name};}

 function beginSpell(s,m,a,ph,set){const fam=familyOf(a),mid=!a.boss,pick=spellFor(fam,mid?1:ph.index),mode=gmode(s);
  const decl=mode==='DREAM'?.8:1,emitEnd=Math.max(1,ph.duration-.6-clamp(n(ph.elapsed),0,ph.duration));
  m.family=fam;m.spell=SPELL_BY_ID[pick.id];m.lite=(pick.lite&&ph.band<3)||mid;m.midboss=mid;m.ownerId=a.id;m.serial=ph.serial;m.spellIndex=ph.index;m.bossName=String(a.name??'보스');
  const seed=hash(a.id,ph.serial,s.zone);
  const wpn=weaponFor(a,fam);m.weapon=wpn;m.sigSeen=0;
  m.run=makeRun(pick.id,{band:ph.band,seed,lite:m.lite,midboss:mid,emitEnd,weapon:wpn?wpn.list:null,index:ph.index});m.runBand=ph.band;m.decl=decl;m.declLeft=Math.max(0,decl-n(ph.elapsed));m.declOverlap=s.time-n(m.lastEndAt,-1e9)<8;m.spellHit=false;m.dTime=0;m.hold=0;m.winding=false;m.released=true;
  m.dimLevel=FAMILY_DIM[fam]??.42;m.dimTarget=1;metrics.spells++;
  if(!mid){m.banner={name:m.spell.name,boss:m.bossName,index:ph.index,born:s.time,hue:(REMAP[fam]??null)?.[H[m.spell.circle]]??(H[m.spell.circle]??H.violet),result:null,resultAt:0,bonus:8+2*(ph.band-1),remaining:ph.remaining,duration:ph.duration,lite:m.lite};
   flash(s,m,set,.18,.25);}
  else m.banner=null;}
 function endSpell(s,m,set,reason){const had=m.run;if(!had)return;
  const big=m.banner,capture=reason==='spell-end'&&!m.spellHit&&m.dTime<=2;let result=null;
  if(reason==='spell-end')result=capture?'capture':'fail';
  cancelAll(s,m,set,capture?'capture':reason,m.lastMuzzle?.x,m.lastMuzzle?.y);
  if(big&&reason==='spell-end'){if(capture){const auto=fullAuto(s,set);const bonus=Math.max(1,Math.round(big.bonus*(1-.75*clamp(n(big.elapsedAtEnd,big.duration)/big.duration,0,1))*(auto?.5:1)));
    const d=addResonance(s,bonus,'spell');big.result='capture';big.award=d;metrics.bonuses++;float(s,'스펠 보너스 +'+Math.round(d),'#ffe59a',1.2);flash(s,m,set,.25,.3);}
   else big.result='fail';big.resultAt=s.time;}
  else if(big)big.result=null;
  callHook('onSpellEnd',s,{result,reason,spellId:had.spell.id,ownerId:m.ownerId,midboss:!!m.midboss,index:m.spellIndex});
  m.run=null;m.dimTarget=0;m.lastEndAt=reason==='spell-end'||reason==='serial'?s.time:-1e9;}
 function flash(s,m,set,peak,dur){if(set?.reducedFlash)return;if(m.flash&&s.time-m.flash.at<1)return;m.flash={at:s.time,peak:Math.min(peak,set?.lowFx?.15:m.mobile?.2:.25),dur};}

 // ---------------------------------------------------------------- collision / damage
 function packet(s,a,amount){const id=a?String(a.id):'rc240';return {id:'rc240-'+(s.fxSerial=n(s.fxSerial)+1),sourceId:a?.id,boss:true,born:s.time,damage:amount,rc240Danmaku:true,
  heartContactV31336:{target:'__host',time:s.time,heart:false},damageContactIdRC25:'rc240:'+id};}
 function dActive(s){try{const C=root.__HAPIL_CHANNEL_V31364__??root.__HAPIL_DEFENSE_V31356__;if(C?.active)return C.active(s,s)===true;}catch(e){}return s.channelDActiveV31364===true;}
 function onContact(s,m,set,i,owner){const p=m.pool,t=s.time,M=MODES[gmode(s)],auto=fullAuto(s,set),hx=m.hx,hy=m.hy;
  if(t<m.mercyUntil){metrics.mercyBlocks++;return;}
  const arena=root.__HAPIL_NATIVE_ARENA_RC138__,ow=owner?{x:owner.x,y:owner.y}:{x:s.x+3,y:s.y};
  if(n(s.invulnerableUntil)>t){// blink / EGO: pass through; forward the first contact of a blink once (native perfect dodge).
   if(t-n(s.lastDodgeAt,-99)<=.52&&m.lastDodgeFwd!==s.lastDodgeAt){m.lastDodgeFwd=s.lastDodgeAt;metrics.perfectForwards++;try{arena?.bodyDamage?.(s,1,ow.x,ow.y,packet(s,owner,1));}catch(e){fail(e);}}
   return;}
  if(dActive(s)){// D channel: absorb; credit at most once per second via a bucketed id.
   const bucket=Math.floor(t);addSpark(m,set,p.x[i],p.y[i],0,-40,H.white,0,t,.35,.8);poolRemove(p,i);metrics.absorbed++;
   if(m.dBucket!==bucket){m.dBucket=bucket;const C=root.__HAPIL_CHANNEL_V31364__??root.__HAPIL_DEFENSE_V31356__;
    try{if(C?.blockDamage?.(s,s,{id:'rc240|'+String(owner?.id??'')+'|'+bucket,sourceId:owner?.id,born:bucket,damage:10,rc240Danmaku:true},10))metrics.dCredits++;}catch(e){fail(e);}}
   return;}
  // Real hit.
  const maxHp=Math.max(1,n(s.maxHp,100)),before=n(s.hp);let loss=M.dmg*maxHp*(auto?.75:1)*(p.type[i]===T.BIG?1.25:1);
  const win=m.hits;while(win.length&&t-win[0].t>4)win.shift();const used=win.reduce((a,b)=>a+b.loss,0),cap=M.cap*maxHp;
  if(used+loss>cap){loss=Math.max(0,cap-used);metrics.capped++;}
  if(before>.25*maxHp)loss=Math.min(loss,Math.max(0,before-1)*.8);
  m.mercyUntil=t+M.mercy+(auto?.3:0);m.spellHit=true;m.hitAt=t;m.graze.combo=0;callHook('onHit',s);
  cancelNear(s,m,set,hx,hy,M.clear*(auto?1.5:1));
  if(loss>=.5){const amount=Math.max(1,Math.round(loss/m.ratio));let ok=false;
   try{ok=arena?.bodyDamage?.(s,amount,ow.x,ow.y,packet(s,owner,amount));}catch(e){fail(e);}
   const real=before-n(s.hp);if(real>0){win.push({t,loss:real});if(real<before&&amount>0)m.ratio=clamp(m.ratio*.7+(real/amount)*.3,.5,4);}
   if(before>.25*maxHp&&!(n(s.hp)>0)){s.hp=1;metrics.oneShotGuards++;}
   if(ok||real>0)metrics.hits++;}
  else metrics.hits++;
  if(!set?.reducedFlash)flash(s,m,set,.12,.2);}
 function graze(s,m,set,i,owner){const g=m.graze,t=s.time;if(t-g.rateAt>=1){g.rateAt=t;g.rate=0;}if(g.rate>=20)return;g.rate++;
  m.pool.flags[i]|=F_GRAZED;g.count++;g.combo++;metrics.grazes++;callHook('onGraze',s,m.pool.x[i],m.pool.y[i]);
  const k=set?.lowFx?1:m.mobile?2:3;for(let j=0;j<k;j++){const a=Math.atan2(m.pool.y[i]-m.hy,m.pool.x[i]-m.hx)+(j-(k-1)/2)*.6,v=80+30*j;addSpark(m,set,m.hx,m.hy,Math.cos(a)*v,Math.sin(a)*v,H.white,1,t,.22,1);}
  if(t-g.budgetAt>=10){g.budgetAt=t;g.budget=0;}
  if(g.combo%10===0&&g.budget<6){g.budget++;metrics.grazeRes+=addResonance(s,1,'graze');}}

 // ---------------------------------------------------------------- simulation tick
 const scratch=[],removedScratch=[];
 // Boss warning window from the STG feel module: warnUntil(s) when it offers one (no allocation),
 // else its state() polled at most every .25 s. m.warnEnd = warning end + .1 s, m.warnDeclAt = start + 1 s.
 function warnPoll(s,m){const t=s.time;
  if(hook('warnUntil')){const v=n(callHook('warnUntil',s),-1),act=hook('warningActive')?callHook('warningActive',s)===true:v>t;
   if(act&&v>0){m.warnEnd=v+.1;if(!(n(m.warnDeclAt,-1)>=v-1.25))m.warnDeclAt=v-1.2;}else if(!(n(m.warnEnd,-1)>t))m.warnEnd=-1;return;}
  if(!hook('state'))return;if(t-n(m.warnPollAt,-9)<.25&&t>=n(m.warnPollAt,-9))return;m.warnPollAt=t;
  const st=callHook('state',s),w=st&&st.warn;if(w&&Number.isFinite(w.at)){m.warnEnd=w.at+Math.max(0,n(w.dur,0))+.1;m.warnDeclAt=w.at+1;}else if(!(n(m.warnEnd,-1)>t)){m.warnEnd=-1;}}
 // Second-form transformation (boss-form module): no new spell is declared under its white-out.
 function formBusy(s,a){try{const B=root.__HAPIL_BOSS_FORM_RC240__;if(!B)return false;if(typeof B.transforming==='function')return B.transforming(s)===true;const f=B.form?.(s,a.id);return !!(f&&f.transforming);}catch(e){return false;}}
 function simTick(s,dt){
  if(!enabledFlag||!s)return;const m=mem(s),set=settingsNow();
  if(m.zone!==s.zone){resetWorld(s,m,'zone');}
  if(!(dt>0))return;
  if(!(n(s.hp)>0)||s.practiceV31329||s.practicePatternV31365||['hub','village'].includes(s.zone)){if(m.pool.live||m.run||!m.gateReset){resetWorld(s,m,'gate');m.gateReset=true;}return;}
  m.gateReset=false;
  if(n(s.timeStopUntil)>s.time)return;// frozen: time stop
  if(!gateOpen(s))return;// paused / locked / guest: freeze
  metrics.ticks++;
  const mobile=m.mobile,lowFx=!!set.lowFx;
  // Owner & phase.
  const list=owners(s),a=list[0]??null;
  if(m.ownerId!=null&&(!a||String(a.id)!==String(m.ownerId))){if(m.run)endSpell(s,m,set,'owner');m.ownerId=null;m.serial=null;if(!a)m.banner=null;}// boss dead or gone: the card goes at once
  if(!a&&m.pool.live&&m.fillerOwner!=null)cancelAll(s,m,set,'owner',m.lastMuzzle?.x,m.lastMuzzle?.y);
  if(!a){m.tele=[];m.fillerOwner=null;}
  if(a&&String(m.feelOwner)!==String(a.id)){m.feelOwner=a.id;callHook('onOwner',s,m,a);}
  let ph=null;if(a)ph=phaseOf(s,m,a,dt);
  // Beat order: the spell may be declared 1 s into the boss warning (m.warnHoldUntil, set by the
  // STG feel module), but nothing spawns (spell, formation, volley) until the warning has cleared.
  // The warning is read from the feel module itself, so a world reset cannot drop the hold.
  warnPoll(s,m);const warnHold=s.time<Math.max(n(m.warnHoldUntil,-1),n(m.warnDeclAt,-1)),spawnHold=s.time<n(m.warnEnd,-1);
  if(ph&&ph.serial!==m.serial&&m.run)endSpell(s,m,set,m.lastPhase?.stage==='active'||m.lastPhase?.stage==='draining'?'spell-end':'serial');
  // The curtain keeps drifting through RC129's drain (the boss finishing its cast) and is
  // cancelled together with RC129's own clear when the rest begins.
  if(ph&&ph.stage==='rest'&&m.run){if(m.banner)m.banner.elapsedAtEnd=m.lastPhase?.elapsed;endSpell(s,m,set,'spell-end');m.serial=ph.serial;}
  if(ph&&ph.stage==='active'&&ph.serial!==m.serial&&!warnHold&&!formBusy(s,a))beginSpell(s,m,a,ph,set);
  if(ph&&m.banner){m.banner.remaining=ph.remaining;m.banner.elapsedAtEnd=ph.elapsed;}
  m.lastPhase=ph;m.owner=a;
  // Frame constants.
  const H0=heart(s);m.hx=H0.x;m.hy=H0.y;
  if(s.time-m.histAt>=.05){m.hist.push({t:s.time,x:H0.x,y:H0.y});m.histAt=s.time;while(m.hist.length>16)m.hist.shift();}
  const past=m.hist.find(h=>h.t>=s.time-.5)??m.hist[0]??{x:H0.x,y:H0.y};
  let travel=1;try{travel=n(root.__HAPIL_SAMONG_RC91__?.incomingFactor?.(s),1);}catch(e){}travel=clamp(travel,.25,2);
  const auto=fullAuto(s,set),mode=gmode(s);
  const native=(s.hostileProjectiles??[]).reduce((c,q)=>c+(q&&n(q.damage)>0&&!q.friendly&&!q.reflected&&!q.visualOnly?1:0),0);
  const rank=clamp(n(callHook('rank',s),1),1,1.2);
  if(m.run){const key=[mode,m.runBand,mobile,auto,densityKey,lowFx,m.lite,m.midboss,Math.round(gov*20),rank].join('|');
   if(!m.ctx||m.ctxKey!==key||m.ctx.seed!==m.run.seed){m.ctx=makeCtx({remap:REMAP[m.family]||null,mode,band:m.runBand,mobile,auto,setting:DENSITY[densityKey]*rank,gov,lite:m.lite&&!m.midboss,midboss:m.midboss,seed:m.run.seed,liveCap:lowFx?LIVE_CAP.lowFx:mobile?LIVE_CAP.mobile:LIVE_CAP.pc});m.ctxKey=key;}}
  const ctx=m.ctx??makeCtx({mode,band:1,mobile,auto});m.ctx=ctx;ctx.travel=travel;
  // Sprite scale of the boss (dist06 balrog 1.32): its body box for formations and curtain thinning.
  m.bscale=a?Math.pow(clamp(n(a.scale,1),1,1.6),1.6):1;ctx.bscale=m.bscale;
  // Volley stream: fast telegraphed aimed shots between spells and through declaration gaps.
  let fctx=null,fillerOn=false;
  if(a){const band=ph?.band??1,fam=familyOf(a);
   if(String(m.fillerOwner)!==String(a.id)){m.fillerOwner=a.id;m.tele=[];m.vNext=s.time+.6;m.vK=0;}
   const fkey=[mode,band,mobile,auto,densityKey,lowFx,!a.boss,fam,Math.round(gov*20),rank].join('|');
   if(!m.fctx||m.fctxKey!==fkey){m.fctx=makeCtx({remap:REMAP[fam]||null,mode,band,mobile,auto,setting:DENSITY[densityKey]*rank,gov,midboss:!a.boss,seed:hash(a.id,'volley'),liveCap:lowFx?LIVE_CAP.lowFx:mobile?LIVE_CAP.mobile:LIVE_CAP.pc});m.fctxKey=fkey;}
   fctx=m.fctx;fctx.travel=travel;
   const tail=!!m.run&&!m.midboss&&!!ph&&ph.serial===m.serial&&(ph.stage==='draining'||(ph.stage==='active'&&n(ph.remaining,9)<=BRIDGE.lead));
   const gap=!m.run||m.declLeft>0,why=(gap||tail)?heldByCast(s,a,true):'';
   fillerOn=(gap||tail)&&!m.winding&&why!=='locked'&&s.time>=m.mercyUntil&&s.time>=n(m.fillerPauseUntil,-1)&&!warnHold&&!spawnHold;
   m.bridgeTail=tail;m.volleyQuiet=why==='cast';}
  if(!fillerOn&&m.tele?.length&&(s.time<m.mercyUntil||!a)){m.tele.length=0;m.bridgeSerial=null;}// a dropped bridge may be queued again
  // A volley telegraphed in the declaration gap that the spell start cut off would otherwise sit frozen
  // on screen (an aim line that never fires) for the whole spell: drop it (bridge volleys keep theirs).
  else if(!fillerOn&&m.tele?.length&&m.run&&!m.bridgeTail&&!(m.declLeft>0))m.tele.length=0;
  const guard=s.time<n(m.spawnGuardUntil,-1);
  const mz=a?muzzle(a):m.lastMuzzle??{x:1071,y:425};m.lastMuzzle=mz;
  // Hold during major casts / locks / lasers; resume .4 s later; long hold winds the spell down.
  let held=false;ctx.soft=false;if(a&&m.run){const why=heldByCast(s,a,m.lite);if(why)metrics.holdReasons[why]=(metrics.holdReasons[why]|0)+1;
   if(why&&why!=='locked'&&m.hold>=1.2){ctx.soft=true;m.softEnd=s.time;m.holdEnd=-9;}
   else if(why==='soft'){ctx.soft=true;m.softEnd=s.time;}else if(why){held=true;m.hold+=dt;m.holdEnd=s.time;metrics.holds++;if(why==='locked'&&m.hold>4)m.winding=true;}else if(s.time-m.holdEnd<.4)held=true;else{m.hold=0;m.holdEnd=-9;if(s.time-n(m.softEnd,-9)<.4)ctx.soft=true;}}
  if(dActive(s))m.dTime+=dt;
  // Fixed 1/60 s substeps.
  m.acc=Math.min(m.acc+dt,3/60);const h=1/60;let steps=0;
  while(m.acc>=h-1e-9){m.acc-=h;steps++;metrics.steps++;
   frameCtx(ctx,mz.x,mz.y,H0.x,H0.y,past.x,past.y,m.run?m.run.t:0);
   const sharedCap=Math.max(ctx.peak*.85,ctx.peak-1.5*native);ctx.budget=Math.floor(Math.min(ctx.peak,sharedCap));
   const baseExcl=ctx.excl;if(guard)ctx.excl=Math.max(baseExcl,160);
   scratch.length=0;let ectx=ctx;
   const inDecl=m.run&&m.declLeft>0;if(inDecl)m.declLeft-=h;ctx.live=m.pool.live;if(m.run&&(!inDecl||m.declOverlap||m.decl-m.declLeft>BRIDGE.freshDecl)&&!held&&!m.winding&&!warnHold&&!spawnHold){runStep(m.run,h,ctx,scratch);const S=m.run.sig;if(S&&S.phrases>(m.sigSeen|0)){metrics.sigPhrases+=S.phrases-(m.sigSeen|0);m.sigSeen=S.phrases;metrics.sigLast=S.last?S.last.g:null;}}
   if(fillerOn&&fctx){const st=s.time;frameCtx(fctx,mz.x,mz.y,H0.x,H0.y,past.x,past.y,0);const fe=fctx.excl;if(guard)fctx.excl=Math.max(fe,160);
    fctx.budget=Math.floor(Math.min(fctx.peak,Math.max(fctx.peak*.85,fctx.peak-1.5*native)));
    const bridge=(m.bridgeTail||(!m.run&&st-n(m.lastEndAt,-1e9)<.25))&&m.bridgeSerial!==m.serial,tcap=bridge?(m.volleyQuiet?2:BRIDGE.n):m.volleyQuiet?1:2;if(bridge)m.bridgeSerial=m.serial;
    while((bridge||(!m.bridgeTail&&st>=n(m.vNext,0)))&&(m.tele??=[]).length<tcap){const k=m.vK=(m.vK|0)+1,rng=mulberry32(hash(m.fillerOwner,'v',k,s.zone));const plan=volleyPlan(mode,ph?.band??1,mobile,auto,k,rng);
     const oy=[0,-36,36][k%3],ox=mz.x,y0=mz.y+oy;const bi=bridge?m.tele.length:0;m.tele.push({born:st,fire:st+plan.tele+(bridge&&!m.run?bi*BRIDGE.stagger:0),bi,x:ox,y:y0,ang:Math.atan2(H0.y-y0,H0.x-ox),plan,shot:0,next:0,wait:!!m.run&&!!m.bridgeTail,hue:(REMAP[familyOf(a)]??null)?.[k%2?H.magenta:H.red]??(k%2?H.magenta:H.red)});m.vNext=st+plan.period*(m.volleyQuiet?BRIDGE.quiet:1);metrics.volleys++;if(!bridge)break;}// boss casts: sparser, one telegraph at a time
    for(const v of m.tele??[]){if(v.shot===0)v.ang=Math.atan2(H0.y-v.y,H0.x-v.x);// track until release; zero lead
     if(st<v.fire)continue;if(v.wait){if(m.run){if(st-v.born>BRIDGE.maxWait)v.shot=v.plan.n;continue;}v.wait=false;v.fire=Math.max(v.fire,st+v.bi*BRIDGE.stagger);if(st<v.fire)continue;}const P=v.plan;
     if(P.stream){while(v.shot<P.n&&st>=v.fire+v.shot*P.gap){if(spawn(m.pool,volleyShot(v.x,v.y,v.ang,P.spd,v.hue,v.shot),fctx)){metrics.spawned++;metrics.fillerSpawned++;}v.shot++;}}
     else{for(let j=0;j<P.n;j++){const ang=v.ang+(j-(P.n-1)/2)*(P.spread/Math.max(1,P.n-1))*(P.n>1?1:0);if(spawn(m.pool,volleyShot(v.x,v.y,ang,P.spd,v.hue,j),fctx)){metrics.spawned++;metrics.fillerSpawned++;}}v.shot=P.n;}
     if(v.shot>=P.n&&!v.logged){v.logged=true;const lead=v.fire-v.born;metrics.teleMin=Math.min(n(metrics.teleMin,9),lead);metrics.volleyNMin=Math.min(n(metrics.volleyNMin,99),P.n);metrics.volleyNMax=Math.max(n(metrics.volleyNMax,0),P.n);}}
    if(m.tele?.length)m.tele=m.tele.filter(v=>v.shot<v.plan.n);
    fctx.excl=fe;ectx=m.run?ctx:fctx;}
   else if(!m.run&&fctx)ectx=fctx;
   for(let j=0;j<scratch.length;j++){const b=scratch[j];if(spawn(m.pool,b,ctx)){metrics.spawned++;const i=m.pool.live-1;if(b.pre>0){m.pool.x[i]+=m.pool.vx[i]*b.pre;m.pool.y[i]+=m.pool.vy[i]*b.pre;m.pool.age[i]+=b.pre;}}}
   if(ectx!==ctx){frameCtx(ectx,mz.x,mz.y,H0.x,H0.y,past.x,past.y,0);}
   scratch.length=0;stepPool(m.pool,h,ectx,scratch,null);for(const b of scratch)if(spawn(m.pool,b,ectx))metrics.spawned++;
   ctx.excl=baseExcl;
   // Collision and graze (heart only).
   const p=m.pool,mercy=s.time<m.mercyUntil,inv=n(s.invulnerableUntil)>s.time,dOn=dActive(s);let contact=-1;
   for(let i=0;i<p.live;i++){const age=p.age[i];if(age<.12)continue;const r=HIT[p.type[i]|0];const dx=p.x[i]-H0.x,dy=p.y[i]-H0.y;if(dx*dx+dy*dy>3600&&Math.abs(p.px[i]-H0.x)+Math.abs(p.py[i]-H0.y)>90)continue;
    const d=sweptDist(p,i,H0.x,H0.y);if(d<r+HEART_R){if(contact<0)contact=i;continue;}
    if(!(p.flags[i]&F_GRAZED)&&age>=.25&&!mercy&&!inv&&!dOn&&d<r+HEART_R+19.44)graze(s,m,set,i,a);}
   if(contact>=0)onContact(s,m,set,contact,a);
  }
  // Presentation clocks (sim-side so draw never advances anything).
  const k=Math.min(1,dt);const dimGoal=m.run&&!m.midboss?1:(m.pool.live>40?.15:0);m.dim+=(dimGoal-m.dim)*Math.min(1,k/(dimGoal>m.dim?.35:.6)*2.2);
  m.circle+=((m.run&&!m.midboss?1:0)-m.circle)*Math.min(1,k*2.5);
  let near=0;if(mobile){const p=m.pool;for(let i=0;i<p.live;i++){const dx=p.x[i]-H0.x,dy=p.y[i]-H0.y;if(dx*dx+dy*dy<8100){near=1;break;}}}
  const focusGoal=(keys.shift||near)?1:0;m.focus+=(focusGoal-m.focus)*Math.min(1,k/(focusGoal?.12:.2)*2);
  // Retire sparks.
  if(m.sparks.length){const t=s.time;m.sparks=m.sparks.filter(q=>t<q.born+q.life);}
  metrics.live=m.pool.live;metrics.peak=Math.max(metrics.peak,m.pool.live);metrics.sparks=m.sparks.length;metrics.native=native;metrics.budget=ctx.budget;metrics.filler=fillerOn?1:0;
  callHook('tick',s,dt,m);
 }

 // ---------------------------------------------------------------- danger / imminent providers
 function dangerAt(s,p,look=.36){metrics.dangerCalls++;const m=enabledFlag&&s&&worlds.get(s);if(!m||!m.pool.live||!p)return 0;
  const q=project(p.x,p.y),X=q.x,Y=q.y-42,P=m.pool;let v=0,c=0;
  for(let i=0;i<P.live&&c<256;i++){const x=P.x[i],y=P.y[i];if(Math.abs(x-X)>140||Math.abs(y-Y)>140)continue;c++;
   const ex=x+P.vx[i]*look,ey=y+P.vy[i]*look,dx=ex-x,dy=ey-y,L=dx*dx+dy*dy;let u=L>1e-9?((X-x)*dx+(Y-y)*dy)/L:0;u=u<0?0:u>1?1:u;
   const d=Math.hypot(x+dx*u-X,y+dy*u-Y),r=HIT[P.type[i]|0]+HEART_R;if(d<r+4)v+=36;else if(d<r+24)v+=(r+24-d)*.4;if(v>=120)return 120;}
  return v;}
 function imminent(s,horizon){const m=enabledFlag&&s&&worlds.get(s);if(!m||!m.pool.live)return null;const P=m.pool,hc=heart(s),hz=n(horizon,.2);let best=null;
  for(let i=0;i<P.live;i++){if(P.age[i]<.12)continue;const px=P.x[i]-hc.x,py=P.y[i]-hc.y;if(px*px+py*py>40000)continue;const dx=P.vx[i],dy=P.vy[i],rr=HEART_R+HIT[P.type[i]|0]+2,A=dx*dx+dy*dy,B=2*(px*dx+py*dy),K=px*px+py*py-rr*rr;
   let t=K<=0?0:Infinity;if(K>0&&A>1e-6&&B<0){const disc=B*B-4*A*K;if(disc>=0)t=Math.max(0,(-B-Math.sqrt(disc))/(2*A));}
   if(t<=hz&&(!best||t<best.at))best={kind:'projectile',q:{rc240:true,x:P.x[i],y:P.y[i]},at:t};}
  if(best)metrics.imminentHits++;return best;}

 // ---------------------------------------------------------------- rendering: atlas
 const atlas={K:0,KB:0,body:new Map(),glow:new Map(),circle:new Map(),vignette:null,ok:true};
 function makeCanvas(w,h){try{const d=root.document;if(d?.createElement){const c=d.createElement('canvas');c.width=w;c.height=h;return c;}if(typeof root.OffscreenCanvas==='function')return new root.OffscreenCanvas(w,h);}catch(e){}return null;}
 function rgb(hex){const v=parseInt(hex.slice(1),16);return [v>>16&255,v>>8&255,v&255];}
 function mix(hex,hex2,t){const a=rgb(hex),b=rgb(hex2);return 'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')+')';}
 function rgba(hex,a){const c=rgb(hex);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
 // R2: elongated bodies get a 2 px (phone 2.6) dark outline so they read over hero beams; BIG orbs a
 // 3.8 px (phone 4.4) dark rim, a wider white core and a softer halo that starts outside the rim, so
 // they stay crisp discs at phone scale instead of soft blobs.
 function bodyPaint(g,type,hue,frame,mobile){const [,base,shade,rim]=HUES[hue];const ow=mobile?2.6:2;const rimS=()=>{if(!rim)return;const a=g.globalAlpha;g.strokeStyle=rim;g.lineWidth=.9;g.globalAlpha=.85;g.stroke();g.globalAlpha=a;g.strokeStyle='rgba(7,4,13,.92)';};
  const grad=(r,core)=>{const G=g.createRadialGradient(0,0,0,0,0,r);G.addColorStop(0,'#ffffff');G.addColorStop(clamp(core/r*1.05,0,1),'#ffffff');G.addColorStop(clamp(core/r*1.3,0,1),mix(base,'#ffffff',.55));G.addColorStop(.72,base);G.addColorStop(1,mix(shade,'#000000',.1));return G;};
  g.fillStyle='rgba(7,4,13,.92)';g.strokeStyle='rgba(7,4,13,.92)';
  if(type===T.DOT||type===T.ORB||type===T.BIG){const big=type===T.BIG,core=big?9:HIT[type],body=[6.5,10.5,19][type],out=big?body+(mobile?4.4:3.8):[8,12.3][type]+(mobile?.6:0),halo=HALO[type];
   // Baked soft halo (source-over): reads as glow on the dimmed field without an extra draw call.
   const HG=g.createRadialGradient(0,0,big?out:out*.9,0,0,halo);HG.addColorStop(0,rgba(base,big?.32:.55));HG.addColorStop(.45,rgba(base,big?.12:.2));HG.addColorStop(1,rgba(base,0));g.fillStyle=HG;g.beginPath();g.arc(0,0,halo,0,TAU);g.fill();
   g.fillStyle='rgba(7,4,13,.92)';g.beginPath();g.arc(0,0,out,0,TAU);g.fill();if(rim){g.beginPath();g.arc(0,0,out-.25,0,TAU);rimS();}g.fillStyle=grad(body,core);g.beginPath();g.arc(0,0,body,0,TAU);g.fill();
   g.strokeStyle=mix(base,'#ffffff',.3);g.lineWidth=.8;g.beginPath();g.arc(0,0,core*1.12,0,TAU);g.stroke();
   g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(-.3*core,-.35*core,.35*core,0,TAU);g.fill();return;}
  const rot=frame*TAU/FRAMES[type];g.rotate(rot);g.scale(1.15,1.15);
  if(type===T.RICE){g.save();g.scale(1,(3.6+ow)/(7.5+ow));g.beginPath();g.arc(0,0,7.5+ow,0,TAU);g.fill();rimS();g.restore();
   g.save();g.scale(1,3.6/7.5);g.fillStyle=grad(7.5,3.2);g.beginPath();g.arc(0,0,7.5,0,TAU);g.fill();g.restore();
   g.fillStyle='#ffffff';g.save();g.scale(1,1.6/3);g.beginPath();g.arc(0,0,3,0,TAU);g.fill();g.restore();return;}
  if(type===T.NEEDLE){const path=(L,W)=>{g.beginPath();g.moveTo(L,0);g.lineTo(-L*.2,W);g.lineTo(-L,0);g.lineTo(-L*.2,-W);g.closePath();};
   path(11+ow,2.8+ow);g.fill();rimS();const G=g.createLinearGradient(0,-2.8,0,2.8);G.addColorStop(0,shade);G.addColorStop(.5,base);G.addColorStop(1,shade);g.fillStyle=G;path(11,2.8);g.fill();
   g.strokeStyle='#ffffff';g.lineWidth=1.2;g.lineCap='round';g.beginPath();g.moveTo(-6,0);g.lineTo(6,0);g.stroke();return;}
  if(type===T.STAR){const star=(R,r)=>{g.beginPath();for(let j=0;j<10;j++){const a=-PI/2+j*PI/5,rr=j%2?r:R;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();};
   star(7.5+ow,3.4+ow);g.fill();rimS();g.fillStyle=grad(7.5,3.5);star(7.5,3.4);g.fill();g.fillStyle='#ffffff';g.beginPath();g.arc(0,0,3.5*.9,0,TAU);g.fill();}}
 function bodySprite(type,hue,mobile){const key=type*64+hue*2+(mobile?1:0);let e=atlas.body.get(key);if(e)return e;
  const KB=atlas.KB,px=Math.max(4,Math.ceil(CELL[type]*KB)),fr=FRAMES[type],c=makeCanvas(px*fr,px);if(!c){atlas.ok=false;return null;}
  const g=c.getContext('2d');if(!g){atlas.ok=false;return null;}
  for(let f=0;f<fr;f++){g.save();g.translate(f*px+px/2,px/2);g.scale(KB,KB);try{bodyPaint(g,type,hue,f,mobile);}catch(err){fail(err);}g.restore();}
  e={c,px,fr,cell:CELL[type]};atlas.body.set(key,e);return e;}
 function glowSprite(hue){let e=atlas.glow.get(hue);if(e)return e;const c=makeCanvas(64,64);if(!c)return null;const g=c.getContext('2d');if(!g)return null;
  const base=HUES[hue][1],G=g.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,rgba(base,.68));G.addColorStop(.4,rgba(base,.28));G.addColorStop(1,rgba(base,0));g.fillStyle=G;g.fillRect(0,0,64,64);
  e={c};atlas.glow.set(hue,e);return e;}
 function circleSprite(hue,inner){const key=hue*2+(inner?1:0);let e=atlas.circle.get(key);if(e)return e;const c=makeCanvas(160,160);if(!c)return null;const g=c.getContext('2d');if(!g)return null;
  const base=HUES[hue][1];g.translate(80,80);g.strokeStyle=base;g.fillStyle=base;g.lineWidth=2;
  if(!inner){g.beginPath();g.arc(0,0,70,0,TAU);g.stroke();g.lineWidth=1;g.beginPath();g.arc(0,0,64,0,TAU);g.stroke();for(let j=0;j<24;j++){const a=j*TAU/24;g.beginPath();g.moveTo(Math.cos(a)*64,Math.sin(a)*64);g.lineTo(Math.cos(a)*(j%2?58:54),Math.sin(a)*(j%2?58:54));g.stroke();}}
  else{g.lineWidth=1.5;g.beginPath();g.arc(0,0,52,0,TAU);g.stroke();for(let j=0;j<12;j++){const a=j*TAU/12,x=Math.cos(a)*52,y=Math.sin(a)*52;g.beginPath();g.moveTo(x,y-4);g.lineTo(x+3,y);g.lineTo(x,y+4);g.lineTo(x-3,y);g.closePath();g.fill();}
   g.lineWidth=1.2;for(const o of [0,PI/3]){g.beginPath();for(let j=0;j<3;j++){const a=o-PI/2+j*TAU/3;g.lineTo(Math.cos(a)*48,Math.sin(a)*48);}g.closePath();g.stroke();}g.beginPath();g.arc(0,0,14,0,TAU);g.stroke();}
  e={c};atlas.circle.set(key,e);return e;}
 function vignetteSprite(){if(atlas.vignette)return atlas.vignette;const c=makeCanvas(256,144);if(!c)return null;const g=c.getContext('2d');if(!g)return null;
  const G=g.createRadialGradient(128,72,0,128,72,150);G.addColorStop(0,'rgba(0,0,0,0)');G.addColorStop(.55,'rgba(0,0,0,0)');G.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=G;g.fillRect(0,0,256,144);atlas.vignette={c};return atlas.vignette;}
 function ensureAtlas(ctx){let K=1;try{const m=ctx.getTransform?.();if(m)K=Math.hypot(m.a,m.b)||1;}catch(e){}
  const KB=clamp(K*1.15,.6,1.6);if(!atlas.KB||Math.abs(KB-atlas.KB)/atlas.KB>.25){atlas.KB=KB;atlas.body.clear();}atlas.K=K;return K;}

 // ---------------------------------------------------------------- rendering: passes
 const fxOpacity=set=>{const t=Number(set?.skillFxOpacity);return Number.isFinite(t)?clamp(t,.25,1):1;};
 function edgeAlpha(x,y){const e=Math.min(x-CULL.x0,CULL.x1-x,y-CULL.y0,CULL.y1-y);if(e>=36)return 1;return e>=24?.7:e>=12?.4:.15;}
 // Boss body box (G px around the muzzle, down past the feet to the HP bar): non-aimed curtain bullets
 // crossing it are drawn at 30% so the boss silhouette and HP bar stay readable (hit rules unchanged).
 const THIN=Object.freeze({w:60,up:100,down:142,a:.3});
 function thinBox(m){const z=m.lastMuzzle;if(!m.owner||!z||!Number.isFinite(z.x)||!Number.isFinite(z.y)){m.tb0=1e9;m.tb1=-1e9;return;}const bs=clamp(n(m.bscale,1),1,2.2);m.tb0=z.x-THIN.w*bs;m.tb1=z.x+THIN.w*bs;m.tb2=z.y-((THIN.up+100)*bs-100);m.tb3=z.y+THIN.down;}
 function thinned(P,i,m){const x=P.x[i],y=P.y[i];return x>m.tb0&&x<m.tb1&&y>m.tb2&&y<m.tb3&&!(P.flags[i]&(F_AIMED|F_FAST|F_SIG));}
 // Walkable floor (R2): the arena floor polygon (the same source mobile-landscape.js frames with) in
 // G px, re-projected only when its vertices change. Bullets ride FLOOR.lift px above the floor; past
 // its edge (over furniture, beyond the platform) they fade with distance down to FLOOR.min, and the
 // formation trail / swing arc are clipped to it. No polygon: nothing changes.
 const FLOOR=Object.freeze({lift:42,fade:40,min:.3,max:48});
 const floorC={ok:false,n:0,rx:new Float64Array(FLOOR.max),ry:new Float64Array(FLOOR.max),x:new Float64Array(FLOOR.max),y:new Float64Array(FLOOR.max),x0:0,x1:0,y0:0,y1:0};
 function floorPoly(){let poly=null;try{poly=root.__HAPIL_PERSONA_DUEL_RC134__?.polygon?.('all',.8);}catch(e){}
  const N=(poly&&poly.length)|0;if(N<3||N>FLOOR.max){floorC.ok=false;return false;}
  let same=N===floorC.n;for(let i=0;same&&i<N;i++){const q=poly[i];if(!q||q.x!==floorC.rx[i]||q.y!==floorC.ry[i])same=false;}
  if(same)return floorC.ok;
  floorC.n=N;floorC.ok=true;floorC.x0=floorC.y0=1e9;floorC.x1=floorC.y1=-1e9;
  for(let i=0;i<N;i++){const q=poly[i],tx=n(q&&q.x,NaN),ty=n(q&&q.y,NaN);floorC.rx[i]=q?q.x:NaN;floorC.ry[i]=q?q.y:NaN;const P=tx===tx&&ty===ty?project(tx,ty):null;
   if(!P||!Number.isFinite(P.x)||!Number.isFinite(P.y)){floorC.ok=false;return false;}floorC.x[i]=P.x;floorC.y[i]=P.y;
   if(P.x<floorC.x0)floorC.x0=P.x;if(P.x>floorC.x1)floorC.x1=P.x;if(P.y<floorC.y0)floorC.y0=P.y;if(P.y>floorC.y1)floorC.y1=P.y;}
  return true;}
 function floorFade(x,y){const F=floorC,X=x,Y=y+FLOOR.lift,N=F.n;let inside=false;
  if(X>=F.x0&&X<=F.x1&&Y>=F.y0&&Y<=F.y1)for(let i=0,j=N-1;i<N;j=i++){const yi=F.y[i],yj=F.y[j];if((yi>Y)!==(yj>Y)&&X<(F.x[j]-F.x[i])*(Y-yi)/(yj-yi)+F.x[i])inside=!inside;}
  if(inside)return 1;let d2=1e18;
  for(let i=0,j=N-1;i<N;j=i++){const ax=F.x[j],ay=F.y[j],dx=F.x[i]-ax,dy=F.y[i]-ay,L=dx*dx+dy*dy;let u=L>1e-9?((X-ax)*dx+(Y-ay)*dy)/L:0;u=u<0?0:u>1?1:u;const qx=ax+dx*u-X,qy=ay+dy*u-Y,q=qx*qx+qy*qy;if(q<d2)d2=q;}
  return clamp(1-Math.sqrt(d2)/FLOOR.fade,FLOOR.min,1);}
 function floorClip(ctx){const F=floorC;ctx.beginPath();ctx.moveTo(F.x[0],F.y[0]-FLOOR.lift);for(let i=1;i<F.n;i++)ctx.lineTo(F.x[i],F.y[i]-FLOOR.lift);ctx.closePath();ctx.clip();}
 function drawBullets(ctx,s,m,set){const P=m.pool,N=P.live;if(!N)return 0;ensureAtlas(ctx);let draws=0;const t=s.time,mobile=m.mobile,low=!!set?.lowFx,quiet=!!set?.reducedFlash;thinBox(m);const fl=floorPoly();
  // Glow pass ('lighter').
  const gA=.55*Math.min(1,Math.sqrt(140/Math.max(140,N)))*fxOpacity(set)*(low?.35/.55:1)*(quiet?.6:1);
  if(gA>.01){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=gA;
   // Glow budget <= 45% of bullets: large/medium first, small dots only with leftover budget.
   let budget=Math.floor(N*.45)+4;
   for(let pass=0;pass<2&&budget>0;pass++)for(let i=0;i<N&&budget>0;i++){const ty=P.type[i]|0;if((ty===T.DOT)!==(pass===1))continue;if(low&&ty!==T.BIG)continue;if(mobile&&!(ty===T.ORB||ty===T.BIG))continue;if(ty===T.DOT&&N>250)continue;
    if(thinned(P,i,m)||(fl&&floorFade(P.x[i],P.y[i])<.6))continue;const g=glowSprite(P.hue[i]|0);if(!g)continue;const r=GLOW[ty]*(P.age[i]<.14?1.4:1);ctx.drawImage(g.c,P.x[i]-r,P.y[i]-r,2*r,2*r);draws++;budget--;}}
  // Body pass (source-over, honest cores).
  ctx.globalCompositeOperation='source-over';let alpha=-1;const bloom=mobile?.18:.14;
  for(const ty of DRAW_ORDER)for(let i=0;i<N;i++){if((P.type[i]|0)!==ty)continue;const sp=bodySprite(ty,P.hue[i]|0,mobile);if(!sp)continue;
   const age=P.age[i];let a=edgeAlpha(P.x[i],P.y[i])*(thinned(P,i,m)?THIN.a:1)*(fl?floorFade(P.x[i],P.y[i]):1),sc=1;if(age<bloom){const u=age/bloom,e=1-(1-u)*(1-u)*(1-u);sc=1.8-.8*e;a*=e;}
   if(a!==alpha){ctx.globalAlpha=a;alpha=a;}
   let f=0;if(sp.fr>1){f=ty===T.STAR?(quiet?0:Math.floor(((t*2+i*.37)%(TAU/5))/(TAU/5)*sp.fr)%sp.fr):Math.round(((P.dir[i]%TAU+TAU)%TAU)/TAU*sp.fr)%sp.fr;}
   const w=sp.cell*sc;ctx.drawImage(sp.c,f*sp.px,0,sp.px,sp.px,P.x[i]-w/2,P.y[i]-w/2,w,w);draws++;}
  return draws;}
 function drawSparks(ctx,s,m,set){if(!m.sparks.length)return 0;let d=0;const t=s.time;ctx.globalCompositeOperation='lighter';
  for(const q of m.sparks){const age=t-q.born;if(age<0||age>=q.life)continue;const u=age/q.life;
   if(q.kind===0){const sp=bodySprite(T.STAR,H.white,m.mobile),g=glowSprite(q.hue|0);const sc=q.scale*(1-.6*u),x=q.x+q.vx*age,y=q.y+q.vy*age;ctx.globalAlpha=(1-u)*(set?.reducedFlash?.5:1);
    if(g){const r=14*sc*1.4;ctx.drawImage(g.c,x-r,y-r,2*r,2*r);d++;}if(sp){const w=sp.cell*sc*.6;ctx.drawImage(sp.c,0,0,sp.px,sp.px,x-w/2,y-w/2,w,w);d++;}}
   else{ctx.globalAlpha=(1-u)*.9;ctx.strokeStyle='#fff6c8';ctx.lineWidth=1.4;const x=q.x+q.vx*age,y=q.y+q.vy*age;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-q.vx*.05,y-q.vy*.05);ctx.stroke();}}
  ctx.globalCompositeOperation='source-over';return d;}
 function drawFocus(ctx,s,m,set){const a=m.focus;if(a<.02||!(n(s.hp)>0))return;const c=heart(s),t=s.time;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.75*a;
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.arc(c.x,c.y,9,0,TAU);ctx.fill();
  for(const [w,col] of [[2,'rgba(8,6,20,.9)'],[1,'#ffffff']]){ctx.lineWidth=w;ctx.strokeStyle=col;ctx.beginPath();ctx.arc(c.x,c.y,15,0,TAU);ctx.stroke();
   ctx.setLineDash?.([6,4]);ctx.lineDashOffset=set?.reducedFlash?0:-t*1.5*11;ctx.beginPath();ctx.arc(c.x,c.y,11,0,TAU);ctx.stroke();ctx.setLineDash?.([]);}}
 function drawHitFx(ctx,s,m,set){const age=s.time-m.hitAt;if(age<0||age>.35)return;const c=heart(s);
  if(age<.3){ctx.globalAlpha=(1-age/.3)*.8;ctx.strokeStyle='#ff5a6e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(c.x,c.y,6+24*age/.3,0,TAU);ctx.stroke();}}
 function screenSpace(ctx){const cv=ctx.canvas;if(!cv)return null;let w=cv.width,h=cv.height;try{const r=cv.getBoundingClientRect?.();if(r&&r.width>0&&r.height>0){w=r.width;h=r.height;}}catch(e){}
  ctx.setTransform(cv.width/w,0,0,cv.height/h,0,0);return {w,h};}
 function drawScreen(ctx,s,m,set){// Banner, flash and hit vignette in CSS px.
  const B=m.banner,F=m.flash,hitAge=s.time-m.hitAt;if(!B&&!F&&!(hitAge>=0&&hitAge<.35))return;
  ctx.save();try{const v=screenSpace(ctx);if(!v)return;const {w,h}=v;ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.shadowBlur=0;ctx.direction='ltr';if('letterSpacing' in ctx)ctx.letterSpacing='0px';if('wordSpacing' in ctx)ctx.wordSpacing='0px';
   if(hitAge>=0&&hitAge<.35){const a=(set?.reducedFlash?.18:.35)*(1-hitAge/.35);const G=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.7);G.addColorStop(0,'rgba(255,30,60,0)');G.addColorStop(1,'rgba(255,30,60,'+a.toFixed(3)+')');ctx.globalAlpha=1;ctx.fillStyle=G;ctx.fillRect(0,0,w,h);}
   const hold=presHold(s);// presentation queue: title -> warning -> second-form banner -> spell card
   if(F&&!set?.reducedFlash&&hold!==2){const u=(s.time-F.at)/F.dur;if(u>=0&&u<1){ctx.globalAlpha=F.peak*(1-u)*fxOpacity(set);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);}}
   if(B){bossScreenBox(ctx,m,w,h);drawBanner(ctx,s,m,set,B,w,h,hold>0);}
  }finally{ctx.restore();}}
 // The world pass hides canvas text while combat info is compact (V31317
 // presentation context). The spell banner is HUD chrome like RC129's HUD, so it
 // draws through the prototype method rather than the suppressed own property.
 function fitText(ctx,t,max){t=String(t);if(!ctx.measureText)return t;if((ctx.measureText(t)?.width??0)<=max)return t;while(t.length>1&&(ctx.measureText(t+'…')?.width??0)>max)t=t.slice(0,-1);return t+'…';}
 function hudText(ctx,t,x,y){const f=Object.getPrototypeOf(ctx)?.fillText;if(typeof f==='function')f.call(ctx,t,x,y);else ctx.fillText?.(t,x,y);}
 // The card is sized to its full spell name (measured; the font shrinks before anything is cut) and,
 // when it would cover the boss on screen (m.bossScr, CSS px), it moves to the top centre for the rest
 // of that spell. It never outlives its boss.
 const NAME_FONT=' "Noto Serif KR",system-ui,sans-serif';
 // Presentation queue (fix round 2): 2 = boss warning up, 1 = stage title card or second-form banner up,
 // 0 = free. The spell card waits behind any of them (never shares the top-centre slot, never truncated).
 function presHold(s){const t=n(s.time);try{const F=root.__HAPIL_STG_FEEL_RC240__;if(F&&typeof F.warningActive==='function'&&F.warningActive(s)===true)return 2;}catch(e){}
  try{const B=root.__HAPIL_BOSS_FORM_RC240__;if(B){const tu=typeof B.titleUntil==='function'?n(B.titleUntil(s),-1):-1,fu=typeof B.formBannerUntil==='function'?n(B.formBannerUntil(s),-1):-1;if(tu>t||fu>t)return 1;}}catch(e){}return 0;}
 function drawBanner(ctx,s,m,set,B,w,h,held){const mobile=m.mobile||w<800,hue=HUES[B.hue]?.[1]??'#b45cff',t=s.time;
  if(m.owner&&!(n(m.owner.hp)>0)){m.banner=null;return;}
  if(B.result&&t-B.resultAt>(B.result==='capture'?1.2:.8)&&!m.run){m.banner=null;return;}
  // The spell result goes to the STG-feel callout lane (hero side), never under the card.
  if(B.result&&!B.resultPosted){B.resultPosted=true;let ok=false;try{ok=root.__HAPIL_STG_FEEL_RC240__?.callout?.(s,B.result==='capture'?'주문 격파!  공명 +'+Math.round(n(B.award)):'보너스 실패',B.result==='capture'?'#ffe59a':'#9a9ab0',B.result==='capture'?1.3:.9,'big')===true;}catch(e){}B.resultLocal=!ok;}
  // Held: a card not shown yet restarts its intro when it is first shown; a shown card fades back in.
  B.held=!!held;if(held){if(!B.shown)B.born=t;B.wasHeld=true;return;}
  if(B.wasHeld&&B.shown)B.fadeAt=t;B.wasHeld=false;B.shown=true;const A=B.fadeAt!=null?clamp((t-B.fadeAt)/.25,0,1):1;
  const age=t-B.born,ease=u=>1-Math.pow(1-clamp(u,0,1),3);let big=1;if(age>1.52)big=1-ease((age-1.52)/.35);
  const mw=q=>n(ctx.measureText?.(q)?.width,0);
  ctx.font=(mobile?'9px':'10px')+' system-ui,sans-serif';const bw=mw('보너스 +00.0')||50;
  ctx.font=(mobile?'14px':'18px')+' ui-monospace,Menlo,monospace';const tw=Math.max(bw,mw('00.0')||40);
  const gap=mobile?10:14,colW=tw+gap+10,padL=mobile?18:26,maxW=Math.max(160,Math.min(w-(mobile?12:32),w*(mobile?.62:.5)));
  const bossLine=B.boss+' · 주문 '+(B.index+1)+'/3'+(B.lite?' · 잔향':'');ctx.font=(mobile?'9px':'11px')+' system-ui,"Noto Serif KR",sans-serif';const bossW=mw(bossLine);
  let fs=mobile?15:20;const fmin=mobile?11:13;ctx.font='bold '+fs+'px'+NAME_FONT;let nw=mw(B.name);
  while(nw+colW+padL>maxW&&fs>fmin){fs--;ctx.font='bold '+fs+'px'+NAME_FONT;nw=mw(B.name);}
  const cardW=clamp(Math.max(nw,Math.min(bossW,maxW-colW-padL))+colW+padL,mobile?200:300,maxW);
  // Two columns: [boss line / spell name] | [timer / bonus]. Rows never share a band.
  const stripH=(mobile?40:50)+(mobile?6:8)*big,slide=ease(age/.22);
  let y=(h*.24)*big+(mobile?74:62)*(1-big),x0=(w-Math.max(cardW,w*.6))*big+(w-16-cardW)*(1-big),x1=w-16*(1-big);
  const S=m.bossScr;if(!B.top&&m.bossScrOk&&S){const yT=y-stripH/2;if(x0<S[2]&&x1>S[0]&&yT<S[3]&&yT+stripH>S[1])B.top=true;}
  if(B.top){x0=(w-cardW)/2;x1=x0+cardW;y=(mobile?22:46)+stripH/2;}
  // The whole card (text included) slides in from the right; the name is fitted to the settled card,
  // so a sliding card never cuts its name.
  const off=(1-slide)*(w-x0),yT=y-stripH/2,x=x0+off,xr=x1+off;
  ctx.globalAlpha=A;const G=ctx.createLinearGradient(x,0,xr,0);G.addColorStop(0,'rgba(6,4,14,0)');G.addColorStop(.14,'rgba(6,4,14,.8)');G.addColorStop(1,'rgba(6,4,14,.86)');
  ctx.fillStyle=G;ctx.fillRect(x,yT,xr-x,stripH);ctx.fillStyle=hue;ctx.globalAlpha=.9*A;ctx.fillRect(x+(xr-x)*.1,yT,(xr-x)*.9,1);ctx.fillRect(x+(xr-x)*.1,yT+stripH-1,(xr-x)*.9,1);
  ctx.textBaseline='middle';ctx.textAlign='right';const right=xr-10;
  const rem=n(B.remaining),timer=rem.toFixed(1);ctx.globalAlpha=A;ctx.font=(mobile?'9px':'10px')+' system-ui,sans-serif';
  const bonus=B.bonus*(1-.75*clamp(n(B.elapsedAtEnd)/Math.max(1,B.duration),0,1)),btxt=m.spellHit?'보너스 실패':'보너스 +'+bonus.toFixed(1);
  ctx.fillStyle=m.spellHit?'#8a8aa0':'#ffe59a';hudText(ctx,btxt,right,yT+stripH*.76);
  ctx.font=(mobile?'14px':'18px')+' ui-monospace,Menlo,monospace';
  ctx.fillStyle=rem<3&&!(set?.reducedFlash)?'#ff6a6a':'#f2f4ff';if(rem>0||m.run)hudText(ctx,timer,right,yT+stripH*.34);// no "0.0" once the spell is over
  const tx=right-tw-gap,room=Math.max(40,tx-x-padL*.5);
  ctx.fillStyle='#ffffff';ctx.globalAlpha=.72*A;ctx.font=(mobile?'9px':'11px')+' system-ui,"Noto Serif KR",sans-serif';hudText(ctx,fitText(ctx,bossLine,room),tx,yT+stripH*.27);
  ctx.globalAlpha=A;ctx.font='bold '+fs+'px'+NAME_FONT;ctx.fillStyle='#ffffff';hudText(ctx,fitText(ctx,B.name,room),tx,yT+stripH*.68);
  if(B.resultLocal&&B.result&&t-B.resultAt<(B.result==='capture'?1.2:.8)){const u=(t-B.resultAt)/(B.result==='capture'?1.2:.8);ctx.globalAlpha=1-u*u;ctx.textAlign='center';
   ctx.font='bold '+(mobile?'20px':'28px')+NAME_FONT;ctx.fillStyle=B.result==='capture'?'#ffe59a':'#9a9ab0';
   let cy=h*.36;try{const v=root.__HAPIL_STG_FEEL_RC240__?.calloutY?.(w,h,mobile);if(Number.isFinite(v))cy=v;}catch(e){}
   hudText(ctx,B.result==='capture'?'주문 격파!  공명 +'+Math.round(n(B.award)):'보너스 실패',w/2,cy);}}
 // Boss on-screen box in CSS px (from the world transform saved by the world pass): head to HP bar.
 function bossScreenBox(ctx,m,w,h){m.bossScrOk=false;const a=m.owner,M=m.wm;if(!a||!M||!m.wmOk||!(n(a.hp)>0))return;const cv=ctx.canvas;if(!cv||!(cv.width>0)||!(cv.height>0))return;
  const p=project(a.x,a.y),sx=w/cv.width,sy=h/cv.height,S=m.bossScr??=new Float64Array(4);S[0]=1e9;S[1]=1e9;S[2]=-1e9;S[3]=-1e9;
  for(let k=0;k<4;k++){const gx=p.x+(k&1?90:-90),gy=p.y+(k&2?40:-260),X=(M[0]*gx+M[2]*gy+M[4])*sx,Y=(M[1]*gx+M[3]*gy+M[5])*sy;if(!(X===X&&Y===Y))return;if(X<S[0])S[0]=X;if(X>S[2])S[2]=X;if(Y<S[1])S[1]=Y;if(Y>S[3])S[3]=Y;}
  m.bossScrOk=true;}
 function drawTele(ctx,s,m,set){const L=m.tele;if(!L||!L.length)return 0;const t=s.time,op=fxOpacity(set);let d=0;
  for(const v of L){if(v.shot>0||!(Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.ang)))continue;const u=clamp((t-v.born)/Math.max(.05,v.fire-v.born),0,1),col=HUES[v.hue|0]?.[1]??'#ff3048';
   const len=Math.min(900,Math.hypot(m.hx-v.x,m.hy-v.y)+90),ex=v.x+Math.cos(v.ang)*len,ey=v.y+Math.sin(v.ang)*len;
   // Thick, high-contrast, pulsing: a dark underlay, the hue line and a white core, sized in CSS px
   // (m.kc = CSS px per G px), so a phone shows ~3 px, never a hairline.
   const kc=clamp(n(m.kc,1),.2,4),pulse=set?.reducedFlash?1:.5+.5*Math.sin(t*TAU*5+v.bi),wc=(m.mobile?3.6:2.9)*(.85+.3*pulse);
   ctx.lineCap='round';ctx.beginPath();ctx.moveTo(v.x,v.y);ctx.lineTo(ex,ey);
   // Soft additive glow (R2): a wide, faint hue stroke under the line, pulsing with it.
   if(!set?.lowFx){ctx.globalCompositeOperation='lighter';ctx.lineWidth=wc*3.4/kc;ctx.strokeStyle=col;ctx.globalAlpha=clamp((.12+.2*u)*op*(.7+.3*pulse),0,.45);ctx.stroke();}
   ctx.globalCompositeOperation='source-over';ctx.lineWidth=(wc+2.6)/kc;ctx.strokeStyle='rgba(6,3,12,.85)';ctx.globalAlpha=(.3+.45*u)*op;ctx.stroke();
   ctx.lineWidth=wc/kc;ctx.strokeStyle=col;ctx.globalAlpha=clamp((.5+.45*u)*op*(.75+.25*pulse),0,1);ctx.stroke();
   ctx.lineWidth=Math.max(.7,wc*.34)/kc;ctx.strokeStyle='#ffffff';ctx.globalAlpha=(.25+.55*u)*op;ctx.stroke();
   const g=glowSprite(v.hue|0);if(g){const r=8+18*u;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=clamp((.45+.55*u)*op,0,1);ctx.drawImage(g.c,v.x-r,v.y-r,2*r,2*r);d++;}}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;return d;}
 function drawCircle(ctx,s,m,set){const a=m.owner,u=m.circle;if(!a||u<.02||!(a.hp>0))return;const spell=m.spell;if(!spell)return;
  const hue=(REMAP[m.family]??null)?.[H[spell.circle]??H.violet]??(H[spell.circle]??H.violet),p=project(a.x,a.y),t=s.time,low=!!set?.lowFx,quiet=!!set?.reducedFlash,op=fxOpacity(set);const outer=circleSprite(hue,false),inner=circleSprite(hue,true),g=glowSprite(hue);
  ctx.save();try{ctx.globalCompositeOperation='lighter';
   if(g&&!low){ctx.globalAlpha=(.28+(quiet?0:.07*Math.sin(7.5*t)))*u*op;ctx.drawImage(g.c,p.x-90,p.y-30-90,180,180);}
   ctx.translate(p.x,p.y);ctx.scale(1,.5);ctx.globalAlpha=.45*u*op;
   if(outer){ctx.save();if(!low)ctx.rotate(t*.6);ctx.drawImage(outer.c,-80,-80,160,160);ctx.restore();}
   if(inner&&!low&&!m.mobile){ctx.save();ctx.rotate(-t*.6*.72);ctx.drawImage(inner.c,-80,-80,160,160);ctx.restore();}
  }finally{ctx.restore();}}
 // R3: the dim passes (multiply darken, vignette, PC desaturation) composite source-over, which painted
 // opaque grey on transparent canvas pixels (letterbox bars, the strip above the map). The canvas is copied
 // into one cached same-size buffer before them (before the flow streaks when called from the background
 // pass) and its alpha is restored after ('destination-in'): two GPU blits while a spell dims, no
 // allocation per frame. Without a buffer the darken is an alpha-preserving source-atop fill instead.
 const dimMask={c:null,g:null,cv:null,ok:false,bad:false};
 function dimOn(s,m){return !!m&&m.dim>=.01&&root.__HAPIL_RC95_NATIVE__?.locked?.(s)!==true;}
 function dimSnap(ctx){dimMask.ok=false;dimMask.cv=null;const cv=ctx?.canvas;if(dimMask.bad||!cv||!(cv.width>0)||!(cv.height>0))return false;
  try{if(!dimMask.c){const c=makeCanvas(cv.width,cv.height),g=c?.getContext?.('2d');if(!g){dimMask.bad=true;return false;}dimMask.c=c;dimMask.g=g;}
   const c=dimMask.c,g=dimMask.g;if(c.width!==cv.width)c.width=cv.width;if(c.height!==cv.height)c.height=cv.height;
   g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='copy';g.drawImage(cv,0,0);dimMask.cv=cv;dimMask.ok=true;return true;}catch(e){dimMask.bad=true;return false;}}
 function drawDim(ctx,s,m,set,snapped){const a=m.dim;if(a<.01)return;if(root.__HAPIL_RC95_NATIVE__?.locked?.(s)===true)return;const cv=ctx.canvas;if(!cv)return;const dimA=m.dimLevel*a;
  if(!(snapped===true&&dimMask.ok&&dimMask.cv===cv))dimSnap(ctx);const masked=dimMask.ok&&dimMask.cv===cv;
  // R2: a multiply darken (keeps hue and chroma; the same on PC and phone) with a faint cool cast,
  // plus at most .2 desaturation on PC (half the old .4; phone keeps none, so both read alike).
  ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;const k=1-dimA;const v=!set?.lowFx&&vignetteSprite();
   if(masked){ctx.globalCompositeOperation='multiply';
    ctx.fillStyle='rgb('+Math.round(255*k*.95)+','+Math.round(255*k*.97)+','+Math.round(255*Math.min(1,k*1.04))+')';ctx.fillRect(0,0,cv.width,cv.height);ctx.globalCompositeOperation='source-over';
    if(v){ctx.globalAlpha=clamp(dimA/.45,0,1);ctx.drawImage(v.c,0,0,cv.width,cv.height);}
    if(!set?.lowFx&&!m.mobile){ctx.globalCompositeOperation='saturation';ctx.globalAlpha=.2*a;ctx.fillStyle='#808080';ctx.fillRect(0,0,cv.width,cv.height);}
    ctx.globalCompositeOperation='destination-in';ctx.globalAlpha=1;ctx.drawImage(dimMask.c,0,0);}
   else{// uniform multiply by k == black at alpha 1-k, atop (alpha kept); a near-black blue keeps the cool cast
    ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=clamp(dimA,0,1);ctx.fillStyle='rgb(0,2,12)';ctx.fillRect(0,0,cv.width,cv.height);
    if(v){ctx.globalAlpha=clamp(dimA/.45,0,1);ctx.drawImage(v.c,0,0,cv.width,cv.height);}}
  }finally{ctx.restore();dimMask.ok=false;dimMask.cv=null;}}
 // Swing trail: thin strokes through the parked bullets of each stroke, under the bullets,
 // fading out as the formation releases. Strokes only (no images, no per-bullet state).
 function drawSigTrail(ctx,s,m,set){const run=m.run,S=run&&run.sig;if(!S||!S.active||!S.buf.n)return;const B=S.buf,pt=run.t-S.t0;if(!(pt>=0)||!Number.isFinite(pt))return;
  let rel=1e9;for(let j=0;j<B.n;j++){const m0=B.qw[j]!==0?B.q0[j]:B.r[j];if(m0<rel)rel=m0;}/* fades once the weapon starts to move */const fade=clamp(1-(pt-rel)/.35,0,1);if(fade<=0)return;
  const op=fxOpacity(set)*(set?.lowFx?.5:1)*fade,remap=m.ctx&&m.ctx.remap;if(op<.02)return;const kc=clamp(n(m.kc,1),.2,4);// widths in CSS px (R2: the phone trail was ~1.9 px)ctx.globalCompositeOperation='source-over';ctx.lineCap='round';ctx.lineJoin='round';
  for(let sid=0;sid<16;sid++){let hue=-1,open=false,px=0,py=0;
   for(let pass=0;pass<2;pass++){ctx.beginPath();open=false;
    for(let j=0;j<B.n;j++){if(B.st[j]!==sid||B.t[j]>pt)continue;const x=B.x[j],y=B.y[j];if(!(x===x&&y===y))continue;if(hue<0)hue=remap?remap[B.hu[j]]:B.hu[j];
     if(!open||Math.abs(x-px)+Math.abs(y-py)>70){ctx.moveTo(x,y);open=true;}else ctx.lineTo(x,y);px=x;py=y;}
    if(hue<0)break;if(pass===0){ctx.strokeStyle='rgba(7,4,13,.7)';ctx.lineWidth=(m.mobile?6.5:5.5)/kc;ctx.globalAlpha=.6*op;}else{ctx.strokeStyle=HUES[hue|0]?.[1]??'#ffffff';ctx.lineWidth=(m.mobile?3:2.4)/kc;ctx.globalAlpha=.75*op;}ctx.stroke();}}
  ctx.globalAlpha=1;}
 // Swing arc: while a formation swings, fading arcs (strokes only) trace the path its far end has swept
 // about the pivot, and fade out over .45 s once it releases. Up to three pivots (wings: one per side).
 const ARC=new Float64Array(3*8);
 function drawSwingArc(ctx,s,m,set){const run=m.run,S=run&&run.sig;if(!S||!S.active||!S.buf.n)return;const B=S.buf,pt=run.t-S.t0;if(!(pt>=0)||!Number.isFinite(pt))return;
  let k=0;for(let j=0;j<B.n;j++){if(B.qw[j]===0||B.t[j]>pt)continue;const qx=B.qx[j],qy=B.qy[j],x=B.x[j],y=B.y[j];if(!(qx===qx&&qy===qy&&x===x&&y===y))continue;let i=0;
   for(;i<k;i++){const o=i*8;if(Math.abs(ARC[o]-qx)<.5&&Math.abs(ARC[o+1]-qy)<.5&&ARC[o+2]===B.qw[j])break;}
   if(i===k){if(k>=3)continue;const o=k*8;ARC[o]=qx;ARC[o+1]=qy;ARC[o+2]=B.qw[j];ARC[o+3]=B.q0[j];ARC[o+4]=1e9;ARC[o+5]=0;ARC[o+6]=0;ARC[o+7]=B.hu[j];k++;}
   const o=i*8,d=Math.hypot(x-qx,y-qy);if(B.r[j]<ARC[o+4])ARC[o+4]=B.r[j];if(d>ARC[o+5]){ARC[o+5]=d;ARC[o+6]=Math.atan2(y-qy,x-qx);}}
  if(!k)return;const op=fxOpacity(set)*(set?.lowFx?.5:1),remap=m.ctx&&m.ctx.remap,kc=clamp(n(m.kc,1),.2,4);ctx.globalCompositeOperation='source-over';ctx.lineCap='round';
  for(let i=0;i<k;i++){const o=i*8,w=ARC[o+2],q0=ARC[o+3],rel=ARC[o+4],R=ARC[o+5];if(pt<q0||R<20)continue;const sweep=w*clamp(pt-q0,0,rel-q0);if(Math.abs(sweep)<.02)continue;
   const fade=pt<=rel?1:clamp(1-(pt-rel)/.45,0,1);if(fade<=0)continue;const a0=ARC[o+6],h=remap?remap[ARC[o+7]|0]:ARC[o+7]|0,col=HUES[h|0]?.[1]??'#ffffff';
   for(let f=0;f<3;f++){const r=R*(1-.2*f);ctx.beginPath();ctx.arc(ARC[o],ARC[o+1],r,a0,a0+sweep,sweep<0);
    ctx.strokeStyle='rgba(7,4,13,.7)';ctx.lineWidth=(f?7:10)/kc;ctx.globalAlpha=.35*fade*op;ctx.stroke();
    ctx.strokeStyle=f?col:'#ffffff';ctx.lineWidth=(f?3:4)/kc;ctx.globalAlpha=(f?.45:.6)*fade*op;ctx.stroke();}}
  ctx.globalAlpha=1;}
 // Native hostile projectiles share the field with RC240 bullets: give each (first NATIVE_CAP, damaging
 // ones only) the same dark outline + white core so both read as one enemy style. Two paths, no images;
 // the iso projection is sampled once per frame (3 project() calls), positions are then affine.
 const NATIVE_CAP=64;
 function drawNative(ctx,s,m,set){const L=s.hostileProjectiles;if(!Array.isArray(L)||!L.length)return 0;
  let ox=640,oy=0,ax=27,ay=13.5,bx=-27,by=13.5;try{const Bp=root.__HAPIL_RC86_BRIDGE__;if(Bp?.project){const o=Bp.project(0,0),p1=Bp.project(1,0),p2=Bp.project(0,1);
   if(o&&p1&&p2&&Number.isFinite(o.x+o.y+p1.x+p1.y+p2.x+p2.y)){ox=o.x;oy=o.y;ax=p1.x-o.x;ay=p1.y-o.y;bx=p2.x-o.x;by=p2.y-o.y;}}}catch(e){}
  const kc=clamp(n(m.kc,1),.2,4),op=fxOpacity(set);let c=0;ctx.globalCompositeOperation='source-over';
  for(let pass=0;pass<2;pass++){ctx.beginPath();c=0;
   for(let i=0;i<L.length&&c<NATIVE_CAP;i++){const q=L[i];if(!q||q.friendly||q.reflected||q.visualOnly||!(n(q.damage)>0))continue;const qx=n(q.x,NaN),qy=n(q.y,NaN);if(!(qx===qx&&qy===qy))continue;
    const x=ox+ax*qx+bx*qy,y=oy+ay*qx+by*qy+n(q.visualYV31333,-18);if(!(x===x&&y===y))continue;c++;
    const r=pass?2.6:clamp(n(q.radius,.45)*15,5,13);ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,TAU);}
   if(!c)return 0;if(pass===0){ctx.strokeStyle='rgba(7,4,13,.9)';ctx.lineWidth=2.2/kc;ctx.globalAlpha=.8*op;ctx.stroke();}else{ctx.fillStyle='#ffffff';ctx.globalAlpha=.9*op;ctx.fill();}}
  ctx.globalAlpha=1;return c;}
 // CSS px per canvas px, refreshed when the canvas size changes or every 120 frames.
 const dprC={cv:null,w:0,r:1,k:0};
 function cssRatio(ctx){const cv=ctx.canvas;if(!cv)return 1;if(cv!==dprC.cv||cv.width!==dprC.w||++dprC.k>120){dprC.cv=cv;dprC.w=cv.width;dprC.k=0;let r=1;try{const b=cv.getBoundingClientRect?.();if(b&&b.width>0)r=cv.width/b.width;}catch(e){}dprC.r=r>0&&Number.isFinite(r)?r:1;}return dprC.r;}
 function drawLayer(ctx,s,set){if(!enabledFlag||!ctx||!s)return;const m=worlds.get(s);if(!m)return;const t0=now();let draws=0;
  // World transform, kept for the screen pass (card vs boss box) and CSS-px line widths.
  try{const M=ctx.getTransform?.();if(M&&Number.isFinite(M.a+M.b+M.c+M.d+M.e+M.f)){const W=m.wm??=new Float64Array(6);W[0]=M.a;W[1]=M.b;W[2]=M.c;W[3]=M.d;W[4]=M.e;W[5]=M.f;m.wmOk=true;m.kc=(Math.hypot(M.a,M.b)||1)/cssRatio(ctx);}}catch(e){}
  // Layering: decoration (sparks, telegraphs) and hero-side visuals under the bullets; bullets on top.
  ctx.save();try{ctx.shadowBlur=0;draws+=drawSparks(ctx,s,m,set);ctx.globalAlpha=1;draws+=drawTele(ctx,s,m,set);ctx.globalAlpha=1;if(m.run&&m.run.sig&&m.run.sig.active){const clip=typeof ctx.clip==='function'&&floorPoly();if(clip)ctx.save();try{if(clip)floorClip(ctx);drawSigTrail(ctx,s,m,set);ctx.globalAlpha=1;drawSwingArc(ctx,s,m,set);}finally{if(clip)ctx.restore();}}ctx.globalAlpha=1;drawNative(ctx,s,m,set);ctx.globalAlpha=1;
   const fd=hook('draw');if(fd){ctx.save();try{draws+=n(fd.call(root.__HAPIL_STG_FEEL_RC240__,ctx,s,m,set));}catch(e){fail(e);}finally{ctx.restore();}}
   ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;draws+=drawBullets(ctx,s,m,set);
   drawHitFx(ctx,s,m,set);drawFocus(ctx,s,m,set);}catch(e){fail(e);}finally{ctx.restore();}
  try{drawScreen(ctx,s,m,set);}catch(e){fail(e);}
  const fs=hook('drawScreen');if(fs){ctx.save();try{fs.call(root.__HAPIL_STG_FEEL_RC240__,ctx,s,m,set);}catch(e){fail(e);}finally{ctx.restore();}}
  const ms=now()-t0;metrics.draws++;metrics.drawImages=draws;metrics.drawMs=metrics.drawMs*.9+ms*.1;metrics.lastDrawMs=ms;}

 // ---------------------------------------------------------------- governor
 const governor={frame:16.7,draw:0,last:0,evalAt:0,calmSince:0,
  sample(frameMs,drawMs,t){if(Number.isFinite(frameMs)&&frameMs>0&&frameMs<250)this.frame=this.frame*.9+frameMs*.1;if(Number.isFinite(drawMs))this.draw=this.draw*.9+drawMs*.1;
   if(t-this.evalAt<500)return;this.evalAt=t;if(!governorOn){gov=1;return;}const live=metrics.live>0;
   const limit=isMobile()?2.5:3;if(live&&(this.frame>19||this.draw>limit)){gov=Math.max(.35,gov*.85);this.calmSince=t;}
   else if(this.frame<17.5){if(t-this.calmSince>=3000){gov=Math.min(1,gov+.05);this.calmSince=t;}}else this.calmSince=t;
   metrics.gov=gov;metrics.frameMs=this.frame;}};
 function rafLoop(t){try{if(governor.last)governor.sample(t-governor.last,(metrics.lastDrawMs??0)+(metrics.bgMs??0),t);governor.last=t;}catch(e){}root.requestAnimationFrame?.(rafLoop);}

 // ---------------------------------------------------------------- seams
 const seams={tick:null,draw:null,danger:null,grammarDraw:null,background:null,imminent:null,decorate:null,lasers:null,grammar:null,loop:null,feedback:null};
 let inTick=false,inLaserDraw=false,inDanger=false;
 function wrapLasers(){const L=root.__HAPIL_LASERS_V31330__;if(!L||typeof L.tick!=='function')return false;
  if(L.tick!==seams.tick){const base=L.tick;const fn=function(s,dt,...rest){if(inTick)return base.call(this,s,dt,...rest);inTick=true;let r;try{r=base.call(this,s,dt,...rest);}finally{try{simTick(s,dt);}catch(e){fail(e);}finally{inTick=false;}}return r;};
   fn.rc240=true;L.tick=fn;seams.tick=fn;metrics.rewraps++;}
  if(typeof L.draw==='function'&&L.draw!==seams.draw){const base=L.draw;const fn=function(ctx,cache,s,set,...rest){if(inLaserDraw)return base.call(this,ctx,cache,s,set,...rest);inLaserDraw=true;try{try{const m=enabledFlag&&s&&worlds.get(s);if(m)drawCircle(ctx,s,m,set);}catch(e){fail(e);}return base.call(this,ctx,cache,s,set,...rest);}finally{inLaserDraw=false;}};
   fn.rc240=true;L.draw=fn;seams.draw=fn;}
  if(typeof L.danger==='function'&&L.danger!==seams.danger){const base=L.danger;const fn=function(s,p,look,...rest){if(inDanger)return base.call(this,s,p,look,...rest);inDanger=true;try{const v=base.call(this,s,p,look,...rest);try{return n(v)+dangerAt(s,p,look??.36);}catch(e){fail(e);return v;}}finally{inDanger=false;}};
   fn.rc240=true;L.danger=fn;seams.danger=fn;}
  seams.lasers=L;return true;}
 let inGrammar=false,inBackground=false,inDecorate=false;
 function wrapGrammar(){const g=root.__HAPIL_GRAMMAR_V31365__;if(!g?.installed||typeof g.draw!=='function')return false;if(g.draw===seams.grammarDraw)return true;
  const base=g.draw;const draw=function(ctx,s,set,...rest){if(inGrammar)return base.call(this,ctx,s,set,...rest);inGrammar=true;let r;try{r=base.call(this,ctx,s,set,...rest);}finally{try{drawLayer(ctx,s,set??{});}catch(e){fail(e);}finally{inGrammar=false;}}return r;};
  const next={...g,draw};for(const k of Object.getOwnPropertyNames(g))if(!(k in next))Object.defineProperty(next,k,Object.getOwnPropertyDescriptor(g,k));
  Object.defineProperty(next,'rc240Wrapped',{value:true});root.__HAPIL_GRAMMAR_V31365__=Object.freeze(next);seams.grammarDraw=draw;seams.grammar=root.__HAPIL_GRAMMAR_V31365__;metrics.rewraps++;return true;}
 function wrapLoop(){const lp=root.__HAPIL_LOOP_V31365__;if(!lp||typeof lp.background!=='function'||typeof lp.imminent!=='function')return false;
  const needBg=!(lp.background===seams.background&&lp.imminent===seams.imminent),needDec=typeof lp.decorateAttack==='function'&&lp.decorateAttack!==seams.decorate;
  if(!needBg&&!needDec)return true;
  const bg=lp.background,im=lp.imminent;
  const background=function(ctx,s,rect,...rest){if(inBackground)return bg.call(this,ctx,s,rect,...rest);inBackground=true;let r;try{r=bg.call(this,ctx,s,rect,...rest);}finally{try{const m=enabledFlag&&s&&worlds.get(s);if(m){const set=settingsNow(),t0=now(),snap=dimOn(s,m)&&dimSnap(ctx),fb=hook('drawBackground');if(fb){ctx.save();try{fb.call(root.__HAPIL_STG_FEEL_RC240__,ctx,s,m,set);}catch(e){fail(e);}finally{ctx.restore();}}drawDim(ctx,s,m,set,snap);metrics.bgMs=metrics.bgMs*.9+(now()-t0)*.1;}}catch(e){fail(e);}finally{inBackground=false;}}return r;};
  const imminentFn=function(s,h,...rest){const r=im.call(this,s,h,...rest);if(r)return r;try{return imminent(s,h)??r;}catch(e){fail(e);return r;}};
  // decorateAttack runs synchronously right after native A rows are queued (B:53060):
  // the STG feel/arcade kit scales new rows there (power level). Base always runs first.
  const dec=lp.decorateAttack,decorateAttack=needDec?function(s,before,...rest){if(inDecorate)return dec.call(this,s,before,...rest);inDecorate=true;let r;try{r=dec.call(this,s,before,...rest);}finally{try{if(enabledFlag&&s)callHook('decorateAttack',s,before);}catch(e){fail(e);}finally{inDecorate=false;}}return r;}:lp.decorateAttack;
  const next={...lp,background:needBg?background:lp.background,imminent:needBg?imminentFn:lp.imminent};if(typeof decorateAttack==='function')next.decorateAttack=decorateAttack;
  for(const k of Object.getOwnPropertyNames(lp))if(!(k in next))Object.defineProperty(next,k,Object.getOwnPropertyDescriptor(lp,k));
  if(!Object.prototype.hasOwnProperty.call(next,'rc240Wrapped'))Object.defineProperty(next,'rc240Wrapped',{value:true});root.__HAPIL_LOOP_V31365__=Object.freeze(next);if(needBg){seams.background=background;seams.imminent=imminentFn;}if(needDec)seams.decorate=decorateAttack;seams.loop=root.__HAPIL_LOOP_V31365__;metrics.rewraps++;return true;}
 // Hides RC129's top-left spell title/timer line while the RC240 banner owns that information.
 let inFeedback=false;
 function titleFilter(title){const full=String(title)+'  |  ';return t=>{t=String(t);if(t.startsWith(full))return true;if(t.endsWith('…')){const p=t.slice(0,-1);return p.length>=Math.min(4,full.length)&&(p.length<=full.length?full.startsWith(p):p.startsWith(full));}return false;};}
 function wrapFeedback(){const F=root.__HAPIL_FEEDBACK_RC128__;if(!F||typeof F.draw!=='function')return false;if(F===seams.feedback)return true;
  const base=F;const draw=function(ctx,s,canvas,settings,...rest){if(inFeedback||!ctx)return base.draw.call(base,ctx,s,canvas,settings,...rest);
   let title=null;try{const m=enabledFlag&&s&&worlds.get(s);if(m?.banner&&!m.midboss){const p=root.__HAPIL_DANMAKU_RC129__?.phase?.(s);if(p?.title)title=p.title;}}catch(e){fail(e);}
   if(!title)return base.draw.call(base,ctx,s,canvas,settings,...rest);
   const own=Object.prototype.hasOwnProperty.call(ctx,'fillText'),prev=ctx.fillText,drop=titleFilter(title);inFeedback=true;
   try{ctx.fillText=function(t,...a){if(drop(t)){metrics.hudHidden++;return;}return prev.call(this,t,...a);};}catch(e){inFeedback=false;return base.draw.call(base,ctx,s,canvas,settings,...rest);}
   try{return base.draw.call(base,ctx,s,canvas,settings,...rest);}finally{inFeedback=false;try{if(own)ctx.fillText=prev;else delete ctx.fillText;}catch(e){fail(e);}}};
  const bridge=Object.create(base);Object.defineProperty(bridge,'draw',{value:draw,enumerable:true});Object.defineProperty(bridge,'rc240Wrapped',{value:true});
  root.__HAPIL_FEEDBACK_RC128__=Object.freeze(bridge);seams.feedback=root.__HAPIL_FEEDBACK_RC128__;metrics.rewraps++;return true;}
 function depsReady(){return !!(root.__HAPIL_LASERS_V31330__?.tick&&root.__HAPIL_GRAMMAR_V31365__?.installed&&root.__HAPIL_COMBAT_V31333__?.core&&root.__HAPIL_NATIVE_ARENA_RC138__?.bodyDamage&&root.__HAPIL_LOOP_V31365__?.imminent&&root.__HAPIL_RC86_BRIDGE__?.project);}
 function recheck(){try{if(!installed)return;wrapLasers();wrapGrammar();wrapLoop();wrapFeedback();injectSettings();}catch(e){fail(e);}}
 function install(){if(installed)return true;if(!depsReady())return false;
  try{if(!wrapLasers()||!wrapGrammar()||!wrapLoop())return false;}catch(e){fail(e);return false;}
  installed=true;metrics.installs++;api.installed=true;try{wrapFeedback();}catch(e){fail(e);}
  try{root.addEventListener?.('keydown',e=>{if(e?.key==='Shift')keys.shift=true;},true);root.addEventListener?.('keyup',e=>{if(e?.key==='Shift')keys.shift=false;},true);root.addEventListener?.('blur',()=>{keys.shift=false;});}catch(e){}
  try{root.setInterval?.(recheck,1000);root.setInterval?.(injectSettings,300);}catch(e){}
  try{if(typeof root.requestAnimationFrame==='function')root.requestAnimationFrame(rafLoop);}catch(e){}
  return true;}

 // ---------------------------------------------------------------- settings UI
 function injectSettings(){try{const d=root.document;if(!d?.querySelector)return;const host=d.querySelector('.settings-layout');if(!host)return;
  let sec=host.querySelector('.rc240-danmaku-settings');
  if(!sec){sec=d.createElement('section');sec.className='rc240-danmaku-settings';
   sec.innerHTML='<h3>탄막</h3><div class="settings-list"><label><span><b>탄막 밀도</b><small>보스 주문 탄막의 양을 조절합니다. 이 브라우저에만 저장됩니다.</small></span><select aria-label="탄막 밀도" data-rc240-density=""><option value="low">낮음</option><option value="normal">보통</option><option value="high">높음</option></select></label></div>';
   const sel=sec.querySelector('select');sel.addEventListener('change',e=>api.setDensity(e.target.value));
   const anchor=[...host.querySelectorAll(':scope > section')].find(x=>/화면/.test(x.querySelector('h3')?.textContent??''));
   if(anchor?.after)anchor.after(sec);else host.appendChild(sec);}
  const sel=sec.querySelector('select');if(sel&&sel.value!==densityKey&&d.activeElement!==sel)sel.value=densityKey;}catch(e){fail(e);}}

 // ---------------------------------------------------------------- API
 function currentState(){try{return root.__HAPIL_CONTROLS_V31329__?.binding?.state?.current??root.__MONGSE_QA_STATE__??null;}catch(e){return null;}}
 const api={version:VERSION,installed:false,
  enabled:()=>enabledFlag,
  setEnabled(v){enabledFlag=!!v;if(!enabledFlag){const s=currentState(),m=s&&worlds.get(s);if(m)resetWorld(s,m,'disabled');}return enabledFlag;},
  density:()=>densityKey,
  setDensity(v){if(!DENSITY[v])return densityKey;densityKey=v;try{root.localStorage?.setItem?.(STORE_KEY,v);}catch(e){}return densityKey;},
  setGovernor(v){governorOn=!!v;if(!governorOn){gov=1;metrics.gov=1;}return governorOn;},
  metrics:()=>({...metrics,enabled:enabledFlag,density:densityKey,gov,installed,lastError}),
  snapshot(s=currentState()){const m=s&&worlds.get(s);if(!m)return null;const P=m.pool,rows=[];for(let i=0;i<P.live;i++)rows.push({x:P.x[i],y:P.y[i],vx:P.vx[i],vy:P.vy[i],type:P.type[i],hue:P.hue[i],age:P.age[i],sig:(P.flags[i]&F_SIG)?1:0});
   return {zone:m.zone,live:P.live,peak:P.peak,spell:m.spell?.id??null,spellName:m.spell?.name??null,serial:m.serial,owner:m.ownerId,family:m.family,lite:m.lite,midboss:m.midboss,band:m.runBand??null,weapon:m.weapon?{id:m.weapon.id,what:m.weapon.what,fallback:m.weapon.fallback}:null,sig:m.run&&m.run.sig?{active:m.run.sig.active,phrases:m.run.sig.phrases,t:m.run.t-m.run.sig.t0,last:m.run.sig.last}:null,dim:m.dim,sparks:m.sparks.length,budget:m.ctx?.budget??null,rows};},
  clear(s=currentState()){const m=s&&worlds.get(s);if(m)resetWorld(s,m,'api');},
  cutSegment(s,ax,ay,bx,by,hw,maxN,cb){if(!enabledFlag)return 0;return cutSegment(s,n(ax),n(ay),n(bx),n(by),Math.max(0,n(hw)),maxN,cb);},
  cancelAll(s,reason='wipe',x,y){const m=enabledFlag&&s&&worlds.get(s);if(!m)return 0;return cancelAll(s,m,settingsNow(),String(reason),x,y);},
  cancelNear(s,x,y,r,reason='wipe'){const m=enabledFlag&&s&&worlds.get(s);if(!m)return 0;return cancelNear(s,m,settingsNow(),n(x),n(y),Math.max(0,n(r)),String(reason));},
  live(s){const m=s&&worlds.get(s);return m?m.pool.live:0;},
  imminent(s,h=.2){if(!enabledFlag||!s)return null;try{return imminent(s,h);}catch(e){fail(e);return null;}},
  world:s=>(s&&worlds.get(s))||null,
  util:Object.freeze({heroPalette,HERO_SIDE,REMAP,screenSpace,hudText,fitText,project,heart,muzzle,fullAuto,dActive,gmode,settingsNow,fxOpacity,FIELD,HUES,T,HIT}),
  __test:{SPELLS,FAMILY_SPELLS,MODES,FIELD,CULL,HIT,T,HUES,HERO_V,HEART_R,DENSITY,LIVE_CAP,createPool,makeRun,runStep,makeCtx,frameCtx,spawn,stepPool,sweptDist,safeY,peakFor,spellFor,familyOf,headless,mulberry32,hash,
   simTick:(s,dt)=>simTick(s,dt),bodyPaint,drawDim,floorFade,floorPoly,drawLayer:(c,s,set)=>drawLayer(c,s,set),dangerAt,imminent,governor,install,recheck,worlds,mem:s=>worlds.get(s),injectSettings,
   getGov:()=>gov,setGov:v=>{gov=v;},seams,drawScreen,drawBanner,wrapFeedback,volleyPlan,VOLLEY,TELE_MIN,REMAP,HERO_SIDE,heroPalette,titleFilter,fitText,WEAPON_GENS:GEN,BOSS_WEAPONS,WEAPON_ROWS,MB_NAMES,FAMILY_WEAPON,weaponFor,SIG,F_SIG,sigCount,makeSig,sigStep}};
 root.__HAPIL_DANMAKU_RC240__=api;
 let attempts=0;(function ready(){if(!install()&&++attempts<1200)root.setTimeout?.(ready,10);})();
})(typeof window==='object'?window:globalThis);
