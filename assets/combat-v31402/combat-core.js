/* HAPIL 3.14.01: explicit incoming-contact orchestration and immutable result journal.
 * Game reducers remain responsible for geometry, damage budgets, parry credit,
 * healing restrictions and EGO. This module does not infer a hit from a picture.
 * No timer, PRNG, save mutation, render callback or dispatch-on-read is used here.
 */
(function (root) {
  'use strict';
  const VERSION = '3.14.03-RC1';
  const LIMIT = 256;
  const CONTACT_RESULTS = Object.freeze(['HIT', 'PARRY', 'GRAZE', 'EVADE', 'INVULNERABLE', 'SHIELD', 'MISS', 'REJECTED']);
  const validResults = new Set([...CONTACT_RESULTS, 'HEAL', 'EGO_STARTED', 'ERROR']);
  const worlds = new WeakMap();
  const evidenceByWorld = new WeakMap();
  let adapters = null;
  const stats = { playerCalls: 0, allyCalls: 0, outgoingCalls: 0, evidenceCaptured: 0, nestedContacts: 0, published: 0, invalidInputs: 0, faults: 0 };
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const numeric = value => finite(value) ? value : null;
  const text = value => typeof value === 'string' || typeof value === 'number' ? String(value).slice(0, 160) : null;
  const object = value => value !== null && typeof value === 'object';
  const id = (s, a) => a === s ? '__host' : text(a?.slotId ?? a?.id) ?? '__unregistered';
  const hero = (s, a) => text(a === s ? s?.activeHeroId : a?.heroId);

  function stateView(a) {
    return Object.freeze({ hp: numeric(a?.hp), resonance: numeric(a?.resonance),
      invulnerableUntil: numeric(a?.invulnerableUntil), awakeningUntil: numeric(a?.awakeningUntil),
      awakeningReadyAt: numeric(a?.awakeningReadyAt), downUntil: numeric(a?.downUntil),
      guardActive: a?.channelDActiveV31364 === true });
  }
  function captureEvidence(s, a, source, evidence) {
    // Accepted measured contacts only. No event for a prediction or an unobserved miss.
    if (!object(s) || !object(a) || !object(source) || !evidence?.hit || !finite(s.time)) return null;
    let m = evidenceByWorld.get(s);
    if (!m || m.zone !== s.zone || s.time < m.at) { m = {zone:s.zone, at:s.time, serial:0, sources:new WeakMap()}; evidenceByWorld.set(s,m); }
    m.at=s.time;
    let perTarget=m.sources.get(source);if(!perTarget){perTarget=new Map();m.sources.set(source,perTarget);}
    const key=id(s,a), previous=perTarget.get(key);
    if(previous&&previous.time===s.time&&previous.kind===evidence.kind&&previous.heart===!!evidence.heart) return previous;
    const row=Object.freeze({candidateId:++m.serial,zone:text(s.zone),time:s.time,targetId:key,
      kind:text(evidence.kind),heart:!!evidence.heart,segmentFraction:numeric(evidence.t),distance:numeric(evidence.distance??evidence.d),
      worldPoint:Object.freeze({x:numeric(source.x),y:numeric(source.y)}),semantics:'measured-contact-not-forecast'});
    perTarget.set(key,row);while(perTarget.size>9)perTarget.delete(perTarget.keys().next().value);
    stats.evidenceCaptured++;return row;
  }
  function readEvidence(s,a,source){
    const m=object(s)&&evidenceByWorld.get(s),v=m&&object(source)&&m.sources.get(source)?.get(id(s,a));
    return v&&m.zone===s.zone&&v.time===s.time?v:null;
  }
  function sourceView(source, s, a) {
    if (!object(source)) return Object.freeze({ id: null, ownerId: null, born: null, family: 'legacy', heart: false });
    const observed = source.heartContactV31336;
    const family = source.laserV31330 || source.themedLaser || source.laser ? 'laser'
      : source.echoBoltV31368 ? 'boss-echo'
      : source.exitDamageV31327 || source.themeExitV31327 ? 'exit-body'
      : finite(source.vx) && finite(source.vy) ? 'projectile'
      : source.shape ? 'area' : 'actor';
    return Object.freeze({ id: text(source.id ?? source.attackInstanceIdV31336),
      ownerId: text(source.sourceId ?? source.ownerId), born: numeric(source.born), family,
      geometry: readEvidence(s,a,source), shape: text(source.shape), boss: source.boss === true, midboss: source.midboss === true,
      x: numeric(source.x), y: numeric(source.y), originX: numeric(source.originX), originY: numeric(source.originY),
      vx: numeric(source.vx), vy: numeric(source.vy),
      heart: !!(observed && observed.target === id(s, a) && Math.abs(observed.time - s.time) < 1e-6 && observed.heart === true) });
  }
  function ledger(s) {
    if (!object(s)) return null;
    let m = worlds.get(s);
    if (!m) { m = { zone: s.zone, at: s.time, epoch: 1, sequence: 0, events: [], counts: {}, stack: [] }; worlds.set(s, m); }
    if (!m.stack.length && (m.zone !== s.zone || finite(s.time) && finite(m.at) && s.time < m.at - 1e-8)) {
      m.zone = s.zone; m.at = s.time; m.epoch++; m.events = []; m.counts = {};
    }
    m.at = s.time;
    return m;
  }
  function current(s, a) {
    const m = worlds.get(s);
    if (!m) return null;
    for (let i = m.stack.length - 1; i >= 0; i--) if (m.stack[i].actor === a) return m.stack[i];
    return null;
  }
  function step(s, a, name) { const tx = current(s, a); if (tx && tx.steps.length < 24) tx.steps.push(String(name).slice(0, 64)); }
  function mark(s, a, result, reason, detail = {}) {
    const tx = current(s, a); if (!tx || !validResults.has(result)) return;
    tx.result = result; tx.reason = text(reason);
    if (finite(detail.appliedDamage)) tx.appliedDamage = Math.max(0, detail.appliedDamage);
    if (detail.downed === true) tx.downed = true;
  }
  function markIfUnset(s, a, result, reason) { const tx = current(s, a); if (tx && !tx.result) mark(s, a, result, reason); }
  function computed(s,a,amount){const tx=current(s,a);if(tx&&finite(amount))tx.computedDamage=amount;}
  function outgoingHeal(s,a,amount){const tx=current(s,a);if(tx&&tx.kind==='OUTGOING'&&finite(amount))tx.lifestealApplied+=Math.max(0,amount);}
  function resource(s, a, key, amount) {
    const tx = current(s, a);
    if (tx && ['resonanceAwarded', 'resonanceSpent', 'healed'].includes(key) && finite(amount) && amount >= 0) tx[key] += amount;
  }
  function ego(s, a) { const tx = current(s, a); if (tx) tx.egoStarted = true; }
  function publish(s, a, tx, returned) {
    const m = worlds.get(s); if (!m) return;
    const after = stateView(a);
    const result = tx.result ?? (tx.kind === 'HEAL' && returned > 0 ? 'HEAL' : 'REJECTED');
    const row = Object.freeze({ schema: 2, sequence: ++m.sequence, epoch: m.epoch,
      time: numeric(tx.time), zone: text(tx.zone), mode: text(s.gameModeV31346 ?? 'STORY'),
      kind: tx.kind, result, reason: tx.reason ?? 'native-returned-no-effect',
      targetId: id(s, a), heroId: tx.heroId, source: tx.sourceView,
      ...(tx.kind==='OUTGOING'?{attackerHeroId:tx.attackerHeroId,criticalRequested:tx.criticalRequested,
       computedDamage:tx.computedDamage??null,lifestealApplied:tx.lifestealApplied,
       attackerBefore:tx.attackerBefore,attackerAfter:stateView(s),
       targetPhaseBefore:tx.targetPhaseBefore,targetPhaseAfter:numeric(a?.currentPhase),
       defeated:tx.appliedDamage>0&&finite(a?.hp)&&a.hp<=0}:{}),
      requestedDamage: numeric(tx.requestedDamage), appliedDamage: tx.appliedDamage,
      hpBefore: tx.before.hp, hpAfter: after.hp,
      hpLoss: tx.before.hp === null || after.hp === null ? null : Math.max(0, tx.before.hp - after.hp),
      resonanceBefore: tx.before.resonance, resonanceAfter: after.resonance,
      resonanceAwarded: tx.resonanceAwarded, resonanceSpent: tx.resonanceSpent, healed: tx.healed,
      egoStarted: tx.egoStarted, downed: tx.downed || finite(a?.downUntil) && a.downUntil > s.time,
      before: tx.before, after, returned: typeof returned === 'boolean' ? returned : numeric(returned),
      path: Object.freeze(tx.steps.slice()), fault: tx.fault ?? null });
    m.events.push(row); if (m.events.length > LIMIT) m.events.shift();
    m.counts[result] = (m.counts[result] ?? 0) + 1; stats.published++;
  }
  function transaction(s, a, source, origin, fn, options = {}) {
    if (!object(s) || !object(a)) { stats.invalidInputs++; return options.numeric ? 0 : false; }
    const m = ledger(s), parent = current(s, a), kind = options.kind ?? 'CONTACT';
    // A player call can route to allyDamage or enter parry credit. The nested
    // reducer belongs to the same target and attack and must not publish twice.
    const shared = parent && parent.kind === 'CONTACT' && kind === 'CONTACT' && parent.source === source;
    if (shared) { stats.nestedContacts++; step(s, a, origin); return fn(); }
    const tx = { actor: a, source, sourceView: sourceView(source, s, a), before: stateView(a),
      heroId: hero(s, a), zone: s.zone, time: s.time, kind, requestedDamage: options.damage,
      steps: [origin], result: null, reason: null, appliedDamage: 0,
      resonanceAwarded: 0, resonanceSpent: 0, healed: 0, egoStarted: false, downed: false,
      attackerHeroId: text(source?.heroId??source?.heroId31213??source?.impactHeroIdV31315??s.activeHeroId),
      criticalRequested:options.critical===true,attackerBefore:kind==='OUTGOING'?stateView(s):null,
      targetPhaseBefore:numeric(a?.currentPhase),lifestealApplied:0,computedDamage:null };
    m.stack.push(tx); let result;
    try { result = fn(); return result; }
    catch (error) { tx.result = 'ERROR'; tx.reason = 'reducer-threw'; tx.fault = String(error?.message ?? error).slice(0, 300); stats.faults++; throw error; }
    finally { m.stack.pop(); publish(s, a, tx, result); }
  }
  function bind(next) {
    if (!next || typeof next.reducePlayer !== 'function') throw Error('Combat core requires a player reducer');
    if (adapters) throw Error('Combat core adapters already bound');
    adapters = Object.freeze({ ...next }); return true;
  }
  function player(s, amount, x, y, source = false) {
    stats.playerCalls++;
    if (!adapters) throw Error('Combat core not bound');
    const a = adapters.target?.(s) ?? s;
    return transaction(s, a, source, 'player-entry', () => {
      if (!finite(amount)) { stats.invalidInputs++; mark(s, a, 'REJECTED', 'nonfinite-damage'); return false; }
      const before = s.hp;
      const reduce = (world, ...args) => {
        step(s, a, 'player-reducer');
        const dodge = world?.lastDodgeAt;
        const eligible = world && world.time < world.invulnerableUntil && world.time - dodge <= .52;
        const result = adapters.reducePlayer(world, ...args);
        if (eligible && dodge !== -99 && world.lastDodgeAt === -99) {
          step(s, a, 'perfect-dodge-feedback'); adapters.perfectFeedback?.(world);
        }
        return result;
      };
      step(s, a, 'party-authority-route');
      const result = adapters.route ? adapters.route(s, reduce, [amount, x, y, source]) : reduce(s, amount, x, y, source);
      // Preserve the historical order AFTER cooperative down-state normalization.
      if (result && s.hp < before) { step(s, a, 'host-after-damage'); adapters.afterDamage?.(s, s, source); }
      if (s.hp < before) { step(s, a, 'host-damage-notice'); adapters.recordDamage?.(s, s, source, before - s.hp); }
      markIfUnset(s, a, result ? 'HIT' : 'REJECTED', result ? 'native-damage' : 'native-returned-no-effect');
      return result;
    }, { damage: amount });
  }
  function ally(s, a, amount, source, reduce) {
    stats.allyCalls++;
    return transaction(s, a, source, 'ally-entry', () => {
      if (!finite(amount)) { stats.invalidInputs++; mark(s, a, 'REJECTED', 'nonfinite-damage'); return false; }
      step(s, a, 'ally-reducer'); const result = reduce(s, a, amount, source);
      markIfUnset(s, a, result ? 'HIT' : 'REJECTED', result ? 'native-ally-damage' : 'native-returned-no-effect'); return result;
    }, { damage: amount });
  }
  function enemy(s, hint, amount, source, reduce, options={}) {
    stats.outgoingCalls++;
    if(!object(s)) { stats.invalidInputs++;return undefined; }
    const validId=object(hint)&&(typeof hint.id==='string'||finite(hint.id));
    const target=validId&&Array.isArray(s.enemies)?s.enemies.find(e=>e?.id!=null&&String(e.id)===String(hint.id))??hint:{id:'__missing-enemy'};
    return transaction(s,target,source,'enemy-entry',()=>{
      // Invalid packets must not award combo, trigger lifesteal or enter phase logic.
      if(!validId||!Array.isArray(s.enemies)){stats.invalidInputs++;mark(s,target,'REJECTED','invalid-target');return undefined;}
      if(!finite(amount)||!finite(options.lifesteal??0)){stats.invalidInputs++;mark(s,target,'REJECTED','nonfinite-outgoing');return undefined;}
      if(typeof reduce!=='function')throw Error('Outgoing reducer missing');
      step(s,target,'enemy-reducer');const out=reduce();markIfUnset(s,target,'REJECTED','enemy-returned-no-effect');return out;
    },{kind:'OUTGOING',damage:amount,critical:options.critical});
  }
  function credit(s, a, source, reduce) {
    return transaction(s, a, source, 'parry-credit', () => {
      const ok = reduce();
      if (ok) mark(s, a, 'PARRY', 'native-credited-contact');
      else markIfUnset(s, a, 'INVULNERABLE', 'guard-contact-without-credit');
      return ok;
    }, { damage: source?.damage });
  }
  function graze(s, source, reduce) {
    return transaction(s, s, source, 'graze-candidate', () => {
      const ok = reduce(); mark(s, s, ok ? 'GRAZE' : 'REJECTED', ok ? 'native-near-miss' : 'graze-ineligible-or-duplicate'); return ok;
    }, { damage: source?.damage });
  }
  function perfect(s, source, reduce) {
    return transaction(s, s, source, 'perfect-candidate', () => {
      const ok = reduce(); if (ok) mark(s, s, 'EVADE', 'native-perfect-evade');
      else markIfUnset(s, s, 'REJECTED', 'perfect-ineligible-or-duplicate'); return ok;
    }, { damage: source?.damage });
  }
  function convert(s, a, reduce) {
    const parent = current(s, a);
    if (parent) return reduce();
    return transaction(s, a, null, 'ego-convert', () => { const ok = reduce(); mark(s, a, ok ? 'EGO_STARTED' : 'REJECTED', ok ? 'native-ego-conversion' : 'ego-not-converted'); return ok; }, { kind: 'STATE' });
  }
  function heal(s, a, amount, reduce) {
    const apply = () => {
      if (!finite(amount) || !finite(a?.hp) || !finite(a?.maxHp)) { stats.invalidInputs++; return 0; }
      const value = reduce(); resource(s, a, 'healed', value); return value;
    };
    if (current(s, a)) return apply();
    return transaction(s, a, null, 'heal-request', () => { const value = apply(); mark(s, a, value > 0 ? 'HEAL' : 'REJECTED', value > 0 ? 'native-healing' : 'healing-blocked-or-invalid'); return value; }, { kind: 'HEAL', numeric: true });
  }
  function snapshot(s) {
    const m = ledger(s);
    return { version: VERSION, schema: 2, maxEvents: LIMIT, epoch: m?.epoch ?? 0,
      counts: { ...m?.counts }, events: m ? m.events.slice() : [], pendingTransactions: m?.stack.length ?? 0 };
  }
  function reset(s) { if (object(s) && !worlds.get(s)?.stack.length) {worlds.delete(s);evidenceByWorld.delete(s);} }
  const api = Object.freeze({ version: VERSION, installed: true, get bound() { return !!adapters; },
    results: CONTACT_RESULTS, limit: LIMIT, bind, player, ally, enemy, computed, outgoingHeal, captureEvidence, readEvidence, credit, graze, perfect, convert, heal,
    transaction, mark, markIfUnset, resource, ego, step, snapshot, reset, metrics: () => ({ ...stats }),
    policy: Object.freeze({ playerDamageWrappers: 0, gameplayDedup: 'native-authoritative-ledgers',
      journalPersisted: false, randomCalls: 0, renderSideEffects: false, missSemantics: 'reserved; no hit is inferred from an unobserved path' }) });
  root.__HAPIL_COMBAT_CORE_V31401__ = api;
  root.__HAPIL_COMBAT_CORE_V31402__ = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
