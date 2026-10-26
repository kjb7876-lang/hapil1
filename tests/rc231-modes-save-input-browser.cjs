'use strict';

// Native lifecycle regression. Only title startup is natural progression.
// Later map/HP/entitlement/clear fixtures are explicitly identified in results.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '/tmp/pw155/node_modules', 'playwright'));

const root = path.resolve(process.env.HAPIL_APP_ROOT || path.join(__dirname, '..'));
const profile = process.env.RC231_PROFILE || 'pc';
assert(['pc', 'landscape', 'portrait'].includes(profile));
const mobile = profile !== 'pc';
const viewport = mobile ? { width: 844, height: 390 } : { width: 1280, height: 800 };
const out = path.resolve(process.env.HAPIL_QA_OUTPUT || '/tmp/rc231-modes-save-input/' + profile);
fs.mkdirSync(out, { recursive: true });
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const appSha = cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const dirty = !!cp.execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim();
const originalBundle = fs.readFileSync(path.join(root, 'assets/index-v31526.js'));
// This localhost-only bridge exposes existing native functions unchanged. It
// does not replace attacks, reducers, frame scheduling, save/load or entry code.
const bridge = Buffer.from('\n;window.__RC231_QA__=Object.freeze({writeSave:(...a)=>MONGSE_writeSave(...a),incoming:(...a)=>Y(...a)});\n');
const report = {
  schema: 1, status: 'running', appSha, dirty, profile, startedAt: new Date().toISOString(),
  environment: { channel: 'chrome', chromiumSandbox: true, headless: true, physicalDevice: false,
    mobile: mobile ? 'Chrome emulated landscape touchscreen; portrait pause checked separately when requested' : false,
    hardwareGpu: 'unverified; inspect renderer below; headless timing is not physical-device FPS' },
  scope: 'Natural title/hero startup only. Staged native ordinary/manual, midboss/semi and boss/full repeated RAF attacks with actual release/recovery gates and controlled native damage reducers. Representative Story/Dream save round trips, Samong revival, EGO reverse-route ledger, developer-777 hidden entry, checkpoint lethal input and actual rendered revival click. This is not a natural campaign, unassisted Persona victory, or a physical-device test.',
  source: { bundleSha256: sha256(originalBundle), bridgeSha256: sha256(bridge),
    servedBundleSha256: sha256(Buffer.concat([originalBundle, bridge])), loadedJavaScript: [] },
  checks: [], screenshots: [], errors: [], httpErrors: [], requestFailures: []
};
const persist = () => fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2) + '\n');
const check = (name, evidence) => { report.checks.push({ name, status: 'passed', evidence }); persist(); };
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const loadedScripts = new Set();
const server = http.createServer((req, res) => {
  let file;
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  } catch { return res.writeHead(400).end(); }
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    const bytes = fs.readFileSync(file), relative = path.relative(root, file);
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    if (path.extname(file) === '.js' && !loadedScripts.has(relative)) {
      loadedScripts.add(relative);
      report.source.loadedJavaScript.push({ file: relative, bytes: bytes.length, sha256: sha256(bytes) });
    }
    res.end(relative === 'assets/index-v31526.js' ? Buffer.concat([bytes, bridge]) : bytes);
  } catch { res.writeHead(404).end(); }
});
let browser, context, page, stage = 'source-contract', explicitReload = false;

