/* RC240 STG feel: spirit coins, chain/score HUD, charge shot (기합탄), EGO wipe,
 * boss warning, result tally and flow streaks. Original genre mechanics only.
 * Runs exclusively through RC240 danmaku-layer hooks, so it is inert whenever the
 * danmaku layer is disabled (?qa without rc240=1). Nothing is written into saves;
 * the only game state touched is s.fxSerial, s.pendingStrikes and s.floatTexts.
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
 const CANCEL_RULES={bomb:{every:2,max:48,kind:1},capture:{every:3,max:48,kind:1},'spell-end':{every:6,max:24,kind:0},serial:{every:6,max:24,kind:0},owner:{every:2,max:64,kind:1},wipe:{every:3,max:40,kind:0},api:{every:3,max:40,kind:0}};
 // Gain tiers (player hit > shot/charge/bomb > boss > hit-confirm > enemy bullet > mobs); RC240 adds no enemy-bullet or mob sounds.
 // pickup/familiar sit in the hit-confirm band, below confirm. Bomb or a player hit ducks every tier below 'shot' for .25 s.
 const GAIN=Object.freeze({bomb:.34,charge:.3,shot:.26,ready:.2,boss:.18,confirm:.12,pickup:.08,familiar:.06});
 const DUCKED=Object.freeze({boss:1,confirm:1,pickup:1,familiar:1}),DUCK=.25,GAIN_MAX=.35;
 const KIT=()=>root.__HAPIL_ARCADE_KIT_RC240__;
 function kitCall(name,...a){const k=KIT();if(!k||typeof k[name]!=='function')return undefined;try{return k[name](...a);}catch(e){fail(e);}return undefined;}
 const AUDIO={arcane:'./audio/rc22/arcane.wav',laser:'./audio/rc22/laser.wav',shot:'./audio/rc22/shot.wav',heavy:'./audio/rc22/heavy.wav',guard:'./audio/rc22/guard.wav'};
 const metrics={ticks:0,coinsSpawned:0,coinsCollected:0,coinsDropped:0,strikes:0,tamePower:0,aPower:0,beams:0,beamCuts:0,wipes:0,warnings:0,tallies:0,sounds:0,draws:0,drawImages:0,drawMs:0,streakStrokes:0,errors:0};
 let lastError=null;
 function fail(e){metrics.errors++;lastError=String(e&&e.stack||e).slice(0,300);if(metrics.errors<=3)root.console?.warn?.('RC240 stg feel',e);}

 // ---------------------------------------------------------------- per-world state
 const worlds=new WeakMap();
 function coinPool(cap){return {cap,live:0,x:new Float32Array(cap),y:new Float32Array(cap),vx:new Float32Array(cap),vy:new Float32Array(cap),age:new Float32Array(cap),kind:new Uint8Array(cap),id:new Uint16Array(cap)};}
 function fresh(s){return {zone:s.zone,coins:coinPool(COIN_CAP.pc),capNow:COIN_CAP.pc,serial:0,rng:(n(s.time)*1e3|0)^0x5f3759df,
  score:0,chain:0,chainUntil:-1,maxChain:0,mult:1,collected:0,grazes:0,
  charge:{on:false,start:0,extra:0,t2Sounded:false,cdUntil:-1,cdDur:1,released:-9},duckUntil:-1,aPow:0,aSeen:new WeakSet(),aWin:[],tameWin:[],autoAt:-1,
  beams:[],bolts:[],sparks:[],awakeWas:false,warned:new Set(),warn:null,fight:null,tally:null,ev:{at:-1,reason:'',n:0,coins:0,big:false},sounds:{},lastHx:640,lastHy:400};}
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
 function float(s,text,color,duration=.9){try{(s.floatTexts??=[]).push({id:s.fxSerial=(n(s.fxSerial)+1),x:s.x,y:s.y,born:s.time,duration,text,color,rc240:true});}catch(e){}}
 function lowFx(set){return !!set?.lowFx;}

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
  if(f.warned.has(key))return;f.warned.add(key);const big=!!a.boss;f.warn={at:t,dur:big?2.2:1.2,name:String(a.name??''),big};metrics.warnings++;
  if(m)m.warnHoldUntil=t+(big?1:.5);sound(f,s,'heavy',big?GAIN.boss:GAIN.boss*.7,.5,'boss');}

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
  const pal=palette(m);if(!(Number.isFinite(hx)&&Number.isFinite(hy)&&Number.isFinite(end.x)&&Number.isFinite(end.y)))return;
  const beam={at:t,life:.35,ax:hx,ay:hy,bx:end.x,by:end.y,hw,tier,color:pal.body,core:pal.core,cut:0};
  // Hero-keyed bolts (rc225 SHOTS identity) fly to the target: 3 at T1, 6 at T2.
  const shape=boltShape(s.activeHeroId),tp=tgt?project(tgt.x,tgt.y):{x:mz.x,y:mz.y+46},tx=n(tp.x,mz.x),ty=n(tp.y,mz.y+46)-46,cnt=tier===2?6:3;
  for(let j=0;j<cnt;j++){const off=(j-(cnt-1)/2)*(tier===2?9:12);f.bolts.push({born:t+j*.035,dur:.2,ax:hx,ay:hy,tx,ty,off,shape,size:tier===2?9:7,pal});}
  if(f.bolts.length>18)f.bolts.splice(0,f.bolts.length-18);f.beams.push(beam);if(f.beams.length>4)f.beams.shift();metrics.beams++;
  cutBeam(s,f,beam);
  if(tgt&&f.aPow>0){let room=tameRoom(f,auto);const base=f.aPow*(tier===2?3:1.6)*(auto?.75:1);const main=Math.min(base,room);if(pushStrike(s,f,tgt,main,tier,color))room-=main;
   if(tier===2){let extra=0;for(const e of s.enemies??[]){if(extra>=3||e===tgt||!valid(s,e))continue;const q=project(e.x,e.y);if(segDist(q.x,q.y-42,hx,hy,end.x,end.y)>hw+24)continue;
     const p=Math.min(f.aPow*1.8*(auto?.75:1),room);if(pushStrike(s,f,e,p,tier,color)){room-=p;extra++;}}}
   const q=project(tgt.x,tgt.y);for(let k=0;k<10;k++){const ang=rnd(f)*TAU,v=90+160*rnd(f);f.sparks.push({x:q.x,y:q.y-46,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,born:t+.18,life:.35,c:pal.body});}}
  if(f.sparks.length>80)f.sparks.splice(0,f.sparks.length-80);
  sound(f,s,tier===2?'laser':'shot',tier===2?GAIN.charge:GAIN.shot,.2);if(!auto||tier===2)float(s,tier===2?'기합 해방':'기합탄',tier===2?'#ffffff':pal.body,.8);}
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
  const awake=n(s.awakeningUntil)>t;if(awake&&!f.awakeWas){const r=R();const k=r?.cancelAll?.(s,'wipe',hx,hy)??0;m.spawnGuardUntil=t+.6;metrics.wipes++;if(k>0)float(s,'각성 정화 +'+k,'#fff3b0',1.1);}f.awakeWas=awake;
  stepCharge(s,f,m,dt);
  for(const b of f.beams)if(t-b.at<b.life)cutBeam(s,f,b);
  f.beams=f.beams.filter(b=>t-b.at<b.life);if(f.bolts.length)f.bolts=f.bolts.filter(b=>t<b.born+b.dur+.05);
  if(f.sparks.length)f.sparks=f.sparks.filter(q=>t-q.born<q.life);
  stepCoins(f,s,dt,hx,hy);
  if(f.chain>0&&t>=f.chainUntil){f.chain=0;f.mult=1;}
  // Fight end: boss died (or bossDefeated rose) while still in this zone.
  const fg=f.fight;if(fg&&(!m.owner||String(m.owner.id)!==String(fg.ownerId))){const e=(s.enemies??[]).find(q=>q&&String(q.id)===String(fg.ownerId));
   const dead=(e?!(n(e.hp)>0):true)||(s.bossDefeated&&!f.defeatedWas);
   if(dead&&fg.boss&&!fg.tallied){fg.tallied=true;const nohit=fg.hits===0?100000:0;f.score+=nohit;
    f.tally={at:t,time:t-fg.start,spells:fg.spells,captured:fg.captured,grazes:fg.grazes,maxChain:fg.maxChain,coins:fg.coins+(f.coins.live|0),gained:f.score-fg.score0,nohit,name:fg.name};metrics.tallies++;}
   if(dead||!e)f.fight=null;}
  f.defeatedWas=!!s.bossDefeated;
  kitCall('tick',s,dt,m);}

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
  // Beams: hero-colour body with a white core, tapering out.
  for(const b of f.beams){const u=(t-b.at)/b.life;if(u<0||u>=1)continue;const dx=b.bx-b.ax,dy=b.by-b.ay,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,fade=1-u*u;
   ctx.globalCompositeOperation='lighter';
   for(const [w,col,al] of [[b.hw*(1-.4*u),b.color,.55],[b.hw*.38*(1-.5*u),b.core??'#ffffff',.9]]){ctx.globalAlpha=al*fade;ctx.fillStyle=col;ctx.beginPath();
    ctx.moveTo(b.ax+nx*w*.5,b.ay+ny*w*.5);ctx.lineTo(b.bx+nx*w*.25,b.by+ny*w*.25);ctx.lineTo(b.bx-nx*w*.25,b.by-ny*w*.25);ctx.lineTo(b.ax-nx*w*.5,b.ay-ny*w*.5);ctx.closePath();ctx.fill();}}
  if(f.sparks.length){ctx.globalCompositeOperation='lighter';for(const q of f.sparks){const u=(t-q.born)/q.life;if(u<0||u>=1)continue;ctx.globalAlpha=1-u;ctx.fillStyle=q.c;ctx.fillRect(q.x+q.vx*(t-q.born)-1.5,q.y+q.vy*(t-q.born)-1.5,3,3);}}
  ctx.globalCompositeOperation='source-over';drawBolts(ctx,f,t);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  metrics.draws++;metrics.drawImages=draws;metrics.drawMs=metrics.drawMs*.9+(now()-t0)*.1;return draws;}

 // ---------------------------------------------------------------- screen HUD: score/chain, warning, tally
 function fmt(v){return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');}
 function modalOpen(s){return !!(s.modal||s.requiredScene||s.requiredSceneV31238||s.cutscene||s.dialogue||s.paused);}
 function drawScreen(ctx,s,m,set){if(!active())return;const u=U();if(!u?.screenSpace)return;ctx.save();try{kitCall('drawScreen',ctx,s,m,set);}finally{ctx.restore();}const f=worlds.get(s);if(!f)return;const t=n(s.time);
  const show=f.score>0||f.fight||f.warn||f.tally;if(!show)return;
  const v=u.screenSpace(ctx);if(!v)return;const {w,h}=v,mobile=!!m?.mobile||w<800,txt=(a,x,y)=>u.hudText(ctx,a,x,y);
  ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.shadowBlur=0;ctx.textBaseline='middle';ctx.direction='ltr';
  // Score + chain (top centre, clear of RC129's left box and the RC240 banner on the right).
  if(f.score>0||f.chain>=5){ctx.textAlign='center';const cx=w*.5,y0=mobile?12:16;
   if(!mobile){ctx.globalAlpha=.92;ctx.font='bold 13px ui-monospace,Menlo,monospace';ctx.fillStyle='#000000';txt('점수 '+fmt(f.score),cx+1,y0+1);ctx.fillStyle='#f6f0ff';txt('점수 '+fmt(f.score),cx,y0);}
   if(f.chain>=(mobile?10:5)){ctx.globalAlpha=.9;ctx.font=(mobile?'bold 11px':'bold 12px')+' ui-monospace,Menlo,monospace';const line='연쇄 '+f.chain+' ×'+f.mult.toFixed(1);const y1=mobile?y0:y0+16;
    ctx.fillStyle='#000000';txt(line,cx+1,y1+1);ctx.fillStyle=f.mult>=2?'#ffd34d':'#bff4ff';txt(line,cx,y1);}}
  // Boss warning.
  const W=f.warn;if(W){const age=t-W.at;if(age>=W.dur)f.warn=null;else{const fade=Math.min(1,age/.18)*Math.min(1,(W.dur-age)/.3),quiet=!!set?.reducedFlash,bh=(W.big?.05:.032)*h;
   const slide=quiet?0:Math.max(0,1-age/.3)*w;
   for(const yc of W.big?[h*.14,h*.86]:[h*.14]){ctx.save();try{ctx.globalAlpha=.82*fade;ctx.fillStyle='#0b0507';ctx.fillRect(slide,yc-bh/2,w-slide,bh);ctx.beginPath();ctx.rect(slide,yc-bh/2,w-slide,bh);ctx.clip?.();
     const off=quiet?0:(age*120)%28;ctx.fillStyle='#d4122c';ctx.beginPath();for(let x=slide-28-off;x<w+28;x+=28){ctx.moveTo(x,yc+bh/2);ctx.lineTo(x+bh,yc-bh/2);ctx.lineTo(x+bh+12,yc-bh/2);ctx.lineTo(x+12,yc+bh/2);}ctx.fill();}finally{ctx.restore();}}
   if(age<1.4+.4){ctx.textAlign='center';ctx.globalAlpha=.85*fade*Math.min(1,(1.8-age)/.4);ctx.fillStyle='#ff3a4e';ctx.font='bold '+(W.big?(mobile?18:26):(mobile?13:17))+'px "Noto Serif KR",system-ui,sans-serif';
    txt(W.big?'경고 · 거대 반응 접근':'경고 · 반응 접근',w/2,h*.42);ctx.fillStyle='#ffffff';ctx.font=(W.big?(mobile?13:17):(mobile?11:13))+'px "Noto Serif KR",system-ui,sans-serif';if(W.name)txt(W.name,w/2,h*.42+(W.big?(mobile?24:32):20));}}}
  // Result tally.
  const T=f.tally;if(T){const age=t-T.at;if(age>=3.5)f.tally=null;else if(!modalOpen(s)){const k=clamp(age/1.2,0,1),fade=Math.min(1,age/.2)*Math.min(1,(3.5-age)/.4);
   const pw=mobile?190:240,lh=mobile?14:17,rows=[['격파 시간',T.time.toFixed(1)+'s'],['주문 획득',Math.round(T.captured)+'/'+Math.round(T.spells)],['스침',fmt(T.grazes*k)],['최대 연쇄',fmt(T.maxChain*k)],['영전',fmt(T.coins*k)],['획득 점수',fmt(T.gained*k)]];
   if(T.nohit)rows.push(['무피격 보너스','+'+fmt(T.nohit*k)]);const ph=lh*(rows.length+1)+14,x0=w-pw-14,y0=h*.5-ph/2;
   ctx.globalAlpha=.86*fade;ctx.fillStyle='rgba(6,4,14,.86)';ctx.fillRect(x0,y0,pw,ph);ctx.fillStyle='#ffd34d';ctx.fillRect(x0,y0,2,ph);
   ctx.globalAlpha=fade;ctx.textAlign='left';ctx.font='bold '+(mobile?12:14)+'px "Noto Serif KR",system-ui,sans-serif';ctx.fillStyle='#ffe59a';txt('격파 결산',x0+12,y0+lh*.5+7);
   ctx.font=(mobile?10:12)+'px system-ui,sans-serif';rows.forEach(([a,b],i)=>{const y=y0+lh*(i+1.5)+7;ctx.textAlign='left';ctx.fillStyle='#c9c4d8';txt(a,x0+12,y);ctx.textAlign='right';ctx.fillStyle='#ffffff';txt(b,x0+pw-12,y);});}}}

 // ---------------------------------------------------------------- flow streaks (background, before RC240 dim)
 const STREAK_SEEDS=[];for(let i=0;i<28;i++){const a=Math.sin(i*12.9898)*43758.5453,b=Math.sin(i*78.233)*12345.678,c=Math.sin(i*39.425)*24680.135;STREAK_SEEDS.push({y:a-Math.floor(a),v:b-Math.floor(b),l:c-Math.floor(c),g:i%3});}
 function drawBackground(ctx,s,m,set){if(!active()||!m)return 0;const dim=n(m.dim);if(dim<.02||lowFx(set))return 0;const cv=ctx.canvas;if(!cv)return 0;
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
  play,duck,
  dropCoins(s,x,y,count=1){if(!active()||!s||!(Number.isFinite(x)&&Number.isFinite(y)))return 0;const f=F(s);let c=0;const N=clamp(Math.floor(n(count,0)),0,24);for(let j=0;j<N;j++)if(spawnCoin(f,x+(j%3-1)*6,y-(j/3|0)*5,1))c++;return c;},
  dropPower(s,x,y,count=1){if(!active()||!s)return 0;return n(kitCall('dropPower',s,x,y,count));},
  aStats(s){const f=s&&worlds.get(s);if(!f)return {aPow:0,aSum:0};let a=0;for(const r of f.aWin)a+=r.p;return {aPow:f.aPow,aSum:a};},
  rank(s){if(!active()||!s)return 1;const v=kitCall('rank',s);return Number.isFinite(v)?v:1;},
  decorateAttack(s,before){if(!active()||!s)return;kitCall('decorateAttack',s,before);},
  valid:(s,a)=>valid(s,a),palette,shapes:Object.freeze({boltShape,shapePath,UPRIGHT}),
  metrics:()=>({...metrics,lastError}),
  state(s){const f=s&&worlds.get(s);if(!f)return null;return {score:f.score,chain:f.chain,maxChain:f.maxChain,mult:f.mult,coins:f.coins.live,cap:f.capNow,collected:f.collected,grazes:f.grazes,aPow:f.aPow,
   charging:f.charge.on,bolts:f.bolts.length,cdUntil:f.charge.cdUntil,beams:f.beams.length,warn:f.warn?{...f.warn}:null,tally:f.tally?{...f.tally}:null,fight:f.fight?{...f.fight}:null};},
  __test:{boltShape,SHAPE_BY_SHOT,HERO_SHOT,GAIN,DUCKED,palette,worlds,COIN_CAP,CANCEL_RULES,T1,T2,CD1,CD2,beamEnd,tameRoom,fire,coinSprite}};
 Object.defineProperty(root,'__HAPIL_STG_FEEL_RC240__',{value:Object.freeze(api),configurable:true,writable:false,enumerable:false});
})(typeof window==='object'?window:globalThis);
