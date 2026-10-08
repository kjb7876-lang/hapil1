'use strict';

// Exercise the actual original transport and actual story host together. The
// fake clock controls device interruptions, network delay and real ended events;
// this is a lifecycle regression suite, not physical-device listening QA.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const sources = ['data/story-rc51.js', 'assets/rc49/story-voice.js', 'assets/rc51/story.js'].map(read);
const settle = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return {promise, resolve, reject};
}
class Target {
  constructor() { this.events = new Map(); }
  addEventListener(type, callback) { this.events.set(type, [...(this.events.get(type) || []), callback]); }
  removeEventListener(type, callback) { this.events.set(type, (this.events.get(type) || []).filter(value => value !== callback)); }
  emit(type, event = {}) { for (const callback of [...(this.events.get(type) || [])]) callback(event); }
}
function fixture(options = {}) {
  const window = new Target(), document = new Target(), observers = [], timers = new Map(), audioSources = [], media = [], gains = [], fetches = [], mix = new Map();
  let now = 0, timerId = 0, context, commits = 0;
  const mutation = () => queueMicrotask(() => observers.filter(observer => observer.active).forEach(observer => observer.callback()));
  class Element extends Target {
    constructor(tag) {
      super(); this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.attributes = {}; this.style = {}; this.className = '';
      this.scrollHeight = this.scrollWidth = 10; this.clientHeight = this.clientWidth = 600;
      const classes = new Set();
      this.classList = {toggle(name, value) { value ? classes.add(name) : classes.delete(name); }, remove(name) { classes.delete(name); }};
    }
    get isConnected() { return this === document.body || !!this.parent?.isConnected; }
    append(...children) { for (const child of children) { child.parent = this; this.children.push(child); } mutation(); }
    remove() { if (this.parent) { this.parent.children = this.parent.children.filter(child => child !== this); this.parent = null; mutation(); } }
    setAttribute(name, value) { this.attributes[name] = value; }
    focus() { document.activeElement = this; }
    descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
    matches(selector) {
      if (selector.includes(',')) return selector.split(',').some(part => this.matches(part));
      if (selector.startsWith('.')) return this.className.split(/\s+/).includes(selector.slice(1));
      if (selector === '[data-original-voice-control]') return this.dataset.originalVoiceControl != null;
      if (selector === '[data-narration-controls]') return this.dataset.narrationControls != null;
      if (selector.endsWith(':not([hidden])')) return !this.hidden && this.tagName === selector.split(':')[0].toUpperCase();
      return this.tagName === selector.toUpperCase();
    }
    querySelector(selector) { return this.descendants().find(child => child.matches(selector)) || null; }
    querySelectorAll(selector) { return this.descendants().filter(child => child.matches(selector)); }
    closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector); }
  }
  Object.assign(document, {body: new Element('body'), documentElement: new Element('html'), hidden: false,
    createElement: tag => new Element(tag), getElementById: id => document.body.descendants().find(child => child.id === id) || null});
  class AudioContext extends Target {
    constructor() { super(); context = this; this.state = 'suspended'; this.currentTime = 0; this.sampleRate = 24000; this.destination = {}; this.resumeMode = options.resumeMode || 'auto'; }
    setState(state, emit = true) { this.state = state; if (emit) this.emit('statechange'); }
    resume() {
      if (this.resumeMode === 'hold') return options.resumeRequest?.promise || new Promise(() => {});
      this.setState('running'); return Promise.resolve();
    }
    createBuffer(channels, length, sampleRate) { return {duration: length / sampleRate, length}; }
    createBufferSource() {
      const source = {connect() {}, disconnect() {}, stopCalls: 0,
        start(...args) { this.startArgs = args; this.startedAt = context.currentTime; },
        stop() { this.stopCalls++; },
        finish() { if (!this.finished && !this.stopCalls) { this.finished = true; this.onended?.(); } }};
      audioSources.push(source); return source;
    }
    createGain() { const gain = {gain: {value: 1}, connect() {}}; gains.push(gain); return gain; }
    decodeAudioData(bytes) {
      const buffer = {duration: bytes.path.includes('opening-memory') ? 54.65 : 13.25, length: 1000};
      return options.decode ? options.decode(bytes, buffer) : Promise.resolve(buffer);
    }
  }
  class Audio extends Target {
    constructor(url) { super(); this.url = url; this.currentTime = 0; this.duration = url.includes('opening-memory') ? 54.65 : 13.25; this.paused = true; media.push(this); }
    setAttribute() {} removeAttribute() {} load() {}
    pause() { this.paused = true; }
    play() { this.paused = false; return options.mediaPlay ? options.mediaPlay(this) : Promise.resolve(); }
  }
  const state = {zone: 'dist00', hp: 100, time: 0, gameModeV31346: 'STORY'}, ctx = {sound: options.sound !== false, voiceVolume: options.volume ?? .8};
  Object.assign(window, {AudioContext, innerWidth: 1280, innerHeight: 900,
    setInterval(callback, delay) { const id = ++timerId; timers.set(id, {callback, delay, at: now + delay}); return id; },
    clearInterval(id) { timers.delete(id); },
    fetch(url) { fetches.push(url); return options.fetch ? options.fetch(url) : Promise.resolve(response(url)); },
    __HAPIL_READING_V31342__: {blocked: false},
    __HAPIL_NARRATION_MIX_V1__: {set(owner, active) { mix.set(owner, active); }},
    __HAPIL_CONTROLS_V31329__: {clear() {}, effective: () => options.full === false ? 'manual' : 'full', binding: {settings: {current: {autoStoryAdvance: true}}}}
  });
  const sandbox = vm.createContext({window, document, performance: {now: () => now}, Audio,
    MutationObserver: class {constructor(callback) { this.callback = callback; observers.push(this); } observe() { this.active = true; } disconnect() { this.active = false; }}
  });
  for (const source of sources) vm.runInContext(source, sandbox);
  const story = window.__HAPIL_STORY_RC51__, record = window.__HAPIL_STORY_DATA_RC51__.records.find(value => value.zone === 'dist00');
  story.show(state, record, options.phase || 'pre', record[options.phase || 'pre'], () => commits++, ctx);
  const card = document.getElementById('hapil-story-rc51'), buttons = card.querySelectorAll('button'), voice = buttons[0], pauseAuto = buttons[1], next = buttons[2];
  const narrationSources = () => audioSources.filter(source => source.buffer?.length !== 1 && source.startArgs);
  function advance(milliseconds, {audio = true, frames = true} = {}) {
    const destination = now + milliseconds;
    while (now < destination) {
      const step = Math.min(50, destination - now); now += step;
      if (audio && context?.state === 'running') context.currentTime += step / 1000;
      for (const source of narrationSources()) if (context.currentTime - source.startedAt + source.startArgs[1] >= source.buffer.duration - 1e-8) source.finish();
      for (const clip of media) if (audio && !clip.paused) { clip.currentTime += step / 1000; if (clip.currentTime >= clip.duration - 1e-8) { clip.paused = true; clip.emit('ended'); } }
      for (const [id, timer] of [...timers]) if (timer.at <= now) { timer.at += timer.delay; if (timers.has(id)) timer.callback(); }
      if (frames && card.isConnected) story.beforeFrame(state, ctx);
    }
  }
  function key(code, target = voice, type = 'keydown') {
    const event = {code, target, repeat: false, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopImmediatePropagation() {}};
    window.emit(type, event); return event;
  }
  function hidden(value) { document.hidden = value; document.emit('visibilitychange'); }
  return {window, document, state, story, ctx, card, voice, pauseAuto, next, timers, observers, media, gains, fetches, mix, advance, key, hidden,
    context: () => context, narrationSources, latestSource: () => narrationSources().at(-1), status: () => card.dataset.originalVoiceState,
    commits: () => commits, audible: () => [...mix.values()].some(Boolean), clean: () => story.close(false)};
}
function response(url) { return {ok: true, arrayBuffer: async () => ({path: url})}; }