async function capture(name) {
  const file = profile + '-' + name + '.png';
  const bytes = await page.screenshot({ path: path.join(out, file), timeout: 20000 });
  report.screenshots.push({ file, bytes: bytes.length, sha256: sha256(bytes), appSha,
    profile, at: new Date().toISOString(), staged: name !== 'natural-start' });
  persist();
}
async function ready() {
  await page.waitForFunction(() => window.__HAPIL_RC133_NATIVE__?.installed &&
    window.__HAPIL_NATIVE_ARENA_RC138__?.installed && window.__HAPIL_SAMONG_RC91__?.installed &&
    window.__HAPIL_EGO_GUARDIAN_RC155__?.version === 1 &&
    window.__HAPIL_COMBAT_LIFECYCLE_RC231__?.version === 'RC231' && window.__RC231_QA__, null, { timeout: 60000 });
}
async function dismissStory() {
  for (let i = 0; i < 25 && await page.locator('#hapil-story-rc51').count(); i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(80);
    const skip = page.getByRole('button', { name: '음성 건너뛰고 계속', exact: true });
    if (await skip.isVisible()) await skip.click();
  }
  await page.evaluate(() => { window.__HAPIL_PARTY_LAUNCH_V31322__?.dismissGuestUI?.(); });
}
async function fixture(zone = 'dist01', mode = 'STORY') {
  const entry = await page.evaluate(({ zone, mode }) => {
    const N = window.__HAPIL_RC133_NATIVE__, C = window.__HAPIL_CONTROLS_V31329__, P = window.__HAPIL_PARTY_V31322__;
    // Live fixtures retain the object used by the native RAF and party owner.
    // Standalone makeState objects are reserved for isolated save round trips.
    const s = P.state ?? C.binding.state.current;
    if (!s || C.binding.phase !== 'game') throw Error('native live fixture requires an active game world');
    const identityBefore = { partyIsControl: P.state === C.binding.state.current, qaIsControl: window.__MONGSE_QA_STATE__ === C.binding.state.current };
    C.clear(); window.__HAPIL_STORY_RC51__?.close?.(false);
    window.__HAPIL_PERSONA_DUEL_RC134__?.release?.(s);
    window.__HAPIL_BATTLE_ARENA_RC138__?.release?.(s);
    // Reset fixture fields while keeping the actual native world's identity.
    // The native guard owners are released above before x/y are replaced.
    for (const key of Object.keys(s)) delete s[key];
    Object.assign(s, N.makeState(), { zone, frontierZone: zone, time: 100, activeHeroId: 'hwando',
      gameModeV31346: mode, samongUnlockedRC91: mode === 'DREAM', hp: 240, maxHp: 240 });
    C.binding.state.current = s; C.binding.hero.current = 'hwando';
    window.__RC231_LIVE_FIXTURE_REF__ = s;
    window.__HAPIL_STORY_RC51__?.suppressEntry?.(s);
    N.enter(s, zone);
    window.__HAPIL_STORY_RC51__?.close?.(false);
    window.__HAPIL_STORY_RC51__?.beforeFrame?.(s, { blocked: false, clear: false, sound: false });
    window.__HAPIL_STORY_RC51__?.close?.(false);
    C.binding.actions.dismiss(); C.binding.modal.current = null;
    Object.assign(s, { paused: false, pause: false, encounterDialogue31226: null,
      encounterLockUntil31226: 0, timeStopUntil: 0, invulnerableUntil: s.time + 60 });
    C.setMode('manual');
    P.capture(s, { damage: C.binding.actions.damage, heroRef: C.binding.hero, cache: C.binding.cache.current }, false);
    return { staged: true, zone: s.zone, mode: s.gameModeV31346, hp: s.hp, time: s.time,
      identityBefore, identityAfter: { partyIsControl: P.state === C.binding.state.current, fixtureIsControl: s === C.binding.state.current },
      nativeRoster: s.enemies.map(a => ({ id: a.id, hp: a.hp, maxHp: a.maxHp, midboss: !!a.midboss, boss: !!a.boss })) };
  }, { zone, mode });
  await page.waitForFunction(({ zone, time }) => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current;
    return s.zone === zone && s.time > time && s === window.__HAPIL_PARTY_V31322__.state &&
      s === window.__MONGSE_QA_STATE__ && s === window.__RC231_LIVE_FIXTURE_REF__;
  }, { zone: entry.zone, time: entry.time }, { timeout: 10000 });
  return entry;
}
async function keyboardMovement() {
  const before = await page.evaluate(() => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current;
    // Keep the actual live native roster and wave fields. Emptying every enemy
    // while marking all waves spawned opens the post-story and pauses RAF.
    if (!(s.enemies ?? []).some(a => a.hp > 0 && !a.visualOnly)) throw Error('native input fixture requires living authored enemies');
    Object.assign(s, { x: 13.8, y: 24.2, moveVx: 0, moveVy: 0, target: null, path: [] });
    window.__HAPIL_BATTLE_ARENA_RC138__.enforce(s);
    window.__RC231_TRUSTED_KEYS__ = [];
    document.addEventListener('keydown', e => {
      if (e.code === 'ArrowRight') window.__RC231_TRUSTED_KEYS__.push({ code: e.code, trusted: e.isTrusted });
    }, true);
    return { x: s.x, y: s.y, time: s.time, livingActors: s.enemies.filter(a => a.hp > 0).length,
      waves: [...s.spawnedWaves], partyIsControl: window.__HAPIL_PARTY_V31322__.state === s,
      qaIsControl: window.__MONGSE_QA_STATE__ === s, fixtureIsControl: window.__RC231_LIVE_FIXTURE_REF__ === s };
  });
  await page.keyboard.down('ArrowRight');
  try { await page.waitForTimeout(450); } finally { await page.keyboard.up('ArrowRight'); }
  const after = await page.evaluate(() => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current;
    return { x: s.x, y: s.y, time: s.time, keys: [...C.binding.input.current],
      held: C.inputSnapshot().held, trusted: window.__RC231_TRUSTED_KEYS__,
      partyIsControl: window.__HAPIL_PARTY_V31322__.state === s,
      qaIsControl: window.__MONGSE_QA_STATE__ === s, fixtureIsControl: window.__RC231_LIVE_FIXTURE_REF__ === s,
      story: window.__HAPIL_STORY_RC51__?.currentNarrative?.(), readingBlocked: window.__HAPIL_READING_V31342__?.blocked,
      modal: C.binding.modal.current, blocked: C.binding.blocked?.(), partyPaused: window.__HAPIL_PARTY_V31322__.status?.paused };
  });
  console.log('RC231_INPUT_CLOCK', JSON.stringify({ profile, before, after }));
  assert(after.partyIsControl && after.qaIsControl && after.fixtureIsControl, 'keyboard acts on the native party, control and RAF world');
  assert(after.time > before.time, 'native RAF simulation advances during keyboard input');
  assert(Math.hypot(after.x - before.x, after.y - before.y) > .1, 'trusted keyboard moves native host');
  assert(after.trusted.some(row => row.trusted), 'browser-delivered keyboard event is trusted');
  assert(!after.keys.includes('ArrowRight') && !after.held.some(row => row.code === 'ArrowRight'), 'keyup clears physical and logical movement');
  return { staged: true, before, after };
}
async function touchMovement() {
  const before = await page.evaluate(() => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current;
    C.clear(); Object.assign(s, { x: 13.8, y: 24.2, moveVx: 0, moveVy: 0, target: null, path: [] });
    window.__RC231_TRUSTED_TOUCH__ = [];
    window.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') window.__RC231_TRUSTED_TOUCH__.push({ trusted: e.isTrusted }); }, true);
    return { x: s.x, y: s.y, metrics: window.__HAPIL_MOBILE_V31366__.metrics() };
  });
  const stick = page.locator('#hapil-mobile-controls-v31366 [data-mobile-stick]');
  await stick.waitFor({ state: 'visible' });
  const box = await stick.boundingBox(); assert(box, 'visible native mobile stick');
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  const session = await context.newCDPSession(page);
  try {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - box.width * .38, y, id: 1 }] });
    await page.waitForTimeout(650);
  } finally {
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  }
  const after = await page.evaluate(() => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current, M = window.__HAPIL_MOBILE_V31366__;
    return { x: s.x, y: s.y, metrics: M.metrics(), pointers: M.snapshot().pointers,
      keys: [...C.binding.input.current], trusted: window.__RC231_TRUSTED_TOUCH__ };
  });
  assert(Math.hypot(after.x - before.x, after.y - before.y) > .1, 'trusted emulated touch moves native host');
  assert(after.metrics.downs > before.metrics.downs && after.metrics.ups > before.metrics.ups);
  assert(after.trusted.some(row => row.trusted));
  assert.equal(after.pointers.length, 0); assert(!after.keys.includes('ArrowLeft'));
  return { staged: true, physicalDevice: false, method: 'Chrome CDP touchscreen to real native pointer handlers', before, after };
}

