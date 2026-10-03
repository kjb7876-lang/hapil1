"use strict";

// Exercise the bridge against the actual native manager, with deterministic
// media promises and timers. No browser or network is required.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const assets = path.join(__dirname, "../assets");
const bridgeSource = fs.readFileSync(path.join(assets, "combat-audio/v1/native-bridge.js"), "utf8");
const controllerSource = fs.readFileSync(path.join(assets, "combat-audio/v1/controller.js"), "utf8");
const catalogSource = fs.readFileSync(path.join(assets, "combat-audio/v1/catalog.js"), "utf8");
const bundle = fs.readFileSync(path.join(assets, "index-v31526.js"), "utf8");
const managerStart = bundle.indexOf("MONGSE_makeBgmManager = () =>");
const managerEnd = bundle.indexOf(",\n  Gr = {},", managerStart);
assert.ok(managerStart >= 0 && managerEnd > managerStart, "native manager source is present");
const nativeSource = `var ${bundle.slice(managerStart, managerEnd)};
  globalThis.native = {
    create: MONGSE_makeBgmManager, applyMusic: MONGSE_applyBgm,
    clearTransition: MONGSE_clearBgmTransition, stopElement: MONGSE_stopAudioElement,
    selectAudible: MONGSE_selectAudibleDeck, monitor: MONGSE_monitorBgm,
    resume: MONGSE_resumeBgm, duck: MONGSE_duckBgm,
  };`;
const settle = async () => { for (let i = 0; i < 4; i++) await Promise.resolve(); };

function harness() {
  let clock = 10000;
  let timerId = 0;
  const timers = new Map();
  const created = [];
  const requests = [];
  const nextPlays = [];
  const calls = [];
  const documentListeners = new Map();
  const windowListeners = new Map();
  class FakeDate extends Date { static now() { return clock; } }
  class Audio {
    constructor(src) {
      this.src = src;
      this.paused = true;
      this.ended = false;
      this.currentTime = 0;
      this.volume = 1;
      this.playCalls = 0;
      this.pauseCalls = 0;
      this.loadCalls = 0;
      this.listeners = new Map();
      created.push(this);
    }
    addEventListener(name, callback) { this.listeners.set(name, callback); }
    setAttribute() {}
    load() { this.loadCalls += 1; }
    pause() { this.pauseCalls += 1; this.paused = true; }
    play() {
      this.playCalls += 1;
      this.ended = false;
      const mode = nextPlays.shift();
      if (mode === "throw") throw Error("play rejected");
      if (mode === "pending") {
        return new Promise((resolve, reject) => requests.push({
          clip: this,
          resolve: () => resolve(),
          reject: () => reject(Error("play rejected")),
        }));
      }
      this.paused = false;
      return undefined;
    }
  }
  const document = {
    hidden: false,
    baseURI: "https://game.example/play/",
    addEventListener: (name, callback) => documentListeners.set(name, callback),
  };
  const sandbox = {
    URL, console, Audio, Date: FakeDate, document,
    performance: { now: () => clock },
    location: { href: document.baseURI },
    addEventListener: (name, callback) => windowListeners.set(name, callback),
    setInterval(callback, milliseconds) { const id = ++timerId; timers.set(id, { callback, milliseconds, interval: true }); return id; },
    clearInterval: id => timers.delete(id),
    setTimeout(callback, milliseconds) { const id = ++timerId; timers.set(id, { callback, milliseconds, interval: false }); return id; },
    clearTimeout: id => timers.delete(id),
    MONGSE_assetUrl: src => new URL(src, document.baseURI).href,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const source of [catalogSource, controllerSource, nativeSource, bridgeSource]) vm.runInContext(source, sandbox);
  const native = sandbox.native;
  const manager = native.create();
  manager.unlocked = true;
  const pools = new Map();
  const controller = sandbox.__HAPIL_COMBAT_AUDIO_V1__;
  const { music, effects } = sandbox.__HAPIL_COMBAT_AUDIO_CATALOG_V1__;
  const legacy = { path: "./audio/original.mp3", gain: 0.19, loopStart: 0.1, loopEnd: 300, crossfade: 1 };
  const options = {
    manager, pools, controller, legacyProfiles: { legacy },
    applyMusic: (target, profile, gain) => { calls.push({ type: "music", target, profile, gain }); return native.applyMusic(target, profile, gain); },
    clearTransition: native.clearTransition,
    stopElement: native.stopElement,
    selectAudible: native.selectAudible,
    playEffect: (path, volume, cooldown) => { calls.push({ type: "effect", path, volume, cooldown }); return "native-effect-result"; },
  };
  const bridge = sandbox.__HAPIL_COMBAT_AUDIO_BRIDGE_V1__.create(options);
  const state = { zone: "dist01", hp: 100, time: 1, enemies: [{ id: "wolf-1", hp: 100, kind: "wolf" }] };
  const context = {
    phase: "game", blocked: false, clear: false, rest: false,
    settings: { music: true, sound: true, bgmVolume: 0.7, sfxVolume: 0.8 },
    fallbackProfile: legacy, fallbackGain: 0.12,
  };
  function tickTimers(milliseconds) {
    clock += milliseconds;
    for (const [id, timer] of [...timers]) {
      if (!timers.has(id)) continue;
      if (!timer.interval) timers.delete(id);
      timer.callback();
    }
  }
  function establish(profile = music.clockwork, gain = 0.2) {
    bridge.applyMusic(profile, gain);
    tickTimers(3000);
    return manager.current;
  }
  function clip(path, values = {}) {
    return Object.assign(new Audio(new URL(path, document.baseURI).href), values);
  }
  return {
    bridge, native, manager, pools, controller, state, context, sandbox, options,
    music, effects, legacy, calls, timers, created, requests, nextPlays,
    tickTimers, establish, clip,
    bind() { controller.bind(bridge); },
    sync() { controller.sync(state, context); },
    visibility(hidden) { document.hidden = hidden; documentListeners.get("visibilitychange")(); },
    event(name) { windowListeners.get(name)(); },
  };
}

