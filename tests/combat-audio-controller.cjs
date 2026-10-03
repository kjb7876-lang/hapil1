"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/combat-audio/v1/controller.js"), "utf8");

function harness() {
  let clock = 0;
  const listeners = new Map();
  const windowListeners = new Map();
  const document = {
    hidden: false,
    baseURI: "https://game.example/play/",
    addEventListener: (name, listener) => listeners.set(name, listener),
  };
  const music = Object.fromEntries(["clockwork", "clockworkIntense", "foldingSpace", "timeControl"].map((name, index) => [name, {
    path: `./assets/combat-audio/v1/${name}.mp3`, gain: 0.2 + index * 0.02,
    loopStart: 0, loopEnd: 80, crossfade: 1,
  }]));
  const effects = Object.fromEntries(["dark", "roar", "blackHole", "illusion"].map(name => [name, {
    path: `./assets/combat-audio/v1/${name}.wav`, gain: 1,
    cooldown: name === "dark" ? 3 : 2.5, duration: 2.25, voices: 1, duck: 0.6,
  }]));
  const sandbox = {
    URL, console, document, location: { href: document.baseURI },
    performance: { now: () => clock },
    addEventListener: (name, listener) => windowListeners.set(name, listener),
    __HAPIL_COMBAT_AUDIO_CATALOG_V1__: { music, effects },
  };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox, { filename: "combat-audio-controller.js" });
  const controller = sandbox.__HAPIL_COMBAT_AUDIO_V1__;
  const calls = [];
  const manager = { path: "", position: 0, paused: false, desired: "", pendingEffects: 0, token: 0 };
  const adapter = {
    applyMusic(profile, gain) {
      calls.push({ type: "music", path: profile.path, gain });
      if (manager.path !== profile.path) manager.position = 0;
      manager.path = profile.path;
      manager.desired = profile.path;
      manager.paused = false;
    },
    pauseMusic() {
      calls.push({ type: "pause" });
      manager.desired = "";
      manager.paused = true;
      manager.token += 1;
    },
    stopMusic() {
      calls.push({ type: "stop" });
      if (controller.owns(manager.path)) {
        manager.path = "";
        manager.position = 0;
      }
      manager.desired = "";
      manager.token += 1;
    },
    stopEffects() {
      calls.push({ type: "effects-stop" });
      manager.pendingEffects = 0;
      manager.token += 1;
    },
    playEffect(path, gain, cooldown) {
      calls.push({ type: "effect", path, gain, cooldown });
      manager.pendingEffects += 1;
    },
  };
  controller.bind(adapter);
  const context = {
    phase: "game", blocked: false, clear: false, rest: false,
    settings: { music: true, sound: true, bgmVolume: 0.7, sfxVolume: 0.8 },
    fallbackProfile: { path: "./audio/original.mp3", loopStart: 0, loopEnd: 50, crossfade: 1 },
    fallbackGain: 0.12,
  };
  const enemy = { id: "wolf-1", kind: "wolf", hp: 100 };
  const state = { zone: "dist01", hp: 200, time: 0, awakeningUntil: 0, enemies: [enemy] };
  return {
    controller, calls, manager, adapter, music, effects, context, state, enemy, sandbox,
    tick: () => controller.sync(state, context),
    advance: seconds => { clock += seconds * 1000; state.time += seconds; },
    visibility(hidden) { document.hidden = hidden; listeners.get("visibilitychange")(); },
    event(name) { windowListeners.get(name)(); },
    count: type => calls.filter(call => call.type === type).length,
    last: type => calls.filter(call => call.type === type).at(-1),
  };
}

let passed = 0;
function test(name, run) {
  run();
  passed += 1;
  console.log(`PASS ${name}`);
}

test("combat admission selects one bed and stable frames never restart it", () => {
  const h = harness();
  assert.equal(h.tick(), true);
  assert.equal(h.last("music").path, h.music.clockwork.path);
  assert.ok(Math.abs(h.last("music").gain - 0.14) < 1e-12);
  for (let index = 0; index < 2000; index += 1) h.tick();
  assert.equal(h.count("music"), 1);
  assert.equal(h.count("effect"), 0);
  h.state.enemies = [];
  h.tick();
  assert.equal(h.count("music"), 1);
  assert.equal(h.controller.diagnostics.latched, true);
});

