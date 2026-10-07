// Browser integration test. Install Playwright; optionally set HAPIL_CHROMIUM.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.HAPIL_QA_OUTPUT||path.join(os.tmpdir(),'hapil-rc52');fs.mkdirSync(output,{recursive:true});
const server=require('node:http').createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)){res.statusCode=403;res.end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}
}).listen(0,'127.0.0.1');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({chromiumSandbox: true, executablePath:process.env.HAPIL_CHROMIUM||undefined,args:['--disable-dev-shm-usage']});
 const results=[];
 try {
  for(const [index,mobile] of (process.env.HAPIL_QA_HERO==='slayer'?[[6,false],[6,true]]:[...Array.from({length:8},(_,i)=>[i,false]),[6,true]])){
   const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
   const intro=page.locator('#mongse-christian-opening-v31236');
   assert((await intro.innerText()).includes('그리스도께서 네게 비추이시리라.'));
   await page.keyboard.press('Enter');assert.equal(await intro.getAttribute('data-phase'),'mark');
   await page.keyboard.press('Escape');await intro.waitFor({state:'detached'});
   await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
   const card=page.locator('.hero-card').nth(index),name=await card.locator('strong').innerText();await card.click();
   await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
   await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]',{timeout:20000});
   assert((await page.locator('#hapil-story-rc51').innerText()).includes('음성 1 — 기억의 독백'));
   assert.equal(await page.evaluate(()=>window.__MONGSE_QA_STATE__.zone),'dist00');
   assert.deepEqual(await page.evaluate(()=>window.__HAPIL_LAUNCH_RC61__.missing()),[]);
   await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
   const time=await page.evaluate(()=>window.__MONGSE_QA_STATE__.time);
   await page.waitForFunction(t=>window.__MONGSE_QA_STATE__.time>t+.3,time);
   await page.keyboard.down('ArrowRight');await page.waitForTimeout(250);await page.keyboard.up('ArrowRight');
   await page.keyboard.press('s');await page.keyboard.press('a');await page.waitForTimeout(150);
   if(index===6){
    await page.screenshot({path:path.join(output,mobile?'rc61-slayer-mobile.png':'rc61-slayer-desktop.png')});
    if(mobile)await page.locator('[data-mobile-action=Menu]').click();else await page.getByRole('button',{name:'설정 · 메뉴',exact:true}).click();
    const settings=page.locator('.rc61-settings');await settings.waitFor();
    const text=await settings.innerText();for(const obsolete of ['맵 시작 맞대사','인터루드 텍스트','피격 판정 검사','LAN / AI'])assert(!text.includes(obsolete),obsolete);
    for(const mode of ['수동','반자동','완전자동']){await settings.getByRole('radio',{name:mode,exact:true}).check();assert(await settings.getByRole('radio',{name:mode,exact:true}).isChecked());}
    await settings.getByRole('radio',{name:'반자동',exact:true}).check();
    const touch=settings.getByRole('combobox',{name:'터치 조작',exact:true});for(const mode of ['on','off','auto']){await touch.selectOption(mode);assert.equal(await page.evaluate(()=>window.__HAPIL_MOBILE_V31366__.snapshot().options.mode),mode);}
    const sound=settings.getByRole('checkbox',{name:'효과음',exact:true}),was=await sound.isChecked();await sound.setChecked(!was);assert.equal(await sound.isChecked(),!was);await settings.locator('h3').first().scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,mobile?'rc61-settings-mobile.png':'rc61-settings-desktop.png')});
   }
   assert.deepEqual(errors,[],`${name} page errors`);results.push({hero:name,mobile,errors:errors.length,launched:true});console.log('PASS launch',name,mobile?'mobile':'desktop');await page.close();
  }
  // A missing dependency must leave a recoverable selection screen, never a black game canvas.
  const p=await browser.newPage();await p.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);await p.keyboard.press('Escape');
  await p.getByRole('button',{name:'새 게임 시작',exact:true}).click();await p.waitForFunction(()=>window.__HAPIL_STORY_ROUTE_RC60__?.installed);
  await p.evaluate(()=>{window.rc61SavedLoader=window.__HAPIL_RECOVERY_V31369__;window.__HAPIL_RECOVERY_V31369__=null;});
  await p.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await p.getByRole('button',{name:'다시 접속',exact:true}).waitFor({timeout:18000});
  assert.equal(await p.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.phase),'select');
  assert.equal(await p.evaluate(()=>window.__MONGSE_DEPLOYING__),false);
  await p.evaluate(()=>{window.__HAPIL_RECOVERY_V31369__=window.rc61SavedLoader;});
  await p.getByRole('button',{name:'다시 접속',exact:true}).click();await p.waitForSelector('#hapil-story-rc51[data-phase="pre"]');await p.close();
  console.log('RC61 BROWSER PASS',JSON.stringify(results),'missing dependency timeout and retry OK');
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