test("native loop disposal cannot blacklist a healthy recording while genuine errors still fall back", async () => {
  const h = harness();
  const load = h.sandbox.Audio.prototype.load;
  h.sandbox.Audio.prototype.load = function () {
    load.call(this);
    if (this.src === "") queueMicrotask(() => this.listeners.get("error")?.());
  };
  h.bind(); h.sync(); h.tickTimers(3000);
  h.manager.current.currentTime = h.music.clockwork.loopEnd - h.music.clockwork.crossfade + .05;
  h.native.monitor(h.manager); h.tickTimers(3000);
  for (let i = 0; i < 8; i++) await Promise.resolve();
  assert.equal(h.controller.diagnostics.failedPaths, 0);
  assert.equal(h.controller.diagnostics.mode, "combat");
  assert.equal(h.manager.currentPath, h.music.clockwork.path);
  h.manager.current.listeners.get("error")();
  assert.equal(h.controller.diagnostics.failedPaths, 1);
  assert.equal(h.controller.diagnostics.mode, "fallback");
});

test("applyMusic delegates the exact profile and gain to the original manager", () => {
  const h = harness();
  assert.equal(Object.isFrozen(h.bridge), true);
  const deck = h.establish(h.music.timeControl, 0.172);
  assert.equal(h.calls[0].target, h.manager);
  assert.equal(h.calls[0].profile, h.music.timeControl);
  assert.equal(h.calls[0].gain, 0.172);
  assert.equal(deck.volume, 0.172);
  assert.equal(deck.currentTime, h.music.timeControl.loopStart);
  h.native.duck(h.manager, 0.2, 650);
  assert.ok(Math.abs(deck.volume - 0.0344) < 1e-12, "native narration duck remains authoritative");
});

