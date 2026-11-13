'use strict';
// RC240 mobile landscape + stand-off browser QA on the real game bytes.
// Staged fixtures (disclosed): the boss/mob rosters are entered through the
// public native bridge, as tests/rc233-quality-browser.cjs does. If index.html
// does not yet load assets/rc240/mobile-landscape.js, the script is injected
// with addInitScript so the check can run before the tag lands.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const pwRoot=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {chromium}=require(pwRoot?path.join(pwRoot,'playwright'):'playwright');
const appRoot=path.resolve(process.env.HAPIL_TEST_BASE||path.join(__dirname,'..'));
const out=path.resolve(process.env.HAPIL_QA_OUTPUT||'/tmp/rc240-mobile-landscape-browser');fs.mkdirSync(out,{recursive:true});
const SCRIPT=fs.readFileSync(path.join(appRoot,'assets/rc240/mobile-landscape.js'),'utf8');
const tagged=fs.readFileSync(path.join(appRoot,'index.html'),'utf8').includes('assets/rc240/mobile-landscape.js');
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.json':'application/json','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.mp4':'video/mp4','.webm':'video/webm'};
const server=http.createServer((req,res)=>{let file;try{const p=decodeURIComponent(new URL(req.url,'http://x').pathname);file=path.resolve(appRoot,'.'+(p==='/'?'/index.html':p));}catch{return res.writeHead(400).end();}
 if(!file.startsWith(appRoot+path.sep))return res.writeHead(403).end();fs.readFile(file,(e,b)=>{if(e)return res.writeHead(404).end();res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(b);});});
