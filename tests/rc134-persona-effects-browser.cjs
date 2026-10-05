'use strict';
// Staged native attack/render boundaries. Source art is real; no natural campaign claim.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc134-persona-effects';fs.mkdirSync(out,{recursive:true});
const bridge=`\nwindow.__RC134_EFFECT_QA__={initial:oi,hero:id=>F.find(h=>h.id===id),remove:(...a)=>MONGSE_recordProjectileRemoval31215(...a),common:(s,a)=>{bi(s,a,MONGSE_enemyPhase(a));Ei(s,a,{kind:'fan',count:7});MONGSE_pushThemeProjectile3129(s,a,{vx:1,vy:1,damage:10});},nativeTick:s=>{window.__HAPIL_LASERS_V31330__.tick(s,.05);MONGSE_tickBossThemeOrdnance(s);MONGSE_tickBossCombatPatternsV31230(s);MONGSE_tickBossCombatBrainSmartR1(s,s.enemies[0],.05);},move:(s,q,dt)=>MONGSE_stepSignatureProjectile31212(s,q,dt)};`;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer((req,res)=>{try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname.replace(/^\/$/,'/index.html')));if(!file.startsWith(root+'/'))return res.writeHead(403).end();res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');const bytes=fs.readFileSync(file);res.end(file.endsWith('/assets/index-v31526.js')?bytes.toString()+bridge:bytes);}catch{res.writeHead(404).end();}});
const report={commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),scope:'Staged native source-only warnings, flights, terminal impacts and removals on desktop/portrait/landscape browser emulation',status:'running',profiles:[]};
const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
 browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const[name,width,height,mobile]of[['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),row={name,errors:[],httpErrors:[]};report.profiles.push(row);
  try{page.on('pageerror',e=>row.errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)row.httpErrors.push({status:r.status(),url:r.url()});});
   await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__HAPIL_RC133_NATIVE__?.installed&&window.__HAPIL_MEDIA_ART_RC133__?.ready);await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game');await page.locator('.game-stage canvas').waitFor({state:'visible'});
   row.result=await page.evaluate(()=>{
    const Q=window.__RC134_EFFECT_QA__,H=window.__HAPIL_INNER_FINAL_RC133__,M=window.__HAPIL_MEDIA_ART_RC133__,T=window.__HAPIL_THEME_V31323__,B=window.__HAPIL_RC86_BRIDGE__,control=window.__HAPIL_CONTROLS_V31329__,binding=control.binding,original=binding.state.current,canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
    const ctx=canvas.getContext('2d'),cache={},clean=p=>p?new URL(String(p),location.href).pathname.replace(/^\//,'./'):'',allowed=new Set([...Object.values(M.personaSkills),...Object.values(M.samongSkills)].map(clean)),problems=[],rows=[];let checks=0;
    const check=(pass,label,extra)=>{checks++;if(!pass)problems.push({label,extra});};
    for(const p of M.assets()){const im=M.picture(p);if(im){cache[p]=im;cache[clean(p)]=im;}}
    const trace=draw=>{const paths=[],base=ctx.drawImage;ctx.save();try{ctx.filter='none';ctx.globalAlpha=1;ctx.drawImage=function(im,...a){if(im?.src)paths.push(clean(new URL(im.src,location.href).pathname.replace(/^\//,'./')));return base.call(this,im,...a);};draw();}finally{ctx.drawImage=base;ctx.restore();}return paths;};
    window.__HAPIL_SAMONG_RC91__.unlock(null,'777');
    try{for(let i=0;i<H.deck.length;i++){
     const s=Q.initial();Object.assign(s,{zone:'cult04',time:100,x:16,y:24,hp:240,maxHp:240,activeHeroId:'gunner',gameModeV31346:'DREAM',samongUnlockedRC91:true,practiceV31329:false,encounterLockUntil31226:0,encounterDialogue31226:null,encounterWallUnlockAtV31227:0,timeStopUntil:0,invulnerableUntil:0});binding.state.current=s;
     const leader=B.cloneEnemy(B.actor('cult04','c104-boss'),'cult04');leader.hp=0;s.enemies=[leader];check(H.start(s,leader),'real hidden start '+i);Object.assign(s.innerFinalRC133,{intro:0,cycle:i,shotDelay:0});H.tick(s,.016);
     const key=H.deck[i].key,expected=clean(M.personaSkills[key]),packets=s.hostileProjectiles.filter(q=>q.rc133Skill===key);check(packets.length>0,'native packet '+key);const q=packets[0];if(!q)continue;
     T.begin(s,.016);check(['sprite','fallbackSprite','sevenSinImpactSprite','impactSpriteV31224','impactFallbackSprite','telegraphSpriteV31224'].every(k=>clean(q[k])===expected),'native owner bind preserves all source identities '+key,q);
     window.__HAPIL_BITMAP_NATIVE_RC133__.observe(canvas,cache);
     const warning=trace(()=>T.debug.drawProjectile(ctx,cache,q,s.time,binding.settings.current));check(warning.includes(expected)&&warning.every(p=>allowed.has(p)),'final warning image from source-only registry '+key,warning);
     check(!window.__HAPIL_CONTACT_V31336__.projectile(s,s,q).hit,'warning collision remains disabled '+key);
     s.time=Math.max(q.frozenUntil,q.collisionDisabledUntil31219)+.05;q.previousX=q.x;q.previousY=q.y;q.x-=.3;q.y+=.3;
     const flight=trace(()=>T.debug.drawProjectile(ctx,cache,q,s.time,binding.settings.current));check(flight.includes(expected)&&flight.every(p=>allowed.has(p)),'final flight image from source-only registry '+key,flight);
     check(q.screenAligned31222===!['eye','lance'].includes(key)&&q.spriteHeading===0,'upright motifs and native directional motifs '+key);const plan=window.__HAPIL_BITMAP_NATIVE_RC133__.projectile(s,q);check(clean(plan?.path)===expected&&plan.area>0,'source image contact plan '+key,plan);
     const endings=[];for(const reason of ['contact','parry','skill','expired']){
      const packet={...q,id:s.fxSerial++};delete packet.themeEndedV31323;s.effects=[];T.terminal(s,packet,reason,true);
      const fx=s.effects.find(e=>e.themeTerminalV31323);check(clean(fx?.sprite)===expected,'native terminal identity '+key+'/'+reason,fx);
      const paths=fx?trace(()=>T.debug.drawEffect(ctx,cache,fx,s.time+.01,binding.settings.current)):[];
      check(paths.includes(expected)&&paths.every(p=>allowed.has(p)),'final terminal bitmap source-only '+key+'/'+reason,paths);endings.push({reason,sprite:fx?.sprite,paths});
     }
     rows.push({key,packet:q,packets:packets.length,warning,flight,endings});H.restore(s,null);
    }}finally{binding.state.current=original;T.begin(original,.016);}
    const timed=[],P=window.__HAPIL_PERSONA_DUEL_RC134__;
    try{for(const hero of window.__HAPIL_SAMONG_RC91__.heroes){
     const s=Q.initial();Object.assign(s,{zone:'cult04',time:100,x:16,y:24,hp:240,maxHp:240,activeHeroId:hero,gameModeV31346:'DREAM',samongUnlockedRC91:true,practiceV31329:false,encounterLockUntil31226:0,encounterDialogue31226:null,encounterWallUnlockAtV31227:0,timeStopUntil:0,invulnerableUntil:0});binding.state.current=s;
     const leader=B.cloneEnemy(B.actor('cult04','c104-boss'),'cult04');leader.hp=0;s.enemies=[leader];check(H.start(s,leader),'timed hidden start '+hero);const a=H.boss(s),seen=new Map(),waves=[];let maxPending=0;
     for(let step=0;step<600;step++){
      s.time+=.05;H.tick(s,.05);Q.nativeTick(s);Q.common(s,a);T.begin(s,.05);
      maxPending=Math.max(maxPending,s.hostileProjectiles.length);
      for(const q of s.hostileProjectiles){if(!seen.has(q.id)){seen.set(q.id,q.rc133Skill);waves.push({time:s.time,cycle:q.rc133Cycle,key:q.rc133Skill});check(q.rc133InnerShot&&allowed.has(clean(q.sprite))&&['fallbackSprite','sevenSinImpactSprite','impactSpriteV31224','impactFallbackSprite','telegraphSpriteV31224'].every(k=>clean(q[k])===clean(q.sprite)),'timed actual native packet only approved '+hero,{sprite:q.sprite,skill:q.rc133Skill});}
       if(q.frozenUntil<=s.time)Q.move(s,q,.05);
      }
      s.hostileProjectiles=s.hostileProjectiles.filter(q=>q.expiresAt>s.time&&!q.projectileRemovalReason31215);
     }
     const keys=[...new Set(seen.values())],volleyTimes=[...new Map(waves.map(q=>[q.cycle,q.time])).values()];check(keys.length===9,'timed native rotation emits all nine '+hero,keys);check(volleyTimes.length>=18,'frequent timed emissions '+hero,volleyTimes);check(maxPending<=60,'timed native queue bounded '+hero,maxPending);check(s.pendingHits.every(q=>q.sourceId!==H.id),'common native casts blocked '+hero,s.pendingHits.map(q=>({source:q.sourceId,label:q.label,path:q.sprite})));
     for(const [x,y]of [[12,19],[19,26]]){s.x=x;s.y=y;for(let j=0;j<180;j++)P.tick(s,.016);check(Math.abs(a.x+s.x-38)<1e-5&&Math.abs(a.y+s.y-38)<1e-5,'both axes center symmetry '+hero,{player:{x:s.x,y:s.y},boss:{x:a.x,y:a.y}});check(P.contains(s,'left')&&P.contains(a,'right'),'native floor halves maintained '+hero);}
     s.samongPassiveRC91={active:7,cooldown:77};Object.assign(s.innerFinalRC133,{awake:7,cycle:0,shotDelay:0});s.hostileProjectiles=[];H.tick(s,.016);check(s.hostileProjectiles.length===H.deck[0].count*2&&s.hostileProjectiles.every(q=>Math.hypot(q.vx,q.vy)<=7.5&&q.sprite===M.samongSkills[H.deck[0].key]&&q.frozenUntil-s.time>=.62-1e-8&&q.collisionDisabledUntil31219>=q.frozenUntil),'actual awakened volley uses distinct source atlas and readable wind-up '+hero);check(Math.abs(s.innerFinalRC133.shotDelay-.97)<1e-8,'mutual cadence waits through the entire cast lock '+hero);const boss=H.boss(s),castUntil=boss.atomicCastUntil31210;s.time+=.05;boss.staggerUntil=s.time+1;const ownVolley=s.hostileProjectiles.filter(q=>q.rc133InnerShot);check(boss.atomicCastUntil31210===castUntil&&ownVolley.length===H.deck[0].count*2&&ownVolley.every(q=>s.hostileProjectiles.includes(q)&&q.collisionDisabledUntil31219<=castUntil+1e-8),'stagger does not cancel the committed volley or shorten its cast window '+hero,{castUntil,atomic:boss.atomicCastUntil31210,projectiles:ownVolley.map(q=>({frozen:q.frozenUntil,collision:q.collisionDisabledUntil31219,stillPresent:s.hostileProjectiles.includes(q)}))});
     const tempoSteps=[];for(let i=0;i<230;i++){const dt=P.tempo(s,.016);tempoSteps.push(dt);P.tick(s,dt);}check(tempoSteps.some(x=>x===0)&&tempoSteps.some(x=>x>0),'bounded stop recovers in actual browser '+hero);check(!P.swapped(s),'brief faction exchange already returned '+hero);
     const saved=H.snapshot(s),r=Q.initial();Object.assign(r,{zone:'cult04',gameModeV31346:'DREAM',samongUnlockedRC91:true,hp:240,maxHp:240,activeHeroId:hero,time:s.time,x:s.x,y:s.y,samongPassiveRC91:{active:7,cooldown:77}});H.restore(r,saved);const origStep=P.tempo(s,.016),restoredStep=P.tempo(r,.016);check(origStep===restoredStep&&r.innerFinalRC133.tempoSeed===s.innerFinalRC133.tempoSeed,'native hidden save preserves seeded tempo progress '+hero);H.restore(r,null);
     timed.push({hero,keys,packets:seen.size,volleys:volleyTimes.length,maxPending,firstTime:volleyTimes[0],lastTime:volleyTimes.at(-1)});H.restore(s,null);
    }}finally{binding.state.current=original;T.begin(original,.016);}
    return{checks,problems,rows,timed,sourcePaths:[...allowed]};
   });save();assert.deepEqual(row.result.problems,[]);assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);row.status='passed';console.log('RC134_PERSONA_EFFECTS',JSON.stringify({name,checks:row.result.checks,status:'passed'}));
  }finally{save();await context.close();}
 }
 report.status='passed';
 }catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}finally{save();await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
