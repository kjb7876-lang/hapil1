const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const flight = require('../assets/rc43/bloodied-flight.js');

const root = path.resolve(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(html.indexOf('rc43/bloodied-flight.js') < html.indexOf('index-v31526.js'));
assert.match(bundle, /HAPIL_bloodiedFlightTransitRC43/);
assert.match(bundle, /flight\.assetFor\(s,e\)/);
assert.match(bundle, /e\.sprite\?\?profile\.sprite/);
assert.doesNotMatch(bundle, /CATALOG\.mobs\[actorPath\]=\{\.\.\.row,sprite:asset\}/);

// Exercise the real render binding from the shipped bundle: only moving bodies
// acquire the new image; cast decals and enemy actor sprites keep their art.
const bindStart = bundle.indexOf('function bind(e,s=state){');
const bindEnd = bundle.indexOf('\nreturn e;}', bindStart);
assert.ok(bindStart > 0 && bindEnd > bindStart);
const bindSource = bundle.slice(bindStart, bindEnd + '\nreturn e;}'.length);
const profile = {sprite: 'actor.webp', bloodiedProjectileV31342: 'flying.webp',
  bloodiedProjectileZoneV31342: 'ep1b06', family: 'blood'};
let ownerRow = {id: 'b06-boss', color: '#fff', accent: '#aaa', assets: ['old.webp']};
const bind = vm.runInNewContext(`${bindSource}\nbind`, {
  window: {__HAPIL_EXIT_V31327__: {capture() {}}, __HAPIL_BLOODIED_FLIGHT_RC43__: flight},
  state: {zone: 'ep1b06'}, allied: () => false, owner: () => ownerRow,
  mapAsset: (_row, asset) => asset ?? 'old.webp', metrics: {bound: 0},
  mobProfile: () => profile, actorOf: () => ({}), families: {blood: {color: '#f00'}}
});
const bossShot = bind({sourceId: 'b06-boss', id: 3, vx: 2, vy: 0, sprite: 'old.webp'}, {zone: 'ep1b06'});
assert.match(bossShot.sprite, /golden_treasure_projectile_bloodied\.webp$/);
const castDecal = bind({sourceId: 'b06-boss', kind: 'mark', sprite: 'old.webp'}, {zone: 'ep1b06'});
assert.equal(castDecal.sprite, 'old.webp');
ownerRow = null;
const mobShot = bind({sourceId: 'mob', kind: 'projectile', vx: 2, vy: 0}, {zone: 'ep1b06'});
assert.equal(mobShot.sprite, 'flying.webp');
const mobCast = bind({sourceId: 'mob', kind: 'enemyAttack'}, {zone: 'ep1b06'});
assert.equal(mobCast.sprite, 'actor.webp');

let count = 0;
for (const [sourceId, route] of Object.entries(flight.routes)) {
  for (let i = 0; i < route.assets.length; i++) {
    const asset = flight.assetFor({zone: route.zone}, {sourceId, id: i});
    assert.equal(asset, `./assets/generated-v31342-rc39/${route.assets[i]}`);
    assert.ok(fs.existsSync(path.join(root, asset)), `${asset} missing`);
    const image = fs.readFileSync(path.join(root, asset));
    assert.equal(image.toString('ascii', 0, 4), 'RIFF');
    count++;
  }
  assert.equal(flight.assetFor({zone: 'unrelated'}, {sourceId, id: 0}), null);
}
assert.equal(count, 8);

const state = {zone: 'ep1b06', time: 10};
const hit = {id: 3, sourceId: 'b06-boss', impactAt: 10.4, damage: 27};
const effect = {bossImpactTransitV31232: true, x: 4, y: 8, tx: 16, ty: 8,
  born: 10, duration: .4, sprite: 'original', spriteHeading: 0};
assert.equal(flight.prepareTransit(state, hit, effect), true);
assert.equal(effect.duration, 1.5);
assert.equal(hit.impactAt, 11.5);
assert.equal(hit.transitImpactAtV31232, hit.impactAt);
assert.equal(hit.damage, 27, 'the existing impact queue must retain damage ownership');
assert.match(effect.sprite, /golden_treasure_projectile_bloodied\.webp$/);
const project = (x, y) => ({x: x * 10, y: y * 10});
const first = flight.pose(effect, 10, project), middle = flight.pose(effect, 10.75, project), last = flight.pose(effect, 11.5, project);
assert.deepEqual([first.x, middle.x, last.x], [40, 100, 160]);
assert.deepEqual([first.progress, middle.progress, last.progress], [0, .5, 1]);

const drawings = [];
const ctx = {globalAlpha: 1, save() {}, restore() {}, translate(x, y) {drawings.push([x, y]);},
  rotate() {}, drawImage() {drawings.push('bitmap');}};
const deps = {project, opacity: () => 1, queue: () => ({complete: true, naturalWidth: 512, naturalHeight: 256})};
assert.equal(flight.draw(ctx, {}, effect, 10.75, {}, deps), true);
assert.deepEqual(drawings[0], [100, 62]);
assert.equal(drawings[1], 'bitmap');
assert.equal(flight.draw(ctx, {}, effect, 11.5, {}, deps), true);
assert.equal(drawings.length, 2, 'the bitmap retires after reaching the committed hit');

const unrelated = {bossImpactTransitV31232: true, x: 4, y: 8, tx: 16, ty: 8, duration: .4};
assert.equal(flight.prepareTransit(state, {sourceId: 'other', id: 1}, unrelated), false);
assert.equal(unrelated.duration, .4);
console.log(`RC43: ${count} assets, timed flight, bitmap motion, existing damage and unrelated-route isolation OK`);
