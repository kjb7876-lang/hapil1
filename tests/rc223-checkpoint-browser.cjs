'use strict';

// Focused staged browser regression for the real cult01 checkpoint respawn.
// The only bundle change is an appended QA bridge served over localhost; the
// on-disk application bundle is read and hashed but never edited.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const crypto=require('node:crypto');
const cp=require('node:child_process');
const assert=require('node:assert/strict');
const{chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));

const runnerRoot=path.resolve(__dirname,'..');
const appRoot=path.resolve(process.env.HAPIL_TEST_BASE||runnerRoot);
const out=path.resolve(process.env.HAPIL_QA_OUTPUT||'/tmp/rc223-checkpoint');
fs.mkdirSync(out,{recursive:true});

const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function gitValue(args,cwd){try{return cp.execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{return null;}}
const runnerCommit=gitValue(['rev-parse','HEAD'],runnerRoot);
const appCommit=gitValue(['rev-parse','HEAD'],appRoot);
if(process.env.EXPECTED_SHA)assert.equal(appCommit,process.env.EXPECTED_SHA,'served application checkout must match EXPECTED_SHA');

const appBundle=path.join(appRoot,'assets/index-v31526.js');
const originalBundle=fs.readFileSync(appBundle);
const qaBridge=Buffer.from(`\n;window.__RC223_QA__={
 get initial(){return oi;},
 get enter(){return ii;},
 get playerDamage(){return Y;},
 get world(){return N;}
};\n`);
const servedBundle=Buffer.concat([originalBundle,qaBridge]);
const source={
 runnerCommit,
 appCommit,
 appRoot,
 originalBundleSha256:sha256(originalBundle),
 testBridgeSha256:sha256(qaBridge),
 servedBundleSha256:sha256(servedBundle),
 baseline199402aBundleSha256:null
};
// Record the published baseline digest when the local Git object is available.
try{source.baseline199402aBundleSha256=sha256(cp.execFileSync('git',['show','199402a:assets/index-v31526.js'],{cwd:appRoot,stdio:['ignore','pipe','ignore']}));}catch{}

const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let file;
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  file=path.resolve(appRoot,'.'+(pathname==='/'?'/index.html':pathname));
 }catch{return res.writeHead(400).end();}
 if(!file.startsWith(appRoot+path.sep))return res.writeHead(403).end();
 try{
  const bytes=path.relative(appRoot,file)==='assets/index-v31526.js'?servedBundle:fs.readFileSync(file);
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-store');
  res.end(bytes);
 }catch{return res.writeHead(404).end();}
});

const report={status:'running',source,staged:true,physicalDevice:false,method:'native cult01 map entry, native incoming lethal reducer, real checkpoint dialog/click, observed native restart and RC95 balance; no enemy roster injection'};
let browser,page,listenerErrors=[];
let activeStage='startup';
let startedAt=Date.now();

