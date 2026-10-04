'use strict';
// Public, unreplaced network responses. Lethal-boundary probes are staged client fixtures.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));
const root=path.resolve(__dirname,'../..'),runtime='84f60f4ab79fc595ca40db9101e19f900e555946',base=process.env.HAPIL_TEST_BASE||'https://kjb7876-lang.github.io/hapil1/';
if(process.env.GITHUB_ACTIONS)assert.equal(base,'https://kjb7876-lang.github.io/hapil1/');
const output=process.env.HAPIL_QA_OUTPUT||'/tmp/rc133-public-duel';fs.mkdirSync(output,{recursive:true});
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const original=f=>cp.execFileSync('git',['show',runtime+':'+f],{cwd:root,maxBuffer:24e6});
const report={runtimeCommit:runtime,auditCommit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),base,status:'running',scope:'Normal public Story→777→Dream→777 hidden entry and native slot UI. Lethal cases explicitly stage HP/callback order in isolated browser contexts; no natural victory claim, no response interception or gameplay-code injection.',files:[],profiles:[]};
const save=()=>fs.writeFileSync(output+'/results.json',JSON.stringify(report,null,2));
async function openSettings(page, mobile) {
  const tap = async locator => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const box = await locator.boundingBox().catch(() => null);
      if (!box || box.width < 1 || box.height < 1) {
        await page.waitForTimeout(100);
        continue;
      }
      const x = box.x + box.width / 2, y = box.y + box.height / 2;
      if (mobile) await page.touchscreen.tap(x, y);
      else await page.mouse.click(x, y);
      if (await page.locator('.rc61-settings').isVisible().catch(() => false)) return true;
      await page.waitForTimeout(100);
    }
    return false;
  };
  const fallback = page.locator('.rc108-settings-trigger');
  let opened = false;
  if (mobile) {
    const action = page.locator('[data-mobile-action="Menu"]');
    opened = await tap(action);
  } else {
    const menu = page.getByRole('button', { name: '설정 · 메뉴', exact: true });
    opened = await tap(menu);
  }
  if (!opened) opened = await tap(fallback);
  assert(opened, 'native Settings did not open after trusted pointer taps on visible settings controls');
  await page.locator('.rc61-settings').waitFor({ state: 'visible' });
}

async function advanceNarrative(page) {
  for (let i = 0; i < 18; i++) {
    const story = page.locator('#hapil-story-rc51');
    if (!(await story.count()) || !(await story.isVisible().catch(() => false))) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(80);
  }
  await page.waitForFunction(() => window.__MONGSE_QA_STATE__ && window.__HAPIL_CONTROLS_V31329__?.binding?.phase === 'game');
}

async function settleNavigation(page, mobile) {
  // Native map selection is guarded while an ultimate's admitted hits remain.
  // Use normal manual-mode UI, then resume simulation to finish that transaction.
  // Waiting inside the paused Settings screen cannot advance those hits.
  await page.locator('.rc61-settings').getByRole('radio', { name: '수동', exact: true }).check();
  const pending = await page.evaluate(() => window.__HAPIL_STABILITY_V31310__.hasPendingUltimateTransaction(window.__MONGSE_QA_STATE__));
  if (pending) {
    await page.getByRole('dialog',{name:'설정',exact:true}).getByRole('button',{name:'닫기 ×',exact:true}).click();
    await advanceNarrative(page);
    await page.waitForFunction(() => !window.__HAPIL_STABILITY_V31310__.hasPendingUltimateTransaction(window.__MONGSE_QA_STATE__), null, { timeout: 10000 });
    await openSettings(page, mobile);
  }
  assert.equal(await page.evaluate(() => window.__HAPIL_STABILITY_V31310__.hasPendingUltimateTransaction(window.__MONGSE_QA_STATE__)), false,
    'native ultimate transaction must settle before map navigation');
  return { manualModeViaUi: true, pendingAtPause: pending, settled: true };
}