test("pause preserves the audible uploaded offset and gain and clears every retry target", () => {
  const h = harness();
  const deck = h.establish();
  deck.currentTime = 28.75;
  h.manager.needsGestureRetry = true;
  h.manager.retryAt = 50000;
  const originalSrc = deck.src;
  const originalGain = deck.volume;
  h.bridge.pauseMusic();
  assert.equal(deck.currentTime, 28.75);
  assert.equal(deck.src, originalSrc);
  assert.equal(deck.volume, originalGain);
  assert.equal(deck.paused, true);
  assert.equal(h.manager.current, deck);
  assert.equal(h.manager.desiredPath, "");
  assert.equal(h.manager.desiredProfile, null);
  assert.equal(h.manager.targetVolume, 0);
  assert.equal(h.manager.retryAt, 0);
  assert.equal(h.manager.needsGestureRetry, false);
  const playCalls = deck.playCalls;
  h.native.monitor(h.manager);
  h.native.resume(h.manager);
  assert.equal(deck.playCalls, playCalls, "monitor/gesture resume must not restart a paused upload");
  h.bridge.applyMusic(h.music.clockwork, 0.2);
  assert.equal(h.manager.current, deck);
  assert.equal(deck.currentTime, 28.75);
  assert.equal(deck.paused, false);
});

test("pending crossfade cancellation protects the old uploaded deck from stale fulfillment", async () => {
  const h = harness();
  const audible = h.establish();
  audible.currentTime = 31;
  h.nextPlays.push("pending");
  h.bridge.applyMusic(h.music.foldingSpace, 0.3);
  const candidate = h.manager.current;
  const request = h.requests.at(-1);
  const generation = h.manager.transitionId;
  assert.equal(h.manager.retired.has(audible), true);
  assert.notEqual(h.manager.playGuardTimer, null);
  h.bridge.pauseMusic();
  assert.ok(h.manager.transitionId > generation);
  assert.equal(h.manager.current, audible);
  assert.equal(audible.currentTime, 31);
  assert.equal(audible.paused, true);
  assert.equal(candidate.src, "");
  assert.equal(candidate.currentTime, 0);
  assert.equal(h.manager.playGuardTimer, null);
  assert.equal(h.manager.transitionTimer, null);
  assert.equal(h.timers.size, 0);
  request.resolve();
  await settle();
  assert.equal(h.timers.size, 0);
  assert.equal(h.manager.current, audible);
  assert.equal(h.manager.desiredProfile, null);
  assert.equal(candidate.paused, true);
});

test("late rejection after cancellation cannot arm a new upload retry", async () => {
  const h = harness();
  const original = h.establish(h.legacy, 0.13);
  original.currentTime = 45;
  h.nextPlays.push("pending");
  h.bridge.applyMusic(h.music.clockwork, 0.2);
  const candidate = h.manager.current;
  h.bridge.stopMusic();
  h.requests.at(-1).reject();
  await settle();
  assert.equal(h.manager.current, original);
  assert.equal(original.currentTime, 45);
  assert.equal(original.volume, 0.13);
  assert.equal(original.paused, false);
  assert.equal(original.loadCalls, 0);
  assert.equal(candidate.src, "");
  assert.equal(h.manager.needsGestureRetry, false);
  assert.equal(h.manager.retryAt, 0);
  assert.equal(h.manager.desiredProfile, h.legacy);
  assert.equal(h.manager.targetVolume, 0.13);
  h.native.monitor(h.manager);
  assert.equal(h.manager.current, original);
});

test("stop keeps the original bed's current offset and volume during a partial upload fade", () => {
  const h = harness();
  const original = h.establish(h.legacy, 0.18);
  original.currentTime = 91.5;
  h.bridge.applyMusic(h.music.clockwork, 0.2);
  const candidate = h.manager.current;
  h.tickTimers(700);
  const currentGain = original.volume;
  assert.ok(currentGain > 0 && currentGain < 0.18);
  h.bridge.stopMusic();
  assert.equal(h.manager.current, original);
  assert.equal(h.manager.audible, original);
  assert.equal(original.currentTime, 91.5);
  assert.equal(original.volume, currentGain);
  assert.equal(original.paused, false);
  assert.equal(candidate.src, "");
  assert.equal(h.manager.transitioning, false);
  assert.equal(h.manager.transitionKind, "");
  assert.equal(h.timers.size, 0);
});