for (const phase of ['pre', 'post']) test(`original ${phase}: slow fetch holds until actual ending plus 750 ms`, async t => {
  const pending = deferred(), f = fixture({phase, fetch: () => pending.promise}); t.after(f.clean);
  f.advance(6000); assert.equal(f.status(), 'loading'); assert(f.card.isConnected);
  pending.resolve(response(phase === 'pre' ? 'opening-memory.wav' : 'root-memory.wav')); await settle();
  assert.equal(f.status(), 'playing'); assert.equal(f.latestSource().startArgs[1], 0); assert.equal(f.gains.at(-1).gain.value, .8); assert(f.audible());
  f.advance(phase === 'pre' ? 54650 : 13250); assert.equal(f.status(), 'ended'); assert(!f.audible());
  f.advance(700); assert(f.card.isConnected, 'the final sound retains its tail');
  f.advance(50); assert(!f.card.isConnected); assert.equal(f.commits(), 1);
});

test('slow context resume starts the complete original after recovery', async t => {
  const resume = deferred(), f = fixture({resumeMode: 'hold', resumeRequest: resume}); t.after(f.clean);
  f.advance(20000); assert.equal(f.status(), 'interrupted'); assert(f.card.isConnected); assert.equal(f.narrationSources().length, 0);
  f.context().resumeMode = 'auto'; f.context().setState('running'); resume.resolve(); await settle();
  assert.equal(f.status(), 'playing'); assert.equal(f.latestSource().startArgs[1], 0); assert.equal(f.media.length, 0);
});

