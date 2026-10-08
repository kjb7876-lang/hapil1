'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { checkedUrl } = require('../qa/rc133/public-url.cjs');
const root = path.resolve(__dirname, '..');
const delta = JSON.parse(fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-delta.json')));
const extensionBytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extensionBytes).digest('hex'),'20fb3ec5485ee26ee34cdc77b5dca73a58a08cf52c5a3259c44f7800ffb08b82','exact extension manifest pin');
const extension = JSON.parse(extensionBytes);
const extension2Bytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension-2.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extension2Bytes).digest('hex'),'917d061a8a533c914d123aab980ae7c5a5c7266342cdd6d3e0e48505b9e1bc6f','exact second extension manifest pin');
const extension2 = JSON.parse(extension2Bytes);
const extension3Bytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension-3.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extension3Bytes).digest('hex'),'cba933bc3b3692a2d1c155826f177d4d31d14d903a69221785345b7017ce4976','exact third extension manifest pin');
const extension3=JSON.parse(extension3Bytes);
const extension4Bytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension-4.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extension4Bytes).digest('hex'),'2dbd0fc8914afca21b25a01062cc0ffbc94594b10d8b0a98b2322dd5b07ddb4a','exact fourth extension manifest pin');
const extension4=JSON.parse(extension4Bytes);
const extension5Bytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension-5.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extension5Bytes).digest('hex'),'b3070d19c90ac7df0eba62ab7520c32142561c92b79a3b3bc2438487462fa5ed','exact fifth extension manifest pin');
const extension5=JSON.parse(extension5Bytes);
const extension6Bytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension-6.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extension6Bytes).digest('hex'),'7698992cb90cc1480985a9e7c61c6543c239934f3be9eb6b0a5163df6b0c5413','exact sixth extension manifest pin');
const extension6=JSON.parse(extension6Bytes);
const extension7Bytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension-7.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extension7Bytes).digest('hex'),'894d0da81edf4e88348f9ec436f44ce75928126a2e2095e3dcf878235faf8fe2','exact seventh extension manifest pin');
const extension7=JSON.parse(extension7Bytes);
const extension8Bytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension-8.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extension8Bytes).digest('hex'),'73a01f3e7598ae69bb199ef208a433437851fa479bdf03615cbbc9e028b5d660','exact eighth extension manifest pin');
const extension8=JSON.parse(extension8Bytes);
const extension9Bytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension-9.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extension9Bytes).digest('hex'),'64d2e3896ea9f448e76adb18ace5ca1e04867e7bd194808cdc253ed70f5b42d6','exact ninth extension manifest pin');
const extension9=JSON.parse(extension9Bytes);
const extension10Bytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension-10.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extension10Bytes).digest('hex'),'c069e870f5a6f3e2dd77c35ec461ad7f42400591c9d7411fb3e2db75ffbae2d2','exact tenth extension manifest pin');
const extension10=JSON.parse(extension10Bytes);
const extension11Bytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension-11.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extension11Bytes).digest('hex'),'46c9ea04641aaee8b56bd75302bd36855b4f2ac376962aa84646f22c14e0ede1','exact eleventh extension manifest pin');
const extension11=JSON.parse(extension11Bytes);
assert.equal(extension2.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extensionBytes).digest('hex'));
assert.equal(extension2.files.length,1);assert.equal(extension2.files[0].file,'index.html');
assert.equal(extension2.files[0].before.gitBlob,extension.files.find(row=>row.file==='index.html')?.after?.gitBlob,'second index path chains from the first extension output');
assert.equal(extension3.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension2Bytes).digest('hex'));
assert.equal(extension3.files.find(row=>row.file==='index.html')?.before.gitBlob,extension2.files[0].after.gitBlob,'third index path chains from the second extension output');
assert.equal(extension4.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension3Bytes).digest('hex'));
assert.equal(extension4.files.find(row=>row.file==='index.html')?.before.gitBlob,extension3.files.find(row=>row.file==='index.html')?.after.gitBlob,'fourth index path chains from the third extension output');
assert.equal(extension5.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension4Bytes).digest('hex'));
assert.equal(extension5.files.find(row=>row.file==='index.html')?.before.gitBlob,extension4.files.find(row=>row.file==='index.html')?.after.gitBlob,'fifth index path chains from the fourth extension output');
assert.equal(extension6.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension5Bytes).digest('hex'));
assert.equal(extension6.files.find(row=>row.file==='index.html')?.before.gitBlob,extension5.files.find(row=>row.file==='index.html')?.after.gitBlob,'sixth index path chains from the fifth extension output');
assert.equal(extension7.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension6Bytes).digest('hex'));
// This unit also runs from shallow CI checkouts. The full preservation proof
// resolves the pinned base tree; here, pin the unchanged mobile preimage and
// chain the index preimage from the prior exact extension without Git history.
assert.deepEqual(extension7.files.map(row=>row.file),['assets/hapil-mobile-v31406.js','assets/index-v31526.js']);
assert.equal(extension7.files[0].before.gitBlob,'8b52a5d18776febf246bef1f058cade145f6ab4b');
assert.equal(extension7.files[1].before.gitBlob,extension6.files.find(row=>row.file==='assets/index-v31526.js')?.after?.gitBlob);
assert.equal(extension8.base,'98e27c4e25f639989f3d41034a915567e9a31f4e');
assert.equal(extension8.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension7Bytes).digest('hex'));
assert.deepEqual(extension8.files.map(row=>row.file),[
  'assets/combat-v31412/outgoing-native.js','assets/index-v31526.js','assets/rc108/portrait-split.js',
  'assets/rc128/combat-feedback.js','assets/rc132/dream-balance.js','assets/rc133/inner-final.js',
  'assets/rc137/awakening-portraits.js','assets/rc150/awakening-impact.js','assets/rc86/samong-cosmic.js',
  'assets/rc88/danmaku-rpg.js','assets/rc91/samong-awakening.js','index.html']);
