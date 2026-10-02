// Render every authored blood-laser topology in Chromium. Set RC116_BASELINE=1
// to serve the pre-RC116 main renderer for an apples-to-apples before capture.
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
const suffix = process.env.RC116_BASELINE ? 'before' : 'after';
const baseline = 'ae6ce7c7fc3a1bbe641384f73e6928ca7ea0c786';
fs.mkdirSync(out, { recursive: true });

const harness = `
window.__RC116__=()=>({
  L:window.__HAPIL_LASERS_V31330__,
  blood:window.__HAPIL_BLOOD_RC16__,
  join:window.__HAPIL_CONNECTED_LASER_V31377__,
  queue:MONGSE_queueImage
});`;

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
    if (file.endsWith('/assets/rc77/connected-laser.js') && process.env.RC116_BASELINE) {
      res.end(execFileSync('git', ['show', `${baseline}:assets/rc77/connected-laser.js`], { cwd: root }));
    } else if (file.endsWith('/assets/index-v31526.js')) {
      res.end(fs.readFileSync(file, 'utf8') + harness);
    } else {
      res.end(fs.readFileSync(file));
    }
  } catch {
    res.writeHead(404).end();
  }
}).listen(0, '127.0.0.1');

async function main() {
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage({ viewport: { width: 1180, height: 757 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
    await page.waitForFunction(() => {
      const modules = window.__RC116__?.();
      return modules?.L?.installed && modules?.blood?.installed && modules?.join?.installed;
    });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '새 게임 시작', exact: true }).click();
    await page.getByRole('button', { name: '이 편성으로 접속', exact: true }).click();
    await page.waitForFunction(() => window.__MONGSE_QA_STATE__?.zone === 'dist00');

    const result = await page.evaluate(async () => {
      const { L, blood, join, queue } = window.__RC116__();
      const owner = L.owners.find(item => item.id === 'dist00-boss');
      const canvas = document.createElement('canvas');
      const columns = 6;
      const cellWidth = canvas.width = 1180;
      const cellHeight = 140;
      const rowsPerMode = Math.ceil(blood.types.length / columns);
      canvas.height = cellHeight * rowsPerMode * 2;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const image = queue({}, owner.beam, 'eager');
      await image.decode();
      const rows = [];

      for (let mode = 0; mode < 2; mode++) {
        const lowFx = mode === 1;
        for (const [index, type] of blood.types.entries()) {
          const col = index % columns;
          const gridRow = Math.floor(index / columns) + mode * rowsPerMode;
          const tileX = Math.floor(col * cellWidth / columns);
          const tileY = gridRow * cellHeight;
          const tileW = Math.ceil((col + 1) * cellWidth / columns) - tileX;
          const cast = {
            id: index + 1000, type, sourceId: owner.id, cx: 16, cy: 16,
            radius: type === 'cataclysm' ? 14 : 12, width: 0.42, angle: 0.15,
            fireAt: 1, activeSeconds: 1.25, born: 0, endAt: 2.5,
            color: owner.color, accent: owner.accent, bloodV31516: true
          };
          const lines = blood.geometry(cast, 1.7);
          const points = lines.flatMap(line => [line.a, line.b]);
          const minX = Math.min(...points.map(point => point.x));
          const maxX = Math.max(...points.map(point => point.x));
          const minY = Math.min(...points.map(point => point.y));
          const maxY = Math.max(...points.map(point => point.y));
          const scale = Math.min(160 / Math.max(1, maxX - minX), 110 / Math.max(1, maxY - minY));
          const centerX = tileX + tileW / 2;
          const centerY = tileY + cellHeight / 2;
          const project = point => ({
            x: centerX + (point.x - (minX + maxX) / 2) * scale,
            y: centerY + (point.y - (minY + maxY) / 2) * scale
          });
          const screen = lines.map(line => ({ a: project(line.a), b: project(line.b) }));

          ctx.fillStyle = '#09111d';
          ctx.fillRect(tileX, tileY, tileW, cellHeight);
          join.render(ctx, screen, {
            width: 9.5, complex: true, image, color: owner.color,
            accent: owner.accent, alpha: 1, quiet: true, low: lowFx
          });

          const pixels = ctx.getImageData(tileX, tileY, tileW, cellHeight).data;
          const alphaAt = (x, y) => {
            const px = Math.floor(x) - tileX;
            const py = Math.floor(y) - tileY;
            if (px < 0 || py < 0 || px >= tileW || py >= cellHeight) return 0;
            return pixels[(py * tileW + px) * 4 + 3];
          };
          let samples = 0;
          let centerVisible = 0;
          let bodySamples = 0;
          let bodyVisible = 0;
          for (const line of screen) {
            const dx = line.b.x - line.a.x;
            const dy = line.b.y - line.a.y;
            const length = Math.hypot(dx, dy);
            if (length < 2) continue;
            const nx = -dy / length;
            const ny = dx / length;
            for (let distance = 0; distance <= length; distance += 2) {
              const t = distance / length;
              if (t < 0.025 || t > 0.975) continue;
              const x = line.a.x + dx * t;
              const y = line.a.y + dy * t;
              samples++;
              if (alphaAt(x, y) > 20) centerVisible++;
              for (const sign of [-1, 1]) {
                bodySamples++;
                if (alphaAt(x + nx * 9.5 * 0.7 * sign, y + ny * 9.5 * 0.7 * sign) > 20) bodyVisible++;
              }
            }
          }
          rows.push({
            type, mode: lowFx ? 'lowFx' : 'full', segments: lines.length,
            centerSamples: samples, centerVisible,
            bodySamples, bodyVisible,
            centerCoverage: samples ? centerVisible / samples : 0,
            bodyCoverage: bodySamples ? bodyVisible / bodySamples : 0
          });
        }
      }
      return {
        gallery: canvas.toDataURL('image/png'), rows,
        renderer: join.version, types: blood.types, owners: L.owners.length
      };
    });

    fs.writeFileSync(path.join(out, `laser-patterns-${suffix}.png`), Buffer.from(result.gallery.split(',')[1], 'base64'));
    delete result.gallery;
    fs.writeFileSync(path.join(out, `laser-patterns-${suffix}.json`), JSON.stringify({ ...result, errors }, null, 2));
    const summary = {
      types: result.types.length,
      renderedRows: result.rows.length,
      minCenterCoverage: Math.min(...result.rows.map(row => row.centerCoverage)),
      minBodyCoverage: Math.min(...result.rows.map(row => row.bodyCoverage)),
      worst: result.rows.slice().sort((a, b) => a.bodyCoverage - b.bodyCoverage).slice(0, 4),
      errors
    };
    console.log(`RC116 ${suffix} ${JSON.stringify(summary)}`);
    assert.equal(result.rows.length, result.types.length * 2);
    assert.deepEqual(errors, []);
    if (!process.env.RC116_BASELINE) assert(summary.minBodyCoverage >= 0.98, 'continuous beam body has transverse raster gaps');
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
