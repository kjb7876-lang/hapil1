'use strict';

// Deterministic HTMLMediaElement fallback races. No browser or audio files needed.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const playerSource = fs.readFileSync(path.join(__dirname, '../assets/story-narration/v1/player.js'), 'utf8');

class Element extends EventTarget {
  constructor(tag = 'div') {
    super();
    this.tagName = tag.toUpperCase();
    this.dataset = {};
    this.attributes = {};
    this.children = [];
    this.isConnected = true;
    this.textContent = '';
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  append(...elements) { this.children.push(...elements); }
  prepend(...elements) { this.children.unshift(...elements); }
  querySelector() { return null; }
  remove() { this.isConnected = false; }
}

const settle = () => new Promise(resolve => setImmediate(resolve));
async function until(predicate, description) {
  for (const deadline = Date.now() + 2000; Date.now() < deadline;) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  assert.fail('Did not observe ' + description);
}

function fixture(options = {}) {
  const {manifestData, fetchManifest, ...attachOptions} = options;
  const clips = [], playRequests = [], fetches = [], timers = new Set(), players = [];
  const root = new Element(), footer = new Element('footer');
  const window = new EventTarget(), document = new EventTarget();
  document.currentScript = {src: 'https://example.test/assets/story-narration/v1/player.js'};
  document.baseURI = document.currentScript.src;
  document.body = new Element('body');
  document.createElement = tag => new Element(tag);
  window.crypto = crypto.webcrypto;
  window.setTimeout = (callback, ms) => {
    const timer = setTimeout(() => { timers.delete(timer); callback(); }, ms);
    timers.add(timer);
    return timer;
  };
  window.clearTimeout = timer => { clearTimeout(timer); timers.delete(timer); };
  class Audio extends EventTarget {
    constructor(url) {
      super();
      this.url = url;
      this.paused = true;
      this.currentTime = 0;
      this.duration = 10;
      this.attributes = {src: url};
      this.loadCalls = 0;
      clips.push(this);
    }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    load() { this.loadCalls++; }
    pause() { this.paused = true; }
    play() {
      this.paused = false;
      return new Promise((resolve, reject) => playRequests.push({clip: this, resolve, reject}));
    }
    emit(type) { this.dispatchEvent(new Event(type)); }
  }
  const data = manifestData || {
    version: 1,
    scenes: {test: {
      textSha256: crypto.createHash('sha256').update('fixture text').digest('hex'),
      clips: [
        {audio: 'audio/first.wav', duration: 10},
        {audio: 'audio/second.wav', duration: 10}
      ]
    }}
  };
  vm.runInNewContext(playerSource, {
    window, document, URL, AbortController, TextEncoder, Audio,
    MutationObserver: class { observe() {} disconnect() {} },
    fetch: async url => { fetches.push(String(url)); return fetchManifest ? fetchManifest(url, data) : {ok: true, json: async () => data}; }
  });
  const player = window.__HAPIL_STORY_NARRATION_V1__.attach({root, footer, text: 'fixture text', key: 'test', ...attachOptions});
  players.push(player);
  function createPlayer() {
    const root = new Element(), footer = new Element('footer');
    const player = window.__HAPIL_STORY_NARRATION_V1__.attach({root, footer, text: 'fixture text', key: 'test', ...attachOptions});
    players.push(player);
    return {player, root, footer};
  }
  async function requestPlay(target = player) {
    const count = playRequests.length;
    const result = target.play();
    await until(() => playRequests.length > count, 'a media play request');
    return {attempt: playRequests.at(-1), result};
  }
  function clean() {
    for (const player of players) player.stop();
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  }
  return {player, root, footer, clips, playRequests, fetches, timers, requestPlay, createPlayer, clean, window, document};
}

test('a missing route removes muted controls without requesting audio or blocking progress', async t => {
  const f = fixture({manifestData: {version: 1, scenes: {}}, ctx: {sound: false}}); t.after(f.clean);
  await until(() => f.player.status === 'unavailable', 'missing route discovery');
  assert.equal(f.footer.children[0].isConnected, false);
  assert.equal(f.player.blocksAdvance, false);
  assert.equal(await f.player.play(), false, 'an omitted route cannot be retried as audio');
  f.player.pause(true); f.window.dispatchEvent(new Event('pagehide'));
  f.document.hidden = false; f.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.player.status, 'unavailable');
  assert.equal(f.fetches.length, 1, 'only shared metadata is requested');
  assert.equal(f.clips.length, 0); assert.equal(f.playRequests.length, 0);
  assert.equal(f.timers.size, 0);
});

