// Real Chromium responsive QA. Synthetic dense state is used only to stress HUD layout.
// Run: HAPIL_CHROMIUM=/usr/bin/chromium node tests/rc99-battle-layout-browser.cjs
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),os=require('node:os');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||path.join(os.tmpdir(),'hapil-contained-layout');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}}).listen(0,'127.0.0.1');
const overlap=(a,b)=>a&&b&&Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1;
(async()=>{let browser;try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,deviceScaleFactor:3}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000);
 await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__HAPIL_SAMONG_RC91__?.installed);await page.keyboard.press('Escape');await page.evaluate(()=>window.__HAPIL_SAMONG_RC91__.unlock(null,'777'));
 await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('[data-game-mode-v31354="DREAM"]').click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00');await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;s.invulnerableUntil=s.time+99999;});await page.waitForTimeout(700);
 const cdp=await context.newCDPSession(page),boxes={};for(const [key,sel] of Object.entries({stick:'[data-mobile-stick]',blink:'[data-mobile-action="S"]',resonance:'[data-mobile-action="D"]',more:'.combat-controls-more',menu:'[data-mobile-action="Menu"]'}))boxes[key]=await page.locator(sel).boundingBox();
 const point=(key,id,right=false)=>({id,x:boxes[key].x+boxes[key].width*(right?.85:.5),y:boxes[key].y+boxes[key].height*.5});
 const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
 const snapshot=()=>page.evaluate(()=>({pointers:window.__HAPIL_MOBILE_V31366__.snapshot().pointers,keys:[...window.__HAPIL_CONTROLS_V31329__.binding.input.current]}));
 const stick=point('stick',1,true),blink=point('blink',2),resonance=point('resonance',3),more=point('more',4);
 await touch('touchStart',[stick]);await page.waitForTimeout(100);const moving=await snapshot();
 await touch('touchStart',[stick,blink]);const movingBlink=await snapshot();await touch('touchEnd',[blink]);const afterBlink=await snapshot();
 await touch('touchStart',[stick,resonance]);const movingResonance=await snapshot();await touch('touchEnd',[resonance]);const afterResonance=await snapshot();
 await touch('touchStart',[stick,more]);await touch('touchEnd',[more]);await page.waitForTimeout(300);const inDetails={...await snapshot(),opened:await page.locator('.combat-controls-dialog').evaluate(e=>e.open)};await page.screenshot({path:path.join(out,'held-move-details.png')});
 await touch('touchEnd',[]);if(inDetails.opened)await page.getByRole('button',{name:'추가 전투 조작 닫기',exact:true}).click();
 await page.waitForTimeout(650);
 const result={boxes,moving,movingBlink,afterBlink,movingResonance,afterResonance,inDetails,errors};
 await page.getByRole('button',{name:'조작 더보기',exact:true}).click();result.dialogMutations=await page.evaluate(async()=>{let count=0;const o=new MutationObserver(rs=>count+=rs.length);o.observe(document.querySelector('.combat-controls-list'),{subtree:true,childList:true,attributes:true,characterData:true});await new Promise(r=>setTimeout(r,2000));o.disconnect();return count;});await page.keyboard.press('Escape');
 await cdp.send('Profiler.enable');await cdp.send('Profiler.start');await page.waitForTimeout(5000);const {profile}=await cdp.send('Profiler.stop');result.cpu=profile.nodes.filter(n=>n.hitCount).sort((a,b)=>b.hitCount-a.hitCount).slice(0,18).map(n=>({name:n.callFrame.functionName,url:n.callFrame.url.split('/').pop(),line:n.callFrame.lineNumber,hits:n.hitCount}));
 result.canvas=await page.locator('.game-stage canvas').evaluate(c=>({width:c.width,height:c.height,display:[c.clientWidth,c.clientHeight]}));await page.screenshot({path:path.join(out,'mobile.png')});
 fs.writeFileSync(path.join(out,'measurement.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 if(!process.env.HAPIL_QA_BASELINE){
  assert(moving.keys.includes('ArrowRight'));assert(afterBlink.keys.includes('ArrowRight'),'blink release retains movement');
  assert(afterResonance.keys.includes('ArrowRight'),'resonance release restores held direction');
  assert(inDetails.opened,'second finger opens details while moving');assert.equal(inDetails.pointers.length,0,'dialog clears held pointers');assert.equal(inDetails.keys.length,0);
  assert(boxes.more.height>=44);assert.deepEqual(errors,[]);
 }

}finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
