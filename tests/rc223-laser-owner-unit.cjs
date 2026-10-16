'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const rc32Source = fs.readFileSync(path.join(root, 'assets/rc32/boss-and-mobile.js'), 'utf8');
const rc33Source = fs.readFileSync(path.join(root, 'assets/rc33/boss-laser-render.js'), 'utf8');
const bundle = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');

function extractFunction(source, marker) {
  const start = source.indexOf(marker);
  assert(start >= 0, `actual source function found: ${marker}`);
  const open = source.indexOf('{', start);
  assert(open >= 0, `function body found: ${marker}`);
  let depth = 0, quote = '', escaped = false, lineComment = false, blockComment = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i], next = source[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return source.slice(start, i + 1).trim();
  }
  throw new Error(`unterminated function in actual source: ${marker}`);
}

const startCustomSource = extractFunction(bundle, 'function startCustom(state, actor, pattern){');
const configureSource = extractFunction(bundle, 'function configure(c,a,profile,s){');
const sizingSource = extractFunction(bundle, 'function sizing(c,profile){');
const validSource = extractFunction(bundle, 'function valid(c,z){');
const tierStart = bundle.indexOf('const tier=c=>ranks.get(c.sourceId)===\'boss\'?\'boss\':\'midboss\';');
assert(tierStart >= 0, 'actual owner rank helper found');
const tierSource = bundle.slice(tierStart, bundle.indexOf(';', tierStart));
assert.match(startCustomSource, /base\.start\(state, actor, profile\.type\)/,
  'actual nested laser producer dynamically calls the shared base API');
assert.match(validSource, /c\.beam===r\.beam/,
  'native receiver guard still requires exact cast/owner beam equality');

class FakeImage {
  set src(value) {
    this._src = String(value);
    this.complete = true;
    this.naturalWidth = this.width = 1000;
    this.naturalHeight = this.height = 400;
    this.onload?.();
  }
  get src() { return this._src; }
  get currentSrc() { return this._src; }
}

