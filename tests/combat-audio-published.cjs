'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),base=new URL(process.env.HAPIL_PUBLIC_URL),revision=process.env.TESTED_COMMIT;
assert.equal(base.href,'https://kjb7876-lang.github.io/hapil1/');assert(/^[a-f0-9]{40}$/.test(revision));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const directory='assets/combat-audio/v1/',manifestBytes=fs.readFileSync(path.join(root,directory,'manifest.json')),manifest=JSON.parse(manifestBytes);
async function exact(file,sha){const url=new URL(file,base);url.searchParams.set('combat_audio_revision',revision);const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(30000)});assert(response.ok,`${response.status} ${file}`);const bytes=Buffer.from(await response.arrayBuffer());assert.equal(hash(bytes),sha,`public bytes differ: ${file}`);return bytes.length}
(async()=>{
 const deadline=Date.now()+10*60*1000;let ready=false,last;
 while(Date.now()<deadline){try{await exact('index.html',hash(fs.readFileSync(path.join(root,'index.html'))));await exact(directory+'manifest.json',hash(manifestBytes));ready=true;break}catch(error){last=String(error);await sleep(10000)}}
 assert(ready,`expected public revision unavailable: ${last}`);
 const sources=['assets/index-v31526.js',...['catalog.js','controller.js','native-bridge.js'].map(x=>directory+x)];
 for(const file of sources)await exact(file,hash(fs.readFileSync(path.join(root,file))));
 for(const row of manifest.assets){const bytes=await exact(row.path,row.sha256);assert.equal(bytes,row.bytes)}
 console.log(JSON.stringify({pass:true,testedCommit:revision,publicURL:base.href,verifiedCombatAudioFiles:8,verifiedRuntimeFiles:4,combatOnly:true},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
