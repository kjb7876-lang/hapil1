// Browser integration test. Install Playwright; optionally set HAPIL_CHROMIUM.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.HAPIL_QA_OUTPUT||path.join(os.tmpdir(),'hapil-rc51');fs.mkdirSync(output,{recursive:true});
const server=require('node:http').createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)){res.statusCode=403;res.end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(file.endsWith('index-v31526.js')?fs.readFileSync(file,'utf8')+'\nwindow.__RC69_TEST__={get Fi(){return Fi;},get ji(){return ji;},get Ii(){return Ii;},get MONGSE_applyProjectileOrigin(){return MONGSE_applyProjectileOrigin;},get Gn(){return Gn;},MONGSE_SPRITE_META};':fs.readFileSync(file));}catch{res.statusCode=404;res.end();}
}).listen(0,'127.0.0.1');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/tmp/chromium',args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
 await page.waitForFunction(()=>window.__HAPIL_RC69__?.installed,{timeout:30000});
 const audit=await page.evaluate(()=>window.__HAPIL_RC69__.audit());console.log('AUDIT',JSON.stringify(audit));assert.equal(audit.allPass,true);
 const bullets=await page.evaluate(()=>{const api=window.__HAPIL_DANMAKU_V31316__,r=api.rankedRows()[0],a={...r.actor,boss:true,hp:100,x:8,y:8},s={zone:r.zone,hp:240,x:16,y:16,enemies:[a]};return{cap:String(api.barrageCap()),plan:api.plan(s,a,'normal',20)};});
 assert.equal(bullets.cap,'Infinity');assert(bullets.plan?.count>=60,'desktop barrage must admit dense authored patterns');assert(bullets.plan.art.sprite.endsWith('danmaku-jellybean.webp'));
 await page.keyboard.press('Escape');await page.waitForSelector('#mongse-christian-opening-v31236',{state:'detached'});
 await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('.hero-card').filter({hasText:'악몽'}).first().click();
 await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
 await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');
 await page.waitForFunction(()=>[...document.querySelectorAll('#hapil-story-rc51 button')].some(b=>b.textContent==='음성 일시정지'),{timeout:15000});
 assert((await page.locator('#hapil-story-rc51').innerText()).includes('음성 1'));
 await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
 await page.waitForFunction(()=>window.__MONGSE_QA_STATE__&&window.__MONGSE_QA_API__);
 await page.evaluate(()=>window.__MONGSE_QA_API__.completeCurrentZone());
 await page.waitForSelector('#hapil-story-rc51[data-phase="post"]');
 await page.waitForFunction(()=>[...document.querySelectorAll('#hapil-story-rc51 button')].some(b=>b.textContent==='음성 일시정지'),{timeout:15000});
 assert((await page.locator('#hapil-story-rc51').innerText()).includes('음성 2'));
 await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
 await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;window.__HAPIL_RC69__.enter(s,'dist04');s.invulnerableUntil=s.time+100;});
 await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');
 const allies=await page.evaluate(()=>window.__MONGSE_QA_STATE__.enemies.filter(a=>a.midboss).map(a=>({id:a.id,sprite:a.sprite,x:a.x,y:a.y})));
 assert.equal(allies.length,2);assert.equal(new Set(allies.map(a=>a.id)).size,2);assert.equal(new Set(allies.map(a=>a.sprite)).size,1);
 await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();await page.waitForTimeout(300);
 console.log('COMRADES',JSON.stringify(await page.evaluate(()=>window.__MONGSE_QA_STATE__.enemies.filter(a=>a.midboss).map(a=>({sprite:a.sprite,art:a.comradeArtRC69,flag:a.allyEchoMidbossRC69})))));await page.screenshot({path:path.join(output,'rc69-companion-triad.png')});
 await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;window.__HAPIL_RC69__.enter(s,'dist06');s.invulnerableUntil=s.time+100;});
 await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
 await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;s.enemies=[];s.spawnedWaves=new Set([1,2]);s.completedWaves31228=new Set([1,2]);});
 await page.waitForFunction(()=>window.__MONGSE_QA_STATE__.enemies.filter(a=>a.midboss).length===2);
 const anchors=await page.evaluate(()=>window.__MONGSE_QA_STATE__.enemies.filter(a=>a.midboss).map(a=>({id:a.id,x:a.x,y:a.y,fixed:a.fixedCombatPositionRC69})));
 assert(anchors.every(a=>a.fixed));await page.waitForTimeout(800);
 const positions=await page.evaluate(()=>window.__MONGSE_QA_STATE__.enemies.filter(a=>a.midboss).map(a=>({id:a.id,x:a.x,y:a.y,fixed:a.fixedCombatPositionRC69})));
 assert.deepEqual(positions,anchors,'tower triad stays at admitted map positions');
 await page.screenshot({path:path.join(output,'rc69-fixed-tower-fission.png')});
 const restored=await page.evaluate(()=>{const t=window.__RC69_TEST__,s=window.__MONGSE_QA_STATE__;s.enemies=s.enemies.filter((a,i)=>i>0);const before=s.enemies.filter(a=>a.midboss).map(a=>a.id).sort(),raw=t.Fi(s,s.activeHeroId,[],{},0),saved=t.ji(raw),after=t.Ii(saved).filter(a=>a.midboss).map(a=>a.id).sort();return{before,after,rows:saved?.midbossTrioRosterRC69,rawRows:raw?.midbossTrioRosterRC69,zone:saved?.zone,rawZone:raw?.zone};});
 console.log('RESTORE',JSON.stringify(restored));assert.deepEqual(restored.after,restored.before,'saving one survivor does not respawn the defeated member or lose custom clone IDs');
 const projectile=await page.evaluate(()=>window.__RC69_TEST__.MONGSE_applyProjectileOrigin({kind:'projectile',x:8,y:8,tx:13,ty:13,born:0,duration:.38},'slayer','front','A'));
 assert.equal(projectile.slayerForwardCoreFlightRC69,true);assert(projectile.duration>=.52);
 const meta=await page.evaluate(()=>window.__RC69_TEST__.MONGSE_SPRITE_META['./assets/rc64/projectiles/danmaku-jellybean.webp']);assert(meta.every(n=>Number.isFinite(n)&&n>=0&&n<=1),'sprite crop uses normalized coordinates');
 const core=await page.evaluate(()=>{const api=window.__HAPIL_RC69__,e={x:8,y:8,tx:13,ty:13,born:0,duration:.52,startOffsetX:0,startOffsetY:-20,endOffsetY:-8};return[api.coreFrame(e,.01),api.coreFrame(e,.3)];});
 assert(core[1].y>core[0].y,'downward attack core travels forward');
 const cosmic=await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,api=window.__HAPIL_LUCIFER_V31318__;window.__HAPIL_STORY_RC51__.close(false);window.__MONGSE_QA_API__.stageV3128BossShowcase('ep1a11');const boss=s.enemies.find(a=>a.id==='a11-boss');boss.hp=0;const changed=api.beforeDeath(s,boss);return{changed,active:api.active(s),map:api.mapFor(s,'wrong'),sprite:api.actorFor(s)?.sprite};});
 assert.equal(cosmic.changed,true);assert.equal(cosmic.active,true);assert(cosmic.map.endsWith('false-heaven-cosmic-arena.webp'));assert(cosmic.sprite.includes('cosmic-lucifer'));
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('RC69 BROWSER PASS: runtime install, real roster audit, desktop jellybean plan, voice 1/2 autoplay, forward core, zero page errors.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