assert.equal(extension8.files.find(row=>row.file==='assets/index-v31526.js').before.gitBlob,extension7.files.find(row=>row.file==='assets/index-v31526.js')?.after?.gitBlob);
assert.equal(extension8.files.find(row=>row.file==='assets/rc150/awakening-impact.js').before,null);
assert.equal(extension9.base,'8fbfa8f6983c70129e6deaadfd74c9e620483386');
assert.equal(extension9.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension8Bytes).digest('hex'));
assert.deepEqual(extension9.files.map(row=>row.file),[
  'assets/actors/v31511/balrog-raised-body.png','assets/actors/v31511/balrog-raised-sword.png',
  'assets/combat-v31402/projectile-pipeline.js','assets/index-v31526.js','assets/rc108/hud.css',
  'assets/rc133/inner-final.js','assets/rc25/raid.js','index.html']);
assert.equal(extension9.files.find(row=>row.file==='assets/index-v31526.js').before.gitBlob,extension8.files.find(row=>row.file==='assets/index-v31526.js')?.after?.gitBlob);
assert.equal(extension10.base,'16fec1ca6cd6b4939dbb8a98a11b9ab62a0b2ef8');
assert.equal(extension10.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension9Bytes).digest('hex'));
assert.deepEqual(extension10.files.map(row=>row.file),['assets/rc133/native-install.js.txt']);
assert.equal(extension10.files[0].before.gitBlob,'ae897939667c5241adfa1ed6f97368954769671a');

