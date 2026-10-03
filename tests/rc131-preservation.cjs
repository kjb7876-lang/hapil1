'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),BASE='a4d4a73e5b551dd7bae2ec896294cd93cdef8402',git=(...args)=>cp.execFileSync('git',args,{cwd:root,maxBuffer:32*1024*1024});
if(cp.spawnSync('git',['cat-file','-e',BASE+':index.html'],{cwd:root,stdio:'ignore'}).status!==0)git('fetch','--no-tags','--depth=1','origin',BASE);
const files=['index.html','assets/index-v31526.js','assets/rc23/feedback.js','assets/rc128/combat-feedback.js','assets/combat-audio/v1/native-bridge.js','tools/rc130-preservation.cjs'];
const protect=['assets/rc77','assets/rc127','assets/rc129','assets/rc130','assets/rc91','assets/rc95','assets/rc43','assets/combat-v31412','assets/story-narration','assets/rc49','assets/rc51','data','assets/combat-audio/v1/audio','assets/combat-audio/v1/controller.js','assets/combat-audio/v1/catalog.js'];
assert.equal(git('diff','--name-only',BASE,'HEAD','--',...protect).toString().trim(),'','Unrelated gameplay, source narration and previous audio must not change');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'rc131-proof-')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
try{for(const f of files){const p=path.join(tmp,f);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,git('show',BASE+':'+f));}
 cp.execFileSync(process.execPath,[path.join(root,'tools/rc131-integration.cjs'),tmp],{cwd:root});
 for(const f of files)assert.equal(hash(fs.readFileSync(path.join(root,f))),hash(fs.readFileSync(path.join(tmp,f))),'Exact minimal integration: '+f);
 console.log('RC131_PRESERVATION_RESULT',JSON.stringify({status:'passed',baseline:BASE,reproducedFiles:files.length,protectedPaths:protect.length,method:'Reapply anchored audio-only changes to the fixed latest-main baseline and compare full bytes; no runtime is replaced during browser tests'}));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
