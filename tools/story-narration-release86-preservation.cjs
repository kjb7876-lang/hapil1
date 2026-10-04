'use strict';
// Frozen TTS86 adds exactly one accepted scene and four paragraphs. The old85
// guard stays byte-identical and continues running on its detached baseline.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const BASE='80adeec6e12d1e96973012e535ad1575ae12d1c8',SOURCE='06ad4ad64501163bc5207a7ac6d277e1660f2b65',BASE_MANIFEST='20cb70771a0d33aa3cbc4b61934103f9529d702c289b135db494945f5038c550';
const PINS={
  "assets/story-narration/v1/audio/murder01-post-6206cf6b0cff5b9aee7227b9.mp3": "6206cf6b0cff5b9aee7227b99451fbf713b8cabecde0a6654fc0b19e47481bee",
  "assets/story-narration/v1/audio/p-528fc9801b1d930011410fa0.mp3": "528fc9801b1d930011410fa06cafd5348e8efe8d67fb50311ac8c4aaf4ae556b",
  "assets/story-narration/v1/audio/p-9b69d5462a3117d00a02394b.mp3": "9b69d5462a3117d00a02394b5bfe8634514d16bb776b0e8f1411a42fbf411b06",
  "assets/story-narration/v1/audio/p-bcc875690178af1726ad7589.mp3": "bcc875690178af1726ad7589030c1bb9c66253dd2cc59bd6c3b75cc78d19b427",
  "assets/story-narration/v1/audio/p-e97a8118bd30b67e4dcc4c49.mp3": "e97a8118bd30b67e4dcc4c4962b92c9b18f21ddd60ff772e65bc72f3addebc11",
  "assets/story-narration/v1/manifest.json": "2204f5c49e77ceda2cfb6411a2c0a8bd4238d52cfe44133928a642594afa4006"
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function verify(root){
 root=path.resolve(root);const git=args=>cp.execFileSync('git',['--no-replace-objects',...args],{cwd:root,maxBuffer:32e6});
 for(const ref of [BASE,SOURCE])if(cp.spawnSync('git',['--no-replace-objects','cat-file','-e',ref+'^{commit}'],{cwd:root,stdio:'ignore'}).status!==0)git(['fetch','--no-tags','--depth=1','origin',ref]);
 assert.deepEqual(git(['cat-file','-p',SOURCE]).toString().split('\n\n')[0].split('\n').filter(line=>line.startsWith('parent ')).map(line=>line.slice(7)),[BASE],'Frozen source parent');
 const files=git(['diff','--name-only',BASE,SOURCE]).toString().trim().split('\n').sort();assert.deepEqual(files,Object.keys(PINS).sort(),'Only six frozen files may change in TTS86');
 const mf='assets/story-narration/v1/manifest.json',beforeBytes=git(['show',BASE+':'+mf]);assert.equal(hash(beforeBytes),BASE_MANIFEST,'Frozen85 preimage');
 const before=JSON.parse(beforeBytes),after=JSON.parse(fs.readFileSync(path.join(root,mf)));
 for(const [file,pin]of Object.entries(PINS)){assert.equal(hash(git(['show',SOURCE+':'+file])),pin,'Frozen reviewed source: '+file);assert.equal(hash(fs.readFileSync(path.join(root,file))),pin,'Frozen current output: '+file);}
 assert.equal(Object.keys(before.assets).length,264);assert.equal(Object.keys(after.assets).length,269);assert.equal(before.coverage.includedUnits.length,85);assert.equal(after.coverage.includedUnits.length,86);assert.equal(before.coverage.includedRoutes,189);assert.equal(after.coverage.includedRoutes,191);
 for(const k of Object.keys(before)){if(['assets','scenes','coverage'].includes(k))continue;assert.deepEqual(after[k],before[k],'Unchanged manifest field: '+k);}assert.deepEqual(Object.keys(after).sort(),Object.keys(before).sort());
 for(const k of ['assets','scenes']){for(const [key,value]of Object.entries(before[k]))assert.deepEqual(after[k][key],value,'Preserve prior '+k+': '+key);assert.equal(Object.keys(after[k]).filter(key=>!(key in before[k])).length,k==='assets'?5:2);}
 assert.deepEqual(Object.keys(after.scenes).filter(k=>!(k in before.scenes)).sort(),['journal:murder01:body','murder01:post']);
 for(const k of Object.keys(before.coverage)){if(['includedUnits','pendingUnits','includedRoutes','pendingRoutes'].includes(k))continue;assert.deepEqual(after.coverage[k],before.coverage[k],'Coverage contract: '+k);}
 assert.deepEqual(after.coverage.includedUnits,[...before.coverage.includedUnits,'murder01.post'].sort());assert.deepEqual(after.coverage.pendingUnits,before.coverage.pendingUnits.filter(k=>k!=='murder01.post'));assert.deepEqual(after.coverage.pendingRoutes,before.coverage.pendingRoutes.filter(k=>!['journal:murder01:body','murder01:post'].includes(k)));
 const oldGuard=fs.readFileSync(path.join(root,'tools/story-narration-release85-preservation.cjs'));assert.equal(hash(oldGuard),'92ed29cdf627a5801277110515e73f75b9cb384868f252eeb40b7844a12bb1c5','Historical85 guard remains unchanged');
 return {status:'passed',base:BASE,frozenSource:SOURCE,manifestSha256:PINS[mf],addedAudio:5,activeAudio:269,includedUnits:86,includedRoutes:191,oldAssetsPreserved:264,oldRoutesPreserved:189,historical85GuardUnchanged:true};
}
module.exports={verify};if(require.main===module)console.log('TTS86_PRESERVATION_RESULT',JSON.stringify(verify(path.resolve(__dirname,'..'))));
