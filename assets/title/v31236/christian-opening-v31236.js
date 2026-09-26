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
    event.preventDefault();
    event.stopPropagation?.();
    event.stopImmediatePropagation?.();
    advance();
  }

  function onKeyDown(event) {
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
