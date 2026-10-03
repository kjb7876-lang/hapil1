'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const crypto = require('node:crypto'), assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'assets/story-narration/v1/manifest.json'), base = path.dirname(file);
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
const read = name => fs.readFileSync(path.join(root, name));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const plain = text => text.replace(/\s+/g, '');
const sorted = values => Array.from(values).sort();
const positive = value => Number.isFinite(value) && value > 0;
const digestPattern = /^[a-f0-9]{64}$/;
assert.equal(manifest.version, 1);
assert.equal(hash(read('data/story-rc51.js')), manifest.sourceSha256, 'canonical source changed: regenerate affected audio before release');

// The source still defines every route and canonical unit, even for a partial release.
const context = {window: {}};
vm.runInNewContext(read('data/story-rc51.js').toString(), context);
const data = context.window.__HAPIL_STORY_DATA_RC51__, units = {}, expected = {};
const addRoute = (key, text, clips, requiredUnits) => { assert(!expected[key], `duplicate route: ${key}`); expected[key] = {text, clips, requiredUnits}; };
for (const record of data.records) for (const phase of ['pre', 'post', 'firstPost', 'awakenPre']) {
  if (record.zone !== 'dist00' && record[phase]) {
    units[`${record.zone}.${phase}`] = record[phase];
    addRoute(`${record.zone}:${phase}`, record[phase], [record[phase]], [`${record.zone}.${phase}`]);
  }
}
assert.equal(Object.keys(units).length, 110, 'canonical combat unit count');
const first = data.records.find(record => record.zone === 'dist00');
assert.equal(first.paragraphs.length, 3, 'canonical supplemental journal paragraphs');
first.paragraphs.forEach((text, i) => { units[`journal.dist00.p${i + 1}`] = text; });
const html = read('index.html').toString();
const stanza = cls => {
  const match = html.match(new RegExp('<p class="' + cls + '">([\\s\\S]*?)</p>'));
  assert(match, `missing canonical prologue text: ${cls}`);
  return match[1].replace(/<br\s*\/?>/g, '\n');
};
units['prologue.passing'] = stanza('mongse-christian-opening__passing');
units['prologue.awakening'] = stanza('mongse-christian-opening__awakening');
const bundle = read('assets/index-v31526.js').toString();
const death = bundle.slice(bundle.indexOf('function HAPIL_showDeathVerseRC59('), bundle.indexOf('\n(function HAPIL_installEpisode1DeathAndMidbossDuoRC59'));
for (const name of ['title', 'verse1', 'verse2']) {
  const match = death.match(new RegExp(name + "\\.textContent='([^']*)'"));
  assert(match, `missing canonical death text: ${name}`);
  units[`death.${name}`] = match[1];
}
const title = read('assets/hapil-title-v31342.js').toString();
const ending = title.match(/const values = phase==='ending-title'[^?]+\? \['[^']*','[^']*','([^']*)'\]/);
assert(ending, 'missing canonical ending text');
units['ending.title'] = ending[1];
for (const [key, ids] of [
  ['prologue:quote', ['prologue.passing', 'prologue.awakening']],
  ['death:verse', ['death.title', 'death.verse1', 'death.verse2']],
  ['ending:title', ['ending.title']]
]) {
  const clips = ids.map(id => units[id]);
  addRoute(key, clips.join('\n\n'), clips, ids);
}
assert.equal(Object.keys(units).length, 119, 'canonical unit count');

const originalText = {}, originalVoices = data.openingVoice;
assert.deepEqual(sorted(Object.keys(manifest.originals)), ['dist00.post', 'dist00.pre'], 'both immutable original performances are required');
for (const [key, voice] of Object.entries(originalVoices)) {
  const id = key === 'opening' ? 'dist00.pre' : 'dist00.post', entry = manifest.originals[id];
  originalText[id] = voice.paragraphs.join('\n\n');
  assert.equal(path.resolve(base, entry.audio), path.resolve(root, voice.audio), `original path changed: ${id}`);
  assert.equal(entry.legacy, true); assert(positive(entry.duration), `invalid original duration: ${id}`);
  assert.equal(hash(fs.readFileSync(path.resolve(base, entry.audio))), entry.sha256, `original recording bytes changed: ${id}`);
}
const immutableFiles = ['assets/rc49/story-voice.js', 'data/opening-voice-rc74.json'];
assert.deepEqual(sorted(Object.keys(manifest.immutable || {})), sorted(immutableFiles), 'original runtime and transcript contracts must be pinned');
for (const name of immutableFiles) assert.equal(hash(read(name)), manifest.immutable[name], `immutable original contract changed: ${name}`);

