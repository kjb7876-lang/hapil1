'use strict';

// Read-only visual observation of the native RC133 hidden Persona arena.
// Start only when the parent has released the shared browser workload.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const { chromium } = require(path.join(
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '/tmp/pw155/node_modules', 'playwright'));

const root = path.resolve(process.env.HAPIL_RC134_ROOT || path.resolve(__dirname,'../..'));
const output = path.resolve(process.env.HAPIL_QA_OUTPUT || '/tmp/rc136-public-native');
const expectedCommit = process.env.HAPIL_EXPECTED_COMMIT || 'd15a148241afecfe94ebf37e3e3d830e383531fa';
const publicUrl = process.env.HAPIL_PUBLIC_URL;
assert(publicUrl === 'https://kjb7876-lang.github.io/hapil1/', 'public audit stays on authorized Pages origin');
const mobile = process.env.HAPIL_PUBLIC_MOBILE === '1';
const helpers = require('./public-helpers.cjs');
const keys = ['small-orb', 'eye', 'diamond', 'clock', 'star', 'eclipse', 'lance', 'shield', 'vortex'];
const skillsDir = path.join(root, 'assets/rc134/persona-skills');
const manifestPath = path.join(skillsDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const mime = {
  '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css',
  '.png': 'image/png', '.webp': 'image/webp', '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.json': 'application/json',
};

const commit = cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
assert.equal(commit, expectedCommit, `expected exact RC134 build ${expectedCommit}; found ${commit}`);
for (const key of keys) assert(fs.existsSync(path.join(skillsDir, `${key}.png`)), `missing ${key}.png`);
fs.mkdirSync(output, { recursive: true });

const report = {
  status: 'running', commit,
  route: 'native Settings developer-code 777 form -> native hidden-arena selector',
  instrumentation: 'read-only native projectile snapshots; source-matched main-canvas draw geometry; exact native-frame canvas snapshots after RC86 renderFrame returns',
  stateWrites: 'none; only normal menus, launch selection, and native 777 selector are used',
  expectedSkills: keys,
  manifest,
  files: Object.fromEntries(keys.map(key => {
    const file = path.join(skillsDir, `${key}.png`);
    return [key, { path: `assets/rc134/persona-skills/${key}.png`, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }];
  })),
  resources: [], emissions: [], draws: [], captures: [], screenshots: [], observations: [],
};
const save = () => fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return res.writeHead(400).end(); }
  const file = path.resolve(root, '.' + pathname.replace(/^\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    res.setHeader('Content-Type', mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404).end(); }
});

