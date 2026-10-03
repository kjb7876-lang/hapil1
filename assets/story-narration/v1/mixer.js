/* Transient narration ownership; never changes saved music/sound settings. */
(() => {
  'use strict';
  const owners = new Set(), listeners = new Set();
  const emit = callback => { try { callback(owners.size > 0); } catch {} };
  window.__HAPIL_NARRATION_MIX_V1__ = Object.freeze({
    set(owner, audible) {
      if (!owner) return;
      const before = owners.size > 0;
      if (audible === true) owners.add(owner); else owners.delete(owner);
      if (before !== (owners.size > 0)) for (const callback of listeners) emit(callback);
    },
    subscribe(callback) {
      if (typeof callback !== 'function') return () => {};
      listeners.add(callback); emit(callback);
      return () => listeners.delete(callback);
    },
    get audible() { return owners.size > 0; },
  });
})();
