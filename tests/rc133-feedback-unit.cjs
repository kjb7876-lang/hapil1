'use strict';
// Deterministic unit coverage for combat-feedback classification and admission.
// No renderer is invoked, so the DOM surface is intentionally omitted; the
// module only needs a clock and a reduced-motion preference stub for record().
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
let wall = 0;
const window = {
  console: { warn() {} },
  matchMedia: () => ({ matches: false })
};
const context = { window, performance: { now: () => wall * 1000 }, console: window.console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/rc128/combat-feedback.js'), 'utf8'), context, {
  filename: 'assets/rc128/combat-feedback.js'
});

const Feedback = window.__HAPIL_FEEDBACK_RC128__;
let checks = 0;
const ok = (value, message) => { checks++; assert.ok(value, message); };
const eq = (actual, expected, message) => { checks++; assert.equal(actual, expected, message); };
const fresh = () => ({ zone: 'feedback-test', time: 10, x: 4, y: 4, activeHeroId: 'hwando', hp: 100, maxHp: 100 });
const contact = (sequence, result, extra = {}) => ({
  epoch: 1, sequence, kind: 'CONTACT', result, targetId: '__host', time: 10,
  reason: 'native-contact', source: { family: 'contact', ownerId: 'source-a' }, appliedDamage: 0,
  ...extra
});
const snapshot = s => Feedback.snapshot(s);

// Each defensive combat outcome records the presentation kind and Korean label
// that record() exposes through its snapshot, including Samong's grace reason.
for (const fixture of [
  { result: 'PARRY', reason: 'native-credited-contact', kind: 'parry', label: 'PARRY' },
  { result: 'SHIELD', reason: 'ego-protection', kind: 'guard', label: '방어' },
  { result: 'INVULNERABLE', reason: 'native-invulnerability', kind: 'guard', label: '무적' },
  { result: 'INVULNERABLE', reason: 'samong-revival-grace-rc91', kind: 'dream-guard', label: '사몽 보호' },
  { result: 'EVADE', reason: 'native-perfect-evade', kind: 'dodge', label: '회피' }
]) {
  const s = fresh();
  const row = contact(1, fixture.result, { reason: fixture.reason });
  const accepted = Feedback.record(s, s, row, {});
  ok(accepted, `${fixture.result}/${fixture.reason} is admitted`);
  const view = snapshot(s);
  eq(view.effects, 1, `${fixture.result} produces one visible effect`);
  eq(view.recent[0].kind, fixture.kind, `${fixture.result} maps to ${fixture.kind}`);
  eq(view.recent[0].label, fixture.label, `${fixture.result} displays ${fixture.label}`);
  wall += .25;
}

// Native projectile removal cancellation gets the compact cancel treatment.
{
  const s = fresh();
  const projectile = { id: 'shot-1', x: 6, y: 5 };
  const row = {
    epoch: 1, sequence: 1, kind: 'REMOVAL', result: 'CANCELLED', targetId: 'shot-1',
    reason: 'parry', source: { family: 'projectile', ownerId: 'shot-1' }
  };
  ok(Feedback.record(s, projectile, row, {}), 'actual REMOVAL/CANCELLED journal row is admitted');
  const effect = Feedback.classify(s, projectile, row, {});
  eq(effect.kind, 'cancel', 'removal cancellation uses the cancel effect');
  eq(effect.label, '소거', 'removal cancellation receives its small cancel label');
  eq(effect.power, .35, 'removal cancellation uses subdued effect power');
  eq(effect.duration, .18, 'removal cancellation uses short duration');
  eq(effect.pause, 0, 'removal cancellation never pauses combat');
  eq(snapshot(s).recent[0].kind, 'cancel', 'record snapshot exposes the cancel effect');
}

// Failed and zero-damage outcomes do not create effects.
for (const fixture of [
  { kind: 'OUTGOING', result: 'ERROR', appliedDamage: 12 },
  { kind: 'OUTGOING', result: 'REJECTED', appliedDamage: 0 },
  { kind: 'OUTGOING', result: 'MISS', appliedDamage: 0 },
  { kind: 'OUTGOING', result: 'HIT', appliedDamage: 0 }
]) {
  const s = fresh();
  const row = {
    epoch: 1, sequence: 1, kind: fixture.kind, result: fixture.result,
    targetId: 'enemy', attackerHeroId: 'hwando', appliedDamage: fixture.appliedDamage,
    hpBefore: 100, hpAfter: 100, source: { family: 'actor' }
  };
  ok(!Feedback.record(s, { id: 'enemy', x: 8, y: 8 }, row, {}), `${fixture.result} does not produce feedback`);
  eq(snapshot(s).effects, 0, `${fixture.result} leaves the effect list empty`);
  wall += .25;
}

// The combat journal sequence prevents replaying a defensive result even when
// enough wall time passed that presentation throttles would otherwise allow it.
{
  const s = fresh();
  const row = contact(7, 'SHIELD', { reason: 'ego-protection' });
  ok(Feedback.record(s, s, row, {}), 'first journal sequence is recorded');
  wall += .5;
  ok(!Feedback.record(s, s, row, {}), 'duplicate epoch/sequence is rejected');
  eq(snapshot(s).effects, 1, 'duplicate journal row does not add another effect');
}

// Repeated defensive contacts from one source are coalesced even with distinct
// journal sequences, then become eligible again after the source throttle.
{
  const s = fresh();
  let admitted = 0;
  for (let i = 1; i <= 80; i++) {
    wall += .001;
    const row = contact(i, 'INVULNERABLE', {
      reason: 'native-invulnerability', source: { family: 'contact', ownerId: 'same-attacker' }
    });
    if (Feedback.record(s, s, row, {})) admitted++;
  }
  eq(admitted, 1, 'rapid defensive spam from one source admits only one effect');
  eq(snapshot(s).effects, 1, 'rapid defensive spam stays bounded to one effect');
  wall += .2;
  ok(Feedback.record(s, s, contact(81, 'INVULNERABLE', {
    reason: 'native-invulnerability', source: { family: 'contact', ownerId: 'same-attacker' }
  }), {}), 'same source can show feedback again after the throttle window');
  eq(snapshot(s).effects, 2, 'post-throttle feedback adds one later effect');
}

console.log('RC133_FEEDBACK_UNIT_RESULT', JSON.stringify({
  checks, status: 'passed', scope: 'RC128 defensive feedback record/classification and source throttling'
}));
