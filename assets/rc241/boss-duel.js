/* RC241 boss duel (pilot): persona-style duel phases for bosses that own a deck
 * in boss-duel-decks.js. Copies the RC133 persona rhythm instead of stacking
 * layers:
 *  - one attack source with one cast lock: the boss's native ordnance clocks and
 *    the RC95 pressure lock are held for the whole duel, and RC240's spell
 *    curtain, signature formation and filler stream stand aside for that boss
 *    (danmaku-layer duelHeld gate; RC240's STG feel, charge shot and warning stay);
 *  - each named volley materialises around the boss (or above the hero for
 *    falls), hangs harmless for >= .72 s with a telegraph, then releases
 *    together; the next volley waits for release end + .35 s (>= 1.05 s apart);
 *  - one authored sprite per volley with one colour rim (bright, distinct from
 *    the hero's cyan/gold shots), drawn from the boss's existing projectile art;
 *  - every 28 s (first at 14 s) a 7 s awakening act: RC150 impact + RC137 portrait
 *    flash, a persistent portrait card, a per-boss edge grade, denser volleys.
 * Own G-space SoA pool, own collision through the native arena damage seam (the
 * RC240 contact model, copied), own painter in the ENEMY_FEEL front layer.
 * Seams (call-through, idempotent, re-checked each second):
 *  - __HAPIL_LOOP_V31365__.tick(s,dt): simulation (no other module wraps it);
 *  - __HAPIL_ENEMY_FEEL_V31361__.draw(ctx,s,set,'front'): world-space bullets;
 *  - a DOM overlay beside .game-stage > canvas: awakening grade and card.
 * Flags: ?duel=0 off; ?qa off unless duel=1 (like rc240); stored 'off' off.
 * Nothing is saved; mobs and bosses without a deck are untouched.
 */
