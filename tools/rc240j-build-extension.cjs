'use strict';
// RC240 fix round 4 (extension 170): review round 4 space, art, lighting, camera and presentation fixes across the five RC240 overlay files.
// Exact, reviewable protected-runtime delta. SOURCE is a committed revision, not
// an adjustable working-tree snapshot; later edits require another extension.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='50ef8d67fb5aa89a797f4859c3f2581b7249ac0a',SOURCE='8524d179c95071862c8994a409d3f89f81acc6c7',PREVIOUS='bb8c8c89a091c690e0f98fcd2512b997216196cd8fca63a2ebfae1af3e5986dd',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/rc240/arcade-kit.js':'Familiars are rose-white friendly motes with a thin hero-colour ring (no glyph); the bomb is a dark dim with an additive gold floor shockwave and sparks (no flash disc); phone pips sit inline with the resonance bar and the PC shows its bomb input; native hostile bullets can be cancelled for other owners.',
 'assets/rc240/boss-form.js':'The second form cancels native and RC240 hostile fire and holds RC240 firing until its banner ends; a boss killed mid-transformation drops its white-out at once; the second-form banner is the largest plate over a short dim; the phone GRAZE readout moves clear of the settings gear.',
 'assets/rc240/danmaku-layer.js':'Balrog\'s sword is drawn by its bullets over a faint ember glow; Balrog colours leave the red hero\'s family; blooms are born off the boss and open toward the hero; Lucifer\'s wings are two mirrored arcs; the volley telegraph is a magenta line with a marching white core; every bullet carries a dark outer shadow and an underlay near the hero; the spell card collapses on its break.',
 'assets/rc240/mobile-landscape.js':'The danger band darkens the floor (a dark warm multiply, texture kept) under amber hazard dashes along the far floor diagonal; the phone zoom gives the hero-side painted corner of Balrog\'s and Lucifer\'s rooms the spare width and takes the least zoom when the corners only just fit.',
 'assets/rc240/stg-feel.js':'The kill beat is clamped to the frame with a capped flash; the warning plate uses a hazard language and is skipped for a boss first met damaged; the native debuff label is hidden while hostile bullets are near; phone bands clear the phase panel and the gear; the tally lands a total line.'
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
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-169.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'extension begins at exact published output');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only reviewed runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-170.json');
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
console.log('RC240J_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),nativeBundleUnchanged:true,indexUnchanged:true,check:process.argv.includes('--check')}));
