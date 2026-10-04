'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(process.env.HAPIL_RC134_ROOT||path.join(__dirname,'../..')),sha='d15a148241afecfe94ebf37e3e3d830e383531fa',base='https://kjb7876-lang.github.io/hapil1/',output=path.join(process.env.HAPIL_QA_OUTPUT||'/tmp/rc136-public-bytes','public-bytes.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sha);assert.equal(cp.execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),'');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-delta.json')));
const paths=[...new Set(['index.html','qa/rc133/authorized-runtime-delta.json','qa/rc134/persona-art-processing.json',...manifest.files.filter(r=>r.after).map(r=>r.file)])].filter(f=>fs.existsSync(path.join(root,f)));
const report={commit:sha,base,status:'running',scope:'Exact public bytes for all present authorized runtime delta files, index, and delta manifest; main canonical CI separately checks preserved original narration/combat audio',files:[],readiness:[]};
const save=()=>fs.writeFileSync(output,JSON.stringify(report,null,2));fs.mkdirSync(path.dirname(output),{recursive:true});
async function checked(f){const expected=fs.readFileSync(path.join(root,f)),expectedHash=hash(expected);let last;
 for(let attempt=1;attempt<=6;attempt++){try{const url=new URL(f.split('/').map(encodeURIComponent).join('/'),base);url.searchParams.set('rc136-bytes',sha+'-'+Date.now()+'-'+attempt);const r=await fetch(url,{cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(25000)}),b=Buffer.from(await r.arrayBuffer());last={file:f,httpStatus:r.status,bytes:b.length,expectedBytes:expected.length,sha256:hash(b),expectedSha256:expectedHash,attempt};if(r.status===200&&last.sha256===expectedHash&&b.length===expected.length)return{...last,status:'passed'};}catch(e){last={file:f,attempt,error:String(e)}}if(attempt<6)await new Promise(r=>setTimeout(r,3000));}
 return{...last,status:'failed'};
}
(async()=>{const expected=hash(fs.readFileSync(path.join(root,'index.html'))),deadline=Date.now()+300000;
 while(Date.now()<deadline){const row=await checked('index.html');report.readiness.push(row);save();if(row.status==='passed')break;await new Promise(r=>setTimeout(r,5000));}
 assert(report.readiness.at(-1)?.status==='passed','exact public index readiness');
 let next=0;await Promise.all(Array.from({length:8},async()=>{while(next<paths.length){const f=paths[next++],row=await checked(f);report.files.push(row);save();}}));
 assert.equal(report.files.length,paths.length);assert(report.files.every(r=>r.status==='passed'),'every authorized published file matches exact candidate');report.status='passed';report.completedAt=new Date().toISOString();save();console.log(JSON.stringify({status:report.status,commit:sha,files:report.files.length,bytes:report.files.reduce((s,r)=>s+r.bytes,0)}));
})().catch(e=>{report.status='failed';report.error=String(e.stack||e);save();console.error(e);process.exitCode=1;});