test('a long user voice pause preserves offset and waits for all remaining speech', async t => {
  const f = fixture({phase: 'post'}); t.after(f.clean); await settle(); f.advance(4000); f.voice.onclick();
  assert.equal(f.status(), 'paused'); assert(!f.audible()); f.advance(90000); assert(f.card.isConnected);
  f.voice.onclick(); await settle(); assert.equal(f.status(), 'playing'); assert(Math.abs(f.latestSource().startArgs[1] - 4) < 1e-6);
  f.advance(9250); assert.equal(f.status(), 'ended'); f.advance(700); assert(f.card.isConnected); f.advance(50); assert(!f.card.isConnected);
});

test('manual auto-advance pause survives voice pause, resume, and completion', async t => {
  const f = fixture({phase: 'post'}); t.after(f.clean); await settle(); f.pauseAuto.onclick(); f.voice.onclick();
  f.advance(30000); f.voice.onclick(); await settle(); f.advance(30000); assert.equal(f.status(), 'ended'); assert(f.card.isConnected);
  f.pauseAuto.onclick(); f.advance(15000); assert(!f.card.isConnected);
});

test('hung loading fails in 15 seconds and its late response cannot play', async t => {
  const pending = deferred(), f = fixture({fetch: () => pending.promise}); t.after(f.clean);
  f.advance(14950); assert.equal(f.status(), 'loading'); f.advance(50); assert.equal(f.status(), 'blocked');
  pending.resolve(response('opening-memory.wav')); await settle(); assert.equal(f.narrationSources().length, 0);
  f.advance(41000); assert(!f.card.isConnected, 'a failed recording does not trap automatic progress');
});

test('a running transport with no clock progress fails within 15 seconds', async t => {
  const f = fixture(); t.after(f.clean); await settle(); const source = f.latestSource();
  f.advance(14950, {audio: false}); assert.equal(f.status(), 'playing'); f.advance(50, {audio: false});
  assert.equal(f.status(), 'blocked'); assert.equal(source.stopCalls, 1); assert(!f.audible());
  f.advance(41000); assert(!f.card.isConnected);
});

test('Retry after a running stall preserves the last spoken offset', async t => {
  const f = fixture(); t.after(f.clean); await settle(); f.advance(4000);
  f.advance(15000, {audio: false}); assert.equal(f.status(), 'blocked');
  f.voice.onclick(); await settle(); assert.equal(f.status(), 'playing');
  assert(Math.abs(f.latestSource().startArgs[1] - 4) < 1e-6); assert(f.audible());
});

