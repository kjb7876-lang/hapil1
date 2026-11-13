'use strict';
// RC240 mobile landscape + arcade stand-off overlay, against the real RC134
// Persona floor, RC138 arena guards, RC227 floor patches and the RC223
// left-zone controller. Only the browser/device surface is stubbed.
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(repo,file),'utf8');
const SCRIPT=read('assets/rc240/mobile-landscape.js');
let checks=0;
const ok=(c,m)=>{assert.ok(c,m);checks++;};
const eq=(a,b,m)=>{assert.equal(a,b,m);checks++;};
const near=(a,b,eps,m)=>{assert.ok(Math.abs(a-b)<=eps,`${m}: ${a} vs ${b}`);checks++;};

function makeDom({touch=true,coarse=true,screen={width:375,height:812},inner={width:812,height:375},orientation='supported'}={}){
 const classes=new Set(),listeners={},docListeners={},timers=[],intervals=[],styles=[];
 const lockCalls=[];
 const el=(tag)=>({tagName:tag.toUpperCase(),id:'',textContent:'',children:[],attrs:{},setAttribute(k,v){this.attrs[k]=String(v);},appendChild(c){this.children.push(c);if(c.tagName==='STYLE')styles.push(c);return c;}});
 const head=el('head'),body=el('body');
 const document={
  readyState:'complete',head,body,fullscreenElement:null,
  documentElement:{classList:{add:(...c)=>c.forEach(x=>classes.add(x)),remove:(...c)=>c.forEach(x=>classes.delete(x)),toggle:(c,on)=>{if(on===undefined)on=!classes.has(c);on?classes.add(c):classes.delete(c);return on;},contains:c=>classes.has(c)}},
  createElement:el,getElementById:id=>styles.find(s=>s.id===id)??null,
  addEventListener:(t,f)=>{(docListeners[t]??=[]).push(f);},removeEventListener(){}
 };
 const win={
  document,innerWidth:inner.width,innerHeight:inner.height,
  navigator:{maxTouchPoints:touch?5:0,userAgent:touch?'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)':'Mozilla/5.0 (X11; Linux x86_64)'},
  screen:{width:screen.width,height:screen.height,orientation:orientation==='none'?undefined:{type:'landscape-primary',lock:orientation==='supported'?(o=>{lockCalls.push(o);return Promise.resolve();}):(o=>{lockCalls.push(o);return Promise.reject(new Error('NotSupportedError'));})}},
  matchMedia:q=>({matches:/pointer:\s*coarse/.test(q)?coarse:/hover:\s*none/.test(q)?coarse:false,addEventListener(){},removeEventListener(){}}),
  addEventListener:(t,f)=>{(listeners[t]??=[]).push(f);},removeEventListener(){},
  setTimeout:(f,ms)=>{timers.push(f);return timers.length;},clearTimeout(){},setInterval:(f)=>{intervals.push(f);return 1000+intervals.length;},clearInterval(){},
  console,Math,JSON,Object,Array,Number,String,Symbol,WeakMap,WeakSet,Map,Set,Promise,Error,TypeError,Proxy,Reflect,isFinite,parseFloat
 };
 if(touch)win.ontouchstart=null;
 win.window=win;win.globalThis=win;
 return {win,classes,listeners,docListeners,timers,styles,lockCalls,document,
  fire:(t,e={})=>{for(const f of listeners[t]??[])f(e);for(const f of docListeners[t]??[])f(e);},
  runTimers:(n=3)=>{for(let k=0;k<n;k++){const batch=timers.splice(0);for(const f of batch)f();for(const f of intervals.slice())f();}}};
}

