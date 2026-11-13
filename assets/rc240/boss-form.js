/* RC240 boss form: weak-point parts, one-way two-stage transformation, stage
 * title card, Michaela heart basic shot, last302 canon display names and the
 * hexagram replacement of cross shapes/text. Original procedural visuals only.
 *
 * Seams (all call-through, all guarded):
 *  - __HAPIL_LOOP_V31365__.afterHit(s,target,raw,applied,source): the native
 *    outgoing-damage boundary (combat-v31412/outgoing-native.js) calls it once
 *    per resolved hero strike with the HP actually removed. A share of that
 *    amount is COPIED onto the part nearest the hero's shot lane. Boss HP is
 *    never changed here, so time-to-kill is unchanged by parts.
 *  - __HAPIL_LOOP_V31365__.render(ctx,s,set,'front'): world-space overlay.
 *  - __HAPIL_RC86_BRIDGE__.phaseSprite (MONGSE_phaseSpriteForRender setter):
 *    the single boss body sprite choice; second form is a render-only floor.
 *  - Image cache (binding.cache.current[path]): michaela-a and cross sprites
 *    resolve to baked heart / hexagram images.
 * Story mode only for parts, transformation, title card and last302 names.
 * Nothing is saved; the only game fields written are display names.
 */
(function(root){'use strict';
 if(root.__HAPIL_BOSS_FORM_RC240__)return;
 const VERSION='RC240-boss-form-1';
 const n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d,clamp=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2;
 const PART_HP=.08,PART_SHARE=.35,TRANSFORM_AT=.5,TRANSFORM_DUR=1.2,TITLE_DUR=1.8,POOL_CAP=160,POOL_CAP_MOBILE=96;
 const WHITE_PEAK=.55,WHITE_PEAK_REDUCED=.18;
 const metrics={installs:0,ticks:0,parts:0,partHits:0,breaks:0,bursts:0,transforms:0,cancels:0,titles:0,renames:0,seeds:0,draws:0,drawMs:0,rewraps:0,errors:0};
 let lastError=null;
 function fail(e){metrics.errors++;lastError=String(e&&e.stack||e).slice(0,300);if(metrics.errors<=3)root.console?.warn?.('RC240 boss-form',e);}
 const now=()=>root.performance?.now?.()??Date.now();

 // ---------------------------------------------------------------- flags
 let enabledFlag=true,installed=false;
 (function initFlags(){try{const q=String(root.location?.search??'');const qa=/[?&]qa(=|&|$)/.test(q);
  if(/[?&]rc240=0/.test(q))enabledFlag=false;else if(qa&&!/[?&]rc240=1/.test(q))enabledFlag=false;}catch(e){}})();

 // ---------------------------------------------------------------- data
 // Korean region names, copied from the game's zone table (bundle MONGSE_ZONE_DISPLAY_NAMES31222).
 const ZONE_NAMES=Object.freeze({hub:'악마가 점령한 세계',dist01:'거미동굴',dist02:'검은 늪지대',dist03:'무너진 성',dist04:'시체들이 되살아난 밤',dist05:'일곱 검은 기둥',dist06:'지옥의 소환진',ep1a07:'추락의 소용돌이',ep1a08:'피로 물든 병원',ep1a09:'주사실',ep1a10:'환자의 격리구역',ep1a11:'천사의 가면',dreamRest:'추락 이후의 경계',ep1b01:'솔로몬의 봉인식',ep1b02:'나태의 집',ep1b03:'금이 간 안경',ep1b04:'탐식의 주방',ep1b05:'붉은 하이힐',ep1b06:'맘몬의 금고',ep1b06b:'맘몬의 설원 금고',ep1b07:'불을 지른 남자',ep1b08:'하늘에 서려는 자',ep1b09:'생체 부트로더',restEp1b:'사라진 귀환자의 쉼터',u201:'통제자의 17단계',u202:'잔인한 구원',u204:'시스템의 거부권',u205:'관리자 권한',u206:'중앙 코어 이주실',u203:'통제자의 기억문',restU2:'융합몽세 전초기지',last304:'중립 지역의 재각성',last305:'고블린 피리숲',last301:'타락천사 흑해',last302:'잠들지 못하는 마을',last303:'불면귀의 검은 안개',restLast3:'카이로노미콘 관측소',kair01:'최초명령 아카데미움',kair04:'수문장 폐허',kair05:'시간의 숲',kair06:'오염된 수로',kair07:'검은 공방',kair08:'뉴런 게이트',kair09:'망각의 묘지',kair10:'붕괴 의식장',kair02:'아르벨리아 봉인 회랑',kair03:'세이렌의 시간 코어',restKairo:'재작성된 최초명령 정원',hando01:'소환된 성벽',hando02:'무너진 에고 성채',hando03:'주인의 권한 회랑',restHando:'막힌 시간의 쉼터',murder01:'윤하람의 교차로',murder02:'새빛호텔',murder04:'청록빌라',murder03:'순환의 옥상',cult01:'사이비합일몽세 관문',cult02:'뉴런 합창실',cult05:'융합 제단',cult06:'두 개의 목표',cult03:'삼중 에고 추출실',cult04:'합일몽세 코어',village:'완료된 꿈의 마을'});
 const NON_COMBAT=/^(hub|village|dreamRest|rest[A-Z0-9])/;
 const AN='./assets/generated-v31224/actors-normalized/';
 // Second-form art. sins: native human->demon arrays (floor at the *_demon index).
 // floor: native phase floor (2) after the window; transition: normalized art shown
 // as the body during the 1.2 s window; final: permanent body; overlay: large art
 // cross-faded over the body during the window only.
 const SIN={kind:'sins'};
 const FORMS=Object.freeze({
  'b02-boss':SIN,'b03-boss':SIN,'b04-boss':SIN,'b05-boss':SIN,'b06-boss':SIN,'b06b-boss':SIN,'b07-boss':SIN,'b08-boss':SIN,'b09-boss':SIN,'mb-ep1b01':SIN,
  'c104-boss':{kind:'floor',floor:2,overlay:'./assets/generated-v3125/boss-actions/cult_transition.webp'},
  'u203-boss':{kind:'floor',floor:2,transition:AN+'543a490d2cf2_controller_transition.webp'},
  'k103-boss':{kind:'floor',floor:2,transition:AN+'792c9e0a61b9_siren_transition.webp'},
  'h103-boss':{kind:'floor',floor:2,transition:AN+'9f29878c4e6b_hando_transition.webp'},
  'kair-great-03':{kind:'floor',floor:2,transition:AN+'44fa887e7bcc_arvelia_delay_archon_transition.webp'},
  'mb-dist01':{kind:'final',transition:AN+'d93bb825dd04_purple_sword_spider_angel_transition.webp',final:AN+'d93bb825dd04_purple_sword_spider_angel_transition.webp'},
  'l303-boss':{kind:'final',transition:AN+'de4c1414da0d_bulmyeongwi_transition.webp',final:AN+'de4c1414da0d_bulmyeongwi_transition.webp'},
  'a11-boss':{kind:'overlay',overlay:'./assets/rc223/lucifer-transform-contained.webp'},
  'blue-executor':{kind:'overlay',overlay:'./assets/generated-story10-cycle-20261005/cyclic-murder/blue_executor_charge.png'},
 });
 const NEEDS_ART=Object.freeze([
  ...['dist00-boss','dist06-boss','l305-boss','l301-boss','kair-great-01','kair-great-02','kair-great-04','kair-great-06','mb-kair09-v31231','c102-boss','c103-mid','c103-boss'].map(id=>Object.freeze({id,what:'2단 변신 그림 (현재 절차식 변신: 색조·오라·균열)'})),
  Object.freeze({id:'a11-boss',what:'가면 쓴 루시퍼 본체 그림 (masked; 현재는 가면 벗은 그림만 있음)'}),
  Object.freeze({id:'last302-mobs',what:'잠들지 못하는 마을 주민(villager) 잡몹 그림 — 합일1에 없음, m0 r763/r770 villagers 후보'}),
 ]);
 const LAST302_MIDBOSS='꼭두각시 실안개';
 // Cross audit (sprite -> verdict). All listed sprites resolve to a procedural hexagram.
 const CROSS_AUDIT=Object.freeze([
  ['./assets/generated-v3128/projectiles/pride_cross.webp','inverted','enemy'],
  ['./assets/vfx/v31323/boss/mb-ep1b01/pride_cross.webp','inverted','enemy'],
  ['./assets/vfx/v31323/boss/mb-ep1b08/ep1b08_inverted_cross_telekinesis.webp','inverted','enemy'],
  ['./assets/vfx/v31323/boss/b08-boss/ep1b08_inverted_cross_telekinesis.webp','inverted','enemy'],
  ['./assets/vfx/bosses/v3110/ep1b08_inverted_cross_telekinesis.webp','inverted','enemy'],
  ['./assets/vfx/v31323/boss/mb-ep1b08/ep1b08_pride_cross_undead_cluster.webp','inverted','enemy'],
  ['./assets/vfx/v31323/boss/b08-boss/ep1b08_pride_cross_undead_cluster.webp','inverted','enemy'],
  ['./assets/vfx/bosses/v3102/ep1b08_pride_cross_undead_cluster.webp','inverted','enemy'],
  ['./assets/vfx/v31323/boss/mb-dist04/dist04-fallen-cross.webp','tilted','violet'],
  ['./assets/vfx/bosses/v393/dist04-fallen-cross.webp','tilted','violet'],
  ['./assets/vfx/generated/v315/rian-reverse-cross-barrage.webp','upright','gold'],
  ['./assets/vfx/generated/v303/rian-reverse-cross-barrage.webp','upright','gold'],
  ['./assets/vfx/generated/v300/cross-seal.webp','upright','gold'],
 ].map(r=>Object.freeze(r)));
 const HEART=Object.freeze({path:'./assets/vfx/heroes/michaela-a.webp',sheet:'./assets/rc240/art/heart-fly8.webp',cell:256,piv:Object.freeze({x:150,y:128}),heading:Math.PI*.76,hold:true,
  note:'Dots CX-0084PJ PJ-03 heart-fly8 (m0 r96/runtime-text/assets/r948) — HOLD: needs art review before release'});

 // ---------------------------------------------------------------- text (cross -> hexagram)
 const PARTICLE={'가':'이','와':'과','를':'을','는':'은','로':'으로','라':'이라','야':'이야','여':'이여','랑':'이랑','다':'이다'};
 const RE_HANG=/거꾸로\s*매달린\s*십자가(가|와|를|는|로|라|야|여|랑|다)?/g,RE_UPSIDE=/거꾸로\s*(?:된|세워진|선)\s*십자가(가|와|를|는|로|라|야|여|랑|다)?/g;
 const RE_CROSS=/[역성]?십자가(가|와|를|는|로|라|야|여|랑|다)?/g,RE_SHORT=/[역성]십자|십자(?=\s*(?:참격|탄막|진화|돌진|방패|베기|문양|표식|창|검|포화|교차))/g;
 const tail=p=>p?PARTICLE[p]??p:'';
 function fixText(t){if(typeof t!=='string'||t.indexOf('십자')<0)return t;
  return t.replace(RE_HANG,(m,p)=>'매달린 육망성'+tail(p)).replace(RE_UPSIDE,(m,p)=>'검은 육망성'+tail(p)).replace(RE_CROSS,(m,p)=>'육망성'+tail(p)).replace(RE_SHORT,'육망성');}
 const textFixed=new WeakSet();
 function fixActorText(a){if(!a||typeof a!=='object'||textFixed.has(a))return;textFixed.add(a);
  try{for(const k of ['name','eliteName','displayName','title']){const v=a[k];if(typeof v==='string'&&v.indexOf('십자')>=0){a[k]=fixText(v);metrics.renames++;}}
   if(Array.isArray(a.phaseNames)&&a.phaseNames.some(v=>typeof v==='string'&&v.indexOf('십자')>=0)){a.phaseNames=a.phaseNames.map(fixText);metrics.renames++;}}catch(e){fail(e);}}
 function patchStaticTexts(){const B=root.__HAPIL_RC86_BRIDGE__;
  try{for(const z of [...Object.keys(ZONE_NAMES),'dist00'])for(const a of B?.zoneActors?.(z)??[])fixActorText(a);}catch(e){fail(e);}
  try{const rows=root.__HAPIL_NARRATION_DISPLAY_DATA_RC139__?.rows;if(Array.isArray(rows))for(const r of rows)if(r&&typeof r.display==='string'&&r.display.indexOf('십자')>=0){r.display=fixText(r.display);metrics.renames++;}}catch(e){fail(e);}}
 let textHooks=false;
 function installTextHooks(){if(textHooks)return;textHooks=true;
  try{const P=root.CanvasRenderingContext2D?.prototype;if(P&&!P.fillText?.rc240BossForm){for(const k of ['fillText','strokeText']){const base=P[k];if(typeof base!=='function')continue;
    const fn=function(t,...r){return base.call(this,enabledFlag&&typeof t==='string'&&t.indexOf('십자')>=0?fixText(t):t,...r);};fn.rc240BossForm=true;P[k]=fn;}}}catch(e){fail(e);}
  try{const d=root.document,MO=root.MutationObserver;if(!d?.body||typeof MO!=='function')return;
   const fixNode=node=>{if(!enabledFlag||!node)return;if(node.nodeType===3){const v=node.nodeValue;if(v&&v.indexOf('십자')>=0){node.nodeValue=fixText(v);metrics.renames++;}return;}
    if(node.nodeType===1&&(node.textContent??'').indexOf('십자')>=0){const w=d.createTreeWalker(node,4);let x;while((x=w.nextNode()))fixNode(x);}};
   fixNode(d.body);
   new MO(list=>{for(const m of list){if(m.type==='characterData')fixNode(m.target);else for(const a of m.addedNodes)fixNode(a);}}).observe(d.body,{subtree:true,childList:true,characterData:true});}catch(e){fail(e);}}

 // ---------------------------------------------------------------- environment
 function binding(){try{return root.__HAPIL_CONTROLS_V31329__?.binding??null;}catch(e){return null;}}
 function currentState(){try{return binding()?.state?.current??root.__MONGSE_QA_STATE__??null;}catch(e){return null;}}
 function settingsNow(){try{return binding()?.settings?.current??{};}catch(e){return {};}}
 function mobile(){try{return n(root.innerWidth,1280)<800||root.__HAPIL_COMBAT_RC47__?.mobile?.()===true;}catch(e){return false;}}
 function modeOf(s){try{const g=root.__HAPIL_GRAMMAR_V31365__;if(typeof g?.mode==='function')return g.mode(s);}catch(e){}return s?.gameModeV31346??(s?.hellModeV31322?'HELL':'STORY');}
 function story(s){return !!s&&modeOf(s)==='STORY'&&!s.practicePatternV31365&&!s.practiceV31329;}
 function combatZone(z){if(typeof z!=='string'||NON_COMBAT.test(z))return false;try{const rows=root.__HAPIL_RC86_BRIDGE__?.zoneActors?.(z);return Array.isArray(rows)&&rows.length>0;}catch(e){return false;}}
 const P0={x:0,y:0};
 function project(x,y,out){try{const p=root.__HAPIL_RC86_BRIDGE__?.project?.(x,y);if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){out.x=p.x;out.y=p.y;return true;}}catch(e){}return false;}
 function heroLaneY(s){try{const c=root.__HAPIL_COMBAT_V31333__?.core?.(s);if(c&&Number.isFinite(c.y))return c.y;}catch(e){}return project(n(s.x),n(s.y),P0)?P0.y-42:360;}
 function owner(a){return !!a&&n(a.hp)>0&&(a.boss||a.midboss)&&!a.visualOnly&&!a.friendly&&!a.rc88Part&&!a.echoChild;}

 // ---------------------------------------------------------------- per-world state
 const worlds=new WeakMap();
 function pool(cap){return {cap,live:0,x:new Float32Array(cap),y:new Float32Array(cap),vx:new Float32Array(cap),vy:new Float32Array(cap),age:new Float32Array(cap),life:new Float32Array(cap),hue:new Uint8Array(cap)};}
 function fresh(s){return {zone:s.zone,list:[],byId:new Map(),card:null,pool:pool(mobile()?POOL_CAP_MOBILE:POOL_CAP),lastT:n(s.time),rng:0x2545f491};}
 function W(s){let w=worlds.get(s);if(!w){w=fresh(s);worlds.set(s,w);}return w;}
 function rnd(w){w.rng^=w.rng<<13;w.rng^=w.rng>>>17;w.rng^=w.rng<<5;return ((w.rng>>>0)%100000)/100000;}
 const PART_OFFSETS=[{x:-24,y:-46},{x:-34,y:36}];
 function makeBoss(a){const cfg=FORMS[a.id]??null;const maxHp=Math.max(1,n(a.maxHp,n(a.hp,1)));
  const b={id:a.id,actor:a,boss:!!a.boss,midboss:!a.boss&&!!a.midboss,cfg,stage:0,at:-1,floor:0,procedural:false,ax:0,ay:0,anchorOk:false,proxy:null,proxyFor:null,
   parts:a.boss?PART_OFFSETS.map((o,i)=>({index:i,ox:o.x,oy:o.y,hp:maxHp*PART_HP,maxHp:maxHp*PART_HP,broken:false,sx:0,sy:0,flash:-9})):[]};
  if(b.parts.length)metrics.parts+=b.parts.length;return b;}
 function bossOf(s,a){const w=W(s);let b=w.byId.get(a.id);if(!b){b=makeBoss(a);w.byId.set(a.id,b);w.list.push(b);}b.actor=a;return b;}
 function placeBoss(b){const a=b.actor;if(project(n(a.x,NaN),n(a.y,NaN),P0)){b.ax=P0.x;b.ay=P0.y+(b.boss?-120:-70);b.anchorOk=true;}else if(!b.anchorOk){b.ax=900;b.ay=320;}
  for(const p of b.parts){p.sx=b.ax+p.ox;p.sy=b.ay+p.oy;}}

 // ---------------------------------------------------------------- particles (pooled)
 function burst(s,x,y,count,hue=0){const w=W(s),P=w.pool;x=n(x,640);y=n(y,360);const k=Math.max(0,Math.min(n(count,0)|0,P.cap));
  for(let j=0;j<k;j++){let i=P.live;if(i>=P.cap){i=(w.rng>>>0)%P.cap;}else P.live++;const ang=rnd(w)*TAU,sp=60+rnd(w)*220;
   P.x[i]=x;P.y[i]=y;P.vx[i]=Math.cos(ang)*sp;P.vy[i]=Math.sin(ang)*sp-40;P.age[i]=0;P.life[i]=.35+rnd(w)*.45;P.hue[i]=hue;}
  metrics.bursts++;return k;}
 function stepPool(w,dt){const P=w.pool;for(let i=0;i<P.live;){P.age[i]+=dt;if(P.age[i]>=P.life[i]){const j=--P.live;if(i!==j){P.x[i]=P.x[j];P.y[i]=P.y[j];P.vx[i]=P.vx[j];P.vy[i]=P.vy[j];P.age[i]=P.age[j];P.life[i]=P.life[j];P.hue[i]=P.hue[j];}continue;}
  P.x[i]+=P.vx[i]*dt;P.y[i]+=P.vy[i]*dt;P.vy[i]+=260*dt;P.vx[i]*=.985;i++;}}

 // ---------------------------------------------------------------- simulation
 function nativePhase(a){const r=Math.max(0,n(a.hp)/Math.max(1,n(a.maxHp,1))),cnt=Math.max(1,n(a.phaseCount,a.boss?3:1));
  if(a.humanPhase0){const th=Array.isArray(a.phaseThresholds)?a.phaseThresholds:cnt>=4?[.78,.56,.31]:[.7,.36];let i=0;for(;i<th.length&&r<=th[i];i++);return Math.max(0,Math.min(n(a.phaseMax,cnt-1),i));}
  return cnt<=1?1:cnt===2?(r<=.5?2:1):(r<=.33?3:r<=.66?2:1);}
 function floorFor(b){const a=b.actor,c=b.cfg;if(!c)return 0;if(c.kind==='sins'){const ps=Array.isArray(a.phaseSprites)?a.phaseSprites:[];let i=ps.findIndex(p=>/_demon\b|_demon\./.test(String(p)));if(i<1)i=ps.length-1;return Math.max(1,i);}
  return c.kind==='floor'?Math.max(1,n(c.floor,2)):0;}
 function transform(s,b){b.stage=1;b.at=n(s.time);b.floor=floorFor(b);b.procedural=!b.cfg;metrics.transforms++;
  burst(s,b.ax,b.ay,mobile()?18:36,2);
  try{const r=root.__HAPIL_DANMAKU_RC240__;if(typeof r?.cancelAll==='function'){r.cancelAll(s,'wipe',b.ax,b.ay);metrics.cancels++;}}catch(e){fail(e);}}
 function breakPart(s,b,p){p.broken=true;p.hp=0;metrics.breaks++;burst(s,p.sx,p.sy,mobile()?14:28,1);
  try{const f=root.__HAPIL_STG_FEEL_RC240__;if(typeof f?.dropPower==='function')f.dropPower(s,p.sx,p.sy,2);if(typeof f?.dropCoins==='function')f.dropCoins(s,p.sx,p.sy,6);}catch(e){fail(e);}}
 function tick(s,dt){if(!enabledFlag||!s||typeof s!=='object')return;metrics.ticks++;dt=clamp(n(dt,0),0,.1);
  let w=worlds.get(s);
  if(!w||w.zone!==s.zone){const prev=w?.zone;w=fresh(s);worlds.set(s,w);if(prev!==s.zone&&story(s)&&combatZone(s.zone)){const text=ZONE_NAMES[s.zone];if(text){w.card={zone:s.zone,text,born:n(s.time),until:n(s.time)+TITLE_DUR};metrics.titles++;}}}
  const list=s.enemies;
  if(Array.isArray(list))for(let i=0;i<list.length;i++){const a=list[i];if(a&&!textFixed.has(a))fixActorText(a);}
  stepPool(w,dt);
  if(w.card&&n(s.time)>=w.card.until)w.card=null;
  if(!story(s)){w.card=null;return;}
  if(!Array.isArray(list))return;
  for(let i=0;i<list.length;i++){const a=list[i];if(!a)continue;
   if(s.zone==='last302'&&typeof a.id==='string'&&a.id.startsWith('mb-last302')&&a.name!==LAST302_MIDBOSS){a.name=LAST302_MIDBOSS;metrics.renames++;}
   if(!owner(a))continue;const b=bossOf(s,a);placeBoss(b);
   if(b.stage===0&&(b.boss||b.cfg)&&n(a.hp)/Math.max(1,n(a.maxHp,1))<=TRANSFORM_AT)transform(s,b);}
  if(seedTick++%30===0)seedCurrent();}
 function afterHit(s,target,raw,applied,source){if(!enabledFlag||!story(s)||!target?.boss)return;const amt=n(applied,0);if(!(amt>0))return;
  const w=worlds.get(s);const b=w?.byId.get(target.id);if(!b||!b.parts.length)return;
  const lane=heroLaneY(s);let best=null,bd=Infinity;for(const p of b.parts){if(p.broken)continue;const d=Math.abs(p.sy-lane);if(d<bd){bd=d;best=p;}}
  if(!best)return;best.hp-=amt*PART_SHARE;best.flash=n(s.time);metrics.partHits++;if(best.hp<=0)breakPart(s,b,best);}

 // ---------------------------------------------------------------- baked images
 function canvas(wd,ht){const d=root.document;if(!d?.createElement)return null;const c=d.createElement('canvas');c.width=wd;c.height=ht;return c;}
 function heartPath(g,x,y,r){g.beginPath();g.moveTo(x,y+r*.9);g.bezierCurveTo(x-r*1.5,y-r*.1,x-r*.9,y-r*1.2,x,y-r*.45);g.bezierCurveTo(x+r*.9,y-r*1.2,x+r*1.5,y-r*.1,x,y+r*.9);g.closePath();}
 function bakeHeartProcedural(){const c=canvas(256,256);const g=c?.getContext?.('2d');if(!g)return null;
  g.translate(128,128);g.rotate(HEART.heading);
  for(let i=0;i<4;i++){g.globalAlpha=.18+.1*i;g.fillStyle=i%2?'#ffb3cf':'#ff5c93';g.beginPath();g.ellipse?.(-58-i*14,(i%2?8:-8),16-i*2,7,0,0,TAU);g.fill();}
  g.globalAlpha=1;g.fillStyle='#d9235f';heartPath(g,4,4,46);g.fill();g.fillStyle='#ff5c93';heartPath(g,4,2,38);g.fill();g.fillStyle='#ffd6e6';heartPath(g,-4,-6,18);g.fill();
  g.lineWidth=3;g.strokeStyle='#ffffff';heartPath(g,4,4,46);g.stroke();return c;}
 function bakeHeartFromSheet(img){const c=canvas(256,256);const g=c?.getContext?.('2d');if(!g)return null;g.translate(128,128);g.rotate(HEART.heading);g.scale(.92,.92);
  g.drawImage(img,0,0,HEART.cell,HEART.cell,-HEART.piv.x,-HEART.piv.y,HEART.cell,HEART.cell);return c;}
 const HEX_COL={enemy:['#ff3b5c','#ffd0d8'],violet:['#a65cff','#efe0ff'],gold:['#ffcf3f','#fff6d0']};
 function bakeHexagram(tone){const c=canvas(512,512);const g=c?.getContext?.('2d');if(!g)return null;const [main,rim]=HEX_COL[tone]??HEX_COL.enemy;
  g.translate(256,256);const R=170;const tri=(rot)=>{g.beginPath();for(let k=0;k<3;k++){const t=rot+k*TAU/3;const x=Math.cos(t)*R,y=Math.sin(t)*R;k?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();};
  const glow=g.createRadialGradient?.(0,0,20,0,0,240);if(glow){glow.addColorStop(0,main);glow.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.35;g.fillStyle=glow;g.beginPath();g.arc(0,0,240,0,TAU);g.fill();}
  g.globalAlpha=.55;g.fillStyle=main;tri(-Math.PI/2);g.fill();tri(Math.PI/2);g.fill();
  g.globalAlpha=1;g.lineJoin='round';g.lineWidth=16;g.strokeStyle=main;tri(-Math.PI/2);g.stroke();tri(Math.PI/2);g.stroke();
  g.lineWidth=6;g.strokeStyle=rim;tri(-Math.PI/2);g.stroke();tri(Math.PI/2);g.stroke();
  g.fillStyle=rim;g.beginPath();g.arc(0,0,22,0,TAU);g.fill();return c;}
 function toImage(c,mark){const I=root.Image;if(!c||typeof I!=='function')return null;const im=new I();try{im.decoding='sync';}catch(e){}im[mark]=true;try{im.src=c.toDataURL('image/png');}catch(e){fail(e);return null;}return im;}
 let heartImage=null,sheetLoading=false;const hexImages=new Map();
 function heart(){if(!heartImage){heartImage=toImage(bakeHeartProcedural(),'rc240Heart');
   if(heartImage&&!sheetLoading&&typeof root.Image==='function'&&root.document?.body){sheetLoading=true;try{const sh=new root.Image();sh.onload=()=>{try{const c=bakeHeartFromSheet(sh);if(c)heartImage.src=c.toDataURL('image/png');heartImage.rc240HeartSheet=true;}catch(e){fail(e);}};sh.src=HEART.sheet;}catch(e){fail(e);}}}
  return heartImage;}
 function hex(tone){let im=hexImages.get(tone);if(!im){im=toImage(bakeHexagram(tone),'rc240Hexagram');if(im)hexImages.set(tone,im);}return im;}
 const keyVariants=p=>[p,p.slice(2)];
 function seedImages(cache){if(!enabledFlag||!cache||typeof cache!=='object')return 0;let k=0;
  try{const h=heart();if(h)for(const p of keyVariants(HEART.path))if(cache[p]!==h){cache[p]=h;k++;}
   for(const [p,,tone] of CROSS_AUDIT){const im=hex(tone);if(im)for(const q of keyVariants(p))if(cache[q]!==im){cache[q]=im;k++;}}}catch(e){fail(e);}
  if(k)metrics.seeds+=k;return k;}
 let seedTick=0;function seedCurrent(){try{seedImages(binding()?.cache?.current);}catch(e){fail(e);}}

 // ---------------------------------------------------------------- render
 let partSprite=null,auraSprite=null,crackSprite=null;
 function sprites(){if(partSprite!==null)return;partSprite=canvas(64,64);auraSprite=canvas(256,256);crackSprite=canvas(160,200);
  try{let g=partSprite?.getContext?.('2d');if(g){const gr=g.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'#ffffff');gr.addColorStop(.35,'#ffe27a');gr.addColorStop(.7,'rgba(255,90,60,.55)');gr.addColorStop(1,'rgba(255,60,40,0)');g.fillStyle=gr;g.beginPath();g.arc(32,32,30,0,TAU);g.fill();g.lineWidth=2;g.strokeStyle='#fff6c8';g.beginPath();g.arc(32,32,11,0,TAU);g.stroke();}
   g=auraSprite?.getContext?.('2d');if(g){const gr=g.createRadialGradient(128,128,10,128,128,126);gr.addColorStop(0,'rgba(255,40,80,.55)');gr.addColorStop(.5,'rgba(140,20,90,.3)');gr.addColorStop(1,'rgba(40,0,40,0)');g.fillStyle=gr;g.beginPath();g.arc(128,128,126,0,TAU);g.fill();}
   g=crackSprite?.getContext?.('2d');if(g){g.strokeStyle='#ffe3f0';g.lineWidth=2.2;g.lineCap='round';const seeds=[[80,40,1],[60,90,-1],[100,120,1],[70,150,-1]];
    for(const [x,y,d] of seeds){g.beginPath();g.moveTo(x,y);g.lineTo(x+14*d,y+16);g.lineTo(x+4*d,y+30);g.lineTo(x+20*d,y+44);g.moveTo(x+14*d,y+16);g.lineTo(x+30*d,y+20);g.stroke();}}}catch(e){fail(e);}}
 const overlayImages=new Map();
 function overlayImage(path){const cache=binding()?.cache?.current;let im=cache?.[path]??overlayImages.get(path);if(!im&&typeof root.Image==='function'){im=new root.Image();im.src=path;overlayImages.set(path,im);}return im&&im.complete&&im.naturalWidth>0?im:null;}
 // The battle base renders inside a no-text presentation context (bundle B:37126) that
 // shadows ctx.fillText; the one-line stage title is the brief's allowed exception.
 function hudText(ctx,t,x,y){const f=Object.getPrototypeOf(ctx)?.fillText;if(typeof f==='function')f.call(ctx,t,x,y);else ctx.fillText?.(t,x,y);}
 function render(ctx,s,set){if(!enabledFlag||!ctx||!s)return;const w=worlds.get(s);if(!w)return;const t0=now();metrics.draws++;set=set??{};
  const t=n(s.time),reduced=!!set.reducedFlash,low=!!set.lowFx;sprites();let white=0;
  ctx.save();try{
   for(let i=0;i<w.list.length;i++){const b=w.list[i];const a=b.actor;if(!a||n(a.hp)<=0||!story(s))continue;
    // weak points
    for(let j=0;j<b.parts.length;j++){const p=b.parts[j];if(p.broken)continue;const x=n(p.sx,b.ax),y=n(p.sy,b.ay),hit=t-p.flash<.08,pul=.85+.15*Math.sin(t*6+p.index*2);
     ctx.globalCompositeOperation='lighter';ctx.globalAlpha=hit?1:.8*pul;if(partSprite)ctx.drawImage(partSprite,x-20,y-20,40,40);
     ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.9;ctx.lineWidth=2.5;ctx.strokeStyle=hit?'#ffffff':'#ffd25a';ctx.beginPath();ctx.arc(x,y,16,-Math.PI/2,-Math.PI/2+TAU*clamp(p.hp/Math.max(1,p.maxHp),0,1));ctx.stroke();}
    if(b.stage<1)continue;const u=(t-b.at)/TRANSFORM_DUR;
    if(u>=0&&u<1){// shockwave ring + overlay art + white-out pulse
     const R=40+460*u;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-u)*(reduced?.4:.9);ctx.lineWidth=Math.max(1,10*(1-u));ctx.strokeStyle='#fff3fa';ctx.beginPath();ctx.arc(b.ax,b.ay+40,R,0,TAU);ctx.stroke();
     const ov=b.cfg?.overlay?overlayImage(b.cfg.overlay):null;if(ov){const h=260,wd=h*ov.naturalWidth/Math.max(1,ov.naturalHeight);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=clamp(Math.sin(Math.PI*u)*1.4,0,1);ctx.drawImage(ov,b.ax-wd/2,b.ay+120-h,wd,h);}
     if(u<.4)white=Math.max(white,Math.sin(Math.PI*u/.4));}
    if(b.procedural&&u>=0){const k=clamp(u*2,0,1),pul=.75+.25*Math.sin(t*3.2);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(reduced?.5:.85)*k*pul;if(auraSprite)ctx.drawImage(auraSprite,b.ax-130,b.ay-120,260,280);
     ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.9*k;if(crackSprite)ctx.drawImage(crackSprite,b.ax-80,b.ay-90,160,200);
     ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.32*k;ctx.fillStyle='#b0306a';ctx.beginPath();ctx.ellipse?.(b.ax,b.ay+20,62,108,0,0,TAU);ctx.fill();}}
   // particles
   const P=w.pool;if(P.live){ctx.globalCompositeOperation='lighter';for(let i=0;i<P.live;i++){const f=1-P.age[i]/P.life[i];ctx.globalAlpha=clamp(f,0,1);ctx.fillStyle=P.hue[i]===1?'#ffe27a':P.hue[i]===2?'#ffd6f0':'#ffffff';const r=2+3*f;ctx.fillRect(P.x[i]-r,P.y[i]-r,r*2,r*2);}}
   // screen space: white-out and title card
   const cv=ctx.canvas,cw=n(cv?.width,1280),ch=n(cv?.height,720),sk=cw/1280;
   ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';
   if(white>0){ctx.globalAlpha=clamp(white*(reduced?WHITE_PEAK_REDUCED:WHITE_PEAK),0,1);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,cw,ch);}
   const c=w.card;if(c&&t<c.until){const age=t-c.born,a=clamp(Math.min(age/.25,(c.until-t)/.35),0,1),bw=cw*.62,bh=34*sk,bx=(cw-bw)/2,by=ch*.66;
    ctx.globalAlpha=.62*a;ctx.fillStyle='#0b0612';ctx.fillRect(bx,by,bw,bh);
    ctx.globalAlpha=.9*a;ctx.fillStyle='#e8c46a';ctx.fillRect(bx+bw*.1,by,bw*.8,Math.max(1,1.5*sk));ctx.fillRect(bx+bw*.1,by+bh-Math.max(1,1.5*sk),bw*.8,Math.max(1,1.5*sk));
    ctx.globalAlpha=a;ctx.fillStyle='#fff7e6';ctx.font=`600 ${Math.round(20*sk)}px "Noto Serif KR","Nanum Myeongjo",serif`;ctx.textAlign='center';ctx.textBaseline='middle';hudText(ctx,c.text,cw/2,by+bh/2+1);}
  }catch(e){fail(e);}finally{ctx.restore();}
  metrics.drawMs=metrics.drawMs*.9+(now()-t0)*.1;}

 // ---------------------------------------------------------------- seams
 const seams={afterHit:null,render:null,loop:null,sprite:null};let inHit=false,inRender=false,inSprite=false;
 function wrapLoop(){const lp=root.__HAPIL_LOOP_V31365__;if(!lp||typeof lp.afterHit!=='function'||typeof lp.render!=='function')return false;
  if(lp.afterHit===seams.afterHit&&lp.render===seams.render)return true;if(metrics.rewraps>=24)return true;
  const next={...lp};
  if(lp.afterHit!==seams.afterHit){const base=lp.afterHit;const fn=function(s,target,raw,applied,source,...rest){if(inHit)return base.call(this,s,target,raw,applied,source,...rest);inHit=true;let r;
    try{r=base.call(this,s,target,raw,applied,source,...rest);}finally{try{afterHit(s,target,raw,applied,source);}catch(e){fail(e);}finally{inHit=false;}}return r;};fn.rc240BossForm=true;next.afterHit=fn;seams.afterHit=fn;}
  if(lp.render!==seams.render){const base=lp.render;const fn=function(ctx,s,set,layer,...rest){if(inRender)return base.call(this,ctx,s,set,layer,...rest);inRender=true;let r;
    try{r=base.call(this,ctx,s,set,layer,...rest);}finally{try{if(layer==='front')render(ctx,s,set);}catch(e){fail(e);}finally{inRender=false;}}return r;};fn.rc240BossForm=true;next.render=fn;seams.render=fn;}
  for(const k of Object.getOwnPropertyNames(lp))if(!(k in next))Object.defineProperty(next,k,Object.getOwnPropertyDescriptor(lp,k));
  if(!('rc240BossForm' in next))Object.defineProperty(next,'rc240BossForm',{value:true});
  root.__HAPIL_LOOP_V31365__=Object.freeze(next);seams.loop=root.__HAPIL_LOOP_V31365__;metrics.rewraps++;return true;}
 // Render-only view: fixedPhase is floored at the second form. The skill-cast phase
 // lock (combat-v31412 skill-completion) caches its phase on the actor; those two
 // fields live in a shadow here so the render view never writes gameplay phase.
 const SHADOW_KEYS=new Set(['skillCastPhaseV31412','skillCastPhaseLockUntilV31412']);
 function floorProxy(b,actor){if(b.proxyFor!==actor){b.proxyFor=actor;const shadow=b.shadow={};b.proxy=new Proxy(actor,{
   get(target,key){if(key==='fixedPhase'){const f=n(Reflect.get(target,key),0);return Math.max(f||nativePhase(target),b.floor);}if(SHADOW_KEYS.has(key))return shadow[key];return Reflect.get(target,key,target);},
   set(target,key,value){if(SHADOW_KEYS.has(key)){shadow[key]=value;return true;}return Reflect.set(target,key,value,target);},
   deleteProperty(target,key){if(SHADOW_KEYS.has(key)){delete shadow[key];return true;}return Reflect.deleteProperty(target,key);}});}return b.proxy;}
 function spriteOverride(cache,actor,time,base,self,rest){if(!enabledFlag||!actor)return undefined;const s=currentState();if(!s||!story(s))return undefined;const w=worlds.get(s);const b=w?.byId.get(actor.id);if(!b||b.stage<1)return undefined;
  const B=root.__HAPIL_RC86_BRIDGE__,c=b.cfg,u=(n(s.time)-b.at)/TRANSFORM_DUR,native=()=>b.floor>0?base.call(self,cache,floorProxy(b,actor),time,...rest):base.call(self,cache,actor,time,...rest);
  if(c?.transition&&u>=0&&u<1)return B.runtimeSprite(cache,c.transition,native());
  if(c?.final)return B.runtimeSprite(cache,c.final,native());
  if(b.floor>0)return native();return undefined;}
 function wrapSprite(){const B=root.__HAPIL_RC86_BRIDGE__;if(!B)return false;let cur;try{cur=B.phaseSprite;}catch(e){return false;}if(typeof cur!=='function')return false;if(cur===seams.sprite)return true;if(metrics.rewraps>=24)return true;
  const base=cur;const fn=function(cache,actor,time,...rest){if(inSprite)return base.call(this,cache,actor,time,...rest);inSprite=true;
   try{let o;try{o=spriteOverride(cache,actor,time,base,this,rest);}catch(e){fail(e);}return o!==undefined?o:base.call(this,cache,actor,time,...rest);}finally{inSprite=false;}};
  fn.rc240BossForm=true;try{B.phaseSprite=fn;}catch(e){fail(e);return false;}seams.sprite=fn;metrics.rewraps++;return true;}
 function depsReady(){const lp=root.__HAPIL_LOOP_V31365__,B=root.__HAPIL_RC86_BRIDGE__;return !!(lp&&typeof lp.afterHit==='function'&&typeof lp.render==='function'&&B&&typeof B.project==='function'&&'phaseSprite' in B);}
 function recheck(){if(!installed)return;try{wrapLoop();wrapSprite();seedCurrent();}catch(e){fail(e);}}
 function rafLoop(){try{const s=currentState();if(s&&enabledFlag){const w=worlds.get(s),t=n(s.time);const dt=w?t-w.lastT:0;tick(s,dt);const w2=worlds.get(s);if(w2)w2.lastT=t;}}catch(e){fail(e);}
  try{root.requestAnimationFrame(rafLoop);}catch(e){}}
 function install(){if(installed)return true;if(!depsReady())return false;
  try{if(!wrapLoop()||!wrapSprite())return false;}catch(e){fail(e);return false;}
  installed=true;api.installed=true;metrics.installs++;
  if(enabledFlag){patchStaticTexts();installTextHooks();seedCurrent();}
  try{root.setInterval?.(recheck,1000);}catch(e){}
  try{if(typeof root.requestAnimationFrame==='function')root.requestAnimationFrame(rafLoop);}catch(e){}
  return true;}

 // ---------------------------------------------------------------- API
 const api={version:VERSION,installed:false,
  enabled:()=>enabledFlag,
  setEnabled(v){enabledFlag=!!v;if(enabledFlag&&installed){patchStaticTexts();installTextHooks();seedCurrent();}return enabledFlag;},
  partsBroken(s,bossId){const b=s&&worlds.get(s)?.byId.get(bossId);return b?b.parts.reduce((k,p)=>k+(p.broken?1:0),0):0;},
  parts(s,bossId){const b=s&&worlds.get(s)?.byId.get(bossId);return b?b.parts.map(p=>({index:p.index,hp:p.hp,maxHp:p.maxHp,broken:p.broken,sx:n(p.sx,b.ax),sy:n(p.sy,b.ay)})):[];},
  form(s,bossId){const b=s&&worlds.get(s)?.byId.get(bossId);if(!b)return null;const u=n(s.time)-b.at;return {stage:b.stage,at:b.at,transforming:b.stage>=1&&u>=0&&u<TRANSFORM_DUR,procedural:b.procedural,floor:b.floor,art:b.cfg?(b.cfg.final??b.cfg.transition??b.cfg.overlay??'native-phase'):null};},
  titleCard(s){const c=s&&worlds.get(s)?.card;return c&&n(s.time)<c.until?{...c}:null;},
  fixText,
  metrics:()=>({...metrics,enabled:enabledFlag,installed,lastError}),
  __test:{tick,afterHit,render,burst,seedImages,install,recheck,worlds,nativePhase,floorFor,story,
   poolLive:s=>worlds.get(s)?.pool.live??0,FORMS,NEEDS_ART,ZONE_NAMES,CROSS_AUDIT,HEART,PART_HP,PART_SHARE,TRANSFORM_AT,TRANSFORM_DUR,TITLE_DUR,POOL_CAP}};
 root.__HAPIL_BOSS_FORM_RC240__=api;
 let attempts=0;(function ready(){if(!install()&&++attempts<1200)root.setTimeout?.(ready,10);})();
})(typeof window==='object'?window:globalThis);
