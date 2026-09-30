const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)){res.statusCode=403;res.end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.wav':'audio/wav'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}
 catch{res.statusCode=404;res.end();}
}).listen(0,'127.0.0.1');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.stack));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');
 await page.waitForFunction(()=>window.__HAPIL_DANMAKU_RPG_RC88__?.installed,true,{timeout:15000});
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();
 await page.locator('.hero-card').nth(6).click();
 await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
 await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');
 const result=await page.evaluate(async()=>{
  const api=window.__HAPIL_DANMAKU_RPG_RC88__,b=window.__HAPIL_RC86_BRIDGE__;
  const state=(zone)=>({...window.__MONGSE_QA_STATE__,zone,gameModeV31346:'STORY',time:10,fxSerial:1,x:12,y:12,hp:1000,maxHp:1000,
    activeHeroId:'hwando',resonance:0,combo:0,clues:new Set(),effects:[],floatTexts:[],defeated:[],enemies:[],
    hostileProjectiles:[],pendingHits:[],impactQueue:[],pendingStrikes:[],loopCycles:{},spawnedWaves:new Set()});
  const checked=[],images=new Set();
  for(const p of api.profiles){
    const seed=b.actor(p.zone,p.id);
    // The blue executioner is a dynamically generated native loop boss.
    if(!seed&&p.id==='blue-executor')continue;
    if(!seed)throw Error('missing authored encounter '+p.zone+'/'+p.id);
    const s=state(p.zone),owner=b.cloneEnemy(seed,p.zone);s.enemies=[owner];api.tick(s);
    s.time=12;api.tick(s);
    const parts=s.enemies.filter(a=>a.rc88Part);
    if(p.count&&parts.length!==p.count)throw Error('missing emitters '+p.id);
    for(const a of parts){images.add(a.sprite);const result=b.counterDamage(s,a,a.maxHp*5);
      if(result.hpAfter!==0)throw Error('native counter/phase gate kept emitter alive '+a.id);
      const committed=[...s.hostileProjectiles],pending={sourceId:a.id,damage:1};s.pendingHits.push(pending);
      if(!api.beforeDeath(s,a)||s.enemies.includes(a))throw Error('native emitter death was not consumed');
      if(committed.some(q=>!s.hostileProjectiles.includes(q))||!s.pendingHits.includes(pending))throw Error('committed attacks were deleted');}
    for(const q of s.hostileProjectiles)if(q.sprite)images.add(q.sprite);
    checked.push({id:p.id,parts:parts.length,shots:s.hostileProjectiles.length});
  }
  const s=state('cult04'),boss=b.cloneEnemy(b.actor('cult04','c104-boss'),'cult04');
  Object.assign(boss,{hapilSecondPhaseV31300:true,hp:boss.maxHp});s.enemies=[boss];
  s.hapilFinalBattleV31300={stage:7,secondPhaseActive:true,monochromeActiveV31377:true,completed:false,combatElapsedRC79:0};
  const samong=window.__HAPIL_SAMONG_COSMIC_V386__;samong.tick(s);
  const summons=[];
  // Hold world time at 10 except for the short native dispatch lead-in.
  // Scheduling follows the final battle's unscaled clock, not slowed world time.
  for(let i=0;i<6;i++){
    s.hapilFinalBattleV31300.combatElapsedRC79=s.hapilSamongCosmicWaveV386.nextAt;
    samong.tick(s);const a=s.enemies.find(a=>a.rc88InteractiveCosmic);
    if(!a||!a.rc89Wraith||a.samongCosmicIndexV386!==i+1)throw Error('real-clock summon route failed '+i);
    const cache={};await Promise.all(samong.audit().bosses[i].assets.map(path=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{cache[path]=im;resolve();};im.onerror=reject;im.src=path;})));
    b.phaseSprite(cache,a,s.time);await new Promise(resolve=>setTimeout(resolve,30));const picture=b.phaseSprite(cache,a,s.time);if(!String(picture).startsWith('data:image/png')||!cache[picture]?.naturalWidth)throw Error('wraith artwork did not render as translucent grayscale canvas');
    s.time=a.samongCosmicDispatchAtV386+.001;samong.tick(s);
    if(!a.samongCosmicPatternDispatchedV386)throw Error('native Cosmic signature failed');
    if(i===2){
      a.hp=Math.max(1,a.hp-3);
      const remaining=.35;s.hapilFinalBattleV31300.combatElapsedRC79=s.hapilSamongCosmicWaveV386.activeUntil-remaining;
      const saved=api.snapshot(s),restored=state('cult04');
      restored.enemies=[{...boss}];restored.hapilFinalBattleV31300={...s.hapilFinalBattleV31300};
      api.restore(restored,saved);const resumed=restored.enemies.find(a=>a.rc88InteractiveCosmic);
      if(!resumed||resumed.samongCosmicIndexV386!==3||resumed.hp!==a.hp||api.snapshot(restored).cosmicKills.length!==2)
        throw Error('active Cosmic save restore repeated calls or reset HP');
      if(Math.abs(restored.hapilSamongCosmicWaveV386.activeUntil-restored.hapilFinalBattleV31300.combatElapsedRC79-remaining)>.001)
        throw Error('Cosmic remaining lifetime reset after loading');
    }
    const impactCount=s.pendingHits.length+s.hostileProjectiles.length+(s.bossLaserCastsV31330?.length??0);
    const r=b.counterDamage(s,a,a.maxHp*5);if(r.hpAfter!==0)throw Error('Cosmic add retained boss cast damage cap');
    if(!api.beforeDeath(s,a))throw Error('Cosmic add retained native boss death progression');
    if(s.bossDefeated)throw Error('Cosmic add ended final encounter');
    summons.push({id:a.id,signature:a.samongCosmicPatternNameV386,impactCount});
  }
  samong.tick(s);if(s.hapilSamongCosmicWaveV386.status!=='complete')throw Error('six-call skill did not complete');
  if(api.snapshot(s).cosmicKills.length!==6)throw Error('six shield breaks missing');
  if(window.__HAPIL_RC79__.finalFloor(s,boss)<=0)throw Error('final ending gate opened prematurely');
  const tree=state('dist00');tree.enemies=[b.cloneEnemy(b.actor('dist00','dist00-boss'),'dist00')];api.tick(tree);
  const a=tree.enemies.find(a=>a.rc88Part);a.hp=0;api.beforeDeath(tree,a);
  const save=b.serializeSave(tree,'hwando',[],{},0),normalized=b.normalizeSave(save);
  const loaded=state('dist00');loaded.time=0;loaded.enemies=b.restoreEnemies(normalized);
  b.restoreEntry(loaded,normalized);api.tick(loaded);
  if(loaded.enemies.filter(a=>a.rc88Part).length!==2||loaded.enemies.some(t=>t.id===a.id))throw Error('native save/restore resurrected root');
  await Promise.all([...images].map(path=>new Promise((resolve,reject)=>{
    const im=new Image();im.onload=resolve;im.onerror=()=>reject(Error('failed native combat image '+path));im.src=path;
  })));
  return {routes:checked,images:images.size,summons,worldTime:s.time,realTime:s.hapilFinalBattleV31300.combatElapsedRC79,restoredRoots:2};
 });
 assert.equal(result.summons.length,6);assert.deepEqual(errors,[]);
 console.log('RC88 BROWSER PASS',JSON.stringify(result));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
