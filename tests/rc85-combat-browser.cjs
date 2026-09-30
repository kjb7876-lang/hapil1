// Browser integration test. Install Playwright; optionally set HAPIL_CHROMIUM.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.HAPIL_QA_OUTPUT||path.join(os.tmpdir(),'hapil-rc52');fs.mkdirSync(output,{recursive:true});
const server=require('node:http').createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)){res.statusCode=403;res.end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(file.endsWith('index-v31526.js')?fs.readFileSync(file,'utf8')+'\nwindow.__RC85_TEST__={get An(){return An},get Ln(){return Ln},F,G,lineOfSight:(s,a,p)=>!pt(s.zone,a,p,.12)&&!ut(s.zone,p.x,p.y,.18)};':fs.readFileSync(file));}catch{res.statusCode=404;res.end();}
}).listen(0,'127.0.0.1');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||undefined,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
 await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('.hero-card').nth(6).click();
 await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');
 await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
 // Exercise the production dash callback, including the flags set by automatic evasion.
 const dash=await page.evaluate(()=>{const c=window.__HAPIL_CONTROLS_V31329__,s=window.__MONGSE_QA_STATE__,before=s.time;
 c.setMode('full');s.combatModeV31329='full';s.autoDodgeBlinkDispatchV31576=true;s.simpleDodgeVectorV31368={x:1,y:0};
 const x=s.x,y=s.y;try{c.binding.actions.dash();}finally{delete s.autoDodgeBlinkDispatchV31576;delete s.simpleDodgeVectorV31368;}
 return {x,y,afterX:s.x,afterY:s.y,lastDodgeAt:s.lastDodgeAt,before};});
 assert.equal(dash.lastDodgeAt,dash.before);assert(dash.afterX>=dash.x);assert(Math.abs(dash.afterY-dash.y)<.001);
 await page.waitForFunction(t=>window.__MONGSE_QA_STATE__.time>t+.3,dash.before);
 // Keep the test player alive to isolate real attack -> death -> story progression.
 // Enemy health and attack damage are never changed by this fixture.
 await page.evaluate(()=>{window.__rc85Survival=setInterval(()=>{const s=window.__MONGSE_QA_STATE__;if(s&&s.hp>0)s.hp=s.maxHp},30);window.__HAPIL_CONTROLS_V31329__.setMode('semi');});
 await page.waitForSelector('#hapil-story-rc51[data-phase="post"]',{timeout:90000});
 const result=await page.evaluate(()=>({time:window.__MONGSE_QA_STATE__.time,live:window.__MONGSE_QA_STATE__.enemies.filter(a=>a.hp>0).length,beam:window.__HAPIL_CONNECTED_LASER_V31377__.stats()}));
 assert.equal(result.live,0);console.log('FIRST_BATTLE',JSON.stringify(result));
 await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
 await page.waitForFunction(t=>window.__MONGSE_QA_STATE__.time>t+.3,result.time);
 await page.evaluate(()=>{window.__HAPIL_CONTROLS_V31329__.setMode('manual');window.__MONGSE_QA_API__.stageV3128BossShowcase('ep1a11');});
 await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
 const beforeLaser=await page.evaluate(()=>window.__HAPIL_CONNECTED_LASER_V31377__.stats().draws);
 // The mask's phase 0 has no laser card. Exercise a real authored combat phase
 // for this separate renderer check; the first encounter above stays natural.
 // Showcase entry can be temporarily locked and preserves the previous hero
 // position. Prepare a legal in-range target and retry normal admission; never
 // erase a committed cast or weaken the actual first battle above.
 await page.waitForFunction(()=>{const s=window.__MONGSE_QA_STATE__,a=s.enemies.find(a=>a.boss),b=window.__HAPIL_RC86_BRIDGE__;
 if(!a||a.hp<=0)return false;
 const phase=[1,2,3].find(ph=>b.patterns(a,ph).some(p=>p.laserV31331));if(!phase)throw Error('showcase has no native laser card');
 a.humanPhase0=false;a.fixedPhase=phase;a.currentPhase=phase;
 const pattern=b.patterns(a,phase).find(p=>p.laserV31331);
 for(let i=0;i<24;i++){const angle=i*Math.PI/12,p=b.point(s.zone,a.x+Math.cos(angle)*2,a.y+Math.sin(angle)*2,.48);
  if(Math.hypot(p.x-a.x,p.y-a.y)<=pattern.radius+.3&&window.__RC85_TEST__.lineOfSight(s,a,p)){s.x=p.x;s.y=p.y;break;}}
 return (s.bossLaserCastsV31330??[]).some(c=>c.sourceId===a.id&&c.endAt>s.time)||!!window.__HAPIL_LASERS_V31332__.dispatch(s,a,0);
 },null,{timeout:20000,polling:100});
 console.log('LASER_STAGE',await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;return {casts:s.bossLaserCastsV31330?.map(c=>({beam:c.beam,fireAt:c.fireAt,endAt:c.endAt}))}}));
 await page.waitForFunction(n=>window.__HAPIL_CONNECTED_LASER_V31377__.stats().draws>n,beforeLaser,{timeout:20000});
 const sprites=await page.evaluate(()=>{const api=window.__HAPIL_HERO_CONSISTENCY_RC5__,t=window.__RC85_TEST__,hero=t.F.find(h=>h.id==='slayer');
 const rows=[];for(const dir of ['front','back','left','right'])for(const kind of ['idle','move','attack','skill','guard','dash','hurt']){
 const m={kind,direction:dir,characterCommitV31342:{sector:{front:'s',back:'n',left:'w',right:'e'}[dir]},dx:dir==='left'?-1:1,dy:dir==='back'?-1:1,started:1,until:1.5,facing:dir==='left'?-1:1};
 const options=t.An({authoredTimeV31345:1.2},hero,m,'old.png'),p=options.canonicalHeroRC5;
 rows.push({dir,kind,p,mixed:!!options.stableSideAttackRC64});}
 return {rows,sheets:api.sheets.slayer};});
 assert.equal(sprites.rows.length,28);assert(sprites.rows.every(r=>r.p&&r.p.dir===r.dir&&['walk','action'].includes(r.p.sheet)&&!r.mixed));assert(!sprites.sheets.down);
 await page.evaluate(()=>clearInterval(window.__rc85Survival));
 assert.deepEqual(errors,[]);await page.screenshot({path:path.join(output,'rc85-first-battle-complete.png')});
 console.log('RC85 BROWSER PASS',JSON.stringify({dash,firstBattle:result,slayerPoses:sprites.rows.length,pageErrors:errors.length,survivalFixture:true}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
