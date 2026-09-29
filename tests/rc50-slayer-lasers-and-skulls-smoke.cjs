const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const slice = (start, end) => {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `missing game route ${start}`);
  return source.slice(a, b);
};

assert(Number(html.match(/index-v31526\.js\?v=(\d+)/)?.[1]) >= 36301,
  'modified bundle must bypass the previous HTML cache');
const poseRoute = slice('/* HAPIL FINAL RC5: canonical', '/* HAPIL FINAL RC6:');
let imagePath = '', draws = 0, legacy = 0;
const newImage = {complete: true, naturalWidth: 1774, naturalHeight: 887};
const route = new Function('window', 'MONGSE_queueImage', 'G', 'HAPIL_RC13_RENDER',
  'MONGSE_zoneAssetManifest', 'MONGSE_liveCriticalAssets31220',
  'MONGSE_addHeroAssets31220', 'MONGSE_zoneAssetPlan31220', 'setTimeout',
  `let An = o => o, Ln = () => { legacy++; }; let legacy = 0;
   ${poseRoute}
   return {options: An, actor: Ln, api: window.__HAPIL_HERO_CONSISTENCY_RC5__, legacy: () => legacy};`)(
    {__HAPIL_AUTHORED_MOTION_RC4__: {installed: true, direction: m => m.direction},
      __HAPIL_HERO_STYLE_V31364__: {installed: true}},
    (_cache, p) => {imagePath = p; return newImage;},
    (x, y) => ({x: 27 * (x-y), y: 13.5 * (x+y)}),
    {state: () => null, hero: () => false},
    () => new Set(), () => new Set(), set => set,
    () => ({all: new Set(), A: new Set(), B: new Set(), C: new Set(), pins: new Set()}),
    () => {throw Error('RC5 dependencies did not install');});
const motion = {kind: 'attack', direction: 'front', dx: 1, dy: 1, started: 1, until: 1.38};
const selection = route.options({authoredTimeV31345: 1.13}, {id: 'slayer'}, motion, 'old.png');
assert.equal(selection.canonicalHeroRC5.sheet, 'action');
const ctx = {globalAlpha: 1, save() {}, restore() {}, translate() {},
  beginPath(){},rect(){},clip(){},drawImage() {draws++;}};
route.actor(ctx, {}, 'old.png', 12, 13, 66, selection);
assert.equal(draws, 1, 'the real option/draw wrappers must render the down cleave');
assert.equal(route.legacy(), 0, 'the old action atlas must not cover this strike');
assert(imagePath.endsWith('slayer-action-atlas.png'));
assert(route.api.sheets.slayer.action.endsWith('slayer-action-atlas.png'));
const muzzleCode = slice('function MONGSE_resolveHeroMuzzle31213(', 'function MONGSE_gunnerDashMuzzle(');
const origin = new Function('MONGSE_HERO_MUZZLE_PROFILES31213',
  'MONGSE_HERO_MUZZLE_ACTION_NUDGES31213', 'G', muzzleCode + '\nreturn MONGSE_applyProjectileOrigin;')(
    {slayer: {front: [19, -45], right: [62, -47],
      A: {front: [0, -8]}}}, {A: {reach: 0, lift: 0}},
    (x, y) => ({x: 27 * (x-y), y: 13.5 * (x+y)}));
const diagonalDown = origin({kind: 'projectile', x: 0, y: 0, tx: 1, ty: .5},
  'slayer', 'right', 'A');
assert.deepEqual([diagonalDown.startOffsetX, diagonalDown.startOffsetY], [62, -47],
  'projectile origin respects the committed sprite direction');
assert.equal(diagonalDown.heroMuzzleDirection31213, 'right');
const pureSide = origin({kind: 'projectile', x: 0, y: 0, tx: 1, ty: -1},
  'slayer', 'right', 'A');
assert.deepEqual([pureSide.startOffsetX, pureSide.startOffsetY], [62, -47],
  'side attacks retain their side muzzle');

const partyLaser = slice('  function drawLaser(ctx,e,time,settings){', '  function exportSnapshot()');
const beamImage = {complete: true, naturalWidth: 256, naturalHeight: 96};
const asset = './assets/vfx/heroes/gunner-laser-bullet.webp';
const party = new Function('bridge', 'MONGSE_queueImage', 'MONGSE_GUNNER_LASER',
  'G', 'MONGSE_skillFxOpacity', partyLaser + '\nreturn drawLaser;')(
    {cache: {}}, (_cache, p) => {assert.equal(p, asset); return beamImage;}, asset,
    (x, y) => ({x: 27 * (x-y), y: 13.5 * (x+y)}), () => 1);
let strokes = 0, images = 0;
const context = {globalAlpha: 1, save() {}, restore() {}, translate() {}, rotate() {},
  stroke() {strokes++;}, drawImage() {images++;}};
const effect = {partyLaserV31322: true, born: 1, duration: .3,
  partyStartV31322: {x: 12, y: 12}, partyTargetV31322: {x: 13, y: 14}};
assert.equal(party(context, effect, 1.1, {}), true);
assert.equal(images, 1, 'party laser uses its authored bitmap');
assert.equal(strokes, 0, 'no extra blue-white canvas beam accompanies the boss beam');

const straight = slice('  function MONGSE_drawStraightGunnerLaser31225(', '  Gn = function MONGSE_drawEffect31225(');
const renderer = new Function('MONGSE_computeStraightLaserFrame31225', 'MONGSE_skillFxOpacity',
  'MONGSE_queueImage', 'MONGSE_GUNNER_LASER', straight + '\nreturn MONGSE_drawStraightGunnerLaser31225;')(
    () => ({progress: .4, x: 18, y: 20, angle: .3}), () => 1,
    () => beamImage, asset);
renderer(context, {}, {sprite: asset}, 1.1, {});
assert.equal(images, 2);
assert.equal(strokes, 0, 'straight gunner shot cannot paint an image-free cyan line');
const generic = slice('    if (n.laserShot) {', '    if (!n.imageOnly)');
assert(generic.includes('MONGSE_queueImage(t, n.sprite ?? MONGSE_GUNNER_LASER'));
assert(!generic.includes('e.stroke()') && !generic.includes('e.fillRect('));

for (const [name, dims] of [
  ['infernal-skull-clean.png', [1254, 1254]],
  ['demon-skull-cast-clean.png', [1450, 1085]],
]) {
  const image = fs.readFileSync(path.join(root, 'assets/vfx/rc50', name));
  assert.equal(image.toString('hex', 0, 8), '89504e470d0a1a0a');
  assert.deepEqual([image.readUInt32BE(16), image.readUInt32BE(20)], dims);
  assert.equal(image[25], 6, 'the boss skull must have RGBA transparency');
  assert(source.includes('assets/vfx/rc50/' + name), 'the transparent artwork is actually referenced');
}
assert(source.includes('demonSkull: `${De}assets/vfx/rc50/demon-skull-cast-clean.png`'));
console.log('RC50: real Slayer draw route, bitmap-only auxiliary lasers, and two transparent skull routes OK');
