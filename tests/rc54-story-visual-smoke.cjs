const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const storyWindow = {};
vm.runInNewContext(read('data/story-rc51.js'), { window: storyWindow });
const records = storyWindow.__HAPIL_STORY_DATA_RC51__.records;
assert.equal(records.length, 61, 'RC60 removes only the empty story slot');

const earlyZones = new Set(['dist00', 'dist01', 'dist02', 'dist03', 'dist04', 'dist05', 'dist06', 'ep1a07']);
const modernTerms = /횡단보도|승용차|자동차|신호등|새빛호텔|아파트/;
const early = records.filter(record => earlyZones.has(record.zone));
assert.equal(early.length, 7, 'seven medieval battle maps remain; fall narration belongs to dist06');
for (const record of early) {
  const text = `${record.pre ?? ''}\n${record.post ?? ''}`;
  assert(!modernTerms.test(text), `${record.zone} contains modern city imagery in the demon-memory arc`);
}
const murder = records.filter(record => /^murder0[1-3]$/.test(record.zone));
assert.equal(murder.length, 3, 'the later serial-murder road arc must remain present');
assert(murder.some(record => modernTerms.test(`${record.pre ?? ''}\n${record.post ?? ''}`)),
  'the road/city narrative should stay in the later murder arc');

const routes = {
  dist00: 'assets/maps/rc53/dist00-demon-tree.webp',
  dist01: 'assets/maps/rc53/dist01-spider-cave.webp',
  ep1a07: 'assets/maps/rc54/ep1a07-darkfall.webp',
  kair03: 'assets/maps/rc53/kair03-siren-timeway.webp',
  cult04: 'assets/maps/rc53/cult04-final-judgment.jpg',
  murder03: 'assets/maps/rc54/murder03-loop-crosswalk.webp',
};
const medievalMapAssets = {
  dist00: routes.dist00,
  dist01: routes.dist01,
  dist02: 'assets/v31345/maps/dist02.webp',
  dist03: 'assets/v31345/maps/dist03.webp',
  dist04: 'assets/v31345/maps/dist04.webp',
  dist05: 'assets/v31345/maps/dist05.webp',
  dist06: 'assets/v31345/maps/dist06.webp',
  ep1a07: routes.ep1a07,
};
const hospital = 'assets/maps/ep1a_08_blood_hospital_rc24.png';
const projectile = './assets/vfx/rc54/murder03-blue-signal-projectile.png';
const bundle = read('assets/index-v31526.js');
const html = read('index.html');
assert.match(bundle, /RC54: align story maps with their time period/);
assert.match(bundle, /__HAPIL_MAP_ART_RC54__/);
assert.match(bundle, /__HAPIL_STORY_VISUAL_RC54__/);
assert.match(bundle, /rc54-blue-signal-loop/);
assert.match(bundle, /cache\[rows\[next\]\] = fallback/);
assert.match(bundle, /ep1a_08_blood_hospital_rc24\.png/);
assert(!bundle.includes("ep1a08: './assets/maps/rc53/ep1a08-blood-hospital.webp'"),
  'the generated open arena must not replace the enclosed hospital map');
assert.match(html, /index-v31526\.js\?v=36201/);

for (const [zone, asset] of Object.entries(routes)) {
  if(zone==='ep1a07')assert(!records.some(record=>record.zone===zone),'deleted slot must stay inactive');
  else assert(records.some(record => record.zone === zone), `story map ${zone} is absent`);
  assert(bundle.includes(`${zone}: './${asset}'`), `runtime route ${zone} is absent`);
  const image = fs.readFileSync(path.join(root, asset));
  assert(image.length > 20_000 && image.length < 2_000_000, `${asset} has an implausible size`);
  if (asset.endsWith('.webp')) {
    assert.equal(image.toString('ascii', 0, 4), 'RIFF', `${asset} is not RIFF`);
    assert.equal(image.toString('ascii', 8, 12), 'WEBP', `${asset} is not WebP`);
  } else {
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff], `${asset} is not JPEG`);
  }
}
for (const [zone, asset] of Object.entries(medievalMapAssets)) {
  const image = fs.readFileSync(path.join(root, asset));
  assert.equal(image.toString('ascii', 8, 12), 'WEBP', `${zone} must use a decoded medieval dark-fantasy map`);
  if (!routes[zone]) assert(bundle.includes(`./${asset}`), `${zone} active map path is missing from the bundle`);
}
const hospitalBytes = fs.readFileSync(path.join(root, hospital));
assert.deepEqual([...hospitalBytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10],
  'the enclosed HELP ME hospital PNG must remain available');