test('missing route discovery releases a voice-owned pause after loading was cancelled', async t => {
  let resolveManifest, paused = false, recovered = 0;
  const f = fixture({
    fetchManifest: () => new Promise(resolve => { resolveManifest = resolve; }),
    onUserPause: () => { paused = true; },
    onBlocked: () => { paused = false; recovered++; }
  }); t.after(f.clean);
  const result = f.player.play();
  assert.equal(f.player.blocksAdvance, true);
  f.player.pause(true); assert.equal(paused, true);
  resolveManifest({ok: true, json: async () => ({version: 1, scenes: {}})});
  assert.equal(await result, false);
  await until(() => f.player.status === 'unavailable', 'cancelled missing route discovery');
  assert.equal(paused, false); assert.equal(recovered, 1);
  assert.equal(f.player.blocksAdvance, false); assert.equal(f.clips.length, 0);
  assert.equal(f.footer.children[0].isConnected, false);
  assert.equal(f.timers.size, 0);
});

test('late missing route discovery cannot change a disposed reader or its callbacks', async t => {
  let resolveManifest, recovered = 0;
  const f = fixture({fetchManifest: () => new Promise(resolve => { resolveManifest = resolve; }), onBlocked: () => recovered++}); t.after(f.clean);
  f.player.stop(); const stoppedState = f.player.status;
  resolveManifest({ok: true, json: async () => ({version: 1, scenes: {}})});
  await settle();
  assert.equal(f.player.status, stoppedState); assert.equal(recovered, 0);
  assert.equal(f.clips.length, 0); assert.equal(f.timers.size, 0);
});

test('an existing route with mismatched text stays visibly retryable and never requests audio', async t => {
  const f = fixture({text: 'changed fixture text'}); t.after(f.clean);
  assert.equal(await f.player.play(), false);
  assert.equal(f.player.status, 'blocked'); assert.equal(f.player.blocksAdvance, false);
  assert.equal(f.footer.children[0].isConnected, true);
  assert.match(f.footer.children[0].children[0].textContent, /다시 시도/);
  assert.equal(await f.player.play(), false); assert.equal(f.player.status, 'blocked');
  assert.equal(f.fetches.length, 1); assert.equal(f.clips.length, 0);
});

test('a manifest network failure stays retryable and can recover on the same card', async t => {
  let requests = 0;
  const f = fixture({fetchManifest: (url, data) => ++requests === 1 ? Promise.reject(new Error('offline')) : {ok: true, json: async () => data}}); t.after(f.clean);
  await until(() => f.player.status === 'blocked', 'metadata failure');
  assert.equal(f.footer.children[0].isConnected, true); assert.equal(f.player.blocksAdvance, false);
  const retry = await f.requestPlay(); retry.attempt.resolve();
  assert.equal(await retry.result, true); assert.equal(f.player.status, 'playing');
  assert.equal(requests, 2);
});

test('queued ended event after pause cannot start the next clip', async t => {
  const f = fixture(); t.after(f.clean);
  const {attempt, result} = await f.requestPlay();
  attempt.resolve(); assert.equal(await result, true);
  f.player.pause();
  attempt.clip.emit('ended');
  await settle();
  assert.equal(f.player.status, 'paused');
  assert.equal(f.playRequests.length, 1, 'paused playlist must not advance');
});

test('queued playing/error/ended events after failure cannot revive playback', async t => {
  const f = fixture(); t.after(f.clean);
  const {attempt} = await f.requestPlay();
  attempt.clip.emit('error');
  assert.equal(f.player.status, 'blocked');
  attempt.clip.emit('playing');
  assert.equal(f.player.status, 'blocked', 'stale playing must not revive blocked state');
  attempt.clip.emit('ended'); attempt.clip.emit('error');
  await settle();
  assert.equal(f.player.status, 'blocked');
  assert.equal(f.playRequests.length, 1);
});

test('old fulfilled play promise cannot pause a newer resumed attempt', async t => {
  const f = fixture(); t.after(f.clean);
  const old = await f.requestPlay();
  f.player.pause();
  const current = await f.requestPlay();
  current.attempt.resolve(); assert.equal(await current.result, true);
  assert.equal(current.attempt.clip.paused, false);
  old.attempt.resolve(); assert.equal(await old.result, false);
  assert.equal(f.player.status, 'playing');
  assert.equal(current.attempt.clip.paused, false, 'old continuation must not pause current media');
  assert.equal(f.clips.filter(clip => !clip.paused).length, 1);
});

