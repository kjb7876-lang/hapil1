'use strict';
// Staged final-sequence admission in full-auto with and without an actual held D input.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/pw155/node_modules','playwright'));
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc147-auto-defense';fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');const bytes=fs.readFileSync(file);res.end(file.endsWith('/assets/index-v31526.js')?Buffer.concat([bytes,Buffer.from('\nwindow.__RC147_AUTO_QA__={initial:oi};')]):bytes);}catch{res.writeHead(404).end();}});
const result={status:'running',staged:true,scope:'Full-auto Story finale state machine with held D and without D; not natural campaign completion',variants:[],errors:[],httpErrors:[]};
const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2));
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
 browser=await chromium.launch({chromiumSandbox: true, executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>result.errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400)result.httpErrors.push({status:r.status(),url:r.url()});});
 await page.goto('http://127.0.0.1:'+server.address().port+'/?rc147auto=1');await page.waitForFunction(()=>window.__HAPIL_RC133_NATIVE__?.installed&&window.__HAPIL_SAMONG_COSMIC_V386__?.installed&&window.__RC147_AUTO_QA__?.initial);
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game');
 await page.evaluate(()=>{window.__HAPIL_STORY_RC51__?.close(false);window.__HAPIL_CONTROLS_V31329__.setMode('full');});
 await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__.effective()==='full');
 for(const heldD of [false,true]){
  const row=await page.evaluate(heldD=>{
   const C=window.__HAPIL_CONTROLS_V31329__,D=window.__HAPIL_DEFENSE_V31356__,B=window.__HAPIL_RC86_BRIDGE__,W=window.__HAPIL_SAMONG_COSMIC_V386__,s=window.__RC147_AUTO_QA__.initial(),boss=B.cloneEnemy(B.actor('cult04','c104-boss'),'cult04');
   Object.assign(s,{zone:'cult04',time:100,x:13.8,y:24.2,hp:240,maxHp:240,activeHeroId:'hwando',gameModeV31346:'STORY',spawnedWaves:new Set([1,2,3,4]),completedZones:new Set(),enemies:[boss],hostileProjectiles:[],pendingHits:[],impactQueue:[],effects:[],floatTexts:[],encounterLockUntil31226:0,encounterDialogue31226:null,encounterWallUnlockAtV31227:0,timeStopUntil:0,invulnerableUntil:999,hapilSamongActiveV31300:true,hapilFinalBattleV31300:{bossId:'c104-boss',startedAt:93,stage:7,secondPhaseActive:true,completed:false,monochromeActiveV31377:true,awakeningPendingRC108:true,awakeningCommittedRC108:false,combatElapsedRC79:2}});
   boss.hp=boss.maxHp;boss.hapilSecondPhaseV31300=true;boss.fixedPhase=4;boss.currentPhase=4;C.binding.state.current=s;window.__HAPIL_STORY_RC51__?.close(false);
   const accepted=heldD?C.key({code:'KeyD',key:'d',repeat:false,preventDefault(){}},true):false,cast=heldD?D.active(s):false,guardBefore=D.active(s),inputHeld=heldD?C.hasHeldLogical('KeyD'):false;
   if(heldD)D.tick(s);
   W.tick(s);s.hapilSamongCosmicWaveV386.nextAt=2;W.tick(s);
   const six=s.enemies.filter(a=>a.samongCosmicSummonV386&&a.hp>0),bornSix=six.length;
   s.time=Math.max(...six.map(a=>a.samongCosmicDispatchAtV386))+.01;s.hapilFinalBattleV31300.combatElapsedRC79=4;W.tick(s);
   const crisis={status:W.snapshot(s)?.status,hp:s.hp,dispatched:s.enemies.filter(a=>a.samongCosmicPatternDispatchedV386).length};
   s.time+=1.3;s.hapilFinalBattleV31300.combatElapsedRC79=5.3;W.tick(s);
   for(let i=1;i<6;i++){s.time+=.29;s.hapilFinalBattleV31300.combatElapsedRC79+=.29;W.tick(s);}
   const output={heldD,mode:C.effective(),inputHeld,inputAccepted:accepted,cast:!!cast,guardBefore,bornSix,crisis,completed:s.hapilFinalBattleV31300.completed===true,finalHitMode:s.hapilFinalBattleV31300.finalHitModeV31377,awakeningCommitted:s.hapilFinalBattleV31300.awakeningCommittedRC108===true,leaderGone:!s.enemies.some(a=>a.id==='c104-boss'),cosmicsLeft:s.enemies.filter(a=>a.samongCosmicSummonV386&&a.hp>0).length,bossDefeated:s.bossDefeated,heroHp:s.hp};if(heldD)C.key({code:'KeyD',key:'d'},false);D.clear(s);return output;
  },heldD);
  result.variants.push(row);
 }
 for(const row of result.variants){assert.equal(row.mode,'full');assert.equal(row.bornSix,6);assert.equal(row.crisis.status,'crisis');assert.equal(row.crisis.hp,1);assert.equal(row.crisis.dispatched,6);assert(row.awakeningCommitted&&row.completed&&row.leaderGone&&row.bossDefeated);assert.equal(row.cosmicsLeft,0);assert.equal(row.finalHitMode,'samong-awakening');assert(row.heroHp>0);if(row.heldD)assert(row.inputHeld&&row.cast&&row.guardBefore);else assert(!row.inputHeld&&!row.cast&&!row.guardBefore);}
 assert.deepEqual(result.errors,[]);assert.deepEqual(result.httpErrors,[]);result.status='passed';save();console.log('RC147_AUTO_DEFENSE',JSON.stringify(result));
 }catch(e){result.status='failed';result.failure=e.stack||String(e);save();console.error(result.failure);process.exitCode=1;}finally{await browser?.close();server.close();}})();