test("midboss, boss, actual awakening and Kair combat select the correct beds", () => {
  const h = harness();
  h.tick();
  h.enemy.midboss = true;
  h.tick();
  assert.equal(h.last("music").path, h.music.clockworkIntense.path);
  h.enemy.boss = true;
  h.tick();
  assert.equal(h.last("music").path, h.music.foldingSpace.path);
  h.state.awakeningPrimedUntil = 99;
  h.tick();
  assert.equal(h.count("music"), 3, "priming must not trigger awakening music");
  h.state.awakeningUntil = 3;
  h.tick();
  assert.equal(h.last("music").path, h.music.timeControl.path);
  h.advance(3);
  h.tick();
  assert.equal(h.last("music").path, h.music.foldingSpace.path);
  h.state.zone = "kair02";
  h.tick();
  assert.equal(h.last("music").path, h.music.timeControl.path);
});

test("empty entry, rest, cleared zones, story and menu never start uploaded beds", () => {
  for (const change of [
    h => { h.state.enemies = []; },
    h => { h.context.rest = true; },
    h => { h.context.clear = true; },
    h => { h.context.phase = "story"; },
    h => { h.context.phase = "menu"; },
    h => { h.state.hp = 0; },
  ]) {
    const h = harness();
    change(h);
    h.tick();
    for (const call of h.calls.filter(call => call.type === "music")) assert.equal(h.controller.owns(call.path), false);
    assert.equal(h.controller.allowsEffects(), false);
  }
  const h = harness();
  h.context.fallbackProfile = h.music.clockwork;
  h.state.enemies = [];
  h.tick();
  assert.equal(h.count("music"), 0, "a misconfigured fallback must not leak combat music");
});

test("clear and rest stop immediately and restore the original fallback once", () => {
  for (const property of ["clear", "rest"]) {
    const h = harness();
    h.tick();
    h.controller.emit("dark", h.state, h.enemy, "cast-1");
    h.context[property] = true;
    h.tick();
    assert.equal(h.count("stop"), 1);
    assert.equal(h.manager.pendingEffects, 0);
    assert.equal(h.last("music").path, h.context.fallbackProfile.path);
    const length = h.calls.length;
    for (let i = 0; i < 100; i += 1) h.tick();
    assert.equal(h.calls.length, length);
    assert.equal(h.controller.diagnostics.latched, false);
  }
});

test("blocked combat pauses once, cancels pending work, and resumes the same position", () => {
  const h = harness();
  h.tick();
  h.manager.position = 27;
  h.controller.emit("dark", h.state, h.enemy, "cast-1");
  h.context.blocked = true;
  h.tick();
  const token = h.manager.token;
  for (let i = 0; i < 100; i += 1) h.tick();
  assert.equal(h.count("pause"), 1);
  assert.equal(h.manager.desired, "");
  assert.equal(h.manager.pendingEffects, 0);
  assert.equal(h.controller.allowsEffects(), false);
  assert.equal(h.manager.token, token);
  h.context.blocked = false;
  h.tick();
  assert.equal(h.manager.paused, false);
  assert.equal(h.manager.position, 27);
  assert.equal(h.count("music"), 2);
});

test("hidden/pagehide suspend immediately and do not resume from stale callbacks", () => {
  const h = harness();
  h.tick();
  h.manager.position = 19;
  h.visibility(true);
  assert.equal(h.manager.paused, true);
  assert.equal(h.controller.allowsEffects(), false);
  h.visibility(false);
  h.controller.emit("illusion", h.state, h.enemy, "hidden-event");
  assert.equal(h.count("music"), 1);
  assert.equal(h.count("effect"), 0);
  h.tick();
  assert.equal(h.manager.position, 19);
  assert.equal(h.count("music"), 2);
  h.event("pagehide");
  h.tick();
  assert.equal(h.controller.allowsEffects(), false);
  assert.equal(h.count("music"), 2);
  h.event("pageshow");
  assert.equal(h.count("music"), 2);
  h.context.phase = "menu";
  h.tick();
  assert.equal(h.manager.path, "");
  assert.equal(h.count("music"), 2);
});

test("death, new run, clock reset, zone change and end cancel the owned scope", () => {
  for (const change of [
    h => { h.state.hp = 0; h.tick(); },
    h => { h.context.phase = "ending"; h.tick(); },
    h => { h.state.zone = "hub"; h.state.enemies = []; h.context.rest = true; h.tick(); },
    h => h.controller.sync({ ...h.state, enemies: [] }, h.context),
    h => { h.advance(4); h.tick(); h.state.time = 0; h.state.enemies = []; h.tick(); },
  ]) {
    const h = harness();
    h.tick();
    h.controller.emit("dark", h.state, h.enemy, "cast-1");
    change(h);
    assert.ok(h.count("stop") >= 1);
    assert.equal(h.manager.pendingEffects, 0);
    assert.equal(h.controller.owns(h.manager.path), false);
    assert.equal(h.controller.diagnostics.latched, false);
    assert.equal(h.controller.allowsEffects(), false);
  }
});