async function startNewRun(page, dream) {
  const previousState = await page.evaluateHandle(() => window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current ?? null);
  await page.locator('.title-screen').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: '새 게임 시작', exact: true }).click();
  await page.locator('.select-screen').waitFor({ state: 'visible' });
  const dreamOption = page.locator('[data-game-mode-v31354="DREAM"]');
  if (dream) {
    assert.equal(await dreamOption.isDisabled(), false, 'the normal code flow should unlock the Dream launch option');
    await dreamOption.click();
  } else {
    const storyOption = page.locator('[data-game-mode-v31354="STORY"]');
    if (await storyOption.count()) await storyOption.click();
  }
  await page.getByRole('button', { name: '이 편성으로 접속', exact: true }).click();
  await page.locator('.select-screen').waitFor({ state: 'hidden' });
  await page.waitForFunction(previous => {
    const binding = window.__HAPIL_CONTROLS_V31329__?.binding;
    const current = binding?.state?.current;
    return current && current !== previous && binding.phase === 'game' &&
      window.__MONGSE_QA_STATE__ === current && current.zone === 'dist00';
  }, previousState, { timeout: 45000 });
  await advanceNarrative(page);
  const stateReplaced = await page.evaluate(previous => previous !== window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current, previousState);
  await previousState.dispose();
  assert.equal(stateReplaced, true, 'a native fresh-game launch creates a new run state object');
  return { stateReplaced };
}

async function applyCode(page, value) {
  const form = page.locator('form.developer-code-form-v31576');
  await form.locator('input[aria-label="개발자 코드"]').fill(value);
  await form.getByRole('button', { name: '코드 적용', exact: true }).click();
  return form.locator('[role="status"]');
}

async function snapshotRun(page) {
  return page.evaluate(() => {
    const s = window.__MONGSE_QA_STATE__;
    return {
      zone: s.zone,
      frontierZone: s.frontierZone,
      completedZones: [...(s.completedZones ?? [])].sort(),
      enemies: s.enemies?.length ?? 0,
      bossDefeated: s.bossDefeated === true,
      endingCleared: s.hapilEndingCleared === true || s.endingCleared === true,
      activeHeroMastery: s.activeHeroMastery,
      activeTimeMastery: s.activeTimeMastery,
      developerMaps: s.developerMapsRC133 ?? null,
      hasMapGrant: window.__HAPIL_DEVELOPER_MAPS_RC133__?.has(s) === true,
      canInner: window.__HAPIL_DEVELOPER_MAPS_RC133__?.canInner(s) === true,
      mode: window.__HAPIL_MODES_V31346__?.mode(s),
      hp: s.hp,
      maxHp: s.maxHp,
      practice: s.practiceV31329 === true,
      samongEnabled: window.__HAPIL_SAMONG_RC91__?.enabled(s) === true,
      samongUnlocked: window.__HAPIL_SAMONG_RC91__?.unlocked(s) === true,
      party: (() => { const p = window.__HAPIL_PARTY_V31322__; return p?.state === s ? { role: p.status?.role, paused: p.status?.paused === true, disconnected: p.status?.disconnected === true } : null; })(),
      fixedSpeed: window.__HAPIL_POLICY_RC127__?.fixedSpeed,
    };
  });
}