for (const interrupted of ['interrupted', 'suspended']) test(`visible ${interrupted} context holds beyond timeout and resumes the saved offset`, async t => {
  const f = fixture({phase: 'post'}); t.after(f.clean); await settle(); f.advance(4000); const first = f.latestSource();
  f.context().setState(interrupted); assert.equal(f.status(), 'interrupted'); assert.equal(first.stopCalls, 1); assert(!f.audible());
  f.advance(90000); assert.equal(f.status(), 'interrupted'); assert(f.card.isConnected); assert.equal(f.media.length, 0);
  f.context().setState('running'); await settle(); assert.equal(f.status(), 'playing'); assert(Math.abs(f.latestSource().startArgs[1] - 4) < 1e-6);
  f.advance(9950); assert(f.card.isConnected); f.advance(50); assert(!f.card.isConnected);
});

test('interruption during decode cancels fallback and pending playback', async t => {
  const pending = deferred(); let buffer;
  const f = fixture({decode: (_, value) => { buffer = value; return pending.promise; }}); t.after(f.clean); await settle();
  f.context().setState('interrupted'); pending.resolve(buffer); await settle(); f.advance(30000);
  assert.equal(f.status(), 'interrupted'); assert.equal(f.narrationSources().length, 0); assert.equal(f.media.length, 0);
  f.context().setState('running'); await settle(); assert.equal(f.status(), 'playing'); assert.equal(f.latestSource().startArgs[1], 0);
});

test('a delayed statechange still becomes a resumable hold before stall failure', async t => {
  const f = fixture(); t.after(f.clean); await settle(); f.advance(3000);
  f.context().setState('interrupted', false); f.advance(30000); assert.equal(f.status(), 'interrupted'); assert(f.card.isConnected);
  f.context().setState('running', false); f.advance(250); await settle(); assert.equal(f.status(), 'playing');
  assert(Math.abs(f.latestSource().startArgs[1] - 3) < 1e-6);
});

test('explicit pause cancels interruption recovery while a closed context releases its hold', async t => {
  const f = fixture(); t.after(f.clean); await settle(); f.context().setState('interrupted');
  f.story.pauseNarration(); f.context().setState('running'); await settle();
  assert.equal(f.status(), 'paused'); assert.equal(f.narrationSources().length, 1);
  f.voice.onclick(); await settle(); f.context().setState('interrupted'); f.context().setState('closed');
  assert.equal(f.status(), 'blocked'); f.advance(56000); assert(!f.card.isConnected);
});

test('a playing HTML fallback ignores unrelated context suspension', async t => {
  const f = fixture({phase: 'post', decode: () => Promise.reject(new Error('Decoder unsupported'))}); t.after(f.clean); await settle();
  assert.equal(f.status(), 'playing'); assert.equal(f.media.length, 1); f.context().setState('suspended');
  f.advance(13250); assert.equal(f.status(), 'ended'); f.advance(750); assert(!f.card.isConnected);
});

test('a stalled HTML fallback has the same bounded failure', async t => {
  const f = fixture({decode: () => Promise.reject(new Error('Decoder unsupported'))}); t.after(f.clean); await settle();
  f.context().setState('interrupted'); f.advance(15000, {audio: false});
  assert.equal(f.status(), 'blocked'); assert.equal(f.media[0].paused, true); assert(!f.audible());
});

test('resuming an HTML fallback retires its old play promise before starting again', async t => {
  const oldPlay = deferred(); let attempts = 0;
  const f = fixture({decode: () => Promise.reject(new Error('Decoder unsupported')), mediaPlay: clip => {
    clip.emit('playing'); return ++attempts === 1 ? oldPlay.promise : Promise.resolve();
  }}); t.after(f.clean); await settle(); f.advance(4000); f.voice.onclick(); f.voice.onclick();
  await settle(); assert.equal(attempts, 1, 'the legacy pending promise must settle before the new attempt');
  oldPlay.resolve(); await settle(); assert.equal(attempts, 2); assert.equal(f.status(), 'playing'); assert.equal(f.media[0].paused, false);
  assert(Math.abs(f.media[0].currentTime - 4) < 1e-6); f.advance(1000); assert(f.media[0].currentTime > 4.9);
});

