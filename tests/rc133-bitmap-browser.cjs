'use strict';
// Staged collision-boundary fixtures on real native final renderers. No natural campaign claim.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));
const root=path.resolve(__dirname,'..'),out=path.join(process.env.HAPIL_QA_OUTPUT||'/tmp/rc133-bitmap','bitmap');fs.mkdirSync(out,{recursive:true});
const bridge='\nwindow.__RC133_BITMAP_QA__={initial:oi,project:G,draw:HAPIL_drawProjectileRC13,queue:MONGSE_queueImage,camera:s=>HAPIL_viewCameraRC104(s.x,s.y,s)};';
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.wav':'audio/wav','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(f.endsWith('/assets/index-v31526.js')?fs.readFileSync(f,'utf8')+bridge:fs.readFileSync(f));}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const report={commit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),scope:'Staged native final image/alpha/camera/RC130 contact boundaries',profiles:[]};try{
 browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,width,height,mobile] of [['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),row={name,errors:[]};report.profiles.push(row);page.on('pageerror',e=>row.errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1');await page.waitForFunction(()=>window.__HAPIL_RC133_NATIVE__?.installed&&window.__HAPIL_MEDIA_ART_RC133__?.ready);await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game'&&window.__HAPIL_CONTROLS_V31329__.binding.state.current);await page.locator('.game-stage canvas').waitFor({state:'visible'});
  row.result=await page.evaluate(async()=>{
   const Q=window.__RC133_BITMAP_QA__,M=window.__HAPIL_MEDIA_ART_RC133__,V=window.__HAPIL_BITMAP_NATIVE_RC133__,C=window.__HAPIL_CONTACT_V31336__,canvas=document.querySelector('.game-stage canvas'),ctx=canvas.getContext('2d'),cache=Object.create(null),s=Q.initial(),B=window.__HAPIL_CONTROLS_V31329__.binding;
   Object.assign(s,{zone:'cult04',time:100,x:16,y:24,hp:240,maxHp:240,activeHeroId:'gunner',enemies:[],gameModeV31346:'STORY',encounterLockUntil31226:0,encounterDialogue31226:null});for(const p of M.assets()){const image=M.picture(p);if(image)cache[p]=image;}V.observe(canvas,cache);
   // This fixture selects gunner while the live party initially renders hwando.
   // Queue gunner through the actual renderer and wait for its native image decode.
   let torso=null;const deadline=performance.now()+10000;
   while(!(torso=V.body(s,s,true))&&performance.now()<deadline)await new Promise(resolve=>setTimeout(resolve,20));
   const results=[],problems=[];let checks=0;const test=(pass,label,extra)=>{checks++;if(!pass)problems.push({label,extra});};
   for(const [skill,sprite] of Object.entries({...M.skills,...Object.fromEntries(Object.entries(M.personaSkills).map(([k,v])=>['persona-'+k,v]))}))for(const population of [1,12,24]){
    s.time+=.1;const q={id:83,sourceId:'inner-evil-rc133',boss:true,kind:'projectile',born:90,sourceBorn:90,x:16,y:24,previousX:15.96,previousY:23.99,vx:3,vy:1,radius:.24,sprite,color:'#ee3344',accent:'#fff',visualScaleV31224:1.5};s.hostileProjectiles=Array.from({length:population},()=>q);
    const plan=V.projectile(s,q);test(!!plan,'pre-render plan exists '+skill+'/'+population);
    if(!plan)continue;
    const position=Q.project(q.x,q.y),expected=[],baseDraw=ctx.drawImage;ctx.save();let base;
    try{
     ctx.setTransform(canvas.width/1280,0,0,canvas.height/720,0,0);ctx.globalAlpha=1;window.__HAPIL_ADAPTIVE_RC125__?.applyWorld(ctx,canvas,s);const cam=Q.camera(s);ctx.translate(cam.x,cam.y);ctx.scale(cam.scale??1,cam.scale??1);base=ctx.getTransform();
     ctx.drawImage=function(...args){if(args.length!==5&&args.length!==9||this.globalAlpha<.5)return;const im=args[0],alpha=window.__HAPIL_RENDER_RC13__.imageBounds(im),crop=args.length===9?args.slice(1,5):[0,0,im.naturalWidth,im.naturalHeight],[sx,sy,sw,sh]=crop,[dx,dy,dw,dh]=args.slice(-4),transform=base.inverse().multiply(this.getTransform()),l=Math.max(sx,alpha.x),t=Math.max(sy,alpha.y),r=Math.min(sx+sw,alpha.x+alpha.w),b=Math.min(sy+sh,alpha.y+alpha.h);const point=(x,y)=>{const a=dx+(x-sx)/sw*dw,c=dy+(y-sy)/sh*dh;return{x:transform.a*a+transform.c*c+transform.e-position.x,y:transform.b*a+transform.d*c+transform.f-position.y+18};};expected.push({area:Math.abs((r-l)/sw*dw*(b-t)/sh*dh*(transform.a*transform.d-transform.b*transform.c)),points:[point(l,t),point(r,t),point(r,b),point(l,b)]});};
     const lod=population>=24?0:population>=12?1:2;Q.draw(ctx,cache,{...q},s.time,{...B.settings.current,projectileLodSmartR1:lod,lowFx:B.settings.current.lowFx||lod===0});
    }finally{ctx.drawImage=baseDraw;ctx.restore();}
    const actual=expected.sort((a,b)=>b.area-a.area)[0],delta=actual?Math.max(...actual.points.map((p,i)=>Math.hypot(p.x-plan.points[i].x,p.y-plan.points[i].y))):Infinity;
    test(delta<1e-6,'contact pixels equal final renderer after enlargement/cap '+skill+'/'+population,{delta});
    const unchanged=V.projectile(s,q);test(JSON.stringify(plan)===JSON.stringify(unchanged),'render cannot change same-frame contact '+skill+'/'+population);
    const giant={...q,visualScaleV31224:999};const capped=V.projectile(s,giant);test(!!capped&&capped.area<100000,'oversized bitmap remains bounded '+skill+'/'+population);
    const evidence=C.projectile(s,s,q);test(evidence.bitmap===true,'simulation uses final image plan '+skill+'/'+population);q.collisionDisabledUntil31219=s.time+1;test(!C.projectile(s,s,q).hit,'warning remains collision-free '+skill+'/'+population);
    results.push({skill,population,delta,area:plan.area,hit:evidence.hit,heart:evidence.heart});
   }
   test(!!torso,'real player body measured');const body=C.body(s,s);test(body.rx<=16&&body.ry>=16&&body.ry<=33,'anatomical body excludes weapon/aura',{body});
   // No providers or draw callbacks mutate native health or enqueue attacks.
   test(s.hp===240&&s.pendingHits.length===0,'geometry replay cannot damage or enqueue');
   return{checks,problems,results,metrics:V.metrics()};
  });assert.deepEqual(row.errors,[]);assert.deepEqual(row.result.problems,[]);await context.close();console.log('RC133_BITMAP_PROFILE',JSON.stringify({name,checks:row.result.checks,status:'passed'}));
 }
 report.status='passed';
 }catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
