// Browser-level RC54 asset decode test; uses only a temporary local HTTP server.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright')
  : 'playwright');

const root = path.resolve(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const mapStart = bundle.indexOf('/* RC54: align story maps with their time period');
const projectileStart = bundle.indexOf('/* RC54: story-matched projectile for the blue-light executor');
const mapSource = bundle.slice(mapStart, projectileStart);
const projectileSource = bundle.slice(projectileStart);
const routes = {
  dist00: './assets/maps/rc53/dist00-demon-tree.webp',
  dist01: './assets/maps/rc53/dist01-spider-cave.webp',
  ep1a07: './assets/maps/rc54/ep1a07-darkfall.webp',
  kair03: './assets/maps/rc53/kair03-siren-timeway.webp',
  cult04: './assets/maps/rc53/cult04-final-judgment.jpg',
  murder03: './assets/maps/rc54/murder03-loop-crosswalk.webp',
};
const projectile = './assets/vfx/rc54/murder03-blue-signal-projectile.png';

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (url.pathname === '/') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<!doctype html><meta charset="utf-8"><title>RC54 story visual QA</title>');
    return;
  }
  const file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
  if (!file.startsWith(root + path.sep)) { res.statusCode = 403; res.end(); return; }
  const type = file.endsWith('.webp') ? 'image/webp' : file.endsWith('.jpg') ? 'image/jpeg'
    : file.endsWith('.png') ? 'image/png' : 'application/octet-stream';
  try { res.setHeader('Content-Type', type); res.end(fs.readFileSync(file)); }
  catch { res.statusCode = 404; res.end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: process.env.HAPIL_CHROMIUM || undefined, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.evaluate(({ ids, hospital, map }) => {
      window.N = Object.fromEntries(ids.map(id => [id, {
        map: id === 'ep1a08' ? hospital : `./legacy/${id}.jpg`,
        mapVariants: [`./legacy/${id}-alt.jpg`],
      }]));
      window.N.murder03.map = './assets/maps/murder_03_rooftop_loop.jpg';
      window.MONGSE_zoneAssetManifest = id => new Set([window.N[id].map, ...window.N[id].mapVariants]);
      window.MONGSE_zoneAssetPlan31220 = id => {
        const assets = [window.N[id].map, ...window.N[id].mapVariants];
        return Object.fromEntries(['all', 'A', 'B', 'C', 'deferred', 'pins'].map(key => [key, new Set(assets)]));
      };
      window.__HAPIL_RECOVERY_V31369__ = {
        async prepareMap(cache, id) {
          const asset = window.N[id].map;
          if (/\/rc5[34]\//.test(asset)) throw new Error('test-only generated map 404');
          cache[asset] = { complete: true, naturalWidth: 1 };
          return true;
        },
      };
    }, { ids: [...Object.keys(routes), 'ep1a08'], hospital: './assets/maps/ep1a_08_blood_hospital_rc24.png' });
    await page.addScriptTag({ content: mapSource });
    const mapAudit = await page.evaluate(() => window.__HAPIL_MAP_ART_RC54__.audit());
    for (const [id, row] of Object.entries(mapAudit))
      assert(row.active && row.manifest && row.plan && !row.staleMapQueued, `${id} map routing failed`);

    await page.evaluate(({ hospital, legacyProjectile }) => {
      window.N.ep1a08.map = hospital;
      window.MONGSE_EXACT_BOSS_VISUAL_PROFILES_V31224 = {
        'blue-executor': {
          zone: 'murder03', projectile: legacyProjectile, major: legacyProjectile,
          telegraph: legacyProjectile, impact: legacyProjectile,
        },
      };
      window.MONGSE_resolveBossVisualV31224 = (actor, zone, signature) => ({
        zone: zone || 'murder03', signature, projectile: legacyProjectile,
        telegraph: legacyProjectile, impact: legacyProjectile, major: signature === 'major',
      });
      window.__MONGSE_BOSS_VISUAL_PATCH_V31224__ = {};
    }, {
      hospital: './assets/maps/ep1a_08_blood_hospital_rc24.png',
      legacyProjectile: './assets/generated-v31224/boss-vfx/murder_causality_road.webp',
    });
    await page.addScriptTag({ content: projectileSource });
    const visualAudit = await page.evaluate(() => window.__HAPIL_STORY_VISUAL_RC54__.audit());
    assert(visualAudit.projectileActive && visualAudit.manifest && visualAudit.plan && !visualAudit.retiredQueued);
    assert(visualAudit.hospitalMapPreserved && visualAudit.modernLoopMapActive);
    const resolved = await page.evaluate(() => window.MONGSE_resolveBossVisualV31224(
      { id: 'blue-executor' }, 'murder03', 'old-signature'));
    assert.equal(resolved.projectile, projectile);
    assert.equal(resolved.major, false, 'visual replacement must not alter damage or major-skill flags');

    const decoded = await page.evaluate(async ({ routes, projectile }) => {
      const sources = { ...routes, projectile };
      const output = {};
      for (const [id, src] of Object.entries(sources)) {
        const response = await fetch(src);
        if (!response.ok) throw new Error(`${id}: HTTP ${response.status}`);
        const bitmap = await createImageBitmap(await response.blob());
        output[id] = [bitmap.width, bitmap.height];
        if (id === 'projectile') {
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width; canvas.height = bitmap.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(bitmap, 0, 0);
          output.projectileAlpha = ctx.getImageData(0, 0, 1, 1).data[3] === 0;
        }
        bitmap.close();
      }
      return output;
    }, { routes, projectile });
    assert.deepEqual(decoded.dist00, [1672, 941]);
    assert.deepEqual(decoded.dist01, [1586, 992]);
    assert.deepEqual(decoded.ep1a07, [1586, 992]);
    assert.deepEqual(decoded.murder03, [1586, 992]);
    assert.deepEqual(decoded.projectile, [1024, 653]);
    assert.equal(decoded.projectileAlpha, true, 'generated bullet must preserve transparent corners');
    const fallback = await page.evaluate(async () => {
      const cache = {};
      const api = window.__HAPIL_MAP_ART_RC54__;
      const murderReady = await api.prepareMap(cache, 'murder03');
      const fallReady = await api.prepareMap(cache, 'ep1a07');
      return {
        murderReady,
        fallReady,
        murderAlias: cache[api.rows.murder03] === cache[api.originals.murder03.fallbackMap],
        fallAlias: cache[api.rows.ep1a07] === cache[api.originals.ep1a07.fallbackMap],
        selected: window.N.murder03.map === api.rows.murder03 && window.N.ep1a07.map === api.rows.ep1a07,
        metrics: api.metrics(),
      };
    });
    assert(fallback.murderReady && fallback.fallReady && fallback.murderAlias && fallback.fallAlias && fallback.selected);
    assert.equal(fallback.metrics.fallbackLoads, 2);
    assert.deepEqual(errors, [], errors.join('\n'));
    console.log('RC54 BROWSER PASS: all new art decoded, murder loop and projectile routes verified, hospital preserved, fallback recovered.');
    await page.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