function loadGame(dom,{withLeftZone=true}={}){
 const root=dom.win;vm.createContext(root);
 for(const file of ['assets/rc134/persona-duel.js','assets/rc138/battle-arena.js','assets/rc227/floor-patches.js','assets/rc223/left-zone.js'])vm.runInContext(read(file),root,{filename:file});
 const R=root.__HAPIL_BATTLE_ARENA_RC138__,D=root.__HAPIL_PERSONA_DUEL_RC134__;
 R.bind({combat:['ep1b03','dist06','cult04'],clear:s=>!(s?.enemies??[]).some(a=>a?.hp>0)});
 root.__HAPIL_INNER_FINAL_RC133__={encounter:s=>s?.personaTestRC240===true};
 const frames=[];
 root.__HAPIL_CONTROLS_V31329__={binding:{state:{current:null},phase:'game'},frameStart(s,dt){frames.push(dt);return 'native';}};
 if(withLeftZone){
  // Native surface shape from the bundle's RC223 installer (global lookup).
  const controller=root.__HAPIL_LEFT_ZONE_RC223__.createController({
   inScope:s=>R.enabled(s)&&R.locked(s),isHost:()=>true,isPlayer:(s,a)=>a===s,
   nativeAll:(s,p,r)=>R.contains(p,'all',r,s),originalAllowed:(s,a,p,r)=>D.contains(p,R.side(s,true),r),applyDamage:()=>true});
  root.__HAPIL_LEFT_ZONE_NATIVE_RC223__=Object.freeze({installed:true,version:'RC223',policy:root.__HAPIL_LEFT_ZONE_RC223__.policy,
   allowed:(s,a,p,r=.8)=>controller.allowed(s,a,p,r),canMove:(s,a,p,r=.8)=>controller.canMove(s,a,p,r),
   regionAt:(s,a,p)=>controller.regionAt(s,a,p??{x:a?.x,y:a?.y}),exposed:(s,a,p)=>controller.exposedAt(s,a,p??{x:a?.x,y:a?.y}),
   factors:(s,a)=>controller.factors(s,a),metrics:controller.metrics});
 }
 vm.runInContext(SCRIPT,root,{filename:'assets/rc240/mobile-landscape.js'});
 dom.runTimers(2);
 return {root,R,D,frames,API:root.__HAPIL_MOBILE_LANDSCAPE_RC240__};
}
function world(extra={}){
 return {zone:'ep1b03',time:100,hp:240,maxHp:240,x:12,y:24,gameModeV31346:'STORY',enemies:[],...extra};
}
function enemy(id,x,y,extra={}){return {id,hp:100,maxHp:100,x,y,...extra};}
const d=p=>p.x-p.y;

// ---------------------------------------------------------------- install
{
 const dom=makeDom();const {root,API,R}=loadGame(dom);
 ok(API&&API.installed(),'RC240 mobile landscape layer installs once its seams exist');
 eq(API.policy.heroLine,1.45,'hero zone keeps the native RC138 left line (y-x >= 1.45)');
 eq(API.policy.enemyLine,5,'enemy zone starts at x-y >= 5');
 near(API.policy.gapLogicalPx,(1.45+5)*27,1e-9,'documented stand-off gap in logical px');
 ok(root.__HAPIL_FLOOR_PATCHES_RC227__.rc240StandoffRC240===true,'floor patch seam is wrapped');
 ok(root.__HAPIL_LEFT_ZONE_NATIVE_RC223__.rc240StandoffRC240===true,'left-zone seam is wrapped');
 ok(typeof root.__HAPIL_FLOOR_PATCHES_RC227__.surface==='object','wrapped floor patches keep their public surface');
 ok(root.__HAPIL_LEFT_ZONE_NATIVE_RC223__.installed===true&&typeof root.__HAPIL_LEFT_ZONE_NATIVE_RC223__.factors==='function','wrapped left-zone keeps its public surface');
 // idempotent: running the script again does not double wrap
 const fp=root.__HAPIL_FLOOR_PATCHES_RC227__,lz=root.__HAPIL_LEFT_ZONE_NATIVE_RC223__,fs1=root.__HAPIL_CONTROLS_V31329__.frameStart;
 vm.runInContext(SCRIPT,root);dom.runTimers(2);
 ok(root.__HAPIL_FLOOR_PATCHES_RC227__===fp&&root.__HAPIL_LEFT_ZONE_NATIVE_RC223__===lz&&root.__HAPIL_CONTROLS_V31329__.frameStart===fs1,'second load is a no-op');
 // re-check: another layer replaces the floor patches global; the heartbeat re-wraps it
 root.__HAPIL_FLOOR_PATCHES_RC227__=Object.freeze({...fp,rc240StandoffRC240:undefined,point:(q,w,r,s,b)=>b});
 dom.runTimers(1);
 ok(root.__HAPIL_FLOOR_PATCHES_RC227__.rc240StandoffRC240===true,'heartbeat re-wraps a replaced floor-patch global');
 void R;
}