const report={status:'running',tagged,checks:[],errors:[]};
const check=(c,m,extra)=>{report.checks.push({ok:!!c,m,...(extra?{extra}:{})});assert.ok(c,m+(extra?' '+JSON.stringify(extra):''));};
const PROFILES={
 mini:{viewport:{width:812,height:375},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA},
 p844:{viewport:{width:844,height:390},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA},
 p667:{viewport:{width:667,height:375},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:UA},
 pc:{viewport:{width:1280,height:720},deviceScaleFactor:1}
};
async function open(browser,profile,base){
 const context=await browser.newContext(PROFILES[profile]);const page=await context.newPage();page.setDefaultTimeout(90000);
 page.on('pageerror',e=>report.errors.push(profile+': '+String(e.message||e).slice(0,200)));
 if(!tagged)await page.addInitScript({content:SCRIPT});
 await page.goto(base+'/?qa=1');
 await page.waitForFunction(()=>window.__HAPIL_RC133_NATIVE__?.installed&&window.__HAPIL_RC86_BRIDGE__&&window.__HAPIL_CONTROLS_V31329__&&window.__HAPIL_COMBAT_LIFECYCLE_RC231__&&window.__HAPIL_MOBILE_LANDSCAPE_RC240__?.installed());
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
 await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
 await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game');
 for(let i=0;i<30&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(80);}
 await page.evaluate(()=>window.__HAPIL_PARTY_LAUNCH_V31322__?.dismissGuestUI?.());
 return {context,page};
}
async function stage(page,fixture){
 return page.evaluate(async fixture=>{
  const C=window.__HAPIL_CONTROLS_V31329__,P=window.__HAPIL_PARTY_V31322__,N=window.__HAPIL_RC133_NATIVE__,B=window.__HAPIL_RC86_BRIDGE__,s=P.state??C.binding.state.current;
  C.binding.modal.current='rc240-preload';C.clear();window.__HAPIL_STORY_RC51__.close(false);window.__HAPIL_PERSONA_DUEL_RC134__?.release(s);window.__HAPIL_BATTLE_ARENA_RC138__?.release(s);
  const ds=Object.getOwnPropertyDescriptors(s),managed=Object.fromEntries(Object.entries(ds).filter(([,d])=>d.get||d.set));
  for(const [k,d] of Object.entries(ds))if(Object.hasOwn(d,'value')&&d.configurable)delete s[k];
  const fresh={...N.makeState(),zone:fixture.zone,frontierZone:fixture.zone,time:100,activeHeroId:'hunter',gameModeV31346:fixture.mode,samongUnlockedRC91:fixture.mode==='DREAM',hp:240,maxHp:240};
  for(const [k,v] of Object.entries(fresh))if(!managed[k])s[k]=v;for(const [k,v] of Object.entries(fresh))if(managed[k]?.set)s[k]=v;
  C.binding.state.current=s;C.binding.hero.current='hunter';
  window.__HAPIL_RUN_V31400__.init(s,'hunter',{aiEnabled:false,aiHeroes:[],humanPlayers:1,humanHeroes:[],origin:'rc240-fixture'});P.configure(window.__HAPIL_RUN_V31400__.configFor(s,'hunter'));
  window.__HAPIL_STORY_RC51__.suppressEntry(s);N.enter(s,fixture.zone);window.__HAPIL_STORY_RC51__.close(false);
  window.__HAPIL_STORY_RC51__.beforeFrame(s,{blocked:false,clear:false,sound:false});window.__HAPIL_STORY_RC51__.close(false);C.binding.actions.dismiss();C.binding.modal.current='rc240-preload';
  let actors=fixture.ids?fixture.ids.map(id=>B.cloneEnemy(B.actor(fixture.zone,id),fixture.zone)):(s.enemies??[]).filter(a=>a.hp>0&&!a.boss&&!a.midboss).slice(0,4);
  if(!actors.length)throw Error('fixture has no actors');
  for(const a of actors){a.maxHp=a.hp=1e7;} // keep the roster alive for the observation window
  s.enemies=actors;s.spawnedWaves=new Set([1,2,3,4]);s.bossDefeated=false;
  for(const k of ['hostileProjectiles','pendingHits','impactQueue','pendingStrikes','pendingSpawns','effects'])s[k]=[];
  for(const a of actors)for(const k of ['attackAt','attackImpactAt','readyAt','patternReadyAt','recoverUntil','atomicCastUntil31210','staggerUntil','phaseTransitionUntil','combatEntryGraceUntilV31239','invulnerableUntil'])a[k]=0;
  Object.assign(s,{paused:false,pause:false,encounterDialogue31226:null,encounterLockUntil31226:0,timeStopUntil:0,invulnerableUntil:s.time+600});
  C.setMode('manual');P.capture(s,{damage:C.binding.actions.damage,heroRef:C.binding.hero,cache:C.binding.cache.current},false);
  await Promise.all([...new Set(B.zoneAssetManifest(fixture.zone,'hunter'))].map(src=>new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=src;})));
  window.__HAPIL_COMBAT_FLOW_RC95__?.reset(s);window.__HAPIL_COMBAT_LIFECYCLE_RC231__?.reset(s);window.__HAPIL_BATTLE_ARENA_RC138__?.enforce(s);C.binding.modal.current=null;
  // Sample after the admission settle. Mobs follow the dynamic RC240 line
  // (hero + 174 px, capped at 965); bosses keep the base line (775).
  const R=window.__RC240_SAMPLE__={heroMaxX:-1e9,mobMinX:1e9,bossMinX:1e9,frames:0,nonFinite:0,lineBreaks:0,steady:0,steadyBreaks:[],start:performance.now()+800,lastHero:null,stillSince:0};
  const G=(x,y)=>({x:640+27*(x-y),y:13.5*(x+y)}),M=window.__HAPIL_MOBILE_LANDSCAPE_RC240__,L=window.__HAPIL_COMBAT_LAYOUT_RC153__;
  R.timer=setInterval(()=>{const w=window.__HAPIL_CONTROLS_V31329__.binding.state.current,now=performance.now();if(!w||now<R.start)return;R.frames++;if(!Number.isFinite(w.x)||!Number.isFinite(w.y))R.nonFinite++;const h=G(w.x,w.y);R.heroMaxX=Math.max(R.heroMaxX,h.x);
   if(R.lastHero===null||Math.abs(h.x-R.lastHero)>.5){R.lastHero=h.x;R.stillSince=now;}
   const line=640+27*M.snapshot(w).enemyLine;let mob=1e9;
   for(const a of w.enemies??[]){if(!(a.hp>0)||a.visualOnly)continue;if(!Number.isFinite(a.x)||!Number.isFinite(a.y)){R.nonFinite++;continue;}const e=G(a.x,a.y);if(L.boss(a))R.bossMinX=Math.min(R.bossMinX,e.x);else{mob=Math.min(mob,e.x);if(e.x<line-1)R.lineBreaks++;}}
   R.mobMinX=Math.min(R.mobMinX,mob);
   if(mob<1e9&&now-R.stillSince>=700){R.steady++;const want=Math.min(h.x+174.15,965);if(mob<want-2)R.steadyBreaks.push({hero:h.x,mob,want});}},100);
  return {zone:s.zone,actors:actors.length};
 },fixture);
}
const sample=page=>page.evaluate(()=>{const R=window.__RC240_SAMPLE__;clearInterval(R.timer);const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return{...R,timer:undefined,steadyBreaks:R.steadyBreaks.slice(0,4),nSteadyBreaks:R.steadyBreaks.length,time:s.time,hp:s.hp,snapshot:window.__HAPIL_MOBILE_LANDSCAPE_RC240__.snapshot(s)};});
const layout=page=>page.evaluate(()=>{
 const vis=e=>{const cs=getComputedStyle(e),r=e.getBoundingClientRect();return r.width>2&&r.height>2&&cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity>.05&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight;};
 const box=e=>{if(!e||!vis(e))return null;const r=e.getBoundingClientRect();return{l:r.left,t:r.top,r:r.right,b:r.bottom};};
 const q=s=>document.querySelector(s);
 const items={F:box(q('#hapil-mobile-controls-v31366 [data-mobile-action="F"]')),stick:box(q('.hm-movement')),actions:box(q('.hm-actions')),settings:box(q('.rc108-settings-trigger')),resonance:box(q('#hapil-resonance-rc96'))};
 const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current,cam=window.__HAPIL_CAMERA_RC223__.diagnostics().last?.adjusted,canvas=q('.game-stage > canvas').getBoundingClientRect(),v=window.__HAPIL_VIEWPORT_RC104__.view(canvas.width,canvas.height);
 const scr=(x,y)=>{const gx=640+27*(x-y),gy=13.5*(x+y);return{x:canvas.left+(cam.x+gx*cam.scale-v.x)*v.k,y:canvas.top+(cam.y+gy*cam.scale-v.y)*v.k};};
 const D=window.__HAPIL_PERSONA_DUEL_RC134__,poly=side=>(D.polygon(side,.8)||[]).map(p=>scr(p.x,p.y));
 const danmaku=window.__HAPIL_DANMAKU_HUD_RC129__?.snapshot?.(s)?.last?.phase?{l:7,t:7,r:7+Math.min(innerWidth<460?innerWidth*.65:330,innerWidth-100),b:7+(innerWidth<600||innerHeight<340?36:44)}:null;
 const bodies=[s,...(s.enemies??[]).filter(a=>a.hp>0)].map(a=>{const e=window.__HAPIL_BITMAP_NATIVE_RC133__?.paintEnvelope?.(s,a,a===s);if(!e)return null;const tl=e&&{x:canvas.left+(cam.x+e.left*cam.scale-v.x)*v.k,y:canvas.top+(cam.y+e.top*cam.scale-v.y)*v.k},br={x:canvas.left+(cam.x+e.right*cam.scale-v.x)*v.k,y:canvas.top+(cam.y+e.bottom*cam.scale-v.y)*v.k};return{id:a===s?'hero':String(a.id),l:tl.x,t:tl.y,r:br.x,b:br.y};}).filter(Boolean);
 const diag=window.__HAPIL_CAMERA_RC223__.diagnostics().last;
 return{vw:innerWidth,vh:innerHeight,classes:document.documentElement.className,items,left:poly('left'),right:poly('right'),all:poly('all'),danmaku,bodies,hero:scr(s.x,s.y),zoom:diag?.base?.rc240ZoomRC240??null,finalScale:cam.scale*v.k,applied:diag?.appliedZoom??null,enemies:(s.enemies??[]).filter(a=>a.hp>0).map(a=>({id:a.id,boss:!!(a.boss||a.midboss),x:a.x,y:a.y,p:scr(a.x,a.y)}))};
});
const overlap=(a,b,pad=0)=>!!a&&!!b&&Math.min(a.r,b.r)-Math.max(a.l,b.l)>pad&&Math.min(a.b,b.b)-Math.max(a.t,b.t)>pad;
const polyHitsRect=(pts,r)=>{if(!r)return false;const inside=(x,y)=>{let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;};
 for(const p of pts)if(p.x>r.l&&p.x<r.r&&p.y>r.t&&p.y<r.b)return true;for(const [x,y] of [[r.l,r.t],[r.r,r.t],[r.l,r.b],[r.r,r.b]])if(inside(x,y))return true;return false;};

