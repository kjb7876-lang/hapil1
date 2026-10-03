'use strict';

// Real player lifecycle with a deterministic WebAudio clock. These are transport
// and cancellation checks, not a physical-device listening or phoneme review.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const playerSource = fs.readFileSync(path.join(__dirname, '../assets/story-narration/v1/player.js'), 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));
async function until(predicate, description) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) return;
    await settle();
  }
  assert.fail('Did not observe ' + description);
}
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
class Element extends Target {
  constructor(tag = 'div') {
    super(); this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.attributes = {}; this.isConnected = true;
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  append(...children) { this.children.push(...children); }
  prepend(...children) { this.children.unshift(...children); }
  querySelector() { return null; }
  closest(selector) { return selector === '[data-narration-play]' && this.dataset.narrationPlay ? this : null; }
  remove() { this.isConnected = false; }
}
function fixture(options = {}) {
  const timers = new Map(), sources = [], gains = [], media = [], fetches = [], players = [], observers = [], resumes = [];
  let now = 0, timerId = 0, context;
  const window = new Target(), document = new Target();
  const buffer = {duration: 10, length: 480000, numberOfChannels: 1};
  class AudioContext extends Target {
    constructor() {
      super(); context = this; this.state = 'suspended'; this.currentTime = 0; this.sampleRate = 48000; this.destination = {}; this.resumeMode = 'auto';
    }
    setState(state, emit = true) { this.state = state; if (emit) this.emit('statechange'); }
    resume() {
      const overridden = options.resume?.(this); if (overridden) return overridden;
      if (this.resumeMode === 'hold') { const request = deferred(); resumes.push(request); return request.promise; }
      if (this.state !== 'closed') this.setState('running');
      return this.state === 'closed' ? Promise.reject(new Error('Closed context')) : Promise.resolve();
    }
    createBuffer(channels, length, sampleRate) { return {numberOfChannels: channels, length, duration: length / sampleRate}; }
    createBufferSource() {
      const source = {
        buffer: null, stopCalls: 0, disconnectCalls: 0,
        connect(target) { this.target = target; },
        disconnect() { this.disconnectCalls++; },
        start(...args) { this.startArgs = args; },
        stop() { this.stopCalls++; },
        finish() { this.onended?.(); }
      };
      sources.push(source); return source;
    }
    createGain() {
      const gain = {gain: {value: 1}, connect(target) { this.target = target; }, disconnect() { this.disconnected = true; }};
      gains.push(gain); return gain;
    }
    decodeAudioData(bytes) { return options.decode ? options.decode(bytes, buffer) : Promise.resolve(buffer); }
  }
  class Audio extends Target {
    constructor(url) { super(); this.url = url; this.currentTime = 0; this.duration = 10; this.paused = true; this.attributes = {src: url}; media.push(this); }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    load() {}
    pause() { this.paused = true; }
    play() { this.paused = false; return options.playMedia ? options.playMedia(this) : Promise.resolve(); }
  }
  Object.assign(document, {currentScript: {src: 'https://example.test/assets/story-narration/v1/player.js'}, body: new Element('body'), hidden: false, createElement: tag => new Element(tag)});
  Object.assign(window, {
    AudioContext, crypto: crypto.webcrypto, performance: {now: () => now},
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, {callback, at: now + delay}); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  const data = options.manifest || {version: 1, scenes: {test: {
    textSha256: crypto.createHash('sha256').update('fixture text').digest('hex'),
    clips: Array.from({length: options.clips || 1}, (_, index) => ({audio: `audio/clip-${index}.mp3`, duration: 10}))
  }}};
  vm.runInNewContext(playerSource, {
    window, document, URL, AbortController, TextEncoder, Audio,
    MutationObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe() { this.active = true; }
      disconnect() { this.active = false; }
    },
    fetch: async (url, request) => {
      const call = {url: String(url), signal: request.signal}; fetches.push(call);
      if (call.url.endsWith('/manifest.json')) return options.fetchManifest ? options.fetchManifest(call, data) : {ok: true, json: async () => data};
      return options.fetchAudio ? options.fetchAudio(call) : {ok: true, arrayBuffer: async () => new ArrayBuffer(1)};
    }
  });
  window.emit('pointerdown', {isTrusted: true});
  function createPlayer(callbacks = {}) {
    const root = new Element(), footer = new Element('footer');
    const player = window.__HAPIL_STORY_NARRATION_V1__.attach({root, footer, key: 'test', text: 'fixture text', ctx: {sound: false, voiceVolume: .8}, ...callbacks});
    player.setContext({sound: true, voiceVolume: .8}); players.push(player);
    return {player, root, footer, button: footer.children[0].children[0]};
  }
  const initial = createPlayer(options.callbacks);
  function advance(milliseconds) {
    const destination = now + milliseconds;
    for (;;) {
      const next = [...timers].filter(([, timer]) => timer.at <= destination).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at; timers.delete(next[0]); next[1].callback();
    }
    now = destination;
  }
  function clean() { for (const player of players) player.stop(); timers.clear(); }
  return {...initial, window, document, context, sources, gains, media, buffer, fetches, timers, resumes, createPlayer, advance, clean,
    narrationSources: () => sources.filter(source => source.buffer?.length !== 1),
    currentSource: () => sources.filter(source => source.buffer?.length !== 1).at(-1),
    removeRoot() { initial.root.remove(); for (const observer of observers) if (observer.active) observer.callback(); },
    hide(hidden) { document.hidden = hidden; document.emit('visibilitychange'); }
  };
}

test('full-buffer onset and exact resume keep constant gain and actual final-ended plus 750 ms', async t => {
  let ended = 0;
  const f = fixture({callbacks: {onEnded: () => ended++}}); t.after(f.clean);
  assert.equal(await f.player.play(), true);
  const first = f.currentSource();
  assert.equal(first.buffer, f.buffer); assert.deepEqual(first.startArgs, [0, 0]);
  assert.equal(f.gains[0].gain.value, .8); assert.equal(first.stopCalls, 0);
  f.context.currentTime = 4.25; f.player.pause(true);
  assert.equal(f.player.position, 4.25); assert.equal(await f.player.play(), true);
  const resumed = f.currentSource(); assert.deepEqual(resumed.startArgs, [0, 4.25]);
  f.context.currentTime = 9.999;
  assert.equal(resumed.stopCalls, 0); assert.equal(f.player.blocksAdvance, true);
  resumed.finish(); assert.equal(ended, 1); assert.equal(f.player.ended, true);
  f.advance(749); assert.equal(f.player.blocksAdvance, true);
  f.advance(1); assert.equal(f.player.blocksAdvance, false);
});

for (const interruptedState of ['suspended', 'interrupted']) {
  test(`${interruptedState} during visible playback holds beyond 15 seconds and resumes the exact offset`, async t => {
    let ended = 0, blocked = 0;
    const f = fixture({callbacks: {onEnded: () => ended++, onBlocked: () => blocked++}}); t.after(f.clean);
    await f.player.play(); f.context.currentTime = 3.125;
    const first = f.currentSource(), staleEnded = first.onended;
    f.context.resumeMode = 'hold'; f.context.setState(interruptedState);
    assert.equal(f.player.status, 'interrupted'); assert.equal(f.player.position, 3.125);
    assert.equal(first.stopCalls, 1); assert.equal(first.disconnectCalls, 1); assert.equal(f.gains[0].disconnected, true);
    assert.equal(f.fetches.at(-1).signal.aborted, true); assert.equal(f.timers.size, 0);
    f.advance(30000); staleEnded(); await settle();
    assert.equal(f.player.blocksAdvance, true); assert.equal(f.player.ended, false);
    assert.equal(f.narrationSources().length, 1); assert.equal(ended, 0); assert.equal(blocked, 0);
    f.context.resumeMode = 'auto'; f.context.setState('running');
    await until(() => f.player.playing, 'context recovery');
    assert.deepEqual(f.currentSource().startArgs, [0, 3.125]);
    staleEnded(); assert.equal(f.player.playing, true); assert.equal(ended, 0);
    f.currentSource().finish(); assert.equal(ended, 1);
    f.advance(750); assert.equal(f.player.blocksAdvance, false);
  });
}

test('play requested while already interrupted waits without downloading audio or timing out', async t => {
  const f = fixture(); t.after(f.clean);
  f.context.resumeMode = 'hold'; f.context.setState('interrupted');
  assert.equal(await f.player.play(), false);
  await settle(); assert.equal(f.player.status, 'interrupted'); assert.equal(f.player.blocksAdvance, true);
  assert.equal(f.fetches.length, 1); assert.equal(f.narrationSources().length, 0);
  f.advance(30000); assert.equal(f.player.status, 'interrupted');
  f.context.resumeMode = 'auto';
  assert.equal(await f.player.play(), true, 'explicit Play can recover without a prior running event');
  assert.deepEqual(f.currentSource().startArgs, [0, 0]);
  for (const request of f.resumes) request.resolve(); await settle();
  assert.equal(f.narrationSources().length, 1, 'old resume promises cannot start duplicate playback');
});

for (const eventType of ['pointerdown', 'keydown']) {
  test(`${eventType} on the resume button cannot turn its own recovery into an immediate pause`, async t => {
    const f = fixture(); t.after(f.clean);
    await f.player.play(); f.context.currentTime = 3;
    f.context.resumeMode = 'hold'; f.context.setState('interrupted');
    f.context.resumeMode = 'auto'; f.window.emit(eventType, {isTrusted: true, target: f.button});
    await settle(); assert.equal(f.player.status, 'interrupted');
    f.button.emit('click'); await until(() => f.player.playing, 'explicit resume click');
    assert.deepEqual(f.currentSource().startArgs, [0, 3]); assert.equal(f.narrationSources().length, 2);
  });
}

test('interruption during audio fetch aborts it and retires a late result', async t => {
  const pending = deferred(); let requests = 0;
  const f = fixture({fetchAudio: () => ++requests === 1 ? pending.promise : {ok: true, arrayBuffer: async () => new ArrayBuffer(1)}}); t.after(f.clean);
  const oldPlay = f.player.play(); await until(() => requests === 1, 'pending audio fetch');
  const request = f.fetches.at(-1); f.context.resumeMode = 'hold'; f.context.setState('interrupted');
  assert.equal(request.signal.aborted, true); assert.equal(f.player.blocksAdvance, true);
  f.advance(30000); assert.equal(f.player.status, 'interrupted');
  f.context.resumeMode = 'auto'; f.context.setState('running'); await until(() => f.player.playing, 'new audio fetch');
  pending.resolve({ok: true, arrayBuffer: async () => new ArrayBuffer(1)});
  assert.equal(await oldPlay, false); assert.equal(f.narrationSources().length, 1); assert.equal(f.player.playing, true);
});

test('interruption during decode retires old PCM without replacing the recovered source', async t => {
  const pending = deferred(); let decodes = 0;
  const f = fixture({decode: (bytes, buffer) => ++decodes === 1 ? pending.promise : Promise.resolve(buffer)}); t.after(f.clean);
  const oldPlay = f.player.play(); await until(() => decodes === 1, 'pending decode');
  f.context.resumeMode = 'hold'; f.context.setState('interrupted');
  f.context.resumeMode = 'auto'; f.context.setState('running'); await until(() => f.player.playing, 'recovered decode');
  const recovered = f.currentSource(); pending.resolve({duration: 99, length: 999999});
  assert.equal(await oldPlay, false); assert.equal(f.currentSource(), recovered); assert.equal(recovered.buffer, f.buffer);
});

test('resume rejection observes interruption before a delayed statechange instead of switching to media', async t => {
  let calls = 0;
  const f = fixture({resume: context => {
    if (++calls === 3) { context.setState('interrupted', false); return Promise.reject(new Error('Interrupted resume')); }
  }}); t.after(f.clean);
  assert.equal(await f.player.play(), false);
  assert.equal(f.player.status, 'interrupted'); assert.equal(f.player.blocksAdvance, true);
  assert.equal(f.media.length, 0); assert.equal(f.narrationSources().length, 0);
  f.context.setState('running'); await until(() => f.player.playing, 'recovery after rejected resume');
  assert.deepEqual(f.currentSource().startArgs, [0, 0]);
});

test('loading timeout observes interruption even if statechange has not arrived', async t => {
  const pending = deferred(); let decoding = false;
  const f = fixture({decode: () => { decoding = true; return pending.promise; }}); t.after(f.clean);
  const result = f.player.play(); await until(() => decoding, 'pending decode');
  f.context.resumeMode = 'hold'; f.context.setState('interrupted', false); f.advance(15000);
  assert.equal(f.player.status, 'interrupted'); assert.equal(f.player.blocksAdvance, true);
  assert.equal(f.media.length, 0); assert.equal(f.timers.size, 0);
  pending.resolve(f.buffer); assert.equal(await result, false);
});

for (const action of ['manual pause', 'stop', 'preempt', 'pagehide', 'DOM removal']) {
  test(`${action} cancels pending interruption recovery and ignores late ended/statechange events`, async t => {
    const f = fixture(); t.after(f.clean);
    await f.player.play(); f.context.currentTime = 2;
    const staleEnded = f.currentSource().onended;
    f.context.resumeMode = 'hold'; f.context.setState('interrupted');
    if (action === 'manual pause') f.player.pause(true);
    if (action === 'stop') f.player.stop();
    if (action === 'preempt') f.createPlayer();
    if (action === 'pagehide') f.window.emit('pagehide');
    if (action === 'DOM removal') f.removeRoot();
    f.context.resumeMode = 'auto'; f.context.setState('running'); staleEnded(); await settle();
    assert.equal(f.narrationSources().length, 1); assert.equal(f.player.playing, false);
    assert.equal(f.player.blocksAdvance, false);
  });
}

test('interruption then backgrounding waits for both running context and visible document', async t => {
  const f = fixture(); t.after(f.clean);
  await f.player.play(); f.context.currentTime = 2.75;
  f.context.resumeMode = 'hold'; f.context.setState('interrupted'); f.hide(true);
  f.context.resumeMode = 'auto'; f.context.setState('running'); await settle();
  assert.equal(f.narrationSources().length, 1); assert.equal(f.player.blocksAdvance, true);
  f.hide(false); await until(() => f.player.playing, 'visible recovery');
  assert.deepEqual(f.currentSource().startArgs, [0, 2.75]);
});

test('backgrounding before interruption keeps the visibility resume intent and exact offset', async t => {
  const f = fixture(); t.after(f.clean);
  await f.player.play(); f.context.currentTime = 1.875; f.hide(true);
  f.context.resumeMode = 'hold'; f.context.setState('interrupted'); f.hide(false);
  await settle(); assert.equal(f.player.status, 'interrupted'); assert.equal(f.player.blocksAdvance, true);
  f.advance(30000); assert.equal(f.player.status, 'interrupted');
  f.context.resumeMode = 'auto'; f.context.setState('running'); await until(() => f.player.playing, 'context after visibility');
  assert.deepEqual(f.currentSource().startArgs, [0, 1.875]);
});

test('manual pause while hidden cancels both visibility and context resume intents', async t => {
  const f = fixture(); t.after(f.clean);
  await f.player.play(); f.context.currentTime = 2; f.hide(true);
  f.context.resumeMode = 'hold'; f.context.setState('interrupted'); f.player.pause(true);
  f.context.resumeMode = 'auto'; f.context.setState('running'); f.hide(false); await settle();
  assert.equal(f.narrationSources().length, 1); assert.equal(f.player.status, 'paused'); assert.equal(f.player.blocksAdvance, false);
});

test('watchdog detects a suspended context even before its statechange event arrives', async t => {
  const f = fixture(); t.after(f.clean);
  await f.player.play(); f.context.currentTime = 2.5;
  f.context.resumeMode = 'hold'; f.context.setState('suspended', false); f.advance(1000);
  assert.equal(f.player.status, 'interrupted'); assert.equal(f.player.position, 2.5);
  f.advance(30000); assert.equal(f.player.blocksAdvance, true);
});

test('real running-context stall preserves retry offset and retains bounded failure recovery', async t => {
  let blocked = 0;
  const f = fixture({callbacks: {onBlocked: () => blocked++}}); t.after(f.clean);
  await f.player.play(); f.context.currentTime = 4; f.advance(1000); f.advance(15000);
  assert.equal(f.player.status, 'blocked'); assert.equal(f.player.blocksAdvance, false);
  assert.equal(f.player.position, 4); assert.equal(blocked, 1);
  assert.equal(await f.player.play(), true); assert.deepEqual(f.currentSource().startArgs, [0, 4]);
});

test('a genuine hung audio request still fails after 15 seconds with a running context', async t => {
  const f = fixture({fetchAudio: ({signal}) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('Aborted'))))}); t.after(f.clean);
  const result = f.player.play(); await until(() => f.fetches.length === 2, 'hung audio request');
  f.advance(15000); assert.equal(await result, false);
  assert.equal(f.player.status, 'blocked'); assert.equal(f.player.blocksAdvance, false);
  assert.equal(f.narrationSources().length, 0);
});

