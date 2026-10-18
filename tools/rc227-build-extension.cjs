'use strict';
// Reproduce the exact authorized RC225/226/227 runtime extension. A later
// runtime edit cannot be accepted by rerunning this builder: SOURCE is pinned.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='b0b919d4e18c2e93f871606ece0744d077ff7239',SOURCE='443d511bdfe3345be5b4a04b893d69fcfd2d1529',PREVIOUS='cd8f8c982b04e52693b0e3a4b6d28e9a3bd6355433ffa95738ada1ff338b2316',ROOTS=['assets','audio','data','index.html'];
const reasons={
 'assets/index-v31526.js':'Preserve the selected semi-auto target, connect manual S and native A launch/contact audio, anchor follow-up shots at actual contact, and compose the reviewed cave floor with unchanged authority and exposure.',
 'assets/rc128/combat-feedback.js':'Keep ordinary and critical basic fire compact without hitstop or screen shake; retain explicit heavy, charged, defeat and Persona feedback.',
 'assets/rc138/battle-arena.js':'Keep normal bosses at the reviewed right band and compose only the DIST01 paving cell with native actor ownership, radius and guest authority.',
 'assets/rc138/native-install.js.txt':'Pass the native map zone to physical containment and legal-point queries, preserving the existing native integration source.',
 'assets/rc153/combat-layout.js':'Retain the normal-boss 14..16 across band and existing whole-body camera envelopes.',
 'assets/rc225/shooter.js':'Add native firing-lane focus, host-owned countershots and three sequential interlude actors with protected-template and checkpoint-restore handling.',
 'assets/rc226/shooting-completion.js':'Bind host weapon styles to native strike/contact routes, preserve planned raw power and EGO identity, and connect actual S landings and per-hero firing sounds.',
 'assets/rc227/floor-patches.js':'Admit only the reviewed source-image cave paving cell, inset by actor radius and intersected with the old ellipse, retaining Persona and all other maps.',
 'index.html':'Load the authorized shooting and cave-floor modules and update the corresponding cache versions.'
};
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...args)=>cp.execFileSync('git',['--no-replace-objects',...args],{cwd:root,maxBuffer:64e6});
function rows(ref){return git('ls-tree','-r','-z',ref,'--',...ROOTS).toString().split('\0').filter(Boolean).map(line=>{const m=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(line);assert(m,'ordinary runtime entry');return{file:m[3],mode:m[1],gitBlob:m[2]};}).sort((a,b)=>a.file.localeCompare(b.file));}
const before=rows(BASE),after=rows(SOURCE),old=new Map(before.map(r=>[r.file,r])),next=new Map(after.map(r=>[r.file,r]));
const previous=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-152.json'));assert.equal(digest(previous),PREVIOUS);assert.equal(digest(Buffer.from(JSON.stringify(before))),JSON.parse(previous).targetProtectedRowsSha256,'new extension starts at the exact published-main runtime');
const changed=[...new Set([...old.keys(),...next.keys()])].filter(f=>JSON.stringify(old.get(f))!==JSON.stringify(next.get(f))).sort();assert.deepEqual(changed,Object.keys(reasons).sort(),'only explicitly scoped runtime paths may change');
const files=changed.map(file=>{const out=next.get(file);return{file,before:old.has(file)?{mode:old.get(file).mode,gitBlob:old.get(file).gitBlob,file}:null,after:out?{file,mode:out.mode,sha256:digest(git('show',SOURCE+':'+file)),gitBlob:out.gitBlob}:null,reason:file+': '+reasons[file]};});
const manifest={version:1,base:BASE,baseTree:git('rev-parse',BASE+'^{tree}').toString().trim(),sourceCommit:SOURCE,protectedRoots:ROOTS,previousExtensionSha256:PREVIOUS,files,targetProtectedRowsSha256:digest(Buffer.from(JSON.stringify(after)))};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n'),target=path.join(root,'qa/rc133/authorized-runtime-extension-153.json');
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target).compare(bytes),0,'manifest must equal the exact pinned source build');else fs.writeFileSync(target,bytes);
assert.deepEqual(rows('HEAD'),after,'committed runtime must equal the pinned source build');require('./rc133-preservation.cjs').verifyFiles(root,after);
console.log('RC227_EXTENSION_BUILD',JSON.stringify({source:SOURCE,base:BASE,files:files.length,sha256:digest(bytes),check:process.argv.includes('--check')}));
