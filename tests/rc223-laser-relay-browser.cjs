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
  method:'one fresh host/guest RC222 room, native dist06 entry with explicitly staged 15% boss HP/final-phase fields and dismissed pre-entry reader, real transition and native boss timers; host export/send and guest transport/runtime/Party apply probes are call-through only',
  fixture:{zone:'dist06',bossId:'dist06-boss',bossHpRatio:.15,explicitFinalPhaseFields:3,expectedNativePhase:3,wait:'bounded 180 wall seconds: host advances 30 simulation seconds and guest advances past the first native cast endAt',attackTimers:'left to the native QA map entry and game loop'},
  environment:{officialChrome:false,contexts:0,actualWebSocketRelay:false},pageErrors:[],httpErrors:[],requestFailures:[],hostCasts:[],hostSnapshots:{exportEvents:[],wireEvents:[]},receiver:{applyEvents:[],failedLaserApplications:[],runtimeSnapshotEvents:[],wireEvents:[],rejectEvents:[]}};
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
    const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,T=window.__HAPIL_REMOTE_RC222__,L=window.__HAPIL_LASERS_V31330__,nativeApply=P?.applySnapshot,nativeSnapshot=R?.snapshot,nativeTransportApply=T?.applySnapshot;
    if(typeof nativeApply!=='function'||typeof nativeSnapshot!=='function'||typeof nativeTransportApply!=='function'||!L?.valid||!L?.stats)throw Error('laser, transport, runtime snapshot, or native apply API missing');
    const metaSlot='__RC223_LASER_WIRE_META__',probe={installed:true,applyEvents:[],failedLaserApplications:[],runtimeSnapshotEvents:[],wireEvents:[],rejectEvents:[],transitions:[],restore:null};window.__RC223_LASER_RECEIVER_PROBE__=probe;
    const bounded=(list,row,max=60)=>{if(list.length>=max)list.shift();list.push(row);};
    const cloneList=list=>Array.isArray(list)?list.slice(0,8).map(c=>JSON.parse(JSON.stringify(c))):list??null;
    const inspectSnap=(snap,meta={})=>{
      const fields=snap?.world?.fields,laserEntries=Array.isArray(fields)?fields.filter(e=>Array.isArray(e)&&e[0]==='bossLaserCastsV31330'):[],raw=laserEntries[0]?.[1],casts=Array.isArray(raw)?cloneList(raw):[];
      const world=casts.length?Object.fromEntries((Array.isArray(fields)?fields:[]).filter(e=>Array.isArray(e)&&e.length===2)):null,fieldBytes=casts.length?(Array.isArray(fields)?fields:[]).filter(e=>Array.isArray(e)&&e.length===2).map(([key,value])=>{let bytes=0;try{bytes=JSON.stringify(value)?.length??0;}catch{}return{key,bytes};}).sort((a,b)=>b.bytes-a.bytes).slice(0,5):[];
      const castPhases=casts.map(c=>{const fireAt=Number(c?.fireAt),activeUntil=fireAt+Number(c?.activeSeconds),worldTime=Number(world.time);return{id:c?.id??null,sourceId:c?.sourceId??null,worldTime:Number.isFinite(worldTime)?worldTime:null,fireAt:Number.isFinite(fireAt)?fireAt:null,activeUntil:Number.isFinite(activeUntil)?activeUntil:null,phase:Number.isFinite(worldTime)&&Number.isFinite(fireAt)&&Number.isFinite(activeUntil)?worldTime<fireAt?'warning':worldTime<activeUntil?'active':'post-active':'unknown'};});
      let snapshotJsonBytes=null;if(casts.length)try{const json=JSON.stringify(snap);snapshotJsonBytes=json===undefined?null:new TextEncoder().encode(json).byteLength;}catch{}
      return{wireSeq:meta?.seq??null,wireEpoch:meta?.epoch??null,transition:meta?.transition===true,snapshotSeq:snap?.seq??null,zone:snap?.zone??null,worldTime:Number.isFinite(Number(world?.time))?Number(world.time):null,worldHp:Number.isFinite(Number(world?.hp))?Number(world.hp):null,worldMaxHp:Number.isFinite(Number(world?.maxHp))?Number(world.maxHp):null,laserFieldEntryCount:laserEntries.length,castCount:Array.isArray(raw)?raw.length:null,rawCastListTruncated:Array.isArray(raw)&&raw.length>8,rawLaserCasts:casts,rawLaserEntries:laserEntries.slice(0,4).map(e=>({count:Array.isArray(e[1])?e[1].length:null,truncated:Array.isArray(e[1])&&e[1].length>8,casts:cloneList(e[1])})),castPhases,snapshotJsonBytes,top5WorldFieldJsonLengths:fieldBytes,activeHeroId:world?.activeHeroId??null,partyActors:casts.length?(snap?.party?.actors??[]).slice(0,8).map(a=>({slotId:a.slotId,heroId:a.heroId,hp:a.hp,maxHp:a.maxHp})):[]};
    };
    R.snapshot=function(snap,meta={},...rest){
      const prior=window[metaSlot],entry=inspectSnap(snap,meta),rejectedBefore=R.telemetry?.().rejected??null;window[metaSlot]={seq:meta?.seq??null,epoch:meta?.epoch??null,transition:meta?.transition===true};
      let result,error;try{result=nativeSnapshot.call(this,snap,meta,...rest);return result;}catch(e){error=e;throw e;}finally{
        const rejection=R.telemetry?.().lastSnapshotRejection??null,row={...entry,stage:'runtime-snapshot',entry:{seq:entry.wireSeq,epoch:entry.wireEpoch,transition:entry.transition,zone:entry.zone,worldTime:entry.worldTime,worldHp:entry.worldHp,worldMaxHp:entry.worldMaxHp,castCount:entry.castCount,rawLaserCasts:entry.rawLaserCasts,snapshotJsonBytes:entry.snapshotJsonBytes,top5WorldFieldJsonLengths:entry.top5WorldFieldJsonLengths},outcome:{accepted:!error&&result!==false,result:error?'threw':result===false?false:result===true?true:(result??null),thrown:error?String(error.stack||error).slice(0,1200):null,rejectedBefore,rejectedAfter:R.telemetry?.().rejected??null,lastSnapshotRejection:rejection}};
        if(entry.castCount>0||error||result===false){bounded(probe.runtimeSnapshotEvents,row);if(error||result===false||(R.telemetry?.().rejected??0)>Number(rejectedBefore??0))bounded(probe.rejectEvents,{stage:'runtime-snapshot',...row.outcome,wireSeq:entry.wireSeq,wireEpoch:entry.wireEpoch,zone:entry.zone,castCount:entry.castCount,rawLaserCasts:entry.rawLaserCasts});}
        window[metaSlot]=prior;
      }
    };
    T.applySnapshot=async function(message,transition){
      const snap=message?.snapshot,entry=inspectSnap(snap,{seq:message?.seq,epoch:message?.epoch,transition:transition===true}),receivedBefore=this.receivedSeq,runtimeCountBefore=probe.runtimeSnapshotEvents.length,rejectedBefore=R.telemetry?.().rejected??0;
      let result,error;try{result=await nativeTransportApply.call(this,message,transition);return result;}catch(e){error=e;throw e;}finally{
        const receivedAfter=this.receivedSeq,rejectedAfter=R.telemetry?.().rejected??0,row={stage:'transport-apply',type:message?.type??null,wireSeq:message?.seq??null,wireEpoch:message?.epoch??null,transition:transition===true,entry:{zone:entry.zone,worldTime:entry.worldTime,worldHp:entry.worldHp,worldMaxHp:entry.worldMaxHp,castCount:entry.castCount,rawLaserCasts:entry.rawLaserCasts,snapshotJsonBytes:entry.snapshotJsonBytes,top5WorldFieldJsonLengths:entry.top5WorldFieldJsonLengths},outcome:{result:error?'threw':result===false?false:result===true?true:(result??null),thrown:error?String(error.stack||error).slice(0,1200):null,receivedBefore,receivedAfter,runtimeSnapshotCallsDelta:probe.runtimeSnapshotEvents.length-runtimeCountBefore,rejectedBefore,rejectedAfter,transportStatus:{connected:this.status?.().connected??null,phase:this.status?.().phase??null,latency:this.status?.().latency??null,bytesReceived:this.status?.().bytesReceived??null,error:this.status?.().error??null}}};
        if(entry.castCount>0||error||result===false){bounded(probe.wireEvents,row,80);if(error||result===false||receivedAfter!==Number(message?.seq))bounded(probe.rejectEvents,{...row,possibleEarlyGate:true});}
      }
    };
    P.applySnapshot=function(snap,...args){
      const entry=inspectSnap(snap,window[metaSlot]??{}),casts=entry.rawLaserCasts,meta=window[metaSlot]??null,statsBefore=L.stats(),fields=snap?.world?.fields,world=entry.castCount?Object.fromEntries((Array.isArray(fields)?fields:[]).filter(e=>Array.isArray(e)&&e.length===2)): {},boss=Array.isArray(world.enemies)?world.enemies.find(e=>e?.id==='dist06-boss'):null;
      const profileFor=c=>{const rows=window.__HAPIL_LASERS_V31331__?.profiles?.get?.(c?.sourceId)??[];return Array.isArray(rows)?(rows.find(p=>p.key===c?.profileKeyV31332)||rows.find(p=>p.type===c?.type)||null):null;};
      const validFor=c=>{try{return L.valid(c,snap?.zone);}catch(e){return{error:String(e?.message??e)};}};
      const row={...entry,wireSeq:meta?.seq??null,wireEpoch:meta?.epoch??null,transition:meta?.transition??false,bossOwner:boss?{id:boss.id,hp:boss.hp,maxHp:boss.maxHp,phase:(()=>{try{return window.__HAPIL_RC86_BRIDGE__?.phase?.(boss)??null;}catch(e){return{error:String(e?.message??e)};}})(),attackAt:boss.attackAt,readyAt:boss.readyAt,recoverUntil:boss.recoverUntil}:null,
        castOwners:casts.map(c=>{const owner=Array.isArray(world.enemies)?world.enemies.find(e=>e?.id===c?.sourceId):null;return{sourceId:c?.sourceId??null,owner:owner?{id:owner.id,hp:owner.hp,maxHp:owner.maxHp,phase:(()=>{try{return window.__HAPIL_RC86_BRIDGE__?.phase?.(owner)??null;}catch(e){return{error:String(e?.message??e)};}})(),attackAt:owner.attackAt,readyAt:owner.readyAt,recoverUntil:owner.recoverUntil}:null,profile:profileFor(c)};}),
        validResults:casts.map(c=>({id:c?.id??null,sourceId:c?.sourceId??null,valid:validFor(c),ownerConfig:JSON.parse(JSON.stringify((L.owners??[]).find(owner=>owner.id===c?.sourceId)??null)),policyValid:window.__HAPIL_BOSS_POLICY_RC175__?.validMode?.(c)??null,profileKey:c?.profileKeyV31332??null,profile:profileFor(c)})),lasersBefore:statsBefore,nativeRejectedBefore:P.telemetry?.().rejected??null};
      let result,error;try{result=nativeApply.call(this,snap,...args);return result;}catch(e){error=e;throw e;}finally{
        row.applyAccepted=!error&&result!==false;row.applyResult=error?'threw':result===false?false:result===true?true:(result??null);row.thrown=error?String(error.stack||error).slice(0,1200):null;
        row.lasersAfter=L.stats();row.nativeRejectedAfter=P.telemetry?.().rejected??null;
        if(casts.length||result===false){bounded(probe.applyEvents,row,40);}
        if(casts.length&&(!row.applyAccepted||error)){bounded(probe.failedLaserApplications,row,6);}
        if(meta?.transition)bounded(probe.transitions,{wireSeq:meta.seq??null,wireEpoch:meta.epoch??null,zone:snap?.zone??null,castCount:entry.castCount,accepted:!error&&result!==false,thrown:row.thrown},4);
      }
    };
    probe.restore=()=>{if(P.applySnapshot===probe.wrappedApply)P.applySnapshot=nativeApply;if(R.snapshot===probe.wrappedSnapshot)R.snapshot=nativeSnapshot;if(T.applySnapshot===probe.wrappedTransportApply)T.applySnapshot=nativeTransportApply;return{applyRestored:P.applySnapshot===nativeApply,snapshotRestored:R.snapshot===nativeSnapshot,transportApplyRestored:T.applySnapshot===nativeTransportApply};};
    probe.wrappedApply=P.applySnapshot;probe.wrappedSnapshot=R.snapshot;probe.wrappedTransportApply=T.applySnapshot;
    return{installed:true,callThrough:true,lasersInstalled:L.installed,applyWritable:Object.getOwnPropertyDescriptor(P,'applySnapshot')?.writable===true,snapshotWritable:Object.getOwnPropertyDescriptor(R,'snapshot')?.writable===true,transportApplyWritable:Object.getOwnPropertyDescriptor(T,'applySnapshot')?.writable===true};
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
    const P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,T=window.__HAPIL_REMOTE_RC222__;
    const nativeExport=R?.exportSnapshot,nativeSend=T?.send;if(typeof nativeExport!=='function'||typeof nativeSend!=='function')throw Error('host export or transport send API missing');
    const probe={seen:new Set(),events:[],exportEvents:[],wireEvents:[],timer:null,restore:null,seenBossCast:false};window.__RC223_LASER_HOST_PROBE__=probe;
    const bounded=(list,row,max=60)=>{if(list.length>=max)list.shift();list.push(row);};
    const transportView=()=>{const t=T.status?.()??{};return{connected:t.connected??null,isHost:t.isHost??null,slotId:t.slotId??null,phase:t.phase??null,epoch:t.epoch??null,latency:t.latency??null,bytesSent:t.bytesSent??null,bytesReceived:t.bytesReceived??null,messagesSent:t.messagesSent??null,messagesReceived:t.messagesReceived??null,stale:t.stale??null,hostHidden:t.hostHidden??null,hostPaused:t.hostPaused??null,error:t.error??null};};
    const runtimeView=()=>{const r=R.status?.()??{};return{ready:r.ready??null,paused:r.paused??null,nativePaused:r.nativePaused??null,ended:r.ended??null,nativeStarted:r.nativeStarted??null,role:r.role??null,zone:r.zone??null,epoch:r.epoch??null,slotId:r.slotId??null,inActorTransaction:r.inActorTransaction??null};};
    const summarize=(snap,wire={})=>{
      const fields=snap?.world?.fields,laserEntries=Array.isArray(fields)?fields.filter(e=>Array.isArray(e)&&e[0]==='bossLaserCastsV31330'):[],raw=laserEntries[0]?.[1],casts=Array.isArray(raw)?raw.slice(0,8).map(c=>JSON.parse(JSON.stringify(c))):[];
      const top5WorldFieldJsonLengths=(Array.isArray(fields)?fields:[]).filter(e=>Array.isArray(e)&&e.length===2).map(([key,value])=>{let bytes=0;try{const json=JSON.stringify(value);bytes=json===undefined?0:new TextEncoder().encode(json).byteLength;}catch{}return{key,bytes};}).sort((a,b)=>b.bytes-a.bytes).slice(0,5);
      let snapshotJsonBytes=null;try{const json=JSON.stringify(snap);snapshotJsonBytes=json===undefined?null:new TextEncoder().encode(json).byteLength;}catch{}
      let wireJsonBytesEstimate=null;if(wire.type&&wire.data)try{wireJsonBytesEstimate=new TextEncoder().encode(JSON.stringify({v:1,gameId:'hapil',type:wire.type,...wire.data})).byteLength;}catch{}
      return{type:wire.type??null,outgoingSeq:wire.seq??null,outgoingEpoch:wire.epoch??null,full:snap?.rc222?.full??null,snapshotSeq:snap?.seq??null,zone:snap?.zone??null,worldTime:fields?.find?.(e=>e?.[0]==='time')?.[1]??null,worldHp:fields?.find?.(e=>e?.[0]==='hp')?.[1]??null,worldMaxHp:fields?.find?.(e=>e?.[0]==='maxHp')?.[1]??null,laserFieldEntryCount:laserEntries.length,castCount:Array.isArray(raw)?raw.length:null,rawLaserCasts:casts,rawLaserCastsTruncated:Array.isArray(raw)&&raw.length>8,snapshotJsonBytes,wireJsonBytesEstimate,top5WorldFieldJsonLengths};
    };
    const authorityView=()=>{const s=P?.state,world=R.canonicalWorld?.(s)??s;return{canonicalHp:world?.hp??null,canonicalMaxHp:world?.maxHp??null,worldTime:world?.time??null,runtime:runtimeView(),transport:transportView()};};
    const hasLaserCast=snap=>Array.isArray(snap?.world?.fields)&&snap.world.fields.some(e=>Array.isArray(e)&&e[0]==='bossLaserCastsV31330'&&Array.isArray(e[1])&&e[1].length>0);
    R.exportSnapshot=function(options={}){let snap,error;try{snap=nativeExport.call(this,options);return snap;}catch(e){error=e;throw e;}finally{if(snap?.zone==='dist06'&&(hasLaserCast(snap)||probe.seenBossCast&&probe.exportEvents.length<60)){const row={...summarize(snap,{type:'export',full:options?.full}),error:error?String(error.stack||error).slice(0,600):null,authority:authorityView()};if(row.castCount>0)probe.seenBossCast=probe.seenBossCast||row.rawLaserCasts.some(c=>c?.sourceId==='dist06-boss');bounded(probe.exportEvents,row,60);}}};
    T.send=function(type,data={}){let result,error;try{result=nativeSend.call(this,type,data);return result;}catch(e){error=e;throw e;}finally{const snap=data?.snapshot;if(['snapshot','transition'].includes(type)&&result!==false&&snap?.zone==='dist06'&&(hasLaserCast(snap)||probe.seenBossCast&&probe.wireEvents.length<60)){const row={...summarize(snap,{type,seq:data?.seq,epoch:data?.epoch,data}),wireSent:result===true,error:error?String(error.stack||error).slice(0,600):null,transport:transportView()};if(row.castCount>0)probe.seenBossCast=probe.seenBossCast||row.rawLaserCasts.some(c=>c?.sourceId==='dist06-boss');bounded(probe.wireEvents,row,60);}}};
    const sample=()=>{const s=P?.state,L=window.__HAPIL_LASERS_V31330__;if(!s||s.zone!=='dist06')return;
      for(const c of s.bossLaserCastsV31330??[]){const key=String(c.id)+'/'+String(c.sourceId);if(probe.seen.has(key))continue;probe.seen.add(key);
        const owner=(s.enemies??[]).find(e=>e.id===c.sourceId),profiles=window.__HAPIL_LASERS_V31331__?.profiles?.get?.(c.sourceId)??[],profile=profiles.find(p=>p.key===c.profileKeyV31332)||profiles.find(p=>p.type===c.type)||null;
        const event={at:s.time,zone:s.zone,wireSeq:null,rawLaserCast:JSON.parse(JSON.stringify(c)),valid:L.valid(c,s.zone),ownerConfig:JSON.parse(JSON.stringify((L.owners??[]).find(row=>row.id===c.sourceId)??null)),laserStats:L.stats(),bossOwner:owner?{id:owner.id,hp:owner.hp,maxHp:owner.maxHp,phase:window.__HAPIL_RC86_BRIDGE__?.phase?.(owner)??null,attackAt:owner.attackAt,readyAt:owner.readyAt,recoverUntil:owner.recoverUntil}:null,hostAuthority:authorityView(),profile};
        if(c.sourceId==='dist06-boss')probe.seenBossCast=true;
        if(probe.events.length<12)probe.events.push(event);
      }
    };sample();probe.timer=setInterval(sample,80);
    probe.restore=()=>{if(probe.timer){clearInterval(probe.timer);probe.timer=null;}if(R.exportSnapshot===probe.wrappedExport)R.exportSnapshot=nativeExport;if(T.send===probe.wrappedSend)T.send=nativeSend;return{timerCleared:probe.timer===null,exportRestored:R.exportSnapshot===nativeExport,sendRestored:T.send===nativeSend};};
    probe.wrappedExport=R.exportSnapshot;probe.wrappedSend=T.send;
  });
  const startedWall=Date.now(),deadline=startedWall+180000;let hostWaitError=null,guestWaitError=null;
  try{await host.waitForFunction(start=>{const s=window.__HAPIL_PARTY_V31322__?.state,p=window.__RC223_LASER_HOST_PROBE__;return s?.zone==='dist06'&&s.time>=start+30&&p?.events?.some(e=>e.rawLaserCast?.sourceId==='dist06-boss');},entered[0].time,{timeout:Math.max(1,deadline-Date.now()),polling:100});}
  catch(e){hostWaitError=String(e?.message??e);}
  const firstHostCast=await host.evaluate(()=>{const p=window.__RC223_LASER_HOST_PROBE__;return p?.events?.find(e=>e.rawLaserCast?.sourceId==='dist06-boss')??null;});
  if(firstHostCast&&Number.isFinite(firstHostCast.rawLaserCast?.endAt)){
    const remaining=deadline-Date.now();if(remaining>0)try{await guest.waitForFunction(endAt=>{const s=window.__HAPIL_PARTY_V31322__?.state;return s?.zone==='dist06'&&s.time>=endAt+.25;},firstHostCast.rawLaserCast.endAt,{timeout:remaining,polling:100});}catch(e){guestWaitError=String(e?.message??e);}else guestWaitError='overall 180 wall-second deadline expired before guest post-cast wait';
  }else guestWaitError='no finite first host boss cast endAt was observed';
  report.fixture.wait={result:hostWaitError?'host-deadline':guestWaitError?'guest-deadline':'host-sim-30-and-guest-past-first-cast',wallMs:Date.now()-startedWall,overallWallLimitMs:180000,hostWaitError,guestWaitError,hostSimulationTarget:entered[0].time+30,firstHostCast:firstHostCast?{id:firstHostCast.rawLaserCast?.id,sourceId:firstHostCast.rawLaserCast?.sourceId,born:firstHostCast.rawLaserCast?.born,fireAt:firstHostCast.rawLaserCast?.fireAt,endAt:firstHostCast.rawLaserCast?.endAt,activeSeconds:firstHostCast.rawLaserCast?.activeSeconds}:null,guestTimeTarget:firstHostCast&&Number.isFinite(firstHostCast.rawLaserCast?.endAt)?firstHostCast.rawLaserCast.endAt+.25:null,hostTime:await host.evaluate(()=>window.__HAPIL_PARTY_V31322__?.state?.time??null),guestTime:await guest.evaluate(()=>window.__HAPIL_PARTY_V31322__?.state?.time??null)};
  report.hostCasts=await host.evaluate(()=>{const p=window.__RC223_LASER_HOST_PROBE__,P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,T=window.__HAPIL_REMOTE_RC222__,s=P?.state;return{events:p?.events??[],laserStats:window.__HAPIL_LASERS_V31330__?.stats?.(),liveCasts:(s?.bossLaserCastsV31330??[]).map(c=>JSON.parse(JSON.stringify(c))),boss:s?.enemies?.find(e=>e.id==='dist06-boss')?{hp:s.enemies.find(e=>e.id==='dist06-boss').hp,maxHp:s.enemies.find(e=>e.id==='dist06-boss').maxHp,phase:window.__HAPIL_RC86_BRIDGE__?.phase?.(s.enemies.find(e=>e.id==='dist06-boss'))}:null,canonicalHost:{hp:(R.canonicalWorld?.(s)??s)?.hp??null,maxHp:(R.canonicalWorld?.(s)??s)?.maxHp??null,time:(R.canonicalWorld?.(s)??s)?.time??null},runtimeStatus:R.status?.()??null,transportStatus:T.status?.()??null,exportEvents:p?.exportEvents??[],wireEvents:p?.wireEvents??[]};});
  report.hostSnapshots={exportEvents:report.hostCasts.exportEvents,wireEvents:report.hostCasts.wireEvents};
  report.receiver.final=await guest.evaluate(()=>{const T=window.__HAPIL_REMOTE_RC222__,P=window.__HAPIL_PARTY_V31322__,R=window.__HAPIL_REMOTE_RC222_RUNTIME__,L=window.__HAPIL_LASERS_V31330__,q=window.__RC223_LASER_RECEIVER_PROBE__;
    return{transport:T?.status?.()??null,partyStatus:P?.status??null,partyTelemetry:P?.telemetry?.()??null,runtimeStatus:R?.status?.()??null,runtimeTelemetry:R?.telemetry?.()??null,laserStats:L?.stats?.()??null,
      applyEvents:q?.applyEvents??[],failedLaserApplications:q?.failedLaserApplications??[],runtimeSnapshotEvents:q?.runtimeSnapshotEvents??[],wireEvents:q?.wireEvents??[],rejectEvents:q?.rejectEvents??[],transitions:q?.transitions??[]};});
  report.hostSnapshots.restored=await host.evaluate(()=>window.__RC223_LASER_HOST_PROBE__?.restore?.()??null);
  report.receiver.restored=await guest.evaluate(()=>window.__RC223_LASER_RECEIVER_PROBE__?.restore?.()??null);
  report.receiver.transitionEvidence=report.receiver.final.transitions;
  assert(report.receiver.transitionEvidence.some(e=>e.accepted&&e.zone==='dist06'&&e.wireEpoch===entered[1].epoch),'guest accepted the real dist06 transition in the host epoch');
  const guestStatus=report.receiver.final.transport,partyStats=report.receiver.final.partyTelemetry,laserStats=report.receiver.final.laserStats,runtimeStats=report.receiver.final.runtimeTelemetry;
  assert(!hostWaitError,'host advanced the required 30 simulation seconds and produced a native dist06 boss cast within the 180 wall-second bound');
  assert(!guestWaitError&&report.fixture.wait.guestTime>=report.fixture.wait.guestTimeTarget,'guest snapshot world advanced beyond the first native cast endAt within the same 180 wall-second bound');
  const hostBossCast=report.hostCasts.events.find(e=>e.rawLaserCast?.sourceId==='dist06-boss');assert(hostBossCast?.valid,'native dist06 boss produced a valid laser cast; raw host evidence is in results.json');
  const hostCastId=hostBossCast.rawLaserCast.id;
  assert(report.hostSnapshots.exportEvents.some(e=>e.rawLaserCasts?.some(c=>c.id===hostCastId&&c.sourceId==='dist06-boss')),'call-through host runtime export included the native boss cast');
  assert(report.hostSnapshots.wireEvents.some(e=>e.wireSent&&e.rawLaserCasts?.some(c=>c.id===hostCastId&&c.sourceId==='dist06-boss')),'call-through host transport sent a snapshot containing that native cast');
  const acceptedRows=report.receiver.final.applyEvents.filter(e=>e.applyAccepted&&e.rawLaserCasts?.some(c=>c.id===hostCastId&&c.sourceId==='dist06-boss')&&e.validResults?.some(v=>v.id===hostCastId&&v.sourceId==='dist06-boss'&&v.valid));
  assert(acceptedRows.length>0,'guest native apply accepted the same valid raw dist06 boss laser cast sent by the host');
  assert(acceptedRows.some(e=>e.castPhases?.some(c=>c.id===hostCastId&&c.phase==='warning')),'guest native apply accepted that cast in its warning phase');
  assert(acceptedRows.some(e=>e.castPhases?.some(c=>c.id===hostCastId&&c.phase==='active')),'guest native apply accepted that cast during its actual active phase');
  assert(report.receiver.final.runtimeSnapshotEvents.some(e=>e.stage==='runtime-snapshot'&&e.entry?.castCount>0&&e.outcome),'receiver call-through runtime snapshot probe captured raw entry and outcome');
  assert.equal(report.receiver.restored?.applyRestored,true);assert.equal(report.receiver.restored?.snapshotRestored,true);assert.equal(report.receiver.restored?.transportApplyRestored,true);
  assert.equal(report.hostSnapshots.restored?.exportRestored,true);assert.equal(report.hostSnapshots.restored?.sendRestored,true);assert.equal(report.hostSnapshots.restored?.timerCleared,true);
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
    try{if(guest)report.failureDiagnostics=await guest.evaluate(()=>({transport:window.__HAPIL_REMOTE_RC222__?.status?.()??null,party:window.__HAPIL_PARTY_V31322__?.telemetry?.()??null,runtime:window.__HAPIL_REMOTE_RC222_RUNTIME__?.telemetry?.()??null,lasers:window.__HAPIL_LASERS_V31330__?.stats?.()??null,probe:window.__RC223_LASER_RECEIVER_PROBE__?{applyEvents:window.__RC223_LASER_RECEIVER_PROBE__.applyEvents,failedLaserApplications:window.__RC223_LASER_RECEIVER_PROBE__.failedLaserApplications,runtimeSnapshotEvents:window.__RC223_LASER_RECEIVER_PROBE__.runtimeSnapshotEvents,wireEvents:window.__RC223_LASER_RECEIVER_PROBE__.wireEvents,rejectEvents:window.__RC223_LASER_RECEIVER_PROBE__.rejectEvents}:null}));}catch{}
    try{if(host)report.failureHostEvidence=await host.evaluate(()=>({status:window.__HAPIL_REMOTE_RC222__?.status?.()??null,runtime:window.__HAPIL_REMOTE_RC222_RUNTIME__?.status?.()??null,party:window.__HAPIL_PARTY_V31322__?.telemetry?.()??null,lasers:window.__HAPIL_LASERS_V31330__?.stats?.()??null,probe:window.__RC223_LASER_HOST_PROBE__?{events:window.__RC223_LASER_HOST_PROBE__.events,exportEvents:window.__RC223_LASER_HOST_PROBE__.exportEvents,wireEvents:window.__RC223_LASER_HOST_PROBE__.wireEvents}:null}));}catch{}
  }
  finally{try{if(host&&!report.hostSnapshots.restored)report.hostSnapshots.restored=await host.evaluate(()=>window.__RC223_LASER_HOST_PROBE__?.restore?.()??null);}catch{}try{if(guest&&!report.receiver.restored)report.receiver.restored=await guest.evaluate(()=>window.__RC223_LASER_RECEIVER_PROBE__?.restore?.()??null);}catch{}report.finishedAt=new Date().toISOString();save();await guest?.context().close().catch(()=>{});await host?.context().close().catch(()=>{});await browser?.close().catch(()=>{});if(relay)await relay.close();server.close();
    const evidence=JSON.stringify(report);for(let offset=0,part=0;offset<evidence.length;offset+=6000,part++)console.log('RC223_LASER_RELAY_EVIDENCE '+JSON.stringify({part,data:evidence.slice(offset,offset+6000)}));
    console.log('RC223_LASER_RELAY_BROWSER '+JSON.stringify({status:report.status,appSha,browserVersion:report.browserVersion,roomCode:report.roomCode,wait:report.fixture.wait,hostCastCount:report.hostCasts?.events?.length??0,acceptedCastSnapshots:report.receiver?.final?.applyEvents?.filter(e=>e.castCount>0&&e.applyAccepted).length??0,failedLaserApplications:report.receiver?.final?.failedLaserApplications??report.failureDiagnostics?.probe?.failedLaserApplications??[],results:path.join(out,'results.json'),failure:failure?String(failure.stack||failure):null}));
  }
})();
