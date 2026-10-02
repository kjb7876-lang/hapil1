/* Canonical Korean story narration. Original voice 1/2 stay on RC49. */
(() => {
  'use strict';
  const script = document.currentScript;
  const base = new URL('./', script?.src || document.baseURI);
  const manifestURL = new URL('manifest.json', base);
  const LOAD_TIMEOUT_MS = 15000;
  let audioContext = null, interacted = false, manifestRequest = null, active = null;

  function unlock() {
    const Constructor = window.AudioContext || window.webkitAudioContext;
    if (!Constructor || !interacted) return false;
    try {
      if (!audioContext) audioContext = new Constructor();
      Promise.resolve(audioContext.resume()).catch(() => {});
      return true;
    } catch { return false; }
  }
  function interaction(event) {
    if (event.isTrusted === false) return;
    interacted = true;
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

  function attach({root, text, zone, phase, key, footer: targetFooter, ctx = {}, onPlaying, onUserPause} = {}) {
    // These two recorded performances and their existing controls are immutable.
    if (!root || !text || (zone === 'dist00' && (phase === 'pre' || phase === 'post'))) return null;
    const footer = targetFooter || root.querySelector('.rc51-footer') || root.querySelector('[data-narration-footer]');
    if (!footer) return null;
    active?.stop();
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
    let source = null, gain = null, media = null, startedAt = 0, offset = 0, clipIndex = 0, controller = null, timeout = null;
    let volume = volumeValue(ctx.voiceVolume), muted = ctx.sound === false, lastSound = ctx.sound, lastVolume = ctx.voiceVolume;
    const listeners = [], mediaListeners = [];
    function listen(target, event, callback) {
      target.addEventListener(event, callback); listeners.push(() => target.removeEventListener(event, callback));
    }
    function effectiveVolume() { return muted ? 0 : volume; }
    function updateVolume() {
      if (gain) gain.gain.value = effectiveVolume();
      if (media) media.volume = effectiveVolume();
      range.value = String(Math.round(volume * 100));
      muteButton.textContent = muted ? '음소거 해제' : '음소거';
      muteButton.setAttribute('aria-pressed', String(muted));
    }
    function display(nextState) {
      state = nextState; root.dataset.narrationState = nextState;
      playButton.textContent = ({idle: '음성 재생', loading: '음성 불러오는 중…', playing: '음성 일시정지', paused: '음성 이어 듣기', ended: '다시 듣기', blocked: '음성 재생 · 다시 시도'})[nextState] || '음성 재생';
      playButton.setAttribute('aria-busy', String(nextState === 'loading'));
    }
    function clearTimeoutAndRequest() {
      if (timeout != null) window.clearTimeout(timeout);
      timeout = null; controller?.abort(); controller = null;
    }
    function stopSource() {
      if (source) { source.onended = null; try { source.stop(); } catch {} source.disconnect(); source = null; }
      if (gain) { gain.disconnect(); gain = null; }
      if (media) media.pause();
    }
    function position() {
      if (media && state === 'playing') return Number(media.currentTime) || offset;
      return offset + (source && state === 'playing' ? Math.max(0, audioContext.currentTime - startedAt) : 0);
    }
    function pause(user = false) {
      if (disposed) return;
      offset = position(); ++generation; clearTimeoutAndRequest(); stopSource(); display('paused');
      if (user) onUserPause?.();
    }
    function failed(request) {
      if (disposed || request !== generation) return false;
      ++generation; clearTimeoutAndRequest(); stopSource(); display('blocked');
      return false;
    }
    function releaseMedia() {
      for (const remove of mediaListeners.splice(0)) remove();
      if (media) { media.pause(); media.removeAttribute('src'); media.load(); media = null; }
    }
    function finished(request) {
      if (disposed || request !== generation) return;
      clearTimeoutAndRequest(); stopSource(); releaseMedia(); offset = 0; buffer = null;
      if (entry && clipIndex + 1 < entry.clips.length) {
        clipIndex++; display('paused'); void play();
      } else { clipIndex = 0; display('ended'); }
    }
    async function metadata(signal) {
      if (entry) return entry;
      const data = await manifest(signal), candidate = data.scenes[sceneKey];
      if (!candidate || candidate.textSha256 !== await sha256(text)) throw new Error('Narration does not match this text');
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
    function started(request, duration) {
      if (disposed || request !== generation) return false;
      if (timeout != null) window.clearTimeout(timeout); timeout = null;
      display('playing'); updateVolume();
      onPlaying?.(Math.max(0, Number(duration) - offset) + entry.clips.slice(clipIndex + 1).reduce((sum, clip) => sum + Number(clip.duration), 0));
      return true;
    }
    async function playMedia(request, details) {
      if (!media) {
        media = new Audio(details.url); media.preload = 'none'; media.setAttribute('playsinline', '');
        const listenMedia = (event, callback) => { const clip = media; clip.addEventListener(event, callback); mediaListeners.push(() => clip.removeEventListener(event, callback)); };
        listenMedia('error', () => { if (state === 'loading' || state === 'playing') failed(generation); });
        listenMedia('ended', () => finished(generation));
        listenMedia('waiting', () => {
          if (disposed || state !== 'playing') return;
          // A broken/stalled media request must not retain the story forever.
          if (timeout != null) window.clearTimeout(timeout);
          const expected = generation;
          timeout = window.setTimeout(() => failed(expected), LOAD_TIMEOUT_MS);
        });
        listenMedia('playing', () => {
          if (disposed || state === 'paused') return;
          started(generation, Number.isFinite(media.duration) ? media.duration : details.duration);
        });
      }
      updateVolume(); if (offset > 0) media.currentTime = offset;
      await media.play();
      if (disposed || request !== generation) { media?.pause(); return false; }
      if (state !== 'playing') started(request, Number.isFinite(media.duration) ? media.duration : details.duration);
      return true;
    }
    async function play() {
      if (disposed || state === 'playing' || state === 'loading') return false;
      if (state === 'ended') { offset = 0; clipIndex = 0; }
      unlock();
      const request = ++generation; display('loading');
      controller = new AbortController(); const signal = controller.signal;
      timeout = window.setTimeout(() => failed(request), LOAD_TIMEOUT_MS);
      try {
        const details = (await metadata(signal)).clips[clipIndex];
        if (disposed || request !== generation) return false;
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
            if (audioContext.state !== 'running') throw new Error('Narration audio suspended');
            source = audioContext.createBufferSource(); gain = audioContext.createGain();
            source.buffer = buffer; gain.gain.value = effectiveVolume(); source.connect(gain); gain.connect(audioContext.destination);
            source.onended = () => finished(request); startedAt = audioContext.currentTime;
            source.start(0, Math.min(offset, Math.max(0, buffer.duration - .001)));
            return started(request, buffer.duration);
          } catch (error) {
            if (disposed || request !== generation || signal.aborted) return false;
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
      get position() { return position(); }
    });
    listen(playButton, 'click', () => { if (state === 'playing' || state === 'loading') pause(true); else void play(); });
    listen(muteButton, 'click', () => { muted = !muted; updateVolume(); });
    listen(range, 'input', () => { volume = volumeValue(Number(range.value) / 100); updateVolume(); });
    listen(document, 'visibilitychange', () => { if (document.hidden && (state === 'playing' || state === 'loading')) pause(false); });
    listen(window, 'pagehide', () => api.stop());
    // Cancel stale work even when another UI removes the card without calling close().
    const removed = new MutationObserver(() => { if (!root.isConnected) api.stop(); });
    removed.observe(document.body, {childList: true, subtree: true});
    listeners.push(() => removed.disconnect());
    active = api; updateVolume();
    if (interacted && ctx.sound !== false && volume > 0) void play();
    return api;
  }
  window.__HAPIL_STORY_NARRATION_V1__ = Object.freeze({attach});
})();
