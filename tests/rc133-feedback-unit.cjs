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

// A positive outgoing HIT is distinct from the parry/dodge cancellation paths.
for (const fixture of [
  { result: 'HIT', kind: 'heavy', targetId: 'victim', hpBefore: 100, hpAfter: 65,
    appliedDamage: 35, source: { family: 'actor' } },
  { result: 'PARRY', kind: 'parry', targetId: '__host', appliedDamage: 0,
    reason: 'native-credited-contact', source: { family: 'contact', ownerId: 'parry-source' } },
  { result: 'EVADE', kind: 'dodge', targetId: '__host', appliedDamage: 0,
    reason: 'native-perfect-evade', source: { family: 'contact', ownerId: 'dodge-source' } },
  { result: 'CANCELLED', kind: 'cancel', targetId: 'cancelled-shot', appliedDamage: 0,
    eventKind: 'REMOVAL', reason: 'parry', source: { family: 'projectile', ownerId: 'cancelled-shot' } }
]) {
  const s = fresh();
  const row = {
    epoch: 1, sequence: 1, kind: fixture.eventKind || (fixture.targetId === '__host' ? 'CONTACT' : 'OUTGOING'),
    result: fixture.result, targetId: fixture.targetId, attackerHeroId: 'hwando',
    hpBefore: fixture.hpBefore ?? 100, hpAfter: fixture.hpAfter ?? 100,
    appliedDamage: fixture.appliedDamage, reason: fixture.reason,
    source: fixture.source
  };
  const target = fixture.targetId === '__host' ? s : { id: fixture.targetId, x: 8, y: 8 };
  ok(Feedback.record(s, target, row, {}), `${fixture.result} combat event is admitted`);
  eq(snapshot(s).recent[0].kind, fixture.kind, `${fixture.result} maps to ${fixture.kind}`);
}

// Failed and zero-damage outcomes do not create effects.
for (const fixture of [
  { kind: 'OUTGOING', result: 'ERROR', appliedDamage: 12 },
  { kind: 'OUTGOING', result: 'REJECTED', appliedDamage: 0 },
  { kind: 'OUTGOING', result: 'MISS', appliedDamage: 0 },
  { kind: 'OUTGOING', result: 'HIT', appliedDamage: 0 },
  { kind: 'CONTACT', result: 'MISS', appliedDamage: 0 },
  { kind: 'CONTACT', result: 'HIT', appliedDamage: 0 }
]) {
  const s = fresh();
  const row = {
    epoch: 1, sequence: 1, kind: fixture.kind, result: fixture.result,
    targetId: fixture.kind === 'CONTACT' ? '__host' : 'enemy', attackerHeroId: 'hwando', appliedDamage: fixture.appliedDamage,
    hpBefore: 100, hpAfter: 100, source: { family: 'actor' }
  };
  ok(!Feedback.record(s, fixture.kind === 'CONTACT' ? s : { id: 'enemy', x: 8, y: 8 }, row, {}), `${fixture.kind}/${fixture.result} does not produce feedback`);
  eq(snapshot(s).effects, 0, `${fixture.result} leaves the effect list empty`);
  wall += .25;
}

// Distinct contact owners retain their own throttle entries. The 25 ms output
// gate bounds one render burst even when different sources arrive together.
{
  const s = fresh();
  const owners = ['first-attacker', 'second-attacker', 'third-attacker'];
  const rows = owners.map((ownerId, index) => contact(index + 1, 'INVULNERABLE', {
    reason: 'native-invulnerability', source: { family: 'contact', ownerId }
  }));
  ok(Feedback.record(s, s, rows[0], {}), 'first distinct source produces feedback');
  ok(!Feedback.record(s, s, rows[1], {}), 'same-frame second source is stopped by the output cap');
  ok(!Feedback.record(s, s, rows[2], {}), 'same-frame third source is stopped by the output cap');
  eq(snapshot(s).effects, 1, 'one render burst contains at most one low-power defensive effect');
  wall += .03;
  ok(Feedback.record(s, s, contact(4, 'INVULNERABLE', {
    reason: 'native-invulnerability', source: { family: 'contact', ownerId: owners[1] }
  }), {}), 'second source is admitted after the output interval');
  wall += .03;
  ok(Feedback.record(s, s, contact(5, 'INVULNERABLE', {
    reason: 'native-invulnerability', source: { family: 'contact', ownerId: owners[2] }
  }), {}), 'third source has an independent throttle entry');
  eq(snapshot(s).effects, 3, 'three separated source events remain visible');
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

// Continuous contact (laser or periodic damage) has the longer 450 ms source
// interval, while unique journal sequences still prevent replay.
{
  const s = fresh();
  const row = (sequence) => contact(sequence, 'INVULNERABLE', {
    reason: 'native-invulnerability',
    source: { family: 'laser', ownerId: 'continuous-laser' }
  });
  ok(Feedback.record(s, s, row(1), {}), 'first continuous-contact row is admitted');
  wall += .2;
  ok(!Feedback.record(s, s, row(2), {}), 'same continuous source is throttled before 450 ms');
  wall += .26;
  ok(Feedback.record(s, s, row(3), {}), 'continuous source is admitted after 450 ms');
  eq(snapshot(s).effects, 2, 'continuous-contact coalescing bounds the visuals');
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

// Strong accepted hits can bypass the low-power output interval, so the
// retained visual queue also needs its independent 32-effect bound.
{
  const s = fresh();
  for (let sequence = 1; sequence <= 64; sequence++) {
    const row = {
      epoch: 1, sequence, kind: 'OUTGOING', result: 'HIT', targetId: 'enemy-' + sequence,
      attackerHeroId: 'hwando', hpBefore: 100, hpAfter: 65, appliedDamage: 35,
      source: { family: 'actor' }
    };
    Feedback.record(s, { id: row.targetId, x: 8, y: 8 }, row, {});
  }
  const view = snapshot(s);
  eq(view.effects, 32, 'strong-hit burst retains no more than 32 effects');
  eq(view.recent[0].sequence, 33, 'bounded queue discards the oldest effects');
  eq(view.recent.at(-1).sequence, 64, 'bounded queue keeps the newest effect');
}

{
  const s=fresh();s.heroBleedUntil=13;s.heroBurnUntil=12;s.heroEnvyPoisonUntil=14;
  let rows=Feedback.ailments(s);
  eq(rows.length,3,'only three actually active ailments receive skull labels');
  eq(rows.find(r=>r.key==='bleed').remaining,3,'bleed shows the actual remaining timer');
  s.heroBleedUntil=17;eq(Feedback.ailments(s).find(r=>r.key==='bleed').remaining,7,'refresh updates the displayed timer');
  s.time=14.1;rows=Feedback.ailments(s);eq(rows.length,1,'expired statuses leave the display');
  s.hp=0;eq(Feedback.ailments(s).length,0,'lethal player state clears status display');
  s.hp=100;s.heroBleedUntil=0;eq(Feedback.ailments(s).length,0,'native cure clears status display');
  window.__HAPIL_INNER_FINAL_RC133__={red:x=>x===s};s.innerFinalRC133={awake:5};
  eq(Feedback.ailments(s).find(r=>r.key==='red').remaining,5,'red Persona tax has a real active-timer label');
  window.__HAPIL_INNER_FINAL_RC133__={red:()=>false};eq(Feedback.ailments(s).length,0,'red label clears when encounter ends');
}

console.log('RC133_FEEDBACK_UNIT_RESULT', JSON.stringify({
  checks, status: 'passed', scope: 'RC128 hit/parry/dodge/removal classification, collision-miss suppression, source throttles and bounded effect burst'
}));
