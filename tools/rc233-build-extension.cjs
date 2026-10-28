'use strict';
// Reproduce the exact authorized RC233 camera and projectile quality runtime extension. A later
// runtime edit cannot be accepted by rerunning this builder: SOURCE is pinned.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='346bee26788b789168fca50f63f12a09f6869c2d',SOURCE='59b999d8daf276d36ea38ea19864d734a7eea10b',PREVIOUS='c4ab9e1d0ba0857b2a3a28ca6512476461576a6eaa4ecc16890a89c4d78ff602',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/index-v31526.js':'Synchronize the bounded native pressure, steady-camera and projectile readability integration; outside that region change only the exact arena shake guard, existing camera subscription and existing toggle description.',
 'assets/rc128/combat-feedback.js':'Keep the composited battle picture steady while preserving native flashes, feedback cues and audio.',
 'assets/rc133/native-install-v2.js.txt':'Keep the editable native integration identical to the shipped boss-basic admission, call-through steady-camera and source-owned projectile readability hooks.',
 'assets/rc153/combat-layout.js':'Stabilize native camera fitting and safe whole-body bounds while preserving the exact all-viewport orientation module.',
 'assets/rc223/camera.js':'Separate stored camera preference from effective safe fitting, with stable aspect-aware bounds and live notifications for the existing settings UI.',
 'assets/rc231/combat-lifecycle.js':'Track pressure release and recovery privately without rewriting native signature clocks or saved state; preserve committed packet contact and major-action gates.',
 'assets/rc232/projectile-readability.js':'Improve released native projectile readability using source-alpha-preserving contrast, immediate body visibility and a bounded idle-prepared raster cache without replacing owned art or geometry.',
 'assets/rc95/combat-flow.js':'Admit complete authored salvos fairly during eligible pressure gaps while retaining native phase identity, packet timing, geometry, damage and admission caps.',
 'index.html':'Load the exact new projectile readability module before the native bundle and cache-bust only the approved quality runtime modules.'
};
assert.match(SOURCE,/^[a-f0-9]{40}$/,'final runtime source commit must be pinned');
assert(Object.keys(reasons).length>0,'final explicit runtime scope is required');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...args)=>cp.execFileSync('git',['--no-replace-objects',...args],{cwd:root,maxBuffer:64e6});
function rows(ref){return git('ls-tree','-r','-z',ref,'--',...ROOTS).toString().split('\0').filter(Boolean).map(line=>{const m=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(line);assert(m,'ordinary runtime entry');return{file:m[3],mode:m[1],gitBlob:m[2]};}).sort((a,b)=>a.file.localeCompare(b.file));}
function orientation(ref){const file='assets/rc153/combat-layout.js',bytes=git('show',ref+':'+file),begin=Buffer.from('/* RC152_ORIENTATION_PAUSE_BEGIN */'),end=Buffer.from('/* RC152_ORIENTATION_PAUSE_END */'),a=bytes.indexOf(begin),b=bytes.indexOf(end,a);assert(a>=0&&b>a&&bytes.indexOf(begin,a+1)===-1&&bytes.indexOf(end,b+1)===-1,'exact bounded orientation module');return bytes.subarray(a,b+end.length);}
assert.equal(orientation(BASE).compare(orientation(SOURCE)),0,'all-viewport orientation module must remain byte-identical to the published base');
function outsideNative(ref){const bytes=git('show',ref+':assets/index-v31526.js'),begin=Buffer.from('/* RC133_NATIVE_INTEGRATION: final lexical bindings, not copied legacy APIs. */'),end=Buffer.from('\n\n/* RC137_DIRECTION_INPUT_NATIVE:'),a=bytes.indexOf(begin),b=bytes.indexOf(end,a);assert(a>=0&&b>a&&bytes.indexOf(begin,a+1)===-1,'exact bounded native integration');return Buffer.concat([bytes.subarray(0,a),bytes.subarray(b)]);}
const outsidePatches=[
 ['enemy-feel-arena-shake-guard',"if(!s||settings.enemyImpactFeedbackV31361===false||settings.screenShakeV31336===false||settings.reducedFlash||hidden(s)||party()?.status?.role==='guest')return{x:0,y:0};","if(!s||window.__HAPIL_BATTLE_ARENA_RC138__?.enabled(s)===true||settings.enemyImpactFeedbackV31361===false||settings.screenShakeV31336===false||settings.reducedFlash||hidden(s)||party()?.status?.role==='guest')return{x:0,y:0};"],
 ['existing-camera-settings-subscription'," const api=window.__HAPIL_CAMERA_RC223__,[value,setValue]=(0,l.useState)(()=>api?.factor?.()??1);"," const api=window.__HAPIL_CAMERA_RC223__,[value,setValue]=(0,l.useState)(()=>api?.factor?.()??1),[,refresh]=(0,l.useState)(0);\n (0,l.useEffect)(()=>api?.subscribe?.(()=>{setValue(api.factor());refresh(revision=>revision+1);}),[api]);"],
 ['existing-screen-shake-toggle-description',"toggle('screenShakeV31336','화면 흔들림','끄면 전투 카메라가 흔들리지 않습니다.')","toggle('screenShakeV31336','화면 흔들림','전투 시야를 제외한 연출의 흔들림을 설정합니다.')"]
];
let expectedOutside=outsideNative(BASE);
for(const [name,from,to]of outsidePatches){const before=Buffer.from(from),after=Buffer.from(to),at=expectedOutside.indexOf(before);assert(at>=0&&expectedOutside.indexOf(before,at+1)===-1,'exact outside-native anchor: '+name);expectedOutside=Buffer.concat([expectedOutside.subarray(0,at),after,expectedOutside.subarray(at+before.length)]);}
assert.equal(outsideNative(SOURCE).compare(expectedOutside),0,'only the three explicit camera/shake edits may change outside the bounded native integration');
function saveBridgeBodies(ref){const text=git('show',ref+':assets/rc133/native-install-v2.js.txt').toString('utf8');return ['  B.serializeSave=','  B.normalizeSave=','  B.restoreEntry='].map(prefix=>{const lines=text.split('\n').filter(line=>line.startsWith(prefix));assert.equal(lines.length,1,'exact native save bridge '+prefix);return lines[0];});}
assert.deepEqual(saveBridgeBodies(SOURCE),saveBridgeBodies(BASE),'original native save/normalize/restore bridge bodies must remain exact');
const before=rows(BASE),after=rows(SOURCE),old=new Map(before.map(r=>[r.file,r])),next=new Map(after.map(r=>[r.file,r]));
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-158.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'new extension starts at the exact published-main runtime');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only explicitly scoped runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-159.json');
assert.deepEqual(rows('HEAD'),after,'committed runtime must equal the pinned source build');require('./rc133-preservation.cjs').verifyFiles(root,after);
cp.execFileSync(process.execPath,[path.join(root,'tools/rc215-build-native.cjs'),'--check'],{cwd:root,stdio:'pipe'});
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target).compare(bytes),0,'manifest must equal the exact pinned source build');else fs.writeFileSync(target,bytes);
console.log('RC233_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),orientationModulePreserved:true,nativeOutsideRegionPreserved:true,nativeOutsidePatches:outsidePatches.length,nativeSourceSynchronized:true,saveBridgeBodiesPreserved:true,check:process.argv.includes('--check')}));