async function enterDeveloperCode(page, expectedMode, mobile) {
  await openSettings(page, mobile);
  const before = await snapshotRun(page);
  const rejected = await applyCode(page, '321');
  await page.waitForFunction(() => document.querySelector('form.developer-code-form-v31576 [role="status"]')?.textContent.includes('코드를 확인'));
  const rejectedMessage = await rejected.textContent();
  assert.equal((await snapshotRun(page)).hasMapGrant, false, 'invalid code must not grant map access');
  const accepted = await applyCode(page, '777');
  await page.waitForFunction(() => document.querySelector('form.developer-code-form-v31576 [role="status"]')?.textContent.includes('해금'));
  const after = await snapshotRun(page);
  assert.equal(after.mode, expectedMode, 'code was entered in the intended native game mode');
  assert.equal(after.hasMapGrant, true, 'accepted code grants the current run');
  assert.deepEqual(after.developerMaps, { version: 1, code: '777', allMaps: true });
  assert.equal(after.canInner, expectedMode === 'DREAM', `hidden arena gate requires the live Dream state: ${JSON.stringify(after)}`);
  assert.deepEqual(after.completedZones, before.completedZones, 'code does not award completed zones');
  assert.equal(after.zone, before.zone, 'code leaves the current map unchanged');
  assert.equal(after.enemies, before.enemies, 'code does not fabricate a boss kill or clear enemies');
  assert.equal(after.bossDefeated, before.bossDefeated, 'code does not grant a boss defeat');
  assert.equal(after.endingCleared, before.endingCleared, 'code does not grant an ending flag');
  assert.equal(after.activeHeroMastery, 7, 'the existing 777 hero mastery maximum is preserved');
  assert.equal(after.activeTimeMastery, 8, 'the existing 777 time mastery maximum is preserved');
  assert.equal(after.fixedSpeed, before.fixedSpeed, '777 preserves the fixed movement-speed specification');
  return { before, after, rejectedMessage, acceptedMessage: await accepted.textContent() };
}


