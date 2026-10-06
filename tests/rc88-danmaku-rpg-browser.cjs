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
    hostileProjectiles:[],pendingHits:[],impactQueue:[],pendingStrikes:[],loopCycles:{},spawnedWaves:new Set(),rc88Encounter:undefined});
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
  window.__HAPIL_STORY_RC51__.close(false);
  const s=state('cult04'),boss=b.cloneEnemy(b.actor('cult04','c104-boss'),'cult04');
  Object.assign(boss,{hapilSecondPhaseV31300:true,hp:boss.maxHp});s.enemies=[boss];
  s.hapilFinalBattleV31300={stage:7,secondPhaseActive:true,monochromeActiveV31377:true,completed:false,awakeningPendingRC108:true,combatElapsedRC79:0};
  const samong=window.__HAPIL_SAMONG_COSMIC_V386__;samong.tick(s);
  if(!s.hapilSamongCosmicWaveV386)throw Error('samong wave missing '+JSON.stringify({mode:window.__HAPIL_MODES_V31346__.mode(s),hp:s.hp,bossHp:boss.hp,battle:s.hapilFinalBattleV31300}));
  const summons=[];
  s.hapilFinalBattleV31300.combatElapsedRC79=s.hapilSamongCosmicWaveV386.nextAt;
  samong.tick(s);
  const six=s.enemies.filter(a=>a.rc88InteractiveCosmic&&a.hp>0);
  if(six.length!==6||six.some(a=>a.episodeBossSummon))throw Error('six independent Cosmic bodies did not enter together');
  for(const a of six){
    if(!a.rc89Wraith)throw Error('Cosmic wraith art missing '+a.id);
    const cache={};await Promise.all(samong.audit().bosses[a.samongCosmicIndexV386-1].assets.map(path=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{cache[path]=im;resolve();};im.onerror=reject;im.src=path;})));
    b.phaseSprite(cache,a,s.time);await new Promise(resolve=>setTimeout(resolve,30));const picture=b.phaseSprite(cache,a,s.time);
    if(!String(picture).startsWith('data:image/png')||!cache[picture]?.naturalWidth)throw Error('wraith art failed '+a.id);
    s.time=a.samongCosmicDispatchAtV386+.001;s.hapilFinalBattleV31300.combatElapsedRC79+=.26;samong.tick(s);
    if(!a.samongCosmicPatternDispatchedV386)throw Error('native signature failed '+a.id);
    summons.push({id:a.id,signature:a.samongCosmicPatternNameV386,impactCount:s.pendingHits.length+s.hostileProjectiles.length+(s.bossLaserCastsV31330?.length??0)});
  }
  if(s.hapilSamongCosmicWaveV386.status!=='crisis'||s.hp!==1)throw Error('six signatures did not cause player crisis');
  const saved=api.snapshot(s),restored=state('cult04');restored.enemies=[{...boss}];restored.hapilFinalBattleV31300={...s.hapilFinalBattleV31300};
  api.restore(restored,saved,s.hapilFinalBattleV31300.combatElapsedRC79,boss.maxHp);
  if(restored.enemies.filter(a=>a.rc88InteractiveCosmic&&a.hp>0).length!==6||restored.hapilSamongCosmicWaveV386.status!=='crisis')throw Error('mid-crisis save did not restore six bodies');
  s.hapilFinalBattleV31300.combatElapsedRC79=s.hapilSamongCosmicWaveV386.crisisAt+1.3;s.time+=1.3;samong.tick(s);
  for(let i=0;i<5;i++){s.time+=.29;s.hapilFinalBattleV31300.combatElapsedRC79+=.29;samong.tick(s);}
  if(s.hapilSamongCosmicWaveV386.status!=='complete'||api.snapshot(s).cosmicKills.length!==6)throw Error('player awakening did not defeat all six '+JSON.stringify({wave:s.hapilSamongCosmicWaveV386,kills:api.snapshot(s).cosmicKills,battle:s.hapilFinalBattleV31300,time:s.time,hp:s.hp,live:s.enemies.filter(a=>a.rc88InteractiveCosmic).map(a=>a.id)}));
  if(s.enemies.some(a=>a.id==='c104-boss')||!s.hapilFinalBattleV31300.completed||!s.bossDefeated)throw Error('leader did not dissolve after six');
  const tree=state('dist00');tree.enemies=[b.cloneEnemy(b.actor('dist00','dist00-boss'),'dist00')];api.tick(tree);tree.time=12;api.tick(tree);
  const a=tree.enemies.find(a=>a.rc88Part);if(!a)throw Error('dist00 native emitter missing before save '+JSON.stringify({zone:tree.zone,mode:window.__HAPIL_MODES_V31346__.mode(tree),actors:tree.enemies.map(q=>({id:q.id,hp:q.hp,boss:q.boss,protected:q.protectedNarrativeTargetV31307})),memory:tree.rc88Encounter}));a.hp=0;api.beforeDeath(tree,a);
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
