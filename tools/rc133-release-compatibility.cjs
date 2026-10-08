'use strict';
// Six exact historical revisions used by the older RC128 promotion gate.
// The full RC133 runtime guard runs first and pins each path's complete output
// chain (the original delta, plus its exact extension output when applicable).
// This compatibility projection never changes the game under test.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const BASE='4670211fcd1a2e5076a3f9c57fc67e55cd0486a9';
const DELTA='47e45218eea38f09453ddaa5b2f8639e9a5d9e0f1c0a332c4382a5fa6dd27b11';
const revisions=Object.freeze({
 'assets/rc128/combat-feedback.js':['64277031f08373305f9a4a0e168ad4032024174857085524b4866d194d1dfbd3','9cfd267a78919957d6fd13d7a69c8b96cbb00c769e78615e1d8325678c1c313a'],
 'assets/rc91/samong-awakening.js':['e10f8ca145914fe517cbf88012b73a74a5db6c57e8bab5334993c12bb97e9f79','a277787a2f8917a26f21dbb49dc51802cb9faf176b0c3889726be761842a4b65'],
 'assets/combat-v31402/combat-core.js':['c718770947023a573a9b57cbefcb319940cd434029592fda51bf8d94f7822ece','c2962da4b5491182da367c2153646312c333aed4f37344866882c47502b4478f'],
 'tests/rc91-samong-and-laser-smoke.cjs':['ad819358cc886f273abc508d41b4ea8fd17eae14a0364716e77e10c9322e3ddd','71e2efdd149267bd24ba89c5f2d77602420eb612c646d27ce539a9e2805694e3'],
 'assets/rc128/awakening-policy.js':['00c65c9b0d3e60cb1c481f95c60fdca48f0690eb8788d37273b2d28c2eb99c7e','8e3a23fee4c99b275410bde10c7b0f3901f0967dbbd24257d216da65d1ecbce7'],
 'index.html':['c26193527a73f0b952f10296d8333f565188f3db048954736cbfbb25eae53a42','e230b8398a42868a836f1772d4a40a6288d21d43b6de6d9bd351f915cfbaf652']
});
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function validate(file,before,after){const row=revisions[file];assert(row,'Unapproved RC128 compatibility path');assert.equal(before,row[0],'RC128 compatibility preimage');assert.equal(after,row[1],'RC128 compatibility exact output');return before;}
function gitBlob(bytes){return crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');}
function verifyRuntimeOutputChain(root,report,file,currentBytes=fs.readFileSync(path.join(root,file))){
 const old=report.approvedDelta.find(row=>row.file===file);
 const expectedHistorical=revisions[file]?.[1];assert(expectedHistorical,'Unapproved RC128 compatibility path');
 const currentHash=digest(currentBytes),extension=report.approvedExtension?.find(row=>row.file===file),extension2=report.approvedExtension2?.find(row=>row.file===file),extension3=report.approvedExtension3?.find(row=>row.file===file),extension4=report.approvedExtension4?.find(row=>row.file===file),extension5=report.approvedExtension5?.find(row=>row.file===file),extension6=report.approvedExtension6?.find(row=>row.file===file),extension7=report.approvedExtension7?.find(row=>row.file===file),extension8=report.approvedExtension8?.find(row=>row.file===file),extension9=report.approvedExtension9?.find(row=>row.file===file),extension10=report.approvedExtension10?.find(row=>row.file===file),extension11=report.approvedExtension11?.find(row=>row.file===file),extension12=report.approvedExtension12?.find(row=>row.file===file),extension13=report.approvedExtension13?.find(row=>row.file===file),extension14=report.approvedExtension14?.find(row=>row.file===file),extension15=report.approvedExtension15?.find(row=>row.file===file),extension16=report.approvedExtension16?.find(row=>row.file===file),extension17=report.approvedExtension17?.find(row=>row.file===file),extension18=report.approvedExtension18?.find(row=>row.file===file),extension19=report.approvedExtension19?.find(row=>row.file===file),extension20=report.approvedExtension20?.find(row=>row.file===file),extension21=report.approvedExtension21?.find(row=>row.file===file),extension22=report.approvedExtension22?.find(row=>row.file===file),extension23=report.approvedExtension23?.find(row=>row.file===file),extension24=report.approvedExtension24?.find(row=>row.file===file);
 // The old RC128 smoke-test source lives outside the protected runtime roots,
 // so its exact bytes remain checked directly by the independent revision pin.
 if(!old){assert(!extension&&!extension2&&!extension3&&!extension4&&!extension5&&!extension6&&!extension7&&!extension8&&!extension9&&!extension10&&!extension11&&!extension12&&!extension13&&!extension14&&!extension15&&!extension16&&!extension17&&!extension18&&!extension19&&!extension20&&!extension21&&!extension22&&!extension23&&!extension24,'Runtime extension cannot authorize an unprotected compatibility fixture');assert.equal(currentHash,expectedHistorical,'Exact compatibility fixture output');return {historicalOutput:expectedHistorical,currentOutput:currentHash,extensionOutput:null};}
 assert.equal(old.after.sha256,expectedHistorical,'Historical compatibility output pin');
 if(extension){
  assert(extension.after,'Compatibility path removed by runtime extension');
  assert.deepEqual({file:extension.before?.file,mode:extension.before?.mode,gitBlob:extension.before?.gitBlob},{file,mode:old.after.mode,gitBlob:old.after.gitBlob},'Runtime extension must start at exact historical output');
  assert.equal(extension.after.file,file,'Runtime extension output path');
  let extensionOutput=extension.after.sha256;
  if(extension2){
   assert(extension2.after,'Compatibility path removed by second runtime extension');
   assert.deepEqual({file:extension2.before?.file,mode:extension2.before?.mode,gitBlob:extension2.before?.gitBlob},{file,mode:extension.after.mode,gitBlob:extension.after.gitBlob},'Second runtime extension must start at exact first extension output');
   assert.equal(extension2.after.file,file,'Second runtime extension output path');extensionOutput=extension2.after.sha256;
  }
  if(extension3){
   assert(extension3.after,'Compatibility path removed by third runtime extension');
   const preceding=extension2?.after??extension.after;
   assert.deepEqual({file:extension3.before?.file,mode:extension3.before?.mode,gitBlob:extension3.before?.gitBlob},{file,mode:preceding.mode,gitBlob:preceding.gitBlob},'Third runtime extension must start at exact preceding output');
   assert.equal(extension3.after.file,file,'Third runtime extension output path');extensionOutput=extension3.after.sha256;
  }
  if(extension4){
   assert(extension4.after,'Compatibility path removed by fourth runtime extension');
   const preceding=extension3?.after??extension2?.after??extension.after;
   assert.deepEqual({file:extension4.before?.file,mode:extension4.before?.mode,gitBlob:extension4.before?.gitBlob},{file,mode:preceding.mode,gitBlob:preceding.gitBlob},'Fourth runtime extension must start at exact preceding output');
   assert.equal(extension4.after.file,file,'Fourth runtime extension output path');extensionOutput=extension4.after.sha256;
  }
  if(extension5){
   assert(extension5.after,'Compatibility path removed by fifth runtime extension');
   const preceding=extension4?.after??extension3?.after??extension2?.after??extension.after;
   assert.deepEqual({file:extension5.before?.file,mode:extension5.before?.mode,gitBlob:extension5.before?.gitBlob},{file,mode:preceding.mode,gitBlob:preceding.gitBlob},'Fifth runtime extension must start at exact preceding output');
   assert.equal(extension5.after.file,file,'Fifth runtime extension output path');extensionOutput=extension5.after.sha256;
  }
  if(extension6){
   assert(extension6.after,'Compatibility path removed by sixth runtime extension');
   const preceding=extension5?.after??extension4?.after??extension3?.after??extension2?.after??extension.after;
   assert.deepEqual({file:extension6.before?.file,mode:extension6.before?.mode,gitBlob:extension6.before?.gitBlob},{file,mode:preceding.mode,gitBlob:preceding.gitBlob},'Sixth runtime extension must start at exact preceding output');
   assert.equal(extension6.after.file,file,'Sixth runtime extension output path');extensionOutput=extension6.after.sha256;
  }
  if(extension7){
   assert(extension7.after,'Compatibility path removed by seventh runtime extension');
   const preceding=extension6?.after??extension5?.after??extension4?.after??extension3?.after??extension2?.after??extension.after;
   assert.deepEqual({file:extension7.before?.file,mode:extension7.before?.mode,gitBlob:extension7.before?.gitBlob},{file,mode:preceding.mode,gitBlob:preceding.gitBlob},'Seventh runtime extension must start at exact preceding output');
   assert.equal(extension7.after.file,file,'Seventh runtime extension output path');extensionOutput=extension7.after.sha256;
  }
  if(extension8){
   assert(extension8.after,'Compatibility path removed by eighth runtime extension');
   const preceding=extension7?.after??extension6?.after??extension5?.after??extension4?.after??extension3?.after??extension2?.after??extension.after;
   assert.deepEqual({file:extension8.before?.file,mode:extension8.before?.mode,gitBlob:extension8.before?.gitBlob},{file,mode:preceding.mode,gitBlob:preceding.gitBlob},'Eighth runtime extension must start at exact preceding output');
   assert.equal(extension8.after.file,file,'Eighth runtime extension output path');extensionOutput=extension8.after.sha256;
  }
  if(extension9){
   assert(extension9.after,'Compatibility path removed by ninth runtime extension');
   const preceding=extension8?.after??extension7?.after??extension6?.after??extension5?.after??extension4?.after??extension3?.after??extension2?.after??extension.after;
   assert.deepEqual({file:extension9.before?.file,mode:extension9.before?.mode,gitBlob:extension9.before?.gitBlob},{file,mode:preceding.mode,gitBlob:preceding.gitBlob},'Ninth runtime extension must start at exact preceding output');
   assert.equal(extension9.after.file,file,'Ninth runtime extension output path');extensionOutput=extension9.after.sha256;
  }
  let row=extension9||extension8||extension7||extension6||extension5||extension4||extension3||extension2||extension;
  for(const number of [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]){const next=report['approvedExtension'+number]?.find(r=>r.file===file);if(!next)continue;assert(next.after,'Compatibility path removed by runtime extension '+number);assert.deepEqual({file:next.before?.file,mode:next.before?.mode,gitBlob:next.before?.gitBlob},{file,mode:row.after.mode,gitBlob:row.after.gitBlob},'Exact preceding extension output '+number);assert.equal(next.after.file,file);row=next;extensionOutput=next.after.sha256;}
  assert.equal(extensionOutput,currentHash,'Current runtime bytes differ from exact authorized extension chain output');
  assert.equal(row.after.gitBlob,gitBlob(currentBytes),'Current runtime Git blob differs from exact authorized extension chain output');
  const stat=fs.statSync(path.join(root,file));assert.equal(row.after.mode,stat.mode&0o111?'100755':'100644','Current runtime mode differs from exact authorized extension chain output');
  return {historicalOutput:old.after.sha256,currentOutput:currentHash,extensionOutput};
 }
 assert(!extension2&&!extension3&&!extension4&&!extension5&&!extension6&&!extension7&&!extension8&&!extension9&&!extension10&&!extension11&&!extension12&&!extension13&&!extension14&&!extension15&&!extension16&&!extension17&&!extension18&&!extension19&&!extension20&&!extension21&&!extension22&&!extension23&&!extension24,'Later runtime extension cannot apply without its first output');
 assert.equal(currentHash,old.after.sha256,'Current runtime bytes differ from exact historical output');
 return {historicalOutput:old.after.sha256,currentOutput:currentHash,extensionOutput:null};
}
function verify(root,migration,file,expected){
 const r=migration.report;assert.equal(r.status,'passed');assert.equal(r.base,BASE);assert.equal(r.deltaSha256,DELTA);assert.equal(r.currentRuntimeProof?.workingTreeMatches,true);assert.equal(r.currentRuntimeProof?.committedTreeMatches,true);
 const baseDigest=digest(cp.execFileSync('git',['--no-replace-objects','show',BASE+':'+file],{cwd:root}));
 // The accepted RC128 index/feedback include historical projections. Pin
 // both immutable approved baseline bytes and their final authorized outputs.
 // Runtime tests still use every current byte, with no loader substitutions.
 if(file==='index.html')assert.equal(baseDigest,'0d5269e770deb660b675edb77fb9e67c9d8688e87fcb3e0eec65f5a12b6d0fbb','Exact approved loader preimage');
 if(file==='assets/rc128/combat-feedback.js')assert.equal(baseDigest,'5a086c4a1c3c904ab3a6642f6302485aa40ce69e0b615d871fe9d87b79c60e33','Exact approved feedback preimage');
 const before=['index.html','assets/rc128/combat-feedback.js'].includes(file)?revisions[file][0]:baseDigest;
 assert.equal(expected,revisions[file]?.[0]);
 const chain=verifyRuntimeOutputChain(root,r,file);
 return validate(file,before,chain.historicalOutput);
}
module.exports={supports:file=>Object.hasOwn(revisions,file),validate,verify,verifyRuntimeOutputChain,revisions};
