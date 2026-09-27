const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'assets/rc15/hero-controls.js'), 'utf8');

assert(html.includes('./assets/rc15/hero-controls.js?v=33801'),
  'hero controls must use a fresh cache key for the launch readiness fix');

const window = {
  addEventListener() {},
  __HAPIL_V31327_RELEASE__: undefined,
};
const document = {};
const context = {window, document};
vm.runInNewContext(source, context, {filename: 'hero-controls.js'});

const requiredGetters = [
  'F', 'HAPIL_driveAutoProgressV31301', 'HAPIL_effectiveGrowthV31400', 'J',
  'MONGSE_ASSET_VERSION', 'MONGSE_clearHostileProjectiles31215',
  'MONGSE_combatDistance', 'MONGSE_heroRoleProfile31222',
  'MONGSE_isEncounterLocked31226', 'MONGSE_objectiveDamageAllowedV31309',
  'MONGSE_resetHeroAutoDodge31223', 'MONGSE_writeSave', 'ar', 'hi', 'ir', 'oi',
];
const native = {};
for (const name of requiredGetters) {
  Object.defineProperty(native, name, {
    configurable: true,
    get: () => name === 'MONGSE_ASSET_VERSION' ? 'test' : (() => {}),
    set: name === 'MONGSE_ASSET_VERSION' || name === 'MONGSE_writeSave' || name === 'HAPIL_driveAutoProgressV31301'
      ? () => {}
      : undefined,
  });
}

window.__HAPIL_HERO_CONTROL_FACTORY_V31406__.install(native);
assert.equal(window.__HAPIL_CONTROLS_V31329__?.installed, true,
  'core hero controls stayed blocked when optional exit visuals were not ready');
assert.equal(window.__HAPIL_V31329_RELEASE__?.installed, true,
  'hero launch readiness marker was not published');
assert.equal(window.__HAPIL_V31327_RELEASE__, undefined,
  'test must exercise the missing optional exit-module release');

console.log('PASS: hero controls and launch readiness install without waiting for optional exit visuals.');
