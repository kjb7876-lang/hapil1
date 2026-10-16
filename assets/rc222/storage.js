/* RC222: scoped cooperative persistence. Native storage call sites opt in;
 * browser Storage instances and prototypes are never modified. */
(() => {
  'use strict';
  const root = typeof window === 'object' ? window : globalThis;
  if (root.__HAPIL_COOP_STORAGE_RC222__) return;
  const PREFIX = 'hapil.coop.rc222.', KIND = 'hapil.coop.checkpoint.rc222';
  const NUMBER = '$hapilNumberRC222', MAX_BYTES = 16 * 1024 * 1024;
  const HOST_SEED_KEYS = ['hapil.samongUnlocked.rc91', 'hapilEndingCleared', 'hapilCampaignCompleteV31301', 'mongse_settings_v1'];
  const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
  const memory = new Map(), guests = new Map(), areas = new Map();
  let bridge = {}, current = null, local = null, restoring = false, generation = 0;
  let blockedWrites = 0, lastError = null;
  function fail(reason) { lastError = reason; return { ok: false, persistent: false, reason }; }
  function scope() { return PREFIX + encodeURIComponent(current.session) + '.'; }
  function keyFor(key) { return scope() + 'native.' + encodeURIComponent(String(key)); }
  function rawGet(key, area) {
    try { const value = root[area]?.getItem(key); if (value != null) return value; } catch (_) {}
    return memory.get(area + ':' + key) ?? null;
  }
  function rawSet(key, value, area) {
    const text = String(value); let persistent = false;
    try { root[area]?.setItem(key, text); persistent = root[area]?.getItem(key) === text; } catch (_) {}
    memory.set(area + ':' + key, text); return persistent;
  }
  function rawRemove(key, area) {
    try { root[area]?.removeItem(key); } catch (_) {}
    memory.delete(area + ':' + key);
  }
  function encode(value) {
    const ancestors = new Set(); let count = 0;
    function visit(v, depth) {
      if (++count > 500000 || depth > 100) throw Error('checkpoint-too-complex');
      if (typeof v === 'number') {
        if (Number.isNaN(v)) throw Error('invalid-number');
        return Number.isFinite(v) ? v : { [NUMBER]: v === Infinity ? 'Infinity' : '-Infinity' };
      }
      if (v === null || ['string', 'boolean'].includes(typeof v)) return v;
      if (!v || typeof v !== 'object' || ancestors.has(v)) throw Error('invalid-checkpoint-value');
      ancestors.add(v);
      let result;
      if (Array.isArray(v)) result = v.map(x => visit(x, depth + 1));
      else {
        if (Object.prototype.toString.call(v) !== '[object Object]') throw Error('unencoded-runtime-object');
        result = {};
        for (const k of Object.keys(v)) {
          if (forbidden.has(k) || k === NUMBER) throw Error('unsafe-checkpoint-key');
          if (v[k] !== undefined) result[k] = visit(v[k], depth + 1);
        }
      }
      ancestors.delete(v); return result;
    }
    return visit(value, 0);
  }
  function decode(value) {
    let count = 0;
    function visit(v, depth) {
      if (++count > 500000 || depth > 100) throw Error('checkpoint-too-complex');
      if (!v || typeof v !== 'object') {
        if (typeof v === 'number' && !Number.isFinite(v)) throw Error('invalid-number');
        return v;
      }
      if (Object.hasOwn(v, NUMBER)) {
        if (Object.keys(v).length !== 1 || !['Infinity', '-Infinity'].includes(v[NUMBER])) throw Error('invalid-number-tag');
        return v[NUMBER] === 'Infinity' ? Infinity : -Infinity;
      }
      if (Array.isArray(v)) return v.map(x => visit(x, depth + 1));
      const out = {};
      for (const k of Object.keys(v)) {
        if (forbidden.has(k)) throw Error('unsafe-checkpoint-key');
        out[k] = visit(v[k], depth + 1);
      }
      return out;
    }
    return visit(value, 0);
  }
  function clone(value) { return decode(encode(value)); }
  // The local rollback stays in memory and must preserve native Sets, Maps,
  // Infinity, undefined fields and shared references without JSON conversion.
  function localClone(value, seen = new Map()) {
    if (!value || typeof value !== 'object') return value;
    if (seen.has(value)) return seen.get(value);
    const type = Object.prototype.toString.call(value);
    const out = type === '[object Set]' ? new Set() : type === '[object Map]' ? new Map() : Array.isArray(value) ? [] : {};
    seen.set(value, out);
    if (type === '[object Set]') for (const v of value) out.add(localClone(v, seen));
    else if (type === '[object Map]') for (const [k, v] of value) out.set(localClone(k, seen), localClone(v, seen));
    else for (const k of Object.keys(value)) if (!forbidden.has(k)) out[k] = localClone(value[k], seen);
    return out;
  }
  function sync(value) { if (value?.then) throw Error('async-storage-bridge'); return value; }
  function validate(snapshot) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw Error('invalid-checkpoint');
    if (typeof bridge.validateCheckpoint !== 'function' || sync(bridge.validateCheckpoint(clone(snapshot))) !== true) throw Error('invalid-checkpoint');
    return snapshot;
  }
  function slotName(slot = 'auto') {
    const text = String(slot); if (!/^[a-zA-Z0-9_-]{1,64}$/.test(text)) throw Error('invalid-slot'); return text;
  }
  function checkpointKey(slot) { return scope() + 'checkpoint.' + slotName(slot); }
  function parse(text) {
    if (typeof text !== 'string' || text.length > MAX_BYTES) throw Error('invalid-checkpoint-file');
    const envelope = decode(JSON.parse(text));
    if (!envelope || envelope.kind !== KIND || envelope.version !== 1 || typeof envelope.session !== 'string' ||
        typeof envelope.savedAt !== 'string' || !Number.isFinite(Date.parse(envelope.savedAt)) || !envelope.snapshot) throw Error('invalid-checkpoint-file');
    validate(envelope.snapshot); return envelope;
  }
  function host() { return current?.role === 'host' && !restoring; }
  function getItem(key, area = 'localStorage') {
    key = String(key);
    if (!current) return rawGet(key, area);
    if (current.role === 'guest') return guests.get(area + ':' + key) ?? null;
    return rawGet(keyFor(key), area);
  }
  function setItem(key, value, area = 'localStorage') {
    key = String(key);
    if (!current) return rawSet(key, value, area);
    if (restoring || current.role === 'guest') { blockedWrites++; return false; }
    return rawSet(keyFor(key), value, area);
  }
  function removeItem(key, area = 'localStorage') {
    if (current && (!host())) { blockedWrites++; return false; }
    rawRemove(current ? keyFor(key) : String(key), area); return true;
  }
  function area(name = 'localStorage') {
    if (!['localStorage', 'sessionStorage'].includes(name)) throw Error('invalid-storage-area');
    if (!areas.has(name)) areas.set(name, Object.freeze({ getItem: k => getItem(k, name), setItem: (k, v) => setItem(k, v, name), removeItem: k => removeItem(k, name) }));
    return areas.get(name);
  }
  function read(key) {
    const a = getItem(key, 'localStorage'); return a ?? getItem(key, 'sessionStorage');
  }
  function write(key, value) {
    const persistent = setItem(key, value, 'localStorage');
    setItem(key, value, 'sessionStorage'); return persistent;
  }
  function configure(value) {
    if (current) return fail('session-active');
    bridge = { ...bridge, ...value }; return { ok: true };
  }
  function enter(role, session) {
    if (!['host', 'guest'].includes(role)) return fail('invalid-role');
    const id = typeof session === 'string' ? session : session?.sessionId ?? session?.id ?? session?.roomId ?? session?.code;
    if (typeof id !== 'string' || !id.trim() || id.length > 128 || /[\x00-\x1f]/.test(id)) return fail('invalid-session');
    if (current) return current.role === role && current.session === id ? { ok: true, unchanged: true } : fail('session-active');
    if (typeof bridge.captureLocal !== 'function' || typeof bridge.restoreLocal !== 'function') return fail('runtime-not-ready');
    try {
      const captured = sync(bridge.captureLocal());
      if (!captured || typeof captured !== 'object') throw Error('invalid-local-capture');
      local = localClone(captured); current = { role, session: id }; generation++; guests.clear(); lastError = null;
      if (role === 'host') for (const key of HOST_SEED_KEYS) {
        if (read(key) !== null) continue;
        const baseline = rawGet(key, 'localStorage') ?? rawGet(key, 'sessionStorage');
        if (baseline !== null) write(key, baseline);
      }
      return { ok: true, role, session: id };
    } catch (error) { return fail(error.message); }
  }
  function leave() {
    if (!current) return { ok: true, unchanged: true };
    if (restoring) return fail('restore-in-progress');
    restoring = true;
    try {
      if (sync(bridge.restoreLocal(localClone(local))) === false) throw Error('restore-failed');
      current = null; local = null; guests.clear(); generation++; lastError = null; return { ok: true };
    } catch (error) { return fail(error.message); }
    finally { restoring = false; }
  }
  function persist(envelope, slot) {
    const text = JSON.stringify(encode(envelope));
    if (text.length > MAX_BYTES) throw Error('checkpoint-too-large');
    const key = checkpointKey(slot), previous = rawGet(key, 'localStorage') ?? rawGet(key, 'sessionStorage');
    // Only previously validated checkpoints are retained as a backup.
    if (previous) { try { parse(previous); rawSet(key + '.backup', previous, 'localStorage'); rawSet(key + '.backup', previous, 'sessionStorage'); } catch (_) {} }
    const persistent = rawSet(key, text, 'localStorage'), sessionSafe = rawSet(key, text, 'sessionStorage');
    return { ok: true, persistent, reloadSafe: persistent || sessionSafe, slot: slotName(slot), savedAt: envelope.savedAt };
  }
  function save(slot = 'auto') {
    if (!host()) return fail(current?.role === 'guest' ? 'guest-read-only' : 'host-only');
    try {
      slotName(slot);
      const snapshot = validate(clone(sync(bridge.captureCheckpoint?.())));
      return persist({ kind: KIND, version: 1, session: current.session, savedAt: new Date().toISOString(), snapshot }, slot);
    } catch (error) { return fail(error.message); }
  }
  function exportCheckpoint(slot = 'auto') {
    if (!host()) { fail(current?.role === 'guest' ? 'guest-read-only' : 'host-only'); return null; }
    try {
      const text = rawGet(checkpointKey(slot), 'localStorage') ?? rawGet(checkpointKey(slot), 'sessionStorage');
      parse(text); return text;
    } catch (error) { fail(error.message); return null; }
  }
  function importCheckpoint(text, slot = 'auto') {
    if (!host()) return fail(current?.role === 'guest' ? 'guest-read-only' : 'host-only');
    try { const envelope = parse(text); return persist({ ...envelope, session: current.session }, slot); }
    catch (error) { return fail(error.message); }
  }
  function load(slot = 'auto') {
    if (!host()) return fail(current?.role === 'guest' ? 'guest-read-only' : 'host-only');
    let rollback = null;
    try {
      const envelope = parse(rawGet(checkpointKey(slot), 'localStorage') ?? rawGet(checkpointKey(slot), 'sessionStorage'));
      if (typeof bridge.applyCheckpoint !== 'function') throw Error('runtime-not-ready');
      rollback = validate(clone(sync(bridge.captureCheckpoint())));
      restoring = true;
      const result = sync(bridge.applyCheckpoint(clone(envelope.snapshot), { full: true, transition: true, hostOnly: true, rewards: false, generation }));
      if (result === false || result?.ok === false) throw Error('checkpoint-apply-failed');
      lastError = null; return { ok: true, slot: slotName(slot), savedAt: envelope.savedAt };
    } catch (error) {
      if (rollback) { try {
        const reverted = sync(bridge.applyCheckpoint(rollback, { rollback: true, full: true, transition: true, rewards: false }));
        if (reverted === false || reverted?.ok === false) throw Error('checkpoint-rollback-failed');
      } catch (_) { return fail('checkpoint-rollback-failed'); } }
      return fail(error.message);
    } finally { restoring = false; }
  }
  function list() {
    if (!host()) return [];
    const prefix = scope() + 'checkpoint.', keys = new Set();
    for (const name of ['localStorage', 'sessionStorage']) {
      try { const storage = root[name]; for (let i = 0; i < storage.length; i++) { const key = storage.key(i); if (key?.startsWith(prefix)) keys.add(key); } } catch (_) {}
      for (const key of memory.keys()) if (key.startsWith(name + ':' + prefix)) keys.add(key.slice(name.length + 1));
    }
    const rows = [];
    for (const key of keys) {
      const slot = key.slice(prefix.length); if (!/^[a-zA-Z0-9_-]{1,64}$/.test(slot)) continue;
      try { const e = parse(rawGet(key, 'localStorage') ?? rawGet(key, 'sessionStorage')); rows.push({ slot, savedAt: e.savedAt, zone: e.snapshot.zone ?? null }); } catch (_) {}
    }
    return rows.sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));
  }
  function nativeSave(slot, payload) {
    if (!host()) return fail(current?.role === 'guest' ? 'guest-read-only' : 'host-only');
    try {
      slotName(slot);
      const text = JSON.stringify(encode(payload)), key = slot === 'auto' ? 'mongse_save_v10_auto' : 'mongse_save_v10_slot_' + slot;
      const checkpoint = save(slot); if (!checkpoint.ok) return checkpoint;
      const old = read(key); if (old) write(key + '_backup', old);
      const persistent = write(key, text); write(key + '_mirror', text);
      let sessionSafe = false;
      try { sessionSafe = root.sessionStorage?.getItem(keyFor(key)) === text; } catch (_) {}
      return { ...checkpoint, persistent, reloadSafe: persistent || sessionSafe };
    } catch (error) { return fail(error.message); }
  }
  const status = () => ({ active: !!current, role: current?.role ?? 'solo', session: current?.session ?? null, keyPrefix: current ? scope() : null, restoring, blockedWrites, lastError });
  root.__HAPIL_COOP_STORAGE_RC222__ = Object.freeze({ version: 1, configure, enter, leave, save, export: exportCheckpoint, import: importCheckpoint, load, list, status, read, write, getItem, setItem, removeItem, area, nativeSave, codec: Object.freeze({ encode, decode, clone }) });
})();
