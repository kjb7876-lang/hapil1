'use strict';

// Staged browser fixtures for the real developer-code form and run navigation.
// These checks do not claim natural campaign completion or simulate a boss kill.
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
const output = process.env.HAPIL_QA_OUTPUT || path.join(os.tmpdir(), 'hapil-rc133-777-browser');
fs.mkdirSync(output, { recursive: true });
const commit = cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const mime = {
  '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css',
  '.png': 'image/png', '.webp': 'image/webp', '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
};

// Read-only access to the actual native map catalog for comparing the UI list.
const qaBridge = `
window.__RC133_777_QA__=Object.freeze({
 maps:()=>Object.keys(N).filter(id=>N[id]&&Number.isFinite(N[id].order)).map(id=>({id,name:N[id].name||id,order:N[id].order})),
 frontier:()=>window.__HAPIL_DEVELOPER_MAPS_RC133__.frontier(N),
 pendingNavigation:()=>MONGSE_shouldBlockZoneTransitionV31310(window.__MONGSE_QA_STATE__)
});`;

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + pathname.replace(/^\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    res.setHeader('Content-Type', mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
    const body = fs.readFileSync(file);
    res.end(file.endsWith('/assets/index-v31526.js') ? Buffer.concat([body, Buffer.from(qaBridge)]) : body);
  } catch {
    res.writeHead(404).end();
  }
});

