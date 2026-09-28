// Browser integration test. Install Playwright; optionally set HAPIL_CHROMIUM.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.HAPIL_QA_OUTPUT||path.join(os.tmpdir(),'hapil-rc51');fs.mkdirSync(output,{recursive:true});
const server=require('node:http').createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)){res.statusCode=403;res.end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}
}).listen(0,'127.0.0.1');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||undefined,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);await page.waitForFunction(()=>window.__HAPIL_STORY_NATIVE_RC51__?.installed);await page.evaluate(()=>document.fonts.ready);await page.keyboard.press('Escape');await page.waitForSelector('#mongse-christian-opening-v31236',{state:'detached'});
 const layout=[];
 for(const [width,height] of [[1280,900],[390,844],[360,740],[844,390]]){
  await page.setViewportSize({width,height});
  const result=await page.evaluate(()=>{const a=window.__HAPIL_STORY_RC51__,rows=[];for(const r of a.records.values()){if(r.rest)continue;for(const k of ['pre','post','firstPost','awakenPre']){if(!r[k])continue;a.show({zone:r.zone},r,k,r[k]);const e=document.getElementById('hapil-story-rc51');const panel=e.querySelector('.rc51-panel').getBoundingClientRect(),footer=e.querySelector('.rc51-footer').getBoundingClientRect();rows.push({zone:r.zone,phase:k,font:Number(e.dataset.font),fits:e.dataset.fits,visible:panel.top>=0&&footer.bottom<=window.innerHeight});a.close(false);}}return rows;});
  const failures=result.filter(x=>x.fits!=='true'||!x.visible);layout.push({width,height,cards:result.length,minFont:Math.min(...result.map(x=>x.font)),failures});assert.equal(failures.length,0,JSON.stringify(failures));
 }
 console.log('LAYOUT',JSON.stringify(layout));
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const a=window.__HAPIL_STORY_RC51__,r=a.records.get('ep1b01');a.show({zone:r.zone},r,'pre',r.pre);});await page.screenshot({path:path.join(output,'mobile-story.png')});await page.evaluate(()=>window.__HAPIL_STORY_RC51__.close(false));
 await page.setViewportSize({width:1280,height:900});
 await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
 await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');
 assert((await page.locator('#hapil-story-rc51').innerText()).includes('음성 1 — 기억의 독백'),'the uploaded monologue must open directly before the first map');
 const legacy=await page.evaluate(()=>({status:window.__HAPIL_LEGACY_STORY_RC58__,dialogue:window.__MONGSE_ENCOUNTER_DIALOGUE_V31229__?.resolve?.('dist00','combat'),interlude:window.__MONGSE_NARRATIVE_DIALOGUE_V31229__?.resolveInterlude?.('hub','dist00')}));
 assert.equal(legacy.status.activeLines,0);assert.equal(legacy.dialogue.lines.length,0);assert.equal(legacy.interlude,null);
 await page.waitForFunction(()=>window.__MONGSE_QA_API__&&window.__MONGSE_QA_STATE__);
 const frozenTime=await page.evaluate(()=>window.__MONGSE_QA_STATE__.time);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.__MONGSE_QA_STATE__.time),frozenTime,'narration pauses combat');
 await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();await page.waitForTimeout(100);
 await page.evaluate(()=>window.__MONGSE_QA_API__.completeCurrentZone());
 await page.waitForSelector('#hapil-story-rc51[data-phase="post"]');await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
 await page.waitForTimeout(200);assert.equal(await page.locator('#hapil-story-rc51').count(),0,'post does not repeat');
 await page.evaluate(()=>window.__MONGSE_QA_API__.stageV3128BossShowcase('cult04'));
 await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
 // Start the real final transition using a protected first-defeat state.
 await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,b=s.enemies.find(e=>e.id==='c104-boss');b.hapilFirstDefeatV31300=true;b.hp=1;b.invulnerableUntil=s.time+7;b.phaseTransitionUntil=s.time+7;s.hapilFinalBattleV31300={bossId:b.id,startedAt:s.time,stage:0,secondPhaseActive:false,completed:false};});
 await page.waitForSelector('#hapil-story-rc51[data-phase="firstPost"]');await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
 await page.waitForSelector('#hapil-story-rc51[data-phase="awakenPre"]',{timeout:20000});await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
 await page.waitForFunction(()=>window.__HAPIL_STORY_RC51__.active(window.__MONGSE_QA_STATE__),{timeout:15000});
 await page.waitForFunction(()=>getComputedStyle(document.documentElement).filter==='grayscale(1)');
 const snapshot=()=>page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;return {time:s.time,x:s.x,y:s.y,lastAttack:s.lastAttack,hero:s.activeHeroId,hp:s.hp,boss:s.enemies.find(e=>e.id==='c104-boss')?.hp,stop:document.documentElement.classList.contains('rc51-time-stop'),strikes:s.pendingStrikes.length,events:window.__HAPIL_SKILL_COMPLETION_V31412__.metrics().basicAttacksStarted};});
 const before=await snapshot();await page.keyboard.down('ArrowRight');await page.waitForTimeout(450);await page.keyboard.up('ArrowRight');const after=await snapshot();
 assert(Math.hypot(after.x-before.x,after.y-before.y)>.2,'physician moves during stopped world time');
 await page.screenshot({path:path.join(output,'samong.png')});console.log('AWAKENING',JSON.stringify({before,after}));
 // Story ending must wait for its final uploaded card, then commit the existing save path.
 await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;s.enemies=[];s.bossDefeated=true;s.spawnedWaves=new Set([1,2,3]);});
 await page.waitForSelector('#hapil-story-rc51[data-phase="post"]');
 assert.equal(await page.evaluate(()=>window.__MONGSE_QA_STATE__.zone),'cult04');
 await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__.zone==='village');
 assert.equal(await page.evaluate(()=>localStorage.getItem('hapilCampaignCompleteV31301')),'true');
 assert.equal(errors.length,0,errors.join('\n'));console.log('BROWSER PASS: layout, pre/post pause and once, final transition, grayscale, movement, ending/save.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
