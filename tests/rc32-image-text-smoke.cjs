const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const plugin = fs.readFileSync(path.join(root, 'assets/rc32/boss-and-mobile.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assert(html.includes('./assets/rc32/boss-and-mobile.js?v=33201'), 'RC32 runtime is not loaded');
for (const file of [
  'data/INTERLUDE_FINAL_KO.txt',
  'assets/rc26/story.js',
]) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  assert(!content.includes('그들을 ID(이드)'), file + ' still has the opening typo');
  assert(content.includes('그들은 ID(이드)'), file + ' is missing the corrected opening line');
}

const registryMatch = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8')
  .match(/types=Object\.keys\(labels\),owners=(\[.*?\]);for\(const r of owners/);
assert(registryMatch, 'boss laser owner list missing');
const owners = JSON.parse(registryMatch[1]);
const textNode = {nodeType: 3, nodeValue: '그들을 ID(이드)라고 한다.'};
const documentRoot = {nodeType: 1, tagName: 'HTML', childNodes: [textNode]};
class FakeImage {
  set src(value) {
    this._src = value;
    this.complete = true;
    this.naturalWidth = 512;
    this.naturalHeight = 512;
    this.onload?.();
  }
  get src() { return this._src; }
}
class FakeTextCanvas {
  fillText(value) { this.value = value; }
  strokeText(value) { this.strokeValue = value; }
}
const context = {
  __HAPIL_LASERS_V31330__: {installed: true, owners, tick() {}, draw(renderCtx) {
    renderCtx.globalCompositeOperation = 'lighter';
    renderCtx.drawImage({naturalHeight: 144}, 0, 54, 768, 36, 0, -20, 500, 40);
  }},
  __HAPIL_BLOOD_RC16__: {draw() { return true; }},
  __HAPIL_MOBILE_V31366__: {enabled: () => false},
  __HAPIL_CHANNEL_V31364__: {active: () => context.guarded === true},
  __HAPIL_COMBAT_V31333__: {core: p => ({x: p.x * 27, y: p.y * 13.5})},
  __HAPIL_PARTY_V31322__: null,
  __HAPIL_STORY_DATA_V31300__: Object.freeze({prologue: '그들을 ID(이드)라고 한다.'}),
  Image: FakeImage,
  CanvasRenderingContext2D: FakeTextCanvas,
  document: {baseURI: 'https://example.test/hapil1/', documentElement: documentRoot},
  MutationObserver: class { observe() {} },
};
const window = context;
const runtime = vm.createContext({window, URL, setTimeout() {},});
vm.runInContext(plugin, runtime);

assert.equal(window.__HAPIL_RC32__.customBossBeams, 28);
assert.equal(window.__HAPIL_RC32__.fixText('그리고 그들을 ID(이드)라고 한다.'), '그리고 그들은 ID(이드)라고 한다.');
assert.equal(textNode.nodeValue, '그들은 ID(이드)라고 한다.', 'visible opening text was not corrected');
assert.equal(window.__HAPIL_STORY_DATA_V31300__.prologue, '그들은 ID(이드)라고 한다.', 'loaded story data was not corrected');
const canvas = new window.CanvasRenderingContext2D();
canvas.fillText('그들을 이드라고 한다.', 0, 0);
assert.equal(canvas.value, '그들은 이드라고 한다.', 'canvas-rendered opening text was not corrected');

const drawContext = {
  globalCompositeOperation: 'source-over', globalAlpha: 1, imageCalls: [], ellipses: [], tx: 0, ty: 0, stack: [],
  save() { this.stack.push([this.tx, this.ty]); }, restore() { [this.tx, this.ty] = this.stack.pop(); }, beginPath() {}, ellipse(x, y) { this.ellipses.push([x + this.tx, y + this.ty]); }, stroke() {}, setLineDash() {}, translate(x, y) { this.tx += x; this.ty += y; }, rotate() {},
  drawImage(image, ...args) { this.imageCalls.push({image, args}); },
};
const state = {time: 1, hp: 100, x: 16, y: 16, moveVx: 0, moveVy: 0, zone: 'ep1b09', fxSerial: 0,
  enemies: [{id: 'b09-boss', name: '사이보그 회장', boss: true, hp: 100}]};
window.__HAPIL_LASERS_V31330__.tick(state, .05);
state.time = state.bossBlackHoleNextRC32['b09-boss'];
window.__HAPIL_LASERS_V31330__.tick(state, .05);
const hole = state.bossBlackHolesRC32[0];
assert(hole && hole.sprite.endsWith('/sinful.webp'), 'seven-sins boss did not select its themed black-hole image');
state.time = hole.fireAt + .05;
window.__HAPIL_LASERS_V31330__.draw(drawContext, {}, state, {});
assert.equal(drawContext.imageCalls.length, 1, 'black hole rendered only its line telegraph, not its image');
assert(drawContext.imageCalls[0].image.src.includes('/assets/vfx/rc32/blackholes/sinful.webp'), 'black-hole image URL is wrong');
assert.equal(window.__HAPIL_RC32__.stats().blackholeImageDraws, 1);
assert.deepEqual(drawContext.ellipses[0], [hole.x * 27, hole.y * 13.5 + 54], 'pull-range marker drifted away from its image');

console.log('PASS: opening-text correction, canvas text patch, and boss-specific black-hole image draw.');
