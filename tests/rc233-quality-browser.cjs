'use strict';

// Run only in the approved Chrome Stable CI environment. Both releases are
// served from immutable/local source; this runner never contacts public Pages.
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const BASELINE = '346bee26788b789168fca50f63f12a09f6869c2d';
const ROOT = path.resolve(__dirname, '..');
const PROFILE = process.env.RC233_PROFILE || 'landscape';
const VIEWPORT = PROFILE === 'pc' ? { width: 1280, height: 800 } : { width: 844, height: 390 };
const OUT = path.resolve(process.env.HAPIL_QA_OUTPUT || '/tmp/rc233-quality-' + PROFILE);
const SEED = 0x2332026;
// These criteria are declared before evidence is collected. Baseline defects
// remain in the report; they do not cause the old release to be marked passing.
const CRITERIA = Object.freeze({ fixedCameraDrift: 1e-7, onePixelCssScaleDrift: .01,
  naturalCycles: 3, majorFixtureMinimumPressureCycles: 2, majorFixturePostBloodCycles: 1,
  fixtureWallTimeoutMs: 30000, flightObservationSeconds: .35,
  bodyLongCssPx: 4, bodyShortCssPx: 1, contrastedPixelFraction: .20,
  rgbDifference: 24, unblockedPressureIdleSeconds: 1.10, comparisonIdleRatio: .85,
  sourceAlphaChangedPixels: 0, contactGeometryChangedDraws: 0 });
const FIXTURES = Object.freeze([
  { name: 'ordinary-dist02', zone: 'dist02', id: 'dist02-m1', role: 'ordinary', mode: 'STORY' },
  { name: 'ordinary-spider', zone: 'dist01', id: 'dist01-sp1', role: 'ordinary', mode: 'STORY' },
  { name: 'mid-dist01', zone: 'dist01', id: 'mb-dist01', role: 'midboss', mode: 'DREAM' },
  { name: 'mid-envy', zone: 'ep1b03', id: 'mb-ep1b03', role: 'midboss', mode: 'STORY' },
  { name: 'boss-envy', zone: 'ep1b03', id: 'b03-boss', role: 'boss', mode: 'STORY' },
  { name: 'boss-balrog', zone: 'dist06', id: 'dist06-boss', role: 'boss', mode: 'DREAM' },
]);
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const git = args => cp.execFileSync('git', args, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });

// This lexical bridge exposes existing functions and adds call-through actor /
// projectile paint receipts. It does not change their arguments/results,
// producers, clocks, contact/reducers or RAF scheduling.
const BRIDGE = Buffer.from(`\n;window.__RC233_QA__=Object.freeze({
 camera:s=>HAPIL_viewCameraRC104(s.x,s.y,s),project:G,
 projectile:(...a)=>HAPIL_drawProjectileRC13(...a),queue:MONGSE_queueImage,
 shakes:(s,o)=>({rare:MONGSE_rareScreenShakeOffset31211(s,o),priority:HAPIL_currentShakeOffsetV31302(s,o)}),
 mapPath:s=>{const z=N[s.zone],rows=Array.isArray(z.mapVariants)&&z.mapVariants.length?[z.map,...z.mapVariants].filter((v,i,a)=>v&&a.indexOf(v)===i):[z.map],i=Math.min(rows.length-1,Math.max(0,(s.spawnedWaves?.size??1)-1+Math.max(0,(s.bossPhase??1)-1))),p=window.__HAPIL_LUCIFER_V31318__?.mapFor(s,rows[i]??z.map)??rows[i]??z.map;return window.__HAPIL_INNER_FINAL_RC133__?.map(s,p)??p;}
});
const RC233_actorDraw=Yn;Yn=function(ctx,cache,a,...rest){const old=window.__RC233_DRAW_ACTOR__;window.__RC233_DRAW_ACTOR__=a;try{return RC233_actorDraw.call(this,ctx,cache,a,...rest);}finally{window.__RC233_DRAW_ACTOR__=old;}};
const RC233_projectileDraw=HAPIL_drawProjectileRC13;HAPIL_drawProjectileRC13=function(ctx,cache,q,...rest){const old=window.__RC233_DRAW_SHOT__;window.__RC233_DRAW_SHOT__=q;try{return RC233_projectileDraw.call(this,ctx,cache,q,...rest);}finally{window.__RC233_DRAW_SHOT__=old;}};
\n`);