function fixture() {
  const owner = {
    id: 'dist06-boss', name: 'Balrog', zone: 'dist06', color: '#ff8b35', accent: '#e6ded0',
    native: false, types: ['plus', 'one'], beam: './assets/vfx/rc32/boss-lasers/dist06-boss.webp',
    tear: './assets/vfx/v31330/dist06-boss/tear.webp', assets: []
  };
  const cosmic = {
    id: 'a11-cosmic-v31318', name: 'Cosmic Lucifer', zone: 'ep1a11', color: '#d34255',
    accent: '#e6ded0', native: true, types: ['slash', 'sun'],
    beam: './assets/vfx/rc32/boss-lasers/a11-cosmic-v31318.webp',
    tear: './assets/vfx/v31330/a11-cosmic-v31318/tear.webp', assets: []
  };
  const customIds = [
    'dist00-boss', 'dist06-boss', 'a11-boss', 'a11-cosmic-v31318',
    'b02-boss', 'b03-boss', 'b04-boss', 'b05-boss', 'b06-boss', 'b06b-boss',
    'b07-boss', 'b08-boss', 'b09-boss', 'u203-boss', 'l301-boss', 'l303-boss',
    'h103-boss', 'k103-boss', 'c102-boss', 'c103-boss', 'c104-boss', 'l305-boss',
    'kair-great-01', 'kair-great-02', 'kair-great-03', 'kair-great-04',
    'kair-great-05', 'kair-great-06'
  ];
  const extras = customIds.filter(id => id !== owner.id && id !== cosmic.id).map(id => ({
    id, name: id, zone: id === 'dist00-boss' ? 'dist00' : 'ep1b02', color: '#c4a8d5',
    accent: '#e6ded0', native: false, beam: `./assets/vfx/rc32/boss-lasers/${id}.webp`,
    tear: `./assets/vfx/v31330/${id}/tear.webp`, assets: []
  }));
  const unknown = { id: 'future-unmapped-owner', beam: './native/future.webp', zone: 'future', assets: [] };
  const owners = [owner, cosmic, ...extras, unknown], byId = new Map(owners.map(row => [row.id, row]));
  const types = ['sweep'];
  const profile = {
    key: 'dist06-boss::blood-rc16::sweep', type: 'sweep', name: 'Balrog blood sweep',
    damage: 18, radius: 6.2, width: .34, activeSeconds: 1.55, windup: 1.7,
    cooldown: 8.5, interval: 2, bloodV31516: true
  };
  const ownerProfiles = new Map([[owner.id, [profile]]]);
  const window = {
    __HAPIL_BOSS_POLICY_RC175__: { validMode: () => true, configure() {} },
    __HAPIL_BOOTLOADER_RC210__: { timingSpec: () => null, timing() {} },
    __HAPIL_COMBAT_FLOW_RC95__: { enabled: () => true, laserReadyAt: (_s, endAt) => endAt + 8.5 },
    __HAPIL_SAMONG_RC91__: { enabled: () => false },
    __HAPIL_LASER_RC22__: { width: () => .8 },
    __HAPIL_ENEMY_V31338__: { laser() {} },
    __HAPIL_LASERS_V31331__: { profiles: ownerProfiles },
    Image: FakeImage,
    document: { baseURI: 'https://game.test/' },
    location: { href: 'https://game.test/' }
  };
  const context = vm.createContext({
    window, URL, setTimeout: () => 0, clearTimeout() {}, console,
    owners, byId, types: ['sweep'], ranks: new Map([[owner.id, 'boss']]),
    NUM: (value, fallback = 0) => Number.isFinite(value) ? value : fallback,
    CL: (value, min, max) => Math.max(min, Math.min(max, Number(value))),
    pi() {}, labels: { sweep: 'sweep' },
    ownerById: new Map([[owner.id, owner]]), ownerProfiles,
    stats: { casts: 0, blocked: 0 }
  });
  vm.runInContext(tierSource, context, { filename: 'assets/index-v31526.js:tier' });
  vm.runInContext(sizingSource, context, { filename: 'assets/index-v31526.js:sizing' });
  vm.runInContext(configureSource, context, { filename: 'assets/index-v31526.js:configure' });
  vm.runInContext(validSource, context, { filename: 'assets/index-v31526.js:valid' });
  const api = {
    version: '3.13.30', installed: true, owners, types, labels: { sweep: 'sweep' },
    tick() {}, draw() {}, configure: context.configure, valid: context.valid,
    start(state, actor, type) {
      const row = byId.get(actor.id);
      const cast = {
        id: state.fxSerial++, sourceId: actor.id, zone: state.zone, type,
        color: row.color, accent: row.accent, beam: row.beam, tear: row.tear,
        cx: 13.3, cy: 18.7, angle: 0, radius: 6.4, width: .32,
        born: state.time, fireAt: state.time + 2.7, endAt: state.time + 3. + .22,
        activeSeconds: 1.1, damage: 15, sourcePhase: 3, contacts: [], lastTick: state.time,
        laserV31330: true
      };
      context.configure(cast, actor, null, state);
      state.bossLaserCastsV31330.push(cast);
      return cast;
    }
  };
  const bloodCalls = [];
  const blood = {
    asset: '',
    draw(_ctx, _cache, _state, cast) { bloodCalls.push(cast?.beam ?? null); }
  };
  window.__HAPIL_LASERS_V31330__ = api;
  window.__HAPIL_BLOOD_RC16__ = blood;
  context.base = api;
  context.api = api;
  context.blood = blood;
  context.bloodCalls = bloodCalls;
  return { context, window, api, blood, bloodCalls, owner, cosmic, unknown, profile, ownerProfiles };
}