test('manual skip immediately stops playing and releases all watchers', async () => {
  const f = fixture(); await settle(); const source = f.latestSource(); f.next.onclick();
  assert(!f.card.isConnected); assert.equal(source.stopCalls, 1); assert.equal(f.commits(), 1); assert(!f.audible());
  assert.equal(f.timers.size, 0); assert(f.observers.every(observer => !observer.active));
  assert.equal(f.context().events.get('statechange').length, 0);
});

test('manual skip during loading commits immediately and cancels the late original', async () => {
  const pending = deferred(), f = fixture({fetch: () => pending.promise}); f.next.onclick();
  assert(!f.card.isConnected); assert.equal(f.commits(), 1); assert.equal(f.timers.size, 0);
  pending.resolve(response('opening-memory.wav')); await settle(); assert.equal(f.narrationSources().length, 0);
});

for (const action of ['close', 'death', 'navigation', 'removal']) test(`${action} cancels a pending original without late playback`, async t => {
  const pending = deferred(), f = fixture({fetch: () => pending.promise}); t.after(f.clean);
  if (action === 'close') f.story.close(false);
  if (action === 'death') { f.state.hp = 0; f.story.beforeFrame(f.state, f.ctx); }
  if (action === 'navigation') { f.state.zone = 'unlisted'; f.story.beforeFrame(f.state, f.ctx); }
  if (action === 'removal') { f.card.remove(); await settle(); }
  pending.resolve(response('opening-memory.wav')); await settle();
  assert(!f.card.isConnected); assert.equal(f.narrationSources().length, 0); assert.equal(f.media.length, 0); assert.equal(f.commits(), 0); assert(!f.audible());
});

for (const action of ['death', 'navigation', 'replacement', 'death-overlay']) test(`context recovery after ${action} never restarts the old original`, async t => {
  const f = fixture(); t.after(f.clean); await settle(); f.context().setState('interrupted'); const count = f.narrationSources().length;
  if (action === 'death') f.state.hp = 0;
  if (action === 'navigation') f.state.zone = 'unlisted';
  if (action === 'replacement') { f.story.close(false); f.state.zone = 'unlisted'; }
  if (action === 'death-overlay') { const death = f.document.createElement('div'); death.id = 'hapil-death-verse-rc59'; f.document.body.append(death); }
  f.context().setState('running'); await settle();
  assert.equal(f.narrationSources().length, count); assert(!f.audible()); assert.equal(f.timers.size, 0);
});

test('hidden playback resumes at its offset, but manual pause and pagehide do not auto-resume', async t => {
  const f = fixture(); t.after(f.clean); await settle(); f.advance(3000); f.hidden(true); f.advance(30000); assert.equal(f.status(), 'paused');
  f.hidden(false); await settle(); assert.equal(f.status(), 'playing'); assert(Math.abs(f.latestSource().startArgs[1] - 3) < 1e-6);
  f.voice.onclick(); f.hidden(true); f.hidden(false); await settle(); assert.equal(f.status(), 'paused');
  f.voice.onclick(); await settle(); f.window.emit('pagehide'); f.context().setState('running'); await settle(); assert.equal(f.status(), 'paused');
});

test('original voice Enter and Space retain native activation without closing the card', async t => {
  const f = fixture(); t.after(f.clean); await settle();
  for (const code of ['Enter', 'Space']) {
    assert.equal(f.key(code).defaultPrevented, false); assert.equal(f.key(code, f.voice, 'keyup').defaultPrevented, false);
    assert(f.card.isConnected); f.voice.onclick(); await settle();
  }
  f.next.focus(); f.key('Tab', f.next); assert.equal(f.document.activeElement, f.voice);
  f.key('Tab', f.voice, 'keyup'); assert.equal(f.document.activeElement, f.voice, 'one Tab press moves focus only once');
  f.key('Escape'); assert(!f.card.isConnected); assert.equal(f.commits(), 1);
});

