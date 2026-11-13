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
  ['white','#f4f4ff','#6a6a8a'],['lime','#b6ff4a','#3f7a00'],['pink','#ff6fb5','#8a1a52'],['gold','#ffcf3a','#7a5200']];
 const H={};HUES.forEach((h,i)=>H[h[0]]=i);
 const MODES=Object.freeze({
  STORY:{peakPc:[130,180,280],vs:1,vmin:55,vmax:120,vaim:130,dens:1.55,dmg:.04,mercy:1.5,clear:140,cap:.18,excl:160,lane:58},
  HELL:{peakPc:[160,220,340],vs:1.15,vmin:60,vmax:140,vaim:150,dens:1.75,dmg:.06,mercy:1.1,clear:100,cap:.24,excl:130,lane:50},
  DREAM:{peakPc:[190,260,400],vs:1.35,vmin:70,vmax:165,vaim:180,dens:2.05,dmg:.08,mercy:.9,clear:80,cap:.30,excl:110,lane:44}});
 const DENSITY=Object.freeze({low:.6,normal:1,high:1.3});
 const MOBILE_MUL=.55,AUTO_MUL=.75;
 const LIVE_CAP=Object.freeze({pc:640,mobile:260,lowFx:200});
 const POOL_CAP=Object.freeze({pc:1024,mobile:384});
 const SPARK_CAP=Object.freeze({pc:320,mobile:96,lowFx:64});
 const BAND_DENS=[.68,.84,1.12],BAND_SPEED=[1,1.05,1.1];
 const STORE_KEY='hapil.danmakuDensityRC240';

 // ---------------------------------------------------------------- pool (SoA)
 const FIELDS=['x','y','px','py','vx','vy','ang','spd','acc','vmin','vmax','om','amp','aT','aPh','gvx','gvy','gy','age','life','stAt','stKind','stA','stB','stC','stD','stE','type','hue','flags','bounce','ox','oy','dir'];
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
   {kind:'fan',period:2.3,start:1.1,lite:false,bandMin:2,p:{n:4,step:11,spd:118,type:T.RICE,hue:H.red,line:2}}]},
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
   {kind:'fan',period:2.0,start:1.4,bandMin:2,lite:false,p:{n:4,step:10,spd:112,type:T.RICE,hue:H.yellow}}]},
  {id:'S5',dens:2.6,key:'order-seal',name:'율법 「봉인 격자」',hues:['blue','white'],circle:'blue',layers:[
   {kind:'lattice',period:.5,p:{offs:[-120,-40,40,120],ang:22,spd:96,type:T.NEEDLE,hue:H.cyan,hue2:H.blue,wobble:0}},
   {kind:'fan',period:1.9,start:.9,lite:false,p:{n:4,step:14,spd:110,type:T.STAR,hue:H.gold}},
   {kind:'wall',period:2.6,start:1.3,bandMin:3,lite:false,p:{spacing:42,vx:84,crest:0,gap:96,type:T.ORB,hue:H.white}}]},
  {id:'S6',dens:1.4,key:'petal-nebula',name:'몽화 「피어나는 성운」',hues:['violet','cyan'],circle:'violet',layers:[
   {kind:'spiral',period:.11,p:{arms:4,om:1.1,spd:78,acc:16,vmax:118,type:T.ORB,hue:H.violet,hue2:H.cyan,cosMin:.05}},
   {kind:'bloom',period:1.9,start:.7,lite:false,p:{count:2,off:15,spd:92,acc:-20,splitAt:1.9,hue:H.cyan,ring:{n:12,spd:56,type:T.ORB,hue:H.violet}}},
   {kind:'spiral',period:.16,bandMin:3,lite:false,p:{arms:6,om:-.9,flip:4,spd:84,type:T.STAR,hue:H.white,cosMin:.2}}]},
  {id:'S7',dens:0.85,key:'pride-crowns',name:'교만 「추락하는 일곱 왕관」',hues:['gold','red'],circle:'gold',layers:[
   {kind:'arc',period:.95,p:{n:30,arc:190,spd:150,acc:-150,vmin:50,type:T.ORB,hue:H.gold,sway:5,gapW:1.9}},
   {kind:'crowns',period:2.2,start:.6,lite:false,p:{n:6,vy:60,hue:H.red,fan:{n:5,spd:70,spread:1.3,type:T.RICE,hue:H.orange}}},
   {kind:'decel',period:2.6,start:1.4,bandMin:3,lite:false,p:{n:5,spread:70,v0:170,dec:340,stopAt:.5,hold:.7,v1:110,type:T.STAR,hue:H.white}}]},
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
 const REMAP_SRC=Object.freeze({rage:{gold:'violet',red:'violet',orange:'cyan',yellow:'white',lime:'cyan',green:'blue',pink:'violet'},envy:{cyan:'magenta',green:'yellow',blue:'red',lime:'yellow'},
  greed:{cyan:'blue'},gluttony:{cyan:'blue'},obsession:{cyan:'blue'},order:{cyan:'blue'},petal:{cyan:'blue'},lucifer:{cyan:'blue'}});
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
  const layers=spell.layers.filter((l,i)=>band>=(l.bandMin||1)&&(!o.lite||i===0||(l.kind!=="fan"&&l.kind!=="decel"&&!o.midboss)));
  return {spell,band,lite:!!o.lite,seed:n(o.seed,0)>>>0,t:0,layers,next:layers.map(l=>n(l.start,0)),beats:layers.map(()=>0),emitEnd:n(o.emitEnd,1e9)};}
 function layerPeriod(run,l,ctx){const aimed=l.kind==='fan'||l.kind==='decel';return l.period/(aimed?clamp(ctx.dens,.2,1):Math.max(.2,ctx.dens*n(run.spell.dens,1)));}
 function runStep(run,dt,ctx,out){run.t+=dt;if(run.t>run.emitEnd)return 0;let c=0;
  for(let i=0;i<run.layers.length;i++){const l=run.layers[i];let guard=0;
   const aimedL=l.kind==='fan'||l.kind==='decel';
   while(run.next[i]<=run.t&&guard++<4){const k=run.beats[i]++;if(ctx.soft&&(aimedL||k%5>(ctx.band===3?3:2))){run.next[i]+=layerPeriod(run,l,ctx);continue;}ctx.beatT=run.next[i];const rng=mulberry32(hash(run.seed,run.spell.id,i,k));
    const before=out.length;EMIT[l.kind](l.p,k,rng,ctx,out);for(let j=before;j<out.length;j++){out[j].layer=i;out[j].pre=Math.max(0,run.t-run.next[i]);}c+=out.length-before;
    run.next[i]+=layerPeriod(run,l,ctx);}}
  return c;}

 // ---------------------------------------------------------------- fast aimed volleys (between spells)
 // Few fast shots aimed at the heart with zero lead. Every volley is telegraphed
 // >= .3 s (muzzle flash + thin aim line that tracks the heart) before release,
 // so the answer is a positional sidestep, not memorisation.
 const VOLLEY=Object.freeze({STORY:{n:[3,5],spd:260,period:1.7,tele:.42},HELL:{n:[4,6],spd:300,period:1.4,tele:.36},DREAM:{n:[5,7],spd:340,period:1.15,tele:.32}});
 const TELE_MIN=.3;
 function volleyPlan(mode,band,mobile,auto,k,rng){const V=VOLLEY[modeKey(mode)],red=reduceMul(mobile,auto);
  const n=clamp(Math.round((V.n[0]+(V.n[1]-V.n[0])*rng()+(band-1)*.5)*Math.max(.7,red)),3,7);
  return {n,spd:clamp(V.spd*(mobile?.92:1)*(auto?.9:1),240,340),tele:Math.max(TELE_MIN,V.tele+(mobile?.08:0)+(auto?.1:0)),stream:k%3===1,spread:.12+.02*n,gap:.075,period:V.period/Math.max(.45,red)};}
 function volleyShot(x,y,ang,spd,remapHue,j){return spec(x,y,ang,spd,j%2?T.RICE:T.NEEDLE,remapHue,{flags:F_AIMED|F_FAST,vmax:spd*1.02,life:6});}

 // ---------------------------------------------------------------- spawn & sim (pure)
 function spawn(pool,b,ctx){if(pool.live>=pool.cap||pool.live>=ctx.budget)return false;
  const dx=b.x-ctx.hx,dy=b.y-ctx.hy;if(dx*dx+dy*dy<ctx.excl*ctx.excl){ctx.excluded=(ctx.excluded|0)+1;return false;}
  const aimed=(b.flags&F_AIMED)!==0,vmax=aimed?ctx.vaim:ctx.vmax;
  const i=pool.live++;pool.spawned++;if(pool.live>pool.peak)pool.peak=pool.live;
  let spd=b.spd;if(b.stKind!==1&&!(b.flags&(F_REVERSE|F_FAST))&&b.type!==T.BIG)spd=clamp(spd,Math.min(spd,ctx.vmin),vmax);
  pool.x[i]=b.x;pool.y[i]=b.y;pool.px[i]=b.x;pool.py[i]=b.y;pool.ox[i]=b.x;pool.oy[i]=b.y;pool.ang[i]=b.ang;pool.spd[i]=spd;pool.acc[i]=b.acc;
  pool.vmin[i]=b.vmin;pool.vmax[i]=Math.min(b.vmax,b.flags&(F_REVERSE|F_FAST)?b.vmax:vmax*1.05);pool.om[i]=b.om;pool.amp[i]=b.amp;pool.aT[i]=b.aT||1;pool.aPh[i]=b.aPh;
  pool.gvx[i]=b.gvx;pool.gvy[i]=b.gvy;pool.gy[i]=b.gy;pool.age[i]=0;pool.life[i]=b.life;pool.stAt[i]=b.stAt;pool.stKind[i]=b.stKind;
  pool.stA[i]=b.stA;pool.stB[i]=b.stB;pool.stC[i]=b.stC;pool.stD[i]=b.stD;pool.stE[i]=b.stE;pool.type[i]=b.type;pool.hue[i]=ctx.remap?ctx.remap[b.hue]:b.hue;pool.flags[i]=b.flags;pool.bounce[i]=b.bounce;
  pool.vx[i]=Math.cos(b.ang)*spd+b.gvx;pool.vy[i]=Math.sin(b.ang)*spd+b.gvy;pool.dir[i]=Math.atan2(pool.vy[i],pool.vx[i]);
  if(ctx.spawnLog){const d=Math.sqrt(dx*dx+dy*dy);if(d<ctx.spawnLog.minDist)ctx.spawnLog.minDist=d;}
  return true;}
 // Advance all bullets by h seconds of travel; stage effects push child specs into out.
 function stepPool(pool,h,ctx,out,removed){
  for(let i=pool.live-1;i>=0;i--){
   const age=pool.age[i]+h;pool.age[i]=age;pool.px[i]=pool.x[i];pool.py[i]=pool.y[i];
   if(pool.stKind[i]>0&&!(pool.flags[i]&F_STAGED)&&age>=pool.stAt[i]){
    pool.flags[i]|=F_STAGED;const kind=pool.stKind[i];
    if(kind===1){if(ctx.auto||!(pool.flags[i]&F_AIMED))pool.ang[i]=ctx.dir+(pool.ang[i]-ctx.dir)*.35;else pool.ang[i]=Math.atan2(ctx.ay-pool.y[i],ctx.ax-pool.x[i]);pool.spd[i]=pool.stA[i];pool.acc[i]=0;pool.vmin[i]=0;}
    else if(kind===2){const x=pool.x[i],y=pool.y[i],cnt=pool.stA[i]|0,sp=pool.stB[i],ct=pool.stC[i]|0,ty=ct>>4,hu=ct&15,rose=pool.stD[i],center=pool.stE[i];
     const dx=x-ctx.hx,dy=y-ctx.hy;if(dx*dx+dy*dy>=ctx.excl*ctx.excl*(Number.isFinite(center)?1:.6)){
      const fan=Number.isFinite(center),base=fan?center:(ctx.seed%31)*.2+age;
      for(let j=0;j<cnt;j++){let a,v=sp;if(fan){a=center+(j-(cnt-1)/2)*(rose/Math.max(1,cnt-1));}else{a=base+j*TAU/cnt;if(rose>0)v=sp*(.45+.85*Math.abs(Math.cos(rose*(a-base))));}
       out.push(spec(x,y,a,v,ty,hu,{life:12}));}}
     if(removed)removed.push(x,y,pool.hue[i],pool.type[i]);poolRemove(pool,i);continue;}
   }
   let spd=pool.spd[i]+pool.acc[i]*h;if(spd<pool.vmin[i])spd=pool.vmin[i];if(spd>pool.vmax[i])spd=pool.vmax[i];pool.spd[i]=spd;
   if(pool.om[i]!==0)pool.ang[i]+=pool.om[i]*h;
   if(pool.gy[i]!==0)pool.gvy[i]+=pool.gy[i]*h;
   const a=pool.ang[i],c=Math.cos(a),s=Math.sin(a);let vx=c*spd+pool.gvx[i],vy=s*spd+pool.gvy[i];
   if(pool.amp[i]!==0){const w=TAU/pool.aT[i],q=pool.amp[i]*w*Math.cos(w*age+pool.aPh[i]);vx+=-s*q;vy+=c*q;}
   const f=ctx.travel;let x=pool.x[i]+vx*h*f,y=pool.y[i]+vy*h*f;
   if(pool.bounce[i]>0&&((y<FIELD.y0&&vy<0)||(y>FIELD.y1&&vy>0))){pool.bounce[i]--;pool.ang[i]=-pool.ang[i];pool.gvy[i]=-pool.gvy[i];vy=-vy;y=y<FIELD.y0?2*FIELD.y0-y:2*FIELD.y1-y;}
   pool.x[i]=x;pool.y[i]=y;pool.vx[i]=vx;pool.vy[i]=vy;if(pool.type[i]===T.RICE||pool.type[i]===T.NEEDLE)pool.dir[i]=Math.atan2(vy,vx);
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
  const seed=n(o.seed,0)>>>0;
  return {mode:modeKey(o.mode),band,mobile,auto,vs,vmin:M.vmin,vmax:M.vmax*(o.midboss?.9:1),vaim:M.vaim,dens,budget:Math.floor(budget),peak:Math.floor(budget),
   remap:o.remap||null,excl:M.excl+(mobile?30:0),gapMul:band===3?.85:band===2?.93:1,lane:M.lane+(mobile?12:0)+(auto?20:0),seed,dir:PI,phi:PI,gapHalf:0,
   bx:1071,by:425,hx:520,hy:520,ax:520,ay:520,beatT:0,travel:1,excluded:0,ySafeAt:t=>safeY(t,seed),spawnLog:null};}
 function frameCtx(ctx,bx,by,hx,hy,ax,ay,t){ctx.bx=bx;ctx.by=by;ctx.hx=hx;ctx.hy=hy;ctx.ax=ax;ctx.ay=ay;ctx.dir=hx<bx?PI:0;
  const ys=safeY(t,ctx.seed),dist=Math.max(60,Math.hypot(hx-bx,ys-by));ctx.phi=Math.atan2(ys-by,hx-bx);ctx.gapHalf=Math.atan2(ctx.lane/2+6,dist)*Math.max(.85,ctx.gapMul);return ctx;}

 // Headless simulation helper for tests: same emitters, pool and stage code.
 function headless(o={}){const ctx=makeCtx(o),pool=createPool(o.mobile?POOL_CAP.mobile:POOL_CAP.pc),M=MODES[ctx.mode];
  const dur=ctx.mode==='DREAM'?10:12,decl=ctx.mode==='DREAM'?.8:1,emitEnd=dur-.6-decl;
  const run=makeRun(o.spell,{band:ctx.band,seed:ctx.seed,lite:o.lite,emitEnd});const out=[];ctx.spawnLog={minDist:1e9};
  let t=0;const bx=n(o.bx,1071),by=n(o.by,425);
  return {ctx,pool,run,duration:dur,declare:decl,
   step(h,hx,hy,ax,ay){t+=h;frameCtx(ctx,bx,by,hx,hy,ax??hx,ay??hy,run.t);out.length=0;if(t>=decl)runStep(run,h,ctx,out);
    for(const b of out)spawn(pool,b,ctx);out.length=0;stepPool(pool,h,ctx,out,null);for(const b of out)spawn(pool,b,ctx);return t;},
   get time(){return t;},M};}

 // ---------------------------------------------------------------- runtime state
 const metrics={installs:0,rewraps:0,ticks:0,steps:0,spawned:0,hits:0,mercyBlocks:0,capped:0,absorbed:0,dCredits:0,perfectForwards:0,grazes:0,grazeRes:0,
  hudHidden:0,volleys:0,teleMin:9,volleyNMin:99,volleyNMax:0,cancels:0,fillerSpawned:0,filler:0,spells:0,bonuses:0,holds:0,holdReasons:{},errors:0,draws:0,drawImages:0,drawMs:0,bgMs:0,frameMs:16.7,gov:1,peak:0,live:0,sparks:0,oneShotGuards:0,dangerCalls:0,imminentHits:0};
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
  m.warnHoldUntil=-1;m.spawnGuardUntil=-1;m.fillerPauseUntil=n(s.time)+.8;callHook('reset',s,reason);}

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
  const decl=mode==='DREAM'?.8:1,emitEnd=Math.max(1,ph.duration-.6-decl);
  m.family=fam;m.spell=SPELL_BY_ID[pick.id];m.lite=(pick.lite&&ph.band<3)||mid;m.midboss=mid;m.ownerId=a.id;m.serial=ph.serial;m.spellIndex=ph.index;m.bossName=String(a.name??'보스');
  const seed=hash(a.id,ph.serial,s.zone);
  m.run=makeRun(pick.id,{band:ph.band,seed,lite:m.lite,midboss:mid,emitEnd});m.runBand=ph.band;m.decl=decl;m.declLeft=Math.max(0,decl-n(ph.elapsed));m.spellHit=false;m.dTime=0;m.hold=0;m.winding=false;m.released=true;
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
  m.run=null;m.dimTarget=0;m.fillerPauseUntil=s.time+.6;}
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
  if(m.ownerId!=null&&(!a||String(a.id)!==String(m.ownerId))){if(m.run)endSpell(s,m,set,'owner');m.ownerId=null;m.serial=null;}
  if(!a&&m.pool.live&&m.fillerOwner!=null)cancelAll(s,m,set,'owner',m.lastMuzzle?.x,m.lastMuzzle?.y);
  if(!a){m.tele=[];m.fillerOwner=null;}
  if(a&&String(m.feelOwner)!==String(a.id)){m.feelOwner=a.id;callHook('onOwner',s,m,a);}
  let ph=null;if(a)ph=phaseOf(s,m,a,dt);
  const warnHold=s.time<n(m.warnHoldUntil,-1);
  if(ph&&ph.serial!==m.serial&&m.run)endSpell(s,m,set,m.lastPhase?.stage==='active'?'spell-end':'serial');
  if(ph&&ph.stage!=='active'&&m.run){if(m.banner)m.banner.elapsedAtEnd=m.lastPhase?.elapsed;endSpell(s,m,set,'spell-end');m.serial=ph.serial;}
  if(ph&&ph.stage==='active'&&ph.serial!==m.serial&&!warnHold)beginSpell(s,m,a,ph,set);
  if(ph&&m.banner){m.banner.remaining=ph.remaining;m.banner.elapsedAtEnd=ph.elapsed;}
  m.lastPhase=ph;m.owner=a;
  // Frame constants.
  const H0=heart(s);m.hx=H0.x;m.hy=H0.y;
  if(s.time-m.histAt>=.05){m.hist.push({t:s.time,x:H0.x,y:H0.y});m.histAt=s.time;while(m.hist.length>16)m.hist.shift();}
  const past=m.hist.find(h=>h.t>=s.time-.5)??m.hist[0]??{x:H0.x,y:H0.y};
  let travel=1;try{travel=n(root.__HAPIL_SAMONG_RC91__?.incomingFactor?.(s),1);}catch(e){}travel=clamp(travel,.25,2);
  const auto=fullAuto(s,set),mode=gmode(s);
  const native=(s.hostileProjectiles??[]).reduce((c,q)=>c+(q&&n(q.damage)>0&&!q.friendly&&!q.reflected&&!q.visualOnly?1:0),0);
  if(m.run){const key=[mode,m.runBand,mobile,auto,densityKey,lowFx,m.lite,m.midboss,Math.round(gov*20)].join('|');
   if(!m.ctx||m.ctxKey!==key||m.ctx.seed!==m.run.seed){m.ctx=makeCtx({remap:REMAP[m.family]||null,mode,band:m.runBand,mobile,auto,setting:DENSITY[densityKey],gov,lite:m.lite&&!m.midboss,midboss:m.midboss,seed:m.run.seed,liveCap:lowFx?LIVE_CAP.lowFx:mobile?LIVE_CAP.mobile:LIVE_CAP.pc});m.ctxKey=key;}}
  const ctx=m.ctx??makeCtx({mode,band:1,mobile,auto});m.ctx=ctx;ctx.travel=travel;
  // Volley stream: fast telegraphed aimed shots between spells and through declaration gaps.
  let fctx=null,fillerOn=false;
  if(a){const band=ph?.band??1,fam=familyOf(a);
   if(String(m.fillerOwner)!==String(a.id)){m.fillerOwner=a.id;m.tele=[];m.vNext=s.time+.6;m.vK=0;}
   const fkey=[mode,band,mobile,auto,densityKey,lowFx,!a.boss,fam,Math.round(gov*20)].join('|');
   if(!m.fctx||m.fctxKey!==fkey){m.fctx=makeCtx({remap:REMAP[fam]||null,mode,band,mobile,auto,setting:DENSITY[densityKey],gov,midboss:!a.boss,seed:hash(a.id,'volley'),liveCap:lowFx?LIVE_CAP.lowFx:mobile?LIVE_CAP.mobile:LIVE_CAP.pc});m.fctxKey=fkey;}
   fctx=m.fctx;fctx.travel=travel;
   const why=(!m.run||m.declLeft>0)?heldByCast(s,a,true):'';
   fillerOn=(!m.run||m.declLeft>0)&&!m.winding&&why!=='locked'&&s.time>=m.mercyUntil&&s.time>=n(m.fillerPauseUntil,-1)&&!warnHold;
   m.volleyQuiet=why==='cast';}
  if(!fillerOn&&m.tele?.length&&(s.time<m.mercyUntil||!a))m.tele.length=0;
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
   if(m.run&&m.declLeft>0)m.declLeft-=h;else if(m.run&&!held&&!m.winding&&!warnHold)runStep(m.run,h,ctx,scratch);
   if(fillerOn&&fctx){const st=s.time;frameCtx(fctx,mz.x,mz.y,H0.x,H0.y,past.x,past.y,0);const fe=fctx.excl;if(guard)fctx.excl=Math.max(fe,160);
    fctx.budget=Math.floor(Math.min(fctx.peak,Math.max(fctx.peak*.85,fctx.peak-1.5*native)));
    if(st>=n(m.vNext,0)&&(m.tele??=[]).length<(m.volleyQuiet?1:2)){const k=m.vK=(m.vK|0)+1,rng=mulberry32(hash(m.fillerOwner,'v',k,s.zone));const plan=volleyPlan(mode,ph?.band??1,mobile,auto,k,rng);
     const oy=[0,-36,36][k%3],ox=mz.x,y0=mz.y+oy;m.tele.push({born:st,fire:st+plan.tele,x:ox,y:y0,ang:Math.atan2(H0.y-y0,H0.x-ox),plan,shot:0,next:0,hue:(REMAP[familyOf(a)]??null)?.[k%2?H.magenta:H.red]??(k%2?H.magenta:H.red)});m.vNext=st+plan.period*(m.volleyQuiet?1.6:1);metrics.volleys++;}// boss casts: sparser, one telegraph at a time
    for(const v of m.tele??[]){if(v.shot===0)v.ang=Math.atan2(H0.y-v.y,H0.x-v.x);// track until release; zero lead
     if(st<v.fire)continue;const P=v.plan;
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
 function bodyPaint(g,type,hue,frame,mobile){const [,base,shade]=HUES[hue];const ow=mobile?2:1.3;
  const grad=(r,core)=>{const G=g.createRadialGradient(0,0,0,0,0,r);G.addColorStop(0,'#ffffff');G.addColorStop(clamp(core/r*1.05,0,1),'#ffffff');G.addColorStop(clamp(core/r*1.3,0,1),mix(base,'#ffffff',.55));G.addColorStop(.72,base);G.addColorStop(1,mix(shade,'#000000',.1));return G;};
  g.fillStyle='rgba(7,4,13,.92)';g.strokeStyle='rgba(7,4,13,.92)';
  if(type===T.DOT||type===T.ORB||type===T.BIG){const core=HIT[type],body=[6.5,10.5,19][type],out=[8,12.3,21.5][type]+(mobile?.6:0),halo=HALO[type];
   // Baked soft halo (source-over): reads as glow on the dimmed field without an extra draw call.
   const HG=g.createRadialGradient(0,0,out*.9,0,0,halo);HG.addColorStop(0,rgba(base,.55));HG.addColorStop(.45,rgba(base,.2));HG.addColorStop(1,rgba(base,0));g.fillStyle=HG;g.beginPath();g.arc(0,0,halo,0,TAU);g.fill();
   g.fillStyle='rgba(7,4,13,.92)';g.beginPath();g.arc(0,0,out,0,TAU);g.fill();g.fillStyle=grad(body,core);g.beginPath();g.arc(0,0,body,0,TAU);g.fill();
   g.strokeStyle=mix(base,'#ffffff',.3);g.lineWidth=.8;g.beginPath();g.arc(0,0,core*1.12,0,TAU);g.stroke();
   g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(-.3*core,-.35*core,.35*core,0,TAU);g.fill();return;}
  const rot=frame*TAU/FRAMES[type];g.rotate(rot);g.scale(1.15,1.15);
  if(type===T.RICE){g.save();g.scale(1,(3.6+ow)/(7.5+ow));g.beginPath();g.arc(0,0,7.5+ow,0,TAU);g.fill();g.restore();
   g.save();g.scale(1,3.6/7.5);g.fillStyle=grad(7.5,3.2);g.beginPath();g.arc(0,0,7.5,0,TAU);g.fill();g.restore();
   g.fillStyle='#ffffff';g.save();g.scale(1,1.6/3);g.beginPath();g.arc(0,0,3,0,TAU);g.fill();g.restore();return;}
  if(type===T.NEEDLE){const path=(L,W)=>{g.beginPath();g.moveTo(L,0);g.lineTo(-L*.2,W);g.lineTo(-L,0);g.lineTo(-L*.2,-W);g.closePath();};
   path(11+ow,2.8+ow);g.fill();const G=g.createLinearGradient(0,-2.8,0,2.8);G.addColorStop(0,shade);G.addColorStop(.5,base);G.addColorStop(1,shade);g.fillStyle=G;path(11,2.8);g.fill();
   g.strokeStyle='#ffffff';g.lineWidth=1.2;g.lineCap='round';g.beginPath();g.moveTo(-6,0);g.lineTo(6,0);g.stroke();return;}
  if(type===T.STAR){const star=(R,r)=>{g.beginPath();for(let j=0;j<10;j++){const a=-PI/2+j*PI/5,rr=j%2?r:R;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();};
   star(7.5+ow,3.4+ow);g.fill();g.fillStyle=grad(7.5,3.5);star(7.5,3.4);g.fill();g.fillStyle='#ffffff';g.beginPath();g.arc(0,0,3.5*.9,0,TAU);g.fill();}}
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
 function drawBullets(ctx,s,m,set){const P=m.pool,N=P.live;if(!N)return 0;ensureAtlas(ctx);let draws=0;const t=s.time,mobile=m.mobile,low=!!set?.lowFx,quiet=!!set?.reducedFlash;
  // Glow pass ('lighter').
  const gA=.55*Math.min(1,Math.sqrt(140/Math.max(140,N)))*fxOpacity(set)*(low?.35/.55:1)*(quiet?.6:1);
  if(gA>.01){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=gA;
   // Glow budget <= 45% of bullets: large/medium first, small dots only with leftover budget.
   let budget=Math.floor(N*.45)+4;
   for(let pass=0;pass<2&&budget>0;pass++)for(let i=0;i<N&&budget>0;i++){const ty=P.type[i]|0;if((ty===T.DOT)!==(pass===1))continue;if(low&&ty!==T.BIG)continue;if(mobile&&!(ty===T.ORB||ty===T.BIG))continue;if(ty===T.DOT&&N>250)continue;
    const g=glowSprite(P.hue[i]|0);if(!g)continue;const r=GLOW[ty]*(P.age[i]<.14?1.4:1);ctx.drawImage(g.c,P.x[i]-r,P.y[i]-r,2*r,2*r);draws++;budget--;}}
  // Body pass (source-over, honest cores).
  ctx.globalCompositeOperation='source-over';let alpha=-1;const bloom=mobile?.18:.14;
  for(const ty of DRAW_ORDER)for(let i=0;i<N;i++){if((P.type[i]|0)!==ty)continue;const sp=bodySprite(ty,P.hue[i]|0,mobile);if(!sp)continue;
   const age=P.age[i];let a=edgeAlpha(P.x[i],P.y[i]),sc=1;if(age<bloom){const u=age/bloom,e=1-(1-u)*(1-u)*(1-u);sc=1.8-.8*e;a*=e;}
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
   if(F&&!set?.reducedFlash){const u=(s.time-F.at)/F.dur;if(u>=0&&u<1){ctx.globalAlpha=F.peak*(1-u)*fxOpacity(set);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);}}
   if(B)drawBanner(ctx,s,m,set,B,w,h);
  }finally{ctx.restore();}}
 // The world pass hides canvas text while combat info is compact (V31317
 // presentation context). The spell banner is HUD chrome like RC129's HUD, so it
 // draws through the prototype method rather than the suppressed own property.
 function fitText(ctx,t,max){t=String(t);if(!ctx.measureText)return t;if((ctx.measureText(t)?.width??0)<=max)return t;while(t.length>1&&(ctx.measureText(t+'…')?.width??0)>max)t=t.slice(0,-1);return t+'…';}
 function hudText(ctx,t,x,y){const f=Object.getPrototypeOf(ctx)?.fillText;if(typeof f==='function')f.call(ctx,t,x,y);else ctx.fillText?.(t,x,y);}
 function drawBanner(ctx,s,m,set,B,w,h){const age=s.time-B.born,mobile=m.mobile||w<800,hue=HUES[B.hue]?.[1]??'#b45cff';
  if(B.result&&s.time-B.resultAt>(B.result==='capture'?1.2:.8)&&!m.run){m.banner=null;return;}
  const ease=u=>1-Math.pow(1-clamp(u,0,1),3);let big=1;if(age>1.52)big=1-ease((age-1.52)/.35);
  // Two columns: [boss line / spell name] | [timer / bonus]. Rows never share a band.
  const stripH=(mobile?40:50)+(mobile?6:8)*big,y=(h*.24)*big+(mobile?74:62)*(1-big),slide=ease(age/.22),yT=y-stripH/2;
  const x0=w*.4*big+(w-(mobile?264:360))*(1-big),x1=w-16*(1-big),x=x0+(1-slide)*(w-x0);
  ctx.globalAlpha=1;const G=ctx.createLinearGradient(x,0,x1,0);G.addColorStop(0,'rgba(6,4,14,0)');G.addColorStop(.14,'rgba(6,4,14,.8)');G.addColorStop(1,'rgba(6,4,14,.86)');
  ctx.fillStyle=G;ctx.fillRect(x,yT,x1-x,stripH);ctx.fillStyle=hue;ctx.globalAlpha=.9;ctx.fillRect(x+(x1-x)*.1,yT,(x1-x)*.9,1);ctx.fillRect(x+(x1-x)*.1,yT+stripH-1,(x1-x)*.9,1);
  ctx.textBaseline='middle';ctx.textAlign='right';const right=x1-10;
  const rem=n(B.remaining),timer=rem.toFixed(1);ctx.globalAlpha=1;ctx.font=(mobile?'9px':'10px')+' system-ui,sans-serif';
  const bonus=B.bonus*(1-.75*clamp(n(B.elapsedAtEnd)/Math.max(1,B.duration),0,1)),btxt=m.spellHit?'보너스 실패':'보너스 +'+bonus.toFixed(1);
  const bw=ctx.measureText?.('보너스 +00.0')?.width??50;ctx.fillStyle=m.spellHit?'#8a8aa0':'#ffe59a';hudText(ctx,btxt,right,yT+stripH*.76);
  ctx.font=(mobile?'14px':'18px')+' ui-monospace,Menlo,monospace';const tw=Math.max(bw,ctx.measureText?.('00.0')?.width??40);
  ctx.fillStyle=rem<3&&!(set?.reducedFlash)?'#ff6a6a':'#f2f4ff';hudText(ctx,timer,right,yT+stripH*.34);
  const tx=right-tw-(mobile?10:14),room=Math.max(40,tx-x-(x1-x)*.14);
  ctx.fillStyle='#ffffff';ctx.globalAlpha=.72;ctx.font=(mobile?'9px':'11px')+' system-ui,"Noto Serif KR",sans-serif';hudText(ctx,fitText(ctx,B.boss+' · 주문 '+(B.index+1)+'/3'+(B.lite?' · 잔향':''),room),tx,yT+stripH*.27);
  ctx.globalAlpha=1;ctx.font='bold '+(mobile?'15px':'20px')+' "Noto Serif KR",system-ui,sans-serif';ctx.fillStyle='#ffffff';hudText(ctx,fitText(ctx,B.name,room),tx,yT+stripH*.68);
  if(B.result&&s.time-B.resultAt<(B.result==='capture'?1.2:.8)){const u=(s.time-B.resultAt)/(B.result==='capture'?1.2:.8);ctx.globalAlpha=1-u*u;ctx.textAlign='center';
   ctx.font='bold '+(mobile?'20px':'28px')+' "Noto Serif KR",system-ui,sans-serif';ctx.fillStyle=B.result==='capture'?'#ffe59a':'#9a9ab0';
   hudText(ctx,B.result==='capture'?'주문 격파!  공명 +'+Math.round(n(B.award)):'보너스 실패',w/2,h*.36);}}
 function drawTele(ctx,s,m,set){const L=m.tele;if(!L||!L.length)return 0;const t=s.time,op=fxOpacity(set);let d=0;
  for(const v of L){if(v.shot>0||!(Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.ang)))continue;const u=clamp((t-v.born)/Math.max(.05,v.fire-v.born),0,1),col=HUES[v.hue|0]?.[1]??'#ff3048';
   const len=Math.min(900,Math.hypot(m.hx-v.x,m.hy-v.y)+90),ex=v.x+Math.cos(v.ang)*len,ey=v.y+Math.sin(v.ang)*len;
   ctx.globalCompositeOperation='source-over';ctx.lineWidth=1+u;ctx.strokeStyle=col;ctx.globalAlpha=(.16+.44*u)*op;ctx.beginPath();ctx.moveTo(v.x,v.y);ctx.lineTo(ex,ey);ctx.stroke();
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
 function drawDim(ctx,s,m,set){const a=m.dim;if(a<.01)return;if(root.__HAPIL_RC95_NATIVE__?.locked?.(s)===true)return;const cv=ctx.canvas;if(!cv)return;const dimA=m.dimLevel*a;
  ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='rgba(4,6,16,'+dimA.toFixed(3)+')';ctx.fillRect(0,0,cv.width,cv.height);
   const v=!set?.lowFx&&vignetteSprite();if(v){ctx.globalAlpha=clamp(dimA/.45,0,1);ctx.drawImage(v.c,0,0,cv.width,cv.height);}
   if(!set?.lowFx&&!m.mobile){ctx.globalCompositeOperation='saturation';ctx.globalAlpha=.4*a;ctx.fillStyle='#808080';ctx.fillRect(0,0,cv.width,cv.height);}
  }finally{ctx.restore();}}
 function drawLayer(ctx,s,set){if(!enabledFlag||!ctx||!s)return;const m=worlds.get(s);if(!m)return;const t0=now();let draws=0;
  // Layering: decoration (sparks, telegraphs) and hero-side visuals under the bullets; bullets on top.
  ctx.save();try{ctx.shadowBlur=0;draws+=drawSparks(ctx,s,m,set);ctx.globalAlpha=1;draws+=drawTele(ctx,s,m,set);ctx.globalAlpha=1;
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
 const seams={tick:null,draw:null,danger:null,grammarDraw:null,background:null,imminent:null,lasers:null,grammar:null,loop:null,feedback:null};
 let inTick=false,inLaserDraw=false,inDanger=false;
 function wrapLasers(){const L=root.__HAPIL_LASERS_V31330__;if(!L||typeof L.tick!=='function')return false;
  if(L.tick!==seams.tick){const base=L.tick;const fn=function(s,dt,...rest){if(inTick)return base.call(this,s,dt,...rest);inTick=true;let r;try{r=base.call(this,s,dt,...rest);}finally{try{simTick(s,dt);}catch(e){fail(e);}finally{inTick=false;}}return r;};
   fn.rc240=true;L.tick=fn;seams.tick=fn;metrics.rewraps++;}
  if(typeof L.draw==='function'&&L.draw!==seams.draw){const base=L.draw;const fn=function(ctx,cache,s,set,...rest){if(inLaserDraw)return base.call(this,ctx,cache,s,set,...rest);inLaserDraw=true;try{try{const m=enabledFlag&&s&&worlds.get(s);if(m)drawCircle(ctx,s,m,set);}catch(e){fail(e);}return base.call(this,ctx,cache,s,set,...rest);}finally{inLaserDraw=false;}};
   fn.rc240=true;L.draw=fn;seams.draw=fn;}
  if(typeof L.danger==='function'&&L.danger!==seams.danger){const base=L.danger;const fn=function(s,p,look,...rest){if(inDanger)return base.call(this,s,p,look,...rest);inDanger=true;try{const v=base.call(this,s,p,look,...rest);try{return n(v)+dangerAt(s,p,look??.36);}catch(e){fail(e);return v;}}finally{inDanger=false;}};
   fn.rc240=true;L.danger=fn;seams.danger=fn;}
  seams.lasers=L;return true;}
 let inGrammar=false,inBackground=false;
 function wrapGrammar(){const g=root.__HAPIL_GRAMMAR_V31365__;if(!g?.installed||typeof g.draw!=='function')return false;if(g.draw===seams.grammarDraw)return true;
  const base=g.draw;const draw=function(ctx,s,set,...rest){if(inGrammar)return base.call(this,ctx,s,set,...rest);inGrammar=true;let r;try{r=base.call(this,ctx,s,set,...rest);}finally{try{drawLayer(ctx,s,set??{});}catch(e){fail(e);}finally{inGrammar=false;}}return r;};
  const next={...g,draw};for(const k of Object.getOwnPropertyNames(g))if(!(k in next))Object.defineProperty(next,k,Object.getOwnPropertyDescriptor(g,k));
  Object.defineProperty(next,'rc240Wrapped',{value:true});root.__HAPIL_GRAMMAR_V31365__=Object.freeze(next);seams.grammarDraw=draw;seams.grammar=root.__HAPIL_GRAMMAR_V31365__;metrics.rewraps++;return true;}
 function wrapLoop(){const lp=root.__HAPIL_LOOP_V31365__;if(!lp||typeof lp.background!=='function'||typeof lp.imminent!=='function')return false;
  if(lp.background===seams.background&&lp.imminent===seams.imminent)return true;
  const bg=lp.background,im=lp.imminent;
  const background=function(ctx,s,rect,...rest){if(inBackground)return bg.call(this,ctx,s,rect,...rest);inBackground=true;let r;try{r=bg.call(this,ctx,s,rect,...rest);}finally{try{const m=enabledFlag&&s&&worlds.get(s);if(m){const set=settingsNow(),t0=now(),fb=hook('drawBackground');if(fb){ctx.save();try{fb.call(root.__HAPIL_STG_FEEL_RC240__,ctx,s,m,set);}catch(e){fail(e);}finally{ctx.restore();}}drawDim(ctx,s,m,set);metrics.bgMs=metrics.bgMs*.9+(now()-t0)*.1;}}catch(e){fail(e);}finally{inBackground=false;}}return r;};
  const imminentFn=function(s,h,...rest){const r=im.call(this,s,h,...rest);if(r)return r;try{return imminent(s,h)??r;}catch(e){fail(e);return r;}};
  const next={...lp,background,imminent:imminentFn};
  for(const k of Object.getOwnPropertyNames(lp))if(!(k in next))Object.defineProperty(next,k,Object.getOwnPropertyDescriptor(lp,k));
  Object.defineProperty(next,'rc240Wrapped',{value:true});root.__HAPIL_LOOP_V31365__=Object.freeze(next);seams.background=background;seams.imminent=imminentFn;seams.loop=root.__HAPIL_LOOP_V31365__;metrics.rewraps++;return true;}
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
  snapshot(s=currentState()){const m=s&&worlds.get(s);if(!m)return null;const P=m.pool,rows=[];for(let i=0;i<P.live;i++)rows.push({x:P.x[i],y:P.y[i],vx:P.vx[i],vy:P.vy[i],type:P.type[i],hue:P.hue[i],age:P.age[i]});
   return {zone:m.zone,live:P.live,peak:P.peak,spell:m.spell?.id??null,spellName:m.spell?.name??null,serial:m.serial,owner:m.ownerId,family:m.family,lite:m.lite,midboss:m.midboss,band:m.runBand??null,dim:m.dim,sparks:m.sparks.length,budget:m.ctx?.budget??null,rows};},
  clear(s=currentState()){const m=s&&worlds.get(s);if(m)resetWorld(s,m,'api');},
  cutSegment(s,ax,ay,bx,by,hw,maxN,cb){if(!enabledFlag)return 0;return cutSegment(s,n(ax),n(ay),n(bx),n(by),Math.max(0,n(hw)),maxN,cb);},
  cancelAll(s,reason='wipe',x,y){const m=enabledFlag&&s&&worlds.get(s);if(!m)return 0;return cancelAll(s,m,settingsNow(),String(reason),x,y);},
  cancelNear(s,x,y,r,reason='wipe'){const m=enabledFlag&&s&&worlds.get(s);if(!m)return 0;return cancelNear(s,m,settingsNow(),n(x),n(y),Math.max(0,n(r)),String(reason));},
  live(s){const m=s&&worlds.get(s);return m?m.pool.live:0;},
  world:s=>(s&&worlds.get(s))||null,
  util:Object.freeze({heroPalette,HERO_SIDE,REMAP,screenSpace,hudText,fitText,project,heart,muzzle,fullAuto,dActive,gmode,settingsNow,fxOpacity,FIELD,HUES,T,HIT}),
  __test:{SPELLS,FAMILY_SPELLS,MODES,FIELD,CULL,HIT,T,HUES,HERO_V,HEART_R,DENSITY,LIVE_CAP,createPool,makeRun,runStep,makeCtx,frameCtx,spawn,stepPool,sweptDist,safeY,peakFor,spellFor,familyOf,headless,mulberry32,hash,
   simTick:(s,dt)=>simTick(s,dt),drawLayer:(c,s,set)=>drawLayer(c,s,set),dangerAt,imminent,governor,install,recheck,worlds,mem:s=>worlds.get(s),injectSettings,
   getGov:()=>gov,setGov:v=>{gov=v;},seams,drawScreen,drawBanner,wrapFeedback,volleyPlan,VOLLEY,TELE_MIN,REMAP,HERO_SIDE,heroPalette,titleFilter,fitText}};
 root.__HAPIL_DANMAKU_RC240__=api;
 let attempts=0;(function ready(){if(!install()&&++attempts<1200)root.setTimeout?.(ready,10);})();
})(typeof window==='object'?window:globalThis);