function castThroughBundledProducer(f) {
  const state = {
    zone: 'dist06', time: 19.16, x: 14, y: 24, fxSerial: 1437,
    bossLaserCastsV31330: []
  };
  const actor = { id: 'dist06-boss', hp: 3000, maxHp: 30000, x: 23.5, y: 11.5, boss: true };
  state.enemies = [actor];
  const startCustom = vm.runInContext(`(${startCustomSource})`, f.context);
  const cast = startCustom(state, actor, {
    ownerIdV31331: actor.id, laserProfileV31331: f.profile.key, laserTypeV31331: f.profile.type
  });
  assert(cast, 'actual bundled startCustom produced the native cast through api.start');
  assert.equal(cast.beam, f.window.__HAPIL_RC33__.beamPathFor(actor.id),
    'actual RC33 api.start wrapper stamped the canonical family path onto the cast');
  assert.equal(f.api.valid(cast, state.zone), true,
    'actual bundled native valid(c,z) accepts the correctly routed producer/owner pair');
  return { state, actor, cast };
}

function install(f, source, filename) {
  vm.runInContext(source, f.context, { filename });
}

// Deferred installer order: RC33 routes and produces first; RC32 arrives late.
{
  const f = fixture();
  install(f, rc33Source, 'assets/rc33/boss-laser-render.js');
  const { state, cast } = castThroughBundledProducer(f);
  const canonical = cast.beam;
  install(f, rc32Source, 'assets/rc32/boss-and-mobile.js');
  assert.equal(f.window.__HAPIL_RC32__?.customBossBeams, 28,
    'RC32 retains its original CUSTOM owner coverage count');
  assert.equal(f.api.valid(cast, state.zone), true,
    'actual native validator accepts the cast after late RC32 registration');
  assert.equal(f.owner.beam, canonical,
    'late RC32 registration preserves the already-installed RC33 owner route');
  assert.equal(cast.beam, canonical, 'late RC32 registration leaves cast route intact');

  const cosmicCast = { sourceId: f.cosmic.id, ownerIdV31331: f.cosmic.id, beam: './legacy/cosmic.webp' };
  f.blood.draw(null, null, { enemies: [] }, cosmicCast);
  assert.equal(cosmicCast.beam, f.window.__HAPIL_RC33__.beamPathFor(f.cosmic.id),
    'late RC32 blood draw retains the canonical RC33 Cosmic Lucifer asset');
  assert.equal(f.bloodCalls.at(-1), cosmicCast.beam,
    'nested blood draw sees the same canonical Cosmic Lucifer asset');
}

// Normal opposite order: RC32's legacy route is applied first, then RC33 wins.
{
  const f = fixture();
  install(f, rc32Source, 'assets/rc32/boss-and-mobile.js');
  install(f, rc33Source, 'assets/rc33/boss-laser-render.js');
  const { state, cast } = castThroughBundledProducer(f);
  assert.equal(f.owner.beam, cast.beam, 'RC33 route remains authoritative after both installers');
  assert.equal(f.api.valid(cast, state.zone), true, 'actual native validator accepts normal order');
  const cosmicCast = { sourceId: f.cosmic.id, ownerIdV31331: f.cosmic.id, beam: './legacy/cosmic.webp' };
  f.blood.draw(null, null, { enemies: [] }, cosmicCast);
  assert.equal(cosmicCast.beam, f.window.__HAPIL_RC33__.beamPathFor(f.cosmic.id),
    'nested RC32/RC33 blood draw keeps canonical Cosmic Lucifer asset in normal order');
}

// With no RC33, RC32 preserves its original owner beam map and does not expand scope.
{
  const f = fixture();
  install(f, rc32Source, 'assets/rc32/boss-and-mobile.js');
  assert.equal(f.owner.beam, './assets/vfx/rc32/boss-lasers/dist06-boss.webp',
    'RC32 fallback remains unchanged when RC33 is unavailable');
  assert.equal(f.window.__HAPIL_RC32__?.customBossBeams, 28,
    'RC32 original CUSTOM owner count remains unchanged without RC33');
  assert.equal(f.unknown.beam, './native/future.webp', 'unmapped owner present during install is untouched');
}

console.log('RC223_LASER_OWNER_UNIT', JSON.stringify({
  status: 'passed',
  scenarios: ['RC33 then late RC32', 'RC32 then RC33', 'RC32 fallback without RC33'],
  nativeValidator: 'actual bundled valid(c,z), exact beam equality preserved',
  producer: 'actual bundled startCustom calls dynamically wrapped api.start'
}));
