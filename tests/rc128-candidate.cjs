'use strict';
// Used by the existing read-only audit. The public checkout and its game files are
// never edited. This suite creates a disposable local worktree, not a remote branch.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results','rc128-candidate'));
const {build,manifest}=require('../tools/rc128-candidate.cjs');fs.mkdirSync(out,{recursive:true});
const run=(command,args,options={})=>cp.spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,...options});
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const git=(...args)=>{const r=run('git',args);if(r.status!==0)throw Error(r.stderr||'git failed');return r.stdout.trim();};
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hapil-rc128-')),candidate=path.join(directory,'candidate');
const report={commit:git('rev-parse','HEAD'),scope:'isolated candidate; staged browser fixtures and existing regressions are not full-campaign natural play',startedAt:new Date().toISOString(),status:'running',suites:[],files:{},protectedFiles:{}};
const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));save();
try{
 const generated=build(root);report.files=manifest(generated);
 for(const f of ['assets/index-v31526.js','assets/rc77/connected-laser.js','assets/rc127/combat-policy.js','assets/rc127/dark-jelly.js','assets/combat-v31412/skill-completion.js','assets/rc95/combat-flow.js'])report.protectedFiles[f]=hash(path.join(root,f));
 git('worktree','add','--detach',candidate,'HEAD');
 for(const[f,text]of Object.entries(generated))fs.writeFileSync(path.join(candidate,f),text);
 for(const f of ['assets/rc128/awakening-policy.js','assets/rc128/combat-feedback.js'])report.files[f]=hash(path.join(candidate,f));
 for(const[f,expected]of Object.entries(report.protectedFiles))if(hash(path.join(candidate,f))!==expected)throw Error('Protected file changed: '+f);
 fs.writeFileSync(path.join(out,'candidate-manifest.json'),JSON.stringify({commit:report.commit,files:report.files,protectedFiles:report.protectedFiles},null,2));
 for(const f of [...Object.keys(generated).filter(f=>/\.(?:js|cjs)$/.test(f)),'assets/rc128/awakening-policy.js','assets/rc128/combat-feedback.js','tests/rc128-policy.cjs','tests/rc128-browser.cjs']){
  const result=run(process.execPath,['--check',f],{cwd:candidate});if(result.status!==0)throw Error('Syntax check '+f+'\n'+result.stderr);
 }
 const suites=['rc128-policy','rc128-browser','rc127-policy','rc127-browser','rc126-finite-native','rc126-combat-safety-smoke','rc43-bloodied-projectile-flight','rc126-combat-browser','rc125-adaptive-battlefield-browser','rc125-first-frame-browser','rc123-boundary-smoke','rc122-autoplay-policy-smoke','rc115-map-advance-smoke','rc91-samong-and-laser-smoke'];
 for(const name of suites){
  const output=path.join(out,name);fs.mkdirSync(output,{recursive:true});const started=Date.now();
  const result=run(process.execPath,['tests/'+name+'.cjs'],{cwd:candidate,timeout:name==='rc128-browser'?240000:180000,env:{...process.env,HAPIL_QA_OUTPUT:output,HAPIL_RELEASE_OUTPUT:output}});
  fs.writeFileSync(path.join(output,'stdout.log'),result.stdout||'');fs.writeFileSync(path.join(output,'stderr.log'),result.stderr||'');
  const row={name,status:result.status===0&&!result.error?'passed':'failed',exitCode:result.status,signal:result.signal,durationMs:Date.now()-started,error:result.error?String(result.error):null};report.suites.push(row);save();
  console.log('RC128_SUITE',JSON.stringify(row));
  if(row.status!=='passed'){console.log((result.stdout||'').slice(-6000));console.error((result.stderr||'').slice(-12000));}
 }
 report.status=report.suites.every(r=>r.status==='passed')?'passed':'failed';
}catch(error){report.status='failed';report.error=String(error.stack||error);console.error(error);}
finally{
 report.finishedAt=new Date().toISOString();save();
 try{git('worktree','remove','--force',candidate);}catch(error){report.cleanupWarning=String(error);save();}
 fs.rmSync(directory,{recursive:true,force:true});
 console.log('RC128_CANDIDATE_RESULT',JSON.stringify(report));
 process.exitCode=report.status==='passed'?0:1;
}
