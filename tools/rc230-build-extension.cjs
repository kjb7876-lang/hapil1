'use strict';
// Reproduce the exact authorized RC230 review-fix runtime extension. A later
// runtime edit cannot be accepted by rerunning this builder: SOURCE is pinned.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='a06fd95385c9f9cdea53979d3970f638cb075f22',SOURCE='2ee18f20a3f16cfe1704fe8ffebbd8a27d761b26',PREVIOUS='8b47362a63abe4b2d7b3835a333e3046180b402d8bb26959dddc1c40f87b9753',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/rc210/projectile-balance.js':'Preserve the existing native under800px cap40 for fine-pointer desktop as well as touch mobile, with cap56 for wide desktop.',
 'index.html':'Cache-bust only the exact updated admission policy output.'
};
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...args)=>cp.execFileSync('git',['--no-replace-objects',...args],{cwd:root,maxBuffer:64e6});
function rows(ref){return git('ls-tree','-r','-z',ref,'--',...ROOTS).toString().split('\0').filter(Boolean).map(line=>{const m=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(line);assert(m,'ordinary runtime entry');return{file:m[3],mode:m[1],gitBlob:m[2]};}).sort((a,b)=>a.file.localeCompare(b.file));}
const before=rows(BASE),after=rows(SOURCE),old=new Map(before.map(r=>[r.file,r])),next=new Map(after.map(r=>[r.file,r]));
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-155.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'new extension starts at the exact published-main runtime');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only explicitly scoped runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-156.json');
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target).compare(bytes),0,'manifest must equal the exact pinned source build');else fs.writeFileSync(target,bytes);
assert.deepEqual(rows('HEAD'),after,'committed runtime must equal the pinned source build');require('./rc133-preservation.cjs').verifyFiles(root,after);
console.log('RC230_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),check:process.argv.includes('--check')}));
