'use strict';

// RC223 camera integration QA against the real application bytes in official
// Chrome. No bundle bridge, appended hook, fake renderer, or local Playwright
// browser is used. Mobile profiles use an explicit mobile UA; isMobile alone
// does not identify a mobile device to the application classifier.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {chromium} = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright'));

const runnerRoot = path.resolve(__dirname, '..');
const appRoot = path.resolve(process.env.HAPIL_TEST_BASE || runnerRoot);
const out = path.resolve(process.env.HAPIL_QA_OUTPUT || '/tmp/rc223-camera-browser');
fs.mkdirSync(out, {recursive: true});
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => fs.readFileSync(path.join(appRoot, file));
const git = args => {
  try { return cp.execFileSync('git', args, {cwd: appRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim(); }
  catch { return null; }
};
const expectedSha = process.env.EXPECTED_SHA || null;
const appSha = git(['rev-parse', 'HEAD']);
if (expectedSha) assert.equal(appSha, expectedSha, 'served application checkout must match EXPECTED_SHA');

const BASELINE = Object.freeze({
  'assets/rc104/combat-viewport.js': 'f0ceb60d7699cb4bb8ee061dd3ed84a3c86c2c50cf3a653d07881f3f01d61ae7',
  'assets/rc133/bitmap-contact.js': '1ac7539f225c434844f474edcdd9b3cea996d6d980fc238c24ecc12c6294468c',
  'assets/rc133/native-install.js.txt': '32209ba098045ecba87a305ddf75f79dbe0c0b22ad47e53b519662e6a05df2be',
  'qa/rc133/authorized-runtime-extension-147.json': 'f3a0e8f84194033748be278288a5149d521acd1005e1093c27f6770132578d73'
});
const sourceFiles = [
  'index.html', 'assets/index-v31526.js', 'assets/rc223/camera.js',
  'assets/rc104/combat-viewport.js', 'assets/rc133/bitmap-contact.js',
  'assets/rc133/native-install.js.txt', 'assets/combat-v31402/contact-geometry.js',
  'qa/rc133/authorized-runtime-extension-147.json'
];
const hashes = Object.fromEntries(sourceFiles.map(file => [file, sha256(read(file))]));
for (const [file, expected] of Object.entries(BASELINE)) {
  assert.equal(hashes[file], expected, 'published baseline source retained: ' + file);
}
const bundleText = read('assets/index-v31526.js').toString('utf8');
const worldPlanStart = bundleText.indexOf('function w(e, t) {');
const worldPlanEnd = bundleText.indexOf('\nfunction ee(', worldPlanStart);
assert(worldPlanStart >= 0 && worldPlanEnd > worldPlanStart, 'native world camera planner is present');
const worldPlanSha = sha256(Buffer.from(bundleText.slice(worldPlanStart, worldPlanEnd)));
assert.equal(worldPlanSha, '22a7eddcc7507ce99711169d4f27fef57055fdaae266fd181e8b0068eaafa933', 'native lexical world planner matches published base');

const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav'};
const server = http.createServer((req, res) => {
  let file;
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    file = path.resolve(appRoot, '.' + (pathname === '/' ? '/index.html' : pathname));
  } catch { return res.writeHead(400).end(); }
  if (!file.startsWith(appRoot + path.sep)) return res.writeHead(403).end();
  try {
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404).end(); }
});

const report = {
  schema: 1, status: 'running', runnerSha: git(['rev-parse', 'HEAD']), appSha,
  expectedSha, appRoot, startedAt: new Date().toISOString(),
  scope: 'Real bundled app in official Chrome desktop and explicit mobile-UA emulation. The camera changes final presentation transform only. Staged native game state is used for deterministic collision/movement probes; no physical phone, GPU, or natural campaign claim.',
  limitations: ['Mobile coverage is explicit iPhone-UA/touch emulation; a physical phone and GPU are not tested.', 'RAF timing is an informational browser-emulation sample, not a performance pass threshold or physical-GPU benchmark.', 'Attack range is measured through the native range API and screenshots are retained for visual review; a human readability judgment of every skill preview is not claimed.', 'Persona bitmap collision uses a native projectile emitted by the real Persona module, moved to a deterministic contact position in staged state; this is not natural combat progression.'],
  environment: {officialChrome: false, desktop: false, mobileUAEmulation: false, physicalMobile: false, physicalGPU: false, independentNetworks: false},
  sources: sourceFiles.map(file => ({file, bytes: read(file).length, sha256: hashes[file], baseline199402a: BASELINE[file] || null})),
  nativeWorldPlanner: {sha256: worldPlanSha, expected199402a: worldPlanSha, unchanged: true},
  checks: [], profiles: [], captures: [], errors: [], httpErrors: [], requestFailures: []
};
let browser, activePage = null, serverOrigin = '';
const contexts = [];
const save = () => fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));

