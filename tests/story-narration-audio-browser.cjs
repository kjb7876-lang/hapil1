'use strict';
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/story-narration/v1/manifest.json'), 'utf8'));
const runtime = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const playwright = runtime ? require(path.join(runtime, 'playwright')) : require('playwright');
const context = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/story-rc51.js'), 'utf8'), context);
const cardTexts = {};
for (const record of context.window.__HAPIL_STORY_DATA_RC51__.records) for (const phase of ['pre', 'post', 'firstPost', 'awakenPre']) {
  if (record.zone !== 'dist00' && record[phase]) cardTexts[`${record.zone}:${phase}`] = record[phase];
}
const availableKey = Object.keys(cardTexts).find(key => manifest.scenes[key]);
assert(availableKey, 'real-corpus playback requires at least one included combat card');
const pendingKey = (manifest.coverage?.pendingRoutes || []).find(key => cardTexts[key]);
// Complete releases also exercise an absent route without replacing any real audio.
const missingKey = pendingKey || 'not-in-canon:missing';
const missingText = cardTexts[pendingKey] || cardTexts[availableKey];
const payload = {availableKey, availableText: cardTexts[availableKey], missingKey, missingText};
const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="/assets/story-narration/v1/player.css">
<script src="/assets/story-narration/v1/player.js"></script>
<button id="start">Play actual narration</button><button id="missing">Open unavailable narration</button>
<div id="reader"><article></article><footer class="rc51-footer"><button id="continue">Continue reading</button></footer></div>
<script>
const cards=${JSON.stringify(payload)};
window.blockedCount=0; window.continued=0;
window.openCard=(key,text)=>{
  window.player?.stop();
  document.querySelector('article').textContent=text;
  const [zone,phase]=key.split(':');
  window.player=__HAPIL_STORY_NARRATION_V1__.attach({root:document.getElementById('reader'),text,key,zone,phase,ctx:{sound:true,voiceVolume:.3},onBlocked(){window.blockedCount++}});
};
document.getElementById('start').onclick=()=>openCard(cards.availableKey,cards.availableText);
document.getElementById('missing').onclick=()=>openCard(cards.missingKey,cards.missingText);
document.getElementById('continue').onclick=()=>{if(!window.player?.blocksAdvance)window.continued++};
</script>`;
const requests = [];
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost'); requests.push(url.pathname);
  if (url.pathname === '/') { res.setHeader('content-type', 'text/html; charset=utf-8'); return res.end(html); }
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep)) { res.statusCode = 403; return res.end(); }
  try {
    res.setHeader('content-type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.json') ? 'application/json' : file.endsWith('.css') ? 'text/css' : file.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav');
    res.end(fs.readFileSync(file));
  } catch { res.statusCode = 404; res.end(); }
});
const audioRequests = () => requests.filter(url => /\.(mp3|wav|ogg|m4a)$/i.test(url)).length;
(async () => {
  let browser;
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    browser = await playwright.chromium.launch({chromiumSandbox: true, headless: true, executablePath: process.env.HAPIL_CHROMIUM || undefined, args: []});
    const page = await browser.newPage(), errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    assert.equal(audioRequests(), 0, 'initial page load must not preload narration');
    await page.click('#start');
    await page.waitForFunction(() => window.player?.playing === true);
    assert.equal(await page.locator('article').textContent(), payload.availableText, 'included card preserves canonical text');
    assert(await page.locator('[data-narration-controls]').isVisible(), 'available card exposes playback controls');
    await page.evaluate(() => player.stop());

    const files = Object.entries(manifest.assets).map(([audio, entry]) => ({audio, duration: entry.duration, channels: entry.channels, legacy: false}));
    for (const entry of Object.values(manifest.originals)) files.push({audio: entry.audio, duration: entry.duration, legacy: true});
    assert.equal(files.filter(row => row.legacy).length, 2, 'decode both original performances');
    const results = await page.evaluate(async files => {
      const audioContext = new AudioContext(), rows = [];
      try {
        await audioContext.resume();
        for (const row of files) {
          const url = new URL(row.audio, new URL('/assets/story-narration/v1/manifest.json', location.href));
          const response = await fetch(url);
          if (!response.ok) throw Error('Audio HTTP ' + response.status + ': ' + row.audio);
          let decoded = await audioContext.decodeAudioData(await response.arrayBuffer());
          const duration = decoded.duration;
          if (Math.abs(duration - row.duration) > .3) throw Error('Duration mismatch ' + row.audio + ': ' + duration + ' vs ' + row.duration);
          if (!row.legacy && decoded.numberOfChannels !== row.channels) throw Error('Channel mismatch: ' + row.audio);
          rows.push({audio: row.audio, duration, channels: decoded.numberOfChannels, legacy: row.legacy});
          decoded = null;
        }
      } finally { await audioContext.close(); }
      return rows;
    }, files);
    assert.equal(results.length, files.length);
    assert(results.every(row => row.channels >= 1 && row.duration > 0));

    const beforeMissing = audioRequests();
    await page.click('#missing');
    await page.waitForFunction(() => window.player?.status === 'unavailable');
    assert.equal(await page.locator('article').textContent(), missingText, 'pending narration preserves complete canonical text');
    assert.equal(await page.evaluate(() => player.blocksAdvance), false, 'missing narration never holds reading progress');
    assert.equal(await page.evaluate(() => player.playing), false);
    assert.equal(await page.evaluate(() => window.blockedCount), 1, 'missing narration releases its loading/pause hold exactly once');
    assert.equal(await page.locator('[data-narration-controls]:visible').count(), 0, 'unavailable narration hides all audio controls');
    assert.equal(await page.locator('[data-narration-play]:visible').count(), 0, 'unavailable narration has no retry button');
    assert.equal(await page.evaluate(() => player.play()), false, 'explicit play cannot start an unavailable route');
    assert.equal(await page.evaluate(() => player.status), 'unavailable', 'unavailable state survives an explicit retry');
    assert.equal(audioRequests(), beforeMissing, 'missing route must never fetch audio');
    await page.click('#continue');
    assert.equal(await page.evaluate(() => window.continued), 1, 'text fallback remains usable');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({pass: true, mode: manifest.coverage?.mode, actualDecodedFiles: results.length, includedMp3sDecoded: results.filter(row => !row.legacy).length, actualCardPlayed: availableKey, originalsDecoded: 2, missingRouteChecked: missingKey, realPendingRouteChecked: !!pendingKey, missingRouteTextFallback: true, missingRouteAudioRequests: audioRequests() - beforeMissing, maxDuration: Math.max(...results.map(row => row.duration))}, null, 2));
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); server.closeAllConnections(); server.close(); process.exitCode = 1; });
