const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const storyWindow = {};
vm.runInNewContext(read('data/story-rc51.js'), { window: storyWindow });
const story = storyWindow.__HAPIL_STORY_DATA_RC51__;
const records = story.records;
assert.equal(records.length, 61, 'the authored story route must retain all 61 records');
assert.equal(new Set(records.map(record => record.zone)).size, 61,
  'each story card must still belong to one unique zone');
assert.deepEqual(JSON.parse(JSON.stringify(records.filter(record => /^murder0[1-4]$/.test(record.zone))
  .map(record => record.zone))), ['murder01', 'murder02', 'murder04', 'murder03'],
  'the loop must follow crosswalk → hotel → villa → rooftop');

const bundle = read('assets/index-v31526.js');
const html = read('index.html');
assert.match(html, /index-v31526\.js\?v=36201/,
  'the active bundle URL must invalidate the prior browser cache');
const marker = '/* RC56: restore the enclosed HELP ME ward';
const start = bundle.indexOf(marker);
assert(start >= 0, 'RC56 map-route bridge is missing');
const source = bundle.slice(start, bundle.indexOf('/* RC59:', start));
const paths = {
  ep1a08: './assets/maps/ep1a_08_blood_hospital_rc24.png',
  murder03: './assets/maps/rc56/murder03-rooftop-loop.webp',
};
const fallbackPaths = {
  ep1a08: './assets/v31345/maps/ep1a08.webp',
  murder03: './assets/maps/murder_03_rooftop_loop.jpg',
};
const zones = {
  ep1a08: {map: fallbackPaths.ep1a08, mapVariants: ['./assets/v31345/maps/ep1a08-alt.webp']},
  murder03: {map: './assets/maps/rc54/murder03-loop-crosswalk.webp', mapVariants: ['./assets/maps/rc54/murder03-alt.webp']},
};
const emptyPlan = assets => Object.fromEntries(
  ['all', 'A', 'B', 'C', 'deferred', 'pins'].map(key => [key, new Set(assets)]),
);
const context = {
  N: zones,
  window: {
    __HAPIL_MAP_ART_RC54__: {
      originals: {murder03: {fallbackMap: fallbackPaths.murder03}},
    },
    __HAPIL_RECOVERY_V31369__: {
      async prepareMap(cache, id) {
        const active = zones[id].map;
        if (active === paths[id]) throw new Error('simulated primary-map load failure');
        cache[active] = {complete: true, naturalWidth: 1586, naturalHeight: 992};
        return true;
      },
    },
  },
  MONGSE_zoneAssetManifest(id) {
    return new Set([zones[id].map, ...(zones[id].mapVariants ?? [])]);
  },
  MONGSE_zoneAssetPlan31220(id) {
    return emptyPlan([zones[id].map, ...(zones[id].mapVariants ?? [])]);
  },
};
vm.runInNewContext(source, context);
const api = context.window.__HAPIL_MAP_ART_RC56__;
assert(api?.installed, 'RC56 must install the final map routes');
const audit = api.audit();
for (const [id, row] of Object.entries(audit)) {
  assert(row.active && row.manifest && row.plan && row.fallbackManifest,
    `${id} route or fallback is missing from its asset plan`);
  assert.equal(row.staleMapQueued, false, `${id} still queues its replaced map`);
  assert.equal(zones[id].map, paths[id], `${id} did not activate the intended map`);
}

const hospital = fs.readFileSync(path.join(root, paths.ep1a08));
assert.deepEqual([...hospital.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10],
  'the enclosed HELP ME ward must remain a readable PNG asset');
const rooftop = fs.readFileSync(path.join(root, paths.murder03));
assert.equal(rooftop.toString('ascii', 0, 4), 'RIFF');
assert.equal(rooftop.toString('ascii', 8, 12), 'WEBP');
assert(rooftop.length > 100_000, 'the rooftop map image should not be a placeholder');
for (const fallback of Object.values(fallbackPaths))
  assert(fs.existsSync(path.join(root, fallback)), `fallback map is missing: ${fallback}`);

const cache = {};
(async () => {
  for (const id of Object.keys(paths)) {
    assert.equal(await api.prepareMap(cache, id), true,
      `${id} should recover if its primary map fails to load`);
    assert.equal(cache[paths[id]], cache[fallbackPaths[id]],
      `${id} failed map should alias its verified fallback image`);
    assert.equal(zones[id].map, paths[id],
      `${id} active route should be restored after fallback loading`);
  }
  assert.equal(api.metrics().fallbackLoads, 2);

  const idList = bundle.match(/var HAPIL_RC13_BOSS_IDS=(\[[\s\S]*?\]);/);
  assert(idList, 'the full boss catalog should remain available');
  const bossIds = JSON.parse(idList[1]);
  assert.equal(bossIds.length, 72, 'all boss encounters must remain catalogued');
  assert.equal(new Set(bossIds).size, 72, 'boss encounter IDs must not collide');
  console.log('RC56 PASS: story sequence, route fallbacks, maps, and 72 unique boss IDs verified.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