async function verifyHttpSourceBytes() {
  const rows = [];
  for (const file of sourceFiles) {
    const response = await fetch(serverOrigin + '/' + file);
    assert.equal(response.status, 200, 'native source is served: ' + file);
    const bytes = Buffer.from(await response.arrayBuffer());
    const digest = sha256(bytes);
    assert.equal(digest, hashes[file], 'browser HTTP source bytes equal disk bytes: ' + file);
    rows.push({file, status: response.status, bytes: bytes.length, sha256: digest, unchangedServedBytes: true});
  }
  report.httpSourceBytes = rows;
}

async function capture(name, page = activePage) {
  if (!page) return null;
  const file = name + '.png', target = path.join(out, file);
  const bytes = await page.screenshot({path: target, fullPage: false, timeout: 20000});
  const row = {name, file, bytes: bytes.length, sha256: sha256(bytes), appSha, at: new Date().toISOString()};
  report.captures.push(row);
  if (process.env.HAPIL_QA_LOG_PREVIEW === '1' && (name.includes('zoom-100') || name.includes('zoom-200') || name.startsWith('failed-'))) {
    const preview = await page.screenshot({type: 'jpeg', quality: 30, timeout: 20000});
    const encoded = preview.toString('base64');
    console.log('RC223_PREVIEW_META ' + JSON.stringify({name, appSha, sha256: sha256(preview), bytes: preview.length, chunks: Math.ceil(encoded.length / 4000)}));
    for (let i = 0; i < encoded.length; i += 4000) console.log('RC223_PREVIEW_CHUNK ' + name + ' ' + i / 4000 + ' ' + encoded.slice(i, i + 4000));
  }
  return row;
}

async function check(name, page, fn) {
  activePage = page;
  const row = {name, status: 'running', startedAt: new Date().toISOString()};
  report.checks.push(row);
  try {
    row.evidence = await fn();
    row.status = 'passed';
  } catch (error) {
    row.status = 'failed';
    row.error = error.stack || String(error);
    row.actual = await page.evaluate(() => ({
      camera: window.__HAPIL_CAMERA_RC223__?.diagnostics?.(),
      cameraSnapshot: window.__HAPIL_CAMERA_RC223__?.snapshot?.(),
      state: (() => {const s=window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current;return s?{zone:s.zone,x:s.x,y:s.y,hp:s.hp,time:s.time,target:s.target}:null;})(),
      phase: window.__HAPIL_CONTROLS_V31329__?.binding?.phase,
      visibleText: (document.body.innerText || '').slice(0, 1800)
    })).catch(e => ({diagnosticError: String(e)}));
    await capture('failed-' + name, page).catch(() => {});
    throw error;
  } finally {
    row.endedAt = new Date().toISOString();
    save();
  }
}

