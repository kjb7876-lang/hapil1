const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const apiSource = read('assets/rc46/incoming-hit-art.js');
const page = {window: {}};
vm.runInNewContext(apiSource, {window: page.window, Math, Number, Object, Set, String});
const art = page.window.__HAPIL_INCOMING_HIT_ART_RC46__;
assert(art && art.version === 'RC46');
assert.equal(art.swords.length, 3, 'three distinct sword projectiles are registered');
assert.deepEqual(Object.keys(art.impacts).sort(), ['bite', 'blade', 'blood', 'blunt', 'claw']);

const styles = new Set();
for (let i = 0; i < 18; i++) {
  const projectile = {id: `wave-${i}`, sourceId: 'l301-boss', x: 0, y: 0, vx: 1, vy: 0};
  const sprite = art.bindProjectile(projectile);
  assert(art.swords.includes(sprite));
  assert.equal(projectile.sprite, sprite);
  assert.equal(projectile.fallbackSprite, sprite);
  assert.equal(projectile.imageOnly, true);
  assert.equal(projectile.swordHiltProjectileRC46, true);
  assert(Math.abs(projectile.spriteHeading + Math.PI / 4) < 1e-12);
  styles.add(sprite);
}
assert.equal(styles.size, 3, 'successive boss shots cycle among the three sword artworks');

const untouched = {id: 'ally-shot', sourceId: 'hwando', sprite: 'ally.webp'};
assert.equal(art.bindProjectile(untouched), null);
assert.equal(untouched.sprite, 'ally.webp', 'hero projectiles keep their existing artwork');
const reflected = {id: 'reflection', sourceId: 'l301-boss', echoBoltV31368: true, sprite: 'echo.webp'};
assert.equal(art.bindProjectile(reflected), null);
assert.equal(reflected.sprite, 'echo.webp', 'reflected shots keep their reflected artwork');

function hit(source, enemy) {
  const state = {time: 12, fxSerial: 40, enemies: [enemy], effects: []};
  const hero = {x: 4.5, y: 8.25, hp: 91};
  assert.equal(art.onPlayerDamage(state, hero, source, 7), true);
  assert.equal(hero.hp, 91, 'visual feedback does not alter the damage amount');
  return state.effects;
}

const ranged = hit({id: 'shot-1', sourceId: 'mb-ep1b07'}, {id: 'mb-ep1b07', name: 'Flame Knight'});
assert.equal(ranged.length, 1, 'ranged hits receive only the small blood splash');
assert.equal(ranged[0].hitArtCategoryRC46, 'blood');
assert.equal(ranged[0].hitArtSizeRC46, 43);
assert(ranged[0].hitArtOpacityRC46 < 0.7, 'blood sprite is kept subtle');
assert.deepEqual([ranged[0].x, ranged[0].y, ranged[0].tx, ranged[0].ty], [4.5, 8.25, 4.5, 8.25]);
assert.equal(ranged[0].imageOnly, true);

const directMeleeCases = [
  ['mb-ep1b07', 'Hotel Flame Knight', 'blade'],
  ['heavy-golem', 'Vault Guardian', 'blunt'],
  ['wolf-devourer', 'Fang Devourer', 'bite'],
  ['dist-spider', 'Blood Spider', 'claw'],
];
for (const [sourceId, name, category] of directMeleeCases) {
  const effects = hit({id: `melee:${sourceId}:13`, sourceId}, {id: sourceId, name});
  assert.deepEqual(effects.map(effect => effect.hitArtCategoryRC46), ['blood', category]);
  assert(effects.every(effect => effect.incomingHitVisualRC46 && effect.duration < 0.3));
}
assert.equal(art.onPlayerDamage({effects: []}, {x: 1, y: 2}, {sourceId: 'x'}, 0), false,
  'zero-damage/invulnerable contacts do not emit fake hit feedback');

const html = read('index.html');
const controls = read('assets/rc15/hero-controls.js');
const main = read('assets/index-v31526.js');
assert(html.indexOf('incoming-hit-art.js?v=34601') < html.search(/index-v31526\.js\?v=\d+/));
assert(html.includes('hero-controls.js?v=39601'));
assert(controls.includes('window.__HAPIL_INCOMING_HIT_ART_RC46__?.onPlayerDamage(s,a,source,loss)'));
assert(main.includes('HAPIL_bindSwordProjectileRC46'));
assert(main.includes('n.hitArtRC46 && Number.isFinite(n.hitArtSizeRC46)'));
assert(main.includes('else if (_ && g && !n.hitArtRC46)'));
assert(main.includes("kind==='skill'&&!e.hitArtRC46"), 'the small hit sprites must not be enlarged by the skill-art pass');
assert(main.includes('HAPIL_incomingHitCriticalAssetsRC46'));
for (const asset of art.assets) {
  const local = path.join(root, asset.replace(/^\.\//, ''));
  assert(fs.statSync(local).size > 1000, `${asset} exists and is non-empty`);
}

console.log('PASS: three hostile sword projectile styles, four melee-only hit variants, restrained blood feedback, asset preloading, and combat-render integration.');
