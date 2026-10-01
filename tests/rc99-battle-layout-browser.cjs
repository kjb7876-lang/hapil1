// Real Chromium responsive QA. Synthetic dense state is used only to stress HUD layout.
// Run: HAPIL_CHROMIUM=/usr/bin/chromium node tests/rc99-battle-layout-browser.cjs
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),os=require('node:os');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||path.join(os.tmpdir(),'hapil-contained-layout');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}}).listen(0,'127.0.0.1');
const overlap=(a,b)=>a&&b&&Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1;
(async()=>{let browser;try{
 browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,width,height,mobile] of [['desktop',1180,757,false],['wide',1920,1080,false],['short',1280,600,false],['phone',390,844,true],['landscape',844,390,true],['small-phone',320,568,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));
  await page.goto((process.env.HAPIL_QA_URL||'http://127.0.0.1:'+server.address().port+'/')+'?qa=1');await page.waitForFunction(()=>window.__HAPIL_SAMONG_RC91__?.installed);await page.keyboard.press('Escape');
  await page.evaluate(()=>window.__HAPIL_SAMONG_RC91__.unlock(null,'777'));
  await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('[data-game-mode-v31354="DREAM"]').click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
  await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00');
  await page.waitForTimeout(700);await page.screenshot({path:path.join(out,name+'-natural.png')});
  await page.evaluate(()=>{const C=window.__HAPIL_CONTROLS_V31329__;C.setMode('semi');const s=C.binding.state.current;s.hp=s.maxHp=1000000;const enemy=s.enemies.find(a=>a.hp>0);if(enemy){enemy.boss=true;enemy.name='긴 이름의 보스 · 겹침 회귀 검사';enemy.activePattern='긴 공격 예고와 상태 정보가 전투 영역 안으로 넘치지 않아야 합니다';enemy.hp=enemy.maxHp=9999999;}s.stunUntil=s.time+999;s.heroHealingReducedUntilRC24=s.time+999;});
  await page.waitForTimeout(1000);
  const bounds=await page.evaluate(()=>{const result={};for(const sel of ['.game','.game-stage','.game-stage canvas','.topbar','.combat-hud','.rc15-enemies','.rc15-allies','.hm-vitals','.hm-movement','.hm-actions','[data-mobile-action="Menu"]','#rc24-bossbar','.hapil-combat-rail-v31339','#hapil-resonance-rc96','.hero-hud','.action-stack']){const e=document.querySelector(sel),r=e?.getBoundingClientRect();result[sel]=e&&getComputedStyle(e).display!=='none'&&r.width&&r.height?{x:r.x,y:r.y,w:r.width,h:r.height}:null;}return result;});
  if(mobile){
   for(const sel of ['.topbar','.combat-hud','.rc15-enemies','.rc15-allies','.hapil-combat-rail-v31339','#hapil-resonance-rc96','.hero-hud','.action-stack'])assert.equal(bounds[sel],null,`${name}: hidden ${sel}`);
   const controls=['.hm-vitals','.hm-movement','.hm-actions','[data-mobile-action="Menu"]','#rc24-bossbar'];
   for(let i=0;i<controls.length;i++){const a=bounds[controls[i]];assert(a,`${name}: missing ${controls[i]}`);assert(a.x>=0&&a.y>=0&&a.x+a.w<=width+1&&a.y+a.h<=height+1,`${name}: offscreen ${controls[i]}`);for(let j=0;j<i;j++)assert(!overlap(a,bounds[controls[j]]),`${name}: overlap ${controls[i]} / ${controls[j]}`);}
   assert(bounds['.game-stage'].w>=width-1&&bounds['.game-stage'].h>=height-1,'mobile full battlefield');
  }else{
   const arena=bounds['.game-stage'],canvas=bounds['.game-stage canvas'];assert(Math.abs(arena.w/width-.8)<.002,`${name}: center 80%`);assert(Math.abs(canvas.w/canvas.h-16/9)<.002,`${name}: canvas 16:9`);
   const panels=['.topbar','.combat-hud','.rc15-enemies','.rc15-allies'];for(let i=0;i<panels.length;i++){assert(!overlap(bounds[panels[i]],arena),`${name}: arena invaded by ${panels[i]}`);for(let j=0;j<i;j++)assert(!overlap(bounds[panels[i]],bounds[panels[j]]),`${name}: panels overlap`);}
   const footer=bounds['.combat-hud'],resource=bounds['#hapil-resonance-rc96'];assert(resource&&resource.y>=footer.y&&resource.y+resource.h<=footer.y+footer.h,`${name}: resource in footer`);assert(!overlap(resource,bounds['.hero-hud'])&&!overlap(resource,bounds['.action-stack']),`${name}: resource overlaps controls`);
   for(const key of ['Q','W','E','R','G'])assert(!await page.locator(`.skills [data-control-key="${key}"]`).isVisible(),`${name}: automatic skill exposed`);
  }
  await page.screenshot({path:path.join(out,name+'.png')});
  await page.getByRole('button',{name:mobile?'설정 메뉴 열기':'설정 · 메뉴',exact:true}).click();
  const details=page.locator('.combat-info-details');await details.waitFor({state:'visible'});await details.locator('summary').click();assert(await details.locator('.combat-info-columns').isVisible());
  await page.keyboard.press('Escape');await details.waitFor({state:'hidden'});
  // Reopen/close to catch stale appended details and native menu regressions.
  await page.getByRole('button',{name:mobile?'설정 메뉴 열기':'설정 · 메뉴',exact:true}).click();await details.waitFor({state:'visible'});assert.equal(await page.locator('.combat-info-details').count(),1);await page.keyboard.press('Escape');
  for(const mode of ['manual','semi','manual','semi']){
   await page.evaluate(mode=>window.__HAPIL_CONTROLS_V31329__.setMode(mode),mode);await page.waitForTimeout(650);
   const issues=await page.evaluate(mobile=>{
    const visible=e=>!!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0;
    const rect=e=>e.getBoundingClientRect(),bad=[];
    const party=document.querySelector('#hapil-party-hud');if(visible(party))bad.push('floating party HUD');
    if(!mobile){
     const footer=rect(document.querySelector('.combat-hud'));
     const elems=[...document.querySelectorAll('.combat-hud .skills button,.combat-hud .action-utilities button,.hero-hud .hud-meter,.hero-hud>div>b,.hero-hud>div>small')].filter(visible);
     for(const e of elems){const r=rect(e);if(r.top<footer.top||r.bottom>innerHeight-22||r.left<0||r.right>innerWidth)bad.push('clipped '+e.className+' '+e.textContent);}
     for(let i=0;i<elems.length;i++)for(let j=0;j<i;j++){const a=rect(elems[i]),b=rect(elems[j]);if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)bad.push('overlapping controls');}
    }
    return bad;
   },mobile);assert.deepEqual(issues,[],name+' '+mode);
   await page.screenshot({path:path.join(out,name+'-'+mode+'.png')});
  }
  for(const label of ['수동','반자동','완전자동','반자동']){
   await page.getByRole('button',{name:mobile?'설정 메뉴 열기':'설정 · 메뉴',exact:true}).click();
   await page.getByRole('radio',{name:label,exact:true}).check();
   await page.keyboard.press('Escape');await details.waitFor({state:'hidden'});
   await page.waitForFunction(expected=>window.__HAPIL_CONTROLS_V31329__.effective()===expected,{'수동':'manual','반자동':'semi','완전자동':'full'}[label],{timeout:5000});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify({name,bounds,errors},null,2));console.log('PASS',name);await context.close();
 }
}finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