function writeReport(){fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));}
async function takeScreenshot(name){
 if(!page)return null;
 try{
  const file=path.join(out,name+'.png');
  await page.screenshot({path:file,fullPage:false});
  const value={file,sha256:sha256(fs.readFileSync(file))};
  report.screenshots??={};report.screenshots[name]=value;
  return value;
 }catch(error){report.screenshotErrors??=[];report.screenshotErrors.push({name,error:String(error)});return null;}
}
async function diagnostic(stage){
 const base={stage,elapsedSinceLaunchMs:Date.now()-startedAt,pageErrors:listenerErrors.slice(-8)};
 if(!page)return base;
 try{
  return{...base,...await page.evaluate(()=>{
   const C=window.__HAPIL_CONTROLS_V31329__,s=C?.binding?.state?.current,Q=window.__RC223_QA__;
   const dialog=document.querySelector('[role="dialog"][aria-label="부활 선택"]');
   const story=document.querySelector('#hapil-story-rc51');
   const party=window.__HAPIL_PARTY_V31322__;
   const roster=(s?.enemies??[]).slice(0,24).map(a=>({id:a.id,hp:a.hp,maxHp:a.maxHp,phase:a.phase??null,invulnerableUntil:a.invulnerableUntil??null,rc95Balance:a.rc95Balance?.version??null}));
   return{
    document:{hidden:document.hidden,visibilityState:document.visibilityState},
    state:s?{zone:s.zone,hp:s.hp,maxHp:s.maxHp,time:s.time,paused:!!(s.paused||s.pause),timeStopUntil:s.timeStopUntil??null,phase:C?.binding?.phase??null,mode:window.__HAPIL_MODES_V31346__?.mode?.(s)??s.gameModeV31346??null,roster}:null,
    modal:dialog?{present:true,visible:!!(dialog.getClientRects().length),text:(dialog.innerText||'').slice(0,500),buttons:[...dialog.querySelectorAll('button')].map(b=>({text:b.innerText,disabled:b.disabled}))}:{present:false},
    story:story?{present:true,text:(story.innerText||'').slice(0,500)}:{present:false},
    party:party?{status:party.status??null,stateIsCurrent:party.state===s,actorCount:party.actors?.length??null,aliveActors:(party.actors??[]).filter(a=>a.hp>0).length,diagnostics:party.diagnostics?.()??null}:null,
    instrumentation:Q?{bridge:true,awaitScale:Q.awaitScale===s,restartCalls:Q.restartCalls??0,balanceCalls:Q.balanceCalls??0,restartSamples:Q.restartSamples??[],scaledSamples:Q.scaledSamples??[],restartErrors:Q.restartErrors??[],balanceErrors:Q.balanceErrors??[],choiceCalls:Q.choiceCalls??[],consumeAttempts:Q.consumeAttempts??0,consumeSamples:Q.consumeSamples??[],lastConsume:Q.lastConsume??null,deathPendingDeadCalls:Q.deathPendingDeadCalls??0,lastDeathPending:Q.lastDeathPending??null,partyRespawnCalls:Q.partyRespawnCalls??0,partyRespawnSamples:Q.partyRespawnSamples??[],stageRealMs:Q.lethalAt?Math.round(performance.now()-Q.lethalAt):null}:{bridge:false},
    runTTL:{wallClockMs:Q?.testStartedAt?Math.round(performance.now()-Q.testStartedAt):null,worldTimeSeconds:s?.time??null}
   };
  })};
 }catch(error){return{...base,diagnosticError:String(error)};}
}
async function waitFor(label,predicate,timeoutMs){
 activeStage=label;
 const record={timeoutMs,startedAt:Date.now()};report.steps??={};report.steps[label]={status:'waiting',timeoutMs};
 try{
  await page.waitForFunction(predicate,null,{timeout:timeoutMs});
  report.steps[label]={status:'passed',elapsedMs:Date.now()-record.startedAt,timeoutMs};
 }catch(error){
  report.steps[label]={status:'failed',elapsedMs:Date.now()-record.startedAt,timeoutMs,error:String(error)};
  report.diagnostics=await diagnostic(label);
  await takeScreenshot('failure-'+label.replace(/[^a-z0-9]+/gi,'-').toLowerCase());
  writeReport();
  throw error;
 }
}

