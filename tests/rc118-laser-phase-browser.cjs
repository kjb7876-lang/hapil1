// RC109 natural laser owner routes: invoke each real cast entrypoint, render its
// live stage, compare raster coverage to the same hit geometry, then expire it.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||'/workspace/hapil-deliverables/RC118-phase';fs.mkdirSync(out,{recursive:true});
const harness='\nwindow.__RC109_NATIVE__={initial:oi,cast:(...a)=>Ei(...a),queue:(...a)=>MONGSE_queueImage(...a),impact:(...a)=>MONGSE_spawnTelegraphedImpact(...a),drawEffect:(...a)=>Gn(...a),project:G,core:p=>window.__HAPIL_COMBAT_V31333__?.core(p),hit:Di};';
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.wav':'audio/wav'})[path.extname(f)]||'application/octet-stream');res.end(f.endsWith('index-v31526.js')?(process.env.RC118_BASELINE?execFileSync('git',['show','d9bcd51693456ff778a953650940a11dae5a4d66:assets/index-v31526.js'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}):fs.readFileSync(f,'utf8'))+harness:fs.readFileSync(f));}catch{res.writeHead(404).end();}}).listen(0,'127.0.0.1');
async function main(){let browser;try{
 browser=await chromium.launch({chromiumSandbox: true, channel: 'chrome', args:['--disable-dev-shm-usage']});
 const page=await browser.newPage(process.env.RC118_MOBILE?{viewport:{width:844,height:390},isMobile:true,hasTouch:true}:{viewport:{width:1180,height:757}});await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
 // RC33 installs after the bundle and replaces each owner's beam URL. Creating
 // a cast before that replacement can leave its beam unequal to its owner's
 // current beam and make valid() reject the first warning frame. Wait for the
 // actual renderer/owner installation rather than an earlier blood-layer flag.
 await page.waitForFunction(baseline=>window.__HAPIL_BLOOD_RC16__?.installed&&window.__HAPIL_RC33__?.installed&&window.__HAPIL_CONNECTED_LASER_V31377__?.installed&&(baseline||window.__HAPIL_RC133_NATIVE__?.installed),!!process.env.RC118_BASELINE);
 const rows=await page.evaluate(async()=>{
 const R=window.__RC109_NATIVE__,B=window.__HAPIL_RC86_BRIDGE__,L=window.__HAPIL_LASERS_V31332__;
   const clean=state=>{Object.assign(state,{time:105,x:18,y:16,hp:100000,maxHp:100000,invulnerableUntil:10000,practiceV31329:true,gameModeV31346:'DREAM',activeHeroId:'hwando',pendingHits:[],impactQueue:[],hostileProjectiles:[],effects:[],bossLaserCastsV31330:[],bossUltimateCastsV31334:[]});state.fxSerial=100;state.enemies=[];return state;};
  function stateFor(id,zone){const s=clean(R.initial());s.zone=zone;const raw=B.actor(zone,id),a=B.cloneEnemy(raw,zone);Object.assign(a,{hp:a.maxHp||100000,maxHp:a.maxHp||100000,humanPhase0:false,fixedPhase:1,currentPhase:1,phaseIndex:1,x:16,y:16,attackAt:0,attackImpactAt:0,readyAt:0,patternReadyAt:0,spectacleReadyAtV31317:0,cosmicArsenalReadyAtV31318:0,invulnerableUntil:0,combatEntryGraceUntilV31239:0,phaseTransitionUntil:0,phaseTransitionActive:false,staggerUntil:0,atomicCastUntil31210:0,castVisualUntil31210:0,activePatternUntil:0,recoverUntil:0});s.enemies=[a];return{s,a};}

 const out=[];
 for(const lowFx of [false,true]){
 const {s,a}=stateFor('dist06-boss','dist06'),c=L.start(s,a,'fork-link'),cache={};if(!c)throw Error('cast unavailable');
 const tear=R.queue(cache,c.tear,'eager'),beam=R.queue(cache,c.beam,'eager');await Promise.all([tear.decode(),beam.decode()]);
 const cv=document.createElement('canvas');cv.width=1280;cv.height=720;const ctx=cv.getContext('2d');const native=ctx.drawImage.bind(ctx);
 for(const [phase,time]of [['warning',c.fireAt-.1],['boundary',c.fireAt],['active',c.fireAt+.05],['concurrent',c.fireAt+.05],['late',c.fireAt+.3],['expired',c.endAt+.01]]){
 s.time=time;s.bossLaserCastsV31330=phase==='concurrent'?[c,{...c,id:c.id+1,born:c.born+1,fireAt:c.fireAt+1,endAt:c.endAt+1}]:[c];ctx.clearRect(0,0,1280,720);let tearDraws=0,beamDraws=0,sources=[];ctx.drawImage=(im,...args)=>{sources.push({src:im.src||null,w:im.width,h:im.height,args});if(args.length===4&&args[2]===12)tearDraws++;if(args.length===8||args.length===9)beamDraws++;return native(im,...args);};
 L.draw(ctx,cache,s,{lowFx,reducedFlash:lowFx});let pixels=0;const data=ctx.getImageData(0,0,1280,720).data;for(let i=3;i<data.length;i+=4)if(data[i]>20)pixels++;
 out.push({lowFx,phase,tearDraws,beamDraws,sources,pixels,png:cv.toDataURL()});
 }
 }
 return out;
 });
 for(const r of rows){fs.writeFileSync(path.join(out,`${r.lowFx?'mobile-lowFx':'desktop'}-${r.phase}-${process.env.RC118_BASELINE?'before':'after'}.png`),Buffer.from(r.png.split(',')[1],'base64'));delete r.png;}
 console.log(JSON.stringify(rows));fs.writeFileSync(path.join(out,'phase-'+(process.env.RC118_BASELINE?'before':'after')+'.json'),JSON.stringify(rows,null,2));
 for(const r of rows){if(r.phase==='warning')assert.equal(r.tearDraws,2);if(r.phase==='concurrent'){assert.equal(r.tearDraws,process.env.RC118_BASELINE?4:2);assert(r.beamDraws>0);}if(r.phase==='active'||r.phase==='boundary')assert.equal(r.tearDraws,process.env.RC118_BASELINE?2:0);if(r.phase==='active'||r.phase==='late')assert(r.beamDraws>0);if(r.phase==='expired')assert.equal(r.pixels,0);}
 }finally{await browser?.close();server.close();}}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
