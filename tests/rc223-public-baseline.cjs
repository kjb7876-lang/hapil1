'use strict';
// Independent post-publication byte check, intended for the normal GitHub runner.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),root=path.resolve(__dirname,'..');
const sha='199402a0ece0747d2d354e8881e4a77910fb2423',bytes=fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-147.json'));
assert.equal(hash(bytes),'f3a0e8f84194033748be278288a5149d521acd1005e1093c27f6770132578d73','published extension147 remains immutable');
const manifest=JSON.parse(bytes),report={sha,status:'running',startedAt:new Date().toISOString(),scope:'HTTP200 and exact hashes of every published extension147 file; no browser or Internet co-op claim',files:[],failures:[]};
const out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc223-public-baseline';fs.mkdirSync(out,{recursive:true});
(async()=>{try{
  assert.equal(manifest.files.length,13);
  for(const row of manifest.files){
    const url=new URL(row.file,'https://kjb7876-lang.github.io/hapil1/');url.searchParams.set('rc223-baseline',sha);
    const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(30000)});
    assert.equal(response.status,200,row.file+' HTTP status');
    const body=Buffer.from(await response.arrayBuffer()),actual=hash(body),expected=row.after.sha256;
    report.files.push({file:row.file,status:response.status,bytes:body.length,expected,actual,match:actual===expected});
    assert.equal(actual,expected,'published exact199402a file '+row.file);
  }
  report.status='passed';
}catch(error){report.status='failed';report.failures.push(String(error.stack||error));process.exitCode=1;}
finally{report.endedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log('RC223_PUBLIC_BASELINE '+JSON.stringify(report));}})();
