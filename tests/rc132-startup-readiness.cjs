'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('index.html'),storyDataScript=html.match(/<script\b[^>]*\bsrc="([^"]*data\/story-rc51\.js\?[^\"]*)"[^>]*><\/script>/),storyRuntimeTag=html.indexOf('assets/rc51/story.js'),policyTag=html.indexOf('foundation-v31400/policy.js?v=2026100601'),partyTag=html.indexOf('hapil-party-v31408.js');
assert(storyDataScript&&new URL(storyDataScript[1],'https://hapil.invalid/').pathname==='/data/story-rc51.js'&&new URL(storyDataScript[1],'https://hapil.invalid/').searchParams.has('v'),'the canonical story data path is active with a cache key');
assert(html.indexOf(storyDataScript[0])<storyRuntimeTag,'cache-busted story data loads before its runtime');
const approvedStoryHash=JSON.parse(read('qa/rc129/manifest.json')).preservedNarrationRuntime['data/story-rc51.js'];
assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'data/story-rc51.js'))).digest('hex'),approvedStoryHash,'active story source bytes match the approved source hash');
assert(policyTag>=0&&policyTag<partyTag,'cache-busted policy loads before its consumer');
const smoke=read('qa/rc130/public-smoke.cjs'),published=read('qa/rc132/published.cjs');
assert.match(smoke,/data\/story-rc51\.js','assets\/foundation-v31400\/policy\.js/,'the public byte audit includes both startup dependencies');
assert.match(smoke,/page\.on\('requestfailed'/,'the public QA records failed requests separately from HTTP error responses');
assert.match(smoke,/Startup dependencies missing:/,'the public QA reports missing globals before attempting the new-game flow');
assert.match(published,/const files=\['data\/story-rc51\.js','assets\/foundation-v31400\/policy\.js','index\.html'/,'RC132 preserves startup dependency coverage while adding RC132 assets');
for(const file of ['tests/rc48-story-voice-smoke.cjs','tests/rc51-story-and-samong-smoke.cjs']){const source=read(file);assert(source.includes('activeStoryScript'),`${file} inspects the active story data tag`);assert(source.includes("searchParams.has('v')"),`${file} verifies a cache key is present`);assert(source.includes("preservedNarrationRuntime['data/story-rc51.js']"),`${file} checks the approved story source hash`);}
console.log(JSON.stringify({status:'passed',checks:14}));
