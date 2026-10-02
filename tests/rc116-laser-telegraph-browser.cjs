// Capture the live line-telegraph renderer. RC116_BASELINE=1 serves the
// pre-RC116 main bundle for an apples-to-apples comparison.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const { chromium } = require(
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
    ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright')
    : 'playwright'
);

const root = path.resolve(__dirname, '..');
const out = process.env.HAPIL_QA_OUTPUT || '/workspace/hapil-deliverables/RC116-laser';
const before = !!process.env.RC116_BASELINE;
const suffix = before ? 'before' : 'after';
const baseline = 'ae6ce7c7fc3a1bbe641384f73e6928ca7ea0c786';
const sprite = './assets/vfx/bosses/v3102/ep1b08_pride_cross_undead_cluster.webp';
fs.mkdirSync(out, { recursive: true });

const harness = `
window.__RC116_TELEGRAPH__={
  draw:(...args)=>qn(...args),
  queue:(...args)=>MONGSE_queueImage(...args),
  queueCurrent:MONGSE_queueImage,
  replaceQueue:fn=>{MONGSE_queueImage=fn;},
  point:(...args)=>G(...args)
};`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const extension = path.extname(file);
    res.setHeader('Content-Type', ({
      '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css',
      '.webp': 'image/webp', '.png': 'image/png', '.wav': 'audio/wav',
      '.woff2': 'font/woff2'
    })[extension] || 'application/octet-stream');
    if (file.endsWith('/assets/index-v31526.js') && before) {
      const source = execFileSync('git', ['show', `${baseline}:assets/index-v31526.js`], {
        cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024
      });
      res.end(source + harness);
    } else if (file.endsWith('/assets/index-v31526.js')) {
      res.end(fs.readFileSync(file, 'utf8') + harness);
    } else {
      res.end(fs.readFileSync(file));
    }
  } catch (error) {
    console.error('RC116 test server failed', file, error.message);
    res.writeHead(404).end();
  }
}).listen(0, '127.0.0.1');

async function main() {
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.HAPIL_CHROMIUM || '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage({ viewport: { width: 1180, height: 757 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') console.error('RC116 browser console', message.text()); });
    page.on('response', response => { if (response.status() >= 400) console.error('RC116 HTTP', response.status(), response.url()); });
    await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
    await page.waitForFunction(() => window.__RC116_TELEGRAPH__, { timeout: 12000 });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '새 게임 시작', exact: true }).click();
    await page.getByRole('button', { name: '이 편성으로 접속', exact: true }).click();
    await page.waitForFunction(() => window.__MONGSE_QA_STATE__?.zone === 'dist00');

    const rows = await page.evaluate(async spritePath => {
      const api = window.__RC116_TELEGRAPH__;
      const imageCache = {};
      const image = api.queue(imageCache, spritePath, 'eager');
      await image.decode();
      const baseQueue = api.queueCurrent;
      api.replaceQueue((cache, path, ...args) => path === spritePath ? image : baseQueue(cache, path, ...args));
      const canvas = document.createElement('canvas');
      canvas.width = 1180;
      canvas.height = 757;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const world = { a: { x: 8, y: 8 }, b: { x: 24, y: 24 } };
      const p0 = api.point(world.a.x, world.a.y);
      const p1 = api.point(world.b.x, world.b.y);
      const hazard = {
        id: 901, born: 0, at: 2.1, originX: world.a.x, originY: world.a.y,
        x: world.b.x, y: world.b.y, radius: Math.hypot(world.b.x - world.a.x, world.b.y - world.a.y),
        width: 0.42, shape: 'line', color: '#f12655', accent: '#ffe8ef',
        boss: true, themedLaser: true, sevenSinImpactSprite: spritePath,
        suppressTelegraphLabel: true, perfectWindow: 0, telegraphImageRenderedV31224: false
      };
      const output = [];
      for (const options of [
        { name: 'desktop', lowFx: false, reducedFlash: false },
        { name: 'reduced-flash', lowFx: false, reducedFlash: true },
        { name: 'mobile-lowFx', lowFx: true, reducedFlash: true }
      ]) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let spriteDraws = 0;
        let drawImageCalls = 0;
        const drawImageSources = [];
        const nativeDrawImage = ctx.drawImage.bind(ctx);
        ctx.drawImage = (source, ...args) => {
          drawImageCalls++;
          drawImageSources.push({ same: source === image, width: source.naturalWidth || source.width || 0, height: source.naturalHeight || source.height || 0 });
          if (source === image) spriteDraws++;
          return nativeDrawImage(source, ...args);
        };
        api.draw(ctx, hazard, 0.8, options, imageCache);
        const png = canvas.toDataURL('image/png');
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let drawn = 0;
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;
        for (let y = 0; y < canvas.height; y += 2) {
          for (let x = 0; x < canvas.width; x += 2) {
            if (pixels[(y * canvas.width + x) * 4 + 3] <= 8) continue;
            drawn++;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const length = Math.hypot(dx, dy);
        const nx = -dy / length;
        const ny = dx / length;
        let centerVisible = 0;
        let centerSamples = 0;
        let bodyVisible = 0;
        let bodySamples = 0;
        for (let t = 0.04; t <= 0.96; t += 0.04) {
          const x = p0.x + dx * t;
          const y = p0.y + dy * t;
          centerSamples++;
          if (pixels[(Math.floor(y) * canvas.width + Math.floor(x)) * 4 + 3] > 20) centerVisible++;
          for (const sign of [-1, 1]) {
            const sx = Math.floor(x + nx * 5 * sign);
            const sy = Math.floor(y + ny * 5 * sign);
            bodySamples++;
            if (pixels[(sy * canvas.width + sx) * 4 + 3] > 20) bodyVisible++;
          }
        }
        output.push({
          ...options, spriteDraws, drawImageCalls, drawImageSources, drawnPixels: drawn,
          bounds: drawn ? [minX, minY, maxX, maxY] : null,
          centerCoverage: centerVisible / centerSamples,
          bodyCoverage: bodyVisible / bodySamples,
          expectedPath: { start: p0, end: p1 }, png
        });
        ctx.drawImage = nativeDrawImage;
      }
      return output;
    }, sprite);

    for (const row of rows) {
      const file = path.join(out, `laser-warning-${row.name}-${suffix}.png`);
      fs.writeFileSync(file, Buffer.from(row.png.split(',')[1], 'base64'));
      delete row.png;
    }
    fs.writeFileSync(path.join(out, `laser-warning-${suffix}.json`), JSON.stringify({ rows, errors }, null, 2));
    console.log(`RC116_TELEGRAPH_${suffix.toUpperCase()} ${JSON.stringify({ rows, errors })}`);
    assert.deepEqual(errors, []);
    assert(rows.every(row => row.drawnPixels > 1000), 'the actual line warning remains visible');
    if (before) {
      assert(rows.some(row => row.centerCoverage < 0.95 || row.bodyCoverage < 0.95),
        'baseline clipped art has translucent gaps in its beam body');
    } else {
      assert(rows.every(row => row.centerCoverage >= 0.98 && row.bodyCoverage >= 0.98),
        'desktop, reduced-flash and low-FX warnings remain a continuous band');
    }
    assert(rows.every(row => row.drawImageCalls === 1),
      'the live warning draws one clipped texture over its connected line, with no repeated oval stamps');
  } finally {
    await browser?.close();
    server.close();
  }
}

main().catch(error => {
  console.error(error);
  server.close();
  process.exitCode = 1;
});
