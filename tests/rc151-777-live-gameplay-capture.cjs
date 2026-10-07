'use strict';

// Fresh, real-UI 777 gameplay captures. The QA bridge reads native maps only;
// gameplay states, enemies, HP, attacks and projectile queues are never edited.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const cp = require('node:child_process');
const { chromium } = require(path.join(
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '/tmp/pw155/node_modules',
  'playwright',
));

const root = path.resolve(__dirname, '..');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'rc151-777-live-'));
const commit = cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const qaBridge = `window.__RC151_LIVE_QA__=Object.freeze({maps:()=>Object.keys(N).filter(id=>N[id]&&Number.isFinite(N[id].order)).map(id=>({id,name:N[id].name||id,order:N[id].order}))});`;
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.webp':'image/webp', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.woff2':'font/woff2' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + pathname.replace(/^\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    res.setHeader('Content-Type', mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
    const bytes = fs.readFileSync(file);
    res.end(file.endsWith('/assets/index-v31526.js') ? Buffer.concat([bytes, Buffer.from(qaBridge)]) : bytes);
  } catch { res.writeHead(404).end(); }
});

const report = { status:'running', commit, output, step:'initializing', captures:[], errors:[], httpErrors:[], method:'visible native UI; natural live simulation; telemetry read-only' };
function saveReport() { fs.writeFileSync(path.join(output, 'run-report.json'), JSON.stringify(report, null, 2)); }
async function openSettings(page) {
  const menu = page.getByRole('button', { name:'설정 · 메뉴', exact:true });
  if (await menu.count() && await menu.isVisible().catch(() => false)) await menu.click();
  else await page.locator('.rc108-settings-trigger').click({ force:true });
  await page.locator('.rc61-settings').waitFor({ state:'visible', timeout:10000 });
}
async function closeSettings(page) {
  const settings=page.locator('.rc61-settings');
  if(await settings.isVisible().catch(()=>false)){
    const close=page.getByRole('dialog',{name:'설정',exact:true}).getByRole('button',{name:'닫기 ×',exact:true});
    assert(await close.isVisible().catch(()=>false),'visible settings panel has a visible native close button');
    await close.click();
    await settings.waitFor({state:'hidden',timeout:10000});
  }
}
async function advanceNarrative(page) {
  for (let i=0; i<20; i++) {
    const story = page.locator('#hapil-story-rc51');
    if (!(await story.count()) || !(await story.isVisible().catch(() => false))) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
  await page.waitForFunction(() => window.__HAPIL_CONTROLS_V31329__?.binding?.phase === 'game', null, { timeout:20000 });
}
async function startRun(page, dream=false) {
  report.step=dream?'Dream: waiting title screen':'Story: waiting title screen';saveReport();
  await page.locator('.title-screen').waitFor({ state:'visible' });
  report.step=dream?'Dream: new game selection':'Story: new game selection';saveReport();
  await page.getByRole('button', { name:'새 게임 시작', exact:true }).click();
  await page.locator('.select-screen').waitFor({ state:'visible' });
  if (dream) {
    const option = page.locator('[data-game-mode-v31354="DREAM"]');
    assert.equal(await option.isDisabled(), false, '777 code must have unlocked Dream through native UI');
    await option.click();
  }
  await page.getByRole('button', { name:'이 편성으로 접속', exact:true }).click();
  report.step=dream?'Dream: entering native run':'Story: entering native run';saveReport();
  await page.locator('.select-screen').waitFor({ state:'hidden' });
  await page.waitForFunction(() => window.__MONGSE_QA_STATE__ && window.__HAPIL_CONTROLS_V31329__?.binding?.phase === 'game', null, { timeout:45000 });
  await advanceNarrative(page);
  report.step=dream?'Dream: run ready':'Story: run ready';saveReport();
}
async function setFullAuto(page) {
  report.step='Settings: enable full auto';saveReport();
  await openSettings(page);
  await page.locator('.rc61-settings').getByRole('radio', { name:'완전자동', exact:true }).check();
  await closeSettings(page);
  await page.waitForFunction(() => window.__HAPIL_CONTROLS_V31329__?.effective() === 'full');
}
async function setSemiAutoWhileOpen(page){
  report.step='Settings: pause repeated casts for map navigation';saveReport();
  await page.locator('.rc61-settings').getByRole('radio',{name:'반자동',exact:true}).check();
  await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.effective()==='semi');
}
async function enter777(page) {
  report.step='Settings: apply visible 777 code';saveReport();
  await openSettings(page);
  const form = page.locator('form.developer-code-form-v31576');
  await form.locator('input[aria-label="개발자 코드"]').fill('777');
  await form.getByRole('button', { name:'코드 적용', exact:true }).click();
  await page.waitForFunction(() => document.querySelector('form.developer-code-form-v31576 [role="status"]')?.textContent.includes('해금'), null, { timeout:10000 });
}
async function selectMap(page, id) {
  report.step='Settings: select native map '+id;saveReport();
  const details = page.locator('.rc61-settings details').filter({ has:page.getByText('방문한 맵 다시 가기', { exact:true }) });
  if (!(await details.locator('.memory-map-grid').isVisible().catch(() => false))) await details.locator('summary').click();
  const rows = await page.evaluate(() => window.__RC151_LIVE_QA__.maps());
  const target = rows.find(row => row.id === id);
  assert(target, `native map ${id} exists`);
  const button = page.locator('.rc61-settings .memory-map-grid').getByRole('button', { name:target.name, exact:true });
  assert.equal(await button.isDisabled(), false, `native UI grants access to ${id} after 777`);
  const zoneBefore=await page.evaluate(()=>window.__MONGSE_QA_STATE__?.zone??null);
  let selected=false;
  for(let attempt=0;attempt<20&&!selected;attempt++){
    await button.click();
    selected=await page.waitForFunction(expected => window.__MONGSE_QA_STATE__?.zone === expected, id, { timeout:900 }).then(()=>true).catch(()=>false);
    if(!selected){
      // Settings pauses the committed ultimate; finish it in live combat.
      await closeSettings(page);await page.waitForTimeout(750);await advanceNarrative(page);await openSettings(page);
      if(!(await details.locator('.memory-map-grid').isVisible().catch(()=>false)))await details.locator('summary').click();
    }
  }
  if(!selected){report.lastState=await stateSummary(page).catch(()=>null);report.mapDiagnostic={requested:id,buttonName:target.name,zoneBefore};saveReport();throw new Error(`normal map UI remained blocked for ${id}; last native state is saved in run-report.json`);}
  await closeSettings(page);
  await advanceNarrative(page);
  report.step='Map ready: '+id;saveReport();
}
async function stateSummary(page) {
  return page.evaluate(() => {
    const s=window.__MONGSE_QA_STATE__,actors=s?.enemies??[];
    return { zone:s?.zone, mode:window.__HAPIL_MODES_V31346__?.mode(s), time:s?.time, hp:s?.hp,documentHidden:document.hidden===true,controlPhase:window.__HAPIL_CONTROLS_V31329__?.binding?.phase,effectiveControl:window.__HAPIL_CONTROLS_V31329__?.effective?.(),paused:s?.paused===true,pause:s?.pause===true,timeStopUntil:s?.timeStopUntil??null,encounter:{locked:window.__HAPIL_RC95_NATIVE__?.locked?.(s)??null,lockUntil:s?.encounterLockUntil31226??null,wallUnlockAt:s?.encounterWallUnlockAtV31227??null,dialogue:s?.encounterDialogue31226?{kind:s.encounterDialogue31226.kind,completed:s.encounterDialogue31226.completed===true}:null},
      completedZones:[...(s?.completedZones??[])].sort(), bossDefeated:s?.bossDefeated===true,
      inner:s?.innerFinalRC133?{entry:s.innerFinalRC133.entry,phase:s.innerFinalRC133.phase,intro:s.innerFinalRC133.intro,shotDelay:s.innerFinalRC133.shotDelay,awakeningCooldown:s.innerFinalRC133.awakeningCooldown,awake:s.innerFinalRC133.awake,cycle:s.innerFinalRC133.cycle}:null,
      frameBlockers:{reading:window.__HAPIL_READING_V31342__?.blocked??null,partyUi:window.__HAPIL_PARTY_UI_V31322__?.isOpen?.()===true,records:window.__HAPIL_RECORDS_V31365__?.isOpen?.()===true,dialogs:[...document.querySelectorAll('[role="dialog"],dialog,.rc61-settings,.growth-modal,.story-interlude')].filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,cls:typeof e.className==='string'?e.className:'',text:(e.innerText||'').slice(0,240)})).slice(0,8)},
      actors:actors.filter(a=>a.boss&&a.hp>0).map(a=>({id:a.id,hp:a.hp,maxHp:a.maxHp,x:a.x,y:a.y,attackAt:a.attackAt,recoverUntil:a.recoverUntil})),
      projectiles:(s?.hostileProjectiles??[]).filter(q=>q.hostile!==false).map(q=>({sourceId:q.sourceId,sprite:q.sprite,skill:q.rc133Skill,red:q.rc150RedPersonaShot,innerShot:q.rc133InnerShot===true,danmaku:q.danmakuV31316===true,rc95Bullet:q.rc95Bullet===true,commonSprite:q.rc126CommonSprite??null,drawPath:q.bitmapPathV31355??null,drawFallback:q.bitmapFallbackV31355??null,bitmapRendered:q.bitmapRenderedDreamV31353===true,age:s.time-q.born})).slice(0,16),
      raidPackets:['hostileProjectiles','pendingHits','impactQueue','telekineticCasts','spatialRiftCasts','narrativeCasts'].flatMap(queue=>(s?.[queue]??[]).filter(q=>['b05-boss','mb-ep1b05'].includes(q.sourceId??q.ownerId)).map(q=>({queue,sourceId:q.sourceId??q.ownerId,sprite:q.sprite??q.image??q.impactSprite,assetPaths:['sprite','image','projectileSprite','impactSprite'].map(key=>q[key]).filter(Boolean),heel:q.lustKindRC24==='heel',age:Number.isFinite(q.born)?s.time-q.born:null}))).slice(0,16),
      balrogRenderer:window.__MONGSE_BALROG_POSE_RC151__?.metrics?.()??null };
  });
}
async function captureWhen(page, label, file, predicate, timeout=Number(process.env.RC151_CAPTURE_TIMEOUT_MS)||90000) {
  report.step='Capture waiting: '+label;saveReport();
  const end=Date.now()+timeout;let lastWrite=0,evidence=null;
  while(Date.now()<end){
    evidence=await page.evaluate(predicate).catch(()=>null);
    if(evidence)break;
    if(Date.now()-lastWrite>=2000){report.lastState=await stateSummary(page).catch(()=>null);saveReport();lastWrite=Date.now();}
    await page.waitForTimeout(150);
  }
  if(!evidence&&report.lastState?.inner?.entry==='developer-777')await page.screenshot({path:path.join(output,'timeout-hidden-final.png'),fullPage:false}).catch(()=>{});
  assert(evidence,`timed out waiting for ${label}; last native state is saved in run-report.json`);
  await page.screenshot({ path:path.join(output,file), fullPage:false });
  const state=await stateSummary(page);
  const capture={label,file,evidence:typeof evidence==='object'?evidence:null,state};report.captures.push(capture);saveReport();return capture;
}

