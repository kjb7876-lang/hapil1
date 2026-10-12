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
const baselineMute=process.argv.includes('--baseline-mute');
const slotOnly=process.argv.includes('--slot-only');
const baselineController=baselineMute?require('node:child_process').execFileSync('git',['show','9ebd7e31912ea519839dce8c7a84f802cad83a21:assets/combat-audio/v1/controller.js'],{cwd:root}):null;
const fallback = process.env.HAPIL_SOURCE_ROOT ? path.resolve(process.env.HAPIL_SOURCE_ROOT) : root;
const output = process.env.HAPIL_COMBAT_AUDIO_OUTPUT || path.join(root, 'qa-results', 'combat-audio-browser');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/combat-audio/v1/manifest.json'), 'utf8'));
const runtime = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const playwright = runtime ? require(path.join(runtime, 'playwright')) : require('playwright');
const uploaded = pathname => pathname.includes('/assets/combat-audio/v1/audio/') || pathname.includes('/audio/rc133/processed/');
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
    const bytes = baselineMute && url.pathname==='/assets/combat-audio/v1/controller.js' ? baselineController : fs.readFileSync(file), headers = {'content-type':mime[path.extname(file)] || 'application/octet-stream', 'cache-control':'no-store', 'accept-ranges':'bytes'};
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
  const play = HTMLMediaElement.prototype.play, pause = HTMLMediaElement.prototype.pause;
  const elements = new Set(), ids = new WeakMap(), events = [];
  let serial = 0, maxMusic = 0, maxEffects = 0;
  const kind = media => {
    if(!media.src)return 'legacy';
    const canonical=value=>{try{const u=new URL(value,document.baseURI);return u.origin+u.pathname;}catch{return null;}};
    const source=canonical(media.src),catalog=window.__HAPIL_COMBAT_AUDIO_CATALOG_V1__;
    for(const [group,label] of [['music','music'],['effects','effect']])
      if(Object.values(catalog?.[group]??{}).some(profile=>canonical(profile.path)===source))return label;
    return 'legacy';
  };
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
  HTMLMediaElement.prototype.pause = function (...args) { event(this, 'pause'); return Reflect.apply(pause, this, args); };
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
const snapshot = () => page.evaluate(() => {const state=window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current;return {audio:__combatMediaProbe.snapshot(),routing:__HAPIL_COMBAT_AUDIO_V1__.diagnostics,state:{zone:state?.zone,time:state?.time,hp:state?.hp,enemies:state?.enemies?.map(e=>({id:e.id,hp:e.hp,boss:e.boss,midboss:e.midboss}))}};});
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
    window.__HAPIL_CONTROLS_V31329__?.clear?.('rc165-audio-stage');
    __HAPIL_STORY_RC51__.close(false);
    const result = __MONGSE_QA_API__.stageV3128BossShowcase(zone);
    if (!result.pass) return result;
    const s = __MONGSE_QA_STATE__, a = s.enemies[0];
    // Consume the canonical entry card through its own API, then allow frames.
    __HAPIL_STORY_RC51__.beforeFrame(s, {clear:false, sound:false});
    __HAPIL_STORY_RC51__.close(true);
    s.hp = s.maxHp; s.awakeningUntil = 0;
    // A preceding accepted hit or dash can leave a short-lived hurt/dash pose,
    // invulnerability or input lock on this shared QA world. Start each staged
    // encounter from a neutral hero state so the next action is measured itself.
    s.invulnerableUntil = s.time + 10000;
    s.lastDodgeAt = -100; s.dashingUntil = 0; s.dashReady = s.time;
    s.autoEvadeUntil31223 = 0; s.heroGuardUntil = 0; s.guardUntil = 0;
    s.bufferedAction = null; s.timeStopUntil = s.time;
    s.heroMotion = {kind:'idle',started:s.time,until:s.time,facing:s.facing,dx:0,dy:0,direction:s.facing<0?'left':'right'};
    window.__HAPIL_COMBAT_CORE_V31401__?.reset?.(s);
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
async function queueImpact({label, mechanic, count = 1, deadOwner = false, kind = 'circle', damage = 0, cancelled = false, evaded = false, nativeDeath = false}) {
  return page.evaluate(({label, mechanic, count, deadOwner, kind, damage, cancelled, evaded, nativeDeath}) => {
    const s = __MONGSE_QA_STATE__, a = s.enemies.find(x=>x.hp>0);
    if (!a) throw Error('Missing live native owner');
    const queuedAt=s.time, dodgeBefore=s.lastDodgeAt;
    s.invulnerableUntil = damage > 0 ? 0 : s.time + 10000;
    s.lastDodgeAt = -100; s.heroGuardUntil = 0; s.guardUntil = 0;
    let dashReturn=null;
    if (evaded) dashReturn=__HAPIL_CONTROLS_V31329__.binding.actions.dash();
    const dash={attempted:evaded,returnValue:dashReturn,lastDodgeAtBefore:dodgeBefore,lastDodgeAtAfter:s.lastDodgeAt,
      accepted:evaded&&s.lastDodgeAt!==-100,invulnerableUntil:s.invulnerableUntil,dashingUntil:s.dashingUntil,
      dashReady:s.dashReady,heroMotion:s.heroMotion?{kind:s.heroMotion.kind,until:s.heroMotion.until}:null};
    if (mechanic) { a.envyIllusionReadyAt = 0; s.hp = s.maxHp; }
    const ids = [],queuedHits=[];
    for(let i=0;i<count;i++) {
      const id=s.fxSerial++; ids.push(id);
      const hit={id, perfectWindow:.52, sourceId:a.id, born:s.time-.5, at:s.time-.01, impactAt:nativeDeath?s.time+.4:s.time-.001,
        x:s.x,y:s.y,originX:a.x,originY:a.y,shape:kind,radius:4,innerRadius:0,width:1,
        damage, cancelled,boss:!!a.boss,midboss:!!a.midboss,patternSet:a.patternSet,
        label,color:'#7733ff',accent:'#ffffff',status:'none',statusValue:0,
        sevenSinMechanic:mechanic, telegraphEndedAt:s.time-.01,
        terrainPiercing31214:true, obstaclePiercing31214:true, losRequired31214:false};
      (evaded ? s.pendingHits : s.impactQueue).push(hit);
      queuedHits.push({id,queue:evaded?'pendingHits':'impactQueue',queuedAt:s.time,at:hit.at,impactAt:hit.impactAt,
        sourceId:hit.sourceId,damage:hit.damage,cancelled:hit.cancelled,perfectWindow:hit.perfectWindow,
        shape:hit.shape,center:{x:hit.x,y:hit.y},origin:{x:hit.originX,y:hit.originY},radius:hit.radius});
    }
    let cancellation=null;

    if(nativeDeath){const before=s.impactQueue.filter(h=>ids.includes(h.id)).length;const result=__MONGSE_QA_API__.forceDefeatCurrentBossR4();cancellation={before,after:s.impactQueue.filter(h=>ids.includes(h.id)).length,result,time:s.time};}
    if (deadOwner) a.hp = 0;
    const variants=window.__HAPIL_MEDIA_AUDIO_EVENTS_RC133__?.enemyHeavy;let hash=0;for(const char of String(ids[0]))hash=(hash*31+char.charCodeAt(0))>>>0;
    const role=variants?.length?variants[hash%variants.length]:'dark',profile=__HAPIL_COMBAT_AUDIO_CATALOG_V1__.effects[role],pathname=new URL(profile.path,document.baseURI).pathname;
    const before=__combatMediaProbe.events.filter(e=>e.type==='accepted'&&e.src&&new URL(e.src).pathname===pathname).length;
    window.__RC165_AUDIO_LAST_IMPACT__={ids:[...ids],queuedAt,owner:a.id,zone:s.zone,damage,cancelled,evaded,dash,queuedHits};
    return {ids, cancellation, owner:a.id, zone:s.zone, hp:s.hp, queuedAt, dash,
      beforeClones:s.enemies.filter(x=>x.envyHallucination).length,infernalAudio:{role,path:pathname,before}};
  }, {label, mechanic, count, deadOwner, kind, damage, cancelled, evaded, nativeDeath});
}

