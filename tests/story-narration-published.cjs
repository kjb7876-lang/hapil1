'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),base=new URL(process.env.HAPIL_PUBLIC_URL),revision=process.env.TESTED_COMMIT;
assert(/^https:$/.test(base.protocol)&&revision&&/^[a-f0-9]{40}$/.test(revision),'verified HTTPS destination and exact commit required');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),pause=ms=>new Promise(r=>setTimeout(r,ms));
const manifestPath='assets/story-narration/v1/manifest.json',manifestBytes=fs.readFileSync(path.join(root,manifestPath)),manifest=JSON.parse(manifestBytes),manifestURL=new URL(manifestPath,base);
async function request(url){const response=await fetch(url,{signal:AbortSignal.timeout(30000),cache:'no-store'});if(!response.ok)throw Error(`${response.status} ${url.pathname}`);return{bytes:Buffer.from(await response.arrayBuffer()),type:response.headers.get('content-type')||''}}
async function exact(url,expected){let last;for(let n=0;n<3;n++){try{const got=await request(url);assert.equal(hash(got.bytes),expected,`published bytes differ: ${url.pathname}`);return got}catch(e){last=e;if(n<2)await pause(2000)}}throw last}
(async()=>{
 const expectedIndex=hash(fs.readFileSync(path.join(root,'index.html'))),deadline=Date.now()+10*60*1000;let ready=false,last='';
 while(Date.now()<deadline){try{const indexURL=new URL('index.html',base);indexURL.searchParams.set('narration_revision',revision);const index=await request(indexURL);const url=new URL(manifestURL);url.searchParams.set('narration_revision',revision);const m=await request(url);if(hash(index.bytes)===expectedIndex&&hash(m.bytes)===hash(manifestBytes)){ready=true;break}last='deployment still serves a different revision'}catch(e){last=String(e)}await pause(10000)}
 assert(ready,`exact deployment did not become available: ${last}`);
 const rows=Object.entries(manifest.assets).map(([audio,row])=>({audio,sha256:row.sha256,bytes:row.bytes}));for(const row of Object.values(manifest.originals))rows.push(row);
 let cursor=0;const results=[];await Promise.all(Array.from({length:4},async()=>{while(cursor<rows.length){const row=rows[cursor++],url=new URL(row.audio,manifestURL);assert.equal(url.origin,base.origin);const got=await exact(url,row.sha256);if(row.bytes!=null)assert.equal(got.bytes.length,row.bytes);results.push({audio:row.audio,sha256:row.sha256,bytes:got.bytes.length})}}));
 assert.equal(results.length,rows.length);console.log(JSON.stringify({pass:true,testedCommit:revision,publicURL:base.href,includedUnits:manifest.coverage.includedUnits.length,verifiedNewAudioFiles:Object.keys(manifest.assets).length,originalsPreserved:2,totalVerifiedBytes:results.reduce((n,r)=>n+r.bytes,0)},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