// ---------------------------------------------------------------- enemy zone (STORY and DREAM alike)
for(const mode of ['STORY','DREAM']){
 const dom=makeDom();const {R,API,frames,root}=loadGame(dom);
 const s=world({gameModeV31346:mode,zone:mode==='DREAM'?'dist06':'ep1b03'});
 const a=enemy('m1',20,18),b=enemy('m2',26,12);s.enemies=[a,b];
 root.__HAPIL_CONTROLS_V31329__.binding.state.current=s;
 R.enforce(s);
 ok(R.locked(s),mode+': fixture is a locked combat');
 ok(d(a)>=API.policy.enemyLine-1e-9,mode+': enemy admitted at the centre is placed behind the stand-off line ('+d(a).toFixed(3)+')');
 ok(R.applyPosition(a,{x:19.2,y:18.4}),mode+': native position write is owned by the RC138 guard'); // AI walks it towards the hero (x-y = .8)
 ok(d(a)>=API.policy.enemyLine-1e-9,mode+': native movement cannot cross the enemy stand-off line');
 near(a.x+a.y,37.6,1e-6,mode+': correction is a pure horizontal screen shift (x+y preserved)');
 a.x=19.4;ok(d(a)>=API.policy.enemyLine-1e-9&&Number.isFinite(a.y),mode+': direct property writes are clamped too');
 const bx=b.x,by=b.y;b.x=b.x+.1;
 ok(Math.abs(b.x-(bx+.1))<1e-9&&b.y===by,mode+': moves deep inside the enemy zone are untouched');
 // hero cannot step into the enemy half through the RC223 extension
 const LZ=root.__HAPIL_LEFT_ZONE_NATIVE_RC223__;
 ok(LZ.allowed(s,s,{x:18,y:17},.8)===false,mode+': RC223 extension point across the centre is no longer admitted');
 ok(LZ.canMove(s,s,{x:18,y:17},.8)===false,mode+': hero cannot move into the enemy half');
 ok(LZ.allowed(s,s,{x:12,y:24},.8)===true,mode+': normal hero floor still admitted');
 s.x=17.5;s.y=17.6; // hero setter goes through the guard
 ok(s.y-s.x>=API.policy.heroLine-1e-9,mode+': hero write across the line is clamped to the hero zone ('+(s.y-s.x).toFixed(3)+')');
 // frameStart chain still calls native
 eq(root.__HAPIL_CONTROLS_V31329__.frameStart(s,.016),'native',mode+': frameStart chain preserved');
 ok(frames.length===1,'native frameStart ran once');
}

// ---------------------------------------------------------------- NaN / rest zone / guest
{
 const dom=makeDom();const {R,root,API}=loadGame(dom);
 const FP=root.__HAPIL_FLOOR_PATCHES_RC227__;
 const s=world();s.enemies=[enemy('m',26,12)];R.enforce(s);
 const base={x:20,y:19};
 const nan=FP.point({x:NaN,y:3},'right',.72,s,base);
 ok(nan===base,'non-finite candidate falls back to the native base point');
 assert.doesNotThrow(()=>FP.point({x:Infinity,y:3},'right',.72,s,{x:Infinity,y:2}),'no throw on infinite input');checks++;
 const badBase=FP.point({x:20,y:19.5},'right',.72,s,{x:NaN,y:NaN});
 ok(badBase===null||badBase===undefined||Number.isFinite(badBase.x)||Number.isNaN(badBase.x),'non-finite native base is returned untouched, never amplified');
 const restWorld=world({zone:'village'});
 const p=FP.point({x:19.5,y:19},'right',.72,restWorld,{x:19.5,y:19});
 eq(d(p),.5,'rest/hub zones are untouched');
 const unlocked=world({enemies:[]});
 const q=FP.point({x:19.5,y:19},'right',.72,unlocked,{x:19.5,y:19});
 eq(d(q),.5,'cleared combat (no live hostiles) is untouched');
 const all=FP.point({x:19.5,y:19},'all',.72,s,{x:19.5,y:19});
 eq(d(all),.5,'"all" floor queries are untouched');
 const hero=FP.point({x:12,y:13.6},'left',.8,s,{x:12,y:13.6});
 near(hero.y-hero.x,1.6,1e-9,'hero-side queries are not widened');
 // guest: no nudges, geometry only
 root.__HAPIL_REMOTE_RC222_RUNTIME__={status:()=>({role:'guest'})};
 const e=s.enemies[0];const before={x:e.x,y:e.y};API.step(s,.016);
 ok(e.x===before.x&&e.y===before.y,'guest never writes positions');
 // NaN actor is skipped, never written
 delete root.__HAPIL_REMOTE_RC222_RUNTIME__;
 const broken={id:'nan',hp:5,x:NaN,y:NaN};s.enemies.push(broken);
 assert.doesNotThrow(()=>API.step(s,.016));checks++;
 ok(Number.isNaN(broken.x)||Number.isFinite(broken.x)&&Number.isFinite(broken.y),'non-finite actor is left to native RC138 repair, never made worse');
 ok(!API.metrics().lastError,'stand-off step raised nothing');
 // an unguarded actor with NaN coordinates (guard refused) is skipped outright
 const frozen={id:'nan2',hp:5};Object.defineProperty(frozen,'x',{value:NaN,writable:true,configurable:false});Object.defineProperty(frozen,'y',{value:NaN,writable:true,configurable:false});
 const writesBefore=API.metrics().settleWrites;s.enemies.push(frozen);API.step(s,.016);
 ok(Number.isNaN(frozen.x)&&API.metrics().settleWrites===writesBefore,'unguarded NaN actor is not written');
 assert.doesNotThrow(()=>API.step(s,NaN));checks++;
 assert.doesNotThrow(()=>API.step(null,.016));checks++;
}

