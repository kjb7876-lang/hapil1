'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const BASE='41d9d75ffffd9b4a2d8f51c90a8a08946f021864';
const NARRATION='2ed3c206c9a0b52f6ee1547727442ce5069d2044';
const BATCH_BASE='5cdfadd62c7139a7f10e8e7f70bc2a1dd4b8b924';
const AUDIO_REVISION='af51c0b7fe342bf7198905fe64093d4ed973a10b';
const REVIEWED_BASE="9ee0d481b5cb166185b83e6acda3a7a142360205";
const REVIEWED_AUDIO_REVISION="8007ab06b04bcd7f45a285c6898ad92fcc53d043";
const REVIEWED_MANIFEST_SHA256="539e291c5fd0060eb6b3e1c4eb5c64b8d3065c4683bc57d01c3bab187362c645";
const REVIEWED_SOURCE_MANIFEST_SHA256="1614745e514d0112a7179b112ac56546507229efd0b48d049130f2ac418c6ed4";
const REVIEWED_BINDINGS_SHA256="c85f4a2af87927a8ec6ea94aa8d08174a465c2404f942e596386513b9f78ef23";
const REVIEWED_NEW_UNITS=[
  "ep1b02.pre",
  "ep1b05.post",
  "ep1b05.pre"
];
const REVIEWED_REPLACED_UNITS=[
  "ep1a08.pre",
  "ep1b06.pre",
  "last304.pre"
];
const REVIEWED_NEW_ROUTES=[
  "ep1b02:pre",
  "ep1b05:post",
  "ep1b05:pre",
  "journal:ep1b02:all",
  "journal:ep1b02:body",
  "journal:ep1b02:entry",
  "journal:ep1b05:all",
  "journal:ep1b05:body",
  "journal:ep1b05:entry"
];
const REVIEWED_REPLACEMENTS={
  "audio/ep1a08-pre-1fde0cb42d5db9092b9cd907.mp3": "audio/ep1a08-pre-f2b56466463f06e11308f385.mp3",
  "audio/ep1b06-pre-577dc660a179b9ae5c853626.mp3": "audio/ep1b06-pre-ce39b376fcc073e605adf1e4.mp3",
  "audio/last304-pre-d41fed73ba27b34897a80e1b.mp3": "audio/last304-pre-e40e4a2bea43d73b8d78eb86.mp3",
  "audio/p-6a4f41935e2c593ee39068bc.mp3": "audio/p-5be9ccf92acfe9d4e206e2b4.mp3",
  "audio/p-b4b5e9af2dfe2790f7c56e65.mp3": "audio/p-e39273e4368c0069d1c246da.mp3",
  "audio/p-f1f84d9667774b4b4868f033.mp3": "audio/p-5af5ebc091228aa39244fca9.mp3"
};
const REVIEWED_NEW_AUDIO=[
  {
    "file": "assets/story-narration/v1/audio/ep1a08-pre-f2b56466463f06e11308f385.mp3",
    "sha256": "f2b56466463f06e11308f385c4c3932884b9a165156773da7f895c098c15cdbf",
    "bytes": 663596
  },
  {
    "file": "assets/story-narration/v1/audio/ep1b02-pre-80de88477b870540accb34d0.mp3",
    "sha256": "80de88477b870540accb34d0033ac283fb9310ab26658009481d0f8e1dd22ca6",
    "bytes": 946988
  },
  {
    "file": "assets/story-narration/v1/audio/ep1b05-post-9efcf5eff6f52c66f80e57ab.mp3",
    "sha256": "9efcf5eff6f52c66f80e57abf77a22f763062fd92288c3cbe268147a3d271f82",
    "bytes": 690092
  },
  {
    "file": "assets/story-narration/v1/audio/ep1b05-pre-d29cbc58afbaff3f6b97c220.mp3",
    "sha256": "d29cbc58afbaff3f6b97c220686305d19547fd46e79c8aca9d3ac91cb4b8b1ff",
    "bytes": 934316
  },
  {
    "file": "assets/story-narration/v1/audio/ep1b06-pre-ce39b376fcc073e605adf1e4.mp3",
    "sha256": "ce39b376fcc073e605adf1e48def1135dbe33830d33167eaf1a3d438c0a14cc4",
    "bytes": 558764
  },
  {
    "file": "assets/story-narration/v1/audio/last304-pre-e40e4a2bea43d73b8d78eb86.mp3",
    "sha256": "e40e4a2bea43d73b8d78eb864df6c6cd13eff557c0c680228c7df2e2e21629e8",
    "bytes": 1318316
  },
  {
    "file": "assets/story-narration/v1/audio/p-2a3824d4a6c6ce1e0abe3e44.mp3",
    "sha256": "2a3824d4a6c6ce1e0abe3e44982827f6bbb71da016e9cd27aed8ea2fe51b99fc",
    "bytes": 307628
  },
  {
    "file": "assets/story-narration/v1/audio/p-5af5ebc091228aa39244fca9.mp3",
    "sha256": "5af5ebc091228aa39244fca9e00dee03e490d58dccfe2d93f91fd0c6f8503edf",
    "bytes": 430508
  },
  {
    "file": "assets/story-narration/v1/audio/p-5be9ccf92acfe9d4e206e2b4.mp3",
    "sha256": "5be9ccf92acfe9d4e206e2b460b2067248b459573aac8b803d31c79c646388d9",
    "bytes": 207404
  },
  {
    "file": "assets/story-narration/v1/audio/p-6a3636eff844fc47c1e9a458.mp3",
    "sha256": "6a3636eff844fc47c1e9a4587cdd2ecf69c5019c69aaa90ae7afbc4d5dbcc422",
    "bytes": 295340
  },
  {
    "file": "assets/story-narration/v1/audio/p-8dd85dcfc4763b303f68ace0.mp3",
    "sha256": "8dd85dcfc4763b303f68ace0671eac7659d5cf2168640c9846384c946dfd405f",
    "bytes": 384428
  },
  {
    "file": "assets/story-narration/v1/audio/p-c982278e1986a63afbb7f81e.mp3",
    "sha256": "c982278e1986a63afbb7f81e04d20426f8b630f03ffebdbcebeb2f7b03e1e39f",
    "bytes": 264236
  },
  {
    "file": "assets/story-narration/v1/audio/p-cac042ac3d8e4d2ba625e243.mp3",
    "sha256": "cac042ac3d8e4d2ba625e243681086081a20d77d16ffa54ed92894b1001cc7cb",
    "bytes": 252716
  },
  {
    "file": "assets/story-narration/v1/audio/p-df5dca44b0c3cda6ca324cc5.mp3",
    "sha256": "df5dca44b0c3cda6ca324cc5e6c68f9bab2e92dded42c6ed16ad4b8ff209158e",
    "bytes": 274988
  },
  {
    "file": "assets/story-narration/v1/audio/p-e39273e4368c0069d1c246da.mp3",
    "sha256": "e39273e4368c0069d1c246da87ae4ef394d62f2d0898187f25b3a053d3a02429",
    "bytes": 375980
  },
  {
    "file": "assets/story-narration/v1/audio/p-f21f1c9521eef594b19b8a20.mp3",
    "sha256": "f21f1c9521eef594b19b8a200bdf2a30aee520f8df3baf1265a4698d111cf400",
    "bytes": 373292
  },
  {
    "file": "assets/story-narration/v1/audio/p-f9552652ebd8bb1d1ed20ce9.mp3",
    "sha256": "f9552652ebd8bb1d1ed20ce9a0194ee69ca3b56fe5eb4b41590fba3511e8955b",
    "bytes": 382124
  }
];
const BATCH_NEW_UNITS=["ep1a10.post", "ep1a11.pre", "ep1b09.pre", "kair04.post", "kair04.pre", "last304.post", "u201.pre", "u202.post", "u202.pre", "u204.post"];
const BATCH_NEW_AUDIO=[
  "assets/story-narration/v1/audio/ep1a10-post-a4450b5233f8c265349d1788.mp3",
  "assets/story-narration/v1/audio/ep1a11-pre-450aa4fdec51316e7ab85bcd.mp3",
  "assets/story-narration/v1/audio/ep1b09-pre-055dc1e0f726f5b9a8daa72a.mp3",
  "assets/story-narration/v1/audio/kair04-post-dcefd1bbf8b9127c54a5cbf2.mp3",
  "assets/story-narration/v1/audio/kair04-pre-7379c565d9307b815567f558.mp3",
  "assets/story-narration/v1/audio/last304-post-c81462d0d931c4a4239fa08e.mp3",
  "assets/story-narration/v1/audio/p-01b89f151860556709f44842.mp3",
  "assets/story-narration/v1/audio/p-1ceb8d5f2b0d85b3a9c1fbed.mp3",
  "assets/story-narration/v1/audio/p-20711e4044afdba6a3e2a849.mp3",
  "assets/story-narration/v1/audio/p-33916682537992da9a070f72.mp3",
  "assets/story-narration/v1/audio/p-347b8f57d1f242a5169f0203.mp3",
  "assets/story-narration/v1/audio/p-3c1838baca38d06c128c2ce5.mp3",
  "assets/story-narration/v1/audio/p-3d68be4aad61109a28f0ba6e.mp3",
  "assets/story-narration/v1/audio/p-4573dd5cc1a3921526e53109.mp3",
  "assets/story-narration/v1/audio/p-68db281020cc8e1625e0acd4.mp3",
  "assets/story-narration/v1/audio/p-6a5d43bc56fa9014309b48b4.mp3",
  "assets/story-narration/v1/audio/p-6fc07a66ae87454e06418c89.mp3",
  "assets/story-narration/v1/audio/p-7a45e36b1222a228b8294f24.mp3",
  "assets/story-narration/v1/audio/p-805e623467e4ca3c35da9694.mp3",
  "assets/story-narration/v1/audio/p-80cb8a8cbb3d6461a0f32606.mp3",
  "assets/story-narration/v1/audio/p-81222cf922f6c56dc53657ad.mp3",
  "assets/story-narration/v1/audio/p-839b2637a9df1713ac1d186c.mp3",
  "assets/story-narration/v1/audio/p-8d4fb757cf9c37cacff78a23.mp3",
  "assets/story-narration/v1/audio/p-92f32840ee1006e3f2c3fe18.mp3",
  "assets/story-narration/v1/audio/p-98921001feb23379f7073527.mp3",
  "assets/story-narration/v1/audio/p-9b1bdd2d64ecfef4e2dbd7af.mp3",
  "assets/story-narration/v1/audio/p-a2134fbfd484dadcc946d87d.mp3",
  "assets/story-narration/v1/audio/p-a764bd652b88435ed04e1e1d.mp3",
  "assets/story-narration/v1/audio/p-ac38bf7dfea51564d49536da.mp3",
  "assets/story-narration/v1/audio/p-b5f68d892b502d5fd8009d1b.mp3",
  "assets/story-narration/v1/audio/p-c3dd49bc05ecd55187fb7d36.mp3",
  "assets/story-narration/v1/audio/p-d2c2ac28805efb9613eda88c.mp3",
  "assets/story-narration/v1/audio/p-d54fa93b87b334627bc19526.mp3",
  "assets/story-narration/v1/audio/p-d8016ed09670b106c992517a.mp3",
  "assets/story-narration/v1/audio/p-dc33e37f373c35fddc085948.mp3",
  "assets/story-narration/v1/audio/p-dd05cdc3527d78bacddc6201.mp3",
  "assets/story-narration/v1/audio/p-e31e04ed03c5caa69c440e23.mp3",
  "assets/story-narration/v1/audio/p-e82f8894d074b9e159841b5b.mp3",
  "assets/story-narration/v1/audio/p-f08e3da9eca905302931bc5d.mp3",
  "assets/story-narration/v1/audio/p-f659c312b57b36863175c8ee.mp3",
  "assets/story-narration/v1/audio/u201-pre-c2ebf253f455b2ac465ae945.mp3",
  "assets/story-narration/v1/audio/u202-post-cbe0673d735b53f31f256653.mp3",
  "assets/story-narration/v1/audio/u202-pre-fcbc77a97dfc6017ee46e974.mp3",
  "assets/story-narration/v1/audio/u204-post-080c5a986a14c21c75862dcc.mp3"
];
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
function validateBatchRevision(root, exec, ensure) {
  assert.equal(BATCH_NEW_AUDIO.length,44); assert.equal(new Set(BATCH_NEW_AUDIO).size,44);
  assert.equal(BATCH_NEW_UNITS.length,10); assert.equal(new Set(BATCH_NEW_UNITS).size,10);
  ensure(BATCH_BASE); ensure(AUDIO_REVISION);
  const headers=exec('git',['cat-file','-p',AUDIO_REVISION]).split('\n\n')[0];
  const parents=headers.split('\n').filter(line=>line.startsWith('parent ')).map(line=>line.slice(7));
  assert.deepEqual(parents,[BATCH_BASE],'Narration seed must descend directly from its verified main');
  const manifestPath='assets/story-narration/v1/manifest.json';
  const prefix='assets/story-narration/v1/';
  const before=JSON.parse(exec('git',['show',BATCH_BASE+':'+manifestPath]));
  const after=JSON.parse(exec('git',['show',AUDIO_REVISION+':'+manifestPath]));
  const parts=exec('git',['diff','--no-renames','--name-status','-z',BATCH_BASE,AUDIO_REVISION,'--']).split('\0');
  assert.equal(parts.pop(),''); assert.equal(parts.length%2,0);
  const changes=[];
  for(let i=0;i<parts.length;i+=2)changes.push({status:parts[i],file:parts[i+1]});
  const sort=rows=>rows.sort((a,b)=>a.file<b.file?-1:a.file>b.file?1:0);
  const expected=sort([{status:'M',file:manifestPath},{status:'M',file:'index.html'},...BATCH_NEW_AUDIO.map(file=>({status:'A',file}))]);
  assert.deepEqual(sort(changes),expected,'Narration seed changed an unapproved path or existing asset');
  function entries(ref) {
    const output=exec('git',['ls-tree','-z',ref,'--',...expected.map(row=>row.file)]);
    return new Map(output.split('\0').filter(Boolean).map(line=>{
      const match=/^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(line);
      assert(match,'Malformed Git tree entry');
      return[match[4],{mode:match[1],type:match[2],sha:match[3]}];
    }));
  }
  const oldTree=entries(BATCH_BASE),newTree=entries(AUDIO_REVISION);
  for(const change of expected) {
    const entry=newTree.get(change.file);
    assert(entry&&entry.mode==='100644'&&entry.type==='blob','Seed path is not an ordinary file: '+change.file);
    if(change.status==='A')assert(!oldTree.has(change.file),'New audio overwrote an existing path');
    else assert(oldTree.get(change.file)?.mode==='100644'&&oldTree.get(change.file)?.type==='blob','Seed changed a file mode/type');
  }
  assert.equal(before.coverage.includedUnits.length,41);
  assert(BATCH_NEW_UNITS.every(id=>!before.coverage.includedUnits.includes(id)),'Added unit already existed');
  assert.equal(Object.keys(before.assets).length,130);
  assert.equal(Object.keys(before.retiredAssets).length,8);
  assert.deepEqual(after.coverage.includedUnits.slice().sort(),[...before.coverage.includedUnits,...BATCH_NEW_UNITS].sort());
  assert.equal(after.coverage.includedUnits.length,51);
  assert.equal(new Set(after.coverage.includedUnits).size,51);
  assert.equal(after.coverage.includedRoutes,124); assert.equal(Object.keys(after.scenes).length,124);
  assert.equal(Object.keys(after.assets).length,174);
  for(const key of ['version','sourceCommit','sourceSha256','model','modelRevision','originals','immutable','retiredAssets','runtimeRevision'])
    assert.deepEqual(after[key],before[key],'Existing narration contract changed: '+key);
  for(const [file,metadata] of Object.entries(before.assets))assert.deepEqual(after.assets[file],metadata,'Existing audio metadata changed: '+file);
  for(const [key,route] of Object.entries(before.scenes))assert.deepEqual(after.scenes[key],route,'Existing narration route changed: '+key);
  const added=Object.keys(after.assets).filter(file=>!Object.hasOwn(before.assets,file)).map(file=>prefix+file).sort();
  assert.deepEqual(added,BATCH_NEW_AUDIO.slice().sort(),'Seed does not contain the frozen audio set');
  for(const file of BATCH_NEW_AUDIO) {
    const metadata=after.assets[file.slice(prefix.length)];
    assert(/^[a-f0-9]{64}$/.test(metadata.sha256)&&file.endsWith('-'+metadata.sha256.slice(0,24)+'.mp3'),'Audio address does not match content');
    const bytes=cp.execFileSync('git',['show',AUDIO_REVISION+':'+file],{cwd:root,maxBuffer:32*1024*1024});
    assert.equal(digest(bytes),metadata.sha256,'Seed audio hash differs: '+file);
    assert.equal(bytes.length,metadata.bytes,'Seed audio byte count differs: '+file);
  }
  const from='    <script src="./assets/story-narration/v1/player.js?v=2026100303"></script>';
  const to='    <script src="./assets/story-narration/v1/player.js?v=2026100305"></script>';
  const oldHtml=exec('git',['show',BATCH_BASE+':index.html']);
  const newHtml=exec('git',['show',AUDIO_REVISION+':index.html']);
  assert.equal(oldHtml.split(from).length,2,'Expected one old narration loader');
  assert.equal(newHtml.split(to).length,2,'Expected one new narration loader');
  assert.equal(newHtml,oldHtml.replace(from,to),'Narration seed changed more than the cache query');
  return{base:BATCH_BASE,reference:AUDIO_REVISION,files:BATCH_NEW_AUDIO,from,to,addedUnits:BATCH_NEW_UNITS,
    report:{base:BATCH_BASE,reference:AUDIO_REVISION,additionalUnits:10,additionalAudioFiles:44,includedUnits:51,includedRoutes:124,currentAudioFiles:174,retiredAudioFiles:8,oldAudioAndRoutesPreserved:true}};
}

