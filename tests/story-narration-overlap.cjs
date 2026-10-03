'use strict';

// Run the real lifecycle implementations against a deterministic DOM and clock.
// The death implementation is extracted, never patched, from the original bundle.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const root = path.resolve(__dirname, '..');
const fallback = process.env.HAPIL_SOURCE_ROOT || root;
const read = name => fs.readFileSync(fs.existsSync(path.join(root, name)) ? path.join(root, name) : path.join(fallback, name), 'utf8');
const storySource = read('assets/rc51/story.js');
const surfaceSource = read('assets/story-narration/v1/surfaces.js');
const bundle = read('assets/index-v31526.js');
const start = bundle.indexOf('function HAPIL_showDeathVerseRC59(state, pending) {');
const end = bundle.indexOf('\n(function HAPIL_installEpisode1DeathAndMidbossDuoRC59', start);
assert(start > 0 && end > start, 'unchanged death lifecycle source exists');
const deathSource = bundle.slice(start, end);
const settle = () => new Promise(resolve => setImmediate(resolve));

function fixture({full = false, initiallyBlocked = false} = {}) {
  const observers = [], timers = new Map(), players = [];
  let now = 0, timerId = 0, commits = 0;
  class Target {
    constructor() { this.events = new Map(); }
    addEventListener(type, callback) {
      if (!this.events.has(type)) this.events.set(type, []);
      this.events.get(type).push(callback);
    }
    removeEventListener(type, callback) {
      this.events.set(type, (this.events.get(type) || []).filter(value => value !== callback));
    }
  }
  const document = new Target(), window = new Target();
  function mutate(target) {
    for (const observer of observers) {
      if (!observer.active || !observer.options.childList) continue;
      if (observer.target === target || (observer.options.subtree && observer.target.contains(target))) {
        queueMicrotask(() => { if (observer.active) observer.callback(); });
      }
    }
  }
  class Element extends Target {
    constructor(tag) {
      super(); this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.attributes = {};
      this.style = {}; this.parent = null; this.className = ''; this.textContent = '';
      this.scrollHeight = 10; this.scrollWidth = 10; this.clientHeight = 600; this.clientWidth = 600;
      const classes = new Set();
      this.classList = {
        contains: name => classes.has(name) || this.className.split(/\s+/).includes(name),
        add: name => classes.add(name), remove: name => classes.delete(name),
        toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name)
      };
    }
    get isConnected() { return this === document.body || !!this.parent?.isConnected; }
    get nextElementSibling() { return this.parent?.children[this.parent.children.indexOf(this) + 1]; }
    append(...children) { for (const child of children) { child.parent = this; this.children.push(child); } mutate(this); }
    prepend(...children) { for (const child of children) child.parent = this; this.children.unshift(...children); mutate(this); }
    remove() { const parent = this.parent; if (parent) { parent.children = parent.children.filter(node => node !== this); this.parent = null; mutate(parent); } }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return this.attributes[name]; }
    focus() { document.activeElement = this; }
    contains(node) { return this === node || this.children.some(child => child.contains(node)); }
    descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
    matches(selector) {
      if (selector.startsWith('#')) return this.id === selector.slice(1);
      if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
      if (selector === '[data-narration-controls]') return this.dataset.narrationControls != null;
      return this.tagName === selector.toUpperCase();
    }
    querySelector(selector) { return this.descendants().find(node => node.matches(selector)) || null; }
    querySelectorAll(selector) { return this.descendants().filter(node => node.matches(selector)); }
    closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector) || null; }
  }
  document.body = new Element('body'); document.documentElement = new Element('html');
  document.readyState = 'complete'; document.hidden = false;
  document.createElement = tag => new Element(tag);
  document.getElementById = id => document.body.descendants().find(node => node.id === id) || null;
  window.innerWidth = 1280; window.innerHeight = 900;
  const reading = {blocked: initiallyBlocked}, state = {zone: 'dist01', hp: 100, time: 0, gameModeV31346: 'STORY'};
  const record = {zone: 'dist01', index: 2, title: 'Fixture', pre: 'Canonical fixture text', paragraphs: ['Canonical fixture text']};
  window.__HAPIL_READING_V31342__ = reading;
  window.__HAPIL_STORY_DATA_RC51__ = {records: [record], raw: ''};
  window.__HAPIL_CONTROLS_V31329__ = {clear() {}, effective: () => full ? 'full' : 'manual', binding: {
    state: {current: state}, input: {current: {clear() {}}}, settings: {current: {sound: false, autoStoryAdvance: true}}
  }};
  window.__HAPIL_STORY_NARRATION_V1__ = {attach({root, key, zone, phase}) {
    root.dataset.narration = key || `${zone}:${phase}`;
    const player = {pauses: 0, stops: 0, pause() { this.pauses++; }, stop() { this.stops++; }, setContext() {}};
    players.push(player); return player;
  }};
  const setTimer = (callback, delay) => { const id = ++timerId; timers.set(id, {callback, at: now + delay}); return id; };
  const clearTimer = id => timers.delete(id);
  window.setTimeout = setTimer; window.clearTimeout = clearTimer;
  const context = vm.createContext({window, document, performance: {now: () => now}, queueMicrotask,
    setTimeout: setTimer, clearTimeout: clearTimer,
    MutationObserver: class {
      constructor(callback) { this.callback = callback; this.active = false; observers.push(this); }
      observe(target, options) { this.target = target; this.options = options; this.active = true; }
      disconnect() { this.active = false; }
    }, HAPIL_isFullAutoV31329: () => full, state});
  vm.runInContext(storySource, context);
  vm.runInContext(deathSource, context);
  vm.runInContext(surfaceSource, context);
  const story = window.__HAPIL_STORY_RC51__;
  story.show(state, record, 'pre', record.pre, () => commits++, {sound: false});
  const primary = document.getElementById('hapil-story-rc51');
  const showDeath = () => { vm.runInContext('HAPIL_showDeathVerseRC59(state,{})', context); return document.getElementById('hapil-death-verse-rc59'); };
  function advance(ms) {
    const destination = now + ms;
    for (;;) {
      const pending = [...timers].filter(([, value]) => value.at <= destination).sort((a, b) => a[1].at - b[1].at)[0];
      if (!pending) break;
      now = pending[1].at; timers.delete(pending[0]); pending[1].callback();
    }
    now = destination;
  }
  function key(key, code, target) {
    const event = {key, code, target, repeat: false, stopped: false, preventDefault() {}, stopPropagation() { this.stopped = true; }, stopImmediatePropagation() { this.stopped = true; }};
    for (const surface of [window, document]) {
      for (const callback of [...(surface.events.get('keydown') || [])]) { callback(event); if (event.stopped) return; }
    }
  }
  return {reading, state, story, primary, players, timers, showDeath, advance, key, document, commits: () => commits};
}