const report = {
  status: 'running',
  commit,
  fixture: 'Normal UI 777 code-entry/navigation and native slot save/load in isolated browser profiles; staged setup only, no natural completion claim',
  scope: ['pc', 'portrait', 'landscape'],
  profiles: [],
};
function saveReport() {
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
}

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
  // The native dialog header is a sibling of .rc61-settings content.
  // Check this even when this run has no pending ultimate to settle.
  const close = page.getByRole('dialog', { name: '설정', exact: true }).getByRole('button', { name: '닫기 ×', exact: true });
  assert.equal(await close.count(), 1, 'native Settings header exposes one close button');
  assert(await close.isVisible(), 'native Settings header close remains visible');
  const pending = await page.evaluate(() => window.__RC133_777_QA__.pendingNavigation());
  if (pending) {
    await close.click();
    await advanceNarrative(page);
    await page.waitForFunction(() => !window.__RC133_777_QA__.pendingNavigation(), null, { timeout: 10000 });
    await openSettings(page, mobile);
  }
  assert.equal(await page.evaluate(() => window.__RC133_777_QA__.pendingNavigation()), false,
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

async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.HAPIL_CHROMIUM || '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    for (const [name, width, height, mobile] of [
      ['pc', 1180, 757, false],
      ['portrait', 390, 844, true],
      ['landscape', 844, 390, true],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
      });
      const page = await context.newPage();
      const row = { name, viewport: [width, height], mobile, status: 'running', errors: [], missing: [] };
      report.profiles.push(row);
      page.on('pageerror', error => row.errors.push(error.stack || error.message));
      page.on('response', response => {
        if (response.status() >= 400) row.missing.push({ url: response.url(), status: response.status() });
      });
      try {
        await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
        await page.waitForFunction(() => window.__HAPIL_RC133_NATIVE__?.installed && window.__HAPIL_DEVELOPER_MAPS_RC133__);
        await page.keyboard.press('Escape');
        await startNewRun(page, false);

        row.storyCode = await enterDeveloperCode(page, 'STORY', mobile);
        row.storyHiddenButtonBeforeDream = await page.locator('[data-rc133-map="inner-evil-rc133"]').count();
        assert.equal(row.storyHiddenButtonBeforeDream, 0, 'the hidden arena is not available in a Story run');
        page.once('dialog', dialog => dialog.accept());
        await page.locator('.rc61-settings').getByRole('button', { name: '자동 저장 후 시작 화면으로', exact: true }).click();
        await page.locator('.title-screen').waitFor({ state: 'visible' });
        await page.getByRole('button', { name: '새 게임 시작', exact: true }).waitFor({ state: 'visible' });

        await startNewRun(page, true);
        row.freshDream = await snapshotRun(page);
        assert.equal(row.freshDream.mode, 'DREAM');
        assert.equal(row.freshDream.hasMapGrant, false, 'a fresh Dream run clears the previous run map grant');
        assert.equal(row.freshDream.frontierZone, 'dist00', 'fresh Dream starts at its native map frontier');
        assert.equal(row.freshDream.canInner, false, 'a fresh Dream run cannot use the hidden arena until code entry');

        row.dreamCode = await enterDeveloperCode(page, 'DREAM', mobile);
        row.navigationDrain = await settleNavigation(page, mobile);
        const mapDetails = page.locator('.rc61-settings details').filter({ has: page.getByText('방문한 맵 다시 가기', { exact: true }) });
        await mapDetails.locator('summary').click();
        const expectedMaps = await page.evaluate(() => window.__RC133_777_QA__.maps());
        const mapGrid = page.locator('.rc61-settings .memory-map-grid');
        const mapButtons = mapGrid.getByRole('button');
        const buttonLabels = await mapButtons.allTextContents();
        assert.equal(buttonLabels.length, expectedMaps.length, 'every actual native N map is exposed in the 777 selector');
        assert.deepEqual([...buttonLabels].sort(), expectedMaps.map(row => row.name).sort(), 'selector labels cover actual native maps');
        assert.equal(await page.locator('[data-rc133-map="inner-evil-rc133"]').count(), 1, 'Dream plus 777 shows one explicit hidden-arena button');
        assert.equal(await page.locator('[data-rc133-map="inner-evil-rc133"]').isDisabled(), false);

        const frontier = await page.evaluate(() => window.__RC133_777_QA__.frontier());
        const target = expectedMaps.find(row => row.id === frontier);
        assert(target, `native frontier ${frontier} exists in N`);
        const targetButton = mapGrid.getByRole('button', { name: target.name, exact: true });
        assert.equal(await targetButton.count(), 1, `native frontier map ${frontier} is unambiguous in the UI`);
        assert.equal(await targetButton.isDisabled(), false, `native frontier map ${frontier} is selectable`);
        await targetButton.click();
        await page.waitForFunction(id => window.__MONGSE_QA_STATE__?.zone === id, frontier);
        row.nativeMapAccess = { mapCount: buttonLabels.length, frontier, selectedZone: await page.evaluate(() => window.__MONGSE_QA_STATE__.zone) };

        await advanceNarrative(page);
        await openSettings(page, mobile);
        const directEntryButton = page.locator('[data-rc133-map="inner-evil-rc133"]');
        await page.locator('.rc61-settings details').filter({ has: page.getByText('방문한 맵 다시 가기', { exact: true }) }).locator('summary').click();
        await directEntryButton.click();
        await page.waitForFunction(() => {
          const H = window.__HAPIL_INNER_FINAL_RC133__, s = window.__MONGSE_QA_STATE__;
          return s?.zone === 'cult04' && H?.active(s) && H?.boss(s)?.id === 'inner-evil-rc133';
        });
        row.directArena = await page.evaluate(() => {
          const s = window.__MONGSE_QA_STATE__, H = window.__HAPIL_INNER_FINAL_RC133__;
          return {
            zone: s.zone,
            mode: window.__HAPIL_MODES_V31346__?.mode(s),
            active: H.active(s),
            bossId: H.boss(s)?.id,
            entry: s.innerFinalRC133?.entry,
            actorCount: s.enemies.filter(actor => actor.id === 'inner-evil-rc133').length,
            completedZones: [...s.completedZones].sort(),
            bossDefeated: s.bossDefeated === true,
            endingCleared: s.hapilEndingCleared === true || s.endingCleared === true,
          };
        });
        assert.equal(row.directArena.mode, 'DREAM');
        assert.equal(row.directArena.entry, 'developer-777', 'direct entry is explicit and does not simulate cult leader death');
        assert.equal(row.directArena.actorCount, 1, 'direct arena creates exactly one hidden persona actor');
        assert.deepEqual(row.directArena.completedZones, [], 'direct arena entry grants no completed-zone credit');
        assert.equal(row.directArena.bossDefeated, false, 'direct arena entry grants no boss defeat');
        assert.equal(row.directArena.endingCleared, false, 'direct arena entry grants no ending flag');
        await page.screenshot({ path: path.join(output, `${name}-developer-777-arena-fixture.png`), fullPage: false });

        await openSettings(page, mobile);
        await page.locator('.rc61-settings').getByRole('button', { name: '저장 · 불러오기', exact: true }).click();
        const saveDialog = page.locator('[role="dialog"]').filter({ hasText: '3중 저장 슬롯' });
        await saveDialog.waitFor({ state: 'visible' });
        await saveDialog.getByRole('button', { name: '저장', exact: true }).first().click();
        await page.waitForFunction(() => /저장 슬롯|슬롯에 저장/.test(document.body.textContent));
        await saveDialog.getByRole('button', { name: '불러오기', exact: true }).first().click();
        await page.waitForFunction(() => {
          const s = window.__MONGSE_QA_STATE__, D = window.__HAPIL_DEVELOPER_MAPS_RC133__, H = window.__HAPIL_INNER_FINAL_RC133__;
          return D?.has(s) && s?.innerFinalRC133?.entry === 'developer-777' && H?.boss(s)?.id === 'inner-evil-rc133';
        });
        row.nativeSlotReload = await page.evaluate(() => {
          const s = window.__MONGSE_QA_STATE__, D = window.__HAPIL_DEVELOPER_MAPS_RC133__, H = window.__HAPIL_INNER_FINAL_RC133__;
          return {
            mapFlag: s.developerMapsRC133,
            hasMapGrant: D.has(s),
            canInner: D.canInner(s),
            entry: s.innerFinalRC133?.entry,
            actorCount: s.enemies.filter(actor => actor.id === 'inner-evil-rc133').length,
            completedZones: [...s.completedZones].sort(),
            bossDefeated: s.bossDefeated === true,
            endingCleared: s.hapilEndingCleared === true || s.endingCleared === true,
            bossId: H.boss(s)?.id,
          };
        });
        assert.deepEqual(row.nativeSlotReload.mapFlag, { version: 1, code: '777', allMaps: true });
        assert.equal(row.nativeSlotReload.hasMapGrant, true);
        assert.equal(row.nativeSlotReload.canInner, true);
        assert.equal(row.nativeSlotReload.actorCount, 1);
        assert.deepEqual(row.nativeSlotReload.completedZones, []);
        assert.equal(row.nativeSlotReload.bossDefeated, false);
        assert.equal(row.nativeSlotReload.endingCleared, false);

        page.once('dialog', dialog => dialog.accept());
        await openSettings(page, mobile);
        await page.locator('.rc61-settings').getByRole('button', { name: '자동 저장 후 시작 화면으로', exact: true }).click();
        await page.locator('.title-screen').waitFor({ state: 'visible' });
        await page.getByRole('button', { name: '새 게임 시작', exact: true }).waitFor({ state: 'visible' });
        await startNewRun(page, true);
        row.freshDreamAfterLoad = await snapshotRun(page);
        assert.equal(row.freshDreamAfterLoad.hasMapGrant, false, 'fresh new game clears a saved current-run map grant');
        assert.equal(row.freshDreamAfterLoad.frontierZone, 'dist00', 'fresh new game resets the native frontier');
        assert.equal(row.freshDreamAfterLoad.canInner, false);
        await openSettings(page, mobile);
        await page.locator('.rc61-settings details').filter({ has: page.getByText('방문한 맵 다시 가기', { exact: true }) }).locator('summary').click();
        assert.equal(await page.locator('[data-rc133-map="inner-evil-rc133"]').count(), 0, 'new-game UI hides the direct arena button after reset');
        assert.deepEqual(row.errors, [], `${name}: page errors`);
        assert.deepEqual(row.missing, [], `${name}: failed network requests`);
        row.status = 'passed';
        saveReport();
        console.log(`PASS RC133 developer-777 browser ${name}`);
      } catch (error) {
        row.status = 'failed';
        row.error = error.stack || String(error);
        row.failureState = await snapshotRun(page).catch(() => null);
        row.failureUi = await page.evaluate(() => ({
          text: document.body.innerText.slice(-5000),
          inner: window.__MONGSE_QA_STATE__?.innerFinalRC133 ?? null,
          pending: window.__MONGSE_QA_STATE__?.pendingStrikes?.map(q => ({targetId:q.targetId,at:q.at,ultimate:q.ultimateCastIdV31309})) ?? [],
          time: window.__MONGSE_QA_STATE__?.time,
        })).catch(() => null);
        console.error('RC133_777_FAILURE_STATE', JSON.stringify({run:row.failureState,ui:row.failureUi,errors:row.errors}));
        await page.screenshot({ path: path.join(output, `${name}-developer-777-debug.png`), fullPage: false }).catch(() => {});
        saveReport();
        throw error;
      } finally {
        await context.close();
      }
    }
    report.status = 'passed';
    saveReport();
    console.log('RC133_777_BROWSER_PASS', JSON.stringify({ commit, profiles: report.profiles.map(row => ({ name: row.name, status: row.status, mapCount: row.nativeMapAccess?.mapCount, selected: row.nativeMapAccess?.selectedZone, savedArena: row.nativeSlotReload?.bossId })) }));
  } catch (error) {
    report.status = 'failed';
    report.error = error.stack || String(error);
    saveReport();
    throw error;
  } finally {
    await browser?.close();
    server.close();
  }
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
