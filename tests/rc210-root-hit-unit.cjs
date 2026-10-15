'use strict';

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

let baseCalls = 0;
const world = {
  __HAPIL_THEME_V31323__: {
    installed: true,
    owner(id) { return id === 'mb-dist01' ? { id, mechanic: 'chain' } : null; },
    afterDamage(state, target, hit) {
      baseCalls++;
      if (hit?.themeMechanicV31323 !== 'chain' ||
          Number(target.themeRootImmuneV31323) > state.time) return false;
      target.themeRootUntilV31323 = state.time + 1;
      target.themeRootImmuneV31323 = state.time + 5;
      target.themeRootZoneV31323 = state.zone;
      target.themeRootColor323 = hit.color;
      state.floatTexts.push({ text: '사슬 속박 · 1초' });
      return true;
    },
  },
  setTimeout(fn) { fn(); },
};
world.window = world;
vm.createContext(world);
vm.runInContext(fs.readFileSync('assets/rc210/root-hit-runtime.js', 'utf8'), world);

const api = world.__HAPIL_ROOT_HIT_RC210__;
assert.equal(api?.installed, true, 'root hit adapter installs after theme mechanics');
assert.equal(api.ownerFor('dist00-boss').mechanic, 'chain');
assert.equal(api.ownerFor('mb-dist01').id, 'mb-dist01', 'other owner routing is unchanged');

const boss = { id: 'dist00-boss', boss: true, hp: 500, themeFollowupReadyV31323: 0 };
const state = {
  zone: 'dist00', time: 10, x: 16, y: 24, hp: 200, fxSerial: 1,
  enemies: [boss], pendingHits: [], floatTexts: [],
};
const hit = { id: 9, sourceId: 'dist00-boss', damage: 20, x: 16, y: 24, color: '#a56' };
assert.equal(world.__HAPIL_THEME_V31323__.afterDamage(state, state, hit), true);
assert.equal(hit.themeMechanicV31323, 'chain', 'native damage log receives the root mechanic label');
assert.equal(state.themeRootUntilV31323, 11, 'native root lock lasts one simulation second');
assert.equal(state.themeRootImmuneV31323, 15, 'root re-hit immunity is five seconds');
assert.equal(state.themeRootZoneV31323, 'dist00');
assert.equal(state.floatTexts.at(-1).text, '뿌리 속박 · 1초');
assert.equal(state.pendingHits.length, 3, 'three delayed DOT packets are queued');
assert.deepEqual(state.pendingHits.map(packet => packet.rootDotTickRC210), [1, 2, 3]);
assert.deepEqual(state.pendingHits.map(packet => packet.at), [10.7, 11.4, 12.1]);
assert.deepEqual(state.pendingHits.map(packet => packet.damage), [1, 1, 1]);
assert(state.pendingHits.every(packet => packet.status === 'none' &&
  packet.themeFollowupV31323 === true && packet.themeRootDotRC210 === true &&
  packet.rootFollowupRC210 === true));

for (const packet of state.pendingHits.splice(0)) {
  state.time = packet.at;
  assert.equal(world.__HAPIL_THEME_V31323__.afterDamage(state, state, packet), false,
    'DOT cannot recursively root or schedule additional packets');
}
assert.equal(state.pendingHits.length, 0, 'DOT stops after three finite ticks');

state.time = 12;
const callsBeforeOtherBoss = baseCalls;
assert.equal(world.__HAPIL_THEME_V31323__.afterDamage(state, state,
  { sourceId: 'mb-dist01', themeMechanicV31323: 'detonation' }), false,
  'unrelated owner keeps its original mechanic behavior');
assert.equal(state.pendingHits.length, 0, 'unrelated owner does not get a root follow-up');
assert.equal(baseCalls, callsBeforeOtherBoss + 1, 'unrelated owner passed through original handler');

state.time = 15.1;
assert.equal(world.__HAPIL_THEME_V31323__.afterDamage(state, state,
  { sourceId: 'dist00-boss', damage: 12, x: state.x, y: state.y }), true,
  'root behavior can trigger again after immunity expires');
assert.equal(state.pendingHits.length, 3);
assert.equal(baseCalls, callsBeforeOtherBoss + 2);

const ornamentWorld = { window: {} };
ornamentWorld.window = ornamentWorld;
vm.createContext(ornamentWorld);
vm.runInContext(fs.readFileSync('assets/rc210/ornaments.js', 'utf8'), ornamentWorld);
const ornaments = ornamentWorld.__HAPIL_ORNAMENTS_RC210__;
ornaments.bind({
  maps: { dist00: { enemies: [boss] }, dist01: { enemies: [{ id: 'mb-dist01' }] } },
  pools: { DIST: ['chair'] },
  props: { chair: { source: './chair.png' } },
  queue() {}, project() {}, bounds() {},
});
const state2 = { zone: 'dist00', time: 10, hostileProjectiles: [] };
const rootShot = { sourceId: 'dist00-boss', vx: 1, vy: 0, damage: 12 };
assert.equal(ornaments.prepare(state2, boss, rootShot), rootShot);
assert.equal(rootShot.rc210Ornament, undefined,
  'the root boss must never receive random story-prop projectile art');
const otherBoss = { id: 'mb-dist01', midboss: true, hp: 100, zone: 'dist01' };
const otherShot = { sourceId: 'mb-dist01', vx: 1, vy: 0, damage: 12 };
assert.equal(ornaments.prepare(state2, otherBoss, otherShot), otherShot);
assert.equal(otherShot.rc210Ornament, true,
  'other boss-specific decoration behavior remains available');

console.log(JSON.stringify({
  status: 'passed',
  nativeDamageHook: true,
  rootBindSeconds: 1,
  immunitySeconds: 5,
  delayedPackets: 3,
  periodicDotTicks: 3,
  rootPropOrnamentsBlocked: true,
  otherBossMechanicsPreserved: true,
}));