test('death overlap retains ownership until death finishes, then cancels primary without commit', async () => {
  const f = fixture(); const death = f.showDeath(); await settle();
  assert.equal(f.primary.isConnected, true); assert.equal(f.reading.blocked, true);
  assert(f.players[0].pauses > 0, 'underlying narration is silenced');
  assert(Number(death.style.zIndex) > 2147483000, 'death must be visible above primary');
  f.state.zone = 'dist02'; f.state.hp = 0; f.story.beforeFrame(f.state, {sound: false});
  assert.equal(f.primary.isConnected, true, 'lower card cannot release its lock during live death');
  death.finishRC121(); await settle();
  assert.equal(death.isConnected, false); assert.equal(f.primary.isConnected, false);
  assert.equal(f.reading.blocked, false); assert.equal(f.commits(), 0);
});

test('Enter reaches the death restart handler rather than committing the lower card', async () => {
  const f = fixture(); const death = f.showDeath(); await settle();
  f.key('Enter', 'Enter', death.querySelector('button')); await settle();
  assert.equal(death.isConnected, false); assert.equal(f.primary.isConnected, false);
  assert.equal(f.reading.blocked, false); assert.equal(f.commits(), 0);
});

test('overlapping full-auto death keeps its unchanged three-second deadline', async () => {
  const f = fixture({full: true}); const death = f.showDeath(); await settle();
  f.advance(2900); assert.equal(death.isConnected, true);
  f.advance(100); await settle();
  assert.equal(death.isConnected, false); assert.equal(f.primary.isConnected, false);
  assert.equal(f.reading.blocked, false); assert.equal(f.commits(), 0);
});

test('external death DOM removal finalizes death before restoring the primary baseline', async () => {
  const f = fixture(); const death = f.showDeath(); await settle();
  death.remove(); await settle();
  assert.equal(f.primary.isConnected, false); assert.equal(f.reading.blocked, false);
  f.advance(5000); await settle();
  assert.equal(f.reading.blocked, false, 'a late death tick must not resurrect its captured lock');
  assert.equal(f.commits(), 0);
});

test('overlap cleanup preserves a reading lock that predates the primary', async () => {
  const f = fixture({initiallyBlocked: true}); const death = f.showDeath(); await settle();
  death.finishRC121(); await settle();
  assert.equal(f.primary.isConnected, false); assert.equal(f.reading.blocked, true);
  assert.equal(f.commits(), 0);
});

test('a replacement death inherits the deferred primary until the latest death closes', async () => {
  const f = fixture(); const firstDeath = f.showDeath(); await settle();
  const secondDeath = f.showDeath(); await settle();
  assert.equal(firstDeath.isConnected, false); assert.equal(secondDeath.isConnected, true);
  assert.equal(f.primary.isConnected, true, 'old death cleanup must not close under a replacement death');
  assert.equal(f.reading.blocked, true);
  secondDeath.finishRC121(); await settle();
  assert.equal(f.primary.isConnected, false); assert.equal(f.reading.blocked, false);
  assert.equal(f.commits(), 0);
});
