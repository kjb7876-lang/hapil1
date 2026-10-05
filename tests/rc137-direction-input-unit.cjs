"use strict";
const assert = require("node:assert/strict"),
  vm = require("node:vm"),
  fs = require("node:fs"),
  path = require("node:path");
const context = {};
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(
    path.join(__dirname, "../assets/rc137/direction-input.js"),
    "utf8",
  ),
  context,
);
const D = context.__HAPIL_DIRECTION_INPUT_RC137__;
let cleared = 0,
  dodges = 0;
const project = (x, y) => ({ x: 640 + (x - y) * 27, y: (x + y) * 13.5 });
D.bind({
  project,
  clearTarget: (s) => {
    s.target = null;
    s.path = [];
    cleared++;
  },
  resetDodge: (s) => {
    s.autoEvadeUntil31223 = 0;
    dodges++;
  },
});
const projected = (v) => ({ x: 27 * (v.x - v.y), y: 13.5 * (v.x + v.y) });
const headings = [
  ["ArrowUp", 0, -1],
  ["ArrowDown", 0, 1],
  ["ArrowLeft", -1, 0],
  ["ArrowRight", 1, 0],
];
let checks = 0;
const near = (a, b) => {
  assert(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
  checks++;
};
for (const [key, x, y] of headings) {
  const v = D.read(new Set([key])),
    p = projected(v);
  near(Math.hypot(v.x, v.y), 1);
  if (!x) near(p.x, 0);
  if (!y) near(p.y, 0);
  assert(p.x * x + p.y * y > 0);
  checks++;
}
for (const keys of [
  ["ArrowUp", "ArrowRight"],
  ["ArrowUp", "ArrowLeft"],
  ["ArrowDown", "ArrowRight"],
  ["ArrowDown", "ArrowLeft"],
]) {
  const v = D.read(new Set(keys)),
    p = projected(v);
  near(Math.abs(p.x), Math.abs(p.y));
}
for (const keys of [
  ["ArrowUp", "ArrowDown"],
  ["ArrowLeft", "ArrowRight"],
  headings.map((x) => x[0]),
]) {
  const v = D.read(new Set(keys));
  assert(v.held);
  near(v.x, 0);
  near(v.y, 0);
}
// 30/60/120 Hz: prior auto-routing inertia is removed on the first manual frame,
// and exponential acceleration remains on the new requested heading every step.
const end = [];
for (const fps of [30, 60, 120])
  for (const [key, sx, sy] of headings) {
    const s = {
      x: 16,
      y: 16,
      zone: "dist04",
      activeHeroId: "gunner",
      time: 100,
      moveVx: 5,
      moveVy: -2,
      target: { x: 20, y: 12 },
      path: [{}],
      autoEvadeUntil31223: 102,
    };
    const v = D.acquire(s, new Set([key]));
    assert.equal(s.target, null);
    assert.equal(s.autoEvadeUntil31223, 0);
    s.moveVx = s.moveVy = 0;
    const speed = 4.75 * (1 + 3 * 0.07) * (1 + 7 * 0.018);
    for (let i = 0; i < fps; i++) {
      const blend = 1 - Math.exp(-18 / fps);
      s.moveVx += (v.x * speed - s.moveVx) * blend;
      s.moveVy += (v.y * speed - s.moveVy) * blend;
      D.velocity(s);
      const p = projected({ x: s.moveVx, y: s.moveVy });
      if (!sx) near(p.x, 0);
      if (!sy) near(p.y, 0);
      assert(p.x * sx + p.y * sy >= 0);
      s.x += s.moveVx / fps;
      s.y += s.moveVy / fps;
      s.time += 1 / fps;
    }
    const distance = Math.hypot(s.x - 16, s.y - 16);
    assert(distance > speed * 0.93 && distance < speed);
    end.push({ fps, key, distance });
    D.acquire(s, new Set());
    near(s.moveVx, 0);
    near(s.moveVy, 0);
  }
const s = {
  x: 16,
  y: 16,
  zone: "dist04",
  activeHeroId: "gunner",
  time: 100,
  moveVx: 2,
  moveVy: -2,
};
D.acquire(s, new Set(["ArrowUp"]));
const straight = D.constrain(s, { x: 15, y: 15 }),
  slide = D.constrain(s, { x: 15, y: 16 });
near(straight.x, 15);
near(straight.y, 15);
near(slide.x, 16);
near(slide.y, 16);
// Camera translation, uniform zoom and viewport orientation preserve headings.
for (const zoom of [0.3, 1, 2])
  for (const [key, sx, sy] of headings) {
    const v = D.read(new Set([key])),
      a = project(16, 16),
      b = project(16 + v.x, 16 + v.y),
      x = (b.x - a.x) * zoom,
      y = (b.y - a.y) * zoom;
    if (!sx) near(x, 0);
    if (!sy) near(y, 0);
  }
assert(cleared > 0 && dodges > 0);
console.log(
  "PASS RC137 direction input",
  JSON.stringify({ checks, fps: [30, 60, 120], end }),
);
