'use strict';
// Full published game, real HTMLAudioElement.play and real asset decoding.
// QA only arranges native encounters/queued hits; normal game frames release
// those hits and execute the sound hooks. No controller.emit/sync test calls.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const fallback = process.env.HAPIL_SOURCE_ROOT ? path.resolve(process.env.HAPIL_SOURCE_ROOT) : root;
const output = process.env.HAPIL_COMBAT_AUDIO_OUTPUT || path.join(root, 'qa-results', 'combat-audio-browser');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/combat-audio/v1/manifest.json'), 'utf8'));
const runtime = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const playwright = runtime ? require(path.join(runtime, 'playwright')) : require('playwright');
const uploaded = pathname => pathname.includes('/assets/combat-audio/v1/audio/');
const requests = [];
const failurePaths = new Set();
const mime = {'.html':'text/html; charset=utf-8', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.ogg':'audio/ogg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2'};
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  requests.push({path:url.pathname, at:Date.now(), range:req.headers.range || null});
  if (failurePaths.has(url.pathname)) { res.writeHead(404); res.end(); return; }
  let file = path.resolve(root, '.' + relative);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(file)) file = path.resolve(fallback, '.' + relative);
  if (!file.startsWith(fallback + path.sep) && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  try {
    const bytes = fs.readFileSync(file), headers = {'content-type':mime[path.extname(file)] || 'application/octet-stream', 'cache-control':'no-store', 'accept-ranges':'bytes'};
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    if (range) {
      const start = Number(range[1]), end = Math.min(bytes.length - 1, range[2] ? Number(range[2]) : bytes.length - 1);
      if (start > end) { res.writeHead(416, {'content-range':`bytes */${bytes.length}`}); res.end(); return; }
      res.writeHead(206, {...headers, 'content-range':`bytes ${start}-${end}/${bytes.length}`, 'content-length':end-start+1});
      res.end(bytes.subarray(start, end + 1));
    } else { res.writeHead(200, {...headers, 'content-length':bytes.length}); res.end(bytes); }
  } catch { res.writeHead(404); res.end(); }
});

// Observe the real native method, preserving its exact return value and errors.
// Sampling includes pending play promises, so a third loading effect also fails.
function installMediaProbe() {
  const play = HTMLMediaElement.prototype.play;
  const elements = new Set(), ids = new WeakMap(), events = [];
  let serial = 0, maxMusic = 0, maxEffects = 0;
  const kind = media => /\/combat-audio\/v1\/audio\/music-/.test(media.src) ? 'music' : /\/combat-audio\/v1\/audio\/effect-/.test(media.src) ? 'effect' : 'legacy';
  const sample = () => {
    const active = [...elements].filter(media => media.src && ((!media.paused && !media.ended) || media.__hapilCombatPending));
    const music = active.filter(media => kind(media) === 'music').length;
    const effects = active.filter(media => kind(media) === 'effect').length;
    maxMusic = Math.max(maxMusic, music); maxEffects = Math.max(maxEffects, effects);
    return {music, effects};
  };
  const event = (media, type, extra = {}) => {
    if (!ids.has(media)) ids.set(media, ++serial);
    elements.add(media);
    events.push({id:ids.get(media), type, src:media.src, kind:kind(media), at:performance.now(), time:media.currentTime, volume:media.volume, ...extra});
    sample();
  };
  HTMLMediaElement.prototype.play = function (...args) {
    event(this, 'play');
    const result = Reflect.apply(play, this, args);
    if (result?.then) result.then(() => event(this, 'accepted'), error => event(this, 'rejected', {error:String(error)}));
    return result;
  };
  document.addEventListener('playing', e => { if(e.target instanceof HTMLMediaElement) event(e.target, 'playing'); }, true);
  setInterval(sample, 10);
  window.__combatMediaProbe = {
    elements, events, kind, sample,
    snapshot:() => ({...sample(), maxMusic, maxEffects, events:[...events], decks:[...elements].map(media => ({id:ids.get(media), src:media.src, kind:kind(media), paused:media.paused, ended:media.ended, pending:!!media.__hapilCombatPending, time:media.currentTime, duration:media.duration, volume:media.volume, readyState:media.readyState}))}),
  };
}