(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  activeStage='browser-launch';
  browser=await chromium.launch({chromiumSandbox:true,channel:'chrome'});
  page=await browser.newPage({viewport:{width:1280,height:900}});
  page.on('pageerror',error=>listenerErrors.push(error.stack||error.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');
  await waitFor('native-runtime-ready',()=>!!(window.__HAPIL_RC133_NATIVE__?.installed&&window.__HAPIL_SAMONG_RC91__?.installed&&window.__HAPIL_COMBAT_FLOW_RC95__?.balance&&window.__RC223_QA__),60000);
  await page.keyboard.press('Escape');
  await page.evaluate(()=>window.__HAPIL_SAMONG_RC91__.unlock(null,'777'));
  await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
  await page.locator('[data-game-mode-v31354="DREAM"]').click();
  await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
  await waitFor('game-screen-ready',()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game',30000);
  for(let i=0;i<25&&await page.locator('#hapil-story-rc51').count();i++){
   await page.keyboard.press('Enter');
   await page.waitForTimeout(80);
  }
  await page.evaluate(()=>window.__HAPIL_PARTY_LAUNCH_V31322__?.dismissGuestUI?.());

  activeStage='native-map-entry';
  report.fixture=await page.evaluate(()=>{
   const Q=window.__RC223_QA__,C=window.__HAPIL_CONTROLS_V31329__,s=Q.initial();
   Object.assign(s,{zone:'cult01',time:100,gameModeV31346:'DREAM',samongUnlockedRC91:true,activeHeroId:'gunner'});
   C.binding.passives.current.damage=3;C.binding.shards.current=7;s.loopCycles.cult01=4;
   C.binding.state.current=s;
   Q.enter(s,'cult01',false);
   C.binding.state.current=s;C.binding.hero.current='gunner';C.setMode('manual');
   s.encounterDialogue31226=null;s.encounterLockUntil31226=0;s.invulnerableUntil=s.time+30;
   return{zone:s.zone,time:s.time,mode:s.gameModeV31346,method:'native ii map entry'};
  });
  await page.waitForTimeout(300);
  activeStage='native-lethal-input';
  report.fixture=await page.evaluate(previous=>{
   const Q=window.__RC223_QA__,C=window.__HAPIL_CONTROLS_V31329__,s=C.binding.state.current;
   const fresh=s.enemies.map(a=>({id:a.id,hp:a.maxHp,maxHp:a.maxHp,phase:a.phase??null}));
   if(!fresh.length)throw Error('native cult01 entry produced no enemies');
   for(const a of s.enemies){a.hp=Math.max(1,a.maxHp*.1);a.phase=5;a.readyAt=999;}
   C.binding.passives.current.damage=3;C.binding.shards.current=7;s.loopCycles.cult01=4;
   const growth={passives:JSON.stringify(C.binding.passives.current),shards:C.binding.shards.current,loop:s.loopCycles.cult01};
   s.hp=1;s.invulnerableUntil=0;s.awakeningUntil=0;
   s.samongPassiveRC91={version:1,active:0,grace:0,revivalCooldown:77,encounterRC128:{used:true}};
   s.innerFinalRC133=null;
   // Install before lethal HP so the React death component captures the probe
   // methods on its next render. Every probe calls through unchanged.
   const originalSamong=window.__HAPIL_SAMONG_RC91__,samongDescriptors=Object.getOwnPropertyDescriptors(originalSamong);
   Q.choiceCalls=[];Q.consumeAttempts=0;Q.consumeSamples=[];Q.deathPendingDeadCalls=0;Q.lastDeathPending=null;
   samongDescriptors.deathPending={...samongDescriptors.deathPending,value:function(state){
    const result=originalSamong.deathPending(state);
    if(state?.hp<=0){Q.deathPendingDeadCalls++;Q.lastDeathPending={sameAsCurrent:state===C.binding.state.current,hp:state.hp,result,time:state.time};}
    return result;
   }};
   samongDescriptors.chooseRevival={...samongDescriptors.chooseRevival,value:function(state,choice){
    const current=C.binding.state.current,row={choice,sameAsCurrent:state===current,hp:state?.hp,currentHp:current?.hp,pendingBefore:originalSamong.deathPending(state),livePendingBefore:originalSamong.deathPending(current),time:state?.time};
    try{row.result=originalSamong.chooseRevival(state,choice);}
    catch(error){row.error=error.stack||String(error);Q.choiceCalls.push(row);throw error;}
    row.pendingAfter=originalSamong.deathPending(state);row.livePendingAfter=originalSamong.deathPending(C.binding.state.current);Q.choiceCalls.push(row);return row.result;
   }};
   samongDescriptors.consumeCheckpoint={...samongDescriptors.consumeCheckpoint,value:function(state){
    const before=originalSamong.deathPending(state),result=originalSamong.consumeCheckpoint(state),row={sameAsCurrent:state===C.binding.state.current,hp:state?.hp,pendingBefore:before,result,pendingAfter:originalSamong.deathPending(state),time:state?.time};
    Q.consumeAttempts++;Q.lastConsume=row;
    if(Q.consumeSamples.length<4||result){Q.consumeSamples.push(row);if(Q.consumeSamples.length>12)Q.consumeSamples.shift();}
    else{Q.consumeSamples=Q.consumeSamples.slice(-11).concat(row);}
    return result;
   }};
   const samongProbe=Object.create(Object.getPrototypeOf(originalSamong));
   Object.defineProperties(samongProbe,samongDescriptors);
   window.__HAPIL_SAMONG_RC91__=samongProbe;
   const originalParty=window.__HAPIL_PARTY_V31322__;
   Q.partyRespawnCalls=0;Q.partyRespawnSamples=[];
   if(originalParty&&typeof originalParty.shouldRespawn==='function'){
    const partyDescriptors=Object.getOwnPropertyDescriptors(originalParty);
    partyDescriptors.shouldRespawn={...partyDescriptors.shouldRespawn,value:function(state){
     const result=originalParty.shouldRespawn(state);
     if(state?.hp<=0){Q.partyRespawnCalls++;const sample={sameAsCurrent:state===C.binding.state.current,stateIsPartyWorld:originalParty.state===state,hp:state.hp,result,status:originalParty.status??null,actorCount:originalParty.actors?.length??null,aliveActors:(originalParty.actors??[]).filter(a=>a.hp>0).length,time:state.time};Q.partyRespawnSamples.push(sample);if(Q.partyRespawnSamples.length>12)Q.partyRespawnSamples.shift();}
     return result;
    }};
    const partyProbe=Object.create(Object.getPrototypeOf(originalParty));
    Object.defineProperties(partyProbe,partyDescriptors);
    window.__HAPIL_PARTY_V31322__=partyProbe;
   }
   Q.choiceInstrumentationInstalled=true;
   Q.testStartedAt=performance.now();Q.lethalAt=performance.now();
   const accepted=Q.playerDamage(s,999,s.x,s.y,false);
   const observed={zone:s.zone,hp:s.hp,maxHp:s.maxHp,accepted,roster:fresh,growth,method:'native incoming reducer Y; actual checkpoint UI; no roster stub'};
   if(s.hp>0)throw Error('native incoming reducer did not cause lethal HP '+JSON.stringify(observed));
   return observed;
  },report.fixture);

  await waitFor('checkpoint-dialog-visible',()=>{const d=document.querySelector('[role="dialog"][aria-label="부활 선택"]');return !!d&&!!d.getClientRects().length;},10000);
  report.dialog={visible:true,checkpointButtonCount:await page.getByRole('button',{name:'체크포인트에서 부활',exact:true}).count(),crisisButtonCount:await page.getByRole('button',{name:'사몽 위기 부활',exact:true}).count()};
  assert.equal(report.dialog.checkpointButtonCount,1,'native death UI exposes exactly one checkpoint choice');
  assert.equal(report.dialog.crisisButtonCount,0,'used crisis token prevents a second crisis choice');
  await takeScreenshot('checkpoint-choice');

  await page.evaluate(()=>{
   const Q=window.__RC223_QA__,N=window.__HAPIL_RC133_NATIVE__,A=window.__HAPIL_COMBAT_FLOW_RC95__;
   if(!N?.restartAfterDeath||!A?.balance)throw Error('native restart or RC95 balance API unavailable');
   Q.restartCalls=0;Q.balanceCalls=0;Q.restartSamples=[];Q.scaledSamples=[];Q.restartErrors=[];Q.balanceErrors=[];Q.awaitScale=null;
   window.__HAPIL_COMBAT_FLOW_RC95__=Object.freeze({...A,balance(s,...args){
    Q.balanceCalls++;
    try{
     const result=A.balance(s,...args);
     if(Q.awaitScale===s){
      Q.scaledSamples.push({zone:s.zone,time:s.time,roster:s.enemies.map(a=>({id:a.id,hp:a.hp,maxHp:a.maxHp,phase:a.phase??null,rc95Balance:a.rc95Balance?.version??null})),calibratedActors:s.enemies.filter(a=>a.hp>0&&a.rc95Balance?.version===1).length,growth:{passives:JSON.stringify(window.__HAPIL_CONTROLS_V31329__.binding.passives.current),shards:window.__HAPIL_CONTROLS_V31329__.binding.shards.current,loop:s.loopCycles.cult01}});
      Q.awaitScale=null;
     }
     return result;
    }catch(error){Q.balanceErrors.push(error.stack||String(error));throw error;}
   }});
   window.__HAPIL_RC133_NATIVE__=Object.freeze({...N,restartAfterDeath(s,...args){
    Q.restartCalls++;
    Q.awaitScale=s;
    try{
     const result=N.restartAfterDeath(s,...args);
     Q.restartSamples.push({result,zone:s.zone,hp:s.hp,enemies:s.enemies.map(a=>({id:a.id,hp:a.hp,maxHp:a.maxHp,phase:a.phase??null})),growth:{passives:JSON.stringify(window.__HAPIL_CONTROLS_V31329__.binding.passives.current),shards:window.__HAPIL_CONTROLS_V31329__.binding.shards.current,loop:s.loopCycles.cult01},time:s.time});
     return result;
    }catch(error){Q.restartErrors.push(error.stack||String(error));throw error;}
   }});
   Q.instrumentationInstalled=true;
  });
  report.instrumentationInstalled=true;
  activeStage='checkpoint-button-click';
  report.steps??={};report.steps['checkpoint-button-click']={status:'started',at:Date.now()};
  await page.getByRole('button',{name:'체크포인트에서 부활',exact:true}).click({timeout:10000});
  report.steps['checkpoint-button-click']={status:'passed'};

  await waitFor('player-hp-restored',()=>window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current?.hp>0,12000);
  await waitFor('native-restart-observed',()=>window.__RC223_QA__?.restartSamples?.length>=1,5000);
  const reset=await page.evaluate(()=>window.__RC223_QA__.restartSamples.slice());
  report.restart={calls:await page.evaluate(()=>window.__RC223_QA__.restartCalls),samples:reset};
  assert.equal(report.restart.calls,1,'checkpoint selection calls native restart exactly once');
  assert.equal(reset.length,1,'one native restart observation');
  assert.equal(reset[0].result,true,'native same-map restart accepted');
  assert.equal(reset[0].zone,'cult01','native restart stays on cult01');
  assert.deepEqual(reset[0].enemies,report.fixture.roster,'native map entry restores the complete initial roster, full HP, and initial phases');
  assert.deepEqual(reset[0].growth,report.fixture.growth,'native restart retains passives, shards, and loop progress');

  await waitFor('rc95-balance-observed',()=>window.__RC223_QA__?.scaledSamples?.length>=1,12000);
  const balance=await page.evaluate(()=>({calls:window.__RC223_QA__.balanceCalls,samples:window.__RC223_QA__.scaledSamples.slice()}));
  report.balance=balance;
  assert.equal(balance.samples.length,1,'exactly one post-restart RC95 balance observation');
  assert.equal(balance.samples[0].zone,'cult01','RC95 calibrates the restarted cult01 encounter');
  assert(balance.samples[0].calibratedActors>0,'RC95 balance actually calibrates native enemies');
  assert.deepEqual(balance.samples[0].roster.map(a=>({id:a.id,hp:a.hp,maxHp:a.maxHp,phase:a.phase})),report.fixture.roster,'RC95 retains the initial full native roster and initial phases');
  assert.deepEqual(balance.samples[0].growth,report.fixture.growth,'RC95 calibration preserves earned growth');

  await waitFor('native-enemy-ready-for-postreset-hit',()=>{const s=window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current,a=s?.enemies?.find(a=>a.id==='c101-e1');return !!a&&a.hp>0&&!(a.invulnerableUntil>s.time);},8000);
  report.postResetDamage=await page.evaluate(()=>{
   const Q=window.__RC223_QA__,C=window.__HAPIL_CONTROLS_V31329__,s=C.binding.state.current,a=s.enemies.find(a=>a.id==='c101-e1');
   const before=a.hp;
   C.binding.actions.damage(a,20,'#edf7ff',false,0,{heroId:s.activeHeroId,heroAttackId:'rc223-checkpoint-postreset-probe',id:s.fxSerial++,born:s.time,actionKey:'A'});
   return{id:a.id,before,after:a.hp,method:'native outgoing reducer after full roster restart and RC95 balance; no HP override'};
  });
  assert(report.postResetDamage.after<report.postResetDamage.before,'native post-reset hit damages the restored enemy');
  assert.deepEqual(listenerErrors,[],'no page errors during checkpoint restart');
  report.status='passed';
  await takeScreenshot('checkpoint-respawn');
 }catch(error){
  report.status='failed';
  report.failure={stage:activeStage,error:error.stack||String(error)};
  if(page){report.diagnostics=await diagnostic(activeStage);await takeScreenshot('failure-final');}
 }finally{
  report.pageErrors=listenerErrors;
  report.finishedAt=new Date().toISOString();
  writeReport();
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
 }
 console.log('RC223_CHECKPOINT_BROWSER',JSON.stringify({status:report.status,source,fixture:report.fixture?{zone:report.fixture.zone,roster:report.fixture.roster?.length}:null,restartCalls:report.restart?.calls,balanceSamples:report.balance?.samples?.length,postResetDamage:report.postResetDamage,diagnostics:report.status==='failed'?report.diagnostics:null,results:path.join(out,'results.json')}));
 if(report.status!=='passed')process.exitCode=1;
})().catch(error=>{console.error('RC223_CHECKPOINT_BROWSER_FATAL',error);process.exitCode=1;try{server.close();writeReport();}catch{}});