(function(root){'use strict';
 if(root.__HAPIL_BOSS_DUEL_RC241__)return;
 const VERSION='RC241-duel-1',STORE='hapil.rc241.duel';
 const n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d,clamp=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2;
 const HOLD=['readyAt','patternReadyAt','themedOrdnanceAt','bossCombatPatternReadyAtV31230','themedSummonAt'];
 const INTRO=2.6,AFTER=.35,MIN_GAP=1.05,BREATH=.25,BREATH_AWAKE=.12,LOCK=.3,MAT=.22;
 const HEART_R=4.5,GRAZE=19.44,MERCY_AUTO=.3,AUTO_DMG=.75,CLEAR_R=90,FLIGHT=7;
 const CAP=Object.freeze({pc:192,mobile:128});
 const F_GRAZED=1,F_TRACK=2,F_ANCHOR=4,F_DEAD=8;
 const BOUND=Object.freeze({x0:-140,x1:1420,y0:40,y1:920});
 const metrics={installs:0,rewraps:0,ticks:0,casts:0,released:0,hits:0,grazes:0,acts:0,wipes:0,dodges:0,draws:0,errors:0,bakes:0,retired:0};
 let lastError=null;
 function fail(e){metrics.errors++;lastError=String(e&&e.stack||e).slice(0,300);if(metrics.errors<=3)root.console?.warn?.('RC241 boss duel',e);}
 const DATA=()=>root.__HAPIL_BOSS_DUEL_DECKS_RC241__??null;
 // The deck data rides beside the runtime (one index.html tag): load it once if absent.
 const DECKS_SRC='./assets/rc241/boss-duel-decks.js?v=24101';
 (function loadDecks(){try{if(DATA())return;const d=root.document;if(!d?.createElement||!d.head?.appendChild)return;if(d.querySelector?.('script[data-rc241-decks]'))return;
  const el=d.createElement('script');el.src=DECKS_SRC;el.async=false;el.dataset.rc241Decks='true';d.head.appendChild(el);}catch(e){}})();

 // ---------------------------------------------------------------- flags
 let enabledFlag=true;
 (function initFlags(){try{const q=String(root.location?.search??'');const qa=/[?&]qa(=|&|$)/.test(q);let stored=null;try{stored=root.localStorage?.getItem?.(STORE)??null;}catch(e){}
  if(/[?&]duel=0/.test(q))enabledFlag=false;else if(/[?&]duel=1/.test(q))enabledFlag=true;else if(qa)enabledFlag=false;else if(stored==='off')enabledFlag=false;}catch(e){}})();

 // ---------------------------------------------------------------- ownership
 function deckFor(a){const D=DATA();return a&&D?.bosses?.[String(a.id)]||null;}
 function owns(s,a){if(!enabledFlag||!s||!a||a.boss!==true||!(n(a.hp)>0)||a.visualOnly||a.friendly||a.neutral)return false;const b=deckFor(a);
  return !!b&&b.zone===s.zone&&!s.practiceV31329&&!s.practicePatternV31365&&!s.namedPatternCodexV31410;}
 function ownerOf(s){if(!enabledFlag||!s||!Array.isArray(s.enemies))return null;for(const a of s.enemies)if(owns(s,a))return a;return null;}
 function framed(s){return !!ownerOf(s);}

 // ---------------------------------------------------------------- pool (SoA)
 const F32=['x','y','vx','vy','size','hit','rot','spin','off','r','lat','spd','tilt'],F64=['born','hang','dieAt'];
 function isMobile(){try{const w=n(root.innerWidth,1280),h=n(root.innerHeight,720);return Math.min(w,h)<=500||w<800||root.document?.documentElement?.classList?.contains?.('rc240-phone')===true;}catch(e){return false;}}
 function capFor(mobile){return mobile?CAP.mobile:CAP.pc;}
 function createPool(cap){const p={cap,live:0};for(const f of F32)p[f]=new Float32Array(cap);for(const f of F64)p[f]=new Float64Array(cap);p.kind=new Uint8Array(cap);p.flags=new Uint8Array(cap);return p;}
 function poolRemove(p,i){const last=--p.live;if(i!==last){for(const f of F32)p[f][i]=p[f][last];for(const f of F64)p[f][i]=p[f][last];p.kind[i]=p.kind[last];p.flags[i]=p.flags[last];}}
 const worlds=new WeakMap();
 function mem(s){let m=worlds.get(s);if(!m){const mobile=isMobile();m={zone:s.zone,mobile,pool:createPool(capFor(mobile)),ownerId:null,deck:null,clock:0,cycle:0,nextCast:0,volley:null,serial:0,
  awake:0,actAt:0,acts:0,mercyUntil:-1,hits:[],ratio:1,graze:{rate:0,rateAt:-9,count:0,combo:0,budget:0,budgetAt:-99},lastEgo:-1,dodgeAt:-9,sparks:[],sprites:[],started:false,hud:null};worlds.set(s,m);}return m;}
 function reset(m,s){hudHide(m);m.pool.live=0;m.ownerId=null;m.deck=null;m.clock=0;m.cycle=0;m.nextCast=0;m.volley=null;m.awake=0;m.actAt=0;m.acts=0;m.sparks.length=0;m.sprites=[];m.started=false;m.zone=s?.zone;}

 // ---------------------------------------------------------------- helpers
 function project(x,y){const B=root.__HAPIL_RC86_BRIDGE__;try{if(B?.project){const p=B.project(x,y);if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))return p;}}catch(e){}return {x:640+27*(n(x)-n(y)),y:13.5*(n(x)+n(y))};}
 function heart(s){try{const c=root.__HAPIL_COMBAT_V31333__?.core?.(s);if(c&&Number.isFinite(c.x)&&Number.isFinite(c.y))return c;}catch(e){}const p=project(s.x,s.y);return {x:p.x,y:p.y-42};}
 function muzzle(a,m){const p=project(n(a.x,m.lastX??19),n(a.y,m.lastY??19));const lift=100*clamp(n(a.scale,1),1,1.6);return {x:p.x,y:p.y-lift};}
 function gmode(s){try{const g=root.__HAPIL_GRAMMAR_V31365__?.mode?.(s);if(g==='DREAM'||g==='HELL')return g;}catch(e){}const v=s?.gameModeV31346??(s?.hellModeV31322?'HELL':'STORY');return v==='DREAM'||v==='HELL'?v:'STORY';}
 function settingsNow(){try{return root.__HAPIL_CONTROLS_V31329__?.binding?.settings?.current??{};}catch(e){return {};}}
 function fullAuto(s){try{const C=root.__HAPIL_CONTROLS_V31329__,m=C?.effective?.(settingsNow());if(m)return m==='full';}catch(e){}return s?.combatModeV31329==='full';}
 function guest(s){const p=root.__HAPIL_PARTY_V31322__;return p?.state===s&&(p.status?.role==='guest'||p.status?.paused||p.status?.disconnected);}
 function dActive(s){try{const C=root.__HAPIL_CHANNEL_V31364__??root.__HAPIL_DEFENSE_V31356__;if(C?.active)return C.active(s,s)===true;}catch(e){}return s.channelDActiveV31364===true;}
 function float(s,text,color,x,y,duration,critical){try{(s.floatTexts??=[]).push({id:s.fxSerial=n(s.fxSerial)+1,sourceId:'rc241-duel',x,y,born:s.time,duration,text,color,critical:!!critical,rc241:true});}catch(e){}}
 function hashI(a,b){let h=(Math.imul(a|0,2654435761)^Math.imul((b|0)+0x9e37,40503))>>>0;h^=h>>>15;return (h>>>0)/4294967296;}

 // ---------------------------------------------------------------- formations
 // Each row: off (rad from aim), r (px from muzzle along aim+off), lat (px across aim),
 // delay (s after release), spd multiplier, flags; rain rows carry absolute x,y.
 function formation(e,N,aim,H0,mz,cycle,rs=1,sz=48){const rows=[],f=e.formation,stagger=n(e.stagger);rs=clamp(n(rs,1),1,1.6);
  // Twin combs, needle files and walls space sprites by ~.6-.8 widths so a shard reads as one bullet, not a sheet.
  // Rings keep at least ~.62 sprite widths between neighbours so a dense awakened ring never melts into a blob.
  const ringR=k=>Math.max(96*rs,k*n(sz,48)*.62/TAU);
  const add=(o)=>rows.push({off:0,r:72,lat:0,delay:0,spd:1,flags:F_ANCHOR,tilt:0,...o});
  if(f==='fan'){const sp=n(e.spread,1);for(let i=0;i<N;i++)add({off:N>1?(i/(N-1)-.5)*sp:0,r:84*rs,flags:F_ANCHOR|F_TRACK,spd:1-.06*Math.abs(i-(N-1)/2)/Math.max(1,(N-1)/2)});}
  else if(f==='twin'){const k=Math.max(2,Math.ceil(N/2)),sp=n(e.spread,.6);for(let i=0;i<N;i++){const side=i%2?1:-1,j=Math.floor(i/2);add({off:side*sp/2+(k>1?(j/(k-1)-.5)*.16:0),r:84*rs,lat:(j-(k-1)/2)*n(sz,48)*.72,flags:F_ANCHOR|F_TRACK});}}
  else if(f==='needle'){const rowsN=Math.max(1,Math.floor(n(e.rows,3))),per=Math.ceil(N/rowsN);for(let i=0;i<N;i++){const lane=i%rowsN,j=Math.floor(i/rowsN);add({off:rowsN>1?(lane/(rowsN-1)-.5)*.22:0,r:74*rs+j*Math.max(30,n(sz,48)*.62),delay:j*stagger,flags:F_ANCHOR|F_TRACK,spd:1+.04*(per-j)});}}
  else if(f==='ring'){for(let i=0;i<N;i++)add({off:TAU*i/N+Math.PI/N+(cycle%2)*Math.PI/N*.5,r:ringR(N),delay:stagger>0?(i%2)*stagger:0});}
  else if(f==='spiral'){const arms=Math.max(1,Math.floor(n(e.arms,1))),per=Math.ceil(N/arms),dir=cycle%2?-1:1;for(let i=0;i<N;i++){const arm=i%arms,k=Math.floor(i/arms);add({off:dir*(arm*TAU/arms+k*TAU/per*.92),r:ringR(per),delay:k*stagger});}}
  // Hexagram (house rule: no formation may read as a cross): two overlapping triangles traced edge by edge
  // (3 or 6 points per edge, so each place the triangles cross is shared and placed once),
  // around the muzzle, every point flying straight out at one speed so the star grows without distorting.
  else if(f==='hexagram'){const per=N>=20?6:3,R=Math.max(130*rs,per*n(sz,48)*.95/Math.sqrt(3)),seen=[],turn=(cycle%3)*.18;
   for(let tri=0;tri<2;tri++)for(let e2=0;e2<3;e2++){const a0=aim+turn+tri*Math.PI/3+e2*TAU/3,a1=a0+TAU/3,x0=Math.cos(a0)*R,y0=Math.sin(a0)*R,x1=Math.cos(a1)*R,y1=Math.sin(a1)*R;
    for(let k=0;k<per;k++){const u=k/per,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u;if(seen.some(q=>Math.hypot(q[0]-x,q[1]-y)<1))continue;seen.push([x,y]);add({off:Math.atan2(y,x)-aim,r:Math.hypot(x,y),spd:1,delay:tri*stagger});}}}
  else if(f==='wall'){const rowsN=Math.max(1,Math.floor(n(e.rows,1))),per=Math.ceil(N/rowsN),gap=Math.max(1,Math.floor(n(e.gap,2))),spacing=Math.max(34,n(sz,48)*.8);
   for(let r=0;r<rowsN;r++){const total=per+gap,shift=((cycle+r*2)%3)-1,g0=Math.floor((total-gap)/2)+shift*2;let placed=0;for(let k=0;k<total&&placed<per;k++){if(k>=g0&&k<g0+gap)continue;placed++;add({off:0,r:110*rs+r*40,lat:(k-(total-1)/2)*spacing+(r%2)*spacing/2,delay:r*.12,flags:F_ANCHOR|F_TRACK});}}}
  else if(f==='rain'){const spacing=clamp(900/N,54,84),cx=clamp(H0.x,200,1080),y=Math.max(BOUND.y0+130,H0.y-250);for(let i=0;i<N;i++){const j=hashI(cycle*31+i,7)-.5;rows.push({abs:true,x:cx+(i-(N-1)/2)*spacing+j*18,y:y-((i+cycle)%2)*26,off:0,r:0,lat:0,delay:(i%3)*.08,spd:1,flags:0,tilt:(i%2?1:-1)*.1});}}
  else for(let i=0;i<N;i++)add({off:(i/(Math.max(1,N-1))-.5)*.8,flags:F_ANCHOR|F_TRACK});
  return rows;}
 function place(P,i,mz,aim){const th=aim+P.off[i];P.x[i]=mz.x+Math.cos(th)*P.r[i]-Math.sin(aim)*P.lat[i];P.y[i]=mz.y+Math.sin(th)*P.r[i]+Math.cos(aim)*P.lat[i];}

 function sprites(m,b){if(m.sprites.length)return m.sprites;const list=[];for(const e of b.deck)if(!list.includes(e.sprite))list.push(e.sprite);m.sprites=list;for(const p of list)picture(p);picture(b.portrait);return list;}

 function cast(s,m,a,b,mz,H0){const e=b.deck[m.cycle%b.deck.length],M=DATA().modes[gmode(s)]??DATA().modes.STORY,act=DATA().act,awake=m.awake>0,P=m.pool;
  let N=Math.round(n(e.count,8)*n(M.count,1)*(awake?n(act.count,1.5):1)*(m.mobile?.85:1));N=clamp(N,4,30);
  if(P.live+N>P.cap){m.nextCast=m.clock+.12;return false;}// whole volley or none (never clip a named pattern)
  const hang=Math.max(.72,n(e.hang,.9)*n(M.hangScale,1)*(awake?n(act.hang,.8):1)),aim=Math.atan2(H0.y-mz.y,H0.x-mz.x);
  let travel=1;try{travel=n(root.__HAPIL_SAMONG_RC91__?.incomingFactor?.(s),1);}catch(e2){}travel=clamp(travel,.25,2);
  const spd=n(M.speed,165)*n(e.speed,1)*(awake?n(act.speed,1.2):1)*travel,kind=Math.max(0,sprites(m,b).indexOf(e.sprite)),rows=formation(e,N,aim,H0,mz,m.cycle,n(a.scale,1),n(e.size,48)*(awake?1.1:1)),t=s.time,release=t+hang;
  let end=release;
  for(const row of rows){if(P.live>=P.cap)break;const i=P.live++;P.kind[i]=kind;P.flags[i]=row.flags|0;P.off[i]=row.off;P.r[i]=row.r;P.lat[i]=row.lat;P.spd[i]=spd*row.spd;P.tilt[i]=row.tilt||0;
   P.size[i]=n(e.size,48)*(awake?1.1:1);P.hit[i]=clamp(P.size[i]*.12,6,10);P.rot[i]=hashI(i,m.cycle)*TAU;P.spin[i]=e.heading==='spin'?(i%2?1.4:-1.4):0;
   P.born[i]=t;P.hang[i]=release+row.delay;P.dieAt[i]=release+row.delay+FLIGHT;P.vx[i]=0;P.vy[i]=0;end=Math.max(end,P.hang[i]);
   if(row.abs){P.x[i]=row.x;P.y[i]=row.y;}else place(P,i,mz,aim);}
  m.serial++;m.volley={serial:m.serial,name:e.name,index:m.cycle%b.deck.length,count:rows.length,castAt:t,releaseAt:release,releaseEnd:end,aim,lockAt:Math.max(t,release-LOCK),awake,fresh:true,sprite:e.sprite};
  m.cycle++;m.nextCast=m.clock+Math.max(MIN_GAP,end-t+AFTER+(awake?BREATH_AWAKE:BREATH));metrics.casts++;
  float(s,e.name,b.grade,a.x,a.y,Math.min(1.6,hang+.3),false);
  return true;}

 // ---------------------------------------------------------------- awakening act
 function startAct(s,m,a,b){const act=DATA().act;m.awake=n(act.length,7);m.acts++;metrics.acts++;
  try{root.__HAPIL_AWAKENING_IMPACT_RC150__?.boss?.(s,a,'rc241-'+a.id+'-'+m.acts+'-'+Math.floor(m.clock*1000),b.portrait,b.label);}catch(e){fail(e);}
  float(s,b.label,b.grade,a.x,a.y-1,1.2,true);}

 // ---------------------------------------------------------------- contact (RC240 model, copied)
 function addResonance(s,amount,reason){const before=clamp(n(s.resonance),0,100);let g=amount;try{const P=root.__HAPIL_SAMONG_POLICY_RC133__;if(P?.gain)g=n(P.gain(s,amount,reason),amount);}catch(e){}s.resonance=clamp(before+g,0,100);return s.resonance-before;}
 function packet(s,a,amount){const id=a?String(a.id):'rc241';return {id:'rc241-'+(s.fxSerial=n(s.fxSerial)+1),sourceId:a?.id,boss:true,born:s.time,damage:amount,rc241Duel:true,heartContactV31336:{target:'__host',time:s.time,heart:false},damageContactIdRC25:'rc241:'+id};}
 function kill(m,P,i,spark){if(spark&&m.sparks.length<48)m.sparks.push({x:P.x[i],y:P.y[i],born:m.now,kind:P.kind[i],size:P.size[i]});poolRemove(P,i);}
 function cancelNear(m,x,y,r){const P=m.pool;for(let i=P.live-1;i>=0;i--){const dx=P.x[i]-x,dy=P.y[i]-y;if(dx*dx+dy*dy<r*r)kill(m,P,i,true);}}
 function cancelAll(m){const P=m.pool;for(let i=P.live-1;i>=0;i--)kill(m,P,i,true);}
 function onContact(s,m,a,i){const P=m.pool,t=s.time,M=DATA().modes[gmode(s)]??DATA().modes.STORY,auto=fullAuto(s);
  if(t<m.mercyUntil)return;
  if(n(s.invulnerableUntil)>t)return;// blink / EGO: pass through
  if(dActive(s)){kill(m,P,i,true);try{const C=root.__HAPIL_CHANNEL_V31364__??root.__HAPIL_DEFENSE_V31356__;const bucket=Math.floor(t);if(m.dBucket!==bucket){m.dBucket=bucket;C?.blockDamage?.(s,s,{id:'rc241|'+String(a?.id??'')+'|'+bucket,sourceId:a?.id,born:bucket,damage:10,rc241Duel:true},10);}}catch(e){fail(e);}return;}
  const maxHp=Math.max(1,n(s.maxHp,100)),before=n(s.hp);let loss=n(M.dmg,.04)*maxHp*(auto?AUTO_DMG:1);
  while(m.hits.length&&t-m.hits[0].t>4)m.hits.shift();const used=m.hits.reduce((x,h)=>x+h.loss,0),cap=n(M.cap,.18)*maxHp;if(used+loss>cap)loss=Math.max(0,cap-used);
  if(before>.25*maxHp)loss=Math.min(loss,Math.max(0,before-1)*.8);
  m.mercyUntil=t+n(M.mercy,1.5)+(auto?MERCY_AUTO:0);m.graze.combo=0;
  const hx=P.x[i],hy=P.y[i];kill(m,P,i,true);cancelNear(m,hx,hy,CLEAR_R);
  if(loss>=.5){const amount=Math.max(1,Math.round(loss/m.ratio)),ow=a?{x:a.x,y:a.y}:{x:s.x+3,y:s.y};
   try{root.__HAPIL_NATIVE_ARENA_RC138__?.bodyDamage?.(s,amount,ow.x,ow.y,packet(s,a,amount));}catch(e){fail(e);}
   const real=before-n(s.hp);if(real>0){m.hits.push({t,loss:real});if(real<before&&amount>0)m.ratio=clamp(m.ratio*.7+(real/amount)*.3,.5,4);}
   if(before>.25*maxHp&&!(n(s.hp)>0))s.hp=1;}
  metrics.hits++;}
 function graze(s,m,i){const g=m.graze,t=s.time;if(t-g.rateAt>=1){g.rateAt=t;g.rate=0;}if(g.rate>=20)return;g.rate++;m.pool.flags[i]|=F_GRAZED;g.count++;g.combo++;metrics.grazes++;
  if(t-g.budgetAt>=10){g.budgetAt=t;g.budget=0;}if(g.combo%10===0&&g.budget<6){g.budget++;addResonance(s,1,'graze');}}
 function autoDodge(s,m,H0){if(!fullAuto(s)||s.time<m.dodgeAt||n(s.invulnerableUntil)>s.time)return;const P=m.pool;let best=-1,bt=1e9;
  for(let i=0;i<P.live;i++){if(P.hang[i]>s.time)continue;const dx=H0.x-P.x[i],dy=H0.y-P.y[i],vv=P.vx[i]*P.vx[i]+P.vy[i]*P.vy[i];if(vv<1)continue;const tt=(dx*P.vx[i]+dy*P.vy[i])/vv;if(tt<0||tt>.2)continue;
   const cx=P.x[i]+P.vx[i]*tt-H0.x,cy=P.y[i]+P.vy[i]*tt-H0.y;if(cx*cx+cy*cy<(P.hit[i]+HEART_R+8)**2&&tt<bt){bt=tt;best=i;}}
  if(best<0)return;const vx=P.vx[best],vy=P.vy[best],L=Math.hypot(vx,vy)||1,side=((H0.x-P.x[best])*-vy+(H0.y-P.y[best])*vx)>=0?1:-1,gx=-vy/L*side,gy=vx/L*side;
  let wx=(gx/27+gy/13.5)/2,wy=(gy/13.5-gx/27)/2;const wl=Math.hypot(wx,wy)||1;wx/=wl;wy/=wl;
  const b=root.__HAPIL_CONTROLS_V31329__?.binding;if(typeof b?.actions?.dash!=='function')return;m.dodgeAt=s.time+.8;
  s.simpleDodgeVectorV31368={x:wx,y:wy};s.autoDodgeBlinkDispatchV31576=true;try{b.actions.dash();metrics.dodges++;}catch(e){fail(e);}finally{delete s.simpleDodgeVectorV31368;delete s.autoDodgeBlinkDispatchV31576;}}

 // ---------------------------------------------------------------- tick
 function holdNative(s,a){const t=s.time;for(const k of HOLD)a[k]=Math.max(n(a[k]),t+.5);a.atomicCastUntil31210=Math.max(n(a.atomicCastUntil31210),t+.25);}
 // Paths the timers above do not reach (the counter-tactic 거리 사격 and heavy cleaver casts) are taken out
 // in the same tick they spawn, before any draw, so the duel stays the boss's only attack source.
 // Heavy-commitment state lives on each projectile, so dropping it leaves no ledger behind.
 function retireNative(s,a){const id=a.id;let k=0;
  const mine=q=>!!q&&q.reflected!==true&&q.friendly!==true&&(q.sourceId===id||q.sourceBossId===id||q.ownerId===id);
  // Queued native telegraphs (pendingHits/impactQueue, as the b07 dash cancel does) and the V31327 exit
  // flights, which keep a collision body, belong to the same boss ordnance.
  for(const key of ['hostileProjectiles','pendingHits','impactQueue','enemyExitFxV31327']){const L=s[key];if(!Array.isArray(L)||!L.length)continue;
   let c=0;const kept=L.filter(q=>{if(!mine(q))return true;c++;return false;});if(c){s[key]=kept;k+=c;}}
  // A retired hit must not leave its warning drawn behind.
  if(Array.isArray(s.effects)&&s.effects.length){let c=0;const kept=s.effects.filter(e=>{if(!e||e.sourceId!==id||!/telegraph/i.test(String(e.kind??'')))return true;c++;return false;});if(c){s.effects=kept;k+=c;}}
  if(k)metrics.retired+=k;return k;}
 function tick(s,dt){
  if(!s||typeof s!=='object')return;metrics.ticks++;
  let m=worlds.get(s);const a=ownerOf(s);
  if(!a){if(m&&(m.pool.live||m.ownerId!=null||m.hud)){reset(m,s);}return;}
  m=mem(s);if(m.zone!==s.zone||String(m.ownerId)!==String(a.id)){reset(m,s);m.ownerId=a.id;m.deck=deckFor(a);m.zone=s.zone;m.actAt=n(DATA().act.first,14);}
  const b=m.deck;m.now=s.time;
  if(!(n(s.hp)>0)){if(m.pool.live)cancelAll(m);return;}
  if(guest(s))return;
  holdNative(s,a);retireNative(s,a);
  if(!(dt>0)||!Number.isFinite(dt))return;dt=clamp(dt,0,.1);
  if(s.paused||s.pause||n(s.timeStopUntil)>s.time)return;
  try{if(root.__HAPIL_RC95_NATIVE__?.locked?.(s)===true)return;}catch(e){}
  m.lastX=Number.isFinite(a.x)?a.x:m.lastX;m.lastY=Number.isFinite(a.y)?a.y:m.lastY;
  // EGO wipe: the awakening's own clear also takes the duel volleys.
  const ego=n(s.awakeningUntil)>s.time;if(ego&&!m.egoOn&&m.pool.live){cancelAll(m);metrics.wipes++;m.volley=null;}m.egoOn=ego;
  m.clock+=dt;const H0=heart(s),mz=muzzle(a,m),P=m.pool,t=s.time;
  // Awakening act.
  if(m.awake>0){m.awake=Math.max(0,m.awake-dt);}
  if(m.clock>=m.actAt){m.actAt=m.clock+n(DATA().act.period,28);startAct(s,m,a,b);}
  // Cast (one volley at a time; held through native phase transitions and the intro).
  if(m.volley)m.volley.fresh=false;
  if(m.volley&&t>=m.volley.releaseEnd+AFTER)m.volley=null;
  const busy=n(a.phaseTransitionUntil)>t;
  if(!m.volley&&m.clock>=Math.max(INTRO,m.nextCast)&&!busy&&!ego)cast(s,m,a,b,mz,H0);
  // Hanging bullets follow the muzzle / re-aim until the lock .3 s before release.
  const v=m.volley;if(v&&t<v.lockAt)v.aim=Math.atan2(H0.y-mz.y,H0.x-mz.x);
  for(let i=P.live-1;i>=0;i--){
   if(t<P.hang[i]){if(v&&(P.flags[i]&F_ANCHOR))place(P,i,mz,v?v.aim:0);P.rot[i]+=P.spin[i]*dt*.35;continue;}
   if(P.vx[i]===0&&P.vy[i]===0){// release
    let th;if(P.flags[i]&F_ANCHOR||P.r[i]>0)th=(v?v.aim:Math.atan2(H0.y-P.y[i],H0.x-P.x[i]))+P.off[i];else th=Math.PI/2+P.tilt[i];
    P.vx[i]=Math.cos(th)*P.spd[i];P.vy[i]=Math.sin(th)*P.spd[i];if(P.vx[i]===0&&P.vy[i]===0)P.vy[i]=1e-3;metrics.released++;}
   P.x[i]+=P.vx[i]*dt;P.y[i]+=P.vy[i]*dt;P.rot[i]+=P.spin[i]*dt;
   if(!Number.isFinite(P.x[i])||!Number.isFinite(P.y[i])||t>P.dieAt[i]||P.x[i]<BOUND.x0||P.x[i]>BOUND.x1||P.y[i]<BOUND.y0||P.y[i]>BOUND.y1)poolRemove(P,i);}
  // Collision and graze (heart only, released bullets only, swept).
  const inv=n(s.invulnerableUntil)>t,mercy=t<m.mercyUntil,dOn=dActive(s);let contact=-1;
  for(let i=0;i<P.live;i++){if(P.hang[i]>t||t-P.hang[i]<.05)continue;const r=P.hit[i];
   const ax=P.x[i]-P.vx[i]*dt,ay=P.y[i]-P.vy[i]*dt,dx=P.x[i]-ax,dy=P.y[i]-ay,L=dx*dx+dy*dy;let u=L>1e-9?((H0.x-ax)*dx+(H0.y-ay)*dy)/L:1;u=u<0?0:u>1?1:u;
   const qx=ax+dx*u-H0.x,qy=ay+dy*u-H0.y,d=Math.sqrt(qx*qx+qy*qy);
   if(d<r+HEART_R){if(contact<0)contact=i;continue;}
   if(!(P.flags[i]&F_GRAZED)&&!mercy&&!inv&&!dOn&&d<r+HEART_R+GRAZE)graze(s,m,i);}
  if(contact>=0)onContact(s,m,a,contact);
  autoDodge(s,m,H0);
  if(m.sparks.length)m.sparks=m.sparks.filter(q=>t-q.born<.3&&t>=q.born);
  hud(m,s,a);
 }

 // ---------------------------------------------------------------- art
 const pictures=new Map(),baked=new Map();
 function picture(path){if(!path||typeof root.Image!=='function')return null;let im=pictures.get(path);if(!im){try{im=new root.Image();im.decoding='async';im.src=path;}catch(e){return null;}pictures.set(path,im);}return im.complete&&im.naturalWidth?im:null;}
 function makeCanvas(w,h){try{const d=root.document;if(d?.createElement){const c=d.createElement('canvas');c.width=w;c.height=h;return c;}}catch(e){}return null;}
 // One baked copy per sprite and rim: <= 112 px, a 2-3 px bright rim outline under the art (crisp edge on dark maps).
 function bake(path,rim,mobile){const key=path+'|'+rim+'|'+(mobile?1:0);if(baked.has(key))return baked.get(key);const im=picture(path);if(!im)return null;
  const S=mobile?96:112,pad=4,k=(S-2*pad)/Math.max(im.naturalWidth,im.naturalHeight),w=Math.max(1,Math.round(im.naturalWidth*k)),h=Math.max(1,Math.round(im.naturalHeight*k));
  const c=makeCanvas(w+2*pad,h+2*pad),t=makeCanvas(w+2*pad,h+2*pad);if(!c||!t){baked.set(key,im);return im;}
  try{const g=t.getContext('2d'),o=c.getContext('2d');if(!g||!o){baked.set(key,im);return im;}
   g.drawImage(im,pad,pad,w,h);g.globalCompositeOperation='source-in';g.fillStyle=rim;g.fillRect(0,0,w+2*pad,h+2*pad);
   const r=mobile?2.5:2;for(let j=0;j<8;j++){const th=j*TAU/8;o.drawImage(t,Math.cos(th)*r,Math.sin(th)*r);}
   o.drawImage(im,pad,pad,w,h);metrics.bakes++;}catch(e){fail(e);baked.set(key,im);return im;}
  if(baked.size>24)baked.delete(baked.keys().next().value);baked.set(key,c);return c;}

 // ---------------------------------------------------------------- draw (world layer, G-space)
 function draw(ctx,s,set){if(!enabledFlag||!ctx||!s)return;const m=worlds.get(s);if(!m||!m.deck||(!m.pool.live&&!m.sparks.length))return;if(m.zone!==s.zone)return;
  const P=m.pool,b=m.deck,t=n(s.time),low=!!set?.lowFx,quiet=!!set?.reducedFlash,list=m.sprites;
  ctx.save();try{ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.shadowBlur=0;
   const v=m.volley;
   for(let i=0;i<P.live;i++){const x=P.x[i],y=P.y[i];if(!Number.isFinite(x)||!Number.isFinite(y))continue;const hanging=t<P.hang[i];
    const img=bake(list[P.kind[i]],b.rim,m.mobile),size=P.size[i];
    let th;if(hanging)th=(P.flags[i]&F_ANCHOR||P.r[i]>0)?(v?v.aim:0)+P.off[i]:Math.PI/2+P.tilt[i];else th=Math.atan2(P.vy[i],P.vx[i]);
    const dirSprite=P.spin[i]===0,alpha=hanging?clamp((t-P.born[i])/MAT,0,1)*.9:1;
    if(hanging){// telegraph: a short rim-coloured lane mark (>= .3 s before any release)
     ctx.globalAlpha=alpha*(quiet?.4:.6);ctx.strokeStyle=b.rim;ctx.lineWidth=low?1.5:2;if(t<(v?.lockAt??0))ctx.setLineDash([5,5]);else ctx.setLineDash([]);
     ctx.beginPath();ctx.arc(x,y,size*.46,0,TAU);ctx.stroke();// inert halo: hanging, not yet harmful
     ctx.beginPath();ctx.moveTo(x+Math.cos(th)*size*.3,y+Math.sin(th)*size*.3);ctx.lineTo(x+Math.cos(th)*size*1.15,y+Math.sin(th)*size*1.15);ctx.stroke();ctx.setLineDash([]);}
    if(img){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,k=size/Math.max(1,iw,ih);const grow=hanging?.6+.4*clamp((t-P.born[i])/MAT,0,1):1;ctx.globalAlpha=alpha;ctx.save();ctx.translate(x,y);ctx.rotate(dirSprite?th:P.rot[i]);ctx.scale(grow,grow);ctx.drawImage(img,-iw*k/2,-ih*k/2,iw*k,ih*k);ctx.restore();}
    // White-hot hitbox core: the art is larger than what hurts.
    ctx.globalAlpha=alpha*.85;ctx.fillStyle=b.core;ctx.beginPath();ctx.arc(x,y,Math.max(2,P.hit[i]*.3),0,TAU);ctx.fill();
    metrics.draws++;}
   if(!low)for(const q of m.sparks){const age=t-q.born;if(age<0||age>.3)continue;ctx.globalAlpha=(1-age/.3)*(quiet?.35:.7);ctx.strokeStyle=b.rim;ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,q.size*(.25+age*1.6),0,TAU);ctx.stroke();}
  }catch(e){fail(e);}finally{ctx.restore();}}

 // ---------------------------------------------------------------- HUD overlay (grade + portrait card)
 // A transparent sibling canvas of .game-stage > canvas (the stage hides every
 // non-canvas child), like the RC142 persona HUD overlay. CSS-pixel backing store
 // (dpr <= 1.5), redrawn at <= 10 Hz while an act runs, emptied (0x0) after it.
 function rgbOf(hex){const v=parseInt(String(hex).slice(1),16);return [v>>16&255,v>>8&255,v&255].join(',');}
 function hudHide(m){const h=m.hud;if(!h)return;try{h.canvas.style.opacity='0';h.visible=false;h.key='';if(h.canvas.width||h.canvas.height){h.canvas.width=0;h.canvas.height=0;}}catch(e){}}
 function hud(m,s,a){const on=!!(s&&a&&m.awake>0);if(!on){hudHide(m);return;}
  const d=root.document;if(!d?.querySelector)return;
  try{const game=d.querySelector('.game-stage > canvas:not(.rc241-duel-hud)');if(!game?.parentElement)return;let h=m.hud;
   if(!h||h.game!==game||!h.canvas.isConnected){if(h?.canvas?.parentNode)h.canvas.remove();const c=d.createElement('canvas');c.className='rc241-duel-hud';c.setAttribute('aria-hidden','true');c.dataset.rc241Duel='true';
    c.style.cssText='position:absolute;pointer-events:none;z-index:3;opacity:0;transition:opacity .35s ease-out';game.parentElement.appendChild(c);h=m.hud={canvas:c,game,key:'',visible:false};}
   const W=game.offsetWidth|0,Hh=game.offsetHeight|0;if(!(W>0&&Hh>0))return;const k=Math.min(1.5,Math.max(1,n(root.devicePixelRatio,1))),cw=Math.round(W*k),ch=Math.round(Hh*k);
   const st=h.canvas.style,geo=game.offsetLeft+':'+game.offsetTop+':'+W+':'+Hh;if(h.geo!==geo){h.geo=geo;st.left=game.offsetLeft+'px';st.top=game.offsetTop+'px';st.width=W+'px';st.height=Hh+'px';}
   const quiet=!!settingsNow()?.reducedFlash,b=m.deck,slot=root.__HAPIL_SAMONG_RC91__?.active?.(s)===true?1:0,secs=Math.max(0,m.awake).toFixed(1),key=[secs,cw,ch,quiet,slot,b.name].join('|');
   if(h.key===key){if(!h.visible){h.visible=true;st.opacity='1';}return;}h.key=key;
   if(h.canvas.width!==cw)h.canvas.width=cw;if(h.canvas.height!==ch)h.canvas.height=ch;const g=h.canvas.getContext('2d');if(!g)return;
   g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,W,Hh);
   // Edge grade in the boss colour; the centre (bullets, hero) stays clear.
   const rgb=rgbOf(b.grade),peak=quiet?.26:.46,grad=g.createRadialGradient(W/2,Hh*.56,Math.min(W,Hh)*.34,W/2,Hh*.56,Math.hypot(W,Hh)*.58);
   grad.addColorStop(0,'rgba('+rgb+',0)');grad.addColorStop(.55,'rgba('+rgb+','+(peak*.45).toFixed(3)+')');grad.addColorStop(1,'rgba('+rgb+','+peak+')');g.fillStyle=grad;g.fillRect(0,0,W,Hh);
   // Portrait card (RC137 card geometry, next slot when the player's awakening card is up).
   const narrow=W<600,w=narrow?64:92,ih=Math.min(narrow?96:142,Hh*.24),gap=8,x=W-12-w-slot*(w+gap+6),y=narrow?40:54;
   g.globalAlpha=.68;g.fillStyle='#080b15';g.fillRect(x-3,y-3,w+6,ih+34);g.globalAlpha=.96;
   const im=picture(b.portrait);if(im){const fit=Math.min(w/im.naturalWidth,ih/im.naturalHeight),iw=im.naturalWidth*fit,hh=im.naturalHeight*fit;g.drawImage(im,x+(w-iw)/2,y+(ih-hh)/2,iw,hh);}
   g.globalAlpha=1;g.textAlign='center';g.textBaseline='top';g.font=(narrow?'10':'12')+'px sans-serif';g.fillStyle='#ffd9c9';g.fillText(b.name,x+w/2,y+ih+3,w);g.fillText(secs+'초',x+w/2,y+ih+(narrow?15:18),w);
   if(!h.visible){h.visible=true;st.opacity='1';}}catch(e){fail(e);}}

 // ---------------------------------------------------------------- seams
 const seams={tick:null,draw:null,echo:null};let inTick=false,inDraw=false,installed=false;
 function rewrap(obj,key,fn){const d=Object.getOwnPropertyDescriptors(obj);d[key]={value:fn,enumerable:true,configurable:true,writable:true};if(!d.rc241Wrapped)d.rc241Wrapped={value:true};return Object.freeze(Object.defineProperties({},d));}
 function wrapLoop(){const lp=root.__HAPIL_LOOP_V31365__;if(!lp||typeof lp.tick!=='function')return false;if(lp.tick===seams.tick)return true;if(metrics.rewraps>=24)return true;
  const base=lp.tick;const fn=function(s,dt,...rest){if(inTick)return base.call(this,s,dt,...rest);inTick=true;let r;try{r=base.call(this,s,dt,...rest);}finally{try{tick(s,dt);}catch(e){fail(e);}finally{inTick=false;}}return r;};
  fn.rc241=true;root.__HAPIL_LOOP_V31365__=rewrap(lp,'tick',fn);seams.tick=fn;metrics.rewraps++;return true;}
 function wrapFeel(){const fe=root.__HAPIL_ENEMY_FEEL_V31361__;if(!fe||typeof fe.draw!=='function')return false;if(fe.draw===seams.draw)return true;if(metrics.rewraps>=24)return true;
  const base=fe.draw;const fn=function(ctx,s,set,layer,...rest){const r=base.call(this,ctx,s,set,layer,...rest);if(layer==='front'&&!inDraw){inDraw=true;try{draw(ctx,s,set??{});}catch(e){fail(e);}finally{inDraw=false;}}return r;};
  fn.rc241=true;root.__HAPIL_ENEMY_FEEL_V31361__=rewrap(fe,'draw',fn);seams.draw=fn;metrics.rewraps++;return true;}
 // The V31368 owner echoes (afterimage bolts / summoned children every 13 s) are
 // native ordnance too: during a duel they see the boss as still entering combat.
 function wrapEchoes(){const E=root.__HAPIL_ECHOES_V31368__;if(!E||typeof E.tick!=='function')return true;if(E.tick===seams.echo)return true;if(metrics.rewraps>=24)return true;
  const base=E.tick;const fn=function(s,dt,...rest){const a=ownerOf(s);if(!a)return base.call(this,s,dt,...rest);const had=Object.prototype.hasOwnProperty.call(a,'combatEntryGraceUntilV31239'),old=a.combatEntryGraceUntilV31239;
   a.combatEntryGraceUntilV31239=Math.max(n(old),n(s.time)+1);try{return base.call(this,s,dt,...rest);}finally{if(had)a.combatEntryGraceUntilV31239=old;else delete a.combatEntryGraceUntilV31239;}};
  fn.rc241=true;root.__HAPIL_ECHOES_V31368__=rewrap(E,'tick',fn);seams.echo=fn;metrics.rewraps++;return true;}
 function install(){if(installed)return true;try{if(!wrapLoop()||!wrapFeel())return false;wrapEchoes();}catch(e){fail(e);return false;}installed=true;api.installed=true;metrics.installs++;try{root.setInterval?.(recheck,1000);}catch(e){}return true;}
 function recheck(){try{if(installed){wrapLoop();wrapFeel();wrapEchoes();}}catch(e){fail(e);}}

 // ---------------------------------------------------------------- API
 function snapshot(s){const m=s&&worlds.get(s);if(!m)return null;const P=m.pool,t=n(s?.time);let hanging=0;for(let i=0;i<P.live;i++)if(P.hang[i]>t)hanging++;
  return {zone:m.zone,owner:m.ownerId,live:P.live,hanging,cap:P.cap,clock:m.clock,cycle:m.cycle,awake:m.awake,acts:m.acts,nextAct:m.actAt,volley:m.volley?{...m.volley}:null,grazes:m.graze.count,mobile:m.mobile};}
 const api={version:VERSION,installed:false,
  enabled:()=>enabledFlag,
  setEnabled(v){enabledFlag=!!v;try{root.localStorage?.setItem?.(STORE,enabledFlag?'on':'off');}catch(e){}return enabledFlag;},
  deckFor,owns,framed,tick,draw,snapshot,
  cancelAll(s){const m=s&&worlds.get(s);if(!m)return 0;const k=m.pool.live;cancelAll(m);return k;},
  live:s=>worlds.get(s)?.pool.live??0,
  metrics:()=>({...metrics,enabled:enabledFlag,installed,lastError}),
  __test:{install,recheck,mem:s=>worlds.get(s),pool:s=>worlds.get(s)?.pool??null,capFor,formation,bake,seams,worlds,heart,muzzle}};
 root.__HAPIL_BOSS_DUEL_RC241__=api;
 let attempts=0;(function ready(){if(!install()&&++attempts<1200)root.setTimeout?.(ready,10);})();
})(typeof window==='object'?window:globalThis);