const report = {scope:'actual Chromium media decoding and native game-frame hooks; QA-staged encounters, not a natural full campaign or physical speaker test', checks:[], decoded:[], eventEvidence:[]};
let browser, page;
const errors = [];
const unexpectedDialogs = [];
let expectedTitleDialog = false;
function observeDialogs(target) {
  target.on('dialog', dialog => {
    if(expectedTitleDialog&&dialog.type()==='confirm'&&dialog.message()==='현재 진행을 자동 저장하고 시작 화면으로 돌아갑니까?')return;
    unexpectedDialogs.push({type:dialog.type(),message:dialog.message()});
    void dialog.dismiss().catch(error=>errors.push('Unexpected-dialog cleanup: '+String(error)));
  });
}
const check = name => { report.checks.push(name); console.log('COMBAT_AUDIO_CHECK', name); };
const snapshot = () => page.evaluate(() => ({audio:__combatMediaProbe.snapshot(), routing:__HAPIL_COMBAT_AUDIO_V1__.diagnostics, state:{zone:__MONGSE_QA_STATE__?.zone, time:__MONGSE_QA_STATE__?.time, hp:__MONGSE_QA_STATE__?.hp}}));
const played = role => page.evaluate(role => {
  const catalog = __HAPIL_COMBAT_AUDIO_CATALOG_V1__;
  const source = new URL((catalog.music[role] || catalog.effects[role]).path, document.baseURI).pathname;
  return __combatMediaProbe.events.filter(event => event.type === 'accepted' && event.src && new URL(event.src).pathname === source).length;
}, role);
const waitPlayed = (role, after = 0) => page.waitForFunction(({role, after}) => {
  const catalog = __HAPIL_COMBAT_AUDIO_CATALOG_V1__;
  const source = new URL((catalog.music[role] || catalog.effects[role]).path, document.baseURI).pathname;
  return __combatMediaProbe.events.filter(event => event.type === 'accepted' && event.src && new URL(event.src).pathname === source).length > after;
}, {role, after}, {timeout:15000});
const waitSilent = () => page.waitForFunction(() => {const x=__combatMediaProbe.sample();return x.music===0&&x.effects===0;}, null, {timeout:8000});
const waitMusic = role => page.waitForFunction(role => {
  const p = __HAPIL_COMBAT_AUDIO_CATALOG_V1__.music[role];
  const pathname = new URL(p.path, document.baseURI).pathname;
  const active = __combatMediaProbe.snapshot().decks.filter(x=>x.kind==='music'&&!x.paused&&!x.ended);
  return __HAPIL_COMBAT_AUDIO_V1__.diagnostics.selected===role && active.length===1 && new URL(active[0].src).pathname===pathname && active[0].readyState>=2 && active[0].volume>0;
}, role, {timeout:15000});

async function settings(values) {
  await page.evaluate(values => {
    const binding = __HAPIL_CONTROLS_V31329__.binding;
    binding.setSettings(current => ({...current, ...values}));
    if ('autoCombat' in values) binding.auto.current = values.autoCombat;
  }, values);
}

