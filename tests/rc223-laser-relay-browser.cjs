'use strict';

// Native dist06 laser snapshot relay probe. This records the exact incoming
// cast and call-through native-apply result; it never changes validation.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const cp=require('node:child_process');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));

const root=path.resolve(__dirname,'..');
const out=path.resolve(process.env.HAPIL_QA_OUTPUT||'/tmp/rc223-laser-relay-browser');
fs.mkdirSync(out,{recursive:true});
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
const appSha=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
if(process.env.EXPECTED_SHA)assert.equal(appSha,process.env.EXPECTED_SHA);
const sourceFiles=['index.html','assets/index-v31526.js','assets/rc222/runtime.js','server/src/relay.js'];
const sourceHashes=Object.fromEntries(sourceFiles.map(f=>[f,sha256(fs.readFileSync(path.join(root,f)))]));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  let file;try{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(root,'.'+(p==='/'?'/index.html':p));}catch{return res.writeHead(400).end();}
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(file));}catch{return res.writeHead(404).end();}
});
const report={schema:1,status:'running',appSha,sourceFiles:sourceFiles.map(file=>({file,sha256:sourceHashes[file]})),
  method:'one fresh host/guest RC222 room, native dist06 entry with explicitly staged 15% boss HP/final-phase fields and dismissed pre-entry reader, real transition and native boss timers; receiver records the original Party.applySnapshot call-through result and raw laser cast without changing it',
  fixture:{zone:'dist06',bossId:'dist06-boss',bossHpRatio:.15,explicitFinalPhaseFields:3,expectedNativePhase:3,wait:'up to 30 simulation seconds or 60 wall seconds after peer transition',attackTimers:'left to the native QA map entry and game loop'},
  environment:{officialChrome:false,contexts:0,actualWebSocketRelay:false},pageErrors:[],httpErrors:[],requestFailures:[],hostCasts:[],receiver:{applyEvents:[],failedLaserApplications:[]}};
