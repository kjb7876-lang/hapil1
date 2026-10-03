'use strict';
// Published read-only check: no response substitution, forced HP or progress injection.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));
const root=path.resolve(__dirname,'../..'),base='https://kjb7876-lang.github.io/hapil1/',out=process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results/rc130-public');fs.mkdirSync(out,{recursive:true});
const files=['index.html','assets/index-v31526.js','assets/rc130/projectile-policy.js','assets/rc130/audio-policy.js','assets/rc23/feedback.js','assets/rc128/combat-feedback.js','assets/rc127/combat-policy.js','assets/rc127/dark-jelly.js','assets/rc129/danmaku-director.js','assets/rc129/danmaku-hud.js','assets/rc77/connected-laser.js','assets/rc43/bloodied-flight.js','assets/combat-v31412/skill-completion.js','assets/story-narration/v1/mixer.js','assets/story-narration/v1/player.js','audio/v31361/contact-kinetic.wav','audio/v31361/contact-heavy.wav'];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const report={version:'RC130',testedCommit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),base,files:[],readiness:[],profiles:[],status:'running',attachmentImported:false,scope:'Read-only deployed bytes and natural startup, not full campaigns or physical-phone performance'};
const save=()=>fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2));
async function main(){let browser;try{
 for(const file of files){const expected=hash(fs.readFileSync(path.join(root,file)));let match=null;
  for(let attempt=0;attempt<30;attempt++){let row;try{const url=new URL(file,base);url.searchParams.set('rc130-verify',report.testedCommit+'-'+Date.now());const r=await fetch(url,{signal:AbortSignal.timeout(20000)}),actual=hash(Buffer.from(await r.arrayBuffer()));row={file,attempt,status:r.status,expected,actual};}catch(e){row={file,attempt,error:String(e.message)};}report.readiness.push(row);save();if(row.status===200&&row.actual===expected){match=row;break;}await sleep(4000);}
  assert(match,'Exact committed public bytes unavailable: '+file);report.files.push(match);save();
 }
 browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const[name,width,height,mobile]of[['pc',1180,757,false],['portrait',390,844,true],['landscape',844,390,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),page=await context.newPage(),row={name,errors:[],httpErrors:[],samples:[],status:'running'};report.profiles.push(row);page.setDefaultTimeout(30000);page.on('pageerror',e=>row.errors.push(String(e.stack||e)));page.on('response',r=>{if(r.status()>=400)row.httpErrors.push({url:r.url(),status:r.status()});});
  try{
   await page.goto(base+'?v=43001&qa=1');await page.waitForFunction(()=>window.__HAPIL_RC130_NATIVE_INSTALLED__&&window.__HAPIL_RC127_INSTALLED__&&window.__HAPIL_DANMAKU_HUD_RC129__?.installed);await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();assert.equal(await page.locator('[data-game-mode-v31354="HELL"]:visible').count(),0,'HELL stays removed');await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00');
   for(let i=0;i<12&&await page.locator('#hapil-story-rc51').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(100);}
   const sample=()=>page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__;return{time:s.time,x:s.x,y:s.y,hp:s.hp,mode:s.gameModeV31346,speed:s.rc127MovementSpeed,shots:s.hostileProjectiles.length,finite:s.hostileProjectiles.every(p=>[p.x,p.y,p.vx,p.vy].every(Number.isFinite)),policy:window.__HAPIL_PRESENTATION_RC130__.snapshot(),audio:window.__HAPIL_AUDIO_RC130__.snapshot(),danmaku:window.__HAPIL_DANMAKU_HUD_RC129__.snapshot(s).installed};});
   row.samples.push(await sample());await page.keyboard.down('ArrowRight');await page.waitForTimeout(400);await page.keyboard.up('ArrowRight');
   for(let i=0;i<8;i++){await page.waitForTimeout(1500);row.samples.push(await sample());}
   const first=row.samples[0],last=row.samples.at(-1);assert(last.time>first.time+2,'natural combat advances');assert(row.samples.every(v=>Number.isFinite(v.hp)&&v.finite&&Math.abs(v.speed-6.471685)<1e-8),'fixed movement and finite simulation');assert(row.samples.every(v=>v.policy.maxRatio<=.200001),'observed live bitmap size cap');assert(last.policy.projectileCalls>0,'real game used size guard');assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);row.status='passed';
  }catch(e){row.status='failed';row.error=String(e.stack||e);}finally{await page.screenshot({path:path.join(out,'published-'+name+'.png')}).catch(e=>{row.screenshotError=String(e);});save();console.log('RC130_PUBLIC_PROFILE',JSON.stringify(row));await context.close();}
 }
 report.status=report.profiles.length===3&&report.profiles.every(p=>p.status==='passed')?'passed':'failed';
 }catch(e){report.status='failed';report.error=String(e.stack||e);console.error(e);}finally{save();await browser?.close();console.log('RC130_PUBLIC_RESULT',JSON.stringify({status:report.status,testedCommit:report.testedCommit,files:report.files.length,profiles:report.profiles.map(p=>({name:p.name,status:p.status,errors:p.errors,httpErrors:p.httpErrors})),attachmentImported:false}));process.exitCode=report.status==='passed'?0:1;}}
main();
