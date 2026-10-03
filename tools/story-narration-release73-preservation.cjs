'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const EXPANDED_BASE="ee3bb0b5a77e3bbebd7c7d0a89323b94d67576fa";
const EXPANDED_AUDIO_REVISION="5f6bbaa0360b27ec98dd2d36e338fbf1b027ca38";
const EXPANDED_MANIFEST_SHA256="68dbee6e0f43887be252af75884b3247409e5b76d546c6d8182483d6307f6725";
const EXPANDED_SOURCE_MANIFEST_SHA256="e5859416e81443c1328437cffe845321c48f6b7197af2852e5275e3d2f60663b";
const EXPANDED_BINDINGS_SHA256="e8f58796185080dc09d65696c71352ebb2799959e44318a96f451e5f85d8cc78";
const EXPANDED_NEW_UNITS=[
  "cult01.post",
  "cult02.post",
  "cult02.pre",
  "hando02.post",
  "hando02.pre",
  "hando03.pre",
  "kair02.pre",
  "kair03.pre",
  "kair05.post",
  "kair05.pre",
  "kair06.pre",
  "kair07.post",
  "kair07.pre",
  "kair08.pre",
  "kair09.pre",
  "kair10.post",
  "kair10.pre",
  "last301.pre",
  "murder02.post"
];
const EXPANDED_NEW_ROUTES=[
  "cult01:post",
  "cult02:post",
  "cult02:pre",
  "hando02:post",
  "hando02:pre",
  "hando03:pre",
  "journal:cult02:all",
  "journal:cult02:body",
  "journal:cult02:entry",
  "journal:hando02:all",
  "journal:hando02:body",
  "journal:hando02:entry",
  "journal:hando03:entry",
  "journal:kair02:entry",
  "journal:kair03:entry",
  "journal:kair05:all",
  "journal:kair05:body",
  "journal:kair05:entry",
  "journal:kair06:entry",
  "journal:kair07:all",
  "journal:kair07:body",
  "journal:kair07:entry",
  "journal:kair08:entry",
  "journal:kair09:entry",
  "journal:kair10:all",
  "journal:kair10:body",
  "journal:kair10:entry",
  "journal:last301:all",
  "journal:last301:body",
  "journal:last301:entry",
  "kair02:pre",
  "kair03:pre",
  "kair05:post",
  "kair05:pre",
  "kair06:pre",
  "kair07:post",
  "kair07:pre",
  "kair08:pre",
  "kair09:pre",
  "kair10:post",
  "kair10:pre",
  "last301:pre",
  "murder02:post"
];
const EXPANDED_NEW_AUDIO=[
  {
    "file": "assets/story-narration/v1/audio/cult01-post-6f2a4f328e8f16b28a463b87.mp3",
    "sha256": "6f2a4f328e8f16b28a463b8761cbcb8b9a9e5826f6069b87575d311f958a7656",
    "bytes": 294188
  },
  {
    "file": "assets/story-narration/v1/audio/cult02-post-63023d9a25594dd02233f6dd.mp3",
    "sha256": "63023d9a25594dd02233f6ddec6e468572deb578e242c444e4c300b92d99915b",
    "bytes": 307244
  },
  {
    "file": "assets/story-narration/v1/audio/cult02-pre-c90e7df92ea47339da915bc4.mp3",
    "sha256": "c90e7df92ea47339da915bc47c34363ef189e89fc042b0501798aaa126a77858",
    "bytes": 614828
  },
  {
    "file": "assets/story-narration/v1/audio/hando02-post-1c0dc62b824019f892691800.mp3",
    "sha256": "1c0dc62b824019f8926918002feb814d936cf94f1e5ee872b64d5a982f0982d8",
    "bytes": 262700
  },
  {
    "file": "assets/story-narration/v1/audio/hando02-pre-55553de3e9f2f471d513b516.mp3",
    "sha256": "55553de3e9f2f471d513b516e91094a547677ca915f1795f3990915a4a93e7b9",
    "bytes": 472748
  },
  {
    "file": "assets/story-narration/v1/audio/hando03-pre-a82710b72297e16aa457aa9f.mp3",
    "sha256": "a82710b72297e16aa457aa9fcd274e9bf0c4cc6ed57a377ff183c95d27cc32c1",
    "bytes": 530348
  },
  {
    "file": "assets/story-narration/v1/audio/kair02-pre-f62d668ce74da0f0147cbdc2.mp3",
    "sha256": "f62d668ce74da0f0147cbdc25b1d7282476e277b5d13bc6f9119bbdee2a74567",
    "bytes": 560300
  },
  {
    "file": "assets/story-narration/v1/audio/kair03-pre-a32917ed9e171edfe9161059.mp3",
    "sha256": "a32917ed9e171edfe9161059a9e17bec484c2ca713e465e6ecdd7eff3698adce",
    "bytes": 1178924
  },
  {
    "file": "assets/story-narration/v1/audio/kair05-post-732b5978760a9a30406caea4.mp3",
    "sha256": "732b5978760a9a30406caea40b4db766d40e2e43013c5e48d373dd64e5df6480",
    "bytes": 538028
  },
  {
    "file": "assets/story-narration/v1/audio/kair05-pre-23e7a901584e1d73ce0e92c1.mp3",
    "sha256": "23e7a901584e1d73ce0e92c17d934c01c926054d1c44e7e4252293438fbc83e6",
    "bytes": 502700
  },
  {
    "file": "assets/story-narration/v1/audio/kair06-pre-0f3e769c28d264b1242e446a.mp3",
    "sha256": "0f3e769c28d264b1242e446a969ef996993f8fdc71986c36a9e69f322213f61c",
    "bytes": 273836
  },
  {
    "file": "assets/story-narration/v1/audio/kair07-post-bfda6cb842fabaeeda8a2a94.mp3",
    "sha256": "bfda6cb842fabaeeda8a2a946878203c74e73d50b77a40df861ba13f27f31657",
    "bytes": 244652
  },
  {
    "file": "assets/story-narration/v1/audio/kair07-pre-8097bb64b698de0ad16bd4c7.mp3",
    "sha256": "8097bb64b698de0ad16bd4c7bf98ff3b4ede4038b23cac8734b37a3ac8520d82",
    "bytes": 600236
  },
  {
    "file": "assets/story-narration/v1/audio/kair08-pre-465a6d044f03ace74f362d7b.mp3",
    "sha256": "465a6d044f03ace74f362d7b763b71bb9afca552fe7858b9b13fd0e25ae95b5b",
    "bytes": 237740
  },
  {
    "file": "assets/story-narration/v1/audio/kair09-pre-21da0ee7ceaa92fd81a1faca.mp3",
    "sha256": "21da0ee7ceaa92fd81a1facae94f8475c75098a0c38b1e9be819de53a6948fe0",
    "bytes": 215468
  },
  {
    "file": "assets/story-narration/v1/audio/kair10-post-9f177b5d9b2142fb449a5a96.mp3",
    "sha256": "9f177b5d9b2142fb449a5a96f6c463255d73766265f84360073539822607c66a",
    "bytes": 306476
  },
  {
    "file": "assets/story-narration/v1/audio/kair10-pre-67b4d8c2fc4d84c84a762596.mp3",
    "sha256": "67b4d8c2fc4d84c84a7625962b502588f4e48987b6fab0e840dccc4f50733d7a",
    "bytes": 486188
  },
  {
    "file": "assets/story-narration/v1/audio/last301-pre-e7b9c7a9503ce4813912fcd3.mp3",
    "sha256": "e7b9c7a9503ce4813912fcd3c34683c8d02843b27c014a2cc5458bc2dc15742a",
    "bytes": 544940
  },
  {
    "file": "assets/story-narration/v1/audio/murder02-post-359015728668c0cbdb2ddead.mp3",
    "sha256": "359015728668c0cbdb2ddeadf0ec783cd9daad775709769057d6cc0dfd86930d",
    "bytes": 544940
  },
  {
    "file": "assets/story-narration/v1/audio/p-02c758422e4b50fcca946f46.mp3",
    "sha256": "02c758422e4b50fcca946f469f556e538d3059b6d93e717fb8a320a498e91081",
    "bytes": 255788
  },
  {
    "file": "assets/story-narration/v1/audio/p-040280b38d98f904b53d9277.mp3",
    "sha256": "040280b38d98f904b53d92776a88e3a8a8ea4e1faa86e2e901957021e8845628",
    "bytes": 266924
  },
  {
    "file": "assets/story-narration/v1/audio/p-0f2deaf213258a2a68ec2352.mp3",
    "sha256": "0f2deaf213258a2a68ec2352034d20d27e6d3477cb139183c6f8923b7ef49d6e",
    "bytes": 230828
  },
  {
    "file": "assets/story-narration/v1/audio/p-1b1f520b13ff4e22fc05f2a3.mp3",
    "sha256": "1b1f520b13ff4e22fc05f2a3595a05c465f6b0f93a8664b5ebdd12e45bfa47f5",
    "bytes": 259628
  },
  {
    "file": "assets/story-narration/v1/audio/p-208c54e58eb3ccae2ba854b1.mp3",
    "sha256": "208c54e58eb3ccae2ba854b11677e8366e22a4ce47aefb67849864e1af1563a5",
    "bytes": 263468
  },
  {
    "file": "assets/story-narration/v1/audio/p-2270d110c4ff513bc5705c74.mp3",
    "sha256": "2270d110c4ff513bc5705c748436f564e9a470c300036c4fe2ec975f6c9d12d5",
    "bytes": 237740
  },
  {
    "file": "assets/story-narration/v1/audio/p-26752772804672d743402c99.mp3",
    "sha256": "26752772804672d743402c99437467dc209725ab789ede4be315ed0fffe0a0e6",
    "bytes": 227756
  },
  {
    "file": "assets/story-narration/v1/audio/p-2d9159ea9b7e5de6b4e22d10.mp3",
    "sha256": "2d9159ea9b7e5de6b4e22d1026397ad4a054ba03badf6125fbffe5d304306f9c",
    "bytes": 352556
  },
  {
    "file": "assets/story-narration/v1/audio/p-3b3834d455cb81ae89269c6b.mp3",
    "sha256": "3b3834d455cb81ae89269c6bb4d2a53b0063d5f6682a4c34e665dee8130352bb",
    "bytes": 208556
  },
  {
    "file": "assets/story-narration/v1/audio/p-3b85cba543cb9b26e6392431.mp3",
    "sha256": "3b85cba543cb9b26e63924319f52180e1fdd7c62439fb603dcf3c6a33c8dcacd",
    "bytes": 377132
  },
  {
    "file": "assets/story-narration/v1/audio/p-4588a26171168a87789abc49.mp3",
    "sha256": "4588a26171168a87789abc4917e0a8805b5f7d890104ebf02fa8d9ca0a8fdf17",
    "bytes": 278828
  },
  {
    "file": "assets/story-narration/v1/audio/p-4ce1d43cccb2791320dbb77b.mp3",
    "sha256": "4ce1d43cccb2791320dbb77b1e179a57e4fa36ca8eb804375dc17edee389882b",
    "bytes": 259628
  },
  {
    "file": "assets/story-narration/v1/audio/p-53822085def2e8d5d2139ae9.mp3",
    "sha256": "53822085def2e8d5d2139ae9ad95e95c1113f94b131bd9787d57882fc991b024",
    "bytes": 307244
  },
  {
    "file": "assets/story-narration/v1/audio/p-6516038d71b2fdfe0cfa4770.mp3",
    "sha256": "6516038d71b2fdfe0cfa4770d69a17b77b06d57bfac7f052e0dbf3865e94ba3f",
    "bytes": 318764
  },
  {
    "file": "assets/story-narration/v1/audio/p-716928f03f15768a942b0024.mp3",
    "sha256": "716928f03f15768a942b00249c53cb58cd44eb789ff7dc671972496a5467a8fa",
    "bytes": 297644
  },
  {
    "file": "assets/story-narration/v1/audio/p-7813490b3b4c1f162f9a342d.mp3",
    "sha256": "7813490b3b4c1f162f9a342d36f10bb4cab0332cb3d724d0a1441bd37678ebd0",
    "bytes": 241580
  },
  {
    "file": "assets/story-narration/v1/audio/p-789e4a24eba558d0e76b7be4.mp3",
    "sha256": "789e4a24eba558d0e76b7be4c6e35e968fab8cf969bf0451bc5e7e60c076ff89",
    "bytes": 287276
  },
  {
    "file": "assets/story-narration/v1/audio/p-7950ef327391242c34592c28.mp3",
    "sha256": "7950ef327391242c34592c28955e73ea82464ac9919bd66763fafcfb1e65eb04",
    "bytes": 299564
  },
  {
    "file": "assets/story-narration/v1/audio/p-801da28a45026e93612c141b.mp3",
    "sha256": "801da28a45026e93612c141b30e3f350dea674292e9a4515773b869481d8e44e",
    "bytes": 236588
  },
  {
    "file": "assets/story-narration/v1/audio/p-90ea5a4c3b4f80a328e1043d.mp3",
    "sha256": "90ea5a4c3b4f80a328e1043d441bac351b35c0a75752d697239f4e1ae6a30796",
    "bytes": 268844
  },
  {
    "file": "assets/story-narration/v1/audio/p-938e3dcea727705a82950dc7.mp3",
    "sha256": "938e3dcea727705a82950dc7b41412deac5575d574f9c8d7dc205df34e14e905",
    "bytes": 287660
  },
  {
    "file": "assets/story-narration/v1/audio/p-9816d21342d7b2d02901beb7.mp3",
    "sha256": "9816d21342d7b2d02901beb7b47914ebb219fdf1151b3d72bcb5ca6b29735c39",
    "bytes": 266156
  },
  {
    "file": "assets/story-narration/v1/audio/p-985f95d3d0693a033c20e4bd.mp3",
    "sha256": "985f95d3d0693a033c20e4bda5c0057001c96cca3c42a1a520d7667e51a902f2",
    "bytes": 290732
  },
  {
    "file": "assets/story-narration/v1/audio/p-ac4aa68fdfdea91c3f96d16c.mp3",
    "sha256": "ac4aa68fdfdea91c3f96d16cafe7851e562b3670d51a163887affb511707fd52",
    "bytes": 279980
  },
  {
    "file": "assets/story-narration/v1/audio/p-aecd22982e222aab7dc6778e.mp3",
    "sha256": "aecd22982e222aab7dc6778e3db99bbf4757b7a1579703c68dd81d393456626c",
    "bytes": 265004
  },
  {
    "file": "assets/story-narration/v1/audio/p-b552a89ca56d6ddabc7daee4.mp3",
    "sha256": "b552a89ca56d6ddabc7daee40ee37818e394499a444fe5270b6bd687d83afbbe",
    "bytes": 300332
  },
  {
    "file": "assets/story-narration/v1/audio/p-c19925b7d85fde3b69a6fddc.mp3",
    "sha256": "c19925b7d85fde3b69a6fddc562e2529a9304650d44bfb74c596e480a02b1600",
    "bytes": 330668
  },
  {
    "file": "assets/story-narration/v1/audio/p-c5520c4f7f881ffb1bddad00.mp3",
    "sha256": "c5520c4f7f881ffb1bddad00245f113bdd4c05d7c0b638aaf5600c5a285b6eed",
    "bytes": 150956
  },
  {
    "file": "assets/story-narration/v1/audio/p-d09d70e4bd5b1c55f176bbe0.mp3",
    "sha256": "d09d70e4bd5b1c55f176bbe014ba43e43c149c3cda4e661c77be552e485fb9df",
    "bytes": 226604
  },
  {
    "file": "assets/story-narration/v1/audio/p-f511fb8089335c364cfcc5ab.mp3",
    "sha256": "f511fb8089335c364cfcc5abeb9723717758f8a74b7cfebb159ed6e5d3cdcfee",
    "bytes": 173996
  },
  {
    "file": "assets/story-narration/v1/audio/p-f8743d104a8f54a7906961f4.mp3",
    "sha256": "f8743d104a8f54a7906961f40e896e9b156ebff1a33bc087091db6e5e9d9a9cb",
    "bytes": 29996
  },
  {
    "file": "assets/story-narration/v1/audio/p-faaa5007ec81305393e96ab2.mp3",
    "sha256": "faaa5007ec81305393e96ab2d06cf448a9fc3c0bd1a1f114319d582088e0e183",
    "bytes": 252332
  },
  {
    "file": "assets/story-narration/v1/audio/p-ff5aaea5fe5f1dd7df92bd6f.mp3",
    "sha256": "ff5aaea5fe5f1dd7df92bd6f6a7965608dfab9f61b36f80491f1fdad8a95c1e8",
    "bytes": 212780
  }
];
function validateExpandedRevision(root, exec, ensure) {
  const manifestPath='assets/story-narration/v1/manifest.json',prefix='assets/story-narration/v1/';
  const sorted=values=>values.slice().sort();
  assert(/^[a-f0-9]{40}$/.test(EXPANDED_AUDIO_REVISION),'Expanded narration seed must be finalized');
  assert.equal(EXPANDED_NEW_AUDIO.length,52); assert.equal(new Set(EXPANDED_NEW_AUDIO.map(row=>row.file)).size,52);
  assert.deepEqual(sorted(EXPANDED_NEW_UNITS),['cult01.post','cult02.post','cult02.pre','hando02.post','hando02.pre','hando03.pre','kair02.pre','kair03.pre','kair05.post','kair05.pre','kair06.pre','kair07.post','kair07.pre','kair08.pre','kair09.pre','kair10.post','kair10.pre','last301.pre','murder02.post']);
  assert.equal(EXPANDED_NEW_ROUTES.length,43); assert.equal(new Set(EXPANDED_NEW_ROUTES).size,43);
  ensure(EXPANDED_BASE); ensure(EXPANDED_AUDIO_REVISION);
  const headers=exec('git',['cat-file','-p',EXPANDED_AUDIO_REVISION]).split('\n\n')[0];
  const parents=headers.split('\n').filter(line=>line.startsWith('parent ')).map(line=>line.slice(7));
  assert.deepEqual(parents,[EXPANDED_BASE],'Expanded narration seed must descend directly from its verified main');
  const beforeText=exec('git',['show',EXPANDED_BASE+':'+manifestPath]);
  const afterText=exec('git',['show',EXPANDED_AUDIO_REVISION+':'+manifestPath]);
  assert.equal(digest(afterText),EXPANDED_MANIFEST_SHA256,'Expanded narration manifest is not the frozen package');
  const before=JSON.parse(beforeText),after=JSON.parse(afterText);
  const parts=exec('git',['diff','--no-renames','--name-status','-z',EXPANDED_BASE,EXPANDED_AUDIO_REVISION,'--']).split('\0');
  assert.equal(parts.pop(),''); assert.equal(parts.length%2,0);
  const changes=[];
  for(let i=0;i<parts.length;i+=2)changes.push({status:parts[i],file:parts[i+1]});
  const sortRows=rows=>rows.sort((a,b)=>a.file<b.file?-1:a.file>b.file?1:0);
  const expected=sortRows([{status:'M',file:manifestPath},{status:'M',file:'index.html'},...EXPANDED_NEW_AUDIO.map(row=>({status:'A',file:row.file}))]);
  assert.deepEqual(sortRows(changes),expected,'Expanded narration seed changed an unapproved path or existing asset');
  function entries(ref) {
    return new Map(exec('git',['ls-tree','-z',ref,'--',...expected.map(row=>row.file)]).split('\0').filter(Boolean).map(line=>{
      const match=/^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(line);
      assert(match,'Malformed Git tree entry');
      return[match[4],{mode:match[1],type:match[2],sha:match[3]}];
    }));
  }
  const oldTree=entries(EXPANDED_BASE),newTree=entries(EXPANDED_AUDIO_REVISION);
  for(const change of expected) {
    const entry=newTree.get(change.file);
    assert(entry&&entry.mode==='100644'&&entry.type==='blob','Expanded seed path is not an ordinary file: '+change.file);
    if(change.status==='A')assert(!oldTree.has(change.file),'Expanded audio overwrote an existing path');
    else assert(oldTree.get(change.file)?.mode==='100644'&&oldTree.get(change.file)?.type==='blob','Expanded seed changed a file mode/type');
  }
  assert.deepEqual(sorted(Object.keys(after)),sorted(Object.keys(before)),'Expanded narration manifest contract keys changed');
  for(const key of ['version','sourceCommit','sourceSha256','model','modelRevision','originals','immutable','runtimeRevision'])
    assert.deepEqual(after[key],before[key],'Existing narration contract changed: '+key);
  assert.deepEqual(sorted(Object.keys(after.coverage)),sorted(Object.keys(before.coverage)),'Coverage contract keys changed');
  for(const key of ['mode','canonicalUnits','totalRoutes'])assert.deepEqual(after.coverage[key],before.coverage[key],'Coverage contract changed: '+key);
  assert.equal(before.coverage.canonicalUnits,119); assert.equal(before.coverage.totalRoutes,297);
  assert.equal(before.coverage.includedUnits.length,54); assert.equal(new Set(before.coverage.includedUnits).size,54);
  assert(EXPANDED_NEW_UNITS.every(id=>!before.coverage.includedUnits.includes(id)&&before.coverage.pendingUnits.includes(id)),'Expanded added unit already existed or was not pending');
  assert.deepEqual(sorted(after.coverage.includedUnits),sorted([...before.coverage.includedUnits,...EXPANDED_NEW_UNITS]),'Unexpected included unit change');
  assert.equal(after.coverage.includedUnits.length,73); assert.equal(new Set(after.coverage.includedUnits).size,73);
  assert.deepEqual(after.coverage.pendingUnits,before.coverage.pendingUnits.filter(id=>!EXPANDED_NEW_UNITS.includes(id)),'Unexpected pending unit change');
  assert.equal(after.coverage.pendingUnits.length,46); assert.equal(new Set(after.coverage.pendingUnits).size,46);
  assert(after.coverage.pendingUnits.every(id=>!after.coverage.includedUnits.includes(id)),'Included and pending units overlap');
  assert.equal(Object.keys(before.assets).length,185); assert.equal(Object.keys(before.retiredAssets).length,14);
  assert.equal(Object.keys(after.assets).length,237); assert.equal(Object.keys(after.retiredAssets).length,14);
  assert.deepEqual(after.retiredAssets,before.retiredAssets,'Retired audio must remain the exact historical fourteen');
  for(const [file,metadata] of Object.entries(before.assets))
    assert.deepEqual(after.assets[file],metadata,'Existing audio metadata changed: '+file);
  const added=Object.keys(after.assets).filter(file=>!Object.hasOwn(before.assets,file)).map(file=>prefix+file);
  assert.deepEqual(sorted(added),sorted(EXPANDED_NEW_AUDIO.map(row=>row.file)),'Expanded seed does not contain the frozen audio set');
  for(const row of EXPANDED_NEW_AUDIO) {
    assert(/^assets\/story-narration\/v1\/audio\/[a-z0-9-]+\.mp3$/.test(row.file),'Expanded audio path is invalid');
    const file=row.file.slice(prefix.length),metadata=after.assets[file];
    assert(!Object.hasOwn(before.assets,file)&&!Object.hasOwn(before.retiredAssets,file),'Expanded audio reused a published address: '+file);
    assert(/^[a-f0-9]{64}$/.test(row.sha256)&&row.file.endsWith('-'+row.sha256.slice(0,24)+'.mp3'),'Frozen audio address does not match content');
    assert.equal(metadata.sha256,row.sha256,'Expanded audio hash differs from frozen selection: '+row.file);
    assert.equal(metadata.bytes,row.bytes,'Expanded audio byte count differs from frozen selection: '+row.file);
    const bytes=cp.execFileSync('git',['show',EXPANDED_AUDIO_REVISION+':'+row.file],{cwd:root,maxBuffer:32*1024*1024});
    assert.equal(digest(bytes),row.sha256,'Expanded seed audio hash differs: '+row.file);
    assert.equal(bytes.length,row.bytes,'Expanded seed audio byte count differs: '+row.file);
  }
  assert.equal(Object.keys(before.scenes).length,133); assert.equal(before.coverage.includedRoutes,133);
  for(const [key,route] of Object.entries(before.scenes))
    assert.deepEqual(after.scenes[key],route,'Existing narration route changed: '+key);
  const newRoutes=Object.keys(after.scenes).filter(key=>!Object.hasOwn(before.scenes,key));
  assert.deepEqual(sorted(newRoutes),EXPANDED_NEW_ROUTES,'Unexpected new narration routes');
  assert.equal(newRoutes.length,43); assert.equal(after.coverage.includedRoutes,176); assert.equal(Object.keys(after.scenes).length,176);
  assert(EXPANDED_NEW_ROUTES.every(key=>before.coverage.pendingRoutes.includes(key)),'New narration route was not pending');
  assert.deepEqual(after.coverage.pendingRoutes,before.coverage.pendingRoutes.filter(key=>!EXPANDED_NEW_ROUTES.includes(key)),'Unexpected pending route change');
  assert.equal(after.coverage.pendingRoutes.length,121); assert.equal(new Set(after.coverage.pendingRoutes).size,121);
  assert(after.coverage.pendingRoutes.every(key=>!Object.hasOwn(after.scenes,key)),'Included and pending routes overlap');
  const from='    <script src="./assets/story-narration/v1/player.js?v=2026100306"></script>';
  const to='    <script src="./assets/story-narration/v1/player.js?v=2026100307"></script>';
  const oldHtml=exec('git',['show',EXPANDED_BASE+':index.html']),newHtml=exec('git',['show',EXPANDED_AUDIO_REVISION+':index.html']);
  assert.equal(oldHtml.split(from).length,2,'Expected one prior expanded narration loader');
  assert.equal(newHtml.split(to).length,2,'Expected one expanded narration loader');
  assert.equal(newHtml,oldHtml.replace(from,to),'Expanded narration seed changed more than the cache query');
  return{base:EXPANDED_BASE,reference:EXPANDED_AUDIO_REVISION,files:EXPANDED_NEW_AUDIO.map(row=>row.file),from,to,
    report:{base:EXPANDED_BASE,reference:EXPANDED_AUDIO_REVISION,sourceManifestSha256:EXPANDED_SOURCE_MANIFEST_SHA256,bindingsSha256:EXPANDED_BINDINGS_SHA256,runtimeManifestSha256:EXPANDED_MANIFEST_SHA256,additionalUnits:19,replacedUnits:[],unchangedPreviouslyPublishedUnits:54,replacedAudioFiles:0,additionalAudioFiles:52,additionalRoutes:43,includedUnits:73,includedRoutes:176,currentAudioFiles:237,retiredAudioFiles:14,oldAudioAndRoutesPreserved:true}};
}

