'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/rc139/narration-start.js'), 'utf8');
const nativeSource = fs.readFileSync(path.join(root, 'assets/rc49/story-voice.js'), 'utf8');
const settle = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
  await new Promise(resolve => setImmediate(resolve));
};

function fixture() {
  const timers = new Map(), clips = [];
  let now = 0, timerId = 0, nativePauses = 0, nativeStops = 0;
  const document = {hidden: false};
  const window = {
    document,
    setTimeout(callback, delay) {
      const id = ++timerId;
      timers.set(id, {callback, at: now + delay});
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    Audio: class {
      constructor(src) {
        this.src = src; this.currentTime = 0; this.duration = 54.65;
        this.readyState = 4; this.paused = true; this.volume = 1;
        clips.push(this);
      }
      setAttribute() {}
      removeAttribute(name) { if (name === 'src') this.src = ''; }
      load() {}
      pause() { this.paused = true; }
      play() { this.paused = false; return Promise.resolve(); }
    }
  };
  const original = {
    unlock() { return true; },
    create() {
      return {
        audioContext: null,
        playing: false,
        paused: true,
        status: 'paused',
        position: 0,
        duration: 54.65,
        get backend() { return 'media'; },
        get contextState() { return null; },
        async play() { return false; },
        pause() { nativePauses++; },
        stop() { nativeStops++; }
      };
    }
  };
  window.__HAPIL_STORY_VOICE_RC49__ = original;
  vm.runInNewContext(source, {window, AbortController});

  let reader, hostState = 'idle', blocked = 0, ended = 0;
  reader = window.__HAPIL_STORY_VOICE_RC49__.create('opening-memory.wav', {
    onPlaying() { hostState = 'playing'; },
    onEnded() { hostState = 'ended'; ended++; },
    onBlocked() {
      if (hostState !== 'loading' && hostState !== 'playing') return;
      blocked++;
      // Match originalNarration.failed(): retire the clip, then publish blocked.
      reader.pause();
      hostState = 'blocked';
    }
  });

  async function advance(ms) {
    const destination = now + ms;
    for (;;) {
      const due = [...timers].filter(([, timer]) => timer.at <= destination)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      now = due[1].at;
      timers.delete(due[0]);
      due[1].callback();
      await settle();
    }
    now = destination;
    await settle();
  }
  async function playToStart() {
    const pending = reader.play();
    await settle();
    assert.equal(clips.length > 0, true, 'media fallback created an Audio element');
    await advance(500);
    assert.equal(await pending, true);
    assert.equal(reader.playing, true);
    return clips.at(-1);
  }
  return {
    reader, clips, advance, playToStart,
    state: () => hostState, blocked: () => blocked, ended: () => ended,
    nativePauses: () => nativePauses, nativeStops: () => nativeStops
  };
}

function mutableFixture({decodeFails = false, fetchAudio} = {}) {
  const timers = new Map(), clips = [], sources = [], gains = [], fetches = [], unlockArgs = [];
  let now = 0, timerId = 0, decodeCount = 0, nativePlays = 0, nativePauses = 0, nativeStops = 0;
  const document = {hidden: false};
  const buffer = {duration: 54.65, length: 1311600};
  const context = {
    state: 'running', currentTime: 0, sampleRate: 24000, destination: {},
    async resume() { this.state = 'running'; },
    async decodeAudioData(bytes) {
      decodeCount++;
      if (decodeFails) throw Error('decoder unavailable');
      return buffer;
    },
    createBufferSource() {
      const node = {
        onended: null, stopped: 0, disconnected: false,
        connect(target) { this.destination = target; },
        disconnect() { this.disconnected = true; },
        start(when, offset) { this.startArgs = [when, offset]; this.startedAt = context.currentTime; },
        stop() { this.stopped++; },
        finish() { this.onended?.(); }
      };
      sources.push(node); return node;
    },
    createGain() {
      const node = {gain: {value: 1}, disconnected: false, connect() {}, disconnect() { this.disconnected = true; }};
      gains.push(node); return node;
    }
  };
  const window = {
    document,
    setTimeout(callback, delay) {
      const id = ++timerId;
      timers.set(id, {callback, at: now + delay});
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    async fetch(path, options) {
      fetches.push({path, signal: options?.signal});
      return fetchAudio ? fetchAudio(path, options) : {ok: true, arrayBuffer: async () => new ArrayBuffer(16)};
    },
    Audio: class {
      constructor(src) {
        this.src = src; this.currentTime = 0; this.duration = 54.65;
        this.readyState = 4; this.paused = true; this.volume = 1;
        clips.push(this);
      }
      setAttribute() {}
      removeAttribute(name) { if (name === 'src') this.src = ''; }
      load() {}
      pause() { this.paused = true; }
      play() { this.paused = false; return Promise.resolve(); }
    }
  };
  const original = {
    unlock(...args) { unlockArgs.push(args); return true; },
    create(path) {
      return {
        get audioContext() { return context; },
        get contextState() { return context.state; },
        get backend() { return 'webaudio'; },
        get playing() { return false; },
        get paused() { return true; },
        get status() { return 'paused'; },
        get position() { return 0; },
        get duration() { return buffer.duration; },
        async play() { nativePlays++; return false; },
        pause() { nativePauses++; },
        stop() { nativeStops++; }
      };
    }
  };
  window.__HAPIL_STORY_VOICE_RC49__ = original;
  vm.runInNewContext(source, {window, AbortController});

  let reader, hostState = 'idle', blocked = 0, ended = 0, playing = 0;
  reader = window.__HAPIL_STORY_VOICE_RC49__.create('opening-memory.wav', {
    mutableVolume: true, volume: .8,
    onPlaying() { hostState = 'playing'; playing++; },
    onEnded() { hostState = 'ended'; ended++; },
    onBlocked() {
      if (hostState !== 'loading' && hostState !== 'playing') return;
      blocked++;
      reader.pause();
      hostState = 'blocked';
    }
  });

  async function advance(ms) {
    const destination = now + ms;
    for (;;) {
      const due = [...timers].filter(([, timer]) => timer.at <= destination)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      now = due[1].at;
      timers.delete(due[0]);
      due[1].callback();
      await settle();
    }
    now = destination;
    await settle();
  }
  async function playToStart() {
    hostState = 'loading';
    const pending = reader.play();
    await settle();
    await advance(500);
    assert.equal(await pending, true);
    assert.equal(reader.playing, true);
    return {source: sources.at(-1), gain: gains.at(-1), media: clips.at(-1)};
  }
  return {
    reader, context, buffer, sources, gains, clips, fetches, unlockArgs, advance, playToStart,
    counts: () => ({decodeCount, nativePlays, nativePauses, nativeStops, blocked, ended, playing})
  };
}

function actualNativeFixture({decodeFails = false} = {}) {
  const clips = [], sources = [], gains = [], fetches = [], contexts = [], timers = new Map();
  let timerId = 0;
  const audioBuffer = {duration: 54.65, length: 1311600};
  const window = {
    document: {hidden: false},
    setTimeout(callback) {
      const id = ++timerId;
      timers.set(id, callback);
      queueMicrotask(() => {
        const current = timers.get(id);
        if (current) { timers.delete(id); current(); }
      });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    async fetch(path) {
      fetches.push(path);
      return {ok: true, arrayBuffer: async () => new ArrayBuffer(16)};
    },
    AudioContext: class {
      constructor() {
        this.state = 'suspended'; this.currentTime = 0; this.sampleRate = 24000;
        this.destination = {}; this.decodeFails = decodeFails; contexts.push(this);
      }
      resume() { this.state = 'running'; return Promise.resolve(); }
      createBuffer(channels, length) { return {channels, length}; }
      async decodeAudioData() {
        if (this.decodeFails) throw Error('decoder unavailable');
        return audioBuffer;
      }
      createBufferSource() {
        const node = {
          onended: null, disconnected: false,
          connect(target) { this.destination = target; },
          disconnect() { this.disconnected = true; },
          start(when, offset) { this.startArgs = [when, offset]; },
          stop() { this.stopped = true; }
        };
        sources.push(node); return node;
      }
      createGain() {
        const node = {gain: {value: 1}, disconnected: false, connect() {}, disconnect() { this.disconnected = true; }};
        gains.push(node); return node;
      }
    },
    Audio: class {
      constructor(src) {
        this.src = src; this.currentTime = 0; this.duration = audioBuffer.duration;
        this.readyState = 4; this.paused = true; this.volume = 1; clips.push(this);
      }
      setAttribute() {}
      removeAttribute(name) { if (name === 'src') this.src = ''; }
      load() {}
      pause() { this.paused = true; }
      play() { this.paused = false; return Promise.resolve(); }
    }
  };
  vm.runInNewContext(nativeSource, {window, AbortController});
  vm.runInNewContext(source, {window, AbortController});
  return {window, audioBuffer, clips, sources, gains, fetches, contexts};
}

test('original media error retry resumes at the saved offset; pause and ended behavior remain intact', async () => {
  const f = fixture();
  const first = await f.playToStart();
  first.currentTime = 4.25;
  first.onerror();
  assert.equal(f.state(), 'blocked');
  assert.equal(f.blocked(), 1);
  assert.equal(first.paused, true, 'the native host pauses after its blocked callback');

  const retried = await f.playToStart();
  assert.equal(retried.currentTime, 4.25, 'retry resumes after the last heard sample');

  retried.currentTime = 7.5;
  f.reader.pause();
  const resumed = await f.playToStart();
  assert.equal(resumed.currentTime, 7.5, 'ordinary pause still preserves its offset');

  resumed.onended();
  assert.equal(f.ended(), 1);
  const replay = await f.playToStart();
  assert.equal(replay.currentTime, 0, 'a completed recording still replays from its beginning');
});

test('stale media errors after replacement and stop cannot block playback or leak the element', async () => {
  const f = fixture();
  const first = await f.playToStart();
  first.currentTime = 3;
  const staleError = first.onerror;
  f.reader.pause();
  const replacement = await f.playToStart();
  assert.equal(replacement.currentTime, 3);
  staleError();
  assert.equal(f.reader.playing, true, 'an obsolete element cannot block the replacement');
  assert.equal(f.blocked(), 0);

  const lateError = replacement.onerror;
  f.reader.stop();
  assert.equal(replacement.onerror, null, 'stop removes media handlers');
  assert.equal(replacement.onplaying, null);
  assert.equal(replacement.onended, null);
  assert.equal(replacement.paused, true);
  assert.equal(replacement.src, '', 'stop releases the media source');
  assert.equal(f.nativeStops(), 1);
  lateError();
  assert.equal(f.blocked(), 0, 'a captured late error after stop is ignored');
});

test('mutable WebAudio gain follows settings; resume offset and decoded end remain exact', async () => {
  const f = mutableFixture();
  const first = await f.playToStart();
  assert.deepEqual(f.unlockArgs, [[]], 'mutable mode unlocks without asking RC49 to prefetch a second PCM copy');
  assert.equal(f.counts().decodeCount, 1);
  assert.equal(f.counts().nativePlays, 0, 'mutable mode owns its single decoded source');
  assert.deepEqual(first.source.startArgs, [0, 0]);
  assert.equal(first.gain.gain.value, .8);

  f.reader.setVolume(.25);
  assert.equal(first.gain.gain.value, .25, 'live settings update the active WebAudio gain');
  f.context.currentTime = 4.125;
  f.reader.pause();
  assert.equal(f.reader.position, 4.125);
  assert.equal(first.source.stopped, 1);
  assert.equal(first.source.disconnected, true);
  assert.equal(first.gain.disconnected, true);

  f.reader.setVolume(.4);
  const resumed = await f.playToStart();
  assert.deepEqual(resumed.source.startArgs, [0, 4.125], 'pause resumes at the precise saved offset');
  assert.equal(resumed.gain.gain.value, .4, 'the new source uses the latest setting');
  assert.equal(f.counts().decodeCount, 1, 'pause/resume reuses only the current reader buffer');

  f.context.currentTime = resumed.source.startedAt + f.buffer.duration - resumed.source.startArgs[1];
  const ended = resumed.source.onended;
  ended(); ended();
  assert.equal(f.counts().ended, 1, 'the actual decoded source end notifies once');
  assert.equal(f.reader.status, 'ended');
  const replay = await f.playToStart();
  assert.deepEqual(replay.source.startArgs, [0, 0], 'replay starts from the beginning');
  assert.equal(f.counts().decodeCount, 2, 'finished reader releases the prior decoded buffer');
});

test('mutable media fallback applies live volume, retains offset, and cleans up on stop', async () => {
  const f = mutableFixture({decodeFails: true});
  const first = await f.playToStart();
  assert.equal(f.reader.backend, 'media');
  assert.equal(first.media.volume, .8);
  f.reader.setVolume(.3);
  assert.equal(first.media.volume, .3, 'live settings update the fallback element');

  first.media.currentTime = 5.5;
  first.media.onerror();
  assert.equal(f.counts().blocked, 1, 'the host receives the media error once');
  const resumed = await f.playToStart();
  assert.equal(resumed.media.currentTime, 5.5, 'media error retry resumes at its saved offset');
  assert.equal(resumed.media.volume, .3);

  resumed.media.currentTime = 9.25;
  f.reader.pause();
  const pausedResume = await f.playToStart();
  assert.equal(pausedResume.media.currentTime, 9.25, 'ordinary media pause also preserves its offset');
  const lateError = pausedResume.media.onerror;
  f.reader.stop();
  assert.equal(pausedResume.media.onerror, null);
  assert.equal(pausedResume.media.paused, true);
  assert.equal(pausedResume.media.src, '');
  lateError?.();
  assert.equal(f.counts().blocked, 1, 'stopped fallback ignores a captured late error');
  assert.equal(f.counts().nativeStops, 1);
});

test('mutable mode ignores fetch/decode completion after stop and releases pending work', async () => {
  let resolveFetch;
  const f = mutableFixture({fetchAudio: () => new Promise(resolve => { resolveFetch = resolve; })});
  const pending = f.reader.play();
  await settle();
  assert.equal(f.fetches.length, 1);
  f.reader.stop();
  assert.equal(f.fetches[0].signal.aborted, true);
  resolveFetch({ok: true, arrayBuffer: async () => new ArrayBuffer(16)});
  assert.equal(await pending, false);
  assert.equal(f.sources.length, 0, 'stale decode completion cannot create a source');
  assert.equal(f.counts().nativeStops, 1);
});

test('mutable volume and completion work through the actual RC49 native transport', async () => {
  const f = actualNativeFixture();
  let playing = 0, ended = 0;
  const reader = f.window.__HAPIL_STORY_VOICE_RC49__.create('opening-memory.wav', {
    mutableVolume: true, volume: .7,
    onPlaying() { playing++; }, onEnded() { ended++; }
  });
  assert.equal(await reader.play(), true);
  assert.equal(playing, 1);
  assert.equal(f.fetches.length, 1, 'mutable mode avoids RC49 path prefetch and second PCM decode');
  assert.equal(reader.audioContext, f.contexts[0]);
  assert.equal(reader.backend, 'webaudio');
  const source = f.sources.at(-1), gain = f.gains.at(-1);
  assert.deepEqual(source.startArgs, [0, 0]);
  assert.equal(gain.gain.value, .7);
  reader.setVolume(.2);
  assert.equal(gain.gain.value, .2, 'the real native context gain changes immediately');
  const onended = source.onended;
  onended(); onended();
  assert.equal(ended, 1, 'actual decoded completion notifies once');
  assert.equal(source.disconnected, true);
  assert.equal(gain.disconnected, true);
  reader.stop();
});

test('actual RC49 plus mutable media fallback preserves blocked callback pause ordering and retry offset', async () => {
  const f = actualNativeFixture({decodeFails: true});
  let reader, state = 'loading', blocked = 0;
  reader = f.window.__HAPIL_STORY_VOICE_RC49__.create('opening-memory.wav', {
    mutableVolume: true, volume: .8,
    onPlaying() { state = 'playing'; },
    onBlocked() {
      if (state !== 'loading' && state !== 'playing') return;
      blocked++;
      reader.pause();
      state = 'blocked';
    }
  });
  assert.equal(await reader.play(), true);
  const first = f.clips.at(-1);
  reader.setVolume(.35);
  assert.equal(first.volume, .35);
  first.currentTime = 3.625;
  first.onerror();
  assert.equal(blocked, 1);
  assert.equal(state, 'blocked');
  assert.equal(reader.status, 'blocked');
  assert.equal(first.paused, true, 'native host callback pauses before publishing blocked state');
  assert.equal(await reader.play(), true);
  const retry = f.clips.at(-1);
  assert.equal(retry.currentTime, 3.625);
  assert.equal(retry.volume, .35);
  assert.equal(blocked, 1);
  reader.stop();
  assert.equal(retry.src, '', 'actual native wrapper releases fallback media on stop');
});
