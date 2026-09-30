const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const assert = require('node:assert/strict');
const {chromium} = require(
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
    ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright')
    : 'playwright',
);

const root = path.resolve(__dirname, '..');
const output = process.env.HAPIL_QA_OUTPUT || path.join(os.tmpdir(), 'hapil-rc87');
fs.mkdirSync(output, {recursive: true});
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root + path.sep)) { res.statusCode = 403; res.end(); return; }
  try {
    res.setHeader('Content-Type', ({
      '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css',
      '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.wav': 'audio/wav',
      '.woff2': 'font/woff2',
    })[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch { res.statusCode = 404; res.end(); }
}).listen(0, '127.0.0.1');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.HAPIL_CHROMIUM || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 900}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
    await page.goto('http://127.0.0.1:' + server.address().port + '/?qa=1&rc87=1', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => window.__HAPIL_EPISODE_COSMIC_V387__?.installed === true, null, {timeout: 15000});
    const result = await page.evaluate(async () => {
      const api = window.__HAPIL_EPISODE_COSMIC_V387__;
      const bridge = window.__HAPIL_RC86_BRIDGE__;
      const visualApi = window.__HAPIL_APOSTATE_VISUALS_RC86__;
      const audit = api.audit();
      const visualAudit = visualApi.audit();
      const paths = [...new Set([
        ...visualAudit.actors.flatMap(row => [row.idlePath, row.actionPath]),
        ...audit.rows.flatMap(row => row.assets),
      ])];
      await Promise.all(paths.map(path => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('combat bitmap failed to load: ' + path));
        image.src = path;
      })));
      const stateFor = (zone, mode = 'STORY') => ({
        zone, gameModeV31346: mode, time: 24, fxSerial: 1,
        x: 15, y: 12, hp: 1000, maxHp: 1000,
        enemies: [], bossDefeated: false, clues: new Set(), floatTexts: [], effects: [],
        spawnedWaves: new Set([3]), loopCycles: {[zone]: 3},
        hostileProjectiles: [], pendingHits: [], impactQueue: [], pendingStrikes: [],
        narrativeCasts: [], telekineticCasts: [], spatialRiftBarrages: [],
        bossOrdnanceCues: [], spatialRiftCasts: [], bossLaserCastsV31330: [],
        bossUltimateCastsV31334: [], dreamMirrorLasersV31347: [],
      });
      const launches = [];
      const state = stateFor(audit.rows[0].zone);
      for (const row of audit.rows) {
        const trigger = {...bridge.actor(row.zone, row.triggerId), hp: 0};
        const previousStage = state.hapilEpisodeCosmicV387;
        const previousClues = state.clues;
        Object.assign(state, stateFor(row.zone));
        state.hapilEpisodeCosmicV387 = previousStage;
        state.clues = previousClues;
        state.enemies = [trigger];
        if (api.beforeDeath(state, trigger)) throw new Error(row.zone + ' intercepted authored boss death unexpectedly');
        state.enemies = [];
        state.bossDefeated = true;
        if (bridge.zoneCombatCleared(state, row.zone)) throw new Error(row.zone + ' opened its exit before the Cosmic final');
        const boss = state.enemies.find(actor => actor.episodeCosmicFinalV387 === true);
        if (!boss || boss.id !== row.cosmicId || boss.midboss || !boss.boss) {
          throw new Error(row.zone + ' did not become a true-final Cosmic encounter');
        }
        const plan = bridge.zoneAssetPlan(row.zone);
        if (!row.assets.every(path => plan.A.has(path) && plan.pins.has(path))) {
          throw new Error(row.zone + ' failed to eager-load and pin all Cosmic images');
        }
        state.time = boss.episodeCosmicSignatureAtV387;
        api.tick(state);
        api.tick(state);
        const firstCount = (state.pendingHits ?? []).length + (state.hostileProjectiles ?? []).length +
          (state.bossLaserCastsV31330 ?? []).length + (state.pendingStrikes ?? []).length;
        if (!boss.episodeCosmicFirstSignatureDispatchedV387 || firstCount < 1) {
          throw new Error(row.cosmicId + ' did not dispatch its native signature pattern');
        }
        state.time = boss.episodeCosmicNextSignatureV387;
        api.tick(state);
        if (!(boss.episodeCosmicSignatureCountV387 > 0)) throw new Error(row.cosmicId + ' signature cycle is missing');
        launches.push({
          part: row.part, zone: row.zone, trigger: row.triggerId, cosmic: boss.id,
          phase: boss.currentPhase, sprite: boss.sprite, images: row.assets.length,
          signature: boss.episodeCosmicSignatureNameV387,
        });
        boss.hp = 0;
        api.beforeDeath(state, boss);
        state.enemies = [];
        if (!bridge.zoneCombatCleared(state, row.zone)) throw new Error(row.zone + ' exit remained blocked after Cosmic defeat');
      }
      const dream = stateFor('ep1b09', 'DREAM');
      dream.hapilEpisodeCosmicV387 = {status: 'pending', zone: 'ep1b09', cosmicId: 'kair-great-01'};
      api.tick(dream);
      return {
        audit, visualAudit, paths, launches,
        dreamStage: dream.hapilEpisodeCosmicV387,
        partOneLucifer: bridge.actor('ep1a11', 'a11-boss')?.id === 'a11-boss',
        finalSamong: bridge.actor('cult04', 'c104-boss')?.id === 'c104-boss',
      };
    });
    assert(result.audit.allPass, JSON.stringify(result.audit, null, 2));
    assert(result.visualAudit.allPass, JSON.stringify(result.visualAudit, null, 2));
    assert.equal(result.audit.rows.length, 6);
    assert.equal(result.paths.length >= 10, true);
    assert.equal(result.launches.length, 6);
    assert.deepEqual(result.launches.map(row => row.cosmic), Array.from({length: 6}, (_, i) => 'kair-great-0' + (i + 1)));
    assert.equal(result.dreamStage.status, 'pending', 'Dream encounter state should not spawn episode finals');
    assert.equal(result.partOneLucifer, true);
    assert.equal(result.finalSamong, true);
    await page.keyboard.press('Escape');
    await page.getByRole('button', {name: '새 게임 시작', exact: true}).click();
    await page.locator('.hero-card').nth(6).click();
    await page.getByRole('button', {name: '이 편성으로 접속', exact: true}).click();
    await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');
    await page.getByRole('button', {name: '계속 · Enter', exact: true}).click();
    await page.waitForFunction(() => window.__MONGSE_QA_STATE__?.time > 0);
    const saveResult = await page.evaluate(() => {
      const api = window.__HAPIL_EPISODE_COSMIC_V387__;
      const bridge = window.__HAPIL_RC86_BRIDGE__;
      const live = window.__MONGSE_QA_STATE__;
      const trigger = {...bridge.actor('u203', 'u203-boss'), hp: 0};
      const state = {
        ...live, zone: 'u203', gameModeV31346: 'STORY', time: 3600,
        enemies: [trigger], clues: new Set(), completedZones: new Set(),
        spawnedWaves: new Set([3]), loopCycles: {u203: 3}, bossDefeated: false,
      };
      api.beforeDeath(state, trigger);
      state.enemies = [];
      state.bossDefeated = true;
      bridge.zoneCombatCleared(state, 'u203');
      const boss = state.enemies[0];
      boss.hp -= 17;
      boss.episodeCosmicFirstSignatureDispatchedV387 = true;
      boss.episodeCosmicNextSignatureV387 = 3604.25;
      const raw = bridge.serializeSave(state, 'slayer', [], {}, {});
      const save = bridge.normalizeSave(JSON.parse(JSON.stringify(raw)));
      const restored = {
        ...live, zone: save.zone, time: 100, enemies: bridge.restoreEnemies(save),
        clues: new Set(save.clues), bossDefeated: true,
      };
      bridge.restoreEntry(restored, save);
      const actor = restored.enemies.find(row => row.episodeCosmicFinalV387 === true);
      return {
        hp: boss.hp, restoredHp: actor?.hp, delay: save.episodeCosmicFinalV387?.signatureDelayRemaining,
        nextAt: actor?.episodeCosmicNextSignatureV387, status: restored.hapilEpisodeCosmicV387?.status,
        exitLocked: !bridge.zoneCombatCleared(restored, restored.zone),
      };
    });
    assert.equal(saveResult.restoredHp, saveResult.hp);
    assert.equal(saveResult.delay, 4.25);
    assert.equal(saveResult.nextAt, 104.25);
    assert.equal(saveResult.status, 'active');
    assert.equal(saveResult.exitLocked, true);
    assert.deepEqual(errors, []);
    await page.screenshot({path: path.join(output, 'rc87-episode-cosmic-audit.png')});
    console.log('RC87 BROWSER PASS ' + JSON.stringify({
      episodes: result.launches,
      apostateImages: result.visualAudit.actors,
      loadedCombatBitmaps: result.paths.length,
      partOneLucifer: result.partOneLucifer,
      partEightSamong: result.finalSamong,
      dreamStageUntouched: result.dreamStage.status === 'pending',
      nativeSaveRestore: saveResult,
      pageErrors: errors.length,
    }));
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
