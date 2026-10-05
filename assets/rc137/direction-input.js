/* RC137: directional controls use screen headings; native world speed is unchanged.
 * Transient ownership only. Encounter teleports/rewinds never pass through this API. */
(function (root) {
  "use strict";
  let native = null;
  const memories = new WeakMap(),
    n = (v) => (Number.isFinite(v) ? v : 0);
  const directions = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  function bind(value) {
    native = value;
  }
  function vector(x, y) {
    if (!x && !y) return { x: 0, y: 0 };
    const p = native.project(0, 0),
      a = native.project(1, 0),
      b = native.project(0, 1),
      ax = a.x - p.x,
      ay = a.y - p.y,
      bx = b.x - p.x,
      by = b.y - p.y,
      det = ax * by - ay * bx;
    if (!Number.isFinite(det) || Math.abs(det) < 1e-8) return { x: 0, y: 0 };
    const dx = (x * by - y * bx) / det,
      dy = (y * ax - x * ay) / det,
      len = Math.hypot(dx, dy);
    return { x: dx / len, y: dy / len };
  }
  function read(keys) {
    const held = directions.some((k) => keys?.has(k)),
      x = Number(!!keys?.has("ArrowRight")) - Number(!!keys?.has("ArrowLeft")),
      y = Number(!!keys?.has("ArrowDown")) - Number(!!keys?.has("ArrowUp"));
    return {
      held,
      screenX: x,
      screenY: y,
      ...(native ? vector(x, y) : { x: 0, y: 0 }),
    };
  }
  function acquire(s, keys) {
    const v = read(keys);
    if (!s || !native) return v;
    const previous = memories.get(s),
      same =
        previous?.zone === s.zone &&
        previous?.hero === s.activeHeroId &&
        s.time >= previous.at;
    if (v.held) {
      native.clearTarget(s);
      native.resetDodge(s, "screen-direction-rc137");
      s.heroRoleNavPath31222 = [];
      s.heroRoleSteeringActive31222 = false;
      if (v.x || v.y)
        s.lastManualBlinkVectorRC79 = {
          x: v.x,
          y: v.y,
          zone: s.zone,
          hero: s.activeHeroId,
        };
      velocity(s, v);
    } else if (same && previous.held) {
      s.moveVx = s.moveVy = 0;
    }
    memories.set(s, { ...v, zone: s.zone, hero: s.activeHeroId, at: s.time });
    return v;
  }
  function velocity(s, v = memories.get(s)) {
    if (!v?.held) return false;
    const along = Math.max(0, n(s.moveVx) * v.x + n(s.moveVy) * v.y);
    s.moveVx = along * v.x;
    s.moveVy = along * v.y;
    return true;
  }
  function constrain(s, p) {
    const v = memories.get(s);
    if (!v?.held || v.zone !== s.zone || v.hero !== s.activeHeroId) return p;
    const dx = p.x - s.x,
      dy = p.y - s.y;
    // Native obstacle/arena clamps may slide in world axes. A held direction
    // stops at that boundary instead of changing the requested screen heading.
    return Math.abs(dx * v.y - dy * v.x) > 1e-7 || dx * v.x + dy * v.y < -1e-7
      ? { x: s.x, y: s.y }
      : p;
  }
  function held(s) {
    const b = root.__HAPIL_CONTROLS_V31329__?.binding;
    return b?.state?.current === s && read(b.input?.current).held;
  }
  root.__HAPIL_DIRECTION_INPUT_RC137__ = Object.freeze({
    version: "RC137",
    bind,
    read,
    vector,
    acquire,
    velocity,
    constrain,
    held,
  });
})(typeof window === "object" ? window : globalThis);
