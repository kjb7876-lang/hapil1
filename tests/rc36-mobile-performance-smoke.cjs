const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const source = read('assets/hapil-mobile-v31406.js');
const css = read('assets/rc28/mobile-layout.css');
const html = read('index.html');

assert(html.includes('hapil-mobile-v31406.js?v=33601'), 'mobile controller cache key was not advanced');
assert(html.includes('mobile-layout.css?v=33601'), 'mobile layout cache key was not advanced');
assert(css.includes('translate3d(var(--stick-x,0px),var(--stick-y,0px),0)'),
  'joystick knob does not render its current input position');
assert(source.includes('window.requestAnimationFrame'), 'joystick visuals are not frame-coalesced');
assert(!source.includes('old=new Set(r.keys)'), 'joystick still allocates a Set for every move');
assert(source.includes('function startPolling()') && source.includes('function stopPolling()'),
  'visibility-aware mobile UI polling is missing');

const documentListeners = new Map();
const windowListeners = new Map();
const intervals = new Map();
const rafs = new Map();
const styleValues = new Map();
let nextTimer = 1;
let nextRaf = 1;
let now = 10;

function listen(target, name, callback) {
  if (!target.has(name)) target.set(name, []);
  target.get(name).push(callback);
}
function dispatch(target, name, event = {}) {
  for (const callback of target.get(name) || []) callback(event);
}

class FakeElement {
  constructor() {
    this.dataset = {};
    this.disabled = false;
    this.style = {
      setProperty(name, value) { styleValues.set(name, value); },
      removeProperty(name) { styleValues.delete(name); }
    };
  }
  closest() { return this; }
  hasAttribute(name) { return name === 'data-mobile-stick'; }
  getBoundingClientRect() { return {x: 0, y: 0, width: 100, height: 100}; }
  setPointerCapture() {}
  hasPointerCapture() { return false; }
  releasePointerCapture() {}
  setAttribute() {}
  removeAttribute() {}
}

const touchQuery = {
  matches: true,
  addEventListener(name, callback) { listen(windowListeners, `media:${name}`, callback); }
};
const rootElement = {
  classList: {toggle() {}},
  style: {setProperty() {}}
};
const document = {
  hidden: false,
  documentElement: rootElement,
  addEventListener(name, callback) { listen(documentListeners, name, callback); },
  querySelector() { return null; },
  createElement() { return new FakeElement(); }
};
const hero = {zone: 'test', activeHeroId: 'hero', hp: 100, time: 1, x: 0, y: 0};
const input = new Set();
const binding = {
  phase: 'game', state: {current: hero}, input: {current: input}, modal: {current: false},
  blocked() { return false; }, unlockAudio() {}, notify() {}
};
const window = {
  __HAPIL_V31365_RELEASE__: {installed: true},
  __HAPIL_CONTROLS_V31329__: {
    binding, localTwo: () => false, hasHeldLogical: () => false,
    syncLifecycle() {}, clear() {}, dispatch() {}
  },
  __HAPIL_ACTION_CONTRACT_V31406__: {
    capture() { return {}; }, current() { return true; }
  },
  __HAPIL_CHANNEL_V31364__: {pointerIds: new Set(), active: () => false, sessionToken() {}, end() {}},
  __HAPIL_LOOP_V31365__: {awake: () => false},
  addEventListener(name, callback) { listen(windowListeners, name, callback); },
  requestAnimationFrame(callback) { const id = nextRaf++; rafs.set(id, callback); return id; },
  cancelAnimationFrame(id) { rafs.delete(id); }
};
const context = vm.createContext({
  window, document, Element: FakeElement, matchMedia: () => touchQuery,
  localStorage: {getItem: () => null, setItem() {}}, URLSearchParams,
  location: {search: ''}, performance: {now: () => ++now},
  innerHeight: 844, innerWidth: 390,
  setTimeout() { return nextTimer++; },
  setInterval(callback) { const id = nextTimer++; intervals.set(id, callback); return id; },
  clearInterval(id) { intervals.delete(id); },
  clearTimeout() {},
  Number, Object, Math, String, Array, Map, Set, WeakMap, JSON
});

vm.runInContext(source, context);
assert.equal(intervals.size, 1, 'mobile UI polling did not start in the foreground');

const stick = new FakeElement();
const pointerDown = (x, y) => dispatch(documentListeners, 'pointerdown', {
  target: stick, pointerId: 7, button: 0, clientX: x, clientY: y,
  preventDefault() {}, stopImmediatePropagation() {}
});
const pointerMove = (x, y) => dispatch(documentListeners, 'pointermove', {
  pointerId: 7, clientX: x, clientY: y, preventDefault() {}
});

pointerDown(90, 50);
pointerMove(95, 50);
pointerMove(100, 50);
assert.equal(input.has('ArrowRight'), true, 'rightward joystick input was lost');
assert.equal(rafs.size, 1, 'multiple pointer events scheduled more than one visual update per frame');
const [frameId, drawStick] = rafs.entries().next().value;
rafs.delete(frameId);
drawStick(16);
assert.equal(styleValues.get('--stick-x'), '32px', 'joystick thumb did not use the latest pointer position');
assert.equal(styleValues.get('--stick-y'), '0px', 'joystick thumb vertical offset is incorrect');

pointerMove(50, 100);
assert.equal(input.has('ArrowRight'), false, 'old direction was not released when changing direction');
assert.equal(input.has('ArrowDown'), true, 'new direction was not pressed when changing direction');
const [secondFrameId, drawSecondStick] = rafs.entries().next().value;
rafs.delete(secondFrameId);
drawSecondStick(32);
assert.equal(styleValues.get('--stick-x'), '0px');
assert.equal(styleValues.get('--stick-y'), '32px');

dispatch(windowListeners, 'pointerup', {pointerId: 7});
assert.equal(input.has('ArrowDown'), false, 'releasing the joystick left movement held');
assert.equal(styleValues.has('--stick-x'), false, 'releasing the joystick left a stale thumb offset');

document.hidden = true;
dispatch(documentListeners, 'visibilitychange');
assert.equal(intervals.size, 0, 'backgrounding did not stop mobile UI polling');
document.hidden = false;
dispatch(documentListeners, 'visibilitychange');
assert.equal(intervals.size, 1, 'foregrounding did not restart mobile UI polling');

console.log('PASS: joystick input is allocation-light, visuals update once per frame, and hidden tabs pause mobile polling.');
