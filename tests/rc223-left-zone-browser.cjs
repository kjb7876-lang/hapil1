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
  scope:'Actual RC138 dist01 floor union, RC223 host, remote, and local P2 frames, real remote keyboard movement, native local PARTY.setInput movement/strike, native incoming damage, and native checkpoint re-entry in official Chrome with a loopback two-context WebSocket relay. Positions and selected HP fixtures are staged.',
  limitations:[
    'Official Chrome contexts share one local loopback relay; this is not a physical four-network deployment.',
    'No physical phone or GPU coverage is included.',
    'Player positions and enemy readiness are staged to isolate native geometry and timers; movement, frame ticks, incoming reducers, co-op ownership, and checkpoint selection remain production paths.',
    'The checkpoint cleanup case stages both actors at 1 HP before applying real native incoming reducers; it does not claim a naturally reached lethal encounter.',
    'The local P2 case uses an isolated fresh native campaign, calls PARTY.configure for local2, stages actor/enemy coordinates and HP for repeatable probes, and injects local input through PARTY.setInput. It does not claim physical keyboard play for P2.',
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
async function startLocalGame(page){
  await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
  await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
  await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game'&&!!window.__HAPIL_CONTROLS_V31329__.binding.state.current,null,{timeout:30000});
  for(let i=0;i<22&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(70);}
  await page.evaluate(()=>{const C=window.__HAPIL_CONTROLS_V31329__;window.__HAPIL_STORY_RC51__?.close?.(false);C.binding.actions.dismiss();C.setMode('manual');});
  await page.locator('.game-stage canvas').waitFor({state:'visible'});
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
      // while this actor was exposed. Start an independent DOT sample by
      // exiting through the real host frame, confirming cleanup metrics, then
      // re-entering before taking the zero-tick baseline.
      const prior=await actorEvidence(host,'p2'),safeStage=await stageActor(host,'p2',{x:22,y:24});
      await host.waitForFunction(baseExits=>{const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return a&&R.contains({x:a.x,y:a.y},R.side(s,true),.8)&&L.metrics().exits>baseExits;},prior.metrics.exits,{timeout:10000});
      const cleared=await actorEvidence(host,'p2');assert.equal(cleared.inspection.exposed,false);assert.equal(cleared.inspection.elapsedSeconds,0);assert.equal(cleared.inspection.ticks,0);assert(cleared.metrics.exits>prior.metrics.exits,'native host actorFrame clears the earlier remote exposure clock before a new DOT sample');
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
      return{prior,safeStage,cleared,reentry,before,firstTick,after,afterGuest,remoteExitStart,exited,metricsDelta:{entries:after.metrics.entries-metricsBefore.entries,damageApplied:after.metrics.damageApplied-metricsBefore.damageApplied,exits:exited.metrics.exits-after.metrics.exits},method:'host RC222 actorFrame owns the 2s and 3s remote DOT events; guest reads geometry only; real ArrowLeft input exits into old admitted half'};
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
    await startLocalGame(localPage);
    await check('local-p2-party-frame-dot-strike-and-cleanup',localPage,async()=>{
      const setup=await localPage.evaluate(()=>{
        const C=window.__HAPIL_CONTROLS_V31329__,P=window.__HAPIL_PARTY_V31322__,N=window.__HAPIL_RC133_NATIVE__,R=window.__HAPIL_BATTLE_ARENA_RC138__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state??C.binding.state.current;
        if(C.binding.phase!=='game'||!s||s.hp<=0)throw Error('fresh native campaign is not live before local P2 setup');
        window.__HAPIL_STORY_RC51__?.suppressEntry?.(s);const nativeEntry=N.enter(s,'dist01',false);s.zone='dist01';
        window.__HAPIL_STORY_RC51__?.close?.(false);C.binding.actions.dismiss();C.binding.modal.current=null;C.setMode('manual');
        s.paused=false;s.pause=false;s.timeStopUntil=0;s.encounterDialogue31226=null;s.encounterLockUntil31226=0;s.encounterWallUnlockAtV31227=0;
        for(const q of ['pendingHits','hostileProjectiles','impactQueue','telekineticCasts','spatialRiftCasts','narrativeCasts'])if(Array.isArray(s[q]))s[q]=[];
        const hostHero=s.activeHeroId||'hwando',configuration=P.configure({mode:'local2',roster:[{slotId:'p1',heroId:hostHero,control:'host'},{slotId:'p2',heroId:'gunner',control:'local'}]}),actor=P.actors.find(a=>a.slotId==='p2');
        if(!actor||actor.control!=='local')throw Error('native PARTY.configure did not create a local P2 actor');
        s.x=22;s.y=24;s.moveVx=s.moveVy=s.moveDx=s.moveDy=0;s.invulnerableUntil=s.time+120;
        actor.x=22;actor.y=24;actor.hp=actor.maxHp=s.maxHp;actor.invulnerableUntil=s.time;actor.moveVx=actor.moveVy=actor.moveDx=actor.moveDy=0;actor.target=null;actor.targetEnemyId=null;actor.path=[];actor.lastDodgeAt=-99;actor.readyAt=s.time;actor.skillReady=[s.time,s.time,s.time];actor.ultimateReady=s.time;
        actor.heroMotion={kind:'idle',started:s.time,until:s.time,dx:0,dy:0,facing:1};
        const target=s.enemies.find(e=>e.hp>0&&!e.boss&&!e.midboss&&!e.visualOnly&&!e.protectedNarrativeTargetV31307);
        if(!target)throw Error('dist01 native map has no ordinary combat target for local P2 strike');
        for(const enemy of s.enemies){enemy.readyAt=s.time+120;enemy.patternReadyAt=s.time+120;enemy.themedOrdnanceAt=s.time+120;enemy.themedSummonAt=s.time+120;enemy.movingUntil=s.time+120;enemy.moveDx=enemy.moveDy=enemy.moveVx=enemy.moveVy=0;if(enemy!==target)enemy.invulnerableUntil=s.time+120;}
        target.x=24;target.y=24;target.invulnerableUntil=s.time-1;target.phaseTransitionActive=false;target.phaseTransitionUntil=0;
        const point={x:15,y:14};
        return{nativeEntry,zone:s.zone,phase:C.binding.phase,hostHero,configuration,party:P.status,actor:{slotId:actor.slotId,heroId:actor.heroId,control:actor.control,x:actor.x,y:actor.y,hp:actor.hp,maxHp:actor.maxHp},target:{id:target.id,hp:target.hp,maxHp:target.maxHp,boss:!!target.boss,midboss:!!target.midboss},openFloor:{physicalAll:R.contains(point,'all',.8),previousSide:R.contains(point,R.side(s,true),.8),allowed:L.allowed(s,actor,point,.8),canMove:L.canMove(s,actor,point,.8),inRegion:L.regionAt(s,actor,point),exposed:L.exposed(s,actor,point)},npcNeutral:{isPlayer:R.player(s,target),inRegion:L.regionAt(s,target,point),exposed:L.exposed(s,target,point),factors:L.factors(s,target)},hooks:L.hooks};
      });
      assert.equal(setup.phase,'game');assert.equal(setup.zone,'dist01');assert.equal(setup.party.mode,'local2');assert.equal(setup.party.enabled,true);assert.equal(setup.party.role,'offline');
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
        return{unavailable:!a||!target,slot:a?.slotId,control:a?.control,actor:{x:a?.x,y:a?.y,hp:a?.hp,readyAt:a?.readyAt},target:target&&{id:target.id,x:target.x,y:target.y,hp:target.hp,maxHp:target.maxHp},queued:(()=>{if(!a||!target)return false;target.x=point.x;target.y=point.y;target.hp=target.maxHp;a.readyAt=s.time;a.skillReady=[s.time,s.time,s.time];a.ultimateReady=s.time;a.facing=1;a.direction='right';a.heroMotion={kind:'idle',started:s.time,until:s.time,dx:point.x-a.x,dy:point.y-a.y,facing:1};return P.debug.attack(s,a,'A');})(),observationStart:window.__RC223_LOCAL_OUTGOING_PROBE__.observations.length,hpBefore:target?.hp};
      },{point});

      await localPage.evaluate(targetId=>{window.__RC223_LOCAL_TARGET_ID__=targetId;},setup.target.id);
      const safeStrike=await stageLocalStrike({x:24,y:24});
      assert.equal(safeStrike.unavailable,false);assert.equal(safeStrike.slot,'p2');assert.equal(safeStrike.control,'local');assert.equal(safeStrike.queued,true,'native PARTY.debug.attack queues a real Party strike for local P2 in the old admitted area');
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
      assert.equal(exposedStrike.queued,true,'local P2 queues a second real native strike while exposed');
      await localPage.waitForFunction(({targetId,before,index})=>{const P=window.__HAPIL_PARTY_V31322__,obs=window.__RC223_LOCAL_OUTGOING_PROBE__?.observations??[],target=P.state.enemies.find(e=>e.id===targetId);return target?.hp<before&&obs.slice(index).some(row=>row.ownerSlot==='p2');},{targetId:setup.target.id,before:exposedStrike.hpBefore,index:exposedStrike.observationStart},{timeout:15000});
      const exposedOutgoing=await localPage.evaluate(({targetId,index})=>{const P=window.__HAPIL_PARTY_V31322__,target=P.state.enemies.find(e=>e.id===targetId);return{targetHp:target.hp,rows:window.__RC223_LOCAL_OUTGOING_PROBE__.observations.slice(index),scopeAfter:P.outgoingActor};},{targetId:setup.target.id,index:exposedStrike.observationStart});
      assert(exposedOutgoing.targetHp<exposedStrike.hpBefore,'exposed local Party strike deals real native damage');assert(exposedOutgoing.rows.length>0);for(const row of exposedOutgoing.rows){assert.equal(row.ownerSlot,'p2');assert.equal(row.heroId,'gunner');assert(Math.abs(row.ratio-.9)<1e-9,'actual Party applyStrike scope selects the local P2 0.9 multiplier rather than the host factor');}assert.equal(exposedOutgoing.scopeAfter,null);
      await capture('left-zone-local-p2-exposed',localPage);

      const movementStart=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return{x:a.x,y:a.y,time:s.time};});
      const movement=await localPage.evaluate(async({start})=>{
        const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2'),R=window.__HAPIL_BATTLE_ARENA_RC138__;let seq=0,stopped=false,frames=0;const send=()=>{if(stopped)return;P.setInput('p2',{seq:++seq,moveX:-1,moveY:0,aimX:start.x-6,aimY:start.y,actions:{},cancelActions:true});};
        const oldSide=()=>R.contains({x:a.x,y:a.y},R.side(s,true),.8);send();const timer=setInterval(send,120),begin=performance.now(),deadline=begin+12000;
        try{while(performance.now()<deadline&&!oldSide()){await new Promise(resolve=>requestAnimationFrame(resolve));frames++;if(P.state!==s||!P.actors.includes(a))throw Error('native local2 actor/world changed during held P2 input');}return{start,end:{x:a.x,y:a.y,time:s.time,hp:a.hp},simSeconds:s.time-start.time,wallMs:performance.now()-begin,frames,lastInputSeq:seq,previouslyAllowed:oldSide(),exposed:window.__HAPIL_LEFT_ZONE_NATIVE_RC223__.inspect(s,a).exposed,inspection:window.__HAPIL_LEFT_ZONE_NATIVE_RC223__.inspect(s,a),method:'PARTY.setInput held in manual local2 mode and consumed by the native PARTY.tick path'};}finally{stopped=true;clearInterval(timer);P.setInput('p2',{seq:++seq,moveX:0,moveY:0,aimX:a.x,aimY:a.y,actions:{},cancelActions:true});}
      },{start:movementStart});
      assert(movement.end.x<movementStart.x-.5,'native local PARTY.setInput moves P2 through the actual local tick');assert.equal(movement.previouslyAllowed,true,'held local P2 input crosses into the previously admitted half');assert.equal(movement.exposed,false);
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
        return{accepted,hp:a.hp,downUntil:a.downUntil,before,metrics:L.metrics(),source,method:'staged HP=1 followed by native PARTY.debug.allyDamage'};
      });
      assert.equal(death.accepted,true,'native PARTY ally reducer accepts lethal incoming for local P2');assert(death.hp<=0,'native incoming reducer downs the explicitly staged local actor');
      await localPage.waitForFunction(baseExits=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,a=P.actors.find(q=>q.slotId==='p2');return a&&a.hp<=0&&L.metrics().exits>baseExits;},death.metrics.exits,{timeout:8000});
      const dead=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,a=P.actors.find(q=>q.slotId==='p2'),metrics=L.metrics();return{hp:a.hp,metrics,inspection:L.inspect(P.state,a)};});
      assert.equal(dead.inspection.exposed,false);assert.equal(dead.inspection.elapsedSeconds,0);assert.equal(dead.inspection.ticks,0);assert(dead.metrics.exits>death.metrics.exits,'native PARTY tick increments exit cleanup before readout can inspect the dead actor');

      await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');a.hp=a.maxHp;s.hp=Math.max(s.hp,1);P.configure({mode:'local2',roster:[{slotId:'p1',heroId:s.activeHeroId,control:'host'},{slotId:'p2',heroId:'gunner',control:'local'}]});});
      const removalStage=await stageActor(localPage,'p2',{x:15,y:14});
      await localPage.waitForFunction(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,a=P.actors.find(q=>q.slotId==='p2');return a&&L.inspect(P.state,a).elapsedSeconds>0;},null,{timeout:8000});
      const beforeRemoval=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,a=P.actors.find(q=>q.slotId==='p2');return{actor:{slotId:a.slotId,control:a.control,x:a.x,y:a.y,hp:a.hp},inspection:L.inspect(s,a),metrics:L.metrics()};});
      const removal=await localPage.evaluate(()=>{const P=window.__HAPIL_PARTY_V31322__,L=window.__HAPIL_LEFT_ZONE_NATIVE_RC223__,s=P.state,oldActor=P.actors.find(q=>q.slotId==='p2'),metricsBefore=L.metrics(),result=P.configure({mode:'solo',roster:[{slotId:'p1',heroId:s.activeHeroId,control:'host'}]}),metricsAfter=L.metrics(),removed=!P.actors.some(a=>a.slotId==='p2'),oldActorInspection=L.inspect(s,oldActor);return{result,removed,oldActorInspection,metricsBefore,metricsAfter,mode:P.status.mode,roster:P.roster};});
      assert.equal(removal.removed,true);assert.equal(removal.mode,'solo');assert.equal(removal.roster.length,1);assert(removal.metricsAfter.exits>removal.metricsBefore.exits,'native PARTY.configure increments cleanup before readout inspects the departed local actor');assert.equal(removal.oldActorInspection.exposed,false);assert.equal(removal.oldActorInspection.elapsedSeconds,0);assert.equal(removal.oldActorInspection.ticks,0);
      await capture('left-zone-local-p2-roster-removed',localPage);
      return{setup,localStage,probe,safeStrike,safeOutgoing,exposedStage,exposed,safeDotStage,safeDot,dotReentry,dotStart,firstLocalTick,noDuplicate,exposedStrike,exposedOutgoing,movementStart,movement,exited,reenter,death,dead,removalStage,beforeRemoval:{inspection:beforeRemoval.inspection,metrics:beforeRemoval.metrics},removal,scope:'isolated fresh campaign; native PARTY.configure local2 roster, staged dist01 actor/target coordinates, PARTY.setInput movement, actual Party tick DOT and Party applyStrike target damage, native ally reducer lethality; no physical P2 keyboard claim'};
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