async function createNativePage({name, mobile = false, width, height}) {
  const options = {viewport: {width, height}, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1};
  if (mobile) options.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
  const context = await browser.newContext(options); contexts.push(context);
  const page = await context.newPage(); page.setDefaultTimeout(20000); activePage = page;
  page.on('pageerror', e => report.errors.push({profile:name, error:e.stack || e.message}));
  page.on('response', r => {if (r.status() >= 400) report.httpErrors.push({profile:name,url:r.url(),status:r.status()});});
  page.on('requestfailed', r => report.requestFailures.push({profile:name,url:r.url(),failure:r.failure()}));
  await page.goto(serverOrigin + '/?qa=1', {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__HAPIL_CAMERA_RC223__?.installed && window.__HAPIL_RC133_NATIVE__?.installed && window.__HAPIL_CONTROLS_V31329__?.binding, null, {timeout: 60000});
  return page;
}

async function startGame(page) {
  await page.keyboard.press('Escape');
  await page.getByRole('button', {name:'새 게임 시작', exact:true}).click();
  await page.getByRole('button', {name:'이 편성으로 접속', exact:true}).click();
  await page.waitForFunction(() => window.__HAPIL_CONTROLS_V31329__?.binding?.phase === 'game' && !!window.__HAPIL_CONTROLS_V31329__.binding.state.current, null, {timeout: 30000});
  for (let i = 0; i < 22 && await page.locator('#hapil-story-rc51').count(); i++) {
    await page.keyboard.press('Enter'); await page.waitForTimeout(70);
  }
  await page.evaluate(() => {
    const C=window.__HAPIL_CONTROLS_V31329__,s=C.binding.state.current;
    window.__HAPIL_PARTY_LAUNCH_V31322__?.dismissGuestUI?.();
    window.__HAPIL_STORY_RC51__?.close?.(false);
    C.binding.actions.dismiss(); C.setMode('manual');
    s.invulnerableUntil=s.time+120;
  });
  await page.locator('.game-stage canvas').waitFor({state:'visible'});
  await page.waitForFunction(() => !!window.__HAPIL_CAMERA_RC223__?.diagnostics?.().last, null, {timeout: 15000});
}

async function setViaNativeSlider(page, factor) {
  await page.evaluate(() => window.__HAPIL_CONTROLS_V31329__.binding.actions.settings());
  const slider = page.locator('input[type="range"][aria-label="전장 시야 범위"]');
  await slider.waitFor({state:'visible'});
  await slider.focus();
  await slider.press('Home');
  for (let i=0; i<Math.round((factor-1)/.05); i++) await slider.press('ArrowRight');
  await page.waitForFunction(expected => {
    const a=window.__HAPIL_CAMERA_RC223__, el=document.querySelector('input[aria-label="전장 시야 범위"]');
    return a?.factor?.()===expected && Number(el?.value)===expected && document.querySelector('.rc223-view-settings output')?.textContent===Math.round(expected*100)+'%';
  }, factor, {timeout: 8000});
  return await page.evaluate(() => ({value:Number(document.querySelector('input[aria-label="전장 시야 범위"]').value),min:Number(document.querySelector('input[aria-label="전장 시야 범위"]').min),max:Number(document.querySelector('input[aria-label="전장 시야 범위"]').max),step:Number(document.querySelector('input[aria-label="전장 시야 범위"]').step),output:document.querySelector('.rc223-view-settings output')?.textContent,snapshot:window.__HAPIL_CAMERA_RC223__.snapshot(),stored:localStorage.getItem('hapil.rc223.viewFactor')}));
}

async function closeNativeSettings(page) {
  await page.evaluate(() => window.__HAPIL_CONTROLS_V31329__.binding.actions.dismiss());
  await page.waitForFunction(() => !document.querySelector('.settings-layout'), null, {timeout: 8000});
}

async function cameraEvidence(page, factor) {
  await page.waitForFunction(expected => {
    const d=window.__HAPIL_CAMERA_RC223__?.diagnostics?.();
    return d?.last?.factor===expected && d.last.base && d.last.adjusted;
  }, factor, {timeout: 12000});
  return page.evaluate(() => {
    const A=window.__HAPIL_CAMERA_RC223__,d=A.diagnostics(),last=d.last,
      view=window.__HAPIL_VIEWPORT_RC104__?.view?.(),s=window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current,
      core=window.__HAPIL_COMBAT_CORE_V31401__?.core?.(s);
    const c=document.querySelector('.game-stage canvas'),r=c?.getBoundingClientRect();
    const selectors=['.game-stage','.game-stage canvas','.topbar','.mission-tag','.minimap','.rc108-settings-trigger','.mobile-system-menu'];
    const css=Object.fromEntries(selectors.map(sel=>{const e=document.querySelector(sel);if(!e)return[sel,null];const b=e.getBoundingClientRect(),g=getComputedStyle(e);return[sel,{x:b.x,y:b.y,width:b.width,height:b.height,fontSize:g.fontSize,lineHeight:g.lineHeight,padding:g.padding,borderRadius:g.borderRadius}]}));
    const hitTarget=s?.target?{x:s.target.x,y:s.target.y}:null;
    return {factor:A.factor(),snapshot:A.snapshot(),last,d,view:view&&{...view},state:s&&{zone:s.zone,x:s.x,y:s.y,hp:s.hp,time:s.time,hero:s.activeHeroId,target:hitTarget},playerCore:core&&{x:core.x,y:core.y},canvas:r&&{x:r.x,y:r.y,width:r.width,height:r.height,backing:[c.width,c.height]},css};
  });
}

function assertCameraFormula(row, factor) {
  const {base,adjusted,anchor}=row.last;
  assert.equal(row.factor, factor);
  assert(Math.abs(adjusted.scale - base.scale/factor) < 1e-9, 'final native view scale follows inverse range factor');
  assert(Math.abs(adjusted.x - (anchor.x+(base.x-anchor.x)/factor)) < 1e-7, 'final native camera x is anchored');
  assert(Math.abs(adjusted.y - (anchor.y+(base.y-anchor.y)/factor)) < 1e-7, 'final native camera y is anchored');
  if(row.view) {
    assert(Math.abs(anchor.x-(row.view.x+row.view.width/2))<1e-6, 'camera anchor is the native safe viewport center x');
    assert(Math.abs(anchor.y-(row.view.y+row.view.height/2))<1e-6, 'camera anchor is the native safe viewport center y');
  }
}

async function pointerProjection(page, useTouch) {
  const plan = await page.evaluate(() => {
    const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current,
      d=window.__HAPIL_CAMERA_RC223__.diagnostics().last,
      c=document.querySelector('.game-stage canvas'),r=c.getBoundingClientRect(),
      clamp=v=>Math.max(2,Math.min(29,v));
    // Select a clear fixed world target near the actual player. A native test
    // fixture records its exact projected pixel; the real canvas handler then
    // performs the inverse through the production camera and viewport path.
    const candidates=[{x:clamp(s.x+3.1),y:clamp(s.y+.8)},{x:clamp(s.x-3.1),y:clamp(s.y+.8)},{x:clamp(s.x+.8),y:clamp(s.y-3.1)},{x:clamp(s.x+.8),y:clamp(s.y+3.1)}];
    const enemyDistance=p=>Math.min(Infinity,...(s.enemies||[]).filter(a=>a.hp>0).map(a=>Math.hypot(a.x-p.x,a.y-p.y)));
    const target=candidates.find(p=>enemyDistance(p)>2.8)||candidates[0],g={x:640+(target.x-target.y)*27,y:13.5*(target.x+target.y)},cam=d.adjusted;
    const logical={x:cam.x+g.x*cam.scale,y:cam.y+g.y*cam.scale};
    const V=window.__HAPIL_VIEWPORT_RC104__,touch=document.documentElement.classList.contains('hapil-touch-v31366');
    const nativeView=touch?V.view(r.width,r.height):null;
    const client=touch
      ?{x:r.left+(logical.x-nativeView.x)*nativeView.k,y:r.top+(logical.y-nativeView.y)*nativeView.k}
      :{x:r.left+logical.x*r.width/1280,y:r.top+logical.y*r.height/720};
    const projected=V.pointer({clientX:client.x,clientY:client.y},r);
    if(Math.hypot(projected.x-logical.x,projected.y-logical.y)>.02)throw Error('pointer coordinate fixture disagrees with the native RC104 inverse '+JSON.stringify({logical,projected,touch}));
    s.target=null;s.path=[];s.targetEnemyId=null;
    return {target,enemyDistance:enemyDistance(target),logical,projected,client,rect:{x:r.x,y:r.y,width:r.width,height:r.height},camera:cam,factor:d.factor,zone:s.zone,coordinateMethod:touch?'inverse of native RC104 touch view()':'inverse of native RC104 fixed logical canvas mapping'};
  });
  assert(plan.client.x>plan.rect.x+5&&plan.client.x<plan.rect.x+plan.rect.width-5&&plan.client.y>plan.rect.y+5&&plan.client.y<plan.rect.y+plan.rect.height-5, 'projected native world target lies inside game canvas');
  if(useTouch) await page.touchscreen.tap(plan.client.x, plan.client.y);
  else await page.mouse.click(plan.client.x, plan.client.y);
  await page.waitForFunction(expected => {
    const t=window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current?.target;
    return !!t && Math.hypot(t.x-expected.x,t.y-expected.y)<.5;
  }, plan.target, {timeout: 6000});
  const actual = await page.evaluate(() => {const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return {target:s.target&&{x:s.target.x,y:s.target.y},pathLength:s.path?.length??0,time:s.time,hero:{x:s.x,y:s.y}};});
  const error = Math.hypot(actual.target.x-plan.target.x, actual.target.y-plan.target.y);
  assert(error<.5, 'native pointer inverse resolves to the requested world target');
  return {...plan,actual,error,method:useTouch?'Playwright touchscreen tap on actual canvas':'Playwright mouse click on actual canvas'};
}

async function nativeMovement(page) {
  const results=[];
  for (const factor of [1,1.5,2]) {
    await page.evaluate(expected => {
      const C=window.__HAPIL_CONTROLS_V31329__,s=C.binding.state.current;
      window.__HAPIL_CAMERA_RC223__.setFactor(expected);
      s.x=16;s.y=24;s.target=null;s.path=[];s.moveVx=s.moveVy=0;s.invulnerableUntil=s.time+20;
    }, factor);
    await page.waitForFunction(expected=>window.__HAPIL_CAMERA_RC223__.diagnostics().last?.factor===expected,factor,{timeout:10000});
    const before=await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return{x:s.x,y:s.y,time:s.time};});
    await page.keyboard.down('ArrowRight');
    try { await page.waitForFunction(start=>window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current?.time>=start+.35,before.time,{timeout:5000}); }
    finally { await page.keyboard.up('ArrowRight'); }
    const after=await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return{x:s.x,y:s.y,time:s.time};});
    const row={factor,before,after,worldDistance:Math.hypot(after.x-before.x,after.y-before.y),simSeconds:after.time-before.time,worldSpeedPerSimSecond:Math.hypot(after.x-before.x,after.y-before.y)/Math.max(.001,after.time-before.time)};
    assert(row.worldDistance>.05, 'real keyboard movement advances world coordinates');
    results.push(row);
  }
  const baseline=results[0].worldSpeedPerSimSecond;
  for(const row of results)assert(Math.abs(row.worldSpeedPerSimSecond/baseline-1)<.22,'native keyboard world speed remains comparable across camera factors');
  return results;
}

