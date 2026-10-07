const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/rc152-tools/node_modules','playwright'));
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc152-evidence';fs.mkdirSync(out,{recursive:true});
const profile=process.env.RC137_PROFILE||'pc',dimensions={pc:[1280,900],portrait:[390,844],landscape:[844,390]}[profile];
const bridge='\nwindow.__RC152_QA__={actors:z=>N[z]?.enemies??[],queue:MONGSE_queueImage,draw:Ln,point:G};';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav'};
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!p.startsWith(root+'/'))return res.writeHead(403).end();try{res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');const b=fs.readFileSync(p);res.end(p.endsWith('/assets/index-v31526.js')?Buffer.concat([b,Buffer.from(bridge)]):b)}catch{res.writeHead(404).end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({chromiumSandbox: true, channel: 'chrome', args:['--disable-dev-shm-usage']});const report={staged:true,baselineSha:'c7bc9e7d97c4b961987049c656fe624b463e0a58',commit:require('child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),dirty:!!require('child_process').execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),viewport:{width:Number(process.env.RC152_WIDTH)||dimensions[0],height:Number(process.env.RC152_HEIGHT)||dimensions[1]},errors:[],profiles:[]};try{
 const page=await browser.newPage({viewport:{width:Number(process.env.RC152_WIDTH)||dimensions[0],height:Number(process.env.RC152_HEIGHT)||dimensions[1]},deviceScaleFactor:profile==='pc'?1:2,isMobile:profile!=='pc',hasTouch:profile!=='pc'});page.on('pageerror',e=>report.errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__RC152_QA__&&window.__HAPIL_MEDIA_ART_RC133__?.ready,{timeout:60000});await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__&&window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game');
 const data=await page.evaluate(async oldSource=>{
  const fixed=window.__HAPIL_BODY_ASH_RC145__;eval(oldSource);const old=window.__HAPIL_BODY_ASH_RC145__;window.__HAPIL_BODY_ASH_RC145__=fixed;
  const Q=__RC152_QA__,C=__HAPIL_CONTROLS_V31329__,B=__HAPIL_RC86_BRIDGE__,cache=C.binding.cache.current,s=__MONGSE_QA_STATE__;C.setMode('manual');s.time=100;s.zone='dist06';
  const actor=B.cloneEnemy(Q.actors('dist06').find(a=>a.id==='dist06-boss'),'dist06');Object.assign(actor,{x:18,y:14,balrogPoseModeRC151:'upright-body-separated-raised-sword',maxHp:100});
  for(const p of [__MONGSE_BALROG_POSE_RC151__.body,__MONGSE_BALROG_POSE_RC151__.weapon,actor.sprite])await Q.queue(cache,p,'eager').decode();
  const rows=[],images=[];
  for(const size of [210,500])for(const facing of [-1,1])for(const pose of ['idle','raised','recovery'])for(const ratio of [1,.7,.699,.4,.15,0]){
   actor.hp=ratio*100;actor.facing=facing;actor.attackAt=pose==='raised'?101:0;actor.recoverUntil=pose==='recovery'?101:0;
   const center=Q.point(actor.x,actor.y),anchor={x:center.x,y:center.y+500},options={actorV31338:actor,actorTimeV31338:100,scaleX:facing,offsetY:500};
   const canvases=Array.from({length:3},()=>{const c=document.createElement('canvas');c.width=1400;c.height=1600;return c});
   const draw=ctx=>Q.draw(ctx,cache,actor.sprite,actor.x,actor.y,size,options);draw(canvases[0].getContext('2d'));
   for(const [i,A]of[[1,old],[2,fixed]]){const args={ctx:canvases[i].getContext('2d'),actor,sprite:actor.sprite,size,center:anchor,time:100,drawBody:draw,cacheable:false};if(ratio===0)A.death({...args,actor:{...actor,sourceActorIdRC145:actor.id,burnRC144:true},progress:0,ready:true});else A.living(args);}
   const pixels=canvases.map(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data),lost=[0,0],missing=[0,0],edge=[];let original=0;
   for(let i=3;i<pixels[0].length;i+=4)if(pixels[0][i]>16){original++;for(let j=0;j<2;j++)if(pixels[j+1][i]<=16){lost[j]++;if(pixels[j+1][i]===0)missing[j]++;else if(j===1&&edge.length<8)edge.push([i,pixels[0][i],pixels[j+1][i]]);}}
   rows.push({size,facing,pose,ratio,original,beforeLost:lost[0],afterLost:lost[1],beforeMissing:missing[0],afterMissing:missing[1],edge});
   if(size===210&&facing===1&&pose==='raised'&&ratio===.699)images.push(...canvases.map(c=>c.toDataURL()));
  }
  // A reusable scratch canvas must inherit the current renderer instrumentation.
  const prototype=CanvasRenderingContext2D.prototype,baseDraw=prototype.drawImage,counts=[0,0],probe=document.createElement('canvas');probe.width=1400;probe.height=1600;actor.hp=40;
  try{for(let j=0;j<2;j++){prototype.drawImage=function(im,...args){if(im instanceof HTMLImageElement)counts[j]++;return baseDraw.call(this,im,...args);};fixed.living({ctx:probe.getContext('2d'),actor,sprite:actor.sprite,size:210,center:Q.point(actor.x,actor.y),time:100,drawBody:d=>Q.draw(d,cache,actor.sprite,actor.x,actor.y,210,{actorV31338:actor,actorTimeV31338:100})});if(!counts[j])throw Error('scratch retained obsolete drawImage hook '+j);}}finally{prototype.drawImage=baseDraw;}
  const motions=window.__HAPIL_MOB_MOTIONS_RC137__,mobRows=[],mobImages=[],center=Q.point(actor.x,actor.y);
  for(const r of motions.data.actors){
   if(r.source&&!motions.picture(r.attack))await motions.load(r.source);
   const a={id:r.id,x:18,y:14,hp:40,maxHp:100,attackAt:101},g=motions.geometry(a,r.attack,90),meta=B.spriteMetadata(r.idle)??[0,0,1,1,.5,.96],ih=r.idleGeometry.size[1],bounds=r.idleGeometry.alphaBounds;
   if(!g)throw Error('missing pose calibration '+r.id);
   const idleHeight=90*(bounds[3]-bounds[1])/(ih*meta[3]),foot=90*((bounds[3]/ih-meta[1])/meta[3]-meta[5]);
   mobRows.push({id:r.id,coreHeight:g.coreHeight,idleHeight,footY:g.footY,idleFootY:foot,heightError:Math.abs(g.coreHeight-idleHeight),footError:Math.abs(g.footY-foot)});
   if(['dist01-s1','dist01-sp1','dist01-m1'].includes(r.id)){
    await Q.queue(cache,r.idle,'eager').decode();
    const c=document.createElement('canvas');c.width=750;c.height=420;const ctx=c.getContext('2d');ctx.fillStyle='#14202d';ctx.fillRect(0,0,750,420);
    for(const [j,pose]of ['idle','attack','recovery'].entries()){ctx.save();ctx.translate(j*250+125-center.x,300-center.y);const path=pose==='idle'?r.idle:r.attack;
     const draw=d=>{if(!window.__HAPIL_STAND_V31335__.drawBody(d,cache,a,100,{},path,90,{scaleX:1}))Q.draw(d,cache,path,a.x,a.y,90,{actorV31338:a});};fixed.living({ctx,actor:a,sprite:path,size:90,center:{x:center.x,y:center.y},time:100,drawBody:draw,cacheable:pose==='idle'});ctx.restore();ctx.fillStyle='#eef';ctx.fillText(r.id+' '+pose,j*250+40,360);}
    mobImages.push({id:r.id,png:c.toDataURL()});
   }
  }
  s.paused=true;s.zone='dist06';s.time=100;s.enemies=[actor];s.pendingHits=[];s.impactQueue=[];s.hostileProjectiles=[];s.effects=[];s.targetEnemyId=actor.id;actor.hp=69.9;actor.maxHp=100;actor.attackAt=101;actor.recoverUntil=102;actor.facing=-1;actor.x=24.8;actor.y=13.2;
  const nativeCanvas=document.createElement('canvas');nativeCanvas.width=1280;nativeCanvas.height=720;window.__HAPIL_BODY_ASH_RC145__=old;B.renderFrame(nativeCanvas,s,cache,s.activeHeroId??'gunner',C.binding.settings?.current??{});const nativeBefore=nativeCanvas.toDataURL();window.__HAPIL_BODY_ASH_RC145__=fixed;B.renderFrame(nativeCanvas,s,cache,s.activeHeroId??'gunner',C.binding.settings?.current??{});
  return{rows,images,mobRows,mobImages,scratchHooks:counts,nativeBefore,nativeSize:[nativeCanvas.width,nativeCanvas.height],nativeImage:nativeCanvas.toDataURL(),metrics:fixed.metrics()};
 },require('child_process').execFileSync('git',['show','c7bc9e7d97c4b961987049c656fe624b463e0a58:assets/rc145/body-ash.js'],{cwd:root,encoding:'utf8'}));
 for(let i=0;i<data.images.length;i++)fs.writeFileSync(path.join(out,['balrog-direct','balrog-before','balrog-after'][i]+'.png'),Buffer.from(data.images[i].split(',')[1],'base64'));delete data.images;for(const row of data.mobImages)fs.writeFileSync(path.join(out,'mob-'+row.id+'.png'),Buffer.from(row.png.split(',')[1],'base64'));delete data.mobImages;
 fs.writeFileSync(path.join(out,'balrog-native-before.png'),Buffer.from(data.nativeBefore.split(',')[1],'base64'));delete data.nativeBefore;fs.writeFileSync(path.join(out,'balrog-native-frame.png'),Buffer.from(data.nativeImage.split(',')[1],'base64'));delete data.nativeImage;report.alpha=data;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({cases:data.rows.length,beforeClippedCases:data.rows.filter(x=>x.beforeLost>0).length,afterClippedCases:data.rows.filter(x=>x.afterLost>0).length,beforeLostMax:Math.max(...data.rows.map(x=>x.beforeLost)),afterLostMax:Math.max(...data.rows.map(x=>x.afterLost)),errors:report.errors}));assert(data.rows.some(x=>x.beforeLost>0));assert(data.rows.every(x=>x.afterMissing===0&&x.edge.every(v=>Math.abs(v[1]-v[2])<=2&&x.beforeLost===x.afterLost&&x.beforeMissing===0)));assert(data.metrics.boundsOverflow===0);assert(data.metrics.scratchCanvases<=7);assert(data.metrics.overlayBytes<=data.metrics.maxOverlayBytes);assert(data.mobRows.length===197);assert(data.mobRows.every(r=>r.heightError<1e-9&&r.footError<1e-9));assert.deepEqual(report.errors,[]);
 }finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
