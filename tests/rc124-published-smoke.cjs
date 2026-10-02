'use strict';
// Read-only audit of the existing public Pages site. No route fulfillment,
// bundle injection, unlock codes, HP edits, or forced progression.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright') : 'playwright');
const EXPECTED = '257b920a470e0ee6a04e5a52d71157f66232682c';
const SITE = 'https://kjb7876-lang.github.io/hapil1/';
const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.HAPIL_QA_OUTPUT || path.join(ROOT, 'qa-results', 'rc124-published');
fs.mkdirSync(OUT, { recursive: true });
const report = { productionCommit: EXPECTED, site: SITE, startedAt: new Date().toISOString(),
  auditCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(),
  files: [], viewports: [], status: 'running', usedProgressCheats: false,
  limitations: ['Short natural combat observation, not a full playthrough.',
    'Canvas call/coordinate checks are not human visual approval of screenshots.'] };
const save = () => fs.writeFileSync(path.join(OUT, 'published-summary.json'), JSON.stringify(report, null, 2) + '\n');
const digest = b => crypto.createHash('sha256').update(b).digest('hex');
(async () => {
  let browser;
  try {
    for (const file of ['index.html', 'assets/index-v31526.js', 'assets/rc124/laser-overrun.js',
      'assets/rc108/laser-topology.js', 'assets/rc77/connected-laser.js']) {
      const expectedBytes = execFileSync('git', ['show', EXPECTED + ':' + file], { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
      const response = await fetch(new URL(file + '?v=42401', SITE), { signal: AbortSignal.timeout(45000) });
      const bytes = Buffer.from(await response.arrayBuffer());
      const row = { file, status: response.status, bytes: bytes.length, sha256: digest(bytes), expectedSha256: digest(expectedBytes) };
      row.matches = response.status === 200 && row.sha256 === row.expectedSha256;
      report.files.push(row); save();
      assert(row.matches, 'Published bytes do not match RC124: ' + file);
    }
    browser = await chromium.launch({ executablePath: process.env.HAPIL_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    for (const [name, width, height, mobile] of [['pc', 1180, 757, false], ['portrait', 390, 844, true], ['landscape', 844, 390, true]]) {
      const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
      const page = await context.newPage(), errors = [], failedResponses = [];
      page.setDefaultTimeout(45000);
      page.on('pageerror', e => errors.push(e.stack || e.message));
      page.on('response', r => { if (r.status() >= 400) failedResponses.push({ status: r.status(), url: r.url() }); });
      await page.addInitScript(() => {
        window.__RC124_PUBLISHED_OBSERVATIONS__ = { bars: [], count: 0 };
        const original = CanvasRenderingContext2D.prototype.fillRect;
        CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h) {
          const value = original.call(this, x, y, w, h);
          if (this.canvas.matches?.('.game-stage canvas') && this.fillStyle === '#ff3b66' && h === 7 && w > 0) {
            const m = this.getTransform(), rect = this.canvas.getBoundingClientRect();
            const px = m.a * (x + w / 2) + m.c * (y + h / 2) + m.e;
            const py = m.b * (x + w / 2) + m.d * (y + h / 2) + m.f;
            const sx = rect.left + px / this.canvas.width * rect.width;
            const sy = rect.top + py / this.canvas.height * rect.height;
            const o = window.__RC124_PUBLISHED_OBSERVATIONS__;
            o.count++;
            o.bars.push({ width: w, alpha: this.globalAlpha, screenX: sx, screenY: sy,
              visibleCoordinates: rect.width > 0 && rect.height > 0 && sx >= 0 && sx <= innerWidth && sy >= 0 && sy <= innerHeight });
            if (o.bars.length > 240) o.bars.shift();
          }
          return value;
        };
      });
      const response = await page.goto(SITE + '?qa=1&v=42401', { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      await page.waitForFunction(() => window.__HAPIL_STORY_NATIVE_RC51__?.installed);
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: '새 게임 시작', exact: true }).click();
      await page.getByRole('button', { name: '이 편성으로 접속', exact: true }).click();
      await page.waitForFunction(() => window.__MONGSE_QA_STATE__?.zone === 'dist00');
      // Existing public control setting; does not alter HP or progress.
      await page.evaluate(() => window.__HAPIL_CONTROLS_V31329__.setMode('full'));
      for (let n = 0; n < 12 && await page.locator('#hapil-story-rc51').count(); n++) {
        await page.keyboard.press('Enter'); await page.waitForTimeout(250);
      }
      await page.waitForTimeout(12000);
      const observation = await page.evaluate(() => {
        const s = window.__MONGSE_QA_STATE__, h = window.__HAPIL_LASER_OVERRUN_RC124__, t = window.__HAPIL_LASER_TOPOLOGY_RC108__;
        return { zone: s?.zone, hp: s?.hp, mode: s?.gameModeV31346, overrunInstalled: h?.installed,
          overscanPixels: h?.overscanPixels, topologyVersion: t?.version, metrics: t?.metrics?.(),
          boss: (s?.enemies || []).filter(a => a.boss && a.hp > 0).map(a => ({ id: a.id, hp: a.hp, maxHp: a.maxHp })),
          observedBars: window.__RC124_PUBLISHED_OBSERVATIONS__ };
      });
      const screenshot = name + '-published-combat.png';
      await page.screenshot({ path: path.join(OUT, screenshot) });
      const row = { name, width, height, screenshot, ...observation, errors, failedResponses };
      report.viewports.push(row); save();
      assert.equal(row.overrunInstalled, true, name + ': overscan not installed');
      assert.equal(row.overscanPixels, 32, name + ': wrong overscan');
      assert.equal(row.topologyVersion, 'RC124', name + ': wrong topology wrapper');
      assert(row.observedBars.count > 0, name + ': no actual native boss bar observed');
      assert(row.observedBars.bars.some(b => b.visibleCoordinates && b.alpha === 1), name + ': boss bar not inside visible viewport');
      assert.deepEqual(errors, [], name + ': JavaScript errors');
      assert.deepEqual(failedResponses, [], name + ': HTTP failures');
      console.log('PUBLISHED_RC124', JSON.stringify({ name, overrunInstalled: row.overrunInstalled, overscanPixels: row.overscanPixels,
        actualBossBarCalls: row.observedBars.count, visibleBossBars: row.observedBars.bars.filter(b => b.visibleCoordinates && b.alpha === 1).length,
        zone: row.zone, hp: row.hp, errors: errors.length, failedResponses: failedResponses.length }));
      await context.close();
    }
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed'; report.error = String(error.stack || error); process.exitCode = 1; console.error(error);
  } finally {
    await browser?.close(); report.finishedAt = new Date().toISOString(); save();
    console.log('RC124_PUBLISHED_FINAL', JSON.stringify({ status: report.status, productionCommit: EXPECTED,
      publishedFilesMatched: report.files.filter(f => f.matches).length, completedViewports: report.viewports.length, error: report.error || null }));
  }
})();
