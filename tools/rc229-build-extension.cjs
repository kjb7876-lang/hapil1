'use strict';
// Reproduce the exact authorized RC229 review-fix runtime extension. A later
// runtime edit cannot be accepted by rerunning this builder: SOURCE is pinned.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='a33b0efc71f8b9666c3995f148dec2f8bba2c869',SOURCE='d3528a3fd9306a9d2feeff262502253c8a0df2f9',PREVIOUS='372e96a30571daf2a2fcf16f356d34b9426729b12eebc527155b427c5c76c17f',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/index-v31526.js':'Check admission before each ordinary primary and density packet; only add a companion after actual primary admission; retain every committed packet.',
 'assets/rc133/native-install-v2.js.txt':'Keep the exact bounded native installation source identical to the primary/density admission wrapper.',
 'assets/rc210/projectile-balance.js':'Apply existing desktop56/mobile40 ordinary boss caps at native creation, preserving Persona/persistent owner admission and existing size/volley identities.',
 'index.html':'Cache-bust only the native bundle and ordinary projectile balance outputs.'
};
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...args)=>cp.execFileSync('git',['--no-replace-objects',...args],{cwd:root,maxBuffer:64e6});
function rows(ref){return git('ls-tree','-r','-z',ref,'--',...ROOTS).toString().split('\0').filter(Boolean).map(line=>{const m=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(line);assert(m,'ordinary runtime entry');return{file:m[3],mode:m[1],gitBlob:m[2]};}).sort((a,b)=>a.file.localeCompare(b.file));}
const before=rows(BASE),after=rows(SOURCE),old=new Map(before.map(r=>[r.file,r])),next=new Map(after.map(r=>[r.file,r]));
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-154.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'new extension starts at the exact published-main runtime');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only explicitly scoped runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-155.json');
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target).compare(bytes),0,'manifest must equal the exact pinned source build');else fs.writeFileSync(target,bytes);
assert.deepEqual(rows('HEAD'),after,'committed runtime must equal the pinned source build');require('./rc133-preservation.cjs').verifyFiles(root,after);
console.log('RC229_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),check:process.argv.includes('--check')}));
