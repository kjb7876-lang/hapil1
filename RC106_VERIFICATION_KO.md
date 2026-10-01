# RC106 viewport stability and layout verification

## Changes

- The camera and pointer mapping continue to use the current visual viewport. Duplicate resize events no longer invalidate the camera when the dimensions did not change.
- Mobile render resolution now uses a separate settled viewport. Height-only changes commit after 180 ms without another resize; orientation changes and width changes greater than 96 CSS pixels commit immediately. The existing canvas renderer therefore avoids reallocating its backing buffer for short browser-bar resize bursts.
- The PC 10:80:10 information/arena layout and 16:9 canvas are preserved. The current layout already places the full viewport-width enemy and ally rails outside the battlefield and keeps the combat footer below the stage.
- `assets/index-v31526.js` was not modified (6,129,892 bytes).

## Measured browser results

- PC, 1180×757: stage x=118, y=42, 944×599; canvas x=118, y=76, 944×531 (16:9); left and right information rails each 118 px wide and outside the canvas. Header 42 px; combat footer y=641, h=116 px. Manual-mode skills/actions remain inside the footer. No overlap or clipping assertions failed.
- Mobile, 390×844: full-stage portrait with movement centered below the combat view and resonance/blink at opposite bottom corners. Canvas backing was 1247×702.
- Resize burst 390×844 → 820 → 790 → 760 → 800 → 844: 0 canvas backing width/height writes; after layout settled, the stage returned to 390×844.
- Settled 390×560: backing became 828×466 with one width and one height write.
- Rotation to 844×390: backing viewport committed immediately; after layout settled, the stage/canvas filled 844×390, with movement, blink, and resonance visible and in bounds. Landscape control placement is unchanged.
- CDP multitouch: movement remained held while blink and resonance were pressed/released; opening the on-demand controls dialog cleared held input; settings opened and closed without browser errors.

## Verification run

- 50/50 `tests/*-smoke.cjs` scripts passed (Chromium path supplied for the browser-backed smoke test).
- 153/153 JavaScript files under `assets/` and `data/` passed `node --check`; the new RC106 browser test also passed syntax validation.
- `tests/rc99-battle-layout-browser.cjs`: desktop 1180×757, 1920×1080, 1280×600; mobile 390×844, 844×390, 320×568. Passed overlap/clipping, repeated settings open/close, on-demand details close/reopen, and manual/semi/automatic mode and control checks.
- `tests/rc104-viewport-browser.cjs`: 320×568, 375×812, 430×932, 844×390, and 1180×757. Heroes/enemies remained visible and native pointer coordinates matched the cropped mobile viewport.
- `tests/rc103-mobile-interaction-browser.cjs`: portrait multitouch and input-release behavior passed.
- `tests/rc106-viewport-stability-browser.cjs`: resize burst, backing-pixel write counts, settled portrait resize, orientation rotation, safe control bounds, settings close, and runtime errors passed.

Screenshots in the task evidence bundle are Chromium-rendered captures at the listed CSS viewports. A physical iPhone/Android browser was not available, so device address-bar animation, safe-area insets, and hardware frame rate remain unverified.
