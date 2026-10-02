'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),file=path.join(root,'assets/story-narration/v1/manifest.json'),base=path.dirname(file),manifest=JSON.parse(fs.readFileSync(file,'utf8')),read=p=>fs.readFileSync(path.join(root,p)),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
assert.equal(manifest.version,1);assert.equal(hash(read('data/story-rc51.js')),manifest.sourceSha256,'canonical source changed: regenerate the affected audio before release');
const c={window:{}};vm.runInNewContext(read('data/story-rc51.js').toString(),c);const data=c.window.__HAPIL_STORY_DATA_RC51__,expected={},texts=new Map(),remember=text=>{if(text){texts.set(hash(text),text);for(const part of text.split(/\n\s*\n/))texts.set(hash(part),part)}};
for(const r of data.records){for(const p of r.paragraphs)remember(p);for(const phase of ['pre','post','firstPost','awakenPre'])if(r[phase]){remember(r[phase]);if(r.zone!=='dist00')expected[`${r.zone}:${phase}`]=r[phase]}}
const originals=data.openingVoice,records=[{zone:'hub',entry:'',body:Object.values(originals).map(v=>[v.title,...v.paragraphs].join('\n\n')).join('\n\n')},...data.records.map(r=>({...r,entry:r.paragraphs[0]||'',body:r.paragraphs.slice(1).join('\n\n')}))];
for(const r of records)for(const tab of ['all','entry','body']){const text=tab==='all'?[r.entry,r.body].filter(Boolean).join('\n\n'):r[tab];if(text)expected[`journal:${r.zone}:${tab}`]=text}
const html=read('index.html').toString(),stanza=cls=>html.match(new RegExp('<p class="'+cls+'">([\\s\\S]*?)</p>'))[1].replace(/<br\s*\/?>/g,'\n');
expected['prologue:quote']=[stanza('mongse-christian-opening__passing'),stanza('mongse-christian-opening__awakening')].join('\n\n');
const bundle=read('assets/index-v31526.js').toString(),death=bundle.slice(bundle.indexOf('function HAPIL_showDeathVerseRC59('),bundle.indexOf('\n(function HAPIL_installEpisode1DeathAndMidbossDuoRC59'));
const literal=name=>death.match(new RegExp(name+"\\.textContent='([^']*)'"))[1];expected['death:verse']=['title','verse1','verse2'].map(literal).join('\n\n');
const title=read('assets/hapil-title-v31342.js').toString();expected['ending:title']=title.match(/const values = phase==='ending-title'[^?]+\? \['[^']*','[^']*','([^']*)'\]/)[1];
for(const text of Object.values(expected))remember(text);
const originalText={};for(const [key,row] of Object.entries(originals)){const id=key==='opening'?'dist00.pre':'dist00.post';originalText[id]=row.paragraphs.join('\n\n');remember(originalText[id]);const entry=manifest.originals[id],resolved=path.resolve(base,entry.audio);assert.equal(resolved,path.resolve(root,row.audio));assert.equal(hash(fs.readFileSync(resolved)),entry.sha256,'original recording bytes changed')}
for(const [file,sha] of Object.entries(manifest.immutable||{}))assert.equal(hash(read(file)),sha,`immutable original contract changed: ${file}`);
assert.equal(Object.keys(expected).length,297);assert.deepEqual(Object.keys(manifest.scenes).sort(),Object.keys(expected).sort(),'complete live narration route coverage');
for(const [name,row] of Object.entries(manifest.assets)){assert(/^audio\/[A-Za-z0-9._-]+\.mp3$/.test(name),`unsafe path ${name}`);const b=fs.readFileSync(path.join(base,name));assert.equal(b.length,row.bytes);assert.equal(hash(b),row.sha256);assert(row.duration>0&&Number.isFinite(row.duration));assert.equal(row.codec,'mp3');assert.equal(row.bitRate,128000);assert.equal(row.sampleRate,24000);assert.equal(row.channels,1);assert(texts.has(row.textSha256),`audio text outside live canon: ${name}`)}
const plain=x=>x.replace(/\s+/g,'');
for(const [key,text] of Object.entries(expected)){
 const row=manifest.scenes[key];assert.equal(row.textSha256,hash(text),`exact text mismatch: ${key}`);const spoken=[];
 for(const clip of row.clips||[row]){
  if(clip.legacy){const original=Object.entries(manifest.originals).find(([,x])=>x.audio===clip.audio);assert(original);spoken.push(originalText[original[0]]);continue}
  const asset=manifest.assets[clip.audio];assert(asset,`untracked asset: ${key}`);assert.equal(clip.sha256,asset.sha256);assert.equal(clip.duration,asset.duration);spoken.push(texts.get(asset.textSha256));
 }
 let expectedWords=text;if(key.startsWith('journal:hub:'))for(const voice of Object.values(originals))expectedWords=expectedWords.replace(voice.title,'');
 assert.equal(plain(spoken.join('')),plain(expectedWords),`playlist order/content differs: ${key}`);
}
console.log(JSON.stringify({pass:true,routes:297,newCombatCards:110,journalTabs:184,supplementalSurfaces:3,audioFiles:Object.keys(manifest.assets).length,originalsUnchanged:2,totalAudioBytes:Object.values(manifest.assets).reduce((n,x)=>n+x.bytes,0)},null,2));
