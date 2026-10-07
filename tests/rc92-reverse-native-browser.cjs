// Reverse coverage, not a natural campaign speedrun: map/save fixtures preserve
// authored registries while native UI/input/damage/render paths run in Chromium.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),os=require('node:os');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||path.join(os.tmpdir(),'hapil-rc92');fs.mkdirSync(out,{recursive:true});
const harness='\nwindow.__RC92_NATIVE__={initial:oi,maps:N,combatZones:he,enter:ii,ailments:MONGSE_tickSevenSinHeroEffects,commit:HAPIL_commitFinalEndingV31301};';
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.woff':'font/woff','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(file.endsWith('index-v31526.js')?fs.readFileSync(file,'utf8')+harness:fs.readFileSync(file));}catch{res.writeHead(404).end();}
}).listen(0,'127.0.0.1');
const results=[];
(async()=>{const browser=await chromium.launch({chromiumSandbox: true, executablePath:process.env.HAPIL_CHROMIUM,args:['--disable-dev-shm-usage']});try{
 for(const mobile of [true,false]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile}),page=await context.newPage(),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.status()===404&&r.url().startsWith('http://127.0.0.1:'))missing.push(r.url());});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.keyboard.press('Escape');
  await page.evaluate(()=>window.__HAPIL_SAMONG_RC91__.unlock(null,'777'));
  await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.locator('.hero-card').nth(7).click();
  await page.locator('[data-game-mode-v31354="DREAM"]').click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();
  await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00'&&window.__HAPIL_SAMONG_RC91__?.installed);
  await page.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.setMode('manual'));
  const maps=await page.evaluate(()=>{
   const T=window.__RC92_NATIVE__,B=window.__HAPIL_RC86_BRIDGE__,A=window.__HAPIL_SAMONG_RC91__,heroes=[...A.heroes].reverse();
   const route=[...window.__HAPIL_STORY_DATA_RC51__.records].reverse(),rows=[],paths=new Set();
   route.push({zone:'ep1a07',rest:false,index:0});
   for(const rec of route)for(const mode of ['DREAM','STORY']){
    const s=T.initial();Object.assign(s,{activeHeroId:'gunner',gameModeV31346:mode,hp:240,maxHp:240,zone:rec.zone,frontierZone:rec.zone});
    T.enter(s,rec.zone,false);B.modeApi.tick(s);A.scaleEnemies(s);
    for(const enemy of s.enemies){
     if(![enemy.x,enemy.y,enemy.hp,enemy.maxHp].every(Number.isFinite))throw Error('nonfinite native actor '+rec.zone+'/'+enemy.id);
     if(enemy.hp>0&&enemy.samongStatsRC91)enemy.hp=Math.max(1,enemy.hp-3);
    }
    const expected=A.snapshot(s).enemies;
    const raw=B.serializeSave(s,s.activeHeroId,[],{},0),saved=B.normalizeSave(raw);
    if(!saved)throw Error('save normalization refused '+rec.zone+'/'+mode);
    const loaded=T.initial();Object.assign(loaded,{zone:saved.zone,activeHeroId:saved.heroId,gameModeV31346:saved.gameModeV31346,hp:saved.hp,maxHp:240,enemies:B.restoreEnemies(saved),clues:new Set(saved.clues),completedZones:new Set(saved.completedZones),spawnedWaves:new Set(saved.spawnedWaves),loopCycles:saved.loopCycles,bossDefeated:saved.bossDefeated});
    B.restoreEntry(loaded,saved);B.restoreFinalBattle(loaded,saved);
    const archived=rec.zone==='ep1a07';
    if(archived){if(T.combatZones.includes(rec.zone)||saved.zone!=='ep1a08'||loaded.enemies.some(a=>String(a.id).startsWith('a07-')))throw Error('deleted encounter save migration regressed');}
    else for(const prior of expected){const enemy=loaded.enemies.find(a=>String(a.id)===prior.id);if(!enemy||Math.abs(enemy.hp-prior.hp)>1e-6||Math.abs(enemy.maxHp-prior.maxHp)>1e-6)throw Error('reverse save mismatch '+rec.zone+'/'+mode+'/'+prior.id+' '+JSON.stringify({expected:prior,actual:enemy&&{hp:enemy.hp,maxHp:enemy.maxHp},savedZone:saved.zone,combatZone:T.combatZones.includes(rec.zone),savedIds:saved.enemies?.map(a=>a.id),restoredIds:loaded.enemies.map(a=>a.id)}));}
    if(mode==='DREAM'&&loaded.hapilFinalBattleV31300)throw Error('Story final leaked into Samong '+rec.zone);
    if(rec.zone==='cult04'&&mode==='DREAM'&&T.commit(loaded,'gunner',[],{},0).reason!=='story-ending-only')throw Error('Samong committed Story ending');
    const before=loaded.enemies.map(a=>({id:a.id,hp:a.hp,max:a.maxHp}));for(let i=0;i<8;i++)A.scaleEnemies(loaded);
    for(const prior of before){const enemy=loaded.enemies.find(a=>a.id===prior.id);if(Math.abs(enemy.hp-prior.hp)>1e-6||enemy.maxHp!==prior.max)throw Error('stacked stats '+rec.zone+'/'+mode+'/'+prior.id);}
    for(const hero of heroes)for(const asset of B.zoneAssetManifest(rec.zone,hero,[])??[])if(typeof asset==='string'&&!asset.startsWith('data:'))paths.add(asset);
    const map=T.maps[rec.zone];if(!map?.map)throw Error('missing arena '+rec.zone);paths.add(map.map);
    rows.push({zone:rec.zone,mode,actors:s.enemies.length,savedActors:archived?0:expected.length,rest:!!rec.rest,archived,migratedZone:archived?saved.zone:null});
   }
   return{rows,paths:[...paths]};
  });
  assert.equal(maps.rows.length,124);const bad=maps.paths.filter(asset=>{let file;try{file=decodeURIComponent(new URL(asset,'http://localhost/').pathname);}catch{return true;}return !fs.existsSync(path.join(root,file));});
  assert.deepEqual(bad,[],'every reverse map/hero asset manifest resolves to shipped bytes');
  const revival=await page.evaluate(()=>{
   const s=window.__MONGSE_QA_STATE__,A=window.__HAPIL_SAMONG_RC91__,C=window.__HAPIL_CONTROLS_V31329__,T=window.__RC92_NATIVE__,source=s.enemies.find(a=>a.hp>0),rows=[];
   for(const hero of [...A.heroes].reverse()){
    s.activeHeroId=hero;C.binding.hero.current=hero;s.hp=1;s.invulnerableUntil=0;s.awakeningUntil=0;s.resonance=0;s.heroDamageTakenMultiplier=1;
    Object.assign(s.samongPassiveRC91,{active:0,cooldown:0,grace:0});s.heroHealingBlockedUntil=s.time+10;s.heroHealingCeiling=1;
    const accepted=window.__HAPIL_COMBAT_CORE_V31401__.player(s,100,s.x,s.y,{id:'rc92-heal-block-'+hero,sourceId:source.id,boss:true,heavyBossSkill:true,shape:'line',hostile:true});
    T.ailments(s);rows.push({hero,accepted,hp:s.hp,expected:Math.ceil(s.maxHp*.5),active:A.active(s),ceiling:s.heroHealingCeiling,healBlock:s.heroHealingBlockedUntil>s.time});
   }
   s.heroHealingBlockedUntil=0;s.samongPassiveRC91.active=0;s.samongPassiveRC91.grace=0;s.hp=s.maxHp;
   return rows;
  });
  assert.equal(revival.length,8);assert(revival.every(r=>r.accepted&&r.active&&r.hp===r.expected&&r.ceiling===r.expected&&r.healBlock),JSON.stringify(revival));
  await page.screenshot({path:path.join(out,'rc92-'+(mobile?'mobile':'desktop')+'.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  const row={mobile,reverseCases:maps.rows.filter(r=>!r.archived).length,legacyMigrationCases:maps.rows.filter(r=>r.archived).length,manifestPaths:maps.paths.length,actorsSaved:maps.rows.reduce((n,r)=>n+r.savedActors,0),revivalHeroes:revival.length,pageErrors:errors.length};results.push(row);console.log('RC92_REVERSE_NATIVE_PASS',JSON.stringify(row));
  fs.writeFileSync(path.join(out,'reverse-'+(mobile?'mobile':'desktop')+'.json'),JSON.stringify(maps.rows,null,2));await context.close();
 }
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(results,null,2));
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
