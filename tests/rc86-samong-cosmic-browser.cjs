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
const output = process.env.HAPIL_QA_OUTPUT || path.join(os.tmpdir(), 'hapil-rc86');
fs.mkdirSync(output, {recursive: true});
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root + path.sep)) {
    res.statusCode = 403;
    res.end();
    return;
  }
  try {
    res.setHeader('Content-Type', ({
      '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css',
      '.png': 'image/png', '.webp': 'image/webp', '.wav': 'audio/wav',
      '.woff2': 'font/woff2',
    })[path.extname(file)] || 'application/octet-stream');
    let bytes = fs.readFileSync(file);
    if (file.endsWith('index-v31526.js')) {
      const harness = [
        'window.__HAPIL_RC86_BROWSER_TEST__ = {',
        '  bossPhase: actor => MONGSE_enemyPhase(actor),',
        '  patterns: (actor, phase) => MONGSE_patternsForEnemy(actor, phase)',
        '};',
      ].join('\n');
      bytes = Buffer.concat([bytes, Buffer.from('\n' + harness)]);
    }
    res.end(bytes);
  } catch {
    res.statusCode = 404;
    res.end();
  }
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
    await page.goto('http://127.0.0.1:' + server.address().port + '/?rc86=1', {waitUntil: 'domcontentloaded'});
    try {
      await page.waitForFunction(
        () => window.__HAPIL_SAMONG_COSMIC_V386__?.installed === true &&
              window.__HAPIL_APOSTATE_VISUALS_RC86__?.installed === true,
        null,
        {timeout: 10000},
      );
    } catch (error) {
      const diagnostics = await page.evaluate(() => ({
        bridge: Boolean(window.__HAPIL_RC86_BRIDGE__),
        scripts: [...document.scripts].map(script => script.src).filter(Boolean),
        v31300: window.__HAPIL_V31300_PATCH__?.allPass ?? null,
        v31301: window.__HAPIL_AUTOPROGRESS_V31301__?.installed ?? null,
        cosmic: window.__HAPIL_COSMIC_V31348__?.installed ?? null,
        mode: typeof window.__HAPIL_MODES_V31346__?.mode,
        main: typeof window.__MONGSE_QA_STATE__,
      }));
      console.error('RC86 INSTALL DIAGNOSTICS ' + JSON.stringify({diagnostics, errors}));
      throw error;
    }
    const result = await page.evaluate(async () => {
      const api = window.__HAPIL_SAMONG_COSMIC_V386__;
      const audit = api.audit();
      const visuals = window.__HAPIL_APOSTATE_VISUALS_RC86__.audit();
      const cache = {};
      const visualAssets = Object.values(window.__HAPIL_APOSTATE_VISUALS_RC86__.assets)
        .flatMap(row => [row.idle, row.action]);
      await Promise.all(visualAssets.map(path => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => { cache[path] = image; resolve(); };
        image.onerror = () => reject(new Error('apostate bitmap failed to load: ' + path));
        image.src = path;
      })));
      const visualActors = ['c103-mid', 'c103-boss'].map(id =>
        window.__HAPIL_RC86_BRIDGE__.actor('cult03', id)
      );
      const apostateRenderPaths = visualActors.map(actor => {
        const idleActor = {...actor, castVisualUntil31210: 0, activePatternUntil: 0, attackAt: 0, recoverUntil: 0, dashingUntil: 0};
        const activeActor = {...idleActor, castVisualUntil31210: 5};
        return {
          id: actor.id,
          idle: window.__HAPIL_RC86_BRIDGE__.phaseSprite(cache, idleActor, 1),
          active: window.__HAPIL_RC86_BRIDGE__.phaseSprite(cache, activeActor, 1),
        };
      });
      const boss = {
        id: 'c104-boss', hp: 5000, maxHp: 5000, boss: true,
        hapilSecondPhaseV31300: true, x: 18, y: 5,
      };
      const state = {
        zone: 'cult04', gameModeV31346: 'STORY', time: 20, fxSerial: 1,
        x: 16, y: 10, hp: 1000, maxHp: 1000, bossDefeated: false,
        enemies: [boss], floatTexts: [], effects: [],
        hostileProjectiles: [], pendingHits: [], impactQueue: [], pendingStrikes: [],
        narrativeCasts: [], telekineticCasts: [], spatialRiftBarrages: [],
        bossOrdnanceCues: [], spatialRiftCasts: [], bossLaserCastsV31330: [],
        bossUltimateCastsV31334: [], dreamMirrorLasersV31347: [],
        hapilFinalBattleV31300: {
          stage: 7, secondPhaseActive: true, monochromeActiveV31377: true, completed: false,
        },
      };
      api.tick(state);
      const summonRows = [];
      for (let index = 0; index < 6; index++) {
        state.time = api.snapshot(state).nextAt;
        api.tick(state);
        const actor = state.enemies.find(row => row.samongCosmicSummonV386 === true);
        if (!actor) throw new Error('Summon ' + (index + 1) + ' did not appear');
        const phase = window.__HAPIL_RC86_BROWSER_TEST__.bossPhase(actor);
        const patterns = window.__HAPIL_RC86_BROWSER_TEST__.patterns(actor, phase);
        if (!patterns.length) throw new Error(actor.id + ' has no live phase pattern');
        const auditPatterns = api.nativePatterns(actor.id, phase);
        const ownSignatures = api.signatureDeck(actor.id);
        if (ownSignatures.length < 3) throw new Error(actor.id + ' has no complete boss-specific signature deck');
        state.time = api.snapshot(state).dispatchAt;
        api.tick(state);
        if (actor.samongCosmicPatternDispatchedV386 !== true) throw new Error(actor.id + ' did not cast during its summon');
        if (!ownSignatures.includes(actor.samongCosmicPatternNameV386)) {
          throw new Error(actor.id + ' cast a pattern outside its native signature deck: ' + actor.samongCosmicPatternNameV386);
        }
        const sourceRows = [
          ...state.pendingHits, ...state.hostileProjectiles,
          ...state.bossLaserCastsV31330, ...state.pendingStrikes,
        ].filter(row => row.sourceId === actor.id);
        if (!(actor.samongCosmicPatternCountV386 > 0) || sourceRows.length === 0) {
          throw new Error(actor.id + ' signature dispatch did not emit live hostile ordnance: ' + JSON.stringify({
            attackCount: actor.samongCosmicPatternCountV386, sourceRows,
          }));
        }
        summonRows.push({
          id: actor.id, index: actor.samongCosmicIndexV386, phase,
          patternCount: patterns.length,
          signaturePatterns: ownSignatures,
          patternName: actor.samongCosmicPatternNameV386,
          attackCount: actor.samongCosmicPatternCountV386,
          hostileRows: sourceRows.length,
          names: auditPatterns.slice(0, 4).map(row => row.name),
          sprite: actor.sprite, assetCount: api.audit().bosses[index].assets.length,
        });
        state.time = api.snapshot(state).activeUntil;
        api.tick(state);
      }
      return {
        audit, visuals, apostateRenderPaths, summonRows,
        wave: api.snapshot(state),
        bossRemains: state.enemies.some(row => row.id === 'c104-boss'),
        bossDefeated: state.bossDefeated,
        remainingSummonOrdnance: [
          ...state.pendingHits, ...state.hostileProjectiles,
          ...state.bossLaserCastsV31330, ...state.pendingStrikes,
        ].some(row => /^kair-great-0[1-6]$/.test(String(row.sourceId ?? ''))),
        callouts: state.floatTexts.filter(row => String(row.text).startsWith('사몽 ·')).length,
      };
    });
    assert(result.audit.allPass, JSON.stringify(result.audit, null, 2));
    assert(result.audit.regionalTrialsAreDifferentBosses);
    assert(result.visuals.allPass, JSON.stringify(result.visuals, null, 2));
    assert.deepEqual(result.apostateRenderPaths, [
      {id: 'c103-mid', idle: './assets/vfx/rc86/cult03-heretic-han-idle-v2.png', active: './assets/vfx/rc86/cult03-heretic-han-cast-v2.png'},
      {id: 'c103-boss', idle: './assets/vfx/rc86/cult03-heretic-baek-idle-v2.png', active: './assets/vfx/rc86/cult03-heretic-baek-attack-v2.png'},
    ]);
    assert.deepEqual(result.summonRows.map(row => row.id),
      Array.from({length: 6}, (_, i) => 'kair-great-0' + (i + 1)));
    assert(result.summonRows.every(row =>
      row.patternCount > 0 && row.signaturePatterns.includes(row.patternName) &&
      row.attackCount > 0 && row.hostileRows > 0 && row.assetCount > 0
    ), 'each summon must cast its own boss-specific signature and emit live hostile ordnance: ' + JSON.stringify(result.summonRows));
    assert.equal(new Set(result.summonRows.map(row => row.signaturePatterns.join('|'))).size, 6,
      'all six summons must retain their six distinct authored signature decks');
    assert.equal(result.wave.status, 'complete');
    assert(result.audit.signatureDecksDistinct, 'each Cosmic Great must retain a distinct attack deck');
    assert(result.audit.bosses.every(row => row.signatureDeckUnique), 'all six signature decks must be complete and unique');
    assert.equal(result.bossRemains, true);
    assert.equal(result.bossDefeated, false);
    assert.equal(result.remainingSummonOrdnance, true, 'RC88 keeps already committed hostile attacks after a summon retires; native lifetimes finish them');
    assert.equal(result.callouts, 7);
    assert.deepEqual(errors, []);
    await page.screenshot({path: path.join(output, 'rc86-samong-audit.png')});
    console.log('RC86 BROWSER PASS ' + JSON.stringify({
      cosmicBosses: result.summonRows,
      templateBases: result.audit.bosses.map(row => ({
        id: row.id, boss: row.baseBoss, midboss: row.baseMidboss, name: row.baseName,
        canonicalAlly: row.canonicalAlly,
      })),
      apostateRenderPaths: result.apostateRenderPaths,
      trialsAreSeparate: result.audit.regionalTrialsAreDifferentBosses,
      apostateVisuals: result.visuals,
      wave: result.wave,
      mapClearStayedWithFinalBoss: !result.bossDefeated && result.bossRemains,
      callouts: result.callouts,
      pageErrors: errors.length,
    }));
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => {
  console.error(error);
  server.close();
  process.exitCode = 1;
});