async function impactDiagnostics() {
  return page.evaluate(() => {
    const s=__MONGSE_QA_STATE__,meta=window.__RC165_AUDIO_LAST_IMPACT__??{};
    const idKey=value=>value==null?null:String(value),ids=new Set((meta.ids??[]).map(idKey));
    const core=window.__HAPIL_COMBAT_CORE_V31401__?.snapshot?.(s);
    const relatedCombat=(core?.events??[]).filter(row=>ids.has(idKey(row.source?.id))).map(row=>({time:row.time,result:row.result,reason:row.reason,
      requestedDamage:row.requestedDamage,computedDamage:row.computedDamage,finalDamage:row.finalDamage,
      appliedDamage:row.appliedDamage,hpBefore:row.hpBefore,hpAfter:row.hpAfter,source:row.source,path:row.path}));
    return {meta,hero:{time:s.time,hp:s.hp,invulnerableUntil:s.invulnerableUntil,lastDodgeAt:s.lastDodgeAt,
        heroGuardUntil:s.heroGuardUntil,guardUntil:s.guardUntil,dashingUntil:s.dashingUntil,dashReady:s.dashReady,
        autoEvadeUntil31223:s.autoEvadeUntil31223,heroMotion:s.heroMotion?{kind:s.heroMotion.kind,until:s.heroMotion.until}:null},
      pendingHits:s.pendingHits.filter(hit=>ids.has(idKey(hit.id))).map(hit=>({id:hit.id,at:hit.at,damage:hit.damage,
        damageSuppressedV31226:hit.damageSuppressedV31226,perfectEvadedV31226:hit.perfectEvadedV31226,cancelled:hit.cancelled})),
      impactQueue:s.impactQueue.filter(hit=>ids.has(idKey(hit.id))).map(hit=>({id:hit.id,at:hit.at,impactAt:hit.impactAt,damage:hit.damage,
        damageSuppressedV31226:hit.damageSuppressedV31226,perfectEvadedV31226:hit.perfectEvadedV31226,cancelled:hit.cancelled})),
      processedEffects:s.effects.filter(effect=>ids.has(idKey(effect.pendingHitId))).map(effect=>({pendingHitId:effect.pendingHitId,
        born:effect.born,telegraphImpact:effect.telegraphImpact,impactShape:effect.impactShape,impactX:effect.impactX,impactY:effect.impactY,
        impactRadius:effect.impactRadius,sourceId:effect.sourceId})),
      perfectTexts:s.floatTexts.filter(row=>String(row.text).startsWith('PERFECT EVADE')).map(row=>({text:row.text,born:row.born,duration:row.duration})),
      combat:relatedCombat.slice(-12)};
  });
}