// ---------------------------------------------------------------- mirror (Persona) mode
{
 const dom=makeDom();const {R,D,root,API}=loadGame(dom);
 const s=world({zone:'cult04',gameModeV31346:'DREAM',personaTestRC240:true,innerFinalRC133:{duelSwap:true}});
 const boss=enemy('inner-evil-rc133',16,22);s.enemies=[boss];
 ok(D.active(s)&&D.swapped(s),'Persona duel with left/right swap is active');
 eq(R.side(s,true),'right','mirror mode: hero side is right');eq(R.side(s,false),'left','mirror mode: enemy side is left');
 const FP=root.__HAPIL_FLOOR_PATCHES_RC227__;
 const q=FP.point({x:18.8,y:19.4},'left',.72,s,{x:18.8,y:19.4});
 near(q.x,18.8,1e-12,'persona mirror: RC240 does not move the mirrored enemy');
 const bx=boss.x,by=boss.y,hx=s.x,hy=s.y;
 for(let i=0;i<30;i++)API.step(s,.016);
 ok(boss.x===bx&&boss.y===by&&s.x===hx&&s.y===hy,'persona mirror: no RC240 writes while the Persona owns positions');
 eq(API.snapshot(s).mode,'mirror','snapshot reports mirror mode');
 // generic mirrored geometry (a swap reported by RC138 outside the Persona guard)
 const gen=API.lineFor(s,'left');
 eq(gen.axis,'y-x','mirrored enemy line is measured on y-x');
}

// ---------------------------------------------------------------- transition out of mirror: eased, no pop
{
 const dom=makeDom();const {R,D,API,root}=loadGame(dom);
 const s=world({zone:'cult04',gameModeV31346:'DREAM',personaTestRC240:true,innerFinalRC133:{duelSwap:false}});
 const mob=enemy('late-mob',19.9,18.3);s.enemies=[mob];
 root.__HAPIL_CONTROLS_V31329__.binding.state.current=s;
 API.step(s,.016); // seen as mirror/persona: inert
 ok(Math.abs(d(mob)-1.6)<1e-9,'inside Persona the old 1.45 gap stands');
 s.personaTestRC240=false; // Persona ends; RC138 takes over
 R.enforce(s);
 const start=d(mob);
 ok(start<API.policy.enemyLine-0.5,'on hand-over the enemy is not snapped to the new line ('+start.toFixed(3)+')');
 let prev=start,maxStep=0,t=0;
 for(let i=0;i<120;i++){API.step(s,.016);t+=.016;s.time+=.016;const now=d(mob);ok(Number.isFinite(mob.x)&&Number.isFinite(mob.y),'finite while settling');maxStep=Math.max(maxStep,Math.abs(now-prev));ok(now>=prev-1e-9,'settling is monotonic');prev=now;}
 ok(maxStep<=API.policy.settleRate*.016+1e-6,'per-frame correction is eased (max '+maxStep.toFixed(4)+' x-y units / frame)');
 ok(prev>=API.policy.enemyLine-1e-6,'enemy reaches the stand-off line ('+prev.toFixed(3)+')');
 ok(API.snapshot(s).mode==='standoff','snapshot returns to standoff mode');
 // and back into mirror: inert immediately
 s.personaTestRC240=true;s.innerFinalRC133.duelSwap=true;const fx=mob.x;API.step(s,.016);ok(mob.x===fx,'re-entering mirror mode stops RC240 writes');
 void D;
}

