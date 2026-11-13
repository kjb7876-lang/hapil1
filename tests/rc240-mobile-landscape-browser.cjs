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
  // A staged world may place the hero in the old RC223 strip; RC240 eases it
  // out at policy.settleRate (<= .4 s). Sample the steady state after that.
  const R=window.__RC240_SAMPLE__={heroMaxX:-1e9,enemyMinX:1e9,minGap:1e9,frames:0,nonFinite:0,start:performance.now()+800};
  const G=(x,y)=>({x:640+27*(x-y),y:13.5*(x+y)});
  R.timer=setInterval(()=>{const w=window.__HAPIL_CONTROLS_V31329__.binding.state.current;if(!w||performance.now()<R.start)return;R.frames++;if(!Number.isFinite(w.x)||!Number.isFinite(w.y))R.nonFinite++;const h=G(w.x,w.y);R.heroMaxX=Math.max(R.heroMaxX,h.x);
   for(const a of w.enemies??[]){if(!(a.hp>0)||a.visualOnly)continue;if(!Number.isFinite(a.x)||!Number.isFinite(a.y)){R.nonFinite++;continue;}const e=G(a.x,a.y);R.enemyMinX=Math.min(R.enemyMinX,e.x);R.minGap=Math.min(R.minGap,Math.hypot(e.x-h.x,e.y-h.y));}},100);
  return {zone:s.zone,actors:actors.length};
 },fixture);
}
const sample=page=>page.evaluate(()=>{const R=window.__RC240_SAMPLE__;clearInterval(R.timer);const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return{...R,timer:undefined,time:s.time,hp:s.hp,snapshot:window.__HAPIL_MOBILE_LANDSCAPE_RC240__.snapshot(s)};});
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
 return{vw:innerWidth,vh:innerHeight,classes:document.documentElement.className,items,left:poly('left'),right:poly('right'),danmaku,bodies,hero:scr(s.x,s.y)};
});
const overlap=(a,b,pad=0)=>!!a&&!!b&&Math.min(a.r,b.r)-Math.max(a.l,b.l)>pad&&Math.min(a.b,b.b)-Math.max(a.t,b.t)>pad;
const polyHitsRect=(pts,r)=>{if(!r)return false;const inside=(x,y)=>{let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;};
 for(const p of pts)if(p.x>r.l&&p.x<r.r&&p.y>r.t&&p.y<r.b)return true;for(const [x,y] of [[r.l,r.t],[r.r,r.t],[r.l,r.b],[r.r,r.b]])if(inside(x,y))return true;return false;};

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch(process.env.RC240_CHANNEL?{channel:process.env.RC240_CHANNEL}:{});
 const policy={heroMax:640-1.45*27,enemyMin:640+5*27};
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
    check(S.heroMaxX<=policy.heroMax+.5,tag+': hero held in the left zone while pushing right/up',{heroMaxX:S.heroMaxX});
    check(S.enemyMinX>=policy.enemyMin-.5,tag+': enemies held behind the stand-off line',{enemyMinX:S.enemyMinX});
    check(S.minGap>=policy.enemyMin-policy.heroMax-1,tag+': hero/enemy foot gap >= designed gap',{minGap:S.minGap});
    check(S.snapshot.mode==='standoff',tag+': stand-off active in '+fixture.mode);
    const it=L.items;
    for(const [a,b] of [['F','resonance'],['F','settings'],['F','actions'],['F','stick'],['resonance','settings'],['stick','actions']])check(!overlap(it[a],it[b],1),tag+`: ${a} does not overlap ${b}`,{[a]:it[a],[b]:it[b]});
    if(L.danmaku){check(!overlap(it.F,L.danmaku,1),tag+': F button clear of danmaku panel');check(!overlap(it.resonance,L.danmaku,1),tag+': resonance bar clear of danmaku panel',{res:it.resonance,panel:L.danmaku});}
    for(const k of ['stick','actions','F'])check(!polyHitsRect(L.left,it[k])&&!polyHitsRect(L.right,it[k]),tag+`: legal floor stays clear of ${k}`);
    for(const b of L.bodies)check(b.l>=-2&&b.r<=L.vw+2&&b.t>=-2&&b.b<=L.vh+2,tag+`: ${b.id} body fully on screen`,b);
    const heroBody=L.bodies.find(b=>b.id==='hero');
    if(heroBody)check(!overlap(heroBody,it.stick,1),tag+': thumb on stick does not cover the hero',{hero:heroBody,stick:it.stick});
   }
   if(profile==='mini'){
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
   check(S.heroMaxX<=policy.heroMax+.5&&S.enemyMinX>=policy.enemyMin-.5,'desktop DREAM: stand-off holds',S);
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
    const t0=await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;window.__HAPIL_BATTLE_ARENA_RC138__.enforce(s);const R=window.__RC240_SAMPLE__={heroMaxX:-1e9,enemyMinX:1e9,minGap:1e9,frames:0,nonFinite:0};const G=(x,y)=>({x:640+27*(x-y),y:13.5*(x+y)});R.timer=setInterval(()=>{const w=window.__HAPIL_CONTROLS_V31329__.binding.state.current;R.frames++;if(!Number.isFinite(w.x))R.nonFinite++;R.heroMaxX=Math.max(R.heroMaxX,G(w.x,w.y).x);for(const a of w.enemies??[])if(a.hp>0&&Number.isFinite(a.x))R.enemyMinX=Math.min(R.enemyMinX,G(a.x,a.y).x);},100);return s.time;});
    await page.keyboard.down('ArrowRight');await page.waitForTimeout(1500);await page.keyboard.up('ArrowRight');
    const S2=await sample(page);await page.screenshot({path:path.join(out,'pc-ego-awakened.png')});
    check(S2.time>t0&&S2.hp>0,'EGO play advances',{t0,time:S2.time,hp:S2.hp});
    check(S2.nonFinite===0&&S2.heroMaxX<=policy.heroMax+.5,'EGO hero held in the left zone',S2);
   }
   await context.close();
  }
  check(report.errors.length===0,'no page errors',report.errors);
  report.status='passed';
 }catch(e){report.status='failed';report.failure=String(e.stack||e).slice(0,2000);throw e;}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,1));await browser.close();server.close();console.log(JSON.stringify({status:report.status,tagged,checks:report.checks.length,failed:report.checks.filter(c=>!c.ok).length,ego:report.ego,out}));}
})().catch(e=>{console.error(e);process.exit(1);});
