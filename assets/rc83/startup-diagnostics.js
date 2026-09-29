/* RC83: capture the first missing runtime dependency when launch initialization stalls. */
(() => {
  'use strict';
  const started = Date.now();
  const report = () => {
    const v318 = window.__HAPIL_V31318_RELEASE__;
    const v322 = window.__HAPIL_V31322_RELEASE__;
    const v329 = window.__HAPIL_V31329_RELEASE__;
    const v330 = window.__HAPIL_V31330_RELEASE__;
    const v331 = window.__HAPIL_V31331_RELEASE__;
    return {
      elapsedMs: Date.now() - started,
      v31317: window.__HAPIL_V31317_RELEASE__?.allPass ?? null,
      v31318: v318 ? { installed: v318.installed, allPass: v318.allPass, gates: v318.gates } : null,
      v31322: v322 ? { installed: v322.installed, allPass: v322.allPass } : null,
      v31322Dependencies: {
        party: !!window.__HAPIL_PARTY_V31322__?.installed,
        hell: !!window.__HAPIL_HELL_V31322__?.installed,
        ordnance: !!window.__HAPIL_ORDNANCE_V31322__?.installed,
      },
      controls: { factory: !!window.__HAPIL_HERO_CONTROL_FACTORY_V31406__?.started, installed: v329?.installed ?? null },
      theme: window.__HAPIL_THEME_V31323__?.installed ?? null,
      laser: window.__HAPIL_LASERS_V31330__?.installed ?? null,
      laserRelease: v330?.installed ?? null,
      personalizedLasers: v331?.installed ?? null,
      combat: window.__HAPIL_COMBAT_V31333__?.installed ?? null,
      storyNative: window.__HAPIL_STORY_NATIVE_RC51__?.installed ?? null,
      storyRoute: window.__HAPIL_STORY_ROUTE_RC60__?.installed ?? null,
      heroImages: window.__HAPIL_HERO_CONSISTENCY_RC5__?.installed ?? null,
    };
  };

  function inspect() {
    const state = report();
    window.__HAPIL_STARTUP_DIAGNOSTICS_RC83__ = state;
    if (window.__HAPIL_V31332_RELEASE__?.installed) return;
    if (state.elapsedMs >= 7500) {
      console.error('[HAPIL_BOOT_DIAG_RC83] ' + JSON.stringify(state));
      return;
    }
    setTimeout(inspect, 250);
  }
  setTimeout(inspect, 250);
})();
