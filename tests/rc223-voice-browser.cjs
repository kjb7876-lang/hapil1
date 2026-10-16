'use strict';
// Real fixed recordings and native browser clocks. No generated audio, seeking,
// playback-rate change, autoplay-policy flag, or simulated ended event is used.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname, '..');
const out = process.env.HAPIL_QA_OUTPUT || '/tmp/rc223-voice-browser';
fs.mkdirSync(out, {recursive: true});
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => fs.readFileSync(path.join(root, file));
const git = args => cp.execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
const manifest = JSON.parse(read('assets/story-narration/v1/manifest.json'));
const nativeSource = read('assets/index-v31526.js').toString();
const deathSource = nativeSource.slice(nativeSource.indexOf('function HAPIL_showDeathVerseRC59('), nativeSource.indexOf('\n(function HAPIL_installEpisode1DeathAndMidbossDuoRC59'));
const deathText = ['title', 'verse1', 'verse2'].map(name => {
  const match = deathSource.match(new RegExp(name + "\\.textContent='([^']*)'"));
  assert(match, 'canonical death text: ' + name);
  return match[1];
}).join('\n\n');
const sourceFiles = ['index.html', 'assets/index-v31526.js', 'data/story-rc51.js', 'assets/rc49/story-voice.js', 'assets/rc139/display-data.js', 'assets/rc139/narration-start.js', 'assets/rc210/story-memory.js', 'assets/story-narration/v1/manifest.json', 'assets/story-narration/v1/player.js', 'assets/story-narration/v1/mixer.js', 'assets/rc223/guest-voice.js', 'assets/rc222/runtime.js', 'assets/rc51/story.js', 'assets/story-narration/v1/surfaces.js'];
const report = {
  schema: 1, status: 'running', sha: git(['rev-parse', 'HEAD']), dirty: !!git(['status', '--porcelain']), startedAt: new Date().toISOString(),
  scope: 'Official Chrome, actual fixed WAV/MP3 decoding/playback and native clocks; explicitly staged scene/cue/role fixtures; loopback relay with two isolated clients. No human listening, physical mobile, independent networks, or natural campaign claim.',
  scopes: {officialChrome: false, realRecordings: true, realEnded: false, guestController: false, nativeRelayTwoClients: false, nativeSharedSurface: false, physicalMobile: false, humanListening: false, fourNetworks: false},
  sources: sourceFiles.map(file => ({file, sha256: hash(read(file))})),
  pendingAudio: {manifestPendingRoutes: manifest.coverage.pendingRoutes, policy: 'Pending routes remain unsupported; no missing recording is accepted as a successful playback.'},
  fixtures: [
    'Isolated fixture HTML loads repository script bytes unchanged; attachment/cue/role staging is explicit.',
    'AudioContext/Audio observation forwards native methods and records real source starts/ends, clocks and gain/volume. Audio buffers and playback behavior are unchanged.',
    'The media fallback case explicitly removes AudioContext availability in its own isolated context; the recording, HTMLMediaElement and autoplay policy remain native.',
    'The two-client room case starts the actual loopback relay and native game; it is not independent Internet or natural progression testing.'
  ], checks: [], captures: [], videos: [], errors: [], httpErrors: [], requestFailures: []
};
report.immutableSources = Object.entries(manifest.immutable).map(([file, expectedSha256]) => {
  const sha256 = hash(read(file)); assert.equal(sha256, expectedSha256, 'immutable narration source: ' + file);
  return {file, sha256};
});
const selected = [
  ['dist04:post', manifest.scenes['dist04:post']],
  ['dist03:post', manifest.scenes['dist03:post']],
  ['death:verse', manifest.scenes['death:verse']],
  ...Object.entries(manifest.originals)
];
report.recordings = selected.flatMap(([key, entry]) => (entry.clips || [entry]).map(clip => {
  const url = new URL(clip.audio, 'http://localhost/assets/story-narration/v1/manifest.json');
  const file = url.pathname.slice(1), bytes = read(file), actual = hash(bytes);
  assert.equal(actual, clip.sha256, 'fixed recording hash: ' + file);
  return {key, file, bytes: bytes.length, duration: clip.duration, sha256: actual};
}));
assert.equal(hash(deathText), manifest.scenes['death:verse'].textSha256);
const fixtureScripts = ['data/story-rc51.js', 'assets/rc49/story-voice.js', 'assets/rc139/display-data.js', 'assets/rc139/narration-start.js', 'assets/rc210/story-memory.js', 'assets/story-narration/v1/mixer.js', 'assets/story-narration/v1/player.js', 'assets/rc223/guest-voice.js'];
function fixtureHTML(mediaOnly) {
  return '<!doctype html><html lang="ko"><meta charset="utf-8"><title>RC223 actual voice fixture</title>' +
    '<link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/story-narration/v1/player.css">' +
    '<style>body{margin:30px;background:#111725;color:#edf2ff;font:18px system-ui}section{padding:24px;border:1px solid #789;max-width:850px}button,input{font:inherit;margin:8px}.rc51-footer{margin-top:24px}</style>' +
    (mediaOnly ? '<script>window.AudioContext=undefined;window.webkitAudioContext=undefined;</script>' : '') +
    fixtureScripts.map(file => '<script src="/' + file + '"></script>').join('') +
    '<body><h1>실제 음성 재생 검증 · 제어된 장면</h1><p>자동재생 정책과 원본 파일을 그대로 사용합니다.</p><button id="outside-gesture">현재 입력</button>' +
    '<div id="cards"></div><script>window.__RC223_DEATH_TEXT__=' + JSON.stringify(deathText).replace(/</g, '\u003c') + ';</script></body></html>';
}
const mime = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2'};
let web, relay, browser, base, activePage;
const contexts = [], pages = [];
const save = () => fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));

