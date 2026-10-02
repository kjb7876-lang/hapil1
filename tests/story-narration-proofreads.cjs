'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),{corrections}=require('../data/rc57/narrative-proofreads-20261002.json'),{applyNarrativeProofreads:apply}=require('../tools/narrative-proofreads.cjs'),c={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data/story-rc51.js'),'utf8'),c);const data=c.window.__HAPIL_STORY_DATA_RC51__;
assert.equal(corrections.length,25);assert.equal(data.proofreadingRevision.changedCards,22);assert.equal(data.proofreadingRevision.lexicalOrGrammaticalCards,8);
for(const row of corrections){const [zone,phase]=row.sourceId.split('.'),r=data.records.find(r=>r.zone===zone);assert(r[phase].includes(row.newSentence),row.correctionId+' missing corrected sentence');assert(!r[phase].includes(row.oldSentence),row.correctionId+' stale sentence');assert(data.raw.includes(row.newSentence),row.correctionId+' raw/journal source');}
assert.equal(apply(data.raw),data.raw,'proofreading pass is idempotent');
assert(data.records.find(r=>r.zone==='cult04').post.includes('자유의지뿐이었다고,'),'ambiguous author phrasing is preserved apart from approved spacing');
const originals=JSON.parse(fs.readFileSync(path.join(root,'data/opening-voice-rc74.json'),'utf8'));assert.equal(JSON.stringify(data.openingVoice),JSON.stringify(originals));
console.log(JSON.stringify({pass:true,conservativeCorrections:25,cards:22,spokenWordingCards:8,originalsPreserved:true},null,2));
