'use strict';

// RC223 left-floor browser QA against unchanged app bytes in official Chrome.
// The test uses the real native map entry, frame, movement, incoming damage,
// remote actor, and checkpoint paths. It stages positions and the lethal HP
// fixture explicitly; those actions are reported separately from normal play.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright'));

const runnerRoot = path.resolve(__dirname, '..');
const appRoot = path.resolve(process.env.HAPIL_TEST_BASE || runnerRoot);
const out = path.resolve(process.env.HAPIL_QA_OUTPUT || '/tmp/rc223-left-zone-browser');
fs.mkdirSync(out, {recursive:true});
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => fs.readFileSync(path.join(appRoot, file));
const git = args => {
  try { return cp.execFileSync('git', args, {cwd:appRoot,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim(); }
  catch { return null; }
};
const expectedSha = process.env.EXPECTED_SHA || null;
const appSha = git(['rev-parse','HEAD']);
if (process.env.EXPECTED_SHA) assert.equal(appSha, process.env.EXPECTED_SHA, 'served application checkout must match EXPECTED_SHA');

const manifestPath='qa/rc133/authorized-runtime-extension-148.json';
const manifest=JSON.parse(read(manifestPath));
assert.equal(manifest.base,'199402a0ece0747d2d354e8881e4a77910fb2423','extension manifest names the published baseline');
assert.equal(manifest.baseTree,'5e2df6a3b82ae0fab5e57da0ee20f8131c4c5d62','extension manifest names the published baseline tree');
const manifestRows=new Map(manifest.files.map(row=>[row.file,row]));
const BASELINE_BLOBS=Object.freeze({
  'assets/index-v31526.js':'683432273b993e199625a70d77ef7e7c22e5d7fa',
  'assets/rc134/persona-duel.js':'fcad81186db3afebe953a1d3305cc61b13916bdf',
  'assets/rc138/battle-arena.js':'872b7f4ec505b716a58210903f42ee58794de152',
  'assets/rc138/native-install.js.txt':'336483b97dc194c8de64a491930ea9e858d9f3d5',
  'assets/rc222/runtime.js':'386feb45e274a05a1548cce44007674d20de3c7f'
});
for(const [file,blob] of Object.entries(BASELINE_BLOBS)){
  const row=manifestRows.get(file),expected=row?.before?.gitBlob??blob;
  assert.equal(expected,blob,'manifest preserves the published git blob: '+file);
  assert.equal(git(['rev-parse','199402a0ece0747d2d354e8881e4a77910fb2423:'+file]),blob,'published git object is unchanged: '+file);
}
const sourceFiles = [
  'index.html','assets/index-v31526.js','assets/rc223/left-zone.js',manifestPath,
  'assets/rc138/battle-arena.js','assets/rc134/persona-duel.js',
  'assets/rc138/native-install.js.txt','assets/rc222/runtime.js'
];
const hashes = Object.fromEntries(sourceFiles.map(file => [file,sha256(read(file))]));
for(const [file,row]of manifestRows){
  const digest=hashes[file];
  if(digest&&row.after?.sha256)assert.equal(digest,row.after.sha256,'exact file matches authorized RC223 extension manifest: '+file);
}
assert.equal(hashes['assets/rc138/native-install.js.txt'],'98fb05c2f299ef78bc61719540a5ee39b72ac807325d6c8de0a48fc426ef2c7c','unchanged native-install source remains byte-identical');

const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2'};
const server = http.createServer((req,res) => {
  let file;
  try { const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(appRoot,'.'+(pathname==='/'?'/index.html':pathname)); }
  catch { return res.writeHead(400).end(); }
  if (!file.startsWith(appRoot+path.sep)) return res.writeHead(403).end();
  try { res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(file)); }
  catch { res.writeHead(404).end(); }
});

const report = {
  schema:1,status:'running',runnerSha:git(['rev-parse','HEAD']),appSha,expectedSha,appRoot,
  startedAt:new Date().toISOString(),
  scope:'Actual RC138 dist01 floor union, RC223 host, remote, and local P2 frames, real remote keyboard movement, Playwright ArrowLeft events through the native local P2 Party keyboard/setInput/tick path, native local strike, incoming damage, and native checkpoint re-entry in official Chrome with a loopback two-context WebSocket relay. For local P2, the fixture opens the production Party modal through its exported QA API because the app has no visible title-screen opener; hero selection, P2 selection, policy preparation, and Apply then use the real Party controls and handler. Positions and selected HP fixtures are staged.',
  limitations:[
    'Official Chrome contexts share one local loopback relay; this is not a physical four-network deployment.',
    'No physical phone or GPU coverage is included.',
    'Player positions and enemy readiness are staged to isolate native geometry and timers; movement, frame ticks, incoming reducers, co-op ownership, and checkpoint selection remain production paths.',
    'The checkpoint cleanup case stages both actors at 1 HP before applying real native incoming reducers; it does not claim a naturally reached lethal encounter.',
    'The local P2 case opens the production Party modal with the exported __HAPIL_PARTY_UI_V31322__.open() QA API; this is not a visible title-screen user route. The modal’s hero/P2 selections, two-human run policy, Apply handler, launch, and strict Slayer-host/Gunner-local/no-extra-AI roster assertion are production paths. Actor/enemy coordinates and HP are staged for repeatable probes. The dist01 RC51 pre-entry reader is deliberately opened through native beforeFrame and explicitly closed by the fixture; this is scripted progression, not natural reader completion. P2 movement uses Playwright-generated ArrowLeft key events captured by the native Party UI; the real 50 ms PARTY.setInput packets and keyup zero packet are recorded. This is not a physical keyboard or device test. Death cleanup is exercised through native incoming and revive frames; lifecycle cleanup uses the native return-to-title action because the run policy locks the human roster.',
    'After the native checkpoint flow, the Episode 1 death-verse dialog is acknowledged with its visible native restart button so later browser probes can continue; this is explicitly scripted manual progression.'
  ],
  environment:{officialChrome:false,isolatedContexts:0,actualWebSocketRelay:false,realFourNetworks:false,physicalDevice:false,physicalGPU:false},
  sources:sourceFiles.map(file=>({file,bytes:read(file).length,sha256:hashes[file],baseline199402a:BASELINE_BLOBS[file]||null,authorizedAfterSha256:manifestRows.get(file)?.after?.sha256||null})),
  checks:[],captures:[],errors:[],httpErrors:[],requestFailures:[]
};
let browser,relay,web,base='';
const pages=[],contexts=[];
const save = () => fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
function progress(name,value){const row=report.checks.at(-1);if(row){row.observations??=[];row.observations.push({name,at:new Date().toISOString(),value});save();}return value;}
async function verifyHttpSourceBytes(){
  const rows=[];
  for(const file of sourceFiles){const response=await fetch(base+'/'+file);assert.equal(response.status,200,'served source: '+file);const bytes=Buffer.from(await response.arrayBuffer()),digest=sha256(bytes);assert.equal(digest,hashes[file],'served bytes equal disk bytes: '+file);rows.push({file,status:response.status,bytes:bytes.length,sha256:digest,unchangedServedBytes:true});}
  report.httpSourceBytes=rows;
}
async function capture(name,page=pages[0]){
  if(!page)return null;
  const file=name+'.png',bytes=await page.screenshot({path:path.join(out,file),timeout:20000});
  const row={name,file,bytes:bytes.length,sha256:sha256(bytes),appSha,at:new Date().toISOString()};report.captures.push(row);
  if(process.env.HAPIL_QA_LOG_PREVIEW==='1'&&(name.includes('left-zone')||name.startsWith('failed-'))){const preview=await page.screenshot({type:'jpeg',quality:30,timeout:20000}),encoded=preview.toString('base64');console.log('RC223_LEFT_PREVIEW_META '+JSON.stringify({name,appSha,sha256:sha256(preview),bytes:preview.length,chunks:Math.ceil(encoded.length/4000)}));for(let i=0;i<encoded.length;i+=4000)console.log('RC223_LEFT_PREVIEW_CHUNK '+name+' '+i/4000+' '+encoded.slice(i,i+4000));}
  return row;
}
const check=async(name,page,fn)=>{
  const row={name,status:'running',startedAt:new Date().toISOString()};report.checks.push(row);
  try{row.evidence=await fn();row.status='passed';}
  catch(error){row.status='failed';row.error=error.stack||String(error);row.observations??=[];row.diagnostics=await page.evaluate(()=>{const C=window.__HAPIL_CONTROLS_V31329__,P=window.__HAPIL_PARTY_V31322__,s=P?.state??C?.binding?.state?.current,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,R=window.__HAPIL_BATTLE_ARENA_RC138__,runtime=window.__HAPIL_REMOTE_RC222_RUNTIME__,story=window.__HAPIL_STORY_RC51__,modal=C?.binding?.modal?.current,storyRoot=document.querySelector('#hapil-story-rc51');return{runtime:runtime?.status?.(),runtimeTelemetry:runtime?.telemetry?.(),party:P?.status,partyUIOpen:window.__HAPIL_PARTY_UI_V31322__?.isOpen?.()??false,modal:typeof modal==='string'?modal:modal?.kind??modal?.type??(modal?'[active]':null),phase:C?.binding?.phase,zone:s?.zone,time:s?.time,hp:s?.hp,maxHp:s?.maxHp,storyIsOpen:story?.isOpen?.()??false,storyCue:story?.currentNarrative?.()??null,storyReader:storyRoot?{zone:storyRoot.dataset.zone??null,phase:storyRoot.dataset.phase??null,text:storyRoot.textContent?.slice(0,320)??''}:null,readingBlocked:window.__HAPIL_READING_V31342__?.blocked??false,position:{x:s?.x,y:s?.y,moveVx:s?.moveVx,moveVy:s?.moveVy,moveDx:s?.moveDx,moveDy:s?.moveDy},actors:(P?.actors||[]).map(a=>({slotId:a.slotId,heroId:a.heroId,x:a.x,y:a.y,hp:a.hp,moveVx:a.moveVx,moveVy:a.moveVy,moveDx:a.moveDx,moveDy:a.moveDy,inspection:L?.inspect?.(s,a),factors:L?.factors?.(s,a)})),battleArena:R?.snapshot?.(s),leftZone:L?.snapshot?.(),player:L?.inspect?.(s,s),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent,enemies:(s?.enemies||[]).slice(0,8).map(a=>({id:a.id,hp:a.hp,x:a.x,y:a.y,readyAt:a.readyAt}))};}).catch(e=>({diagnosticError:String(e)}));row.diagnostics.observations=row.observations;console.error('RC223_LEFT_CHECK_FAILURE '+JSON.stringify({name,error:row.error,diagnostics:row.diagnostics}));await capture('failed-'+name,page).catch(()=>{});throw error;}
  finally{row.endedAt=new Date().toISOString();save();}
};
async function makePage(label){
  const context=await browser.newContext({viewport:{width:1280,height:900}});contexts.push(context);
  const page=await context.newPage();page.setDefaultTimeout(20000);pages.push(page);
  page.on('pageerror',e=>report.errors.push({label,error:e.stack||e.message}));
  page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({label,url:r.url(),status:r.status()});});
  page.on('requestfailed',r=>report.requestFailures.push({label,url:r.url(),failure:r.failure()}));
  await page.goto(base+'/?qa=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__HAPIL_LEFT_ZONE_NATIVE_RC223__?.installed&&window.__HAPIL_REMOTE_RC222__&&window.__HAPIL_REMOTE_RC222_RUNTIME__&&window.__HAPIL_NATIVE_ARENA_RC138__?.installed,null,{timeout:60000});
  await page.keyboard.press('Escape');
  return page;
}
async function startLocalGame(page){
  await page.waitForFunction(()=>typeof window.__HAPIL_PARTY_UI_V31322__?.open==='function',null,{timeout:10000});
  // QA-only opener: the production modal API is exported, but the visible
  // Party launcher is hidden and the title screen has no user-facing opener.
  // Everything after opening uses the real modal controls and Apply handler.
  await page.evaluate(()=>window.__HAPIL_PARTY_UI_V31322__.open());
  await page.locator('#hapil-party-dialog').waitFor({state:'visible',timeout:8000});
  await page.locator('#hapil-party-dialog select[aria-label="플레이 방식"]').selectOption('local');
  // Slayer is the native Episode 1 story-companion alternative, so the fresh
  // campaign does not add an unrelated AI actor beside the selected humans.
  await page.locator('#hapil-party-dialog select[aria-label="대표 영웅"]').selectOption('slayer');
  await page.locator('#hapil-party-dialog .hapil-party-field').filter({hasText:'두 번째 플레이어'}).locator('select').selectOption('gunner');
  await page.locator('#hapil-party-dialog select[aria-label="게임 모드"]').selectOption('STORY');
  const preparation=await page.evaluate(()=>{const dialog=document.querySelector('#hapil-party-dialog'),p2=[...(dialog?.querySelectorAll('.hapil-party-field')??[])].find(field=>field.textContent.includes('두 번째 플레이어'));return{mode:dialog?.querySelector('select[aria-label="플레이 방식"]')?.value,hero:dialog?.querySelector('select[aria-label="대표 영웅"]')?.value,p2Hero:p2?.querySelector('select')?.value,gameMode:dialog?.querySelector('select[aria-label="게임 모드"]')?.value};});
  assert.deepEqual(preparation,{mode:'local',hero:'slayer',p2Hero:'gunner',gameMode:'STORY'},'native Party preparation form selects local two-player mode and P2 hero before starting');
  await page.getByRole('button',{name:'적용하고 돌아가기',exact:true}).click();
  await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game'&&!!window.__HAPIL_CONTROLS_V31329__.binding.state.current,null,{timeout:30000});
  for(let i=0;i<22&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(70);}
  await page.evaluate(()=>{const C=window.__HAPIL_CONTROLS_V31329__;window.__HAPIL_STORY_RC51__?.close?.(false);C.binding.actions.dismiss();C.setMode('manual');});
  await page.locator('.game-stage canvas').waitFor({state:'visible'});
  const started=await page.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state;return{phase:window.__HAPIL_CONTROLS_V31329__?.binding?.phase,party:P.status,roster:P.roster,policy:window.__HAPIL_RUN_V31400__?.get?.(s)};});
  assert.equal(started.phase,'game');assert.equal(started.party.mode,'local2');assert.equal(started.policy?.humanPlayers,2);assert.deepEqual(started.policy?.humanHeroes,['gunner']);
  assert.deepEqual(started.roster.map(row=>({slotId:row.slotId,heroId:row.heroId,control:row.control})),[{slotId:'p1',heroId:'slayer',control:'host'},{slotId:'p2',heroId:'gunner',control:'local'}],'native launch carries the selected human roster into the new campaign without an extra AI actor');
  return{preparation,started};
}
async function readyPages(host,guest,roomCode){
  await host.locator('#rc222-create').click();await host.locator('#rc222-nickname').fill('left-zone-host');
  await host.locator('#rc222-settings').evaluate(node=>node.open=true);await host.locator('#rc222-endpoint').fill(report.relayURL);await host.locator('#rc222-connect').click();
  await host.waitForFunction(()=>window.__HAPIL_REMOTE_RC222__.status().connected,null,{timeout:15000});
  roomCode=await host.evaluate(()=>window.__HAPIL_REMOTE_RC222__.status().code);
  await guest.locator('#rc222-join').click();await guest.locator('#rc222-nickname').fill('left-zone-guest');await guest.locator('#rc222-code').fill(roomCode);
  await guest.locator('#rc222-settings').evaluate(node=>node.open=true);await guest.locator('#rc222-endpoint').fill(report.relayURL);await guest.locator('#rc222-connect').click();
  await guest.waitForFunction(()=>window.__HAPIL_REMOTE_RC222__.status().connected,null,{timeout:15000});await guest.locator('#rc222-ready').click();
  await host.waitForFunction(()=>window.__HAPIL_REMOTE_RC222__.status().roster.length===2&&window.__HAPIL_REMOTE_RC222__.status().roster[1].ready,null,{timeout:15000});
  await host.locator('#rc222-start').click();
  const playing=page=>page.waitForFunction(()=>window.__HAPIL_REMOTE_RC222__.status().phase==='playing'&&window.__HAPIL_REMOTE_RC222_RUNTIME__.status().ready&&!window.__HAPIL_REMOTE_RC222__.status().stale,null,{timeout:30000});
  await Promise.all([playing(host),playing(guest)]);
  await host.evaluate(()=>{window.__HAPIL_STORY_RC51__?.close?.(false);const C=window.__HAPIL_CONTROLS_V31329__;C.binding.actions.dismiss();C.setMode('manual');});
  await guest.evaluate(()=>{window.__HAPIL_STORY_RC51__?.close?.(false);window.__HAPIL_CONTROLS_V31329__?.binding?.actions?.dismiss?.();});
  const guestManual=await guest.evaluate(()=>{const R=window.__HAPIL_REMOTE_RC222_RUNTIME__;return{selected:R?.setAutoMode?.('manual'),status:R?.status?.()??null};});
  assert.equal(guestManual.selected,'manual','remote guest selects manual mode before held-input movement evidence');
  assert.equal(guestManual.status?.autoMode,'manual','remote runtime confirms manual mode instead of semi/auto combat');
  await host.waitForFunction(()=>window.__HAPIL_REMOTE_RC222_RUNTIME__?.telemetry?.().actorSteps?.p2?.mode==='manual',null,{timeout:12000});
  report.guestMovementMode={selected:guestManual.selected,status:guestManual.status,hostActorMode:'manual'};
  return roomCode;
}
async function enterDist01(host,guest){
  const setup=await host.evaluate(()=>{
    const C=window.__HAPIL_CONTROLS_V31329__,P=window.__HAPIL_PARTY_V31322__,N=window.__HAPIL_RC133_NATIVE__,s=P.state??C.binding.state.current;
    if(C.binding.phase!=='game'||!s||s.hp<=0)throw Error('native active campaign state missing before dist01 entry');
    window.__HAPIL_STORY_RC51__?.suppressEntry?.(s);
    const nativeEntry=N.enter(s,'dist01',false);s.zone='dist01';
    window.__HAPIL_STORY_RC51__?.close?.(false);window.__HAPIL_STORY_RC51__?.beforeFrame?.(s,{blocked:false,clear:false,sound:false});window.__HAPIL_STORY_RC51__?.close?.(false);
    C.binding.actions.dismiss();C.binding.modal.current=null;C.setMode('manual');
    s.paused=false;s.pause=false;s.timeStopUntil=0;s.encounterDialogue31226=null;s.encounterLockUntil31226=0;s.encounterWallUnlockAtV31227=0;
    for(const q of ['pendingHits','hostileProjectiles','impactQueue','telekineticCasts','spatialRiftCasts','narrativeCasts'])if(Array.isArray(s[q]))s[q]=[];
    for(const a of s.enemies||[]){a.readyAt=s.time+120;a.patternReadyAt=s.time+120;a.themedOrdnanceAt=s.time+120;a.themedSummonAt=s.time+120;a.movingUntil=s.time+120;a.moveDx=a.moveDy=a.moveVx=a.moveVy=0;}
    return{nativeEntry,zone:s.zone,time:s.time,hp:s.hp,maxHp:s.maxHp,hostiles:s.enemies.filter(a=>a.hp>0).length,entry:{x:s.x,y:s.y},runtime:window.__HAPIL_REMOTE_RC222_RUNTIME__.status()};
  });
  await host.evaluate(zone=>window.__HAPIL_REMOTE_RC222__.publishTransition(zone),'dist01');
  for(const page of [host,guest])await page.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,C=window.__HAPIL_CONTROLS_V31329__;return P?.state?.zone==='dist01'&&C?.binding?.phase==='game'&&!window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.().paused;},null,{timeout:20000});
  await Promise.all([host,guest].map(page=>page.waitForFunction(()=>window.__HAPIL_LEFT_ZONE_NATIVE_RC223__?.snapshot?.().zone==='dist01',null,{timeout:10000})));
  return setup;
}
async function stageActor(page,slot,point){
  return page.evaluate(({slot,point})=>{
    const P=window.__HAPIL_PARTY_V31322__,C=window.__HAPIL_CONTROLS_V31329__,s=P.state,actor=slot==='host'?s:P.actors.find(a=>a.slotId===slot);
    if(!actor)throw Error('requested live actor not in current native party: '+slot);
    actor.x=point.x;actor.y=point.y;actor.target=null;actor.targetEnemyId=null;actor.path=[];actor.moveDx=actor.moveDy=actor.moveVx=actor.moveVy=0;
    actor.heroMotion={kind:'idle',started:s.time,until:s.time,dx:0,dy:0,facing:actor.facing??1};
    actor.dashingUntil=s.time;actor.attackAt=s.time;actor.attackStarted=s.time;actor.attackImpactAt=s.time;actor.recoverUntil=s.time;actor.hitUntil=s.time;actor.staggerUntil=s.time;actor.slowUntil=s.time;
    actor.heroRoleNavPath31222=[];actor.heroRoleSteeringActive31222=false;
    if(actor!==s){actor.invulnerableUntil=Math.min(Number(actor.invulnerableUntil)||0,s.time);actor.lastDodgeAt=-99;}
    else {s.target=null;s.targetEnemyId=null;s.path=[];}
    C.setMode('manual');return{x:actor.x,y:actor.y,time:s.time,hp:actor.hp,maxHp:actor.maxHp,invulnerableUntil:actor.invulnerableUntil,fixture:{heroMotion:actor.heroMotion,moveVx:actor.moveVx,moveVy:actor.moveVy,combatMode:actor.rc222CombatMode??actor.combatModeV31329??null}};
  },{slot,point});
}
async function actorEvidence(page,slot){
  return page.evaluate(slot=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,s=P.state,a=slot==='host'?s:P.actors.find(q=>q.slotId===slot),telemetry=R?.telemetry?.();return{slot,zone:s.zone,time:s.time,actor:a&&{id:a.slotId??'host',x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp,invulnerableUntil:a.invulnerableUntil,moveVx:a.moveVx,moveVy:a.moveVy,moveDx:a.moveDx,moveDy:a.moveDy,heroMotion:a.heroMotion&&{kind:a.heroMotion.kind,started:a.heroMotion.started,until:a.heroMotion.until,dx:a.heroMotion.dx,dy:a.heroMotion.dy},combatMode:a.rc222CombatMode??a.combatModeV31329??null},inspection:a?L.inspect(s,a):null,metrics:L.metrics(),hostRuntimeAutoMode:R?.status?.().autoMode??null,actorFrame:telemetry?.actorSteps?.[slot]??null,inputReceipt:telemetry?.inputBySlot?.[slot]??null,warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null};},slot);
}
async function remoteMove(guest,host,key,slot,windowSeconds=.6){
  const before=await actorEvidence(host,slot);assert(before.actor,'remote actor exists before keyboard input');
  const guestModeBefore=await guest.evaluate(()=>window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.().autoMode??null);
  assert.equal(guestModeBefore,'manual','remote movement guest runtime starts in manual mode');
  assert.equal(before.actorFrame?.mode,'manual','host native RC222 actor frame has entered manual mode');
  assert(Math.hypot(before.actor.moveVx,before.actor.moveVy)<1e-9,'staged actor has no residual native velocity before held input');
  assert(['idle','move'].includes(before.actor.heroMotion?.kind),'held-input comparison begins from an idle/move pose, not a skill or dash');
  const samplePromise=host.evaluate(({slot,windowSeconds})=>new Promise((resolve,reject)=>{
    const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,startedAt=performance.now(),deadline=startedAt+25000;
    const s=P.state;let actor=P.actors.find(q=>q.slotId===slot),previous=actor&&{x:actor.x,y:actor.y,time:s.time},start=null;
    const frame=()=>{
      const world=P.state,live=P.actors.find(q=>q.slotId===slot),at=performance.now();
      if(!live||world!==s){reject(Error('native remote movement world/actor changed during held-input sample'));return;}
      const current={x:live.x,y:live.y,time:world.time};
      if(!start&&previous&&current.time>previous.time&&Math.hypot(current.x-previous.x,current.y-previous.y)>.0001)start={...previous};
      if(start&&current.time-start.time>=windowSeconds){
        const telemetry=R.telemetry(),step=telemetry.actorSteps?.[slot],hostRuntimeAutoMode=R.status().autoMode;
        resolve({start,end:{...current,actor:{x:live.x,y:live.y,moveVx:live.moveVx,moveVy:live.moveVy,moveDx:live.moveDx,moveDy:live.moveDy,heroMotion:live.heroMotion&&{kind:live.heroMotion.kind,until:live.heroMotion.until},combatMode:live.rc222CombatMode??live.combatModeV31329??null},inspection:L.inspect(world,live),metrics:L.metrics(),actorFrame:step??null,hostRuntimeAutoMode},simSeconds:current.time-start.time,windowSeconds,mode:step?.mode??null,seq:step?.seq??null,dt:step?.dt??null,rawHeroDelta:step?.rawHeroDelta??null,method:'host samples canonical actor positions on RAF after the first real relayed movement delta; guest key remains held for a fixed native simulation-time window'});return;
      }
      if(at>deadline){reject(Error('native remote held-input movement window timed out'));return;}
      previous=current;requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }),{slot,windowSeconds});
  samplePromise.catch(()=>{});
  let sample,input;
  await guest.keyboard.down(key);
  try{
    const inputHandle=await guest.waitForFunction(()=>{const q=window.__HAPIL_REMOTE_RC222_RUNTIME__?.readInput?.();return q&&(Math.abs(q.moveX)+Math.abs(q.moveY))>0&&q.combatMode==='manual'?q:false;},null,{timeout:8000});
    input=await inputHandle.jsonValue();await inputHandle.dispose();
    assert.equal(input.combatMode,'manual','actual guest keyboard input is emitted in manual mode');
    const expectedInput=key==='ArrowUp'?{moveX:0,moveY:-1}:key==='ArrowDown'?{moveX:0,moveY:1}:key==='ArrowLeft'?{moveX:-1,moveY:0}:{moveX:1,moveY:0};
    assert.equal(input.moveX,expectedInput.moveX,'guest keyboard emits the requested horizontal direction');
    assert.equal(input.moveY,expectedInput.moveY,'guest keyboard emits the requested vertical direction');
    sample=await samplePromise;
  }finally{await guest.keyboard.up(key);}
  const afterRelease=await actorEvidence(host,slot),distance=Math.hypot(sample.end.x-sample.start.x,sample.end.y-sample.start.y);
  const guestModeAfter=await guest.evaluate(()=>window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.().autoMode??null);
  assert.equal(guestModeAfter,'manual','remote movement guest runtime remains in manual mode after the held input');
  assert(sample.simSeconds>=windowSeconds&&sample.simSeconds<windowSeconds+.12,'native held-input sample ends within three capped simulation frames of the fixed '+windowSeconds+' second window');
  assert.equal(sample.mode,'manual','host native RC222 actor frame keeps the same manual combat mode through the measured window');
  assert.equal(sample.end.inspection.exposed,before.inspection.exposed,'exposure classification remains fixed for the complete movement window');
  assert(distance>.05,'real guest keyboard input changes canonical host world coordinates during the sample');
  return{key,before,after:sample.end,afterRelease,worldDistance:distance,simSeconds:sample.simSeconds,requestedSimWindow:windowSeconds,worldSpeedPerSimSecond:distance/sample.simSeconds,guestModeBefore,guestModeAfter,actualInput:{mode:input.combatMode,moveX:input.moveX,moveY:input.moveY,seq:input.seq},nativeActorFrame:{mode:sample.mode,seq:sample.seq,dt:sample.dt,rawHeroDelta:sample.rawHeroDelta,hostRuntimeAutoMode:sample.end.hostRuntimeAutoMode},method:sample.method};
}

(async()=>{
  let failure=null;
  try{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
    await verifyHttpSourceBytes();
    const serverModule=await import(pathToFileURL(path.join(appRoot,'server/src/relay.js')).href);
    relay=await serverModule.start({port:0,host:'127.0.0.1',allowedOrigins:[new URL(base).origin]});
    report.relayURL='ws://127.0.0.1:'+relay.server.address().port+'/relay';
    const health=await fetch('http://127.0.0.1:'+relay.server.address().port+'/healthz');report.relayHealth={status:health.status,body:await health.json()};assert.equal(health.status,200);assert.equal(report.relayHealth.body.ok,true);report.environment.actualWebSocketRelay=true;
    browser=await chromium.launch({chromiumSandbox:true,channel:'chrome',headless:true,args:[]});report.environment.officialChrome=true;report.browserVersion=browser.version();
    const host=await makePage('host'),guest=await makePage('guest');report.environment.isolatedContexts=2;
    report.roomCode=await readyPages(host,guest,'');
    const nativeEntry=await enterDist01(host,guest);report.nativeEntry=nativeEntry;
    await capture('dist01-native-entry',host);await capture('dist01-native-entry-guest',guest);

    await check('physical-floor-union-and-old-area',host,async()=>{
      const geometry=await host.evaluate(()=>{
        const C=window.__HAPIL_CONTROLS_V31329__,P=window.__HAPIL_PARTY_V31322__,s=P.state,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,actor=s,opened={x:15,y:14},old={x:22,y:24},outside={x:.5,y:14},center={x:19,y:15},side=R.side(s,true);
        const baselineMultiplier=window.__MONGSE_HERO_RANGED_QA_V31213__?.outgoingMultiplier?.(s.activeHeroId,false),blink=(zone,p,s)=>L.blinkWalkable(s,p);
        return{zone:s.zone,side,policy:L.policy,opened:{point:opened,physicalAll:R.contains(opened,'all',.8),previousSide:R.contains(opened,side,.8),allowed:L.allowed(s,actor,opened,.8),canMove:L.canMove(s,actor,opened,.8),inRegion:L.inRegion(s,actor,opened),blinkWalkable:blink?.(s.zone,opened,s)},old:{point:old,physicalAll:R.contains(old,'all',.8),previousSide:R.contains(old,side,.8),allowed:L.allowed(s,actor,old,.8),inRegion:L.inRegion(s,actor,old)},outside:{point:outside,physicalAll:R.contains(outside,'all',.8),allowed:L.allowed(s,actor,outside,.8),blinkWalkable:blink?.(s.zone,outside,s)},center:{point:center,previousSide:R.contains(center,side,.8),allowed:L.allowed(s,actor,center,.8),inRegion:L.inRegion(s,actor,center)},baselineMultiplier,actualHooks:L.hooks};
      });
      assert.equal(geometry.zone,'dist01');assert.equal(geometry.opened.physicalAll,true);assert.equal(geometry.opened.previousSide,false);assert.equal(geometry.opened.allowed,true);assert.equal(geometry.opened.canMove,true);assert.equal(geometry.opened.inRegion,true);
      assert.equal(geometry.opened.blinkWalkable,true,'native blink admission accepts the added physical floor on host');
      assert.equal(geometry.old.previousSide,true);assert.equal(geometry.old.allowed,true);assert.equal(geometry.old.inRegion,false,'previously admitted floor remains outside the penalty region');
      assert.equal(geometry.outside.physicalAll,false);assert.equal(geometry.outside.allowed,false,'left-half union does not admit positions off the native physical floor');
      assert.equal(geometry.outside.blinkWalkable,false,'native blink admission cannot escape the physical platform');
      assert.equal(geometry.center.inRegion,false,'exact x=19 centerline is excluded from the x<19 region');assert.equal(geometry.center.allowed,false,'centerline cannot pass the left-floor admission union');
      assert.equal(typeof geometry.baselineMultiplier,'number','native outgoing multiplier function is exposed by the unchanged application');
      assert.deepEqual(geometry.actualHooks,{movement:'ft -> HAPIL_BATTLE_ARENA_RC138.movement',blink:'HAPIL_blinkWalkableRC85',outgoing:'MONGSE_heroOutgoingModeMultiplier31213',hostFrame:'HAPIL_CONTROLS_V31329.frameStart',localFrame:'HAPIL_PARTY_V31322.tick',remoteFrame:'RC222_NATIVE.actorFrame',hostIncoming:'NATIVE_ARENA_RC138.bodyDamage -> Y',localIncoming:'HAPIL_PARTY_V31322.debug.allyDamage',remoteIncoming:'REMOTE_RC222_RUNTIME.incomingActor'});
      return geometry;
    });

    await check('host-authoritative-coop-entry-and-movement',host,async()=>{
      const safe=await stageActor(host,'p2',{x:22,y:24});
      const guestView=await guest.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__;return{role:window.__HAPIL_REMOTE_RC222_RUNTIME__.status().role,actor:a&&{x:a.x,y:a.y,hp:a.hp},inRegion:L.inRegion(s,a,{x:15,y:14}),exposed:L.exposed(s,a,{x:15,y:14}),snapshot:L.inspect(s,a)};});
      assert.equal(guestView.role,'guest');assert.equal(guestView.inRegion,true,'guest reads the same physical extension geometry');assert.equal(guestView.exposed,false,'guest cannot create host-authoritative exposure or damage');
      const safeSnapshot=await actorEvidence(host,'p2');assert.equal(safeSnapshot.inspection.owner,'host');assert.equal(safeSnapshot.inspection.exposed,false);assert.equal(safeSnapshot.inspection.outgoingMultiplier,1);assert.equal(safeSnapshot.inspection.movementMultiplier,1);
      const safeMultiplier=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,hero=a.heroId;return{actual:R.withActor(s,a,()=>L.outgoingMultiplier(hero,false)),base:window.__MONGSE_HERO_RANGED_QA_V31213__?.outgoingMultiplier?.(hero,false)};});
      assert.equal(safeMultiplier.actual,safeMultiplier.base,'previously admitted area keeps the original native outgoing multiplier');
      // Compare mirrored floor poses and mirrored input directions so both
      // samples stay the same distance from the floor boundary throughout.
      const baselineMove=progress('baselineMove',await remoteMove(guest,host,'ArrowDown','p2'));
      const movedTo=await stageActor(host,'p2',{x:15,y:14});
      const before=await actorEvidence(host,'p2');assert.equal(before.inspection.inRegion,true);assert.equal(before.inspection.exposed,true);assert.equal(before.inspection.owner,'host');
      const proxyEvidence=await host.evaluate(()=>{
        const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,A=window.__HAPIL_BATTLE_ARENA_RC138__;
        return R.withActor(s,a,view=>({
          distinctView:view!==s,
          canonicalWorld:R.canonicalWorld(view)===s,
          canonicalActor:R.actorFor(view)===a,
          slot:view.rc222ActorSlot,
          region:L.regionAt(view,view,{x:15,y:14}),
          allowed:L.allowed(view,view,{x:15,y:14},.8),
          canMove:L.canMove(view,view,{x:15,y:14},.8),
          exposed:L.exposed(view,view,{x:15,y:14}),
          snapshot:L.inspect(s,view),
          factor:L.factors(s,view),
          movementStart:{x:view.x,y:view.y},
          nativeMovement:A.movement(view,view,{x:view.x+.6,y:view.y},.8)
        }));
      });
      assert.equal(proxyEvidence.distinctView,true,'co-op native actor frame supplies an actual RC222 state proxy');
      assert.equal(proxyEvidence.canonicalWorld,true);assert.equal(proxyEvidence.canonicalActor,true);
      assert.equal(proxyEvidence.slot,'p2');
      assert.equal(proxyEvidence.region,true,'RC223 maps the RC222 view proxy back to the live actor for new-floor geometry');
      assert.equal(proxyEvidence.allowed,true,'RC222 state proxy keeps the union of native and newly admitted floor');
      assert.equal(proxyEvidence.canMove,true,'host-authoritative input may move a proxied remote actor on the added floor');
      assert.equal(proxyEvidence.exposed,true,'proxied actor receives the host exposure policy');
      assert.equal(proxyEvidence.snapshot.actorId,'p2');assert.equal(proxyEvidence.snapshot.exposed,true);assert.equal(proxyEvidence.snapshot.owner,'host');
      assert.deepEqual(proxyEvidence.factor,{active:true,exposed:true,outgoing:.9,movement:.9,status:'left-zone'},'proxied actor resolves the same active factors as its canonical actor');
      const proxyMovementRatio=(proxyEvidence.nativeMovement.x-proxyEvidence.movementStart.x)/.6;
      assert(Math.abs(proxyMovementRatio-.9)<1e-9,'native RC138 movement applies the exact 0.9 factor when state and actor are RC222 proxies');
      const mobileFactor=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,a=P.actors.find(q=>q.slotId==='p2');return{factors:L.factors(s,a),outgoing:R.withActor(s,a,()=>L.outgoingMultiplier(a.heroId,false)),base:window.__MONGSE_HERO_RANGED_QA_V31213__?.outgoingMultiplier?.(a.heroId,false)};});
      assert.deepEqual(mobileFactor.factors,{active:true,exposed:true,outgoing:.9,movement:.9,status:'left-zone'});
      assert(Math.abs(mobileFactor.outgoing/mobileFactor.base-.9)<1e-9,'actual native outgoing multiplier wrapper applies exactly 0.9 in exposed region');
      const exposedMove=progress('exposedMove',await remoteMove(guest,host,'ArrowUp','p2'));
      assert(Math.abs(exposedMove.simSeconds-baselineMove.simSeconds)<.08,'baseline and exposed remote movement use the same native simulation-time window');
      const movementRatio=exposedMove.worldSpeedPerSimSecond/baselineMove.worldSpeedPerSimSecond;
      progress('nativeRemoteMovementRatio',{baselineMove,exposedMove,movementRatio,expectedFactor:mobileFactor.factors.movement,assertion:'abs(ratio - 0.9) < 0.22'});
      console.log('RC223_LEFT_REMOTE_MOVEMENT '+JSON.stringify({baselineMove,exposedMove,movementRatio,expectedFactor:mobileFactor.factors.movement}));
      assert(Math.abs(movementRatio-.9)<.22,'actual native remote world movement speed applies the 0.9 factor');
      const hostAfter=await actorEvidence(host,'p2'),guestAfter=await guest.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__;return{actor:{x:a.x,y:a.y,hp:a.hp},inspection:L.inspect(s,a),inRegion:L.inRegion(s,a),exposed:L.exposed(s,a),metrics:L.metrics()};});
      assert(guestAfter.inRegion);assert.equal(guestAfter.exposed,false,'replicated guest only renders geometry and never owns the hazard tick');assert.equal(hostAfter.inspection.owner,'host');
      await capture('left-zone-coop-exposed',host);await capture('left-zone-coop-guest-readonly',guest);
      return{safe,safeSnapshot,safeMultiplier,guestView,baselineMove,movedTo,before,proxyEvidence,proxyMovementRatio,mobileFactor,exposedMove,hostAfter,guestAfter,scope:'actual local two-context relay; positions staged to old and added floor, remote actor move is real network input'};
    });

    await check('remote-exposure-dot-once-and-exit-reset',host,async()=>{
      // The previous case already held movement and captured two screenshots
      // while this actor was exposed, but the last real movement frame may
      // already have exited and cleared its clock. Read metrics/geometric
      // state before inspect(), which is intentionally not used to infer
      // whether native cleanup has happened.
      const prior=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),point={x:a.x,y:a.y},metrics=L.metrics();return{zone:s.zone,time:s.time,actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp},oldFloor:R.contains(point,R.side(s,true),.8),inRegion:L.regionAt(s,a,point),exposed:L.exposed(s,a,point),metrics};});
      const priorClockCount=prior.metrics.entries-prior.metrics.exits;
      assert(priorClockCount===0||priorClockCount===1,'remote DOT fixture has at most one live remote exposure clock before safe staging: '+JSON.stringify(prior));
      const priorClockActive=priorClockCount===1,baseMetrics=prior.metrics;
      progress('remote-dot-prior-clock-before-inspect',{prior,priorClockActive,interpretation:priorClockActive?'native exit is still required before the fresh sample':'previous native frames already cleared exposure; balanced counters are the cleanup evidence'});
      const safeStage=await stageActor(host,'p2',{x:22,y:24});
      progress('remote-dot-safe-stage-request',{safeStage,priorClockActive});
      let safeHandle,safeAfterNative;
      try{
        safeHandle=await host.waitForFunction(({baseMetrics,priorClockActive})=>{const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');if(!a||s.zone!=='dist01'||a.hp<=0)return false;const point={x:a.x,y:a.y},metrics=L.metrics(),oldFloor=R.contains(point,R.side(s,true),.8),inRegion=L.regionAt(s,a,point),cleanupObserved=priorClockActive?metrics.exits>baseMetrics.exits:metrics.entries===baseMetrics.entries&&metrics.exits===baseMetrics.exits;if(!oldFloor||inRegion||!cleanupObserved)return false;return{zone:s.zone,time:s.time,actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp},oldFloor,inRegion,exposed:L.exposed(s,a,point),metrics,priorClockActive};},{baseMetrics,priorClockActive},{timeout:10000});
        safeAfterNative=await safeHandle.jsonValue();await safeHandle.dispose();
      }catch(error){
        const diagnostic=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),point={x:a.x,y:a.y};return{zone:s.zone,time:s.time,actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp},oldFloor:R.contains(point,R.side(s,true),.8),inRegion:L.regionAt(s,a,point),exposed:L.exposed(s,a,point),metrics:L.metrics()};}).catch(e=>({diagnosticError:String(e)}));
        progress('remote-dot-safe-stage-timeout',{prior,priorClockActive,safeStage,diagnostic});throw error;
      }
      progress('remote-dot-safe-stage-native-cleanup',{prior,priorClockActive,safeStage,safeAfterNative});
      assert.equal(safeAfterNative.oldFloor,true,'canonical remote actor is on previously admitted floor after native frame');assert.equal(safeAfterNative.inRegion,false,'canonical safe staging point is outside the new exposure region');
      if(priorClockActive){assert.equal(safeAfterNative.metrics.entries,baseMetrics.entries,'safe staging does not create another exposure clock');assert.equal(safeAfterNative.metrics.exits,baseMetrics.exits+1,'native host actorFrame clears the earlier remote exposure clock before a new DOT sample');}
      else{assert.equal(safeAfterNative.metrics.entries,baseMetrics.entries,'balanced prior counters show no clock to clear');assert.equal(safeAfterNative.metrics.exits,baseMetrics.exits,'no artificial exit is required when prior native frames already cleaned up');}
      const cleared=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),point={x:a.x,y:a.y},metricsBeforeInspect=L.metrics(),geometry={oldFloor:R.contains(point,R.side(s,true),.8),inRegion:L.regionAt(s,a,point),exposed:L.exposed(s,a,point)},inspection=L.inspect(s,a),metrics=L.metrics();return{actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp},geometry,inspection,metricsBeforeInspect,metrics};});
      assert.equal(cleared.geometry.oldFloor,true);assert.equal(cleared.geometry.inRegion,false);assert.equal(cleared.geometry.exposed,false);assert.deepEqual(cleared.metrics,cleared.metricsBeforeInspect,'diagnostic inspect observes cleanup without creating the exit evidence');assert.equal(cleared.inspection.exposed,false);assert.equal(cleared.inspection.elapsedSeconds,0);assert.equal(cleared.inspection.ticks,0);
      assert.equal(cleared.metrics.entries,baseMetrics.entries);assert.equal(cleared.metrics.exits,baseMetrics.exits+(priorClockActive?1:0),'only a clock active at the start requires a new native exit event');
      const entryMetrics=cleared.metrics,reentry=await stageActor(host,'p2',{x:15,y:14});
      const entryHandle=await host.waitForFunction(baseEntries=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),metrics=L.metrics();if(!a||metrics.entries<=baseEntries)return false;return{actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp},inspection:L.inspect(s,a),metrics,time:s.time};},entryMetrics.entries,{timeout:10000});
      const before=await entryHandle.jsonValue();await entryHandle.dispose();
      assert.equal(before.inspection.exposed,true);assert.equal(before.inspection.ticks,0);assert.equal(before.inspection.appliedTicks,0);assert(before.inspection.elapsedSeconds>0&&before.inspection.elapsedSeconds<.5,'remote DOT baseline captures the first native exposure frame, before its grace period can expire');
      const metricsBefore=before.metrics;
      const firstHandle=await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),v=L.inspect(s,a);if(v.appliedTicks<1)return false;return{actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp},inspection:v,metrics:L.metrics(),time:s.time};},null,{timeout:50000});
      const firstTick=await firstHandle.jsonValue();await firstHandle.dispose();
      assert.equal(firstTick.inspection.appliedTicks,1);assert.equal(firstTick.inspection.ticks,1);assert.equal(firstTick.inspection.lastRawDamage,before.actor.maxHp*.005,'first remote tick uses exactly 0.5% max HP raw');
      const secondHandle=await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),v=L.inspect(s,a);if(v.appliedTicks<2)return false;return{actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp},inspection:v,metrics:L.metrics(),time:s.time};},null,{timeout:30000});
      const after=await secondHandle.jsonValue();await secondHandle.dispose();
      const afterGuest=await guest.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__;return{actor:{hp:a.hp,maxHp:a.maxHp,x:a.x,y:a.y},view:L.inspect(s,a),inRegion:L.inRegion(s,a),exposed:L.exposed(s,a),metrics:L.metrics()};});
      assert.equal(after.inspection.owner,'host');assert.equal(after.inspection.appliedTicks,2,'two remote ticks committed by its host owner');assert.equal(after.inspection.ticks,2,'actual native DOT repeats once per second after the first tick');
      assert.equal(after.inspection.lastRawDamage,after.actor.maxHp*.005,'raw DOT uses exactly 0.5% of actor max HP');
      assert(after.actor.hp<before.actor.hp,'remote actor loses HP through the native incoming reducer');
      assert.equal(after.metrics.damageApplied-metricsBefore.damageApplied,2,'host applies exactly two owner-scoped damage events, without guest duplicates');
      assert.equal(afterGuest.exposed,false);assert(afterGuest.inRegion);assert.equal(afterGuest.view.ticks,0);assert.equal(afterGuest.metrics.damageApplied,0,'guest replica does not apply an independent DOT');
      const remoteExitStart=await stageActor(host,'p2',{x:15,y:14});
      await guest.keyboard.down('ArrowLeft');
      try{await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return a&&R.contains({x:a.x,y:a.y},R.side(s,true),.8)&&!L.exposed(s,a);},null,{timeout:15000});}
      finally{await guest.keyboard.up('ArrowLeft');}
      const exited=await actorEvidence(host,'p2');
      assert.equal(exited.inspection.exposed,false,'real directional movement exits the exposed set into previously allowed floor');
      assert.equal(exited.inspection.ticks,0,'exit clears the prior damage clock');assert(exited.metrics.exits>after.metrics.exits,'native exit path records clock cleanup');
      await capture('left-zone-coop-exit',host);
      return{prior,priorClockActive,safeStage,safeAfterNative,cleared,reentry,before,firstTick,after,afterGuest,remoteExitStart,exited,metricsDelta:{entries:after.metrics.entries-metricsBefore.entries,damageApplied:after.metrics.damageApplied-metricsBefore.damageApplied,exits:exited.metrics.exits-after.metrics.exits},method:'host RC222 actorFrame owns the 2s and 3s remote DOT events; guest reads geometry only; a prior active clock requires a native safe-side exit, while an already-clean prior frame requires balanced counters and canonical old-floor location; real ArrowLeft input exits into old admitted half'};
    });

    await check('host-frame-pause-incoming-and-reset',host,async()=>{
      const safe=await stageActor(host,'host',{x:22,y:24});
      const oldMultiplier=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__;return{actual:L.outgoingMultiplier(s.activeHeroId,false),base:window.__MONGSE_HERO_RANGED_QA_V31213__?.outgoingMultiplier?.(s.activeHeroId,false)};});
      assert.equal(oldMultiplier.actual,oldMultiplier.base,'host outgoing wrapper equals the original native value in the old admitted area');
      const entryMetrics=await host.evaluate(()=>window.__HAPIL_LEFT_ZONE_NATIVE_RC223__.metrics());
      await stageActor(host,'host',{x:15,y:14});
      const entryHandle=await host.waitForFunction(baseEntries=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,v=L.inspect(s,s),metrics=L.metrics();if(metrics.entries<=baseEntries)return false;return{inspection:v,metrics,time:s.time,hp:s.hp,warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null};},entryMetrics.entries,{timeout:10000});
      const entered=await entryHandle.jsonValue();await entryHandle.dispose();
      assert.equal(entered.inspection.exposed,true);assert.equal(entered.inspection.owner,'host');assert.equal(entered.inspection.ticks,0);assert(entered.inspection.elapsedSeconds>0&&entered.inspection.elapsedSeconds<.5,'host pause sample starts from the first live exposure frame');
      await host.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.actions.settings());
      await host.waitForFunction(()=>window.__HAPIL_PARTY_V31322__.status.paused===true,null,{timeout:6000});
      await host.waitForFunction(()=>document.querySelector('#hapil-left-zone-warning-rc223')?.textContent==='위험 지대 · 체력·공격·이동 감소',null,{timeout:8000});
      entered.warning=await host.locator('#hapil-left-zone-warning-rc223').innerText();
      const pausedBefore=await actorEvidence(host,'host');assert(pausedBefore.inspection.elapsedSeconds>0&&pausedBefore.inspection.elapsedSeconds<2,'actual settings pause begins before the first one-second-grace-plus-interval DOT');assert.equal(pausedBefore.inspection.ticks,0);
      await host.waitForTimeout(500);const pausedAfter=await actorEvidence(host,'host');
      assert.equal(pausedAfter.time,pausedBefore.time,'native modal pause freezes the simulation clock');assert.equal(pausedAfter.inspection.elapsedSeconds,pausedBefore.inspection.elapsedSeconds,'native modal pause preserves exposure clock');assert.equal(pausedAfter.inspection.ticks,pausedBefore.inspection.ticks);assert.equal(pausedAfter.actor.hp,pausedBefore.actor.hp);
      await capture('left-zone-paused',host);await host.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.actions.dismiss());
      await host.waitForFunction(()=>window.__HAPIL_PARTY_V31322__.status.paused!==true&&!window.__HAPIL_REMOTE_RC222_RUNTIME__.status().paused,null,{timeout:8000});
      const firstHandle=await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,v=L.inspect(s,s);if(v.appliedTicks<1)return false;return{actor:{x:s.x,y:s.y,hp:s.hp,maxHp:s.maxHp},inspection:v,metrics:L.metrics(),time:s.time};},null,{timeout:50000});
      const afterTick=await firstHandle.jsonValue();await firstHandle.dispose();
      const newMultiplier=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__;return L.outgoingMultiplier(s.activeHeroId,false);});
      assert.equal(afterTick.inspection.owner,'host');assert.equal(afterTick.inspection.ticks,1);assert.equal(afterTick.inspection.appliedTicks,1);
      assert.equal(afterTick.inspection.lastRawDamage,afterTick.actor.maxHp*.005,'host native frame sends the exact raw DOT into native incoming');
      assert(afterTick.actor.hp<pausedAfter.actor.hp,'host loses HP through NATIVE_ARENA_RC138.bodyDamage -> Y');
      assert(Math.abs(newMultiplier/oldMultiplier.base-.9)<1e-9,'native outgoing wrapper is 0.9 in the exposed region and returns to base after exit');
      await capture('left-zone-host-dot',host);
      const exitStart=await stageActor(host,'host',{x:15,y:14});
      await host.keyboard.down('ArrowLeft');
      try{await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state;return R.contains({x:s.x,y:s.y},R.side(s,true),.8)&&!L.exposed(s,s);},null,{timeout:15000});}
      finally{await host.keyboard.up('ArrowLeft');}
      const exited=await actorEvidence(host,'host');assert.equal(exited.inspection.ticks,0);assert.equal(exited.inspection.exposed,false);assert.equal(exited.inspection.outgoingMultiplier,1);
      return{safe,entered,pausedBefore,pausedAfter,afterTick,exitStart,exited,oldMultiplier,newMultiplier,method:'host HAPIL_CONTROLS_V31329.frameStart, actual modal pause, native host incoming reducer, and real ArrowLeft exit'};
    });

    await check('staged-native-death-checkpoint-clears-all-clocks',host,async()=>{
      const staged=await stageActor(host,'host',{x:15,y:14});
      const actorStage=await stageActor(host,'p2',{x:15,y:14});
      await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return L.inspect(s,s).exposed&&L.inspect(s,a).exposed;},null,{timeout:8000});
      const active=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return{host:L.inspect(s,s),remote:L.inspect(s,a),metrics:L.metrics(),time:s.time,hostHp:s.hp,remoteHp:a.hp};});
      assert(active.host.exposed&&active.remote.exposed,'both actual native frame paths own an active exposure before the lethal fixture');
      const lethal=await host.evaluate(()=>{
        const P=window.__HAPIL_PARTY_V31322__,C=window.__HAPIL_CONTROLS_V31329__,s=P.state,N=window.__HAPIL_NATIVE_ARENA_RC138__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,episode=window.__HAPIL_EPISODE1_RC59__,now=Date.now(),sourceId=s.enemies.find(e=>e.hp>0)?.id??'dist01-native-enemy',actors=P.actors.filter(a=>a.hp>0),expectedDestination=episode?.respawnDestination?.(s);
        // Distinct disclosed HP fixture: only the initial values are staged.
        // Death is caused by production incoming reducers, and respawn uses the
        // native checkpoint button below.
        s.hp=1;s.invulnerableUntil=s.time-1;s.awakeningUntil=0;s.guardianGraceReadyAt=s.time+120;
        for(const a of actors){a.hp=1;a.invulnerableUntil=s.time-1;a.awakeningUntil=0;}
        const hostSource={id:'rc223-left-host-lethal-fixture-'+now,sourceId,damage:100000,born:s.time,boss:true};
        const hostAccepted=N.bodyDamage(s,100000,s.x,s.y,hostSource),remoteResults=actors.map((a,index)=>{const source={id:'rc223-left-ally-lethal-fixture-'+index+'-'+now,sourceId,damage:100000,born:s.time,boss:true};const accepted=R.ownsActor?.(s,a)?R.incomingActor(s,a,100000,source):P.debug.allyDamage(s,a,100000,source);return{slotId:a.slotId,hp:a.hp,downUntil:a.downUntil,accepted,source};});
        return{hostAccepted,host:{hp:s.hp,downUntil:s.downUntil},remoteResults,actors:P.actors.map(a=>({slotId:a.slotId,hp:a.hp,downUntil:a.downUntil})),expectedDestination,sources:[hostSource,...remoteResults.map(x=>x.source)],scope:'HP=1 fixture followed by production host and remote incoming reducers for all party actors; checkpoint UI performs respawn'};
      });
      assert(lethal.host.hp<=0,'native host incoming reducer causes the staged lethal event');assert(lethal.remoteResults.some(a=>a.slotId==='p2'&&a.hp<=0),'native remote incoming reducer causes the staged lethal event');assert(lethal.actors.every(a=>a.hp<=0),'all party actors are down so the native checkpoint choice is the actual wipe flow');
      assert.equal(lethal.expectedDestination,'dist00','native Episode 1 death policy chooses its actual first-episode restart destination');
      await host.getByRole('button',{name:'체크포인트에서 부활',exact:true}).waitFor({state:'visible',timeout:15000});
      const waiting=await host.evaluate(()=>({party:window.__HAPIL_PARTY_V31322__.status,metrics:window.__HAPIL_LEFT_ZONE_NATIVE_RC223__.metrics(),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null}));
      await capture('left-zone-death-choice',host);
      await host.getByRole('button',{name:'체크포인트에서 부활',exact:true}).click();
      await host.waitForFunction(expected=>{const P=window.__HAPIL_PARTY_V31322__,C=window.__HAPIL_CONTROLS_V31329__,T=window.__HAPIL_REMOTE_RC222__?.status?.(),R=window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.();return P.state.zone===expected&&P.state.hp>0&&P.actors.find(a=>a.slotId==='p2')?.hp>0&&C?.binding?.phase==='game'&&T?.phase==='playing'&&R?.ready===true&&!T?.stale;},lethal.expectedDestination,{timeout:25000});
      await host.locator('#hapil-death-verse-rc59').waitFor({state:'visible',timeout:10000});
      const deathVerse=await host.evaluate(()=>{const dialog=document.querySelector('#hapil-death-verse-rc59'),paragraphs=[...(dialog?.querySelectorAll('p')??[])].map(p=>p.textContent);return{present:!!dialog,title:dialog?.querySelector('#hapil-death-verse-title-rc59')?.textContent,route:paragraphs.find(text=>text.includes('에피소드 1의 첫 전장')||text.includes('최근에 방문한 쉼터'))??null,button:[...(dialog?.querySelectorAll('button')??[])].find(b=>!b.dataset.deathAutoPauseRc121)?.textContent??null};});
      assert.equal(deathVerse.present,true);assert.equal(deathVerse.route,'에피소드 1의 첫 전장으로 되돌아갑니다.');assert.equal(deathVerse.button,'처음부터 다시','native death-verse dialog presents the Episode 1 restart button');
      await guest.waitForFunction(expected=>{const P=window.__HAPIL_PARTY_V31322__,C=window.__HAPIL_CONTROLS_V31329__,T=window.__HAPIL_REMOTE_RC222__?.status?.(),R=window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.();return P.state.zone===expected&&P.state.hp>0&&P.actors.find(a=>a.slotId==='p2')?.hp>0&&C?.binding?.phase==='game'&&T?.phase==='playing'&&R?.ready===true&&!T?.stale;},lethal.expectedDestination,{timeout:15000});
      const revived=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return{zone:s.zone,host:{x:s.x,y:s.y,hp:s.hp,inspection:L.inspect(s,s)},remote:{x:a.x,y:a.y,hp:a.hp,inspection:L.inspect(s,a)},metrics:L.metrics(),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null,party:P.status};});
      assert.equal(revived.zone,lethal.expectedDestination,'native checkpoint returns to the destination selected by the live Episode 1 death policy');assert(revived.host.hp>0&&revived.remote.hp>0);
      assert.equal(revived.host.inspection.elapsedSeconds,0);assert.equal(revived.host.inspection.ticks,0);assert.equal(revived.remote.inspection.elapsedSeconds,0);assert.equal(revived.remote.inspection.ticks,0);
      assert(revived.metrics.exits>=active.metrics.exits+2,'host and remote death/re-entry reset both native exposure clocks');
      assert.equal(revived.warning,null,'respawn removes the stale danger warning until a fresh exposed entry');
      await capture('left-zone-checkpoint-revived',host);await capture('left-zone-checkpoint-revived-guest',guest);
      await host.getByRole('button',{name:'처음부터 다시',exact:true}).click();
      await host.waitForFunction(()=>!document.querySelector('#hapil-death-verse-rc59'),null,{timeout:8000});
      await host.evaluate(()=>window.__HAPIL_STORY_RC51__?.close?.(false));
      return{staged,actorStage,active,lethal,waiting,deathVerse,revived,method:'real native Y and remote incoming reducers cause the down state; player selects native checkpoint; the live Episode 1 policy selects dist00 and its visible native death-verse restart button is explicitly acknowledged for scripted continuation'};
    });

    await check('native-title-phase-transition-clears-exposure',host,async()=>{
      const staged=await stageActor(host,'host',{x:15,y:14});
      await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,v=L.inspect(s,s);return v.exposed&&v.elapsedSeconds>0;},null,{timeout:8000});
      const before=await actorEvidence(host,'host');assert(before.inspection.elapsedSeconds>0,'actual host frame accumulates live exposure before phase exit');
      await host.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.actions.settings());
      const titleButton=host.locator('.return-title-button');await titleButton.waitFor({state:'visible',timeout:10000});
      host.once('dialog',dialog=>dialog.accept());await titleButton.click();
      await host.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='title',null,{timeout:15000});
      const after=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,C=window.__HAPIL_CONTROLS_V31329__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state;return{phase:C.binding.phase,inspection:L.inspect(s,s),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null};});
      assert.equal(after.phase,'title','native settings return-to-title action changes the real app phase');
      assert.equal(after.inspection.elapsedSeconds,0,'phase transition clears the previous live exposure clock');assert.equal(after.inspection.ticks,0);assert.equal(after.warning,null,'title phase removes the in-game danger badge');
      await capture('left-zone-native-title-transition',host);
      return{staged,before,after,method:'native settings return-to-title action plus production C.bind lifecycle cleanup'};
    });

    const localPage=await makePage('local-p2');report.environment.isolatedContexts=3;
    const localPreparation=await startLocalGame(localPage);report.localPreparation=localPreparation;
    await check('local-p2-party-frame-dot-strike-and-cleanup',localPage,async()=>{
      const setupPrefix=await localPage.evaluate(()=>{
        const C=window.__HAPIL_CONTROLS_V31329__,P=window.__HAPIL_PARTY_V31322__,N=window.__HAPIL_RC133_NATIVE__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state??C.binding.state.current;
        if(C.binding.phase!=='game'||!s||s.hp<=0)throw Error('fresh native campaign is not live before local P2 setup');
        const previousActor=P.actors.find(a=>a.slotId==='p2');if(!previousActor||previousActor.control!=='local')throw Error('native Party preparation did not create a local P2 actor before zone entry');
        window.__RC223_LOCAL_PRE_REBUILD_ACTOR__=previousActor;
        window.__RC223_LOCAL_PRE_REBUILD_TIME__=s.time;
        const story=window.__HAPIL_STORY_RC51__;
        story?.suppressEntry?.(s);const nativeEntry=N.enter(s,'dist01',false);s.zone='dist01';
        story?.close?.(false);
        const storyReaderOpened=story?.beforeFrame?.(s,{blocked:false,clear:false,sound:false})===true;
        const storyCue=story?.currentNarrative?.()??null;
        story?.close?.(false);C.binding.actions.dismiss();C.binding.modal.current=null;C.setMode('manual');
        const storyDismissal={staged:true,readerOpened:storyReaderOpened,cue:storyCue,readerOpenAfterClose:story?.isOpen?.()===true,readingBlockedAfterClose:window.__HAPIL_READING_V31342__?.blocked===true,partyPausedAfterClose:P.status.paused===true,partyUIOpenAfterClose:window.__HAPIL_PARTY_UI_V31322__?.isOpen?.()===true,modalOpenAfterClose:!!C.binding.modal.current,naturalCompletion:false,method:'native dist01 beforeFrame opened the RC51 pre-entry reader; fixture explicitly called close(false) to continue'};
        s.paused=false;s.pause=false;s.timeStopUntil=0;s.encounterDialogue31226=null;s.encounterLockUntil31226=0;s.encounterWallUnlockAtV31227=0;
        for(const q of ['pendingHits','hostileProjectiles','impactQueue','telekineticCasts','spatialRiftCasts','narrativeCasts'])if(Array.isArray(s[q]))s[q]=[];
        s.x=22;s.y=24;s.moveVx=s.moveVy=s.moveDx=s.moveDy=0;s.invulnerableUntil=s.time+120;
        const hostLastAttackBefore=s.lastAttack;s.lastAttack=s.time+120;
        return{nativeEntry,storyDismissal,zone:s.zone,phase:C.binding.phase,preRebuildTime:window.__RC223_LOCAL_PRE_REBUILD_TIME__,hostStage:{x:s.x,y:s.y,hp:s.hp,maxHp:s.maxHp},hostCooldown:{field:'state.lastAttack',before:hostLastAttackBefore,heldUntil:s.lastAttack},preRebuildActor:{slotId:previousActor.slotId,heroId:previousActor.heroId,control:previousActor.control,readyAt:previousActor.readyAt},party:P.status,roster:P.roster,runPolicy:window.__HAPIL_RUN_V31400__?.get?.(s),hooks:L.hooks};
      });
      const nativeRebuild=await localPage.evaluate(()=>new Promise((resolve,reject)=>{
        const C=window.__HAPIL_CONTROLS_V31329__,P=window.__HAPIL_PARTY_V31322__,previous=window.__RC223_LOCAL_PRE_REBUILD_ACTOR__,deadline=performance.now()+12000;
        const stageFresh=()=>{
          const s=P.state,actor=P.actors.find(a=>a.slotId==='p2');
          if(C.binding.phase!=='game'||s.zone!=='dist01'||!(s.time>window.__RC223_LOCAL_PRE_REBUILD_TIME__)||!actor||actor===previous||actor.control!=='local'||actor.heroId!=='gunner')return false;
          const nativeReadyAt=actor.readyAt,nativeQueue=P.exportSnapshot()?.party?.strikes??[],timeBefore=s.time;
          s.x=22;s.y=24;s.moveVx=s.moveVy=s.moveDx=s.moveDy=0;s.invulnerableUntil=s.time+120;
          actor.x=22;actor.y=24;actor.hp=actor.maxHp=s.maxHp;actor.invulnerableUntil=s.time;actor.moveVx=actor.moveVy=actor.moveDx=actor.moveDy=0;actor.target=null;actor.targetEnemyId=null;actor.path=[];actor.lastDodgeAt=-99;actor.skillReady=[s.time,s.time,s.time];actor.ultimateReady=s.time;
          // The first real native zone frame replaces PARTY actors via spawn().
          // Apply bounded cooldown holds to that live replacement in this same
          // browser task, after its spawn and any ordinary native input.
          const cooldownHoldUntil=s.time+120,hostLastAttackBefore=s.lastAttack;
          s.lastAttack=cooldownHoldUntil;actor.readyAt=cooldownHoldUntil;
          actor.heroMotion={kind:'idle',started:s.time,until:s.time,dx:0,dy:0,facing:1};
          window.__RC223_LOCAL_REBUILD_ACTOR__=actor;
          const cooldownIsolation={durationSimSeconds:120,host:{field:'state.lastAttack',before:hostLastAttackBefore,stagedAt:s.time,heldUntil:s.lastAttack},p2:{slotId:actor.slotId,field:'actor.readyAt',before:nativeReadyAt,stagedAt:s.time,heldUntil:actor.readyAt,nativeRebuildReadyAt:nativeReadyAt},policy:'bounded native cooldown fields applied to the actual replacement actor after its real zone spawn; no damage/policy/HP override'};
          return{actorReferenceChanged:actor!==previous,previousActor:{slotId:previous?.slotId,heroId:previous?.heroId,control:previous?.control},freshActor:{slotId:actor.slotId,heroId:actor.heroId,control:actor.control,readyAtBeforeHold:nativeReadyAt,x:actor.x,y:actor.y},nativeQueuedStrikes:nativeQueue.map(h=>({slotId:h.slotId,targetId:h.targetId,key:h.key,at:h.at,zone:h.zone})),nativeActorRebuild:{zone:s.zone,timeBefore,timeAfter:s.time,timeAdvancedFromFixtureStart:s.time>window.__RC223_LOCAL_PRE_REBUILD_TIME__,partyMode:P.status.mode},cooldownIsolation};
        };
        const check=()=>{
          try{
            const evidence=stageFresh();if(evidence){resolve(evidence);return;}
            if(performance.now()>deadline){reject(Error('timed out waiting for the actual native dist01 PARTY actor rebuild; '+JSON.stringify({zone:P.state?.zone,phase:C.binding.phase,priorActor:previous&&{slotId:previous.slotId,heroId:previous.heroId},currentActor:P.actors.find(a=>a.slotId==='p2')&&{slotId:P.actors.find(a=>a.slotId==='p2').slotId,heroId:P.actors.find(a=>a.slotId==='p2').heroId,control:P.actors.find(a=>a.slotId==='p2').control}})));return;}
            requestAnimationFrame(check);
          }catch(error){reject(error);}
        };
        check();
      }));
      const startupDrainHandle=await localPage.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,actor=P.actors.find(a=>a.slotId==='p2'),expected=window.__RC223_LOCAL_REBUILD_ACTOR__,strikes=P.exportSnapshot()?.party?.strikes??[],local=strikes.filter(h=>h.slotId==='p2');if(!actor||actor!==expected||actor.control!=='local'||actor.heroId!=='gunner'||local.length)return false;return{zone:s.zone,time:s.time,actorSame:true,actor:{slotId:actor.slotId,heroId:actor.heroId,control:actor.control,x:actor.x,y:actor.y,readyAt:actor.readyAt},hostLastAttack:s.lastAttack,remainingLocalStrikes:local,nativePartyAttacks:P.telemetry().attacks};},null,{timeout:10000});
      const startupQueueDrained=await startupDrainHandle.jsonValue();await startupDrainHandle.dispose();
      const setupStage=await localPage.evaluate(()=>{
        const C=window.__HAPIL_CONTROLS_V31329__,P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,actor=P.actors.find(a=>a.slotId==='p2'),expected=window.__RC223_LOCAL_REBUILD_ACTOR__;
        if(actor!==expected||actor.control!=='local'||actor.heroId!=='gunner')throw Error('native dist01 P2 replacement changed before final fixture staging');
        s.x=22;s.y=24;s.moveVx=s.moveVy=s.moveDx=s.moveDy=0;s.invulnerableUntil=s.time+120;
        actor.x=22;actor.y=24;actor.hp=actor.maxHp=s.maxHp;actor.invulnerableUntil=s.time;actor.moveVx=actor.moveVy=actor.moveDx=actor.moveDy=0;actor.target=null;actor.targetEnemyId=null;actor.path=[];actor.lastDodgeAt=-99;actor.heroMotion={kind:'idle',started:s.time,until:s.time,dx:0,dy:0,facing:1};
        const target=s.enemies.find(e=>e.hp>0&&!e.boss&&!e.midboss&&!e.visualOnly&&!e.protectedNarrativeTargetV31307);
        if(!target)throw Error('dist01 native map has no ordinary combat target for local P2 strike');
        for(const enemy of s.enemies){enemy.readyAt=s.time+120;enemy.patternReadyAt=s.time+120;enemy.themedOrdnanceAt=s.time+120;enemy.themedSummonAt=s.time+120;enemy.movingUntil=s.time+120;enemy.moveDx=enemy.moveDy=enemy.moveVx=enemy.moveVy=0;if(enemy!==target)enemy.invulnerableUntil=s.time+120;}
        // Stage only the target position. Keep native entry/admission fields intact.
        target.x=24;target.y=24;const point={x:15,y:14};
        return{runPolicy:window.__HAPIL_RUN_V31400__?.get?.(s),party:P.status,roster:P.roster,actor:{slotId:actor.slotId,heroId:actor.heroId,control:actor.control,x:actor.x,y:actor.y,hp:actor.hp,maxHp:actor.maxHp},target:{id:target.id,hp:target.hp,maxHp:target.maxHp,boss:!!target.boss,midboss:!!target.midboss},openFloor:{physicalAll:R.contains(point,'all',.8),previousSide:R.contains(point,R.side(s,true),.8),allowed:L.allowed(s,actor,point,.8),canMove:L.canMove(s,actor,point,.8),inRegion:L.regionAt(s,actor,point),exposed:L.exposed(s,actor,point)},npcNeutral:{isPlayer:R.player(s,target),inRegion:L.regionAt(s,target,point),exposed:L.exposed(s,target,point),factors:L.factors(s,target)},hooks:L.hooks};
      });
      const setup={...setupPrefix,...nativeRebuild,...setupStage,startupQueueDrained};
      assert.equal(setup.nativeRebuild.actorReferenceChanged,true,'native zone tick replaces the P2 registry object through PARTY.spawn before fixture cooldown staging');
      assert.equal(setup.nativeActorRebuild.timeAdvancedFromFixtureStart,true,'fresh P2 identity appears only after an actual game simulation frame advances in dist01');
      assert.equal(setup.startupQueueDrained.actorSame,true,'fresh native local P2 actor remains registered after its startup queue resolves');
      assert.equal(setup.startupQueueDrained.remainingLocalStrikes.length,0,'ordinary startup P2 strike queue drains through native PARTY.tick before measured strikes');
      assert.equal(setup.startupQueueDrained.actor.readyAt,setup.cooldownIsolation.p2.heldUntil,'bounded cooldown hold remains on the fresh native P2 actor after queued startup strikes drain');
      assert.equal(setup.startupQueueDrained.hostLastAttack,setup.cooldownIsolation.host.heldUntil,'host native cooldown hold remains after the rebuild frame');
      assert.equal(setup.phase,'game');assert.equal(setup.zone,'dist01');assert.equal(setup.party.mode,'local2');assert.equal(setup.party.enabled,true);assert.equal(setup.party.role,'offline');
      assert.equal(setup.storyDismissal.readerOpened,true,'native RC51 beforeFrame opens the dist01 pre-entry reader before the fixture explicitly dismisses it');assert.equal(setup.storyDismissal.cue?.zone,'dist01');assert.equal(setup.storyDismissal.cue?.phase,'pre');assert.equal(setup.storyDismissal.readerOpenAfterClose,false);assert.equal(setup.storyDismissal.naturalCompletion,false,'the fixture records manual reader dismissal rather than natural completion');
      assert.equal(setup.storyDismissal.readingBlockedAfterClose,false);assert.equal(setup.storyDismissal.partyPausedAfterClose,false);assert.equal(setup.storyDismissal.partyUIOpenAfterClose,false);assert.equal(setup.storyDismissal.modalOpenAfterClose,false);
      setup.storyDismissal.afterNativeFrame=await localPage.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>{const C=window.__HAPIL_CONTROLS_V31329__,P=window.__HAPIL_PARTY_V31322__,story=window.__HAPIL_STORY_RC51__,actor=P.actors.find(a=>a.slotId==='p2');resolve({time:P.state.time,storyIsOpen:story?.isOpen?.()??false,storyCue:story?.currentNarrative?.()??null,readingBlocked:window.__HAPIL_READING_V31342__?.blocked??false,partyPaused:P.status.paused,partyUIOpen:window.__HAPIL_PARTY_UI_V31322__?.isOpen?.()??false,modalOpen:!!C.binding.modal.current,effectiveMode:C.effective(),autoCombatEnabled:C.binding.auto?.current??null,hostLastAttack:P.state.lastAttack,p2ReadyAt:actor?.readyAt,p2ActorSame:actor===window.__RC223_LOCAL_REBUILD_ACTOR__,autoSkillNextAt:P.state.autoSkillNextAt??null,lastAutoSkillAt:P.state.lastAutoSkillAt??null});})));
      assert.equal(setup.storyDismissal.afterNativeFrame.storyIsOpen,false,'the next native animation frame does not reopen the staged dist01 entry reader');assert.equal(setup.storyDismissal.afterNativeFrame.readingBlocked,false);assert.equal(setup.storyDismissal.afterNativeFrame.partyPaused,false,'native Party is unpaused on the frame before the real strike test');assert.equal(setup.storyDismissal.afterNativeFrame.partyUIOpen,false);assert.equal(setup.storyDismissal.afterNativeFrame.modalOpen,false);
      assert.equal(setup.cooldownIsolation.host.field,'state.lastAttack');assert.equal(setup.cooldownIsolation.host.heldUntil,setup.cooldownIsolation.host.stagedAt+120);assert.equal(setup.cooldownIsolation.p2.field,'actor.readyAt');assert.equal(setup.cooldownIsolation.p2.heldUntil,setup.cooldownIsolation.p2.stagedAt+120);assert.equal(setup.storyDismissal.afterNativeFrame.autoCombatEnabled,false,'native auto-skill mode is off after the manual-selected local2 setup');assert.equal(setup.storyDismissal.afterNativeFrame.hostLastAttack,setup.cooldownIsolation.host.heldUntil);assert.equal(setup.storyDismissal.afterNativeFrame.p2ReadyAt,setup.cooldownIsolation.p2.heldUntil);
      assert.equal(setup.storyDismissal.afterNativeFrame.p2ActorSame,true,'native PARTY registry preserves the freshly rebuilt P2 object through the next real RAF');
      assert.equal(setup.runPolicy?.humanPlayers,2);assert.deepEqual(setup.runPolicy?.humanHeroes,['gunner'],'local P2 is approved by the locked new-run human roster');
      assert.deepEqual(setup.roster.map(row=>({slotId:row.slotId,heroId:row.heroId,control:row.control})),[{slotId:'p1',heroId:'slayer',control:'host'},{slotId:'p2',heroId:'gunner',control:'local'}],'new game retains the selected native human roster without adding a story companion');
      assert.deepEqual(setup.actor,{slotId:'p2',heroId:'gunner',control:'local',x:22,y:24,hp:setup.actor.maxHp,maxHp:setup.actor.maxHp},'fresh local2 roster contains the staged P2 actor');
      assert(setup.openFloor.physicalAll);assert.equal(setup.openFloor.previousSide,false);assert.equal(setup.openFloor.allowed,true);assert.equal(setup.openFloor.canMove,true);assert.equal(setup.openFloor.inRegion,true);assert.equal(setup.openFloor.exposed,true,'host authority admits and exposes the local actor on the newly opened physical floor');
      assert.equal(setup.npcNeutral.isPlayer,false);assert.equal(setup.npcNeutral.inRegion,false);assert.equal(setup.npcNeutral.exposed,false);assert.deepEqual(setup.npcNeutral.factors,{active:false,exposed:false,outgoing:1,movement:1,status:'clear'},'native NPC actors remain neutral under the local player rule');
      assert.equal(setup.hooks.localFrame,'HAPIL_PARTY_V31322.tick');assert.equal(setup.hooks.localIncoming,'HAPIL_PARTY_V31322.debug.allyDamage');

      const localStage=await stageActor(localPage,'p2',{x:22,y:24});
      const probe=await localPage.evaluate(()=>{
        const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,base=window.__MONGSE_HERO_RANGED_QA_V31213__?.outgoingMultiplier;
        if(typeof base!=='function')throw Error('unchanged native outgoing baseline probe is unavailable');
        const capture=P.capture,observations=[];P.capture=function(s,binding,...args){
          if(typeof binding?.damage==='function'&&binding.damage.__rc223LocalOutgoingProbe!==true){
            const damage=binding.damage,wrapped=function(...damageArgs){const owner=P.outgoingActor;if(owner){const actual=L.outgoingMultiplier(owner.heroId,false),original=base(owner.heroId,false);observations.push({ownerSlot:owner.slotId,heroId:owner.heroId,actual,original,ratio:actual/original,zone:P.state?.zone,time:P.state?.time});}return damage.apply(this,damageArgs);};
            Object.defineProperty(wrapped,'__rc223LocalOutgoingProbe',{value:true});binding.damage=wrapped;
          }
          return capture.call(this,s,binding,...args);
        };
        window.__RC223_LOCAL_OUTGOING_PROBE__={observations,restore(){P.capture=capture;}};
        return{installed:true,baseline:base('gunner',false),native:P.outgoingActor};
      });
      assert.equal(probe.installed,true);assert.equal(probe.native,null,'native Party outgoing actor scope is empty outside applyStrike');assert.equal(typeof probe.baseline,'number');

      const stageLocalStrike=async point=>localPage.evaluate(({point})=>{
        const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),target=s.enemies.find(e=>e.id===window.__RC223_LOCAL_TARGET_ID__);
        if(!a||!target)return{unavailable:true,slot:a?.slotId,control:a?.control};
        target.x=point.x;target.y=point.y;target.hp=target.maxHp;
        a.readyAt=s.time;a.skillReady=[s.time,s.time,s.time];a.ultimateReady=s.time;a.facing=1;a.direction='right';a.heroMotion={kind:'idle',started:s.time,until:s.time,dx:point.x-a.x,dy:point.y-a.y,facing:1};
        const range=window.__HAPIL_RANGES_V31337__?.partyReach(a.heroId,'A')??27,valid=window.__HAPIL_COMBAT_V31343__?.validTarget(s,target)??false,
          candidates=P.debug.targets(s,a,range),candidateIds=candidates.map(q=>q.id),
          combatCandidates=candidates.filter(q=>window.__HAPIL_COMBAT_V31343__?.validTarget(s,q)===true).map(q=>q.id),
          strikes=P.exportSnapshot()?.party?.strikes??[],encounterLocked=typeof window.MONGSE_isEncounterLocked31226==='function'?window.MONGSE_isEncounterLocked31226(s):Number(s.encounterLockUntil31226??0)>s.time,
          hardLocked=window.__HAPIL_MOVING_V31335__?.hardLocked(s,a)??null,channelActive=window.__HAPIL_CHANNEL_V31364__?.active(s,a)??false;
        const readiness={time:s.time,zone:s.zone,phase:window.__HAPIL_CONTROLS_V31329__?.binding?.phase??null,partyMode:P.status.mode,partyRole:P.status.role,runtimeAutoMode:window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.().autoMode??null,paused:P.status.paused,actor:{slotId:a.slotId,control:a.control,heroId:a.heroId,hp:a.hp,alive:a.hp>0,readyAt:a.readyAt,autoEvadeUntil31223:a.autoEvadeUntil31223??0,dashingUntil:a.dashingUntil??0,recoveryUntilV31322:a.recoveryUntilV31322??0,heroSleepUntil:a.heroSleepUntil??0,heroCharmUntil:a.heroCharmUntil??0,heroMotion:a.heroMotion&&{kind:a.heroMotion.kind,until:a.heroMotion.until},themeRootUntilV31323:a.themeRootUntilV31323??0,themeRootZoneV31323:a.themeRootZoneV31323??null,channelActive,hardLocked},target:{id:target.id,hp:target.hp,maxHp:target.maxHp,x:target.x,y:target.y,invulnerableUntil:target.invulnerableUntil??0,phaseTransitionActive:!!target.phaseTransitionActive,phaseTransitionUntil:target.phaseTransitionUntil??0,flowEnteringUntilV31343:target.flowEnteringUntilV31343??0,flowEntryRemaining:Math.max(0,Number(target.flowEnteringUntilV31343??0)-s.time),flowEntryElapsed:Number(target.flowEnteringUntilV31343??0)<=s.time,protectedNarrativeTargetV31307:!!target.protectedNarrativeTargetV31307,targetable:target.targetable!==false,destructible:target.destructible!==false,autoTargetEligibleV31307:target.autoTargetEligibleV31307!==false,hostileDestructibleV31307:target.hostileDestructibleV31307!==false,objectiveLeaderGateV31309:!!target.objectiveLeaderGateV31309,objectiveDamageAllowed:window.__HAPIL_OBJECTIVE_FLOW_V31309__?.objectiveDamageAllowed?.(s,target)===true,valid,partyCandidate:candidateIds.includes(target.id),combatCandidate:combatCandidates.includes(target.id),distance:Math.hypot(target.x-a.x,target.y-a.y),range},gates:{encounterLocked,hardLocked,channelActive,ready:a.readyAt<=s.time,actorAlive:a.hp>0,unpaused:P.status.paused===false,phaseGame:window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game'},candidateIds,combatCandidateIds:combatCandidates,queue:{count:strikes.length,localTarget:strikes.filter(h=>h.slotId==='p2'&&h.targetId===target.id).length,localStrikes:strikes.filter(h=>h.slotId==='p2').map(h=>({targetId:h.targetId,key:h.key,at:h.at,zone:h.zone}))}};
        const observationStart=window.__RC223_LOCAL_OUTGOING_PROBE__.observations.length;
        const queued=P.debug.attack(s,a,'A');
        const nativeCooldownReadyAt=a.readyAt,cooldownHoldUntil=s.time+120;
        // Keep only the native Party actor cooldown held after staging exactly one
        // real native attack. Queued strikes drain independently in PARTY.tick.
        a.readyAt=cooldownHoldUntil;
        const afterStrikes=P.exportSnapshot()?.party?.strikes??[];
        return{unavailable:false,slot:a.slotId,control:a.control,actor:{x:a.x,y:a.y,hp:a.hp,readyAt:nativeCooldownReadyAt},cooldownIsolation:{field:'actor.readyAt',nativeReadyAt:nativeCooldownReadyAt,heldUntil:a.readyAt,heldDurationSimSeconds:120,nativeQueuedAttack:queued},target:{id:target.id,x:target.x,y:target.y,hp:target.hp,maxHp:target.maxHp},readiness,queued,observationStart,hpBefore:target.hp,queueAfter:{count:afterStrikes.length,localTarget:afterStrikes.filter(h=>h.slotId==='p2'&&h.targetId===target.id).length,localStrikes:afterStrikes.filter(h=>h.slotId==='p2').map(h=>({targetId:h.targetId,key:h.key,at:h.at,zone:h.zone}))}};
      },{point});

      const readNativeStrikeReadiness=()=>localPage.evaluate(targetId=>{
        const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),target=s.enemies.find(e=>e.id===targetId);
        if(!a||!target)return{unavailable:true,time:s?.time??null,slot:a?.slotId,targetId};
        const range=window.__HAPIL_RANGES_V31337__?.partyReach(a.heroId,'A')??27,candidates=P.debug.targets(s,a,range),strikes=P.exportSnapshot()?.party?.strikes??[],
          valid=window.__HAPIL_COMBAT_V31343__?.validTarget(s,target)===true,
          encounterLocked=typeof window.MONGSE_isEncounterLocked31226==='function'?window.MONGSE_isEncounterLocked31226(s):Number(s.encounterLockUntil31226??0)>s.time,
          hardLocked=window.__HAPIL_MOVING_V31335__?.hardLocked(s,a)??null,channelActive=window.__HAPIL_CHANNEL_V31364__?.active(s,a)??false;
        return{time:s.time,zone:s.zone,phase:window.__HAPIL_CONTROLS_V31329__?.binding?.phase??null,partyMode:P.status.mode,partyRole:P.status.role,runtimeAutoMode:window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.().autoMode??null,paused:P.status.paused,actor:{slotId:a.slotId,control:a.control,heroId:a.heroId,hp:a.hp,readyAt:a.readyAt,autoEvadeUntil31223:a.autoEvadeUntil31223??0,dashingUntil:a.dashingUntil??0,recoveryUntilV31322:a.recoveryUntilV31322??0,heroSleepUntil:a.heroSleepUntil??0,heroCharmUntil:a.heroCharmUntil??0,heroMotion:a.heroMotion&&{kind:a.heroMotion.kind,until:a.heroMotion.until},themeRootUntilV31323:a.themeRootUntilV31323??0,themeRootZoneV31323:a.themeRootZoneV31323??null,channelActive,hardLocked},target:{id:target.id,hp:target.hp,maxHp:target.maxHp,x:target.x,y:target.y,invulnerableUntil:target.invulnerableUntil??0,phaseTransitionActive:!!target.phaseTransitionActive,phaseTransitionUntil:target.phaseTransitionUntil??0,flowEnteringUntilV31343:target.flowEnteringUntilV31343??0,flowEntryRemaining:Math.max(0,Number(target.flowEnteringUntilV31343??0)-s.time),flowEntryElapsed:Number(target.flowEnteringUntilV31343??0)<=s.time,protectedNarrativeTargetV31307:!!target.protectedNarrativeTargetV31307,targetable:target.targetable!==false,destructible:target.destructible!==false,autoTargetEligibleV31307:target.autoTargetEligibleV31307!==false,hostileDestructibleV31307:target.hostileDestructibleV31307!==false,objectiveLeaderGateV31309:!!target.objectiveLeaderGateV31309,objectiveDamageAllowed:window.__HAPIL_OBJECTIVE_FLOW_V31309__?.objectiveDamageAllowed?.(s,target)===true,valid,partyCandidate:candidates.some(q=>q.id===target.id),distance:Math.hypot(target.x-a.x,target.y-a.y),range},gates:{encounterLocked,hardLocked,channelActive,ready:a.readyAt<=s.time,actorAlive:a.hp>0,unpaused:P.status.paused===false,phaseGame:window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game'},candidateIds:candidates.map(q=>q.id),queue:{count:strikes.length,localTarget:strikes.filter(h=>h.slotId==='p2'&&h.targetId===target.id).length,localStrikes:strikes.filter(h=>h.slotId==='p2').map(h=>({targetId:h.targetId,key:h.key,at:h.at,zone:h.zone}))}};
      },setup.target.id);

      const beforeNativeReadiness=await readNativeStrikeReadiness();
      progress('local-p2-native-strike-readiness-before-entry-wait',beforeNativeReadiness);
      let readinessHandle,nativeReady;
      try{
        readinessHandle=await localPage.waitForFunction(targetId=>{
          const P=window.__HAPIL_PARTY_V31322__,s=P?.state,a=P?.actors?.find(q=>q.slotId==='p2'),target=s?.enemies?.find(e=>e.id===targetId);
          if(!s||!a||!target)return false;
          const range=window.__HAPIL_RANGES_V31337__?.partyReach(a.heroId,'A')??27,candidates=P.debug.targets(s,a,range),valid=window.__HAPIL_COMBAT_V31343__?.validTarget(s,target)===true,
            encounterLocked=typeof window.MONGSE_isEncounterLocked31226==='function'?window.MONGSE_isEncounterLocked31226(s):Number(s.encounterLockUntil31226??0)>s.time,
            hardLocked=window.__HAPIL_MOVING_V31335__?.hardLocked(s,a)??true,channelActive=window.__HAPIL_CHANNEL_V31364__?.active(s,a)??false;
          // In local2, selected manual is effectively semi and companion() supplies actions.attack by default.
          // That native attack loop continuously advances readyAt, so cooldown is recorded but is not a stable
          // admission gate here. stageLocalStrike explicitly stages cooldown immediately before its real attack.
          if(P.status.paused!==false||window.__HAPIL_CONTROLS_V31329__?.binding?.phase!=='game'||a.hp<=0||encounterLocked||hardLocked||channelActive||!valid||!candidates.includes(target))return false;
          const strikes=P.exportSnapshot()?.party?.strikes??[];
          return{time:s.time,zone:s.zone,targetId:target.id,actorSlot:a.slotId,validTarget:valid,partyCandidate:true,readyAt:a.readyAt,attackCooldownReady:Number(a.readyAt??0)<=s.time,flowEntryRemaining:Math.max(0,Number(target.flowEnteringUntilV31343??0)-s.time),flowEntryElapsed:Number(target.flowEnteringUntilV31343??0)<=s.time,candidateIds:candidates.map(q=>q.id),hardLocked,encounterLocked,channelActive,queueBefore:strikes.filter(h=>h.slotId==='p2').map(h=>({targetId:h.targetId,key:h.key,at:h.at,zone:h.zone}))};
        },setup.target.id,{timeout:20000});
        nativeReady=await readinessHandle.jsonValue();await readinessHandle.dispose();
      }catch(error){
        progress('local-p2-native-strike-readiness-wait-timeout',await readNativeStrikeReadiness());
        throw error;
      }
      progress('local-p2-native-strike-readiness-after-entry-wait',nativeReady);
      assert.equal(nativeReady.validTarget,true,'native COMBAT.validTarget admits the staged target after its natural flow-entry grace');assert.equal(nativeReady.hardLocked,false,'native local actor leaves all hard-lock conditions through actual sim time');assert.equal(nativeReady.encounterLocked,false,'native encounter gate is open');assert.equal(nativeReady.channelActive,false,'local actor is not channel-locked');assert.equal(nativeReady.flowEntryElapsed,true,'native flowEnteringUntil deadline elapsed without fixture mutation');

      await localPage.evaluate(targetId=>{window.__RC223_LOCAL_TARGET_ID__=targetId;},setup.target.id);
      const safeStrike=await stageLocalStrike({x:24,y:24});
      progress('local-p2-native-strike-immediate-pre-call',safeStrike.readiness);
      assert.equal(safeStrike.unavailable,false);assert.equal(safeStrike.slot,'p2');assert.equal(safeStrike.control,'local');assert.equal(safeStrike.queued,true,'native PARTY.debug.attack queues a real Party strike for local P2 in the old admitted area; immediate gates='+JSON.stringify(safeStrike.readiness)+'; queueAfter='+JSON.stringify(safeStrike.queueAfter));
      assert(safeStrike.cooldownIsolation.nativeReadyAt>safeStrike.readiness.time,'native PARTY.attack commits its ordinary cooldown before the fixture hold');assert.equal(safeStrike.cooldownIsolation.heldUntil,safeStrike.readiness.time+120,'P2 native readyAt is held only after the real attack was queued');
      assert.equal(safeStrike.queueAfter.count,safeStrike.readiness.queue.count+1,'the direct native P2 A call adds one real queued strike');assert.equal(safeStrike.queueAfter.localTarget,safeStrike.readiness.queue.localTarget+1,'the newly queued native strike targets the measured live enemy');
      await localPage.waitForFunction(({targetId,before,index})=>{const P=window.__HAPIL_PARTY_V31322__,obs=window.__RC223_LOCAL_OUTGOING_PROBE__?.observations??[],target=P.state.enemies.find(e=>e.id===targetId);return target?.hp<before&&obs.slice(index).some(row=>row.ownerSlot==='p2');},{targetId:setup.target.id,before:safeStrike.hpBefore,index:safeStrike.observationStart},{timeout:15000});
      const safeOutgoing=await localPage.evaluate(({targetId,index})=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,target=s.enemies.find(e=>e.id===targetId),rows=window.__RC223_LOCAL_OUTGOING_PROBE__.observations.slice(index);return{targetHp:target.hp,rows,scopeAfter:P.outgoingActor};},{targetId:setup.target.id,index:safeStrike.observationStart});
      assert(safeOutgoing.targetHp<safeStrike.hpBefore,'local P2 attack reduces real native target HP through Party applyStrike');assert(safeOutgoing.rows.length>0);for(const row of safeOutgoing.rows){assert.equal(row.ownerSlot,'p2');assert.equal(row.heroId,'gunner');assert.equal(row.ratio,1,'actual Party-scoped local outgoing is native baseline on previously admitted floor');}assert.equal(safeOutgoing.scopeAfter,null,'native Party outgoing actor scope restores after real damage call');

      const exposedStage=await stageActor(localPage,'p2',{x:15,y:14});
      const exposed=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,R=window.__HAPIL_BATTLE_ARENA_RC138__;return{actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp},inspection:L.inspect(s,a),factors:L.factors(s,a),host:L.inspect(s,s),npc:(()=>{const e=s.enemies.find(q=>q.id===window.__RC223_LOCAL_TARGET_ID__);return{player:R.player(s,e),region:L.regionAt(s,e,{x:15,y:14}),exposed:L.exposed(s,e,{x:15,y:14}),factors:L.factors(s,e)}})(),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null,metrics:L.metrics(),time:s.time};});
      assert.equal(exposed.inspection.inRegion,true);assert.equal(exposed.inspection.exposed,true);assert.equal(exposed.inspection.owner,'host');assert.equal(exposed.inspection.outgoingMultiplier,.9);assert.equal(exposed.inspection.movementMultiplier,.9);assert.equal(exposed.host.exposed,false,'local P2 exposure does not penalize the safe host actor');
      assert.equal(exposed.npc.player,false);assert.equal(exposed.npc.region,false);assert.equal(exposed.npc.exposed,false);assert.deepEqual(exposed.npc.factors,{active:false,exposed:false,outgoing:1,movement:1,status:'clear'},'NPCs remain neutral while local P2 is exposed');
      await localPage.waitForFunction(()=>document.querySelector('#hapil-left-zone-warning-rc223')?.textContent==='위험 지대 · P2 · 체력·공격·이동 감소',null,{timeout:8000});
      exposed.warning=await localPage.locator('#hapil-left-zone-warning-rc223').innerText();assert.equal(exposed.warning,'위험 지대 · P2 · 체력·공격·이동 감소','shared screen badge identifies the exposed local P2 while host remains safe');
      // Prior outgoing strikes, the shared warning render, and the screenshot
      // can consume exposure time. Start a separate DOT sample only after the
      // actual local PARTY tick exits and reports native cleanup.
      const priorDotMetrics=await localPage.evaluate(()=>window.__HAPIL_LEFT_ZONE_NATIVE_RC223__.metrics());
      const safeDotStage=await stageActor(localPage,'p2',{x:22,y:24});
      await localPage.waitForFunction(baseExits=>{const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return a&&R.contains({x:a.x,y:a.y},R.side(s,true),.8)&&L.metrics().exits>baseExits;},priorDotMetrics.exits,{timeout:10000});
      const safeDot=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return{actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp},inspection:L.inspect(s,a),metrics:L.metrics(),time:s.time};});
      assert.equal(safeDot.inspection.exposed,false);assert.equal(safeDot.inspection.elapsedSeconds,0);assert.equal(safeDot.inspection.ticks,0);assert(safeDot.metrics.exits>priorDotMetrics.exits,'native local PARTY tick clears the earlier exposure before the independent DOT sample');
      const dotEntryMetrics=safeDot.metrics,dotReentry=await stageActor(localPage,'p2',{x:15,y:14});
      const dotStartHandle=await localPage.waitForFunction(baseEntries=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),metrics=L.metrics();if(!a||metrics.entries<=baseEntries)return false;return{actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp},time:s.time,inspection:L.inspect(s,a),metrics};},dotEntryMetrics.entries,{timeout:10000});
      const dotStart=await dotStartHandle.jsonValue();await dotStartHandle.dispose();
      assert.equal(dotStart.inspection.exposed,true);assert.equal(dotStart.inspection.ticks,0);assert.equal(dotStart.inspection.appliedTicks,0);assert(dotStart.inspection.elapsedSeconds>0&&dotStart.inspection.elapsedSeconds<.5,'local DOT baseline captures a fresh native exposure frame before grace expires');
      const firstLocalTickHandle=await localPage.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),v=L.inspect(s,a);if(v.appliedTicks<1)return false;return{hp:a.hp,time:s.time,inspection:v,metrics:L.metrics()};},null,{timeout:50000});
      const firstLocalTick=await firstLocalTickHandle.jsonValue();await firstLocalTickHandle.dispose();
      assert.equal(firstLocalTick.inspection.ticks,1);assert.equal(firstLocalTick.inspection.appliedTicks,1,'local Party tick commits one native DOT after grace');assert.equal(firstLocalTick.inspection.lastRawDamage,dotStart.actor.maxHp*.005,'local frame passes exactly 0.5% max HP raw damage to native ally reducer');assert(firstLocalTick.hp<dotStart.actor.hp,'local P2 HP falls through HAPIL_PARTY_V31322.debug.allyDamage');assert.equal(firstLocalTick.metrics.damageApplied-dotStart.metrics.damageApplied,1,'one local owner tick applies one DOT event');
      await localPage.waitForTimeout(250);const noDuplicate=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return{inspection:L.inspect(s,a),metrics:L.metrics()};});
      assert.equal(noDuplicate.inspection.ticks,1,'a single local native sim frame key cannot duplicate DOT while still inside the same tick interval');assert.equal(noDuplicate.metrics.damageApplied,firstLocalTick.metrics.damageApplied);

      const exposedStrike=await stageLocalStrike({x:17,y:14});
      progress('local-p2-exposed-strike-immediate-pre-call',exposedStrike.readiness);
      assert.equal(exposedStrike.queued,true,'local P2 queues a second real native strike while exposed; immediate gates='+JSON.stringify(exposedStrike.readiness)+'; queueAfter='+JSON.stringify(exposedStrike.queueAfter));
      assert(exposedStrike.cooldownIsolation.nativeReadyAt>exposedStrike.readiness.time,'exposed native PARTY.attack commits its ordinary cooldown before the fixture hold');assert.equal(exposedStrike.cooldownIsolation.heldUntil,exposedStrike.readiness.time+120,'exposed P2 native readyAt is held only after the real strike was queued');
      assert.equal(exposedStrike.queueAfter.count,exposedStrike.readiness.queue.count+1,'the exposed native P2 A call adds one real queued strike');assert.equal(exposedStrike.queueAfter.localTarget,exposedStrike.readiness.queue.localTarget+1,'the exposed native strike targets the measured live enemy');
      await localPage.waitForFunction(({targetId,before,index})=>{const P=window.__HAPIL_PARTY_V31322__,obs=window.__RC223_LOCAL_OUTGOING_PROBE__?.observations??[],target=P.state.enemies.find(e=>e.id===targetId);return target?.hp<before&&obs.slice(index).some(row=>row.ownerSlot==='p2');},{targetId:setup.target.id,before:exposedStrike.hpBefore,index:exposedStrike.observationStart},{timeout:15000});
      const exposedOutgoing=await localPage.evaluate(({targetId,index})=>{const P=window.__HAPIL_PARTY_V31322__,target=P.state.enemies.find(e=>e.id===targetId);return{targetHp:target.hp,rows:window.__RC223_LOCAL_OUTGOING_PROBE__.observations.slice(index),scopeAfter:P.outgoingActor};},{targetId:setup.target.id,index:exposedStrike.observationStart});
      assert(exposedOutgoing.targetHp<exposedStrike.hpBefore,'exposed local Party strike deals real native damage');assert(exposedOutgoing.rows.length>0);for(const row of exposedOutgoing.rows){assert.equal(row.ownerSlot,'p2');assert.equal(row.heroId,'gunner');assert(Math.abs(row.ratio-.9)<1e-9,'actual Party applyStrike scope selects the local P2 0.9 multiplier rather than the host factor');}assert.equal(exposedOutgoing.scopeAfter,null);
      await capture('left-zone-local-p2-exposed',localPage);

      const movementStart=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),C=window.__HAPIL_CONTROLS_V31329__;return{x:a.x,y:a.y,time:s.time,wallTime:performance.now(),host:{x:s.x,y:s.y},hostHeld:C.inputSnapshot().held,hostInput:[...(C.binding.input.current??[])]};});
      const movementProbe=await localPage.evaluate(()=>{
        const P=window.__HAPIL_PARTY_V31322__,C=window.__HAPIL_CONTROLS_V31329__,originalSetInput=P.setInput,originalStop=Event.prototype.stopImmediatePropagation;
        const probe={inputs:[],stoppedEvents:[],rafSamples:0,hostHeldBefore:C.inputSnapshot().held,hostInputBefore:[...(C.binding.input.current??[])]};
        P.setInput=function(slotId,input,...args){if(slotId==='p2')probe.inputs.push({seq:input?.seq,moveX:input?.moveX??0,moveY:input?.moveY??0,actions:input?.actions??null});return originalSetInput.call(this,slotId,input,...args);};
        Event.prototype.stopImmediatePropagation=function(...args){if((this.type==='keydown'||this.type==='keyup')&&this.code==='ArrowLeft')probe.stoppedEvents.push({type:this.type,code:this.code});return originalStop.apply(this,args);};
        probe.restore=()=>{P.setInput=originalSetInput;Event.prototype.stopImmediatePropagation=originalStop;};
        window.__RC223_LOCAL_KEYBOARD_MOVEMENT_PROBE__=probe;
        return{effectiveMode:C.effective(),localTwo:C.localTwo(),hostHeld:probe.hostHeldBefore,hostInput:probe.hostInputBefore};
      });
      assert.equal(movementProbe.localTwo,true,'the fixture is running the native local two-player Party input path');assert.equal(movementProbe.effectiveMode,'semi','local2 policy promotes manual selection to its effective semi combat mode');
      await localPage.bringToFront();let movement,keyHeld=false,inputEvidence,releaseInputStart=0;
      try{
        await localPage.keyboard.down('ArrowLeft');keyHeld=true;
        const movementHandle=await localPage.waitForFunction(start=>{
          const P=window.__HAPIL_PARTY_V31322__,C=window.__HAPIL_CONTROLS_V31329__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,probe=window.__RC223_LOCAL_KEYBOARD_MOVEMENT_PROBE__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');
          if(!a||!probe)throw Error('native local2 actor or keyboard probe disappeared during actual P2 input');probe.rafSamples++;
          const previouslyAllowed=R.contains({x:a.x,y:a.y},R.side(s,true),.8);if(!previouslyAllowed)return false;
          return{start,end:{x:a.x,y:a.y,time:s.time,hp:a.hp},simSeconds:s.time-start.time,wallMs:performance.now()-start.wallTime,frames:probe.rafSamples,previouslyAllowed,exposed:L.inspect(s,a).exposed,inspection:L.inspect(s,a),effectiveMode:C.effective(),host:{x:s.x,y:s.y},sampledBy:'Playwright waitForFunction with polling=raf at first native old-side sample'};
        },movementStart,{polling:'raf',timeout:12000});
        movement=await movementHandle.jsonValue();await movementHandle.dispose();
        releaseInputStart=await localPage.evaluate(()=>window.__RC223_LOCAL_KEYBOARD_MOVEMENT_PROBE__?.inputs.length??0);
        await localPage.keyboard.up('ArrowLeft');keyHeld=false;
        await localPage.waitForFunction(startCount=>window.__RC223_LOCAL_KEYBOARD_MOVEMENT_PROBE__?.inputs.slice(startCount).some(row=>Math.abs(row.moveX)<.01&&Math.abs(row.moveY)<.01),releaseInputStart,{timeout:3000});
      }finally{
        if(keyHeld)await localPage.keyboard.up('ArrowLeft').catch(()=>{});
        inputEvidence=await localPage.evaluate(startCount=>{const C=window.__HAPIL_CONTROLS_V31329__,probe=window.__RC223_LOCAL_KEYBOARD_MOVEMENT_PROBE__;if(!probe)return null;const result={inputs:[...probe.inputs],releaseInputStart:startCount,stoppedEvents:[...probe.stoppedEvents],rafSamples:probe.rafSamples,hostHeldBefore:probe.hostHeldBefore,hostHeldAfter:C.inputSnapshot().held,hostInputBefore:probe.hostInputBefore,hostInputAfter:[...(C.binding.input.current??[])]};probe.restore();delete window.__RC223_LOCAL_KEYBOARD_MOVEMENT_PROBE__;return result;},releaseInputStart).catch(()=>null);
      }
      assert(movement.end.x<movementStart.x-.5,'actual local P2 ArrowLeft input moves the actor through native local PARTY.tick');assert.equal(movement.previouslyAllowed,true,'RAF sample confirms held P2 input crosses into the previously admitted half');assert.equal(movement.exposed,false);assert(movement.frames>0,'old-side evidence was sampled on a native animation frame');
      const nonzeroP2Inputs=inputEvidence?.inputs.filter(row=>Math.abs(row.moveX)>.5||Math.abs(row.moveY)>.5)??[],releaseZeroP2Input=inputEvidence?.inputs.slice(inputEvidence.releaseInputStart).find(row=>Math.abs(row.moveX)<.01&&Math.abs(row.moveY)<.01);
      assert(nonzeroP2Inputs.length>0,'native Party UI converts the real ArrowLeft key into nonzero P2 setInput packets');assert(releaseZeroP2Input,'after keyup, the native Party UI sends a zero P2 movement packet');assert(releaseZeroP2Input.seq>nonzeroP2Inputs[nonzeroP2Inputs.length-1].seq,'the observed keyup zero packet follows the held directional P2 packet');assert(inputEvidence.stoppedEvents.some(row=>row.type==='keydown')&&inputEvidence.stoppedEvents.some(row=>row.type==='keyup'),'the native Party UI stopImmediatePropagation owns the P2 keydown and keyup');assert.deepEqual(inputEvidence.hostInputAfter,inputEvidence.hostInputBefore,'P2 arrow input does not enter the host movement-input set');assert.deepEqual(inputEvidence.hostHeldAfter,inputEvidence.hostHeldBefore,'P2 arrow input does not enter native host held-key state');assert.equal(movement.effectiveMode,'semi');
      await localPage.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return a&&R.contains({x:a.x,y:a.y},R.side(s,true),.8)&&!L.inspect(s,a).exposed&&L.inspect(s,a).ticks===0;},null,{timeout:8000});
      const exited=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return{actor:{x:a.x,y:a.y,hp:a.hp},inspection:L.inspect(s,a),metrics:L.metrics(),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null};});
      assert.equal(exited.inspection.exposed,false);assert.equal(exited.inspection.elapsedSeconds,0);assert.equal(exited.inspection.ticks,0);assert(exited.metrics.exits>noDuplicate.metrics.exits,'actual native local movement out of added floor clears the P2 exposure clock');

      const reenter=await stageActor(localPage,'p2',{x:15,y:14});
      await localPage.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,a=P.actors.find(q=>q.slotId==='p2');return L.inspect(P.state,a).elapsedSeconds>0;},null,{timeout:8000});
      const death=await localPage.evaluate(()=>{
        const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,before=L.inspect(s,a),metrics=L.metrics();
        // HP=1 is an explicit fixture; lethality is caused by the production
        // native ally reducer, not a direct HP commit.
        a.hp=1;a.invulnerableUntil=s.time-1;const source={id:'rc223-local-p2-lethal-fixture-'+Date.now(),sourceId:s.enemies.find(e=>e.hp>0)?.id??'dist01-native-enemy',damage:100000,born:s.time,boss:true},accepted=P.debug.allyDamage(s,a,100000,source);
        return{accepted,hp:a.hp,downUntil:a.downUntil,before,metrics:L.metrics(),partyRevivesBefore:P.telemetry().revives,source,method:'staged HP=1 followed by native PARTY.debug.allyDamage'};
      });
      assert.equal(death.accepted,true,'native PARTY ally reducer accepts lethal incoming for local P2');assert(death.hp<=0,'native incoming reducer downs the explicitly staged local actor');
      await localPage.waitForFunction(baseExits=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,a=P.actors.find(q=>q.slotId==='p2');return a&&a.hp<=0&&L.metrics().exits>baseExits;},death.metrics.exits,{timeout:8000});
      const dead=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,a=P.actors.find(q=>q.slotId==='p2'),metrics=L.metrics();return{hp:a.hp,metrics,inspection:L.inspect(P.state,a)};});
      assert.equal(dead.inspection.exposed,false);assert.equal(dead.inspection.elapsedSeconds,0);assert.equal(dead.inspection.ticks,0);assert(dead.metrics.exits>death.metrics.exits,'native PARTY tick increments exit cleanup before readout can inspect the dead actor');
      const reviveHandle=await localPage.waitForFunction(baseRevives=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),revives=P.telemetry().revives;if(!a||a.hp<=0||revives<=baseRevives)return false;return{hp:a.hp,maxHp:a.maxHp,downUntil:a.downUntil,time:s.time,revives};},death.partyRevivesBefore,{timeout:30000});
      const revived=await reviveHandle.jsonValue();await reviveHandle.dispose();
      assert(revived.hp>=revived.maxHp*.49&&revived.hp<=revived.maxHp*.51,'native PARTY tick revives local P2 at its production half-health');assert(revived.downUntil<=revived.time);assert(revived.revives>death.partyRevivesBefore,'P2 revival is observed through native Party telemetry');
      const reviveEvidence=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),metrics=L.metrics(),inspection=L.inspect(s,a);return{actor:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp,downUntil:a.downUntil},inspection,metrics,revives:P.telemetry().revives,time:s.time};});
      assert.equal(reviveEvidence.actor.hp,revived.hp);assert.equal(reviveEvidence.inspection.elapsedSeconds,0);assert.equal(reviveEvidence.inspection.ticks,0);

      const lifecycleStage=await stageActor(localPage,'p2',{x:15,y:14});
      const lifecycleHandle=await localPage.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),v=L.inspect(s,a);return v.exposed&&v.elapsedSeconds>0;},null,{timeout:8000});
      const lifecycleExposure=await lifecycleHandle.jsonValue();await lifecycleHandle.dispose();
      const lifecycleBefore=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return{phase:window.__HAPIL_CONTROLS_V31329__.binding.phase,actor:{x:a.x,y:a.y,hp:a.hp},inspection:L.inspect(s,a),metrics:L.metrics(),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null};});
      assert.equal(lifecycleBefore.phase,'game');assert.equal(lifecycleBefore.inspection.exposed,true);assert(lifecycleBefore.inspection.elapsedSeconds>0);assert.equal(lifecycleBefore.inspection.ticks,0);
      await localPage.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.actions.settings());
      const titleButton=localPage.locator('.return-title-button');await titleButton.waitFor({state:'visible',timeout:10000});
      localPage.once('dialog',dialog=>dialog.accept());await titleButton.click();
      await localPage.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='title',null,{timeout:15000});
      await localPage.waitForFunction(baseExits=>window.__HAPIL_LEFT_ZONE_NATIVE_RC223__?.metrics?.().exits>baseExits,lifecycleBefore.metrics.exits,{timeout:10000});
      const lifecycleAfter=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,C=window.__HAPIL_CONTROLS_V31329__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),metrics=L.metrics(),inspection=L.inspect(s,a);return{phase:C.binding.phase,inspection,metrics,warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null};});
      assert.equal(lifecycleAfter.phase,'title');assert(lifecycleAfter.metrics.exits>lifecycleBefore.metrics.exits,'native title transition clears the live local P2 clock before inspection');assert.equal(lifecycleAfter.inspection.exposed,false);assert.equal(lifecycleAfter.inspection.elapsedSeconds,0);assert.equal(lifecycleAfter.inspection.ticks,0);assert.equal(lifecycleAfter.warning,null);
      await capture('left-zone-local-p2-title-cleanup',localPage);
      return{setup,localPreparation,localStage,probe,safeStrike,safeOutgoing,exposedStage,exposed,safeDotStage,safeDot,dotReentry,dotStart,firstLocalTick,noDuplicate,exposedStrike,exposedOutgoing,movementStart,movement,inputEvidence,exited,reenter,death,dead,revived,reviveEvidence,lifecycleStage,lifecycleExposure,lifecycleBefore,lifecycleAfter,scope:'isolated fresh campaign launched through native Party preparation UI (humanPlayers=2, P1 Slayer/P2 Gunner), staged dist01 actor/enemy coordinates and HP, bounded native cooldown holds isolate P2 probe timing (host state.lastAttack and local actor.readyAt; each direct strike is queued first and its native cooldown recorded), real P2 ArrowLeft key captured by the native Party UI and sampled on RAF through PARTY.tick in effective semi mode, native Party applyStrike target damage, actual local ally DOT/death/revive, and native return-to-title clock cleanup'};
    });

    assert.deepEqual(report.errors,[],'browser page errors');assert.deepEqual(report.httpErrors,[],'HTTP errors');report.status='passed';
  }catch(error){failure=error;report.status=report.environment.officialChrome?'failed':'blocked';report.failure=error.stack||String(error);process.exitCode=1;}
  finally{
    report.finishedAt=new Date().toISOString();save();
    for(const context of contexts)await context.close().catch(()=>{});
    await browser?.close().catch(()=>{});if(relay)await relay.close();if(web)await new Promise(resolve=>web.close(resolve));server.close();
    console.log('RC223_LEFT_ZONE_BROWSER '+JSON.stringify({status:report.status,appSha,browserVersion:report.browserVersion,checks:report.checks.map(r=>({name:r.name,status:r.status})),captures:report.captures.length,results:path.join(out,'results.json'),failure:failure?String(failure.stack||failure):null}));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
