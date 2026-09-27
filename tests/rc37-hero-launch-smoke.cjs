const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const main = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');

const bundleVersion = html.match(/\.\/assets\/index-v31526\.js\?v=(\d+)/);
assert(bundleVersion && Number(bundleVersion[1]) >= 33701,
  'hero-launch fix must bypass the cached broken main bundle');

const marker = 'MONGSE_projectile31219.bitmapFallbackRendered31221 = !0;';
const start = main.indexOf(marker);
const end = main.indexOf('\n    }', start);
assert(start >= 0 && end > start, 'code-native fallback renderer branch is missing');
const fallbackBody = main.slice(start, end);
assert(fallbackBody.includes('typeof MONGSE_context31219.scale === `function`'),
  'fallback renderer must guard the optional Canvas scale method');

// The startup probe uses a lightweight context without CanvasRenderingContext2D.scale.
const fallbackRendered = vm.runInNewContext(
  `(() => { const MONGSE_projectile31219 = {}; const MONGSE_context31219 = {}; ${fallbackBody}; return MONGSE_projectile31219.bitmapFallbackRendered31221; })()`
);
assert.equal(fallbackRendered, true,
  'fallback renderer still throws when its probe context has no scale method');

console.log('PASS: hero-start fallback renderer accepts lightweight contexts and serves the cache-busted bundle.');