async function arena(page,mobile){
 await advanceNarrative(page);await openSettings(page,mobile);await settleNavigation(page,mobile);
 const details=page.locator('.rc61-settings details').filter({has:page.getByText('방문한 맵 다시 가기',{exact:true})});
 await details.locator('summary').click();const maps=details.locator('.memory-map-grid').getByRole('button');assert.equal(await maps.count(),64);
 await page.locator('[data-rc133-map="inner-evil-rc133"]').click();
 await page.waitForFunction(()=>{const s=window.__MONGSE_QA_STATE__,H=window.__HAPIL_INNER_FINAL_RC133__;return s.zone==='cult04'&&s.innerFinalRC133?.phase==='fight'&&H.active(s)&&H.boss(s)&&window.__HAPIL_PARTY_V31322__?.status?.paused!==true;});
 const info=await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,H=window.__HAPIL_INNER_FINAL_RC133__,a=H.boss(s);return{entry:s.innerFinalRC133.entry,healthModel:s.innerFinalRC133.healthModel,maxHp:a.maxHp,completed:[...s.completedZones],ending:!!(s.endingCleared||s.hapilEndingCleared),traits:Object.keys(H.traits),skills:H.deck.map(x=>x.key)};});
 assert.equal(info.entry,'developer-777');assert.equal(info.healthModel,2);assert(info.maxHp>=12000&&info.maxHp<=3000000);assert.deepEqual(info.completed,[]);assert.equal(info.ending,false);assert.equal(info.traits.length,8);assert.equal(info.skills.length,9);return info;
}
async function nativeReload(page,mobile,complete=false){
 await openSettings(page,mobile);await page.locator('.rc61-settings').getByRole('button',{name:'저장 · 불러오기',exact:true}).click();
 const dialog=page.locator('[role="dialog"]').filter({hasText:'3중 저장 슬롯'});await dialog.waitFor({state:'visible'});
 await dialog.getByRole('button',{name:'저장',exact:true}).first().click();
 await page.waitForFunction(()=>/저장 슬롯|슬롯에 저장/.test(document.body.textContent));
 await dialog.getByRole('button',{name:'불러오기',exact:true}).first().click();
 await page.waitForFunction(done=>{const s=window.__MONGSE_QA_STATE__,H=window.__HAPIL_INNER_FINAL_RC133__;return window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game'&&window.__HAPIL_PARTY_V31322__?.status?.paused!==true&&s.innerFinalRC133?.entry==='developer-777'&&(done?s.innerFinalRC133.phase==='complete':!!H.boss(s));},complete);
 return page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,H=window.__HAPIL_INNER_FINAL_RC133__,A=window.__HAPIL_SAMONG_RC91__;return{phase:s.innerFinalRC133.phase,clash:s.innerFinalRC133.clash,hp:s.hp,bossHp:H.boss(s)?.hp??0,bossAwake:s.innerFinalRC133.awake,playerActive:A.active(s),mood:H.mood(s),maxHp:s.innerFinalRC133.maxHp};});
}
async function inspectBody(page){
 await page.waitForFunction(()=>{const s=window.__MONGSE_QA_STATE__,V=window.__HAPIL_BITMAP_NATIVE_RC133__,a=window.__HAPIL_INNER_FINAL_RC133__.boss(s);return V.body(s,s,true)&&V.body(s,a,false);});
 return page.evaluate(()=>{
  const s=window.__MONGSE_QA_STATE__,V=window.__HAPIL_BITMAP_NATIVE_RC133__,C=window.__HAPIL_CONTACT_V31336__,H=window.__HAPIL_INNER_FINAL_RC133__,M=window.__HAPIL_MEDIA_ART_RC133__,a=H.boss(s),body=C.body(s,s),enemy=V.body(s,a,false),shots=[];
  for(const [skill,sprite] of Object.entries(M.skills)){const q={id:701,sourceId:H.id,kind:'projectile',x:s.x,y:s.y,previousX:s.x,previousY:s.y,radius:.24,damage:20,sprite,born:s.time-1};const plan=V.projectile(s,q),contact=C.projectile(s,s,q);shots.push({skill,measured:!!plan,bitmap:contact.bitmap,points:plan?.points?.length,area:plan?.area});}
  return{body:{rx:body.rx,ry:body.ry},enemyPath:enemy.path,enemyPoints:enemy.points,height:Math.max(...enemy.points.map(p=>p.y))-Math.min(...enemy.points.map(p=>p.y)),shots};
 });
}
async function runProfile(browser,[name,width,height,mobile]){
 const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),row={name,status:'running',errors:[],httpErrors:[],cases:[]};report.profiles.push(row);page.on('dialog',d=>d.accept());page.on('pageerror',e=>row.errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)row.httpErrors.push({url:r.url(),status:r.status()});});
 try{
  await page.goto(base+'?qa=1&public-duel='+name+'-'+Date.now());await page.waitForFunction(()=>window.__HAPIL_RC133_NATIVE__?.installed&&window.__HAPIL_MEDIA_ART_RC133__?.ready);await page.keyboard.press('Escape');
  await startNewRun(page,false);await enterDeveloperCode(page,'STORY',mobile);await page.locator('.rc61-settings').getByRole('radio',{name:'수동',exact:true}).check();
  await page.locator('.rc61-settings').getByRole('button',{name:'자동 저장 후 시작 화면으로',exact:true}).click();
  await startNewRun(page,true);await enterDeveloperCode(page,'DREAM',mobile);await settleNavigation(page,mobile);await page.getByRole('dialog',{name:'설정',exact:true}).getByRole('button',{name:'닫기 ×',exact:true}).click();
  for(const kind of ['player','boss-first','boss-first-wounded-player','simultaneous']){
   const entry=await arena(page,mobile);if(kind==='player'){row.body=await inspectBody(page);assert(row.body.body.rx<=16&&row.body.body.ry<=33);assert(row.body.height>0&&row.body.height<=160);assert.equal(row.body.shots.length,9);assert(row.body.shots.every(x=>x.measured&&x.bitmap&&x.points===4&&x.area>0));}
   const before=await page.evaluate(kind=>{
    const s=window.__MONGSE_QA_STATE__,H=window.__HAPIL_INNER_FINAL_RC133__,A=window.__HAPIL_SAMONG_RC91__,U=window.__HAPIL_SAMONG_POLICY_RC133__,a=H.boss(s),hp=a.hp,priorPosition={x:s.x,y:s.y};
    // Pixel fixture only: keep both bodies in the portrait camera. Entry above
    // used the normal native UI; this is not a natural campaign claim.
    s.x=a.x-1.2;s.y=a.y+1.2;
    Object.assign(U.memory(s),{count:7,pending:true});
    let admitted,priorPlayerHp;
    if(kind==='player'){s.hp=0;priorPlayerHp=s.hp;admitted=A.tryRevive(s);}
    else if(kind.startsWith('boss-first')){s.hp=kind==='boss-first'?s.maxHp:Math.ceil(s.maxHp*.3);priorPlayerHp=s.hp;a.hp=0;admitted=H.beforeDeath(s,a);}
    else{s.hp=0;priorPlayerHp=s.hp;a.hp=0;admitted=H.beforeDeath(s,a);}
    return{admitted,priorPosition,position:{x:s.x,y:s.y},renderFrames:H.metrics().frames,priorBossHp:hp,priorPlayerHp,hp:s.hp,playerMaxHp:s.maxHp,bossHp:H.boss(s)?.hp??0,bossMaxHp:s.innerFinalRC133.maxHp,bossAwake:s.innerFinalRC133.awake,playerActive:A.active(s),phase:s.innerFinalRC133.phase,clash:s.innerFinalRC133.clash,mood:H.mood(s),ego:U.status(s)};
   },kind);
   assert(before.admitted);assert.equal(before.clash.used,true);assert.equal(before.clash.admitted,true);assert.equal(before.ego.count,0);assert.equal(before.ego.pending,false);assert(before.playerActive&&before.bossAwake>0);assert.equal(before.mood,'opposition');
   if(kind.startsWith('boss-first')){assert.equal(before.hp,before.priorPlayerHp);assert.equal(before.clash.reason,'boss');}else{assert.equal(before.hp,Math.ceil(before.playerMaxHp*.22));assert.equal(before.clash.reason,kind==='player'?'player':'both');}
   if(kind==='player')assert.equal(before.bossHp,before.priorBossHp);else assert.equal(before.bossHp,Math.ceil(before.bossMaxHp*.22));
   await page.waitForFunction(probe=>{const s=window.__MONGSE_QA_STATE__,H=window.__HAPIL_INNER_FINAL_RC133__;return s.time>=probe.clash.at+.4&&H.metrics().frames>=probe.renderFrames+2&&H.mood(s)==='opposition';},before);
   const rendered=await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,H=window.__HAPIL_INNER_FINAL_RC133__;return{time:s.time,hp:s.hp,bossHp:H.boss(s)?.hp,mood:H.mood(s),frames:H.metrics().frames,enemyHud:document.querySelector('.rc15-enemies')?.textContent,allyHud:document.querySelector('.rc15-allies')?.textContent};});
   await page.screenshot({path:output+'/'+name+'-'+kind+'.png'});
   const restored=await nativeReload(page,mobile);assert.equal(restored.phase,'fight');assert.equal(restored.maxHp,before.bossMaxHp);assert.equal(restored.clash.used,true);assert.equal(restored.clash.reason,before.clash.reason);assert(restored.playerActive&&restored.bossAwake>0);assert.equal(restored.mood,'opposition');
   const replay=await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,A=window.__HAPIL_SAMONG_RC91__,hp=s.hp,m=s.samongPassiveRC91,active=m.active,cooldown=m.cooldown;try{s.hp=0;m.active=0;m.cooldown=0;return A.tryRevive(s);}finally{s.hp=hp;m.active=active;m.cooldown=cooldown;}});assert.equal(replay,false,'loaded one-use clash cannot revive again even with expired timers');
   const second=await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,H=window.__HAPIL_INNER_FINAL_RC133__,a=H.boss(s);a.hp=0;const handled=H.beforeDeath(s,a);return{handled,phase:s.innerFinalRC133.phase,clash:s.innerFinalRC133.clash,mood:H.mood(s),boss:!!H.boss(s),pending:s.pendingHits.filter(q=>q.sourceId===H.id).length,shots:s.hostileProjectiles.filter(q=>q.sourceId===H.id).length};});assert(second.handled);assert.equal(second.phase,'complete');assert.equal(second.clash.used,true);assert.equal(second.mood,'normal');assert.equal(second.boss,false);assert.equal(second.pending+second.shots,0);
   const completed=await nativeReload(page,mobile,true);assert.equal(completed.phase,'complete');assert.equal(completed.clash.used,true);assert.equal(completed.bossHp,0);assert.equal(completed.mood,'normal');
   const afterCompletionReplay=await page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,A=window.__HAPIL_SAMONG_RC91__,hp=s.hp,m=s.samongPassiveRC91,active=m.active,cooldown=m.cooldown;try{s.hp=0;m.active=0;m.cooldown=0;return A.tryRevive(s);}finally{s.hp=hp;m.active=active;m.cooldown=cooldown;}});assert.equal(afterCompletionReplay,false,'second simultaneous lethal cannot revive even when boss completion callback runs first');
   if(kind==='simultaneous'){await page.waitForTimeout(250);await page.screenshot({path:output+'/'+name+'-complete-normal.png'});}
   row.cases.push({kind,fixture:'Staged HP/callback boundary and near-boss pixel position in live public game; native slot UI; captures wait for actual post-admission frames; first clash and terminal second boss lethal',entry,before,rendered,restored,replay,second,completed,afterCompletionReplay});save();
  }
  assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);row.status='passed';console.log('RC133_PUBLIC_DUEL_PROFILE',JSON.stringify(row));
 }catch(e){row.status='failed';row.error=String(e.stack||e);row.state=await snapshotRun(page).catch(()=>null);row.ui=await page.locator('body').innerText().catch(()=>null);await page.screenshot({path:output+'/'+name+'-failure.png'}).catch(()=>{});throw e;}finally{save();await context.close();}
}
(async()=>{let browser;try{
 assert.equal(cp.execFileSync('git',['diff','--name-only',runtime,'HEAD','--','assets','audio','data','index.html'],{cwd:root,encoding:'utf8'}).trim(),'','audit branch must preserve exact deployed runtime');
 const art=JSON.parse(original('qa/rc133/art-processing.json')),files=new Set(['index.html','assets/index-v31526.js','assets/rc133/bitmap-contact.js','assets/combat-v31402/contact-geometry.js','assets/rc133/inner-final.js','assets/rc133/media-art.js','assets/rc91/samong-awakening.js','assets/rc133/samong-policy.js','assets/rc133/developer-maps.js','assets/story-narration/v1/manifest.json','assets/story-narration/v1/player.js','assets/story-narration/v1/surfaces.js',...art.sources.map(x=>x.file),...art.outputs.map(x=>x.file),...art.externalDerivatives.map(x=>x.file)]);
 for(const file of files){const response=await fetch(base+file+'?public-duel='+runtime+'-'+Date.now(),{signal:AbortSignal.timeout(20000)}),bytes=Buffer.from(await response.arrayBuffer()),expected=digest(original(file));assert.equal(response.status,200,file);assert.equal(digest(bytes),expected,file+' exact public bytes');report.files.push({file,sha256:expected,bytes:bytes.length});}
 browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const profile of [['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]])await runProfile(browser,profile);
 report.status='passed';console.log('RC133_PUBLIC_DUEL_PASS',JSON.stringify({runtime,audit:report.auditCommit,files:report.files.length,profiles:report.profiles.map(x=>({name:x.name,status:x.status,cases:x.cases.map(c=>c.kind)}))}));
 }catch(e){report.status='failed';report.error=String(e.stack||e);console.error('RC133_PUBLIC_DUEL_FAIL',JSON.stringify({runtime,files:report.files.length,error:report.error,profiles:report.profiles.map(x=>({name:x.name,status:x.status,error:x.error,state:x.state,ui:x.ui?.slice(0,2500),cases:x.cases}))}));process.exitCode=1;}finally{save();await browser?.close();}})();