assert.equal(extension11.base,'a7a6990271d046f05531f389184df99e397e1f5f');
assert.equal(extension11.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension10Bytes).digest('hex'));
assert.deepEqual(extension11.files.map(row=>row.file),['assets/rc133/inner-final.js']);
assert.equal(extension11.files[0].before.gitBlob,'a157d2dd28b4d165503b5843ed6c50b2086ecdf5');
const extension12Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-12.json')),extension12=JSON.parse(extension12Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension12Bytes).digest('hex'),'b80f0b96ac1de271a95e4eaf43153b9da3e70ca02f72ad55b5946eeb809c79f3');assert.equal(extension12.base,'b02bc568f1faf66c4bf02e0a51f16e7dff67d197');assert.equal(extension12.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension11Bytes).digest('hex'));assert.equal(extension12.files.find(r=>r.file===extension11.files[0].file).before.gitBlob,extension11.files[0].after.gitBlob);
const extension13Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-13.json')),extension13=JSON.parse(extension13Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension13Bytes).digest('hex'),'0d5f6268c360515eff35a98977776ee7e9f2c3139e1b7d7a69040ea8375c8192');assert.equal(extension13.base,'3ca4874fb8e387ecc3922117922c08d7f7d541d4');assert.equal(extension13.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension12Bytes).digest('hex'));assert.deepEqual(extension13.files.map(row=>row.file),['assets/index-v31526.js','index.html']);
const extension14Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-14.json')),extension14=JSON.parse(extension14Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension14Bytes).digest('hex'),'ccc65824c5e7be74c5d94d373e13b7de905015b2b581ab2037e3e8088b65fc89');assert.equal(extension14.base,'c7bc9e7d97c4b961987049c656fe624b463e0a58');assert.equal(extension14.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension13Bytes).digest('hex'));
assert.equal(extension14.files.find(r=>r.file===extension10.files[0].file).before.gitBlob,extension10.files[0].after.gitBlob,'fourteenth native installation starts at exact tenth output');
const extension15Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-15.json')),extension15=JSON.parse(extension15Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension15Bytes).digest('hex'),'6c65e3e0de6d92fcb4aa94a8e3c20ef74db7a31a1cf1120f9d5372f7cc159974');assert.equal(extension15.base,'3e45b69e3e30b6363f0c8cc53d18bdae76491ced');assert.equal(extension15.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension14Bytes).digest('hex'));
const extension16Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-16.json')),extension16=JSON.parse(extension16Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension16Bytes).digest('hex'),'c7d10f63b82a6d40126c49ba4b4f88016fbc7cc3fe65ae599d2f81aefcc34ff1');assert.equal(extension16.base,'8b24a22120d7787746339ed7c422eee149e04b22');assert.equal(extension16.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension15Bytes).digest('hex'));
const extension17Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-17.json')),extension17=JSON.parse(extension17Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension17Bytes).digest('hex'),'756aa754fef2ae3e6e786a7bd1f52e5df49bb1cd47d0f59b93489899602600ba');assert.equal(extension17.base,'e568bc400fa674908c50bef99236a2752ce9f18a');assert.equal(extension17.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension16Bytes).digest('hex'));
const extension18Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-18.json')),extension18=JSON.parse(extension18Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension18Bytes).digest('hex'),'4280324566016df6f528c464237387b5bc7cce952807634680060e722c3e4415');assert.equal(extension18.base,'b9b0ea3bad7200e7cc1049ea8f5e712c386006e1');assert.equal(extension18.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension17Bytes).digest('hex'));assert.deepEqual(extension18.files.map(row=>row.file),['assets/rc153/combat-layout.js','index.html']);
const extension19Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-19.json')),extension19=JSON.parse(extension19Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension19Bytes).digest('hex'),'58d8c4487e8435394cb6e7753f6d8c20c0eed5b627f0a5b89cee2b0ad690177b');assert.equal(extension19.base,'71ba98e3f17f173e073b21e753b6e7d6ba81596f');assert.equal(extension19.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension18Bytes).digest('hex'));assert.deepEqual(extension19.files.map(row=>row.file),['assets/rc153/combat-layout.js','index.html']);
const extension20Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-20.json')),extension20=JSON.parse(extension20Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension20Bytes).digest('hex'),'6a56829b728ac365c0b11d2f105ee7b687583df22a27be0e362c579145c6386e');assert.equal(extension20.base,'6bc749f3f274cdcfb7979aca0d22dc3698549543');assert.equal(extension20.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension19Bytes).digest('hex'));assert.deepEqual(extension20.files.map(row=>row.file),['assets/index-v31526.js','assets/rc125/adaptive-battlefield.css','assets/rc153/combat-layout.js','assets/rc91/samong-awakening.js','index.html']);
const extension21Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-21.json')),extension21=JSON.parse(extension21Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension21Bytes).digest('hex'),'0e21ee9822b9c946b2555873d27a4b041bfafd5175f9e5a201e5a0087d52297a');assert.equal(extension21.base,'73a410daf5267fdf1ad2a9cdbaffd85afc407f09');assert.equal(extension21.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension20Bytes).digest('hex'));assert.deepEqual(extension21.files.map(row=>row.file),['assets/index-v31526.js','assets/rc133/inner-final.js','assets/rc133/native-install.js.txt','assets/rc155/ego-guardian.js','index.html']);
const extension22Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-22.json')),extension22=JSON.parse(extension22Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension22Bytes).digest('hex'),'c13cd630d60c3472143090095c40de3fbfa0756fa410e1af5aa1c083d8ad75a6');assert.equal(extension22.base,'8cf7704375a028ec947abc5431d9e72c1c3b2f68');assert.equal(extension22.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension21Bytes).digest('hex'));
const extension23Bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-23.json')),extension23=JSON.parse(extension23Bytes);assert.equal(require('node:crypto').createHash('sha256').update(extension23Bytes).digest('hex'),'f8d1ee758f530d24616a55614bd9c1c094ff5b7483161872c3db3181b818896f');assert.equal(extension23.base,'3ba8183dc9a8534049759b8e943475d9b8a96d46');assert.equal(extension23.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension22Bytes).digest('hex'));
for(const [index,extension]of [extension12,extension13,extension14,extension15,extension16,extension17,extension18,extension19,extension20,extension21,extension22,extension23].entries())for(const row of extension.files){const later=[extension12,extension13,extension14,extension15,extension16,extension17,extension18,extension19,extension20,extension21,extension22,extension23].slice(index+1).flatMap(e=>e.files).find(r=>r.file===row.file);if(later)assert.equal(later.before.gitBlob,row.after.gitBlob,'exact later preimage '+row.file);else assert.equal(row.after.sha256,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,row.file))).digest('hex'),'exact latest bytes '+row.file);}
let checks = 0;
const key = 'rc133-verify';
const value = 'exact sha #1?&= / 한글';

