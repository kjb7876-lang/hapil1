'use strict';
// Exercises RC133 admission and save rules with the same synchronous activation
// boundary used by RC91, plus RC128's encounter-scoped revival claim.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const window = {};
const context = { window, console };
vm.createContext(context);
for (const file of ['assets/rc128/awakening-policy.js', 'assets/rc133/samong-policy.js']) {
  vm.runInContext(read(file), context, { filename: file });
}

const Policy = window.__HAPIL_SAMONG_POLICY_RC133__;
const Encounter = window.__HAPIL_AWAKENING_POLICY_RC128__;
let checks = 0;
const ok = (value, message) => { checks++; assert.ok(value, message); };
const eq = (actual, expected, message) => { checks++; assert.equal(actual, expected, message); };

// Keep the host callback deliberately small, but preserve RC91's key ordering:
// admission happens before mutation; a rejected admission never completes or
// clears another in-flight admission; successful mutation completes once.
window.__HAPIL_SAMONG_RC91__ = {
  enabled: s => !!s && s.samongUnlockedRC91 === true && s.gameModeV31346 === 'DREAM',
  tryEgo(s) {
    const passive = s.samongPassiveRC91;
    if (!Policy.admit(s, passive, 'ego')) return false;
    const profile = Policy.profile(s);
    passive.active = profile.duration;
    passive.cooldown = profile.cooldown;
    passive.activations = (passive.activations || 0) + 1;
    Policy.complete(s, true);
    return true;
  },
  tryRevive(s) {
    if (!(s.hp <= 0)) return false;
    const passive = s.samongPassiveRC91;
    if (!Policy.admit(s, passive, 'revival')) return false;
    // A nested EGO trigger during revival must see the same occupied lock.
    const nestedEgo = this.tryEgo(s);
    passive.active = Policy.profile(s).duration;
    passive.cooldown = Policy.profile(s).cooldown;
    passive.activations = (passive.activations || 0) + 1;
    s.hp = Math.ceil(s.maxHp * .5);
    Policy.complete(s, true);
    return { revived: true, nestedEgo };
  }
};

const fresh = (mode = 'DREAM') => ({
  zone: 'first-map', time: 0, hp: 100, maxHp: 100,
  activeHeroId: 'hwando', samongUnlockedRC91: true, gameModeV31346: mode,
  samongPassiveRC91: { active: 0, cooldown: 0, activations: 0 }
});
function entry(s, index) {
  s.time = index;
  const before = s.time;
  return Policy.enter(s, false, before, before + .25);
}
function advance(s, seconds) {
  const m = s.samongPassiveRC91;
  while (seconds > 0) {
    const dt = Math.min(.25, seconds);
    s.time += dt;
    m.active = Math.max(0, m.active - dt);
    m.cooldown = Math.max(0, m.cooldown - dt);
    seconds -= dt;
  }
  if (m.active === 0) window.__HAPIL_SAMONG_RC91__.tryEgo(s);
}

