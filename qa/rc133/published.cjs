'use strict';

// Read-only verification of the public RC133 deployment. This script never
// replaces network responses or edits live game state.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const { checkedUrl } = require('./public-url.cjs');

const root = path.resolve(__dirname, '../..');
const base = 'https://kjb7876-lang.github.io/hapil1/';
const baseUrl = new URL(base);
const manifestOnly = process.argv.includes('--manifest-only');
const outputDir = process.env.HAPIL_QA_OUTPUT || path.join(root, 'qa-results/rc133-public');
const fixedFiles = [
  'index.html',
  'assets/index-v31526.js',
  'assets/rc133/media-art.js',
  'assets/rc133/developer-maps.js',
  'assets/rc133/inner-final.js',
  'assets/rc133/samong-policy.js',
  'assets/rc91/samong-awakening.js',
  'qa/rc133/art-processing.json',
  'assets/rc137/art-data.js',
  'assets/rc137/boss-art.js',
  'assets/rc137/awakening-portraits.js',
  'assets/rc137/boss-projectiles-source.png',
  'assets/rc137/winter-thorn-sentry.png',
  'assets/rc137/u2-independent-sentries.png',
  'qa/rc137/art-manifest.json',
  'assets/rc138/battle-arena.js',
  'assets/rc138/map-data.js',
  'assets/rc138/map-format.js',
  'qa/rc138/map-format-manifest.json',
];
const expectedOutputCount = 44;
const expectedRuntimeCount = 53;
let personaOutputRows=[];
const report = {
  version: 'RC133',
  testedCommit: null,
  expectedSha: process.env.EXPECTED_SHA || null,
  githubSha: process.env.GITHUB_SHA || null,
  base,
  status: 'running',
  readiness: [],
  files: [],
  runtimeExtension: null,
  optionalDerivative: null,
  profiles: [],
  scope: 'Exact public bytes and normal new-story startup; no direct save/state injection, unlock, or campaign-completion claim',
};
fs.mkdirSync(outputDir, { recursive: true });
const save = () => fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(report, null, 2));
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const localBytes = file => fs.readFileSync(path.join(root, file));

function validateArtPath(file) {
  assert.equal(typeof file, 'string');
  assert.match(file, /^assets\/rc133\/art\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:png|webp)$/,
    'manifest image paths must be simple same-origin RC133 art filenames');
  assert(!file.includes('..'), 'manifest path traversal is forbidden');
  return file;
}

function expectedFile(file, metadata = null) {
  const bytes = localBytes(file);
  const digest = sha256(bytes);
  if (metadata) {
    assert.equal(digest, metadata.outputSha256, 'checked-in RC133 output hash: ' + file);
    assert.equal(bytes.length, metadata.outputBytes, 'checked-in RC133 output length: ' + file);
  }
  return {
    file,
    sha256: metadata?.outputSha256 || digest,
    bytes: metadata?.outputBytes ?? bytes.length,
    dimensions: metadata?.outputDimensions || null,
  };
}

async function waitForExactHtml(expectedHash, testedCommit) {
  const deadline = Date.now() + 5 * 60 * 1000;
  let attempt = 0;
  while (Date.now() < deadline) {
    const row = { attempt: ++attempt, at: new Date().toISOString() };
    try {
      const url = checkedUrl('index.html', 'rc133-ready', testedCommit + '-' + Date.now());
      const requestTimeout = Math.max(1, Math.min(12000, deadline - Date.now()));
      const response = await fetch(url, { cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(requestTimeout) });
      const bytes = Buffer.from(await response.arrayBuffer());
      row.status = response.status;
      row.sha256 = sha256(bytes);
      row.expectedSha256 = expectedHash;
      report.readiness.push(row);
      save();
      if (response.status === 200 && row.sha256 === expectedHash) {
        console.log('RC133 exact public index ready', JSON.stringify({ testedCommit, sha256: expectedHash, attempt }));
        return;
      }
    } catch (error) {
      row.error = String(error.message || error);
      report.readiness.push(row);
      save();
    }
    console.log('RC133 Pages readiness retry', JSON.stringify(row));
    await sleep(Math.max(0, Math.min(5000, deadline - Date.now())));
  }
  throw new Error('The public index.html did not match the exact checkout bytes within five minutes');
}

async function verifyPublicFile(item, testedCommit) {
  let last = null;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const url = checkedUrl(item.file, 'rc133-verify', testedCommit + '-' + attempt + '-' + crypto.randomBytes(5).toString('hex'));
      const response = await fetch(url, { cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(15000) });
      const bytes = Buffer.from(await response.arrayBuffer());
      const actualHash = sha256(bytes);
      const result = {
        file: item.file,
        attempt,
        httpStatus: response.status,
        expectedSha256: item.sha256,
        actualSha256: actualHash,
        expectedBytes: item.bytes,
        actualBytes: bytes.length,
        expectedDimensions: item.dimensions,
      };
      if (response.status === 200 && actualHash === item.sha256 && bytes.length === item.bytes) {
        return { ...result, status: 'passed' };
      }
      last = { ...result, error: 'Public response did not match expected status, SHA-256, and byte length' };
    } catch (error) {
      last = { file: item.file, attempt, error: String(error.message || error) };
    }
    if (attempt < 6) await sleep(3000);
  }
  return { ...last, file: item.file, status: 'failed' };
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }));
  return results;
}