test("pause keeps an audible uploaded deck and an original crossfade tail without rewinding either", () => {
  const h = harness();
  const original = h.establish(h.legacy, 0.12);
  original.currentTime = 19;
  h.bridge.applyMusic(h.music.clockwork, 0.3);
  const uploaded = h.manager.current;
  h.tickTimers(1700);
  uploaded.currentTime = 1.7;
  const oldGain = original.volume;
  const newGain = uploaded.volume;
  assert.equal(h.manager.audible, uploaded);
  h.bridge.pauseMusic();
  assert.equal(h.manager.current, uploaded);
  assert.equal(uploaded.currentTime, 1.7);
  assert.equal(uploaded.volume, newGain);
  assert.equal(original.currentTime, 19);
  assert.equal(original.volume, oldGain);
  assert.equal(original.loadCalls, 0);
  assert.equal(original.paused, true);
  assert.equal(h.manager.retired.has(original), true);
  h.bridge.applyMusic(h.music.clockwork, 0.3);
  assert.equal(h.manager.current, uploaded);
  assert.equal(uploaded.currentTime, 1.7);
  assert.equal(original.paused, true, "a legacy tail must not keep playing behind the resumed bed");
});

test("stop immediately destroys owned current, audible, and retired decks", () => {
  const h = harness();
  const first = h.establish();
  first.currentTime = 12;
  h.bridge.applyMusic(h.music.foldingSpace, 0.24);
  const second = h.manager.current;
  second.currentTime = 0.75;
  h.bridge.stopMusic();
  for (const deck of [first, second]) {
    assert.equal(deck.src, "");
    assert.equal(deck.currentTime, 0);
    assert.equal(deck.paused, true);
  }
  assert.equal(h.manager.current, null);
  assert.equal(h.manager.audible, null);
  assert.equal(h.manager.retired.size, 0);
  assert.equal(h.manager.desiredPath, "");
  assert.equal(h.manager.desiredProfile, null);
  assert.equal(h.manager.targetVolume, 0);
  const created = h.created.length;
  h.native.monitor(h.manager);
  h.native.resume(h.manager);
  h.tickTimers(10000);
  assert.equal(h.created.length, created);
});

test("stop leaves an unrelated legacy-only transition and narration media alone", () => {
  const h = harness();
  const original = h.establish(h.legacy, 0.13);
  const otherLegacy = { ...h.legacy, path: "./audio/another-original.mp3" };
  h.native.applyMusic(h.manager, otherLegacy, 0.16);
  const candidate = h.manager.current;
  const timer = h.manager.transitionTimer;
  const narration = h.clip("./assets/story-narration/v1/audio/original.wav", { paused: false, currentTime: 7, volume: 0.8 });
  assert.equal(h.bridge.stopMusic(), false);
  assert.equal(h.manager.transitionTimer, timer);
  assert.equal(h.manager.current, candidate);
  assert.equal(original.paused, false);
  assert.equal(original.loadCalls, 0);
  assert.equal(narration.currentTime, 7);
  assert.equal(narration.volume, 0.8);
  assert.equal(narration.pauseCalls, 0);
});

test("pause leaves steady legacy ambience and an unrelated native crossfade untouched", () => {
  const h = harness();
  const original = h.establish(h.legacy, 0.13);
  original.currentTime = 25.5;
  const originalPauseCalls = original.pauseCalls;
  assert.equal(h.bridge.pauseMusic(), false);
  assert.equal(original.paused, false);
  assert.equal(original.currentTime, 25.5);
  assert.equal(original.volume, 0.13);
  assert.equal(original.pauseCalls, originalPauseCalls);
  assert.equal(h.manager.desiredProfile, h.legacy);
  assert.equal(h.manager.targetVolume, 0.13);

  const otherLegacy = { ...h.legacy, path: "./audio/another-original.mp3" };
  h.native.applyMusic(h.manager, otherLegacy, 0.16);
  const candidate = h.manager.current;
  const timer = h.manager.transitionTimer;
  const transition = h.manager.transitionId;
  h.manager.needsGestureRetry = true;
  h.manager.retryAt = 12345;
  assert.equal(h.bridge.pauseMusic(), false);
  assert.equal(h.manager.current, candidate);
  assert.equal(h.manager.audible, original);
  assert.equal(h.manager.transitionTimer, timer);
  assert.equal(h.manager.transitionId, transition);
  assert.equal(h.manager.transitioning, true);
  assert.equal(h.manager.retired.has(original), true);
  assert.equal(h.manager.desiredProfile, otherLegacy);
  assert.equal(h.manager.targetVolume, 0.16);
  assert.equal(h.manager.needsGestureRetry, true);
  assert.equal(h.manager.retryAt, 12345);
  assert.equal(original.paused, false);
  assert.equal(candidate.paused, false);
  assert.equal(original.currentTime, 25.5);
  assert.equal(original.pauseCalls, originalPauseCalls);
  assert.equal(candidate.pauseCalls, 0);
  h.tickTimers(3000);
  assert.equal(h.manager.current, candidate);
  assert.equal(h.manager.audible, candidate);
  assert.equal(candidate.volume, 0.16);
  assert.equal(h.manager.transitioning, false, "the original transition still completes normally");
});