// Six fresh EGO entries do not awaken. The seventh admits one activation,
// clears the accumulated count, and a duplicate entry token is inert.
{
  const s = fresh();
  let attempts = 0;
  const realTryEgo = window.__HAPIL_SAMONG_RC91__.tryEgo;
  window.__HAPIL_SAMONG_RC91__.tryEgo = state => { attempts++; return realTryEgo(state); };
  for (let i = 1; i <= 6; i++) {
    ok(entry(s, i), `entry ${i} is recorded`);
    eq(s.samongPassiveRC91.activations, 0, `entry ${i} does not activate early`);
    eq(Policy.status(s).count, i, `entry ${i} advances the run counter`);
  }
  ok(entry(s, 7), 'seventh EGO transition is accepted');
  eq(attempts, 1, 'seventh transition requests one activation');
  eq(s.samongPassiveRC91.activations, 1, 'seventh transition activates once');
  eq(Policy.status(s).count, 0, 'successful activation resets the count');
  eq(Policy.status(s).pending, false, 'successful activation clears pending admission');
  const token = s.samongEgoRC133.lastEntry;
  ok(!Policy.enter(s, false, 7, 7.25), 'duplicate entry token is rejected');
  eq(s.samongEgoRC133.lastEntry, token, 'duplicate leaves the accepted token unchanged');
  eq(attempts, 1, 'duplicate cannot request another activation');
  window.__HAPIL_SAMONG_RC91__.tryEgo = realTryEgo;

  // Let the actual policy cooldown expire, then require a new seven entries.
  advance(s, s.samongPassiveRC91.cooldown + 1);
  const secondRunStart = s.time + 1;
  for (let i = 0; i < 6; i++) entry(s, secondRunStart + i);
  eq(s.samongPassiveRC91.activations, 1, 'six later entries still do not activate');
  entry(s, secondRunStart + 6);
  eq(s.samongPassiveRC91.activations, 2, 'a second seven-entry run activates after cooldown');
  eq(s.samongEgoRC133.serial, 2, 'successful admissions advance the reset serial');
}

// If seven arrives while an awakening is active or its cooldown is running,
// the charge stays pending without stacking. RC91 can retry once available.
{
  const s = fresh();
  s.samongPassiveRC91.active = 2;
  s.samongPassiveRC91.cooldown = 5;
  for (let i = 1; i <= 6; i++) entry(s, i);
  entry(s, 7);
  eq(s.samongPassiveRC91.activations, 0, 'occupied awakening rejects stacking');
  eq(s.samongPassiveRC91.active, 2, 'rejected admission preserves the current active timer');
  eq(s.samongPassiveRC91.cooldown, 5, 'rejected admission preserves cooldown');
  eq(Policy.status(s).count, 7, 'seventh count remains pending after rejection');
  ok(Policy.status(s).pending, 'rejected seventh admission remains retryable');
  advance(s, 6);
  eq(s.samongPassiveRC91.activations, 1, 'pending seventh charge activates when the lock clears');
  eq(Policy.status(s).count, 0, 'successful retry consumes the pending count');

  const cooling = fresh();
  cooling.samongPassiveRC91.cooldown = 2;
  for (let i = 1; i <= 7; i++) entry(cooling, i);
  eq(cooling.samongPassiveRC91.activations, 0, 'cooldown blocks the seventh activation');
  ok(Policy.status(cooling).pending, 'cooldown-blocked seventh admission stays pending');
  advance(cooling, 2.25);
  eq(cooling.samongPassiveRC91.activations, 1, 'cooldown completion retries pending admission');
}

// Run-scoped count survives a map change and the exact sanitization used for
// save data. Round-tripping a clean value cannot silently reset progress.
{
  const s = fresh();
  entry(s, 1); entry(s, 2); entry(s, 3);
  const cleanSave = JSON.parse(JSON.stringify(Policy.clean(s.samongEgoRC133)));
  s.zone = 'second-map';
  s.samongEgoRC133 = cleanSave;
  eq(Policy.memory(s).count, 3, 'map transition and sanitized save preserve run count');
  eq(Policy.clean(s.samongEgoRC133).count, 3, 'save cleaning preserves valid accumulated count');
}

