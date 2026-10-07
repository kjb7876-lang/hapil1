'use strict';
// Read-only exact-785 baseline. Native Chromium, deterministic scene seed,
// QA-only staged hidden mutual state, CPU throttle 4, 10s warm + 8s sample.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const { chromium } = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright'));

const root = path.resolve(process.env.HAPIL_PROFILE_ROOT || '/workspace/hapil1-hidden-portrait-contrast');
const out = process.env.HAPIL_QA_OUTPUT || '/workspace/rc133-tools/mobile-quality';
const label = process.env.HAPIL_PROFILE_LABEL || 'baseline-785-hidden-mutual';
const profileWidth = Number(process.env.HAPIL_PROFILE_WIDTH || 390);
const profileHeight = Number(process.env.HAPIL_PROFILE_HEIGHT || 844);
fs.mkdirSync(out, { recursive: true });
const server = http.createServer((req, res) => {
  try {
    const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    assert(file.startsWith(root + path.sep));
    res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' })[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404).end(); }
});
const report = {
  commit: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  worktreeStatus: cp.execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim() || 'clean',
  browser: null,
  scenario: {
    kind: 'bounded native hidden-mutual fixture; existing QA API enters the hidden boss, manual controls prevent player auto-kills, actual inner boss update generates its own volley after both real awakening timers are staged active; player-only invulnerability holds the 8-second sample',
    seed: 'xorshift32: 0x785133',
    warmSeconds: '10 seconds minimum, then until native inner elapsed >=6 s, cycle >=2, and live hostile projectile count >0 (120 s wall timeout)',
    sampleSeconds: 8,
    viewportCss: { width: profileWidth, height: profileHeight },
    deviceScaleFactor: 2,
    cpuThrottle: 4,
    runs: []
  },
  status: 'running'
};
const save = () => fs.writeFileSync(path.join(out, `${label}.json`), JSON.stringify(report, null, 2));
const stat = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const q = p => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : null;
  return { count: sorted.length, p50Ms: q(0.5), p95Ms: q(0.95), maxMs: q(1) };
};

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({chromiumSandbox: true,  executablePath: process.env.HAPIL_CHROMIUM || '/usr/bin/chromium', args: ['--disable-dev-shm-usage'] });
    report.browser = { version: browser.version(), executable: process.env.HAPIL_CHROMIUM || '/usr/bin/chromium' };
    const context = await browser.newContext({ viewport: { width: profileWidth, height: profileHeight }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const run = { errors: [], httpErrors: [], status: 'running' };
    report.scenario.runs.push(run);
    page.on('pageerror', error => run.errors.push(String(error)));
    page.on('response', response => { if (response.status() >= 400) run.httpErrors.push({ url: response.url(), status: response.status() }); });
    await page.addInitScript(() => {
      let x = 0x785133;
      Math.random = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
      window.__MOBILE_IMAGE_TRACE__ = { loadCount: 0, decodeCalls: 0, decodeResolved: 0, decodeRejected: 0, decodeTotalMs: 0, decodeMaxMs: 0 };
      document.addEventListener('load', event => { if (event.target instanceof HTMLImageElement) window.__MOBILE_IMAGE_TRACE__.loadCount++; }, true);
      const nativeDecode = HTMLImageElement.prototype.decode;
      if (nativeDecode) HTMLImageElement.prototype.decode = function (...args) {
        const started = performance.now(), trace = window.__MOBILE_IMAGE_TRACE__; trace.decodeCalls++;
        return Reflect.apply(nativeDecode, this, args).then(value => { const ms = performance.now() - started; trace.decodeResolved++; trace.decodeTotalMs += ms; trace.decodeMaxMs = Math.max(trace.decodeMaxMs, ms); return value; }, error => { trace.decodeRejected++; throw error; });
      };
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
    await page.waitForFunction(() => window.__HAPIL_RC133_NATIVE__?.installed);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '새 게임 시작', exact: true }).click();
    await page.getByRole('button', { name: '이 편성으로 접속', exact: true }).click();
    await page.waitForFunction(() => window.__HAPIL_CONTROLS_V31329__?.binding?.phase === 'game');
    await page.locator('.game-stage canvas').waitFor({ state: 'visible' });
    for (let i = 0; i < 18 && await page.locator('#hapil-story-rc51').count(); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(80); }
    await page.evaluate(() => {
      const s = window.__MONGSE_QA_STATE__;
      window.__HAPIL_SAMONG_RC91__.unlock(null, '777');
      window.__HAPIL_MODES_V31346__.set('DREAM', s);
      window.__MONGSE_QA_API__.stageV3128BossShowcase('cult04');
      s.innerFinalRC133 = null;
      window.__MONGSE_QA_API__.forceDefeatCurrentBossR4();
      const H = window.__HAPIL_INNER_FINAL_RC133__;
      s.innerFinalRC133.intro = 0;
      s.innerFinalRC133.phase = 'fight';
      s.innerFinalRC133.awakeningCooldown = 9999;
      H.tick(s, 0);
      const boss = H.boss(s);
      s.invulnerableUntil = s.time + 120;
      s.innerFinalRC133.awake = 120;
      s.samongPassiveRC91 = { active: 120, cooldown: 1000, duration: 7, heroId: s.activeHeroId };
      window.__HAPIL_CONTROLS_V31329__.setMode('manual');
      const perf = window.__MOBILE_785_PERF__ = { controlsStage: [], simulationBeforeRender: [], renderAll: [], renderByDepth: {}, renderDepth: 0, compose: [], composeApplied: [], composeNoop: [], frames: [], longTasks: [], projectileCounts: [], compositionCalls: 0, composeAppliedCount: 0, composeNoopCount: 0, innerTickCalls: 0, innerTickTotalMs: 0, innerTickMaxMs: 0, innerTickLastDt: null, innerTickPositiveDtCalls: 0, drawImage: {}, layoutRead: { count: 0, totalMs: 0, maxMs: 0 }, matrixInverse: { count: 0, totalMs: 0, maxMs: 0 }, recording: false, lastRaf: null, lastFrameStart: null, started: performance.now() };
      const gameCanvas = document.querySelector('.game-stage canvas');
      const ctxProto = CanvasRenderingContext2D.prototype, nativeDrawImage = ctxProto.drawImage;
      ctxProto.drawImage = function (source, ...args) {
        if (!perf.recording) return Reflect.apply(nativeDrawImage, this, [source, ...args]);
        const dest = this.canvas;
        const isCanvas = source instanceof HTMLCanvasElement;
        const category = source === dest ? 'selfCanvas' : source === gameCanvas ? 'gameCanvasToCache' : (dest === gameCanvas && isCanvas) ? 'cacheToGameCanvas' : isCanvas ? 'otherCanvas' : source instanceof HTMLImageElement ? 'imageAsset' : 'otherSource';
        const bucket = perf.drawImage[category] ||= { count: 0, totalMs: 0, maxMs: 0, sourcePixels: 0, destinationPixels: 0 };
        const t = category === 'imageAsset' || category === 'otherSource' ? null : performance.now();
        try { return Reflect.apply(nativeDrawImage, this, [source, ...args]); }
        finally {
          bucket.count++;
          const sw = source?.naturalWidth || source?.videoWidth || source?.width || 0, sh = source?.naturalHeight || source?.videoHeight || source?.height || 0;
          bucket.sourcePixels += sw * sh;
          const dw = args.length >= 8 ? args[6] : args.length >= 4 ? args[2] : sw;
          const dh = args.length >= 8 ? args[7] : args.length >= 4 ? args[3] : sh;
          bucket.destinationPixels += Math.max(0, Number(dw) || 0) * Math.max(0, Number(dh) || 0);
          if (t !== null) { const ms = performance.now() - t; bucket.totalMs += ms; bucket.maxMs = Math.max(bucket.maxMs, ms); }
        }
      };
      const rectProto = Element.prototype, nativeRect = rectProto.getBoundingClientRect;
      rectProto.getBoundingClientRect = function (...args) {
        if (!perf.recording || this !== gameCanvas) return Reflect.apply(nativeRect, this, args);
        const t = performance.now(); try { return Reflect.apply(nativeRect, this, args); } finally { const ms = performance.now() - t; perf.layoutRead.count++; perf.layoutRead.totalMs += ms; perf.layoutRead.maxMs = Math.max(perf.layoutRead.maxMs, ms); }
      };
      const matrixProto = window.DOMMatrixReadOnly?.prototype || window.DOMMatrix?.prototype, nativeInverse = matrixProto?.inverse;
      if (nativeInverse) try { matrixProto.inverse = function (...args) {
        if (!perf.recording) return Reflect.apply(nativeInverse, this, args);
        const t = performance.now(); try { return Reflect.apply(nativeInverse, this, args); } finally { const ms = performance.now() - t; perf.matrixInverse.count++; perf.matrixInverse.totalMs += ms; perf.matrixInverse.maxMs = Math.max(perf.matrixInverse.maxMs, ms); }
      }; } catch {}
      const controls = window.__HAPIL_CONTROLS_V31329__;
      const frameStart = controls.frameStart;
      controls.frameStart = function (...args) { const t = performance.now(); perf.lastFrameStart = t; try { return frameStart.apply(this, args); } finally { perf.controlsStage.push(performance.now() - t); } };
      const bridge = window.__HAPIL_RC86_BRIDGE__;
      const renderFrame = bridge.renderFrame;
      bridge.renderFrame = function (...args) {
        const depth = perf.renderDepth, t = performance.now();
        if (depth === 0 && perf.lastFrameStart !== null) {
          const updateMs = t - perf.lastFrameStart;
          if (updateMs < 1000) perf.simulationBeforeRender.push(updateMs);
          perf.lastFrameStart = null;
        }
        perf.renderDepth = depth + 1;
        try { return renderFrame.apply(this, args); }
        finally { const elapsed = performance.now() - t; perf.renderAll.push(elapsed); (perf.renderByDepth[depth] ||= []).push(elapsed); perf.renderDepth = depth; }
      };
      window.__HAPIL_INNER_FINAL_RC133__ = Object.freeze({ ...H,
        tick(...args) { const t = performance.now(); perf.innerTickLastDt = args[1]; if (args[1] > 0) perf.innerTickPositiveDtCalls++; try { return H.tick(...args); } finally { const ms = performance.now() - t; perf.innerTickCalls++; perf.innerTickTotalMs += ms; perf.innerTickMaxMs = Math.max(perf.innerTickMaxMs, ms); } },
        compose(...args) {
          const t = performance.now(); let applied = false;
          try { applied = H.compose(...args); return applied; }
          finally { const ms = performance.now() - t; perf.compose.push(ms); perf.compositionCalls++; if (applied) { perf.composeApplied.push(ms); perf.composeAppliedCount++; } else { perf.composeNoop.push(ms); perf.composeNoopCount++; } }
        }
      });
      const raf = t => {
        if (perf.lastRaf !== null) perf.frames.push(t - perf.lastRaf);
        perf.lastRaf = t;
        if (perf.recording) { const state = window.__MONGSE_QA_STATE__; perf.projectileCounts.push({ t, count: state?.hostileProjectiles?.length ?? 0, enemies: state?.enemies?.filter(a => a?.hp > 0 && !a.visualOnly && !a.friendly).length ?? 0 }); }
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
      if (PerformanceObserver.supportedEntryTypes.includes('longtask')) new PerformanceObserver(list => perf.longTasks.push(...list.getEntries().map(e => e.duration))).observe({ type: 'longtask' });
      window.__MOBILE_785_SCENARIO__ = () => {
        const state = window.__MONGSE_QA_STATE__;
        const counts = {};
        for (const [key, value] of Object.entries(state)) if (Array.isArray(value) && /projectile|bullet|enemy|boss|actor/i.test(key)) counts[key] = value.length;
        return {
          zone: state.zone, mode: window.__HAPIL_MODES_V31346__?.get?.() ?? 'DREAM', phase: state.innerFinalRC133?.phase,
          hiddenBoss: state.enemies?.filter(a => a.id === 'inner-evil-rc133').map(a => ({ id: a.id, hp: a.hp, awake: !!state.innerFinalRC133?.awake })),
          actors: state.enemies?.map(a => ({ id: a.id, hp: a.hp, boss: !!a.boss })) ?? [],
          hostileProjectiles: state.hostileProjectiles?.length ?? null,
          counts, mood: window.__HAPIL_INNER_FINAL_RC133__?.mood(state), elapsedSceneSeconds: state.time, innerBossElapsed: state.innerFinalRC133?.elapsed,
          innerBossCycle: state.innerFinalRC133?.cycle, innerBossShotDelay: state.innerFinalRC133?.shotDelay, nativeInnerTickCalls: perf.innerTickCalls, nativeInnerTickLastDt: perf.innerTickLastDt, nativeInnerTickPositiveDtCalls: perf.innerTickPositiveDtCalls,
          paused: !!(state.paused || state.pause || document.hidden), storyOverlayOpen: !!document.querySelector('#hapil-story-rc51'),
          readingBlocked: window.__HAPIL_READING_V31342__?.blocked ?? null, modalBlocked: !!window.__HAPIL_CONTROLS_V31329__?.binding?.modal?.current,
          localInputBlocked: window.__HAPIL_CONTROLS_V31329__?.localInputBlocked?.() ?? null, bindingPhase: window.__HAPIL_CONTROLS_V31329__?.binding?.phase ?? null,
          bindingHasState: window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current === state,
          player: { hp: state.hp, maxHp: state.maxHp, invulnerableUntil: state.invulnerableUntil }, timeStopUntil: state.timeStopUntil ?? null,
          phaseState: state.phase ?? null, gameOver: !!(state.gameOver || state.finished), partyRole: window.__HAPIL_PARTY_V31322__?.status?.role ?? null,
          partyPaused: window.__HAPIL_PARTY_V31322__?.status?.paused ?? null, partyDisconnected: window.__HAPIL_PARTY_V31322__?.status?.disconnected ?? null,
          document: { visibilityState: document.visibilityState, hidden: document.hidden, activeElement: document.activeElement?.tagName ?? null },
          encounterDialogue: state.encounterDialogue31226 ?? null, encounterLockUntil: state.encounterLockUntil31226 ?? null, encounterWallUnlockAt: state.encounterWallUnlockAtV31227 ?? null
        };
      };
    });
    for (let i = 0; i < 30 && await page.locator('#hapil-story-rc51').count(); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(80); }
    run.preWarmState = await page.evaluate(() => window.__MOBILE_785_SCENARIO__());
    await page.waitForTimeout(10000);
    run.afterMinimumWarmState = await page.evaluate(() => window.__MOBILE_785_SCENARIO__());
    try {
      await page.waitForFunction(() => {
        const state = window.__MONGSE_QA_STATE__;
        return state?.innerFinalRC133?.elapsed >= 6 && state.innerFinalRC133.cycle >= 2 && state.hostileProjectiles?.length > 0;
      }, null, { timeout: 120000, polling: 100 });
    } catch (error) {
      run.warmTimeoutState = await page.evaluate(() => window.__MOBILE_785_SCENARIO__());
      run.warmTimeoutDiagnostics = await page.evaluate(() => {
        const state = window.__MONGSE_QA_STATE__, p = window.__MOBILE_785_PERF__;
        return {
          rafSamples: p.frames.length, topLevelRenders: p.renderByDepth[0]?.length ?? 0, cameraRenders: p.renderByDepth[1]?.length ?? 0,
          canvas: document.querySelector('.game-stage canvas') ? { width: document.querySelector('.game-stage canvas').width, height: document.querySelector('.game-stage canvas').height } : null,
          actorAlive: state?.enemies?.filter(a => a?.hp > 0 && !a.visualOnly && !a.friendly).map(a => ({ id: a.id, hp: a.hp, invulnerableUntil: a.invulnerableUntil })) ?? [],
          activeHostileProjectiles: state?.hostileProjectiles?.slice(0, 12).map(q => ({ x: q.x, y: q.y, vx: q.vx, vy: q.vy, life: q.life, frozenUntil: q.frozenUntil })) ?? [],
          localInputBlocked: window.__HAPIL_CONTROLS_V31329__?.localInputBlocked?.() ?? null,
          partyStatus: window.__HAPIL_PARTY_V31322__?.status ? { role: window.__HAPIL_PARTY_V31322__.status.role, paused: window.__HAPIL_PARTY_V31322__.status.paused, disconnected: window.__HAPIL_PARTY_V31322__.status.disconnected } : null,
          resources: performance.getEntriesByType('resource').length
        };
      });
      run.warmTimeoutScreenshot = path.join(out, `${label}-warm-timeout.png`);
      await page.screenshot({ path: run.warmTimeoutScreenshot, fullPage: false });
      throw error;
    }
    run.warmCompletion = await page.evaluate(() => window.__MOBILE_785_SCENARIO__());
    await page.evaluate(() => {
      const p = window.__MOBILE_785_PERF__;
      for (const key of ['controlsStage', 'simulationBeforeRender', 'renderAll', 'compose', 'composeApplied', 'composeNoop', 'frames', 'longTasks']) p[key] = [];
      p.renderByDepth = {}; p.drawImage = {}; p.projectileCounts = []; p.layoutRead = { count: 0, totalMs: 0, maxMs: 0 }; p.matrixInverse = { count: 0, totalMs: 0, maxMs: 0 }; p.innerTickCalls = 0; p.innerTickTotalMs = 0; p.innerTickMaxMs = 0; p.recording = true; p.compositionCalls = 0; p.composeAppliedCount = 0; p.composeNoopCount = 0; p.lastRaf = null; p.lastFrameStart = null; p.started = performance.now();
    });
    await page.waitForTimeout(8000);
    const data = await page.evaluate(() => {
      const p = window.__MOBILE_785_PERF__;
      const canvas = document.querySelector('.game-stage canvas');
      const entries = performance.getEntriesByType('resource');
        const durations = values => {
        const sorted = [...values].sort((a, b) => a - b);
        const q = p => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : null;
        return { count: sorted.length, p50Ms: q(.5), p95Ms: q(.95), maxMs: q(1), over50: sorted.filter(x => x > 50).length, over100: sorted.filter(x => x > 100).length, over250: sorted.filter(x => x > 250).length };
        };
      const projectileCounts = p.projectileCounts.map(v => v.count).sort((a, b) => a - b);
      return {
        scenario: window.__MOBILE_785_SCENARIO__(),
        seconds: (performance.now() - p.started) / 1000,
        controlsStage: durations(p.controlsStage), simulationBeforeRender: durations(p.simulationBeforeRender), renderTopLevel: durations(p.renderByDepth[0] || []), renderCameraPass: durations(p.renderByDepth[1] || []), renderAllDepths: durations(p.renderAll), composeAll: durations(p.compose), composeAppliedFinal: durations(p.composeApplied), composeNoopRecursiveOrNormal: durations(p.composeNoop), rafInterval: durations(p.frames), longTasks: durations(p.longTasks),
        compositionCalls: { total: p.compositionCalls, appliedFinal: p.composeAppliedCount, noOp: p.composeNoopCount },
        nativeInnerBossTick: { calls: p.innerTickCalls, totalMs: p.innerTickTotalMs, maxMs: p.innerTickMaxMs },
        projectileDensity: { samples: projectileCounts.length, min: projectileCounts[0] ?? null, p50: projectileCounts.length ? projectileCounts[Math.floor(projectileCounts.length * .5)] : null, p95: projectileCounts.length ? projectileCounts[Math.min(projectileCounts.length - 1, Math.floor(projectileCounts.length * .95))] : null, max: projectileCounts.at(-1) ?? null, final: p.projectileCounts.at(-1)?.count ?? null, nativeActorCountMax: Math.max(0, ...p.projectileCounts.map(v => v.enemies)) },
        rendererOperations: { drawImage: p.drawImage, gameCanvasLayoutReads: p.layoutRead, domMatrixInverse: p.matrixInverse, fullSizePairRGBABytes: canvas ? canvas.width * canvas.height * 4 * 2 : null, croppedPairRGBABytes: canvas ? canvas.width * (Math.floor(canvas.height / 2) + Math.min(1, Math.floor((canvas.height - Math.floor(canvas.height / 2)) / 2)) + Math.min(1, canvas.height - Math.floor((canvas.height - Math.floor(canvas.height / 2)) / 2) - Math.floor(canvas.height / 2))) * 4 * 2 : null },
        canvas: { width: canvas?.width, height: canvas?.height, css: canvas?.getBoundingClientRect().toJSON(), dpr: devicePixelRatio },
        domNodes: document.getElementsByTagName('*').length,
        jsHeapUsedBytes: performance.memory?.usedJSHeapSize ?? null,
        images: { resources: entries.filter(e => e.initiatorType === 'img').length, encodedBytes: entries.filter(e => e.initiatorType === 'img').reduce((a, e) => a + (e.encodedBodySize || 0), 0), transferBytes: entries.filter(e => e.initiatorType === 'img').reduce((a, e) => a + (e.transferSize || 0), 0), decode: window.__MOBILE_IMAGE_TRACE__ },
        resources: { count: entries.length, encodedBytes: entries.reduce((a, e) => a + (e.encodedBodySize || 0), 0), transferBytes: entries.reduce((a, e) => a + (e.transferSize || 0), 0) }
      };
    });
    run.result = data;
    run.status = run.errors.length === 0 && run.httpErrors.length === 0 ? 'passed' : 'failed';
    report.status = run.status;
    save();
    console.log('MOBILE_785_BASELINE', JSON.stringify({ commit: report.commit, browser: report.browser, scenario: report.scenario.kind, result: data, errors: run.errors, httpErrors: run.httpErrors }));
    await context.close();
  } catch (error) {
    report.status = 'failed';
    report.error = String(error.stack || error);
    save();
    console.error('MOBILE_785_BASELINE_FAILED', report.error);
    process.exitCode = 1;
  } finally {
    save();
    await browser?.close();
    server.close();
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