(async()=>{
  saveReport();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser,context;
  try {
    browser=await chromium.launch({ executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
    context=await browser.newContext({ viewport:{width:1280,height:900}, deviceScaleFactor:1 });
    const page=await context.newPage();
    page.on('pageerror',error=>report.errors.push(error.stack||error.message));
    page.on('response',response=>{if(response.status()>=400)report.httpErrors.push({status:response.status(),url:response.url()});});
    report.step='page load';saveReport();
    await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
    report.step='waiting for native runtime and read-only map bridge';saveReport();
    await page.waitForFunction(()=>window.__HAPIL_RC133_NATIVE__?.installed&&window.__HAPIL_DEVELOPER_MAPS_RC133__&&window.__RC151_LIVE_QA__,null,{timeout:25000});
    await page.keyboard.press('Escape');

    // Story b05: 777 only unlocks an already authored map; the shoe attack is native.
    report.step='Story: start and unlock 777';saveReport();
    await startRun(page,false);
    await setFullAuto(page);
    await enter777(page);
    await setSemiAutoWhileOpen(page);
    await selectMap(page,'ep1b05');
    await setFullAuto(page);
    const heel=await captureWhen(page,'live b05 red-heel projectile','01-red-heel-projectile.png',()=>{
      const s=window.__MONGSE_QA_STATE__;
      const packets=['hostileProjectiles','pendingHits','impactQueue','telekineticCasts','spatialRiftCasts','narrativeCasts'].flatMap(key=>s?.[key]??[]);
      if(s?.zone!=='ep1b05')return false;
      const q=packets.find(q=>['b05-boss','mb-ep1b05'].includes(q.sourceId??q.ownerId)&&['sprite','image','projectileSprite','impactSprite'].some(key=>String(q[key]??'').split('?')[0]==='./assets/rc24/lust-heel.png')&&q.lustKindRC24==='heel'&&(Number.isFinite(q.expiresAt)?q.expiresAt>s.time:Number.isFinite(q.endAt)?q.endAt>s.time:true));
      return q?{zone:s.zone,time:s.time,sourceId:q.sourceId??q.ownerId,queue:['hostileProjectiles','pendingHits','impactQueue','telekineticCasts','spatialRiftCasts','narrativeCasts'].find(key=>(s[key]??[]).includes(q)),assetPaths:['sprite','image','projectileSprite','impactSprite'].map(key=>q[key]).filter(Boolean),x:q.x,y:q.y,born:q.born,expiresAt:q.expiresAt}:false;
    },45000);
    assert(heel.evidence?.assetPaths?.some(asset=>asset.split('?')[0]==='./assets/rc24/lust-heel.png'),'screenshot was triggered by a live native b05 projectile with isolated shoe asset');

    // Balrog: capture its live idle frame and a separate native attack interval.
    report.step='Story: Balrog poses';saveReport();await openSettings(page);await setSemiAutoWhileOpen(page);await selectMap(page,'dist06');await setFullAuto(page);
    await captureWhen(page,'live Balrog before raised-sword attack','02-balrog-before.png',()=>{
      const a=window.__MONGSE_QA_STATE__?.enemies?.find(a=>a.id==='dist06-boss'&&a.hp>0);
      return !!a&&a.attackAt<=window.__MONGSE_QA_STATE__.time&&a.recoverUntil<=window.__MONGSE_QA_STATE__.time&&window.__MONGSE_BALROG_POSE_RC151__?.metrics?.().bodyDraws>0;
    },120000);
    await captureWhen(page,'live Balrog raised-sword attack','03-balrog-raised-sword.png',()=>{
      const s=window.__MONGSE_QA_STATE__,a=s?.enemies?.find(a=>a.id==='dist06-boss'&&a.hp>0),m=window.__MONGSE_BALROG_POSE_RC151__?.metrics?.();
      return !!a&&(a.attackAt>s.time||a.recoverUntil>s.time)&&m?.raisedSwordDraws>0;
    },120000);
    const balrogMetrics=await page.evaluate(()=>window.__MONGSE_BALROG_POSE_RC151__?.metrics?.()??null);report.balrogMetrics=balrogMetrics;saveReport();
    assert.equal(balrogMetrics?.bodyAssetFailures,0,'Balrog body is preloaded before its first live draw');
    assert.equal(balrogMetrics?.swordAssetFailures,0,'separate sword is preloaded before a live raised-sword frame');

    // Enter Dream through the normal new-run UI after the accepted 777 unlock,
    // then use the visible 777 hidden-arena button. Do not emulate cult death.
    report.step='Dream: normal UI and hidden arena';saveReport();await openSettings(page);
    page.once('dialog',dialog=>dialog.accept());
    await page.locator('.rc61-settings').getByRole('button',{name:'자동 저장 후 시작 화면으로',exact:true}).click();
    await page.locator('.title-screen').waitFor({state:'visible',timeout:15000});
    await startRun(page,true);
    await setFullAuto(page);
    await enter777(page);
    const details=page.locator('.rc61-settings details').filter({has:page.getByText('방문한 맵 다시 가기',{exact:true})});
    if(!(await details.locator('.memory-map-grid').isVisible().catch(()=>false)))await details.locator('summary').click();
    const hidden=page.locator('[data-rc133-map="inner-evil-rc133"]');
    assert.equal(await hidden.count(),1,'visible Dream+777 selector contains the hidden-persona entry button');
    await hidden.click();
    await page.waitForFunction(()=>window.__HAPIL_INNER_FINAL_RC133__?.active(window.__MONGSE_QA_STATE__)&&window.__HAPIL_INNER_FINAL_RC133__?.boss(window.__MONGSE_QA_STATE__)?.id==='inner-evil-rc133');
    await closeSettings(page);
    await advanceNarrative(page);
    await page.keyboard.down('ArrowRight');await page.waitForTimeout(250);await page.keyboard.up('ArrowRight');
    const normalPersona=await captureWhen(page,'native 777 Persona baseline volley','04-persona-normal-projectile.png',()=>{
      const s=window.__MONGSE_QA_STATE__,q=(s?.hostileProjectiles??[]).find(q=>q.rc133InnerShot&&q.rc150RedPersonaShot===false&&q.bitmapRenderedDreamV31353===true&&q.bitmapPathV31355===q.sprite&&q.bitmapFallbackV31355===false&&s.time-q.born<1.8);
      return s?.innerFinalRC133?.entry==='developer-777'&&s.innerFinalRC133.awake<=0&&q?{skill:q.rc133Skill,packet:{innerShot:q.rc133InnerShot,danmaku:q.danmakuV31316===true,rc95Bullet:q.rc95Bullet===true,commonSprite:q.rc126CommonSprite??null},sprite:q.sprite,drawPath:q.bitmapPathV31355,bitmapFallback:q.bitmapFallbackV31355}:false;
    },90000);
    const redPersona=await captureWhen(page,'native 777 Persona red awakened volley','05-persona-red-projectile.png',()=>{
      const s=window.__MONGSE_QA_STATE__,q=(s?.hostileProjectiles??[]).find(q=>q.rc133InnerShot&&q.rc150RedPersonaShot===true&&q.bitmapRenderedDreamV31353===true&&q.bitmapPathV31355===q.sprite&&q.bitmapFallbackV31355===false&&s.time-q.born<1.8);
      return s?.innerFinalRC133?.entry==='developer-777'&&s.innerFinalRC133.awake>0&&q?{skill:q.rc133Skill,packet:{innerShot:q.rc133InnerShot,danmaku:q.danmakuV31316===true,rc95Bullet:q.rc95Bullet===true,commonSprite:q.rc126CommonSprite??null},sprite:q.sprite,drawPath:q.bitmapPathV31355,bitmapFallback:q.bitmapFallbackV31355}:false;
    },90000);
    for(const [label,capture,rootPath] of [['normal',normalPersona,'./assets/rc134/persona-skills/'],['red',redPersona,'./assets/rc133/art/']]){
      assert.equal(capture.evidence?.packet?.innerShot,true,label+' emitted packet carries the dedicated Persona draw flag');
      assert.equal(capture.evidence?.packet?.rc95Bullet,true,label+' packet still comes from the native hostile projectile transaction');
      assert.equal(capture.evidence?.drawPath,capture.evidence?.sprite,label+' actual decoded bitmap is the packet skill sprite');
      assert.equal(capture.evidence?.bitmapFallback,false,label+' actual draw did not fall back');
      assert(capture.evidence?.drawPath?.startsWith(rootPath),label+' actual draw uses its dedicated authored atlas');
      assert(!capture.evidence?.drawPath?.includes('danmaku-jellybean.webp'),label+' actual draw did not select the shared jellybean');
    }

    assert.deepEqual(report.errors,[],'no JS errors during live gameplay');
    assert.deepEqual(report.httpErrors,[],'no failed asset/network requests during live gameplay');
    report.status='passed';report.step='complete';saveReport();
    console.log('RC151_777_LIVE_GAMEPLAY',JSON.stringify({status:report.status,commit,captures:report.captures.map(c=>({label:c.label,file:c.file,zone:c.state.zone,actors:c.state.actors,projectiles:c.state.projectiles.filter(q=>q.sprite?.includes('lust-heel')||q.skill)})),output,errors:report.errors.length,httpErrors:report.httpErrors.length}));
  } catch(error) {
    report.status='failed';report.error=error.stack||String(error);saveReport();console.error(report.error);process.exitCode=1;
  } finally { await context?.close();await browser?.close();server.close(); }
})();
