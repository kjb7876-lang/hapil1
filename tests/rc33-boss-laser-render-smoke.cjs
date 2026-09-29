const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const plugin = fs.readFileSync(path.join(root, 'assets/rc33/boss-laser-render.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const ids = [
  'dist00-boss', 'dist06-boss', 'a11-boss', 'a11-cosmic-v31318',
  'b02-boss', 'b03-boss', 'b04-boss', 'b05-boss', 'b06-boss',
  'b06b-boss', 'b07-boss', 'b08-boss', 'b09-boss', 'u203-boss',
  'l301-boss', 'l303-boss', 'h103-boss', 'k103-boss', 'c102-boss',
  'c103-boss', 'c104-boss', 'l305-boss', 'kair-great-01',
  'kair-great-02', 'kair-great-03', 'kair-great-04', 'kair-great-05',
  'kair-great-06'
];

assert(html.includes('./assets/rc33/boss-laser-render.js?v=33402'),
  'RC33 beam renderer is not loaded after the older laser patch');
assert(plugin.includes("source.toLowerCase().includes('boss-laser-families/')"),
  'beam renderer does not recognize the new family textures');

for (const family of ['infernal', 'celestial', 'sinful', 'cyber',
  'sloth', 'envy', 'gluttony', 'lust', 'greed', 'wrath', 'pride',
  'balrog', 'cosmic-lucifer', 'kairo', 'last-three', 'u2-memory']) {
  const bytes = fs.readFileSync(path.join(root, 'assets/vfx/rc33/boss-laser-families', family + '.webp'));
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', family + ' laser art is not WebP');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', family + ' laser art header is invalid');
  assert(bytes.length > 50000, family + ' laser art is unexpectedly small');
}

const colors = {
  'dist06-boss': '#ff8b35',
  'b09-boss': '#da4557',
  'a11-cosmic-v31318': '#d34255'
};
const owners = ids.map(id => ({id, beam: './assets/vfx/rc32/boss-lasers/' + id + '.webp',
  assets: [], color: colors[id] || '#c4a8d5'}));
class FakeImage {
  set src(value) {
    this._src = String(value);
    this.complete = true;
    this.naturalWidth = 2172;
    this.naturalHeight = 724;
    this.width = 2172;
    this.height = 724;
    this.onload?.();
  }
  get src() { return this._src; }
  get currentSrc() { return this._src; }
}
class FakeCanvas {
  constructor() {
    this.globalCompositeOperation = 'source-over';
    this.globalAlpha = 1;
    this.filter = 'none';
    this.calls = [];
    this.stack = [];
  }
  drawImage(...args) {
    this.calls.push({
      args,
      operation: this.globalCompositeOperation,
      filter: this.filter,
      source: String(args[0]?.src || '')
    });
  }
  save() { this.stack.push(this.filter); }
  restore() { this.filter = this.stack.pop() || 'none'; }
}

