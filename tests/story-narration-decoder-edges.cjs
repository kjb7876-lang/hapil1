'use strict';

// Read-only codec diagnostic. Run with node; --validate-fixture needs no browser.
// The fixture is independent FFmpeg mp3float output from the EXACT published MP3
// bytes, including their gapless metadata. It is not a WAV-master comparison.
// A pass establishes decoded edge-signal preservation, not phoneme completeness,
// audible output, device behavior, HTMLMediaElement playback, or listening QA.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const assetRoot = path.join(root, 'assets/story-narration/v1');
const fixturePath = path.join(__dirname, 'fixtures/story-narration-decoder-edges.json');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const CONFIG = Object.freeze({
  sampleRate: 24000, channels: 1, bitRate: 128000,
  edgeSeconds: 1, frameSeconds: .01,
  activityFrameSeconds: .005, activityRms: .0015, activityPeak: .00316,
  activityUncertainty: .03,
  probeSeconds: .001, probeCount: 256, probeSearchBins: 64
});
// Fixed numerical tolerances, shared by every asset. No file-specific exceptions.
// 24 kHz permits small floating-point MP3-decoder differences. Native-rate checks
// permit resampling-filter differences after 1 ms box averaging, while retaining
// strict length/timing and 10 ms energy checks. A +/-64 ms lag search is diagnostic
// only: it NEVER realigns samples to turn a failure into a pass.
const TOLERANCES = Object.freeze({
  fixed: {lengthSamples: 0, rmsRelative: .005, peakRelative: .01, probeNrmse: .005, probeCorrelation: .99998, activityFrames: 0},
  native: {lengthSamples: 1, energyEnvelopeNrmse: .05, probeNrmse: .12, probeCorrelation: .992},
  energyFloor: .001, probeFloor: .0001, absoluteSampleError: .000005
});

// This function is self-contained so the exact same measurement code executes in
// Node (FFmpeg fixture and detector controls) and Chromium (decodeAudioData).
function signature(samples, sampleRate, config, referenceAnchors, searchBins = 0) {
  const n = samples.length;
  const round = x => Number(x.toPrecision(8));
  const stats = (start, end) => {
    start = Math.max(0, Math.round(start)); end = Math.min(n, Math.round(end));
    let squares = 0, peak = 0;
    for (let i = start; i < end; i++) { squares += samples[i] * samples[i]; peak = Math.max(peak, Math.abs(samples[i])); }
    return [round(Math.sqrt(squares / Math.max(1, end - start))), round(peak)];
  };
  let finite = true, firstAboveThreshold = null, lastAboveThreshold = null;
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(samples[i])) finite = false;
    if (Math.abs(samples[i]) > config.activityPeak) {
      if (firstAboveThreshold === null) firstAboveThreshold = i;
      lastAboveThreshold = i;
    }
  }
  const activity = [1 - config.activityUncertainty, 1, 1 + config.activityUncertainty].map(() => ({firstFrame: null, lastFrame: null}));
  for (let frame = 0; frame * config.activityFrameSeconds * sampleRate < n; frame++) {
    const [rms, peak] = stats(frame * config.activityFrameSeconds * sampleRate, (frame + 1) * config.activityFrameSeconds * sampleRate);
    [1 - config.activityUncertainty, 1, 1 + config.activityUncertainty].forEach((scale, index) => {
      if (rms > config.activityRms * scale || peak > config.activityPeak * scale) {
        if (activity[index].firstFrame === null) activity[index].firstFrame = frame;
        activity[index].lastFrame = frame;
      }
    });
  }
  const actual = activity[1];
  const anchorSpan = config.probeSeconds * config.probeCount;
  const anchorStarts = referenceAnchors || [
    Math.max(0, (actual.firstFrame || 0) * config.activityFrameSeconds - config.activityFrameSeconds),
    Math.max(0, Math.min(n / sampleRate - anchorSpan, ((actual.lastFrame || 0) + 1) * config.activityFrameSeconds + config.activityFrameSeconds - anchorSpan))
  ].map(round);
  // Fractional sample weighting keeps the physical averaging intervals identical
  // at 24, 44.1, 48 kHz, or any other native AudioContext rate. It is a measurement,
  // not a second browser audio/render/recorder graph that could add buffering.
  const average = (startSeconds, endSeconds) => {
    const start = startSeconds * sampleRate, end = endSeconds * sampleRate;
    let sum = 0;
    for (let i = Math.max(0, Math.floor(start)); i < Math.min(n, Math.ceil(end)); i++) {
      sum += samples[i] * Math.max(0, Math.min(i + 1, end) - Math.max(i, start));
    }
    return round(sum / (end - start));
  };
  const probes = anchorStarts.map(start => Array.from({length: config.probeCount + 2 * searchBins}, (_, i) => {
    const offset = (i - searchBins) * config.probeSeconds;
    return average(start + offset, start + offset + config.probeSeconds);
  }));
  const frames = Math.ceil(config.edgeSeconds / config.frameSeconds);
  const edges = [0, Math.max(0, n / sampleRate - config.edgeSeconds)].map(start => {
    const rms = [], peak = [];
    for (let i = 0; i < frames; i++) {
      const values = stats((start + i * config.frameSeconds) * sampleRate, (start + (i + 1) * config.frameSeconds) * sampleRate);
      rms.push(values[0]); peak.push(values[1]);
    }
    return {rms, peak};
  });
  return {sampleRate, sampleCount: n, finite, firstAboveThreshold, lastAboveThreshold,
    activity, anchorStarts, searchBins, probes, edges,
    firstSamples: Array.from(samples.subarray(0, 16), round), lastSamples: Array.from(samples.subarray(Math.max(0, n - 16)), round)};
}