function installObservation(seed) {
  let randomState = seed >>> 0;
  window.__RC233_SEED__ = value => { randomState = value >>> 0; };
  Math.random = () => { randomState ^= randomState << 13; randomState ^= randomState >>> 17; randomState ^= randomState << 5; return (randomState >>> 0) / 4294967296; };
  const original = CanvasRenderingContext2D.prototype.drawImage;
  const receipts = window.__RC233_PAINT__ = { maps: [], selfCopies: [], actors: [], projectiles: [] };
  const append = (rows, row, limit) => { if (rows.length >= limit) rows.splice(0, Math.floor(limit / 2)); rows.push(row); };
  CanvasRenderingContext2D.prototype.drawImage = function (image, ...args) {
    const live = document.querySelector('.game-stage > canvas'), C = window.__HAPIL_CONTROLS_V31329__, s = C?.binding?.state?.current;
    if (this.canvas === live && s && window.__RC233_OBSERVING__) {
      const matrix = this.getTransform(), box = live.getBoundingClientRect();
      const row = { time: s.time, matrix: ['a', 'b', 'c', 'd', 'e', 'f'].map(k => matrix[k]),
        args, box: { width: box.width, height: box.height }, backing: [live.width, live.height] };
      if (image === live) append(receipts.selfCopies, row, 256);
      const source = image?.currentSrc || image?.src || '', map = window.__RC233_QA__?.mapPath(s);
      if (map && source.split(/[?#]/)[0].endsWith(map.split(/[?#]/)[0].replace(/^\.\//, '/')) && receipts.maps.at(-1)?.time !== s.time) append(receipts.maps, row, 256);
      const actor = window.__RC233_DRAW_ACTOR__, shot = window.__RC233_DRAW_SHOT__;
      if ((actor || shot) && this.globalAlpha > 0 && (args.length === 4 || args.length === 8)) {
        const bounds = window.__HAPIL_RENDER_RC13__?.imageBounds(image), iw = image?.naturalWidth || image?.width, ih = image?.naturalHeight || image?.height;
        if (bounds && iw > 0 && ih > 0) {
          const [sx, sy, sw, sh] = args.length === 8 ? args.slice(0, 4) : [0, 0, iw, ih], [dx, dy, dw, dh] = args.slice(-4);
          const x0 = Math.max(sx, bounds.x), y0 = Math.max(sy, bounds.y), x1 = Math.min(sx + sw, bounds.x + bounds.w), y1 = Math.min(sy + sh, bounds.y + bounds.h);
          const points = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => { const u = dx + (x - sx) / sw * dw, v = dy + (y - sy) / sh * dh; return { x: matrix.a * u + matrix.c * v + matrix.e, y: matrix.b * u + matrix.d * v + matrix.f }; });
          const left = Math.max(0, Math.min(...points.map(p => p.x))), top = Math.max(0, Math.min(...points.map(p => p.y))), right = Math.min(live.width, Math.max(...points.map(p => p.x))), bottom = Math.min(live.height, Math.max(...points.map(p => p.y)));
          if (x1 > x0 && y1 > y0 && right > left && bottom > top) {
            const body = { ...row, alpha: this.globalAlpha, source: (image.rc232SourceImage ?? image).currentSrc || (image.rc232SourceImage ?? image).src || '', bbox: { left, top, width: right - left, height: bottom - top } };
            if (actor) append(receipts.actors, { ...body, owner: actor.id }, 1024);
            if (shot) append(receipts.projectiles, { ...body, id: shot.id, owner: shot.sourceId, bodySpawned: shot.bodySpawned31219 !== false,
              release: Math.max(...['born', 'frozenUntil', 'telegraphUntil31210', 'motionReleaseAt31219', 'collisionDisabledUntil31219', 'collisionDisabledUntilV31226'].map(key => Number.isFinite(shot[key]) ? shot[key] : 0)) }, 4096);
          }
        }
      }
    }
    return original.call(this, image, ...args);
  };
}

function installQualityProbe() {
  const Q = window.__RC233_QA__, C = window.__HAPIL_CONTROLS_V31329__, P = window.__HAPIL_PARTY_V31322__;
  const number = (v, fallback = 0) => Number.isFinite(v) ? v : fallback;
  const release = q => Math.max(...['born', 'frozenUntil', 'telegraphUntil31210', 'motionReleaseAt31219', 'collisionDisabledUntil31219', 'collisionDisabledUntilV31226'].map(k => number(q[k])));
  const removed = q => q.cancelled || q.projectileRemovalReason31215 || q.reachedHero31213 || q.reachedMapBoundary31213 || q.friendly || q.reflected;
  const packetCopy = q => JSON.parse(JSON.stringify(q));
  const clocks = a => Object.fromEntries(['attackAt', 'recoverUntil', 'readyAt', 'patternReadyAt', 'atomicCastUntil31210', 'themedOrdnanceAt', 'laserReadyAtRC94'].map(k => [k, number(a[k])]));
  const pause = () => { const ref = C.binding.modal, previous = ref.current; ref.current = 'rc233-quality-measure'; return () => { if (ref.current !== 'rc233-quality-measure') throw Error('quality fixture lost native pause ownership'); ref.current = previous; }; };
  const canvas = () => {
    const live = document.querySelector('.game-stage > canvas'), box = live.getBoundingClientRect(), target = document.createElement('canvas');
    target.width = live.width; target.height = live.height;
    target.style.cssText = `position:fixed;left:-20000px;top:0;width:${box.width}px;height:${box.height}px;pointer-events:none`;
    document.body.append(target); return { target, box };
  };
  const transform = (ctx, target, s) => {
    const live = document.querySelector('.game-stage > canvas'), box = live.getBoundingClientRect(), V = window.__HAPIL_ADAPTIVE_RC125__.view(box.width, box.height), camera = Q.camera(s);
    const a = target.width / 1280, rx = 1280 / V.width, ry = 720 / V.height;
    ctx.setTransform(a, 0, 0, a, 0, 0); ctx.transform(rx, 0, 0, ry, -V.x * rx, -V.y * ry);
    ctx.translate(camera.x, camera.y); ctx.scale(camera.scale, camera.scale);
    return { camera, view: V, cssScale: camera.scale * V.k };
  };
  function imageAlpha(image) {
    const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
    const c = document.createElement('canvas'); c.width = width; c.height = height;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, width, height).data;
  }
  function raster(s, q, at, settings, contactProbe = false, images = true) {
    const { target, box } = canvas(), ctx = target.getContext('2d', { willReadFrequently: true }), receipts = [];
    const projection = transform(ctx, target, s), draw = ctx.drawImage;
    ctx.__rc204ContactProbe = contactProbe;
    ctx.drawImage = function (image, ...args) {
      const source = image.rc232SourceImage ?? image, raw = imageAlpha(source), actual = image === source ? raw : imageAlpha(image);
      let changedAlpha = 0; for (let i = 3; i < raw.length; i += 4) if (raw[i] !== actual[i]) changedAlpha++;
      const m = ctx.getTransform(); receipts.push({ path: (source.currentSrc || source.src || '').replace(/\/(?:before|after)\//, '/'),
        args, matrix: ['a', 'b', 'c', 'd', 'e', 'f'].map(k => m[k]), alpha: ctx.globalAlpha,
        originalSize: [source.naturalWidth || source.width, source.naturalHeight || source.height],
        renderedSize: [image.naturalWidth || image.width, image.naturalHeight || image.height], renderedKind: image !== source ? 'prepared-source-alpha-preserving-canvas' : 'native-source-image', changedAlpha, styled: image !== source });
      return draw.call(this, image, ...args);
    };
    Q.projectile(ctx, C.binding.cache.current, packetCopy(q), at, settings);
    ctx.drawImage = draw;
    const rgba = ctx.getImageData(0, 0, target.width, target.height).data;
    const floor = document.createElement('canvas'); floor.width = target.width; floor.height = target.height;
    const fctx = floor.getContext('2d', { willReadFrequently: true }); transform(fctx, floor, s);
    const image = Q.queue(C.binding.cache.current, Q.mapPath(s), 'eager');
    if (!window.__HAPIL_MAP_FORMAT_RC138__.draw(fctx, s, image)) throw Error('native floor is not decoded for quality raster');
    const background = fctx.getImageData(0, 0, floor.width, floor.height).data;
    fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.drawImage(target, 0, 0);
    const composite = fctx.getImageData(0, 0, floor.width, floor.height).data;
    let left = target.width, right = -1, top = target.height, bottom = -1, pixels = 0, contrasted = 0, alphaSum = 0, rgbSum = 0, lumaSum = 0;
    for (let i = 0; i < rgba.length; i += 4) if (rgba[i + 3] >= 8) {
      const p = i / 4, x = p % target.width, y = Math.floor(p / target.width);
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); pixels++; alphaSum += rgba[i + 3] / 255;
      const difference = Math.max(...[0, 1, 2].map(c => Math.abs(composite[i + c] - background[i + c])));
      const luma = a => .2126 * a[i] + .7152 * a[i + 1] + .0722 * a[i + 2];
      rgbSum += difference; lumaSum += Math.abs(luma(composite) - luma(background)); if (difference >= 24) contrasted++;
    }
    const bbox = pixels ? { left, top, width: right - left + 1, height: bottom - top + 1 } : null;
    const cssWidth = bbox ? bbox.width * box.width / target.width : 0, cssHeight = bbox ? bbox.height * box.height / target.height : 0;
    const output = { at, packet: { id: q.id, sourceId: q.sourceId, sprite: q.sprite, born: q.born, release: release(q), x: q.x, y: q.y, damage: q.damage,
      expiresAt: q.expiresAt ?? null, bodySpawned: q.bodySpawned31219 ?? null }, projection, receipts, bbox,
      bodyLongCssPx: Math.max(cssWidth, cssHeight), bodyShortCssPx: Math.min(cssWidth, cssHeight), pixels,
      meanAlpha: pixels ? alphaSum / pixels : 0, meanRgbDifference: pixels ? rgbSum / pixels : 0,
      meanLumaDifference: pixels ? lumaSum / pixels : 0, contrastedPixelFraction: pixels ? contrasted / pixels : 0,
      layer: images ? target.toDataURL('image/png') : null, composite: images ? floor.toDataURL('image/png') : null };
    target.remove(); return output;
  }
  async function stage(fixture) {
    window.__RC233_SEED__(0x2332026);
    const N = window.__HAPIL_RC133_NATIVE__, B = window.__HAPIL_RC86_BRIDGE__, s = P.state ?? C.binding.state.current;
    C.binding.modal.current = 'rc233-quality-preload';
    C.clear(); window.__HAPIL_STORY_RC51__.close(false); window.__HAPIL_PERSONA_DUEL_RC134__.release(s); window.__HAPIL_BATTLE_ARENA_RC138__.release(s);
    // RC138's private watcher belongs to this actual world object. Keep its
    // installed hp/roster accessors, and reset data through their native setters.
    const descriptors = Object.getOwnPropertyDescriptors(s), managed = Object.fromEntries(Object.entries(descriptors).filter(([, d]) => d.get || d.set));
    for (const [key, descriptor] of Object.entries(descriptors)) if (Object.hasOwn(descriptor, 'value') && descriptor.configurable) delete s[key];
    const fresh = { ...N.makeState(), zone: fixture.zone, frontierZone: fixture.zone, time: 100, activeHeroId: 'hunter',
      gameModeV31346: fixture.mode, samongUnlockedRC91: fixture.mode === 'DREAM', hp: 240, maxHp: 240 };
    for (const [key, value] of Object.entries(fresh)) if (!managed[key]) s[key] = value;
    for (const [key, value] of Object.entries(fresh)) if (managed[key]?.set) s[key] = value;
    C.binding.state.current = s; C.binding.hero.current = 'hunter';
    // Hunter is an existing accepted episode-one narrative companion choice.
    // Choosing that host naturally satisfies the companion rule; no AI producer
    // is disabled and no enemy health is pumped to survive an unwanted helper.
    window.__HAPIL_RUN_V31400__.init(s, 'hunter', { aiEnabled: false, aiHeroes: [], humanPlayers: 1, humanHeroes: [], origin: 'quality-fixture' });
    P.configure(window.__HAPIL_RUN_V31400__.configFor(s, 'hunter'));
    window.__HAPIL_STORY_RC51__.suppressEntry(s); N.enter(s, fixture.zone);
    window.__HAPIL_STORY_RC51__.close(false);
    window.__HAPIL_STORY_RC51__.beforeFrame(s, { blocked: false, clear: false, sound: false });
    window.__HAPIL_STORY_RC51__.close(false); C.binding.actions.dismiss(); C.binding.modal.current = 'rc233-quality-preload';
    const ids = fixture.ids ?? [fixture.id], actors = ids.map(id => { const source = B.actor(fixture.zone, id); if (!source) throw Error('missing actual native actor ' + id); return B.cloneEnemy(source, fixture.zone); });
    s.enemies = actors; s.spawnedWaves = new Set([1, 2, 3, 4]); s.bossDefeated = false;
    for (const key of ['hostileProjectiles', 'pendingHits', 'impactQueue', 'pendingStrikes', 'pendingSpawns', 'effects']) s[key] = [];
    for (const a of actors) for (const key of ['attackAt', 'attackImpactAt', 'readyAt', 'patternReadyAt', 'recoverUntil', 'atomicCastUntil31210', 'staggerUntil', 'phaseTransitionUntil', 'combatEntryGraceUntilV31239', 'invulnerableUntil']) a[key] = 0;
    if (fixture.blockFirst) actors[0].atomicCastUntil31210 = s.time + 2;
    Object.assign(s, { paused: false, pause: false, encounterDialogue31226: null, encounterLockUntil31226: 0, timeStopUntil: 0, invulnerableUntil: s.time + 120 });
    C.setMode('manual'); P.capture(s, { damage: C.binding.actions.damage, heroRef: C.binding.hero, cache: C.binding.cache.current }, false);
    const assets = [...B.zoneAssetManifest(fixture.zone, 'hunter'), Q.mapPath(s), ...(window.__HAPIL_BALROG_BODY_RC210__?.assets ?? [])];
    await Promise.all([...new Set(assets)].map(async file => { const im = Q.queue(C.binding.cache.current, file, 'eager'); if (im?.decode) await im.decode(); }));
    window.__HAPIL_COMBAT_FLOW_RC95__.reset(s); window.__HAPIL_COMBAT_LIFECYCLE_RC231__.reset(s);
    if (fixture.nearTransition) {
      const bossKey = actors.filter(a => a.boss).map(a => String(a.id)).sort().join('|');
      window.__HAPIL_DANMAKU_RC129__.restore(s, { version: 1, zone: s.zone, mode: fixture.mode,
        phase: { bossKey, serial: 0, index: 0, elapsed: fixture.mode === 'DREAM' ? 8.8 : 10.8, band: 1, stage: 'active', rest: 0, lastCard: '' },
        graze: { combo: 0, last: -1e9, guard: 0, budget: 0, budgetAge: 0, seen: [], rewarded: 0 } });
    }
    const accessorEvidence = Object.fromEntries(['hp', 'enemies'].map(key => { const d = Object.getOwnPropertyDescriptor(s, key), before = managed[key];
      return [key, { get: typeof d?.get === 'function', set: typeof d?.set === 'function', priorIdentityRetained: !before || d.get === before.get && d.set === before.set }]; }));
    if (!Object.values(accessorEvidence).every(row => row.get && row.set && row.priorIdentityRetained)) throw Error('native world watcher descriptors were not retained ' + JSON.stringify(accessorEvidence));
    window.__HAPIL_BATTLE_ARENA_RC138__.enforce(s);
    const actorGuards = actors.map(a => ({ id: a.id, x: typeof Object.getOwnPropertyDescriptor(a, 'x')?.get === 'function', y: typeof Object.getOwnPropertyDescriptor(a, 'y')?.get === 'function' }));
    if (!actorGuards.every(row => row.x && row.y)) throw Error('native roster setter did not enroll actor coordinate guards ' + JSON.stringify(actorGuards));
    window.__RC233_OBSERVING__ = true; for (const key of Object.keys(window.__RC233_PAINT__)) window.__RC233_PAINT__[key] = [];
    C.binding.modal.current = null;
    return { time: s.time, zone: s.zone, hero: s.activeHeroId, partyRoster: P.roster, otherPartyActors: P.actors.length,
      sameNativeWorld: s === P.state && s === C.binding.state.current, accessorEvidence, actorGuards,
      actors: actors.map(a => ({ id: a.id, hp: a.hp, maxHp: a.maxHp, clocks: clocks(a) })),
      assistance: 'Original full-HP native templates, canonical Hunter host satisfies the episode-one narrative companion rule, one solo manual slot with no AI actors, one-time initial ready timers, fixed PRNG seed, native player invulnerability and suppressed entry narration. Real RAF owns all later attacks; no cast/timer resets or actor HP overrides.' };
  }
  function observe(fixture, criteria) {
    return new Promise((resolve, reject) => {
      const s = C.binding.state.current, L = window.__HAPIL_COMBAT_LIFECYCLE_RC231__, ids = fixture.ids ?? [fixture.id], start = s.time;
      const cycles = [], samples = [], majorPackets = new Map(), packetIds = new Set(), ordinaryPackets = new WeakSet(), cyclePackets = new Map(), lastCycles = new Map(), snapshots = {}, endWall = performance.now() + criteria.fixtureWallTimeoutMs;
      let tracked = null, trackedRelease = null, actualScene = null, lastTime = s.time, idle = 0, maxIdle = 0, bodyGap = 0, maxBodyGap = 0, maxQueue = 0;
      const complete = timedOut => {
        pause(); window.__RC233_SNAPSHOTS__ = snapshots;
        const actors = ids.map(id => s.enemies.find(a => a.id === id));
        resolve({ start, end: s.time, timedOut, cycles, samples, majorPackets: [...majorPackets.values()], maxIdle, maxBodyGap, maxQueue, cap: samples[0]?.cap,
          observedPacketCount: packetIds.size, snapshotStages: Object.keys(snapshots), nativePaint: window.__RC233_PAINT__, actualScene,
          actorHp: actors.map(a => ({ id: a.id, hp: a.hp, maxHp: a.maxHp })),
          readability: window.__HAPIL_PROJECTILE_READABILITY_RC232__?.metrics() ?? null, pausedForRaster: true,
          activeCountMeaning: 'Released native packet centers projected into the actual native viewport; this timeline estimate is distinct from the measured alpha-pixel visibility of the sampled packet rasters.' });
      };
      function frame() {
        try {
          if (s !== C.binding.state.current || s !== P.state || s.zone !== fixture.zone) throw Error('native fixture identity/zone changed');
          if (s.activeHeroId !== 'hunter' || P.actors.length !== 0 || P.roster.length !== 1 || P.roster[0].heroId !== 'hunter') throw Error('native manual fixture acquired an unintended party attacker ' + JSON.stringify({ hero: s.activeHeroId, roster: P.roster, actors: P.actors.map(a => ({ id: a.id, heroId: a.heroId, control: a.control })) }));
          const actors = ids.map(id => s.enemies.find(a => a.id === id)); if (actors.some(a => !a || a.hp <= 0)) throw Error('full-HP manual actor disappeared');
          const dt = Math.max(0, s.time - lastTime); lastTime = s.time;
          const queues = s.hostileProjectiles ?? [], owned = queues.filter(q => ids.includes(q.sourceId) && !removed(q));
          maxQueue = Math.max(maxQueue, queues.length);
          const major = actors.some(a => Math.max(...['attackAt', 'attackImpactAt', 'atomicCastUntil31210', 'activePatternUntil', 'telekineticUntil', 'spatialRiftUntil', 'laserCastUntilV31332', 'finaleCastUntilV31334'].map(k => number(a[k]))) > s.time) ||
            (L.queues ?? []).some(key => key !== 'hostileProjectiles' && (s[key] ?? []).some(q => ids.includes(L.owner(s, q)?.id) && Math.max(number(q.at), number(q.impactAt), number(q.endAt), number(q.end), number(q.fireAt) + number(q.activeSeconds)) > s.time));
          for (const key of L.queues ?? []) if (key !== 'hostileProjectiles') for (const q of s[key] ?? []) if (ids.includes(L.owner(s, q)?.id)) {
            const id = key + ':' + q.id;
            if (!majorPackets.has(id)) majorPackets.set(id, { key, id: q.id, sourceId: L.owner(s, q).id, label: q.label ?? null,
              blood: !!q.bloodV31516, laser: !!q.laserV31330, born: number(q.born, s.time), fireAt: q.fireAt ?? null,
              endAt: Math.max(number(q.endAt), number(q.end), number(q.at), number(q.impactAt), number(q.fireAt) + number(q.activeSeconds)),
              damage: q.damage ?? null, sprite: q.sprite ?? null });
          }
          for (const a of actors) {
            const ordinary = fixture.role === 'ordinary', counter = ordinary ? number(a.attackStarted, -1) : number(a.rc95BulletCycle), previous = lastCycles.get(a.id);
            if ((ordinary ? counter >= start : counter > 0) && counter !== previous) {
              lastCycles.set(a.id, counter);
              let seen = cyclePackets.get(a.id); if (!seen) { seen = new WeakSet(); cyclePackets.set(a.id, seen); }
              const volley = owned.filter(q => q.sourceId === a.id && q.rc95Bullet && !seen.has(q));
              for (const q of volley) seen.add(q);
              const row = L.inspect(s, a, 'pressure') ?? L.inspect(s, a);
              cycles.push({ owner: a.id, cycle: counter, announcedAt: ordinary ? counter : row?.announcedAt ?? s.time, observedAt: s.time,
                releaseAt: volley.length ? Math.max(...volley.map(release)) : row?.releaseAt ?? number(a.attackAt),
                firstReleaseAt: volley.length ? Math.min(...volley.map(release)) : null, salvos: [...new Set(volley.map(q => q.rc126Salvo ?? null))],
                until: row?.until ?? null, packets: volley.length, deliveredPacketIds: [], clocks: clocks(a), phase: window.__HAPIL_COMBAT_FLOW_RC95__.phase(s) });
            }
          }
          if (fixture.role === 'ordinary') for (const q of owned) if (!ordinaryPackets.has(q) && [q.x, q.y, q.vx, q.vy].every(Number.isFinite) && Math.hypot(q.vx, q.vy) > .001 && q.damage > 0) {
            const cycle = cycles.filter(row => row.owner === q.sourceId && row.announcedAt <= s.time).at(-1);
            if (cycle) { ordinaryPackets.add(q); cycle.deliveredPacketIds.push(q.id); cycle.packets++; cycle.firstNativeEmissionAt ??= s.time;
              cycle.releaseAt = Math.max(cycle.releaseAt, release(q)); cycle.firstReleaseAt = cycle.firstReleaseAt === null ? release(q) : Math.min(cycle.firstReleaseAt, release(q)); }
          }
          const visible = owned.filter(q => release(q) <= s.time && q.bodySpawned31219 !== false), warning = owned.filter(q => release(q) > s.time);
          const camera = window.__HAPIL_CAMERA_RC223__.diagnostics().last?.adjusted ?? Q.camera(s), view = camera.rc153View ?? window.__HAPIL_VIEWPORT_RC104__.view();
          const inView = q => { const p = Q.project(q.x, q.y), x = camera.x + p.x * camera.scale, y = camera.y + (p.y - 18) * camera.scale; return x >= view.x && x <= view.x + view.width && y >= view.y && y <= view.y + view.height; };
          const centeredInView = visible.filter(inView), warnedInView = warning.filter(inView);
          if (cycles.length && !centeredInView.length && !warnedInView.length && !major) idle += dt; else idle = 0;
          if (cycles.length && !centeredInView.length && !major) bodyGap += dt; else bodyGap = 0;
          maxIdle = Math.max(maxIdle, idle);
          maxBodyGap = Math.max(maxBodyGap, bodyGap);
          if (fixture.captureScene && !actualScene && cycles.length >= 2) {
            const paint = window.__RC233_PAINT__, sameFrame = row => Math.abs(row.time - s.time) <= 1e-7;
            const actorsPainted = paint.actors.filter(row => sameFrame(row) && ids.includes(row.owner));
            const releasedPainted = paint.projectiles.filter(row => sameFrame(row) && ids.includes(row.owner) && row.bodySpawned && row.release <= s.time);
            const releasedIds = [...new Set(releasedPainted.map(row => row.id))], minimum = fixture.role === 'ordinary' ? 1 : 4;
            if (actorsPainted.length && releasedIds.length >= minimum) {
              const live = document.querySelector('.game-stage > canvas'), box = live.getBoundingClientRect();
              actualScene = { time: s.time, nativeMapPaint: paint.maps.at(-1), actorsPainted, projectilePaints: releasedPainted,
                releasedIds, minimumReleasedBodies: minimum, active: visible.length, warnings: warning.length, cyclesObserved: cycles.length,
                canvasCss: { width: box.width, height: box.height }, nativeBacking: [live.width, live.height], settings: { ...C.binding.settings.current },
                png: live.toDataURL('image/png'), imageType: 'actual-live-native-game-canvas',
                support: 'Once during existing native RAF cycles, after the second native admission. Original game canvas with actual actor/source-alpha image paints and released projectile paints observed in that same frame. No extra waiting, cloned packets, timer resets or staged render calls are used to obtain this scene.' };
            }
          }
          for (const q of owned) packetIds.add(q.id);
          const candidate = owned.find(q => [q.x, q.y, q.vx, q.vy].every(Number.isFinite) && Math.hypot(q.vx, q.vy) > .001 && q.damage > 0 && !q.laserV31330 && !q.persistentHazard && !q.themeBombV31323 && !q.rc133InnerShot);
          if (!tracked && candidate) tracked = candidate;
          if (tracked && owned.includes(tracked)) {
            const r = release(tracked);
            if (!snapshots.warning && s.time < r) snapshots.warning = { q: packetCopy(tracked), at: s.time };
            if (!snapshots.release && s.time >= r && tracked.bodySpawned31219 !== false) { snapshots.release = { q: packetCopy(tracked), at: s.time }; trackedRelease = s.time; }
            if (!snapshots.flight && trackedRelease !== null && s.time >= trackedRelease + criteria.flightObservationSeconds && tracked.bodySpawned31219 !== false) snapshots.flight = { q: packetCopy(tracked), at: s.time };
          }
          samples.push({ time: s.time, owned: owned.length, active: visible.length, activeCentersInViewport: centeredInView.length, warning: warning.length, warningCentersInViewport: warnedInView.length, major, cap: window.__HAPIL_BULLET_BALANCE_RC210__.admissionCap(),
            owners: actors.map(a => ({ id: a.id, pressure: L.inspect(s, a, 'pressure'), signature: L.inspect(s, a, 'signature') })) });
          const targetCycles = fixture.requireMajor ? criteria.majorFixtureMinimumPressureCycles : criteria.naturalCycles;
          const lastRelease = Math.max(0, ...cycles.slice(-targetCycles).map(row => row.releaseAt));
          const blood = [...majorPackets.values()].filter(q => q.blood), bloodEnd = Math.max(0, ...blood.map(q => q.endAt));
          const majorCompleted = !fixture.requireMajor || blood.length > 0 && cycles.filter(row => row.announcedAt > bloodEnd).length >= criteria.majorFixturePostBloodCycles;
          const deliveredCycles = fixture.role === 'ordinary' ? cycles.filter(row => row.deliveredPacketIds.length > 0).length : cycles.filter(row => row.packets > 0).length;
          if (deliveredCycles >= targetCycles && majorCompleted && s.time > lastRelease + criteria.flightObservationSeconds && (snapshots.flight || fixture.ids)) {
            return complete(false);
          }
          if (performance.now() > endWall) {
            if (fixture.controlBaseline) return complete(true);
            throw Error('bounded native three-cycle observation timed out ' + JSON.stringify({ fixture, time: s.time, cycles, stages: Object.keys(snapshots), timers: actors.map(clocks) }));
          }
          requestAnimationFrame(frame);
        } catch (error) { reject(error); }
      }
      requestAnimationFrame(frame);
    });
  }
  async function rasters() {
    const s = C.binding.state.current, settings = { ...C.binding.settings.current, lowFx: true, reducedFlash: true, skillFxOpacity: .35 }, rows = {};
    const R = window.__HAPIL_PROJECTILE_READABILITY_RC232__, warmStarted = performance.now();
    // Warm the actual native draw variants, then allow the production idle
    // preparation callback to finish. A cold original-body fallback is visible
    // immediately; it must not be mistaken for the styled-cache evidence.
    for (const snapshot of Object.values(window.__RC233_SNAPSHOTS__ ?? {})) raster(s, snapshot.q, snapshot.at, settings, false, false);
    if (R) await new Promise((resolve, reject) => {
      const poll = () => { if (R.metrics().pendingStyles === 0) return resolve(); if (performance.now() - warmStarted > 3000) return reject(Error('native readability idle preparation exceeded its bounded warmup')); setTimeout(poll, 25); };
      poll();
    });
    for (const [stage, snapshot] of Object.entries(window.__RC233_SNAPSHOTS__ ?? {})) {
      const styled = raster(s, snapshot.q, snapshot.at, settings), contact = raster(s, snapshot.q, snapshot.at, settings, true);
      const geometry = rows => rows.map(({ args, matrix, path, originalSize }) => ({ args, matrix, path, originalSize }));
      styled.contactGeometryExact = JSON.stringify(geometry(styled.receipts)) === JSON.stringify(geometry(contact.receipts));
      styled.nativeOpacityUnchanged = JSON.stringify(styled.receipts.map(row => row.alpha)) === JSON.stringify(contact.receipts.map(row => row.alpha));
      styled.defaultOpacity = raster(s, snapshot.q, snapshot.at, { ...settings, skillFxOpacity: 1 }, false, false);
      styled.contactPixels = contact.pixels; rows[stage] = styled;
    }
    const beforeWarm = R?.metrics() ?? null;
    for (const snapshot of Object.values(window.__RC233_SNAPSHOTS__ ?? {})) raster(s, snapshot.q, snapshot.at, settings, false, false);
    const afterWarm = R?.metrics() ?? null, snapshot = window.__RC233_SNAPSHOTS__?.flight;
    const removed = snapshot ? raster(s, { ...snapshot.q, projectileRemovalReason31215: 'rc233-terminal-paint-fixture' }, snapshot.at, settings, false, false) : null;
    const zeroOpacity = snapshot ? raster(s, snapshot.q, snapshot.at, { ...settings, skillFxOpacity: 0 }, false, false) : null;
    return { rows, settings, floor: Q.mapPath(s), warmCache: beforeWarm && { elapsedMs: performance.now() - warmStarted, before: beforeWarm, after: afterWarm,
      newCacheMisses: afterWarm.cacheMisses - beforeWarm.cacheMisses, newProcessedPixels: afterWarm.processedPixels - beforeWarm.processedPixels },
      protection: { removed: removed && { pixels: removed.pixels, drawCalls: removed.receipts.length }, zeroOpacity: zeroOpacity && { pixels: zeroOpacity.pixels, drawCalls: zeroOpacity.receipts.length } },
      source: 'Actual emitted packet snapshots and native RC13 projectile painter over the actual native map-format floor; actual live viewport/camera transform; low-FX/reduced-flash .35 configured opacity. This is an isolated paint audit, not a replay of collision or damage. Terminal flag and zero-opacity probes only clone the observed packet; live queues are untouched.' };
  }
  function cameraPose() {
    const s = C.binding.state.current, a = s.enemies[0], R = window.__HAPIL_BATTLE_ARENA_RC138__, live = document.querySelector('.game-stage > canvas'), B = window.__HAPIL_RC86_BRIDGE__;
    C.binding.modal.current = 'rc233-camera-pose';
    window.__HAPIL_COMBAT_LAYOUT_RC153__.resetCamera(s);
    const settings = { ...C.binding.settings.current, lowFx: false, reducedFlash: false, screenShakeV31336: true, shake: true, screenShake: true };
    Object.assign(s, { screenShakeActiveUntil31211: s.time + 10, screenShakeAmplitude31211: 6 });
    const rows = [];
    for (const [i, point] of [{ x: 10, y: 25 }, { x: 13.8, y: 24.2 }, { x: 16, y: 21 }, { x: 10, y: 25 }].entries()) {
      R.applyPosition(s, point); a.attackAt = i % 2 ? s.time + 1 : 0; a.recoverUntil = a.attackAt;
      // Different authored pose clocks are a bounded paint fixture; native
      // combat stays paused and no attacks or damage are manufactured here.
      s.time += .001;
      const camera = Q.camera(s), pointOnMap = Q.project(s.x, s.y), box = live.getBoundingClientRect();
      B.renderFrame(live, s, C.binding.cache.current, s.activeHeroId, settings);
      rows.push({ world: { x: s.x, y: s.y }, pointOnMap, camera, shakes: Q.shakes(s, settings),
        diagnostics: window.__HAPIL_CAMERA_RC223__.diagnostics().last, nativeMapPaint: window.__RC233_PAINT__.maps.at(-1),
        actualMapRect: window.__HAPIL_MAP_FORMAT_RC138__.metrics().last?.rect ?? null,
        canvas: { width: box.width, height: box.height }, view: window.__HAPIL_VIEWPORT_RC104__.view() });
    }
    return { rows, support: 'Decoded full-HP Balrog and original body/weapon pose envelope; native coordinate guards, direct native renderFrame pose paints, active native shake state with shake settings enabled. Paused pose clocks are disclosed; this is separate from the natural RAF attack observations.' };
  }
  function cameraSample(replace = null) {
    const s = C.binding.state.current;
    if (replace) {
      const B = window.__HAPIL_RC86_BRIDGE__;
      s.enemies = [B.cloneEnemy(replace === 'large' ? B.actor('dist06', 'dist06-boss') : B.actor('dist02', 'dist02-m1'), s.zone)];
      window.__HAPIL_BATTLE_ARENA_RC138__.enforce(s);
    }
    const camera = Q.camera(s), box = document.querySelector('.game-stage > canvas').getBoundingClientRect(), V = window.__HAPIL_VIEWPORT_RC104__.view();
    return { camera, view: V, canvas: { width: box.width, height: box.height }, viewport: { width: innerWidth, height: innerHeight,
      visualWidth: visualViewport?.width ?? null, visualHeight: visualViewport?.height ?? null }, cssScale: camera.scale * (camera.rc153View?.k ?? V.k),
      mapCoverage: Number.isFinite(camera.rc153MapWidth) ? camera.rc153MapWidth * camera.scale / (camera.rc153View?.width ?? V.width) : null,
      diagnostics: window.__HAPIL_CAMERA_RC223__.diagnostics().last };
  }
  function cosmeticShake() {
    const s = C.binding.state.current, target = s.enemies[0], F = window.__HAPIL_FEEDBACK_RC128__, live = document.querySelector('.game-stage > canvas'), ctx = live.getContext('2d');
    const settings = { hitPause: false, shake: true, screenShake: true, lowFx: false, reducedFlash: false }, beforeHp = [s.hp, target.hp];
    F.draw(ctx, s, live, settings); const original = ctx.drawImage; let selfCopies = 0;
    ctx.drawImage = function (image, ...args) { if (image === live) selfCopies++; return original.call(this, image, ...args); };
    const accepted = F.record(s, target, { epoch: 233, sequence: 233, kind: 'OUTGOING', result: 'HIT', attackerHeroId: s.activeHeroId,
      targetId: target.id, appliedDamage: 10, hpBefore: 400, hpAfter: 390, source: { family: 'projectile', vx: -1, vy: 0 } }, { ultimate: true });
    try { F.draw(ctx, s, live, settings); } finally { ctx.drawImage = original; }
    return { accepted, selfCopies, beforeHp, afterHp: [s.hp, target.hp], feedback: F.snapshot(s),
      support: 'Controlled cosmetic ledger row through actual RC128.record/draw with shake settings enabled. HP is unchanged; this is not a claimed combat-ledger damage event or natural contact.' };
  }
  window.__RC233_QUALITY__ = { stage, observe, rasters, pause, clocks, cameraPose, cameraSample, cosmeticShake };
}

function pressureSummary(trace) {
  const rows = trace.cycles, gaps = rows.slice(1).map((row, i) => ({ previousOwner: rows[i].owner, owner: row.owner,
    releaseToNextAnnouncement: Math.max(0, row.announcedAt - rows[i].releaseAt) }));
  return { cycles: rows.length, owners: [...new Set(rows.map(r => r.owner))], maxIdleWithoutMajor: trace.maxIdle,
    maxBodyCenterGapWithoutMajor: trace.maxBodyGap, deliveredCycles: rows.filter(row => row.packets > 0).length,
    warningDurations: rows.map(row => Math.max(0, row.releaseAt - row.announcedAt)),
    maxReleaseToNextAnnouncement: Math.max(0, ...gaps.map(row => row.releaseToNextAnnouncement)), maxQueue: trace.maxQueue, cap: trace.cap, gaps };
}

async function cameraEvidence(page, release) {
  const setup = await page.evaluate(fixture => window.__RC233_QUALITY__.stage(fixture), FIXTURES.at(-1));
  const pose = await page.evaluate(() => window.__RC233_QUALITY__.cameraPose());
  const first = pose.rows[0].camera;
  pose.maxCameraDrift = Math.max(...pose.rows.flatMap(row => ['x', 'y', 'scale'].map(key => Math.abs(row.camera[key] - first[key]))));
  const resizePairs = [];
  for (const height of [390, 256]) {
    await page.setViewportSize({ width: 844, height }); await page.waitForTimeout(120);
    const large = await page.evaluate(() => window.__RC233_QUALITY__.cameraSample('large'));
    const smallBeforeResize = await page.evaluate(() => window.__RC233_QUALITY__.cameraSample('small'));
    await page.setViewportSize({ width: 844, height: height - 1 }); await page.waitForTimeout(120);
    const smallAfterResize = await page.evaluate(() => window.__RC233_QUALITY__.cameraSample());
    resizePairs.push({ height, large, smallBeforeResize, smallAfterResize,
      cssScaleDrift: Math.abs(smallAfterResize.cssScale / smallBeforeResize.cssScale - 1),
      support: 'Actual Playwright window/layout viewport resize, with actual canvas CSS and visualViewport observations. This does not emulate a visualViewport-only browser-chrome event.' });
  }
  const cosmeticShake = await page.evaluate(() => window.__RC233_QUALITY__.cosmeticShake());
  await page.setViewportSize(VIEWPORT);
  console.log('RC233_CAMERA_QUALITY', JSON.stringify({ release, fixedPoseCameraDrift: pose.maxCameraDrift,
    nativeShake: pose.rows.map(row => row.shakes), nativeMapMatrices: pose.rows.map(row => row.nativeMapPaint?.matrix ?? null),
    resize: resizePairs.map(row => ({ height: row.height, cssScaleDrift: row.cssScaleDrift,
      before: row.smallBeforeResize.cssScale, after: row.smallAfterResize.cssScale, mapCoverage: row.smallAfterResize.mapCoverage,
      viewport: row.smallAfterResize.viewport, diagnostics: row.smallAfterResize.diagnostics })),
    cosmeticShake: { accepted: cosmeticShake.accepted, selfCopies: cosmeticShake.selfCopies, beforeHp: cosmeticShake.beforeHp, afterHp: cosmeticShake.afterHp } }));
  if (release === 'after') {
    assert(pose.maxCameraDrift <= CRITERIA.fixedCameraDrift, 'warmed whole-body camera remains fixed through native actor poses');
    assert(pose.rows.every(row => row.shakes.rare.x === 0 && row.shakes.rare.y === 0 && row.shakes.priority.x === 0 && row.shakes.priority.y === 0), 'combat native shake offsets stay zero with their authored active state and settings enabled');
    assert(pose.rows.every(row => row.nativeMapPaint), 'actual native map drawImage transforms were observed');
    const firstMatrix = pose.rows[0].nativeMapPaint.matrix;
    assert(pose.rows.every(row => row.nativeMapPaint.matrix.every((value, i) => Math.abs(value - firstMatrix[i]) <= CRITERIA.fixedCameraDrift)), 'actual native floor paint stays fixed while hero and boss poses vary');
    assert(cosmeticShake.accepted && cosmeticShake.selfCopies === 0, 'accepted cosmetic hit cues cannot copy/shift the combat canvas');
    assert.deepEqual(cosmeticShake.afterHp, cosmeticShake.beforeHp, 'cosmetic probe does not edit actor/player HP');
    for (const row of resizePairs) assert(row.cssScaleDrift < CRITERIA.onePixelCssScaleDrift, 'one-pixel actual viewport changes cannot cause an abrupt world zoom');
    for (const row of resizePairs) for (const sample of [row.large, row.smallBeforeResize, row.smallAfterResize]) {
      const baseCoverage = sample.diagnostics.baseMapCoverage;
      assert(Number.isFinite(sample.mapCoverage) && Number.isFinite(baseCoverage), 'actual fitted map coverage is reported with the final camera');
      assert(sample.mapCoverage >= Math.min(.9, baseCoverage) - 1e-7, 'optional view preference cannot shrink the native floor below ninety percent or shrink an already smaller essential body fit');
    }
  }
  return { setup, pose, resizePairs, cosmeticShake };
}

async function comparisonImages(browser, report) {
  const groups = [['ordinary', ['ordinary-dist02', 'ordinary-spider']], ['mid-dist01', ['mid-dist01']], ['mid-envy', ['mid-envy']], ['boss-envy', ['boss-envy']], ['boss-balrog', ['boss-balrog']]];
  const context = await browser.newContext({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 1 }), page = await context.newPage();
  await localOnly(context, report.environment.localOrigin, report.previewExternalAttempts);
  for (const [name, names] of groups) {
    const rows = [];
    for (const fixtureName of names) for (const release of ['before', 'after']) {
      const source = report.releases[release], fixture = source.fixtures.find(row => row.name === fixtureName);
      rows.push({ fixture: fixtureName, release, sha: source.sourceSha, panels: ['warning', 'release', 'flight'].map(stage => {
        const row = fixture.raster.rows[stage];
        return row ? { stage, src: 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, row.composite.file)).toString('base64'),
          caption: `${stage}: ${row.bodyLongCssPx.toFixed(1)}×${row.bodyShortCssPx.toFixed(1)} CSS px; RGB contrast ${(row.contrastedPixelFraction * 100).toFixed(0)}%; body pixels ${row.pixels}` }
          : { stage, src: null, caption: 'No ' + stage + '-stage packet was observed within the bounded native control; no snapshot was fabricated.' };
      }) });
    }
    await page.setContent('<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;color:#e8edf5;background:#0c111a;font:14px/1.4 system-ui}h1{font-size:19px;margin:0 0 5px}p{margin:0 0 14px;color:#b9c7db}.row{margin-bottom:15px}.label{font:12px monospace;margin-bottom:5px}.panels{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}figure{margin:0;background:#182231;padding:5px}img{display:block;width:100%;height:auto}figcaption{font-size:12px;min-height:34px}footer{color:#a9b4c4;font-size:12px}</style><h1>RC233 native quality comparison</h1><p>Immutable baseline and candidate; same Chrome, viewport, seed and native actor fixture. Isolated native map/projectile paint at observed live packet times; images are scaled to fit this review sheet.</p><main></main><footer>Full-size layer/composite PNGs and pixel receipts accompany results.json. Initial clocks, player invulnerability and entry suppression are disclosed fixtures. Headless Chrome; physical device and hardware GPU unverified.</footer>');
    await page.evaluate(rows => {
      const main = document.querySelector('main');
      for (const row of rows) { const section = document.createElement('section'); section.className = 'row'; const label = document.createElement('div'); label.className = 'label'; label.textContent = row.release + ' / ' + row.fixture + ' / ' + row.sha; section.append(label); const panels = document.createElement('div'); panels.className = 'panels'; for (const panel of row.panels) { const figure = document.createElement('figure'); if (panel.src) { const image = document.createElement('img'); image.src = panel.src; figure.append(image); } const caption = document.createElement('figcaption'); caption.textContent = panel.caption; figure.append(caption); panels.append(figure); } section.append(panels); main.append(section); }
    }, rows);
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
    const file = PROFILE + '-comparison-' + name + '.png', bytes = await page.screenshot({ path: path.join(OUT, file), fullPage: true });
    report.images.push({ file, bytes: bytes.length, sha256: digest(bytes), baseline: BASELINE, candidate: report.candidate,
      fixtures: names, viewport: VIEWPORT, assistanceDisclosed: true, imageType: 'paired native warning/release/flight raster review sheet; original full-size panels retained' });
    if (process.env.RC233_INLINE_REVIEW === '1') {
      const data = await page.evaluate(async src => { const image = new Image(); image.src = src; await image.decode(); const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = Math.round(640 * image.naturalHeight / image.naturalWidth); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); return canvas.toDataURL('image/jpeg', .6); }, 'data:image/png;base64,' + bytes.toString('base64'));
      console.log('RC233_REVIEW_IMAGE ' + JSON.stringify({ name: file, sha: report.candidate, baseline: BASELINE, imageType: 'technical-paired-raster-preview', originalSha256: digest(bytes), data }));
    }
  }
  await context.close();
}

