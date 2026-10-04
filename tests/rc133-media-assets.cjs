#!/usr/bin/env node
'use strict';

// RC133 media checks cover file integrity, decodeability, declared peak QA,
// source provenance, event group wiring, and BGM loop metadata. They do not
// assess semantic audio content or voice gender.

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const PROCESSING_PATH = path.join(ROOT, 'qa/rc133/audio-processing.json');
const MAPPING_PATH = path.join(ROOT, 'qa/rc133/audio-runtime-mapping.json');
const CATALOG_PATH = path.join(ROOT, 'assets/rc133/media-catalog.js');
const SAMPLE_PEAK_LIMIT_DBFS = -1.5;
const TRUE_PEAK_LIMIT_DBTP = -1.0;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function repoFile(relativePath, label) {
  assert.equal(typeof relativePath, 'string', `${label} path must be a string`);
  const normalized = path.posix.normalize(relativePath.replace(/^\.\//, ''));
  assert.ok(normalized && normalized !== '.' && !path.posix.isAbsolute(normalized), `${label} path must be repository-relative: ${relativePath}`);
  assert.ok(normalized !== '..' && !normalized.startsWith('../'), `${label} path escapes the repository: ${relativePath}`);
  return path.join(ROOT, ...normalized.split('/'));
}

function decodeAndMeasure(filePath, label) {
  // This reads and decodes the already-produced file to a null sink; it does
  // not re-render or alter any audio asset.
  const result = spawnSync('ffmpeg', [
    '-hide_banner', '-v', 'info', '-nostats', '-i', filePath,
    '-map', '0:a:0', '-af', 'volumedetect,ebur128=peak=true:framelog=quiet',
    '-f', 'null', '-',
  ], { encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${label} did not decode with FFmpeg:\n${result.stderr || result.stdout}`);
  const log = result.stderr || '';
  const sampleMatch = log.match(/max_volume:\s*(-?\d+(?:\.\d+)?)\s*dB/);
  const trueMatch = log.match(/True peak:\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS/s);
  assert.ok(sampleMatch, `${label} has no FFmpeg sample-peak measurement`);
  assert.ok(trueMatch, `${label} has no FFmpeg true-peak measurement`);
  return {
    samplePeakDbfs: Number(sampleMatch[1]),
    truePeakDbtp: Number(trueMatch[1]),
  };
}

function loadRuntimeCatalog() {
  const window = {};
  const source = fs.readFileSync(CATALOG_PATH, 'utf8');
  vm.runInNewContext(source, { window }, { filename: CATALOG_PATH, timeout: 5000 });
  const catalog = window.__HAPIL_COMBAT_AUDIO_CATALOG_V1__;
  const events = window.__HAPIL_MEDIA_AUDIO_EVENTS_RC133__;
  assert.ok(catalog && catalog.effects && catalog.music, 'runtime media catalog must define effects and music');
  assert.ok(events && typeof events === 'object', 'runtime media catalog must define RC133 event groups');
  return { catalog, events: JSON.parse(JSON.stringify(events)) };
}

const processing = readJson(PROCESSING_PATH);
const mapping = readJson(MAPPING_PATH);
assert.equal(processing.schema, 'hapil-rc133-audio-processing-qa-v1');
assert.equal(processing.summary.originalFileCount, 39);
assert.equal(processing.summary.originalUniqueSha256Count, 31);
assert.equal(processing.summary.duplicateOriginalSha256GroupCount, 8);
assert.equal(processing.summary.playbackDerivativeCount, 28);
assert.equal(processing.summary.sfxDerivativeCount, 23);
assert.equal(processing.summary.bgmDerivativeCount, 5);
assert.equal(processing.summary.voiceOriginalsHeldUnassigned, 3);
assert.equal(processing.summary.allOriginalBytesAndSha256Preserved, true);
assert.equal(processing.summary.allDerivativeDecodedPeaksPassed, true);
assert.equal(processing.summary.runtimeAudioMappingsChanged, false);
assert.equal(mapping.schema, 1);
assert.equal(mapping.processedCandidates, processing.summary.playbackDerivativeCount);

const originalsByName = new Map();
const originalsBySha = new Map();
for (const record of processing.originalRecords) {
  assert.ok(!originalsByName.has(record.originalFilename), `duplicate original record ${record.originalFilename}`);
  originalsByName.set(record.originalFilename, record);
  assert.match(record.originalSha256, /^[a-f0-9]{64}$/, `${record.originalFilename} source SHA-256`);
  assert.equal(record.originalPath, `audio/rc133/originals/${record.originalFilename}`);
  const originalPath = repoFile(record.originalPath, `original ${record.originalFilename}`);
  assert.ok(fs.existsSync(originalPath) && fs.statSync(originalPath).isFile(), `missing preserved original ${record.originalFilename}`);
  assert.equal(fs.statSync(originalPath).size, record.originalBytes, `original byte count ${record.originalFilename}`);
  assert.equal(sha256File(originalPath), record.originalSha256, `original SHA-256 ${record.originalFilename}`);
  const group = originalsBySha.get(record.originalSha256) || [];
  group.push(record);
  originalsBySha.set(record.originalSha256, group);
}
assert.equal(processing.originalRecords.length, 39, 'all original provenance rows must be present');
assert.equal(originalsBySha.size, 31, 'unique original hash accounting');
assert.equal([...originalsBySha.values()].filter(group => group.length > 1).length, 8, 'duplicate original hash group accounting');

const outputByPath = new Map();
const outputBySourceSha = new Map();
for (const output of processing.derivedOutputs) {
  assert.ok(!outputByPath.has(output.derivedPath), `duplicate derived path ${output.derivedPath}`);
  outputByPath.set(output.derivedPath, output);
  assert.match(output.derivedSha256, /^[a-f0-9]{64}$/, `${output.derivedPath} output SHA-256`);
  assert.match(output.sourceSha256, /^[a-f0-9]{64}$/, `${output.derivedPath} source SHA-256`);
  assert.equal(outputBySourceSha.has(output.sourceSha256), false, `more than one derivative for original SHA ${output.sourceSha256}`);
  outputBySourceSha.set(output.sourceSha256, output);

  const actualPath = repoFile(output.derivedPath, `derived ${output.derivedPath}`);
  assert.ok(fs.existsSync(actualPath) && fs.statSync(actualPath).isFile(), `missing derived file ${output.derivedPath}`);
  assert.equal(fs.statSync(actualPath).size, output.derivedBytes, `derived byte count ${output.derivedPath}`);
  assert.equal(sha256File(actualPath), output.derivedSha256, `derived SHA-256 ${output.derivedPath}`);

  const limits = output.peakLimits;
  const listed = output.decodedOutputMeasurements;
  assert.equal(limits.passed, true, `${output.derivedPath} listed peak pass`);
  assert.equal(limits.requiredSamplePeakMaximumDbfs, SAMPLE_PEAK_LIMIT_DBFS);
  assert.equal(limits.requiredTruePeakMaximumDbtp, TRUE_PEAK_LIMIT_DBTP);
  assert.ok(Number.isFinite(listed.decoded_sample_peak_dbfs), `${output.derivedPath} listed sample peak`);
  assert.ok(Number.isFinite(listed.decoded_true_peak_dbtp), `${output.derivedPath} listed true peak`);
  assert.ok(listed.decoded_sample_peak_dbfs <= SAMPLE_PEAK_LIMIT_DBFS, `${output.derivedPath} listed sample peak exceeds bound`);
  assert.ok(listed.decoded_true_peak_dbtp <= TRUE_PEAK_LIMIT_DBTP, `${output.derivedPath} listed true peak exceeds bound`);

  const decoded = decodeAndMeasure(actualPath, output.derivedPath);
  assert.ok(decoded.samplePeakDbfs <= SAMPLE_PEAK_LIMIT_DBFS, `${output.derivedPath} decoded sample peak exceeds bound: ${decoded.samplePeakDbfs} dBFS`);
  assert.ok(decoded.truePeakDbtp <= TRUE_PEAK_LIMIT_DBTP, `${output.derivedPath} decoded true peak exceeds bound: ${decoded.truePeakDbtp} dBTP`);
  assert.ok(Math.abs(decoded.samplePeakDbfs - listed.decoded_sample_peak_dbfs) <= 0.11, `${output.derivedPath} decoded sample peak differs from QA record`);
  assert.ok(Math.abs(decoded.truePeakDbtp - listed.decoded_true_peak_dbtp) <= 0.11, `${output.derivedPath} decoded true peak differs from QA record`);
}
assert.equal(processing.derivedOutputs.length, 28);
assert.equal(outputBySourceSha.size, 28, 'each nonvoice source SHA must have one derivative');
assert.equal([...processing.derivedOutputs].filter(output => output.derivedFormat === 'OGG Opus').length, 23);
assert.equal([...processing.derivedOutputs].filter(output => output.derivedFormat === 'MP3').length, 5);

// Each exact duplicate source group retains all original aliases and points to
// one shared derivative (or remains wholly unassigned when a held voice).
for (const [sourceSha, group] of originalsBySha) {
  const categories = new Set(group.map(record => record.candidateCategory));
  assert.equal(categories.size, 1, `duplicate source SHA has conflicting candidate categories: ${sourceSha}`);
  const isHeldVoice = group[0].candidateCategory === 'candidate_combat_vocal_unassigned';
  const output = outputBySourceSha.get(sourceSha);
  if (isHeldVoice) {
    assert.equal(output, undefined, `held voice source must not have a derivative: ${sourceSha}`);
    for (const record of group) {
      assert.equal(record.playbackDerivative.derivedPath, null, `${record.originalFilename} must remain unassigned`);
    }
    continue;
  }
  assert.ok(output, `missing derivative for nonvoice original SHA ${sourceSha}`);
  assert.equal(output.sourceSha256, sourceSha);
  assert.deepEqual(new Set(group.map(record => record.playbackDerivative.derivedPath)), new Set([output.derivedPath]));
  assert.deepEqual(new Set(output.sameSha256OriginalFilenames), new Set(group.map(record => record.originalFilename)));
  assert.ok(group.some(record => record.originalFilename === output.sourceOriginalFilename), `${sourceSha} representative must be a preserved original`);
  if (group.length > 1) {
    assert.ok(group.slice(1).every(record => record.playbackDerivative.status.includes('deduplicated')), `${sourceSha} duplicate playback aliases must be identified`);
  }
}

const heldVoiceNames = processing.originalRecords
  .filter(record => record.candidateCategory === 'candidate_combat_vocal_unassigned')
  .map(record => record.originalFilename)
  .sort();
assert.equal(heldVoiceNames.length, 3);
assert.deepEqual(heldVoiceNames, [...mapping.heldVoices].sort());
for (const name of heldVoiceNames) {
  const record = originalsByName.get(name);
  assert.equal(record.playbackDerivative.derivedPath, null, `${name} must not receive a playback derivative`);
  assert.equal(record.perceivedVoiceGender, null, `${name} must not have a voice-gender claim`);
  assert.equal(record.wordsOrTranscript, null, `${name} must not have transcript content`);
  assert.equal(record.auditioned, false, `${name} must remain unauditioned`);
  assert.equal(outputBySourceSha.has(record.originalSha256), false, `${name} must not enter runtime provenance`);
}

const { catalog, events: catalogEvents } = loadRuntimeCatalog();
assert.equal(Object.keys(catalog.music).length, 5, 'runtime BGM catalog count');
assert.equal(Object.keys(mapping.music).length, 5, 'runtime mapping BGM count');
assert.deepEqual(Object.keys(catalog.music).sort(), Object.keys(mapping.music).sort(), 'runtime BGM keys must match mapping QA');

function assertCatalogEntry(entry, label, expectedFormat) {
  assert.ok(entry && typeof entry === 'object', `${label} must be a catalog object`);
  assert.match(entry.sha256, /^[a-f0-9]{64}$/, `${label} derivative SHA-256`);
  assert.match(entry.sourceSha256, /^[a-f0-9]{64}$/, `${label} source SHA-256`);
  const output = outputByPath.get(path.posix.normalize(String(entry.path).replace(/^\.\//, '')));
  assert.ok(output, `${label} path must appear in audio-processing QA`);
  assert.equal(entry.sha256, output.derivedSha256, `${label} catalog derivative SHA-256`);
  assert.equal(entry.sourceSha256, output.sourceSha256, `${label} catalog source SHA-256`);
  assert.ok(originalsBySha.has(entry.sourceSha256), `${label} provenance must reference a preserved original SHA`);
  assert.equal(output.derivedFormat, expectedFormat, `${label} derivative format`);
  const actualPath = repoFile(entry.path, label);
  assert.equal(sha256File(actualPath), entry.sha256, `${label} actual runtime file SHA-256`);
  assert.ok(Number.isFinite(entry.gain) && entry.gain > 0, `${label} gain must be positive and finite`);
  assert.ok(Number.isFinite(entry.duration) && entry.duration > 0, `${label} duration must be positive and finite`);
  return output;
}

const catalogEffectKinds = Object.keys(catalog.effects);
assert.ok(catalogEffectKinds.length >= 30, 'runtime effect catalog must include RC133 effects');
for (const kind of catalogEffectKinds) {
  const entry = catalog.effects[kind];
  const output = assertCatalogEntry(entry, `effect ${kind}`, 'OGG Opus');
  assert.ok(typeof entry.group === 'string' && entry.group.trim(), `effect ${kind} needs a runtime group`);
  assert.ok(Number.isFinite(entry.cooldown) && entry.cooldown >= 0, `effect ${kind} cooldown must be nonnegative`);
  assert.ok(Number.isInteger(entry.voices) && entry.voices > 0, `effect ${kind} voices must be a positive integer`);
  assert.equal(entry.path.endsWith('.ogg'), true, `effect ${kind} must point to OGG Opus`);
  assert.ok(output.candidateEventAndLimits, `effect ${kind} must retain candidate limits in processing QA`);
}

for (const [key, entry] of Object.entries(catalog.music)) {
  const output = assertCatalogEntry(entry, `music ${key}`, 'MP3');
  assert.equal(entry.path.endsWith('.mp3'), true, `music ${key} must point to MP3`);
  assert.ok(Number.isFinite(entry.loopStart) && entry.loopStart >= 0, `music ${key} loop start`);
  assert.ok(Number.isFinite(entry.loopEnd) && entry.loopEnd > entry.loopStart, `music ${key} loop end`);
  assert.ok(entry.loopEnd <= entry.duration, `music ${key} loop end must not exceed declared duration`);
  assert.ok(Number.isFinite(entry.crossfade) && entry.crossfade > 0 && entry.crossfade <= entry.loopEnd - entry.loopStart, `music ${key} crossfade`);
  assert.ok(Math.abs(entry.duration - output.derivedProbe.duration_seconds) <= 0.01, `music ${key} declared duration must match FFprobe`);
  const mapped = mapping.music[key];
  assert.equal(path.posix.normalize(String(mapped.path).replace(/^\.\//, '')), path.posix.normalize(String(entry.path).replace(/^\.\//, '')), `music ${key} mapping path`);
  assert.equal(mapped.sha256, entry.sha256, `music ${key} mapping derivative SHA-256`);
  assert.equal(mapped.sourceSha256, entry.sourceSha256, `music ${key} mapping source SHA-256`);
  assert.equal(mapped.duration, entry.duration, `music ${key} mapping duration`);
}

assert.equal(mapping.assignments.length, 29, 'nonvoice assignments; generic guard retains its native sound');
const assignmentKinds = new Set();
const assignmentsByEvent = new Map();
for (const assignment of mapping.assignments) {
  assert.ok(!assignmentKinds.has(assignment.kind), `duplicate runtime assignment kind ${assignment.kind}`);
  assignmentKinds.add(assignment.kind);
  const entry = catalog.effects[assignment.kind];
  assert.ok(entry, `runtime assignment ${assignment.kind} must exist in effect catalog`);
  assert.equal(path.posix.normalize(String(assignment.path).replace(/^\.\//, '')), path.posix.normalize(String(entry.path).replace(/^\.\//, '')), `${assignment.kind} assignment path`);
  assert.equal(assignment.sourceSha256, entry.sourceSha256, `${assignment.kind} assignment provenance SHA-256`);
  const group = assignmentsByEvent.get(assignment.event) || [];
  group.push(assignment.kind);
  assignmentsByEvent.set(assignment.event, group);
}
assert.deepEqual(Object.keys(mapping.events).sort(), [...assignmentsByEvent.keys()].sort(), 'event group names must match assigned events');
assert.deepEqual(Object.keys(catalogEvents).sort(), Object.keys(mapping.events).sort(), 'runtime event groups must match mapping QA');
for (const [event, kinds] of Object.entries(mapping.events)) {
  assert.ok(Array.isArray(kinds) && kinds.length > 0, `${event} event group must be nonempty`);
  assert.equal(new Set(kinds).size, kinds.length, `${event} event group must not repeat a kind`);
  assert.deepEqual(kinds, assignmentsByEvent.get(event), `${event} event group must match assignment order`);
  assert.deepEqual(catalogEvents[event], kinds, `${event} runtime catalog group must match mapping QA`);
  for (const kind of kinds) assert.ok(catalog.effects[kind], `${event} references missing effect ${kind}`);
}

console.log('RC133 media asset QA passed:', JSON.stringify({originals:processing.originalRecords.length,derivatives:processing.derivedOutputs.length,effects:Object.keys(catalog.effects).length,music:Object.keys(catalog.music).length,assignments:mapping.assignments.length}));
console.log('Checks cover byte/hash integrity, FFmpeg decode and listed peak bounds, source-SHA provenance, duplicate playback aliases, held voice status, event groups, and BGM metadata. No audio was auditioned and no voice/gender classification was performed.');
