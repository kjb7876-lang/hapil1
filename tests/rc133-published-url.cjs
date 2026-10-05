'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { checkedUrl } = require('../qa/rc133/public-url.cjs');
const root = path.resolve(__dirname, '..');
const delta = JSON.parse(fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-delta.json')));
const extensionBytes = fs.readFileSync(path.join(root, 'qa/rc133/authorized-runtime-extension.json'));
assert.equal(require('node:crypto').createHash('sha256').update(extensionBytes).digest('hex'),'f7c31f998479f8ff46eda6f560142827c3adbb220e7297c3f206de0b4718ad15','exact extension manifest pin');
const extension = JSON.parse(extensionBytes);
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

const runtimeFiles=new Set(delta.files.map(row=>row.after.file));for(const row of extension.files){if(row.after===null)runtimeFiles.delete(row.file);else runtimeFiles.add(row.file);}
for (const file of runtimeFiles) verify(file);
const reserved = verify('audio/rc133/originals/Ancient_demon_awaken_#1-1791000066648.wav');
assert(reserved.pathname.includes('%23')); checks++;
const spaced = verify('audio/rc133/originals/Clockwork Ticks (1)(1).mp3');
assert(spaced.pathname.includes('%20')); checks++;
verify('audio/literal?query#fragment%25 한글.wav');
for (const file of ['', '/index.html', '../index.html', 'assets/../index.html', 'assets//file.png', 'assets/./file.png', 'assets\\file.png', 'https://other.example/file.png']) {
  assert.throws(() => checkedUrl(file, key, value), undefined, file); checks++;
}
console.log('RC133_PUBLIC_URL_UNIT', JSON.stringify({status:'passed', checks, authorizedFiles:runtimeFiles.size, historicalFiles:delta.files.length, extensionFiles:extension.files.length, originalNamesEncoded:true, fixedOriginAndRoot:true}));