const projectileBytes = fs.readFileSync(path.join(root, projectile));
assert.deepEqual([...projectileBytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
assert.equal(projectileBytes[25], 6, 'generated projectile must retain RGBA transparency');

const mapStart = bundle.indexOf('/* RC54: align story maps with their time period');
const projectileStart = bundle.indexOf('/* RC54: story-matched projectile for the blue-light executor');
const rc55Start = bundle.indexOf('/* RC55: bind the cult03 heretics to their story');
assert(mapStart >= 0 && projectileStart > mapStart && rc55Start > projectileStart,
  'RC54 runtime blocks must precede RC55');
const mapSource = bundle.slice(mapStart, projectileStart);
const zones = Object.fromEntries([...Object.keys(routes), 'ep1a08'].map(id => [id, {
  map: id === 'ep1a08' ? `./${hospital}` : `./legacy/${id}.jpg`,
  mapVariants: [`./legacy/${id}-alt.jpg`],
}]));
const context = {
  N: zones,
  window: {
    __HAPIL_RECOVERY_V31369__: {
      async prepareMap(cache, id) {
        const active = zones[id].map;
        if (/\/rc5[34]\//.test(active)) throw new Error('test-only generated map 404');
        cache[active] = { complete: true, naturalWidth: 10 };
        return true;
      },
    },
  },
  MONGSE_zoneAssetManifest(id) { return new Set([zones[id].map, ...zones[id].mapVariants]); },
  MONGSE_zoneAssetPlan31220(id) {
    const assets = [zones[id].map, ...zones[id].mapVariants];
    return Object.fromEntries(['all', 'A', 'B', 'C', 'deferred', 'pins'].map(key => [key, new Set(assets)]));
  },
};
vm.runInNewContext(mapSource, context);
const mapApi = context.window.__HAPIL_MAP_ART_RC54__;
assert.equal(mapApi.installed, true);
assert.equal(zones.ep1a08.map, `./${hospital}`, 'the hospital route must remain the enclosed RC24 map');
assert.equal(mapApi.originals.ep1a07.fallbackMap, './assets/v31345/maps/dist06.webp',
  'the medieval fall map must not fall back to its old hospital-fragment art');
for (const [id, row] of Object.entries(mapApi.audit()))
  assert(row.active && row.manifest && row.plan && !row.staleMapQueued, `${id} map route or asset plan failed`);

const cache = {};
(async () => {
  assert.equal(await mapApi.prepareMap(cache, 'murder03'), true, 'failed custom map should fall back safely');
  assert.equal(cache[mapApi.rows.murder03], cache[mapApi.originals.murder03.fallbackMap]);
  assert.equal(zones.murder03.map, routes.murder03.replace(/^/, './'));
  assert.equal(await mapApi.prepareMap(cache, 'ep1a07'), true, 'the medieval fall map must have a safe medieval fallback');
  assert.equal(cache[mapApi.rows.ep1a07], cache[mapApi.originals.ep1a07.fallbackMap]);
  assert.equal(mapApi.metrics().fallbackLoads, 2);

  const projectileSource = bundle.slice(projectileStart, rc55Start);
  const legacyProjectile = './assets/generated-v31224/boss-vfx/murder_causality_road.webp';
  const projectileContext = {
    N: { ep1a08: { map: `./${hospital}` }, murder03: { map: `./${routes.murder03}` } },
    window: { __MONGSE_BOSS_VISUAL_PATCH_V31224__: {} },
    MONGSE_resolveBossVisualV31224(actor, zone, signature) {
      return {
        zone: zone || 'murder03', signature, projectile: legacyProjectile,
        telegraph: legacyProjectile, impact: legacyProjectile, major: signature === 'major',
      };
    },
    MONGSE_EXACT_BOSS_VISUAL_PROFILES_V31224: {
      'blue-executor': {
        zone: 'murder03', projectile: legacyProjectile, major: legacyProjectile,
        telegraph: legacyProjectile, impact: legacyProjectile,
      },
    },
    MONGSE_zoneAssetManifest() { return new Set([legacyProjectile]); },
    MONGSE_zoneAssetPlan31220() {
      return Object.fromEntries(['all', 'A', 'B', 'C', 'deferred', 'pins']
        .map(key => [key, new Set([legacyProjectile])]));
    },
  };
  vm.runInNewContext(projectileSource, projectileContext);
  const visualAudit = projectileContext.window.__HAPIL_STORY_VISUAL_RC54__.audit();
  assert.equal(visualAudit.projectileActive, true);
  assert.equal(visualAudit.profileZone, 'murder03');
  assert.equal(visualAudit.manifest && visualAudit.plan, true);
  assert.equal(visualAudit.retiredQueued, false);
  assert.equal(visualAudit.hospitalMapPreserved && visualAudit.modernLoopMapActive, true);
  const resolved = projectileContext.MONGSE_resolveBossVisualV31224({ id: 'blue-executor' }, 'murder03', 'legacy-signature');
  assert.equal(resolved.projectile, projectile);
  assert.equal(resolved.telegraph, projectile);
  assert.equal(resolved.impact, projectile);
  assert.equal(resolved.major, false, 'visual replacement must not alter the major-skill flag');
  const resolvedMajor = projectileContext.MONGSE_resolveBossVisualV31224(
    { id: 'blue-executor' }, 'murder03', 'major');
  assert.equal(resolvedMajor.projectile, projectile);
  assert.equal(resolvedMajor.major, true, 'visual replacement must preserve major-skill state');
  console.log('RC54 STORY VISUAL PASS: 61 story records audited; medieval flashback and murder-city art routes, hospital retention, projectile profile, and fallback verified.');
})().catch(error => { console.error(error); process.exitCode = 1; });