test("effect admission counts native playing and pending clips rather than controller reservations", () => {
  const h = harness();
  h.bind();
  h.sync();
  h.controller.emit("dark", h.state, h.state.enemies[0], "cast-1");
  assert.equal(h.controller.diagnostics.activeEffects, 1);
  assert.equal(h.bridge.activeUploadedVoices(), 0, "a reservation is not an actual native voice");
  const playing = h.clip(h.effects.dark.path, { paused: false });
  const pending = h.clip(h.effects.roar.path, { __hapilCombatPending: true });
  const legacy = h.clip("./audio/legacy-effect.mp3", { paused: false });
  h.pools.set(h.effects.dark.path, { clips: [playing], pending: null });
  h.pools.set(h.effects.roar.path, { clips: [pending], pending: null });
  h.pools.set("./audio/legacy-effect.mp3", { clips: [legacy], pending: null });
  assert.equal(h.bridge.activeUploadedVoices(), 2);
  assert.equal(h.bridge.canStartEffect(), false);
  assert.equal(h.bridge.playEffect(h.effects.illusion.path, 0.7, 3), false);
  pending.__hapilCombatPending = false;
  assert.equal(h.bridge.activeUploadedVoices(), 1);
  assert.equal(h.bridge.canStartEffect(h.effects.illusion.path), true);
  assert.equal(h.bridge.playEffect(h.effects.illusion.path, 0.7, 3), "native-effect-result");
  assert.deepEqual(h.calls.at(-1), { type: "effect", path: h.effects.illusion.path, volume: 0.7, cooldown: 3 });
  playing.ended = true;
  assert.equal(h.bridge.activeUploadedVoices(), 0);
  assert.equal(h.bridge.canStartEffect("./audio/legacy-effect.mp3"), false);
  assert.equal(h.bridge.playEffect(undefined, 1, 3), false);
});

test("pending pool entries count once, obsolete tokens do not count, and ownership is exact", () => {
  const h = harness();
  const clip = h.clip(h.effects.dark.path, { __hapilCombatPending: true, __mongseSfxRequest: 8 });
  const alias = new URL(h.effects.dark.path, h.sandbox.document.baseURI).href + "?v=1";
  const pool = { clips: [clip], pending: { clip, requestId: 8 } };
  h.pools.set(alias, pool);
  assert.equal(h.bridge.activeUploadedVoices(), 1);
  clip.__hapilCombatPending = false;
  assert.equal(h.bridge.activeUploadedVoices(), 1);
  clip.__mongseSfxRequest = 9;
  assert.equal(h.bridge.activeUploadedVoices(), 0);
  h.pools.set(alias.replace("game.example", "other.example"), { clips: [h.clip(alias, { paused: false })] });
  assert.equal(h.bridge.activeUploadedVoices(), 0);
});