function runtimeDimensions() {
  const art = window.__HAPIL_MEDIA_ART_RC133__;
  const diagnostics = art.diagnostics();
  const images = art.assets().map(source => {
    const image = art.picture(source);
    return {
      file: source.replace(/^\.\//, '').split('?')[0],
      width: image?.naturalWidth || 0,
      height: image?.naturalHeight || 0,
      decoded: !!image?.complete && !!image?.naturalWidth,
    };
  });
  return { diagnostics, images };
}

async function runProfile(browser, profile, outputRows) {
  const [name, width, height, mobile] = profile;
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: mobile ? 2 : 1,
  });
  const page = await context.newPage();
  const row = {
    name,
    viewport: { width, height, mobile, hasTouch: mobile },
    persistence: 'fresh ephemeral browser context; no direct state/save injection; normal native autosave may occur only within this context',
    errors: [],
    httpErrors: [],
    status: 'running',
  };
  report.profiles.push(row);
  page.setDefaultTimeout(30000);
  page.on('pageerror', error => row.errors.push(String(error.stack || error)));
  page.on('response', response => {
    if (response.status() >= 400) row.httpErrors.push({ url: response.url(), status: response.status() });
  });
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('qa', '1');
    url.searchParams.set('rc133-qa', name + '-' + Date.now());
    await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForFunction(expectedRuntimeCount => {
      const native = window.__HAPIL_RC133_NATIVE__;
      const art = window.__HAPIL_MEDIA_ART_RC133__;
      if (window.__HAPIL_NATIVE_ARENA_RC138__?.installed!==true||native?.installed !== true || art?.ready !== true || window.__HAPIL_BOSS_ART_RC137__?.ready !== true) return false;
      const d = art.diagnostics();
      return d.ready === true && d.required === expectedRuntimeCount && d.decoded === expectedRuntimeCount && d.failed.length === 0;
    }, expectedRuntimeCount, { timeout: 60000 });

    const narration139=await page.evaluate(()=>{const A=__HAPIL_NARRATION_START_RC139__,d=__HAPIL_STORY_DATA_RC51__;return {delayMs:A?.delayMs,displayEllipses:(d.raw.match(/\.{3,}|…/g)||[]).length,restoredFields:d.narrationTextRevision.displayRestoredFields,originalWrapped:__HAPIL_STORY_VOICE_RC49__?.startRC139===true,spokenReconstruction:A.voiceText(d.raw)===d.raw?false:true};});
    assert.deepEqual(narration139,{delayMs:500,displayEllipses:14,restoredFields:23,originalWrapped:true,spokenReconstruction:true});row.narration139=narration139;
    const imageData = await page.evaluate(runtimeDimensions);
    assert.deepEqual(imageData.diagnostics, { ready: true, decoded: expectedRuntimeCount, required: expectedRuntimeCount, failed: [] },
      'all 53 required public art images must decode');
    const observedByFile = new Map(imageData.images.map(image => [image.file, image]));
    assert.equal(imageData.images.length, expectedRuntimeCount, 'runtime decoder exposes all 53 required outputs');
    assert.equal(observedByFile.size, expectedRuntimeCount, 'runtime art paths are unique');
    const dimensions = outputRows.concat(personaOutputRows).map(output => {
      const image = observedByFile.get(output.file);
      assert(image, 'runtime must decode manifest output: ' + output.file);
      assert.equal(image.decoded, true, 'runtime image decoded: ' + output.file);
      assert.equal(image.width, output.dimensions[0], 'public image width: ' + output.file);
      assert.equal(image.height, output.dimensions[1], 'public image height: ' + output.file);
      return { file: output.file, width: image.width, height: image.height };
    });
    row.art = { diagnostics: imageData.diagnostics, decodedDimensions: dimensions };
    row.mobMotions137=await page.evaluate(()=>{const M=window.__HAPIL_MOB_MOTIONS_RC137__;return {ids:M.data.actors.length,newFrames:M.data.sources.reduce((n,s)=>n+s.cells.length,0),metrics:M.metrics()};});
    assert.equal(row.mobMotions137.ids,197);assert.equal(row.mobMotions137.newFrames,133);assert.deepEqual(row.mobMotions137.metrics.errors,[]);
    row.bossArt137=await page.evaluate(()=>{const A=window.__HAPIL_BOSS_ART_RC137__;return {ready:A.ready,owners:Object.keys(A.data.owners).length,cells:A.data.cells.length,error:window.__HAPIL_BOSS_ART_RC137_ERROR__??null,policy:A.policy};});
    assert.deepEqual({ready:row.bossArt137.ready,owners:row.bossArt137.owners,cells:row.bossArt137.cells,error:row.bossArt137.error},{ready:true,owners:71,cells:26,error:null});

    // Enter a fresh ordinary STORY game using only the normal UI. No save or
    // gameplay fields are injected; ordinary autosaves stay inside this fresh
    // ephemeral browser context.
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '새 게임 시작', exact: true }).click();
    await page.getByRole('button', { name: '이 편성으로 접속', exact: true }).click();
    await page.waitForFunction(() => window.__MONGSE_QA_STATE__?.zone === 'dist00', null, { timeout: 30000 });
    for (let i = 0; i < 12 && await page.locator('#hapil-story-rc51').count(); i++) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);
    }
    const canvas = page.locator('.game-stage canvas:visible').first();
    await canvas.waitFor({ state: 'visible', timeout: 15000 });
    const live = await page.evaluate(() => {
      const state = window.__MONGSE_QA_STATE__;
      return {
        zone: state?.zone ?? null,
        mode: window.__HAPIL_MODES_V31346__?.mode(state) ?? state?.gameModeV31346 ?? null,
        hp: state?.hp ?? null,
        time: state?.time ?? null,
        canvas: [...document.querySelectorAll('.game-stage canvas')].some(element => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        }),
      };
    });
    assert.equal(live.zone, 'dist00', 'normal new game reaches the first story map');
    assert.equal(live.mode, 'STORY', 'normal new game remains in STORY mode');
    assert.equal(live.canvas, true, 'the actual game canvas is visible');
    assert(Number.isFinite(live.hp) && live.hp > 0, 'live player HP remains above zero at observation');
    row.arena138=await page.evaluate(async()=>{
      const R=window.__HAPIL_BATTLE_ARENA_RC138__,s=window.__MONGSE_QA_STATE__,rows=window.__HAPIL_MAP_DATA_RC138__,entries=Object.entries(rows),generated=entries.filter(([zone,row])=>row.decision==='new-imagegen'||(zone==='ep1a10'&&row.decision==='story-aligned-art')),images=[];
      for(const[zone,row]of generated){const im=new Image();im.src=row.activeMap;await im.decode();images.push({zone,path:row.activeMap,width:im.naturalWidth,height:im.naturalHeight});}
      const road=new Image();road.src=rows.murder01.activeMap;await road.decode();
      return{snapshot:R.snapshot(s),playerValid:R.contains(s,'left',.8),enemyValid:s.enemies.filter(R.live).every(a=>R.contains(a,'right',.72)),maps:entries.length,newImages:images,ep1a10:rows.ep1a10,murder01:rows.murder01,reusedRoad:{path:rows.murder01.activeMap,width:road.naturalWidth,height:road.naturalHeight},split:window.__HAPIL_PORTRAIT_SPLIT_RC108__.metrics()};
    });
    assert.equal(row.arena138.maps,55);
    assert.deepEqual(row.arena138.newImages.map(image=>image.zone).sort(),['ep1a08','ep1a10','ep1b07','kair02','kair04','murder02']);
    assert.equal(row.arena138.ep1a10.decision,'story-aligned-art');
    assert.equal(row.arena138.ep1a10.activeMap,'./assets/generated-story10-cycle-20261005/ep1a10/ep1a10-hospital-denial-map.png');
    assert.equal(row.arena138.murder01.decision,'reassigned-original-ep1a10-road');
    assert.equal(row.arena138.reusedRoad.path,'./assets/v31345/maps/ep1a10.webp');
    assert(row.arena138.snapshot.locked&&row.arena138.playerValid&&row.arena138.enemyValid,'normal public Story owns actual halves');
    if(name.includes('portrait')){assert.equal(row.arena138.split.cameras.hero.side,'left');assert.equal(row.arena138.split.cameras.boss.side,'right');}
    row.game = live;
    assert.deepEqual(row.errors, [], 'no browser page errors');
    assert.deepEqual(row.httpErrors, [], 'no HTTP errors');
    row.status = 'passed';
  } catch (error) {
    row.status = 'failed';
    row.error = String(error.stack || error);
  } finally {
    await page.screenshot({ path: path.join(outputDir, 'published-' + name + '.png') }).catch(error => {
      row.screenshotError = String(error.message || error);
    });
    save();
    console.log('RC133_PUBLIC_PROFILE', JSON.stringify(row));
    await context.close();
  }
}