async function scenario(name, run) {
  if(slotOnly&&name!=='new-document-actual-slot-load'){(report.scenarios??=[]).push({name,status:'skipped',reason:'Unchanged runtime paths already verified at 3c754312d0919edb753fc8ff9c2e6b03c453ff4e'});return;}
  try { await page.evaluate(()=>{if(window.__testCombatHidden!==undefined){window.__testCombatHidden=false;document.dispatchEvent(new Event('visibilitychange'));}});await run(); (report.scenarios??=[]).push({name,status:'passed'}); }
  catch(error){
    (report.scenarios??=[]).push({name,status:'failed',error:String(error.stack||error)});
    console.log('RC165_SCENARIO_FAILURE '+name+' '+String(error));
    try{console.log('RC165_SCENARIO_DIAGNOSTIC '+name+' '+JSON.stringify(await impactDiagnostics()));}
    catch(diagnosticError){console.log('RC165_SCENARIO_DIAGNOSTIC_ERROR '+name+' '+String(diagnosticError));}
  }
}

async function assertNativeImpact(evidence) {
  await page.waitForFunction(ids => {
    const keys=new Set(ids.map(id=>String(id))),s=__MONGSE_QA_STATE__;
    return ![...(s.pendingHits??[]),...(s.impactQueue??[])].some(hit=>keys.has(String(hit.id)));
  }, evidence.ids, {timeout:8000});
  const effects = await page.evaluate(ids => {
    const keys=new Set(ids.map(id=>String(id)));
    return __MONGSE_QA_STATE__.effects.filter(effect=>keys.has(String(effect.pendingHitId)))
      .map(effect=>({id:effect.pendingHitId, owner:effect.sourceId, class:effect.bossSkillClass, impact:effect.telegraphImpact, born:effect.born}));
  }, evidence.ids);
  assert(effects.some(effect=>String(effect.owner)===String(evidence.owner)&&effect.impact===true), 'native frame committed the queued impact');
  report.eventEvidence.push({...evidence, effects});
}


