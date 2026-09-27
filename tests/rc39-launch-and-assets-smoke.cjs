const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// RC35 reduced the physical projectile cap to 72. Every release probe in the
// launch chain must accept that value or later modules never become ready.
assert.match(bundle, /projectileCap:\s*72/);
const staleChecks = [
  /MONGSE_BOSS_COMBAT_API_V31225\.invariants\.projectileCap\s*===\s*96/,
  /MONGSE_bossV31225\?\.invariants\?\.projectileCap\)\s*===\s*96/,
  /MONGSE_COMBAT_PHYSICS_V3128\?\.projectileCap\s*\?\?\s*0\)\s*===\s*96/,
];
for (const check of staleChecks) assert.doesNotMatch(bundle, check);
for (const check of [
  /MONGSE_BOSS_COMBAT_API_V31225\.invariants\.projectileCap\s*===\s*72/,
  /MONGSE_bossV31225\?\.invariants\?\.projectileCap\)\s*===\s*72/,
  /MONGSE_COMBAT_PHYSICS_V3128\?\.projectileCap\s*\?\?\s*0\)\s*===\s*72,/, // v3.12.30 probe
  /MONGSE_COMBAT_PHYSICS_V3128\?\.projectileCap\s*\?\?\s*0\)\s*===\s*72\s*&&/, // v3.12.33 probe
]) assert.match(bundle, check);

const bossGate = bundle.match(/MONGSE_BOSS_COMBAT_API_V31225\.allPass\s*=\s*([\s\S]*?);\s*return !0;/)?.[1];
assert.ok(bossGate, 'boss combat release gate was not found');
const boss = {
  bossCount: 27, midbossCount: 39, actorCount: 66,
  exactSignatureCount: 85, distanceCaseCount: 132, cadenceClassCount: 5,
  invariants: {projectileCap: 72, heroDamageWindowRatio: 0.24},
};
assert.equal(vm.runInNewContext(bossGate, {MONGSE_BOSS_COMBAT_API_V31225: boss}), true);
boss.invariants.projectileCap = 96;
assert.equal(vm.runInNewContext(bossGate, {MONGSE_BOSS_COMBAT_API_V31225: boss}), false);

assert.match(bundle, /if\(!window\.__HAPIL_V31329_RELEASE__\?\.installed\|\|!window\.__HAPIL_THEME_V31323__\?\.installed\|\|typeof window\.__HAPIL_THEME_V31323__\?\.debug\?\.rankedRows!==\x27function\x27\)/);
assert.match(html, /assets\/index-v31526\.js\?v=34301/);

const omitted = new Set([
  './assets/probe-boss-theme.webp', './assets/probe-generic-mark.webp',
  './assets/probe-midboss-theme.webp', './assets/missing-v31237.webp',
  '/assets/index-v31229.js', '/assets/index-v31300.js',
  '/assets/index-v31301.js', '/assets/index-v31302.js',
  '/assets/index-v31303.js', '/assets/vfx/common-blue-beam.webp',
]);
const ref = /(?:\.\/|\/)?(?:assets|data)\/[^\s"'`<>\\{},;()\[\]]+?\.(?:webp|png|jpe?g|svg|woff2?|mp3|wav|js|css)(?:\?[^\s"'`<>\\{},;()\[\]]*)?/gi;
let checked = 0;
const missing = new Set();
function scan(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name === '.git') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { scan(file); continue; }
    if (!/\.(?:js|cjs|html|css|json)$/i.test(entry.name)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(ref)) {
      const asset = match[0].split('?')[0];
      if (asset.includes('$') || omitted.has(asset)) continue;
      checked++;
      if (!fs.existsSync(path.join(root, asset.replace(/^\.?\//, '')))) missing.add(asset);
    }
  }
}
scan(path.join(root, 'assets'));
scan(path.join(root, 'data'));
// The page script and stylesheet tags also participate in the asset audit.
for (const match of html.matchAll(ref)) {
  const asset = match[0].split('?')[0];
  checked++;
  if (!fs.existsSync(path.join(root, asset.replace(/^\.?\//, '')))) missing.add(asset);
}
assert.deepEqual([...missing].sort(), []);
assert.ok(checked > 7000, 'the asset reference scan was unexpectedly small');
console.log(`RC39 launch gates and ${checked} asset references OK`);
