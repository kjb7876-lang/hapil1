const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const expected = new Map([
  ['./assets/rc79/combat-policy.js', '38002'],
  ['./assets/rc15/hero-controls.js', '34602'],
  ['./assets/rc51/story.js', '38002'],
  ['./assets/rc77/connected-laser.js', '38002'],
  ['./assets/index-v31526.js', '38102'],
]);

for (const [asset, version] of expected) {
  assert(html.includes(`${asset}?v=${version}`), `${asset} must use its refreshed cache key`);
  assert(fs.existsSync(path.join(root, asset.replace(/^\.\//, ''))), `${asset} must exist`);
}
assert(html.indexOf('./assets/rc77/connected-laser.js?v=38002') <
  html.indexOf('./assets/index-v31526.js?v=38102'), 'laser helper must load before the main game module');

console.log('RC82 PASS: launch-critical scripts have refreshed cache keys and load in dependency order.');