function probeFit(reference, actual, offset) {
  let rr = 0, aa = 0, ra = 0, error = 0;
  for (let i = 0; i < reference.length; i++) {
    const r = reference[i], a = actual[offset + i] || 0;
    rr += r * r; aa += a * a; ra += r * a; error += (r - a) ** 2;
  }
  const referenceRms = Math.sqrt(rr / reference.length);
  return {referenceRms, nrmse: Math.sqrt(error / reference.length) / Math.max(referenceRms, TOLERANCES.probeFloor),
    correlation: rr && aa ? ra / Math.sqrt(rr * aa) : rr === aa ? 1 : 0};
}

function compare(reference, actual, mode) {
  const tolerance = TOLERANCES[mode], failures = [], metrics = {};
  if (!actual.finite) failures.push('non-finite PCM');
  const expectedLength = reference.sampleCount * actual.sampleRate / reference.sampleRate;
  metrics.lengthDeltaSamples = actual.sampleCount - expectedLength;
  metrics.lengthDeltaAt24k = metrics.lengthDeltaSamples * CONFIG.sampleRate / actual.sampleRate;
  metrics.firstThresholdDeltaSeconds = actual.firstAboveThreshold === null || reference.firstAboveThreshold === null ? null : actual.firstAboveThreshold / actual.sampleRate - reference.firstAboveThreshold / reference.sampleRate;
  metrics.lastThresholdDeltaSeconds = actual.lastAboveThreshold === null || reference.lastAboveThreshold === null ? null : actual.lastAboveThreshold / actual.sampleRate - reference.lastAboveThreshold / reference.sampleRate;
  // Native conversion can round by one destination sample, never one MP3 frame.
  if (Math.abs(metrics.lengthDeltaSamples) > tolerance.lengthSamples + 1e-7) failures.push('decoded sample count');
  for (let edge = 0; edge < 2; edge++) {
    const label = edge === 0 ? 'head' : 'tail';
    for (const kind of ['rms', 'peak']) {
      const expected = reference.edges[edge][kind], measured = actual.edges[edge][kind];
      const maxRelative = Math.max(...expected.map((value, i) => Math.abs(value - measured[i]) / Math.max(value, TOLERANCES.energyFloor)));
      metrics[`${label}${kind === 'rms' ? 'Rms' : 'Peak'}Error`] = maxRelative;
      if (mode === 'fixed' && maxRelative > tolerance[kind === 'rms' ? 'rmsRelative' : 'peakRelative']) failures.push(`${label} 10 ms ${kind} fingerprint`);
      if (kind === 'rms') {
        const energy = expected.reduce((sum, value) => sum + value * value, 0);
        const error = expected.reduce((sum, value, i) => sum + (value - measured[i]) ** 2, 0);
        const envelopeNrmse = Math.sqrt(error / Math.max(energy, expected.length * TOLERANCES.energyFloor ** 2));
        metrics[`${label}EnergyEnvelopeNrmse`] = envelopeNrmse;
        // Upsampling changes sampled peaks (inter-sample peaks become samples),
        // and tiny bin-boundary/filter changes can dominate a quiet individual
        // frame. Compare the physical RMS envelope jointly at native rate.
        if (mode === 'native' && envelopeNrmse > tolerance.energyEnvelopeNrmse) failures.push(`${label} 10 ms energy envelope`);
      }
    }
    const fit = probeFit(reference.probes[edge], actual.probes[edge], actual.searchBins);
    metrics[`${label}ProbeNrmse`] = fit.nrmse;
    metrics[`${label}ProbeCorrelation`] = fit.correlation;
    if (fit.nrmse > tolerance.probeNrmse || (fit.referenceRms >= TOLERANCES.probeFloor && fit.correlation < tolerance.probeCorrelation)) {
      failures.push(`${label} activity-anchored waveform fingerprint`);
      let best = {nrmse: Infinity, lagMs: null, correlation: null};
      for (let lag = -actual.searchBins; lag <= actual.searchBins; lag++) {
        const candidate = probeFit(reference.probes[edge], actual.probes[edge], actual.searchBins + lag);
        if (candidate.nrmse < best.nrmse) best = {...candidate, lagMs: lag * CONFIG.probeSeconds * 1000};
      }
      metrics[`${label}BestLagDiagnostic`] = best;
    }
  }
  // Threshold crossings are energy activity markers, not phoneme boundaries.
  // A 3% band avoids treating a near-threshold noise fluctuation as truncation.
  // At native rate raw peak threshold crossings can legitimately move when
  // interpolation reveals inter-sample peaks. Keep them in the report; the
  // zero-alignment waveform and envelope checks establish preservation instead.
  for (const key of mode === 'fixed' ? ['firstFrame', 'lastFrame'] : []) {
    const range = reference.activity.map(value => value[key]).filter(value => value !== null);
    const value = actual.activity[1][key];
    if (range.length && (value === null || value < Math.min(...range) - tolerance.activityFrames || value > Math.max(...range) + tolerance.activityFrames)) failures.push(`${key} activity timing`);
  }
  if (mode === 'fixed') for (const edge of ['firstSamples', 'lastSamples']) {
    if (reference[edge].some((value, i) => Math.abs(value - actual[edge][i]) > TOLERANCES.absoluteSampleError)) failures.push(`${edge} boundary PCM`);
  }
  const hints = [];
  if (failures.includes('decoded sample count')) hints.push(metrics.lengthDeltaSamples < 0 ? 'PCM is shorter than gapless FFmpeg reference; inspect trimming/resampling length.' : 'PCM is longer than gapless FFmpeg reference; inspect retained priming/padding or resampling length.');
  const headLag = metrics.headBestLagDiagnostic, tailLag = metrics.tailBestLagDiagnostic;
  if (headLag && tailLag && headLag.nrmse < .2 && tailLag.nrmse < .2 && Math.abs(headLag.lagMs - tailLag.lagMs) <= 2 && Math.abs(headLag.lagMs) >= 2) {
    hints.push(`Both activity anchors best match at approximately ${headLag.lagMs} ms; a common decoder offset/priming difference is a candidate. No lag correction was applied to pass criteria.`);
  }
  return {pass: failures.length === 0, failures, metrics, hints};
}

