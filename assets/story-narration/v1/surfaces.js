/* Narration for live journal, rebirth and ending surfaces, without changing game timers. */
(() => {
  'use strict';
  const readers = new Map();
  let queued = false;
  function context() {
    const settings = window.__HAPIL_CONTROLS_V31329__?.binding?.settings?.current || {};
    return {sound: settings.sound !== false, voiceVolume: settings.sfxVolume};
  }
  function journal(root) {
    const zone = root.querySelector('.patient-index button[aria-current="true"]')?.dataset.zone || root.querySelector('.patient-zone')?.textContent.match(/^원문 구역 ([^\s·]+) ·/)?.[1];
    const tab = root.querySelector('[data-tab][aria-pressed="true"]')?.dataset.tab || 'all';
    const text = [...root.querySelectorAll('.patient-body .patient-text')].map(element => element.textContent).join('\n\n');
    return zone && text ? {key: `journal:${zone}:${tab}`, text, footer: root.querySelector('.patient-footer')} : null;
  }
  function death(root) {
    const title = root.querySelector('#hapil-death-verse-title-rc59');
    const verse1 = root.querySelector('blockquote'), verse2 = verse1?.nextElementSibling?.nextElementSibling;
    if (!title || !verse1 || !verse2) return null;
    return {key: 'death:verse', text: [title, verse1, verse2].map(element => element.textContent).join('\n\n')};
  }
  function ending(root) {
    if (!root.classList.contains('open') || root.dataset.phase !== 'ending-title') return null;
    const text = root.querySelector('p')?.textContent;
    return text ? {key: 'ending:title', text} : null;
  }
  function schedule() {
    if (queued) return; queued = true;
    queueMicrotask(() => { queued = false; sync(); });
  }
  function sync() {
    const deathRoot = document.getElementById('hapil-death-verse-rc59');
    const primary = document.getElementById('hapil-story-rc51');
    const journalRoot = document.getElementById('hapil-patient-v31368');
    const endingRoot = document.getElementById('hapil-final-overlay-v31300');
    const candidate = deathRoot || (primary ? null : journalRoot || endingRoot);
    for (const [element, record] of readers) {
      if (!element.isConnected) {
        // Complete the existing death cleanup before releasing the lower card's lock.
        if (element.id === 'hapil-death-verse-rc59') element.finishRC121?.();
        record.player?.stop(); record.observer.disconnect(); readers.delete(element);
        if (!deathRoot && record.preemptedPrimary?.isConnected && document.getElementById('hapil-story-rc51') === record.preemptedPrimary) window.__HAPIL_STORY_RC51__?.close?.(false);
      }
      else if (element !== candidate) { record.player?.stop(); record.player = null; record.signature = null; }
    }
    if (!candidate) return;
    const details = candidate === deathRoot ? death(candidate) : candidate === journalRoot ? journal(candidate) : ending(candidate);
    let record = readers.get(candidate);
    if (!record) {
      const observer = new MutationObserver(schedule);
      observer.observe(candidate, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'data-phase', 'aria-current', 'aria-pressed']});
      record = {observer, signature: null, player: null}; readers.set(candidate, record);
    }
    if (deathRoot && primary && record.preemptedPrimary !== primary) {
      record.preemptedPrimary = primary;
      deathRoot.style.zIndex = '2147483001';
      window.__HAPIL_STORY_RC51__?.pauseNarration?.();
    }
    if (!details) { record.player?.stop(); record.player = null; record.signature = null; return; }
    const signature = details.key + '\n' + details.text;
    if (signature === record.signature && record.player) { record.player.setContext(context()); return; }
    record.player?.stop();
    let footer = details.footer;
    if (!footer) {
      footer = candidate.querySelector('.hapil-story-narration-slot');
      if (!footer) { footer = document.createElement('div'); footer.className = 'hapil-story-narration-slot'; (candidate.querySelector('section') || candidate).append(footer); }
    }
    record.signature = signature;
    record.player = window.__HAPIL_STORY_NARRATION_V1__?.attach({root: candidate, ...details, footer, ctx: context()}) || null;
  }
  function initialize() {
    // UI roots are direct body children. Only an open reader gets a subtree observer.
    new MutationObserver(schedule).observe(document.body, {childList: true});
    window.addEventListener('hapil:final-event', schedule);
    // Existing death/ending keyboard guards must not turn volume or play into Skip.
    window.addEventListener('keydown', event => {
      const target = event.target?.closest?.('[data-narration-controls]');
      if (!target || target.closest('#hapil-story-rc51')) return;
      if (event.key === 'Escape') return;
      event.stopImmediatePropagation();
      if ((event.key === 'Enter' || event.key === ' ') && event.target?.tagName === 'BUTTON') {
        event.preventDefault(); if (!event.repeat) event.target.click();
      }
    }, true);
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once: true});
  else initialize();
})();