test('a hung manifest retains its own bounded timeout while the context is interrupted', async t => {
  const f = fixture({fetchManifest: ({signal}) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('Aborted'))))}); t.after(f.clean);
  f.context.resumeMode = 'hold'; f.context.setState('interrupted'); await f.player.play();
  assert.equal(f.player.blocksAdvance, true); f.advance(15000);
  await until(() => f.player.status === 'blocked', 'manifest timeout');
  assert.equal(f.player.blocksAdvance, false); assert.equal(f.narrationSources().length, 0);
});

test('interruption does not revive a missing route or replace a manifest network failure with an endless hold', async t => {
  const absent = fixture({manifest: {version: 1, scenes: {}}}); t.after(absent.clean);
  absent.context.resumeMode = 'hold'; absent.context.setState('interrupted'); await absent.player.play();
  await until(() => absent.player.status === 'unavailable', 'missing route');
  assert.equal(absent.player.blocksAdvance, false);
  absent.context.resumeMode = 'auto'; absent.context.setState('running'); await settle();
  assert.equal(absent.narrationSources().length, 0); assert.equal(absent.player.status, 'unavailable');
  const failure = deferred();
  const offline = fixture({fetchManifest: () => failure.promise}); t.after(offline.clean);
  offline.context.resumeMode = 'hold'; offline.context.setState('interrupted'); await offline.player.play();
  failure.reject(new Error('Offline')); await until(() => offline.player.status === 'blocked', 'manifest failure');
  assert.equal(offline.player.blocksAdvance, false); assert.equal(offline.narrationSources().length, 0);
});

