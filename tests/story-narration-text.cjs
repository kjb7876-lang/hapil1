'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),{replaceNarrativeEllipses:replace}=require('../tools/replace-narrative-ellipsis.cjs');
assert.equal(replace('무아지경... 그러했다... 몸은 기억하고 있었다.'),'무아지경 그러하였다. 그러했다 그러하였다. 몸은 기억하고 있었다.');
assert.equal(replace('적의 모습으로...!'),'적의 모습으로 그러하였다.');
assert.equal(replace('앞…\n\n뒤'),'앞 그러하였다.\n\n뒤');
assert.equal(replace('그곳에는 ...'),'그곳에는 그러하였다.');
assert.equal(replace('원문 1.5와 1.2는 그대로.\n 띄어쓰기  유지'),'원문 1.5와 1.2는 그대로.\n 띄어쓰기  유지');
const c={window:{}};vm.runInNewContext(read('data/story-rc51.js'),c);const data=c.window.__HAPIL_STORY_DATA_RC51__,originals=JSON.parse(read('data/opening-voice-rc74.json'));
assert.equal(data.narrationTextRevision.phrase,'그러하였다.');assert(!/\.{3,}|…/.test(data.raw));assert.equal(replace(data.raw),data.raw,'migration is idempotent');
for(const r of data.records){for(const p of r.paragraphs)assert(!/\.{3,}|…/.test(p),`${r.zone} journal paragraph`);for(const phase of ['pre','post','firstPost','awakenPre'])if(r.zone!=='dist00'&&r[phase])assert(!/\.{3,}|…/.test(r[phase]),`${r.zone}.${phase}`)}
const first=data.records.find(r=>r.zone==='dist00');for(const [phase,key] of [['pre','opening'],['post','root']])assert.equal(first[phase],originals[key].title+'\n\n'+originals[key].paragraphs.join('\n\n'));
assert.equal(JSON.stringify(data.openingVoice),JSON.stringify(originals),'original1/2 transcripts remain exact');
assert.equal(read('data/rc57/voice-monologue-renumbered.txt'),data.raw,'renumbered export matches current canonical raw');
assert(!/\.{3,}|…/.test(read('data/rc57/voice-monologue-map-cards.txt')),'card export migrated');
const originalBytes=fs.readFileSync(path.join(root,data.sourceFile));assert.equal(originalBytes.length,data.sourceBytes);assert.equal(crypto.createHash('sha256').update(originalBytes).digest('hex'),data.sourceSha256,'immutable uploaded source provenance remains intact');
assert.equal(crypto.createHash('sha256').update(data.raw).digest('hex'),data.canonicalTextSha256);
console.log(JSON.stringify({pass:true,phrase:'그러하였다.',liveOccurrencesReplaced:data.narrationTextRevision.occurrences,affectedCards:data.narrationTextRevision.changedCards,affectedParagraphs:data.narrationTextRevision.changedParagraphs,originalUploadAndVoicesPreserved:true},null,2));