async function startGame() {
  await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`, {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.__HAPIL_DANMAKU_HUD_RC129__?.installed && window.__HAPIL_RC127_INSTALLED__, null, {timeout:60000});
  await page.keyboard.press('Escape');
  await page.getByRole('button', {name:'새 게임 시작', exact:true}).click();
  await page.getByRole('button', {name:'이 편성으로 접속', exact:true}).click();
  await page.waitForFunction(() => window.__MONGSE_QA_STATE__ && window.__MONGSE_QA_API__, null, {timeout:60000});
  await settings({music:true, sound:true, bgmVolume:.4, sfxVolume:.5, autoCombat:false, combatMode:'manual', autoStoryAdvance:false});
}

async function stage(zone, rank = 'boss') {
  const result = await page.evaluate(({zone, rank}) => {
    const controls = __HAPIL_CONTROLS_V31329__.binding;
    document.getElementById('hapil-death-verse-rc59')?.finishRC121?.();
    controls.actions.dismiss();
    __HAPIL_STORY_RC51__.close(false);
    const result = __MONGSE_QA_API__.stageV3128BossShowcase(zone);
    if (!result.pass) return result;
    const s = __MONGSE_QA_STATE__, a = s.enemies[0];
    // Consume the canonical entry card through its own API, then allow frames.
    __HAPIL_STORY_RC51__.beforeFrame(s, {clear:false, sound:false});
    __HAPIL_STORY_RC51__.close(true);
    s.hp = s.maxHp; s.awakeningUntil = 0;
    s.bossDefeated = false; s.spawnedWaves = new Set([1,2,3,4]);
    for (const field of ['pendingHits','impactQueue','hostileProjectiles','narrativeCasts','telekineticCasts','spatialRiftCasts','pendingStrikes','pendingSpawns']) s[field] = [];
    a.boss = rank === 'boss'; a.midboss = rank === 'midboss';
    // Retain the native actor/identity/phase. Suspend its autonomous attack
    // cadence so each queued-event assertion has one known cause.
    for (const field of ['readyAt','patternReadyAt','themedOrdnanceAt','themedSummonAt','signatureFollowupAt31212','recoverUntil','stunnedUntil']) a[field] = s.time + 10000;
    a.invulnerableUntil = s.time + 10000;
    s.invulnerableUntil = s.time + 10000;
    s.encounterLockUntil31226 = 0; s.encounterWallUnlockAtV31227 = 0;
    s.encounterDialogue31226 = null;
    return {...result, id:a.id, name:a.name, humanPhase0:a.humanPhase0, phase:__HAPIL_RC86_BRIDGE__.phase(a), time:s.time};
  }, {zone, rank});
  assert.equal(result.pass, true, JSON.stringify(result));
  await page.waitForFunction(zone=>__HAPIL_COMBAT_AUDIO_V1__.diagnostics.zone===zone&&__HAPIL_COMBAT_AUDIO_V1__.diagnostics.mode==='combat', zone, {timeout:15000});
  return result;
}

// A due native impact queue record runs through frame admission, the original
// impact function, ownership/phase checks, damage, and Seven Sin mechanics.
async function queueImpact({label, mechanic, count = 1, deadOwner = false, kind = 'circle'}) {
  return page.evaluate(({label, mechanic, count, deadOwner, kind}) => {
    const s = __MONGSE_QA_STATE__, a = s.enemies.find(x=>x.hp>0);
    if (!a) throw Error('Missing live native owner');
    s.invulnerableUntil = mechanic ? 0 : s.time + 10000;
    s.lastDodgeAt = -100; s.heroGuardUntil = 0; s.guardUntil = 0;
    if (mechanic) { a.envyIllusionReadyAt = 0; s.hp = s.maxHp; }
    const ids = [];
    for(let i=0;i<count;i++) {
      const id=s.fxSerial++; ids.push(id);
      s.impactQueue.push({id, sourceId:a.id, born:s.time-.5, at:s.time-.01, impactAt:s.time-.001,
        x:s.x,y:s.y,originX:a.x,originY:a.y,shape:kind,radius:4,innerRadius:0,width:1,
        damage:mechanic?1:0,boss:!!a.boss,midboss:!!a.midboss,patternSet:a.patternSet,
        label,color:'#7733ff',accent:'#ffffff',status:'none',statusValue:0,
        sevenSinMechanic:mechanic, telegraphEndedAt:s.time-.01,
        terrainPiercing31214:true, obstaclePiercing31214:true, losRequired31214:false});
    }
    if (deadOwner) a.hp = 0;
    return {ids, owner:a.id, zone:s.zone, hp:s.hp, beforeClones:s.enemies.filter(x=>x.envyHallucination).length};
  }, {label, mechanic, count, deadOwner, kind});
}

async function assertNativeImpact(evidence) {
  await page.waitForFunction(ids => __MONGSE_QA_STATE__.effects.some(effect => ids.includes(effect.pendingHitId)), evidence.ids, {timeout:8000});
  const effects = await page.evaluate(ids => __MONGSE_QA_STATE__.effects.filter(effect=>ids.includes(effect.pendingHitId)).map(effect=>({id:effect.pendingHitId, owner:effect.sourceId, class:effect.bossSkillClass, impact:effect.telegraphImpact})), evidence.ids);
  assert(effects.some(effect=>effect.owner===evidence.owner&&effect.impact===true), 'native frame committed the queued impact');
  report.eventEvidence.push({...evidence, effects});
}

(async () => {
  assert.equal(manifest.assets.length, 8);
  for (const asset of manifest.assets) {
    const bytes=fs.readFileSync(path.resolve(root, asset.path));
    assert.equal(bytes.length, asset.bytes, asset.role+' bytes');
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.role+' immutable asset identity');
  }
  fs.mkdirSync(output, {recursive:true});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    browser=await playwright.chromium.launch({headless:true, executablePath:process.env.HAPIL_CHROMIUM || undefined, args:['--no-sandbox']});
    page=await browser.newPage({viewport:{width:1280,height:900}});
    page.setDefaultTimeout(20000);
    await page.addInitScript(installMediaProbe);
    page.on('pageerror', error=>errors.push(String(error)));
    observeDialogs(page);

    await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__HAPIL_COMBAT_AUDIO_V1__&&window.__HAPIL_PARTY_LAUNCH_V31322__, null, {timeout:60000});
    await page.waitForTimeout(600);
    assert.equal(requests.filter(row=>uploaded(row.path)).length, 0, 'no upload is fetched/preloaded on title or prologue');
    check('title/prologue request isolation');

    await startGame();
    await page.waitForSelector('#hapil-story-rc51');
    assert.equal(requests.filter(row=>uploaded(row.path)).length, 0, 'no upload is fetched for initial story card');
    assert((await page.locator('#hapil-story-rc51 .rc51-copy').innerText()).length > 20, 'canonical story text remains visible');
    await waitSilent();
    check('initial canonical narration remains combat-upload-free');

    // Decode every shipped MP3/WAV through actual Chromium WebAudio, separately
    // from native game routing so the title request assertions stay meaningful.
    report.decoded=await page.evaluate(async assets=>{
      const context=new AudioContext(), results=[];
      try {
        await context.resume();
        for(const asset of assets){
          const response=await fetch(asset.path); if(!response.ok)throw Error(asset.role+' HTTP '+response.status);
          const decoded=await context.decodeAudioData(await response.arrayBuffer());
          let peak=0,energy=0;
          for(let channel=0;channel<decoded.numberOfChannels;channel++)for(const value of decoded.getChannelData(channel)){peak=Math.max(peak,Math.abs(value));energy+=value*value;}
          results.push({role:asset.role,duration:decoded.duration,channels:decoded.numberOfChannels,sampleRate:decoded.sampleRate,peak,energy});
        }
      } finally {await context.close();}
      return results;
    }, manifest.assets);
    for(const decoded of report.decoded){const asset=manifest.assets.find(x=>x.role===decoded.role);assert(Math.abs(decoded.duration-asset.duration)<.15, decoded.role+' real decoded duration');assert.equal(decoded.channels,2,decoded.role+' stereo channels');assert(decoded.energy>0,decoded.role+' non-silent PCM');}
    check('all eight immutable real assets decode in Chromium');

    for(const [zone,rank,role] of [['dist01','ordinary','clockwork'],['dist02','midboss','clockworkIntense'],['dist06','boss','foldingSpace']]){
      await stage(zone,rank); await waitPlayed(role); await waitMusic(role);
      const before=await played(role); await page.waitForTimeout(550);
      assert.equal(await played(role),before,role+' is not restarted by each normal frame');
      check('native-frame music selection: '+role);
    }
    const awakened=await page.evaluate(()=>__MONGSE_QA_API__.forceAwakening('hwando',8,20));
    assert(awakened?.until>0); await waitPlayed('timeControl'); await waitMusic('timeControl');
    assert(await page.evaluate(()=>__MONGSE_QA_STATE__.awakeningUntil>__MONGSE_QA_STATE__.time));
    check('actual native awakening selects timeControl');
    await stage('kair03','boss'); await waitMusic('timeControl');
    check('kair encounter selects timeControl');

    // Cross the native loop boundary by seeking the real playing element. This
    // exercises the manager monitor and its media crossfade without a 3min wait.
    for(const [zone,rank,role] of [['dist01','ordinary','clockwork'],['dist02','midboss','clockworkIntense'],['dist06','boss','foldingSpace'],['kair03','boss','timeControl']]){
      await stage(zone,rank); await waitMusic(role);
      const before=await played(role);
      await page.evaluate(role=>{const p=__HAPIL_COMBAT_AUDIO_CATALOG_V1__.music[role],media=[...__combatMediaProbe.elements].find(x=>!x.paused&&x.src.includes(p.path.split('/').at(-1)));if(!media)throw Error('Missing loop media');media.currentTime=p.loopEnd-p.crossfade+.05;},role);
      await waitPlayed(role,before); await waitMusic(role);
      const live=(await snapshot()).audio.decks.filter(x=>x.kind==='music'&&!x.paused&&!x.ended);
      assert(live[0].time<10,role+' loop restarts near the authored loopStart');
      check('native real-media crossfade loop: '+role);
    }

    await stage('dist06','boss'); await waitMusic('foldingSpace');
    let before=await played('dark');
    const dark=await queueImpact({label:'발록 지옥 충격'}); await assertNativeImpact(dark); await waitPlayed('dark',before);
    check('native infernal impact plays dark effect');

    await stage('u203','boss'); await waitMusic('foldingSpace');
    before=await played('blackHole');
    const blackHole=await queueImpact({label:'공허 기억흡입',kind:'donut',count:6});
    await assertNativeImpact(blackHole); await waitPlayed('blackHole',before); await page.waitForTimeout(350);
    assert.equal(await played('blackHole'),before+1,'six admitted absorption impacts are bounded by effect cooldown');
    check('native absorption impact plays one bounded blackHole effect');

    await stage('ep1b03','boss'); await waitMusic('foldingSpace');
    const envyOwner=await page.evaluate(()=>{const s=__MONGSE_QA_STATE__,a=s.enemies[0];return{id:a.id,humanPhase0:a.humanPhase0,phase:__HAPIL_RC86_BRIDGE__.phase(a)};});
    assert.equal(envyOwner.id,'b03-boss'); assert.equal(envyOwner.humanPhase0,true); assert.equal(envyOwner.phase,0);
    before=await played('illusion');
    const illusion=await queueImpact({label:'질투 · 비교거울 반사',mechanic:'envy-mirror-bleed'});
    await assertNativeImpact(illusion);
    await page.waitForFunction(owner=>__MONGSE_QA_STATE__.enemies.some(x=>x.envyHallucination&&x.summonOwnerId===owner),illusion.owner,{timeout:8000});
    await waitPlayed('illusion',before);
    check('native damaging envy hit creates actual clone and plays illusion');

    // Leave the final wave pending; the native scheduler instantiates and
    // admits the real demonic midboss, which executes its actual entry hook.
    await stage('dist02','ordinary');
    before=await played('roar');
    await page.evaluate(()=>{const s=__MONGSE_QA_STATE__;s.enemies=[];s.spawnedWaves=new Set([1,2]);s.bossDefeated=false;s.pendingSpawns=[];});
    await page.waitForFunction(()=>__MONGSE_QA_STATE__.enemies.some(x=>x.midboss&&x.hp>0),null,{timeout:8000});
    await waitPlayed('roar',before);
    report.eventEvidence.push(await page.evaluate(()=>({spawned:__MONGSE_QA_STATE__.enemies.filter(x=>x.midboss).map(x=>({id:x.id,name:x.name})),wave:[...__MONGSE_QA_STATE__.spawnedWaves]})));
    check('native wave scheduler plays demonic midboss entry roar');

    // Settings use the same bound handlers as the React controls; opening the
    // settings screen itself must also pause all uploaded combat audio.
    await stage('dist01','ordinary'); await waitMusic('clockwork');
    await page.evaluate(()=>__HAPIL_CONTROLS_V31329__.binding.actions.settings());
    await page.getByRole('slider',{name:'배경음악 음량',exact:true}).waitFor(); await waitSilent();
    const volumeSlider=page.getByRole('slider',{name:'배경음악 음량',exact:true});await volumeSlider.focus();await volumeSlider.press('Home');for(let i=0;i<5;i++)await volumeSlider.press('ArrowRight');
    await page.getByRole('checkbox',{name:'배경음악',exact:true}).uncheck();
    await page.evaluate(()=>__HAPIL_CONTROLS_V31329__.binding.actions.dismiss()); await waitSilent();
    assert.equal(await page.evaluate(()=>__HAPIL_CONTROLS_V31329__.binding.settings.current.bgmVolume),.25);
    await settings({music:true}); await waitMusic('clockwork');
    await page.waitForFunction(()=>{const p=__HAPIL_COMBAT_AUDIO_CATALOG_V1__.music.clockwork;const a=__combatMediaProbe.snapshot().decks.find(x=>x.kind==='music'&&!x.paused&&!x.ended);return a&&Math.abs(a.volume-p.gain*.25)<.001;},null,{timeout:8000});
    check('real settings checkbox/range, pause and native volume restoration');

    await page.keyboard.press('Escape'); await waitSilent();
    await page.keyboard.press('Escape'); await waitMusic('clockwork');
    check('Escape pause/resume cancels and restores combat music');

    const pausedDeck=await page.evaluate(()=>{const media=[...__combatMediaProbe.elements].find(x=>__combatMediaProbe.kind(x)==='music'&&!x.paused);window.__testCombatHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__testCombatHidden});document.dispatchEvent(new Event('visibilitychange'));return{src:media.src,time:media.currentTime};});
    await waitSilent(); await page.waitForTimeout(250);
    assert(await page.evaluate(({src,time})=>[...__combatMediaProbe.elements].some(x=>x.src===src&&x.paused&&Math.abs(x.currentTime-time)<.15),pausedDeck),'hidden pause preserves current media offset');
    await page.evaluate(()=>{window.__testCombatHidden=false;document.dispatchEvent(new Event('visibilitychange'));}); await waitMusic('clockwork');
    check('visibility event suspends uploads and resumes from offset');

    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide'))); await waitSilent();
    await page.evaluate(()=>window.dispatchEvent(new Event('pageshow'))); await waitMusic('clockwork');
    check('pagehide/pageshow lifecycle');

    // A real canonical card shown over combat cancels the music; closing it
    // lets the unchanged frame pipeline resume. Its content stays exact.
    const cardText=await page.evaluate(()=>{const s=__MONGSE_QA_STATE__,r=__HAPIL_STORY_DATA_RC51__.records.find(x=>x.zone===s.zone);__HAPIL_STORY_RC51__.show(s,r,'pre',r.pre,()=>{}, {sound:false});return r.pre;});
    await waitSilent(); assert.equal(await page.locator('#hapil-story-rc51 .rc51-copy').evaluate(el=>[...el.querySelectorAll('p')].map(p=>p.textContent).join('\n\n')),cardText);
    await page.getByRole('button',{name:'계속 · Enter',exact:true}).click(); await waitMusic('clockwork');
    check('canonical story overlay cancels combat music and preserves exact text');

    await stage('u203','boss'); await waitMusic('foldingSpace');
    before=await played('blackHole');
    const interrupted=await queueImpact({label:'공허 기억흡입'}); await assertNativeImpact(interrupted); await waitPlayed('blackHole',before);
    assert((await snapshot()).audio.effects>0,'an actual new effect is active before settings cancellation');
    await settings({sound:false});
    await page.waitForFunction(()=>__combatMediaProbe.sample().effects===0);
    check('sound settings immediately cancel active uploaded effects');
    before=await played('blackHole');
    const muted=await queueImpact({label:'공허 기억흡입'}); await assertNativeImpact(muted); await page.waitForTimeout(150);
    assert.equal(await played('blackHole'),before,'muted native event never plays');
    await settings({sound:true}); await page.waitForTimeout(250); assert.equal(await played('blackHole'),before,'unmute does not replay stale event');
    await settings({sfxVolume:0}); const zero=await queueImpact({label:'공허 기억흡입'}); await assertNativeImpact(zero); assert.equal(await played('blackHole'),before);
    await settings({sfxVolume:.5});
    check('sound/zero-volume gates consume events without delayed replay');

    // Use an Episode1 encounter with an authored death destination. A bare HP
    // write in a later QA-jumped map can revive/respawn without a death card.
    // The actual queued damage below downs every live party member and reaches
    // the normal shouldRespawn -> beforeRespawn -> death-scripture path.
    await stage('dist06','boss'); await waitMusic('foldingSpace');
    await settings({autoCombat:true,combatMode:'full',autoStoryAdvance:true});
    const death=await page.evaluate(()=>{
      const s=__MONGSE_QA_STATE__,a=s.enemies.find(x=>x.id==='dist06-boss');
      if(!a)throw Error('Missing native death-test boss');
      if(__HAPIL_SAMONG_RC91__?.enabled(s))throw Error('Death fixture must use ordinary STORY mode');
      // Observe the native modal lifetime, avoiding Node/browser scheduling
      // delays in the three-second timer measurement.
      window.__combatDeathTiming={shown:0,closed:0};
      const watch=new MutationObserver(()=>{
        const visible=!!document.getElementById('hapil-death-verse-rc59');
        if(visible&&!__combatDeathTiming.shown)__combatDeathTiming.shown=performance.now();
        if(!visible&&__combatDeathTiming.shown){__combatDeathTiming.closed=performance.now();watch.disconnect();}
      });
      watch.observe(document.body,{childList:true,subtree:true});
      const allies=__HAPIL_PARTY_V31322__?.actors??[];
      for(const target of [s,...allies]){
        target.hp=1;target.invulnerableUntil=0;target.lastDodgeAt=-100;
        target.x=s.x;target.y=s.y;target.dashingUntil=0;
      }
      // The fixture represents a lethal hit after defensive cooldowns have
      // been spent, not a low-HP frame that can grant fresh survival grace.
      s.guardianGraceReadyAt=s.time+10.5;s.autoEvadeReadyAt31223=s.time+10.5;
      s.episode1ACompleteRC59=false;s.completedZones?.delete?.('ep1a11');s.lastShelterZoneRC59=null;
      const id=s.fxSerial++;
      s.impactQueue.push({id,sourceId:a.id,born:s.time-.5,at:s.time-.01,impactAt:s.time-.001,
        x:s.x,y:s.y,originX:a.x,originY:a.y,shape:'circle',radius:4,innerRadius:0,width:1,
        damage:1000,boss:true,midboss:false,patternSet:a.patternSet,label:'발록 지옥 충격',
        color:'#7733ff',accent:'#ffffff',status:'none',statusValue:0,telegraphEndedAt:s.time-.01,
        terrainPiercing31214:true,obstaclePiercing31214:true,losRequired31214:false});
      return{id,owner:a.id,partyTargets:allies.length+1};
    });
    await page.waitForSelector('#hapil-death-verse-rc59',{timeout:8000});
    await waitSilent();
    assert.equal(await page.locator('#hapil-death-verse-title-rc59').textContent(),'죽음은 끝이 아니라 다시 걷는 문턱');
    assert.equal(await page.evaluate(()=>__MONGSE_QA_STATE__.deathRespawnZoneRC59),'dist00','native Episode1 death chose its authored restart');
    assert.equal(await page.evaluate(()=>__MONGSE_QA_STATE__.lastDeathScriptureRC59),'John 11:25; Romans 6:23');
    assert(await page.locator('#hapil-death-verse-rc59').isVisible(),'combat uploads are silent while the real death modal is open');
    await page.waitForSelector('#hapil-death-verse-rc59',{state:'detached',timeout:4500});
    const timing=await page.evaluate(()=>__combatDeathTiming);
    const deathModalMs=timing.closed-timing.shown;
    assert(deathModalMs>=2800&&deathModalMs<4300,`native full-auto death modal keeps its3second restart (${deathModalMs}ms)`);
    report.eventEvidence.push({...death,deathModalMs});
    await settings({autoCombat:false,combatMode:'manual',autoStoryAdvance:false});
    check('native lethal party hit cancels uploads during death modal and preserves3second auto-restart');
    await stage('dist01','ordinary'); await waitMusic('clockwork');
    await page.evaluate(()=>{const s=__MONGSE_QA_STATE__;s.zone='hub';s.enemies=[];}); await waitSilent();
    check('scene change to hub ends uploaded music/effects');

    await stage('dist01','ordinary'); await waitMusic('clockwork');
    await page.evaluate(()=>{const s=__MONGSE_QA_STATE__;s.enemies=[];s.spawnedWaves=new Set([1,2,3,4]);s.bossDefeated=true;s.pendingSpawns=[];}); await waitSilent();
    check('encounter completion ends uploaded music/effects');

    await page.evaluate(()=>{__HAPIL_STORY_RC51__.close(false);__HAPIL_CONTROLS_V31329__.binding.actions.settings();});
    // The native action asks before navigating. Playwright otherwise dismisses
    // confirm dialogs automatically and correctly leaves the Settings open.
    expectedTitleDialog=true;
    const titleDialog=page.waitForEvent('dialog');
    const titleClick=page.getByRole('button',{name:'자동 저장 후 시작 화면으로',exact:true}).click();
    const confirmation=await titleDialog;
    assert.equal(confirmation.type(),'confirm');
    assert.equal(confirmation.message(),'현재 진행을 자동 저장하고 시작 화면으로 돌아갑니까?');
    await confirmation.accept();expectedTitleDialog=false;await titleClick;
    await page.locator('.title-screen').getByRole('button',{name:'새 게임 시작',exact:true}).waitFor();
    await page.locator('.game').waitFor({state:'detached'});
    await page.waitForFunction(()=>__HAPIL_COMBAT_AUDIO_V1__.diagnostics.mode==='inactive');await waitSilent();
    const terminal=await snapshot(); assert(terminal.audio.maxMusic<=2, 'at most two uploaded music decks during crossfades'); assert(terminal.audio.maxEffects<=2, 'at most two actual/pending uploaded effects');
    report.maximumUploadedMusic=terminal.audio.maxMusic; report.maximumUploadedEffects=terminal.audio.maxEffects;
    check('return-to-title lifecycle and whole-session real/pending voice bounds');

    // New document clears failure memoization; fail only the ordinary combat
    // MP3. Native fallback must remain playable and frames/text must progress.
    failurePaths.add(new URL(manifest.assets.find(x=>x.role==='clockwork').path, 'http://localhost/').pathname);
    await startGame();
    await page.evaluate(()=>__HAPIL_STORY_RC51__.close(true));
    // Inline setup because stage() deliberately requires successful combat routing.
    await page.evaluate(()=>{__MONGSE_QA_API__.stageV3128BossShowcase('dist01');const s=__MONGSE_QA_STATE__;__HAPIL_STORY_RC51__.beforeFrame(s,{sound:false,clear:false});__HAPIL_STORY_RC51__.close(true);s.enemies[0].boss=false;s.enemies[0].midboss=false;s.enemies[0].readyAt=s.time+10000;s.enemies[0].patternReadyAt=s.time+10000;s.enemies[0].recoverUntil=s.time+10000;s.invulnerableUntil=s.time+10000;});
    await page.waitForFunction(()=>__HAPIL_COMBAT_AUDIO_V1__.diagnostics.mode==='fallback'&&__HAPIL_COMBAT_AUDIO_V1__.diagnostics.failedPaths>=1,null,{timeout:15000});
    await page.waitForFunction(()=>__combatMediaProbe.snapshot().decks.some(x=>x.kind==='legacy'&&!x.paused&&!x.ended&&x.readyState>=2&&x.volume>0),null,{timeout:15000});
    const failTime=await page.evaluate(()=>__MONGSE_QA_STATE__.time); await page.waitForFunction(t=>__MONGSE_QA_STATE__.time>t+.15,failTime);
    const failureText=await page.evaluate(()=>{const s=__MONGSE_QA_STATE__,r=__HAPIL_STORY_DATA_RC51__.records.find(x=>x.zone===s.zone);window.__combatFailureContinued=0;__HAPIL_STORY_RC51__.show(s,r,'post',r.post,()=>window.__combatFailureContinued++,{sound:false});return r.post;});
    assert.equal(await page.locator('#hapil-story-rc51 .rc51-copy').evaluate(el=>[...el.querySelectorAll('p')].map(p=>p.textContent).join('\n\n')),failureText);
    await page.getByRole('button',{name:'계속 · Enter',exact:true}).click(); assert.equal(await page.evaluate(()=>__combatFailureContinued),1);
    await page.waitForTimeout(1000);
    assert.equal((await snapshot()).audio.music,0,'failed upload cannot keep a playing deck or a delayed retry');
    check('HTTP404 upload preserves native fallback, frame progress and canonical card continuation');
    failurePaths.add(new URL(manifest.assets.find(x=>x.role==='dark').path, 'http://localhost/').pathname);
    await stage('dist06','boss'); await waitMusic('foldingSpace');
    const missingEffect=await queueImpact({label:'발록 지옥 충격'}); await assertNativeImpact(missingEffect);
    await page.waitForFunction(()=>__HAPIL_COMBAT_AUDIO_V1__.diagnostics.failedPaths>=2,null,{timeout:15000});
    assert.equal(await played('dark'),0,'404 effect cannot report accepted real playback');
    await page.waitForFunction(()=>__combatMediaProbe.sample().effects===0);
    const failedAttempts=await page.evaluate(()=>__combatMediaProbe.events.filter(x=>x.kind==='effect'&&x.type==='play').length);
    await page.keyboard.press('Shift'); await page.waitForTimeout(1000);
    assert.equal(await page.evaluate(()=>__combatMediaProbe.events.filter(x=>x.kind==='effect'&&x.type==='play').length),failedAttempts,'failed new effect never enters delayed gesture replay');
    check('404 effect releases pending voice and never replays on a later gesture');

    // Fresh storage, media elements and user-activation state. This is Chromium
    // touch emulation, not a physical Android/iOS device or speaker test.
    failurePaths.clear();
    await page.close();
    const mobileContext=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
    page=await mobileContext.newPage();
    page.setDefaultTimeout(20000);
    observeDialogs(page);
    await page.addInitScript(installMediaProbe);
    await page.addInitScript(()=>{
      window.__trustedCombatTouches=0;
      document.addEventListener('pointerdown',event=>{if(event.isTrusted&&event.pointerType==='touch')window.__trustedCombatTouches++;},true);
    });
    page.on('pageerror',error=>errors.push('mobile: '+String(error)));
    const mobileRequests=[];
    page.on('request',request=>{if(uploaded(new URL(request.url()).pathname))mobileRequests.push(request.url());});
    await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__HAPIL_DANMAKU_HUD_RC129__?.installed&&window.__HAPIL_RC127_INSTALLED__,null,{timeout:60000});
    assert.equal(mobileRequests.length,0,'mobile title/prologue never preloads combat uploads');
    const mobileInput=await page.evaluate(()=>({touchPoints:navigator.maxTouchPoints,coarse:matchMedia('(pointer: coarse)').matches,viewport:{width:innerWidth,height:innerHeight}}));
    assert(mobileInput.touchPoints>0&&mobileInput.coarse,'fresh context exposes a real Chromium touch input surface');
    // The overlay owns touch advancement; the decorative button is not the
    // active touch target during the mark phase. Tap the live quote surface
    // once, then retain the authored mark timer and fade/removal lifecycle.
    const openingPhase=await page.evaluate(()=>{
      const root=document.getElementById('mongse-christian-opening-v31236');
      return root&&!root.classList.contains('is-leaving')?root.dataset.phase:null;
    });
    if(openingPhase==='quote')await page.locator('#mongse-christian-opening-v31236').tap({position:{x:20,y:20}});
    await page.locator('#mongse-christian-opening-v31236').waitFor({state:'detached',timeout:6000});
    await page.getByRole('button',{name:'새 게임 시작',exact:true}).tap();
    await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).tap();
    await page.waitForFunction(()=>window.__MONGSE_QA_STATE__&&window.__MONGSE_QA_API__,null,{timeout:60000});
    await settings({music:true,sound:true,bgmVolume:.4,sfxVolume:.5,autoCombat:false,combatMode:'manual',autoStoryAdvance:false});
    await page.waitForSelector('#hapil-story-rc51');
    assert.equal(mobileRequests.length,0,'mobile initial narration never requests combat uploads');
    await waitSilent();
    await page.getByRole('button',{name:'계속 · Enter',exact:true}).tap();
    await stage('dist01','ordinary');await waitPlayed('clockwork');await waitMusic('clockwork');
    assert(await page.evaluate(()=>navigator.userActivation.hasBeenActive),'touch start provides actual browser user activation');
    check('mobile touch start keeps title/story upload-free and starts native combat music');

    const openMobileSettings=async()=>{
      // Touch CSS hides the native topbar. Its replacement toolbar dispatches
      // Settings on trusted pointerdown through the mobile action controller.
      await page.getByRole('button',{name:'설정 메뉴 열기',exact:true}).tap();
      await page.getByRole('dialog',{name:'설정',exact:true}).waitFor();
    };
    const closeMobileSettings=()=>page.getByRole('dialog',{name:'설정',exact:true}).getByRole('button',{name:'닫기 ×',exact:true}).tap();
    await openMobileSettings();await waitSilent();
    check('mobile touch settings pauses uploaded combat audio');
    const musicToggle=page.getByRole('checkbox',{name:'배경음악',exact:true});
    assert(await musicToggle.isChecked());await musicToggle.tap();assert.equal(await musicToggle.isChecked(),false);
    await closeMobileSettings();await waitSilent();
    assert.equal(await page.evaluate(()=>__HAPIL_CONTROLS_V31329__.binding.settings.current.music),false);
    await openMobileSettings();await musicToggle.tap();assert(await musicToggle.isChecked());
    const mobileVolume=page.getByRole('slider',{name:'배경음악 음량',exact:true});
    await mobileVolume.scrollIntoViewIfNeeded();
    const sliderBox=await mobileVolume.boundingBox();assert(sliderBox&&sliderBox.width>30,'mobile music slider has a touchable track');
    const oldMobileVolume=Number(await mobileVolume.inputValue());
    await mobileVolume.tap({position:{x:sliderBox.width*.25,y:sliderBox.height/2}});
    const selectedMobileVolume=Number(await mobileVolume.inputValue());
    assert(selectedMobileVolume>0&&selectedMobileVolume<oldMobileVolume,'actual touch on slider lowers the stored music volume');
    assert.equal(await page.evaluate(()=>__HAPIL_CONTROLS_V31329__.binding.settings.current.bgmVolume),selectedMobileVolume/100);
    await closeMobileSettings();await waitMusic('clockwork');
    await page.waitForFunction(value=>{
      const p=__HAPIL_COMBAT_AUDIO_CATALOG_V1__.music.clockwork;
      const a=__combatMediaProbe.snapshot().decks.find(x=>x.kind==='music'&&!x.paused&&!x.ended);
      return a&&Math.abs(a.volume-p.gain*value/100)<.001;
    },selectedMobileVolume,{timeout:8000});
    check('mobile touch mute/unmute and range control set actual media volume');
    await openMobileSettings();await waitSilent();await closeMobileSettings();await waitMusic('clockwork');
    check('mobile touch pause/resume restores native combat playback');

    const mobileStory=await page.evaluate(()=>{
      const s=__MONGSE_QA_STATE__,r=__HAPIL_STORY_DATA_RC51__.records.find(x=>x.zone===s.zone);
      __HAPIL_STORY_RC51__.show(s,r,'pre',r.pre,()=>{},{sound:false});return r.pre;
    });
    await waitSilent();
    assert.equal(await page.locator('#hapil-story-rc51 .rc51-copy').evaluate(el=>[...el.querySelectorAll('p')].map(p=>p.textContent).join('\n\n')),mobileStory);
    await page.getByRole('button',{name:'계속 · Enter',exact:true}).tap();await waitMusic('clockwork');
    check('mobile canonical story cancels uploads and touch Continue restores combat');
    await page.evaluate(()=>{window.__mobileCombatHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__mobileCombatHidden});document.dispatchEvent(new Event('visibilitychange'));});
    await waitSilent();
    await page.evaluate(()=>{window.__mobileCombatHidden=false;document.dispatchEvent(new Event('visibilitychange'));});await waitMusic('clockwork');
    check('mobile visibility lifecycle cancels and resumes uploaded combat audio');
    const mobileAudio=(await snapshot()).audio;
    assert(mobileAudio.maxMusic<=2,'mobile upload music overlap is bounded by native crossfades');
    assert(mobileAudio.maxEffects<=2,'mobile actual/pending uploaded effect cap remains bounded');
    const trustedTouches=await page.evaluate(()=>__trustedCombatTouches);
    assert(trustedTouches>=10,'mobile flow used trusted touchscreen events for startup and controls');
    await page.screenshot({path:path.join(output,'mobile-touch-combat.png')});
    report.mobile={...mobileInput,trustedTouches,selectedMusicVolume:selectedMobileVolume/100,uploadedRequests:mobileRequests.length,maximumUploadedMusic:mobileAudio.maxMusic,maximumUploadedEffects:mobileAudio.maxEffects,scope:'390x844 Chromium mobile/touch emulation; native media playback, not physical-device or iOS/Safari validation'};
    assert.deepEqual(unexpectedDialogs,[],'no unexpected native browser dialogs');
    assert.deepEqual(errors,[], 'no uncaught errors in full game browser');
    report.pass=true;
  } catch(error) {
    report.pass=false; report.error=String(error.stack||error);
    if(page){try{report.failureSnapshot=await snapshot();await page.screenshot({path:path.join(output,'failure.png')});}catch{}}
    throw error;
  } finally {
    report.errors=errors;report.unexpectedDialogs=unexpectedDialogs; report.uploadedRequests=requests.filter(row=>uploaded(row.path));
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
    if(browser)await browser.close();
    server.closeAllConnections(); await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);server.closeAllConnections();server.close();process.exitCode=1;});