test("settings mute independently, update gain once, and cancel effects on sound changes", () => {
  const h = harness();
  h.tick();
  h.context.settings.bgmVolume = 0.4;
  h.tick();
  assert.ok(Math.abs(h.last("music").gain - 0.08) < 1e-12);
  h.tick();
  assert.equal(h.count("music"), 2);
  h.context.settings.music = false;
  h.tick();
  assert.equal(h.manager.paused, true);
  assert.equal(h.controller.allowsEffects(), true);
  h.controller.emit("dark", h.state, h.enemy, "music-muted-cast");
  assert.equal(h.count("effect"), 1);
  h.context.blocked = true;
  h.tick();
  assert.equal(h.manager.pendingEffects, 0, "blocking must stop effects even when music was already muted");
  h.context.blocked = false;
  h.context.settings.sound = false;
  h.tick();
  assert.equal(h.controller.emit("illusion", h.state, h.enemy, "muted-cast"), true);
  assert.equal(h.count("effect"), 1);
  h.context.settings.sound = true;
  h.context.settings.music = true;
  h.tick();
  h.controller.emit("illusion", h.state, h.enemy, "muted-cast");
  assert.equal(h.count("effect"), 1, "unmuting must not replay a consumed attack");
  h.context.settings.sfxVolume = 0;
  h.tick();
  assert.equal(h.controller.allowsEffects(), false);
  h.context.settings.bgmVolume = 0;
  h.tick();
  const length = h.calls.length;
  for (let i = 0; i < 100; i += 1) h.tick();
  assert.equal(h.calls.length, length);
});

test("effect events dedupe, enforce cooldown and cap overlapping uploaded voices", () => {
  const h = harness();
  h.enemy.boss = true;
  h.tick();
  assert.equal(h.controller.emit("roar", h.state, h.enemy, "entry"), true);
  h.controller.emit("roar", h.state, h.enemy, "entry");
  h.controller.emit("roar", h.state, h.enemy, "different-key" );
  assert.equal(h.count("effect"), 1);
  h.controller.emit("dark", h.state, h.enemy, "phase-1");
  h.controller.emit("blackHole", h.state, h.enemy, "impact-1");
  assert.equal(h.count("effect"), 2);
  assert.equal(h.controller.diagnostics.activeEffects, 2);
  h.advance(2.25);
  h.controller.emit("roar", h.state, h.enemy, "too-soon");
  assert.equal(h.count("effect"), 2);
  h.controller.emit("illusion", h.state, h.enemy, "clone-1");
  assert.equal(h.count("effect"), 3);
  h.advance(0.25);
  h.controller.emit("roar", h.state, h.enemy, "later-roar");
  assert.equal(h.count("effect"), 4);
  h.controller.emit("blackHole", h.state, h.enemy, "impact-1");
  assert.equal(h.count("effect"), 4, "cap-suppressed events are consumed rather than queued");
  for (const call of h.calls.filter(call => call.type === "effect")) {
    assert.equal(call.gain, 1);
    assert.ok(call.cooldown >= 2.5);
    assert.equal(h.controller.profile(call.path).voices, 1);
  }
  for (let i = 0; i < 2000; i += 1) h.controller.emit("dark", h.state, h.enemy, `bounded-${i}`);
  assert.equal(h.controller.diagnostics.eventCount, 256);
});

test("only current live owners and eligible boss beasts may emit semantic audio", () => {
  const h = harness();
  h.tick();
  assert.equal(h.controller.emit("roar", h.state, h.enemy, "ordinary"), false);
  h.enemy.boss = true;
  h.enemy.kind = "human";
  h.enemy.id = "human-1";
  assert.equal(h.controller.emit("roar", h.state, h.enemy, "human"), false);
  h.enemy.demon = true;
  assert.equal(h.controller.emit("roar", h.state, h.enemy, "demon"), true);
  assert.equal(h.controller.emit("dark", h.state, { ...h.enemy }, "stale-owner"), false);
  assert.equal(h.controller.emit("dark", { ...h.state }, h.enemy, "stale-run"), false);
  assert.equal(h.controller.emit("unknown", h.state, h.enemy, "unknown"), false);
  assert.equal(h.controller.emit("dark", h.state, h.enemy, ""), false);
  h.enemy.hp = 0;
  assert.equal(h.controller.emit("dark", h.state, h.enemy, "dead-owner"), false);
  h.enemy.hp = 100;
  h.state.zone = "dist02";
  assert.equal(h.controller.emit("dark", h.state, h.enemy, "stale-zone"), false);
  assert.equal(h.count("effect"), 1);
});