function verify(file) {
  const url = checkedUrl(file, key, value);
  assert.equal(url.origin, 'https://kjb7876-lang.github.io');
  assert.equal(decodeURIComponent(url.pathname), '/hapil1/' + file);
  assert.equal(url.hash, '');
  assert.deepEqual([...url.searchParams], [[key, value]]);
  assert.equal(new URL(url.href).href, url.href);
  checks += 5;
  return url;
}

const runtimeFiles=new Set(delta.files.map(row=>row.after.file));for(const row of extension.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}for(const row of extension2.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}for(const row of extension3.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}for(const row of extension4.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}for(const row of extension5.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}for(const row of extension6.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension7.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension8.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension9.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension10.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension11.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension12.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension13.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
assert.equal(runtimeFiles.size,293,'the chained exact runtime set contains 293 unique files through the thirteenth extension'); checks++;
for(const row of extension15.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension16.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension17.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension18.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension19.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension20.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension21.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension22.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for(const row of extension23.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for (const file of runtimeFiles) verify(file);
const reserved = verify('audio/rc133/originals/Ancient_demon_awaken_#1-1791000066648.wav');
assert(reserved.pathname.includes('%23')); checks++;
const spaced = verify('audio/rc133/originals/Clockwork Ticks (1)(1).mp3');
assert(spaced.pathname.includes('%20')); checks++;
verify('audio/literal?query#fragment%25 한글.wav');
for (const file of ['', '/index.html', '../index.html', 'assets/../index.html', 'assets//file.png', 'assets/./file.png', 'assets\\file.png', 'https://other.example/file.png']) {
  assert.throws(() => checkedUrl(file, key, value), undefined, file); checks++;
}
// Exercise the exact public plan without any network or browser substitution.
const cp=require('node:child_process'),planDir=fs.mkdtempSync('/tmp/rc133-manifest-unit-');
try{const commit=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),result=cp.spawnSync(process.execPath,['qa/rc133/published.cjs','--manifest-only'],{cwd:root,encoding:'utf8',timeout:30000,env:{...process.env,EXPECTED_SHA:commit,GITHUB_SHA:commit,HAPIL_QA_OUTPUT:planDir}});assert.equal(result.status,0,result.stderr);const plan=JSON.parse(fs.readFileSync(path.join(planDir,'summary.json')));assert.equal(plan.status,'manifest-passed');assert.equal(plan.expectedFiles,309);assert.equal(plan.manifestFiles.length,309);assert.equal(new Set(plan.manifestFiles).size,309);assert.deepEqual(plan.readiness,[]);assert.deepEqual(plan.files,[]);assert.deepEqual(plan.profiles,[]);for(const file of ['assets/rc108/hud.css','assets/rc125/adaptive-battlefield.css','assets/rc155/ego-guardian.js'])assert(plan.manifestFiles.includes(file));checks+=11;}finally{fs.rmSync(planDir,{recursive:true,force:true});}
console.log('RC133_PUBLIC_URL_UNIT', JSON.stringify({status:'passed', checks, authorizedFiles:runtimeFiles.size, historicalFiles:delta.files.length, extensionFiles:extension.files.length, extension2Files:extension2.files.length, extension3Files:extension3.files.length, extension4Files:extension4.files.length, extension5Files:extension5.files.length, extension6Files:extension6.files.length, extension7Files:extension7.files.length, extension8Files:extension8.files.length, extension9Files:extension9.files.length, extension10Files:extension10.files.length, extension11Files:extension11.files.length, extension12Files:extension12.files.length, extension13Files:extension13.files.length, originalNamesEncoded:true, fixedOriginAndRoot:true}));