async function liveLifecycle(role, mode) {
  const zone = role === 'ordinary' ? 'dist02' : 'ep1b03';
  await fixture(zone, 'STORY');
  const setup = await page.evaluate(({ role, mode }) => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current, B = window.__HAPIL_RC86_BRIDGE__;
    const id = role === 'ordinary' ? 'dist02-m1' : role === 'midboss' ? 'mb-ep1b03' : 'b03-boss';
    const template = B.actor(s.zone, id); if (!template) throw Error('missing native live template ' + id);
    const a = B.cloneEnemy(template, s.zone);
    s.enemies = [a]; s.spawnedWaves = new Set([1, 2, 3, 4]); s.bossDefeated = false;
    for (const key of ['hostileProjectiles', 'pendingHits', 'impactQueue', 'pendingStrikes', 'pendingSpawns', 'effects']) s[key] = [];
    // Ready timers are staged ONCE. Neither repeated attacks nor recovery
    // completion are advanced/reset by the test after this point.
    for (const key of ['attackAt', 'attackImpactAt', 'readyAt', 'patternReadyAt', 'recoverUntil', 'atomicCastUntil31210', 'staggerUntil', 'phaseTransitionUntil', 'combatEntryGraceUntilV31239', 'invulnerableUntil']) a[key] = 0;
    s.invulnerableUntil = s.time + 120;
    window.__HAPIL_COMBAT_FLOW_RC95__.reset(s);
    window.__HAPIL_COMBAT_LIFECYCLE_RC231__.reset(s);
    C.setMode(mode);
    return { role, requestedMode: mode, zone: s.zone, actor: { id: a.id, kind: a.kind, hp: a.hp, maxHp: a.maxHp },
      time: s.time, metrics: window.__HAPIL_COMBAT_LIFECYCLE_RC231__.metrics(),
      staged: true, support: 'one original-full-HP native template, initial ready timers and native player invulnerability; native RAF owns every later cast, warning, release and recovery' };
  }, { role, mode });
  assert.equal(setup.actor.hp, setup.actor.maxHp, 'live native template starts at original full HP');
  await page.waitForFunction(mode => window.__HAPIL_CONTROLS_V31329__.effective() === mode, mode);
  const trace = await page.evaluate(({ role, actorId, start }) => new Promise((resolve, reject) => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current, L = window.__HAPIL_COMBAT_LIFECYCLE_RC231__;
    const a = s.enemies.find(a => a.id === actorId), deadline = performance.now() + 25000;
    const rows = [], packets = new Map(); let earlyRepeat = null, samples = 0;
    function sample() {
      samples++;
      if (!s.enemies.includes(a) || a.hp <= 0) return reject(Error('native lifecycle actor died before repeated casts ' + actorId));
      const r = L.inspect(s, a);
      for (const key of L.queues) for (const q of s[key] ?? []) {
        if (L.owner(s, q) !== a) continue;
        if (key === 'hostileProjectiles' && L.eligible(s, a, q, key)) {
          const release = L.release(q);
          if (![release, q.collisionDisabledUntil31219, q.collisionDisabledUntilV31226].every(Number.isFinite) || q.collisionDisabledUntil31219 < release || q.collisionDisabledUntilV31226 < release) return reject(Error('native projectile contact precedes final release ' + actorId + '/' + q.id));
        }
        if (packets.size < 64) packets.set(key + ':' + q.id, { key, id: q.id, sourceId: q.sourceId, born: q.born, at: q.at ?? null, release: L.release(q), damage: q.damage ?? null });
      }
      if (r) {
        if (![r.announcedAt, r.releaseAt, r.until].every(Number.isFinite) || r.until < r.releaseAt || r.until > s.time + 30) return reject(Error('nonfinite/unbounded native recovery ' + JSON.stringify(r)));
        if (!rows.length || r.announcedAt > rows.at(-1).announcedAt + .1) rows.push({ ...r, observedAt: s.time, patternIndex: a.patternIndex ?? null, bulletCycle: a.rc95BulletCycle ?? 0, basicAttackAt: a.attackStarted ?? null });
        if (role !== 'ordinary' && !earlyRepeat && !L.ready(s, a)) {
          const N = window.__HAPIL_RC95_NATIVE__, phase = N.phase(a), card = N.patterns(a, phase).find(card => !window.__HAPIL_COMBAT_FLOW_RC95__.laser(card));
          if (!card) return reject(Error('native ranked actor lacks a non-laser card ' + actorId));
          const before = { serial: s.fxSerial, deferred: L.metrics().deferred };
          window.__HAPIL_COMBAT_FLOW_RC95__.run(s, () => N.cast(s, a, card, phase));
          earlyRepeat = { before, after: { serial: s.fxSerial, deferred: L.metrics().deferred }, clock: s.time, recovery: L.inspect(s, a) };
          if (earlyRepeat.after.serial !== before.serial || earlyRepeat.after.deferred <= before.deferred) return reject(Error('same-owner early native cast was not cleanly deferred ' + JSON.stringify(earlyRepeat)));
        }
      }
      if (rows.length >= 2 && packets.size > 0 && s.time > start + 1) return resolve({ rows: rows.slice(0, 8), packets: [...packets.values()], samples, endTime: s.time,
        actorHp: a.hp, mode: C.effective(), earlyRepeat, metrics: L.metrics(),
        nativeCycles: { patternIndex: a.patternIndex ?? null, bulletCycle: a.rc95BulletCycle ?? 0, basicAttackAt: a.attackStarted ?? null },
        playerBasicAttacks: s.basicAttackCount ?? 0 });
      if (performance.now() > deadline) return reject(Error('native cast/recovery stalled ' + JSON.stringify({ actorId, role, time: s.time, start, rows, packets: [...packets.values()], lifecycle: r,
        ready: L.ready(s, a), timers: { recoverUntil: a.recoverUntil, attackAt: a.attackAt, atomicCastUntil: a.atomicCastUntil31210 }, mode: C.effective(), metrics: L.metrics() })));
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }), { role, actorId: setup.actor.id, start: setup.time });
  assert.equal(trace.mode, mode);
  assert(trace.rows.length >= 2 && trace.rows[1].announcedAt > trace.rows[0].announcedAt, 'native actor completes recovery and announces another attack');
  assert(trace.endTime > setup.time && trace.packets.length > 0);
  if (role === 'ordinary') assert(trace.metrics.ordinary > setup.metrics.ordinary, 'ordinary native basic cast enters shared lifecycle');
  else {
    assert(trace.metrics.committed > setup.metrics.committed, 'native ranked attack commits actual packets');
    assert(trace.earlyRepeat, 'ranked admission rejects an actual early same-owner cast');
  }
  // Isolate reducer accounting only after actual repeated casts. These direct
  // native reducer calls do not claim a physical hit/contact or an auto victory.
  await page.evaluate(() => window.__HAPIL_CONTROLS_V31329__.setMode('manual'));
  await page.waitForFunction(() => window.__HAPIL_CONTROLS_V31329__.effective() === 'manual');
  const damage = await page.evaluate(actorId => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current, a = s.enemies.find(a => a.id === actorId), core = window.__HAPIL_COMBAT_CORE_V31401__;
    if (!a) throw Error('live actor missing before native reducer check');
    const before = { playerHp: s.hp, actorHp: a.hp, sequence: Math.max(0, ...core.snapshot(s).events.map(e => e.sequence)) };
    a.invulnerableUntil = 0;
    C.binding.actions.damage(a, 1, '#ffffff', false, 0, { heroId: s.activeHeroId, heroAttackId: 'rc231-native-reducer', id: s.fxSerial++, born: s.time, actionKey: 'A' });
    const supportUntil = s.invulnerableUntil; s.invulnerableUntil = 0; s.awakeningUntil = 0;
    const accepted = window.__RC231_QA__.incoming(s, 2, s.x, s.y, false); s.invulnerableUntil = supportUntil;
    return { before, after: { playerHp: s.hp, actorHp: a.hp }, accepted,
      events: core.snapshot(s).events.filter(e => e.sequence > before.sequence),
      scope: 'controlled calls to actual native outgoing and incoming reducers after repeated live casts; not a visual-contact assertion' };
  }, setup.actor.id);
  assert(damage.after.actorHp < damage.before.actorHp, 'actual native outgoing reducer lowers actor HP');
  assert(damage.accepted && damage.after.playerHp < damage.before.playerHp, 'actual native incoming reducer lowers player HP');
  assert(damage.events.some(e => e.kind === 'OUTGOING' && e.hpLoss > 0));
  return { setup, trace, damage };
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    if (process.env.EXPECTED_SHA) { assert.equal(appSha, process.env.EXPECTED_SHA); assert.equal(dirty, false, 'exact clean checkout required in CI'); }
    stage = 'official-chrome-launch';
    browser = await chromium.launch({ chromiumSandbox: true, channel: 'chrome', headless: true, args: [] });
    report.environment.browserVersion = browser.version();
    context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    page = await context.newPage(); page.setDefaultTimeout(30000);
    page.on('pageerror', e => report.errors.push(e.stack || e.message));
    page.on('response', r => { if (r.status() >= 400) report.httpErrors.push({ url: r.url(), status: r.status() }); });
    page.on('requestfailed', r => {
      const failure = r.failure()?.errorText;
      // A scene/reload can cancel existing audio. Missing assets/HTTP errors
      // remain independent failures, and every canceled request is reported.
      const audioCancellation = failure === 'net::ERR_ABORTED' && ['media', 'fetch'].includes(r.resourceType()) && /\.(mp3|wav)(?:\?|$)/i.test(r.url());
      const reloadCancellation = explicitReload && failure === 'net::ERR_ABORTED';
      const expected = audioCancellation || reloadCancellation;
      report.requestFailures.push({ url: r.url(), resourceType: r.resourceType(), failure, expected,
        reason: reloadCancellation ? 'explicit page reload canceled a request from the prior document' : audioCancellation ? 'scene transition canceled an audio request' : null });
    });
    const base = 'http://127.0.0.1:' + server.address().port;
    stage = 'natural-title-and-hero-start';
    await page.goto(base + '/?qa=1', { waitUntil: 'domcontentloaded' }); await ready();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '새 게임 시작', exact: true }).click();
    await page.getByRole('button', { name: '이 편성으로 접속', exact: true }).click();
    await page.waitForFunction(() => window.__HAPIL_CONTROLS_V31329__?.binding?.phase === 'game');
    await dismissStory();
    report.naturalStart = await page.evaluate(() => {
      const s = window.__HAPIL_CONTROLS_V31329__.binding.state.current;
      return { zone: s.zone, hp: s.hp, mode: s.gameModeV31346, developer777: !!s.developerMapsRC133,
        samong: window.__HAPIL_SAMONG_RC91__.enabled(s), storyOpen: window.__HAPIL_STORY_RC51__.isOpen() };
    });
    assert.equal(report.naturalStart.zone, 'dist00'); assert(report.naturalStart.hp > 0);
    assert.equal(report.naturalStart.mode, 'STORY'); assert.equal(report.naturalStart.developer777, false);
    assert.equal(report.naturalStart.storyOpen, false);
    check('natural title and default Story launch', report.naturalStart); await capture('natural-start');

    report.inventory = await page.evaluate(() => {
      const B = window.__HAPIL_RC86_BRIDGE__;
      return { route: window.__HAPIL_STORY_DATA_RC51__.records.map(r => ({ zone: r.zone, rest: !!r.rest,
        actors: B.zoneActors(r.zone).map(a => ({ id: a.id, name: a.name, boss: !!a.boss, midboss: !!a.midboss, kind: a.kind })) })),
        classOwners: window.__HAPIL_ENEMY_CLASS_DATA_RC137__?.owners ?? null,
        hiddenId: window.__HAPIL_INNER_FINAL_RC133__.id,
        blueExecutor: B.actor('murder03', 'blue-executor')?.id ?? null };
    });
    assert.equal(report.inventory.route.length, 61);
    assert.equal(report.inventory.route.filter(row => row.rest).length, 6);
    assert.equal(report.inventory.route.filter(row => !row.rest).length, 55);
    assert.equal(report.inventory.hiddenId, 'inner-evil-rc133');
    assert.equal(report.inventory.blueExecutor, 'blue-executor');
    assert(report.inventory.classOwners && Object.keys(report.inventory.classOwners).length === 72, 'all named native class identities are initialized');
    check('fully initialized authored route and named identity inventory', { routes: 61, combat: 55, rest: 6, namedIdentities: 72, hiddenId: report.inventory.hiddenId });
    stage = 'manual-input-and-release'; await fixture();
    report.keyboard = await keyboardMovement(); check('trusted keyboard movement and release', report.keyboard);
    if (mobile) { report.touch = await touchMovement(); check('trusted emulated touchscreen movement and release', report.touch); }
    await capture('native-input');
    stage = 'manual-semi-full-mode-switch';
    report.controlModes = [];
    for (const mode of ['manual', 'semi', 'full', 'manual']) {
      await page.evaluate(mode => window.__HAPIL_CONTROLS_V31329__.setMode(mode), mode);
      await page.waitForFunction(mode => window.__HAPIL_CONTROLS_V31329__.effective() === mode, mode);
      const row = await page.evaluate(() => {
        const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current;
        return { mode: C.effective(), time: s.time, held: C.inputSnapshot().held, metrics: C.metrics() };
      });
      assert.equal(row.held.length, 0); report.controlModes.push(row);
    }
    check('manual, semi and full mode selection clears held input', report.controlModes);

    stage = 'native-live-ordinary-midboss-boss-lifecycle';
    report.liveCombat = [];
    for (const [role, mode] of [['ordinary', 'manual'], ['midboss', 'semi'], ['boss', 'full']]) {
      const evidence = await liveLifecycle(role, mode); report.liveCombat.push(evidence);
      check('live native ' + role + ' repeated casts, recovery and damage in ' + mode, evidence);
    }

    stage = 'representative-native-mode-save-roundtrips';
    report.modeSaves = await page.evaluate(() => {
      const N = window.__HAPIL_RC133_NATIVE__, B = window.__HAPIL_RC86_BRIDGE__, A = window.__HAPIL_SAMONG_RC91__, rows = [];
      const roundtrip = s => {
        const raw = B.serializeSave(s, s.activeHeroId, [], {}, 0), saved = B.normalizeSave(raw);
        if (!saved) throw Error('native save normalization refused ' + s.zone);
        const restored = N.makeState();
        Object.assign(restored, { zone: saved.zone, activeHeroId: saved.heroId, gameModeV31346: saved.gameModeV31346,
          hp: saved.hp, maxHp: s.maxHp, enemies: B.restoreEnemies(saved), clues: new Set(saved.clues),
          completedZones: new Set(saved.completedZones), spawnedWaves: new Set(saved.spawnedWaves),
          loopCycles: saved.loopCycles, bossDefeated: saved.bossDefeated });
        B.restoreEntry(restored, saved); B.restoreFinalBattle(restored, saved);
        for (const before of A.snapshot(s).enemies) {
          const after = restored.enemies.find(a => String(a.id) === before.id);
          if (!after || Math.abs(after.hp - before.hp) > 1e-6 || Math.abs(after.maxHp - before.maxHp) > 1e-6) throw Error('native actor save mismatch ' + s.zone + '/' + before.id);
        }
        const before = restored.enemies.map(a => ({ id: a.id, hp: a.hp, maxHp: a.maxHp }));
        for (let i = 0; i < 5; i++) A.scaleEnemies(restored);
        for (const prior of before) {
          const a = restored.enemies.find(a => a.id === prior.id);
          if (!a || Math.abs(a.hp - prior.hp) > 1e-6 || a.maxHp !== prior.maxHp) throw Error('mode multiplier stacked ' + s.zone + '/' + prior.id);
        }
        return { restoredZone: restored.zone, restoredMode: restored.gameModeV31346, actors: before,
          savedEnemyCount: saved.enemies.length, dreamLeaksStoryFinal: restored.gameModeV31346 === 'DREAM' && !!restored.hapilFinalBattleV31300 };
      };
      window.__RC231_ROUNDTRIP__ = roundtrip;
      for (const mode of ['STORY', 'DREAM']) for (const zone of ['dist01', 'ep1b03', 'cult04']) {
        const s = N.makeState(); Object.assign(s, { zone, frontierZone: zone, time: 100, activeHeroId: 'hwando',
          gameModeV31346: mode, samongUnlockedRC91: mode === 'DREAM', hp: 240, maxHp: 240 });
        N.enter(s, zone); B.modeApi.tick(s); A.scaleEnemies(s);
        if (!s.enemies.length) throw Error('empty native representative roster ' + zone);
        for (const a of s.enemies) {
          if (![a.x, a.y, a.hp, a.maxHp].every(Number.isFinite)) throw Error('nonfinite native actor ' + zone + '/' + a.id);
          if (a.hp > 0 && a.samongStatsRC91) a.hp = Math.max(1, a.hp - 3);
        }
        const row = { staged: true, mode, zone, ...roundtrip(s) };
        if (row.restoredMode !== mode || row.restoredZone !== zone || row.dreamLeaksStoryFinal) throw Error('mode/route save isolation ' + JSON.stringify(row));
        rows.push(row);
      }
      return rows;
    });
    assert.equal(report.modeSaves.length, 6); check('native Story and Dream save isolation and non-stacking scaling', report.modeSaves);

    stage = 'native-storage-write-and-rendered-continue'; await fixture('dist01', 'STORY');
    report.reload = { before: await page.evaluate(() => {
      const C = window.__HAPIL_CONTROLS_V31329__, B = window.__HAPIL_RC86_BRIDGE__, s = C.binding.state.current;
      C.binding.passives.current.damage = 2; C.binding.shards.current = 7;
      s.loopCycles.dist01 = 2; s.resonance = 37;
      const payload = B.serializeSave(s, s.activeHeroId, [], C.binding.passives.current, C.binding.shards.current);
      const result = window.__RC231_QA__.writeSave('auto', payload);
      return { staged: true, result, zone: payload.zone, hero: payload.heroId, shards: payload.shards,
        damage: payload.passives.damage, loop: payload.loopCycles.dist01, storageBytes: localStorage.getItem('mongse_save_v10_auto')?.length ?? 0 };
    }) };
    assert.equal(report.reload.before.result?.ok, true); assert(report.reload.before.storageBytes > 0);
    explicitReload = true;
    try { await page.reload({ waitUntil: 'domcontentloaded' }); await ready(); } finally { explicitReload = false; }
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '이어하기', exact: true }).click();
    await page.waitForFunction(() => window.__HAPIL_CONTROLS_V31329__?.binding?.phase === 'game' &&
      window.__HAPIL_CONTROLS_V31329__.binding.state.current.zone === 'dist01');
    await dismissStory();
    report.reload.after = await page.evaluate(() => {
      const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current;
      return { zone: s.zone, hero: s.activeHeroId, shards: C.binding.shards.current,
        damage: C.binding.passives.current.damage, loop: s.loopCycles.dist01, mode: s.gameModeV31346 };
    });
    for (const key of ['zone', 'hero', 'shards', 'damage', 'loop']) assert.equal(report.reload.after[key], report.reload.before[key], 'reload retains ' + key);
    assert.equal(report.reload.after.mode, 'STORY'); check('real page reload and rendered Continue preserve native save growth', report.reload);

    stage = 'native-checkpoint-dialog'; await fixture('cult01', 'DREAM'); await page.waitForTimeout(300);
    report.checkpoint = { before: await page.evaluate(() => {
      const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current;
      for (const a of s.enemies) { a.hp = Math.max(1, a.maxHp * .1); a.phase = 5; a.readyAt = s.time + 60; }
      s.hp = 1; s.invulnerableUntil = 0; s.awakeningUntil = 0;
      s.samongPassiveRC91 = { version: 1, active: 0, grace: 0, revivalCooldown: 77, encounterRC128: { used: true } };
      const growth = { damage: C.binding.passives.current.damage, shards: C.binding.shards.current };
      const accepted = window.__RC231_QA__.incoming(s, 999, s.x, s.y, false);
      return { staged: true, method: 'wounded native actors, hero HP1, consumed Samong revival; actual native incoming reducer', accepted, hp: s.hp, growth };
    }) };
    assert(report.checkpoint.before.hp <= 0, 'native lethal reaches checkpoint choice');
    await page.getByRole('dialog', { name: '부활 선택', exact: true }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: '체크포인트에서 부활', exact: true }).click();
    await page.waitForFunction(() => {
      const s = window.__HAPIL_CONTROLS_V31329__.binding.state.current;
      return s.hp > 0 && s.zone === 'cult01' && s.enemies.length > 0 && s.enemies.every(a => a.hp === a.maxHp);
    });
    report.checkpoint.after = await page.evaluate(() => {
      const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current;
      return { zone: s.zone, hp: s.hp, actors: s.enemies.map(a => ({ id: a.id, hp: a.hp, maxHp: a.maxHp, phase: a.phase ?? null })),
        growth: { damage: C.binding.passives.current.damage, shards: C.binding.shards.current },
        held: C.inputSnapshot().held, hostilePackets: s.hostileProjectiles.length };
    });
    assert.deepEqual(report.checkpoint.after.growth, report.checkpoint.before.growth);
    assert(report.checkpoint.after.actors.every(a => a.hp === a.maxHp && a.phase === null));
    assert.equal(report.checkpoint.after.held.length, 0); check('real checkpoint dialog restores native actors and retains growth', report.checkpoint);

    stage = 'samong-revival-save'; await fixture('dist01', 'DREAM');
    report.samong = await page.evaluate(() => {
      const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current, A = window.__HAPIL_SAMONG_RC91__, B = window.__HAPIL_RC86_BRIDGE__;
      // Explicitly staged lethal and entitlement. The actual native authorized
      // Samong revival owns the HP/active/cooldown writes being asserted.
      s.hp = 0; s.samongPassiveRC91 = { version: 1, active: 0, grace: 0, revivalCooldown: 0, egoCooldown: 0 };
      const accepted = A.chooseRevival(s, 'samong');
      const snapshot = A.snapshot(s), raw = B.serializeSave(s, s.activeHeroId, [], {}, 0), saved = B.normalizeSave(raw);
      const restored = window.__HAPIL_RC133_NATIVE__.makeState();
      Object.assign(restored, { zone: saved.zone, hp: saved.hp, maxHp: s.maxHp, activeHeroId: saved.heroId,
        gameModeV31346: saved.gameModeV31346, enemies: B.restoreEnemies(saved) }); B.restoreEntry(restored, saved);
      return { staged: true, accepted, hp: s.hp, maxHp: s.maxHp, active: A.active(s), snapshot,
        restored: A.snapshot(restored), restoredActive: A.active(restored) };
    });
    assert(report.samong.accepted && report.samong.active && report.samong.restoredActive);
    assert.equal(report.samong.hp, Math.ceil(report.samong.maxHp * .5));
    assert.equal(report.samong.restored.active, report.samong.snapshot.active);
    assert.equal(report.samong.restored.revivalCooldown, report.samong.snapshot.revivalCooldown);
    check('native authorized Samong revival survives save normalization and restore', report.samong); await capture('samong');

    stage = 'ego-reverse-entry-save';
    report.reverse = await page.evaluate(() => {
      const N = window.__HAPIL_RC133_NATIVE__, E = window.__HAPIL_EGO_GUARDIAN_RC155__, B = window.__HAPIL_RC86_BRIDGE__, C = window.__HAPIL_CONTROLS_V31329__;
      const s = N.makeState(); Object.assign(s, { zone: 'cult04', time: 100, hp: 240, maxHp: 240, activeHeroId: 'hwando', gameModeV31346: 'DREAM', samongUnlockedRC91: true });
      // A pending-transformation save is an explicit lifecycle fixture, not a
      // claim that this run naturally defeated Persona.
      E.restore(s, { version: 1, personaVictory: true, heroUnlocked: true, pendingTransformation: true, pendingFromZone: 'cult04', currentZone: 'cult04' });
      C.clear(); C.binding.state.current = s; C.binding.hero.current = 'hwando';
      s.zone = 'village'; N.enter(s, 'village');
      const entry = E.snapshot(s), next = E.nextZone(s, 'village', window.__HAPIL_NATIVE_ARENA_RC138__.maps);
      if (!entry.active || entry.direction !== -1 || next !== 'cult04') throw Error('native reverse-route handoff failed');
      s.completedZones.add('village'); s.zone = next; N.enter(s, next);
      window.__HAPIL_STORY_RC51__?.close?.(false); C.binding.actions.dismiss(); C.binding.modal.current = null;
      s.encounterDialogue31226 = null; s.encounterLockUntil31226 = 0; s.invulnerableUntil = s.time + 60;
      const before = E.snapshot(s), raw = B.serializeSave(s, s.activeHeroId, [], {}, 0), saved = B.normalizeSave(raw), restored = N.makeState();
      Object.assign(restored, { zone: saved.zone, hp: saved.hp, activeHeroId: saved.heroId, enemies: B.restoreEnemies(saved) }); B.restoreEntry(restored, saved);
      const after = E.snapshot(restored);
      return { staged: true, method: 'pending EGO save fixture; real native village then reverse cult04 entry, save/normalize/restore', entry, next, before, after };
    });
    assert(report.reverse.before.active && report.reverse.before.transformed && report.reverse.before.direction === -1);
    for (const key of ['currentVisitId', 'visitSerial', 'routeZone', 'direction', 'clearCount', 'active']) assert.equal(report.reverse.after[key], report.reverse.before[key], 'reverse save retains ' + key);
    check('native EGO reverse entry preserves visit and route ledger', report.reverse); await capture('reverse');

    stage = 'developer777-hidden-native-entry'; await fixture('cult04', 'DREAM');
    report.hidden = await page.evaluate(() => {
      const C = window.__HAPIL_CONTROLS_V31329__, s = C.binding.state.current, D = window.__HAPIL_DEVELOPER_MAPS_RC133__, H = window.__HAPIL_INNER_FINAL_RC133__;
      D.grant(s); const accepted = H.developerStart(s), boss = H.boss(s);
      return { staged: true, developer777: true, accepted, entry: s.innerFinalRC133?.entry, phase: s.innerFinalRC133?.phase,
        boss: boss && { id: boss.id, hp: boss.hp, maxHp: boss.maxHp }, originalFullHp: boss?.hp === boss?.maxHp };
    });
    assert(report.hidden.accepted && report.hidden.originalFullHp);
    assert.equal(report.hidden.entry, 'developer-777'); assert.equal(report.hidden.boss.id, 'inner-evil-rc133');
    await page.waitForFunction(() => window.__HAPIL_CONTROLS_V31329__.binding.state.current.innerFinalRC133?.phase === 'fight', null, { timeout: 15000 });
    report.hidden.live = await page.evaluate(() => {
      const s = window.__HAPIL_CONTROLS_V31329__.binding.state.current, H = window.__HAPIL_INNER_FINAL_RC133__;
      return { time: s.time, hp: s.hp, phase: s.innerFinalRC133.phase, boss: H.boss(s)?.id,
        packets: s.hostileProjectiles.map(q => ({ id: q.id, sourceId: q.sourceId, skill: q.rc133Skill ?? q.skillId ?? null })) };
    });
    check('777-assisted hidden battle enters actual native fight with original boss HP', report.hidden); await capture('hidden');
    if (profile === 'portrait') {
      stage = 'portrait-orientation-pause';
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForFunction(() => window.__HAPIL_ORIENTATION_PAUSE_RC152__.paused());
      const before = await page.evaluate(() => ({ time: window.__HAPIL_CONTROLS_V31329__.binding.state.current.time, hp: window.__HAPIL_CONTROLS_V31329__.binding.state.current.hp }));
      await page.keyboard.press('ArrowUp'); await page.waitForTimeout(250);
      const after = await page.evaluate(() => ({ time: window.__HAPIL_CONTROLS_V31329__.binding.state.current.time, hp: window.__HAPIL_CONTROLS_V31329__.binding.state.current.hp,
        gate: document.querySelector('#rc152-orientation-gate')?.textContent, paused: window.__HAPIL_ORIENTATION_PAUSE_RC152__.paused() }));
      assert.equal(after.time, before.time); assert.equal(after.hp, before.hp);
      assert.equal(after.gate, '가로 화면으로 전환해주세요'); assert(after.paused);
      await page.setViewportSize(viewport);
      await page.waitForFunction(() => !window.__HAPIL_ORIENTATION_PAUSE_RC152__.paused());
      check('portrait orientation gate freezes simulation and resumes on landscape', { before, after, resumed: true });
    }
    report.environment.renderer = await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl');
      if (!gl) return { available: false };
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      return { available: true, renderer: gl.getParameter(gl.RENDERER),
        unmaskedRenderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null };
    });
    assert.deepEqual(report.errors, [], 'no uncaught page errors');
    assert.deepEqual(report.httpErrors, [], 'no missing or failed HTTP resources');
    assert.deepEqual(report.requestFailures.filter(row => !row.expected), [], 'no unexpected failed requests');
    assert.equal(report.screenshots.length, 5);
    report.status = 'passed'; report.finishedAt = new Date().toISOString(); persist();
    console.log('RC231_MODES_SAVE_INPUT_BROWSER', JSON.stringify({ status: report.status, appSha, profile,
      checks: report.checks.map(row => row.name), screenshots: report.screenshots.map(row => ({ file: row.file, sha256: row.sha256 })),
      sourceScripts: report.source.loadedJavaScript.length, physicalDevice: false, staged: true }));
  } catch (error) {
    report.status = stage === 'official-chrome-launch' ? 'blocked' : 'failed';
    report.failure = { stage, message: error.stack || String(error) }; report.finishedAt = new Date().toISOString();
    if (page) {
      try { report.diagnostic = await page.evaluate(() => { const C = window.__HAPIL_CONTROLS_V31329__, s = C?.binding?.state?.current; return { phase: C?.binding?.phase,
        zone: s?.zone, hp: s?.hp, time: s?.time, modal: C?.binding?.modal?.current,
        story: window.__HAPIL_STORY_RC51__?.currentNarrative?.(), readingBlocked: window.__HAPIL_READING_V31342__?.blocked,
        blocked: C?.binding?.blocked?.(), documentHidden: document.hidden,
        orientationPaused: window.__HAPIL_ORIENTATION_PAUSE_RC152__?.paused?.(),
        partyIsControl: window.__HAPIL_PARTY_V31322__?.state === s,
        qaIsControl: window.__MONGSE_QA_STATE__ === s,
        fixtureIsControl: window.__RC231_LIVE_FIXTURE_REF__ === s,
        partyState: { zone: window.__HAPIL_PARTY_V31322__?.state?.zone, time: window.__HAPIL_PARTY_V31322__?.state?.time },
        qaState: { zone: window.__MONGSE_QA_STATE__?.zone, time: window.__MONGSE_QA_STATE__?.time },
        party: { role: window.__HAPIL_PARTY_V31322__?.status?.role, paused: window.__HAPIL_PARTY_V31322__?.status?.paused,
          disconnected: window.__HAPIL_PARTY_V31322__?.status?.disconnected, inputBlocked: window.__HAPIL_PARTY_V31322__?.blocksNativeInput?.() },
        waves: s?.spawnedWaves ? [...s.spawnedWaves] : null,
        actors: s?.enemies?.slice(0, 12).map(a => ({ id: a.id, hp: a.hp })),
        innerPhase: s?.innerFinalRC133?.phase, body: document.body.innerText.slice(-1500) }; }); } catch {}
    }
    persist(); console.error('RC231_BROWSER_FAILURE', JSON.stringify({ ...report.failure, diagnostic: report.diagnostic ?? null })); process.exitCode = 1;
  } finally {
    await browser?.close(); await new Promise(resolve => server.close(resolve));
  }
})();