function validateFixture() {
  const manifest = JSON.parse(fs.readFileSync(path.join(assetRoot, 'manifest.json'), 'utf8'));
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  assert.equal(fixture.schema, 'hapil-decoder-edges-v1');
  assert.deepEqual(fixture.config, CONFIG, 'fixture measurement algorithm configuration');
  assert.deepEqual(fixture.tolerances, TOLERANCES, 'fixture comparison tolerances');
  assert.deepEqual(Object.keys(fixture.assets).sort(), Object.keys(manifest.assets).sort(), 'all deployed MP3s must be represented');
  assert.equal(Object.keys(fixture.assets).length, 130, 'frozen release contains 41 scene + 89 paragraph MP3s');
  let scenes = 0, paragraphs = 0;
  for (const [audio, expected] of Object.entries(fixture.assets)) {
    assert.match(audio, /^audio\/[a-z0-9-]+\.mp3$/);
    const entry = manifest.assets[audio], bytes = fs.readFileSync(path.join(assetRoot, audio));
    assert.equal(sha256(bytes), expected.sha256, `${audio}: deployed bytes changed`);
    assert.equal(expected.sha256, entry.sha256, `${audio}: manifest hash`);
    assert.equal(bytes.length, expected.bytes, `${audio}: byte count`);
    assert.equal(bytes.length, entry.bytes, `${audio}: manifest byte count`);
    for (const key of ['sampleRate', 'channels', 'bitRate']) assert.equal(entry[key], CONFIG[key], `${audio}: ${key}`);
    assert.equal(expected.reference.sampleRate, CONFIG.sampleRate);
    assert.equal(expected.reference.searchBins, 0);
    assert.equal(expected.reference.finite, true);
    assert(expected.reference.sampleCount > CONFIG.sampleRate);
    assert.deepEqual(compare(expected.reference, expected.reference, 'fixed').failures, [], `${audio}: fixture self consistency`);
    if (audio.startsWith('audio/p-')) paragraphs++; else scenes++;
  }
  assert.equal(scenes, 41); assert.equal(paragraphs, 89);
  return {fixture, scenes, paragraphs};
}

