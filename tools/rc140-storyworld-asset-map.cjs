// Build a route-by-route asset index from the shipped runtime catalogs.
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa/rc140/storyworld-asset-map.json');
const readJson=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const maps=(()=>{const w={};w.window=w;require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'assets/rc138/map-data.js'),'utf8'),w);return w.__HAPIL_MAP_DATA_RC138__;})();
const midboss=readJson('assets/rc140/story-cycle-midboss-index.json');
const narration=readJson('assets/story-narration/v1/manifest.json');
const additionalAudio=readJson('delivery/additional-audio13-20261005/manifest.json');
const bossData=(()=>{const w={};w.window=w;require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'assets/rc137/art-data.js'),'utf8'),w);return w.__HAPIL_BOSS_ART_DATA_RC137__;})();
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
const collectStrings=(value,found=new Set())=>{if(typeof value==='string'&&/^(?:\.\/)?assets\//.test(value))found.add(value.replace(/^\.\//,''));else if(Array.isArray(value))for(const item of value)collectStrings(item,found);else if(value&&typeof value==='object')for(const item of Object.values(value))collectStrings(item,found);return found;};
(async()=>{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e.stack||e)));
  await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
  await page.waitForFunction(()=>window.__HAPIL_RC86_BRIDGE__?.zoneActors&&window.__HAPIL_MAP_DATA_RC138__&&window.__HAPIL_RC140_MIDBOSS_DATA__&&window.__HAPIL_STORY_DATA_RC51__,null,{timeout:30000});
  const runtime=await page.evaluate(()=>{
   const bridge=window.__HAPIL_RC86_BRIDGE__,stories=window.__HAPIL_STORY_DATA_RC51__;
   const runtimeMaps=Object.fromEntries(Object.entries(window.__HAPIL_MAP_DATA_RC138__).map(([id,row])=>[id,{map:row.map,mapVariants:['stale']} ]));
   window.__HAPIL_MAP_FORMAT_RC138__.install(runtimeMaps);
   for(const[id,row]of Object.entries(window.__HAPIL_MAP_DATA_RC138__))if(runtimeMaps[id]?.map!==row.activeMap)throw new Error('runtime map mismatch '+id);
   const slimStory=(stories?.records??[]).map(r=>({zone:r.zone,rest:r.rest===true,title:r.title??null,sourceRef:`${stories.sourceFile}#${r.zone}`,sourceSha256:stories.sourceSha256}));
   const zones=Object.entries(window.__HAPIL_MAP_DATA_RC138__).map(([id,map])=>{
    const runtimeMap=runtimeMaps[id]?.map??null;
    return{id,map:{source:map.map,active:map.activeMap,runtime:runtimeMap,decision:map.decision,floorCenterY:map.floorCenterY},actors:bridge.zoneActors(id).map(a=>({
      id:a.id,name:a.name,kind:a.kind??null,boss:a.boss===true,midboss:a.midboss===true,sprite:a.sprite??null,
      actionSprites:a.actionSprites??null,actionSpritesByPhase:a.actionSpritesByPhase??null,phaseSprites:a.phaseSprites??null,
      phaseNames:a.phaseNames??null,phaseCount:a.phaseCount??null,phaseMax:a.phaseMax??null,phaseThresholds:a.phaseThresholds??null,
      patternSet:a.patternSet??null,signatureProfile:bridge.signatureProfile(a)??null,signatureAttack:bridge.signatureAttack(a)??null,
      phasePresentation:a.phasePresentationV31217??null,patterns:bridge.patterns(a)??[]
    }))};
   });
   return{zones,storyRecords:slimStory,storySource:{file:stories?.sourceFile??null,sha256:stories?.sourceSha256??null,bytes:stories?.sourceBytes??null},
    storyCycleCharacters:window.__HAPIL_RC140_STORY_CYCLE_ART__?.characters??{},bossProjectileSource:window.__HAPIL_BOSS_ART_DATA_RC137__?.source??null};
  });
  if(errors.length)throw new Error('browser page errors: '+errors.join('\n'));
  const midbossByZone={};for(const[id,row]of Object.entries(midboss.identities))for(const zone of row.routes)(midbossByZone[zone]??=[]).push({id,name:row.name,atlas:row.atlas,motions:Object.fromEntries(Object.entries(row.motions).map(([pose,f])=>[pose,{path:f.path,sourceRect:f.sourceRect,pivot:f.pivot}])),expectedFission:row.expectedFission??null});
  const zones=runtime.zones.map(zone=>{
   const bossSkills=bossData.cells.filter(x=>x.zone===zone.id).map(x=>({owner:x.owner,name:x.name,sourceRect:x.rect,alphaCore:x.alphaCore,pixelSha256:x.pixelSha256,source:bossData.source.path,sourceSha256:bossData.source.sha256}));
   const scenes=Object.entries(narration.scenes??{}).filter(([key])=>key.startsWith(zone.id+'.')).map(([key,row])=>({key,audio:row.audio,sha256:row.sha256,duration:row.duration,textSha256:row.textSha256}));
   const story=runtime.storyRecords.filter(r=>r.zone===zone.id);
   return{...zone,midbossMotionProfiles:midbossByZone[zone.id]??[],bossSkillProjectileArt:bossSkills,story:{records:story,narrationScenes:scenes},storyCycleCharacterArt:runtime.storyCycleCharacters[zone.id]??null};
  });
  const refs=new Set();for(const zone of zones){collectStrings(zone.map,refs);collectStrings(zone.actors,refs);collectStrings(zone.midbossMotionProfiles,refs);collectStrings(zone.bossSkillProjectileArt,refs);collectStrings(zone.storyCycleCharacterArt,refs);for(const row of zone.story.narrationScenes){const p=path.posix.normalize(path.posix.join('assets/story-narration/v1',row.audio));if(p.startsWith('assets/'))refs.add(p);}}
  if(runtime.bossProjectileSource?.path)refs.add(runtime.bossProjectileSource.path);
  const assets=[...refs].sort().map(p=>{const file=path.join(root,p);if(!fs.existsSync(file))return{path:p,exists:false};const bytes=fs.readFileSync(file);return{path:p,exists:true,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};});
  const missing=assets.filter(a=>!a.exists).map(a=>a.path);
  if(missing.length)throw new Error('missing referenced assets: '+missing.join(', '));
  if(zones.length!==55||midboss.identityCount!==33||Object.values(midbossByZone).reduce((n,r)=>n+r.length,0)!==35)throw new Error('unexpected route or motion catalog coverage');
  const result={schema:'hapil-storyworld-asset-map-v1',capturedFromCommit:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),generatedAt:new Date().toISOString(),coverage:{zoneCount:zones.length,actorCount:zones.reduce((n,z)=>n+z.actors.length,0),midbossIdentityCount:midboss.identityCount,midbossRouteCount:Object.values(midbossByZone).reduce((n,r)=>n+r.length,0),bossSkillSourceCellCount:bossData.cells.length,narrationSceneCount:Object.values(narration.scenes??{}).length,storyRecordCount:runtime.storyRecords.length,checkedAssetCount:assets.length,missingAssetCount:missing.length},sources:{mapCatalog:'assets/rc138/map-data.js',mapRuntime:'assets/rc138/map-format.js',midbossMotionIndex:'assets/rc140/story-cycle-midboss-index.json',bossSkillAtlas:'assets/rc137/art-data.js',storyRecordSource:runtime.storySource,narrationManifest:'assets/story-narration/v1/manifest.json',additionalAudioSource:'delivery/additional-audio13-20261005/manifest.json'},additionalAudio:{runtimeIntegrated:additionalAudio.runtimeIntegrated,originals:additionalAudio.audioFileCount,bytes:additionalAudio.allFileBytes,assignment:'unassigned: no semantic listening audit was available'},missingAssets:missing,assets,zones};
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({output:path.relative(root,out),status:missing.length?'missing-assets':'passed',...result.coverage,capturedFromCommit:result.capturedFromCommit},null,2));
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
