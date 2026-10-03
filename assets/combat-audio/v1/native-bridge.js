/* Owns combat media cancellation; the native manager still owns playback and mixing. */
(function installCombatAudioBridge(root) {
  "use strict";
  if (root.__HAPIL_COMBAT_AUDIO_BRIDGE_V1__) return;

  function create(options) {
    const {
      manager, pools, controller, applyMusic: nativeApplyMusic,
      clearTransition, stopElement, selectAudible, playEffect: nativePlayEffect,
      legacyProfiles = {},
    } = options;
    let stopped = false;
    const legacyState = new WeakMap();

    function canonical(path) {
      if (typeof path !== "string" || !path) return "";
      try {
        const url = new URL(path, root.document?.baseURI || root.location?.href || "https://hapil.invalid/");
        return url.origin + url.pathname;
      } catch {
        return path.split(/[?#]/, 1)[0];
      }
    }

    function owns(path) {
      return !!path && controller.owns(path);
    }

    function deckPath(deck) {
      return deck?.__mongseBgmPath ||
        (deck === manager.current && manager.currentPath) ||
        (deck === manager.audible && manager.audiblePath) || deck?.src || "";
    }

    function decks() {
      return [...new Set([manager.current, manager.audible, ...(manager.retired || [])])].filter(Boolean);
    }

    function usable(deck) {
      return !!deck?.src && !deck.ended && !deck.__mongseFailed && !deck.__mongsePlayBlocked;
    }

    function bestDeck(candidates) {
      const selected = selectAudible(manager);
      if (candidates.includes(selected) && usable(selected)) return selected;
      return candidates.filter(usable).sort((a, b) => Number(b.volume || 0) - Number(a.volume || 0))[0] || null;
    }

    function legacyProfile(path) {
      const profiles = typeof legacyProfiles.values === "function" ? [...legacyProfiles.values()] : Object.values(legacyProfiles);
      return profiles.find(profile => canonical(profile?.path) === canonical(path)) || null;
    }

    function rememberLegacy() {
      for (const deck of decks()) {
        const path = deckPath(deck);
        if (owns(path)) continue;
        const desired = manager.desiredProfile;
        if (desired?.path && !owns(desired.path) && canonical(desired.path) === canonical(path)) {
          legacyState.set(deck, { profile: desired, gain: manager.targetVolume });
        } else if (!legacyState.has(deck)) {
          legacyState.set(deck, { profile: legacyProfile(path), gain: Number(deck.volume) || 0 });
        }
      }
    }

    function cancelTransition() {
      // Native cancellation destroys retired decks. Detach them first so an
      // uploaded candidate cannot destroy the original bed during a rollback.
      manager.retired?.clear();
      clearTransition(manager);
      manager.desiredPath = "";
      manager.desiredProfile = null;
      manager.targetVolume = 0;
      manager.retryAt = 0;
      manager.needsGestureRetry = false;
    }

    function retainDeck(keep, previous) {
      const path = keep ? deckPath(keep) : "";
      manager.current = keep;
      manager.currentPath = path;
      manager.audible = keep;
      manager.audiblePath = path;
      // Retain ownership of unrelated decks even when a paused uploaded deck
      // is current. A later native transition can retire them normally.
      for (const deck of previous) {
        if (deck !== keep && !owns(deckPath(deck))) manager.retired?.add(deck);
      }
    }

    function pauseMusic() {
      if (stopped || !manager || manager.destroyed) return false;
      const previous = decks();
      const hasOwned = owns(manager.desiredPath) || previous.some(deck => owns(deckPath(deck)));
      if (!hasOwned) return false;
      rememberLegacy();
      const keep = bestDeck(previous);
      cancelTransition();
      for (const deck of previous) {
        if (deck !== keep && owns(deckPath(deck))) {
          stopElement(deck);
        } else {
          // pause(), unlike the native stop helper, retains the exact offset,
          // source, and gain. This also silences a legacy crossfade tail.
          try { deck.pause(); } catch {}
        }
      }
      retainDeck(keep, previous);
      return true;
    }

    function stopMusic() {
      if (stopped || !manager || manager.destroyed) return false;
      const previous = decks();
      const hasOwned = owns(manager.desiredPath) || previous.some(deck => owns(deckPath(deck)));
      if (!hasOwned) return false;
      rememberLegacy();
      const legacy = previous.filter(deck => !owns(deckPath(deck)));
      const liveLegacy = legacy.filter(deck => deck.paused !== true);
      const keep = bestDeck(liveLegacy) || bestDeck(legacy);
      cancelTransition();
      for (const deck of previous) if (owns(deckPath(deck))) stopElement(deck);
      retainDeck(keep, previous);
      // A failed upload can leave the original bed playing. Restore its native
      // loop target without seeking, playing, or changing its current volume.
      const saved = keep && legacyState.get(keep);
      if (keep?.paused === false && saved?.profile && !owns(saved.profile.path)) {
        manager.desiredPath = saved.profile.path;
        manager.desiredProfile = saved.profile;
        manager.targetVolume = saved.gain;
      }
      return true;
    }

    function pendingClip(pool) {
      const pending = pool?.pending;
      if (!pending) return null;
      const clip = pending.clip || pending;
      return pending.requestId == null || pending.requestId === (clip.__mongseSfxRequest ?? 0) ? clip : null;
    }

    function activeUploadedVoices() {
      const active = new Set();
      pools?.forEach((pool, path) => {
        if (!owns(path)) return;
        const pending = pendingClip(pool);
        for (const clip of pool.clips || []) {
          if (clip.__hapilCombatPending || clip === pending || (clip.paused === false && !clip.ended)) active.add(clip);
        }
        if (pending) active.add(pending);
      });
      return active.size;
    }

    function canStartEffect(path) {
      if(stopped || (path && !owns(path)) || !controller.allowsEffects())return false;
      const active=[];
      pools?.forEach((pool,source)=>{
        if(!owns(source))return;
        const pending=pendingClip(pool);
        for(const clip of new Set([...(pool.clips||[]),pending].filter(Boolean))){
          if(clip.__hapilCombatPending||clip===pending||(clip.paused===false&&!clip.ended))active.push({clip,pool,source,priority:Number(controller.profile(source)?.priority)||0});
        }
      });
      // Do not cut another sound for a cue whose own voice is still occupied.
      if(path && active.some(v=>canonical(v.source)===canonical(path)))return false;
      if(active.length<2)return true;
      const priority=Number(controller.profile(path)?.priority)||0;
      // Only clear feedback (hurt/parry) preempts; ordinary attacks never churn.
      if(priority<8)return false;
      const victim=active.filter(v=>v.priority<priority).sort((a,b)=>a.priority-b.priority)[0];
      if(!victim)return false;
      const {clip,pool}=victim;
      clip.__mongseSfxRequest=(clip.__mongseSfxRequest??0)+1;
      clip.__hapilCombatPending=false;
      if((pool.pending?.clip||pool.pending)===clip)pool.pending=null;
      try{clip.pause();}catch{}
      try{clip.currentTime=0;}catch{}
      return activeUploadedVoices()<2;
    }

    function stopEffects() {
      if (stopped) return;
      pools?.forEach((pool, path) => {
        if (!owns(path)) return;
        // Cleanup also covers obsolete pending tokens that are no longer in
        // clips; those entries must not retain an untracked playing element.
        const pending = pool.pending?.clip || pool.pending;
        pool.pending = null;
        const clips = new Set([...(pool.clips || []), pending].filter(Boolean));
        for (const clip of clips) {
          clip.__mongseSfxRequest = (clip.__mongseSfxRequest ?? 0) + 1;
          clip.__hapilCombatPending = false;
          try { clip.pause(); } catch {}
          try { clip.currentTime = 0; } catch {}
        }
      });
    }

    function applyMusic(profile, gain) {
      if (stopped || !manager || manager.destroyed) return false;
      rememberLegacy();
      return nativeApplyMusic(manager, profile, gain);
    }

    function playEffect(path, volume, cooldown) {
      if (!owns(path) || !canStartEffect(path)) return false;
      return nativePlayEffect(path, volume, cooldown);
    }

    function stop() {
      if (stopped) return;
      stopMusic();
      stopEffects();
      stopped = true;
    }

    return Object.freeze({ applyMusic, pauseMusic, stopMusic, stopEffects, playEffect, activeUploadedVoices, canStartEffect, stop });
  }

  root.__HAPIL_COMBAT_AUDIO_BRIDGE_V1__ = Object.freeze({ create });
})(typeof window !== "undefined" ? window : globalThis);
