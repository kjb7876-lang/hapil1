'use strict';

const assert = require('node:assert/strict');
const VELOCITY_EPSILON = 1e-12;

// Menu-paused frames still render native packets. Re-normalizing a vector can
// change its last floating-point bits. Every other snapshot field stays exact.
function assertPausedSnapshot(actual, expected, message = 'paused native snapshot') {
  const comparison = structuredClone(actual);
  let maxVelocityDrift = 0, comparedVelocityComponents = 0;
  for (const [queue, packets] of Object.entries(expected.queues)) {
    for (let i = 0; i < packets.length; i++) {
      const observed = actual.queues?.[queue]?.[i];
      if (!observed) continue; // Exact structural comparison below reports it.
      for (const key of ['vx', 'vy']) {
        const before = packets[i][key], after = observed[key];
        if (typeof before !== 'number' || typeof after !== 'number') continue;
        assert(Number.isFinite(before) && Number.isFinite(after), `${message}: finite ${queue}[${i}].${key}`);
        const drift = Math.abs(after - before);
        assert(drift <= VELOCITY_EPSILON, `${message}: ${queue}[${i}].${key} drift ${drift} exceeds ${VELOCITY_EPSILON}`);
        maxVelocityDrift = Math.max(maxVelocityDrift, drift); comparedVelocityComponents++;
        comparison.queues[queue][i][key] = before;
      }
    }
  }
  assert.deepEqual(comparison, expected, message);
  return { velocityEpsilon: VELOCITY_EPSILON, maxVelocityDrift, comparedVelocityComponents,
    exactRemainingFields: true };
}

module.exports = { assertPausedSnapshot, VELOCITY_EPSILON };
