/* Canonical Korean story narration. Original voice 1/2 stay on RC49. */
(() => {
  'use strict';
  const script = document.currentScript;
  const base = new URL('./', script?.src || document.baseURI);
  const manifestURL = new URL('manifest.json', base);
  if (script?.src) manifestURL.search = new URL(script.src).search;
  const LOAD_TIMEOUT_MS = 15000, END_TAIL_MS = 750;
  let audioContext = null, interacted = false, primed = false, manifestRequest = null, active = null;

  function unlock() {
    const Constructor = window.AudioContext || window.webkitAudioContext;
    if (!Constructor || !interacted) return false;
    try {
      if (!audioContext) audioContext = new Constructor();
      Promise.resolve(audioContext.resume()).catch(() => {});
      // Match the existing mobile unlock contract: prime one silent frame during a gesture.
      if (!primed) {
        const source = audioContext.createBufferSource();
        source.buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
        source.connect(audioContext.destination); source.onended = () => source.disconnect();
        source.start(0); primed = true;
      }
      return true;
    } catch { return false; }
  }
  function interaction(event) {
    if (event.isTrusted === false) return;
    interacted = true;
    // The play button unlocks in its click handler. Resuming earlier in the same
    // gesture could otherwise make that handler pause the newly resumed voice.
    if (event.target?.closest?.('[data-narration-play]')) return;
    unlock();
  }
  window.addEventListener('pointerdown', interaction, {capture: true, passive: true});
  window.addEventListener('keydown', interaction, {capture: true});

  async function manifest(signal) {
    if (!manifestRequest) {
      // Only metadata is shared. Decoded PCM belongs to the current card only.
      const requestController = new AbortController();
      const requestTimer = window.setTimeout(() => requestController.abort(), LOAD_TIMEOUT_MS);
      manifestRequest = fetch(manifestURL, {signal: requestController.signal}).then(response => {
        if (!response.ok) throw new Error('Narration manifest unavailable');
        return response.json();
      }).then(data => {
        if (data.version !== 1 || !data.scenes) throw new Error('Unsupported narration manifest');
        return data;
      }).catch(error => { manifestRequest = null; throw error; }).finally(() => window.clearTimeout(requestTimer));
    }
    const result = await manifestRequest;
    if (signal.aborted) throw new Error('Narration cancelled');
    return result;
  }
  async function sha256(text) {
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  }
  function node(tag, text) {
    const element = document.createElement(tag);
    if (text != null) element.textContent = text;
    return element;
  }
  const volumeValue = value => Number.isFinite(Number(value)) ? Math.max(0, Math.min(1, Number(value))) : .8;

  function attach({root, text, zone, phase, key, footer: targetFooter, ctx = {}, onPlaying, onUserPause, onLoading, onBlocked, onEnded} = {}) {
    // These two recorded performances and their existing controls are immutable.
    if (!root || !text || (zone === 'dist00' && (phase === 'pre' || phase === 'post'))) return null;
    const footer = targetFooter || root.querySelector('.rc51-footer') || root.querySelector('[data-narration-footer]');
    if (!footer) return null;
    active?.pause(false, true);
    const controls = node('span'), playButton = node('button', '음성 재생'), muteButton = node('button', '음소거'), label = node('label'), range = node('input');
    controls.className = 'hapil-story-narration';
    controls.dataset.narrationControls = 'true';
    playButton.type = muteButton.type = 'button';
    playButton.dataset.narrationPlay = 'true';
    muteButton.dataset.narrationMute = 'true';
    range.type = 'range'; range.min = '0'; range.max = '100'; range.step = '1';
    range.setAttribute('aria-label', '이 장면 음성 음량');
    label.append(node('span', '음량'), range);
    controls.append(playButton, muteButton, label);
    footer.prepend(controls);
    const sceneKey = key || `${zone}:${phase}`;
    root.dataset.narration = sceneKey;
    let state = 'idle', disposed = false, generation = 0, buffer = null, entry = null;
    const availabilityController = new AbortController();
    let progressWatch = null, endedAt = 0, resumeWhenVisible = false, resumeWhenContextRunning = false, observedContext = null;
    const now = () => window.performance?.now?.() ?? Date.now();
    let source = null, gain = null, media = null, startedAt = 0, offset = 0, clipIndex = 0, controller = null, timeout = null;
    let volume = volumeValue(ctx.voiceVolume), muted = ctx.sound === false, lastSound = ctx.sound, lastVolume = ctx.voiceVolume;
    const listeners = [], mediaListeners = [];
    const mixOwner = {};
    function listen(target, event, callback) {
      target.addEventListener(event, callback); listeners.push(() => target.removeEventListener(event, callback));
    }
    function effectiveVolume() { return muted ? 0 : volume; }
    function updateDucking(starting = false) {
      window.__HAPIL_NARRATION_MIX_V1__?.set(mixOwner, !disposed && (starting || state === 'playing') && effectiveVolume() > 0);
    }
    function updateVolume() {
      updateDucking();
      if (gain) gain.gain.value = effectiveVolume();
      if (media) media.volume = effectiveVolume();
      range.value = String(Math.round(volume * 100));
      const muteLabel = muted ? '음소거 해제' : '음소거';
      if (muteButton.textContent !== muteLabel) muteButton.textContent = muteLabel;
      if (muteButton.getAttribute('aria-pressed') !== String(muted)) muteButton.setAttribute('aria-pressed', String(muted));
    }
    function display(nextState) {
      state = nextState; root.dataset.narrationState = nextState;
      updateDucking();
      playButton.textContent = ({idle: '음성 재생', loading: '음성 불러오는 중…', playing: '음성 일시정지', paused: '음성 이어 듣기', interrupted: '음성 이어 듣기', ended: '다시 듣기', blocked: '음성 재생 · 다시 시도'})[nextState] || '음성 재생';
      playButton.setAttribute('aria-busy', String(nextState === 'loading'));
    }
    function clearTimeoutAndRequest() {
      if (timeout != null) window.clearTimeout(timeout);
      timeout = null;
      if (progressWatch != null) window.clearTimeout(progressWatch); progressWatch = null;
      controller?.abort(); controller = null;
    }
    function stopSource() {
      window.__HAPIL_NARRATION_MIX_V1__?.set(mixOwner, false);
      if (source) { source.onended = null; try { source.stop(); } catch {} source.disconnect(); source = null; }
      if (gain) { gain.disconnect(); gain = null; }
      if (media) media.pause();
    }
    function position() {
      if (media && state === 'playing') return Number(media.currentTime) || offset;
      const value = offset + (source && state === 'playing' ? Math.max(0, audioContext.currentTime - startedAt) : 0);
      const duration = buffer?.duration ?? entry?.clips[clipIndex]?.duration;
      return Number.isFinite(duration) ? Math.min(value, duration) : value;
    }
    function pause(user = false, releaseBuffer = false) {
      if (disposed || state === 'unavailable') return;
      resumeWhenVisible = resumeWhenContextRunning = false; offset = position(); ++generation; clearTimeoutAndRequest(); stopSource(); releaseMedia(); if (releaseBuffer) buffer = null; display('paused');
      if (user) onUserPause?.();
    }
    function contextInterrupted() {
      return audioContext?.state === 'suspended' || audioContext?.state === 'interrupted';
    }
    function contextChanged() {
      if (disposed || active !== api || media) return;
      if (contextInterrupted() && (state === 'playing' || state === 'loading')) {
        // Device interruptions are resumable pauses, not failed downloads or ended speech.
        pause(); resumeWhenContextRunning = true; display('interrupted');
      } else if (audioContext?.state === 'running' && resumeWhenContextRunning && !document.hidden && state === 'interrupted') {
        void play();
      } else if (audioContext?.state === 'closed' && resumeWhenContextRunning) {
        failed(generation);
      }
    }
    function observeContext() {
      if (!audioContext || observedContext === audioContext) return;
      observedContext = audioContext;
      listen(audioContext, 'statechange', contextChanged);
    }
    function failed(request) {
      if (disposed || request !== generation) return false;
      resumeWhenVisible = resumeWhenContextRunning = false; offset = position();
      ++generation; clearTimeoutAndRequest(); stopSource(); releaseMedia(); display('blocked'); onBlocked?.();
      return false;
    }
    function unavailable() {
      if (disposed || state === 'unavailable') return false;
      resumeWhenVisible = resumeWhenContextRunning = false; ++generation; clearTimeoutAndRequest(); stopSource(); releaseMedia();
      buffer = null; entry = null; offset = 0; display('unavailable'); controls.remove();
      // Reuse the host's failure recovery to release only a narration-owned auto pause.
      onBlocked?.();
      return false;
    }
    function releaseMedia() {
      for (const remove of mediaListeners.splice(0)) remove();
      if (media) { media.pause(); media.removeAttribute('src'); media.load(); media = null; }
    }
    function finished(request) {
      if (disposed || request !== generation || state === 'ended') return;
      clearTimeoutAndRequest(); stopSource(); releaseMedia(); offset = 0; buffer = null;
      if (entry && clipIndex + 1 < entry.clips.length) {
        clipIndex++; display('paused'); void play();
      } else { clipIndex = 0; endedAt = now(); display('ended'); onEnded?.(); }
    }
    async function metadata(signal) {
      if (entry) return entry;
      const data = await manifest(signal), candidate = data.scenes[sceneKey];
      if (!Object.prototype.hasOwnProperty.call(data.scenes, sceneKey)) return null;
      if (!candidate || candidate.textSha256 !== await sha256(window.__HAPIL_NARRATION_START_RC139__?.voiceText(text)??text)) throw new Error('Narration does not match this text');
      if (signal.aborted) throw new Error('Narration cancelled');
      const clips = (candidate.clips || [candidate]).map(clip => {
        const url = new URL(clip.audio, manifestURL);
        const original = ['opening-memory.wav', 'root-memory.wav'].some(name => url.href === new URL('../../../assets/rc26/audio/' + name, base).href);
        if (url.origin !== base.origin || (!url.pathname.startsWith(base.pathname + 'audio/') && !original)) throw new Error('Invalid narration asset');
        if (!(Number(clip.duration) > 0)) throw new Error('Invalid narration duration');
        return {...clip, url: url.href};
      });
      if (!clips.length) throw new Error('Empty narration playlist');
      entry = {...candidate, clips};
      return entry;
    }
    function watchProgress(request) {
      if (progressWatch != null) return;
      let lastPosition = position(), lastProgress = now();
      const check = () => {
        progressWatch = null;
        if (disposed || request !== generation || state !== 'playing') return;
        if (!media && contextInterrupted()) { contextChanged(); return; }
        const current = position();
        if (current > lastPosition + .005) { lastPosition = current; lastProgress = now(); }
        if (now() - lastProgress >= LOAD_TIMEOUT_MS) { failed(request); return; }
        progressWatch = window.setTimeout(check, 1000);
      };
      progressWatch = window.setTimeout(check, 1000);
    }
    function started(request, duration) {
      if (disposed || request !== generation) return false;
      if (timeout != null) window.clearTimeout(timeout); timeout = null;
      display('playing'); updateVolume(); watchProgress(request);
      onPlaying?.(Math.max(0, Number(duration) - offset) + entry.clips.slice(clipIndex + 1).reduce((sum, clip) => sum + Number(clip.duration), 0));
      return true;
    }
    async function playMedia(request, details) {
      // Never reuse an element across attempts: queued events/promises belong to that attempt.
      releaseMedia();
      const clip = new Audio(details.url); media = clip;
      clip.preload = 'auto'; clip.setAttribute('playsinline', '');
      const current = () => !disposed && request === generation && media === clip;
      const listenMedia = (event, callback) => {
        clip.addEventListener(event, callback);
        mediaListeners.push(() => clip.removeEventListener(event, callback));
      };
      listenMedia('error', () => {
        if (current() && (state === 'loading' || state === 'playing')) failed(request);
      });
      listenMedia('ended', () => {
        if (current() && (state === 'loading' || state === 'playing')) finished(request);
      });
      listenMedia('waiting', () => {
        if (!current() || state !== 'playing') return;
        if (timeout != null) window.clearTimeout(timeout);
        timeout = window.setTimeout(() => failed(request), LOAD_TIMEOUT_MS);
      });
      listenMedia('playing', () => {
        if (!current() || state === 'paused' || state === 'ended' || state === 'blocked') return;
        started(request, Number.isFinite(clip.duration) ? clip.duration : details.duration);
      });
      updateVolume();
      await window.__HAPIL_NARRATION_START_RC139__?.mediaReady(clip,controller.signal,current);
      await window.__HAPIL_NARRATION_START_RC139__?.wait({signal:controller.signal,isCurrent:current});
      if(!current())return false;
      if (offset > 0) clip.currentTime = offset;
      updateDucking(true);
      await clip.play();
      if (!current()) { clip.pause(); return false; }
      if (state !== 'playing') started(request, Number.isFinite(clip.duration) ? clip.duration : details.duration);
      return true;
    }
    async function play() {
      if (disposed || state === 'unavailable' || state === 'playing' || state === 'loading') return false;
      if (active !== api) { active?.pause(false, true); active = api; }
      if (state === 'ended') { offset = 0; clipIndex = 0; }
      resumeWhenVisible = resumeWhenContextRunning = false;
      unlock();
      const request = ++generation; display('loading'); onLoading?.();
      controller = new AbortController(); const signal = controller.signal;
      timeout = window.setTimeout(() => {
        if (disposed || request !== generation) return;
        if (!media && contextInterrupted()) contextChanged();
        else failed(request);
      }, LOAD_TIMEOUT_MS);
      observeContext();
      if (contextInterrupted()) { contextChanged(); return false; }
      try {
        const candidate = await metadata(signal);
        if (disposed || request !== generation) return false;
        if (!candidate) return unavailable();
        const details = candidate.clips[clipIndex];
        if (audioContext) {
          try {
            if (!buffer) {
              const response = await fetch(details.url, {signal});
              if (!response.ok) throw new Error('Narration audio unavailable');
              const decoded = await audioContext.decodeAudioData(await response.arrayBuffer());
              if (disposed || request !== generation) return false;
              buffer = decoded;
            }
            if (disposed || request !== generation) return false;
            await audioContext.resume();
            if (disposed || request !== generation) return false;
            if (contextInterrupted()) { contextChanged(); return false; }
            if (audioContext.state !== 'running') throw new Error('Narration audio suspended');
            await window.__HAPIL_NARRATION_START_RC139__?.wait({signal,isCurrent:()=>!disposed&&request===generation&&active===api&&!document.hidden});
            if(disposed||request!==generation||signal.aborted)return false;
            if(contextInterrupted()){contextChanged();return false;}
            source = audioContext.createBufferSource(); gain = audioContext.createGain();
            source.buffer = buffer; gain.gain.value = effectiveVolume(); source.connect(gain); gain.connect(audioContext.destination);
            source.onended = () => finished(request); startedAt = audioContext.currentTime;
            updateDucking(true);
            source.start(0, Math.min(offset, Math.max(0, buffer.duration - .001)));
            return started(request, buffer.duration);
          } catch (error) {
            if (disposed || request !== generation || signal.aborted) return false;
            if (contextInterrupted()) { contextChanged(); return false; }
            stopSource();
          }
        }
        return await playMedia(request, details);
      } catch { return failed(request); }
    }
    const api = Object.freeze({
      play, pause,
      stop() {
        if (disposed) return;
        pause(); disposed = true; buffer = null; entry = null;
        availabilityController.abort();
        releaseMedia();
        for (const remove of listeners) remove();
        controls.remove(); if (active === api) active = null;
      },
      setContext(next = {}) {
        if (disposed) return;
        if (next.sound !== lastSound) { lastSound = next.sound; muted = next.sound === false; }
        if (next.voiceVolume !== lastVolume) { lastVolume = next.voiceVolume; volume = volumeValue(next.voiceVolume); }
        updateVolume();
      },
      get playing() { return state === 'playing'; },
      get status() { return state; },
      get ended() { return state === 'ended'; },
      get blocksAdvance() { return !disposed && (resumeWhenContextRunning || state === 'loading' || state === 'playing' || (state === 'ended' && now() - endedAt < END_TAIL_MS)); },
      get position() { return position(); }
    });
    listen(playButton, 'click', () => { if (state === 'playing' || state === 'loading') pause(true); else void play(); });
    listen(muteButton, 'click', () => { muted = !muted; updateVolume(); });
    listen(range, 'input', () => { volume = volumeValue(Number(range.value) / 100); updateVolume(); });
    listen(document, 'visibilitychange', () => {
      if (document.hidden && (state === 'playing' || state === 'loading')) {
        pause(false, true); resumeWhenVisible = true;
      } else if (!document.hidden && (resumeWhenVisible || resumeWhenContextRunning) && (state === 'paused' || state === 'interrupted') && active === api) {
        resumeWhenVisible = false; void play();
      }
    });
    // A history-cache restore may keep this DOM alive; cancel sound without destroying resume controls.
    listen(window, 'pagehide', () => pause(false, true));
    // Cancel stale work even when another UI removes the card without calling close().
    const removed = new MutationObserver(() => { if (!root.isConnected) api.stop(); });
    removed.observe(document.body, {childList: true, subtree: true});
    listeners.push(() => removed.disconnect());
    active = api; updateVolume();
    // A partial release omits unfinished routes. Check metadata even for muted cards,
    // without requesting audio, so unavailable controls cannot strand a paused reader.
    void manifest(availabilityController.signal).then(data => {
      if (!disposed && !Object.prototype.hasOwnProperty.call(data.scenes, sceneKey)) unavailable();
    }).catch(() => { if (!disposed && (state === 'idle' || resumeWhenContextRunning)) failed(generation); });
    if (interacted && ctx.sound !== false && volume > 0) void play();
    return api;
  }
  window.__HAPIL_STORY_NARRATION_V1__ = Object.freeze({attach});
})();