const cache = new Map();
const api = {
  installed: true,
  owners,
  start(actor) {
    return {ownerId: actor.id, sourceId: actor.id,
      beam: './assets/vfx/rc32/boss-lasers/' + actor.id + '.webp',
      fireAt: 2, endAt: 4};
  },
  tick(state) {
    for (const cast of state.laserCasts || []) {
      const owner = owners.find(row => row.id === cast.ownerId);
      if (owner && cast.beam !== owner.beam) cast.invalid = true;
    }
  },
  draw(ctx, imageCache, state) {
    for (const cast of state.laserCasts || []) {
      const owner = owners.find(row => row.id === cast.ownerId);
      assert(owner.assets.includes(cast.beam), 'custom image path is missing from the owner asset whitelist');
      let image = imageCache.get(cast.beam);
      if (!image) {
        image = new FakeImage();
        image.src = new URL(cast.beam, 'https://example.test/hapil1/').href;
        imageCache.set(cast.beam, image);
      }
      ctx.drawImage(image, 0, image.height * 0.29, image.width, image.height * 0.43, 0, -24, 500, 48);
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(image, 0, image.height * 0.38, image.width, image.height * 0.25, 0, -10, 500, 20);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
};
const blood = {
  asset: '',
  draw(ctx) {
    const image = new FakeImage();
    image.src = 'https://example.test/hapil1/assets/vfx/rc32/boss-lasers/a11-cosmic-v31318.webp';
    ctx.drawImage(image, 0, image.height * 0.22, image.width * 0.61, image.height * 0.40, 0, -32, 500, 64);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(image, 0, image.height * 0.38, image.width, image.height * 0.25, 0, -10, 500, 20);
    ctx.globalCompositeOperation = 'source-over';
    return true;
  }
};
const window = {
  __HAPIL_RC32__: {installed: true},
  __HAPIL_LASERS_V31330__: api,
  __HAPIL_BLOOD_RC16__: blood,
  Image: FakeImage,
  CanvasRenderingContext2D: FakeCanvas,
  document: {baseURI: 'https://example.test/hapil1/'}
};
vm.runInNewContext(plugin, {window, URL, setTimeout() {}});

const rc33 = window.__HAPIL_RC33__;
assert.equal(rc33.installed, true);
assert.equal(rc33.ownersRouted, 28, 'every mapped episode and cosmic boss needs a routed beam');
assert.equal(rc33.ownerIds.length, 28);
assert.equal(rc33.familyFor('dist06-boss'), 'balrog');
assert.equal(rc33.familyFor('a11-cosmic-v31318'), 'cosmic-lucifer');
assert.equal(rc33.familyFor('c103-boss'), 'cyber');
assert.equal(rc33.familyFor('b02-boss'), 'sloth');
assert.equal(rc33.familyFor('b03-boss'), 'envy');
assert.equal(rc33.familyFor('b04-boss'), 'gluttony');
assert.equal(rc33.familyFor('b05-boss'), 'lust');
assert.equal(rc33.familyFor('b06-boss'), 'greed');
assert.equal(rc33.familyFor('b06b-boss'), 'greed');
assert.equal(rc33.familyFor('b07-boss'), 'wrath');
assert.equal(rc33.familyFor('b08-boss'), 'pride');
assert.equal(rc33.familyFor('b09-boss'), 'pride');
assert.equal(rc33.familyFor('u203-boss'), 'u2-memory');
assert.equal(rc33.familyFor('l301-boss'), 'last-three');
assert.equal(rc33.familyFor('l303-boss'), 'last-three');
assert.equal(rc33.familyFor('l305-boss'), 'last-three');
assert.equal(rc33.familyFor('kair-great-06'), 'kairo');

const live = api.start({id: 'b09-boss'});
live.beam = './assets/vfx/rc32/boss-lasers/b09-boss.webp';
const state = {time: 3, laserCasts: [live]};
api.tick(state, 0.05);
assert.equal(live.beam, rc33.beamPathFor('b09-boss'), 'live cast did not refresh its owner image before validation');
assert.equal(live.invalid, undefined);
const ctx = new FakeCanvas();
api.draw(ctx, cache, state, {});
const mainBeam = ctx.calls.find(call => call.source.includes('#owner=b09-boss'));
assert(mainBeam, 'boss artwork was not sent to canvas.drawImage');
assert.equal(mainBeam.args[1], 0);
assert(Math.abs(mainBeam.args[2] - 724 * .29) < 1e-9 &&
  Math.abs(mainBeam.args[4] - 724 * .43) < 1e-9,
  'owner image replacement must preserve the beam-strip source crop instead of stretching the full family panorama');
assert(mainBeam.filter.includes('hue-rotate('), 'beam did not inherit its boss-specific colour');
assert(!ctx.calls.some(call => call.operation === 'lighter'),
  'the common bright blue core still rendered with the normal laser');

const cosmic = api.start({id: 'a11-cosmic-v31318'});
assert.equal(cosmic.beam, rc33.beamPathFor('a11-cosmic-v31318'));
const bloodCtx = new FakeCanvas();
blood.draw(bloodCtx, cache, {enemies: []}, cosmic, {});
assert(bloodCtx.calls.some(call => call.source.includes('/cosmic-lucifer.webp?v=33402')),
  'cosmic blood renderer did not replace its shared beam with generated art');
assert(!bloodCtx.calls.some(call => call.operation === 'lighter'),
  'common blue core remained in the native cosmic/blood render route');
const unwrappedCtx = new FakeCanvas();
unwrappedCtx.globalCompositeOperation = 'lighter';
const genericBeam = new FakeImage();
genericBeam.src = 'https://example.test/hapil1/assets/vfx/common-blue-beam.webp';
unwrappedCtx.drawImage(genericBeam, 0, genericBeam.height * 0.38,
  genericBeam.width, genericBeam.height * 0.25, 0, -10, 500, 20);
assert.equal(unwrappedCtx.calls.length, 0,
  'shared blue core escaped the global CanvasRenderingContext2D guard');

const stats = rc33.stats();
assert(stats.beamImageReplacements > 0, 'legacy beam pixels were never replaced');
assert(stats.fullArtworkDraws > 0, 'full raster art was never drawn');
assert(stats.blueCoreDrawsSuppressed > 0, 'shared blue additive core was never suppressed');
assert(stats.imageLoadsReady >= 2, 'boss-owned raster files did not preload at cast start');

api.tick({time: 99, laserCasts: []}, 0.05);
for (const id of ['b02-boss', 'b03-boss', 'b04-boss', 'b05-boss', 'b06-boss',
  'b07-boss', 'b08-boss', 'dist06-boss', 'a11-cosmic-v31318', 'kair-great-01',
  'l303-boss', 'u203-boss']) {
  const cast = api.start({id});
  cast.endAt = 0;
  api.tick({time: 1, laserCasts: []}, 0.05);
  assert(rc33.stats().familyImageCacheEntries <= 5,
    'decoded boss beam cache exceeded its mobile memory bound');
}
assert(rc33.stats().imageCacheEvictions > 0,
  'old decoded beam textures were not evicted after boss casts ended');

console.log('PASS: 28 boss routes, 12 bespoke boss beam artworks, bounded decoded image cache, hue tint, cosmic blood replacement, blue-core suppression.');
