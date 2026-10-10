'use strict';
// Test-only observer, loaded before authored scripts. Callback ownership,
// return values, delays, `this`, arguments and cancellation IDs are preserved.
function installBootAudit(root) {
  const callbacks = new Map(), ids = new Map(), transitions = [];
  let serial = 0, previous = '', active = true;
  const originals = new Map();
  function flags() {
    const rows = {};
    for (const key of Object.keys(root).filter(k => /^__HAPIL_/.test(k)).sort()) {
      const value = root[key];
      if (value && typeof value === 'object' && ('installed' in value || 'allPass' in value || 'ready' in value)) {
        rows[key] = {installed: value.installed ?? null, allPass: value.allPass ?? null, ready: value.ready ?? null};
      } else if (/NATIVE.*INSTALLED/.test(key)) rows[key] = value;
    }
    return rows;
  }
  function sample(cause) {
    if (!active) return {};
    const dependencies = flags(), identity = JSON.stringify(dependencies);
    if (identity !== previous) {
      const prior=JSON.parse(previous||'{}');previous = identity;const delta=Object.fromEntries(Object.entries(dependencies).filter(([key,value])=>JSON.stringify(prior[key])!==JSON.stringify(value)));if (transitions.length < 160) transitions.push({cause, time: root.performance.now(), delta});
    }
    return dependencies;
  }
  for (const kind of ['setTimeout', 'setInterval', 'requestAnimationFrame']) {
    const native = root[kind];
    originals.set(kind, native);
    root[kind] = function(fn, ...args) {
      if (!active || typeof fn !== 'function') return Reflect.apply(native, this, [fn, ...args]);
      const source = Function.prototype.toString.call(fn), key = kind + '\n' + source;
      let row = callbacks.get(key);
      if (!row && callbacks.size < 180) {
        row = {id: ++serial, kind, name: fn.name, source: source.slice(0, 1000), stack: new Error().stack?.split('\n').slice(2, 5).join('\n'), scheduled: 0, fired: 0, pending: 0, cancelled: 0, delays: [], firstScheduled: root.performance.now(), lastFired: null};
        callbacks.set(key, row);
      }
      if (!row) return Reflect.apply(native, this, [fn, ...args]);
      row.scheduled++; row.pending++;
      if (row.delays.length < 4) row.delays.push(args[0] ?? null);
      let timerId;
      const wrapped = function(...callbackArgs) {
        row.fired++; row.lastFired = root.performance.now();
        if (kind !== 'setInterval') { row.pending--; ids.delete(timerId); }
        sample('before callback ' + row.id);
        try { return Reflect.apply(fn, this, callbackArgs); }
        finally { sample('after callback ' + row.id); }
      };
      timerId = Reflect.apply(native, this, [wrapped, ...args]);
      ids.set(timerId, row);
      return timerId;
    };
  }
  for (const kind of ['clearTimeout', 'clearInterval', 'cancelAnimationFrame']) {
    const native = root[kind];
    originals.set(kind, native);
    root[kind] = function(id) {
      const row = ids.get(id);
      if (row) { row.pending--; row.cancelled++; ids.delete(id); }
      return Reflect.apply(native, this, [id]);
    };
  }
  root.__RC156_BOOT_AUDIT__ = {stop() {active = false; for (const [kind, native] of originals) root[kind] = native;}, snapshot(cause = 'checkpoint') {
    const dependencies = sample(cause);
    return {time: root.performance.now(), date: root.Date.now(), readyState: root.document.readyState,
      moduleFinished: root.__RC156_MODULE_FINISHED__ === true,
      native: root.__HAPIL_RC133_NATIVE__?.installed === true,
      character: root.__HAPIL_CHARACTER_V31342__?.installed === true,
      media: root.__HAPIL_MEDIA_ART_RC133__?.ready === true,
      dependencies, callbacks: [...callbacks.values()].map(row => ({...row, delays: row.delays.slice()})),
      transitions: transitions.slice(), resources: root.performance.getEntriesByType('resource').filter(r => /\.js(?:\?|$)/.test(r.name)).map(r => ({name:r.name, start:r.startTime, duration:r.duration, end:r.responseEnd}))};
  }};
  sample('observer installed');
  return root.__RC156_BOOT_AUDIT__;
}
if (typeof module !== 'undefined' && module.exports) module.exports = {installBootAudit};
else installBootAudit(window);
