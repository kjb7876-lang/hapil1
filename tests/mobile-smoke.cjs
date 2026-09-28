const http=require('http'),fs=require('fs'),path=require('path');
const assert=require('assert');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{let f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';try{const data=fs.readFileSync(f);res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp'})[path.extname(f)]||'application/octet-stream');res.end(data)}catch{res.statusCode=404;res.end()}}).listen(8765);
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});const p=await b.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:8765/?qa=1');await p.keyboard.press('Escape');await p.getByRole('button',{name:'새 게임 시작',exact:true}).click();await p.locator('.hero-card').nth(6).click();await p.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await p.waitForSelector('#hapil-story-rc51[data-phase="pre"]');await p.getByRole('button',{name:'계속 · Enter',exact:true}).click();await p.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00'&&window.__MONGSE_QA_STATE__.time>0);await p.waitForSelector('[data-mobile-stick]');await p.locator('[data-mobile-action="Menu"]').click();await p.getByLabel('모바일 성능').selectOption('balanced');assert.equal(await p.evaluate(()=>window.__HAPIL_MOBILE_V31366__.snapshot().options.quality),'balanced');await p.keyboard.press('Escape');await p.waitForSelector('[data-mobile-stick]');
const result=await p.evaluate(()=>{
 const api=window.__HAPIL_MOBILE_V31366__, binding=window.__HAPIL_CONTROLS_V31329__.binding;
 const stick=document.querySelector('[data-mobile-stick]'),r=stick.getBoundingClientRect();
 const send=(el,type,id,x,y)=>el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:y}));
 send(stick,'pointerdown',71,r.x+r.width*.9,r.y+r.height/2);
 const moved=binding.input.current.has('ArrowRight');
 const d=document.querySelector('[data-mobile-action="D"]');d.disabled=false;send(d,'pointerdown',72,1,1);
 const two=api.snapshot().pointers.length;
 send(window,'pointercancel',72,1,1);const movementRetained=binding.input.current.has('ArrowRight');
 send(window,'pointerup',71,1,1);const released=api.snapshot().pointers.length===0&&!binding.input.current.has('ArrowRight');
 send(stick,'pointerdown',73,r.x+r.width*.9,r.y+r.height/2);window.dispatchEvent(new Event('blur'));
 return {moved,two,movementRetained,released,blurCleared:!api.hasPointers(),zone:binding.state.current.zone,buttons:[...document.querySelectorAll('#hapil-mobile-controls-v31366 button')].map(e=>e.dataset.mobileAction)};
});console.log('INPUT',result);assert(result.moved&&result.two===2&&result.movementRetained&&result.released&&result.blurCleared);
const layouts=[];
for(const [width,height] of [[844,390],[390,844],[320,568]]){
 await p.setViewportSize({width,height});await p.waitForTimeout(400);
 const layout=await p.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};return {viewport:[innerWidth,innerHeight],canvas:rect('.game-stage>canvas'),stick:rect('[data-mobile-stick]'),blink:rect('[data-mobile-action="S"]'),guard:rect('[data-mobile-action="D"]'),scroll:document.documentElement.scrollWidth};});
 for(const k of ['canvas','stick','blink','guard']){const r=layout[k];assert(r.x>=-1&&r.y>=-1&&r.x+r.w<=width+1&&r.y+r.h<=height+1,JSON.stringify(layout));}assert(layout.scroll<=width);layouts.push(layout);
}
console.log('LAYOUT',JSON.stringify(layouts));
await p.setViewportSize({width:844,height:390});await p.waitForTimeout(400);
console.log('COMBAT',await p.evaluate(async()=>{let queries=0,frames=0;const qs=document.querySelector,qa=document.querySelectorAll;document.querySelector=function(s){if(/combat-rail|modal-backdrop/.test(s))queries++;return qs.call(this,s)};document.querySelectorAll=function(s){if(/boss-skill-callout|target-status.boss/.test(s))queries++;return qa.call(this,s)};const binding=window.__HAPIL_CONTROLS_V31329__.binding,start=binding.state.current.time;let live=true;function frame(){if(live){frames++;requestAnimationFrame(frame)}}requestAnimationFrame(frame);await new Promise(r=>setTimeout(r,10000));live=false;document.querySelector=qs;document.querySelectorAll=qa;return {seconds:10,frames,trackedDomQueries:queries,simulationSeconds:binding.state.current.time-start,enemies:binding.state.current.enemies.length};}));
console.log('SETTINGS PASS');console.log('ERRORS',errors);assert.equal(errors.length,0);
await b.close();server.close()})().catch(e=>{console.error(e);server.close();process.exit(1)})
