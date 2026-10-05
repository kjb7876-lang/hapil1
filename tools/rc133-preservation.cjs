'use strict';
// Exact authorized RC133 delta, then the unchanged reviewed-85 guard on its
// detached baseline. No path class is exempt from current byte/mode validation.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const BASE='4670211fcd1a2e5076a3f9c57fc67e55cd0486a9';
const DELTA_HASH='47e45218eea38f09453ddaa5b2f8639e9a5d9e0f1c0a332c4382a5fa6dd27b11';
const EXTENSION_BASE='0a4965a17ac69a05ffd79645a537a0f202417408';
const EXTENSION_HASH='c658a708420029780e20346cf916706e2d69f9b5b92dacf4df9ea3879c381a3b';
const ROOTS=['assets','audio','data','index.html'];
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function rows(exec,ref){return exec('git',['ls-tree','-r','-z',ref,'--',...ROOTS]).split('\0').filter(Boolean).map(line=>{const m=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(line);assert(m,'Nonordinary protected Git entry');return {mode:m[1],gitBlob:m[2],file:m[3]};}).sort((a,b)=>a.file.localeCompare(b.file));}
function treeShape(values){return values.map(({file,mode,gitBlob})=>({file,mode,gitBlob})).sort((a,b)=>a.file.localeCompare(b.file));}
function verifyFiles(root,expected){
 const files=[],dirs=[];const walk=file=>{let st;try{st=fs.lstatSync(path.join(root,file));}catch(e){if(e.code==='ENOENT')return;throw e;}assert(!st.isSymbolicLink(),'Protected symlink: '+file);if(st.isDirectory()){dirs.push(file);for(const name of fs.readdirSync(path.join(root,file)))walk(file+'/'+name);}else{assert(st.isFile(),'Nonordinary protected file: '+file);files.push(file);}};
 for(const dir of ROOTS)walk(dir);
 assert.deepEqual(files.sort(),expected.map(r=>r.file).sort(),'Protected file inventory differs');
 const expectedDirs=new Set();for(const row of expected)for(let dir=path.posix.dirname(row.file);dir!=='.';dir=path.posix.dirname(dir))expectedDirs.add(dir);
 assert.deepEqual(dirs.sort(),[...expectedDirs].sort(),'Protected directory inventory differs');
 for(const row of expected){const file=path.join(root,row.file),st=fs.lstatSync(file),bytes=fs.readFileSync(file);assert.equal(st.mode&0o111?'100755':'100644',row.mode,'Protected file mode: '+row.file);assert.equal(crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),row.gitBlob,'Protected file bytes: '+row.file);if(row.sha256)assert.equal(digest(bytes),row.sha256,'Approved delta digest: '+row.file);}
 return {checkedFiles:files.length,checkedDirectories:dirs.length,workingTreeMatches:true};
}
function verify(root){
 root=path.resolve(root);assert(fs.lstatSync(root).isDirectory()&&!fs.lstatSync(root).isSymbolicLink());
 const exec=(cmd,args,cwd=root)=>cp.execFileSync(cmd,cmd==='git'?['--no-replace-objects',...args]:args,{cwd,encoding:'utf8',maxBuffer:48*1024*1024});
 for(const ref of [BASE,EXTENSION_BASE])if(cp.spawnSync('git',['--no-replace-objects','cat-file','-e',ref+'^{commit}'],{cwd:root,stdio:'ignore'}).status!==0)exec('git',['fetch','--no-tags','--depth=1','origin',ref]);
 const bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-delta.json'));assert.equal(digest(bytes),DELTA_HASH,'Authorized runtime delta changed');const delta=JSON.parse(bytes);
 assert.equal(delta.version,1);assert.equal(delta.base,BASE);assert.deepEqual(delta.protectedRoots,ROOTS);assert.equal(exec('git',['rev-parse',BASE+'^{tree}']).trim(),delta.baseTree,'Detached baseline tree pin');
 const base=rows(exec,BASE),expected=new Map(base.map(r=>[r.file,r]));assert.equal(new Set(delta.files.map(r=>r.file)).size,delta.files.length,'Duplicate approved delta path');
 for(const row of delta.files){const old=expected.get(row.file);assert.deepEqual(old??null,row.before,'Approved delta preimage: '+row.file);assert(row.after&&row.after.file===row.file&&/^[a-f0-9]{64}$/.test(row.after.sha256)&&/^[a-f0-9]{40}$/.test(row.after.gitBlob)&&['100644','100755'].includes(row.after.mode),'Malformed exact delta');assert(typeof row.reason==='string'&&row.reason.length>8,'Missing approved scope');expected.set(row.file,row.after);}
 const target=[...expected.values()],publishedBase=rows(exec,EXTENSION_BASE);assert.deepEqual(treeShape(publishedBase),treeShape(target),'Prior published protected tree must equal the original exact delta output');
 const extensionBytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension.json'));assert.equal(digest(extensionBytes),EXTENSION_HASH,'Authorized runtime extension changed');const extension=JSON.parse(extensionBytes);
 assert.equal(extension.version,1);assert.equal(extension.base,EXTENSION_BASE);assert.deepEqual(extension.protectedRoots,ROOTS);assert.equal(extension.previousDeltaSha256,DELTA_HASH);assert.equal(exec('git',['rev-parse',EXTENSION_BASE+'^{tree}']).trim(),extension.baseTree,'Prior public baseline tree pin');
 const extended=new Map(publishedBase.map(r=>[r.file,r])),changed=new Set();assert.equal(new Set(extension.files.map(r=>r.file)).size,extension.files.length,'Duplicate extension path');
 for(const row of extension.files){assert(!changed.has(row.file),'Duplicate exact extension row: '+row.file);changed.add(row.file);const old=extended.get(row.file);assert.deepEqual(old??null,row.before,'Exact extension preimage: '+row.file);assert(typeof row.reason==='string'&&row.reason.includes(row.file)&&row.reason.length>8,'Missing exact extension scope: '+row.file);if(row.after===null)extended.delete(row.file);else{assert(row.after.file===row.file&&/^[a-f0-9]{64}$/.test(row.after.sha256)&&/^[a-f0-9]{40}$/.test(row.after.gitBlob)&&['100644','100755'].includes(row.after.mode),'Malformed exact extension output: '+row.file);extended.set(row.file,row.after);}}
 const runtimeTarget=[...extended.values()];assert.equal(extension.targetProtectedRowsSha256,digest(Buffer.from(JSON.stringify(treeShape(runtimeTarget)))),'Exact extension protected output fingerprint');assert.deepEqual(treeShape(rows(exec,'HEAD')),treeShape(runtimeTarget),'Committed runtime differs from exact authorized extension');const current=verifyFiles(root,runtimeTarget);const narration86=require('./story-narration-release86-preservation.cjs').verify(root);
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'hapil-rc133-baseline-')),baseline=path.join(temp,'baseline');let added=false;
 try{
  exec('git',['worktree','add','--detach',baseline,BASE]);added=true;
  for(const [file,hash]of Object.entries(delta.baselineGuards))assert.equal(digest(fs.readFileSync(path.join(baseline,file))),hash,'Unchanged historical guard pin: '+file);
  const prior=require(path.join(baseline,'tools/story-narration-release85-preservation.cjs')).verify(baseline);assert.equal(prior.report.status,'passed');assert(prior.historical,'Historical compatibility proof missing');
  return {historical:prior.historical,report:{status:'passed',base:BASE,deltaSha256:DELTA_HASH,authorizedFiles:delta.files.length,extensionBase:EXTENSION_BASE,extensionSha256:EXTENSION_HASH,extensionFiles:extension.files.length,narration86,currentRuntimeProof:{...current,committedTreeMatches:true},approvedDelta:delta.files,approvedExtension:extension.files,historicalProof:prior.report,method:'Exact per-file preimage/output hashes and full committed/working inventory; original published tree pinned to the first approved delta; unchanged reviewed-85 and prior preservation guards on detached pinned baseline'}};
 }finally{try{if(added)exec('git',['worktree','remove','--force',baseline]);}finally{fs.rmSync(temp,{recursive:true,force:true});}}
}
module.exports={verify,verifyFiles,BASE,EXTENSION_BASE,EXTENSION_HASH};
if(require.main===module)console.log('RC133_PRESERVATION_RESULT',JSON.stringify(verify(path.resolve(__dirname,'..')).report));
