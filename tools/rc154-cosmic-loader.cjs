'use strict';
// Preserve the old loader contract while validating the newest exact chained
// entry point and the unchanged bundle output independently.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),blob=b=>crypto.createHash('sha1').update(Buffer.from('blob '+Buffer.byteLength(b)+'\0')).update(b).digest('hex');
function verify({html,bundle,extension15,extension16,extension17,extension18,extension19,extension20,extension21}){
 const legacy=/assets\/index-v31526\.js\?v=45001/;
 if(legacy.test(html)&&!html.includes('assets/rc153/combat-layout.js')&&!bundle.includes('__HAPIL_NATIVE_COMBAT_RC153__')){assert.match(html,legacy);return'historical-45001';}
 assert.equal(sha(extension15),'6c65e3e0de6d92fcb4aa94a8e3c20ef74db7a31a1cf1120f9d5372f7cc159974','fixed prior extension');
 assert.equal(sha(extension16),'c7d10f63b82a6d40126c49ba4b4f88016fbc7cc3fe65ae599d2f81aefcc34ff1','fixed layout extension');
 assert.equal(sha(extension17),'756aa754fef2ae3e6e786a7bd1f52e5df49bb1cd47d0f59b93489899602600ba','fixed Persona lifecycle extension');
 assert.equal(sha(extension18),'4280324566016df6f528c464237387b5bc7cce952807634680060e722c3e4415','fixed landscape camera extension');
 assert.equal(sha(extension19),'58d8c4487e8435394cb6e7753f6d8c20c0eed5b627f0a5b89cee2b0ad690177b','fixed all-profile pixel-envelope extension');
 assert.equal(sha(extension20),'6a56829b728ac365c0b11d2f105ee7b687583df22a27be0e362c579145c6386e','fixed portrait-pause and revival extension');
 assert.equal(sha(extension21),'0e21ee9822b9c946b2555873d27a4b041bfafd5175f9e5a201e5a0087d52297a','fixed EGO route and save extension');
 const prior=JSON.parse(extension15),layout=JSON.parse(extension16),persona=JSON.parse(extension17),camera=JSON.parse(extension18),envelope=JSON.parse(extension19),pause=JSON.parse(extension20),ego=JSON.parse(extension21);
 assert.equal(prior.base,'3e45b69e3e30b6363f0c8cc53d18bdae76491ced');assert.equal(layout.base,'8b24a22120d7787746339ed7c422eee149e04b22');assert.equal(layout.previousExtensionSha256,sha(extension15));assert.equal(persona.base,'e568bc400fa674908c50bef99236a2752ce9f18a');assert.equal(persona.previousExtensionSha256,sha(extension16));assert.equal(camera.base,'b9b0ea3bad7200e7cc1049ea8f5e712c386006e1');assert.equal(camera.previousExtensionSha256,sha(extension17));assert.equal(envelope.base,'71ba98e3f17f173e073b21e753b6e7d6ba81596f');assert.equal(envelope.previousExtensionSha256,sha(extension18));
 const previousHtml=persona.files.find(r=>r.file==='index.html'),cameraHtml=camera.files.find(r=>r.file==='index.html'),currentHtml=envelope.files.find(r=>r.file==='index.html'),previousBundle=persona.files.find(r=>r.file==='assets/index-v31526.js');assert(previousHtml?.after&&currentHtml?.before&&currentHtml?.after&&previousBundle?.after,'exact chained loader outputs');assert.equal(cameraHtml.before.gitBlob,previousHtml.after.gitBlob,'camera loader exact HTML preimage');assert.equal(currentHtml.before.gitBlob,cameraHtml.after.gitBlob,'pixel-envelope loader exact HTML preimage');
 const pauseHtml=pause.files.find(r=>r.file==='index.html'),pauseBundle=pause.files.find(r=>r.file==='assets/index-v31526.js');assert.equal(pause.base,'6bc749f3f274cdcfb7979aca0d22dc3698549543');assert.equal(pause.previousExtensionSha256,sha(extension19));assert.equal(pauseHtml?.before?.gitBlob,currentHtml.after.gitBlob,'portrait pause loader exact HTML preimage');assert.equal(pauseBundle?.before?.gitBlob,previousBundle.after.gitBlob,'portrait pause loader exact bundle preimage');
 const egoHtml=ego.files.find(r=>r.file==='index.html'),egoBundle=ego.files.find(r=>r.file==='assets/index-v31526.js');assert.equal(ego.base,'73a410daf5267fdf1ad2a9cdbaffd85afc407f09');assert.equal(ego.previousExtensionSha256,sha(extension20));assert.equal(egoHtml?.before?.gitBlob,pauseHtml.after.gitBlob,'EGO loader exact HTML preimage');assert.equal(egoBundle?.before?.gitBlob,pauseBundle.after.gitBlob,'EGO loader exact bundle preimage');
 for(const [file,text,row]of[['index.html',html,egoHtml],['assets/index-v31526.js',bundle,egoBundle]]){assert.equal(sha(text),row.after.sha256,'fixed output SHA-256 '+file);assert.equal(blob(text),row.after.gitBlob,'fixed output Git blob '+file);assert.equal(row.after.mode,'100644','fixed output mode '+file);}
 assert.equal((html.match(/assets\/index-v31526\.js\?v=\d+/g)||[]).length,1,'one bundle loader');assert.match(html,/assets\/index-v31526\.js\?v=15504/);assert.match(html,/assets\/rc155\/ego-guardian\.js\?v=15501/);assert.match(html,/assets\/rc153\/combat-layout\.js\?v=15508/);assert.match(html,/assets\/rc125\/adaptive-battlefield\.css\?v=45403/);return'exact-chained-RC155+RC152+EGO';
}
module.exports={verify};