// Journal entries can cross combat-card boundaries (notably dist05). Reconstruct
// their complete ordered clips from canonical paragraphs, never from package claims.
const paragraphs = new Map();
for (const text of Object.values(units)) for (const part of text.split(/\n\s*\n/)) paragraphs.set(hash(part), part);
const paragraphCandidates = Array.from(paragraphs.values()).sort((a, b) => plain(b).length - plain(a).length);
function journalClips(text, key) {
  let remaining = plain(text); const clips = [];
  while (remaining) {
    const part = paragraphCandidates.find(candidate => remaining.startsWith(plain(candidate)));
    assert(part, `journal text has no complete canonical clip: ${key}`);
    clips.push(part); remaining = remaining.slice(plain(part).length);
  }
  return clips;
}
const hubText = Object.values(originalVoices).map(voice => [voice.title, ...voice.paragraphs].join('\n\n')).join('\n\n');
for (const tab of ['all', 'body']) addRoute(`journal:hub:${tab}`, hubText, Object.values(originalText));
for (const record of data.records) for (const tab of ['all', 'entry', 'body']) {
  const parts = tab === 'all' ? Array.from(record.paragraphs) : tab === 'entry' ? record.paragraphs.slice(0, 1) : record.paragraphs.slice(1);
  const text = parts.join('\n\n'), key = `journal:${record.zone}:${tab}`;
  if (text) addRoute(key, text, journalClips(text, key));
}
assert.equal(Object.keys(expected).length, 297, 'canonical live route count');
assert.equal(Object.keys(expected).filter(key => key.startsWith('journal:')).length, 184);

const coverage = manifest.coverage;
assert(coverage && ['partial', 'complete'].includes(coverage.mode), 'explicit partial/complete coverage is required');
assert.equal(coverage.canonicalUnits, 119); assert.equal(coverage.totalRoutes, 297);
function partition(included, pending, canonical, label) {
  assert(Array.isArray(included) && Array.isArray(pending), `${label} partition must use arrays`);
  assert.equal(new Set(included).size, included.length, `duplicate included ${label}`);
  assert.equal(new Set(pending).size, pending.length, `duplicate pending ${label}`);
  assert(included.every(key => !pending.includes(key)), `included and pending ${label} overlap`);
  assert.deepEqual(sorted([...included, ...pending]), sorted(canonical), `exact canonical ${label} partition`);
}
partition(coverage.includedUnits, coverage.pendingUnits, Object.keys(units), 'units');
partition(Object.keys(manifest.scenes), coverage.pendingRoutes, Object.keys(expected), 'routes');
assert.equal(coverage.includedRoutes, Object.keys(manifest.scenes).length);
assert.equal(coverage.mode, coverage.pendingUnits.length || coverage.pendingRoutes.length ? 'partial' : 'complete', 'coverage mode must reflect all pending work');

