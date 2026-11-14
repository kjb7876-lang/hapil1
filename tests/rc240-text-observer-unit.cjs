'use strict';
// RC240 boss form: the cross -> hexagram DOM text observer must settle.
// Setting nodeValue queues a characterData mutation record even when the new
// value equals the old one (DOM "replace data"). A text node that holds 십자
// but that fixText leaves as is (e.g. the ep1b08 telegraph "십자 광역 · 교차선 밖으로
// 이동하세요") must not be written back, or the observer re-triggers itself
// forever and the page hangs. Loads the shipped script in a vm with a minimal
// DOM whose mutation delivery follows that rule (no browser needed).
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const file = path.join(__dirname, '..', 'assets', 'rc240', 'boss-form.js');
const source = fs.readFileSync(file, 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); throw e; } }

function makeDom() {
  const observers = [];
  let queue = [];
  const writes = [];
  function notify(rec) { for (const o of observers) if (o.target && contains(o.target, rec.target)) queue.push([o, rec]); }
  function contains(root, node) { for (let n = node; n; n = n.parentNode) if (n === root) return true; return false; }
  class Text {
    constructor(v) { this.nodeType = 3; this.parentNode = null; this._v = String(v); }
    get nodeValue() { return this._v; }
    set nodeValue(v) { this._v = String(v); writes.push(this._v); notify({ type: 'characterData', target: this, addedNodes: [] }); }
    get textContent() { return this._v; }
  }
  class El {
    constructor(tag) { this.nodeType = 1; this.tagName = tag; this.childNodes = []; this.parentNode = null; }
    appendChild(c) { c.parentNode = this; this.childNodes.push(c); notify({ type: 'childList', target: this, addedNodes: [c] }); return c; }
    get textContent() { return this.childNodes.map(c => c.textContent).join(''); }
  }
  class MutationObserver {
    constructor(cb) { this.cb = cb; this.target = null; }
    observe(t) { this.target = t; observers.push(this); }
    disconnect() { const i = observers.indexOf(this); if (i >= 0) observers.splice(i, 1); }
  }
  const body = new El('BODY');
  const document = {
    body, querySelector: () => null,
    createElement: () => ({ width: 0, height: 0, getContext: () => null, toDataURL: () => 'data:image/png;base64,AAAA' }),
    createTreeWalker(root, what) {
      const list = []; (function walk(n) { for (const c of n.childNodes || []) { if (c.nodeType === 3) list.push(c); else walk(c); } })(root);
      let i = 0; return { nextNode: () => (i < list.length ? list[i++] : null) };
    },
  };
  // Deliver queued records in rounds, like microtask checkpoints. Returns the number of rounds.
  function drain(maxRounds = 1000) {
    let rounds = 0;
    while (queue.length && rounds < maxRounds) {
      rounds++;
      const batch = queue; queue = [];
      const by = new Map(); for (const [o, r] of batch) { if (!by.has(o)) by.set(o, []); by.get(o).push(r); }
      for (const [o, recs] of by) o.cb(recs, o);
    }
    return { rounds, pending: queue.length };
  }
  return { Text, El, MutationObserver, document, body, drain, writes };
}

function makeEnv() {
  const dom = makeDom();
  const timers = [];
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, WeakSet, Set, Float32Array, Int32Array, Uint8Array, Uint16Array, Proxy, Reflect, Symbol, Error, RegExp,
    location: { search: '?rc240=1' }, innerWidth: 1280,
    setTimeout: fn => { timers.push(fn); return timers.length; }, setInterval: () => 0, clearInterval() {},
    performance: { now: () => 0 }, Image: class { set src(v) { this._s = v; } get src() { return this._s; } },
    document: dom.document, MutationObserver: dom.MutationObserver,
  };
  sb.window = sb; sb.globalThis = sb;
  let phaseSpriteFn = (cache, a) => a.sprite;
  sb.__HAPIL_RC86_BRIDGE__ = { project: (x, y) => ({ x, y }), zoneActors: () => [], get phaseSprite() { return phaseSpriteFn; }, set phaseSprite(v) { phaseSpriteFn = v; } };
  sb.__HAPIL_LOOP_V31365__ = { afterHit() {}, render() {} };
  sb.__HAPIL_CONTROLS_V31329__ = { binding: { state: { current: null }, cache: { current: {} }, settings: { current: {} } } };
  vm.createContext(sb);
  vm.runInContext(source, sb, { filename: file });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  const api = sb.__HAPIL_BOSS_FORM_RC240__;
  assert.ok(api && api.installed, 'boss form installed');
  assert.strictEqual(api.enabled(), true, 'enabled under rc240=1');
  dom.drain();
  dom.writes.length = 0;
  return { sb, dom, api };
}

const TELEGRAPH = '십자 광역 · 교차선 밖으로 이동하세요';

test('the telegraph text holds 십자 but fixText leaves it unchanged (the case that must not be written back)', () => {
  const { api } = makeEnv();
  assert.ok(TELEGRAPH.includes('십자'));
  assert.strictEqual(api.fixText(TELEGRAPH), TELEGRAPH);
});

test('a characterData change to unchanged-by-fixText 십자 text settles without writing it back', () => {
  const { dom } = makeEnv();
  const span = dom.body.appendChild(new dom.El('SPAN'));
  const t = span.appendChild(new dom.Text('대기'));
  dom.drain(); dom.writes.length = 0;
  t.nodeValue = TELEGRAPH; // the game updates the label
  const r = dom.drain(1000);
  assert.strictEqual(r.pending, 0, 'observer must settle; it kept re-triggering itself for ' + r.rounds + ' rounds');
  assert.deepStrictEqual(dom.writes, [TELEGRAPH], 'only the game write happens; the observer does not rewrite identical text');
  assert.strictEqual(t.nodeValue, TELEGRAPH);
});

test('an added subtree with unchanged-by-fixText 십자 text settles without writing it back', () => {
  const { dom } = makeEnv();
  const div = new dom.El('DIV'); const t = new dom.Text(TELEGRAPH); t.parentNode = div; div.childNodes.push(t);
  dom.body.appendChild(div);
  const r = dom.drain(1000);
  assert.strictEqual(r.pending, 0, 'observer must settle; ran ' + r.rounds + ' rounds');
  assert.deepStrictEqual(dom.writes, [], 'no write for text fixText leaves alone');
});

test('cross text is still rewritten to the hexagram exactly once and then settles', () => {
  const { dom, api } = makeEnv();
  const span = dom.body.appendChild(new dom.El('SPAN'));
  const t = span.appendChild(new dom.Text('대기'));
  dom.drain(); dom.writes.length = 0;
  const before = api.metrics().renames;
  t.nodeValue = '보스 · 역십자가·시체·벽·의자의 현실반전 연속타 견디기';
  const r = dom.drain(1000);
  assert.strictEqual(r.pending, 0, 'settles');
  assert.strictEqual(t.nodeValue, '보스 · 육망성·시체·벽·의자의 현실반전 연속타 견디기');
  assert.strictEqual(dom.writes.length, 2, 'game write + one fix write');
  assert.strictEqual(api.metrics().renames - before, 1, 'one rename counted');
});

console.log(`rc240-text-observer-unit: ${passed} passed`);
