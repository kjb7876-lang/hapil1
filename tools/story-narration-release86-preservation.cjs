'use strict';
// Frozen TTS86 adds exactly one accepted scene and four paragraphs. The old85
// guard stays byte-identical and continues running on its detached baseline.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const BASE='80adeec6e12d1e96973012e535ad1575ae12d1c8',SOURCE='06ad4ad64501163bc5207a7ac6d277e1660f2b65',BASE_MANIFEST='20cb70771a0d33aa3cbc4b61934103f9529d702c289b135db494945f5038c550';
const CURRENT_MANIFEST='b8f1c2e9e6883c008b07bc5186f4edb1d2ca8eb7612f29af292d6920150935cc';
const ADDED_ASSETS=['audio/dist03-pre-f8875fb45764ee7e7edb2957.mp3','audio/hando01-pre-fbdd14cc3cf05fae96a105f0.mp3','audio/kair06-post-bf158be7b2fff09be9d96098.mp3','audio/p-4a16ab0091e057f17d35552f.mp3','audio/p-5d67a44eacc67efa94154af1.mp3','audio/p-5e0f4f4e639c37c9d1bf6d5b.mp3','audio/p-a5d59544ec4a9c04112154f7.mp3','audio/p-a9d8a2dbb7aacf58fbe743b4.mp3','audio/p-c09716d4ad080a6076e0e5a8.mp3','audio/p-ce571fd82755c2bb35fda70e.mp3','audio/p-de4207237483af374322a0d9.mp3','audio/p-fafcd98ab7d2bf8e8e32adb6.mp3'];
const ADDED_SCENES=['hando01:pre','journal:hando01:entry','journal:kair06:all','journal:kair06:body','journal:restKairo:all','journal:restKairo:body','journal:restKairo:entry','kair06:post'];
const ADDED_RETIRED=['audio/dist03-pre-98b8fb341f762758245daccb.mp3','audio/p-8e4df36eb396f0d9b66572c2.mp3'];
const REPLACED_SCENES=['dist03:pre','journal:dist03:all','journal:dist03:entry'];
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
 const before=JSON.parse(beforeBytes),frozen86=JSON.parse(git(['show',SOURCE+':'+mf])),after=JSON.parse(fs.readFileSync(path.join(root,mf)));
 for(const [file,pin]of Object.entries(PINS)){assert.equal(hash(git(['show',SOURCE+':'+file])),pin,'Frozen reviewed source: '+file);if(file!==mf)assert.equal(hash(fs.readFileSync(path.join(root,file))),pin,'Frozen current output: '+file);}
 assert.equal(Object.keys(before.assets).length,264);assert.equal(Object.keys(frozen86.assets).length,269);assert.equal(before.coverage.includedUnits.length,85);assert.equal(frozen86.coverage.includedUnits.length,86);assert.equal(before.coverage.includedRoutes,189);assert.equal(frozen86.coverage.includedRoutes,191);
 for(const k of Object.keys(before)){if(['assets','scenes','coverage'].includes(k))continue;assert.deepEqual(frozen86[k],before[k],'Unchanged TTS86 field: '+k);}assert.deepEqual(Object.keys(frozen86).sort(),Object.keys(before).sort());
 for(const k of ['assets','scenes']){for(const [key,value]of Object.entries(before[k]))assert.deepEqual(frozen86[k][key],value,'Preserve TTS85 '+k+': '+key);assert.equal(Object.keys(frozen86[k]).filter(key=>!(key in before[k])).length,k==='assets'?5:2);}
 assert.deepEqual(Object.keys(frozen86.scenes).filter(k=>!(k in before.scenes)).sort(),['journal:murder01:body','murder01:post']);
 for(const k of Object.keys(before.coverage)){if(['includedUnits','pendingUnits','includedRoutes','pendingRoutes'].includes(k))continue;assert.deepEqual(frozen86.coverage[k],before.coverage[k],'TTS86 coverage contract: '+k);}
 assert.deepEqual(frozen86.coverage.includedUnits,[...before.coverage.includedUnits,'murder01.post'].sort());assert.deepEqual(frozen86.coverage.pendingUnits,before.coverage.pendingUnits.filter(k=>k!=='murder01.post'));assert.deepEqual(frozen86.coverage.pendingRoutes,before.coverage.pendingRoutes.filter(k=>!['journal:murder01:body','murder01:post'].includes(k)));
 assert.equal(hash(fs.readFileSync(path.join(root,mf))),CURRENT_MANIFEST,'Exact current TTS88 manifest');
 assert.equal(Object.keys(after.assets).length,279);assert.equal(Object.keys(after.scenes).length,199);assert.equal(after.coverage.includedUnits.length,88);assert.equal(after.coverage.includedRoutes,199);
 for(const k of Object.keys(frozen86)){if(['assets','scenes','coverage','retiredAssets'].includes(k))continue;assert.deepEqual(after[k],frozen86[k],'Unchanged TTS88 field: '+k);}assert.deepEqual(Object.keys(after).sort(),Object.keys(frozen86).sort());
 for(const [key,value]of Object.entries(frozen86.retiredAssets??{}))assert.deepEqual(after.retiredAssets?.[key],value,'Preserve prior retired asset: '+key);assert.deepEqual(Object.keys(after.retiredAssets??{}).filter(key=>!(key in (frozen86.retiredAssets??{}))).sort(),ADDED_RETIRED,'Exact TTS88 retired asset history');
 for(const [key,value]of Object.entries(frozen86.assets)){if(ADDED_RETIRED.includes(key))assert.deepEqual(after.retiredAssets[key],value,'Preserve replaced source audio in retirement history: '+key);else assert.deepEqual(after.assets[key],value,'Preserve TTS86 active asset: '+key);}
 assert.deepEqual(Object.keys(after.assets).filter(key=>!(key in frozen86.assets)).sort(),ADDED_ASSETS,'Exact TTS88 active audio additions');
 for(const [key,value]of Object.entries(frozen86.scenes))if(!REPLACED_SCENES.includes(key))assert.deepEqual(after.scenes[key],value,'Preserve TTS86 scene: '+key);
 assert.deepEqual(Object.keys(after.scenes).filter(key=>!(key in frozen86.scenes)).sort(),ADDED_SCENES,'Exact TTS88 scene additions');
 const oldDist= frozen86.scenes['dist03:pre'],newDist=after.scenes['dist03:pre'],distAsset=after.assets['audio/dist03-pre-f8875fb45764ee7e7edb2957.mp3'];assert.equal(newDist.textSha256,oldDist.textSha256);assert.equal(newDist.audio,'audio/dist03-pre-f8875fb45764ee7e7edb2957.mp3');assert.equal(newDist.sha256,distAsset.sha256);assert.equal(newDist.duration,distAsset.duration);
 for(const id of ['journal:dist03:all','journal:dist03:entry']){const old=frozen86.scenes[id],current=after.scenes[id],clips=old.clips.map(c=>({...c})),replacement=after.assets['audio/p-5d67a44eacc67efa94154af1.mp3'];assert.equal(current.textSha256,old.textSha256);assert.equal(current.clips.length,old.clips.length);clips[0]={audio:'audio/p-5d67a44eacc67efa94154af1.mp3',duration:replacement.duration,sha256:replacement.sha256};assert.deepEqual(current.clips,clips,'Only the first dist03 paragraph clip is replaced: '+id);}
 assert.equal(Object.keys(after.assets).filter(key=>key in frozen86.assets).length,Object.keys(frozen86.assets).length-ADDED_RETIRED.length);
 for(const rel of ADDED_ASSETS){const file=path.join(root,'assets/story-narration/v1',rel),asset=after.assets[rel];assert(asset&&fs.statSync(file).isFile(),'Added narration asset missing: '+rel);assert.equal(fs.statSync(file).size,asset.bytes,'Added narration asset bytes: '+rel);assert.equal(hash(fs.readFileSync(file)),asset.sha256,'Added narration asset hash: '+rel);}
 for(const k of Object.keys(frozen86.coverage)){if(['includedUnits','pendingUnits','includedRoutes','pendingRoutes'].includes(k))continue;assert.deepEqual(after.coverage[k],frozen86.coverage[k],'TTS88 coverage contract: '+k);}
 assert.deepEqual(after.coverage.includedUnits,[...frozen86.coverage.includedUnits,'hando01.pre','kair06.post'].sort());assert.deepEqual(after.coverage.pendingUnits,frozen86.coverage.pendingUnits.filter(k=>!['hando01.pre','kair06.post'].includes(k)));assert.deepEqual(after.coverage.pendingRoutes,frozen86.coverage.pendingRoutes.filter(k=>!ADDED_SCENES.includes(k)));
 const oldGuard=fs.readFileSync(path.join(root,'tools/story-narration-release85-preservation.cjs'));assert.equal(hash(oldGuard),'92ed29cdf627a5801277110515e73f75b9cb384868f252eeb40b7844a12bb1c5','Historical85 guard remains unchanged');
 return {status:'passed',base:BASE,frozenSource:SOURCE,manifestSha256:CURRENT_MANIFEST,addedAudioAfter85:17,addedAudioAfter86:12,activeAudio:279,includedUnits:88,includedRoutes:199,addedScenesAfter86:ADDED_SCENES,oldAssetsPreserved:264,oldRoutesPreserved:189,historical85GuardUnchanged:true};
}
module.exports={verify};if(require.main===module)console.log('TTS86_PRESERVATION_RESULT',JSON.stringify(verify(path.resolve(__dirname,'..'))));