async function blinkMovement(page) {
  const rows=[];
  for(const factor of [1,1.5,2]) {
    await page.evaluate(expected=>{
      const C=window.__HAPIL_CONTROLS_V31329__,s=C.binding.state.current;
      window.__HAPIL_CAMERA_RC223__.setFactor(expected);s.x=16;s.y=24;s.facing=1;s.target=null;s.path=[];s.moveVx=s.moveVy=0;s.lastManualBlinkVectorRC79=null;s.lastDodgeAt=-99;s.cooldowns??={};s.cooldowns.S=s.time-1;s.blinkResonanceUntilV31518=0;s.heroMotion??={};s.heroMotion.until=s.time-1;s.bufferedAction=null;s.invulnerableUntil=s.time+20;
    },factor);
    await page.waitForFunction(expected=>window.__HAPIL_CAMERA_RC223__.diagnostics().last?.factor===expected,factor,{timeout:10000});
    const before=await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return{x:s.x,y:s.y,time:s.time};});
    await page.keyboard.down('ArrowRight'); await page.keyboard.press('s'); await page.keyboard.up('ArrowRight');
    const after=await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return{x:s.x,y:s.y,time:s.time};});
    const row={factor,before,after,worldDistance:Math.hypot(after.x-before.x,after.y-before.y),dx:after.x-before.x,dy:after.y-before.y};
    assert(row.worldDistance>1.2&&row.worldDistance<4.2,'real native blink moves by a bounded world distance');
    rows.push(row);
  }
  const baseline=rows[0].worldDistance;
  for(const row of rows)assert(Math.abs(row.worldDistance/baseline-1)<.24,'native blink world distance stays comparable across camera factors');
  return rows;
}

