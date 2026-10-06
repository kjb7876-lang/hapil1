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
assert.equal(extension2.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extensionBytes).digest('hex'));
assert.equal(extension2.files.length,1);assert.equal(extension2.files[0].file,'index.html');
assert.equal(extension2.files[0].before.gitBlob,extension.files.find(row=>row.file==='index.html')?.after?.gitBlob,'second index path chains from the first extension output');
assert.equal(extension3.previousExtensionSha256,require('node:crypto').createHash('sha256').update(extension2Bytes).digest('hex'));
assert.equal(extension3.files.find(row=>row.file==='index.html')?.before.gitBlob,extension2.files[0].after.gitBlob,'third index path chains from the second extension output');
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

const runtimeFiles=new Set(delta.files.map(row=>row.after.file));for(const row of extension.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}for(const row of extension2.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}for(const row of extension3.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for (const file of runtimeFiles) verify(file);
const reserved = verify('audio/rc133/originals/Ancient_demon_awaken_#1-1791000066648.wav');
assert(reserved.pathname.includes('%23')); checks++;
const spaced = verify('audio/rc133/originals/Clockwork Ticks (1)(1).mp3');
assert(spaced.pathname.includes('%20')); checks++;
verify('audio/literal?query#fragment%25 한글.wav');
for (const file of ['', '/index.html', '../index.html', 'assets/../index.html', 'assets//file.png', 'assets/./file.png', 'assets\\file.png', 'https://other.example/file.png']) {
  assert.throws(() => checkedUrl(file, key, value), undefined, file); checks++;
}
console.log('RC133_PUBLIC_URL_UNIT', JSON.stringify({status:'passed', checks, authorizedFiles:runtimeFiles.size, historicalFiles:delta.files.length, extensionFiles:extension.files.length, extension2Files:extension2.files.length, extension3Files:extension3.files.length, originalNamesEncoded:true, fixedOriginAndRoot:true}));