test('context interruption leaves an active HTMLMediaElement fallback alone and preserves its failure offset', async t => {
  const f = fixture({decode: () => Promise.reject(new Error('Unsupported decode'))}); t.after(f.clean);
  assert.equal(await f.player.play(), true); const clip = f.media[0]; clip.currentTime = 4.75;
  f.context.resumeMode = 'hold'; f.context.setState('interrupted');
  assert.equal(f.player.playing, true); assert.equal(clip.paused, false);
  clip.emit('error'); assert.equal(f.player.status, 'blocked'); assert.equal(f.player.position, 4.75);
  assert.equal(f.player.blocksAdvance, false);
  f.context.resumeMode = 'auto'; assert.equal(await f.player.play(), true);
  assert.equal(f.media.at(-1).currentTime, 4.75, 'media failure retry starts from the saved position');
});

test('closing an interrupted context releases an unrecoverable hold', async t => {
  const f = fixture(); t.after(f.clean);
  await f.player.play(); f.context.currentTime = 2;
  f.context.resumeMode = 'hold'; f.context.setState('interrupted'); f.context.setState('closed');
  assert.equal(f.player.status, 'blocked'); assert.equal(f.player.position, 2); assert.equal(f.player.blocksAdvance, false);
});

test('playlist transition interrupted during next load retains the next clip and final-ended gate', async t => {
  const secondLoad = deferred(); let requests = 0, ended = 0;
  const f = fixture({clips: 2, callbacks: {onEnded: () => ended++}, fetchAudio: () => ++requests === 2 ? secondLoad.promise : {ok: true, arrayBuffer: async () => new ArrayBuffer(1)}}); t.after(f.clean);
  await f.player.play(); const first = f.currentSource(); first.finish();
  await until(() => requests === 2, 'next clip loading');
  f.context.resumeMode = 'hold'; f.context.setState('interrupted'); f.advance(30000);
  assert.equal(ended, 0); assert.equal(f.player.blocksAdvance, true);
  f.context.resumeMode = 'auto'; f.context.setState('running'); await until(() => f.player.playing, 'next clip recovery');
  assert.match(f.fetches.at(-1).url, /clip-1\.mp3$/); assert.deepEqual(f.currentSource().startArgs, [0, 0]);
  secondLoad.resolve({ok: true, arrayBuffer: async () => new ArrayBuffer(1)}); await settle();
  assert.equal(f.narrationSources().length, 2); f.currentSource().finish(); assert.equal(ended, 1);
  f.advance(749); assert.equal(f.player.blocksAdvance, true); f.advance(1); assert.equal(f.player.blocksAdvance, false);
});