// Tap where the enemy is drawn; the native canvas pointer must resolve it.
async function tapCheck(page,L,tag){
 const target=L.enemies.find(e=>!e.boss&&e.p.x>20&&e.p.x<L.vw-20&&e.p.y>20&&e.p.y<L.vh-20)??L.enemies.find(e=>e.p.x>20&&e.p.x<L.vw-20);
 if(!target)return check(false,tag+': an enemy is on screen to tap',L.enemies);
 const top=await page.evaluate(([x,y])=>document.elementFromPoint(x,y)?.matches?.('.game-stage > canvas')===true,[target.p.x,target.p.y]);
 check(top,tag+': enemy foot point is on the canvas, not under a control',target.p);
 await page.evaluate(()=>{window.__HAPIL_CONTROLS_V31329__.binding.state.current.targetEnemyId=null;});
 await page.touchscreen.tap(target.p.x,target.p.y);await page.waitForTimeout(60);
 const got=await page.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.state.current.targetEnemyId??null);
 check(got===target.id,tag+': tapping the drawn enemy targets it (pointer aligned with zoomed render)',{want:target.id,got,at:target.p});
 // and a tap just outside the native pick radius (world dx = -(r+1.2)) targets nothing
 const dist=(target.boss?2.45:1.45)+1.2,fs=L.finalScale??0.5;
 await page.evaluate(()=>{window.__HAPIL_CONTROLS_V31329__.binding.state.current.targetEnemyId=null;});
 const miss={x:target.p.x-27*dist*fs,y:target.p.y-13.5*dist*fs};
 const near=L.enemies.some(e=>e!==target&&Math.hypot((e.x-target.x+dist),(e.y-target.y))<(e.boss?2.45:1.45)+.5);
 if(!near){await page.touchscreen.tap(miss.x,miss.y);await page.waitForTimeout(60);
  const g2=await page.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.state.current.targetEnemyId??null);
  check(g2===null,tag+': tap on empty floor beside the enemy targets nothing',{g2,miss});}
}
// The world layer (where RC240 bullets are drawn) must use the same final camera
// the pointer inverts: capture drawImage transforms for one frame.
async function transformCheck(page,tag){
 const r=await page.evaluate(()=>new Promise(res=>{
  const P=CanvasRenderingContext2D.prototype,orig=P.drawImage,seen=new Map();
  P.drawImage=function(...a){try{if(this.canvas?.matches?.('.game-stage > canvas')){const m=this.getTransform();const k=m.a.toFixed(4)+','+m.e.toFixed(1)+','+m.f.toFixed(1);seen.set(k,(seen.get(k)||0)+1);}}catch{}return orig.apply(this,a);};
  requestAnimationFrame(()=>requestAnimationFrame(()=>{P.drawImage=orig;
   const cv=document.querySelector('.game-stage > canvas'),rect=cv.getBoundingClientRect(),cam=window.__HAPIL_CAMERA_RC223__.diagnostics().last.adjusted,v=window.__HAPIL_VIEWPORT_RC104__.view(rect.width,rect.height),bx=cv.width/rect.width,by=cv.height/rect.height;
   const want={a:cam.scale*v.k*bx,e:(cam.x-v.x)*v.k*bx,f:(cam.y-v.y)*v.k*by};
   const hits=[...seen.entries()].map(([k,n])=>{const [a,e,f]=k.split(',').map(Number);return{a,e,f,n};});
   const match=hits.filter(h=>Math.abs(h.a/want.a-1)<.01&&Math.abs(h.e-want.e)<2&&Math.abs(h.f-want.f)<2).reduce((t,h)=>t+h.n,0);
   res({want,match,top:hits.sort((x,y)=>y.n-x.n).slice(0,4),bullets:window.__HAPIL_DANMAKU_RC240__?.live?.(window.__HAPIL_CONTROLS_V31329__.binding.state.current)??null});}));
 }));
 check(r.match>0,tag+': world sprites drawn with the final (zoomed) camera transform the pointer inverts',r);
 return r;
}

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch(process.env.RC240_CHANNEL?{channel:process.env.RC240_CHANNEL}:{});
 const policy={heroHome:640-1.45*27,enemyMin:640+5*27,mobCap:965,gap:(1.45+5)*27};
 report.zoom={};
 try{
  for(const profile of ['mini','p844','p667']){
   const {context,page}=await open(browser,profile,base);
   check(await page.evaluate(()=>document.documentElement.classList.contains('rc240-phone')&&document.documentElement.classList.contains('rc240-landscape')),profile+': phone landscape classes');
   for(const fixture of [{name:'story-boss',zone:'ep1b03',ids:['b03-boss'],mode:'STORY'},{name:'story-mob',zone:'ep1b03',mode:'STORY'},{name:'dream-boss',zone:'dist06',ids:['dist06-boss'],mode:'DREAM'}]){
    await stage(page,fixture);
    await page.waitForTimeout(800);await page.keyboard.down('ArrowRight');await page.waitForTimeout(1600);await page.keyboard.up('ArrowRight');
    await page.keyboard.down('ArrowUp');await page.waitForTimeout(900);await page.keyboard.up('ArrowUp');
    const L=await layout(page),S=await sample(page),tag=profile+' '+fixture.name;
    await page.screenshot({path:path.join(out,`${profile}-${fixture.name}.png`)});
    check(S.frames>10&&S.nonFinite===0,tag+': sampled finite positions',{frames:S.frames,nonFinite:S.nonFinite});
    check(S.heroMaxX>policy.heroHome+20,tag+': RC223 danger strip stays reachable for the hero',{heroMaxX:S.heroMaxX});
    check(S.bossMinX>=policy.enemyMin-.5,tag+': bosses keep the base enemy line',{bossMinX:S.bossMinX});
    check(S.mobMinX>=policy.enemyMin-.5&&S.lineBreaks===0,tag+': mobs stay behind the live RC240 line',{mobMinX:S.mobMinX,lineBreaks:S.lineBreaks});
    check(S.nSteadyBreaks===0,tag+': settled mob gap = min(hero+174, 965)',{steady:S.steady,breaks:S.steadyBreaks});
    check(S.snapshot.mode==='standoff',tag+': stand-off active in '+fixture.mode);
    report.zoom[tag]={zoom:L.zoom,applied:L.applied,heroHeight:L.bodies.find(b=>b.id==='hero')?(L.bodies.find(b=>b.id==='hero').b-L.bodies.find(b=>b.id==='hero').t):null,heroMaxX:S.heroMaxX,mobMinX:S.mobMinX,bossMinX:S.bossMinX};
    check(L.zoom>=(fixture.name==='dream-boss'?1.15:1.25)&&L.zoom<=1.45,tag+': phone landscape combat zoom applied',{zoom:L.zoom});
    const xs=L.all.map(p=>p.x),ys=L.all.map(p=>p.y);
    check(Math.min(...xs)>=0&&Math.max(...xs)<=L.vw&&Math.min(...ys)>=0&&Math.max(...ys)<=L.vh,tag+': whole playable floor on screen',{l:Math.min(...xs),r:Math.max(...xs),t:Math.min(...ys),b:Math.max(...ys)});
    const it=L.items;
    for(const [a,b] of [['F','resonance'],['F','settings'],['F','actions'],['F','stick'],['resonance','settings'],['stick','actions']])check(!overlap(it[a],it[b],1),tag+`: ${a} does not overlap ${b}`,{[a]:it[a],[b]:it[b]});
    if(L.danmaku){check(!overlap(it.F,L.danmaku,1),tag+': F button clear of danmaku panel');check(!overlap(it.resonance,L.danmaku,1),tag+': resonance bar clear of danmaku panel',{res:it.resonance,panel:L.danmaku});}
    for(const k of ['stick','actions','F','settings'])check(!polyHitsRect(L.all,it[k])&&!polyHitsRect(L.left,it[k])&&!polyHitsRect(L.right,it[k]),tag+`: legal floor stays clear of ${k}`);
    if(fixture.name==='story-boss')await transformCheck(page,tag);
    await tapCheck(page,L,tag);
    for(const b of L.bodies)check(b.l>=-2&&b.r<=L.vw+2&&b.t>=-2&&b.b<=L.vh+2,tag+`: ${b.id} body fully on screen`,b);
    const heroBody=L.bodies.find(b=>b.id==='hero');
    if(heroBody)check(!overlap(heroBody,it.stick,1),tag+': thumb on stick does not cover the hero',{hero:heroBody,stick:it.stick});
   }
   if(profile==='mini'){
    // Persona duel (mirror mode): its own camera and positions, no RC240 zoom.
    const persona=await page.evaluate(()=>{const C=window.__HAPIL_CONTROLS_V31329__,B=window.__HAPIL_RC86_BRIDGE__,H=window.__HAPIL_INNER_FINAL_RC133__,s=C.binding.state.current;window.__HAPIL_PERSONA_DUEL_RC134__?.release?.(s);window.__HAPIL_BATTLE_ARENA_RC138__?.release?.(s);clearInterval(window.__RC240_SAMPLE__?.timer);
     for(const key of Object.keys(s)){const d=Object.getOwnPropertyDescriptor(s,key);if(d?.configurable)delete s[key];}Object.assign(s,window.__HAPIL_RC133_NATIVE__.makeState());
     Object.assign(s,{zone:'cult04',time:200,x:13.8,y:24.2,hp:240,maxHp:240,activeHeroId:'gunner',gameModeV31346:'DREAM',samongUnlockedRC91:true,spawnedWaves:new Set([1,2,3,4]),completedZones:new Set(),hostileProjectiles:[],pendingHits:[],impactQueue:[],effects:[],encounterLockUntil31226:0,encounterDialogue31226:null,timeStopUntil:0,invulnerableUntil:400});
     const source=B.cloneEnemy(B.actor('cult04','c104-boss'),'cult04');source.hp=0;s.enemies=[source];C.binding.state.current=s;C.setMode('manual');if(!H.start(s,source))return{error:'start failed'};Object.assign(s.innerFinalRC133,{phase:'fight',intro:0,awake:7,awakeningCooldown:28,shotDelay:0,cycle:0});s.invulnerableUntil=s.time+200;
     window.__HAPIL_PARTY_V31322__?.capture?.(s,{damage:C.binding.actions.damage,heroRef:C.binding.hero,cache:C.binding.cache.current},false);return{ok:true};});
    check(persona.ok,'persona: duel staged',persona);
    await page.waitForTimeout(900);
    const pz=await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current,d=window.__HAPIL_CAMERA_RC223__.diagnostics().last;return{active:window.__HAPIL_PERSONA_DUEL_RC134__.active(s),mode:window.__HAPIL_MOBILE_LANDSCAPE_RC240__.snapshot(s).mode,zoom:d?.base?.rc240ZoomRC240??null,finite:Number.isFinite(s.x)&&Number.isFinite(s.y)};});
    await page.screenshot({path:path.join(out,'mini-persona.png')});
    check(pz.active&&pz.mode==='mirror'&&pz.zoom===null&&pz.finite,'persona: mirror mode keeps its own camera (no RC240 zoom) and RC240 is inert',pz);
    // Portrait: RC152 gate + RC240 rotate glyph and second line.
    await page.setViewportSize({width:375,height:812});
    await page.waitForFunction(()=>window.__HAPIL_ORIENTATION_PAUSE_RC152__.paused());
    const g=await page.evaluate(()=>{const g=document.getElementById('rc152-orientation-gate');return{text:g.textContent,display:getComputedStyle(g).display,after:getComputedStyle(g,'::after').content,before:getComputedStyle(g,'::before').content,game:getComputedStyle(document.querySelector('.game')).visibility,landscape:document.documentElement.classList.contains('rc240-landscape')};});
    await page.screenshot({path:path.join(out,'mini-portrait.png')});
    check(g.text==='기기를 가로로 돌려주세요'&&g.display!=='none'&&g.game==='hidden','portrait: native rotate gate shown and game hidden',g);
    check(/세로 화면은 지원하지 않습니다/.test(g.after)&&g.before!=='none','portrait: RC240 rotate glyph and Korean line',g);
    check(!g.landscape,'portrait: landscape class removed');
    await page.setViewportSize({width:812,height:375});
    await page.waitForFunction(()=>!window.__HAPIL_ORIENTATION_PAUSE_RC152__.paused());
   }
   await context.close();
  }
  // Desktop: no phone classes, no HUD move; stand-off still applies (all modes).
  {
   const {context,page}=await open(browser,'pc',base);
   check(await page.evaluate(()=>!document.documentElement.classList.contains('rc240-phone')&&!document.documentElement.classList.contains('rc240-landscape')),'desktop: no phone classes');
   await stage(page,{name:'dream-boss',zone:'dist06',ids:['dist06-boss'],mode:'DREAM'});
   await page.keyboard.down('ArrowRight');await page.waitForTimeout(1500);await page.keyboard.up('ArrowRight');
   const S=await sample(page);await page.screenshot({path:path.join(out,'pc-dream-boss.png')});
   check(S.bossMinX>=policy.enemyMin-.5&&S.mobMinX>=policy.enemyMin-.5&&S.nSteadyBreaks===0,'desktop DREAM: stand-off holds',S);
   const dz=await page.evaluate(()=>({zoom:window.__HAPIL_CAMERA_RC223__.diagnostics().last?.base?.rc240ZoomRC240??null,fits:window.__HAPIL_MOBILE_LANDSCAPE_RC240__.metrics().zoomFits}));
   check(dz.zoom===null&&dz.fits===0,'desktop: camera untouched (no RC240 zoom)',dz);
   // EGO awakening into new-hero play with the stand-off active.
   const ego=await page.evaluate(async()=>{
    const C=window.__HAPIL_CONTROLS_V31329__,E=window.__HAPIL_EGO_GUARDIAN_RC155__,zones=window.__HAPIL_NATIVE_ARENA_RC138__.maps,narr=window.__MONGSE_NARRATIVE_V395__,s=C.binding.state.current;
    if(!E)return{skipped:'no EGO API'};
    const heroBefore=s.activeHeroId,zone=s.zone;s.zone='cult04';E.confirmPersonaVictory(s,{phase:'complete',entry:'cult-death'});s.zone='village';E.onMapEntry(s,'village',zones,narr);s.zone=zone;E.onMapEntry(s,zone,zones,narr);
    E.consumeCutIn?.(s);await window.__HAPIL_EGO_ART_RC155__?.ensure?.(s);
    return{active:E.state(s).active===true,heroBefore,heroAfter:s.activeHeroId,guardian:s.egoGuardianRC155?.active===true};
   });
   report.ego=ego;
   if(!ego.skipped){
    check(ego.active,'EGO awakening activates with RC240 loaded',ego);
    const t0=await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;window.__HAPIL_BATTLE_ARENA_RC138__.enforce(s);const L=window.__HAPIL_COMBAT_LAYOUT_RC153__,R=window.__RC240_SAMPLE__={heroMaxX:-1e9,mobMinX:1e9,bossMinX:1e9,frames:0,nonFinite:0,steadyBreaks:[]};const G=(x,y)=>({x:640+27*(x-y),y:13.5*(x+y)});R.timer=setInterval(()=>{const w=window.__HAPIL_CONTROLS_V31329__.binding.state.current;R.frames++;if(!Number.isFinite(w.x))R.nonFinite++;R.heroMaxX=Math.max(R.heroMaxX,G(w.x,w.y).x);for(const a of w.enemies??[])if(a.hp>0&&Number.isFinite(a.x)){const e=G(a.x,a.y).x;if(L.boss(a))R.bossMinX=Math.min(R.bossMinX,e);else R.mobMinX=Math.min(R.mobMinX,e);}},100);return s.time;});
    await page.keyboard.down('ArrowRight');await page.waitForTimeout(1500);await page.keyboard.up('ArrowRight');
    const S2=await sample(page);await page.screenshot({path:path.join(out,'pc-ego-awakened.png')});
    check(S2.time>t0&&S2.hp>0,'EGO play advances',{t0,time:S2.time,hp:S2.hp});
    check(S2.nonFinite===0&&S2.mobMinX>=policy.enemyMin-.5&&S2.bossMinX>=policy.enemyMin-.5,'EGO play keeps the stand-off',S2);
   }
   await context.close();
  }
  check(report.errors.length===0,'no page errors',report.errors);
  report.status='passed';
 }catch(e){report.status='failed';report.failure=String(e.stack||e).slice(0,2000);throw e;}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,1));await browser.close();server.close();console.log(JSON.stringify({status:report.status,tagged,checks:report.checks.length,failed:report.checks.filter(c=>!c.ok).length,ego:report.ego,zoom:report.zoom,out}));}
})().catch(e=>{console.error(e);process.exit(1);});
