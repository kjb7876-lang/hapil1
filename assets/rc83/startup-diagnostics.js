/* RC83: capture the first missing runtime dependency when launch initialization stalls. */
(() => {
  'use strict';
  const started = Date.now();
  const releaseState = version => {
    const value = window[`__HAPIL_V${version}_RELEASE__`];
    if (!value) return null;
    const gates = value.gates && Object.fromEntries(Object.entries(value.gates).filter(([, result]) => typeof result === 'boolean'));
    return { installed: value.installed ?? null, allPass: value.allPass ?? null, gates: gates ?? null };
  };
  const report = () => {
    const v318 = window.__HAPIL_V31318_RELEASE__;
    const v322 = window.__HAPIL_V31322_RELEASE__;
    const v329 = window.__HAPIL_V31329_RELEASE__;
    const v330 = window.__HAPIL_V31330_RELEASE__;
    const v331 = window.__HAPIL_V31331_RELEASE__;
    return {
      elapsedMs: Date.now() - started,
      releases: Object.fromEntries(Array.from({ length: 19 }, (_, index) => String(31300 + index)).map(version => [version, releaseState(version)])),
      v31303CombatFlow: window.__HAPIL_COMBAT_FLOW_V31303__ ? {
        installed: window.__HAPIL_COMBAT_FLOW_V31303__.installed,
        allPass: window.__HAPIL_COMBAT_FLOW_V31303__.allPass,
        gates: window.__HAPIL_COMBAT_FLOW_V31303__.gates,
        evidence: window.__HAPIL_COMBAT_FLOW_V31303__.evidence,
      } : null,
      v31316Dependencies: {
        danmaku: !!window.__HAPIL_DANMAKU_V31316__?.installed,
        clarity: !!window.__HAPIL_CLARITY_V31316__?.installed,
        focus: !!window.__HAPIL_FOCUS_V31316__?.installed,
        audit: !!window.__HAPIL_AUDIT_V31316__?.installed,
      },
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