async function localOnly(context, origin, attempts) {
  await context.route('**/*', route => {
    const url = route.request().url();
    try {
      const parsed = new URL(url);
      if (['data:', 'blob:', 'about:'].includes(parsed.protocol) || parsed.origin === origin) return route.continue();
    } catch {}
    attempts.push({ url, resourceType: route.request().resourceType(), disposition: 'blocked before network dispatch' });
    return route.abort('blockedbyclient');
  });
}

async function main() {
  assert(['pc', 'landscape'].includes(PROFILE)); fs.mkdirSync(OUT, { recursive: true });
  const head = git(['rev-parse', 'HEAD']).toString().trim();
  assert.equal(head, process.env.EXPECTED_SHA, 'run the exact committed candidate HEAD');
  assert.equal(git(['status', '--porcelain']).toString(), '', 'CI quality evidence requires a clean candidate checkout');
  git(['cat-file', '-e', BASELINE + '^{commit}']);
  const report = { schema: 1, status: 'running', baseline: BASELINE, candidate: head, profile: PROFILE, viewport: VIEWPORT, seed: SEED,
    criteria: CRITERIA, fixtures: FIXTURES, releases: {}, comparisons: [], images: [], sceneImages: [], previewExternalAttempts: [],
    environment: { channel: 'chrome', chromiumSandbox: true, headless: true, physicalDevice: false,
      gpu: 'unverified until browser diagnostics; headless timing is not device FPS', publicNetworkUsed: false,
      networkPolicy: 'Test-page requests are allowlisted to this localhost origin and data/blob/about. External attempts are blocked before dispatch, recorded and fail the run; local response bytes are never substituted.' },
    scope: 'Paired local immutable baseline/candidate native fixtures. Candidate generic fixtures require three packet-emitting RAF cycles; the separate major case requires pressure before/after native blood completion. A bounded incomplete baseline is recorded as a control defect, never a quality pass. One-time ready clocks, Hunter solo selection, player invulnerability and director saved-phase initialization are disclosed. Five actual native game-canvas scenes are distinct from five isolated raster comparison sheets. No natural campaign, physical-device/GPU or damage-contact claim.' };
  const persist = () => fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(report, null, 2) + '\n'); persist();
  const baselineCache = new Map(), mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg' };
  const releaseBytes = (release, relative) => {
    if (release === 'before') { if (!baselineCache.has(relative)) baselineCache.set(relative, git(['--no-replace-objects', 'show', BASELINE + ':' + relative])); return baselineCache.get(relative); }
    const file = path.resolve(ROOT, relative); assert(file.startsWith(ROOT + path.sep)); return fs.readFileSync(file);
  };
  const server = http.createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname), match = /^\/(before|after)\/(.*)$/.exec(pathname);
      if (!match) return res.writeHead(404).end();
      const release = match[1], relative = match[2] || 'index.html';
      if (relative.startsWith('/') || relative.split('/').some(piece => !piece || piece === '..' || piece === '.')) return res.writeHead(403).end();
      const bytes = releaseBytes(release, relative);
      const source = report.releases[release]; if (source && path.extname(relative) === '.js' && !source.loadedJavaScript.some(row => row.file === relative)) source.loadedJavaScript.push({ file: relative, bytes: bytes.length, sha256: digest(bytes) });
      res.setHeader('Content-Type', mime[path.extname(relative)] || 'application/octet-stream'); res.setHeader('Cache-Control', 'no-store');
      res.end(relative === 'assets/index-v31526.js' ? Buffer.concat([bytes, BRIDGE]) : bytes);
    } catch { res.writeHead(404).end(); }
  });
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    report.environment.localOrigin = 'http://127.0.0.1:' + server.address().port;
    const { chromium } = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright'));
    browser = await chromium.launch({ chromiumSandbox: true, channel: 'chrome', headless: true, args: [] });
    report.environment.browserVersion = browser.version();
    for (const release of ['before', 'after']) {
      const sourceSha = release === 'before' ? BASELINE : head, sourceBundle = releaseBytes(release, 'assets/index-v31526.js');
      const source = report.releases[release] = { sourceSha, sourceBundleSha256: digest(sourceBundle), bridgeSha256: digest(BRIDGE),
        servedBundleSha256: digest(Buffer.concat([sourceBundle, BRIDGE])), loadedJavaScript: [], fixtures: [], controlDefects: [], errors: [], httpErrors: [], externalAttempts: [] };
      const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, isMobile: PROFILE !== 'pc', hasTouch: PROFILE !== 'pc',
        userAgent: PROFILE === 'pc' ? undefined : 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + browser.version() + ' Mobile Safari/537.36' });
      await localOnly(context, report.environment.localOrigin, source.externalAttempts);
      const page = await context.newPage(); page.setDefaultTimeout(30000);
      await page.addInitScript(installObservation, SEED);
      page.on('pageerror', error => source.errors.push(String(error.stack || error)));
      page.on('response', response => { if (response.status() >= 400) source.httpErrors.push({ url: response.url(), status: response.status() }); });
      await page.goto('http://127.0.0.1:' + server.address().port + '/' + release + '/?qa=1');
      await page.waitForFunction(() => window.__RC233_QA__ && window.__HAPIL_RC133_NATIVE__?.installed && window.__HAPIL_MEDIA_ART_RC133__?.ready && window.__HAPIL_COMBAT_LIFECYCLE_RC231__, null, { timeout: 60000 });
      await page.keyboard.press('Escape'); await page.getByRole('button', { name: '새 게임 시작', exact: true }).click();
      await page.getByRole('button', { name: '이 편성으로 접속', exact: true }).click();
      await page.waitForFunction(() => window.__HAPIL_CONTROLS_V31329__?.binding?.phase === 'game');
      await page.waitForSelector('#hapil-story-rc51');
      for (let i = 0; i < 25 && await page.locator('#hapil-story-rc51').count(); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(80); }
      await page.waitForFunction(() => !document.querySelector('#hapil-story-rc51'));
      await page.evaluate(() => window.__HAPIL_PARTY_LAUNCH_V31322__?.dismissGuestUI?.());
      await page.evaluate(installQualityProbe);
      source.environment = await page.evaluate(() => { const c = document.createElement('canvas'), gl = c.getContext('webgl'), ext = gl?.getExtension('WEBGL_debug_renderer_info'); return { userAgent: navigator.userAgent, devicePixelRatio, renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null, vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : null }; });
      for (const fixture of FIXTURES) {
        const row = { name: fixture.name, fixture, setup: await page.evaluate(f => window.__RC233_QUALITY__.stage(f), fixture) };
        source.fixtures.push(row); persist();
        assert(row.setup.sameNativeWorld); for (const a of row.setup.actors) assert.equal(a.hp, a.maxHp, 'original full-HP actor at initial readiness');
        row.trace = await page.evaluate(({ fixture, criteria }) => window.__RC233_QUALITY__.observe(fixture, criteria), { fixture: { ...fixture, controlBaseline: release === 'before', captureScene: release === 'after' && fixture.name !== 'ordinary-spider' }, criteria: CRITERIA });
        if (row.trace.actualScene) {
          const scene = row.trace.actualScene, bytes = Buffer.from(scene.png.split(',')[1], 'base64'), file = `${PROFILE}-actual-${fixture.name}.png`;
          fs.writeFileSync(path.join(OUT, file), bytes); scene.png = { file, bytes: bytes.length, sha256: digest(bytes) }; scene.sourceSha = sourceSha;
          report.sceneImages.push({ file, bytes: bytes.length, sha256: digest(bytes), sourceSha, fixture: fixture.name, time: scene.time,
            imageType: scene.imageType, releasedBodies: scene.releasedIds.length, canvasCss: scene.canvasCss, nativeBacking: scene.nativeBacking, support: scene.support });
          if (process.env.RC233_INLINE_REVIEW === '1') {
            const data = await page.evaluate(async src => { const image = new Image(); image.src = src; await image.decode(); const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = Math.round(640 * image.naturalHeight / image.naturalWidth); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); return canvas.toDataURL('image/jpeg', .65); }, 'data:image/png;base64,' + bytes.toString('base64'));
            console.log('RC233_REVIEW_IMAGE ' + JSON.stringify({ name: file, sha: sourceSha, imageType: scene.imageType, fixture: fixture.name, time: scene.time, releasedBodies: scene.releasedIds.length, originalSha256: digest(bytes), data }));
          }
        }
        row.pressure = pressureSummary(row.trace); row.raster = await page.evaluate(() => window.__RC233_QUALITY__.rasters());
        row.raster.floorSource = { file: row.raster.floor.replace(/^\.\//, ''), sha256: digest(releaseBytes(release, row.raster.floor.replace(/^\.\//, ''))) };
        for (const raster of Object.values(row.raster.rows)) for (const receipt of raster.receipts) {
          const file = decodeURIComponent(new URL(receipt.path, 'http://localhost').pathname).replace(/^\//, '');
          if (file) { receipt.sourceFile = file; receipt.sourceSha256 = digest(releaseBytes(release, file)); }
        }
        for (const [stage, raster] of Object.entries(row.raster.rows)) for (const kind of ['layer', 'composite']) {
          const file = `${release}-${fixture.name}-${stage}-${kind}.png`, bytes = Buffer.from(raster[kind].split(',')[1], 'base64'); fs.writeFileSync(path.join(OUT, file), bytes); raster[kind] = { file, bytes: bytes.length, sha256: digest(bytes) };
        }
        console.log('RC233_NATIVE_QUALITY_ROW', JSON.stringify({ release, sourceSha, fixture: fixture.name, setup: row.setup,
          pressure: row.pressure, timedOut: row.trace.timedOut, scene: row.trace.actualScene && { file: row.trace.actualScene.png.file, time: row.trace.actualScene.time, releasedBodies: row.trace.actualScene.releasedIds.length },
          raster: Object.fromEntries(Object.entries(row.raster.rows).map(([stage, r]) => [stage, { pixels: r.pixels, longCssPx: r.bodyLongCssPx, shortCssPx: r.bodyShortCssPx,
            rgbContrastFraction: r.contrastedPixelFraction, meanLumaDifference: r.meanLumaDifference, defaultLumaDifference: r.defaultOpacity.meanLumaDifference,
            contactGeometryExact: r.contactGeometryExact, sources: r.receipts.map(draw => ({ path: draw.path, sha256: draw.sourceSha256, changedAlpha: draw.changedAlpha, styled: draw.styled })) }])), warmCache: row.raster.warmCache, protection: row.raster.protection }));
        if (release === 'before' && (row.trace.timedOut || !row.raster.rows.release || !row.raster.rows.flight)) source.controlDefects.push({ fixture: fixture.name, timedOut: row.trace.timedOut, cycles: row.trace.cycles.length, stages: row.trace.snapshotStages });
        if (release === 'after') {
          assert(!row.trace.timedOut && row.pressure.deliveredCycles >= CRITERIA.naturalCycles && row.trace.end > row.trace.start, 'candidate completes three actual native packet-emitting cycles within the declared bound');
          assert(row.trace.observedPacketCount > 0 && row.raster.rows.release && row.raster.rows.flight, 'actual live release and later flight must both be observed');
          if (fixture.name !== 'ordinary-spider') assert(row.trace.actualScene, 'existing native three-cycle window includes an actual battlefield scene with the declared actor and released-body count');
          assert(row.trace.maxQueue <= row.trace.cap, 'native live packet queue remains inside the existing admission cap');
          for (const stage of ['release', 'flight']) {
            const r = row.raster.rows[stage]; assert(r.receipts.length > 0 && r.pixels > 0, 'released native body is visibly painted');
            assert(r.receipts.every(draw => draw.changedAlpha === CRITERIA.sourceAlphaChangedPixels && JSON.stringify(draw.originalSize) === JSON.stringify(draw.renderedSize)), 'styling preserves every original source alpha and image dimension');
            assert(r.contactGeometryExact, 'live presentation and unmodified native contact probe use identical source geometry');
            assert(r.bodyLongCssPx >= CRITERIA.bodyLongCssPx && r.bodyShortCssPx >= CRITERIA.bodyShortCssPx, 'native body retains a visible CSS pixel silhouette');
            assert(r.contrastedPixelFraction >= CRITERIA.contrastedPixelFraction, 'native body has measured contrast against its actual map floor');
          }
          if (row.raster.rows.warning) assert(row.raster.rows.warning.nativeOpacityUnchanged && row.raster.rows.warning.receipts.every(draw => !draw.styled), 'pre-release warnings receive no strengthened body opacity or new styled source');
          assert.equal(row.raster.protection.removed.pixels, 0, 'removed native packet cannot paint a strengthened body');
          assert.equal(row.raster.protection.removed.drawCalls, 0, 'removed native packet cannot draw body images');
          assert.equal(row.raster.protection.zeroOpacity.pixels, 0, 'explicit zero body opacity remains invisible');
          assert(row.raster.warmCache && row.raster.warmCache.newCacheMisses === 0 && row.raster.warmCache.newProcessedPixels === 0 && row.raster.warmCache.after.pendingStyles === 0, 'warmed actual native source images are not processed or scheduled again');
          assert(row.raster.warmCache.after.cacheBytes <= 8 * 1024 * 1024, 'readability source variants retain their cache budget');
        }
        persist();
      }
      const majorFixture = { name: 'fair-major-native', zone: 'ep1b03', id: 'b03-boss', ids: ['b03-boss', 'mb-ep1b03'],
        role: 'boss', mode: 'STORY', blockFirst: true, nearTransition: true, requireMajor: true };
      source.major = { fixture: majorFixture, setup: await page.evaluate(f => window.__RC233_QUALITY__.stage(f), majorFixture),
        support: 'One-time validated native director saved-phase initialization at elapsed10.8/12s, first actual boss atomic deadline+2s. No later timer/HP edits or forced cast. This separate preservation case requires two native pressure cycles including at least one after actual blood warning/active completion; the six generic fixtures each require three packet-emitting cycles.' };
      source.major.trace = await page.evaluate(({ fixture, criteria }) => window.__RC233_QUALITY__.observe(fixture, criteria), { fixture: { ...majorFixture, controlBaseline: release === 'before' }, criteria: CRITERIA });
      source.major.pressure = pressureSummary(source.major.trace);
      if (release === 'after') {
        assert(source.major.pressure.deliveredCycles >= CRITERIA.majorFixtureMinimumPressureCycles, 'separate major-preservation case observes actual pressure before and after its native blood action');
        assert.equal(source.major.trace.cycles[0].owner, 'mb-ep1b03', 'ready native owner acts while the initial lead is still blocked');
        assert(source.major.pressure.owners.includes('b03-boss') && source.major.pressure.owners.includes('mb-ep1b03'), 'both actual ranked owners receive pressure turns');
        const blood = source.major.trace.majorPackets.filter(q => q.blood && q.sourceId === 'b03-boss');
        assert(blood.length > 0 && blood.every(q => q.endAt > q.fireAt && q.fireAt > q.born), 'the actual native boss blood card retains warning and active clocks');
        for (const q of blood) assert(source.major.trace.cycles.every(row => row.announcedAt < q.born || row.announcedAt >= q.endAt), 'laser warning and active time retain exclusive attention before pressure fills their empty interval');
      }
      if (release === 'before' && source.major.trace.timedOut) source.controlDefects.push({ fixture: majorFixture.name, timedOut: true, cycles: source.major.trace.cycles.length, majorPackets: source.major.trace.majorPackets.length });
      source.camera = await cameraEvidence(page, release); source.status = release === 'before' ? source.controlDefects.length ? 'bounded-control-with-recorded-defects' : 'bounded-control-observed' : 'candidate-quality-gates-passed'; persist();
      assert.deepEqual(source.errors, []); assert.deepEqual(source.httpErrors, []); assert.deepEqual(source.externalAttempts, [], 'test pages never attempt an external/public asset or service'); await context.close();
    }
    for (const fixture of FIXTURES) {
      const before = report.releases.before.fixtures.find(row => row.name === fixture.name), after = report.releases.after.fixtures.find(row => row.name === fixture.name);
      const row = { name: fixture.name, before: before.pressure, after: after.pressure,
        contrast: ['release', 'flight'].map(stage => ({ stage, before: before.raster.rows[stage]?.contrastedPixelFraction ?? null, after: after.raster.rows[stage].contrastedPixelFraction })) };
      row.cadenceComparison = before.trace.timedOut || before.pressure.deliveredCycles < CRITERIA.naturalCycles
        ? { available: false, reason: 'The bounded baseline did not deliver three complete native cycles; no cadence improvement is claimed.' }
        : { available: true, releaseGapRatio: before.pressure.maxReleaseToNextAnnouncement > 0 ? after.pressure.maxReleaseToNextAnnouncement / before.pressure.maxReleaseToNextAnnouncement : null };
      report.comparisons.push(row);
      if (fixture.role !== 'ordinary') assert(after.pressure.maxIdleWithoutMajor <= Math.max(CRITERIA.unblockedPressureIdleSeconds, before.pressure.maxIdleWithoutMajor * CRITERIA.comparisonIdleRatio), 'ranked pressure cannot retain the old unblocked long idle gap');
      if (fixture.name === 'boss-envy' && row.cadenceComparison.available) assert(after.pressure.maxReleaseToNextAnnouncement <= before.pressure.maxReleaseToNextAnnouncement * CRITERIA.comparisonIdleRatio, 'three native Story boss salvos must shorten the old release-to-next-announcement gap by at least fifteen percent');
    }
    assert.equal(report.sceneImages.length, 5, 'five source-pinned actual native game-canvas scenes');
    await comparisonImages(browser, report); assert.equal(report.images.length, 5, 'five source-pinned paired native raster review images');
    assert.deepEqual(report.previewExternalAttempts, [], 'review-sheet rendering never attempts an external source');
    report.status = 'passed';
  } catch (error) { report.status = 'failed'; report.failure = String(error.stack || error); process.exitCode = 1; console.error(error); }
  finally { persist(); await browser?.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  console.log('RC233_QUALITY_BROWSER', JSON.stringify({ status: report.status, baseline: BASELINE, candidate: head, profile: PROFILE, comparisons: report.comparisons, sceneImages: report.sceneImages, images: report.images, scope: report.scope }));
}

module.exports = { BASELINE, CRITERIA, FIXTURES, pressureSummary };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
