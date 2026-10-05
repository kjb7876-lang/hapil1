// Staged art and motion integration. Native gameplay HP, enemy health, clocks,
// combat transactions, save data, and story progress are not changed.
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc140-story-cycle-art';fs.mkdirSync(out,{recursive:true});
const index=JSON.parse(fs.readFileSync(path.join(root,'assets/rc140/story-cycle-midboss-index.json')));
assert.equal(index.identityCount,33);assert.equal(index.poseCount,99);assert.deepEqual(index.aliases,{'u205-mid':'u201-mid','u204-mid':'u202-mid'});
for(const[id,row]of Object.entries(index.identities)){
 const asset=path.join(root,row.atlas.path.replace(/^\.\//,''));assert(fs.existsSync(asset),id+' atlas exists');
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex'),row.atlas.sha256,id+' original atlas bytes preserved');
 assert.deepEqual(Object.keys(row.motions).sort(),['anticipation','idle','strike']);
 for(const[motion,frame]of Object.entries(row.motions)){
  const[x,y,w,h]=frame.sourceRect,[px,py]=frame.pivot;assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=row.atlas.width&&y+h<=row.atlas.height,id+' '+motion+' sourceRect in image');
  assert(px>=0&&py>=0&&px<=w&&py<=h,id+' '+motion+' local pivot in sourceRect');
 }
}
const mapText=fs.readFileSync(path.join(root,'assets/rc138/map-data.js'),'utf8');
assert(mapText.includes('"ep1a10":{"map":"./assets/maps/ep1a_10_addiction_city.jpg","activeMap":"./assets/generated-story10-cycle-20261005/ep1a10/ep1a10-hospital-denial-map.png"'));
assert(mapText.includes('"murder01":{"map":"./assets/maps/murder_01_crosswalk.jpg","activeMap":"./assets/rc138/map-murder01.png"'));
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.wav':'audio/wav','.mp3':'audio/mpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname.replace(/^\/$/,'/index.html')));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
const allProfiles=Object.keys(index.identities),mobileProfiles=['mb-ep1a10','mb-murder01','u201-mid','mb-kair01-v31231','kair-great-05'];
async function checkViewport(page,profileIds,name){
 const result=await page.evaluate(async({profileIds,name})=>{
  const b=window.__HAPIL_RC86_BRIDGE__,api=window.__HAPIL_MIDBOSS_MOTIONS_RC135__,idx=window.__HAPIL_RC140_MIDBOSS_DATA__,draws=[],orig=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image?.__rc140Identity)draws.push({identity:image.__rc140Identity,src:new URL(image.src).pathname,args});return orig.call(this,image,...args);};
  const rows=[],routeRows=[],nativeRC133=window.__HAPIL_RC133_NATIVE__;
  function stagedRouteActor(zone,actorId){const native=b.zoneActors(zone).find(a=>a.id===actorId);if(native)return{actor:{...native,rc135FissionZone:zone},actorFound:true,materialization:'static-route-actor'};const source=nativeRC133?.authoredMidboss(zone);if(!source||source.boss||!source.midboss)throw Error('missing native fission source '+zone+'/'+actorId);const actor=b.cloneEnemy(source,zone);if(!actor)throw Error('native fission clone failed '+zone+'/'+actorId);nativeRC133.fissionIdentity(actor,source,zone,0);return{actor,actorFound:false,materialization:'staged-native-fission-clone'};}
  for(const id of profileIds){const entry=idx.identities[id];if(!entry)throw Error('missing RC140 identity '+id);const actorId=entry.actorIds[0]??id,routeActors=new Map();
   for(const zone of entry.routes){const staged=stagedRouteActor(zone,actorId),resolved=api.profile(staged.actor);if(resolved?.id!==id)throw Error('route/profile mismatch '+zone+'/'+id+': '+(resolved?.id??'none'));routeActors.set(zone,staged);routeRows.push({zone,id,actorId:staged.actor.id,actorFound:staged.actorFound,materialization:staged.materialization});}
   const zone=entry.routes[0],{actor,actorFound,materialization}=routeActors.get(zone);
   const image=new Image();image.src=entry.atlas.path;await image.decode();image.__rc140Identity=id;const cache={[entry.atlas.path]:image},queue=(_,path)=>cache[path]??null,canvas=document.createElement('canvas');canvas.width=360;canvas.height=320;const ctx=canvas.getContext('2d');
   for(const motion of ['idle','anticipation','strike']){const staged={...actor,attackAt:motion==='idle'?0:20,attackImpactAt:motion==='anticipation'?15:motion==='strike'?5:0,recoverUntil:0},time=10,presentation={active:false};if(api.pose(staged,time,presentation)!==motion)throw Error('native-clock pose mapping failed '+id+'/'+motion);
    const before=draws.length,ok=api.draw(ctx,cache,staged,time,122,null,queue,()=>({x:180,y:250}),presentation);if(!ok)throw Error('renderer skipped '+id+'/'+motion);const draw=draws[before];const frame=entry.motions[motion],scale=122/entry.baseHeight;
    if(JSON.stringify(draw.args.slice(0,4))!==JSON.stringify(frame.sourceRect))throw Error('sourceRect mismatch '+id+'/'+motion);
    const dest=draw.args.slice(4);if(Math.abs(dest[0]+frame.pivot[0]*scale)>0.02||Math.abs(dest[1]+frame.pivot[1]*scale)>0.02||Math.abs(dest[2]-frame.sourceRect[2]*scale)>0.02||Math.abs(dest[3]-frame.sourceRect[3]*scale)>0.02)throw Error('pivot/scale destination mismatch '+id+'/'+motion);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)visible++;if(visible<20)throw Error('no visible drawn pixels '+id+'/'+motion);ctx.clearRect(0,0,canvas.width,canvas.height);
   }
   rows.push({id,zone,actorId:actor.id,actorFound,boss:!!actor.boss,materialization,poses:3,baseHeight:entry.baseHeight});image.src='';
  }
  const characters=window.__HAPIL_RC140_STORY_CYCLE_ART__?.characters;if(!characters||Object.keys(characters).length!==4)throw Error('four murder portraits not registered');
  window.__HAPIL_STORY_NARRATION_V1__={attach:()=>null};
  const portraitRows=[];
  for(const zone of ['murder01','murder02','murder04','murder03']){const record=window.__HAPIL_STORY_RC51__.records.get(zone),character=characters[zone];if(!record||!character)throw Error('missing story portrait route '+zone);
   const state={zone,hp:100,time:0,gameModeV31346:'STORY'};if(!window.__HAPIL_STORY_RC51__.show(state,record,'pre',record.pre,()=>{},{sound:false}))throw Error('story card did not open '+zone);
   const figure=document.querySelector('.rc140-story-character'),img=figure?.querySelector('img');if(!figure||figure.dataset.character!==character.id||figure.dataset.pose!=='idle')throw Error('story portrait binding mismatch '+zone);await img.decode();const box=figure.getBoundingClientRect();if(img.naturalWidth!==1254||img.naturalHeight!==1254||box.width<70||box.height<110)throw Error('portrait dimensions invalid '+zone);portraitRows.push({zone,id:figure.dataset.character,pose:figure.dataset.pose,natural:[img.naturalWidth,img.naturalHeight],display:[box.width,box.height]});window.__HAPIL_STORY_RC51__.close(false);
  }
  const art=window.__HAPIL_RC140_STORY_CYCLE_ART__,boss=b.actor('murder03','blue-executor');if(!art?.installed||!boss?.rc140StoryCycleArt)throw Error('blue-executor art not installed');
  const bossFrames=[];for(const pose of ['idle','charge','attack']){const f=art.boss[pose],img=new Image();img.src=f.path;await img.decode();const meta=b.spriteMetadata(f.path);if(img.naturalWidth!==1254||img.naturalHeight!==1254||!meta||Math.abs(meta[4]-(f.anchor[0]-f.bounds[0])/(f.bounds[2]-f.bounds[0]))>1e-8)throw Error('blue-executor crop/anchor mismatch '+pose);bossFrames.push({pose,assetPath:f.path,path:new URL(f.path,document.baseURI).pathname,meta});}
  for(const pose of ['idle','charge','attack']){const staged={...boss,attackStarted:pose==='idle'?10:0,attackAt:pose==='idle'?0:20,attackImpactAt:pose==='idle'?0:pose==='charge'?15:5,recoverUntil:pose==='attack'?15:0,phaseTransitionUntil:0,staggerUntil:0,hitUntil:0,castVisualUntil31210:0,telekineticUntil:0,spatialRiftUntil:0,activePattern:''},cache={};for(const f of bossFrames){const im=new Image();im.src=f.assetPath;await im.decode();cache[f.assetPath]=im;}const path=b.phaseSprite(cache,staged,10),expected=art.boss[pose==='idle'?'idle':pose==='charge'?'charge':'attack'].path;if(path!==expected)throw Error('blue-executor native action pose mismatch '+pose+': '+path+' != '+expected);for(const im of Object.values(cache))im.src='';}
  const mapRows=window.__HAPIL_MAP_DATA_RC138__,format=window.__HAPIL_MAP_FORMAT_RC138__,maps=Object.fromEntries(Object.entries(mapRows).map(([id,row])=>[id,{map:row.map,mapVariants:['stale']} ]));format.install(maps);if(maps.ep1a10.map!==mapRows.ep1a10.activeMap||maps.murder01.map!==mapRows.murder01.activeMap||maps.ep1a10.mapVariants.length||maps.murder01.mapVariants.length)throw Error('RC138 map installer did not apply story map selection');
  const mapImages=[];for(const path of [maps.ep1a10.map,maps.murder01.map]){const im=new Image();im.src=path;await im.decode();mapImages.push({path:new URL(path,document.baseURI).pathname,size:[im.naturalWidth,im.naturalHeight]});}
  return{viewport:name,profileDraws:rows.length*3,routeResolutions:routeRows.length,routes:routeRows,profiles:rows,portraits:portraitRows,bossFrames,mapImages};
 },{profileIds,name});
 return result;
}
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;const report={status:'running',codeSha:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),scope:'staged art/render check; no combat damage or campaign progress changed',viewports:[]};const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
try{browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const[name,width,height,mobile]of[['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),row={name,errors:[],httpErrors:[],status:'running'};report.viewports.push(row);page.on('pageerror',e=>row.errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400)row.httpErrors.push({status:r.status(),url:new URL(r.url()).pathname});});await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__HAPIL_RC140_STORY_CYCLE_ART__?.installed&&window.__HAPIL_MIDBOSS_MOTIONS_RC135__?.installed&&window.__HAPIL_RC133_NATIVE__?.installed,null,{timeout:30000});row.result=await checkViewport(page,name==='pc'?allProfiles:mobileProfiles,name);assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);row.status='passed';await page.screenshot({path:path.join(out,name+'.png')});save();await context.close();console.log('PASS RC140 story-cycle art browser',name,row.result.profileDraws);}
 report.status='passed';save();
}catch(error){report.status='failed';report.error=String(error.stack||error);save();throw error;}finally{await browser?.close();server.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
