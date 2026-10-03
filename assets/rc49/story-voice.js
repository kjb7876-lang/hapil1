/* Story narration uses the AudioContext unlocked by the start button.
 * The story card mounts after asynchronous image loading, when a new media
 * element can no longer rely on the start button's transient activation.
 */
(() => {
  'use strict';

  let context = null;
  let resumeResult = Promise.resolve(false);
  let silentPrimed = false;
  const buffers = new Map();

  function decoded(path) {
    if (!context || typeof window.fetch !== 'function')
      return Promise.reject(new Error('AudioContext or fetch unavailable'));
    if (!buffers.has(path)) {
      const request = window.fetch(path)
        .then(response => {
          if (!response.ok) throw new Error('Narration audio unavailable');
          return response.arrayBuffer();
        })
        .then(bytes => context.decodeAudioData(bytes))
        .catch(error => {
          buffers.delete(path);
          throw error;
        });
      buffers.set(path, request);
    }
    return buffers.get(path);
  }

  function unlock(prefetchPath) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    try {
      if (!context) context = new AudioContext();
      // This call runs synchronously in the pointer/keyboard handler.
      resumeResult = Promise.resolve(context.resume())
        .then(() => context.state === 'running')
        .catch(() => false);
      if (!silentPrimed) {
        const source = context.createBufferSource();
        source.buffer = context.createBuffer(1, 1, context.sampleRate);
        source.connect(context.destination);
        source.start(0);
        silentPrimed = true;
      }
      if (prefetchPath) decoded(prefetchPath).catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  function create(path, {volume = 1, onPlaying, onEnded, onBlocked} = {}) {
    let status = 'paused';
    let disposed = false;
    let generation = 0;
    let position = 0;
    let startedAt = 0;
    let source = null;
    let media = null;
    let duration = 0;
    let backend = null;
    const gainValue = Math.max(0, Math.min(1, Number(volume) || 0));

    function blocked() {
      if (disposed) return false;
      status = 'blocked';
      onBlocked?.();
      return false;
    }
    function prepareMedia() {
      backend = 'media';
      if (media) return media;
      media = new Audio(path);
      media.preload = 'auto';
      media.volume = gainValue;
      media.setAttribute?.('playsinline', '');
      media.addEventListener('playing', () => {
        if (!disposed && status !== 'paused') {
          status = 'playing';
          onPlaying?.();
        }
      });
      media.addEventListener('ended', () => {
        if (!disposed) {
          position = 0;
          status = 'ended';
          onEnded?.();
        }
      });
      return media;
    }

    async function play() {
      if (disposed || status === 'playing' || status === 'loading') return false;
      if (status === 'ended') position = 0;
      const request = ++generation;
      status = 'loading';
      unlock();
      if (context) {
        backend = 'webaudio';
        try {
          const [audio, running] = await Promise.all([decoded(path), resumeResult]);
          if (disposed || request !== generation) return false;
          if (!running || context.state !== 'running') throw new Error('AudioContext suspended');
          const node = context.createBufferSource();
          duration = audio.duration;
          const gain = context.createGain();
          node.buffer = audio;
          gain.gain.value = gainValue;
          node.connect(gain);
          gain.connect(context.destination);
          node.onended = () => {
            if (disposed || request !== generation || source !== node) return;
            source = null;
            position = 0;
            status = 'ended';
            onEnded?.();
          };
          if (media) media.pause();
          startedAt = context.currentTime;
          source = node;
          node.start(0, Math.min(position, Math.max(0, audio.duration - .001)));
          status = 'playing';
          onPlaying?.();
          return true;
        } catch {
          if (disposed || request !== generation) return false;
          // Decoding or fetching can fail independently of media playback.
        }
      }
      try {
        const clip = prepareMedia();
        if (position > 0) clip.currentTime = position;
        const result = clip.play();
        if (result?.then) await result;
        if (disposed || request !== generation) {
          clip.pause();
          return false;
        }
        if (status === 'loading') {
          status = 'playing';
          onPlaying?.();
        }
        return true;
      } catch {
        if (disposed || request !== generation) return false;
        return blocked();
      }
    }

    function pause() {
      if (disposed) return;
      ++generation;
      if (source) {
        position += Math.max(0, context.currentTime - startedAt);
        source.onended = null;
        source.stop();
        source.disconnect();
        source = null;
      }
      if (media) {
        if (!media.paused) position = media.currentTime;
        media.pause();
      }
      status = 'paused';
    }

    return Object.freeze({
      play, pause,
      stop() {
        if (disposed) return;
        pause();
        disposed = true;
        media?.removeAttribute?.('src');
        media?.load?.();
        media = null;
      },
      get paused() { return status !== 'playing' && status !== 'loading'; },
      get playing() { return status === 'playing'; },
      get ended() { return status === 'ended'; },
      get status() { return status; },
      // Read-only transport observations let the host hold text until actual
      // completion and distinguish an OS interruption from failed loading.
      get position() {
        if (source && context) return Math.min(duration || Infinity, position + Math.max(0, context.currentTime - startedAt));
        if (backend === 'media' && media && Number.isFinite(media.currentTime)) return media.currentTime;
        return position;
      },
      get duration() { return duration || (Number.isFinite(media?.duration) ? media.duration : 0); },
      get backend() { return backend; },
      get contextState() { return context?.state ?? null; },
      get audioContext() { return context; },
    });
  }

  window.__HAPIL_STORY_VOICE_RC49__ = Object.freeze({unlock, create});
})();