// These controls validate the detector, without altering corpus assets or using
// synthetic audio as a substitute for actual corpus decoding. Duration-preserving
// 20 ms masking around first/last activity must fail, as must 1105-sample priming.
function detectorControls() {
  const samples = new Float32Array(CONFIG.sampleRate * 3);
  for (let i = 6000; i < samples.length - 6000; i++) {
    const t = i / CONFIG.sampleRate;
    samples[i] = .15 * Math.sin(2 * Math.PI * (137 * t + 31 * t * t)) + .08 * Math.sin(2 * Math.PI * 319 * t);
  }
  const reference = signature(samples, CONFIG.sampleRate, CONFIG);
  const assess = (altered, mode = 'fixed') => compare(reference, signature(altered, CONFIG.sampleRate, CONFIG, reference.anchorStarts, CONFIG.probeSearchBins), mode);
  assert.equal(assess(samples).pass, true, 'unchanged signal control');
  const maskedHead = samples.slice(); maskedHead.fill(0, 6000, 6480);
  const maskedTail = samples.slice(); maskedTail.fill(0, samples.length - 6480, samples.length - 6000);
  const delayed = new Float32Array(samples.length); delayed.set(samples.subarray(0, samples.length - 1105), 1105);
  const truncated = samples.subarray(0, samples.length - 480);
  const controls = {maskedHead: assess(maskedHead), maskedTail: assess(maskedTail), primingDelay: assess(delayed), truncatedSilence: assess(truncated),
    nativeMaskedHead: assess(maskedHead, 'native'), nativeMaskedTail: assess(maskedTail, 'native'), nativePrimingDelay: assess(delayed, 'native')};
  for (const [name, result] of Object.entries(controls)) assert.equal(result.pass, false, `${name} must be detected`);
  return Object.fromEntries(Object.entries(controls).map(([name, result]) => [name, result.failures]));
}

