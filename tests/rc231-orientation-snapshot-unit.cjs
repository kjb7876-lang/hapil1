'use strict';

const assert = require('node:assert/strict');
const { assertPausedSnapshot, VELOCITY_EPSILON } = require('./helpers/rc231-orientation-snapshot.cjs');
const baseline = () => ({ world: { time: 132, hp: 240, x: 13.8, y: 24.2 },
  actors: [{ id: 'boss', hp: 12000, attackAt: 132.7, readyAt: 133 }],
  progress: { zone: 'cult04', completed: [] }, queues: {
    hostileProjectiles: [{ id: 1, sourceId: 'boss', x: 23, y: 12,
      vx: -3.5998146409271308, vy: -0.03653150649636894, born: 131, frozenUntil: 131.8, expiresAt: 140 }],
    pendingHits: [{ id: 2, at: 133, damage: 10, vx: null, vy: null }] } });
let checks = 0;
assertPausedSnapshot(baseline(), baseline()); checks++;
{
  const expected = baseline(), actual = structuredClone(expected);
  actual.queues.hostileProjectiles[0].vx = -3.5998146409271263;
  actual.queues.hostileProjectiles[0].vy = -0.03653150649636889;
  const untouched = structuredClone(actual), evidence = assertPausedSnapshot(actual, expected);
  assert(evidence.maxVelocityDrift > 0 && evidence.maxVelocityDrift < VELOCITY_EPSILON);
  assert.deepEqual(actual, untouched, 'comparison never mutates raw evidence'); checks++;
}
for (const mutate of [
  s => { s.queues.hostileProjectiles[0].vx += 1e-7; },
  s => { s.queues.hostileProjectiles[0].vy += 1e-7; },
  s => { s.queues.hostileProjectiles[0].x += 1e-13; },
  s => { s.world.time += 1e-12; },
  s => { s.world.hp -= 1e-12; },
  s => { s.actors[0].readyAt += 1e-12; },
  s => { s.queues.hostileProjectiles[0].frozenUntil += 1e-12; },
  s => { s.queues.hostileProjectiles[0].id = 99; },
  s => { s.queues.hostileProjectiles.pop(); },
  s => { s.progress.completed.push('cult04'); },
  s => { s.queues.pendingHits[0].damage += 1e-12; },
  s => { s.queues.hostileProjectiles[0].vx = NaN; }
]) {
  const actual = baseline(); mutate(actual);
  assert.throws(() => assertPausedSnapshot(actual, baseline())); checks++;
}
console.log('RC231_ORIENTATION_SNAPSHOT_UNIT', JSON.stringify({ status: 'passed', checks,
  velocityEpsilon: VELOCITY_EPSILON, exactTimeHpPositionsDeadlinesQueuesAndProgress: true,
  rejectsVelocityDelta: 1e-7, rawEvidencePreserved: true }));
