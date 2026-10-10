'use strict';
// Exact crop-update delta proof against the preserved uploaded-image commit.
// Full chained historical proof remains mandatory in the existing release suite.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...a)=>cp.execFileSync('git',['--no-replace-objects',...a],{cwd:root,encoding:'utf8',maxBuffer:32e6});let checks=0;
const eq=(a,b,m)=>{checks++;assert.deepEqual(a,b,m);},throws=(f,m)=>{checks++;assert.throws(f,undefined,m);};
const bytes=fs.readFileSync(root+'/qa/rc133/authorized-runtime-extension-44.json'),manifest=JSON.parse(bytes),priorBytes=fs.readFileSync(root+'/qa/rc133/authorized-runtime-extension-43.json'),prior=JSON.parse(priorBytes),historical42=fs.readFileSync(root+'/qa/rc133/authorized-runtime-extension-42.json');
eq(hash(historical42),'98821e6adb19b1bdb598283d1215042b040ab261a9c31999b9e2c80942dd9abb','forty-second historical extension remains immutable');
eq(hash(priorBytes),'1fba3ad5dffec988987e8180327dd22f44cedfde4a5542f09cfaddf7c664a945','forty-third historical extension remains immutable');
eq(hash(bytes),'811b8aec1b0b338d3c4f60ee4eeec736f0b7f52d30890af2ee577a1c07e05607','forty-fourth exact extension digest');
eq(manifest.previousExtensionSha256,hash(priorBytes),'exact prior manifest');
eq(manifest.base,'53abbb573d928f5a7f0473e0a086dec29b12288b','exact candidate before retry fix');
eq(git('rev-parse',manifest.base+'^{tree}').trim(),manifest.baseTree,'exact base tree');
eq(manifest.files.map(r=>r.file),['assets/rc155/ego-art.js','index.html'],'only runtime code and its cache key change');
const shape=rows=>rows.map(({file,mode,gitBlob})=>({file,mode,gitBlob})).sort((a,b)=>a.file.localeCompare(b.file));
const before=git('ls-tree','-r','-z',manifest.base,'--',...manifest.protectedRoots).split('\0').filter(Boolean).map(s=>{const m=/^(\d+) blob (\w+)\t(.+)$/.exec(s);return{file:m[3],mode:m[1],gitBlob:m[2]};});
eq(hash(Buffer.from(JSON.stringify(shape(before)))),prior.targetProtectedRowsSha256,'entire base equals previous exact output');
function validate(input){
 assert.equal(hash(Buffer.from(JSON.stringify(shape(before)))),prior.targetProtectedRowsSha256);
 const target=new Map(before.map(r=>[r.file,r]));
 for(const row of input.files){if(row.before===null)assert.equal(target.has(row.file),false,'new output is absent from exact preimage');else assert.deepEqual(row.before,target.get(row.file));const actual=fs.readFileSync(path.join(root,row.file));assert.equal(row.after.sha256,hash(actual));assert.equal(row.after.gitBlob,git('hash-object',row.file).trim());assert.equal(row.after.mode,fs.statSync(path.join(root,row.file)).mode&0o111?'100755':'100644');target.set(row.file,row.after);}
 assert.equal(input.targetProtectedRowsSha256,hash(Buffer.from(JSON.stringify(shape([...target.values()])))));
 return require('../tools/rc133-preservation.cjs').verifyFiles(root,[...target.values()]);
}
const proof=validate(manifest);checks++;
for(const property of ['gitBlob','mode']){const changed=structuredClone(manifest);changed.files[0].before[property]=property==='mode'?'100755':'0'.repeat(40);throws(()=>validate(changed),'tampered exact preimage '+property);}
for(const property of ['sha256','gitBlob','mode']){const changed=structuredClone(manifest);changed.files[0].after[property]=property==='mode'?'100755':'0'.repeat(property==='sha256'?64:40);throws(()=>validate(changed),'tampered exact output '+property);}
const changed=structuredClone(manifest);changed.targetProtectedRowsSha256='0'.repeat(64);throws(()=>validate(changed),'whole-tree output cannot be relaxed');
console.log('RC156_ANATOMY_PRESERVATION_UNIT',JSON.stringify({status:'passed',checks,...proof,extension:44,historicalFullProof:false}));
