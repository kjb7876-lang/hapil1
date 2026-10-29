'use strict';
// Exact, reviewable protected-runtime delta. SOURCE is a committed revision, not
// an adjustable working-tree snapshot; later edits require another extension.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='43f9b257199f3cb25d81bf0ef3fdc8243f8dbd81',SOURCE='e6b810b080326d507e78bc01159212fd8360c231',PREVIOUS='53493745c0c27cd17085bc2fba7addf595c7b0ad609c2a9c7ec8ee80f2d42074',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/controller-v31406/hero-controls.js':'Keep active touch ownership when keyboard movement ends or the controller clears input.',
 'assets/hapil-mobile-v31406.js':'Preserve touch movement ownership across release and cancellation of other input sources.',
 'assets/index-v31526.js':'Preserve other touch ownership when the native pad releases its direction.',
 'assets/rc111/mobile-auto.js':'Maintain separate keyboard and touch movement owners and release held movement safely.',
 'assets/rc15/hero-controls.js':'Keep active touch ownership when keyboard movement ends or the controller clears input.',
 'assets/rc232/projectile-readability.js':'Prevent repeated enhancement of canvas-backed projectile textures while preserving source opacity and contact geometry.',
 'assets/rc88/danmaku-rpg.js':'Restore persisted awakening in the native single-ghost save path after the final battle is created.',
 'index.html':'Cache-bust only the changed movement and projectile runtime modules.'
};
assert.match(SOURCE,/^[a-f0-9]{40}$/,'final runtime source commit must be pinned');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...args)=>cp.execFileSync('git',['--no-replace-objects',...args],{cwd:root,maxBuffer:64e6});
function rows(ref){return git('ls-tree','-r','-z',ref,'--',...ROOTS).toString().split('\0').filter(Boolean).map(line=>{const m=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(line);assert(m,'ordinary runtime entry');return{file:m[3],mode:m[1],gitBlob:m[2]};}).sort((a,b)=>a.file.localeCompare(b.file));}
const before=rows(BASE),after=rows(SOURCE),old=new Map(before.map(r=>[r.file,r])),next=new Map(after.map(r=>[r.file,r]));
const bundleBefore=git('show',BASE+':assets/index-v31526.js').toString('utf8'),bundleAfter=git('show',SOURCE+':assets/index-v31526.js').toString('utf8');
const nativePatches=[
 ['  function refresh(s,key){if(owns(s.input,key)||keyboardOwns(s.input,key))s.input.add(key);else s.input.delete(key);}','  function refresh(s,key){if(owns(s.input,key)||keyboardOwns(s.input,key)||window.__HAPIL_MOBILE_V31366__?.owns(s.input,key)||window.__HAPIL_MOBILE_AUTO_V31311__?.owns(s.input,key))s.input.add(key);else s.input.delete(key);}'],
 ["  window.__HAPIL_MOBILE_V31343__=Object.freeze({version:'3.13.43',down,up,leave,owns,clear,clearAll,","  window.__HAPIL_MOBILE_V31343__=Object.freeze({version:'3.13.43',down,up,leave,owns,clear,clearAll,hasPointers:()=>active.size>0,"]
];
let expectedBundle=bundleBefore;
for(const [from,to] of nativePatches){assert.equal(expectedBundle.split(from).length,2,'one exact native pad anchor');expectedBundle=expectedBundle.replace(from,to);}
assert.equal(bundleAfter,expectedBundle,'native bundle changes only the reviewed input ownership lines');
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-159.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'extension begins at exact published output');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only reviewed runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-160.json');
assert.deepEqual(rows('HEAD'),after,'committed runtime must equal pinned source build');require('./rc133-preservation.cjs').verifyFiles(root,after);
cp.execFileSync(process.execPath,[path.join(root,'tools/rc215-build-native.cjs'),'--check'],{cwd:root,stdio:'pipe'});
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target).compare(bytes),0,'manifest must equal pinned source build');else fs.writeFileSync(target,bytes);
console.log('RC234_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),nativeSourceSynchronized:true,check:process.argv.includes('--check')}));
