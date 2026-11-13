/* RC240 STG feel: spirit coins, chain/score HUD, charge shot (기합탄), EGO wipe,
 * boss warning, result tally and flow streaks. Original genre mechanics only.
 * Runs exclusively through RC240 danmaku-layer hooks, so it is inert whenever the
 * danmaku layer is disabled (?qa without rc240=1). Nothing is written into saves;
 * the only game state touched is s.fxSerial, s.pendingStrikes and s.floatTexts.
 * Michaela heart impact (heart-hit6, 6x1 @14 fps, last frame fades): a small pooled
 * world-layer effect started by boss-form's afterHit forward; the sheet is fetched
 * on the first impact only, once per session, with a procedural burst as fallback.
 */
(function(root){'use strict';
 if(root.__HAPIL_STG_FEEL_RC240__)return;
 const VERSION='RC240-feel-1';
 const n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d,clamp=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2;
 const now=()=>root.performance?.now?.()??Date.now();
 const R=()=>root.__HAPIL_DANMAKU_RC240__;
 const U=()=>R()?.util??null;
 const COIN_CAP={pc:256,mobile:96,lowFx:64},COIN_VALUE=[10,50,500],COIN_SIZE=[12,12,18];
 const CHAIN_WINDOW=1.2,MULT_CAP=4,T1=.7,T2=1.5,CD1=2,CD2=3.5,AUTO_EVERY=7;
 const TAME_SHARE=.2,TAME_SHARE_AUTO=.1,TAME_WINDOW=30;
 // Review round 1: kill beat before the tally, heart ring graze radius (px), callout ring size.
 const KILL_BEAT=.85,TALLY_LIFE=3.6,RING_NEAR=40,RING_TOUCH=14,CALL_N=4,GOLD='#c9a65a',INK='#0a0612';
 const CANCEL_RULES={bomb:{every:2,max:48,kind:1},capture:{every:3,max:48,kind:1},'spell-end':{every:6,max:24,kind:0},serial:{every:6,max:24,kind:0},owner:{every:2,max:64,kind:1},wipe:{every:3,max:40,kind:0},api:{every:3,max:40,kind:0}};
 // Gain tiers (player hit > shot/charge/bomb > boss > hit-confirm > enemy bullet > mobs); RC240 adds no enemy-bullet or mob sounds.
 // pickup/familiar sit in the hit-confirm band, below confirm. Bomb or a player hit ducks every tier below 'shot' for .25 s.
 const GAIN=Object.freeze({bomb:.34,charge:.3,shot:.26,ready:.2,boss:.18,confirm:.12,pickup:.08,familiar:.06});
 const DUCKED=Object.freeze({boss:1,confirm:1,pickup:1,familiar:1}),DUCK=.25,GAIN_MAX=.35;
 const KIT=()=>root.__HAPIL_ARCADE_KIT_RC240__;
 function kitCall(name,...a){const k=KIT();if(!k||typeof k[name]!=='function')return undefined;try{return k[name](...a);}catch(e){fail(e);}return undefined;}
 const AUDIO={arcane:'./audio/rc22/arcane.wav',laser:'./audio/rc22/laser.wav',shot:'./audio/rc22/shot.wav',heavy:'./audio/rc22/heavy.wav',guard:'./audio/rc22/guard.wav'};
 const HIT6=Object.freeze({sheet:'./assets/rc240/art/heart-hit6.webp',cell:256,frames:6,fps:14,size:72,lift:-46,cap:Object.freeze({pc:16,mobile:8}),
  note:'Dots CX-0084PJ PJ-03 heart-hit6 (1536x256, 6x1) — HOLD'});
 const metrics={impacts:0,ticks:0,coinsSpawned:0,coinsCollected:0,coinsDropped:0,strikes:0,tamePower:0,aPower:0,beams:0,beamCuts:0,wipes:0,warnings:0,tallies:0,sounds:0,draws:0,drawImages:0,drawMs:0,streakStrokes:0,errors:0};
 let lastError=null;
 function fail(e){metrics.errors++;lastError=String(e&&e.stack||e).slice(0,300);if(metrics.errors<=3)root.console?.warn?.('RC240 stg feel',e);}

 // ---------------------------------------------------------------- per-world state
 const worlds=new WeakMap();
 function coinPool(cap){return {cap,live:0,x:new Float32Array(cap),y:new Float32Array(cap),vx:new Float32Array(cap),vy:new Float32Array(cap),age:new Float32Array(cap),kind:new Uint8Array(cap),id:new Uint16Array(cap)};}
 function fresh(s){return {zone:s.zone,coins:coinPool(COIN_CAP.pc),capNow:COIN_CAP.pc,serial:0,rng:(n(s.time)*1e3|0)^0x5f3759df,
  score:0,chain:0,chainUntil:-1,maxChain:0,mult:1,collected:0,grazes:0,
  charge:{on:false,start:0,extra:0,t2Sounded:false,cdUntil:-1,cdDur:1,released:-9},duckUntil:-1,aPow:0,aSeen:new WeakSet(),aWin:[],tameWin:[],autoAt:-1,
  beams:[],bolts:[],sparks:[],impacts:[],awakeWas:false,warned:new Set(),warn:null,fight:null,tally:null,kill:null,
  calls:Array.from({length:CALL_N},()=>({text:'',color:'#ffffff',at:-99,dur:0,drawn:-1,big:false})),ev:{at:-1,reason:'',n:0,coins:0,big:false},sounds:{},lastHx:640,lastHy:400};}
 function F(s){let f=worlds.get(s);if(!f){f=fresh(s);worlds.set(s,f);}return f;}
 function reset(s,reason){kitCall('reset',s,reason);const f=worlds.get(s);if(!f)return;const keep=f.warned;const g=fresh(s);if(reason!=='zone')g.warned=keep;worlds.set(s,g);}
 function rnd(f){f.rng=(Math.imul(f.rng^(f.rng>>>15),0x2c1b3c6d)+0x6d2b79f5)|0;return ((f.rng>>>0)%100000)/100000;}
 function active(){const r=R();return !!(r&&r.installed&&r.enabled?.());}

 // ---------------------------------------------------------------- environment probes (native APIs, all optional)
 function binding(){return root.__HAPIL_CONTROLS_V31329__?.binding??null;}
 function settingsOf(){try{return binding()?.settings?.current??{};}catch(e){return {};}}
 function chargeHeld(s){try{const C=root.__HAPIL_CONTROLS_V31329__,b=C?.binding;if(b?.state?.current!==s)return false;
   return C.hasHeldLogical?.('KeyA')===true||b.input?.current?.has?.('KeyA')===true||(s.chargePointersV31365?.length??0)>0;}catch(e){return false;}}
 function guest(s){const p=root.__HAPIL_PARTY_V31322__;return !!(p&&p.state===s&&p.status?.role==='guest');}
 function dOn(s){try{const C=root.__HAPIL_CHANNEL_V31364__;if(C?.active)return C.active(s,s)===true;}catch(e){}return s.channelDActiveV31364===true;}
 function fullAuto(s){try{const u=U();if(u?.fullAuto)return u.fullAuto(s,settingsOf());}catch(e){}return s.combatModeV31329==='full';}
 function project(x,y){const u=U();if(u?.project)return u.project(x,y);return {x:640+27*(x-y),y:13.5*(x+y)};}
 function palette(m){try{const p=U()?.heroPalette?.(m?.family);if(p)return p;}catch(e){}return {key:'cyan',body:'#7ff6ff',edge:'#0b4f63',core:'#ffffff',dim:'#bff9ff',coin:['#c6f7ff','#5fe8ff','#ffffff']};}
 function heroColor(s){const h=root.__HAPIL_FEEDBACK_RC128__?.heroes?.[s.activeHeroId];const c=h?.color;return typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)?c:'#9ff3ff';}
 function valid(s,a){return !!a&&(s.enemies??[]).includes(a)&&a.hp>0&&!a.visualOnly&&!a.friendly&&!a.neutral&&!a.ally&&!a.canonAlly&&!a.canonAllyV31217&&!a.canonicalAllyV31217&&!a.objectiveStructureV31238&&!a.protectedNarrativeTargetV31307&&!a.protectedNarrativeTargetV31238&&n(a.invulnerableUntil)<=s.time&&root.__HAPIL_COMBAT_V31343__?.validTarget?.(s,a)!==false;}
 const recent=[];// sim-time starts of our last plays: at most 2 overlapping within 120 ms
 function sound(f,s,key,gain,cd=.12,tier=''){const set=settingsOf();if(set.sound===false||!(n(set.sfxVolume,1)>0))return false;const b=binding();if(b?.state?.current!==s||typeof b.actions?.sound!=='function')return false;
  const g=clamp(n(gain,0),0,GAIN_MAX),c=clamp(n(cd,.12),.02,2);if(!(g>0)||!AUDIO[key])return false;
  const t=n(s.time),w=t*1000;if(DUCKED[tier]&&t<f.duckUntil&&t>=f.duckUntil-1)return false;while(recent.length&&(w-recent[0]>120||w<recent[0]))recent.shift();if(t-n(f.sounds[key],-99)<c)return false;if(recent.length>=2)return false;
  f.sounds[key]=t;recent.push(w);try{b.actions.sound(AUDIO[key],g,c);metrics.sounds++;return true;}catch(e){fail(e);return false;}}
 function play(s,key,tier,cd){if(!active()||!s||!(tier in GAIN))return false;return sound(F(s),s,key,GAIN[tier],cd??.12,tier);}
 function duck(s,sec=DUCK){if(!active()||!s)return;const f=F(s),t=n(s.time);f.duckUntil=Math.max(f.duckUntil,t+clamp(n(sec,DUCK),0,1));}
 // Callouts: RC240 announcements are drawn in a screen band clear of the hero/boss boxes and the
 // native debuff labels (no native world floats over the hero). Fixed ring of CALL_N slots.
 // Fix round 2: the band sits in the hero-side lane (x = calloutX), out of the top-centre presentation
 // column (score, spell card, warning). size 'big' is the spell result line.
 function callout(s,text,color,duration=.9,size){if(!active()||!s||typeof text!=='string')return false;const f=F(s),t=n(s.time);let k=f.calls[0];
  for(let i=1;i<CALL_N;i++)if(f.calls[i].at<k.at)k=f.calls[i];k.text=text;k.color=typeof color==='string'?color:'#ffffff';k.at=t;k.dur=clamp(n(duration,.9),.3,3);k.big=size==='big';return true;}
 const float=callout;
 function calloutY(w,h,mobile){return mobile?108:Math.max(120,n(h,720)*.22);}
 function calloutX(w,mobile){return n(w,1280)*(mobile?.3:.25);}
 function lowFx(set){return !!set?.lowFx;}
 // Hero colour family (RC128 hero colour); a hero colour inside the enemy magenta band swaps to its accent.
 const TONES=new Map(),TONE0=Object.freeze({key:'tone0',body:'#ffe27a',core:'#ffffff',edge:'#2b2018',ring:'#9ff3ff'});
 function hueOf(c){if(typeof c!=='string'||!/^#[0-9a-f]{6}$/i.test(c))return -1;const r=parseInt(c.slice(1,3),16)/255,g=parseInt(c.slice(3,5),16)/255,b=parseInt(c.slice(5,7),16)/255,mx=Math.max(r,g,b),d=mx-Math.min(r,g,b);if(d<.12)return -1;
  let h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;return h<0?h+360:h;}
 const enemyHue=c=>{const h=hueOf(c);return h>=285&&h<=345;};
 function heroTone(s){const id=s?.activeHeroId;let T=TONES.get(id);if(T)return T;let h=null;try{h=root.__HAPIL_FEEDBACK_RC128__?.heroes?.[id];}catch(e){}
  if(!h||typeof h.color!=='string'||!/^#[0-9a-f]{6}$/i.test(h.color))return TONE0;let body=h.color;
  if(enemyHue(body))body=typeof h.accent==='string'&&/^#[0-9a-f]{6}$/i.test(h.accent)&&hueOf(h.accent)>=0&&!enemyHue(h.accent)?h.accent:TONE0.body;
  const hb=hueOf(body);T=Object.freeze({key:String(id)+body,body,ring:hb>=165&&hb<=210?'#ffffff':'#9ff3ff',core:'#ffffff',edge:typeof h.dark==='string'&&/^#[0-9a-f]{6}$/i.test(h.dark)?h.dark:TONE0.edge});TONES.set(id,T);return T;}
 function rgba(hex,a){const v=parseInt(String(hex).slice(1),16)|0;return 'rgba('+(v>>16&255)+','+(v>>8&255)+','+(v&255)+','+a+')';}
 // Baked once per colour: a soft additive glow disc and a soft-falloff ring (no shadowBlur, no per-frame gradients).
 const glowSprites=new Map(),ringSprites=new Map();
 function glowSprite(col){let g=glowSprites.get(col);if(g!==undefined)return g;glowSprites.set(col,null);const c=canvas(64,64),x=c?.getContext?.('2d');if(!x?.createRadialGradient)return null;
  const G=x.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,'#ffffff');G.addColorStop(.2,col);G.addColorStop(.5,rgba(col,.32));G.addColorStop(1,rgba(col,0));x.fillStyle=G;x.fillRect(0,0,64,64);glowSprites.set(col,c);return c;}
 function ringSprite(col){let g=ringSprites.get(col);if(g!==undefined)return g;ringSprites.set(col,null);const c=canvas(256,256),x=c?.getContext?.('2d');if(!x?.createRadialGradient)return null;
  const G=x.createRadialGradient(128,128,0,128,128,128);G.addColorStop(0,rgba(col,0));G.addColorStop(.52,rgba(col,0));G.addColorStop(.72,rgba(col,.28));G.addColorStop(.84,rgba(col,.85));G.addColorStop(.88,'rgba(255,255,255,.9)');G.addColorStop(.93,rgba(col,.45));G.addColorStop(1,rgba(col,0));
  x.fillStyle=G;x.fillRect(0,0,256,256);ringSprites.set(col,c);return c;}

 // ---------------------------------------------------------------- score / chain
 function chainStep(f,t){if(t<f.chainUntil)f.chain++;else f.chain=1;f.chainUntil=t+CHAIN_WINDOW;if(f.chain>f.maxChain)f.maxChain=f.chain;
  if(f.fight&&f.chain>f.fight.maxChain)f.fight.maxChain=f.chain;f.mult=Math.min(MULT_CAP,1+.1*Math.floor(f.chain/10));}
 function addScore(f,v){const d=Math.round(v*f.mult);f.score+=d;return d;}

 // ---------------------------------------------------------------- coins
 function capFor(m,set){return lowFx(set)?COIN_CAP.lowFx:m?.mobile?COIN_CAP.mobile:COIN_CAP.pc;}
 function spawnCoin(f,x,y,kind){const P=f.coins;if(!(Number.isFinite(x)&&Number.isFinite(y)))return false;if(P.live>=f.capNow){metrics.coinsDropped++;return false;}const i=P.live++;
  const sp=60+80*rnd(f),sg=rnd(f)<.5?-1:1;P.x[i]=x;P.y[i]=y;P.vx[i]=sg*sp*(.35+.65*rnd(f));P.vy[i]=-(40+80*rnd(f));P.age[i]=0;P.kind[i]=kind;P.id[i]=(f.serial++)&0xffff;
  metrics.coinsSpawned++;if(f.fight)f.fight.coinsOut++;return true;}
 function collect(f,s,i){const P=f.coins,k=P.kind[i],t=n(s.time);chainStep(f,t);const d=addScore(f,COIN_VALUE[k]);f.collected++;metrics.coinsCollected++;if(f.fight){f.fight.coins++;}
  if(f.chain%50===0)sound(f,s,'guard',GAIN.confirm,.25,'confirm');
  const last=--P.live;if(i!==last){P.x[i]=P.x[last];P.y[i]=P.y[last];P.vx[i]=P.vx[last];P.vy[i]=P.vy[last];P.age[i]=P.age[last];P.kind[i]=P.kind[last];P.id[i]=P.id[last];}return d;}
 function stepCoins(f,s,dt,hx,hy){const P=f.coins;
  for(let i=P.live-1;i>=0;i--){const age=P.age[i]+dt;P.age[i]=age;
   if(age<.35){const k=Math.exp(-3.5*dt);P.vx[i]*=k;P.vy[i]=P.vy[i]*k+60*dt;}
   else{const dx=hx-P.x[i],dy=hy-P.y[i],d=Math.hypot(dx,dy)||1;P.vx[i]+=dx/d*2600*dt;P.vy[i]+=dy/d*2600*dt;
    // Damp the tangential component so the homing curve converges instead of orbiting.
    const along=(P.vx[i]*dx+P.vy[i]*dy)/d,tx=P.vx[i]-dx/d*along,ty=P.vy[i]-dy/d*along;P.vx[i]-=tx*Math.min(1,6*dt);P.vy[i]-=ty*Math.min(1,6*dt);
    const v=Math.hypot(P.vx[i],P.vy[i]);if(v>950){P.vx[i]*=950/v;P.vy[i]*=950/v;}}
   P.x[i]+=P.vx[i]*dt;P.y[i]+=P.vy[i]*dt;
   const dx=hx-P.x[i],dy=hy-P.y[i];if(dx*dx+dy*dy<=28*28||age>=4)collect(f,s,i);}}

 // ---------------------------------------------------------------- hooks from RC240
 function onCancel(s,m,x,y,type,hue,reason){if(!active()||reason==='hit')return;const f=F(s),t=n(s.time),rule=CANCEL_RULES[reason];if(!rule)return;
  const e=f.ev;if(e.at!==t||e.reason!==reason){e.at=t;e.reason=reason;e.n=0;e.coins=0;e.big=false;}
  if(reason==='owner'&&!e.big){e.big=true;const dead=f.lastOwner&&!(n(f.lastOwner.hp)>0);if(dead){const mz=m?.lastMuzzle??{x,y};for(let k=0;k<8;k++)spawnCoin(f,mz.x+(k-3.5)*6,mz.y,2);}}
  if(e.n++%rule.every!==0||e.coins>=rule.max)return;e.coins++;spawnCoin(f,x,y,rule.kind);}
 function onGraze(s,x,y){if(!active())return;const f=F(s),t=n(s.time);chainStep(f,t);addScore(f,50);f.grazes++;if(f.fight)f.fight.grazes++;
  if(f.charge.on)f.charge.extra=Math.min(.4,f.charge.extra+.08);}
 function onSpellEnd(s,r){if(!active())return;const f=F(s);if(!f.fight||r?.midboss||String(r?.ownerId)!==String(f.fight.ownerId))return;if(r.result){f.fight.spells++;if(r.result==='capture')f.fight.captured++;}}
 function onHit(s){if(!active())return;const f=F(s);f.duckUntil=Math.max(f.duckUntil,n(s.time)+DUCK);kitCall('onHit',s);f.chain=0;f.chainUntil=-1;f.mult=1;if(f.charge.on){f.charge.on=false;f.charge.extra=0;}if(f.fight)f.fight.hits++;}
 function onOwner(s,m,a){if(!active()||!a)return;const f=F(s),t=n(s.time),key=String(s.zone)+'|'+String(a.id);
  f.lastOwner=a;if(!f.fight||String(f.fight.ownerId)!==String(a.id))f.fight={ownerId:a.id,boss:!!a.boss,name:String(a.name??'보스'),start:t,spells:0,captured:0,grazes:0,maxChain:0,coins:0,coinsOut:0,score0:f.score,hits:0};
  if(f.warned.has(key))return;f.warned.add(key);const big=!!a.boss;
  // Beat order: stage title card first, then the warning, then combat. Never both on screen.
  const tu=titleUntil(s),start=tu>t?tu+.15:t;f.warn={at:start,dur:big?2.2:1.2,name:String(a.name??''),id:String(a.id),big,sounded:false};metrics.warnings++;
  if(m)m.warnHoldUntil=Math.max(n(m.warnHoldUntil,-1),start+(big?1:.5));}
 function titleUntil(s){try{const v=root.__HAPIL_BOSS_FORM_RC240__?.titleUntil?.(s);return Number.isFinite(v)?v:-1;}catch(e){return -1;}}
 function stepWarn(s,f,m,t){const W=f.warn;if(!W)return;
  if(t<W.at+.05){const tu=titleUntil(s);if(tu>t&&W.at<tu+.15){W.at=tu+.15;if(m)m.warnHoldUntil=Math.max(n(m.warnHoldUntil,-1),W.at+(W.big?1:.5));}}
  if(!W.sounded&&t>=W.at){W.sounded=true;sound(f,s,'heavy',W.big?GAIN.boss:GAIN.boss*.7,.5,'boss');}
  if(t>=W.at+W.dur)f.warn=null;}
 // R3: the warning belongs to its actor: when that actor dies, a queued warning is dropped and a showing
 // one fades out over WARN_OUT, so the band never sits over the kill beat or the tally.
 const WARN_OUT=.25;
 function endWarn(f,id,t){const W=f.warn;if(!W||W.id!==String(id))return;if(t<W.at){f.warn=null;return;}if(t-W.at<W.dur-WARN_OUT)W.dur=t-W.at+WARN_OUT;}
 function warningActive(s){const f=s&&worlds.get(s);if(!f?.warn||!active())return false;return n(s.time)<f.warn.at+f.warn.dur;}
 function warnUntil(s){return warningActive(s)?worlds.get(s).warn.at+worlds.get(s).warn.dur:-1;}

 // ---------------------------------------------------------------- charge shot
 function eligible(s,f,m){const a=m?.owner;return !!a&&a.hp>0&&!(n(s.awakeningUntil)>s.time)&&!dOn(s)&&!guest(s)&&s.time>=f.charge.cdUntil;}
 function observeA(s,f){const rows=s.pendingStrikes;if(!Array.isArray(rows))return;const t=n(s.time);
  for(const r of rows){if(!r||typeof r!=='object'||f.aSeen.has(r))continue;f.aSeen.add(r);
   if(r.actionKey==='A'&&r.heroId===s.activeHeroId&&!r.shmupEchoV31365&&!r.rc240TameTier&&Number.isFinite(r.power)&&r.power>0){const p=Number.isFinite(r.rc240BasePower)&&r.rc240BasePower>0?r.rc240BasePower:r.power;f.aPow=f.aPow>0?f.aPow*.75+p*.25:p;f.aWin.push({t,p});metrics.aPower+=p;}}
  while(f.aWin.length&&t-f.aWin[0].t>TAME_WINDOW)f.aWin.shift();while(f.tameWin.length&&t-f.tameWin[0].t>TAME_WINDOW)f.tameWin.shift();}
 function tameRoom(f,auto){let a=0,b=0;for(const r of f.aWin)a+=r.p;for(const r of f.tameWin)b+=r.p;return Math.max(0,a*(auto?TAME_SHARE_AUTO:TAME_SHARE)-b);}
 function pushStrike(s,f,a,power,tier,color){if(!Array.isArray(s.pendingStrikes)||s.pendingStrikes.length>=96||!(power>=1))return false;
  const id=a.id;const row={id:s.fxSerial=n(s.fxSerial)+1,at:s.time+.12,targetId:typeof id==='string'?id:String(id),power,color,critical:tier===2,ranged:true,homing:true,leechRate:0,
   heroId:s.activeHeroId,sourceHeroId:s.activeHeroId,actionKey:'RC240_TAME',rc226LaunchSound:true,shmupOriginV31365:{x:s.x,y:s.y},rc240TameTier:tier};
  if(row.targetId!==id)return false;// the native resolver matches ids strictly
  s.pendingStrikes.push(row);f.tameWin.push({t:n(s.time),p:power});metrics.strikes++;metrics.tamePower+=power;return true;}
 function beamEnd(ax,ay,bx,by){const dx=bx-ax,dy=by-ay;const X=dx>=0?1220:60;const u=Math.abs(dx)>1?(X-ax)/dx:6;const k=Math.max(1,Math.min(u,8));return {x:ax+dx*k,y:ay+dy*k};}
 function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy;let u=L>1e-9?((px-ax)*dx+(py-ay)*dy)/L:0;u=u<0?0:u>1?1:u;return Math.hypot(ax+dx*u-px,ay+dy*u-py);}
 function fire(s,f,m,tier,auto){const t=n(s.time),set=settingsOf(),a=m.owner,color=heroColor(s);
  f.charge.cdUntil=t+(tier===2?CD2:CD1);f.charge.cdDur=tier===2?CD2:CD1;f.charge.released=t;
  const tgt=(s.enemies??[]).find(e=>e&&e.id===s.targetEnemyId&&valid(s,e))??(valid(s,a)?a:null);
  const hx=n(m.hx,f.lastHx),hy=n(m.hy,f.lastHy),mz=m.lastMuzzle??{x:hx+300,y:hy},end=beamEnd(hx,hy,mz.x,mz.y),hw=tier===2?15:9;
  const pal=palette(m),tone=heroTone(s);if(!(Number.isFinite(hx)&&Number.isFinite(hy)&&Number.isFinite(end.x)&&Number.isFinite(end.y)))return;
  // Hero-keyed bolts (rc225 SHOTS identity) fly to the target: 3 at T1, 6 at T2.
  const shape=boltShape(s.activeHeroId),tp=tgt?project(tgt.x,tgt.y):{x:mz.x,y:mz.y+46},tx=n(tp.x,mz.x),ty=n(tp.y,mz.y+46)-46,cnt=tier===2?6:3;
  // The beam still cuts bullets along the full segment, but is drawn to the target with an impact flare.
  const beam={at:t,life:.4,ax:hx,ay:hy,bx:end.x,by:end.y,tx:tgt?tx:end.x,ty:tgt?ty:end.y,hasT:!!tgt,hw:tier===2?18:12,tier,color:tone.body,core:tone.core,cut:0};
  for(let j=0;j<cnt;j++){const off=(j-(cnt-1)/2)*(tier===2?9:12);f.bolts.push({born:t+j*.035,dur:.2,ax:hx,ay:hy,tx,ty,off,shape,size:tier===2?9:7,pal});}
  if(f.bolts.length>18)f.bolts.splice(0,f.bolts.length-18);f.beams.push(beam);if(f.beams.length>4)f.beams.shift();metrics.beams++;
  cutBeam(s,f,beam);
  if(tgt&&f.aPow>0){let room=tameRoom(f,auto);const base=f.aPow*(tier===2?3:1.6)*(auto?.75:1);const main=Math.min(base,room);if(pushStrike(s,f,tgt,main,tier,color))room-=main;
   if(tier===2){let extra=0;for(const e of s.enemies??[]){if(extra>=3||e===tgt||!valid(s,e))continue;const q=project(e.x,e.y);if(segDist(q.x,q.y-42,hx,hy,end.x,end.y)>hw+24)continue;
     const p=Math.min(f.aPow*1.8*(auto?.75:1),room);if(pushStrike(s,f,e,p,tier,color)){room-=p;extra++;}}}
   const q=project(tgt.x,tgt.y);for(let k=0;k<10;k++){const ang=rnd(f)*TAU,v=90+160*rnd(f);f.sparks.push({x:q.x,y:q.y-46,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,born:t+.18,life:.35,c:tone.body});}}
  if(f.sparks.length>80)f.sparks.splice(0,f.sparks.length-80);
  sound(f,s,tier===2?'laser':'shot',tier===2?GAIN.charge:GAIN.shot,.2);if(!auto||tier===2)callout(s,tier===2?'기합 해방':'기합탄',tier===2?'#ffffff':tone.body,.8);}
 function cutBeam(s,f,beam){const r=R();if(!r?.cutSegment||beam.cut>=24)return;const t=n(s.time);
  const c=r.cutSegment(s,beam.ax,beam.ay,beam.bx,beam.by,beam.hw,24-beam.cut,(x,y)=>{spawnCoin(f,x,y,0);addScore(f,20);});beam.cut+=c;metrics.beamCuts+=c;}
 function stepCharge(s,f,m,dt){const t=n(s.time),c=f.charge,ok=eligible(s,f,m),held=ok&&chargeHeld(s);
  if(held){if(!c.on){c.on=true;c.start=t;c.extra=0;c.t2Sounded=false;}const hold=t-c.start+c.extra;if(hold>=T2&&!c.t2Sounded){c.t2Sounded=true;sound(f,s,'arcane',GAIN.ready,.4);}}
  else if(c.on){const hold=t-c.start+c.extra;c.on=false;if(ok&&hold>=T1)fire(s,f,m,hold>=T2?2:1,false);}
  if(fullAuto(s)&&m.owner&&ok&&!c.on&&n(r0(m))>=20){if(f.autoAt<0)f.autoAt=t+AUTO_EVERY;else if(t>=f.autoAt){f.autoAt=t+AUTO_EVERY;fire(s,f,m,2,true);}}
  else if(!fullAuto(s))f.autoAt=-1;}
 function r0(m){return m?.pool?.live??0;}

 // ---------------------------------------------------------------- tick
 function tick(s,dt,m){if(!active()||!s||!m||!(dt>0))return;const f=F(s),t=n(s.time),set=settingsOf();metrics.ticks++;
  if(f.zone!==s.zone){reset(s,'zone');return;}
  f.capNow=capFor(m,set);const hx=n(m.hx,f.lastHx),hy=n(m.hy,f.lastHy);f.lastHx=hx;f.lastHy=hy;
  observeA(s,f);
  if(m.owner)f.lastOwner=m.owner;
  // EGO awakening wipe on the rising edge.
  const awake=n(s.awakeningUntil)>t;if(awake&&!f.awakeWas){const r=R();const k=r?.cancelAll?.(s,'wipe',hx,hy)??0;m.spawnGuardUntil=t+.6;metrics.wipes++;if(k>0)callout(s,'각성 정화 +'+k,'#fff3b0',1.1);}f.awakeWas=awake;
  stepWarn(s,f,m,t);
  stepCharge(s,f,m,dt);
  for(const b of f.beams)if(t-b.at<b.life)cutBeam(s,f,b);
  f.beams=f.beams.filter(b=>t-b.at<b.life);if(f.bolts.length)f.bolts=f.bolts.filter(b=>t<b.born+b.dur+.05);
  if(f.sparks.length)f.sparks=f.sparks.filter(q=>t-q.born<q.life);
  pruneImpacts(f,t);
  stepCoins(f,s,dt,hx,hy);
  if(f.chain>0&&t>=f.chainUntil){f.chain=0;f.mult=1;}
  // Fight end: boss died (or bossDefeated rose) while still in this zone.
  const fg=f.fight;if(fg&&(!m.owner||String(m.owner.id)!==String(fg.ownerId))){const e=(s.enemies??[]).find(q=>q&&String(q.id)===String(fg.ownerId));
   const dead=(e?!(n(e.hp)>0):true)||(s.bossDefeated&&!f.defeatedWas);
   if(dead)endWarn(f,fg.ownerId,t);
   if(dead&&fg.boss&&!fg.tallied){fg.tallied=true;const nohit=fg.hits===0?100000:0;f.score+=nohit;killBeat0(s,f,m,e??f.lastOwner,t);
    const T=f.tally={at:t+KILL_BEAT,time:t-fg.start,spells:fg.spells,captured:fg.captured,grazes:fg.grazes,maxChain:fg.maxChain,coins:fg.coins+(f.coins.live|0),gained:f.score-fg.score0,nohit,name:fg.name,rows:null};
    // Rows that would read 0/0 or 0 are left out; built once, formatted per frame.
    T.rows=[['격파 시간','time',T.time]];if(T.spells>0)T.rows.push(['주문 획득','frac',T.captured]);if(T.grazes>0)T.rows.push(['스침','int',T.grazes]);if(T.maxChain>0)T.rows.push(['최대 연쇄','int',T.maxChain]);
    if(T.coins>0)T.rows.push(['영전','int',T.coins]);T.rows.push(['획득 점수','int',T.gained]);if(nohit)T.rows.push(['무피격 보너스','plus',nohit]);metrics.tallies++;}
   if(dead||!e)f.fight=null;}
  f.defeatedWas=!!s.bossDefeated;
  if(f.kill&&t-f.kill.at>KILL_BEAT+1)f.kill=null;
  kitCall('tick',s,dt,m);}
 // Kill beat: a held flash on the boss, staggered rings, rays and embers, then the tally slides in.
 function killBeat0(s,f,m,a,t){let x=n(m?.lastMuzzle?.x,640),y=n(m?.lastMuzzle?.y,300);if(a&&Number.isFinite(a.x)&&Number.isFinite(a.y)){const p=project(a.x,a.y);if(Number.isFinite(p.x)&&Number.isFinite(p.y)){x=p.x;y=p.y-90;}}
  f.kill={at:t,x,y};for(let k=0;k<22;k++){const ang=rnd(f)*TAU,v=120+260*rnd(f);f.sparks.push({x,y,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v*.8,born:t,life:.5+.4*rnd(f),c:k%3?'#ffd27a':'#fff3c8'});}
  sound(f,s,'heavy',GAIN.charge,.3);duck(s,.4);}
 function killBeat(s){const f=s&&worlds.get(s);return !!(f?.kill&&n(s.time)-f.kill.at<KILL_BEAT+.3&&n(s.time)>=f.kill.at);}

 // ---------------------------------------------------------------- sprites
 const sprites=[];
 function canvas(w,h){try{if(typeof OffscreenCanvas==='function')return new OffscreenCanvas(w,h);const d=root.document;if(d?.createElement){const c=d.createElement('canvas');c.width=w;c.height=h;return c;}}catch(e){}return null;}
 function coinSprite(kind,pal){const id=(pal?.key??'cyan')+kind;if(sprites[id]!==undefined)return sprites[id];const sz=COIN_SIZE[kind],pad=kind===2?12:2,W=sz+pad*2,c=canvas(W*2,W*2);sprites[id]=null;if(!c)return null;
  const g=c.getContext?.('2d');if(!g)return null;g.scale(2,2);const cx=W/2,cy=W/2,r=sz/2;
  const P0=pal??palette(null);
  if(kind===2&&g.createRadialGradient){const G=g.createRadialGradient(cx,cy,r*.4,cx,cy,W/2);G.addColorStop(0,P0.body);G.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.55;g.fillStyle=G;g.fillRect(0,0,W,W);g.globalAlpha=1;}
  const body=P0.coin[kind],edge=P0.edge;
  const dia=(rr)=>{g.beginPath();g.moveTo(cx,cy-rr);g.lineTo(cx+rr*.72,cy);g.lineTo(cx,cy+rr);g.lineTo(cx-rr*.72,cy);g.closePath();};
  g.fillStyle='#120d18';dia(r+1.2);g.fill();g.fillStyle=edge;dia(r);g.fill();g.fillStyle=body;dia(r-1.6);g.fill();g.fillStyle='#ffffff';dia(r*.34);g.fill();
  sprites[id]={c,W};return sprites[id];}

 // ---------------------------------------------------------------- hero bolt shapes (keyed by rc225 SHOTS identity)
 const SHAPE_BY_SHOT=Object.freeze({'winged-bolt':'heart','ricochet-cross':'hexagram','time-orb':'orb','piercing-lance':'lance','sigil-spear':'lance','blade-fan':'blade','fan-blade':'blade','triple-needle':'needle','glitch-wave':'glitch','rapid-fire':'capsule'});
 // Static copy of rc225 shot profiles for when RC225 is absent; the live module exposes them as shotProfiles.
 const HERO_SHOT=Object.freeze({hwando:'blade-fan',seoha:'time-orb',rian:'ricochet-cross',ion:'piercing-lance',neon:'glitch-wave',michaela:'winged-bolt',lauren:'sigil-spear',hunter:'triple-needle',slayer:'fan-blade',gunner:'rapid-fire'});
 function boltShape(heroId){if(heroId==='michaela')return 'heart';const S=root.__HAPIL_SHOOTER_RC225__;const id=S?.SHOTS?.[heroId]??S?.shotProfiles?.[heroId]??HERO_SHOT[heroId];return SHAPE_BY_SHOT[id]??'diamond';}
 const UPRIGHT=Object.freeze({heart:1,hexagram:1});
 // Path in local space, unit size r, pointing +x. Heart and hexagram stay upright (never rotated); no shot is cross-shaped.
 function shapePath(ctx,shape,r){ctx.beginPath();
  switch(shape){
   case 'heart':ctx.moveTo(0,r*.9);ctx.bezierCurveTo?.(-r*1.3,-r*.1,-r*.6,-r*1.1,0,-r*.35);ctx.bezierCurveTo?.(r*.6,-r*1.1,r*1.3,-r*.1,0,r*.9);break;
   case 'hexagram':{const R0=r*1.05;for(const o of [-Math.PI/2,Math.PI/2]){for(let k=0;k<3;k++){const a=o+k*TAU/3,x=Math.cos(a)*R0,y=Math.sin(a)*R0;if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();}break;}
   case 'orb':ctx.arc(0,0,r*.75,0,TAU);break;
   case 'lance':ctx.moveTo(r*1.8,0);ctx.lineTo(0,r*.32);ctx.lineTo(-r*1.2,0);ctx.lineTo(0,-r*.32);break;
   case 'blade':ctx.moveTo(r*1.1,0);ctx.lineTo(-r*.7,r*.9);ctx.lineTo(-r*.2,0);ctx.lineTo(-r*.7,-r*.9);break;
   case 'needle':for(const o of [-.5,0,.5]){ctx.moveTo(r*1.4,o*r);ctx.lineTo(-r*1.2,o*r+.8);ctx.lineTo(-r*1.2,o*r-.8);ctx.closePath();}break;
   case 'glitch':ctx.rect?.(-r*.7,-r*.5,r*1.4,r*.45);ctx.rect?.(-r*.3,0,r*1.2,r*.45);break;
   case 'capsule':ctx.moveTo(r*1.2,0);ctx.lineTo(r*.4,r*.4);ctx.lineTo(-r,r*.4);ctx.lineTo(-r,-r*.4);ctx.lineTo(r*.4,-r*.4);break;
   default:ctx.moveTo(r,0);ctx.lineTo(0,r*.6);ctx.lineTo(-r,0);ctx.lineTo(0,-r*.6);}
  ctx.closePath();}
 function drawBolts(ctx,f,t){let k=0;for(const b of f.bolts){const u=(t-b.born)/b.dur;if(u<0||u>1)continue;const e=1-(1-u)*(1-u);
   const dx=b.tx-b.ax,dy=b.ty-b.ay,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,arc=Math.sin(u*Math.PI)*b.off;const x=b.ax+dx*e+nx*arc,y=b.ay+dy*e+ny*arc;if(!(Number.isFinite(x)&&Number.isFinite(y)))continue;
   const upright=!!UPRIGHT[b.shape];ctx.save();ctx.translate(x,y);if(!upright)ctx.rotate(Math.atan2(dy,dx));
   ctx.globalAlpha=1;ctx.lineWidth=2;ctx.strokeStyle=b.pal.edge;ctx.fillStyle=b.pal.body;shapePath(ctx,b.shape,b.size);ctx.stroke();ctx.fill();
   ctx.fillStyle=b.pal.core;shapePath(ctx,b.shape,b.size*.42);ctx.fill();ctx.restore();k++;}return k;}

 // ---------------------------------------------------------------- Michaela heart impact (hit6)
 const hit={state:'idle',im:null,loads:0};
 function loadHit(){if(hit.state!=='idle'||typeof root.Image!=='function')return;hit.state='loading';hit.loads++;
  try{const im=new root.Image();im.onload=()=>{im.onload=im.onerror=null;hit.state='ready';};im.onerror=()=>{im.onload=im.onerror=null;hit.state='failed';hit.im=null;};hit.im=im;im.src=HIT6.sheet;}catch(e){hit.state='failed';hit.im=null;fail(e);}}
 function phoneNow(){try{return n(root.innerWidth,1280)<800||root.__HAPIL_COMBAT_RC47__?.mobile?.()===true;}catch(e){return false;}}
 function impactLift(s){const ef=s.effects;if(Array.isArray(ef))for(let i=ef.length-1;i>=0;i--){const e=ef[i];if(e&&e.heroId31213==='michaela'&&e.heroActionKey31213==='A'&&Number.isFinite(e.endOffsetY))return clamp(e.endOffsetY,-120,0);}return HIT6.lift;}
 function heartImpact(s,target,source){if(!active()||!s||!target||typeof target!=='object')return false;
  const id=source?.heroId??source?.heroId31213;if(id!=='michaela'||source?.actionKey!=='A')return false;
  const tx=target.x,ty=target.y;if(!(Number.isFinite(tx)&&Number.isFinite(ty)))return false;const p=project(tx,ty);if(!(Number.isFinite(p?.x)&&Number.isFinite(p?.y)))return false;
  const f=F(s),cap=phoneNow()?HIT6.cap.mobile:HIT6.cap.pc;loadHit();
  while(f.impacts.length>=cap)f.impacts.shift();f.impacts.push({x:p.x,y:p.y+impactLift(s),born:n(s.time)});metrics.impacts++;return true;}
 function pruneImpacts(f,t){const life=HIT6.frames/HIT6.fps,L=f.impacts;let k=0;for(let i=0;i<L.length;i++){const r=L[i];if(t-r.born<life)L[k++]=r;}L.length=k;}
 function drawImpacts(ctx,f,t,tone){pruneImpacts(f,t);const L=f.impacts;if(!L.length)return 0;const im=hit.state==='ready'?hit.im:null,ok=!!(im&&im.complete&&im.naturalWidth>0),S=HIT6.size,last=HIT6.frames-1;let k=0;
  ctx.globalCompositeOperation='source-over';const T=tone??TONE0;
  for(const r of L){const age=t-r.born;if(age<0||!(Number.isFinite(r.x)&&Number.isFinite(r.y)))continue;const fr=Math.min(last,Math.floor(age*HIT6.fps+1e-9));
   const a=fr<last?1:clamp(1-(age-last/HIT6.fps)*HIT6.fps,0,1);if(a<=0)continue;
   // The artist's sheet is not repainted: a dark separation halo under it and a hero-colour ring over it
   // move it out of the enemy magenta read.
   const u=clamp(age*HIT6.fps/HIT6.frames,0,1);ctx.globalAlpha=.5*a;ctx.fillStyle='rgba(10,6,20,.55)';ctx.beginPath();ctx.arc(r.x,r.y,S*.34,0,TAU);ctx.fill();
   ctx.globalAlpha=.9*a*(1-.6*u);ctx.lineWidth=2.2;ctx.strokeStyle=T.body;ctx.beginPath();ctx.arc(r.x,r.y,S*.3+10*u,0,TAU);ctx.stroke();ctx.globalAlpha=a;
   if(ok){ctx.drawImage(im,fr*HIT6.cell,0,HIT6.cell,HIT6.cell,r.x-S*.42,r.y-S*.42,S*.84,S*.84);k++;}
   else{const u=clamp(age*HIT6.fps/HIT6.frames,0,1),rad=6+22*u,sz=5*(1-.5*u);ctx.fillStyle=u<.5?'#ff5c93':'#ffb3cf';
    for(let j=0;j<6;j++){const ang=j*TAU/6+.3;ctx.save();ctx.translate(r.x+Math.cos(ang)*rad,r.y+Math.sin(ang)*rad);shapePath(ctx,'heart',sz);ctx.fill();ctx.restore();}}}
  ctx.globalAlpha=1;return k;}

 function beamQuad(ctx,ax,ay,bx,by,nx,ny,w0,w1,col,al){ctx.globalAlpha=al;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(ax+nx*w0,ay+ny*w0);ctx.lineTo(bx+nx*w1,by+ny*w1);ctx.lineTo(bx-nx*w1,by-ny*w1);ctx.lineTo(ax-nx*w0,ay-ny*w0);ctx.closePath();ctx.fill();}
 function drawKill(ctx,f,t,set){const K=f.kill,age=t-K.at;if(age<0||age>=1.1||!(Number.isFinite(K.x)&&Number.isFinite(K.y)))return 0;const q=!!set?.reducedFlash,u=age/1.1;let d=0;
  ctx.globalCompositeOperation='lighter';const gs=glowSprite('#ffd27a'),rs=ringSprite('#ffd27a');
  // Visual hold: the flash stays at full size for .18 s, then decays.
  const hold=age<.18?1:Math.exp(-(age-.18)*5),S=200+140*Math.min(1,age/.18);if(gs){ctx.globalAlpha=(q?.3:.95)*hold;ctx.drawImage(gs,K.x-S/2,K.y-S/2,S,S);d++;}
  for(let j=0;j<3;j++){const a=age-j*.12;if(a<0)continue;const v=a/.8;if(v>=1)continue;const R=40+380*(1-(1-v)*(1-v));if(rs){ctx.globalAlpha=(q?.25:.8)*(1-v);ctx.drawImage(rs,K.x-R,K.y-R*.62,2*R,1.24*R);d++;}}
  if(!q){ctx.strokeStyle='#fff3c8';ctx.lineCap='round';ctx.globalAlpha=.7*(1-u);ctx.lineWidth=3*(1-u)+.6;ctx.beginPath();
   for(let j=0;j<10;j++){const ang=j*TAU/10+.3,L0=40+280*Math.min(1,age/.45),L1=L0*.45;ctx.moveTo(K.x+Math.cos(ang)*L1,K.y+Math.sin(ang)*L1*.8);ctx.lineTo(K.x+Math.cos(ang)*L0,K.y+Math.sin(ang)*L0*.8);}ctx.stroke();}
  return d;}
 // Heart ring: white with a dark outline, always on while the dense layer is active; brightens (and
 // pulses unless reducedFlash) when a bullet is within graze range. The hitbox itself is unchanged.
 const RING={on:false,r:8.5,alpha:.75,near:0};
 function heartRing(s,m,set,hx,hy,t){RING.on=false;RING.near=0;RING.r=8.5;RING.alpha=.75;if(!m||!(n(s.hp)>0)||!(m.owner||m.run||n(m.pool?.live)>0))return RING;
  const P=m.pool;let best=1e9;if(P)for(let i=0;i<P.live;i++){const dx=P.x[i]-hx,dy=P.y[i]-hy,d=dx*dx+dy*dy;if(d<best)best=d;}
  const d=Math.sqrt(best),near=clamp((RING_NEAR-d)/(RING_NEAR-RING_TOUCH),0,1);RING.on=true;RING.near=near;RING.alpha=.72+.28*near;
  RING.r=8.5+(set?.reducedFlash||near<=0?0:1.3*near*Math.sin(t*18));return RING;}
 function drawHeartRing(ctx,s,m,set,hx,hy,t){const R=heartRing(s,m,set,hx,hy,t);if(!R.on)return;ctx.globalCompositeOperation='source-over';ctx.lineCap='butt';
  ctx.globalAlpha=.85*R.alpha;ctx.lineWidth=4.5;ctx.strokeStyle=INK;ctx.beginPath();ctx.arc(hx,hy,R.r,0,TAU);ctx.stroke();
  ctx.globalAlpha=R.alpha;ctx.lineWidth=2;ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.arc(hx,hy,R.r,0,TAU);ctx.stroke();
  if(R.near>.02){ctx.globalAlpha=.75*R.near;ctx.lineWidth=1.5;ctx.strokeStyle=heroTone(s).ring;ctx.beginPath();ctx.arc(hx,hy,R.r+5,0,TAU);ctx.stroke();}}
 // ---------------------------------------------------------------- draw (world space, under the bullets)
 function draw(ctx,s,m,set){if(!active())return 0;const kd=kitCall('draw',ctx,s,m,set);const f=worlds.get(s);if(!f)return n(kd);const t0=now(),t=n(s.time);let draws=n(kd);
  const P=f.coins;
  if(P.live){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
   const pal=palette(m);for(let i=0;i<P.live;i++){const k=P.kind[i],sp=coinSprite(k,pal);if(!(Number.isFinite(P.x[i])&&Number.isFinite(P.y[i])))continue;const sx=Math.max(.18,Math.abs(Math.cos(8*t+P.id[i])));
    if(sp){const W=sp.W;ctx.drawImage(sp.c,P.x[i]-W*sx/2,P.y[i]-W/2,W*sx,W);draws++;}
    else{ctx.fillStyle=pal.coin[k];ctx.fillRect(P.x[i]-3*sx,P.y[i]-3,6*sx,6);}}}
  const hx=n(m?.hx,f.lastHx),hy=n(m?.hy,f.lastHy),c=f.charge;if(!(Number.isFinite(hx)&&Number.isFinite(hy)))return draws;
  // Charge ring / cooldown arc around the heart.
  if(c.on||t<c.cdUntil){ctx.lineWidth=2;ctx.globalCompositeOperation='source-over';
   if(c.on){const hold=t-c.start+c.extra,u=clamp(hold/T2,0,1),t2=hold>=T2,t1=hold>=T1;
    ctx.globalAlpha=.85;ctx.strokeStyle=t2?'#ffffff':t1?palette(m).body:'rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(hx,hy,16+(t2&&!set?.reducedFlash?1.5*Math.sin(t*18):0),-Math.PI/2,-Math.PI/2+u*TAU);ctx.stroke();
    if(t2&&!lowFx(set)){ctx.fillStyle='#ffffff';for(let k=0;k<6;k++){const a=k*TAU/6+t*3,r=26-((t*40+k*5)%14);ctx.fillRect(hx+Math.cos(a)*r-1,hy+Math.sin(a)*r-1,2,2);}}}
   else{const u=clamp((c.cdUntil-t)/Math.max(.1,c.cdDur),0,1);ctx.globalAlpha=.45;ctx.strokeStyle='#8a8f9e';ctx.beginPath();ctx.arc(hx,hy,16,-Math.PI/2,-Math.PI/2+u*TAU);ctx.stroke();}}
  // Beams: hero-colour glow, body and white core, widening toward the target; muzzle glow and impact flare.
  for(const b of f.beams){const u=(t-b.at)/b.life;if(u<0||u>=1)continue;const ex=b.tx,ey=b.ty,dx=ex-b.ax,dy=ey-b.ay,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,fade=1-u*u;
   if(!(Number.isFinite(ex)&&Number.isFinite(ey)))continue;ctx.globalCompositeOperation='lighter';const w=b.hw*(1-.35*u);
   beamQuad(ctx,b.ax,b.ay,ex,ey,nx,ny,w*1.1,w*2.6,b.color,.2*fade);beamQuad(ctx,b.ax,b.ay,ex,ey,nx,ny,w*.5,w*1.15,b.color,.6*fade);beamQuad(ctx,b.ax,b.ay,ex,ey,nx,ny,w*.16,w*.42,b.core,.95*fade);
   const gs=glowSprite(b.color);if(gs){const M=w*3.2;ctx.globalAlpha=.7*fade;ctx.drawImage(gs,b.ax-M/2,b.ay-M/2,M,M);draws++;
    if(b.hasT){const S=(b.tier===2?150:100)*(.8+.5*Math.min(1,u*3));ctx.globalAlpha=.95*fade;ctx.drawImage(gs,ex-S/2,ey-S/2,S,S);draws++;
     ctx.strokeStyle=b.core;ctx.lineCap='round';ctx.lineWidth=2;ctx.globalAlpha=.8*fade;ctx.beginPath();for(let k=0;k<6;k++){const a=k*TAU/6+b.at*7,r0=S*.18,r1=S*(.34+.12*(k&1));ctx.moveTo(ex+Math.cos(a)*r0,ey+Math.sin(a)*r0);ctx.lineTo(ex+Math.cos(a)*r1,ey+Math.sin(a)*r1);}ctx.stroke();}}}
  if(f.sparks.length){ctx.globalCompositeOperation='lighter';for(const q of f.sparks){const u=(t-q.born)/q.life;if(u<0||u>=1)continue;const x=q.x+q.vx*(t-q.born),y=q.y+q.vy*(t-q.born);if(!(Number.isFinite(x)&&Number.isFinite(y)))continue;
    const gs=glowSprite(q.c);ctx.globalAlpha=1-u;if(gs){const S=10*(1-.5*u);ctx.drawImage(gs,x-S/2,y-S/2,S,S);draws++;}}}
  if(f.kill)draws+=drawKill(ctx,f,t,set);
  if(f.impacts.length)draws+=drawImpacts(ctx,f,t,heroTone(s));
  ctx.globalCompositeOperation='source-over';drawBolts(ctx,f,t);
  // The screen pass draws the ring above native art when it can place it; the world ring is the fallback.
  if(m&&!(t-n(f.ringScreenAt,-9)<.2&&t>=n(f.ringScreenAt,-9)))drawHeartRing(ctx,s,m,set,hx,hy,t);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  metrics.draws++;metrics.drawImages=draws;metrics.drawMs=metrics.drawMs*.9+(now()-t0)*.1;return draws;}

 // ---------------------------------------------------------------- screen HUD: score/chain, warning, tally
 function fmt(v){return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');}
 function modalOpen(s){return !!(s.modal||s.requiredScene||s.requiredSceneV31238||s.cutscene||s.dialogue||s.paused);}
 function drawScreen(ctx,s,m,set){if(!active())return;const u=U();if(!u?.screenSpace)return;ctx.save();try{kitCall('drawScreen',ctx,s,m,set);}finally{ctx.restore();}const f=worlds.get(s);
  ctx.save();try{const v=u.screenSpace(ctx);if(!v)return;if(f)screenFeel(ctx,s,m,set,f,v.w,v.h,n(s.time),u);
   // Boss-form overlay (second-form flash) draws last, above the HUD and the spell banner.
   const B=root.__HAPIL_BOSS_FORM_RC240__;if(typeof B?.drawOverlay==='function'){ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';B.drawOverlay(ctx,s,set,v.w,v.h);}}
  catch(e){fail(e);}finally{ctx.restore();}}
 function hudStroke(ctx,t,x,y){const f=Object.getPrototypeOf(ctx)?.strokeText;if(typeof f==='function')f.call(ctx,t,x,y);else ctx.strokeText?.(t,x,y);}
 function dia(ctx,x,y,r){ctx.moveTo(x,y-r);ctx.lineTo(x+r*.8,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.8,y);ctx.closePath();}
 // Ornamented panel in the game's own HUD idiom: dark panel with soft ends, double gold rules, end
 // diamonds, small curled corner flourishes and a centre jewel. Paths only (no fillRect, no gradients).
 function ornPanel(ctx,cx,cy,pw,ph,a,rule){if(!(a>0)||!(pw>4))return;const x0=cx-pw/2,x1=cx+pw/2,y0=cy-ph/2,y1=cy+ph/2,cap=Math.min(36,pw*.14),cw=cap/3;
  ctx.fillStyle='#08050c';ctx.globalAlpha=.82*a;ctx.beginPath();ctx.rect(x0+cap,y0,pw-2*cap,ph);ctx.fill();
  for(let i=0;i<3;i++){ctx.globalAlpha=(.62-.2*i)*a;ctx.beginPath();ctx.rect(x0+cap-cw*(i+1),y0,cw,ph);ctx.rect(x1-cap+cw*i,y0,cw,ph);ctx.fill();}
  ctx.fillStyle=rule;ctx.globalAlpha=.95*a;ctx.beginPath();ctx.rect(x0+cap*.55,y0,pw-cap*1.1,1.2);ctx.rect(x0+cap*.55,y1-1.2,pw-cap*1.1,1.2);ctx.fill();
  ctx.globalAlpha=.42*a;ctx.beginPath();ctx.rect(x0+cap,y0+3.2,pw-2*cap,.8);ctx.rect(x0+cap,y1-4,pw-2*cap,.8);ctx.fill();
  ctx.globalAlpha=.95*a;ctx.beginPath();dia(ctx,x0+cap*.55,y0+.6,3);dia(ctx,x1-cap*.55,y0+.6,3);dia(ctx,x0+cap*.55,y1-.6,3);dia(ctx,x1-cap*.55,y1-.6,3);dia(ctx,cx,y0+.6,4.2);ctx.fill();
  ctx.fillStyle='#08050c';ctx.beginPath();dia(ctx,cx,y0+.6,1.8);ctx.fill();
  ctx.strokeStyle=rule;ctx.lineWidth=1;ctx.globalAlpha=.8*a;ctx.beginPath();
  ctx.moveTo(x0+cap*.55-3,y0+.6);ctx.quadraticCurveTo?.(x0+cap*.55-12,y0+2,x0+cap*.55-9,y0+9);ctx.moveTo(x1-cap*.55+3,y0+.6);ctx.quadraticCurveTo?.(x1-cap*.55+12,y0+2,x1-cap*.55+9,y0+9);
  ctx.moveTo(x0+cap*.55-3,y1-.6);ctx.quadraticCurveTo?.(x0+cap*.55-12,y1-2,x0+cap*.55-9,y1-9);ctx.moveTo(x1-cap*.55+3,y1-.6);ctx.quadraticCurveTo?.(x1-cap*.55+12,y1-2,x1-cap*.55+9,y1-9);ctx.stroke();}
 const ease3=v=>1-Math.pow(1-clamp(v,0,1),3);
 const WB=[0,0,0,0];
 function warnBox(w,h,mobile,big,m,t){const pw=mobile?Math.min(380,w*.5):Math.min(560,w*.46),ph=mobile?(big?44:32):(big?60:42);let cy=mobile?78:Math.max(84,h*.15);let cx=mobile?w*.42:w/2;cx=Math.max(pw/2+8,Math.min(w-pw/2-8,cx));
  // Keep clear of the RC240 spell card (danmaku drawBanner geometry: big card at h*.24, settled card at
  // y 62/74, top-centre card at 46/22). Vertical test only, so it is conservative.
  const C=m?.banner;if(C&&Number.isFinite(t)){const cm=!!m.mobile||w<800,age=t-n(C.born),u=Math.min(1,Math.max(0,(age-1.52)/.35)),bg=age>1.52?Math.pow(1-u,3):1,sh=(cm?40:50)+(cm?6:8)*bg,
   y=C.top?(cm?22:46)+sh/2:h*.24*bg+(cm?74:62)*(1-bg),yT=y-sh/2,yB=y+sh/2;
   if(cy-ph/2<yB&&cy+ph/2>yT){const up=yT-ph/2-6,dn=yB+ph/2+6;cy=(!mobile&&up>=ph/2+4)?up:(dn+ph/2<=h*.5?dn:Math.max(ph/2+4,up));}}
  WB[0]=cx;WB[1]=n(cy,84);WB[2]=pw;WB[3]=ph;return WB;}
 // Warning edge vignette (fix round 2): dark, slightly red, source-over only, so blacks never lift.
 // Radial gradients cached per ctx/size (no per-frame allocation, no image draws in the HUD pass).
 const VIG={edge:'rgba(34,0,8,.66)',mid:'rgba(20,0,6,.2)',g:null,ctx:null,w:0,h:0};
 function vignette(ctx,w,h){if(VIG.g&&VIG.ctx===ctx&&VIG.w===w&&VIG.h===h)return VIG.g;if(typeof ctx.createRadialGradient!=='function')return null;
  const R=Math.hypot(w,h)/2,G=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,R);G.addColorStop(0,'rgba(0,0,0,0)');G.addColorStop(.45,VIG.mid);G.addColorStop(1,VIG.edge);
  VIG.g=G;VIG.ctx=ctx;VIG.w=w;VIG.h=h;return G;}
 // Dark separation disc under the screen-pass heart ring (dims native labels / whip art right at the core).
 const DISC={g:null,ctx:null};
 function disc(ctx){if(DISC.g&&DISC.ctx===ctx)return DISC.g;if(typeof ctx.createRadialGradient!=='function')return null;const G=ctx.createRadialGradient(0,0,0,0,0,34);
  G.addColorStop(0,'rgba(6,3,12,.8)');G.addColorStop(.45,'rgba(6,3,12,.55)');G.addColorStop(1,'rgba(6,3,12,0)');DISC.g=G;DISC.ctx=ctx;return G;}
 // World (G px) -> CSS px through the world transform the danmaku world pass saved (m.wm, device px).
 const SP={x:0,y:0};
 function toScreen(ctx,m,x,y,w,h){const M=m?.wm,cv=ctx.canvas;if(!M||!m.wmOk||!cv||!(cv.width>0)||!(cv.height>0))return null;const X=(M[0]*x+M[2]*y+M[4])*w/cv.width,Y=(M[1]*x+M[3]*y+M[5])*h/cv.height;if(!(X===X&&Y===Y))return null;SP.x=X;SP.y=Y;return SP;}
 function screenFeel(ctx,s,m,set,f,w,h,t,u){const mobile=!!m?.mobile||w<800||h<500,txt=(a,x,y)=>u.hudText(ctx,a,x,y),quiet=!!set?.reducedFlash;
  ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.shadowBlur=0;ctx.textBaseline='middle';ctx.direction='ltr';
  // Score + chain: top right (PC) / left of the settings button (phone), out of the top-centre presentation column.
  if(f.score>0||f.chain>=5){ctx.textAlign='right';const rx=mobile?w-58:w-24,y0=mobile?14:18;
   if(!mobile){ctx.globalAlpha=.92;ctx.font='bold 13px ui-monospace,Menlo,monospace';ctx.fillStyle='#000000';txt('점수 '+fmt(f.score),rx+1,y0+1);ctx.fillStyle='#f6f0ff';txt('점수 '+fmt(f.score),rx,y0);
    if(f.chain>=5){ctx.globalAlpha=.9;ctx.font='bold 12px ui-monospace,Menlo,monospace';const line='연쇄 '+f.chain+' ×'+f.mult.toFixed(1);ctx.fillStyle='#000000';txt(line,rx+1,y0+17);ctx.fillStyle=f.mult>=2?'#ffd34d':'#bff4ff';txt(line,rx,y0+16);}}
   else{ctx.globalAlpha=.9;ctx.font='bold 11px ui-monospace,Menlo,monospace';const line='점수 '+fmt(f.score);ctx.fillStyle='#000000';txt(line,rx+1,y0+1);ctx.fillStyle='#f6f0ff';txt(line,rx,y0);
    if(f.chain>=10){const l2='연쇄 '+f.chain+' ×'+f.mult.toFixed(1);ctx.font='bold 10px ui-monospace,Menlo,monospace';ctx.fillStyle='#000000';txt(l2,rx+1,y0+14);ctx.fillStyle=f.mult>=2?'#ffd34d':'#bff4ff';txt(l2,rx,y0+13);}}}
  // Kill beat: a short additive flash, a spotlight dim held on the boss (reads as a hit-stop), then
  // two thick rings and rays from the boss in screen space; the tally comes after.
  const K=f.kill;if(K){const age=t-K.at;let bx=w*.68,by=h*.42;const p=toScreen(ctx,m,K.x,K.y,w,h);if(p){bx=clamp(p.x,0,w);by=clamp(p.y,0,h);}
   if(age>=0&&age<.12){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(quiet?.18:.42)*(1-age/.12);ctx.fillStyle='#fff3d8';ctx.beginPath();ctx.rect(0,0,w,h);ctx.fill();ctx.globalCompositeOperation='source-over';}
   if(age>=.06&&age<.8){const v=age<.5?1:1-(age-.5)/.3,G=ctx.createRadialGradient?.(bx,by,40,bx,by,Math.max(w,h)*.8);if(G){G.addColorStop(0,'rgba(5,3,10,0)');G.addColorStop(.25,'rgba(5,3,10,.32)');G.addColorStop(1,'rgba(5,3,10,.55)');ctx.globalAlpha=v;ctx.fillStyle=G;ctx.beginPath();ctx.rect(0,0,w,h);ctx.fill();}}
   if(age>=0&&age<.9){const Rm=mobile?Math.max(w,h)*.42:Math.max(w,h)*.36;ctx.lineCap='round';
    for(let j=0;j<2;j++){const a=age-j*.12;if(a<0)continue;const v=a/.65;if(v>=1)continue;const R=24+Rm*ease3(v),lw=(mobile?8:10)*(1-v)+2;
     ctx.globalAlpha=.7*(1-v);ctx.lineWidth=lw+3;ctx.strokeStyle=INK;ctx.beginPath();ctx.arc(bx,by,R,0,TAU);ctx.stroke();
     ctx.globalAlpha=(quiet?.6:.95)*(1-v);ctx.lineWidth=lw;ctx.strokeStyle=j?'#ffd27a':'#fff3c8';ctx.beginPath();ctx.arc(bx,by,R,0,TAU);ctx.stroke();}
    const v=clamp(age/.5,0,1);if(v<1){ctx.globalAlpha=(quiet?.35:.6)*(1-v);ctx.strokeStyle='#ffe59a';ctx.lineWidth=(mobile?2.5:3)*(1-v)+1;ctx.beginPath();
     for(let j=0;j<12;j++){const ang=j*TAU/12+.2,L0=30+Rm*.9*ease3(v),L1=L0*.55;ctx.moveTo(bx+Math.cos(ang)*L1,by+Math.sin(ang)*L1);ctx.lineTo(bx+Math.cos(ang)*L0,by+Math.sin(ang)*L0);}ctx.stroke();}}}
  // Boss warning: dark red edge vignette + ornamented band in the upper third, after the stage title card.
  // The spell card is held by the danmaku layer while it is up, so the band takes the free slot.
  const Wn=f.warn;if(Wn){const age=t-Wn.at;if(age>=0&&age<Wn.dur){const fade=Math.min(1,age/.18)*Math.min(1,(Wn.dur-age)/.3);
    const vg=vignette(ctx,w,h);if(vg){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=fade*(quiet?.75:.6+.4*(.5+.5*Math.sin(age*TAU*1.2)));ctx.fillStyle=vg;ctx.beginPath();ctx.rect(0,0,w,h);ctx.fill();}
    const B=warnBox(w,h,mobile,Wn.big,m?.banner&&!m.banner.held?m:null,t),cx=B[0],cy=(Wn.cy=Wn.cy==null||age<.02?B[1]:Wn.cy+(B[1]-Wn.cy)*.2),pw0=B[2],ph=B[3],pw=pw0*(quiet?1:.3+.7*ease3(age/.28));
    ornPanel(ctx,cx,cy,pw,ph,fade,GOLD);const ty=Wn.big?cy-ph*.16:cy;ctx.textAlign='center';ctx.lineJoin='round';
    ctx.font='bold '+(Wn.big?(mobile?17:24):(mobile?13:17))+'px "Noto Serif KR","Nanum Myeongjo",serif';ctx.globalAlpha=fade;ctx.lineWidth=3;ctx.strokeStyle=INK;const title=Wn.big?'경고 · 거대 반응 접근':'경고 · 반응 접근';
    hudStroke(ctx,title,cx,ty);ctx.fillStyle='#ff5a62';txt(title,cx,ty);
    if(Wn.name&&Wn.big){ctx.font=(mobile?11:14)+'px "Noto Serif KR","Nanum Myeongjo",serif';ctx.fillStyle='#efe2c4';ctx.globalAlpha=.92*fade;txt(u.fitText?u.fitText(ctx,Wn.name,pw*.8):Wn.name,cx,cy+ph*.27);}}}
  // Callouts: the hero-side lane (left), in the upper band, clear of the centre column and debuff labels.
  const lx=calloutX(w,mobile);let row=0;ctx.textAlign='center';ctx.lineJoin='round';const cy=calloutY(w,h,mobile);
  for(let pass=0;pass<CALL_N;pass++){let k=null;for(let i=0;i<CALL_N;i++){const c=f.calls[i],age=t-c.at;if(age<0||age>=c.dur||c.drawn===t)continue;if(!k||c.at>k.at)k=c;}if(!k)break;k.drawn=t;
   const age=t-k.at,a=Math.min(1,age/.1)*Math.min(1,(k.dur-age)/.25),fz=k.big?(mobile?16:21):(mobile?13:16),y=cy+row*(mobile?17:21)+(k.big?2:0)-(quiet?0:6*Math.min(1,age/.3));ctx.font='bold '+fz+'px "Noto Serif KR","Nanum Myeongjo",serif';
   ctx.globalAlpha=a;ctx.lineWidth=3;ctx.strokeStyle=INK;hudStroke(ctx,k.text,lx,y);ctx.fillStyle=k.color;txt(k.text,lx,y);row+=k.big?1.3:1;}
  for(let i=0;i<CALL_N;i++)f.calls[i].drawn=-1;
  // Heart ring above everything native (debuff labels, whip / lance art): screen pass, hero colour, dark disc.
  if(m&&!(f.kill&&t-f.kill.at<.12)&&!(titleUntil(s)>t)){const R=heartRing(s,m,set,n(m.hx,f.lastHx),n(m.hy,f.lastHy),t);const p=R.on?toScreen(ctx,m,n(m.hx,f.lastHx),n(m.hy,f.lastHy),w,h):null;
   if(p){f.ringScreenAt=t;const X=p.x,Y=p.y,r=(mobile?9:10)+(R.r-8.5),T=heroTone(s),dc=disc(ctx);ctx.globalCompositeOperation='source-over';ctx.lineCap='butt';
    if(dc){ctx.globalAlpha=.85;ctx.save();ctx.translate(X,Y);ctx.fillStyle=dc;ctx.beginPath();ctx.arc(0,0,34,0,TAU);ctx.fill();ctx.restore();}
    ctx.globalAlpha=.95;ctx.lineWidth=5;ctx.strokeStyle=INK;ctx.beginPath();ctx.arc(X,Y,r,0,TAU);ctx.stroke();
    ctx.globalAlpha=R.alpha;ctx.lineWidth=2.4;ctx.strokeStyle=T.body;ctx.beginPath();ctx.arc(X,Y,r,0,TAU);ctx.stroke();
    ctx.globalAlpha=.9;ctx.lineWidth=1;ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.arc(X,Y,r-2.2,0,TAU);ctx.stroke();
    ctx.globalAlpha=1;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(X,Y,mobile?2.2:2.4,0,TAU);ctx.fill();
    if(R.near>.02){ctx.globalAlpha=.8*R.near;ctx.lineWidth=1.6;ctx.strokeStyle=T.ring;ctx.beginPath();ctx.arc(X,Y,r+5,0,TAU);ctx.stroke();}}}
  // Result tally: after the kill beat, centred, larger, counting up; zero rows were dropped at creation.
  const T=f.tally;if(T){const age=t-T.at;if(age>=TALLY_LIFE)f.tally=null;else if(age>=0&&!modalOpen(s)&&T.rows){const k=clamp(age/1.2,0,1),fade=Math.min(1,age/.2)*Math.min(1,(TALLY_LIFE-age)/.4);
   const pw=mobile?Math.min(300,w*.46):Math.min(420,w*.36),lh=mobile?18:26,ph=lh*(T.rows.length+1)+(mobile?20:28),rise=quiet?0:(1-ease3(age/.3))*14,x0=(w-pw)/2,y0=Math.max(mobile?44:60,h*(mobile?.3:.36)-ph/2)+rise,cx=w/2;
   ctx.globalAlpha=.35*fade;ctx.fillStyle='#05030a';ctx.beginPath();ctx.rect(0,y0-10,w,ph+20);ctx.fill();
   ornPanel(ctx,cx,y0+ph/2,pw,ph,fade,GOLD);
   ctx.globalAlpha=fade;ctx.textAlign='center';ctx.font='bold '+(mobile?17:24)+'px "Noto Serif KR","Nanum Myeongjo",serif';ctx.lineWidth=3;ctx.strokeStyle=INK;hudStroke(ctx,'격파 결산',cx,y0+lh*.5+10);ctx.fillStyle='#ffe59a';txt('격파 결산',cx,y0+lh*.5+10);
   ctx.font=(mobile?13:17)+'px system-ui,sans-serif';const pad=mobile?18:28;for(let i=0;i<T.rows.length;i++){const r=T.rows[i],y=y0+lh*(i+1.5)+(mobile?10:14),v=r[1]==='time'?(r[2]*k).toFixed(1)+'s':r[1]==='frac'?Math.round(r[2]*k)+'/'+Math.round(T.spells):r[1]==='plus'?'+'+fmt(r[2]*k):fmt(r[2]*k);
    ctx.textAlign='left';ctx.fillStyle='#c9c4d8';txt(r[0],x0+pad,y);ctx.textAlign='right';ctx.fillStyle=r[1]==='plus'?'#ffe59a':'#ffffff';txt(v,x0+pw-pad,y);}}}}

 // ---------------------------------------------------------------- flow streaks (background, before RC240 dim)
 const STREAK_SEEDS=[];for(let i=0;i<28;i++){const a=Math.sin(i*12.9898)*43758.5453,b=Math.sin(i*78.233)*12345.678,c=Math.sin(i*39.425)*24680.135;STREAK_SEEDS.push({y:a-Math.floor(a),v:b-Math.floor(b),l:c-Math.floor(c),g:i%3});}
 function drawBackground(ctx,s,m,set){if(!active()||!m)return 0;
  // Floor pass (under actors): boss-form contact shadows / second-form floor sigil.
  const BF=root.__HAPIL_BOSS_FORM_RC240__;if(typeof BF?.drawFloor==='function'){ctx.save();try{BF.drawFloor(ctx,s,set);}catch(e){fail(e);}finally{ctx.restore();}}
  const dim=n(m.dim);if(dim<.02||lowFx(set))return 0;const cv=ctx.canvas;if(!cv)return 0;
  const N=m.mobile?12:28,W=cv.width,Hh=cv.height,k=W/1280,t=n(s.time),aMul=dim*(set?.reducedFlash?.5:1);let strokes=0;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.lineWidth=Math.max(1,1.2*k);ctx.lineCap='round';
  const cols=['#ffffff','#ffffff',HUE_OF(m)];
  for(let g=0;g<3;g++){ctx.beginPath();let any=false;
   for(let i=0;i<N;i++){const q=STREAK_SEEDS[i];if(q.g!==g)continue;const len=(60+120*q.l)*k,sp=(420+480*q.v)*k,span=W+len*2;const x=W+len-((t*sp+q.y*span*7)%span),y=Hh*(.24+.62*q.y);ctx.moveTo(x,y);ctx.lineTo(x+len,y);any=true;}
   if(!any)continue;ctx.globalAlpha=(.05+.035*g)*aMul;ctx.strokeStyle=cols[g];ctx.stroke();strokes++;}
  ctx.globalAlpha=1;metrics.streakStrokes=strokes;return strokes;}
 function HUE_OF(m){const fam=m?.family;const map={rage:'#7fd8ff',envy:'#ffb15c',greed:'#ffd34d',gluttony:'#c3ff7a',obsession:'#ff7ad9',order:'#b8c8ff',petal:'#ffa3c8',lucifer:'#d8a0ff'};return map[fam]??'#d8c8ff';}

 // ---------------------------------------------------------------- API
 const api={version:VERSION,tick,draw,drawScreen,drawBackground,onCancel,onGraze,onSpellEnd,onHit,onOwner,reset,
  play,duck,heartImpact,callout,calloutY,calloutX,
  toScreen:(ctx,m,x,y,w,h)=>{const p=toScreen(ctx,m,x,y,w,h);return p?{x:p.x,y:p.y}:null;},warningActive,warnUntil,killBeat,heroTone,glowSprite,ringSprite,ornPanel,
  impacts:s=>worlds.get(s)?.impacts.length??0,
  assets:()=>({hit6:hit.state,loads:hit.loads}),
  dropCoins(s,x,y,count=1){if(!active()||!s||!(Number.isFinite(x)&&Number.isFinite(y)))return 0;const f=F(s);let c=0;const N=clamp(Math.floor(n(count,0)),0,24);for(let j=0;j<N;j++)if(spawnCoin(f,x+(j%3-1)*6,y-(j/3|0)*5,1))c++;return c;},
  dropPower(s,x,y,count=1){if(!active()||!s)return 0;return n(kitCall('dropPower',s,x,y,count));},
  aStats(s){const f=s&&worlds.get(s);if(!f)return {aPow:0,aSum:0};let a=0;for(const r of f.aWin)a+=r.p;return {aPow:f.aPow,aSum:a};},
  rank(s){if(!active()||!s)return 1;const v=kitCall('rank',s);return Number.isFinite(v)?v:1;},
  decorateAttack(s,before){if(!active()||!s)return;kitCall('decorateAttack',s,before);},
  valid:(s,a)=>valid(s,a),palette,shapes:Object.freeze({boltShape,shapePath,UPRIGHT}),
  metrics:()=>({...metrics,lastError}),
  state(s){const f=s&&worlds.get(s);if(!f)return null;return {score:f.score,chain:f.chain,maxChain:f.maxChain,mult:f.mult,coins:f.coins.live,cap:f.capNow,collected:f.collected,grazes:f.grazes,aPow:f.aPow,
   charging:f.charge.on,bolts:f.bolts.length,cdUntil:f.charge.cdUntil,beams:f.beams.length,warn:f.warn?{...f.warn}:null,tally:f.tally?{...f.tally}:null,fight:f.fight?{...f.fight}:null};},
  __test:{boltShape,SHAPE_BY_SHOT,HERO_SHOT,GAIN,DUCKED,palette,worlds,COIN_CAP,CANCEL_RULES,T1,T2,CD1,CD2,beamEnd,tameRoom,fire,coinSprite,HIT6,KILL_BEAT,warnBox,warnVignette:()=>({edge:VIG.edge,mid:VIG.mid}),toScreen,heartRing:(s,m,set)=>{const f=worlds.get(s);const h=heartRing(s,m,set??{},n(m?.hx,f?.lastHx??640),n(m?.hy,f?.lastHy??400),n(s.time));return {...h};},
   beamRows:s=>(worlds.get(s)?.beams??[]).map(b=>({ax:b.ax,ay:b.ay,tx:b.tx,ty:b.ty,color:b.color,hasT:b.hasT})),impactRows:s=>[...(worlds.get(s)?.impacts??[])]}};
 Object.defineProperty(root,'__HAPIL_STG_FEEL_RC240__',{value:Object.freeze(api),configurable:true,writable:false,enumerable:false});
})(typeof window==='object'?window:globalThis);
