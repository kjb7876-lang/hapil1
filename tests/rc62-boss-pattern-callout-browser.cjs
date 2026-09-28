const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..');
const server=require('node:http').createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.statusCode=403;res.end();return;}
  try{
    res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');
    res.end(fs.readFileSync(file));
  }catch{res.statusCode=404;res.end();}
}).listen(0,'127.0.0.1');

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
    await page.locator('.hero-card').nth(6).click();
    await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
    await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');
    await page.getByRole('button',{name:'계속 · Enter',exact:true}).click();
    await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00'&&window.__MONGSE_QA_STATE__.time>0);
    assert.deepEqual(await page.evaluate(()=>window.__HAPIL_BOSS_PATTERN_NAMES_RC62__?.missing),[]);

    async function injectSignature(id){
      await page.evaluate(signatureId=>{
        const state=window.__MONGSE_QA_STATE__,boss=state.enemies.find(actor=>actor.id==='dist00-boss');
        boss.bossRuleCalloutLabelV31220='공통 규칙명';
        window.__HAPIL_BOSS_PATTERN_NAMES_RC62__.announce(boss,signatureId,state.time);
        window.__MONGSE_COMBAT_PRESENTATION_QA_V31219__.updateCallout(state);
      },id);
      const expected=await page.evaluate(signatureId=>window.__HAPIL_BOSS_PATTERN_NAMES_RC62__.resolve(signatureId),id);
      await page.waitForFunction(value=>document.querySelector('.boss-skill-callout-v31219 strong')?.textContent===value,expected,{timeout:5000});
    assert.equal(await page.locator('.boss-skill-callout-v31219 span').innerText(),'보스 패턴');
    }

    await injectSignature('hell-gate-columns');
    assert.equal(await page.locator('.boss-skill-callout-v31219 strong').innerText(),'일곱 기둥의 지옥문');
    await injectSignature('falling-clutter');
    assert.equal(await page.locator('.boss-skill-callout-v31219 strong').innerText(),'무너지는 침실');
    await page.evaluate(()=>{
      const state=window.__MONGSE_QA_STATE__,boss=state.enemies.find(actor=>actor.id==='dist00-boss');
      boss.bossRuleCalloutLabelV31220='공통 규칙명';
      boss.bossSkillCalloutUntilV31219=state.time+30;
      window.__MONGSE_COMBAT_PRESENTATION_QA_V31219__.updateCallout(state);
    });
    await page.waitForFunction(()=>document.querySelector('.boss-skill-callout-v31219 strong')?.textContent==='공통 규칙명');

    const mobilePage=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),mobileErrors=[];
    mobilePage.on('pageerror',error=>mobileErrors.push(error.message));
    await mobilePage.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
    await mobilePage.keyboard.press('Escape');
    await mobilePage.getByRole('button',{name:'새 게임 시작',exact:true}).click();
    await mobilePage.locator('.hero-card').nth(6).click();
    await mobilePage.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
    await mobilePage.waitForSelector('#hapil-story-rc51[data-phase="pre"]');
    await mobilePage.getByRole('button',{name:'계속 · Enter',exact:true}).click();
    await mobilePage.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00'&&window.__MONGSE_QA_STATE__.time>0);
    await mobilePage.evaluate(()=>{
      const state=window.__MONGSE_QA_STATE__,boss=state.enemies.find(actor=>actor.id==='dist00-boss');
      window.__HAPIL_BOSS_PATTERN_NAMES_RC62__.announce(boss,'hell-gate-columns',state.time);
      window.__MONGSE_COMBAT_PRESENTATION_QA_V31219__.updateCallout(state);
    });
    await mobilePage.waitForFunction(()=>document.querySelector('.boss-skill-callout-v31219 strong')?.textContent==='일곱 기둥의 지옥문');
    const mobile=await mobilePage.locator('.boss-skill-callout-v31219').evaluate(node=>{
      const rect=node.getBoundingClientRect(),label=node.querySelector('strong').getBoundingClientRect();
      return {width:rect.width,height:rect.height,visible:rect.width>0&&rect.left>=0&&rect.right<=innerWidth,
        labelFont:getComputedStyle(node.querySelector('strong')).fontSize,labelInside:label.width<=rect.width,
        htmlClass:document.documentElement.className,parent:node.parentElement?.className,
        display:getComputedStyle(node).display,parentDisplay:getComputedStyle(node.parentElement).display};
    });
    assert(mobile.visible&&mobile.width>0,`boss title card must stay on-screen on mobile ${JSON.stringify(mobile)}`);
    assert(mobile.labelInside,'the boss title must not extend beyond its mobile card');
    assert.deepEqual([...errors,...mobileErrors],[],[...errors,...mobileErrors].join('\n'));
    console.log('RC62 BROWSER PASS: localized boss signature labels replace generic callouts; unknown move fallback and mobile fit verified.',JSON.stringify(mobile));
    await mobilePage.close();
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