const RUNTIME_PATHS=['assets','audio','data','index.html'];
const HISTORICAL_GUARD_SHA256='3137a29dd5dc88dcbdbd7ba61ab6d771895d3a62b85ecd48d6a71d879a0f1b85';
const RC132_GUARD_SHA256='5dd916e86e1e24453fa490a3e1c6bc7514e3740de23478da9b7bdc7619daf65f';
function verifyCurrentRuntime(root, exec) {
  const committed=exec('git',['diff','--name-only','-z',EXPANDED_AUDIO_REVISION,'HEAD','--',...RUNTIME_PATHS]).split('\0').filter(Boolean);
  assert.deepEqual(committed,[],'Committed runtime differs from the exact reviewed-73 seed');
  const entries=exec('git',['ls-tree','-r','-z',EXPANDED_AUDIO_REVISION,'--',...RUNTIME_PATHS]).split('\0').filter(Boolean).map(line=>{
    const match=/^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(line);
    assert(match,'Malformed runtime Git tree entry');
    assert(match[2]==='blob'&&['100644','100755'].includes(match[1]),'Runtime seed contains a nonordinary path: '+match[4]);
    return{mode:match[1],object:match[3],file:match[4]};
  }).sort((a,b)=>a.file<b.file?-1:a.file>b.file?1:0);
  const expected=entries.map(row=>row.file);
  assert(expected.includes('index.html')&&expected.includes('assets/story-narration/v1/manifest.json'),'Runtime inventory omitted required anchors');
  assert.equal(new Set(expected).size,expected.length,'Runtime inventory contains duplicate paths');
  const actual=[];
  function walk(relative) {
    const full=path.join(root,relative);
    let stat;
    try{stat=fs.lstatSync(full);}catch(error){if(error.code==='ENOENT')return;throw error;}
    assert(!stat.isSymbolicLink(),'Current protected runtime contains a symlink: '+relative);
    if(stat.isDirectory())for(const name of fs.readdirSync(full))walk(relative+'/'+name);
    else{assert(stat.isFile(),'Current protected runtime is not an ordinary file: '+relative);actual.push(relative);}
  }
  for(const relative of RUNTIME_PATHS)walk(relative);
  assert.deepEqual(actual.sort(),expected,'Current runtime inventory differs from the exact seed (missing or untracked file)');
  const rows=entries.map(row=>{
    const filename=path.join(root,row.file),stat=fs.lstatSync(filename);
    const actualMode=stat.mode&0o111?'100755':'100644';
    assert.equal(actualMode,row.mode,'Current runtime file mode differs from seed: '+row.file);
    const expected=digest(cp.execFileSync('git',['show',EXPANDED_AUDIO_REVISION+':'+row.file],{cwd:root,maxBuffer:48*1024*1024}));
    const actual=digest(fs.readFileSync(filename));
    assert.equal(actual,expected,'Current runtime bytes differ from seed: '+row.file);
    return{file:row.file,mode:row.mode,expected,actual};
  });
  return{reference:EXPANDED_AUDIO_REVISION,protectedPaths:RUNTIME_PATHS,checkedFiles:rows.length,files:rows,committedAndWorkingTreeMatch:true};
}
function verify(root) {
  const exec=(cmd,args,cwd=root)=>cp.execFileSync(cmd,args,{cwd,encoding:'utf8',maxBuffer:48*1024*1024});
  const ensure=ref=>{if(cp.spawnSync('git',['cat-file','-e',ref+':index.html'],{cwd:root,stdio:'ignore'}).status!==0)exec('git',['fetch','--no-tags','--depth=1','origin',ref]);};
  const expanded=validateExpandedRevision(root,exec,ensure);
  const current=verifyCurrentRuntime(root,exec);
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hapil-narration73-baseline-')),baseline=path.join(directory,'baseline');
  let added=false;
  try {
    exec('git',['worktree','add','--detach',baseline,EXPANDED_BASE]);added=true;
    assert.equal(digest(fs.readFileSync(path.join(baseline,'tools/rc130-preservation.cjs'))),HISTORICAL_GUARD_SHA256,'Historical RC130 guard differs from exact 019a preimage');
    assert.equal(digest(fs.readFileSync(path.join(baseline,'tools/rc132-preservation.cjs'))),RC132_GUARD_SHA256,'Historical RC132 guard differs from exact 019a preimage');
    // Prove prior releases on the pinned detached tree after independently proving
    // every current runtime byte. The game under browser tests is never replaced.
    const historical=require(path.join(baseline,'tools/rc130-preservation.cjs')).verify(baseline);
    assert.equal(historical.report.status,'passed','Historical preservation proof did not pass');
    return{historical:historical.historical,report:{status:'passed',base:EXPANDED_BASE,reference:EXPANDED_AUDIO_REVISION,method:'Exact frozen narration delta, complete committed and current runtime inventory and byte proof, then unchanged historical RC132/RC131/RC130 preservation on a detached pinned baseline',files:current.files,protectedPaths:RUNTIME_PATHS,currentRuntimeProof:current,independentExpandedNarrationBatch:expanded.report,historicalProof:historical.report}};
  }finally{
    try{if(added)exec('git',['worktree','remove','--force',baseline]);}
    finally{fs.rmSync(directory,{recursive:true,force:true});}
  }
}
module.exports={verify,BASE:EXPANDED_BASE};
if(require.main===module)console.log('NARRATION73_PRESERVATION',JSON.stringify(verify(path.resolve(__dirname,'..')).report));
