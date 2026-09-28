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
 assert.equal(await page.locator('#mongse-christian-opening-v31236').count(),1);await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
 // Launch no longer depends on old story readiness or an opening interlude.
 await page.evaluate(()=>{window.__HAPIL_STORY_VOICE_RC49__={...window.__HAPIL_STORY_VOICE_RC49__,unlock(){throw Error('simulated audio backend failure');}};});
 await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
 await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]',{timeout:20000});
 assert((await page.locator('#hapil-story-rc51').innerText()).includes('음성 1 — 기억의 독백'));
 assert.equal(await page.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.phase),'game');assert.equal(await page.evaluate(()=>window.__MONGSE_DEPLOYING__),false);
 assert.equal(errors.length,0,errors.join('\n'));results.push('direct monologue launch; old readiness and opening interlude removed; audio failure isolated');await page.close();
 // Every playable hero must reach the uploaded voice 1 card from selection.
 for(let index=0;index<8;index++){
  const p=await browser.newPage();const failures=[];p.on('pageerror',e=>failures.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
  await p.keyboard.press('Escape');await p.getByRole('button',{name:'새 게임 시작',exact:true}).click();const card=p.locator('.hero-card').nth(index),name=await card.locator('strong').innerText();await card.click();
  await p.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await p.waitForSelector('#hapil-story-rc51[data-phase="pre"]',{timeout:20000});assert((await p.locator('#hapil-story-rc51').innerText()).includes('음성 1 — 기억의 독백'));assert.equal(failures.length,0,failures.join('\n'));results.push(name+': monologue launch OK');await p.close();
 }
 console.log('RC52 BROWSER PASS',JSON.stringify(results));
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
