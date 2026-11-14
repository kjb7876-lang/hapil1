'use strict';
// Exact, reviewable protected-runtime delta. SOURCE is a committed revision, not
// an adjustable working-tree snapshot; later edits require another extension.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='8629bd82fc1d8baf41183395c054fd83775e96df',SOURCE='93c3619b25101c6ac4b721037cb1c14967702362',PREVIOUS='a182fd9163f73abba746c57ce5a363e79209f70883b351b57c7599a15afd744c',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/combat-v31412/skill-completion.js':'Cache the matching cast-window key names per actor for one synchronous task while always reading the values live.',
 'assets/rc133/bitmap-contact.js':'Reuse the world and camera base transform inside one synchronous task and bind recorder methods once, keeping contact geometry identical.',
 'assets/rc240/arcade-kit.js':'Add the story-only arcade kit: power items, hero familiars and the double-tap bomb, runtime only and never saved.',
 'assets/rc240/art/heart-fly8.webp':'Add the original eight-frame heart sprite sheet drawn by the RC240 danmaku layer.',
 'assets/rc240/boss-form.js':'Add story boss weak-point parts, the one-way second form, stage title cards and display-only names.',
 'assets/rc240/danmaku-layer.js':'Add the self-contained dense boss danmaku layer with its own pool, heart-only collision and frame governor.',
 'assets/rc240/mobile-landscape.js':'Add the phone landscape fit, rotate prompt polish, hero and enemy stand-off lines and the phone combat zoom.',
 'assets/rc240/stg-feel.js':'Add spirit coins, chain score, the charge shot, boss warnings and the result tally driven by the danmaku layer hooks.',
 'index.html':'Load the four RC240 combat overlays after the RC26 UI module and the landscape fit at the end of the head.'
};
assert.match(SOURCE,/^[a-f0-9]{40}$/,'final runtime source commit must be pinned');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...args)=>cp.execFileSync('git',['--no-replace-objects',...args],{cwd:root,maxBuffer:64e6});
function rows(ref){return git('ls-tree','-r','-z',ref,'--',...ROOTS).toString().split('\0').filter(Boolean).map(line=>{const m=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(line);assert(m,'ordinary runtime entry');return{file:m[3],mode:m[1],gitBlob:m[2]};}).sort((a,b)=>a.file.localeCompare(b.file));}
const before=rows(BASE),after=rows(SOURCE),old=new Map(before.map(r=>[r.file,r])),next=new Map(after.map(r=>[r.file,r]));
assert.equal(git('rev-parse',SOURCE+'^').toString().trim(),BASE,'source is a direct child of the published base');
// The native bundle is untouched: RC240 is an overlay that wraps public seams only.
const bundleBefore=git('show',BASE+':assets/index-v31526.js'),bundleAfter=git('show',SOURCE+':assets/index-v31526.js');
assert.equal(bundleAfter.compare(bundleBefore),0,'native bundle is unchanged');
// index.html changes only by the five reviewed loader lines; no existing line or ?v= pin moves.
const htmlBefore=git('show',BASE+':index.html').toString('utf8'),htmlAfter=git('show',SOURCE+':index.html').toString('utf8');
const loaders=[
 ['    <script type="module" src="./assets/rc26/ui.js?v=39902"></script>\n',['danmaku-layer','stg-feel','arcade-kit','boss-form'].map(name=>'    <script defer src="./assets/rc240/'+name+'.js?v=24001"></script>\n').join('')],
 ['<link rel="stylesheet" href="./assets/rc125/adaptive-battlefield.css?v=15525">\n','<script src="./assets/rc240/mobile-landscape.js?v=24001"></script>\n']
];
let expectedHtml=htmlBefore;
for(const [anchor,inserted] of loaders){assert.equal(expectedHtml.split(anchor).length,2,'one exact loader anchor');expectedHtml=expectedHtml.replace(anchor,anchor+inserted);}
assert.equal(htmlAfter,expectedHtml,'index.html changes only by the reviewed RC240 loader lines');
assert(htmlAfter.indexOf('rc240/mobile-landscape.js')<htmlAfter.indexOf('</head>'),'landscape fit loads inside the head');
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-160.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'extension begins at exact published output');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only reviewed runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-161.json');
if(process.argv.includes('--historical-source-check')){
 // Verify the pinned historical source and generated native bundle even when the
 // working tree contains a newer authorized extension. No current-tree claim is made.
 const source=git('show',SOURCE+':assets/rc133/native-install-v2.js.txt').toString('utf8').trimEnd(),bundle=bundleAfter.toString('utf8');
 const start=bundle.indexOf('/* RC133_NATIVE_INTEGRATION: final lexical bindings, not copied legacy APIs. */');
 const end=bundle.indexOf('\n\n/* RC137_DIRECTION_INPUT_NATIVE:',start);
 assert(start>=0&&end>start&&bundle.indexOf('/* RC133_NATIVE_INTEGRATION:',start+1)===-1,'unique historical native integration');
 assert.equal(bundle.slice(start,end),source,'historical native source and bundle are identical');
}else{
 assert.deepEqual(rows('HEAD'),after,'committed runtime must equal pinned source build');require('./rc133-preservation.cjs').verifyFiles(root,after);
 cp.execFileSync(process.execPath,[path.join(root,'tools/rc215-build-native.cjs'),'--check'],{cwd:root,stdio:'pipe'});
}
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target).compare(bytes),0,'manifest must equal pinned source build');else fs.writeFileSync(target,bytes);
console.log('RC240_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),nativeBundleUnchanged:true,loaderLinesOnly:true,check:process.argv.includes('--check')}));