// ---------------------------------------------------------------- hero already across the line (e.g. old save): eased out
{
 const dom=makeDom();const {R,API}=loadGame(dom);
 const s=world({x:18,y:16.2});s.enemies=[enemy('b',27,12)];
 // hero stands in the old RC223 extension when RC240 first sees the world
 R.enforce(s);
 const start=s.y-s.x;
 API.step(s,.016);
 ok(s.y-s.x<API.policy.heroLine-.5,'hero is not teleported on first sight ('+(s.y-s.x).toFixed(3)+')');
 let prev=s.y-s.x,maxStep=0;
 for(let i=0;i<200;i++){API.step(s,.016);s.time+=.016;const now=s.y-s.x;maxStep=Math.max(maxStep,Math.abs(now-prev));ok(now>=prev-1e-9,'hero retreat is monotonic');prev=now;}
 ok(maxStep<=API.policy.settleRate*.016+1e-6,'hero retreat is eased');
 ok(prev>=API.policy.heroLine-1e-6,'hero ends inside the hero zone ('+prev.toFixed(3)+' from '+start.toFixed(3)+')');
 // and cannot walk back in
 s.x=18.5;s.y=17;ok(s.y-s.x>=API.policy.heroLine-1e-9,'hero cannot re-enter the enemy half');
}

// ---------------------------------------------------------------- device: phone, tablet, desktop, orientation lock
{
 const phone=makeDom();const P=loadGame(phone).API;
 ok(P.phone()===true,'iPhone-class touch device is a phone');
 ok(P.landscapePhone()===true,'812x375 is landscape phone');
 ok(phone.classes.has('rc240-phone')&&phone.classes.has('rc240-landscape'),'html classes mark the phone landscape layout');
 const style=phone.styles.find(s=>s.id==='rc240-mobile-landscape-style');
 ok(style&&/data-mobile-action="F"\]/.test(style.textContent)&&/#hapil-resonance-rc96/.test(style.textContent),'landscape HUD rules are injected');
 ok(/#rc152-orientation-gate::after/.test(style.textContent)&&/세로/.test(style.textContent),'rotate prompt gets a Korean portrait-unsupported line via CSS only');
 ok(/safe-area-inset|--rc154-safe/.test(style.textContent),'HUD rules honour safe-area insets');
 // portrait phone
 phone.win.innerWidth=375;phone.win.innerHeight=812;phone.fire('resize');
 ok(phone.classes.has('rc240-phone')&&!phone.classes.has('rc240-landscape'),'portrait phone drops the landscape class');
 // orientation lock attempts: first touch, fullscreen
 phone.fire('pointerup',{pointerType:'touch'});
 phone.document.fullscreenElement={};phone.fire('fullscreenchange');
 ok(phone.lockCalls.length>=1&&phone.lockCalls.every(o=>o==='landscape'),'best-effort screen.orientation.lock("landscape")');
 const rejecting=makeDom({orientation:'reject'});const RJ=loadGame(rejecting).API;
 assert.doesNotThrow(()=>{rejecting.fire('pointerup',{pointerType:'touch'});});checks++;
 ok(RJ.metrics().lockAttempts>=1,'rejected lock (iOS Safari) is counted and swallowed');
 const none=makeDom({orientation:'none'});const NO=loadGame(none).API;
 assert.doesNotThrow(()=>none.fire('pointerup',{pointerType:'touch'}));checks++;
 eq(NO.metrics().lockUnsupported>=1,true,'missing screen.orientation is tolerated');
 const desk=makeDom({touch:false,coarse:false,screen:{width:1920,height:1080},inner:{width:500,height:800}});const DK=loadGame(desk).API;
 ok(DK.phone()===false,'desktop narrow window is not a phone');
 ok(!desk.classes.has('rc240-phone')&&!desk.classes.has('rc240-landscape'),'desktop gets no phone classes');
 desk.fire('pointerup',{pointerType:'mouse'});desk.document.fullscreenElement={};desk.fire('fullscreenchange');
 eq(desk.lockCalls.length,0,'desktop never tries to lock orientation');
 const tab=makeDom({screen:{width:820,height:1180},inner:{width:1180,height:820}});const TB=loadGame(tab).API;
 ok(TB.phone()===false,'tablet is not treated as a phone');
}

console.log(JSON.stringify({status:'passed',checks}));
