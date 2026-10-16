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
  scope:'Actual RC138 dist01 floor union, RC223 host and remote actor frames, real keyboard movement, native incoming damage, and native checkpoint re-entry in official Chrome with a loopback two-context WebSocket relay. Positions are staged. The lethal respawn case explicitly stages HP=1 before native incoming damage; it is not natural death progression.',
  limitations:[
    'Official Chrome contexts share one local loopback relay; this is not a physical four-network deployment.',
    'No physical phone or GPU coverage is included.',
    'Player positions and enemy readiness are staged to isolate native geometry and timers; movement, frame ticks, incoming reducers, co-op ownership, and checkpoint selection remain production paths.',
    'The checkpoint cleanup case stages both actors at 1 HP before applying real native incoming reducers; it does not claim a naturally reached lethal encounter.'
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
  catch(error){row.status='failed';row.error=error.stack||String(error);row.observations??=[];row.diagnostics=await page.evaluate(()=>{const C=window.__HAPIL_CONTROLS_V31329__,P=window.__HAPIL_PARTY_V31322__,s=P?.state??C?.binding?.state?.current,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,R=window.__HAPIL_BATTLE_ARENA_RC138__,runtime=window.__HAPIL_REMOTE_RC222_RUNTIME__;return{runtime:runtime?.status?.(),runtimeTelemetry:runtime?.telemetry?.(),party:P?.status,phase:C?.binding?.phase,zone:s?.zone,time:s?.time,hp:s?.hp,maxHp:s?.maxHp,position:{x:s?.x,y:s?.y,moveVx:s?.moveVx,moveVy:s?.moveVy,moveDx:s?.moveDx,moveDy:s?.moveDy},actors:(P?.actors||[]).map(a=>({slotId:a.slotId,heroId:a.heroId,x:a.x,y:a.y,hp:a.hp,moveVx:a.moveVx,moveVy:a.moveVy,moveDx:a.moveDx,moveDy:a.moveDy,inspection:L?.inspect?.(s,a),factors:L?.factors?.(s,a)})),battleArena:R?.snapshot?.(s),leftZone:L?.snapshot?.(),player:L?.inspect?.(s,s),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent,enemies:(s?.enemies||[]).slice(0,8).map(a=>({id:a.id,hp:a.hp,x:a.x,y:a.y,readyAt:a.readyAt}))};}).catch(e=>({diagnosticError:String(e)}));row.diagnostics.observations=row.observations;console.error('RC223_LEFT_CHECK_FAILURE '+JSON.stringify({name,error:row.error,diagnostics:row.diagnostics}));await capture('failed-'+name,page).catch(()=>{});throw error;}
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
    actor.x=point.x;actor.y=point.y;actor.target=null;actor.path=[];actor.moveVx=actor.moveVy=0;actor.heroRoleNavPath31222=[];actor.heroRoleSteeringActive31222=false;
    if(actor!==s){actor.invulnerableUntil=Math.min(Number(actor.invulnerableUntil)||0,s.time);actor.lastDodgeAt=-99;}
    else {s.target=null;s.targetEnemyId=null;s.path=[];}
    C.setMode('manual');return{x:actor.x,y:actor.y,time:s.time,hp:actor.hp,maxHp:actor.maxHp,invulnerableUntil:actor.invulnerableUntil};
  },{slot,point});
}
async function actorEvidence(page,slot){
  return page.evaluate(slot=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=slot==='host'?s:P.actors.find(q=>q.slotId===slot);return{slot,zone:s.zone,time:s.time,actor:a&&{id:a.slotId??'host',x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp,invulnerableUntil:a.invulnerableUntil},inspection:a?L.inspect(s,a):null,metrics:L.metrics(),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null};},slot);
}
async function remoteMove(guest,host,key,slot,minSeconds=.35){
  const before=await actorEvidence(host,slot);assert(before.actor,'remote actor exists before keyboard input');
  await guest.keyboard.down(key);
  try{
    await guest.waitForFunction(()=>{const q=window.__HAPIL_REMOTE_RC222_RUNTIME__?.readInput?.();return !!q&&(Math.abs(q.moveX)+Math.abs(q.moveY))>0;},null,{timeout:6000});
    await host.waitForFunction(({slot,before,minSeconds})=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId===slot);return a&&s.time>=before.time+minSeconds&&Math.hypot(a.x-before.actor.x,a.y-before.actor.y)>.05;},{slot,before,minSeconds},{timeout:12000});
  }finally{await guest.keyboard.up(key);}
  const after=await actorEvidence(host,slot),seconds=after.time-before.time,distance=Math.hypot(after.actor.x-before.actor.x,after.actor.y-before.actor.y);
  assert(seconds>=minSeconds,'real remote movement is observed for at least '+minSeconds+' native simulation seconds');assert(distance>.05,'real remote input changes world coordinates');
  return{key,before,after,worldDistance:distance,simSeconds:seconds,worldSpeedPerSimSecond:distance/seconds,method:'actual guest keyboard input replicated to the host and run through native RC222 actor movement'};
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
      assert.deepEqual(geometry.actualHooks,{movement:'ft -> HAPIL_BATTLE_ARENA_RC138.movement',blink:'HAPIL_blinkWalkableRC85',outgoing:'MONGSE_heroOutgoingModeMultiplier31213',hostFrame:'HAPIL_CONTROLS_V31329.frameStart',remoteFrame:'RC222_NATIVE.actorFrame',hostIncoming:'NATIVE_ARENA_RC138.bodyDamage -> Y',remoteIncoming:'REMOTE_RC222_RUNTIME.incomingActor'});
      return geometry;
    });

    await check('host-authoritative-coop-entry-and-movement',host,async()=>{
      const safe=await stageActor(host,'p2',{x:22,y:24});
      const guestView=await guest.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__;return{role:window.__HAPIL_REMOTE_RC222_RUNTIME__.status().role,actor:a&&{x:a.x,y:a.y,hp:a.hp},inRegion:L.inRegion(s,a,{x:15,y:14}),exposed:L.exposed(s,a,{x:15,y:14}),snapshot:L.inspect(s,a)};});
      assert.equal(guestView.role,'guest');assert.equal(guestView.inRegion,true,'guest reads the same physical extension geometry');assert.equal(guestView.exposed,false,'guest cannot create host-authoritative exposure or damage');
      const safeSnapshot=await actorEvidence(host,'p2');assert.equal(safeSnapshot.inspection.owner,'host');assert.equal(safeSnapshot.inspection.exposed,false);assert.equal(safeSnapshot.inspection.outgoingMultiplier,1);assert.equal(safeSnapshot.inspection.movementMultiplier,1);
      const safeMultiplier=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,hero=a.heroId;return{actual:R.withActor(s,a,()=>L.outgoingMultiplier(hero,false)),base:window.__MONGSE_HERO_RANGED_QA_V31213__?.outgoingMultiplier?.(hero,false)};});
      assert.equal(safeMultiplier.actual,safeMultiplier.base,'previously admitted area keeps the original native outgoing multiplier');
      const baselineMove=progress('baselineMove',await remoteMove(guest,host,'ArrowDown','p2',.35));
      const movedTo=await stageActor(host,'p2',{x:15,y:14});
      const before=await actorEvidence(host,'p2');assert.equal(before.inspection.inRegion,true);assert.equal(before.inspection.exposed,true);assert.equal(before.inspection.owner,'host');
      const mobileFactor=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,a=P.actors.find(q=>q.slotId==='p2');return{factors:L.factors(s,a),outgoing:R.withActor(s,a,()=>L.outgoingMultiplier(a.heroId,false)),base:window.__MONGSE_HERO_RANGED_QA_V31213__?.outgoingMultiplier?.(a.heroId,false)};});
      assert.deepEqual(mobileFactor.factors,{active:true,exposed:true,outgoing:.9,movement:.9,status:'left-zone'});
      assert(Math.abs(mobileFactor.outgoing/mobileFactor.base-.9)<1e-9,'actual native outgoing multiplier wrapper applies exactly 0.9 in exposed region');
      const exposedMove=progress('exposedMove',await remoteMove(guest,host,'ArrowDown','p2',.35));
      const movementRatio=exposedMove.worldSpeedPerSimSecond/baselineMove.worldSpeedPerSimSecond;
      progress('nativeRemoteMovementRatio',{baselineMove,exposedMove,movementRatio,expectedFactor:mobileFactor.factors.movement,assertion:'abs(ratio - 0.9) < 0.22'});
      console.log('RC223_LEFT_REMOTE_MOVEMENT '+JSON.stringify({baselineMove,exposedMove,movementRatio,expectedFactor:mobileFactor.factors.movement}));
      assert(Math.abs(movementRatio-.9)<.22,'actual native remote world movement speed applies the 0.9 factor');
      const hostAfter=await actorEvidence(host,'p2'),guestAfter=await guest.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__;return{actor:{x:a.x,y:a.y,hp:a.hp},inspection:L.inspect(s,a),inRegion:L.inRegion(s,a),exposed:L.exposed(s,a),metrics:L.metrics()};});
      assert(guestAfter.inRegion);assert.equal(guestAfter.exposed,false,'replicated guest only renders geometry and never owns the hazard tick');assert.equal(hostAfter.inspection.owner,'host');
      await capture('left-zone-coop-exposed',host);await capture('left-zone-coop-guest-readonly',guest);
      return{safe,safeSnapshot,safeMultiplier,guestView,baselineMove,movedTo,before,mobileFactor,exposedMove,hostAfter,guestAfter,scope:'actual local two-context relay; positions staged to old and added floor, remote actor move is real network input'};
    });

    await check('remote-exposure-dot-once-and-exit-reset',host,async()=>{
      const before=await actorEvidence(host,'p2'),metricsBefore=before.metrics;
      await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),v=L.inspect(s,a);return v.appliedTicks>=1&&v.ticks>=1&&v.elapsedSeconds>=2;},null,{timeout:50000});
      const firstTick=await actorEvidence(host,'p2');assert.equal(firstTick.inspection.appliedTicks,1);assert.equal(firstTick.inspection.ticks,1);assert.equal(firstTick.inspection.lastRawDamage,firstTick.actor.maxHp*.005,'first remote tick uses exactly 0.5% max HP raw');
      await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),v=L.inspect(s,a);return v.appliedTicks>=2&&v.ticks>=2&&v.elapsedSeconds>=3;},null,{timeout:30000});
      const after=await actorEvidence(host,'p2');
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
      return{before,firstTick,after,afterGuest,remoteExitStart,exited,metricsDelta:{entries:after.metrics.entries-metricsBefore.entries,damageApplied:after.metrics.damageApplied-metricsBefore.damageApplied,exits:exited.metrics.exits-after.metrics.exits},method:'host RC222 actorFrame owns the 2s and 3s remote DOT events; guest reads geometry only; real ArrowLeft input exits into old admitted half'};
    });

    await check('host-frame-pause-incoming-and-reset',host,async()=>{
      const safe=await stageActor(host,'host',{x:22,y:24});
      const oldMultiplier=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__;return{actual:L.outgoingMultiplier(s.activeHeroId,false),base:window.__MONGSE_HERO_RANGED_QA_V31213__?.outgoingMultiplier?.(s.activeHeroId,false)};});
      assert.equal(oldMultiplier.actual,oldMultiplier.base,'host outgoing wrapper equals the original native value in the old admitted area');
      await stageActor(host,'host',{x:15,y:14});
      const entered=await actorEvidence(host,'host');assert.equal(entered.inspection.exposed,true);assert.equal(entered.inspection.owner,'host');
      await host.waitForFunction(()=>document.querySelector('#hapil-left-zone-warning-rc223')?.textContent==='위험 지대 · 체력·공격·이동 감소',null,{timeout:8000});
      entered.warning=await host.locator('#hapil-left-zone-warning-rc223').innerText();
      await host.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.actions.settings());
      await host.waitForFunction(()=>window.__HAPIL_PARTY_V31322__.status.paused===true,null,{timeout:6000});
      const pausedBefore=await actorEvidence(host,'host');await host.waitForTimeout(500);const pausedAfter=await actorEvidence(host,'host');
      assert.equal(pausedAfter.time,pausedBefore.time,'native modal pause freezes the simulation clock');assert.equal(pausedAfter.inspection.elapsedSeconds,pausedBefore.inspection.elapsedSeconds,'native modal pause preserves exposure clock');assert.equal(pausedAfter.inspection.ticks,pausedBefore.inspection.ticks);assert.equal(pausedAfter.actor.hp,pausedBefore.actor.hp);
      await capture('left-zone-paused',host);await host.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.actions.dismiss());
      await host.waitForFunction(()=>window.__HAPIL_PARTY_V31322__.status.paused!==true&&!window.__HAPIL_REMOTE_RC222_RUNTIME__.status().paused,null,{timeout:8000});
      await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__;return L.inspect(P.state,P.state).appliedTicks>=1;},null,{timeout:50000});
      const afterTick=await actorEvidence(host,'host'),newMultiplier=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__;return L.outgoingMultiplier(s.activeHeroId,false);});
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
        const P=window.__HAPIL_PARTY_V31322__,C=window.__HAPIL_CONTROLS_V31329__,s=P.state,N=window.__HAPIL_NATIVE_ARENA_RC138__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,now=Date.now(),sourceId=s.enemies.find(e=>e.hp>0)?.id??'dist01-native-enemy',actors=P.actors.filter(a=>a.hp>0);
        // Distinct disclosed HP fixture: only the initial values are staged.
        // Death is caused by production incoming reducers, and respawn uses the
        // native checkpoint button below.
        s.hp=1;s.invulnerableUntil=s.time-1;s.awakeningUntil=0;s.guardianGraceReadyAt=s.time+120;
        for(const a of actors){a.hp=1;a.invulnerableUntil=s.time-1;a.awakeningUntil=0;}
        const hostSource={id:'rc223-left-host-lethal-fixture-'+now,sourceId,damage:100000,born:s.time,boss:true};
        const hostAccepted=N.bodyDamage(s,100000,s.x,s.y,hostSource),remoteResults=actors.map((a,index)=>{const source={id:'rc223-left-ally-lethal-fixture-'+index+'-'+now,sourceId,damage:100000,born:s.time,boss:true};const accepted=R.ownsActor?.(s,a)?R.incomingActor(s,a,100000,source):P.debug.allyDamage(s,a,100000,source);return{slotId:a.slotId,hp:a.hp,downUntil:a.downUntil,accepted,source};});
        return{hostAccepted,host:{hp:s.hp,downUntil:s.downUntil},remoteResults,actors:P.actors.map(a=>({slotId:a.slotId,hp:a.hp,downUntil:a.downUntil})),sources:[hostSource,...remoteResults.map(x=>x.source)],scope:'HP=1 fixture followed by production host and remote incoming reducers for all party actors; checkpoint UI performs respawn'};
      });
      assert(lethal.host.hp<=0,'native host incoming reducer causes the staged lethal event');assert(lethal.remoteResults.some(a=>a.slotId==='p2'&&a.hp<=0),'native remote incoming reducer causes the staged lethal event');assert(lethal.actors.every(a=>a.hp<=0),'all party actors are down so the native checkpoint choice is the actual wipe flow');
      await host.getByRole('button',{name:'체크포인트에서 부활',exact:true}).waitFor({state:'visible',timeout:15000});
      const waiting=await host.evaluate(()=>({party:window.__HAPIL_PARTY_V31322__.status,metrics:window.__HAPIL_LEFT_ZONE_NATIVE_RC223__.metrics(),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null}));
      await capture('left-zone-death-choice',host);
      await host.getByRole('button',{name:'체크포인트에서 부활',exact:true}).click();
      await host.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__;return P.state.hp>0&&P.actors.find(a=>a.slotId==='p2')?.hp>0&&P.status.phase==='playing';},null,{timeout:25000});
      await host.evaluate(()=>window.__HAPIL_STORY_RC51__?.close?.(false));
      await guest.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__;return P.state.hp>0&&P.actors.find(a=>a.slotId==='p2')?.hp>0;},null,{timeout:15000});
      const revived=await host.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return{zone:s.zone,host:{x:s.x,y:s.y,hp:s.hp,inspection:L.inspect(s,s)},remote:{x:a.x,y:a.y,hp:a.hp,inspection:L.inspect(s,a)},metrics:L.metrics(),warning:document.querySelector('#hapil-left-zone-warning-rc223')?.textContent??null,party:P.status};});
      assert.equal(revived.zone,'dist01','native checkpoint returns to the active combat map');assert(revived.host.hp>0&&revived.remote.hp>0);
      assert.equal(revived.host.inspection.elapsedSeconds,0);assert.equal(revived.host.inspection.ticks,0);assert.equal(revived.remote.inspection.elapsedSeconds,0);assert.equal(revived.remote.inspection.ticks,0);
      assert(revived.metrics.exits>=active.metrics.exits+2,'host and remote death/re-entry reset both native exposure clocks');
      assert.equal(revived.warning,null,'respawn removes the stale danger warning until a fresh exposed entry');
      await capture('left-zone-checkpoint-revived',host);await capture('left-zone-checkpoint-revived-guest',guest);
      return{staged,actorStage,active,lethal,waiting,revived,method:'real native Y and remote incoming reducers cause the down state; player selects native checkpoint; reset is verified on new live actors'};
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

    assert.deepEqual(report.errors,[],'browser page errors');assert.deepEqual(report.httpErrors,[],'HTTP errors');report.status='passed';
  }catch(error){failure=error;report.status=report.environment.officialChrome?'failed':'blocked';report.failure=error.stack||String(error);process.exitCode=1;}
  finally{
    report.finishedAt=new Date().toISOString();save();
    for(const context of contexts)await context.close().catch(()=>{});
    await browser?.close().catch(()=>{});if(relay)await relay.close();if(web)await new Promise(resolve=>web.close(resolve));server.close();
    console.log('RC223_LEFT_ZONE_BROWSER '+JSON.stringify({status:report.status,appSha,browserVersion:report.browserVersion,checks:report.checks.map(r=>({name:r.name,status:r.status})),captures:report.captures.length,results:path.join(out,'results.json'),failure:failure?String(failure.stack||failure):null}));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
