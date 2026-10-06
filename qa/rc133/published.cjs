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
    report.runtimeExtension={base:extension.base,candidateCommit:extension.candidateCommit,sha256:sha256(extensionBytes),changedFiles:extension.files.length,extension2Base:extension2.base,extension2Sha256:sha256(extension2Bytes),extension2ChangedFiles:extension2.files.length,extension3Base:extension3.base,extension3Sha256:sha256(extension3Bytes),extension3ChangedFiles:extension3.files.length};
    const runtimeOutputs=new Map(delta.files.map(row=>[row.after.file,row.after]));
    for(const row of extension.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension2.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
    for(const row of extension3.files){if(row.after===null)runtimeOutputs.delete(row.file);else runtimeOutputs.set(row.file,row.after);}
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

    assert.equal(expected.size,287,'the exact approved RC133 public set contains 287 unique files');
    const localIndexHash = sha256(localBytes('index.html'));
    report.expectedFiles = expected.size;
    report.expectedArtOutputs = outputRows.length;
    report.expectedIndexSha256 = localIndexHash;
    save();
    await waitForExactHtml(localIndexHash, testedCommit);

    const fileResults = await mapLimit([...expected.values()], 8, item => verifyPublicFile(item, testedCommit));
    report.files = fileResults;
    save();
    assert(fileResults.every(row => row.status === 'passed'), 'every required public hash and byte length must match');

    const playwrightRoot = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
    assert(playwrightRoot, 'isolated Playwright runtime path is required');
    const { chromium } = require(path.join(playwrightRoot, 'playwright'));
    browser = await chromium.launch({ executablePath: process.env.HAPIL_CHROMIUM, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
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
    console.log('RC133_PUBLIC_RESULT', JSON.stringify({
      status: report.status,
      testedCommit: report.testedCommit,
      files: report.files.filter(row => row.status === 'passed').length,
      expectedFiles: report.expectedFiles,
      artOutputs: report.expectedArtOutputs,
      profiles: report.profiles.map(row => ({ name: row.name, status: row.status, errors: row.errors, httpErrors: row.httpErrors })),
    }));
    process.exitCode = report.status === 'passed' ? 0 : 1;
  }
}

main();