function validateReviewedRevision(root, exec, ensure) {
  const manifestPath='assets/story-narration/v1/manifest.json',prefix='assets/story-narration/v1/';
  const sorted=values=>values.slice().sort();
  assert(/^[a-f0-9]{40}$/.test(REVIEWED_AUDIO_REVISION),'Reviewed narration seed must be finalized');
  assert.equal(REVIEWED_NEW_AUDIO.length,17); assert.equal(new Set(REVIEWED_NEW_AUDIO.map(row=>row.file)).size,17);
  assert.deepEqual(sorted(REVIEWED_NEW_UNITS),['ep1b02.pre','ep1b05.post','ep1b05.pre']);
  assert.deepEqual(sorted(REVIEWED_REPLACED_UNITS),['ep1a08.pre','ep1b06.pre','last304.pre']);
  assert.equal(Object.keys(REVIEWED_REPLACEMENTS).length,6); assert.equal(new Set(Object.values(REVIEWED_REPLACEMENTS)).size,6);
  ensure(REVIEWED_BASE); ensure(REVIEWED_AUDIO_REVISION);
  const headers=exec('git',['cat-file','-p',REVIEWED_AUDIO_REVISION]).split('\n\n')[0];
  const parents=headers.split('\n').filter(line=>line.startsWith('parent ')).map(line=>line.slice(7));
  assert.deepEqual(parents,[REVIEWED_BASE],'Reviewed narration seed must descend directly from its verified main');
  const beforeText=exec('git',['show',REVIEWED_BASE+':'+manifestPath]);
  const afterText=exec('git',['show',REVIEWED_AUDIO_REVISION+':'+manifestPath]);
  assert.equal(digest(afterText),REVIEWED_MANIFEST_SHA256,'Reviewed narration manifest is not the frozen package');
  const before=JSON.parse(beforeText),after=JSON.parse(afterText);
  const parts=exec('git',['diff','--no-renames','--name-status','-z',REVIEWED_BASE,REVIEWED_AUDIO_REVISION,'--']).split('\0');
  assert.equal(parts.pop(),''); assert.equal(parts.length%2,0);
  const changes=[];
  for(let i=0;i<parts.length;i+=2)changes.push({status:parts[i],file:parts[i+1]});
  const sortRows=rows=>rows.sort((a,b)=>a.file<b.file?-1:a.file>b.file?1:0);
  const expected=sortRows([{status:'M',file:manifestPath},{status:'M',file:'index.html'},...REVIEWED_NEW_AUDIO.map(row=>({status:'A',file:row.file}))]);
  assert.deepEqual(sortRows(changes),expected,'Reviewed narration seed changed an unapproved path or existing asset');
  function entries(ref) {
    return new Map(exec('git',['ls-tree','-z',ref,'--',...expected.map(row=>row.file)]).split('\0').filter(Boolean).map(line=>{
      const match=/^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(line);
      assert(match,'Malformed Git tree entry');
      return[match[4],{mode:match[1],type:match[2],sha:match[3]}];
    }));
  }
  const oldTree=entries(REVIEWED_BASE),newTree=entries(REVIEWED_AUDIO_REVISION);
  for(const change of expected) {
    const entry=newTree.get(change.file);
    assert(entry&&entry.mode==='100644'&&entry.type==='blob','Reviewed seed path is not an ordinary file: '+change.file);
    if(change.status==='A')assert(!oldTree.has(change.file),'Reviewed audio overwrote an existing path');
    else assert(oldTree.get(change.file)?.mode==='100644'&&oldTree.get(change.file)?.type==='blob','Reviewed seed changed a file mode/type');
  }
  assert.deepEqual(sorted(Object.keys(after)),sorted(Object.keys(before)),'Reviewed narration manifest contract keys changed');
  for(const key of ['version','sourceCommit','sourceSha256','model','modelRevision','originals','immutable','runtimeRevision'])
    assert.deepEqual(after[key],before[key],'Existing narration contract changed: '+key);
  assert.deepEqual(sorted(Object.keys(after.coverage)),sorted(Object.keys(before.coverage)),'Coverage contract keys changed');
  for(const key of ['mode','canonicalUnits','totalRoutes'])assert.deepEqual(after.coverage[key],before.coverage[key],'Coverage contract changed: '+key);
  assert.equal(before.coverage.includedUnits.length,51); assert.equal(new Set(before.coverage.includedUnits).size,51);
  assert(REVIEWED_NEW_UNITS.every(id=>!before.coverage.includedUnits.includes(id)&&before.coverage.pendingUnits.includes(id)),'Reviewed added unit already existed or was not pending');
  assert(REVIEWED_REPLACED_UNITS.every(id=>before.coverage.includedUnits.includes(id)),'Reviewed replacement unit was not published');
  assert.deepEqual(sorted(after.coverage.includedUnits),sorted([...before.coverage.includedUnits,...REVIEWED_NEW_UNITS]));
  assert.equal(after.coverage.includedUnits.length,54); assert.equal(new Set(after.coverage.includedUnits).size,54);
  assert.deepEqual(after.coverage.pendingUnits,before.coverage.pendingUnits.filter(id=>!REVIEWED_NEW_UNITS.includes(id)),'Unexpected pending unit change');
  assert.equal(Object.keys(before.assets).length,174); assert.equal(Object.keys(before.retiredAssets).length,8);
  assert.equal(Object.keys(after.assets).length,185); assert.equal(Object.keys(after.retiredAssets).length,14);
  const retired={...before.retiredAssets};
  for(const [oldFile,newFile] of Object.entries(REVIEWED_REPLACEMENTS)) {
    assert(Object.hasOwn(before.assets,oldFile)&&!Object.hasOwn(before.retiredAssets,oldFile),'Replaced audio was not previously active: '+oldFile);
    assert(!Object.hasOwn(after.assets,oldFile),'Replaced audio remains active: '+oldFile);
    assert(!Object.hasOwn(before.assets,newFile)&&!Object.hasOwn(before.retiredAssets,newFile),'Replacement overwrote a published address: '+newFile);
    assert(Object.hasOwn(after.assets,newFile),'Replacement audio is missing: '+newFile);
    assert.equal(after.assets[newFile].textSha256,before.assets[oldFile].textSha256,'Replacement changed canonical text: '+oldFile);
    retired[oldFile]=before.assets[oldFile];
  }
  assert.deepEqual(after.retiredAssets,retired,'Retired audio must equal the historical eight plus the exact six prior selections');
  const removed=Object.keys(before.assets).filter(file=>!Object.hasOwn(after.assets,file));
  assert.deepEqual(sorted(removed),sorted(Object.keys(REVIEWED_REPLACEMENTS)),'Unexpected removed active audio');
  for(const [file,metadata] of Object.entries(before.assets))if(!Object.hasOwn(REVIEWED_REPLACEMENTS,file))
    assert.deepEqual(after.assets[file],metadata,'Unchanged audio metadata differs: '+file);
  const added=Object.keys(after.assets).filter(file=>!Object.hasOwn(before.assets,file)).map(file=>prefix+file);
  assert.deepEqual(sorted(added),sorted(REVIEWED_NEW_AUDIO.map(row=>row.file)),'Reviewed seed does not contain the frozen audio set');
  for(const row of REVIEWED_NEW_AUDIO) {
    const metadata=after.assets[row.file.slice(prefix.length)];
    assert(/^[a-f0-9]{64}$/.test(row.sha256)&&row.file.endsWith('-'+row.sha256.slice(0,24)+'.mp3'),'Frozen audio address does not match content');
    assert.equal(metadata.sha256,row.sha256,'Reviewed audio hash differs from frozen selection: '+row.file);
    assert.equal(metadata.bytes,row.bytes,'Reviewed audio byte count differs from frozen selection: '+row.file);
    const bytes=cp.execFileSync('git',['show',REVIEWED_AUDIO_REVISION+':'+row.file],{cwd:root,maxBuffer:32*1024*1024});
    assert.equal(digest(bytes),row.sha256,'Reviewed seed audio hash differs: '+row.file);
    assert.equal(bytes.length,row.bytes,'Reviewed seed audio byte count differs: '+row.file);
  }
  const replaceClip=clip=>{
    const replacement=REVIEWED_REPLACEMENTS[clip.audio];
    if(!replacement)return clip;
    const asset=after.assets[replacement];
    return{...clip,audio:replacement,sha256:asset.sha256,duration:asset.duration};
  };
  const replaceRoute=route=>route.clips?{...route,clips:route.clips.map(replaceClip)}:replaceClip(route);
  assert.equal(Object.keys(before.scenes).length,124); assert.equal(before.coverage.includedRoutes,124);
  for(const [key,route] of Object.entries(before.scenes))
    assert.deepEqual(after.scenes[key],replaceRoute(route),'Existing narration route changed outside the six exact audio selections: '+key);
  const newRoutes=Object.keys(after.scenes).filter(key=>!Object.hasOwn(before.scenes,key));
  assert.deepEqual(sorted(newRoutes),REVIEWED_NEW_ROUTES,'Unexpected new narration routes');
  assert.equal(newRoutes.length,9); assert.equal(after.coverage.includedRoutes,133); assert.equal(Object.keys(after.scenes).length,133);
  assert(REVIEWED_NEW_ROUTES.every(key=>before.coverage.pendingRoutes.includes(key)),'New narration route was not pending');
  assert.deepEqual(after.coverage.pendingRoutes,before.coverage.pendingRoutes.filter(key=>!REVIEWED_NEW_ROUTES.includes(key)),'Unexpected pending route change');
  for(const id of REVIEWED_REPLACED_UNITS) {
    const route=id.replace('.',':');
    assert.equal(after.scenes[route].audio,REVIEWED_REPLACEMENTS[before.scenes[route].audio],'Selected replacement unit differs: '+id);
  }
  const from='    <script src="./assets/story-narration/v1/player.js?v=2026100305"></script>';
  const to='    <script src="./assets/story-narration/v1/player.js?v=2026100306"></script>';
  const oldHtml=exec('git',['show',REVIEWED_BASE+':index.html']),newHtml=exec('git',['show',REVIEWED_AUDIO_REVISION+':index.html']);
  assert.equal(oldHtml.split(from).length,2,'Expected one prior reviewed narration loader');
  assert.equal(newHtml.split(to).length,2,'Expected one reviewed narration loader');
  assert.equal(newHtml,oldHtml.replace(from,to),'Reviewed narration seed changed more than the cache query');
  return{base:REVIEWED_BASE,reference:REVIEWED_AUDIO_REVISION,files:REVIEWED_NEW_AUDIO.map(row=>row.file),from,to,
    report:{base:REVIEWED_BASE,reference:REVIEWED_AUDIO_REVISION,sourceManifestSha256:REVIEWED_SOURCE_MANIFEST_SHA256,bindingsSha256:REVIEWED_BINDINGS_SHA256,runtimeManifestSha256:REVIEWED_MANIFEST_SHA256,additionalUnits:3,replacedUnits:REVIEWED_REPLACED_UNITS,unchangedPreviouslyPublishedUnits:48,replacedAudioFiles:6,additionalAudioFiles:17,additionalRoutes:9,includedUnits:54,includedRoutes:133,currentAudioFiles:185,retiredAudioFiles:14,oldAudioPreserved:true,oldRoutesPreservedExceptExactSelections:true}};
}