// The revival path shares the in-flight admission lock with EGO and delegates
// its one-use charge to RC128, which refills only at the next encounter.
{
  const s = fresh();
  s.hp = 0;
  const first = window.__HAPIL_SAMONG_RC91__.tryRevive(s);
  ok(first?.revived, 'first lethal revival is admitted');
  eq(first.nestedEgo, false, 'nested EGO request sees the shared lock');
  eq(s.hp, 50, 'successful revival restores half HP');
  eq(s.samongPassiveRC91.activations, 1, 'revival and nested request count as one activation');
  ok(s.samongPassiveRC91.encounterRC128.used, 'RC128 records the encounter charge');
  eq(s.samongEgoRC133.admitting, false, 'successful completion releases the shared lock');

  s.hp = 0;
  s.samongPassiveRC91.active = 0;
  s.samongPassiveRC91.cooldown = 0;
  ok(!window.__HAPIL_SAMONG_RC91__.tryRevive(s), 'spent encounter charge rejects another lethal revival');
  eq(s.samongPassiveRC91.activations, 1, 'duplicate lethal revival does not mutate activation count');

  s.zone = 'second-encounter';
  ok(window.__HAPIL_SAMONG_RC91__.tryRevive(s)?.revived, 'next encounter permits one fresh revival');
  eq(s.samongPassiveRC91.activations, 2, 'new-encounter revival adds one activation');
  ok(s.samongPassiveRC91.encounterRC128.used, 'new encounter charge is spent atomically');
}

// Purchases are DREAM-only, spend exactly one shard per rank, and cannot exceed
// the live rank cap for any of the five upgrade tracks.
{
  const story = fresh('STORY');
  const denied = Policy.purchase(story, { samongDuration: 0 }, 3, 'samongDuration');
  eq(denied, null, 'Story mode cannot purchase DREAM-only Samong upgrades');

  const dream = fresh('DREAM');
  let upgrades = {};
  for (const track of Policy.tracks) {
    let shards = track.max + 2;
    for (let rank = 1; rank <= track.max; rank++) {
      const purchase = Policy.purchase(dream, upgrades, shards, track.key);
      ok(purchase, `${track.key} rank ${rank} can be purchased in DREAM`);
      eq(purchase.shards, shards - 1, `${track.key} rank ${rank} costs one shard`);
      eq(purchase.upgrades[track.key], rank, `${track.key} purchase advances exactly one rank`);
      eq(purchase.category, 'samongUpgrade', `${track.key} is categorized as a Samong upgrade`);
      shards = purchase.shards;
      upgrades = purchase.passives;
      dream.samongUpgradesRC133 = purchase.upgrades;
    }
    eq(Policy.purchase(dream, upgrades, shards, track.key), null, `${track.key} cannot exceed its cap`);
    eq(shards, 2, `${track.key} cap rejects a purchase without charging more shards`);
  }
  const profile = Policy.profile(dream);
  eq(profile.duration, 9, 'purchased duration ranks affect the active profile');
  ok(profile.cooldown >= 65.45, 'purchased cooldown ranks respect the minimum cooldown');
  ok(profile.power <= 8.05, 'purchased power ranks respect the maximum multiplier');
  ok(profile.grace <= 1, 'purchased protection ranks respect the maximum grace');
  eq(Policy.purchase(dream, upgrades, 0, 'samongResonance'), null, 'zero shards cannot buy a rank');
}

// Untrusted save data is clamped, has a bounded de-duplication token, and drops
// in-flight lock state instead of restoring a permanently stuck admission.
{
  const cleaned = Policy.clean({
    version: 1, count: 999, pending: true, lastEntry: 'x'.repeat(300),
    serial: Number.POSITIVE_INFINITY, admitting: true
  });
  eq(cleaned.count, 7, 'oversized saved count is capped');
  eq(cleaned.pending, true, 'valid capped seventh count retains pending state');
  eq(cleaned.lastEntry.length, 120, 'saved duplicate token is bounded');
  eq(cleaned.serial, 0, 'non-finite serial is rejected');
  eq(cleaned.admitting, false, 'a save never restores a held admission lock');
  eq(Policy.clean({ version: 1, count: -100, pending: true }).count, 0, 'negative save count is clamped');
  eq(Policy.clean({ version: 2, count: 4 }), null, 'unknown save version is rejected');
}

console.log('RC133_POLICY_RESULT', JSON.stringify({ checks, status: 'passed', scope: 'RC133 admission, encounter revival, upgrades, and save sanitation' }));