for (const gesture of ['pointerdown', 'Enter', 'Space']) test(`${gesture} resume intent survives global unlock before the native click`, async t => {
  const f = fixture(); t.after(f.clean); await settle(); f.advance(4000); f.context().setState('interrupted');
  if (gesture === 'pointerdown') f.voice.emit('pointerdown', {button: 0});
  else assert.equal(f.key(gesture).defaultPrevented, false);
  f.window.__HAPIL_STORY_VOICE_RC49__.unlock(); await settle();
  assert.equal(f.status(), 'playing'); const resumed = f.latestSource();
  assert(Math.abs(resumed.startArgs[1] - 4) < 1e-6);
  if (gesture !== 'pointerdown') f.key(gesture, f.voice, 'keyup');
  f.voice.onclick(); await settle();
  assert.equal(f.status(), 'playing', 'click must retain the resume intent observed before unlock');
  assert.equal(f.latestSource(), resumed); assert.equal(resumed.stopCalls, 0);
  if (gesture === 'pointerdown') f.voice.emit('pointerdown', {button: 0}); else f.key(gesture);
  f.voice.onclick(); assert.equal(f.status(), 'paused', 'the next independent gesture can still pause');
});

test('a muted untouched original keeps its text timer and never starts audio', async t => {
  const f = fixture({phase: 'post', sound: false}); t.after(f.clean); await settle();
  f.advance(14050); assert(!f.card.isConnected); assert.equal(f.fetches.length, 0); assert.equal(f.narrationSources().length, 0); assert(!f.audible());
});

test('browser fixture keeps native loading deadlines outside its deliberate hang case', async () => {
  const browser=read('tests/story-narration-browser.cjs'),begin=browser.indexOf('const originalTimeout=window.setTimeout.bind(window);'),end=browser.indexOf('</script>',begin);
  assert(begin>=0&&end>begin,'execute the actual fixture timer adapter');
  const queued=[],window={setTimeout(fn,ms,...args){queued.push({fn,ms,args});return queued.length;}};
  const scope={window};vm.createContext(scope);vm.runInContext(browser.slice(begin,end),scope);
  let fired=0;const callback=value=>{fired+=value;};
  assert.equal(window.setTimeout(callback,15000,2),1);assert.equal(queued[0].ms,15000,'normal cold download/decode keeps the native15s deadline');
  queued[0].fn(...queued[0].args);assert.equal(fired,2,'timer registration retains the real callback and arguments');
  window.__loadTimeout=300;window.setTimeout(callback,15000,3);assert.equal(queued[1].ms,300,'deliberately hung request retains its short bound');
  delete window.__loadTimeout;window.setTimeout(callback,700,4);assert.equal(queued[2].ms,700,'other native timers remain exact');
  const start=browser.indexOf('const start=async'),finish=browser.indexOf('\n const audioCount=',start);assert(start>=0&&finish>start);
  const events=[];scope.url='unit-fixture';scope.page={goto:async url=>{assert.equal(url,scope.url);delete window.__loadTimeout;events.push('navigate');},evaluate:async(fn,arg)=>{scope.arg=arg;return vm.runInContext('('+fn.toString()+')(arg)',scope);},click:async selector=>{assert.equal(selector,'#start');events.push(window.__loadTimeout??15000);}};
  vm.runInContext(browser.slice(start,finish)+';this.startFixture=start;',scope);
  await scope.startFixture(300);assert.deepEqual(events,['navigate',300],'hang override is installed before the real start helper clicks');events.length=0;
  await scope.startFixture();assert.deepEqual(events,['navigate',15000],'next normal fixture restores its independent native loading deadline');
  assert(browser.includes("mode='hang';await start(300);await waitState('blocked')"),'hung-media blocked/skip assertions remain required');
  assert(browser.includes('state,{timeout:6000}'),'real playing-state assertion retains its original6s limit');
});