test('old rejected play promise and events cannot fail a newer attempt', async t => {
  const f = fixture(); t.after(f.clean);
  const old = await f.requestPlay(); f.player.pause();
  const current = await f.requestPlay();
  current.attempt.resolve(); assert.equal(await current.result, true);
  old.attempt.reject(new Error('Old media request was aborted'));
  assert.equal(await old.result, false);
  old.attempt.clip.emit('error'); old.attempt.clip.emit('ended'); old.attempt.clip.emit('playing');
  await settle();
  assert.equal(f.player.status, 'playing');
  assert.equal(current.attempt.clip.paused, false);
  assert.equal(f.playRequests.length, 2);
});

test('pause/resume preserves media offset and releases the previous source', async t => {
  const f = fixture(); t.after(f.clean);
  const first = await f.requestPlay(); first.attempt.resolve(); await first.result;
  first.attempt.clip.currentTime = 4.25;
  f.player.pause();
  assert.equal(f.player.position, 4.25);
  const next = await f.requestPlay();
  assert.equal(next.attempt.clip.currentTime, 4.25);
  assert.equal(first.attempt.clip.paused, true);
  assert.equal(first.attempt.clip.attributes.src, undefined);
  next.attempt.resolve(); assert.equal(await next.result, true);
});

test('playlist advances exactly once, cleans completed media, and replays from first clip', async t => {
  const f = fixture(); t.after(f.clean);
  const first = await f.requestPlay(); first.attempt.resolve(); await first.result;
  assert.match(first.attempt.clip.url, /\/first\.wav$/);
  first.attempt.clip.emit('ended');
  await until(() => f.playRequests.length === 2, 'second playlist clip');
  const second = f.playRequests[1];
  assert.match(second.clip.url, /\/second\.wav$/);
  assert.equal(first.attempt.clip.paused, true);
  assert.equal(first.attempt.clip.attributes.src, undefined);
  first.attempt.clip.emit('ended'); first.attempt.clip.emit('playing');
  await settle();
  assert.equal(f.playRequests.length, 2);
  second.resolve(); await until(() => f.player.playing, 'second clip playing');
  second.clip.emit('ended');
  assert.equal(f.player.status, 'ended');
  assert.equal(second.clip.paused, true);
  assert.equal(second.clip.attributes.src, undefined);
  assert.equal(f.timers.size, 0, 'no load or stall timers after playlist end');
  const replay = await f.requestPlay();
  assert.match(replay.attempt.clip.url, /\/first\.wav$/);
  assert.equal(replay.attempt.clip.currentTime, 0);
  replay.attempt.resolve(); assert.equal(await replay.result, true);
  assert.equal(f.fetches.length, 1, 'metadata is cached; media stays current-clip-only');
});

test('stop during pending playback retires source, events, and late promise', async t => {
  const f = fixture(); t.after(f.clean);
  const pending = await f.requestPlay();
  f.player.stop();
  assert.equal(pending.attempt.clip.paused, true);
  assert.equal(pending.attempt.clip.attributes.src, undefined);
  assert.equal(f.timers.size, 0);
  pending.attempt.clip.emit('playing'); pending.attempt.clip.emit('ended'); pending.attempt.clip.emit('error');
  pending.attempt.resolve(); assert.equal(await pending.result, false);
  await settle();
  assert.equal(f.player.playing, false);
  assert.equal(f.playRequests.length, 1);
});

test('a foreground reader preempts audio without destroying underlying controls', async t => {
  const f = fixture(); t.after(f.clean);
  const original = await f.requestPlay(); original.attempt.resolve(); await original.result;
  const originalControls = f.footer.children[0];
  const foreground = f.createPlayer();
  assert.equal(f.player.status, 'paused');
  assert.equal(original.attempt.clip.paused, true);
  assert.equal(original.attempt.clip.attributes.src, undefined);
  assert.equal(originalControls.isConnected, true, 'underlying reader controls stay usable');
  const front = await f.requestPlay(foreground.player); front.attempt.resolve(); await front.result;
  foreground.player.stop();
  const resumed = await f.requestPlay(); resumed.attempt.resolve();
  assert.equal(await resumed.result, true, 'underlying player can resume after foreground closes');
  assert.equal(f.clips.filter(clip => !clip.paused).length, 1);
});

