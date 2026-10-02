(() => {
  "use strict";

  const VERSION = "3.12.36";
  const overlay = document.getElementById("mongse-christian-opening-v31236");
  if (!overlay || overlay.dataset.initialized === "true") return;
  const quote = document.getElementById("mongse-christian-opening-quote-v31236");
  const mark = document.getElementById("mongse-christian-opening-mark-v31236");

  overlay.dataset.initialized = "true";
  document.body.classList.add("mongse-opening-active");

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const quoteDuration = reduceMotion ? 2200 : 5100;
  const markDuration = reduceMotion ? 1500 : 2700;
  const fadeDuration = reduceMotion ? 200 : 740;
  const timers = new Set();
  let phase = "quote";
  let finished = false;
  let narration = null;

  const later = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  };

  const clearTimers = () => {
    for (const timer of timers) window.clearTimeout(timer);
    timers.clear();
  };

  const removeInputGuards = () => {
    overlay.removeEventListener("click", onAdvance);
    window.removeEventListener("keydown", onKeyDown, true);
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    narration?.stop();
    clearTimers();
    removeInputGuards();
    overlay.classList.add("is-leaving");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mongse-opening-active");
    later(() => overlay.remove(), fadeDuration);
  };

  const showMark = () => {
    if (finished || phase === "mark") return;
    clearTimers();
    narration?.stop();
    phase = "mark";
    overlay.dataset.phase = "mark";
    overlay.setAttribute("aria-label", "合一");
    quote?.setAttribute("aria-hidden", "true");
    mark?.setAttribute("aria-hidden", "false");
    later(finish, markDuration);
  };

  const advance = () => {
    if (phase === "quote") showMark();
    else finish();
  };

  function onAdvance(event) {
    if (event.target?.closest?.('[data-narration-controls]')) return;
    event.preventDefault();
    event.stopPropagation?.();
    event.stopImmediatePropagation?.();
    advance();
  }

  function onKeyDown(event) {
    if (event.key !== 'Escape' && event.target?.closest?.('[data-narration-controls]')) return;
    if(event.key === "Escape"){event.preventDefault();event.stopImmediatePropagation();finish();return;}
    if (
      event.repeat ||
      (event.code !== "KeyF" &&
        !["Enter", " ", "Spacebar", "f", "F"].includes(event.key))
    )
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    advance();
  }

  overlay.addEventListener("click", onAdvance);
  window.addEventListener("keydown", onKeyDown, true);
  overlay.setAttribute("tabindex", "-1");
  window.requestAnimationFrame?.(() => overlay.focus?.({ preventScroll: true }));
  later(showMark, quoteDuration);
  const narrationFooter = document.createElement('div');
  narrationFooter.className = 'hapil-prologue-narration';
  overlay.append(narrationFooter);
  const stanzaText = element => {
    const copy = element.cloneNode(true);
    for (const br of copy.querySelectorAll('br')) br.replaceWith(document.createTextNode('\n'));
    return copy.textContent;
  };
  const stanzas = [quote?.querySelector('.mongse-christian-opening__passing'), quote?.querySelector('.mongse-christian-opening__awakening')];
  if (stanzas.every(Boolean)) narration = window.__HAPIL_STORY_NARRATION_V1__?.attach({
    root: overlay, key: 'prologue:quote', text: stanzas.map(stanzaText).join('\n\n'), footer: narrationFooter,
    ctx: {sound: true, voiceVolume: .8},
    onPlaying: seconds => { if (!finished && phase === 'quote') { clearTimers(); later(showMark, Math.max(1500, seconds * 1000 + 1500)); } },
    onUserPause: () => { if (!finished && phase === 'quote') clearTimers(); }
  }) || null;

  window.__MONGSE_CHRISTIAN_OPENING_V31236__ = Object.freeze({
    version: VERSION,
    cover: "./assets/title/v31236/mongse-dream-cover.webp",
    quoteDuration,
    markDuration,
    phases: Object.freeze(["quote", "mark", "title"]),
    get phase() {
      return finished ? "title" : phase;
    },
    advance,
    finish,
  });
})();