function verify(root){
 const exec=(cmd,args,cwd=root)=>cp.execFileSync(cmd,args,{cwd,encoding:'utf8',maxBuffer:32*1024*1024});
 const ensure=ref=>{if(cp.spawnSync('git',['cat-file','-e',ref+':index.html'],{cwd:root,stdio:'ignore'}).status!==0)exec('git',['fetch','--no-tags','--depth=1','origin',ref]);};
 ensure(BASE);
 const batch=validateBatchRevision(root,exec,ensure);
 const reviewed=validateReviewedRevision(root,exec,ensure);
 const files=['index.html','assets/index-v31526.js','assets/rc23/feedback.js','assets/rc128/combat-feedback.js'];
 const unchanged=['assets/rc77','assets/rc127','assets/rc129','assets/rc43/bloodied-flight.js','assets/combat-v31412/skill-completion.js','assets/story-narration','assets/rc49/story-voice.js','assets/rc51/story.js','data/story-rc51.js','data/opening-voice-rc74.json'];
 const changedProtected=exec('git',['diff','--name-only',BASE,'--',...unchanged]).trim().split('\n').filter(Boolean).sort();
 let narration=null;
 if(changedProtected.length){
  // Keep the historical correction and both separately validated audio-only
  // batches pinned; all runtime/source protection stays.
  ensure(NARRATION);
  const historicalApproved=exec('git',['diff','--name-only',BASE,NARRATION,'--','assets/story-narration']).trim().split('\n').filter(Boolean).sort();
  assert.equal(historicalApproved.length,9,'Expected one correction manifest and eight immutable audio assets');
  const approved=[...historicalApproved,...batch.files,...reviewed.files].sort();
  assert.equal(approved.length,70); assert.equal(new Set(approved).size,70);
  const seedApproved=exec('git',['diff','--name-only',BASE,REVIEWED_AUDIO_REVISION,'--','assets/story-narration']).trim().split('\n').filter(Boolean).sort();
  assert.deepEqual(seedApproved,approved,'Seed changed narration outside the three exact accepted revisions');
  assert(approved.every(file=>file==='assets/story-narration/v1/manifest.json'||/^assets\/story-narration\/v1\/audio\/[a-z0-9-]+\.mp3$/.test(file)),'Narration reference includes unexpected runtime changes');
  assert.deepEqual(changedProtected,approved,'Protected gameplay/narration source differs outside exact accepted correction');
  const rows=approved.map(file=>{
   const expected=crypto.createHash('sha256').update(cp.execFileSync('git',['show',REVIEWED_AUDIO_REVISION+':'+file],{cwd:root,maxBuffer:32*1024*1024})).digest('hex');
   const actual=digest(fs.readFileSync(path.join(root,file)));assert.equal(actual,expected,'Narration correction differs: '+file);return{file,expected,actual};
  });
  const before=exec('git',['show',BASE+':index.html']),after=exec('git',['show',NARRATION+':index.html']);
  const tag=/    <script src="\.\/assets\/story-narration\/v1\/player\.js\?v=\d+"><\/script>/g;
  const from=[...before.matchAll(tag)],to=[...after.matchAll(tag)];assert.equal(from.length,1);assert.equal(to.length,1);
  assert.equal(after,before.replace(from[0][0],to[0][0]),'Independent narration HTML edit must be its cache key only');
  narration={reference:REVIEWED_AUDIO_REVISION,historicalReference:NARRATION,from:from[0][0],to:to[0][0],files:rows};
 }
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'hapil-rc130-preservation-')),historical={},rows=[];
 const put=(file,text)=>{const p=path.join(scratch,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);};
 try{
  for(const file of files){historical[file]=exec('git',['show',BASE+':'+file]);put(file,historical[file]);}
  for(const file of ['tools/rc130-apply.cjs','tools/rc130-ordnance.cjs','assets/rc130/audio-policy.js'])put(file,fs.readFileSync(path.join(root,file)));
  exec(process.execPath,['tools/rc130-apply.cjs'],scratch);exec(process.execPath,['tools/rc130-ordnance.cjs'],scratch);
  if(narration){const file='index.html',text=fs.readFileSync(path.join(scratch,file),'utf8');assert.equal(text.split(narration.from).length,2);put(file,text.replace(narration.from,narration.to));}
  const combat=fs.readFileSync(path.join(root,'index.html'),'utf8').includes('./assets/combat-audio/v1/catalog.js');
  if(combat){put('tools/combat-audio-apply.cjs',fs.readFileSync(path.join(root,'tools/combat-audio-apply.cjs')));exec(process.execPath,['tools/combat-audio-apply.cjs'],scratch);}
  {const file='index.html',text=fs.readFileSync(path.join(scratch,file),'utf8');assert.equal(text.split(batch.from).length,2);put(file,text.replace(batch.from,batch.to));}
  // RC131 exact authorized image fallback reconstruction.
  if(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('./assets/rc131/hero-images.js?v=43101')){put('tools/rc131-apply.cjs',fs.readFileSync(path.join(root,'tools/rc131-apply.cjs')));exec(process.execPath,['tools/rc131-apply.cjs','--runtime-only'],scratch);}
  {const file='index.html',text=fs.readFileSync(path.join(scratch,file),'utf8');assert.equal(text.split(reviewed.from).length,2);put(file,text.replace(reviewed.from,reviewed.to));}
  for(const file of [...files,'assets/rc130/audio-policy.js']){const expected=digest(fs.readFileSync(path.join(scratch,file))),actual=digest(fs.readFileSync(path.join(root,file)));rows.push({file,expected,actual});assert.equal(actual,expected,'Unexpected change outside exact RC130 integration: '+file);}
  return{historical,report:{status:'passed',base:BASE,method:'Reapply exact anchored RC130 integration and independently hash-verified narration revisions in a disposable directory; compare full bytes. Runtime under test is never substituted.',files:rows,protectedPaths:unchanged,independentNarrationMigration:narration,independentNarrationBatch:batch.report,independentReviewedNarrationBatch:reviewed.report,independentCombatAudioMigration:combat?{helperSha256:digest(fs.readFileSync(path.join(root,'tools/combat-audio-apply.cjs'))),scope:'19 exact audio hooks and three loaders; full runtime bytes reproduced'}:null}};
 }finally{fs.rmSync(scratch,{recursive:true,force:true});}
}
module.exports={verify,BASE};
if(require.main===module)console.log('RC130_PRESERVATION_RESULT',JSON.stringify(verify(path.resolve(__dirname,'..')).report));
