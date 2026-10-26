'use strict';
const assert = require('node:assert/strict');

// Existing portrait cases retain a real orientation lock assertion, then run
// their unchanged combat checks in the supported landscape viewport.
function landscape(viewport) {
  return viewport.height > viewport.width
    ? { width: viewport.height, height: viewport.width }
    : { ...viewport };
}
async function beforeLoad(page, requestedViewport = page.viewportSize()) {
  page.__requestedOrientationViewport = { ...requestedViewport };
  const combatViewport = landscape(requestedViewport);
  await page.setViewportSize(combatViewport);
  return combatViewport;
}
async function contract(page, requestedViewport = page.__requestedOrientationViewport, options = {}) {
  if (!requestedViewport || requestedViewport.height <= requestedViewport.width) return null;
  const capture = () => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C?.binding?.state?.current;
    const fields = (a, keys) => Object.fromEntries(keys.map(k => [k, a?.[k] ?? null]));
    return s ? {
      state: fields(s, ['zone', 'time', 'hp', 'x', 'y', 'paused', 'pause', 'awakeningUntil', 'timeStopUntil']),
      enemies: (s.enemies ?? []).map(a => fields(a, ['id', 'hp', 'x', 'y', 'attackAt', 'recoverUntil', 'readyAt', 'patternReadyAt', 'atomicCastUntil31210'])),
      queues: Object.fromEntries(['hostileProjectiles', 'pendingHits', 'impactQueue', 'pendingStrikes', 'bossLaserCastsV31330'].map(key => [key, (s[key] ?? []).map(q => fields(q, ['id', 'sourceId', 'x', 'y', 'vx', 'vy', 'born', 'at', 'impactAt', 'frozenUntil', 'motionReleaseAt31219', 'endAt', 'damage']))]))
    } : null;
  };
  const prior = await page.evaluate(() => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C?.binding?.state?.current;
    return { paused: s?.paused ?? null, pause: s?.pause ?? null, phase: C?.binding?.phase ?? null };
  });
  await page.setViewportSize(requestedViewport);
  await page.waitForFunction(() => window.__HAPIL_ORIENTATION_PAUSE_RC152__?.paused() === true);
  const guide = await page.evaluate(() => {
    const g = document.getElementById('rc152-orientation-gate'), C = window.__HAPIL_CONTROLS_V31329__;
    return { label: g?.textContent, visible: !!g && getComputedStyle(g).display !== 'none' && getComputedStyle(g).visibility !== 'hidden', inputCount: C?.binding?.input?.current?.size ?? 0 };
  });
  assert.equal(guide.label, options.historicalLabel ?? '기기를 가로로 돌려주세요');
  assert(guide.visible, 'portrait orientation guide is visible');
  assert.equal(guide.inputCount, 0, 'portrait transition releases native held input');
  const frozen = await page.evaluate(capture);
  await page.keyboard.down('ArrowRight');
  try {
    await page.keyboard.press('Space');
    await page.mouse.click(100, 180);
    await page.waitForTimeout(180);
  } finally { await page.keyboard.up('ArrowRight'); }
  assert.deepEqual(await page.evaluate(capture), frozen, 'portrait freezes native time, actors, attacks and damage');
  assert.equal(await page.evaluate(() => window.__HAPIL_CONTROLS_V31329__?.binding?.input?.current?.size ?? 0), 0, 'portrait keyboard/pointer input cannot remain held');
  if (options.onPortrait) await options.onPortrait();
  const combatViewport = landscape(requestedViewport);
  await page.setViewportSize(combatViewport);
  await page.waitForFunction(() => window.__HAPIL_ORIENTATION_PAUSE_RC152__?.paused() === false);
  const resumed = await page.evaluate(() => {
    const C = window.__HAPIL_CONTROLS_V31329__, s = C?.binding?.state?.current, g = document.getElementById('rc152-orientation-gate');
    return { paused: s?.paused ?? null, pause: s?.pause ?? null, phase: C?.binding?.phase ?? null, guideVisible: !!g && getComputedStyle(g).display !== 'none', inputCount: C?.binding?.input?.current?.size ?? 0 };
  });
  assert.equal(resumed.paused, prior.paused, 'rotation preserves preexisting paused state');
  assert.equal(resumed.pause, prior.pause, 'rotation preserves preexisting pause state');
  assert.equal(resumed.phase, prior.phase, 'rotation preserves the active title/game phase');
  assert(!resumed.guideVisible, 'landscape hides the orientation guide');
  assert.equal(resumed.inputCount, 0, 'landscape resumes with released input');
  const evidence = { requestedViewport, combatViewport, label: guide.label, freezeExact: true, inputReleased: true, priorPausePreserved: true };
  (page.__orientationEvidence ??= []).push(evidence);
  return evidence;
}
module.exports = { landscape, beforeLoad, contract };
