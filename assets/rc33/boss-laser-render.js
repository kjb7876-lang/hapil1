/* RC33: force boss-owned raster beams through the real render path and remove
 * the shared additive blue core. Presentation only; no combat values change. */
(() => {
  'use strict';

  const VERSION = '33401';
  const ROOT = './assets/vfx/rc33/boss-laser-families/';
  const MAX_FAMILY_IMAGES = 5;
  const OWNER_FAMILY = Object.freeze({
    'dist00-boss': 'sinful',
    'dist06-boss': 'balrog',
    'a11-boss': 'celestial',
    'a11-cosmic-v31318': 'cosmic-lucifer',
    'b02-boss': 'sloth',
    'b03-boss': 'envy',
    'b04-boss': 'gluttony',
    'b05-boss': 'lust',
    'b06-boss': 'greed',
    'b06b-boss': 'greed',
    'b07-boss': 'wrath',
    'b08-boss': 'pride',
    'b09-boss': 'pride',
    'u203-boss': 'u2-memory',
    'l301-boss': 'last-three',
    'l303-boss': 'last-three',
    'h103-boss': 'cyber',
    'k103-boss': 'sinful',
    'c102-boss': 'cyber',
    'c103-boss': 'cyber',
    'c104-boss': 'cyber',
    'l305-boss': 'last-three',
    'kair-great-01': 'kairo',
    'kair-great-02': 'kairo',
    'kair-great-03': 'kairo',
    'kair-great-04': 'kairo',
    'kair-great-05': 'kairo',
    'kair-great-06': 'kairo'
  });
  const FAMILY_HUE = Object.freeze({
    infernal: 18,
    celestial: 278,
    sinful: 348,
    cyber: 194,
    sloth: 158,
    envy: 138,
    gluttony: 302,
    lust: 345,
    greed: 42,
    wrath: 22,
    pride: 274,
    balrog: 18,
    'cosmic-lucifer': 347,
    kairo: 190,
    'last-three': 252,
    'u2-memory': 188
  });
  const OWNER_IDS = Object.keys(OWNER_FAMILY);
  const ownerColors = new Map();
  const activeCasts = new Set();
  const stats = {
    ownersRouted: 0,
    ownerAssetAliases: 0,
    startsRouted: 0,
    beamImageReplacements: 0,
    fullArtworkDraws: 0,
    blueCoreDrawsSuppressed: 0,
    imageLoadsStarted: 0,
    imageLoadsReady: 0,
    imageLoadFailures: 0,
    imageCacheEvictions: 0,
    drawErrors: 0
  };
  const familyImages = new Map();

  function familyFor(id) {
    return OWNER_FAMILY[id] || '';
  }

  function basePath(id) {
    const family = familyFor(id);
    return family ? ROOT + family + '.webp' : '';
  }

  function beamPath(id) {
    const base = basePath(id);
    return base ? base + '?v=' + VERSION + '#owner=' + encodeURIComponent(id) : '';
  }

  function addAsset(owner, path) {
    if (!owner || !path) return;
    const base = basePath(owner.id);
    const plain = base;
    const versioned = base + '?v=' + VERSION;
    const source = Array.isArray(owner.assets) ? owner.assets : [];
    const next = [...source];
    for (const candidate of [plain, versioned, path]) {
      if (candidate && !next.includes(candidate)) {
        next.push(candidate);
        stats.ownerAssetAliases++;
      }
    }
    try {
      owner.assets = next;
    } catch (_) {
      // Some builds expose assets through a read-only view. The normal owner
      // descriptors are mutable, but leave the original renderer usable if not.
    }
  }

  function routeOwners(api) {
    let routed = 0;
    for (const owner of api.owners || []) {
      const path = beamPath(owner.id);
      if (!path) continue;
      addAsset(owner, path);
      owner.beam = path;
      ownerColors.set(owner.id, owner.color || '');
      routed++;
    }
    stats.ownersRouted = routed;
  }

  function ownerIdFromSource(source) {
    const value = String(source || '');
    const hash = value.match(/#owner=([^&#]+)/i);
    if (hash) {
      try {
        const id = decodeURIComponent(hash[1]);
        if (OWNER_FAMILY[id]) return id;
      } catch (_) {}
    }
    const parts = value.split(/[?#]/)[0].split('/');
    const laserIndex = parts.indexOf('boss-lasers');
    const vfxIndex = parts.indexOf('v31330');
    const rawPathId = laserIndex >= 0 ? parts[laserIndex + 1] : vfxIndex >= 0 ? parts[vfxIndex + 1] : '';
    const pathId = String(rawPathId || '').toLowerCase().endsWith('.webp')
      ? rawPathId.slice(0, -5) : rawPathId;
    if (pathId && OWNER_FAMILY[pathId]) return pathId;
    return '';
  }

  function ownerIdFromCast(cast, state) {
    if (!cast || typeof cast !== 'object') return '';
    for (const key of [
      'ownerIdV31331', 'ownerId', 'bossId', 'sourceId', 'enemyId',
      'casterId', 'actorId', 'bossIdentityV31409', 'id'
    ]) {
      const value = cast[key];
      if (typeof value === 'string' && OWNER_FAMILY[value]) return value;
    }
    const fromBeam = ownerIdFromSource(cast.beam);
    if (fromBeam) return fromBeam;
    for (const actor of state?.enemies || []) {
      if (!actor || !OWNER_FAMILY[actor.id]) continue;
      if (actor.id === cast.sourceId || actor.id === cast.ownerId || actor.id === cast.bossId) {
        return actor.id;
      }
    }
    return '';
  }

  function syncLiveCasts(state) {
    for (const cast of activeCasts) {
      if (!cast || typeof cast !== 'object') {
        activeCasts.delete(cast);
        continue;
      }
      if (Number.isFinite(Number(cast.endAt)) && Number(cast.endAt) <= Number(state?.time)) {
        activeCasts.delete(cast);
        continue;
      }
      const id = ownerIdFromCast(cast, state);
      const path = beamPath(id);
      if (path) cast.beam = path;
    }
  }

  function preload(id) {
    const family = familyFor(id);
    if (!family || typeof window.Image !== 'function') return null;
    if (familyImages.has(family)) {
      const cached = familyImages.get(family);
      familyImages.delete(family);
      familyImages.set(family, cached);
      return cached;
    }
    try {
      const image = new window.Image();
      image.decoding = 'async';
      image.loading = 'eager';
      image.fetchPriority = 'high';
      familyImages.set(family, image);
      image.onload = () => {
        if ((image.naturalWidth || image.width) > 0) stats.imageLoadsReady++;
      };
      image.onerror = () => {
        stats.imageLoadFailures++;
        familyImages.delete(family);
      };
      const base = window.document?.baseURI || window.location?.href || 'http://localhost/';
      image.src = new URL(ROOT + family + '.webp?v=' + VERSION, base).href;
      trimFamilyImages(family);
      stats.imageLoadsStarted++;
      return image;
    } catch (_) {
      familyImages.delete(family);
      return null;
    }
  }

  function trimFamilyImages(protectFamily) {
    if (familyImages.size <= MAX_FAMILY_IMAGES) return;
    const activeFamilies = new Set();
    for (const cast of activeCasts) {
      const id = ownerIdFromCast(cast, null);
      const family = familyFor(id);
      if (family) activeFamilies.add(family);
    }
    for (const family of familyImages.keys()) {
      if (familyImages.size <= MAX_FAMILY_IMAGES) break;
      if (family === protectFamily || activeFamilies.has(family)) continue;
      familyImages.delete(family);
      stats.imageCacheEvictions++;
    }
  }

  function readyImage(id) {
    const image = preload(id);
    if (!image || !image.complete) return null;
    return (image.naturalWidth || image.width) > 0 ? image : null;
  }

  function sourceOf(image) {
    const src = String(image?.src || '');
    const current = String(image?.currentSrc || '');
    return src.includes('#owner=') || src.includes('boss-laser-families/')
      ? src : current || src;
  }

  function isBeamSource(source) {
    const value = String(source || '').toLowerCase();
    return value.includes('boss-lasers') ||
      value.includes('boss-laser-families') ||
      value.includes('/vfx/v31330/') ||
      value.includes('cosmic-lucifer-blood-beam') ||
      value.includes('/beam.png') || value.includes('/beam.webp') ||
      value.includes('/beam.jpg') || value.includes('/beam.jpeg');
  }

  function isBlueCore(ctx, call, image) {
    if (ctx?.globalCompositeOperation !== 'lighter' || call.length !== 9) return false;
    const height = Number(image?.naturalHeight || image?.height) || 0;
    if (!(height > 0)) return false;
    const sourceY = Number(call[2]) || 0;
    const sourceWidth = Number(call[3]) || 0;
    const sourceHeight = Number(call[4]) || 0;
    const width = Number(image?.naturalWidth || image?.width) || 0;
    return Math.abs(sourceY / height - 0.38) < 0.025 &&
      Math.abs(sourceHeight / height - 0.25) < 0.025 &&
      (!width || Math.abs(sourceWidth / width - 1) < 0.025);
  }

  function installCoreGuard() {
    const proto = window.CanvasRenderingContext2D?.prototype;
    if (!proto || proto.__hapilRc33BlueCoreGuard || typeof proto.drawImage !== 'function') return;
    const original = proto.drawImage;
    try {
      Object.defineProperty(proto, 'drawImage', {
        configurable: true,
        writable: true,
        value: function (...call) {
          if (isBlueCore(this, call, call[0])) {
            stats.blueCoreDrawsSuppressed++;
            return;
          }
          return original.apply(this, call);
        }
      });
      Object.defineProperty(proto, '__hapilRc33BlueCoreGuard', {
        configurable: true,
        value: true
      });
    } catch (_) {}
  }

  function hueFromColor(value) {
    let r = 0, g = 0, b = 0;
    const text = String(value || '').trim();
    const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      let digits = hex[1];
      if (digits.length === 3) digits = digits.split('').map(ch => ch + ch).join('');
      r = parseInt(digits.slice(0, 2), 16) / 255;
      g = parseInt(digits.slice(2, 4), 16) / 255;
      b = parseInt(digits.slice(4, 6), 16) / 255;
    } else {
      const rgb = text.match(/^rgba?[(][ ]*([0-9]+(?:[.][0-9]+)?)[ ]*,[ ]*([0-9]+(?:[.][0-9]+)?)[ ]*,[ ]*([0-9]+(?:[.][0-9]+)?)/i);
      if (!rgb) return NaN;
      r = Number(rgb[1]) / 255;
      g = Number(rgb[2]) / 255;
      b = Number(rgb[3]) / 255;
    }
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    if (!delta) return 0;
    let hue;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    return (hue * 60 + 360) % 360;
  }

  function ownerColor(api, id) {
    return ownerColors.get(id) || api.owners?.find(owner => owner.id === id)?.color || '';
  }

  function tintFilter(api, id) {
    const family = familyFor(id);
    const target = hueFromColor(ownerColor(api, id));
    if (!family || !Number.isFinite(target)) {
      return 'saturate(1.22) contrast(1.04)';
    }
    const shift = ((target - FAMILY_HUE[family] + 540) % 360) - 180;
    return 'hue-rotate(' + shift.toFixed(1) + 'deg) saturate(1.24) contrast(1.04)';
  }

  function fullImageCall(image, call) {
    const width = Number(image?.naturalWidth || image?.width) || 0;
    const height = Number(image?.naturalHeight || image?.height) || 0;
    if (call.length === 9 && width > 0 && height > 0) {
      return [image, 0, 0, width, height, call[5], call[6], call[7], call[8]];
    }
    const copy = call.slice();
    copy[0] = image;
    return copy;
  }

  function withCanvas(ctx, api, render, bloodOwnerId = '') {
    if (!ctx || typeof ctx.drawImage !== 'function') return render();
    const own = Object.getOwnPropertyDescriptor(ctx, 'drawImage');
    const original = ctx.drawImage;
    let bloodImagesSeen = 0;
    try {
      Object.defineProperty(ctx, 'drawImage', {
        configurable: true,
        writable: true,
        value: function (...call) {
          const image = call[0];
          const source = sourceOf(image);
          if (isBlueCore(this, call, image)) {
            stats.blueCoreDrawsSuppressed++;
            return;
          }

          let id = ownerIdFromSource(source);
          let replacement = null;
          if (bloodOwnerId && !id && bloodImagesSeen++ === 0) {
            id = bloodOwnerId;
            if (isWideBeamCall(call)) replacement = readyImage(id);
          } else if (id && isBeamSource(source) &&
                     !source.toLowerCase().includes('boss-laser-families/')) {
            replacement = readyImage(id);
          }

          const isCustom = source.toLowerCase().includes('boss-laser-families/');
          const target = replacement || (isCustom && id ? image : null);
          if (!target || !id) return original.apply(this, call);

          const previousFilter = this.filter;
          try {
            this.filter = tintFilter(api, id);
            const result = original.apply(this, fullImageCall(target, call));
            stats.fullArtworkDraws++;
            if (replacement) stats.beamImageReplacements++;
            return result;
          } finally {
            this.filter = previousFilter || 'none';
          }
        }
      });
    } catch (_) {
      return render();
    }
    try {
      return render();
    } finally {
      if (own) Object.defineProperty(ctx, 'drawImage', own);
      else delete ctx.drawImage;
    }
  }

  function isWideBeamCall(call) {
    let width = 0, height = 0;
    if (call.length === 9) {
      width = Number(call[7]) || 0;
      height = Number(call[8]) || 0;
    } else if (call.length === 5) {
      width = Number(call[3]) || 0;
      height = Number(call[4]) || 0;
    }
    return width > 0 && height > 0 && width / height >= 2.2;
  }

  function install(attempt = 0) {
    if (window.__HAPIL_RC33__?.installed) return;
    const api = window.__HAPIL_LASERS_V31330__;
    const blood = window.__HAPIL_BLOOD_RC16__;
    if (!api?.installed || !Array.isArray(api.owners) || typeof api.draw !== 'function' ||
        typeof api.tick !== 'function' || typeof api.start !== 'function' ||
        typeof blood?.draw !== 'function') {
      if (attempt < 240) setTimeout(() => install(attempt + 1), 25);
      return;
    }

    routeOwners(api);
    installCoreGuard();
    const originalStart = api.start;
    api.start = function (...args) {
      const id = args.map(value => ownerIdFromCast(value, null))
        .find(value => value) || '';
      if (id) {
        const owner = api.owners.find(row => row.id === id);
        if (owner) {
          const path = beamPath(id);
          addAsset(owner, path);
          owner.beam = path;
        }
        preload(id);
        stats.startsRouted++;
      }
      const result = originalStart.apply(this, args);
      if (result && typeof result === 'object') {
        const resultId = ownerIdFromCast(result, null) || id;
        const path = beamPath(resultId);
        if (path && ('beam' in result || 'fireAt' in result || 'endAt' in result)) {
          result.beam = path;
          activeCasts.add(result);
        }
      }
      return result;
    };

    const originalTick = api.tick;
    api.tick = function (state, ...args) {
      syncLiveCasts(state);
      return originalTick.call(this, state, ...args);
    };

    const originalDraw = api.draw;
    api.draw = function (ctx, cache, state, settings = {}) {
      syncLiveCasts(state);
      try {
        return withCanvas(ctx, api,
          () => originalDraw.call(this, ctx, cache, state, settings));
      } catch (error) {
        stats.drawErrors++;
        throw error;
      }
    };

    const cosmicId = 'a11-cosmic-v31318';
    const cosmicPath = beamPath(cosmicId);
    try {
      blood.asset = cosmicPath;
    } catch (_) {}
    const originalBloodDraw = blood.draw;
    blood.draw = function (ctx, cache, state, cast, settings = {}) {
      const id = ownerIdFromCast(cast, state);
      if (id) {
        const path = beamPath(id);
        cast.beam = path;
        if (id === cosmicId) {
          try {
            blood.asset = path;
          } catch (_) {}
        }
        preload(id);
      }
      return withCanvas(ctx, api,
        () => originalBloodDraw.call(this, ctx, cache, state, cast, settings), id);
    };

    window.__HAPIL_RC33__ = Object.freeze({
      installed: true,
      version: VERSION,
      ownersRouted: stats.ownersRouted,
      ownerIds: Object.freeze(OWNER_IDS.slice()),
      familyFor,
      beamPathFor: beamPath,
      stats: () => Object.freeze({ ...stats, familyImageCacheEntries: familyImages.size })
    });
  }

  install();
})();