test("a newly admitted boss can activate combat after the frame-start sync", () => {
  const h = harness();
  h.state.enemies = [];
  h.tick();
  assert.equal(h.last("music").path, h.context.fallbackProfile.path);
  h.enemy.boss = true;
  h.state.enemies.push(h.enemy);
  assert.equal(h.controller.emit("roar", h.state, h.enemy, "boss-entry"), true);
  assert.equal(h.last("music").path, h.music.foldingSpace.path);
  assert.equal(h.count("effect"), 1);
  assert.equal(h.controller.diagnostics.latched, true);
});

test("failed music falls back once and never retries that uploaded source per frame", () => {
  const h = harness();
  h.tick();
  assert.equal(h.controller.failed(h.music.clockwork.path), true);
  assert.equal(h.last("music").path, h.context.fallbackProfile.path);
  for (let i = 0; i < 1000; i += 1) h.tick();
  assert.equal(h.count("music"), 2);
  assert.equal(h.count("stop"), 1);
  assert.equal(h.controller.failed(h.music.clockwork.path), true);
  assert.equal(h.count("music"), 2);
  h.enemy.boss = true;
  h.tick();
  assert.equal(h.last("music").path, h.music.foldingSpace.path);
  assert.equal(h.controller.failed("./audio/original.mp3"), false);
  h.controller.failed(h.effects.dark.path);
  assert.equal(h.controller.emit("dark", h.state, h.enemy, "failed-effect"), true);
  assert.equal(h.count("effect"), 0);
});

test("ownership is exact, diagnostics are readonly, and teardown cannot stale-resume", () => {
  const h = harness();
  h.tick();
  const absolute = new URL(h.music.clockwork.path, h.sandbox.document.baseURI).href;
  assert.equal(h.controller.owns(`${absolute}?v=1`), true);
  assert.equal(h.controller.owns(absolute.replace("game.example", "other.example")), false);
  assert.equal(h.controller.owns("./audio/original.mp3"), false);
  assert.equal(Object.isFrozen(h.controller.diagnostics), true);
  h.controller.deactivate();
  const length = h.calls.length;
  h.event("pageshow");
  h.visibility(false);
  assert.equal(h.controller.allowsEffects(), false);
  assert.equal(h.controller.emit("dark", h.state, h.enemy, "stale-cast"), false);
  assert.equal(h.calls.length, length);
  h.controller.bind(null);
  assert.equal(h.tick(), false);
});

test("missing context cancels a running scope and binding is stable", () => {
  const h = harness();
  h.tick();
  h.controller.bind(h.adapter);
  h.tick();
  assert.equal(h.count("music"), 1);
  assert.equal(h.controller.sync(h.state, null), true);
  assert.equal(h.manager.path, "");
  assert.equal(h.controller.allowsEffects(), false);
  assert.equal(h.controller.diagnostics.latched, false);
});

test("the production catalog uses valid loop windows and bounded single-voice effects", () => {
  const h = harness();
  const production = fs.readFileSync(path.join(__dirname, "../assets/combat-audio/v1/catalog.js"), "utf8");
  vm.runInNewContext(production, h.sandbox, { filename: "combat-audio-catalog.js" });
  const catalog = h.sandbox.__HAPIL_COMBAT_AUDIO_CATALOG_V1__;
  assert.equal(catalog.scope, "combat-only");
  assert.equal(Object.keys(catalog.music).length, 4);
  assert.equal(Object.keys(catalog.effects).length, 4);
  for (const music of Object.values(catalog.music)) {
    assert.ok(music.loopStart >= 0);
    assert.ok(music.loopEnd <= music.duration);
    assert.ok(music.loopEnd - music.loopStart > music.crossfade);
    assert.ok(music.gain > 0 && music.gain < 1);
    assert.equal(h.controller.owns(music.path), true);
  }
  for (const effect of Object.values(catalog.effects)) {
    assert.equal(effect.voices, 1);
    assert.ok(effect.cooldown >= 2.5);
    assert.ok(effect.duration <= effect.cooldown);
    assert.equal(h.controller.profile(effect.path).duration, effect.duration);
  }
  h.tick();
  assert.equal(h.last("music").path, catalog.music.clockwork.path);
});

console.log(`\n${passed} combat audio controller tests passed.`);
