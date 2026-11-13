/* RC240 arcade kit (STORY mode only): power items (P) and levels, familiars
 * (보조: the hero's own clones/summons), and the bomb (화면 탄 지우기 + 큰 피해)
 * on a double tap of D. Runs only through RC240 STG-feel hooks, so it is inert
 * whenever the danmaku layer is off (?qa without rc240=1) and outside STORY mode
 * (HELL / DREAM-사몽 keep plain RC240). Runtime only: nothing is saved, no world
 * keys are added, and native EGO charge/awakening is never touched.
 * All art is procedural and original; colours come from the hero palette only.
 */
(function(root){'use strict';
 if(root.__HAPIL_ARCADE_KIT_RC240__)return;
 const VERSION='RC240-kit-1';
 const n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d,clamp=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2;
 const R=()=>root.__HAPIL_DANMAKU_RC240__,FEEL=()=>root.__HAPIL_STG_FEEL_RC240__,U=()=>R()?.util??null;

 // ---------------------------------------------------------------- tuning
 const THRESH=Object.freeze([0,2,5,9,14]);          // P points needed for level 0..4
 const POWER_STEP=.08;                                // A strike power +8%/level (L4 = +32%, cap +40%)
 const RANK_STEP=.04;                                 // danmaku density +4%/level (powered = denser, never easier)
 const FAM_SHARE=.03,FAM_WINDOW=30,FAM_PERIOD=.6,FAM_POWER=.25,FAM_MAX=4;// familiar damage <= 3%/level of base A over 30 s
 const ITEM_CAP=48,ITEM_R=26,ITEM_AUTO=3,SCATTER_LIFE=2;
 const STOCK_START=2,STOCK_MAX=2,BOMB_MERCY=2,BOMB_MULT=3,BOMB_BOSS_CAP=.02,BOMB_TARGETS=8,AUTO_BOMB_GAP=20,AUTO_HORIZON=.15;
 const TAP_GAP=.3,TAP_MIN=.04,HIT_DEBOUNCE=.5,STRIKE_CAP=96,FAM_ROW_CAP=90;
 const FLAVOUR=Object.freeze({hwando:'ink-clone',seoha:'clock-clone',lauren:'orbit-orbs',hunter:'squad-clone',slayer:'blood-clone',gunner:'afterimage',michaela:'heart-blossom'});
 // Horizontal-shooter option formation around the heart (hero faces right), clear of the hero sprite.
 const SLOTS=[[-30,-46],[-30,40],[-58,-74],[-58,66]],FAM_SCALE=1.45;
 const metrics={ticks:0,drops:0,pickups:0,levelUps:0,levelDowns:0,famRows:0,famPower:0,famShots:0,bombs:0,autoBombs:0,bombRows:0,bombPower:0,bombCancelled:0,nativeCancelled:0,presses:0,scaled:0,draws:0,errors:0};
 let lastError=null;
 function fail(e){metrics.errors++;lastError=String(e&&e.stack||e).slice(0,300);if(metrics.errors<=3)root.console?.warn?.('RC240 arcade kit',e);}

 // ---------------------------------------------------------------- gates and probes
 function binding(){return root.__HAPIL_CONTROLS_V31329__?.binding??null;}
 function settingsOf(){try{return binding()?.settings?.current??{};}catch(e){return {};}}
 function layerOn(){const r=R();return !!(r&&r.installed&&r.enabled?.()&&FEEL());}
 function story(s){try{const g=U()?.gmode;if(g)return g(s)==='STORY';}catch(e){}return false;}
 function on(s){return !!s&&layerOn()&&story(s)&&!s.practiceV31329&&!s.practicePatternV31365;}
 function guest(s){const p=root.__HAPIL_PARTY_V31322__;return !!(p&&p.state===s&&p.status?.role==='guest');}
 function fullAuto(s){try{const u=U();if(u?.fullAuto)return u.fullAuto(s,settingsOf());}catch(e){}return s.combatModeV31329==='full';}
 function dOn(s){try{const C=root.__HAPIL_CHANNEL_V31364__;if(C?.active)return C.active(s,s)===true;}catch(e){}return s.channelDActiveV31364===true;}
 function project(x,y){const u=U();if(u?.project)return u.project(x,y);return {x:640+27*(x-y),y:13.5*(x+y)};}
 function heart(s){try{const h=U()?.heart?.(s);if(h&&Number.isFinite(h.x)&&Number.isFinite(h.y))return h;}catch(e){}const p=project(s.x,s.y);return {x:p.x,y:p.y-42};}
 function palette(m){try{const p=FEEL()?.palette?.(m);if(p)return p;}catch(e){}return {key:'cyan',body:'#7ff6ff',edge:'#0b4f63',core:'#ffffff',dim:'#bff9ff',coin:['#c6f7ff','#5fe8ff','#ffffff']};}
 function valid(s,a){try{const f=FEEL()?.valid;if(f)return f(s,a)===true;}catch(e){}return false;}
 function droppable(a){return !!a&&!a.boss&&!a.cosmicBoss&&!a.visualOnly&&!a.friendly&&!a.neutral&&!a.ally&&!a.rc88Part&&!a.echoChild&&!a.echoChildV31368&&!a.objectiveStructureV31238&&!a.protectedNarrativeTargetV31307&&!a.protectedNarrativeTargetV31238;}
 function shotShape(hero){if(hero==='michaela')return 'heart';try{const sh=FEEL()?.shapes?.boltShape?.(hero);if(sh)return sh;}catch(e){}return 'diamond';}
 function flavour(hero){return FLAVOUR[hero]??'option';}
 function play(s,key,tier,cd){try{return FEEL()?.play?.(s,key,tier,cd)===true;}catch(e){fail(e);return false;}}
 function float(s,text,color,duration=.9){try{(s.floatTexts??=[]).push({id:s.fxSerial=(n(s.fxSerial)+1),x:s.x,y:s.y,born:s.time,duration,text,color,rc240:true});}catch(e){}}

 // ---------------------------------------------------------------- per-world state (WeakMap, never saved)
 const worlds=new WeakMap();
 function itemPool(cap){return {cap,live:0,x:new Float32Array(cap),y:new Float32Array(cap),vx:new Float32Array(cap),vy:new Float32Array(cap),age:new Float32Array(cap),kind:new Uint8Array(cap),val:new Uint8Array(cap)};}
 function fresh(s,stock){return {zone:s.zone,level:0,points:0,stock:stock??STOCK_START,bombs:0,items:itemPool(ITEM_CAP),rng:(n(s.time)*977|0)^0x2545f491,
  fam:Array.from({length:FAM_MAX},(_,i)=>({x:NaN,y:NaN,cd:.3+i*.13,flash:-9})),shots:Array.from({length:24},()=>({on:false,born:0,dur:.18,ax:0,ay:0,tx:0,ty:0,shape:'diamond'})),famWin:[],
  tracked:new Map(),lastHitAt:-9,fbAt:null,presses:[],pressSeenAt:-9,inputAt:-9,bombReq:null,lastAutoAt:-99,fx:null,dWas:false,hist:{x:new Float32Array(32),y:new Float32Array(32),i:0,n:0},hx:640,hy:400};}
 function W(s){let k=worlds.get(s);if(!k){k=fresh(s);worlds.set(s,k);}return k;}
 function rnd(k){k.rng=(Math.imul(k.rng^(k.rng>>>15),0x2c1b3c6d)+0x6d2b79f5)|0;return ((k.rng>>>0)%100000)/100000;}
 function levelOf(p){let L=0;for(let i=1;i<THRESH.length;i++)if(p>=THRESH[i])L=i;return L;}
 function reset(s,reason){const k=worlds.get(s);if(!k)return;
  // Zone entry: fresh run, bomb stock refilled to 2. Death / gate / disable: power and items reset, stock kept.
  worlds.set(s,fresh(s,reason==='zone'?STOCK_START:Math.min(STOCK_MAX,k.stock)));}

 // ---------------------------------------------------------------- P items
 function spawnItem(k,x,y,kind,val){const P=k.items;if(!(Number.isFinite(x)&&Number.isFinite(y))||P.live>=P.cap)return false;const i=P.live++;
  if(kind===1){const a=(k.scatterA=(n(k.scatterA,rnd(k)*TAU)+Math.PI*(.8+.4*rnd(k)))),v=230+60*rnd(k),c=Math.cos(a),sn=Math.sin(a);P.vx[i]=c*v;P.vy[i]=sn*v*.7;x+=c*(ITEM_R+8);y+=sn*(ITEM_R+8)*.7;}else{P.vx[i]=(rnd(k)<.5?-1:1)*(40+60*rnd(k));P.vy[i]=-(60+60*rnd(k));}
  P.x[i]=x;P.y[i]=y;P.age[i]=0;P.kind[i]=kind;P.val[i]=clamp(val|0,1,8);metrics.drops++;return true;}
 function removeItem(P,i){const l=--P.live;if(i!==l){P.x[i]=P.x[l];P.y[i]=P.y[l];P.vx[i]=P.vx[l];P.vy[i]=P.vy[l];P.age[i]=P.age[l];P.kind[i]=P.kind[l];P.val[i]=P.val[l];}}
 function gain(s,k,v){const before=k.level;k.points=Math.min(THRESH[4],k.points+v);k.level=levelOf(k.points);metrics.pickups++;
  if(k.level>before){metrics.levelUps++;play(s,'arcane','ready',.3);float(s,k.level>=4?'파워 최대':'파워 업 Lv.'+k.level,palette(R()?.world?.(s)).body,.8);}else play(s,'guard','pickup',.15);}
 function stepItems(s,k,dt,hx,hy){const P=k.items;
  for(let i=P.live-1;i>=0;i--){const age=P.age[i]+dt;P.age[i]=age;
   if(P.kind[i]===1){const d=Math.exp(-4*dt);P.vx[i]*=d;P.vy[i]*=d;}
   else if(age<.4){const d=Math.exp(-3*dt);P.vx[i]*=d;P.vy[i]=P.vy[i]*d+80*dt;}
   else{const dx=hx-P.x[i],dy=hy-P.y[i],L=Math.hypot(dx,dy)||1;P.vx[i]+=dx/L*2200*dt;P.vy[i]+=dy/L*2200*dt;const along=(P.vx[i]*dx+P.vy[i]*dy)/L;
    P.vx[i]-=(P.vx[i]-dx/L*along)*Math.min(1,6*dt);P.vy[i]-=(P.vy[i]-dy/L*along)*Math.min(1,6*dt);const v=Math.hypot(P.vx[i],P.vy[i]);if(v>850){P.vx[i]*=850/v;P.vy[i]*=850/v;}}
   P.x[i]+=P.vx[i]*dt;P.y[i]+=P.vy[i]*dt;const dx=hx-P.x[i],dy=hy-P.y[i],near=dx*dx+dy*dy<=ITEM_R*ITEM_R;
   if(!(Number.isFinite(P.x[i])&&Number.isFinite(P.y[i]))){removeItem(P,i);continue;}
   if(near||(P.kind[i]===0&&age>=ITEM_AUTO)){const v=P.val[i];removeItem(P,i);gain(s,k,v);}
   else if(P.kind[i]===1&&age>=SCATTER_LIFE)removeItem(P,i);}}
 function dropPower(s,x,y,count=1){if(!on(s))return 0;const k=W(s);let c=0,N=clamp(Math.floor(n(count,0)),0,ITEM_CAP);if(!(Number.isFinite(x)&&Number.isFinite(y)))return 0;
  for(let j=0;j<N;j++)if(spawnItem(k,x+(j%4-1.5)*7,y-(j>>2)*5,0,1))c++;return c;}
 function watchDeaths(s,k){const list=s.enemies??[];const seen=k.seenScratch??=new Set();seen.clear();
  for(const a of list){if(!a||typeof a!=='object')continue;seen.add(a);if(n(a.hp)>0&&droppable(a)&&!k.tracked.has(a))k.tracked.set(a,a.midboss?3:1);}
  for(const [a,cnt] of k.tracked){const dead=!(n(a.hp)>0);if(dead){k.tracked.delete(a);const p=project(n(a.x),n(a.y));dropPower(s,p.x,p.y-(a.midboss?60:40),cnt);}else if(!seen.has(a))k.tracked.delete(a);}}

 // ---------------------------------------------------------------- hits
 function onHit(s){if(!on(s))return;const k=W(s),t=n(s.time);if(t-k.lastHitAt<HIT_DEBOUNCE&&t>=k.lastHitAt)return;k.lastHitAt=t;if(k.level<=0)return;
  const L=k.level-1,lost=k.points-THRESH[L];k.level=L;k.points=THRESH[L];metrics.levelDowns++;const cnt=lost>=2?2:1,val=Math.ceil(lost/cnt);
  for(let j=0;j<cnt;j++)spawnItem(k,k.hx,k.hy,1,val);}
 function watchNativeHits(s,k){const rows=s.combatFeedbackV31329;const last=Array.isArray(rows)&&rows.length?rows[rows.length-1]:null;const at=last?n(last.at,NaN):NaN;
  if(k.fbAt===null){k.fbAt=at;return;}if(Number.isFinite(at)&&at!==k.fbAt){k.fbAt=at;if(n(last.damage,1)>0)onHit(s);}}

 // ---------------------------------------------------------------- A power (via LOOP.decorateAttack)
 function decorateAttack(s,before){if(!on(s))return;const k=W(s),L=k.level,mul=1+POWER_STEP*L;
  for(const r of s.pendingStrikes??[]){if(!r||typeof r!=='object'||before?.has?.(r)||r.actionKey!=='A'||r.heroId!==s.activeHeroId||r.nativeActorRC222||r.partySlotV31322||'rc240BasePower' in r||!(Number.isFinite(r.power)&&r.power>0))continue;
   r.rc240BasePower=r.power;r.rc240PowerLv=L;if(L>0){r.power*=mul;metrics.scaled++;}}}
 function rank(s){if(!on(s))return 1;const k=worlds.get(s);return 1+RANK_STEP*(k?k.level:0);}

 // ---------------------------------------------------------------- familiars
 function famTarget(s,m){const id=s.targetEnemyId;let t=(s.enemies??[]).find(e=>e&&e.id===id&&valid(s,e));if(t)return t;if(m?.owner&&valid(s,m.owner))return m.owner;
  let best=null,bd=1e18;for(const e of s.enemies??[]){if(!valid(s,e))continue;const d=(e.x-s.x)**2+(e.y-s.y)**2;if(d<bd){bd=d;best=e;}}return best;}
 function famRoom(s,k){const st=FEEL()?.aStats?.(s);const t=n(s.time);while(k.famWin.length&&(t-k.famWin[0].t>FAM_WINDOW||t<k.famWin[0].t))k.famWin.shift();let used=0;for(const r of k.famWin)used+=r.p;
  return {aPow:n(st?.aPow),room:Math.max(0,n(st?.aSum)*FAM_SHARE*k.level-used)};}
 function famPos(s,k,i,cnt,hx,hy,hero){const t=n(s.time),f=flavour(hero);
  if(f==='orbit-orbs'){const a=t*2.4+i*TAU/Math.max(1,cnt);return [hx+Math.cos(a)*48,hy+Math.sin(a)*30];}
  if(f==='afterimage'){const H=k.hist,lag=Math.min(H.n-1,(i+1)*4);if(lag>0){const j=(H.i-1-lag+64)%32;return [H.x[j]-6*(i+1),H.y[j]];}}
  const sl=SLOTS[i],bob=f==='heart-blossom'?Math.sin(t*3+i)*3:0;return [hx+sl[0],hy+sl[1]*(cnt<=2&&i<2?.85:1)+bob];}
 function stepFamiliars(s,k,m,dt,hx,hy){const cnt=Math.min(FAM_MAX,k.level),hero=s.activeHeroId,t=n(s.time);
  for(let i=0;i<FAM_MAX;i++){const F=k.fam[i];if(i>=cnt){F.x=NaN;continue;}const [gx,gy]=famPos(s,k,i,cnt,hx,hy,hero);
   if(!Number.isFinite(F.x)){F.x=hx;F.y=hy;}const e=Math.min(1,dt*(flavour(hero)==='afterimage'?20:10));F.x+=(gx-F.x)*e;F.y+=(gy-F.y)*e;}
  for(const sh of k.shots)if(sh.on&&t>sh.born+sh.dur+.05)sh.on=false;
  if(!cnt||guest(s))return;const tgt=famTarget(s,m);if(!tgt)return;const tp=project(tgt.x,tgt.y),tx=tp.x,ty=tp.y-46;
  let room=null;
  for(let i=0;i<cnt;i++){const F=k.fam[i];F.cd-=dt;if(F.cd>0)continue;F.cd+=FAM_PERIOD;if(F.cd<0)F.cd=FAM_PERIOD;F.flash=t;
   const sh=k.shots.find(q=>!q.on);if(sh){sh.on=true;sh.born=t;sh.dur=.18;sh.ax=F.x;sh.ay=F.y;sh.tx=tx;sh.ty=ty;sh.shape=shotShape(hero);metrics.famShots++;}
   room??=famRoom(s,k);const p=room.aPow*FAM_POWER;if(!(p>=1)||room.room<p)continue;
   if(!Array.isArray(s.pendingStrikes)||s.pendingStrikes.length>=FAM_ROW_CAP)continue;
   if(pushRow(s,tgt,p,'RC240_FAM',palette(m).body,{rc240Familiar:i})){room.room-=p;k.famWin.push({t,p});metrics.famRows++;metrics.famPower+=p;}}
  if(k.famWin.length&&t-k.famWin[k.famWin.length-1].t<1e-6)play(s,'guard','familiar',.8);}
 function pushRow(s,a,power,key,color,extra){if(!Array.isArray(s.pendingStrikes)||s.pendingStrikes.length>=STRIKE_CAP||!(power>=1)||!valid(s,a))return false;const id=a.id;
  const row={id:s.fxSerial=n(s.fxSerial)+1,at:n(s.time)+.18,targetId:typeof id==='string'?id:String(id),power,color,critical:false,ranged:true,homing:true,leechRate:0,
   heroId:s.activeHeroId,sourceHeroId:s.activeHeroId,actionKey:key,rc226LaunchSound:true,shmupOriginV31365:{x:s.x,y:s.y},...extra};
  if(row.targetId!==id)return false;s.pendingStrikes.push(row);return true;}

 // ---------------------------------------------------------------- bomb (double tap D)
 function notePress(s,src){if(!s||!on(s)||guest(s)||!(n(s.hp)>0))return false;const k=W(s),t=n(s.time);
  // The same physical tap also shows up as a D-channel rising edge a frame or more later: an edge only counts when no listener saw a press recently.
  if(src==='edge'){if(t-k.inputAt<TAP_GAP&&t>=k.inputAt)return false;}else k.inputAt=t;
  if(t-k.pressSeenAt<TAP_MIN&&t>=k.pressSeenAt)return false;k.pressSeenAt=t;metrics.presses++;
  while(k.presses.length&&(t-k.presses[0]>TAP_GAP||t<k.presses[0]))k.presses.shift();k.presses.push(t);
  if(k.presses.length>=2){k.presses.length=0;k.bombReq='tap';}return true;}
 function nativeCancel(s){const B=root.__HAPIL_PATTERN_CODEX_BRIDGE_V31410__;const list=s.hostileProjectiles;if(typeof B?.clearHostile!=='function'||!Array.isArray(list)||!list.length)return 0;
  const kill=[],keep=[];for(const q of list){if(q&&typeof q==='object'&&n(q.damage)>0&&!q.friendly&&!q.reflected&&!q.visualOnly&&!q.narrativeAttack&&!q.heroOwned&&!q.rc240Danmaku)kill.push(q);else keep.push(q);}
  if(!kill.length)return 0;let c=0;s.hostileProjectiles=kill;try{c=n(B.clearHostile(s,'parry'));}catch(e){fail(e);}finally{const rest=Array.isArray(s.hostileProjectiles)?s.hostileProjectiles:[];s.hostileProjectiles=keep.concat(rest);}
  return c;}
 function bomb(s,k,m,auto){if(k.stock<=0||!(n(s.hp)>0)||guest(s))return false;const t=n(s.time),hx=k.hx,hy=k.hy,set=settingsOf();k.stock--;k.bombs++;metrics.bombs++;if(auto){metrics.autoBombs++;k.lastAutoAt=t;}
  let c=0;try{c=n(R()?.cancelAll?.(s,'bomb',hx,hy));}catch(e){fail(e);}metrics.bombCancelled+=c;
  const nc=nativeCancel(s);metrics.nativeCancelled+=nc;
  if(m)m.mercyUntil=Math.max(n(m.mercyUntil,-1),t+BOMB_MERCY);
  const aPow=n(FEEL()?.aStats?.(s)?.aPow);
  if(aPow>0){const list=(s.enemies??[]).filter(e=>valid(s,e)).sort((a,b)=>(b.boss?2:b.midboss?1:0)-(a.boss?2:a.midboss?1:0));let rows=0;
   for(const e of list){if(rows>=BOMB_TARGETS)break;let p=BOMB_MULT*aPow;if(e.boss||e.midboss)p=Math.min(p,BOMB_BOSS_CAP*Math.max(1,n(e.maxHp,1)));if(pushRow(s,e,p,'RC240_BOMB',palette(m).body,{rc240Bomb:true})){rows++;metrics.bombRows++;metrics.bombPower+=p;}}}
  k.fx={at:t,x:hx,y:hy};FEEL()?.duck?.(s,.25);play(s,'heavy','bomb',.5);play(s,'laser','bomb',.5);float(s,auto?'자동 폭탄':'폭탄',palette(m).body,.9);
  if(c+nc>0&&!set.reducedFlash)float(s,'탄 소거 +'+(c+nc),'#fff3b0',1);return true;}

 // ---------------------------------------------------------------- tick (called from STG feel at the end of every RC240 sim tick)
 function tick(s,dt,m){if(!on(s)||!m||!(dt>0))return;const k=W(s),t=n(s.time);metrics.ticks++;
  if(k.zone!==s.zone){reset(s,'zone');return;}
  const h=heart(s);if(Number.isFinite(h.x)&&Number.isFinite(h.y)){k.hx=h.x;k.hy=h.y;}const H=k.hist;H.x[H.i]=k.hx;H.y[H.i]=k.hy;H.i=(H.i+1)%32;H.n=Math.min(32,H.n+1);
  // D rising edge: fallback for presses the input listeners did not see.
  const d=dOn(s);if(d&&!k.dWas)notePress(s,'edge');k.dWas=d;
  watchNativeHits(s,k);watchDeaths(s,k);stepItems(s,k,dt,k.hx,k.hy);stepFamiliars(s,k,m,dt,k.hx,k.hy);
  if(k.bombReq){k.bombReq=null;bomb(s,k,m,false);}
  else if(k.stock>0&&fullAuto(s)&&t-k.lastAutoAt>=AUTO_BOMB_GAP&&t>=n(m.mercyUntil,-1)){let im=null;try{im=R()?.imminent?.(s,AUTO_HORIZON);}catch(e){fail(e);}if(im&&im.q?.rc240)bomb(s,k,m,true);}
  if(k.fx&&t-k.fx.at>1)k.fx=null;}

 // ---------------------------------------------------------------- input listeners (passive: never preventDefault, never add keys)
 function current(){try{return binding()?.state?.current??null;}catch(e){return null;}}
 function editing(t){try{return !!t?.closest?.('input,textarea,select,[contenteditable="true"]');}catch(e){return false;}}
 function onKey(e){try{if(!e||e.repeat===true||e.ctrlKey||e.metaKey||e.altKey||editing(e.target))return;const C=root.__HAPIL_CONTROLS_V31329__;const solo=C?.keys?.solo;const logical=solo?solo[e.code]:e.code;if(logical!=='KeyD'&&e.code!=='KeyD')return;notePress(current(),'key');}catch(err){fail(err);}}
 function onPointer(e){try{const el=e?.target?.closest?.('[data-mobile-action],[data-control-key]');const key=el?.dataset?.mobileAction??el?.dataset?.controlKey;if(key!=='D')return;notePress(current(),'touch');}catch(err){fail(err);}}
 try{root.addEventListener?.('keydown',onKey,true);root.addEventListener?.('pointerdown',onPointer,true);}catch(e){}

 // ---------------------------------------------------------------- drawing (world space, called from feel.draw = under enemy bullets)
 const sprites={};
 function canvas(w,h){try{const d=root.document;if(d?.createElement){const c=d.createElement('canvas');c.width=w;c.height=h;return c;}if(typeof root.OffscreenCanvas==='function')return new root.OffscreenCanvas(w,h);}catch(e){}return null;}
 function itemSprite(pal){const id=pal.key;if(sprites[id]!==undefined)return sprites[id];sprites[id]=null;const W=20,c=canvas(W*2,W*2);const g=c?.getContext?.('2d');if(!g)return null;g.scale?.(2,2);
  const r=(x,y,w,h,q)=>{g.beginPath();g.moveTo(x+q,y);g.lineTo(x+w-q,y);g.lineTo(x+w,y+q);g.lineTo(x+w,y+h-q);g.lineTo(x+w-q,y+h);g.lineTo(x+q,y+h);g.lineTo(x,y+h-q);g.lineTo(x,y+q);g.closePath();};
  g.fillStyle='#120d18';r(2,2,16,16,4);g.fill();g.fillStyle=pal.edge;r(3,3,14,14,3.5);g.fill();g.fillStyle=pal.body;r(4.5,4.5,11,11,3);g.fill();
  // Procedural "P": stem + bowl, dark ink on the hero colour.
  g.fillStyle='#0d1020';g.fillRect(7,6,2.4,8.5);g.beginPath();g.moveTo(9.4,6);g.lineTo(11,6);g.arc?.(11,8.4,2.4,-Math.PI/2,Math.PI/2);g.lineTo(9.4,10.8);g.closePath();g.fill();
  g.fillStyle=pal.body;g.beginPath();g.arc?.(10.9,8.4,.9,0,TAU);g.fill();
  sprites[id]={c,W};return sprites[id];}
 function heartPath(ctx,r){ctx.beginPath();ctx.moveTo(0,r*.9);ctx.bezierCurveTo?.(-r*1.3,-r*.1,-r*.6,-r*1.1,0,-r*.35);ctx.bezierCurveTo?.(r*.6,-r*1.1,r*1.3,-r*.1,0,r*.9);ctx.closePath();}
 function drawFamiliar(ctx,F,i,f,pal,t,set){const x=F.x,y=F.y;if(!(Number.isFinite(x)&&Number.isFinite(y)))return;const flash=t-F.flash<.08&&!set?.reducedFlash;
  ctx.save();ctx.translate(x,y);ctx.scale(FAM_SCALE,FAM_SCALE);ctx.globalCompositeOperation='source-over';ctx.lineWidth=1.5;ctx.strokeStyle=pal.edge;ctx.fillStyle=pal.body;
  switch(f){
   case 'ink-clone':{ctx.globalAlpha=.55;ctx.fillStyle='#0d1020';ctx.beginPath();ctx.ellipse?.(0,3,5,8,0,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(0,-7,3.6,0,TAU);ctx.fill();
    ctx.globalAlpha=.9;ctx.strokeStyle=pal.body;ctx.beginPath();ctx.ellipse?.(0,3,5,8,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-5,9);ctx.quadraticCurveTo?.(-12,12,-16,8);ctx.stroke();break;}
   case 'clock-clone':{ctx.globalAlpha=.9;ctx.fillStyle='#0d1020';ctx.beginPath();ctx.arc(0,0,7.5,0,TAU);ctx.fill();ctx.strokeStyle=pal.body;ctx.stroke();
    for(let q=0;q<4;q++){const a=q*Math.PI/2;ctx.fillStyle=pal.dim;ctx.fillRect(Math.cos(a)*5.6-.8,Math.sin(a)*5.6-.8,1.6,1.6);}
    ctx.strokeStyle=pal.core;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(t*2+i)*5,Math.sin(t*2+i)*5);ctx.moveTo(0,0);ctx.lineTo(Math.cos(t*.4)*3.4,Math.sin(t*.4)*3.4);ctx.stroke();break;}
   case 'orbit-orbs':{ctx.globalAlpha=.35;ctx.fillStyle=pal.dim;ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle=pal.edge;ctx.beginPath();ctx.arc(0,0,5.2,0,TAU);ctx.fill();
    ctx.fillStyle=pal.body;ctx.beginPath();ctx.arc(0,0,4,0,TAU);ctx.fill();ctx.fillStyle=pal.core;ctx.beginPath();ctx.arc(-1.2,-1.2,1.5,0,TAU);ctx.fill();break;}
   case 'squad-clone':{ctx.globalAlpha=.9;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-6,-6);ctx.lineTo(-2,0);ctx.lineTo(-6,6);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=pal.core;ctx.fillRect(2,-1,2,2);break;}
   case 'blood-clone':{ctx.globalAlpha=.9;ctx.fillStyle=pal.edge;ctx.beginPath();ctx.arc(0,0,8,-1.2,1.2);ctx.arc(-3,0,6.2,1.1,-1.1,true);ctx.closePath();ctx.fill();ctx.fillStyle=pal.body;ctx.beginPath();ctx.arc(0,0,6.5,-1.05,1.05);ctx.arc(-2.6,0,5.2,1,-1,true);ctx.closePath();ctx.fill();break;}
   case 'afterimage':{ctx.globalAlpha=.42-.07*i;ctx.fillStyle=pal.dim;ctx.beginPath();ctx.ellipse?.(0,0,7,4.5,0,0,TAU);ctx.fill();ctx.globalAlpha=.7-.1*i;ctx.strokeStyle=pal.body;ctx.stroke();break;}
   case 'heart-blossom':{ctx.globalAlpha=.55;ctx.fillStyle=pal.dim;for(let q=0;q<5;q++){const a=q*TAU/5+t*.8;ctx.beginPath();ctx.arc(Math.cos(a)*7,Math.sin(a)*7,2.2,0,TAU);ctx.fill();}
    ctx.globalAlpha=1;ctx.fillStyle=pal.body;heartPath(ctx,5.5);ctx.fill();ctx.stroke();ctx.fillStyle=pal.core;heartPath(ctx,2.2);ctx.fill();break;}
   default:{ctx.globalAlpha=.95;ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(0,5);ctx.lineTo(-7,0);ctx.lineTo(0,-5);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=pal.core;ctx.beginPath();ctx.arc(0,0,1.8,0,TAU);ctx.fill();}}
  if(flash){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.6;ctx.fillStyle=pal.core;ctx.beginPath();ctx.arc(9,0,2.4,0,TAU);ctx.fill();}
  ctx.restore();}
 function drawShots(ctx,k,pal,t){const SP=FEEL()?.shapes;let c=0;for(const b of k.shots){if(!b.on)continue;const u=(t-b.born)/b.dur;if(u<0||u>1)continue;const x=b.ax+(b.tx-b.ax)*u,y=b.ay+(b.ty-b.ay)*u;if(!(Number.isFinite(x)&&Number.isFinite(y)))continue;
  ctx.save();ctx.translate(x,y);if(!SP?.UPRIGHT?.[b.shape])ctx.rotate(Math.atan2(b.ty-b.ay,b.tx-b.ax));ctx.globalAlpha=.95;ctx.lineWidth=1.2;ctx.strokeStyle=pal.edge;ctx.fillStyle=pal.body;
  if(SP?.shapePath)SP.shapePath(ctx,b.shape,4.2);else{ctx.beginPath();ctx.arc(0,0,3,0,TAU);}ctx.stroke();ctx.fill();ctx.restore();c++;}return c;}
 function draw(ctx,s,m,set){if(!on(s))return 0;const k=worlds.get(s);if(!k)return 0;const t=n(s.time),pal=palette(m);let d=0;metrics.draws++;
  ctx.save();try{ctx.globalCompositeOperation='source-over';
   // Bomb ring (expanding hero-colour ring; reducedFlash keeps it, without flicker).
   if(k.fx){const u=clamp((t-k.fx.at)/.55,0,1);if(u<1){const r=30+900*(1-(1-u)*(1-u)),q=!!set?.reducedFlash;ctx.lineWidth=Math.max(1,12*(1-u));ctx.strokeStyle=pal.body;ctx.globalAlpha=(q?.45:.8)*(1-u);ctx.beginPath();ctx.arc(k.fx.x,k.fx.y,r,0,TAU);ctx.stroke();
     ctx.lineWidth=Math.max(1,4*(1-u));ctx.strokeStyle=pal.core;ctx.globalAlpha=(q?.35:.7)*(1-u);ctx.beginPath();ctx.arc(k.fx.x,k.fx.y,r*.86,0,TAU);ctx.stroke();d++;}}
   for(let i=0;i<Math.min(FAM_MAX,k.level);i++){drawFamiliar(ctx,k.fam[i],i,flavour(s.activeHeroId),pal,t,set);d++;}
   d+=drawShots(ctx,k,pal,t);
   const P=k.items,sp=itemSprite(pal);ctx.globalAlpha=1;
   for(let i=0;i<P.live;i++){const x=P.x[i],y=P.y[i];if(!(Number.isFinite(x)&&Number.isFinite(y)))continue;const sc=P.kind[i]===1?1-.25*clamp(P.age[i]/SCATTER_LIFE,0,1):1;
    ctx.globalAlpha=P.kind[i]===1&&P.age[i]>SCATTER_LIFE-.6?(set?.reducedFlash?.6:(Math.floor(t*12)%2?.35:1)):1;
    if(sp){const w=sp.W*sc;ctx.drawImage(sp.c,x-w/2,y-w/2,w,w);}else{ctx.fillStyle=pal.body;ctx.fillRect(x-6,y-6,12,12);}d++;}
  }catch(e){fail(e);}finally{ctx.restore();}return d;}
 function washAlpha(set){return set?.reducedFlash?.06:.18;}
 function drawScreen(ctx,s,m,set){if(!on(s))return;const k=worlds.get(s);if(!k?.fx)return;const u=(n(s.time)-k.fx.at)/.5;if(u<0||u>=1)return;const v=U()?.screenSpace?.(ctx);if(!v)return;
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=washAlpha(set)*(1-u);ctx.fillStyle=palette(m).dim;ctx.fillRect(0,0,v.w,v.h);ctx.globalAlpha=1;}

 // ---------------------------------------------------------------- API
 const api={version:VERSION,tick,draw,drawScreen,onHit,reset,decorateAttack,rank,dropPower,notePress,
  metrics:()=>({...metrics,lastError}),
  state(s){if(!s||!on(s))return null;const k=worlds.get(s);if(!k)return null;return {level:k.level,points:k.points,stock:k.stock,bombs:k.bombs,items:k.items.live,familiars:Math.min(FAM_MAX,k.level),fx:!!k.fx};},
  __test:{THRESH,POWER_STEP,RANK_STEP,FAM_SHARE,ITEM_CAP,STOCK_START,STOCK_MAX,BOMB_MULT,BOMB_BOSS_CAP,TAP_GAP,FLAVOUR,flavour,shotShape,washAlpha,
   colors:m=>{const p=palette(m);return [p.body,p.edge,p.core,p.dim];},
   items:s=>{const k=s&&worlds.get(s);if(!k)return [];const P=k.items,o=[];for(let i=0;i<P.live;i++)o.push({x:P.x[i],y:P.y[i],kind:P.kind[i],val:P.val[i]});return o;},worlds}};
 Object.defineProperty(root,'__HAPIL_ARCADE_KIT_RC240__',{value:Object.freeze(api),configurable:true,writable:false,enumerable:false});
})(typeof window==='object'?window:globalThis);
