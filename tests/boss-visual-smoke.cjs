const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');

// Every configured boss laser must resolve to that owner's existing artwork.
const ownerList = bundle.match(/types=Object\.keys\(labels\),owners=(\[.*?\]);for\(const r of owners/);
assert(ownerList, 'boss laser owner registry was not found');
const owners = JSON.parse(ownerList[1]);
assert.equal(owners.length, 72, 'unexpected boss and midboss registry size');
assert(bundle.includes("for(const r of owners){if(r.native||r.id==='dist00-boss')continue;r.beam=`./assets/vfx/v31330/${r.id}/beam.webp`;}const byId=new Map"), 'owner laser normalization is missing');
const laserHashes = new Set();
for (const owner of owners) {
  if (!owner.native && owner.id !== 'dist00-boss')
    owner.beam = `./assets/vfx/v31330/${owner.id}/beam.webp`;
  assert.notEqual(owner.beam, './assets/vfx/v31318/cosmic-lucifer-blood-beam.webp', `${owner.id} still uses Lucifer's shared laser`);
  const assetPath = path.join(root, owner.beam.replace(/^\.\//, ''));
  assert(fs.existsSync(assetPath), `${owner.id} laser asset is missing: ${owner.beam}`);
  assert(fs.statSync(assetPath).size > 0, `${owner.id} laser asset is empty`);
  laserHashes.add(crypto.createHash('sha256').update(fs.readFileSync(assetPath)).digest('hex'));
}
assert.equal(new Set(owners.map(owner => owner.beam)).size, owners.length, 'two bosses share the same laser path');
assert.equal(laserHashes.size, owners.length, 'two bosses share identical laser artwork');
assert.equal(owners.find(owner => owner.id === 'dist00-boss').beam, './assets/vfx/v31330/dist00-boss/beam_rc25.png');

// Execute the actual height helpers from the game bundle against boss and minion cases.
function extractFunction(name) {
  const start = bundle.indexOf(`function ${name}(`);
  assert(start >= 0, `missing ${name}`);
  const open = bundle.indexOf('){', start) + 1;
  assert(open > 0, `missing function body for ${name}`);
  let depth = 0;
  for (let i = open; i < bundle.length; i++) {
    if (bundle[i] === '{') depth++;
    if (bundle[i] === '}' && --depth === 0) return bundle.slice(start, i + 1);
  }
  throw new Error(`unterminated ${name}`);
}
const context = vm.createContext({
  Ge: (_kind, boss, midboss, _elite, scale) => (boss ? 280 : midboss ? 180 : 100) * (Number(scale) || 1),
  MONGSE_phaseScale: actor => actor.phaseScale ?? 1,
  limit: (value, low, high) => Math.max(low, Math.min(high, value)),
  n: (value, fallback = 0) => Number.isFinite(value) ? value : fallback,
});
vm.runInContext([
  extractFunction('bossDrawHeightV31368'),
  extractFunction('childDrawSizeV31368'),
  extractFunction('drawChild'),
].join('\n'), context);
assert(bundle.includes('echoBossImageCloneV31368:art===c.path'), 'boss artwork clones are not tagged at spawn');
assert(bundle.includes('drawChild(c,n,e,t.time,i,t)?'), 'current game state is not passed to clone drawing');

context.clone = { echoBossImageCloneV31368: true, echoOwnerV31368: 'boss-1', echoBossImageHeightV31368: 340, echoFuseV31368: 0 };
context.boss = { id: 'boss-1', boss: true, kind: 'lucifer', scale: 1, phaseScale: 1.25 };
context.state = { enemies: [context.boss] };
assert(Math.abs(vm.runInContext('childDrawSizeV31368(clone, state)', context) - 385) < 1e-9, 'boss image clone must match current boss draw height');
context.boss.phaseScale = 1.4;
assert(Math.abs(vm.runInContext('childDrawSizeV31368(clone, state)', context) - 431.2) < 1e-9, 'boss image clone must follow phase-size changes');
context.rendered = [];
context.G = (x, y) => ({ x, y });
context.image = (...args) => context.rendered.push({ point: args[3], size: args[4] });
context.mockCanvas = { save() {}, restore() {}, fillRect() {}, fillText() {} };
context.visibleClone = { ...context.clone, echoChildV31368: true, sprite: 'boss.webp', hp: 36, maxHp: 36, x: 2, y: 3 };
assert.equal(vm.runInContext('drawChild(mockCanvas, null, visibleClone, 1, {}, state)', context), true);
assert(Math.abs(context.rendered.at(-1).size - 431.2) < 1e-9, 'drawChild must render boss art at the source height');
context.state = { enemies: [] };
assert.equal(vm.runInContext('childDrawSizeV31368(clone, state)', context), 340, 'boss height snapshot must cover a missing parent');
assert.equal(vm.runInContext('childDrawSizeV31368({ echoFuseV31368: 0 }, state)', context), 72, 'ordinary mob echoes must keep their normal size');
assert.equal(vm.runInContext('childDrawSizeV31368({ echoFuseV31368: 1 }, state)', context), 92, 'ordinary fused echoes must keep their normal size');

console.log(`PASS: ${owners.length} unique boss lasers exist; boss echo images render at owner size and ordinary echoes retain their sizes.`);
