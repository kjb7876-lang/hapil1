'use strict';
// RC240 review round 2 fixes (extension 166): danmaku palettes and formations, presentation queue and
// feel beats, phone framing band and danger band.
// Exact, reviewable protected-runtime delta. SOURCE is a committed revision, not
// an adjustable working-tree snapshot; later edits require another extension.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='320f9246279cb3b8a0bff324e33d54fd444ced9d',SOURCE='3c0c23cc043a0db2c0769a4d8de1daf32bdfef3f',PREVIOUS='a844214104eade621bffc11573166b186e7ac4845559b833039f1a643bbb5060',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/rc240/arcade-kit.js':'Bomb shockwave with flash and pooled debris, orbiting hollow familiars, double-tap hint glyph with a one-time pulse (review round 2).',
 'assets/rc240/boss-form.js':'Second form re-declared with a full-width banner after the white-out peak, hollow weak-point glyphs, banner queued behind the boss warning (review round 2).',
 'assets/rc240/danmaku-layer.js':'Per-boss weapon palettes apart from the hero gold, Lucifer lance rows, formations in front of the boss, spirals retired under a formation, dark bullet outlines, multiply spell dim, soft telegraphs, off-floor fade, spell card behind the presentation queue (review round 2).',
 'assets/rc240/mobile-landscape.js':'Phone combat zoom 1.15-1.30 (Envy room <= 1.2) with painted floor corners kept inside, mob stages centred vertically, iso-striped chevron-edged danger band (review round 2).',
 'assets/rc240/stg-feel.js':'One presentation queue, full-width title band, red edge warning vignette, kill beat rings, score and callouts out of the centre column, heart ring above native art (review round 2).'
};
assert.match(SOURCE,/^[a-f0-9]{40}$/,'final runtime source commit must be pinned');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...args)=>cp.execFileSync('git',['--no-replace-objects',...args],{cwd:root,maxBuffer:64e6});
function rows(ref){return git('ls-tree','-r','-z',ref,'--',...ROOTS).toString().split('\0').filter(Boolean).map(line=>{const m=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(line);assert(m,'ordinary runtime entry');return{file:m[3],mode:m[1],gitBlob:m[2]};}).sort((a,b)=>a.file.localeCompare(b.file));}
const before=rows(BASE),after=rows(SOURCE),old=new Map(before.map(r=>[r.file,r])),next=new Map(after.map(r=>[r.file,r]));
assert.equal(git('rev-parse',SOURCE+'^').toString().trim(),BASE,'source is a direct child of the published base');
// The native bundle is untouched: RC240 is an overlay that wraps public seams only.
const bundleBefore=git('show',BASE+':assets/index-v31526.js'),bundleAfter=git('show',SOURCE+':assets/index-v31526.js');
assert.equal(bundleAfter.compare(bundleBefore),0,'native bundle is unchanged');
// index.html is unchanged: the RC240 loaders from extension 161 already load the file touched here.
const htmlBefore=git('show',BASE+':index.html'),htmlAfter=git('show',SOURCE+':index.html');
assert.equal(htmlAfter.compare(htmlBefore),0,'index.html is unchanged');
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-165.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'extension begins at exact published output');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only reviewed runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-166.json');
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
console.log('RC240F_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),nativeBundleUnchanged:true,indexUnchanged:true,check:process.argv.includes('--check')}));