(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    browser=await playwright.chromium.launch({chromiumSandbox:true,channel:'chrome',headless:true,args:[]});
    page=await browser.newPage({viewport:{width:1280,height:900}});
    page.on('pageerror',error=>errors.push(String(error)));observeDialogs(page);
    await page.addInitScript(installMediaProbe);await startGame();
    if(baselineMute){
      await stage('dist06','boss');await waitMusic('foldingSpace');
      const impact=await queueImpact({label:'공허 기억흡입'});await assertNativeImpact(impact);await waitPlayed('blackHole');
      const handle=await page.waitForFunction(()=>__combatMediaProbe.snapshot().decks.find(d=>d.kind==='effect'&&!d.paused&&!d.ended&&d.time>0),null,{timeout:5000});
      const active=await handle.jsonValue(),mark=await page.evaluate(()=>performance.now());
      await settings({music:false});
      await page.waitForFunction(id=>__combatMediaProbe.snapshot().decks.some(d=>d.id===id&&d.paused),active.id,{timeout:5000});
      const after=(await snapshot()).audio;
      assert(after.events.some(e=>e.id===active.id&&e.type==='pause'&&e.at>=mark));
      report.baseline={controllerCommit:'9ebd7e31912ea519839dce8c7a84f802cad83a21',controllerGitBlob:crypto.createHash('sha1').update(Buffer.from('blob '+baselineController.length+'\0')).update(baselineController).digest('hex'),active,after:after.decks.find(d=>d.id===active.id)};
      report.pass=true;check('exact approved baseline BGM-only mute cuts already-playing native SFX: regression reproduced');return;
    }
    await scenario('decode-original-eight',async()=>{
    report.decoded=await page.evaluate(async assets=>{const ctx=new AudioContext(),out=[];try{for(const asset of assets){const response=await fetch(asset.path);if(!response.ok)throw Error('decode HTTP '+response.status);const b=await ctx.decodeAudioData(await response.arrayBuffer());out.push({role:asset.role,duration:b.duration,channels:b.numberOfChannels});}}finally{await ctx.close();}return out;},manifest.assets);
    for(const decoded of report.decoded){const asset=manifest.assets.find(a=>a.role===decoded.role);assert(Math.abs(decoded.duration-asset.duration)<.15);assert.equal(decoded.channels,2);}check('eight original assets decode in Chromium; automated check, no physical listening claim');
    });
    await scenario('actual-native-damage-hit',async()=>{
    await settings({music:true,bgmVolume:.4,sound:true,sfxVolume:.5});
    await stage('dist06','boss');await waitMusic('foldingSpace');
    const hit=await queueImpact({label:'발록 지옥 충격',damage:20});
    await assertNativeImpact(hit);await waitPlayed(hit.infernalAudio.role,hit.infernalAudio.before);
    await page.waitForFunction(hp=>__MONGSE_QA_STATE__.hp<hp,hit.hp,{timeout:8000});
    assert.equal(await played(hit.infernalAudio.role),hit.infernalAudio.before+1);
    report.realHit={beforeHp:hit.hp,afterHp:(await snapshot()).state.hp,role:hit.infernalAudio.role};
    check('native queued damaging hit decreases actual HP and plays one accent');
    });
    for(const flags of [{evaded:true},{cancelled:true}]){
      await scenario(flags.evaded?'native-perfect-evade':'explicit-audio-suppression-flag',async()=>{
      await settings({music:true,bgmVolume:.4});await stage('dist06','boss');
      const perfectTextCount=flags.evaded?await page.evaluate(()=>__MONGSE_QA_STATE__.floatTexts.filter(t=>String(t.text).startsWith('PERFECT EVADE')).length):0;
      const suppressed=await queueImpact({label:'발록 지옥 충격',damage:20,...flags});
      if(flags.evaded)assert.equal(suppressed.dash.accepted,true,'the native perfect-evade input must be accepted by the staged hero');
      if(flags.evaded) {
        await page.waitForFunction(({count,queuedAt})=>{
          const rows=__MONGSE_QA_STATE__.floatTexts.filter(t=>String(t.text).startsWith('PERFECT EVADE'));
          return rows.length>count&&rows.some(t=>Number(t.born)>=queuedAt);
        },{count:perfectTextCount,queuedAt:suppressed.queuedAt},{timeout:5000});
      }
      await assertNativeImpact(suppressed);
      const settlementHandle=await page.waitForFunction(({ids,owner})=>{
        const s=__MONGSE_QA_STATE__,keys=new Set(ids.map(id=>String(id)));
        if([...(s.pendingHits??[]),...(s.impactQueue??[])].some(hit=>keys.has(String(hit.id))))return false;
        const effect=s.effects.find(row=>keys.has(String(row.pendingHitId))&&String(row.sourceId)===String(owner)&&row.telegraphImpact===true);
        return effect?{hp:s.hp,time:s.time,effect:{id:effect.pendingHitId,born:effect.born}}:false;
      },{ids:suppressed.ids,owner:suppressed.owner},{timeout:8000});
      const immediateSettlement=await settlementHandle.jsonValue();
      const diagnostic=await impactDiagnostics(),targetDamageEvents=diagnostic.combat.filter(event=>String(event.source?.id)===String(suppressed.ids[0])&&Number(event.appliedDamage)>0);
      if(flags.evaded)assert.equal(targetDamageEvents.length,0,'perfect evade must suppress damage from this native impact');
      else assert(targetDamageEvents.length>0,'audio-only suppression must preserve damage from this native impact');
      await page.evaluate(()=>{const s=__MONGSE_QA_STATE__;s.invulnerableUntil=Math.max(s.invulnerableUntil,s.time+5);});
      await page.waitForTimeout(750);
      assert.equal(await played(suppressed.infernalAudio.role),suppressed.infernalAudio.before);
      const afterSuppression=(await snapshot()).state.hp;
      report.eventEvidence.push({flags,beforeHp:suppressed.hp,immediateSettlement,afterHp:afterSuppression,
        accentCount:await played(suppressed.infernalAudio.role)-suppressed.infernalAudio.before,
        queuedAt:suppressed.queuedAt,dash:suppressed.dash,
        impactProcessed:diagnostic.processedEffects.some(effect=>suppressed.ids.some(id=>String(id)===String(effect.pendingHitId))&&String(effect.sourceId)===String(suppressed.owner)&&effect.telegraphImpact===true),
        targetDamageEvents,combat:diagnostic.combat});
      assert.equal(afterSuppression,immediateSettlement.hp,'no unrelated hit may contaminate the audio-settle window');
      check(flags.evaded?'native perfect-evade has no accent or damage from its impact':'explicit audio suppression has no accent and preserves damage from its impact');
      });
    }
    await scenario('native-owner-death-cancellation',async()=>{
    await settings({music:true,bgmVolume:.4,sound:true,sfxVolume:.5});
    await stage('dist06','boss');await waitMusic('foldingSpace');
    const removed=await queueImpact({label:'발록 지옥 충격',damage:20,nativeDeath:true});
    assert.equal(removed.cancellation.before,1);assert.equal(removed.cancellation.after,0);
    assert.equal(removed.cancellation.result.pass,true);
    await page.waitForTimeout(750);
    assert.equal(await played(removed.infernalAudio.role),removed.infernalAudio.before);
    assert.equal(await page.evaluate(ids=>__MONGSE_QA_STATE__.effects.filter(e=>ids.includes(e.pendingHitId)).length,removed.ids),0);
    report.eventEvidence.push({nativeOwnerDeath:removed.cancellation,beforeHp:removed.hp,afterHp:(await snapshot()).state.hp,accentCount:0});
    check('native QA forceDefeatCurrentBossR4 death cleanup removes queued impact before due time, with no impact effect or accent');
    });
    await scenario('two-playing-SFX-third-rejected',async()=>{
    await settings({music:true,bgmVolume:.4,sound:true,sfxVolume:.5});
    await stage('dist06','boss');await waitMusic('foldingSpace');
    await page.waitForFunction(()=>__combatMediaProbe.sample().effects===0,null,{timeout:15000});
    const capMark=await page.evaluate(()=>performance.now());
    const pair=await queueImpact({label:'공허 기억흡입'});await assertNativeImpact(pair);await waitPlayed('blackHole');
    const second=await queueImpact({label:'발록 지옥 충격'});await assertNativeImpact(second);await waitPlayed(second.infernalAudio.role,second.infernalAudio.before);
    await page.waitForFunction(()=>__combatMediaProbe.snapshot().decks.filter(d=>d.kind==='effect'&&!d.paused&&!d.ended&&!d.pending&&d.time>0&&d.volume>0).length===2,null,{timeout:5000});
    const third=await queueImpact({label:'질투 · 비교거울 반사',mechanic:'envy-mirror-bleed'});await assertNativeImpact(third);
    await page.waitForTimeout(120);
    const capped=(await snapshot()).audio;
    assert.equal(capped.events.filter(e=>e.kind==='effect'&&e.type==='accepted'&&e.at>=capMark).length,2);
    assert(capped.maxEffects<=2);report.voiceCap={accepted:capped.events.filter(e=>e.kind==='effect'&&e.type==='accepted'&&e.at>=capMark),maximum:capped.maxEffects,decks:capped.decks.filter(d=>d.kind==='effect'&&!d.paused&&!d.ended)};check('two already-playing SFX admit no third native media voice');
    });
    for(const mute of [{music:false},{bgmVolume:0}]){
      await scenario('BGM-only-mute '+JSON.stringify(mute),async()=>{
      await settings({music:true,bgmVolume:.4});await stage('dist06','boss');await waitMusic('foldingSpace');
      await page.waitForFunction(()=>__combatMediaProbe.sample().effects===0,null,{timeout:15000});
      await page.waitForTimeout(2600); // Native same-scope blackHole cooldown is 2.5 seconds.
      const effectBefore=await played('blackHole');
      const impact=await queueImpact({label:'공허 기억흡입'});await assertNativeImpact(impact);await waitPlayed('blackHole',effectBefore);
      const voice=await page.waitForFunction(()=>__combatMediaProbe.snapshot().decks.find(d=>d.kind==='effect'&&!d.paused&&!d.ended&&d.time>0),null,{timeout:5000});
      const active=await voice.jsonValue();const mark=await page.evaluate(()=>performance.now());
      await settings(mute);await page.waitForTimeout(120);
      const after=(await snapshot()).audio;
      assert(after.decks.some(d=>d.id===active.id&&!d.paused&&!d.ended&&d.time>active.time));
      assert.equal(after.events.filter(e=>e.id===active.id&&e.type==='pause'&&e.at>=mark).length,0);
      report.eventEvidence.push({mute,active,after:after.decks.find(d=>d.id===active.id)});
      check('BGM-only mute preserves already-playing native SFX '+JSON.stringify(mute));
      await page.waitForFunction(()=>__combatMediaProbe.sample().effects===0,null,{timeout:15000});
      });
    }
    await scenario('two-natural-BGM-loops',async()=>{
    await settings({music:true,bgmVolume:.4});await stage('dist01','ordinary');await waitMusic('clockwork');
    const before=await played('clockwork'),profile=await page.evaluate(()=>__HAPIL_COMBAT_AUDIO_CATALOG_V1__.music.clockwork);
    const loopDeadline=(profile.loopEnd-profile.loopStart)*2*1000+20000;
    const loopWallStart=Date.now();
    await page.waitForFunction(({before,path})=>__combatMediaProbe.events.filter(e=>e.kind==='music'&&e.type==='accepted'&&e.src&&new URL(e.src).pathname===new URL(path,document.baseURI).pathname).length>=before+2,{before,path:profile.path},{timeout:loopDeadline,polling:250});
    report.naturalLoop={role:'clockwork',elapsedWallMs:Date.now()-loopWallStart,profile,acceptedBefore:before,acceptedAfter:await played('clockwork'),events:(await snapshot()).audio.events.filter(e=>e.kind==='music'&&e.type==='accepted'&&e.src&&new URL(e.src).pathname===new URL(profile.path,'http://127.0.0.1:'+server.address().port).pathname)};
    assert(report.naturalLoop.elapsedWallMs>(profile.loopEnd-profile.loopStart-profile.crossfade)*2*1000-5000);
    check('two BGM loop transitions by natural elapsed time without seeking');
    });
    await scenario('region-and-visibility-return',async()=>{
    await settings({music:true,bgmVolume:.4,sound:true,sfxVolume:.5});
    await stage('dist02','midboss');await waitMusic('clockworkIntense');
    await page.evaluate(()=>{window.__testCombatHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__testCombatHidden});document.dispatchEvent(new Event('visibilitychange'));});await waitSilent();
    await page.evaluate(()=>{window.__testCombatHidden=false;document.dispatchEvent(new Event('visibilitychange'));});await waitMusic('clockworkIntense');check('zone change and visibility return reconnect combat music');
    });
    await scenario('new-document-actual-slot-load',async()=>{
    await settings({music:true,bgmVolume:.4,sound:true,sfxVolume:.5});
    await stage('dist02','midboss');await waitMusic('clockworkIntense');
    await page.evaluate(()=>__HAPIL_CONTROLS_V31329__.binding.actions.settings());
    await page.getByRole('button',{name:'저장 · 불러오기',exact:true}).click();
    await page.locator('.save-slots article').first().getByRole('button',{name:'저장',exact:true}).click();
    const saved=await snapshot();
    const savedSlot=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('mongse_save_v10_slot_1'));return {zone:s?.zone,hp:s?.hp,savedAt:s?.savedAt,enemyIds:s?.enemies?.map(e=>e.id)};});assert.equal(savedSlot.zone,saved.state.zone);
    await page.evaluate(()=>__HAPIL_CONTROLS_V31329__.binding.actions.dismiss());
    await page.evaluate(()=>__HAPIL_CONTROLS_V31329__.binding.actions.settings());
    expectedTitleDialog=true;
    const dialog=page.waitForEvent('dialog');const click=page.getByRole('button',{name:'자동 저장 후 시작 화면으로',exact:true}).click();
    await (await dialog).accept();expectedTitleDialog=false;await click;
    await page.locator('.title-screen').waitFor();await waitSilent();
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding&&window.__HAPIL_COMBAT_AUDIO_V1__);
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'이어하기',exact:true}).click();
    await page.locator('.game').waitFor();
    await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game'&&window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current);
    await page.evaluate(()=>{__HAPIL_STORY_RC51__.close(false);__HAPIL_CONTROLS_V31329__.binding.actions.dismiss();});
    await page.evaluate(()=>__HAPIL_CONTROLS_V31329__.binding.actions.settings());
    await page.getByRole('button',{name:'저장 · 불러오기',exact:true}).click();
    await page.evaluate(()=>{window.__rc165ObservedPreSlotLoadState=window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current;});
    await page.locator('.save-slots article').first().getByRole('button',{name:'불러오기',exact:true}).click();
    await page.waitForFunction(zone=>{const b=window.__HAPIL_CONTROLS_V31329__?.binding;return b?.phase==='game'&&b.state?.current&&b.state.current!==window.__rc165ObservedPreSlotLoadState&&b.state.current.zone===zone;},saved.state.zone);
    report.slotLoad={slot:1,savedSlot,nativeStateSource:"binding.state.current",nativeStateReplaced:true,savedZone:saved.state.zone,loadedZone:(await snapshot()).state.zone,titleContinueMayUseAuto:true,newDocument:true};
    const loadedState=await page.evaluateHandle(()=>__HAPIL_CONTROLS_V31329__.binding.state.current);
    report.slotLoad.storyBefore=await page.evaluate(()=>({open:__HAPIL_STORY_RC51__.isOpen(),readingBlocked:__HAPIL_READING_V31342__.blocked,routing:__HAPIL_COMBAT_AUDIO_V1__.diagnostics}));
    if(report.slotLoad.storyBefore.open){assert.equal(report.slotLoad.storyBefore.routing.mode,'paused');assert.equal(report.slotLoad.storyBefore.routing.selected,'blocked');}
    const storyDeadline=Date.now()+15000;let storyClicks=0;
    while(await page.evaluate(()=>__HAPIL_STORY_RC51__.isOpen())){
      assert.ok(storyClicks<30&&Date.now()<storyDeadline,'loaded story must finish through bounded rendered Continue');
      await page.locator('#hapil-story-rc51 .rc51-footer button:last-child').click({timeout:1000});storyClicks++;
    }
    await page.waitForFunction(()=>!__HAPIL_STORY_RC51__.isOpen()&&!__HAPIL_READING_V31342__.blocked,null,{timeout:1500});
    assert.equal(await page.evaluate(s=>__HAPIL_CONTROLS_V31329__.binding.state.current===s,loadedState),true);await loadedState.dispose();
    const afterStory=await snapshot();assert.equal(afterStory.state.zone,saved.state.zone);assert.deepEqual(afterStory.state.enemies.map(e=>e.id),savedSlot.enemyIds);
    report.slotLoad.storyAdvance={renderedContinueClicks:storyClicks,sameNativeState:true,after:afterStory};
    await page.waitForFunction(()=>__HAPIL_COMBAT_AUDIO_V1__.diagnostics.mode==='combat'&&__combatMediaProbe.sample().music>0,null,{timeout:20000});
    report.slotLoad.reconnected=await snapshot();
    check('manual slot1 save, title silence, new document native continue, actual slot1 load, combat music reconnect without restaging');
    });
    assert.equal(errors.length,0);report.pass=report.scenarios.filter(row=>row.status!=='skipped').every(row=>row.status==='passed');
    if(!report.pass)throw Error('Independent audio scenarios failed: '+report.scenarios.filter(row=>row.status==='failed').map(row=>row.name).join(', '));
  }catch(error){report.pass=false;report.error=String(error.stack||error);throw error;}
  finally{report.errors=errors;console.log('RC165_AUDIO_RESULT '+JSON.stringify(report));await browser?.close();await new Promise(resolve=>server.close(resolve));}
})();