let browser,relay,host,guest,base,failure;
const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
async function makePage(label){
  const context=await browser.newContext({viewport:{width:1280,height:900}});report.environment.contexts++;
  const page=await context.newPage();page.setDefaultTimeout(20000);
  page.on('pageerror',e=>report.pageErrors.push({label,error:e.stack||e.message}));
  page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({label,url:r.url(),status:r.status()});});
  page.on('requestfailed',r=>report.requestFailures.push({label,url:r.url(),failure:r.failure()}));
  await page.goto(base+'/?qa=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__HAPIL_REMOTE_RC222__&&window.__HAPIL_REMOTE_RC222_RUNTIME__&&window.__HAPIL_PARTY_V31322__&&window.__HAPIL_NATIVE_ARENA_RC138__?.installed,null,{timeout:60000});
  await page.keyboard.press('Escape');return page;
}
async function connectRoom(){
  await host.locator('#rc222-create').click();await host.locator('#rc222-nickname').fill('laser-host');
  await host.locator('#rc222-settings').evaluate(n=>n.open=true);await host.locator('#rc222-endpoint').fill(report.relayURL);await host.locator('#rc222-connect').click();
  await host.waitForFunction(()=>window.__HAPIL_REMOTE_RC222__.status().connected,null,{timeout:15000});
  const code=await host.evaluate(()=>window.__HAPIL_REMOTE_RC222__.status().code);assert.match(code,/^[A-F0-9]{16}$/);
  await guest.locator('#rc222-join').click();await guest.locator('#rc222-nickname').fill('laser-guest');await guest.locator('#rc222-code').fill(code);
  await guest.locator('#rc222-settings').evaluate(n=>n.open=true);await guest.locator('#rc222-endpoint').fill(report.relayURL);await guest.locator('#rc222-connect').click();
  await guest.waitForFunction(()=>window.__HAPIL_REMOTE_RC222__.status().connected,null,{timeout:15000});await guest.locator('#rc222-ready').click();
  await host.waitForFunction(()=>window.__HAPIL_REMOTE_RC222__.status().roster.length===2&&window.__HAPIL_REMOTE_RC222__.status().roster[1].ready,null,{timeout:15000});
  await host.locator('#rc222-start').click();
  const playing=p=>p.waitForFunction(()=>{const t=window.__HAPIL_REMOTE_RC222__.status();return t.phase==='playing'&&window.__HAPIL_REMOTE_RC222_RUNTIME__.status().ready&&!t.stale;},null,{timeout:30000});
  await Promise.all([playing(host),playing(guest)]);
  await host.evaluate(()=>{window.__HAPIL_STORY_RC51__?.close?.(false);window.__HAPIL_CONTROLS_V31329__?.binding?.actions?.dismiss?.();window.__HAPIL_CONTROLS_V31329__?.setMode?.('manual');});
  await guest.evaluate(()=>{window.__HAPIL_STORY_RC51__?.close?.(false);window.__HAPIL_CONTROLS_V31329__?.binding?.actions?.dismiss?.();window.__HAPIL_REMOTE_RC222_RUNTIME__?.setAutoMode?.('manual');});
  await host.waitForFunction(()=>window.__HAPIL_REMOTE_RC222_RUNTIME__?.telemetry?.().actorSteps?.p2?.mode==='manual',null,{timeout:12000});
  return code;
}
async function main(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
  for(const file of sourceFiles){const r=await fetch(base+'/'+file);assert.equal(r.status,200);assert.equal(sha256(Buffer.from(await r.arrayBuffer())),sourceHashes[file],'served source hash '+file);}
  const relayModule=await import(pathToFileURL(path.join(root,'server/src/relay.js')).href);
  relay=await relayModule.start({port:0,host:'127.0.0.1',allowedOrigins:[new URL(base).origin]});
  report.relayURL='ws://127.0.0.1:'+relay.server.address().port+'/relay';
  const health=await fetch('http://127.0.0.1:'+relay.server.address().port+'/healthz');assert.equal(health.status,200);assert.equal((await health.json()).ok,true);report.environment.actualWebSocketRelay=true;
  browser=await chromium.launch({chromiumSandbox:true,channel:'chrome',headless:true,args:[]});report.environment.officialChrome=true;report.browserVersion=browser.version();
  host=await makePage('host');guest=await makePage('guest');report.roomCode=await connectRoom();
  const installed=await guest.evaluate(()=>{
    const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,L=window.__HAPIL_LASERS_V31330__,nativeApply=P?.applySnapshot,nativeSnapshot=R?.snapshot;
    if(typeof nativeApply!=='function'||typeof nativeSnapshot!=='function'||!L?.valid||!L?.stats)throw Error('laser, runtime snapshot, or native apply API missing');
    const metaSlot='__RC223_LASER_WIRE_META__',probe={installed:true,applyEvents:[],failedLaserApplications:[],transitions:[],restore:null};window.__RC223_LASER_RECEIVER_PROBE__=probe;
    R.snapshot=function(snap,meta={},...rest){const prior=window[metaSlot];window[metaSlot]={seq:meta?.seq??null,epoch:meta?.epoch??null,transition:meta?.transition===true};try{return nativeSnapshot.call(this,snap,meta,...rest);}finally{window[metaSlot]=prior;}};
    P.applySnapshot=function(snap,...args){
      const fields=snap?.world?.fields,laserEntries=Array.isArray(fields)?fields.filter(e=>Array.isArray(e)&&e[0]==='bossLaserCastsV31330'):[],raw=laserEntries[0]?.[1];
      const cloneList=list=>Array.isArray(list)?list.slice(0,8).map(c=>JSON.parse(JSON.stringify(c))):list??null;
      const casts=Array.isArray(raw)?cloneList(raw):[],statsBefore=L.stats(),meta=window[metaSlot]??null;
      const world=Object.fromEntries((Array.isArray(fields)?fields:[]).filter(e=>Array.isArray(e)&&e.length===2)),boss=Array.isArray(world.enemies)?world.enemies.find(e=>e?.id==='dist06-boss'):null;
      const profileFor=c=>{const rows=window.__HAPIL_LASERS_V31331__?.profiles?.get?.(c?.sourceId)??[];return Array.isArray(rows)?(rows.find(p=>p.key===c?.profileKeyV31332)||rows.find(p=>p.type===c?.type)||null):null;};
      const validFor=c=>{try{return L.valid(c,snap?.zone);}catch(e){return{error:String(e?.message??e)};}};
      const row={wireSeq:meta?.seq??null,wireEpoch:meta?.epoch??null,transition:meta?.transition??false,snapshotSeq:snap?.seq??null,zone:snap?.zone??null,laserFieldEntryCount:laserEntries.length,castCount:Array.isArray(raw)?raw.length:null,rawCastListTruncated:Array.isArray(raw)&&raw.length>8,rawLaserCasts:casts,rawLaserEntries:laserEntries.slice(0,4).map(e=>({count:Array.isArray(e[1])?e[1].length:null,truncated:Array.isArray(e[1])&&e[1].length>8,casts:cloneList(e[1])})),activeHeroId:world.activeHeroId??null,partyActors:(snap?.party?.actors??[]).slice(0,8).map(a=>({slotId:a.slotId,heroId:a.heroId,hp:a.hp,maxHp:a.maxHp})),
        castOwners:casts.map(c=>{const owner=Array.isArray(world.enemies)?world.enemies.find(e=>e?.id===c?.sourceId):null;return{sourceId:c?.sourceId??null,owner:owner?{id:owner.id,hp:owner.hp,maxHp:owner.maxHp,phase:(()=>{try{return window.__HAPIL_RC86_BRIDGE__?.phase?.(owner)??null;}catch(e){return{error:String(e?.message??e)};}})(),attackAt:owner.attackAt,readyAt:owner.readyAt,recoverUntil:owner.recoverUntil}:null,profile:profileFor(c)};}),
        validResults:casts.map(c=>({id:c?.id??null,sourceId:c?.sourceId??null,valid:validFor(c),ownerConfig:JSON.parse(JSON.stringify((L.owners??[]).find(owner=>owner.id===c?.sourceId)??null)),policyValid:window.__HAPIL_BOSS_POLICY_RC175__?.validMode?.(c)??null,profileKey:c?.profileKeyV31332??null,profile:profileFor(c)})),bossOwner:boss?{id:boss.id,hp:boss.hp,maxHp:boss.maxHp,phase:(()=>{try{return window.__HAPIL_RC86_BRIDGE__?.phase?.(boss)??null;}catch(e){return{error:String(e?.message??e)};}})(),attackAt:boss.attackAt,readyAt:boss.readyAt,recoverUntil:boss.recoverUntil}:null,
        lasersBefore:statsBefore,nativeRejectedBefore:P.telemetry?.().rejected??null};
      let result,error;try{result=nativeApply.call(this,snap,...args);return result;}catch(e){error=e;throw e;}finally{
        row.applyAccepted=!error&&result!==false;row.applyResult=error?'threw':result===false?false:result===true?true:(result??null);row.thrown=error?String(error.stack||error).slice(0,1200):null;
        row.lasersAfter=L.stats();row.nativeRejectedAfter=P.telemetry?.().rejected??null;
        if(casts.length||result===false){if(probe.applyEvents.length>=40)probe.applyEvents.shift();probe.applyEvents.push(row);}
        if(casts.length&&result===false){if(probe.failedLaserApplications.length>=6)probe.failedLaserApplications.shift();probe.failedLaserApplications.push(row);}
        if(meta?.transition){if(probe.transitions.length>=4)probe.transitions.shift();probe.transitions.push({wireSeq:meta.seq??null,wireEpoch:meta.epoch??null,zone:snap?.zone??null,castCount:Array.isArray(raw)?raw.length:null,accepted:!error&&result!==false,thrown:row.thrown});}
      }
    };
    probe.restore=()=>{if(P.applySnapshot===probe.wrappedApply)P.applySnapshot=nativeApply;if(R.snapshot===probe.wrappedSnapshot)R.snapshot=nativeSnapshot;return{applyRestored:P.applySnapshot===nativeApply,snapshotRestored:R.snapshot===nativeSnapshot};};
    probe.wrappedApply=P.applySnapshot;probe.wrappedSnapshot=R.snapshot;
    return{installed:true,callThrough:true,lasersInstalled:L.installed,applyWritable:Object.getOwnPropertyDescriptor(P,'applySnapshot')?.writable===true,snapshotWritable:Object.getOwnPropertyDescriptor(R,'snapshot')?.writable===true};
  });
  assert.equal(installed.installed,true);assert.equal(installed.callThrough,true);assert.equal(report.environment.contexts,2);report.receiver.instrumentation=installed;
  const stage=await host.evaluate(()=>{
    const P=window.__HAPIL_PARTY_V31322__,s=P?.state,result=window.__MONGSE_QA_API__?.stageV3128BossShowcase?.('dist06');
    if(!result?.pass||result.bossId!=='dist06-boss')throw Error('native dist06 QA entry failed '+JSON.stringify(result));
    const current=P.state,C=window.__HAPIL_CONTROLS_V31329__;window.__HAPIL_STORY_RC51__?.suppressEntry?.(current);window.__HAPIL_STORY_RC51__?.close?.(false);window.__HAPIL_STORY_RC51__?.beforeFrame?.(current,{blocked:false,clear:false,sound:false});window.__HAPIL_STORY_RC51__?.close?.(false);C.binding.actions.dismiss();C.binding.modal.current=null;C.setMode('manual');Object.assign(current,{paused:false,pause:false,encounterLockUntil31226:0,encounterWallUnlockAtV31227:0,encounterDialogue31226:null,timeStopUntil:0});
    const boss=P.state.enemies.find(e=>e.id==='dist06-boss');if(!boss||!(boss.maxHp>0))throw Error('staged native boss missing maximum HP');
    boss.hp=boss.maxHp*.15;boss.currentPhase=3;boss.phaseIndex=3;
    return{result,zone:P.state.zone,time:P.state.time,boss:{id:boss.id,hp:boss.hp,maxHp:boss.maxHp,hpRatio:boss.hp/boss.maxHp,phase:window.__HAPIL_RC86_BRIDGE__?.phase?.(boss)??null,phaseCount:boss.phaseCount,attackAt:boss.attackAt,readyAt:boss.readyAt,recoverUntil:boss.recoverUntil},nativeTimersUnchangedByFixture:true};
  });
  report.fixture.staged=stage;assert.equal(stage.zone,'dist06');assert.equal(stage.boss.id,'dist06-boss');assert(Math.abs(stage.boss.hpRatio-.15)<1e-10);assert.equal(stage.boss.phase,3,'explicit final-phase fields and 15% boss HP match the retained failing relay scenario');
  const transition=await host.evaluate(()=>window.__HAPIL_REMOTE_RC222__?.publishTransition?.('dist06'));
  assert.equal(transition,true,'host published the actual native dist06 transition');
  await Promise.all([host,guest].map(p=>p.waitForFunction(()=>window.__HAPIL_PARTY_V31322__?.state?.zone==='dist06'&&window.__HAPIL_REMOTE_RC222__.status().phase==='playing'&&!window.__HAPIL_REMOTE_RC222__.status().stale,null,{timeout:30000})));
  const entered=await Promise.all([host,guest].map(p=>p.evaluate(()=>({time:window.__HAPIL_PARTY_V31322__.state.time,epoch:window.__HAPIL_REMOTE_RC222__.status().epoch,zone:window.__HAPIL_PARTY_V31322__.state.zone}))));
  report.fixture.entered={host:entered[0],guest:entered[1]};assert.equal(entered[0].epoch,entered[1].epoch,'both peers completed the same network epoch transition');assert.equal(entered[1].zone,'dist06');
  await host.evaluate(()=>{
    const probe={seen:new Set(),events:[],timer:null};window.__RC223_LASER_HOST_PROBE__=probe;
    const sample=()=>{const P=window.__HAPIL_PARTY_V31322__,s=P?.state,L=window.__HAPIL_LASERS_V31330__;if(!s||s.zone!=='dist06')return;
      for(const c of s.bossLaserCastsV31330??[]){const key=String(c.id)+'/'+String(c.sourceId);if(probe.seen.has(key))continue;probe.seen.add(key);
        const owner=(s.enemies??[]).find(e=>e.id===c.sourceId),profiles=window.__HAPIL_LASERS_V31331__?.profiles?.get?.(c.sourceId)??[],profile=profiles.find(p=>p.key===c.profileKeyV31332)||profiles.find(p=>p.type===c.type)||null;
        const event={at:s.time,zone:s.zone,wireSeq:null,rawLaserCast:JSON.parse(JSON.stringify(c)),valid:L.valid(c,s.zone),ownerConfig:JSON.parse(JSON.stringify((L.owners??[]).find(row=>row.id===c.sourceId)??null)),laserStats:L.stats(),bossOwner:owner?{id:owner.id,hp:owner.hp,maxHp:owner.maxHp,phase:window.__HAPIL_RC86_BRIDGE__?.phase?.(owner)??null,attackAt:owner.attackAt,readyAt:owner.readyAt,recoverUntil:owner.recoverUntil}:null,profile};
        if(probe.events.length<12)probe.events.push(event);
      }
    };sample();probe.timer=setInterval(sample,80);
  });
  const startedWall=Date.now();let waitResult='sim-30';
  try{await host.waitForFunction(start=>{const s=window.__HAPIL_PARTY_V31322__?.state;return s?.zone==='dist06'&&s.time>=start+30;},entered[0].time,{timeout:60000,polling:100});}
  catch{waitResult='wall-60';}
  report.fixture.wait={result:waitResult,wallMs:Date.now()-startedWall,hostTime:await host.evaluate(()=>window.__HAPIL_PARTY_V31322__?.state?.time??null),guestTime:await guest.evaluate(()=>window.__HAPIL_PARTY_V31322__?.state?.time??null)};
  report.hostCasts=await host.evaluate(()=>{const p=window.__RC223_LASER_HOST_PROBE__,P=window.__HAPIL_PARTY_V31322__,s=P?.state;clearInterval(p?.timer);return{events:p?.events??[],laserStats:window.__HAPIL_LASERS_V31330__?.stats?.()??null,liveCasts:(s?.bossLaserCastsV31330??[]).map(c=>JSON.parse(JSON.stringify(c))),boss:s?.enemies?.find(e=>e.id==='dist06-boss')?{hp:s.enemies.find(e=>e.id==='dist06-boss').hp,maxHp:s.enemies.find(e=>e.id==='dist06-boss').maxHp,phase:window.__HAPIL_RC86_BRIDGE__?.phase?.(s.enemies.find(e=>e.id==='dist06-boss'))}:null};});
  report.receiver.final=await guest.evaluate(()=>{const T=window.__HAPIL_REMOTE_RC222__,P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,L=window.__HAPIL_LASERS_V31330__,q=window.__RC223_LASER_RECEIVER_PROBE__;
    return{transport:T?.status?.()??null,partyStatus:P?.status??null,partyTelemetry:P?.telemetry?.()??null,runtimeStatus:R?.status?.()??null,runtimeTelemetry:R?.telemetry?.()??null,laserStats:L?.stats?.()??null,
      applyEvents:q?.applyEvents??[],failedLaserApplications:q?.failedLaserApplications??[],transitions:q?.transitions??[]};});
  report.receiver.transitionEvidence=report.receiver.final.transitions;
  assert(report.receiver.transitionEvidence.some(e=>e.accepted&&e.zone==='dist06'&&e.wireEpoch===entered[1].epoch),'guest accepted the real dist06 transition in the host epoch');
  const guestStatus=report.receiver.final.transport,partyStats=report.receiver.final.partyTelemetry,laserStats=report.receiver.final.laserStats,runtimeStats=report.receiver.final.runtimeTelemetry;
  assert(report.hostCasts.events.some(e=>e.rawLaserCast?.sourceId==='dist06-boss'&&e.valid),'native dist06 boss produced a valid laser cast; raw host evidence is in results.json');
  assert(report.receiver.final.applyEvents.some(e=>e.applyAccepted&&e.rawLaserCasts?.some(c=>c.sourceId==='dist06-boss')&&e.validResults?.some(v=>v.sourceId==='dist06-boss'&&v.valid)),'guest native apply accepted a valid raw dist06 boss laser cast');
  assert.equal(guestStatus?.connected,true,'guest relay connection remains live');assert.equal(guestStatus?.phase,'playing','guest remains in the same playing room');assert.equal(guestStatus?.stale,false,'guest snapshots remain current');
  assert.equal(partyStats?.rejected,0,'native Party snapshot receiver reports no rejected snapshot');assert.equal(laserStats?.rejectedSnapshots,0,'laser snapshot validator reports no rejection');assert.equal(runtimeStats?.rejected,0,'runtime reports no rejected snapshot');
  assert.notEqual(runtimeStats?.lastSnapshotRejection?.reason,'native-apply','runtime did not reject an incoming native snapshot');assert.equal(report.receiver.final.failedLaserApplications.length,0,'no raw laser-bearing snapshot was rejected by native apply');
  assert.deepEqual(report.pageErrors,[],'no browser page errors');assert.deepEqual(report.httpErrors,[],'no HTTP errors');
  const probeRestored=await guest.evaluate(()=>window.__RC223_LASER_RECEIVER_PROBE__?.restore?.()??null);report.receiver.restored=probeRestored;assert.equal(probeRestored?.applyRestored,true);assert.equal(probeRestored?.snapshotRestored,true);
  report.status='passed';
}
(async()=>{
  try{await main();}
  catch(e){failure=e;report.status=report.environment.officialChrome?'failed':'blocked';report.failure=e.stack||String(e);process.exitCode=1;
    try{if(guest)report.failureDiagnostics=await guest.evaluate(()=>({transport:window.__HAPIL_REMOTE_RC222__?.status?.()??null,party:window.__HAPIL_PARTY_V31322__?.telemetry?.()??null,runtime:window.__HAPIL_REMOTE_RC222_RUNTIME__?.telemetry?.()??null,lasers:window.__HAPIL_LASERS_V31330__?.stats?.()??null,probe:window.__RC223_LASER_RECEIVER_PROBE__?{applyEvents:window.__RC223_LASER_RECEIVER_PROBE__.applyEvents,failedLaserApplications:window.__RC223_LASER_RECEIVER_PROBE__.failedLaserApplications}:null}));}catch{}
    try{if(host)report.failureHostEvidence=await host.evaluate(()=>({status:window.__HAPIL_REMOTE_RC222__?.status?.()??null,party:window.__HAPIL_PARTY_V31322__?.telemetry?.()??null,lasers:window.__HAPIL_LASERS_V31330__?.stats?.()??null,probe:window.__RC223_LASER_HOST_PROBE__?.events??[]}));}catch{}
  }
  finally{report.finishedAt=new Date().toISOString();save();await guest?.context().close().catch(()=>{});await host?.context().close().catch(()=>{});await browser?.close().catch(()=>{});if(relay)await relay.close();server.close();
    const evidence=JSON.stringify(report);for(let offset=0,part=0;offset<evidence.length;offset+=6000,part++)console.log('RC223_LASER_RELAY_EVIDENCE '+JSON.stringify({part,data:evidence.slice(offset,offset+6000)}));
    console.log('RC223_LASER_RELAY_BROWSER '+JSON.stringify({status:report.status,appSha,browserVersion:report.browserVersion,roomCode:report.roomCode,wait:report.fixture.wait,hostCastCount:report.hostCasts?.events?.length??0,acceptedCastSnapshots:report.receiver?.final?.applyEvents?.filter(e=>e.castCount>0&&e.applyAccepted).length??0,failedLaserApplications:report.receiver?.final?.failedLaserApplications??report.failureDiagnostics?.probe?.failedLaserApplications??[],results:path.join(out,'results.json'),failure:failure?String(failure.stack||failure):null}));
  }
})();