async function main() {
  let browser;
  try {
    const testedCommit = cp.execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    report.testedCommit = testedCommit;
    assert.match(testedCommit, /^[0-9a-f]{40}$/i, 'checkout must have an exact full commit SHA');
    assert.equal(process.env.EXPECTED_SHA, testedCommit, 'EXPECTED_SHA must equal the exact checkout SHA');
    assert.equal(process.env.GITHUB_SHA, testedCommit, 'GITHUB_SHA must equal the exact checkout SHA');
    report.runtimeRequiredImages=expectedRuntimeCount; report.catalog='44 original art outputs plus nine approved Persona crops';

    const manifest = JSON.parse(localBytes('qa/rc133/art-processing.json').toString('utf8'));
    assert.equal(manifest.schema, 'rc133-art-processing-v1');
    assert.equal(manifest.outputs.length, expectedOutputCount, 'manifest must contain exactly 44 outputs');
    const outputRows = manifest.outputs.map(row => {
      const file = validateArtPath(row.file);
      assert.match(row.outputSha256, /^[a-f0-9]{64}$/);
      assert(Number.isSafeInteger(row.outputBytes) && row.outputBytes > 0);
      assert(Array.isArray(row.outputDimensions) && row.outputDimensions.length === 2);
      assert(row.outputDimensions.every(value => Number.isSafeInteger(value) && value > 0));
      return expectedFile(file, row);
    });
    assert.equal(new Set(outputRows.map(row => row.file)).size, expectedOutputCount, 'manifest output paths must be unique');


    const personaManifest = JSON.parse(localBytes('assets/rc134/persona-skills/manifest.json'));
    assert.equal(personaManifest.outputs.length, 9, 'nine approved Persona crops');
    const keys = ['small-orb','eye','diamond','clock','star','eclipse','lance','shield','vortex'];
    personaOutputRows = personaManifest.outputs.map((row,index) => {
      assert.equal(row.key,keys[index]);
      assert.equal(row.path,'assets/rc134/persona-skills/'+keys[index]+'.png');
      assert.match(row.sha256,/^[a-f0-9]{64}$/);
      assert(Array.isArray(row.size)&&row.size.length===2&&row.size.every(n=>Number.isSafeInteger(n)&&n>0));
      const bytes=localBytes(row.path);assert.equal(sha256(bytes),row.sha256);
      return {file:row.path,sha256:row.sha256,bytes:bytes.length,dimensions:row.size};
    });

    const expected = new Map(fixedFiles.map(file => [file, expectedFile(file)]));
    for (const row of outputRows.concat(personaOutputRows)) expected.set(row.file, row);
    assert.equal(expected.size, fixedFiles.length + expectedRuntimeCount, 'fixed files and all 53 outputs are unique');
    const delta=JSON.parse(localBytes('qa/rc133/authorized-runtime-delta.json'));
    const extensionBytes=localBytes('qa/rc133/authorized-runtime-extension.json');assert.equal(sha256(extensionBytes),'20fb3ec5485ee26ee34cdc77b5dca73a58a08cf52c5a3259c44f7800ffb08b82','exact authorized runtime extension digest');const extension=JSON.parse(extensionBytes);
    assert.equal(extension.base,'0a4965a17ac69a05ffd79645a537a0f202417408');assert.equal(extension.previousDeltaSha256,'47e45218eea38f09453ddaa5b2f8639e9a5d9e0f1c0a332c4382a5fa6dd27b11');
    const extension2Bytes=localBytes('qa/rc133/authorized-runtime-extension-2.json');assert.equal(sha256(extension2Bytes),'917d061a8a533c914d123aab980ae7c5a5c7266342cdd6d3e0e48505b9e1bc6f','exact second authorized runtime extension digest');const extension2=JSON.parse(extension2Bytes);
    assert.equal(extension2.version,1);assert.equal(extension2.base,'be4cf6a839ada85acf5a980de899aa661c1a2bc0');assert.deepEqual(extension2.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension2.previousExtensionSha256,sha256(extensionBytes));assert.equal(extension2.files.length,1,'second extension contains the exact startup HTML delta');
    const firstIndex=extension.files.find(row=>row.file==='index.html'),secondIndex=extension2.files.find(row=>row.file==='index.html');assert(firstIndex?.after&&secondIndex?.after,'both chained extensions retain the exact index output');assert.equal(secondIndex.before.gitBlob,firstIndex.after.gitBlob,'second index delta starts from the prior extension output');
    const extension3Bytes=localBytes('qa/rc133/authorized-runtime-extension-3.json');assert.equal(sha256(extension3Bytes),'cba933bc3b3692a2d1c155826f177d4d31d14d903a69221785345b7017ce4976','exact third authorized runtime extension digest');const extension3=JSON.parse(extension3Bytes);
    assert.equal(extension3.version,1);assert.equal(extension3.base,'fef4463b7e1c9f13c05e2266aa44bb631426af80');assert.deepEqual(extension3.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension3.previousExtensionSha256,sha256(extension2Bytes));assert.equal(extension3.files.find(row=>row.file==='index.html')?.before.gitBlob,secondIndex.after.gitBlob,'third index delta starts from the prior extension output');
    const extension4Bytes=localBytes('qa/rc133/authorized-runtime-extension-4.json');assert.equal(sha256(extension4Bytes),'2dbd0fc8914afca21b25a01062cc0ffbc94594b10d8b0a98b2322dd5b07ddb4a','exact fourth authorized runtime extension digest');const extension4=JSON.parse(extension4Bytes);
    assert.equal(extension4.version,1);assert.equal(extension4.base,'fafa1d2ad336753fa74513c7646823126527427a');assert.deepEqual(extension4.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension4.previousExtensionSha256,sha256(extension3Bytes));assert.equal(extension4.files.find(row=>row.file==='index.html')?.before.gitBlob,extension3.files.find(row=>row.file==='index.html')?.after.gitBlob,'fourth index delta starts from the prior extension output');
    const extension5Bytes=localBytes('qa/rc133/authorized-runtime-extension-5.json');assert.equal(sha256(extension5Bytes),'b3070d19c90ac7df0eba62ab7520c32142561c92b79a3b3bc2438487462fa5ed','exact fifth authorized runtime extension digest');const extension5=JSON.parse(extension5Bytes);
    assert.equal(extension5.version,1);assert.equal(extension5.base,'51bcd427017e88350b1c5c02e4dd7dce6bad1f8f');assert.deepEqual(extension5.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension5.previousExtensionSha256,sha256(extension4Bytes));assert.equal(extension5.files.find(row=>row.file==='index.html')?.before.gitBlob,extension4.files.find(row=>row.file==='index.html')?.after.gitBlob,'fifth index delta starts from the prior extension output');
    const extension6Bytes=localBytes('qa/rc133/authorized-runtime-extension-6.json');assert.equal(sha256(extension6Bytes),'7698992cb90cc1480985a9e7c61c6543c239934f3be9eb6b0a5163df6b0c5413','exact sixth authorized runtime extension digest');const extension6=JSON.parse(extension6Bytes);
    assert.equal(extension6.version,1);assert.equal(extension6.base,'9176b5752fda94f41a72b48012dbaa01f17d0ff5');assert.deepEqual(extension6.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension6.previousExtensionSha256,sha256(extension5Bytes));assert.equal(extension6.files.find(row=>row.file==='index.html')?.before.gitBlob,extension5.files.find(row=>row.file==='index.html')?.after.gitBlob,'sixth index delta starts from the prior extension output');
    const extension7Bytes=localBytes('qa/rc133/authorized-runtime-extension-7.json');assert.equal(sha256(extension7Bytes),'894d0da81edf4e88348f9ec436f44ce75928126a2e2095e3dcf878235faf8fe2','exact seventh authorized runtime extension digest');const extension7=JSON.parse(extension7Bytes);
    assert.equal(extension7.version,1);assert.equal(extension7.base,'c3c18acdea64fc8255d265fd3c66bae28a94ddb4');assert.deepEqual(extension7.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension7.previousExtensionSha256,sha256(extension6Bytes));
    const extension8Bytes=localBytes('qa/rc133/authorized-runtime-extension-8.json');assert.equal(sha256(extension8Bytes),'73a01f3e7598ae69bb199ef208a433437851fa479bdf03615cbbc9e028b5d660','exact eighth authorized runtime extension digest');const extension8=JSON.parse(extension8Bytes);
    assert.equal(extension8.version,1);assert.equal(extension8.base,'98e27c4e25f639989f3d41034a915567e9a31f4e');assert.deepEqual(extension8.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension8.previousExtensionSha256,sha256(extension7Bytes));
    const extension9Bytes=localBytes('qa/rc133/authorized-runtime-extension-9.json');assert.equal(sha256(extension9Bytes),'64d2e3896ea9f448e76adb18ace5ca1e04867e7bd194808cdc253ed70f5b42d6','exact ninth authorized runtime extension digest');const extension9=JSON.parse(extension9Bytes);
    assert.equal(extension9.version,1);assert.equal(extension9.base,'8fbfa8f6983c70129e6deaadfd74c9e620483386');assert.deepEqual(extension9.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension9.previousExtensionSha256,sha256(extension8Bytes));
    const extension10Bytes=localBytes('qa/rc133/authorized-runtime-extension-10.json');assert.equal(sha256(extension10Bytes),'c069e870f5a6f3e2dd77c35ec461ad7f42400591c9d7411fb3e2db75ffbae2d2','exact tenth authorized runtime extension digest');const extension10=JSON.parse(extension10Bytes);
    assert.equal(extension10.version,1);assert.equal(extension10.base,'16fec1ca6cd6b4939dbb8a98a11b9ab62a0b2ef8');assert.deepEqual(extension10.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension10.previousExtensionSha256,sha256(extension9Bytes));
    const extension11Bytes=localBytes('qa/rc133/authorized-runtime-extension-11.json');assert.equal(sha256(extension11Bytes),'46c9ea04641aaee8b56bd75302bd36855b4f2ac376962aa84646f22c14e0ede1','exact eleventh authorized runtime extension digest');const extension11=JSON.parse(extension11Bytes);
    assert.equal(extension11.version,1);assert.equal(extension11.base,'a7a6990271d046f05531f389184df99e397e1f5f');assert.deepEqual(extension11.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension11.previousExtensionSha256,sha256(extension10Bytes));
    const extension12Bytes=localBytes('qa/rc133/authorized-runtime-extension-12.json');assert.equal(sha256(extension12Bytes),'b80f0b96ac1de271a95e4eaf43153b9da3e70ca02f72ad55b5946eeb809c79f3','exact twelfth authorized extension digest');const extension12=JSON.parse(extension12Bytes);assert.equal(extension12.base,'b02bc568f1faf66c4bf02e0a51f16e7dff67d197');assert.equal(extension12.previousExtensionSha256,sha256(extension11Bytes));
    const extension13Bytes=localBytes('qa/rc133/authorized-runtime-extension-13.json');assert.equal(sha256(extension13Bytes),'0d5f6268c360515eff35a98977776ee7e9f2c3139e1b7d7a69040ea8375c8192','exact thirteenth authorized extension digest');const extension13=JSON.parse(extension13Bytes);assert.equal(extension13.base,'3ca4874fb8e387ecc3922117922c08d7f7d541d4');assert.equal(extension13.previousExtensionSha256,sha256(extension12Bytes));
    const extension14Bytes=localBytes('qa/rc133/authorized-runtime-extension-14.json');assert.equal(sha256(extension14Bytes),'ccc65824c5e7be74c5d94d373e13b7de905015b2b581ab2037e3e8088b65fc89','exact fourteenth authorized extension digest');const extension14=JSON.parse(extension14Bytes);assert.equal(extension14.base,'c7bc9e7d97c4b961987049c656fe624b463e0a58');assert.equal(extension14.previousExtensionSha256,sha256(extension13Bytes));
    const extension15Bytes=localBytes('qa/rc133/authorized-runtime-extension-15.json');assert.equal(sha256(extension15Bytes),'6c65e3e0de6d92fcb4aa94a8e3c20ef74db7a31a1cf1120f9d5372f7cc159974','exact fifteenth extension digest');const extension15=JSON.parse(extension15Bytes);assert.equal(extension15.base,'3e45b69e3e30b6363f0c8cc53d18bdae76491ced');assert.equal(extension15.previousExtensionSha256,sha256(extension14Bytes));
    const extension16Bytes=localBytes('qa/rc133/authorized-runtime-extension-16.json');assert.equal(sha256(extension16Bytes),'c7d10f63b82a6d40126c49ba4b4f88016fbc7cc3fe65ae599d2f81aefcc34ff1','exact sixteenth extension digest');const extension16=JSON.parse(extension16Bytes);assert.equal(extension16.base,'8b24a22120d7787746339ed7c422eee149e04b22');assert.equal(extension16.previousExtensionSha256,sha256(extension15Bytes));
    const extension17Bytes=localBytes('qa/rc133/authorized-runtime-extension-17.json');assert.equal(sha256(extension17Bytes),'756aa754fef2ae3e6e786a7bd1f52e5df49bb1cd47d0f59b93489899602600ba','exact seventeenth extension digest');const extension17=JSON.parse(extension17Bytes);assert.equal(extension17.base,'e568bc400fa674908c50bef99236a2752ce9f18a');assert.equal(extension17.previousExtensionSha256,sha256(extension16Bytes));
    const extension18Bytes=localBytes('qa/rc133/authorized-runtime-extension-18.json');assert.equal(sha256(extension18Bytes),'4280324566016df6f528c464237387b5bc7cce952807634680060e722c3e4415','exact eighteenth extension digest');const extension18=JSON.parse(extension18Bytes);assert.equal(extension18.base,'b9b0ea3bad7200e7cc1049ea8f5e712c386006e1');assert.equal(extension18.previousExtensionSha256,sha256(extension17Bytes));
    const extension19Bytes=localBytes('qa/rc133/authorized-runtime-extension-19.json');assert.equal(sha256(extension19Bytes),'58d8c4487e8435394cb6e7753f6d8c20c0eed5b627f0a5b89cee2b0ad690177b','exact nineteenth extension digest');const extension19=JSON.parse(extension19Bytes);assert.equal(extension19.base,'71ba98e3f17f173e073b21e753b6e7d6ba81596f');assert.equal(extension19.previousExtensionSha256,sha256(extension18Bytes));
    const extension20Bytes=localBytes('qa/rc133/authorized-runtime-extension-20.json');assert.equal(sha256(extension20Bytes),'6a56829b728ac365c0b11d2f105ee7b687583df22a27be0e362c579145c6386e','exact twentieth extension digest');const extension20=JSON.parse(extension20Bytes);assert.equal(extension20.base,'6bc749f3f274cdcfb7979aca0d22dc3698549543');assert.equal(extension20.previousExtensionSha256,sha256(extension19Bytes));
    const extension21Bytes=localBytes('qa/rc133/authorized-runtime-extension-21.json');assert.equal(sha256(extension21Bytes),'0e21ee9822b9c946b2555873d27a4b041bfafd5175f9e5a201e5a0087d52297a','exact twenty-first extension digest');const extension21=JSON.parse(extension21Bytes);assert.equal(extension21.version,1);assert.equal(extension21.base,'73a410daf5267fdf1ad2a9cdbaffd85afc407f09');assert.deepEqual(extension21.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension21.previousExtensionSha256,sha256(extension20Bytes));assert.deepEqual(extension21.files.map(row=>row.file),['assets/index-v31526.js','assets/rc133/inner-final.js','assets/rc133/native-install.js.txt','assets/rc155/ego-guardian.js','index.html']);
    const extension22Bytes=localBytes('qa/rc133/authorized-runtime-extension-22.json');assert.equal(sha256(extension22Bytes),'c13cd630d60c3472143090095c40de3fbfa0756fa410e1af5aa1c083d8ad75a6','exact twenty-second extension digest');const extension22=JSON.parse(extension22Bytes);assert.equal(extension22.version,1);assert.equal(extension22.base,'8cf7704375a028ec947abc5431d9e72c1c3b2f68');assert.deepEqual(extension22.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension22.previousExtensionSha256,sha256(extension21Bytes));
    const extension23Bytes=localBytes('qa/rc133/authorized-runtime-extension-23.json');assert.equal(sha256(extension23Bytes),'f8d1ee758f530d24616a55614bd9c1c094ff5b7483161872c3db3181b818896f','exact twenty-third extension digest');const extension23=JSON.parse(extension23Bytes);assert.equal(extension23.version,1);assert.equal(extension23.base,'3ba8183dc9a8534049759b8e943475d9b8a96d46');assert.deepEqual(extension23.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension23.previousExtensionSha256,sha256(extension22Bytes));
    const extension24Bytes=localBytes('qa/rc133/authorized-runtime-extension-24.json');assert.equal(sha256(extension24Bytes),'9bc84ed623356b9e2680ba0c58617741e0983aba0ea019da47c2b096bb01af39','exact twenty-fourth extension digest');const extension24=JSON.parse(extension24Bytes);assert.equal(extension24.version,1);assert.equal(extension24.base,'4f0b6a7a43e049323e59bb22e9bb11a6b6a7584f');assert.deepEqual(extension24.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension24.previousExtensionSha256,sha256(extension23Bytes));
    const extension25Bytes=localBytes('qa/rc133/authorized-runtime-extension-25.json');assert.equal(sha256(extension25Bytes),'92c046f5cd555602f9a4e0c52aff93d88643055374fa999451cb2484d16a4624','exact twenty-fifth extension digest');const extension25=JSON.parse(extension25Bytes);assert.equal(extension25.version,1);assert.equal(extension25.base,'867009b0a767f3531b78f730d776e491312f8ec6');assert.deepEqual(extension25.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension25.previousExtensionSha256,sha256(extension24Bytes));
    const extension26Bytes=localBytes('qa/rc133/authorized-runtime-extension-26.json');assert.equal(sha256(extension26Bytes),'0a9916507d5e2c80bc18090478c9766233df489b9e112c65ff5b227be41dcbb4','exact twenty-sixth extension digest');const extension26=JSON.parse(extension26Bytes);assert.equal(extension26.version,1);assert.equal(extension26.base,'e7e12199914f0544a5405694d50efe057dee3360');assert.deepEqual(extension26.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension26.previousExtensionSha256,sha256(extension25Bytes));
    const extension27Bytes=localBytes('qa/rc133/authorized-runtime-extension-27.json');assert.equal(sha256(extension27Bytes),'4317936a257b8b65cbaee8cc43c6fd269be67b24a559173bc83108cd086ed0be','exact twenty-seventh extension digest');const extension27=JSON.parse(extension27Bytes);assert.equal(extension27.version,1);assert.equal(extension27.base,'74109f2b19a5e9563e67b13769e6a9211591aff0');assert.deepEqual(extension27.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension27.previousExtensionSha256,sha256(extension26Bytes));
    const extension28Bytes=localBytes('qa/rc133/authorized-runtime-extension-28.json');assert.equal(sha256(extension28Bytes),'bb365419555049a1a30f74f10806285976dea3bd66e5e65fee905513a4e05d64','exact twenty-eighth extension digest');const extension28=JSON.parse(extension28Bytes);assert.equal(extension28.version,1);assert.equal(extension28.base,'fdc4a066fa6e831839458cc5586d75cc8030df26');assert.deepEqual(extension28.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension28.previousExtensionSha256,sha256(extension27Bytes));
    const extension29Bytes=localBytes('qa/rc133/authorized-runtime-extension-29.json');assert.equal(sha256(extension29Bytes),'5ae43f820fbabe70cca92840203a1abd116dc0acfef3cb42d1e97613d7b66ce8','exact twenty-ninth extension digest');const extension29=JSON.parse(extension29Bytes);assert.equal(extension29.version,1);assert.equal(extension29.base,'c589b854acb58a71dd255d5b58a6b3207ed80e84');assert.deepEqual(extension29.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension29.previousExtensionSha256,sha256(extension28Bytes));
    const extension30Bytes=localBytes('qa/rc133/authorized-runtime-extension-30.json');assert.equal(sha256(extension30Bytes),'ee1f278079f39c783401ebc538aa3fd988e57c31c4836f48e96c1d663aa18d0b','exact thirtieth extension digest');const extension30=JSON.parse(extension30Bytes);assert.equal(extension30.version,1);assert.equal(extension30.base,'679f8d2d066142dd6e65b74a03590796c216b464');assert.deepEqual(extension30.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension30.previousExtensionSha256,sha256(extension29Bytes));
    const extension31Bytes=localBytes('qa/rc133/authorized-runtime-extension-31.json');assert.equal(sha256(extension31Bytes),'d55719022dd94b74d0ebd7b8a1e67c7f0067da0814494094394d27fc9748dfba','exact thirty-first extension digest');const extension31=JSON.parse(extension31Bytes);assert.equal(extension31.version,1);assert.equal(extension31.base,'6a613e574cad55ef37e415ad7059f5b2b5d65000');assert.deepEqual(extension31.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension31.previousExtensionSha256,sha256(extension30Bytes));
    const extension32Bytes=localBytes('qa/rc133/authorized-runtime-extension-32.json');assert.equal(sha256(extension32Bytes),'fe18a30c1338b0864b3c562fbb8f1425efe4635c7dee78b6c06099c7298da8a0','exact thirty-second extension digest');const extension32=JSON.parse(extension32Bytes);assert.equal(extension32.version,1);assert.equal(extension32.base,'538a6b87a6ac2ecef840a380a5aa871a736025b1');assert.deepEqual(extension32.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension32.previousExtensionSha256,sha256(extension31Bytes));
    const extension33Bytes=localBytes('qa/rc133/authorized-runtime-extension-33.json');assert.equal(sha256(extension33Bytes),'5502195824e87afae3dc14e96b5a1aa72efe26140e232f6111c861d645094986','exact thirty-third extension digest');const extension33=JSON.parse(extension33Bytes);assert.equal(extension33.version,1);assert.equal(extension33.base,'21ea2cfdb57265deed39c6ecbd68f2e3ce4f6dbb');assert.deepEqual(extension33.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension33.previousExtensionSha256,sha256(extension32Bytes));
    const extension34Bytes=localBytes('qa/rc133/authorized-runtime-extension-34.json');assert.equal(sha256(extension34Bytes),'8a3239ca382bb81f533fdbcc1dfc1380f70e1609fad93852cfce93e2c5f40041','exact thirty-fourth extension digest');const extension34=JSON.parse(extension34Bytes);assert.equal(extension34.version,1);assert.equal(extension34.base,'5a88b7eb6147a3dbd4c952f5baa28dda6543b683');assert.deepEqual(extension34.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension34.previousExtensionSha256,sha256(extension33Bytes));
    const extension35Bytes=localBytes('qa/rc133/authorized-runtime-extension-35.json');assert.equal(sha256(extension35Bytes),'00632015a4ce751aca4674821382b8879cc8556a192f92fccf2de90f98a9ac77','exact thirty-fifth extension digest');const extension35=JSON.parse(extension35Bytes);assert.equal(extension35.version,1);assert.equal(extension35.base,'0955df81c0d335c1b99787a3f3114e99dbab31c0');assert.deepEqual(extension35.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension35.previousExtensionSha256,sha256(extension34Bytes));
    const extension36Bytes=localBytes('qa/rc133/authorized-runtime-extension-36.json');assert.equal(sha256(extension36Bytes),'246cb3993b817d42262ef893748b34776a85f96f1f40d4e470bfabda268d801e','exact thirty-sixth extension digest');const extension36=JSON.parse(extension36Bytes);assert.equal(extension36.version,1);assert.equal(extension36.base,'b94b4196140797a6250f28db911f3391836f885a');assert.deepEqual(extension36.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension36.previousExtensionSha256,sha256(extension35Bytes));
    const extension37Bytes=localBytes('qa/rc133/authorized-runtime-extension-37.json');assert.equal(sha256(extension37Bytes),'7d16ab130552f53d2bb501b93015efd34d338a728ff22507866c405c09a3bd66','exact thirty-seventh extension digest');const extension37=JSON.parse(extension37Bytes);assert.equal(extension37.version,1);assert.equal(extension37.base,'7963058a238f0c2bf851f1929e2ac82f8832a20f');assert.deepEqual(extension37.protectedRoots,['assets','audio','data','index.html']);assert.equal(extension37.previousExtensionSha256,sha256(extension36Bytes));
    report.runtimeExtension={base:extension.base,candidateCommit:extension.candidateCommit,sha256:sha256(extensionBytes),changedFiles:extension.files.length,extension2Base:extension2.base,extension2Sha256:sha256(extension2Bytes),extension2ChangedFiles:extension2.files.length,extension3Base:extension3.base,extension3Sha256:sha256(extension3Bytes),extension3ChangedFiles:extension3.files.length,extension4Base:extension4.base,extension4Sha256:sha256(extension4Bytes),extension4ChangedFiles:extension4.files.length,extension5Base:extension5.base,extension5Sha256:sha256(extension5Bytes),extension5ChangedFiles:extension5.files.length,extension6Base:extension6.base,extension6Sha256:sha256(extension6Bytes),extension6ChangedFiles:extension6.files.length,extension7Base:extension7.base,extension7Sha256:sha256(extension7Bytes),extension7ChangedFiles:extension7.files.length,extension8Base:extension8.base,extension8Sha256:sha256(extension8Bytes),extension8ChangedFiles:extension8.files.length,extension9Base:extension9.base,extension9Sha256:sha256(extension9Bytes),extension9ChangedFiles:extension9.files.length,extension10Base:extension10.base,extension10Sha256:sha256(extension10Bytes),extension10ChangedFiles:extension10.files.length,extension11Base:extension11.base,extension11Sha256:sha256(extension11Bytes),extension11ChangedFiles:extension11.files.length,extension12Base:extension12.base,extension12Sha256:sha256(extension12Bytes),extension12ChangedFiles:extension12.files.length,extension13Base:extension13.base,extension13Sha256:sha256(extension13Bytes),extension13ChangedFiles:extension13.files.length,extension14Base:extension14.base,extension14Sha256:sha256(extension14Bytes),extension14ChangedFiles:extension14.files.length,extension15Base:extension15.base,extension15Sha256:sha256(extension15Bytes),extension15ChangedFiles:extension15.files.length,extension16Base:extension16.base,extension16Sha256:sha256(extension16Bytes),extension16ChangedFiles:extension16.files.length,extension17Base:extension17.base,extension17Sha256:sha256(extension17Bytes),extension17ChangedFiles:extension17.files.length,extension18Base:extension18.base,extension18Sha256:sha256(extension18Bytes),extension18ChangedFiles:extension18.files.length,extension19Base:extension19.base,extension19Sha256:sha256(extension19Bytes),extension19ChangedFiles:extension19.files.length,extension20Base:extension20.base,extension20Sha256:sha256(extension20Bytes),extension20ChangedFiles:extension20.files.length,extension21Base:extension21.base,extension21Sha256:sha256(extension21Bytes),extension21ChangedFiles:extension21.files.length,extension22Base:extension22.base,extension22Sha256:sha256(extension22Bytes),extension22ChangedFiles:extension22.files.length,extension23Base:extension23.base,extension23Sha256:sha256(extension23Bytes),extension23ChangedFiles:extension23.files.length,extension24Base:extension24.base,extension24Sha256:sha256(extension24Bytes),extension24ChangedFiles:extension24.files.length,extension25Base:extension25.base,extension25Sha256:sha256(extension25Bytes),extension25ChangedFiles:extension25.files.length,extension26Base:extension26.base,extension26Sha256:sha256(extension26Bytes),extension26ChangedFiles:extension26.files.length,extension27Base:extension27.base,extension27Sha256:sha256(extension27Bytes),extension27ChangedFiles:extension27.files.length,extension28Base:extension28.base,extension28Sha256:sha256(extension28Bytes),extension28ChangedFiles:extension28.files.length,extension29Base:extension29.base,extension29Sha256:sha256(extension29Bytes),extension29ChangedFiles:extension29.files.length,extension30Base:extension30.base,extension30Sha256:sha256(extension30Bytes),extension30ChangedFiles:extension30.files.length,extension31Base:extension31.base,extension31Sha256:sha256(extension31Bytes),extension31ChangedFiles:extension31.files.length,extension32Base:extension32.base,extension32Sha256:sha256(extension32Bytes),extension32ChangedFiles:extension32.files.length,extension33Base:extension33.base,extension33Sha256:sha256(extension33Bytes),extension33ChangedFiles:extension33.files.length,extension34Base:extension34.base,extension34Sha256:sha256(extension34Bytes),extension34ChangedFiles:extension34.files.length,extension35Base:extension35.base,extension35Sha256:sha256(extension35Bytes),extension35ChangedFiles:extension35.files.length,extension36Base:extension36.base,extension36Sha256:sha256(extension36Bytes),extension36ChangedFiles:extension36.files.length,extension37Base:extension37.base,extension37Sha256:sha256(extension37Bytes),extension37ChangedFiles:extension37.files.length};
    const runtimeOutputs=new Map(delta.files.map(row=>[row.after.file,row.after]));
    for(const row of extension.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension2.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension3.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension4.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension5.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension6.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension7.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension8.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension9.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension10.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension11.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension12.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension13.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension14.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension15.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension16.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension17.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension18.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension19.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension20.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension21.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension22.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension23.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension24.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension25.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension26.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension27.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension28.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension29.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension30.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension31.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension32.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension33.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension34.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension35.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension36.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension37.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of runtimeOutputs.values()){const file=row.file;assert(/^(assets\/|audio\/|data\/|index\.html$)/.test(file));const checked=expectedFile(file);assert.equal(checked.sha256,row.sha256,'current exact authorized bytes '+file);expected.set(file,checked);}
    for(const file of ['qa/rc137/mob-motion-manifest.json','qa/rc137/enemy-classes.json'])expected.set(file,expectedFile(file));

    const derivative = manifest.externalDerivatives?.[0];
    if (derivative) {
      const file = validateArtPath(derivative.file);
      if (fs.existsSync(path.join(root, file))) {
        report.optionalDerivative = { checked: true, file };
        expected.set(file, expectedFile(file, derivative));
      } else {
        report.optionalDerivative = { checked: false, file, reason: 'optional derivative is absent from this checkout' };
      }
    } else {
      report.optionalDerivative = { checked: false, reason: 'manifest has no external derivative' };
    }

    const addedLayoutFiles=['assets/rc108/hud.css','assets/rc125/adaptive-battlefield.css'];
    for(const file of addedLayoutFiles){assert(expected.has(file),'required RC154 layout file '+file);const owner=file==='assets/rc125/adaptive-battlefield.css'?extension36:extension16;if(owner===extension36)assert.equal(owner.files.find(r=>r.file===file).before.gitBlob,extension20.files.find(r=>r.file===file).after.gitBlob,'layout keeps the exact previous authorized preimage');assert(owner.files.some(row=>row.file===file&&row.after?.sha256===expected.get(file).sha256),'layout file matches its exact pinned runtime extension '+file);}
    const egoOriginalFiles=extension22.files.filter(row=>row.before===null).map(row=>row.file);assert.equal(egoOriginalFiles.length,7,'four raw images, original manifest and two runtime modules');for(const file of egoOriginalFiles)assert(expected.has(file),'added EGO original/runtime file '+file);
    assert.equal(expected.size-egoOriginalFiles.length,302,'the prior 302-file set stays complete');
    assert.equal(expected.size-egoOriginalFiles.length-addedLayoutFiles.length,300,'the prior 299-file set plus the EGO entrypoint stays complete');
    assert.equal(expected.size,309,'the exact public set adds the seven EGO originals/runtime files');
    const localIndexHash = sha256(localBytes('index.html'));
    report.expectedFiles = expected.size;
    report.expectedArtOutputs = outputRows.length;
    report.expectedIndexSha256 = localIndexHash;
    save();
    if(manifestOnly){report.status='manifest-passed';report.scope='Local pinned manifest and file-byte preflight only; no public requests or browser verification';report.manifestFiles=[...expected.keys()].sort();return;}
    await waitForExactHtml(localIndexHash, testedCommit);

    const fileResults = await mapLimit([...expected.values()], 8, item => verifyPublicFile(item, testedCommit));
    report.files = fileResults;
    save();
    assert(fileResults.every(row => row.status === 'passed'), 'every required public hash and byte length must match');

    const playwrightRoot = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
    assert(playwrightRoot, 'isolated Playwright runtime path is required');
    const { chromium } = require(path.join(playwrightRoot, 'playwright'));
    browser = await chromium.launch({chromiumSandbox: true, channel: 'chrome',  args: ['--disable-dev-shm-usage'] });
    for (const profile of [
      ['pc', 1180, 757, false],
      ['portrait', 390, 844, true],
      ['landscape', 844, 390, true],
    ]) {
      await runProfile(browser, profile, outputRows);
    }
    report.status = report.profiles.length === 3 && report.profiles.every(row => row.status === 'passed') ? 'passed' : 'failed';
  } catch (error) {
    report.status = 'failed';
    report.error = String(error.stack || error);
    console.error(error);
  } finally {
    save();
    await browser?.close();
    console.log(manifestOnly?'RC133_LOCAL_MANIFEST_RESULT':'RC133_PUBLIC_RESULT', JSON.stringify({
      status: report.status,
      testedCommit: report.testedCommit,
      files: report.files.filter(row => row.status === 'passed').length,
      expectedFiles: report.expectedFiles,
      artOutputs: report.expectedArtOutputs,
      profiles: report.profiles.map(row => ({ name: row.name, status: row.status, errors: row.errors, httpErrors: row.httpErrors })),
    }));
    process.exitCode = report.status === (manifestOnly?'manifest-passed':'passed') ? 0 : 1;
  }
}

main();
