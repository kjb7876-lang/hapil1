'use strict';
// RC241 boss duel pilot (extension 172, branch feat/boss-duel): persona-style duel decks for Balrog (dist06-boss), Leviathan (b03-boss) and Lucifer (a11-boss) as one new overlay plus its deck data, with minimal RC240 gates and one index.html loader.
// Exact, reviewable protected-runtime delta. SOURCE is a committed revision, not
// an adjustable working-tree snapshot; later edits require another extension.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='82e243153ee440bbb66806fe837928afce5c4bd9',SOURCE='4cb43a0a76040503aa2dc4b84b512e13d443de2a',PREVIOUS='0c953251b66e908835720ddc9f938fb014fee82f3bc019fe560787f166466e4f',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/rc241/boss-duel.js':'new RC241 duel overlay: for the three pilot deck bosses only, named volleys materialise and hang harmlessly (>= .72 s, telegraphed), then release together from one pooled layer, with a 7 s awakening act every 28 s; native boss ordnance clocks are held and stray boss ordnance is retired so the duel is the only attack source; off with ?duel=0, under ?qa unless duel=1, or the stored off flag; it wraps public seams only (loop tick, enemy-feel front draw, echoes tick) and loads its deck data file itself.',
 'assets/rc241/boss-duel-decks.js':'new RC241 deck data: per pilot boss eight volleys whose names are existing in-repo text and whose sprites are authored projectiles that boss already owns, per-mode scaling and the awakening act timing; data only, no new art, text or audio.',
 'assets/rc240/danmaku-layer.js':'a boss owned by the RC241 duel gets no RC240 spell curtain, signature formation or filler stream (one attack source); every other boss and the STG feel are unchanged.',
 'assets/rc240/mobile-landscape.js':'the RC240 phone zoom stands aside while an RC241 duel frames the whole arena; every other fight keeps its zoom and the extension 171 settle snap.',
 'index.html':'one deferred loader for assets/rc241/boss-duel.js after the RC240 overlays; no other byte changes.'
};
assert.match(SOURCE,/^[a-f0-9]{40}$/,'final runtime source commit must be pinned');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...args)=>cp.execFileSync('git',['--no-replace-objects',...args],{cwd:root,maxBuffer:64e6});
function rows(ref){return git('ls-tree','-r','-z',ref,'--',...ROOTS).toString().split('\0').filter(Boolean).map(line=>{const m=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(line);assert(m,'ordinary runtime entry');return{file:m[3],mode:m[1],gitBlob:m[2]};}).sort((a,b)=>a.file.localeCompare(b.file));}
const before=rows(BASE),after=rows(SOURCE),old=new Map(before.map(r=>[r.file,r])),next=new Map(after.map(r=>[r.file,r]));
assert.equal(git('rev-parse',SOURCE+'^').toString().trim(),BASE,'source is a direct child of the published base');
// The native bundle is untouched: RC240 is an overlay that wraps public seams only.
const bundleBefore=git('show',BASE+':assets/index-v31526.js'),bundleAfter=git('show',SOURCE+':assets/index-v31526.js');
assert.equal(bundleAfter.compare(bundleBefore),0,'native bundle is unchanged');
// index.html gains exactly one loader line, right after the RC240 phone-landscape loader.
const htmlBefore=git('show',BASE+':index.html').toString('utf8'),htmlAfter=git('show',SOURCE+':index.html').toString('utf8');
const anchorTag='<script src="./assets/rc240/mobile-landscape.js?v=24001"></script>\n',duelTag='<script defer src="./assets/rc241/boss-duel.js?v=24101"></script>\n';
assert.equal(htmlBefore.split(anchorTag).length-1,1,'one RC240 phone-landscape loader');
assert.equal(htmlAfter,htmlBefore.replace(anchorTag,anchorTag+duelTag),'index.html only gains the RC241 loader');
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-171.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'extension begins at exact published output');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only reviewed runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-172.json');
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
console.log('RC241_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),nativeBundleUnchanged:true,indexLoaderOnly:true,check:process.argv.includes('--check')}));