// Observation only: every operation forwards to the actual browser implementation.
function audioProbe() {
  const obs = window.__RC223_AUDIO__ = {contexts: [], sources: [], media: [], decoded: [], audioFetches: [], errors: []};
  const bytesURL = new WeakMap(), bufferURL = new WeakMap();
  const isVoice = url => /\/assets\/(?:story-narration\/v1\/audio\/|rc26\/audio\/(?:opening|root)-memory\.wav)/.test(String(url || ''));
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function(...args) {
    const response = await nativeFetch(...args), url = response.url;
    if (/\.(?:mp3|wav)(?:\?|$)/.test(url)) obs.audioFetches.push({url, status: response.status, at: performance.now()});
    const arrayBuffer = response.arrayBuffer.bind(response);
    response.arrayBuffer = async function() { const bytes = await arrayBuffer(); bytesURL.set(bytes, url); return bytes; };
    return response;
  };
  const NativeContext = window.AudioContext || window.webkitAudioContext;
  if (NativeContext) {
    class ObservedContext extends NativeContext {
      constructor(...args) { super(...args); obs.contexts.push(this); }
      decodeAudioData(bytes, ...args) {
        const url = bytesURL.get(bytes), result = super.decodeAudioData(bytes, ...args);
        if (result?.then) result.then(buffer => {bufferURL.set(buffer, url); obs.decoded.push({url, duration: buffer.duration, samples: buffer.length, sampleRate: buffer.sampleRate});}, () => {});
        return result;
      }
      createBufferSource(...args) {
        const node = super.createBufferSource(...args), row = {id: obs.sources.length + 1, node, context: this, started: false, stopped: false, ended: false, gainNode: null};
        obs.sources.push(row);
        const start = node.start.bind(node), stop = node.stop.bind(node), connect = node.connect.bind(node);
        node.connect = function(destination, ...rest) { if (destination?.gain) row.gainNode = destination; return connect(destination, ...rest); };
        node.start = function(...rest) {
          Object.assign(row, {started: true, at: performance.now(), contextTime: row.context.currentTime, args: rest, duration: node.buffer?.duration, samples: node.buffer?.length, url: bufferURL.get(node.buffer)});
          return start(...rest);
        };
        node.stop = function(...rest) { row.stopped = true; row.stoppedAt = performance.now(); return stop(...rest); };
        node.addEventListener('ended', event => {row.ended = true; row.endedAt = performance.now(); row.naturalEnded = !row.stopped; row.endedTrusted = event.isTrusted;});
        return node;
      }
    }
    window.AudioContext = ObservedContext;
    if (window.webkitAudioContext) window.webkitAudioContext = ObservedContext;
  }
  const NativeAudio = window.Audio;
  window.Audio = function(...args) {
    const clip = new NativeAudio(...args), row = {clip, url: String(args[0] || ''), plays: 0, ended: 0};
    obs.media.push(row);
    const play = clip.play.bind(clip);
    clip.play = function(...rest) {row.plays++; row.playedAt = performance.now(); return play(...rest);};
    clip.addEventListener('ended', event => {row.ended++; row.endedTrusted = event.isTrusted;});
    return clip;
  };
  window.Audio.prototype = NativeAudio.prototype;
  window.__RC223_READ_AUDIO__ = () => ({
    contexts: obs.contexts.map(c => ({state: c.state, currentTime: c.currentTime, sampleRate: c.sampleRate})),
    sources: obs.sources.filter(r => r.started && r.samples > 1 && isVoice(r.url)).map(r => ({id: r.id, at: r.at, contextTime: r.contextTime, args: r.args, duration: r.duration, samples: r.samples, url: r.url, stopped: r.stopped, stoppedAt: r.stoppedAt, ended: r.ended, naturalEnded: r.naturalEnded, endedAt: r.endedAt, endedTrusted: r.endedTrusted, gain: r.gainNode?.gain.value, contextNow: r.context.currentTime, playbackRate: r.node.playbackRate.value})),
    media: obs.media.filter(r => isVoice(r.url)).map(r => ({url: r.url, plays: r.plays, ended: r.ended, endedTrusted: r.endedTrusted, currentTime: r.clip.currentTime, duration: r.clip.duration, volume: r.clip.volume, paused: r.clip.paused, playbackRate: r.clip.playbackRate})), decoded: obs.decoded, audioFetches: obs.audioFetches
  });
}
async function snapshot(page = activePage) {
  return page.evaluate(() => ({audio: window.__RC223_READ_AUDIO__?.(), player: window.fixturePlayer ? {status: fixturePlayer.status, position: fixturePlayer.position, backend: fixturePlayer.backend, duration: fixturePlayer.duration} : null, guest: window.__HAPIL_GUEST_VOICE_RC223__?.status(), nativeCue: window.__HAPIL_STORY_RC51__?.currentNarrative?.(), transport: window.__HAPIL_REMOTE_RC222__?.status(), runtime: window.__HAPIL_REMOTE_RC222_RUNTIME__?.status()}));
}
async function capture(name, page = activePage) {
  if (!page) return;
  const file = name + '.png', bytes = await page.screenshot({path: path.join(out, file), timeout: 15000});
  report.captures.push({file, bytes: bytes.length, sha256: hash(bytes), sha: report.sha, at: new Date().toISOString()});
  if (process.env.HAPIL_QA_LOG_PREVIEW === '1' && (name.startsWith('failed-') || ['mutable-original-webaudio', 'actual-relay-native-current-narrative'].includes(name))) {
    const preview = await page.screenshot({type: 'jpeg', quality: 30, timeout: 15000}), encoded = preview.toString('base64');
    console.log('RC223_PREVIEW_META ' + JSON.stringify({name, sha: report.sha, sha256: hash(preview), bytes: preview.length, chunks: Math.ceil(encoded.length / 4000)}));
    for (let i = 0; i < encoded.length; i += 4000) console.log('RC223_PREVIEW_CHUNK ' + name + ' ' + i / 4000 + ' ' + encoded.slice(i, i + 4000));
  }
}
async function check(name, fn) {
  const row = {name, status: 'running', startedAt: new Date().toISOString()}; report.checks.push(row);
  try {row.evidence = await fn(); row.status = 'passed'; await capture(name);}
  catch (error) {row.status = 'failed'; row.error = error.stack || String(error); row.actual = await snapshot().catch(e => ({error: String(e)})); await capture('failed-' + name).catch(() => {}); throw error;}
  finally {row.endedAt = new Date().toISOString(); save();}
}
async function newPage(label, {native = false, mediaOnly = false} = {}) {
  const options = {viewport: {width: 1280, height: 900}};
  if (process.env.HAPIL_QA_VIDEO === '1') options.recordVideo = {dir: path.join(out, 'video'), size: {width: 1280, height: 900}};
  const context = await browser.newContext(options); contexts.push(context);
  const page = await context.newPage(); pages.push({page, label}); activePage = page;
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => report.errors.push({label, error: String(error), at: new Date().toISOString()}));
  page.on('response', response => {if (response.status() >= 400) report.httpErrors.push({label, url: response.url(), status: response.status()});});
  page.on('requestfailed', request => report.requestFailures.push({label, url: request.url(), failure: request.failure()}));
  await page.addInitScript(audioProbe);
  await page.goto(base + (native ? '/?qa=1' : '/__rc223-fixture.html' + (mediaOnly ? '?media=1' : '')), {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__HAPIL_STORY_NARRATION_V1__ && window.__HAPIL_GUEST_VOICE_RC223__ && window.__HAPIL_NARRATION_START_RC139__);
  return page;
}
function attachScene({key, originalScene = false}) {
  window.fixturePlayer?.stop(); document.getElementById('fixture-card')?.remove();
  const [zone, phase] = key.split(':'), data = window.__HAPIL_STORY_DATA_RC51__;
  let text;
  if (key === 'death:verse') text = window.__RC223_DEATH_TEXT__;
  else if (zone === 'dist00') {const original = data.openingVoice[phase === 'pre' ? 'opening' : 'root']; text = [original.title, ...original.paragraphs].join('\n\n');}
  else text = data.records.find(row => row.zone === zone)?.[phase];
  if (!text) throw Error('Canonical text missing: ' + key);
  const card = document.createElement('section'); card.id = 'fixture-card';
  const article = document.createElement('article'), footer = document.createElement('footer'); article.textContent = text; footer.className = 'rc51-footer'; card.append(article, footer); document.getElementById('cards').append(card);
  window.fixtureEvents = {playing: 0, ended: 0, blocked: 0, paused: 0};
  window.fixturePlayer = __HAPIL_STORY_NARRATION_V1__.attach({root: card, text, key, zone, phase, originalScene, autoplay: false, ctx: {sound: true, voiceVolume: .8}, onPlaying: () => fixtureEvents.playing++, onEnded: () => fixtureEvents.ended++, onBlocked: () => fixtureEvents.blocked++, onUserPause: () => fixtureEvents.paused++});
  return {key, text, attached: !!fixturePlayer};
}
function guestSync({cueId, key = 'dist04:post', epoch = 1, sessionKey = 'rc223-guest-fixture', baseline = false, status = 'playing'}) {
  let card = document.getElementById('fixture-card');
  if (!card) {card = document.createElement('section'); card.id = 'fixture-card'; card.innerHTML = '<article></article><footer class="rc51-footer"></footer>'; document.getElementById('cards').append(card);}
  const [zone, phase] = key.split(':'), data = __HAPIL_STORY_DATA_RC51__;
  const voice = zone === 'dist00' ? data.openingVoice[phase === 'pre' ? 'opening' : 'root'] : null;
  const text = voice ? [voice.title, ...voice.paragraphs].join('\n\n') : data.records.find(r => r.zone === zone)?.[phase];
  card.querySelector('article').textContent = text || '';
  const cue = baseline ? null : {cueId, zone, phase, key, text, status};
  window.fixturePlayer = __HAPIL_GUEST_VOICE_RC223__.sync({sessionKey, epoch, isHost: false, hasSnapshot: true, cue, root: card, ctx: {sound: true, voiceVolume: .8}});
  return __HAPIL_GUEST_VOICE_RC223__.status();
}
const wait = (page, predicate, arg, timeout = 20000) => page.waitForFunction(predicate, arg, {timeout});
const audioRows = page => page.evaluate(() => __RC223_READ_AUDIO__());
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function nativeRelayCase() {
  const {start} = await import(pathToFileURL(path.join(root, 'server/src/relay.js')).href);
  relay = await start({port: 0, host: '127.0.0.1', allowedOrigins: [base]});
  const port = relay.server.address().port, endpoint = 'ws://127.0.0.1:' + port + '/relay';
  const health = await fetch('http://127.0.0.1:' + port + '/healthz'); assert.equal(health.status, 200); assert.equal((await health.json()).ok, true);
  const host = await newPage('native-host', {native: true}), guest = await newPage('native-guest', {native: true}); activePage = guest;
  for (const page of [host, guest]) {await wait(page, () => window.__HAPIL_RC133_NATIVE__?.installed && window.__HAPIL_REMOTE_RC222_RUNTIME__ && window.__HAPIL_REMOTE_RC222__); await page.keyboard.press('Escape'); await page.evaluate(endpoint => __HAPIL_REMOTE_RC222__.setEndpoint(endpoint), endpoint);}
  await host.evaluate(() => __HAPIL_REMOTE_RC222__.create({nickname: 'voice-host', heroId: 'gunner', mode: 'STORY'}));
  const code = await host.evaluate(() => __HAPIL_REMOTE_RC222__.status().code);
  await guest.evaluate(code => __HAPIL_REMOTE_RC222__.join({code, nickname: 'voice-guest', heroId: 'seoha'}), code);
  await guest.evaluate(() => __HAPIL_REMOTE_RC222__.ready(true));
  await wait(host, () => __HAPIL_REMOTE_RC222__.status().roster.length === 2 && __HAPIL_REMOTE_RC222__.status().roster.every(row => row.ready));
  await host.evaluate(() => __HAPIL_REMOTE_RC222__.start());
  await Promise.all([host, guest].map(page => wait(page, () => __HAPIL_REMOTE_RC222__.status().phase === 'playing' && __HAPIL_REMOTE_RC222_RUNTIME__.status().ready, null, 45000)));
  await wait(host, () => !!__HAPIL_STORY_RC51__.currentNarrative(), null, 30000);
  const hostNativeCue = await host.evaluate(() => __HAPIL_STORY_RC51__.currentNarrative());
  const hostCue = await host.evaluate(() => __HAPIL_REMOTE_RC222_RUNTIME__.exportSnapshot({full: true})?.rc222?.narrative?.voice);
  assert(hostCue && hostCue.cueId > 0, 'native primary cue is present in wire snapshot');
  assert.equal(hostCue.text, hostNativeCue.text); assert.equal(hostCue.key, hostNativeCue.key);
  await wait(guest, cue => __HAPIL_GUEST_VOICE_RC223__.status().highestCue === cue.cueId && document.querySelector('#hapil-remote-narrative-rc222 [data-narration-play]'), hostCue, 30000);
  const before = await snapshot(guest);
  assert.equal(before.guest.playerStatus, 'idle', 'first actual guest snapshot offers manual playback');
  assert.equal(before.audio.sources.length, 0, 'first actual guest cue does not autoplay');
  await guest.locator('#hapil-remote-narrative-rc222 [data-narration-play]').click();
  await wait(guest, () => __HAPIL_GUEST_VOICE_RC223__.status().playerStatus === 'playing' && __RC223_READ_AUDIO__().sources.some(row => row.contextNow - row.contextTime > .1), null, 30000);
  const started = await snapshot(guest), count = started.audio.sources.length;
  // These are actual host exports sent through the real relay; no fabricated cue is supplied.
  for (let i = 0; i < 4; i++) {await host.evaluate(() => {const t = __HAPIL_REMOTE_RC222__, snap = __HAPIL_REMOTE_RC222_RUNTIME__.exportSnapshot({full: true}); if (!snap) throw Error('Native host snapshot unavailable'); t.send('snapshot', {seq: ++t.snapshotSeq, epoch: t.epoch, full: true, snapshot: snap});}); await sleep(120);}
  const repeated = await snapshot(guest);
  assert.equal(repeated.guest.highestCue, hostCue.cueId); assert.equal(repeated.audio.sources.length, count, 'same native cue snapshots never restart guest speech');
  assert.equal(repeated.guest.playerStatus, 'playing');
  await capture('native-host-current-narrative', host); await capture('native-guest-real-voice', guest);
  // Explicit lifecycle fixture: call the existing native respawn hooks. This is
  // not a naturally suffered death, fabricated recording, or private journal.
  const sharedSetup = await host.evaluate(() => {
    const s = __HAPIL_PARTY_V31322__.state, hooks = __HAPIL_RC59_RELEASE__;
    __HAPIL_STORY_RC51__.close(false);
    if (!hooks?.beforeRespawn?.(s) || !hooks.afterRespawn(s)) throw Error('Native respawn scripture surface unavailable');
    return {fixture: 'Explicit native beforeRespawn/afterRespawn hooks; no natural death', zone: s.zone, nativeSurfacePresent: !!document.getElementById('hapil-death-verse-rc59')};
  });
  assert.equal(sharedSetup.nativeSurfacePresent, true);
  await wait(host, () => __HAPIL_STORY_NARRATION_V1__.currentNarrative?.()?.key === 'death:verse');
  const sharedHost = await host.evaluate(() => ({player: __HAPIL_STORY_NARRATION_V1__.currentNarrative(), wire: __HAPIL_REMOTE_RC222_RUNTIME__.exportSnapshot({full: true})?.rc222?.narrative}));
  assert.equal(sharedHost.wire?.voice?.key, 'death:verse', 'shared death surface enters actual native snapshot');
  for (let i = 0; i < 3; i++) {await host.evaluate(() => {const t = __HAPIL_REMOTE_RC222__, snap = __HAPIL_REMOTE_RC222_RUNTIME__.exportSnapshot({full: true}); if (!snap) throw Error('Shared surface snapshot unavailable'); t.send('snapshot', {seq: ++t.snapshotSeq, epoch: t.epoch, full: true, snapshot: snap});}); await sleep(120);}
  await wait(guest, () => __HAPIL_STORY_NARRATION_V1__.currentNarrative?.()?.key === 'death:verse' && __HAPIL_GUEST_VOICE_RC223__.status().playerStatus === 'playing' && __RC223_READ_AUDIO__().sources.some(row => row.url?.includes('/death-title-') && row.contextNow - row.contextTime > .1));
  const sharedGuest = await snapshot(guest), deathStarts = sharedGuest.audio.sources.filter(row => row.url.includes('/death-title-'));
  assert.equal(deathStarts.length, 1, 'same shared cue snapshots produce one first-clip start');
  assert.equal(sharedGuest.guest.highestCue, sharedHost.wire.voice.cueId);
  assert(sharedGuest.audio.sources.filter(row => row.url.includes('/rc26/audio/')).every(row => row.stopped || row.ended), 'new shared surface cancels old primary voice');
  await capture('native-shared-death-host', host); await capture('native-shared-death-guest', guest);
  await host.evaluate(() => __HAPIL_REMOTE_RC222__.leave());
  await wait(guest, () => !__HAPIL_REMOTE_RC222__.status().connected && !__HAPIL_GUEST_VOICE_RC223__.status().hasCue);
  const left = await snapshot(guest); assert(left.audio.sources.every(row => row.stopped || row.ended), 'room leave cancels the actual guest voice');
  report.scopes.nativeRelayTwoClients = true; report.scopes.nativeSharedSurface = true;
  return {scope: 'Actual loopback relay and two isolated desktop Chrome contexts; no independent-network claim', hostNativeCue, hostCue, before, started, repeated, sharedSetup, sharedHost, sharedGuest, left};
}