const includedTexts = new Map(), includedParagraphs = new Set();
for (const id of coverage.includedUnits) {
  const text = units[id]; includedTexts.set(hash(text), text);
  for (const part of text.split(/\n\s*\n/)) { includedTexts.set(hash(part), part); includedParagraphs.add(hash(part)); }
}
const audioDirectory = path.join(base, 'audio');
const packagedAudio = fs.existsSync(audioDirectory) ? fs.readdirSync(audioDirectory, {withFileTypes: true}) : [];
assert(packagedAudio.every(entry => entry.isFile() && entry.name.endsWith('.mp3')), 'audio directory must contain only final MP3 files');
assert.deepEqual(sorted(packagedAudio.map(entry => `audio/${entry.name}`)), sorted(Object.keys(manifest.assets)), 'every packaged audio file must be tracked by the accepted manifest');
const assetTextHashes = new Set(), probes = new Map();
for (const [name, row] of Object.entries(manifest.assets)) {
  assert(/^audio\/[A-Za-z0-9._-]+\.mp3$/.test(name), `unsafe audio path: ${name}`);
  assert(digestPattern.test(row.sha256) && digestPattern.test(row.textSha256), `invalid hashes: ${name}`);
  const audioFile = path.join(base, name), bytes = fs.readFileSync(audioFile);
  assert(Number.isInteger(row.bytes) && row.bytes > 0 && row.bytes < 5000000, `unbounded asset: ${name}`);
  assert.equal(bytes.length, row.bytes, `byte count differs: ${name}`);
  assert.equal(hash(bytes), row.sha256, `audio bytes changed: ${name}`);
  assert(positive(row.duration), `invalid duration: ${name}`);
  assert.equal(row.codec, 'mp3'); assert.equal(row.bitRate, 128000); assert.equal(row.sampleRate, 24000); assert.equal(row.channels, 1);
  assert.equal(row.endingProfile, 'ending-context-v1', `final articulation checks missing: ${name}`);
  assert(includedTexts.has(row.textSha256), `asset outside included canonical units: ${name}`);
  if (!probes.has(row.sha256)) {
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,sample_rate,channels,bit_rate:format=duration', '-of', 'json', audioFile], {encoding: 'utf8'}));
    assert.equal(probe.streams.length, 1, `unexpected stream count: ${name}`);
    const stream = probe.streams[0];
    assert.equal(stream.codec_name, 'mp3'); assert.equal(Number(stream.bit_rate), 128000); assert.equal(Number(stream.sample_rate), 24000); assert.equal(stream.channels, 1);
    probes.set(row.sha256, Number(probe.format.duration));
  }
  assert(Math.abs(probes.get(row.sha256) - row.duration) < .02, `actual MP3 duration differs: ${name}`);
  assetTextHashes.add(row.textSha256);
}
for (const [sha, text] of includedTexts) assert(assetTextHashes.has(sha), `included unit is missing a complete scene/paragraph asset: ${text.slice(0, 50)}`);

const includedUnitIds = new Set(coverage.includedUnits);
const available = Object.entries(expected).filter(([key, route]) => {
  if (key.startsWith('journal:hub:')) return true;
  if (route.requiredUnits && !route.requiredUnits.every(id => includedUnitIds.has(id))) return false;
  return route.clips.every(text => (key.startsWith('journal:') ? includedParagraphs.has(hash(text)) : includedTexts.has(hash(text))) && assetTextHashes.has(hash(text)));
}).map(([key]) => key);
assert.deepEqual(sorted(Object.keys(manifest.scenes)), sorted(available), 'include every available complete route and no incomplete playlist');
for (const [key, row] of Object.entries(manifest.scenes)) {
  const route = expected[key];
  assert.equal(row.textSha256, hash(route.text), `exact live text mismatch: ${key}`);
  assert(!(row.audio && row.clips), `ambiguous route shape: ${key}`);
  const clips = row.clips || [row]; assert(Array.isArray(clips) && clips.length, `empty playlist: ${key}`);
  const spoken = [];
  for (const clip of clips) {
    if (clip.legacy) {
      const original = Object.entries(manifest.originals).find(([, entry]) => entry.audio === clip.audio);
      assert(original, `untracked original: ${key}`);
      assert.equal(clip.sha256, original[1].sha256); assert.equal(clip.duration, original[1].duration);
      spoken.push(originalText[original[0]]);
    } else {
      const asset = manifest.assets[clip.audio]; assert(asset, `untracked asset: ${key}`);
      assert.equal(clip.sha256, asset.sha256, `clip hash mismatch: ${key}`);
      assert.equal(clip.duration, asset.duration, `clip duration mismatch: ${key}`);
      spoken.push(includedTexts.get(asset.textSha256));
    }
  }
  assert.deepEqual(spoken, route.clips, `complete playlist order/content differs: ${key}`);
}
console.log(JSON.stringify({pass: true, mode: coverage.mode, canonicalUnits: 119, includedUnits: coverage.includedUnits.length, pendingUnits: coverage.pendingUnits.length, canonicalRoutes: 297, includedRoutes: Object.keys(manifest.scenes).length, pendingRoutes: coverage.pendingRoutes.length, newCombatCards: 110, journalTabs: 184, supplementalSurfaces: 3, audioFiles: Object.keys(manifest.assets).length, originalsUnchanged: 2, totalAudioBytes: Object.values(manifest.assets).reduce((n, row) => n + row.bytes, 0)}, null, 2));