async function performanceSamples(page) {
  const rows=[];
  for(const factor of [1,1.5,2]) {
    await page.evaluate(f=>window.__HAPIL_CAMERA_RC223__.setFactor(f),factor);
    await page.waitForFunction(f=>window.__HAPIL_CAMERA_RC223__.diagnostics().last?.factor===f,factor,{timeout:10000});
    const sample=await page.evaluate(async factor=>{
      const times=[];let last=performance.now();
      await new Promise(resolve=>{function frame(now){times.push(now-last);last=now;if(times.length<91)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
      const sorted=[...times].sort((a,b)=>a-b),at=p=>sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))];
      return {factor,frames:times.length,medianFrameMs:at(.5),p95FrameMs:at(.95),maxFrameMs:Math.max(...times),sample:'91 RAF intervals in emulated official Chrome; informational only; not GPU/mobile performance proof'};
    },factor);
    rows.push(sample);
  }
  return rows;
}

async function collisionEvidence(page) {
  const result=await page.evaluate(async()=>{
    const C=window.__HAPIL_CONTROLS_V31329__,B=window.__HAPIL_RC86_BRIDGE__,H=window.__HAPIL_INNER_FINAL_RC133__,M=window.__HAPIL_MEDIA_ART_RC133__,V=window.__HAPIL_BITMAP_NATIVE_RC133__,G=window.__HAPIL_CONTACT_V31336__;
    const s=C.binding.state.current;
    if(!B?.actor||!B?.cloneEnemy||!H?.start||!H?.tick||!M?.ready||!V?.projectile||!G?.projectile)throw Error('native Persona/bitmap/collision APIs are unavailable');
    // Deterministic staging through production state and encounter APIs. This
    // is explicitly not a naturally reached Persona fight.
    s.zone='cult04';s.gameModeV31346='DREAM';s.samongUnlockedRC91=true;s.hp=Math.max(1000,s.hp);s.maxHp=Math.max(s.maxHp,s.hp);s.activeHeroId='gunner';s.time=Math.max(100,s.time);s.hostileProjectiles=[];s.pendingHits=[];s.impactQueue=[];s.enemies=[];s.spawnedWaves=new Set([1,2,3,4]);s.invulnerableUntil=s.time+100;
    const cult=B.cloneEnemy(B.actor('cult04','c104-boss'),'cult04');cult.hp=0;s.enemies=[cult];
    if(!H.start(s,cult))throw Error('actual native Persona start rejected controlled cult-death fixture');
    Object.assign(s.innerFinalRC133,{phase:'fight',intro:0,awake:0,awakeningCooldown:10000,shotDelay:0,cycle:0});
    let emitted=[];
    for(let i=0;i<8&&!emitted.length;i++){
      s.time+=.12;H.tick(s,.12);emitted=s.hostileProjectiles.filter(q=>q.rc133InnerShot===true&&q.sourceId==='inner-evil-rc133');
    }
    const q=emitted[0];if(!q)throw Error('actual native Persona emitter did not produce a projectile');
    q.previousX=q.x=s.x;q.previousY=q.y=s.y;q.vx=0;q.vy=0;q.visualYV31333=0;q.frozenUntil=s.time-1;q.collisionDisabledUntil31219=0;q.removed=false;q.cancelled=false;q.hitResolved=false;
    q.born=s.time-1;q.sourceBorn=q.born;
    // Capture real native image bytes through the existing map cache if it has
    // not already been requested. The game renderer remains the decoder.
    const cache=C.binding.cache.current,im=M.picture(q.sprite);if(im&&im.complete&&im.naturalWidth>0)cache[q.sprite]=im;
    let visual=null;const deadline=performance.now()+8000;
    while(!visual&&performance.now()<deadline){visual=V.projectile(s,q);if(!visual)await new Promise(r=>setTimeout(r,30));}
    if(!visual?.points?.length)throw Error('native Persona bitmap contact silhouette did not decode');
    const hp=s.hp,rows=[],canvas=document.querySelector('.game-stage canvas');
    const baseState={time:s.time,x:s.x,y:s.y,hp:s.hp,enemyPose:(s.enemies||[]).map(a=>({id:a.id,x:a.x,y:a.y,hp:a.hp,phase:a.phase,currentPhase:a.currentPhase}))};
    for(const factor of [1,1.5,2]){
      window.__HAPIL_CAMERA_RC223__.setFactor(factor);
      // Observe the real production render synchronously for all factors in
      // this one JS turn. No RAF or simulation time can change between probes.
      B.renderFrame(canvas,s,cache,s.activeHeroId,C.binding.settings.current);
      const currentPose=(s.enemies||[]).map(a=>({id:a.id,x:a.x,y:a.y,hp:a.hp,phase:a.phase,currentPhase:a.currentPhase}));
      if(s.time!==baseState.time||s.x!==baseState.x||s.y!==baseState.y||s.hp!==baseState.hp||JSON.stringify(currentPose)!==JSON.stringify(baseState.enemyPose))throw Error('native collision comparison state advanced inside controlled synchronous render');
      if(window.__HAPIL_CAMERA_RC223__.diagnostics().last?.factor!==factor)throw Error('native renderer did not observe factor '+factor);
      const before=window.__HAPIL_CAMERA_RC223__.diagnostics().probeCameraCalls,
        bitmap=V.projectile(s,q),contact=G.projectile(s,s,q),heroBody=V.body(s,s,true),boss=H.boss(s),bossBody=boss?V.body(s,boss,false):null,
        bossContact=boss?V.enemyContact(s,boss,s.x,s.y,-5,6.75):null,d=window.__HAPIL_CAMERA_RC223__.diagnostics(),
        range=window.__HAPIL_RANGES_V31337__?.radius?.(s.activeHeroId)??null;
      if(!bitmap?.points?.length||!heroBody?.points?.length||!bossBody?.points?.length)throw Error('native Persona/player bitmap body probe missing at factor '+factor);
      rows.push({factor,bitmap:{points:bitmap.points,area:bitmap.area,path:bitmap.path},contact:{hit:contact.hit,heart:contact.heart,bitmap:contact.bitmap,bodyGap:contact.bodyGap,kind:contact.kind},heroBody:heroBody.points,bossBody:bossBody.points,bossContact,range,screenBodyScale:d.last?.adjusted?.scale??null,probeCallsBefore:before,probeCallsAfter:d.probeCameraCalls,lastProbeCamera:d.lastProbeCamera,baseCameraDepth:d.baseCameraDepth,hp:s.hp,simulationState:{time:s.time,x:s.x,y:s.y}});
    }
    return {fixture:'actual HAPIL_INNER_FINAL_RC133 start/tick native Persona emission; projectile position moved to current player for a deterministic contact probe; staged only',comparison:'production renderFrame and collision probes are synchronous within one JS turn at an identical native simulation time and pose',baseState,zone:s.zone,phase:s.innerFinalRC133.phase,sourceId:q.sourceId,skill:q.rc133Skill,sprite:q.sprite,emittedProjectiles:emitted.length,rows,hpBefore:hp,hpAfter:s.hp,hitPointsUnchanged:s.hp===hp};
  });
  assert.equal(result.hitPointsUnchanged,true,'read-only actual contact probe does not change HP');
  assert.equal(result.rows.length,3);
  for(const row of result.rows){
    assert.equal(row.contact.bitmap,true,'actual contact response is derived from the decoded native bitmap at factor '+row.factor);
    assert.equal(row.contact.hit,true,'controlled native Persona projectile contacts the real native player body at factor '+row.factor);
    assert.equal(row.baseCameraDepth,0,'native contact leaves original-camera scope balanced at factor '+row.factor);
    assert(row.probeCallsAfter>row.probeCallsBefore,'production contact probe records the unscaled camera at factor '+row.factor);
    assert(Number.isFinite(row.range)&&row.range>0,'native attack range is measurable at factor '+row.factor);
  }
  const reference=result.rows[0];
  for(const row of result.rows.slice(1)){
    assert.deepEqual(row.bitmap.points,reference.bitmap.points,'actual Persona contact polygon is unchanged across camera factors');
    assert.deepEqual(row.heroBody,reference.heroBody,'actual player body polygon is unchanged across camera factors');
    assert.deepEqual(row.bossBody,reference.bossBody,'actual Persona body polygon is unchanged across camera factors');
    assert.deepEqual(row.contact,reference.contact,'native projectile hit/heart/body-gap result is unchanged across camera factors');
    assert.equal(row.range,reference.range,'native attack range is unchanged across camera factors');
  }
  return result;
}

