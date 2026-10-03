'use strict';
// Test the exact extended checkout in a disposable worktree. Explicitly project
// only the RC129 loader and the independently merged narration loader back to
// the accepted historical RC128 HTML. Never normalize away final-byte changes.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results','rc128-candidate'));
const {build,manifest}=require('../tools/rc128-candidate.cjs');fs.mkdirSync(out,{recursive:true});
const run=(command,args,options={})=>cp.spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,...options});
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),hash=file=>digest(fs.readFileSync(file));
function narrationIndexBase(text){
 const tags=[
  /    <script src="\.\/assets\/story-narration\/v1\/mixer\.js\?v=\d+"><\/script>\n/g,
  /    <script src="\.\/assets\/story-narration\/v1\/player\.js\?v=\d+"><\/script>\n/g,
  /    <link rel="stylesheet" href="\.\/assets\/story-narration\/v1\/player\.css\?v=\d+">\n/g,
  /    <script defer src="\.\/assets\/story-narration\/v1\/surfaces\.js\?v=\d+"><\/script>\n/g
 ];
 if(!text.includes('./assets/story-narration/v1/player.js'))return text;
 for(const expression of tags){if([...text.matchAll(expression)].length!==1)throw Error('Unexpected narration index tag');text=text.replace(expression,'');}
 for(const [asset,version] of [['assets/rc49/story-voice.js','34901'],['assets/index-v31526.js','42701'],['assets/hapil-title-v31342.js','35101'],['data/story-rc51.js','39301'],['assets/rc51/story.js','40801'],['assets/title/v31236/christian-opening-v31236.js','36101']]){
  const escaped=asset.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),expression=new RegExp('(src="\\./'+escaped+'\\?v=)\\d+','g');
  if([...text.matchAll(expression)].length!==1)throw Error('Unexpected narration cache key');text=text.replace(expression,(_,prefix)=>prefix+version);
 }
 return text;
}
const git=(...args)=>{const r=run('git',args);if(r.status!==0)throw Error(r.stderr||'git failed');return r.stdout.trim();};
const accepted={
 'assets/rc91/samong-awakening.js':'e10f8ca145914fe517cbf88012b73a74a5db6c57e8bab5334993c12bb97e9f79',
 'assets/combat-v31402/combat-core.js':'c718770947023a573a9b57cbefcb319940cd434029592fda51bf8d94f7822ece',
 'assets/rc23/feedback.js':'ee519dc6db0990c043c0615914dda6253760644f1dddb2a54724019905aa61b0',
 'index.html':'c26193527a73f0b952f10296d8333f565188f3db048954736cbfbb25eae53a42',
 'tests/rc91-samong-and-laser-smoke.cjs':'ad819358cc886f273abc508d41b4ea8fd17eae14a0364716e77e10c9322e3ddd',
 'assets/rc128/awakening-policy.js':'00c65c9b0d3e60cb1c481f95c60fdca48f0690eb8788d37273b2d28c2eb99c7e',
 'assets/rc128/combat-feedback.js':'64277031f08373305f9a4a0e168ad4032024174857085524b4866d194d1dfbd3'
};
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hapil-rc128-')),candidate=path.join(directory,'candidate');
const report={commit:git('rev-parse','HEAD'),scope:'isolated candidate; staged browser fixtures and regressions are not full-campaign natural play',startedAt:new Date().toISOString(),status:'running',suites:[],files:{},protectedFiles:{}};
const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));save();
try{
 const historical='257b920a470e0ee6a04e5a52d71157f66232682c';
 if(run('git',['cat-file','-e',historical+':index.html']).status!==0)git('fetch','--no-tags','--depth=1','origin',historical);
 report.viewportReference=historical;
 const generated=build(root);report.files=manifest(generated);
 for(const f of ['assets/index-v31526.js','assets/rc77/connected-laser.js','assets/rc127/combat-policy.js','assets/rc127/dark-jelly.js','assets/combat-v31412/skill-completion.js','assets/rc95/combat-flow.js','assets/story-narration/v1/player.js','assets/story-narration/v1/surfaces.js','assets/story-narration/v1/manifest.json','assets/rc51/story.js','data/story-rc51.js'])if(fs.existsSync(path.join(root,f)))report.protectedFiles[f]=hash(path.join(root,f));
 git('worktree','add','--detach',candidate,'HEAD');
 for(const[f,text]of Object.entries(generated))fs.writeFileSync(path.join(candidate,f),text);
 for(const f of ['assets/rc128/awakening-policy.js','assets/rc128/combat-feedback.js'])report.files[f]=hash(path.join(candidate,f));
 for(const[f,expected]of Object.entries(report.protectedFiles))if(hash(path.join(candidate,f))!==expected)throw Error('Protected file changed: '+f);
 const rc129=generated['index.html'].includes('./assets/rc129/danmaku-director.js?v=42901');let prior=generated['index.html'];
 if(rc129){
  for(const f of ['danmaku-director','danmaku-hud']){
   const line='    <script src="./assets/rc129/'+f+'.js?v=42901"></script>\n';
   if(prior.split(line).length!==2)throw Error('RC129 loader must appear once: '+f);
   prior=prior.replace(line,'');report.files['assets/rc129/'+f+'.js']=hash(path.join(candidate,'assets/rc129/'+f+'.js'));
  }
  const old='./assets/rc95/combat-flow.js?v=42901';if(prior.split(old).length!==2)throw Error('RC95 cache revision missing');prior=prior.replace(old,'./assets/rc95/combat-flow.js?v=42701');
  report.explicitRC129LoaderMigration={priorIndexHash:digest(prior),currentIndexHash:report.files['index.html'],newModules:['assets/rc129/danmaku-director.js','assets/rc129/danmaku-hud.js']};
 }
 const indexHash=digest(narrationIndexBase(prior));report.narrationIndexExtension={actual:report.files['index.html'],approvedBase:indexHash,expectedBase:accepted['index.html']};
 report.promotionMismatches=Object.entries(accepted).filter(([f,expected])=>(f==='index.html'?indexHash:report.files[f])!==expected).map(([file,expected])=>({file,expected,actual:report.files[file]}));
 if(report.promotionMismatches.length)throw Error('RC128 preservation mismatch: '+JSON.stringify(report.promotionMismatches));
 fs.writeFileSync(path.join(out,'candidate-manifest.json'),JSON.stringify({commit:report.commit,files:report.files,protectedFiles:report.protectedFiles},null,2));
 for(const f of [...Object.keys(generated).filter(f=>/\.(?:js|cjs)$/.test(f)),'assets/rc128/awakening-policy.js','assets/rc128/combat-feedback.js','tests/rc128-policy.cjs','tests/rc128-browser.cjs',...(rc129?['assets/rc129/danmaku-director.js','assets/rc129/danmaku-hud.js','tests/rc129-unit.cjs','tests/rc129-browser.cjs']:[])]){
  const result=run(process.execPath,['--check',f],{cwd:candidate});if(result.status!==0)throw Error('Syntax check '+f+'\n'+result.stderr);
 }
 const suites=[...(rc129?['rc129-unit','rc129-browser']:[]),'rc128-policy','rc128-browser','rc127-policy','rc127-browser','rc126-finite-native','rc126-combat-safety-smoke','rc43-bloodied-projectile-flight','rc126-combat-browser','rc125-adaptive-battlefield-browser','rc125-first-frame-browser','rc123-boundary-smoke','rc122-autoplay-policy-smoke','rc115-map-advance-smoke','rc91-samong-and-laser-smoke'];
 for(const name of suites){
  const output=path.join(out,name);fs.mkdirSync(output,{recursive:true});const started=Date.now();
  const result=run(process.execPath,['tests/'+name+'.cjs'],{cwd:candidate,timeout:/rc12[89]-browser/.test(name)?240000:180000,env:{...process.env,HAPIL_QA_OUTPUT:output,HAPIL_RELEASE_OUTPUT:output}});
  fs.writeFileSync(path.join(output,'stdout.log'),result.stdout||'');fs.writeFileSync(path.join(output,'stderr.log'),result.stderr||'');
  const row={name,status:result.status===0&&!result.error?'passed':'failed',exitCode:result.status,signal:result.signal,durationMs:Date.now()-started,error:result.error?String(result.error):null};report.suites.push(row);save();console.log('RC128_SUITE',JSON.stringify(row));
  if(name.startsWith('rc129')||name==='rc128-policy'||name==='rc128-browser')console.log(result.stdout||'');
  if(row.status!=='passed'){console.log((result.stdout||'').slice(-6000));console.error((result.stderr||'').slice(-12000));}
 }
 report.status=report.suites.every(r=>r.status==='passed')?'passed':'failed';
}catch(error){report.status='failed';report.error=String(error.stack||error);console.error(error);}
finally{
 report.finishedAt=new Date().toISOString();save();
 try{git('worktree','remove','--force',candidate);}catch(error){report.cleanupWarning=String(error);save();}
 fs.rmSync(directory,{recursive:true,force:true});console.log('RC128_CANDIDATE_RESULT',JSON.stringify(report));process.exitCode=report.status==='passed'?0:1;
}
