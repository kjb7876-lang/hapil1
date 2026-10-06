'use strict';
// Published read-only check: no response substitution, forced HP or progress injection.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));
const root=path.resolve(__dirname,'../..'),base=process.env.HAPIL_TEST_BASE||'https://kjb7876-lang.github.io/hapil1/',out=process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results/rc130-public');fs.mkdirSync(out,{recursive:true});
const files=['data/story-rc51.js','assets/foundation-v31400/policy.js','index.html','assets/index-v31526.js','assets/rc130/projectile-policy.js','assets/rc130/audio-policy.js','assets/rc23/feedback.js','assets/rc128/combat-feedback.js','assets/rc127/combat-policy.js','assets/rc127/dark-jelly.js','assets/rc129/danmaku-director.js','assets/rc129/danmaku-hud.js','assets/rc77/connected-laser.js','assets/rc43/bloodied-flight.js','assets/combat-v31412/skill-completion.js','assets/story-narration/v1/mixer.js','assets/story-narration/v1/player.js','audio/v31361/contact-kinetic.wav','audio/v31361/contact-heavy.wav'];
const expectedCatalog=require('../../tests/lib/combat-audio-catalog.cjs')(root);
const rc141Effects=Object.entries(expectedCatalog.effects).filter(([,p])=>p.rc141===true).map(([key,p])=>({key,path:p.path,sha256:p.sha256,duration:p.duration}));
assert.equal(rc141Effects.length,7,'all seven approved RC141 effects must be part of the public audit');
const expectedProfiles=Object.fromEntries(['music','effects'].map(group=>[group,Object.fromEntries(Object.entries(expectedCatalog[group]).map(([key,p])=>[key,{path:p.path,sha256:p.sha256,gain:p.gain}]))]));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const report={version:'RC130',testedCommit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),base,files:[],readiness:[],profiles:[],status:'running',attachmentImported:false,scope:'Read-only deployed bytes and natural startup, not full campaigns or physical-phone performance'};
const save=()=>fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2));
async function recover503ForCleanRetry(row){
 if(!row.httpErrors.length||row.httpErrors.some(issue=>issue.status!==503))return false;
 const baseUrl=new URL(base),recovered=[];
 for(const issue of row.httpErrors){
  const failedUrl=new URL(issue.url);
  if(failedUrl.origin!==baseUrl.origin||!failedUrl.pathname.startsWith(baseUrl.pathname))return false;
  const file=failedUrl.pathname.slice(baseUrl.pathname.length);
  if(!/^(?:assets|data|audio)\/[A-Za-z0-9._/-]+$/.test(file)||file.split('/').includes('..'))return false;
  const local=path.join(root,file);
  if(!fs.existsSync(local))return false;
  const expected=hash(fs.readFileSync(local));let match=null;
  for(let attempt=1;attempt<=3;attempt++){
   try{const url=new URL(failedUrl);url.searchParams.set('rc130-recover',report.testedCommit+'-'+attempt+'-'+Date.now());const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(10000)}),bytes=Buffer.from(await response.arrayBuffer()),actual=hash(bytes);if(response.status===200&&actual===expected){match={file,initialStatus:503,retryAttempt:attempt,retryStatus:200,sha256:actual};break;}}catch(e){}
   if(attempt<3)await sleep(1000);
  }
  if(!match)return false;
  recovered.push(match);
 }
 row.recovered503=recovered;save();return true;
}
async function main(){let browser;try{
 // Check the real registered media, not merely a script tag or a claimed ZIP import.
 // The eight repository assets must not be equated with an unreadable attachment.
 const manifestPath='assets/combat-audio/v1/manifest.json';
 const manifest=JSON.parse(fs.readFileSync(path.join(root,manifestPath),'utf8'));
 assert.equal(manifest.scope,'combat-only');assert.equal(manifest.originalsPreserved,true);
 assert.equal(manifest.assets.length,8,'expected registered combat music/effect set');
 files.push('assets/combat-audio/v1/catalog.js','assets/combat-audio/v1/controller.js','assets/combat-audio/v1/native-bridge.js',manifestPath);
 const media=[];
 for(const row of manifest.assets){
  assert(/^\.\/assets\/combat-audio\/v1\/audio\/[a-z0-9-]+\.(mp3|wav)$/.test(row.path),'safe media path');
  assert(/^[a-f0-9]{64}$/.test(row.sha256),'media digest');
  const file=row.path.slice(2),bytes=fs.readFileSync(path.join(root,file));
  assert.equal(hash(bytes),row.sha256,'registered media content: '+file);assert.equal(bytes.length,row.bytes);
  assert(Number.isFinite(row.duration)&&row.duration>0,'positive registered duration');
  files.push(file);media.push({role:row.role,kind:row.kind,file,sha256:row.sha256,bytes:bytes.length});
 }
 for(const group of ['music','effects'])for(const [role,p]of Object.entries(expectedCatalog[group])){
  const file=p.path.slice(2),bytes=fs.readFileSync(path.join(root,file));assert.equal(hash(bytes),p.sha256,'exact registered runtime audio '+role);
  if(!files.includes(file)){files.push(file);media.push({role,kind:group,file,sha256:p.sha256,bytes:bytes.length});}
 }
 files.push('assets/rc133/media-catalog.js','assets/rc141/media-additions.js');
 assert.equal(new Set(files).size,files.length,'no duplicate public-file assertions');
 report.combatAudio={registeredAssets:media,rc141PublicEffects:rc141Effects.map(({key,path,sha256})=>({key,path,sha256})),archiveBytesVerified:false,provenance:'Verified against the repository manifest; no claim that the unreadable conversation ZIP is this same set.'};save();
 for(const file of files){const expected=hash(fs.readFileSync(path.join(root,file)));let match=null;
  // Pages deploy can finish after this audit starts; allow up to six minutes for a new index.
  for(let attempt=0;attempt<90;attempt++){let row;try{const url=new URL(file,base);url.searchParams.set('rc130-verify',report.testedCommit+'-'+Date.now());const r=await fetch(url,{signal:AbortSignal.timeout(20000)}),actual=hash(Buffer.from(await r.arrayBuffer()));row={file,attempt,status:r.status,expected,actual};}catch(e){row={file,attempt,error:String(e.message)};}report.readiness.push(row);save();if(row.status===200&&row.actual===expected){match=row;break;}await sleep(4000);}
  assert(match,'Exact committed public bytes unavailable: '+file);report.files.push(match);save();
 }
 browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const[name,width,height,mobile]of[['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){
  for(let profileAttempt=1;profileAttempt<=3;profileAttempt++){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),row={name,profileAttempt,errors:[],httpErrors:[],requestFailures:[],startupDependencies:[],samples:[],status:'running'};report.profiles.push(row);page.setDefaultTimeout(30000);const dependencyResponses=[];page.on('pageerror',e=>row.errors.push(String(e.stack||e)));page.on('requestfailed',r=>row.requestFailures.push({url:r.url(),resourceType:r.resourceType(),failure:r.failure()}));page.on('response',r=>{if(r.status()>=400)row.httpErrors.push({url:r.url(),status:r.status()});if(r.url().includes('data/story-rc51.js')||r.url().includes('foundation-v31400/policy.js'))dependencyResponses.push((async()=>{const headers=await r.allHeaders();let bytes=null,error=null;try{bytes=await r.body();}catch(e){error=String(e.message||e);}return{url:r.url(),status:r.status(),fromServiceWorker:r.fromServiceWorker(),contentType:headers['content-type']||null,cacheControl:headers['cache-control']||null,etag:headers.etag||null,bodyBytes:bytes?.length??null,sha256:bytes?hash(bytes):null,bodyPrefix:bytes?.subarray(0,160).toString('utf8')??null,bodyError:error};})());});
  try{
   await page.goto(base+'?v=43001&qa=1');row.startupGlobals=await page.evaluate(()=>({readyState:document.readyState,storyDataType:typeof window.__HAPIL_STORY_DATA_RC51__,storyRecordCount:window.__HAPIL_STORY_DATA_RC51__?.records?.length??null,policyVersion:window.__HAPIL_POLICY_V31400__?.version??null,partnerAvailable:typeof window.__HAPIL_POLICY_V31400__?.partner==='function',storyRuntimeAvailable:typeof window.__HAPIL_STORY_RC51__==='object',partyUiAvailable:typeof window.__HAPIL_PARTY_UI_V31322__==='object',openingPhase:window.__MONGSE_CHRISTIAN_OPENING_V31236__?.phase??null}));row.startupDependencies=await Promise.allSettled(dependencyResponses).then(xs=>xs.map(x=>x.status==='fulfilled'?x.value:{error:String(x.reason)}));const missing=[];for(const [file,needle]of [['data/story-rc51.js','data/story-rc51.js?v=2026100601'],['assets/foundation-v31400/policy.js','foundation-v31400/policy.js?v=2026100601']]){const expected=report.files.find(x=>x.file===file),observed=row.startupDependencies.find(x=>x.url?.includes(needle));if(!observed)missing.push(file+' response not observed at cache-busted URL');else if(observed.status!==200||observed.sha256!==expected?.actual)missing.push(file+' browser response did not match the exact public hash');}if(!(row.startupGlobals.storyRecordCount>0))missing.push('data/story-rc51.js did not define nonempty story records');if(row.startupGlobals.policyVersion!=='3.14.00'||!row.startupGlobals.partnerAvailable)missing.push('assets/foundation-v31400/policy.js did not define the expected 3.14.00 partner API');if(missing.length)throw Error('Startup dependencies missing: '+missing.join('; ')+'; observed '+JSON.stringify({globals:row.startupGlobals,assets:row.startupDependencies,requestFailures:row.requestFailures,httpErrors:row.httpErrors}));await page.waitForFunction(()=>window.__HAPIL_RC130_NATIVE_INSTALLED__&&window.__HAPIL_RC127_INSTALLED__&&window.__HAPIL_DANMAKU_HUD_RC129__?.installed&&typeof window.__HAPIL_COMBAT_AUDIO_V1__?.sync==='function'&&typeof window.__HAPIL_COMBAT_AUDIO_BRIDGE_V1__?.create==='function');await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();assert.equal(await page.locator('[data-game-mode-v31354="HELL"]:visible').count(),0,'HELL stays removed');await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00');
   for(let i=0;i<12&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(100);}
   row.rc141AudioDecode=await page.evaluate(async assets=>{
    const context=new AudioContext(),decoded=[];
    try{await context.resume();for(const asset of assets){const response=await fetch(asset.path,{cache:'no-store'});if(!response.ok)throw Error(asset.key+' public HTTP '+response.status);const bytes=await response.arrayBuffer(),digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join(''),audio=await context.decodeAudioData(bytes.slice(0));let peak=0,energy=0;for(let channel=0;channel<audio.numberOfChannels;channel++)for(const sample of audio.getChannelData(channel)){peak=Math.max(peak,Math.abs(sample));energy+=sample*sample;}decoded.push({key:asset.key,path:asset.path,status:response.status,sha256:digest,channels:audio.numberOfChannels,duration:audio.duration,peak,energy});}return decoded;}finally{await context.close();}
   },rc141Effects);
   assert.equal(row.rc141AudioDecode.length,7,'public browser decoded all approved RC141 effects');
   for(const decoded of row.rc141AudioDecode){const expected=rc141Effects.find(asset=>asset.key===decoded.key);assert(expected,'decoded only an approved RC141 effect');assert.equal(decoded.path,expected.path);assert.equal(decoded.status,200,decoded.key+' public status');assert.equal(decoded.sha256,expected.sha256,decoded.key+' public byte hash');assert.equal(decoded.channels,2,decoded.key+' stereo decode');assert(decoded.duration>0&&decoded.duration<=2.3,decoded.key+' decoded duration');assert(decoded.peak>0&&decoded.peak<.85,decoded.key+' decoded peak');assert(decoded.energy>0,decoded.key+' decoded PCM');}
   const sample=()=>page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,C=window.__HAPIL_COMBAT_AUDIO_CATALOG_V1__,A=window.__HAPIL_COMBAT_AUDIO_V1__;return{time:s.time,x:s.x,y:s.y,hp:s.hp,mode:s.gameModeV31346,speed:s.rc127MovementSpeed,shots:s.hostileProjectiles.length,finite:s.hostileProjectiles.every(p=>[p.x,p.y,p.vx,p.vy].every(Number.isFinite)),policy:window.__HAPIL_PRESENTATION_RC130__.snapshot(),audio:window.__HAPIL_AUDIO_RC130__.snapshot(),danmaku:window.__HAPIL_DANMAKU_HUD_RC129__.snapshot(s).installed,combatAudio:{catalog:Object.fromEntries(['music','effects'].map(group=>[group,Object.fromEntries(Object.entries(C?.[group]??{}).map(([key,p])=>[key,{path:p.path,sha256:p.sha256,gain:p.gain}]))])),loaded:typeof A?.sync==='function',music:Object.keys(C?.music||{}).length,effects:Object.keys(C?.effects||{}).length,diagnostics:A?.diagnostics}};});
   row.samples.push(await sample());await page.keyboard.down('ArrowRight');await page.waitForTimeout(400);await page.keyboard.up('ArrowRight');
   for(let i=0;i<8;i++){await page.waitForTimeout(1500);row.samples.push(await sample());}
   const first=row.samples[0],last=row.samples.at(-1);assert(last.time>first.time+2,'natural combat advances');assert(row.samples.every(v=>Number.isFinite(v.hp)&&v.finite&&Math.abs(v.speed-6.471685)<1e-8),'fixed movement and finite simulation');assert(row.samples.every(v=>v.policy.maxRatio<=.200001),'observed live bitmap size cap');assert(last.policy.projectileCalls>0,'real game used size guard');assert(row.samples.every(v=>v.combatAudio.loaded&&v.combatAudio.music===Object.keys(expectedProfiles.music).length&&v.combatAudio.effects===Object.keys(expectedProfiles.effects).length&&v.combatAudio.diagnostics.failedPaths===0),'registered combat audio remains available with no recorded playback failures');for(const v of row.samples)assert.deepEqual(v.combatAudio.catalog,expectedProfiles,'all registered roles/paths/digests/gains exactly match the reviewed catalog');assert.deepEqual(row.errors,[]);row.recoveredFontErrors=[];const unresolvedHttp=[];for(const issue of row.httpErrors){const fontPath=new URL(issue.url).pathname;if(issue.status!==503||!/^\/hapil1\/assets\/rc26\/font\/files\/noto-serif-kr-\d+-400-normal\.woff2$/.test(fontPath)){unresolvedHttp.push(issue);continue;}const file=fontPath.slice('/hapil1/'.length),expected=hash(fs.readFileSync(path.join(root,file)));let recovered=null;for(let attempt=1;attempt<=3;attempt++){try{const url=new URL(issue.url);url.searchParams.set('rc130-font-retry',report.testedCommit+'-'+attempt+'-'+Date.now());const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(10000)}),bytes=Buffer.from(await response.arrayBuffer()),actual=hash(bytes);if(response.status===200&&actual===expected){recovered={...issue,retryAttempt:attempt,retryStatus:response.status,sha256:actual};break;}}catch(e){recovered=null;}if(attempt<3)await sleep(1000);}if(recovered)row.recoveredFontErrors.push(recovered);else unresolvedHttp.push(issue);}assert.deepEqual(unresolvedHttp,[]);row.status='passed';
  }catch(e){row.status='failed';row.error=String(e.stack||e);if(!row.startupGlobals)row.startupGlobals=await page.evaluate(()=>({readyState:document.readyState,storyDataType:typeof window.__HAPIL_STORY_DATA_RC51__,storyRecordCount:window.__HAPIL_STORY_DATA_RC51__?.records?.length??null,policyVersion:window.__HAPIL_POLICY_V31400__?.version??null,partnerAvailable:typeof window.__HAPIL_POLICY_V31400__?.partner==='function',storyRuntimeAvailable:typeof window.__HAPIL_STORY_RC51__==='object',partyUiAvailable:typeof window.__HAPIL_PARTY_UI_V31322__==='object',openingPhase:window.__MONGSE_CHRISTIAN_OPENING_V31236__?.phase??null})).catch(()=>null);if(!row.startupDependencies.length)row.startupDependencies=await Promise.allSettled(dependencyResponses).then(xs=>xs.map(x=>x.status==='fulfilled'?x.value:{error:String(x.reason)}));}finally{await page.screenshot({path:path.join(out,row.status==='passed'?'published-'+name+'.png':'published-'+name+'-attempt'+profileAttempt+'.png')}).catch(e=>{row.screenshotError=String(e);});save();console.log('RC130_PUBLIC_PROFILE',JSON.stringify(row));await context.close();}
  if(row.status==='passed'||profileAttempt===3||!await recover503ForCleanRetry(row))break;
  await sleep(1000);
  }
 }
 const finalProfiles=['pc','portrait','landscape'].map(name=>report.profiles.filter(row=>row.name===name).at(-1));report.status=finalProfiles.every(row=>row?.status==='passed')?'passed':'failed';
 }catch(e){report.status='failed';report.error=String(e.stack||e);console.error(e);}finally{save();await browser?.close();console.log('RC130_PUBLIC_RESULT',JSON.stringify({status:report.status,testedCommit:report.testedCommit,files:report.files.length,registeredCombatAudio:report.combatAudio?.registeredAssets?.length||0,profiles:report.profiles.map(p=>({name:p.name,status:p.status,errors:p.errors,httpErrors:p.httpErrors})),attachmentImported:false}));process.exitCode=report.status==='passed'?0:1;}}
main();
