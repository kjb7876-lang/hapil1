'use strict';
// Keep the historical loader expectation. A later loader is accepted only by
// the independently pinned, chained HTML and bundle outputs, never by a range.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),blob=b=>crypto.createHash('sha1').update(Buffer.from('blob '+Buffer.byteLength(b)+'\0')).update(b).digest('hex');
function verify({html,bundle,extension15,extension16}){
 const legacy=/assets\/index-v31526\.js\?v=45001/;
 if(legacy.test(html)&&!html.includes('assets/rc153/combat-layout.js')&&!bundle.includes('__HAPIL_NATIVE_COMBAT_RC153__')){assert.match(html,legacy);return'historical-45001';}
 assert.equal(sha(extension15),'6c65e3e0de6d92fcb4aa94a8e3c20ef74db7a31a1cf1120f9d5372f7cc159974','fixed prior extension');
 assert.equal(sha(extension16),'c7d10f63b82a6d40126c49ba4b4f88016fbc7cc3fe65ae599d2f81aefcc34ff1','fixed layout extension');
 const prior=JSON.parse(extension15),current=JSON.parse(extension16);assert.equal(prior.base,'3e45b69e3e30b6363f0c8cc53d18bdae76491ced');assert.equal(current.base,'8b24a22120d7787746339ed7c422eee149e04b22');assert.equal(current.previousExtensionSha256,sha(extension15));
 for(const [file,text]of[['index.html',html],['assets/index-v31526.js',bundle]]){const a=prior.files.find(r=>r.file===file),b=current.files.find(r=>r.file===file);assert(a?.after&&b?.before&&b?.after,'both exact chained outputs '+file);assert.equal(b.before.gitBlob,a.after.gitBlob,'fixed preimage '+file);assert.equal(sha(text),b.after.sha256,'fixed output SHA-256 '+file);assert.equal(blob(text),b.after.gitBlob,'fixed output Git blob '+file);assert.equal(b.after.mode,'100644','fixed output mode '+file);}
 assert.equal((html.match(/assets\/index-v31526\.js\?v=\d+/g)||[]).length,1,'one bundle loader');assert.match(html,/assets\/index-v31526\.js\?v=45403/);return'exact-chained-RC154';
}
module.exports={verify};
