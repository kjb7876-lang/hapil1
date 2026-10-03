'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {CONFIG, TOLERANCES, REFERENCE_PCM, NATIVE_REFERENCE_PCM, NATIVE_SAMPLE_RATES, signature, compare, detectorControls} = require('./story-narration-decoder-edges.cjs');
const root = path.resolve(__dirname, '../assets/story-narration/v1');
const manifestBytes = fs.readFileSync(path.join(root, 'manifest.json'));
const manifest = JSON.parse(manifestBytes);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const pcm = bytes => new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const version = execFileSync('ffmpeg', ['-version'], {encoding: 'utf8'}).split('\n')[0];
const fixture = {
 schema: 'hapil-decoder-edges-v2', config: CONFIG, tolerances: TOLERANCES,
 provenance: {
  decoder: version, generatedAt: new Date().toISOString(), manifestSha256: hash(manifestBytes),
  referencePcm: REFERENCE_PCM,
  nativeReferencePcm: NATIVE_REFERENCE_PCM, nativeSampleRates: NATIVE_SAMPLE_RATES,
  nativeResamplerVersion: execFileSync('ffmpeg', ['-version'], {encoding: 'utf8'}),
  nativeReferenceCommand: 'ffmpeg -v error -threads 1 -f f32le -ar 24000 -ac 1 -i pipe:0 -ar <44100|48000> -f f32le -acodec pcm_f32le pipe:1',
  nativeReferenceMeaning: 'Independent FFmpeg resampling of the exact fixed-rate AudioBus-float source PCM. Each reference predicts output at its declared native sample rate. Browser PCM is untouched and compared at that same rate. Source-derived anchorStarts remain identical; no gain fitting, alignment, per-file windows, or fallback rate is allowed. These reference hashes do not claim browser PCM identity.',
  comparisonContract: 'Fixed 24 kHz requires complete PCM SHA-256 equality and existing numerical edge limits. Native comparisons retain the original numerical limits against independently predicted same-rate references. Native filter differences remain tested; native signatures do not guarantee arbitrary low-energy or interior-content preservation.', 
  decodeCommand: 'ffmpeg -v error -threads 1 -c:a mp3 -i <exact deployed mp3> -map 0:a:0 -f s16le -acodec pcm_s16le pipe:1',
  pcmConversion: 'float32(sample * float32(1 / (sample >= 0 ? 32767 : 32768))) for signed PCM16 sample; Chromium AudioBus representation, with no gain fitting or time alignment.',
  meaning: 'Independent FFmpeg fixed-point MP3 PCM after gapless metadata, converted to Float32 using the signed PCM16 convention. Sample count is decoded PCM, not container duration. No trimming or padding is applied. Browser PCM remains untouched.',
  representationValidation: 'Convention independently validated on the original 130-file release: all complete PCM SHA-256 values matched Chromium 140.0.7339.186 at 24 kHz in CI job 111124806237 (commit 28e9afd3555eb6d2caf7ae77247d6a035bf95402). This establishes the decoder representation, not phoneme completeness.',
  signature: 'First and last 1 s: 100 consecutive 10 ms RMS/peak frames. First/last sample-level abs > 0.00316 crossings. Global 5 ms energy activity at RMS > 0.0015 OR peak > 0.00316, with +/-3% stability bounds. Two 256 ms signed waveform probes at first/last activity, averaged in 1 ms physical intervals; reference probe starts stay fixed for browser comparisons.',
  limitation: 'Not a phoneme, ASR, listening, WAV-to-MP3 quality, runtime playback, or device-output assessment.'
 }, assets: {}
};
const report = {controls: detectorControls(), nativeResamplerChecks: [], count: 0, minHeadActivitySeconds: Infinity, minQuietTailSeconds: Infinity, maxContainerMinusDecodedSeconds: 0};
for (const [audio, meta] of Object.entries(manifest.assets)) {
 const file = path.join(root, audio), bytes = fs.readFileSync(file);
 if (hash(bytes) !== meta.sha256) throw new Error('Deployed file hash changed: ' + audio);
 const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name,sample_rate,channels,bit_rate', '-of', 'json', file], {encoding: 'utf8'})).streams[0];
 if (probe.codec_name !== 'mp3' || +probe.sample_rate !== 24000 || probe.channels !== 1 || +probe.bit_rate !== 128000) throw new Error('Wrong final codec source: ' + audio + ' ' + JSON.stringify(probe));
 const raw16 = execFileSync('ffmpeg', ['-v', 'error', '-threads', '1', '-c:a', 'mp3', '-i', file, '-map', '0:a:0', '-f', 's16le', '-acodec', 'pcm_s16le', 'pipe:1'], {maxBuffer: 128 * 1024 * 1024});
 const pcm16 = new Int16Array(raw16.buffer.slice(raw16.byteOffset, raw16.byteOffset + raw16.byteLength));
 const samples = Float32Array.from(pcm16, sample => sample * Math.fround(1 / (sample >= 0 ? 32767 : 32768)));
 const raw = Buffer.from(samples.buffer), reference = signature(samples, CONFIG.sampleRate, CONFIG);
 fixture.assets[audio] = {sha256: meta.sha256, bytes: bytes.length, ffmpegPcm16Sha256: hash(raw16), ffmpegPcmSha256: hash(raw), containerDuration: meta.duration, reference, nativeReferences: {}};
 report.count++;
 report.minHeadActivitySeconds = Math.min(report.minHeadActivitySeconds, reference.activity[1].firstFrame * CONFIG.activityFrameSeconds);
 report.minQuietTailSeconds = Math.min(report.minQuietTailSeconds, reference.sampleCount / CONFIG.sampleRate - (reference.activity[1].lastFrame + 1) * CONFIG.activityFrameSeconds);
 report.maxContainerMinusDecodedSeconds = Math.max(report.maxContainerMinusDecodedSeconds, meta.duration - reference.sampleCount / CONFIG.sampleRate);
 // Generate independent same-rate oracles, retaining original source anchor times.
 // Keep the old cross-rate result as a diagnostic so its aperture bias remains visible.
 // Neither generation nor self-consistency stands in for a Chromium decode run.
 for (const rate of NATIVE_SAMPLE_RATES) {
  const resampled = execFileSync('ffmpeg', ['-v', 'error', '-threads', '1', '-f', 'f32le', '-ar', '24000', '-ac', '1', '-i', 'pipe:0', '-ar', String(rate), '-f', 'f32le', '-acodec', 'pcm_f32le', 'pipe:1'], {input: raw, maxBuffer: 128 * 1024 * 1024});
  const nativeReference = signature(pcm(resampled), rate, CONFIG, reference.anchorStarts);
  fixture.assets[audio].nativeReferences[String(rate)] = {referencePcm: NATIVE_REFERENCE_PCM, sourcePcmSha256: hash(raw), ffmpegNativePcmSha256: hash(resampled), sampleCount: nativeReference.sampleCount, reference: nativeReference};
  const measured = signature(pcm(resampled), rate, CONFIG, reference.anchorStarts, CONFIG.probeSearchBins);
  report.nativeResamplerChecks.push({audio, rate, diagnosticOnly: true, comparison: 'legacy-cross-rate-aperture', ...compare(reference, measured, 'native')});
 }
 if (report.count % 20 === 0) process.stdout.write('Measured ' + report.count + ' assets\n');
}
fs.writeFileSync(path.resolve(__dirname, 'fixtures/story-narration-decoder-edges.json'), JSON.stringify(fixture) + '\n');
report.nativeResamplerFailures = report.nativeResamplerChecks.filter(row => !row.pass);
fs.writeFileSync(process.env.HAPIL_DECODER_GENERATION_REPORT || path.join(__dirname, 'fixtures/story-narration-decoder-generation-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({files: report.count, fixtureBytes: Buffer.byteLength(JSON.stringify(fixture)), nativeResamplerChecks: report.nativeResamplerChecks.length, nativeResamplerFailures: report.nativeResamplerFailures.length, minHeadActivitySeconds: report.minHeadActivitySeconds, minQuietTailSeconds: report.minQuietTailSeconds, maxContainerMinusDecodedSeconds: report.maxContainerMinusDecodedSeconds}, null, 2));
