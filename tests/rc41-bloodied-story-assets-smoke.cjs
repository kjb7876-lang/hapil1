const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const readme = fs.readFileSync(path.join(root, 'assets/generated-v31342-rc39/README_KO.md'), 'utf8');
const assets = [
  'assets/generated-v31342-rc39/axe_projectile_bloodied.webp',
  'assets/generated-v31342-rc39/kitchen_knife_projectile_bloodied.webp',
  'assets/generated-v31342-rc39/golden_treasure_projectile_bloodied.webp',
  'assets/generated-v31342-rc39/paper_money_projectile_bloodied.webp',
  'assets/generated-v31342-rc39/dirty_tissue_projectile_bloodied.webp',
  'assets/generated-v31342-rc39/poison_syringe_volley_bloodied.webp',
  'assets/generated-v31342-rc39/truck_projectile_bloodied.webp',
  'assets/generated-v31342-rc39/car_projectile_bloodied.webp',
  'assets/props/v31342/hwando-ego-defense-tower-bloodied.webp',
  'assets/episode1b/generated-v31342-rc39/zombie_guardian_knight_bloodied.webp',
  'assets/cult-v3123/generated-v31342-rc39/blindfold_modern_cultist_bloodied.webp',
  'assets/cult-v3123/generated-v31342-rc39/earcovered_modern_cultist_bloodied.webp',
  'assets/episode1a/generated-v31342-rc39/gargoyle_mob_bloodied.webp',
  'assets/episode1a/generated-v31342-rc39/goat_head_demon_mob_bloodied.webp',
];

for (const relative of assets) {
  const file = fs.readFileSync(path.join(root, relative));
  assert.equal(file.toString('ascii', 0, 4), 'RIFF', `${relative} must be a WebP RIFF file`);
  assert.equal(file.toString('ascii', 8, 12), 'WEBP', `${relative} must have a WebP signature`);
  assert.ok(file.length >= 30 && file.toString('ascii', 12, 16) === 'VP8X', `${relative} must contain a valid extended WebP header`);
  assert.ok((file[20] & 0x10) !== 0, `${relative} must preserve alpha transparency`);
  assert.ok(file.length > 20_000, `${relative} must not be empty or truncated`);
  assert.ok(bundle.includes(`./${relative.replace(/^assets\//, 'assets/')}`), `${relative} must be registered in the game bundle`);
}

function pngDimensions(relative) {
  const file = fs.readFileSync(path.join(root, relative));
  assert.equal(file.toString('ascii', 1, 4), 'PNG', `${relative} must be PNG`);
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
}

function webpDimensions(relative) {
  const file = fs.readFileSync(path.join(root, relative));
  assert.equal(file.toString('ascii', 0, 4), 'RIFF', `${relative} must be RIFF`);
  assert.equal(file.toString('ascii', 8, 12), 'WEBP', `${relative} must be WebP`);
  assert.equal(file.toString('ascii', 12, 16), 'VP8X', `${relative} must carry explicit WebP dimensions`);
  assert.ok((file[20] & 0x10) !== 0, `${relative} must retain an alpha channel`);
  return { width: file.readUIntLE(24, 3) + 1, height: file.readUIntLE(27, 3) + 1 };
}

const sourcePairs = [
  ['assets/generated-v31342-rc39/axe_projectile.png', 'assets/generated-v31342-rc39/axe_projectile_bloodied.webp'],
  ['assets/generated-v31342-rc39/kitchen_knife_projectile.png', 'assets/generated-v31342-rc39/kitchen_knife_projectile_bloodied.webp'],
  ['assets/generated-v31342-rc39/golden_treasure_projectile.png', 'assets/generated-v31342-rc39/golden_treasure_projectile_bloodied.webp'],
  ['assets/generated-v31342-rc39/paper_money_projectile.png', 'assets/generated-v31342-rc39/paper_money_projectile_bloodied.webp'],
  ['assets/generated-v31342-rc39/dirty_tissue_projectile.png', 'assets/generated-v31342-rc39/dirty_tissue_projectile_bloodied.webp'],
  ['assets/generated-v31342-rc39/poison_syringe_volley.png', 'assets/generated-v31342-rc39/poison_syringe_volley_bloodied.webp'],
  ['assets/generated-v31342-rc39/truck_projectile.png', 'assets/generated-v31342-rc39/truck_projectile_bloodied.webp'],
  ['assets/generated-v31342-rc39/car_projectile.png', 'assets/generated-v31342-rc39/car_projectile_bloodied.webp'],
  ['assets/generated-v31342-rc39/hwando_ego_defense_tower.png', 'assets/props/v31342/hwando-ego-defense-tower-bloodied.webp'],
  ['assets/generated-v31342-rc39/zombie_guardian_knight.png', 'assets/episode1b/generated-v31342-rc39/zombie_guardian_knight_bloodied.webp'],
  ['assets/generated-v31342-rc39/blindfold_modern_cultist.png', 'assets/cult-v3123/generated-v31342-rc39/blindfold_modern_cultist_bloodied.webp'],
  ['assets/generated-v31342-rc39/earcovered_modern_cultist.png', 'assets/cult-v3123/generated-v31342-rc39/earcovered_modern_cultist_bloodied.webp'],
  ['assets/generated-v31342-rc39/gargoyle_mob.png', 'assets/episode1a/generated-v31342-rc39/gargoyle_mob_bloodied.webp'],
  ['assets/generated-v31342-rc39/goat_head_demon_mob.png', 'assets/episode1a/generated-v31342-rc39/goat_head_demon_mob_bloodied.webp'],
];
for (const [source, variant] of sourcePairs) {
  const png = pngDimensions(source);
  const webp = webpDimensions(variant);
  assert.equal(png.width * webp.height, png.height * webp.width, `${source} bloodied variant must preserve the original aspect ratio`);
}

for (const id of ['mb-dist03', 'b02-boss', 'b04-boss', 'b06-boss', 'mb-ep1a09', 'mb-murder01', 'mb-murder02']) {
  assert.ok(bundle.includes(`"${id}"`), `missing narrative boss route ${id}`);
}
for (const id of ['dist02-h1', 'dist05-c1', 'b08-c1', 'c101-e1', 'c101-e2']) {
  assert.ok(bundle.includes(`"${id}"`), `missing narrative enemy placement ${id}`);
}
assert.ok(bundle.includes('V.egoDefenseTower='), 'EGO tower must be registered as a prop');
assert.ok(bundle.includes('HAPIL_bloodiedStoryManifestRC41'), 'actor art must be included in the zone asset manifest');
assert.ok(bundle.includes('HAPIL_bloodiedStoryActorRC41'), 'actor art must be selected by the enemy renderer');
assert.ok(readme.includes('assets/props/v31342/hwando-ego-defense-tower-bloodied.webp'), 'README must use the real EGO tower asset path');
assert.ok(!readme.includes('hwando_ego_defense_tower_bloodied.webp'), 'README must not mention the nonexistent underscore filename');
assert.match(html, /index-v31526\.js\?v=34201/, 'main bundle cache key must be bumped');

console.log(`RC41 bloodied story asset smoke passed (${assets.length} WebP assets, 7 boss routes, 5 enemy placements).`);
