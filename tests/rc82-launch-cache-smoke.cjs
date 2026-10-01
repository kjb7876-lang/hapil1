const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const expected = new Map([
  ['./assets/rc79/combat-policy.js', '39501'],
  ['./assets/rc15/hero-controls.js', '39601'],
  ['./assets/rc51/story.js', '39301'],
  ['./assets/rc77/connected-laser.js', '39801'],
  ['./assets/rc26/ui.js', '39902'],
  ['./assets/rc99/battle-layout.js', '39902'],
  ['./assets/rc99/battle-layout.css', '40001'],
  ['./assets/rc83/startup-diagnostics.js', '38305'],
  ['./assets/index-v31526.js', '39701'],
  ['./assets/rc86/samong-cosmic.js', '39301'],
  ['./assets/rc87/episode-cosmic.js', '39301'],
  ['./assets/rc88/danmaku-rpg.js', '39501'],
]);

for (const [asset, version] of expected) {
  assert(html.includes(`${asset}?v=${version}`), `${asset} must use its refreshed cache key`);
  assert(fs.existsSync(path.join(root, asset.replace(/^\.\//, ''))), `${asset} must exist`);
}
assert(html.indexOf('./assets/rc77/connected-laser.js?v=39801') <
  html.indexOf('./assets/rc83/startup-diagnostics.js?v=38305'), 'laser helper must load before startup diagnostics');
assert(html.indexOf('./assets/rc83/startup-diagnostics.js?v=38305') <
  html.indexOf('./assets/index-v31526.js?v=39701'), 'startup diagnostics must observe game initialization');

const diagnostic = fs.readFileSync(path.join(root, 'assets/rc83/startup-diagnostics.js'), 'utf8');
for (const field of ['releases:', 'v31303CombatFlow:', 'evidence: window.__HAPIL_COMBAT_FLOW_V31303__.evidence', 'v31316Dependencies:', 'v31317:', 'v31318:', 'v31322:', 'v31322Dependencies:', 'controls:', 'theme:', 'laser:', 'laserRelease:', 'personalizedLasers:', 'combat:', 'storyNative:', 'storyRoute:', 'heroImages:'])
  assert(diagnostic.includes(field), `startup diagnostics must report ${field}`);
assert(diagnostic.includes('[HAPIL_BOOT_DIAG_RC83]'), 'startup diagnostics must produce a searchable console record');

console.log('RC83 PASS: launch cache is refreshed and laser timeout reports its blocked prerequisite.');