async function runProfile({name,mobile,width,height}) {
  const page=await createNativePage({name,mobile,width,height});
  const row={name,mobileUA:mobile,viewport:{width,height},errors:[],zoom:[],movement:null,blink:null,performance:null,pointer:null,collision:null};
  report.profiles.push(row);
  const defaultSnapshot=await page.evaluate(()=>window.__HAPIL_CAMERA_RC223__.snapshot());
  assert.equal(defaultSnapshot.mobile,mobile,'native device classifier matches explicit platform profile');
  assert.equal(defaultSnapshot.factor,mobile?2:1,'default view factor follows mobile/PC profile');
  assert.equal(defaultSnapshot.saved,false,'fresh profile has no persisted factor');
  row.default=defaultSnapshot;
  await startGame(page);
  const originalCSS=await page.evaluate(()=>{
    const out={};for(const sel of ['.game-stage','.game-stage canvas','.topbar','.mission-tag','.minimap','.rc108-settings-trigger','.mobile-system-menu']){const e=document.querySelector(sel);if(e){const r=e.getBoundingClientRect(),s=getComputedStyle(e);out[sel]={width:r.width,height:r.height,fontSize:s.fontSize,lineHeight:s.lineHeight,padding:s.padding,borderRadius:s.borderRadius};}}
    return out;
  });
  row.nativeCSSBefore=originalCSS;

  for(const factor of [1,1.5,2]) {
    row.slider??=[];
    row.slider.push(await setViaNativeSlider(page,factor));
    await closeNativeSettings(page);
    await page.waitForTimeout(180);
    const evidence=await cameraEvidence(page,factor);assertCameraFormula(evidence,factor);
    row.zoom.push(evidence);
    await capture(name+'-zoom-'+Math.round(factor*100),page);
  }
  assert.deepEqual(row.slider.map(r=>r.value),[1,1.5,2],'native Settings slider accepts full 0.05 stepped range');
  assert(row.slider.every(r=>r.min===1&&r.max===2&&r.step===.05),'native Settings slider exposes min/max/step');
  const cssAfter=await page.evaluate(()=>{
    const out={};for(const sel of ['.game-stage','.game-stage canvas','.topbar','.mission-tag','.minimap','.rc108-settings-trigger','.mobile-system-menu']){const e=document.querySelector(sel);if(e){const r=e.getBoundingClientRect(),s=getComputedStyle(e);out[sel]={width:r.width,height:r.height,fontSize:s.fontSize,lineHeight:s.lineHeight,padding:s.padding,borderRadius:s.borderRadius};}}
    return out;
  });
  row.nativeCSSAfter=cssAfter;
  assert.deepEqual(cssAfter,originalCSS,'camera range leaves native page and control CSS dimensions unchanged');

  if(!mobile) {
    row.pointer=await pointerProjection(page,false);
    row.movement=await nativeMovement(page);
    row.blink=await blinkMovement(page);
    row.collision=await collisionEvidence(page);
  } else {
    row.pointer=await pointerProjection(page,true);
    // The mobile profile first exercises the real canvas while landscape.
    // Portrait is checked only for its native input/render gate.
    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(350);
    const before=await page.evaluate(()=>{const C=window.__HAPIL_CONTROLS_V31329__,s=C.binding.state.current;return{x:s.x,y:s.y,time:s.time,hp:s.hp,runtime:window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.()??null};});
    assert.equal(before.runtime?.portrait,true,'real runtime identifies the explicit mobile portrait profile');
    assert.equal(before.runtime?.paused,true,'native runtime blocks combat while portrait');
    await page.keyboard.down('ArrowRight');await page.waitForTimeout(350);await page.keyboard.up('ArrowRight');
    const after=await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return{x:s.x,y:s.y,time:s.time,hp:s.hp};});
    assert.deepEqual(after,{x:before.x,y:before.y,time:before.time,hp:before.hp},'portrait combat state stays frozen under attempted keyboard movement');
    await capture(name+'-portrait-gate',page);
    row.portraitCombatGate={before,after,attempt:'real keyboard ArrowRight for 350 ms in mobile-UA portrait',blocked:true};
    await page.setViewportSize({width:844,height:390});
    await page.waitForFunction(()=>{const A=window.__HAPIL_CAMERA_RC223__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.();return A?.snapshot?.().mobile===true&&R?.portrait===false&&!R?.paused;},null,{timeout:10000});
    const orientation=await page.evaluate(()=>({snapshot:window.__HAPIL_CAMERA_RC223__.snapshot(),inner:{width:innerWidth,height:innerHeight},portraitSplit:window.__HAPIL_PORTRAIT_SPLIT_RC108__?.metrics?.()??null,coop:window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.()??null}));
    assert.equal(orientation.snapshot.factor,2,'orientation change preserves explicit mobile setting');
    assert.equal(orientation.snapshot.mobile,true,'landscape mobile UA remains classified as mobile');
    row.orientation=orientation;
  }

  row.performance=await performanceSamples(page);
  const persisted=await page.evaluate(()=>({snapshot:window.__HAPIL_CAMERA_RC223__.snapshot(),stored:localStorage.getItem('hapil.rc223.viewFactor')}));
  assert.equal(persisted.snapshot.saved,true,'native camera choice is saved separately');
  assert.equal(persisted.stored,'2','last chosen factor survives setting screen close');
  row.persisted=persisted;
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__HAPIL_CAMERA_RC223__?.installed,null,{timeout:30000});
  const afterReload=await page.evaluate(()=>window.__HAPIL_CAMERA_RC223__.snapshot());
  assert.equal(afterReload.factor,2,'selected range survives browser page reload');
  assert.equal(afterReload.saved,true,'reloaded range is marked persisted');
  row.afterReload=afterReload;
  row.errors=report.errors.filter(e=>e.profile===name);
  assert.deepEqual(row.errors,[],'no page errors in browser profile');
  return row;
}

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  serverOrigin='http://127.0.0.1:'+server.address().port;
  let failure=null;
  try {
    await verifyHttpSourceBytes();
    browser=await chromium.launch({chromiumSandbox:true,channel:'chrome',headless:true,args:[]});
    report.environment.officialChrome=true;
    report.environment.desktop=true;
    report.environment.mobileUAEmulation=true;
    report.environment.physicalMobile=false;
    report.environment.physicalGPU=false;
    await runProfile({name:'desktop',mobile:false,width:1280,height:900});
    await runProfile({name:'mobile-landscape',mobile:true,width:844,height:390});
    report.status='passed';
  } catch(error) {
    failure={error:error.stack||String(error)};report.status='failed';report.failure=failure;
    if(activePage)await capture('failed-final',activePage).catch(()=>{});
    throw error;
  } finally {
    report.finishedAt=new Date().toISOString();
    save();
    await Promise.all(contexts.map(context=>context.close().catch(()=>{})));
    await browser?.close().catch(()=>{});
    server.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
