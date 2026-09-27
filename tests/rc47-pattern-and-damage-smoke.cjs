const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(html.includes('./assets/rc47/combat-expansion.js?v=34701'));
assert(Number(html.match(/\.\/assets\/index-v31526\.js\?v=(\d+)/)?.[1]) >= 34701);

const client = {coarse: false, effects: [], floatTexts: [], fxSerial: 1};
const context = {window: {matchMedia: () => ({matches: client.coarse})}, module: {exports: {}}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/rc47/combat-expansion.js'), 'utf8'), context);
const rc = context.module.exports;
assert.equal(rc.projectileCap(), Infinity, 'PC must not have a runtime projectile cap');
assert.equal(rc.barrageCap(), Infinity);
client.coarse = true;
assert.equal(rc.projectileCap(), 72, 'coarse mobile keeps its projectile budget');
assert.equal(rc.barrageCap(), 48);
client.coarse = false;

const actor = {x: 16, y: 16, hp: 100};
const state = {time: 3, effects: [], floatTexts: [], fxSerial: 1};
assert.equal(rc.absorbed(state, actor, {damage: 10, originX: 12, originY: 16}), true);
assert.equal(state.effects.length, 1);
assert.equal(state.effects[0].originX, 12);
assert.equal(rc.absorbed(state, actor, {damage: 10}), false, 'block feedback is throttled');
assert.equal(rc.absorbed(state, actor, {damage: 0}), false, 'cosmetic art is not a hit');
state.time += .2;
assert(rc.absorbed(state, actor, {damage: 10, originX: 0, originY: 0, vx: 3, vy: 0}));
assert.equal(state.effects[1].originX, 13, 'projectile shield faces the arriving bullet');
const canvas = {globalAlpha: 1, save() {}, restore() {}, translate() {}, rotate() {},
  beginPath() {}, arc() {this.arcs = (this.arcs ?? 0) + 1;}, stroke() {}, moveTo() {}, lineTo() {}};
assert.equal(rc.drawGold(canvas, state.effects[0], 3.1, {}, (x,y)=>({x,y})), true);
assert(canvas.arcs >= 2, 'an absorbed hit draws a directional gold shield');

// Execute the shipped geometry function itself, with the same clip contract.
const start = source.indexOf(' function geometry(c){if(cachedGeometry.has(c))');
const end = source.indexOf(' function canStart(s,a){', start);
assert(start > 0 && end > start);
const clip = (a,b) => {
  let lo = 0, hi = 1;
  for (const [p,d] of [[a.x,b.x-a.x],[a.y,b.y-a.y]]) {
    if (Math.abs(d) < 1e-9) {if (p < 1.4 || p > 30.6) return null; continue;}
    let u = (1.4-p)/d,v = (30.6-p)/d;
    if (u > v) [u,v] = [v,u];
    lo = Math.max(lo,u); hi = Math.min(hi,v);
    if (lo > hi) return null;
  }
  return {a:{x:a.x+(b.x-a.x)*lo,y:a.y+(b.y-a.y)*lo},
    b:{x:a.x+(b.x-a.x)*hi,y:a.y+(b.y-a.y)*hi}};
};
const geometry = new Function('window','cachedGeometry', source.slice(start,end) + '\nreturn geometry;')(
  {__HAPIL_LASERS_V31330__: {clip}}, new WeakMap());
for (const [type,minSegments] of [['hexagram',12],['death',9],['sixsixsix',30],['cataclysm',18]]) {
  const lines = geometry({type, cx:16, cy:16, radius:24, width:.5});
  assert(lines.length >= minSegments, `${type} needs a complex shared warning/hit shape`);
  assert(lines.every(l => l.a.x >= 1.4 && l.a.x <= 30.6 && l.b.y <= 30.6));
}
const field = geometry({type:'cataclysm',cx:16,cy:16,radius:24,width:.5});
const point = p => ({x:(p.x-p.y)*27,y:(p.x+p.y)*13.5});
const dist = (p,a,b) => {const dx=b.x-a.x,dy=b.y-a.y,ll=dx*dx+dy*dy;
  const u=ll?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/ll)):0;
  return Math.hypot(p.x-a.x-u*dx,p.y-a.y-u*dy);};
const samples=[];
for(let x=1.65;x<30.6;x+=.65)for(let y=1.65;y<30.6;y+=.65)
  samples.push(Math.min(...field.map(l=>dist(point({x,y}),point(l.a),point(l.b)))));
samples.sort((a,b)=>a-b);
const threshold=samples[Math.floor(samples.length*.99)];
const width=Math.max(.5,Math.min(12,(threshold-16)/27));
const coverage=samples.filter(d=>d<=width*27+16+1e-7).length/samples.length;
assert(coverage>=.99, `near full arena field covers ${(coverage*100).toFixed(1)}%`);

assert(source.includes('if(hit){if(rec){rec.at=s.time;rec.count++;}'),
  'laser rehit history must change only after accepted damage');
assert(source.includes("window.__HAPIL_COMBAT_RC47__?.absorbed(e,e,i,n,r)"));
const collisionContext = {window: {__HAPIL_COMBAT_V31333__: {
  core: a=>({x:a.x,y:a.y}), frozen:()=>false, piercing:()=>false,
}, __HAPIL_PARTY_V31322__: null}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/combat-v31402/contact-geometry.js'), 'utf8'), collisionContext);
const hitState={x:0,y:0,hp:100,zone:'test',time:1,activeHeroId:'777'};
collisionContext.window.__HAPIL_PARTY_V31322__={state:hitState,actors:[]};
const contact=collisionContext.window.__HAPIL_GEOMETRY_V31402__.create({
  project:(x,y)=>({x,y}),heroes:()=>[],combat:{captureEvidence() {}}
});
const shot={x:40,y:0,previousX:40,previousY:0,radius:.3,boss:true,sprite:'boss.webp'};
assert(contact.projectile(hitState,hitState,shot).hit,
  'touching the rendered boss weapon must be a swept projectile hit');
assert(!contact.projectile(hitState,hitState,{...shot,sprite:null}).hit,
  'an invisible sprite does not gain a bitmap sized hitbox');
console.log('RC47: desktop/mobile budgets, complex lasers, 99% field, and directional block feedback OK');