test('explicit replay on a retained reader preempts the current reader', async t => {
  const f = fixture(); t.after(f.clean);
  const original = await f.requestPlay(); original.attempt.resolve(); await original.result;
  const foreground = f.createPlayer();
  const front = await f.requestPlay(foreground.player); front.attempt.resolve(); await front.result;
  const resumed = await f.requestPlay(); resumed.attempt.resolve(); await resumed.result;
  assert.equal(foreground.player.status, 'paused');
  assert.equal(front.attempt.clip.paused, true);
  assert.equal(f.player.status, 'playing');
  assert.equal(f.clips.filter(clip => !clip.paused).length, 1, 'at most one reader may play');
});


test('pagehide cancels playback but preserves usable controls for a history-cache restore', async t => {
  const f = fixture(); t.after(f.clean);
  const first = await f.requestPlay(); first.attempt.resolve(); assert.equal(await first.result, true);
  first.attempt.clip.currentTime = 2;
  f.window.dispatchEvent(new Event('pagehide'));
  assert.equal(f.player.status, 'paused'); assert.equal(first.attempt.clip.paused, true);
  assert.equal(f.footer.children[0].isConnected, true);
  first.attempt.clip.emit('ended'); first.attempt.clip.emit('playing'); await settle();
  assert.equal(f.playRequests.length, 1, 'history suspension must not auto-resume or advance');
  const next = await f.requestPlay(); assert.equal(next.attempt.clip.currentTime, 2);
  next.attempt.resolve(); assert.equal(await next.result, true);
});


test('only the final playlist ended event releases auto-advance after a 750 ms tail', async t => {
  let ended = 0, clock = 0;
  const f = fixture({onEnded: () => ended++}); t.after(f.clean);
  f.window.performance = {now: () => clock};
  const first = await f.requestPlay(); assert.equal(f.player.blocksAdvance, true);
  first.attempt.resolve(); await first.result; first.attempt.clip.emit('ended');
  await until(() => f.playRequests.length === 2, 'the final playlist request');
  assert.equal(ended, 0); assert.equal(f.player.blocksAdvance, true);
  const second = f.playRequests[1]; second.resolve(); await settle();
  assert.equal(f.player.ended, false); assert.equal(f.player.blocksAdvance, true);
  second.clip.emit('ended'); assert.equal(ended, 1); assert.equal(f.player.ended, true);
  clock = 749; assert.equal(f.player.blocksAdvance, true);
  clock = 750; assert.equal(f.player.blocksAdvance, false);
  second.clip.emit('ended'); assert.equal(ended, 1);
});

test('stalled playback has bounded recovery even when media emits no waiting or ended event', async t => {
  let clock = 0, progress;
  const f = fixture(); t.after(f.clean); f.window.performance = {now: () => clock};
  const schedule = f.window.setTimeout;
  f.window.setTimeout = (fn, ms) => { const timer = schedule(fn, ms); if (ms === 1000) progress = {fn, timer}; return timer; };
  const first = await f.requestPlay(); first.attempt.resolve(); await first.result;
  clock = 15000; f.window.clearTimeout(progress.timer); progress.fn();
  assert.equal(f.player.status, 'blocked'); assert.equal(f.player.blocksAdvance, false);
  assert.equal(first.attempt.clip.paused, true);
});

test('background suspension resumes the same offset without reviving obsolete media events', async t => {
  const f = fixture(); t.after(f.clean);
  const first = await f.requestPlay(); first.attempt.resolve(); await first.result;
  first.attempt.clip.currentTime = 3;
  f.document.hidden = true; f.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.player.status, 'paused'); assert.equal(first.attempt.clip.paused, true);
  f.document.hidden = false; f.document.dispatchEvent(new Event('visibilitychange'));
  await until(() => f.playRequests.length === 2, 'foreground resume');
  const second = f.playRequests[1]; assert.equal(second.clip.currentTime, 3);
  first.attempt.clip.emit('playing'); first.attempt.clip.emit('ended'); second.resolve(); await settle();
  assert.equal(f.player.playing, true); assert.equal(f.playRequests.length, 2);
  f.player.pause(true); f.document.hidden = true; f.document.dispatchEvent(new Event('visibilitychange'));
  f.document.hidden = false; f.document.dispatchEvent(new Event('visibilitychange')); await settle();
  assert.equal(f.player.status, 'paused'); assert.equal(f.playRequests.length, 2, 'manual pause remains manual');
});