// This hook records the original image passed to drawImage, then forwards the
// same receiver, image, and arguments to the original canvas implementation.
const canvasObserver = `(() => {
  const skillKeys = new Set(${JSON.stringify(keys)});
  const audit = { frameSerial: 0, currentFrame: null, snapshots: Object.create(null), errors: [] };
  Object.defineProperty(window, '__PERSONA_NATIVE_NINE_AUDIT__', { value: audit, configurable: false });
  const liveCanvas = canvas => canvas instanceof HTMLCanvasElement && canvas.isConnected &&
    canvas.getRootNode() === document && canvas.matches('.game-stage > canvas') &&
    canvas.width > 0 && canvas.height > 0;
  const skillKey = raw => {
    try {
      const pathname = new URL(String(raw), location.href).pathname;
      const prefix = '/assets/rc134/persona-skills/';
      const at = pathname.lastIndexOf(prefix);
      if (at < 0 || !pathname.endsWith('.png')) return null;
      const key = pathname.slice(at + prefix.length, -4);
      return skillKeys.has(key) ? key : null;
    } catch (_) { return null; }
  };
  const matchingPackets = (state, key) => {
    const m = state?.innerFinalRC133;
    if (state?.zone !== 'cult04' || m?.entry !== 'developer-777' || m?.phase !== 'fight') return [];
    return (state.hostileProjectiles || []).filter(q => q?.rc133InnerShot === true &&
      q.rc133Skill === key && skillKey(q.sprite) === key).map(q => ({
        key: q.rc133Skill, source: q.sprite, cycle: q.rc133Cycle, shotIndex: q.rc133ShotIndex,
        x: q.x, y: q.y, vx: q.vx, vy: q.vy, radius: q.radius,
        warningUntil: q.collisionDisabledUntil31219 ?? q.frozenUntil ?? null,
      }));
  };
  const visibleGeometry = (ctx, image, args) => {
    if (!(ctx.globalAlpha > 0)) return null;
    const iw = Number(image?.naturalWidth || image?.videoWidth || image?.width || 0);
    const ih = Number(image?.naturalHeight || image?.videoHeight || image?.height || 0);
    if (!(iw > 0 && ih > 0)) return null;
    let dx, dy, dw, dh;
    if (args.length === 2) [dx, dy] = args, dw = iw, dh = ih;
    else if (args.length === 4) [dx, dy, dw, dh] = args;
    else if (args.length === 8) [dx, dy, dw, dh] = args.slice(4);
    else return null;
    if (![dx, dy, dw, dh].every(Number.isFinite) || dw === 0 || dh === 0) return null;
    let matrix;
    try { matrix = ctx.getTransform(); } catch (_) { return null; }
    const corners = [[dx,dy],[dx+dw,dy],[dx+dw,dy+dh],[dx,dy+dh]].map(([x,y]) => ({
      x: matrix.a*x + matrix.c*y + matrix.e,
      y: matrix.b*x + matrix.d*y + matrix.f,
    }));
    if (!corners.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))) return null;
    const bounds = {
      left: Math.min(...corners.map(point => point.x)), top: Math.min(...corners.map(point => point.y)),
      right: Math.max(...corners.map(point => point.x)), bottom: Math.max(...corners.map(point => point.y)),
    };
    const canvas = ctx.canvas, backing = [{x:0,y:0},{x:canvas.width,y:0},{x:canvas.width,y:canvas.height},{x:0,y:canvas.height}];
    const axes = [{x:1,y:0},{x:0,y:1}, ...corners.map((point, i) => {
      const next = corners[(i + 1) % corners.length], ex = next.x - point.x, ey = next.y - point.y;
      return {x:-ey,y:ex};
    })];
    const intersectsBacking = axes.every(axis => {
      const a = corners.map(point => point.x * axis.x + point.y * axis.y);
      const b = backing.map(point => point.x * axis.x + point.y * axis.y);
      return Math.max(...a) > Math.min(...b) && Math.max(...b) > Math.min(...a);
    });
    if (!intersectsBacking) return null;
    return { alpha: ctx.globalAlpha, sourceSize: [iw, ih], localDestination: [dx, dy, dw, dh],
      transform: [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f], corners, backingBounds: bounds,
      intersectsBacking };
  };
  const installDrawObserver = () => {
    const proto = window.CanvasRenderingContext2D?.prototype;
    if (!proto || typeof proto.drawImage !== 'function') { setTimeout(installDrawObserver, 10); return; }
    if (proto.__personaNativeNineWrapped) return;
    const original = proto.drawImage;
    Object.defineProperty(proto, '__personaNativeNineWrapped', { value: true });
    Object.defineProperty(proto, 'drawImage', { configurable: true, writable: true, value: function(image, ...args) {
      try {
        const frame = audit.currentFrame;
        const canvas = this.canvas;
        const raw = image && (image.currentSrc || image.src || image.url);
        if (frame && canvas === frame.canvas && liveCanvas(canvas) && raw) {
          const key = skillKey(raw), geometry = visibleGeometry(this, image, args);
          if (key && geometry) {
            const state = window.__MONGSE_QA_STATE__;
            const packets = matchingPackets(state, key);
            if (packets.length && !frame.skills[key]) {
              frame.skills[key] = { key, source: String(raw), geometry, packets,
                zone: state.zone, phase: state.innerFinalRC133.phase,
                cycle: state.innerFinalRC133.cycle, atMs: Math.round(performance.now()) };
            }
          }
        }
      } catch (error) { try { audit.errors.push(String(error)); } catch (_) {} }
      return original.call(this, image, ...args);
    }});
  };
  const wrapBridge = bridge => {
    if (!bridge || typeof bridge.renderFrame !== 'function') return;
    const original = bridge.renderFrame;
    if (original.__personaNativeNineWrapped) return;
    const observed = function(canvas, state, cache, ...args) {
      if (!liveCanvas(canvas)) return original.call(this, canvas, state, cache, ...args);
      const prior = audit.currentFrame;
      const frame = { id: ++audit.frameSerial, canvas, skills: Object.create(null) };
      audit.currentFrame = frame;
      let result;
      try { result = original.call(this, canvas, state, cache, ...args); }
      finally {
        audit.currentFrame = prior;
        for (const [key, draw] of Object.entries(frame.skills)) {
          if (audit.snapshots[key]) continue;
          try {
            audit.snapshots[key] = { ...draw, frameId: frame.id,
              renderedAtMs: Math.round(performance.now()), renderedAtEpochMs: Date.now(),
              canvasSize: [canvas.width, canvas.height], dataUrl: canvas.toDataURL('image/png') };
          } catch (error) { audit.errors.push('snapshot '+key+': '+String(error)); }
        }
      }
      return result;
    };
    Object.defineProperty(observed, '__personaNativeNineWrapped', { value: true });
    bridge.renderFrame = observed;
  };
  let bridgeValue;
  Object.defineProperty(window, '__HAPIL_RC86_BRIDGE__', { configurable: true, enumerable: true,
    get() { return bridgeValue; }, set(value) { bridgeValue = value; try { wrapBridge(value); } catch (error) { audit.errors.push('bridge wrap: '+String(error)); } } });
  installDrawObserver();
})();`;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function openSettings(page) {
  const tryTap = async locator => {
    if(!await locator.count() || !await locator.isVisible().catch(()=>false)) return false;
    for (let i = 0; i < 8; i++) {
      if(await page.locator('#hapil-story-rc51:visible').count()) await advanceNarrative(page);
      const box = await locator.boundingBox({timeout:1000}).catch(() => null);
      if (box && box.width > 1 && box.height > 1) {
        if(mobile) await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        else await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        if (await page.locator('.rc61-settings').isVisible().catch(() => false)) return true;
      }
      await page.waitForTimeout(100);
    }
    return false;
  };
  let opened = await tryTap(mobile ? page.locator('[data-mobile-action="Menu"]') : page.getByRole('button', { name: '설정 · 메뉴', exact: true }));
  if (!opened) opened = await tryTap(page.locator('.rc108-settings-trigger'));
  assert(opened, 'Settings did not open through visible native controls');
  await page.locator('.rc61-settings').waitFor({ state: 'visible' });
}
async function advanceNarrative(page) {
  const deadline=Date.now()+45000;
  let settled=0;
  while(Date.now()<deadline){
    const story=page.locator('#hapil-story-rc51:visible');
    if(await story.count()){
      settled=0;
      const next=story.getByRole('button',{name:/계속/});
      if(await next.isVisible().catch(()=>false))await next.click();
      else await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
    }else{
      if(++settled>=2)break;
      await page.waitForTimeout(150);
    }
  }
  assert.equal(await page.locator('#hapil-story-rc51:visible').count(),0,'native Story dialogue must finish before Settings');
  await page.waitForFunction(() => window.__HAPIL_CONTROLS_V31329__?.binding?.phase === 'game');
}
async function startRun(page, dream) {
  const previous = await page.evaluateHandle(() => window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current ?? null);
  await page.locator('.title-screen').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: '새 게임 시작', exact: true }).click();
  await page.locator('.select-screen').waitFor({ state: 'visible' });
  if (dream) {
    const option = page.locator('[data-game-mode-v31354="DREAM"]');
    assert.equal(await option.isDisabled(), false, 'normal 777 flow should unlock Dream mode');
    await option.click();
  } else {
    const option = page.locator('[data-game-mode-v31354="STORY"]');
    if (await option.count()) await option.click();
  }
  await page.getByRole('button', { name: '이 편성으로 접속', exact: true }).click();
  await page.locator('.select-screen').waitFor({ state: 'hidden' });
  await page.waitForFunction(prior => {
    const binding = window.__HAPIL_CONTROLS_V31329__?.binding, current = binding?.state?.current;
    return current && current !== prior && binding.phase === 'game' && window.__MONGSE_QA_STATE__ === current;
  }, previous, { timeout: 45000 });
  await advanceNarrative(page);
  await previous.dispose();
}
async function apply777(page) {
  const form = page.locator('form.developer-code-form-v31576');
  await form.locator('input[aria-label="개발자 코드"]').fill('777');
  await form.getByRole('button', { name: '코드 적용', exact: true }).click();
  const status = form.locator('[role="status"]');
  await page.waitForFunction(() => document.querySelector('form.developer-code-form-v31576 [role="status"]')?.textContent.includes('해금'));
  return status.textContent();
}
async function readNative(page) {
  return page.evaluate(() => {
    const s = window.__MONGSE_QA_STATE__, m = s?.innerFinalRC133;
    const H = window.__HAPIL_INNER_FINAL_RC133__;
    return {
      zone: s?.zone ?? null,
      mode: window.__HAPIL_MODES_V31346__?.mode(s) ?? null,
      phase: m?.phase ?? null, entry: m?.entry ?? null, cycle: m?.cycle ?? null,
      playerHp: s?.hp ?? null, bossHp: s?.enemies?.find(a => a.id === 'inner-evil-rc133')?.hp ?? null,
      bossDefeated: s?.bossDefeated === true,
      metrics: H?.metrics?.() ?? null,
      projectiles: (s?.hostileProjectiles ?? []).filter(q => q?.rc133InnerShot === true).map(q => ({
        key: q.rc133Skill, path: q.sprite, cycle: q.rc133Cycle, shotIndex: q.rc133ShotIndex,
        x: q.x, y: q.y, vx: q.vx, vy: q.vy, radius: q.radius, born: q.born ?? q.createdAt ?? null,
      })),
    };
  });
}