(async () => {
  try {
    if (process.env.EXPECTED_SHA) assert.equal(report.sha, process.env.EXPECTED_SHA);
    assert.equal(report.dirty, false, 'Exact committed clean checkout required for browser evidence');
    web = http.createServer((request, response) => {
      try {
        const url = new URL(request.url, 'http://localhost');
        if (url.pathname === '/__rc223-fixture.html') {response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(fixtureHTML(url.searchParams.has('media'))); return;}
        const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
        if (!file.startsWith(root + path.sep)) {response.writeHead(403).end(); return;}
        response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); response.end(fs.readFileSync(file));
      } catch {response.writeHead(404).end();}
    });
    await new Promise(resolve => web.listen(0, '127.0.0.1', resolve)); base = 'http://127.0.0.1:' + web.address().port;
    const pw = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright')) : require('playwright');
    browser = await pw.chromium.launch({chromiumSandbox: true, channel: 'chrome', headless: true, args: []});
    report.scopes.officialChrome = true; report.browserVersion = browser.version();

    await check('untouched-first-play-and-real-ended', async () => {
      const page = await newPage('first-play'); const attached = await page.evaluate(attachScene, {key: 'dist04:post'}); assert(attached.attached);
      const untouched = await snapshot(page); assert.equal(untouched.audio.sources.length, 0); assert.equal(untouched.audio.contexts.length, 0); assert.equal(untouched.player.status, 'idle');
      // This is the first trusted gesture in this context; there is no unlock/start button click.
      await page.locator('[data-narration-play]').click();
      await wait(page, () => fixturePlayer.status === 'playing' && fixturePlayer.position > .1);
      const playing = await snapshot(page); assert.equal(playing.audio.sources.length, 1); assert.equal(playing.audio.sources[0].args[1], 0); assert.equal(playing.audio.sources[0].playbackRate, 1); assert(playing.audio.sources[0].url.endsWith('/' + manifest.scenes['dist04:post'].audio));
      await wait(page, () => fixturePlayer.status === 'ended', null, 15000);
      const ended = await page.evaluate(() => ({...__RC223_READ_AUDIO__(), events: fixtureEvents}));
      assert.equal(ended.events.ended, 1); assert.equal(ended.events.blocked, 0); assert.equal(ended.sources.length, 1); assert.equal(ended.sources[0].naturalEnded, true); assert.equal(ended.sources[0].endedTrusted, true);
      assert(ended.sources[0].endedAt - ended.sources[0].at >= (ended.sources[0].duration - .15) * 1000, 'actual recording plays through its real duration');
      report.scopes.realEnded = true; return {attached, untouched, playing, ended};
    });
    await check('canonical-real-ended-playlist-order', async () => {
      const page = await newPage('playlist'); await page.evaluate(attachScene, {key: 'death:verse'}); await page.locator('[data-narration-play]').click();
      await wait(page, () => fixturePlayer.status === 'playing' && fixturePlayer.position > .1);
      await wait(page, () => fixturePlayer.status === 'ended', null, 30000);
      const actual = await page.evaluate(() => ({...__RC223_READ_AUDIO__(), events: fixtureEvents})), clips = manifest.scenes['death:verse'].clips;
      assert.equal(actual.sources.length, clips.length); assert.equal(actual.events.ended, 1); assert.equal(actual.events.playing, clips.length); assert.equal(actual.events.blocked, 0);
      for (let i = 0; i < clips.length; i++) {const row = actual.sources[i]; assert(row.url.endsWith('/' + clips[i].audio)); assert.equal(row.args[1], 0); assert.equal(row.playbackRate, 1); assert.equal(row.naturalEnded, true); assert.equal(row.endedTrusted, true); if (i) assert(row.at >= actual.sources[i - 1].endedAt, 'next clip starts after actual previous ended event');}
      await sleep(900); assert.equal((await audioRows(page)).sources.length, clips.length, 'ended playlist does not duplicate or restart'); return actual;
    });

    for (const mediaOnly of [false, true]) await check('mutable-original-' + (mediaOnly ? 'media' : 'webaudio'), async () => {
      const page = await newPage('mutable-' + (mediaOnly ? 'media' : 'webaudio'), {mediaOnly});
      await page.evaluate(() => {const button = document.createElement('button'); button.id = 'mutable-play'; button.textContent = '원본 음성 재생'; document.getElementById('cards').append(button); window.fixturePlayer = __HAPIL_STORY_VOICE_RC49__.create('./assets/rc26/audio/root-memory.wav', {volume: .7, mutableVolume: true}); button.onclick = () => fixturePlayer.play();});
      await page.locator('#mutable-play').click(); await wait(page, () => fixturePlayer.status === 'playing' && fixturePlayer.position > .1);
      const before = await snapshot(page); assert.equal(before.player.backend, mediaOnly ? 'media' : 'webaudio');
      const level = audio => mediaOnly ? audio.media.at(-1).volume : audio.sources.at(-1).gain;
      assert(Math.abs(level(before.audio) - .7) < .00001);
      await page.evaluate(() => fixturePlayer.setVolume(.23)); const changed = await audioRows(page); assert(Math.abs(level(changed) - .23) < .00001);
      await page.evaluate(() => fixturePlayer.setVolume(0)); assert.equal(level(await audioRows(page)), 0);
      const mutePosition = await page.evaluate(() => fixturePlayer.position); await wait(page, previous => fixturePlayer.position > previous + .1, mutePosition);
      await page.evaluate(() => fixturePlayer.setVolume(.61)); assert(Math.abs(level(await audioRows(page)) - .61) < .00001);
      const paused = await page.evaluate(() => {fixturePlayer.pause(); return fixturePlayer.position;}); assert(paused > .1);
      await sleep(250); assert.equal(await page.evaluate(() => fixturePlayer.position), paused, 'explicit pause preserves actual sample position');
      await page.locator('#mutable-play').click(); await wait(page, previous => fixturePlayer.status === 'playing' && fixturePlayer.position > previous + .1, paused);
      const resumed = await snapshot(page); assert(Math.abs(level(resumed.audio) - .61) < .00001);
      if (!mediaOnly) {assert.equal(resumed.audio.sources.length, 2); assert(Math.abs(resumed.audio.sources[1].args[1] - paused) < .001); assert.equal(resumed.audio.sources[1].playbackRate, 1);}
      else {assert.equal(resumed.audio.media.at(-1).playbackRate, 1); assert(resumed.audio.media.at(-1).currentTime >= paused);}
      await page.evaluate(() => fixturePlayer.stop()); return {before, changed, paused, resumed, fixture: mediaOnly ? 'AudioContext unavailable dependency; real HTMLMediaElement' : 'Actual native AudioContext'};
    });

    await check('guest-late-first-snapshot-manual-original', async () => {
      const page = await newPage('guest-late-original');
      const guard = await page.evaluate(attachScene, {key: 'dist00:post'}); assert.equal(guard.attached, false, 'original V1 remains opt-in');
      await page.evaluate(() => {document.getElementById('fixture-card')?.remove();});
      await page.evaluate(guestSync, {cueId: 9, key: 'dist00:post'}); await sleep(800);
      const baseline = await snapshot(page); assert.equal(baseline.guest.playerStatus, 'idle'); assert.equal(baseline.audio.sources.length, 0);
      await page.locator('#outside-gesture').click(); await sleep(200); assert.equal((await audioRows(page)).sources.length, 0, 'late baseline is manual even after unrelated gesture');
      await page.locator('[data-narration-play]').click(); await wait(page, () => fixturePlayer.status === 'playing' && fixturePlayer.position > .1);
      const played = await snapshot(page); assert(played.audio.sources.at(-1).url.endsWith('/assets/rc26/audio/root-memory.wav'));
      const count = played.audio.sources.length; await page.evaluate(() => {window.samePlayer = fixturePlayer;});
      for (let i = 0; i < 12; i++) await page.evaluate(guestSync, {cueId: 9, key: 'dist00:post'});
      assert.equal(await page.evaluate(() => fixturePlayer === samePlayer), true); assert.equal((await audioRows(page)).sources.length, count);
      await page.evaluate(() => __HAPIL_GUEST_VOICE_RC223__.leave()); assert.equal((await snapshot(page)).guest.hasCue, false); report.scopes.guestController = true;
      return {guard, baseline, played};
    });
    await check('guest-latest-gesture-replace-pause-epoch-leave', async () => {
      const page = await newPage('guest-cue-lifecycle');
      await page.evaluate(guestSync, {baseline: true}); await page.evaluate(guestSync, {cueId: 1, key: 'dist03:post'}); await page.evaluate(guestSync, {cueId: 2, key: 'dist04:post'});
      const pending = await snapshot(page); assert.equal(pending.guest.highestCue, 2); assert.equal(pending.guest.pendingGesture, true); assert.equal(pending.audio.sources.length, 0);
      await page.locator('#outside-gesture').click(); await wait(page, () => fixturePlayer.status === 'playing' && fixturePlayer.position > .1);
      const latest = await snapshot(page); assert.equal(latest.audio.sources.length, 1); assert(latest.audio.sources[0].url.endsWith('/' + manifest.scenes['dist04:post'].audio));
      await page.evaluate(guestSync, {cueId: 3, key: 'dist03:post'}); await wait(page, () => fixturePlayer.status === 'playing' && fixturePlayer.position > .1);
      const replaced = await snapshot(page); assert.equal(replaced.audio.sources.length, 2); assert.equal(replaced.audio.sources[0].stopped, true); assert(replaced.audio.sources[1].url.endsWith('/' + manifest.scenes['dist03:post'].audio));
      await page.locator('[data-narration-play]').click(); const paused = await snapshot(page); assert.equal(paused.guest.userPaused, true); assert.equal(paused.player.status, 'paused');
      for (let i = 0; i < 8; i++) await page.evaluate(guestSync, {cueId: 3, key: 'dist03:post'});
      await page.locator('#outside-gesture').click(); await sleep(700); const stillPaused = await snapshot(page); assert.equal(stillPaused.guest.userPaused, true); assert.equal(stillPaused.player.status, 'paused'); assert.equal(stillPaused.audio.sources.length, 2); assert.equal(stillPaused.player.position, paused.player.position);
      await page.evaluate(() => __HAPIL_GUEST_VOICE_RC223__.invalidate(2)); const invalidated = await snapshot(page); assert.equal(invalidated.guest.hasCue, false); assert(invalidated.audio.sources.every(row => row.stopped || row.ended));
      await page.evaluate(guestSync, {cueId: 4, key: 'dist03:post', epoch: 2}); await wait(page, () => fixturePlayer.status === 'playing' && fixturePlayer.position > .1);
      await page.evaluate(() => __HAPIL_GUEST_VOICE_RC223__.leave()); const left = await snapshot(page); assert.equal(left.guest.hasCue, false); assert.equal(left.guest.sessionKey, null); assert(left.audio.sources.every(row => row.stopped || row.ended));
      const prior = left.audio.sources.length; await page.evaluate(guestSync, {baseline: true, epoch: 3}); await page.evaluate(guestSync, {cueId: 5, key: 'dist03:post', epoch: 3}); await page.evaluate(() => __HAPIL_GUEST_VOICE_RC223__.leave()); await sleep(900); assert.equal((await audioRows(page)).sources.length, prior, 'leave cancels pending asynchronous start');
      return {pending, latest, replaced, paused, stillPaused, invalidated, left, afterPendingLeave: await snapshot(page)};
    });
    await check('pending-recording-remains-unavailable', async () => {
      const page = await newPage('pending-recording'); await page.evaluate(attachScene, {key: 'dist02:post'});
      await wait(page, () => fixturePlayer.status === 'unavailable'); const actual = await snapshot(page); assert.equal(actual.audio.sources.length, 0); assert.equal(actual.audio.audioFetches.length, 0); assert.equal(await page.locator('[data-narration-play]').count(), 0); const policy = await page.evaluate(() => __HAPIL_MEMORY_RC210__.pendingScenes); assert(policy.includes('dist02:post')); return {unsupported: 'dist02:post', policy, actual};
    });
    await check('actual-relay-native-current-narrative', nativeRelayCase);
    assert.deepEqual(report.errors, [], 'browser page errors'); assert.deepEqual(report.httpErrors, [], 'HTTP errors');
    assert(pages.length >= 2); report.status = 'passed';
  } catch (error) {report.status = report.scopes.officialChrome ? 'failed' : 'blocked'; report.failure = error.stack || String(error); console.error(report.failure); process.exitCode = 1;}
  finally {
    for (const {page, label} of pages) {try {await capture('final-' + label, page);} catch {}}
    for (const context of contexts) {try {await context.close();} catch {}}
    for (const {page, label} of pages) {try {const file = await page.video()?.path(); if (file && fs.existsSync(file)) {const bytes = fs.readFileSync(file); report.videos.push({label, file: path.relative(out, file), sha256: hash(bytes), bytes: bytes.length, sha: report.sha});}} catch {}}
    if (browser) await browser.close().catch(() => {}); if (relay) await relay.close(); if (web) await new Promise(resolve => web.close(resolve));
    report.endedAt = new Date().toISOString(); save(); console.log('RC223_VOICE_BROWSER ' + JSON.stringify({status: report.status, sha: report.sha, scopes: report.scopes, checks: report.checks.map(row => ({name: row.name, status: row.status})), results: path.join(out, 'results.json')}));
  }
})();
