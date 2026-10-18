'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {verifyFiles}=require('../tools/rc133-preservation.cjs');const root=fs.mkdtempSync(path.join(os.tmpdir(),'rc133-guard-negative-'));let checks=0;
const blob=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const values={'index.html':'reviewed loader\n','assets/unchanged.js':'untouched source\n','assets/rc133/authorized.js':'exact authorized delta\n','audio/owned.ogg':'approved media bytes','data/story.js':'preserved text'};
const expected=Object.entries(values).map(([file,text])=>({file,mode:'100644',gitBlob:blob(Buffer.from(text))}));
function reset(){for(const p of fs.readdirSync(root))fs.rmSync(path.join(root,p),{recursive:true,force:true});for(const [file,text]of Object.entries(values)){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),text);fs.chmodSync(path.join(root,file),0o644);}}
function deny(name,edit){reset();edit();assert.throws(()=>verifyFiles(root,expected),undefined,name);checks++;}
try{
 reset();assert.equal(verifyFiles(root,expected).checkedFiles,5);checks++;
 deny('unapproved old-byte edit',()=>fs.appendFileSync(path.join(root,'assets/unchanged.js'),'mutation'));
 deny('approved path does not permit arbitrary output bytes',()=>fs.appendFileSync(path.join(root,'assets/rc133/authorized.js'),'mutation'));
 deny('missing protected file',()=>fs.unlinkSync(path.join(root,'data/story.js')));
 deny('untracked file in new namespace',()=>fs.writeFileSync(path.join(root,'assets/rc133/extra.js'),'new'));
 deny('extra empty directory',()=>fs.mkdirSync(path.join(root,'assets/extra')));
 deny('mode change',()=>fs.chmodSync(path.join(root,'audio/owned.ogg'),0o755));
 deny('symlink replacement',()=>{fs.unlinkSync(path.join(root,'assets/unchanged.js'));fs.symlinkSync('../index.html',path.join(root,'assets/unchanged.js'));});
 deny('loader modification',()=>fs.appendFileSync(path.join(root,'index.html'),'script'));
 const compatibility=require('../tools/rc133-release-compatibility.cjs');
 for(const [file,[before,after]]of Object.entries(compatibility.revisions)){assert.equal(compatibility.validate(file,before,after),before);checks++;assert.throws(()=>compatibility.validate(file,'0'.repeat(64),after));checks++;assert.throws(()=>compatibility.validate(file,before,'0'.repeat(64)));checks++;}
 assert.throws(()=>compatibility.validate('assets/rc133/arbitrary.js','0'.repeat(64),'0'.repeat(64)));checks++;
 const repo=path.resolve(__dirname,'..');
 const required=require('../tools/rc133-preservation.cjs').REQUIRED_BASES;
 const manifestBases=['authorized-runtime-delta.json',...Array.from({length:155},(_,i)=>'authorized-runtime-extension'+(i?'-'+(i+1):'')+'.json')].map(file=>JSON.parse(fs.readFileSync(path.join(repo,'qa/rc133',file),'utf8')).base);
 assert.deepEqual([...required],manifestBases,'Every pinned base must be fetched on a shallow CI checkout');checks++;
 assert(Object.isFrozen(required));checks++;
 assert.equal(new Set(required).size,156);checks++;
 const migration=require('../tools/rc133-preservation.cjs').verify(repo).report;
 for(const file of Object.keys(compatibility.revisions)){
  const chain=compatibility.verifyRuntimeOutputChain(repo,migration,file),current=crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,file))).digest('hex');
  assert.equal(chain.currentOutput,current,'Exact compatibility output chain: '+file);checks++;
 }
 const historical=compatibility.revisions['index.html'][1],indexChain=compatibility.verifyRuntimeOutputChain(repo,migration,'index.html');
 assert.equal(indexChain.historicalOutput,historical,'Exact historical index output remains pinned');checks++;
 assert.equal(indexChain.extensionOutput,indexChain.currentOutput,'Current index output must match its exact approved extension');checks++;
 assert.throws(()=>compatibility.verifyRuntimeOutputChain(repo,migration,'index.html',Buffer.concat([fs.readFileSync(path.join(repo,'index.html')),Buffer.from('\nunauthorized')])));checks++;
 const brokenLink=structuredClone(migration);brokenLink.approvedExtension.find(row=>row.file==='index.html').before.gitBlob='0'.repeat(40);
 assert.throws(()=>compatibility.verifyRuntimeOutputChain(repo,brokenLink,'index.html'));checks++;
 const brokenHistorical=structuredClone(migration);brokenHistorical.approvedDelta.find(row=>row.file==='index.html').after.sha256='0'.repeat(64);
 assert.throws(()=>compatibility.verifyRuntimeOutputChain(repo,brokenHistorical,'index.html'));checks++;
 const latest=structuredClone(migration);latest.approvedExtension155.find(row=>row.file==='index.html').before.gitBlob='0'.repeat(40);
 assert.throws(()=>compatibility.verifyRuntimeOutputChain(repo,latest,'index.html'),'latest extension cannot start at arbitrary prior bytes');checks++;
 const latestBytes=structuredClone(migration);latestBytes.approvedExtension155.find(row=>row.file==='index.html').after.sha256='0'.repeat(64);
 assert.throws(()=>compatibility.verifyRuntimeOutputChain(repo,latestBytes,'index.html'),'latest extension cannot authorize arbitrary output bytes');checks++;
 const latestMode=structuredClone(migration);latestMode.approvedExtension155.find(row=>row.file==='index.html').after.mode='100755';
 assert.throws(()=>compatibility.verifyRuntimeOutputChain(repo,latestMode,'index.html'),'latest extension retains exact output mode');checks++;
 const missingLatest=structuredClone(migration);delete missingLatest.approvedExtension155;
 assert.throws(()=>compatibility.verifyRuntimeOutputChain(repo,missingLatest,'index.html'),'omitting the latest extension cannot fall back to accepting current bytes');checks++;
 console.log('RC133_PRESERVATION_UNIT',JSON.stringify({status:'passed',checks,scope:'Exact working inventory/bytes/modes and negative cases; detached full baseline proof is a separate exact-commit check'}));
}finally{fs.rmSync(root,{recursive:true,force:true});}
