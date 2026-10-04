/* Combat-only routing. The existing audio manager owns decoding, playback and ducking. */
(function installCombatAudio(root) {
  "use strict";
  if (root.__HAPIL_COMBAT_AUDIO_V1__) return;

  const EFFECT_KINDS = new Set(["dark", "roar", "blackHole", "illusion"]);
  const MAX_EVENTS = 256;
  const MAX_EFFECTS = 2;
  const document = root.document;
  let adapter = null;
  let catalogSource = null;
  let catalog = { music: {}, effects: {} };
  let paths = new Map();
  let state = null;
  let context = null;
  let zone = "";
  let gameTime = null;
  let latched = false;
  let rank = "ordinary";
  let mode = "inactive";
  let selected = "";
  let applied = "";
  let effectSettings = "";
  let pageHidden = false;
  let needsFreshSync = false;
  let lastClock = 0;
  let generation = 0;
  const failures = new Set();
  const seen = new Map();
  const readyAt = new Map();
  const voices = new Map();

  function number(value, fallback = 0) {
    const result = Number(value);
    return Number.isFinite(result) ? result : fallback;
  }

  function volume(value) {
    return Math.max(0, Math.min(1, number(value)));
  }

  function now() {
    const milliseconds = root.performance?.now?.() ?? Date.now();
    lastClock = Math.max(lastClock, number(milliseconds) / 1000);
    return lastClock;
  }

  function canonical(path) {
    if (typeof path !== "string" || !path) return "";
    try {
      const url = new URL(path, document?.baseURI || root.location?.href || "https://hapil.invalid/");
      return url.origin + url.pathname;
    } catch {
      return path.replace(/^\.\//, "").split(/[?#]/, 1)[0];
    }
  }

  function refreshCatalog() {
    const source = root.__HAPIL_COMBAT_AUDIO_CATALOG_V1__;
    if (!source || source === catalogSource) return;
    catalogSource = source;
    catalog = { music: {}, effects: {} };
    paths = new Map();
    for (const group of ["music", "effects"]) {
      for (const [key, value] of Object.entries(source[group] || {})) {
        if (!value || typeof value.path !== "string" || !value.path) continue;
        const profile = Object.freeze(group === "effects" ? {
          ...value,
          voices: 1,
          cooldown: Math.max(value.rc133 === true ? .18 : 2.5, number(value.cooldown, 2.5)),
          duration: Math.max(0.05, number(value.duration, 2.5)),
        } : { ...value });
        catalog[group][key] = profile;
        paths.set(canonical(profile.path), profile);
      }
    }
  }

  function profile(path) {
    refreshCatalog();
    return paths.get(canonical(path)) || null;
  }

  function owns(path) {
    return !!profile(path);
  }

  function call(name, ...args) {
    return adapter?.[name]?.(...args);
  }

  function alive(value) {
    return !!value && number(value.hp) > 0;
  }

  function isHidden() {
    return pageHidden || !!document?.hidden;
  }

  function isGame() {
    return !!state && context?.phase === "game" && alive(state);
  }

  function validCombat() {
    return isGame() && !context.blocked && !context.clear && !context.rest &&
      !isHidden() && !needsFreshSync && state.zone === zone && latched;
  }

  function clearEffects() {
    call("stopEffects");
    voices.clear();
  }

  function stopScope() {
    call("stopMusic");
    clearEffects();
    applied = "";
    selected = "";
    latched = false;
    rank = "ordinary";
    mode = "inactive";
    effectSettings = "";
    seen.clear();
    readyAt.clear();
    generation += 1;
  }

  function pause(reason) {
    if (mode !== "paused" || selected !== reason) {
      call("pauseMusic");
      clearEffects();
      applied = "";
    }
    mode = "paused";
    selected = reason;
  }

  function apply(profile, gain, nextMode, key) {
    const signature = [profile?.path || "", gain, profile?.loopStart,
      profile?.loopEnd, profile?.crossfade].join("|");
    if (signature !== applied || mode !== nextMode) {
      applied = signature;
      mode = nextMode;
      selected = key;
      call("applyMusic", profile, gain);
    } else {
      selected = key;
    }
  }

  function fallback() {
    const fallbackProfile = context?.fallbackProfile;
    // Fallbacks are original game beds; never let a mistaken catalog profile
    // turn an out-of-combat transition into uploaded music playback.
    if (fallbackProfile?.path && !owns(fallbackProfile.path)) {
      apply(fallbackProfile, volume(context.fallbackGain), "fallback", "fallback");
    } else if (mode !== "inactive") {
      call("stopMusic");
      applied = "";
      selected = "";
      mode = "inactive";
    }
  }

  function route() {
    if (!adapter) return false;
    if (!context) {
      if (mode !== "inactive" || latched) stopScope();
      return true;
    }
    refreshCatalog();
    if (!isGame() || !state.zone) {
      if (mode !== "inactive" || latched) stopScope();
      return true;
    }
    // These transitions terminate the encounter even if a modal is open too.
    if (context.clear || context.rest) {
      if (latched) stopScope();
    }
    if (context.blocked || isHidden() || needsFreshSync) {
      pause("blocked");
      return true;
    }
    const settings = context.settings || {};
    const nextEffectSettings = `${settings.sound === true}|${volume(settings.sfxVolume)}`;
    if (effectSettings && effectSettings !== nextEffectSettings) clearEffects();
    effectSettings = nextEffectSettings;

    if (!context.clear && !context.rest) {
      const enemies = (Array.isArray(state.enemies) ? state.enemies : []).filter(alive);
      if (enemies.length) {
        latched = true;
        rank = enemies.some(enemy => enemy.boss) ? "boss" :
          enemies.some(enemy => enemy.midboss) ? "midboss" : "ordinary";
      }
    }
    if (settings.music !== true || volume(settings.bgmVolume) <= 0) {
      pause("muted");
      return true;
    }
    if (!validCombat()) {
      fallback();
      return true;
    }
    const key = state.innerFinalRC133?.phase === "reveal" && catalog.music.nearSilence ? "nearSilence" : number(state.awakeningUntil) > number(state.time) || /^kair/i.test(zone)
      ? "timeControl" : rank === "boss" ? "foldingSpace" :
        rank === "midboss" ? "clockworkIntense" : "clockwork";
    const music = catalog.music[key];
    if (!music || failures.has(canonical(music.path))) {
      fallback();
      return true;
    }
    apply(music, volume(music.gain) * volume(settings.bgmVolume), "combat", key);
    return true;
  }

  function sync(nextState, nextContext) {
    if (!adapter) return false;
    const nextZone = typeof nextState?.zone === "string" ? nextState.zone : "";
    const nextTime = number(nextState?.time);
    const changedScope = state && (state !== nextState || nextZone !== zone ||
      (gameTime !== null && nextTime + 0.001 < gameTime));
    if (changedScope) stopScope();
    state = nextState || null;
    context = nextContext ? { ...nextContext, settings: { ...nextContext.settings } } : null;
    zone = nextZone;
    gameTime = nextTime;
    needsFreshSync = false;
    return route();
  }

  function allowsEffects() {
    return !!adapter && validCombat() && context.settings?.sound === true &&
      volume(context.settings.sfxVolume) > 0;
  }

  function eligibleActor(kind, eventState, actor) {
    if (!eventState || eventState !== state || eventState.zone !== zone || !alive(eventState)) return false;
    const hero = actor === eventState;
    if (!actor || !alive(actor) || (!hero && !(eventState.enemies || []).includes(actor))) return false;
    if (actor.zone && actor.zone !== zone) return false;
    if (kind === "roar") {
      return !hero && !!(actor.boss || actor.midboss) &&
        (actor.demon === true || actor.beast === true || actor.isDemon === true || actor.isBeast === true ||
          /demon|beast|wolf|hound|balrog|goblin|monster|악마|늑대|짐승|발록|불면귀/i.test(
            `${actor.id || ""} ${actor.kind || ""} ${actor.name || ""}`));
    }
    return true;
  }

  function emit(kind, eventState, actor, eventKey) {
    refreshCatalog();
    const effect = catalog.effects[kind];
    if ((!EFFECT_KINDS.has(kind) && !(kind.startsWith("rc133") && effect?.rc133 === true)) || !effect || !adapter ||
      !eligibleActor(kind, eventState, actor) ||
      (typeof eventKey !== "string" && typeof eventKey !== "number") || `${eventKey}` === "") return false;

    // A wave/boss can be admitted after the frame's sync. Re-evaluate that
    // current state, while retaining the cached modal/phase safety gates.
    route();

    // Consume muted/suspended events too: unmuting must not replay old attacks.
    const key = `${kind}|${actor === state ? "hero" : actor.id || "enemy"}|${eventKey}`;
    if (seen.has(key)) return true;
    seen.set(key, true);
    while (seen.size > MAX_EVENTS) seen.delete(seen.keys().next().value);
    if (!allowsEffects() || failures.has(canonical(effect.path))) return true;
    const time = now();
    for (const [voiceKind, until] of voices) if (until <= time) voices.delete(voiceKind);
    const voiceKey = effect.group || kind;
    if (time < (readyAt.get(voiceKey) || 0) || voices.has(voiceKey)) return true;
    if (voices.size >= MAX_EFFECTS) {
      const lowest = Math.min(...[...voices.keys()].map(key => number(catalog.effects[key]?.priority ?? Object.values(catalog.effects).find(p=>p.group===key)?.priority, 2)));
      if (effect.rc133 !== true || number(effect.priority, 2) <= lowest) return true;
      clearEffects();
    }
    readyAt.set(voiceKey, time + effect.cooldown);
    voices.set(voiceKey, time + effect.duration);
    call("playEffect", effect.path, 1, effect.cooldown);
    return true;
  }

  function failed(path) {
    if (!owns(path)) return false;
    const key = canonical(path);
    if (failures.has(key)) return true;
    failures.add(key);
    const failedMusic = catalog.music[selected] && canonical(catalog.music[selected].path) === key;
    if (failedMusic) {
      // Cancel desired-path retries before selecting the original bed.
      call("stopMusic");
      applied = "";
      mode = "inactive";
      route();
    }
    return true;
  }

  function bind(nextAdapter) {
    if (nextAdapter === adapter) return api;
    if (adapter) stopScope();
    adapter = nextAdapter || null;
    state = null;
    context = null;
    zone = "";
    gameTime = null;
    needsFreshSync = true;
    return api;
  }

  function deactivate() {
    if (adapter) stopScope();
    state = null;
    context = null;
    zone = "";
    gameTime = null;
    needsFreshSync = true;
  }

  function suspend() {
    needsFreshSync = true;
    if (adapter && context) pause("hidden");
  }

  document?.addEventListener?.("visibilitychange", () => {
    if (document.hidden) suspend();
    else needsFreshSync = true;
  });
  root.addEventListener?.("pagehide", () => { pageHidden = true; suspend(); });
  root.addEventListener?.("pageshow", () => { pageHidden = false; needsFreshSync = true; });

  const api = Object.freeze({
    bind, sync, emit, profile, owns, allowsEffects, failed, deactivate,
    get diagnostics() {
      const time = now();
      return Object.freeze({
        mode, selected, zone, latched, rank, generation,
        activeEffects: [...voices].filter(([, until]) => until > time).length,
        eventCount: seen.size, failedPaths: failures.size,
        suspended: isHidden() || needsFreshSync,
      });
    },
  });
  root.__HAPIL_COMBAT_AUDIO_V1__ = api;
})(typeof window !== "undefined" ? window : globalThis);
