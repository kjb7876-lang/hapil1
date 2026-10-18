'use strict';
// Reproduce the exact authorized RC228 review-fix runtime extension. A later
// runtime edit cannot be accepted by rerunning this builder: SOURCE is pinned.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='c6a085d49a7690e8631d9bb9add90613b6881887',SOURCE='82aa6e58d9219f1399af37ccf9486e01636ca8ac',PREVIOUS='3b9164d3d30d084195e52664cc1d95f50a170da998fba4727c3df2a6613b7e03',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/index-v31526.js':'Restore a canceled follow-up share at the native raw-power read before adaptive scaling and outgoing damage commits.',
 'assets/rc225/shooter.js':'Admit interludes only for authored pending boss waves and retain completion across repeated clear/camera reads until native wave consumption or checkpoint reset.',
 'assets/rc226/shooting-completion.js':'Restore reserved primary power exactly once when a follow-up recipient expires or disappears before contact, keeping rejected contacts and native resource awards unchanged.',
 'index.html':'Cache-bust only the four exact reviewed runtime outputs.'
};
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...args)=>cp.execFileSync('git',['--no-replace-objects',...args],{cwd:root,maxBuffer:64e6});
function rows(ref){return git('ls-tree','-r','-z',ref,'--',...ROOTS).toString().split('\0').filter(Boolean).map(line=>{const m=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(line);assert(m,'ordinary runtime entry');return{file:m[3],mode:m[1],gitBlob:m[2]};}).sort((a,b)=>a.file.localeCompare(b.file));}
const before=rows(BASE),after=rows(SOURCE),old=new Map(before.map(r=>[r.file,r])),next=new Map(after.map(r=>[r.file,r]));
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-153.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'new extension starts at the exact published-main runtime');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only explicitly scoped runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-154.json');
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target).compare(bytes),0,'manifest must equal the exact pinned source build');else fs.writeFileSync(target,bytes);
assert.deepEqual(rows('HEAD'),after,'committed runtime must equal the pinned source build');require('./rc133-preservation.cjs').verifyFiles(root,after);
console.log('RC228_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),check:process.argv.includes('--check')}));
