const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(Number(html.match(/index-v31526\.js\?v=(\d+)/)?.[1]) >= 36405,
  'laser choreography needs a fresh browser cache key');
for (const kind of ['sweep', 'fan-sweep', 'orbit-cross']) {
  assert(source.includes(`'${kind}'`), `${kind} laser pattern is registered`);
}
assert(source.includes("'fan-sweep':'세 갈래 회전 휩쓸기','orbit-cross':'회전 십자 빔'"),
  'the moving patterns have accepted names in the laser scheduler');
assert(source.includes('(major||root?TYPES:TYPES.slice(0,7))'),
  'the new moving laser families are available to major bosses');
assert(source.includes("window.__HAPIL_BLOOD_RC16__.geometry(c,time)"),
  'render and damage geometry must receive the same simulation time');
assert(source.includes('const future=geometry(c,c.fireAt+c.activeSeconds*fraction)'),
  'the warning phase must reveal future laser positions');
assert(source.includes('c.radius*27*angularRate(c)*(s.time-from)'),
  'hit sampling must account for beam movement between simulation frames');
assert(source.includes('const span=Math.max(0,to-from),travel=c.radius*27*angularRate(c)*span'),
  'auto-dodge risk must sample the moving beam path');

const start = source.indexOf(' function geometry(c,time=c.fireAt){');
const end = source.indexOf(' function canStart(s,a){', start);
assert(start > 0 && end > start, 'RC68 animated laser geometry is available');
const clip = (a, b) => {
  let lo = 0, hi = 1;
  for (const [p, d] of [[a.x, b.x - a.x], [a.y, b.y - a.y]]) {
    if (Math.abs(d) < 1e-9) { if (p < 1.1 || p > 30.9) return null; continue; }
    let u = (1.1 - p) / d, v = (30.9 - p) / d;
    if (u > v) [u, v] = [v, u];
    lo = Math.max(lo, u); hi = Math.min(hi, v);
    if (lo > hi) return null;
  }
  return {a: {x: a.x + (b.x - a.x) * lo, y: a.y + (b.y - a.y) * lo},
    b: {x: a.x + (b.x - a.x) * hi, y: a.y + (b.y - a.y) * hi}};
};
const geometry = new Function('window', 'cachedGeometry',
  source.slice(start, end) + '\nreturn geometry;')(
  {__HAPIL_LASERS_V31330__: {clip}}, new WeakMap());
const cast = type => ({id: 8, type, cx: 16, cy: 16, radius: 24,
  width: .55, fireAt: 2, activeSeconds: 1.5});
const coords = lines => lines.map(line => [line.a.x, line.a.y, line.b.x, line.b.y]
  .map(value => Number(value.toFixed(4))));
const withinArena = lines => lines.every(line => [line.a, line.b].every(point =>
  Number.isFinite(point.x) && Number.isFinite(point.y) && point.x >= 1.1 - 1e-6 &&
  point.x <= 30.9 + 1e-6 && point.y >= 1.1 - 1e-6 && point.y <= 30.9 + 1e-6));

for (const kind of ['sweep', 'fan-sweep', 'orbit-cross']) {
  const beam = cast(kind);
  const startPath = geometry(beam, beam.fireAt);
  const midPath = geometry(beam, beam.fireAt + beam.activeSeconds / 2);
  const endPath = geometry(beam, beam.fireAt + beam.activeSeconds);
  assert(withinArena(startPath) && withinArena(midPath) && withinArena(endPath),
    `${kind} path stays clipped to the authored arena`);
  assert.notDeepEqual(coords(startPath), coords(midPath), `${kind} moves during its firing window`);
  assert.notDeepEqual(coords(midPath), coords(endPath), `${kind} continues to move through impact`);
  assert.notStrictEqual(startPath, endPath, `${kind} must not reuse cached static geometry`);
}
assert.equal(geometry(cast('sweep'), 2).length, 1, 'single sweep remains one readable beam');
assert.equal(geometry(cast('fan-sweep'), 2).length, 3, 'fan sweep has three separated beam lanes');
assert.equal(geometry(cast('orbit-cross'), 2).length, 2, 'rotating cross has two beams');

const contactStart = source.indexOf(' function contact(c,a,time){');
const contactEnd = source.indexOf(' function assets(z){', contactStart);
assert(contactStart > 0 && contactEnd > contactStart, 'shared laser contact function is available');
const dist = (p, a, b) => {
  const dx = b.x - a.x, dy = b.y - a.y, ll = dx * dx + dy * dy;
  const t = ll ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / ll)) : 0;
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
};
const contact = new Function('window', 'geometry', 'halfWidth', 'G', 'dist',
  source.slice(contactStart, contactEnd) + '\nreturn contact;')(
  {__HAPIL_COMBAT_V31333__: {core: p => ({x: p.x, y: p.y})},
    __HAPIL_CONTACT_V31336__: {cfg: {bodyRadius: 0}}},
  geometry, c => c.width * 27, (x, y) => ({x, y}), dist);
const beam = cast('sweep');
beam.width = .1;
const startPath = geometry(beam, beam.fireAt)[0];
const pointOnStart = {x: (startPath.a.x + startPath.b.x) * .5 + (startPath.b.x - startPath.a.x) * .32,
  y: (startPath.a.y + startPath.b.y) * .5 + (startPath.b.y - startPath.a.y) * .32};
assert(contact(beam, pointOnStart, beam.fireAt), 'the live visual beam geometry registers contact');
assert(!contact(beam, pointOnStart, beam.fireAt + beam.activeSeconds / 2),
  'the hit path moves with the displayed sweep instead of hitting its stale start line');

const drawStart = source.indexOf(' function draw(ctx,cache,s,c,settings={}){', start);
const drawEnd = source.indexOf(' function descriptor(owner,p){', drawStart);
assert(drawStart > 0 && drawEnd > drawStart, 'the shared bitmap laser renderer is available');
const draw = new Function('window', 'geometry', 'projection', 'MONGSE_queueImage',
  'MONGSE_skillFxOpacity', 'n', 'stats', source.slice(drawStart, drawEnd) + '\nreturn draw;')(
  {__HAPIL_LASERS_V31330__: {halfWidth: c => c.width * 27}}, geometry,
  p => ({x: p.x, y: p.y}), () => ({complete: true, naturalWidth: 120, naturalHeight: 32}),
  () => 1, (value, fallback = 0) => Number.isFinite(value) ? value : fallback,
  {draws: 0, segments: 0});
const canvas = {globalAlpha: 1, strokes: 0, images: 0, save() {}, restore() {}, setLineDash() {},
  beginPath() {}, moveTo() {}, lineTo() {}, stroke() {this.strokes++;}, drawImage() {this.images++;},
  translate() {}, rotate() {}, strokeText() {}, fillText() {}};
const warned = cast('sweep');
assert.equal(draw(canvas, {}, {time: 1}, warned, {showCombatInfo: false}), true);
assert(canvas.strokes >= 6, 'the warning visibly marks the start and future sweep route');
canvas.strokes = 0;
canvas.images = 0;
assert.equal(draw(canvas, {}, {time: 2.75}, warned, {showCombatInfo: false}), true);
assert(canvas.images > 0, 'the moving active laser uses the existing boss beam bitmap');

console.log('RC68 PASS: warned sweep, triple fan sweep, rotating cross, clipped geometry, collision sampling and evasion risk use live beam paths.');