async function run() {
  const {fixture, scenes, paragraphs} = validateFixture();
  const controls = detectorControls();
  if (process.argv.includes('--validate-fixture')) {
    console.log(JSON.stringify({pass: true, mode: 'fixture-and-detector-controls-only', files: scenes + paragraphs, scenes, paragraphs, controls,
      browserDecodeRun: false, limitation: 'No browser decode or listening conclusion from fixture validation.'}, null, 2));
    return;
  }
  const runtime = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
  const playwright = runtime ? require(path.join(runtime, 'playwright')) : require('playwright');
  const browser = await playwright.chromium.launch({headless: true, executablePath: process.env.HAPIL_CHROMIUM || undefined, args: ['--no-sandbox']});
  const report = {schema: fixture.schema, pass: false, browserVersion: browser.version(), files: scenes + paragraphs, scenes, paragraphs,
    referenceDecoder: fixture.provenance.decoder, controls, contexts: [], rows: [],
    limitation: 'Edge-signal decode equivalence only. Does not establish phoneme completeness, listening quality, runtime scheduling, HTMLMediaElement fallback, or device output.'};
  try {
    const page = await browser.newPage(), errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    // Route locally: no HTTP listener or remote network requests are needed.
    // Each fetched response is the same hash-verified deployed MP3 file.
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== 'https://decoder-edges.test') return route.abort();
      if (url.pathname === '/') return route.fulfill({status: 200, contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><title>Decoder edge diagnostics</title>'});
      const audio = url.pathname.slice(1), entry = fixture.assets[audio];
      if (!entry) return route.fulfill({status: 404, body: 'Unknown fixture asset'});
      return route.fulfill({status: 200, contentType: 'audio/mpeg', body: fs.readFileSync(path.join(assetRoot, audio))});
    });
    await page.goto('https://decoder-edges.test/');
    await page.addScriptTag({content: `window.edgeSignature = ${signature.toString()};`});
    report.contexts = await page.evaluate(async () => {
      window.edgeContexts = [new AudioContext({sampleRate: 24000}), new AudioContext()];
      return window.edgeContexts.map((context, i) => ({mode: i ? 'native' : 'fixed', sampleRate: context.sampleRate, state: context.state}));
    });
    assert.equal(report.contexts[0].sampleRate, CONFIG.sampleRate, 'Chromium must honor explicit 24 kHz AudioContext');
    for (const [audio, expected] of Object.entries(fixture.assets)) {
      try {
        const results = await page.evaluate(async ({audio, expected, config}) => {
          const response = await fetch('/' + audio);
          if (!response.ok) throw new Error(`MP3 HTTP ${response.status}: ${audio}`);
          const bytes = await response.arrayBuffer();
          const digest = async buffer => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buffer)), byte => byte.toString(16).padStart(2, '0')).join('');
          const fetchedSha256 = await digest(bytes);
          if (fetchedSha256 !== expected.sha256) throw new Error('Fetched MP3 bytes do not match pinned SHA-256: ' + audio);
          const rows = [];
          for (let index = 0; index < window.edgeContexts.length; index++) {
            const context = window.edgeContexts[index];
            for (let attempt = 1; attempt <= 2; attempt++) {
              // decodeAudioData detaches input; each decode gets identical fresh bytes.
              const decoded = await context.decodeAudioData(bytes.slice(0));
              const samples = decoded.getChannelData(0);
              rows.push({mode: index ? 'native' : 'fixed', attempt, fetchedSha256,
                channels: decoded.numberOfChannels, pcmSha256: await digest(samples.buffer.slice(samples.byteOffset, samples.byteOffset + samples.byteLength)),
                signature: window.edgeSignature(samples, decoded.sampleRate, config, expected.reference.anchorStarts, config.probeSearchBins)});
            }
          }
          return rows;
        }, {audio, expected, config: CONFIG});
        const previous = {};
        for (const result of results) {
          const comparison = compare(expected.reference, result.signature, result.mode);
          if (result.channels !== CONFIG.channels) comparison.failures.push('decoded channel count');
          if (result.signature.sampleRate !== report.contexts.find(context => context.mode === result.mode).sampleRate) comparison.failures.push('decoded rate differs from AudioContext');
          if (previous[result.mode] && previous[result.mode] !== result.pcmSha256) comparison.failures.push('repeat decode PCM differs');
          previous[result.mode] = result.pcmSha256;
          report.rows.push({audio, mode: result.mode, attempt: result.attempt, sha256: result.fetchedSha256, pcmSha256: result.pcmSha256,
            sampleRate: result.signature.sampleRate, sampleCount: result.signature.sampleCount,
            firstAboveThreshold: result.signature.firstAboveThreshold, lastAboveThreshold: result.signature.lastAboveThreshold,
            activity: result.signature.activity[1], ...comparison, pass: comparison.failures.length === 0});
        }
      } catch (error) { report.rows.push({audio, pass: false, failures: [String(error)]}); }
    }
    await page.evaluate(async () => { for (const context of window.edgeContexts) await context.close(); });
    report.pageErrors = errors;
    report.failedRows = report.rows.filter(row => !row.pass);
    report.decodedRows = report.rows.filter(row => row.pcmSha256).length;
    report.pass = report.failedRows.length === 0 && errors.length === 0 && report.decodedRows === (scenes + paragraphs) * 4;
    const maxima = {};
    for (const mode of ['fixed', 'native']) {
      const rows = report.rows.filter(row => row.mode === mode && row.metrics);
      maxima[mode] = Object.fromEntries(['lengthDeltaSamples', 'headRmsError', 'tailRmsError', 'headEnergyEnvelopeNrmse', 'tailEnergyEnvelopeNrmse', 'headProbeNrmse', 'tailProbeNrmse'].map(key => [key, Math.max(...rows.map(row => Math.abs(row.metrics[key])))]));
    }
    if (process.env.HAPIL_DECODER_EDGE_REPORT) fs.writeFileSync(process.env.HAPIL_DECODER_EDGE_REPORT, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({pass: report.pass, browserVersion: report.browserVersion, files: report.files, scenes, paragraphs,
      decodedRows: report.decodedRows, contexts: report.contexts, maxima, failedRows: report.failedRows, pageErrors: errors,
      reportPath: process.env.HAPIL_DECODER_EDGE_REPORT || null, limitation: report.limitation}, null, 2));
    assert.equal(report.pass, true, 'Browser decoder edge comparison failed; inspect zero-alignment fingerprints, sample counts, and lag diagnostics above. Do not infer missing phonemes from numerical differences alone.');
  } finally { await browser.close(); }
}

module.exports = {CONFIG, TOLERANCES, signature, compare, detectorControls, validateFixture};
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
