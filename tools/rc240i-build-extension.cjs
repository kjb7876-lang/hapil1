'use strict';
// RC240 fix round 3 (extension 169): review round 3 space, lighting, shot colour and presentation fixes across the five RC240 overlay files.
// Exact, reviewable protected-runtime delta. SOURCE is a committed revision, not
// an adjustable working-tree snapshot; later edits require another extension.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='87768e369d2e80a67fc676ca0d1731232b6b8add',SOURCE='a78725d63ed4ee77223921b17ad8ec22a588db4b',PREVIOUS='6c48956987e601cb5d8582f4317372a6c13378f54a8828b7fd24aef00eeacc9c',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/rc240/arcade-kit.js':'Familiars are soft companion motes in the hero colour (glow, trail, muzzle flash) instead of white-core glyphs; the PC power pips are ~1.5x on a clipped-corner backing plate; the bomb sweep is a 2:1 floor ellipse kept below the top HUD.',
 'assets/rc240/boss-form.js':'The second-form white-out is shaped radially from the boss after its first frame (no full-frame haze); the spell card carries a second-form tag; callouts wait behind the second-form banner.',
 'assets/rc240/danmaku-layer.js':'The spell dim is ~35% lighter and luminance-only (lighter on the walkable floor); lava curtains are crimson and Lucifer curtain orbs violet with a white-hot core; the Envy mirror is an outlined oval; phone bullets are drawn 15% larger with trail lines >= 1.5 CSS px; band 3 escalates with a curved pattern of a second shape; native hostile projectiles get a thin red rim; the broad sword is narrower and fits the screen.',
 'assets/rc240/mobile-landscape.js':'The danger band reads as soft desaturated-amber light on the floor (no stripes, chevrons or hard edges); the phone zoom keeps the painted platform corners of Balrog\'s and Lucifer\'s rooms on screen, keeps Envy\'s lead room, gives Michaela the same zoom as the other heroes and re-aims a drifting boss inside an eased dead zone.',
 'assets/rc240/stg-feel.js':'The warning tint is an edge-only, luminance-only vignette; the heart ring is drawn over the native HUD; the warning is dropped instantly on a kill; the title band sits in the top band and phone banners clear the left HUD stack; the score is always visible in a fight with a bigger x2 badge; the tally is anchored clear of the hero row.'
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
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-168.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'extension begins at exact published output');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only reviewed runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-169.json');
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
console.log('RC240I_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),nativeBundleUnchanged:true,indexUnchanged:true,check:process.argv.includes('--check')}));
