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
(async()=>{const browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||undefined,args:['--no-sandbox']});try{
 const errors=[],results=[];const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
 await page.waitForFunction(()=>window.__MONGSE_CHRISTIAN_OPENING_V31236__);
 assert(await page.locator('#mongse-christian-opening-quote-v31236').innerText().then(s=>s.includes('그리스도께서 네게 비추이시리라.')));
 await page.screenshot({path:path.join(output,'christian-opening.png')});
 await page.keyboard.press('Enter');assert.equal(await page.locator('#mongse-christian-opening-v31236').getAttribute('data-phase'),'mark');await page.keyboard.press('Enter');await page.locator('#mongse-christian-opening-v31236').waitFor({state:'detached'});
 await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
 await page.waitForFunction(()=>window.__HAPIL_STORY_RC26__?.readiness().ready);
 // Reproduce the historical marker stall while real gameplay services are ready.
 await page.evaluate(()=>{window.__HAPIL_V31369_RELEASE__=undefined;window.__savedStory52=window.__HAPIL_STORY_RC26__;window.__HAPIL_STORY_RC26__={...window.__savedStory52,ready:async()=>false,readiness:()=>({ready:false,missing:['전투']})};});
 await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.getByRole('alert').waitFor();assert(await page.getByRole('alert').innerText().then(t=>t.includes('준비가 지연')));assert.equal(await page.evaluate(()=>window.__MONGSE_DEPLOYING__),false);
 // Retry succeeds even if the browser audio backend rejects initialization.
 await page.evaluate(()=>{window.__HAPIL_STORY_RC26__=window.__savedStory52;window.__HAPIL_STORY_VOICE_RC49__={...window.__HAPIL_STORY_VOICE_RC49__,unlock(){throw Error('simulated audio backend failure');}};});
 await page.getByRole('button',{name:'다시 접속',exact:true}).click();
 await page.getByRole('button',{name:'기억을 따라가기',exact:true}).waitFor();assert.equal(await page.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.phase),'game');assert.equal(await page.evaluate(()=>window.__MONGSE_DEPLOYING__),false);
 assert.equal(errors.length,0,errors.join('\n'));results.push('opening → mark → title; visible failure/retry; missing historical marker; audio failure isolated');await page.close();
 // Every playable hero must reach voice 1 from the actual selection button.
 for(let index=0;index<8;index++){
  const p=await browser.newPage();const failures=[];p.on('pageerror',e=>failures.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
  await p.evaluate(()=>window.__MONGSE_CHRISTIAN_OPENING_V31236__.finish());await p.locator('#mongse-christian-opening-v31236').waitFor({state:'detached'});
  await p.getByRole('button',{name:'새 게임 시작',exact:true}).click();const card=p.locator('.hero-card').nth(index),name=await card.locator('strong').innerText();await card.click();
  await p.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await p.getByRole('button',{name:'기억을 따라가기',exact:true}).waitFor({timeout:20000});assert.equal(failures.length,0,failures.join('\n'));results.push(name+': launch OK');await p.close();
 }
 console.log('RC52 BROWSER PASS',JSON.stringify(results));
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