test("effect cleanup cancels owned tokens and pending starts without touching legacy pools", () => {
  const h = harness();
  const owned = h.clip(h.effects.dark.path, { paused: false, currentTime: 1.4, __mongseSfxRequest: 7, __hapilCombatPending: true });
  const detached = h.clip(h.effects.roar.path, { currentTime: 0.7, __mongseSfxRequest: 2, __hapilCombatPending: true });
  const old = h.clip("./audio/legacy.wav", { paused: false, currentTime: 2.5, __mongseSfxRequest: 4 });
  const oldPending = { clip: old, requestId: 4 };
  const pool = { clips: [owned], pending: { clip: owned, requestId: 7 }, readyAt: 12 };
  h.pools.set(h.effects.dark.path, pool);
  h.pools.set(h.effects.roar.path, { clips: [], pending: { clip: detached, requestId: 2 } });
  h.pools.set("./audio/legacy.wav", { clips: [old], pending: oldPending });
  const staleRequest = owned.__mongseSfxRequest;
  h.bridge.stopEffects();
  assert.equal(pool.pending, null);
  assert.equal(pool.readyAt, 12, "native cooldown is not reset by cleanup");
  assert.equal(owned.__mongseSfxRequest, staleRequest + 1);
  assert.equal(detached.__mongseSfxRequest, 3);
  for (const clip of [owned, detached]) {
    assert.equal(clip.__hapilCombatPending, false);
    assert.equal(clip.currentTime, 0);
    assert.equal(clip.paused, true);
    assert.notEqual(clip.src, "", "pooled effect assets remain reusable");
  }
  assert.equal(owned.__mongseSfxRequest === staleRequest, false, "old native promise callbacks are invalidated");
  assert.equal(h.bridge.activeUploadedVoices(), 0);
  assert.equal(old.currentTime, 2.5);
  assert.equal(old.paused, false);
  assert.equal(old.__mongseSfxRequest, 4);
  assert.equal(h.pools.get("./audio/legacy.wav").pending, oldPending);
});

test("real controller bind, hidden suspension, fresh resume, and final stop are stable", () => {
  const h = harness();
  assert.equal(h.controller.sync(h.state, h.context), false, "create does not implicitly bind");
  h.bind();
  h.sync();
  h.tickTimers(3000);
  const deck = h.manager.current;
  deck.currentTime = 13.25;
  h.visibility(true);
  assert.equal(deck.paused, true);
  h.visibility(false);
  h.native.resume(h.manager);
  h.event("pageshow");
  assert.equal(deck.paused, true, "visibility alone cannot use the cached combat state to resume");
  h.sync();
  assert.equal(h.manager.current, deck);
  assert.equal(deck.currentTime, 13.25);
  assert.equal(deck.paused, false);
  h.controller.deactivate();
  h.controller.bind(null);
  h.bridge.stop();
  const calls = h.calls.length;
  const transition = h.manager.transitionId;
  h.bridge.stop();
  h.bridge.stopMusic();
  h.bridge.pauseMusic();
  h.bridge.applyMusic(h.music.clockwork, 0.2);
  assert.equal(h.bridge.playEffect(h.effects.dark.path, 1, 3), false);
  assert.equal(h.bridge.canStartEffect(), false);
  assert.equal(h.calls.length, calls);
  assert.equal(h.manager.transitionId, transition);
  assert.equal(h.controller.sync(h.state, h.context), false);
  assert.equal(h.manager.current, null);
});

test("cleanup also invalidates an obsolete detached pending clip", () => {
  const h = harness();
  const clip = h.clip(h.effects.roar.path, { paused: false, currentTime: 1, __mongseSfxRequest: 12, __hapilCombatPending: true });
  const pool = { clips: [], pending: { clip, requestId: 11 } };
  h.pools.set(h.effects.roar.path, pool);
  h.bridge.stopEffects();
  assert.equal(pool.pending, null);
  assert.equal(clip.__mongseSfxRequest, 13);
  assert.equal(clip.__hapilCombatPending, false);
  assert.equal(clip.currentTime, 0);
  assert.equal(clip.paused, true);
});

test("a stopped old adapter cannot cancel a replacement adapter's media", () => {
  const h = harness();
  h.bind();
  h.sync();
  h.bridge.stop();
  const replacement = h.sandbox.__HAPIL_COMBAT_AUDIO_BRIDGE_V1__.create(h.options);
  h.controller.bind(replacement);
  h.sync();
  const current = h.manager.current;
  const effect = h.clip(h.effects.dark.path, { paused: false, __mongseSfxRequest: 4 });
  h.pools.set(h.effects.dark.path, { clips: [effect], pending: null });
  h.bridge.stopMusic();
  h.bridge.stopEffects();
  assert.equal(h.manager.current, current);
  assert.notEqual(current.src, "");
  assert.equal(effect.paused, false);
  assert.equal(effect.__mongseSfxRequest, 4);
  replacement.stop();
  assert.equal(current.src, "");
  assert.equal(effect.paused, true);
});