async function main() {
  report.publicUrl=publicUrl; report.profile=mobile?'mobile-portrait-with-five-rotations':'desktop';
  let browser;
  const seenPackets = new Set(), capturedSkills = new Set(), responseKeys = new Set();
  try {
    browser = await chromium.launch({ executablePath: process.env.HAPIL_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const context = await browser.newContext(mobile?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1180,height:757},deviceScaleFactor:1});
    const page = await context.newPage();
    await page.addInitScript({ content: canvasObserver });
    page.on('pageerror', error => { report.pageErrors ??= []; report.pageErrors.push(error.stack || error.message); save(); });
    page.on('response', response => { if(response.status()>=400){report.httpErrors??=[];report.httpErrors.push({url:response.url(),status:response.status()});} });
    page.on('response', response => {
      let url;
      try { url = new URL(response.url()); } catch { return; }
      const match = url.pathname.match(/\/assets\/rc134\/persona-skills\/([^/]+)\.png$/);
      if (!match) return;
      const key = match[1];
      if (responseKeys.has(key)) return;
      responseKeys.add(key);
      report.resources.push({ key, path: url.pathname, status: response.status() });
      save();
    });

    await page.goto(publicUrl+'?qa=1&rc136-public='+Date.now(), {waitUntil:'domcontentloaded'});
    await page.keyboard.press('Escape');
    await startRun(page, false);
    await openSettings(page);
    report.storyCode = await apply777(page);
    page.once('dialog', dialog => dialog.accept());
    await page.locator('.rc61-settings').getByRole('button', { name: '자동 저장 후 시작 화면으로', exact: true }).click();
    await page.locator('.title-screen').waitFor({ state: 'visible' });

    await startRun(page, true);
    await openSettings(page);
    report.dreamCode = await apply777(page);
    const mapDetails = page.locator('.rc61-settings details').filter({ has: page.getByText('방문한 맵 다시 가기', { exact: true }) });
    await mapDetails.locator('summary').click();
    const hiddenArena = page.locator('[data-rc133-map="inner-evil-rc133"]');
    await hiddenArena.waitFor({ state: 'visible' });
    assert.equal(await hiddenArena.count(), 1, 'native Settings exposes one hidden-arena selector');
    assert.equal(await hiddenArena.isDisabled(), false, 'Dream plus entered 777 grants the UI selector');
    await hiddenArena.click();
    await page.waitForFunction(() => {
      const s = window.__MONGSE_QA_STATE__, H = window.__HAPIL_INNER_FINAL_RC133__;
      return s?.zone === 'cult04' && H?.active(s) && H?.boss(s)?.id === 'inner-evil-rc133' && s.innerFinalRC133?.entry === 'developer-777';
    }, null, { timeout: 20000 });
    report.entry = await readNative(page);
    report.functional = {boundaries:[],transactions:[],moods:[]};
    report.contrast = await helpers.contrast(page);
    if(mobile) report.rotations = await helpers.rotate(page,context,output);
    const admittedSeen=new Set();
    await page.screenshot({ path: path.join(output, 'hidden-arena-entry.png'), fullPage: false });
    save();

    const deadline = Date.now() + Number(process.env.HAPIL_NATIVE_NINE_TIMEOUT_MS || 100000);
    const packetSets = new Set();
    while (Date.now() < deadline) {
      const current = await readNative(page);
      await helpers.observe(page,report.functional,admittedSeen);
      report.observations.push({ at: new Date().toISOString(), zone: current.zone, mode: current.mode, phase: current.phase,
        cycle: current.cycle, playerHp: current.playerHp, bossHp: current.bossHp, metrics: current.metrics });
      for (const packet of current.projectiles) {
        const id = `${packet.cycle}:${packet.shotIndex}`;
        if (!seenPackets.has(id)) {
          seenPackets.add(id);
          report.emissions.push({ ...packet, observedAt: new Date().toISOString() });
          packetSets.add(packet.key);
        }
      }
      const waitingForCanvas = keys.filter(key => !capturedSkills.has(key));
      const nativeSnapshots = await page.evaluate(todo => {
        const a = window.__PERSONA_NATIVE_NINE_AUDIT__;
        return Object.fromEntries(todo.map(key => [key, a?.snapshots?.[key] ?? null]));
      }, waitingForCanvas);
      for (const key of waitingForCanvas) {
        const frame = nativeSnapshots[key];
        if (!frame?.dataUrl?.startsWith('data:image/png;base64,')) continue;
        capturedSkills.add(key);
        const canvasFile = path.join(output, `skill-${key}-native-render-frame.png`);
        fs.writeFileSync(canvasFile, Buffer.from(frame.dataUrl.slice('data:image/png;base64,'.length), 'base64'));
        const pageFile = path.join(output, `skill-${key}-full-page-followup.png`);
        await page.screenshot({ path: pageFile, fullPage: true });
        const { dataUrl, ...frameEvidence } = frame;
        const capture = { ...frameEvidence, nativeCanvasPng: canvasFile, fullPageScreenshot: pageFile,
          fullPageScreenshotTiming: 'captured immediately after the exact render-frame canvas snapshot; nativeCanvasPng is the exact frame evidence' };
        report.captures.push(capture);
        report.draws.push({ key, source: frame.source, geometry: frame.geometry, frameId: frame.frameId, packets: frame.packets });
        report.screenshots.push({ key, path: canvasFile, kind: 'exact native renderFrame canvas snapshot', source: frame.source });
        report.screenshots.push({ key, path: pageFile, kind: 'full-page follow-up screenshot', source: frame.source });
        await page.evaluate(skill => {
          const snapshot = window.__PERSONA_NATIVE_NINE_AUDIT__?.snapshots?.[skill];
          if (snapshot) snapshot.dataUrl = null;
        }, key);
      }
      const auditErrors = await page.evaluate(() => window.__PERSONA_NATIVE_NINE_AUDIT__?.errors?.slice(-10) ?? []);
      if (auditErrors.length) report.instrumentationErrors = auditErrors;
      report.lastNative = current;
      save();
      if (keys.every(key => packetSets.has(key) && capturedSkills.has(key))) break;
      if (current.phase === 'complete' || current.bossDefeated) { report.stoppedEarly = 'encounter completed naturally before all nine images were observed'; break; }
      await sleep(100);
    }
    report.status = keys.every(key => packetSets.has(key) && capturedSkills.has(key)) ? 'all-nine-native-emissions-and-exact-render-frames-captured' : 'bounded-observation-incomplete';
    report.missingEmissions = keys.filter(key => !report.emissions.some(event => event.key === key));
    report.missingDraws = keys.filter(key => !capturedSkills.has(key));
    report.finalNative = await readNative(page);
    report.boundaryMovement = await helpers.move(page,report.functional,admittedSeen);
    await openSettings(page);
    await page.locator('.rc61-settings').getByRole('radio',{name:'완전자동',exact:true}).check();
    await page.getByRole('dialog',{name:'설정',exact:true}).getByRole('button',{name:'닫기 ×',exact:true}).click();
    await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__.effective()==='full');
    const fullStart=report.functional.transactions.length;
    for(let i=0;i<40;i++){
      await page.waitForTimeout(250);
      if(!await page.evaluate(()=>window.__HAPIL_PERSONA_DUEL_RC134__.active(window.__MONGSE_QA_STATE__)))break;
      await helpers.observe(page,report.functional,admittedSeen);
    }
    const fullEvents=report.functional.transactions.slice(fullStart).filter(e=>e.controlMode==='full');
    report.publicFullMode={scope:'Normal Settings full-auto radio selection then ten-second actual native transaction observation; no HP, enemy, projectile, timer or damage edits',outgoing:fullEvents.filter(e=>e.finalDamage.direction==='outgoing').length,incoming:fullEvents.filter(e=>e.finalDamage.direction==='incoming').length,factors:[...new Set(fullEvents.map(e=>e.finalDamage.factor))]};
    assert(report.publicFullMode.outgoing>0,'published full mode emits actual admitted outgoing transactions');
    report.functional.summary = helpers.validate(report.functional);
    assert.equal(report.status,'all-nine-native-emissions-and-exact-render-frames-captured');
    assert.deepEqual(report.pageErrors??[],[]);
    assert.deepEqual(report.httpErrors??[],[]);
    assert.deepEqual(report.instrumentationErrors??[],[]);
    await page.screenshot({ path: path.join(output, 'hidden-arena-final-observation.png'), fullPage: false });
    await context.close();
  } catch (error) {
    report.status = 'error';
    report.error = error.stack || String(error);
    try { const p=browser?.contexts()[0]?.pages()[0]; if(p){await p.screenshot({path:path.join(output,'failure.png')});report.failureNative=await readNative(p);} } catch (_) {}
    throw error;
  } finally {
    save();
    if (browser) await browser.close().catch(() => {});
    server.close();
  }
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
