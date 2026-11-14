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
 // Review round 1: familiars ~0.4 hero height (FAM_SCALE x 16 local units), dark outline, trail, floor shadow.
 const SLOTS=[[-44,-56],[-44,48],[-82,-86],[-82,76]],FAM_SCALE=2.4,TRAIL=5,INK='#0a0612',GOLD='#c9a65a';
 // R5: familiars are friendly motes in a warm rose-white of their own (not the hero/boss gold, not the enemy magenta band).
 const FAM_COL='#ffdcd6',FAM_HI='#fff4ee',FAM_ORBIT=13;
 const BOMB_HI='#ffe9b0',DIM_DUR=.45,DIM_PEAK=.42;
 const BOMB_DUR=.7,BOMB_R={pc:560,mobile:260},DASH=Object.freeze([10,14]),NODASH=Object.freeze([]);
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
 // Announcements go to the STG-feel callout band (screen space, clear of hero/boss and debuff labels).
 function float(s,text,color,duration=.9){try{FEEL()?.callout?.(s,text,color,duration);}catch(e){fail(e);}}
 const TONE0=Object.freeze({key:'tone0',body:'#ffe27a',core:'#ffffff',edge:'#2b2018'});
 function tone(s){try{const t=FEEL()?.heroTone?.(s);if(t)return t;}catch(e){}return TONE0;}

 // ---------------------------------------------------------------- per-world state (WeakMap, never saved)
 const worlds=new WeakMap(),seen={bombs:0};
 function itemPool(cap){return {cap,live:0,x:new Float32Array(cap),y:new Float32Array(cap),vx:new Float32Array(cap),vy:new Float32Array(cap),age:new Float32Array(cap),kind:new Uint8Array(cap),val:new Uint8Array(cap)};}
 function fresh(s,stock){return {zone:s.zone,level:0,points:0,stock:stock??STOCK_START,bombs:0,items:itemPool(ITEM_CAP),rng:(n(s.time)*977|0)^0x2545f491,
  fam:Array.from({length:FAM_MAX},(_,i)=>({x:NaN,y:NaN,cd:.3+i*.13,flash:-9,tx:new Float32Array(TRAIL),ty:new Float32Array(TRAIL),tn:0,ti:0,tAt:-9})),shots:Array.from({length:24},()=>({on:false,born:0,dur:.18,ax:0,ay:0,tx:0,ty:0,shape:'diamond'})),famWin:[],
  tracked:new Map(),lastHitAt:-9,fbAt:null,presses:[],pressSeenAt:-9,inputAt:-9,bombReq:null,lastAutoAt:-99,fx:null,deb:debrisPool(),dWas:false,hist:{x:new Float32Array(32),y:new Float32Array(32),i:0,n:0},hx:640,hy:400};}
 // Bomb debris: pooled shards (fixed typed arrays, swap-remove; no per-frame allocation).
 const DEB_CAP=48;
 function debrisPool(){return {live:0,x:new Float32Array(DEB_CAP),y:new Float32Array(DEB_CAP),vx:new Float32Array(DEB_CAP),vy:new Float32Array(DEB_CAP),age:new Float32Array(DEB_CAP),life:new Float32Array(DEB_CAP)};}
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
  // Each option circles its slot (radius ~7 px) so it reads as an orbiting option, not a flying bullet.
  const sl=SLOTS[i],a=t*3.2+i*1.7,bob=Math.sin(t*4.2+i*1.3)*2.5+(f==='heart-blossom'?Math.sin(t*3+i)*3:0);return [hx+sl[0]+Math.cos(a)*FAM_ORBIT,hy+sl[1]*(cnt<=2&&i<2?.85:1)+Math.sin(a)*FAM_ORBIT*.55+bob];}
 function stepFamiliars(s,k,m,dt,hx,hy){const cnt=Math.min(FAM_MAX,k.level),hero=s.activeHeroId,t=n(s.time);
  for(let i=0;i<FAM_MAX;i++){const F=k.fam[i];if(i>=cnt){F.x=NaN;continue;}const [gx,gy]=famPos(s,k,i,cnt,hx,hy,hero);
   if(!Number.isFinite(F.x)){F.x=hx;F.y=hy;F.tn=0;}const e=Math.min(1,dt*(flavour(hero)==='afterimage'?20:10));F.x+=(gx-F.x)*e;F.y+=(gy-F.y)*e;
   if(t-F.tAt>=.035||t<F.tAt){F.tAt=t;F.tx[F.ti]=F.x;F.ty[F.ti]=F.y;F.ti=(F.ti+1)%TRAIL;F.tn=Math.min(TRAIL,F.tn+1);}}
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
  const phone=!!(m?.mobile||n(root.innerWidth,1280)<800||Math.min(n(root.innerWidth,1280),n(root.innerHeight,720))<500);
  seen.bombs++;k.fx={at:t,x:hx,y:hy+42,rmax:phone?BOMB_R.mobile:BOMB_R.pc,phone};spawnDebris(k,hx,hy+42,phone?22:30,phone);FEEL()?.duck?.(s,.25);play(s,'heavy','bomb',.5);play(s,'laser','bomb',.5);float(s,auto?'자동 폭탄':'폭탄',palette(m).body,.9);
  if(c+nc>0&&!set.reducedFlash)float(s,'탄 소거 +'+(c+nc),'#fff3b0',1);return true;}

 function spawnDebris(k,x,y,cnt,phone){const D=k.deb;if(!(Number.isFinite(x)&&Number.isFinite(y)))return;for(let j=0;j<cnt;j++){let i=D.live;if(i>=DEB_CAP)i=j%DEB_CAP;else D.live++;
  const a=rnd(k)*TAU,v=(phone?260:380)*(.45+.55*rnd(k));D.x[i]=x;D.y[i]=y-8;D.vx[i]=Math.cos(a)*v;D.vy[i]=Math.sin(a)*v*.5-60*rnd(k);D.age[i]=0;D.life[i]=.45+.35*rnd(k);}}
 function stepDebris(k,dt){const D=k.deb;for(let i=0;i<D.live;){D.age[i]+=dt;if(D.age[i]>=D.life[i]||!(Number.isFinite(D.x[i])&&Number.isFinite(D.y[i]))){const j=--D.live;if(i!==j){D.x[i]=D.x[j];D.y[i]=D.y[j];D.vx[i]=D.vx[j];D.vy[i]=D.vy[j];D.age[i]=D.age[j];D.life[i]=D.life[j];}continue;}
  const f=Math.exp(-2.6*dt);D.vx[i]*=f;D.vy[i]=D.vy[i]*f+180*dt;D.x[i]+=D.vx[i]*dt;D.y[i]+=D.vy[i]*dt;i++;}}
 // ---------------------------------------------------------------- tick (called from STG feel at the end of every RC240 sim tick)
 function tick(s,dt,m){if(!on(s)||!m||!(dt>0))return;const k=W(s),t=n(s.time);metrics.ticks++;
  if(k.zone!==s.zone){reset(s,'zone');return;}
  const h=heart(s);if(Number.isFinite(h.x)&&Number.isFinite(h.y)){k.hx=h.x;k.hy=h.y;}const H=k.hist;H.x[H.i]=k.hx;H.y[H.i]=k.hy;H.i=(H.i+1)%32;H.n=Math.min(32,H.n+1);
  // D rising edge: fallback for presses the input listeners did not see.
  const d=dOn(s);if(d&&!k.dWas)notePress(s,'edge');k.dWas=d;
  watchNativeHits(s,k);watchDeaths(s,k);stepItems(s,k,dt,k.hx,k.hy);stepFamiliars(s,k,m,dt,k.hx,k.hy);
  if(k.bombReq){k.bombReq=null;bomb(s,k,m,false);}
  else if(k.stock>0&&fullAuto(s)&&t-k.lastAutoAt>=AUTO_BOMB_GAP&&t>=n(m.mercyUntil,-1)){let im=null;try{im=R()?.imminent?.(s,AUTO_HORIZON);}catch(e){fail(e);}if(im&&im.q?.rc240)bomb(s,k,m,true);}
  stepDebris(k,dt);if(k.fx&&t-k.fx.at>1)k.fx=null;}

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
 // Familiar silhouettes in local units (radius ~8) times r, centred on (x,y); hero faces right.
 function famPath(ctx,f,x,y,r){ctx.beginPath();
  switch(f){
   case 'ink-clone':ctx.ellipse?.(x,y+3*r,5.5*r,8.5*r,0,0,TAU);ctx.moveTo(x+3.8*r,y-7*r);ctx.arc(x,y-7*r,3.8*r,0,TAU);break;
   case 'clock-clone':ctx.arc(x,y,7.5*r,0,TAU);break;
   case 'orbit-orbs':ctx.arc(x,y,6*r,0,TAU);break;
   case 'squad-clone':ctx.moveTo(x+9*r,y);ctx.lineTo(x-6*r,y-6.5*r);ctx.lineTo(x-2.5*r,y);ctx.lineTo(x-6*r,y+6.5*r);ctx.closePath();break;
   case 'blood-clone':ctx.arc(x,y,8*r,-1.2,1.2);ctx.arc(x-3*r,y,6.2*r,1.1,-1.1,true);ctx.closePath();break;
   case 'afterimage':ctx.ellipse?.(x,y,7.5*r,5*r,0,0,TAU);break;
   case 'heart-blossom':ctx.moveTo(x,y+6*r);ctx.bezierCurveTo?.(x-8.5*r,y-.6*r,x-4*r,y-7.2*r,x,y-2.3*r);ctx.bezierCurveTo?.(x+4*r,y-7.2*r,x+8.5*r,y-.6*r,x,y+6*r);ctx.closePath();break;
   default:ctx.moveTo(x+8*r,y);ctx.lineTo(x,y+5.5*r);ctx.lineTo(x-8*r,y);ctx.lineTo(x,y-5.5*r);ctx.closePath();}}
 // R4: familiars are companion motes, not glyph cursors: a soft additive glow in the hero colour (baked
 // once per colour, no white centre), a short fading afterimage trail, a small dark-rimmed orb with the
 // hero-colour ring and a tiny flavour glyph inside (heart for Michaela), and a muzzle flash when it fires.
 const moteSprites=new Map();
 function rgbaOf(hex,a){const v=parseInt(String(hex).slice(1),16)|0;return 'rgba('+(v>>16&255)+','+(v>>8&255)+','+(v&255)+','+a+')';}
 function moteSprite(col){let g=moteSprites.get(col);if(g!==undefined)return g;moteSprites.set(col,null);const c=canvas(64,64),x=c?.getContext?.('2d');if(!x?.createRadialGradient)return null;
  const G=x.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,rgbaOf(col,.9));G.addColorStop(.3,rgbaOf(col,.62));G.addColorStop(.62,rgbaOf(col,.2));G.addColorStop(1,rgbaOf(col,0));x.fillStyle=G;x.fillRect(0,0,64,64);moteSprites.set(col,c);return c;}
 // R5: bigger soft orbiting motes: rose-white glow (baked sprite), a short fading trail, a solid rose-white
 // orb with a dark rim and a thin hero-colour ring around it. No glyph inside (the arrow badge read as a cursor).
 function drawFamiliar(ctx,F,i,f,T,t,set){const x=F.x,y=F.y;if(!(Number.isFinite(x)&&Number.isFinite(y)))return;const r=FAM_SCALE,q=!!set?.reducedFlash,fl=t-F.flash,flash=fl>=0&&fl<.12;
  const body=f==='afterimage'?.85-.1*i:1,ms=moteSprite(FAM_COL);
  ctx.globalCompositeOperation='source-over';
  // floor shadow at the actor floor line (heart + 42)
  ctx.globalAlpha=.35;ctx.fillStyle=INK;ctx.beginPath();ctx.ellipse?.(x,y+40,6*r,2*r,0,0,TAU);ctx.fill();
  // afterimage trail (older samples first), additive
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=FAM_COL;
  for(let j=1;j<F.tn;j++){const qd=(F.ti-1-j+TRAIL*2)%TRAIL,px=F.tx[qd],py=F.ty[qd];if(!(Number.isFinite(px)&&Number.isFinite(py)))continue;ctx.globalAlpha=.26*(1-j/TRAIL)*body;ctx.beginPath();ctx.arc(px,py,(4.4-.6*j)*r*.8,0,TAU);ctx.fill();}
  // soft glow
  if(ms){const S=(24+(q?0:Math.sin(t*5+i)*1.6))*r;ctx.globalAlpha=.95*body;ctx.drawImage(ms,x-S/2,y-S/2,S,S);}
  // orb: dark rim, rose-white body, small highlight; thin hero-colour ring around it
  ctx.globalCompositeOperation='source-over';ctx.beginPath();ctx.arc(x,y,3.9*r,0,TAU);ctx.globalAlpha=.9*body;ctx.lineWidth=3.2;ctx.strokeStyle=INK;ctx.stroke();ctx.globalAlpha=.96*body;ctx.fillStyle=FAM_COL;ctx.fill();
  ctx.globalAlpha=.9*body;ctx.fillStyle=FAM_HI;ctx.beginPath();ctx.arc(x-1.2*r,y-1.3*r,1.3*r,0,TAU);ctx.fill();
  ctx.globalAlpha=.8*body;ctx.lineWidth=2;ctx.strokeStyle=T.body;ctx.beginPath();ctx.arc(x,y,5.9*r,q?0:t*2.2+i,(q?0:t*2.2+i)+TAU*.78);ctx.stroke();
  // muzzle flash toward the target (hero faces right): a brief bright puff and two short sparks
  if(flash&&ms){const u=fl/.12,S=(q?10:17)*r*(1-.4*u);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(q?.45:.9)*(1-u);ctx.drawImage(ms,x+5*r-S/2,y-S/2,S,S);
   if(!q){ctx.strokeStyle=FAM_COL;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+4.5*r,y-1.5*r);ctx.lineTo(x+(8.5+4*u)*r,y-3*r);ctx.moveTo(x+4.5*r,y+1.5*r);ctx.lineTo(x+(8.5+4*u)*r,y+3*r);ctx.stroke();}}
  ctx.globalCompositeOperation='source-over';}
 function drawShots(ctx,k,pal,t){const SP=FEEL()?.shapes;let c=0;for(const b of k.shots){if(!b.on)continue;const u=(t-b.born)/b.dur;if(u<0||u>1)continue;const x=b.ax+(b.tx-b.ax)*u,y=b.ay+(b.ty-b.ay)*u;if(!(Number.isFinite(x)&&Number.isFinite(y)))continue;
  ctx.save();ctx.translate(x,y);if(!SP?.UPRIGHT?.[b.shape])ctx.rotate(Math.atan2(b.ty-b.ay,b.tx-b.ax));ctx.globalAlpha=.95;ctx.lineWidth=1.6;ctx.strokeStyle=INK;ctx.fillStyle=pal.body;
  if(SP?.shapePath)SP.shapePath(ctx,b.shape,5.2);else{ctx.beginPath();ctx.arc(0,0,3.5,0,TAU);}ctx.stroke();ctx.fill();ctx.restore();c++;}return c;}
 // Bomb (fix round 2): a thick expanding shockwave on the floor (2:1 iso ellipse from the hero's feet,
 // dark underlay + hero-colour band + soft sprite ring), a short filled flash and pooled debris shards.
 // Thicker on phone; reducedFlash lowers the flash only (the shockwave stays).
 const BG={cx:0,cy:0,rx:0,ry:0,u:0,rmax:0};
 function bombGeomAt(k,t){const fx=k?.fx;if(!fx)return null;const u=(t-fx.at)/BOMB_DUR;if(!(u>=0&&u<1)||!(Number.isFinite(fx.x)&&Number.isFinite(fx.y)))return null;
  const r=30+n(fx.rmax,BOMB_R.pc)*(1-(1-u)*(1-u)*(1-u));BG.cx=fx.x;BG.cy=fx.y;BG.rx=r;BG.ry=r/2;BG.u=u;BG.rmax=n(fx.rmax,BOMB_R.pc);return BG;}
 // R5: no filled flash disc and no big glow (they washed the characters out): the bomb is a dark screen
 // dim (screen pass), an additive hero-gold shockwave band on the floor and sparks riding its front.
 const GLINTS=14;
 function drawBomb(ctx,k,T,t,set){const g=bombGeomAt(k,t);if(!g)return 0;const q=!!set?.reducedFlash,f=1-g.u,F=FEEL(),phone=!!k.fx.phone;let d=0;
  const rs=F?.ringSprite?.(T.body),gs=F?.glowSprite?.(T.body);
  // shockwave band
  const L=(phone?18:12)*Math.pow(f,.6)+3;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.75*f;ctx.lineWidth=L+4;ctx.strokeStyle=INK;ctx.beginPath();ctx.ellipse?.(g.cx,g.cy,g.rx,g.ry,0,0,TAU);ctx.stroke();
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(q?.75:.95)*Math.pow(f,.8);ctx.lineWidth=L;ctx.strokeStyle=T.body;ctx.stroke();
  ctx.globalAlpha=(q?.5:.8)*f;ctx.lineWidth=Math.max(1.5,L*.3);ctx.strokeStyle=BOMB_HI;ctx.stroke();
  if(rs){ctx.globalAlpha=(q?.35:.6)*Math.pow(f,1.2);ctx.drawImage(rs,g.cx-g.rx*1.08,g.cy-g.ry*1.08,2.16*g.rx,2.16*g.ry);d++;}
  // glints riding the front (procedural, no state)
  if(gs&&!q){const a0=n(k.fx.at)*7;for(let i=0;i<(phone?9:GLINTS);i++){const a=a0+i*2.399,w=.5+.5*Math.sin(t*20+i*1.7),S=(phone?16:20)*(.6+.6*w)*(.5+.5*f),x=g.cx+Math.cos(a)*g.rx,y=g.cy+Math.sin(a)*g.ry;ctx.globalAlpha=.85*f*(.4+.6*w);ctx.drawImage(gs,x-S/2,y-S/2,S,S);d++;}}
  ctx.setLineDash?.(DASH);ctx.lineDashOffset=q?0:-t*140;ctx.lineWidth=phone?2.5:1.8;
  ctx.globalAlpha=.45*f;ctx.strokeStyle=T.body;ctx.beginPath();ctx.ellipse?.(g.cx,g.cy,g.rx*.72,g.ry*.72,0,0,TAU);ctx.stroke();ctx.setLineDash?.(NODASH);
  return d;}
 function drawDebris(ctx,k,T,set){const D=k.deb;if(!D||!D.live)return 0;const q=!!set?.reducedFlash;ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.strokeStyle=T.body;ctx.lineWidth=k.fx?.phone?3:2.4;
  ctx.beginPath();let c=0;for(let i=0;i<D.live;i++){const u=D.age[i]/D.life[i],x=D.x[i],y=D.y[i];if(!(Number.isFinite(x)&&Number.isFinite(y))||u>=1)continue;ctx.moveTo(x,y);ctx.lineTo(x-D.vx[i]*.05,y-D.vy[i]*.05);c++;}
  ctx.globalAlpha=q?.6:.9;ctx.stroke();
  ctx.globalCompositeOperation=q?'source-over':'lighter';ctx.fillStyle=BOMB_HI;ctx.globalAlpha=q?.55:.9;ctx.beginPath();for(let i=0;i<D.live;i++){const x=D.x[i],y=D.y[i],r=3*(1-D.age[i]/D.life[i])+.9;if(!(Number.isFinite(x)&&Number.isFinite(y)))continue;ctx.moveTo(x,y-r);ctx.lineTo(x+r*.7,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.7,y);ctx.closePath();}ctx.fill();
  ctx.globalCompositeOperation='source-over';return c;}
 function draw(ctx,s,m,set){if(!on(s))return 0;const k=worlds.get(s);if(!k)return 0;const t=n(s.time),pal=palette(m),T=tone(s);let d=0;metrics.draws++;
  ctx.save();try{ctx.globalCompositeOperation='source-over';
   if(k.fx)d+=drawBomb(ctx,k,T,t,set);
   if(k.deb.live)d+=drawDebris(ctx,k,T,set);
   for(let i=0;i<Math.min(FAM_MAX,k.level);i++){drawFamiliar(ctx,k.fam[i],i,flavour(s.activeHeroId),T,t,set);d++;}
   ctx.globalCompositeOperation='source-over';d+=drawShots(ctx,k,T,t);
   const P=k.items,sp=itemSprite(pal);ctx.globalAlpha=1;
   for(let i=0;i<P.live;i++){const x=P.x[i],y=P.y[i];if(!(Number.isFinite(x)&&Number.isFinite(y)))continue;const sc=P.kind[i]===1?1-.25*clamp(P.age[i]/SCATTER_LIFE,0,1):1;
    ctx.globalAlpha=P.kind[i]===1&&P.age[i]>SCATTER_LIFE-.6?(set?.reducedFlash?.6:(Math.floor(t*12)%2?.35:1)):1;
    if(sp){const w=sp.W*sc;ctx.drawImage(sp.c,x-w/2,y-w/2,w,w);}else{ctx.fillStyle=pal.body;ctx.fillRect(x-6,y-6,12,12);}d++;}
  }catch(e){fail(e);}finally{ctx.restore();}return d;}
 function washAlpha(set){return set?.reducedFlash?.05:.1;}
 const WASH_DUR=.3,SWEEP_DUR=.5;
 // HUD: power pips (4) + bomb stock (2) beside the resonance bar. PC: bottom-left of the canvas, above
 // the native resonance strip; phone: just under the resonance bar, clear of the phase panel and controls.
 let hintCv;const HINT_W=96,HINT_H=22;
 function hintSprite(){if(hintCv!==undefined)return hintCv;hintCv=null;const c=canvas(HINT_W*2,HINT_H*2),g=c?.getContext?.('2d');if(!g)return null;try{g.scale?.(2,2);g.textAlign='left';g.textBaseline='middle';g.font='bold 14px system-ui,"Noto Sans KR",sans-serif';g.lineJoin='round';g.lineWidth=3.5;g.strokeStyle=INK;
   g.strokeText?.(BOMB_HINT,3,HINT_H/2+.5);g.fillStyle=BOMB_HI;g.fillText?.(BOMB_HINT,3,HINT_H/2+.5);hintCv=c;}catch(e){fail(e);}return hintCv;}
 const HB=[0,0,0,0];
 const PIP_R=Object.freeze({pc:10,mobile:6}),BOMB_HINT='D×2 폭탄';
 // R5 phone: inline with the resonance bar (to its right, x 108..224, y 53..73), not a row under it.
 function hudBox(w,h,mobile){if(mobile){HB[0]=108;HB[1]=53;HB[2]=116;HB[3]=20;}else{HB[0]=16;HB[1]=n(h,720)-46;HB[2]=292;HB[3]=38;}return HB;}
 function drawHud(ctx,s,k,m,w,h,T){const mobile=!!m?.mobile||w<800||h<500,B=hudBox(w,h,mobile),x0=B[0],y0=B[1],bw=B[2],bh=B[3],cy=y0+bh/2;
  ctx.globalCompositeOperation='source-over';
  if(mobile){ctx.globalAlpha=.72;ctx.fillStyle='#08050c';ctx.beginPath();ctx.rect(x0,y0,bw,bh);ctx.fill();ctx.globalAlpha=.85;ctx.fillStyle=GOLD;ctx.beginPath();ctx.rect(x0,y0+3,1,bh-6);ctx.fill();}
  else{// R4: PC backing plate (clipped corners) with a gold border, pips ~1.5x
   const c=6;ctx.beginPath();ctx.moveTo(x0+c,y0);ctx.lineTo(x0+bw-c,y0);ctx.lineTo(x0+bw,y0+c);ctx.lineTo(x0+bw,y0+bh-c);ctx.lineTo(x0+bw-c,y0+bh);ctx.lineTo(x0+c,y0+bh);ctx.lineTo(x0,y0+bh-c);ctx.lineTo(x0,y0+c);ctx.closePath();
   ctx.globalAlpha=.8;ctx.fillStyle='#08050c';ctx.fill();ctx.globalAlpha=.85;ctx.lineWidth=1.2;ctx.strokeStyle=GOLD;ctx.stroke();}
  const step=mobile?14:25,r=mobile?PIP_R.mobile:PIP_R.pc;let x=x0+(mobile?12:20);
  for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x,cy-r);ctx.lineTo(x+r*.8,cy);ctx.lineTo(x,cy+r);ctx.lineTo(x-r*.8,cy);ctx.closePath();
   if(i<k.level){ctx.globalAlpha=1;ctx.fillStyle=T.body;ctx.fill();ctx.lineWidth=mobile?1.5:2;ctx.strokeStyle=INK;ctx.stroke();}else{ctx.globalAlpha=.8;ctx.lineWidth=mobile?1.4:1.8;ctx.strokeStyle=GOLD;ctx.stroke();}x+=step;}
  ctx.globalAlpha=.6;ctx.fillStyle=GOLD;ctx.beginPath();ctx.rect(x-(mobile?3:6),y0+4,1.2,bh-8);ctx.fill();x+=step*(mobile?.75:.6);
  for(let i=0;i<STOCK_MAX;i++){ctx.beginPath();ctx.arc(x,cy,r+.6,0,TAU);
   if(i<k.stock){ctx.globalAlpha=1;ctx.fillStyle=T.body;ctx.fill();ctx.lineWidth=1.2;ctx.strokeStyle=INK;ctx.stroke();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x-r*.2,cy-r*.2,mobile?1.4:2,0,TAU);ctx.fill();}
   else{ctx.globalAlpha=.7;ctx.lineWidth=mobile?1:1.5;ctx.strokeStyle=GOLD;ctx.stroke();}x+=step+2;}
  // R5 PC: the bomb input next to the discs (phone has the tap badge on the button instead). Baked once.
  // Not during the boss warning (that pass draws no images: the warning owns the frame).
  if(!mobile&&FEEL()?.warningActive?.(s)!==true){const hs=hintSprite();if(hs){ctx.globalAlpha=k.stock>0?1:.5;ctx.drawImage(hs,x-6,cy-HINT_H/2,HINT_W,HINT_H);}}
  ctx.globalAlpha=1;}
 function drawScreen(ctx,s,m,set){if(!on(s))return;const k=worlds.get(s);if(!k)return;const v=U()?.screenSpace?.(ctx);if(!v)return;const T=tone(s);
  // R5: a dark dim instead of the light wash (it lifted the blacks into a grey veil): an even darkening,
  // a little lighter around the hero (no bright window inside the ring), darkest at the frame edge. A path fill, never a fillRect.
  if(k.fx){const u=(n(s.time)-k.fx.at)/DIM_DUR;if(u>=0&&u<1&&typeof ctx.createRadialGradient==='function'){let p=null;try{p=FEEL()?.toScreen?.(ctx,m,k.fx.x,k.fx.y-42,v.w,v.h);}catch(e){}const cx=p?p.x:v.w*.35,cy=p?p.y:v.h*.55,c=k.fx.dim;
    let G=c&&c.ctx===ctx&&Math.abs(c.x-cx)<6&&Math.abs(c.y-cy)<6&&c.w===v.w?c.g:null;
    if(!G){G=ctx.createRadialGradient(cx,cy,Math.min(v.w,v.h)*.16,cx,cy,Math.max(v.w,v.h)*.75);G.addColorStop(0,'rgba(3,2,8,.62)');G.addColorStop(.4,'rgba(3,2,8,.74)');G.addColorStop(1,'rgba(3,2,8,1)');k.fx.dim={ctx,x:cx,y:cy,w:v.w,g:G};}
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=DIM_PEAK*Math.min(1,u/.08)*(1-u);ctx.fillStyle=G;ctx.beginPath();ctx.rect(0,0,v.w,v.h);ctx.fill();ctx.globalAlpha=1;}}
  // Shockwave sweep from the hero's feet (CSS px, strokes only): a 2:1 floor ellipse (R4: never a screen
  // circle clipped by the top HUD); its top stays below 8% of the screen height.
  if(k.fx){const u=(n(s.time)-k.fx.at)/SWEEP_DUR;if(u>=0&&u<1){let p=null;try{p=FEEL()?.toScreen?.(ctx,m,k.fx.x,k.fx.y,v.w,v.h);}catch(e){}const cx=p?p.x:v.w*.35,cy=p?p.y:v.h*.6,e=1-(1-u)*(1-u)*(1-u),f=1-u,ph=!!k.fx.phone||v.w<800;
   const cap=Math.max(12,cy-v.h*.08),ry=Math.min(cap,(24+Math.max(cx,v.w-cx)*e)/2),R=2*ry,L=(ph?11:8)*f+2;ctx.globalCompositeOperation='source-over';ctx.lineCap='butt';
   ctx.globalAlpha=.55*f;ctx.lineWidth=L+4;ctx.strokeStyle=INK;ctx.beginPath();if(ctx.ellipse)ctx.ellipse(cx,cy,R,ry,0,0,TAU);else ctx.arc(cx,cy,ry,0,TAU);ctx.stroke();
   ctx.globalAlpha=(set?.reducedFlash?.6:.9)*f;ctx.lineWidth=L;ctx.strokeStyle=T.body;ctx.stroke();ctx.globalAlpha=.8*f;ctx.lineWidth=Math.max(1.2,L*.3);ctx.strokeStyle=T.core;ctx.stroke();ctx.globalAlpha=1;}}
  drawHud(ctx,s,k,m,v.w,v.h,T);}
 // "x2" hint: a small DOM badge over the D / 공명 button while a bomb is in stock, until the player
 // has bombed twice this session. Not a button (pointer-events none); positioned every 300 ms.
 let badgeEl=null;const pulse={left:-1};
 const TAP_ICON='url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1a1206" stroke-width="2.2" stroke-linecap="round"><path d="M9 21v-9a2 2 0 0 1 4 0v5l4 1v3"/><path d="M6 7a5 5 0 0 1 10 0"/><path d="M3 7a8 8 0 0 1 16 0"/></svg>')+'")';
 function findD(){const d=root.document;for(const sel of ['[data-mobile-action="D"]','[data-control-key="D"]']){let el=null;try{el=d?.querySelector?.(sel);}catch(e){}if(!el)continue;const r=el.getBoundingClientRect?.();if(r&&r.width>2&&r.height>2)return el;}return null;}
 function badge(){try{const d=root.document;if(!d?.createElement||!d.body)return;const s=current(),k=s&&on(s)?worlds.get(s):null,b=binding(),btn=k?findD():null;
   const show=!!(k&&btn&&k.stock>0&&seen.bombs<2&&!d.hidden&&(b?.phase===undefined||b.phase==='game')&&!b?.modal?.current&&!root.__HAPIL_ORIENTATION_PAUSE_RC152__?.paused?.());
   if(!badgeEl){if(!show)return;const e=d.createElement('div');e.textContent='×2';e.setAttribute?.('aria-hidden','true');const st=e.style;st.position='fixed';st.pointerEvents='none';st.zIndex='2147483000';
    // A double-tap glyph (finger + ripples) before "×2" on a gold pill, so it reads as "tap twice", not "2 in stock".
    st.font='bold 13px ui-monospace,Menlo,monospace';st.color='#1a1206';st.backgroundColor='#ffd86a';st.backgroundImage=TAP_ICON;st.backgroundRepeat='no-repeat';st.backgroundPosition='4px 50%';st.backgroundSize='16px 16px';
    st.border='1.5px solid #fff3c8';st.borderRadius='10px';st.padding='1px 6px 1px 23px';st.lineHeight='18px';st.boxSizing='border-box';st.transition='transform .14s ease-out,box-shadow .14s ease-out';st.transformOrigin='50% 50%';d.body.appendChild(e);badgeEl=e;}
   if(!show){badgeEl.style.display='none';return;}const r=btn.getBoundingClientRect();badgeEl.style.display='block';badgeEl.style.left=Math.round(r.right-40)+'px';badgeEl.style.top=Math.round(r.top-14)+'px';
   // One-time pulse the first time the hint shows this session (4 beats at the 300 ms tick), then steady.
   if(pulse.left<0)pulse.left=8;if(pulse.left>0){pulse.left--;const up=pulse.left%2===1;badgeEl.style.transform=up?'scale(1.3)':'scale(1)';badgeEl.style.boxShadow=up?'0 0 0 3px rgba(255,216,106,.45)':'none';}
   else{badgeEl.style.transform='scale(1)';badgeEl.style.boxShadow='none';}}catch(e){fail(e);}}
 try{if(root.document)root.setInterval?.(badge,300);}catch(e){}

 // ---------------------------------------------------------------- API
 const api={version:VERSION,tick,draw,drawScreen,onHit,reset,decorateAttack,rank,dropPower,notePress,
  // Same cancel path as the bomb, for other owners (boss-form's second-form transformation).
  cancelNative(s){if(!s||!layerOn())return 0;try{const c=nativeCancel(s);metrics.nativeCancelled+=c;return c;}catch(e){fail(e);return 0;}},
  metrics:()=>({...metrics,lastError}),
  state(s){if(!s||!on(s))return null;const k=worlds.get(s);if(!k)return null;return {level:k.level,points:k.points,stock:k.stock,bombs:k.bombs,items:k.items.live,familiars:Math.min(FAM_MAX,k.level),fx:!!k.fx};},
  __test:{hudBox:(w,h,mobile)=>[...hudBox(w,h,mobile)],badge,seen,PIP_R,WASH_DUR,debris:s=>{const k=s&&worlds.get(s);return k?{live:k.deb.live,cap:DEB_CAP}:null;},famSize:()=>FAM_SCALE*16,famColor:()=>FAM_COL,hint:()=>({text:BOMB_HINT,w:HINT_W,h:HINT_H,sprite:hintSprite()}),bombGeom:s=>{const k=s&&worlds.get(s);const g=k&&bombGeomAt(k,n(s.time));return g?{...g}:null;},THRESH,POWER_STEP,RANK_STEP,FAM_SHARE,ITEM_CAP,STOCK_START,STOCK_MAX,BOMB_MULT,BOMB_BOSS_CAP,TAP_GAP,FLAVOUR,flavour,shotShape,washAlpha,
   colors:m=>{const p=palette(m);return [p.body,p.edge,p.core,p.dim];},
   items:s=>{const k=s&&worlds.get(s);if(!k)return [];const P=k.items,o=[];for(let i=0;i<P.live;i++)o.push({x:P.x[i],y:P.y[i],kind:P.kind[i],val:P.val[i]});return o;},worlds}};
 Object.defineProperty(root,'__HAPIL_ARCADE_KIT_RC240__',{value:Object.freeze(api),configurable:true,writable:false,enumerable:false});
})(typeof window==='object'?window:globalThis);
